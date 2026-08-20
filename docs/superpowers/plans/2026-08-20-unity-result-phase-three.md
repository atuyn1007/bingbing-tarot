# Unity Result Phase Three Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the frozen Unity casting result to a versioned I Ching knowledge layer and deliver the responsive “见象 × 观势” result page without tarot meanings, synthesis, or AI.

**Architecture:** Keep `calculateUnityResult()` as the immutable calculation source. Add a complete 8-trigram/64-hexagram structural catalogue, a separately versioned partial editorial content catalogue, and a pure adapter that creates localized knowledge snapshots without recalculating the cast. Persist a wrapper containing the unchanged calculation plus localized knowledge snapshots, then render it through focused tarot-archive and I Ching-reading components.

**Tech Stack:** React 18, Vite 5, Framer Motion 11, Lucide React, existing `useI18n`, Node `assert` test scripts, CSS in `src/solar.css`.

**Spec:** `docs/superpowers/specs/2026-08-20-unity-result-phase-three-design.md`

## Global Constraints

- Do not modify the frozen 2/3 mapping, 6/7/8/9 line rules, bottom-to-top line order, moving-line rules, or King Wen ordering.
- Do not modify the frozen Unity reading data model; persist the calculation unchanged inside a separate archive wrapper.
- Do not add tarot meanings, six-line/tarot fusion, synthesis, advice, auspiciousness, AI, or new Supabase columns.
- Keep canonical I Ching text separate from modern editorial summaries in data and DOM.
- Store all new user-visible text in the existing Chinese, English, and Italian locale files.
- Complete structural records for all 64 hexagrams; only verified editorial fixtures may contain canonical and modern text.
- Missing editorial content must render an explicit localized unavailable state and must never be fabricated.
- Preserve the visual data order `初爻 → 上爻`; reverse only the left-panel presentation order.
- Use existing tarot artwork and fallback behavior; do not render 78 card faces.

---

## File Map

**Create**

- `src/data/unity/trigrams.js`: eight stable trigram structures.
- `src/data/unity/hexagrams.js`: complete 64-hexagram structural catalogue.
- `src/data/unity/keywords.js`: controlled keyword IDs and localized labels used by verified fixtures.
- `src/data/unity/sources.js`: provenance metadata for canonical and editorial content.
- `src/data/unity/hexagramContent.js`: partial verified hexagram-level content records.
- `src/data/unity/lineTexts.js`: partial verified line-level content records.
- `src/unityKnowledge.js`: structural validation, localized lookup, and knowledge snapshot construction.
- `src/unityResultPersistence.js`: owner-scoped immutable result archive validation and storage.
- `src/components/unity/UnityTarotArchive.jsx`: six-row tarot image panel and card metadata popover.
- `src/components/unity/UnityHexagramSection.jsx`: primary/changed hexagram archive section.
- `src/components/unity/UnityMovingLinesSection.jsx`: moving-line or no-moving-line section.

**Modify**

- `src/unityAlgorithm.js`: consume the structural catalogue for hexagram identity lookup without changing output or rules.
- `src/pages/UnityResultPage.jsx`: compose the Phase 3 two-column result page.
- `src/pages/UnityIntroPage.jsx`: expose the latest completed-result reopening action.
- `src/App.jsx`: build, persist, load, and display a Unity result archive wrapper.
- `src/i18n/locales/zh-CN.ts`: Phase 3 result, metadata, error, and replay copy.
- `src/i18n/locales/en.ts`: equivalent English copy.
- `src/i18n/locales/it.ts`: equivalent natural Italian copy.
- `src/solar.css`: two-column archive layout, popover, paper sections, breakpoints, and focus states.
- `scripts/run-unity-tests.js`: structural, knowledge, persistence, source-contract, and layout-contract tests.

---

### Task 1: Complete Structural I Ching Catalogue

**Files:**

- Create: `src/data/unity/trigrams.js`
- Create: `src/data/unity/hexagrams.js`
- Modify: `src/unityAlgorithm.js`
- Test: `scripts/run-unity-tests.js`

