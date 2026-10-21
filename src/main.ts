import { Chess, type PieceSymbol, type Square } from 'chess.js';
import './style.css';
import { chooseEnemyMove, fallbackMove } from './ai/enemy';
import { Engine } from './ai/engine';
import { Battle, type TurnResult } from './game/battle';
import { DIFFICULTIES, type DifficultyId } from './game/difficulty';
import { SCENARIOS, objectiveText, type Scenario } from './game/scenarios';
import type { TacticTag } from './game/tactics';
import { threatMap } from './game/threats';
import { PIECE_NAME, PIECE_SHORT, glyph, renderBoard, type BoardView } from './ui/board';
import { PixiBoard, preloadFigurines } from './ui/pixiBoard';

// ---------- small helpers ----------

const store = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* private mode etc. — progress just won't persist */
    }
  },
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;

// ---------- state ----------

const engine = new Engine(`${import.meta.env.BASE_URL}engine/stockfish-lite.js`);
let engineStatus: 'loading' | 'ready' | 'fallback' = 'loading';
engine.ready.then((ok) => {
  engineStatus = ok ? 'ready' : 'fallback';
  if (view === 'map') renderMap();
});

let view: 'map' | 'battle' = 'map';
let difficultyId: DifficultyId = (store.get('difficulty') as DifficultyId) in DIFFICULTIES
  ? (store.get('difficulty') as DifficultyId)
  : 'squire';
const cleared = new Set<string>(JSON.parse(store.get('cleared') ?? '[]') as string[]);

let battle: Battle | null = null;
let selected: Square | null = null;
let threatSight = true;
let thinking = false;
let aiToken = 0;
let pendingPromotion: { from: Square; to: Square } | null = null;
let statusLine = '';
/** True while a move animates on the figurine board; input waits for it. */
let animating = false;

// Figurines (PixiJS) or the classic DOM board. The DOM board always renders too,
// visually hidden, so screen readers and keyboards can still play.
type BoardStyle = 'figurines' | 'classic';
let boardStyle: BoardStyle = store.get('boardStyle') === 'classic' ? 'classic' : 'figurines';
let figurines: PixiBoard | null = null;

const app = $('#app');
const difficulty = () => DIFFICULTIES[difficultyId];

// ---------- map screen ----------

function renderMap() {
  view = 'map';
  const engineNote = {
    loading: 'Summoning the enemy’s strategist (loading Stockfish)…',
    ready: 'Enemy strategist ready (Stockfish lite).',
    fallback: 'Stockfish didn’t load, so enemies will play a simple fallback AI.',
  }[engineStatus];

  app.innerHTML = `
    <header class="map-head">
      <p class="eyebrow">Battle prototype</p>
      <h1>Gauntlet</h1>
      <p class="sub">A chess tactics RPG. Your army moves by the true rules of chess.</p>
    </header>

    <section class="difficulty" aria-labelledby="diff-h">
      <h2 id="diff-h">Difficulty</h2>
      <div class="diff-grid" role="radiogroup">
        ${Object.values(DIFFICULTIES)
          .map(
            (d) => `
          <button class="diff ${d.id === difficultyId ? 'on' : ''}" role="radio"
            aria-checked="${d.id === difficultyId}" data-action="difficulty" data-id="${d.id}">
            <strong>${d.label}</strong><span>${d.blurb}</span>
          </button>`,
          )
          .join('')}
      </div>
      <p class="engine-note ${engineStatus}">${engineNote}</p>
    </section>

    <section aria-labelledby="battles-h">
      <h2 id="battles-h">The Borderlands</h2>
      <ol class="battles">
        ${SCENARIOS.map(
          (s, i) => `
          <li>
            <button class="battle-card" data-action="start" data-id="${s.id}">
              <span class="num">${i + 1}</span>
              <span class="card-body">
                <strong>${esc(s.title)}</strong>
                <span class="obj">${objectiveText(s.objective)}</span>
                <span class="intro">${esc(s.intro)}</span>
              </span>
              ${cleared.has(s.id) ? '<span class="badge">Cleared</span>' : ''}
            </button>
          </li>`,
        ).join('')}
      </ol>
    </section>`;
}

// ---------- battle screen ----------

