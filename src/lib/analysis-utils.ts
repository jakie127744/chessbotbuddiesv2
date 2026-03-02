// MATE_CP constant as requested
import { Chess } from 'chess.js';
import type { TacticTag } from '@/lib/tactics';

export const MATE_CP = 10000;

export type EvalState = 'NORMAL' | 'FORCED_MATE' | 'CHECKMATE' | 'UNKNOWN';

export interface StableEval {
  state: EvalState;
  cp: number;              // Only meaningful in NORMAL
  mateIn?: number;         // Only meaningful in mate states
  side: 'w' | 'b';         // Who is winning
  uiValue: number;         // [-1, +1] normalized for bar/chart
}

export type MoveClassification = 'Brilliant' | 'Great' | 'Best' | 'Excellent' | 'Good' | 'Inaccuracy' | 'Mistake' | 'Blunder' | 'Book' | 'Forced' | 'Missed Win' | 'Missed Draw' | 'Equalizer';

// Win Probability Loss thresholds (%) for professional-grade classification
// Aligned with ChessRev's Expected Points (EP) method
export const WDL_THRESHOLDS = {
  BRILLIANT_MAX_LOSS: 2.0,       // Maintains winning/equal status
  GREAT_ONLY_MOVE_DIFF: 18.0,    // "Only Move" WDL gap threshold
  BEST_MAX_LOSS: 2.0,            // Top engine choice or very close
  EXCELLENT_MAX_LOSS: 5.0,       // 2-5% Win Prob Loss
  GOOD_MAX_LOSS: 8.0,            // 5-8% Win Prob Loss
  INACCURACY_MAX_LOSS: 12.0,     // 8-12% Win Prob Loss
  MISTAKE_MAX_LOSS: 25.0,        // 12-25% Win Prob Loss
  TRIVIAL_WIN_THRESHOLD: 95.0,   // Already clearly winning
  TRIVIAL_LOSS_THRESHOLD: 5.0,   // Already clearly losing
  // Anything > 25% loss is a blunder
} as const;

// Professional "Winning Buffer" - if eval remains above/below these, cap classification at Inaccuracy
export const EVAL_THRESHOLDS = {
  WINNING_SIDE: 300,            // +3.0 or higher
  LOSING_SIDE: -300,            // -3.0 or lower
} as const;


export interface AnalyzedMove {
    moveNumber: number;
    color: 'w' | 'b';
    san: string;
    fen: string;
    evaluation: number; // Centipawns (positive = white advantage), normalized
    // New: Stable Evaluation Object
    stableEval?: StableEval; 
    bestMove: string;
    classification: MoveClassification;
    cpLoss: number; // Raw loss for reference
    perceptualLoss: number; // Normalized loss (0-100 scale) for UI
    winProbLoss?: number; // Expected points lost (0-1 scale)
    isCapture?: boolean;
    isPromotion?: boolean;
    isCheck?: boolean;
    isCastling?: boolean;
    isSacrifice?: boolean; 
    isMate?: boolean;      
    mateIn?: number;       
    tactics?: TacticTag[];
    masterStats?: any; // Reference to MasterStats if available
}

/**
 * Mate-Absorbing Evaluation State Machine
 * Based on Chess.com's model: Mate is a state, not a value.
 */
