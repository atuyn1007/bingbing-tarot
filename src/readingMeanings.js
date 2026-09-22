export function getReadingFromMeaningArchive(card, isReversed, language, meaningArchive, fallbackReading = '') {
  if (!meaningArchive || !card) return fallbackReading;

  const meaningCard = meaningArchive.findTarotMeaningCard(card);
  const localizedCard = meaningArchive.getLocalizedMeaningCard(meaningCard, language);
  const archiveReading = isReversed
    ? localizedCard?.displayReadingReversed
    : localizedCard?.displayReadingUpright;

  return String(archiveReading || '').trim() || fallbackReading;
}

// Presentation only: keep complete archive keywords available to the reading engine.
export function selectDisplayKeywords(keywords = []) {
  const unique = [...new Set(keywords.filter(word => typeof word === 'string' && word.trim()).map(word => word.trim()))];
  const shortChinese = word => /^\p{Script=Han}{2}$/u.test(word);
  return [...unique.filter(shortChinese), ...unique.filter(word => !shortChinese(word))].slice(0, 3);
}

export function getKeywordsFromMeaningArchive(card, language, meaningArchive) {
  if (!meaningArchive || !card) return [];

  const meaningCard = meaningArchive.findTarotMeaningCard(card);
  const localizedCard = meaningArchive.getLocalizedMeaningCard(meaningCard, language);
  return Array.isArray(localizedCard?.displayKeywords) ? localizedCard.displayKeywords : [];
}
