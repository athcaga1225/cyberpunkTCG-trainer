# V3 visual roles

Desktop design cleanup, 2026-11-09. The approved blue-black / teal / yellow palette remains the basis.

## Stylesheets and cascade

- `site.css`: site navigation, learning/rules pages and card catalogue layout.
- `table-layout.css`: tabletop geometry and game-state presentation.
- `table-theme.css`: tabletop palette and card orientation presentation.
- `design-system.css`: shared typography, action roles, focus, icon buttons, hover preview and confirmation dialog.
- `dice-animation.css`: transient dice presentation.

Cascade order is `layout → theme → components`. The unlayered `[hidden]` and `.hide` utilities control semantic visibility. This replaces priority flags with explicit, named responsibilities. V3 HTML contains no style block. All V3 CSS/HTML/JS is checked for priority flags, including runtime `setProperty` calls. Dynamic measured dimensions/coordinates and game state remain in JavaScript; static preview/flight styling is CSS.

The migration removed 415 CSS priority flags, one runtime priority assignment and 1,641 superseded exact-selector/context/property declarations. Native CSS serialization retains shorthand declarations. Shared/V2 files are unchanged.

## Type

| Role | Size | Use |
| --- | --- | --- |
| Caption | 12px | section labels, card state and metadata |
| Body | 14px | action log, explanations and supporting text |
| Control | 16px | text buttons, selects, inputs and primary instruction text |
| Heading | 20px | coach and section headings |
| Title | 28px | card/opening popup title and prominent counters |
| Display | 40px | page title |

Artwork text and dice drawings are separate from text controls. Icon buttons hide their text glyph and draw the shared icon instead.

## Colors and controls

Primary confirmation/next/game actions use yellow with dark text. Back/cancel/navigation utilities use the raised dark surface, pale text and a teal-gray outline. Hover and keyboard focus use teal. Disabled actions use a muted gray surface and disabled cursor. Informational guidance uses teal; its static instruction banner uses pale gray with dark text. Card identity colors remain tied to the card, not the close button.

Close controls use a centered 20px drawing, 2px stroke and 44px hit target. All close controls share the same neutral border, surface and hover state. Dropdown arrows are 20px with a 14px right inset and reserved 44px padding.

## Concede

Concede opens a native modal dialog centered in the viewport, outside sidebar layout. The background is inert. Initial focus is on Continue; Escape, X and Continue cancel and restore focus. Confirmation runs the existing concede command. A pending automatic-opponent timer is paused while the dialog is open and resumed after cancellation. Opening/canceling does not write game history or spend resources.

## Verification

`v3-design-system.test.js` enforces stylesheet loading, six typography roles and no priority flags. `v3-design-system.browser.cjs` checks actual computed 16px controls, close-icon geometry/colors, inset arrows, distinct back/next colors, modal centering, unchanged sidebar geometry, cancel/confirm/focus/restart, and the shared site/catalogue controls. Desktop checks cover 1440×900 and 1280×720.

Existing browser checks cover opening, sidebar, hover/click regions, Eddies orientation, outcomes and complete matches; existing native game suites remain unchanged apart from replacing historical CSS-source-string assertions with the computed browser checks. Mobile/tablet redesign remains deferred.

## Preparation controls

Reset, draw and roll share one 44px action slot in the turn-status panel. Only the current legal preparation action appears. The player chooses a die directly in the Fixer area and confirms the roll in turn status; no secondary select or persistent disabled Roll button is rendered. Both Fixer areas use the same full-width rail and 44px icon height. The main phase, opponent turn and finished game have no preparation button. Guidance names and highlights the current controls.

## Desktop finishing pass

Board labels do not select during card/dice operations; inputs, card ability text, dialogs and action history retain text selection. Mixed ready/spent Legends share square slots and a common vertical center. Gig dice use the same 44px drawings as Fixer dice; desktop rows reserve enough height for the full shape and caption. Deck label/number groups center vertically. ROOM uses a subtle separate surface.

Turn owner and round text share a left edge. The phase panel also hosts End Turn and Restart. The right status area sizes naturally and has no scrolling; history keeps its independent scroll. The step-by-step table tour remains a floating panel with back/next/close, and no minimize button or redundant instruction banner. Live hints use a compact docked sidebar treatment, with one current instruction and close control, without duplicate phase headings or tutorial navigation. Obsolete minimize styles are removed.

`v3-desktop-finish.browser.cjs` covers these cases at 1440×900 and 1280×720, including a mixed-orientation fixture, actual preparation, a live-guided sale, full-size dice visibility, phase-local End Turn and opponent handoff. Existing full-match and shared design checks remain in place.
