export function createCardPointerGesture({
  clientX,
  clientY,
  pointerId,
  pointerType,
  scrollLeft,
}) {
  return {
    pointerId,
    pointerType,
    startX: Number(clientX) || 0,
    startY: Number(clientY) || 0,
    startScrollLeft: Math.max(0, Number(scrollLeft) || 0),
    nextScrollLeft: Math.max(0, Number(scrollLeft) || 0),
    didDrag: false,
  };
}

export function moveCardPointerGesture(gesture, point, threshold = 8) {
  if (!gesture) return gesture;
  const deltaX = (Number(point?.clientX) || 0) - gesture.startX;
  const deltaY = (Number(point?.clientY) || 0) - gesture.startY;
  const dragDistance = Math.hypot(deltaX, deltaY);

  return {
    ...gesture,
    didDrag: gesture.didDrag || dragDistance > Math.max(0, Number(threshold) || 0),
    nextScrollLeft: Math.max(0, gesture.startScrollLeft - deltaX),
  };
}

export function shouldActivateCardFromGesture(gesture, eventDetail = 1) {
  if (eventDetail === 0) return true;
  return !gesture?.didDrag;
}

export function getWheelScrollLeft(scrollLeft, scrollWidth, clientWidth, wheel) {
  const current = Math.max(0, Number(scrollLeft) || 0);
  const maximum = Math.max(0, (Number(scrollWidth) || 0) - (Number(clientWidth) || 0));
  const deltaX = Number(wheel?.deltaX) || 0;
  const deltaY = Number(wheel?.deltaY) || 0;
  const primaryDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
  return Math.min(maximum, Math.max(0, current + primaryDelta));
}
