import { useEffect, useRef } from 'react';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { BookOpen, Check, Eye, SkipForward, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import CardStyleToggle from './CardStyleToggle';
import SpreadCards from './SpreadCards';

const SHUFFLE_DURATION_MS = 950;

function CardDrawStage({
  theme,
  cardStyle,
  setCardStyle,
  goHome,
  spread,
  session,
  choiceOptions,
  getCardKeywords,
  onShuffleComplete,
  onToggleBack,
  onConfirmSelection,
  onRevealCard,
  onRevealAll,
  onOpenReading,
  t,
}) {
  const shouldReduceMotion = useReducedMotion();
  const completeShuffleRef = useRef(onShuffleComplete);
  completeShuffleRef.current = onShuffleComplete;

  useEffect(() => {
    if (session.phase !== 'shuffling') return undefined;
    if (shouldReduceMotion) {
      completeShuffleRef.current();
      return undefined;
    }

    const timer = window.setTimeout(() => completeShuffleRef.current(), SHUFFLE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [session.phase, shouldReduceMotion]);

  const selectionComplete = session.selectedBacks.length === session.cardCount;
  const remainingCount = Math.max(0, session.cardCount - session.selectedBacks.length);

  return (
    <div className={`screen-shell page-shell archive-page card-draw-page theme-${theme}`}>
      <header className="page-header">
        <button type="button" onClick={goHome} className="icon-button" aria-label={t('drawing.backHome')}>
          <X className="w-5 h-5" />
        </button>
        <h1 className="page-title">{spread.name}</h1>
        <div className="page-header-controls">
          <LanguageSwitcher />
          <CardStyleToggle cardStyle={cardStyle} onChange={setCardStyle} t={t} />
        </div>
      </header>

      <main className="page-content card-draw-content">
        <LazyMotion features={domAnimation}>
          {session.phase === 'shuffling' ? (
            <m.section
              key="shuffling"
              className="card-draw-stage card-shuffle-stage"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              aria-labelledby="shuffle-stage-title"
            >
              <p className="eyebrow">{t('drawing.shuffleEyebrow')}</p>
              <h2 id="shuffle-stage-title">{t('drawing.shuffleTitle')}</h2>
              <p>{t('drawing.shuffleDescription')}</p>
              <div className="shuffle-deck" aria-hidden="true">
                {Array.from({ length: 6 }, (_, index) => (
                  <m.span
                    key={`shuffle-card-${index}`}
                    className="shuffle-card-back"
                    initial={{ x: (index - 2.5) * 22, y: Math.abs(index - 2.5) * 5, rotate: (index - 2.5) * 4 }}
                    animate={{ x: (index - 2.5) * 2, y: index * -1.5, rotate: (index - 2.5) * 0.7 }}
                    transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
                  />
                ))}
                <span className="shuffle-deck-sigil">☉</span>
              </div>
              <button type="button" className="secondary-button card-draw-skip" onClick={onShuffleComplete}>
                <SkipForward className="w-4 h-4" />
                {t('drawing.skipShuffle')}
              </button>
            </m.section>
          ) : null}

          {session.phase === 'selecting' ? (
            <m.section
              key="selecting"
              className="card-draw-stage card-selection-stage"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              aria-labelledby="selection-stage-title"
            >
              <p className="eyebrow">{t('drawing.selectionEyebrow')}</p>
              <h2 id="selection-stage-title">{t('drawing.selectionTitle', { count: session.cardCount })}</h2>
              <p>{t('drawing.selectionDescription')}</p>
              <p className="card-selection-progress" aria-live="polite">
                {t('drawing.selectionProgress', {
                  selected: session.selectedBacks.length,
                  total: session.cardCount,
                  remaining: remainingCount,
                })}
              </p>

              <div className="card-back-rail" role="group" aria-label={t('drawing.cardBackGroupLabel')}>
                {session.visibleBacks.map((backIndex, index) => {
                  const selectedOrder = session.selectedBacks.indexOf(backIndex);
                  const isSelected = selectedOrder !== -1;
                  return (
                    <m.button
                      key={`selectable-back-${backIndex}`}
                      type="button"
                      className={`selectable-card-back ${isSelected ? 'is-selected' : ''}`}
                      aria-pressed={isSelected}
                      aria-label={t('drawing.cardBackAria', {
                        index: index + 1,
                        state: isSelected ? t('drawing.selectedState') : t('drawing.unselectedState'),
                        remaining: remainingCount,
                      })}
                      onClick={() => onToggleBack(backIndex)}
                      animate={{ y: isSelected ? -14 : 0, rotate: (index - 5.5) * 0.75 }}
                      whileHover={shouldReduceMotion ? undefined : { y: isSelected ? -16 : -7 }}
                      whileFocus={{ y: isSelected ? -16 : -7 }}
                    >
                      <span className="selectable-card-index">{String(index + 1).padStart(2, '0')}</span>
                      <span className="selectable-card-sigil" aria-hidden="true">☉</span>
                      {isSelected ? (
                        <span className="selectable-card-order" aria-hidden="true">
                          <Check className="w-3 h-3" />
                          {selectedOrder + 1}
                        </span>
                      ) : null}
                    </m.button>
                  );
                })}
              </div>

              <button
                type="button"
                className="primary-button card-selection-confirm"
                disabled={!selectionComplete}
                onClick={onConfirmSelection}
              >
                {selectionComplete
                  ? t('drawing.confirmSelectedCards')
                  : t('drawing.selectRemainingCards', { count: remainingCount })}
              </button>
            </m.section>
          ) : null}

          {session.phase === 'revealing' ? (
            <m.section
              key="revealing"
              className="card-draw-stage card-reveal-stage"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              aria-labelledby="reveal-stage-title"
            >
              <p className="eyebrow">{t('drawing.revealEyebrow')}</p>
              <h2 id="reveal-stage-title">{t('drawing.revealTitle')}</h2>
              <p>{session.allRevealed ? t('drawing.revealComplete') : t('drawing.revealDescription')}</p>
              <SpreadCards
                cards={session.drawnCards}
                spread={spread}
                cardStyle={cardStyle}
                isRevealed={false}
                revealedIndexes={session.revealedCards}
                onRevealCard={onRevealCard}
                getCardKeywords={getCardKeywords}
                choiceOptions={choiceOptions}
                showOrientation
                t={t}
                className="card-draw-reveal-spread"
              />
              <div className="card-reveal-actions">
                {!session.allRevealed ? (
                  <button type="button" className="secondary-button" onClick={onRevealAll}>
                    <Eye className="w-4 h-4" />
                    {t('drawing.revealAll')}
                  </button>
                ) : null}
                <button type="button" className="primary-button" disabled={!session.allRevealed} onClick={onOpenReading}>
                  <BookOpen className="w-4 h-4" />
                  {t('drawing.viewFullReading')}
                </button>
              </div>
            </m.section>
          ) : null}
        </LazyMotion>
      </main>
    </div>
  );
}

export default CardDrawStage;
