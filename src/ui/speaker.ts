import type { Move, PieceSymbol } from 'chess.js';
import type { TacticTag } from '../game/tactics';

/**
 * Talking heads: when a piece moves or captures, its detailed figurine appears
 * beside the board with a short line. The board itself shows simplified tokens.
 * This file picks who speaks and what they say; src/ui/portrait.ts draws the card.
 */

export type Side = 'ally' | 'foe';
/** Enemy sprite sets: Bandit Riders (`foe`) and Bog Goblins (`bog`). */
export type FactionArt = 'foe' | 'bog';

export const SPECIES: Record<PieceSymbol, string> = {
  p: 'Mouse Squire',
  n: 'Frog Knight',
  b: 'Owl Mage',
  r: 'Tortoise Tower',
  q: 'Fox Sorceress',
  k: 'Lion King',
};

const FACTION_PREFIX: Record<FactionArt, string> = { foe: 'Bandit', bog: 'Bog' };

const PIECE_NAMES: Record<PieceSymbol, string> = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
export const pieceName = (t: PieceSymbol) => PIECE_NAMES[t];

/**
 * How to frame each figurine's head and headgear in the tall portrait, as CSS-style
 * background size (relative to the card width) and position percentages.
 */
export const FRAMING: Partial<Record<PieceSymbol, { size: number; x: number; y: number }>> = {
  n: { size: 1.35, x: 0.46, y: 0.08 },
  r: { size: 1.05, x: 0.3, y: 0.5 },
  b: { size: 1.28, x: 0.52, y: 0.03 },
  k: { size: 1.3, x: 0.52, y: 0.03 },
  q: { size: 1.3, x: 0.5, y: 0.04 },
  p: { size: 1.25, x: 0.5, y: 0.06 },
};

/** Texture keys: the detailed figurine, and the token used when a figurine is missing. */
export const portraitKey = (type: PieceSymbol, side: Side, faction: FactionArt) => `${PIECE_NAMES[type]}-${side === 'ally' ? 'ally' : faction}`;
export const tokenPortraitKey = (type: PieceSymbol, side: Side, faction: FactionArt) =>
  `token-${PIECE_NAMES[type]}-${side === 'ally' ? 'ally' : faction}`;

type Event = 'checkmate' | 'promotion' | 'fork' | 'check' | 'capture' | 'move';
type Lines = Record<Exclude<Event, 'move'>, string[]> & { move: Record<PieceSymbol, string[]> };

const ALLY: Lines = {
  checkmate: ['It’s over. The day is ours!'],
  promotion: ['Knighted at last!', 'Rise, champion!'],
  fork: ['Two targets, one move!', 'Pick one. I’ll take the other.'],
  check: ['Your king is in my sights.', 'Check! Nowhere to hide.'],
  capture: ['Out of my way!', 'One less goblin.', 'Got you!'],
  move: {
    p: ['One step closer!', 'For the crown!'],
    n: ['Hop to it!', 'Over the wall I go!'],
    b: ['The long diagonal is mine.', 'I see far from here.'],
    r: ['Slow and steady holds the line.', 'Make way for the tower.'],
    q: ['Anywhere I please.', 'Watch closely.'],
    k: ['Stay close, friends.', 'Steady now.'],
  },
};

const ENEMY: Record<FactionArt, Lines> = {
  foe: {
    checkmate: ['Your crown is mine!'],
    promotion: ['A new champion for the bandits!'],
    fork: ['Two for the price of one!'],
    check: ['Run, little king!', 'Check! Where will you hide?'],
    capture: ['Hah! Mine now.', 'Should have guarded that one.', 'Easy pickings.'],
    move: {
      p: ['Charge!', 'Shove forward!'],
      n: ['Sneaking around…', 'Didn’t see me coming?'],
      b: ['Watching your every move.'],
      r: ['Here we come.', 'Nothing stops the tower.'],
      q: ['You can’t stop me.'],
      k: ['Hmph.', 'Guards, to me!'],
    },
  },
  bog: {
    checkmate: ['The bog swallows your crown!'],
    promotion: ['Bigger! Muddier! Better!'],
    fork: ['Two snacks at once!'],
    check: ['Boo! Gotcha, kingy!', 'Check! Hee hee!'],
    capture: ['Mine! Shiny!', 'Into the stew pot!', 'Should’ve guarded it, hee!'],
    move: {
      p: ['Squelch, squelch!', 'Charge through the muck!'],
      n: ['Splash! Over you go!', 'Ribbit-rabbit!'],
      b: ['Peering through the reeds…'],
      r: ['Stomp! Stomp!', 'Mud shell coming through!'],
      q: ['Out of the mist I come!'],
      k: ['Guards! Guards!', 'Hmph. Stay back.'],
    },
  },
};

const ORDER: Event[] = ['checkmate', 'promotion', 'fork', 'check', 'capture'];
const pick = (xs: string[]) => xs[Math.floor(Math.random() * xs.length)];

export interface SpeakerInfo {
  side: Side;
  name: string;
  line: string;
  type: PieceSymbol;
}

export interface SpeakerOpts {
  faction: FactionArt;
  /** The named character standing on the moving piece, if any (hired pieces and heroes). */
  characterName?: string;
  /** The enemy commander's name, used when the enemy king speaks. */
  commander?: string;
}

/** Who speaks for this move, and their line. */
export function speakerLine(move: Move, tactics: TacticTag[], o: SpeakerOpts): SpeakerInfo {
  const side: Side = move.color === 'w' ? 'ally' : 'foe';
  // A promoted pawn speaks as what it became.
  const type = move.promotion ?? move.piece;
  const event = ORDER.find((e) => (e === 'capture' ? Boolean(move.captured) : tactics.includes(e as TacticTag))) ?? 'move';
  const lines = side === 'ally' ? ALLY : ENEMY[o.faction];
  const line = event === 'move' ? pick(lines.move[move.piece]) : pick(lines[event]);
  let name: string;
  if (side === 'ally') name = o.characterName ? `${o.characterName} · ${SPECIES[type]}` : SPECIES[type];
  else if (type === 'k' && o.commander) name = o.commander;
  else name = `${FACTION_PREFIX[o.faction]} ${SPECIES[type]}`;
  return { side, name, line, type };
}
