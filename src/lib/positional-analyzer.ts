/**
 * Positional Analyzer
 * Analyzes actual board positions for concrete positional concepts
 * Integrates with real evaluations and board state
 */

import { Chess, Square, Piece } from 'chess.js';

// ============================================================================
// TYPES
// ============================================================================

export interface WeakSquare {
  square: Square;
  controlledBy: 'opponent';
  reason: string;
}

export interface Outpost {
  square: Square;
  piece: string | null; // null if empty but available
  strength: 'weak' | 'moderate' | 'strong';
}

export interface PawnStructureAnalysis {
  isolated: Square[];
  doubled: Square[];
  backward: Square[];
  passed: Square[];
  chains: Square[][];
  structureName?: string; // e.g. "Isolated Queen's Pawn", "Connected Passed Pawns"
  score: number; // Positive = good structure, negative = bad
}

export interface KingSafetyAnalysis {
  pawnShield: 'none' | 'weak' | 'moderate' | 'strong';
  openFiles: number;
  attackers: number; // Enemy pieces attacking king zone
  defenders: number; // Friendly pieces defending
  castled: boolean;
  score: number; // Positive = safe, negative = unsafe
}

export interface PositionalConcept {
  type: 'weak_square' | 'outpost' | 'pawn_weakness' | 'king_safety' | 'space_advantage';
  description: string;
  severity: 'minor' | 'moderate' | 'significant';
  affectedSquares: Square[];
  evaluation: number; // Estimated centipawn value
}

// ============================================================================
// WEAK SQUARE DETECTION
// ============================================================================

/**
 * Detect weak squares for a given color (squares opponent controls but can't be defended by pawns)
 */
export function detectWeakSquares(game: Chess, color: 'w' | 'b'): WeakSquare[] {
  const board = game.board();
  const weakSquares: WeakSquare[] = [];
  const opponentColor = color === 'w' ? 'b' : 'w';
  
  // Only check centrally important squares and king safety zones
  // Center files (c, d, e, f) are most critical
  // Ranks 3-4 (white perspective) or 5-6 (black perspective)
  const criticalFiles = [2, 3, 4, 5]; // c, d, e, f
  const ranksToCheck = color === 'w' ? [2, 3] : [4, 5]; // 3rd/4th Rank for white, 5th/6th for black (0-indexed)
  
  const kingSquare = findKing(game, color);
  const kingFile = kingSquare ? kingSquare.charCodeAt(0) - 97 : -1;
  const kingRank = kingSquare ? parseInt(kingSquare[1]) - 1 : -1;

  for (let rank of ranksToCheck) {
    for (let file of criticalFiles) {
      const square = (String.fromCharCode(97 + file) + (rank + 1)) as Square;
      
      // 1. Must be a "Hole" (cannot be defended by pawns)
      const canBeDefendedByPawn = canPawnDefend(game, square, color);
      if (canBeDefendedByPawn) continue;

      // 2. Must be controlled/attacked by opponent
      const opponentControls = isSquareControlled(game, square, opponentColor);
      if (!opponentControls) continue;

      // 3. Filter out if we control it STRONGLY with pieces (not just pawns)
      // If we have more defenders than they have attackers, it's not "weak" in a fatal way
      // (Simplified check: do we have ANY piece control?)
      const weControl = isSquareControlled(game, square, color);
      if (weControl) continue; // If we cover it with a piece, it's not a glaring hole yet

      weakSquares.push({
        square,
        controlledBy: 'opponent',
        reason: `Central/Critical square hole`
      });
    }
  }

  // Also check squares adjacent to King if they are holes
  if (kingSquare) {
      // Check immediate diagonals/files in front of king
      const forwardRank = color === 'w' ? kingRank + 1 : kingRank - 1;
      if (forwardRank >= 0 && forwardRank <= 7) {
          for (let df = -1; df <= 1; df++) {
             const file = kingFile + df;
             if (file >= 0 && file <= 7) {
                 const square = (String.fromCharCode(97 + file) + (forwardRank + 1)) as Square;
                 if (!canPawnDefend(game, square, color) && isSquareControlled(game, square, opponentColor)) {
                     // Check duplicates
                     if (!weakSquares.some(w => w.square === square)) {
                        weakSquares.push({ square, controlledBy: 'opponent', reason: 'King safety hole' });
                     }
                 }
             }
          }
      }
  }
  
  return weakSquares;
}

