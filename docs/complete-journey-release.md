# Complete curriculum: production and release record

[Roadmap #36](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/36) · [Integration #46](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/46) · [Progress](progress.md)

## Review order

All five PRs merged to main in the order below on 2026-10-24, ending at `814140e98989c2dfa1a2509033afd2f9ee6bca7e`.
Their complete runtime includes the shared UI and stale-active-save recovery fixes; intermediate regional snapshots are historical.

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

## Production acceptance and final validation (2026-10-24)

The owner confirmed the complete curriculum as production direction and accepted the major review fixes.
The owner published it at https://unformedideas.com/chess-rpg/ and preserved the original at https://unformedideas.com/alpha-chess-rpg/.
Follow-ups #53–62 may wait. This validation did not deploy or replace either live site.
No physical device was available; the owner accepted iPhone 15-sized WebKit emulation as sufficient for this check.
No physical iPhone result is claimed. Native chapter-picker arrow behavior remains a separate verification limitation in #56.

At runtime revision `814140e98989c2dfa1a2509033afd2f9ee6bca7e`:

- `npm run ci` passed type-check, production build, and all 496 tests in 37 files.
- `node scripts/select-curriculum.mjs --verify-shipped` verified all 273 unchanged published sources against the local database.
- Production JavaScript `index-DkDZYZYe.js` matches the local merged build byte for byte: `d6c99c617761853f6434aed59359ca3c0566f59ef760d9997097a0bfd083b0b6` (SHA-256).
- Production CSS `index-CbCH10sF.css` also matches: `1d6dd0e1cec4a97bd08a6cac936aac639303733e7f8d44f70470ebb4c01004a3` (SHA-256).
- Live New Journey, Continue, reload, production save-key selection and disabled region-preview shortcuts passed in isolated browser storage.
- Explicit recovery fixtures passed locally and on production: old two-chapter progress, interrupted/obsolete attempts, rejected-save backup preservation, derived finale repair, unseen ending, replay and reload.
- These fixtures preserved legacy and pilot keys. The copied finale fixture uses historical earned finale progress with preview prerequisites; it is not a fresh journey.
- Fresh desktop Chromium 153 (1280×800, Brave) and WebKit 26.6 (393×852, Gentle) each completed all 35 encounters, 231 solver moves and 105 stars.
- Each route exercised 21 promotion dialogs, including four knight underpromotions. Ending replay, reload and completed-lesson replay preserved completion and stars.
- Desktop replay added one attempt, from 35 to 36. Phone promotion-lesson replay did the same. Neither duplicated completion.
- Both valid routes and replays recorded zero page errors, console errors or failed HTTP responses.
- Phone layouts also covered 375×812, 375×553 and 844×390. Across route and replay, 108 lesson-layout records and 294 animation samples were collected.
- Eighty-four animation samples contained visible feedback. None overlapped board squares or action buttons; sampled advice and actions fit their lesson panels.
- HTML keyboard controls passed. Chapter selection preserved focus and saved changes. Native select arrows remain unverified; even a standalone headed-browser select rejected synthetic arrows.

[Compact validation evidence](verification/merged-main-814140e.json) records the exact runtime and coverage.
Published solutions supplied the move oracle. These runs verify execution and presentation, not measured learning effectiveness.
The desktop harness resumed its normally earned save after correcting a chapter-transition wait. No completion fixtures unlocked either full route.
Both harnesses initially used an incorrect preview subpath; the valid runs used the production preview root.
WebKit used mobile mode, DPR 3 and touchscreen taps. It reported zero maximum touch points despite that configuration.
Real browser chrome, hardware safe-area behavior and physical touch are outside this emulation claim.
Board play remains pointer-based; HTML keyboard coverage does not imply keyboard chess input.

### Deferred presentation finding

The settled promotion dialog is 407px wide at x=-7 in the 393px viewport: its outer border clips by 7px on each side.
All four choices and the title remain visible and usable. This is a cosmetic P3 follow-up, recorded here without changing runtime scope.
Check shared dialog border-box sizing in `src/ui/overlay.css`, including compact portrait and landscape layouts, when addressing it.
This finding is separate from the passing lesson advice/action checks. Existing tall-token overlap remains deferred in #62.

The archived alpha URL returned its distinct `index-DTsMkAvX.js` build without application errors or failed requests during the opening check.
That observation does not claim a full alpha playthrough.

## Release policy (2026-10-24)

The owner retired the legacy battle benchmark as a merge and release gate because new material will replace that campaign.
The historical failures below remain accurate but no longer block this stack.
Current curriculum tests, source verification, code review, and browser checks remain required.
`npm run ci` and `npm run ci -- --full` exclude the retired benchmarks.
Issue #55 later removed those diagnostics. [Legacy retirement](legacy-retirement.md) links their last revision.
The owner later authorized the merges and confirmed production promotion. Staging’s recorded application remains `e473d2a`.

## Historical second review follow-up (2026-10-24)

The regional corrections are `fdf741b` (R3), `bd35714` (R4), `b9b236d` (R5), and `76854cc` (finale table).
The integrated check passes 496 tests in 37 files. All 273 records match the local published database.
Coverage remains 529 solver states, 1,860 recovery round trips and 64 alternative-mate cases.
Independent rechecks verified the new defender, material and shortest-route evidence.

Foe labels now use faction and chess role until matching species artwork exists.
Compact speech cannot cover advice during player input or the completed-example takeaway; desktop retains its separate dialogue space.
Journal jumps use the measured sticky header height. Terminal moves no longer promise an opponent reply.
Focused desktop and phone WebKit checks cover wrong moves, multi-move replies, terminal status, journal offsets and demonstration rotation.
Public deployment evidence follows below. No legacy engine implementation, corpus, or threshold changed in this follow-up.

## Historical review follow-up (2026-10-24)

Application revision `27a3a9c` uses staging bundle `index-DhffRnHC.js`. Publication details follow in the staging record.

- Type-check, build, and 492 tests in 37 files passed. All 273 published records match the local Lichess download.
- Regional fixes correct pin, discovery, defence and underpromotion claims. Mechanism tests check the stated chess decisions.
- Reviews mix their taught skills; Region 4 now assesses file tactics. Region 5 retains its existing lesson unlock order.
- Independent reviewers checked corrected teaching evidence, save recovery, navigation and mobile presentation.
- Current coverage is 529 solver states and ten alternative mates including examples; practice recovery covers 1,860 round trips and 64 alternative-mate cases.
- WebKit at 393×852 completed all seven Region 3 encounters (25 waves, 48 solver moves) and both finale encounters (eight waves, 17 moves).
- Desktop Chromium at 1280×800 completed all seven Region 4 encounters (49 solver moves), including its revised review.
- These runs used the explicit region-preview links. Earlier prerequisites were marked complete by preview mode; they were not replayed.
- Published solutions supplied the move oracle, with real board input. App errors and failed requests were absent.
- The harness initially checked for chapter stories before queued navigation finished. Recovery used earned browser storage; no gameplay state was injected.
- WebKit rotation during the first demonstration move showed later dialogue before the demonstration ended. Phone victory text fit without clipping.
- Additional layouts covered 375×812, 375×553 and 844×390, plus history, classic pieces and reduced motion.
- Four existing landscapes were recompressed at unchanged dimensions: 2,124,970 bytes became 1,663,962 bytes.
- The fresh full `npm run verify:battles` run finished in 1,799.52 seconds: 11 tests passed and one failed. The boss suite passed.
- Its sole failure was trades Brave at 21/24 wins, below 90%. The dedicated fresh-engine repeatability test passed.
- Reproduce with `npm run verify:battles` on application revision `27a3a9c36d456e9ac36abcfe77cb71527023fce5`.
- [Raw full-run output](verification/legacy-full-27a3a9c.log) retains all cells and the failure trace. The run began on the working candidate; its engine files match that revision.
- This full engine stage and the separate 492-test `npm run check` are recorded explicitly; no green full-CI result is claimed.
- At this checkpoint the legacy failure remained a release gate. The owner later retired that gate; thresholds, seeds and results remain unchanged.

## Original integration validation (`1859ee8`)

- Applicable chapter CI passed at each review boundary.
- Each exact committed PR snapshot also passed type-check, build, and tests independently: R3 395, R4 398, R5 407, finale 456.
- Those isolated snapshots used 26, 27, 28, and 29 test files respectively. Earlier workspace counts included concurrently prepared tests.
- All 273 source FENs, move lists, themes, ratings, and quality values match the local Lichess download.
- Independent reviews inspected each new teaching mechanism and prerequisite. The pawn-race exception was moved into required practice before review.
- An independent finale harness passed 175 state scenarios across every difficulty and every final-encounter backup configuration.
- A fresh integrated review independently found 273 unique post-setup boards and checked 529 solver states, including 11 alternative immediate mates.
- At integration revision `1859ee8`, type-check, production build, and 470 tests across 32 files passed.
- Retained tests cover 1,860 playable save round trips and 72 alternative-mate recovery cases across all four help settings.
- Desktop Chromium on Brave difficulty completed all 35 encounters and 119 main positions through normal controls: 105 stars, 37 attempts.
- Touch WebKit Gentle completed the same route at 393×852: 105 stars, 35 attempts, and 231 move inputs.
- Both runs reached the ending, reloaded, replayed the ending, and revisited earlier lessons. Neither reported runtime or HTTP errors.
- Champion and Grandmaster checks covered hidden hints, two-miss defeat, backup retry, and preserved final completion.
- Layout checks covered 1280×800, 393×852, 375×812, 375×553, and 844×390. Advice, promotion, history, and controls remained usable.
- Keyboard navigation, classic pieces, reduced motion, rotation, long conversation history, and exit cancellation passed focused browser checks.
- A brief old-screen flash at the ending exposed mixed immediate and queued scene changes. Navigation now queues cleanup before destination initialization.
- Four retained transition tests cover cleanup order, rapid requests, initialization redirects, and Boot cleanup.
- Independent Chromium and WebKit checks found no overlap after the fix. Legacy and pilot navigation smoke checks also passed.

The full journeys spanned preview builds `index-BDDovceW.js` through `index-DPfxueor.js`, before the final navigation-order fix.
The final `index-BRYWs7pU.js` build received focused desktop, WebKit, and public transition/replay checks, not another full 35-encounter run.
The desktop run includes a harness interruption and recovery replay. The phone run completed without those extra attempts.
Browser playthroughs used published solutions as the move oracle. No save injection unlocked their full routes.
Additional recovery, settings, and public migration checks used explicit copies or fixtures; they are not claimed as fresh full playthroughs.

The original full release baseline finished in 1,942 seconds. Its boss suite passed; its battle suite passed nine of ten tests.
The failing guard cell had 11 flawless wins among 23 Brave wins, below the 50% bar.
The reproducible harness uses a fixed corpus chosen before its results. Its first battle run found Brave trades at 21/24 wins, below 90%.
All three failed games replay legally and run out of moves with material gain three rather than the required four.
The simulated player's short planning horizon does not establish a chess-rule defect. No content, thresholds, or seeds were changed to force a pass.
The final `npm run ci -- --full` completed its engine stage in 1,833.49 seconds: 11 tests passed and one failed.
The Goblin Chief suite passed. Battle checks passed ten of eleven tests, including the new repeatability test.
The only final failure was the same trades Brave cell: 21/24 wins, below 90%.
The command exited 1. Its quick stage passed 465 tests; integration revision `1859ee8` passed the separate 470-test check.
The final UI patch did not change engine inputs or behavior. No full engine result is claimed for a different engine implementation.
At this checkpoint the five PRs remained draft because of these failures. The owner later retired this benchmark gate; see the current policy above.

### Reproduce the retained legacy failure

The default corpus is `pawnshire-legacy-v1`, with 24 battle games per player and difficulty.
Two seeded runs produced the same trades result. The three losing game indices and seeds are:

| Game index | Seed | Result |
| --- | --- | --- |
| 4 | 3271233999 | Out of moves after 10 player moves |
| 5 | 3338491570 | Out of moves after 10 player moves |
| 9 | 3337800022 | Out of moves after 10 player moves |

```sh
VERIFY_BATTLE=r1-trades npx vitest run --config vitest.verify.config.ts scripts/verify/battles.verify.test.ts
```

The failed cell prints complete legal move traces for replay. `knight` is the internal ID for Brave difficulty.
The [reproducibility follow-up](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/42) remains relevant; this release does not waive the failed bar.

## Historical staging deployments

The entries below describe earlier deployment and review checkpoints. Later merge and production decisions supersede their draft-only restrictions.

### Second review follow-up

Current application revision: `e473d2af20ab5f255778533cd2da30ef51f10662`.
Cloudflare version: `b05138a2-f1ac-4615-9148-85f4dea4e49b`.
Public assets: `index-cnoE1bm6.js` and `index-CbCH10sF.css`.

Public WebKit at 393×852 and Chromium at 1280×800 passed the targeted follow-up checks.
Real board input exercised wrong moves, opponent replies, and terminal moves in the Region 3 preview.
Compact dialogue cleared before decisions; desktop retained its separate dialogue space. Terminal moves showed “Good move…” without promising a reply.
Journal targets cleared their measured sticky headers on both layouts.
Phone demonstration rotation to 852×393 preserved later dialogue and cleared it before the completed-example takeaway.
These were seeded region previews, not fresh full journeys or physical-device tests. No application errors or failed requests occurred.
All 11 new inline findings received replies, with a summary on each PR. The PRs remain draft; production was not deployed.
Later documentation-only commits do not change this deployed application.

### Five-PR review follow-up

Previously deployed application revision: `27a3a9c36d456e9ac36abcfe77cb71527023fce5`.
Cloudflare version: `f0243edb-2b70-4a3a-872e-4bb8fb9537e9`.
Public JavaScript `index-DhffRnHC.js` matches the tested local artifact:
`9eae19905f88d174d54ade9c19f68a2efe5537a11d86c8abc4d62c9eb1e93729` (SHA-256).
CSS and all four recompressed landscapes also match byte for byte.

Public WebKit confirmed visible setup advice and dialogue recovery during demonstration rotation, without covering board or actions.
Ending replay and reload passed using a copied, locally earned finale-preview save. This was a focused public check, not a public full journey.
Completed checks reported no application errors or failed requests. An earlier attempt emitted nonblocking report-only CSP notices.
Chapter-picker focus survives selection changes. Native arrow-key selection remains unverified: headless synthetic keys also failed on a minimal static select.
All 65 inline review comments received replies, with broader dispositions on each PR. The PRs remain draft; production was not deployed.
Later documentation-only commits do not change this deployed application.

### Board visibility follow-up

Previously deployed application revision: `a70192ef8bcf69981dbc9b50ebfc3b7b790231c9`.
Cloudflare version: `994caac9-a981-49c5-9aa1-baa51d6b5efd`.
Compact dialogue and capture/check/mate cards cover advice, leaving the board and action buttons clear.
Desktop layouts keep their dedicated dialogue space. Opaque cards prevent text from blending with underlying advice.
Rotation hides feedback until the board finishes its deferred layout rebuild. Dismissal and history remain available.
Type-check, build, and 474 tests across 33 files passed. Independent layout review found no blocker.
Chromium checked four sizes from 375×553 to 1280×800. WebKit checked phone, short-phone, and landscape sizes.
Public Chromium repeated all four sizes; public WebKit repeated both portrait sizes with actual captures.
Frame sampling found no board/action overlap, clipped capture text, or runtime exceptions in those demonstrations.
The final opacity adjustment received another public short-phone WebKit check; its screenshot confirms readable capture text.
WebKit emitted report-only CSP console notices, which did not block resources or gameplay.
These focused UI checks do not replace or change the retained full-journey and legacy-engine results.

### Region shortcut follow-up

Previously deployed application revision: `8f77559e149463c6f1a3811b3d284bcf883f72dd`.
Cloudflare version: `c040abf2-c4e3-417c-ac33-0a3ae09614c1`.
Use `?region=1`–`5` or `?region=finale` for a separate saved preview. Production builds ignore these parameters.
The follow-up passed 474 tests, type-check, build, and independent code review.
Public Chromium checked all six maps at 375×553, settings reload, lesson entry, interrupted reload, and unchanged normal saves.
The earlier full-engine outcome below remains unchanged; this follow-up does not alter engine inputs.

### Original complete-journey publication

Destination: https://unformedideas.com/staging-chess-rpg/.
Verified application revision: `1859ee8ba53913eaa826eb7366755c392563f463`.
Cloudflare version: `b09d67fa-6f5c-4ab3-a9c3-5b49ecb7566b`.
Later documentation-only commits do not change that deployed application.

Public JavaScript `index-BRYWs7pU.js` matches the local staged artifact:
`a8d8ef8054909bb8001d8685ae111570a3b467d2ac978a6e18b777f73d2bd3ec` (SHA-256).
CSS and finale artwork also matched.
The initial public verification used revision `7238891`. All 52 baseline requests succeeded, including three font files.
A fresh public lesson covered example, hint, legal miss, interrupted reload, backup retry, victory, and persistent progress.
Four viewport checks and WebKit touch smoke passed. Reset confirmation removed only the journey save; legacy and pilot sentinels survived.
The final publication at `1859ee8` repeated artifact, fresh-navigation, and Old Brick persistence checks without stale lesson controls or console errors.
An earned desktop save copied into the public profile retained all 35 completions, 105 stars, 37 attempts, and the finale flag.
Changing its companion to Old Brick, replaying the ending, reloading, and replaying again preserved the resulting save bytes exactly.
These were targeted public checks. The two complete normal-UI journeys ran against the local production preview.
At this historical checkpoint, production at `/chess-rpg/` was outside the task. The owner subsequently promoted the curriculum there.

## Production maintenance and rollback

1. The initial stack is merged and production is published. For later changes, review the affected code and retain revision-specific evidence.
2. Run current CI, source checks and affected desktop/phone flows. Legacy benchmark results are historical diagnostics.
3. Record the current production deployment version, candidate Git revision, and backups of progress worth keeping.
4. Use the deployment destination authorized for the new change. Build production mode for production; do not copy a staging bundle.
5. Check production redirects, fonts, artwork, New Journey, Continue, chapter transitions, final completion, and ending replay.
6. For rollback, prefer a known-good build that understands all 35 completion IDs and the finale flag. Recheck its save reader before restoring it.

Staging and production share an origin. Browser storage is shared across their URL paths.
Staging now writes `pawnshire-staging-journey-v1`; production keeps `pawnshire-journey-v1`.
On the first normal staging visit, existing shared progress is copied once if no staging save exists.
Staging play and reset never write or remove production progress. Region shortcuts keep separate `pawnshire-preview-v1:<id>` entries.
The existing legacy campaign uses `gauntlet-save-v1`; the pilot uses `pawnshire-ambush-pilot-v1`. Neither is migrated or erased.
An older two-chapter production reader rejects later lesson IDs. The new staging key prevents future staging visits from causing this mismatch.
The current reader preserves the first rejected raw save under `<journey-key>:recovery`. It repairs derived finale flags and retires obsolete active attempts.
Do not start a new journey after such a rollback if that progress must be recovered. Restore a compatible build or the saved backup first.
New Journey keeps its confirmation when a valid journey exists and resets only its current journey key. Recovery backups and the one-time import marker survive reset.

## What this release does not establish

WebKit touch emulation is not a physical iPhone test. Published-puzzle completion is not evidence of measured rating gains or full-game proficiency.
Opposition, key squares, Lucena, Philidor, sustained conversion, adaptive refreshers, and full games need separate teaching systems.
Wrong-move feedback remains general. Longer review retries can repeat known positions without explaining each incorrect legal move.
Position-specific explanations, including promotion alternatives, and optional post-loss solution review need a separate teaching design beyond #40 and #41.
Armies, powers, economy, faction AI, native iOS packaging, and the post-game gauntlet remain deferred.
