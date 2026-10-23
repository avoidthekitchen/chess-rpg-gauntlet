import { Chess, type Square } from 'chess.js';
import { AMBUSH_HELP, ambushMissText, hintAmbush, isDoubleCheck, moveAmbush, nextAmbushWave, uciMove, wavePuzzle, type AmbushPuzzle } from '../game/ambush';
import { beginPilot, newPilot, pilotGone, settlePilot, type PilotState } from '../game/ambushPilot';
import { assignCharacters, STARTERS, type StarterType } from '../game/campaign';
import { DIFFICULTIES, type DifficultyId } from '../game/difficulty';
import { lossCost } from '../game/economy';
import { posterTarget } from '../game/poster';
import { TWO_AT_ONCE as DEF } from '../game/region2Ambush';
import { loadPilot, persistPilot } from '../pilotSave';
import { closeModal, esc, isModalOpen, showModal } from '../ui/overlay';
import { BOARD_SPAN, BOARD_TALL, PhaserBoard, type PieceStyle } from '../ui/phaserBoard';
import { BaseScene } from '../ui/screen';
import { coverImage } from '../ui/widgets';
import '../ui/ambush.css';

type Phase = 'launcher' | 'teaching' | 'demonstrating' | 'taught' | 'setup' | 'solving' | 'replying' | 'waveWon' | 'won' | 'lost';
const pause = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
const pieceName = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };

/** A dev-only encounter pilot. Chess and settlement rules live in src/game. */
export class AmbushScene extends BaseScene {
  private pilot!: PilotState;
  private phase: Phase = 'launcher';
  private chess = new Chess();
  private puzzle: AmbushPuzzle = DEF.show;
  private solver: 'w' | 'b' = 'w';
  private board: PhaserBoard | null = null;
  private hud!: HTMLDivElement;
  private session = 0;
  private busy = false;
  private selected: Square | null = null;
  private lastMove: { from: Square; to: Square } | null = null;
  private hintSquare: Square | null = null;
  private poster: Square | null = null;
  private names: Record<string, string> = {};
  private message = '';
  private celebration = '';
  private style: PieceStyle = 'tokens';

  constructor() { super('ambush'); }

  init() {
    this.session++;
    this.pilot = loadPilot(DEF);
    this.phase = 'launcher';
    this.busy = false;
    this.board = null;
    this.selected = this.hintSquare = this.poster = null;
    this.lastMove = null;
    this.message = this.pilot.result?.interrupted ? 'Your interrupted attempt counted as a retreat. You can start again below.' : '';
    this.celebration = '';
    this.hud = document.createElement('div');
    this.hud.className = 'ambush-hud';
    this.hud.id = 'ambush-ui';
    document.body.appendChild(this.hud);
    this.hud.addEventListener('click', e => {
      const button = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
      if (button && !button.disabled && !isModalOpen()) this.action(button.dataset.action!);
    });
    this.events.once('shutdown', () => {
      this.session++;
      settlePilot(this.pilot, DEF, true);
      persistPilot(this.pilot);
      this.hud.remove();
      closeModal();
    });
    this.preparePuzzle(DEF.show);
  }

  protected canRebuild() { return !this.busy && !this.board?.busy; }

  private layout() {
    const wide = this.W >= 640 && this.W > this.H;
    const top = 68 + this.safe.top;
    if (wide) {
      const width = Math.min(650, (this.H - top - 24) * BOARD_SPAN / BOARD_TALL, this.W * 0.57);
      const remaining = this.W - width - 64;
      const panelWidth = Math.min(380, remaining);
      const x = Math.max(16, (this.W - width - panelWidth - 32) / 2);
      return { x, y: top, width, panelX: x + width + 28, panelY: top + 12, panelWidth, wide };
    }
    const width = Math.min(this.W - 8, (this.H - top - 180 - this.safe.bottom) * BOARD_SPAN / BOARD_TALL);
    return { x: (this.W - width) / 2, y: top, width, panelX: 12, panelY: top + width * BOARD_TALL / BOARD_SPAN + 2, panelWidth: this.W - 24, wide };
  }

  protected build() {
    coverImage(this, 'bg-battle-bog', 0.4);
    const L = this.layout();
    this.board = new PhaserBoard(this, L.x, L.y, L.width, {
      faction: 'bog', style: this.style, intro: false, flipped: this.solver === 'b', allyColor: this.solver,
      onSquare: square => this.onSquare(square),
    });
    this.refresh();
  }

