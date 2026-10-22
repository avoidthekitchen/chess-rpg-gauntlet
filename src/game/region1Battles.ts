import type { BattleDef } from './content';

/**
 * Region 1, the Bog: five lesson battles against the Bog Goblins (threat awareness,
 * protection, safe trades, basic checkmates, and a promotion run revisiting pawn basics).
 *
 * Goblins shout the move they plan next and must play it if it's still legal, so every
 * battle opens with "what does my opponent want?" Each position is built so the shout
 * names the threat (a loose piece, a village, a greedy grab), and the best answer either
 * meets the threat or turns it into a trap: guard the square they promised to grab and
 * they have to walk into your capture.
 *
 * Every position here is checked by `npm run verify:battles` (scripts/verify): strong,
 * shout-aware play wins at least 90% against Squire and Knight goblins, careless play
 * loses most games, and no battle can be won on the first move.
 */
export const REGION1_BATTLES: BattleDef[] = [
  {
    // Shout: b5xc4, the pawn grabs the loose bishop. Best: Bd5!, which dodges and pins the
    // c6 knight to the a8 rook; both are loose, and Bxc6 or Bxa8 follows.
    id: 'r1-reeds',
    kind: 'skirmish',
    theme: 'Threat awareness',
    title: 'Trouble in the Reeds',
    region: 'The Bog',
    enemy: { name: 'Goblin Scouts', personality: 'standard' },
    intro:
      'Goblin scouts are splashing through the reeds, grabbing anything left lying about. Some of their own gear is lying about too.',
    lesson:
      'Before every move, ask two questions: what is attacked, and what is undefended? Save a threatened piece first, and if you can, move it to a square where it attacks something loose. Pieces nobody protects are the easiest ones to win.',
    fen: 'r5k1/5ppp/p1n5/1p6/2B5/5N2/5PPP/4R1K1 w - - 0 1',
    objective: { kind: 'winMaterial', gain: 5, maxMoves: 8 },
    reward: 15,
    bonuses: [
      { kind: 'flawless', gold: 5 },
      { kind: 'noRewind', gold: 5 },
    ],
    tip: 'Listen to what they shout. That’s the piece they want!',
    before: [
      { who: 'narrator', text: 'Mud, reeds, and a lot of very loud goblins.' },
      { who: 'enemy', text: 'Shiny things! Grab the shiny things!' },
      { who: 'companion', text: 'They yell their plans out loud. Let’s keep our pieces safe and catch the ones they forgot to guard.' },
    ],
    after: [
      { who: 'enemy', text: 'Who left our stuff lying about?! Run!' },
      { who: 'companion', text: 'Look first, then move. That’s half of chess right there.' },
    ],
    shouts: true,
  },
  {
    // Villages c3 (guarded by the b2 bishop) and f3 (knight and pawn). Shout: Na4xb2, taking
    // the c3 guard. Keep both villages guarded at least as often as they're attacked, and
    // capture every raider that lands.
    id: 'r1-guard',
    kind: 'siege',
    theme: 'Protection',
    title: 'Lanterns at Mossbridge',
    region: 'The Bog',
    enemy: { name: 'Mudfoot Raiders', personality: 'raider' },
    intro: 'Mudfoot raiders want to stomp through the two villages by the bridge. Hold them off until the lanterns are lit.',
    lesson:
      'A square is safe when you guard it at least as many times as the enemy attacks it. When a guard is attacked, move it to a square where it still guards, or protect it, before doing anything else. Count again after every enemy move.',
    fen: '6k1/5pp1/7p/2p3n1/n3p3/8/1B1N2PP/3R2K1 w - - 0 1',
    objective: { kind: 'survive', turns: 7 },
    villages: ['c3', 'f3'],
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
    // Shout: Rc8xc3, the rook grabs the loose knight. Rxe5 is the trap for grabbers (the
    // knight is defended and the back rank is open). Best: keep c3 guarded while moving, e.g.
    // Nxd5 (they can't recapture, they're committed to Rc3), then Nxc3 wins the rook.
    id: 'r1-trades',
    kind: 'skirmish',
    theme: 'Safe trades',
    title: 'The Swap Meet',
    region: 'The Bog',
    enemy: { name: 'Goblin Hagglers', personality: 'standard' },
    intro: 'The goblin hagglers set out their wares: pawns everywhere, a knight in the middle, and a rook that wants your knight.',
    lesson:
      'Before you capture, count: how many of your pieces hit the square, how many of theirs defend it, and what each one is worth. A capture is safe when nothing can take back, or when you get at least as much as you give. A rook for a knight is a bad deal, whichever side makes it.',
    fen: '2r3k1/p4pp1/3pp2p/3pn3/8/1BN5/P4PPP/4R1K1 w - - 0 1',
    objective: { kind: 'winMaterial', gain: 6, maxMoves: 8 },
    reward: 20,
    bonuses: [
      { kind: 'quick', moves: 5, gold: 5 },
      { kind: 'noRewind', gold: 5 },
    ],
    tip: 'Count attackers and defenders before every capture.',
    before: [
      { who: 'enemy', text: 'Bargains! Lovely bargains! Take one, go on!' },
      { who: 'companion', text: 'Some of these are bait. Before we grab anything, let’s count who can take back.' },
    ],
    after: [
      { who: 'enemy', text: 'No fair! You counted!' },
      { who: 'companion', text: 'Free is good, even is fine, and giving more than you get is never a bargain.' },
    ],
    shouts: true,
  },
  {
    // Shout: Rd8xd2, the only back-rank guard grabs the loose rook. Best: Re2 or Re1, so the
    // grab still stands and Re8 is mate. The a3 bishop shuts the f8 escape square, so a
    // goblin who steps his king aside still gets caught.
    id: 'r1-backrank',
    kind: 'skirmish',
    theme: 'Basic checkmates',
    title: 'Behind the Mud Wall',
    region: 'The Bog',
    enemy: { name: 'Bogwall Sentries', personality: 'standard' },
    intro: 'The sentries hide their captain behind a neat wall of goblin pawns. Neat, but there’s no back door.',
    lesson:
      'A king boxed in by its own pawns can be checkmated on the back rank by a single rook. Find the piece guarding that rank and lure it away, then check along the rank. Give your own king a little air so the same trick can’t catch you.',
    fen: '3r2k1/5ppp/p1n5/1p6/8/B1N5/3R1PPP/R5K1 w - - 0 1',
    objective: { kind: 'checkmate', maxMoves: 6 },
    reward: 20,
    bonuses: [
      { kind: 'quick', moves: 4, gold: 5 },
      { kind: 'noRewind', gold: 5 },
    ],
    tip: 'Their captain can’t step through his own pawns.',
    before: [
      { who: 'enemy', text: 'Nobody gets past the Mud Wall!' },
      { who: 'companion', text: 'The wall keeps us out, but it also keeps their captain in. Who’s guarding the row behind it?' },
      { who: 'narrator', text: 'Only checkmate will end this one.' },
    ],
    after: [
      { who: 'enemy', text: 'The wall… was the problem?' },
      { who: 'companion', text: 'Remember this one. It works on us too, so we always leave our king a window.' },
    ],
    shouts: true,
  },
  {
    // The c-pawn's path is blocked by the c6 knight (guarded by b7), and goblin pawns wait
    // on the kingside. Drive or dodge the blocker, keep c7 and c8 covered, and only promote
    // where the new piece is safe.
    id: 'r1-squire',
    kind: 'promotion',
    theme: 'Pawn promotion',
    title: 'The Squire’s Splash',
    region: 'The Bog',
    enemy: { name: 'Puddle Runners', personality: 'standard' },
    intro:
      'Your squire has to cross the bog to be knighted, but a goblin runner is squatting right in the path, and his friends are splashing toward your side.',
    lesson:
      'A pawn promotes safely when the squares ahead of it are clear and the promotion square is guarded or out of the enemy’s reach. If a piece blocks the path, chase it, trade it off or step around it. Every square your pieces cover is one the blocker can’t use.',
    fen: '6k1/1p6/2n5/2P4p/6p1/2NB4/5PK1/8 w - - 0 1',
    objective: { kind: 'promote', maxMoves: 9 },
    reward: 25,
    bonuses: [
      { kind: 'flawless', gold: 5 },
      { kind: 'quick', moves: 6, gold: 5 },
    ],
    tip: 'Clear the path first, then push. Make sure each step is safe.',
    before: [
      { who: 'narrator', text: 'Across the bog, a goblin flag marks the far bank.' },
      { who: 'enemy', text: 'This puddle’s mine! No squires allowed!' },
      { who: 'companion', text: 'Our squire just needs a clear, safe path. Let’s make him one.' },
    ],
    after: [
      { who: 'narrator', text: 'Dripping but proud, your squire is knighted on the far bank.' },
      { who: 'companion', text: 'Every squire dreams of this. Guard the path and the dream comes true.' },
    ],
    shouts: true,
  },
];