function findKing(game: Chess, color: 'w' | 'b'): Square | null {
    const board = game.board();
    for(let r=0; r<8; r++) {
        for(let c=0; c<8; c++) {
            const p = board[r][c];
            if(p && p.type === 'k' && p.color === color) {
                return (String.fromCharCode(97 + c) + (8-r)) as Square;
            }
        }
    }
    return null;
}

/**
 * Check if a square can be defended by a pawn of the given color
 */
function canPawnDefend(game: Chess, square: Square, color: 'w' | 'b'): boolean {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1]) - 1;
  const board = game.board();
  
  // Check diagonal pawn defense squares
  const pawnRank = color === 'w' ? rank - 1 : rank + 1;
  
  if (pawnRank < 0 || pawnRank > 7) return false;
  
  const leftFile = file - 1;
  const rightFile = file + 1;
  
  // Check left diagonal
  if (leftFile >= 0) {
    const piece = board[7 - pawnRank][leftFile];
    if (piece && piece.type === 'p' && piece.color === color) return true;
  }
  
  // Check right diagonal
  if (rightFile < 8) {
    const piece = board[7 - pawnRank][rightFile];
    if (piece && piece.type === 'p' && piece.color === color) return true;
  }
  
  return false;
}

/**
 * Check if a square is controlled (attacked) by a given color
 */
function isSquareControlled(game: Chess, square: Square, color: 'w' | 'b'): boolean {
  const tempGame = new Chess(game.fen());
  
  // Try to place a piece of opposite color and see if it can be captured
  const oppositeColor = color === 'w' ? 'b' : 'w';
  
  // Get all legal moves for the given color
  const originalTurn = tempGame.turn();
  
  // We need to check attacks, which requires checking all possible captures
  // This is a simplified check - look for pieces that can move to this square
  const allMoves = game.moves({ verbose: true });
  
  for (const move of allMoves) {
    if (move.color === color && move.to === square) {
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// OUTPOST DETECTION
// ============================================================================

/**
 * Detect strong outpost squares (protected by pawn, not attackable by enemy pawns)
 */
export function detectOutposts(game: Chess, color: 'w' | 'b'): Outpost[] {
  const board = game.board();
  const outposts: Outpost[] = [];
  
  // Key outpost ranks (4-6 for white, 3-5 for black)
  const ranksToCheck = color === 'w' ? [3, 4, 5] : [2, 3, 4];
  
  for (let rank of ranksToCheck) {
    for (let file = 0; file < 8; file++) {
      const square = (String.fromCharCode(97 + file) + (rank + 1)) as Square;
      
      // Must be protected by own pawn
      if (!canPawnDefend(game, square, color)) continue;
      
      // Must NOT be attackable by enemy pawns
      if (canPawnAttack(game, square, color === 'w' ? 'b' : 'w')) continue;
      
      const piece = board[7 - rank][file];
      
      // Determine strength based on position
      const strength = evaluateOutpostStrength(square, color);
      
      outposts.push({
        square,
        piece: piece ? piece.type.toUpperCase() : null,
        strength
      });
    }
  }
  
  return outposts;
}

function canPawnAttack(game: Chess, square: Square, color: 'w' | 'b'): boolean {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1]) - 1;
  const board = game.board();
  
  const pawnRank = color === 'w' ? rank + 1 : rank - 1;
  
  if (pawnRank < 0 || pawnRank > 7) return false;
  
  const leftFile = file - 1;
  const rightFile = file + 1;
  
  if (leftFile >= 0) {
    const piece = board[7 - pawnRank][leftFile];
    if (piece && piece.type === 'p' && piece.color === color) return true;
  }
  
  if (rightFile < 8) {
    const piece = board[7 - pawnRank][rightFile];
    if (piece && piece.type === 'p' && piece.color === color) return true;
  }
  
  return false;
}

function evaluateOutpostStrength(square: Square, color: 'w' | 'b'): 'weak' | 'moderate' | 'strong' {
  const rank = parseInt(square[1]);
  const file = square.charCodeAt(0) - 97;
  
  // Central files (c-f) are stronger
  const isCentral = file >= 2 && file <= 5;
  
  // Advanced ranks are stronger
  const isAdvanced = color === 'w' ? rank >= 5 : rank <= 4;
  
  if (isCentral && isAdvanced) return 'strong';
  if (isCentral || isAdvanced) return 'moderate';
  return 'weak';
}

// ============================================================================
// PAWN STRUCTURE ANALYSIS
// ============================================================================

/**
 * Analyze pawn structure comprehensively
 */
export function analyzePawnStructure(game: Chess, color: 'w' | 'b'): PawnStructureAnalysis {
  const board = game.board();
  const pawns: Square[] = [];
  
  // Find all pawns
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[7 - rank][file];
      if (piece && piece.type === 'p' && piece.color === color) {
        pawns.push((String.fromCharCode(97 + file) + (rank + 1)) as Square);
      }
    }
  }
  
  const isolated = findIsolatedPawns(pawns);
  const doubled = findDoubledPawns(pawns);
  const backward = findBackwardPawns(game, pawns, color);
  const passed = findPassedPawns(game, pawns, color);
  const chains = findPawnChains(pawns);
  
  // Calculate structure score
  const score = 
    (isolated.length * -20) + 
    (doubled.length * -15) + 
    (backward.length * -10) + 
    (passed.length * 50) + 
    (chains.length * 15);
  
  // Determine structure name
  let structureName = '';
  
  if (isolated.length > 0) {
    if (isolated.includes('d4') || isolated.includes('d5')) {
      structureName = 'Isolated Queen\'s Pawn';
    } else {
      structureName = 'Isolated Pawn';
    }
  } else if (passed.length > 0) {
    // Check if connected
    const connected = passed.some(p => {
        const file = p.charCodeAt(0);
        const rank = parseInt(p[1]);
        return passed.some(other => Math.abs(other.charCodeAt(0) - file) === 1 && Math.abs(parseInt(other[1]) - rank) <= 1);
    });
    structureName = connected ? 'Connected Passed Pawns' : 'Passed Pawn';
  } else if (doubled.length > 0) {
     structureName = 'Doubled Pawns';
  } else if (chains.length > 0 && chains.some(c => c.length >= 3)) {
     structureName = 'Solid Pawn Chain';
  }

  return {
    isolated,
    doubled,
    backward,
    passed,
    chains,
    structureName,
    score
  };
}

