import { Chess } from 'chess.js';
import type { Character } from './campaign';
import { armyPoints, type HireType } from './economy';

/**
 * Boss duels: you pick your army from the pieces you own, up to a points budget that
 * grows by region (about 10 in region 1, the full 39 only against the Lich King).
 * A boss can also cap piece types when its lesson needs it, e.g. no queen in region 1.
 */

export interface Budget {
  points: number;
  /** Most of each type allowed; missing means no limit beyond what you own. */
  caps: Partial<Record<HireType, number>>;
}

export type ArmyCheck = { ok: true; points: number } | { ok: false; points: number; reason: string };

export function checkArmy(picks: HireType[], budget: Budget): ArmyCheck {
  const points = armyPoints(picks);
  for (const [t, cap] of Object.entries(budget.caps) as [HireType, number][]) {
    const n = picks.filter((p) => p === t).length;
    if (n > cap) return { ok: false, points, reason: cap === 0 ? `No ${NAMES[t]} allowed in this duel.` : `At most ${cap} ${NAMES[t]}.` };
  }
  if (points > budget.points) return { ok: false, points, reason: `${points} points is over the ${budget.points}-point budget.` };
  if (picks.length === 0) return { ok: false, points, reason: 'Bring at least one piece besides your king.' };
  return { ok: true, points };
}

const NAMES: Record<HireType, string> = { p: 'squires', n: 'knights', b: 'mages', r: 'towers', q: 'sorceress' };

/** Whether adding one more piece of type `t` would still fit. */
export function canAdd(picks: HireType[], t: HireType, budget: Budget): boolean {
  return checkArmy([...picks, t], budget).ok;
}

/**
 * A sensible default pick: your companion first, then the most valuable pieces that
 * still fit, then squires to fill the budget.
 */
export function suggestArmy(roster: Character[], budget: Budget): string[] {
  const order: Character['role'][] = ['starter', 'hero', 'hired'];
  const sorted = [...roster].sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role) || value(b.type) - value(a.type));
  const chosen: Character[] = [];
  for (const c of sorted) {
    if (canAdd(chosen.map((x) => x.type), c.type, budget)) chosen.push(c);
  }
  return chosen.map((c) => c.id);
}

const value = (t: HireType) => armyPoints([t]);

/** Standard home squares for White, in the order pieces of each type fill them. */
const HOME: Record<HireType, string[]> = {
  r: ['a1', 'h1'],
  n: ['b1', 'g1'],
  b: ['c1', 'f1'],
  q: ['d1'],
  p: ['d2', 'e2', 'c2', 'f2', 'b2', 'g2', 'a2', 'h2'],
};

/**
 * The duel's starting position: your picks on their usual home squares, the king on e1,
 * and the boss's fixed setup for Black (`enemy` lists Black's pieces as square → piece letter).
 */
export function bossFen(picks: HireType[], enemy: Record<string, string>): string {
  const chess = new Chess();
  chess.clear();
  chess.put({ type: 'k', color: 'w' }, 'e1');
  const used: Record<HireType, number> = { p: 0, n: 0, b: 0, r: 0, q: 0 };
  for (const t of picks) {
    const sq = HOME[t][used[t]++];
    if (!sq) throw new Error(`Too many ${t} for the home squares`);
    chess.put({ type: t, color: 'w' }, sq as never);
  }
  for (const [sq, p] of Object.entries(enemy)) chess.put({ type: p.toLowerCase() as never, color: 'b' }, sq as never);
  // Castling where the king and rooks stand at home.
  const has = (sq: string, p: string, c: 'w' | 'b') => chess.get(sq as never)?.type === p && chess.get(sq as never)?.color === c;
  let rights = '';
  if (has('h1', 'r', 'w')) rights += 'K';
  if (has('a1', 'r', 'w')) rights += 'Q';
  if (has('e8', 'k', 'b') && has('h8', 'r', 'b')) rights += 'k';
  if (has('e8', 'k', 'b') && has('a8', 'r', 'b')) rights += 'q';
  const board = chess.fen().split(' ')[0];
  return `${board} w ${rights || '-'} - 0 1`;
}
