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


## Beta COST / RAM / POW audit — B120–B159 (2026-11-02)

- Audited all 40 Beta catalog entries B120–B159 for present COST/RAM/PWR fields, type and color, using the official current card entries for 39 card identities and independent card listings for B127 Westbrook Netrunner (4 cost / 2 RAM / 5 power). No inconsistencies identified with the stored values; `beta-cards.json` was not changed.
- B120–B140: 21 Blue cards (8 Units, 3 Gear, 10 Programs). B131–B140 are Programs with no PWR (null).
- B141–B159: 19 special printings. Each has a `printingReferenceId` resolving to its base Beta card, and all 19 match their base printing in type, color, COST, RAM, PWR, normalized English name and Chinese ability. B142↔B002 and B157↔B108 are among those checked.
- Thirteen special printings have COST/PWR null as printed for Legends; six have numeric COST and PWR. Do not convert null to 0.
- These checks concern the current official card data / documented relationships, not a full independent examination of every Beta physical card, translated effect, card image or rarity.
- Cumulative current-value audit coverage: 160 of 178 Beta index entries; remaining B160–B171 and T001–T006 (18).


## Beta COST / RAM / POW audit — B160–B171 and T001–T006 (2026-11-02)

- Final 18 entries examined: B160–B171 (12 special Beta printings) plus T001–T006 (6 Beta Box Toppers). All contain defined `cost`, `ram`, `power`, `type`, `color` fields; absent numeric values are explicitly `null`. Current published official card values and existing catalog data are consistent for the verified matches. No numeric changes needed.
- B160–B171 each correspond by normalized English name to exactly one earlier base card: B041, B042, B046, B063, B088, B093, B126, B138, B003, B109, B085, B116 respectively. All 12 pairs match in type/color/COST/RAM/PWR. The Chinese ability differs in wording between B116 and B171 and remains a separate translation-review item; do not treat matching numerical fields as effect validation.
- Special numeric cases: B168 Johnny Silverhand COST/PWR absent (null); B169 Sasha COST 5, PWR 0, RAM 2; B167 Towerfall is a Program with null PWR. Other B160–B171 values are numeric.
- T001 Yorinobu, T002 Viktor, T004 Saburo, T005 Jackie: Legend with no printed COST/PWR (null), RAM 2. T003 Goro: COST 5/PWR 7/RAM 2. T006 V: Corporate Exile: COST 5/PWR 8/RAM 2. Official card pages list their **Beta Box Toppers** printings. T00x numbers are local catalog identifiers.
- The official errata notes a misprinted artist credit on T001 Yorinobu's Beta Box Topper; this is not a numeric-card-stat discrepancy and belongs to the later image / attribution audit.
- Completion: **178/178 catalog entries reviewed for current COST / RAM / PWR values or their absence**. This is not certification of all historical physical Beta prints, images, rarity, tags, translation or effects. Special-printing values may derive from matching official card identity rather than separately legible physical print photographs.


## Beta TAGS / EFFECTS audit — B001–B039 (40 entries, 2026-11-02)

- Audited B001–B039 including **B005A and B005B** (40 catalog entries; no B005 entry) against each card's official currently published English card page (where direct open failed, official indexed page results for B006 and B018 were consulted).
- Compared each record's `tags` against the published official trait line, and reviewed the meaning of `abilityZh` against **OFFICIAL CURRENT RULES TEXT · ENGLISH** including timing, triggers, target types, costs, limits, and non-rules flavor text. No supported TAGS or Chinese-effect text correction identified in this batch; no changes to `beta-cards.json`.
- Edge cases examined: B005A and B005B share V: Streetkid's tags and effect; B007 Animals Wrecker and B025 Mantis Blades use printed flavor text, not separate active card effects; B030 has cost reduction with a minimum cost of 1; B032 Gunpoint Diplomacy grants both effects unless the lower-Street-Cred condition lets the rival select one; B034 may defeat a Unit, not necessarily only a rival Unit; B037 reroll applies when a Gig is rolled in from the fixer area.
- This batch uses official **current** card rules; Beta printed-wording-specific errata and independent visual verification of each printed Beta card are **not** certified. In particular the `ruleVerified` flags remain unchanged and should not be inferred from this translation review.
- Cumulative TAGS / EFFECTS audit coverage: **40/178**. Remaining B040–B171 and T001–T006: **138**.


