import { Chess, type Square } from 'chess.js';
import { AMBUSH_HELP, hintAmbush, isDoubleCheck, moveAmbush, nextAmbushWave, uciMove, wavePuzzle, type AmbushPuzzle } from '../game/ambush';
import { STARTERS } from '../game/campaign';
import { courseLesson, courseRegion, type CourseLesson } from '../game/curriculum';
import { DIFFICULTIES } from '../game/difficulty';
import { beginJourneyLesson, lessonUnlocked, settleJourney, type JourneySave } from '../game/journey';
import { loadJourney, persistJourney } from '../journeySave';
import { store } from '../store';
import { closeModal, esc, isModalOpen, showModal } from '../ui/overlay';
import { BOARD_SPAN, BOARD_TALL, PhaserBoard, type PieceStyle } from '../ui/phaserBoard';
import { BaseScene, goTo } from '../ui/screen';
import { coverImage } from '../ui/widgets';
import '../ui/ambush.css';
import '../ui/journey.css';

type Phase = 'briefing' | 'teaching' | 'demonstrating' | 'taught' | 'setup' | 'solving' | 'replying' | 'waveWon' | 'won' | 'lost';
const pause = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
const pieceNames = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };

/** The published puzzle runner: presentation only; progress and chess stay in game/. */
export class CoursePlayScene extends BaseScene {
  private save!: JourneySave;
  private lesson!: CourseLesson;
  private phase: Phase = 'briefing';
  private chess = new Chess();
  private puzzle!: AmbushPuzzle;
  private solver: 'w' | 'b' = 'w';
  private board: PhaserBoard | null = null;
  private hud!: HTMLDivElement;
  private session = 0;
  private busy = false;
  private selected: Square | null = null;
  private lastMove: { from: Square; to: Square } | null = null;
  private hintSquare: Square | null = null;
  private message = '';
  private celebration = '';
  private style: PieceStyle = 'tokens';
  private exampleOnly = false;
  private valid = false;

  constructor() { super('course-play'); }

