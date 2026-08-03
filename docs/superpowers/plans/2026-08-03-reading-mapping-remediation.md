# Tarot Reading Mapping Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every structured Tarot explanation demonstrably use its own card, orientation, spread position, and question across three-card, sacred-triangle, and either-or spreads.

**Architecture:** Keep `readingEngine.js` as a pure deterministic adapter over the existing archive. Add small helpers for archive sentence extraction, card themes, complete position traces, orientation-aware actions, and choice-path synthesis; keep presentation components unchanged.

**Tech Stack:** React 18, Vite 5, existing i18n dictionaries, Node `assert` test runner.

## Global Constraints

- Do not change Supabase schema or persistence payloads.
- Do not add dependencies, API keys, external models, or AI claims.
- Do not edit Unity / 万象归一 files or code paths.
- Preserve all existing draw, reveal, history, human-reader, daily-card, card-style, and orientation behavior.
- All generated user-visible copy must exist in Chinese, English, and Italian.

---

### Task 1: Failing mapping regressions

**Files:**
- Modify: `scripts/run-draw-tests.js`

**Interfaces:**
- Consumes: `buildStructuredReading(options)`.
- Produces: behavioral coverage for card-specific and spread-specific prose.

- [ ] **Step 1: Add a multiline archive fixture** whose three cards have unique two-paragraph upright and reversed meanings.
- [ ] **Step 2: Add a card-isolation assertion** requiring each section's contextual and orientation copy to contain its own archive lead and exclude the preceding card's lead.
- [ ] **Step 3: Add a sacred-triangle assertion** requiring relationship text to contain Perception, Reality, Advice, and all three card themes.
- [ ] **Step 4: Add an either-or assertion** requiring each option's advantage and risk to contain both that path's current and development themes, plus A, B, and Self in the relationship.
- [ ] **Step 5: Run `node scripts/run-draw-tests.js`** and confirm the new assertions fail against the generic engine.

### Task 2: Card-specific section generation

**Files:**
- Modify: `src/readingEngine.js`
- Modify: `src/i18n/locales/zh-CN.ts`
- Modify: `src/i18n/locales/en.ts`
- Modify: `src/i18n/locales/it.ts`

**Interfaces:**
- Produces: `meaningLead`, card-specific `orientationMeaning`, `contextualMeaning`, and orientation-aware attention copy on every card section.

- [ ] **Step 1: Implement `getMeaningLead(baseMeaning)`** using the first non-empty localized sentence without mutating the complete `baseMeaning`.
- [ ] **Step 2: Implement a two-keyword theme fallback** and pass `meaningLead`, card, question, position, subtitle, and keywords into locale templates.
- [ ] **Step 3: Replace generic upright/reversed templates** with archive-derived wording in all three locales.
- [ ] **Step 4: Run `node scripts/run-draw-tests.js`** and confirm card-isolation and reversed-source assertions pass.

### Task 3: Complete spread synthesis

**Files:**
- Modify: `src/readingEngine.js`
- Modify: `src/i18n/locales/zh-CN.ts`
- Modify: `src/i18n/locales/en.ts`
- Modify: `src/i18n/locales/it.ts`

**Interfaces:**
- Produces: full-position overview/relationship, orientation-aware advice, and grounded either-or comparison.

- [ ] **Step 1: Build a position-theme trace** from every card section and use it in overview and relationship templates.
- [ ] **Step 2: Keep exact repeated-theme detection** but replace the unsupported mixed fallback with the literal trace.
- [ ] **Step 3: Build up to three advice items** from actual section position, theme, and orientation.
- [ ] **Step 4: Rework either-or comparison** so A and B advantage/risk each consume current and development themes and orientations; include self concern and specialized relationship.
- [ ] **Step 5: Run `node scripts/run-draw-tests.js`** and confirm triangle and choice assertions pass.

### Task 4: Full verification and publication

**Files:**
- Verify only: all changed files and protected Unity paths.

**Interfaces:**
- Produces: tested branch ready for main and Vercel production deployment.

- [ ] **Step 1: Run `npm test`** and confirm all existing and new cases pass.
- [ ] **Step 2: Run `npm run build`** and confirm Vite exits successfully.
- [ ] **Step 3: Inspect the diff** and confirm no Unity / 万象归一 or Supabase schema file is changed.
- [ ] **Step 4: Commit and push the focused branch**, open and merge a PR into `main`, then verify Vercel production status for the resulting main commit.
