import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { allTarotCards } from '../src/data.js';
import zhCN from '../src/i18n/locales/zh-CN.ts';
import en from '../src/i18n/locales/en.ts';
import it from '../src/i18n/locales/it.ts';
import {
  calculateUnityResult,
  deriveUnityLine,
} from '../src/unityAlgorithm.js';
import {
  advanceUnityRound,
  createUnityCastingSession,
  isUnityCastingComplete,
  revealNextUnityCard,
  validateUnityCastingSession,
} from '../src/unityCastingFlow.js';
import {
  clearUnityDraft,
  getUnityDraftKey,
  loadUnityDraft,
  saveUnityDraft,
} from '../src/unityPersistence.js';

const tests = [];
const test = (name, run) => tests.push({ name, run });

function cardsForValues(values) {
  return values.map((value, index) => ({
    id: index,
    name: `Card ${index}`,
    englishName: `Card ${index}`,
    isReversed: value === 3,
  }));
}

function roundsForLineValues(lineValues) {
  let cardId = 0;
  return lineValues.map((lineValue, index) => {
    const values = lineValue === 6 ? [2, 2, 2]
      : lineValue === 7 ? [2, 2, 3]
        : lineValue === 8 ? [2, 3, 3]
          : [3, 3, 3];
    return {
      roundIndex: index + 1,
      tarotCards: values.map((value) => ({
        id: cardId++,
        name: `Card ${cardId}`,
        englishName: `Card ${cardId}`,
        isReversed: value === 3,
      })),
    };
  });
}

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

test('frozen line mapping derives exact 6 7 8 9 facts', () => {
  assert.deepEqual(deriveUnityLine(cardsForValues([2, 2, 2])), {
    threeCardValues: [2, 2, 2], lineValue: 6, lineType: 'old-yin', linePolarity: 'yin', lineAge: 'old', isMoving: true, changedPolarity: 'yang',
  });
  assert.equal(deriveUnityLine(cardsForValues([2, 2, 3])).lineValue, 7);
  assert.equal(deriveUnityLine(cardsForValues([2, 3, 3])).lineValue, 8);
  assert.deepEqual(deriveUnityLine(cardsForValues([3, 3, 3])), {
    threeCardValues: [3, 3, 3], lineValue: 9, lineType: 'old-yang', linePolarity: 'yang', lineAge: 'old', isMoving: true, changedPolarity: 'yin',
  });
});

test('hexagram calculation uses bottom-to-top King Wen order and all moving lines', () => {
  const result = calculateUnityResult(roundsForLineValues([9, 9, 9, 6, 6, 6]), { question: 'test', locale: 'en' });
  assert.equal(result.primaryHexagram.number, 11);
  assert.equal(result.primaryHexagram.nameKey, 'tai');
  assert.equal(result.changedHexagram.number, 12);
  assert.equal(result.changedHexagram.nameKey, 'pi');
  assert.deepEqual(result.movingLineIndexes, [1, 2, 3, 4, 5, 6]);
  assert.equal(result.rounds.flatMap((round) => round.tarotCards).length, 18);
  assert.equal('interpretation' in result, false);
});

test('no moving lines preserve the same hexagram', () => {
  const result = calculateUnityResult(roundsForLineValues([7, 7, 7, 7, 7, 7]));
  assert.equal(result.primaryHexagram.number, 1);
  assert.equal(result.changedHexagram.number, 1);
  assert.deepEqual(result.movingLineIndexes, []);
});

test('casting session freezes 18 unique cards and existing orientation threshold', () => {
  let randomIndex = 0;
  const randomValues = Array.from({ length: 200 }, (_, index) => (index < 77 ? 0.999 : index % 2 ? 0.5 : 0.49));
  const session = createUnityCastingSession(allTarotCards, { ownerId: 'u1', question: 'Q', locale: 'zh-CN', random: () => randomValues[randomIndex++] ?? 0.9, now: '2026-08-13T00:00:00.000Z' });
  assert.equal(session.cards.length, 18);
  assert.equal(new Set(session.cards.map((card) => card.id)).size, 18);
  assert.equal(session.cards[0].isReversed, false);
  assert.equal(session.cards[1].isReversed, true);
  assert.equal(session.roundIndex, 1);
  assert.equal(validateUnityCastingSession(session, 'u1'), true);
});

