function ReadingCardSection({ section, t }) {
  const orientationLabel = section.orientation === 'reversed'
    ? t('common.orientationReversed')
    : t('common.orientationUpright');

  return (
    <article className="reading-card-file archive-reading-sheet">
      <header className="reading-card-file-header">
        <span className="reading-card-position-number">{String(section.positionIndex).padStart(2, '0')}</span>
        <div>
          <p className="eyebrow">{section.positionSubtitle || t('reading.positionFallback')}</p>
          <h3>{section.positionTitle}</h3>
        </div>
      </header>
      <div className="reading-card-name-row">
        <div>
          <strong>{section.cardName}</strong>
          {section.englishName ? <small>{section.englishName}</small> : null}
        </div>
        <span>{orientationLabel}</span>
      </div>
      <div className="reading-keyword-tags" aria-label={t('reading.keywordsLabel')}>
        {section.keywords.map((keyword) => <span key={`${section.cardId}-${keyword}`}>{keyword}</span>)}
      </div>
      <div className="reading-card-copy">
        <p>{section.positionResponsibility}</p>
        <p>{section.orientationMeaning}</p>
        <p className="reading-card-base-meaning">{section.baseMeaning}</p>
        <p>{section.contextualMeaning}</p>
        <p className="reading-card-attention">{section.attention}</p>
        <p className="reading-card-boundary">{section.boundary}</p>
      </div>
    </article>
  );
}

export default ReadingCardSection;
