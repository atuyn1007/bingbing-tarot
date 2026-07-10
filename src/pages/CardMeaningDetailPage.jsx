import { ArrowLeft } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getLocalizedMeaningCard, getTarotMeaningCard } from '../cardMeanings.js';

const zhCNLabels = {
  backToList: '返回列表',
  detailEyebrow: '牌意详情',
  detailTitle: '塔罗牌详情',
  cardLabel: '塔罗牌',
  numberLabel: '编号',
  keywordsLabel: '关键词',
  noKeywords: '暂时还没有关键词。',
  detailLabel: '牌意详解',
  inProgress: '内容整理中',
  missingTitle: '未找到这张牌',
};

function CardMeaningDetailPage({ theme, t, language, cardId, onBack }) {
  const text = language === 'zh-CN'
    ? zhCNLabels
    : {
        backToList: t('meanings.backToList'),
        detailEyebrow: t('meanings.detailEyebrow'),
        detailTitle: t('meanings.detailTitle'),
        cardLabel: t('meanings.cardLabel'),
        numberLabel: t('meanings.numberLabel'),
        keywordsLabel: t('meanings.keywordsLabel'),
        noKeywords: t('meanings.noKeywords'),
        detailLabel: t('meanings.detailLabel'),
        inProgress: t('meanings.inProgress'),
        missingTitle: t('meanings.missingTitle'),
      };

  const card = getTarotMeaningCard(cardId);
  const localizedCard = getLocalizedMeaningCard(card, language);
  const title = localizedCard?.displayName || text.missingTitle;
  const subtitle = localizedCard?.secondaryName || '';
  const hasKeywords = Array.isArray(localizedCard?.displayKeywords) && localizedCard.displayKeywords.length > 0;
  const hasDetail = Boolean(localizedCard?.displayDetail);

  return (
    <div className={`screen-shell page-shell theme-${theme}`}>
      <div className="orb orb-left" />
      <div className="orb orb-right" />

      <header className="page-header">
        <button type="button" onClick={onBack} className="back-link-button">
          <ArrowLeft className="w-5 h-5" />
          <span>{text.backToList}</span>
        </button>
        <div className="page-header-copy">
          <p className="eyebrow">{text.detailEyebrow}</p>
          <h1 className="page-title">{text.detailTitle}</h1>
        </div>
        <div className="page-header-controls">
          <LanguageSwitcher />
        </div>
      </header>

      <main className="page-content meanings-page-content">
        <article className="meaning-detail-card">
          <p className="eyebrow">{text.cardLabel}</p>
          <h2 className="meaning-detail-name">{title}</h2>
          {subtitle ? <p className="meaning-detail-subtitle">{subtitle}</p> : null}

          {card?.image ? (
            <div className="meaning-detail-artwork-shell">
              <img src={card.image} alt={title} className="meaning-detail-artwork" />
            </div>
          ) : null}

          <p className="meaning-detail-number">
            <span>{text.numberLabel}</span>
            <strong>{card?.number ?? '--'}</strong>
          </p>

          <section className="meaning-detail-section">
            <h3>{text.keywordsLabel}</h3>
            {hasKeywords ? (
              <div className="meaning-keyword-list">
                {localizedCard.displayKeywords.map((keyword) => (
                  <span key={keyword} className="meaning-keyword-chip">
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p className="meaning-detail-empty">{text.noKeywords}</p>
            )}
          </section>

          <section className="meaning-detail-section">
            <h3>{text.detailLabel}</h3>
            {hasDetail ? (
              <div className="meaning-detail-copy">
                {localizedCard.displayDetail.split('\n\n').map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="meaning-detail-empty">{text.inProgress}</p>
            )}
          </section>
        </article>
      </main>
    </div>
  );
}

export default CardMeaningDetailPage;
