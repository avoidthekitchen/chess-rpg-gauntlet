# Build progress

## 2026-10-24 — First complete journey integration (#46)

The complete review build has 35 encounters, 28 learned journal ideas, and 273 distinct published sources.
See the [release record](complete-journey-release.md) for stacked PRs, validation, staging, and future save-compatible rollback.

- A fresh independent reviewer checked 529 solver states, 1,860 save round trips, and 72 alternate-mate recovery cases. No critical code finding remained.
- Corrected a misleading retry promise: repeated failure uses the same backup, rather than promising a fresh board every time.
- A real browser check found the completed-example takeaway clipped at 375×553. It now replaces the redundant demonstration advice.
- The existing demonstration remains in conversation history. Main practice advice and the fixed 44px controls are preserved.
- Final `npm run check` passed type-check, build, and 470 tests across 32 files.
- Full `npm run ci -- --full` completed: boss passed; battles passed ten of eleven tests, including repeatability. Its engine stage took 1,833.49 seconds.
- The full command exited 1 for trades Brave wins: 21/24 (87.5%), below 90%. No other final engine test failed; this gate remains unwaived.
- The original full baseline finished: boss passed, battles passed nine of ten tests, with guard Brave flawless 11/23 below 50%.
- The regression harness now seeds both shout planning and enemy choices. Game identities survive pool/filter changes; failed cells print replay traces.
- Thresholds, sample sizes, content, and simulator heuristics are unchanged. The first seeded battle run exposed trades Brave 21/24, below 90%.
- Desktop Chromium on Brave difficulty and iPhone-sized WebKit on Gentle completed all 35 encounters and 119 main positions through normal UI controls, earning 105 stars each.
- All four help settings, five viewport sizes, keyboard controls, rotation, classic pieces, and reduced motion passed focused checks.
- Fixed a brief transition flash by queuing outgoing cleanup before the next scene initializes. Four regression tests and independent browser checks passed.
- Initial staging revision `7238891` passed public font, lesson, save, reset, viewport, and WebKit touch checks.
- Final staging revision `1859ee8` passed repeated artifact matching, fresh navigation cleanup, and Old Brick ending/persistence checks.
- Full journeys preceded the final navigation fix. The final build received focused desktop, WebKit, and public rechecks.
- Exact isolated PR snapshots also passed: R3 395 tests, R4 398, R5 407, finale 456. Earlier workspace totals included concurrently prepared tests.


## 2026-10-24 — Lich King finale (#45)

- Two direct four-wave mixed encounters use 18 fresh published sources. No new required technique enters through a backup.
- Both final variants end in actual legal checkmate. A short interlude separates the two tables.
- An explicit saved completion flag opens the ending and credits. Acceptance is saved before animation; reload cannot revoke a won finale.
- Completion alone unlocks the ending. Earlier lessons, earned stars, the journal, and ending replay remain available.
- The selected companion appears in the interlude and ending. Maps label this destination Finale, without a sixth teaching chapter or placeholder horizon.
- All 273 journey sources match the local Lichess download exactly. Final source metadata, mechanisms, and prerequisites passed independent review.
- `npm run ci`: type-check, build, and 456 tests passed across 29 files. The unchanged legacy dependency graph selected no engine checks.
- A separate reviewer passed 175 state scenarios across all four difficulties and every finale backup configuration.
- Full desktop Brave and WebKit phone Gentle runs continue on this complete build. Public deployment and final browser evidence follow in integration.
- The full legacy baseline remains a separate failed release check: guard Brave flawless wins were 11/23, below 50%; boss results are pending.
  No threshold was weakened. The prior boss waiver is not reused.


## 2026-10-24 — Region 5: Bone Wardens (#44)

- Added six lessons and a six-wave review using 55 unchanged published sources; the registered journey now contains 255 distinct positions.
- Added the keep landscape, watchful faction voices and a replayable ending that opens the keep’s gate. The chosen companion remains the coach.
- Independent Astra review matched all 55 source records and their mechanisms. Applied P2: kf9cP is wave 3 main, teaching opponent-first promotion before review.
- Added regression coverage for that teaching order, registry integration, chapter ending and honest faction identities.
- `npm run ci` passes: type-check, production build and 407 tests in 28 files. Both engine groups are skipped by the unchanged dependency selector.
- Full release regressions remain pending. The retained baseline reproduced r1-guard Brave’s bonus-rate failure: 11/23 wins, below 50%; #42 tracks investigation.
- Full normal-UI browser runs, all four viewports and staging checks remain pending. No production release is claimed.


## 2026-10-24 — Region 4: Iron Legion (#43)

- Added six lessons and General Flint’s six-wave review, using 55 unchanged sources.
- Independent Astra review inspected every board, line, main/backup pair, and teaching statement. No false chess claim was found.
- Added concrete immediate-recapture counterfactuals after review requested stronger intermediate-move regression evidence.
- General Flint returns the Legion’s banners. Scouts point toward the Bone Wardens; the chosen companion remains the coach.
- Added the Iron March landscape and chapter voices. Source-driven limits exclude overload and broad positional mastery.
- Full normal-UI desktop and WebKit runs continue alongside integration. Legacy regression reliability remains tracked separately.


## 2026-10-24 — Region 3: Shadow Cult (#39)

