# Mobile Hero Redesign

## Scope

Only the homepage Hero changes at viewport widths of 768px or less. Desktop and wider tablet layouts remain visually and structurally unchanged. Routing, data, interactions, component APIs, and every section below the Hero remain unchanged.

## Mobile composition

The Hero becomes a single-column editorial composition in this order:

1. Archive label
2. Headline
3. Quote and source
4. Existing CTA
5. Existing celestial tarot artwork

All content is left aligned except the tarot artwork, which is centered within its own full-width stage beneath the copy. The Hero uses compact vertical spacing so the yellow marquee divider sits close to the first viewport fold.

## Headline behavior

The Chinese headline is intentionally divided into two mobile lines:

```text
对发生的一切
保持思考
```

The existing localized headline remains the source of truth. `HomePage.jsx` may add presentation-only spans or a mobile-only break so Chinese wrapping is deterministic. On screens wider than 768px, those wrappers behave as normal inline content and produce no desktop visual change. English and Italian continue using their existing localized strings with balanced wrapping and no character-by-character breaks.

## Mobile sizing and spacing

- Reduce empty space above the archive label and headline.
- Use a slightly more generous headline line-height than the current compressed mobile rule.
- Keep the quote wide enough for two or three readable lines and prevent extremely narrow wrapping.
- Keep the CTA content-sized and directly below the quote.
- Reduce the tarot card by approximately 15% from the current mobile presentation.
- Reduce card rotation while retaining the existing glow, orbit, star, and coordinate language.
- Constrain the artwork stage height so the overall Hero remains comfortable within the first mobile screen.

## Implementation boundary

- `src/pages/HomePage.jsx`: presentation-only headline wrapping, if required for deterministic Chinese line breaks.
- `src/solar.css`: new `max-width: 768px` Hero overrides.
- No global token changes.
- No desktop or wider tablet rule changes.
- No JavaScript behavior changes.

## Verification

- Inspect the Hero at representative widths: 390px, 430px, and 768px.
- Confirm the Chinese headline is exactly two lines.
- Confirm the CTA remains content-sized.
- Confirm the card appears below the text and is horizontally centered.
- Confirm there is no horizontal overflow.
- Confirm the desktop Hero is unchanged at 1280px or wider.
- Run `npm run build` and `npm test`.