function findIsolatedPawns(pawns: Square[]): Square[] {
  const isolated: Square[] = [];
  
  for (const pawn of pawns) {
    const file = pawn.charCodeAt(0) - 97;
    const leftFile = file - 1;
    const rightFile = file + 1;
    
    // Check if neighboring files have pawns
    const hasLeftNeighbor = pawns.some(p => p.charCodeAt(0) - 97 === leftFile);
    const hasRightNeighbor = pawns.some(p => p.charCodeAt(0) - 97 === rightFile);
    
    if (!hasLeftNeighbor && !hasRightNeighbor) {
      isolated.push(pawn);
    }
  }
  
  return isolated;
}

function findDoubledPawns(pawns: Square[]): Square[] {
  const doubled: Square[] = [];
  const fileCount: Record<number, Square[]> = {};
  
  for (const pawn of pawns) {
    const file = pawn.charCodeAt(0) - 97;
    if (!fileCount[file]) fileCount[file] = [];
    fileCount[file].push(pawn);
  }
  
  for (const file in fileCount) {
    if (fileCount[file].length > 1) {
      doubled.push(...fileCount[file]);
    }
  }
  
  return doubled;
}

function findBackwardPawns(game: Chess, pawns: Square[], color: 'w' | 'b'): Square[] {
  // Simplified: a pawn is backward if it's behind its neighbors and can't advance safely
  const backward: Square[] = [];
  
  for (const pawn of pawns) {
    const file = pawn.charCodeAt(0) - 97;
    const rank = parseInt(pawn[1]) - 1;
    
    // Check neighboring files
    const neighbors = pawns.filter(p => {
      const pFile = p.charCodeAt(0) - 97;
      return Math.abs(pFile - file) === 1;
    });
    
    if (neighbors.length > 0) {
      const isBackward = neighbors.every(n => {
        const nRank = parseInt(n[1]) - 1;
        return color === 'w' ? nRank > rank : nRank < rank;
      });
      
      if (isBackward) backward.push(pawn);
    }
  }
  
  return backward;
}

