import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { Battle } from './battle';
import { SCENARIOS, type Scenario } from './scenarios';
import { threatMap } from './threats';

const byId = (id: string) => SCENARIOS.find((s) => s.id === id)!;

const custom = (fen: string, objective: Scenario['objective'], villages?: Scenario['villages']): Scenario => ({
  id: 'test',
  title: 'Test',
  region: 'Test',
  enemy: { name: 'Test', personality: 'standard' },
  intro: '',
  lesson: '',
  fen,
  objective,
  villages,
});

describe('scenarios', () => {
  it.each(SCENARIOS.map((s) => [s.id, s] as const))('%s is a legal start with White to move', (_, s) => {
    const chess = new Chess(s.fen);
    expect(chess.turn()).toBe('w');
    expect(chess.isGameOver()).toBe(false);
    expect(chess.moves().length).toBeGreaterThan(0);
    for (const v of s.villages ?? []) expect(chess.get(v)).toBeFalsy();
  });

  it.each(SCENARIOS.map((s) => [s.id, s] as const))('%s does not start with the enemy already in check', (_, s) => {
    // chess.js accepts this illegal kind of position, so check it by flipping the side to move.
    const flipped = s.fen.replace(' w ', ' b ');
    expect(new Chess(flipped).inCheck()).toBe(false);
  });
});

