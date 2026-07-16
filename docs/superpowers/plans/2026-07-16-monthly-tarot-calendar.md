# Monthly Tarot Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a seven-column collectible Monthly Tarot Calendar to the homepage, remove Daily Card access from Recent Readings, and open completed days in an in-place archive-paper detail popup.

**Architecture:** `dailyHistory` remains owned by `App.jsx` and is passed unchanged to `HomePage`. A focused `MonthlyTarotCalendar` component owns displayed-month and selected-day UI state, uses pure date helpers from `dateUtils.js`, and reuses the existing `CalendarModal` file as the selected-day archive popup. Detailed meanings are loaded lazily only when a completed day is opened.

**Tech Stack:** React 18, Vite 5, Framer Motion 11, Lucide React, project CSS tokens/material layers, Node assertion test runner.

## Global Constraints

- Do not change Daily Card draw, claim, persistence, database, history, or routing logic.
- Keep the existing black celestial, museum archive, aged-paper, restrained-gold visual language.
- Desktop and mobile calendars both use exactly seven columns without horizontal overflow.
- Calendar cells contain only the day number, a miniature tarot artwork or empty-state mark, and the Today badge when applicable.
- Completed days open a modal; incomplete days never navigate or open a modal.
- “查看完整牌义” expands content inside the same popup and never changes routes.
- Do not stage or modify existing unrelated changes in `dist/`, `node_modules/`, `supabase-redeem-codes.sql`, `outputs/`, or `牌意.docx`.

---

## File Structure

- Modify `src/dateUtils.js`: pure month-grid, month-comparison, and cell-state helpers.
- Create `src/components/MonthlyTarotCalendar.jsx`: homepage calendar, month switcher, day buttons, selected-day UI state, lazy meaning resolution.
- Modify `src/components/modals/CalendarModal.jsx`: replace the old month grid with a selected-day archive-paper dialog.
- Modify `src/pages/HomePage.jsx`: insert the new section before Recent Readings and remove Daily Card/calendar controls from the history rail.
- Modify `src/App.jsx`: pass calendar presentation data to `HomePage`; remove obsolete global calendar-modal state/rendering and duplicate calendar helpers.
- Modify `src/i18n/locales/zh-CN.ts`, `src/i18n/locales/en.ts`, `src/i18n/locales/it.ts`: calendar labels, accessibility copy, and popup actions.
- Modify `src/solar.css`: homepage calendar and archive-popup visual treatment, responsive seven-column rules, hover, unfolding motion, and reduced-motion overrides.
- Modify `scripts/run-tests.js`: pure date-state tests and source-contract tests for homepage separation and non-navigation.

---

### Task 1: Extract Testable Calendar Date State

**Files:**
- Modify: `src/dateUtils.js`
- Modify: `scripts/run-tests.js`
- Modify: `src/App.jsx:89-137`

**Interfaces:**
- Produces: `getMonthCalendarDays(date: Date): CalendarCell[]`
- Produces: `getCalendarDayState(dateKey: string, dailyHistory: object, today?: Date): 'completed' | 'today-empty' | 'future' | 'missed'`
- Produces: `isSameCalendarMonth(left: Date, right: Date): boolean`
- Reuses: `getLocalDateKey(date: Date): string`

- [ ] **Step 1: Add failing pure-helper tests**

Update the date-utils import in `scripts/run-tests.js`:

```js
import {
  getCalendarDayState,
  getDisplaySignInDate,
  getLocalDateKey,
  getMonthCalendarDays,
  isSameCalendarMonth,
} from '../src/dateUtils.js';
```

Add these test cases to `tests`:

```js
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
```

- [ ] **Step 2: Run tests and confirm the new exports are missing**

Run: `npm test`

Expected: FAIL during module import because the three new date helpers are not exported.

- [ ] **Step 3: Implement the pure helpers**

Append to `src/dateUtils.js`:

```js
export function getMonthCalendarDays(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leadingBlankDays = (firstDay.getDay() + 6) % 7;
  const days = Array.from({ length: leadingBlankDays }, (_, index) => ({
    type: 'blank',
    key: `blank-${year}-${month}-${index}`,
  }));

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const currentDate = new Date(year, month, day);
    const dateKey = getLocalDateKey(currentDate);
    days.push({ type: 'day', key: dateKey, day, dateKey });
  }

  return days;
}

export function getCalendarDayState(dateKey, dailyHistory = {}, today = new Date()) {
  if (dailyHistory?.[dateKey]) return 'completed';
  const todayKey = getLocalDateKey(today);
  if (dateKey === todayKey) return 'today-empty';
  return dateKey > todayKey ? 'future' : 'missed';
}

export function isSameCalendarMonth(left, right) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}
```

