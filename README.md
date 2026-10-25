# Pawnshire

A storybook chess tactics journey. **The rules of chess never change on the board.** Learn from published Lichess positions with a companion, then put each idea into practice. See [the accepted baseline](docs/curriculum-first.md), [curriculum syllabus](docs/design/syllabus.md), [Region 3 brief](docs/design/regions/region-03-shadow-cult.md), [design overview](docs/design.md), [playbook](docs/playbook.md), [AGENTS.md](AGENTS.md), and [build progress](docs/progress.md).

Play it: https://unformedideas.com/chess-rpg/

The complete five-Region journey and Lich King finale is live at that production address.
Preview changes at https://unformedideas.com/staging-chess-rpg/.
The original game is archived at https://unformedideas.com/alpha-chess-rpg/ as an [original-game reference](docs/alpha-reference.md).

## Run it

```bash
npm install
npm run dev              # http://localhost:5173
npm test                 # journey, teaching, shared chess and tooling tests
npm run check            # type-check, build and unit tests (under a minute)
npm run ci               # type-check, production build and current unit tests
npm run build            # static site in dist/
```

In dev, `?loop=timeout` keeps the game running in a hidden browser tab (handy for automated testing).
The default entry opens the new journey. No query parameter is needed on staging.
For testing, append `?region=3` to jump to Region 3. Values `1`–`5` and `finale` work in staging and development only.
Each shortcut has separate saved test progress. Earlier chapters are marked complete; the requested chapter starts unsolved.
Reload keeps test progress and returns to the requested chapter. Remove the parameter to return to your normal journey.
The earlier campaign and pilot entry points were removed in [legacy retirement](docs/legacy-retirement.md).
The journey, legacy campaign, and pilot use separate saves. Resetting the journey leaves the others intact.

## What's in it

- **The Bog:** loose pieces, safe captures, answering check, back-rank mate, promotion, and Grubnak's mixed review.
- **The Kingsroad:** knight forks, double attacks, double check, removing defenders, mate in two, and Ashfang's mixed review.
- **Shadow Cult:** pins, escapes by capturing the pinning attacker, skewers, x-rays, discoveries, and a double-check revisit.
- **The Iron March:** bishop development with check, file tactics, exposed-king checks, deflection, intermediate moves, and mate-threat defence.
- **Bone Wardens:** passed pawns, pawn races, safe king routes, rook support, endgame skewers, and knight promotion mate.
- **The Lich King:** two mixed encounters, a saved ending, credits, and replay. Both final variants end in actual checkmate.
- **Published puzzles:** 273 distinct positions across demonstrations, practice waves, review challenges, and retry backups. Source lines remain unchanged.
- **Guidance:** three companions, full demonstrations, four help settings, hints, and a journal of learned ideas.
- **Progress:** sequential unlocks, saved completion, three optional stars per encounter, and unlimited retries. There are 28 guided lessons and seven mixed encounters. Replays can earn missed stars.
- **Presentation:** Continue/New journey title, painted route maps, portrait introductions, talking pieces, conversation history, accurate move banners, and victory stars.
- **Board feel:** animated animal pieces, classic-piece controls, and phone layouts.

This journey assumes players know piece movement. The entry screen includes a reminder and links to Lichess Learn.
Recruitment, gold, faction AI, powers, and live army bosses are deferred. Their earlier implementation remains available in Git history.

## Layout

```
src/game/     curriculum, journey progress, published-line rules, companions and shared chess helpers
src/scenes/   Boot, Journey (title/map/journal/settings), CoursePlay (lesson runner)
src/ui/       board, portraits, widgets, HTML overlays and responsive screen helpers
data/         retired source reservations; ignored raw puzzle downloads
scripts/      art generation, source selection/verification and deployment staging
```

## Adding curriculum

Register source-backed content in `src/game/curriculum.ts`. Chapter modules, published positions, and mechanism evidence live under `src/game/course/`.
The curation script is `scripts/select-curriculum.mjs`; raw downloads stay in ignored `data/raw/`.
Use `node scripts/select-curriculum.mjs --candidates defensiveMove --min 930 --max 1130` to shortlist a theme from the local database.
Run `node scripts/select-curriculum.mjs --verify-shipped` to compare every shipped puzzle with the local Lichess database.
Read [curriculum rules](docs/curriculum-first.md#learning-and-content-rules) before selecting positions or writing prompts.
Content tests verify legal lines, lesson claims, quality fields, distinct sources, and backup completion.

The [release record](docs/complete-journey-release.md) tracks merged review PRs, validation, deployment, and save safeguards.
The owner accepted the major feedback and deferred follow-ups #53–62. The owner accepted 393×852 WebKit emulation for this check; no physical-device coverage is claimed.

## Deploying

```bash
npm run deploy   # build, stage dist/ into dist-worker/chess-rpg/, wrangler deploy
npm run deploy:staging # publish a preview at /staging-chess-rpg/
```

The game is an assets-only Cloudflare Worker (free tier) on the zone routes `unformedideas.com/chess-rpg*` and `www.unformedideas.com/chess-rpg*` (`wrangler.jsonc`), so the site's own Worker keeps everything else. `/chess-rpg` redirects to `/chess-rpg/`. The build uses relative paths, so it works under any subpath and inside Capacitor. Retired engine, puzzle-pack, model and mockup directories are excluded from deployment, including stale generated files.

## Board, tokens and art

The battle board is drawn in Phaser (`src/ui/phaserBoard.ts`), ported from the PixiJS prototype: a knight hops in an arc and leaves a dotted L, a rook stomps square by square, and a capture gets a freeze frame, a white flash, a shake and a knock-out. Each piece is a simplified **token**, a bust of its animal in its chess headgear, sized to stay about one square tall so it reads at 45 px on a phone. The detailed figurines appear as **talking heads** beside the board when a piece moves or captures. The curriculum uses `src/ui/coursePresentation.ts` for portrait dialogue, truthful move cues, and conversation history. On phones, temporary speech overlays lesson advice while keeping board squares and action buttons clear. A small portrait button opens conversation history. Roomy desktop layouts keep speech in a separate panel. Teaching advice stays in the lesson panel. The "Classic pieces" button switches to standard chess pieces.


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

## License

The project retains its GPL-3 license decision. Stockfish was removed from current builds; historical distributions retain their license obligations. chess.js is BSD-2.
