import test from 'node:test';
import assert from 'node:assert/strict';

import { getDisplaySignInDate, getLocalDateKey } from '../src/dateUtils.js';

test('getLocalDateKey formats date as yyyy-mm-dd', () => {
  const date = new Date(2026, 3, 21);
  assert.equal(getLocalDateKey(date), '2026-04-21');
});

test('getDisplaySignInDate matches native toDateString output', () => {
  const date = new Date(2026, 3, 21);
  assert.equal(getDisplaySignInDate(date), date.toDateString());
});
