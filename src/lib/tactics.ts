// Tactical Pattern Detection Engine
// Detects Forks, Pins, Skewers, Discovered Attacks, and Hanging Pieces

import { Chess } from 'chess.js';
import type { Square, Move, PieceSymbol, Color } from 'chess.js';
import { 
  getAttacksFrom,
  getAttackersOf, 
  getAttackedPieces, 
  isHanging,
  PIECE_VALUES,
} from './attackMap';
import type { AttackInfo } from './attackMap';

export type TacticType = 
  | 'fork' 
  | 'pin' 
  | 'skewer' 
  | 'discovered_attack' 
  | 'discovered_check'
  | 'hanging' 
  | 'removal_of_defender'
  | 'double_attack'
  | 'pigs_on_7th'
  | 'defender'
  | 'fork_threat'
  | 'backrank_mate'
  | 'mate_in_1'
  | 'mate_in_2'
  | 'mate_in_3'
  | 'blunder'
  | 'mate';

export interface TacticTag {
  type: TacticType;
  square: string;          // Key square (e.g., the forking piece's square)
  targets?: string[];      // Squares of attacked pieces
  attacker?: string;       // Piece symbol of the attacking piece
  severity: 'winning' | 'equalizing' | 'losing';
  description: string;     // Human-readable explanation
}

// Piece symbols for display
const PIECE_NAMES: Record<PieceSymbol, string> = {
  p: 'Pawn',
  n: 'Knight',
  b: 'Bishop',
  r: 'Rook',
  q: 'Queen',
  k: 'King',
};

const PIECE_ICONS: Record<PieceSymbol, string> = {
  p: '♟',
  n: '♞',
  b: '♝',
  r: '♜',
  q: '♛',
  k: '♚',
};

export class TacticEngine {
  /**
   * Main entry point: Detect all tactics resulting from a move
   */
  detectTactics(beforeFen: string, afterFen: string, move: Move, ply: number = 0, mateScore?: number): TacticTag[] {
    const tactics: TacticTag[] = [];
    const beforeBoard = new Chess(beforeFen);
    const afterBoard = new Chess(afterFen);

    // Mating Motifs first (High Priority)
    const mateInX = this.detectMateInX(afterBoard, move, mateScore);
    if (mateInX) tactics.push(mateInX);

    const backrank = this.detectBackrankMate(afterBoard, move);
    if (backrank) tactics.push(backrank);

    // Fork detection
    const fork = this.detectFork(afterBoard, move);
    if (fork) tactics.push(fork);

    // Pin/Skewer detection
    const pinSkewer = this.detectPinOrSkewer(afterBoard, move);
    if (pinSkewer) tactics.push(pinSkewer);

    // Discovered attack
    const discovered = this.detectDiscoveredAttack(beforeBoard, afterBoard, move);
    if (discovered) tactics.push(discovered);

    // Hanging pieces
    const hanging = this.detectHangingPieces(afterBoard, move);
    tactics.push(...hanging);

    // Removal of the defender
    const removal = this.detectRemovalOfDefender(beforeBoard, afterBoard, move);
    if (removal) tactics.push(removal);

    // Positional Motifs
    const pigs = this.detectPigsOn7th(afterBoard, move);
    if (pigs) tactics.push(pigs);

    const defensive = this.detectDefender(beforeBoard, afterBoard, move, ply);
    if (defensive) tactics.push(defensive);

    // Offensive: Fork Threats
    const forkThreat = this.detectForkThreat(afterBoard, move);
    if (forkThreat) tactics.push(forkThreat);

    return tactics;
  }

