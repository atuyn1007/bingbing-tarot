import { getUnityTrigram } from './trigrams.js';

export const UNITY_HEXAGRAM_NAME_KEYS = Object.freeze([
  'qian', 'kun', 'zhun', 'meng', 'xu', 'song', 'shi', 'bi', 'xiaoxu', 'lv', 'tai', 'pi', 'tongren', 'dayou', 'qianModesty', 'yu',
  'sui', 'gu', 'lin', 'guan', 'shike', 'biGrace', 'bo', 'fu', 'wuwang', 'daxu', 'yi', 'daguo', 'kan', 'li', 'xian', 'heng',
  'dun', 'dazhuang', 'jin', 'mingyi', 'jiaren', 'kui', 'jian', 'jie', 'sun', 'yiIncrease', 'guai', 'gou', 'cui', 'sheng', 'kunOppression', 'jing',
  'ge', 'ding', 'zhen', 'gen', 'jianDevelopment', 'guimei', 'feng', 'lvTraveler', 'xun', 'dui', 'huan', 'jieLimitation', 'zhongfu', 'xiaoguo', 'jiji', 'weiji',
]);

const HEXAGRAM_TRIGRAM_PAIRS = Object.freeze([
  ['qian', 'qian'], ['kun', 'kun'], ['kan', 'zhen'], ['gen', 'kan'], ['kan', 'qian'], ['qian', 'kan'], ['kun', 'kan'], ['kan', 'kun'],
  ['xun', 'qian'], ['qian', 'dui'], ['kun', 'qian'], ['qian', 'kun'], ['qian', 'li'], ['li', 'qian'], ['kun', 'gen'], ['zhen', 'kun'],
  ['dui', 'zhen'], ['gen', 'xun'], ['kun', 'dui'], ['xun', 'kun'], ['li', 'zhen'], ['gen', 'li'], ['gen', 'kun'], ['kun', 'zhen'],
  ['qian', 'zhen'], ['gen', 'qian'], ['gen', 'zhen'], ['dui', 'xun'], ['kan', 'kan'], ['li', 'li'], ['dui', 'gen'], ['zhen', 'xun'],
  ['qian', 'gen'], ['zhen', 'qian'], ['li', 'kun'], ['kun', 'li'], ['xun', 'li'], ['li', 'dui'], ['kan', 'gen'], ['zhen', 'kan'],
  ['gen', 'dui'], ['xun', 'zhen'], ['dui', 'qian'], ['qian', 'xun'], ['dui', 'kun'], ['kun', 'xun'], ['dui', 'kan'], ['kan', 'xun'],
  ['dui', 'li'], ['li', 'xun'], ['zhen', 'zhen'], ['gen', 'gen'], ['xun', 'gen'], ['zhen', 'dui'], ['zhen', 'li'], ['li', 'gen'],
  ['xun', 'xun'], ['dui', 'dui'], ['xun', 'kan'], ['kan', 'dui'], ['xun', 'dui'], ['zhen', 'gen'], ['kan', 'li'], ['li', 'kan'],
]);

function createHexagramStructure(pair, index) {
  const [upperTrigramId, lowerTrigramId] = pair;
  const upper = getUnityTrigram(upperTrigramId);
  const lower = getUnityTrigram(lowerTrigramId);
  const kingWenNumber = index + 1;
  return Object.freeze({
    hexagramId: `hexagram-${String(kingWenNumber).padStart(2, '0')}`,
    kingWenNumber,
    nameKey: UNITY_HEXAGRAM_NAME_KEYS[index],
    upperTrigramId,
    lowerTrigramId,
    linePatternBottomToTop: Object.freeze([
      ...lower.linePatternBottomToTop,
      ...upper.linePatternBottomToTop,
    ]),
    unicode: String.fromCodePoint(0x4dc0 + index),
    structuralStatus: 'verified',
  });
}

export const UNITY_HEXAGRAMS = Object.freeze(HEXAGRAM_TRIGRAM_PAIRS.map(createHexagramStructure));

const HEXAGRAM_BY_NUMBER = new Map(UNITY_HEXAGRAMS.map((hexagram) => [hexagram.kingWenNumber, hexagram]));
const HEXAGRAM_BY_TRIGRAMS = new Map(
  UNITY_HEXAGRAMS.map((hexagram) => [
    `${hexagram.upperTrigramId}:${hexagram.lowerTrigramId}`,
    hexagram,
  ]),
);

export function getUnityHexagramByNumber(number) {
  return HEXAGRAM_BY_NUMBER.get(Number(number)) || null;
}

export function getUnityHexagramByTrigrams(upperTrigramId, lowerTrigramId) {
  return HEXAGRAM_BY_TRIGRAMS.get(`${upperTrigramId}:${lowerTrigramId}`) || null;
}
