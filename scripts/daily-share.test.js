import test from 'node:test';
import assert from 'node:assert/strict';
import { renderDailyTarotShare } from '../src/dailyTarotShare.js';
import zh from '../src/i18n/locales/zh-CN.ts';
import en from '../src/i18n/locales/en.ts';
import it from '../src/i18n/locales/it.ts';

// Canvas is the browser boundary. Assert renderer commands, not pixel appearance.
function browserBoundary(fail = false) {
  const text = [], rotations = [];
  const context = { fillRect() {}, strokeRect() {}, save() {}, restore() {}, translate() {}, drawImage() {},
    rotate(value) { rotations.push(value); }, measureText(value) { return { width: [...value].length * 30 }; },
    fillText(value) { text.push(value); } };
  const canvas = { getContext: () => context, toBlob: callback => callback(new Blob(['png'], { type: 'image/png' })) };
  globalThis.document = { createElement: () => canvas, fonts: { ready: Promise.resolve() } };
  globalThis.Image = class {
    naturalWidth = 300; naturalHeight = 500;
    set src(value) { if (value) queueMicrotask(() => fail ? this.onerror?.() : this.onload?.()); }
  };
  return { canvas, text, rotations };
}
const t = key => key;
test('Spread sharing preserves existing cards and Unity bottom-to-top data', async () => {
  const { getSpreadShareData, renderSpreadShare } = await import('../src/spreadShare.js');
  const cards = Array.from({ length: 18 }, (_, id) => ({ id, name: `card-${id}`, englishName: `Card ${id}`, isReversed: id % 2 === 0 }));
  for (const key of ['three', 'triangle', 'choice', 'seasons', 'unity']) {
    const count = key === 'unity' ? 18 : ['choice','seasons'].includes(key) ? 5 : 3;
    const input = { cards: cards.slice(0, count), question: '我的问题'.repeat(50), spread: { key, name: key, positions: cards.map((_, i) => ({ title: `position-${i}` })) }, choiceOptions: { choiceA: 'Route A', choiceB: 'Route B' }, language: 'zh-CN', t };
    if (key === 'unity') input.calculation = { question: input.question, rounds: Array.from({ length: 6 }, (_, i) => ({ lineIndex: i + 1, tarotCards: cards.slice(i * 3, i * 3 + 3).map(card => ({ ...card, cardId: card.id })) })) };
    const before = JSON.stringify(input);
    const share = getSpreadShareData(input);
    const flat = share.rows.flat().filter(Boolean);
    if (key === 'triangle') assert.deepEqual(share.rows.map(row => row.map(card => card?.id ?? null)), [[0,null,1],[null,2,null]]);
    if (key === 'choice') assert.deepEqual(share.rows.map(row => row.map(card => card?.id ?? null)), [[0,4,1],[2,null,3]]);
    if (key === 'seasons') assert.deepEqual(share.rows.map(row => row.map(card => card?.id ?? null)), [[null,4,null],[2,0,1],[null,3,null]]);
    assert.equal(flat.length, count);
    assert.equal(new Set(flat.map(card => card.id)).size, count);
    if (key === 'unity') assert.deepEqual(flat.map(card => card.id), [15,16,17,12,13,14,9,10,11,6,7,8,3,4,5,0,1,2]);
    const boundary = browserBoundary();
    await renderSpreadShare({ data: share, t });
    assert.equal(boundary.rotations.length, flat.filter(card => card.isReversed).length);
    assert.ok(boundary.text.join('').includes(input.question));
    flat.forEach(card => assert.ok(boundary.text.includes(card.name)));
    assert.equal(JSON.stringify(input), before);
  }
});
test('Spread export fails safely on artwork errors, cancellation and an empty result', async () => {
  const { renderSpreadShare } = await import('../src/spreadShare.js');
  const data = { title: 'Test', question: '', rows: [[{ id: 0, name: 'Fool', position: 'One' }, null, null]] };
  browserBoundary(true);
  await assert.rejects(renderSpreadShare({ data, t }), /Artwork unavailable/);
  browserBoundary();
  const controller = new AbortController(); controller.abort();
  await assert.rejects(renderSpreadShare({ data, t, signal: controller.signal }), { name: 'AbortError' });
  await assert.rejects(renderSpreadShare({ data: { ...data, rows: [] }, t }), /Empty/);
});
test('Spread image localizes labels and card names in Chinese, English and Italian', async () => {
  const { getSpreadShareData, renderSpreadShare } = await import('../src/spreadShare.js');
  for (const [language, dictionary, expected] of [['zh-CN', zh, '愚人'], ['en', en, 'The Fool'], ['it', it, 'Il Matto']]) {
    const translate = key => key.split('.').reduce((value, part) => value?.[part], dictionary);
    assert.ok(translate('reading.shareSpread'));
    const data = getSpreadShareData({ cards: [{id: 0, name: '愚人', englishName: 'The Fool', isReversed: true}], spread: { key: 'three', name: 'Test', positions: [{ title: '01' }] }, question: '', language, t: translate });
    const boundary = browserBoundary();
    await renderSpreadShare({ data, t: translate });
    assert.ok(boundary.text.includes(expected));
    assert.ok(boundary.text.includes(translate('common.orientationReversed')));
  }
});
const data = { artwork: 'fixture.png', dateKey: '2026-08-02', name: 'Saved card', isReversed: true, keywords: ['A'], summary: '完整段落'.repeat(100) };

test('Daily export draws saved reverse orientation, historical date and full long text', async () => {
  const boundary = browserBoundary();
  const before = JSON.stringify(data);
  const blob = await renderDailyTarotShare({ data, t });
  assert.equal(blob.type, 'image/png');
  assert.deepEqual(boundary.rotations, [Math.PI]);
  assert.ok(boundary.text.includes('2026-08-02'));
  assert.ok(boundary.text.includes('common.orientationReversed'));
  assert.ok(boundary.text.join('').includes(data.summary));
  assert.ok(boundary.canvas.height > 1500);
  assert.equal(JSON.stringify(data), before);
});

test('Daily export keeps upright cards upright', async () => {
  const boundary = browserBoundary();
  await renderDailyTarotShare({ data: { ...data, isReversed: false }, t });
  assert.deepEqual(boundary.rotations, []);
  assert.ok(boundary.text.includes('common.orientationUpright'));
});

test('Daily export rejects failed artwork and cancellation instead of saving blank images', async () => {
  browserBoundary(true);
  await assert.rejects(renderDailyTarotShare({ data, t }), /Artwork unavailable/);
  browserBoundary();
  const controller = new AbortController(); controller.abort();
  await assert.rejects(renderDailyTarotShare({ data, t, signal: controller.signal }), { name: 'AbortError' });
});

test('Unified archive and daily share copy is present in all supported languages', () => {
  for (const locale of [zh, en, it]) {
    for (const key of ['title', 'all', 'daily', 'tarot', 'unity', 'open', 'shareDaily', 'search', 'clear', 'confirmClear', 'dailyPreserved']) {
      assert.ok(locale.archive[key]);
    }
  }
});
