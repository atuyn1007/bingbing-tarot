export function normalizeChoiceOptions(choiceA, choiceB) {
  return {
    choiceA: String(choiceA || '').trim(),
    choiceB: String(choiceB || '').trim(),
  };
}

export function hasCompleteChoiceOptions(choiceA, choiceB) {
  const normalized = normalizeChoiceOptions(choiceA, choiceB);
  return Boolean(normalized.choiceA && normalized.choiceB);
}

export function getChoiceDisplayGroups(cards, choiceA, choiceB, fallbackA, fallbackB, selfLabel) {
  const normalized = normalizeChoiceOptions(choiceA, choiceB);

  return [
    { key: 'choice-a', label: `A｜${normalized.choiceA || fallbackA}`, cardIndexes: [2, 0] },
    { key: 'choice-b', label: `B｜${normalized.choiceB || fallbackB}`, cardIndexes: [3, 1] },
    { key: 'choice-self', label: selfLabel, cardIndexes: [4] },
  ];
}
