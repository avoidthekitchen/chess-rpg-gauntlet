# Region 1: The Bog

[Design overview](../../design.md) · [Campaign](../campaign.md) · [Syllabus](../syllabus.md) · [Story](../story.md) · [Playbook](../../playbook.md)

## Design status

Built and accepted by the owner as part of PR #37. Play the [production journey](https://unformedideas.com/chess-rpg/).
The five lessons and Grubnak's mixed review use unchanged Lichess positions, with a shared lesson runner and separate journey save.

## Lessons and map

| Order | Lesson | Teaching claim |
| --- | --- | --- |
| 1 | Loose at the ferry | Capture loose pieces safely; check the reply |
| 2 | Count before crossing | Count the exchange, including reply and recapture |
| 3 | Keep the crown safe | Answer check by safely capturing the checking piece |
| 4 | No room to run | Recognise back-rank mate |
| 5 | One small step | Promote to give checkmate |
| 6 | Grubnak’s last stand | Recognise the taught ideas in fresh mixed positions |

Complete each lesson to open the next. Grubnak's review opens The Kingsroad.
Every normal lesson has a worked example, three practice positions, and three retry backups.
The review has four positions with backups. Its introduction does not name the tactic.
Source IDs and exact lines live in `src/game/curriculumPuzzles.json`; coaching and lesson definitions live in `src/game/curriculum.ts`.

These lessons do not teach every defensive response, all exchanges, or general pawn-endgame technique.
The claims above describe what the selected positions actually exercise.

## Story and presentation

Goblins have blocked the ferry and roads. Grubnak keeps Saffron in his pantry.
The player frees the crossing, meets Grubnak's challenge, and leaves with Saffron's warning about The Kingsroad.
Preserve the muddy storybook map, goblin portraits, and the selected companion's coaching voice.
Goblin dialogue is flavor; the curriculum has no shouting AI or must-play promise.

## Verification and playtest

The owner accepted the learning direction and phone presentation. Automated source checks cover unchanged positions, legal lines, and teaching fit.
The complete journey was exercised locally and on staging, with independent code, curriculum, and UX reviews.
The phone fix checked full teaching advice at short iPhone viewport sizes in WebKit emulation; no physical-device test is claimed.
See [build progress](../../progress.md) for commit-specific test counts, deployments, and limitations.

## Legacy Region

The original custom battles, shouts, siege, army boss, and engine verification remain documented in [legacy Region 1](legacy-region-01-bog-goblins.md).
That document describes the separate original game, not requirements for the accepted curriculum.