  init(data: { lessonId?: string; exampleOnly?: boolean } = {}) {
    this.session++;
    this.valid = false;
    const save = loadJourney();
    const lesson = courseLesson(data.lessonId ?? '');
    if (!save || !lesson || !lessonUnlocked(save, lesson.id)) {
      goTo(this.game, 'journey'); return;
    }
    this.save = save;
    this.lesson = lesson;
    this.valid = true;
    this.exampleOnly = !!data.exampleOnly;
    this.phase = this.exampleOnly ? 'teaching' : 'briefing';
    this.busy = false;
    this.board = null;
    this.message = '';
    this.celebration = '';
    this.style = store.get('pawnshire-journey-pieces') === 'classic' ? 'classic' : 'tokens';
    this.hud = document.createElement('div');
    this.hud.className = 'ambush-hud course-play';
    this.hud.id = 'course-ui';
    document.body.appendChild(this.hud);
    this.hud.addEventListener('click', e => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
      if (b && !b.disabled && !isModalOpen()) this.action(b.dataset.action!);
    });
    this.events.once('shutdown', () => {
      this.session++;
      settleJourney(this.save, true);
      persistJourney(this.save);
      this.hud.remove();
      closeModal();
    });
    this.preparePuzzle(lesson.show);
  }

  protected canRebuild() { return !this.busy && !this.board?.busy; }

  private layout() {
    const top = 68 + this.safe.top;
    if (this.W >= 640 && this.W > this.H) {
      const width = Math.min(650, (this.H - top - 24) * BOARD_SPAN / BOARD_TALL, this.W * .57);
      const panelWidth = Math.min(380, this.W - width - 64);
      const x = Math.max(16, (this.W - width - panelWidth - 32) / 2);
      return { x, y: top, width, panelX: x + width + 28, panelY: top + 12, panelWidth };
    }
    const width = Math.min(this.W - 8, (this.H - top - 180 - this.safe.bottom) * BOARD_SPAN / BOARD_TALL);
    return { x: (this.W - width) / 2, y: top, width, panelX: 12, panelY: top + width * BOARD_TALL / BOARD_SPAN + 2, panelWidth: this.W - 24 };
  }

  protected build() {
    if (!this.valid) return;
    coverImage(this, this.lesson.regionId === 'r1' ? 'bg-battle-bog' : 'bg-town', .4);
    const l = this.layout();
    this.board = new PhaserBoard(this, l.x, l.y, l.width, {
      faction: 'bog', style: this.style, intro: false, flipped: this.solver === 'b', allyColor: this.solver,
      onSquare: sq => this.onSquare(sq),
    });
    this.refresh();
  }

  private preparePuzzle(p: AmbushPuzzle) {
    this.puzzle = p;
    this.chess = new Chess(p.fen);
    this.solver = this.chess.turn() === 'w' ? 'b' : 'w';
    this.selected = this.hintSquare = null;
    this.lastMove = null;
    this.celebration = '';
  }

  private btn(action: string, text: string, primary = false, disabled = false) {
    return `<button data-action="${action}" class="${primary ? 'primary' : ''}" ${disabled ? 'disabled' : ''}>${esc(text)}</button>`;
  }

  private refresh() {
    const targets = this.selected && this.phase === 'solving' && !this.busy
      ? new Set(this.chess.moves({ square: this.selected, verbose: true }).map(m => m.to)) : new Set<Square>();
    this.board?.render({ chess: this.chess, selected: this.selected, targets, lastMove: this.lastMove, threats: null, villages: [], hint: this.hintSquare ? { from: this.hintSquare, to: this.hintSquare } : null });
    this.renderHud();
  }

  private renderHud() {
    const def = this.lesson, region = courseRegion(def.regionId)!;
    const run = this.save.active?.lessonId === def.id ? this.save.active.run : null;
    const help = AMBUSH_HELP[this.save.difficulty];
    const teaching = ['teaching', 'demonstrating', 'taught'].includes(this.phase);
    this.hud.classList.toggle('compact', this.H < 650);
    if (this.phase === 'briefing') {
      this.hud.innerHTML = `<div class="ambush-launcher"><section class="ambush-card">
        <p class="journey-kicker">${esc(region.title)} · ${def.review ? 'Final challenge' : 'Guided lesson'}</p>
        <h1>${esc(def.title)}</h1><p class="ambush-deck">${esc(def.objective)}</p>
        <div class="ambush-story">${def.before.map(s => `<p>${esc(s)}</p>`).join('')}</div>
        <p>${def.waves.length} positions. ${help.misses === null ? 'Unlimited tries.' : `${help.misses} misses per attempt.`} You can always retry.</p>
        <p class="ambush-rules">${def.review ? 'A mix of ideas you have learned. Read the board and choose your plan.' : 'Watch your companion work through an example, then try it yourself.'}</p>
        <div class="ambush-actions">${this.btn(def.review ? 'begin' : 'teach', def.review ? 'Face the challenge' : 'Learn the idea', true)}${def.review ? '' : this.btn('begin', 'Skip to practice')}${this.btn('home', 'Back to map')}</div>
        <p class="ambush-footnote">★ Finish · ★ No misses · ★ No hints<br>Stars stay earned. Replays can earn any you missed.</p>
      </section></div>`;
      return;
    }
    let actions = '';
    if (this.phase === 'teaching') actions = this.btn('watch', 'Show me', true) + this.btn(this.exampleOnly ? 'home' : 'begin', this.exampleOnly ? 'Back to journal' : 'Skip example');
    else if (this.phase === 'demonstrating') actions = this.btn(this.exampleOnly ? 'home' : 'begin', this.exampleOnly ? 'Back to journal' : 'Skip to practice');
    else if (this.phase === 'taught') actions = this.btn(this.exampleOnly ? 'home' : 'begin', this.exampleOnly ? 'Back to journal' : 'Try it yourself', true) + this.btn('watch', 'Watch again');
    else if (['solving', 'replying', 'setup'].includes(this.phase)) actions = help.hints ? this.btn('hint', 'Hint: show a piece', false, this.phase !== 'solving' || this.busy) : '<span class="ambush-nohelp">No hints on this difficulty</span>';
    else if (this.phase === 'waveWon') actions = this.btn('next', 'Next position', true);
    else if (this.phase === 'won') actions = this.btn('home', 'Continue journey', true) + this.btn('begin', 'Replay lesson');
    else if (this.phase === 'lost') actions = this.btn('begin', 'Try again', true) + this.btn('home', 'Back to map');
    const title = teaching ? 'Learn the idea' : this.phase === 'won' ? (def.review ? `${region.title} complete` : 'Lesson complete') : this.phase === 'lost' ? 'Take another look' : `Position ${(run?.wave ?? 0) + 1} of ${def.waves.length}`;
    const coach = teaching ? def.showLines[this.save.starter]
      : this.phase === 'solving' && run && !def.review && (help.coaching === 'all' || help.coaching === 'first' && run.wave === 0)
        ? run.step === 0 ? def.waves[run.wave].line
          : this.chess.isCheck() ? 'Your king is in check. Find a safe reply that finishes the line.'
            : 'The first idea worked. Look again at their reply and find the finish.'
        : '';
    const l = this.layout();
    const result = this.phase === 'won' ? `<div class="ambush-result"><strong>${this.save.completed.includes(def.id) ? '★' : '☆'} Finished &nbsp; ${this.save.stars[def.id]?.clean ? '★' : '☆'} No misses &nbsp; ${this.save.stars[def.id]?.noHint ? '★' : '☆'} No hints</strong><p>${esc(def.takeaway)}</p>${def.after.map(s => `<p>${esc(s)}</p>`).join('')}</div>`
      : this.phase === 'lost' ? '<div class="ambush-result">Your progress is safe. Retry from position 1; the position you missed gets a fresh board.</div>' : '';
    this.hud.innerHTML = `<header class="ambush-top">${this.btn('leave', '← Map')}<div><span class="journey-kicker">${esc(region.title)}</span><strong>${esc(def.title)}</strong></div>${this.btn('style', this.style === 'tokens' ? 'Classic pieces' : 'Animal pieces')}</header>
      <section class="ambush-panel" style="left:${l.panelX}px;top:${l.panelY}px;width:${l.panelWidth}px;max-height:${this.H - l.panelY - 8 - this.safe.bottom}px" aria-label="Lesson controls">
      <div class="ambush-panel-scroll" tabindex="0" aria-label="Lesson status and companion advice">
      <div class="ambush-panel-top"><span class="journey-kicker">${teaching ? 'Watch and learn' : `${DIFFICULTIES[this.save.difficulty].label} · ${run?.misses ?? 0}${help.misses === null ? ' misses' : `/${help.misses} misses`}`}</span><span class="ambush-side">You play ${this.solver === 'w' ? 'White' : 'Black'}</span></div>
      <h2>${esc(title)}</h2>
      <p class="ambush-status" role="status">${esc(this.celebration || this.message || def.objective)}</p>
      ${coach ? `<p class="ambush-coach"><strong>${esc(STARTERS[this.save.starter].name)}:</strong> ${esc(coach)}</p>` : ''}${result}
      ${run && !teaching && !['won', 'lost'].includes(this.phase) ? `<p class="ambush-bonuses">${run.misses === 0 ? '☆' : '–'} No misses &nbsp; ${run.hintsUsed === 0 ? '☆' : '–'} No hints</p>` : ''}
      <p class="ambush-source">Published Lichess position${teaching || ['waveWon', 'won', 'lost'].includes(this.phase) ? ` · <a href="${esc(this.puzzle.source)}" target="_blank" rel="noopener">${esc(this.puzzle.id)}</a>` : ''}</p>
      </div><div class="ambush-actions">${actions}</div></section>`;
  }

  private action(action: string) {
    if (action === 'home') return this.home();
    if (action === 'leave') return this.leave();
    if (action === 'style' && !this.busy) {
      this.style = this.style === 'tokens' ? 'classic' : 'tokens';
      store.set('pawnshire-journey-pieces', this.style); this.rebuild(); return;
    }
    if (action === 'teach') { this.phase = 'teaching'; this.message = 'Watch the example, then try the idea on a new board.'; this.refresh(); return; }
    if (action === 'begin') return this.begin();
    if (action === 'watch' && !this.busy) { void this.demonstrate(); return; }
    const run = this.save.active?.run;
    if (action === 'next' && run?.status === 'waveWon' && !this.busy) {
      this.save.active!.run = nextAmbushWave(this.lesson, run); persistJourney(this.save); void this.setupWave(); return;
    }
    if (action === 'hint' && this.phase === 'solving' && !this.busy && run) {
      const hint = hintAmbush(this.lesson, run); this.save.active!.run = hint.run;
      this.hintSquare = hint.square; this.message = 'The green square shows the piece to move.';
      persistJourney(this.save); this.refresh();
    }
  }

  private begin() {
    if (!beginJourneyLesson(this.save, this.lesson.id)) return;
    this.session++; this.busy = false;
    persistJourney(this.save); void this.setupWave();
  }

  private async setupWave() {
    const token = ++this.session;
    this.busy = false; this.phase = 'setup';
    this.preparePuzzle(wavePuzzle(this.lesson, this.save.active!.run));
    this.message = 'Watch your opponent’s last move…'; this.rebuild();
    await pause(650); if (token !== this.session) return;
    await this.play(this.puzzle.moves[0], token); if (token !== this.session) return;
    this.phase = 'solving';
    this.message = this.chess.isCheck() ? 'Your king is in check. Find the best reply.' : this.lesson.review ? 'Your move. Look for checks, captures and threats.' : this.lesson.objective;
    this.refresh(); this.flushLayout();
  }

  private async demonstrate() {
    const token = ++this.session;
    this.phase = 'demonstrating'; this.preparePuzzle(this.lesson.show);
    this.message = 'Watch your opponent’s last move…'; this.rebuild();
    await pause(500); if (token !== this.session) return;
    for (let i = 0; i < this.puzzle.moves.length; i++) {
      if (i % 2 === 1) {
        this.hintSquare = this.puzzle.moves[i].slice(0, 2) as Square;
        this.message = i === 1 ? this.lesson.showLines[this.save.starter] : 'Now follow through with the next move.';
        this.refresh(); await pause(1400); if (token !== this.session) return;
      }
      await this.play(this.puzzle.moves[i], token); if (token !== this.session) return;
      await pause(350); if (token !== this.session) return;
    }
    this.hintSquare = null; this.phase = 'taught'; this.message = this.lesson.takeaway;
    this.refresh(); this.flushLayout();
  }

  private async play(uci: string, token: number) {
    const move = this.chess.move(uciMove(uci));
    this.lastMove = { from: move.from, to: move.to }; this.selected = null;
    this.busy = true;
    const animation = this.board?.animateMove(move); this.refresh();
    await animation; if (token !== this.session) return;
    this.busy = false; this.refresh();
  }

  private onSquare(square: Square) {
    if (this.phase !== 'solving' || this.busy || isModalOpen()) return;
    if (this.selected) {
      const moves = this.chess.moves({ square: this.selected, verbose: true }).filter(m => m.to === square);
      if (moves.length) {
        const from = this.selected;
        if (moves[0].promotion) showModal({ title: 'Choose your promotion', buttons: moves.map(m => ({ label: pieceNames[m.promotion!], onClick: () => { void this.attempt(from + square + m.promotion); } })), onDismiss: () => {} });
        else void this.attempt(from + square);
        return;
      }
    }
    this.selected = this.chess.get(square)?.color === this.solver && this.selected !== square ? square : null;
    this.refresh();
  }

  private async attempt(uci: string) {
    const run = this.save.active?.run;
    if (this.phase !== 'solving' || this.busy || !run) return;
    const token = this.session;
    const outcome = moveAmbush(this.lesson, run, uci);
    if (outcome.verdict === 'ignored') return;
    this.save.active!.run = outcome.run;
    settleJourney(this.save); persistJourney(this.save);
    this.phase = 'replying'; this.hintSquare = null;
    this.message = outcome.verdict === 'miss' ? 'That move misses the idea. Let’s look again.' : 'Your move…';
    for (let i = 0; i < outcome.moves.length; i++) {
      await this.play(outcome.moves[i], token); if (token !== this.session) return;
      if (i === 0 && outcome.doubleCheck && isDoubleCheck(this.chess)) {
        this.celebration = 'Double check!'; this.refresh();
        await pause(800); if (token !== this.session) return; this.celebration = '';
      }
      if (i < outcome.moves.length - 1) {
        this.message = 'Your opponent replies…'; this.refresh(); await pause(350); if (token !== this.session) return;
      }
    }
    if (outcome.verdict === 'miss') {
      this.chess = new Chess(outcome.run.fen); this.lastMove = null;
      this.message = outcome.run.status === 'lost' ? 'Take a breath. A fresh attempt is ready when you are.' : 'Not quite. Your move is taken back. Check the threats and try again.';
    } else this.message = outcome.run.status === 'solving' ? 'Good. Keep going: finish the line.' : outcome.run.status === 'won' ? 'Well played. Every position solved.' : 'Position solved. Ready for another?';
    this.phase = outcome.run.status;
    if (this.phase === 'won') this.board?.celebrate();
    this.refresh(); this.flushLayout();
  }

  private home() {
    this.session++; this.busy = false;
    settleJourney(this.save, true); persistJourney(this.save);
    goTo(this.game, 'journey', { page: this.exampleOnly ? 'journal' : 'map' });
  }

  private leave() {
    if (this.save.active && !this.save.active.run.settled && ['setup', 'solving', 'replying', 'waveWon'].includes(this.phase)) {
      showModal({ title: 'Return to the map?', html: '<p>This ends the current attempt. Your completed lessons and stars stay earned. You can retry whenever you like.</p>', buttons: [{ label: 'Keep learning', kind: 'primary', onClick: () => {} }, { label: 'Return to map', onClick: () => this.home() }], onDismiss: () => {} });
    } else this.home();
  }
}
