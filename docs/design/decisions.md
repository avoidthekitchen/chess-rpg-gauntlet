# Decisions and open questions

[Design overview](../design.md) · [Game systems](systems.md) · [Campaign and curriculum](campaign.md)

## Open TODOs

The one place to track unfinished design work. When one is resolved, move the answer to the document it belongs in and tick it off here.

**Design**

- [x] **Main story arc:** approved in [Story](story.md#main-story-arc), with its open questions answered.
- [ ] **Recurring characters:** Region 2's are named (Ashfang, Tadwell). Name the Region 3–5 bosses and heroes as each Region is designed ([Story](story.md#recurring-characters)). The Lich King's voice is approved.
- [x] **Region 1 detailed design:** written up as built in [Region 1](regions/region-01-bog-goblins.md), the worked example for the [Region template](regions/region-template.md).
- [ ] **Region 2 detailed design:** the [brief](regions/region-02-bandit-riders.md) is approved; the battles, warm-ups and dialogue are designed by the builder and approved by the owner.
- [ ] **Regions 3–5 and the Lich King:** detailed designs, each as its own file under `regions/` copied from the [Region template](regions/region-template.md), linked from the faction and curriculum summary tables in [Campaign](campaign.md#regions-and-factions). Keep the summary rows in the campaign overview.
- [x] **Faction AI habits:** approved in [AI habits by faction](systems.md#ai-habits-by-faction). Each Region settles its habit's finer details.
- [x] **Help ladder by Region:** approved in [Powers and rewind](systems.md#powers-and-rewind). The Orb's price and charges are set with Region 2.
- [ ] **Region 1 guided path:** revise Region 1 to the [guided path](campaign.md#guided-path): a warm-up in each battle node, the map rewired to a main path (Reeds, Mossbridge, Swap Meet) and two branches (Mud Wall, Pawn's Plunge), the rook and queen mates as Grubnak's boss warm-up, the academy turned into the library, and refresher bounties. The in-battle lesson panel becomes a one-line reminder. Spec as a GitHub issue once this design is approved ([Region 1](regions/region-01-bog-goblins.md#planned-guided-path)).
- [ ] **Placement check:** an optional set of 5 or 6 puzzles at the start that marks warm-ups the player already knows, so they start ready to skip, and seeds the hidden adaptive rating. Design it with the adaptive rating.
- [ ] **Siege raider:** move the raider to tell or tilt and re-verify the sieges ([#23](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/23)).
- [x] **Shout rule:** decided 2026-10-23: goblins keep announcing, then decide again after your move ([#4](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/4)), under the [tell or tilt](systems.md#ai-habits-by-faction) rule.
- [ ] **XP, levels and titles:** designed ([Story](story.md#recurring-characters)) but not built. Deferred past Region 2 (decided 2026-10-22); decide when to build them.
- [ ] **Region 1 playtest:** run the test in [Region 1](regions/region-01-bog-goblins.md#playtest) and record the results there.
- [x] **Region 2 numbers:** set in the [brief](regions/region-02-bandit-riders.md): 5 battles, 4 wins open the boss, Region 1's rewards and pay, and the Orb at 3 charges for 30g.

**Code**

- [ ] **Region registry:** much of the game assumes Region 1. Before building Region 2, add a registry of Regions and a current-region field in the save, so Region 2 isn't a copy of half the game. What assumes Region 1 today:
    - the map, the boss and the hero (`src/game/region1*.ts`, `src/scenes/Map.ts`, `src/scenes/Muster.ts`, `src/flow.ts`);
    - the puzzle files (`src/puzzles.ts`, and the config in `scripts/build-puzzles.mjs`);
    - goblin wording in battle ("Told you I would!", "The goblins shout their plan" and "Foiled! The goblins couldn't…" in `src/scenes/Battle.ts`; the shout lines in `src/ai/shout.ts`; "One less goblin." in `src/ui/speaker.ts`). Enemy piece names already come per faction from `FACTION_SPECIES` (with the art pipeline in PR #6).
- [ ] **Tests and verification for every Region:** the battle content tests and `npm run verify:battles` only cover Region 1. Run them over every registered Region ([playbook](../playbook.md#battle-content-rules)). Each new faction habit also needs a simulated player that understands it.
- [ ] **Region 1 boss results:** the no-shout boss's AI values are in the [tuning values](systems.md#tuning-values); on the next `npm run verify:battles`, record the boss rows in [Region 1](regions/region-01-bog-goblins.md#verification). The boss check is the slow part of that run (384 full games).
- [x] **Tortoise name:** renamed "Tortoise Tower" to "Tortoise Golem" in `SPECIES` (`src/ui/speaker.ts`), per [Names and terms](glossary.md).

## Open questions

- [ ] Brave difficulty loses a tenth of your gold on a lost battle: first guess, tune in playtests.
- [ ] Boss budgets of about 10, 16, 22, 28, 34 and 39 points: tune in playtests.
- [ ] Exact gold numbers for battle rewards and bounty pay: tune in playtests.
- [ ] Warm-up pay of 5g on the first solve, and whether refresher bounties pay like other bounties: first guesses, tune in playtests.
- [ ] Warm-up bands (400–800 in Region 1, up to 1100–1500 in Region 5): check in playtests that the try position is easy for players who know the idea.

## Decision log

| Date | Decision |
| --- | --- |
| 2026-10-23 | Faction habits follow "tell or tilt, never force": they may tell you something true or tilt the enemy's choice among moves within the difficulty's window, never force a move it wouldn't otherwise consider |
| 2026-10-23 | The siege raider moves to tell or tilt: the engine finds moves within the difficulty's window, and the raider picks the one with the most village pressure. Siege battles are re-verified ([#23](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/23)) |
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
