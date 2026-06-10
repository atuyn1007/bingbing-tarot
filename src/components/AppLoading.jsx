import { useI18n } from '../i18n';

function AppLoading({ theme = 'aurora' }) {
  const { t } = useI18n();

  return (
    <div className={`screen-shell page-shell theme-${theme}`}>
      <div className="orb orb-left" />
      <div className="orb orb-right" />
      <main className="page-content">
        <div className="question-panel">
          <p className="eyebrow">{t('common.loading')}</p>
        </div>
      </main>
    </div>
  );
}

export default AppLoading;
