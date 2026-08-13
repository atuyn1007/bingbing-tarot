const LINE_FACTS = {
  6: { lineType: 'old-yin', linePolarity: 'yin', lineAge: 'old', isMoving: true, changedPolarity: 'yang' },
  7: { lineType: 'young-yang', linePolarity: 'yang', lineAge: 'young', isMoving: false, changedPolarity: 'yang' },
  8: { lineType: 'young-yin', linePolarity: 'yin', lineAge: 'young', isMoving: false, changedPolarity: 'yin' },
  9: { lineType: 'old-yang', linePolarity: 'yang', lineAge: 'old', isMoving: true, changedPolarity: 'yin' },
};

const TRIGRAMS = [
  { id: 'qian', pattern: ['yang', 'yang', 'yang'] },
  { id: 'dui', pattern: ['yang', 'yang', 'yin'] },
  { id: 'li', pattern: ['yang', 'yin', 'yang'] },
  { id: 'zhen', pattern: ['yang', 'yin', 'yin'] },
  { id: 'xun', pattern: ['yin', 'yang', 'yang'] },
  { id: 'kan', pattern: ['yin', 'yang', 'yin'] },
  { id: 'gen', pattern: ['yin', 'yin', 'yang'] },
  { id: 'kun', pattern: ['yin', 'yin', 'yin'] },
];

const TRIGRAM_BY_PATTERN = new Map(TRIGRAMS.map((trigram) => [trigram.pattern.join(','), trigram]));

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

export const UNITY_HEXAGRAM_NAME_KEYS = [
  'qian', 'kun', 'zhun', 'meng', 'xu', 'song', 'shi', 'bi', 'xiaoxu', 'lv', 'tai', 'pi', 'tongren', 'dayou', 'qianModesty', 'yu',
  'sui', 'gu', 'lin', 'guan', 'shike', 'biGrace', 'bo', 'fu', 'wuwang', 'daxu', 'yi', 'daguo', 'kan', 'li', 'xian', 'heng',
  'dun', 'dazhuang', 'jin', 'mingyi', 'jiaren', 'kui', 'jian', 'jie', 'sun', 'yiIncrease', 'guai', 'gou', 'cui', 'sheng', 'kunOppression', 'jing',
  'ge', 'ding', 'zhen', 'gen', 'jianDevelopment', 'guimei', 'feng', 'lvTraveler', 'xun', 'dui', 'huan', 'jieLimitation', 'zhongfu', 'xiaoguo', 'jiji', 'weiji',
];

function orientationValue(card) {
  return card?.orientation === 'reversed' || card?.isReversed ? 3 : 2;
}

export function deriveUnityLine(cards) {
  if (!Array.isArray(cards) || cards.length !== 3) {
    throw new Error('A Unity line requires exactly three tarot cards.');
  }
  const threeCardValues = cards.map(orientationValue);
  const lineValue = threeCardValues.reduce((sum, value) => sum + value, 0);
  const facts = LINE_FACTS[lineValue];
  if (!facts) throw new Error('Unity line value must be 6, 7, 8, or 9.');
  return { threeCardValues, lineValue, ...facts };
}

function resolveHexagram(pattern) {
  if (!Array.isArray(pattern) || pattern.length !== 6) throw new Error('A hexagram requires six lines.');
  const lower = TRIGRAM_BY_PATTERN.get(pattern.slice(0, 3).join(','));
  const upper = TRIGRAM_BY_PATTERN.get(pattern.slice(3, 6).join(','));
  if (!lower || !upper) throw new Error('Invalid hexagram line pattern.');
  const number = HEXAGRAM_NUMBERS[`${upper.id}:${lower.id}`];
  if (!number) throw new Error('Unable to resolve King Wen hexagram.');
  return {
    number,
    nameKey: UNITY_HEXAGRAM_NAME_KEYS[number - 1],
    lowerTrigram: lower.id,
    upperTrigram: upper.id,
    linePatternBottomToTop: [...pattern],
  };
}

function serializeCard(card, drawIndex) {
  const isReversed = orientationValue(card) === 3;
  return {
    drawIndex,
    cardId: card?.cardId ?? card?.id,
    name: card?.name || '',
    englishName: card?.englishName || '',
    orientation: isReversed ? 'reversed' : 'upright',
    isReversed,
    coinValue: isReversed ? 3 : 2,
  };
}

const LINE_POSITIONS = ['initial', 'second', 'third', 'fourth', 'fifth', 'top'];

export function calculateUnityResult(rounds, options = {}) {
  if (!Array.isArray(rounds) || rounds.length !== 6) {
    throw new Error('A Unity result requires six completed rounds.');
  }
  const normalizedRounds = rounds.map((round, index) => {
    const sourceCards = round?.tarotCards || round?.cards;
    if (!Array.isArray(sourceCards) || sourceCards.length !== 3) throw new Error('Every Unity round requires three cards.');
    const tarotCards = sourceCards.map((card, cardIndex) => serializeCard(card, cardIndex + 1));
    return {
      roundIndex: index + 1,
      lineIndex: index + 1,
      linePosition: LINE_POSITIONS[index],
      tarotCards,
      ...deriveUnityLine(tarotCards),
    };
  });
  const cardIds = normalizedRounds.flatMap((round) => round.tarotCards.map((card) => card.cardId));
  if (new Set(cardIds).size !== 18) throw new Error('Unity result cards must be unique.');
  const primaryPattern = normalizedRounds.map((round) => round.linePolarity);
  const changedPattern = normalizedRounds.map((round) => round.changedPolarity);
  const timestamp = options.now || new Date().toISOString();
  return {
    schemaVersion: '2.0',
    status: 'completed',
    question: String(options.question || '').trim(),
    locale: options.locale || 'zh-CN',
    rounds: normalizedRounds,
    primaryHexagram: resolveHexagram(primaryPattern),
    changedHexagram: resolveHexagram(changedPattern),
    movingLineIndexes: normalizedRounds.filter((round) => round.isMoving).map((round) => round.lineIndex),
    completedAt: timestamp,
  };
}
