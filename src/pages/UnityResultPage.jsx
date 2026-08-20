import { Archive, X } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UnityHexagramSection from '../components/unity/UnityHexagramSection';
import UnityMovingLinesSection from '../components/unity/UnityMovingLinesSection';
import UnityTarotArchive from '../components/unity/UnityTarotArchive';
import { useI18n } from '../i18n';

function UnityResultPage({ theme, archive, goHome, onOpenHistory, t }) {
  const { language } = useI18n();
  const calculation = archive.calculation;
  const knowledge = archive.knowledgeByLocale[language] || archive.knowledgeByLocale['zh-CN'];

  return (
    <div className={`screen-shell page-shell archive-page unity-result-page theme-${theme}`}>
      <header className="page-header">
        <button type="button" onClick={goHome} className="icon-button" aria-label={t('unity.backHome')}>
          <X className="w-5 h-5" />
        </button>
        <h1 className="page-title">{t('unity.resultTitle')}</h1>
        <div className="page-header-controls">
          <button type="button" className="unity-history-link" onClick={onOpenHistory}>
            <Archive aria-hidden="true" />
            <span>{t('unityHistory.openHistory')}</span>
          </button>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="unity-result-main">
        <section className="unity-result-question">
          <p>{t('unity.resultArchiveLabel')}</p>
          <blockquote>{calculation.question}</blockquote>
        </section>

        <div className="unity-result-layout">
          <UnityTarotArchive rounds={calculation.rounds} language={language} t={t} />
          <aside className="unity-result-reading-panel" aria-labelledby="unity-reading-panel-title">
            <div className="unity-result-section-head">
              <span>02</span>
              <div>
                <p>{t('unity.readingPanelKicker')}</p>
                <h2 id="unity-reading-panel-title">{t('unity.readingPanelTitle')}</h2>
              </div>
            </div>
            <UnityHexagramSection kind="primary" knowledge={knowledge.primary} t={t} />
            <UnityMovingLinesSection lines={knowledge.movingLines} t={t} />
            {knowledge.changed ? (
              <div className="unity-changed-hexagram-wrap">
                <div className="unity-change-direction" aria-hidden="true"><span>↓</span></div>
                <p className="unity-changed-help">{t('unity.changedHexagramHelp')}</p>
                <UnityHexagramSection kind="changed" knowledge={knowledge.changed} t={t} />
              </div>
            ) : null}
          </aside>
        </div>
      </main>
    </div>
  );
}

export default UnityResultPage;
