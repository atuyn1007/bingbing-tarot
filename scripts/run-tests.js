import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { isDefinitiveAuthFailure, isSessionExpiredAt, SESSION_MAX_AGE_MS } from '../src/sessionUtils.js';
import {
  getCalendarDayState,
  getDisplaySignInDate,
  getLocalDateKey,
  getMonthCalendarDays,
  isSameCalendarMonth,
} from '../src/dateUtils.js';
import { getCardArtwork } from '../src/cardArtwork.js';
import { findTarotMeaningCard, getLocalizedMeaningCard, getTarotMeaningCard } from '../src/cardMeanings.js';
import { getReadingFromMeaningArchive } from '../src/readingMeanings.js';
import { calculateUnityReading } from '../src/unitySpread.js';
import {
  appendUnityHistory,
  clearUnityHistory,
  createUnityHistoryEntry,
  filterUnityHistory,
  getUnityHistoryKey,
  readUnityHistory,
  removeUnityHistoryEntry,
} from '../src/unityHistoryStore.js';
import {
  getChoiceDisplayGroups,
  hasCompleteChoiceOptions,
  normalizeChoiceOptions,
} from '../src/choiceSpreadUtils.js';
import zhCN from '../src/i18n/locales/zh-CN.ts';
import en from '../src/i18n/locales/en.ts';
import it from '../src/i18n/locales/it.ts';

