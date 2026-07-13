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

function toRoman(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return '--';
  if (number === 0) return '0';
  const table = [['M', 1000], ['CM', 900], ['D', 500], ['CD', 400], ['C', 100], ['XC', 90], ['L', 50], ['XL', 40], ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]];
  let remaining = number;
  return table.reduce((result, [glyph, amount]) => {
    while (remaining >= amount) {
      result += glyph;
      remaining -= amount;
    }
    return result;
  }, '');
}

function getCardSummary(localizedCard) {
  const detail = String(localizedCard?.displayDetail || '').replace(/\s+/g, ' ').trim();
  if (!detail) return '';
  const firstSentence = detail.match(/^.*?[。！？.!?](?:\s|$)/)?.[0] || detail;
  return firstSentence.length > 76 ? `${firstSentence.slice(0, 76).trim()}…` : firstSentence;
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
const ARCHIVE_CHAPTERS = [
  { key: 'major', english: 'MAJOR ARCANA', element: 'QUINTESSENCE', symbol: '☉', coordinate: '0° — 330°' },
  { key: 'wands', english: 'SUIT OF WANDS', element: 'IGNIS / FIRE', symbol: '△', coordinate: 'ARIES · LEO · SAGITTARIUS' },
  { key: 'cups', english: 'SUIT OF CUPS', element: 'AQUA / WATER', symbol: '▽', coordinate: 'CANCER · SCORPIO · PISCES' },
  { key: 'swords', english: 'SUIT OF SWORDS', element: 'AER / AIR', symbol: '♢', coordinate: 'GEMINI · LIBRA · AQUARIUS' },
  { key: 'pentacles', english: 'SUIT OF PENTACLES', element: 'TERRA / EARTH', symbol: '⊕', coordinate: 'TAURUS · VIRGO · CAPRICORN' },
];

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

  const groupedCards = ARCHIVE_CHAPTERS.map((chapter) => ({
    ...chapter,
    cards: filteredCards.filter((card) => chapter.key === 'major' ? card.arcana === 'major' : card.suit === chapter.key),
  })).filter((chapter) => chapter.cards.length > 0);

  return (
    <div className={`screen-shell page-shell archive-page meanings-archive-page theme-${theme}`}>
      <div className="catalog-celestial-background" aria-hidden="true"><span /><span /><span /></div>

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
          <div className="meanings-archive-intro">
            <p className="eyebrow">ARCANA ARCHIVE · CODEX BBT–078</p>
            <h2 className="question-title">{text.heroTitle}</h2>
            <p className="catalog-hero-english">THE CELESTIAL TAROT CATALOGUE</p>
            <p className="question-note">{text.heroCopy}</p>
            <div className="catalog-index-data" aria-hidden="true">
              <span><small>COLLECTION</small><strong>078</strong></span>
              <span><small>DIVISIONS</small><strong>05</strong></span>
              <span><small>EDITION</small><strong>MMXXVI</strong></span>
              <span><small>COORDINATE</small><strong>RA 18h 03m</strong></span>
            </div>
          </div>

          <div className="meanings-archive-controls">
            <div className="catalog-search-heading" aria-hidden="true"><span>ARCHIVAL RETRIEVAL</span><i /><small>{filteredCards.length.toString().padStart(2, '0')} / 78</small></div>
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
            <div className="catalog-control-footnote" aria-hidden="true"><span>CATALOGUE SERIES Ⅰ—Ⅴ</span><span>OBSERVATORY INDEX · 35°41′ N</span></div>
          </div>
        </section>

        {filteredCards.length > 0 ? (
          <div className="catalog-chapters" aria-label={text.gridAriaLabel}>
            {groupedCards.map((chapter, chapterIndex) => (
              <section key={chapter.key} className={`catalog-chapter catalog-chapter-${chapter.key}`}>
                <header className="catalog-chapter-heading">
                  <span className="catalog-chapter-index">0{chapterIndex + 1}</span>
                  <span className="catalog-chapter-symbol" aria-hidden="true">{chapter.symbol}</span>
                  <div>
                    <p>{chapter.english}</p>
                    <h3>{text.filter(chapter.key)}</h3>
                  </div>
                  <div className="catalog-chapter-coordinate" aria-hidden="true"><span>{chapter.element}</span><small>{chapter.coordinate}</small></div>
                  <strong>{chapter.cards.length.toString().padStart(2, '0')}</strong>
                </header>

                <div className="meanings-index-grid catalog-archive-wall">
                  {chapter.cards.map((card, cardIndex) => {
                    const localizedCard = getLocalizedMeaningCard(card, language);

                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => onOpenCard(card.id)}
                        className="meaning-index-item archive-catalog-card"
                      >
                        <span className="archive-card-accession">BBT–{String(card.catalogId).padStart(3, '0')}</span>
                        <span className="meaning-index-number">{toRoman(card.number)}</span>
                        <span className="archive-card-corner" aria-hidden="true">✦</span>
                        <div className="meaning-index-thumb-shell">
                          {card.image ? <img src={card.image} alt={localizedCard.displayName} className="meaning-index-thumb" /> : null}
                        </div>
                        <div className="meaning-index-copy">
                          <span className="meaning-index-meta">{chapter.english} · {formatCardNumber(card.number)}</span>
                          <strong className="meaning-index-name-cn">{card.name_cn}</strong>
                          <span className="meaning-index-name-en">{card.name_en}</span>
                          <div className="archive-card-keywords">
                            {(localizedCard.displayKeywords || []).slice(0, 3).map((keyword) => <span key={keyword}>{keyword}</span>)}
                          </div>
                          <p className="archive-card-summary">{getCardSummary(localizedCard)}</p>
                        </div>
                        <div className="meaning-index-trailing">
                          <span className="meaning-index-open">{text.openDetail}</span>
                          <ChevronRight className="meaning-index-arrow" />
                        </div>
                        <span className="archive-card-folio" aria-hidden="true">FOLIO {String(cardIndex + 1).padStart(2, '0')}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
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
