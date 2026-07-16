# Mobile Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the homepage a dedicated, compact mobile Hero with an intentional two-line Chinese headline and vertically stacked tarot artwork without changing desktop or application behavior.

**Architecture:** Keep the existing Hero component and actions intact. Add presentation-only headline fragments in `HomePage.jsx`, then override only Hero presentation under `max-width: 768px` in `solar.css`; desktop rules remain untouched.

**Tech Stack:** React 18, JSX, CSS media queries, Vite.

## Global Constraints

- Only the homepage Hero changes at viewport widths of 768px or less.
- Desktop and wider tablet layouts remain unchanged.
- No routing, data, interaction, component API, or business-logic changes.
- No global design-token changes.
- Every section below the Hero remains unchanged.

---

### Task 1: Deterministic mobile headline

**Files:**
- Modify: `src/pages/HomePage.jsx:75-88`
- Test: `scripts/run-tests.js`

**Interfaces:**
- Consumes: `t('home.heroHeadline')`; no language prop is added to `HomePage`.
- Produces: `.home-hero-title-line` spans and `.home-hero-title-line-mobile-break` presentation hooks; no new props or callbacks.

- [ ] **Step 1: Add a failing source-preservation assertion**

Add an assertion to the existing homepage source test that checks the localized headline remains the source of truth and the mobile presentation hook exists:

```js
assert.match(homePageSource, /home-hero-title-line/)
assert.match(homePageSource, /t\('home\.heroHeadline'\)/)
```

- [ ] **Step 2: Run the targeted test and verify failure**

Run: `npm test`

Expected: the homepage source-preservation test fails because `home-hero-title-line` does not exist yet.

- [ ] **Step 3: Add presentation-only headline wrapping**

Keep the translation call as the source and fallback. Compare its result with the existing Chinese localized string, then render two explicit spans with a mobile-only break:

```jsx
const heroHeadline = t('home.heroHeadline');

<h2 className="home-hero-title">
  {heroHeadline === '对发生的一切保持思考' ? (
    <>
      <span className="home-hero-title-line">对发生的一切</span>
      <span className="home-hero-title-line home-hero-title-line-mobile-break">保持思考</span>
    </>
  ) : heroHeadline}
</h2>
```

- [ ] **Step 4: Run tests and verify pass**

Run: `npm test`

Expected: all tests pass, including the new presentation-hook assertion.

### Task 2: Dedicated mobile Hero composition

**Files:**
- Modify: `src/solar.css` after the existing homepage responsive rules

**Interfaces:**
- Consumes: `.home-hero`, `.home-hero-copy`, `.hero-kicker`, `.home-hero-title`, `.home-hero-quote`, `.hero-outline-button`, `.daily-orbit`, `.daily-orbit-card`, and `.hero-mystery-card`.
- Produces: a single-column mobile composition scoped to `@media (max-width: 768px)`.

- [ ] **Step 1: Add scoped mobile overrides**

Append one `max-width: 768px` block that:

```css
@media (max-width: 768px) {
  .home-hero {
    grid-template-columns: minmax(0, 1fr);
    align-content: start;
    gap: 14px;
    height: auto;
    min-height: min(690px, calc(100svh - 58px));
    padding: 22px 0 8px;
    overflow: hidden;
  }

  .home-hero-copy {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    padding: 18px 2px 0;
  }

  .home-hero .hero-kicker {
    position: static;
    order: 0;
    margin: 0 0 12px;
  }

  html[lang='zh-CN'] .home-hero-title {
    max-width: none;
    font-size: clamp(2.35rem, 10.8vw, 3.2rem);
    line-height: 1.08;
    word-break: keep-all;
  }

  .home-hero-title-line { display: inline; white-space: nowrap; }
  .home-hero-title-line-mobile-break { display: block; }

  .home-hero-quote {
    width: min(100%, 29rem);
    max-width: 34ch;
  }

  .hero-outline-button {
    align-self: flex-start;
    width: auto;
  }

  .daily-orbit {
    min-height: 280px;
    margin: -4px 0 0;
  }

  .daily-orbit-card,
  .hero-mystery-card {
    width: clamp(120px, 32vw, 150px);
    transform: rotate(2.5deg);
  }
}
```

Retain the existing glow and orbit layers, scaling their dimensions to the compact artwork stage without hiding them.

- [ ] **Step 2: Verify responsive behavior**

Inspect 390px, 430px, and 768px widths. Expected:

- Chinese title is exactly two lines.
- Copy is left aligned and card stage follows the CTA.
- Tarot card is centered, smaller, and lightly rotated.
- CTA remains content-sized.
- Yellow marquee appears close to the first fold.
- `document.documentElement.scrollWidth <= window.innerWidth`.

- [ ] **Step 3: Verify desktop regression**

Inspect at 1280px or wider. Expected: computed grid columns, headline placement, card placement, and Hero height match the approved desktop composition.

- [ ] **Step 4: Run production verification**

Run: `npm run build`

Expected: Vite production build exits with code 0.

Run: `npm test`

Expected: all tests pass.
