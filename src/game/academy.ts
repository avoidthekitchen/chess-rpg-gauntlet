import type { Scenario } from './scenarios';

/**
 * The academy's Region 1 lesson: rook and queen checkmates (Lichess Practice,
 * "Piece Checkmates I"). Practice battles: unlimited undo and no gold at stake,
 * against a lone king that defends as well as Stockfish can.
 */

export interface Exercise extends Scenario {
  /** Gold for the first completion. */
  reward: number;
  steps: string[];
}

export const ACADEMY_LESSON = {
  id: 'r1-piece-mates',
  title: 'Rook and queen checkmates',
  teacher: 'Sage Ollie',
  blurb: 'A lone king can always be mated by a king and a queen, or a king and a rook. Learn the method once and it works every time.',
};

export const EXERCISES: Exercise[] = [
  {
    id: 'academy-queen',
    title: 'The Queen’s Net',
    region: 'Academy',
    enemy: { name: 'Training Dummy King', personality: 'standard' },
    intro: 'Your queen and your king against a lone king. Shrink his box until he has nowhere to go.',
    lesson:
      'Use the queen to cut the king off, a knight’s move away from him, then follow him as he steps back. When he’s on the edge, bring your own king up to guard the mating square. Watch out for stalemate: always leave him a move until the last one.',
    steps: [
      'Put the queen a knight’s move away from the enemy king: this boxes him in without checking.',
      'Each time he steps back, step the queen with him to keep the box small.',
      'Once he’s stuck on the edge, walk your king over. Don’t take away his last square without checking!',
      'Mate on the edge with the queen, protected by your king.',
    ],
    fen: '8/8/8/3k4/8/8/8/Q3K3 w - - 0 1',
    objective: { kind: 'checkmate' },
    reward: 10,
  },
  {
    id: 'academy-rook',
    title: 'The Rook’s Box',
    region: 'Academy',
    enemy: { name: 'Training Dummy King', personality: 'standard' },
    intro: 'Just your rook and your king this time. Slower, but the same idea.',
    lesson:
      'The rook draws a wall the king can’t cross. Bring your king up to face his king, with one square between them (the opposition), then check along the edge. If he stays out of opposition, make a waiting move with the rook.',
    steps: [
      'Use the rook to cut the king off along a rank or file.',
      'March your king toward his. The rook keeps the wall.',
      'When the kings face each other with one square between, check with the rook to push him back a line.',
      'Repeat until he’s on the edge, then the same check is mate.',
    ],
    fen: '8/8/8/3k4/8/8/8/R3K3 w - - 0 1',
    objective: { kind: 'checkmate' },
    reward: 10,
  },
];
