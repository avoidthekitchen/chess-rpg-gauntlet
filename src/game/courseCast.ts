import type { PieceSymbol } from 'chess.js';

interface CourseCast {
  faction: string;
  /** Species names are displayed only when their matching artwork is shipped. Names follow docs/design/glossary.md#factions (#60). */
  speciesArt: 'bog' | 'bandit' | 'warden' | 'cult' | 'legion' | null;
  species: Record<PieceSymbol, string>;
  lessonOpening: string;
  reviewOpening: string;
  endingTitle: string;
}
export const COURSE_CAST: Record<string, CourseCast> = {
  r1: { speciesArt: 'bog', faction: 'Bog Goblins', species: { p: 'Bog Rat Pawn', n: 'Bog Salamander Knight', b: 'Bog Crow Bishop', r: 'Snapping Turtle Rook', q: 'Swamp Viper Queen', k: 'Toad King' }, lessonOpening: 'Your turn, traveller.', reviewOpening: 'Four boards. Let us begin.', endingTitle: 'The Bog is free.' },
  r2: { speciesArt: 'bandit', faction: 'Bandit Riders', species: { p: 'Raccoon Pawn', n: 'Hare Knight', b: 'Magpie Bishop', r: 'Badger Rook', q: 'Stoat Queen', k: 'Wolf King' }, lessonOpening: 'Your turn, traveller.', reviewOpening: 'Four boards. Let us settle the account.', endingTitle: 'The Kingsroad is free.' },
  r3: { speciesArt: 'cult', faction: 'Shadow Cult', species: { p: 'Moth Pawn', n: 'Bat Knight', b: 'Spider Bishop', r: 'Snail Rook', q: 'Cat Queen', k: 'Goat King' }, lessonOpening: 'Stay where you are. Nothing need be lost.', reviewOpening: 'Leave the ledger closed. Keep your crown.', endingTitle: 'The villages are free.' },
  r4: { speciesArt: 'legion', faction: 'Iron Legion', species: { p: 'Hedgehog Pawn', n: 'Boar Knight', b: 'Heron Bishop', r: 'Armadillo Rook', q: 'Eagle Queen', k: 'Legion Lion King' }, lessonOpening: 'Hold your post. Keep your eyes open.', reviewOpening: 'Six boards. Let us see who should carry these banners.', endingTitle: 'The banners come home.' },
  r5: { speciesArt: 'warden', faction: 'Bone Wardens', species: { p: 'Skeleton Mouse Pawn', n: 'Skeleton Frog Knight', b: 'Skeleton Owl Bishop', r: 'Skeleton Tortoise Rook', q: 'Skeleton Fox Queen', k: 'Skeleton Lion King' }, lessonOpening: 'The gate is still guarded.', reviewOpening: 'Six boards stand before the gate. Take your place.', endingTitle: 'The gate is open.' },
  finale: { speciesArt: 'warden', faction: 'The Lich King’s army', species: { p: 'Skeleton Mouse Pawn', n: 'Skeleton Frog Knight', b: 'Skeleton Owl Bishop', r: 'Skeleton Tortoise Rook', q: 'Skeleton Fox Queen', k: 'Skeleton Lion King' }, lessonOpening: 'Four boards. We have time.', reviewOpening: 'Four boards. We have time.', endingTitle: 'Pawnshire is free.' },
};
// Unknown chapters, or chapters without dedicated tokens and portraits, use Bog art with honest faction labels.
export const courseFoeArt = (id: string) => COURSE_CAST[id]?.speciesArt ?? 'bog';
const chessNames: Record<PieceSymbol, string> = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King' };
export function courseFoeName(id: string, piece: PieceSymbol): string {
  const cast = COURSE_CAST[id];
  return cast?.speciesArt ? cast.species[piece] : `${courseCast(id).faction} · ${chessNames[piece]}`;
}

export const courseCast = (id: string): CourseCast => COURSE_CAST[id] ?? COURSE_CAST.r2;

export const COURSE_VOICES: Record<string, Record<string, string>> = {
      r1: { p: 'Squelch, squelch!', n: 'Sploosh! Gills first!', b: 'Peering through the reeds…', r: 'Mud shell coming through!', q: 'Out of the mist I come!', k: 'Guards! Guards!' },
      r2: { p: 'A little farther down the road.', n: 'Over the wall I go!', b: 'A long road from here.', r: 'Make way. Heavy luggage.', q: 'The toll keeper is watching.', k: 'My chair stays right here.' },
      finale: { p: 'The table is set.', n: 'You have come far.', b: 'There is still time to consider.', r: 'These halls have waited.', q: 'The crown remembers.', k: 'I am listening.' },
      r5: { p: 'The watch continues.', n: 'A quiet step among the stones.', b: 'The moon lights the old stones.', r: 'The gate has stood for years.', q: 'The keep is waiting.', k: 'Our watch is not yet ended.' },
      r4: { p: 'Orders received.', n: 'Forward, in good order.', b: 'Watching the far flank.', r: 'The old walls still stand.', q: 'Keep the banners raised.', k: 'Discipline will carry the day.' },
      r3: { p: 'Stay close. Nothing need be lost.', n: 'A quiet step through the shadows.', b: 'The crystal remembers.', r: 'These walls hold our promises.', q: 'Every promise has its price.', k: 'Leave the ledger closed.' },
    };

export const COURSE_OPENINGS: Record<string, string> = {
  'r4-develop': 'The first rank is no place to linger.',
  'r4-file': 'The gate captain is watching the road.',
  'r4-exposed': 'The armourer has mislaid a shield.',
  'r4-deflect': 'Every guard has a post. I counted them.',
  'r4-between': 'The quartermaster expects everything returned.',
  'r4-defend': 'Hold the line. Bring our soldiers home.',

  'r1-loose-pieces': 'All these shiny things belong to the ferry now!',
  'r1-safe-captures': 'A bargain! One shiny for all your shinies!',
  'r1-answer-check': 'The marsh lookout sees everything. Almost everything.',
  'r1-back-rank': 'Every door bolted. Very safe. Very snug.',
  'r1-promotion': 'Little travellers? Hardly worth watching!',
  'r1-bog-review': 'Grubnak has four boards. And a very large chair!',
  'r2-knight-forks': 'Two guards, one crossing. The toll is double.',
  'r2-double-attacks': 'Two strongboxes. An excellent day for business.',
  'r2-two-at-once': 'Two tolls today. The banner says so.',
  'r2-remove-defender': 'You can speak to the guard behind the guard.',
  'r2-mate-in-two': 'I have already counted your next move.',
  'r2-road-review': 'Four boards. Let us settle the account.',
};