  private preparePuzzle(p: AmbushPuzzle) {
    this.puzzle = p;
    this.chess = new Chess(p.fen);
    this.solver = this.chess.turn() === 'w' ? 'b' : 'w';
    this.names = assignCharacters(p.fen, this.pilot.save.roster, this.solver);
    this.selected = this.hintSquare = this.poster = null;
    this.lastMove = null;
    this.celebration = '';
  }

  private btn(action: string, text: string, primary = false, disabled = false) {
    return `<button data-action="${action}" class="${primary ? 'primary' : ''}" ${disabled ? 'disabled' : ''}>${esc(text)}</button>`;
  }

  private refresh() {
    const targets = this.selected && this.phase === 'solving' && !this.busy
      ? new Set(this.chess.moves({ square: this.selected, verbose: true }).map(m => m.to)) : new Set<Square>();
    // Same from/to highlights just the piece, without revealing a destination.
    const mark = this.hintSquare ?? this.poster;
    this.board?.render({ chess: this.chess, selected: this.selected, targets, lastMove: this.lastMove, threats: null, villages: [], hint: mark ? { from: mark, to: mark } : null });
    this.renderHud();
  }

  private renderHud() {
    const save = this.pilot.save;
    const run = this.pilot.run;
    const L = this.layout();
    this.hud.classList.toggle('compact', this.H < 650);
    if (this.phase === 'launcher') {
      const gone = pilotGone(this.pilot, DEF);
      const cleared = save.cleared.includes(DEF.id);
      this.hud.innerHTML = `<div class="ambush-launcher"><section class="ambush-card">
        <p class="ambush-eyebrow">Pawnshire · The Kingsroad · Local pilot</p>
        <h1>Two at once</h1><p class="ambush-deck">One stolen banner. Four waves. Two checks.</p>
        <div class="ambush-story">${DEF.before.map(s => `<p>${esc(s)}</p>`).join('')}</div>
        <div class="ambush-pills"><span>4 waves</span><span>Double check</span><span>20g + two 5g bonuses</span></div>
        <fieldset><legend>Choose your help</legend><div class="ambush-options">${Object.values(DIFFICULTIES).map(d => `<button data-action="difficulty:${d.id}" aria-pressed="${save.difficulty === d.id}">${d.label}</button>`).join('')}</div></fieldset>
        <p class="ambush-rules">${this.helpText()}</p>
        <fieldset><legend>Your companion</legend><div class="ambush-options">${(['n', 'b', 'r'] as const).map(t => `<button data-action="starter:${t}" aria-pressed="${save.starter === t}">${STARTERS[t].name}</button>`).join('')}</div></fieldset>
        <div class="ambush-progress"><strong>${save.gold}g</strong> · ${cleared ? 'Banner recovered' : gone ? 'Ambush lost for good' : 'Banner still held'} · ${save.bonusesEarned.length}/2 bonuses</div>
        ${this.message ? `<p class="ambush-notice" role="status">${esc(this.message)}</p>` : ''}
        ${gone ? '<p class="ambush-notice">This Grandmaster attempt is gone. Reset the pilot to try again.</p>' : ''}
        <div class="ambush-actions">${this.btn('start', cleared ? 'Replay ambush' : run?.status === 'lost' ? 'Retry ambush' : 'Enter the ambush', true, gone)}${this.btn('reset', 'Reset pilot')}</div>
        <p class="ambush-footnote">A standalone encounter with temporary goblin art. Your campaign save stays separate. Changing settings starts a fresh pilot.</p>
        <p class="ambush-footnote">Published chess positions from Lichess · CC0</p>
      </section></div>`;
      return;
    }
    const teaching = ['teaching', 'demonstrating', 'taught'].includes(this.phase);
    const help = AMBUSH_HELP[save.difficulty];
    const misses = run ? (help.misses === null ? `${run.misses} misses · unlimited tries` : `${run.misses}/${help.misses} misses`) : '';
    const coach = teaching ? DEF.showLines[save.starter]
      : run && (help.coaching === 'all' || (help.coaching === 'first' && run.wave === 0)) ? DEF.waves[run.wave].line : '';
    let actions = '';
    if (this.phase === 'teaching') actions = this.btn('watch', 'Show me', true) + this.btn('begin', 'Skip example');
    else if (this.phase === 'demonstrating') actions = this.btn('begin', 'Skip to the ambush');
    else if (this.phase === 'taught') actions = this.btn('begin', 'Face the first wave', true) + this.btn('watch', 'Watch again');
    else if (this.phase === 'solving' || this.phase === 'replying' || this.phase === 'setup') actions = help.hints ? this.btn('hint', 'Hint: show a piece', false, this.phase !== 'solving' || this.busy) : '<span class="ambush-nohelp">No hints on this difficulty</span>';
    else if (this.phase === 'waveWon') actions = this.btn('next', 'Next wave', true);
    else if (this.phase === 'won' || this.phase === 'lost') actions = this.btn('home', 'Back to camp', true) + (!pilotGone(this.pilot, DEF) ? this.btn('again', this.phase === 'won' ? 'Replay for bonuses' : 'Retry ambush') : '');
    const result = this.pilot.result;
    const resultHtml = this.phase === 'won' && result ? `<div class="ambush-result"><strong>+${result.payout!.total}g</strong> · ${save.gold}g in your purse<br>${DEF.after.map(esc).join(' ')}</div>`
      : this.phase === 'lost' && result ? `<div class="ambush-result">Retreat cost: ${result.cost}g · ${save.gold}g left.${pilotGone(this.pilot, DEF) ? '<br>This ambush is gone. Reset at camp to try again.' : '<br>The lost wave gets a fresh position on retry.'}</div>` : '';
    const title = teaching ? 'A trick before the toll' : this.phase === 'won' ? 'The banner is yours' : this.phase === 'lost' ? 'The line breaks' : `Wave ${(run?.wave ?? 0) + 1} of 4`;
    const name = this.selected ? this.names[this.selected] : undefined;
    const posterPoint = this.poster && this.board ? this.board.squareCenter(this.poster) : null;
    this.hud.innerHTML = `<header class="ambush-top">${this.btn('leave', '← Camp')}<div><span class="ambush-eyebrow">The Kingsroad</span><strong>Two at once</strong></div>${this.btn('style', this.style === 'tokens' ? 'Classic pieces' : 'Animal pieces')}</header>
      ${posterPoint ? `<span class="ambush-poster" style="left:${posterPoint.x}px;top:${posterPoint.y + this.board!.H * 0.22}px" aria-label="Wanted: opening attack target on ${this.poster}">WANTED</span>` : ''}
      <section class="ambush-panel" style="left:${L.panelX}px;top:${L.panelY}px;width:${L.panelWidth}px;max-height:${this.H - L.panelY - 8 - this.safe.bottom}px" aria-label="Ambush controls">
        <div class="ambush-panel-scroll" tabindex="0" aria-label="Encounter status and companion advice">
        <div class="ambush-panel-top"><span class="ambush-eyebrow">${teaching ? 'Show one · no stakes' : `${DIFFICULTIES[save.difficulty].label} · ${misses}`}</span><span class="ambush-side">You play ${this.solver === 'w' ? 'White' : 'Black'}</span></div>
        <h2>${title}</h2>
        ${!teaching ? `<div class="ambush-waves" aria-label="Wave progress">${DEF.waves.map((_, i) => `<span class="${i < (run?.wave ?? 0) || this.phase === 'won' ? 'done' : i === run?.wave ? 'current' : ''}">${i + 1}</span>`).join('')}</div>` : ''}
        <p class="ambush-status" role="status">${esc(this.celebration || this.message || 'Find the double check. Tap a piece, then its destination.')}</p>
        ${name && this.phase === 'solving' ? `<p class="ambush-name">${esc(name)}</p>` : ''}
        ${coach ? `<p class="ambush-coach"><strong>${STARTERS[save.starter].name}:</strong> ${esc(coach)}</p>` : ''}
        ${resultHtml}
        ${!teaching && run ? `<p class="ambush-bonuses">${run.misses === 0 ? '☆' : '–'} Clean +5g &nbsp; ${run.hintsUsed === 0 ? '☆' : '–'} No hints +5g</p>` : ''}
        <p class="ambush-source">Lichess ${esc(this.puzzle.id)} · rated ${this.puzzle.rating}${run?.backupWave === run?.wave && !teaching ? ' · retry position' : ''}</p>
        </div><div class="ambush-actions">${actions}</div>
      </section>`;
  }

