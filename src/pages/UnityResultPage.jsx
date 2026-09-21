import { Archive, ArrowLeft, X } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UnityHexagramSection from '../components/unity/UnityHexagramSection';
import UnityTarotArchive from '../components/unity/UnityTarotArchive';
import UnitySupplement from '../components/unity/UnitySupplement';
import { useI18n } from '../i18n';

function UnityResultPage({ theme, archive, historyEntry, locale, goHome, onOpenHistory, t }) {
  const { language } = useI18n();
  const calculation = archive.calculation;
  const knowledge = archive.knowledgeByLocale[language] || archive.knowledgeByLocale['zh-CN'];
  const historyDate = historyEntry ? new Date(historyEntry.createdAt) : null;
  const historyDateLabel = historyDate
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(historyDate)
    : '';
  const historyTimeLabel = historyDate
    ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(historyDate)
    : '';

  return (
    <div className={`screen-shell page-shell archive-page unity-result-page theme-${theme}`}>
      <header className="page-header">
        <button type="button" onClick={goHome} className="icon-button" aria-label={t('unity.backHome')}>
          <X className="w-5 h-5" />
        </button>
        <h1 className="page-title">{t('unity.resultTitle')}</h1>
        <div className="page-header-controls">
          <button type="button" className="unity-history-link" onClick={onOpenHistory}>
            {historyEntry ? <ArrowLeft aria-hidden="true" /> : <Archive aria-hidden="true" />}
            <span>{historyEntry ? t('unityHistory.backToArchive') : t('unityHistory.openHistory')}</span>
          </button>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="unity-result-main">
        {historyEntry ? (
          <section className="unity-history-detail-masthead" aria-label={t('unityHistory.openDetail')}>
            <div className="unity-history-detail-code" aria-hidden="true">
              <span>ARC. {historyEntry.createdAt.slice(0, 10)}</span>
              <span>REC. {historyEntry.id.slice(-6).toUpperCase()}</span>
            </div>
            <dl>
              <div><dt>{t('unityHistory.detailDate')}</dt><dd>{historyDateLabel}</dd></div>
              <div><dt>{t('unityHistory.detailTime')}</dt><dd>{historyTimeLabel}</dd></div>
              <div><dt>{t('unityHistory.detailSpread')}</dt><dd>{t('unityHistory.spreadName')}</dd></div>
              <div><dt>{t('unityHistory.detailVersion')}</dt><dd>{t('unityHistory.versionLabel', { version: historyEntry.version })}</dd></div>
            </dl>
            <div className="unity-history-detail-question">
              <span>{t('unityHistory.detailQuestion')}</span>
              <blockquote>{historyEntry.question}</blockquote>
            </div>
          </section>
        ) : null}
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
            <UnityHexagramSection kind="primary" knowledge={knowledge.primary} t={t} showText={false} />
            {knowledge.changed ? (
              <div className="unity-changed-hexagram-wrap">
                <div className="unity-change-direction" aria-hidden="true"><span>↓</span></div>
                <UnityHexagramSection kind="changed" knowledge={knowledge.changed} t={t} showText={false} />
              </div>
            ) : null}
            <UnitySupplement calculation={calculation} language={language} t={t} />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default UnityResultPage;
