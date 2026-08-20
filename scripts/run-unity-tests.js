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
  UNITY_HEXAGRAMS,
  getUnityHexagramByNumber,
  getUnityHexagramByTrigrams,
} from '../src/data/unity/hexagrams.js';
import { UNITY_TRIGRAMS } from '../src/data/unity/trigrams.js';
import {
  buildUnityKnowledgeSnapshot,
  getUnityHexagramKnowledge,
  getUnityLineKnowledge,
} from '../src/unityKnowledge.js';
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
import {
  createUnityResultArchive,
  getUnityResultArchiveKey,
  loadUnityResultArchive,
  saveUnityResultArchive,
  validateUnityResultArchive,
} from '../src/unityResultPersistence.js';
import {
  appendUnityHistory,
  clearUnityHistory,
  createUnityHistoryEntry,
  filterUnityHistory,
  getUnityHistoryKey,
  readUnityHistory,
  removeUnityHistoryEntry,
} from '../src/unityHistoryStore.js';

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

test('Unity structural knowledge indexes all trigrams and King Wen hexagrams', () => {
  assert.equal(UNITY_TRIGRAMS.length, 8);
  assert.equal(UNITY_HEXAGRAMS.length, 64);
  assert.equal(new Set(UNITY_HEXAGRAMS.map((item) => item.kingWenNumber)).size, 64);
  assert.deepEqual(getUnityHexagramByNumber(1).linePatternBottomToTop, Array(6).fill('yang'));
  assert.deepEqual(getUnityHexagramByNumber(2).linePatternBottomToTop, Array(6).fill('yin'));
  assert.equal(getUnityHexagramByTrigrams('kun', 'qian').kingWenNumber, 11);
  assert.equal(getUnityHexagramByTrigrams('qian', 'kun').kingWenNumber, 12);
});

test('verified Unity knowledge separates canonical and modern content', () => {
  const qian = getUnityHexagramKnowledge(1, 'zh-CN');
  assert.equal(qian.structure.kingWenNumber, 1);
  assert.ok(qian.canonical.originalText.includes('乾'));
  assert.ok(qian.modern.summary);
  assert.notEqual(qian.canonical.originalText, qian.modern.summary);
  assert.ok(qian.keywords.length >= 2);
  assert.ok(qian.canonical.sourceId);
});

test('moving-line knowledge uses the primary hexagram and exact one-based position', () => {
  const first = getUnityLineKnowledge(1, 1, 'zh-CN');
  const sixth = getUnityLineKnowledge(1, 6, 'zh-CN');
  assert.equal(first.linePosition, 1);
  assert.equal(sixth.linePosition, 6);
  assert.notEqual(first.canonical.originalText, sixth.canonical.originalText);
});

test('missing editorial knowledge is explicit and never borrowed', () => {
  const missing = getUnityHexagramKnowledge(64, 'zh-CN');
  assert.equal(missing.contentStatus, 'unavailable');
  assert.equal(missing.canonical, null);
  assert.equal(missing.modern, null);
});

test('knowledge snapshot suppresses presentation changed hexagram when no lines move', () => {
  const calculation = calculateUnityResult(roundsForLineValues([7, 7, 7, 7, 7, 7]));
  const snapshot = buildUnityKnowledgeSnapshot(calculation, 'zh-CN');
  assert.equal(snapshot.primary.structure.kingWenNumber, 1);
  assert.deepEqual(snapshot.movingLines, []);
  assert.equal(snapshot.changed, null);
  assert.equal(calculation.changedHexagram.number, 1);
});

test('completed Unity archive reopens without recasting or changing facts', () => {
  const storage = memoryStorage();
  const calculation = calculateUnityResult(
    roundsForLineValues([9, 7, 8, 7, 8, 6]),
    { question: 'Q', now: '2026-08-20T00:00:00.000Z' },
  );
  const archive = createUnityResultArchive(calculation, 'u1', '2026-08-20T00:00:00.000Z');
  assert.equal(saveUnityResultArchive(storage, archive), true);
  const reopened = loadUnityResultArchive(storage, 'u1');
  assert.deepEqual(reopened.calculation.rounds, calculation.rounds);
  assert.deepEqual(reopened.calculation.movingLineIndexes, calculation.movingLineIndexes);
  assert.deepEqual(reopened.calculation.primaryHexagram, calculation.primaryHexagram);
  assert.deepEqual(
    reopened.knowledgeByLocale['zh-CN'].primary.structure,
    archive.knowledgeByLocale['zh-CN'].primary.structure,
  );
});

