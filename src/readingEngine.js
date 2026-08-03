import { getReadingFromMeaningArchive } from './readingMeanings.js';

export function normalizeReadingQuestion(question) {
  return String(question || '').replace(/\s+/g, ' ').trim();
}

function normalizeKeywords(keywords) {
  return Array.from(
    new Set(
      (Array.isArray(keywords) ? keywords : [])
        .map((keyword) => String(keyword || '').trim())
        .filter(Boolean),
    ),
  ).slice(0, 4);
}

function getPosition(spread, index, t) {
  const position = spread?.positions?.[index];
  return {
    title: position?.title || t('drawing.spreadLabelFallback', { index: index + 1 }),
    subtitle: position?.subtitle || '',
  };
}

function buildCardSection({ card, index, spread, question, language, t, meaningArchive, getFallbackReading, getKeywords }) {
  const position = getPosition(spread, index, t);
  const keywords = normalizeKeywords(getKeywords?.(card) || []);
  const keywordText = keywords.join(t('common.listSeparator')) || card.name;
  const fallbackReading = String(getFallbackReading?.(card) || '').trim();
  const baseMeaning = getReadingFromMeaningArchive(
    card,
    Boolean(card?.isReversed),
    language,
    meaningArchive,
    fallbackReading,
  );

  return {
    cardId: card?.id,
    cardName: card?.name || '',
    englishName: card?.englishName || '',
    orientation: card?.isReversed ? 'reversed' : 'upright',
    positionIndex: index + 1,
    positionTitle: position.title,
    positionSubtitle: position.subtitle,
    keywords,
    baseMeaning,
    positionResponsibility: position.subtitle
      ? t('reading.positionResponsibility', { position: position.title, subtitle: position.subtitle })
      : t('reading.positionResponsibilityNoSubtitle', { position: position.title }),
    orientationMeaning: t(card?.isReversed ? 'reading.orientationReversed' : 'reading.orientationUpright', {
      card: card?.name || '',
      keywords: keywordText,
    }),
    contextualMeaning: t('reading.contextualMeaning', {
      question,
      position: position.title,
      meaning: baseMeaning,
    }),
    attention: t('reading.attention', {
      position: position.title,
      keywords: keywordText,
    }),
    boundary: t('reading.boundary'),
  };
}

function getRepeatedTheme(cardSections) {
  const occurrences = new Map();

  cardSections.forEach((section) => {
    section.keywords.forEach((keyword) => {
      const key = keyword.toLocaleLowerCase();
      const current = occurrences.get(key) || { keyword, positions: [] };
      current.positions.push(section.positionTitle);
      occurrences.set(key, current);
    });
  });

  return Array.from(occurrences.values())
    .filter((entry) => entry.positions.length > 1)
    .sort((left, right) => right.positions.length - left.positions.length)[0] || null;
}

function buildRelationship(cardSections, t) {
  const reversedCount = cardSections.filter((section) => section.orientation === 'reversed').length;
  const repeatedTheme = getRepeatedTheme(cardSections);
  const firstPosition = cardSections[0]?.positionTitle || '';
  const lastPosition = cardSections.at(-1)?.positionTitle || '';
  let themeSentence;

  if (repeatedTheme) {
    themeSentence = t('reading.relationshipRepeated', {
      theme: repeatedTheme.keyword,
      positions: repeatedTheme.positions.join(' · '),
    });
  } else {
    themeSentence = t('reading.relationshipMixed');
  }

  const orientationSentence = reversedCount > cardSections.length / 2
    ? t('reading.relationshipReversed')
    : t('reading.relationshipUpright');
  const flowSentence = t('reading.relationshipFlow', { firstPosition, lastPosition });

  return [themeSentence, orientationSentence, flowSentence].filter(Boolean).join(' ');
}

