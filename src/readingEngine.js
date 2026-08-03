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
    }))
    .join(t('common.listSeparator'));
}

function buildIntegratedReading({ spread, cardSections, question, choiceComparison, t }) {
  const title = t('reading.integratedTitle');
  if (cardSections.length === 0) return { title, summary: '', paragraphs: [] };

  const trace = buildIntegratedTrace(cardSections, t);

  if (spread?.key === 'choice' && choiceComparison) {
    const { optionA, optionB, self } = choiceComparison;
    return {
      title,
      summary: t('reading.integratedChoiceSummary', {
        question,
        optionA: optionA.label,
        optionB: optionB.label,
        trace,
      }),
      paragraphs: [
        t('reading.integratedChoicePath', {
          label: optionA.label,
          currentPosition: optionA.current.positionTitle,
          currentTheme: optionA.current.theme,
          developmentPosition: optionA.development.positionTitle,
          developmentTheme: optionA.development.theme,
        }),
        t('reading.integratedChoicePath', {
          label: optionB.label,
          currentPosition: optionB.current.positionTitle,
          currentTheme: optionB.current.theme,
          developmentPosition: optionB.development.positionTitle,
          developmentTheme: optionB.development.theme,
        }),
        t('reading.integratedChoiceTradeoff', {
          selfPosition: self.positionTitle,
          selfTheme: self.theme,
          optionA: optionA.label,
          optionB: optionB.label,
          trace,
        }),
      ],
    };
  }

  const [first, middle = cardSections[0], last = cardSections.at(-1)] = cardSections;

  if (spread?.key === 'triangle') {
    return {
      title,
      summary: t('reading.integratedTriangleSummary', {
        question,
        perceptionPosition: first.positionTitle,
        perceptionTheme: first.theme,
        realityPosition: middle.positionTitle,
        realityTheme: middle.theme,
        guidancePosition: last.positionTitle,
        guidanceTheme: last.theme,
      }),
      paragraphs: [
        t('reading.integratedTriangleContrast', {
          perceptionPosition: first.positionTitle,
          perceptionTheme: first.theme,
          perceptionOrientation: getOrientationLabel(first, t),
          realityPosition: middle.positionTitle,
          realityTheme: middle.theme,
          realityOrientation: getOrientationLabel(middle, t),
        }),
        t('reading.integratedTriangleGuidance', {
          guidancePosition: last.positionTitle,
          guidanceTheme: last.theme,
          guidanceOrientation: getOrientationLabel(last, t),
          perceptionTheme: first.theme,
          realityTheme: middle.theme,
          trace,
        }),
      ],
    };
  }

  const reversedCount = cardSections.filter((section) => section.orientation === 'reversed').length;
  return {
    title,
    summary: t('reading.integratedThreeSummary', { question, trace }),
    paragraphs: [
      t('reading.integratedThreeFlow', {
        firstPosition: first.positionTitle,
        firstTheme: first.theme,
        middlePosition: middle.positionTitle,
        middleTheme: middle.theme,
        lastPosition: last.positionTitle,
        lastTheme: last.theme,
      }),
      t('reading.integratedThreeBalance', {
        uprightCount: cardSections.length - reversedCount,
        reversedCount,
        trace,
      }),
    ],
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