  /**
   * Detect if a move creates a fork (one piece attacking 2+ valuable targets)
   */
  private detectFork(board: Chess, move: Move): TacticTag | null {
    const piece = board.get(move.to as Square);
    if (!piece) return null;

    const attackedPieces = getAttackedPieces(board, move.to as Square);
    
    // Filter to valuable targets (Knights+ or undefended pieces)
    // IGNORE PAWNS as targets (unless endgame, or promoting)
    const isEndgame = this.isEndgame(board);
    
    const valuableTargets = attackedPieces.filter(target => {
      // King or Queen are always valuable
      if (target.piece === 'k' || target.piece === 'q') return true;
      
      // Ignore pawns as targets for forks unless it's endgame
      if (target.piece === 'p' && !isEndgame) return false;

      // Rook is valuable if attacker is minor piece or pawn
      if (target.piece === 'r' && PIECE_VALUES[piece.type] < PIECE_VALUES['r']) return true;
      
      // Any piece that's now hanging counts
      if (isHanging(board, target.square)) return true;
      return false;
    });

    if (valuableTargets.length >= 2) {
      // Pawn forks are often just "pawn structure" checks, unless winning material
      if (piece.type === 'p' && !isEndgame) {
        // Only count pawn fork if it attacks two major pieces (> pawn)
        const majorTargets = valuableTargets.filter(t => PIECE_VALUES[t.piece] > PIECE_VALUES['p']);
        if (majorTargets.length < 2) return null;
      }

      const targetNames = valuableTargets.map(t => PIECE_NAMES[t.piece]).join(' and ');
      const severity = valuableTargets.some(t => t.piece === 'k' || t.piece === 'q') 
        ? 'winning' 
        : 'equalizing';

      return {
        type: 'fork',
        square: move.to,
        targets: valuableTargets.map(t => t.square),
        attacker: piece.type,
        severity,
        description: `${PIECE_NAMES[piece.type]} Fork! Attacks the ${targetNames}.`,
      };
    }

    return null;
  }

  /**
   * Detect pins and skewers (linear tactics)
   */
  private detectPinOrSkewer(board: Chess, move: Move): TacticTag | null {
    const piece = board.get(move.to as Square);
    if (!piece) return null;

    // Only sliding pieces can create pins/skewers
    if (!['b', 'r', 'q'].includes(piece.type)) return null;

    const directions = this.getRayDirections(piece.type);
    const enemyColor = piece.color === 'w' ? 'b' : 'w';
    const isEndgame = this.isEndgame(board);

    for (const [df, dr] of directions) {
      const piecesOnRay = this.castRay(board, move.to as Square, df, dr, enemyColor);
      
      if (piecesOnRay.length >= 2) {
        const [front, back] = piecesOnRay;
        
        // Ignore pawns involved in pins unless endgame (too noisy)
        if (!isEndgame && (front.piece === 'p' || back.piece === 'p')) continue;

        // Pin: more valuable piece behind (typically King)
        if (back.piece === 'k' || PIECE_VALUES[back.piece] > PIECE_VALUES[front.piece]) {
          return {
            type: 'pin',
            square: move.to,
            targets: [front.square, back.square],
            attacker: piece.type,
            severity: 'winning',
            description: `${PIECE_NAMES[front.piece]} is pinned to the ${PIECE_NAMES[back.piece]}!`,
          };
        }
        
        // Skewer: more valuable piece in front
        if (PIECE_VALUES[front.piece] > PIECE_VALUES[back.piece]) {
          return {
            type: 'skewer',
            square: move.to,
            targets: [front.square, back.square],
            attacker: piece.type,
            severity: 'winning',
            description: `Skewer! The ${PIECE_NAMES[front.piece]} must move, exposing the ${PIECE_NAMES[back.piece]}.`,
          };
        }
      }
    }

    return null;
  }

  /**
   * Get ray directions for a sliding piece
   */
  private getRayDirections(pieceType: PieceSymbol): [number, number][] {
    const diagonals: [number, number][] = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    const orthogonals: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    if (pieceType === 'b') return diagonals;
    if (pieceType === 'r') return orthogonals;
    if (pieceType === 'q') return [...diagonals, ...orthogonals];
    return [];
  }

  /**
   * Cast a ray from a square in a direction, collecting enemy pieces
   */
  private castRay(board: Chess, from: Square, df: number, dr: number, enemyColor: Color): AttackInfo[] {
    const pieces: AttackInfo[] = [];
    let file = from.charCodeAt(0) - 97 + df;
    let rank = parseInt(from[1]) - 1 + dr;

    while (file >= 0 && file < 8 && rank >= 0 && rank < 8) {
      const square = (String.fromCharCode(97 + file) + (rank + 1)) as Square;
      const piece = board.get(square);

      if (piece) {
        if (piece.color === enemyColor) {
          pieces.push({
            square,
            piece: piece.type,
            color: piece.color,
            value: PIECE_VALUES[piece.type],
          });
          if (pieces.length >= 2) break; // We only need 2 for pin/skewer
        } else {
          break; // Friendly piece blocks the ray
        }
      }

      file += df;
      rank += dr;
    }

    return pieces;
  }

