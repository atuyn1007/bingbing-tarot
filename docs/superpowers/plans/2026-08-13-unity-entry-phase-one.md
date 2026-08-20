# Unity Entry Phase One Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Unity of All Things spread entry, preparation page, and a static first-line casting state with three non-interactive card backs.

**Architecture:** Extend the existing spread catalogue with a `unity` configuration, route that key into two dedicated lazy-loaded pages, and keep its question state local to `App`. The casting page is deliberately presentational and creates no tarot, orientation, line, hexagram, reading, history, or Supabase data.

**Tech Stack:** React 18, Vite 5, Framer Motion, Lucide React, existing `useI18n` locales and `solar.css` visual tokens.

## Global Constraints

- Do not implement shuffle, selection, reveal, random cards, orientation, lines 6/7/8/9, yin/yang, hexagrams, changing lines, I Ching content, readings, history, or persistence.
- The three first-round card backs must not be buttons, focusable, clickable, keyboard-operable, or backed by generated card data.
- Preserve the three existing tarot spreads, human reading, daily tarot, history, Supabase flows, and language switching.
- Do not add dependencies or modify the Supabase schema.

---

### Task 1: Spread catalogue entry and metadata cleanup

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/modals/SpreadModal.jsx`
- Modify: `src/i18n/locales/zh-CN.ts`
- Modify: `src/i18n/locales/en.ts`
- Modify: `src/i18n/locales/it.ts`
- Modify: `src/solar.css`
- Test: `scripts/run-tests.js`

**Interfaces:**
- Consumes: existing `SPREAD_OPTIONS`, `getSpreadConfig`, `SpreadModal`.
- Produces: localized `spreads.unity` with `cardCount: 18`; no difficulty metadata in any spread card.

- [ ] Write a failing catalogue test proving four entries, Unity metadata in every locale, and absence of difficulty fields.
- [ ] Run `npm test` and confirm the new test fails because Unity is absent.
- [ ] Add the `unity` option, visual constellation, localized metadata, and four-card responsive catalogue layout.
- [ ] Run `npm test` and confirm the catalogue test and prior tests pass.

### Task 2: Unity introduction and question validation

**Files:**
- Create: `src/unityEntryFlow.js`
- Create: `src/pages/UnityIntroPage.jsx`
- Modify: `src/App.jsx`
- Modify: `src/i18n/locales/zh-CN.ts`
- Modify: `src/i18n/locales/en.ts`
- Modify: `src/i18n/locales/it.ts`
- Modify: `src/solar.css`
- Test: `scripts/run-tests.js`

**Interfaces:**
- Consumes: `spread.key === 'unity'`, current language, existing home callback pattern.
- Produces: `normalizeUnityQuestion(value): string`, `canStartUnityCasting(value): boolean`, and `unity-intro` route preserving `unityQuestion` across language changes.

- [ ] Write failing validation and routing tests for empty/whitespace input and Unity selection.
- [ ] Run `npm test` and confirm failures are caused by missing entry flow.
- [ ] Implement the pure validation helper, lazy introduction page, localized copy, and App routing.
- [ ] Run `npm test` and confirm the new and prior tests pass.

### Task 3: Static first-round casting page

**Files:**
- Create: `src/pages/UnityCastingPage.jsx`
- Modify: `src/App.jsx`
- Modify: `src/i18n/locales/zh-CN.ts`
- Modify: `src/i18n/locales/en.ts`
- Modify: `src/i18n/locales/it.ts`
- Modify: `src/solar.css`
- Test: `scripts/run-tests.js`

**Interfaces:**
- Consumes: confirmed trimmed question and `onBackHome` callback.
- Produces: `unity-casting` route rendering exactly three decorative card backs and the localized first-round/initial-line label.

- [ ] Write a failing test proving the casting page has exactly three non-interactive backs and no draw-engine import or generated card data.
- [ ] Run `npm test` and confirm it fails because the page is absent.
- [ ] Implement the static casting page, route, responsive styling, and reduced-motion behavior.
- [ ] Run `npm test` and confirm all tests pass.

### Task 4: Full verification

**Files:**
- Verify all changed files only.

- [ ] Run `npm test` and record the exact pass count.
- [ ] Run `npm run build` and confirm a production bundle is generated without errors.
- [ ] Inspect `git diff --check`, `git diff --stat`, and `git status --short` for accidental Unity algorithm or persistence changes.
- [ ] Verify the production behavior locally at 360px, 768px, 1024px, and 1440px, including language switching and non-interactive card backs.
