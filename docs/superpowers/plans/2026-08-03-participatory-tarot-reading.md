# Participatory Tarot Reading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a user-controlled shuffle, card-back selection, reveal, and structured reading experience for the original Tarot spreads.

**Architecture:** Pure session helpers create and transition an immutable draw session; React components render each phase and own only UI animation lifecycle. A pure reading engine adapts the existing multilingual archive into structured sections that the result page renders directly.

**Tech Stack:** React 18, Vite 5, Framer Motion 11, Lucide React, existing TypeScript locale dictionaries, Node assert test runner.

## Global Constraints

- Preserve Supabase schemas and the existing login, profile, coins, recent history, daily card, and human-reader behaviors.
- Preserve the existing orientation probability and prevent duplicate cards in one reading.
- Keep `minimal` and `artwork` card faces and all three supported locales.
- Add no dependency, API key, external language model, or claim of genuine AI inference.
- Do not edit the in-progress Unity engine or result page.
- Reuse `src/solar.css`, existing design variables, and paper textures.

---

### Task 1: Pure card-draw session

**Files:**
- Create: `src/cardDrawFlow.js`
- Modify: `scripts/run-tests.js`

**Interfaces:**
- Produces: `createDrawSession(cards, cardCount, random)`, `toggleBackSelection(session, backIndex)`, `confirmBackSelection(session)`, `revealSelectedCard(session, cardIndex)`, `revealAllSelectedCards(session)`.

- [ ] **Step 1: Write failing tests** for shuffled uniqueness, three/five-card limits, cancellation, selected-back mapping, and idempotent reveal using literal 78-card fixtures and deterministic random values.
- [ ] **Step 2: Run `npm test`** and confirm failure is caused by the missing module.
- [ ] **Step 3: Implement the pure helpers** with a Fisher-Yates shuffle, one orientation roll per card, a 12-back visible choice set, immutable updates, and explicit phases.
- [ ] **Step 4: Run `npm test`** and confirm the new session tests pass with the existing suite.

### Task 2: Structured local reading engine

**Files:**
- Create: `src/readingEngine.js`
- Modify: `scripts/run-tests.js`

**Interfaces:**
- Consumes: existing `getReadingFromMeaningArchive`, spread `positions`, localized `t`, meaning archive accessors, fallback-reading and keyword callbacks.
- Produces: `buildStructuredReading(options)` returning `{ overview, cards, relationship, advice, reflectionQuestion, disclaimer, choiceComparison }`.

- [ ] **Step 1: Write failing tests** for three-card and triangle positions, upright and reversed directions, blank/multiline normalization, five-card A/B mapping, comparison fields, and complete output keys.
- [ ] **Step 2: Run `npm test`** and confirm the missing engine causes the intended failure.
- [ ] **Step 3: Implement normalization and card sections** so every card includes its position responsibility, orientation direction, archive meaning, question context, attention, boundary, and localized keywords.
- [ ] **Step 4: Implement group synthesis** from orientation counts, repeated localized keywords, spread order, and cautious no-overlap wording; derive two or three concrete position-based actions and one reflection question.
- [ ] **Step 5: Implement either-or comparison** with A/B advantage and risk fields plus the querent concern, without choosing a winner.
- [ ] **Step 6: Run `npm test`** and confirm all engine cases pass.

### Task 3: Input and draw-stage UI

**Files:**
- Create: `src/components/CardDrawStage.jsx`
- Modify: `src/pages/DrawingPage.jsx`
- Modify: `src/TarotCard.jsx`
- Modify: `src/components/SpreadCards.jsx`

**Interfaces:**
- Consumes: draw session, spread, card style, keywords, localized labels, and transition callbacks.
- Produces: skip shuffle, toggle back, confirm selected backs, reveal one/all, and open-reading events.

- [ ] **Step 1: Expand DrawingPage** with position archive entries, guidance, examples that only fill the textarea, character count, missing-field button copy, and disclaimer.
- [ ] **Step 2: Build CardDrawStage** with a cleaned-up 0.9-second timer, `useReducedMotion`, skip action, animated deck, 12 keyboard buttons with `aria-pressed`, progress announcements, selection cancellation, and mobile scroll.
- [ ] **Step 3: Extend SpreadCards** to accept per-card reveal state and callbacks while preserving existing boolean behavior for history and messages.
- [ ] **Step 4: Correct TarotCard orientation** so only artwork rotates for reversed cards and labels remain upright; retain image-error fallback.
- [ ] **Step 5: Run `npm run build`** to catch component and locale type-contract errors.

### Task 4: Application integration and structured result

**Files:**
- Modify: `src/App.jsx`
- Create: `src/components/ReadingOverview.jsx`
- Create: `src/components/ReadingCardSection.jsx`
- Modify: `src/pages/ResultPage.jsx`

**Interfaces:**
- Consumes: Task 1 session functions and Task 2 reading object.
- Produces: original-spread state flow while retaining the existing Unity branch.

- [ ] **Step 1: Replace original-spread nested timers** with draw-session transitions; retain the current Unity path unchanged.
- [ ] **Step 2: Load meanings at shuffle start** and save history only after back selection is confirmed.
- [ ] **Step 3: Rebuild the structured reading from stable cards** for the current locale without resetting draw state.
- [ ] **Step 4: Render the result hierarchy** as question/spread, full spread, overview, card files, relationship, advice, reflection, disclaimer, and actions.
- [ ] **Step 5: Render either-or comparison** as A/B columns above the querent concern; stack it on mobile.
- [ ] **Step 6: Add redraw behavior** that returns to input with the current question/options preserved while home reset keeps its existing behavior.
- [ ] **Step 7: Run `npm test` and `npm run build`** and fix integration regressions without touching Unity files.

### Task 5: Localization, styling, and acceptance

**Files:**
- Modify: `src/i18n/locales/zh-CN.ts`
- Modify: `src/i18n/locales/en.ts`
- Modify: `src/i18n/locales/it.ts`
- Modify: `src/solar.css`

**Interfaces:**
- Consumes: every new key referenced by Tasks 2–4.
- Produces: complete Chinese, English, and Italian UI and responsive archive styling.

- [ ] **Step 1: Add every new key to Chinese** including UI labels, reading templates, comparison labels, action language, accessibility labels, and disclaimer.
- [ ] **Step 2: Add structurally identical English and Italian dictionaries** with no fallback-key gaps.
- [ ] **Step 3: Add archive-style stage and result CSS** using existing colors/textures, minimum 44px controls, visible focus, restrained motion, and no overflow at 360px.
- [ ] **Step 4: Add 768/1024/1440 responsive rules** and a reduced-motion override that disables nonessential transitions.
- [ ] **Step 5: Run `npm test`** to verify locale shape and all behavior tests.
- [ ] **Step 6: Run `npm run build`** and inspect the complete exit output.
- [ ] **Step 7: Review the final diff** against all requested scenarios and confirm protected Unity files have no new diff.
