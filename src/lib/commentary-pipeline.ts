/**
 * Coach Commentary Decision Pipeline v2
 * 
 * A deterministic, explainable 8-stage pipeline with:
 * - 15-intent priority system
 * - Engine evaluation integration (blunders, missed tactics)
 * - Static heuristics (king safety, opening mistakes)
 * 
 * Stages:
 * 1. Input Snapshot - Freeze all state
 * 2. Event Detection - Detect raw events (with engine eval)
 * 3. Intent Mapping - Map events to intents
 * 4. Candidate Construction - Build candidate objects
 * 5. Confidence Scoring - Calculate final scores
 * 6. Priority Resolution - Pick winner
 * 7. Text Selection - Choose commentary text
 * 8. Attach Metadata - Add explainability
 */

import { Chess, Move, Square } from 'chess.js';
import { BotProfile } from './bot-profiles';
import { OpeningVariation } from './openings-repertoire';
import { COACHING_DATA, CommentaryLine } from './coach-commentary';
import { getBotComment, CommentaryCategory } from './bot-commentary';
import { analyzePosition } from './stockfish-manager';
import { detectTacticalPatterns } from './tactical-detector';
import { analyzePosition as analyzePositional } from './positional-analyzer';
import { UserLearningProfile, getUserProfile, updateUserProfile, getPersonalizedAdvice } from './user-learning-profile';
import { NarrativeArc, detectNarrativeOpportunity, progressNarrative, getNarrativeCommentaryTrigger } from './narrative-engine';
import { AnalyzedMove } from './analysis-utils';

// ============================================================================
// INTERFACES
// ============================================================================

/** Stage 1: Input Snapshot - Frozen state at move time */
export interface CommentarySnapshot {
  fen: string;
  fenBefore: string; // Position before user's move
  moveCount: number;
  lastMove: Move | null;
  phase: GamePhase;
  userColor: 'w' | 'b';
  lastMoveByUser: boolean;
  isGameOver: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isCheck: boolean;
  legalMovesCount: number;
  openingConfig?: OpeningVariation;
  userBookMoves: number;
  isInBook: boolean;
  userPlayedNovelty: boolean;
  recentComments: string[];
  coach: BotProfile;
  // Engine eval data (populated async)
  evalBefore?: number;
  evalAfter?: number;
  bestMove?: string;
  bestMoveEval?: number;
  
  // State for advanced detection
  userProfile?: UserLearningProfile;
  narrativeArc?: NarrativeArc | null; // Current active narrative
  gameHistoryAnalyzed?: AnalyzedMove[]; // For narrative detection
}

export type GamePhase = 'opening' | 'middlegame' | 'endgame';

/** Stage 2: Detected Events */
export type DetectedEvent =
  // Game End (Priority 100)
  | 'GAME_END_WIN'
  | 'GAME_END_LOSS'
  | 'GAME_END_DRAW'
  | 'STALEMATE'
  // Mate Threat (Priority 95)
  | 'CHECKMATE'
  | 'CHECK_CRITICAL' // Check with ≤3 legal moves
  // Blunder (Priority 90)
  | 'BLUNDER' // Eval drop ≥400cp
  // Hanging Piece (Priority 85)
  | 'HANGING_PIECE'
  // Missed Tactic (Priority 80)
  | 'MISSED_TACTIC' // Better move ≥200cp existed
  // Winning Tactic (Priority 75)
  | 'WINNING_TACTIC' // Eval gain ≥200cp
  // Tactical Patterns (Priority 75)
  | 'TACTICAL_FORK'
  | 'TACTICAL_PIN'
  | 'TACTICAL_SKEWER'
  | 'TACTICAL_DISCOVERED_ATTACK'
  // King Safety (Priority 70)
  | 'KING_UNSAFE'
  // Positional Concepts (Priority 65)
  | 'POSITIONAL_WEAK_SQUARE'
  | 'POSITIONAL_OUTPOST'
  | 'POSITIONAL_KING_SAFETY'
  | 'POSITIONAL_PAWN_STRUCTURE'
  // Opening Mistake (Priority 65)
  | 'OPENING_MISTAKE'
  // Endgame Mistake (Priority 60)
  | 'ENDGAME_MISTAKE'
  // Strategic Mistake (Priority 55)
  | 'STRATEGIC_MISTAKE'
  // Good Move (Priority 50)
  | 'GOOD_MOVE'
  // Opening Theory (Priority 45)
  | 'BOOK_MATCH'
  | 'BOOK_MILESTONE_5'
  | 'BOOK_MILESTONE_10'
  // Novelty (Priority 40)
  | 'LEFT_BOOK'
  | 'LEFT_BOOK_EARLY'
  // Personalized Advice (Priority 35)
  | 'PERSONALIZED_ADVICE'
  // Educational (Priority 30)
  | 'QUIET_MOVE'
  // Narrative Arc Events (Priority varies)
  | 'NARRATIVE_SETUP'
  | 'NARRATIVE_DEVELOPMENT'
  | 'NARRATIVE_CLIMAX'
  | 'NARRATIVE_RESOLUTION'
  | 'CRITICAL_MOMENT'
  | 'PRESSURE_BUILDING'
  | 'COMEBACK_MOMENT'
  // Neutral/Other
  | 'CHECK'
  | 'CASTLING_KINGSIDE'
  | 'CASTLING_QUEENSIDE'
  | 'CAPTURE_PAWN'
  | 'CAPTURE_MINOR'
  | 'CAPTURE_MAJOR'
  | 'CAPTURE_QUEEN'
  | 'OPENING_START';

/** Stage 3: Commentary Intent (15 intents per spec) */
export type CommentaryIntent =
  | 'GameEnd'
  | 'CheckmateThreat'
  | 'Blunder'
  | 'HangingPiece'
  | 'MissedTactic'
  | 'WinningTactic'
  | 'KingSafety'
  | 'OpeningMistake'
  | 'EndgameMistake'
  | 'StrategicMistake'
  | 'GoodMove'
  | 'Check'
  | 'OpeningTheory'
  | 'Novelty'
  | 'EducationalTip'
  | 'Neutral';

