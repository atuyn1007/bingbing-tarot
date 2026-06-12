import { LazyMotion, domAnimation, m } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import CardStyleToggle from '../components/CardStyleToggle';
import SpreadCards from '../components/SpreadCards';

function ResultPage({
  theme,
  cardStyle,
  setCardStyle,
  goHome,
  t,
  isHumanMode,
  activeSpread,
  userQuestion,
  drawnCards,
  spreadForCards,
  isRevealing,
  readingComplete,
  readingLead,
  readingBody,
  onOpenHumanRequest,
}) {
  return (
    <div className={`screen-shell page-shell theme-${theme}`}>
      <header className="page-header">
        <button type="button" onClick={goHome} className="icon-button">
          <X className="w-5 h-5" />
        </button>
        <h1 className="page-title">{t('drawing.resultTitle')}</h1>
        <div className="page-header-controls">
          <LanguageSwitcher />
          <CardStyleToggle cardStyle={cardStyle} onChange={setCardStyle} t={t} />
        </div>
      </header>

      <main className="page-content reading-page-content">
        <div className="reading-layout">
          <section className="reading-question-card">
            <p className="eyebrow">{isHumanMode ? t('drawing.humanTitle') : activeSpread.name}</p>
            <p className="reading-question-text">{`"${userQuestion}"`}</p>
          </section>

          <SpreadCards
            cards={drawnCards}
            spread={spreadForCards}
            cardStyle={cardStyle}
            isRevealed={isRevealing}
            t={t}
          />

          {readingComplete && (
            <LazyMotion features={domAnimation}>
              <m.section className="reading-result-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <p className="reading-result-lead">{readingLead}</p>
                <p className="reading-result-text">
                  {readingBody}
                  <span className="reading-cursor">|</span>
                </p>

                <div className="reading-actions">
                  <button type="button" onClick={onOpenHumanRequest} className="primary-button">
                    <MessageCircle className="w-5 h-5" />
                    {isHumanMode ? t('humanRequest.sendReadingButton') : t('drawing.sendToReader')}
                  </button>
                  <button type="button" onClick={goHome} className="secondary-button">
                    {t('drawing.backHome')}
                  </button>
                </div>
              </m.section>
            </LazyMotion>
          )}
        </div>
      </main>
    </div>
  );
}

export default ResultPage;
