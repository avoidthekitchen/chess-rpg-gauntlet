# Game systems

[Design overview](../design.md) · [Campaign and curriculum](campaign.md) · [Story and characters](story.md)

## Battles

Battles are short scenarios on a standard 8×8 board, each with a goal, a move limit and bonus objectives. They borrow what makes Into the Breach fun without changing how pieces move.

| Into the Breach | Chess version |
| --- | --- |
| Enemies show their attacks in advance | **Threat Sight:** highlights squares the enemy attacks and your undefended pieces. Fades with difficulty. |
| Battles last about 5 turns | Move limits: "checkmate within 6 moves", "survive 8 turns" |
| Goals beyond killing (protect buildings) | Protect villages, escort a pawn to promotion, capture the standard-bearer |
| One shot hits two enemies | Forks, skewers and discovered attacks are detected and celebrated |
| Bonus objectives | "Win without losing a piece", "Use a pin", "Under 10 moves" → extra gold |
| One Reset Turn per battle | Rewind charges (see [Powers and rewind](#powers-and-rewind)) |

**Battle types**

1. **Skirmish:** small armies. Checkmate, or win material within a set number of moves.
2. **Ambush:** a real puzzle position ("the enemy walked into your trap, find the strike"), then play it out to a win against the AI. Turning an advantage into a win is a skill puzzles alone don't teach.
3. **Siege:** survive a set number of turns while protecting village squares. Teaches defence and prophylaxis.
4. **Promotion run:** escort a pawn to the far rank, where it's promoted in a small ceremony. Teaches pawn endgames.
5. **Boss duel:** a nearly full or full game against a faction leader.

**Your pieces in battle.** Every piece type can be used from the start, because players either finished the tutorial or said they know the moves. Lesson battles (skirmish, siege, promotion run) use a set lineup chosen by the scenario: pieces you've hired appear as your named characters, and the rest as unnamed militia. Ambush battles use the puzzle position as it is. Boss duels let you pick your army up to a points budget, using standard piece values. The budget grows by region, from about 10 points in region 1 to the full 39 of a complete chess set, which only the Lich King battle allows. A boss can also cap specific piece types when its lesson needs it, for example no queen in region 1. Every captured piece comes back after the battle, win or lose.

**Tactic detection.** When a move creates a known pattern, the game shows a banner like **FORK!**, **PIN!** or **SKEWER!** and pays bonus gold, like a combo in a fighting game. A banner must only appear when the tactic really works, or it teaches the wrong lesson: a "fork" where the forking piece simply gets captured is not a fork. So each banner needs two checks: a board rule spots the pattern, and the engine confirms the move actually wins something.

- **At launch (clear board rules):** checkmate, fork, double check, discovered attack, pin, skewer, back-rank mate, promotion.
- **Puzzles only (need judgment):** deflection, attraction, overloaded piece, zwischenzug, clearance, interference. These are hard to name automatically in live play, so they appear in puzzles, where the Lichess database already tags them.
- **Built so far (Region 1):** checkmate, fork, check, promotion and capture are detected (`src/game/tactics.ts`). Fork banners, yours and the enemy's, show only when Stockfish confirms the fork wins material (`src/game/tacticCheck.ts`), and a confirmed fork pays gold. Checkmate needs no engine check. The other launch patterns are still to build.

**Scenario format** (the `BattleDef` type in `src/game/content.ts`; each Region has one array of them, such as `REGION1_BATTLES` in `src/game/region1Battles.ts`): starting position (FEN) or, for bosses, the points budget and enemy setup; goal, move limit, enemy faction and AI settings, bonus objectives, rewards, and the dialogue before and after.

## Your army

You start as a king with one companion and two pawns, and build toward a full chess set by learning and earning.

**Hiring rules**

- Every piece type can be hired from the start; gold is the only limit.
- Army size is capped at a real chess set: 8 pawns, 2 knights, 2 bishops, 2 rooks, 1 queen.
- Price equals standard piece value, so players learn values just by shopping.
- Gold and the growing boss budget set the pace: owning more pieces than a boss budget allows gives you choices, not extra power.

| Piece | Species | Why it fits | Value | Price |
| --- | --- | --- | --- | --- |
| Pawn | Mouse pawn | Small, and there are many | 1 | 10g |
| Knight | Frog | Jumps over other pieces | 3 | 30g |
| Bishop | Owl bishop | Robed and scholarly | 3 | 30g |
| Rook | Tortoise | Castle on its back, moves in straight lines | 5 | 50g |
| Queen | Fox queen | Fast, goes anywhere | 9 | 90g |
| King | Lion | Regal; this is you | — | — |

**No wounds.** Captured pieces return after every battle, so a sacrifice never has a lasting cost. Losing material still hurts inside the battle, which is the real chess lesson.

**Avoiding grind.** Gold comes from varied, short content: battle rewards, bonus objectives, side quests, and a tavern bounty board of puzzles. No required replays of the same practice game.

See [starter companions, tutors and hero recruits](story.md#recurring-characters) for their roles in the story.

## Bounty board and gold

Battles pay for the army; bounties pay for extras and catch-up, and every bounty is practice the player needs. Because the boss budget caps your army in each boss battle, extra gold buys choices and powers, never a way past a boss.

**Gold pacing**

- Boss budgets are about 10, 16, 22, 28 and 34 points for regions 1 to 5, and the full 39 for the Lich King. Each step is about 6 points, or about 60 gold of pieces.
- Battle rewards cover most of each region's budget increase, so players who skip puzzles aren't stuck.
- Bounties pay for powers (Scrying Orb, Far Sight), extra piece choices, and recovering gold after a lost battle on harder difficulties.

**Bounty board rules**

- **Small and refreshing:** 3 to 4 bounties at a time, refreshed after each battle. It can't be ground, and it mixes puzzles in between battles, which helps players remember.
- **Follows the curriculum:** most bounties match the current region's themes; one or two revisit earlier regions, as the spiral does.
- **Pays for challenge:** puzzles are picked near the player's hidden rating. Ones above it pay more; ones far below pay little.
- **Mistake bounties:** positions where you blundered in a battle come back later as puzzles, like Lichess's "learn from your mistakes".

## Enemies and difficulty

See [Regions and factions](campaign.md#regions-and-factions) for the campaign lineup and [curriculum](campaign.md#curriculum) for teaching themes.

**AI personalities.** Enemy commanders have readable habits that create lessons. Bog Goblins shout their next move and must play it if it's still legal (see [Powers and rewind](#powers-and-rewind)). The proud Iron Legion never declines a capture you offer, which teaches traps. The cult leader pins everything, which teaches unpinning. Personality is a layer over the engine: weighted move choice among the engine's top candidates. Each faction's habit is listed in [AI habits by faction](#ai-habits-by-faction).

**Human-like mistakes.** Stockfish at low skill levels mixes perfect moves with random blunders, which feels unnatural. Early enemies should make believable mistakes, like missing a fork or leaving a piece undefended. The prototype does this by picking among several Stockfish candidate moves within a centipawn window; weaker enemies get a wider window.

See [campaign loss costs](campaign.md#campaign-and-gauntlet) for the consequences of losing a battle.

**Difficulty in two layers**

- **Global setting:** Gentle / Brave / Champion / Grandmaster. Sets the AI strength offset and how much help you get (Threat Sight, blunder warnings, rewind charges).
- **Adaptive rating:** a hidden rating (Glicko-style) from puzzles and battles keeps the AI near the player's level, with the global setting as an offset.

## AI habits by faction

Every faction has one readable habit that teaches its Region's theme. Habits change what the enemy chooses or tells you, never how pieces move. All six were approved on 2026-10-22; each one's finer details are settled when its Region is designed.

| Faction | Habit | Why it teaches the theme | Status |
| --- | --- | --- | --- |
| Bog Goblins | **Shout:** announce the move they'd play if you passed, and play it if still legal. Their boss, Grubnak, doesn't shout: the final exam | Shows the enemy's plan out loud, so "what does my opponent want?" becomes a habit; committed moves can be trapped | Built ([Region 1](regions/region-01-bog-goblins.md#ai-habit-shouting-goblins)) |
| Bandit Riders | **Wanted poster:** each turn they mark one of your pieces as their target: the piece their engine's best line goes after, shown with a poster icon over it. They choose among their good moves one that attacks or wins it, without committing to a move. On Gentle, the companion names the target ("They're hunting your bishop!") | Half the information of a shout: you know the target, not the route. Forks and double attacks are how the target gets hit, so you learn to spot them | Approved, not built; details in the [Region 2 brief](regions/region-02-bandit-riders.md#ai-habit-wanted-poster) |
| Shadow Cult | **Binding:** prefers moves that pin or keep a pin | Teaches recognizing and escaping pins | Approved; details with Region 3 |
| Iron Legion | **Proud:** never declines a capture you offer, even a poisoned one | Teaches traps and poisoned pieces. Framed as pride, not greed, so it doesn't repeat the goblins and fits a disciplined army | Approved (renamed from "greedy"); details with Region 4 |
| Bone Wardens | **Relentless march:** prefers moves that push passed pawns and bring the king forward | Teaches king activity and racing in endgames | Approved, not built |
| The Lich King | No habit; full strength for the difficulty | The final test: no tells | Approved |

The village **raider** in sieges is a battle-level habit any faction can use: it goes for villages first, but never makes a raid that allows mate in one (`raiderMove` in `src/ai/enemy.ts`).

## Powers and rewind

Undo is unlimited in training and limited in battles, like Into the Breach's one Reset Turn. Scarce rewinds are what make players double-check before moving, and that habit is the skill being taught.

| Context | Undo | Hints | Why |
| --- | --- | --- | --- |
| Lessons and training grounds | Unlimited | Free | Safe space to explore |
| Battles | Rewind charges (set by difficulty) | Paid with powers | Consequences build the blunder-check habit |
| After every battle | Full review | Best move shown | Learn from the biggest mistake |

**Rewind relics.** Rewind can be upgraded: more charges per battle, or rewinding two moves at once.

**Learning-friendly powers**

- **Scrying Orb:** shows the enemy's threat, the move they would play if you did nothing. It reveals their plan, not just the squares they attack. Teaches "what does my opponent want?"
- **Far Sight (Orb upgrade, bought in town):** hover a piece over a square to see the enemy's best reply to that move. Trains "if I go here, then they…" thinking.
- **Oracle:** highlights which piece the best move uses, but not where it goes.
- **Blunder Ward:** warns once per battle when you're about to leave a piece undefended.
- **Threat Sight:** always available on easy difficulty, a limited power on harder ones.

**One feature, three uses.** Shouting goblins, the Scrying Orb and Far Sight all ask the engine the same question: what is the enemy's best move in this position? Goblins announce it automatically and commit to it, the Orb shows it on demand, and Far Sight asks it about a move you haven't made yet. Together they teach the habit in order: first the enemy says its plan out loud, then you pay to see it, then you learn to work it out yourself.

**Ladder by Region** (approved 2026-10-22). Help arrives as the habits fade, so the player always has one rung of support:

| Region | The enemy's plan | New in town |
| --- | --- | --- |
| 1 Bog Goblins | Shouted for free | Nothing (Threat Sight comes with the difficulty) |
| 2 Bandit Riders | Target only (wanted poster), free | Scrying Orb: shows the full planned move. Sold in town: 3 charges for 30g, bought with bounty gold |
| 3 Shadow Cult | Hidden | Far Sight (Orb upgrade) |
| 4 Iron Legion | Hidden | Oracle; Blunder Ward (one warning per battle) |
| 5 Bone Wardens | Hidden | Rewind relics |
| Final | Hidden | — |

The Orb overlaps the wanted poster on purpose: it bridges the drop from the whole move (Region 1) to the target only (Region 2). Blunder Ward stays at one warning per battle, because an unlimited one would take away the lesson a mistake teaches.

**Help that fades in Region 1.** On Gentle, the companion reads each goblin shout a moment later (is the target guarded, is the trade fair, is a village or the king the target). On Brave, it doesn't.

**Battle review.** After every battle, Stockfish replays your last 12 moves and names the costliest one and the better move. When a goblin's shout still stood after your move, your move is judged after their forced reply, so a deliberate trap isn't called a blunder (`review()` in `src/scenes/Battle.ts`; scoring in `src/game/review.ts`). Each new habit needs the same care here.

**Deferred: free rewind.** A free rewind for spotting your own mistake is on hold because every version so far was confusing. Revisit after playtests, if at all.

**Banned power types:** anything that changes how pieces move, gives extra moves, swaps pieces, or adds terrain. Fun, but they teach the wrong chess.

## Tuning values

The numbers the game uses today, and where each is set, so later Regions stay consistent. Most are first guesses to tune in playtests ([open questions](decisions.md#open-questions)).

| Value | Now | Set in |
| --- | --- | --- |
| Starting gold | 20g | `STARTING_GOLD` in `src/game/campaign.ts` |
| Hiring prices | Piece value × 10g (10, 30, 30, 50, 90) | `PRICE` in `src/game/economy.ts` |
| Battle reward | 15–25g, paid on the first win only | `reward` on each battle |
| Bonus goals | 2 per battle, 5g each (boss: 10g), each paid once | `bonuses` on each battle |
| Boss reward | 50g (Region 1) | `src/game/region1Boss.ts` |
| Boss budget | 10 points, no queen (Region 1) | `R1_BOSS_BUDGET` in `src/game/region1Boss.ts` |
| Boss reward, budget (Region 2, not built) | 50g; 16 points, queens allowed | Region 2 brief |
| Wins that open the boss | 4 of 5 (Region 1) | `bossNeeds` in `src/game/region1.ts` |
| Confirmed tactic gold | 5g a fork, at most 10g per battle ever | `TACTIC_GOLD`, `TACTIC_GOLD_CAP` in `src/game/economy.ts` |
| Fork confirmation margin | Engine eval at least 0.8 pawns better than the material count before the move | `FORK_MARGIN` in `src/game/tacticCheck.ts` |
| Loss cost | Gentle 0, Brave 10% of gold, Champion and Grandmaster 25% | `lossCost` in `src/game/economy.ts` |
| Rewinds per battle | Gentle 3, Brave 2, Champion 1, Grandmaster 0 | `src/game/difficulty.ts` |
| Enemy strength | Gentle: search depth 5, any move within 300 centipawns (hundredths of a pawn) of the best. Brave: depth 8, within 120. Champion: depth 11, within 40. Grandmaster: depth 15, best move only | `ai` in `src/game/difficulty.ts` |
| Region 1 boss strength | Softer, since he doesn't shout: Gentle depth 4 within 400 centipawns, Brave depth 6 within 200 | `ai` on `R1_BOSS` in `src/game/region1Boss.ts` (any battle can override the difficulty's strength this way) |
| Scrying Orb (Region 2, not built) | 3 charges for 30g; one charge shows one enemy move | Region 2 brief |
| Bounties on the board | 4, refreshed after each battle | `BOUNTY_COUNT` in `src/game/economy.ts` |
| Bounty target rating | Gentle 900, Brave 1200, Champion 1500, Grandmaster 1800 (fixed until the adaptive rating exists) | `playerRatingFor` in `src/game/bounty.ts` |
| Bounty pay | 10g at your rating, ±2g per 100 points, between 2g and 30g | `bountyReward` in `src/game/bounty.ts` |
| Academy first clear | 10g per exercise | `src/game/academy.ts` |
| Review threshold | A move must cost about a pawn (90 centipawns) to be called a mistake | `MISTAKE_CP` in `src/game/review.ts` |
| Engine search timeout | 12 s, then the fallback AI takes over | `Engine` in `src/ai/engine.ts` |