  /**
   * Detect discovered attacks (a piece moves, revealing an attack by another piece)
   */
  private detectDiscoveredAttack(beforeBoard: Chess, afterBoard: Chess, move: Move): TacticTag | null {
    const movedPiece = afterBoard.get(move.to as Square);
    if (!movedPiece) return null;

    const playerColor = movedPiece.color;
    const enemyColor = playerColor === 'w' ? 'b' : 'w';

    // Check all player's sliding pieces for new attacks
    const allSquares = this.getAllSquares();
    
    for (const square of allSquares) {
      if (square === move.to) continue; // Skip the piece that moved
      
      const piece = afterBoard.get(square);
      if (!piece || piece.color !== playerColor) continue;
      if (!['b', 'r', 'q'].includes(piece.type)) continue;

      // Check if this piece attacks something valuable now that it didn't before
      const beforeAttacks = this.getAttackedEnemyPieces(beforeBoard, square, enemyColor);
      const afterAttacks = this.getAttackedEnemyPieces(afterBoard, square, enemyColor);

      // Find new attacks
      const newAttacks = afterAttacks.filter(a => 
        !beforeAttacks.some(b => b.square === a.square)
      );

      for (const attack of newAttacks) {
        // Discovered check is most dangerous
        if (attack.piece === 'k') {
          return {
            type: 'discovered_check',
            square: square,
            targets: [attack.square],
            attacker: piece.type,
            severity: 'winning',
            description: `Discovered Check! The ${PIECE_NAMES[movedPiece.type]} uncovers the ${PIECE_NAMES[piece.type]}.`,
          };
        }

        // Discovered attack on Queen or Rook
        if (attack.piece === 'q' || attack.piece === 'r') {
          return {
            type: 'discovered_attack',
            square: square,
            targets: [attack.square],
            attacker: piece.type,
            severity: 'winning',
            description: `Discovered Attack on the ${PIECE_NAMES[attack.piece]}!`,
          };
        }
      }
    }

    return null;
  }

  /**
   * Detect hanging pieces left after the move
   */
  private detectHangingPieces(board: Chess, move: Move): TacticTag[] {
    const tags: TacticTag[] = [];
    const movedPiece = board.get(move.to as Square);
    if (!movedPiece) return tags;

    const enemyColor = movedPiece.color === 'w' ? 'b' : 'w';
    const allSquares = this.getAllSquares();

    for (const square of allSquares) {
      const piece = board.get(square);
      if (!piece || piece.color !== enemyColor) continue;
      if (piece.type === 'k') continue; // King can't be "hanging" in normal sense

      if (isHanging(board, square)) {
        tags.push({
          type: 'hanging',
          square: square,
          attacker: movedPiece.type,
          severity: PIECE_VALUES[piece.type] >= PIECE_VALUES['r'] ? 'winning' : 'equalizing',
          description: `${PIECE_NAMES[piece.type]} on ${square} is hanging!`,
        });
      }
    }

    return tags;
  }

  /**
   * Detect if two rooks are on the opponent's 2nd/7th rank ("Pigs on the 7th")
   */
  private detectPigsOn7th(board: Chess, move: Move): TacticTag | null {
    const movedPiece = board.get(move.to as Square);
    if (!movedPiece || movedPiece.type !== 'r') return null;

    const targetRank = movedPiece.color === 'w' ? '7' : '2';
    if (move.to[1] !== targetRank) return null;

    // Check if there's another rook on this rank
    const playerColor = movedPiece.color;
    const allSquares = this.getAllSquares();
    const rooksOnRank = allSquares.filter(sq => {
      if (sq === move.to) return false;
      const p = board.get(sq);
      return p && p.type === 'r' && p.color === playerColor && sq[1] === targetRank;
    });

    if (rooksOnRank.length >= 1) {
      return {
        type: 'pigs_on_7th',
        square: move.to,
        targets: rooksOnRank,
        attacker: 'r',
        severity: 'winning',
        description: `Pigs on the 7th! Your rooks are dominating the ${targetRank}th rank, creating a massive checkmate threat.`,
      };
    }

    return null;
  }

