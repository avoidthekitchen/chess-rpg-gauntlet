import { Chess, type Color, type Move, type PieceSymbol, type Square } from 'chess.js';
import { materialBalance } from './material';
import { moveLimit, type Scenario } from './scenarios';
import { detectTactics, type TacticTag } from './tactics';

export type Status = 'playing' | 'won' | 'lost';

export interface MoveInput {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
}

export interface TurnResult {
  move: Move;
  tactics: TacticTag[];
}

/** Everything a rewind needs to restore. */
interface Snapshot {
  /** Half-moves played so far. Rewinding undoes back to here, which keeps chess.js's repetition count right. */
  plies: number;
  playerMoves: number;
  enemyMoves: number;
  piecesLost: number;
  log: string[];
  lastMove: { from: Square; to: Square } | null;
}

/**
 * The rules of one battle: objectives, move limits, villages and rewinds.
 * Plain logic with no DOM, so it can be unit tested and reused by other front ends.
 */
export class Battle {
  readonly player: Color = 'w';
  readonly enemy: Color = 'b';
  readonly chess: Chess;

  playerMoves = 0;
  enemyMoves = 0;
  piecesLost = 0;
  status: Status = 'playing';
  reason = '';
  rewindsLeft: number;
  log: string[] = [];
  lastMove: { from: Square; to: Square } | null = null;

  private readonly startBalance: number;
  private history: Snapshot[] = [];

  constructor(
    readonly scenario: Scenario,
    rewinds: number,
  ) {
    this.chess = new Chess(scenario.fen);
    if (this.chess.turn() !== this.player) throw new Error(`${scenario.id}: player must move first`);
    this.startBalance = materialBalance(this.chess, this.player);
    this.rewindsLeft = rewinds;
  }

  get fen(): string {
    return this.chess.fen();
  }

  isPlayerTurn(): boolean {
    return this.status === 'playing' && this.chess.turn() === this.player;
  }

  isEnemyTurn(): boolean {
    return this.status === 'playing' && this.chess.turn() === this.enemy;
  }

  legalMoves(from: Square): Move[] {
    if (!this.isPlayerTurn()) return [];
    return this.chess.moves({ square: from, verbose: true });
  }

  needsPromotion(from: Square, to: Square): boolean {
    return this.legalMoves(from).some((m) => m.to === to && m.promotion);
  }

  materialGained(): number {
    return materialBalance(this.chess, this.player) - this.startBalance;
  }

  movesLeft(): number | undefined {
    const limit = moveLimit(this.scenario.objective);
    return limit === undefined ? undefined : limit - this.playerMoves;
  }

  /** Squares where an enemy piece is standing on a village. */
  raidedVillages(): Square[] {
    return (this.scenario.villages ?? []).filter((sq) => this.chess.get(sq)?.color === this.enemy);
  }

  playerMove(input: MoveInput): TurnResult {
    if (!this.isPlayerTurn()) throw new Error('Not your turn');
    this.history.push(this.snapshot());
    const move = this.chess.move(input); // throws on an illegal move
    this.playerMoves++;
    this.record(move);
    this.judgeAfterPlayer(move);
    return { move, tactics: detectTactics(this.chess, move) };
  }

  /** Applies the enemy's move in UCI form, e.g. "e7e5" or "b2b1q". */
  enemyMove(uci: string): TurnResult {
    if (!this.isEnemyTurn()) throw new Error('Not the enemy turn');
    const move = this.chess.move({
      from: uci.slice(0, 2) as Square,
      to: uci.slice(2, 4) as Square,
      promotion: (uci[4] as PieceSymbol | undefined) ?? undefined,
    });
    this.enemyMoves++;
    if (move.captured) this.piecesLost++;
    this.record(move);
    this.judgeAfterEnemy();
    return { move, tactics: detectTactics(this.chess, move) };
  }

  canRewind(): boolean {
    return this.rewindsLeft > 0 && this.history.length > 0 && this.status !== 'won';
  }

