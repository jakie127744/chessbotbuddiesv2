/**
 * User Learning Profile System
 * Tracks user patterns across games and provides personalized feedback
 * Integrates with real game analysis data and evaluations
 */

import { AnalyzedMove } from '@/lib/analysis-utils';

// ============================================================================
// TYPES
// ============================================================================

export interface UserLearningProfile {
  userId: string;
  
  // Blunder pattern tracking (actual frequencies)
  blunderPatterns: {
    hanging_pieces: number;        // Left pieces undefended
    tactical_oversight: number;    // Missed obvious tactics
    time_pressure_mistakes: number; // Errors in low time
    endgame_errors: number;        // Mistakes in endgame phase
    opening_mistakes: number;      // Early game blunders
  };
  
  // Game phase weaknesses (based on actual move quality)
  weakPhases: {
    opening: { games: number; avgAccuracy: number };
    middlegame: { games: number; avgAccuracy: number };
    endgame: { games: number; avgAccuracy: number };
  };
  
  // Tactical blindness tracking (actual missed opportunities)
  tacticalBlindness: {
    missedForks: number;
    missedPins: number;
    missedSkewers: number;
    missedMateInOne: number;
    missedMateInTwo: number;
  };
  
  // Positional weaknesses
  positionalWeaknesses: {
    kingSafety: number;           // Times king was left unsafe
    pawnStructure: number;        // Bad pawn moves
    pieceCoordination: number;    // Pieces not working together
    weakSquares: number;          // Created weak squares
  };
  
  // Improvement areas (generated dynamically)
  improvementAreas: string[];
  
  // Statistics
  gamesAnalyzed: number;
  totalMoves: number;
  avgAccuracy: number;
  lastUpdated: Date;
}

export interface GamePhaseStats {
  phase: 'opening' | 'middlegame' | 'endgame';
  moveCount: number;
  blunders: number;
  mistakes: number;
  inaccuracies: number;
  excellentMoves: number;
  accuracy: number;
}

export interface PersonalizedAdvice {
  category: 'tactical' | 'positional' | 'time_management' | 'phase_specific' | 'encouragement';
  message: string;
  priority: 'low' | 'medium' | 'high';
  triggeredBy: string; // What pattern triggered this advice
  actionable: boolean; // Is this actionable advice vs general observation
}

// ============================================================================
// PROFILE STORAGE (LocalStorage for guests, can integrate with DB)
// ============================================================================

const PROFILE_KEY_PREFIX = 'chess_learning_profile_';

/**
 * Load user profile from storage
 */
export function getUserProfile(userId: string): UserLearningProfile {
  const key = PROFILE_KEY_PREFIX + userId;
  
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const profile = JSON.parse(stored);
      profile.lastUpdated = new Date(profile.lastUpdated);
      return profile;
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
  }
  
  // Return default profile
  return createDefaultProfile(userId);
}

/**
 * Save user profile to storage
 */