**Interfaces:**

- Produces: `UNITY_TRIGRAMS`, `UNITY_HEXAGRAMS`, `getUnityTrigram(id)`, `getUnityHexagramByNumber(number)`, `getUnityHexagramByTrigrams(upperId, lowerId)`.
- Preserves: `calculateUnityResult(rounds, options)` output fields and values.

- [ ] **Step 1: Write failing structural catalogue tests**

Add imports and assertions to `scripts/run-unity-tests.js`:

```js
import {
  UNITY_HEXAGRAMS,
  getUnityHexagramByNumber,
  getUnityHexagramByTrigrams,
} from '../src/data/unity/hexagrams.js';
import { UNITY_TRIGRAMS } from '../src/data/unity/trigrams.js';

test('Unity structural knowledge indexes all trigrams and King Wen hexagrams', () => {
  assert.equal(UNITY_TRIGRAMS.length, 8);
  assert.equal(UNITY_HEXAGRAMS.length, 64);
  assert.equal(new Set(UNITY_HEXAGRAMS.map((item) => item.kingWenNumber)).size, 64);
  assert.deepEqual(getUnityHexagramByNumber(1).linePatternBottomToTop, Array(6).fill('yang'));
  assert.deepEqual(getUnityHexagramByNumber(2).linePatternBottomToTop, Array(6).fill('yin'));
  assert.equal(getUnityHexagramByTrigrams('kun', 'qian').kingWenNumber, 11);
  assert.equal(getUnityHexagramByTrigrams('qian', 'kun').kingWenNumber, 12);
});
```

- [ ] **Step 2: Run the Unity tests and verify the missing-module failure**

Run: `node scripts/run-unity-tests.js`

Expected: FAIL because `src/data/unity/hexagrams.js` does not exist.

- [ ] **Step 3: Implement the eight trigrams**

Create records with stable IDs and bottom-to-top line arrays:

```js
export const UNITY_TRIGRAMS = Object.freeze([
  { id: 'qian', nameKey: 'qian', unicode: '☰', linePatternBottomToTop: ['yang', 'yang', 'yang'] },
  { id: 'dui', nameKey: 'dui', unicode: '☱', linePatternBottomToTop: ['yang', 'yang', 'yin'] },
  { id: 'li', nameKey: 'li', unicode: '☲', linePatternBottomToTop: ['yang', 'yin', 'yang'] },
  { id: 'zhen', nameKey: 'zhen', unicode: '☳', linePatternBottomToTop: ['yang', 'yin', 'yin'] },
  { id: 'xun', nameKey: 'xun', unicode: '☴', linePatternBottomToTop: ['yin', 'yang', 'yang'] },
  { id: 'kan', nameKey: 'kan', unicode: '☵', linePatternBottomToTop: ['yin', 'yang', 'yin'] },
  { id: 'gen', nameKey: 'gen', unicode: '☶', linePatternBottomToTop: ['yin', 'yin', 'yang'] },
  { id: 'kun', nameKey: 'kun', unicode: '☷', linePatternBottomToTop: ['yin', 'yin', 'yin'] },
]);
```

- [ ] **Step 4: Implement all 64 structural hexagram records**

Build records from the frozen King Wen upper/lower mapping. Each record must have:

```js
{
  hexagramId: 'hexagram-01',
  kingWenNumber: 1,
  nameKey: 'qian',
  upperTrigramId: 'qian',
  lowerTrigramId: 'qian',
  linePatternBottomToTop: ['yang', 'yang', 'yang', 'yang', 'yang', 'yang'],
  unicode: '䷀',
  structuralStatus: 'verified',
}
```

Generate Unicode deterministically from `String.fromCodePoint(0x4dc0 + kingWenNumber - 1)` and derive the six-line pattern from the lower then upper trigram records. Export frozen lookup functions that return `null` for invalid identities.

- [ ] **Step 5: Refactor the algorithm to use the catalogue**

