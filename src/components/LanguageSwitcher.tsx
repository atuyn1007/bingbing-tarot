import { useI18n } from '../i18n';

const LANGUAGE_OPTIONS = [
  { code: 'zh-CN', labelKey: 'switcher.zh' },
  { code: 'en', labelKey: 'switcher.en' },
  { code: 'it', labelKey: 'switcher.it' },
] as const;

function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="language-switcher" aria-label={t('switcher.label')}>
      {LANGUAGE_OPTIONS.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => setLanguage(option.code)}
          className={`language-switcher-button ${language === option.code ? 'language-switcher-button-active' : ''}`}
        >
          {t(option.labelKey)}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
