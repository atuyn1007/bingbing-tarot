# Unity Casting Phase Two Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the six-round Unity casting ritual, recoverable local draft, frozen hexagram calculation, and calculation-only result page.

**Architecture:** Add three focused pure modules for casting state, local persistence, and the frozen algorithm. Keep React responsible only for orchestrating the existing tarot catalogue, timed same-page transitions, and rendering; `App` holds the current Unity session/result without changing ordinary spread state.

**Tech Stack:** React 18, Vite 5, Framer Motion, Lucide React, existing tarot catalogue/artwork, `localStorage`, existing three-locale `useI18n` system.

## Global Constraints

- Six rounds are fixed in bottom-to-top order: Initial, Second, Third, Fourth, Fifth, Top.
- Each round contains three unique cards from one frozen 18-card shuffled snapshot.
- Preserve the existing reversed threshold: `random() < 0.5`.
- Upright = 2 and reversed = 3; do not alter the frozen Unity algorithm.
- Persist drafts in user-scoped `localStorage`; do not modify Supabase or ordinary history.
- Generate only structural result facts; no I Ching or tarot interpretation, AI, advice, synthesis, sharing, or placeholder interpretation blocks.
- Do not change the other three spreads.

---

### Task 1: Frozen Unity algorithm

**Files:**
- Create: `src/unityAlgorithm.js`
- Test: `scripts/run-unity-tests.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: six completed rounds with three cards carrying `isReversed`.
- Produces: `calculateUnityResult(rounds, options)`, line records, primary/changed hexagrams, moving line indexes, and localized-name ids.

- [ ] Write tests for all four line totals, moving-line flips, bottom-to-top trigram composition, King Wen lookup, no-moving-lines behavior, and all 18 card associations.
- [ ] Run `node scripts/run-unity-tests.js` and confirm failure because the module is absent.
- [ ] Implement the normative 2/3 mapping, trigram lookup, King Wen table, 64 structural names, and result validation without prose fields.
- [ ] Run `node scripts/run-unity-tests.js` and confirm the algorithm tests pass.

### Task 2: Casting session state and draft persistence

**Files:**
- Create: `src/unityCastingFlow.js`
- Create: `src/unityPersistence.js`
- Modify: `scripts/run-unity-tests.js`

**Interfaces:**
- Produces: `createUnityCastingSession`, `revealNextUnityCard`, `advanceUnityRound`, `isUnityCastingComplete`, `validateUnityCastingSession`, `saveUnityDraft`, `loadUnityDraft`, `clearUnityDraft`.
- Storage key contract: schema version plus authenticated user id.

- [ ] Add tests for one frozen set of 18 unique cards, exact orientation threshold, sequential idempotent reveal, round commitment, six-round advancement, user-scoped storage, and rejection/removal of corrupt or duplicate drafts.
- [ ] Run `node scripts/run-unity-tests.js` and verify failures name the missing session and persistence functions.
- [ ] Implement pure session transitions and injectable-storage persistence.
- [ ] Run `node scripts/run-unity-tests.js` and confirm all state and persistence tests pass.

### Task 3: Six-round casting page and App orchestration

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/pages/UnityCastingPage.jsx`
- Modify: `src/i18n/locales/zh-CN.ts`
- Modify: `src/i18n/locales/en.ts`
- Modify: `src/i18n/locales/it.ts`
- Modify: `src/solar.css`
- Modify: `scripts/run-unity-tests.js`

**Interfaces:**
- App supplies the frozen session and callbacks for reveal, advancement, completion, and home navigation.
- Page renders only the active round's three cards and current `roundIndex / 6` header.

- [ ] Add source-contract tests for the six round labels, sequential card buttons, no reveal-all action, cleaned timer, reduced motion, App restoration, save-after-transition, and no Supabase Unity calls.
- [ ] Run `node scripts/run-unity-tests.js` and confirm the page/App contract tests fail.
- [ ] Implement session creation/restoration, click-to-flip, timed auto-advance, scroll continuity, timer cleanup, accessible locked/revealed labels, and localized copy.
- [ ] Run `node scripts/run-unity-tests.js` and the full `npm test` suite.

### Task 4: Calculation-only Unity result page

**Files:**
- Create: `src/pages/UnityResultPage.jsx`
- Modify: `src/App.jsx`
- Modify: `src/i18n/locales/zh-CN.ts`
- Modify: `src/i18n/locales/en.ts`
- Modify: `src/i18n/locales/it.ts`
- Modify: `src/solar.css`
- Modify: `scripts/run-unity-tests.js`

**Interfaces:**
- Consumes: immutable output from `calculateUnityResult`.
- Produces: responsive left 6×3 tarot archive and right primary/moving/changed hexagram facts.

- [ ] Add tests proving 18 rendered cards, primary and changed glyphs/names, moving lines, and absence of interpretation/synthesis/advice fields or sections.
- [ ] Run `node scripts/run-unity-tests.js` and verify result-page tests fail.
- [ ] Implement the split archive layout with artwork fallback and localized structural labels only.
- [ ] Run `node scripts/run-unity-tests.js` and `npm test`.

### Task 5: Final verification and scope audit

**Files:**
- Verify changed files only.

- [ ] Run `npm test` and record the exact pass counts.
- [ ] Run `npm run build` and confirm production compilation succeeds.
- [ ] Run `git diff --check`, scan changed Unity files for interpretation/Supabase/history code, and inspect `git status --short`.
- [ ] Verify 360, 768, 1024, and 1440px layouts and console output on the local app where authentication permits.
- [ ] Request independent code review, resolve Critical/Important findings, then repeat the fresh tests and build.
