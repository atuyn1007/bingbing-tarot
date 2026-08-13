export function normalizeUnityQuestion(value) {
  return String(value || '').trim();
}

export function canStartUnityCasting(value) {
  return normalizeUnityQuestion(value).length > 0;
}
