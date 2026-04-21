import test from 'node:test';
import assert from 'node:assert/strict';

import { isSessionExpiredAt, SESSION_MAX_AGE_MS } from '../src/sessionUtils.js';

test('isSessionExpiredAt returns false when there is no start timestamp', () => {
  assert.equal(isSessionExpiredAt(null, 1_000), false);
  assert.equal(isSessionExpiredAt(undefined, 1_000), false);
  assert.equal(isSessionExpiredAt(0, 1_000), false);
});

test('isSessionExpiredAt returns false within the 30 day window', () => {
  const startedAt = 1_000;
  const now = startedAt + SESSION_MAX_AGE_MS - 1;
  assert.equal(isSessionExpiredAt(startedAt, now), false);
});

test('isSessionExpiredAt returns true after the 30 day window', () => {
  const startedAt = 1_000;
  const now = startedAt + SESSION_MAX_AGE_MS + 1;
  assert.equal(isSessionExpiredAt(startedAt, now), true);
});
