import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  animate,
  LazyMotion,
  domMax,
  m,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion';
import { BookOpen, Check, Eye, MoveHorizontal, SkipForward, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import CardStyleToggle from './CardStyleToggle';
import SpreadCards from './SpreadCards';
import { clampRibbonOffset, getRibbonBounds, getWheelRibbonOffset } from '../cardRibbon';
import { getShuffleRitualTimeline } from '../shuffleRitual';

const RIBBON_EDGE_INSET = 24;
const RIBBON_DRAG_THRESHOLD = 6;
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

function getCardRibbonPose(index) {
  return {
    y: ((index % 5) - 2) * 2.2,
    rotate: ((index % 7) - 3) * 0.62,
  };
}

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
  const ribbonViewportRef = useRef(null);
  const ribbonTrackRef = useRef(null);
  const ribbonBoundsRef = useRef({ min: 0, max: 0 });
  const wheelAnimationRef = useRef(null);
  const wheelTargetRef = useRef(0);
  const didDragRef = useRef(false);
  const hasMeasuredRibbonRef = useRef(false);
  const ribbonX = useMotionValue(0);
  const [shufflePhase, setShufflePhase] = useState('riffle');
  const [ribbonBounds, setRibbonBounds] = useState({ min: 0, max: 0 });
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

  useLayoutEffect(() => {
    if (session.phase !== 'selecting') return undefined;
    const viewport = ribbonViewportRef.current;
    const track = ribbonTrackRef.current;
    if (!viewport || !track) return undefined;

    const measureRibbon = () => {
      const nextBounds = getRibbonBounds(viewport.clientWidth, track.scrollWidth, RIBBON_EDGE_INSET);
      ribbonBoundsRef.current = nextBounds;
      setRibbonBounds(nextBounds);

      const nextX = hasMeasuredRibbonRef.current
        ? clampRibbonOffset(ribbonX.get(), nextBounds)
        : nextBounds.max;
      hasMeasuredRibbonRef.current = true;
      wheelTargetRef.current = nextX;
      ribbonX.set(nextX);
    };

    measureRibbon();
    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(measureRibbon);
    resizeObserver?.observe(viewport);
    resizeObserver?.observe(track);

    return () => {
      resizeObserver?.disconnect();
      wheelAnimationRef.current?.stop();
      wheelAnimationRef.current = null;
    };
  }, [ribbonX, session.phase, session.visibleBacks.length]);

  const moveRibbonTo = useCallback((nextOffset, animated = true) => {
    const clampedOffset = clampRibbonOffset(nextOffset, ribbonBoundsRef.current);
    wheelTargetRef.current = clampedOffset;
    wheelAnimationRef.current?.stop();

    if (shouldReduceMotion || !animated) {
      ribbonX.set(clampedOffset);
      wheelAnimationRef.current = null;
      return;
    }

    wheelAnimationRef.current = animate(ribbonX, clampedOffset, {
      type: 'spring',
      stiffness: 290,
      damping: 34,
      mass: 0.62,
      onComplete: () => {
        wheelAnimationRef.current = null;
      },
    });
  }, [ribbonX, shouldReduceMotion]);

  const handleRibbonWheel = useCallback((event) => {
    const baseOffset = wheelAnimationRef.current ? wheelTargetRef.current : ribbonX.get();
    const nextOffset = getWheelRibbonOffset(baseOffset, event, ribbonBoundsRef.current);
    if (nextOffset === baseOffset) return;
    event.preventDefault();
    moveRibbonTo(nextOffset);
  }, [moveRibbonTo, ribbonX]);

  const handleCardBackFocus = useCallback((event) => {
    const viewport = ribbonViewportRef.current;
    if (!viewport) return;

    const card = event.currentTarget;
    const currentOffset = ribbonX.get();
    const visibleInset = 34;
    const cardStart = card.offsetLeft + currentOffset;
    const cardEnd = cardStart + card.offsetWidth;
    let nextOffset = currentOffset;

    if (cardStart < visibleInset) {
      nextOffset += visibleInset - cardStart;
    } else if (cardEnd > viewport.clientWidth - visibleInset) {
      nextOffset -= cardEnd - (viewport.clientWidth - visibleInset);
    }

    if (nextOffset !== currentOffset) moveRibbonTo(nextOffset);
  }, [moveRibbonTo, ribbonX]);

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
              <div
                className="card-selection-progress"
                aria-live="polite"
                aria-label={t('drawing.selectionProgress', {
                  selected: session.selectedBacks.length,
                  total: session.cardCount,
                  remaining: remainingCount,
                })}
              >
                <span aria-hidden="true"><strong>{session.selectedBacks.length}</strong>{t('drawing.selectedCountLabel')}</span>
                <span aria-hidden="true"><strong>{session.cardCount}</strong>{t('drawing.requiredCountLabel')}</span>
                <span aria-hidden="true"><strong>{remainingCount}</strong>{t('drawing.remainingCountLabel')}</span>
              </div>

              <p id="card-ribbon-hint" className="card-ribbon-hint">
                <MoveHorizontal className="w-4 h-4" aria-hidden="true" />
                {t('drawing.ribbonDragHint')}
              </p>

              <div className="card-ribbon-shell">
                <span className="card-ribbon-direction card-ribbon-direction-left" aria-hidden="true">←</span>
                <div
                  ref={ribbonViewportRef}
                  className="card-ribbon-viewport"
                  role="group"
                  aria-label={t('drawing.cardBackGroupLabel')}
                  aria-describedby="card-ribbon-hint"
                  onWheel={handleRibbonWheel}
                >
                  <m.div
                    ref={ribbonTrackRef}
                    className={`card-back-ribbon ${selectionComplete ? 'is-selection-complete' : ''}`}
                    style={{ x: ribbonX }}
                    drag="x"
                    dragConstraints={{ left: ribbonBounds.min, right: ribbonBounds.max }}
                    dragElastic={shouldReduceMotion ? 0 : 0.09}
                    dragMomentum={!shouldReduceMotion}
                    onPointerDown={() => {
                      didDragRef.current = false;
                      wheelAnimationRef.current?.stop();
                      wheelAnimationRef.current = null;
                    }}
                    onDrag={(_, info) => {
                      if (Math.abs(info.offset.x) > RIBBON_DRAG_THRESHOLD) didDragRef.current = true;
                    }}
                    onDragEnd={() => {
                      wheelTargetRef.current = ribbonX.get();
                    }}
                  >
                    {session.visibleBacks.map((backIndex, index) => {
                      const selectedOrder = session.selectedBacks.indexOf(backIndex);
                      const isSelected = selectedOrder !== -1;
                      const pose = getCardRibbonPose(index);
                      return (
                        <m.button
                          key={`selectable-back-${backIndex}`}
                          type="button"
                          className={`selectable-card-back ${isSelected ? 'is-selected' : ''}`}
                          style={{ zIndex: isSelected ? session.visibleBacks.length + selectedOrder : index + 1 }}
                          aria-pressed={isSelected}
                          aria-disabled={!isSelected && selectionComplete}
                          aria-label={t('drawing.cardBackAria', {
                            index: index + 1,
                            state: isSelected ? t('drawing.selectedState') : t('drawing.unselectedState'),
                            remaining: remainingCount,
                          })}
                          onFocus={handleCardBackFocus}
                          onClick={(event) => {
                            if (didDragRef.current && event.detail !== 0) return;
                            didDragRef.current = false;
                            onToggleBack(backIndex);
                          }}
                          animate={{
                            y: isSelected ? pose.y - 20 : pose.y,
                            rotate: pose.rotate,
                          }}
                          whileHover={shouldReduceMotion ? undefined : { y: isSelected ? pose.y - 23 : pose.y - 8 }}
                          whileFocus={{ y: isSelected ? pose.y - 23 : pose.y - 8 }}
                          whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
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
                  </m.div>
                </div>
                <span className="card-ribbon-direction card-ribbon-direction-right" aria-hidden="true">→</span>
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
