function ThemeToggle({ theme, onChange, t, extraClassName = '' }) {
  return (
    <div className={`theme-toggle ${extraClassName}`.trim()}>
      <button
        type="button"
        onClick={() => onChange('aurora')}
        className={`theme-toggle-button ${theme === 'aurora' ? 'theme-toggle-button-active' : ''}`}
        aria-label={t('theme.auroraAria')}
        title={t('theme.auroraTitle')}
      >
        <span className="theme-toggle-swatch theme-toggle-swatch-aurora" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => onChange('noir')}
        className={`theme-toggle-button ${theme === 'noir' ? 'theme-toggle-button-active' : ''}`}
        aria-label={t('theme.noirAria')}
        title={t('theme.noirTitle')}
      >
        <span className="theme-toggle-swatch theme-toggle-swatch-noir" aria-hidden="true" />
      </button>
    </div>
  );
}

export default ThemeToggle;
