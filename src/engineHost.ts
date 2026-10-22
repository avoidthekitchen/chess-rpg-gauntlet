import { Engine, type Candidate } from './ai/engine';

/** One Stockfish worker for the whole game, started at boot so it's warm by the first battle. */
const raw = new Engine(`${import.meta.env.BASE_URL}engine/stockfish-lite.js`);

export let engineStatus: 'loading' | 'ready' | 'fallback' = 'loading';
raw.ready.then((ok) => {
  if (engineStatus === 'loading') engineStatus = ok ? 'ready' : 'fallback';
});

/** A search that takes longer than this means the worker is stuck; play on with the fallback AI. */
const SEARCH_TIMEOUT_MS = 12_000;

/**
 * The engine as the game uses it: same API, but a search that never answers (a crashed or
 * hung worker) resolves with no candidates after a timeout and switches the game to the
 * simple fallback AI, instead of leaving "The enemy is plotting…" up forever.
 */
export const engine = {
  ready: raw.ready,
  analyse(fen: string, depth: number, multiPv: number): Promise<Candidate[]> {
    if (engineStatus === 'fallback') return Promise.resolve([]);
    let timer = 0;
    const timeout = new Promise<Candidate[]>((resolve) => {
      timer = window.setTimeout(() => {
        console.warn('Stockfish stopped answering; switching to the fallback AI');
        engineStatus = 'fallback';
        resolve([]);
      }, SEARCH_TIMEOUT_MS);
    });
    return Promise.race([raw.analyse(fen, depth, multiPv).finally(() => clearTimeout(timer)), timeout]);
  },
  stop() {
    raw.stop();
  },
} as unknown as Engine;
