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
Players identify a passed pawn, then count turns in short, mostly equal-distance races.
King routes follow. Rook support comes before the skewer revisit; promotion choice comes last.
The original lesson order is retained because saves validate completed lessons against their prerequisites. Reordering them would reject existing progress.
The race lesson extends the same pawn-push action with counting; it does not teach a general choice between racing and stopping a pawn.

| Order | Encounter | Precise claim | Demonstration | Practice and backups |
| --- | --- | --- | --- | --- |
| 1 | A path through the bones | Advance a passed pawn to promotion in the published continuation | f5–f8 while the rival reaches b2 | Both colours and several files; every pawn is actually passed |
| 2 | Two paths to the gate | Count promotion turns in the selected short races | Equal three-push routes; moving first promotes with check | Five equal-distance practice sources; wave 3 main starts with a checking capture and ends with two queens |
| 3 | The crown takes a step | Follow a shortest open king route to the next pawn capture | Kf5, Kxf4, Kxg5 | Seven teaching sources; legal detours can give the defender time |
| 4 | Make room at the gate | Check with a rook to clear a promotion square or deflect its guard | Rg8+ clears a8 before promotion | The king may capture, move aside, or block its own pawn; other lines deflect a rook |
| 5 | One line, two guards | Skewer a king and rook, then capture the rear rook | Ra4+ lines up Kd4 and Rg4 | Files and ranks, both colours; every rear target is a rook |
| 6 | The smaller crown | Choose the only promotion that checkmates immediately | f1=N#; all three other promotions allow replies | Six fresh immediate knight-promotion mates |
| Review | The keep’s threshold | Recognise the taught decision without a motif label | Neutral stored example; direct review entry remains | Six matched main/backup teaching slots |

Three scope decisions keep the claims supported.
Rook support means a forcing check clears the promotion square or draws its defender away; it does not teach sustained rook-ending technique.
The fifth lesson focuses on rook skewers. It does not add a second defender-removal teaching strand.
Required underpromotion means required for **checkmate now**. It does not claim that promoting to a queen necessarily loses the game.
Every knight-promotion source has exactly one legal mating move. Queen, rook and bishop promotions all allow replies.
The evidence records one legal reply to each alternative promotion. Tests replay those replies without depending on move-generation order.
Both kf9cP and YyCbR end with two queens. Promotion with check earns the next reply; the published endpoint does not complete conversion.

## Mixed chapter review

All prompts remain neutral before the answer. The stored example is not a new review prerequisite.
Retries use the same taught mechanism in each backup; retrying is practice rather than an unseen assessment.

| Wave | Previously taught idea | Main | Backup | Evidence |
| --- | --- | --- | --- | --- |
| 1 | Earlier back-rank mate | YchKS | 2cGjV | Opposite colours and different mating pieces; own pawns close the king’s escape squares |
| 2 | King route and pawn capture | GCVGr | kuWwt | Capture pawns; in kuWwt the defending king’s reply opens the route |
| 3 | Earlier rook skewers | 87kiD | D38Qx | King lies between the checking rook and the rear rook |
| 4 | Passed-pawn racing and promotion checks | YyCbR | 8bbWP | Both promote with check; YyCbR ends with two queens and further play remaining |
| 5 | Immediate knight-promotion mate | JB3YP | 2Qu17 | The only legal mating move is knight promotion; sample alternatives recorded |
| 6 | Rook clearance with check | 2RsIw | AzfPs | Vacate the promotion square with check, then promote after the king captures |

The review covers the passed-pawn strand through racing rather than adding a seventh wave.
The stored example captures an unguarded rook; it does not preview one of the six review mechanisms.
The waves interleave earlier and current skills instead of following lesson order. Coverage is asserted as a set.
The easiest mate now opens the review. Rook support closes it at ratings 1000/1050, after the harder promotion choice.
Pawn-ending ratings remain lower than Region 4. These focused boards introduce new endgame decisions without claiming an unbroken rating climb.
We retain their clear teaching fit rather than raise the rating floor solely to match the preceding chapter.

## Published sources and teaching fit

