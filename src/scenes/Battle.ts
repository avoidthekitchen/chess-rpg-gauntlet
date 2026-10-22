import { Chess, type Move, type PieceSymbol, type Square } from 'chess.js';
import Phaser from 'phaser';
import { chooseEnemyMove, fallbackMove } from '../ai/enemy';
import { planShout, shoutLine, shoutStands } from '../ai/shout';
import { engine, engineStatus } from '../engineHost';
import { Battle, type TurnResult } from '../game/battle';
import { DIFFICULTIES, type AiProfile, type DifficultyId } from '../game/difficulty';
import { PIECE_VALUE, materialBalance } from '../game/material';
import { forkPays } from '../game/tacticCheck';
import { biggestMistake, type MoveReview } from '../game/review';
import { REVIEW_SLOT, reviewHtml, type ReviewResult } from '../ui/reviewText';
import { TACTIC_GOLD } from '../game/economy';
import { objectiveText, type Scenario } from '../game/scenarios';
import type { TacticTag } from '../game/tactics';
import { threatMap } from '../game/threats';
import { store } from '../store';
import { closeModal, esc, showModal, type ModalButton } from '../ui/overlay';
import { BOARD_SPAN, BOARD_TALL, PhaserBoard, type BoardView, type PieceStyle } from '../ui/phaserBoard';
import { portrait, speakerCard } from '../ui/portrait';
import { BaseScene } from '../ui/screen';
import { FACTION_SHORT, FACTION_SPECIES, SPECIES, pieceName, speakerLine, type Faction, type SpeakerInfo } from '../ui/speaker';
import { C, CSS, SANS, SERIF } from '../ui/theme';
import { button, eyebrow, panel, para } from '../ui/widgets';

/** One-word names for status text, e.g. "Your tower takes the squire on d5". */
const PIECE_SHORT: Record<PieceSymbol, string> = { k: 'king', q: 'sorceress', r: 'tower', b: 'mage', n: 'knight', p: 'squire' };

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

export interface FinishView {
  eyebrow?: string;
  title: string;
  /** May contain REVIEW_SLOT, where the post-battle review is filled in once it's ready. */
  html: string;
  buttons: ModalButton[];
  /** Runs if the player leaves or restarts instead of using the dialog (e.g. to charge a defeat). */
  onAbandon?: () => void;
}

