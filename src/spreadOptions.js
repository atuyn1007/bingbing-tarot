export const SPREAD_OPTIONS = [
  {
    key: 'three',
    localeKey: 'spreads.three',
    canonicalName: 'three-card spread',
    cardCount: 3,
    preview: ['1', '2', '3'],
  },
  {
    key: 'triangle',
    localeKey: 'spreads.triangle',
    canonicalName: 'triangle spread',
    cardCount: 3,
    preview: ['1', '2', '3'],
  },
  {
    key: 'choice',
    localeKey: 'spreads.choice',
    canonicalName: 'choice spread',
    cardCount: 5,
    preview: ['A', 'B', 'A+', 'B+', 'You'],
  },
  {
    key: 'unity',
    localeKey: 'spreads.unity',
    canonicalName: 'unity of all things spread',
    cardCount: 18,
    preview: ['I', 'II', 'III', 'IV', 'V', 'VI'],
  },
];

export function getSpreadConfig(spreadKey, t) {
  const spread = SPREAD_OPTIONS.find((item) => item.key === spreadKey) || SPREAD_OPTIONS[0];
  const translation = t ? t(spread.localeKey) : null;

  if (!translation || typeof translation !== 'object') {
    return {
      ...spread,
      name: spread.canonicalName,
      shortName: spread.canonicalName,
      description: '',
      summary: '',
      positions: [],
    };
  }

  return {
    ...spread,
    ...translation,
    cardCountLabel: translation.cardCount,
  };
}