const tests = [
  {
    name: 'unity history creates an immutable versioned snapshot with the full casting result',
    run() {
      const cards = Array.from({ length: 18 }, (_, index) => ({
        id: index,
        name: `Card ${index + 1}`,
        englishName: `Card ${index + 1}`,
        isReversed: index % 3 === 0,
      }));
      const reading = calculateUnityReading(cards, { question: 'History snapshot', now: '2026-07-19T08:00:00.000Z' });
      const entry = createUnityHistoryEntry(reading, '2026-07-19T09:00:00.000Z');

      assert.match(entry.id, /^[0-9a-f]{8}-[0-9a-f-]{27}$/i);
      assert.equal(entry.version, '1.0.0');
      assert.equal(entry.createdAt, '2026-07-19T09:00:00.000Z');
      assert.equal(entry.primaryHexagramNumber, reading.primaryHexagram.number);
      assert.equal(entry.changedHexagramNumber, reading.changedHexagram.number);
      assert.equal(entry.primaryHexagramName, '乾');
      assert.equal(entry.changedHexagramName, '乾');
      assert.deepEqual(entry.movingLineIndexes, reading.movingLineIndexes);
      assert.deepEqual(entry.result, reading);
      assert.notEqual(entry.result, reading);
      assert.equal(entry.result.rounds.length, 6);
      assert.equal(entry.result.rounds.every((round) => round.tarotCards.length === 3), true);
    },
  },
  {
    name: 'unity history persists per nickname in newest-first order and keeps accounts isolated',
    run() {
      const storage = new Map();
      const memoryStorage = {
        getItem: (key) => storage.get(key) || null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      };
      const reading = {
        primaryHexagram: { number: 40 }, changedHexagram: { number: 60 }, movingLineIndexes: [1, 4],
        rounds: Array.from({ length: 6 }, () => ({ tarotCards: Array.from({ length: 3 }, () => ({})) })),
      };
      appendUnityHistory(reading, 'bing', memoryStorage, '2026-07-19T08:00:00.000Z');
      appendUnityHistory({ ...reading, primaryHexagram: { number: 1 } }, 'bing', memoryStorage, '2026-07-19T10:00:00.000Z');
      appendUnityHistory(reading, 'other', memoryStorage, '2026-07-19T11:00:00.000Z');

      const bingEntries = readUnityHistory('bing', memoryStorage);
      assert.equal(getUnityHistoryKey('bing'), 'tarot_unity_history_bing');
      assert.equal(bingEntries.length, 2);
      assert.equal(bingEntries[0].primaryHexagramNumber, 1);
      assert.equal(readUnityHistory('other', memoryStorage).length, 1);
    },
  },
  {
    name: 'unity history filters by hexagram number and date and only deletes its current namespace',
    run() {
      const storage = new Map();
      const memoryStorage = { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) };
      const reading = { primaryHexagram: { number: 40 }, changedHexagram: { number: 60 }, movingLineIndexes: [2], rounds: Array.from({ length: 6 }, () => ({ tarotCards: Array.from({ length: 3 }, () => ({})) })) };
      const entries = appendUnityHistory(reading, 'bing', memoryStorage, '2026-07-19T10:00:00.000Z');
      appendUnityHistory(reading, 'other', memoryStorage, '2026-07-19T11:00:00.000Z');

      assert.equal(filterUnityHistory(entries, '60', 'en-US').length, 1);
      assert.equal(filterUnityHistory(entries, '解', 'zh-CN').length, 1);
      assert.equal(filterUnityHistory(entries, '2026-07-19', 'en-US').length, 1);
      assert.equal(removeUnityHistoryEntry(entries[0].id, 'bing', memoryStorage).length, 0);
      assert.equal(readUnityHistory('other', memoryStorage).length, 1);
      clearUnityHistory('other', memoryStorage);
      assert.equal(readUnityHistory('other', memoryStorage).length, 0);
    },
  },
  {
    name: 'unity history page renders searchable snapshot records with confirmed destructive actions only',
    run() {
      const historySource = readFileSync(new URL('../src/pages/UnityHistoryPage.jsx', import.meta.url), 'utf8');
      const solarCss = readFileSync(new URL('../src/solar.css', import.meta.url), 'utf8');

      assert.match(historySource, /filterUnityHistory/);
      assert.match(historySource, /onOpenEntry/);
      assert.match(historySource, /onDeleteEntry/);
      assert.match(historySource, /onClearAll/);
      assert.match(historySource, /window\.confirm/);
      assert.match(historySource, /primaryHexagramNumber/);
      assert.match(historySource, /changedHexagramNumber/);
      assert.match(historySource, /movingLineIndexes\.length/);
      assert.doesNotMatch(historySource, /calculateUnityReading/);
      assert.match(solarCss, /\.unity-history-page/);
    },
  },
  {
    name: 'unity history saves completed casts and replays stored snapshots without recalculating',
    run() {
      const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
      const resultSource = readFileSync(new URL('../src/pages/UnityResultPage.jsx', import.meta.url), 'utf8');

      assert.match(appSource, /from '\.\/unityHistoryStore'/);
      assert.match(appSource, /const UnityHistoryPage = lazy\(\(\) => import\('\.\/pages\/UnityHistoryPage\.jsx'\)\)/);
      assert.match(appSource, /const \[unityHistory, setUnityHistory\] = useState\(\[\]\)/);
      assert.match(appSource, /appendUnityHistory\(nextUnityReading, activeNickname\)/);
      assert.match(appSource, /setUnityReading\(entry\.result\)/);
      assert.match(appSource, /currentPage === 'unity-history'/);
      assert.match(appSource, /<UnityHistoryPage/);
      assert.doesNotMatch(appSource, /calculateUnityReading\(entry\.result/);
      assert.match(resultSource, /onOpenHistory/);
    },
  },
  {
    name: 'choice options require two non-empty trimmed values',
    run() {
      assert.deepEqual(normalizeChoiceOptions('  联系  ', ' 暂停 '), {
        choiceA: '联系',
        choiceB: '暂停',
      });
      assert.equal(hasCompleteChoiceOptions('联系', '暂停'), true);
      assert.equal(hasCompleteChoiceOptions('联系', '   '), false);
    },
  },
  {
    name: 'choice groups preserve A/B cards and presentation order',
    run() {
      const cards = ['a-now', 'b-now', 'a-future', 'b-future', 'self'];
      assert.deepEqual(
        getChoiceDisplayGroups(cards, '继续联系', '暂时不联系', '选项 A', '选项 B', '我的状态'),
        [
          { key: 'choice-a', label: 'A｜继续联系', cardIndexes: [2, 0] },
          { key: 'choice-b', label: 'B｜暂时不联系', cardIndexes: [3, 1] },
          { key: 'choice-self', label: '我的状态', cardIndexes: [4] },
        ],
      );
    },
  },
  {
    name: 'choice reading state keeps labels locally without changing Supabase history API',
    run() {
      const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
      const drawingSource = readFileSync(new URL('../src/pages/DrawingPage.jsx', import.meta.url), 'utf8');
      assert.match(appSource, /const \[choiceA, setChoiceA\] = useState\(''\)/);
      assert.match(appSource, /const \[choiceB, setChoiceB\] = useState\(''\)/);
      assert.match(appSource, /choiceA: sanitizeHistoryText\(entry\.choiceA \|\| ''\)/);
      assert.match(appSource, /choiceB: sanitizeHistoryText\(entry\.choiceB \|\| ''\)/);
      assert.match(drawingSource, /isChoiceSpread && \(/);
      assert.match(drawingSource, /disabled=\{!canConfirmQuestion\}/);
      assert.doesNotMatch(appSource, /saveSpreadHistoryRecord\([^)]*choiceA/);
    },
  },
  {
    name: 'choice result cards render saved A and B labels in fixed groups',
    run() {
      const spreadCardsSource = readFileSync(new URL('../src/components/SpreadCards.jsx', import.meta.url), 'utf8');
      const resultSource = readFileSync(new URL('../src/pages/ResultPage.jsx', import.meta.url), 'utf8');
      const cssSource = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
      assert.match(spreadCardsSource, /getChoiceDisplayGroups/);
      assert.match(spreadCardsSource, /choiceOptions/);
      assert.match(resultSource, /choiceOptions=\{choiceOptions\}/);
      assert.match(cssSource, /\.choice-spread-group/);
      assert.match(cssSource, /overflow-wrap: anywhere/);
    },
  },
  {
    name: 'choice spread keeps two outer columns and vertical card stacks at every viewport',
    run() {
      const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
      const getRuleBody = (source, selector) => {
        const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return source.match(new RegExp(`^\\s*${escapedSelector}\\s*\\{([^{}]*)\\}`, 'm'))?.[1] || '';
      };
      const getBlockBody = (source, header) => {
        const start = source.indexOf(header);
        const openingBrace = source.indexOf('{', start);
        if (start === -1 || openingBrace === -1) return '';

        let depth = 0;
        for (let index = openingBrace; index < source.length; index += 1) {
          if (source[index] === '{') depth += 1;
          if (source[index] === '}') depth -= 1;
          if (depth === 0) return source.slice(openingBrace + 1, index);
        }
        return '';
      };
      const assertTwoColumnChoiceLayout = (ruleBody) => {
        assert.match(ruleBody, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)\s*;/);
        assert.match(ruleBody, /grid-template-areas:\s*"choice-a choice-b"\s*"choice-self choice-self"\s*;/);
      };

      assert.match(getRuleBody(css, '.choice-spread-group-cards'), /grid-template-columns:\s*minmax\(0,\s*1fr\)\s*;/);
      assertTwoColumnChoiceLayout(getRuleBody(css, '.reading-spread-choice'));
      assertTwoColumnChoiceLayout(getRuleBody(getBlockBody(css, '@media (max-width: 640px)'), '.reading-spread-choice'));
      assert.match(getRuleBody(css, '.choice-spread-group-title'), /color:\s*rgba\(255, 248, 230/);
      assert.match(getRuleBody(css, '.reading-spread-choice .reading-spread-label'), /color:\s*rgba\(241, 224, 183/);
    },
  },
  {
    name: 'reading presentation uses centered manuscript sections and removes spread difficulty',
    run() {
      const resultPage = readFileSync(new URL('../src/pages/ResultPage.jsx', import.meta.url), 'utf8');
      const spreadModal = readFileSync(new URL('../src/components/modals/SpreadModal.jsx', import.meta.url), 'utf8');
      const solarCss = readFileSync(new URL('../src/solar.css', import.meta.url), 'utf8');
      const localeSources = [
        readFileSync(new URL('../src/i18n/locales/zh-CN.ts', import.meta.url), 'utf8'),
        readFileSync(new URL('../src/i18n/locales/en.ts', import.meta.url), 'utf8'),
        readFileSync(new URL('../src/i18n/locales/it.ts', import.meta.url), 'utf8'),
      ];
      const getRuleBody = (source, selector) => {
        const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return source.match(new RegExp(`^\\s*${escapedSelector}\\s*\\{([^{}]*)\\}`, 'm'))?.[1] || '';
      };

      assert.match(resultPage, /readingBody\.split\('\\n\\n'\)/);
      assert.match(resultPage, /const expectedPositionCount = spreadForCards\.positions\.length;/);
      assert.match(resultPage, /const readingPositions = readingParagraphs\.slice\(1, expectedPositionCount \+ 1\);/);
      assert.match(
        resultPage,
        /const readingSummary =\s*readingParagraphs\.length > expectedPositionCount \+ 1\s*\?\s*readingParagraphs\.at\(-1\)\s*:\s*'';/,
      );
      assert.match(resultPage, /const isChoiceA = index === 0 \|\| index === 2;/);
      assert.match(resultPage, /const isChoiceB = index === 1 \|\| index === 3;/);
      assert.match(resultPage, /const option = isChoiceA \? choiceOptions\.choiceA : choiceOptions\.choiceB;/);
      assert.match(resultPage, /\{readingCards && \(\s*<section className="reading-paper-section reading-paper-section-cards">/);
      assert.match(resultPage, /\{readingPositions\.map\(\(paragraph, index\) => \(\s*<section/);
      assert.match(resultPage, /\{readingSummary && \(\s*<section className="reading-paper-section reading-paper-section-summary">/);
      assert.ok(
        resultPage.indexOf('reading-paper-section-cards') < resultPage.indexOf('readingPositions.map')
          && resultPage.indexOf('readingPositions.map') < resultPage.indexOf('reading-paper-section-summary'),
      );
      assert.match(resultPage, /readingPositions\.length === 0 && !readingSummary && readingCursor/);
      assert.match(resultPage, /index === readingPositions\.length - 1 && !readingSummary && readingCursor/);
      assert.match(resultPage, /\{readingSummary\}\s*\{readingCursor\}/);
      assert.match(getRuleBody(solarCss, '.result-archive-page .reading-layout'), /max-width:\s*min\(100%,\s*960px\)\s*;/);
      assert.match(getRuleBody(solarCss, '.result-archive-page .reading-layout'), /margin:\s*0\s+auto\s*;/);
      assert.match(getRuleBody(solarCss, '.reading-paper-stack'), /gap:\s*clamp\(64px,\s*8vw,\s*96px\)\s*;/);
      assert.match(getRuleBody(solarCss, '.result-archive-page .reading-paper-section'), /width:\s*min\(100%,\s*900px\)\s*;/);
      assert.match(getRuleBody(solarCss, '.result-archive-page .reading-paper-section'), /margin-inline:\s*auto\s*;/);
      assert.match(getRuleBody(solarCss, '.result-archive-page .reading-paper-copy'), /max-width:\s*68ch\s*;/);
      assert.match(spreadModal, /t\('spreads\.metaTime'\)/);
      assert.match(spreadModal, /t\('spreads\.metaCards'\)/);
      assert.match(spreadModal, /t\('spreads\.metaRecommended'\)/);
      assert.match(spreadModal, /\{spread\.recommended\}/);
      assert.doesNotMatch(spreadModal, /metaDifficulty/);
      assert.doesNotMatch(spreadModal, /spread\.difficulty/);
      assert.match(getRuleBody(solarCss, '.spread-option-metadata'), /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)\s*;/);
      localeSources.forEach((localeSource) => {
        assert.match(localeSource, /cardsSectionTitle:\s*['"]/);
        assert.match(localeSource, /summarySectionTitle:\s*['"]/);
      });
    },
  },
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
    name: 'isDefinitiveAuthFailure recognizes invalid sessions and tokens',
    run() {
      assert.equal(isDefinitiveAuthFailure({ name: 'AuthSessionMissingError' }), true);
      assert.equal(isDefinitiveAuthFailure({ status: 401 }), true);
      assert.equal(isDefinitiveAuthFailure({ code: 'refresh_token_not_found' }), true);
      assert.equal(isDefinitiveAuthFailure(new Error('Invalid Refresh Token: Refresh Token Not Found')), true);
    },
  },
  {
    name: 'isDefinitiveAuthFailure preserves sessions during transient failures',
    run() {
      assert.equal(isDefinitiveAuthFailure(new TypeError('Failed to fetch')), false);
      assert.equal(isDefinitiveAuthFailure(new Error('Request timed out')), false);
      assert.equal(isDefinitiveAuthFailure({ status: 503, message: 'Service unavailable' }), false);
      assert.equal(isDefinitiveAuthFailure(null), false);
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
    name: 'monthly tarot calendar builds a Monday-first real month grid',
    run() {
      const days = getMonthCalendarDays(new Date(2026, 6, 16));
      assert.equal(days.filter((item) => item.type === 'blank').length, 2);
      assert.equal(days.filter((item) => item.type === 'day').length, 31);
      assert.equal(days.find((item) => item.day === 1)?.dateKey, '2026-07-01');
      assert.equal(days.find((item) => item.day === 31)?.dateKey, '2026-07-31');
    },
  },
  {
    name: 'monthly tarot calendar classifies completed future missed and today',
    run() {
      const today = new Date(2026, 6, 16);
      const history = { '2026-07-14': { name: 'The Sun' } };
      assert.equal(getCalendarDayState('2026-07-14', history, today), 'completed');
      assert.equal(getCalendarDayState('2026-07-15', history, today), 'missed');
      assert.equal(getCalendarDayState('2026-07-16', history, today), 'today-empty');
      assert.equal(getCalendarDayState('2026-07-17', history, today), 'future');
    },
  },
  {
    name: 'month comparison uses local calendar year and month',
    run() {
      assert.equal(isSameCalendarMonth(new Date(2026, 6, 1), new Date(2026, 6, 31)), true);
      assert.equal(isSameCalendarMonth(new Date(2026, 6, 31), new Date(2026, 7, 1)), false);
    },
  },
  {
    name: 'daily claim migration keeps authentication, locking, and coin update atomic',
    run() {
      const sql = readFileSync(new URL('../supabase-secure-daily.sql', import.meta.url), 'utf8');
      assert.match(sql, /security definer/i);
      assert.match(sql, /auth\.uid\(\)/i);
      assert.match(sql, /for update/i);
      assert.match(sql, /p_date_key text/i);
      assert.match(sql, /\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$/i);
      assert.doesNotMatch(sql, /pg_timezone_names/i);
      assert.doesNotMatch(sql, /timezone_name/i);
      assert.doesNotMatch(sql, /Asia\/Shanghai/i);
      assert.match(sql, /coin_balance\s*=\s*p\.coin_balance\s*\+\s*1/i);
      assert.match(sql, /grant execute on function public\.claim_daily_tarot\(jsonb, text\) to authenticated/i);
    },
  },
  {
    name: 'daily sign-in uses the atomic RPC with the browser local date',
    run() {
      const supabaseAppSource = readFileSync(new URL('../src/supabaseApp.js', import.meta.url), 'utf8');
      const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
      assert.match(supabaseAppSource, /rpc\('claim_daily_tarot'/);
      assert.match(supabaseAppSource, /p_date_key:\s*dateKey/);
      assert.match(appSource, /claimDailyTarot\(todayCard, todayKey\)/);
      assert.doesNotMatch(appSource, /updateDailyProfile/);
    },
  },
  {
    name: 'homepage redesign preserves every existing product action',
    run() {
      const homeSource = readFileSync(new URL('../src/pages/HomePage.jsx', import.meta.url), 'utf8');
      [
        'onOpenMessages',
        'onOpenRedeemModal',
        'onLogout',
        'onOpenHistory',
        'onDeleteHistory',
        'onDailyAction',
        'onStartFreeReading',
        'onOpenCardMeanings',
        'onOpenHumanRequest',
      ].forEach((handler) => assert.match(homeSource, new RegExp(`\\b${handler}\\b`)));
      assert.match(homeSource, /getCardArtwork\(savedDailyTarot\)/);
      assert.match(homeSource, /className="mystery-card/);
      assert.match(homeSource, /home-hero-title-line/);
      assert.match(homeSource, /t\('home\.heroHeadline'\)/);
    },
  },
  {
    name: 'homepage separates monthly Daily Cards from Recent Readings',
    run() {
      const homeSource = readFileSync(new URL('../src/pages/HomePage.jsx', import.meta.url), 'utf8');
      const calendarSource = readFileSync(new URL('../src/components/MonthlyTarotCalendar.jsx', import.meta.url), 'utf8');
      assert.match(homeSource, /<MonthlyTarotCalendar/);
      assert.doesNotMatch(homeSource, /onOpenCalendar/);
      assert.doesNotMatch(homeSource, /className="home-stats"/);
      assert.match(calendarSource, /role="gridcell"/);
      assert.match(calendarSource, /getCardArtwork\(card\)/);
      assert.match(calendarSource, /getCalendarDayState/);
      assert.doesNotMatch(calendarSource, /setCurrentPage|navigate\(/);
    },
  },
  {
    name: 'daily archive popup expands meanings without routing',
    run() {
      const modalSource = readFileSync(new URL('../src/components/modals/CalendarModal.jsx', import.meta.url), 'utf8');
      assert.match(modalSource, /import\('\.\.\/\.\.\/cardMeanings\.js'\)/);
      assert.match(modalSource, /getLocalizedMeaningCard/);
      assert.match(modalSource, /displayDailyUpright|displayDailyReversed/);
      assert.match(modalSource, /displayDetail/);
      assert.match(modalSource, /setIsExpanded/);
      assert.doesNotMatch(modalSource, /setCurrentPage|onOpenCard|navigate\(/);
    },
  },
  {
    name: 'monthly tarot calendar copy exists in every locale',
    run() {
      const required = [
        'archiveLabel', 'title', 'englishTitle', 'description', 'today',
        'previousMonth', 'nextMonth', 'completedDayAria', 'futureDayAria',
        'missedDayAria', 'dailyOracle', 'viewFullMeaning', 'hideFullMeaning',
        'close', 'upright', 'reversed',
      ];
      for (const locale of [zhCN, en, it]) {
        required.forEach((key) => assert.ok(locale.calendar[key], `missing calendar.${key}`));
        assert.equal(locale.calendar.weekdays.length, 7);
      }
    },
  },
  {
    name: 'localized history effect depends on stable language state',
    run() {
      const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
      assert.match(appSource, /\}, \[activeNickname, language\]\);/);
      assert.doesNotMatch(appSource, /\}, \[activeNickname, t\]\);/);
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
    name: 'spread readings use the completed meaning archive for upright and reversed cards',
    run() {
      const meaningArchive = { findTarotMeaningCard, getLocalizedMeaningCard };
      const card = { id: 77, isReversed: true };
      const expectedCard = getLocalizedMeaningCard(getTarotMeaningCard(77), 'zh-CN');

      assert.equal(
        getReadingFromMeaningArchive(card, true, 'zh-CN', meaningArchive, 'fallback'),
        expectedCard.displayReadingReversed,
      );
      assert.equal(
        getReadingFromMeaningArchive(card, false, 'zh-CN', meaningArchive, 'fallback'),
        expectedCard.displayReadingUpright,
      );
      assert.equal(getReadingFromMeaningArchive(card, true, 'zh-CN', null, 'fallback'), 'fallback');
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