/** Stage 4: Candidate with scoring */
export interface IntentCandidate {
  intent: CommentaryIntent;
  priority: number;
  baseConfidence: number;
  triggers: DetectedEvent[];
  phase: GamePhase;
  textPool: CommentaryLine[];
}

/** Stage 5: Scored Candidate */
export interface ScoredCandidate extends IntentCandidate {
  triggerStrength: number;
  phaseBonus: number;
  repetitionPenalty: number;
  spamPenalty: number;
  finalScore: number;
}

/** Stage 8: Explainability Metadata */
export interface CommentaryMeta {
  intent: CommentaryIntent;
  priority: number;
  confidence: number;
  triggers: string[];
  explanation: string;
  evalDrop?: number;
}

/** Final Pipeline Output */
export interface CommentaryResult {
  text: string;
  type: CommentaryIntent;
  meta: CommentaryMeta;
}

// ============================================================================
// CONSTANTS (15-Intent Priority Table)
// ============================================================================

/** Intent Priority Table (exact match to user spec) */
export const INTENT_PRIORITY: Record<CommentaryIntent, number> = {
  GameEnd: 100,
  CheckmateThreat: 95,
  Check: 92,
  Blunder: 90,
  HangingPiece: 85,
  MissedTactic: 80,
  WinningTactic: 75,
  KingSafety: 70,
  OpeningMistake: 65,
  EndgameMistake: 60,
  StrategicMistake: 55,
  GoodMove: 50,
  OpeningTheory: 45,
  Novelty: 40,
  EducationalTip: 30,
  Neutral: 10,
};

/** Base confidence weights per intent */
export const INTENT_BASE_CONFIDENCE: Record<CommentaryIntent, number> = {
  GameEnd: 1.0,
  CheckmateThreat: 0.95,
  Check: 0.9,
  Blunder: 0.95,
  HangingPiece: 0.9,
  MissedTactic: 0.85,
  WinningTactic: 0.85,
  KingSafety: 0.75,
  OpeningMistake: 0.75,
  EndgameMistake: 0.7,
  StrategicMistake: 0.65,
  GoodMove: 0.6,
  OpeningTheory: 0.55,
  Novelty: 0.55,
  EducationalTip: 0.4,
  Neutral: 0.0,
};

/** Trigger strength bonuses */
const TRIGGER_STRENGTH: Partial<Record<DetectedEvent, number>> = {
  CHECKMATE: 0.5,
  GAME_END_WIN: 0.4,
  GAME_END_LOSS: 0.35,
  BLUNDER: 0.4,
  HANGING_PIECE: 0.35,
  MISSED_TACTIC: 0.3,
  WINNING_TACTIC: 0.3,
  KING_UNSAFE: 0.25,
  OPENING_MISTAKE: 0.25,
  CHECK_CRITICAL: 0.25,
  GOOD_MOVE: 0.2,
  LEFT_BOOK_EARLY: 0.4,
  LEFT_BOOK: 0.3,
  BOOK_MILESTONE_10: 0.3,
  BOOK_MILESTONE_5: 0.25,
  BOOK_MATCH: 0.3,
  OPENING_START: 0.55,
  CAPTURE_QUEEN: 0.2,
  CAPTURE_MAJOR: 0.15,
  CAPTURE_MINOR: 0.1,
  CASTLING_KINGSIDE: 0.5,
  CASTLING_QUEENSIDE: 0.5,
  CHECK: 0.15,
  QUIET_MOVE: 0,
  // New Events
  TACTICAL_FORK: 0.35,
  TACTICAL_PIN: 0.35,
  TACTICAL_SKEWER: 0.35,
  TACTICAL_DISCOVERED_ATTACK: 0.4,
  POSITIONAL_WEAK_SQUARE: 0.15,
  POSITIONAL_OUTPOST: 0.25,
  POSITIONAL_KING_SAFETY: 0.3,
  POSITIONAL_PAWN_STRUCTURE: 0.25,
  NARRATIVE_SETUP: 0.4,
  NARRATIVE_DEVELOPMENT: 0.35,
  NARRATIVE_CLIMAX: 0.5, // High priority
  NARRATIVE_RESOLUTION: 0.4,
  CRITICAL_MOMENT: 0.4,
  PRESSURE_BUILDING: 0.35,
  COMEBACK_MOMENT: 0.45,
  PERSONALIZED_ADVICE: 0.3,
};

/** Minimum confidence to show commentary (silence below this) */
const MIN_CONFIDENCE_THRESHOLD = 0.5;

/** Eval thresholds in centipawns */
const EVAL_THRESHOLDS = {
  BLUNDER: 400,      // Eval drop ≥400cp = blunder  
  MISSED_TACTIC: 200, // Better move existed by ≥200cp
  WINNING_TACTIC: 200, // Eval improved by ≥200cp
  GOOD_MOVE: 50,     // Moderate improvement
};

/** Max recent comments to check for repetition */
/** Max recent comments to check for repetition */
const RECENT_COMMENT_WINDOW = 100;

// ============================================================================
// STAGE 1: CREATE SNAPSHOT (Extended with fenBefore)
// ============================================================================

