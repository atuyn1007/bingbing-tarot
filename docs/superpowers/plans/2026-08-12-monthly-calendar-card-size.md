# Monthly Calendar Card Size Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enlarge completed card artwork and all calendar card-back placeholders without breaking the seven-column responsive calendar.

**Architecture:** Keep the existing `MonthlyTarotCalendar` markup and data flow unchanged. Express the visual change solely in `src/solar.css`, with one desktop scale and one compact scale under the existing mobile breakpoint; protect the scale relationship with the existing Node test runner.

**Tech Stack:** React 18, Vite 5, CSS, Node assertion tests.

## Global Constraints

- Do not modify calendar data, Daily Card history, Supabase, translations, or Unity work.
- Keep completed artwork, fallback backs, and empty-date backs visually aligned.
- Preserve seven columns at 360px and do not cover the day number or Today badge.

---

### Task 1: Responsive calendar card scale

**Files:**
- Modify: `scripts/run-tests.js`
- Modify: `src/solar.css`

**Interfaces:**
- Consumes: existing `.monthly-calendar-miniature`, image, empty-paper, and paper-back selectors.
- Produces: desktop artwork height 54–64px and compact artwork height 36–40px, with proportionate card backs.

- [ ] **Step 1: Add a failing test for the desktop and compact visual size contract**
- [ ] **Step 2: Run `npm test` and verify the old 32–40px/28px rules fail the new contract**
- [ ] **Step 3: Increase image, miniature, and both card-back dimensions in `src/solar.css`**
- [ ] **Step 4: Run `npm test` and `npm run build`**
- [ ] **Step 5: Inspect desktop and mobile renders for clipping and alignment**
- [ ] **Step 6: Commit the focused implementation**
