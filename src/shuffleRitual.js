const STANDARD_TIMELINE = Object.freeze({
  totalDuration: 3500,
  steps: Object.freeze([
    Object.freeze({ phase: 'riffle', at: 0 }),
    Object.freeze({ phase: 'cut', at: 1350 }),
    Object.freeze({ phase: 'gather', at: 2450 }),
    Object.freeze({ phase: 'complete', at: 3500 }),
  ]),
});

const REDUCED_TIMELINE = Object.freeze({
  totalDuration: 480,
  steps: Object.freeze([
    Object.freeze({ phase: 'gather', at: 0 }),
    Object.freeze({ phase: 'complete', at: 480 }),
  ]),
});

export function getShuffleRitualTimeline(reducedMotion = false) {
  return reducedMotion ? REDUCED_TIMELINE : STANDARD_TIMELINE;
}