  /**
   * Detect if a move protects an attacked piece
   */
  private detectDefender(beforeBoard: Chess, afterBoard: Chess, move: Move, ply: number = 0): TacticTag | null {
    const movedPiece = afterBoard.get(move.to as Square);
    if (!movedPiece) return null;

    const playerColor = movedPiece.color;
    const enemyColor = playerColor === 'w' ? 'b' : 'w';

    // We look for pieces that were being attacked before BUT are now defended by the piece that moved
    const allSquares = this.getAllSquares();
    
    for (const square of allSquares) {
        if (square === move.to) continue; // Skip moved piece
        
        const piece = afterBoard.get(square);
        if (!piece || piece.color !== playerColor) continue;

        // Was this piece being attacked?
        const attackersBefore = getAttackersOf(beforeBoard, square, enemyColor);
        if (attackersBefore.length === 0) continue;

        // Is the moved piece now defending it?
        const defendersAfter = getAttackersOf(afterBoard, square, playerColor);
        const isNowDefendedByUs = defendersAfter.some(d => d.square === move.to);

        if (isNowDefendedByUs) {
            // Is it a valuable piece?
            if (PIECE_VALUES[piece.type] >= PIECE_VALUES['p']) {
                const suffix = ply % 2 === 0 ? "Textbook." : "Textbook defense.";
                return {
                    type: 'defender',
                    square: move.to,
                    targets: [square],
                    attacker: movedPiece.type,
                    severity: 'equalizing',
                    description: `Protecting the ${PIECE_NAMES[piece.type]} on ${square}. ${suffix}`,
                };
            }
        }
    }

    return null;
  }

  /**
   * Detect if a move threatens a fork (attacks a square that would result in a fork)
   */
  private detectForkThreat(board: Chess, move: Move): TacticTag | null {
    const piece = board.get(move.to as Square);
    if (!piece || !['n', 'b', 'r', 'q'].includes(piece.type)) return null;

    // We mainly care about Knight/Minor fork threats on key squares
    const forkSquares: Square[] = ['c2', 'c7', 'f2', 'f7', 'e2', 'e7', 'd2', 'd7'];
    const attackedSquares = getAttacksFrom(board, move.to as Square);

    // Filter to critical target squares first to avoid expensive simulations
    const criticalTargets = attackedSquares.filter(sq => forkSquares.includes(sq));
    if (criticalTargets.length === 0) return null;

    // Re-use a single virtual board for all checks
    const virtualBoard = new Chess(board.fen());
    
    for (const targetSq of criticalTargets) {
        // Remove whatever is on targetSq (if anything) and place our piece there
        const oldPiece = virtualBoard.remove(targetSq);
        virtualBoard.put({ type: piece.type, color: piece.color }, targetSq);
        
        // Check for fork (one piece attacking 2+ valuable targets)
        const valTargets = getAttackedPieces(virtualBoard, targetSq).filter(t => {
            if (t.piece === 'k' || t.piece === 'q') return true;
            if (t.piece === 'r' && PIECE_VALUES[piece.type] < PIECE_VALUES['r']) return true;
            if (isHanging(virtualBoard, t.square)) return true;
            return false;
        });

        // Restore virtual board for next target
        virtualBoard.remove(targetSq);
        if (oldPiece) virtualBoard.put(oldPiece, targetSq);

        if (valTargets.length >= 2) {
            const targetNames = Array.from(new Set(valTargets.map(t => PIECE_NAMES[t.piece]))).join(' and ');
            return {
                type: 'fork_threat',
                square: move.to,
                targets: [targetSq],
                attacker: piece.type,
                severity: 'winning',
                description: `Attacking the ${targetSq} square for a possible ${PIECE_NAMES[piece.type]} fork on the ${targetNames}.`,
            };
        }
    }

    return null;
  }

