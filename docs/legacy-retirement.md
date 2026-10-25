# Legacy retirement: issue #55

The owner approved removing unused legacy code after accepting the curriculum as production direction.
The original game remains at [alpha](https://unformedideas.com/alpha-chess-rpg/).
This change does not modify published positions, source replies, progression, storage keys, or presentation behavior.

## Removed from current development

- Earlier campaign and standalone pilot screens, saves, army rules, economy, battle AI, and their tests.
- Stockfish worker integration, engine-copy hooks, battle simulations, and dependency-based benchmark selection.
- Bounty loading, rewards, old public puzzle packs, and their pack-building command.
- Unshipped Three.js prototypes, six model assets, generation/optimization scripts, and their dependencies.
- The old battle cue queue and engine-confirmed tactic checks, which had no current consumers.

`npm run ci` runs type-check, production build, and current unit tests.
`--full` remains compatible. `--plan` prints the checks.
`--legacy` now fails explicitly instead of implying retired checks ran.

## Preserved boundaries

- `src/game/companions.ts` preserves the three companion names, species, blurbs, and saved starter IDs.
- `src/game/puzzle.ts` preserves setup replay, published-line checking, and alternative immediate checkmates.
- The shared material, threat, tactic, board, portrait, faction and dialogue helpers remain available.
- Current journey tests retain progression, retry, interrupted-attempt, migration, finale, and storage-isolation coverage.
- Every published curriculum puzzle and evidence file is unchanged.

`data/retired-puzzle-ids.json` preserves 288 unique bounty IDs and nine pilot IDs from the revision below.
The two retired bounty files contained 300 rows with 12 duplicate IDs.
Bounty IDs remain excluded throughout the curriculum; retired lesson IDs remain excluded from Regions 3–5 and the finale.
Regions 1–2 retain their accepted overlap policy.
The ledger contains no runnable legacy code and never enters the game bundle.

Both source-selection modes remain available:

```bash
node scripts/select-curriculum.mjs --verify-shipped
node scripts/select-curriculum.mjs --candidates defensiveMove --min 930 --max 1130
```

They require the local database at `data/raw/lichess_db_puzzle.csv.zst`.
Shortlists stay under ignored `data/raw/`.

## Technique references for #40

The immutable reference revision is `81e1f3324bb881cc1281317393e5b75f1755c84c`.
These references preserve possible reuse without retaining engine dependencies or running their tests on every change.

- [Academy exercises](https://github.com/avoidthekitchen/chess-rpg-gauntlet/blob/81e1f3324bb881cc1281317393e5b75f1755c84c/src/game/academy.ts): queen/rook versus king positions and original teaching steps.
- [Academy tests](https://github.com/avoidthekitchen/chess-rpg-gauntlet/blob/81e1f3324bb881cc1281317393e5b75f1755c84c/src/game/academy.test.ts): old legality and checkmate objectives.
- [Battle rules](https://github.com/avoidthekitchen/chess-rpg-gauntlet/blob/81e1f3324bb881cc1281317393e5b75f1755c84c/src/game/battle.ts): terminal conditions and undo reference.
- [Scenario objectives](https://github.com/avoidthekitchen/chess-rpg-gauntlet/blob/81e1f3324bb881cc1281317393e5b75f1755c84c/src/game/scenarios.ts): old goal contracts.
- [Engine interface](https://github.com/avoidthekitchen/chess-rpg-gauntlet/blob/81e1f3324bb881cc1281317393e5b75f1755c84c/src/ai/engine.ts): worker protocol reference.
- [3D experiments](https://github.com/avoidthekitchen/chess-rpg-gauntlet/tree/81e1f3324bb881cc1281317393e5b75f1755c84c/src/mockups): deferred presentation experiments, with models and generation scripts at the same revision.

The old academy advertised Lichess Practice’s “Piece Checkmates I” but did not record exact source chapter IDs.
Its text and fixed positions do not establish complete technique teaching or validation of alternative continuations.
Issue #40 still needs exact provenance, accepted alternatives, suitable defence, progress/failure checks, and fresh integration tests.

## Build and deployment distinction

Fresh installs no longer include Stockfish, Three.js, GSAP, or the GLTF toolchain.
Build/dev commands no longer copy Stockfish assets.
Older workspaces may still have ignored files under `public/engine/`; Vite can copy these into local build output.
Deployment staging explicitly excludes `engine`, `puzzles`, `models`, and `mockups` for both destinations.
Regression tests prove those exclusions while retaining sprites, backgrounds, JavaScript, and CSS.
Historical distributions and license obligations remain unchanged. The project retains its GPL-3 decision.

## Verification

`npm run ci` passed 292 tests in 24 files, plus type-check and the production build.
The staging build and both local deployment staging commands passed.
The full local Lichess database matched all 273 published source records.
Independent GPT-6 Astra review and testing found no remaining blockers.
[Build progress](progress.md#2026-10-25--remove-unused-legacy-code-55) records browser coverage and the single-run iteration comparison.