  private helpText() {
    const help = AMBUSH_HELP[this.pilot.save.difficulty];
    return help.misses === null ? 'Unlimited tries, a hint button and a little coaching. No gold lost on retreat.'
      : `${help.misses} misses end the attempt. ${help.hints ? 'Hints are available.' : 'No hints or wave coaching.'} Retreat costs ${this.pilot.save.difficulty === 'knight' ? '10%' : '25%'} of your gold.${this.pilot.save.difficulty === 'grandmaster' ? ' An uncleared loss removes the ambush.' : ''}`;
  }

  private action(action: string) {
    if (action === 'leave') return this.leave();
    if (action === 'home') return this.home();
    if (action === 'style') {
      if (this.busy) return;
      this.style = this.style === 'tokens' ? 'classic' : 'tokens';
      this.rebuild(); return;
    }
    if (action === 'reset' || action.startsWith('difficulty:') || action.startsWith('starter:')) {
      const difficulty = action.startsWith('difficulty:') ? action.split(':')[1] as DifficultyId : this.pilot.save.difficulty;
      const starter = action.startsWith('starter:') ? action.split(':')[1] as StarterType : this.pilot.save.starter;
      if (action !== 'reset' && difficulty === this.pilot.save.difficulty && starter === this.pilot.save.starter) return;
      const reset = () => { this.pilot = newPilot(difficulty, starter); persistPilot(this.pilot); this.message = 'Fresh purse, fresh road. Your campaign is unchanged.'; this.renderHud(); };
      if (this.pilot.save.battlesFought) showModal({ title: 'Start a fresh pilot?', html: '<p>This resets only your pilot rewards and attempts. Your campaign stays as it is.</p>', buttons: [{ label: 'Reset pilot', kind: 'primary', onClick: reset }, { label: 'Keep progress', onClick: () => {} }], onDismiss: () => {} });
      else reset();
      return;
    }
    if (action === 'start' || action === 'again') {
      if (pilotGone(this.pilot, DEF)) return;
      if (this.pilot.save.cleared.includes(DEF.id) || this.pilot.run?.status === 'lost') return this.begin();
      this.session++;
      this.phase = 'teaching';
      this.preparePuzzle(DEF.show);
      this.message = 'Watch how one move can give two checks.';
      this.rebuild(); return;
    }
    if (action === 'begin') return this.begin();
    if (action === 'watch' && !this.busy) { void this.demonstrate(); return; }
    if (action === 'next' && this.pilot.run?.status === 'waveWon' && !this.busy) {
      this.pilot.run = nextAmbushWave(DEF, this.pilot.run);
      persistPilot(this.pilot);
      void this.setupWave(); return;
    }
    if (action === 'hint' && this.phase === 'solving' && !this.busy && this.pilot.run) {
      const hint = hintAmbush(DEF, this.pilot.run);
      this.pilot.run = hint.run;
      this.hintSquare = hint.square;
      this.message = 'The green square shows the piece to move.';
      persistPilot(this.pilot); this.refresh();
    }
  }

