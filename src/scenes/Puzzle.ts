import { Chess, type Move, type PieceSymbol, type Square } from 'chess.js';
import type Phaser from 'phaser';
import { checkPuzzleMove, type Puzzle } from '../game/bounty';
import type { StarterType } from '../game/campaign';
import { THEME_TEXT, puzzleTheme } from '../puzzles';
import { store } from '../store';
import { esc, showModal } from '../ui/overlay';
import { BOARD_SPAN, BOARD_TALL, PhaserBoard, type PieceStyle } from '../ui/phaserBoard';
import { speakerCard } from '../ui/portrait';
import { BaseScene } from '../ui/screen';
import { SPECIES, type SpeakerInfo } from '../ui/speaker';
import { C, CSS, SERIF } from '../ui/theme';
import { button, coverImage, eyebrow, panel, para } from '../ui/widgets';

export interface PuzzleLaunch {
  puzzle: Puzzle;
  pay: number;
  companion: { type: StarterType; name: string };
  /** Called once with the result; returns the gold actually paid. */
  settle: (solved: boolean) => number;
  exit: () => void;
}

const toMove = (uci: string) => ({ from: uci.slice(0, 2) as Square, to: uci.slice(2, 4) as Square, promotion: uci[4] as PieceSymbol | undefined });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const HINT: Record<string, string> = {
  mateIn1: 'Look at every check first. Which one leaves the king no way out?',
  hangingPiece: 'Count attackers and defenders. Which piece is nobody protecting?',
};

/** A bounty: a real Lichess puzzle played on the battle board. One wrong move and the bounty is lost. */
export class PuzzleScene extends BaseScene {
  private launch!: PuzzleLaunch;
  private chess!: Chess;
  private solver: 'w' | 'b' = 'w';
  private step = 0;
  private state: 'setup' | 'solving' | 'replying' | 'solved' | 'failed' = 'setup';
  private selected: Square | null = null;
  private lastMove: { from: Square; to: Square } | null = null;
  private hint: { from: Square; to: Square } | null = null;
  private board: PhaserBoard | null = null;
  private panelLayer: Phaser.GameObjects.Container | null = null;
  private speakerLayer: Phaser.GameObjects.Container | null = null;
  private speaker: SpeakerInfo | null = null;
  private pieceStyle: PieceStyle = 'tokens';
  private firstBuild = true;
  private busy = false;

  constructor() {
    super('puzzle');
  }

  init(data: PuzzleLaunch) {
    this.board = null;
    this.panelLayer = null;
    this.speakerLayer = null;
    this.launch = data;
    this.chess = new Chess(data.puzzle.fen);
    // The solver is whoever moves after the opponent's setup move.
    this.solver = this.chess.turn() === 'w' ? 'b' : 'w';
    this.step = 0;
    this.state = 'setup';
    this.selected = null;
    this.lastMove = null;
    this.hint = null;
    this.firstBuild = true;
    this.pieceStyle = store.get('pieceStyle') === 'classic' ? 'classic' : 'tokens';
    const c = data.companion;
    this.speaker = { side: 'ally', name: `${c.name} · ${SPECIES[c.type]}`, line: HINT[puzzleTheme(data.puzzle)], type: c.type };
  }

  protected canRebuild() {
    return !this.board?.busy;
  }

  private layout() {
    const { W, H, safe } = this;
    const topH = 52 + safe.top;
    if (this.wide) {
      const panelW = Math.min(380, Math.max(300, W * 0.32));
      const sq = Math.min(80, (H - topH - 16) / BOARD_TALL, (W - panelW - 56) / BOARD_SPAN);
      const bw = sq * BOARD_SPAN;
      const bx = Math.max(16, (W - bw - 24 - panelW) / 2);
      return { wide: true, board: { x: bx, y: topH, w: bw }, panel: { x: bx + bw + 24, y: topH + 8, w: panelW } };
    }
    const sq = Math.min(W / BOARD_SPAN, (H - topH - 230 - safe.bottom) / BOARD_TALL, 64);
    const bw = sq * BOARD_SPAN;
    const pw = Math.min(W - 24, 560);
    return { wide: false, board: { x: (W - bw) / 2, y: topH - 6, w: bw }, panel: { x: (W - pw) / 2, y: topH - 6 + sq * BOARD_TALL + 4, w: pw } };
  }

