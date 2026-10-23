import { Chess } from 'chess.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Engine, parseInfo } from './engine';
import type { Candidate } from './engine';
import { candidateOdds, chooseEnemyMove, fallbackMove, habitBonus, pickCandidate, raiderMove, raidBonus, type Rng } from './enemy';

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

  describe('with a preferred (shouted) move', () => {
    it('mate beats the shout', () => {
      const chess = new Chess('6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1');
      expect(fallbackMove(chess, () => 0.99, 'g1f1')).toBe('a1a8');
    });

    it('a winning capture beats the shout', () => {
      const chess = new Chess('4k3/8/8/8/3q4/8/8/3RK3 w - - 0 1');
      expect(fallbackMove(chess, () => 0.99, 'e1f1')).toBe('d1d4');
    });

    it('is played when nothing better is on offer', () => {
      const chess = new Chess('4k3/8/8/8/8/8/P7/4K3 w - - 0 1');
      for (const r of [0, 0.5, 0.999]) expect(fallbackMove(chess, () => r, 'e1d1')).toBe('e1d1');
    });

    it('is ignored when it is illegal', () => {
      const chess = new Chess('4k3/8/8/8/8/8/P7/4K3 w - - 0 1');
      for (const r of [0, 0.5, 0.999]) {
        expect(fallbackMove(chess, () => r, 'a2a5')).toBe(fallbackMove(chess, () => r));
        expect(fallbackMove(chess, () => r, null)).toBe(fallbackMove(chess, () => r));
      }
    });
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
    const calls: { fen: string; depth: number; multiPv: number }[] = [];
    const engine = {
      analyse: async (fen: string, depth: number, multiPv: number) => {
        asked.push(fen);
        calls.push({ fen, depth, multiPv });
        return table[fen] ?? [];
      },
    } as unknown as Engine;
    return { engine, asked, calls };
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

  describe('the clamp on a shouted move missing from the list', () => {
    const worst = { uci: 'c6b4', score: -50 };
    const after = new Chess(FEN);
    after.move('Nd4');

    it('never lets the single search rate it above the worst listed move', async () => {
      // The reply search says Nd4 is worth +300 to Black, far above the engine's best (0).
      const { engine } = fake({ [FEN]: [best, worst], [after.fen()]: [{ uci: 'e1e2', score: -300 }] });
      const rng = mulberry32(11);
      const N = 2000;
      const counts: Record<string, number> = {};
      for (let i = 0; i < N; i++) {
        const m = await chooseEnemyMove({ fen: FEN, scenario: standard }, engine, BRAVE, rng, { shout: 'c6d4' });
        counts[m] = (counts[m] ?? 0) + 1;
      }
      // Clamped to -50 with x3: weights 1, e^(-50/61), 3e^(-50/61) -> the shout is about 48%.
      const w = Math.exp(-50 / 61);
      const clamped = (3 * w) / (1 + w + 3 * w);
      expect(counts.c6d4 / N).toBeLessThan(clamped + 0.05);
      expect(counts.c6d4 / N).toBeGreaterThan(clamped - 0.05);
      // Unclamped, +300 would make it the best move and push every other move out of the window.
      expect(counts.c6e5).toBeGreaterThan(0);
      expect(counts.c6b4).toBeGreaterThan(0);
    });

    it('searches the position after the shout at depth - 1 with one line', async () => {
      const { engine, calls } = fake({ [FEN]: [best, worst], [after.fen()]: [{ uci: 'e1e2', score: 50 }] });
      await chooseEnemyMove({ fen: FEN, scenario: standard }, engine, BRAVE, mulberry32(1), { shout: 'c6d4' });
      expect(calls).toEqual([
        { fen: FEN, depth: BRAVE.depth, multiPv: BRAVE.multiPv },
        { fen: after.fen(), depth: BRAVE.depth - 1, multiPv: 1 },
      ]);
    });

    it('never searches shallower than depth 1', async () => {
      const { engine, calls } = fake({ [FEN]: [best, worst], [after.fen()]: [{ uci: 'e1e2', score: 50 }] });
      await chooseEnemyMove({ fen: FEN, scenario: standard }, engine, { depth: 1, multiPv: 3, maxLoss: 120 }, mulberry32(1), { shout: 'c6d4' });
      expect(calls[1].depth).toBe(1);
    });

    it('scores a shouted checkmate without a second search, as good as the worst listed move', async () => {
      // Black to move: Ra1# mates (the white king is boxed in by its own pawns). A draw (0) would fall outside the window of a +300 list, so only the mate score keeps it in.
      const mateFen = 'r5k1/8/8/8/8/8/5PPP/6K1 b - - 0 1';
      const { engine, asked } = fake({ [mateFen]: [{ uci: 'a8a7', score: 300 }, { uci: 'a8a6', score: 250 }] });
      const picks = new Set<string>();
      for (let seed = 1; seed <= 100; seed++) {
        picks.add(await chooseEnemyMove({ fen: mateFen, scenario: standard }, engine, BRAVE, mulberry32(seed), { shout: 'a8a1' }));
      }
      expect(picks.has('a8a1')).toBe(true);
      expect(new Set(asked)).toEqual(new Set([mateFen]));
    });

    it('scores a shouted stalemate as a draw (0) without a second search', async () => {
      // Black to move: Qe3 stalemates the lone white king on h1.
      const drawFen = '8/4q3/8/8/8/6k1/8/7K b - - 0 1';
      const listed = [{ uci: 'e7e6', score: -10 }, { uci: 'e7e5', score: -20 }];
      const { engine, asked } = fake({ [drawFen]: listed });
      const picks = new Set<string>();
      for (let seed = 1; seed <= 100; seed++) {
        picks.add(await chooseEnemyMove({ fen: drawFen, scenario: standard }, engine, BRAVE, mulberry32(seed), { shout: 'e7e3' }));
      }
      expect(picks.has('e7e3')).toBe(true);
      expect(new Set(asked)).toEqual(new Set([drawFen]));
      // A draw is worth 0, which is far below a winning list, so it falls outside the window.
      const winning = fake({ [drawFen]: [{ uci: 'e7e6', score: 400 }, { uci: 'e7e5', score: 390 }] });
      for (let seed = 1; seed <= 50; seed++) {
        expect(await chooseEnemyMove({ fen: drawFen, scenario: standard }, winning.engine, BRAVE, mulberry32(seed), { shout: 'e7e3' })).not.toBe('e7e3');
      }
    });
  });

  it('scores the stalemate shout the same as the best-listed 0 only when it fits the window', async () => {
    // Guards the isGameOver -> 0 score: with a list at +100 the draw (0) is within Brave's 120.
    const drawFen = '8/4q3/8/8/8/6k1/8/7K b - - 0 1';
    const { engine } = fake({ [drawFen]: [{ uci: 'e7e6', score: 100 }, { uci: 'e7e5', score: 90 }] });
    const picks = new Set<string>();
    for (let seed = 1; seed <= 200; seed++) {
      picks.add(await chooseEnemyMove({ fen: drawFen, scenario: standard }, engine, BRAVE, mulberry32(seed), { shout: 'e7e3' }));
    }
    expect(picks.has('e7e3')).toBe(true);
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

  it('plays the standing shout with no engine in a quiet position', async () => {
    const view = { fen: FEN, scenario: standard };
    for (const r of [0, 0.5, 0.999]) {
      expect(await chooseEnemyMove(view, null, BRAVE, () => r, { shout: 'c6e5' })).toBe('c6e5');
    }
    // Without the shout the same rng picks other moves, so the shout is what decided it.
    const plain = new Set<string>();
    for (const r of [0, 0.5, 0.999]) plain.add(await chooseEnemyMove(view, null, BRAVE, () => r));
    expect(plain.size).toBeGreaterThan(1);
  });
});

describe('habitBonus', () => {
  const FEN = '4k3/8/2n5/8/8/8/P7/4K3 b - - 0 1';
  const raiderView = { fen: FEN, scenario: { enemy: { name: 'Test', personality: 'raider' as const }, villages: ['d4' as const] } };
  const standardView = { fen: FEN, scenario: { enemy: { name: 'Test', personality: 'standard' as const }, villages: ['d4' as const] } };

  it('applies both the village multiplier and the shout multiplier to a shouting raider', () => {
    // Nd4 burns the village (x3). Ne5 is shouted (x3) but adds no pressure. Nb8 is neither.
    const bonus = habitBonus(raiderView, { shout: 'c6e5' });
    expect(bonus('c6d4')).toBe(3);
    expect(bonus('c6e5')).toBe(3);
    expect(bonus('c6b8')).toBe(1);
  });

  it('multiplies the two when they land on the same move (the cap comes later)', () => {
    expect(habitBonus(raiderView, { shout: 'c6d4' })('c6d4')).toBe(9);
  });

  it('ignores villages for a non-raider and the shout when there is none', () => {
    expect(habitBonus(standardView, { shout: 'c6e5' })('c6d4')).toBe(1);
    expect(habitBonus(standardView, { shout: 'c6e5' })('c6e5')).toBe(3);
    expect(habitBonus(raiderView, {})('c6d4')).toBe(3);
    expect(habitBonus(raiderView, { shout: null })('c6e5')).toBe(1);
  });

  it('gives the village move its exact share of the odds when the shout is elsewhere', () => {
    const cands: Candidate[] = [
      { uci: 'c6e5', score: 0 },
      { uci: 'c6d4', score: -100 },
      { uci: 'c6b8', score: -100 },
    ];
    const odds = candidateOdds(cands, 120, habitBonus(raiderView, { shout: 'c6e5' }));
    const spread = 120 / 2 + 1;
    const wD = 3 * Math.exp(-100 / spread);
    const wB = Math.exp(-100 / spread);
    const total = 3 + wD + wB;
    expect(pOf(odds, 'c6d4')).toBeCloseTo(wD / total, 10);
    expect(pOf(odds, 'c6e5')).toBeCloseTo(3 / total, 10);
    expect(pOf(odds, 'c6b8')).toBeCloseTo(wB / total, 10);
  });
});
