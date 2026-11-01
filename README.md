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
