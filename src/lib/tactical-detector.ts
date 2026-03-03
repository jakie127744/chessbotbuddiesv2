/**
 * Tactical Pattern Detection System
 * Detects common chess tactical patterns (forks, pins, skewers, discovered attacks)
 * for enhanced commentary and educational feedback
 */

import { Chess, Move, Square } from 'chess.js';

// ============================================================================
// TYPES
// ============================================================================

export type TacticalPatternType = 
  | 'fork' 
  | 'pin' 
  | 'skewer' 
  | 'discovered_attack' 
  | 'double_attack'
  | 'royal_fork';

export interface TacticalPattern {
  type: TacticalPatternType;
  attackingPiece: string; // e.g., "N" for knight
  attackingSquare: Square;
  targetSquares: Square[];
  targetPieces: string[];
  severity: 'minor' | 'major' | 'critical'; // Based on piece values
  description: string;
}

// ============================================================================
// PIECE VALUES (for evaluating pattern severity)
// ============================================================================

const PIECE_VALUES: Record<string, number> = {
  'p': 1,
  'n': 3,
  'b': 3,
  'r': 5,
  'q': 9,
  'k': 100
};

function getPieceValue(piece: string): number {
  return PIECE_VALUES[piece.toLowerCase()] || 0;
}

// ============================================================================
// FORK DETECTION
// ============================================================================

/**
 * Detect if the last move created a fork (attacking 2+ enemy pieces)
 */
export function detectFork(game: Chess, lastMove: Move | null): TacticalPattern | null {
  if (!lastMove) return null;

  const board = game.board();
  const attackingSquare = lastMove.to as Square;
  const attackingPiece = lastMove.piece;
  const attackerColor = lastMove.color;
  
  // Get all squares attacked by the moved piece
  const tempGame = new Chess(game.fen());
  const moves = tempGame.moves({ square: attackingSquare, verbose: true });
  
  // Find captures (attacked enemy pieces)
  const attackedPieces: { square: Square; piece: string }[] = [];
  
  for (const move of moves) {
    if (move.captured && move.color === attackerColor) {
      const targetSquare = move.to as Square;
      const rank = parseInt(targetSquare[1]);
      const file = targetSquare.charCodeAt(0) - 97; // 'a' = 0
      
      const boardPiece = board[8 - rank][file];
      if (boardPiece && boardPiece.color !== attackerColor) {
        attackedPieces.push({
          square: targetSquare,
          piece: boardPiece.type
        });
      }
    }
  }
  
  // Fork requires attacking 2+ pieces
  if (attackedPieces.length < 2) return null;
  
  // Calculate severity based on total value of attacked pieces
  const totalValue = attackedPieces.reduce((sum, p) => sum + getPieceValue(p.piece), 0);
  const severity: 'minor' | 'major' | 'critical' = 
    totalValue >= 14 ? 'critical' :
    totalValue >= 8 ? 'major' : 'minor';
  
  // Check for royal fork (attacks king + another piece)
  const attacksKing = attackedPieces.some(p => p.piece === 'k');
  const type: TacticalPatternType = attacksKing ? 'royal_fork' : 'fork';
  
  const pieceNames = attackedPieces.map(p => p.piece.toUpperCase()).join(' and ');
  const description = `${attackingPiece.toUpperCase()} on ${attackingSquare} forks ${pieceNames}`;
  
  return {
    type,
    attackingPiece: attackingPiece.toUpperCase(),
    attackingSquare,
    targetSquares: attackedPieces.map(p => p.square),
    targetPieces: attackedPieces.map(p => p.piece.toUpperCase()),
    severity,
    description
  };
}

// ============================================================================
// PIN DETECTION
// ============================================================================

/**
 * Detect if the last move created a pin (piece can't move without exposing higher-value piece)
 */
