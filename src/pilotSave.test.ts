import { beforeEach, describe, expect, it, vi } from 'vitest';
import { beginPilot, newPilot } from './game/ambushPilot';
import { TWO_AT_ONCE } from './game/region2Ambush';
import { loadPilot, persistPilot, PILOT_KEY } from './pilotSave';

const data = vi.hoisted(() => new Map<string, string>());
vi.mock('./store', () => ({ store: { get: (k: string) => data.get(k) ?? null, set: (k: string, v: string) => data.set(k, v) } }));

describe('isolated pilot storage', () => {
  beforeEach(() => { data.clear(); data.set('gauntlet-save-v1', 'my real campaign'); });
  it('never reads or changes the normal campaign and resets only the pilot', () => {
    const s = loadPilot(TWO_AT_ONCE); s.save.gold = 321; persistPilot(s);
    expect(loadPilot(TWO_AT_ONCE).save.gold).toBe(321);
    persistPilot(newPilot('squire', 'b'));
    expect(loadPilot(TWO_AT_ONCE).save.gold).toBe(100);
    expect(data.get('gauntlet-save-v1')).toBe('my real campaign');
  });
  it('settles an interrupted attempt once across repeated reloads', () => {
    const s = newPilot(); beginPilot(s, TWO_AT_ONCE); persistPilot(s);
    const loaded = loadPilot(TWO_AT_ONCE);
    expect(loaded.result?.interrupted).toBe(true);
    expect(loaded.save.gold).toBe(90);
    expect(loadPilot(TWO_AT_ONCE).save.gold).toBe(90);
    expect(loadPilot(TWO_AT_ONCE).save.battlesFought).toBe(1);
  });
  it('repairs a malformed pilot save without changing campaign data', () => {
    data.set(PILOT_KEY, '{broken');
    expect(loadPilot(TWO_AT_ONCE).save.difficulty).toBe('knight');
    expect(data.get('gauntlet-save-v1')).toBe('my real campaign');
  });
});
