/**
 * Narrative Engine for Multi-Turn Commentary
 * Creates story arcs across multiple moves based on real evaluation trends
 * Each bot's personality will shine through narrative-specific commentary
 */

import { AnalyzedMove } from '@/lib/analysis-utils';

// ============================================================================
// TYPES
// ============================================================================

export type NarrativeType = 
  | 'pressure_building'   // One side building attack over time
  | 'comeback_story'      // Recovering from disadvantage
  | 'dominance'           // One side in control
  | 'tension'             // Close, balanced game
  | 'tactical_sequence'   // Series of forcing moves
  | 'blunder_spiral';     // Multiple mistakes in succession

export type NarrativeStage = 
  | 'setup'         // Arc beginning (move 1-2)
  | 'development'   // Arc progressing (move 3-4)
  | 'climax'        // Arc peak (move 5-6)
  | 'resolution';   // Arc conclusion

export interface NarrativeArc {
  id: string;
  type: NarrativeType;
  initiator: 'user' | 'bot';
  startMove: number;
  currentStage: NarrativeStage;
  movesInArc: number;
  intensity: number; // 0-1, based on eval changes
  
  // Real evaluation tracking
  evalTrend: number[]; // Actual evals over time
  evalStart: number;
  evalCurrent: number;
  
  // Context
  context: {
    targetSquare?: string;
    targetPiece?: string;
    keyMoves: string[]; // SANs of key moves in narrative
    description: string;
  };
  
  active: boolean;
}

export interface NarrativeEvent {
  arcId: string;
  stage: NarrativeStage;
  intensity: number;
  commentary: string; // Will be filled by bot-specific commentary system
}

// ============================================================================
// NARRATIVE DETECTION (based on real evaluation trends)
// ============================================================================

const MIN_EVAL_CHANGE_FOR_PRESSURE = 50; // centipawns
const MIN_EVAL_CHANGE_FOR_COMEBACK = 150;
const TACTICAL_SEQUENCE_THRESHOLD = 3; // Consecutive forcing moves

/**
 * Detect if a new narrative arc should begin based on actual game state
 */
export function detectNarrativeOpportunity(
  gameHistory: AnalyzedMove[],
  currentMove: AnalyzedMove,
  currentNarrative: NarrativeArc | null
): NarrativeArc | null {
  // Don't start new narrative if one is active
  if (currentNarrative?.active) return null;
  
  // Need at least 3 moves of history
  if (gameHistory.length < 3) return null;
  
  const recentMoves = gameHistory.slice(-5); // Last 5 moves
  const recentEvals = recentMoves.map(m => m.evaluation);
  
  // 1. PRESSURE BUILDING: Eval steadily improving for one side
  const pressureArc = detectPressureBuilding(recentMoves, currentMove);
  if (pressureArc) return pressureArc;
  
  // 2. COMEBACK STORY: Large eval swing in favor of losing side
  const comebackArc = detectComeback(recentMoves, currentMove);
  if (comebackArc) return comebackArc;
  
  // 3. TACTICAL SEQUENCE: Series of checks/captures
  const tacticalArc = detectTacticalSequence(recentMoves, currentMove);
  if (tacticalArc) return tacticalArc;
  
  // 4. BLUNDER SPIRAL: Multiple blunders in succession
  const blunderArc = detectBlunderSpiral(recentMoves, currentMove);
  if (blunderArc) return blunderArc;
  
  return null;
}

/**
 * Detect pressure building (eval improving steadily)
 */
