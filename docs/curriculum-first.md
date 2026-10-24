# Curriculum first: Regions 1 and 2

## Approved direction

The owner approved this direction on 2026-10-23 after completing the Region 2 pilot.
They found it fun, guided, and useful for learning skills that transfer to real chess.
Further human pilot playtests are not a release gate. Wanted presentation can wait.

Build the basic teaching game first. Use published Lichess puzzles throughout its lessons and chapter reviews.
Keep Pawnshire's storybook art, board interaction, companions, and responsive layout.
Defer recruitment, army budgets, faction move rules, paid powers, and live army bosses.
These systems must not delay a complete learning path.

## Presentation belongs in the core journey

The owner approved restoring the earlier game's presentation after playing the two-chapter journey.
Deferring RPG mechanics does not mean removing the characters, celebrations, or painted navigation.

- Keep a painted splash with Continue and New journey. Confirm before replacing saved progress.
- Show the lessons as a winding route across an illustrated map. Sequential progression does not require branching paths.
- Introduce each encounter with short portrait dialogue, then offer the demonstration and practice.
- Let moving pieces react through portrait cards. Keep the selected companion as the lesson's coach.
- Keep a readable conversation history, grouped by example and practice position.
- Celebrate accepted captures, checks, verified forks, double checks, promotions, and mates with accurate banners.
- Use portrait-led victory cards, a brief star reveal, and distinct companion reactions.

Wrong moves that will be taken back receive no tactical celebration. Reviews must not reveal the answer before the move.
Speaking identity follows the puzzle's player color. A companion is not automatically every piece of its type on the board.
Teaching text takes priority over flavor dialogue. Never put a full speaking portrait ahead of advice inside the lesson's scroll area.
On phones, use temporary speech cards and a compact portrait button for history. Keep cards away from teaching text and controls.
On roomy desktops, keep the last speaker in a separate panel. Short landscape screens use the phone treatment.
Check that the full current advice fits without scrolling on iPhone-sized views, including Gentle and the longest lesson text.
Respect reduced motion and cancel presentation work when an encounter ends.
Foiled, goblin shouts, Wanted, faction powers, and gold rewards remain outside this presentation pass.

## Learning scope

This release assumes players know how pieces move. Say so at entry rather than promising an unfinished beginner tutorial.
The companion teaches tactical ideas, while the classic-piece option supports players who prefer standard chess symbols.

This document takes precedence over conflicting earlier campaign, economy, Region, and playbook requirements for the new basic campaign.
Earlier documents remain useful records of the live legacy game and possible later features.
Chess movement rules, source licensing, truthful teaching, and technical validation still apply.

## Checkpoint and reuse

