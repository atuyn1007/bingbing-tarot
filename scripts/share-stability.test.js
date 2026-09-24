import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('Unrelated renders keep the share export translator dependency stable', async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'tarot-share-test-'));
  const server = await createServer({ cacheDir, server: { middlewareMode: true }, appType: 'custom' });
  try {
    const i18n = await server.ssrLoadModule('/src/i18n/index.ts');
    await i18n.preloadInitialLanguage();
    const translations = [];
    function Consumer() {
      const { t } = i18n.useI18n();
      translations.push(t);
      return createElement('span', null, t('archive.shareDaily'));
    }
    for (let index = 0; index < 5; index++) {
      assert.match(renderToStaticMarkup(createElement(Consumer)), /分享今日牌卡/);
    }
    assert.ok(translations.every(t => Object.is(t, translations[0])), 'Same language must not invalidate the PNG effect');
    // Locale dictionaries must still produce different localized export labels.
    await i18n.setLanguage('en');
    assert.equal(i18n.t('archive.shareDaily'), 'Share daily card');
    await i18n.setLanguage('it');
    assert.equal(i18n.t('archive.shareDaily'), 'Condividi la carta del giorno');
    await i18n.setLanguage('zh-CN');
    assert.equal(translations[0]('archive.shareDaily'), '分享今日牌卡');
  } finally {
    await server.close();
    await rm(cacheDir, { recursive: true, force: true });
  }
});
