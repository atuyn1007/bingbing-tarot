import { ArrowLeft, ChevronRight, Search } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getLocalizedMeaningCard, tarotMeaningCards } from '../cardMeanings.js';

const zhCNLabels = {
  eyebrow: '牌意查询',
  pageTitle: '牌意查询',
  heroTitle: '塔罗牌图鉴索引',
  heroCopy: '通过紧凑索引浏览整副牌组。点击任意一张牌后，再进入独立详情页查看完整牌意内容。',
  searchLabel: '搜索牌名',
  searchPlaceholder: '搜索中文、英文、意大利语或牌组',
  filterLabel: '按类别筛选',
  filters: {
    all: '全部',
    major: '大阿尔卡那',
    wands: '权杖',
    cups: '圣杯',
    swords: '宝剑',
    pentacles: '星币',
  },
  gridAriaLabel: '塔罗牌索引列表',
  openDetail: '进入',
  emptyEyebrow: '没有结果',
  noResults: '没有找到符合当前搜索或筛选条件的牌。',
};

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
  const text = language === 'zh-CN'
    ? {
        eyebrow: zhCNLabels.eyebrow,
        pageTitle: zhCNLabels.pageTitle,
        heroTitle: zhCNLabels.heroTitle,
        heroCopy: zhCNLabels.heroCopy,
        searchLabel: zhCNLabels.searchLabel,
        searchPlaceholder: zhCNLabels.searchPlaceholder,
        filterLabel: zhCNLabels.filterLabel,
        gridAriaLabel: zhCNLabels.gridAriaLabel,
        openDetail: zhCNLabels.openDetail,
        emptyEyebrow: zhCNLabels.emptyEyebrow,
        noResults: zhCNLabels.noResults,
        filter: (key) => zhCNLabels.filters[key] || key,
      }
    : {
        eyebrow: t('meanings.eyebrow'),
        pageTitle: t('meanings.pageTitle'),
        heroTitle: t('meanings.heroTitle'),
        heroCopy: t('meanings.heroCopy'),
        searchLabel: t('meanings.searchLabel'),
        searchPlaceholder: t('meanings.searchPlaceholder'),
        filterLabel: t('meanings.filterLabel'),
        gridAriaLabel: t('meanings.gridAriaLabel'),
        openDetail: t('meanings.openDetail'),
        emptyEyebrow: t('meanings.emptyEyebrow'),
        noResults: t('meanings.noResults'),
        filter: (key) => t(`meanings.filters.${key}`),
      };

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
          <p className="eyebrow">{text.eyebrow}</p>
          <h1 className="page-title">{text.pageTitle}</h1>
        </div>
        <div className="page-header-controls">
          <LanguageSwitcher />
        </div>
      </header>

      <main className="page-content meanings-page-content">
        <section className="meanings-hero-card">
          <p className="eyebrow">{text.pageTitle}</p>
          <h2 className="question-title">{text.heroTitle}</h2>
          <p className="question-note">{text.heroCopy}</p>

          <label className="meanings-search-field" htmlFor="meanings-search">
            <Search className="meanings-search-icon" />
            <input
              id="meanings-search"
              name="meanings-search"
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              className="meanings-search-input"
              placeholder={text.searchPlaceholder}
              aria-label={text.searchLabel}
              autoComplete="off"
            />
          </label>

          <div className="meanings-filter-row" role="tablist" aria-label={text.filterLabel}>
            {CATEGORY_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                className={`meanings-filter-chip ${categoryFilter === key ? 'is-active' : ''}`}
                onClick={() => onCategoryFilterChange(key)}
              >
                {text.filter(key)}
              </button>
            ))}
          </div>
        </section>

        {filteredCards.length > 0 ? (
          <section className="meanings-index-grid" aria-label={text.gridAriaLabel}>
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
                      {card.arcana === 'major' ? ` · ${text.filter('major')}` : ` · ${text.filter(card.suit)}`}
                    </span>
                  </div>
                  <div className="meaning-index-trailing">
                    <span className="meaning-index-open">{text.openDetail}</span>
                    <ChevronRight className="meaning-index-arrow" />
                  </div>
                </button>
              );
            })}
          </section>
        ) : (
          <section className="meanings-empty-card" aria-live="polite">
            <p className="eyebrow">{text.emptyEyebrow}</p>
            <p className="meaning-detail-empty">{text.noResults}</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default CardMeaningsPage;