test('casting reveals strictly in order and advances all six rounds', () => {
  let session = createUnityCastingSession(allTarotCards, { ownerId: 'u1', question: 'Q', random: () => 0.9 });
  assert.equal(revealNextUnityCard(session, 1), session);
  session = revealNextUnityCard(session, 0);
  assert.equal(session.revealedCount, 1);
  assert.equal(revealNextUnityCard(session, 0), session);
  session = revealNextUnityCard(session, 1);
  session = revealNextUnityCard(session, 2);
  assert.equal(session.completedRounds.length, 1);
  session = advanceUnityRound(session);
  assert.equal(session.roundIndex, 2);
  for (let round = 2; round <= 6; round += 1) {
    session = revealNextUnityCard(session, 0);
    session = revealNextUnityCard(session, 1);
    session = revealNextUnityCard(session, 2);
    if (round < 6) session = advanceUnityRound(session);
  }
  assert.equal(session.completedRounds.length, 6);
  assert.equal(isUnityCastingComplete(session), true);
});

test('draft persistence is owner scoped and rejects corrupt or duplicate drafts', () => {
  const storage = memoryStorage();
  const session = createUnityCastingSession(allTarotCards, { ownerId: 'u1', question: 'Q', random: () => 0.9 });
  saveUnityDraft(storage, session);
  assert.equal(getUnityDraftKey('u1').includes('u1'), true);
  assert.deepEqual(loadUnityDraft(storage, 'u1'), session);
  assert.equal(loadUnityDraft(storage, 'u2'), null);
  const invalid = { ...session, cards: [...session.cards.slice(0, 17), session.cards[0]] };
  storage.setItem(getUnityDraftKey('u1'), JSON.stringify(invalid));
  assert.equal(loadUnityDraft(storage, 'u1'), null);
  assert.equal(storage.getItem(getUnityDraftKey('u1')), null);
  const wrongOrientation = { ...session, cards: session.cards.map((card, index) => index === 0 ? { ...card, isReversed: 'yes' } : card) };
  storage.setItem(getUnityDraftKey('u1'), JSON.stringify(wrongOrientation));
  assert.equal(loadUnityDraft(storage, 'u1'), null);
  const unknownCard = { ...session, cards: session.cards.map((card, index) => index === 0 ? { ...card, id: 999 } : card) };
  storage.setItem(getUnityDraftKey('u1'), JSON.stringify(unknownCard));
  assert.equal(loadUnityDraft(storage, 'u1'), null);
  let progressed = revealNextUnityCard(session, 0);
  progressed = revealNextUnityCard(progressed, 1);
  progressed = revealNextUnityCard(progressed, 2);
  const mismatchedRound = { ...progressed, completedRounds: [{ ...progressed.completedRounds[0], tarotCards: progressed.cards.slice(3, 6) }] };
  storage.setItem(getUnityDraftKey('u1'), JSON.stringify(mismatchedRound));
  assert.equal(loadUnityDraft(storage, 'u1'), null);
  storage.setItem(getUnityDraftKey('u1'), '{bad');
  assert.equal(loadUnityDraft(storage, 'u1'), null);
  clearUnityDraft(storage, 'u1');
});

test('hexagram calculation rejects rounds that are not strictly ordered one through six', () => {
  const rounds = roundsForLineValues([7, 7, 7, 7, 7, 7]);
  rounds[1].roundIndex = 4;
  assert.throws(() => calculateUnityResult(rounds), /order/i);
});

test('Unity casting and result copy is complete in every locale', () => {
  for (const locale of [zhCN, en, it]) {
    assert.equal(locale.unity.lineLabels.length, 6);
    assert.equal(locale.unity.hexagramNames.length, 64);
    assert.ok(locale.unity.roundProgress);
    assert.ok(locale.unity.revealCardLabel);
    assert.ok(locale.unity.primaryHexagram);
    assert.ok(locale.unity.changedHexagram);
  }
});

test('Unity pages expose sequential casting and calculation-only result contracts', () => {
  const castingSource = readFileSync(new URL('../src/pages/UnityCastingPage.jsx', import.meta.url), 'utf8');
  const introSource = readFileSync(new URL('../src/pages/UnityIntroPage.jsx', import.meta.url), 'utf8');
  const resultSource = readFileSync(new URL('../src/pages/UnityResultPage.jsx', import.meta.url), 'utf8');
  assert.match(castingSource, /revealedCount === cardIndex/);
  assert.match(castingSource, /useReducedMotion/);
  assert.match(castingSource, /clearTimeout/);
  assert.match(castingSource, /cancelAnimationFrame/);
  assert.match(introSource, /onResume/);
  assert.match(introSource, /hasDraft/);
  assert.match(introSource, /resumeCasting/);
  assert.match(resultSource, /unity-result-tarot-grid/);
  assert.match(resultSource, /primaryHexagram/);
  assert.match(resultSource, /changedHexagram/);
  assert.match(resultSource, /getLocalizedMeaningCard/);
  assert.doesNotMatch(resultSource, /interpretation|reading|advice|synthesis|Coming Soon/i);
});

let failures = 0;
for (const { name, run } of tests) {
  try {
    await run();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}`);
    console.error(error);
  }
}

if (failures) process.exitCode = 1;
else console.log(`All ${tests.length} Unity tests passed.`);
