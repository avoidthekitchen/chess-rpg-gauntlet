# Pawnshire

A storybook chess tactics RPG in the spirit of Into the Breach. Rule of the design: **the rules of chess never change on the board.** The RPG lives around it. The name Gauntlet is kept for the replay mode that unlocks after the campaign. See [the design overview](docs/design.md) for the design, the [playbook](docs/playbook.md) for how to build and check a Region, [AGENTS.md](AGENTS.md) for working rules, and [Region 1 build progress](docs/progress.md) for the build log.

Play it: https://unformedideas.com/chess-rpg/

## Run it

```bash
npm install
npm run dev              # http://localhost:5173
npm test                 # rules, campaign, economy, bounty, boss and AI tests
npm run verify:battles   # engine-backed playtests of every battle and the boss (a few minutes)
npm run build            # static site in dist/
npm run puzzles          # rebuild the bounty puzzles from the Lichess database (downloads ~250 MB to data/raw/)
```

In dev, `?loop=timeout` keeps the game running in a hidden browser tab (handy for automated testing).

## What's in it (Region 1: the Bog)

- **Title flow:** "Do you know how the pieces move?", Squire or Knight difficulty, and a starter companion (frog knight, owl mage or tortoise golem) who tutors you.
- **Region map** with five lesson battles on branching paths (threat awareness, protection, safe trades, back-rank mate, promotion) and the Goblin Chief's camp, which opens after four wins.
- **Shouting goblins:** before your move the Bog Goblins announce the move they'd play if you passed, and must play it if it's still legal. Set traps, or foil them.
- **Town:** a tavern that hires pieces at their chess value, an academy lesson on rook and queen mates (unlimited undo), and a bounty board of real Lichess puzzles that refreshes after every battle.
- **Boss duel:** pick your army up to 10 points (no queen) and checkmate Grubnak; winning recruits Saffron the Fox Sorceress.
- **Loop:** gold, one-time bonus goals, loss costs by difficulty, engine-confirmed fork banners, rewind charges, Threat Sight, and a localStorage save.

## Layout

```
src/game/     rules with no screen code: battle.ts (objectives, rewind), campaign (save, map unlocks),
              economy (gold, hiring, loss costs, bounties), boss (budget), region1*.ts (content), tactics, threats
src/ai/       engine.ts (Stockfish over a Web Worker), enemy.ts (move choice), shout.ts (shouting goblins)
src/scenes/   Phaser screens: Boot, Title, Starter, Map, Town, Puzzle, Muster, Battle
src/ui/       board, portraits, widgets, HTML overlay for long text, responsive/high-DPI screen helpers
src/flow.ts   campaign flow between screens (briefings, launching battles, results)
scripts/      art generation, puzzle pipeline, engine copy, deploy staging, verify/ (engine playtests)
```

## Adding a battle

Add a `BattleDef` to `src/game/region1Battles.ts` and a node to `REGION1_MAP` in `src/game/region1.ts`. The player is White and moves first. `npm test` checks every position is legal (including that the enemy isn't already in check, which chess.js doesn't catch), and `npm run verify:battles` plays it out against the real enemy AI with shouts.

## Deploying

```bash
npm run deploy   # build, stage dist/ into dist-worker/chess-rpg/, wrangler deploy
```

The game is an assets-only Cloudflare Worker (free tier) on the zone routes `unformedideas.com/chess-rpg*` and `www.unformedideas.com/chess-rpg*` (`wrangler.jsonc`), so the site's own Worker keeps everything else. `/chess-rpg` redirects to `/chess-rpg/`. The build uses relative paths, so it works under any subpath and inside Capacitor. The 3D model comparison files are left out of the deploy. The largest file is the 1.8 MB engine `.wasm`.

## Board, tokens and art

The battle board is drawn in Phaser (`src/ui/phaserBoard.ts`), ported from the PixiJS prototype: a knight hops in an arc and leaves a dotted L, a rook stomps square by square, and a capture gets a freeze frame, a white flash, a shake and a knock-out. Each piece is a simplified **token**, a bust of its animal in its chess headgear, sized to stay about one square tall so it reads at 45 px on a phone. The detailed figurines appear as **talking heads** beside the board when a piece moves or captures (`src/ui/portrait.ts`, lines in `src/ui/speaker.ts`); on phones the card floats at the bottom of the screen. The "Pieces" button switches to standard chess pieces.


Art is AI-generated with Google's Gemini 3 Pro Image (`google/gemini-3-pro-image`) through OpenRouter, styled after `art/reference/`. Check Google's and OpenRouter's current terms for commercial use before shipping; images carry an invisible SynthID watermark.


```bash
node scripts/generate-art.mjs              # new sprites only; needs OPENROUTER_API_KEY_WITH_BUDGET
node scripts/generate-art.mjs knight-ally  # regenerate one (about $0.14 each)
node scripts/process-art.mjs               # cut out new/changed raws → public/sprites/*.webp (--all to redo every one)
node scripts/process-art.mjs --recolor     # redo token ivory/ebony from art/tokens/ (no raws, no API cost)
```

Factions are `ally` (our animals in cream with gold trim) and `bog` (Bog Goblins, Region 1: bog rats, salamanders, crows, snapping turtles, vipers and a toad chief). Every faction has a White and a Black version of each token: the chess headgear and base are generated in a cyan key, cut out to `art/tokens/` (committed), then recolored to ivory (`token-<piece>-<faction>-w.webp`) and ebony with a light rim (`-b.webp`). Bog portraits are generated from the Bog tokens, posed like the ally figurines:

```bash
node scripts/generate-art.mjs token-pawn-bog token-knight-bog token-bishop-bog token-rook-bog token-queen-bog token-king-bog
node scripts/process-art.mjs
node scripts/generate-art.mjs pawn-bog knight-bog bishop-bog rook-bog queen-bog king-bog
```

Adding a faction for a new region follows the checklist in [Art direction](docs/design/art.md#adding-a-faction).

Painted backgrounds (`bg-title`, `bg-map-region1`, `bg-town`, `bg-battle-bog`) use the same script. `process-art.mjs` doesn't cut them out; it resizes them to 1600 px and writes `public/backgrounds/<name>.webp` (under 250 KB each):

```bash
node scripts/generate-art.mjs bg-title bg-map-region1 bg-town bg-battle-bog
node scripts/process-art.mjs
```

In dev, `__gsap.globalTimeline.timeScale(0.1)` in the console plays animations in slow motion.

## 3D mockup

`mockups/models.html` compares AI-generated 3D models of the frog knight and tortoise rook from three fal.ai services (Hunyuan3D v3, TRELLIS 2, Rodin) next to the original art. To regenerate:

```bash
node scripts/generate-3d.mjs           # needs FAL_AI (or FAL_KEY); raw GLBs → art/3d/raw/ (not committed)
node scripts/optimize-3d.mjs           # ≤30k triangles, 1K WebP textures, meshopt → public/models/
```

`mockups/three.html` (open `/mockups/three.html` on the dev server) is a standalone Three.js mockup, not part of the game build. Its Style button cycles through procedural toys, painted cutouts and the three AI model sets. It shows two scripted captures in 3D, with either procedural toy figurines or the painted sprites as upright cutouts: a frog knight flip, a tortoise rook stomp, a kill-cam swoop with slow motion, a flash and shockwave, and the captured piece breaking apart.

## License

Stockfish is GPL-3.0 (`public/engine/COPYING-stockfish.txt` ships with the build). Distributing a build that includes it means releasing this game's source under a GPL-compatible license. chess.js is BSD-2.
