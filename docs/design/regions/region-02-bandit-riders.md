# Region 2: Bandit Riders

[Design overview](../../design.md) · [Campaign and curriculum](../campaign.md) · [Story and characters](../story.md) · [Region template](region-template.md) · [Region 1 (worked example)](region-01-bog-goblins.md) · [Playbook](../../playbook.md)

## Design status

**Current scope, approved 2026-10-23:** complete The Kingsroad with five published-puzzle lessons and Ashfang's mixed chapter review.
The [curriculum-first plan](../../curriculum-first.md) supersedes conflicting requirements below.
Teach knight forks, queen double attacks, double check, removing defenders, and mate in two.
Reuse the accepted Two at once pilot's runner and presentation; adapt its content to the shared three-wave lesson structure.
Keep the Bandit Riders' art direction, places, names, and short story beats.

The earlier custom battles, siege, live army boss, Scrying Orb, wanted-poster AI, and hired hero mechanics are deferred.
They do not block this Region. Ashfang's review checks ideas already taught, with no tactic label giving the answer away.
Further human pilot playtesting and another owner design approval are not required; technical validation and independent review remain required.

### Earlier pilot and Region brief

**2026-10-23 pilot exception:** [#34](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/34) replaces slot 3, Two at once, with a standalone four-wave puzzle ambush.
The owner approved its revised decisions. Do not compose a custom position for that slot while the pilot runs.
Its opening poster explains setup only. The live-battle poster below remains unchanged.
The pilot runs locally at `?ambush=r2-two-at-once`; the Region registry, map, other slots and boss are separate work.

**Brief approved 2026-10-22; detailed design not started.** This page is the brief: the calls the owner has made, and the limits for the parts still to design. Sections marked **To design** are filled in by whoever builds the Region, then approved by the owner before any content is built ([playbook](../../playbook.md#order-of-work)). Work is tracked in the [Region 2 spec issue](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/8) and its sub-issues.

| | |
| --- | --- |
| Faction | Bandit Riders: masked highway thieves. Raccoon cutpurses, hare riders, magpies, badgers, a stoat and Ashfang the wolf, in dark cloaks and masks ([species](#art)) |
| Headline theme | Forks, double attacks, mating patterns; revisits safe trades |
| AI habit | **Wanted poster:** each turn they mark the piece they're hunting, but not the move ([details](#ai-habit-wanted-poster)) |
| Battles | 5 on a [guided path](../campaign.md#guided-path): a main path of 3, then 2 branches; the boss opens after 4 wins ([unlock rule](../campaign.md#guided-path)) |
| Warm-ups | One per battle, coached by your starter companion, plus a boss warm-up on stopping forks |
| Bounty tags | `fork`, `doubleCheck`, `capturingDefender`, `mateIn2`; one or two bounties from Region 1's `hangingPiece` and `mateIn1` |
| Boss | Ashfang, the Bandit Lord: a 16-point budget, queens allowed, and he posts no wanted posters |
| Hero | Tadwell, the Frog Captain: a knight |
| Places | The Kingsroad (region), Waymeet (town), the Broken Wheel (tavern) |

## What's decided and what's open

Decided by the owner (don't change without a decision-log row):

- The species, names and places in the table above.
- The habit and how it fades: target only, Gentle advice names it, the boss has none.
- The numbers: 5 battles, 4 wins open the boss (per the [guided path](../campaign.md#guided-path) unlock rule, decided 2026-10-22), 15–25g per battle, a 50g boss, a 16-point boss budget.
- The Scrying Orb arrives here: 3 charges for 30g in Waymeet.
- The hero is a frog knight captain of the old army.
- XP, levels and titles are **not** in Region 2. They get their own issue later.

Open for the builder to design, within the limits below: the five battle positions and squad names, the warm-up positions, all dialogue and the boss army's exact pieces.

## AI habit: wanted poster

Approved 2026-10-22 ([AI habits](../systems.md#ai-habits-by-faction)). Details settled with this brief:

- **The plan behind it.** Before your move, the bandits make the same pick the Scrying Orb shows: their actual move if you passed, from the shared "if I passed" helper ([#4](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/4)). That pick uses their other habits (the raider, in a siege) but not the poster's own bonus. It is stored per position.
- **The target.** Only that one move counts, not a longer line. If it captures one of your pieces, that piece is the target. Otherwise the target is the piece it newly attacks: attacked by any bandit after the move, but not before it. A poster icon sits over the target.
- **Ties.** If the move newly attacks two or more pieces (a fork), the target is the highest-value one. Equal values go to the first square in the order a1, b1 … h8.
- **No target.** If the move captures nothing and newly attacks nothing, no poster shows that turn. Pieces that were already attacked don't count.
- **Kings.** Your king is never the target; a check is shown by the board as usual.
- **The mark follows the piece through your move.** If you move the target, the poster moves with it. After your move, the bandits decide again with one weighted pick among moves in the window. A move that captures or attacks the target, wherever it now stands, gets the **poster bonus: ×3**, a starting tuning value. Combined with the raider bonus it is capped at ×3 in total, as for every habit ([AI habits](../systems.md#ai-habits-by-faction)). Next turn a new target is chosen from scratch.
- **Their choice.** The bonus makes a move more likely, never certain. They never commit to a move, so there's no "Foiled!" and no forced reply.
- **The poster and the Orb agree.** Both come from the same stored pick, so a charge spent on the Orb always shows the move behind the poster: the route to the target. Revealing it never changes what they then play.
- **Gentle advice.** Your companion names the target a moment later ("They're hunting your bishop!"). On Brave, only the icon shows.
- **Rewind.** A rewind shows the same poster again, from the stored pick, as Region 1 does with shouts.
- **Worked positions.** The tests in [#12](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/12) use a small position for each case: a capture; a single new attack; a fork of a rook and a bishop (rook wins); a fork of two knights (square order wins); a piece that was already attacked (no poster); a quiet move (no poster); a check only (no poster); the target moved, and the bonus goes to moves that hit it on its new square; a poster plus a raider in a siege, capped at ×3; and a weighted pick that differs from the engine's best move, where the poster and the Orb still agree.
- **Battle review.** No special case. The enemy isn't committed, so your move is judged the normal way. The builder confirms this holds in practice.
- **Simulation.** `npm run verify:battles` needs a strong player that sees the poster, as `scripts/verify/simulate.ts` sees shouts.
- **Ladder.** The second rung in [Powers and rewind](../systems.md#powers-and-rewind): you know what they want, not how. Forks and double attacks are how the target gets hit.

## Scrying Orb

The Orb shows the full move the enemy would play if you passed: the same engine question as a goblin shout. It's sold in Waymeet as **3 charges for 30g**, bought with bounty gold. A charge lasts one turn. Charges carry over between battles, work on every difficulty, and work in the boss duel. Bought charges stack with no cap.

It overlaps the poster on purpose: it bridges the drop from Region 1's whole move to Region 2's target only.

**Spending a charge:**

- A charge is spent only when the reveal succeeds. If the analysis fails, or you leave the battle while it runs, nothing is spent.
- The button does nothing while a reveal is running, so repeated clicks spend one charge at most.
- The revealed move is kept for that position for the rest of the attempt. Coming back to it, by rewind or by showing it again, is free.
- A spent charge is never refunded, even when you rewind past it.
- A rewind into a different line reaches a new position, so revealing there costs a new charge.
- A retry (starting the battle again) is a new attempt: nothing is kept from the last one.

## Map

**To design.** Five battles on a [guided path](../campaign.md#guided-path), following the [map rules](../../playbook.md#map-rules): slots 1–3 below are the main path in that order, slots 4 and 5 are branches, and the boss opens after 4 wins ([unlock rule](../campaign.md#guided-path)).

## Battles

**To design.** One row per battle, as in the [template](region-template.md#battles). Each battle must meet the [content rules and verification bars](../../playbook.md#battle-content-rules). These slots set each battle's theme:

| # | Path | Slot | Kind · theme | Limits |
| --- | --- | --- | --- | --- |
| 1 | Main | First ambush | Skirmish · knight forks | The poster shows which piece a hare rider is after; you dodge with tempo, then land a fork of your own |
| 2 | Main | Double trouble | Skirmish · double attacks | A queen, bishop or rook fork, not only knights; the target is one half of the attack |
| 3 | Main | Two at once | Skirmish · double check | A position where the only way through is a double check |
| 4 | Branch | The banner wagons | Siege · safe trades and removing the defender (revisit) | The villages are banner wagons; reuse the siege rules and the `raider` AI, after it moves to tell or tilt ([AI habits](../systems.md#ai-habits-by-faction)). Taking a raider's defender should be the way to win a trade |
| 5 | Branch | Into the trap | Skirmish · mating patterns | A setup of 2 or 3 moves (win or deflect a defender, open a line) leads into a mate in 2 or 3 using a pattern from Lichess Checkmate Patterns II–IV, so a strong player needs 4 to 7 moves, as the [bars](../../playbook.md#verification-bars) ask. The position is our own: Practice positions stay in warm-ups and tip cards. The short mate is this battle's "Mate in two" warm-up. Leave smothered, Anastasia's, Arabian and Boden's mates to the Gauntlet ([campaign](../campaign.md#campaign-and-gauntlet)) |

Enemy squads are knight-heavy: most battles give the bandits at least one hare rider. Rewards are 15–25g with two 5g bonus goals each, as in Region 1.

## Warm-ups

**To design.** One warm-up per battle, following the [warm-up rules](../../playbook.md#warm-up-content-rules), with the ideas and tags from the [battle outline](../campaign.md#battle-outline-by-region): knight forks, double attacks, double check, taking the guard first, and mate in two. Ashfang gets a boss warm-up on stopping a fork before it lands (`fork` with `defensiveMove`). Your starter companion coaches every warm-up, whichever piece it's about.

## Bounty board

Tags `fork`, `doubleCheck`, `capturingDefender` and `mateIn2`, plus one or two bounties from Region 1's `hangingPiece` and `mateIn1`. Rating range and pay follow the [bounty rules](../systems.md#bounty-board-and-gold). The pack is built by `npm run puzzles` into `public/puzzles/region2/`, deduplicated against Region 1.

## Boss: Ashfang's Toll Gate

- **Setup:** you pick up to 16 points from the pieces you own. Queens are allowed, so Saffron can fight. Ashfang holds the last banner behind a knight-heavy army of about 17 points. The builder picks the exact pieces.
- **Goal:** checkmate, with no move limit. 50g, plus two 10g bonus goals.
- **No posters:** the final exam, as Grubnak's silence was in Region 1. The habit the posters taught has to work without them. If the boss plays long games without them, soften his AI per difficulty, as Region 1 did.
- **The lesson:** guard against knight forks, and use your own forks to win material before the mating attack.
- Verified to the [boss bar](../../playbook.md#verification-bars).

## Hero: Tadwell, the Frog Captain

A captain of the Lion King's old army, found guarding the last banner in Ashfang's camp. He joins as a named knight. He's formal and dutiful, proud of the old army, and a little stiff: a straight-backed contrast to Sir Hob's showing off. Like every hero, he doesn't teach lessons. He first matters in Region 3.

**A full roster.** You may already own two knights, such as Sir Hob and a hired one. A hero then replaces a hired piece of the same type and refunds its price (30g for a knight), with a line saying so. The starter is never replaced, so the army stays within a chess set ([hiring rules](../systems.md#your-army)). If you own two hired knights, the most recently hired one leaves. The tests cover a roster with both knight slots filled, with and without Sir Hob.

## Moving on from Region 1

Built in the [Region registry](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/9):

- **One record per Region.** The save keeps each Region's progress apart: battles cleared, boss beaten, hero joined. Today's global `bossBeaten` and `heroJoined` move into Region 1's record.
- **Beating Grubnak opens Region 2.** It doesn't mark Ashfang beaten or Tadwell joined.
- **Old saves.** A save from before the registry loads into Region 1 unchanged. One that has already beaten Grubnak loads with Region 1 complete and Region 2 open, keeps Saffron, and gets no second Saffron.
- **Reloading** after moving on lands you in Region 2.
- **Going back.** You can return to any earlier Region's map to play branches you skipped and earn bonus goals you missed, so you can practice more skills. Replays follow the [guided path](../campaign.md#guided-path) rules, so a cleared battle skips its warm-up.
- **Bounty board.** The board uses the newest Region's pack. When you move on, unsolved Region 1 bounties are replaced with Region 2's; puzzles you've solved or failed stay done.

## Story beats

- **Arrival:** bandits have stolen the old army's banners along the Kingsroad, so the army can't regroup. Your companion explains the wanted posters.
- **Each battle:** a short exchange with that battle's bandit squad. Each win recovers a banner.
- **After the boss:** Ashfang yields the road and Tadwell is freed with the last banner. Ashfang's paymaster's purse carries a Shadow Cult crystal: the hook into Region 3.
- **The Lich King's hint** (one per Region from here on): one recovered banner bears the old Lion King's crest, struck through. Nobody explains it yet.
- **Interlude:** one or two lines from the Lich King, cold and courtly ([voice](../story.md#recurring-characters)). A draft to start from: "Keep the banners, little king. I flew mine once, at the game I would not lose."

All lines follow the [voice guide](../story.md#voice-and-dialogue).

## Art

The Bandit Rider token and portrait set, made as [Art direction](../art.md#adding-a-faction) describes. Masks and dark cloaks, roadside gear, the shared headgear shapes. About $2 to $4 including retries.

| Piece | Species | Name in the game |
| --- | --- | --- |
| Pawn | Raccoon (the mask is its own) | Raccoon Pawn |
| Knight | Hare | Hare Knight |
| Bishop | Magpie | Magpie Bishop |
| Rook | Badger | Badger Rook |
| Queen | Stoat | Stoat Queen |
| King | Wolf (Ashfang) | Wolf King |

Status text and shouts use the plain chess name ("their knight"), like every faction.

Also needed: a portrait for Tadwell (a frog knight in the old army's colors, distinct from Sir Hob), and backgrounds for the Kingsroad map, Waymeet and roadside battles.

## Verification

**To fill in** with the `npm run verify:battles` table, as in [Region 1](region-01-bog-goblins.md#verification).

## Playtest

**To fill in** after playtests: who played, how long it took, where they got stuck or bored, and what changed.
