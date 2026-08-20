export function getLocalizedUnityCardName(card, language, meaningArchive) {
  if (!card) return '';
  if (language === 'zh-CN') return card.name || card.englishName || '';
  if (language === 'en') return card.englishName || card.name || '';
  if (!meaningArchive) return card.englishName || card.name || '';

  try {
    const meaningCard = meaningArchive.findTarotMeaningCard({ id: card.id });
    const localizedCard = meaningArchive.getLocalizedMeaningCard(meaningCard, language);
    return localizedCard?.displayName || card.englishName || card.name || '';
  } catch {
    return card.englishName || card.name || '';
  }
}
