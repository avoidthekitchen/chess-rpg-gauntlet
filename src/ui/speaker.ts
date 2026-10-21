import type { Move, PieceSymbol } from 'chess.js';
import type { TacticTag } from '../game/tactics';

/**
 * Talking heads: when a piece moves or captures, its detailed figurine appears
 * beside the board with a short line. The board itself shows simplified tokens.
 */

type Side = 'ally' | 'foe';

const NAMES: Record<PieceSymbol, string> = {
  p: 'Mouse Squire',
  n: 'Frog Knight',
  b: 'Owl Mage',
  r: 'Tortoise Tower',
  q: 'Fox Queen',
  k: 'Lion King',
};

/**
 * Pieces with a detailed figurine, and how to frame its head and headgear in the tall portrait. The rest use
 * their board token, which is already a head-and-headgear bust.
 */
const PORTRAITS: Partial<Record<PieceSymbol, { name: string; size: string; pos: string }>> = {
  n: { name: 'knight', size: '135%', pos: '46% 8%' },
  r: { name: 'rook', size: '105%', pos: '30% 50%' },
  b: { name: 'bishop', size: '128%', pos: '52% 3%' },
  k: { name: 'king', size: '130%', pos: '52% 3%' },
};

type Event = 'checkmate' | 'promotion' | 'fork' | 'check' | 'capture' | 'move';

const LINES: Record<Side, Record<Exclude<Event, 'move'>, string[]> & { move: Record<PieceSymbol, string[]> }> = {
  ally: {
    checkmate: ['It’s over. The day is ours!'],
    promotion: ['Knighted at last!', 'Rise, champion!'],
    fork: ['Two targets, one move!', 'Pick one. I’ll take the other.'],
    check: ['Your king is in my sights.', 'Check! Nowhere to hide.'],
    capture: ['Out of my way!', 'One less bandit.', 'Got you!'],
    move: {
      p: ['One step closer!', 'For the crown!'],
      n: ['Hop to it!', 'Over the wall I go!'],
      b: ['The long diagonal is mine.', 'I see far from here.'],
      r: ['Slow and steady holds the line.', 'Make way for the tower.'],
      q: ['Anywhere I please.', 'Watch closely.'],
      k: ['Stay close, friends.', 'Steady now.'],
    },
  },
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
};

const ORDER: Event[] = ['checkmate', 'promotion', 'fork', 'check', 'capture'];
const pick = (xs: string[]) => xs[Math.floor(Math.random() * xs.length)];
const sprite = (name: string) => `${import.meta.env.BASE_URL}sprites/${name}.webp`;

export function speakerLine(move: Move, tactics: TacticTag[]): { side: Side; name: string; line: string; type: PieceSymbol } {
  const side: Side = move.color === 'w' ? 'ally' : 'foe';
  // A promoted pawn speaks as what it became.
  const type = move.promotion ?? move.piece;
  const event = ORDER.find((e) => (e === 'capture' ? Boolean(move.captured) : tactics.includes(e as TacticTag))) ?? 'move';
  const line = event === 'move' ? pick(LINES[side].move[move.piece]) : pick(LINES[side][event]);
  return { side, name: `${side === 'foe' ? 'Bandit ' : ''}${NAMES[type]}`, line, type };
}

/** Fills the speaker card for this move and shows it. */
export function showSpeaker(el: HTMLElement, move: Move, tactics: TacticTag[]) {
  const { side, name, line, type } = speakerLine(move, tactics);
  const p = PORTRAITS[type];
  const style = p
    ? `background-image:url('${sprite(`${p.name}-${side}`)}');background-size:${p.size};background-position:${p.pos}`
    : `background-image:url('${sprite(`token-${pieceName(type)}-${side}`)}');background-size:contain;background-position:50% 60%`;
  el.className = `speaker ${side}`;
  el.innerHTML = `
    <div class="portrait" style="${style}" role="img" aria-label="${name}"></div>
    <div class="words">
      <p class="who">${name}</p>
      <p class="line">${line}</p>
    </div>`;
  el.hidden = false;
  // Restart the entrance animation.
  el.classList.remove('enter');
  void el.offsetWidth;
  el.classList.add('enter');
}

const PIECE_NAMES: Record<PieceSymbol, string> = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
export const pieceName = (t: PieceSymbol) => PIECE_NAMES[t];

/** Warms the browser cache so the first portrait appears instantly. */
export function preloadPortraits() {
  for (const p of Object.values(PORTRAITS)) for (const side of ['ally', 'foe']) new Image().src = sprite(`${p!.name}-${side}`);
}
