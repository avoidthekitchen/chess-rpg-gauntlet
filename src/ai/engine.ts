/** A candidate move from Stockfish, scored from the side to move's point of view. */
export interface Candidate {
  uci: string;
  /** Centipawns. Forced mates are mapped to very large values. */
  score: number;
}

const MATE = 100_000;

/** Parses one UCI `info` line into a candidate, or null if it has no score/pv. */
export function parseInfo(line: string): { rank: number; candidate: Candidate } | null {
  if (!line.startsWith('info ') || !line.includes(' pv ')) return null;
  const rank = Number(/ multipv (\d+)/.exec(line)?.[1] ?? 1);
  const cp = / score cp (-?\d+)/.exec(line);
  const mate = / score mate (-?\d+)/.exec(line);
  const uci = / pv (\S+)/.exec(line)?.[1];
  if (!uci || (!cp && !mate)) return null;
  let score: number;
  if (cp) score = Number(cp[1]);
  else {
    const m = Number(mate![1]);
    // Faster mates score higher; being mated scores very low.
    score = m > 0 ? MATE - m * 100 : -MATE - m * 100;
  }
  return { rank, candidate: { uci, score } };
}

/**
 * Talks UCI to the Stockfish WASM build running in a Web Worker.
 * One search runs at a time; `stop()` cancels the current one.
 */
export class Engine {
  private worker: Worker | null = null;
  private onLine: ((line: string) => void) | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  readonly ready: Promise<boolean>;

  constructor(url: string) {
    this.ready = this.boot(url);
  }

  private async boot(url: string): Promise<boolean> {
    try {
      this.worker = new Worker(url);
    } catch (err) {
      console.warn('Stockfish failed to start, using fallback AI', err);
      return false;
    }
    this.worker.onmessage = (e: MessageEvent) => {
      const text = typeof e.data === 'string' ? e.data : String(e.data);
      for (const line of text.split('\n')) this.onLine?.(line.trim());
    };
    this.worker.onerror = (e) => console.warn('Stockfish worker error', e.message);
    const ok = await this.waitFor('uci', 'uciok', 15_000);
    if (!ok) return false;
    return this.waitFor('isready', 'readyok', 5_000);
  }

  private waitFor(command: string, reply: string, timeoutMs: number): Promise<boolean> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.onLine = null;
        resolve(false);
      }, timeoutMs);
      this.onLine = (line) => {
        if (line.startsWith(reply)) {
          clearTimeout(timer);
          this.onLine = null;
          resolve(true);
        }
      };
      this.worker!.postMessage(command);
    });
  }

  /** Returns the top `multiPv` moves for `fen`, best first. */
  analyse(fen: string, depth: number, multiPv: number): Promise<Candidate[]> {
    const run = async (): Promise<Candidate[]> => {
      if (!(await this.ready) || !this.worker) return [];
      return new Promise((resolve) => {
        const byRank = new Map<number, Candidate>();
        this.onLine = (line) => {
          const info = parseInfo(line);
          if (info) byRank.set(info.rank, info.candidate);
          if (line.startsWith('bestmove')) {
            this.onLine = null;
            const best = line.split(' ')[1];
            const list = [...byRank.entries()].sort((a, b) => a[0] - b[0]).map(([, c]) => c);
            if (list.length === 0 && best && best !== '(none)') list.push({ uci: best, score: 0 });
            resolve(list);
          }
        };
        const w = this.worker!;
        w.postMessage(`setoption name MultiPV value ${multiPv}`);
        w.postMessage(`position fen ${fen}`);
        w.postMessage(`go depth ${depth}`);
      });
    };
    const result = this.queue.then(run, run);
    this.queue = result.catch(() => undefined);
    return result;
  }

  /** Ends the current search early; its promise still resolves with what it found. */
  stop() {
    this.worker?.postMessage('stop');
  }
}
