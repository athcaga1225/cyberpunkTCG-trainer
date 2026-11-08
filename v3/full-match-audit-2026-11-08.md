# V3 desktop complete-match verification — 2026-11-08

Scope: The Heist random-opening mirror practice on desktop. Gameplay baseline: `268f76c`. This batch adds verification and CI coverage; it does not change gameplay, card effects, colors, or shared/V2 code. Phone and tablet work remains deferred.

## Complete games through the rules engine

`node tests/v3-full-match.test.js` runs 100 reproducible games with shuffled 40-card manifests and Legend positions, both first players, keep and whole-hand Mulligan, and seeded legal dice rolls. The player policy sells available Sell Tag cards, pays exact sources to deploy Units, chooses legal attacks, resolves its pending effects, and ends defensive reactions. The existing active mirror opponent performs its own decisions.

After every successful command the test checks:

- The input state was not mutated.
- Each side still accounts for its 40 main-deck cards and 3 Legends across all zones and attached Gear. Sold cards count through their Eddie source IDs.
- No main-deck card is duplicated across zones.
- Both copies of each of the six dice remain accounted for across Fixer and Gig areas, and values stay within die bounds.
- Effect and defense pauses can resume without an unbounded loop.
- Finished matches clear pending combat/effects and reject further turn actions.

Observed results: 9 player normal wins, 77 rival normal wins, and 14 rival Overtime wins. These counts describe deterministic test policies, not balance or AI-strength measurements. AI Call, Go Solo, Gear, player sale/deployment/attack/defense, and human-owned effect resolution are required coverage assertions.

## Real desktop controls

`tests/v3-full-match.browser.cjs` uses read-only test observers for successful engine results. It does not inject resources, modify game state, or invoke game commands directly. All actions use visible buttons, card keyboard activation, and actual payment-source controls.

- Seed 19: player first, whole-hand Mulligan, real sale/payment/deployment/attacks, rival wins normally in round 7.
- Seed 42: rival first, keep opening, defensive continuation, rival wins normally in round 4.
- Both games verify inventory/dice conservation throughout and restart into an empty, unresolved opening with no previous result, resources, Units, Gigs, or action-history entries.
- Chromium desktop viewport: 1280 × 720.

`tests/v3-outcomes.browser.cjs` separately uses explicitly controlled late-game fixtures for Overtime and an empty deck. It verifies no-dice turn continuation, actual end-turn Overtime activation, immediate player victory on seven Gigs, mandatory-draw defeat, blocked post-result actions, restart, and concede confirmation/cancellation. Its selectors now follow the actual relocated tabletop controls and count display; the roll button is expected to remain visible and disabled outside a legal roll step.

## Limits and continuation

This is complete-match flow coverage for the current The Heist subset, not exhaustive certification of every card interaction or official rule. The two natural browser games produce rival wins; player victory is covered by seeded engine games and the controlled browser Overtime scenario. Empty-deck defeat is covered by the controlled browser scenario and existing outcome unit tests, not by artificially shortening the natural matches.

Next work: independently review the current The Heist card abilities and their UI choices, then expand other decks. Custom decks, broader AI strategy, phone, and tablet are outside this batch.
