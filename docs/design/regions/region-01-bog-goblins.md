# Region 1: Bog Goblins

[Design overview](../../design.md) · [Campaign and curriculum](../campaign.md) · [Story and characters](../story.md) · [Battle rules](../systems.md#battles)

## Design status

The material below is the original Region 1 prototype scope. See the [build progress](../../progress.md) for implementation history, the [campaign overview](../campaign.md#regions-and-factions) for faction details and the [curriculum](../campaign.md#curriculum) for learning goals and bounty tags.

**TODO:** Expand this prototype scope into a detailed Region design covering battle sequence and branching, local story and dialogue, and boss and hero character details.

## Prototype scope

Build one complete region, the Bog Goblins, from start to boss, in Phaser. It's the smallest build that tests the whole loop: does winning battles, spending gold and facing the boss make players want region 2?

**Starting point.** The battle prototype's rules, Stockfish enemy, Threat Sight, rewind and tactic banners carry over unchanged (`src/game`, `src/ai`). Spikes added board tokens, talking-head portraits, the move and capture animations (`src/ui/pixiBoard.ts`, PixiJS), a Three.js board mockup and an AI 3D model comparison. The token art, portraits and animation design move into Phaser rather than being redone; the 3D work stays as reference only.

**In scope**

1. **Phaser 4 game** with four screens: title, region map, town and battle. The title asks "Do you know how the pieces move?" The battle board uses tokens, talking-head portraits and the classic pieces toggle.
2. **Starter choice:** frog knight, owl mage or tortoise golem, with a few tutor lines in battle.
3. **Region 1 content:** about 5 lesson battles (threat awareness, protection, safe trades, basic checkmates), goblins that shout their next move, a goblin chief boss with a 10-point budget and no queen, and a named hero recruit for winning the region.
4. **Town:** a tavern for hiring at piece value, one academy lesson (rook and queen checkmates), and a bounty board with a few hundred region 1 puzzles from the Lichess database, refreshed after each battle.
5. **Loop basics:** gold, saving progress, Squire and Knight difficulties with their loss costs, and engine-checked banners for checkmate and fork.
6. **Deploy** to Cloudflare so playtesters only need a link.

**Out of scope for now:** regions 2 to 5 and the Lich King; the Scrying Orb, Far Sight and other powers; mistake bounties and the adaptive rating; the "Teach me the moves" tutorial; Champion and Grandmaster difficulties; sound, the iOS app, Three.js and Gauntlet.

**Build order**

1. Phaser game with the battle screen ported.
2. Region 1 battles and shouting goblins.
3. Town, gold and saving.
4. Boss and hero reward.
5. Deploy and playtest.

**The test:** 3 to 5 people who know the moves but lose to tactics play Region 1. It should take them 30 to 45 minutes. Watch where they get stuck or bored, and whether they ask for region 2.

## Optional boss idea

An optional Bog Goblin boss could use the Horde chess variant (36 pawns, no king). That needs a variant engine such as Fairy-Stockfish.
