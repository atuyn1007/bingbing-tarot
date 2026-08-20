const keyword = (keywordId, labels) => Object.freeze({ keywordId, labels: Object.freeze(labels) });

export const UNITY_KEYWORDS = Object.freeze([
  keyword('initiative', { 'zh-CN': '开创', en: 'Initiative', it: 'Iniziativa' }),
  keyword('continuity', { 'zh-CN': '持续', en: 'Continuity', it: 'Continuità' }),
  keyword('discipline', { 'zh-CN': '节度', en: 'Discipline', it: 'Disciplina' }),
  keyword('receptivity', { 'zh-CN': '承载', en: 'Receptivity', it: 'Ricettività' }),
  keyword('support', { 'zh-CN': '支持', en: 'Support', it: 'Sostegno' }),
  keyword('steadiness', { 'zh-CN': '稳定', en: 'Steadiness', it: 'Stabilità' }),
  keyword('exchange', { 'zh-CN': '交泰', en: 'Exchange', it: 'Scambio' }),
  keyword('alignment', { 'zh-CN': '协同', en: 'Alignment', it: 'Allineamento' }),
  keyword('transition', { 'zh-CN': '转化', en: 'Transition', it: 'Transizione' }),
  keyword('stagnation', { 'zh-CN': '阻隔', en: 'Stagnation', it: 'Stasi' }),
  keyword('boundary', { 'zh-CN': '边界', en: 'Boundaries', it: 'Confini' }),
  keyword('restoration', { 'zh-CN': '恢复通达', en: 'Restoring flow', it: 'Ripristino del flusso' }),
]);

const KEYWORD_BY_ID = new Map(UNITY_KEYWORDS.map((item) => [item.keywordId, item]));

export function getUnityKeyword(keywordId) {
  return KEYWORD_BY_ID.get(keywordId) || null;
}