  protected build() {
    const L = this.layout();
    coverImage(this, 'bg-town', 0.6);
    const s = this.safe.top;
    const g = this.add.graphics();
    g.fillStyle(C.bg, 0.82).fillRect(0, 0, this.W, s + 48);
    g.lineStyle(1, C.line, 1).lineBetween(0, s + 48, this.W, s + 48);
    button(this, 12, s + 7, '← Town', { w: 84, h: 34, kind: 'ghost', onClick: () => this.leave() });
    eyebrow(this, 108, s + 6, 'Bounty board');
    this.text(108, s + 19, THEME_TEXT[puzzleTheme(this.launch.puzzle)].name, { fontFamily: SERIF, fontSize: '20px', fontStyle: 'bold' });

    this.board = new PhaserBoard(this, L.board.x, L.board.y, L.board.w, {
      faction: 'bog',
      style: this.pieceStyle,
      intro: this.firstBuild,
      flipped: this.solver === 'b',
      allyColor: this.solver,
      onSquare: (sq) => this.onSquare(sq),
    });
    this.panelLayer = null;
    this.speakerLayer = null;
    this.refresh();
    this.drawSpeaker();
    if (this.firstBuild) {
      this.firstBuild = false;
      void this.playSetup();
    }
  }

  private async playSetup() {
    await sleep(900);
    if (!this.sys.isActive()) return;
    await this.play(this.launch.puzzle.moves[0]);
    this.state = 'solving';
    this.refresh();
  }

  private async play(uci: string): Promise<Move> {
    const m = this.chess.move(toMove(uci));
    this.lastMove = { from: m.from, to: m.to };
    this.selected = null;
    this.busy = true;
    const anim = this.board?.animateMove(m); // before refresh, so pieces don't jump ahead
    this.refresh();
    await anim;
    this.busy = false;
    this.refresh();
    this.flushLayout();
    return m;
  }

  private refresh() {
    if (!this.board) return;
    const targets = new Set<Square>(
      this.selected && this.state === 'solving' ? this.chess.moves({ square: this.selected, verbose: true }).map((m) => m.to) : [],
    );
    this.board.render({ chess: this.chess, selected: this.selected, targets, lastMove: this.lastMove, threats: null, villages: [], hint: this.hint });
    this.drawPanel();
  }

  private drawPanel() {
    this.panelLayer?.destroy();
    const L = this.layout();
    const c = this.add.container(0, 0);
    this.panelLayer = c;
    const p = this.launch.puzzle;
    const theme = THEME_TEXT[puzzleTheme(p)];
    const { x, w } = L.panel;
    let y = L.panel.y + (L.wide ? 132 : 0);
    const pad = 14;
    const side = this.solver === 'w' ? 'White' : 'Black';
    const status =
      this.state === 'setup'
        ? 'The goblins make their move…'
        : this.state === 'solving'
          ? `You play ${side}. ${theme.task}`
          : this.state === 'replying'
            ? 'Good! The goblins answer…'
            : this.state === 'solved'
              ? 'Solved! The bounty is yours.'
              : 'Not quite. The green squares show the answer.';
    const title = this.text(x + pad, y + 28, theme.task, { fontFamily: SERIF, fontSize: '18px', fontStyle: 'bold', color: CSS.gold, wordWrap: { width: w - pad * 2 } });
    const st = para(this, x + pad, y + 34 + title.height, status, w - pad * 2, 15, CSS.ink);
    const h = 44 + title.height + st.height + 10;
    c.add([panel(this, x, y, w, h), eyebrow(this, x + pad, y + 12, `Pays ${this.launch.pay}g · rated ${p.rating}`), title, st]);
    y += h + 10;
    if (this.state === 'solving' || this.state === 'setup') {
      c.add(button(this, x, y, 'Give up', { w: Math.min(160, w), h: 40, kind: 'ghost', onClick: () => this.fail() }));
    } else if (this.state === 'solved' || this.state === 'failed') {
      c.add(button(this, x, y, 'Back to town', { w: Math.min(200, w), h: 40, kind: 'primary', onClick: () => this.leave() }));
    }
    y += 52;
    if (L.wide) {
      const note = para(this, x, y, 'Bounties are real puzzles from the Lichess puzzle database (CC0). One wrong move and the bounty is gone until the board refreshes after your next battle.', w, 13, CSS.muted);
      c.add(note);
    }
  }

