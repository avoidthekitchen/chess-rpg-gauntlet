import { describe, expect, it } from 'vitest';
import { journeyRoute, journeyTrail } from './journeyLayout';

describe('chapter trail layout', () => {
  it.each([1, 2, 6, 7, 10])('keeps %i encounters inside the map with phone reading space', count => {
    const { desktop, phone, phoneHeight } = journeyTrail(count);
    expect(desktop).toHaveLength(count);
    expect(phone).toHaveLength(count);
    for (const [x, y] of [...desktop, ...phone]) {
      expect(x).toBeGreaterThan(0); expect(x).toBeLessThan(100);
      expect(y).toBeGreaterThan(0); expect(y).toBeLessThan(90);
    }
    for (let i = 1; i < count; i++) {
      expect((phone[i][1] - phone[i - 1][1]) * (phoneHeight - 44) / 100).toBeCloseTo(140);
      expect(desktop[i][0]).toBeGreaterThan(desktop[i - 1][0]);
    }
    expect(journeyRoute(phone).split(' ')).toHaveLength(count);
  });
  it('rejects invalid encounter counts', () => {
    for (const count of [0, -1, 1.5, NaN]) expect(() => journeyTrail(count)).toThrow();
  });
});