- [ ] **Step 4: Remove duplicate helpers from `App.jsx`**

Delete local `getMonthLabel`, `getDateKey`, and `buildCalendarDays` only after confirming they have no remaining consumers. Do not change `getDisplaySignInDate` or daily-claim date construction.

- [ ] **Step 5: Run tests**

Run: `npm test`

Expected: all tests pass, including the three new calendar-helper tests.

- [ ] **Step 6: Commit the helper extraction**

```powershell
git add -- src/dateUtils.js scripts/run-tests.js src/App.jsx
git commit -m "refactor: extract monthly calendar date helpers"
```

---

### Task 2: Build the Homepage Monthly Tarot Calendar

**Files:**
- Create: `src/components/MonthlyTarotCalendar.jsx`
- Modify: `src/pages/HomePage.jsx`
- Modify: `src/App.jsx`
- Modify: `scripts/run-tests.js`

**Interfaces:**
- Consumes: `dailyHistory`, `intlLocale`, `language`, `t`, `getCardDisplayNames`
- Consumes: `getMonthCalendarDays`, `getCalendarDayState`, `isSameCalendarMonth`
- Produces: `MonthlyTarotCalendar` default React component
- Produces: selected completed-day props for `CalendarModal`

- [ ] **Step 1: Replace the outdated homepage source-contract test with failing calendar contracts**

In the existing `homepage redesign preserves every existing product action` test, remove `onOpenCalendar` from the preserved-handler list and add a separate test:

```js
{
  name: 'homepage separates monthly Daily Cards from Recent Readings',
  run() {
    const homeSource = readFileSync(new URL('../src/pages/HomePage.jsx', import.meta.url), 'utf8');
    const calendarSource = readFileSync(new URL('../src/components/MonthlyTarotCalendar.jsx', import.meta.url), 'utf8');
    assert.match(homeSource, /<MonthlyTarotCalendar/);
    assert.doesNotMatch(homeSource, /onOpenCalendar/);
    assert.doesNotMatch(homeSource, /className="home-stats"/);
    assert.match(calendarSource, /gridcell/);
    assert.match(calendarSource, /getCardArtwork\(card\)/);
    assert.match(calendarSource, /getCalendarDayState/);
    assert.doesNotMatch(calendarSource, /setCurrentPage|navigate\(/);
  },
},
```

- [ ] **Step 2: Run tests and confirm the component is missing**

Run: `npm test`

Expected: FAIL with `ENOENT` for `src/components/MonthlyTarotCalendar.jsx`.

- [ ] **Step 3: Create `MonthlyTarotCalendar.jsx` with presentation-only state**

Implement these imports and state boundaries:

```jsx
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Circle, Moon } from 'lucide-react';
import { getCardArtwork } from '../cardArtwork';
import { getCalendarDayState, getMonthCalendarDays, isSameCalendarMonth } from '../dateUtils';
import CalendarModal from './modals/CalendarModal';

function MonthlyTarotCalendar({ dailyHistory, intlLocale, language, t, getCardDisplayNames }) {
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);
  const days = useMemo(() => getMonthCalendarDays(visibleMonth), [visibleMonth]);
  const isCurrentMonth = isSameCalendarMonth(visibleMonth, today);
  const monthLabel = new Intl.DateTimeFormat(intlLocale, { year: 'numeric', month: 'long' }).format(visibleMonth);
  // render section header, month controls, weekday row, seven-column grid, and CalendarModal
}
```

For every actual day, derive `card` and `state`. Render completed days as `<button role="gridcell">` with `getCardArtwork(card)`, a localized accessible label, and `onClick={() => setSelectedDay({ dateKey: item.dateKey, card })}`. Render future, missed, and today-empty days as non-interactive `<div role="gridcell">` using `Moon` or `Circle`. Rotate only the image for reversed cards.

Month controls must use:

```jsx
setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
```

