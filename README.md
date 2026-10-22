# Gauntlet: battle prototype

A chess tactics RPG in the spirit of Into the Breach. This prototype tests one question: **are short, objective-driven chess battles fun?**

Rule of the design: the rules of chess never change on the board. The RPG lives around it.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # rules, threats, rewind and AI tests
npm run build    # static site in dist/
```

## What's in it

- **5 handmade battles** in `src/game/scenarios.ts`: a rook ladder mate, a knight fork, a village defense, a king-and-pawn race and a boss.
- **Objectives** beyond checkmate: win material, survive N turns, promote safely, all with move limits.
- **Threat Sight**: tints squares the enemy attacks and makes your at-risk pieces glow red.
- **Rewind**: undo your last move and the enemy's reply. Charges depend on difficulty, and you can rewind out of a defeat.
- **Tactic banners**: "Fork!", "Check!" and so on, detected in `src/game/tactics.ts`.
- **Difficulty** (Squire → Grandmaster): sets enemy strength, rewinds and Threat Sight.
- **Enemy AI**: Stockfish 19 lite (WASM, single-threaded) in a Web Worker. It asks for several candidate moves and picks one within a centipawn window, so weak enemies make human-looking mistakes. A "raider" personality hunts villages. If Stockfish fails to load, a simple fallback AI takes over.

## Layout

```
src/game/   rules: battle.ts (objectives, rewind), scenarios, difficulty, threats, tactics
src/ai/     engine.ts (UCI over a Web Worker), enemy.ts (move choice and personalities)
src/ui/     board.ts (DOM board)
src/main.ts screens and turn flow
scripts/copy-engine.mjs  copies Stockfish from node_modules into public/engine
```

`src/game` has no DOM code, so it can move to a Phaser/Pixi front end later.

## Figurine board and art

The battle board is drawn with PixiJS (`src/ui/pixiBoard.ts`): a knight that hops in an arc and leaves a dotted L, a rook that stomps square by square, and captures with a freeze frame and knock-out. Each piece is a simplified **token**, a bust of its animal wearing its chess headgear (mouse in a round helmet, frog in a horse-head helm, owl in a slit mitre, tortoise in a castle tower, fox in a pointed crown, lion in a cross-topped crown), sized to stay about one square tall. The detailed figurines appear as **talking heads** beside the board when a piece moves or captures (`src/ui/speaker.ts`); on phones the card floats at the bottom of the screen. The "Pieces" button switches to the classic DOM board, which also stays in the page (hidden) for screen readers and keyboard play.

Art comes from OpenRouter's image models, styled after `art/reference/`:

```bash
node scripts/generate-art.mjs              # new sprites only; needs OPENROUTER_API_KEY_WITH_BUDGET
node scripts/generate-art.mjs knight-ally  # regenerate one (about $0.14 each)
node scripts/process-art.mjs               # cut out new/changed raws → public/sprites/*.webp (--all to redo every one)
```

Sides are `ally` (cream and teal, gold rim), `foe` (Bandit Riders: black masks, crimson rim) and `bog` (Bog Goblins, Region 1: muddy rags, lime-green war paint, mossy green rim). Bog tokens are generated from the ally tokens so the chess headgear stays identical, and bog portraits from the ally figurines:

```bash
node scripts/generate-art.mjs token-pawn-bog token-knight-bog token-bishop-bog token-rook-bog token-queen-bog token-king-bog
node scripts/generate-art.mjs pawn-bog knight-bog bishop-bog rook-bog queen-bog king-bog
```

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

## Adding a battle

Add an entry to `SCENARIOS`. The player is always White and moves first. The tests check that every position is legal, including that the enemy isn't already in check (chess.js doesn't catch that).

## Deploying

`dist/` is plain static files, with no special headers needed. The largest file is the 1.8 MB engine `.wasm`. On Cloudflare:

```bash
npx wrangler pages deploy dist --project-name chess-rpg-gauntlet
```

`vite.config.ts` uses relative paths (`base: './'`), so the same build can be wrapped with Capacitor for iOS.

## License

Stockfish is GPL-3.0 (`public/engine/COPYING-stockfish.txt` ships with the build). Distributing a build that includes it means releasing this game's source under a GPL-compatible license. chess.js is BSD-2.
