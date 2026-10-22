import { addCharacter, type Character, type SaveState } from './campaign';
import { bonusMet, type BattleDef, type BattleStats } from './content';
import type { DifficultyId } from './difficulty';
import { PIECE_VALUE } from './material';
import { bountyReward, pickBounties, playerRatingFor, type Puzzle } from './bounty';

/**
 * Gold: prices, hiring, battle pay, loss costs and the bounty board.
 * Prices equal standard piece values, so shopping teaches values.
 */

export type HireType = Character['type'];

export const PRICE: Record<HireType, number> = { p: 10, n: 30, b: 30, r: 50, q: 90 };
/** A real chess set: 8 pawns, 2 knights, 2 bishops, 2 rooks, 1 queen. */
export const ARMY_CAP: Record<HireType, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };

export const owned = (s: Pick<SaveState, 'roster'>, t: HireType) => s.roster.filter((c) => c.type === t).length;

export function hireCheck(s: SaveState, t: HireType): { ok: true } | { ok: false; reason: string } {
  if (owned(s, t) >= ARMY_CAP[t]) return { ok: false, reason: `A chess set has only ${ARMY_CAP[t]}.` };
  if (s.gold < PRICE[t]) return { ok: false, reason: `Costs ${PRICE[t]}g.` };
  return { ok: true };
}

export function hire(s: SaveState, t: HireType): Character | null {
  if (!hireCheck(s, t).ok) return null;
  s.gold -= PRICE[t];
  return addCharacter(s, t, 'hired');
}

/** Points of material in an army (the king is free). */
export const armyPoints = (types: HireType[]) => types.reduce((sum, t) => sum + PIECE_VALUE[t], 0);

// ---------- battle pay ----------

/** Confirmed tactic banners (like a real fork) pay a little; capped per battle so replays can't be farmed. */
export const TACTIC_GOLD = 5;
export const TACTIC_GOLD_CAP = 10;

export interface Payout {
  /** The win reward, paid on the first win only. */
  reward: number;
  /** Bonus goals met for the first time. */
  bonuses: { kind: string; gold: number }[];
  tactics: number;
  total: number;
}

/**
 * What a win pays. Each reward is paid once ever: the first win's reward, each bonus
 * goal the first time it's met, and tactic gold up to a cap per battle. Replays can
 * still earn whatever is left, so mastery pays but grinding doesn't.
 */
export function battlePayout(s: SaveState, def: BattleDef, stats: BattleStats, tacticGold: number): Payout {
  if (!stats.won) return { reward: 0, bonuses: [], tactics: 0, total: 0 };
  const reward = s.cleared.includes(def.id) ? 0 : def.reward;
  const bonuses = def.bonuses
    .filter((b) => bonusMet(b, stats) && !s.bonusesEarned.includes(`${def.id}:${b.kind}`))
    .map((b) => ({ kind: b.kind, gold: b.gold }));
  const already = s.tacticGold[def.id] ?? 0;
  const tactics = Math.max(0, Math.min(tacticGold, TACTIC_GOLD_CAP - already));
  return { reward, bonuses, tactics, total: reward + bonuses.reduce((a, b) => a + b.gold, 0) + tactics };
}

/** Records a win: pays out, marks the battle cleared and counts it for the bounty board. */
export function recordWin(s: SaveState, def: BattleDef, stats: BattleStats, tacticGold: number): Payout {
  const pay = battlePayout(s, def, stats, tacticGold);
  s.gold += pay.total;
  if (!s.cleared.includes(def.id)) s.cleared.push(def.id);
  for (const b of pay.bonuses) s.bonusesEarned.push(`${def.id}:${b.kind}`);
  s.tacticGold[def.id] = (s.tacticGold[def.id] ?? 0) + pay.tactics;
  s.battlesFought++;
  return pay;
}

/** Losing never costs the save; how much gold it costs depends on difficulty. */
export function lossCost(difficulty: DifficultyId, gold: number): number {
  switch (difficulty) {
    case 'squire':
      return 0;
    case 'knight':
      return Math.floor(gold / 10); // first guess, tune in playtests
    case 'champion':
    case 'grandmaster':
      return Math.floor(gold / 4);
  }
}

/** Records an accepted loss (you retried or retreated instead of rewinding). Returns the gold lost. */
export function recordLoss(s: SaveState, battleId: string): number {
  const cost = lossCost(s.difficulty, s.gold);
  s.gold -= cost;
  if (s.difficulty === 'grandmaster' && !s.cleared.includes(battleId) && !s.lostForGood.includes(battleId)) s.lostForGood.push(battleId);
  s.battlesFought++;
  return cost;
}

// ---------- bounty board ----------

export const BOUNTY_COUNT = 4;

/**
 * The bounty board refreshes after each battle (won or lost): small, so it can't be
 * ground, and it mixes puzzles in between battles. Returns true if it changed.
 */
export function refreshBounties(s: SaveState, pool: Puzzle[], rng: () => number = Math.random): boolean {
  if (s.bountiesRefreshedAt === s.battlesFought && s.bounties.length > 0) return false;
  const exclude = new Set([...s.bountiesDone]);
  const picks = pickBounties(pool, { playerRating: playerRatingFor(s.difficulty), count: BOUNTY_COUNT, exclude, rng });
  s.bounties = picks.map((p) => p.id);
  s.bountiesRefreshedAt = s.battlesFought;
  return true;
}

export function bountyPay(s: Pick<SaveState, 'difficulty'>, p: Puzzle): number {
  return bountyReward(p.rating, playerRatingFor(s.difficulty));
}

/** Takes a bounty off the board. A solved one pays; a failed one is gone until the next refresh. */
export function settleBounty(s: SaveState, p: Puzzle, solved: boolean): number {
  s.bounties = s.bounties.filter((id) => id !== p.id);
  if (!s.bountiesDone.includes(p.id)) s.bountiesDone.push(p.id);
  const gold = solved ? bountyPay(s, p) : 0;
  s.gold += gold;
  return gold;
}
