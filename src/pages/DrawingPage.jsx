import { X } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

function DrawingPage({
  theme,
  goHome,
  isHumanMode,
  activeSpread,
  userQuestion,
  setUserQuestion,
  choiceA,
  choiceB,
  setChoiceA,
  setChoiceB,
  isChoiceSpread,
  canConfirmQuestion,
  handleConfirmQuestion,
  t,
}) {
  const questionExamples = t('drawing.questionExamples');
  const missingQuestion = !userQuestion.trim();
  const missingChoiceA = isChoiceSpread && !choiceA.trim();
  const missingChoiceB = isChoiceSpread && !choiceB.trim();
  const confirmLabel = missingQuestion
    ? t('drawing.missingQuestionButton')
    : missingChoiceA
      ? t('drawing.missingChoiceAButton')
      : missingChoiceB
        ? t('drawing.missingChoiceBButton')
        : t('drawing.startShuffle');

  return (
    <div className={`screen-shell page-shell archive-page drawing-archive-page theme-${theme}`}>
      <header className="page-header">
        <button type="button" onClick={goHome} className="icon-button" aria-label={t('drawing.backHome')}>
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
            <section className="drawing-spread-positions" aria-labelledby="drawing-spread-positions-title">
              <p id="drawing-spread-positions-title" className="drawing-field-kicker">{t('drawing.positionsTitle')}</p>
              <div className="drawing-position-list">
                {activeSpread.positions.map((position, index) => (
                  <article key={`${activeSpread.key}-input-position-${index}`} className="drawing-position-record">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <strong>{position.title}</strong>
                      {position.subtitle ? <small>{position.subtitle}</small> : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <p id="question-guidance" className="drawing-question-guidance">{t('drawing.questionGuidance')}</p>
            <label className="sr-only" htmlFor="tarot-question">{t('drawing.questionInputLabel')}</label>
            <textarea
              id="tarot-question"
              value={userQuestion}
              onChange={(event) => setUserQuestion(event.target.value)}
              placeholder={t('drawing.questionPlaceholder')}
              className="question-input"
              rows={5}
              autoFocus
              aria-describedby="question-guidance question-character-count"
            />
            <div className="drawing-question-meta">
              <div className="drawing-question-examples" aria-label={t('drawing.examplesLabel')}>
                {Array.isArray(questionExamples) && questionExamples.map((example) => (
                  <button key={example} type="button" onClick={() => setUserQuestion(example)}>
                    {example}
                  </button>
                ))}
              </div>
              <span id="question-character-count" className="drawing-character-count" aria-live="polite">
                {t('drawing.characterCount', { count: userQuestion.length })}
              </span>
            </div>
            {isChoiceSpread && (
              <div className="choice-option-inputs">
                <p className="choice-option-inputs-title">{t('drawing.choiceOptionsTitle')}</p>
                <label className="choice-option-field" htmlFor="choice-option-a">
                  <span>{t('drawing.choiceOptionALabel')}</span>
                  <input
                    id="choice-option-a"
                    value={choiceA}
                    onChange={(event) => setChoiceA(event.target.value)}
                    placeholder={t('drawing.choiceOptionAPlaceholder')}
                    required
                  />
                </label>
                <label className="choice-option-field" htmlFor="choice-option-b">
                  <span>{t('drawing.choiceOptionBLabel')}</span>
                  <input
                    id="choice-option-b"
                    value={choiceB}
                    onChange={(event) => setChoiceB(event.target.value)}
                    placeholder={t('drawing.choiceOptionBPlaceholder')}
                    required
                  />
                </label>
              </div>
            )}
            <button type="button" onClick={handleConfirmQuestion} disabled={!canConfirmQuestion} className="primary-button">
              {confirmLabel}
            </button>
            <p className="drawing-disclaimer">{t('drawing.disclaimer')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DrawingPage;