export function createSnapshot(
  game: Chess,
  coach: BotProfile,
  userColor: 'w' | 'b',
  openingConfig: OpeningVariation | undefined,
  userBookMoves: number,
  isInBook: boolean,
  userPlayedNovelty: boolean,
  recentComments: string[],
  fenBefore: string = '',
  userProfile?: UserLearningProfile,
  narrativeArc?: NarrativeArc | null,
  gameHistoryAnalyzed?: AnalyzedMove[]
): CommentarySnapshot {
  const history = game.history({ verbose: true });
  const moveCount = history.length;
  const lastMove = moveCount > 0 ? history[moveCount - 1] : null;
  
  // Determine if last move was by user
  const lastMoveByUser = moveCount > 0 && (
    (moveCount % 2 === 1 && userColor === 'w') ||
    (moveCount % 2 === 0 && userColor === 'b')
  );
  
  return {
    fen: game.fen(),
    fenBefore,
    moveCount,
    lastMove,
    phase: getGamePhase(game),
    userColor,
    lastMoveByUser,
    isGameOver: game.isGameOver(),
    isCheckmate: game.isCheckmate(),
    isStalemate: game.isStalemate(),
    isDraw: game.isDraw(),
    isCheck: game.isCheck(),
    legalMovesCount: game.moves().length,
    openingConfig,
    userBookMoves,
    isInBook,
    userPlayedNovelty,
    recentComments: recentComments.slice(-RECENT_COMMENT_WINDOW),
    coach,
    userProfile,
    narrativeArc,
    gameHistoryAnalyzed
  };
}

function getGamePhase(game: Chess): GamePhase {
  const moves = game.history().length;
  if (moves < 20) return 'opening';
  const pieces = game.board().flat().filter((p) => p !== null).length;
  if (pieces <= 12) return 'endgame';
  return 'middlegame';
}

// ============================================================================
// STATIC HEURISTICS
// ============================================================================

/** Detect if king is unsafe (uncastled in middlegame with open files) */
function detectKingUnsafe(game: Chess, userColor: 'w' | 'b'): boolean {
  const phase = getGamePhase(game);
  if (phase !== 'middlegame') return false;
  
  const board = game.board();
  const kingRow = userColor === 'w' ? 7 : 0;
  
  // Check if king has castled (is on g1/g8 or c1/c8)
  let kingCol = -1;
  for (let c = 0; c < 8; c++) {
    const piece = board[kingRow][c];
    if (piece && piece.type === 'k' && piece.color === userColor) {
      kingCol = c;
      break;
    }
  }
  
  // King on e-file = hasn't castled
  if (kingCol === 4) {
    return true;
  }
  
  return false;
}

/** Detect opening mistakes (early queen, repeated moves, no development) */
function detectOpeningMistake(game: Chess, lastMove: Move | null, userColor: 'w' | 'b'): boolean {
  if (!lastMove) return false;
  const phase = getGamePhase(game);
  if (phase !== 'opening') return false;
  
  const moveCount = game.history().length;
  
  // Early queen move (before move 6)
  if (lastMove.piece === 'q' && moveCount <= 12) {
    return true;
  }
  
  // Moving same piece twice in first 8 moves (except pawns)
  if (moveCount <= 16 && lastMove.piece !== 'p') {
    const history = game.history({ verbose: true });
    const userMoves = history.filter((_, i) => 
      (i % 2 === 0 && userColor === 'w') || (i % 2 === 1 && userColor === 'b')
    );
    
    // Count moves to same destination or from same piece
    const sameFrom = userMoves.filter(m => m.from === lastMove.from).length;
    if (sameFrom >= 2) {
      return true;
    }
  }
  
  return false;
}

/** Detect hanging piece (piece that can be captured for free) */
function detectHangingPiece(game: Chess, userColor: 'w' | 'b'): boolean {
  const opponentColor = userColor === 'w' ? 'b' : 'w';
  const board = game.board();
  
  // Get all squares where user has pieces
  const userPieces: { square: Square; piece: string }[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === userColor && piece.type !== 'k') {
        const square = String.fromCharCode(97 + col) + (8 - row) as Square;
        userPieces.push({ square, piece: piece.type });
      }
    }
  }
  
  // Check if any user piece can be captured
  const opponentMoves = game.moves({ verbose: true });
  for (const move of opponentMoves) {
    if (move.captured) {
      // Simple check: piece is hanging if opponent can take it
      // More sophisticated: check if recapture is possible (SEE)
      const pieceValue: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
      const capturedValue = pieceValue[move.captured] || 0;
      if (capturedValue >= 3) {
        return true; // Minor piece or better is hanging
      }
    }
  }
  
  return false;
}

// ============================================================================
// STAGE 2: DETECT EVENTS (With Engine Eval)
// ============================================================================

