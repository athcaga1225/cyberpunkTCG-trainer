# Embracing Power desktop mirror practice — 2026-11-09

## Available flow

Select **Embracing Power** in the opening dialog's deck selector. This starts an Embracing Power versus Embracing Power mirror practice with the official 40-card main deck and three Legends on each side. Both first-player orders, shuffled six-card hands, one whole-hand Mulligan, actual source payment, Call, Go Solo, Gear, Program choices, reactions, normal victory, Overtime, draw failure, and restart use the existing V3 tabletop.

The Heist retains its random and fixed exercises. Embracing Power currently offers **random-opening mirror practice only**; its fixed-hand and scripted-defender options are disabled. Choosing different decks for the two sides, custom decks, stronger AI strategy, phone and tablet work are not part of this batch. Card art, palette, sidebar layout, and hover presentation remain unchanged.

## Manifest and source review

Main quantities and the three Legends match the [official starter deck list](https://cyberpunktcg.com/blog/wnc-starter-decks). Every individual official page below was read against current English ability text, cost and power; historic Beta print wording is not independently recertified. The existing catalog supplies the bilingual reference and tags; the two starter-exclusive Unit records are added locally. Minotaur's defeat is mandatory when its condition holds and an eligible target exists.

Sell Tags (20 main-deck cards, plus all three Legends), colors and RAM were cross-checked with the [starter table](https://cyberpunktcg.wiki/decks/embracing-power/) and linked Legend entries; that supplemental reference is a fan-maintained source. Main-deck Gear and Programs are sellable; none of these preset Units are sellable.

| Current official card page | Implemented behavior |
| --- | --- |
| [Chrome Fang](https://cyberpunktcg.com/cards/chrome-fang) | Protection survives its source leaving play and expires at its controller's next turn. Only eligible Gig values can be stolen. |
| [Minotaur](https://cyberpunktcg.com/cards/minotaur) | Higher numeric Cred causes an eligible rival Unit defeat; no eligible target resolves without a choice. |
| [Ruthless Lowlife](https://cyberpunktcg.com/cards/ruthless-lowlife) | Rival Unit targets only. |
| [Swordwise Huscle](https://cyberpunktcg.com/cards/swordwise-huscle) | Attack-triggered draw evaluates current equipped/modified power. |
| [Emergency Atlus](https://cyberpunktcg.com/cards/emergency-atlus) | Flavor text adds no effect. |
| [Field Operator](https://cyberpunktcg.com/cards/field-operator) | Entry draw checks even numerical Cred; Null does not qualify. |
| [Goro Takemura: Losing His Way](https://cyberpunktcg.com/cards/goro-takemura-losing-his-way) | Attack bonus checks face-up friendly Legends at resolution and lasts for the turn. |
| [MaxTac AV](https://cyberpunktcg.com/cards/maxtac-av) | Optional explicit swap preserves each die's identity, sides and value. |
| [Arasaka Emergency Radioport](https://cyberpunktcg.com/cards/arasaka-emergency-radioport) | Optional private viewing; only the viewed eligible Legend can be called free, within the existing turn limit. |
| [Mantis Blades](https://cyberpunktcg.com/cards/mantis-blades) | Attached power; flavor adds no effect. |
| [Satori: Sword of Saburo](https://cyberpunktcg.com/cards/satori-sword-of-saburo) | Fight-winner draw resolves before defeating the loser; draw loss stops the fight result. Identical copies' draw instructions are combined without changing draw/loss order. |
| [Industrial Assembly](https://cyberpunktcg.com/cards/industrial-assembly) | Either player's die may increase; draw checks a friendly value of at least eight afterward. |
| [Over the Edge](https://cyberpunktcg.com/cards/over-the-edge) | Uses the value of a controlled d20, not the Fixer die; can defeat a friendly or rival eligible Unit. |
| [Shattered Memories](https://cyberpunktcg.com/cards/shattered-memories) | Both hands are discarded, excluding the played Program; optional five-card draws proceed turn player first, then the conditional controller draw. Program continuation completes before payment-triggered effects. |
| [Corpo Security](https://cyberpunktcg.com/cards/corpo-security) | Cannot attack; remains eligible for Blocker when ready and not Lagging. |
| [Sandevistan](https://cyberpunktcg.com/cards/sandevistan) | Own-turn end trigger readies the surviving Unit or Legend host. |
| [Corporate Surveillance](https://cyberpunktcg.com/cards/corporate-surveillance) | Rival target qualification uses cost, not power. Spending a host triggers its owner's Gear. |
| [Goro Takemura: Hands Unclean](https://cyberpunktcg.com/cards/goro-takemura-hands-unclean) | Paid Go Solo, immediate attack permission, Blocker, Gear retention and removal on leaving the field. |
| [Yorinobu Arasaka: Embracing Destruction](https://cyberpunktcg.com/cards/yorinobu-arasaka-embracing-destruction) | Tracks the first friendly ARASAKA attack per turn; draw precedes the conditional discard. |
| [Saburo Arasaka: Stubborn Patriarch](https://cyberpunktcg.com/cards/saburo-arasaka-stubborn-patriarch) | ARASAKA-only bonus exists while attacking, including activation by a mid-attack free Call. It is removed when the attack/game ends. |

## Verification

- `node tests/v3-embracing.test.js`: manifest/reference checks plus every card identity's key behavior, invalid target immutability, exact costs, owner-controlled choice order, optional actions, timing and draw-loss boundaries.
- `V3_TEST_DECK=embracingPower node tests/v3-full-match.test.js`: 100 seeded games, alternating first players and keep/Mulligan. Every successful command checks unmodified input, 40 main-deck cards and three Legends per side, unique card/Gig identities and all 12 dice. Games must terminate and reject further actions afterward. Both normal and Overtime results occur; this is not a balance/strength measurement.
- The original The Heist 100-game suite and existing rule/effect/AI suites remain regression checks.
- `tests/v3-embracing.browser.cjs`: explicitly controlled ability fixtures exercised through visible controls for Minotaur, Industrial, MaxTac, Shattered, Radioport, and Corpo. A fixture is not represented as a natural opening.
- `V3_TEST_DECK=embracingPower ... node tests/v3-full-match.browser.cjs`: real opening/deck selection, player-first Mulligan and rival-first keep, normal match completion, inventory/dice checks and clean restart. No game commands are invoked directly by the browser driver.
- The Heist complete browser games, readability and Legend interactions also pass on the expanded engine.

The AI is a bounded policy using its own hand and public battlefield data; it is not an optimal or competitive agent. Test observers/fixtures exist only in test files. No debug-state API is shipped. This is implemented preset mirror practice with representative/boundary coverage, not exhaustive certification of every possible card ordering or the entire official ruleset.
