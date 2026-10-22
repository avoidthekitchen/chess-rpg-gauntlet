import { Chess } from 'chess.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Engine, parseInfo } from './engine';
import { fallbackMove, pickCandidate, raiderMove } from './enemy';

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