export function detectEvents(snapshot: CommentarySnapshot): DetectedEvent[] {
  const events: DetectedEvent[] = [];
  const { lastMove, lastMoveByUser, isGameOver, isCheckmate, isStalemate, isDraw, isCheck, legalMovesCount, userColor, phase } = snapshot;

  // Game End Events (Priority 100)
  if (isGameOver) {
    if (isCheckmate) {
      events.push('CHECKMATE');
      const turn = snapshot.fen.split(' ')[1];
      const userWon = (turn === 'w' && userColor === 'b') || (turn === 'b' && userColor === 'w');
      events.push(userWon ? 'GAME_END_WIN' : 'GAME_END_LOSS');
    } else if (isStalemate) {
      events.push('STALEMATE');
      events.push('GAME_END_DRAW');
    } else if (isDraw) {
      events.push('GAME_END_DRAW');
    }
    return events; // Game over takes precedence
  }

  // Checkmate Threat (Priority 95)
  if (isCheck && legalMovesCount <= 3 && legalMovesCount > 0) {
    events.push('CHECK_CRITICAL');
  } else if (isCheck) {
    events.push('CHECK');
  }

  // User-move specific events
  if (lastMoveByUser && lastMove) {
    // Engine-based detection (if eval data available)
    if (snapshot.evalBefore !== undefined && snapshot.evalAfter !== undefined) {
      const evalDrop = snapshot.evalBefore - snapshot.evalAfter;
      const evalGain = snapshot.evalAfter - snapshot.evalBefore;
      
      // Blunder detection (Priority 90)
      if (evalDrop >= EVAL_THRESHOLDS.BLUNDER) {
        events.push('BLUNDER');
      }
      // Good move or winning tactic (Priority 75/50)
      else if (evalGain >= EVAL_THRESHOLDS.WINNING_TACTIC && lastMove.captured) {
        events.push('WINNING_TACTIC');
      }
      else if (evalGain >= EVAL_THRESHOLDS.GOOD_MOVE) {
        events.push('GOOD_MOVE');
      }
      
      // Missed tactic detection (Priority 80)
      if (snapshot.bestMoveEval !== undefined) {
        const missed = snapshot.bestMoveEval - snapshot.evalAfter;
        if (missed >= EVAL_THRESHOLDS.MISSED_TACTIC) {
          events.push('MISSED_TACTIC');
        }
      }
    }
    
    // Static heuristics
    // Skip if move count is low (< 6)
    if (snapshot.moveCount >= 6) {
      // Hanging piece (Priority 85)
      if (detectHangingPiece(createChessFromFen(snapshot.fen), userColor)) {
        events.push('HANGING_PIECE');
      }
      
      // King safety (Priority 70)
      if (detectKingUnsafe(createChessFromFen(snapshot.fen), userColor)) {
        events.push('KING_UNSAFE');
      }
    }
    
    // Opening mistake (Priority 65)
    if (detectOpeningMistake(createChessFromFen(snapshot.fen), lastMove, userColor)) {
      events.push('OPENING_MISTAKE');
    }
    
    // Castling
    if (lastMove.flags.includes('k')) {
      events.push('CASTLING_KINGSIDE');
    } else if (lastMove.flags.includes('q')) {
      events.push('CASTLING_QUEENSIDE');
    }

    // Captures
    if (lastMove.captured) {
      const piece = lastMove.captured;
      if (piece === 'q') events.push('CAPTURE_QUEEN');
      else if (piece === 'r') events.push('CAPTURE_MAJOR');
      else if (piece === 'n' || piece === 'b') events.push('CAPTURE_MINOR');
      else if (piece === 'p') events.push('CAPTURE_PAWN');
    }

    // Opening Book Events
    if (phase === 'opening' && snapshot.openingConfig) {
      if (!snapshot.isInBook && !snapshot.userPlayedNovelty) {
        if (snapshot.userBookMoves < 5) {
          events.push('LEFT_BOOK_EARLY');
        } else {
          events.push('LEFT_BOOK');
        }
      } else if (snapshot.isInBook) {
        if (snapshot.userBookMoves === 5) {
          events.push('BOOK_MILESTONE_5');
        } else if (snapshot.userBookMoves === 10) {
          events.push('BOOK_MILESTONE_10');
        } else {
          events.push('BOOK_MATCH');
        }
      }
    }

    // Opening Start (Move 1-2) - Priority event to identify the opening
    if (snapshot.moveCount <= 2) {
      events.push('OPENING_START');
    }

    // --- NEW ENHANCED DETECTION ---
    const game = createChessFromFen(snapshot.fen);

    // 1. Tactical Patterns (Priority 75)
    // We check for tactical patterns created by the user's move
    // SKIP if move count is low (< 6) to avoid premature warnings
    if (snapshot.moveCount >= 6) {
      const tactics = detectTacticalPatterns(game, lastMove);
      for (const tactic of tactics) {
        if (tactic.type === 'fork') events.push('TACTICAL_FORK');
        if (tactic.type === 'royal_fork') events.push('TACTICAL_FORK');
        if (tactic.type === 'pin') events.push('TACTICAL_PIN');
        if (tactic.type === 'skewer') events.push('TACTICAL_SKEWER');
        if (tactic.type === 'discovered_attack') events.push('TACTICAL_DISCOVERED_ATTACK');
      }
    }

    // 2. Positional Analysis (Priority 65)
    // We analyze the position resulting from the user's move
    // Start analyzing from move 3 to catch early structural commitments
    if (snapshot.moveCount >= 3) {
      const concepts = analyzePositional(game, userColor);
      concepts.forEach(c => {
        if (c.type === 'weak_square' && c.severity === 'significant') events.push('POSITIONAL_WEAK_SQUARE');
        if (c.type === 'outpost' && c.severity !== 'minor') events.push('POSITIONAL_OUTPOST');
        if (c.type === 'king_safety' && c.severity === 'significant') events.push('POSITIONAL_KING_SAFETY');
        
        // Allow strictly defined structures to trigger even if severity is just 'moderate'
        const isInterestingStructure = c.type === 'pawn_weakness' && 
            (c.severity !== 'minor' || 
             c.description.includes('Isolated') || 
             c.description.includes('Connected') || 
             c.description.includes('Chain'));
             
        if (isInterestingStructure) events.push('POSITIONAL_PAWN_STRUCTURE');
      });
    }

    // 3. Personalized Advice (Priority 35)
    if (snapshot.userProfile && snapshot.gameHistoryAnalyzed) {
      const lastAnalyzed = snapshot.gameHistoryAnalyzed[snapshot.gameHistoryAnalyzed.length - 1];
      if (lastAnalyzed && snapshot.userProfile) {
        // Correctly pass the 3rd argument (game phase)
        const advice = getPersonalizedAdvice(snapshot.userProfile, lastAnalyzed, snapshot.phase);
        if (advice) events.push('PERSONALIZED_ADVICE');
      }
    }

    // 4. Narrative Events (Priority Varies)
    if (snapshot.gameHistoryAnalyzed) {
      const lastAnalyzed = snapshot.gameHistoryAnalyzed[snapshot.gameHistoryAnalyzed.length - 1];
      if (lastAnalyzed) {
        // Check for new arc
        const newArc = detectNarrativeOpportunity(snapshot.gameHistoryAnalyzed, lastAnalyzed, snapshot.narrativeArc || null);
        if (newArc && !snapshot.narrativeArc?.active) {
           events.push('NARRATIVE_SETUP');
           if (newArc.type === 'pressure_building') events.push('PRESSURE_BUILDING');
           if (newArc.type === 'comeback_story') events.push('COMEBACK_MOMENT');
        } 
        
        // Check progress of existing arc
        if (snapshot.narrativeArc?.active) {
            const trigger = getNarrativeCommentaryTrigger(snapshot.narrativeArc);
            if (trigger.category.includes('development')) events.push('NARRATIVE_DEVELOPMENT');
            if (trigger.category.includes('climax')) events.push('NARRATIVE_CLIMAX');
            if (trigger.category.includes('resolution')) events.push('NARRATIVE_RESOLUTION');
        }
      }
    }
  }

  // Fallback: Quiet move
  if (events.length === 0) {
    events.push('QUIET_MOVE');
  }

  return events;
}

