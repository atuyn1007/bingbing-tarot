export const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function isSessionExpiredAt(startedAt, now = Date.now(), maxAge = SESSION_MAX_AGE_MS) {
  const normalized = Number(startedAt || 0);
  if (!normalized) return false;
  return now - normalized > maxAge;
}
