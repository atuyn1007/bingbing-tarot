export function getRibbonBounds(viewportWidth, trackWidth, edgeInset = 0) {
  const viewport = Math.max(0, Number(viewportWidth) || 0);
  const track = Math.max(0, Number(trackWidth) || 0);
  const inset = Math.max(0, Number(edgeInset) || 0);

  if (track <= viewport) {
    const centered = (viewport - track) / 2;
    return { min: centered, max: centered };
  }

  return {
    min: viewport - inset - track,
    max: inset,
  };
}

export function clampRibbonOffset(offset, bounds) {
  const value = Number(offset) || 0;
  return Math.min(bounds.max, Math.max(bounds.min, value));
}

export function getWheelRibbonOffset(currentOffset, wheel, bounds) {
  const deltaX = Number(wheel?.deltaX) || 0;
  const deltaY = Number(wheel?.deltaY) || 0;
  const primaryDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
  return clampRibbonOffset(currentOffset - primaryDelta, bounds);
}
