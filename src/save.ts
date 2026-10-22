import { newSave, upgradeSave, type SaveState, type StarterType } from './game/campaign';
import type { DifficultyId } from './game/difficulty';
import { store } from './store';

/** The one campaign save, kept in localStorage. */
const KEY = 'gauntlet-save-v1';

function load(): SaveState | null {
  const raw = store.get(KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as SaveState;
    return s && s.version === 1 && Array.isArray(s.roster) ? upgradeSave(s) : null;
  } catch {
    return null;
  }
}

let current: SaveState | null = load();

export function getSave(): SaveState | null {
  return current;
}

/** The save, for screens that only open once a campaign has started. */
export function save(): SaveState {
  if (!current) throw new Error('No campaign in progress');
  return current;
}

export function persist() {
  if (current) store.set(KEY, JSON.stringify(current));
}

export function startCampaign(difficulty: DifficultyId, starter: StarterType, knowsMoves: boolean): SaveState {
  current = newSave(difficulty, starter, knowsMoves);
  persist();
  return current;
}

export function eraseSave() {
  current = null;
  store.remove(KEY);
}
