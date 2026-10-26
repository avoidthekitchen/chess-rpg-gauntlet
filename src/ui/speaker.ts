import type { Color, Move, PieceSymbol } from 'chess.js';
import { COURSE_CAST, COURSE_VOICES } from '../game/courseCast';
import type { TacticTag } from '../game/tactics';

/**
 * Talking heads: when a piece moves or captures, its detailed figurine appears
 * beside the board with a short line. The board itself shows simplified tokens.
 * This file picks who speaks and what they say; src/ui/portrait.ts draws the card.
 */

export type Side = 'ally' | 'foe';
/** Enemy factions, each with its own sprite set: Bog Goblins (`bog`), Region 1. Each region adds its own. */
export const FACTIONS = ['bog', 'bandit', 'warden', 'cult', 'legion'] as const;
export type Faction = (typeof FACTIONS)[number];
export const CHARACTER_PORTRAITS = ['tadwell', 'lich-king'] as const;
export type PortraitCharacter = (typeof CHARACTER_PORTRAITS)[number];

export const SPECIES: Record<PieceSymbol, string> = {
  p: 'Mouse Pawn',
  n: 'Frog Knight',
  b: 'Owl Bishop',
  r: 'Tortoise Rook',
  q: 'Fox Queen',
  k: 'Lion King',
};

/** Each enemy faction has its own species; only the chess headgear is shared with ours. Names live in COURSE_CAST. */
const FACTION_REGION: Record<Faction, string> = { bog: 'r1', bandit: 'r2', cult: 'r3', legion: 'r4', warden: 'r5' };
export const FACTION_SPECIES = Object.fromEntries(FACTIONS.map(f => [f, COURSE_CAST[FACTION_REGION[f]].species])) as Record<Faction, Record<PieceSymbol, string>>;

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

/** Upright bandit/snail towers need top alignment; squat tortoise and armadillo rooks keep their centred crop. */
export const portraitFraming = (type: PieceSymbol, faction: 'ally' | Faction) =>
  (faction === 'bandit' || faction === 'cult') && type === 'r' ? { ...FRAMING.r!, y: 0 } : FRAMING[type];

/**
 * Texture keys: the detailed figurine, and the token used when a figurine is missing,
 * in the speaker's chess color (`allyColor` is yours: White in battles, either in puzzles).
 */
export const portraitKey = (type: PieceSymbol, side: Side, faction: Faction, character?: PortraitCharacter) => character ?? `${PIECE_NAMES[type]}-${side === 'ally' ? 'ally' : faction}`;
export const tokenPortraitKey = (type: PieceSymbol, side: Side, faction: Faction, allyColor: Color = 'w') => {
  const enemyColor: Color = allyColor === 'w' ? 'b' : 'w';
  return `token-${PIECE_NAMES[type]}-${side === 'ally' ? `ally-${allyColor}` : `${faction}-${enemyColor}`}`;
};

type Event = 'checkmate' | 'promotion' | 'fork' | 'check' | 'capture' | 'move';
type Lines = Record<Exclude<Event, 'move'>, string[]> & { move: Record<PieceSymbol, string[]> };

const ALLY: Lines = {
  checkmate: ['It’s over. The day is ours!'],
  promotion: ['Promoted at last!', 'Rise, champion!'],
  fork: ['Two targets, one move!', 'Pick one. I’ll take the other.'],
  check: ['Your king is in my sights.', 'Check! Nowhere to hide.'],
  capture: ['Out of my way!', 'One less goblin.', 'Got you!'],
  move: {
    p: ['One step closer!', 'For the crown!'],
    n: ['Hop to it!', 'Over the wall I go!'],
    b: ['The long diagonal is mine.', 'I see far from here.'],
    r: ['Slow and steady holds the line.', 'Make way for the rook.'],
    q: ['Anywhere I please.', 'Watch closely.'],
    k: ['Stay close, friends.', 'Steady now.'],
  },
};

const factionLines = (region: string): Lines => ({
  checkmate: ['The board is settled.'], promotion: ['A new piece.'], fork: ['Two threats.'],
  check: ['Mind the check.'], capture: ['One piece fewer.'],
  move: Object.fromEntries(Object.entries(COURSE_VOICES[region]).map(([piece, line]) => [piece, [line]])) as Lines['move'],
});
const ENEMY: Record<Faction, Lines> = {
  warden: factionLines(FACTION_REGION.warden), cult: factionLines(FACTION_REGION.cult), legion: factionLines(FACTION_REGION.legion),
  bandit: {
    ...factionLines(FACTION_REGION.bandit),
    checkmate: ['The account is settled.'], promotion: ['A change of trade.'],
    fork: ['Two tolls today.'], check: ['Mind your crown.'], capture: ['A fair toll.'],
  },
  bog: {
    checkmate: ['The bog swallows your crown!'],
    promotion: ['Bigger! Muddier! Better!'],
    fork: ['Two snacks at once!'],
    check: ['Boo! Gotcha, kingy!', 'Check! Hee hee!'],
    capture: ['Mine! Shiny!', 'Into the stew pot!', 'Should’ve guarded it, hee!'],
    move: {
      p: ['Squelch, squelch!', 'Charge through the muck!'],
      n: ['Splash! Over you go!', 'Sploosh! Gills first!'],
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
  /** Art identity travels with dialogue through speech, banners and history. */
  faction?: Faction;
  character?: PortraitCharacter;
  name: string;
  line: string;
  type: PieceSymbol;
  /** Voice role for a recorded line (src/audio/voiceRoles.ts); unvoiced when absent. */
  voice?: string;
}

export interface SpeakerOpts {
  faction: Faction;
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
  else name = FACTION_SPECIES[o.faction][type];
  return { side, name, line, type };
}
