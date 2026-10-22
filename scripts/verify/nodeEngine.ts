import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import type { Candidate, Engine } from '../../src/ai/engine';
import { parseInfo } from '../../src/ai/engine';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** The single-threaded Stockfish lite build shipped in node_modules (the same engine the game runs in the browser). */
function enginePath(): string {
  const bin = join(root, 'node_modules', 'stockfish', 'bin');
  const file = readdirSync(bin).find((f: string) => /^stockfish-.*-lite-single\.js$/.test(f));
  if (!file) throw new Error('Stockfish lite single build not found in node_modules/stockfish/bin');
  return join(bin, file);
}

/**
 * The browser `Engine`'s `analyse`, for Node: runs Stockfish as a child process speaking
 * UCI over stdin/stdout. One search at a time per instance.
 */
export class NodeEngine {
  private proc: ChildProcessWithoutNullStreams;
  private onLine: ((line: string) => void) | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  readonly ready: Promise<void>;

  constructor() {
    this.proc = spawn(process.execPath, [enginePath()], { stdio: 'pipe' });
    createInterface({ input: this.proc.stdout }).on('line', (l: string) => this.onLine?.(l.trim()));
    this.ready = this.waitFor('uci', 'uciok').then(() => this.waitFor('isready', 'readyok'));
  }

  private send(cmd: string) {
    this.proc.stdin.write(cmd + '\n');
  }

  private waitFor(command: string, reply: string): Promise<void> {
    return new Promise((resolve) => {
      this.onLine = (line) => {
        if (line.startsWith(reply)) {
          this.onLine = null;
          resolve();
        }
      };
      this.send(command);
    });
  }

  /** Returns the top `multiPv` moves for `fen`, best first (same contract as `Engine.analyse`). */
  analyse(fen: string, depth: number, multiPv: number): Promise<Candidate[]> {
    const run = async (): Promise<Candidate[]> => {
      await this.ready;
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
        this.send(`setoption name MultiPV value ${multiPv}`);
        this.send(`position fen ${fen}`);
        this.send(`go depth ${depth}`);
      });
    };
    const result = this.queue.then(run, run);
    this.queue = result.catch(() => undefined);
    return result;
  }

  /** Clears the hash so one game's search doesn't leak into the next. */
  newGame(): Promise<void> {
    const run = async () => {
      await this.ready;
      this.send('ucinewgame');
      await this.waitFor('isready', 'readyok');
    };
    const result = this.queue.then(run, run);
    this.queue = result.catch(() => undefined);
    return result;
  }

  /** This adapter, typed as the browser engine for `chooseEnemyMove` and `planShout`. */
  asEngine(): Engine {
    return this as unknown as Engine;
  }

  quit() {
    this.send('quit');
    this.proc.kill();
  }
}
