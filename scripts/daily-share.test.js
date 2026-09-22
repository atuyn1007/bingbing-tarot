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
