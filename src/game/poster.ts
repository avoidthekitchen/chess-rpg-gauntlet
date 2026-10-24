import { Chess, type Square } from 'chess.js';
import { PIECE_VALUE } from './material';

/** Target of one legal move. Capture first, then newly attacked non-kings; a1..h8 breaks value ties. */
export function posterTarget(fen: string, uci: string): Square | null {
  const before = new Chess(fen);
  const mover = before.turn();
  const after = new Chess(fen);
  let move;
  try { move = after.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] }); } catch { return null; }
  if (move.captured) return (move.flags.includes('e') ? move.to[0] + move.from[1] : move.to) as Square;
  const order = (sq: Square) => Number(sq[1]) * 8 + sq.charCodeAt(0) - 97;
  const candidates = after.board().flat().filter(p => p && p.color !== mover && p.type !== 'k' && after.isAttacked(p.square, mover) && !before.isAttacked(p.square, mover));
  candidates.sort((a, b) => PIECE_VALUE[b!.type] - PIECE_VALUE[a!.type] || order(a!.square) - order(b!.square));
  return candidates[0]?.square ?? null;
}
