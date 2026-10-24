import { Chess, type Move, type Square } from 'chess.js';
import { AMBUSH_HELP, hintAmbush, moveAmbush, nextAmbushWave, uciMove, wavePuzzle, type AmbushPuzzle } from '../game/ambush';
import { courseLesson, courseRegion, type CourseLesson } from '../game/curriculum';
import { DIFFICULTIES } from '../game/difficulty';
import { journeyMilestone, beginJourneyLesson, lessonUnlocked, settleJourney, type JourneySave } from '../game/journey';
import { loadJourney, persistJourney } from '../journeySave';
import { store } from '../store';
import { closeModal, esc, isModalOpen, showModal } from '../ui/overlay';
import { BOARD_SPAN, BOARD_TALL, PhaserBoard, type PieceStyle } from '../ui/phaserBoard';
import { BaseScene, goTo } from '../ui/screen';
import { coverImage } from '../ui/widgets';
import '../ui/ambush.css';
import { captureLine, companionReaction, companionSpeaker, CourseDialogueLog, CourseHolds, CourseSpeech, courseGuidance, courseDialogueRow, courseIntro, courseMoveCues, courseMoveSpeaker, coursePortrait, courseStoryBefore, type CourseCue } from '../ui/coursePresentation';
import type { SpeakerInfo } from '../ui/speaker';
import '../ui/coursePresentation.css';