export function detectPin(game: Chess, lastMove: Move | null): TacticalPattern | null {
  if (!lastMove) return null;
  
  const board = game.board();
  const attackingSquare = lastMove.to as Square;
  const attackingPiece = lastMove.piece;
  const attackerColor = lastMove.color;
  
  // Only sliding pieces (bishop, rook, queen) can create pins
  if (!['b', 'r', 'q'].includes(attackingPiece)) return null;
  
  // Check all rays from the attacking piece
  const directions = attackingPiece === 'r' ? 
    [[0, 1], [0, -1], [1, 0], [-1, 0]] : // Rook: orthogonal
    attackingPiece === 'b' ?
    [[1, 1], [1, -1], [-1, 1], [-1, -1]] : // Bishop: diagonal
    [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]; // Queen: all
  
  const startFile = attackingSquare.charCodeAt(0) - 97;
  const startRank = parseInt(attackingSquare[1]) - 1;
  
  for (const [df, dr] of directions) {
    let file = startFile + df;
    let rank = startRank + dr;
    let firstPiece: { square: Square; piece: string; value: number } | null = null;
    let secondPiece: { square: Square; piece: string; value: number } | null = null;
    
    // Trace the ray
    while (file >= 0 && file < 8 && rank >= 0 && rank < 8) {
      const piece = board[7 - rank][file];
      
      if (piece) {
        if (piece.color === attackerColor) {
          // Hit our own piece, no pin on this ray
          break;
        }
        
        if (!firstPiece) {
          firstPiece = {
            square: (String.fromCharCode(97 + file) + (rank + 1)) as Square,
            piece: piece.type,
            value: getPieceValue(piece.type)
          };
        } else if (!secondPiece) {
          secondPiece = {
            square: (String.fromCharCode(97 + file) + (rank + 1)) as Square,
            piece: piece.type,
            value: getPieceValue(piece.type)
          };
          break; // Found both pieces
        }
      }
      
      file += df;
      rank += dr;
    }
    
    // Pin exists if second piece is higher value than first
    if (firstPiece && secondPiece && secondPiece.value > firstPiece.value) {
      // Trade-off logic per user request:
      // 1. Can T1 fight back?
      // Use game.moves() which handles absolute pins automatically (will return empty if illegal)
      const canT1CaptureAttacker = game.moves({ square: firstPiece.square, verbose: true })
        .some(m => m.to === attackingSquare);
      
      let valid = false;
      let tacticSubtype = "";

      if (!canT1CaptureAttacker) {
        // "If the target can't fight back, it's a clean win"
        valid = true;
        tacticSubtype = "Clean Win";
      } else {
        // "If the target CAN fight back, check the trade"
        // Check if attacker is effectively protected (protector value <= target value)
        // because it's the target (T1) that would be capturing the attacker.
        const protectorColor = lastMove.color;
        const minProtectorVal = getMinDefenderValue(board, attackingSquare, protectorColor);
        const isEffectivelyProtected = minProtectorVal <= firstPiece.value;
        
        if (isEffectivelyProtected) {
          // "Only valid if we gain more than or equal to what we lose"
          // User pseudo-code: if value(target) >= value(attacker)
          // Target here is T1 (firstPiece)
          if (firstPiece.value >= getPieceValue(attackingPiece)) {
            valid = true;
            tacticSubtype = "Good Trade";
          }
        }
      }

      if (valid) {
        const severity: 'minor' | 'major' | 'critical' =
          secondPiece.piece === 'k' ? 'critical' :
          secondPiece.value >= 9 ? 'major' : 'minor';
        
        return {
          type: 'pin',
          attackingPiece: attackingPiece.toUpperCase(),
          attackingSquare,
          targetSquares: [firstPiece.square, secondPiece.square],
          targetPieces: [firstPiece.piece.toUpperCase(), secondPiece.piece.toUpperCase()],
          severity,
          description: `${attackingPiece.toUpperCase()} on ${attackingSquare} pins ${firstPiece.piece.toUpperCase()} to ${secondPiece.piece.toUpperCase()} (${tacticSubtype})`
        };
      }
    }
  }
  
  return null;
}