function findPassedPawns(game: Chess, pawns: Square[], color: 'w' | 'b'): Square[] {
  const board = game.board();
  const passed: Square[] = [];
  const opponentColor = color === 'w' ? 'b' : 'w';
  
  for (const pawn of pawns) {
    const file = pawn.charCodeAt(0) - 97;
    const rank = parseInt(pawn[1]) - 1;
    
    // Check if any enemy pawns can stop this pawn
    let isBlocked = false;
    
    // Check same file and neighboring files ahead
    for (let checkFile = file - 1; checkFile <= file + 1; checkFile++) {
      if (checkFile < 0 || checkFile > 7) continue;
      
      const ranksAhead = color === 'w' ? 
        Array.from({ length: 7 - rank }, (_, i) => rank + i + 1) :
        Array.from({ length: rank }, (_, i) => rank - i - 1);
      
      for (const checkRank of ranksAhead) {
        const piece = board[7 - checkRank][checkFile];
        if (piece && piece.type === 'p' && piece.color === opponentColor) {
          isBlocked = true;
          break;
        }
      }
      
      if (isBlocked) break;
    }
    
    if (!isBlocked) passed.push(pawn);
  }
  
  return passed;
}

function findPawnChains(pawns: Square[]): Square[][] {
  const chains: Square[][] = [];
  const visited = new Set<string>();
  
  for (const pawn of pawns) {
    if (visited.has(pawn)) continue;
    
    const chain: Square[] = [pawn];
    visited.add(pawn);
    
    // Find connected pawns (diagonal support)
    let added = true;
    while (added) {
      added = false;
      
      for (const chainPawn of [...chain]) {
        const file = chainPawn.charCodeAt(0) - 97;
        const rank = parseInt(chainPawn[1]) - 1;
        
        // Check diagonals
        for (const df of [-1, 1]) {
          for (const dr of [-1, 1]) {
            const newFile = file + df;
            const newRank = rank + dr;
            
            if (newFile >= 0 && newFile < 8 && newRank >= 0 && newRank < 8) {
              const neighborSquare = (String.fromCharCode(97 + newFile) + (newRank + 1)) as Square;
              
              if (pawns.includes(neighborSquare) && !visited.has(neighborSquare)) {
                chain.push(neighborSquare);
                visited.add(neighborSquare);
                added = true;
              }
            }
          }
        }
      }
    }
    
    if (chain.length >= 2) chains.push(chain);
  }
  
  return chains;
}

// ============================================================================
// KING SAFETY ANALYSIS (uses actual position)
// ============================================================================

/**
 * Evaluate king safety based on actual board position
 */
export function evaluateKingSafety(game: Chess, color: 'w' | 'b'): KingSafetyAnalysis {
  const board = game.board();
  let kingSquare: Square | null = null;
  
  // Find king
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[7 - rank][file];
      if (piece && piece.type === 'k' && piece.color === color) {
        kingSquare = (String.fromCharCode(97 + file) + (rank + 1)) as Square;
        break;
      }
    }
    if (kingSquare) break;
  }
  
  if (!kingSquare) {
    return {
      pawnShield: 'none',
      openFiles: 0,
      attackers: 0,
      defenders: 0,
      castled: false,
      score: -100
    };
  }
  
  const kFile = kingSquare.charCodeAt(0) - 97;
  const kRank = parseInt(kingSquare[1]) - 1;
  
  // Check if castled (king on g1/c1 for white, g8/c8 for black)
  const castled = (color === 'w' && (kFile === 6 || kFile === 2) && kRank === 0) ||
                  (color === 'b' && (kFile === 6 || kFile === 2) && kRank === 7);
  
  // Evaluate pawn shield
  const pawnShield = evaluatePawnShield(game, kingSquare, color);
  
  // Count open files near king
  const openFiles = countOpenFilesNearKing(game, kingSquare);
  
  // Count attackers and defenders in king zone
  const { attackers, defenders } = countKingZonePieces(game, kingSquare, color);
  
  // Calculate safety score
  const shieldScore = pawnShield === 'strong' ? 50 : pawnShield === 'moderate' ? 20 : pawnShield === 'weak' ? -10 : -30;
  const castlingBonus = castled ? 20 : 0;
  const openFilesPenalty = openFiles * -15;
  const attackDefenseBalance = (defenders - attackers) * 10;
  
  const score = shieldScore + castlingBonus + openFilesPenalty + attackDefenseBalance;
  
  return {
    pawnShield,
    openFiles,
    attackers,
    defenders,
    castled,
    score
  };
}

function evaluatePawnShield(game: Chess, kingSquare: Square, color: 'w' | 'b'): 'none' | 'weak' | 'moderate' | 'strong' {
  const board = game.board();
  const kFile = kingSquare.charCodeAt(0) - 97;
  const kRank = parseInt(kingSquare[1]) - 1;
  
  let pawnCount = 0;
  const forwardRank = color === 'w' ? kRank + 1 : kRank - 1;
  
  // Check pawns in front of king
  for (let df = -1; df <= 1; df++) {
    const file = kFile + df;
    if (file >= 0 && file < 8 && forwardRank >= 0 && forwardRank < 8) {
      const piece = board[7 - forwardRank][file];
      if (piece && piece.type === 'p' && piece.color === color) {
        pawnCount++;
      }
    }
  }
  
  if (pawnCount === 3) return 'strong';
  if (pawnCount === 2) return 'moderate';
  if (pawnCount === 1) return 'weak';
  return 'none';
}

