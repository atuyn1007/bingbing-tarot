export const TAROT_READING_SNAPSHOT_VERSION = 1;

// Replay is deliberately independent of the meaning archive and reading engine.
export function resolveTarotReadingSnapshot(entry, language) {
  const snapshot = entry?.readingSnapshot;
  if (snapshot?.version !== TAROT_READING_SNAPSHOT_VERSION || typeof snapshot.question !== 'string') return null;
  const localized = snapshot.byLanguage?.[language];
  const reading = localized?.reading;
  if (!Array.isArray(snapshot.cards) || !snapshot.cards.length
    || !snapshot.cards.every(card => card && typeof card.id === 'number' && typeof card.isReversed === 'boolean')
    || !Array.isArray(localized?.spread?.positions)
    || localized.spread.positions.length !== snapshot.cards.length
    || !Array.isArray(reading?.cards) || reading.cards.length !== snapshot.cards.length
    || !reading.cards.every(card => card && typeof card.cardName === 'string' && typeof card.baseMeaning === 'string' && Array.isArray(card.keywords))
    || typeof reading.integratedReading?.summary !== 'string'
    || !Array.isArray(reading.integratedReading?.paragraphs)
    || !reading.integratedReading.paragraphs.every(text => typeof text === 'string')) return null;
  if (localized.spread.key === 'choice' && (!reading.choiceComparison?.optionA?.current || !reading.choiceComparison?.optionA?.development
    || !reading.choiceComparison?.optionB?.current || !reading.choiceComparison?.optionB?.development || !reading.choiceComparison?.self)) return null;
  return { question: snapshot.question, cards: snapshot.cards, choiceOptions: snapshot.choiceOptions,
    spread: localized.spread, reading, version: snapshot.version, engineVersion: snapshot.engineVersion };
}
