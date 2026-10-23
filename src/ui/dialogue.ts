import type { SpeakerInfo } from './speaker';

/**
 * Battle dialogue on phones: how long a talking-head line stays up, and the record of
 * everything said this battle so a line that went by too fast can be read again.
 */

/** Shortest and longest time a floating line stays up before it fades (ms). */
export const HOLD_MIN = 3200;
export const HOLD_MAX = 9000;
/** Reading time per character: about 200 words a minute. */
const PER_CHAR = 60;

/** How long a line stays up before it starts to fade: longer lines get more time. */
export function holdMs(line: string): number {
  return Math.min(HOLD_MAX, Math.max(HOLD_MIN, 1200 + line.length * PER_CHAR));
}

export interface SaidLine {
  info: SpeakerInfo;
  /** Half-moves played when it was said: 0 before the first move. */
  plies: number;
}

/** When a line was said, for the history: "Start", then "Move 1", "Move 2"… */
export function moveLabel(plies: number): string {
  return plies === 0 ? 'Start' : `Move ${Math.ceil(plies / 2)}`;
}

/** Everything said this battle, oldest first. Keeps the last `cap` lines. */
export class DialogueLog {
  private lines: SaidLine[] = [];

  constructor(private readonly cap = 80) {}

  add(info: SpeakerInfo, plies: number) {
    this.lines.push({ info, plies });
    if (this.lines.length > this.cap) this.lines.splice(0, this.lines.length - this.cap);
  }

  clear() {
    this.lines = [];
  }

  get all(): readonly SaidLine[] {
    return this.lines;
  }

  get last(): SaidLine | undefined {
    return this.lines[this.lines.length - 1];
  }

  get size() {
    return this.lines.length;
  }
}
