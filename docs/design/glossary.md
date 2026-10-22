# Names and terms

[Design overview](../design.md) · [Story and characters](story.md) · [Game systems](systems.md)

One place for the names the game shows, so every screen, line of dialogue and document uses the same words.

## Pieces

Our army. Each enemy faction has its own species and in-game names, listed with the faction in [Art direction](art.md).

| Chess piece | Species name (portraits, tavern, starter screen) | Short name (status text, banners, advice) |
| --- | --- | --- |
| Pawn | Mouse Squire | squire |
| Knight | Frog Knight | knight |
| Bishop | Owl Mage | mage |
| Rook | Tortoise Golem | tower |
| Queen | Fox Sorceress | sorceress |
| King | Lion King | king |

- **Tortoise Golem** is the canonical species name (decided 2026-10-22). The code uses it everywhere (`STARTERS` in `src/game/campaign.ts`, `SPECIES` in `src/ui/speaker.ts`). "Tower" stays the short name.
- A promoted pawn is **knighted**, whatever it becomes.
- Chess terms (check, checkmate, fork, pin, file, rank) are used as they are in real chess, in dialogue and lessons alike, so everything carries over.

## Factions

| Faction | Region | Its pieces' names |
| --- | --- | --- |
| Bog Goblins | 1 | Their own species names, in [Art direction](art.md); in battle, the king speaks as the battle's commander |
| Bandit Riders | 2 | Their own species names, in [Art direction](art.md) and the [Region 2 brief](regions/region-02-bandit-riders.md) |
| Shadow Cult | 3 | Chosen with the Region |
| Iron Legion | 4 | Chosen with the Region |
| Bone Wardens | 5 | Chosen with the Region (skeleton animals) |
| The Lich King's army | Final | Chosen with the Region |

## Places

| Name | What |
| --- | --- |
| Pawnshire | The game, and the Lion King's kingdom ([story arc](story.md#main-story-arc)) |
| The Bog | Region 1 |
| Mudford Town | Region 1's town |
| The Muddy Mug | Region 1's tavern |
| The Kingsroad | Region 2 |
| Waymeet | Region 2's town |
| The Broken Wheel | Region 2's tavern |

## Game terms

| Term | Meaning |
| --- | --- |
| Companion | Your starter character (Sir Hob, Sage Ollie or Old Brick) |
| Hero | A named character who joins at the end of a Region |
| Militia | Unnamed pieces in a battle's set lineup |
| Shout | A Bog Goblin announcing its next move ([details](regions/region-01-bog-goblins.md#ai-habit-shouting-goblins)) |
| Foiled! | The banner when your move makes a shouted move illegal |
| Wanted poster | The Bandit Riders' mark on the piece they're hunting ([details](regions/region-02-bandit-riders.md#ai-habit-wanted-poster)) |
| Scrying Orb | A power bought in town: shows the move the enemy would play if you passed |
| Threat Sight | Highlights for squares the enemy attacks and your pieces that can be won |
| Rewind | Undo your last move and the enemy's reply; limited charges in battles |
| Bounty | A real Lichess puzzle on the town's bounty board that pays gold |
| Bonus goal | An optional goal in a battle that pays extra gold once (shown as a star on the map) |
| Boss budget | The most points of army you may bring to a boss duel |
| Gauntlet | The replay mode that unlocks after the campaign |