function createChessFromFen(fen: string): Chess {
  return new Chess(fen);
}

// ============================================================================
// STAGE 3: MAP EVENTS TO INTENTS (15-Intent System)
// ============================================================================

export function mapEventsToIntents(events: DetectedEvent[]): CommentaryIntent[] {
  const intents: Set<CommentaryIntent> = new Set();

  for (const event of events) {
    switch (event) {
      case 'GAME_END_WIN':
      case 'GAME_END_LOSS':
      case 'GAME_END_DRAW':
      case 'STALEMATE':
        intents.add('GameEnd');
        break;
      case 'CHECKMATE':
        intents.add('CheckmateThreat');
        break;
      case 'CHECK_CRITICAL':
        intents.add('Check');
        break;
      case 'BLUNDER':
        intents.add('Blunder');
        break;
      case 'HANGING_PIECE':
        intents.add('HangingPiece');
        break;
      case 'MISSED_TACTIC':
        intents.add('MissedTactic');
        break;
      case 'WINNING_TACTIC':
        intents.add('WinningTactic');
        break;
      case 'KING_UNSAFE':
        intents.add('KingSafety');
        break;
      case 'OPENING_MISTAKE':
        intents.add('OpeningMistake');
        break;
      case 'GOOD_MOVE':
        intents.add('GoodMove');
        break;
      case 'BOOK_MATCH':
      case 'BOOK_MILESTONE_5':
      case 'BOOK_MILESTONE_10':
      case 'OPENING_START':
        intents.add('OpeningTheory');
        break;
      case 'LEFT_BOOK':
      case 'LEFT_BOOK_EARLY':
        intents.add('Novelty');
        break;
      case 'CASTLING_KINGSIDE':
      case 'CASTLING_QUEENSIDE':
        intents.add('GoodMove'); // Castling is generally good
        break;
      case 'CAPTURE_QUEEN':
      case 'CAPTURE_MAJOR':
        intents.add('WinningTactic');
        break;
      case 'QUIET_MOVE':
        intents.add('EducationalTip');
        break;
      // New Events Mapping
      case 'TACTICAL_FORK':
      case 'TACTICAL_PIN':
      case 'TACTICAL_SKEWER':
      case 'TACTICAL_DISCOVERED_ATTACK':
        intents.add('WinningTactic'); // Assume user did it if we detected it on their move
        break;
      case 'POSITIONAL_WEAK_SQUARE':
      case 'POSITIONAL_OUTPOST':
        intents.add('GoodMove'); // Rewarding positional play
        break;
      case 'POSITIONAL_KING_SAFETY':
      case 'POSITIONAL_PAWN_STRUCTURE':
        intents.add('StrategicMistake'); // Or KingSafety. Context dependent.
        break;
      case 'PERSONALIZED_ADVICE':
        intents.add('EducationalTip');
        break;
      case 'NARRATIVE_SETUP':
      case 'NARRATIVE_DEVELOPMENT':
      case 'PRESSURE_BUILDING':
      case 'COMEBACK_MOMENT':
        intents.add('GoodMove'); // Or WinningTactic, depends on context. Using GoodMove as carrier.
        break;
      case 'NARRATIVE_CLIMAX':
      case 'NARRATIVE_RESOLUTION':
      case 'CRITICAL_MOMENT':
        intents.add('WinningTactic'); // High excitement
        break;
      default:
        break;
    }
  }

  return Array.from(intents);
}

// ============================================================================
// STAGE 4: CONSTRUCT CANDIDATES
// ============================================================================

export function constructCandidates(
  intents: CommentaryIntent[],
  events: DetectedEvent[],
  snapshot: CommentarySnapshot
): IntentCandidate[] {
  return intents.map((intent) => {
    const textPool = getTextPoolForIntent(intent, events, snapshot);
    const relevantTriggers = events.filter((e) => eventMapsToIntent(e, intent));

    return {
      intent,
      priority: INTENT_PRIORITY[intent],
      baseConfidence: INTENT_BASE_CONFIDENCE[intent],
      triggers: relevantTriggers,
      phase: snapshot.phase,
      textPool,
    };
  });
}

