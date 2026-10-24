import type { BattleDef } from './content';

/**
 * Region 1, the Bog: five lesson battles against the Bog Goblins (threat awareness,
 * protection, safe trades, basic checkmates, and a promotion run revisiting pawn basics).
 *
 * Goblins shout the move they'd play if you passed, then decide again after your move,
 * preferring the shout but free to switch, so every battle opens with "what does my
 * opponent want?" Each position is built so the shout names a real threat, and the best
 * answer works against any defence: no trap may depend on the goblins keeping their word.
 *
 * A single trick shouldn't end a battle, so each one needs a second idea once the first has
 * landed: a second wave of threats, more loot to collect safely, or a race to win. Strong
 * play takes about 4 to 7 moves.
 *
 * Every position here is checked by `npm run verify:battles` (scripts/verify): strong
 * play wins at least 90% against Gentle and Brave goblins, careless play
 * loses most games, and no battle can be won on the first move. Material goals are bigger
 * than any single capture, so one greedy grab never wins.
 */
export const REGION1_BATTLES: BattleDef[] = [
  {
    // The shout is cxd5: a pawn hits the knight. Don't just run. Ne7+ saves it with check and
    // forks the king and the loose c8 rook (the h5 bishop can't reach c8), worth 5 points.
    // Nf6+ also forks, but only swaps the knight for the bishop (gxh5). The goal is 7, so
    // then comes a second wave: pick up two loose pawns (a7, b7, and c6 once b7 falls) while the goblins guard
    // what they can and the h5 bishop pokes at your pieces. The goal is bigger than the rook,
    // so the fork alone never wins.
    id: 'r1-reeds',
    kind: 'skirmish',
    theme: 'Threat awareness',
    title: 'Trouble in the Reeds',
    region: 'The Bog',
    enemy: { name: 'Goblin Scouts', personality: 'standard' },
    intro:
      'Goblin scouts are splashing through the reeds, grabbing anything left lying about. Some of their own gear is lying about too.',
    lesson:
      'Before every move, ask two questions: what is attacked, and what is undefended? Save a threatened piece first, and if you can, move it to a square where it attacks something loose. Then ask again after every goblin move, because each one can make a new threat. Pieces nobody protects are the easiest ones to win.',
    fen: '2r3k1/pp3p1p/2p3p1/3N3b/8/1B6/P4PPP/4R1K1 w - - 0 1',
    objective: { kind: 'winMaterial', gain: 7, maxMoves: 10 },
    reward: 15,
    bonuses: [
      { kind: 'flawless', gold: 5 },
      { kind: 'noRewind', gold: 5 },
    ],
    tip: 'Listen to what they shout. That’s the piece they want!',
    before: [
      { who: 'narrator', text: 'Mud, reeds, and a lot of very loud goblins.' },
      { who: 'enemy', text: 'Shiny things! Grab the shiny things!' },
      { who: 'companion', text: 'They yell their plans out loud. Our knight is in danger, so let’s move it somewhere it bites back.' },
    ],
    after: [
      { who: 'enemy', text: 'Who left our stuff lying about?! Run!' },
      { who: 'companion', text: 'Look first, then move. That’s half of chess right there.' },
    ],
    shouts: true,
  },
  {
    // Villages c4 (guarded by the d2 knight) and e3 (the e1 rook). Shout: Na4xb2. The bishop
    // isn't a village guard, but if it falls the b2 knight joins the attack on c4 and Nd2 is
    // outnumbered. So step it away first (Ba1 or Be5; both still cover b2). The a5 pawn covers b6,
    // so the a4 knight can't step back and support c5-c4. The a6 pawn blocks the a-pawn. Then the
    // pawns walk onto the villages, c5-c4 and later e4-e3 (backed by ...f5-f4), and each one must
    // be taken at once. Don't lure Nd2 or Re1 off their posts: count each village's guards
    // against its attackers after every enemy move, including pawns that can step up. Hold for 9 turns.
    id: 'r1-guard',
    kind: 'siege',
    theme: 'Protection',
    title: 'Lanterns at Mossbridge',
    region: 'The Bog',
    enemy: { name: 'Mudfoot Raiders', personality: 'raider' },
    intro: 'Mudfoot raiders want to stomp through the two villages by the bridge. Hold them off until the lanterns are lit.',
    lesson:
      'A square is safe when you guard it at least as many times as the enemy attacks it. When a guard is attacked, move it to a square where it still guards, or protect it, before doing anything else. A piece that isn’t a guard still matters: whatever takes it may join the attack. Count again after every enemy move.',
    fen: '6k1/6p1/p4p1p/P1p3n1/n3p3/8/1B1N2PP/4R1K1 w - - 0 1',
    objective: { kind: 'survive', turns: 9 },
    villages: ['c4', 'e3'],
    reward: 20,
    bonuses: [
      { kind: 'flawless', gold: 5 },
      { kind: 'noRewind', gold: 5 },
    ],
    tip: 'Count who guards each village, and who’s coming for it.',
    before: [
      { who: 'narrator', text: 'Two little villages, one wobbly bridge, and a lot of muddy feet.' },
      { who: 'enemy', text: 'Stomp the huts! Stomp the huts!' },
      { who: 'companion', text: 'If a raider steps onto a village, we have to capture him straight away. So every village needs a guard.' },
    ],
    after: [
      { who: 'narrator', text: 'The lanterns glow, and the raiders squelch back into the bog.' },
      { who: 'companion', text: 'Guards first, heroics second. Well held!' },
    ],
    shouts: true,
  },
  {
    // The d5 knight is pinned to the king by the b3 bishop. It is attacked twice (bishop and
    // knight) and defended twice (the c6 pawn, and the b7 bishop behind it), so Bxd5 or Nxd5 only loses
    // material. The shout is usually the king stepping out of the pin (Kf8), which frees the
    // knight. Strike first with a third attacker, the cheapest one: e4 wins the knight for a
    // pawn at most. Then count again. After exd5 cxd5, d5 has two attackers and one defender,
    // and the a6 pawn leaves b6 loose. The goal is 4, more than any single Black piece.
    // White has no rook here, so no grab can give a rook for a knight.
    id: 'r1-trades',
    kind: 'skirmish',
    theme: 'Safe trades',
    title: 'The Swap Meet',
    region: 'The Bog',
    enemy: { name: 'Goblin Hagglers', personality: 'standard' },
    intro: 'The goblin hagglers set out their wares: a stall of pawns, a bishop, and a knight right in the middle. Some of the bargains are real.',
    lesson:
      'Before you capture, count: how many of your pieces hit the square, how many of theirs defend it, and what each one is worth. Two against two is not a bargain. Add another attacker, the cheapest you have, and then the capture is safe. Count again after every trade.',
    fen: '6k1/1b4pp/ppp2p2/3n4/8/1BN1P3/PP3PPP/6K1 w - - 0 1',
    objective: { kind: 'winMaterial', gain: 4, maxMoves: 10 },
    reward: 20,
    bonuses: [
      { kind: 'quick', moves: 6, gold: 5 },
      { kind: 'noRewind', gold: 5 },
    ],
    tip: 'Count attackers and defenders, and if you’re short, bring the cheapest extra attacker.',
    before: [
      { who: 'enemy', text: 'Bargains! Lovely bargains! Take one, go on!' },
      { who: 'companion', text: 'Two of ours hit their stuck knight, but two of theirs guard it: the pawn, and the bishop behind it. Let’s bring one more.' },
    ],
    after: [
      { who: 'enemy', text: 'No fair! You counted!' },
      { who: 'companion', text: 'Free is good, even is fine, and giving more than you get is never a bargain.' },
    ],
    shouts: true,
  },
  {
    // One guard watches the back rank: the d7 rook. Re8+ forces Rd8, and now that rook is
    // pinned to its king. Bh3+ checks down the other diagonal; the goblins can only block
    // (Bg4, f5) or step to b8, and each blocker falls to the bishop with check. Then Rxd8 is
    // mate. Their shout varies (a rook move, Bg4 to save the loose d1 bishop, ...f5, sometimes
    // Rxg2+, which only gives a rook for the bishop since the king guards g2). None of it
    // matters if you check first: grabbing the d1 bishop or stopping to defend lets the
    // sentries settle in. Mate in 5 against best defence.
    id: 'r1-backrank',
    kind: 'skirmish',
    theme: 'Basic checkmates',
    title: 'Behind the Mud Wall',
    region: 'The Bog',
    enemy: { name: 'Bogwall Sentries', personality: 'standard' },
    intro: 'The sentries hide their captain behind a neat wall of goblin pawns. Neat, but there’s no back door.',
    lesson:
      'A king boxed in by its own pawns can be checkmated on the back rank. Count the pieces guarding that rank. Check along it so a guard has to block, then keep checking: every blocker they throw in is one more piece you can take. A check must be answered first, so a run of checks leaves them no time for their threat. Give your own king a little air so the same trick can’t catch you.',
    fen: '2k5/pppr2p1/5p2/8/7P/P1PP4/r5B1/3bR1K1 w - - 0 1',
    objective: { kind: 'checkmate', maxMoves: 8 },
    reward: 20,
    bonuses: [
      { kind: 'quick', moves: 5, gold: 5 },
      { kind: 'noRewind', gold: 5 },
    ],
    tip: 'One rook guards the back row. Check first, and keep checking.',
    before: [
      { who: 'enemy', text: 'Nobody gets past the Mud Wall!' },
      { who: 'companion', text: 'The wall keeps us out, but it also keeps their captain in. Only one rook guards the row behind it.' },
      { who: 'narrator', text: 'Only checkmate will end this one.' },
    ],
    after: [
      { who: 'enemy', text: 'The wall… was the problem?' },
      { who: 'companion', text: 'Remember this one. It works on us too, so we always leave our king a window.' },
    ],
    shouts: true,
  },
  {
    // Two pawns side by side (b5, c5) face a goblin wall: a pawn on a7 and a runner knight on
    // c7 blocking the c-pawn. The breakthrough b6 makes a passed pawn: if axb6, cxb6 runs to
    // b8, which the c7 knight can't reach (a knight never guards the squares touching it); if
    // they ignore it, b7 and b8. The shouts that matter are the knight's checks (Nd5-f4+) and
    // the goblin pawns' pushes on g4/h5. No flawless bonus: the breakthrough trades a pawn by design.
    id: 'r1-squire',
    kind: 'promotion',
    theme: 'Pawn promotion',
    title: 'The Pawn’s Plunge',
    region: 'The Bog',
    enemy: { name: 'Puddle Runners', personality: 'standard' },
    intro:
      'Two of your pawns wade side by side toward the far bank. A goblin runner squats in front of one, and a goblin pawn waits ahead of the other.',
    lesson:
      'Two pawns side by side can break through a wall. Push one forward: if it’s taken, the other pawn takes back and has a clear path. Before each push, check which squares ahead the enemy can still reach. A knight can’t guard the squares right next to it.',
    fen: '7k/p1n5/8/1PP4p/6p1/2NB4/5PK1/8 w - - 0 1',
    objective: { kind: 'promote', maxMoves: 10 },
    reward: 25,
    bonuses: [
      { kind: 'quick', moves: 6, gold: 5 },
      { kind: 'noRewind', gold: 5 },
    ],
    tip: 'Push one pawn into the wall. If they take it, the other pawn takes back and runs.',
    before: [
      { who: 'narrator', text: 'Across the bog, a goblin flag marks the far bank.' },
      { who: 'enemy', text: 'This puddle’s ours! No pawns past the runner!' },
      { who: 'companion', text: 'Two pawns side by side are stronger than one. One goes in so the other gets through.' },
    ],
    after: [
      { who: 'narrator', text: 'Dripping but proud, your pawn is promoted on the far bank.' },
      { who: 'companion', text: 'One pawn opened the door and the other walked through. That’s a breakthrough.' },
    ],
    shouts: true,
  },
];
