# Region 5: The Bone Wardens

[Design overview](../../design.md) · [Syllabus](../syllabus.md) · [Playbook](../../playbook.md) · [Issue #44](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/44)

## Design status

Implemented in the journey registry and source-verified, 2026-10-24. Independent teaching review is complete; browser checks, full CI and staging evidence belong to the journey release record.
This record does not claim those pending checks passed.

| Field | Chapter decision |
| --- | --- |
| Region and faction | The Bone Wardens, the Lich King’s skeleton-animal vanguard |
| Entry | Complete the Iron Legion review; preserve earlier progress and optional stars |
| Prerequisites | R1 promotion and king safety; R2 forcing replies; R3 skewers; R4 deflection and intermediate moves |
| New scope | Short passed-pawn routes, pawn races, king captures, rook checks supporting promotion, immediate knight-promotion mates |
| Revisit | R1 promotion and back-rank mate; R3 rook skewers; R4 forcing deflection |
| Pattern | Six lessons, each with one example and three main/backup pairs; one six-wave review with a stored neutral example |
| Sources | 55 distinct unchanged Lichess database puzzles, all with 1–3 solver moves |
| Companion | The selected Sir Hob, Sage Ollie, or Old Brick remains the coach |
| Place | The Keep’s Gate; the Bone Wardens collectively host the review |
| Completion | Review completion opens the gate. Stars, gold, armies and powers are not gates |
| Presentation | Dedicated map-region5 landscape; existing piece art can stand in with honest identities |
| Not provided | Opposition/key squares, Lucena, Philidor, sustained conversion, full games, measured learning gains |

## Teaching scope and sequence

The route teaches decisions that fit unchanged short published lines. It does not teach a complete endgame method.
Players identify a passed pawn, then add a competing pawn and count turns.
King routes follow; rook checks then show how another piece can enable promotion.
Rook skewers revisit the Shadow Cult after intervening pawn work. Promotion choice comes last.

| Order | Encounter | Precise claim | Demonstration | Practice and backups |
| --- | --- | --- | --- | --- |
| 1 | A path through the bones | Advance a passed pawn to promotion in the published continuation | f5–f8 while the rival reaches b2 | Both colours and several files; every pawn is actually passed |
| 2 | Two paths to the gate | Count turns, checks and captures in a pawn race | Equal three-push routes; moving first promotes with check | Four equal-distance practice sources; wave 3 main uses a checking capture where the rival promotes first |
| 3 | The crown takes a step | Use a safe king route to capture a pawn | Kf5, Kxf4, Kxg5 | Pawn attacks, king distance, a checking-pawn capture, and routes around pawn blocks |
| 4 | Make room at the gate | Check with a rook to clear a promotion square or deflect its guard | Rg8+ clears a8 before promotion | Three clearance/sacrifice sources and three defender-deflection sources |
| 5 | One line, two guards | Skewer a king and rook, then capture the rear rook | Ra4+ lines up Kd4 and Rg4 | Files and ranks, both colours; every rear target is a rook |
| 6 | The smaller crown | Choose the only promotion that checkmates immediately | f1=N#; all three other promotions allow replies | Six fresh immediate knight-promotion mates |
| Review | The keep’s threshold | Recognise the taught decision without a motif label | Neutral stored example; direct review entry remains | Six matched main/backup teaching slots |

Three scope decisions keep the claims supported.
Rook support means a forcing check clears the promotion square or draws its defender away; it does not teach sustained rook-ending technique.
The fifth lesson focuses on rook skewers. It does not add a second defender-removal teaching strand.
Required underpromotion means required for **checkmate now**. It does not claim that promoting to a queen necessarily loses the game.
Every knight-promotion source has legal queen, rook and bishop alternatives that do not mate.
The evidence file records their complete legal reply sets. The tests regenerate those sets independently from the board.

## Mixed chapter review

All prompts remain neutral before the answer. The stored example is not a new review prerequisite.
Retries use the same taught mechanism in each backup; retrying is practice rather than an unseen assessment.

| Wave | Previously taught idea | Main | Backup | Evidence |
| --- | --- | --- | --- | --- |
| 1 | Passed-pawn racing and promotion checks | YyCbR | 8bbWP | Both promote with check; YyCbR shows that arriving first alone is insufficient |
| 2 | Safe king route and pawn capture | GCVGr | kuWwt | King entries remain safe and end with a pawn capture |
| 3 | Rook clearance with check | 2RsIw | AzfPs | Vacate the promotion square with check, then promote after the king captures |
| 4 | Earlier rook skewers | 87kiD | D38Qx | King lies between the checking rook and the rear rook |
| 5 | Immediate knight-promotion mate | JB3YP | 2Qu17 | Only knight promotion mates now; legal alternatives recorded |
| 6 | Earlier back-rank mate | YchKS | w5dLq | Rd1# against a king boxed in by its own pawns |

The review covers the passed-pawn strand through racing rather than adding a seventh wave.
Its final wave revisits a mating decision instead of adding an untaught defensive technique.

## Published sources and teaching fit

The original FEN, full UCI line, SAN, rating, themes and quality values are in [region5Puzzles.json](../../../src/game/course/region5Puzzles.json).
Board-level claims and promotion alternatives are in [region5Evidence.json](../../../src/game/course/region5Evidence.json).
All source positions and replies remain unchanged. The runner stops at each published endpoint.

Quality shorthand below is rating / deviation / popularity / plays. Minimum plays: 300; popularity: 85; maximum deviation: 90.
Ratings stay within 400–1300; each backup is within 200 points of its main.
Selection excluded the existing curriculum, bounty, warm-up and ambush reservations.
The parallel curation partition used first-character character-code modulo 3 equal to 2; it did not alter quality bounds.
The scan found 31 qualifying underpromotion candidates before board inspection; no filter relaxation was needed.

Lichess supplies the published puzzles under its database reuse terms. Pawnshire’s teaching and story prose is original.
Source popularity and rating are selection evidence, not evidence of educational effectiveness.

| Encounter / role | Source | Quality | Themes | Setup and full published line | Board evidence |
| --- | --- | --- | --- | --- | --- |
| r5-passed-pawns / example | [ekO0n](https://lichess.org/training/ekO0n) | 444 / 90 / 100 / 407 | advancedPawn, crushing, endgame, long, pawnEndgame, promotion | b3 f6 Kc4 f7 b2 f8=Q | The f5 pawn is passed. Three pushes reach f8 while the b-pawn only reaches b2. |
| r5-passed-pawns / 1 main | [SngGU](https://lichess.org/training/SngGU) | 498 / 89 / 100 / 351 | advancedPawn, crushing, endgame, long, pawnEndgame, promotion | g5 e6 h4 e7 h3 e8=Q | The e5 pawn is passed. Three pushes reach e8 while the h-pawn reaches h3. |
| r5-passed-pawns / 1 backup | [eXA2d](https://lichess.org/training/eXA2d) | 517 / 88 / 100 / 314 | advancedPawn, crushing, endgame, long, pawnEndgame, promotion | Kxg6 a3 Kf7 a2 g6 a1=Q | The a4 pawn is passed. Three pushes promote while the distant white king and g-pawn cannot stop this line. |
| r5-passed-pawns / 2 main | [tjAtj](https://lichess.org/training/tjAtj) | 547 / 89 / 100 / 472 | advancedPawn, crushing, endgame, long, pawnEndgame, promotion | Kxg6 c3 h5 c2 h6 c1=Q | The c4 pawn is passed. Three pushes promote while the h-pawn advances twice. |
| r5-passed-pawns / 2 backup | [qW9gn](https://lichess.org/training/qW9gn) | 550 / 85 / 100 / 512 | advancedPawn, crushing, endgame, long, pawnEndgame, promotion | Kg6 a3 Kg7 a2 h6 a1=Q+ | The a4 pawn is passed. Its third push promotes with check while the h-pawn reaches h6. |
| r5-passed-pawns / 3 main | [tJPlM](https://lichess.org/training/tJPlM) | 552 / 88 / 100 / 314 | advancedPawn, crushing, endgame, long, master, pawnEndgame, promotion | b5 h6 b4 h7 b3 h8=Q | The h5 pawn is passed: no black pawn ahead lies on g or h. Three pushes promote before the b-pawn reaches b2. |
| r5-passed-pawns / 3 backup | [bT7qi](https://lichess.org/training/bT7qi) | 562 / 88 / 100 / 514 | advancedPawn, crushing, endgame, long, master, pawnEndgame, promotion | f4 b6 f3 b7 Ke4 b8=Q | The b5 pawn is passed. Three pushes promote while Black spends one reply on the king. |
| r5-pawn-races / example | [2848Q](https://lichess.org/training/2848Q) | 477 / 90 / 100 / 421 | advancedPawn, crushing, endgame, long, pawnEndgame, promotion | Kd4 h6 e3 h7 e2 h8=Q+ | Both leading pawns need three pushes. White moves first and promotes with check while Black is still on e2. |
| r5-pawn-races / 1 main | [Ga1xx](https://lichess.org/training/Ga1xx) | 514 / 89 / 100 / 836 | advancedPawn, crushing, endgame, long, pawnEndgame, promotion | Kh6 h3 g6 h2 g7 h1=Q+ | Both leading pawns need three pushes. Black moves first and promotes with check while White is on g7. |
| r5-pawn-races / 1 backup | [wCrGT](https://lichess.org/training/wCrGT) | 617 / 86 / 100 / 539 | advancedPawn, crushing, endgame, long, pawnEndgame, promotion | Kc6 c3 b6 c2 b7 c1=Q+ | Both leading pawns need three pushes. Black moves first and promotes with check while White is on b7. |
| r5-pawn-races / 2 main | [S7BL2](https://lichess.org/training/S7BL2) | 641 / 84 / 100 / 915 | advancedPawn, crushing, endgame, long, pawnEndgame, promotion | Kc4 c6 b3 c7 b2 c8=Q+ | Both leading pawns need three pushes. White moves first and promotes with check while Black is on b2. |
| r5-pawn-races / 2 backup | [kLwSl](https://lichess.org/training/kLwSl) | 722 / 90 / 93 / 332 | advancedPawn, crushing, endgame, long, pawnEndgame, promotion | e4 g6 e3 g7 e2 g8=Q+ | Both leading pawns need three pushes. White moves first and promotes with check while Black is on e2. |
| r5-pawn-races / 3 main | [kf9cP](https://lichess.org/training/kf9cP) | 708 / 83 / 100 / 910 | advancedPawn, advantage, endgame, long, pawnEndgame, promotion | a7 fxe3+ Kc3 e2 a8=Q e1=Q+ | Black captures e3 with check, forcing a king reply. White promotes first, but Black promotes with check on the next move. |
| r5-pawn-races / 3 backup | [AojWU](https://lichess.org/training/AojWU) | 725 / 90 / 98 / 386 | advancedPawn, crushing, endgame, long, master, pawnEndgame, promotion | Kb4 f6 c3 f7 c2 f8=Q+ | Both leading pawns need three pushes. White moves first and promotes with check while Black is on c2. |
| r5-king-use / example | [J3blE](https://lichess.org/training/J3blE) | 544 / 90 / 100 / 345 | crushing, endgame, long, pawnEndgame | gxf4 Kf5 Kd2 Kxf4 Ke1 Kxg5 | The black king enters f5 safely, then captures the white pawns on f4 and g5. |
| r5-king-use / 1 main | [zf3eO](https://lichess.org/training/zf3eO) | 606 / 89 / 100 / 352 | crushing, endgame, pawnEndgame, short | Kxg4 Kf7 h5 Kxg7 | The white king steps to f7, away from the black king, then captures the blocking g7 pawn. |
| r5-king-use / 1 backup | [DQIdq](https://lichess.org/training/DQIdq) | 624 / 87 / 100 / 595 | crushing, endgame, long, pawnEndgame | dxe4+ Kxe4 Kc4 Ke5 Kxc3 Kxe6 | The king captures the checking e4 pawn, enters e5, then captures e6. Each entry avoids enemy pawn and king attacks. |
| r5-king-use / 2 main | [kjp7V](https://lichess.org/training/kjp7V) | 636 / 88 / 100 / 306 | crushing, endgame, master, pawnEndgame, short | Ke3 Kg4 Ke4 Kxh4 | The black king enters g4 safely, then captures h4. The white king remains too far away to guard that pawn. |
| r5-king-use / 2 backup | [8a9DZ](https://lichess.org/training/8a9DZ) | 643 / 88 / 100 / 393 | crushing, endgame, long, pawnEndgame | Kb5 Kd4 Kc6 Ke5 Kd7 Kxf5 | The white king walks through d4 and e5 to capture f5. It avoids the black pawns’ attack squares. |
| r5-king-use / 3 main | [bkLyy](https://lichess.org/training/bkLyy) | 662 / 79 / 100 / 393 | crushing, endgame, master, pawnEndgame, short | g4 Kxg4 Ke5 Kxh5 | The black king safely captures g4 and then h5, removing both white pawns. |
| r5-king-use / 3 backup | [JkYR9](https://lichess.org/training/JkYR9) | 673 / 85 / 100 / 577 | crushing, endgame, master, pawnEndgame, short | Kf3 Kd4 c5 Kxc5 | The black king enters d4 safely and captures the pawn after c5. The white king cannot guard c5. |
| r5-rook-support / example | [8vtl4](https://lichess.org/training/8vtl4) | 898 / 78 / 100 / 407 | advancedPawn, attraction, crushing, endgame, master, promotion, rookEndgame, short | Rxg2 Rg8+ Kxg8 a8=Q+ | Rg8+ vacates a8 with check. After Kxg8, the a7 pawn promotes with check. |
| r5-rook-support / 1 main | [SyVVa](https://lichess.org/training/SyVVa) | 944 / 78 / 100 / 525 | advancedPawn, attraction, crushing, endgame, promotion, rookEndgame, short | e2 Re8+ Kxe8 h8=Q+ | Re8+ vacates h8 with check. After Kxe8, the h7 pawn promotes with check. |
| r5-rook-support / 1 backup | [5T9FM](https://lichess.org/training/5T9FM) | 937 / 78 / 97 / 845 | advancedPawn, clearance, crushing, endgame, promotion, rookEndgame, short | Kh2 Rh8+ Kg3 c8=Q | Rh8+ clears c8 and forces a king reply. The c7 pawn then promotes. |
| r5-rook-support / 2 main | [AuhcO](https://lichess.org/training/AuhcO) | 1054 / 77 / 98 / 1021 | advancedPawn, clearance, crushing, endgame, promotion, rookEndgame, short | c2 Rd8+ Kc1 a8=Q | Rd8+ clears a8 and forces a king reply. The a7 pawn then promotes. |
| r5-rook-support / 2 backup | [2Mc4A](https://lichess.org/training/2Mc4A) | 1049 / 82 / 95 / 7166 | advancedPawn, crushing, deflection, endgame, master, masterVsMaster, promotion, rookEndgame, short, superGM | Ra6 Rb6+ Rxb6 a8=Q | Rb6+ draws the defending rook from the a-file to b6. The a7 pawn then promotes. |
| r5-rook-support / 3 main | [AgeRI](https://lichess.org/training/AgeRI) | 1045 / 80 / 95 / 778 | advancedPawn, advantage, deflection, endgame, promotion, rookEndgame, short | Ra6 Rc6+ Rxc6 a8=Q | Rc6+ draws the defending rook from the a-file to c6. The a7 pawn then promotes. |
| r5-rook-support / 3 backup | [Smt15](https://lichess.org/training/Smt15) | 1055 / 87 / 94 / 555 | advancedPawn, crushing, deflection, endgame, promotion, rookEndgame, short | Ka6 Rb6+ Rxb6 h1=Q | Rb6+ draws the defending rook from the h-file to b6. The h2 pawn then promotes. |
| r5-endgame-skewers / example | [PF2dd](https://lichess.org/training/PF2dd) | 554 / 81 / 100 / 334 | crushing, endgame, rookEndgame, short, skewer | Kd4 Ra4+ Kd5 Rxg4 | Ra4+ puts the white king on d4 between the checking rook and the rook on g4. After the king leaves, Rxg4 wins that rook. |
| r5-endgame-skewers / 1 main | [DSB9m](https://lichess.org/training/DSB9m) | 567 / 89 / 98 / 747 | crushing, endgame, rookEndgame, short, skewer | Kxd4 Rd2+ Kxc3 Rxd6 | Rd2+ lines up the king on d4 and rook on d6. After Kxc3, Rxd6 captures the rear rook. |
| r5-endgame-skewers / 1 backup | [MhxI1](https://lichess.org/training/MhxI1) | 568 / 86 / 98 / 720 | crushing, endgame, master, rookEndgame, short, skewer | Kf6 Rxh6+ Ke7 Rxc6 | Rxh6+ checks the king on f6 with the rook on c6 behind it. After Ke7, Rxc6 wins the rook. |
| r5-endgame-skewers / 2 main | [SCh0x](https://lichess.org/training/SCh0x) | 584 / 85 / 100 / 682 | crushing, endgame, rookEndgame, short, skewer | Kf2 Rh2+ Ke3 Rxc2 | Rh2+ checks the king on f2 with the rook on c2 behind it. After Ke3, Rxc2 wins the rook. |
| r5-endgame-skewers / 2 backup | [w0GW4](https://lichess.org/training/w0GW4) | 588 / 83 / 100 / 576 | crushing, endgame, rookEndgame, short, skewer | Kxh4 Rh6+ Kxg5 Rxh2 | Rh6+ checks the king on h4 with the rook on h2 behind it. After Kxg5, Rxh2 wins the rook. |
| r5-endgame-skewers / 3 main | [5TD72](https://lichess.org/training/5TD72) | 591 / 84 / 100 / 462 | crushing, endgame, master, rookEndgame, short, skewer | Kc1 Rb1+ Kd2 Rxf1 | Rb1+ checks the king on c1 with the rook on f1 behind it. After Kd2, Rxf1 wins the rook. |
| r5-endgame-skewers / 3 backup | [qGfb3](https://lichess.org/training/qGfb3) | 593 / 89 / 98 / 967 | crushing, endgame, rookEndgame, short, skewer | Kxh5 Rh8+ Kg4 Rxh2 | Rh8+ checks the king on h5 with the rook on h2 behind it. After Kg4, Rxh2 wins the rook. |
| r5-underpromotion / example | [Yb5Fq](https://lichess.org/training/Yb5Fq) | 779 / 86 / 90 / 3276 | advancedPawn, cornerMate, endgame, mate, mateIn1, oneMove, promotion, underPromotion | Kg3 f1=N# | f1=N# gives immediate checkmate. Queen, rook and bishop promotions do not mate; after a queen, c8d8 is a legal reply. The claim is mate now, not that a queen must lose. |
| r5-underpromotion / 1 main | [thYKI](https://lichess.org/training/thYKI) | 839 / 85 / 91 / 26546 | advancedPawn, cornerMate, endgame, mate, mateIn1, oneMove, promotion, underPromotion | Kc6 d8=N# | d8=N# gives immediate checkmate. Queen, rook and bishop promotions do not mate; after a queen, a7a6 is a legal reply. The claim is mate now, not that a queen must lose. |
| r5-underpromotion / 1 backup | [2bNV8](https://lichess.org/training/2bNV8) | 840 / 83 / 89 / 3709 | advancedPawn, endgame, mate, mateIn1, oneMove, promotion, underPromotion | Qxf1 f8=N# | f8=N# gives immediate checkmate. Queen, rook and bishop promotions do not mate; after a queen, a7a6 is a legal reply. The claim is mate now, not that a queen must lose. |
| r5-underpromotion / 2 main | [DuYAe](https://lichess.org/training/DuYAe) | 870 / 83 / 90 / 8468 | advancedPawn, endgame, master, mate, mateIn1, oneMove, promotion, underPromotion | b1=Q f8=N# | f8=N# gives immediate checkmate. Queen, rook and bishop promotions do not mate; after a queen, d6d5 is a legal reply. The claim is mate now, not that a queen must lose. |
| r5-underpromotion / 2 backup | [YRKEI](https://lichess.org/training/YRKEI) | 871 / 86 / 88 / 15881 | advancedPawn, cornerMate, endgame, mate, mateIn1, oneMove, promotion, underPromotion | Rbe3 g8=N# | g8=N# gives immediate checkmate. Queen, rook and bishop promotions do not mate; after a queen, e8f8 is a legal reply. The claim is mate now, not that a queen must lose. |
| r5-underpromotion / 3 main | [tpsGj](https://lichess.org/training/tpsGj) | 894 / 82 / 86 / 1156 | advancedPawn, endgame, master, mate, mateIn1, oneMove, promotion, underPromotion | Rh7 d1=N# | d1=N# gives immediate checkmate. Queen, rook and bishop promotions do not mate; after a queen, b7b8 is a legal reply. The claim is mate now, not that a queen must lose. |
| r5-underpromotion / 3 backup | [w4rdF](https://lichess.org/training/w4rdF) | 929 / 84 / 89 / 14773 | advancedPawn, cornerMate, endgame, master, mate, mateIn1, oneMove, promotion, underPromotion | Rge7 g1=N# | g1=N# gives immediate checkmate. Queen, rook and bishop promotions do not mate; after a queen, a7a8 is a legal reply. The claim is mate now, not that a queen must lose. |
| r5-gate-review / example | [wNum3](https://lichess.org/training/wNum3) | 678 / 83 / 98 / 513 | backRankMate, endgame, hangingPiece, mate, mateIn1, oneMove | Qb8 Qxb8# | Qxb8 captures the queen and gives immediate back-rank mate. The pawns on g7 and h7 block the king’s escape. |
| r5-gate-review / 1 main | [YyCbR](https://lichess.org/training/YyCbR) | 802 / 82 / 98 / 485 | advancedPawn, advantage, endgame, pawnEndgame, promotion, short | b7 h2 b8=Q h1=Q+ | White needs one push and Black needs two. Black pushes h2; White promotes, then Black promotes with check. First arrival alone is not the goal. |
| r5-gate-review / 1 backup | [8bbWP](https://lichess.org/training/8bbWP) | 818 / 80 / 100 / 309 | advancedPawn, crushing, endgame, long, pawnEndgame, promotion | b5 c3 b6 c2 b7 c1=Q+ | Both leading pawns need three pushes. Black moves first and promotes with check while White is on b7. |
| r5-gate-review / 2 main | [GCVGr](https://lichess.org/training/GCVGr) | 707 / 82 / 100 / 375 | crushing, endgame, pawnEndgame, short | Kf4 Kxd4 Kf5 Kxd5 | The white king safely captures d4 and then d5. Neither target is protected by the distant black king. |
| r5-gate-review / 2 backup | [kuWwt](https://lichess.org/training/kuWwt) | 740 / 86 / 98 / 516 | crushing, endgame, long, pawnEndgame, zugzwang | Ke5 Ke3 Kd5 Kf4 Kd4 Kxg4 | The white king enters e3 and f4 safely, then captures g4. This tests the concrete route, not a general zugzwang method. |
| r5-gate-review / 3 main | [2RsIw](https://lichess.org/training/2RsIw) | 1000 / 86 / 89 / 987 | advancedPawn, attraction, crushing, endgame, long, promotion, rookEndgame | Rc5 Ra8+ Kxa8 g8=Q+ Ka7 Qxa2+ | Ra8+ clears g8 with check. After the king captures, g8=Q+ forces another reply; the new queen then captures a2. |
| r5-gate-review / 3 backup | [AzfPs](https://lichess.org/training/AzfPs) | 1050 / 77 / 99 / 1620 | advancedPawn, attraction, crushing, endgame, master, promotion, rookEndgame, short | Rf7 Rg1+ Kxg1 b1=Q+ | Rg1+ clears b1 with check. After the king captures, b1=Q+ promotes with check. |
| r5-gate-review / 4 main | [87kiD](https://lichess.org/training/87kiD) | 605 / 82 / 100 / 346 | crushing, endgame, rookEndgame, short, skewer | Rxc2 Rh2+ Kf3 Rxc2 | Rh2+ checks the king on f2 with the rook on c2 behind it. After Kf3, Rxc2 wins the rook. |
| r5-gate-review / 4 backup | [D38Qx](https://lichess.org/training/D38Qx) | 608 / 87 / 98 / 1028 | crushing, endgame, rookEndgame, short, skewer | Rh8 Ra8+ Kb7 Rxh8 | Ra8+ checks the king on c8 with the rook on h8 behind it. After Kb7, Rxh8 wins the rook. |
| r5-gate-review / 5 main | [JB3YP](https://lichess.org/training/JB3YP) | 1177 / 85 / 91 / 2387 | advancedPawn, endgame, mate, mateIn1, oneMove, promotion, underPromotion | f8=Q c1=N# | c1=N# gives immediate checkmate. Queen, rook and bishop promotions do not mate; after a queen, f8g8 is a legal reply. The claim is mate now, not that a queen must lose. |
| r5-gate-review / 5 backup | [2Qu17](https://lichess.org/training/2Qu17) | 1289 / 84 / 90 / 3579 | advancedPawn, endgame, mate, mateIn1, oneMove, promotion, underPromotion | b1=Q g8=N# | g8=N# gives immediate checkmate. Queen, rook and bishop promotions do not mate; after a queen, d6b7 is a legal reply. The claim is mate now, not that a queen must lose. |
| r5-gate-review / 6 main | [YchKS](https://lichess.org/training/YchKS) | 424 / 89 / 100 / 465 | backRankMate, endgame, mate, mateIn1, oneMove | Rxe6 Rd1# | Rd1 is immediate back-rank mate. White’s f2, g2 and h2 pawns block the king. |
| r5-gate-review / 6 backup | [w5dLq](https://lichess.org/training/w5dLq) | 424 / 87 / 100 / 488 | backRankMate, endgame, mate, mateIn1, oneMove | Ne4 Rd1# | Rd1 is immediate back-rank mate. White’s f2, g2 and h2 pawns block the king. |

## Story beats and voices

The Iron Legion scouts’ warning becomes visible: skeleton mice, tortoises and lions guard the road.
The player passes small encounters, reaches the Bone Wardens’ six-board review, and opens the keep’s gate by completing it.
The Lich King waits beyond the gate; the chapter does not claim the entire journey is finished.
No new leader or recruit is required. The chosen companion continues coaching, whichever colour or piece the source gives the player.
The Bone Wardens’ collective review avoids inventing another named king.

Introductions use short story images. Demonstrations name the actual moves and purposes on their specific boards.
The review’s introduction, objective and coaching omit motif clues.
The promotion lesson explains the immediate-mate goal before choice; the mixed review withholds that label.

## Technique dependencies

Issue #40 remains separate. Opposition, key squares, Lucena and Philidor require branching defence and goal-based completion.
The selected king sources prove legal routes and pawn captures only.
Even the zugzwang-tagged review source is assessed as its concrete king route, without claiming a general zugzwang method.
No source is extended, composed or substituted to imply a missing technique capability.

## Verification and handoff

Content verification completed on 2026-10-24:

- Read every displayed board and complete line, including all examples and backups.
- Nine focused tests cover chapter integration and the main-wave race exception, plus: structure, legal replay/quality, passed-pawn status, race timing, safe king routes, rook purpose, actual skewers and promotion necessity.
- The rook test checks that immediate promotion is blocked or can be captured before the rook check, then becomes safe after the published reply.
- The skewer test checks king-between-rooks geometry and the actual rear-rook capture, rather than trusting tags.
- The underpromotion test checks all four choices and every recorded legal alternative reply set for all nine lesson/review sources.
- An independent database scan matched all 55 FENs, complete move lists, ratings, themes and quality fields exactly.
- Reservation scan found no overlap with other currently present curriculum, bounty, warm-up or ambush source IDs.

Commands: npx vitest run src/game/course/region5.test.ts; npx tsc --noEmit; and the ignored local source-comparison script.
Source data and curation scratch files are not shipped.

Independent Astra review matched all 55 sources and inspected their teaching mechanisms. Its P2 finding moved kf9cP into wave 3 main.
The opponent-promotes-first exception now appears before the review, with AojWU as its backup.

Integration CI passes: type-check, build and all 407 unit tests across 28 files. Normal CI skips both engine groups by dependency selection.
The full release suite remains pending: the retained baseline reproduced a legacy r1-guard Brave bonus-rate failure, tracked in #42.
Full browser navigation, viewport and staging checks remain pending; this is an integration checkpoint.

Integration tests, full release regressions, browser evidence and staging checks are recorded in [build progress](../../progress.md).
This content record does not substitute for those checks or claim an owner playtest.
Browser checks must cover desktop, portrait, short phone and landscape, with WebKit touch emulation identified accurately.
Preserve readable advice, separate temporary speech, the 44px history control, classic pieces, reduced motion and cancellation on exit.
Production publication remains a separate decision from staging.
