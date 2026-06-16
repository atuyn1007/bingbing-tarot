import { ArrowLeft, ChevronRight, Search } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getLocalizedMeaningCard, tarotMeaningCards } from '../cardMeanings.js';

function formatCardNumber(number) {
  return number === null || number === undefined ? '--' : `${number}`;
}

function getSearchText(card, localizedCard) {
  const categoryTokens = [
    card.arcana,
    card.suit,
    card.arcana === 'major' ? 'major arcana' : '',
    card.arcana === 'major' ? '大阿尔卡纳' : '',
    card.arcana === 'major' ? 'arcani maggiori' : '',
    card.suit === 'wands' ? '权杖 wands bastoni' : '',
    card.suit === 'cups' ? '圣杯 cups coppe' : '',
    card.suit === 'swords' ? '宝剑 swords spade' : '',
    card.suit === 'pentacles' ? '星币 pentacles denari' : '',
  ];

  return [
    card.name_cn,
    card.name_en,
    card.translations?.it?.name,
    localizedCard.displayName,
    localizedCard.secondaryName,
    ...(localizedCard.displayKeywords || []),
    ...categoryTokens,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

const CATEGORY_KEYS = ['all', 'major', 'wands', 'cups', 'swords', 'pentacles'];

function CardMeaningsPage({
  theme,
  t,
  language,
  searchTerm,
  onSearchTermChange,
  categoryFilter,
  onCategoryFilterChange,
  onBack,
  onOpenCard,
}) {
  const normalizedQuery = String(searchTerm || '').trim().toLowerCase();

  const filteredCards = tarotMeaningCards.filter((card) => {
    const localizedCard = getLocalizedMeaningCard(card, language);
    const matchesCategory =
      categoryFilter === 'all' ||
      (categoryFilter === 'major' ? card.arcana === 'major' : card.suit === categoryFilter);

    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;

    return getSearchText(card, localizedCard).includes(normalizedQuery);
  });

  return (
    <div className={`screen-shell page-shell theme-${theme}`}>
      <div className="orb orb-left" />
      <div className="orb orb-right" />

      <header className="page-header">
        <button type="button" onClick={onBack} className="icon-button" aria-label={t('common.backHome')}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="page-header-copy">
          <p className="eyebrow">{t('meanings.eyebrow')}</p>
          <h1 className="page-title">{t('meanings.pageTitle')}</h1>
        </div>
        <div className="page-header-controls">
          <LanguageSwitcher />
        </div>
      </header>

      <main className="page-content meanings-page-content">
        <section className="meanings-hero-card">
          <p className="eyebrow">{t('meanings.pageTitle')}</p>
          <h2 className="question-title">{t('meanings.heroTitle')}</h2>
          <p className="question-note">{t('meanings.heroCopy')}</p>

          <label className="meanings-search-field" htmlFor="meanings-search">
            <Search className="meanings-search-icon" />
            <input
              id="meanings-search"
              name="meanings-search"
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              className="meanings-search-input"
              placeholder={t('meanings.searchPlaceholder')}
              aria-label={t('meanings.searchLabel')}
              autoComplete="off"
            />
          </label>

          <div className="meanings-filter-row" role="tablist" aria-label={t('meanings.filterLabel')}>
            {CATEGORY_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                className={`meanings-filter-chip ${categoryFilter === key ? 'is-active' : ''}`}
                onClick={() => onCategoryFilterChange(key)}
              >
                {t(`meanings.filters.${key}`)}
              </button>
            ))}
          </div>
        </section>

        {filteredCards.length > 0 ? (
          <section className="meanings-index-grid" aria-label={t('meanings.gridAriaLabel')}>
            {filteredCards.map((card) => {
              const localizedCard = getLocalizedMeaningCard(card, language);

              return (
                <button key={card.id} type="button" onClick={() => onOpenCard(card.id)} className="meaning-index-item">
                  <div className="meaning-index-thumb-shell">
                    {card.image ? <img src={card.image} alt={localizedCard.displayName} className="meaning-index-thumb" /> : null}
                  </div>
                  <div className="meaning-index-copy">
                    <strong className="meaning-index-name-cn">{localizedCard.displayName}</strong>
                    <span className="meaning-index-name-en">{localizedCard.secondaryName}</span>
                    <span className="meaning-index-meta">
                      {formatCardNumber(card.number)}
                      {card.arcana === 'major' ? ` · ${t('meanings.filters.major')}` : ` · ${t(`meanings.filters.${card.suit}`)}`}
                    </span>
                  </div>
                  <div className="meaning-index-trailing">
                    <span className="meaning-index-open">{t('meanings.openDetail')}</span>
                    <ChevronRight className="meaning-index-arrow" />
                  </div>
                </button>
              );
            })}
          </section>
        ) : (
          <section className="meanings-empty-card" aria-live="polite">
            <p className="eyebrow">{t('meanings.emptyEyebrow')}</p>
            <p className="meaning-detail-empty">{t('meanings.noResults')}</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default CardMeaningsPage;
