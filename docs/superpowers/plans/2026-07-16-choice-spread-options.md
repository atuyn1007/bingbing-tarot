# Choice Spread Option Binding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require users to define and preserve Choice Spread A/B options so result cards always retain their intended left/right meaning.

**Architecture:** A small pure utility normalizes the two option labels and creates display groups. The existing App state and local recent-reading snapshot store `choiceA` and `choiceB`; the existing five-card draw order stays unchanged. The reusable spread renderer receives optional choice metadata and renders the same five cards as fixed A, B and self groups.

**Tech Stack:** React 18, Vite 5, CSS, existing Node assertion runner.

## Global Constraints

- Only the `choice` spread changes; routes, random draw logic and other spreads remain unchanged.
- Question, choice A and choice B are required only for the `choice` spread.
- A is always left and B is always right. Card results never affect this mapping.
- Existing source order stays A-current (0), B-current (1), A-future (2), B-future (3), self (4).
- Results read question → A future/current → B future/current → self.
- Persist labels in the existing local history entry; preserve the current three-argument Supabase history call.
- Legacy history entries without labels use existing localized generic A/B fallback labels.
- Mobile must not create horizontal overflow.

---

### Task 1: Choice option utility and tests

**Files:**
- Create: `src/choiceSpreadUtils.js`
- Modify: `scripts/run-tests.js`

**Interfaces:**
- Produces `normalizeChoiceOptions(choiceA, choiceB)`.
- Produces `hasCompleteChoiceOptions(choiceA, choiceB)`.
- Produces `getChoiceDisplayGroups(cards, choiceA, choiceB, fallbackA, fallbackB, selfLabel)`.

- [ ] **Step 1: Add failing utility tests**

Add this import to `scripts/run-tests.js`:

    import {
      getChoiceDisplayGroups,
      hasCompleteChoiceOptions,
      normalizeChoiceOptions,
    } from '../src/choiceSpreadUtils.js';

Add these test records to the `tests` array:

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

- [ ] **Step 2: Confirm the test fails**

Run: `npm test`

Expected: failure because `src/choiceSpreadUtils.js` does not exist.

- [ ] **Step 3: Implement the smallest utility**

Create `src/choiceSpreadUtils.js` with:

    export function normalizeChoiceOptions(choiceA, choiceB) {
      return {
        choiceA: String(choiceA || '').trim(),
        choiceB: String(choiceB || '').trim(),
      };
    }

    export function hasCompleteChoiceOptions(choiceA, choiceB) {
      const normalized = normalizeChoiceOptions(choiceA, choiceB);
      return Boolean(normalized.choiceA && normalized.choiceB);
    }

    export function getChoiceDisplayGroups(cards, choiceA, choiceB, fallbackA, fallbackB, selfLabel) {
      const normalized = normalizeChoiceOptions(choiceA, choiceB);
      return [
        { key: 'choice-a', label: `A｜${normalized.choiceA || fallbackA}`, cardIndexes: [2, 0] },
        { key: 'choice-b', label: `B｜${normalized.choiceB || fallbackB}`, cardIndexes: [3, 1] },
        { key: 'choice-self', label: selfLabel, cardIndexes: [4] },
      ];
    }

- [ ] **Step 4: Confirm the test passes**

Run: `npm test`

Expected: all existing tests and both new utility tests pass.

- [ ] **Step 5: Commit Task 1**

    git add scripts/run-tests.js src/choiceSpreadUtils.js
    git commit -m "feat: add choice spread option utilities"

### Task 2: Capture, retain and locally persist A/B labels

**Files:**
- Modify: `src/App.jsx:159-208, 373-430, 527-534, 642-676, 1141-1182, 1480-1490, 1616-1648`
- Modify: `src/pages/DrawingPage.jsx`
- Modify: `src/i18n/locales/zh-CN.ts`, `src/i18n/locales/en.ts`, `src/i18n/locales/it.ts`
- Modify: `scripts/run-tests.js`

**Interfaces:**
- Consumes `hasCompleteChoiceOptions` and `normalizeChoiceOptions`.
- Adds optional `choiceA`, `choiceB`, `setChoiceA`, `setChoiceB`, `isChoiceSpread`, `canConfirmQuestion` props to `DrawingPage`.
- Adds `choiceOptions: { choiceA, choiceB }` to a saved local Choice Spread reading.
- Keeps the existing Supabase function signature unchanged.

- [ ] **Step 1: Add failing source-contract tests**

Add this test record:

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

- [ ] **Step 2: Confirm the test fails**

Run: `npm test`

Expected: failure because the state, history fields and Choice Spread input contract do not exist.

- [ ] **Step 3: Implement the state and input flow**

In `App.jsx`, add `choiceA` and `choiceB` alongside `userQuestion`; clear them in `clearSession` and `resetReadingState`. Derive:

    const isChoiceSpread = !isHumanMode && activeSpread.key === 'choice';
    const canConfirmQuestion =
      Boolean(userQuestion.trim()) &&
      (!isChoiceSpread || hasCompleteChoiceOptions(choiceA, choiceB));

