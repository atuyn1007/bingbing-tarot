import test from 'node:test';
import assert from 'node:assert/strict';
import { allTarotCards } from '../src/data.js';
import { buildTarotReadingSnapshot } from '../src/buildTarotReadingSnapshot.js';
import { resolveTarotReadingSnapshot } from '../src/tarotReadingSnapshot.js';
import { createTarotArchiveStore } from '../src/tarotArchiveStore.js';
import * as archive from '../src/cardMeanings.js';

const record = key => ({ id: key, question: '工作发展', spreadKey: key, choiceA: '留在原岗位', choiceB: '换工作',
  cardsData: [4, 51, 76, 1, 2].slice(0, ['choice','seasons'].includes(key) ? 5 : 3).map((id, i) => ({ ...allTarotCards.find(card => card.id === id), isReversed: i === 0 })),
});

test('all four ordinary spreads preserve full readings and positions in all three languages', () => {
  for (const key of ['three','triangle','choice','seasons']) {
    const entry = record(key); const original = structuredClone(entry);
    const snapshot = buildTarotReadingSnapshot(entry, archive);
    assert.equal(snapshot.version, 1);
    assert.ok(snapshot.engineVersion);
    assert.deepEqual(entry, original);
    for (const language of ['zh-CN','en','it']) {
      const replay = resolveTarotReadingSnapshot({ ...entry, readingSnapshot: snapshot }, language);
      assert.equal(replay.question, '工作发展');
      assert.equal(replay.reading.cards.length, entry.cardsData.length);
      assert.equal(replay.spread.positions.length, entry.cardsData.length);
      assert.equal(replay.reading.cards[0].orientation, 'reversed');
      assert.ok(replay.reading.cards.every(card => card.baseMeaning && card.keywords.length));
      assert.ok(replay.reading.integratedReading.paragraphs.length);
      if (key === 'choice') {
        assert.equal(replay.choiceOptions.choiceA, '留在原岗位');
        assert.equal(replay.reading.choiceComparison.optionB.label, '换工作');
      }
    }
  }
});

test('archive round trip and cloud metadata updates cannot discard or rewrite the saved reading', () => {
  const data = new Map(); const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  const entry = record('three'); entry.readingSnapshot = buildTarotReadingSnapshot(entry, archive);
  const expected = JSON.stringify(entry.readingSnapshot);
  const store = createTarotArchiveStore({ storage, nickname: 'test' });
  store.update(() => [entry]);
  store.update(items => items.map(item => ({ ...item, recordId: 'cloud-1' })));
  const saved = createTarotArchiveStore({ storage, nickname: 'test' }).getSnapshot().entries[0];
  for (const lang of ['en','it','zh-CN']) assert.ok(resolveTarotReadingSnapshot(saved, lang));
  assert.equal(JSON.stringify(saved.readingSnapshot), expected);
  // Later changes to the non-snapshot fields must not replace archived facts.
  saved.question = '不同的问题'; saved.cardsData.reverse();
  assert.equal(resolveTarotReadingSnapshot(saved, 'zh-CN').question, '工作发展');
  assert.equal(resolveTarotReadingSnapshot(saved, 'zh-CN').cards[0].id, 4);
});

test('missing, unsupported and malformed snapshots do not generate replacement interpretations', () => {
  const entry = record('three');
  assert.equal(resolveTarotReadingSnapshot(entry, 'zh-CN'), null);
  const snapshot = JSON.parse(JSON.stringify(buildTarotReadingSnapshot(entry, archive)));
  assert.equal(resolveTarotReadingSnapshot({ readingSnapshot: { ...snapshot, version: 99 } }, 'zh-CN'), null);
  snapshot.byLanguage['zh-CN'].reading.cards[0].keywords = null;
  assert.equal(resolveTarotReadingSnapshot({ readingSnapshot: snapshot }, 'zh-CN'), null);
});

test('history modal renders complete archived text and explains legacy records without inventing a reading', async () => {
  const { createServer } = await import('vite');
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { mkdtemp, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const cacheDir = await mkdtemp(join(tmpdir(), 'reading-snapshot-'));
  const server = await createServer({ cacheDir, server: { middlewareMode: true, ws: false }, appType: 'custom' });
  try {
    const { default: History } = await server.ssrLoadModule('/src/components/modals/HistoryModal.jsx');
    const i18n = await server.ssrLoadModule('/src/i18n/index.ts');
    await i18n.preloadInitialLanguage();
    const entry = record('choice'); entry.readingSnapshot = buildTarotReadingSnapshot(entry, archive);
    for (const language of ['zh-CN','en','it']) {
      await i18n.setLanguage(language);
      const replay = resolveTarotReadingSnapshot(entry, language);
      replay.reading.cards[0].baseMeaning = 'ARCHIVED-BASE-MEANING';
      replay.reading.integratedReading.summary = 'ARCHIVED-SUMMARY';
      const html = renderToStaticMarkup(createElement(History, { reading: entry, replay, spread: replay.spread, t: i18n.t }));
      assert.match(html, /ARCHIVED-BASE-MEANING/);
      assert.match(html, /ARCHIVED-SUMMARY/);
      for (const section of replay.reading.cards) assert.ok(html.includes(section.cardName));
      const legacy = renderToStaticMarkup(createElement(History, { reading: record('choice'), spread: replay.spread, t: i18n.t }));
      assert.ok(legacy.includes(i18n.t('historySnapshot.unavailable')));
      assert.doesNotMatch(legacy, /ARCHIVED-SUMMARY|ARCHIVED-BASE-MEANING/);
    }
  } finally { await server.close(); await rm(cacheDir, { recursive: true, force: true }); }
});
