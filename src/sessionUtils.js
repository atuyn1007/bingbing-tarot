export const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function isSessionExpiredAt(startedAt, now = Date.now(), maxAge = SESSION_MAX_AGE_MS) {
  const normalized = Number(startedAt || 0);
  if (!normalized) return false;
  return now - normalized > maxAge;
}

const DEFINITIVE_AUTH_ERROR_CODES = new Set([
  'bad_jwt',
  'invalid_refresh_token',
  'jwt_expired',
  'refresh_token_not_found',
]);

export function isDefinitiveAuthFailure(error) {
  if (!error) return false;

  const status = Number(error.status || error.statusCode || 0);
  if (status === 401) return true;

  const code = String(error.code || '').trim().toLowerCase();
  if (DEFINITIVE_AUTH_ERROR_CODES.has(code)) return true;

  const name = String(error.name || '').toLowerCase();
  if (name.includes('authsessionmissing')) return true;

  const message = String(error.message || error).toLowerCase();
  return (
    message.includes('auth session missing')
    || message.includes('invalid refresh token')
    || message.includes('refresh token not found')
    || message.includes('jwt expired')
  );
}