Replace the private `TRIGRAMS`, `TRIGRAM_BY_PATTERN`, `HEXAGRAM_NUMBERS`, and duplicated name-key lookup with catalogue functions. Keep the algorithm result shape exactly:

```js
return {
  number: structure.kingWenNumber,
  nameKey: structure.nameKey,
  lowerTrigram: structure.lowerTrigramId,
  upperTrigram: structure.upperTrigramId,
  linePatternBottomToTop: [...pattern],
};
```

- [ ] **Step 6: Run structural and existing algorithm tests**

Run: `node scripts/run-unity-tests.js`

Expected: all existing 9 Unity tests plus the new structural test pass; the Tai/Pi and no-moving results remain unchanged.

- [ ] **Step 7: Commit the structural catalogue**

```bash
git add src/data/unity/trigrams.js src/data/unity/hexagrams.js src/unityAlgorithm.js scripts/run-unity-tests.js
git commit -m "feat: add unity iching structural catalogue"
```

### Task 2: Versioned Editorial Knowledge and Lookup Adapter

**Files:**

- Create: `src/data/unity/keywords.js`
- Create: `src/data/unity/sources.js`
- Create: `src/data/unity/hexagramContent.js`
- Create: `src/data/unity/lineTexts.js`
- Create: `src/unityKnowledge.js`
- Test: `scripts/run-unity-tests.js`

**Interfaces:**

- Produces: `UNITY_KNOWLEDGE_VERSION`, `getUnityHexagramKnowledge(number, locale)`, `getUnityLineKnowledge(number, lineIndex, locale)`, `buildUnityKnowledgeSnapshot(result, locale)`, `buildUnityKnowledgeSnapshots(result, locales)`.
- Consumes: Task 1 structural lookups and unchanged `calculateUnityResult()` output.

- [ ] **Step 1: Add failing separation, mapping, and missing-content tests**

```js
import {
  buildUnityKnowledgeSnapshot,
  getUnityHexagramKnowledge,
  getUnityLineKnowledge,
} from '../src/unityKnowledge.js';

test('verified Unity knowledge separates canonical and modern content', () => {
  const qian = getUnityHexagramKnowledge(1, 'zh-CN');
  assert.equal(qian.structure.kingWenNumber, 1);
  assert.ok(qian.canonical.originalText.includes('乾'));
  assert.ok(qian.modern.summary);
  assert.notEqual(qian.canonical.originalText, qian.modern.summary);
  assert.ok(qian.keywords.length >= 2);
  assert.ok(qian.canonical.sourceId);
});

test('moving-line knowledge uses the primary hexagram and exact one-based position', () => {
  const first = getUnityLineKnowledge(1, 1, 'zh-CN');
  const sixth = getUnityLineKnowledge(1, 6, 'zh-CN');
  assert.equal(first.linePosition, 1);
  assert.equal(sixth.linePosition, 6);
  assert.notEqual(first.canonical.originalText, sixth.canonical.originalText);
});

test('missing editorial knowledge is explicit and never borrowed', () => {
  const missing = getUnityHexagramKnowledge(64, 'zh-CN');
  assert.equal(missing.contentStatus, 'unavailable');
  assert.equal(missing.canonical, null);
  assert.equal(missing.modern, null);
});
```

- [ ] **Step 2: Run tests and verify the adapter is missing**

Run: `node scripts/run-unity-tests.js`

Expected: FAIL because `src/unityKnowledge.js` does not exist.

- [ ] **Step 3: Add provenance and controlled keywords**

Create source records with separate canonical and editorial identities:

```js
export const UNITY_SOURCES = Object.freeze({
  'zhouyi-canonical-ctext': {
    sourceId: 'zhouyi-canonical-ctext',
    title: '周易·经',
    sourceType: 'canonical-text',
    referenceUrl: 'https://ctext.org/book-of-changes/zh',
  },
  'bingbing-unity-editorial-v1': {
    sourceId: 'bingbing-unity-editorial-v1',
    title: 'Bingbing Unity editorial summaries',
    sourceType: 'modern-editorial',
    contentVersion: '1.0.0',
  },
});
```