Disable the next control when `isCurrentMonth` is true. Pass `selectedDay`, `language`, `intlLocale`, `getCardDisplayNames`, `t`, and `onClose={() => setSelectedDay(null)}` to `CalendarModal`.

- [ ] **Step 4: Insert the section and narrow Recent Readings**

In `HomePage.jsx`:

- import `MonthlyTarotCalendar`;
- replace props `lastSignInDate` and `onOpenCalendar` with `dailyHistory`, `intlLocale`, and `language`;
- render `<MonthlyTarotCalendar ... />` immediately before the Recent Readings utility rail;
- delete the complete `.home-stats` block;
- keep `recentReadings`, `onOpenHistory`, `onDeleteHistory`, and `formatHistorySummary` unchanged.

In `App.jsx`:

- pass `dailyHistory`, `intlLocale`, and `language` to `HomePage`;
- remove `showCalendarModal`, its setter, the `CalendarModal` lazy import, and the old global modal render;
- remove `calendarDate`, `calendarDays`, and `monthLabel` values;
- do not alter `dailyHistory` state or profile synchronization.

- [ ] **Step 5: Run tests**

Run: `npm test`

Expected: all tests pass; the homepage contract confirms Daily Cards and Recent Readings are separated.

- [ ] **Step 6: Commit the calendar structure**

```powershell
git add -- src/components/MonthlyTarotCalendar.jsx src/pages/HomePage.jsx src/App.jsx scripts/run-tests.js
git commit -m "feat: add homepage monthly tarot calendar"
```

---

### Task 3: Repurpose the Calendar Modal as a Daily Archive Popup

**Files:**
- Modify: `src/components/modals/CalendarModal.jsx`
- Modify: `scripts/run-tests.js`

**Interfaces:**
- Consumes: `selectedDay: { dateKey: string, card: object }`
- Consumes: `language`, `intlLocale`, `getCardDisplayNames`, `t`, `onClose`
- Lazily consumes: `findTarotMeaningCard`, `getLocalizedMeaningCard` from `src/cardMeanings.js`
- Produces: in-modal `isExpanded` state and resolved localized Daily Oracle/full meaning

- [ ] **Step 1: Add failing archive-popup source contracts**

Add to `scripts/run-tests.js`:

```js
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
```

- [ ] **Step 2: Run tests and verify the old text-calendar modal fails the contract**

Run: `npm test`

Expected: FAIL because the old modal has no lazy meaning import or in-place expansion.

- [ ] **Step 3: Implement selected-day archive content**

Change the component signature to:

```jsx
function CalendarModal({ selectedDay, language, intlLocale, getCardDisplayNames, onClose, t })
```

Use `useEffect` to reset expansion and lazily resolve the selected card:

```jsx
useEffect(() => {
  let cancelled = false;
  setIsExpanded(false);
  setMeaning(null);
  import('../../cardMeanings.js').then(({ findTarotMeaningCard, getLocalizedMeaningCard }) => {
    const resolved = findTarotMeaningCard(selectedDay.card);
    if (!cancelled && resolved) setMeaning(getLocalizedMeaningCard(resolved, language));
  }).catch(() => {
    if (!cancelled) setMeaning(null);
  });
  return () => { cancelled = true; };
}, [selectedDay, language]);
```

Derive:

```jsx
const artwork = getCardArtwork(selectedDay.card);
const names = getCardDisplayNames(selectedDay.card);
const shortOracle = selectedDay.card.isReversed
  ? meaning?.displayDailyReversed
  : meaning?.displayDailyUpright;
const fullMeaning = meaning?.displayDetail;
const dateLabel = new Intl.DateTimeFormat(intlLocale, {
  year: 'numeric', month: 'long', day: 'numeric',
}).format(new Date(`${selectedDay.dateKey}T12:00:00`));
```

Render a dialog-labelled parchment with the large complete artwork, date, localized card names, orientation, short oracle, expandable full meaning, and explicit expand/close buttons. Preserve backdrop close. Add an Escape-key effect while open. Do not render a calendar grid inside the popup.

- [ ] **Step 4: Run tests**

Run: `npm test`

Expected: all tests pass, including the no-navigation popup contract.

- [ ] **Step 5: Commit the popup behavior**

```powershell
git add -- src/components/modals/CalendarModal.jsx scripts/run-tests.js
git commit -m "feat: add Daily Card archive popup"
```