// ============================================================================
// PROTECTION CHECK (Board Geometry)
// ============================================================================

type BoardSquare = { type: string; color: 'w' | 'b' } | null;

/**
 * Get the minimum value among all pieces of `byColor` that defend `square`.
 * Returns Infinity if no defender is found.
 * Uses board geometry so it correctly detects same-color piece protection
 * (unlike game.moves() which excludes moves to friendly-occupied squares).
 */
function getMinDefenderValue(board: BoardSquare[][], square: Square, byColor: 'w' | 'b'): number {
  const targetFile = square.charCodeAt(0) - 97;
  const targetRank = parseInt(square[1]) - 1;
  let minValue = Infinity;

  // Check knight attacks
  const knightDeltas = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  for (const [df, dr] of knightDeltas) {
    const f = targetFile + df;
    const r = targetRank + dr;
    if (f >= 0 && f < 8 && r >= 0 && r < 8) {
      const p = board[7 - r][f];
      if (p && p.color === byColor && p.type === 'n') {
        minValue = Math.min(minValue, getPieceValue('n'));
      }
    }
  }

  // Check pawn attacks (pawns attack diagonally)
  const pawnDir = byColor === 'w' ? -1 : 1;
  for (const df of [-1, 1]) {
    const f = targetFile + df;
    const r = targetRank + pawnDir;
    if (f >= 0 && f < 8 && r >= 0 && r < 8) {
      const p = board[7 - r][f];
      if (p && p.color === byColor && p.type === 'p') {
        minValue = Math.min(minValue, getPieceValue('p'));
      }
    }
  }

  // Check king adjacency
  for (const df of [-1, 0, 1]) {
    for (const dr of [-1, 0, 1]) {
      if (df === 0 && dr === 0) continue;
      const f = targetFile + df;
      const r = targetRank + dr;
      if (f >= 0 && f < 8 && r >= 0 && r < 8) {
        const p = board[7 - r][f];
        if (p && p.color === byColor && p.type === 'k') {
          minValue = Math.min(minValue, getPieceValue('k'));
        }
      }
    }
  }

  // Check sliding pieces (bishop, rook, queen) via ray tracing
  const slidingDirs = [
    { dirs: [[0,1],[0,-1],[1,0],[-1,0]], pieces: ['r', 'q'] },
    { dirs: [[1,1],[1,-1],[-1,1],[-1,-1]], pieces: ['b', 'q'] }
  ];

  for (const { dirs, pieces } of slidingDirs) {
    for (const [df, dr] of dirs) {
      let f = targetFile + df;
      let r = targetRank + dr;
      while (f >= 0 && f < 8 && r >= 0 && r < 8) {
        const p = board[7 - r][f];
        if (p) {
          if (p.color === byColor && pieces.includes(p.type)) {
            minValue = Math.min(minValue, getPieceValue(p.type));
          }
          break; // Blocked by any piece
        }
        f += df;
        r += dr;
      }
    }
  }

  return minValue;
}

// ============================================================================
// SKEWER DETECTION
// ============================================================================

/**
 * Detect if the last move created a skewer (attack forces high-value piece to move, exposing lower-value)
 */
