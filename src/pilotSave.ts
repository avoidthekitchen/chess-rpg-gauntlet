import { newPilot, settlePilot, type PilotState } from './game/ambushPilot';
import type { AmbushDef } from './game/ambush';
import { DIFFICULTIES } from './game/difficulty';
import { store } from './store';

export const PILOT_KEY = 'pawnshire-ambush-pilot-v1';
export function persistPilot(state: PilotState) { store.set(PILOT_KEY, JSON.stringify(state)); }

/** Only the pilot key is read or written. A reload settles an unfinished attempt once. */
export function loadPilot(def: AmbushDef): PilotState {
  try {
    const raw = store.get(PILOT_KEY);
    if (raw) {
      const state = JSON.parse(raw) as PilotState;
      if (state.version === 1 && state.save && state.save.difficulty in DIFFICULTIES && ['n', 'b', 'r'].includes(state.save.starter) && Array.isArray(state.save.roster) && Array.isArray(state.save.cleared) && Array.isArray(state.save.lostForGood) && Array.isArray(state.save.bonusesEarned) && Number.isFinite(state.save.gold)) {
        if (state.run && !state.run.settled) settlePilot(state, def, true, true);
        persistPilot(state);
        return state;
      }
    }
  } catch { /* An invalid pilot save does not touch the real campaign. */ }
  const state = newPilot();
  persistPilot(state);
  return state;
}
