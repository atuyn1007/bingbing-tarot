const freezeTrigram = (trigram) => Object.freeze({
  ...trigram,
  linePatternBottomToTop: Object.freeze([...trigram.linePatternBottomToTop]),
});

export const UNITY_TRIGRAMS = Object.freeze([
  freezeTrigram({ id: 'qian', nameKey: 'qian', unicode: '☰', linePatternBottomToTop: ['yang', 'yang', 'yang'] }),
  freezeTrigram({ id: 'dui', nameKey: 'dui', unicode: '☱', linePatternBottomToTop: ['yang', 'yang', 'yin'] }),
  freezeTrigram({ id: 'li', nameKey: 'li', unicode: '☲', linePatternBottomToTop: ['yang', 'yin', 'yang'] }),
  freezeTrigram({ id: 'zhen', nameKey: 'zhen', unicode: '☳', linePatternBottomToTop: ['yang', 'yin', 'yin'] }),
  freezeTrigram({ id: 'xun', nameKey: 'xun', unicode: '☴', linePatternBottomToTop: ['yin', 'yang', 'yang'] }),
  freezeTrigram({ id: 'kan', nameKey: 'kan', unicode: '☵', linePatternBottomToTop: ['yin', 'yang', 'yin'] }),
  freezeTrigram({ id: 'gen', nameKey: 'gen', unicode: '☶', linePatternBottomToTop: ['yin', 'yin', 'yang'] }),
  freezeTrigram({ id: 'kun', nameKey: 'kun', unicode: '☷', linePatternBottomToTop: ['yin', 'yin', 'yin'] }),
]);

const TRIGRAM_BY_ID = new Map(UNITY_TRIGRAMS.map((trigram) => [trigram.id, trigram]));
const TRIGRAM_BY_PATTERN = new Map(
  UNITY_TRIGRAMS.map((trigram) => [trigram.linePatternBottomToTop.join(','), trigram]),
);

export function getUnityTrigram(id) {
  return TRIGRAM_BY_ID.get(id) || null;
}

export function getUnityTrigramByPattern(pattern) {
  if (!Array.isArray(pattern) || pattern.length !== 3) return null;
  return TRIGRAM_BY_PATTERN.get(pattern.join(',')) || null;
}
