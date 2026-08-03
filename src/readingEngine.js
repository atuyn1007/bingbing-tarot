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

function getMeaningLead(meaning) {
  const firstParagraph = String(meaning || '')
    .split(/\n\s*\n/u)
    .map((paragraph) => paragraph.replace(/\s+/gu, ' ').trim())
    .find(Boolean) || '';
  const firstSentence = firstParagraph.match(/^.*?[.!?。！？]/u)?.[0];
  return String(firstSentence || firstParagraph).trim();
}

function getTheme(keywords, cardName, t) {
  return keywords.slice(0, 2).join(t('common.listSeparator')) || cardName || '';
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
  const meaningLead = getMeaningLead(baseMeaning) || keywordText;
  const theme = getTheme(keywords, card?.name, t);

  return {
    cardId: card?.id,
    cardName: card?.name || '',
    englishName: card?.englishName || '',
    orientation: card?.isReversed ? 'reversed' : 'upright',
    positionIndex: index + 1,
    positionTitle: position.title,
    positionSubtitle: position.subtitle,
    keywords,
    theme,
    baseMeaning,
    meaningLead,
    positionResponsibility: position.subtitle
      ? t('reading.positionResponsibility', { position: position.title, subtitle: position.subtitle })
      : t('reading.positionResponsibilityNoSubtitle', { position: position.title }),
    orientationMeaning: t(card?.isReversed ? 'reading.orientationReversed' : 'reading.orientationUpright', {
      card: card?.name || '',
      keywords: keywordText,
      meaningLead,
    }),
    contextualMeaning: t('reading.contextualMeaning', {
      question,
      position: position.title,
      subtitle: position.subtitle,
      card: card?.name || '',
      keywords: keywordText,
      meaningLead,
    }),
    attention: t('reading.attention', {
      position: position.title,
      keywords: keywordText,
      meaningLead,
    }),
    boundary: t('reading.boundary'),
  };
}

function buildPositionTrace(cardSections, t) {
  return cardSections
    .map((section) => t('reading.positionThemeTrace', {
      position: section.positionTitle,
      theme: section.theme,
    }))
    .join(t('common.listSeparator'));
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
  const trace = buildPositionTrace(cardSections, t);
  let themeSentence;

  if (repeatedTheme) {
    themeSentence = t('reading.relationshipRepeated', {
      theme: repeatedTheme.keyword,
      positions: repeatedTheme.positions.join(' · '),
      trace,
    });
  } else {
    themeSentence = t('reading.relationshipMixed', { trace });
  }

  const orientationSentence = reversedCount > cardSections.length / 2
    ? t('reading.relationshipReversed')
    : t('reading.relationshipUpright');
  const flowSentence = t('reading.relationshipFlow', { firstPosition, lastPosition, trace });

  return [themeSentence, orientationSentence, flowSentence].filter(Boolean).join(' ');
}

function buildAdvice(cardSections, t, choiceComparison) {
  if (cardSections.length === 0) return [];

  if (choiceComparison) {
    const { optionA, optionB, self } = choiceComparison;
    return [
      t('reading.adviceVerify', {
        position: `${optionA.current.positionTitle} / ${optionB.current.positionTitle}`,
        theme: `${optionA.current.theme} / ${optionB.current.theme}`,
      }),
      t('reading.adviceBoundary', {
        position: self.positionTitle,
        theme: self.theme,
      }),
      t('reading.adviceStep', {
        position: `${optionA.development.positionTitle} / ${optionB.development.positionTitle}`,
        theme: `${optionA.development.theme} / ${optionB.development.theme}`,
      }),
    ];
  }

  const sections = cardSections.slice(0, 3);
  return sections.map((section, index) => {
    const key = section.orientation === 'reversed'
      ? 'reading.adviceAdjust'
      : index === sections.length - 1
        ? 'reading.adviceStep'
        : 'reading.adviceVerify';
    return t(key, { position: section.positionTitle, theme: section.theme });
  });
}

function getOrientationLabel(section, t) {
  return t(section.orientation === 'reversed' ? 'common.orientationReversed' : 'common.orientationUpright');
}

function buildChoiceComparison(cardSections, choiceOptions, t) {
  if (cardSections.length < 5) return null;
  const optionA = String(choiceOptions?.choiceA || '').trim() || t('drawing.choiceOptionAFallback');
  const optionB = String(choiceOptions?.choiceB || '').trim() || t('drawing.choiceOptionBFallback');
  const [aCurrent, bCurrent, aDevelopment, bDevelopment, self] = cardSections;
  const buildOption = (label, current, development) => ({
    label,
    current,
    development,
    trace: buildPositionTrace([current, development], t),
    advantage: t('reading.choiceAdvantage', {
      label,
      currentTheme: current.theme,
      developmentTheme: development.theme,
      currentOrientation: getOrientationLabel(current, t),
      developmentOrientation: getOrientationLabel(development, t),
    }),
    risk: t('reading.choiceRisk', {
      label,
      currentTheme: current.theme,
      developmentTheme: development.theme,
      currentOrientation: getOrientationLabel(current, t),
      developmentOrientation: getOrientationLabel(development, t),
    }),
  });

  return {
    optionA: buildOption(optionA, aCurrent, aDevelopment),
    optionB: buildOption(optionB, bCurrent, bDevelopment),
    self: {
      ...self,
      concern: t('reading.choiceConcern', {
        position: self.positionTitle,
        theme: self.theme,
        meaningLead: self.meaningLead,
      }),
    },
  };
}

function buildChoiceRelationship(comparison, t) {
  return t('reading.choiceRelationship', {
    optionA: comparison.optionA.label,
    optionATrace: comparison.optionA.trace,
    optionB: comparison.optionB.label,
    optionBTrace: comparison.optionB.trace,
    selfPosition: comparison.self.positionTitle,
    selfTheme: comparison.self.theme,
  });
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
  const reversedCount = cardSections.filter((section) => section.orientation === 'reversed').length;
  const repeatedTheme = getRepeatedTheme(cardSections);
  const trace = buildPositionTrace(cardSections, t);
  const choiceComparison = spread?.key === 'choice'
    ? buildChoiceComparison(cardSections, choiceOptions, t)
    : null;
  const overview = [
    spread?.key === 'choice' && choiceComparison
      ? t('reading.choiceOverview', {
          question: questionContext,
          optionA: choiceComparison.optionA.label,
          optionB: choiceComparison.optionB.label,
          trace,
        })
      : t('reading.overview', { question: questionContext, trace }),
    reversedCount > 0
      ? t(reversedCount === 1 ? 'reading.overviewReversedOne' : 'reading.overviewReversed', { count: reversedCount })
      : t('reading.overviewUpright'),
  ].join(' ');

  return {
    normalizedQuestion,
    overview,
    cards: cardSections,
    relationship: choiceComparison
      ? buildChoiceRelationship(choiceComparison, t)
      : buildRelationship(cardSections, t),
    advice: buildAdvice(cardSections, t, choiceComparison),
    reflectionQuestion: repeatedTheme
      ? t('reading.reflectionRepeated', { theme: repeatedTheme.keyword })
      : choiceComparison
        ? t('reading.reflectionChoice', {
            optionA: choiceComparison.optionA.label,
            optionB: choiceComparison.optionB.label,
            theme: choiceComparison.self.theme,
          })
        : t('reading.reflectionMixed', { trace }),
    disclaimer: t('reading.disclaimer'),
    choiceComparison,
  };
}
