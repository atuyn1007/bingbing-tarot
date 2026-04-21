import assert from 'node:assert/strict';

import { isSessionExpiredAt, SESSION_MAX_AGE_MS } from '../src/sessionUtils.js';
import { getDisplaySignInDate, getLocalDateKey } from '../src/dateUtils.js';

const tests = [
  {
    name: 'isSessionExpiredAt returns false when timestamp is missing',
    run() {
      assert.equal(isSessionExpiredAt(null, 1000), false);
      assert.equal(isSessionExpiredAt(undefined, 1000), false);
      assert.equal(isSessionExpiredAt(0, 1000), false);
    },
  },
  {
    name: 'isSessionExpiredAt stays false within 30 day window',
    run() {
      const startedAt = 1000;
      const now = startedAt + SESSION_MAX_AGE_MS - 1;
      assert.equal(isSessionExpiredAt(startedAt, now), false);
    },
  },
  {
    name: 'isSessionExpiredAt becomes true after 30 day window',
    run() {
      const startedAt = 1000;
      const now = startedAt + SESSION_MAX_AGE_MS + 1;
      assert.equal(isSessionExpiredAt(startedAt, now), true);
    },
  },
  {
    name: 'getLocalDateKey formats yyyy-mm-dd',
    run() {
      const date = new Date(2026, 3, 21);
      assert.equal(getLocalDateKey(date), '2026-04-21');
    },
  },
  {
    name: 'getDisplaySignInDate matches native toDateString',
    run() {
      const date = new Date(2026, 3, 21);
      assert.equal(getDisplaySignInDate(date), date.toDateString());
    },
  },
];

let failed = 0;

for (const test of tests) {
  try {
    test.run();
    console.log(`PASS ${test.name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${test.name}`);
    console.error(error);
  }
}

if (failed > 0) {
  process.exitCode = 1;
} else {
  console.log(`All ${tests.length} tests passed.`);
}