  private begin() {
    this.session++;
    this.busy = false;
    if (!beginPilot(this.pilot, DEF)) return;
    persistPilot(this.pilot);
    void this.setupWave();
  }

  private async setupWave() {
    const token = ++this.session;
    this.busy = false;
    this.phase = 'setup';
    this.preparePuzzle(wavePuzzle(DEF, this.pilot.run!));
    this.poster = posterTarget(this.puzzle.fen, this.puzzle.moves[0]);
    const target = this.poster ? this.chess.get(this.poster) : undefined;
    this.message = target ? this.pilot.save.difficulty === 'squire' ? `Their opening attack targets your ${pieceName[target.type]}. Watch the marked square.` : 'Their opening target is marked. Watch the attack.' : 'The bandits make their opening move…';
    this.rebuild();
    await pause(this.poster ? 1500 : 750);
    if (token !== this.session) return;
    await this.play(this.puzzle.moves[0], token);
    if (token !== this.session) return;
    this.poster = null;
    this.phase = 'solving';
    this.message = this.chess.isCheck() ? 'Your king is in check. Find a reply that gives two checks.' : 'Find the double check. Tap a piece, then its destination.';
    this.refresh();
    this.flushLayout();
  }

  private async demonstrate() {
    const token = ++this.session;
    this.phase = 'demonstrating';
    this.preparePuzzle(DEF.show);
    this.message = 'First, watch the enemy king move.';
    this.rebuild();
    await pause(650);
    if (token !== this.session) return;
    for (let i = 0; i < this.puzzle.moves.length; i++) {
      if (i === 1) {
        this.hintSquare = this.puzzle.moves[i].slice(0, 2) as Square;
        this.message = 'This knight can check and uncover the rook.';
        this.refresh();
        await pause(1100);
        if (token !== this.session) return;
      }
      await this.play(this.puzzle.moves[i], token);
      if (token !== this.session) return;
    }
    this.hintSquare = null;
    this.phase = 'taught';
    this.message = 'Double check! The knight and rook both check the king. Here, it is also mate.';
    this.refresh();
    this.flushLayout();
  }