function countOpenFilesNearKing(game: Chess, kingSquare: Square): number {
  const board = game.board();
  const kFile = kingSquare.charCodeAt(0) - 97;
  let openFiles = 0;
  
  for (let df = -1; df <= 1; df++) {
    const file = kFile + df;
    if (file < 0 || file > 7) continue;
    
    let hasPawn = false;
    for (let rank = 0; rank < 8; rank++) {
      const piece = board[7 - rank][file];
      if (piece && piece.type === 'p') {
        hasPawn = true;
        break;
      }
    }
    
    if (!hasPawn) openFiles++;
  }
  
  return openFiles;
}

function countKingZonePieces(game: Chess, kingSquare: Square, color: 'w' | 'b'): { attackers: number; defenders: number } {
  const board = game.board();
  const kFile = kingSquare.charCodeAt(0) - 97;
  const kRank = parseInt(kingSquare[1]) - 1;
  
  let attackers = 0;
  let defenders = 0;
  
  // Check 5x5 zone around king
  for (let dr = -2; dr <= 2; dr++) {
    for (let df = -2; df <= 2; df++) {
      const file = kFile + df;
      const rank = kRank + dr;
      
      if (file >= 0 && file < 8 && rank >= 0 && rank < 8) {
        const piece = board[7 - rank][file];
        
        if (piece && piece.type !== 'k') {
          if (piece.color === color) {
            defenders++;
          } else {
            attackers++;
          }
        }
      }
    }
  }
  
  return { attackers, defenders };
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Generate positional concepts based on actual board analysis
 */
export function analyzePosition(game: Chess, color: 'w' | 'b', evaluation?: number): PositionalConcept[] {
  const concepts: PositionalConcept[] = [];
  
  // Weak squares
  const weakSquares = detectWeakSquares(game, color);
  if (weakSquares.length > 0) {
    const isCritical = weakSquares.some(w => w.reason.includes('King'));
    concepts.push({
      type: 'weak_square',
      description: `${weakSquares.length} weak square${weakSquares.length > 1 ? 's' : ''} detected`,
      severity: isCritical ? 'significant' : weakSquares.length >= 2 ? 'moderate' : 'minor',
      affectedSquares: weakSquares.map(ws => ws.square),
      evaluation: weakSquares.length * -15 - (isCritical ? 30 : 0) // Penalty for critical weakness
    });
  }
  
  // Outposts
  const outposts = detectOutposts(game, color);
  const strongOutposts = outposts.filter(o => o.strength === 'strong');
  if (strongOutposts.length > 0) {
    concepts.push({
      type: 'outpost',
      description: `${strongOutposts.length} strong outpost${strongOutposts.length > 1 ? 's' : ''} available`,
      severity: strongOutposts.length >= 2 ? 'significant' : 'moderate',
      affectedSquares: strongOutposts.map(o => o.square),
      evaluation: strongOutposts.length * 25
    });
  }
  
  // Pawn structure
  const pawnStructure = analyzePawnStructure(game, color);
  if (Math.abs(pawnStructure.score) >= 30 || pawnStructure.structureName) {
    concepts.push({
      type: 'pawn_weakness',
      description: pawnStructure.structureName || (pawnStructure.score < 0 ? 'Weak pawn structure' : 'Strong pawn structure'),
      severity: Math.abs(pawnStructure.score) >= 50 ? 'significant' : 'moderate',
      affectedSquares: [...pawnStructure.isolated, ...pawnStructure.doubled, ...pawnStructure.backward, ...pawnStructure.passed],
      evaluation: pawnStructure.score
    });
  }
  
  // King safety
  const kingSafety = evaluateKingSafety(game, color);
  if (kingSafety.score < -20 || kingSafety.attackers > kingSafety.defenders + 1) {
    concepts.push({
      type: 'king_safety',
      description: 'King safety concerns detected',
      severity: kingSafety.score < -40 ? 'significant' : 'moderate',
      affectedSquares: [],
      evaluation: kingSafety.score
    });
  }
  
  return concepts;
}
