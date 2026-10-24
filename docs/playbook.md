# Playbook: building a Region

[Design overview](design.md) · [Region template](design/regions/region-template.md) · [Syllabus](design/syllabus.md) · [Build progress](progress.md)

Build a clear learning path from unchanged published Lichess puzzles, with Pawnshire’s storybook presentation.
Regions 1 and 2 provide the built examples: five guided lessons followed by a mixed review in each.
Future chapters follow teaching prerequisites; they need not repeat that exact lesson count.

The [curriculum-first direction](curriculum-first.md) records the approved scope.
Armies, gold, recruitment, faction AI, paid powers, and live bosses are deferred.
The [legacy playbook](legacy-playbook.md) preserves their earlier content workflow.
Retained engine battles still meet the regression bars below.

## Order of work

1. Fill the [Region template](design/regions/region-template.md) with prerequisites, teaching claims, lessons, review coverage, sources, story, and validation.
2. Check the sequence against the [syllabus](design/syllabus.md), [names](design/glossary.md), and [voice guide](design/story.md#voice-and-dialogue).
3. Curate source positions and replays. Record source identity, quality fields, and the board evidence behind each teaching claim.
4. Put new rules in `src/game` with unit tests before content uses them. Keep screen code outside `src/game`.
5. Write demonstrations, prompts, feedback, and chapter review text. Preserve the painted route, portraits, and companion voices.
6. Test rules, source lines, progression, save isolation, and presentation. Have a fresh reviewer inspect code and teaching claims.
7. Complete browser checks and CI, open a review PR, deploy staging, and check the deployed journey. Record actual results.

The owner approved proceeding with judgment on the basic curriculum; another design approval or human pilot is not a release gate.
Record unsettled design calls in [decisions](design/decisions.md), with an open TODO when the owner must decide.
Work in small, reviewable steps and log material changes in [build progress](progress.md).

## Lesson content rules

`src/game/curriculum.ts` defines lessons. `src/game/curriculumPuzzles.json` stores their published positions and metadata.
Use the shared runner in `src/game/ambush.ts` for tactical lines.

- Preserve each published FEN, setup move, solution, and reply. Stop at the source endpoint.
- Each current guided lesson has one optional example, three waves, and one backup per wave.
- Each current chapter review has four waves drawn from taught ideas, its own example in content, and backups.
- A source contains 1–3 solver moves after setup. Choose positions that show the exact lesson, not just its tag.
- Preserve source id, URL, rating, themes, rating deviation, popularity, plays, and the reason it belongs.
- Apply the [current quality and rating checks](design/systems.md#tuning-values). Do not copy the standalone pilot’s tighter rating limits.
- Reserve unique ids across examples, main waves, and backups, and exclude existing bounty overlaps.
- Write coaching in our own voice using real chess terms. Give both a move and its purpose in demonstrations.
- Narrow broad claims to the source boards. “Answer a check” currently teaches safe captures of checking pieces, not every check defence.
- Show useful feedback for an unexpected legal move without implying that the move is illegal chess.
- Accept another immediate checkmate when the expected move mates.
- Credit Lichess. A published quality score does not establish the educational effectiveness of our sequence.

`src/game/curriculum.test.ts` checks legality, solution replays, metadata, uniqueness, teaching fit, and completion through main and backup waves.
`node scripts/select-curriculum.mjs --verify-shipped` can compare shipped puzzle fields with the local source download.
That source check requires `data/raw/lichess_db_puzzle.csv.zst`; never commit raw downloads.

## Map rules

Each lesson opens after every earlier lesson is complete. Completed encounters remain available for practice and missed stars.
Each Region ends with a mixed review of taught skills. Finishing that review opens the next built Region.
Stars mark completion, no misses, and no hints; only completion gates the route.

The current journey reaches the Bone Wardens’ review. The Lich King capstone remains unbuilt.
Region briefs distinguish implemented content from pending browser and release checks.

Keep the winding painted route and short story encounters.
A chief may host a review without becoming a live engine duel or requiring an army budget.

## Mixed reviews

A review checks recognition of previously taught ideas.
Do not name the tactic in the title, prompt, companion coaching, or another answer-revealing label before the move.
Keep generic checks, captures, and threats guidance truthful.
Show a tactic banner only after an accepted move demonstrates it.
The current review interface enters the challenge directly; its stored example is not a prerequisite.

Check the full review set, including backups, for coverage of taught ideas and misleading hints.
A theme tag is useful selection metadata, not proof that the solver performs that tactic.

## Future technique practice

The [syllabus](design/syllabus.md) may call for Lichess Practice techniques that cannot fit a short published tactical line.
Plan those exercises separately: source study and chapter, technique goal, accepted continuations, feedback, and completion checks.
The required technique capability is future work, distinct from the current tactical runner.
Retained academy exercises are reference code, not proof that the future curriculum capability is complete.
Do not force a technique into a single answer line or substitute custom tactical positions without an approved design change.

## Verification bars

Every new rule gets a test. Published lessons need legal replays, teaching-fit checks, and journey integration checks.
They do not need new simulated-player engine tournaments.

Verify these current behaviors:

- Demonstration, setup, correct solver moves, published replies, wrong moves, hints, promotions, and alternate immediate mates.
- Miss limits and unlimited retries on every difficulty, including Grandmaster.
- Retry begins at position 1 and changes the failed wave to its backup.
- Sequential unlocks, both chapter reviews, completion, later star improvements, and repeated completion without duplicate credit.
- Continue, revisit, reset confirmation, invalid saves, reload, and exits during setup, replies, celebrations, and victory animations.
- Exactly-once attempt settlement before animations; an accepted victory survives interruption.
- Journey reset and play leave legacy campaign and pilot saves unchanged.
- Truthful banners, player-color speaking identity, companion identity, reduced motion, and cancellation after exit.

### Legacy engine regressions

Keep the existing selector and all retained engine checks intact.
`npm run verify:battles` exercises custom battles and the legacy boss with real enemy AI and simulated players in `scripts/verify/`.
These checks can take 15 minutes or more; `npm run ci` selects them by changed dependencies.

For a retained custom battle:

- A strong player wins at least 90% on Gentle and Brave, earning each bonus in at least half its wins.
- A careless player, choosing randomly from a shallow search’s top five, wins at most 40%.
- Read the average-move report: the design target is 4–7 moves. The test reports this without enforcing it.
- Every win ends for a reason that fits the goal; a material battle must not award a win for a draw.

For the legacy boss, test each starter’s typical army at the budget.
A strong player loses, including draws, at most 15% and wins at least 60%.
Games reaching the simulator’s 80-move cap count as unfinished. Report the greedy player’s rate too.
Faction habits must be modeled in the simulated enemy’s replies; the strong player must not depend on a forced reply.
The [legacy playbook](legacy-playbook.md) preserves custom battle and warm-up authoring rules.

## CI before a PR and release

Run `npm run ci` before each PR. Keep the existing checks before each commit too.
It runs type-check, build, and unit tests through `npm run check`, then selected engine regressions.
The selector follows each check’s imports and includes changed dependencies across the branch.
A screen or documentation change may skip engine work; a shared dependency change may select it.
`npm run ci -- --plan` reports what would run and why. Do not weaken selection to avoid legacy checks.

Run `npm run ci -- --full` before a Region ships, and when a rule changes how battles end.
Published lesson content does not remove this full-suite release requirement.
Record the command and actual outcome; a planned check is not a pass.

## Browser and mobile checks

Check the affected flow at all four viewports, including Gentle and the longest current advice.

| Viewport | Check |
| --- | --- |
| 1280×800 | Board beside lesson controls; last speaker in a separate panel |
| 375×812 | Full current advice visible without scrolling; temporary speech and 44px history button |
| 375×553 | Full advice and main controls fit the short phone viewport |
| 844×390 | Landscape layout keeps the board, advice, and controls usable; temporary speech |

Temporary speech must be outside lesson scroll content and must not cover teaching text or actions.
Do not put a large portrait ahead of the advice, hide text behind a tap, or truncate current advice.
The history button needs a 44×44 CSS pixel target and an accessible name.
Keep long history scrollable while its heading and close control remain visible.
Check keyboard access, classic pieces, reduced motion, rotations, and repeated entry and exit.

Use `?loop=timeout` in development when automated checks need a background game loop.
Use `goTo()` for navigation and check for console errors or scenes left running underneath another.
Exercise normal UI navigation as well as any automated fixture or direct scene launch.

Report browser evidence accurately. A resized desktop viewport is a layout check, not an iPhone Safari test.
WebKit with iPhone-style viewport, touch, and device settings is emulation, not a physical-device run.
Name the browser, settings, and limitations in the record; claim a real iPhone check only when one happened.

## Review

After content and code are ready, use an independent reviewer who did not write them.
A fresh reviewer subagent is allowed for this check.
Focus on stale async work, duplicate progress, save isolation, false teaching claims, answer leakage, and phone layouts.
Fix critical findings and record remaining issues in the Region’s progress entry.
Keep the owner’s pilot feedback separate from automated evidence and do not invent further playtests.

## Deploy and live check

`npm run deploy:staging` builds and deploys the journey at https://unformedideas.com/staging-chess-rpg/.
`npm run deploy` targets production at https://unformedideas.com/chess-rpg/; use the destination authorized for the work.
See [Technical design](design/technical.md#tech-stack-and-deployment) for staging paths and deployment details.

On the deployed destination:

- Confirm the path without its trailing slash redirects to the path with it.
- Confirm art, fonts, and published lesson data load without browser errors.
- Start or continue a journey, solve lessons and reviews, and check progress after reload.
- Check desktop, portrait phone, short phone, and landscape layouts.
- Confirm build-only pilot and legacy entry modes are absent from the production build.

For work that affects retained engine modes, also verify the `.wasm` loads and Stockfish answers in the development legacy mode.
The current journey’s published reply does not prove that Stockfish works.

## Records

- **Region document:** status, prerequisites, source coverage, verification evidence, and actual playtest feedback.
- **Build progress:** what changed, what passed, what was simplified, and remaining issues.
- **Decisions:** settled design calls and unresolved owner questions.
- **Tuning values:** current values and source locations in the [systems table](design/systems.md#tuning-values).
- **Names and voice:** new terms in the [glossary](design/glossary.md) and character guidance in [story](design/story.md).

Never commit `data/raw/`, `art/raw/`, `dist/`, or `dist-worker/`. Keep generated staging outputs local too.
