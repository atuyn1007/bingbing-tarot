import { getUnityHexagramKnowledge, getUnityLineKnowledge } from './unityKnowledge.js';
import { withUnityGeneralReading } from './unityGeneralReading.js';

// Read identities and line states from the saved calculation; never recalculate it.
export function getUnitySupplement(calculation, locale) {
  const reading = {
    primary: withUnityGeneralReading(getUnityHexagramKnowledge(calculation.primaryHexagram.number, locale)),
    changed: calculation.movingLineIndexes.length
      ? withUnityGeneralReading(getUnityHexagramKnowledge(calculation.changedHexagram.number, locale)) : null,
    lines: calculation.rounds.map((round) => withUnityGeneralReading({
      ...getUnityLineKnowledge(calculation.primaryHexagram.number, round.lineIndex, locale),
      lineIndex: round.lineIndex, lineType: round.lineType, isMoving: round.isMoving,
      changedPolarity: round.changedPolarity,
    })),
  };
  // Derived presentation only. Preserve the calculation and archived knowledge.
  const describe = knowledge => ({
    number: knowledge.structure.kingWenNumber,
    summary: knowledge.modern.summary,
    kind: knowledge.modern.kind || 'dedicated',
  });
  return { ...reading, focus: {
    question: String(calculation.question || '').trim(),
    primary: describe(reading.primary),
    movingLines: reading.lines.filter(line => line.isMoving).map(line => ({
      lineIndex: line.lineIndex, polarity: line.polarity,
      summary: line.modern.summary, kind: line.modern.kind || 'dedicated',
    })),
    changed: reading.changed ? describe(reading.changed) : null,
  } };
}
