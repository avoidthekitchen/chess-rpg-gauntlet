# Pawnshire: notes for agents and contributors

Pawnshire is a storybook chess learning journey (Phaser 4 + TypeScript + Vite, chess.js). The accepted curriculum is live at https://unformedideas.com/chess-rpg/, with previews at https://unformedideas.com/staging-chess-rpg/. The original game is archived at https://unformedideas.com/alpha-chess-rpg/ as an [original-game reference](docs/alpha-reference.md). The retired campaign and technique references remain in [Git history](docs/legacy-retirement.md). Start with the [design overview](docs/design.md), then the [playbook](docs/playbook.md) for how a Region is built and checked.

## Rules that never bend

- **The rules of chess never change on the board.** No terrain, extra moves or rule-bending powers. Published positions and replies stay unchanged. Faction voices do not imply new board rules.
- **`src/game` has no screen code.** Rules, journey progress and content live there with unit tests; scenes talk to them through small interfaces.
- **Every new rule gets a test, and every lesson is verified** to the bars in the [playbook](docs/playbook.md#verification-bars). Run `npm run ci` before each PR. Legacy runtime and benchmarks were removed in #55; current CI validates the shipped journey.
- **Names come from [Names and terms](docs/design/glossary.md)**, dialogue from the [voice guide](docs/design/story.md#voice-and-dialogue), current help and progression numbers from [Tuning values](docs/design/systems.md#tuning-values).
- **Design calls the docs don't settle** go in [decisions](docs/design/decisions.md): a decision-log row, or an open TODO when it needs the owner.

## Commands

```bash
npm run dev              # http://localhost:5173 (?loop=timeout keeps it running in a background tab)
npm test                 # unit tests
npx tsc --noEmit         # type-check
npm run check            # type-check, build and unit tests (under a minute)
npm run ci               # current release checks: type-check, build and unit tests
npm run deploy:staging   # preview deployment for review
npm run deploy           # production deployment; separate release decision
```

Never commit `data/raw/`, `art/raw/`, `audio/raw/`, `dist/`, `dist-staging/`, `dist-worker/` or `dist-worker-staging/`. The raw puzzle download, raw art and raw audio takes stay local.

## Where things are

The [README layout](README.md#layout) lists the folders. The ones you'll touch most:

- `src/game/curriculum.ts` and `curriculumPuzzles.json`: current chapter content and source positions. New Regions follow the [syllabus](docs/design/syllabus.md) and [Region template](docs/design/regions/region-template.md).
- `src/game/journey.ts` and `ambush.ts`: progression and published-line rules. `companions.ts` and `puzzle.ts` preserve shared identities and chess validation.
- `src/scenes/`: one Phaser scene per screen.
- `src/scenes/Journey.ts` and `CoursePlay.ts`: current map, journal, settings, and lessons. Retired screens are linked from `docs/legacy-retirement.md`.
- `src/ui/phaserBoard.ts`: the board and its animations.
- `src/audio/`: the sound engine and voice script. A changed dialogue line needs re-recording; see [Sound](docs/design/audio.md#making-and-changing-audio).

## Phaser 4 pitfalls we hit

- `children.removeAll()` only unlinks objects. Destroy each one, or old zones stay clickable and leak (`BaseScene.rebuild` does this).
- Geometry masks don't work under WebGL in v4. Scroll content under an opaque header instead.
- Removing a finished `TweenChain` throws. Only stop chains that are still playing.
- In scale mode NONE, `scale.resize()` skips the CSS size when zoom is 1. `fitGame` sets it explicitly.
- Use `goTo()` (`src/ui/screen.ts`) to change screens from callbacks. `this.scene.start()` only stops the scene it's called on.
- Start a move animation before redrawing the board, or pieces jump to their new squares.
- Async work (animations) must check the scene's session after each `await`, so a battle you left stops.

## Writing style for docs and in-game text

Short, specific and plain: lead with the point, use numbers and names, keep sentences under 25 words, and use no jargon the reader would have to look up. In-game lines follow the [voice guide](docs/design/story.md#voice-and-dialogue).

## Current scope

The basic curriculum through the Lich King is shipped. Maintain this production direction before adding armies, powers, economy, faction AI, or custom puzzles.
The owner accepted the major feedback and deferred follow-ups #53–62. They do not block the current release.
Preserve story, cast, voice, art direction, and responsive presentation. These belong to the core experience.
Use independent subagents for code review and teaching critique before delivering each Region.
User-approved model preference: GPT-6.1 Sol for implementation; GPT-6 Astra for adversarial review and critique.
