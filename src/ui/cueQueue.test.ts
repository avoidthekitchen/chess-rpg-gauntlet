import { describe, expect, it } from 'vitest';
import { CueQueue, type CueTimer } from './cueQueue';

/** A hand-cranked clock: `tick(ms)` fires every timer due by then. */
function fakeClock() {
  let now = 0;
  let next = 1;
  const timers = new Map<number, { at: number; fn: () => void }>();
  const clock: CueTimer = {
    set: (fn, ms) => {
      timers.set(next, { at: now + ms, fn });
      return next++;
    },
    clear: (h) => void timers.delete(h),
  };
  const tick = (ms: number) => {
    const end = now + ms;
    for (;;) {
      const due = [...timers.entries()].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      timers.delete(due[0]);
      now = due[1].at;
      due[1].fn();
    }
    now = end;
  };
  return { clock, tick };
}

function setup(maxWaiting = 2) {
  const { clock, tick } = fakeClock();
  const shown: string[] = [];
  const q = new CueQueue(maxWaiting, clock);
  const cue = (name: string, hold = 1000) => q.push({ hold, show: () => shown.push(name) });
  return { q, cue, shown, tick };
}

describe('CueQueue', () => {
  it('shows the first cue at once', () => {
    const { cue, shown } = setup();
    cue('Check!');
    expect(shown).toEqual(['Check!']);
  });

  it('shows cues one at a time, in order, each after the last one’s hold', () => {
    const { cue, shown, tick } = setup();
    cue('close-up', 1150);
    cue('Check!');
    cue('Foiled!');
    expect(shown).toEqual(['close-up']);
    tick(1149);
    expect(shown).toEqual(['close-up']);
    tick(1);
    expect(shown).toEqual(['close-up', 'Check!']);
    tick(1000);
    expect(shown).toEqual(['close-up', 'Check!', 'Foiled!']);
  });

  it('drops the oldest waiting cue past the backlog limit', () => {
    const { cue, shown, tick } = setup(2);
    cue('a'); // showing
    cue('b');
    cue('c');
    cue('d'); // three waiting: b goes
    tick(5000);
    expect(shown).toEqual(['a', 'c', 'd']);
  });

  it('never drops the cue that is already showing', () => {
    const { cue, shown, tick } = setup(1);
    cue('a');
    cue('b');
    cue('c');
    tick(5000);
    expect(shown).toEqual(['a', 'c']);
  });

  it('lets instant cues ride along without blocking or counting toward the limit', () => {
    const { cue, shown, tick } = setup(1);
    cue('close-up', 1150);
    cue('+3', 0);
    cue('Capture!');
    expect(shown).toEqual(['close-up']);
    tick(1150);
    // The points and the banner show together, right after the close-up.
    expect(shown).toEqual(['close-up', '+3', 'Capture!']);
  });

  it('frees the board as soon as the last cue’s hold ends', () => {
    const { q, cue, shown, tick } = setup();
    cue('a');
    expect(q.busy).toBe(true);
    tick(1000);
    expect(q.busy).toBe(false);
    cue('b');
    expect(shown).toEqual(['a', 'b']);
  });

  it('clear drops waiting cues and frees the board', () => {
    const { q, cue, shown, tick } = setup();
    cue('a');
    cue('b');
    q.clear();
    expect(q.busy).toBe(false);
    cue('Rewind');
    tick(5000);
    expect(shown).toEqual(['a', 'Rewind']);
  });
});
