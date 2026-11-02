# NIGHT CITY TRAINING

Unofficial Traditional Chinese training website for **Cyberpunk Trading Card Game**.

Live site (when GitHub Pages finishes deploying): https://athcaga1225.github.io/cyberpunkTCG-trainer/

## What's implemented

- Responsive CYBERDEX-inspired Type B Red design.
- All Fixer translations use the Cyberpunk 2077 Taiwan localization **合事佬**; former #practice URLs redirect to the combined #learn module.
- Seven integrated Traditional Chinese learn-and-practice lessons grounded in the official gameplay guide; theory and one playable exercise share a single page.
- **Seven playable, integrated teaching exercises**: Gig roll-in, d20-last constraint, target validation, Power-based fights, stealing Gigs, Mantis Blades Power modifier, Blocker reaction, start-of-turn 7-Gig win, and Field Operator draw.
- Verified-rule **partial engine** in `rules-core.js`, with **16 deterministic tests**.
- Official starter deck manifests for **The Heist and Embracing Power**, each 3 Legends and 40 main-deck cards, plus comparison against locally imported JSON.
- Eight official card summaries and direct official source URLs; cards are explicitly marked partly implemented/unimplemented.
- Local JSON importer for card metadata.

## Not implemented yet

Complete card effects, complete official rules engine, play/cost/payment processing, full Legend/Gear/Program interactions, Quick reaction windows, actual starter-deck AI games, complete AI strategies.

## Run

Open `index.html` in a browser, or deploy the `main` branch root via GitHub Pages. No backend/API key.

## Test

```bash
node tests/rules-core.test.js
```

## Primary official references

- https://cyberpunktcg.com/gameplay-guide
- https://cyberpunktcg.com/comprehensive-rules
- https://cyberpunktcg.com/blog/wnc-starter-decks
- https://cyberpunktcg.com/errata

Card descriptions in the trainer are abbreviated Traditional Chinese explanations, not an official translation. Official English text is authoritative.

## Guided battlefield layout prototype

The battle tab now opens with a responsive **visual tabletop tutorial** featuring 8 highlighted zones (Fixer, Field, Eddies, Gig, Legends, Hand, Opponent field, phase) and next/previous navigation. This is strictly an educational layout: no official turns or card effects execute there. The retired 12-HP experimental battle has been removed. No multiplayer, accounts or image assets are required.

## Battle viewport update

The 85vh tabletop remains, with a compact 380px tour tip in its top-right corner. Instructions expand on request or when a field zone is selected. The old 12-life custom-rules demo and its `battle.js` source were removed; this is still a card-art/tabletop preview, not a complete official AI match.

## Beta Card Guide — phase 1 (2026-11-02)

- The card guide includes the original two starter decks and a new searchable 178-entry Beta catalog: 172 Beta main cards (including B005A/B005B) and 6 Beta Box Toppers (T001–T006 are local index IDs).
- Catalog metadata and card art were imported from the CYBERDEX repository source files `card-catalog.json` and `card-images.json`; their source blob identifiers are stored in `beta-cards.json`.
- Browse by card number or English/available Traditional Chinese name; filter by print series and rarity; 24 lazy-loaded cards per page.
- Only verified source fields (number, name, rarity, card image and image provenance) are populated. Card color, type, cost, power, RAM, and ability text remain null pending source verification. Images are remote and can fail independently.
- This is a learning catalog, not a price database and not proof of playable card effects.

## Beta Traditional Chinese translations — batch 1 (2026-11-02)

- 40 catalog entries, B001–B039 including B005A/B, now include manually authored `nameZh`, `abilityZh`, `translationStatus`, and a source link to the official current English rules text.
- Card effect translations are unofficial learning references. The English official card database and current rules take precedence.
- The Beta gallery includes a separate, mobile-friendly card detail panel with Traditional Chinese card abilities. Untranslated cards remain explicitly pending. No battle engine behavior is inferred from translated text.

## Beta colors and translation corrections — 2026-11-02

- Confirmed B040–B070 as Yellow, B071–B079 as Green, based on cross-referenced card database entries; the popup derives its theme from `color` and now uses their proper yellow/green accents.
- Updated B040 Rogue -> 若惡, B042 Alt -> 艾特, B067 Cyberpsychosis -> 神機錯亂. RIPPERDOC remains 神機醫.


## Beta COST / RAM / POW spot-check — 2026-11-02

- Batch B001–B039 (40 print entries counting B005A and B005B): verified all IDs and COST / RAM / POW field presence in `beta-cards.json` and compared recorded visible values against the official card database's currently published English cards. No value differences were identified in this batch.
- Null COST / POW on applicable Legends and null POW on Programs are intentional printed dashes / absent values, not numeric zero.
- This is a current-official-card-database value audit; it does not independently establish every historical Beta printing's physical stats or validate card effects, image, rarity, and translations.
- Popup V2: B116 / B171 number, set, and rarity now occupy stable grid columns; visual browser acceptance is still pending.


## Beta COST / RAM / POW audit — B040–B079 (2026-11-02)

- Checked 40 consecutive Beta index entries (B040–B079) against each matching official cyberpunktcg.com card detail page for current **COST, RAM, PWR** and printed card type. All 40 entries matched the currently published official values; no data value changes required.
- B040–B070 are Yellow; B071–B079 are Green. The full batch has 1 Yellow Legend, 18 Yellow Units, 6 Yellow Gears, 6 Yellow Programs, 5 Green Legends and 4 Green Units.
- Deliberate nulls: B065–B070 (Programs) have no printed PWR; B071, B072, B074, B075 (Legends) have no printed COST or PWR. These remain `null` to display an em dash rather than zero.
- Valid printed zero PWR is preserved on B053, B054, B062 and B079.
- Scope: cross-check to the official **current** English card database with matching Beta printings listed. This does **not** independently validate historical Beta physical-card differences, translation accuracy, tags, rarity, images or effects.
- Progress for current-value checks: 80/178 (prior B001–B039 40 printings, plus this B040–B079 40 printings).


## Beta COST / RAM / POW audit — B080–B119 (2026-11-02)

- Reviewed the 40 sequential Beta card entries B080–B119 in `beta-cards.json` and checked each corresponding currently published official card detail (including Beta printing listed on the card page): COST, RAM, PWR, card type and presence/absence of printed values. No numerical discrepancies identified; no edits to the card JSON required.
- B080–B105 have Green card color; B106–B119 have Blue card color. Counts: 22 Units, 4 Gear, 9 Programs, 5 Legends.
- Nine Program entries B097–B105 have no PWR; four Legends B106–B108 and B110 have no COST or PWR. These fields must stay `null`, rather than be displayed as 0.
- Valid zero PWR values confirmed for B090, B109, B111, B113 and B119. B109 (Sasha Yakovleva) is a Legend with COST 5, RAM 2 and PWR 0; it must not be grouped with the costless Legends.
- Scope: verified against the official *current English card database*. The site's default view may be Retail but includes links for the matching Beta printing. Historical printed Beta-specific deviations, card art, rarity, tags and translated effects remain separate audit tasks.
- Current-stat audit cumulative coverage: 120/178 entries (B001–B119, with B005A and B005B both counted).
