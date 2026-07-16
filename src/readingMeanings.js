export function getReadingFromMeaningArchive(card, isReversed, language, meaningArchive, fallbackReading = '') {
  if (!meaningArchive || !card) return fallbackReading;

  const meaningCard = meaningArchive.findTarotMeaningCard(card);
  const localizedCard = meaningArchive.getLocalizedMeaningCard(meaningCard, language);
  const archiveReading = isReversed
    ? localizedCard?.displayReadingReversed
    : localizedCard?.displayReadingUpright;

  return String(archiveReading || '').trim() || fallbackReading;
}
