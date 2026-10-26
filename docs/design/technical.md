# Technical design and licensing

[Design overview](../design.md) · [Systems](systems.md) · [Art direction](art.md)

## Tech stack and deployment

Pawnshire is a TypeScript web game using Phaser 4, Vite, and chess.js.
The default build opens the curriculum journey. Its published puzzle replies do not use live engine move selection.

| Layer | Current implementation | Location or scope |
| --- | --- | --- |
| Build | Vite + TypeScript | `package.json`; Phaser dependency `^4.2.1` |
| Screens | Phaser scenes with HTML overlays | `Journey.ts`, `CoursePlay.ts`; painted navigation, board, teaching, settings, and history |
| Chess legality | chess.js | `src/game`; FEN, legal moves, check, promotion, and checkmate |
| Tactical lessons | Published Lichess lines | `src/game/curriculum.ts`, `curriculumPuzzles.json`, `ambush.ts` |
| Progression | Pure journey rules | `src/game/journey.ts` |
| Persistence | Local storage through `store` | `src/journeySave.ts`; separate `pawnshire-journey-v1` key |
| Presentation | Shared board and course presentation helpers | `src/ui/phaserBoard.ts`, `coursePresentation.ts`, related CSS |
| Hosting | Cloudflare static assets | `wrangler.jsonc`; separate production and staging routes |

`src/main.ts` registers the curriculum scenes by default.
Legacy campaign, pilot, engine, and 3D development entries were removed in #55.
Shared companion identities, puzzle legality, board presentation, and chess helpers remain.
[Legacy retirement](../legacy-retirement.md) records preserved references and source reservations.

`npm run build` type-checks and builds the production output in `dist/`.
`npm run deploy` stages it under `dist-worker/chess-rpg/` and deploys https://unformedideas.com/chess-rpg/.
`npm run deploy:staging` builds `dist-staging/`, stages `dist-worker-staging/staging-chess-rpg/`, and deploys https://unformedideas.com/staging-chess-rpg/.
The accepted curriculum is live at the production route after the owner’s 2026-10-24 deployment.
The original game is archived at https://unformedideas.com/alpha-chess-rpg/ as an [original-game reference](../alpha-reference.md).
The current deployment commands target production or staging; the alpha archive is separate from those deployment targets.
Cloudflare’s configured HTML handling supplies the trailing-slash redirect.
Use the deployment destination authorized for the work, and keep generated output out of commits.

Build and dev commands no longer copy an engine.
Deployment staging excludes retired engine, puzzle packs, models and mockups, including stale files from older checkouts.
Local Vite output may still copy ignored assets left in `public/`; deployment output is filtered separately.

## Rules, content, screens, and saves

`src/game` contains rules and content without screen code.
The curriculum defines `CourseLesson` and `CourseRegion`; each lesson uses the published-line runner’s `AmbushDef` shape.
Current lessons set gold rewards to zero and use journey stars instead.
Companion identities live in `src/game/companions.ts`; shared puzzle validation lives in `src/game/puzzle.ts`.

`src/game/ambush.ts` checks legal moves and the expected line, advances waves, counts misses, and supplies permitted hints.
It commits solver/reply pairs before screen animation. `src/game/journey.ts` settles the attempt once and updates completion and stars.
`src/journeySave.ts` validates loaded progress and rebuilds the active position from the published source line.
An unfinished load becomes an interrupted attempt; an already accepted victory remains complete.
Journey, legacy, and pilot save keys stay isolated, including resets.
Version-1 saves derive `finaleComplete` from their final completed encounter; a missing or stale flag is repaired. Actual final checkmate sets the flag before presentation.
Earlier replay attempts cannot unset it. Continue shows an unseen ending once; `endingSeen` is stored after rendering it. The first finale encounter only unlocks the interlude.
See the [release record](../complete-journey-release.md) for shared-origin staging saves and future rollback behavior.

`src/scenes/Journey.ts` owns the title, setup, map, journal, settings, interludes, and ending.
`src/scenes/CoursePlay.ts` owns teaching and play presentation, calling rules through small interfaces.
The shared board draws positions, animates moves, highlights squares, and reports input.
Async scene work checks the active session after each await. Exit cancels holds, speech, celebrations, and pending presentation.

Teaching advice stays in the lesson panel. Speech uses a separate surface so portraits cannot displace current advice.
Phone and short landscape screens show temporary cards and a 44px history button.
Roomy desktops reserve a separate last-speaker panel.
The [playbook](../playbook.md#browser-and-mobile-checks) defines viewport and browser evidence requirements.

## Future technique capability

The [syllabus](syllabus.md) records the five built Regions and finale, including their deliberately narrow technique claims.
Lichess Practice techniques need a dedicated exercise capability when a method has several valid continuations or a procedural goal.
The tactical runner follows one published line and stops at its endpoint; it does not implement general technique assessment.

Before a future chapter relies on technique practice, define its content contract, legal continuations, success checks, assistance, and persistence.
Add rules and tests independently of its screen. Identify each study and chapter and write our own teaching text.
The [archived academy and engine references](../legacy-retirement.md#technique-references-for-40) can inform implementation, but do not establish a shipped capability.

## Retained architecture decisions

Phaser supplies scenes, loading, input, animation, and the board within a single web stack.
The archived campaign used canvas town and battle screens.
TypeScript keeps chess tools and the game in the same language; the earlier design rejected Godot’s export and bridging overhead.

The game remains 2D. Earlier [3D exploration](art.md#3d-exploration-deferred) proposed a second Three.js canvas for a diorama or model board.
It would preserve rules, menus, and art while replacing board rendering; this remains deferred.
The figurines could remain rigid pieces without skeletal animation.
Capacitor wrapping for iOS and cloud save sync are also proposals, not shipped features.
Historical engine file-size estimates and hosting limits were implementation notes, not current release budgets.

## Licensing

The project retains its recorded GPL-3 license decision. Current builds no longer distribute Stockfish.
Keep required notices and source obligations intact when changing dependencies or deployment.

| Source or dependency | Recorded license or clearance | Project handling |
| --- | --- | --- |
| Lichess puzzle database | CC0 | Preserve source identity and credit Lichess; keep published data unchanged |
| chess.js | BSD-2 | Keep its notice |
| Historical Stockfish distributions | GPL-3 | Archived distributions retain their notices and source obligations; current builds do not copy the engine |
| Lichess Practice studies | Owner confirmed clearance on 2026-10-22 | Record study and chapter; write teaching text in our voice; credit Lichess |
| Published courses, including Steps Method, Bain, Silman, Polgar, and Yusupov | Copyrighted | Use topic order as inspiration; do not copy their exercises or text |
| Music, voices, and sound effects | Generated for Pawnshire through OpenRouter (Google Lyria 3, Gemini TTS, ByteDance Seed Audio); terms to confirm before app-store release | Credit AI assistance; keep prompts and choices in `audio/` |

The earlier design considered chessground, recorded as GPL-3, as a board alternative. Pawnshire uses its own board.
It recorded Lichess site code, `lichess-org/lila`, as AGPL-3; do not copy that code without resolving compatibility.
The earlier App Store proposal cited Lichess’s GPL mobile app as precedent; iOS distribution remains separate future work.
Keep Lichess out of Pawnshire’s product name and branding.