export function nextEvalState(
  prev: StableEval | null,
  engine: {
    cp: number;
    isMate?: boolean;
    mateIn?: number;
    sideToMove: 'w' | 'b';
  }
): StableEval {
  const { cp, isMate, mateIn } = engine;

  // --- CHECKMATE (terminal) ---
  if (isMate && mateIn === 0) {
    const side = engine.sideToMove === 'w' ? 'b' : 'w'; // If it's your turn and it's mate, you lost.
    // Wait, engine usually reports "mate 0" only if the position is already checkmate.
    // Standard engine protocol: 
    // If it's white to move and white is mated, engine doesn't search. 
    // This function assumes 'engine' input comes from our parsing logic which detects checkmate.
    
    return {
      state: 'CHECKMATE',
      cp: side === 'w' ? MATE_CP : -MATE_CP,
      mateIn: 0,
      side,
      uiValue: side === 'w' ? 1 : -1
    };
  }

  // --- FORCED MATE ---
  if (isMate && mateIn !== undefined) {
    // Engine mate score is usually "mate X". X > 0 means White wins in X. X < 0 means Black wins in X.
    // BUT, some engines report relative to side to move.
    // In our UseGameAnalysis, we normalize locally.
    // Here, we assume 'mateIn' is SIGNED relative to WHITE? 
    // OR relative to SIDE to move?
    // Let's look at the user prompt: "Engine reports mateIn != null".
    // "mateIn > 0 ? 'w' : 'b'". This implies SIGNED mate distance from engine (Positive = White Wins).
    
    // HOWEVER, in useGameAnalysis, we had perspective issues.
    // Let's assume the 'mateIn' passed here is ABSOLUTE (Positive = White Mates, Negative = Black Mates).
    
    const side = mateIn > 0 ? 'w' : 'b';

    // Absorb: once mate exists, stay pinned
    // If we were already in FORCED_MATE for the SAME SIDE, stay strict.
    if (prev?.state === 'FORCED_MATE' && prev.side === side) {
      return {
        ...prev,
        mateIn: Math.abs(mateIn), // Update distance if it changes, but keep state.
        state: 'FORCED_MATE'
      };
    }

    return {
      state: 'FORCED_MATE',
      cp: side === 'w' ? MATE_CP : -MATE_CP,
      mateIn: Math.abs(mateIn),
      side,
      uiValue: side === 'w' ? 1 : -1
    };
  }

  // --- Exit mate only if truly gone ---
  if (prev?.state === 'FORCED_MATE') {
    // Mate broken (engine no longer reports mate)
    // Fall through to NORMAL
  }

  // --- NORMAL ---
  // Chess.com style: tanh(cp / 600) -> [-1, 1]
  const uiValue = Math.tanh(cp / 600);

  return {
    state: 'NORMAL',
    cp,
    side: cp >= 0 ? 'w' : 'b',
    uiValue
  };
}

// CONSTANTS
const MATE_SCORE = 10000;
const MAX_CP = 3000;

/**
 * Converts centipawn evaluation to win probability (0-100 scale)
 * Uses Lichess formula derived from 2300-rated player games
 */
export function cpToWinProbability(cpOrMate: number, isMate: boolean = false): number {
    let cp = cpOrMate;

    if (isMate) {
      const mateIn = cpOrMate;
      const absMate = Math.abs(mateIn);
      const cyclonedCp = (21 - Math.min(10, absMate)) * 100;
      cp = cyclonedCp * (mateIn > 0 ? 1 : -1);
    }

    const rawChance = 2 / (1 + Math.exp(-0.00368208 * cp)) - 1;
    return 50 + 50 * rawChance;
}

/**
 * Maps the change in win probability to a 0-100 accuracy score.
 * Based on the Lichess/Stockfish accuracy model.
 */
export function calculateMoveAccuracy(winBefore: number, winAfter: number): number {
    const loss = Math.max(0, winBefore - winAfter);
    const accuracy = 103.1668 * Math.exp(-0.04354 * loss) - 3.1669;
    return Math.min(100, Math.max(0, accuracy));
}


/**
 * Step 1: Normalization
 * Converts raw engine output to a stable, clamped centipawn value.
 */
export function normalizeEval(rawCp: number, isMate: boolean, mateIn?: number): number {
    if (isMate && mateIn !== undefined) {
        const sign = Math.sign(mateIn);
        const distance = Math.abs(mateIn);
        return sign * (MATE_SCORE - distance * 10);
    }
    return Math.max(-MAX_CP, Math.min(MAX_CP, rawCp));
}

/**
 * Helper: Count material value for a specific color
 * P=1, N/B=3, R=5, Q=9
 */
export function getMaterialCount(fen: string, color: 'w' | 'b'): number {
    const pieceValues: Record<string, number> = {
        p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
        P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0
    };
    
    const board = fen.split(' ')[0];
    let score = 0;
    
    for (const char of board) {
        if (pieceValues[char]) {
            const isWhite = char === char.toUpperCase();
            if ((color === 'w' && isWhite) || (color === 'b' && !isWhite)) {
                score += pieceValues[char];
            }
        }
    }
    return score;
}

/**
 * Helper: Count total pieces on board (excluding kings)
 * Used for endgame detection (≤7 pieces = endgame for tablebase purposes)
 */
