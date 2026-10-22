# Names and terms

[Design overview](../design.md) · [Story and characters](story.md) · [Game systems](systems.md)

One place for the names the game shows, so every screen, line of dialogue and document uses the same words.

## Pieces

| Chess piece | Species name (portraits, tavern, starter screen) | Short name (status text, banners, advice) |
| --- | --- | --- |
| Pawn | Mouse Squire | squire |
| Knight | Frog Knight | knight |
| Bishop | Owl Mage | mage |
| Rook | Tortoise Golem | tower |
| Queen | Fox Sorceress | sorceress |
| King | Lion King | king |

- **Tortoise Golem** is the canonical species name (decided 2026-10-22). The code still says "Tortoise Tower" in battle and the tavern (`SPECIES` in `src/ui/speaker.ts`); renaming it is an [open TODO](decisions.md#open-todos). "Tower" stays the short name.
- A promoted pawn is **knighted**, whatever it becomes.
- Chess terms (check, checkmate, fork, pin, file, rank) are used as they are in real chess, in dialogue and lessons alike, so everything carries over.

## Factions

| Faction | Region | In battle, its pieces are called |
| --- | --- | --- |
| Bog Goblins | 1 | Bog + species (Bog Frog Knight); the king speaks as the battle's commander |
| Bandit Riders | 2 | Bandit + species |
| Shadow Cult | 3 | To be set with the Region |
| Iron Legion | 4 | To be set with the Region |
| Bone Wardens | 5 | To be set with the Region |
| The Lich King's army | Final | To be set with the Region |

## Places

| Name | What |
| --- | --- |
| Pawnshire | The game, and the Lion King's kingdom |
| The Bog | Region 1 |
| Mudford Town | Region 1's town |
| The Muddy Mug | Region 1's tavern |

## Game terms

| Term | Meaning |
| --- | --- |
| Companion | Your starter character (Sir Hob, Sage Ollie or Old Brick) |
| Hero | A named character who joins at the end of a Region |
| Militia | Unnamed pieces in a battle's set lineup |
| Shout | A Bog Goblin announcing its next move ([details](regions/region-01-bog-goblins.md#ai-habit-shouting-goblins)) |
| Foiled! | The banner when your move makes a shouted move illegal |
| Threat Sight | Highlights for squares the enemy attacks and your pieces that can be won |
| Rewind | Undo your last move and the enemy's reply; limited charges in battles |
| Bounty | A real Lichess puzzle on the town's bounty board that pays gold |
| Bonus goal | An optional goal in a battle that pays extra gold once (shown as a star on the map) |
| Boss budget | The most points of army you may bring to a boss duel |
| Gauntlet | The replay mode that unlocks after the campaign |
