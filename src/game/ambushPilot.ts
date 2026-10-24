import { addCharacter, newSave, type SaveState, type StarterType } from './campaign';
import type { DifficultyId } from './difficulty';
import { ambushBonuses, startAmbush, type AmbushDef, type AmbushRun } from './ambush';
import { encounterPayout, recordEncounterWin, recordLoss, type Payout } from './economy';

export const PILOT_GOLD = 100;
export interface PilotState {
  version: 1;
  save: SaveState;
  run: AmbushRun | null;
  result: { won: boolean; cost: number; payout: Payout | null; interrupted: boolean } | null;
}
export function newPilot(difficulty: DifficultyId = 'knight', starter: StarterType = 'n'): PilotState {
  const save = newSave(difficulty, starter, true);
  save.gold = PILOT_GOLD;
  for (const type of ['n', 'b', 'r'] as const) if (type !== starter) addCharacter(save, type, 'hired');
  addCharacter(save, 'q', 'hero', 'Saffron');
  return { version: 1, save, run: null, result: null };
}
export const pilotGone = (state: PilotState, def: AmbushDef) => state.save.lostForGood.includes(def.id) && !state.save.cleared.includes(def.id);

export function beginPilot(state: PilotState, def: AmbushDef): boolean {
  if (pilotGone(state, def) || (state.run && !state.run.settled)) return false;
  const retryWave = state.run?.status === 'lost' ? state.run.wave : undefined;
  state.run = startAmbush(def, state.save.difficulty, retryWave);
  state.result = null;
  return true;
}

/** Save one final result before any presentation awaits. No callback may charge it twice. */
export function settlePilot(state: PilotState, def: AmbushDef, abandon = false, interrupted = false): boolean {
  const run = state.run;
  if (!run || run.settled) return false;
  if (abandon && run.status !== 'won') run.status = 'lost';
  if (run.status !== 'won' && run.status !== 'lost') return false;
  run.settled = true;
  if (run.status === 'won') {
    const pay = encounterPayout(state.save, def, ambushBonuses(def, run));
    recordEncounterWin(state.save, def.id, pay);
    state.result = { won: true, cost: 0, payout: pay, interrupted: false };
  } else {
    state.result = { won: false, cost: recordLoss(state.save, def.id), payout: null, interrupted };
  }
  return true;
}