Extend `normalizeRecentReadingEntry` and the local object built in `saveRecentReading` with:

    choiceA: sanitizeHistoryText(entry.choiceA || ''),
    choiceB: sanitizeHistoryText(entry.choiceB || ''),

Pass normalized labels to local history creation and `buildSpreadReading`, but retain:

    saveSpreadHistoryRecord(question, spread.name, cards)

unchanged.

Pass the six input props to `DrawingPage`. In `DrawingPage`, render two labelled, required inputs only when `isChoiceSpread` is true and disable the existing confirmation button with `!canConfirmQuestion`. Add localized input labels, examples and placeholders in all three locale dictionaries.

- [ ] **Step 4: Confirm automated behaviour**

Run: `npm test && npm run build`

Expected: both commands succeed.

- [ ] **Step 5: Commit Task 2**

    git add src/App.jsx src/pages/DrawingPage.jsx src/i18n/locales/zh-CN.ts src/i18n/locales/en.ts src/i18n/locales/it.ts scripts/run-tests.js
    git commit -m "feat: capture choice spread option labels"

### Task 3: Render fixed result groups and protect narrow screens

**Files:**
- Modify: `src/components/SpreadCards.jsx`
- Modify: `src/pages/ResultPage.jsx`
- Modify: `src/components/modals/HistoryModal.jsx`
- Modify: `src/index.css`
- Modify: `src/solar.css`
- Modify: `scripts/run-tests.js`

**Interfaces:**
- Consumes `getChoiceDisplayGroups`.
- Adds optional `choiceOptions` to `SpreadCards`; callers without it retain generic rendering.
- Adds optional `choiceOptions` to `ResultPage` and passes reading labels in `HistoryModal`.

- [ ] **Step 1: Add failing renderer and responsive-style tests**

Add this test record:

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

- [ ] **Step 2: Confirm the test fails**

Run: `npm test`

Expected: failure because Choice Spread groups and mobile-safe labels do not exist.

- [ ] **Step 3: Implement the grouped renderer**

In `SpreadCards`, branch only for `spread.key === 'choice'`. Use `getChoiceDisplayGroups` with localized fallback labels. Render group `choice-a` with existing cards at indexes `[2, 0]`, group `choice-b` with existing cards at indexes `[3, 1]`, then self at index `[4]`. Keep each card's original `spread.positions[cardIndex]` and the existing `TarotCard` settings.

Pass `choiceOptions` through `ResultPage`. Pass `{ choiceA: reading.choiceA, choiceB: reading.choiceB }` to history previews. Do not change generic rendering for any non-Choice Spread or older choice history without stored labels.

- [ ] **Step 4: Add restrained Choice Spread CSS**

Add Choice Spread-only classes to `src/index.css`:

    .choice-spread-group { min-width: 0; }
    .choice-spread-group-title { overflow-wrap: anywhere; }
    @media (max-width: 768px) {
      .reading-spread-choice { grid-template-columns: 1fr; }
      .choice-spread-group { width: 100%; }
    }

Use `src/solar.css` only to give the new inputs and group labels existing paper and gold treatments. Do not alter global tokens or unrelated card grids.

- [ ] **Step 5: Confirm automated behaviour**

Run: `npm test && npm run build`

Expected: both commands succeed.

- [ ] **Step 6: Perform manual responsive verification**

Run: `npm run dev -- --host 127.0.0.1 --port 4174`

Verify with a question and long A/B labels:

1. confirmation is disabled until all three fields contain non-space text;
2. desktop groups remain A on the left and B on the right;
3. each group reads future then current, followed by the separate self card;
4. at 375 px, reading order is question → A → B → self with no horizontal overflow;
5. a saved local history item retains labels and legacy history uses fallback labels.

- [ ] **Step 7: Commit Task 3**

    git add src/components/SpreadCards.jsx src/pages/ResultPage.jsx src/components/modals/HistoryModal.jsx src/index.css src/solar.css scripts/run-tests.js
    git commit -m "feat: label choice spread results"

### Task 4: Final regression verification

**Files:**
- Modify: `docs/superpowers/plans/2026-07-16-choice-spread-options.md` (check completed boxes only)

- [ ] **Step 1: Inspect scope**

Run: `git diff HEAD~3..HEAD -- src/App.jsx src/pages/DrawingPage.jsx src/components/SpreadCards.jsx src/pages/ResultPage.jsx src/components/modals/HistoryModal.jsx src/index.css src/solar.css scripts/run-tests.js`

Expected: only Choice Spread input, local history, display grouping, translations, tests and styles changed.

- [ ] **Step 2: Run final checks**

Run: `npm test && npm run build`

Expected: both commands exit with code 0.

- [ ] **Step 3: Commit verification record**

    git add docs/superpowers/plans/2026-07-16-choice-spread-options.md
    git commit -m "docs: record choice spread verification"

