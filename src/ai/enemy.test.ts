import { Chess } from 'chess.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Engine, parseInfo } from './engine';
import type { Candidate } from './engine';
import { candidateOdds, chooseEnemyMove, fallbackMove, pickCandidate, raiderMove, raidBonus, type Rng } from './enemy';
import { planIfPassed } from './intent';

describe('pickCandidate', () => {
  const cands = [
    { uci: 'e2e4', score: 50 },
    { uci: 'd2d4', score: 40 },
    { uci: 'g1f3', score: -200 },
  ];

  it('always picks the best move when no loss is allowed', () => {
    for (const r of [0, 0.5, 0.999]) expect(pickCandidate(cands, 0, () => r)).toBe('e2e4');
  });

  it('only picks moves within the allowed loss', () => {
    const seen = new Set([0, 0.3, 0.6, 0.999].map((r) => pickCandidate(cands, 20, () => r)));
    expect(seen).toEqual(new Set(['e2e4', 'd2d4']));
  });
});

describe('parseInfo', () => {
  it('reads centipawn and mate scores', () => {
    expect(parseInfo('info depth 8 seldepth 10 multipv 2 score cp -35 nodes 1 pv e7e5 g1f3')).toEqual({
      rank: 2,
      candidate: { uci: 'e7e5', score: -35 },
    });
    const mate = parseInfo('info depth 5 multipv 1 score mate 2 nodes 9 pv h1h8 e8e7')!;
    expect(mate.candidate.score).toBeGreaterThan(90_000);
    const mated = parseInfo('info depth 5 multipv 1 score mate -1 pv e8f8')!;
    expect(mated.candidate.score).toBeLessThan(-90_000);
  });

  it('ignores lines without a move', () => {
    expect(parseInfo('info string NNUE evaluation enabled')).toBeNull();
  });
});

describe('raiderMove', () => {
  it('burns an unguarded village', () => {
    // Black knight on c6 can land on d4, which nothing defends.
    const chess = new Chess('4k3/8/2n5/8/8/8/8/4K3 b - - 0 1');
    expect(raiderMove(chess, ['d4'], () => 0)).toBe('c6d4');
  });

  it('takes a rook with a bishop even if the bishop gets recaptured', () => {
    // Hold the Bridge after White's quiet h3: Bxe1 is a good trade.
    const chess = new Chess('6k1/pp4pp/2n5/5b2/1b6/5N1P/PPP2PP1/4R1K1 b - - 0 1');
    expect(raiderMove(chess, ['d4', 'e4'], () => 0)).toBe('b4e1');
  });
});

describe('raider king safety', () => {
  it('skips a village raid that lets the defender mate at once', () => {
    // The knight could burn the unguarded d4 village, but it's the only piece that can block
    // Ra8 (Black's king is boxed in by its own pawns), so raiding would allow Ra8#.
    const chess = new Chess('6k1/5ppp/2n5/8/8/8/8/R5K1 b - - 0 1');
    expect(raiderMove(chess, ['d4'], () => 0)).not.toBe('c6d4');
    // Without the mate threat (no rook), the same raid is taken.
    expect(raiderMove(new Chess('6k1/5ppp/2n5/8/8/8/8/6K1 b - - 0 1'), ['d4'], () => 0)).toBe('c6d4');
  });
});

describe('fallbackMove', () => {
  it('finds mate in one', () => {
    const chess = new Chess('6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1');
    expect(fallbackMove(chess, () => 0)).toBe('a1a8');
  });
});

describe('Engine', () => {
  /** A worker that boots fine but never finishes a search, like a hung Stockfish. */
  class HungWorker {
    onmessage: ((e: { data: string }) => void) | null = null;
    onerror: ((e: { message: string }) => void) | null = null;
    postMessage(cmd: string) {
      const reply = cmd === 'uci' ? 'uciok' : cmd === 'isready' ? 'readyok' : null;
      if (reply) setTimeout(() => this.onmessage?.({ data: reply }), 0);
    }
    terminate() {}
  }
  afterEach(() => vi.unstubAllGlobals());

  it('gives up on a stuck search and reports the failure once', async () => {
    vi.stubGlobal('Worker', HungWorker);
    const e = new Engine('stockfish.js', 50);
    const onFailure = vi.fn();
    e.onFailure = onFailure;
    expect(await e.ready).toBe(true);
    expect(await e.analyse('4k3/8/8/8/8/8/8/4K3 w - - 0 1', 8, 1)).toEqual([]);
    expect(e.failed).toBe(true);
    // Later searches return at once instead of queueing behind the stuck one.
    expect(await e.analyse('4k3/8/8/8/8/8/8/4K3 w - - 0 1', 8, 1)).toEqual([]);
    expect(onFailure).toHaveBeenCalledTimes(1);
  });
});