type Phase = 'briefing' | 'teaching' | 'demonstrating' | 'taught' | 'setup' | 'solving' | 'replying' | 'waveWon' | 'won' | 'lost';
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
  private journal = new CourseDialogueLog();
  private speech = new CourseSpeech(() => this.renderSpeech());
  private speechElement: HTMLElement | null = null;
  private speechLayer: HTMLDivElement | null = null;
  private holds = new CourseHolds();
  private cueHolds = new CourseHolds();
  private coachKey = '';
  private scope = 'Introduction';
  private attemptNumber = 0;
  private exampleNumber = 0;
  private cue: { info: SpeakerInfo; labels: CourseCue[]; title: string; capture: boolean } | null = null;
  private earnedStars: string[] = [];
  private style: PieceStyle = 'tokens';
  private exampleOnly = false;
  private valid = false;
  private feedbackLayoutPending = false;

  constructor() { super('course-play'); }

  init(data: { lessonId?: string; exampleOnly?: boolean } = {}) {
    this.session++;
    this.valid = false; this.feedbackLayoutPending = false;
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
    this.message = ''; this.speech.clear();
    this.cue = null;
    this.holds.clear(); this.cueHolds.clear();
    this.journal = new CourseDialogueLog();
    this.scope = 'Introduction';
    this.attemptNumber = this.exampleNumber = 0;
    this.earnedStars = []; this.coachKey = '';
    for (const info of courseIntro(lesson, save.starter)) this.journal.add(info, this.scope);
    this.style = store.get('pawnshire-journey-pieces') === 'classic' ? 'classic' : 'tokens';
    this.hud = document.createElement('div');
    this.hud.className = 'ambush-hud course-play';
    this.hud.id = 'course-ui';
    document.body.appendChild(this.hud);
    this.speechLayer = document.createElement('div');
    this.speechLayer.className = 'ambush-hud course-play course-speech-layer';
    document.body.appendChild(this.speechLayer);
    this.hud.addEventListener('click', e => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
      if (b && !b.disabled && !isModalOpen()) this.action(b.dataset.action!);
    });
    this.events.once('shutdown', () => {
      this.session++;
      this.holds.clear(); this.cueHolds.clear(); this.cue = null;
      settleJourney(this.save, true);
      persistJourney(this.save);
      this.valid = false; this.speech.clear(); this.speechElement = null;
      this.speechLayer?.remove(); this.speechLayer = null;
      this.hud.remove();
      closeModal();
    });
    this.preparePuzzle(lesson.show);
  }

  requestLayout() {
    // The board rebuild waits for an in-flight move; hide feedback until both agree again.
    this.feedbackLayoutPending = true;
    if (this.speechElement) this.speechElement.hidden = true;
    const moment = this.hud?.querySelector<HTMLElement>('.course-moment');
    if (moment) moment.hidden = true;
    this.cueHolds.clear(); this.cue = null;
    super.requestLayout();
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
    // Reserve room for the instruction and actions before sizing the phone board.
    const panelSpace = this.H < 650 ? 234 : 246;
    const width = Math.min(this.W - 8, (this.H - top - panelSpace - this.safe.bottom) * BOARD_SPAN / BOARD_TALL);
    return { x: (this.W - width) / 2, y: top, width, panelX: 12, panelY: top + width * BOARD_TALL / BOARD_SPAN + 2, panelWidth: this.W - 24 };
  }

  protected build() {
    if (!this.valid) return;
    this.feedbackLayoutPending = false;
    // Transient moments are discarded when a deferred resize rebuilds the board.
    this.cue = null;
    coverImage(this, courseRegion(this.lesson.regionId)?.mapArt ? `bg-${courseRegion(this.lesson.regionId)!.mapArt}` : this.lesson.regionId === 'r1' ? 'bg-battle-bog' : 'bg-town', .4);
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
    this.cue = null; this.speech.clear();
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
    this.hud.classList.toggle('course-finished', this.phase === 'won' || this.phase === 'lost');
    if (this.phase === 'briefing') {
      this.hud.innerHTML = `<div class="ambush-launcher"><section class="ambush-card">
        <p class="journey-kicker">${esc(region.title)} · ${def.review ? region.kind === 'finale' ? 'Finale · Mixed challenge' : 'Chapter review' : 'Guided lesson'}</p>
        <h1>${esc(def.title)}</h1><p class="ambush-deck">${esc(def.objective)}</p>
        <div class="ambush-story">${courseStoryBefore(def, this.save.starter).map(s => `<p>${esc(s)}</p>`).join('')}</div>
        <div class="course-intro-dialogue">${courseIntro(def, this.save.starter).map(info => courseDialogueRow(info)).join('')}</div>
        <p>${def.waves.length} positions. ${help.misses === null ? 'Unlimited tries.' : `${help.misses} misses per attempt.`} You can always retry.</p>
        <p class="ambush-rules">${def.review ? 'A mix of ideas you have learned. Read the board and choose your plan.' : 'Watch your companion work through an example, then try it yourself.'}</p>
        <div class="ambush-actions">${def.review ? this.btn('begin', 'Face the challenge', true) : this.btn('teach', 'Show me', true) + this.btn('begin', 'Practice')}${this.btn('home', 'Back to map')}</div>
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
    else if (this.phase === 'won') actions = this.btn('home', def.id === 'finale-last-board' ? 'See the ending' : def.id === 'finale-threshold' ? 'Continue story' : 'Continue journey', true) + this.btn('begin', def.review ? 'Practise again' : 'Replay lesson');
    else if (this.phase === 'lost') actions = this.btn('begin', 'Try again', true) + this.btn('home', 'Back to map');
    const title = teaching ? 'Learn the idea' : this.phase === 'won' ? (def.id === 'finale-threshold' ? 'First table complete' : def.id === 'finale-last-board' ? 'Pawnshire is free' : def.review ? `${region.title} complete` : 'Lesson complete') : this.phase === 'lost' ? 'Take another look' : `Position ${(run?.wave ?? 0) + 1} of ${def.waves.length}`;
    const coach = this.phase === 'taught' ? def.takeaway : teaching ? def.showLines[this.save.starter]
      : this.phase === 'solving' && run && !def.review && (help.coaching === 'all' || help.coaching === 'first' && run.wave === 0)
        ? run.step === 0 ? def.waves[run.wave].line
          : this.chess.isCheck() ? 'Your king is in check. Find a safe reply that finishes the line.'
            : 'The first idea worked. Look again at their reply and find the finish.'
        : '';
    const coachKey = `${this.scope}:${run?.step ?? 0}:${coach}`;
    if (coach && coachKey !== this.coachKey) {
      const info = companionSpeaker(this.save.starter, coach);
      this.journal.add(info, this.scope, teaching ? 0 : (run?.step ?? 0) * 2);
      this.coachKey = coachKey;
    }
    const lastSpeaker = this.speech.info ?? this.journal.last ?? companionSpeaker(this.save.starter, '');
    actions += `<button data-action="history" class="course-history-chip" title="What was said" aria-label="What was said" ${this.busy || ['setup', 'demonstrating'].includes(this.phase) ? 'disabled' : ''}>${coursePortrait(lastSpeaker)}<span aria-hidden="true">…</span></button>`;
    const l = this.layout();
    const stars = this.save.stars[def.id];
    const result = this.phase === 'won' ? `<div class="ambush-result course-victory">${courseDialogueRow(companionReaction(this.save.starter, 'win'), 'course-victory-voice')}
      <div class="course-stars" aria-label="Lesson stars">${[['Finished', this.save.completed.includes(def.id)], ['No misses', stars?.clean], ['No hints', stars?.noHint]].map(([label, earned]) => `<span role="img" aria-label="${label}: ${earned ? 'earned' : 'not earned'}${this.earnedStars.includes(String(label)) ? ', new star' : ''}" class="${earned ? 'earned' : ''} ${this.earnedStars.includes(String(label)) ? 'new-star' : ''}"><b aria-hidden="true">${earned ? '★' : '☆'}</b>${label}${this.earnedStars.includes(String(label)) ? '<small>New star</small>' : ''}</span>`).join('')}</div>
      <p>${esc(def.takeaway)}</p>${def.after.map(s => `<p>${esc(s)}</p>`).join('')}</div>`
      : this.phase === 'lost' ? `<div class="ambush-result">${courseDialogueRow(companionReaction(this.save.starter, 'miss'))}<p>Your progress is safe. Retry from position 1. The missed position uses its backup.</p></div>` : '';
    const guidance = courseGuidance(this.message, def.objective, coach);
    const persistentSpeech = this.W >= 640 && this.W > this.H && this.H >= 650;
    const panelHeight = this.H - l.panelY - 8 - this.safe.bottom - (persistentSpeech && !['won', 'lost'].includes(this.phase) ? 170 : 0);
    const moment = this.cue ? `<div class="course-moment ${this.cue.capture ? 'capture' : ''}" hidden role="status">${coursePortrait(this.cue.info)}<div><small>${esc(this.cue.labels.join(' · '))}</small><strong>${esc(this.cue.title)}</strong></div></div>` : '';
    this.hud.innerHTML = `<header class="ambush-top">${this.btn('leave', '← Map')}<div><span class="journey-kicker">${esc(region.title)}</span><strong>${esc(def.title)}</strong></div>${this.btn('style', this.style === 'tokens' ? 'Classic pieces' : 'Animal pieces')}</header>
      <section class="ambush-panel" style="left:${l.panelX}px;top:${l.panelY}px;width:${l.panelWidth}px;max-height:${panelHeight}px" aria-label="Lesson controls">
      <div class="ambush-panel-scroll" tabindex="0" aria-label="Lesson status and companion advice">
      <div class="ambush-panel-top"><span class="journey-kicker">${teaching ? 'Watch and learn' : `${DIFFICULTIES[this.save.difficulty].label} · ${run?.misses ?? 0}${help.misses === null ? ' misses' : `/${help.misses} misses`}`}</span><span class="ambush-side">You play ${this.solver === 'w' ? 'White' : 'Black'}</span></div>
      <h2>${esc(title)}</h2>
      ${guidance.coach ? `<p class="course-advice"><strong>${esc(companionSpeaker(this.save.starter, '').name.split(' · ')[0])}:</strong> ${esc(guidance.coach)}</p>` : ''}
      ${guidance.status ? `<p class="ambush-status" role="status">${esc(guidance.status)}</p>` : ''}${result}
      ${run && !teaching && !['won', 'lost'].includes(this.phase) ? `<p class="ambush-bonuses">${run.misses === 0 ? '☆' : '–'} No misses &nbsp; ${run.hintsUsed === 0 ? '☆' : '–'} No hints</p>` : ''}
      <p class="ambush-source">Published Lichess position${teaching || ['waveWon', 'won', 'lost'].includes(this.phase) ? ` · <a href="${esc(this.puzzle.source)}" target="_blank" rel="noopener">${esc(this.puzzle.id)}</a>` : ''}</p>
      </div><div class="ambush-actions">${actions}</div></section>${moment}`;
    const momentElement = this.hud.querySelector<HTMLElement>('.course-moment');
    if (momentElement) this.positionFeedback(momentElement, persistentSpeech);
    this.renderSpeech();
  }

  /** Compact feedback covers advice, never squares or the fixed action row. */
  private positionFeedback(element: HTMLElement, persistent: boolean) {
    if (this.feedbackLayoutPending) { element.hidden = true; return; }
    const anchor = this.hud.querySelector<HTMLElement>(persistent ? '.ambush-panel' : '.ambush-panel-scroll');
    if (!anchor) { element.hidden = true; return; }
    const bounds = anchor.getBoundingClientRect();
    const top = persistent ? bounds.bottom + 12 : bounds.top;
    const height = persistent ? Math.min(156, this.H - this.safe.bottom - top - 8) : bounds.height;
    element.hidden = height < 44;
    element.style.left = `${bounds.left}px`;
    element.style.top = `${top}px`;
    element.style.width = `${bounds.width}px`;
    element.style.maxHeight = `${Math.max(0, height)}px`;
    // Keep the portrait and text readable even in a short landscape advice area.
    element.style.setProperty('--feedback-portrait-height', `${Math.max(24, Math.min(96, height - 26))}px`);
  }

  private action(action: string) {
    if (action === 'history') return this.showHistory();
    if (action === 'home') return this.home();
    if (action === 'leave') return this.leave();
    if (action === 'style' && !this.busy) {
      this.style = this.style === 'tokens' ? 'classic' : 'tokens';
      store.set('pawnshire-journey-pieces', this.style); this.rebuild(); return;
    }
    if (action === 'teach') { this.phase = 'teaching'; void this.demonstrate(); return; }
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
    this.session++; this.holds.clear(); this.cueHolds.clear(); this.cue = null; this.speech.clear(); this.busy = false;
    this.attemptNumber++; this.earnedStars = [];
    persistJourney(this.save); void this.setupWave();
  }

  private async setupWave() {
    const token = ++this.session;
    this.holds.clear(); this.cueHolds.clear(); this.cue = null; this.busy = false; this.phase = 'setup';
    this.scope = `Attempt ${this.attemptNumber} · Position ${this.save.active!.run.wave + 1}`;
    this.preparePuzzle(wavePuzzle(this.lesson, this.save.active!.run));
    this.message = 'Watch your opponent’s last move…'; this.rebuild();
    await this.holds.wait(650); if (token !== this.session) return;
    await this.play(this.puzzle.moves[0], token); if (token !== this.session) return;
    this.phase = 'solving';
    this.message = this.chess.isCheck() ? 'Your king is in check. Find the best reply.' : this.lesson.review ? 'Your move. Look for checks, captures and threats.' : this.lesson.objective;
    this.refresh(); this.flushLayout();
  }

  private async demonstrate() {
    const token = ++this.session;
    this.holds.clear(); this.cueHolds.clear(); this.cue = null;
    this.scope = `Example ${++this.exampleNumber}`;
    this.phase = 'demonstrating'; this.preparePuzzle(this.lesson.show);
    this.message = 'Watch your opponent’s last move…'; this.rebuild();
    await this.holds.wait(500); if (token !== this.session) return;
    for (let i = 0; i < this.puzzle.moves.length; i++) {
      if (i % 2 === 1) {
        this.hintSquare = this.puzzle.moves[i].slice(0, 2) as Square;
        this.message = i === 1 ? this.lesson.showLines[this.save.starter] : 'Now follow through with the next move.';
        this.refresh(); await this.holds.wait(1400); if (token !== this.session) return;
      }
      await this.play(this.puzzle.moves[i], token, i % 2 === 1, i); if (token !== this.session) return;
      await this.holds.wait(350); if (token !== this.session) return;
    }
    this.hintSquare = null; this.phase = 'taught'; this.message = this.lesson.takeaway;
    this.refresh(); this.flushLayout();
  }

  private async play(uci: string, token: number, accepted = false, publishedIndex = -1, silent = false) {
    const move = this.chess.move(uciMove(uci));
    this.lastMove = { from: move.from, to: move.to }; this.selected = null;
    this.busy = true;
    const animation = this.board?.animateMove(move); this.refresh();
    await animation; if (token !== this.session) return;
    if (!silent) {
      const cues = courseMoveCues(this.chess, move, accepted, this.puzzle.id, publishedIndex);
      const info = courseMoveSpeaker(move, this.solver, cues, this.lesson.regionId);
      this.journal.add(info, this.scope, Math.max(0, Math.ceil(publishedIndex / 2) * 2 - (move.color === this.solver ? 1 : 0)));
      if (accepted && cues.length) {
        await this.moveMoment(move, info, cues, token); if (token !== this.session) return;
      }
      this.speech.show(info);
    }
    this.busy = false; this.refresh();
  }

  private async moveMoment(move: Move, info: SpeakerInfo, labels: CourseCue[], token: number) {
    this.cue = { info, labels, capture: !!move.captured, title: move.captured ? captureLine(move) : labels.join(' · ') + '!' };
    this.refresh();
    await this.cueHolds.wait(matchMedia('(prefers-reduced-motion: reduce)').matches ? 450 : move.captured ? 1200 : 900);
    if (token !== this.session) return;
    this.cue = null; this.refresh();
  }

  /** Separate from lesson scrolling. Renders never restart the reading-time clock. */
  private renderSpeech() {
    const info = this.speech.info;
    if (!this.hud || !this.valid) return;
    const persistent = this.W >= 640 && this.W > this.H && this.H >= 650;
    const visible = !!info && !this.cue && !['briefing', 'won', 'lost'].includes(this.phase) && (persistent || this.speech.visible);
    if (!visible) {
      if (this.speechElement) this.speechElement.hidden = true;
      return;
    }
    if (!this.speechElement) {
      this.speechElement = document.createElement('aside');
      this.speechElement.setAttribute('aria-label', 'Piece dialogue');
      this.speechElement.setAttribute('aria-live', 'polite');
      this.speechElement.addEventListener('pointerenter', () => this.speech.hold());
      this.speechElement.addEventListener('pointerleave', () => this.speech.release());
      this.speechElement.addEventListener('pointerdown', () => this.speech.hold());
      this.speechElement.addEventListener('pointerup', () => this.speech.release());
      this.speechElement.addEventListener('pointercancel', () => this.speech.release());
      this.speechElement.addEventListener('focusin', () => this.speech.hold());
      this.speechElement.addEventListener('focusout', () => this.speech.release());
      this.speechElement.addEventListener('click', event => {
        if ((event.target as HTMLElement).closest('[data-dismiss-speech]')) this.speech.dismiss();
      });
    }
    const element = this.speechElement;
    element.className = `course-speech ${persistent ? 'persistent' : 'toast'}`;
    const content = courseDialogueRow(info!, 'course-speech-voice') + (persistent ? '' : '<button data-dismiss-speech title="Dismiss dialogue" aria-label="Dismiss dialogue">×</button>');
    // Preserve the node and a reader's focus across ordinary board/HUD updates.
    if (element.dataset.line !== content) { element.innerHTML = content; element.dataset.line = content; }
    this.positionFeedback(element, persistent);
    if (this.speechLayer && element.parentElement !== this.speechLayer) this.speechLayer.appendChild(element);
  }

  private showHistory() {
    showModal({ title: 'What was said', eyebrow: this.lesson.title,
      html: `<div class="course-history" tabindex="0" aria-label="Lesson conversation">${this.journal.all.map(entry => `<p class="course-history-label">${esc(entry.label)}</p>${courseDialogueRow(entry.info)}`).join('')}</div>`,
      buttons: [{ label: 'Back to the lesson', kind: 'primary', onClick: () => {} }], onDismiss: () => {} });
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
    const previous = { finished: this.save.completed.includes(this.lesson.id), ...this.save.stars[this.lesson.id] };
    this.save.active!.run = outcome.run;
    settleJourney(this.save); persistJourney(this.save);
    if (outcome.run.status === 'won') {
      this.earnedStars = [!previous.finished ? 'Finished' : '', !previous.clean && outcome.run.misses === 0 ? 'No misses' : '', !previous.noHint && outcome.run.hintsUsed === 0 ? 'No hints' : ''].filter(Boolean);
    }
    this.phase = 'replying'; this.hintSquare = null;
    this.speech.clear();
    this.message = outcome.verdict === 'miss' ? 'That move misses the idea. Let’s look again.' : 'Your move…';
    for (let i = 0; i < outcome.moves.length; i++) {
      await this.play(outcome.moves[i], token, outcome.verdict !== 'miss' && i === 0, 1 + run.step * 2 + i, outcome.verdict === 'miss'); if (token !== this.session) return;
      if (i < outcome.moves.length - 1) {
        this.message = 'Your opponent replies…'; this.refresh(); await this.holds.wait(350); if (token !== this.session) return;
      }
    }
    if (outcome.verdict === 'miss') {
      this.chess = new Chess(outcome.run.fen); this.lastMove = null;
      this.message = outcome.run.status === 'lost' ? 'Take a breath. A fresh attempt is ready when you are.' : 'Not quite. Your move is taken back. Check the threats and try again.';
    } else this.message = outcome.run.status === 'solving' ? 'Good. Keep going: finish the line.' : outcome.run.status === 'won' ? 'Well played. Every position solved.' : 'Position solved. Ready for another?';
    this.phase = outcome.run.status;
    if (this.phase === 'won' || this.phase === 'waveWon' || outcome.verdict === 'miss') {
      const info = companionReaction(this.save.starter, this.phase === 'won' ? 'win' : outcome.verdict === 'miss' ? 'miss' : 'wave');
      this.speech.show(info);
      this.journal.add(info, this.scope, (run.step + 1) * 2 - 1);
    }
    if (this.phase === 'won') this.board?.celebrate();
    this.refresh(); this.flushLayout();
  }

  private home() {
    this.session++; this.holds.clear(); this.cueHolds.clear(); this.cue = null; this.speech.clear(); this.busy = false;
    settleJourney(this.save, true); persistJourney(this.save);
    const milestone = ['won', 'replying'].includes(this.phase) ? journeyMilestone(this.save, this.lesson.id) : null;
    const page = this.exampleOnly ? 'journal' : milestone === 'chapter' ? 'story' : milestone ?? 'map';
    goTo(this.game, 'journey', { page, storyRegion: this.lesson.regionId });
  }

  private leave() {
    if (this.save.active && !this.save.active.run.settled && ['setup', 'solving', 'replying', 'waveWon'].includes(this.phase)) {
      showModal({ title: 'Return to the map?', html: '<p>This ends the current attempt. Your completed lessons and stars stay earned. You can retry whenever you like.</p>', buttons: [{ label: 'Keep learning', kind: 'primary', onClick: () => {} }, { label: 'Return to map', onClick: () => this.home() }], onDismiss: () => {} });
    } else this.home();
  }
}
