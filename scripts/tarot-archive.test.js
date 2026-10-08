import test from 'node:test';
import assert from 'node:assert/strict';
import { createTarotArchiveStore } from '../src/tarotArchiveStore.js';

function memoryStorage() {
  const data = new Map();
  return { data, blocked: false,
    getItem(key) { return data.get(key) ?? null; },
    setItem(key, value) { if (this.blocked) throw new Error('QuotaExceededError'); data.set(key, value); },
  };
}
const entry = id => ({ id, question: '工作发展', cardsData: [{ id: 4, isReversed: true }], createdAt: '2026-10-08T10:00:00Z' });
const open = storage => {
  const store = createTarotArchiveStore({ storage, nickname: 'Alice' });
  store.retry();
  return store;
};

test('migrates legacy records without deleting the backup; retains more than three after reopening', () => {
  const storage = memoryStorage();
  const legacy = JSON.stringify([entry('3'), entry('2'), entry('1')]);
  storage.setItem('tarot_recent_readings_Alice', legacy);
  const store = open(storage);
  store.update(items => [entry('4'), ...items]);
  store.update(items => [entry('5'), ...items]);
  assert.deepEqual(open(storage).getSnapshot().entries.map(item => item.id), ['5','4','3','2','1']);
  assert.equal(storage.getItem('tarot_recent_readings_Alice'), legacy);
  assert.equal(createTarotArchiveStore({ storage, nickname: 'Bob' }).getSnapshot().entries.length, 0);
});

test('failed save retains pending cards and orientations, retry persists once', () => {
  const storage = memoryStorage(); const store = open(storage);
  storage.blocked = true;
  store.update(items => [entry('1'), ...items]);
  store.update(items => [entry('2'), ...items]);
  assert.equal(store.getSnapshot().status, 'saveError');
  assert.equal(store.getSnapshot().entries.length, 2);
  storage.blocked = false; store.retry(); store.retry();
  assert.equal(store.getSnapshot().status, 'saved');
  assert.deepEqual(open(storage).getSnapshot().entries, [entry('2'), entry('1')]);
});

test('delete and clear persist independently of the legacy backup', () => {
  const storage = memoryStorage(); storage.setItem('tarot_recent_readings_Alice', JSON.stringify([entry('1'), entry('2')]));
  const store = open(storage);
  store.update(items => items.filter(item => item.id !== '1'));
  assert.deepEqual(open(storage).getSnapshot().entries, [entry('2')]);
  store.update(() => []);
  assert.deepEqual(open(storage).getSnapshot().entries, []);
});

test('corrupt archive is not overwritten, pending saves merge when read becomes available', () => {
  const storage = memoryStorage(); const store = open(storage);
  store.update(() => [entry('old')]);
  const key = [...storage.data.keys()][0];
  storage.setItem(key, '{corrupt');
  const broken = open(storage);
  assert.equal(broken.getSnapshot().status, 'loadError');
  broken.update(items => [entry('new'), ...items]);
  broken.retry();
  assert.equal(storage.getItem(key), '{corrupt');
  storage.setItem(key, JSON.stringify({ version: 1, entries: [entry('old')] }));
  broken.retry();
  assert.deepEqual(open(storage).getSnapshot().entries.map(item => item.id), ['new','old']);
});

test('migration failure is visible and retry cannot resurrect a subsequently deleted record', () => {
  const storage = memoryStorage(); storage.setItem('tarot_recent_readings_Alice', JSON.stringify([entry('1')]));
  storage.blocked = true; const store = open(storage);
  assert.equal(store.getSnapshot().status, 'saveError');
  store.update(() => []);
  storage.blocked = false; store.retry();
  assert.deepEqual(open(storage).getSnapshot().entries, []);
});

test('later updates from an older view preserve records saved by another view', () => {
  const storage = memoryStorage(); const first = open(storage); const second = open(storage);
  first.update(items => [entry('1'), ...items]);
  second.update(items => [entry('2'), ...items]);
  first.update(items => items.map(item => item.id === '1' ? { ...item, recordId: 'cloud' } : item));
  assert.equal(open(storage).getSnapshot().entries.length, 2);
  assert.equal(open(storage).getSnapshot().entries.find(item => item.id === '1').recordId, 'cloud');
});

test('legacy string-card format remains available for the existing display normalizer', () => {
  const storage = memoryStorage();
  const legacy = { id: 'legacy', question: '工作', cards: ['皇帝（逆位）'] };
  storage.setItem('tarot_recent_readings_Alice', JSON.stringify([legacy]));
  assert.deepEqual(open(storage).getSnapshot().entries, [legacy]);
});

test('blocked storage reads retain pending results and can recover without changing orientations', () => {
  const storage = memoryStorage();
  const guarded = { getItem() { throw new Error('SecurityError'); }, setItem: storage.setItem.bind(storage) };
  const store = open(guarded);
  store.update(items => [entry('1'), ...items]);
  assert.equal(store.getSnapshot().status, 'loadError');
  guarded.getItem = storage.getItem.bind(storage);
  store.retry();
  assert.deepEqual(open(storage).getSnapshot().entries, [entry('1')]);
});

test('storage notice renders a localized warning and retry in all supported languages', async () => {
  const { createServer } = await import('vite');
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { mkdtemp, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const cacheDir = await mkdtemp(join(tmpdir(), 'tarot-archive-test-'));
  const server = await createServer({ cacheDir, server: { middlewareMode: true, ws: false }, appType: 'custom' });
  try {
    const { default: Notice } = await server.ssrLoadModule('/src/components/ArchiveSaveNotice.jsx');
    for (const locale of ['zh-CN', 'en', 'it']) {
      const { default: dictionary } = await server.ssrLoadModule(`/src/i18n/locales/${locale}.ts`);
      const t = key => key.split('.').reduce((value, part) => value?.[part], dictionary);
      for (const status of ['saveError', 'loadError', 'syncError']) {
        const html = renderToStaticMarkup(createElement(Notice, { status, t, onRetry() {} }));
        assert.ok(dictionary.archiveStorage[status]);
        assert.match(html, /role="alert"/);
        assert.match(html, /<button/);
        assert.ok(html.includes(dictionary.archiveStorage[status]));
      }
      assert.equal(renderToStaticMarkup(createElement(Notice, { status: 'ready', t })), '');
    }
  } finally { await server.close(); await rm(cacheDir, { recursive: true, force: true }); }
});
