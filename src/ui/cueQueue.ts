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

/** The queue waits on these timers. If something can cancel them behind the queue's back, call `clear()` too, or it stays busy for good. */
export interface CueTimer {
  set: (fn: () => void, ms: number) => unknown;
  clear: (handle: unknown) => void;
}

export class CueQueue {
  private waiting: Cue[] = [];
  private timer: unknown = null;
  private idleWaiters: (() => void)[] = [];

  constructor(
    private readonly clock: CueTimer,
    private readonly maxWaiting = 2,
  ) {}

  /** True while a cue holds the middle of the board. */
  get busy(): boolean {
    return this.timer !== null;
  }

  push(cue: Cue): void {
    this.waiting.push(cue);
    if (cue.hold > 0) {
      const timed = this.waiting.filter((c) => c.hold > 0);
      if (timed.length > this.maxWaiting) this.waiting.splice(this.waiting.indexOf(timed[0]!), 1);
    }
    this.pump();
  }

  /** Resolves once every cue has shown and the last hold has ended (or the queue is cleared). */
  whenIdle(): Promise<void> {
    if (!this.busy && !this.waiting.length) return Promise.resolve();
    return new Promise((resolve) => this.idleWaiters.push(resolve));
  }

  /** Drops every waiting cue and frees the board at once (rewind, restart, leaving). */
  clear(): void {
    if (this.timer !== null) this.clock.clear(this.timer);
    this.timer = null;
    this.waiting = [];
    this.settle();
  }

  private pump(): void {
    while (this.timer === null && this.waiting.length) {
      const cue = this.waiting.shift()!;
      // Hold the board before drawing, so a cue that pushes another can't jump the line.
      if (cue.hold > 0) {
        this.timer = this.clock.set(() => {
          this.timer = null;
          this.pump();
        }, cue.hold);
      }
      cue.show();
    }
    if (this.timer === null && !this.waiting.length) this.settle();
  }

  private settle(): void {
    const waiters = this.idleWaiters;
    this.idleWaiters = [];
    for (const resolve of waiters) resolve();
  }
}
