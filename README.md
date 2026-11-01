# NIGHT CITY TRAINING

Unofficial Traditional Chinese training website for **Cyberpunk Trading Card Game**.

Live site (when GitHub Pages finishes deploying): https://athcaga1225.github.io/cyberpunkTCG-trainer/

## What's implemented

- Responsive CYBERDEX-inspired Type B Red design.
- Six-step Traditional Chinese beginner guide grounded in the official gameplay guide.
- **Seven playable rule exercises**: Gig roll-in, d20-last constraint, target validation, Power-based fights, stealing Gigs, Mantis Blades Power modifier, Blocker reaction, start-of-turn 7-Gig win, and Field Operator draw.
- Verified-rule **partial engine** in `rules-core.js`, with **16 deterministic tests**.
- Official starter deck manifests for **The Heist and Embracing Power**, each 3 Legends and 40 main-deck cards, plus comparison against locally imported JSON.
- Eight official card summaries and direct official source URLs; cards are explicitly marked partly implemented/unimplemented.
- Local JSON importer for card metadata.
- The separate legacy `battle.js` is an **UNOFFICIAL experimental game** with invented hit points and mana. It must never be presented as Cyberpunk TCG official gameplay.

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