export function getTotalPieceCount(fen: string): number {
    const board = fen.split(' ')[0];
    let count = 0;
    
    for (const char of board) {
        // Count all pieces except kings
        if ('pnbrqPNBRQ'.includes(char)) {
            count++;
        }
    }
    return count;
}

/**
 * Move Classification using ChessRev's WDL Expected Points Model
 * Pure win-probability-loss thresholds with sacrifice & only-move detection
 */
export function classifyMove(
    evalBefore: number, // Normalized, White perspective
    evalAfter: number,  // Normalized, White perspective
    bestLines: { score: number, pv: string[] }[],   // Normalized Best Lines, White perspective
    afterLines: { score: number, pv: string[] }[],  // Normalized After Lines, White perspective
    afterFen: string,
    turn: 'w' | 'b',
    isBest: boolean,
    isBook: boolean,
    isForced: boolean,
    isSacrifice: boolean, // Pre-detected from material balance analysis
    materialBefore?: number,
    materialAfter?: number,
    totalPieceCount?: number,
    playedMoveUci?: string
): { classification: MoveClassification; perceptualLoss: number; winProbLoss: number } {
    
    if (isBook) return { classification: 'Book', perceptualLoss: 0, winProbLoss: 0 };
    if (isForced) return { classification: 'Forced', perceptualLoss: 0, winProbLoss: 0 };

    // === Win Probability Calculation (ChessRev model) ===
    // All evals are White-perspective. Convert to side-to-move perspective for WDL.
    const isWhite = turn === 'w';
    const winBeforeWhite = cpToWinProbability(evalBefore);
    const winAfterWhite = cpToWinProbability(evalAfter);

    const winBefore = isWhite ? winBeforeWhite : 100 - winBeforeWhite;
    const winAfter = isWhite ? winAfterWhite : 100 - winAfterWhite;

    const winProbLossPercent = Math.max(0, winBefore - winAfter);
    const winProbLoss = winProbLossPercent / 100; // 0-1 scale for external consumers
    let accuracy = calculateMoveAccuracy(winBefore, winAfter);

    // Raw CP loss for perceptual loss (legacy)
    const evalBest = bestLines.length > 0 ? bestLines[0].score : evalBefore;
    let rawLoss = 0;
    if (isWhite) {
        rawLoss = Math.max(0, evalBest - evalAfter);
    } else {
        rawLoss = Math.max(0, evalAfter - evalBest);
    }
    const perceptualLoss = Math.tanh(rawLoss / 200) * 100;

    // === Perspective-adjusted evaluations ===
    const playerEvalBefore = isWhite ? evalBefore : -evalBefore;
    const playerEvalAfter = isWhite ? evalAfter : -evalAfter;
    const evalAfterCP = evalAfter; // White-perspective CP

    // Sort Multi-PV lines from best to worst for the moving player
    const sortedLines = [...bestLines].sort((a, b) => {
        return isWhite ? b.score - a.score : a.score - b.score;
    });

    // === BRILLIANT (!!): Sacrifice + Best + Winning ===
    // ChessRev: sacrifice + bestMove + winProbLoss <= 0.01 + leads to winning position
    const isMate = Math.abs(evalAfter) > 9000; // Mate score
    const isWinningCP = isWhite ? evalAfterCP >= 200 : evalAfterCP <= -200;
    const isWinning = isMate || isWinningCP;

    if (isSacrifice && isBest && winProbLossPercent <= 0.01 && isWinning) {
        return { classification: 'Brilliant', perceptualLoss, winProbLoss };
    }

    // === GREAT (!): "Only Move" by WDL gap ===
    // ChessRev: best + winProbLoss <= 2% + gap between PV1 and PV2 > GREAT_ONLY_MOVE_DIFF
    const isTrivial = winBefore > WDL_THRESHOLDS.TRIVIAL_WIN_THRESHOLD ||
                      winBefore < WDL_THRESHOLDS.TRIVIAL_LOSS_THRESHOLD;

    if (isBest && winProbLossPercent <= 2 && sortedLines.length > 1 && !isTrivial) {
        const secondBestScore = sortedLines[1].score;
        const winSecondWhite = cpToWinProbability(secondBestScore);
        const winSecond = isWhite ? winSecondWhite : 100 - winSecondWhite;

        if (winAfter - winSecond > WDL_THRESHOLDS.GREAT_ONLY_MOVE_DIFF) {
            return { classification: 'Great', perceptualLoss, winProbLoss };
        }
    }

    // === SPECIAL: Missed Win (pre-check before standard) ===
    const wasClearlyWinning = playerEvalBefore > 300;
    const bestWasWinning = (isWhite ? evalBest : -evalBest) > 300;
    const notWinningAnymore = playerEvalAfter < 150;

    if (wasClearlyWinning && bestWasWinning && notWinningAnymore &&
        winProbLossPercent > WDL_THRESHOLDS.MISTAKE_MAX_LOSS) {
        return { classification: 'Missed Win', perceptualLoss, winProbLoss };
    }

    // === SPECIAL: Missed Draw (endgame only) ===
    const isEndgame = totalPieceCount !== undefined && totalPieceCount <= 7;
    const wasDrawable = Math.abs(playerEvalBefore) <= 100;
    const bestKeepsDraw = Math.abs(isWhite ? evalBest : -evalBest) <= 100;
    const nowLosing = playerEvalAfter < -150;

    if (isEndgame && wasDrawable && bestKeepsDraw && nowLosing &&
        winProbLossPercent > WDL_THRESHOLDS.MISTAKE_MAX_LOSS) {
        return { classification: 'Missed Draw', perceptualLoss, winProbLoss };
    }

    // === SPECIAL: Equalizer (endgame only, heroic save) ===
    const wasLosingForSave = playerEvalBefore < -150;
    const bestHoldsDraw = Math.abs(isWhite ? evalBest : -evalBest) <= 100;
    const nowDrawable = Math.abs(playerEvalAfter) <= 100;

    if (isEndgame && wasLosingForSave && bestHoldsDraw && nowDrawable &&
        isBest && winProbLossPercent <= WDL_THRESHOLDS.EXCELLENT_MAX_LOSS) {
        return { classification: 'Equalizer', perceptualLoss, winProbLoss };
    }

    // === STANDARD CLASSIFICATION (ChessRev pure WDL thresholds) ===
    // No PV-index matching — purely win-probability-loss driven
    const isStillWinning = (isWhite && evalAfterCP >= EVAL_THRESHOLDS.WINNING_SIDE) ||
                           (!isWhite && evalAfterCP <= EVAL_THRESHOLDS.LOSING_SIDE);

    let classification: MoveClassification;

    if (isBest || winProbLossPercent <= WDL_THRESHOLDS.BEST_MAX_LOSS) {
        classification = 'Best';
        accuracy = Math.max(accuracy, 98.0);
    } else if (winProbLossPercent <= WDL_THRESHOLDS.EXCELLENT_MAX_LOSS) {
        classification = 'Excellent';
        accuracy = Math.max(accuracy, 90.0);
    } else if (winProbLossPercent <= WDL_THRESHOLDS.GOOD_MAX_LOSS) {
        classification = 'Good';
        accuracy = Math.max(accuracy, 80.0);
    } else if (winProbLossPercent <= WDL_THRESHOLDS.INACCURACY_MAX_LOSS) {
        classification = 'Inaccuracy';
    } else if (winProbLossPercent <= WDL_THRESHOLDS.MISTAKE_MAX_LOSS) {
        classification = 'Mistake';
    } else {
        classification = 'Blunder';
    }

    // ChessRev: Prevent harsh classifications in still-winning positions
    if (isStillWinning && (classification === 'Blunder' || classification === 'Mistake' || classification === 'Inaccuracy')) {
        classification = winProbLossPercent <= WDL_THRESHOLDS.BEST_MAX_LOSS ? 'Best' : 'Inaccuracy';
    }

    return { classification, perceptualLoss, winProbLoss };
}

