import { Chess } from 'chess.js';
import type { Square, PieceSymbol, Color } from 'chess.js';

// Piece values for comparison
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

export interface AttackInfo {
  square: Square;
  piece: PieceSymbol;
  color: Color;
  value: number;
}

/**
 * Get all squares attacked by a piece at a given square
 * Uses built-in chess.js logic for efficiency
 */
export function getAttacksFrom(board: Chess, square: Square): Square[] {
  const piece = board.get(square);
  if (!piece) return [];

  const attacks: Square[] = [];
  
  const moves = board.moves({ square, verbose: true });
  for (const move of moves) {
    attacks.push(move.to as Square);
  }

  // Handle special case: Pawns attack diagonally even if they can't move there (blocked)
  if (piece.type === 'p') {
    const file = square.charCodeAt(0) - 97;
    const rank = parseInt(square[1]) - 1;
    const targets: Square[] = [];
    const dir = piece.color === 'w' ? 1 : -1;
    
    // Diagonal attacks
    if (file > 0) targets.push((String.fromCharCode(97 + file - 1) + (rank + 1 + dir)) as Square);
    if (file < 7) targets.push((String.fromCharCode(97 + file + 1) + (rank + 1 + dir)) as Square);
    
    // Validate target squares are within board
    return targets.filter(t => /^[a-h][1-8]$/.test(t));
  }

  return attacks;
}

/**
 * Get all pieces of a color attacking a specific square
 */
export function getAttackersOf(board: Chess, square: Square, byColor: Color): AttackInfo[] {
  const attackers: AttackInfo[] = [];
  
  const squares = getAllSquares();
  for (const fromSquare of squares) {
    const piece = board.get(fromSquare);
    if (!piece || piece.color !== byColor) continue;
    
    if (isPieceAttackingSquare(board, piece, fromSquare, square)) {
        attackers.push({
            square: fromSquare,
            piece: piece.type,
            color: piece.color,
            value: PIECE_VALUES[piece.type]
        });
    }
  }

  return attackers;
}

function isPieceAttackingSquare(board: Chess, piece: { type: PieceSymbol, color: Color }, from: Square, to: Square): boolean {
    if (piece.type === 'p') {
        return isPawnAttacking(from, to, piece.color);
    }
    return canPieceReach(piece.type, from, to, board);
}

export function isAttacked(board: Chess, square: Square, byColor: Color): boolean {
  return board.isAttacked(square, byColor);
}

export function isDefended(board: Chess, square: Square, byColor: Color): boolean {
  return isAttacked(board, square, byColor);
}

export function isHanging(board: Chess, square: Square): boolean {
  const piece = board.get(square);
  if (!piece) return false;

  const enemyColor = piece.color === 'w' ? 'b' : 'w';
  
  // 1. Is it even attacked?
  if (!board.isAttacked(square, enemyColor)) return false;

  // 2. Is it defended?
  const isDefendedBySelf = board.isAttacked(square, piece.color);
  
  // Case: Undefended and attacked -> Hanging
  if (!isDefendedBySelf) return true;

  // Case: Defended, but attacked by a LOWER value piece -> Hanging
  const attackers = getAttackersOf(board, square, enemyColor);
  const leastAttackerValue = Math.min(...attackers.map(a => a.value));
  
  if (leastAttackerValue < PIECE_VALUES[piece.type]) {
    return true; 
  }

  return false;
}

function isPawnAttacking(from: Square, to: Square, color: Color): boolean {
  const fromFile = from.charCodeAt(0);
  const fromRank = parseInt(from[1]);
  const toFile = to.charCodeAt(0);
  const toRank = parseInt(to[1]);

  const fileDiff = Math.abs(toFile - fromFile);
  const rankDiff = color === 'w' ? toRank - fromRank : fromRank - toRank;

  return fileDiff === 1 && rankDiff === 1;
}

function canPieceReach(pieceType: PieceSymbol, from: Square, to: Square, board: Chess): boolean {
  const fromFile = from.charCodeAt(0) - 97;
  const fromRank = parseInt(from[1]) - 1;
  const toFile = to.charCodeAt(0) - 97;
  const toRank = parseInt(to[1]) - 1;

  const fileDiff = Math.abs(toFile - fromFile);
  const rankDiff = Math.abs(toRank - fromRank);

  switch (pieceType) {
    case 'n': return (fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2);
    case 'b': return fileDiff === rankDiff && isPathClear(from, to, board);
    case 'r': return (fileDiff === 0 || rankDiff === 0) && isPathClear(from, to, board);
    case 'q': return (fileDiff === rankDiff || fileDiff === 0 || rankDiff === 0) && isPathClear(from, to, board);
    case 'k': return fileDiff <= 1 && rankDiff <= 1;
    default: return false;
  }
}

function isPathClear(from: Square, to: Square, board: Chess): boolean {
  const fromFile = from.charCodeAt(0) - 97;
  const fromRank = parseInt(from[1]) - 1;
  const toFile = to.charCodeAt(0) - 97;
  const toRank = parseInt(to[1]) - 1;

  const fileStep = Math.sign(toFile - fromFile);
  const rankStep = Math.sign(toRank - fromRank);

  let currentFile = fromFile + fileStep;
  let currentRank = fromRank + rankStep;

  while (currentFile !== toFile || currentRank !== toRank) {
    const square = String.fromCharCode(97 + currentFile) + (currentRank + 1) as Square;
    if (board.get(square)) return false; 
    currentFile += fileStep;
    currentRank += rankStep;
  }

  return true;
}

function getAllSquares(): Square[] {
  const squares: Square[] = [];
  for (let file = 0; file < 8; file++) {
    for (let rank = 1; rank <= 8; rank++) {
      squares.push((String.fromCharCode(97 + file) + rank) as Square);
    }
  }
  return squares;
}

export function getAttackedPieces(board: Chess, square: Square): AttackInfo[] {
  const piece = board.get(square);
  if (!piece) return [];

  const attacks = getAttacksFrom(board, square);
  const attackedPieces: AttackInfo[] = [];

  for (const attackedSquare of attacks) {
    const target = board.get(attackedSquare);
    if (target && target.color !== piece.color) {
      attackedPieces.push({
        square: attackedSquare,
        piece: target.type,
        color: target.color,
        value: PIECE_VALUES[target.type],
      });
    }
  }

  return attackedPieces;
}

export { PIECE_VALUES };
