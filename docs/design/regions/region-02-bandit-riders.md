# Region 2: Bandit Riders

[Design overview](../../design.md) · [Campaign and curriculum](../campaign.md) · [Story and characters](../story.md) · [Region template](region-template.md) · [Region 1 (worked example)](region-01-bog-goblins.md) · [Playbook](../../playbook.md)

## Design status

**Brief approved 2026-10-22; detailed design not started.** This page is the brief: the calls the owner has made, and the limits for the parts still to design. Sections marked **To design** are filled in by whoever builds the Region, then approved by the owner before any content is built ([playbook](../../playbook.md#order-of-work)). Work is tracked in the Region 2 spec issue on GitHub and its child issues.

| | |
| --- | --- |
| Faction | Bandit Riders: masked highway thieves. Raccoon cutpurses, hare riders, magpies, badgers, a stoat and Ashfang the wolf, in dark cloaks and masks ([species](#art)) |
| Headline theme | Forks, double attacks, mating patterns; revisits safe trades |
| AI habit | **Wanted poster:** each turn they mark the piece they're hunting, but not the move ([details](#ai-habit-wanted-poster)) |
| Battles | 5 on a branching map; the boss opens after any 4 wins |
| Academy | One lesson per battle theme, taught by your starter companion (5 lessons) |
| Bounty tags | `fork`, `doubleCheck`, `mateIn2`; one or two bounties from Region 1's `hangingPiece` and `mateIn1` |
| Boss | Ashfang, the Bandit Lord: a 16-point budget, queens allowed, and he posts no wanted posters |
| Hero | Tadwell, the Frog Captain: a knight |
| Places | The Kingsroad (region), Waymeet (town), the Broken Wheel (tavern) |

## What's decided and what's open

Decided by the owner (don't change without a decision-log row):

- The species, names and places in the table above.
- The habit and how it fades: target only, Squire advice names it, the boss has none.
- The numbers: 5 battles, 4 wins open the boss, 15–25g per battle, a 50g boss, a 16-point boss budget.
- The Scrying Orb arrives here: 3 charges for 30g in Waymeet.
- The hero is a frog knight captain of the old army.
- XP, levels and titles are **not** in Region 2. They get their own issue later.

Open for the builder to design, within the limits below: the five battle positions and squad names, the academy positions, all dialogue, the boss army's exact pieces, and the map's branching.

## AI habit: wanted poster

Approved 2026-10-22 ([AI habits](../systems.md#ai-habits-by-faction)). Details settled with this brief:

- **The target.** Before your move, the bandits ask the engine for their best line if you passed. The first of your pieces that line wins or attacks is the target. A poster icon sits over it.
- **Their choice.** Among their good moves (the difficulty's centipawn window), they prefer one that attacks or wins the target. They never commit to a move, so there's no "Foiled!" and no forced reply.
- **No target.** If their best line wins or attacks nothing, no poster shows that turn.
- **Kings.** Your king is never the target; a check is shown by the board as usual.
- **Squire advice.** Your companion names the target a moment later ("They're hunting your mage!"). On Knight, only the icon shows.
- **Rewind.** A rewind shows the same poster again, as Region 1 does with shouts.
- **Battle review.** No special case. The enemy isn't committed, so your move is judged the normal way. The builder confirms this holds in practice.
- **Simulation.** `npm run verify:battles` needs a strong player that sees the poster, as `scripts/verify/simulate.ts` sees shouts.
- **Ladder.** The second rung in [Powers and rewind](../systems.md#powers-and-rewind): you know what they want, not how. Forks and double attacks are how the target gets hit.

## Scrying Orb

The Orb shows the full move the enemy would play if you passed: the same engine question as a goblin shout. It's sold in Waymeet as **3 charges for 30g**, bought with bounty gold. A charge lasts one turn. Charges carry over between battles, work on every difficulty, and work in the boss duel. Bought charges stack with no cap.

It overlaps the poster on purpose: it bridges the drop from Region 1's whole move to Region 2's target only.

## Map

**To design.** Five battles on a branching map like [Region 1's](region-01-bog-goblins.md#map): the first battle opens two paths, one battle can be skipped, and the boss opens after any 4 wins.

## Battles

**To design.** One row per battle, as in the [template](region-template.md#battles). Each battle must meet the [content rules and verification bars](../../playbook.md#battle-content-rules). These slots set each battle's theme:

| # | Slot | Kind · theme | Limits |
| --- | --- | --- | --- |
| 1 | First ambush | Skirmish · knight forks | The poster shows which piece a hare rider is after; you dodge with tempo, then land a fork of your own |
| 2 | Double trouble | Skirmish · double attacks | A queen, bishop or rook fork, not only knights; the target is one half of the attack |
| 3 | Two at once | Skirmish · double check | A position where the only way through is a double check |
| 4 | The banner wagons | Siege · safe trades (revisit) | The villages are banner wagons; reuse the siege rules and the `raider` AI |
| 5 | Into the trap | Skirmish · mating patterns | Mate in 2 or 3 from Lichess Checkmate Patterns II–IV. Leave smothered, Anastasia's, Arabian and Boden's mates to the Gauntlet ([campaign](../campaign.md#campaign-and-gauntlet)) |

Enemy squads are knight-heavy: most battles give the bandits at least one hare rider. Rewards are 15–25g with two 5g bonus goals each, as in Region 1.

## Academy

**To design.** One lesson per battle theme (forks, double attacks, double check, safe trades, mating patterns), each 2 or 3 practice positions with unlimited undo. Your starter companion teaches every lesson, whichever piece it's about. Each exercise pays 10g on its first clear. Link each lesson from its battle's briefing.

## Bounty board

Tags `fork`, `doubleCheck` and `mateIn2`, plus one or two bounties from Region 1's `hangingPiece` and `mateIn1`. Rating range and pay follow the [bounty rules](../systems.md#bounty-board-and-gold). The pack is built by `npm run puzzles` into `public/puzzles/region2/`, deduplicated against Region 1.

## Boss: Ashfang's Toll Gate

- **Setup:** you pick up to 16 points from the pieces you own. Queens are allowed, so Saffron can fight. Ashfang holds the last banner behind a knight-heavy army of about 17 points. The builder picks the exact pieces.
- **Goal:** checkmate, with no move limit. 50g, plus two 10g bonus goals.
- **No posters:** the final exam, as Grubnak's silence was in Region 1. The habit the posters taught has to work without them. If the boss plays long games without them, soften his AI per difficulty, as Region 1 did.
- **The lesson:** guard against knight forks, and use your own forks to win material before the mating attack.
- Verified to the [boss bar](../../playbook.md#verification-bars).

## Hero: Tadwell, the Frog Captain

A captain of the Lion King's old army, found guarding the last banner in Ashfang's camp. He joins as a named knight. He's formal and dutiful, proud of the old army, and a little stiff: a straight-backed contrast to Sir Hob's showing off. Like every hero, he doesn't teach lessons. He first matters in Region 3.

## Story beats

- **Arrival:** bandits have stolen the old army's banners along the Kingsroad, so the army can't regroup. Your companion explains the wanted posters.
- **Each battle:** a short exchange with that battle's bandit squad. Each win recovers a banner.
- **After the boss:** Ashfang yields the road and Tadwell is freed with the last banner. Ashfang's paymaster's purse carries a Shadow Cult crystal: the hook into Region 3.
- **The Lich King's hint** (one per Region from here on): one recovered banner bears the old Lion King's crest, struck through. Nobody explains it yet.
- **Interlude:** one or two lines from the Lich King, cold and courtly ([voice](../story.md#recurring-characters)). A draft to start from: "Keep the banners, little king. I flew mine once, at the game I would not lose."

All lines follow the [voice guide](../story.md#voice-and-dialogue).

## Art

The Bandit Rider token and portrait set, made as [Art direction](../art.md#adding-a-faction) describes. Masks and dark cloaks, roadside gear, the shared headgear shapes. About $2 to $4 including retries.

| Piece | Species | Name in the game | Short name |
| --- | --- | --- | --- |
| Pawn | Raccoon (the mask is its own) | Raccoon Cutpurse | raccoon |
| Knight | Hare | Hare Rider | hare |
| Bishop | Magpie | Magpie Fence | magpie |
| Rook | Badger | Badger Bruiser | badger |
| Queen | Stoat | Stoat Duchess | stoat |
| King | Wolf (Ashfang) | Bandit Lord | lord |

Also needed: a portrait for Tadwell (a frog knight in the old army's colors, distinct from Sir Hob), and backgrounds for the Kingsroad map, Waymeet and roadside battles.

## Verification

**To fill in** with the `npm run verify:battles` table, as in [Region 1](region-01-bog-goblins.md#verification).

## Playtest

**To fill in** after playtests: who played, how long it took, where they got stuck or bored, and what changed.