export function saveUserProfile(profile: UserLearningProfile): void {
  const key = PROFILE_KEY_PREFIX + profile.userId;
  
  try {
    localStorage.setItem(key, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

/**
 * Create a fresh default profile
 */
function createDefaultProfile(userId: string): UserLearningProfile {
  return {
    userId,
    blunderPatterns: {
      hanging_pieces: 0,
      tactical_oversight: 0,
      time_pressure_mistakes: 0,
      endgame_errors: 0,
      opening_mistakes: 0
    },
    weakPhases: {
      opening: { games: 0, avgAccuracy: 0 },
      middlegame: { games: 0, avgAccuracy: 0 },
      endgame: { games: 0, avgAccuracy: 0 }
    },
    tacticalBlindness: {
      missedForks: 0,
      missedPins: 0,
      missedSkewers: 0,
      missedMateInOne: 0,
      missedMateInTwo: 0
    },
    positionalWeaknesses: {
      kingSafety: 0,
      pawnStructure: 0,
      pieceCoordination: 0,
      weakSquares: 0
    },
    improvementAreas: [],
    gamesAnalyzed: 0,
    totalMoves: 0,
    avgAccuracy: 0,
    lastUpdated: new Date()
  };
}

// ============================================================================
// PROFILE UPDATE (based on real analyzed game data)
// ============================================================================

/**
 * Update user profile after a game using actual analyzed moves
 */
export function updateUserProfile(
  userId: string,
  analyzedMoves: AnalyzedMove[],
  userColor: 'w' | 'b',
  finalAccuracy: number
): UserLearningProfile {
  const profile = getUserProfile(userId);
  
  // Filter to only user's moves
  const userMoves = analyzedMoves.filter(m => m.color === userColor);
  
  // Analyze by phase
  const phaseStats = analyzeByPhase(userMoves);
  updatePhaseStats(profile, phaseStats);
  
  // Track blunder patterns
  updateBlunderPatterns(profile, userMoves);
  
  // Track tactical blindness (would need additional data about missed tactics)
  // This would integrate with tactical-detector.ts
  
  // Update overall statistics
  profile.gamesAnalyzed++;
  profile.totalMoves += userMoves.length;
  profile.avgAccuracy = ((profile.avgAccuracy * (profile.gamesAnalyzed - 1)) + finalAccuracy) / profile.gamesAnalyzed;
  profile.lastUpdated = new Date();
  
  // Generate improvement areas
  profile.improvementAreas = generateImprovementAreas(profile);
  
  // Save updated profile
  saveUserProfile(profile);
  
  return profile;
}

/**
 * Analyze moves by game phase using actual move data
 */
function analyzeByPhase(moves: AnalyzedMove[]): GamePhaseStats[] {
  const phases: GamePhaseStats[] = [
    { phase: 'opening', moveCount: 0, blunders: 0, mistakes: 0, inaccuracies: 0, excellentMoves: 0, accuracy: 0 },
    { phase: 'middlegame', moveCount: 0, blunders: 0, mistakes: 0, inaccuracies: 0, excellentMoves: 0, accuracy: 0 },
    { phase: 'endgame', moveCount: 0, blunders: 0, mistakes: 0, inaccuracies: 0, excellentMoves: 0, accuracy: 0 }
  ];
  
  for (const move of moves) {
    // Determine phase (simplified: opening = first 10 moves, endgame = last phase with few pieces)
    const moveNum = Math.ceil(move.moveNumber / 2);
    const phaseIndex = moveNum <= 10 ? 0 : move.moveNumber > moves.length - 15 ? 2 : 1;
    
    const phase = phases[phaseIndex];
    phase.moveCount++;
    
    // Count by classification (using actual analysis data)
    switch (move.classification) {
      case 'Blunder':
        phase.blunders++;
        break;
      case 'Mistake':
        phase.mistakes++;
        break;
      case 'Inaccuracy':
        phase.inaccuracies++;
        break;
      case 'Excellent':
      case 'Best':
      case 'Brilliant':
        phase.excellentMoves++;
        break;
    }
  }
  
  // Calculate accuracy per phase
  for (const phase of phases) {
    if (phase.moveCount > 0) {
      const goodMoves = phase.excellentMoves;
      const totalMoves = phase.moveCount;
      phase.accuracy = (goodMoves / totalMoves) * 100;
    }
  }
  
  return phases;
}

/**
 * Update phase statistics in profile
 */
function updatePhaseStats(profile: UserLearningProfile, phaseStats: GamePhaseStats[]): void {
  for (const stats of phaseStats) {
    if (stats.moveCount === 0) continue;
    
    const phaseKey = stats.phase;
    const current = profile.weakPhases[phaseKey];
    
    // Update rolling average
    current.avgAccuracy = ((current.avgAccuracy * current.games) + stats.accuracy) / (current.games + 1);
    current.games++;
  }
}

/**
 * Update blunder patterns based on actual move classifications
 */
function updateBlunderPatterns(profile: UserLearningProfile, moves: AnalyzedMove[]): void {
  for (const move of moves) {
    // Hanging pieces (blunder with capture)
    if (move.classification === 'Blunder' && move.cpLoss > 300) {
      profile.blunderPatterns.hanging_pieces++;
    }
    
    // Tactical oversight (missed better move by significant margin)
    if (move.classification === 'Mistake' && move.cpLoss > 100) {
      profile.blunderPatterns.tactical_oversight++;
    }
    
    // Opening mistakes (blunders in first 10 moves)
    if (move.classification === 'Blunder' && Math.ceil(move.moveNumber / 2) <= 10) {
      profile.blunderPatterns.opening_mistakes++;
    }
    
    // Endgame errors (mistakes in endgame phase)
    if ((move.classification === 'Blunder' || move.classification === 'Mistake') && 
        move.moveNumber > 40) {
      profile.blunderPatterns.endgame_errors++;
    }
  }
}

/**
 * Generate actionable improvement areas based on profile patterns
 */
function generateImprovementAreas(profile: UserLearningProfile): string[] {
  const areas: string[] = [];
  
  // Analyze blunder patterns (require at least 3 games)
  if (profile.gamesAnalyzed >= 3) {
    const hangingRate = profile.blunderPatterns.hanging_pieces / profile.gamesAnalyzed;
    if (hangingRate > 2) {
      areas.push('piece_safety'); // Frequently hangs pieces
    }
    
    const openingErrorRate = profile.blunderPatterns.opening_mistakes / profile.gamesAnalyzed;
    if (openingErrorRate > 1.5) {
      areas.push('opening_principles'); // Struggles in opening
    }
    
    const endgameErrorRate = profile.blunderPatterns.endgame_errors / profile.gamesAnalyzed;
    if (endgameErrorRate > 2) {
      areas.push('endgame_technique'); // Weak endgames
    }
  }
  
  // Analyze phase weaknesses
  if (profile.weakPhases.opening.games >= 3 && profile.weakPhases.opening.avgAccuracy < 60) {
    areas.push('opening_study');
  }
  
  if (profile.weakPhases.middlegame.games >= 3 && profile.weakPhases.middlegame.avgAccuracy < 55) {
    areas.push('tactical_training');
  }
  
  if (profile.weakPhases.endgame.games >= 3 && profile.weakPhases.endgame.avgAccuracy < 50) {
    areas.push('endgame_practice');
  }
  
  // Tactical blindness
  if (profile.tacticalBlindness.missedForks > 3) {
    areas.push('fork_recognition');
  }
  
  return areas;
}

// ============================================================================
// PERSONALIZED ADVICE GENERATION (integrates with bot commentary)
// ============================================================================

/**
 * Get personalized advice based on user profile and current game situation
 */
export function getPersonalizedAdvice(
  profile: UserLearningProfile,
  currentMove: AnalyzedMove | null,
  gamePhase: 'opening' | 'middlegame' | 'endgame'
): PersonalizedAdvice | null {
  // Need at least 3 games for meaningful patterns
  if (profile.gamesAnalyzed < 3) return null;
  
  // Check if current situation matches a known weakness
  
  // 1. Hanging pieces pattern
  if (currentMove?.classification === 'Blunder' && 
      profile.blunderPatterns.hanging_pieces / profile.gamesAnalyzed > 2) {
    return {
      category: 'tactical',
      message: 'You often leave pieces undefended. Try checking piece safety before moving!',
      priority: 'high',
      triggeredBy: 'hanging_pieces_pattern',
      actionable: true
    };
  }
  
  // 2. Time pressure mistakes
  if (currentMove?.classification === 'Mistake' &&
      profile.blunderPatterns.time_pressure_mistakes / profile.gamesAnalyzed > 1.5) {
    return {
      category: 'time_management',
      message: 'You make more mistakes when rushed. Take a breath and think it through!',
      priority: 'medium',
      triggeredBy: 'time_pressure_pattern',
      actionable: true
    };
  }
  
  // 3. Phase-specific advice
  if (gamePhase === 'opening' && profile.weakPhases.opening.avgAccuracy < 60) {
    return {
      category: 'phase_specific',
      message: 'Focus on development and controlling the center in the opening!',
      priority: 'medium',
      triggeredBy: 'weak_opening_phase',
      actionable: true
    };
  }
  
  if (gamePhase === 'endgame' && profile.weakPhases.endgame.avgAccuracy < 50) {
    return {
      category: 'phase_specific',
      message: 'Endgames are about precision. Calculate carefully!',
      priority: 'medium',
      triggeredBy: 'weak_endgame_phase',
      actionable: true
    };
  }
  
  // 4. Encouragement for improvement
  if (profile.gamesAnalyzed >= 5 && profile.avgAccuracy > 70) {
    return {
      category: 'encouragement',
      message: 'Your play is getting stronger! Keep up the practice!',
      priority: 'low',
      triggeredBy: 'improvement_detected',
      actionable: false
    };
  }
  
  return null;
}

/**
 * Get a summary of user's learning profile for display
 */
export function getProfileSummary(profile: UserLearningProfile): string {
  const games = profile.gamesAnalyzed;
  const accuracy = profile.avgAccuracy.toFixed(1);
  
  let summary = `Analyzed ${games} game${games !== 1 ? 's' : ''} with ${accuracy}% average accuracy. `;
  
  if (profile.improvementAreas.length > 0) {
    summary += `Focus areas: ${profile.improvementAreas.join(', ')}.`;
  } else if (games >= 3) {
    summary += `Keep practicing to identify improvement areas!`;
  } else {
    summary += `Play more games to build your profile!`;
  }
  
  return summary;
}

/**
 * Reset user profile (useful for testing or fresh start)
 */
export function resetUserProfile(userId: string): void {
  const key = PROFILE_KEY_PREFIX + userId;
  localStorage.removeItem(key);
}
