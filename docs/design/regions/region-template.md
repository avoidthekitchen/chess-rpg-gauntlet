# Region template

[Design overview](../../design.md) · [Region 1 (worked example)](region-01-bog-goblins.md) · [Playbook](../../playbook.md)

Copy this file to `region-NN-<faction>.md` for each new Region. Fill every section before building; a section you can't fill yet becomes an [open TODO](../decisions.md#open-todos). [Region 1](region-01-bog-goblins.md) shows each section filled in. Shared rules live in the topic documents; link to them instead of restating them here.

## Design status

One line: designing / approved / built / playtested, with the date and a link to the live build or branch.

Then a summary table with these rows:

| | |
| --- | --- |
| Faction | Name, and how its outfit and colors set it apart (same species as everyone; see [Art](../art.md)) |
| Headline theme | From the [curriculum](../campaign.md#curriculum) row, plus what it revisits |
| AI habit | The faction's readable habit ([AI habits](../systems.md#ai-habits-by-faction)) |
| Battles | How many (4 to 6), and how many wins open the boss |
| Academy | One lesson per battle theme, named |
| Bounty tags | The Lichess puzzle tags from the curriculum row |
| Boss | Name, points budget and piece caps, and whether the habit applies |
| Hero | Name, species and piece |
| Places | Region, town and tavern names |

## AI habit

What the faction does every turn, why it teaches this Region's theme, and where it sits on the ladder in [Powers and rewind](../systems.md#powers-and-rewind). Say what the companion's Squire-only advice adds. Habits are behavior layered over the engine; they never change how pieces move.

## Map

A mermaid diagram of nodes and paths, as in Region 1: which battles open which, and how many wins open the boss.

## Battles

One row per battle:

| # | Battle (enemy squad) | Kind · theme | Goal | The idea | Moves (strong player) | Reward · bonus goals |
| --- | --- | --- | --- | --- | --- | --- |

"The idea" is the puzzle in one or two sentences: what the habit and the position set up, and the second decision after the first. Every battle must meet the [content rules and verification bars](../../playbook.md#battle-content-rules).

## Academy

One lesson per battle theme, each with 2 to 4 practice positions and unlimited undo. Name the teacher (usually a companion) and which battle each lesson prepares for.

## Bounty board

The puzzle tags, the rating range, and which earlier Regions' tags are mixed in (one or two bounties, as the spiral does).

## Boss

Setup (budget, caps, the boss army), goal, rewards and bonus goals, whether the faction habit applies, any per-difficulty AI adjustment, and the chess lesson the duel tests.

## Hero

Who they are, how they're found, their piece type, their voice (see the [cast](../story.md#recurring-characters)), and when they first matter, for example when a later boss budget allows them.

## Story beats

Arrival, the per-battle exchanges, the boss confrontation, and the hook into the next Region. They must fit the [main arc](../story.md#main-story-arc) and the [voice guide](../story.md#voice-and-dialogue).

## Art

The new art this Region needs: the faction token and portrait set, backgrounds, and any hero portrait. How to make it is in [Art direction](../art.md).

## Verification

The `npm run verify:battles` table: strong and careless win rates at each difficulty, and the average moves.

## Playtest

Who played, how long it took, where they got stuck or bored, and what changed as a result.