function mountBoard() {
  figurines?.destroy();
  figurines = null;
  const stage = $('#stage');
  const dom = $('#board');
  const useFigurines = boardStyle === 'figurines';
  stage.hidden = !useFigurines;
  dom.classList.toggle('sr-only', useFigurines);
  if (!useFigurines) return;
  const board = new PixiBoard(stage, (sq) => onSquare(sq));
  figurines = board;
  board.init().then(
    () => update(),
    (err) => {
      // No WebGL, or the sprites failed to load: fall back to the classic board.
      console.warn('Figurine board failed, using the classic board', err);
      if (figurines === board) {
        board.destroy();
        figurines = null;
        stage.hidden = true;
        dom.classList.remove('sr-only');
      }
    },
  );
}

function startBattle(s: Scenario) {
  aiToken++;
  engine.stop();
  battle = new Battle(s, difficulty().rewinds);
  threatSight = difficulty().threatSight;
  selected = null;
  thinking = false;
  animating = false;
  pendingPromotion = null;
  statusLine = s.intro;
  view = 'battle';

  app.innerHTML = `
    <header class="topbar">
      <button class="ghost" data-action="map">← Map</button>
      <div class="titles">
        <p class="eyebrow">${esc(s.region)} · ${difficulty().label}</p>
        <h1>${esc(s.title)}</h1>
      </div>
    </header>
    <main class="battle-layout">
      <section class="board-wrap">
        <div class="stage" id="stage"></div>
        <div class="board" id="board" role="grid" aria-label="Chess board"></div>
        <div class="banner" id="banner" aria-live="polite"></div>
        <div id="overlay"></div>
      </section>
      <aside class="panel" id="panel"></aside>
    </main>`;
  window.scrollTo(0, 0);
  mountBoard();
  update();
}

function update() {
  if (!battle || view !== 'battle') return;
  const b = battle;
  const targets = new Set<Square>(selected ? b.legalMoves(selected).map((m) => m.to) : []);

  const boardView: BoardView = {
    chess: b.chess,
    selected,
    targets,
    lastMove: b.lastMove,
    threats: threatSight ? threatMap(b.chess, b.player) : null,
    villages: b.scenario.villages ?? [],
  };
  renderBoard($('#board'), boardView);
  figurines?.render(boardView);

  const o = b.scenario.objective;
  const meters: string[] = [];
  const left = b.movesLeft();
  if (left !== undefined) meters.push(meter('Moves left', String(Math.max(0, left))));
  if (o.kind === 'winMaterial') meters.push(meter('Material won', `${fmt(b.materialGained())} / +${o.gain}`));
  if (o.kind === 'survive') meters.push(meter('Enemy turns', `${b.enemyMoves} / ${o.turns}`));
  meters.push(meter('Pieces lost', String(b.piecesLost)));

  const turnText = b.status !== 'playing' ? '' : thinking ? 'The enemy is plotting…' : 'Your move.';

  $('#panel').innerHTML = `
    <div class="card objective">
      <p class="eyebrow">vs ${esc(b.scenario.enemy.name)}</p>
      <h2>${objectiveText(o)}</h2>
      <div class="meters">${meters.join('')}</div>
    </div>

    <div class="controls">
      <button class="primary" data-action="rewind" ${b.canRewind() ? '' : 'disabled'}
        title="Undo your last move and the enemy's reply">
        ⟲ Rewind <span class="pill">${b.rewindsLeft}</span>
      </button>
      <button data-action="threat" aria-pressed="${threatSight}"
        title="Show squares the enemy attacks and pieces you could lose">
        ◉ Threat Sight: ${threatSight ? 'On' : 'Off'}
      </button>
      <button data-action="board-style" aria-pressed="${boardStyle === 'figurines'}"
        title="Switch between illustrated figurines and standard chess pieces">
        ♞ Pieces: ${boardStyle === 'figurines' ? 'Figurines' : 'Classic'}
      </button>
      <button class="ghost" data-action="restart">Restart</button>
    </div>

    <p class="status" aria-live="polite"><strong>${turnText}</strong> ${esc(statusLine)}</p>

    <details class="card lesson" open>
      <summary>Lesson</summary>
      <p>${esc(b.scenario.lesson)}</p>
    </details>

    ${threatSight ? legend(b.scenario.villages?.length) : ''}

    <div class="card log-card">
      <p class="eyebrow">Battle log</p>
      ${logHtml(b.log)}
    </div>`;

  // Hold the victory/defeat dialog until the final move has finished animating.
  $('#overlay').innerHTML = animating ? '' : overlayHtml(b);
}