function detectPressureBuilding(recentMoves: AnalyzedMove[], currentMove: AnalyzedMove): NarrativeArc | null {
  if (recentMoves.length < 3) return null;
  
  const evals = recentMoves.map(m => m.evaluation);
  const currentEval = currentMove.evaluation;
  
  // Check if evaluation is trending in one direction
  let trendingUp = true;
  let trendingDown = true;
  
  for (let i = 1; i < evals.length; i++) {
    if (evals[i] <= evals[i - 1]) trendingUp = false;
    if (evals[i] >= evals[i - 1]) trendingDown = false;
  }
  
  const isUp = trendingUp && currentEval > evals[0] + MIN_EVAL_CHANGE_FOR_PRESSURE;
  const isDown = trendingDown && currentEval < evals[0] - MIN_EVAL_CHANGE_FOR_PRESSURE;
  
  if (isUp || isDown) {
    const initiator = currentMove.color === 'w' ? 
      (isUp ? 'user' : 'bot') : 
      (isDown ? 'user' : 'bot');
    
    return {
      id: `pressure_${currentMove.moveNumber}`,
      type: 'pressure_building',
      initiator,
      startMove: currentMove.moveNumber - 2,
      currentStage: 'setup',
      movesInArc: 1,
      intensity: Math.abs(currentEval - evals[0]) / 200, // Normalize
      evalTrend: [...evals, currentEval],
      evalStart: evals[0],
      evalCurrent: currentEval,
      context: {
        keyMoves: [currentMove.san],
        description: `${initiator === 'user' ? 'Your' : 'Bot'} pressure is building`
      },
      active: true
    };
  }
  
  return null;
}

/**
 * Detect comeback (large eval swing)
 */
function detectComeback(recentMoves: AnalyzedMove[], currentMove: AnalyzedMove): NarrativeArc | null {
  if (recentMoves.length < 3) return null;
  
  const evals = recentMoves.map(m => m.evaluation);
  const currentEval = currentMove.evaluation;
  
  // Check for significant eval swing
  const minEval = Math.min(...evals);
  const maxEval = Math.max(...evals);
  const swing = Math.abs(maxEval - minEval);
  
  if (swing >= MIN_EVAL_CHANGE_FOR_COMEBACK) {
    // Determine who is making the comeback
    const wasLosing = evals[0] < -50; // Was losing
    const nowWinning = currentEval > 50; // Now winning
    
    if (wasLosing && nowWinning) {
      const initiator = currentMove.color === 'w' ? 'user' : 'bot';
      
      return {
        id: `comeback_${currentMove.moveNumber}`,
        type: 'comeback_story',
        initiator,
        startMove: currentMove.moveNumber - 3,
        currentStage: 'setup',
        movesInArc: 1,
        intensity: swing / 300,
        evalTrend: [...evals, currentEval],
        evalStart: evals[0],
        evalCurrent: currentEval,
        context: {
          keyMoves: [currentMove.san],
          description: `${initiator === 'user' ? 'Your' : 'Bot'} comeback begins`
        },
        active: true
      };
    }
  }
  
  return null;
}

/**
 * Detect tactical sequence (checks, captures, forcing moves)
 */
function detectTacticalSequence(recentMoves: AnalyzedMove[], currentMove: AnalyzedMove): NarrativeArc | null {
  // Count consecutive forcing moves
  let forcingCount = 0;
  
  for (let i = recentMoves.length - 1; i >= 0; i--) {
    const move = recentMoves[i];
    if (move.isCheck || move.isCapture || move.classification === 'Best') {
      forcingCount++;
    } else {
      break;
    }
  }
  
  if (currentMove.isCheck || currentMove.isCapture) {
    forcingCount++;
  }
  
  if (forcingCount >= TACTICAL_SEQUENCE_THRESHOLD) {
    const initiator = currentMove.color === 'w' ? 'user' : 'bot';
    
    return {
      id: `tactical_${currentMove.moveNumber}`,
      type: 'tactical_sequence',
      initiator,
      startMove: currentMove.moveNumber - forcingCount + 1,
      currentStage: 'development',
      movesInArc: forcingCount,
      intensity: 0.8, // Tactical sequences are inherently intense
      evalTrend: recentMoves.slice(-forcingCount).map(m => m.evaluation),
      evalStart: recentMoves[recentMoves.length - forcingCount]?.evaluation || 0,
      evalCurrent: currentMove.evaluation,
      context: {
        keyMoves: recentMoves.slice(-forcingCount).map(m => m.san).concat(currentMove.san),
        description: 'Tactical combination in progress'
      },
      active: true
    };
  }
  
  return null;
}

/**
 * Detect blunder spiral (multiple blunders)
 */