export function detectSkewer(game: Chess, lastMove: Move | null): TacticalPattern | null {
  if (!lastMove) return null;
  
  const board = game.board();
  const attackingSquare = lastMove.to as Square;
  const attackingPiece = lastMove.piece;
  const attackerColor = lastMove.color;
  
  // Only sliding pieces can create skewers
  if (!['b', 'r', 'q'].includes(attackingPiece)) return null;
  
  const directions = attackingPiece === 'r' ? 
    [[0, 1], [0, -1], [1, 0], [-1, 0]] :
    attackingPiece === 'b' ?
    [[1, 1], [1, -1], [-1, 1], [-1, -1]] :
    [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  
  const startFile = attackingSquare.charCodeAt(0) - 97;
  const startRank = parseInt(attackingSquare[1]) - 1;
  
  for (let [df, dr] of directions) {
    let firstPiece: { square: Square; piece: string; value: number } | null = null;
    let secondPiece: { square: Square; piece: string; value: number } | null = null;
    
    // In a skewer, both T1 and T2 must be on the same ray relative to the attacker
    // Check in one direction from the attacker
    let f = startFile + df;
    let r = startRank + dr;
    
    while (f >= 0 && f < 8 && r >= 0 && r < 8) {
      const square = (String.fromCharCode(97 + f) + (r + 1)) as Square;
      const piece = board[7 - r][f];
      
      if (piece) {
        if (piece.color === attackerColor) {
          break;
        } else {
          if (!firstPiece) {
            firstPiece = {
              square,
              piece: piece.type,
              value: getPieceValue(piece.type)
            };
          } else if (!secondPiece) {
            secondPiece = {
              square,
              piece: piece.type,
              value: getPieceValue(piece.type)
            };
            break;
          }
        }
      }
      f += df;
      r += dr;
    }
    
    // Skewer verification logic
    if (firstPiece && secondPiece) {
      const attackerValue = getPieceValue(attackingPiece);
      const t1 = firstPiece; 
      const t2 = secondPiece;

      // In a skewer, T1 is the more valuable piece that is forced to move
      // T2 is the less valuable piece that is hit behind it.
      if (t1.value > t2.value && t2.piece.toLowerCase() !== 'p') {
        // Check if T2 is protected by the defender using board geometry.
        // Protection only counts if the defender's value <= attacker's value.
        // If the only "protector" is more valuable than the attacker, it's not
        // real protection because recapturing would lose material for the defender.
        const defenderColor = lastMove.color === 'w' ? 'b' : 'w';
        const minDefenderVal = getMinDefenderValue(board, t2.square, defenderColor);
        const isEffectivelyProtected = minDefenderVal <= attackerValue;
        let valid = false;
        let tacticSubtype = "";

        if (attackerValue < t2.value) {
          valid = true;
          tacticSubtype = "Profitable Trade";
        } else if (!isEffectivelyProtected) {
          valid = true;
          tacticSubtype = "Net Gain";
        }

        if (valid) {
          const severity: 'minor' | 'major' | 'critical' =
            t1.piece === 'k' ? 'critical' :
            t1.value >= 9 ? 'major' : 'minor';
          
          return {
            type: 'skewer',
            attackingPiece: attackingPiece.toUpperCase(),
            attackingSquare,
            targetSquares: [t1.square, t2.square],
            targetPieces: [t1.piece.toUpperCase(), t2.piece.toUpperCase()],
            severity,
            description: `${attackingPiece.toUpperCase()} on ${attackingSquare} skewers ${t1.piece.toUpperCase()} and ${t2.piece.toUpperCase()} (${tacticSubtype})`
          };
        }
      }
    }
  }
  
  return null;
}

// ============================================================================
// DISCOVERED ATTACK DETECTION
// ============================================================================

/**
 * Detect if the last move created a discovered attack (moving piece reveals attack from behind)
 */
export function detectDiscoveredAttack(game: Chess, lastMove: Move | null): TacticalPattern | null {
  if (!lastMove) return null;
  
  const board = game.board();
  const moverColor = lastMove.color;
  const fromSquare = lastMove.from; // The square that was unblocked

  // Rays from the unblocked square
  const directions = [
    [0, 1], [0, -1], [1, 0], [-1, 0], // Orthogonal
    [1, 1], [1, -1], [-1, 1], [-1, -1] // Diagonal
  ];
  
  const fromFile = fromSquare.charCodeAt(0) - 97;
  const fromRank = parseInt(fromSquare[1]) - 1;
  
  for (const [df, dr] of directions) {
      // 1. Scan in direction A for a Friendly Slider (that could be the discoverer)
      let slider: { square: Square; piece: string } | null = null;
      let f = fromFile + df;
      let r = fromRank + dr;
      
      while (f >= 0 && f < 8 && r >= 0 && r < 8) {
          const p = board[7-r][f];
          if (p) {
              if (p.color === moverColor && ['r', 'b', 'q'].includes(p.type)) {
                  // Check if this piece can attack in this direction
                  const isOrthogonal = df === 0 || dr === 0;
                  const canOrthogonal = ['r', 'q'].includes(p.type);
                  const canDiagonal = ['b', 'q'].includes(p.type);
                  
                  if ((isOrthogonal && canOrthogonal) || (!isOrthogonal && canDiagonal)) {
                      slider = { 
                        square: (String.fromCharCode(97 + f) + (r + 1)) as Square, 
                        piece: p.type 
                      };
                  }
              }
              break; // Hit a piece, stop scanning this side
          }
          f += df;
          r += dr;
      }
      
      if (!slider) continue; // No friendly slider found behind
      
      // 2. Scan in the OPPOSITE direction for an Enemy Target
      let target: { square: Square; piece: string; value: number } | null = null;
      f = fromFile - df;
      r = fromRank - dr;
      
      while (f >= 0 && f < 8 && r >= 0 && r < 8) {
           const p = board[7-r][f];
           if (p) {
               if (p.color !== moverColor) {
                   target = { 
                       square: (String.fromCharCode(97 + f) + (r + 1)) as Square, 
                       piece: p.type,
                       value: getPieceValue(p.type)
                   };
               }
               break; // Hit a piece, stop
           }
           f -= df;
           r -= dr;
      }
      
      if (target) {
          // Discovered Attack Found!
          // Slider at 'slider.square' attacks 'target.square' via 'fromSquare'
          
           const severity: 'minor' | 'major' | 'critical' =
            target.piece === 'k' ? 'critical' : // Discovered CHECK
            target.value >= 5 ? 'major' : 'minor';

           return {
             type: 'discovered_attack',
             attackingPiece: slider.piece.toUpperCase(), // The discoverer
             attackingSquare: slider.square,
             targetSquares: [target.square],
             targetPieces: [target.piece.toUpperCase()],
             severity,
             description: `Discovered attack by ${slider.piece.toUpperCase()} on ${target.piece.toUpperCase()}`
           };
      }
  }
  
  return null;
}

// ============================================================================
// MAIN DETECTION FUNCTION
// ============================================================================

/**
 * Detect all tactical patterns created by the last move
 */
export function detectTacticalPatterns(game: Chess, lastMove: Move | null): TacticalPattern[] {
  if (!lastMove) return [];
  
  const patterns: TacticalPattern[] = [];
  
  // Check for fork
  const fork = detectFork(game, lastMove);
  if (fork) patterns.push(fork);
  
  // Check for pin
  const pin = detectPin(game, lastMove);
  if (pin) patterns.push(pin);
  
  // Check for skewer
  const skewer = detectSkewer(game, lastMove);
  if (skewer) patterns.push(skewer);
  
  // Check for discovered attack (TODO)
  const discovered = detectDiscoveredAttack(game, lastMove);
  if (discovered) patterns.push(discovered);
  
  return patterns;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a human-readable description of a tactical pattern
 */
export function describeTacticalPattern(pattern: TacticalPattern): string {
  return pattern.description;
}

/**
 * Get the piece name in plural form
 */
export function getPieceName(piece: string, plural = false): string {
  const names: Record<string, { singular: string; plural: string }> = {
    'P': { singular: 'pawn', plural: 'pawns' },
    'N': { singular: 'knight', plural: 'knights' },
    'B': { singular: 'bishop', plural: 'bishops' },
    'R': { singular: 'rook', plural: 'rooks' },
    'Q': { singular: 'queen', plural: 'queens' },
    'K': { singular: 'king', plural: 'kings' }
  };
  
  const name = names[piece.toUpperCase()];
  return plural ? name.plural : name.singular;
}