Only add keyword IDs actually used by the verified fixtures, each with `zh-CN`, `en`, and `it` labels.

- [ ] **Step 4: Add verified development fixtures**

Add complete Chinese canonical judgement and six line texts for Hexagram 1 (乾), Hexagram 2 (坤), Hexagram 11 (泰), and Hexagram 12 (否), verified against the declared canonical source. Keep the Chinese original unchanged across locale records; add concise, non-predictive modern summaries and controlled keywords in Chinese, English, and Italian as separately marked editorial content. Mark every fixture with `contentVersion: '1.0.0'` and `contentStatus: 'development-verified'`.

Use exact separate fields; for example:

```js
{
  hexagramId: 'hexagram-01',
  locale: 'zh-CN',
  contentVersion: '1.0.0',
  contentStatus: 'development-verified',
  canonical: {
    originalText: '乾：元，亨，利，贞。',
    sourceId: 'zhouyi-canonical-ctext',
  },
  modern: {
    summary: '此卦呈现持续发动与开创的结构，重点在于让行动保持秩序、节度与长期一致性。',
    sourceId: 'bingbing-unity-editorial-v1',
  },
  keywordIds: ['initiative', 'continuity', 'discipline'],
}
```

Do not add content records for the other 60 hexagrams in this task. Their complete structural records from Task 1 remain available.

- [ ] **Step 5: Implement locale-normalized lookup**

Implement `normalizeUnityLocale()` mapping only the current project locales (`zh-CN`, `en`, `it`). `getUnityHexagramKnowledge()` and `getUnityLineKnowledge()` must always return the correct structural identity plus either verified content or:

```js
{
  structure,
  canonical: null,
  modern: null,
  keywords: [],
  contentStatus: 'unavailable',
  contentVersion: null,
}
```

- [ ] **Step 6: Implement result validation and localized snapshot construction**

`buildUnityKnowledgeSnapshot(result, locale)` must:

1. Validate six ordered rounds and exact primary/changed patterns against the structural catalogue.
2. Resolve the primary hexagram knowledge.
3. Resolve each moving line from the primary hexagram using `round.lineIndex`.
4. Set `changed: null` when `movingLineIndexes.length === 0`.
5. Otherwise resolve the changed hexagram knowledge.
6. Never call `Math.random`, `calculateUnityResult`, or any casting function.

`buildUnityKnowledgeSnapshots(result, ['zh-CN', 'en', 'it'])` returns a keyed frozen object.

- [ ] **Step 7: Run knowledge tests**

Run: `node scripts/run-unity-tests.js`

Expected: catalogue, canonical/modern separation, exact line lookup, missing-content, Tai/Pi, and existing casting tests all pass.

- [ ] **Step 8: Commit the knowledge layer**

```bash
git add src/data/unity src/unityKnowledge.js scripts/run-unity-tests.js
git commit -m "feat: connect unity iching knowledge"
```

### Task 3: Immutable Completed-Result Archive and Replay

**Files:**

- Create: `src/unityResultPersistence.js`
- Modify: `src/App.jsx`
- Modify: `src/pages/UnityIntroPage.jsx`
- Test: `scripts/run-unity-tests.js`

**Interfaces:**

- Produces: `createUnityResultArchive(calculation, ownerId)`, `validateUnityResultArchive(archive, ownerId)`, `saveUnityResultArchive(storage, archive)`, `loadUnityResultArchive(storage, ownerId)`, `clearUnityResultArchive(storage, ownerId)`.
- Archive shape: `{ schemaVersion, ownerId, calculation, knowledgeByLocale, savedAt }`.

- [ ] **Step 1: Write failing replay and corruption tests**