- Six focused lessons and a seven-wave mixed review add 57 unchanged Lichess sources.
- Independent Astra review matched every source field and checked every teaching mechanism, including backups.
- Pin escape covers capturing the pinning attacker. Wider escape methods remain unclaimed.
- Maps and progress totals now follow registered chapters. Old version-1 saves retain completion and stars.
- Added a compact chapter picker, replayable chapter endings, Cult dialogue, and an illustrated Cult landscape.
- `npm run ci` passed: type-check, build, and 405 tests at that checkpoint, including concurrently prepared content tests.
- Independent Chromium checks at 375×553 and 844×390 showed complete current advice and 44×44 history targets.
- Full baseline regression was started before implementation. Legacy `r1-guard` failed its Brave flawless bonus: 11/23 wins, below 50%.
- Boss checks were still running at this checkpoint. No threshold was lowered and no legacy waiver was assumed.
- Complete normal-UI desktop/WebKit runs and public staging verification continue in the integration record.


One entry per build step. The latest entry follows the [curriculum-first scope](curriculum-first.md); older entries preserve historical decisions.

## Reconciled foundation and Region 3 handoff

Built on 2026-10-24 after the owner approved the curriculum, presentation, story preservation, and backlog cleanup.

- Merged main `661bf0a` into the feature branch at `33a842b`, preserving its legacy shout, AI, and battle changes.
- Replaced contradictory active design, systems, campaign, playbook, and Region documents. Historical plans remain in labeled archives.
- Preserved companions, faction voices, the Lich King arc, and story allies without recruitment or power dependencies.
- Added a prerequisite-based syllabus and a concrete Shadow Cult brief. Source selection and implementation remain future work.
- Independent review identified the six-node map limit and hidden review examples. The Region 3 brief now handles both explicitly.
- Roadmap #36 now follows the accepted journey. #39 is Region 3, #40 is technique support, and #41 is spaced/repeated practice.
- Optional faction art stays in #10. Wanted AI (#12) and Scrying Orb (#13) are deferred and unblocking.
- Delivery issues close after merge as completed or superseded; old requirements are not falsely marked implemented.

**Integration evidence**

- TypeScript, production build, and all 272 tests across 24 files passed on the combined source at `33a842b`.
- WebKit iPhone emulation rechecked all ten guided lessons at 375×553 and 393×696, including wrong moves and replies. No runtime errors.
- An independent reviewer found no code integration blocker. The reconciled Markdown links and anchors resolve.
- `diff -qr dist dist-staging` found no differences. The merged production build matches the already deployed staging artifact.
- Staging remains version `d05d9914-c852-4e37-bba9-19039c4bbc93`; production was not deployed.

**Legacy verification exception — explicit owner direction**

`npm run ci -- --full` started at the merged source. The legacy battle suite reported one failed assertion:
Swap Meet on Gentle won 21/24 competent games (87.5%), below its unchanged 90% bar. The other nine battle tests passed.
The owner then explicitly approved skipping the remaining legacy boss verification because the new journey replaces those encounters.
The runner was stopped with exit 143. This full-CI command did not pass, and the boss result is not claimed.

One enlarged diagnostic ran before that waiver:
`VERIFY_BATTLE=r1-trades VERIFY_GAMES=96 VERIFY_ENGINES=4 VERIFY_SHOW=1 npx vitest run --config vitest.verify.config.ts scripts/verify/battles.verify.test.ts`.
It passed unchanged assertions: competent 91/96 Gentle and 89/96 Brave; careless 12/96 and 2/96.
Quick bonuses were 81/91 and 73/89, and no-rewind bonuses were 100%.