/** A tiny seeded PRNG so sampling tests are repeatable. */
function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BRAVE = { depth: 4, multiPv: 3, maxLoss: 120 };
const GENTLE = { depth: 4, multiPv: 3, maxLoss: 300 };
const pOf = (odds: { uci: string; p: number }[], uci: string) => odds.find((o) => o.uci === uci)?.p ?? 0;

describe('candidateOdds', () => {
  // The best move, and the shouted move 100 cp worse.
  const two: Candidate[] = [
    { uci: 'c6e5', score: 0 },
    { uci: 'c6d4', score: -100 },
  ];
  const shout = (uci: string) => (uci === 'c6d4' ? 3 : 1);

  it('gives a shouted move about 37% on Brave and 61% on Gentle', () => {
    expect(pOf(candidateOdds(two, 120, shout), 'c6d4')).toBeCloseTo(0.37, 2);
    expect(pOf(candidateOdds(two, 300, shout), 'c6d4')).toBeCloseTo(0.61, 2);
  });

  it('is about 34% on Gentle with no bonus', () => {
    expect(pOf(candidateOdds(two, 300), 'c6d4')).toBeCloseTo(0.34, 2);
  });

  it('adds up to 1', () => {
    const total = candidateOdds(two, 300, shout).reduce((a, o) => a + o.p, 0);
    expect(total).toBeCloseTo(1, 10);
  });

  it('makes the bonus move likelier than without it', () => {
    expect(pOf(candidateOdds(two, 120, shout), 'c6d4')).toBeGreaterThan(pOf(candidateOdds(two, 120), 'c6d4'));
  });

  it('never gives a move outside the window any chance, bonus or not', () => {
    const far: Candidate[] = [...two, { uci: 'c6a5', score: -500 }];
    const odds = candidateOdds(far, 120, (uci) => (uci === 'c6a5' ? 3 : 1));
    expect(odds.map((o) => o.uci)).not.toContain('c6a5');
    for (const seed of [1, 2, 3]) expect(pickCandidate(far, 120, mulberry32(seed), () => 3)).not.toBe('c6a5');
  });

  it('caps the combined bonus at x3', () => {
    const capped = pOf(candidateOdds(two, 120, (uci) => (uci === 'c6d4' ? 9 : 1)), 'c6d4');
    expect(capped).toBeCloseTo(pOf(candidateOdds(two, 120, shout), 'c6d4'), 10);
    expect(capped).toBeCloseTo(0.37, 2);
  });

  it('ignores bonuses below 1', () => {
    expect(pOf(candidateOdds(two, 120, () => 0.2), 'c6d4')).toBeCloseTo(pOf(candidateOdds(two, 120), 'c6d4'), 10);
  });
});

describe('pickCandidate with a bonus', () => {
  it('samples at the rate the odds say', () => {
    const two: Candidate[] = [
      { uci: 'c6e5', score: 0 },
      { uci: 'c6d4', score: -100 },
    ];
    const rng = mulberry32(42);
    let hits = 0;
    for (let i = 0; i < 2000; i++) if (pickCandidate(two, 120, rng, (u) => (u === 'c6d4' ? 3 : 1)) === 'c6d4') hits++;
    expect(Math.abs(hits / 2000 - 0.37)).toBeLessThan(0.05);
  });
});

describe('raidBonus', () => {
  it('is x3 for a move onto an unguarded village', () => {
    const fen = '4k3/8/2n5/8/8/8/8/4K3 b - - 0 1';
    expect(new Chess(fen).moves({ verbose: true }).some((m) => m.from + m.to === 'c6d4')).toBe(true);
    expect(raidBonus(fen, ['d4'])('c6d4')).toBe(3);
  });

  it('is 1 for a move that adds no village pressure', () => {
    // The knight already eyes d4; hopping to e5 gives that up.
    expect(raidBonus('4k3/8/2n5/8/8/8/8/4K3 b - - 0 1', ['d4'])('c6e5')).toBe(1);
  });

  it('is 2 for a move that adds one point of pressure', () => {
    const fen = '1n2k3/8/8/8/8/8/8/4K3 b - - 0 1';
    const bonus = raidBonus(fen, ['d4']);
    expect(bonus('b8c6')).toBe(2); // now attacks d4
    expect(bonus('b8a6')).toBe(1); // doesn't
  });

  it('is 1 for everything when there are no villages, and for illegal moves', () => {
    expect(raidBonus('4k3/8/2n5/8/8/8/8/4K3 b - - 0 1', [])('c6d4')).toBe(1);
    expect(raidBonus('4k3/8/2n5/8/8/8/8/4K3 b - - 0 1', ['d4'])('a1a2')).toBe(1);
  });
});

