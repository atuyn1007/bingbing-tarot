import { ArrowLeft } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getLocalizedMeaningCard, tarotMeaningCards } from '../cardMeanings.js';

function formatCardNumber(number) {
  return number === null || number === undefined ? '--' : `${number}`;
}

function CardMeaningsPage({ theme, t, language, onBack, onOpenCard }) {
  return (
    <div className={`screen-shell page-shell theme-${theme}`}>
      <div className="orb orb-left" />
      <div className="orb orb-right" />

      <header className="page-header">
        <button type="button" onClick={onBack} className="icon-button">
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
        </section>

        <section className="meanings-grid" aria-label={t('meanings.gridAriaLabel')}>
          {tarotMeaningCards.map((card) => {
            const isReady = Boolean(card.detail);
            const localizedCard = getLocalizedMeaningCard(card, language);

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onOpenCard(card.id)}
                className={`meaning-card ${isReady ? 'meaning-card-ready' : 'meaning-card-placeholder'}`}
              >
                <div className="meaning-card-head">
                  <span className="meaning-card-number">{formatCardNumber(card.number)}</span>
                  <span className={`meaning-card-status ${isReady ? 'is-ready' : ''}`}>
                    {isReady ? t('meanings.readyLabel') : t('meanings.inProgress')}
                  </span>
                </div>
                <div className="meaning-card-artwork-shell">
                  {card.image ? <img src={card.image} alt={localizedCard.displayName} className="meaning-card-artwork" /> : null}
                </div>
                <strong className="meaning-card-name-cn">{localizedCard.displayName}</strong>
                <span className="meaning-card-name-en">{localizedCard.secondaryName}</span>
              </button>
            );
          })}
        </section>
      </main>
    </div>
  );
}

export default CardMeaningsPage;