## Beta TAGS / EFFECTS bulk consistency pass — B040–B171, T001–T006 (2026-11-02)

- **Scope:** all remaining **138 records** B040–B171 (132) and T001–T006 (6) scanned for nonempty Chinese effect descriptions, TAGS arrays, English source text availability, duplicate-printing identity, and internal consistency. This is a **full-dataset integrity pass**, not a claim of independent line-by-line re-reading of all 138 official pages.
- **English-source completeness for this batch: 138/138**. Starting from 48 records in this 138-card batch with a missing `abilityEnglish` value, restored all 48, plus B003 from the earlier batch (49 restorations total): six base records (B040, B071–B075) copied verbatim from identical existing verified base/variant counterparts; 12 records from six official pages (including B003, outside this batch, and B168); eight each from B043–B051, B052–B059, B060–B068 and seven from B069–B080. Note B003 is part of the earlier batch. All additions retain their original `abilityZh`, TAGS and other gameplay fields.
- **One confirmed inconsistency fixed:** B171 Judy Álvarez: Nothing to Doubt's translated effect aligned verbatim with B116, matching the same official English effect; TAGS unchanged.
- **Variant consistency:** tested all 33 catalog same-card printing pairs/groups by normalized English title plus identical type/color/COST/RAM/PWR: TAGS, English ability (when available on both), and Chinese ability now agree. This includes B116/B171, B085/B170 and B003/B168.
- **Official source examples independently inspected in this pass:** B041, B042, B043–B045, B046–B070 (except B071–B075 which use existing paired source text), B076–B080, B085, B090, B093, B106, B118, B123, B126, B134, B135, B138, B168, B170 and B171. Some pages serve multiple printed variants. B127's official page could not be loaded via the browser tool and remains sourced through the existing third-party card reference.
- **Outstanding verification:** The remaining records' already-populated English rules and all TAGS still require exhaustive independent official page-by-page confirmation before labeling the semantic translation/trait audit 178/178; historical physical Beta printing differences likewise remain unverified. Previously B001–B039 were documented separately (40 entries), but 39 of those still lack a populated `abilityEnglish` field despite having Chinese abilities.
- No changes to CARD COST/RAM/PWR, image URLs, rarity, set or UI layouts in this work.


## Beta image, card-number and rarity audit — 2026-11-02

- Scope: all 178 records in `beta-cards.json`: 172 Welcome to Night City Beta printings (B001–B171 with B005A and B005B in place of a plain B005), and six separate Beta Box Toppers recorded locally as T001–T006.
- **Card-number integrity (178/178):** complete expected identifier set; no missing, unexpected or duplicate IDs. All 172 Beta `imageUrl` filenames embed the matching card ID, and all 172 Spellbound Games `imageSource` product URLs embed the matching ID. The six Topper images use `box-toppers-beta` paths with printed B001–B006 numbers; their T00x IDs are LOCAL ONLY, not printed physical card numbers.
- **Rarity/source consistency (172/172 Beta):** each Beta Spellbound product-source slug ends with a rarity matching its JSON rarity; no mismatch or unrecognized suffix. Rarity counts for Beta alone: 60 Common, 32 Uncommon, 33 Rare, 12 Epic, 4 Secret, 18 Iconic Legend, 9 Iconic Other, 4 Iconic Secret (172 total). Six T001–T006 Box Toppers are Nova Rare.
- **Image/reference completeness:** all 178 entries have a nonempty `imageUrl` and `imageSource`; image URLs are distinct across the 178 records (no duplicate URL). B005A and B005B have different numbered source pages/images; B116/B171 and B108/B157 have separate numbered source images. Separate source websites independently list the 172 Beta printings, the 6 Nova Rare Box Toppers and their distinct card names/rarities.
- **Selected direct public source checks:** Spellbound product pages for B005a, B005b and B171 independently confirmed the printed-number mapping; general Beta set is listed as 172 cards by TCG.DIRECTORY / ValueMyCard / mTCG and Box Toppers as 6 Nova Rare by HoloHoard / TCG.DIRECTORY. No confirmed incorrect card number, image link mapping or rarity found; **no changes were made to image URLs, card IDs or rarities**.
- **Remaining verification scope:** a filename/source-slug match does NOT establish the artwork content is visually correct or that every remote image currently returns a successful response. Full 178-image visual comparison, link/HTTP availability checks, and official physical-print rarity confirmation per card remain pending. Do not label those parts visually certified.


