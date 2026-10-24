import { afterEach, expect, it, vi } from 'vitest';
import { store } from './store';

afterEach(() => vi.unstubAllGlobals());

it('keeps archive play, preferences, and reset separate from live saves', () => {
  const values = new Map([
    ['gauntlet-save-v1', 'original campaign'],
    ['pawnshire-journey-v1', 'live journey'],
    ['pawnshire-staging-journey-v1', 'staging journey'],
    ['pieceStyle', 'classic'],
  ]);
  const originals = new Map(values);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
  expect(store.get('gauntlet-save-v1')).toBeNull();
  expect(store.get('pieceStyle')).toBeNull();
  store.set('gauntlet-save-v1', 'archive campaign');
  store.set('pieceStyle', 'tokens');
  expect(store.get('gauntlet-save-v1')).toBe('archive campaign');
  expect(store.get('pieceStyle')).toBe('tokens');
  store.remove('gauntlet-save-v1');
  store.remove('pieceStyle');
  expect(store.get('gauntlet-save-v1')).toBeNull();
  expect(values).toEqual(originals);
});

it('still tolerates blocked browser storage', () => {
  vi.stubGlobal('localStorage', {
    getItem: () => { throw new Error('blocked'); },
    setItem: () => { throw new Error('blocked'); },
    removeItem: () => { throw new Error('blocked'); },
  });
  expect(store.get('gauntlet-save-v1')).toBeNull();
  expect(() => store.set('gauntlet-save-v1', 'save')).not.toThrow();
  expect(() => store.remove('gauntlet-save-v1')).not.toThrow();
});