```js
import {
  createUnityResultArchive,
  loadUnityResultArchive,
  saveUnityResultArchive,
} from '../src/unityResultPersistence.js';

test('completed Unity archive reopens without recasting or changing facts', () => {
  const storage = memoryStorage();
  const calculation = calculateUnityResult(roundsForLineValues([9, 7, 8, 7, 8, 6]), { question: 'Q' });
  const archive = createUnityResultArchive(calculation, 'u1', '2026-08-20T00:00:00.000Z');
  saveUnityResultArchive(storage, archive);
  const reopened = loadUnityResultArchive(storage, 'u1');
  assert.deepEqual(reopened.calculation.rounds, calculation.rounds);
  assert.deepEqual(reopened.calculation.movingLineIndexes, calculation.movingLineIndexes);
  assert.deepEqual(reopened.calculation.primaryHexagram, calculation.primaryHexagram);
  assert.deepEqual(reopened.knowledgeByLocale['zh-CN'].primary.structure, archive.knowledgeByLocale['zh-CN'].primary.structure);
});
```

Also write rejection assertions for the wrong owner, duplicate cards, altered line values, missing locale snapshots, malformed JSON, and a changed primary pattern.

- [ ] **Step 2: Run tests and verify the persistence module is missing**

Run: `node scripts/run-unity-tests.js`

Expected: FAIL because `src/unityResultPersistence.js` does not exist.

- [ ] **Step 3: Implement owner-scoped archive validation and storage**

Use a new prefix such as `bingbing_tarot_unity_result_v1:<ownerId>`. Validation must derive and compare line facts using pure existing helpers, verify 18 unique card IDs, validate both hexagram structures through `buildUnityKnowledgeSnapshot()`, and verify all three locale snapshots. It must never repair or recalculate a corrupted archive.

- [ ] **Step 4: Wire completed casting to archive creation**

In `handleCompleteUnityCasting()`:

```js
const calculation = calculateUnityResult(unitySession.completedRounds, {
  question: unitySession.question,
  locale: unitySession.locale,
});
const archive = createUnityResultArchive(calculation, unitySession.ownerId);
saveUnityResultArchive(window.localStorage, archive);
setUnityResultArchive(archive);
```

Keep `calculation` unchanged. Do not add knowledge fields to the frozen calculation object.

- [ ] **Step 5: Add result reopening from the Unity introduction**

When Unity is selected, load both the in-progress draft and completed archive for the current owner. Add a separate `onOpenResult` and `hasSavedResult` prop to `UnityIntroPage`. The button only sets the existing archive into state and changes `currentPage` to `unity-result`; it must not call `createUnityCastingSession()` or `calculateUnityResult()`.

- [ ] **Step 6: Run persistence and source-contract tests**

Run: `node scripts/run-unity-tests.js`

Expected: owner isolation, corrupt archive rejection, exact replay, intro reopening, and all previous tests pass.

- [ ] **Step 7: Commit result persistence**

```bash
git add src/unityResultPersistence.js src/App.jsx src/pages/UnityIntroPage.jsx scripts/run-unity-tests.js
git commit -m "feat: preserve unity result snapshots"
```

### Task 4: “见象” Tarot Archive and Accessible Metadata Interaction

**Files:**

- Create: `src/components/unity/UnityTarotArchive.jsx`
- Modify: `src/pages/UnityResultPage.jsx`
- Test: `scripts/run-unity-tests.js`

**Interfaces:**

- Consumes: unchanged `calculation.rounds`, `language`, and `t`.
- Produces: six visual groups in order 6 → 1 while leaving `calculation.rounds` untouched.

- [ ] **Step 1: Write failing source-contract tests**

```js
test('Unity tarot archive reverses presentation only and limits card metadata', () => {
  const source = readFileSync(new URL('../src/components/unity/UnityTarotArchive.jsx', import.meta.url), 'utf8');
  assert.match(source, /\[\.\.\.rounds\]\.reverse\(\)/);
  assert.match(source, /aria-expanded/);
  assert.match(source, /pointerdown/);
  assert.match(source, /getLocalizedMeaningCard/);
  assert.doesNotMatch(source, /displayReading|displayDetail|keywords|meaning/i);
});
```

