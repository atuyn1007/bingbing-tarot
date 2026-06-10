function CardStyleToggle({ cardStyle, onChange, t, extraClassName = '' }) {
  return (
    <div className={`card-style-toggle ${extraClassName}`.trim()}>
      <button
        type="button"
        onClick={() => onChange('minimal')}
        className={`card-style-button ${cardStyle === 'minimal' ? 'card-style-button-active' : ''}`}
      >
        {t('cardStyle.minimal')}
      </button>
      <button
        type="button"
        onClick={() => onChange('artwork')}
        className={`card-style-button ${cardStyle === 'artwork' ? 'card-style-button-active' : ''}`}
      >
        {t('cardStyle.artwork')}
      </button>
    </div>
  );
}

export default CardStyleToggle;
