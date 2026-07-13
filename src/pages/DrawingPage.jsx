import { X } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

function DrawingPage({
  theme,
  goHome,
  isHumanMode,
  activeSpread,
  userQuestion,
  setUserQuestion,
  handleConfirmQuestion,
  t,
}) {
  return (
    <div className={`screen-shell page-shell archive-page drawing-archive-page theme-${theme}`}>
      <header className="page-header">
        <button type="button" onClick={goHome} className="icon-button">
          <X className="w-5 h-5" />
        </button>
        <h1 className="page-title">{isHumanMode ? t('drawing.humanTitle') : t('drawing.freeTitle')}</h1>
        <div className="page-header-controls">
          <LanguageSwitcher />
        </div>
      </header>

      <main className="page-content">
        <div className="drawing-archive-layout">
          <aside className="drawing-celestial-stage" aria-hidden="true">
            <span className="drawing-stage-kicker">ARCANA / INTENTION</span>
            <div className="drawing-stage-orbit drawing-stage-orbit-one" />
            <div className="drawing-stage-orbit drawing-stage-orbit-two" />
            <div className="drawing-stage-sun" />
            <div className="drawing-mystery-deck">
              <span>✦</span>
              <strong>?</strong>
              <small>{activeSpread.name}</small>
            </div>
            <span className="drawing-stage-coordinate">SOL · 00° 00′</span>
          </aside>

          <div className="question-panel">
            <span className="archive-paper-index">01</span>
            <p className="eyebrow">{isHumanMode ? t('drawing.humanTitle') : activeSpread.name}</p>
            <h2 className="question-title">{isHumanMode ? t('drawing.humanQuestionTitle') : t('drawing.chooseSpreadTitle', { spread: activeSpread.name })}</h2>
            <p className="question-note">{isHumanMode ? t('drawing.humanQuestionNote') : activeSpread.summary}</p>
            <textarea
              value={userQuestion}
              onChange={(event) => setUserQuestion(event.target.value)}
              placeholder={t('drawing.questionPlaceholder')}
              className="question-input"
              rows={5}
              autoFocus
            />
            <button type="button" onClick={handleConfirmQuestion} disabled={!userQuestion.trim()} className="primary-button">
              {t('drawing.confirmAndDraw')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DrawingPage;