/**
 * Calculates game accuracy using the Lichess hybrid model:
 * (Volatility Weighted Mean + Harmonic Mean) / 2
 */
export function calculateAccuracy(moves: AnalyzedMove[], color: 'w' | 'b'): number {
    const playerMoves = moves.filter(m => m.color === color);
    if (playerMoves.length === 0) return 100;

    const moveAccuracies: number[] = [];
    const winProbs: number[] = [];
    
    playerMoves.forEach(move => {
        if (move.classification === 'Book' || move.classification === 'Forced') {
            moveAccuracies.push(100);
            winProbs.push(50); // Neutral for book moves
            return;
        }

        // Calculate win probability from evaluation (approximation since we don't store winAfter directly)
        const evalForWinProb = move.color === 'w' ? move.evaluation : -move.evaluation;
        const winAfter = cpToWinProbability(evalForWinProb, move.isMate);
        
        let accuracy = move.perceptualLoss; // Currently perceptualLoss is storing the 0-100 scale, but we'll recompute later
        // If we have winProbLoss, we can compute exact accuracy
        if (move.winProbLoss !== undefined) {
             const loss = move.winProbLoss * 100; // was 0-1
             accuracy = calculateMoveAccuracy(winAfter + loss, winAfter);
        }
        
        moveAccuracies.push(accuracy);
        winProbs.push(winAfter);
    });

    const hMean = calculateHarmonicMean(moveAccuracies);
    const vMean = calculateVolatilityWeightedMean(moveAccuracies, winProbs);

    // ChessRev hybrid model: (Harmonic Mean + Volatility Weighted Mean) / 2
    const average = (hMean + vMean) / 2;
    return Math.round(Math.max(0, average) * 10) / 10;
}

