# Region 2: The Kingsroad

[Design overview](../../design.md) · [Campaign](../campaign.md) · [Syllabus](../syllabus.md) · [Story](../story.md) · [Playbook](../../playbook.md)

## Design status

Built and accepted by the owner as part of PR #37. Play the [production journey](https://unformedideas.com/chess-rpg/).
This implementation supersedes the former custom-battle and hired-army spec in #8 and the standalone pilot in #34/#35.

## Lessons and map

| Order | Lesson | Teaching claim |
| --- | --- | --- |
| 1 | A fork in the road | Knight check that attacks another target |
| 2 | Two roads, one queen | Queen check with a second target |
| 3 | Two at once | Discover one check while giving another |
| 4 | Who guards the guard? | Remove a defender before taking its target |
| 5 | One move ahead | Find a forcing mate in two |
| 6 | Ashfang’s reckoning | Recognise taught ideas without theme prompts |

Exact display titles, sources, and coaching are authoritative in `src/game/curriculum.ts` and `curriculumPuzzles.json`.
Five lessons lead in order to Ashfang's four-position review. Normal lessons have three practice positions, an example, and backups.
Clearing Ashfang opens the Shadow Cult chapter. Earlier lessons remain replayable.
The transition into Region 3 preserves existing completion and stars.

## Story and cast

The Bandit Riders steal the old army's banners and charge tolls along The Kingsroad.
Ashfang is smooth, mocking, and interested in coin. Tadwell is a formal, dutiful frog captain, distinct from Sir Hob.
Waymeet and the Broken Wheel remain established place names, without requiring a shop or tavern UI.
Recovering banners advances the story; it does not change the pieces supplied by published positions.
Tadwell can join the travelling cast without hiring, XP, or roster replacement.
The paymaster's crystal leads into the Shadow Cult chapter.
The built chapter ending includes Tadwell, Ashfang, the crystal, and the selected companion.

## Art

The planned faction species remain raccoon pawn, hare knight, magpie bishop, badger rook, stoat queen, and Ashfang the wolf king.
The draft for [#60](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/60) adds matching tokens, portraits, Tadwell, and the Kingsroad map.
See [the art review](../../bandit-art-review.md) for screenshots and checks. This draft has not been deployed.
The same draft now includes Regions 3–5 and the finale. See the [complete art review](../../faction-art-review.md).
Identity text must match the art actually shown; board colors remain distinct from ally/opponent identity.

## Verification and playtest

The accepted two-chapter baseline checked published lines, retries, progression, saves, and phone layouts. Current full-journey evidence lives in [the release record](../../complete-journey-release.md).
Independent code, curriculum, and presentation reviews were addressed; the owner accepted the result.
See [build progress](../../progress.md) for exact evidence and deployments.

## Deferred mechanics

Wanted-poster AI, Scrying Orb, bounty pay, custom sieges, live Ashfang games, and army budgets are outside this chapter's dependency graph.
The [historical Region 2 brief](legacy-region-02-bandit-riders.md) preserves those plans without marking them implemented.
