import TarotCard from '../TarotCard';
import { getChoiceDisplayGroups, getChoiceGroupSlots } from '../choiceSpreadUtils';
import { getCardDisplayNames } from '../data';

function SpreadCards({
  cards,
  spread,
  cardStyle,
  isRevealed,
  revealedIndexes,
  onRevealCard,
  getCardKeywords,
  showOrientation = false,
  rotateReversed = true,
  className = '',
  choiceOptions,
  t,
}) {
  const cardSize = spread.key === 'choice' ? 'small' : 'normal';
  const renderCardSlot = (card, index) => {
    const position = spread.positions[index];
    const isCardRevealed = Array.isArray(revealedIndexes) ? revealedIndexes.includes(index) : Boolean(isRevealed);
    const positionTitle = position?.title || t('drawing.spreadLabelFallback', { index: index + 1 });
    const { chineseName, englishName } = getCardDisplayNames(card);
    const keywords = isCardRevealed ? (getCardKeywords?.(card) || []).slice(0, 4) : [];
    const cardFace = (
      <TarotCard
        card={card}
        isRevealed={isCardRevealed}
        size={cardSize}
        showOrientation={showOrientation}
        variant={cardStyle}
        rotateReversed={rotateReversed}
      />
    );

    return (
      <div
        key={`${spread.key}-${card.id}-${index}`}
        className={`reading-spread-slot ${spread.key === 'choice' ? 'reading-spread-slot-choice-card' : `reading-spread-slot-${spread.key}-${index + 1}`}`}
      >
        {onRevealCard ? (
          <button
            type="button"
            className="reading-spread-reveal-button"
            onClick={() => onRevealCard(index)}
            disabled={isCardRevealed}
            aria-label={isCardRevealed
              ? t('drawing.cardRevealedAria', { index: index + 1, card: chineseName })
              : t('drawing.revealCardAria', { index: index + 1, position: positionTitle })}
          >
            {cardFace}
          </button>
        ) : cardFace}
        {isCardRevealed ? (
          <div className="reading-spread-card-identity">
            <p className="reading-spread-card-name">{chineseName}</p>
            <small>{englishName}</small>
            <span>{card.isReversed ? t('common.orientationReversed') : t('common.orientationUpright')}</span>
          </div>
        ) : null}
        <div className="reading-spread-meta">
          <p className="reading-spread-label">
            {positionTitle}
          </p>
          {position?.subtitle ? <p className="reading-spread-subtitle">{position.subtitle}</p> : null}
          {keywords.length > 0 ? (
            <div className="reading-spread-keywords" aria-label={t('reading.keywordsLabel')}>
              {keywords.map((keyword) => <span key={`${card.id}-${keyword}`}>{keyword}</span>)}
            </div>
          ) : null}
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
              {getChoiceGroupSlots(cards, spread.positions, group.cardIndexes)
                .map(({ card, cardIndex }) => renderCardSlot(card, cardIndex))}
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