  private drawSpeaker() {
    this.speakerLayer?.destroy();
    this.speakerLayer = null;
    if (!this.speaker) return;
    const L = this.layout();
    if (L.wide) {
      this.speakerLayer = speakerCard(this, L.panel.x, L.panel.y, L.panel.w, this.speaker, 'bog', false).container;
      return;
    }
    const { container, height } = speakerCard(this, 12, 0, this.W - 24, this.speaker, 'bog', true);
    container.y = this.H - height - Math.max(12, this.safe.bottom);
    container.setDepth(50);
    this.speakerLayer = container;
    this.tweens.add({ targets: container, alpha: 0, duration: 800, delay: 3500 });
  }

  private say(line: string) {
    const c = this.launch.companion;
    this.speaker = { side: 'ally', name: `${c.name} · ${SPECIES[c.type]}`, line, type: c.type };
    this.drawSpeaker();
  }

  private onSquare(sq: Square) {
    if (this.state !== 'solving' || this.busy) return;
    if (this.selected) {
      const legal = this.chess.moves({ square: this.selected, verbose: true }).filter((m) => m.to === sq);
      if (legal.length) {
        const expected = this.launch.puzzle.moves[1 + 2 * this.step] ?? '';
        const promo = legal[0].promotion ? (expected.startsWith(this.selected + sq) && expected[4] ? expected[4] : 'q') : '';
        void this.attempt(`${this.selected}${sq}${promo}`);
        return;
      }
    }
    const piece = this.chess.get(sq);
    this.selected = piece?.color === this.solver && this.selected !== sq ? sq : null;
    this.refresh();
  }

  private async attempt(uci: string) {
    const p = this.launch.puzzle;
    const verdict = checkPuzzleMove(p, this.step, uci);
    this.state = 'replying';
    const expected = p.moves[1 + 2 * this.step];
    await this.play(uci);
    if (verdict === 'wrong') {
      // Take the wrong move back so the answer is shown on the position it belongs to.
      this.chess.undo();
      this.lastMove = null;
      return this.fail(expected);
    }
    if (verdict === 'solved') {
      this.state = 'solved';
      const gold = this.launch.settle(true);
      this.say(this.chess.isCheckmate() ? 'Checkmate! That’s the one.' : 'Clean as a whistle. That piece is ours.');
      this.banner(`+${gold}g`);
      this.refresh();
      return;
    }
    this.step++;
    await sleep(350);
    await this.play(p.moves[2 * this.step]);
    this.state = 'solving';
    this.say('Good! Keep going: there’s more to win.');
    this.refresh();
  }

  private fail(expected?: string) {
    if (this.state === 'failed' || this.state === 'solved') return;
    const p = this.launch.puzzle;
    const answer = expected ?? p.moves[1 + 2 * this.step];
    this.state = 'failed';
    this.launch.settle(false);
    // Show the answer from the position where it was needed.
    const probe = new Chess(p.fen);
    for (let i = 0; i < 1 + 2 * this.step; i++) probe.move(toMove(p.moves[i]));
    let san = answer;
    try {
      san = probe.move(toMove(answer)).san;
    } catch {
      /* keep the UCI */
    }
    this.hint = { from: answer.slice(0, 2) as Square, to: answer.slice(2, 4) as Square };
    this.say(`Ah, so close. The answer was ${san}. We’ll get the next one.`);
    this.refresh();
  }

  private banner(text: string) {
    const L = this.layout();
    const t = this.text(L.board.x + L.board.w / 2, L.board.y + (this.board?.height ?? 300) * 0.5, text, {
      fontFamily: SERIF,
      fontSize: '52px',
      fontStyle: 'bold',
      color: '#ffd66b',
      stroke: '#1a0f08',
      strokeThickness: 7,
    });
    t.setOrigin(0.5).setDepth(60).setScale(0.6);
    this.tweens.chain({
      targets: t,
      tweens: [
        { scale: 1.08, duration: 220, ease: 'Back.easeOut' },
        { scale: 1, duration: 120 },
        { alpha: 0, duration: 420, delay: 900 },
      ],
      onComplete: () => t.destroy(),
    });
  }

  private leave() {
    if (this.state === 'solving' || this.state === 'setup') {
      showModal({
        title: 'Abandon the bounty?',
        html: `<p>${esc('Leaving now counts as giving up, and this bounty comes off the board.')}</p>`,
        buttons: [
          {
            label: 'Give up and leave',
            onClick: () => {
              this.fail();
              this.launch.exit();
            },
          },
          { label: 'Keep trying', kind: 'primary', onClick: () => {} },
        ],
        onDismiss: () => {},
      });
      return;
    }
    this.launch.exit();
  }
}
