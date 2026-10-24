# Playbook: building a Region

[Design overview](design.md) · [Region template](design/regions/region-template.md) · [Region 1 (worked example)](design/regions/region-01-bog-goblins.md) · [Build progress](progress.md)

## Current basic-campaign workflow

The [curriculum-first plan](curriculum-first.md), approved 2026-10-23, takes precedence for the new Regions 1 and 2.
Build five published-puzzle lessons and one mixed review per Region, using the shared lesson runner.
Do not create custom positions or require live army bosses, faction AI, recruitment, powers, or economy work.
The owner approved proceeding with best judgment; another design-approval or human-pilot-testing gate is unnecessary.

1. Curate unchanged Lichess positions and published lines. Record sources, quality fields, and teaching fit.
2. Write short, accurate coaching. Reviews must not announce the tactic before the player solves it.
3. Test new rules, all solution replays, unlocks, retries, stars, and save isolation.
4. Have an independent reviewer inspect code and teaching. Fix critical findings.
5. Exercise both chapters, reloads, exits, and phone layouts. Record actual results in [build progress](progress.md).
6. Run the applicable CI checks, open a review PR, deploy staging, and verify the deployed journey.

Published puzzles do not need fresh engine tournaments. Existing custom battles keep their regression checks.
Do not weaken `npm run ci` selection. Run `npm run ci -- --full` before shipping a Region, as required by AGENTS.md.
No new rule allows gold loss or permanent Grandmaster lockout in the basic campaign.
Retries stay available, and the separate journey save never clears legacy or pilot progress.

The remainder records the earlier custom-battle workflow. Conflicting boss, army, paid-power, warm-up, and approval requirements are deferred.
Its technical standards, chess legality, code separation, licensing, and viewport checks still apply.

