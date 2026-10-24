# Region 1: Bog Goblins

[Design overview](../../design.md) · [Campaign and curriculum](../campaign.md) · [Story and characters](../story.md) · [Battle rules](../systems.md#battles) · [Region template](region-template.md) · [Playbook](../../playbook.md)

## Design status

Built, deployed and engine-verified ([play it](https://unformedideas.com/chess-rpg/)); not yet playtested with people. The goblins' shout change is built (they decide again after your move); the battles are being re-verified against it, and the faction's new species art is in flight. Another is approved but not specced: the [guided path](#planned-guided-path) revision. This is the worked example for every later Region: it follows the [Region template](region-template.md), and the [playbook](../../playbook.md) describes how it was built and checked. Implementation history is in the [build progress](../../progress.md).

| | |
| --- | --- |
| Faction | Bog Goblins: their own swamp creatures (bog rats, salamanders, crows, snapping turtles, vipers and Grubnak the Toad Chief) in muddy rags, wearing the same chess headgear as ours ([Art](../art.md)) |
| Headline theme | Threat awareness, protection, safe trades, basic checkmates; revisits pawn promotion basics |
| AI habit | **Shouting:** before your move the goblins announce the move they'd play if you passed, then decide again after your move ([details](#ai-habit-shouting-goblins)) |
| Battles | 5 on a branching map; the boss opens after any 4 wins |
| Academy | Rook and queen checkmates (Lichess Practice: Piece Checkmates I) |
| Bounty tags | `hangingPiece`, `mateIn1` |
| Boss | Grubnak, the Goblin Chief: a 10-point budget, no queen, and he doesn't shout |
| Hero | Saffron, the Fox Queen |
| Places | The Bog (region), Mudford Town, the Muddy Mug tavern |

## AI habit: shouting goblins

Before each of your moves, the goblins announce the move they would play if you passed (`src/ai/shout.ts`, using `planIfPassed` in `src/ai/intent.ts`). It's drawn as a green arrow and spoken by the piece's portrait. The status line says "Your move can change it."

After your move they decide again. The enemy's [one weighted pick](../systems.md#ai-habits-by-faction) gives the shouted move a x3 bonus (`SHOUT_BONUS` in `src/ai/enemy.ts`), so they usually keep a plan that's still fine and often drop one that has become bait. Players can't count on either. If your move made the shout impossible, a "Foiled!" banner shows. That includes moving away the piece they shouted they'd capture. If they drop a shout that still stands, they say why: "Oi! You've guarded it!" when the shout was a capture you guarded, otherwise "Changed my mind!". If they keep it, they say "Told you I would!". A rewind hears the same shout again. The map intro tells the player: "They shout their plan before they move, and your move can change it." The companion adds: "Their arrow shows one plan. Other threats still count, so keep looking!"

It teaches the first rung of the ladder in [Powers and rewind](../systems.md#powers-and-rewind): the enemy says its plan out loud. Because the goblins decide again, a trap isn't certain. You can guard the piece they promised to take, or make bait less attractive, but they may take it or walk away. That keeps each turn a small puzzle, like Into the Breach, without teaching that opponents walk into traps.

On Gentle, your companion reads each shout for you a moment later. It says whether the target is guarded, whether the trade is fair, or that a village or your king is the target. Brave leaves it to you ([help that fades](../../design.md#vision-and-pillars)).

## Map

```mermaid
flowchart BT
    Town["Mudford Town"] --> Reeds["1 Trouble in the Reeds"]
    Reeds --> Guard["2 Lanterns at Mossbridge"]
    Reeds --> Trades["3 The Swap Meet"]
    Guard --> Squire["5 The Pawn's Plunge"]
    Trades --> Backrank["4 Behind the Mud Wall"]
    Squire -.-> Boss["Goblin Chief's camp<br/>opens after any 4 wins"]
    Backrank -.-> Boss
```

The first skirmish opens both paths, so one battle can be skipped (`src/game/region1.ts`). Cleared battles show a star per bonus goal earned.

## Battles

All five are in `src/game/region1Battles.ts`, which includes a comment per battle explaining the position. A strong simulated player wins each 92–100% of the time on Gentle and Brave, and careless play wins 0–33% ([verification](#verification)).

| # | Battle | Kind · theme | Goal | The idea | Moves (strong player) | Reward · bonus goals |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Trouble in the Reeds (Goblin Scouts) | Skirmish · threat awareness | Win 7 points of material within 10 moves | The shout says a pawn will take your knight. Move it where it bites back: Ne7+ forks the king and the loose rook. Then pick up two more loose pawns while the goblins guard what they can | 5 | 15g · flawless, no rewind |
| 2 | Lanterns at Mossbridge (Mudfoot Raiders) | Siege · protection | Keep villages c4 and e3 safe for 9 enemy turns | The raiders shout Nxb2. Save the bishop first, or their knight joins the attack on c4. Then both pawns march onto the villages, and only the knight and rook guard them. Keep each guard at its post, count guards against attackers (including pawns that can step up) after every move, and capture every raider that lands | about 9 | 20g · flawless, no rewind |
| 3 | The Swap Meet (Goblin Hagglers) | Skirmish · safe trades | Win 4 points within 10 moves | Their knight is pinned, attacked twice and guarded twice, so taking it loses material. The shout is usually the king stepping out of the pin. Add the cheapest third attacker (e4) first, then count again before each trade | about 5 | 20g · within 6 moves, no rewind |
| 4 | Behind the Mud Wall (Bogwall Sentries) | Skirmish · basic checkmates | Checkmate within 8 moves | One rook guards the back rank. Check along it so the rook must block and is pinned, then check with the bishop and take each blocker with check until the rook falls with mate. The shout (a bishop grab) is real, but checks come first | 4–5 | 20g · within 5 moves, no rewind |
| 5 | The Pawn's Plunge (Puddle Runners) | Promotion run · promotion basics | Promote safely within 10 moves | Two pawns side by side face a goblin pawn on a7 and a knight blocking the c-pawn. Push b6: if they take, cxb6 leaves a passed pawn the knight can't stop on b8. Answer the knight's checks and the goblin pawns' pushes on the way | 4–5 | 25g · within 6 moves, no rewind |

Lineups are set by the scenario: your hired pieces stand in as named characters (starter first), and the rest are unnamed militia ([rule](../systems.md#battles)). Across the five battles, White has a knight, a bishop and a rook in at least three each, so every starter usually appears named.

## Academy

As built, one lesson, taught by Sage Ollie: **Rook and queen checkmates**, as two practice battles (The Queen's Net, The Rook's Box) with unlimited undo against a lone king that defends perfectly. The first clear of each pays 10g (`src/game/academy.ts`).

The [guided path](#planned-guided-path) replaces this academy with a warm-up in each battle node; these two exercises become Grubnak's boss practice.

## Planned: guided path

Approved 2026-10-22, not yet built. Region 1 is revised to the [guided path](../campaign.md#guided-path) as the worked example for every later Region. The code changes will be specced in a GitHub issue ([open TODO](../decisions.md#open-todos)).

```mermaid
flowchart BT
    Town["Mudford Town"] --> Reeds["Main 1: Trouble in the Reeds<br/>threat awareness"]
    Reeds --> Guard["Main 2: Lanterns at Mossbridge<br/>protection"]
    Guard --> Trades["Main 3: The Swap Meet<br/>safe trades"]
    Trades --> Backrank["Branch: Behind the Mud Wall<br/>back-rank mate"]
    Trades --> Squire["Branch: The Pawn's Plunge<br/>promotion"]
    Backrank -.-> Boss["Goblin Chief's camp<br/>opens after 4 wins"]
    Squire -.-> Boss
```

| Battle | Warm-up idea | Warm-up tag |
| --- | --- | --- |
| Trouble in the Reeds | "What do they want?" Look at every check, capture and threat | `hangingPiece` |
| Lanterns at Mossbridge | "Guard it, move it or block it" | `defensiveMove` |
| The Swap Meet | "Count attackers and defenders" | `hangingPiece` |
| Behind the Mud Wall | "The back rank" | `backRankMate` |
| The Pawn's Plunge | "Run it home safely" | `promotion` |
| Grubnak (boss practice) | The Queen's Net and The Rook's Box, as built: played out to mate, unlimited undo, skippable | — |

Also planned: the academy becomes the library (with a review set), bounty tags add `defensiveMove`, `backRankMate` and `promotion`, refresher bounties, and the in-battle lesson panel cut to a one-line reminder: "Checks, captures, threats: theirs, then yours." The battles themselves don't change, so their verification stands.

## Bounty board

Four bounties at a time come from real Lichess puzzles, spread across ratings so pay differs. The packs contain 150 `mateIn1` and 150 `hangingPiece` entries, rated 400–1899. Puzzle deduplication is complete: the loader removes 12 shared IDs, leaving 288 unique puzzles. The build script also prevents duplicates across future packs. The board refreshes after every battle, and each bounty gets one try ([rules](../systems.md#bounty-board-and-gold)). The puzzle files are built by `npm run puzzles` into `public/puzzles/region1/`.

## Boss: Grubnak's Last Stand

- **Setup:** you pick up to 10 points from the pieces you own (no queen) on the muster screen, placed on their usual home squares. Grubnak, the Goblin Chief, sits behind a full wall of eight pawns and one knight (11 points) (`src/game/region1Boss.ts`).
- **Goal:** checkmate, with no move limit. 50g, plus 10g each for no rewinds and for winning within 30 moves.
- **He doesn't shout:** this is the region's final exam. The habit the shouts taught ("what does the enemy want?") has to work without them. Without shouts he played 40–50 move games, so he's a little clumsier on Gentle and Brave ([tuning values](../systems.md#tuning-values)).
- **The lesson:** develop, keep pieces protected, trade only when it's safe, open a file for the rook, then hunt the king.

## Hero: Saffron, the Fox Queen

Locked in Grubnak's pantry and freed when you win. She joins your army as a named hero (a queen) with her own portrait and lines, and says the Lich King sends his bandits next. Grubnak bans queens, so she matters from Region 2 on. She joins only once; replaying the duel pays only bonus goals not yet earned.

## Story beats

- **Arrival:** the Bog Goblins have crept out of the marsh, stealing pots, pies and the occasional village. Your companion explains that they shout their plans. Grubnak taunts you from his camp.
- **Each battle:** a short before-and-after exchange between the companion and that battle's goblin squad (`before` and `after` in each battle).
- **After the boss:** Grubnak gives up the Bog, Saffron is found in the pantry, and she points to the Lich King's bandits: the hook into Region 2.

Characters introduced here: Grubnak and Saffron (recurring; see the [cast](../story.md#recurring-characters)), and five goblin squads named for their battles.

## Art

The Bog Goblin token and portrait set (their species and in-game names are in [Art direction](../art.md)), plus painted backgrounds for the title, the region map, the town and battles.

## Verification

`npm run verify:battles` plays every battle and the boss against the real enemy AI, shout rule included, with simulated players. Results as of the last run:

| Battle | Strong player wins (Gentle / Brave) | Strong player's average moves | Careless player wins (Gentle / Brave) |
| --- | --- | --- | --- |
| Trouble in the Reeds | 96% / 96% | 5.8 / 5.7 | 0% / 0% |
| Lanterns at Mossbridge | 100% / 100% | 9.0 / 9.0 | 21% / 33% |
| The Swap Meet | 92% / 100% | 3.8 / 4.9 | 4% / 0% |
| Behind the Mud Wall | 100% / 100% | 4.4 / 4.6 | 0% / 0% |
| The Pawn's Plunge | 100% / 100% | 4.2 / 5.0 | 0% / 4% |
| Boss duel | Passed the boss bar when the no-shout boss merged (about 92% wins). Not re-run for the shout change: the boss doesn't shout or raid, so its AI is unchanged (a one-army spot check matched `main`). The full check takes over an hour | — | — |

A simulated "greedy" player (always grabs the biggest capture, else pushes a pawn) wins The Pawn's Plunge often (about 80%), because its breakthrough push is also the greedy move. Mossbridge runs 9 turns, so its average moves sit above the 4–7 target. Both are worth watching in playtests.

## Playtest

Not yet run. The test from the original scope still stands: 3 to 5 people who know the moves but lose to tactics play Region 1. It should take them 30 to 45 minutes; the planned warm-ups add about a minute per battle. Watch where they get stuck or bored, and whether they ask for Region 2. Win rates don't show whether the shout taught anything, so also ask: can they say why a goblin changed its plan, and can they spot a similar threat with no arrow? Once the guided path is built, also watch whether players who know an idea skip its warm-up quickly, and whether the try positions feel too easy or too hard. Record findings here.

## Original prototype scope

Region 1 was the smallest build that tests the whole loop: title, map, town and battle screens, a starter choice, about 5 lesson battles, shouting goblins, a boss with a 10-point budget and no queen, a hero, a tavern, one academy lesson, a bounty board of a few hundred Lichess puzzles, gold, saving, Gentle and Brave difficulties, engine-checked banners for checkmate and fork, and a Cloudflare deploy. Out of scope: Regions 2 to 5, powers, mistake bounties, the adaptive rating, the "Teach me the moves" tutorial, Champion and Grandmaster, sound, iOS and Gauntlet. The step-by-step build is in the [build progress](../../progress.md).

## Optional boss idea

An optional Bog Goblin boss could use the Horde chess variant (36 pawns, no king). That needs a variant engine such as Fairy-Stockfish.
