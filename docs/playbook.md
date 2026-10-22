# Playbook: building a Region

[Design overview](design.md) · [Region template](design/regions/region-template.md) · [Region 1 (worked example)](design/regions/region-01-bog-goblins.md) · [Build progress](progress.md)

How Region 1 was built and checked, written as the steps and quality bars every Region should meet. The design documents say *what* the game is; this says *how* to add to it without drift. Where a rule can be a test, it should be one; the commands are in the [README](../README.md#run-it).

## Order of work

1. **Design first.** Copy the [Region template](design/regions/region-template.md) and fill it in: faction and AI habit, curriculum mapping, battles, academy lessons, boss, hero and story beats. Check it against the [pillars](design.md#vision-and-pillars), the [main arc](design/story.md#main-story-arc) and the [names](design/glossary.md). Get the design approved before building content. Design questions you can't settle go to [open TODOs](design/decisions.md#open-todos).
2. **Rules before content.** New rules (a faction habit, a new objective kind, a power) go in `src/game` or `src/ai` with unit tests, before any battle uses them. `src/game` has no screen code. A new habit also needs a simulated player that understands it (`scripts/verify/simulate.ts` has one for shouts), or the verification bars below mean nothing.
3. **Art.** Make the faction's token and portrait set, and any backgrounds, as [Art direction](design/art.md) describes. Then check the tokens on the real board at phone size (below).
4. **Battles.** Write each battle as a `BattleDef`, meeting the [content rules](#battle-content-rules), and verify it with the engine until it meets the [bars](#verification-bars).
5. **Academy, bounties, boss, hero.** One academy lesson per battle theme; bounty puzzles built from the curriculum's tags (`npm run puzzles`); the boss duel verified like a battle.
6. **Play it.** Play every battle yourself at Squire and Knight, at desktop and phone sizes, and fix what feels flat or confusing.
7. **Review, deploy, record.** A fresh-eyes review, a deploy and a live check, then the records (below).

Work in small steps, each one tested, checked in the browser, committed, and logged in [build progress](progress.md).

## Battle content rules

The battle content tests (`src/game/region1Battles.test.ts`) check these. Today the tests are written for Region 1 (they expect the region "The Bog" and shouting enemies); making them run for every Region is an [open TODO](design/decisions.md#open-todos).

- A legal start with White to move, the enemy not already in check, and villages empty.
- 4 to 10 pieces per side, so the board reads at 45 px squares.
- Across a Region's battles, White has a knight, a bishop and a rook in at least three battles each, so every starter companion usually appears as a named character.
- A move limit of 5 to 10. A siege lasts 5 to 10 enemy turns, has villages, and uses the `raider` AI.
- A reward of 15–25g, and exactly two different bonus goals at 5g each. A `quick` goal, if a battle has one, sits below the move limit. Pick goals that teach a habit: flawless for protection battles, quick for mates.
- Not winnable on the first move, and a win-material goal bigger than any single enemy piece, so a battle needs a plan, not a grab.
- One scripted winning line per battle that the test plays through.
- 2 to 4 dialogue lines before the battle, 1 or 2 after, and a tip. Their length follows the [voice guide](design/story.md#voice-and-dialogue), which the tests don't check.

## Verification bars

`npm run verify:battles` plays every battle and the boss many times with the real enemy AI, the faction habit included, using simulated players (`scripts/verify/`). It takes a few minutes. A battle passes when:

- A **strong** player (Stockfish, aware of the habit) wins at least 90% at Squire and at Knight, and earns each bonus goal in at least half its wins.
- A **careless** player (a random pick from a shallow search's top five) wins at most 40%.
- A strong player needs **4 to 7 moves** on average (pillar 2: short, sharp battles). Fewer means the first trick ends it; more means it drags. The test reports this but doesn't enforce it, so read the average-moves column.
- Every win ends for a reason that fits the goal (for example, a material battle isn't won by a draw).

The boss passes when a strong player wins at least 85% with each starter's typical army at the budget. Report the "greedy" player's rate too: when it's high, a battle may reward grabbing over thinking.

When a new rule changes how battles end (as material goals once did), re-run verification for every Region, not just the new one.

## Checks before each commit

- `npm test` passes and `npx tsc --noEmit` is clean.
- `npm run verify:battles` passes if any battle, rule or AI changed.
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
