# Result Reading Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the completed reading into a centered manuscript-style sequence of paper sections and remove the Difficulty item from spread-option cards.

**Architecture:** Keep `App.jsx` as the unchanged producer of paragraph-delimited reading text. `ResultPage` will consume that text only for presentation, assigning its already-existing paragraphs to stable paper sections. `SpreadModal` will render two retained metadata items, and local CSS will define the centered reading measure, section rhythm, and balanced two-column metadata grid.

**Tech Stack:** React 18, Framer Motion, CSS, Vite, Node assertion runner.

## Global Constraints

- Do not change draw logic, reading text generation, card meaning data, routes, A/B input flow, or card orientation.
- Keep all original reading text in its original order; only alter its presentation wrappers.
- Result sections must stay within a centered `900–1000px` maximum reading width, have controlled paragraph measure, and use `64–96px` vertical separation.
- Retain only reading time, card count, and recommended situations on spread-option cards; do not replace Difficulty with another field.
- Limit production changes to `src/pages/ResultPage.jsx`, `src/components/modals/SpreadModal.jsx`, their existing locale display-copy files, and local result/spread CSS. Update the existing contract test only for these requirements.

---

### Task 1: Add a presentation contract for reading papers and spread metadata

**Files:**
- Modify: `scripts/run-tests.js`
- Test: `scripts/run-tests.js`

**Interfaces:**
- Consumes `ResultPage` props `readingBody`, `spreadForCards`, and `choiceOptions`.
- Consumes `SpreadModal` `spreadOptions` and localized metadata labels.
- Produces source-level regression checks; it must not create runtime state.

- [x] **Step 1: Write failing source-contract assertions**

Add one test record that reads `ResultPage.jsx`, `SpreadModal.jsx`, and `solar.css` and asserts all of the following:

```js
assert.match(resultPage, /readingBody\.split\('\\n\\n'\)/);
assert.match(resultPage, /reading-paper-section/);
assert.match(resultPage, /reading-paper-title/);
assert.match(solar, /\.result-archive-page \.reading-layout[\s\S]*max-width:\s*min\(100%,\s*960px\)/);
assert.match(solar, /\.reading-paper-stack[\s\S]*gap:\s*clamp\(64px,\s*8vw,\s*96px\)/);
assert.doesNotMatch(spreadModal, /metaDifficulty/);
assert.doesNotMatch(spreadModal, /spread\.difficulty/);
assert.match(solar, /\.spread-option-metadata[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
```

- [x] **Step 2: Verify RED**

Run: `npm test`

Expected: the new contract fails because the current result page contains one `reading-result-card` and the modal still renders the Difficulty entry.

- [x] **Step 3: Leave the failing test in place**

Do not change application source in this task. The failing test is the acceptance contract for Tasks 2 and 3.

- [x] **Step 4: Commit the RED test**

```bash
git add scripts/run-tests.js
git commit -m "test: define reading layout contract"
```

### Task 2: Recompose completed reading text as manuscript sections

**Files:**
- Modify: `src/pages/ResultPage.jsx`
- Modify: `src/solar.css`
- Modify: `src/i18n/locales/zh-CN.ts`
- Modify: `src/i18n/locales/en.ts`
- Modify: `src/i18n/locales/it.ts`
- Test: `scripts/run-tests.js`

**Interfaces:**
- `readingBody` remains the exact `\n\n`-separated text supplied by `App.jsx`.
- `spreadForCards.positions` provides existing position titles; `choiceOptions` supplies fixed saved A/B labels.
- No parent prop, state, or API changes are permitted.

- [x] **Step 1: Preserve source text and derive presentation paragraphs**

Inside `ResultPage`, before `return`, create a display-only array:

```js
const readingParagraphs = readingBody.split('\n\n').filter(Boolean);
const readingCards = readingParagraphs[0] || '';
const readingPositions = readingParagraphs.slice(1, -1);
const readingSummary = readingParagraphs.at(-1) || '';
const getReadingSectionTitle = (index) => {
  if (spreadForCards.key === 'choice' && index < 4) {
    const isChoiceA = index === 0 || index === 2;
    const option = isChoiceA ? choiceOptions.choiceA : choiceOptions.choiceB;
    return `${isChoiceA ? 'A' : 'B'}｜${option || t(isChoiceA ? 'drawing.choiceOptionAFallback' : 'drawing.choiceOptionBFallback')}`;
  }

  return spreadForCards.positions[index]?.title || t('drawing.spreadLabelFallback', { index: index + 1 });
};
```

Add `cardsSectionTitle` and `summarySectionTitle` to the existing `drawing` object in all three locale files. Use language-appropriate equivalents of “Drawn Cards” and “Reading Summary”; do not alter existing translations or card data.

- [x] **Step 2: Replace the single completed-reading body with paper sections**

Inside the existing animated `reading-result-card`, retain `readingLead` and replace the one body paragraph with:

```jsx
<div className="reading-paper-stack">
  <section className="reading-paper-section reading-paper-section-cards">
    <h2 className="reading-paper-title">{t('drawing.cardsSectionTitle')}</h2>
    <div className="reading-paper-divider" aria-hidden="true" />
    <p className="reading-paper-copy">{readingCards}</p>
  </section>
  {readingPositions.map((paragraph, index) => (
    <section key={`${getReadingSectionTitle(index)}-${index}`} className="reading-paper-section">
      <h2 className="reading-paper-title">{getReadingSectionTitle(index)}</h2>
      <div className="reading-paper-divider" aria-hidden="true" />
      <p className="reading-paper-copy">{paragraph}<span className="reading-cursor">|</span></p>
    </section>
  ))}
  <section className="reading-paper-section reading-paper-section-summary">
    <h2 className="reading-paper-title">{t('drawing.summarySectionTitle')}</h2>
    <div className="reading-paper-divider" aria-hidden="true" />
    <p className="reading-paper-copy">{readingSummary}</p>
  </section>
</div>
```

Use `getReadingSectionTitle(index)` exactly as defined in Step 1. Keep the cursor only on the final rendered position paragraph while the reading is still animating.

- [x] **Step 3: Add scoped manuscript layout styles**

Append local styles to `src/solar.css`:

```css
.result-archive-page .reading-layout {
  width: min(100%, 960px);
  max-width: min(100%, 960px);
  margin-inline: auto;
}

.result-archive-page .reading-result-card { width: 100%; }
.reading-paper-stack { display: grid; gap: clamp(64px, 8vw, 96px); }
.reading-paper-section { padding: clamp(28px, 5vw, 52px); }
.reading-paper-title { margin: 0; }
.reading-paper-divider { height: 1px; margin: 18px 0 26px; }
.reading-paper-copy { max-width: 68ch; margin: 0; }
```

Complete the styles with only existing archive paper tokens, a thin gold divider, and mobile padding reductions. Do not change global paper, page, or card rules.

- [x] **Step 4: Verify the reading-section portion of the contract**

Run: `npm test`

Expected: the ResultPage and CSS assertions pass. The suite remains RED only on the planned Difficulty assertions until Task 3 removes the modal field.

- [x] **Step 5: Commit**

```bash
git add src/pages/ResultPage.jsx src/solar.css src/i18n/locales/zh-CN.ts src/i18n/locales/en.ts src/i18n/locales/it.ts
git commit -m "feat: structure reading results as papers"
```

### Task 3: Remove Difficulty from spread-option cards and balance metadata

**Files:**
- Modify: `src/components/modals/SpreadModal.jsx`
- Modify: `src/solar.css`
- Test: `scripts/run-tests.js`

**Interfaces:**
- `spreadOptions` continues to provide `readingTime`, `cardCount`, and `recommended`.
- Existing `difficulty` data remains untouched but is never rendered by this modal.

- [x] **Step 1: Remove the displayed Difficulty metadata block**

Delete exactly this `dl` child from `SpreadModal.jsx`:

```jsx
<div>
  <dt>{t('spreads.metaDifficulty')}</dt>
  <dd>{spread.difficulty}</dd>
</div>
```

- [x] **Step 2: Balance the retained metadata**

Change the local `.spread-option-metadata` rule to:

```css
grid-template-columns: repeat(2, minmax(0, 1fr));
```

Keep its existing separator lines, typography, and surrounding recommended-situations block.

- [x] **Step 3: Verify all contracts and build**

Run: `npm test`

Expected: all tests pass and no rendered modal source references `metaDifficulty` or `spread.difficulty`.

Run: `npm run build`

Expected: Vite build completes successfully.

- [x] **Step 4: Commit**

```bash
git add src/components/modals/SpreadModal.jsx src/solar.css scripts/run-tests.js
git commit -m "fix: simplify spread option metadata"
```

### Task 4: Review scope and responsive presentation

**Files:**
- Modify: `docs/superpowers/plans/2026-07-17-result-reading-layout.md` (check completed boxes only)

- [x] **Step 1: Confirm source scope**

Run: `git diff 4b1aca2..HEAD -- src/pages/ResultPage.jsx src/components/modals/SpreadModal.jsx src/solar.css scripts/run-tests.js`

Expected: no changes to `App.jsx`, reading logic, routes, or cards. Locale changes are limited to the two new display-only section titles in each supported language.

**Recorded verification (2026-07-17):** Automated verification completed after Task 3: `npm test` passed **31/31** checks and `npm run build` exited successfully. The source diff from `4b1aca2` is limited to `ResultPage`, `SpreadModal`, `solar.css`, the three locale display-string files, and `scripts/run-tests.js`; it contains no `App.jsx`, reading-logic, route, or tarot-data changes. An authenticated runtime screenshot and browser `scrollWidth` check were **not performed**, so they are not claimed here.

- [ ] **Step 2: Inspect responsive rules**

At desktop and mobile widths, verify the centered maximum reading column, paper-section rhythm, controlled line length, and two-column option metadata. Do not authenticate, create data, or alter a reading to perform this check.

- [ ] **Step 3: Record verification**

```bash
git add docs/superpowers/plans/2026-07-17-result-reading-layout.md
git commit -m "docs: record reading layout verification"
```
