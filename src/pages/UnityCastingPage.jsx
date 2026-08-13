import { X } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

function UnityCastingPage({ theme, question, goHome, t }) {
  return (
    <div className={`screen-shell page-shell archive-page unity-casting-page theme-${theme}`}>
      <header className="page-header">
        <button type="button" onClick={goHome} className="icon-button" aria-label={t('unity.backHome')}>
          <X className="w-5 h-5" />
        </button>
        <h1 className="page-title">{t('unity.title')}</h1>
        <div className="page-header-controls"><LanguageSwitcher /></div>
      </header>

      <main className="unity-casting-main">
        <section className="unity-casting-heading" aria-labelledby="unity-first-round-title">
          <p>{t('unity.firstRoundEyebrow')}</p>
          <h2 id="unity-first-round-title">{t('unity.firstRoundTitle')}</h2>
          <blockquote>{question}</blockquote>
          <small>{t('unity.firstRoundNote')}</small>
        </section>

        <div className="unity-static-card-row" aria-hidden="true">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="unity-static-card-back">
              <span className="unity-static-card-border" />
              <span className="unity-static-card-orbit" />
              <span className="unity-static-card-sun">☉</span>
              <i>{String(index + 1).padStart(2, '0')}</i>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default UnityCastingPage;
