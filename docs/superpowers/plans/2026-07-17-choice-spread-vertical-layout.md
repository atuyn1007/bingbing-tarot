# Choice Spread Vertical Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the Choice Spread as a stable two-column divination layout with vertically stacked long-term and short-term cards.

**Architecture:** Keep the existing card indexes and `getChoiceDisplayGroups` output unchanged. Scope the implementation to Choice Spread rendering styles: each A/B group becomes a one-column internal grid while the outer layout stays two columns at every viewport; the self group spans both columns. Increase Choice Spread text contrast through local CSS overrides only.

**Tech Stack:** React 18, CSS, Vite 5, existing Node assertion runner.

## Global Constraints

- Do not change draw logic, A/B input state, card orientation, meaning data, route or global background.
- Keep A on the left and B on the right on desktop and mobile.
- Keep source indexes and semantic display order: A [2, 0], B [3, 1], self [4].
- Within both A and B, long-term result is above short-term development.
- Keep the self card centered below both choices.
- Do not introduce horizontal scrolling; long choice labels wrap inside their column.
- Change only `src/index.css`, `src/solar.css`, and the existing source-contract test in `scripts/run-tests.js`.

---

### Task 1: Add a Choice Spread layout contract test

**Files:**
- Modify: `scripts/run-tests.js`
- Test: `scripts/run-tests.js`

**Interfaces:**
- Consumes existing CSS class names `.reading-spread-choice`, `.choice-spread-group-cards`, and `.choice-spread-group-title`.
- Produces a regression contract for fixed two outer columns, one inner card column, and readable Choice Spread text.

- [x] **Step 1: Write the failing test**

Add this record to the `tests` array:

    {
      name: 'choice spread keeps two outer columns and vertical card stacks at every viewport',
      run() {
        const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
        assert.match(css, /\.choice-spread-group-cards\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/);
        assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.reading-spread-choice\s*\{[\s\S]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
        assert.match(css, /\.choice-spread-group-title\s*\{[\s\S]*color:\s*rgba\(255, 248, 230/);
        assert.match(css, /\.reading-spread-choice \.reading-spread-label\s*\{[\s\S]*color:\s*rgba\(241, 224, 183/);
      },
    },

- [x] **Step 2: Verify the test fails**

Run: `npm test`

Expected: FAIL because the current group cards use two internal columns, and the mobile layout collapses the outer groups into one column.

- [x] **Step 3: Implement scoped CSS only**

In `src/index.css`:

    .choice-spread-group-cards {
      grid-template-columns: minmax(0, 1fr);
    }

    @media (max-width: 640px) {
      .reading-spread-choice {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-template-areas:
          "choice-a choice-b"
          "choice-self choice-self";
      }
    }

Add Choice Spread-local text styles with the specified light palette and `overflow-wrap: anywhere` on the group title. Do not change `SpreadCards.jsx`; it already renders A as indexes `[2, 0]`, B as `[3, 1]`, then self.

In `src/solar.css`, limit any size reductions to Choice Spread mobile selectors: smaller card frames, tighter gaps, and small title/label sizes while preserving two outer columns.

- [ ] **Step 4: Verify the test passes**

Run: `npm test && npm run build`

Expected: all tests pass and Vite completes successfully.

- [x] **Step 5: Commit the visual layout change**

    git add scripts/run-tests.js src/index.css src/solar.css
    git commit -m "fix: restore choice spread vertical layout"

### Task 2: Inspect the final scope and responsive output

**Files:**
- Modify: `docs/superpowers/plans/2026-07-17-choice-spread-vertical-layout.md` (check completed boxes only)

- [x] **Step 1: Confirm diff scope**

Run: `git diff HEAD~1..HEAD -- scripts/run-tests.js src/index.css src/solar.css`

Expected: no state, draw, A/B input, route or data-file changes.

- [ ] **Step 2: Verify desktop and mobile layout rules**

Run: `npm run dev -- --host 127.0.0.1 --port 4175`

At desktop and 375 px width, verify by DOM/screenshot that A remains on the left, B on the right, each branch is vertical in long-term → short-term order, and self is centered below. Confirm page `scrollWidth === clientWidth`.

- [x] **Step 3: Record verification completion**

    git add docs/superpowers/plans/2026-07-17-choice-spread-vertical-layout.md
    git commit -m "docs: record choice layout verification"

> **Verification note (2026-07-17):** Source-level rules and the automated layout contract confirm that the outer Choice Spread grid uses two equal columns at desktop and at `max-width: 640px`, each A/B group uses one card column, the self group spans both columns, and long option labels wrap. `npm test` passed all 30 checks. A live authenticated result-page session was not available in this worktree, so no desktop or 375 px screenshot/DOM `scrollWidth` assertion is claimed; authenticated visual QA remains required. The build step has not been re-run here because it would overwrite tracked build artifacts, which are deliberately outside this verification commit.