- [ ] **Step 2: Run tests and verify the component is missing**

Run: `node scripts/run-unity-tests.js`

Expected: FAIL because the archive component does not exist.

- [ ] **Step 3: Implement the six-row archive**

Render `const visualRounds = [...rounds].reverse()` and keep each round as one labelled row with exactly three `TarotCard` instances. Default markup must not show names or orientation text outside the metadata popover.

- [ ] **Step 4: Implement desktop and mobile metadata behavior**

Each card wrapper is a button with `aria-expanded` and a minimum 44px interactive area. CSS hover/focus reveals the popover on pointer-capable desktop. React state handles mobile tap toggling. A document `pointerdown` listener closes an open popover when the target is outside the archive root; remove the listener during cleanup.

The popover fields are exactly:

```text
{lineLabel} · {cardIndexLabel}
{localizedCardName}
{uprightOrReversed}
```

- [ ] **Step 5: Use the existing localized tarot name archive**

Lazy-import `cardMeanings.js` with the same cancellation guard already used by the Phase 2 result page. Chinese uses the saved name, while English and Italian use `getLocalizedMeaningCard(...).displayName`; fall back to `englishName` only if the archive fails to load.

- [ ] **Step 6: Run archive component tests**

Run: `node scripts/run-unity-tests.js`

Expected: presentation reversal, accessible interaction, cleanup, localization, and absence of tarot meanings pass.

- [ ] **Step 7: Commit the tarot archive**

```bash
git add src/components/unity/UnityTarotArchive.jsx src/pages/UnityResultPage.jsx scripts/run-unity-tests.js
git commit -m "feat: build unity tarot archive"
```

### Task 5: “观势” Hexagram and Moving-Line Reading Components

**Files:**

- Create: `src/components/unity/UnityHexagramSection.jsx`
- Create: `src/components/unity/UnityMovingLinesSection.jsx`
- Modify: `src/pages/UnityResultPage.jsx`
- Test: `scripts/run-unity-tests.js`

**Interfaces:**

- Consumes: `knowledgeByLocale[language]`, unchanged calculation facts, localized trigram/name labels, and `t`.
- Produces: primary, moving-line/no-moving-line, and optional changed sections.

- [ ] **Step 1: Write failing result-structure tests**

```js
test('Unity result composes primary moving and optional changed knowledge sections', () => {
  const source = readFileSync(new URL('../src/pages/UnityResultPage.jsx', import.meta.url), 'utf8');
  assert.match(source, /<UnityTarotArchive/);
  assert.match(source, /<UnityHexagramSection/);
  assert.match(source, /<UnityMovingLinesSection/);
  assert.match(source, /knowledge\.changed\s*\?/);
  assert.doesNotMatch(source, /displayReading|displayDetail|integrated|synthesis|advice|AI/i);
});
```

Add component source assertions that canonical and modern values are rendered through separate properties and sections rather than `split()`.

- [ ] **Step 2: Run tests and verify the reading components are missing**

Run: `node scripts/run-unity-tests.js`

Expected: FAIL because the new components do not exist.

- [ ] **Step 3: Implement the hexagram archive section**

`UnityHexagramSection` renders the label, self-drawn six-line glyph, localized name, padded King Wen number, upper/lower trigram labels, canonical judgement, modern summary, and keyword tags. Use distinct elements:

```jsx
<section className="unity-canonical-text">
  <h4>{t('unity.canonicalText')}</h4>
  <blockquote>{knowledge.canonical?.originalText || t('unity.knowledgeUnavailable')}</blockquote>
</section>
<section className="unity-modern-summary">
  <h4>{t('unity.modernSummary')}</h4>
  <p>{knowledge.modern?.summary || t('unity.knowledgeUnavailable')}</p>
</section>
```

- [ ] **Step 4: Implement moving-line and stable-state sections**