  private async play(uci: string, token: number) {
    const m = this.chess.move(uciMove(uci));
    this.lastMove = { from: m.from, to: m.to };
    this.selected = null;
    const name = this.names[m.from];
    delete this.names[m.from]; delete this.names[m.to];
    if (name) this.names[m.to] = name;
    this.busy = true;
    const animation = this.board?.animateMove(m);
    this.refresh();
    await animation;
    if (token !== this.session) return;
    this.busy = false;
    this.refresh();
  }

  private onSquare(square: Square) {
    if (this.phase !== 'solving' || this.busy || isModalOpen()) return;
    if (this.selected) {
      const legal = this.chess.moves({ square: this.selected, verbose: true }).filter(m => m.to === square);
      if (legal.length) {
        const from = this.selected;
        if (legal[0].promotion) {
          showModal({ title: 'Choose your promotion', buttons: legal.map(m => ({ label: pieceName[m.promotion!], onClick: () => { void this.attempt(from + square + m.promotion); } })), onDismiss: () => {} });
        } else void this.attempt(from + square);
        return;
      }
    }
    this.selected = this.chess.get(square)?.color === this.solver && this.selected !== square ? square : null;
    this.refresh();
  }

  private async attempt(uci: string) {
    if (this.phase !== 'solving' || this.busy || !this.pilot.run) return;
    const token = this.session;
    const outcome = moveAmbush(DEF, this.pilot.run, uci);
    if (outcome.verdict === 'ignored') return;
    const previousNames = { ...this.names };
    this.pilot.run = outcome.run;
    settlePilot(this.pilot, DEF);
    persistPilot(this.pilot);
    this.phase = 'replying';
    this.hintSquare = null;
    this.message = outcome.verdict === 'miss' ? 'That move misses the idea. Let’s look again.' : 'Your move…';
    for (let i = 0; i < outcome.moves.length; i++) {
      await this.play(outcome.moves[i], token);
      if (token !== this.session) return;
      if (i === 0 && outcome.doubleCheck && isDoubleCheck(this.chess)) {
        this.celebration = 'DOUBLE CHECK!';
        this.refresh();
        await pause(950);
        if (token !== this.session) return;
        this.celebration = '';
      }
      if (i < outcome.moves.length - 1) {
        this.message = 'The bandits answer…'; this.refresh();
        await pause(350);
        if (token !== this.session) return;
      }
    }
    if (outcome.verdict === 'miss') {
      this.chess = new Chess(outcome.run.fen);
      this.names = previousNames;
      this.lastMove = null;
      this.message = ambushMissText(outcome.run);
    } else this.message = outcome.run.status === 'solving' ? 'Good. Keep going: finish the line.' : outcome.run.status === 'won' ? 'Four waves broken. The banner is yours.' : 'Wave cleared. The next squad is waiting.';
    this.phase = outcome.run.status;
    if (this.phase === 'won') this.board?.celebrate();
    this.refresh();
    this.flushLayout();
  }

  private home() {
    this.session++;
    this.busy = false;
    settlePilot(this.pilot, DEF, true);
    persistPilot(this.pilot);
    this.phase = 'launcher';
    this.preparePuzzle(DEF.show);
    this.message = '';
    this.rebuild();
  }

  private leave() {
    if (this.pilot.run && !this.pilot.run.settled && ['setup', 'solving', 'replying', 'waveWon'].includes(this.phase)) {
      const cost = lossCost(this.pilot.save.difficulty, this.pilot.save.gold);
      showModal({ title: 'Retreat from the ambush?', html: `<p>This ends the attempt and costs ${cost}g.${this.pilot.save.difficulty === 'grandmaster' && !this.pilot.save.cleared.includes(DEF.id) ? ' This uncleared ambush will be lost for good.' : ''}</p>`, buttons: [{ label: 'Keep fighting', kind: 'primary', onClick: () => {} }, { label: 'Retreat', onClick: () => this.home() }], onDismiss: () => {} });
    } else this.home();
  }
}
