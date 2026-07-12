import assert from 'node:assert/strict';

import { isSessionExpiredAt, SESSION_MAX_AGE_MS } from '../src/sessionUtils.js';
import { getDisplaySignInDate, getLocalDateKey } from '../src/dateUtils.js';
import { getCardArtwork } from '../src/cardArtwork.js';
import { findTarotMeaningCard, getLocalizedMeaningCard, getTarotMeaningCard } from '../src/cardMeanings.js';

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
    name: 'getDisplaySignInDate matches local date key',
    run() {
      const date = new Date(2026, 3, 21);
      assert.equal(getDisplaySignInDate(date), '2026-04-21');
    },
  },
  {
    name: 'card artwork resolves chinese numeral aliases',
    run() {
      assert.equal(getCardArtwork({ name: '圣杯四' }), '/cards/waite-cn/圣杯4.jpg');
      assert.equal(getCardArtwork({ name: '权杖十' }), '/cards/waite-cn/权杖10.jpg');
      assert.equal(getCardArtwork({ name: '宝剑一' }), '/cards/waite-cn/宝剑ACE.jpg');
    },
  },
  {
    name: 'card artwork resolves court-card aliases',
    run() {
      assert.equal(getCardArtwork({ name: '圣杯侍者' }), '/cards/waite-cn/圣杯侍卫.jpg');
      assert.equal(getCardArtwork({ name: '圣杯侍从' }), '/cards/waite-cn/圣杯侍卫.jpg');
      assert.equal(getCardArtwork({ name: '圣杯侍卫' }), '/cards/waite-cn/圣杯侍卫.jpg');
      assert.equal(getCardArtwork({ name: '圣杯皇后' }), '/cards/waite-cn/圣杯王后.jpg');
    },
  },
  {
    name: 'cups number meanings map to catalog ids 36 through 45',
    run() {
      const expectedNames = [
        'Ace of Cups',
        'Two of Cups',
        'Three of Cups',
        'Four of Cups',
        'Five of Cups',
        'Six of Cups',
        'Seven of Cups',
        'Eight of Cups',
        'Nine of Cups',
        'Ten of Cups',
      ];

      expectedNames.forEach((name, index) => {
        const card = getTarotMeaningCard(36 + index);
        assert.equal(card?.name_en, name);
        assert.equal(card?.catalogId, 36 + index);
        assert.ok(card?.daily_upright);
        assert.ok(card?.daily_reversed);
        assert.match(card?.image || '', /^\/cards\/waite-cn\/圣杯/);
      });
    },
  },
  {
    name: 'cups number meanings include complete English and Italian text',
    run() {
      for (let catalogId = 36; catalogId <= 45; catalogId += 1) {
        const card = getTarotMeaningCard(catalogId);
        for (const language of ['en', 'it']) {
          const localized = getLocalizedMeaningCard(card, language);
          assert.ok(localized?.displayName);
          assert.ok(localized?.displayKeywords?.length);
          assert.ok(localized?.displayDailyUpright);
          assert.ok(localized?.displayDailyReversed);
          assert.ok(localized?.displayReadingUpright);
          assert.ok(localized?.displayReadingReversed);
          assert.ok(localized?.displayDetail);
        }
      }
    },
  },
  {
    name: 'all 78 cards include complete multilingual meaning fields',
    run() {
      for (let catalogId = 0; catalogId < 78; catalogId += 1) {
        const card = getTarotMeaningCard(catalogId);
        assert.ok(card?.keywords?.length, `missing Chinese keywords for ${catalogId}`);
        assert.ok(card?.daily_upright, `missing Chinese upright daily for ${catalogId}`);
        assert.ok(card?.daily_reversed, `missing Chinese reversed daily for ${catalogId}`);
        assert.ok(card?.reading_upright, `missing Chinese upright reading for ${catalogId}`);
        assert.ok(card?.reading_reversed, `missing Chinese reversed reading for ${catalogId}`);
        assert.ok(card?.detail, `missing Chinese detail for ${catalogId}`);

        for (const language of ['en', 'it']) {
          const localized = getLocalizedMeaningCard(card, language);
          assert.ok(localized?.displayKeywords?.length, `missing ${language} keywords for ${catalogId}`);
          assert.ok(localized?.displayDailyUpright, `missing ${language} upright daily for ${catalogId}`);
          assert.ok(localized?.displayDailyReversed, `missing ${language} reversed daily for ${catalogId}`);
          assert.ok(localized?.displayReadingUpright, `missing ${language} upright reading for ${catalogId}`);
          assert.ok(localized?.displayReadingReversed, `missing ${language} reversed reading for ${catalogId}`);
          assert.ok(localized?.displayDetail, `missing ${language} detail for ${catalogId}`);
        }
      }
    },
  },
  {
    name: 'swords and pentacles retain their own artwork mappings',
    run() {
      for (let catalogId = 50; catalogId <= 63; catalogId += 1) {
        assert.match(getTarotMeaningCard(catalogId)?.image || '', /^\/cards\/waite-cn\/宝剑/);
      }
      for (let catalogId = 64; catalogId <= 77; catalogId += 1) {
        assert.match(getTarotMeaningCard(catalogId)?.image || '', /^\/cards\/waite-cn\/星币/);
      }
    },
  },
  {
    name: 'legacy daily cards resolve meanings by catalog Chinese name',
    run() {
      const legacyDailyCards = [
        { name: '权杖一', expectedId: 22 },
        { name: '圣杯一', expectedId: 36 },
        { name: '圣杯皇后', expectedId: 48 },
        { name: '宝剑一', expectedId: 50 },
        { name: '星币一', expectedId: 64 },
      ];

      for (const { name, expectedId } of legacyDailyCards) {
        const card = findTarotMeaningCard({ name });
        assert.equal(card?.catalogId, expectedId);
        assert.ok(getLocalizedMeaningCard(card, 'zh-CN')?.displayDailyUpright);
        assert.ok(getLocalizedMeaningCard(card, 'en')?.displayDailyReversed);
        assert.ok(getLocalizedMeaningCard(card, 'it')?.displayDailyUpright);
      }
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