For moving lines, render each knowledge record with line label, polarity, `old-yin`/`old-yang` label, canonical line text, and modern summary. Use restrained `is-moving` gold styling. For zero moving lines render only the localized title and stable explanation; do not render a changed section or text equivalent to “primary equals changed.”

- [ ] **Step 5: Compose the final two-column result page**

Use:

```jsx
const knowledge = archive.knowledgeByLocale[language] || archive.knowledgeByLocale['zh-CN'];

<div className="unity-result-layout">
  <UnityTarotArchive rounds={archive.calculation.rounds} ... />
  <aside className="unity-result-reading-panel">
    <UnityHexagramSection kind="primary" knowledge={knowledge.primary} ... />
    <UnityMovingLinesSection lines={knowledge.movingLines} ... />
    {knowledge.changed ? <UnityHexagramSection kind="changed" knowledge={knowledge.changed} ... /> : null}
  </aside>
</div>
```

Include the fixed changed-hexagram helper only when `knowledge.changed` exists.

- [ ] **Step 6: Run component and no-moving tests**

Run: `node scripts/run-unity-tests.js`

Expected: primary/moving/changed composition, strict canonical/modern separation, missing-content fallback, and no-moving suppression all pass.

- [ ] **Step 7: Commit the I Ching result components**

```bash
git add src/components/unity/UnityHexagramSection.jsx src/components/unity/UnityMovingLinesSection.jsx src/pages/UnityResultPage.jsx scripts/run-unity-tests.js
git commit -m "feat: render unity iching result"
```

### Task 6: Localization and Responsive Archive Styling

**Files:**

- Modify: `src/i18n/locales/zh-CN.ts`
- Modify: `src/i18n/locales/en.ts`
- Modify: `src/i18n/locales/it.ts`
- Modify: `src/solar.css`
- Test: `scripts/run-unity-tests.js`

**Interfaces:**

- Produces: all Phase 3 `unity.*` copy and responsive class contracts used by Tasks 3–5.

- [ ] **Step 1: Write failing locale and CSS contract tests**

Require these keys in all three locales:

```js
const phaseThreeKeys = [
  'imagePanelTitle', 'readingPanelTitle', 'canonicalText', 'modernSummary',
  'keywords', 'upperTrigram', 'lowerTrigram', 'hexagramNumber',
  'movingLineType', 'noMovingLinesTitle', 'noMovingLinesDescription',
  'changedHexagramHelp', 'knowledgeUnavailable', 'cardPosition',
  'openSavedResult', 'savedResultInvalid',
];
```

Read `solar.css` and assert it contains `.unity-result-layout`, `.unity-result-tarot-grid`, `.unity-result-reading-panel`, `.unity-card-popover`, a `@media (max-width: 900px)` block, and `grid-template-columns: repeat(3, minmax(0, 1fr))` for tarot rows.

- [ ] **Step 2: Run tests and verify missing keys/styles fail**

Run: `node scripts/run-unity-tests.js`

Expected: FAIL on absent locale keys and Phase 3 class contracts.

- [ ] **Step 3: Add complete Chinese, English, and Italian copy**

Add every key from the failing test. Preserve arrays for line labels, hexagram names, and new trigram display labels. Italian copy must be natural, for example `Testo originale`, `Sintesi moderna`, `Esagramma principale`, and `Nessuna linea mobile` rather than untranslated English keys.

- [ ] **Step 4: Replace the Phase 2 result CSS with the final visual hierarchy**

Desktop:

- `.unity-result-layout`: `grid-template-columns: minmax(0, 1.35fr) minmax(320px, .85fr)`.
- Left panel: six paper/archive rows, three clear card columns, no visible default card text.
- Right panel: continuous manuscript sections with varied spacing and fine gold rules, not equal modern cards.
- Popover: readable paper-toned surface, restrained border, no neon glow.
- Visible `:focus-visible` outlines and 44px minimum controls.

Mobile at 900px and below:

