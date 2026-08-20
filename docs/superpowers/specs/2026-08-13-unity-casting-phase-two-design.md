# Unity Casting Phase Two Design

## Goal and Scope

Build the complete six-round casting flow for the Unity of All Things spread. Each round represents one line from Initial through Top, reveals three tarot cards in order, persists the completed round immediately, and advances automatically on the same page. After round six, calculate and display the primary hexagram, moving lines, and changed hexagram.

This phase does not generate I Ching interpretation, tarot interpretation, advice, synthesis, AI output, history records, sharing data, or Supabase writes. The three existing tarot spreads remain unchanged.

## Confirmed Interaction

- The user clicks the three card backs in strict left-to-right order.
- Only the next unrevealed card is interactive; later cards remain disabled.
- Revealing the third card completes the current round.
- The completed round remains visible briefly, then the page scrolls or transitions to the next round without routing to another page.
- The header always shows `Round X / 6` and the corresponding line label: Initial, Second, Third, Fourth, Fifth, or Top.
- After the sixth round, the app calculates the hexagram facts and opens the Unity result state automatically.
- Reduced-motion mode removes large motion and shortens the transition while preserving the same state sequence.

## Casting Session and Randomness

Starting a new casting creates one immutable 18-card snapshot:

- Shuffle the existing 78-card archive once.
- Keep the first 18 unique cards.
- Assign each card its orientation once with the existing threshold, `random() < 0.5` for reversed.
- Store the frozen cards in six consecutive groups of three.
- Never reroll a card or orientation during reveal, round advancement, language switching, restoration, or calculation.

The casting state machine records a schema version, owner scope, question, locale at creation, all 18 frozen cards, current round, revealed card count for the active round, completed structured rounds, timestamps, and status. Pure state functions enforce sequential reveal and idempotency.

## Local Draft Persistence

Phase two uses `localStorage`, not Supabase. The storage key is scoped by the current authenticated user id so different users do not share drafts.

- Save the initial casting session before the first reveal.
- Save again after every successful card reveal.
- A round becomes resumable as soon as its third card is revealed and its round record is committed.
- On return, restore the same question, cards, orientations, completed rounds, active round, and reveal progress.
- Reject and remove malformed, wrong-version, wrong-owner, duplicate-card, or otherwise invalid drafts.
- Clear the draft only after the sixth round has produced a valid result object.
- Starting a new Unity question replaces the same user's earlier in-progress draft.

No database schema or existing tarot history API changes are allowed.

## Frozen Algorithm Adapter

Create a focused Unity algorithm module from the normative `docs/unity-algorithm.md` rules:

- Upright maps to `2`; reversed maps to `3`.
- Each round total is exactly `6`, `7`, `8`, or `9`.
- `6`: old yin, moving, changes to yang.
- `7`: young yang, still, remains yang.
- `8`: young yin, still, remains yin.
- `9`: old yang, moving, changes to yin.
- Lines are stored bottom-to-top from Initial through Top.
- Lines 1–3 form the lower trigram; lines 4–6 form the upper trigram.
- Resolve both hexagrams using the King Wen sequence.
- Moving line indexes contain every 6 or 9 in casting order.
- With no moving lines, the changed hexagram equals the primary hexagram.

The algorithm returns structural facts only: line derivations, trigram identities, hexagram number, localized display name, moving line indexes, and immutable card associations. It contains no meanings, judgments, prose, or interpretation fields.

## Component Boundaries

- `src/unityCastingFlow.js`: pure session creation, sequential reveal, round commitment, advancement, validation, and completion helpers.
- `src/unityPersistence.js`: user-scoped storage keys and safe save/load/clear operations.
- `src/unityAlgorithm.js`: frozen orientation-to-line and line-to-hexagram calculation.
- `src/pages/UnityCastingPage.jsx`: six-round same-page interaction, flip animation, progress header, timer cleanup, reduced motion, and automatic advancement.
- `src/pages/UnityResultPage.jsx`: calculation-only split layout.
- `src/App.jsx`: owns the live session/result and wires the two Unity states without adding ordinary spread behavior.
- Existing i18n locale files and `src/solar.css`: localized interface copy and the existing black-gold archival visual system.

## Result Layout

The result page follows the previously established two-column archive composition:

- Left: six labeled rows, each with the corresponding three tarot cards, for a total of 18. Cards show artwork, localized name, upright/reversed state, and the round's numeric derivation.
- Right: primary hexagram, moving line positions, and changed hexagram. Each hexagram shows its six-line glyph, King Wen number, and localized hexagram name.
- Mobile: the right-hand hexagram archive appears before or after the vertically stacked six tarot groups without horizontal overflow.

The page must not render interpretation headings, I Ching text, tarot meanings, synthesis, advice, reflection questions, or placeholder promises for future interpretation.

## Error Handling and Accessibility

- A card button has an explicit localized label containing round, card position, and locked/revealed state.
- Visible focus styles and a minimum 44px target are required.
- Repeated activation of a revealed or locked card is a no-op.
- Timers are stored and cleared on unmount, restart, home navigation, and restoration.
- If result calculation fails validation, retain the completed draft and show a localized non-destructive error instead of clearing data.
- Decorative astronomy elements are hidden from assistive technology.

## Testing and Acceptance

Automated tests cover:

- one frozen set of 18 unique cards and the original 50% orientation threshold;
- strict 1→2→3 reveal order and idempotent clicks;
- six rounds ordered Initial through Top;
- persistence after every reveal and safe user-scoped restoration;
- rejection of malformed and duplicate-card drafts;
- exact 6/7/8/9 line mappings;
- primary hexagram lookup, moving-line detection, simultaneous changed-line calculation, and no-moving-lines behavior;
- all 18 cards retained in the result object;
- language changes preserving cards and orientations;
- result page containing no interpretation fields or sections;
- ordinary tarot spread source remaining independent from Unity state.

Final verification runs `npm test` and `npm run build`, then inspects the changed-file scope. Work stops after reporting the result and modified files; phase three is not started.
