# Game systems

[Design overview](../design.md) · [Campaign and curriculum](campaign.md) · [Story and characters](story.md)

## Learning journey

Pawnshire teaches tactics through published Lichess puzzles, framed as encounters along a painted route.
The player already knows how pieces move. The entry screen states this and offers a short moves reminder.
All board moves follow ordinary chess rules.

Regions 1–2 each contain five guided lessons; Regions 3–5 each contain six. Each chapter ends with a mixed review.
Each guided lesson has an optional demonstration, three practice waves, and one backup position per wave.
Reviews have four, four, seven, six, and six waves. The finale adds two four-wave encounters. All retain examples and backups.
The current review interface launches the challenge directly, keeping the tactic hidden.
Future Region length follows learning prerequisites; five lessons is not a universal chapter quota.

The selected companion coaches the player. Story portraits, piece reactions, accurate banners, and victory cards belong to the core journey.
Players can choose animal tokens or classic chess pieces.

## Published puzzle runner

`src/game/ambush.ts` runs the line; `src/game/curriculum.ts` supplies lesson definitions and `curriculumPuzzles.json` supplies published puzzles.
Each puzzle records its source identity, URL, rating, quality fields, themes, and a written reason for selection.

- Preserve the source FEN, setup move, solver moves, and replies. Stop at the published endpoint.
- The setup move establishes the puzzle. The player can solve as White or Black.
- Replies follow the published line. Stockfish does not choose the opponent’s moves in these lessons.
- An accepted move advances the line. A legal move outside it is taken back and counts as a miss.
- Illegal moves do not count as misses. Explain that the puzzle asks for its winning continuation, rather than rejecting chess legality.
- Accept another immediate checkmate when the expected move also mates.
- A hint highlights the piece to move, without marking its destination.
- A failed or abandoned attempt can always be retried. Retry starts at position 1 and substitutes the missed wave’s backup.

An attempt commits a solver move and its published reply before their animations.
Completion settles before the victory animation, preventing duplicate credit if callbacks repeat or the player reloads.

## Difficulty and help

Every difficulty uses the same published boards, lines, and replies.
Difficulty changes help and the number of misses allowed in an attempt.

| Difficulty | Misses ending an attempt | Help during guided practice |
| --- | --- | --- |
| Gentle | Unlimited | Hints and coaching throughout |
| Brave | 3 | Hints; coaching in the first wave |
| Champion | 2 | No hints or in-position coaching |
| Grandmaster | 2 | Same puzzle assistance as Champion |

The optional guided demonstration remains available at every difficulty.
Mixed reviews withhold theme-specific coaching before the answer, including on Gentle.
Their prompts ask the player to recognize an idea already taught.

Retries are unlimited on every difficulty. Failed attempts never remove a lesson or deduct gold.
The current journey has no army selection, recruitment, shop, paid power, or live boss prerequisite.
Grubnak and Ashfang host mixed reviews in the story; those reviews are published puzzle encounters.

## Progress, stars, and saves

`src/game/journey.ts` owns unlocks, attempt settlement, and completion records.
Each lesson opens after all preceding lessons are complete. Completed lessons stay available for practice.
Each regional review opens the next destination, through all five Regions.
The first Lich King encounter opens the second. Actual checkmate in the final encounter saves finale completion and opens the ending.
Earlier lessons and the ending remain replayable. Stars, help settings, and perfect play never gate progress.

Each lesson has three practice goals:

| Star | Earned by |
| --- | --- |
| Finished | Complete every wave |
| No misses | Complete an attempt without a miss |
| No hints | Complete an attempt without using a hint |

Stars are recorded once and can be improved on later attempts. Replays never remove an earned star.
Only completion opens the next lesson; the other stars never gate progress.

`src/journeySave.ts` uses `pawnshire-journey-v1` in production and `pawnshire-staging-journey-v1` on staging.
Staging copies old shared progress once, then never changes the production key. Region previews remain separate.
A rejected raw save is retained under the active key’s `:recovery` suffix before replacement.
It validates progress and reconstructs the active board from the published line rather than trusting stored FEN.
Reloading an unfinished attempt settles it as interrupted; an accepted victory remains a victory.
Continue restores progress. Starting a new journey confirms replacement and clears only that journey.
Legacy campaign and standalone pilot saves remain separate and unchanged.

## Presentation and truthful feedback

