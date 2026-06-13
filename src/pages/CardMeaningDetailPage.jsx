import { ArrowLeft } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getLocalizedMeaningCard } from '../cardMeanings';

function CardMeaningDetailPage({ theme, t, language, card, onBack }) {
  const localizedCard = getLocalizedMeaningCard(card, language);
  const title = localizedCard?.displayName || t('meanings.missingTitle');
  const subtitle = localizedCard?.secondaryName || '';
  const hasKeywords = Array.isArray(localizedCard?.displayKeywords) && localizedCard.displayKeywords.length > 0;
  const hasDetail = Boolean(localizedCard?.displayDetail);

  return (
    <div className={`screen-shell page-shell theme-${theme}`}>
      <div className="orb orb-left" />
      <div className="orb orb-right" />

      <header className="page-header">
        <button type="button" onClick={onBack} className="icon-button">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="page-header-copy">
          <p className="eyebrow">{t('meanings.detailEyebrow')}</p>
          <h1 className="page-title">{t('meanings.detailTitle')}</h1>
        </div>
        <div className="page-header-controls">
          <LanguageSwitcher />
        </div>
      </header>

      <main className="page-content meanings-page-content">
        <article className="meaning-detail-card">
          <p className="eyebrow">{t('meanings.cardLabel')}</p>
          <h2 className="meaning-detail-name">{title}</h2>
          {subtitle ? <p className="meaning-detail-subtitle">{subtitle}</p> : null}

          {card?.image ? (
            <div className="meaning-detail-artwork-shell">
              <img src={card.image} alt={title} className="meaning-detail-artwork" />
            </div>
          ) : null}

          <p className="meaning-detail-number">
            <span>{t('meanings.numberLabel')}</span>
            <strong>{card?.number ?? '--'}</strong>
          </p>

          <section className="meaning-detail-section">
            <h3>{t('meanings.keywordsLabel')}</h3>
            {hasKeywords ? (
              <div className="meaning-keyword-list">
                {localizedCard.displayKeywords.map((keyword) => (
                  <span key={keyword} className="meaning-keyword-chip">
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p className="meaning-detail-empty">{t('meanings.noKeywords')}</p>
            )}
          </section>

          <section className="meaning-detail-section">
            <h3>{t('meanings.detailLabel')}</h3>
            {hasDetail ? (
              <div className="meaning-detail-copy">
                {localizedCard.displayDetail.split('\n\n').map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="meaning-detail-empty">{t('meanings.inProgress')}</p>
            )}
          </section>
        </article>
      </main>
    </div>
  );
}

export default CardMeaningDetailPage;
