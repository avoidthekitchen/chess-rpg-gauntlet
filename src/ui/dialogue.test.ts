import { describe, expect, it } from 'vitest';
import { DialogueLog, HOLD_MAX, HOLD_MIN, holdMs, moveLabel } from './dialogue';
import type { SpeakerInfo } from './speaker';

const say = (line: string): SpeakerInfo => ({ side: 'ally', name: 'Pip · Fox', line, type: 'n' });

describe('holdMs', () => {
  it('keeps short lines up as long as before', () => {
    expect(holdMs('Got you!')).toBe(HOLD_MIN);
  });

  it('gives longer lines more time to read', () => {
    const tip = 'Our knight on f3 is guarded, but they have more attackers than we have guards. Move it, or add a guard!';
    expect(holdMs(tip)).toBeGreaterThan(6000);
    expect(holdMs(tip)).toBeGreaterThan(holdMs('Make way for the rook.'));
  });

  it('never holds a line forever', () => {
    expect(holdMs('x'.repeat(1000))).toBe(HOLD_MAX);
  });
});

describe('moveLabel', () => {
  it('names the start and full moves', () => {
    expect(moveLabel(0)).toBe('Start');
    expect(moveLabel(1)).toBe('Move 1');
    expect(moveLabel(2)).toBe('Move 1');
    expect(moveLabel(3)).toBe('Move 2');
  });
});

describe('DialogueLog', () => {
  it('keeps lines in order and knows the last one', () => {
    const log = new DialogueLog();
    log.add(say('one'), 0);
    log.add(say('two'), 1);
    expect(log.all.map((l) => l.info.line)).toEqual(['one', 'two']);
    expect(log.last?.info.line).toBe('two');
    expect(log.last?.plies).toBe(1);
  });

  it('drops the oldest lines past its cap', () => {
    const log = new DialogueLog(3);
    for (const l of ['a', 'b', 'c', 'd', 'e']) log.add(say(l), 0);
    expect(log.all.map((l) => l.info.line)).toEqual(['c', 'd', 'e']);
  });

  it('clears for a restart', () => {
    const log = new DialogueLog();
    log.add(say('one'), 0);
    log.clear();
    expect(log.size).toBe(0);
    expect(log.last).toBeUndefined();
  });
});