Keep the full current advice visible without scrolling when the learner first chooses a move, including Gentle and the longest lesson text.
Compact speech clears whenever the player can choose a move or read a completed example. All lines remain in history.
Temporary portrait speech stays outside the lesson’s scrolling content. On compact screens it overlays advice, leaving board squares and action buttons clear.
During demonstrations and move feedback, temporary speech may cover advice for 3.2–9 seconds, ending sooner when dismissed or replaced.
The advice returns automatically; no tap is required to reveal it. This compact-screen exception prioritizes visible piece movement.
Roomy desktops retain the last speaker in a separate panel; phones and short landscape screens use temporary cards.
The 44px portrait button opens a conversation history grouped by example and practice position.

Celebrate accepted captures, checks, verified forks, double checks, promotions, and checkmates.
Wrong moves being taken back receive no tactical celebration.
A source tag alone does not prove that the current move deserves a banner.
Fork cues use reviewed source moves plus a board check in `src/ui/coursePresentation.ts`.
They do not reuse the legacy live-battle engine confirmation or pay gold.

Speaking identity follows the puzzle’s player color.
A generic moving piece does not inherit the chosen companion’s name merely by sharing its type.
Use the [voice guide](story.md#voice-and-dialogue), respect reduced motion, and cancel presentation work on encounter exit.

## Future technique practice

The [syllabus](syllabus.md) and [Region 3 brief](regions/region-03-shadow-cult.md) plan later teaching.
They do not describe shipped lessons.

Lichess Practice is a source for a future dedicated technique capability, such as mating methods and endgame procedures.
Published tactical lines alone do not teach every valid continuation of those methods.
Technique practice needs its own exercise contract, completion checks, and tests before a Region can rely on it.
Record the study and chapter, credit Lichess, and write coaching in Pawnshire’s voice.
The retained legacy academy is useful reference code; it is not that completed curriculum capability.

## Tuning values

These are current journey values. Source data and tests remain the authority for shipped content.
Ratings guide selection; they do not promise how difficult a position feels to a learner.

| Value | Current setting | Set or checked in |
| --- | --- | --- |
| Built chapters | 5 Regions with 5, 5, 6, 6, 6 guided lessons and one review each; finale has two encounters | `COURSE_REGIONS`, `COURSE_LESSONS` in `src/game/curriculum.ts` |
| Guided practice | 3 waves; 1 demonstration and 1 backup per wave | `curriculum.ts`, `curriculum.test.ts` |
| Chapter review | 4, 4, 7, 6, 6 waves; finale 4 + 4; each has its own example and backups | `curriculum.ts`, `curriculum.test.ts` |
| Distinct published positions | 273 across examples, main waves, and backups | `src/game/curriculum.test.ts` |
| Solver moves per position | 1–3 after the setup move | `curriculum.test.ts` |
| Selected rating bounds | 400–1300 | `curriculum.test.ts`, `scripts/select-curriculum.mjs` |
| Main/backup rating difference | At most 200 | `curriculum.test.ts` |
| Source quality | Rating deviation ≤90; popularity ≥85; plays ≥300 | `curriculum.test.ts`, `select-curriculum.mjs` |
| Miss limits | Gentle unlimited; Brave 3; Champion and Grandmaster 2 | `AMBUSH_HELP` in `src/game/ambush.ts` |
| Retries | Unlimited on every difficulty | `beginJourneyLesson` in `src/game/journey.ts` |
| Practice goals | Completion, no misses, no hints; recorded once per lesson | `settleJourney` in `journey.ts` |
| Gold reward | 0; no gold bonuses | `COURSE_LESSONS` in `curriculum.ts` |
| Speech reading time | 1.2s + 60ms per character, clamped to 3.2–9s | `holdMs` in `src/ui/dialogue.ts` |
| History capacity | Last 120 lines per encounter | `CourseDialogueLog` in `src/ui/coursePresentation.ts` |
| History portrait button | At least 44×44 CSS pixels | `src/ui/coursePresentation.css` |

### Legacy tuning and deferred systems

The [legacy systems archive](legacy-systems.md#tuning-values) preserves army prices, boss budgets, gold, rewinds, engine strength, and pilot values.
Those numbers belong to retained legacy modes or deferred proposals, not the current journey.
The standalone pilot’s four waves, purse, paid rewards, and Grandmaster removal rule do not apply here.
Recruitment, faction AI habits, paid powers, live army bosses, adaptive ratings, and refresher scheduling remain deferred.
The archive preserves their rationale without making them requirements for new curriculum Regions.
