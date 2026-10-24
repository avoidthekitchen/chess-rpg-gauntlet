import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { newJourney } from './game/journey';
const data = vi.hoisted(() => new Map<string, string>());
vi.mock('./store', () => ({ store: { get: (key: string) => data.get(key) ?? null,
  set: (key: string, value: string) => data.set(key, value), remove: (key: string) => data.delete(key) } }));
vi.mock('./journeyPreview', () => ({ previewRegion: null }));
beforeEach(() => { data.clear(); vi.resetModules(); });
afterEach(() => { vi.unstubAllEnvs(); });
it('copies a pre-isolation staging save once and never changes production on play or reset', async () => {
  vi.stubEnv('MODE', 'staging');
  const original = JSON.stringify(newJourney('squire', 'r'));
  data.set('pawnshire-journey-v1', original);
  const storage = await import('./journeySave');
  expect(storage.JOURNEY_KEY).toBe('pawnshire-staging-journey-v1');
  const save = storage.loadJourney()!;
  expect(save.starter).toBe('r');
  save.difficulty = 'champion'; storage.persistJourney(save);
  expect(data.get('pawnshire-journey-v1')).toBe(original);
  storage.clearJourney();
  expect(storage.loadJourney()).toBeNull();
  expect(data.get('pawnshire-journey-v1')).toBe(original);
});
it('retains the first rejected raw save before a fresh journey replaces it', async () => {
  const storage = await import('./journeySave');
  const damaged = '{unfinished'; data.set(storage.JOURNEY_KEY, damaged);
  expect(storage.loadJourney()).toBeNull();
  storage.persistJourney(newJourney());
  expect(data.get(`${storage.JOURNEY_KEY}:recovery`)).toBe(damaged);
  expect(storage.loadJourney()).not.toBeNull();
});

it('keeps an existing staging save instead of importing production over it', async () => {
  vi.stubEnv('MODE', 'staging');
  data.set('pawnshire-journey-v1', JSON.stringify(newJourney('squire', 'n')));
  data.set('pawnshire-staging-journey-v1', JSON.stringify(newJourney('champion', 'b')));
  const storage = await import('./journeySave');
  expect(storage.loadJourney()).toMatchObject({ difficulty: 'champion', starter: 'b' });
});