describe('chooseEnemyMove with a fake engine', () => {
  // A white pawn keeps K+N v K from being an instant draw after Nd4.
  const FEN = '4k3/8/2n5/8/8/8/P7/4K3 b - - 0 1';
  const standard = { enemy: { name: 'Test', personality: 'standard' as const }, villages: [] };
  const raiderScenario = { enemy: { name: 'Test', personality: 'raider' as const }, villages: ['d4' as const] };

  /** An engine that answers from a table of fen -> candidates and remembers what it was asked. */
  function fake(table: Record<string, Candidate[]>) {
    const asked: string[] = [];
    const engine = {
      analyse: async (fen: string) => {
        asked.push(fen);
        return table[fen] ?? [];
      },
    } as unknown as Engine;
    return { engine, asked };
  }

  const best = { uci: 'c6e5', score: 0 };

  it('never plays a shouted move outside the window', async () => {
    const { engine } = fake({ [FEN]: [best, { uci: 'c6d4', score: -500 }] });
    for (let seed = 1; seed <= 200; seed++) {
      expect(await chooseEnemyMove({ fen: FEN, scenario: standard }, engine, BRAVE, mulberry32(seed), { shout: 'c6d4' })).toBe('c6e5');
    }
  });

  describe('a shouted move missing from the engine list', () => {
    // After Nd4 it's White's turn; the reply's score is from White's side, so score 50 means Nd4 is worth -50 to Black.
    const after = new Chess(FEN);
    after.move('Nd4');
    const reply = (score: number) => ({ [FEN]: [best], [after.fen()]: [{ uci: 'e1e2', score }] });

    it('is scored with a second search and can be picked when inside the window', async () => {
      const { engine, asked } = fake(reply(50));
      const picks = new Set<string>();
      for (let seed = 1; seed <= 100; seed++) {
        picks.add(await chooseEnemyMove({ fen: FEN, scenario: standard }, engine, BRAVE, mulberry32(seed), { shout: 'c6d4' }));
      }
      expect(asked).toContain(after.fen());
      expect(picks).toEqual(new Set(['c6e5', 'c6d4']));
    });

    it('is never picked when the search puts it outside the window', async () => {
      const { engine, asked } = fake(reply(500));
      for (let seed = 1; seed <= 100; seed++) {
        expect(await chooseEnemyMove({ fen: FEN, scenario: standard }, engine, BRAVE, mulberry32(seed), { shout: 'c6d4' })).toBe('c6e5');
      }
      expect(asked).toContain(after.fen());
    });

    it('is not searched when the shout is illegal', async () => {
      const { engine, asked } = fake({ [FEN]: [best] });
      await chooseEnemyMove({ fen: FEN, scenario: standard }, engine, BRAVE, mulberry32(1), { shout: 'a1a2' });
      expect(asked).toEqual([FEN]);
    });
  });

  it('keeps a raider inside the window even when the village burn is much worse', async () => {
    const { engine } = fake({ [FEN]: [best, { uci: 'c6d4', score: -500 }] });
    for (let seed = 1; seed <= 200; seed++) {
      expect(await chooseEnemyMove({ fen: FEN, scenario: raiderScenario }, engine, BRAVE, mulberry32(seed))).toBe('c6e5');
    }
  });

  it('caps a shouting raider whose shout is also a village burn at x3', async () => {
    const { engine } = fake({ [FEN]: [best, { uci: 'c6d4', score: -100 }] });
    const rng = mulberry32(7);
    let hits = 0;
    for (let i = 0; i < 2000; i++) {
      if ((await chooseEnemyMove({ fen: FEN, scenario: raiderScenario }, engine, BRAVE, rng, { shout: 'c6d4' })) === 'c6d4') hits++;
    }
    // x3 (raid) times x3 (shout) is capped at x3, so about 37%, not 64%.
    expect(Math.abs(hits / 2000 - 0.37)).toBeLessThan(0.05);
  });

  it('still uses the raider village plan with no engine', async () => {
    expect(await chooseEnemyMove({ fen: FEN, scenario: raiderScenario }, null, BRAVE, () => 0)).toBe('c6d4');
  });

  it('is not changed by asking planIfPassed first (same seed)', async () => {
    // After 1.e4, Black to move. The engine offers the first three legal moves of whichever side is up.
    const start = new Chess();
    start.move('e4');
    const engine = {
      analyse: async (fen: string): Promise<Candidate[]> =>
        new Chess(fen)
          .moves({ verbose: true })
          .slice(0, 3)
          .map((m, i) => ({ uci: m.from + m.to + (m.promotion ?? ''), score: -i * 40 })),
    } as unknown as Engine;
    const view = { fen: start.fen(), scenario: standard };
    for (let seed = 1; seed <= 30; seed++) {
      const alone = await chooseEnemyMove(view, engine, GENTLE, mulberry32(seed));
      await planIfPassed(view, engine, GENTLE, mulberry32(seed + 1000));
      const after = await chooseEnemyMove(view, engine, GENTLE, mulberry32(seed));
      expect(after).toBe(alone);
    }
  });
});