- [Issue #34](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/34) records the pilot decisions, feedback, and handoff.
- [Draft PR #35](https://github.com/avoidthekitchen/chess-rpg-gauntlet/pull/35) preserves the accepted standalone pilot.
- Remote branch `codex/checkpoint-approved-ambush` preserves commit `051ad26` before this campaign expansion.
- Continue on `codex/regions1-2-curriculum`, preserved in [PR #37](https://github.com/avoidthekitchen/chess-rpg-gauntlet/pull/37).
- Preview the completed basic campaign at <https://unformedideas.com/staging-chess-rpg/>.

Reuse the pilot's published-line runner, board, demonstrations, hints, retry rules, and settlement protections.
Adapt its screen to accept lesson content and return to campaign progression.
Replace the standalone purse, roster, and launch controls with a chapter map and saved learning progress.

## Scope and sequence

1. Build one reusable campaign and lesson flow. Keep rules and content free of screen code.
2. Complete Region 1, The Bog: five guided lessons, followed by Grubnak's mixed review.
3. Complete Region 2, The Kingsroad: five guided lessons, followed by Ashfang's mixed review.
4. Review the code independently, exercise the complete journey, and fix clear usability problems.
5. Publish a review PR and deploy staging for the owner's final playthrough.

All five lessons lead to each chapter review. Clearing Grubnak opens The Kingsroad.
Completed lessons remain available for practice and missed stars.
After Ashfang, celebrate completion of these two chapters and allow revisits.
Do not present later Regions as playable before they exist.

Region 1 covers loose pieces, safe captures, answering a check, back-rank mate, and promotion to checkmate.
Region 2 covers knight forks, queen double attacks, double check, removing defenders, and mate in two.
Select published positions that actually show each idea. Narrow a lesson's claim when the available examples teach something more specific.

Safe captures includes the opponent's reply and a recapture. Answering a check shows safe captures of the checking piece.
Those checking positions use `hangingPiece` sources, verified on the actual board; they do not claim to cover every defensive technique.

Each normal lesson has three puzzle waves, a shown example, and a backup for each wave.
Each chapter review has four waves drawn from ideas already taught, with its own example and backups.
Keep review titles and prompts neutral until the solution reveals the tactic.
A review checks recognition, not the ability to follow a displayed theme label.

## Learning and content rules

- Preserve each published position, setup move, solution, and reply. Stop at the published endpoint.
- Store source identity, URL, rating, quality fields, and the reason each position fits its lesson.
- Use ratings to guide selection; a rating is not a promise about a learner's experience.
- Record Lichess credit. Write coaching in our own voice, using real chess terms.
- Demonstrations explain the move and its purpose. Prompts must match the board and solution.
- Never claim every valid chess move is a wrong move. A puzzle asks for its particular winning continuation.
- Accept alternative immediate checkmates when the expected solution mates, as in the pilot.
- Keep legal replays, source metadata, theme fit, and duplicate checks in automated content tests.
- Published puzzle quality does not prove our lesson sequence's educational effectiveness. Describe the owner's feedback accurately.

Lichess Practice remains available for a later technique curriculum.
It is not necessary to add live engine exercises or rewrite those studies to finish this scope.

## Difficulty, rewards, and saves

All difficulties use the same published boards and replies. Difficulty changes the help and allowed misses.

| Difficulty | Misses before retry | Help |
| --- | --- | --- |
| Gentle | Unlimited | Hints and coaching throughout |
| Brave | 3 | Hints and initial coaching |
| Champion | 2 | No in-attempt hints or coaching |
| Grandmaster | 2 | Same puzzle assistance as Champion in this release |

Show the assistance rules plainly when choosing difficulty. Do not imply a stronger engine or different puzzle pool.
The shown example remains optional. A failed attempt can always be retried, including on Grandmaster.
There is no gold loss, permanent lockout, or paid route around a lesson.

Completion, a clean solve, and solving without hints are recorded once per lesson.
Clean and no-hint stars can be earned on later attempts. Replaying never duplicates progress or rewards.
Stars mark practice goals; they never block the next lesson.
There is no shop, recruitment screen, army budget, or paid-power control in this campaign.

Use a separate journey save key. Preserve the legacy campaign and standalone pilot saves without modification.
Continue returns to saved progress; revisits use the same completion record.
Reset names the journey it clears and never clears unrelated saves.
Reloads and exits during moves must settle an attempt consistently, without duplicate credit or blocked progression.

## Acceptance checks

These are planned release checks, not a claim that implementation has passed them.
Record actual results in [build progress](progress.md).

- A fresh player can choose a companion and difficulty, then finish both chapters through normal navigation.
- Every lesson has a demonstration, playable waves, useful feedback, retry, and a route back to the map.
- Both reviews use previously taught ideas without naming the tactic before the player finds it.
- Success, failure, hints, retries, promotion, alternate mates, and repeated completion have rule tests.
- Continue, revisit, reload, reset, chapter unlocks, and attempt exits preserve the correct progress.
- The legacy campaign and pilot saves remain unchanged after a complete new journey.
- Desktop, phone portrait, short-phone, and phone landscape layouts keep the board and actions usable.
- A separate reviewer checks code and teaching claims. Fix critical findings before handoff.
- Run `npm run ci`; retain all selected legacy engine regressions. Published puzzle lessons need no new engine tournaments.
- Complete a deployed staging journey and check browser errors, asset loading, and saved completion.
- The normal production build opens the basic campaign when merged and deployed. This work deploys staging only.

## Deferred work

Recruitment and hired-army purpose, faction AI habits, Scrying Orb and other powers, live boss games, shops, XP, and levels are deferred.
So are expanded library features, adaptive ratings, refresher scheduling, and additional human pilot testing.
Retain useful legacy code, but do not expose unfinished systems as requirements for learning.
Regions 3–5 and the finale follow after this two-chapter foundation is complete.