The original FEN, full UCI line, SAN, rating, themes and quality values are in [region5Puzzles.json](../../../src/game/course/region5Puzzles.json).
Board-level claims and promotion alternatives are in [region5Evidence.json](../../../src/game/course/region5Evidence.json).
All source positions and replies remain unchanged. The runner stops at each published endpoint.

Quality shorthand below is rating / deviation / popularity / plays. Minimum plays: 300; popularity: 85; maximum deviation: 90.
Ratings stay within 400–1300; each backup is within 200 points of its main.
Selection excluded the existing curriculum, bounty, warm-up and ambush reservations.
The original curation used a first-character partition; review replacements were selected without that partition under the same quality bounds.
QAnl6 replaces YRKEI, whose non-promoting Nh7# bypassed the lesson. No source line or quality filter was relaxed.

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
| r5-pawn-races / 3 main | [kf9cP](https://lichess.org/training/kf9cP) | 708 / 83 / 100 / 910 | advancedPawn, advantage, endgame, long, pawnEndgame, promotion | a7 fxe3+ Kc3 e2 a8=Q e1=Q+ | fxe3+ forces a king reply. White promotes first, then Black promotes with check. Both sides keep queens; converting Black’s advantage lies beyond this line. |
| r5-pawn-races / 3 backup | [AojWU](https://lichess.org/training/AojWU) | 725 / 90 / 98 / 386 | advancedPawn, crushing, endgame, long, master, pawnEndgame, promotion | Kb4 f6 c3 f7 c2 f8=Q+ | Both leading pawns need three pushes. White moves first and promotes with check while Black is on c2. |
| r5-king-use / example | [J3blE](https://lichess.org/training/J3blE) | 544 / 90 / 100 / 345 | crushing, endgame, long, pawnEndgame | gxf4 Kf5 Kd2 Kxf4 Ke1 Kxg5 | Kf5 starts a shortest open route to f4. After capturing there, the king takes the pawn on g5. |
| r5-king-use / 1 main | [zf3eO](https://lichess.org/training/zf3eO) | 606 / 89 / 100 / 352 | crushing, endgame, pawnEndgame, short | Kxg4 Kf7 h5 Kxg7 | Kf7 starts a shortest open route to g7. Ke7 is legal but needs an extra step to reach the pawn. |
| r5-king-use / 1 backup | [DQIdq](https://lichess.org/training/DQIdq) | 624 / 87 / 100 / 595 | crushing, endgame, long, pawnEndgame | dxe4+ Kxe4 Kc4 Ke5 Kxc3 Kxe6 | Kxe4 removes the checking pawn. Ke5 then follows a shortest open route to the pawn on e6. |
| r5-king-use / 2 main | [kjp7V](https://lichess.org/training/kjp7V) | 636 / 88 / 100 / 306 | crushing, endgame, master, pawnEndgame, short | Ke3 Kg4 Ke4 Kxh4 | Kg4 starts a shortest open route to h4. The white king remains too far away to guard that pawn. |
| r5-king-use / 2 backup | [8a9DZ](https://lichess.org/training/8a9DZ) | 643 / 88 / 100 / 393 | crushing, endgame, long, pawnEndgame | Kb5 Kd4 Kc6 Ke5 Kd7 Kxf5 | Kd4 and Ke5 take the shortest open route to f5. Kd3 is legal but adds a step because the f5 pawn attacks e4. |
| r5-king-use / 3 main | [bkLyy](https://lichess.org/training/bkLyy) | 662 / 79 / 100 / 393 | crushing, endgame, master, pawnEndgame, short | g4 Kxg4 Ke5 Kxh5 | Kxg4 and Kxh5 each capture a pawn one step away. Neither move spends a turn on a detour. |
| r5-king-use / 3 backup | [JkYR9](https://lichess.org/training/JkYR9) | 673 / 85 / 100 / 577 | crushing, endgame, master, pawnEndgame, short | Kf3 Kd4 c5 Kxc5 | Kd4 approaches the c-pawn on a shortest open route. After c5, the king captures it; the white king cannot guard c5. |
| r5-endgame-skewers / example | [PF2dd](https://lichess.org/training/PF2dd) | 554 / 81 / 100 / 334 | crushing, endgame, rookEndgame, short, skewer | Kd4 Ra4+ Kd5 Rxg4 | Ra4+ puts the white king on d4 between the checking rook and the rook on g4. After the king leaves, Rxg4 wins that rook. |
| r5-endgame-skewers / 1 main | [DSB9m](https://lichess.org/training/DSB9m) | 567 / 89 / 98 / 747 | crushing, endgame, rookEndgame, short, skewer | Kxd4 Rd2+ Kxc3 Rxd6 | Rd2+ lines up the king on d4 and rook on d6. After Kxc3, Rxd6 captures the rear rook. |
| r5-endgame-skewers / 1 backup | [MhxI1](https://lichess.org/training/MhxI1) | 568 / 86 / 98 / 720 | crushing, endgame, master, rookEndgame, short, skewer | Kf6 Rxh6+ Ke7 Rxc6 | Rxh6+ checks the king on f6 with the rook on c6 behind it. After Ke7, Rxc6 wins the rook. |
| r5-endgame-skewers / 2 main | [SCh0x](https://lichess.org/training/SCh0x) | 584 / 85 / 100 / 682 | crushing, endgame, rookEndgame, short, skewer | Kf2 Rh2+ Ke3 Rxc2 | Rh2+ checks the king on f2 with the rook on c2 behind it. After Ke3, Rxc2 wins the rook. |
| r5-endgame-skewers / 2 backup | [w0GW4](https://lichess.org/training/w0GW4) | 588 / 83 / 100 / 576 | crushing, endgame, rookEndgame, short, skewer | Kxh4 Rh6+ Kxg5 Rxh2 | Rh6+ checks the king on h4 with the rook on h2 behind it. After Kxg5, Rxh2 wins the rook. |
| r5-endgame-skewers / 3 main | [5TD72](https://lichess.org/training/5TD72) | 591 / 84 / 100 / 462 | crushing, endgame, master, rookEndgame, short, skewer | Kc1 Rb1+ Kd2 Rxf1 | Rb1+ checks the king on c1 with the rook on f1 behind it. After Kd2, Rxf1 wins the rook. |
| r5-endgame-skewers / 3 backup | [qGfb3](https://lichess.org/training/qGfb3) | 593 / 89 / 98 / 967 | crushing, endgame, rookEndgame, short, skewer | Kxh5 Rh8+ Kg4 Rxh2 | Rh8+ checks the king on h5 with the rook on h2 behind it. After Kg4, Rxh2 wins the rook. |
| r5-rook-support / example | [8vtl4](https://lichess.org/training/8vtl4) | 898 / 78 / 100 / 407 | advancedPawn, attraction, crushing, endgame, master, promotion, rookEndgame, short | Rxg2 Rg8+ Kxg8 a8=Q+ | Rg8+ vacates a8 with check. After Kxg8, the a7 pawn promotes with check. |
| r5-rook-support / 1 main | [SyVVa](https://lichess.org/training/SyVVa) | 944 / 78 / 100 / 525 | advancedPawn, attraction, crushing, endgame, promotion, rookEndgame, short | e2 Re8+ Kxe8 h8=Q+ | Re8+ vacates h8 with check. After Kxe8, the h7 pawn promotes with check. |
| r5-rook-support / 1 backup | [5T9FM](https://lichess.org/training/5T9FM) | 937 / 78 / 97 / 845 | advancedPawn, clearance, crushing, endgame, promotion, rookEndgame, short | Kh2 Rh8+ Kg3 c8=Q | Rh8+ clears c8 and forces a king reply. The c7 pawn then promotes. |
| r5-rook-support / 2 main | [AuhcO](https://lichess.org/training/AuhcO) | 1054 / 77 / 98 / 1021 | advancedPawn, clearance, crushing, endgame, promotion, rookEndgame, short | c2 Rd8+ Kc1 a8=Q | Rd8+ clears a8 and drives the black king to c1, blocking its own c2 pawn. White then promotes with a8=Q. |
| r5-rook-support / 2 backup | [2Mc4A](https://lichess.org/training/2Mc4A) | 1049 / 82 / 95 / 7166 | advancedPawn, crushing, deflection, endgame, master, masterVsMaster, promotion, rookEndgame, short, superGM | Ra6 Rb6+ Rxb6 a8=Q | Rb6+ draws the defending rook from the a-file to b6. The a7 pawn then promotes. |
| r5-rook-support / 3 main | [AgeRI](https://lichess.org/training/AgeRI) | 1045 / 80 / 95 / 778 | advancedPawn, advantage, deflection, endgame, promotion, rookEndgame, short | Ra6 Rc6+ Rxc6 a8=Q | Rc6+ draws the defending rook from the a-file to c6. The a7 pawn then promotes. |
| r5-rook-support / 3 backup | [Smt15](https://lichess.org/training/Smt15) | 1055 / 87 / 94 / 555 | advancedPawn, crushing, deflection, endgame, promotion, rookEndgame, short | Ka6 Rb6+ Rxb6 h1=Q | Rb6+ draws the defending rook from the h-file to b6. The h2 pawn then promotes. |
| r5-underpromotion / example | [Yb5Fq](https://lichess.org/training/Yb5Fq) | 779 / 86 / 90 / 3276 | advancedPawn, cornerMate, endgame, mate, mateIn1, oneMove, promotion, underPromotion | Kg3 f1=N# | f1=N# gives immediate checkmate. Queen, rook and bishop promotions do not mate; after a queen, c8d8 is a legal reply. The claim is mate now, not that a queen must lose. |
| r5-underpromotion / 1 main | [thYKI](https://lichess.org/training/thYKI) | 839 / 85 / 91 / 26546 | advancedPawn, cornerMate, endgame, mate, mateIn1, oneMove, promotion, underPromotion | Kc6 d8=N# | d8=N# gives immediate checkmate. Queen, rook and bishop promotions do not mate; after a queen, a7a6 is a legal reply. The claim is mate now, not that a queen must lose. |
| r5-underpromotion / 1 backup | [2bNV8](https://lichess.org/training/2bNV8) | 840 / 83 / 89 / 3709 | advancedPawn, endgame, mate, mateIn1, oneMove, promotion, underPromotion | Qxf1 f8=N# | f8=N# gives immediate checkmate. Queen, rook and bishop promotions do not mate; after a queen, a7a6 is a legal reply. The claim is mate now, not that a queen must lose. |
| r5-underpromotion / 2 main | [DuYAe](https://lichess.org/training/DuYAe) | 870 / 83 / 90 / 8468 | advancedPawn, endgame, master, mate, mateIn1, oneMove, promotion, underPromotion | b1=Q f8=N# | f8=N# gives immediate checkmate. Queen, rook and bishop promotions do not mate; after a queen, d6d5 is a legal reply. The claim is mate now, not that a queen must lose. |
| r5-underpromotion / 2 backup | [QAnl6](https://lichess.org/training/QAnl6) | 954 / 82 / 91 / 3241 | advancedPawn, cornerMate, endgame, mate, mateIn1, oneMove, promotion, underPromotion | Kf6 g8=N# | g8=N# is the only immediate checkmate. Queen, rook and bishop promotions all allow replies. The claim is mate now, not that a queen must lose. |
| r5-underpromotion / 3 main | [tpsGj](https://lichess.org/training/tpsGj) | 894 / 82 / 86 / 1156 | advancedPawn, endgame, master, mate, mateIn1, oneMove, promotion, underPromotion | Rh7 d1=N# | d1=N# gives immediate checkmate. Queen, rook and bishop promotions do not mate; after a queen, b7b8 is a legal reply. The claim is mate now, not that a queen must lose. |
| r5-underpromotion / 3 backup | [w4rdF](https://lichess.org/training/w4rdF) | 929 / 84 / 89 / 14773 | advancedPawn, cornerMate, endgame, master, mate, mateIn1, oneMove, promotion, underPromotion | Rge7 g1=N# | g1=N# gives immediate checkmate. Queen, rook and bishop promotions do not mate; after a queen, a7a8 is a legal reply. The claim is mate now, not that a queen must lose. |
| r5-gate-review / example | [oBLk6](https://lichess.org/training/oBLk6) | 820 / 87 / 89 / 609 | crushing, endgame, hangingPiece, oneMove | h5 Qxa1+ | Qxa1+ captures the unguarded rook with check. The published line stops at that material gain. |
| r5-gate-review / 1 main | [YchKS](https://lichess.org/training/YchKS) | 424 / 89 / 100 / 465 | backRankMate, endgame, mate, mateIn1, oneMove | Rxe6 Rd1# | Rd1 is immediate back-rank mate. White’s f2, g2 and h2 pawns block the king. |
| r5-gate-review / 1 backup | [2cGjV](https://lichess.org/training/2cGjV) | 600 / 87 / 99 / 790 | backRankMate, endgame, mate, mateIn1, oneMove, queenEndgame | Qa4 Qb8# | Qb8# mates along the back rank. Black’s f7, g7 and h7 pawns close the king’s escape squares. |
| r5-gate-review / 2 main | [GCVGr](https://lichess.org/training/GCVGr) | 707 / 82 / 100 / 375 | crushing, endgame, pawnEndgame, short | Kf4 Kxd4 Kf5 Kxd5 | The white king safely captures d4 and then d5. Neither target is protected by the distant black king. |
| r5-gate-review / 2 backup | [kuWwt](https://lichess.org/training/kuWwt) | 740 / 86 / 98 / 516 | crushing, endgame, long, pawnEndgame, zugzwang | Ke5 Ke3 Kd5 Kf4 Kd4 Kxg4 | Ke3 waits for Kd5 to open f4. Kf4 then reaches g4 after Kd4. This tests the published replies, not a general zugzwang method. |
| r5-gate-review / 3 main | [87kiD](https://lichess.org/training/87kiD) | 605 / 82 / 100 / 346 | crushing, endgame, rookEndgame, short, skewer | Rxc2 Rh2+ Kf3 Rxc2 | Rh2+ checks the king on f2 with the rook on c2 behind it. After Kf3, Rxc2 wins the rook. |
| r5-gate-review / 3 backup | [D38Qx](https://lichess.org/training/D38Qx) | 608 / 87 / 98 / 1028 | crushing, endgame, rookEndgame, short, skewer | Rh8 Ra8+ Kb7 Rxh8 | Ra8+ checks the king on c8 with the rook on h8 behind it. After Kb7, Rxh8 wins the rook. |
| r5-gate-review / 4 main | [YyCbR](https://lichess.org/training/YyCbR) | 802 / 82 / 98 / 485 | advancedPawn, advantage, endgame, pawnEndgame, promotion, short | b7 h2 b8=Q h1=Q+ | White needs one push and Black needs two. After h2 and b8=Q, h1=Q+ gives check. Both sides keep queens; conversion remains outside this line. |
| r5-gate-review / 4 backup | [8bbWP](https://lichess.org/training/8bbWP) | 818 / 80 / 100 / 309 | advancedPawn, crushing, endgame, long, pawnEndgame, promotion | b5 c3 b6 c2 b7 c1=Q+ | Both leading pawns need three pushes. Black moves first and promotes with check while White is on b7. |
| r5-gate-review / 5 main | [JB3YP](https://lichess.org/training/JB3YP) | 1177 / 85 / 91 / 2387 | advancedPawn, endgame, mate, mateIn1, oneMove, promotion, underPromotion | f8=Q c1=N# | c1=N# gives immediate checkmate. Queen, rook and bishop promotions do not mate; after a queen, f8g8 is a legal reply. The claim is mate now, not that a queen must lose. |
| r5-gate-review / 5 backup | [2Qu17](https://lichess.org/training/2Qu17) | 1289 / 84 / 90 / 3579 | advancedPawn, endgame, mate, mateIn1, oneMove, promotion, underPromotion | b1=Q g8=N# | g8=N# gives immediate checkmate. Queen, rook and bishop promotions do not mate; after a queen, d6b7 is a legal reply. The claim is mate now, not that a queen must lose. |
| r5-gate-review / 6 main | [2RsIw](https://lichess.org/training/2RsIw) | 1000 / 86 / 89 / 987 | advancedPawn, attraction, crushing, endgame, long, promotion, rookEndgame | Rc5 Ra8+ Kxa8 g8=Q+ Ka7 Qxa2+ | Ra8+ clears g8 with check. After the king captures, g8=Q+ forces another reply; the new queen then captures a2. |
| r5-gate-review / 6 backup | [AzfPs](https://lichess.org/training/AzfPs) | 1050 / 77 / 99 / 1620 | advancedPawn, attraction, crushing, endgame, master, promotion, rookEndgame, short | Rf7 Rg1+ Kxg1 b1=Q+ | Rg1+ clears b1 with check. After the king captures, b1=Q+ promotes with check. |

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
The seven king teaching sources prove shortest open routes to each next published pawn capture, measured before each solver move.
The measurement uses the current board, then replays the opponent’s published reply before measuring the next step.
It does not prove every shortest route wins or assess general opposition. The kuWwt review separately depends on a reply opening f4.
Even the zugzwang-tagged review source is assessed as its concrete king route, without claiming a general zugzwang method.
No source is extended, composed or substituted to imply a missing technique capability.

## Verification and handoff

Content verification completed on 2026-10-24:

- Read every displayed board and complete line, including all examples and backups.
- Twelve focused tests cover saved-progress compatibility, chapter integration, source quality, pawn races, king routes, rook purpose, skewers, promotion necessity and review variation.
- The rook test checks that immediate promotion is blocked or can be captured before the rook check, then becomes safe after the published reply.
- The skewer test checks king-between-rooks geometry and the actual rear-rook capture, rather than trusting tags.
- The king-route test checks all seven teaching sources and rejects the legal Kd3 detour in 8a9DZ as one step slower.
- The underpromotion test enumerates every legal move in all nine lesson/review sources and requires the published knight promotion to be the only mate.
- Alternative promotions retain one replayable sample reply; generated reply ordering is not an assertion.
- An independent database scan matched all 55 FENs, complete move lists, ratings, themes and quality fields exactly.
- Reservation scan found no overlap with other currently present curriculum, bounty, warm-up or ambush source IDs.

Commands: npx vitest run src/game/course/region5.test.ts; npx tsc --noEmit; and the ignored local source-comparison script.
Source data and curation scratch files are not shipped.

Independent Astra review matched all 55 sources and inspected their teaching mechanisms. Its P2 finding moved kf9cP into wave 3 main.
The opponent-promotes-first exception now appears before the review, with AojWU as its backup.

PR #49 review fixes passed `npm run ci`: type-check, production build and 409 unit tests across 28 files.
All 55 revised sources matched the raw database; none overlaps the finale or earlier packs.
Fresh Astra code and teaching review found no actionable issue and independently passed all 11 focused tests.
A later compatibility regression confirmed that swapping rook support and skewers rejected saves completed through rook support.
The original lesson order is restored; the interleaved review remains. The regression now checks that those saves load with all progress intact.
The compatibility follow-up passed all 12 focused tests and `npm run ci`: type-check, build and 411 tests across 28 files.

At the original integration revision, CI passed type-check, build and 407 unit tests across 28 files. Normal CI skips both engine groups by dependency selection.
The full release suite remains pending: the retained baseline reproduced a legacy r1-guard Brave bonus-rate failure, tracked in #42.
Full browser navigation, viewport and staging checks remain pending; this is an integration checkpoint.

Integration tests, full release regressions, browser evidence and staging checks are recorded in [build progress](../../progress.md).
This content record does not substitute for those checks or claim an owner playtest.
Browser checks must cover desktop, portrait, short phone and landscape, with WebKit touch emulation identified accurately.
Preserve readable advice, separate temporary speech, the 44px history control, classic pieces, reduced motion and cancellation on exit.
Production publication remains a separate decision from staging.