describe('Battle', () => {
  it('wins the Rook Ladder with a ladder mate', () => {
    const b = new Battle(byId('rook-ladder'), 1);
    b.playerMove({ from: 'a1', to: 'a7' });
    b.enemyMove('e8f8');
    const res = b.playerMove({ from: 'h1', to: 'h8' });
    expect(b.status).toBe('won');
    expect(res.tactics[0]).toBe('checkmate');
  });

  it('detects the fork and wins material in Ambush at the Ford', () => {
    const b = new Battle(byId('knights-fork'), 1);
    const fork = b.playerMove({ from: 'b5', to: 'c7' });
    expect(fork.tactics).toContain('fork');
    expect(fork.tactics).toContain('check');
    b.enemyMove('e8d7');
    b.playerMove({ from: 'c7', to: 'a8' });
    expect(b.materialGained()).toBe(5);
    // Material counts once the enemy has had its reply and couldn't take it back.
    expect(b.status).toBe('playing');
    b.enemyMove('d7c6');
    expect(b.status).toBe('won');
    expect(b.reason).toMatch(/kept/);
  });

  it('does not count material that is simply taken back', () => {
    // White's rook grabs a knight guarded by a pawn: +3 on the spot, then the pawn takes the rook.
    const b = new Battle(custom('4k3/8/3p4/4n3/8/8/8/4RK2 w - - 0 1', { kind: 'winMaterial', gain: 3, maxMoves: 4 }), 0);
    b.playerMove({ from: 'e1', to: 'e5' });
    expect(b.materialGained()).toBe(3);
    expect(b.status).toBe('playing');
    b.enemyMove('d6e5');
    expect(b.materialGained()).toBe(-2);
    expect(b.status).toBe('playing');
  });

  it('judges a material win on the last move after the reply', () => {
    const goal = { kind: 'winMaterial' as const, gain: 3, maxMoves: 1 };
    const kept = new Battle(custom('4k3/8/8/4n3/8/8/8/4RK2 w - - 0 1', goal), 0);
    kept.playerMove({ from: 'e1', to: 'e5' });
    expect(kept.status).toBe('playing'); // not "out of moves" yet: the enemy replies first
    kept.enemyMove('e8d7');
    expect(kept.status).toBe('won');
    const lost = new Battle(custom('4k3/8/3p4/4n3/8/8/8/4RK2 w - - 0 1', goal), 0);
    lost.playerMove({ from: 'e1', to: 'e5' });
    lost.enemyMove('d6e5');
    expect(lost.status).toBe('lost');
    expect(lost.reason).toMatch(/out of moves/);
  });

  it('loses when the move limit runs out', () => {
    const b = new Battle(byId('knights-fork'), 0);
    b.playerMove({ from: 'g1', to: 'f1' });
    b.enemyMove('e8d8');
    b.playerMove({ from: 'f1', to: 'e1' });
    b.enemyMove('d8e8');
    b.playerMove({ from: 'e1', to: 'd1' });
    expect(b.status).toBe('lost');
    expect(b.reason).toMatch(/Out of moves/);
  });

  it('treats stalemate as a loss when checkmate or promotion is the goal', () => {
    const b = new Battle(custom('3k4/3P4/2K5/8/8/8/8/8 w - - 0 1', { kind: 'promote', maxMoves: 5 }), 1);
    b.playerMove({ from: 'c6', to: 'd6' });
    expect(b.status).toBe('lost');
    expect(b.reason).toMatch(/Stalemate/);
  });

  it('only counts a promotion that cannot be captured for free', () => {
    // The king on c7 would just take a new queen on d8.
    const unsafe = new Battle(custom('8/2kP4/8/8/8/8/8/K7 w - - 0 1', { kind: 'promote', maxMoves: 5 }), 0);
    unsafe.playerMove({ from: 'd7', to: 'd8', promotion: 'q' });
    expect(unsafe.status).toBe('playing');

    const safe = new Battle(custom('8/3P4/8/8/8/8/8/K6k w - - 0 1', { kind: 'promote', maxMoves: 5 }), 0);
    safe.playerMove({ from: 'd7', to: 'd8', promotion: 'q' });
    expect(safe.status).toBe('won');
  });

  it('rewinds the last move pair and spends a charge', () => {
    const b = new Battle(byId('rook-ladder'), 1);
    const start = b.fen;
    b.playerMove({ from: 'a1', to: 'a7' });
    b.enemyMove('e8f8');
    expect(b.rewind()).toBe(true);
    expect(b.fen).toBe(start);
    expect(b.playerMoves).toBe(0);
    expect(b.log).toEqual([]);
    expect(b.rewindsLeft).toBe(0);
    b.playerMove({ from: 'a1', to: 'a7' });
    expect(b.rewind()).toBe(false);
  });

  it('can rewind out of a defeat', () => {
    const b = new Battle(custom('3k4/3P4/2K5/8/8/8/8/8 w - - 0 1', { kind: 'promote', maxMoves: 5 }), 1);
    b.playerMove({ from: 'c6', to: 'd6' });
    expect(b.status).toBe('lost');
    b.rewind();
    expect(b.status).toBe('playing');
    expect(b.isPlayerTurn()).toBe(true);
  });

  it('burns a village if a raider is still standing on it after your move', () => {
    const b = new Battle(byId('hold-the-bridge'), 0);
    b.playerMove({ from: 'h2', to: 'h3' });
    b.enemyMove('c6d4'); // knight lands on the d4 village
    expect(b.status).toBe('playing'); // you get one move to answer
    b.playerMove({ from: 'h3', to: 'h4' });
    expect(b.status).toBe('lost');
  });

  it('lets you save a village by capturing the raider', () => {
    const b = new Battle(byId('hold-the-bridge'), 0);
    b.playerMove({ from: 'h2', to: 'h3' });
    b.enemyMove('c6d4');
    b.playerMove({ from: 'f3', to: 'd4' });
    expect(b.status).toBe('playing');
    expect(b.piecesLost).toBe(0);
  });

  it('counts pieces lost to enemy captures', () => {
    const b = new Battle(byId('hold-the-bridge'), 0);
    b.playerMove({ from: 'h2', to: 'h3' });
    b.enemyMove('b4e1');
    expect(b.piecesLost).toBe(1);
  });
});

describe('Threat Sight', () => {
  it('flags the undefended rook in Hold the Bridge', () => {
    const t = threatMap(new Chess(byId('hold-the-bridge').fen), 'w');
    expect(t.hanging.has('e1')).toBe(true);
    expect(t.hanging.has('f3')).toBe(false);
    expect(t.attacked.has('d4')).toBe(true); // the c6 knight eyes the village
  });

  it('flags a piece attacked by something cheaper even when defended', () => {
    // Black pawn on e5 attacks the defended white knight on d4.
    const t = threatMap(new Chess('4k3/8/8/4p3/3N4/8/3P4/4K3 w - - 0 1'), 'w');
    expect(t.hanging.has('d4')).toBe(true);
  });
});