const fmt = (n: number) => (n > 0 ? `+${n}` : String(n));
const meter = (label: string, value: string) => `<div class="meter"><span>${label}</span><strong>${value}</strong></div>`;

function legend(hasVillages?: number) {
  return `
    <ul class="legend">
      <li><span class="swatch threat"></span>Squares the enemy attacks</li>
      <li><span class="swatch hanging"></span>Your piece can be won. Defend or move it!</li>
      ${hasVillages ? '<li><span class="swatch village">⌂</span>Village to protect</li>' : ''}
    </ul>`;
}

function logHtml(log: string[]) {
  if (!log.length) return '<p class="muted">No moves yet.</p>';
  const rows: string[] = [];
  for (let i = 0; i < log.length; i += 2) {
    rows.push(`<li><span class="you">${esc(log[i])}</span><span class="them">${esc(log[i + 1] ?? '')}</span></li>`);
  }
  return `<ol class="log">${rows.join('')}</ol>`;
}

function overlayHtml(b: Battle): string {
  if (pendingPromotion) {
    const opts: PieceSymbol[] = ['q', 'r', 'b', 'n'];
    return `
      <div class="overlay">
        <div class="dialog">
          <h2>Knight your squire</h2>
          <p>Choose what your pawn becomes.</p>
          <div class="promo">
            ${opts
              .map(
                (p) =>
                  `<button data-action="promote" data-piece="${p}" aria-label="${PIECE_NAME[p]}">
                    <span class="piece ally">${glyph(p)}</span><small>${PIECE_SHORT[p]}</small>
                  </button>`,
              )
              .join('')}
          </div>
          <button class="ghost" data-action="cancel-promo">Cancel</button>
        </div>
      </div>`;
  }
  if (b.status === 'playing') return '';
  const won = b.status === 'won';
  const idx = SCENARIOS.findIndex((s) => s.id === b.scenario.id);
  const next = SCENARIOS[idx + 1];
  const flawless = won && b.piecesLost === 0;
  return `
    <div class="overlay">
      <div class="dialog ${won ? 'won' : 'lost'}">
        <p class="eyebrow">${won ? 'Victory' : 'Defeat'}</p>
        <h2>${won ? 'The day is yours!' : 'The line breaks…'}</h2>
        <p>${esc(b.reason)}</p>
        ${won ? `<p class="bonus ${flawless ? 'got' : ''}">${flawless ? '★' : '☆'} Flawless: lose no pieces</p>` : ''}
        <div class="row">
          ${!won && b.canRewind() ? `<button class="primary" data-action="rewind">⟲ Rewind (${b.rewindsLeft} left)</button>` : ''}
          ${won && next ? `<button class="primary" data-action="start" data-id="${next.id}">Next: ${esc(next.title)}</button>` : ''}
          <button data-action="restart">${won ? 'Replay' : 'Retry'}</button>
          <button class="ghost" data-action="map">Map</button>
        </div>
      </div>
    </div>`;
}

// ---------- turn flow ----------

const PLAYER_BANNER: Partial<Record<TacticTag, string>> = {
  checkmate: 'Checkmate!',
  fork: 'Fork!',
  check: 'Check!',
  promotion: 'Knighted!',
  capture: 'Capture!',
};
const ENEMY_BANNER: Partial<Record<TacticTag, string>> = {
  checkmate: 'Checkmated…',
  fork: 'Enemy fork!',
  check: 'Check! Protect your king',
};

function showBanner(text: string, kind: 'ally' | 'foe') {
  const el = document.getElementById('banner');
  if (!el) return;
  el.textContent = text;
  el.className = `banner show ${kind}`;
  // Restart the CSS animation even when the same banner shows twice in a row.
  void el.offsetWidth;
  el.classList.add('animate');
}

function describe(res: TurnResult, who: 'you' | 'enemy'): string {
  const m = res.move;
  const verb = m.captured ? `takes the ${PIECE_SHORT[m.captured]} on ${m.to}` : `moves to ${m.to}`;
  return `${who === 'you' ? 'Your' : 'Enemy'} ${PIECE_SHORT[m.piece]} ${verb}.`;
}