---

### Task 4: Add Localized Calendar Copy

**Files:**
- Modify: `src/i18n/locales/zh-CN.ts`
- Modify: `src/i18n/locales/en.ts`
- Modify: `src/i18n/locales/it.ts`
- Modify: `scripts/run-tests.js`

**Interfaces:**
- Produces keys under `calendar`: `archiveLabel`, `title`, `englishTitle`, `description`, `today`, `previousMonth`, `nextMonth`, `completedDayAria`, `futureDayAria`, `missedDayAria`, `dailyOracle`, `viewFullMeaning`, `hideFullMeaning`, `close`, `upright`, `reversed`

- [ ] **Step 1: Add a failing locale-parity test**

Add these exact default imports to `scripts/run-tests.js`, then add the test:

```js
import zhCN from '../src/i18n/locales/zh-CN.ts';
import en from '../src/i18n/locales/en.ts';
import it from '../src/i18n/locales/it.ts';
```

```js
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
```

- [ ] **Step 2: Run tests and confirm missing keys**

Run: `npm test`

Expected: FAIL on `calendar.archiveLabel`.

- [ ] **Step 3: Add complete translations**

Use these Chinese source meanings and equivalent fluent English/Italian copy:

```ts
calendar: {
  archiveLabel: '私人神谕档案 · ARCHIVE 04',
  title: '本月日历',
  englishTitle: 'MONTHLY TAROT CALENDAR',
  description: '回看本月每一次日运抽牌，像翻阅一册只属于你的神谕日志。',
  today: 'Today',
  previousMonth: '上一个月',
  nextMonth: '下一个月',
  completedDayAria: '{date}，{card}，{orientation}',
  futureDayAria: '{date}，尚未到来',
  missedDayAria: '{date}，未抽取',
  dailyOracle: '今日神谕',
  viewFullMeaning: '查看完整牌义',
  hideFullMeaning: '收起完整牌义',
  close: '关闭',
  upright: '正位',
  reversed: '逆位',
}
```

Retain the existing Monday-first `weekdays` arrays. Replace obsolete `unsigned` copy only if it has no remaining consumers.

- [ ] **Step 4: Run tests**

Run: `npm test`

Expected: all locale-parity and existing tests pass.

- [ ] **Step 5: Commit translations**

```powershell
git add -- src/i18n/locales/zh-CN.ts src/i18n/locales/en.ts src/i18n/locales/it.ts scripts/run-tests.js
git commit -m "i18n: add monthly tarot calendar copy"
```

---

### Task 5: Apply Archive Calendar and Popup Styling

**Files:**
- Modify: `src/solar.css`

**Interfaces:**
- Styles: `.monthly-tarot-calendar`, `.monthly-calendar-head`, `.monthly-calendar-grid`, `.monthly-calendar-cell`, `.monthly-calendar-miniature`, `.calendar-archive-modal`, `.calendar-archive-paper`, `.calendar-archive-artwork`, `.calendar-archive-meaning`
- Responsive contract: seven columns at every viewport; 28–40px artwork height; no horizontal overflow

- [ ] **Step 1: Add the section container and editorial header styles**

Append a scoped homepage block that uses existing variables:

```css
.monthly-tarot-calendar {
  position: relative;
  width: min(100%, var(--app-max-width));
  margin-inline: auto;
  color: var(--app-paper);
  border-top: 1px solid rgba(255, 210, 28, .24);
  border-bottom: 1px solid rgba(255, 210, 28, .14);
  isolation: isolate;
}

.monthly-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: clamp(6px, 1vw, 14px);
  min-width: 0;
}
```

Use the current archive typography, gold rules, celestial pseudo-elements, and existing paper material layers. Do not introduce new color tokens or large rounded panels.

- [ ] **Step 2: Style calendar cells and states**

Give every real cell a stable aspect/height, tiny paper texture, thin edge, and centered miniature. Ensure:

```css
.monthly-calendar-miniature img {
  display: block;
  width: auto;
  height: clamp(28px, 3.2vw, 40px);
  max-width: 100%;
  object-fit: contain;
}

.monthly-calendar-cell[data-state='completed']:hover {
  transform: translateY(-2px);
}

.monthly-calendar-cell[data-today='true'] {
  border-color: rgba(255, 210, 28, .78);
  box-shadow: 0 0 18px rgba(255, 210, 28, .12), inset 0 0 0 1px rgba(255, 210, 28, .12);
}
```

