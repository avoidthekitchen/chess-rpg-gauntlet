import { Engine } from './ai/engine';

/** One Stockfish worker for the whole game, started at boot so it's warm by the first battle. */
export const engine = new Engine(`${import.meta.env.BASE_URL}engine/stockfish-lite.js`);

export let engineStatus: 'loading' | 'ready' | 'fallback' = 'loading';
engine.ready.then((ok) => {
  if (engineStatus === 'loading') engineStatus = ok && !engine.failed ? 'ready' : 'fallback';
});
// A crashed or stuck worker switches the game to the simple fallback AI instead of hanging a battle.
engine.onFailure = () => (engineStatus = 'fallback');
