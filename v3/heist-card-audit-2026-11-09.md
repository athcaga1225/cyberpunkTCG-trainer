# The Heist card ability and desktop choice audit — 2026-11-09

Scope: 17 main-deck card identities plus the three starter Legends, compared with the official **current English rules text** on their individual card pages and the official starter list. This is not a certification that every historic Beta printing matches current wording. Existing artwork and the blue-black/teal/yellow interface remain unchanged. No phone or tablet work.

## Changes

- Main-phase Floor It now has an explicit rival Unit selector. Previously the tabletop silently chose the first rival, although the engine already accepted any rival Unit. Its defensive Quick selector also retains a non-attacker target through payment.
- Heywood Ripperdoc's tabletop selector now includes Gear attached to either player's face-up Legends, alongside Gear on Units. The engine already supported these targets. Ownership appears in the option label; defeated Gear still goes to its controller's trash.
- Floor It/Quick, Offduty, Heywood, Dexter, and Afterparty target choices persist while clicking payment resources. Selection does not execute the effect or spend a resource.
- Mirror-mode attack targets now use the combat engine's legality directly. A ready, non-Lagging zero-power Unit may attack a nonempty rival Gig area; it steals zero Gigs. The previous guide filtered out some legal zero-power attacks. A short action hint explains the distinction. Rules 9.3.2.2 and 9.23.2.1 govern these separate decisions.
- Jackie’s Traditional Chinese reference now says that the adjusted die must become value 1, avoiding ambiguity with the lowest-valued die among multiple Gigs. Rules 6.3.1–6.3.3 define the minimum face.
- Afterparty's local practice metadata is Yellow, matching the existing catalog/card artwork; its effect behavior is unchanged. Cost and power reference checks now cover every main-deck identity.

## Per-card review

All linked pages below were read for this audit. Descriptions summarize reviewed behavior; regression tests exercise representative and boundary cases rather than every possible combination.

| Card / official current-text source | Reviewed behavior | Validation |
| --- | --- | --- |
| [Dexter DeShawn: One Last Chance](https://cyberpunktcg.com/cards/dexter-deshawn-one-last-chance) | Entry/attack die adjustment; defeat draw requires numeric Cred difference of at least 10 | heist-practice, heist-effects; target browser |
| [Heywood Ripperdoc](https://cyberpunktcg.com/cards/heywood-ripperdoc) | Optional Gear defeat, including Legend attachments; matching own Gig causes a draw | heist-practice; both owners' Legend Gear in target browser |
| [Offduty Malfini](https://cyberpunktcg.com/cards/offduty-malfini) | Entry spends itself and an available rival; rival spend triggers belong to that rival | heist-practice, spend-effects; target browser |
| [Secondhand Bombus](https://cyberpunktcg.com/cards/secondhand-bombus) | Blocker redirects; zero-power attack steals nothing | mirror-combat; target browser |
| [T-Bug: Amateur Philosopher](https://cyberpunktcg.com/cards/t-bug-amateur-philosopher) | Defeat privately shows face-down Legends, then permits an optional free Call within the turn limit | heist-effects, legends browser |
| [Kiroshi Optics](https://cyberpunktcg.com/cards/kiroshi-optics) | Attached power; attack privately views a face-down friendly Legend | heist-effects, legends browser |
| [Mandibular Upgrade](https://cyberpunktcg.com/cards/mandibular-upgrade) | Attachment grants Blocker | heist-practice, mirror-combat |
| [Zetatech Faceplate](https://cyberpunktcg.com/cards/zetatech-faceplate) | Spending its host queues die adjustment; drawing checks three distinct friendly values afterward | spend-effects |
| [Afterparty at Lizzie's](https://cyberpunktcg.com/cards/afterparty-at-lizzie-s) | Either side's die may be adjusted; two distinct friendly values permit a draw | heist-practice; target browser |
| [Delamain Cab](https://cyberpunktcg.com/cards/delamain-cab) | End-of-own-turn Eddie readying depends on that Unit actually stealing earlier that turn | heist-effects |
| [Evelyn Parker: Scheming Siren](https://cyberpunktcg.com/cards/evelyn-parker-scheming-siren) | Attack draws, then compares Cred for discard; zero power does not suppress attack triggers | heist-effects, legends browser |
| [MT0D12 Flathead](https://cyberpunktcg.com/cards/mt0d12-flathead) | Blocker restriction checks whether its controller's Cred is lower | mirror-combat |
| [Psycho Squad](https://cyberpunktcg.com/cards/psycho-squad) | Printed flavor is not an effect; six base power | reference checks, full-match |
| [Dying Night: V's Pistol](https://cyberpunktcg.com/cards/dying-night-v-s-pistol) | Attack can reduce a die; end-turn Eddie readying requires host name V | heist-effects |
| [Tetratronic Rippler](https://cyberpunktcg.com/cards/tetratronic-rippler) | Spending host privately searches top card; optional trash is not drawing | spend-effects |
| [Floor It](https://cyberpunktcg.com/cards/floor-it) | Main or defensive Quick; chosen rival gets a turn-limited reduction, then controller draws | heist-practice, mirror-combat; main and Quick target browser |
| [Reboot Optics](https://cyberpunktcg.com/cards/reboot-optics) | Protects the friendly opponent of the next rival Unit fight that turn; does not prevent Gig theft | mirror-combat, heist-effects; combat browser |
| [Viktor Vektor: Sit Down and Relax](https://cyberpunktcg.com/cards/viktor-vektor-sit-down-and-relax) | Call searches five; at most two eligible Gear enter hand; rest go to randomized deck bottom | heist-effects, legends browser |
| [Jackie Welles: Pour One Out For Me](https://cyberpunktcg.com/cards/jackie-welles-pour-one-out-for-me) | First blue Unit/Gear per turn, own-die reduction; becoming value 1 permits draw | heist-effects, spend-effects, reference checks |
| [V: Corporate Exile](https://cyberpunktcg.com/cards/v-corporate-exile) | Paid Go Solo carries attached Gear, can attack immediately, leaves play for removed zone | heist-effects, ai-strategy, legends browser |

Additional primary sources: [official starter manifest](https://cyberpunktcg.com/blog/wnc-starter-decks), [Comprehensive Rules](https://cyberpunktcg.com/comprehensive-rules) (especially 2.4, 6.3, 9.3, 9.23, and 11.26).

## Test method and limits

`tests/v3-card-targets.browser.cjs` uses an explicitly controlled fixture with two different rival Units, Gear on both face-up Legends, known Gigs, and eight Eddie resources. The fixture is for isolating choice handling, not for proving normal opening inventory. Every action and payment uses the actual visible tabletop controls and existing command handlers. Test-only observers read successful command results; no debug API is shipped in V3.

The browser checks choices made **before** payment, exact consumed resources, the unaffected first rival, draw counts, correct trash ownership, optional reaction continuation, and a real zero-power attack stealing no dice. Existing native tests cover trigger ordering, owner-controlled resolution, empty searches/decks, optional choices, per-turn limits, and Go Solo zone changes. The 100 seeded complete-match test remains a separate inventory/flow check.

This audit verifies current text alignment and fixes identified tabletop omissions. It is not exhaustive proof of every ordering/permutation, nor support for cards outside The Heist, custom decks, or complete competitive AI decision-making.
