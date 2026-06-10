import TarotCard from '../TarotCard';

function SpreadCards({
  cards,
  spread,
  cardStyle,
  isRevealed,
  showOrientation = false,
  rotateReversed = true,
  className = '',
  t,
}) {
  const cardSize = spread.key === 'choice' ? 'small' : 'normal';

  return (
    <section className={`reading-spread reading-spread-${spread.key} ${className}`.trim()}>
      {cards.map((card, index) => {
        const position = spread.positions[index];

        return (
          <div key={`${spread.key}-${card.id}-${index}`} className={`reading-spread-slot reading-spread-slot-${spread.key}-${index + 1}`}>
            <TarotCard
              card={card}
              isRevealed={isRevealed}
              size={cardSize}
              showOrientation={showOrientation}
              variant={cardStyle}
              rotateReversed={rotateReversed}
            />
            {cardStyle === 'artwork' && isRevealed ? <p className="reading-spread-card-name">{card.name}</p> : null}
            <div className="reading-spread-meta">
              <p className="reading-spread-label">{position?.title || t('drawing.spreadLabelFallback', { index: index + 1 })}</p>
              {position?.subtitle ? <p className="reading-spread-subtitle">{position.subtitle}</p> : null}
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default SpreadCards;
