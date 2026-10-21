import { SQUARES, type Chess, type Color, type Square } from 'chess.js';
import { PIECE_VALUE, other, pieces } from './material';

/**
 * Threat Sight: what the enemy currently attacks. This is the chess version of
 * Into the Breach's telegraphed attacks.
 */
export interface ThreatMap {
  /** Empty squares, or squares holding `defender` pieces, that the enemy attacks. */
  attacked: Set<Square>;
  /** `defender` pieces that can be won: attacked and undefended, or attacked by something cheaper. */
  hanging: Set<Square>;
}

export function threatMap(chess: Chess, defender: Color): ThreatMap {
  const enemy = other(defender);
  const attacked = new Set<Square>();
  for (const sq of SQUARES) {
    const occupant = chess.get(sq);
    if (occupant && occupant.color === enemy) continue;
    if (chess.isAttacked(sq, enemy)) attacked.add(sq);
  }
  return { attacked, hanging: hangingPieces(chess, defender) };
}

export function hangingPieces(chess: Chess, color: Color): Set<Square> {
  const enemy = other(color);
  const out = new Set<Square>();
  for (const p of pieces(chess, color)) {
    if (p.type === 'k') continue;
    const attackers = chess.attackers(p.square, enemy);
    if (attackers.length === 0) continue;
    const defenders = chess.attackers(p.square, color);
    const cheapest = Math.min(...attackers.map((s) => PIECE_VALUE[chess.get(s)!.type] || 100));
    if (defenders.length === 0 || cheapest < PIECE_VALUE[p.type]) out.add(p.square);
  }
  return out;
}
