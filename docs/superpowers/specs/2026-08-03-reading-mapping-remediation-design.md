# Tarot Reading Mapping Remediation Design

## Scope

Repair the deterministic reading engine used by the original three-card, sacred-triangle, either-or, and human-reading flows. Keep the deployed participatory draw UI, Supabase contracts, card archive, orientation probability, history, languages, and Unity / 万象归一路 untouched.

## Confirmed defects

The legacy production result page split one reading string on blank lines even though archive meanings contain blank lines. That caused a later paragraph from one card to appear under the next spread position. The structured result introduced in PR #2 removes that parser and must gain a regression test that proves multiline meanings remain attached to their original card object.

The structured engine maps card IDs correctly, but its semantic layer is too generic: contextual copy does not consume the card's archive meaning, reversed copy lists every possible reversal mode, the mixed relationship fallback invents a generic conflict, and either-or advantages and risks each use only one of the two cards on that path.

## Deterministic interpretation model

Each card section remains the source of truth for `cardId`, position, orientation, localized keywords, and the complete archive meaning. The engine derives a short `meaningLead` from the first non-empty sentence of that same archive meaning. Orientation and contextual copy must include this lead, so changing the card or orientation changes the resulting explanation without an external model.

The engine derives one display theme per card from its first two localized keywords, falling back to the card name. Overview and relationship text receive a trace containing every position and its own theme. Exact repeated keywords may be described as repeated; otherwise the engine lists the distinct position-theme pairs and does not invent a hidden connection.

Advice remains conservative and observable. Upright sections produce a small action tied to their position and theme. Reversed sections produce a verification or pacing action tied to their position and theme. Three-card and sacred-triangle synthesis must include all three supplied positions and never assume past/present/future.

Either-or mapping remains `[A current, B current, A development, B development, self]`. Each option's advantage and risk must consume both its current and development themes and orientations. The comparison and relationship must include the A label, B label, and self-position concern without selecting a winner.

## Localization and rendering

All generated prose stays in the existing `reading` locale dictionaries for Chinese, English, and Italian. Logic branches only on structured data such as `spread.key`, index, and orientation; it never branches on translated strings. `ResultPage` continues to render structured fields directly, so no visual redesign or paragraph parsing is introduced.

## Verification

Tests must fail first for card-specific contextual text, archive-derived reversed text, all-position sacred-triangle synthesis, and two-card-per-path either-or comparison. The final suite must also verify multiline archive isolation, output-field completeness, all locale keys, `npm test`, and `npm run build`.