export interface BattleLaunch {
  scenario: Scenario;
  faction: Faction;
  difficulty: DifficultyId;
  /** Shown above the title, e.g. "The Bog · Squire". */
  eyebrow: string;
  /** Named characters, by the square they start on. Everyone else is unnamed militia. */
  names?: Partial<Record<Square, string>>;
  /** Goblins announce their next move and must play it if it's still legal. */
  shouts?: boolean;
  /** The companion's opening tip. */
  tip?: { type: PieceSymbol; name: string; line: string };
  /** Academy practice: unlimited undo, nothing at stake. */
  practice?: boolean;
  /** Overrides the difficulty's enemy strength (e.g. a lone king that defends perfectly). */
  ai?: AiProfile;
  /** Banners pay gold for confirmed tactics (campaign battles only). */
  tacticGold?: boolean;
  /** Fills the victory/defeat dialog. `retry` restarts and `rewind` undoes the last move. */
  finish: (
    b: Battle,
    actions: { retry: () => void; rewind: (() => void) | null },
    extra: { tacticGold: number },
  ) => FinishView;
  /** Leave the battle (the ← button). */
  exit: () => void;
  /** Where the ← button goes, e.g. "Town". Defaults to "Map". */
  exitLabel?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class BattleScene extends BaseScene {
  private launch!: BattleLaunch;
  private battle!: Battle;
  private board: PhaserBoard | null = null;
  private panelLayer: Phaser.GameObjects.Container | null = null;
  private speakerLayer: Phaser.GameObjects.Container | null = null;

  private selected: Square | null = null;
  private thinking = false;
  private animating = false;
  private aiToken = 0;
  private threatSight = true;
  private pieceStyle: PieceStyle = 'tokens';
  private statusLine = '';
  private speaker: SpeakerInfo | null = null;
  private speakerAt = 0;
  private names = new Map<Square, string>();
  private finished = false;
  private firstBuild = true;
  /** The move the goblins announced for this turn (UCI), and announcements by position so a rewind hears the same one. */
  private shout: string | null = null;
  private shoutCache = new Map<string, string | null>();
  private speakerTimer = 0;
  private speakQueue: { info: SpeakerInfo; gap: number }[] = [];
  /** Gold earned this battle from engine-confirmed tactics. */
  tacticGold = 0;
  /** Bumped when the scene starts or shuts down, so async work from a battle you left stops. */
  private session = 0;
  /** The finished battle's dialog, built (and the result recorded) the moment it ended. */
  private pendingView: FinishView | null = null;

  constructor() {
    super('battle');
  }

  init(data: BattleLaunch) {
    this.session++;
    // Phaser reuses the scene instance, so drop everything from the last battle.
    this.board = null;
    this.panelLayer = null;
    this.speakerLayer = null;
    this.shoutCache = new Map();
    this.launch = data;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      clearTimeout(this.speakerTimer);
      this.aiToken++;
      this.session++;
    });
    this.pieceStyle = store.get('pieceStyle') === 'classic' ? 'classic' : 'tokens';
    this.reset();
  }

  private get difficulty() {
    return DIFFICULTIES[this.launch.difficulty];
  }

  private get ai(): AiProfile {
    return this.launch.ai ?? this.difficulty.ai;
  }

  private reset() {
    clearTimeout(this.speakerTimer);
    this.speakerTimer = 0;
    this.speakQueue = [];
    this.aiToken++;
    engine.stop();
    this.battle = new Battle(this.launch.scenario, this.launch.practice ? 999 : this.difficulty.rewinds);
    this.tacticGold = 0;
    this.threatSight = this.difficulty.threatSight;
    this.selected = null;
    this.thinking = false;
    this.animating = false;
    this.speaker = null;
    this.finished = false;
    this.statusLine = this.launch.scenario.intro;
    this.names = new Map(Object.entries(this.launch.names ?? {}) as [Square, string][]);
    this.firstBuild = true;
    this.shout = null;
    this.pendingView = null;
    const tip = this.launch.tip;
    if (tip) this.say({ side: 'ally', name: `${tip.name} · ${SPECIES[tip.type]}`, line: tip.line, type: tip.type });
    void this.startPlayerTurn();
  }

  protected canRebuild() {
    return !this.board?.busy;
  }

  // ---------- layout ----------

  private layout() {
    const { W, H, safe } = this;
    const topH = 52 + safe.top;
    if (this.wide) {
      const panelW = Math.min(380, Math.max(300, W * 0.32));
      const sq = Math.min(80, (H - topH - 16) / BOARD_TALL, (W - panelW - 56) / BOARD_SPAN);
      const bw = sq * BOARD_SPAN;
      const total = bw + 24 + panelW;
      const bx = Math.max(16, (W - total) / 2);
      // A short landscape screen (a phone on its side) has no room for the talking head
      // above the panel or for the lesson and log, so those float or move behind buttons.
      const short = H < 600;
      return { wide: true, short, topH, board: { x: bx, y: topH, w: bw }, panel: { x: bx + bw + 24, y: topH + 8, w: panelW } };
    }
    const sq = Math.min(W / BOARD_SPAN, (H - topH - 250 - safe.bottom) / BOARD_TALL, 64);
    const bw = sq * BOARD_SPAN;
    const bx = (W - bw) / 2;
    const bh = sq * BOARD_TALL;
    const pw = Math.min(W - 24, 560);
    return { wide: false, short: false, topH, board: { x: bx, y: topH - 6, w: bw }, panel: { x: (W - pw) / 2, y: topH - 6 + bh + 4, w: pw } };
  }

  protected build() {
    const L = this.layout();
    if (this.textures.exists('bg-battle-bog')) {
      const img = this.add.image(this.W / 2, this.H / 2, 'bg-battle-bog');
      img.setScale(Math.max(this.W / img.width, this.H / img.height));
      this.add.rectangle(0, 0, this.W, this.H, 0x0c090f, 0.45).setOrigin(0);
    } else this.add.rectangle(0, 0, this.W, this.H, C.bg).setOrigin(0);

    this.drawTopBar(L.topH);
    this.board = new PhaserBoard(this, L.board.x, L.board.y, L.board.w, {
      faction: this.launch.faction,
      style: this.pieceStyle,
      intro: this.firstBuild,
      onSquare: (sq) => this.onSquare(sq),
    });
    this.firstBuild = false;
    this.panelLayer = null;
    this.speakerLayer = null;
    this.input.keyboard?.off('keydown-ESC');
    this.input.keyboard?.on('keydown-ESC', () => {
      this.selected = null;
      this.refresh();
    });
    this.refresh();
    this.drawSpeaker();
  }

  private drawTopBar(topH: number) {
    const s = this.safe.top;
    const g = this.add.graphics();
    g.fillStyle(C.bg, 0.82).fillRect(0, 0, this.W, topH - 4);
    g.lineStyle(1, C.line, 1).lineBetween(0, topH - 4, this.W, topH - 4);
    button(this, 12, s + 7, `← ${this.launch.exitLabel ?? 'Map'}`, { w: 80, h: 34, kind: 'ghost', onClick: () => this.leave() });
    const titleX = 100;
    eyebrow(this, titleX, s + 6, this.launch.eyebrow);
    const t = this.text(titleX, s + 19, this.launch.scenario.title, { fontFamily: SERIF, fontSize: '20px', fontStyle: 'bold' });
    const maxW = this.W - titleX - 100;
    if (t.width > maxW) t.setScale(maxW / t.width);
    button(this, this.W - 88, s + 7, 'Restart', { w: 76, h: 34, kind: 'ghost', onClick: () => this.restart() });
  }

  // ---------- state → screen ----------

  private boardView(): BoardView {
    const b = this.battle;
    return {
      chess: b.chess,
      selected: this.selected,
      targets: new Set<Square>(this.selected ? b.legalMoves(this.selected).map((m) => m.to) : []),
      lastMove: b.lastMove,
      threats: this.threatSight ? threatMap(b.chess, b.player) : null,
      villages: b.scenario.villages ?? [],
      shout: this.shout && b.isPlayerTurn() ? { from: this.shout.slice(0, 2) as Square, to: this.shout.slice(2, 4) as Square } : null,
    };
  }

  /** Redraws the board marks and the panel from the battle state. */
  private refresh() {
    if (!this.board) return;
    this.board.render(this.boardView());
    this.drawPanel();
  }

  private drawPanel() {
    this.panelLayer?.destroy();
    const L = this.layout();
    const c = this.add.container(0, 0);
    this.panelLayer = c;
    const b = this.battle;
    const o = b.scenario.objective;
    const { x, w } = L.panel;
    let y = L.panel.y;
    if (L.wide && !L.short) y += 132; // room for the talking head

    // Objective and meters.
    const meters: [string, string][] = [];
    const left = b.movesLeft();
    if (left !== undefined) meters.push(['Moves left', String(Math.max(0, left))]);
    if (o.kind === 'winMaterial') meters.push(['Material won', `${fmt(b.materialGained())} / +${o.gain}`]);
    if (o.kind === 'survive') meters.push(['Enemy turns', `${b.enemyMoves} / ${o.turns}`]);
    meters.push(['Pieces lost', String(b.piecesLost)]);

    const pad = 14;
    const ob = eyebrow(this, x + pad, y + 12, `vs ${b.scenario.enemy.name}`);
    const title = this.text(x + pad, y + 28, objectiveText(o), {
      fontFamily: SERIF,
      fontSize: L.wide ? '19px' : '17px',
      color: CSS.gold,
      fontStyle: 'bold',
      wordWrap: { width: w - pad * 2, useAdvancedWrap: true },
    });
    let my = y + 28 + title.height + 8;
    const mw = (w - pad * 2 - 8 * (meters.length - 1)) / meters.length;
    const mg = this.add.graphics();
    const meterObjs: Phaser.GameObjects.GameObject[] = [mg];
    meters.forEach(([label, value], i) => {
      const mx = x + pad + i * (mw + 8);
      mg.fillStyle(C.surface2, 1).fillRoundedRect(mx, my, mw, 44, 8);
      meterObjs.push(this.text(mx + 9, my + 5, label, { fontFamily: SANS, fontSize: '11px', color: CSS.muted }));
      meterObjs.push(this.text(mx + 9, my + 19, value, { fontFamily: SANS, fontSize: '17px', fontStyle: 'bold' }));
    });
    my += 44 + 12;
    const card = panel(this, x, y, w, my - y);
    c.add([card, ob, title, ...meterObjs]);
    y = my + 10;

    // Controls.
    const ctrl: { label: string; kind?: 'primary' | 'normal' | 'ghost'; pressed?: boolean; disabled?: boolean; onClick: () => void }[] = [
      { label: this.launch.practice ? '⟲ Undo' : `⟲ Rewind  ${b.rewindsLeft}`, kind: 'primary', disabled: !b.canRewind() || this.animating, onClick: () => this.rewind() },
      { label: L.wide ? `◉ Threat Sight: ${this.threatSight ? 'On' : 'Off'}` : '◉ Threats', pressed: this.threatSight, onClick: () => this.toggleThreats() },
      { label: L.wide ? `♞ Pieces: ${this.pieceStyle === 'tokens' ? 'Tokens' : 'Classic'}` : '♞ Pieces', onClick: () => this.togglePieces() },
    ];
    if (!L.wide || L.short) ctrl.push({ label: '✎ Lesson', onClick: () => this.showLesson() });
    const cols = L.wide ? 2 : ctrl.length;
    const bw = (w - 8 * (cols - 1)) / cols;
    ctrl.forEach((k, i) => {
      const bx = x + (i % cols) * (bw + 8);
      const by = y + Math.floor(i / cols) * 46;
      c.add(button(this, bx, by, k.label, { w: bw, h: 40, kind: k.kind, pressed: k.pressed, disabled: k.disabled, fontSize: L.wide ? 14 : 13, onClick: k.onClick }));
    });
    y += Math.ceil(ctrl.length / cols) * 46 + 4;

    // Status.
    const turnText = b.status !== 'playing' ? '' : this.thinking ? 'The enemy is plotting… ' : 'Your move. ';
    const status = this.text(x + 2, y, '', {
      fontFamily: SERIF,
      fontSize: '15px',
      color: CSS.ink,
      wordWrap: { width: w - 4, useAdvancedWrap: true },
    });
    status.setText(`${turnText}${this.statusLine}`);
    if (!L.wide || L.short) status.setMaxLines(3);
    c.add(status);
    y += Math.max(status.height, 40) + 10;

    if (!L.wide || L.short) {
      if (engineStatus === 'fallback') c.add(this.text(x + 2, y, 'Stockfish didn’t load: enemies use a simple fallback AI.', { fontFamily: SANS, fontSize: '12px', color: CSS.muted }));
      return;
    }

    // Lesson (desktop only; phones open it from the ✎ button).
    const lessonText = para(this, x + pad, y + 32, b.scenario.lesson, w - pad * 2, 15, CSS.muted);
    const lh = lessonText.height + 44;
    c.add([panel(this, x, y, w, lh), this.text(x + pad, y + 8, 'Lesson', { fontFamily: SERIF, fontSize: '17px', fontStyle: 'bold' }), lessonText]);
    y += lh + 10;

    if (this.threatSight) {
      const lg = this.add.graphics();
      lg.fillStyle(0xe2c49c, 1).fillRoundedRect(x + 2, y + 2, 16, 16, 4);
      lg.lineStyle(2, 0xc82819, 0.55).strokeRoundedRect(x + 3, y + 3, 14, 14, 4);
      lg.fillStyle(0xff3b1e, 0.85).fillCircle(x + 10, y + 34, 7);
      c.add([lg, this.text(x + 26, y + 1, 'Squares the enemy attacks', { fontFamily: SANS, fontSize: '13px', color: CSS.muted })]);
      c.add(this.text(x + 26, y + 25, 'Your piece can be won. Defend or move it!', { fontFamily: SANS, fontSize: '13px', color: CSS.muted }));
      y += 50;
      if (b.scenario.villages?.length) {
        lg.lineStyle(2, C.green, 1).strokeRoundedRect(x + 3, y + 3, 14, 14, 3);
        c.add(this.text(x + 26, y + 1, 'Village to protect', { fontFamily: SANS, fontSize: '13px', color: CSS.muted }));
        y += 26;
      }
    }

    // Battle log, as much as fits.
    const room = this.H - y - 16;
    if (room > 70) {
      const rows = Math.floor((room - 34) / 20);
      const log = b.log;
      const pairs: string[] = [];
      for (let i = 0; i < log.length; i += 2) pairs.push(`${i / 2 + 1}. ${log[i]}${log[i + 1] ? `   ${log[i + 1]}` : ''}`);
      const shown = pairs.slice(-rows);
      const body = shown.length ? shown.join('\n') : 'No moves yet.';
      const lt = this.text(x + pad, y + 28, body, { fontFamily: SANS, fontSize: '14px', color: CSS.muted, lineSpacing: 4 });
      const h = Math.min(room, lt.height + 40);
      c.add([panel(this, x, y, w, h), eyebrow(this, x + pad, y + 10, 'Battle log'), lt]);
      y += h + 8;
    }
    if (engineStatus === 'fallback') c.add(this.text(x + 2, Math.min(y, this.H - 22), 'Stockfish didn’t load: enemies use a simple fallback AI.', { fontFamily: SANS, fontSize: '12px', color: CSS.muted }));
  }

  /** The moving piece's talking head: beside the board on desktop, floating at the bottom on phones. */
  private drawSpeaker() {
    this.speakerLayer?.destroy();
    this.speakerLayer = null;
    if (!this.speaker) return;
    const L = this.layout();
    if (L.wide && !L.short) {
      const { container } = speakerCard(this, L.panel.x, L.panel.y, L.panel.w, this.speaker, this.launch.faction, false);
      this.speakerLayer = container;
      if (performance.now() - this.speakerAt < 300) {
        container.alpha = 0;
        container.y += 8;
        this.tweens.add({ targets: container, alpha: 1, y: L.panel.y, duration: 350, ease: 'Cubic.easeOut' });
      }
      return;
    }
    // Phone (or a short landscape screen): float over the bottom of the screen (or panel) for a few seconds.
    const age = performance.now() - this.speakerAt;
    if (age > 4000) return;
    const w = L.wide ? L.panel.w : this.W - 24;
    const { container, height } = speakerCard(this, L.wide ? L.panel.x : 12, 0, w, this.speaker, this.launch.faction, true);
    const y = this.H - height - Math.max(12, this.safe.bottom);
    container.y = y;
    container.setDepth(50);
    // It floats over the controls, so a tap dismisses it instead of pressing a hidden button.
    const hit = this.add.zone(0, 0, w, height).setOrigin(0).setInteractive();
    hit.on('pointerup', () => {
      this.speakerAt = 0;
      container.destroy();
    });
    container.add(hit);
    this.speakerLayer = container;
    if (age < 300) {
      container.alpha = 0;
      container.y = y + 12;
      this.tweens.add({ targets: container, alpha: 1, y, duration: 320, ease: 'Cubic.easeOut' });
    }
    this.tweens.add({ targets: container, alpha: 0, y: y + 6, duration: 800, delay: Math.max(0, 3200 - age) });
  }

  private speak(res: TurnResult, kept = false) {
    const m = res.move;
    const info = speakerLine(m, res.tactics, {
      faction: this.launch.faction,
      characterName: m.color === 'w' ? this.names.get(m.to) : undefined,
      commander: this.battle.scenario.enemy.name,
    });
    if (kept && !res.tactics.includes('checkmate')) info.line = pickOne(['Told you I would!', 'Just like I shouted!', 'Hah! A goblin keeps its word!']);
    this.say(info);
  }

  /**
   * Shows a talking head. Lines with a `minGap` wait their turn until the previous line
   * has been up that long (shout, then advice); an immediate line (a move) drops stale ones.
   */
  private say(info: SpeakerInfo, minGap = 0) {
    if (minGap === 0) {
      clearTimeout(this.speakerTimer);
      this.speakerTimer = 0;
      this.speakQueue = [];
    }
    this.speakQueue.push({ info, gap: minGap });
    this.pumpSpeaker();
  }

  private pumpSpeaker() {
    if (this.speakerTimer) return;
    const next = this.speakQueue[0];
    if (!next) return;
    const show = () => {
      this.speakerTimer = 0;
      this.speakQueue.shift();
      this.speaker = next.info;
      this.speakerAt = performance.now();
      if (this.board) this.drawSpeaker();
      this.pumpSpeaker();
    };
    const wait = next.gap - (performance.now() - this.speakerAt);
    if (wait > 0) this.speakerTimer = window.setTimeout(() => (this.sys.isActive() ? show() : undefined), wait);
    else show();
  }

  /**
   * Help that fades: on Squire, the companion reads the shout for you a moment later
   * (is the target guarded? is the trade fair?). On harder difficulties you work it out.
   */
  private adviseOnShout(fen: string, uci: string) {
    const tip = this.launch.tip;
    if (!tip || this.launch.difficulty !== 'squire' || this.launch.practice) return;
    const b = this.battle;
    const to = uci.slice(2, 4) as Square;
    const mover = b.chess.get(uci.slice(0, 2) as Square);
    const target = b.chess.get(to);
    let line: string | null = null;
    if (target && target.color === b.player && mover) {
      const defenders = b.chess.attackers(to, b.player);
      const attackers = b.chess.attackers(to, b.enemy).length;
      // The king only counts as a guard when it's the lone attacker it would take back.
      const real = defenders.filter((sq) => b.chess.get(sq)?.type !== 'k').length + (attackers === 1 && defenders.some((sq) => b.chess.get(sq)?.type === 'k') ? 1 : 0);
      const guarded = real > 0;
      const name = PIECE_SHORT[target.type];
      if (target.type === 'k') line = null;
      else if (!guarded) line = `They want our ${name} on ${to}, and nobody guards it! Move it, or protect it.`;
      else if (attackers > real) line = `Our ${name} on ${to} is guarded, but they have more attackers than we have guards. Move it, or add a guard!`;
      else if (PIECE_VALUE[mover.type] < PIECE_VALUE[target.type]) line = `Our ${name} on ${to} is guarded, but their ${this.enemyShort[mover.type]} is worth less. That trade loses. Move it!`;
      else line = `Let them try! Our ${name} on ${to} is guarded, so we take right back. Unless you see something better…`;
    } else if ((b.scenario.villages ?? []).includes(to)) {
      line = `They’re heading for the village on ${to}! Make sure we can capture whoever lands there.`;
    } else {
      const after = new Chess(fen.replace(' w ', ' b ').replace(/ [a-h][36] /, ' - '));
      try {
        after.move({ from: uci.slice(0, 2), to, promotion: uci[4] as PieceSymbol | undefined });
        if (after.inCheck()) line = 'They’re coming for our king. Be ready to block or step aside!';
      } catch {
        /* no advice */
      }
    }
    if (line) this.say({ side: 'ally', name: `${tip.name} · ${SPECIES[tip.type]}`, line, type: tip.type }, 2600);
  }

  /** The goblins shout what they'll do next, based on the position if you passed. */
  private async startPlayerTurn() {
    this.shout = null;
    const b = this.battle;
    if (!this.launch.shouts || !b.isPlayerTurn()) return;
    const fen = b.fen;
    let uci = this.shoutCache.get(fen);
    if (uci === undefined) {
      const token = this.aiToken;
      const sess = this.session;
      this.thinking = true;
      this.refresh();
      uci = await planShout(b, engineStatus === 'fallback' ? null : engine, this.ai);
      if (token !== this.aiToken || this.battle !== b || this.session !== sess || b.fen !== fen) return;
      this.shoutCache.set(fen, uci);
      this.thinking = false;
    }
    this.shout = uci;
    if (uci) {
      const from = uci.slice(0, 2) as Square;
      const piece = b.chess.get(from);
      if (piece) {
        const villages = b.scenario.villages ?? [];
        const line = shoutLine(fen, uci, villages);
        const name = piece.type === 'k' ? b.scenario.enemy.name : FACTION_SPECIES[this.launch.faction][piece.type];
        this.say({ side: 'foe', name: `${name} shouts`, line, type: piece.type }, 1500);
        this.adviseOnShout(fen, uci);
        const plan = `The goblins shout their plan: ${from}→${uci.slice(2, 4)}. They must do it if they still can.`;
        this.statusLine = b.log.length ? `${this.statusLine} ${plan}` : plan;
      }
    }
    this.refresh();
  }

  /**
   * XCOM-style moment: when a real piece (not a squire) is captured, a cinematic band
   * sweeps across the board with the capturer's portrait. Doesn't block play.
   */
  private closeUp(m: Move): boolean {
    if (!this.board || !m.captured || m.captured === 'p' || matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    const L = this.layout();
    const bw = L.board.w;
    const bh = Math.min(150, this.board.height * 0.36);
    const x = L.board.x;
    const y = L.board.y + this.board.height * 0.5 - bh / 2;
    const ally = m.color === 'w';
    const c = this.add.container(0, 0).setDepth(55);
    const band = this.add.graphics();
    band.fillStyle(0x0c090f, 0.82).fillRect(x, y, bw, bh);
    band.fillStyle(ally ? C.gold : C.red, 1).fillRect(x, y, bw, 3).fillRect(x, y + bh - 3, bw, 3);
    c.add(band);
    const pw = bh * 0.72;
    const pc = this.add.container(0, 0);
    portrait(this, x + 18, y + 10, pw, bh - 20, m.promotion ?? m.piece, ally ? 'ally' : 'foe', this.launch.faction, pc);
    c.add(pc);
    const name = this.names.get(m.to);
    const who = ally ? (name ?? `Your ${PIECE_SHORT[m.piece]}`) : FACTION_SPECIES[this.launch.faction][m.piece];
    const t = this.text(x + pw + 34, y + bh / 2, `${who}\ntakes the ${(ally ? this.enemyShort : PIECE_SHORT)[m.captured]}!`, {
      fontFamily: SERIF,
      fontSize: `${Math.round(Math.min(30, bh * 0.2))}px`,
      fontStyle: 'bold',
      color: ally ? '#ffd66b' : '#ff8a73',
      stroke: '#1a0f08',
      strokeThickness: 5,
      lineSpacing: 2,
    });
    t.setOrigin(0, 0.5);
    c.add(t);
    // Sweep in from the mover's side, hold a beat, then fade.
    const dir = ally ? -1 : 1;
    pc.x = dir * bw * 0.4;
    t.x += dir * -bw * 0.25;
    c.alpha = 0;
    this.tweens.add({ targets: c, alpha: 1, duration: 120 });
    this.tweens.add({ targets: pc, x: 0, duration: 320, ease: 'Back.easeOut' });
    this.tweens.add({ targets: t, x: x + pw + 34, duration: 360, ease: 'Cubic.easeOut' });
    this.tweens.add({ targets: c, alpha: 0, duration: 260, delay: 1000, onComplete: () => c.destroy() });
    return true;
  }

  private showBanner(text: string, kind: 'ally' | 'foe', delay = 0) {
    if (delay > 0) {
      const b = this.battle;
      window.setTimeout(() => this.sys.isActive() && this.battle === b && this.showBanner(text, kind), delay);
      return;
    }
    if (!this.board) return;
    const L = this.layout();
    const cx = L.board.x + L.board.w / 2;
    const cy = L.board.y + this.board.height * 0.52;
    const t = this.text(cx, cy, text, {
      fontFamily: SERIF,
      fontSize: `${L.wide ? 52 : 38}px`,
      fontStyle: 'bold',
      color: kind === 'ally' ? '#ffd66b' : '#ff8a73',
      stroke: '#1a0f08',
      strokeThickness: 7,
      shadow: { offsetX: 0, offsetY: 4, color: '#000000', blur: 12, fill: true, stroke: true },
      padding: { x: 10, y: 8 },
    });
    t.setOrigin(0.5).setDepth(60).setScale(0.6).setAlpha(0);
    this.tweens.chain({
      targets: t,
      tweens: [
        { scale: 1.08, alpha: 1, duration: 220, ease: 'Back.easeOut' },
        { scale: 1, duration: 120 },
        { alpha: 0, y: cy - 28, duration: 420, delay: 650, ease: 'Cubic.easeIn' },
      ],
      onComplete: () => t.destroy(),
    });
  }

  // ---------- turn flow ----------

  private describe(res: TurnResult, who: 'you' | 'enemy'): string {
    const m = res.move;
    const [mine, theirs] = who === 'you' ? [PIECE_SHORT, this.enemyShort] : [this.enemyShort, PIECE_SHORT];
    const verb = m.captured ? `takes the ${theirs[m.captured]} on ${m.to}` : `moves to ${m.to}`;
    return `${who === 'you' ? 'Your' : 'Enemy'} ${mine[m.piece]} ${verb}.`;
  }

  /** One-word names for the enemy faction's pieces. */
  private get enemyShort() {
    return FACTION_SHORT[this.launch.faction];
  }

  /** Keeps named characters attached to their pieces as they move. */
  private trackNames(m: Move) {
    if (m.captured) {
      const victim = (m.flags.includes('e') ? `${m.to[0]}${m.from[1]}` : m.to) as Square;
      this.names.delete(victim);
    }
    const name = this.names.get(m.from);
    if (name) {
      this.names.delete(m.from);
      this.names.set(m.to, name);
    }
    if (m.flags.includes('k') || m.flags.includes('q')) {
      const r = m.from[1];
      const [rf, rt] = (m.flags.includes('k') ? [`h${r}`, `f${r}`] : [`a${r}`, `d${r}`]) as [Square, Square];
      const n = this.names.get(rf);
      if (n) {
        this.names.delete(rf);
        this.names.set(rt, n);
      }
    }
  }

  private async playerMove(from: Square, to: Square, promotion?: PieceSymbol) {
    const b = this.battle;
    const sess = this.session;
    const balanceBefore = materialBalance(b.chess, b.player);
    const res = b.playerMove({ from, to, promotion });
    const forkCheck = res.tactics.includes('fork') ? this.confirmFork(b.fen, balanceBefore) : Promise.resolve(false);
    this.selected = null;
    this.statusLine = this.describe(res, 'you');
    this.trackNames(res.move);
    await this.animate(res);
    if (this.battle !== b || this.session !== sess) return; // restarted or left meanwhile
    const closeUp = this.closeUp(res.move);
    // A fork banner only shows when the engine agrees it wins something.
    const forkReal = await forkCheck;
    if (this.battle !== b || this.session !== sess) return;
    const tactics = forkReal ? res.tactics : res.tactics.filter((t) => t !== 'fork');
    this.speak({ ...res, tactics });
    const tag = tactics.find((t) => PLAYER_BANNER[t]);
    if (tag === 'fork' && this.launch.tacticGold) {
      this.tacticGold += TACTIC_GOLD;
      this.showBanner(`Fork! +${TACTIC_GOLD}g`, 'ally', closeUp ? 1150 : 0);
    } else if (tag && !(tag === 'capture' && closeUp)) this.showBanner(PLAYER_BANNER[tag]!, 'ally', closeUp ? 1150 : 0);
    this.refresh();
    this.checkFinished();
    if (b.isEnemyTurn()) void this.enemyTurn();
  }

  private async animate(res: TurnResult) {
    if (!this.board) return;
    // Start the animation first: it marks the board busy, so the refresh below
    // doesn't redraw the pieces in their new places before they've moved.
    const anim = this.board.animateMove(res.move);
    this.animating = true;
    this.refresh();
    try {
      await anim;
    } finally {
      this.animating = false;
      this.flushLayout();
    }
  }

  /** Asks Stockfish whether the fork really wins material (see src/game/tacticCheck.ts). */
  private async confirmFork(fen: string, balanceBefore: number): Promise<boolean> {
    if (engineStatus === 'fallback') return false;
    try {
      const [best] = await engine.analyse(fen, 10, 1);
      return best ? forkPays(balanceBefore, best.score) : false;
    } catch {
      return false;
    }
  }

  private async enemyTurn() {
    const b = this.battle;
    const sess = this.session;
    const token = ++this.aiToken;
    this.thinking = true;
    this.refresh();
    const started = performance.now();
    let uci: string;
    const shout = this.shout;
    const kept = shout !== null && shoutStands(b.fen, shout);
    if (kept) uci = shout;
    else {
      try {
        uci = await chooseEnemyMove(b, engineStatus === 'fallback' ? null : engine, this.ai);
      } catch (err) {
        console.warn('Enemy AI failed, using fallback', err);
        uci = fallbackMove(new Chess(b.fen));
      }
    }
    // A short pause so the enemy's move doesn't feel instant.
    const wait = 450 - (performance.now() - started);
    if (wait > 0) await sleep(wait);
    if (token !== this.aiToken || this.battle !== b || this.session !== sess || !b.isEnemyTurn()) return; // rewound or left meanwhile

    const enemyBefore = materialBalance(b.chess, b.enemy);
    const res = b.enemyMove(uci);
    const enemyFork = res.tactics.includes('fork') ? this.confirmFork(b.fen, enemyBefore) : Promise.resolve(false);
    this.thinking = false;
    this.shout = null;
    this.statusLine = this.describe(res, 'enemy');
    if (shout && !kept) this.statusLine = `Foiled! The goblins couldn’t do what they shouted. ${this.statusLine}`;
    this.trackNames(res.move);
    await this.animate(res);
    if (token !== this.aiToken || this.battle !== b || this.session !== sess) return;
    const enemyCloseUp = this.closeUp(res.move);
    const forkReal = await enemyFork;
    if (token !== this.aiToken || this.battle !== b || this.session !== sess) return;
    const shown = forkReal ? res : { ...res, tactics: res.tactics.filter((t) => t !== 'fork') };
    this.speak(shown, kept);
    const tag = shown.tactics.find((t) => ENEMY_BANNER[t]);
    if (tag) this.showBanner(ENEMY_BANNER[tag]!, 'foe', enemyCloseUp ? 1150 : 0);
    else if (res.move.captured && !enemyCloseUp) this.showBanner('Piece lost', 'foe');
    else if (shout && !kept) this.showBanner('Foiled!', 'ally');
    this.refresh();
    this.checkFinished();
    void this.startPlayerTurn();
  }

  private onSquare(sq: Square) {
    const b = this.battle;
    if (!b.isPlayerTurn() || this.thinking || this.animating || this.finished) return;
    if (this.selected && b.legalMoves(this.selected).some((m) => m.to === sq)) {
      const from = this.selected;
      if (b.needsPromotion(from, sq)) this.askPromotion(from, sq);
      else void this.playerMove(from, sq);
      return;
    }
    const piece = b.chess.get(sq);
    this.selected = piece?.color === b.player && this.selected !== sq ? sq : null;
    this.refresh();
  }

  private askPromotion(from: Square, to: Square) {
    const opts: PieceSymbol[] = ['q', 'r', 'b', 'n'];
    const base = import.meta.env.BASE_URL;
    showModal({
      title: 'Knight your squire',
      html: `<p>Choose what your squire becomes.</p><div class="promo">${opts
        .map((p) => `<button data-p="${p}"><img src="${base}sprites/token-${pieceName(p)}-ally-w.webp" alt=""><small>${esc(PIECE_SHORT[p])}</small></button>`)
        .join('')}</div>`,
      buttons: [{ label: 'Cancel', kind: 'ghost', onClick: () => this.clearSelection() }],
      onDismiss: () => this.clearSelection(),
    });
    for (const el of document.querySelectorAll<HTMLButtonElement>('.promo button')) {
      el.addEventListener('click', () => {
        closeModal();
        void this.playerMove(from, to, el.dataset.p as PieceSymbol);
      });
    }
  }

  private clearSelection() {
    this.selected = null;
    this.refresh();
  }

  private checkFinished() {
    const b = this.battle;
    if (b.status === 'playing' || this.finished) return;
    this.finished = true;
    const won = b.status === 'won';
    if (won) this.board?.celebrate();
    const sess = this.session;
    const token = this.aiToken;
    // Record the result now (pay a win, prepare a defeat's dialog), so leaving before the
    // dialog appears can't lose a win or skip a defeat's cost.
    const canRewind = b.status === 'lost' && b.canRewind();
    const view = this.launch.finish(b, { retry: () => this.restart(), rewind: canRewind ? () => this.rewind() : null }, { tacticGold: this.tacticGold });
    this.pendingView = view;
    const review = this.review(b, token);
    // Let the last banner land (and the review finish, up to a few seconds) before the dialog covers the board.
    const minWait = new Promise((r) => setTimeout(r, won ? 1800 : 900));
    const capped = Promise.race([review, new Promise<ReviewResult>((r) => setTimeout(() => r({ ok: false }), 6000))]);
    void Promise.all([minWait, capped]).then(([, result]) => {
      if (this.battle !== b || this.session !== sess || !this.sys.isActive() || !this.finished || token !== this.aiToken) return;
      const html = view.html.replace(REVIEW_SLOT, reviewHtml(result, won, b.reason));
      showModal({ eyebrow: view.eyebrow, title: view.title, html, tone: won ? 'won' : 'lost', buttons: view.buttons, wide: true });
    });
  }

  /**
   * Replays your moves through Stockfish to find the costliest one. When the goblins'
   * shout still stood after your move, the move is judged after their forced reply,
   * so a deliberate trap isn't mistaken for a blunder.
   */
  private async review(b: Battle, token: number): Promise<ReviewResult> {
    if (engineStatus === 'fallback') return { ok: false };
    const chess = new Chess(b.scenario.fen);
    const plies = b.log.map((san) => {
      const fen = chess.fen();
      const m = chess.move(san);
      return { fen, san, white: m.color === 'w' };
    });
    // The move that ended a won battle isn't a slip, whatever the engine thinks of the position after.
    const all = plies.filter((p) => p.white);
    const mine = (b.status === 'won' ? all.slice(0, -1) : all).slice(-12); // keep long boss games quick
    const out: MoveReview[] = [];
    const DEPTH = 9;
    const firstNumber = all.indexOf(mine[0]);
    for (const [i, p] of mine.entries()) {
      if (token !== this.aiToken) return { ok: false };
      const [best] = await engine.analyse(p.fen, DEPTH, 1);
      if (!best) return { ok: false };
      const before = new Chess(p.fen);
      const bestSan = before.move({ from: best.uci.slice(0, 2), to: best.uci.slice(2, 4), promotion: best.uci[4] as PieceSymbol | undefined }).san;
      const after = new Chess(p.fen);
      after.move(p.san);
      let playedScore: number;
      const shout = this.shoutCache.get(p.fen);
      if (after.isCheckmate()) playedScore = 100_000;
      else if (shout && shoutStands(after.fen(), shout)) {
        after.move({ from: shout.slice(0, 2), to: shout.slice(2, 4), promotion: shout[4] as PieceSymbol | undefined });
        if (after.isCheckmate()) playedScore = -100_000;
        else if (after.isGameOver()) playedScore = 0;
        else playedScore = (await engine.analyse(after.fen(), DEPTH, 1))[0]?.score ?? 0;
      } else if (after.isGameOver()) playedScore = 0;
      else playedScore = -((await engine.analyse(after.fen(), DEPTH, 1))[0]?.score ?? 0);
      out.push({ number: firstNumber + i + 1, played: p.san, best: bestSan, bestScore: best.score, playedScore });
    }
    return { ok: true, mistake: biggestMistake(out) };
  }

  // ---------- controls ----------

  private rewind() {
    const b = this.battle;
    if (!b.canRewind() || this.animating) return;
    closeModal();
    this.aiToken++;
    engine.stop();
    this.thinking = false;
    this.selected = null;
    this.finished = false;
    this.pendingView = null; // a rewind undoes the defeat, so nothing is charged
    b.rewind();
    this.board?.rewindEffect();
    this.statusLine = 'Time folds back. Try a different move.';
    this.showBanner('Rewind', 'ally');
    this.refresh();
    void this.startPlayerTurn();
  }

  private restart() {
    if (this.board?.busy) return;
    this.pendingView?.onAbandon?.();
    closeModal();
    this.reset();
    this.rebuild();
  }

  private toggleThreats() {
    this.threatSight = !this.threatSight;
    this.refresh();
  }

  private togglePieces() {
    if (this.animating) return;
    this.pieceStyle = this.pieceStyle === 'tokens' ? 'classic' : 'tokens';
    store.set('pieceStyle', this.pieceStyle);
    this.rebuild();
  }

  private showLesson() {
    showModal({ eyebrow: 'Lesson', title: this.battle.scenario.title, html: `<p>${esc(this.battle.scenario.lesson)}</p>`, buttons: [{ label: 'Got it', kind: 'primary', onClick: () => {} }], onDismiss: () => {} });
  }

  private leave() {
    this.pendingView?.onAbandon?.();
    this.pendingView = null;
    this.aiToken++;
    engine.stop();
    closeModal();
    this.launch.exit();
  }
}

const fmt = (n: number) => (n > 0 ? `+${n}` : String(n));
const pickOne = (xs: string[]) => xs[Math.floor(Math.random() * xs.length)];
