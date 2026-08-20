function UnityMovingLinesSection({ lines, t }) {
  const lineLabels = t('unity.lineLabels');
  const polarityLabels = t('unity.polarityLabels');
  const lineTypeLabels = t('unity.lineTypeLabels');

  if (!lines.length) {
    return (
      <section className="unity-moving-lines-section is-stable">
        <p className="unity-section-label">{t('unity.noMovingLinesTitle')}</p>
        <p>{t('unity.noMovingLinesDescription')}</p>
      </section>
    );
  }

  return (
    <section className="unity-moving-lines-section" aria-labelledby="unity-moving-lines-title">
      <header>
        <p className="unity-section-label">{t('unity.movingLines')}</p>
        <h3 id="unity-moving-lines-title">{lines.map((line) => lineLabels[line.lineIndex - 1]).join(' · ')}</h3>
      </header>
      <div className="unity-moving-lines-list">
        {lines.map((line) => (
          <article key={line.lineId} className="unity-moving-line-record is-moving">
            <div className="unity-moving-line-heading">
              <h4>{lineLabels[line.lineIndex - 1]}</h4>
              <p><span>{polarityLabels[line.polarity]}</span><span>{lineTypeLabels[line.lineType]}</span></p>
            </div>
            <section className="unity-canonical-text">
              <h5>{t('unity.canonicalText')}</h5>
              <blockquote>{line.canonical?.originalText || t('unity.knowledgeUnavailable')}</blockquote>
            </section>
            <section className="unity-modern-summary">
              <h5>{t('unity.modernSummary')}</h5>
              <p>{line.modern?.summary || t('unity.knowledgeUnavailable')}</p>
            </section>
          </article>
        ))}
      </div>
    </section>
  );
}

export default UnityMovingLinesSection;
