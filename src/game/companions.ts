/** Companion identities shared by the journey and its teaching presentation. */
export type StarterType = 'n' | 'b' | 'r';

export const STARTERS: Record<StarterType, { name: string; species: string; blurb: string }> = {
  n: { name: 'Sir Hob', species: 'Frog Knight', blurb: 'Hops over anything in the way. Loves a good fork.' },
  b: { name: 'Sage Ollie', species: 'Owl Bishop', blurb: 'Sees down the long diagonals. Pins, skewers, patience.' },
  r: { name: 'Old Brick', species: 'Tortoise Rook', blurb: 'Slow, sturdy, unstoppable on an open file.' },
};
