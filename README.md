# Pawnshire

A storybook chess tactics journey. **The rules of chess never change on the board.** Learn from published Lichess positions with a companion, then put each idea into practice. See [the current curriculum](docs/curriculum-first.md), [design overview](docs/design.md), [playbook](docs/playbook.md), [AGENTS.md](AGENTS.md), and [build progress](docs/progress.md).

Play it: https://unformedideas.com/chess-rpg/

Preview the new two-chapter journey: https://unformedideas.com/staging-chess-rpg/.
The live site keeps the earlier campaign until this change is merged and deployed there.

## Run it

```bash
npm install
npm run dev              # http://localhost:5173
npm test                 # rules, campaign, economy, bounty, boss and AI tests
npm run check            # type-check, build and unit tests (under a minute)
npm run ci               # check, plus the engine playtests your changes can affect (--full for all, --plan to preview)
npm run verify:battles   # engine-backed playtests of every battle and the boss (15 minutes or more)
npm run build            # static site in dist/
npm run puzzles          # rebuild the bounty puzzles from the Lichess database (downloads ~250 MB to data/raw/)
```

In dev, `?loop=timeout` keeps the game running in a hidden browser tab (handy for automated testing).
The default entry opens the new journey. No query parameter is needed on staging.
Development-only entries preserve the earlier campaign (`?legacy=1`) and approved pilot (`?ambush=r2-two-at-once`).
The journey, legacy campaign, and pilot use separate saves. Resetting the journey leaves the others intact.

## What's in it

- **The Bog:** loose pieces, safe captures, answering check, back-rank mate, promotion, and Grubnak's mixed review.
- **The Kingsroad:** knight forks, double attacks, double check, removing defenders, mate in two, and Ashfang's mixed review.
- **Published puzzles:** 88 distinct positions across demonstrations, practice waves, review challenges, and retry backups. Source lines remain unchanged.
- **Guidance:** three companions, full demonstrations, four help settings, hints, and a journal of learned ideas.
- **Progress:** sequential unlocks, saved completion, three stars per encounter, and unlimited retries. Replays can earn missed stars.
- **Presentation:** Continue/New journey title, painted route maps, portrait introductions, talking pieces, conversation history, accurate move banners, and victory stars.
- **Board feel:** animated animal pieces, classic-piece controls, and phone layouts.

This journey assumes players know piece movement. The entry screen includes a reminder and links to Lichess Learn.
Recruitment, gold, faction AI, powers, and live army bosses are deferred. Their existing code remains available in the legacy development entry.

## Layout

```
src/game/     curriculum (published content), journey (progress/stars), ambush (published-line rules),
              plus legacy battle, campaign, economy, boss, region1*, tactics and threats
src/ai/       engine.ts (Stockfish over a Web Worker), enemy.ts (move choice), shout.ts (shouting goblins)
src/scenes/   Boot, Journey (title/map/journal/settings), CoursePlay (lesson runner), and retained legacy screens
src/ui/       board, portraits, widgets, HTML overlay for long text, responsive/high-DPI screen helpers
src/flow.ts   campaign flow between screens (briefings, launching battles, results)
scripts/      art generation, puzzle pipeline, engine copy, deploy staging, verify/ (engine playtests)
```

## Adding curriculum

Add source-backed content to `src/game/curriculum.ts` and `curriculumPuzzles.json`.
The curation script is `scripts/select-curriculum.mjs`; raw downloads stay in ignored `data/raw/`.
Run `node scripts/select-curriculum.mjs --verify-shipped` to compare every shipped puzzle with the local Lichess database.
Read [curriculum rules](docs/curriculum-first.md#learning-and-content-rules) before selecting positions or writing prompts.
Content tests verify legal lines, lesson claims, quality fields, distinct sources, and backup completion.

## Adding a legacy battle

Add a `BattleDef` to `src/game/region1Battles.ts` and a node to `REGION1_MAP` in `src/game/region1.ts`. The player is White and moves first. `npm test` checks every position is legal (including that the enemy isn't already in check, which chess.js doesn't catch), and `npm run verify:battles` plays it out against the real enemy AI with shouts.

## Deploying

```bash
npm run deploy   # build, stage dist/ into dist-worker/chess-rpg/, wrangler deploy
npm run deploy:staging # publish the new journey only at /staging-chess-rpg/
```

The game is an assets-only Cloudflare Worker (free tier) on the zone routes `unformedideas.com/chess-rpg*` and `www.unformedideas.com/chess-rpg*` (`wrangler.jsonc`), so the site's own Worker keeps everything else. `/chess-rpg` redirects to `/chess-rpg/`. The build uses relative paths, so it works under any subpath and inside Capacitor. The 3D model comparison files are left out of the deploy. The largest file is the 1.8 MB engine `.wasm`.

## Board, tokens and art

The battle board is drawn in Phaser (`src/ui/phaserBoard.ts`), ported from the PixiJS prototype: a knight hops in an arc and leaves a dotted L, a rook stomps square by square, and a capture gets a freeze frame, a white flash, a shake and a knock-out. Each piece is a simplified **token**, a bust of its animal in its chess headgear, sized to stay about one square tall so it reads at 45 px on a phone. The detailed figurines appear as **talking heads** beside the board when a piece moves or captures. The curriculum uses `src/ui/coursePresentation.ts` for portrait dialogue, truthful move cues, and conversation history. On phones, dialogue sits in the lesson panel beneath the board. The "Classic pieces" button switches to standard chess pieces.


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
