/** localStorage that never throws (private mode, blocked storage): progress just won't persist. */
// Archive visits and resets must never change the live game's saves or preferences.
const prefix = 'pawnshire-alpha:';
export const store = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(prefix + key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(prefix + key, value);
    } catch {
      /* ignore */
    }
  },
  remove(key: string) {
    try {
      localStorage.removeItem(prefix + key);
    } catch {
      /* ignore */
    }
  },
};