How Region 1 was built and checked, written as the steps and quality bars every Region should meet. The design documents say *what* the game is; this says *how* to add to it without drift. Where a rule can be a test, it should be one; the commands are in the [README](../README.md#run-it).

## Order of work

1. **Design first.** Copy the [Region template](design/regions/region-template.md) and fill it in: faction and AI habit, curriculum mapping, the map's main path and branches, battles and their warm-ups, boss, hero and story beats. Start from the Region's row in the [battle outline](design/campaign.md#battle-outline-by-region). Check it against the [pillars](design.md#vision-and-pillars), the [main arc](design/story.md#main-story-arc) and the [names](design/glossary.md). Get the design approved by the owner before building content; for Region 2 onward, through the Region's spec issue on GitHub. Design questions you can't settle go to [open TODOs](design/decisions.md#open-todos).
2. **Rules before content.** New rules (a faction habit, a new objective kind, a power) go in `src/game` or `src/ai` with unit tests, before any battle uses them. `src/game` has no screen code. Every habit must follow [tell or tilt, never force](design/systems.md#ai-habits-by-faction). A new habit also needs the simulator to model it in the enemy's reply (`scripts/verify/simulate.ts` passes the shout to the same weighted pick as the game); the strong simulated player doesn't rely on it, or the verification bars below mean nothing.
3. **Art.** Make the faction's token and portrait set, and any backgrounds, as [Art direction](design/art.md) describes. Then check the tokens on the real board at phone size (below).
4. **Battles.** Write each battle as a `BattleDef`, meeting the [content rules](#battle-content-rules), and verify it with the engine until it meets the [bars](#verification-bars).
5. **Warm-ups, bounties, boss, hero.** One warm-up per battle, meeting the [warm-up rules](#warm-up-content-rules); tip cards for the Region's puzzle-only themes, each with at least one bounty in the pack; bounty puzzles built from the curriculum's tags, tip-card tags included (`npm run puzzles`); the boss duel verified like a battle, with a boss warm-up only if it tests something the battles didn't.
6. **Play it.** Play every battle yourself on Gentle and Brave, at desktop and phone sizes, and fix what feels flat or confusing.
7. **Review, deploy, record.** A fresh-eyes review, a deploy and a live check, then the records (below).

Work in small steps, each one tested, checked in the browser, committed, and logged in [build progress](progress.md).

## Battle content rules

These rules cover custom short battles. Ambushes follow their own rules below. Bosses retain the separate full-game bars under Verification.

The battle content tests (`src/game/region1Battles.test.ts`) check these. Today the tests are written for Region 1 (they expect the region "The Bog" and shouting enemies); making them run for every Region is an [open TODO](design/decisions.md#open-todos).

- A legal start with White to move, the enemy not already in check, and villages empty.
- 4 to 10 pieces per side, so the board reads at 45 px squares.
- Across a Region's battles, White has a knight, a bishop and a rook in at least three battles each, so every starter companion usually appears as a named character.
- A move limit of 5 to 10. A siege lasts 5 to 10 enemy turns, has villages, and uses the `raider` AI.
- A reward of 15–25g, and exactly two different bonus goals at 5g each. A `quick` goal, if a battle has one, sits below the move limit. Pick goals that teach a habit: flawless for protection battles, quick for mates.
- Not winnable on the first move, and a win-material goal bigger than any single enemy piece, so a battle needs a plan, not a grab.
- One scripted winning line per battle that the test plays through.
- 2 to 4 dialogue lines before the battle, 1 or 2 after, and a tip. Their length follows the [voice guide](design/story.md#voice-and-dialogue), which the tests don't check.

## Map rules

The [guided path](design/campaign.md#guided-path) sets the shape:

- A main path of the headline battles in teaching order, usually 3, each opening the next.
- Branches open after the main path: revisits of earlier Regions, mates and endgames.
- The boss opens after 4 wins: the whole main path, plus 1 branch when it has 3. Elsewhere, link to this rule rather than restating it.
- Every theme in the Region's curriculum row is either a battle (with a warm-up) or a tip card. No separate lessons.

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

These engine checks cover custom battles and bosses. Published ambush content needs legal replays and integration checks, not simulated-player tournaments.
Shared-code changes still run any engine regression checks selected by `npm run ci`. Do not weaken the selector to skip them.

`npm run verify:battles` plays every battle and the boss many times with the real enemy AI, the faction habit included, using simulated players (`scripts/verify/`). The battles take about 8 minutes and the boss longer, so `npm run ci` runs each only when a change can affect it. A battle passes when:

- A **strong** player (Stockfish, aware of the habit) wins at least 90% on Gentle and on Brave, and earns each bonus goal in at least half its wins.
- A **careless** player (a random pick from a shallow search's top five) wins at most 40%.
- A strong player needs **4 to 7 moves** on average (pillar 2: short, sharp battles). Fewer means the first trick ends it; more means it drags. The test reports this but doesn't enforce it, so read the average-moves column.
- Every win ends for a reason that fits the goal (for example, a material battle isn't won by a draw).

The boss passes when, with each starter's typical army at the budget, a strong player loses (checkmate or draw) at most 15% of games and wins at least 60%. A boss is a full game, so it gets a looser bar than a battle; games that hit the simulator's 80-move cap count as unfinished, not lost (`scripts/verify/boss.verify.test.ts`). Report the "greedy" player's rate too: when it's high, a battle may reward grabbing over thinking.

When a new rule changes how battles end (as material goals once did), re-run verification for every Region, not just the new one (`npm run ci -- --full`).

## Ambush content rules

- Use published positions, setup moves, solver moves and replies without alteration. Stop at the solution endpoint.
- Keep 1–3 solver moves per wave. The pilot has one shown example, four waves and one backup per wave.
- Apply the bounty quality filter. Record source id, URL, rating, quality fields and why each puzzle teaches the idea.
- Verify that the solver performs the tagged tactic. Show its banner on that move, not an unrelated final capture.
- Check legality, solution replay, alternative mates and rating order. A backup stays within 75 points of its main puzzle.
- Reserve all selected ids from bounty and warm-up content. Review each board and its line for teaching fit and variety.
- Test hints, misses, retries, first-win rewards, bonus rewards and exactly-once settlement.
- Test exits and reloads, including exits during setup, replies and victory animations. Leaving teaching is free.
- Keep the pilot save separate. Grandmaster removal blocks both Retry and direct launch; Reset Pilot clears only pilot data.
- Review the code independently, then play through the four viewport sizes. Record human feedback separately from automated checks.

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
