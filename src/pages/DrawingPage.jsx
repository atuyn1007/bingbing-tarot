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
    <div className={`screen-shell page-shell theme-${theme}`}>
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
        <div className="question-panel">
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
      </main>
    </div>
  );
}

export default DrawingPage;
