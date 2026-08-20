import { getUnityHexagramByTrigrams } from './data/unity/hexagrams.js';
import { getUnityTrigramByPattern } from './data/unity/trigrams.js';

export { UNITY_HEXAGRAM_NAME_KEYS } from './data/unity/hexagrams.js';

const LINE_FACTS = {
  6: { lineType: 'old-yin', linePolarity: 'yin', lineAge: 'old', isMoving: true, changedPolarity: 'yang' },
  7: { lineType: 'young-yang', linePolarity: 'yang', lineAge: 'young', isMoving: false, changedPolarity: 'yang' },
  8: { lineType: 'young-yin', linePolarity: 'yin', lineAge: 'young', isMoving: false, changedPolarity: 'yin' },
  9: { lineType: 'old-yang', linePolarity: 'yang', lineAge: 'old', isMoving: true, changedPolarity: 'yin' },
};

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
  const lower = getUnityTrigramByPattern(pattern.slice(0, 3));
  const upper = getUnityTrigramByPattern(pattern.slice(3, 6));
  if (!lower || !upper) throw new Error('Invalid hexagram line pattern.');
  const structure = getUnityHexagramByTrigrams(upper.id, lower.id);
  if (!structure) throw new Error('Unable to resolve King Wen hexagram.');
  return {
    number: structure.kingWenNumber,
    nameKey: structure.nameKey,
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
    if (
      round?.roundIndex !== index + 1
      || (round.lineIndex != null && round.lineIndex !== index + 1)
      || (round.linePosition != null && round.linePosition !== LINE_POSITIONS[index])
    ) throw new Error('Unity rounds must be in strict bottom-to-top order.');
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