  /** Undoes your last move (and the enemy's reply). Costs one rewind charge. */
  rewind(): boolean {
    if (!this.canRewind()) return false;
    const s = this.history.pop()!;
    // Undo rather than reload a FEN: a reload would forget earlier positions, so a threefold repetition could be missed.
    while (this.chess.history().length > s.plies) this.chess.undo();
    this.playerMoves = s.playerMoves;
    this.enemyMoves = s.enemyMoves;
    this.piecesLost = s.piecesLost;
    this.log = s.log;
    this.lastMove = s.lastMove;
    this.status = 'playing';
    this.reason = '';
    this.rewindsLeft--;
    return true;
  }

  private snapshot(): Snapshot {
    return {
      plies: this.chess.history().length,
      playerMoves: this.playerMoves,
      enemyMoves: this.enemyMoves,
      piecesLost: this.piecesLost,
      log: [...this.log],
      lastMove: this.lastMove,
    };
  }

  private record(move: Move) {
    this.log.push(move.san);
    this.lastMove = { from: move.from, to: move.to };
  }

  private end(status: Status, reason: string) {
    this.status = status;
    this.reason = reason;
  }

  private judgeAfterPlayer(move: Move) {
    const o = this.scenario.objective;
    const c = this.chess;
    const survive = o.kind === 'survive';

    if (c.isCheckmate()) return this.end('won', 'Checkmate! The enemy commander is captured.');
    if (c.isStalemate()) {
      return survive
        ? this.end('won', 'The enemy has no moves left. The villages are safe.')
        : this.end('lost', 'Stalemate! The enemy has no legal moves but isn’t in check, so they escape.');
    }
    if (o.kind === 'promote' && move.promotion && this.promotionIsSafe(move.to)) {
      return this.end('won', 'Your squire reaches the far wall and is knighted!');
    }
    // Material only counts once the enemy has had a chance to take back: a grab that's
    // simply recaptured hasn't won anything. So wait for the reply (even on the last move).
    if (o.kind === 'winMaterial' && this.materialGained() >= o.gain) return;
    if (this.raidedVillages().length > 0) {
      return this.end('lost', 'A raider was left standing on a village, and it burned.');
    }
    if (survive && this.enemyMoves >= o.turns) {
      return this.end('won', 'Reinforcements arrive. The villages are safe!');
    }
    if (c.isDraw()) {
      return survive
        ? this.end('won', 'The battle ends in a draw, and the villages are safe.')
        : this.end('lost', 'The battle ends in a draw. The enemy slips away.');
    }
    const left = this.movesLeft();
    if (left !== undefined && left <= 0) return this.end('lost', 'Out of moves. The enemy regroups and escapes.');
  }

  private judgeAfterEnemy() {
    const o = this.scenario.objective;
    const c = this.chess;
    const survive = o.kind === 'survive';

    if (c.isCheckmate()) return this.end('lost', 'Checkmate. Your king has fallen.');
    if (o.kind === 'winMaterial') {
      if (this.materialGained() >= o.gain) {
        return this.end('won', `You won ${this.materialGained()} points of material and kept them. The enemy flees!`);
      }
      const left = this.movesLeft();
      if (left !== undefined && left <= 0) return this.end('lost', 'They took it back, and you’re out of moves. The enemy regroups and escapes.');
    }
    if (c.isDraw()) {
      return survive
        ? this.end('won', 'The battle ends in a draw, and the villages are safe.')
        : this.end('lost', c.isStalemate() ? 'Stalemate: you have no legal moves.' : 'The battle ends in a draw.');
    }
    if (survive && this.enemyMoves >= o.turns && this.raidedVillages().length === 0) {
      return this.end('won', 'Reinforcements arrive. The villages are safe!');
    }
  }

  /** A promotion only counts if the new piece can't simply be captured for free. */
  private promotionIsSafe(square: Square): boolean {
    return !this.chess.isAttacked(square, this.enemy) || this.chess.isAttacked(square, this.player);
  }
}
