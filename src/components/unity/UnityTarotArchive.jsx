import { useEffect, useRef, useState } from 'react';
import TarotCard from '../../TarotCard';

function UnityTarotArchive({ rounds, language, t }) {
  const archiveRef = useRef(null);
  const [openCardKey, setOpenCardKey] = useState(null);
  const [nameArchive, setNameArchive] = useState(null);
  const visualRounds = [...rounds].reverse();
  const lineLabels = t('unity.lineLabels');

  useEffect(() => {
    let active = true;
    import('../../cardMeanings.js').then((module) => {
      if (active) setNameArchive(module);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!openCardKey) return undefined;
    const closeOutside = (event) => {
      if (!archiveRef.current?.contains(event.target)) setOpenCardKey(null);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [openCardKey]);

  const getLocalizedCardName = (card) => {
    if (language === 'zh-CN') return card.name;
    if (!nameArchive) return card.englishName || card.name;
    const localizedCard = nameArchive.getLocalizedMeaningCard(
      nameArchive.findTarotMeaningCard({ id: card.cardId }),
      language,
    );
    return localizedCard?.displayName || card.englishName || card.name;
  };

  return (
    <section ref={archiveRef} className="unity-result-tarot-panel" aria-labelledby="unity-image-panel-title">
      <div className="unity-result-section-head">
        <span>01</span>
        <div>
          <p>{t('unity.imagePanelKicker')}</p>
          <h2 id="unity-image-panel-title">{t('unity.imagePanelTitle')}</h2>
        </div>
      </div>
      <div className="unity-result-tarot-grid">
        {visualRounds.map((round) => {
          const lineLabel = lineLabels[round.lineIndex - 1];
          return (
            <article key={round.roundIndex} className="unity-result-round-record">
              <header className="unity-result-round-head">
                <span>{String(round.lineIndex).padStart(2, '0')}</span>
                <h3>{lineLabel}</h3>
              </header>
              <div className="unity-result-round-cards">
                {round.tarotCards.map((card, cardIndex) => {
                  const cardKey = `${round.lineIndex}-${card.drawIndex}`;
                  const isOpen = openCardKey === cardKey;
                  const popoverId = `unity-card-meta-${round.lineIndex}-${card.drawIndex}`;
                  return (
                    <button
                      key={card.cardId}
                      type="button"
                      className={`unity-result-card-trigger${isOpen ? ' is-open' : ''}`}
                      aria-expanded={isOpen}
                      aria-controls={popoverId}
                      aria-label={t('unity.cardMetadataLabel', { line: lineLabel, card: cardIndex + 1 })}
                      onClick={() => setOpenCardKey((current) => current === cardKey ? null : cardKey)}
                    >
                      <TarotCard
                        card={{ id: card.cardId, name: card.name, englishName: card.englishName, isReversed: card.isReversed }}
                        isRevealed
                        size="small"
                        showOrientation={false}
                      />
                      <span id={popoverId} className="unity-card-popover" role="status">
                        <small>{lineLabel} · {t('unity.cardPosition', { index: cardIndex + 1 })}</small>
                        <strong>{getLocalizedCardName(card)}</strong>
                        <span>{card.isReversed ? t('common.orientationReversed') : t('common.orientationUpright')}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default UnityTarotArchive;
