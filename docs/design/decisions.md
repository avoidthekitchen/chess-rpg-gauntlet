# Decisions and open work

[Design overview](../design.md) · [Campaign](campaign.md) · [Syllabus](syllabus.md)

## Current scope

The complete five-Region curriculum and Lich King finale is the accepted production direction.
The owner published it at https://unformedideas.com/chess-rpg/ on 2026-10-24.
The original game is archived at https://unformedideas.com/alpha-chess-rpg/ as an [original-game reference](../alpha-reference.md).
PRs #47–51 are merged. The owner accepted the major feedback and deferred follow-ups #53–62.
The owner authorizes routine curriculum and implementation choices with best judgment; no repeated design approval is required.
Independent review, source verification, applicable CI, and browser checks remain required.
The owner retired the legacy battle benchmark gate on 2026-10-24 because new material replaces that campaign.

## Deferred follow-ups

These items remain future work. They do not block the accepted production curriculum.

- [x] Implement [Region 3 issue #39](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/39), following [Region 3](regions/region-03-shadow-cult.md), including source selection, progression, truthful teaching, and story transitions.
- [x] Deliver the basic five-Region journey and finale, preserving prerequisites and revisits. Technique and refresher extensions remain below.
- [ ] [Technique support #40](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/40): add a technique runner before claiming opposition, Lucena, or Philidor are taught and assessed.
- [ ] [Refreshers #41](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/41): add refresher scheduling and optional repeated practice without gold or bounty dependencies.
- [x] Add chapter transitions, named ally appearances, the finale interlude, and a saved ending.
- [ ] [Feedback and solution review #53](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/53): add position-specific wrong-move explanations and optional solution review.
- [ ] [Save recovery notice #59](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/59): explain repaired or unreadable saves and offer a recovery path; keep the raw backup.
- [ ] [Loading and bundle size #57](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/57): measure startup and lazy chapter artwork; check re-entry, failure, and offline behavior.
- [ ] [Faction art and naming #60](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/60): expand artwork for Regions 2–5 and the finale; keep tokens readable and identity text accurate.
- [ ] [Teaching-claim tests #54](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/54): consolidate shared checks.
- [ ] [Legacy AI test cleanup #55](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/55): address flaky historical AI coverage as P3 work.
- [ ] [Save, rollback, and keyboard checks #56](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/56): preserve save and rollback safeguards; complete native keyboard validation.
  The owner accepted 393×852 WebKit emulation for this release check. No physical device is available; physical-device coverage is not claimed or required.
- [ ] [Review source #58](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/58): replace weak fdj22 review backup with a stronger non-recapture defence source.
- [ ] [Promotion choices #61](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/61): improve icons and order.
- [ ] [Occluded tokens #62](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/62): improve visibility. The owner explicitly deferred this P2 item with the other follow-ups.
- [x] Record the owner’s production release and original-game archive. Preserve legacy saves.

- [x] Retire the legacy battle benchmark as a merge and release gate, per the owner’s 2026-10-24 instruction. Preserve results and optional diagnostics; replacement curriculum checks remain required.

## Open questions

- Which published Practice chapters and goal checks are suitable for technique training? Verify sources and supported continuations during that task.
- What amount of repeated practice helps without becoming tedious? Start small; no mandatory timer or mastery claim.
- Champion and Grandmaster currently share assistance rules. Retain that disclosure until their behavior differs.

## Deferred systems

Recruitment, shops, economy, powers, faction move habits, live army bosses, XP, and Gauntlet are outside the basic-game dependency graph.
Earlier implementation TODOs and tuning questions are preserved in [legacy decisions](legacy-decisions.md), not silently marked completed.

## How to read the history

Rows below preserve the sequence of decisions. Newer approved scope replaces conflicting older army, warm-up, economy, and live-boss decisions.
The active overview, campaign, systems, and syllabus are the implementation contract.
Earlier staging-only instructions and unmerged-stack blockers below are historical; the owner’s production decision supersedes them.
Historical test counts, interrupted runs, and failures remain evidence of those revisions.

## Decision log

| Date | Decision |
| --- | --- |
| 2026-10-24 | Trial Bandit Riders production art with native OpenAI generation in a draft PR for #60. Show colour-pipeline tokens on the real phone-size board before portraits. Independent art and code reviews check consistency. The owner reviews the finished assets before other Regions join the same PR. OpenRouter spend remains $0. |
| 2026-10-24 | Bring back the original game's presentation around the curriculum: one-question-at-a-time onboarding, the full companion screen and greeting, a full-screen map with pulsing stops, a first-visit chapter introduction, slim headers, and original portrait sizes. Move banners return to the board's centre: the move lands, the banner shows, and the next move waits until it fades. A tap skips it. Capturing a pawn alone stays quiet. Supersedes the earlier rule that banners never cover board squares. |
| 2026-10-24 | Faction naming for [#60](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/60): living factions never reuse our species or another faction's. Shadow Cult: Moth Pawn, Bat Knight, Spider Bishop, Snail Rook, Cat Queen, Goat King. Iron Legion: Hedgehog Pawn, Boar Knight, Heron Bishop, Armadillo Rook, Eagle Queen, Legion Lion King. See the [glossary](glossary.md#factions). |
| 2026-10-24 | The Bone Wardens are the one exception: skeleton copies of our six species, because the Lich King was a Lion King of Pawnshire. The knight is a Skeleton Frog Knight, not a horse. The finale reuses their art and adds one Lich King portrait. The Region 5 king is an unnamed warden. |
| 2026-10-24 | "Lion King" alone means only the player. Other lion kings carry their faction prefix: General Flint is a Legion Lion King; the warden king and the Lich King are Skeleton Lion Kings. Flint stays a lion, so his story is unchanged. |
| 2026-10-24 | Faction art for #60 is capped at $16 in total. Order: Bandit Riders, Bone Wardens, Shadow Cult, Iron Legion, then the Kingsroad map. Crystals, steel and eye glows avoid blue and teal so the cyan key stays clean. See the [plan](art.md#faction-art-plan-and-budget). |
| 2026-10-24 | The owner confirmed the complete curriculum as production direction, accepted the major feedback, and authorized merging PRs #47–51. All five are merged. The owner published the curriculum at `/chess-rpg/` and saved the original at `/alpha-chess-rpg/` as an archive and reference. Follow-ups #53–62 can wait. The owner accepted 393×852 WebKit emulation for this validation because no physical device is available. No physical-device coverage is claimed; it is not a release blocker. See the [release record](../complete-journey-release.md). |
| 2026-10-24 | The owner retired legacy battle benchmarks as release gates because new material will replace them. CI requires explicit `--legacy` opt-in for historical engine diagnostics. This clears the benchmark blocker without changing its results or authorizing merge or production deployment. |
| 2026-10-24 | Superseded by the owner’s later deprecation decision: review builds may be playtested on staging; the five-PR stack stays draft and unmerged while the full legacy gate fails. No waiver is inferred from staging authorization. See [release evidence](../complete-journey-release.md). |
| 2026-10-24 | Staging now uses its own normal-journey save key, copying older shared progress once. Production progress is never overwritten by staging. Rejected raw saves are preserved for recovery. |
| 2026-10-24 | Use faction plus chess-role labels while borrowing Bog artwork. Display species names only with matching art. The earlier canonical-label exception is superseded; future species concepts need art and naming review. |
| 2026-10-24 | The finale revisits ideas rather than enforcing a rising rating at every wave. Its opening offers a foothold; actual checkmate is the closing payoff. Published ratings are selection guidance, not a difficulty guarantee. |
| 2026-10-24 | Superseded by the centre-banner decision above. Owner prioritizes seeing piece movement. Compact dialogue and move banners overlay lesson advice, never board squares or action buttons. Desktop uses the dialogue space beside the board. |
| 2026-10-24 | Staging and development accept `?region=1`–`5` or `finale`. Each region preview uses separate test storage and marks only earlier chapters complete. Production ignores the shortcut. |
| 2026-10-24 | The finale has two four-wave reviews and a separate interlude. Actual final checkmate sets an explicit saved completion flag before animation. Ending and earlier lessons remain replayable. |
| 2026-10-24 | Region 5 uses 55 unchanged sources for short endgame decisions. Teach the opponent-promotes-first race before review; underpromotion means the only immediate mate. Rook support covers forcing clearance and deflection. |
| 2026-10-24 | Region 4 teaches bishop development with check, file tactics, exposed-king checks, deflection, intermediate checking captures, and actual mate-threat defence. Overload is not claimed. |
| 2026-10-24 | Region 3 uses 57 unchanged published sources. Pin escape teaches capturing the pinning attacker along its line; blocking and moving the rear piece remain unclaimed. |
| 2026-10-24 | Derive map stops and totals from registered chapters. A compact chapter picker and taller phone trail support seven-node chapters without changing old progress. |
| 2026-10-24 | Chapter endings are replayable story pages. Completion alone opens the next chapter; seeing an ending never awards duplicate stars or blocks travel. |
| 2026-10-24 | Add generated ink-and-watercolour chapter landscapes. Reuse existing board tokens with honest faction identity until dedicated sets are available. |
| 2026-10-24 | Owner waived the remaining legacy boss verification for the reconciliation merge after the new journey replaced Region 1 battles and boss. Record the interrupted full run and legacy sampling finding; do not change thresholds or CI selection. Issue #42 tracks reproducibility. |
| 2026-10-24 | Owner approved reconciling docs and issues before Region 3. Merge #37 after integration checks; close completed or superseded work accurately. Keep staging separate from production release. |
| 2026-10-24 | Story, companions, faction voices, painted maps, and readable dialogue are core. Allies can join the cast without recruitment or powers. Published boards never depend on a persistent roster. |
| 2026-10-24 | Use Steps, Bain, Heisman, Silman, Duolingo's path, and Woodpecker principles to shape prerequisites, revisits, and assessment. Select unchanged Lichess material to fit the syllabus. |
| 2026-10-24 | Build Regions 3–5 and a mixed Lich King capstone. Custom puzzles, live army bosses, gold, faction AI, and powers are deferred, superseding #36's earlier roadmap. |
| 2026-10-24 | Track Lichess Practice technique support and refresher scheduling separately. Tactical examples do not establish technique mastery; repeated sets need fresh assessments. |
| 2026-10-23 | Restore the earlier presentation around the published curriculum: Continue/New splash, illustrated sequential map, portrait introductions, talking pieces and history, and accurate move banners. Add portrait-led victory cards, a brief star reveal, and distinct companion reactions. These are core presentation; armies, powers, custom puzzles, and removed faction mechanics remain deferred. |
| 2026-10-23 | Curriculum-first checkpoint: preserve the accepted pilot in draft PR #35 and remote `codex/checkpoint-approved-ambush` at `051ad26`. Continue the basic campaign on `codex/regions1-2-curriculum`. |
| 2026-10-23 | Finish Regions 1 and 2 using published Lichess lessons. Each has five three-wave lessons and a four-wave mixed chapter review. Grubnak and Ashfang frame reviews; live army bosses are deferred. |
| 2026-10-23 | Preserve art, companions, board UX, and chess rules. Defer hired-army purpose, faction move mechanics, shops, Scrying Orb, and other powers until the core learning game is complete. |
| 2026-10-23 | Basic-campaign difficulty uses unlimited/3/2/2 misses and the pilot's help settings. Remove gold loss and permanent Grandmaster lockout. Clean and no-hint stars are once-only goals; retries and progression never require spending. Supersedes D4 and D7 for this campaign. |
| 2026-10-23 | A separate journey save preserves legacy and pilot progress. All five lessons lead to the chapter review. Grubnak opens Region 2; cleared lessons remain replayable. |
| 2026-10-23 | The owner accepted the pilot's teaching and UX, waived more human playtesting, and deferred Wanted polish. Independent code review, automated content checks, browser validation, and staging smoke checks remain required. |
| 2026-10-23 | Ambush D1: Two at once is a standalone Region 2 pilot. Region 1 and #24 stay unchanged. Approved by the owner in chat; [revised #34](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/34) records approval. |
| 2026-10-23 | Ambush D2: four published puzzle waves replace play-out against the engine. Positions and replies stay unchanged; each wave ends with its published solution. |
| 2026-10-23 | Ambush D3: all difficulties use the same puzzles. Assistance changes; later harder content must use different published puzzles. |
| 2026-10-23 | Ambush D4: wrong legal moves count as misses and are taken back. Limits are unlimited/3/2/2. Loss costs follow the campaign. Grandmaster blocks Retry and launch after an uncleared loss. Retries replace only the lost wave; repeated failures keep its backup. |
| 2026-10-23 | Ambush D5: accept the published move and alternative immediate mates when the expected move mates. Illegal taps do not count as misses. No engine evaluates answers. |
| 2026-10-23 | Ambush D6: the poster marks the opening attack before setup and disappears afterwards. It never predicts a later reply. |
| 2026-10-23 | Ambush D7: first win pays 20g; clean and no hints pay 5g each once. No tactic gold. Double-check banners appear on actual double checks. |
| 2026-10-23 | Ambush D8: legal replay, rule tests and browser checks replace ambush engine tournaments. Custom battles and bosses retain their distinct bars. Shared changes run CI-selected regressions. |
| 2026-10-23 | Ambush D9: the owner approved published-puzzle ambushes for most new teaching encounters after evaluating the staging pilot. Further pilot playtesting is waived. Wanted polish is deferred. Custom battles and live bosses remain where useful. Region 1 conversion and Practice technique nodes remain separate planning choices. |
| 2026-10-23 | Pilot storage is separate, seeded with 100g and a small roster. Reset affects only pilot data. An interrupted active attempt settles once as a retreat on reload. Leaving teaching is free. The owner approved a separate staging deployment for phone testing. Normal production builds exclude the pilot. |
| 2026-10-23 | Ambush and warm-up flows share puzzle mechanics, not necessarily a state machine. Rewards share the existing payout ledger through a small economy helper; battle stats and bonus kinds stay unchanged. |
| 2026-10-23 | The wanted poster comes from the same stored "if I passed" pick the Scrying Orb shows, not the engine's best line, so the Orb always shows the route to the marked piece. The target is the piece that one move captures, or else newly attacks; forks go to the highest value, then square order. The mark follows the piece through your move, and a move that hits it gets a ×3 bonus, capped with other habits ([brief](regions/legacy-region-02-bandit-riders.md#ai-habit-wanted-poster), [#12](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/12)) |
| 2026-10-23 | Region 2's mating battle opens with a 2 or 3 move setup before a mate in 2 or 3, so it meets the 4 to 7 move bar with no exception. The short mate stays in its warm-up, and the battle position is our own |
| 2026-10-23 | Scrying Orb charges are spent once, when a reveal succeeds; the answer is kept for that position within the attempt, shown again free on rewind, and never refunded. Failed or abandoned reveals cost nothing ([#13](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/13)) |
| 2026-10-23 | Each Region keeps its own completion record. Players can return to earlier Regions to play skipped branches and missed bonus goals. The bounty board uses the newest Region's pack ([#9](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/9)) |
| 2026-10-23 | A hero who joins a full roster replaces a hired piece of the same type and refunds its price. The starter is never replaced, so the army stays within a chess set. Applies to Saffron and Tadwell |
| 2026-10-23 | Faction habits follow "tell or tilt, never force": they may tell you something true or tilt the enemy's choice among moves within the difficulty's window, never force a move it wouldn't otherwise consider |
| 2026-10-23 | The siege raider moves to tell or tilt: the engine finds moves within the difficulty's window, and the raider picks the one with the most village pressure. Siege battles are re-verified ([#23](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/23)) (superseded the same day by the capped-bonus row: the raider is a bonus in the one weighted pick) |
| 2026-10-23 | A boss may have a boss practice instead of a warm-up: a technique played out against the engine, unlimited undo, always skippable. Region 1's rook and queen mates are one |
| 2026-10-23 | Each tip-card theme gets at least one bounty in its Region's pack: a published Lichess puzzle, by its tag or picked by hand when it has none. Practice positions are used only as tip-card examples, never as paid bounties |
| 2026-10-23 | Every habit tilt is a capped weight bonus in one weighted pick among moves within the window, so habits combine (a shouting raider) and none overrides the pick. Starting bonuses: shout ×3, raider up to ×3; a move's multipliers multiply, then the total is capped at ×3. Bonuses belong to the faction's AI; revealing a plan never adds one |
| 2026-10-23 | The re-deciding shout is a weighted preference among moves within the window, not a rule to keep it whenever it fits. The shout and Orb show the enemy's actual pick if you passed; Far Sight shows the best reply after your proposed move. Grubnak stays silent for good, now that shouts no longer force moves |
| 2026-10-23 | Goblin shouts drop the must-play rule: they announce, then decide again after your move ([#4](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/4)). The shout shares the Scrying Orb's engine question and code path |
| 2026-10-23 | Iron Legion's proud habit changes from "never declines a capture" to "prefers captures among its good moves" |
| 2026-10-23 | Bounties built from your own blunder positions are dropped; refresher bounties (real Lichess puzzles on your weakest theme) replace them, and the battle review shows your mistake |
| 2026-10-23 | The warm-up backup hint lights up the piece that moves, using the board's existing hint highlight; judge it in playtests |
| 2026-10-22 | Guided path replaces the separate academy: every battle node opens with a warm-up (show one, try one, a second try with a hint), and solving the first try skips straight to the battle. A warm-up never blocks a battle. Supersedes the 2026-10-21 academy row |
| 2026-10-22 | Each Region's map has a required main path of headline battles in teaching order and branches you choose (revisits, mates, endgames). The boss opens after 4 wins: the whole main path, plus 1 branch when it has 3. Replaces "any 4 of 5" for Region 1 and the Region 2 brief |
| 2026-10-22 | Warm-up positions are Lichess puzzles (CC0) from the low end of each Region's warm-up band, tagged with the battle's theme, or positions from Lichess Practice studies (preferred for endgame technique); the words are our own |
| 2026-10-22 | Lichess Practice studies are cleared for use, confirmed by the owner: their positions may appear in warm-ups, tip cards and the library, credited to Lichess. Text stays in our own voice |
| 2026-10-22 | A boss gets a warm-up only when it tests something the battles didn't; Region 1's rook and queen mates become Grubnak's |
| 2026-10-22 | The town's academy becomes the library: replay warm-ups you've seen, read tip cards, run a timed review set (Woodpecker Method), and later optional advanced lessons |
| 2026-10-22 | Puzzle-only themes with no battle (zwischenzug, overloaded pieces, underpromotion and others) get a one-screen tip card on the bounty board, not a lesson |
| 2026-10-22 | Refresher bounties: the game tracks results per theme, and one of the 4 bounty slots brings back your weakest theme with its warm-up attached (spaced-repetition style). Mistakes are drilled on the board, not with new map nodes |
| 2026-10-22 | "Checks, captures, threats" (Heisman) is Region 1's first warm-up and its one-line battle reminder |
| 2026-10-22 | Region 4's strategy is tested with new battle goal kinds (develop and castle within N moves, take the open file first), not puzzles |
| 2026-10-22 | Curriculum revised: defending added to Region 1, removing the defender to Region 2, opposition moved from Region 5 to Region 3, lures and traps to Region 4, `mateIn3` as a revisit in Regions 3 and 4. The order also draws on Bain, Heisman, Silman, Polgar, Yusupov and Duolingo's path ([Curriculum](campaign.md#curriculum)) |
| 2026-10-22 | Battle dialogue can always be read again: on phones a floating line stays up longer the longer it is (and while held), the last line stays in the panel, and "What was said" lists every line this battle |
| 2026-10-22 | `npm run ci` is the local CI: quick checks always, engine playtests only when a change reaches them (found by following imports), `--full` before a Region ships |
| 2026-10-22 | Piece names are animal plus chess piece ("Owl Bishop", "Bog Rat Pawn"), and short names are the plain chess names for both sides, so players learn the real names |
| 2026-10-22 | A pawn reaching the far rank is "promoted", not "knighted" |
| 2026-10-22 | Difficulty levels are shown as Gentle and Brave (code ids `squire` and `knight` unchanged), so "Knight" only means the piece |
| 2026-10-22 | Material goals show the piece values under the meter, and every capture or promotion floats its point change (+3 gold, −3 red) over the square; the meter stays net |
| 2026-10-22 | Region 2 brief: Bandit Riders are raccoons, hare riders, magpies, badgers, a stoat and Ashfang the wolf; places are the Kingsroad, Waymeet and the Broken Wheel |
| 2026-10-22 | Region 2 hero is Tadwell, a frog knight captain of the old army; the boss posts no wanted posters |
| 2026-10-22 | Region 2 keeps Region 1's shape: 5 battles, 4 wins open the boss, same rewards; Scrying Orb is 3 charges for 30g |
| 2026-10-22 | XP, levels and titles are deferred past Region 2 |
| 2026-10-22 | Wanted poster: target is the first piece the enemy's best line wins or attacks, never the king; no commitment, so no review special case |
| 2026-10-22 | Story arc: the Lich King is a former Lion King of Pawnshire who refused checkmate; chess rules are the one law magic can't break |
| 2026-10-22 | The Lich King's origin comes one hint per Region, confirmed in Region 3; his interludes are one or two lines per Region |
| 2026-10-22 | Defeated leaders may return lightly: Grubnak as comic relief, the Iron Legion's general as an ally |
| 2026-10-22 | Pawnshire is also the name of the Lion King's kingdom |
| 2026-10-22 | The starter companion is the coach for every lesson; heroes like Saffron don't teach. The Lich King is cold and courtly |
| 2026-10-22 | Faction habits: Bandit wanted poster (target from their best line, poster icon, named by the Gentle advice), Shadow Cult binding, Iron Legion proud (renamed from greedy), Bone Wardens relentless march, Lich King none |
| 2026-10-22 | Help ladder: Scrying Orb charges in Region 2, Far Sight in 3, Oracle and Blunder Ward (once per battle) in 4, rewind relics in 5 |
| 2026-10-22 | "Tortoise Golem" is the canonical species name for the rook; "tower" stays its short name (replaced the same day: see the piece-name row above) |
| 2026-10-22 | Region 1's boss, Grubnak, doesn't shout: the final exam for the habit the shouts taught |
| 2026-10-22 | Every Region follows the Region template, with Region 1 as the worked example, and meets the playbook's verification bars |
| 2026-10-22 | Every token comes in White and Black: ivory or ebony headgear and base, applied in code from a cyan key; ebony gets a light rim |
| 2026-10-22 | Each enemy faction has its own species and shares only the chess headgear shapes; Bog Goblins are bog rats, salamanders, crows, snapping turtles, vipers and Grubnak the Toad Chief |
| 2026-10-22 | Bandit Rider placeholder art removed; Region 2 picks its own species when designed |
| 2026-10-21 | The game is called Pawnshire; Gauntlet stays the name of the replay mode after the campaign |
| 2026-10-21 | Academy teaches the idea, battles test it under pressure, bounties repeat it until it sticks (the academy part superseded 2026-10-22 by the guided path's warm-ups) |
| 2026-10-21 | The game stays 2D: tokens on the board, talking-head portraits beside it; 3D explored and deferred, with the mockups kept for reference |
| 2026-10-21 | If 3D is revisited, use Rodin for AI-generated models (slight edge over Hunyuan3D; TRELLIS 2 not for hero pieces) |
| 2026-10-21 | Talking-head portraits are tall portrait cards so headgear and shoulders fit |
| 2026-10-21 | First implementation is one complete region, Region 1, in Phaser |
| 2026-10-21 | Gauntlet unlocks after beating the Lich King and uses the puzzle themes the campaign doesn't |
| 2026-10-21 | Bounty board: small, refreshes after each battle, follows the curriculum, pays more for harder puzzles, includes mistake bounties (replaced by refresher bounties 2026-10-23) |
| 2026-10-21 | Battles pay for the army; bounties pay for extras and catch-up |
| 2026-10-21 | Boss budgets cap your army; only the Lich King battle allows a full chess set |
| 2026-10-21 | All pieces usable and hireable after the tutorial; gold and growing boss budgets pace the army |
| 2026-10-21 | Each region rewards a named hero recruit |
| 2026-10-21 | Regions map to Lichess Practice studies, with endgames before advanced tactics and a strategy region of our own |
| 2026-10-21 | King is a lion, bishop is an owl |
| 2026-10-21 | Board uses simplified tokens that still show the animal and its chess role; detailed figurines become talking-head portraits |
| 2026-10-21 | Lesson battles use a set lineup chosen by the scenario; boss battles use a points budget; wounds dropped |
| 2026-10-21 | Tutorial entry: the game asks "Do you know how the pieces move?" |
| 2026-10-21 | Champion difficulty loses a quarter of your gold on a lost battle; tune in playtests |
| 2026-10-21 | Phaser 4 for the map, town and board; Three.js only later, if 3D is worth it |
| 2026-10-21 | Audience: players who know the moves; optional "Teach me the moves" tutorial for total beginners |
| 2026-10-21 | Campaign first |
| 2026-10-21 | Open source under GPL-3, so Stockfish ships with the game |
| 2026-10-21 | Losing a battle costs more on harder difficulties, never the save |
| 2026-10-21 | Tactic banners need a board rule plus engine confirmation; 8 patterns at launch |
| 2026-10-21 | Free rewind deferred: too confusing as designed |
| 2026-10-21 | Scrying Orb ladder: shouting Bog Goblins, then the Orb (threat), then Far Sight (what-if upgrade) |
| 2026-10-21 | Starter is a named companion who acts as the main tutor |
| 2026-10-21 | Animal world: one species per piece type, factions told apart by outfit; classic pieces toggle (species per faction superseded 2026-10-22) |
| 2026-10-21 | Battles are short scenarios; the rules of chess never change on the board |