async function playerMove(from: Square, to: Square, promotion?: PieceSymbol) {
  if (!battle) return;
  const b = battle;
  const res = b.playerMove({ from, to, promotion });
  selected = null;
  pendingPromotion = null;
  statusLine = describe(res, 'you');
  if (b.status === 'won') {
    cleared.add(b.scenario.id);
    store.set('cleared', JSON.stringify([...cleared]));
  }
  await animate(res);
  if (battle !== b) return; // left or restarted meanwhile
  const tag = res.tactics.find((t) => PLAYER_BANNER[t]);
  if (tag) showBanner(PLAYER_BANNER[tag]!, 'ally');
  update();
  if (b.isEnemyTurn()) void enemyTurn();
}

/** Plays the move's animation on the figurine board (no-op on the classic board). */
async function animate(res: TurnResult) {
  const anim = figurines?.animateMove(res.move);
  if (!anim) return;
  animating = true;
  update();
  try {
    await anim;
  } finally {
    animating = false;
  }
}

async function enemyTurn() {
  const b = battle!;
  const token = ++aiToken;
  thinking = true;
  update();
  const started = performance.now();
  let uci: string;
  try {
    uci = await chooseEnemyMove(b, engineStatus === 'fallback' ? null : engine, difficulty().ai);
  } catch (err) {
    console.warn('Enemy AI failed, using fallback', err);
    uci = fallbackMove(new Chess(b.fen));
  }
  // A short pause so the enemy's move doesn't feel instant.
  const wait = 450 - (performance.now() - started);
  if (wait > 0) await sleep(wait);
  if (token !== aiToken || battle !== b || !b.isEnemyTurn()) return; // rewound or left meanwhile

  const res = b.enemyMove(uci);
  thinking = false;
  statusLine = describe(res, 'enemy');
  await animate(res);
  if (token !== aiToken || battle !== b) return; // rewound or left during the animation
  const tag = res.tactics.find((t) => ENEMY_BANNER[t]);
  if (tag) showBanner(ENEMY_BANNER[tag]!, 'foe');
  else if (res.move.captured) showBanner('Piece lost', 'foe');
  update();
}

function onSquare(sq: Square) {
  const b = battle;
  if (!b || !b.isPlayerTurn() || thinking || animating || pendingPromotion) return;
  if (selected && b.legalMoves(selected).some((m) => m.to === sq)) {
    if (b.needsPromotion(selected, sq)) {
      pendingPromotion = { from: selected, to: sq };
      update();
    } else void playerMove(selected, sq);
    return;
  }
  const piece = b.chess.get(sq);
  selected = piece?.color === b.player && selected !== sq ? sq : null;
  update();
}

// ---------- input ----------

app.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const sqEl = target.closest<HTMLElement>('[data-sq]');
  if (sqEl) return onSquare(sqEl.dataset.sq as Square);

  const btn = target.closest<HTMLElement>('[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  switch (btn.dataset.action) {
    case 'difficulty':
      difficultyId = id as DifficultyId;
      store.set('difficulty', difficultyId);
      renderMap();
      break;
    case 'start':
      startBattle(SCENARIOS.find((s) => s.id === id)!);
      break;
    case 'map':
      aiToken++;
      engine.stop();
      battle = null;
      figurines?.destroy();
      figurines = null;
      renderMap();
      break;
    case 'board-style':
      boardStyle = boardStyle === 'figurines' ? 'classic' : 'figurines';
      store.set('boardStyle', boardStyle);
      mountBoard();
      update();
      break;
    case 'restart':
      if (battle) startBattle(battle.scenario);
      break;
    case 'rewind':
      if (battle?.canRewind() && !animating) {
        aiToken++;
        engine.stop();
        thinking = false;
        selected = null;
        battle.rewind();
        figurines?.rewindEffect();
        statusLine = 'Time folds back. Try a different move.';
        showBanner('Rewind', 'ally');
        update();
      }
      break;
    case 'threat':
      threatSight = !threatSight;
      update();
      break;
    case 'promote':
      if (pendingPromotion) void playerMove(pendingPromotion.from, pendingPromotion.to, btn.dataset.piece as PieceSymbol);
      break;
    case 'cancel-promo':
      pendingPromotion = null;
      selected = null;
      update();
      break;
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && view === 'battle') {
    selected = null;
    pendingPromotion = null;
    update();
  }
});

renderMap();
// Load the figurine art while the player looks at the map.
if (boardStyle === 'figurines') preloadFigurines().catch(() => {});
