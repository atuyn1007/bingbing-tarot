import { getUnityHexagramKnowledge, getUnityLineKnowledge } from './unityKnowledge.js';

// Read identities and line states from the saved calculation; never recalculate it.
export function getUnitySupplement(calculation, locale) {
  return {
    primary: getUnityHexagramKnowledge(calculation.primaryHexagram.number, locale),
    changed: calculation.movingLineIndexes.length
      ? getUnityHexagramKnowledge(calculation.changedHexagram.number, locale) : null,
    lines: calculation.rounds.map((round) => ({
      ...getUnityLineKnowledge(calculation.primaryHexagram.number, round.lineIndex, locale),
      lineIndex: round.lineIndex, lineType: round.lineType, isMoving: round.isMoving,
      changedPolarity: round.changedPolarity,
    })),
  };
}
