# Region 4 · The Iron March

[Design](../../design.md) · [Syllabus](../syllabus.md) · [Story](../story.md) · [Playbook](../../playbook.md) · [Issue #43](https://github.com/avoidthekitchen/chess-rpg-gauntlet/issues/43)

## Design status

Shipped in the [production journey](https://unformedideas.com/chess-rpg/), 2026-10-24. PRs #47–51 are merged.
Local mechanism tests and type-check pass. Integrated checks and owner-accepted WebKit emulation are in the [release record](../../complete-journey-release.md).
This is tactical coordination and defensive calculation. It is not a complete opening, positional, or defensive course.

| Field | Chapter decision |
| --- | --- |
| Region and faction | The Iron March; Iron Legion |
| Place and leader | Flintwatch; General Flint, the lion general |
| Prerequisites | R1 safe captures and exchanges; R2 forcing replies, forks, defender removal, mate; R3 absolute pins and line tactics |
| New skills | Bishop development with check; file access for mate; exposed-king checking sequences; guard deflection; checking captures before recaptures; captures that stop mate-in-one threats and win material |
| Revisited skills | Three file positions exploit absolute pins before deflection. Intermediate moves revisit R1 exchange counting and R2 defender removal. |
| Capability | Existing published-line runner; one to three solver moves; original FEN, setup, replies, and endpoints |
| Companion | The selected companion coaches every lesson; no named companion is substituted for a board piece |
| Completion | Finish lessons in order, then Flint’s six-wave review. Completion opens the next built chapter; stars remain optional. |
| Deferred | Overload, quiet development, general file strategy, branching endgame technique, powers, faction AI, and live army duels |

## Teaching scope and source-driven decisions

Development is narrowed to a bishop leaving c1, f1, c8, or f8 with check.
The source board proves the starting square and forcing move; it does not prove the piece’s entire game history.
The examples include a mating finish, a queen capture, and a knight fork after the developing check.
No knight-development claim is made.

File tactics use a clear file to reach a checking square, followed by mate.
The lesson does not promise general file control. Capture destinations can be occupied; the travel squares must be clear.
The first three sources revisit absolute pins: a nominal guard cannot capture the mating piece without exposing its king.
Their pinned guards are g7, b7, and e7; the lesson demonstration names the first one explicitly.

Exposed-king positions use three solver checks, within the existing three-move source limit.
The checked king’s legal replies are recorded at every step in the evidence file.
The selected lines require no sacrifice; rooks or queens close the final escape squares.
A published reply is one source continuation, not a claim that all checking positions have only one legal reply.

Deflection is narrowed to drawing a known defender away with check, then capturing its former charge.
Each record identifies the guard, guarded target, lure square, published capture, and positive net exchange.
These sources do not establish overload’s two distinct defensive duties, so overload remains unclaimed.

Intermediate moves are checking captures before an available recapture.
Four guided sources remove a defender of that recapture. A fifth captures a queen with check first.
The final pair takes an extra rook with check before returning to the original capturing piece.
The evidence records the immediate recapture and captures available after that alternative.
This deliberately returns to counting both sides’ captures before choosing an exchange.

Defence starts with an actual mate-in-one threat while the solver is not in check.
Every first answer is a non-checking capture that removes all immediate mating continuations.
The opponent then gives the published check; the solver’s final answer completes the source line.
This teaches capturing to stop a visible mate threat, gaining material, then answering the next check. It does not cover comprehensive defensive planning.
Other moves may stop the immediate threat. In OhR2Q, Rf1 is a sound defence, but it does not win the rook.
The objective asks for both defence and material gain; it does not call every other defence unsound.
All nine sources have exactly one non-checking capture that removes every immediate mating reply. Tests enumerate all legal captures to verify this.
The review also checks that the capturing piece cannot be recaptured at the endpoint, and its gain survives the opponent’s largest immediate capture.
These are bounded board checks, not an engine proof of every later continuation.
For example, dRoKV threatens Qf1#; Qxf7 guards f1. The lesson does not incorrectly call the rook the mating piece.

## Map and sequence

Cult review → Leave the barracks → Through the gate → Beyond the shields → Draw the guard away → Before taking back → Hold the last gate → Flint’s decision → Bone Wardens.

The shared registry controls availability. A chapter not integrated into the registry remains unavailable.
Previously completed lessons remain replayable; retries and optional stars retain the shared rules.

| Order | Encounter | Demonstration | Practice and backups | Takeaway |
| --- | --- | --- | --- | --- |
| 1 | Leave the barracks | Bc4+ develops, then Bxe6# | Different bishop diagonals; mating finishes, queen capture, and a knight fork | Bring a bishop into play with a forcing check |
| 2 | Through the gate | Re8# uses a file and a pinned guard | Two more pin revisits, then rook/queen file entries and blocking replies | Trace a clear file and calculate the finish |
| 3 | Beyond the shields | Two rooks pursue a king to h6, then mate on h8 | Rook and queen sequences; escaping kings and interpositions | Count escapes at every check |
| 4 | Draw the guard away | Re8+ draws a rook off d8; Qxd2 wins the queen | Rook, bishop, and knight offers; rook, king, and queen defenders | Know what the guard leaves behind |
| 5 | Before taking back | Bxc6+ removes the knight guarding d4 before Qxd4 | Guard removal, higher-value capture, and extra rook capture | Check before recapturing; count the full trade |
| 6 | Hold the last gate | Qxf7 prevents Qf1#; Kg2 answers Qd1+ | Threat removal by rook, queen, and knight; block or move after check | Stop the mating threat with a capture that gains material |
| 7 | Flint’s decision | Neutral stored example; direct review entry | Six fresh main/backup pairs mapped below | Recognise a taught idea without its label |

## Mixed review

| Wave | Assessed skill | Main | Backup | Recognition requirement |
| --- | --- | --- | --- | --- |
| 1 | File entry and earlier absolute pin | 31XQ9 | 0lrXr | Use the file and notice why the apparent guard cannot capture |
| 2 | Intermediate checking capture | IXyqT | sxdTZ | Notice the recapture, then find a useful check first |
| 3 | Coordination through developing check | aY6xO | d9mXL | Find the bishop’s entry and calculate the blocking reply |
| 4 | Deflection | CeqlU | ascNK | Identify the guard’s duty before drawing it away |
| 5 | Exposed-king attack | skBmI | d2U43 | Follow checks and the king’s escapes |
| 6 | Meet an immediate mating threat | x4f2j | fdj22 | Stop the threat with a capture that wins material and answer the next check |

The stored example R3q4o is fresh but not shown before assessment by the current interface.
Titles, objectives, introductions, and coaching remain neutral. Requested hints follow existing help settings.
Each backup assesses the same mechanism as its main source and lies within 200 rating points.
Retries are supported practice; they are not described as unseen assessment.
The review interleaves lesson skills. File entries also revisit absolute pins, so all six chapter skills receive fresh main and backup positions.
The defence pair is rated 1028/1093. Its harder position is five points above the guided lesson’s hardest main position at 1088.
It replaces the former 1199/1201 stretch. ERCLb was removed because its source endpoint stopped before a rook and knight could be regained.
The 683-rated development position remains a familiar recognition check within the mixed review; ratings are selection aids, not a learning measure.

## Sources and board evidence

[Puzzle records](../../../src/game/course/region4Puzzles.json) preserve all 55 original FENs, moves, themes, ratings, quality values, and URLs.
[Mechanism evidence](../../../src/game/course/region4Evidence.json) records decisive squares, material counts, mate threats, and legal replies.
Lichess supplies the published positions. All teaching and story text is original Pawnshire writing.
Quality means plays ≥300, popularity ≥85, deviation ≤90, rating 400–1300. Source quality does not establish learning gains.

Each ordinary lesson stores example, main 1, backup 1, main 2, backup 2, main 3, backup 3.
The review follows the same ordering for six waves. All 55 IDs are distinct and reserved against earlier curriculum and legacy packs.
The table’s quality column gives rating / deviation / popularity / plays. SAN includes the setup move first.

| Encounter and role | Source | Quality | Themes | Setup and published line | Board evidence |
| --- | --- | --- | --- | --- | --- |
| r4-develop · example | [RhFcH](https://lichess.org/training/RhFcH) | 909 / 78 / 86 / 337 | kingsideAttack, mate, mateIn2, opening, short | Kg8 Bc4+ e6 Bxe6# | The bishop develops from f1 to c4 with Bc4+. The reply e6 allows Bxe6#. |
| r4-develop · main 1 | [OgFmF](https://lichess.org/training/OgFmF) | 933 / 85 / 91 / 1125 | mate, mateIn2, opening, short | Nd5 Bb5+ Bd7 Bxd7# | The bishop develops from f1 to b5 with Bb5+. The reply Bd7 allows Bxd7#. |
| r4-develop · backup 1 | [jACYs](https://lichess.org/training/jACYs) | 945 / 78 / 100 / 632 | mate, mateIn2, opening, short | Kd8 Bg5+ Be7 Qxe7# | The bishop develops from c1 to g5 with Bg5+. The reply Be7 allows Qxe7#. |
| r4-develop · main 2 | [LmMyq](https://lichess.org/training/LmMyq) | 948 / 89 / 91 / 361 | advantage, fork, opening, short | Bxc5 Bb5+ Bd7 Bxa4 | The bishop develops from f1 to b5 with Bb5+. The reply Bd7 allows Bxa4. |
| r4-develop · backup 2 | [XPVsm](https://lichess.org/training/XPVsm) | 943 / 88 / 95 / 2848 | advantage, opening, short | Be2 Bf5+ Ka1 Nc2+ | The bishop develops from c8 to f5 with Bf5+. The reply Ka1 allows Nc2+. |
| r4-develop · main 3 | [yl1Zp](https://lichess.org/training/yl1Zp) | 918 / 78 / 98 / 668 | bodenMate, mate, mateIn1, oneMove, opening | Qxd4 Bb5# | The bishop develops from f1 to b5 with Bb5#. The line ends at checkmate. |
| r4-develop · backup 3 | [XyPoE](https://lichess.org/training/XyPoE) | 924 / 89 / 88 / 360 | balestraMate, mate, mateIn1, oneMove, opening | Rb1 Bg4# | The bishop develops from c8 to g4 with Bg4#. The line ends at checkmate. |
| r4-file · example | [sYZgM](https://lichess.org/training/sYZgM) | 803 / 78 / 97 / 808 | master, mate, mateIn1, middlegame, oneMove, pin | bxc6 Re8# | The rook travels from e1 to e8 along the clear e-file with check. The guard on g7 is pinned to the king on g8. The published line ends in Re8#. |
| r4-file · main 1 | [IVjmt](https://lichess.org/training/IVjmt) | 610 / 80 / 100 / 371 | mate, mateIn1, middlegame, oneMove, pin | Bxe8 Rd8# | The rook travels from d1 to d8 along the clear d-file with check. The guard on b7 is pinned to the king on c8. The published line ends in Rd8#. |
| r4-file · backup 1 | [OZPY8](https://lichess.org/training/OZPY8) | 737 / 85 / 100 / 950 | mate, mateIn1, middlegame, oneMove, pin | Rxf8 Rxf8# | The rook travels from f1 to f8 along the clear f-file with check. The guard on e7 is pinned to the king on d8. The published line ends in Rxf8#. |
| r4-file · main 2 | [IySvM](https://lichess.org/training/IySvM) | 900 / 77 / 100 / 513 | backRankMate, endgame, mate, mateIn2, short | Rxd5 Re1+ Rf1 Rxf1# | The rook travels from e8 to e1 along the clear e-file with check. The published line ends in Rxf1#. |
| r4-file · backup 2 | [p8glC](https://lichess.org/training/p8glC) | 900 / 80 / 85 / 580 | backRankMate, endgame, fork, mate, mateIn2, short | Bxg6 Qg1+ Rf1 Qxf1# | The queen travels from g5 to g1 along the clear g-file with check. The published line ends in Qxf1#. |
| r4-file · main 3 | [jqNgK](https://lichess.org/training/jqNgK) | 901 / 78 / 100 / 364 | backRankMate, endgame, mate, mateIn2, queenRookEndgame, short | Rxe7 Rc1+ Re1 Rxe1# | The rook travels from c7 to c1 along the clear c-file with check. The published line ends in Rxe1#. |
| r4-file · backup 3 | [gnoUd](https://lichess.org/training/gnoUd) | 903 / 76 / 100 / 737 | backRankMate, endgame, mate, mateIn2, short | Bxb5 Ra8+ Be8 Rxe8# | The rook travels from a1 to a8 along the clear a-file with check. The published line ends in Rxe8#. |
| r4-exposed · example | [RDXPl](https://lichess.org/training/RDXPl) | 821 / 82 / 99 / 883 | endgame, exposedKing, long, mate, mateIn3, queenRookEndgame | Rxe6 Rf8+ Kh7 R1f7+ Kh6 Rh8# | Against the king on g8, Rf8+ starts 3 consecutive checks: Rf8+, R1f7+, Rh8#. The source replies are Kh7, Kh6; the last check leaves no legal escape. |
| r4-exposed · main 1 | [IE5yQ](https://lichess.org/training/IE5yQ) | 835 / 87 / 91 / 373 | endgame, exposedKing, long, mate, mateIn3 | fxg3 Rh1+ Kg2 R8h2+ Kf3 Rf1# | Against the king on g1, Rh1+ starts 3 consecutive checks: Rh1+, R8h2+, Rf1#. The source replies are Kg2, Kf3; the last check leaves no legal escape. |
| r4-exposed · backup 1 | [7BbVn](https://lichess.org/training/7BbVn) | 859 / 84 / 97 / 1597 | endgame, exposedKing, long, mate, mateIn3, rookEndgame | Rxh7 Rd1+ Kh2 R8d2+ Kh3 Rh1# | Against the king on g1, Rd1+ starts 3 consecutive checks: Rd1+, R8d2+, Rh1#. The source replies are Kh2, Kh3; the last check leaves no legal escape. |
| r4-exposed · main 2 | [1xMAc](https://lichess.org/training/1xMAc) | 871 / 78 / 98 / 459 | endgame, epauletteMate, exposedKing, long, mate, mateIn3 | cxd3 Re1+ Kc2 R7e2+ Kb3 Rb1# | Against the king on b1, Re1+ starts 3 consecutive checks: Re1+, R7e2+, Rb1#. The source replies are Kc2, Kb3; the last check leaves no legal escape. |
| r4-exposed · backup 2 | [Fd6ge](https://lichess.org/training/Fd6ge) | 875 / 77 / 99 / 1007 | endgame, epauletteMate, exposedKing, long, mate, mateIn3 | Qd3 Re8+ Kf7 R1e7+ Kg6 Rg8# | Against the king on g8, Re8+ starts 3 consecutive checks: Re8+, R1e7+, Rg8#. The source replies are Kf7, Kg6; the last check leaves no legal escape. |
| r4-exposed · main 3 | [72vLw](https://lichess.org/training/72vLw) | 845 / 81 / 100 / 737 | endgame, exposedKing, long, mate, mateIn3 | hxg3 Qh3+ Kg1 Qxg3+ Kh1 Qh3# | Against the king on h1, Qh3+ starts 3 consecutive checks: Qh3+, Qxg3+, Qh3#. The source replies are Kg1, Kh1; the last check leaves no legal escape. |
| r4-exposed · backup 3 | [RJegm](https://lichess.org/training/RJegm) | 852 / 89 / 96 / 531 | exposedKing, kingsideAttack, long, mate, mateIn3, middlegame | Kxh8 Qh5+ Bh6 Qxh6+ Kg8 Qh7# | Against the king on h8, Qh5+ starts 3 consecutive checks: Qh5+, Qxh6+, Qh7#. The source replies are Bh6, Kg8; the last check leaves no legal escape. |
| r4-deflect · example | [4bU3U](https://lichess.org/training/4bU3U) | 902 / 77 / 98 / 1044 | advantage, deflection, endgame, master, short | Qd2 Re8+ Rxe8 Qxd2 | The defender on d8 guards d2. Re8+ draws it to e8 with Rxe8; Qxd2 then takes its former charge. The published exchange gains 4 material points. |
| r4-deflect · main 1 | [Cm0pb](https://lichess.org/training/Cm0pb) | 904 / 79 / 98 / 847 | advantage, deflection, endgame, short | Qd8 Re1+ Rxe1 Qxd8 | The defender on d1 guards d8. Re1+ draws it to e1 with Rxe1; Qxd8 then takes its former charge. The published exchange gains 4 material points. |
| r4-deflect · backup 1 | [U55OX](https://lichess.org/training/U55OX) | 907 / 83 / 97 / 1135 | advantage, deflection, endgame, short | Qd7 Re1+ Rxe1 Qxd7 | The defender on d1 guards d7. Re1+ draws it to e1 with Rxe1; Qxd7 then takes its former charge. The published exchange gains 4 material points. |
| r4-deflect · main 2 | [mjTwj](https://lichess.org/training/mjTwj) | 906 / 78 / 96 / 438 | advantage, deflection, kingsideAttack, middlegame, short | Rae1 Bxf2+ Rxf2 Qxe1+ | The defender on f1 guards e1. Bxf2+ draws it to f2 with Rxf2; Qxe1+ then takes its former charge. The published exchange gains 3 material points. |
| r4-deflect · backup 2 | [gn5eK](https://lichess.org/training/gn5eK) | 907 / 82 / 94 / 1103 | crushing, deflection, endgame, short | Rf1 Bh2+ Kxh2 Rxf1 | The defender on g1 guards f1. Bh2+ draws it to h2 with Kxh2; Rxf1 then takes its former charge. The published exchange gains 2 material points. |
| r4-deflect · main 3 | [LXf27](https://lichess.org/training/LXf27) | 908 / 77 / 97 / 1176 | advantage, deflection, discoveredAttack, master, middlegame, short | Qh5 Ne7+ Rxe7 Qxc8+ | The defender on e8 guards c8. Ne7+ draws it to e7 with Rxe7; Qxc8+ then takes its former charge. The published exchange gains 2 material points. |
| r4-deflect · backup 3 | [pBsbP](https://lichess.org/training/pBsbP) | 908 / 79 / 93 / 846 | advantage, deflection, discoveredAttack, kingsideAttack, master, middlegame, short | Bf4 Nf3+ Qxf3 Rxe1+ | The defender on d1 guards e1. Nf3+ draws it to f3 with Qxf3; Rxe1+ then takes its former charge. The published exchange gains 2 material points. |
| r4-between · example | [4KxnK](https://lichess.org/training/4KxnK) | 747 / 86 / 96 / 807 | crushing, intermezzo, middlegame, short | Qxd4 Bxc6+ bxc6 Qxd4 | After Qxd4, Qxd4 is legal. First play Bxc6+ to remove the knight on c6 guarding that recapture. After bxc6, Qxd4 captures the original attacker. This line gains 9 material points from the displayed position. |
| r4-between · main 1 | [yeOLz](https://lichess.org/training/yeOLz) | 806 / 78 / 87 / 493 | crushing, endgame, intermezzo, short | Rxc4 Nxe6+ fxe6 Rxc4 | After Rxc4, Rxc4 is legal. First play Nxe6+ to remove the bishop on e6 guarding that recapture. After fxe6, Rxc4 captures the original attacker. This line gains 5 material points from the displayed position. |
| r4-between · backup 1 | [4OvXv](https://lichess.org/training/4OvXv) | 861 / 77 / 87 / 419 | crushing, endgame, intermezzo, short | Qxe6 Rxf8+ Rxf8 Qxe6 | After Qxe6, Qxe6 is legal. First play Rxf8+ to remove the knight on f8 guarding that recapture. After Rxf8, Qxe6 captures the original attacker. This line gains 7 material points from the displayed position. |
| r4-between · main 2 | [syBnk](https://lichess.org/training/syBnk) | 916 / 85 / 93 / 903 | advantage, intermezzo, middlegame, short | Qxe3 Nxf5+ exf5 Qxe3 | After Qxe3, Qxe3 is legal. First play Nxf5+ to remove the knight on f5 guarding that recapture. After exf5, Qxe3 captures the original attacker. This line gains 9 material points from the displayed position. |
| r4-between · backup 2 | [pK2b2](https://lichess.org/training/pK2b2) | 906 / 81 / 91 / 493 | advantage, intermezzo, kingsideAttack, middlegame, short | Rxe4 Nxf6+ gxf6 Rxe4 | After Rxe4, Rxe4 is legal. First play Nxf6+ to take the queen on f6 with check. After gxf6, Rxe4 captures the original attacker. This line gains 11 material points from the displayed position. |
| r4-between · main 3 | [FOtOo](https://lichess.org/training/FOtOo) | 871 / 87 / 90 / 1364 | crushing, endgame, hangingPiece, intermezzo, short | Bxe4 Rxd8+ Kg7 Bxe4 | After Bxe4, Bxe4 is legal. First play Rxd8+ to take the rook on d8 with check. After Kg7, Bxe4 captures the original attacker. This line gains 8 material points from the displayed position. |
| r4-between · backup 3 | [1Yycx](https://lichess.org/training/1Yycx) | 912 / 80 / 99 / 778 | crushing, endgame, hangingPiece, intermezzo, short | Rxa8 Rxc1+ Kh2 Bxa8 | After Rxa8, Bxa8 is legal. First play Rxc1+ to take the rook on c1 with check. After Kh2, Bxa8 captures the original attacker. This line gains 10 material points from the displayed position. |
| r4-defend · example | [dRoKV](https://lichess.org/training/dRoKV) | 949 / 79 / 100 / 396 | crushing, defensiveMove, endgame, hangingPiece, short | Kh7 Qxf7 Qd1+ Kg2 | The displayed position threatens Qf1# if the opponent moves next. Qxf7 removes every immediate mating move without giving check. Then Qd1+ is answered by Kg2; stop at that source endpoint. |
| r4-defend · main 1 | [mmo0r](https://lichess.org/training/mmo0r) | 984 / 77 / 96 / 2506 | advantage, defensiveMove, endgame, short | Rxe2 Rxe2 Qxf3+ Rg2 | The displayed position threatens Qg2# if the opponent moves next. Rxe2 removes every immediate mating move without giving check. Then Qxf3+ is answered by Rg2; stop at that source endpoint. |
| r4-defend · backup 1 | [7VNVN](https://lichess.org/training/7VNVN) | 1008 / 88 / 93 / 720 | advantage, defensiveMove, endgame, hangingPiece, master, masterVsMaster, short | Qe5 Qxd8 Qa1+ Kh2 | The displayed position threatens Rd1# if the opponent moves next. Qxd8 removes every immediate mating move without giving check. Then Qa1+ is answered by Kh2; stop at that source endpoint. |
| r4-defend · main 2 | [I1Zr0](https://lichess.org/training/I1Zr0) | 1036 / 78 / 86 / 311 | crushing, defensiveMove, endgame, hangingPiece, short | c1=Q Rxc1 Rh2+ Kg6 | The displayed position threatens Qg5# or Qxh1# if the opponent moves next. Rxc1 removes every immediate mating move without giving check. Then Rh2+ is answered by Kg6; stop at that source endpoint. |
| r4-defend · backup 2 | [OhR2Q](https://lichess.org/training/OhR2Q) | 1064 / 79 / 91 / 1304 | crushing, defensiveMove, endgame, short | Rxe3 Rxe3 Qa1+ Kf2 | The displayed position threatens Rxe1# if the opponent moves next. Rxe3 removes every immediate mating move without giving check. Then Qa1+ is answered by Kf2; stop at that source endpoint. |
| r4-defend · main 3 | [y7n8E](https://lichess.org/training/y7n8E) | 1088 / 81 / 90 / 457 | advantage, defensiveMove, endgame, short | f8=Q Nxf8 Be5+ Ka7 | The displayed position threatens Rxc8# if the opponent moves next. Nxf8 removes every immediate mating move without giving check. Then Be5+ is answered by Ka7; stop at that source endpoint. |
| r4-defend · backup 3 | [a325i](https://lichess.org/training/a325i) | 1179 / 79 / 93 / 1222 | advantage, defensiveMove, middlegame, short | Rxf4 Qxf4 Qxc5+ Kg8 | The displayed position threatens Qxf7# if the opponent moves next. Qxf4 removes every immediate mating move without giving check. Then Qxc5+ is answered by Kg8; stop at that source endpoint. |
| r4-legion-review · example | [R3q4o](https://lichess.org/training/R3q4o) | 890 / 77 / 100 / 524 | kingsideAttack, mate, mateIn2, opening, short | Kg8 Bc4+ Be6 Bxe6# | The bishop develops from f1 to c4 with Bc4+. The reply Be6 allows Bxe6#. |
| r4-legion-review · main 1 | [31XQ9](https://lichess.org/training/31XQ9) | 901 / 82 / 95 / 1287 | endgame, mate, mateIn1, oneMove, pin | Qxe7 Rxd8# | The rook travels from d1 to d8 along the clear d-file with check. The guard on e7 is pinned to the king on f8. The published line ends in Rxd8#. |
| r4-legion-review · backup 1 | [0lrXr](https://lichess.org/training/0lrXr) | 921 / 83 / 96 / 327 | endgame, mate, mateIn1, oneMove, pin | Rxe1 Rxe1# | The rook travels from e8 to e1 along the clear e-file with check. The guard on f2 is pinned to the king on g1. The published line ends in Rxe1#. |
| r4-legion-review · main 2 | [IXyqT](https://lichess.org/training/IXyqT) | 814 / 89 / 96 / 3054 | advantage, endgame, intermezzo, short | Rxf6 Bxg2+ Kxg2 Kxf6 | After Rxf6, Kxf6 is legal. First play Bxg2+ to take the queen on g2 with check. After Kxg2, Kxf6 captures the original attacker. This line gains 11 material points from the displayed position. |
| r4-legion-review · backup 2 | [sxdTZ](https://lichess.org/training/sxdTZ) | 913 / 84 / 90 / 412 | crushing, endgame, hangingPiece, intermezzo, master, short | Nxd5 Rxe8+ Kh7 cxd5 | After Nxd5, cxd5 is legal. First play Rxe8+ to take the bishop on e8 with check. After Kh7, cxd5 captures the original attacker. This line gains 6 material points from the displayed position. |
| r4-legion-review · main 3 | [aY6xO](https://lichess.org/training/aY6xO) | 683 / 88 / 85 / 321 | bodenMate, mate, mateIn2, opening, short | Bxd5 Bb5+ Bc6 Bxc6# | The bishop develops from f1 to b5 with Bb5+. The reply Bc6 allows Bxc6#. |
| r4-legion-review · backup 3 | [d9mXL](https://lichess.org/training/d9mXL) | 832 / 84 / 85 / 317 | mate, mateIn2, opening, short | Ke2 Bg4+ Nf3 Bxf3# | The bishop develops from c8 to g4 with Bg4+. The reply Nf3 allows Bxf3#. |
| r4-legion-review · main 4 | [CeqlU](https://lichess.org/training/CeqlU) | 915 / 81 / 92 / 662 | advantage, deflection, discoveredAttack, endgame, short | Rc1 Ne2+ Qxe2 Rxc1+ | The defender on d2 guards c1. Ne2+ draws it to e2 with Qxe2; Rxc1+ then takes its former charge. The published exchange gains 2 material points. |
| r4-legion-review · backup 4 | [ascNK](https://lichess.org/training/ascNK) | 917 / 87 / 95 / 411 | advantage, deflection, discoveredAttack, kingsideAttack, middlegame, short | Rh3 Nf2+ Qxf2 Qxd1+ | The defender on d2 guards d1. Nf2+ draws it to f2 with Qxf2; Qxd1+ then takes its former charge. The published exchange gains 2 material points. |
| r4-legion-review · main 5 | [skBmI](https://lichess.org/training/skBmI) | 918 / 76 / 88 / 499 | endgame, exposedKing, long, mate, mateIn3 | Kf6 Qf7+ Kg5 Qf5+ Kh6 Qh5# | Against the king on f6, Qf7+ starts 3 consecutive checks: Qf7+, Qf5+, Qh5#. The source replies are Kg5, Kh6; the last check leaves no legal escape. |
| r4-legion-review · backup 5 | [d2U43](https://lichess.org/training/d2U43) | 909 / 85 / 94 / 519 | exposedKing, long, mate, mateIn3, middlegame, swallowstailMate | Qc6 Qh3+ Bh4 Qxh4+ Kg7 Qh7# | Against the king on h6, Qh3+ starts 3 consecutive checks: Qh3+, Qxh4+, Qh7#. The source replies are Bh4, Kg7; the last check leaves no legal escape. |
| r4-legion-review · main 6 | [x4f2j](https://lichess.org/training/x4f2j) | 1028 / 76 / 94 / 2962 | crushing, defensiveMove, endgame, hangingPiece, master, short | Qxf5 Qxh6 Qc8+ Kg7 | The displayed position threatens Qxh7# if the opponent moves next. Qxh6 captures material and removes every immediate mating move without check. Answer Qc8+ with Kg7; the source line gains 5 material points. |
| r4-legion-review · backup 6 | [fdj22](https://lichess.org/training/fdj22) | 1093 / 77 / 93 / 464 | advantage, defensiveMove, middlegame, short | Rxh8 Qxh8 Qg3+ Kf8 | Qxh8 captures the rook supporting Qh6# and removes the mating threat without check. Answer Qg3+ with Kf8. The queen cannot be recaptured at the published endpoint; the gain stays positive even after White’s largest immediate capture, Nxd7+. |

## Story and presentation

The cult’s records identify Flint. His pride has turned Pawnshire’s disciplined army against its young king.
The encounter route opens barracks and gates, turns patrols back, and reaches the command tent.
Flint’s challenge ends with the Legion returning to Pawnshire. He becomes a story ally, without a roster upgrade or power.
His scouts report Bone Wardens at the border. The Lich King’s brief written interlude keeps his voice cold and courtly.

The selected companion remains the tutor. Generic piece speech follows the puzzle’s player color.
Matching Legion tokens and portraits are in place, including Flint's distinct lion portrait. The existing map-region4 landscape remains.
See the [art review](../../faction-art-review.md).
Integrated presentation evidence covers phone advice, speech history, reduced motion, classic pieces, and scene cancellation. See the [release record](../../complete-journey-release.md).

## Technique dependencies

None blocks this chapter. Quiet improvement, broad king safety, and sustained file control need a future model accepting multiple sound plans.
These fixed source lines do not claim that capability.

## Verification and handoff

- 2026-10-24: npx vitest run src/game/course/region4.test.ts passes all five content tests, covering all 55 sources.
- 2026-10-24: npx tsc --noEmit passes at the content handoff.
- Mechanism tests recompute bishop starting squares, file movement, checking lines, guard displacement, recapture availability, mate threats, and absolute pins.
- Tests cover examples, every main position, every backup, review coverage, quality, legal replays, distinct IDs, and nearby backup ratings.
- 2026-10-24: `node scripts/select-curriculum.mjs --verify-shipped` verified 200 unchanged sources, including all 55 Region 4 positions, against the local database.
- 2026-10-24 review fixes: `npm run ci` passed type-check, production build, and 400 tests in 27 files. No legacy engine dependencies changed.
- Integrated runner, save, review, viewport, WebKit emulation, and CI evidence is in the [release record](../../complete-journey-release.md). Legacy engine benchmarks are retired release gates.
- This chapter record does not establish measured learning improvement. Owner feedback, staging evidence, and production publication are recorded separately.

See the parent progress entry and review PR for integrated build, browser, deployment, and release evidence.