function eventMapsToIntent(event: DetectedEvent, intent: CommentaryIntent): boolean {
  const mapping: Record<CommentaryIntent, DetectedEvent[]> = {
    GameEnd: ['GAME_END_WIN', 'GAME_END_LOSS', 'GAME_END_DRAW', 'STALEMATE', 'CHECKMATE'],
    CheckmateThreat: [],
    Check: ['CHECK', 'CHECK_CRITICAL'],
    Blunder: ['BLUNDER'],
    HangingPiece: ['HANGING_PIECE'],
    MissedTactic: ['MISSED_TACTIC'],
    WinningTactic: ['WINNING_TACTIC', 'CAPTURE_QUEEN', 'CAPTURE_MAJOR', 'TACTICAL_FORK', 'TACTICAL_PIN', 'TACTICAL_SKEWER', 'NARRATIVE_CLIMAX', 'NARRATIVE_RESOLUTION', 'CRITICAL_MOMENT'],
    KingSafety: ['KING_UNSAFE', 'POSITIONAL_KING_SAFETY'],
    OpeningMistake: ['OPENING_MISTAKE'],
    EndgameMistake: ['ENDGAME_MISTAKE'],
    StrategicMistake: ['STRATEGIC_MISTAKE', 'POSITIONAL_PAWN_STRUCTURE'],
    GoodMove: ['GOOD_MOVE', 'CASTLING_KINGSIDE', 'CASTLING_QUEENSIDE', 'POSITIONAL_WEAK_SQUARE', 'POSITIONAL_OUTPOST', 'NARRATIVE_SETUP', 'NARRATIVE_DEVELOPMENT', 'PRESSURE_BUILDING', 'COMEBACK_MOMENT'],
    OpeningTheory: ['BOOK_MATCH', 'BOOK_MILESTONE_5', 'BOOK_MILESTONE_10', 'OPENING_START'],
    Novelty: ['LEFT_BOOK', 'LEFT_BOOK_EARLY'],
    EducationalTip: ['QUIET_MOVE', 'PERSONALIZED_ADVICE'],
    Neutral: [],
  };
  return mapping[intent]?.includes(event) ?? false;
}

function getTextPoolForIntent(
  intent: CommentaryIntent,
  events: DetectedEvent[],
  snapshot: CommentarySnapshot
): CommentaryLine[] {
  // 1. Check for specific personality triggers first
  let category: CommentaryCategory | null = null;

  // Prioritize specific events for personality mapping
  if (intent === 'WinningTactic') {
    if (events.includes('TACTICAL_FORK')) category = 'tactical_fork';
    else if (events.includes('TACTICAL_PIN')) category = 'tactical_pin';
    else if (events.includes('TACTICAL_SKEWER')) category = 'tactical_skewer';
    else if (events.includes('NARRATIVE_CLIMAX')) category = 'narrative_climax';
    else if (events.includes('NARRATIVE_RESOLUTION')) category = 'narrative_resolution';
    else if (events.includes('CRITICAL_MOMENT')) category = 'critical_moment';
    else if (events.includes('COMEBACK_MOMENT')) category = 'comeback_moment';
  } 
  else if (intent === 'GoodMove') {
    if (events.includes('POSITIONAL_WEAK_SQUARE')) category = 'positional_weak_square';
    else if (events.includes('POSITIONAL_OUTPOST')) category = 'positional_outpost';
    else if (events.includes('NARRATIVE_SETUP')) category = 'narrative_setup';
    else if (events.includes('NARRATIVE_DEVELOPMENT')) category = 'narrative_development';
    else if (events.includes('PRESSURE_BUILDING')) category = 'pressure_building';
  }
  else if (intent === 'StrategicMistake' || intent === 'KingSafety') {
    if (events.includes('POSITIONAL_KING_SAFETY')) category = 'positional_king_safety';
    else if (events.includes('POSITIONAL_PAWN_STRUCTURE')) category = 'positional_pawn_structure';
  }
  else if (intent === 'EducationalTip') {
    if (events.includes('PERSONALIZED_ADVICE')) category = 'personalized_advice';
  }
  else if (intent === 'OpeningTheory') {
     // If we have a specific opening name, use it
     if (snapshot.openingConfig?.name) {
        category = 'opening_specific';
     } else if (events.includes('OPENING_START')) {
        // Fallback for first moves without specific book name yet (or if generic)
        category = 'opening';
     } else {
        category = 'opening';
     }
  }

  // If a specific category was identified, try to get a personality line
  if (category) {
    // Determine piece name
    const piece = snapshot.lastMove ? (snapshot.lastMove.piece === 'p' ? 'pawn' : 
                   snapshot.lastMove.piece === 'n' ? 'knight' : 
                   snapshot.lastMove.piece === 'b' ? 'bishop' : 
                   snapshot.lastMove.piece === 'r' ? 'rook' : 
                   snapshot.lastMove.piece === 'q' ? 'queen' : 'piece') : 'piece';
                   
    const personalityLine = getBotComment(snapshot.coach.id, category, snapshot.recentComments, {
      opening: snapshot.openingConfig?.name || 'this opening',
      piece: piece
    });
    if (personalityLine) {
      return [{ 
        text: personalityLine, 
        intent: 'Neutral', // Placeholder
        tone: 'neutral' 
      }];
    }
  }

  // 2. Fallback to Generic Coaching Data
  switch (intent) {
    case 'GameEnd':
      if (events.includes('GAME_END_WIN')) return COACHING_DATA.events.gameEnd.win;
      if (events.includes('GAME_END_LOSS')) return COACHING_DATA.events.gameEnd.loss;
      return COACHING_DATA.events.gameEnd.draw;
    case 'Check':
      return COACHING_DATA.events.check;
    case 'CheckmateThreat':
      return COACHING_DATA.events.mate;
    case 'Blunder':
      return COACHING_DATA.events.blunder || COACHING_DATA.warnings;
    case 'HangingPiece':
      return COACHING_DATA.warnings;
    case 'MissedTactic':
      return COACHING_DATA.warnings;
    case 'WinningTactic':
      return COACHING_DATA.praise;
    case 'KingSafety':
      return COACHING_DATA.warnings;
    case 'OpeningMistake':
      return COACHING_DATA.opening;
    case 'EndgameMistake':
      return COACHING_DATA.endgame;
    case 'StrategicMistake':
      return COACHING_DATA.middlegame;
    case 'GoodMove':
      return COACHING_DATA.praise;
    case 'OpeningTheory':
      return COACHING_DATA.opening;
    case 'Novelty':
      return COACHING_DATA.warnings;
    case 'EducationalTip':
      return snapshot.phase === 'endgame' ? COACHING_DATA.endgame : COACHING_DATA.middlegame;
    case 'Neutral':
    default:
      return [];
  }
}

