# Playbook: building a Region

[Design overview](design.md) · [Region template](design/regions/region-template.md) · [Region 1 (worked example)](design/regions/region-01-bog-goblins.md) · [Build progress](progress.md)

How Region 1 was built and checked, written as the steps and quality bars every Region should meet. The design documents say *what* the game is; this says *how* to add to it without drift. Where a rule can be a test, it should be one; the commands are in the [README](../README.md#run-it).

## Order of work

### In the core game (Region 2 onward)

Decided 2026-10-24 ([build order](design.md#build-order-core-game-first)). A Region is ambushes, at most one technique node, bounties and a boss. No new habits, powers, heroes or custom battles, and no new art is needed: earlier faction art can stand in.

1. **Design.** Fill in the [Region template](design/regions/region-template.md) from the Region's row in the [battle outline](design/campaign.md#battle-outline-by-region): the map, each node's kind and tag, the boss and the story beats. Get the owner's approval in the Region's spec issue.
2. **Pick puzzles.** For each ambush, run `npm run puzzles -- --candidates <tag> --min <rating> --max <rating>`, then pick 9 by hand on the board, following the [ambush content rules](#ambush-content-rules).
3. **Technique node,** if the Region has one: pick the Lichess Practice chapter, following the [technique node rules](#technique-node-rules).
4. **Words.** Briefings, show-one lines for each starter, wave lines and win lines, in the [voice guide](design/story.md#voice-and-dialogue).
5. **Bounties and boss.** Add the Region's tags to `scripts/build-puzzles.mjs` and rebuild the packs. Build the boss and verify it to the boss bar.
6. **Play it** on Gentle and Brave at desktop and phone sizes, then review, deploy and record, as below.

### Custom battles (Region 1, and after the core game)

1. **Design first.** Copy the [Region template](design/regions/region-template.md) and fill it in: faction and AI habit, curriculum mapping, the map's main path and branches, battles and their warm-ups, boss, hero and story beats. Start from the Region's row in the [battle outline](design/campaign.md#battle-outline-by-region). Check it against the [pillars](design.md#vision-and-pillars), the [main arc](design/story.md#main-story-arc) and the [names](design/glossary.md). Get the design approved by the owner before building content; for Region 2 onward, through the Region's spec issue on GitHub. Design questions you can't settle go to [open TODOs](design/decisions.md#open-todos).
2. **Rules before content.** New rules (a faction habit, a new objective kind, a power) go in `src/game` or `src/ai` with unit tests, before any battle uses them. `src/game` has no screen code. Every habit must follow [tell or tilt, never force](design/systems.md#ai-habits-by-faction). A new habit also needs a simulated player that understands it (`scripts/verify/simulate.ts` has one for shouts), or the verification bars below mean nothing.
3. **Art.** Make the faction's token and portrait set, and any backgrounds, as [Art direction](design/art.md) describes. Then check the tokens on the real board at phone size (below).
4. **Battles.** Write each battle as a `BattleDef`, meeting the [content rules](#battle-content-rules), and verify it with the engine until it meets the [bars](#verification-bars).
5. **Warm-ups, bounties, boss, hero.** One warm-up per battle, meeting the [warm-up rules](#warm-up-content-rules); tip cards for the Region's puzzle-only themes, each with at least one bounty in the pack; bounty puzzles built from the curriculum's tags, tip-card tags included (`npm run puzzles`); the boss duel verified like a battle, with a boss warm-up only if it tests something the battles didn't.
6. **Play it.** Play every battle yourself on Gentle and Brave, at desktop and phone sizes, and fix what feels flat or confusing.
7. **Review, deploy, record.** A fresh-eyes review, a deploy and a live check, then the records (below).

Work in small steps, each one tested, checked in the browser, committed, and logged in [build progress](progress.md).

## Battle content rules

These cover custom battles. Ambushes and technique nodes have their own rules below, and bosses keep their own bar under [verification](#verification-bars).

The battle content tests (`src/game/region1Battles.test.ts`) check these. Today the tests are written for Region 1 (they expect the region "The Bog" and shouting enemies); making them run for every Region is an [open TODO](design/decisions.md#open-todos).

- A legal start with White to move, the enemy not already in check, and villages empty.
- 4 to 10 pieces per side, so the board reads at 45 px squares.
- Across a Region's battles, White has a knight, a bishop and a rook in at least three battles each, so every starter companion usually appears as a named character.
- A move limit of 5 to 10. A siege lasts 5 to 10 enemy turns, has villages, and uses the `raider` AI.
- A reward of 15–25g, and exactly two different bonus goals at 5g each. A `quick` goal, if a battle has one, sits below the move limit. Pick goals that teach a habit: flawless for protection battles, quick for mates.
- Not winnable on the first move, and a win-material goal bigger than any single enemy piece, so a battle needs a plan, not a grab.
- One scripted winning line per battle that the test plays through.
- 2 to 4 dialogue lines before the battle, 1 or 2 after, and a tip. Their length follows the [voice guide](design/story.md#voice-and-dialogue), which the tests don't check.

## Ambush content rules

From the [ambush pilot](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/34). A content test checks every rule that can be checked.

- **As published.** Use each puzzle's position, setup move, solution and replies unchanged, and stop at the end of the solution.
- **Quality.** Every puzzle passes the bounty quality filter (`QUALITY` in `scripts/build-puzzles.mjs`) and carries the ambush's tag.
- **The idea is the player's.** The tagged tactic happens in a move the player makes, not only in the setup move. For a theme with a board rule (double check, fork, mate), the test checks it.
- **Size.** 1 shown position and 4 waves, each with a backup: 9 puzzles. 1–3 solver moves each.
- **Ratings.** Rising across the waves, inside the Region's warm-up band ([curriculum](design/campaign.md#curriculum)), the last wave up to 150 above it. A backup is within 75 points of its wave.
- **No reuse.** No puzzle appears twice in the game, as an ambush wave, a warm-up or a bounty. The bounty build reserves every ambush puzzle.
- **Picked by hand.** Look at each one on the board. Prefer variety (different pieces making the tactic), and drop puzzles where a tactic the player hasn't met yet carries the solution.
- **Provenance.** Record each puzzle's id, its link (`https://lichess.org/training/<id>`), its rating and quality fields, and why it was picked.
- **Words.** A show-one line for each starter, one line per wave, and a briefing. Our own words, in the companion's voice.
- **No engine playtests.** Ambush content needs the content test and a play-through, not `npm run verify:battles`. Changes to shared code still run whatever `npm run ci` selects.

## Technique node rules

- **The position** comes from a Lichess Practice chapter (cleared for use; see [licensing](design/technical.md#licensing)). Record the study and chapter.
- **The goal** fits the chapter: mate, promote, or hold a draw for a set number of moves, using the existing goal kinds.
- **The defender** plays at full strength, as in Region 1's rook and queen mates. Undo is unlimited and nothing is lost by failing.
- **Checking.** A content test checks the position and the goal. One engine run confirms the textbook result from the start. Simulated players aren't needed, because the result is known theory.

## Map rules

The [guided path](design/campaign.md#guided-path) sets the shape:

- A main path of the headline battles in teaching order, usually 3, each opening the next.
- Branches open after the main path: revisits of earlier Regions, mates and endgames.
- The boss opens after 4 wins: the whole main path, plus 1 branch when it has 3. Elsewhere, link to this rule rather than restating it.
- Every theme in the Region's curriculum row is either a node (a battle with a warm-up, an ambush or a technique node) or a tip card. No separate lessons.

## Warm-up content rules

Every battle has a warm-up: one position your companion shows, one you try, and one backup with a hint.

- Positions are Lichess puzzles from the low end of the Region's warm-up band ([curriculum](design/campaign.md#curriculum)), tagged with the battle's theme, that pass the bounty quality filter.
- Or positions from the matching Lichess Practice study (cleared for use; see [licensing](design/technical.md#licensing)). Prefer these for endgame technique, where puzzles rarely show the textbook position. Record the study and chapter.
- 1 or 2 moves for the solver, so a player who knows the idea solves it in under a minute.
- The try and backup positions show the same idea as the battle, not just the same tag. Pick them by hand and check them on the board.
- Not used as a bounty in the same Region.
- Our own words, in the companion's voice ([voice guide](design/story.md#voice-and-dialogue)): one or two sentences for the shown position. The backup's hint lights up the piece that moves, using the board's existing hint highlight.
- Where Lichess has no tag or study for the theme (threat awareness, counting trades, development, open files), use the nearest tag or a position of our own, checked with the engine.
- A warm-up never blocks the battle and has no move limit, rewinds or loss cost.
- The one exception is a **boss practice** ([guided path](design/campaign.md#guided-path)): a technique played out against the engine, such as rook and queen mates. It has unlimited undo, is offered before the boss, and can always be skipped. It isn't held to the 1–2 move rule.

Warm-ups are puzzles, not battles, so they don't need `npm run verify:battles`. A content test checks each one: the position is legal, the solution plays through, and its tag matches the battle's theme.

## Verification bars

These cover custom battles and bosses. Ambushes and technique nodes are checked by their content tests instead.

`npm run verify:battles` plays every battle and the boss many times with the real enemy AI, the faction habit included, using simulated players (`scripts/verify/`). The battles take about 8 minutes and the boss longer, so `npm run ci` runs each only when a change can affect it. A battle passes when:

- A **strong** player (Stockfish, aware of the habit) wins at least 90% on Gentle and on Brave, and earns each bonus goal in at least half its wins.
- A **careless** player (a random pick from a shallow search's top five) wins at most 40%.
- A strong player needs **4 to 7 moves** on average (pillar 2: short, sharp battles). Fewer means the first trick ends it; more means it drags. The test reports this but doesn't enforce it, so read the average-moves column.
- Every win ends for a reason that fits the goal (for example, a material battle isn't won by a draw).

The boss passes when, with each starter's typical army at the budget, a strong player loses (checkmate or draw) at most 15% of games and wins at least 60%. A boss is a full game, so it gets a looser bar than a battle; games that hit the simulator's 80-move cap count as unfinished, not lost (`scripts/verify/boss.verify.test.ts`). Report the "greedy" player's rate too: when it's high, a battle may reward grabbing over thinking.

When a new rule changes how battles end (as material goals once did), re-run verification for every Region, not just the new one (`npm run ci -- --full`).

## Checks before each commit

- `npm run ci` passes. It always runs the quick checks (`npm run check`: type-check, build and unit tests, under a minute). Then it runs only the engine checks your branch can affect: it follows each check's imports, so a change to a battle, a rule, the AI or anything they import reruns it, and a screen, art or docs change skips it. `npm run ci -- --plan` shows what would run, and why.
- `npm run ci -- --full` runs every engine check. Use it before a Region ships, and when a new rule changes how battles end.
- Browser check of what changed, at these sizes:

| Size | Why |
| --- | --- |
| 1280×800 | Desktop: board beside the panel |
| 375×812 | Typical phone: 44–45 px squares, floating portrait card |
| 375×553 | Short phone (iPhone SE with browser bars): nothing important off-screen |
| 844×390 | Phone on its side: controls still visible |

- In dev, `?loop=timeout` keeps the game loop running in a background tab, for automated checks.
- No console errors, and no screen left running underneath another (navigate with `goTo()`).

## Review

After a Region's content and code are in, have someone (or a fresh agent) review it who didn't write it. Focus on:

- turn-flow races: leaving or rewinding during the enemy's turn or an animation;
- gold exploits and rewards paid twice;
- wrong teaching: a banner, advice or review that's untrue in that position;
- phone layouts.

Fix critical issues, and list the rest in the Region's progress entry.

## Deploy and live check

`npm run deploy` builds, stages the build under `dist-worker/chess-rpg/` and deploys the assets-only Cloudflare Worker (see [Technical design](design/technical.md)). Then check the live site at https://unformedideas.com/chess-rpg/:

- `/chess-rpg` redirects to `/chess-rpg/`;
- the engine `.wasm` and the puzzle JSON load;
- Stockfish answers (an enemy moves);
- a battle plays at desktop and phone sizes.

## Records

- **Region document:** fill in Design status, Verification and, after playtests, Playtest.
- **Build progress:** what's done, what was simplified, and what's worth a look, per step.
- **Decisions:** a decision-log row for every design call made while building, and resolved TODOs ticked off.
- **Tuning values:** new numbers go in the [table](design/systems.md#tuning-values).
- **Names:** new characters, places and faction terms go in the [cast](design/story.md#recurring-characters) and [Names and terms](design/glossary.md).
