import { useCallback, useRef } from 'react';
import { m } from 'framer-motion';
import { Check, MoveHorizontal } from 'lucide-react';
import {
  createCardPointerGesture,
  getWheelScrollLeft,
  moveCardPointerGesture,
  shouldActivateCardFromGesture,
} from '../cardRibbon';

const CARD_DRAG_THRESHOLD = 8;
const CARD_VISIBLE_INSET = 34;

function getCardRibbonPose(index) {
  return {
    y: ((index % 5) - 2) * 2.2,
    rotate: ((index % 7) - 3) * 0.62,
  };
}

function TarotCardSelector({
  visibleBacks,
  selectedBacks,
  cardCount,
  onToggleBack,
  onConfirmSelection,
  shouldReduceMotion,
  t,
}) {
  const viewportRef = useRef(null);
  const gestureRef = useRef(null);
  const wheelTargetRef = useRef(0);
  const selectionComplete = selectedBacks.length === cardCount;
  const remainingCount = Math.max(0, cardCount - selectedBacks.length);

  const handlePointerDown = useCallback((event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const viewport = event.currentTarget;
    gestureRef.current = createCardPointerGesture({
      clientX: event.clientX,
      clientY: event.clientY,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      scrollLeft: viewport.scrollLeft,
    });
    wheelTargetRef.current = viewport.scrollLeft;
  }, []);

  const handlePointerMove = useCallback((event) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;

    const nextGesture = moveCardPointerGesture(
      gesture,
      { clientX: event.clientX, clientY: event.clientY },
      CARD_DRAG_THRESHOLD,
    );
    gestureRef.current = nextGesture;
    if (!nextGesture.didDrag) return;

    const viewport = event.currentTarget;
    viewport.classList.add('is-dragging');
    if (event.pointerType !== 'mouse') return;

    if (!viewport.hasPointerCapture?.(event.pointerId)) {
      viewport.setPointerCapture?.(event.pointerId);
    }
    event.preventDefault();
    viewport.scrollLeft = nextGesture.nextScrollLeft;
    wheelTargetRef.current = viewport.scrollLeft;
  }, []);

  const finishPointerGesture = useCallback((event) => {
    const viewport = event.currentTarget;
    viewport.classList.remove('is-dragging');
    if (viewport.hasPointerCapture?.(event.pointerId)) {
      viewport.releasePointerCapture?.(event.pointerId);
    }
  }, []);

  const handleClickCapture = useCallback((event) => {
    const shouldActivate = shouldActivateCardFromGesture(gestureRef.current, event.detail);
    gestureRef.current = null;
    if (shouldActivate) return;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleWheel = useCallback((event) => {
    const viewport = event.currentTarget;
    const baseScrollLeft = wheelTargetRef.current || viewport.scrollLeft;
    const nextScrollLeft = getWheelScrollLeft(
      baseScrollLeft,
      viewport.scrollWidth,
      viewport.clientWidth,
      event,
    );
    if (nextScrollLeft === baseScrollLeft) return;

    event.preventDefault();
    wheelTargetRef.current = nextScrollLeft;
    viewport.scrollLeft = nextScrollLeft;
  }, []);

  const handleCardFocus = useCallback((event) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const card = event.currentTarget;
    const visibleStart = viewport.scrollLeft + CARD_VISIBLE_INSET;
    const visibleEnd = viewport.scrollLeft + viewport.clientWidth - CARD_VISIBLE_INSET;
    const cardStart = card.offsetLeft;
    const cardEnd = cardStart + card.offsetWidth;
    let nextScrollLeft = viewport.scrollLeft;

    if (cardStart < visibleStart) {
      nextScrollLeft = cardStart - CARD_VISIBLE_INSET;
    } else if (cardEnd > visibleEnd) {
      nextScrollLeft = cardEnd - viewport.clientWidth + CARD_VISIBLE_INSET;
    }

    if (nextScrollLeft === viewport.scrollLeft) return;
    const boundedScrollLeft = getWheelScrollLeft(
      nextScrollLeft,
      viewport.scrollWidth,
      viewport.clientWidth,
      { deltaX: 0, deltaY: 0 },
    );
    wheelTargetRef.current = boundedScrollLeft;
    viewport.scrollTo({
      left: boundedScrollLeft,
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
  }, [shouldReduceMotion]);

  return (
    <>
      <div
        className="card-selection-progress"
        aria-live="polite"
        aria-label={t('drawing.selectionProgress', {
          selected: selectedBacks.length,
          total: cardCount,
          remaining: remainingCount,
        })}
      >
        <span aria-hidden="true"><strong>{selectedBacks.length}</strong>{t('drawing.selectedCountLabel')}</span>
        <span aria-hidden="true"><strong>{cardCount}</strong>{t('drawing.requiredCountLabel')}</span>
        <span aria-hidden="true"><strong>{remainingCount}</strong>{t('drawing.remainingCountLabel')}</span>
      </div>

      <p id="card-ribbon-hint" className="card-ribbon-hint">
        <MoveHorizontal className="w-4 h-4" aria-hidden="true" />
        {t('drawing.ribbonDragHint')}
      </p>

      <div className="card-ribbon-shell">
        <div
          ref={viewportRef}
          className="card-ribbon-viewport"
          role="group"
          aria-label={t('drawing.cardBackGroupLabel')}
          aria-describedby="card-ribbon-hint"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointerGesture}
          onPointerCancel={finishPointerGesture}
          onClickCapture={handleClickCapture}
          onWheel={handleWheel}
          onScroll={(event) => {
            if (!gestureRef.current) wheelTargetRef.current = event.currentTarget.scrollLeft;
          }}
        >
          <div className={`card-back-ribbon ${selectionComplete ? 'is-selection-complete' : ''}`}>
            {visibleBacks.map((backIndex, index) => {
              const selectedOrder = selectedBacks.indexOf(backIndex);
              const isSelected = selectedOrder !== -1;
              const pose = getCardRibbonPose(index);
              return (
                <m.button
                  key={`selectable-back-${backIndex}`}
                  type="button"
                  className={`selectable-card-back ${isSelected ? 'is-selected' : ''}`}
                  style={{ zIndex: isSelected ? visibleBacks.length + selectedOrder : index + 1 }}
                  aria-pressed={isSelected}
                  aria-disabled={!isSelected && selectionComplete}
                  aria-label={t('drawing.cardBackAria', {
                    index: index + 1,
                    state: isSelected ? t('drawing.selectedState') : t('drawing.unselectedState'),
                    remaining: remainingCount,
                  })}
                  onFocus={handleCardFocus}
                  onClick={() => onToggleBack(backIndex)}
                  onDragStart={(event) => event.preventDefault()}
                  animate={{
                    y: isSelected ? pose.y - 20 : pose.y,
                    rotate: pose.rotate,
                  }}
                  whileHover={shouldReduceMotion ? undefined : { y: isSelected ? pose.y - 23 : pose.y - 8 }}
                  whileFocus={{ y: isSelected ? pose.y - 23 : pose.y - 8 }}
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
        </div>
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
    </>
  );
}

export default TarotCardSelector;