- One column with tarot panel first and reading panel second.
- Tarot rows remain three columns.
- Sticky positioning is disabled.
- All grid children use `min-width: 0`; images and text cannot cause overflow.

- [ ] **Step 5: Add reduced-motion behavior**

Under `@media (prefers-reduced-motion: reduce)`, disable hover lift transitions and popover motion while keeping visibility and interaction intact.

- [ ] **Step 6: Run locale and CSS tests**

Run: `node scripts/run-unity-tests.js`

Expected: all locale keys and responsive contracts pass.

- [ ] **Step 7: Commit localization and styling**

```bash
git add src/i18n/locales/zh-CN.ts src/i18n/locales/en.ts src/i18n/locales/it.ts src/solar.css scripts/run-unity-tests.js
git commit -m "feat: style unity result archive"
```

### Task 7: Scenario Coverage, Browser Verification, and Final Scope Audit

**Files:**

- Modify: `scripts/run-unity-tests.js`
- Modify only if verification exposes an issue: Phase 3 files listed above.

**Interfaces:**

- Verifies the complete Phase 3 deliverable; produces no new feature interface.

- [ ] **Step 1: Add the four required movement-scenario tests**

Use fixed line values and assert both raw calculation and knowledge snapshot:

```js
const scenarios = [
  { name: 'none', values: [7, 7, 7, 7, 7, 7], moving: [], primary: 1, changed: null },
  { name: 'single', values: [9, 7, 7, 7, 7, 7], moving: [1], primary: 1, changedNumber: 44 },
  { name: 'multiple', values: [9, 9, 7, 7, 7, 7], moving: [1, 2], primary: 1, changedNumber: 33 },
  { name: 'all', values: [9, 9, 9, 9, 9, 9], moving: [1, 2, 3, 4, 5, 6], primary: 1, changedNumber: 2 },
];
```

For every moving line, assert `snapshot.movingLines[index].lineIndex` and canonical source mapping match the primary Qian fixture. Assert the archive contains exactly 18 unique cards in the original round order.

- [ ] **Step 2: Run the complete automated suite**

Run: `npm test`

Expected: all base, draw-flow, and Unity tests pass with zero failures.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: Vite exits with code 0 and reports a completed production build.

- [ ] **Step 4: Start the local app for visual verification**

Run: `npm run dev -- --host 127.0.0.1 --port 4173`

Expected: Vite serves the app at `http://127.0.0.1:4173/` without startup errors.

- [ ] **Step 5: Verify the complete result flow at four widths**

At 360, 768, 1024, and 1440px, complete or load a deterministic Unity result and verify:

- 18 cards render as six groups of three.
- Desktop shows tarot left and I Ching reading right.
- Mobile shows tarot, primary, moving/no-moving, then changed.
- Hover/focus and tap show only line/card/name/orientation metadata.
- Missing fixture content is explicit, not blank or borrowed.
- No horizontal overflow occurs (`document.documentElement.scrollWidth === document.documentElement.clientWidth`).
- Browser console contains no new errors or warnings.

- [ ] **Step 6: Audit the prohibited scope**

Run:

```bash
rg -n "displayReading|displayDetail|integrated|synthesis|advice|fortune|AI" src/pages/UnityResultPage.jsx src/components/unity src/unityKnowledge.js
```

Expected: no tarot meanings, synthesis, advice, fortune scoring, or AI implementation. Legitimate accessibility labels and the fixed changed-hexagram help are allowed.

- [ ] **Step 7: Review the final diff and commit verification fixes**

Run:

```bash
git diff --check
git status --short
git diff --stat
```

Expected: no whitespace errors and only Phase 3 files changed. If verification required fixes, commit them:

```bash
git add scripts/run-unity-tests.js src
git commit -m "test: verify unity result phase three"
```

- [ ] **Step 8: Stop at the Phase 3 boundary**

Report modified files, new data files, exact verified knowledge fixtures, remaining missing knowledge, automated results, viewport results, console status, and any limitations. Do not start the six-line/tarot fusion phase.