test('completed Unity archive is owner scoped and rejects altered calculations', () => {
  const storage = memoryStorage();
  const calculation = calculateUnityResult(roundsForLineValues([7, 7, 7, 7, 7, 7]));
  const archive = createUnityResultArchive(calculation, 'u1');
  assert.equal(validateUnityResultArchive(archive, 'u1'), true);
  assert.equal(validateUnityResultArchive(archive, 'u2'), false);

  const duplicate = structuredClone(archive);
  duplicate.calculation.rounds[0].tarotCards[1].cardId = duplicate.calculation.rounds[0].tarotCards[0].cardId;
  assert.equal(validateUnityResultArchive(duplicate, 'u1'), false);

  const alteredPattern = structuredClone(archive);
  alteredPattern.calculation.primaryHexagram.linePatternBottomToTop[0] = 'yin';
  assert.equal(validateUnityResultArchive(alteredPattern, 'u1'), false);

  const missingLocale = structuredClone(archive);
  delete missingLocale.knowledgeByLocale.it;
  assert.equal(validateUnityResultArchive(missingLocale, 'u1'), false);

  storage.setItem(getUnityResultArchiveKey('u1'), JSON.stringify(alteredPattern));
  assert.equal(loadUnityResultArchive(storage, 'u1'), null);
  assert.equal(storage.getItem(getUnityResultArchiveKey('u1')), null);
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

test('Unity phase three copy is complete in every locale', () => {
  const phaseThreeKeys = [
    'imagePanelKicker', 'imagePanelTitle', 'readingPanelKicker', 'readingPanelTitle',
    'canonicalText', 'modernSummary', 'keywords', 'upperTrigram', 'lowerTrigram',
    'hexagramNumber', 'noMovingLinesTitle', 'noMovingLinesDescription',
    'changedHexagramHelp', 'knowledgeUnavailable', 'cardPosition', 'cardMetadataLabel',
    'openSavedResult', 'savedResultInvalid',
  ];
  for (const locale of [zhCN, en, it]) {
    phaseThreeKeys.forEach((key) => assert.ok(locale.unity[key], `Missing unity.${key}`));
    assert.deepEqual(Object.keys(locale.unity.trigramNames).sort(), ['dui', 'gen', 'kan', 'kun', 'li', 'qian', 'xun', 'zhen']);
    assert.deepEqual(Object.keys(locale.unity.polarityLabels).sort(), ['yang', 'yin']);
    assert.ok(locale.unity.lineTypeLabels['old-yin']);
    assert.ok(locale.unity.lineTypeLabels['old-yang']);
  }
});

test('Unity phase three result has responsive archive styling contracts', () => {
  const css = readFileSync(new URL('../src/solar.css', import.meta.url), 'utf8');
  assert.match(css, /\.unity-result-layout/);
  assert.match(css, /\.unity-result-tarot-grid/);
  assert.match(css, /\.unity-result-reading-panel/);
  assert.match(css, /\.unity-card-popover/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
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
  assert.match(resultSource, /UnityTarotArchive/);
  assert.match(resultSource, /UnityHexagramSection/);
  assert.match(resultSource, /UnityMovingLinesSection/);
  assert.match(resultSource, /knowledge\.changed\s*\?/);
  assert.doesNotMatch(resultSource, /displayReading|displayDetail|advice|synthesis|Coming Soon|\bAI\b/i);
});

test('Unity introduction reopens a completed archive without starting a new cast', () => {
  const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const introSource = readFileSync(new URL('../src/pages/UnityIntroPage.jsx', import.meta.url), 'utf8');
  assert.match(appSource, /loadUnityResultArchive/);
  assert.match(appSource, /createUnityResultArchive/);
  assert.match(appSource, /saveUnityResultArchive/);
  assert.match(appSource, /handleOpenUnityResult/);
  assert.match(introSource, /hasSavedResult/);
  assert.match(introSource, /onOpenResult/);
  assert.doesNotMatch(introSource, /createUnityCastingSession|calculateUnityResult/);
});

test('Unity tarot archive reverses presentation only and limits card metadata', () => {
  const source = readFileSync(new URL('../src/components/unity/UnityTarotArchive.jsx', import.meta.url), 'utf8');
  assert.match(source, /\[\.\.\.rounds\]\.reverse\(\)/);
  assert.match(source, /aria-expanded/);
  assert.match(source, /pointerdown/);
  assert.match(source, /getLocalizedMeaningCard/);
  assert.doesNotMatch(source, /displayReading|displayDetail|displayKeywords|meaningText/);
});

test('Unity I Ching components keep canonical and modern text structurally separate', () => {
  const hexagramSource = readFileSync(new URL('../src/components/unity/UnityHexagramSection.jsx', import.meta.url), 'utf8');
  const movingSource = readFileSync(new URL('../src/components/unity/UnityMovingLinesSection.jsx', import.meta.url), 'utf8');
  assert.match(hexagramSource, /knowledge\.canonical\?\.originalText/);
  assert.match(hexagramSource, /knowledge\.modern\?\.summary/);
  assert.match(hexagramSource, /unity-canonical-text/);
  assert.match(hexagramSource, /unity-modern-summary/);
  assert.doesNotMatch(hexagramSource, /split\(/);
  assert.match(movingSource, /line\.canonical\?\.originalText/);
  assert.match(movingSource, /line\.modern\?\.summary/);
  assert.match(movingSource, /noMovingLinesDescription/);
});

test('Unity knowledge maps no, single, multiple, and all moving-line scenarios exactly', () => {
  const scenarios = [
    { name: 'none', values: [7, 7, 7, 7, 7, 7], moving: [], changedNumber: null },
    { name: 'single', values: [9, 7, 7, 7, 7, 7], moving: [1], changedNumber: 44 },
    { name: 'multiple', values: [9, 9, 7, 7, 7, 7], moving: [1, 2], changedNumber: 33 },
    { name: 'all', values: [9, 9, 9, 9, 9, 9], moving: [1, 2, 3, 4, 5, 6], changedNumber: 2 },
  ];

  scenarios.forEach((scenario) => {
    const calculation = calculateUnityResult(roundsForLineValues(scenario.values), {
      question: scenario.name,
      now: '2026-08-20T00:00:00.000Z',
    });
    const snapshot = buildUnityKnowledgeSnapshot(calculation, 'zh-CN');
    const cardIds = calculation.rounds.flatMap((round) => round.tarotCards.map((card) => card.cardId));

    assert.equal(calculation.primaryHexagram.number, 1, scenario.name);
    assert.deepEqual(calculation.movingLineIndexes, scenario.moving, scenario.name);
    assert.equal(snapshot.changed?.structure.kingWenNumber ?? null, scenario.changedNumber, scenario.name);
    assert.equal(cardIds.length, 18, scenario.name);
    assert.equal(new Set(cardIds).size, 18, scenario.name);
    snapshot.movingLines.forEach((line, index) => {
      assert.equal(line.lineIndex, scenario.moving[index], scenario.name);
      assert.equal(line.hexagramNumber, 1, scenario.name);
      assert.equal(line.canonical.sourceId, 'zhouyi-canonical-ctext', scenario.name);
    });
  });
});

test('Unity history entry preserves the completed archive as a versioned snapshot', () => {
  const calculation = calculateUnityResult(roundsForLineValues([9, 7, 8, 7, 8, 6]), {
    question: 'Should this snapshot stay exact?',
    now: '2026-08-20T10:00:00.000Z',
  });
  const archive = createUnityResultArchive(calculation, 'owner-1', '2026-08-20T10:00:00.000Z');
  const entry = createUnityHistoryEntry(archive, '2026-08-20T10:01:00.000Z');

  assert.match(entry.id, /^[0-9a-f-]{36}$/i);
  assert.equal(entry.version, '1.0.0');
  assert.equal(entry.createdAt, '2026-08-20T10:01:00.000Z');
  assert.equal(entry.question, 'Should this snapshot stay exact?');
  assert.equal(entry.primaryHexagramNumber, calculation.primaryHexagram.number);
  assert.equal(entry.changedHexagramNumber, calculation.changedHexagram.number);
  assert.equal(entry.movingLineCount, 2);
  assert.equal(entry.result, archive);
});

test('Unity history supports consecutive saves, refresh reads, and nickname isolation', () => {
  const storage = memoryStorage();
  const first = createUnityResultArchive(
    calculateUnityResult(roundsForLineValues([7, 7, 7, 7, 7, 7]), { question: 'First' }),
    'owner-1',
    '2026-08-20T08:00:00.000Z',
  );
  const second = createUnityResultArchive(
    calculateUnityResult(roundsForLineValues([9, 7, 7, 7, 7, 7]), { question: 'Second' }),
    'owner-1',
    '2026-08-20T09:00:00.000Z',
  );

  appendUnityHistory(first, 'Alice', storage, '2026-08-20T08:00:00.000Z');
  const afterSecond = appendUnityHistory(second, 'Alice', storage, '2026-08-20T09:00:00.000Z');
  appendUnityHistory(first, 'Bob', storage, '2026-08-20T10:00:00.000Z');

  assert.deepEqual(afterSecond.map((entry) => entry.question), ['Second', 'First']);
  assert.deepEqual(readUnityHistory('Alice', storage).map((entry) => entry.question), ['Second', 'First']);
  assert.deepEqual(readUnityHistory('Bob', storage).map((entry) => entry.question), ['First']);
  assert.notEqual(getUnityHistoryKey('Alice'), getUnityHistoryKey('Bob'));
});

test('Unity history delete and clear mutate only the requested nickname archive', () => {
  const storage = memoryStorage();
  const archive = createUnityResultArchive(
    calculateUnityResult(roundsForLineValues([9, 9, 7, 7, 7, 7]), { question: 'Keep the snapshot' }),
    'owner-1',
    '2026-08-20T09:00:00.000Z',
  );
  const alice = appendUnityHistory(archive, 'Alice', storage, '2026-08-20T09:00:00.000Z');
  appendUnityHistory(archive, 'Bob', storage, '2026-08-20T09:00:00.000Z');

  assert.deepEqual(removeUnityHistoryEntry(alice[0].id, 'Alice', storage), []);
  assert.equal(readUnityHistory('Bob', storage).length, 1);
  clearUnityHistory('Bob', storage);
  assert.equal(readUnityHistory('Bob', storage).length, 0);
  assert.equal(storage.getItem(getUnityHistoryKey('Alice')), '[]');
});

test('Unity history search matches question, hexagram numbers, and saved date text', () => {
  const archive = createUnityResultArchive(
    calculateUnityResult(roundsForLineValues([9, 7, 7, 7, 7, 7]), { question: 'Long-term direction' }),
    'owner-1',
    '2026-08-20T09:00:00.000Z',
  );
  const entry = createUnityHistoryEntry(archive, '2026-08-20T09:30:00.000Z');

  assert.equal(filterUnityHistory([entry], 'long-term', 'en-US').length, 1);
  assert.equal(filterUnityHistory([entry], String(entry.primaryHexagramNumber), 'en-US').length, 1);
  assert.equal(filterUnityHistory([entry], String(entry.changedHexagramNumber), 'en-US').length, 1);
  assert.equal(filterUnityHistory([entry], '2026-08-20', 'en-US').length, 1);
  assert.equal(filterUnityHistory([entry], 'not present', 'en-US').length, 0);
});

test('Unity history rejects corrupt storage without touching another namespace', () => {
  const storage = memoryStorage();
  storage.setItem(getUnityHistoryKey('Alice'), '{broken');
  storage.setItem(getUnityHistoryKey('Bob'), '[]');
  assert.deepEqual(readUnityHistory('Alice', storage), []);
  assert.equal(storage.getItem(getUnityHistoryKey('Bob')), '[]');
});

test('Unity history page exposes search, replay, delete, and clear controls without calculation access', () => {
  const source = readFileSync(new URL('../src/pages/UnityHistoryPage.jsx', import.meta.url), 'utf8');
  assert.match(source, /filterUnityHistory/);
  assert.match(source, /onOpenEntry/);
  assert.match(source, /onDeleteEntry/);
  assert.match(source, /onClearAll/);
  assert.match(source, /window\.confirm/);
  assert.doesNotMatch(source, /calculateUnityResult|calculateUnityReading|buildUnityKnowledgeSnapshot/);
});

test('Unity history copy and responsive archive styles exist in every locale', () => {
  const requiredKeys = [
    'title', 'eyebrow', 'searchLabel', 'searchPlaceholder', 'recordCount',
    'emptyTitle', 'emptyDescription', 'noMatchesTitle', 'noMatchesDescription',
    'primaryHexagram', 'changedHexagram', 'noChangedHexagram', 'movingLineCount',
    'openDetail', 'deleteEntry', 'clearAll', 'confirmDelete', 'confirmClear', 'versionLabel',
  ];
  for (const locale of [zhCN, en, it]) {
    requiredKeys.forEach((key) => assert.ok(locale.unityHistory?.[key], `Missing unityHistory.${key}`));
  }
  const css = readFileSync(new URL('../src/solar.css', import.meta.url), 'utf8');
  assert.match(css, /\.unity-history-page/);
  assert.match(css, /\.unity-history-search/);
  assert.match(css, /\.unity-history-record/);
  assert.match(css, /\.unity-history-actions/);
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
