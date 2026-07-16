# Monthly Tarot Calendar — Homepage Design Specification

**Date:** 2026-07-16
**Scope:** Homepage presentation and calendar-detail interaction only

## Objective

Separate Daily Card history from Recent Readings and introduce a dedicated homepage section named:

- 本月日历
- MONTHLY TAROT CALENDAR

The section presents Daily Cards as a collectible monthly tarot archive. It must use the website's established black celestial background, aged paper, restrained gold, manuscript typography, thin engraved borders, soft lighting, and museum-archive visual language. It must not resemble a conventional productivity calendar.

## Scope Boundaries

The implementation may change homepage JSX, calendar presentation state, the existing calendar modal's visual/content presentation, translations required by this UI, and associated styles and tests.

It must not change:

- Daily Card draw or claim logic
- `dailyHistory` persistence or database schema
- reading-history creation, deletion, or retrieval logic
- routes or navigation behavior
- tarot card data or interpretations
- existing component APIs unrelated to the calendar presentation

## Homepage Information Architecture

The new section appears immediately before Recent Readings.

Recent Readings will no longer contain the last Daily Card sign-in display or the “查看本月日运” action. It will continue to show only spread readings, AI readings, and existing tarot-session history through the current `recentReadings` data and handlers.

The Monthly Tarot Calendar section contains, in order:

1. archive label and bilingual section title;
2. compact month switcher;
3. seven weekday labels;
4. a real monthly grid with leading blank positions and seven columns.

The section remains part of the existing homepage composition and does not introduce a separate route.

## Calendar Data and Month Switching

`App.jsx` remains the owner of `dailyHistory`. The homepage receives the existing history data plus calendar presentation inputs.

The visible month is UI-only state. Previous and next controls change only the displayed year/month and rebuild the calendar cells from existing date keys. They do not fetch, mutate, backfill, or migrate data. The next control is disabled when the visible month is the current month so the archive does not browse beyond the present.

All date-state decisions use local calendar dates consistently:

- **completed:** `dailyHistory[dateKey]` exists;
- **today:** cell date equals today's local date;
- **future:** cell date is after today;
- **missed:** cell date is before today and has no Daily Card;
- **current empty day:** today has no Daily Card and retains today's highlight while using the empty-paper treatment.

## Calendar Grid

Desktop and mobile both use seven equal columns. The entire grid must fit its container without horizontal overflow. Mobile reduces gaps, padding, typography, and thumbnail size while preserving seven columns and touch usability.

Each actual date is a small archive-paper cell. Its visible content is limited to:

- day number;
- miniature tarot artwork or the appropriate empty-state mark;
- a small Today badge only for the current date.

No card name, interpretation, status sentence, or other large text appears in a cell.

### Completed Day

- Shows the real tarot artwork through the project's existing artwork resolver.
- Artwork remains fully visible, centered, and approximately 28–40px tall depending on viewport.
- Reversed cards may display with a 180-degree image rotation, while retaining the same frame and dimensions.
- The whole cell is an accessible button and opens the archive popup.

### Future Day

- Shows an empty aged-paper miniature with a small moon mark.
- Uses a subtle border and no warning color.
- Is not interactive.

### Missed Day

- Shows an empty archive-paper miniature with a small hollow circle.
- Uses no warning color and is not interactive.

### Today

- Adds a restrained gold border, soft glow, and small `Today` badge.
- If completed, the tarot artwork remains the visual focus.
- If not completed, the empty-paper state remains visible.

Leading blank grid positions remain visually quiet and have no archive-card treatment.

## Daily Archive Popup

Clicking a completed day opens a floating aged-paper archive. It does not change the route.

The popup contains:

- selected date;
- large, fully visible tarot artwork;
- localized card name;
- upright or reversed label;
- existing short Daily Oracle interpretation;
- “查看完整牌义” action;
- “关闭” action.

The popup reuses existing card-meaning data and artwork utilities. “查看完整牌义” expands the existing full meaning inside the same popup and can be collapsed again. It never navigates to the Card Dictionary or detail route.

The popup closes through the explicit close action, close control, backdrop click, and Escape key where supported by the existing modal pattern. Opening another completed day replaces the selected presentation data without changing stored history.

If a historic card cannot be resolved to detailed meaning data, the popup still shows its stored date, name, orientation, and available short text; the full-meaning action is omitted or disabled gracefully.

## Visual Treatment

The section reuses existing design tokens and material layers rather than inventing a new style:

- black celestial ground with restrained constellation linework;
- aged archive-paper calendar cells;
- thin gold rules and engraved labels;
- manuscript serif display typography paired with existing readable body type;
- quiet archive numbering and compact celestial coordinates in the section header;
- warm ambient paper lighting and restrained shadows;
- tiny paper irregularities consistent with the existing archive collection.

No new dominant decoration, bright color, large rounded container, glass effect, or generic calendar chrome is introduced.

## Motion

Motion uses the project's existing timing and easing tokens.

- Completed cells lift by only a few pixels on hover/focus.
- The miniature artwork receives at most a very small light/contrast response.
- The popup enters with a restrained opacity, vertical movement, and paper-unfold impression; no large scaling or bounce.
- `prefers-reduced-motion: reduce` removes lifts and transforms and keeps state changes immediate or near-immediate.

## Accessibility

- Completed days are semantic buttons with an accessible label containing the date, card name, and orientation.
- Future and missed days are non-interactive.
- Month controls have localized accessible labels and clear disabled states.
- Keyboard focus uses the established gold focus ring.
- Popup content has dialog semantics, an accessible name, and keyboard-close behavior consistent with existing modals.
- Text and controls retain sufficient contrast over paper and dark backgrounds.

## Components and Data Flow

The preferred implementation is intentionally small:

1. `App.jsx` passes `dailyHistory`, locale/date formatting inputs, and existing card display/meaning helpers to `HomePage`.
2. A focused `MonthlyTarotCalendar` homepage component owns only the displayed-month and selected-day presentation state.
3. `MonthlyTarotCalendar` derives all cells from the displayed month and existing `dailyHistory` and renders the selected-day archive popup.
4. The existing `CalendarModal` is repurposed or compatibly extended into the selected-day archive popup, avoiding duplicate modal systems.
5. Recent Readings continues to consume only `recentReadings`; its business handlers remain unchanged.

No data is copied into a new persistence layer.

## Verification

Implementation is complete only after confirming:

- current month renders with correct leading blanks and day count;
- previous-month navigation works and next-month navigation stops at the current month;
- completed, future, missed, and today states render correctly;
- completed cells use real artwork and reversed artwork orientation is represented;
- incomplete days do not open the popup;
- completed days open the correct date and card;
- full meaning expands inside the popup without route changes;
- Recent Readings has no Daily Card entry or calendar action;
- desktop and mobile both retain seven columns without horizontal overflow;
- reduced-motion behavior is respected;
- `npm run build` passes;
- `npm test` passes.
