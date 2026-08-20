export function getReadingFromMeaningArchive(card, isReversed, language, meaningArchive, fallbackReading = '') {
  if (!meaningArchive || !card) return fallbackReading;

  const meaningCard = meaningArchive.findTarotMeaningCard(card);
  const localizedCard = meaningArchive.getLocalizedMeaningCard(meaningCard, language);
  const archiveReading = isReversed
    ? localizedCard?.displayReadingReversed
    : localizedCard?.displayReadingUpright;

  return String(archiveReading || '').trim() || fallbackReading;
}

export function getKeywordsFromMeaningArchive(card, language, meaningArchive) {
  if (!meaningArchive || !card) return [];

  const meaningCard = meaningArchive.findTarotMeaningCard(card);
  const localizedCard = meaningArchive.getLocalizedMeaningCard(meaningCard, language);
  return Array.isArray(localizedCard?.displayKeywords) ? localizedCard.displayKeywords : [];
}
