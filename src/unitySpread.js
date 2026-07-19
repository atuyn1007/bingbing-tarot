const LINE_POSITIONS = [
  { key: 'initial', label: '初爻' },
  { key: 'second', label: '二爻' },
  { key: 'third', label: '三爻' },
  { key: 'fourth', label: '四爻' },
  { key: 'fifth', label: '五爻' },
  { key: 'top', label: '上爻' },
];

const TRIGRAMS = [
  { id: 'qian', linePattern: ['yang', 'yang', 'yang'] },
  { id: 'dui', linePattern: ['yang', 'yang', 'yin'] },
  { id: 'li', linePattern: ['yang', 'yin', 'yang'] },
  { id: 'zhen', linePattern: ['yang', 'yin', 'yin'] },
  { id: 'xun', linePattern: ['yin', 'yang', 'yang'] },
  { id: 'kan', linePattern: ['yin', 'yang', 'yin'] },
  { id: 'gen', linePattern: ['yin', 'yin', 'yang'] },
  { id: 'kun', linePattern: ['yin', 'yin', 'yin'] },
];

const TRIGRAM_BY_PATTERN = new Map(TRIGRAMS.map((trigram) => [trigram.linePattern.join(','), trigram]));

const HEXAGRAM_NUMBERS = {
  'qian:qian': 1, 'kun:kun': 2, 'kan:zhen': 3, 'gen:kan': 4, 'kan:qian': 5, 'qian:kan': 6, 'kun:kan': 7, 'kan:kun': 8,
  'xun:qian': 9, 'qian:dui': 10, 'kun:qian': 11, 'qian:kun': 12, 'qian:li': 13, 'li:qian': 14, 'kun:gen': 15, 'zhen:kun': 16,
  'dui:zhen': 17, 'gen:xun': 18, 'kun:dui': 19, 'xun:kun': 20, 'li:zhen': 21, 'gen:li': 22, 'gen:kun': 23, 'kun:zhen': 24,
  'qian:zhen': 25, 'gen:qian': 26, 'gen:zhen': 27, 'dui:xun': 28, 'kan:kan': 29, 'li:li': 30, 'dui:gen': 31, 'zhen:xun': 32,
  'qian:gen': 33, 'zhen:qian': 34, 'li:kun': 35, 'kun:li': 36, 'xun:li': 37, 'li:dui': 38, 'kan:gen': 39, 'zhen:kan': 40,
  'gen:dui': 41, 'xun:zhen': 42, 'dui:qian': 43, 'qian:xun': 44, 'dui:kun': 45, 'kun:xun': 46, 'dui:kan': 47, 'kan:xun': 48,
  'dui:li': 49, 'li:xun': 50, 'zhen:zhen': 51, 'gen:gen': 52, 'xun:gen': 53, 'zhen:dui': 54, 'zhen:li': 55, 'li:gen': 56,
  'xun:xun': 57, 'dui:dui': 58, 'xun:kan': 59, 'kan:dui': 60, 'xun:dui': 61, 'zhen:gen': 62, 'kan:li': 63, 'li:kan': 64,
};

const LINE_BY_VALUE = {
  6: { lineType: 'old-yin', polarity: 'yin', age: 'old', isMoving: true, changedPolarity: 'yang' },
  7: { lineType: 'young-yang', polarity: 'yang', age: 'young', isMoving: false, changedPolarity: 'yang' },
  8: { lineType: 'young-yin', polarity: 'yin', age: 'young', isMoving: false, changedPolarity: 'yin' },
  9: { lineType: 'old-yang', polarity: 'yang', age: 'old', isMoving: true, changedPolarity: 'yin' },
};

function getTrigram(lines) {
  const trigram = TRIGRAM_BY_PATTERN.get(lines.join(','));
  if (!trigram) throw new Error('Invalid trigram line pattern.');
  return trigram;
}

function getHexagram(lines) {
  const lowerTrigram = getTrigram(lines.slice(0, 3));
  const upperTrigram = getTrigram(lines.slice(3, 6));
  const number = HEXAGRAM_NUMBERS[`${upperTrigram.id}:${lowerTrigram.id}`];

  if (!number) throw new Error('Unable to resolve hexagram number.');

  return {
    number,
    lowerTrigram: lowerTrigram.id,
    upperTrigram: upperTrigram.id,
    linePatternBottomToTop: [...lines],
  };
}

function serializeCard(card, drawIndex) {
  const isReversed = Boolean(card?.isReversed);

  return {
    drawIndex,
    cardId: card?.id,
    name: card?.name || '',
    englishName: card?.englishName || '',
    orientation: isReversed ? 'reversed' : 'upright',
    coinValue: isReversed ? 3 : 2,
  };
}

export function calculateUnityReading(cards, options = {}) {
  if (!Array.isArray(cards) || cards.length !== 18) {
    throw new Error('Unity Spread requires exactly 18 tarot cards.');
  }

  const timestamp = options.now || new Date().toISOString();
  const rounds = Array.from({ length: 6 }, (_, roundOffset) => {
    const tarotCards = cards.slice(roundOffset * 3, roundOffset * 3 + 3).map(serializeCard);
    const threeCardValues = tarotCards.map((card) => card.coinValue);
    const lineValue = threeCardValues.reduce((total, value) => total + value, 0);
    const line = LINE_BY_VALUE[lineValue];

    if (!line) throw new Error('Unity Spread line value must be 6, 7, 8, or 9.');

    return {
      roundIndex: roundOffset + 1,
      lineIndex: roundOffset + 1,
      linePosition: LINE_POSITIONS[roundOffset].key,
      lineLabel: LINE_POSITIONS[roundOffset].label,
      tarotCards,
      threeCardValues,
      lineValue,
      lineType: line.lineType,
      linePolarity: line.polarity,
      lineAge: line.age,
      isMoving: line.isMoving,
      changedPolarity: line.changedPolarity,
    };
  });

  const primaryLines = rounds.map((round) => round.linePolarity);
  const changedLines = rounds.map((round) => round.changedPolarity);

  return {
    schemaVersion: '1.0',
    id: `unity-reading_${timestamp.replace(/[^0-9A-Za-z]/g, '')}`,
    status: 'completed',
    spread: {
      key: 'unity-of-all-things',
      name: '万象归一阵',
      englishName: 'The Unity of All Things',
      method: 'three-coin-tarot-mapping',
      roundCount: 6,
      cardsPerRound: 3,
      totalCardCount: 18,
      lineOrder: 'bottom-to-top',
    },
    question: {
      text: String(options.question || '').trim(),
      locale: options.locale || 'zh-CN',
      submittedAt: timestamp,
    },
    rounds,
    primaryHexagram: getHexagram(primaryLines),
    changedHexagram: getHexagram(changedLines),
    movingLineIndexes: rounds.filter((round) => round.isMoving).map((round) => round.lineIndex),
    timestamps: {
      createdAt: timestamp,
      completedAt: timestamp,
    },
  };
}