function buildAdvice(cardSections, t) {
  if (cardSections.length === 0) return [];
  const first = cardSections[0];
  const middle = cardSections[Math.floor(cardSections.length / 2)];
  const last = cardSections.at(-1);

  return [
    t('reading.adviceVerify', {
      position: first.positionTitle,
      theme: first.keywords[0] || first.cardName,
    }),
    t('reading.adviceBoundary', {
      position: middle.positionTitle,
      theme: middle.keywords[0] || middle.cardName,
    }),
    t('reading.adviceStep', {
      position: last.positionTitle,
      theme: last.keywords[0] || last.cardName,
    }),
  ];
}

function buildChoiceComparison(cardSections, choiceOptions, t) {
  if (cardSections.length < 5) return null;
  const optionA = String(choiceOptions?.choiceA || '').trim() || t('drawing.choiceOptionAFallback');
  const optionB = String(choiceOptions?.choiceB || '').trim() || t('drawing.choiceOptionBFallback');
  const [aCurrent, bCurrent, aDevelopment, bDevelopment, self] = cardSections;
  const aAdvantageTheme = aCurrent.keywords[0] || aCurrent.cardName;
  const bAdvantageTheme = bCurrent.keywords[0] || bCurrent.cardName;
  const aRiskTheme = aDevelopment.keywords[0] || aDevelopment.cardName;
  const bRiskTheme = bDevelopment.keywords[0] || bDevelopment.cardName;
  const concernTheme = self.keywords[0] || self.cardName;

  return {
    optionA: {
      label: optionA,
      current: aCurrent,
      development: aDevelopment,
      advantage: t('reading.choiceAdvantage', { label: optionA, theme: aAdvantageTheme }),
      risk: t('reading.choiceRisk', { label: optionA, theme: aRiskTheme }),
    },
    optionB: {
      label: optionB,
      current: bCurrent,
      development: bDevelopment,
      advantage: t('reading.choiceAdvantage', { label: optionB, theme: bAdvantageTheme }),
      risk: t('reading.choiceRisk', { label: optionB, theme: bRiskTheme }),
    },
    self: {
      ...self,
      concern: t('reading.choiceConcern', { theme: concernTheme }),
    },
  };
}

export function buildStructuredReading({
  cards = [],
  question = '',
  spread,
  language,
  t,
  meaningArchive,
  getFallbackReading,
  getKeywords,
  choiceOptions = {},
}) {
  const normalizedQuestion = normalizeReadingQuestion(question);
  const questionContext = normalizedQuestion || t('reading.fallbackQuestion');
  const cardSections = cards.map((card, index) => buildCardSection({
    card,
    index,
    spread,
    question: questionContext,
    language,
    t,
    meaningArchive,
    getFallbackReading,
    getKeywords,
  }));
  const firstTheme = cardSections[0]?.keywords[0] || cardSections[0]?.cardName || '';
  const lastTheme = cardSections.at(-1)?.keywords[0] || cardSections.at(-1)?.cardName || '';
  const reversedCount = cardSections.filter((section) => section.orientation === 'reversed').length;
  const repeatedTheme = getRepeatedTheme(cardSections);
  const overview = [
    t('reading.overview', { question: questionContext, firstTheme, lastTheme }),
    reversedCount > 0
      ? t(reversedCount === 1 ? 'reading.overviewReversedOne' : 'reading.overviewReversed', { count: reversedCount })
      : t('reading.overviewUpright'),
  ].join(' ');

  return {
    normalizedQuestion,
    overview,
    cards: cardSections,
    relationship: buildRelationship(cardSections, t),
    advice: buildAdvice(cardSections, t),
    reflectionQuestion: repeatedTheme
      ? t('reading.reflectionRepeated', { theme: repeatedTheme.keyword })
      : t('reading.reflectionMixed', { theme: firstTheme || lastTheme }),
    disclaimer: t('reading.disclaimer'),
    choiceComparison: spread?.key === 'choice'
      ? buildChoiceComparison(cardSections, choiceOptions, t)
      : null,
  };
}
