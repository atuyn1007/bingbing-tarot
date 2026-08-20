import { useEffect, useRef, useState } from 'react';
import {
  LazyMotion,
  domMax,
  m,
  useReducedMotion,
} from 'framer-motion';
import { BookOpen, Eye, SkipForward, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import SpreadCards from './SpreadCards';
import TarotCardSelector from './TarotCardSelector';
import { getShuffleRitualTimeline } from '../shuffleRitual';

const SHUFFLE_CARD_COUNT = 15;
const SHUFFLE_PHASE_COPY = {
  riffle: 'drawing.shufflePhaseRiffle',
  cut: 'drawing.shufflePhaseCut',
  gather: 'drawing.shufflePhaseGather',
};

function getShuffleCardTarget(index, phase, reducedMotion) {
  const centeredIndex = index - ((SHUFFLE_CARD_COUNT - 1) / 2);

  if (reducedMotion) {
    return {
      x: centeredIndex * 1.2,
      y: index * -0.75,
      rotate: centeredIndex * 0.15,
      transition: { duration: 0.36, ease: 'easeOut' },
    };
  }

  if (phase === 'riffle') {
    const side = index % 2 === 0 ? -1 : 1;
    const spread = side * (76 + ((index % 4) * 9));
    return {
      x: [centeredIndex * 3, spread, side * 13, centeredIndex * 1.4],
      y: [Math.abs(centeredIndex) * 2, 14 + ((index % 3) * 5), -5 - ((index % 4) * 2), index * -0.8],
      rotate: [centeredIndex * 1.4, side * (7 + (index % 3)), side * -2, centeredIndex * 0.22],
      transition: {
        duration: 1.22,
        delay: (index % 6) * 0.025,
        times: [0, 0.38, 0.72, 1],
        ease: [0.22, 1, 0.36, 1],
      },
    };
  }

  if (phase === 'cut') {
    const pile = (index % 3) - 1;
    return {
      x: pile * 76,
      y: ((index % 5) * -1.2) + (pile === 0 ? -15 : 9),
      rotate: pile * 4.5,
      transition: { duration: 0.82, ease: [0.22, 1, 0.36, 1] },
    };
  }

  return {
    x: centeredIndex * 1.15,
    y: index * -0.82,
    rotate: centeredIndex * 0.12,
    transition: { duration: 0.86, ease: [0.22, 1, 0.36, 1] },
  };
}

function CardDrawStage({
  theme,
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
  const [shufflePhase, setShufflePhase] = useState('riffle');
  completeShuffleRef.current = onShuffleComplete;

  useEffect(() => {
    if (session.phase !== 'shuffling') return undefined;
    const timeline = getShuffleRitualTimeline(shouldReduceMotion);
    setShufflePhase(timeline.steps[0].phase);

    const timers = timeline.steps.slice(1).map((step) => window.setTimeout(() => {
      if (step.phase === 'complete') {
        completeShuffleRef.current();
      } else {
        setShufflePhase(step.phase);
      }
    }, step.at));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [session.phase, shouldReduceMotion]);

  return (
    <div className={`screen-shell page-shell archive-page card-draw-page theme-${theme}`}>
      <header className="page-header">
        <button type="button" onClick={goHome} className="icon-button" aria-label={t('drawing.backHome')}>
          <X className="w-5 h-5" />
        </button>
        <h1 className="page-title">{spread.name}</h1>
        <div className="page-header-controls">
          <LanguageSwitcher />
        </div>
      </header>

      <main className="page-content card-draw-content">
        <LazyMotion features={domMax}>
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
              <p className="shuffle-phase-label" aria-live="polite">
                <span aria-hidden="true">{String(['riffle', 'cut', 'gather'].indexOf(shufflePhase) + 1).padStart(2, '0')}</span>
                {t(SHUFFLE_PHASE_COPY[shufflePhase] || SHUFFLE_PHASE_COPY.gather)}
              </p>
              <div className={`shuffle-deck shuffle-deck-${shufflePhase}`} aria-hidden="true">
                {Array.from({ length: SHUFFLE_CARD_COUNT }, (_, index) => (
                  <m.span
                    key={`shuffle-card-${index}`}
                    className="shuffle-card-back"
                    initial={false}
                    animate={getShuffleCardTarget(index, shufflePhase, shouldReduceMotion)}
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
              <TarotCardSelector
                visibleBacks={session.visibleBacks}
                selectedBacks={session.selectedBacks}
                cardCount={session.cardCount}
                onToggleBack={onToggleBack}
                onConfirmSelection={onConfirmSelection}
                shouldReduceMotion={shouldReduceMotion}
                t={t}
              />
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