## Beta TAGS / EFFECTS official-source pass — 2026-11-02 (follow-up)

- Audited current catalog records and earlier QA notes before writing. All 178 entries already had Traditional Chinese `abilityZh` and `tags`, but 39 entries (B001–B002, B004–B039, including B005A/B) had null `abilityEnglish`.
- Restored **39/39 missing `abilityEnglish` values** using the **official current English rules** listed on the Cyberpunk TCG card database. B006 (6th Street Recruits), B007 (Animals Wrecker, flavor text), and B018 (Screw) were recovered from indexed official card-page snippets where direct opening failed; the remaining 36 records were read directly from accessible official pages. The official current English text is NOT necessarily an independently photographed transcription of every physical Beta printing.
- Updated `translationStatus` to `checked-against-official-current-text-2026-11-02` for those 39 records, retaining the pre-existing Chinese wording and TAGS because no definite meaning/trait mismatch was found during this batch. **This status attests to those 39 current-official comparisons only, not to the other 139 entries or historic Beta printings.**
- Re-ran whole-file presence and same-name printing checks after update: **178/178** have nonempty English rules, Chinese descriptions, and TAGS arrays; **31 same-name groups containing 63 printing records** have identical English text, Chinese text and TAGS, with **0 internal mismatches**. This is an internal consistency check, not universal official line-by-line verification.
- No changes to cost, power, RAM, art, rarity, card numbers, edition links or localized card effects. Updated V2 JSON/JS cache revisions to 26/16.
- **Still open**: independent official-page comparison of remaining 139 records' current English text and all trait lists, 178 actual Beta physical-print text differences, and per-card review of translation semantics. The catalog's complete fields should not be represented as 178/178 officially verified.


## Beta B040–B080 official current-text audit — 2026-11-02

- Checked **41 records B040–B080** against their corresponding Cyberpunk TCG official card pages (English current rules text and displayed traits) and reviewed existing Traditional Chinese effect translations. The official card pages provide a *current* card-family rule text, sometimes with multiple Beta and Retail printings, not by themselves proof of unchanged wording on each historic physical Beta print.
- All 41 corresponding official card-family pages were accessible in this audit. The 41 cards' catalog English wording, trait categories and Chinese semantic meaning showed no confirmed substantive discrepancies against those current card-family pages. Source examples: `/cards/rogue-amendiares-preem-solo`, `/cards/adam-smasher-metal-over-meat`, `/cards/alt-cunningham-mother-of-daemons`, `/cards/goro-takemura-vengeful-bodyguard`, `/cards/panam-palmer-nomad-cavalry`, `/cards/maxtac-av`.
- **One localized terminology correction:** B080 MaxTac AV, from `【打出】你可以將一個我方任務與一個對手任務交換。` to `【打出（Play）】你可以交換一顆友方任務骰與一顆對手任務骰。` to correctly express Gig as the site's standard 任務骰 and use consistent {Play} terminology. The source official rule remains `{Play} You may swap a friendly Gig with a rival Gig.`
- Marked these 41 as `checked-official-current-text-and-traits-2026-11-02`. Earlier B001–B039 batch included 39 English source restorations. **80/178 now have a recorded independent current-official-source comparison in the present follow-up passes; remaining 98 records are NOT certified by this milestone**. Other old records' previous inspection notes still apply but are not counted twice here.
- Rebuilt V2 static cache references (`beta-cards.json?v=27`, `v2/beta-gallery.js?v=17`). No change to original English text, TAGS, graphics, cost/ram/power, rarity or image links in this pass.
- **Still pending:** B081–B171 and T001–T006 current-source re-check (98 records), physical Beta print-versus-current wording comparison, and functional/mobile UI acceptance.


