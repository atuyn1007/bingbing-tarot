import { unityGeneralReading } from './i18n/unityGeneralReading.js';

const format = (text, values) => text.replace(/\{(\w+)\}/g, (_, key) => values[key]);

// Presentation supplement only: never writes templates into historical knowledge.
export function withUnityGeneralReading(knowledge) {
  if (!knowledge || knowledge.modern?.summary) return knowledge;
  const copy = unityGeneralReading[knowledge.locale] || unityGeneralReading['zh-CN'];
  let summary;
  if (knowledge.structure) {
    const { kingWenNumber, upperTrigramId, lowerTrigramId } = knowledge.structure;
    summary = format(copy.hexagram, {
      number: kingWenNumber, upper: copy.trigrams[upperTrigramId], lower: copy.trigrams[lowerTrigramId],
      upperTheme: copy.themes[upperTrigramId], lowerTheme: copy.themes[lowerTrigramId],
    });
  } else {
    const state = format(knowledge.isMoving ? copy.moving : copy.static, {
      from: copy.polarity[knowledge.polarity], to: copy.polarity[knowledge.changedPolarity],
    });
    summary = format(copy.line, {
      number: knowledge.hexagramNumber, position: knowledge.linePosition,
      stage: copy.positions[knowledge.linePosition - 1], state,
    });
  }
  return { ...knowledge, modern: { summary, title: copy.title, kind: 'general-reference' } };
}
