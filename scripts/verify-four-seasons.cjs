// Optional browser QA: PLAYWRIGHT_MODULE may point at a shared Playwright install.
// All Supabase requests are fulfilled locally; no test records reach production.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const output = path.resolve('outputs/four-seasons-qa');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, locale: 'zh-CN', reducedMotion: 'reduce' });
  const id = '11111111-1111-4111-8111-111111111111';
  const user = { id, aud: 'authenticated', role: 'authenticated', email: 'seasonal-qa@example.invalid', user_metadata: { nickname: 'SeasonalQA' }, app_metadata: { provider: 'email' }, created_at: '2026-01-01T00:00:00Z' };
  const profile = { id, nickname: 'SeasonalQA', coin_balance: 0, daily_history: {}, last_sign_in_date: null, today_card: null };
  const posts = [];
  await context.route('**/*.supabase.co/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    let response = [];
    if (url.pathname === '/auth/v1/user') response = user;
    else if (url.pathname.includes('/profiles')) response = profile;
    else if (url.pathname.includes('/tarot_history') && request.method() === 'POST') {
      const payload = request.postDataJSON();
      posts.push(payload);
      response = { id: posts.length, ...payload };
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) });
  });
  await context.addInitScript(({ user }) => {
    if (sessionStorage.getItem('seasonal-qa-seeded')) return;
    sessionStorage.setItem('seasonal-qa-seeded', 'true');
    localStorage.setItem('tarot_language', 'zh-CN');
    localStorage.setItem('tarot_user', JSON.stringify({ id: user.id, nickname: 'SeasonalQA' }));
    localStorage.setItem('tarot_session_started_at', String(Date.now()));
    const expires_at = Math.floor(Date.now() / 1000) + 86400;
    const token = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: user.id, exp: expires_at, role: 'authenticated' })) + '.local-test-signature';
    localStorage.setItem('bingbing-tarot-auth', JSON.stringify({ access_token: token, refresh_token: 'local-test-only', expires_at, expires_in: 86400, token_type: 'bearer', user }));
  }, { user });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const shots = [];
  const screenshot = async name => {
    await page.screenshot({ path: path.join(output, name + '.png'), fullPage: true });
    shots.push(name + '.png');
  };
  const history = () => page.evaluate(() => JSON.parse(localStorage.getItem('tarot_recent_readings_SeasonalQA') || '[]'));
  const checkCross = async () => {
    const grid = page.locator('.reading-spread-seasons').first();
    const boxes = await grid.locator('.reading-spread-slot').evaluateAll(nodes => nodes.map(node => {
      const r = node.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height };
    }));
    assert.equal(boxes.length, 5);
    const [core, swords, wands, cups, coins] = boxes;
    assert.ok(wands.x < core.x && core.x < swords.x);
    assert.ok(coins.y < core.y && cups.y > core.y);
    assert.ok(Math.abs(core.x - coins.x) < 2 && Math.abs(core.x - cups.x) < 2);
    assert.ok(Math.abs(core.y - wands.y) < 2 && Math.abs(core.y - swords.y) < 2);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Page must fit viewport');
    const images = await grid.locator('img').evaluateAll(nodes => nodes.map(node => ({ loaded: node.complete && node.naturalWidth > 0, reversed: node.classList.contains('is-reversed') })));
    assert.equal(images.length, 5);
    assert.ok(images.every(image => image.loaded), 'All five card artworks must load');
    return boxes;
  };
  try {
    await page.goto(process.env.QA_URL || 'http://127.0.0.1:5187/');
    await page.getByRole('button', { name: '选择牌阵', exact: true }).first().click();
    await page.locator('.spread-option-card').filter({ hasText: '四季牌阵' }).waitFor();
    await page.locator('.spread-option-card').filter({ hasText: '四季牌阵' }).scrollIntoViewIfNeeded();
    await screenshot('01-catalogue-desktop');
    await page.locator('.spread-option-card').filter({ hasText: '四季牌阵' }).click();
    assert.match(await page.locator('.seasonal-intro-note').innerText(), /平时也可以抽，不限次数/);
    assert.match(await page.locator('#tarot-question').inputValue(), /三个月/);
    await screenshot('02-introduction-desktop');
    await page.getByRole('button', { name: '开始洗牌', exact: true }).click();
    const groupNames = ['大阿尔卡纳', '宝剑', '权杖', '圣杯', '星币'];
    for (let group = 0; group < 5; group++) {
      await page.locator('#selection-stage-title').filter({ hasText: groupNames[group] }).waitFor();
      assert.equal(await page.locator('.selectable-card-back').count(), group === 0 ? 22 : 14);
      assert.equal((await history()).length, 0, 'Do not save an incomplete spread');
      assert.ok(await page.locator('.card-selection-confirm').isDisabled());
      const target = page.locator('.selectable-card-back').nth(group + 1);
      await target.focus();
      await target.press('Enter');
      assert.equal(await target.getAttribute('aria-pressed'), 'true');
      if (group === 0) {
        await target.press('Enter');
        assert.ok(await page.locator('.card-selection-confirm').isDisabled());
        await target.press('Enter');
        await screenshot('03-major-selection-desktop');
      }
      if (group === 3) {
        await page.setViewportSize({ width: 375, height: 900 });
        await screenshot('04-cups-selection-mobile');
      }
      await page.locator('.card-selection-confirm').click();
    }
    await page.locator('.reading-spread-seasons').waitFor();
    const saved = await history();
    assert.equal(saved.length, 1);
    assert.equal(saved[0].spreadKey, 'seasons');
    const ranges = [[0,21],[50,63],[22,35],[36,49],[64,77]];
    saved[0].cardsData.forEach((card, index) => assert.ok(card.id >= ranges[index][0] && card.id <= ranges[index][1]));
    await page.locator('.reading-spread-slot-seasons-1 button').click();
    assert.equal(await page.locator('.reading-spread-card-identity').count(), 1);
    await page.getByRole('button', { name: '全部翻开', exact: true }).click();
    await page.locator('.reading-spread-card-identity').nth(4).waitFor();
    await page.waitForFunction(() => [...document.querySelectorAll('.reading-spread-seasons img')].every(image => image.complete));
    await checkCross();
    await screenshot('05-revealed-mobile');
    await page.getByRole('button', { name: '查看完整解读', exact: true }).click();
    await page.getByRole('heading', { name: '季度综合解读' }).waitFor();
    assert.equal(await page.locator('.reading-card-file').count(), 5);
    assert.equal(await page.locator('.reading-integrated-paragraphs > p').count(), 5);
    assert.doesNotMatch(await page.locator('.reading-integrated').innerText(), /\{\w+\}|seasons\.reading/);
    for (const width of [320, 375, 430, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await checkCross();
      await screenshot(`06-result-${width}`);
    }
    const facts = JSON.stringify(saved[0].cardsData);
    for (const language of ['en', 'it', 'zh-CN']) {
      await page.evaluate(async language => { const i18n = await import('/src/i18n/index.ts'); await i18n.setLanguage(language); }, language);
      assert.equal(JSON.stringify((await history())[0].cardsData), facts);
      assert.doesNotMatch(await page.locator('.reading-integrated').innerText(), /\{\w+\}|seasons\.reading/);
    }
    await page.reload();
    await page.locator('.archive-home-record').filter({ hasText: '三个月' }).first().click();
    await page.locator('.history-preview-modal').waitFor();
    await page.getByRole('heading', { name: '季度综合解读' }).waitFor();
    await checkCross();
    await screenshot('07-history-desktop');
    await page.setViewportSize({ width: 375, height: 1000 });
    await checkCross();
    await screenshot('08-history-mobile');
    assert.equal(JSON.stringify((await history())[0].cardsData), facts);
    assert.equal(posts.length, 1, 'Only the completed draw should synchronize, once');
    assert.match(posts[0].card_name, /四季牌阵/);
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({ passed: true, screenshots: shots, savedCards: saved[0].cardsData, posts: posts.length, errors, backend: 'local mocked Supabase; production was not contacted' }, null, 2));
    console.log(JSON.stringify({ passed: true, screenshots: shots.length, widths: [320,375,430,1440], posts: posts.length, errors }));
  } catch (error) {
    await screenshot('failure');
    fs.writeFileSync(path.join(output, 'failure.txt'), `${error.stack}\n\n${await page.locator('body').innerText()}\n\n${JSON.stringify(errors)}`);
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