## Beta final 98-record TAGS/EFFECTS source and terminology pass — 2026-11-02

- Scope: the **98 records left after the earlier 80-record official-current-text review**: B003, B081–B171 (91 cards), T001–T006 (6 Box Toppers). The distinction between direct official current-text verification and *locating* a source is preserved below.
- Opened/located each of the **86 distinct official card-family URLs** referred to by these 98 print records. Direct official web-page opening failed for B083 Nadia: Fighting Through Grief, B117 Lizzy Wizzy: Delicate Weapon and B127 Westbrook Netrunner. B083 and B117 were recovered through indexed official pages with the matching card name, rules and tags; B127 could only be cross-checked against secondary catalog references (tcg.online and cyberpunktcg.wiki) plus public official FAQ references. Thus **97 of the 98 records have an accessible current-official-page or indexed official card source**; B127 remains non-official-direct confirmation.
- Complete **178/178 field presence**: nonempty English rules, Chinese descriptions, and TAGS arrays. This pass standardized Chinese keyword/trait terminology in **73 entries** throughout the whole Beta dataset (including 3 previously reviewed entries whose wording needed matching to their alternate prints). In particular: 任務骰 (Gig), 友方 (friendly), 橫置 (Spend), 獨闖 (Go Solo), 阻擋 (Blocker), plus parenthesized English keyword equivalents and attack/quick/play triggers. Meaning, numeric conditions and official English source text were left unchanged.
- Whole-dataset same-name/version check again found **zero divergent English rule texts, Chinese descriptions or TAGS across the 31 same-name groups containing 63 printed variants**.
- **Important certification limit**: locating/opening an official card page, or successfully standardizing Chinese terminology, is NOT proof that the full English content and every TAG have been independently compared line-for-line against the rendered official page. Previous 80/178 records carried separately documented current-official comparison. The 97 remaining official-source-found records are marked `official-page-located-terminology-reviewed-2026-11-02` rather than misleadingly `verified-official`. B127 is marked `secondary-source-current-text-matched-2026-11-02`. Therefore the remaining **98 independent official semantic/trait line-by-line certifications remain open**; this has finished the complete batch's **source discovery, vocabulary normalization and internal integrity** in one operation, not a falsely claimed historical printing or semantic audit.
- Independent per-physical-Beta-print reading, historical errata differences and direct mobile/desktop rendering tests remain outside this batch.
- Files changed: `beta-cards.json`, V2 catalog cache reference `beta-cards.json?v=28`, V2 script cache reference `v2/beta-gallery.js?v=18`. No changes to card image URLs, card numbers, rarity, cost, RAM or power.


## Official Beta printing URL audit — 2026-11-02

- Target: 178 distinct `?printing=<UUID>` links to each precisely numbered official Cyberpunk TCG printing. The popup retains one source link for the currently displayed card; with a verified `printingUrl`, it uses the official page; otherwise it retains the numbered external source (`imageSource`).
- **Current verified exact official printing links: 57/178**. Previously verified 8/178; this pass added 49 more verified UUIDs by opening the official card family page and clicking the explicitly labeled **Welcome to Night City — Beta** card-number-specific printing. Covered B004–B017 (except B018, which could not be opened directly; B001–B002 already verified; B003 remains missing), B019–B043 (some gaps remain), and specific iconic variants B143, B145–B149, B159–B161. All 57 URLs are distinct, include a UUID and match their corresponding official card-family slug and numbered Beta printing.
- **Still missing: 121/178**. No guessed UUIDs or shared family default page were written. Missing records retain exact numbered third-party source links so a card printing never silently links to the wrong official default printing.
- Official card list and card family pages expose the printing selector interactively. An accessible bulk official UUID API or downloadable mapping was not established in this audit. The remaining 121 printings require independent official selector lookups or reliable bulk-data extraction; do not mark the official link audit complete.
- Changed the JSON `printingUrl` fields only. No card attributes, effects, art or CSS changed in this audit.


