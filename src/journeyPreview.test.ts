import { afterEach, describe, expect, it, vi } from 'vitest';
import { COURSE_REGIONS } from './game/curriculum';
import { beginJourneyLesson, lessonUnlocked, newJourney, regionUnlocked } from './game/journey';
import { preparePreviewSave, requestedPreviewRegion } from './journeyPreview';

const data = vi.hoisted(() => new Map<string, string>());
vi.mock('./store', () => ({ store: {
  get: (key: string) => data.get(key) ?? null,
  set: (key: string, value: string) => data.set(key, value),
  remove: (key: string) => data.delete(key),
} }));
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.resetModules(); data.clear(); });

describe('staging region previews', () => {
  it('accepts only known regions and ignores all shortcuts when disabled', () => {
    for (const value of ['1', '2', '3', '4', '5', 'r3', 'finale']) {
      expect(requestedPreviewRegion(`?region=${value}`, true)).toBe(value.length === 1 ? `r${value}` : value);
      expect(requestedPreviewRegion(`?region=${value}`, false)).toBeNull();
    }
    for (const value of ['', '0', '6', '03', 'r99', '<script>']) {
      expect(requestedPreviewRegion(`?region=${encodeURIComponent(value)}`, true)).toBeNull();
    }
  });

  it('opens each requested region without solving it or granting the ending', () => {
    const original = newJourney('champion', 'r');
    for (const region of COURSE_REGIONS) {
      const save = preparePreviewSave(original, region.id);
      expect(save.currentRegion).toBe(region.id);
      expect(save.difficulty).toBe('champion');
      expect(save.starter).toBe('r');
      expect(regionUnlocked(save, region.id)).toBe(true);
      expect(lessonUnlocked(save, region.lessons[0])).toBe(true);
      expect(lessonUnlocked(save, region.lessons[1])).toBe(false);
      expect(save.completed).not.toContain(region.lessons[0]);
      expect(save).toMatchObject({ finaleComplete: false, stars: {}, attempts: 0, active: null });
    }
    expect(original.completed).toEqual([]);
  });

  it('isolates preview creation, interrupted reload, reset, and region switching from normal progress', async () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('MODE', 'staging');
    vi.stubGlobal('location', { search: '?region=3' });
    vi.resetModules();
    const normal = JSON.stringify(newJourney('grandmaster', 'b'));
    data.set('pawnshire-journey-v1', normal);
    data.set('gauntlet-save-v1', 'legacy');
    data.set('pawnshire-ambush-pilot-v1', 'pilot');
    let storage = await import('./journeySave');
    expect(storage.prepareJourneyPreview()).toBe(true);
    expect(storage.JOURNEY_KEY).toBe('pawnshire-preview-v1:r3');
    const save = storage.loadJourney()!;
    expect(beginJourneyLesson(save, COURSE_REGIONS[2].lessons[0])).toBe(true);
    storage.persistJourney(save);
    storage.prepareJourneyPreview();
    expect(storage.loadJourney()).toMatchObject({ currentRegion: 'r3', attempts: 1 });
    storage.prepareJourneyPreview();
    expect(storage.loadJourney()!.attempts).toBe(1);
    const r3 = data.get(storage.JOURNEY_KEY);
    vi.stubGlobal('location', { search: '?region=finale' });
    vi.resetModules();
    storage = await import('./journeySave');
    storage.prepareJourneyPreview();
    expect(storage.loadJourney()).toMatchObject({ currentRegion: 'finale', finaleComplete: false });
    storage.clearJourney();
    storage.persistJourney(storage.newJourneyForMode('squire', 'r'));
    expect(storage.loadJourney()).toMatchObject({ currentRegion: 'finale', starter: 'r', difficulty: 'squire', attempts: 0 });
    expect(data.get('pawnshire-preview-v1:r3')).toBe(r3);
    expect(data.get('pawnshire-journey-v1')).toBe(normal);
    expect(data.get('gauntlet-save-v1')).toBe('legacy');
    expect(data.get('pawnshire-ambush-pilot-v1')).toBe('pilot');
  });

  it('uses the normal save and does not initialize a shortcut in production', async () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('MODE', 'production');
    vi.stubGlobal('location', { search: '?region=5' });
    vi.resetModules();
    const storage = await import('./journeySave');
    expect(storage.JOURNEY_KEY).toBe('pawnshire-journey-v1');
    expect(storage.prepareJourneyPreview()).toBe(false);
    expect(data.size).toBe(0);
    expect(storage.newJourneyForMode().completed).toEqual([]);
  });
});