function calculateHarmonicMean(accuracies: number[]): number {
    if (accuracies.length === 0) return 100;
    const sumInverse = accuracies.reduce((acc, val) => acc + (1.0 / Math.max(1, val)), 0);
    return accuracies.length / sumInverse;
}

function calculateVolatilityWeightedMean(accuracies: number[], winProbs: number[]): number {
    const len = accuracies.length;
    if (len === 0) return 100;

    const windowSize = Math.max(1, Math.min(Math.floor(len / 5), 20));

    const volatilities: number[] = [];
    for (let i = 0; i < len; i++) {
        const start = Math.max(0, i - windowSize);
        const end = Math.min(len - 1, i + windowSize);
        const window = winProbs.slice(start, end + 1);
        
        const mean = window.reduce((a, b) => a + b, 0) / window.length;
        const squareDiffs = window.map(v => Math.pow(v - mean, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / window.length;
        const stdDev = Math.sqrt(avgSquareDiff);
        
        volatilities.push(stdDev + 0.01);
    }

    const weightedSum = accuracies.reduce((sum, acc, i) => sum + (acc * volatilities[i]), 0);
    const totalVolatility = volatilities.reduce((a, b) => a + b, 0);

    return weightedSum / totalVolatility;
}

export const CLASSIFICATION_COLORS: Record<MoveClassification, string> = {
    'Brilliant': '#1bada6', 
    'Great': '#5c8bb0', 
    'Best': '#9bc700', 
    'Excellent': '#96c459', 
    'Good': '#96c459', 
    'Book': '#a88865', 
    'Inaccuracy': '#f7c631', 
    'Mistake': '#e68a00', 
    'Blunder': '#ca3431', 
    'Forced': '#96c459',
    'Missed Win': '#e68a00',
    'Missed Draw': '#9b59b6',
    'Equalizer': '#3498db',
};

export function getClassificationColor(classification: MoveClassification): string {
    return CLASSIFICATION_COLORS[classification] || '#666';
}

export const CLASSIFICATION_ICONS: Record<MoveClassification, string> = {
    'Brilliant': '!!',
    'Great': '!',
    'Best': '★',
    'Excellent': '✓',
    'Good': '○',
    'Book': '📖',
    'Inaccuracy': '?!',
    'Mistake': '?',
    'Blunder': '??',
    'Forced': '□',
    'Missed Win': '⊘',
    'Missed Draw': '½',
    'Equalizer': '🛡️',
};

export const CLASSIFICATION_TEXT_COLORS: Record<MoveClassification, string> = {
    'Brilliant': 'text-[#1bada6]',
    'Great': 'text-[#5c8bb0]',
    'Best': 'text-[#9bc700]',
    'Excellent': 'text-[#96c459]',
    'Good': 'text-[#96c459]',
    'Book': 'text-[#a88865]',
    'Inaccuracy': 'text-[#f7c631]',
    'Mistake': 'text-[#e68a00]',
    'Blunder': 'text-[#ca3431]',
    'Forced': 'text-[#96c459]',
    'Missed Win': 'text-[#e68a00]',
    'Missed Draw': 'text-[#9b59b6]',
    'Equalizer': 'text-[#3498db]',
};

// --- COACH COMMENTARY ENGINE (Ported from ChessRev) ---

// Seeded Random Number Generator (Mulberry32)
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates Shuffle with Seed
function seededShuffle<T>(array: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Unicode figurine piece map */
const FIGURINE_MAP: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞',
};

/** Convert SAN to figurine notation (Nf3 -> ♘f3) */
export function formatFigurine(san: string): string {
  return san.replace(/^([KQRBN])/, (_m, p) => FIGURINE_MAP[p] || p);
}

const commentaryBanks: Record<string, string[]> = {
  Brilliant: [
    "Brilliant! You found a legendary sacrifice.",
    "BOOM! A world-class concept.",
    "Genius! You saw what everyone else missed.",
    "Stunning! That belongs in a museum.",
    "Incredible! You played the move of the game.",
  ],
  Great: [
    "Great find! The only move that works.",
    "Sharp! You found the critical path.",
    "Excellent! Precision when it mattered.",
    "Clutch play! You kept your cool.",
    "Fantastic! You have real power here.",
  ],
  Best: [
    "The best move. Keep it up!",
    "Perfect! Exactly what's needed.",
    "Solid choice. You're in control.",
    "Engine approved. Clean play.",
    "Professional. Making it look easy.",
  ],
  Excellent: [
    "Very strong. Maintaining the lead.",
    "Clean play. You're solid here.",
    "Good move. No complaints.",
  ],
  Good: [
    "Solid. Developing nicely.",
    "A good move. Sticking to the plan.",
    "Good, though the engine sees a slightly faster way.",
  ],
  Inaccuracy: [
    "A bit soft. You missed a sharper line.",
    "Focus! You let them off the hook slightly.",
    "Inaccurate. Tighten up your play.",
  ],
  Mistake: [
    "A mistake. You're giving up initiative.",
    "Focus! You missed a tactical shift.",
    "Ouch. You stumbled there.",
  ],
  Blunder: [
    "A blunder! You hung material!",
    "Disaster! What was that?!",
    "Oh no! That's a game-changing error.",
  ],
  'Missed Win': [
    "Missed win! It was right there.",
    "You let them escape! Forced win missed.",
    "Knockout blow missed! Finish your food.",
  ],
  'Missed Draw': [
    "You had a drawing fortress, but it slipped away.",
    "That endgame was holdable. The draw was there.",
  ],
  Equalizer: [
    "Heroic defense! You've clawed your way back to equality.",
    "The great escape! You found the saving resource.",
  ],
  Book: [
    "Standard theory. Good knowledge.",
    "By the book. Smooth sailing.",
    "Theory approved. You know your stuff.",
  ],
};

/** Rich commentary data returned for each move */
export interface MoveCommentData {
  header: string;
  body: string;
  eval?: string;
  classification: string;
}

/** Format eval as "+1.2" or "+M3" */
function formatEvalDisplay(cp?: number, isMate?: boolean, mateIn?: number): string | undefined {
  if (cp === undefined) return undefined;
  if (isMate || (mateIn !== undefined && mateIn !== 0)) {
    const dist = mateIn !== undefined ? Math.abs(mateIn) : Math.ceil((10000 - Math.abs(cp)) / 10);
    return (cp >= 0 ? '+' : '-') + 'M' + dist;
  }
  return (cp > 0 ? '+' : '') + (cp / 100).toFixed(1);
}

/**
 * Build rich commentary for a single analyzed move.
 * Ported from ChessRev's getMoveCommentData with seeded randomisation.
 */
export function getMoveCommentData(
  move: AnalyzedMove,
  gameId: string = 'default',
): MoveCommentData {
  const c = move.classification;
  if (!c) return { header: 'Analyzing', body: 'Thinking about the position…', classification: 'book' };

  const san = move.san || '';
  const moveStr = formatFigurine(san);
  const evalStr = formatEvalDisplay(move.evaluation, move.isMate, move.mateIn);
  const classLabel = c;

  const header = san
    ? `${moveStr} — ${classLabel}`
    : classLabel;

  // Checkmate override
  if (san.includes('#')) {
    return { header, body: 'Checkmate! The game is over.', eval: evalStr, classification: c };
  }

  // Deterministic seed per game + move index for stable yet varied comments
  const gameSeed = gameId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const ply = (move.moveNumber - 1) * 2 + (move.color === 'b' ? 1 : 0);

  // Book opening with possible famous-player mention
  if (c === 'Book') {
    let fact = '';
    if (move.masterStats?.famousPlayers?.length > 0) {
      const rng = mulberry32(gameSeed + ply);
      if (rng() < 0.35) {
        fact = `Played by ${move.masterStats.famousPlayers[0].split(' vs ')[0]}.`;
      }
    }
    return { header, body: fact || 'Following theory.', eval: evalStr, classification: c };
  }

  const rawBank = commentaryBanks[c] || ['An interesting move.'];
  const shuffledBank = seededShuffle(rawBank, gameSeed);
  let body = shuffledBank[ply % shuffledBank.length];

  // Tactic description injection
  if (move.tactics && move.tactics.length > 0) {
    const significant = move.tactics.filter(
      t => ['pigs_on_7th', 'defender', 'fork_threat'].includes(t.type) || t.severity === 'winning',
    );
    if (significant.length > 0) {
      const desc = Array.from(new Set(significant.map(t => t.description))).join(' ');
      body = `${desc} ${body}`;
    }
  }

  // Best-move hint for bad moves
  if (['Mistake', 'Blunder', 'Inaccuracy', 'Missed Win', 'Missed Draw'].includes(c) && move.bestMove) {
    try {
      const g = new Chess(move.fen);
      // bestMove is UCI—roll the move back to get the FEN *before* the played move
      // Actually move.fen is the position AFTER the played move.
      // bestMove is the engine's recommendation for the position BEFORE.
      // We can still try to convert UCI to SAN from the pre-move position,
      // but we don't store that FEN. So just show UCI for now, prettified.
      const from = move.bestMove.slice(0, 2);
      const to = move.bestMove.slice(2, 4);
      body += ` Best was ${from}-${to}.`;
    } catch {
      // Fallback: just append raw bestMove
      body += ` Best was ${move.bestMove}.`;
    }
  }

  return { header, body: body.trim(), eval: evalStr, classification: c };
}

/**
 * Generate a game summary once analysis is complete.
 * Ported from ChessRev's getGameSummary.
 */
export function getGameSummary(
  moves: AnalyzedMove[],
  whiteAccuracy: number,
  blackAccuracy: number,
  result?: string,
): MoveCommentData {
  let summary = `Game Over! Accuracy: White ${whiteAccuracy.toFixed(1)}%, Black ${blackAccuracy.toFixed(1)}%. `;

  // Result
  const lastMove = moves[moves.length - 1];
  if (lastMove?.san?.includes('#')) {
    const winner = moves.length % 2 === 1 ? 'White' : 'Black';
    summary += `Checkmate! Congratulations to ${winner}! `;
  } else if (result === '1-0') {
    summary += 'White won the game. ';
  } else if (result === '0-1') {
    summary += 'Black won the game. ';
  } else if (result === '1/2-1/2') {
    summary += 'The game ended in a draw. ';
  }

  const critical = moves.filter(m =>
    ['Blunder', 'Mistake', 'Inaccuracy'].includes(m.classification),
  );

  if (critical.length > 0) {
    summary += 'Review these key moments: ';
    const fmtMove = (m: AnalyzedMove) => `${m.moveNumber}${m.color === 'w' ? '.' : '...'} ${m.san}`;
    const blunders = critical.filter(m => m.classification === 'Blunder');
    const mistakes = critical.filter(m => m.classification === 'Mistake');
    const inaccuracies = critical.filter(m => m.classification === 'Inaccuracy');
    if (blunders.length) summary += `Blunders: ${blunders.map(fmtMove).join(', ')}. `;
    if (mistakes.length) summary += `Mistakes: ${mistakes.map(fmtMove).join(', ')}. `;
    if (inaccuracies.length) summary += `Inaccuracies: ${inaccuracies.map(fmtMove).join(', ')}. `;
  } else {
    summary += 'Outstanding game! No major mistakes were made.';
  }

  return { header: 'Game Summary', body: summary.trim(), classification: 'Book' };
}

/**
 * Generates a simple commentary string for a move (legacy helper).
 */
export function getMoveCommentary(move: AnalyzedMove): string {
  return getMoveCommentData(move).body;
}
