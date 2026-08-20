const CONTENT_VERSION = '1.0.0';
const EDITOR_SOURCE = 'bingbing-unity-editorial-v1';

const content = ({ hexagramId, originalText, sourceId, keywordIds, modern }) => Object.freeze({
  hexagramId,
  contentVersion: CONTENT_VERSION,
  contentStatus: 'development-verified',
  canonical: Object.freeze({ originalText, sourceId }),
  modern: Object.freeze({
    'zh-CN': Object.freeze({ summary: modern['zh-CN'], sourceId: EDITOR_SOURCE }),
    en: Object.freeze({ summary: modern.en, sourceId: EDITOR_SOURCE }),
    it: Object.freeze({ summary: modern.it, sourceId: EDITOR_SOURCE }),
  }),
  keywordIds: Object.freeze(keywordIds),
});

export const UNITY_HEXAGRAM_CONTENT = Object.freeze([
  content({
    hexagramId: 'hexagram-01',
    originalText: '乾：元亨，利貞。',
    sourceId: 'zhouyi-canonical-ctext',
    keywordIds: ['initiative', 'continuity', 'discipline'],
    modern: {
      'zh-CN': '此卦呈现持续发动与开创的结构，重点在于让行动保持秩序、节度与长期一致性。',
      en: 'This hexagram describes sustained initiative and creative movement, with emphasis on order, proportion, and long-term consistency.',
      it: 'Questo esagramma descrive un impulso creativo continuo, ponendo l’accento su ordine, misura e coerenza nel tempo.',
    },
  }),
  content({
    hexagramId: 'hexagram-02',
    originalText: '坤：元亨，利牝馬之貞。君子有攸往，先迷後得主，利西南得朋，東北喪朋。安貞，吉。',
    sourceId: 'zhouyi-canonical-ctext',
    keywordIds: ['receptivity', 'support', 'steadiness'],
    modern: {
      'zh-CN': '此卦强调承载、配合与让条件成熟；力量来自稳定回应现实，而非抢先主导一切。',
      en: 'This hexagram emphasizes receptivity, support, and allowing conditions to mature; strength comes from responding steadily rather than controlling everything first.',
      it: 'Questo esagramma mette al centro ricettività, sostegno e maturazione delle condizioni; la forza nasce dal rispondere con costanza, non dal voler dirigere tutto in anticipo.',
    },
  }),
  content({
    hexagramId: 'hexagram-11',
    originalText: '泰：小往大來，吉亨。',
    sourceId: 'zhouyi-canonical-ctext',
    keywordIds: ['exchange', 'alignment', 'transition'],
    modern: {
      'zh-CN': '此卦呈现上下相交、内外能够流通的阶段；通达需要继续维护交流、分工与节奏。',
      en: 'This hexagram presents a phase in which upper and lower, inner and outer, can communicate; continued flow depends on maintaining exchange, roles, and timing.',
      it: 'Questo esagramma mostra una fase in cui alto e basso, interno ed esterno, possono comunicare; il flusso richiede cura nello scambio, nei ruoli e nei tempi.',
    },
  }),
  content({
    hexagramId: 'hexagram-12',
    originalText: '否之匪人，不利君子贞，大往小来。',
    sourceId: 'zhouyi-canonical-wikisource',
    keywordIds: ['stagnation', 'boundary', 'restoration'],
    modern: {
      'zh-CN': '此卦呈现上下不交、沟通受阻的结构；重点是守住原则、减少无效消耗，并等待恢复联系的条件。',
      en: 'This hexagram describes blocked exchange between levels; the focus is on preserving principles, reducing futile expenditure, and waiting for conditions that can restore contact.',
      it: 'Questo esagramma descrive uno scambio bloccato tra i diversi livelli; l’attenzione va posta sul preservare i principi, ridurre gli sprechi e attendere condizioni capaci di ristabilire il contatto.',
    },
  }),
]);

const CONTENT_BY_HEXAGRAM_ID = new Map(UNITY_HEXAGRAM_CONTENT.map((item) => [item.hexagramId, item]));

export function getUnityHexagramContent(hexagramId) {
  return CONTENT_BY_HEXAGRAM_ID.get(hexagramId) || null;
}