function detectBlunderSpiral(recentMoves: AnalyzedMove[], currentMove: AnalyzedMove): NarrativeArc | null {
  // Count consecutive blunders/mistakes
  let errorCount = 0;
  
  for (let i = recentMoves.length - 1; i >= 0; i--) {
    const move = recentMoves[i];
    if (move.classification === 'Blunder' || move.classification === 'Mistake') {
      errorCount++;
    } else if (errorCount > 0) {
      break;
    }
  }
  
  if (currentMove.classification === 'Blunder' || currentMove.classification === 'Mistake') {
    errorCount++;
  }
  
  if (errorCount >= 2) {
    const initiator = currentMove.color === 'w' ? 'user' : 'bot';
    
    return {
      id: `blunder_${currentMove.moveNumber}`,
      type: 'blunder_spiral',
      initiator,
      startMove: currentMove.moveNumber - errorCount + 1,
      currentStage: 'development',
      movesInArc: errorCount,
      intensity: 0.7,
      evalTrend: recentMoves.slice(-errorCount).map(m => m.evaluation),
      evalStart: recentMoves[recentMoves.length - errorCount]?.evaluation || 0,
      evalCurrent: currentMove.evaluation,
      context: {
        keyMoves: recentMoves.slice(-errorCount).map(m => m.san),
        description: `${initiator === 'user' ? 'Your' : 'Bot'} position deteriorating`
      },
      active: true
    };
  }
  
  return null;
}

// ============================================================================
// NARRATIVE PROGRESSION
// ============================================================================

/**
 * Progress narrative arc to next stage based on real move data
 */
export function progressNarrative(arc: NarrativeArc, newMove: AnalyzedMove): NarrativeArc {
  if (!arc.active) return arc;
  
  // Update moves in arc
  arc.movesInArc++;
  arc.evalTrend.push(newMove.evaluation);
  arc.evalCurrent = newMove.evaluation;
  arc.context.keyMoves.push(newMove.san);
  
  // Progress stage based on moves in arc
  if (arc.movesInArc >= 6) {
    arc.currentStage = 'resolution';
  } else if (arc.movesInArc >= 4) {
    arc.currentStage = 'climax';
  } else if (arc.movesInArc >= 2) {
    arc.currentStage = 'development';
  }
  
  // Update intensity based on actual eval changes
  const evalChange = Math.abs(arc.evalCurrent - arc.evalStart);
  arc.intensity = Math.min(1, evalChange / 200);
  
  // Check if arc should conclude
  if (shouldConcludeArc(arc, newMove)) {
    arc.active = false;
  }
  
  return arc;
}

/**
 * Determine if narrative arc should conclude
 */
function shouldConcludeArc(arc: NarrativeArc, newMove: AnalyzedMove): boolean {
  // Arc has run its course (6+ moves)
  if (arc.movesInArc >= 6) return true;
  
  // Eval trend reversed significantly
  if (arc.type === 'pressure_building') {
    const recentChange = arc.evalTrend[arc.evalTrend.length - 1] - arc.evalTrend[arc.evalTrend.length - 2];
    const originalDirection = arc.evalStart < arc.evalCurrent;
    const reversedDirection = recentChange < 0;
    
    if (originalDirection !== reversedDirection && Math.abs(recentChange) > 100) {
      return true;
    }
  }
  
  // Game ended
  if (newMove.san.includes('#')) return true;
  
  return false;
}

/**
 * Resolve narrative arc and get conclusion commentary type
 */
export function resolveNarrative(arc: NarrativeArc): { outcome: 'success' | 'failure' | 'interrupted'; description: string } {
  if (!arc.active) {
    // Determine outcome based on eval changes
    const evalChange = arc.evalCurrent - arc.evalStart;
    const success = arc.initiator === 'user' ? evalChange > 100 : evalChange < -100;
    
    return {
      outcome: success ? 'success' : 'failure',
      description: `${arc.type} arc concluded with ${success ? 'success' : 'mixed results'}`
    };
  }
  
  return {
    outcome: 'interrupted',
    description: `${arc.type} arc was interrupted`
  };
}

/**
 * Get narrative-appropriate commentary trigger
 * (Actual text will come from bot-specific commentary in bot-commentary.ts)
 */
export function getNarrativeCommentaryTrigger(arc: NarrativeArc): {
  category: string;
  context: Record<string, any>;
} {
  return {
    category: `narrative_${arc.currentStage}`,
    context: {
      type: arc.type,
      initiator: arc.initiator,
      intensity: arc.intensity,
      evalChange: Math.abs(arc.evalCurrent - arc.evalStart),
      stage: arc.currentStage
    }
  };
}