## Official Beta printing URL audit — final update, 2026-11-02

- **177 of 178** Beta card records now have an individually matched official Cyberpunk TCG printing-specific `?printing=<UUID>` URL. This supersedes the interim 57/178 count in the earlier audit entry. The 177 unique links were obtained by navigating the official card-family pages and selecting the corresponding **Welcome to Night City — Beta#βNNN**, or for locally indexed T001–T006, **Box Toppers — Beta#β00N**; all link UUIDs were sourced rather than guessed.
- **Only outstanding official UUID: B127 Westbrook Netrunner.** Official direct card page could not be read via available browsing routes. External sources confirm `Welcome to Night City — Beta#β127`, but the third-party gallery's printing UUID cannot be assumed to be the official website's UUID. B127 deliberately retains its unique numbered third-party product source as the popup's one external link; do not point to the unqualified official card-family default page.
- Audit: all 177 URLs are unique, follow `<abilitySource>?printing=<valid UUID>`, and no two Beta printed card records share a `printingUrl`. The popup's existing single-link logic chooses `printingUrl || imageSource || imageUrl`; no change to card art, rarity, ID, cost, RAM, power, Chinese/English ability, or TAGS during this URL-link pass.
- Browser cache revisions updated to `beta-cards.json?v=30` and `v2/beta-gallery.js?v=20`.
- This is a URL mapping verification, not a claim of full browser/phone click-through testing across all 178 cards or validation of every historic physical Beta card's rules text.


## V2 Beta Starter deck gallery audit — 2026-11-02

- **Both decks audited against the official 2026-08-21 decklists**: The Heist and Embracing Power each have 20 unique card faces (3 Legends plus a 40-card Main Deck), 43 physical cards per deck. The V2 gallery contains 40 matching unique-card tiles in total.
- **40/40 exact official Beta Starter printing URLs** sourced from the official card-family selector, each mapped to that deck's own β001–β020 collector number, not to Welcome to Night City Beta booster printings. Cards in the gallery retain their original image URL independently; the single popup external link uses the corresponding `printingUrl`.
- **List appearance unified** to the Beta booster gallery for card image ratio, padding, desktop/mobile grid, typography and metadata; quantity badges ×1–×3 appear in round markers on the upper-right of the card tile.
- **Popup reuses the same Beta modal component** and COST/RAM/POW/TAGS/EFFECTS styling. Four Starter-only card families (Dexter DeShawn: One Last Chance, MT0D12 Flathead, Minotaur, Goro Takemura: Losing His Way) now use manually transcribed official current rule and numerical references; other named cards display the reviewed shared-family data reference. Existing English names, Chinese terminology and quantities were retained.
- **Still pending:** independent word-for-word comparison with physical Beta Starter printing rules for all 40 unique printings, and visual desktop/mobile click-through review. The official family pages expose current English rules, not a proven historical per-printing text revision. Do not equate current-rules reference with a completed historical Beta printing audit.


## V2 Starter / Beta shared-card identity and versions — 2026-11-02

- Both Starter deck galleries contain 40 unique faces. **36 of 40 have the same English card name as a record in the existing Beta/Box Topper index**; their live card display references the canonical Beta entry for the translated name, card type, color, COST/RAM/POW, tags, and current effect text. Four starter-only named cards retain separate official-current-reference data: Dexter DeShawn: One Last Chance; MT0D12 Flathead; Minotaur; Goro Takemura: Losing His Way.
- The Beta and Starter lists continue to preserve independent card art, collector numbering, set label and exact official `?printing=` UUID.
- The common Popup VERSIONS list now includes card-family-matching Starter, Beta and Box Topper printings when the existing current rule text, type, color and numeric attributes agree. It explicitly labels starter variants `HEIST βNNN` or `POWER βNNN`; clicking a version reopens that printing and switches its single outgoing official URL.
- Matching current rules is **not** proof that every historic physical Starter card has identical printed wording. Physical Beta Starter word-for-word audit and browser/mobile click-through testing remain outstanding.
