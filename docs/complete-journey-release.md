# First complete journey: review and release record

[Roadmap #36](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/36) · [Integration #46](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/46) · [Progress](progress.md)

## Review order

The pull requests are stacked. Review and merge from top to bottom; each comparison contains its own chapter or integration changes.

| Work | Issue | Review |
| --- | --- | --- |
| Shadow Cult | #39 | [PR #47](https://github.com/avoidthekitchen/chess-rpg-gauntlet/pull/47) |
| Iron Legion | #43 | [PR #48](https://github.com/avoidthekitchen/chess-rpg-gauntlet/pull/48) |
| Bone Wardens | #44 | [PR #49](https://github.com/avoidthekitchen/chess-rpg-gauntlet/pull/49) |
| Lich King finale | #45 | [PR #50](https://github.com/avoidthekitchen/chess-rpg-gauntlet/pull/50) |
| Whole journey and release evidence | #46 | [PR #51](https://github.com/avoidthekitchen/chess-rpg-gauntlet/pull/51) |

The complete curriculum has 28 guided lessons, five regional reviews, and two finale encounters: 35 encounters and 273 distinct published positions.
All earlier source positions and completion IDs remain unchanged. Stars and help settings never gate the story.
Four new painted landscapes distinguish the Cult, Legion, Wardens, and keep. Dedicated faction portraits remain future work.

## Validation record

- Chapter CI passed at each review boundary: R3, R4, R5, and finale. Finale CI passed 456 tests across 29 files.
- All 273 source FENs, move lists, themes, ratings, and quality values match the local Lichess download.
- Independent reviews inspected each new teaching mechanism and prerequisite. The pawn-race exception was moved into required practice before review.
- An independent finale harness passed 175 state scenarios across every difficulty and every final-encounter backup configuration.
- A fresh integrated review independently found 273 unique post-setup boards and checked 529 solver states, including 11 alternative immediate mates.
- Final type-check, production build, and 470 tests across 32 files passed.
- Retained tests cover 1,860 playable save round trips and 72 alternative-mate recovery cases across all four help settings.
- Desktop Chromium Brave completed all 35 encounters and 119 main positions through normal controls: 105 stars, 37 attempts.
- Touch WebKit Gentle completed the same route at 393×852: 105 stars, 35 attempts, and 231 move inputs.
- Both runs reached the ending, reloaded, replayed the ending, and revisited earlier lessons. Neither reported runtime or HTTP errors.
- Champion and Grandmaster checks covered hidden hints, two-miss defeat, backup retry, and preserved final completion.
- Layout checks covered 1280×800, 393×852, 375×812, 375×553, and 844×390. Advice, promotion, history, and controls remained usable.
- Keyboard navigation, classic pieces, reduced motion, rotation, long conversation history, and exit cancellation passed focused browser checks.
- A brief old-screen flash at the ending exposed mixed immediate and queued scene changes. Navigation now queues cleanup before destination initialization.
- Four retained transition tests cover cleanup order, rapid requests, initialization redirects, and Boot cleanup.
- Independent Chromium and WebKit checks found no overlap after the fix. Legacy and pilot navigation smoke checks also passed.

The desktop run includes a harness interruption and recovery replay. The phone run completed without those extra attempts.
Browser playthroughs used published solutions as the move oracle. No save injection unlocked their full routes.
Additional recovery, settings, and public migration checks used explicit copies or fixtures; they are not claimed as fresh full playthroughs.

The original full release baseline finished in 1,942 seconds. Its boss suite passed; its battle suite passed nine of ten tests.
The failing guard cell had 11 flawless wins among 23 Brave wins, below the 50% bar.
The reproducible harness uses a fixed corpus chosen before its results. Its first battle run found Brave trades at 21/24 wins, below 90%.
All three failed games replay legally and run out of moves with material gain three rather than the required four.
The simulated player's short planning horizon does not establish a chess-rule defect. No content, thresholds, or seeds were changed to force a pass.
The final full integration run is pending. These failures are not waived by earlier release decisions.

## Staging

Destination: https://unformedideas.com/staging-chess-rpg/.
The complete integration revision and Cloudflare deployment version will be recorded after publication and public checks.
Production at `/chess-rpg/` is outside this task.

## Future promotion and rollback

1. Review the stacked changes and resolve or explicitly disposition the recorded legacy release failures. Retain their evidence.
2. Run applicable CI and the full release regression on the chosen revision. Verify staging on desktop and a physical iPhone before claiming device coverage.
3. Record the current production deployment version, candidate Git revision, and a backup of any preview journey worth keeping.
4. Obtain the separately required production release decision. Only then run the production deployment command.
5. Check production redirects, fonts, artwork, New Journey, Continue, chapter transitions, final completion, and ending replay.
6. For rollback, prefer a known-good build that understands all 35 completion IDs and the finale flag. Recheck its save reader before restoring it.

Staging and production share an origin. Browser storage is shared across their URL paths.
The chosen behavior carries `pawnshire-journey-v1` progress from preview into the complete production journey.
The existing legacy campaign uses `gauntlet-save-v1`; the pilot uses `pawnshire-ambush-pilot-v1`. Neither is migrated or erased.
An older two-chapter journey reader rejects saves containing later lesson IDs. It leaves the raw entry intact until a new journey overwrites it.
Do not start a new journey after such a rollback if that progress must be recovered. Restore a compatible build or the saved backup first.
New Journey keeps its confirmation when a valid journey exists and resets only the journey key.

## What this release does not establish

WebKit touch emulation is not a physical iPhone test. Published-puzzle completion is not evidence of measured rating gains or full-game proficiency.
Opposition, key squares, Lucena, Philidor, sustained conversion, adaptive refreshers, and full games need separate teaching systems.
Armies, powers, economy, faction AI, native iOS packaging, and the post-game gauntlet remain deferred.
