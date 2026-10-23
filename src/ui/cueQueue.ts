/**
 * One-at-a-time queue for the pop-ups in the middle of the board (capture close-ups and
 * banners), so a reply's banner never lands on top of text the player is still reading.
 *
 * Each cue shows when the one before has had its `hold`. Cues with `hold: 0` (the floating
 * points over a square) ride along: they wait their turn but never block or get dropped.
 * When more than `maxWaiting` timed cues are waiting, the oldest is dropped so feedback stays current.
 */
export interface Cue {
  /** Draws the cue. Runs once, when the cue reaches the front. */
  show: () => void;
  /** How long it holds the middle of the board before the next cue may show, in ms. */
  hold: number;
}

export interface CueTimer {
  set: (fn: () => void, ms: number) => number;
  clear: (handle: number) => void;
}

const windowTimer: CueTimer = {
  set: (fn, ms) => window.setTimeout(fn, ms),
  clear: (handle) => window.clearTimeout(handle),
};

export class CueQueue {
  private waiting: Cue[] = [];
  private timer = 0;

  constructor(
    private readonly maxWaiting = 2,
    private readonly clock: CueTimer = windowTimer,
  ) {}

  /** True while a cue holds the middle of the board. */
  get busy(): boolean {
    return this.timer !== 0;
  }

  push(cue: Cue): void {
    this.waiting.push(cue);
    if (cue.hold > 0) {
      const timed = this.waiting.filter((c) => c.hold > 0);
      if (timed.length > this.maxWaiting) this.waiting.splice(this.waiting.indexOf(timed[0]!), 1);
    }
    this.pump();
  }

  /** Drops every waiting cue and frees the board at once (rewind, restart, leaving). */
  clear(): void {
    if (this.timer) this.clock.clear(this.timer);
    this.timer = 0;
    this.waiting = [];
  }

  private pump(): void {
    while (!this.timer && this.waiting.length) {
      const cue = this.waiting.shift()!;
      cue.show();
      if (cue.hold > 0) {
        this.timer = this.clock.set(() => {
          this.timer = 0;
          this.pump();
        }, cue.hold);
      }
    }
  }
}