The battle definition, AI, and simulator match main. The reachable branch difference avoids formatting history just to count plies.
A deterministic comparison found identical behavior across 6,858 operations, 1,702 rewinds, and 13,729 state checks.
All 12 diagnostic loss traces also replayed identically under both implementations, across 233 plies.
These results support sampling variability rather than an integration regression; they do not prove the true win rate.
[Issue #42](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/42) tracks reproducible RNG and failure diagnostics.
No battle content, thresholds, or CI selection were weakened. The boss waiver applies to this merge; retained checks remain available.

## Phone teaching space corrected (#34)

The owner’s iPhone screenshot exposed clipped portraits and teaching advice below the scroll area.
Earlier viewport checks missed this regression. The lesson now gives teaching text priority.

- Removed full speaker portraits from the lesson scroll area. Current advice precedes feedback, hints, and controls.
- Phones show temporary speech over the board, with a dismiss button and a compact portrait button for history.
- Roomy desktop layouts keep a separate speaker panel. Short landscape screens use temporary speech.
- Speech timing survives ordinary HUD updates. Leaving a lesson cancels the timer and removes its layer.
- No puzzle content, chess rules, progression, or help budgets changed.

**Validation**

- TypeScript, production build, and all 225 tests pass. Five new tests cover speech timing and guidance selection.
- WebKit with iPhone 15 touch emulation checked all ten guided lessons at 375×553 and 393×696.
- The complete advice fit without scrolling. Wrong moves, replies, hints, demonstrations, expiry, history, and exit also passed.
- An independent reviewer checked desktop, landscape, and phone layouts, focus, dismissal, resize, and cleanup. No blockers remain.
- Public staging passed the same lesson’s touch move, reply, hint, expiry, and history checks at both phone sizes.
- The final public run had no runtime errors, failed requests, or HTTP errors. WebKit logged report-only CSP diagnostics.
- These are browser emulation checks, not tests on a physical iPhone.
- The CI dependency planner found no engine-suite dependencies changed since the full run at `4624cdf`.

**Deployment**

[Play staging](https://unformedideas.com/staging-chess-rpg/). Deployment version: `d05d9914-c852-4e37-bba9-19039c4bbc93`.
The fix is included in [PR #37](https://github.com/avoidthekitchen/chess-rpg-gauntlet/pull/37).

## Storybook presentation restored (#34)

Built on 2026-10-23 after the owner approved restoring the earlier game's personality around the published curriculum.

- Restored Continue/New journey, the painted sequential route, portrait introductions, talking pieces, conversation history, and accurate move banners.
- Added companion victory portraits, new-star reveals, and distinct reactions. Existing art and board animations are reused.
- Capture, check, double check, promotion, mate, and reviewed forks celebrate accepted moves only. Incorrect attempts receive encouragement.
- Fork cues require a curated published move and actual targets. Both solver colors use the correct ally and opponent identities.
- Piece dialogue remains visible beside permitted advice. Mixed reviews keep neutral introductions and their direct challenge entry.
- History labels distinguish examples, attempts, and positions. Its close button stays visible while the conversation scrolls.
- Short phones receive more advice space and an expanded result card. Tablet maps use the tall route so outer labels fit.
- New journey confirms before clearing the curriculum save. Earlier campaign and pilot saves remain separate.
- No puzzle lines, game rules, difficulty budgets, progression, or rewards changed. No army, power, shout, Wanted, or Foiled mechanics returned.

**Validation**

- Separate adversarial code review cleared the final changes after fixes to accessible star state and tablet map clipping.
- Separate visual review exercised a complete lesson on phone, landscape, and desktop layouts. Its final recheck cleared map, history, results, and visible short-phone dialogue.
- A full browser run completed all 12 encounters and 10 demonstrations through actual board clicks at four viewport sizes.
- That run included a hint and miss, earned the expected 34 stars, and preserved progress after reload without runtime errors.
- A focused final pass checked skipped demonstrations, capture banners, resize cancellation, history controls, replay stars, and short-phone results.
- Title Continue, reset cancellation, confirmed reset, and legacy/pilot save isolation passed. Retreat and reload settled only once.
- TypeScript, production build, and all 220 tests across 23 files pass. Nine new tests cover cues, identities, history, and cancelled delays.
- The previous full engine run remains valid: the CI dependency planner finds no engine-suite dependency changed since tested commit `4624cdf`.
- Public staging completed the first lesson and its demonstration, history, stars, and reload through actual phone-sized board clicks.
- Replayed Region 2 fork and double-check positions using progress earned in the full local playthrough. Reduced-motion demonstration playback completed.
- Public checks caught a relative CSS map-image path. The corrected absolute URL loads in both regions at phone, tablet, and desktop sizes.
- Final public checks reported no console errors, failed requests, or HTTP errors. The journey made no engine requests; development hooks were absent.

**Deployment**

[PR #37](https://github.com/avoidthekitchen/chess-rpg-gauntlet/pull/37) contains this presentation pass.
[Play staging](https://unformedideas.com/staging-chess-rpg/) with the normal URL; existing journey saves still work.
Deployment version: `cd11ee9a-098e-4316-b3a8-6d4b5ed9b60d`. Only staging routes were deployed; live-site JavaScript and CSS URLs stayed unchanged.

## Basic journey — complete Regions 1 and 2 (#34)

Built on 2026-10-23 in `codex/regions1-2-curriculum` after the owner approved the curriculum-first direction.
The accepted pilot is preserved in draft PR #35 and remote branch `codex/checkpoint-approved-ambush` at `051ad26`.
This entry supersedes the older handoff below that kept Region 1 unchanged and required live army bosses.

**Playable scope**

- The Bog and The Kingsroad each contain five guided lessons and a mixed chapter review.
- Normal lessons have three practice positions, a full demonstration, and backups. Reviews have four positions without theme-revealing prompts.
- All 88 source puzzles are distinct. The nine approved pilot positions are reused across Region 2 lessons and its review.
- Each source records its Lichess ID, URL, rating, quality fields, published line, and teaching rationale.
- Ratings range from 407 to 1163. Backups remain within 200 points of their main position.
- Six content tests check legal lines, real tactical meaning, quality, source uniqueness, mixed reviews, and completion through every backup.
- A seventh content test checks every capture in the loose-pieces lesson, including final moves and backups, for legal recaptures.
- `node scripts/select-curriculum.mjs --verify-shipped` confirmed all 88 FENs, lines, ratings, themes, and quality values against the local database.
- Bounty regeneration reserves the curriculum IDs. Raw database files stay uncommitted.

**Flow and progression**

- The default entry now opens the journey. Players choose a companion and help level, then follow the map through both chapters.
- Completion opens the next encounter. Grubnak's mixed review opens The Kingsroad; Ashfang's review completes this two-chapter journey.
- The journal records learned ideas and offers free demonstration revisits. Settings change help and companion without losing progress.
- Every difficulty permits retries. Completion, no-miss, and no-hint stars persist once; replays can fill missed stars.
- There is no shop, gold penalty, hired-army gate, power requirement, or live-engine boss on this path.
- The separate `pawnshire-journey-v1` save leaves earlier campaign and pilot data intact.
- Development entries retain the earlier campaign (`?legacy=1`) and standalone pilot (`?ambush=r2-two-at-once`).
- Production drops those development scenes. The new journey does not start Stockfish.

**Independent review and browser validation**

- The separate code reviewer cleared the final implementation after correcting stale positional advice during reply animations and completed waves.
- A separate curriculum critic found that backup `Gb8He` ended with a capturable bishop, contradicting the safe-capture lesson.
- It was replaced by unchanged source `YgiAw`. The new endpoint test failed on the old puzzle and passes on the replacement.
- The critic replayed the replacement and cleared all remaining teaching claims and mixed-review prompts.
- The separate UX/art critic checked all four required viewports and played the first lesson through actual board clicks.
- Phone onboarding now resets map scroll position. The sticky navigation header is opaque so scrolled text cannot bleed through.
- The painted backgrounds, piece animation, and classic-piece option remain. Region 2 currently reuses existing background and enemy art.
- A full local playthrough completed all 12 encounters and 10 demonstrations through board clicks, rotating among all four viewport sizes.
- That run exercised promotion, hints, a miss, chapter unlocks, and reload after completion. It earned the expected 34 stars with no runtime errors.
- A separate browser pass checked all four miss budgets, retries, failed-wave backups, repeated reloads, replay stars, journal exits, and isolated reset.
- Those edge checks passed with no console errors or warnings. Legacy and pilot sentinel saves remained unchanged.
- Exiting during the accepted winning animation preserved the win and newly earned stars. Exiting during a reply settled one retreat.
- Reloading after either animation exit added no extra attempt. No stale-callback runtime errors appeared.
- The final quick check passed TypeScript, the production build, and all 211 tests across 22 files.
- The deployed phone-sized build completed all 12 encounters through board clicks, earned 36 stars, and retained completion after reload.
- That deployed run reported no runtime errors, failed requests, or engine requests. Development hooks were absent.
- After the content correction, a deployed replay failed wave two, reached `YgiAw`, and completed the lesson through board clicks.
- The corrected backup's win survived reload, with no duplicate completion or runtime errors.
- The plain staging URL also played a full journal demonstration with normal animation timing and no query parameters.
- `npm run ci -- --full` passed, including all 11 legacy engine tests across 960 short-battle and 384 boss games.
- The engine suite took 1,644 seconds. Its 210-test quick pass preceded the backup correction; the final quick pass contains 211 tests.
- The correction changed only curriculum data and its tests. The engine code remained unchanged throughout the full regression run.

**Deployment and limits**

Staging: <https://unformedideas.com/staging-chess-rpg/>. No query string is needed.
Review: [PR #37](https://github.com/avoidthekitchen/chess-rpg-gauntlet/pull/37), branch `codex/regions1-2-curriculum`.
Only the `chess-rpg-staging` Worker and its staging routes were deployed. Existing live-site JavaScript and CSS references remained unchanged.
The final deployment version is `c85cd7c3-4d26-4d41-9158-990f293f87e3`.

This is a basic tactics journey for players who know how pieces move. It includes a movement reminder and links to Lichess Learn.
Champion and Grandmaster currently share the same help and miss rules; the selection screen says so.
Lichess Practice technique lessons, Regions 3–5, faction-specific art, armies, powers, and live boss games remain later work.
The owner's positive pilot feedback supports this direction. Learning gains and authoring-time savings have not been measured.

## Region 2 ambush pilot — Two at once (#34)

Built on 2026-10-23 in `codex/region2-ambush-pilot`, after the owner approved the revised issue.
This is one standalone encounter. It does not ship Region 2. The owner subsequently approved wider adoption under D9.

**Try it locally**

Run `npm run dev`, then open `http://localhost:5173/?ambush=r2-two-at-once`.
The launcher offers all four difficulties and three companions. Brave is the default.
Each fresh pilot starts with 100g and a seeded roster.
Reset Pilot clears only `pawnshire-ambush-pilot-v1`; the campaign save stays separate.
The normal production bundle excludes the pilot. The owner also requested a separate staging deployment for phone testing.
`npm run deploy:staging` builds the pilot and publishes only the `staging-chess-rpg` routes.
Phone preview: https://unformedideas.com/staging-chess-rpg/.
The staging Worker is `chess-rpg-staging`; the live game's routes remain unchanged.
The separate reviewer checked deployment isolation. Production contains no pilot assets; staging uses its own build and upload directories.
The public preview passed all four waves, saved 130g after reload, and left campaign storage unchanged.
Phone checks at 375×812, 375×553 and 844×390 passed with no runtime errors or failed game assets.

**Content and authoring**

- Nine unchanged Lichess puzzles: one demonstration, four main positions and four backups.
- Rebuild the shortlist with `npm run puzzles -- --candidates doubleCheck --min 600 --max 1250`. Raw data remains uncommitted.
- The candidate command found 4,281 qualifying solutions and retained a shortlist of 166, favouring smaller boards within rating bands.
- Nine positions were selected, replayed and reviewed on the board. Each records its source, quality data and selection reason.
- The content uses rook/bishop, rook/knight and queen/knight double checks. Wave 3 finishes by winning material, not mating.
- Some shortlisted puzzles gave double check only at the end. They were rejected because the opening instruction would be misleading.
- Content work comprised those selections, three teaching lines, four coaching lines, briefing and victory text.
- Selection and writing were not timed separately from implementation. The count of discarded positions inspected was also not recorded.
- The shortlist size is measured; it is not a claim that all 166 positions received manual review.
- Authoring-time savings were not measured. The owner waived further pilot evaluation; timing work is not a delivery gate.

**Implementation choices**

- Published move validation reuses the bounty helpers. Ambush retry, loss and completion rules have their own pure state machine.
- Battles and ambushes share payout and win-recording helpers. Their different bonus rules keep separate types and statistics.
- The opening poster describes only the setup move. It disappears before the player starts solving.
- Accepted moves and settlement persist before animations. Reloading an unfinished attempt records one retreat.
- Region 1 art stands in for Bandit Riders. Campaign map integration and the Region 2 boss remain separate work.

**Review and validation**

- A separate review agent found three issues: clipped phone actions, hidden compact coaching, and misleading follow-up feedback.
- All three were fixed. The reviewer checked the fixes and found no further actionable code issues.
- The short phone panel scrolls while its action buttons stay visible. Coaching remains available at every size.
- Follow-up misses ask for the finish, rather than another double check. A regression test covers the material-winning continuation.
- Browser runs cover the demonstration, four waves, hints, misses, losses, retries, wins and once-only replay bonuses.
- All four backup branches were completed through board clicks, including the final backup that starts with the player's king in check.
- All four difficulty limits, Grandmaster relaunch blocking, cancelled retreats and repeated reloads passed browser checks.
- Exiting during a move animation settles one loss. Exiting during the accepted winning move preserves the win and its payout.
- The WANTED label appears before setup and clears before input. Its position was checked after canvas rendering on desktop and phone.
- Desktop checks at 1280×800, portrait checks at 375×553 and 375×812, and landscape checks at 844×390 passed without runtime errors.
- Action buttons remain within the viewport on the three phone layouts. Short panels scroll to expose coaching and result details.
- Type checking, the production build and all 196 unit tests passed after the final polish and history-count fix.
- All three companion demonstrations, piece-style switches and free teaching exits passed browser checks.
- The first CI run was stopped after roughly 55 minutes, still in the first boss batch.
- Profiling found repeated SAN history reconstruction in `Battle.snapshot` and `rewind`, called heavily by the existing simulated player.
- Those methods now count committed player and enemy moves. They retain the same chess.js undo operations and repetition history.
- A new test covers pending turns, completed turns, branching and a later starting move number. Existing repetition tests still pass.
- The independent reviewer also checked this optimization and found no issues. All 26 battle unit tests pass.
- A normal Region 1 browser run confirmed that Rewind restores a full move pair and spends one charge.
- `npm run ci` passed: 196 unit tests and all 11 engine tests across both suites.
- The engine run completed 960 short-battle games and 384 boss games in 1,653 seconds, about 28 minutes. Counts and pass criteria were unchanged.
- Short-battle competent win rates were 96–100%. Full-budget boss armies met their separate win and loss bars; the unexpanded starting army remains report-only.
- This validates the shared-code changes. Future ambush-only content still uses legal-line and rule checks, rather than engine tournaments.

**Owner evaluation and handoff**

The owner found the pilot fun, guided, and useful for learning real chess skills.
They evaluated learning, guidance, fairness, pacing, battle feel and phone usability, and approved D9 in #34.
No additional pilot playtesting is required. Wanted presentation polish is deferred. Normal implementation checks and code review still apply.
Keep the four difficulties and shared puzzle positions. Separate difficulty pools remain deferred.
Reuse the rules, content, tests, candidate tooling and board presentation. Adapt the scene to accept encounter data and campaign state.
The standalone launcher, seeded purse and separate pilot save are development tools, not the future campaign flow.
Preserve this feature branch in a draft PR while the Region 2 spec and dependency list are revised.
Next, integrate the pilot through the Region registry, real saves, map unlocks and rewards, then expand Region 2's curriculum and boss.
Existing Region 1 encounters stay for now. A wholesale conversion is not implied; its correctness fixes remain relevant.
The owner feedback is qualitative. Human completion times, learning gains and authoring-time savings were not measured.

## Step 1: Phaser game with the battle screen ported

**Done**
- Phaser 4.2.1 game (`src/main.ts`, `src/scenes/`). Canvas is sized in device pixels and every camera zooms by the pixel ratio, so scenes lay out in CSS pixels and text and tokens stay sharp on phones (`src/ui/screen.ts`). Screens rebuild from state on resize.
- Battle scene (`src/scenes/Battle.ts`) runs the prototype's `Battle` rules, Stockfish enemy, Threat Sight, rewind, tactic banners and promotion choice, unchanged in `src/game` and `src/ai`.
- Board (`src/ui/phaserBoard.ts`) is a port of the PixiJS board: tokens, knight hop with the dotted L, rook stomp, glide, capture freeze frame + white flash + shake + knock-out, dust and sparks, hanging-piece and check glows, drop-in intro, rewind shimmer. Same timings and easing.
- Talking-head portraits are drawn in Phaser (`src/ui/portrait.ts`): a card above the panel on desktop, a card floating at the bottom for 4 seconds on phones. `src/ui/speaker.ts` keeps the lines, now per faction (Bandit and Bog lines) and with named characters.
- Classic pieces toggle ("Pieces" button) swaps tokens for standard chess glyphs, remembered between sessions.
- Long text (lessons, results, promotion choice) uses an HTML overlay on top of the canvas (`src/ui/overlay.ts`), as the tech stack table says.
- Phone layout: board full width with ~45 px squares on a 390 px phone (the frame was slimmed slightly from the prototype to get there; 43.6 px on a 375 px phone).

**Simplified or skipped**
- The old PixiJS board, DOM board and prototype CSS were removed (`pixi.js` dependency dropped); they're in git history. The 3D mockups are untouched and still use `gsap` and `three`.
- Step 1 uses a plain battle list in place of the region map; the map comes in step 2.
- The classic toggle keeps the same tilted wooden board and only swaps the pieces.

**Worth a look**
- Phone squares: 43.6 px at 375 px wide, 45 px at 390 px. Desktop squares are capped at 80 px.
- Dev testing tip: `?loop=timeout` keeps the game loop running in a hidden browser tab (dev builds only).

## Step 2: Region 1 battles and shouting goblins

**Done**
- Title flow: "Do you know how the pieces move?" (No explains the tutorial isn't built yet and points to Lichess Learn), then Gentle or Brave difficulty with its loss cost, then the starter choice: Sir Hob (frog knight), Sage Ollie (owl bishop) or Old Brick (tortoise rook), each with two mouse pawns. Saved to localStorage (`src/save.ts`, `src/game/campaign.ts`).
- Region map (`src/scenes/Map.ts`): five battles on a branching path from town. The first skirmish opens two paths, and the Goblin Chief's camp opens after any four wins. Each battle has a briefing with dialogue, goal, bonus goals and reward.
- Five lesson battles (`src/game/region1Battles.ts`): Trouble in the Reeds (threat awareness), Lanterns at Mossbridge (protection, a village siege), The Swap Meet (safe trades), Behind the Mud Wall (back-rank mate) and The Pawn's Plunge (promotion). Your hired pieces stand in the set lineup as named characters (`assignCharacters`); the rest are militia.
- Shouting goblins (`src/ai/shout.ts`): before your move the goblins announce the move they'd play if you passed (a null-move search), drawn as a green arrow with the shouting piece's portrait. If it's still legal after your move they must play it ("Told you I would!"); if you made it illegal you get a "Foiled!" banner. Shouts are cached per position, so a rewind hears the same one.
- Companion tip at the start of each battle, and the victory dialog shows bonus goals and after-battle dialogue.
- Bog Goblin art (an art subagent, about $3.80 of the OpenRouter budget): six board tokens and six portraits in the same style as the existing ones (lime war paint, mossy rims), fox queen and mouse pawn ally portraits, and four painted backgrounds (title, map, town, battle).
- Engine verification (`npm run verify:battles`, about 80 s): plays 24 games per battle per difficulty with the exact shout rule. A competent Stockfish player wins 96-100% on Gentle and Brave; a careless one wins 0-17%.
- A critic subagent reviewed the Phaser port. Fixed what it found: move animations were being skipped (the board was redrawn before the animation started), screen rebuilds didn't destroy old objects (old buttons stayed clickable), taps on HTML dialogs reached the canvas, state leaked between battles, and the screen shake crashed when re-triggered.

**Simplified or decided without the doc**
- All Bog Goblins shout, including the boss (coming in step 4). The doc gives it as the faction trait; I didn't exempt the chief.
- The boss opens after 4 of 5 wins, so one battle can be skipped (the doc says 4-6 battles from a branching map, without a number).
- Starter names (Sir Hob, Sage Ollie, Old Brick) and the Goblin Chief's name (Grubnak) are mine.

**Worth a look**
- The must-play rule makes goblins easy to trap: once you see the shout you can often punish it at once, so The Swap Meet and Behind the Mud Wall are usually won in 2 moves and Trouble in the Reeds in about 3 (the pillar says 5-10). That's the shout rule working as written. Softening it (e.g. goblins may abandon a shout that hangs a piece) would make battles longer, but it's a design change, so I left it.
- `winMaterial` is judged right after your capture, before any recapture (in `src/game/battle.ts`, which I kept unchanged). The battles are set up so no single bad grab wins, but judging the gain after the enemy's reply would be safer.
- The siege raider ignores its own king's safety, and raider shouts don't depend on difficulty.

## Step 3: Town, gold and saving

**Done**
- Town (`src/scenes/Town.ts`) with three tabs:
  - **Tavern:** hire any piece at its chess value (pawn 10g, knight or bishop 30g, rook 50g, queen 90g), capped at a real chess set. New hires get names. Shows your army, its points, and the boss budget.
  - **Academy:** the "Rook and queen checkmates" lesson, two practice battles (queen mate, rook mate) against a lone king that defends at full Stockfish strength, with unlimited undo and 10g for the first clear of each.
  - **Bounty board:** 4 real Lichess puzzles (300 in the pool: 150 mate-in-one, 150 hanging-piece, ratings 400–1899), spread across ratings so pay differs (about 2–30g, more for harder ones). One try each, and the board refreshes after every battle, won or lost. Puzzles where you play Black flip the board.
- Puzzle pipeline (`npm run puzzles`, `scripts/build-puzzles.mjs`): downloads the Lichess CSV to `data/raw/` (gitignored), streams and filters it with Node's built-in zstd, validates every puzzle with chess.js and writes two small JSON files (~56 KB total) to `public/puzzles/region1/`.
- Gold (`src/game/economy.ts`): a battle's reward, each bonus goal and confirmed-tactic gold are each paid once, so replays can earn what's left but can't be ground. Losing a battle costs nothing on Gentle and a tenth of your gold on Brave, charged when you accept the defeat (retry or retreat); a rewind costs nothing.
- Engine-checked banners: a fork banner only shows when Stockfish agrees the fork wins material (eval after the move at least 0.8 pawns better than the material count before it, `src/game/tacticCheck.ts`). Confirmed forks pay 5g (capped at 10g per battle). Enemy fork banners are checked the same way. Checkmate needs no engine check.
- Saving: everything goes to localStorage after every change; older saves are upgraded with new fields.
- Tests added for prices, caps, hiring, one-time pay, loss costs, bounty refresh and settlement, the bounty rating spread, and the fork check.

**Simplified or decided without the doc**
- Starting gold is 20g. A win pays 15–25g plus 5g per bonus goal (first time only); exact numbers are an open question in the doc.
- Without the adaptive rating (out of scope), bounties are picked around a fixed rating per difficulty: 900 Gentle, 1200 Brave.
- A failed bounty pays nothing and leaves the board until the next refresh.
- The fork margin is 0.8 pawns, not more: on the prototype's knight fork Stockfish only rates the gain at about a pawn, because the knight gets trapped after winning the rook.

**Worth a look**
- Fixed in this step: going back to the map from a battle left the battle scene running underneath (`goTo()` in `src/ui/screen.ts` now switches screens cleanly).
- The hanging-piece bounty text says "Something is left unguarded. Win it." Some of those puzzles are also mates, which still fits but may surprise.

## Step 4: Boss and hero reward

**Done**
- The Goblin Chief's camp opens on the map after four wins. Its briefing leads to a muster screen (`src/scenes/Muster.ts`) where you pick your army from the pieces you own, up to Grubnak's 10-point budget with no queen (`src/game/boss.ts`: standard values, per-type caps, a "best fit" suggestion that puts your companion first). Big armies switch to two compact columns so 15 pieces still fit a phone.
- The duel (`src/game/region1Boss.ts`): your picks on their usual home squares against Grubnak behind a full wall of eight bog rat pawns and one salamander knight (11 points). Objective: checkmate, no move limit. 50g reward, plus bonus goals for no rewinds and winning within 30 moves. The goblins still shout.
- Hero recruit: winning the duel frees Saffron the Fox Queen, who joins your army as a named hero with her own portrait and lines. After the boss, the map says the Bog is safe and region 2 comes in a later build.
- Engine check (`scripts/verify/boss.verify.test.ts`): a strong Stockfish player wins 100% with each starter's typical 10-point army on Gentle and Brave, and with no hires at all (5 points). Careless and greedy simulated players win 0-17%.

**Simplified or decided without the doc**
- Grubnak's army (eight pawns and a salamander knight) and the 50g reward are my picks.
- The hero is a fox queen. She can't fight Grubnak (no queens), so she matters from region 2 on.
- The goblins shout in the boss duel too. I tried turning it off: a strong player still won in 4-11 moves, so the shouts aren't what makes the duel short.

**Worth a look**
- The duel's length depends a lot on the player. A strong player mates the Gentle or Brave AI in 4-21 moves, and weak simulated play almost always loses. Real players are in between, so watch in playtests whether it feels like a full game (the doc's intent) or is too hard for players who lose to tactics.
- Replaying the duel after a win pays only what's left (bonus goals not yet earned). The hero joins only once.

## Step 5: Deploy and playtest

**Done**
- Live at https://unformedideas.com/chess-rpg/ (and www.). It's an assets-only Cloudflare Worker, so it stays in the free tier, on zone routes `unformedideas.com/chess-rpg*`, like the site's other prototypes; the rest of unformedideas.com is untouched. `npm run deploy` builds, stages `dist/` into `dist-worker/chess-rpg/` (so files mirror the route path, without the 4 MB of 3D model comparisons) and runs `wrangler deploy`. Wrangler was already logged in, so nothing was needed from you.
- Checked live: `/chess-rpg` redirects to `/chess-rpg/`; the engine `.wasm` is served as `application/wasm`; Stockfish starts in a worker from the subpath and returns a best move in under 200 ms; the puzzle JSON loads; a new campaign, the map and a battle with real enemy replies, shouts and capture animations work at 375×812 and 1280×800.
- Fixed during the live check: on normal-density screens (pixel ratio 1) a window resize left the canvas at its old CSS size, so the game drew squashed. Phaser skips the CSS update when the zoom is 1; `fitGame` now sets it.

**Worth a look**
- `?loop=timeout` now works in production too. It only matters for automated testing in a hidden browser tab.

## Polish pass (after step 5)

**Done**
- **Deeper battles.** Trouble in the Reeds, The Swap Meet and Behind the Mud Wall were rebuilt so a strong player needs 4-5 moves (was 2-3), with a second wave of threats after the first shout trap. Win-material goals are now bigger than any single grab, which works around `winMaterial` being judged before a recapture. Every battle is re-verified with the engine (strong player 96-100%, careless 0-25%).
- **Battle review** (pillar 4). After every battle, Stockfish replays your last 12 moves and names the costliest one and the better move ("Your biggest slip was move 2, a3. It gave away a winning position. Re1 was stronger."). If the goblins' shout still stood after your move, your move is judged after their forced reply, so a deliberate trap isn't called a blunder.
- **Help that fades.** On Gentle, your companion reads each shout for you a moment later: whether the target is guarded, whether the trade is fair, or that a village or your king is the target. Brave leaves it to you.
- **XCOM-style capture close-up.** Capturing a real piece (not a pawn) sweeps a cinematic band across the board with the capturer's portrait.
- **Material help.** Battles with a material goal show the piece values under the meter and in the brief. Every capture or promotion floats its point change over the square: gold "+3" for you, red "−3" against you. The meter is net, so a sacrifice shows as a loss, then a gain.
- **Victory confetti** with your pieces hopping, short screen fades, bonus stars on cleared map nodes (like a perfect island in Into the Breach), and a "!" on Town when new bounties are up.

**My playtest**: Trouble in the Reeds on Brave as the owl. I missed the second threat and lost my knight, recaptured with a pawn, used a quiet shout to take their knight for free, then set a trap so their forced rook move walked into my bishop. I won in 5 moves, and the review agreed nothing was a real mistake. That's the Into the Breach feel the design asks for.

## Code review (Opus 5.5 High) and fixes

**Fixed**
- **High: the bounty board could be farmed.** It refilled as soon as every bounty was settled, so a new save could earn about 4,400g with no battles. It now refreshes only after a battle (test added).
- **High: "Face Grubnak!" could fall off short iPhones.** The muster list now scrolls between a fixed header and a pinned action bar, and switches to two columns when one won't fit.
- **A battle's result waited for the dialog** (up to about 8 s). Leaving or restarting in that window lost a win or skipped a defeat's gold cost. Results are now recorded the moment the battle ends; leaving or restarting after a defeat accepts it (rewinding still costs nothing), and the review fills into the dialog when ready.
- **Abandoned battles and bounties kept running** after you left mid-animation: the enemy still moved, stale cards appeared in the next battle, and a bounty could be settled on the wrong puzzle. Every await now checks a session id that's bumped on start and shutdown.
- **Landscape phones** (e.g. 844×390): the battle controls were off-screen. Short landscape screens now float the talking head and put the lesson behind a button; the starter screen uses rows.
- **The review** no longer calls a missing review "clean" (it says it couldn't finish), never flags the winning move, and gives village advice after a siege loss.
- **Engine:** every search has a 12 s timeout. A stuck or crashed worker switches the game to the fallback AI instead of "The enemy is plotting…" forever.
- **Smaller fixes:** "Give up" during the puzzle's setup move stuck; a hired queen could take the hero's name (two Saffrons); dragging the tavern list could hire a piece; a failed puzzle download never retried; the shout advice now counts attackers against guards and doesn't treat the king as a full guard; the phone battle panel got 20 px more room; routes no longer catch paths like `/chess-rpg-devlog`.

**Not addressed (and why)**
- The review doesn't pinpoint the move that left a village under-guarded after a siege loss; it gives general siege advice instead. Doing it properly needs village-aware analysis, not just engine scores.
- The Gentle shout advice still ignores pinned guards (rare in these positions).
- Stockfish lite may not stop mid-search on Rewind/Leave, so a deep search can delay the next one briefly. The new timeout bounds it.
- `/chess-rpg?x` (no trailing slash, with a query string) isn't matched by the exact route and goes to the main site. Normal links use `/chess-rpg/`.
- `winMaterial` is still judged before a recapture in `src/game/battle.ts`, which I kept unchanged as you asked. The battle positions work around it, and a test checks that each goal is bigger than any single grab.
- Simulated greedy players win the Reeds and Pawn's Plunge battles fairly often (38-63%), and a strong player can mate the boss quickly. Both are worth watching in playtests.

## Follow-ups: prototype fixes and the name Pawnshire

The brief's "reuse src/game and src/ai as they are" meant "build on the prototype," not "never change it." These were the places I'd worked around the prototype instead of improving it:

- **Material goals** (`src/game/battle.ts`): a win-material goal is now judged after the enemy's reply, so a grab that's simply recaptured doesn't win. A goal reached on your last move waits for the reply too. Tests cover the recapture case and the last-move case.
- **Raider AI** (`src/ai/enemy.ts`): the village raider no longer makes a raid that allows a mate in one.
- **Enemy API** (`src/ai/enemy.ts`, `src/ai/shout.ts`): `chooseEnemyMove` takes the position and scenario (`EnemyView`), so the shout code no longer builds a fake battle object.
- **Engine timeout** (`src/ai/engine.ts`): it now lives in the `Engine` class (searches that hang or a worker that crashes mark the engine failed, and the game falls back to the simple AI), replacing the wrapper in `src/engineHost.ts`. A fake-worker test covers it.
- **Difficulty blurbs** (`src/game/difficulty.ts`): written for players who know the moves, replacing the override in the title screen.

The game is now called **Pawnshire** (title screen, page title, README, package name, and the design doc). "Gauntlet" stays the name of the post-campaign replay mode. The URL stays `/chess-rpg/`.

## Shout and raider tilt (#4, #23)

- Every enemy move is one weighted pick among engine moves within the difficulty's window (`src/ai/enemy.ts`). Habits multiply move weights: shout x3 (`SHOUT_BONUS`), village raid up to x3 (`RAID_BONUS_MAX`), combined multiplier capped at x3 (`BONUS_CAP`). A shouted move missing from the engine's list is scored on its own. Without an engine, the old `raiderMove` and `fallbackMove` still apply.
- Goblins no longer must play their shout. After your move they decide again and prefer it. "Foiled!" when your move made it impossible, including moving away the piece they shouted they'd capture; "Oi! You've guarded it!" or "Changed my mind!" when they drop one that still stands. The map intro and companion lines say the arrow is one plan.
- `planIfPassed` and `nullMoveFen` (`src/ai/intent.ts`) answer "what would you play if I passed?" for the shout and the future Scrying Orb (#13). Rewind hears the same shout, cached per position.
- The battle review no longer judges your move after a forced reply. The simulator (`scripts/verify/simulate.ts`) models the new rule.
- Without an engine, goblins play their shout unless they have a mate or a good capture (`fallbackMove`), so the shout still means something.
- All five Region 1 battles were redesigned, because each one only worked while the shout was forced:
  - Trouble in the Reeds: the shout is cxd5; Ne7+ saves the knight and forks the loose rook. Goal 7 points in 10 moves.
  - Lanterns at Mossbridge: villages moved to c4 and e3, one guard each; the pressure is pawns walking onto them.
  - The Swap Meet: a pinned knight, attacked twice and guarded twice; add the cheapest third attacker. Goal 4 points in 10 moves.
  - Behind the Mud Wall: a back-rank mate in 5 against best defence, from a Lichess puzzle.
  - The Pawn's Plunge: two pawns break through. Its bonuses are now within 6 moves and no rewind (flawless dropped, since the break gives up a pawn).
- These only aim to pass the verification bars; finer balance waits for the guided-path playtest (#24, T8).

## Battle cue timing (PR #21)

- Cue holds use scene time, so queued banners and the result wait pause when a background tab stops rendering.
- Resizing or switching piece styles clears the queue before rebuilding removes its timers and visible cues. Later banners can still play.
- Two regression tests use Phaser's real Clock and TweenManager with simulated time. They cover background tabs, resize recovery, and pending result waits.
- Both tests fail without their respective fixes. `npm run ci` passes all 170 tests; the unit suite takes under one second locally.
- Browser checks passed at 1280×800, 375×812, 375×553 and 844×390. Pausing and resuming the render loop preserves cue order; no runtime errors occurred.
- Merged the newer rewind-popup fix from `main`. A queue test confirms that an immediate new move cannot revive an undone move’s points.
