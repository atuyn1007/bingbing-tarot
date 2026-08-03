import { getKeywordsFromMeaningArchive, getReadingFromMeaningArchive } from './readingMeanings.js';

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
  return keywords.join(t('common.listSeparator')) || cardName || '';
}

function normalizeMeaningEvidence(meaning) {
  return String(meaning || '').replace(/\s+/gu, ' ').trim();
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
  const archiveKeywords = getKeywordsFromMeaningArchive(card, language, meaningArchive);
  const keywords = normalizeKeywords(archiveKeywords.length > 0 ? archiveKeywords : getKeywords?.(card) || []);
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
    keywordText,
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

function buildIntegratedTrace(cardSections, t) {
  return cardSections
    .map((section) => t('reading.integratedCardTrace', {
      position: section.positionTitle,
      card: section.cardName,
      orientation: getOrientationLabel(section, t),
      theme: section.theme,
      keywords: section.keywordText || section.theme,
      meaning: normalizeMeaningEvidence(section.baseMeaning),
    }))
    .join(t('common.listSeparator'));
}

function normalizeKeywordForComparison(keyword) {
  return String(keyword || '').trim().toLocaleLowerCase();
}

export function analyzeCardRelation(fromSection, toSection) {
  const toKeywords = new Set((toSection?.keywords || []).map(normalizeKeywordForComparison));
  const sharedKeywords = (fromSection?.keywords || []).filter((keyword) => (
    toKeywords.has(normalizeKeywordForComparison(keyword))
  ));
  const sameOrientation = fromSection?.orientation === toSection?.orientation;

  if (sharedKeywords.length > 0) {
    return { kind: sameOrientation ? 'echo' : 'revision', sharedKeywords };
  }

  return { kind: sameOrientation ? 'progression' : 'tension', sharedKeywords: [] };
}

function buildRelationText(fromSection, toSection, t) {
  const relation = analyzeCardRelation(fromSection, toSection);
  const relationKey = {
    echo: 'reading.integratedRelationEcho',
    revision: 'reading.integratedRelationRevision',
    tension: 'reading.integratedRelationTension',
    progression: 'reading.integratedRelationProgression',
  }[relation.kind];

  return t(relationKey, {
    sharedKeywords: relation.sharedKeywords.join(t('common.listSeparator')),
    fromCard: fromSection.cardName,
    toCard: toSection.cardName,
    fromKeywords: fromSection.keywordText || fromSection.theme,
    toKeywords: toSection.keywordText || toSection.theme,
    fromOrientation: getOrientationLabel(fromSection, t),
    toOrientation: getOrientationLabel(toSection, t),
  });
}

function getCompleteMeaning(section) {
  return normalizeMeaningEvidence(section?.baseMeaning) || section?.meaningLead || section?.theme || '';
}

export function buildThreeCardIntegratedReading({ spread, cardSections = [], question, t }) {
  const title = t('reading.integratedTitle');
  if (cardSections.length === 0) return { title, summary: '', paragraphs: [] };

  const [first, middle = cardSections[0], last = cardSections.at(-1)] = cardSections;
  return {
    title,
    summary: t('reading.integratedThreeSummary', {
      question,
      spreadName: spread?.name || spread?.key || '',
      firstPosition: first.positionTitle,
      firstCard: first.cardName,
      firstOrientation: getOrientationLabel(first, t),
      firstKeywords: first.keywordText || first.theme,
      middlePosition: middle.positionTitle,
      middleCard: middle.cardName,
      middleOrientation: getOrientationLabel(middle, t),
      middleKeywords: middle.keywordText || middle.theme,
      lastPosition: last.positionTitle,
      lastCard: last.cardName,
      lastOrientation: getOrientationLabel(last, t),
      lastKeywords: last.keywordText || last.theme,
    }),
    paragraphs: [
      t('reading.integratedThreeLink', {
        fromPosition: first.positionTitle,
        fromCard: first.cardName,
        fromOrientation: getOrientationLabel(first, t),
        fromKeywords: first.keywordText || first.theme,
        fromMeaning: getCompleteMeaning(first),
        toPosition: middle.positionTitle,
        toCard: middle.cardName,
        toOrientation: getOrientationLabel(middle, t),
        toKeywords: middle.keywordText || middle.theme,
        toMeaning: getCompleteMeaning(middle),
        relation: buildRelationText(first, middle, t),
      }),
      t('reading.integratedThreeLink', {
        fromPosition: middle.positionTitle,
        fromCard: middle.cardName,
        fromOrientation: getOrientationLabel(middle, t),
        fromKeywords: middle.keywordText || middle.theme,
        fromMeaning: getCompleteMeaning(middle),
        toPosition: last.positionTitle,
        toCard: last.cardName,
        toOrientation: getOrientationLabel(last, t),
        toKeywords: last.keywordText || last.theme,
        toMeaning: getCompleteMeaning(last),
        relation: buildRelationText(middle, last, t),
      }),
      t('reading.integratedThreePractical', {
        question,
        middlePosition: middle.positionTitle,
        middleCard: middle.cardName,
        middleKeywords: middle.keywordText || middle.theme,
        lastPosition: last.positionTitle,
        lastCard: last.cardName,
        lastKeywords: last.keywordText || last.theme,
      }),
    ],
  };
}

export function buildTriangleIntegratedReading({ spread, cardSections = [], question, t }) {
  const title = t('reading.integratedTitle');
  if (cardSections.length === 0) return { title, summary: '', paragraphs: [] };

  const [perception, reality = cardSections[0], guidance = cardSections.at(-1)] = cardSections;
  return {
    title,
    summary: t('reading.integratedTriangleSummary', {
      question,
      spreadName: spread?.name || spread?.key || '',
      perceptionPosition: perception.positionTitle,
      perceptionCard: perception.cardName,
      perceptionOrientation: getOrientationLabel(perception, t),
      perceptionTheme: perception.theme,
      realityPosition: reality.positionTitle,
      realityCard: reality.cardName,
      realityOrientation: getOrientationLabel(reality, t),
      realityTheme: reality.theme,
      guidancePosition: guidance.positionTitle,
      guidanceCard: guidance.cardName,
      guidanceOrientation: getOrientationLabel(guidance, t),
      guidanceTheme: guidance.theme,
    }),
    paragraphs: [
      t('reading.integratedTriangleReality', {
        perceptionPosition: perception.positionTitle,
        perceptionCard: perception.cardName,
        perceptionTheme: perception.theme,
        perceptionMeaning: getCompleteMeaning(perception),
        perceptionOrientation: getOrientationLabel(perception, t),
        realityPosition: reality.positionTitle,
        realityCard: reality.cardName,
        realityTheme: reality.theme,
        realityMeaning: getCompleteMeaning(reality),
        realityOrientation: getOrientationLabel(reality, t),
        relation: buildRelationText(perception, reality, t),
      }),
      t('reading.integratedTriangleExit', {
        guidancePosition: guidance.positionTitle,
        guidanceCard: guidance.cardName,
        guidanceTheme: guidance.theme,
        guidanceMeaning: getCompleteMeaning(guidance),
        guidanceOrientation: getOrientationLabel(guidance, t),
        perceptionKeywords: perception.keywordText || perception.theme,
        realityKeywords: reality.keywordText || reality.theme,
        perceptionRelation: buildRelationText(perception, guidance, t),
        realityRelation: buildRelationText(reality, guidance, t),
      }),
      t('reading.integratedTrianglePractical', {
        question,
        perceptionPosition: perception.positionTitle,
        perceptionKeywords: perception.keywordText || perception.theme,
        realityPosition: reality.positionTitle,
        realityKeywords: reality.keywordText || reality.theme,
        guidancePosition: guidance.positionTitle,
        guidanceCard: guidance.cardName,
        guidanceKeywords: guidance.keywordText || guidance.theme,
      }),
    ],
  };
}

export function buildChoiceIntegratedReading({ spread, cardSections = [], question, choiceComparison, t }) {
  const title = t('reading.integratedTitle');
  if (cardSections.length === 0 || !choiceComparison) return { title, summary: '', paragraphs: [] };

  const { optionA, optionB, self } = choiceComparison;
  const optionACondition = t('reading.integratedChoiceCondition', {
    position: optionA.development.positionTitle,
    card: optionA.development.cardName,
    orientation: getOrientationLabel(optionA.development, t),
    keywords: optionA.development.keywordText || optionA.development.theme,
  });
  const optionBCondition = t('reading.integratedChoiceCondition', {
    position: optionB.development.positionTitle,
    card: optionB.development.cardName,
    orientation: getOrientationLabel(optionB.development, t),
    keywords: optionB.development.keywordText || optionB.development.theme,
  });
  return {
    title,
    summary: t('reading.integratedChoiceSummary', {
      question,
      spreadName: spread?.name || spread?.key || '',
      optionA: optionA.label,
      optionB: optionB.label,
      aCurrentCard: optionA.current.cardName,
      aCurrentOrientation: getOrientationLabel(optionA.current, t),
      aDevelopmentCard: optionA.development.cardName,
      aDevelopmentOrientation: getOrientationLabel(optionA.development, t),
      bCurrentCard: optionB.current.cardName,
      bCurrentOrientation: getOrientationLabel(optionB.current, t),
      bDevelopmentCard: optionB.development.cardName,
      bDevelopmentOrientation: getOrientationLabel(optionB.development, t),
      selfCard: self.cardName,
      selfOrientation: getOrientationLabel(self, t),
    }),
    paragraphs: [
      t('reading.integratedChoicePath', {
        label: optionA.label,
        currentPosition: optionA.current.positionTitle,
        currentCard: optionA.current.cardName,
        currentOrientation: getOrientationLabel(optionA.current, t),
        currentKeywords: optionA.current.keywordText || optionA.current.theme,
        currentMeaning: getCompleteMeaning(optionA.current),
        developmentPosition: optionA.development.positionTitle,
        developmentCard: optionA.development.cardName,
        developmentOrientation: getOrientationLabel(optionA.development, t),
        developmentKeywords: optionA.development.keywordText || optionA.development.theme,
        developmentMeaning: getCompleteMeaning(optionA.development),
        relation: buildRelationText(optionA.current, optionA.development, t),
      }),
      t('reading.integratedChoicePath', {
        label: optionB.label,
        currentPosition: optionB.current.positionTitle,
        currentCard: optionB.current.cardName,
        currentOrientation: getOrientationLabel(optionB.current, t),
        currentKeywords: optionB.current.keywordText || optionB.current.theme,
        currentMeaning: getCompleteMeaning(optionB.current),
        developmentPosition: optionB.development.positionTitle,
        developmentCard: optionB.development.cardName,
        developmentOrientation: getOrientationLabel(optionB.development, t),
        developmentKeywords: optionB.development.keywordText || optionB.development.theme,
        developmentMeaning: getCompleteMeaning(optionB.development),
        relation: buildRelationText(optionB.current, optionB.development, t),
      }),
      t('reading.integratedChoiceTradeoff', {
        question,
        selfPosition: self.positionTitle,
        selfCard: self.cardName,
        selfOrientation: getOrientationLabel(self, t),
        selfKeywords: self.keywordText || self.theme,
        selfMeaning: getCompleteMeaning(self),
        optionA: optionA.label,
        optionB: optionB.label,
        optionACondition,
        optionBCondition,
        optionASelfRelation: buildRelationText(self, optionA.development, t),
        optionBSelfRelation: buildRelationText(self, optionB.development, t),
      }),
    ],
  };
}

function buildIntegratedReading(options) {
  if (options.spread?.key === 'choice') return buildChoiceIntegratedReading(options);
  if (options.spread?.key === 'triangle') return buildTriangleIntegratedReading(options);
  return buildThreeCardIntegratedReading(options);
}

export function resolveIntegratedReading(reading, t) {
  const current = reading?.integratedReading;
  const title = String(current?.title || t('reading.integratedTitle')).trim();
  const summary = String(current?.summary || '').trim();
  const paragraphs = Array.isArray(current?.paragraphs)
    ? current.paragraphs.map((paragraph) => String(paragraph || '').trim()).filter(Boolean)
    : [];

  if (summary || paragraphs.length > 0) return { title, summary, paragraphs };

  const cardSections = Array.isArray(reading?.cards) ? reading.cards : [];
  const trace = buildIntegratedTrace(cardSections, t);
  return {
    title,
    summary: String(reading?.overview || '').trim(),
    paragraphs: trace ? [trace] : [],
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
  const reversedCount = cardSections.filter((section) => section.orientation === 'reversed').length;
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
  const integratedReading = buildIntegratedReading({
    spread,
    cardSections,
    question: questionContext,
    choiceComparison,
    t,
  });

  return {
    normalizedQuestion,
    overview,
    cards: cardSections,
    integratedReading,
    disclaimer: t('reading.disclaimer'),
    choiceComparison,
  };
}
