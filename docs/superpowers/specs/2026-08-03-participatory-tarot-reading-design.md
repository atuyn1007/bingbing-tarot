# Participatory Tarot Reading Design

## Scope

Redesign the original three-card, sacred-triangle, either-or, and human-reading flows without rebuilding the application or changing Supabase. The in-progress Unity of All Things spread is outside this change and must retain its current code path.

## Experience

The original readings use five explicit phases: `input`, `shuffling`, `selecting`, `revealing`, and `reading`. Confirming a question creates one shuffled 78-card deck but does not expose any face. The user selects three or five numbered card backs, can cancel before confirmation, confirms the set, then reveals individual cards or all cards before opening the reading.

The input archive keeps the celestial stage and paper panel. It adds the spread purpose and positions, question guidance and examples, live character count, actionable incomplete-state button copy, and the professional-advice disclaimer. Either-or readings still require both options.

The draw stage uses a short Framer Motion gathering animation with a skip action and reduced-motion bypass. It renders a small set of accessible card backs rather than face images. Desktop uses a shallow fan; mobile uses horizontal scrolling with touch targets of at least 44px. Selection exposes `aria-pressed`, progress, visible focus, and a restrained gold marker.

After confirmation, selected cards move into the existing spread layout. Each face can be revealed once; “reveal all” is also available. Artwork failures keep the minimal face fallback. Reversed artwork rotates while text and metadata stay upright. The reading action unlocks only after every selected card is revealed.

## Architecture and state

`cardDrawFlow.js` contains pure deck/session helpers and reducer-style state transitions. It owns no React or timers, so uniqueness, selection cancellation, confirmation, and idempotent revealing are directly testable.

`CardDrawStage.jsx` owns only the short shuffle timer and clears it on phase change or unmount. `App.jsx` owns the reading session state and navigation, loads the existing meaning archive, saves history after the user confirms the chosen backs, and leaves language-independent session data intact during locale changes.

`readingEngine.js` builds a structured local reading from the existing archive, localized fallback readings, localized keywords, the original question, the spread positions, orientation distribution, and conservative keyword overlap. It does not call an external model and does not describe itself as AI. The result contains overview, card sections, relationship, advice, reflection question, disclaimer, and an either-or comparison when applicable.

`ResultPage.jsx` renders those fields directly. It no longer parses paragraph breaks. Either-or readings show A and B in a responsive comparison, followed by the querent’s own-position card. History and human-reading actions keep their existing records and coin flow.

## Localization

All new UI labels and reading templates live under the existing `drawing` and new `reading` locale sections for Chinese, English, and Italian. Reading content is rebuilt from the same selected cards when the language changes; question, options, selection, orientations, and revealed state are preserved.

## Testing and verification

Pure tests cover shuffled-deck uniqueness, three/five-card selection, cancellation, idempotent reveal, whitespace-normalized questions, all structured fields, triangle positions, upright/reversed output, and either-or option mapping/comparison. Existing tests, `npm test`, and `npm run build` must pass. Visual verification targets 360, 768, 1024, and 1440px with reduced motion and keyboard focus behavior.

## Protected work

Do not edit `src/unitySpread.js` or `src/pages/UnityResultPage.jsx`. The Unity branch in `App.jsx` remains a separate legacy path while this feature is in development.
