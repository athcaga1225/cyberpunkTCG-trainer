# V3 visual roles

Desktop design cleanup, 2026-11-09. The approved blue-black / teal / yellow palette applies to the battle view. Website appearance is separate and restored from the pre-cleanup 8972eb6 revision.

## Stylesheets and cascade

- `style-order.css`: declares the layer order before every other stylesheet.
- `site.css`: the original site navigation, learning/rules pages and card catalogue styles, including their original typography and accents.
- `table-layout.css`: tabletop geometry and game-state presentation.
- `table-theme.css`: tabletop palette and card orientation presentation.
- `design-system.css`: shared typography, action roles, focus, icon buttons, hover preview and confirmation dialog.
- `dice-animation.css`: transient dice presentation.

Cascade order is `site → site-overrides → layout → theme → components`. Original website declarations retain their hierarchy without priority flags. Battle components and battle visibility utilities are scoped to `body.battle-wide`; battle tokens activate only while that mode is active. Root-level deal clones use the same conditional root tokens. This replaces priority flags with explicit, named responsibilities. V3 HTML contains no style block. All V3 CSS/HTML/JS is checked for priority flags, including runtime `setProperty` calls. Dynamic measured dimensions/coordinates and game state remain in JavaScript; static preview/flight styling is CSS.

V3 retains zero CSS priority flags and no runtime priority assignment. The website restoration preserves authored shorthand declarations and custom properties; website/catalogue rules do not live in the battle-layout sheet. Shared/V2 files are unchanged.

## Battle type

This six-role scale applies only to the table. Website pages retain their original authored scale and responsive values.

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

Close controls use a centered 20px drawing, 2px stroke and 44px hit target. Battle close controls share the same neutral border, surface and hover state. Website popup controls retain their original design. Dropdown arrows are 20px with a 14px right inset and reserved 44px padding.

## Concede

Concede opens a native modal dialog centered in the viewport, outside sidebar layout. The background is inert. Initial focus is on Continue; Escape, X and Continue cancel and restore focus. Confirmation runs the existing concede command. A pending automatic-opponent timer is paused while the dialog is open and resumed after cancellation. Opening/canceling does not write game history or spend resources.

## Verification

`v3-design-system.test.js` enforces stylesheet loading, six typography roles and no priority flags. `v3-design-system.browser.cjs` checks actual computed 16px controls, close-icon geometry/colors, inset arrows, distinct back/next colors, modal centering, unchanged sidebar geometry, cancel/confirm/focus/restart, and the shared site/catalogue controls. Desktop checks cover 1440×900 and 1280×720.

Existing browser checks cover opening, sidebar, hover/click regions, Eddies orientation, outcomes and complete matches; existing native game suites remain unchanged apart from replacing historical CSS-source-string assertions with the computed browser checks. Mobile/tablet redesign remains deferred.

## Preparation controls

Reset, draw and roll share one 44px action slot in the turn-status panel. Only the current legal preparation action appears. The player chooses a die directly in the Fixer area and confirms the roll in turn status; no secondary select or persistent disabled Roll button is rendered. Both Fixer areas use the same full-width rail and 44px icon height. The main phase, opponent turn and finished game have no preparation button. Guidance names and highlights the current controls.

## Desktop finishing pass

Board labels do not select during card/dice operations; inputs, card ability text, dialogs and action history retain text selection. Mixed ready/spent Legends share square slots and a common vertical center. Gig dice use the same 44px drawings as Fixer dice; desktop rows reserve enough height for the full shape and caption. Deck label/number groups center vertically. ROOM uses a subtle separate surface.

Turn owner and round text share a left edge. The phase panel also hosts End Turn and Restart. The right status area reserves a fixed 196px height and shows a short state summary; full command detail lives in history. History keeps its independent scroll and follows the latest event after every update. The step-by-step table tour remains a floating panel with back/next/close, and no minimize button or redundant instruction banner. The separate automatic live-hint frame is removed. The table tour remains available through the guide entry; finishing/skipping it returns directly to normal play. Obsolete minimize styles are removed.

`v3-desktop-finish.browser.cjs` covers these cases at 1440×900 and 1280×720, including a mixed-orientation fixture, actual preparation, a sale after closing the tour, full-size dice visibility, phase-local End Turn and opponent handoff. Existing full-match and shared design checks remain in place.

## Website isolation regression

`v3-style-isolation.browser.cjs` compares the visible home, learning, rules and catalogue controls, plus the catalogue modal, against the original website CSS when `V3_SITE_BASELINE_HTML` points to an HTML snapshot from commit `8972eb6`. It compares typography, colors, backgrounds, borders, padding, margins, minimum heights and shadows at 1440×900 and 1024×768. It also enters and exits an actual game and verifies that learning-page styles are identical afterward, while battle controls retain 16px yellow actions. Without the optional snapshot it still enforces the navigation/isolation regression. The baseline can be produced with `git show 8972eb6:v3/index.html`.

## Stable table anchors and opening deal

Turn owner/round text keep the same fixed rows and reserve the action column in all states; no left accent line is used. Gig counts have fixed-width right columns so Null/numeric Street Cred and additional dice do not reposition the counters. Spent Unit art is offset by half the portrait/landscape height difference; card status and gear remain attached to the visible card. Both Eddie pools calculate one shared size independent of their card counts, and empty explanatory copy is removed.

Opening hands animate six cards for each side from that side's deck. Rival cards use only the normal back, rotated to match the destination hand. The automatic opponent waits until all deal layers complete. Leaving the table cancels both layers; reduced-motion users see both complete hands without animation. Normal draw animations remain limited to newly added player cards.

`v3-stable-table.browser.cjs` checks anchors and fixed status across preparation/main/opponent transitions, mixed-orientation Unit art, unequal Eddie counts, and history following new events. `v3-both-hands.browser.cjs` checks both six-card flights, private back art, deck-center geometry, random Mulligan, cancellation and reduced motion.