// ============================================================================
// STAGE 5: SCORE CANDIDATES
// ============================================================================

export function scoreCandidates(
  candidates: IntentCandidate[],
  snapshot: CommentarySnapshot,
  lastCommentMoveCount: number
): ScoredCandidate[] {
  return candidates.map((candidate) => {
    // Trigger strength: sum of all trigger bonuses
    const triggerStrength = candidate.triggers.reduce(
      (sum, t) => sum + (TRIGGER_STRENGTH[t] || 0),
      0
    );

    // Phase bonus
    let phaseBonus = 0;
    if (snapshot.phase === 'opening' && candidate.intent === 'OpeningTheory') phaseBonus = 0.5;
    if (snapshot.phase === 'opening' && candidate.intent === 'OpeningMistake') phaseBonus = 0.5;
    if (snapshot.phase === 'middlegame' && candidate.intent === 'WinningTactic') phaseBonus = 0.15;
    if (snapshot.phase === 'endgame' && candidate.intent === 'EndgameMistake') phaseBonus = 0.2;

    // Repetition penalty
    const poolTexts = candidate.textPool.map((t) => t.text);
    const recentMatches = poolTexts.filter((t) => snapshot.recentComments.includes(t)).length;
    const repetitionPenalty = recentMatches * 0.75;

    // Spam penalty
    const spamPenalty = lastCommentMoveCount === snapshot.moveCount - 1 ? 0.25 : 0;

    // Final score
    const finalScore = Math.max(
      0,
      candidate.baseConfidence + triggerStrength + phaseBonus - repetitionPenalty - spamPenalty
    );

    return {
      ...candidate,
      triggerStrength,
      phaseBonus,
      repetitionPenalty,
      spamPenalty,
      finalScore,
    };
  });
}

// ============================================================================
// STAGE 6: RESOLVE PRIORITY (Winner Selection)
// ============================================================================

export function resolveWinner(scored: ScoredCandidate[]): ScoredCandidate | null {
  // Filter Neutral and below threshold
  const valid = scored.filter((c) => 
    c.intent !== 'Neutral' && c.finalScore >= MIN_CONFIDENCE_THRESHOLD
  );

  if (valid.length === 0) {
    console.log('[Commentary Pipeline] No candidates above threshold → silence');
    return null;
  }

  // Sort by priority DESC, then finalScore DESC
  valid.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return b.finalScore - a.finalScore;
  });

  const winner = valid[0];
  console.log(
    `[Commentary Pipeline] Winner: ${winner.intent} (priority=${winner.priority}, score=${winner.finalScore.toFixed(2)})`
  );
  return winner;
}

// ============================================================================
// STAGE 7: SELECT TEXT
// ============================================================================

export function selectText(
  candidate: ScoredCandidate,
  recentComments: string[]
): string {
  const pool = candidate.textPool;
  
  if (pool.length === 0) {
    return getDefaultText(candidate.intent);
  }

  // Filter recently used
  const available = pool.filter((line) => !recentComments.includes(line.text));
  // Strict filtering: if all lines used, pick random but don't fallback to used unless empty
  const finalPool = available.length > 0 ? available : [];

  // Random selection from filtered pool
  const selected = finalPool[Math.floor(Math.random() * finalPool.length)];
  return selected?.text || getDefaultText(candidate.intent);
}

function getDefaultText(intent: CommentaryIntent): string {
  const defaults: Record<CommentaryIntent, string> = {
    GameEnd: "Good game! Well played.",
    Check: "Check! Watch your opponent's response.",
    CheckmateThreat: "Careful, mate is coming!",
    Blunder: "That was a tricky spot.",
    HangingPiece: "Careful, a piece is undefended.",
    MissedTactic: "There was a stronger move there.",
    WinningTactic: "Great tactical eye!",
    KingSafety: "Keep an eye on your king's safety.",
    OpeningMistake: "Maybe try a different opening idea here.",
    EndgameMistake: "Active kings win endgames!",
    StrategicMistake: "Think about your long-term plan.",
    GoodMove: "Solid move!",
    OpeningTheory: "Standard book move. Do you know the main variations?",
    Novelty: "You've left known theory.",
    EducationalTip: "Look for the best plan.",
    Neutral: "",
  };
  return defaults[intent];
}

// ============================================================================
// STAGE 8: BUILD RESULT WITH METADATA
// ============================================================================

export function buildResult(
  candidate: ScoredCandidate,
  text: string,
  evalDrop?: number
): CommentaryResult {
  const triggerNames = candidate.triggers.map((t) =>
    t.replace(/_/g, ' ').toLowerCase()
  );

  const explanation = generateExplanation(candidate);

  return {
    text,
    type: candidate.intent,
    meta: {
      intent: candidate.intent,
      priority: candidate.priority,
      confidence: candidate.finalScore,
      triggers: triggerNames,
      explanation,
      evalDrop,
    },
  };
}

function generateExplanation(candidate: ScoredCandidate): string {
  const explanations: Record<CommentaryIntent, string> = {
    GameEnd: "The game has ended.",
    Check: "The king is under attack.",
    CheckmateThreat: "A checkmate threat was detected. Very few legal moves remain.",
    Blunder: "Evaluation dropped significantly. This move loses material or position.",
    HangingPiece: "A piece is left undefended and can be captured.",
    MissedTactic: "A stronger tactical continuation was available.",
    WinningTactic: "This move wins material or creates a decisive advantage.",
    KingSafety: "Your king is exposed. Consider castling or defensive moves.",
    OpeningMistake: "This move violates opening principles (development, center control).",
    EndgameMistake: "King activity or pawn technique error detected.",
    StrategicMistake: "This creates long-term positional weaknesses.",
    GoodMove: "Solid move that improves your position.",
    OpeningTheory: "Following known opening theory.",
    Novelty: "You deviated from known theory. The position is now original.",
    EducationalTip: "General coaching advice for this type of position.",
    Neutral: "Thinking...",
  };
  return explanations[candidate.intent];
}

