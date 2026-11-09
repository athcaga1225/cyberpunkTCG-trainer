# V3 starter cross-deck acceptance — 2026-11-09

Opening setup now selects the player's starter and the automatic opponent's starter independently. “Same deck” follows the player's selection. Cross-deck matches use random six-card openings and the existing one-time full Mulligan; fixed Heist scenarios remain available for same-deck or script practice. Restart keeps the matchup and clears the completed match.

`starter-match.js` composes each side from its own preset. It does not replace card effects, modify the shared engine, or infer abilities from the player's deck. Each side retains its own 40 main-deck cards and three Legends. The existing internal `mirror-the-heist` identifier remains the automatic-turn compatibility protocol; it does not constrain the opponent's manifest.

## Validation

- Both cross directions: 100 seeded complete games each, alternating first player and keep/Mulligan, immutable commands, exact card/Legend/dice conservation after every action, termination within the action budget, and finished-state action guards.
- Chromium at 1280×720: both cross directions, active and passive human policies, actual opening/payment/attack/reaction/effect controls, natural match completion and clean restart retaining matchup.
- Setup transitions: fixed Heist opening to cross match forces random opening; changing own starter preserves explicit opponent; script mode resets opponent to same; automatic mode restores a valid setup; opening action stays accessible.
- Focused interactions: Minotaur → T-Bug → private reveal/free Call → Viktor search; actual AI pause/resumption without duplicate payment/play/draw; Offduty → Radioport → private Saburo Call; Corporate Surveillance → Rippler; Floor It changes Saburo/Minotaur's two-Gig threshold; Satori draws despite Reboot protecting the losing Unit; Over the Edge removes a Go Solo Legend and trashes its Gear without consuming fight-only Reboot.
- Existing sixteen native suites pass, including both starter effect coverage and The Heist's 100 complete matches. Desktop opening/sidebar layout and readable-control checks remain covered.

These checks establish supported state transitions, not competitive AI strength or exhaustive proof of every legal card combination. Custom deck construction, stronger opponent strategy, and mobile/tablet work remain separate work.
