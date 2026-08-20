function HexagramGlyph({ pattern, label }) {
  return (
    <div className="unity-result-hexagram-glyph" role="img" aria-label={label}>
      {[...pattern].reverse().map((polarity, index) => (
        <span key={`${polarity}-${index}`} className={`unity-result-line is-${polarity}`} aria-hidden="true" />
      ))}
    </div>
  );
}

function UnityHexagramSection({ kind, knowledge, t }) {
  const names = t('unity.hexagramNames');
  const trigramNames = t('unity.trigramNames');
  const structure = knowledge.structure;
  const name = names[structure.kingWenNumber - 1];
  const title = kind === 'changed' ? t('unity.changedHexagram') : t('unity.primaryHexagram');

  return (
    <section className={`unity-hexagram-section is-${kind}`} aria-labelledby={`unity-${kind}-hexagram-title`}>
      <header className="unity-hexagram-heading">
        <div>
          <p>{title}</p>
          <h3 id={`unity-${kind}-hexagram-title`}>{name}</h3>
          <span>{t('unity.hexagramNumber', { number: structure.kingWenNumber })}</span>
        </div>
        <span className="unity-hexagram-unicode" aria-hidden="true">{structure.unicode}</span>
      </header>
      <div className="unity-hexagram-figure">
        <HexagramGlyph pattern={structure.linePatternBottomToTop} label={t('unity.hexagramGlyphLabel', { number: structure.kingWenNumber, name })} />
        <dl className="unity-trigram-pair">
          <div><dt>{t('unity.upperTrigram')}</dt><dd>{trigramNames[structure.upperTrigramId]}</dd></div>
          <div><dt>{t('unity.lowerTrigram')}</dt><dd>{trigramNames[structure.lowerTrigramId]}</dd></div>
        </dl>
      </div>
      <section className="unity-canonical-text">
        <h4>{t('unity.canonicalText')}</h4>
        <blockquote>{knowledge.canonical?.originalText || t('unity.knowledgeUnavailable')}</blockquote>
      </section>
      <section className="unity-modern-summary">
        <h4>{t('unity.modernSummary')}</h4>
        <p>{knowledge.modern?.summary || t('unity.knowledgeUnavailable')}</p>
      </section>
      {knowledge.keywords.length ? (
        <section className="unity-hexagram-keywords" aria-label={t('unity.keywords')}>
          <h4>{t('unity.keywords')}</h4>
          <div>{knowledge.keywords.map((keyword) => <span key={keyword.keywordId}>{keyword.label}</span>)}</div>
        </section>
      ) : null}
    </section>
  );
}

export default UnityHexagramSection;
