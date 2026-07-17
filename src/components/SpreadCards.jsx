import TarotCard from '../TarotCard';
import { getChoiceDisplayGroups } from '../choiceSpreadUtils';

function SpreadCards({
  cards,
  spread,
  cardStyle,
  isRevealed,
  showOrientation = false,
  rotateReversed = true,
  className = '',
  choiceOptions,
  t,
}) {
  const cardSize = spread.key === 'choice' ? 'small' : 'normal';
  const renderCardSlot = (card, index, choicePositionTitle = null) => {
    const position = spread.positions[index];

    return (
      <div
        key={`${spread.key}-${card.id}-${index}`}
        className={`reading-spread-slot ${spread.key === 'choice' ? 'reading-spread-slot-choice-card' : `reading-spread-slot-${spread.key}-${index + 1}`}`}
      >
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
          <p className="reading-spread-label">
            {choicePositionTitle || position?.title || t('drawing.spreadLabelFallback', { index: index + 1 })}
          </p>
          {!choicePositionTitle && position?.subtitle ? <p className="reading-spread-subtitle">{position.subtitle}</p> : null}
        </div>
      </div>
    );
  };

  if (spread.key === 'choice') {
    const groups = getChoiceDisplayGroups(
      cards,
      choiceOptions?.choiceA,
      choiceOptions?.choiceB,
      t('drawing.choiceOptionAFallback'),
      t('drawing.choiceOptionBFallback'),
      t('drawing.choiceSelfLabel'),
    );

    return (
      <section className={`reading-spread reading-spread-choice ${className}`.trim()}>
        {groups.map((group) => (
          <section key={group.key} className={`choice-spread-group choice-spread-group-${group.key}`}>
            <h2 className="choice-spread-group-title">{group.label}</h2>
            <div className="choice-spread-group-cards">
              {group.cardIndexes.map((cardIndex) => {
                const card = cards[cardIndex];
                if (!card) return null;

                const choicePositionTitle =
                  cardIndex === 2 || cardIndex === 3
                    ? t('drawing.choiceFutureLabel')
                    : cardIndex === 0 || cardIndex === 1
                      ? t('drawing.choiceCurrentLabel')
                      : null;

                return renderCardSlot(card, cardIndex, choicePositionTitle);
              })}
            </div>
          </section>
        ))}
      </section>
    );
  }

  return (
    <section className={`reading-spread reading-spread-${spread.key} ${className}`.trim()}>
      {cards.map((card, index) => renderCardSlot(card, index))}
    </section>
  );
}

export default SpreadCards;
