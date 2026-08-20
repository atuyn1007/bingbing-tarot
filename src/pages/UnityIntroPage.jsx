import { ArrowRight, X } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { canStartUnityCasting, normalizeUnityQuestion } from '../unityEntryFlow';

function UnityIntroPage({
  theme,
  question,
  setQuestion,
  onStart,
  onResume,
  hasDraft,
  onOpenResult,
  hasSavedResult,
  goHome,
  t,
}) {
  const canContinue = canStartUnityCasting(question);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canContinue) return;
    onStart(normalizeUnityQuestion(question));
  };

  return (
    <div className={`screen-shell page-shell archive-page unity-intro-page theme-${theme}`}>
      <header className="page-header">
        <button type="button" onClick={goHome} className="icon-button" aria-label={t('unity.backHome')}>
          <X className="w-5 h-5" />
        </button>
        <h1 className="page-title">{t('unity.title')}</h1>
        <div className="page-header-controls"><LanguageSwitcher /></div>
      </header>

      <main className="unity-intro-main">
        <section className="unity-celestial-intro" aria-labelledby="unity-intro-title">
          <div className="unity-orbit-system" aria-hidden="true">
            <span className="unity-orbit unity-orbit-one" />
            <span className="unity-orbit unity-orbit-two" />
            <span className="unity-orbit unity-orbit-three" />
            <span className="unity-solar-seal">☉</span>
            <span className="unity-coordinate">CELESTIAL ARCHIVE · XVIII</span>
          </div>
          <p className="unity-archive-kicker">{t('unity.archiveKicker')}</p>
          <h2 id="unity-intro-title">{t('unity.title')}</h2>
          <p className="unity-english-title">{t('unity.englishTitle')}</p>
          <blockquote>
            <span>{t('unity.worldviewLineOne')}</span>
            <span>{t('unity.worldviewLineTwo')}</span>
          </blockquote>
          <p className="unity-intro-description">{t('unity.descriptionLineOne')}<br />{t('unity.descriptionLineTwo')}</p>
        </section>

        <form className="unity-question-manuscript" onSubmit={handleSubmit}>
          <span className="archive-paper-index">01</span>
          <p className="eyebrow">{t('unity.questionEyebrow')}</p>
          <h3>{t('unity.questionTitle')}</h3>
          <p id="unity-question-guidance">{t('unity.questionGuidance')}</p>
          <label className="sr-only" htmlFor="unity-question">{t('unity.questionLabel')}</label>
          <textarea
            id="unity-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={t('unity.questionPlaceholder')}
            aria-describedby="unity-question-guidance unity-question-count"
            rows={6}
            autoFocus
          />
          <span id="unity-question-count" className="unity-question-count" aria-live="polite">
            {t('unity.characterCount', { count: question.length })}
          </span>
          <button type="submit" className="sun-button unity-start-button" disabled={!canContinue}>
            <span>{canContinue ? t('unity.startCasting') : t('unity.missingQuestion')}</span>
            <ArrowRight aria-hidden="true" />
          </button>
          {hasDraft ? (
            <button type="button" className="unity-resume-button" onClick={onResume}>
              {t('unity.resumeCasting')}
            </button>
          ) : null}
          {hasSavedResult ? (
            <button type="button" className="unity-resume-button unity-open-result-button" onClick={onOpenResult}>
              {t('unity.openSavedResult')}
            </button>
          ) : null}
        </form>
      </main>
    </div>
  );
}

export default UnityIntroPage;