Keep day numbers legible but subordinate. Future moon and missed hollow-circle marks remain small and neutral.

- [ ] **Step 3: Style the archive popup**

Use the existing modal mask and paper material family. Create a balanced desktop two-column paper layout with large artwork and text, then stack it on narrow screens. Use a maximum viewport height with internal vertical scrolling for expanded meaning and never horizontal scrolling.

The entry animation may use a pseudo-element crease plus Framer Motion opacity/y/scale, but must remain restrained. Buttons reuse the existing manuscript/gold action language.

- [ ] **Step 4: Add mobile and reduced-motion rules**

At `max-width: 768px`, keep `repeat(7, minmax(0, 1fr))`, reduce gaps/padding, hide nonessential header coordinates, and preserve 28px minimum artwork height. At very narrow widths, allow day-cell padding to reach 2px but do not change the column count.

Add:

```css
@media (prefers-reduced-motion: reduce) {
  .monthly-calendar-cell,
  .monthly-calendar-miniature img,
  .calendar-archive-paper {
    transition-duration: .01ms !important;
    animation: none !important;
  }

  .monthly-calendar-cell[data-state='completed']:hover {
    transform: none;
  }
}
```

- [ ] **Step 5: Build after styling**

Run: `npm run build`

Expected: Vite build exits 0 with no JSX or CSS parse errors.

- [ ] **Step 6: Commit visual styling**

```powershell
git add -- src/solar.css
git commit -m "style: polish monthly tarot archive calendar"
```

---

### Task 6: Verify Behavior and Responsive Layout

**Files:**
- Modify only if verification reveals an in-scope defect: files listed in Tasks 1–5

**Interfaces:**
- Verifies the integrated homepage and popup; introduces no new API

- [ ] **Step 1: Run automated verification**

Run:

```powershell
npm test
npm run build
```

Expected: all tests pass and Vite exits 0.

- [ ] **Step 2: Start the local server**

Run:

```powershell
npm run dev -- --host 127.0.0.1 --port 4174 --strictPort
```

Expected: Vite serves `http://127.0.0.1:4174/`. If 4174 is already occupied by this project, reuse the existing process; do not kill unrelated processes.

- [ ] **Step 3: Verify desktop at 1440px width**

Confirm:

- the Monthly Tarot Calendar appears before Recent Readings;
- Recent Readings contains no Daily Card/calendar control;
- weekday and date grids align in seven columns;
- real tarot thumbnails render for completed days;
- future, missed, and today treatments are distinct but restrained;
- previous month works and next month is disabled on the current month;
- completed-day popup shows the correct date, artwork, name, orientation, and short oracle;
- full meaning expands inside the same popup without URL or route change;
- no horizontal overflow exists.

- [ ] **Step 4: Verify mobile at 390px width**

Confirm:

- the calendar remains seven columns;
- thumbnails remain approximately 28px tall and are not cropped;
- day numbers and Today badge do not overlap the artwork;
- month controls remain usable;
- popup stacks vertically, scrolls internally when expanded, and never overflows horizontally;
- cell hover motion is absent on touch and focus remains visible for keyboard input.

- [ ] **Step 5: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce` and confirm there is no lift/unfold transform while the popup and state changes remain usable.

- [ ] **Step 6: Inspect the final diff scope**

Run:

```powershell
git status --short
git diff --check
git diff --stat HEAD~5..HEAD
```

Expected: only the planned source, locale, CSS, test, and plan files belong to this feature. Existing unrelated dirty files remain unstaged and unchanged by this work.

- [ ] **Step 7: Commit any verification-only fixes**

If verification required source changes, stage only the exact in-scope files and commit:

```powershell
git add -- src/dateUtils.js src/components/MonthlyTarotCalendar.jsx src/components/modals/CalendarModal.jsx src/pages/HomePage.jsx src/App.jsx src/i18n/locales/zh-CN.ts src/i18n/locales/en.ts src/i18n/locales/it.ts src/solar.css scripts/run-tests.js
git commit -m "fix: complete monthly tarot calendar verification"
```

If no fixes were required, do not create an empty commit.
