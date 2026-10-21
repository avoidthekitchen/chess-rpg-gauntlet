import { Engine } from './ai/engine';

/** One Stockfish worker for the whole game, started at boot so it's warm by the first battle. */
export const engine = new Engine(`${import.meta.env.BASE_URL}engine/stockfish-lite.js`);

export let engineStatus: 'loading' | 'ready' | 'fallback' = 'loading';
engine.ready.then((ok) => (engineStatus = ok ? 'ready' : 'fallback'));