  /**
   * Detect removal of the defender
   */
  private detectRemovalOfDefender(beforeBoard: Chess, afterBoard: Chess, move: Move): TacticTag | null {
    // If the move was a capture, check if that captured piece was defending something
    if (!move.captured) return null;

    const capturedSquare = move.to as Square;
    const movedPiece = afterBoard.get(move.to as Square);
    if (!movedPiece) return null;

    const enemyColor = movedPiece.color === 'w' ? 'b' : 'w';
    const allSquares = this.getAllSquares();

    // Find pieces that were defended by the captured piece
    for (const square of allSquares) {
      const piece = afterBoard.get(square);
      if (!piece || piece.color !== enemyColor) continue;
      if (piece.type === 'k') continue;

      // Was this piece defended before the capture?
      const defendersBefore = getAttackersOf(beforeBoard, square, enemyColor);
      const wasDefendedByCaptured = defendersBefore.some(d => d.square === capturedSquare);

      if (wasDefendedByCaptured) {
        // Is it now hanging?
        if (isHanging(afterBoard, square)) {
          return {
            type: 'removal_of_defender',
            square: capturedSquare,
            targets: [square],
            attacker: movedPiece.type,
            severity: 'winning',
            description: `Removal of the Defender! The ${PIECE_NAMES[piece.type]} on ${square} is now undefended.`,
          };
        }
      }
    }

    return null;
  }

  private detectBackrankMate(board: Chess, move: Move): TacticTag | null {
    if (!board.isCheckmate()) return null;
    
    const turn = board.turn(); // The side that just got mated
    let kingSquare: Square | undefined;
    
    // Find king
    for (const sq of this.getAllSquares()) {
      const p = board.get(sq);
      if (p && p.type === 'k' && p.color === turn) {
        kingSquare = sq;
        break;
      }
    }

    if (!kingSquare) return null;

    const rank = kingSquare[1];
    if (rank !== '1' && rank !== '8') return null;

    // A backrank mate usually involves the king being trapped by its own pieces
    // (usually pawns) and mated by a major piece on that same rank.
    const isMajorPiece = ['r', 'q'].includes(move.piece);
    const sameRank = move.to[1] === rank;

    if (isMajorPiece && sameRank) {
      return {
        type: 'backrank_mate',
        square: move.to,
        severity: 'winning',
        description: `Backrank Mate! The King is trapped on the edge of the board.`,
      };
    }

    return null;
  }

  private detectMateInX(board: Chess, move: Move, mateScore?: number): TacticTag | null {
    // If it's already checkmate, handled by backrank or classifer usually
    if (board.isCheckmate()) return null;
    if (mateScore === undefined) return null;

    const absMate = Math.abs(mateScore);
    
    // Engine scores mate in plies. mateScore 1 means next move is mate.
    if (absMate === 1) {
      return {
        type: 'mate_in_1',
        square: move.to,
        severity: 'winning',
        description: `Mate in 1! This move sets up an immediate checkmate.`,
      };
    } else if (absMate === 2) {
      return {
        type: 'mate_in_2',
        square: move.to,
        severity: 'winning',
        description: `Mate in 2! A forced mating sequence is found.`,
      };
    } else if (absMate === 3) {
      return {
        type: 'mate_in_3',
        square: move.to,
        severity: 'winning',
        description: `Mate in 3! The opponent's King is in a deadly trap.`,
      };
    }

    return null;
  }

  /**
   * Helper: Check if position is likely an endgame
   * (Simplified: no Queens, or very few pieces)
   */
  private isEndgame(board: Chess): boolean {
    const fen = board.fen().split(' ')[0];
    const pieces = fen.replace(/\//g, '').replace(/\d/g, '');
    
    // No Queens usually implies endgame or late middlegame where pawns matter more
    if (!pieces.includes('Q') && !pieces.includes('q')) return true;
    
    // Low material count (e.g. < 10 pieces total)
    if (pieces.length < 10) return true;
    
    return false;
  }

  /**
   * Helper: Get enemy pieces attacked by a piece at a square
   */
  private getAttackedEnemyPieces(board: Chess, square: Square, enemyColor: Color): AttackInfo[] {
    return getAttackedPieces(board, square).filter(p => p.color === enemyColor);
  }

  /**
   * Helper: Get all 64 squares
   */
  private getAllSquares(): Square[] {
    const squares: Square[] = [];
    for (let file = 0; file < 8; file++) {
      for (let rank = 1; rank <= 8; rank++) {
        squares.push((String.fromCharCode(97 + file) + rank) as Square);
      }
    }
    return squares;
  }
}

// Singleton instance
let tacticEngineInstance: TacticEngine | null = null;

export function getTacticEngine(): TacticEngine {
  if (!tacticEngineInstance) {
    tacticEngineInstance = new TacticEngine();
  }
  return tacticEngineInstance;
}

// Export icons for UI
export { PIECE_NAMES, PIECE_ICONS };