// ============================================================================
// ORCHESTRATION: GENERATE COMMENTARY
// ============================================================================

export function generateCommentary(
  snapshot: CommentarySnapshot, 
  lastCommentMoveCount: number = 100 // Defaults to high number (no penalty)
): CommentaryResult | null {
  // 1. Detect Events
  const events = detectEvents(snapshot);
  
  // 2. Map Events to Intents
  const intents = mapEventsToIntents(events);
  
  // 3. Construct Candidates
  const candidates = constructCandidates(intents, events, snapshot);
  
  // 4. Score Candidates
  const scored = scoreCandidates(candidates, snapshot, lastCommentMoveCount);
  
  // 5. Resolve Winner
  const winner = resolveWinner(scored);
  
  if (!winner) return null;
  
  // 6. Select Text
  const text = selectText(winner, snapshot.recentComments);
  
  // 7. Build Result
  // Calculate approximate eval drop if available
  let evalDrop = 0;
  if (snapshot.evalBefore !== undefined && snapshot.evalAfter !== undefined) {
    if (snapshot.userColor === 'w') evalDrop = (snapshot.evalBefore - snapshot.evalAfter); // High to low is bad
    else evalDrop = (snapshot.evalAfter - snapshot.evalBefore); // Low to high is bad (wait, black values are negative?)
    // Actually, simple cp difference: 
    // If white: +100 -> +50 => Drop 50. 
    // If black: -100 -> -50 => Better. -100 -> -200 => Worse (Drop 100).
    // Let's assume standard perspective: drop is always "badness"
  }

  return buildResult(winner, text, evalDrop);
}

// ============================================================================
// MAIN PIPELINE FUNCTION (With Optional Engine Eval)
// ============================================================================

export function processCommentary(
  game: Chess,
  coach: BotProfile,
  userColor: 'w' | 'b',
  openingConfig: OpeningVariation | undefined,
  userBookMoves: number,
  isInBook: boolean,
  userPlayedNovelty: boolean,
  recentComments: string[],
  lastCommentMoveCount: number,
  evalData?: { evalBefore: number; evalAfter: number; bestMove: string; bestMoveEval: number }
): CommentaryResult | null {
  // Stage 1: Create Snapshot
  const snapshot = createSnapshot(
    game,
    coach,
    userColor,
    openingConfig,
    userBookMoves,
    isInBook,
    userPlayedNovelty,
    recentComments
  );
  
  // Add eval data if provided
  if (evalData) {
    snapshot.evalBefore = evalData.evalBefore;
    snapshot.evalAfter = evalData.evalAfter;
    snapshot.bestMove = evalData.bestMove;
    snapshot.bestMoveEval = evalData.bestMoveEval;
  }

  // Early exit: Only comment on user moves (unless game over)
  if (!snapshot.lastMoveByUser && !snapshot.isGameOver) {
    console.log('[Commentary Pipeline] Not user move → silence');
    return null;
  }

  // Stage 2: Detect Events
  const events = detectEvents(snapshot);
  console.log('[Commentary Pipeline] Events:', events);

  // Stage 3: Map to Intents
  const intents = mapEventsToIntents(events);
  if (intents.length === 0 || (intents.length === 1 && intents[0] === 'Neutral')) {
    console.log('[Commentary Pipeline] No intents → silence');
    return null;
  }

  // Stage 4: Construct Candidates
  const candidates = constructCandidates(intents, events, snapshot);

  // Stage 5: Score Candidates
  const scored = scoreCandidates(candidates, snapshot, lastCommentMoveCount);
  console.log(
    '[Commentary Pipeline] Candidates:',
    scored.map((c) => `${c.intent}(p=${c.priority},s=${c.finalScore.toFixed(2)})`)
  );

  // Stage 6: Resolve Winner
  const winner = resolveWinner(scored);
  if (!winner) {
    return null; // Silence
  }

  // Stage 7: Select Text
  const text = selectText(winner, recentComments);

  // Stage 8: Build Result
  const evalDrop = evalData ? evalData.evalBefore - evalData.evalAfter : undefined;
  return buildResult(winner, text, evalDrop);
}

// ============================================================================
// ASYNC PIPELINE WITH ENGINE EVALUATION
// ============================================================================

export async function processCommentaryWithEval(
  game: Chess,
  coach: BotProfile,
  userColor: 'w' | 'b',
  openingConfig: OpeningVariation | undefined,
  userBookMoves: number,
  isInBook: boolean,
  userPlayedNovelty: boolean,
  recentComments: string[],
  lastCommentMoveCount: number,
  fenBefore: string
): Promise<CommentaryResult | null> {
  // Get engine evaluation
  let evalData: { evalBefore: number; evalAfter: number; bestMove: string; bestMoveEval: number } | undefined;
  
  try {
    const [evalBeforeResult, evalAfterResult] = await Promise.all([
      analyzePosition(fenBefore, { depth: 12 }),
      analyzePosition(game.fen(), { depth: 12 })
    ]);
    
    if (evalBeforeResult && evalAfterResult) {
      evalData = {
        evalBefore: evalBeforeResult.eval,
        evalAfter: evalAfterResult.eval,
        bestMove: evalBeforeResult.bestMove,
        bestMoveEval: evalBeforeResult.eval,
      };
      
      console.log(`[Commentary Pipeline] Eval: before=${evalData.evalBefore}, after=${evalData.evalAfter}, drop=${evalData.evalBefore - evalData.evalAfter}`);
    }
  } catch (e) {
    console.warn('[Commentary Pipeline] Engine eval failed, proceeding without:', e);
  }
  
  return processCommentary(
    game,
    coach,
    userColor,
    openingConfig,
    userBookMoves,
    isInBook,
    userPlayedNovelty,
    recentComments,
    lastCommentMoveCount,
    evalData
  );
}
