'use client';

/**
 * Recall Mode Logic - Blind recall training system
 * Hides move history and validates moves against learned variations
 * without assistance or hints
 */

interface VariationNode {
  moves: string[];
  explanations?: Record<number, string>;
  variations?: VariationNode[];
}

export interface RecallNode {
  node: VariationNode;
  moveIndex: number;
  correctMove: string;
  followingMoves: string[];
  fen: string;
  positionDescription: string;
}

export interface RecallValidation {
  isCorrect: boolean;
  playerMove: string;
  correctMove: string;
  feedback: string;
  alternativeMoves?: string[];
  concepts?: string[];
}

export interface RecallSessionStats {
  totalMoves: number;
  correctMoves: number;
  accuracy: number;
  avgResponseTime: number; // milliseconds
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
}

/**
 * Select a random leaf node from variation tree for blind recall
 * Ensures selected node has reasonable depth (not first move)
 */
export function selectRandomRecallNode(
  variationNodes: VariationNode[],
  openingName: string,
  minDepth: number = 2
): RecallNode | null {
  const collectAllNodes = (
    nodes: VariationNode[],
    depth: number = 0,
    allNodes: Array<{ node: VariationNode; depth: number }> = []
  ) => {
    for (const node of nodes) {
      if (depth >= minDepth) {
        allNodes.push({ node, depth });
      }
      if (node.variations && node.variations.length > 0) {
        collectAllNodes(node.variations, depth + 1, allNodes);
      }
    }
    return allNodes;
  };

  const allNodes = collectAllNodes(variationNodes);
  if (allNodes.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * allNodes.length);
  const { node, depth } = allNodes[randomIndex];

  // Get the correct next move
  const correctMove = node.moves[0];
  if (!correctMove) return null;

  // Get following moves for context
  const followingMoves = node.moves.slice(1, 3);

  // Generate FEN string (simplified - would need full position calculation in real app)
  const fen = generateFenForNode(variationNodes, depth);

  const positionDescription = `Position ${depth + 1} in ${openingName} - Memory this move?`;

  return {
    node,
    moveIndex: depth,
    correctMove,
    followingMoves,
    fen,
    positionDescription,
  };
}

/**
 * Validate a blind recall move against the correct variation move
 * No hints provided - full blind validation
 */
export function validateBlindRecall(
  playerMove: string,
  correctMove: string,
  followingMoves: string[] = []
): RecallValidation {
  const isCorrect = playerMove.toUpperCase() === correctMove.toUpperCase();

  let feedback = '';
  let alternativeMoves: string[] = [];
  let concepts: string[] = [];

  if (isCorrect) {
    feedback = `✓ Correct! ${correctMove} is the right move here.`;
    concepts = getConceptsForMove(correctMove);
  } else {
    // Provide constructive feedback without giving the answer away completely
    feedback = `✗ Not quite. You played ${playerMove}, but the variation continues with a different move.`;
    alternativeMoves = [correctMove, ...followingMoves];
  }

  return {
    isCorrect,
    playerMove,
    correctMove,
    feedback,
    alternativeMoves,
    concepts,
  };
}

/**
 * Calculate recall session accuracy and statistics
 */
export function calculateRecallAccuracy(
  sessionMoves: Array<{ isCorrect: boolean; responseTime: number }>
): RecallSessionStats {
  const totalMoves = sessionMoves.length;
  const correctMoves = sessionMoves.filter((m) => m.isCorrect).length;
  const accuracy = totalMoves > 0 ? (correctMoves / totalMoves) * 100 : 0;

  const avgResponseTime =
    sessionMoves.length > 0
      ? sessionMoves.reduce((sum, m) => sum + m.responseTime, 0) / sessionMoves.length
      : 0;

  // Calculate consecutive correct/incorrect
  let consecutiveCorrect = 0;
  let consecutiveIncorrect = 0;
  let maxConsecutiveCorrect = 0;
  let maxConsecutiveIncorrect = 0;

  for (const move of sessionMoves) {
    if (move.isCorrect) {
      consecutiveCorrect++;
      maxConsecutiveCorrect = Math.max(maxConsecutiveCorrect, consecutiveCorrect);
      consecutiveIncorrect = 0;
    } else {
      consecutiveIncorrect++;
      maxConsecutiveIncorrect = Math.max(maxConsecutiveIncorrect, consecutiveIncorrect);
      consecutiveCorrect = 0;
    }
  }

  return {
    totalMoves,
    correctMoves,
    accuracy,
    avgResponseTime,
    consecutiveCorrect: maxConsecutiveCorrect,
    consecutiveIncorrect: maxConsecutiveIncorrect,
  };
}

/**
 * Determine if a move demonstrates mastery level performance in blind recall
 * Stricter standards than regular training
 */
export function isRecallMastered(sessionStats: RecallSessionStats): boolean {
  // Recall mastery requires 90%+ accuracy (stricter than 95% regular mastery)
  // AND sub-3 second avg response time (demonstrates fluency)
  return sessionStats.accuracy >= 90 && sessionStats.avgResponseTime < 3000;
}

/**
 * Get chess concepts associated with a move
 * (simplified - would be enriched with actual concept mapping)
 */
function getConceptsForMove(move: string): string[] {
  const conceptMap: Record<string, string[]> = {
    e4: ['central-control', 'space-advantage'],
    d4: ['central-control', 'space-advantage'],
    e5: ['central-control', 'space-advantage'],
    d5: ['central-control', 'space-advantage'],
    Nf3: ['piece-development', 'tempo'],
    Nc3: ['piece-development', 'tempo'],
    Bc4: ['piece-development', 'king-safety'],
    Bf4: ['piece-development', 'space-advantage'],
  };

  return conceptMap[move] || ['tactical-awareness'];
}

/**
 * Generate simplified FEN for recall practice
 * In production, would calculate full FEN from move sequence
 */
function generateFenForNode(nodes: VariationNode[], depth: number): string {
  // Placeholder - would need actual position calculation
  return 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
}

/**
 * Filter recall nodes by difficulty
 * Based on position depth and concept complexity
 */
export function filterRecallNodesByDifficulty(
  nodes: Array<RecallNode>,
  difficulty: 'easy' | 'medium' | 'hard'
): RecallNode[] {
  return nodes.filter((node) => {
    const depthScore = node.moveIndex;

    switch (difficulty) {
      case 'easy':
        return depthScore <= 3; // First few moves
      case 'medium':
        return depthScore >= 3 && depthScore <= 8; // Middle game preparation
      case 'hard':
        return depthScore > 8; // Deep variations
      default:
        return true;
    }
  });
}

/**
 * Track recall attempt history for spaced repetition
 */
export interface RecallHistory {
  nodeId: string;
  attempts: number;
  correctAttempts: number;
  lastAttemptDate: Date;
  nextRecallDate: Date;
  avgResponseTime: number;
}

/**
 * Update recall history after attempt
 */
export function updateRecallHistory(
  history: RecallHistory,
  isCorrect: boolean,
  responseTime: number
): RecallHistory {
  const updatedHistory = {
    ...history,
    attempts: history.attempts + 1,
    correctAttempts: isCorrect ? history.correctAttempts + 1 : history.correctAttempts,
    lastAttemptDate: new Date(),
    avgResponseTime:
      (history.avgResponseTime * (history.attempts - 1) + responseTime) / history.attempts,
  };

  // Schedule next recall based on performance
  const correctRate = updatedHistory.correctAttempts / updatedHistory.attempts;
  let daysUntilNext = 1;

  if (correctRate >= 0.9) daysUntilNext = 7; // Well-learned: weekly review
  else if (correctRate >= 0.7) daysUntilNext = 3; // Developing: every 3 days
  else daysUntilNext = 1; // Struggling: daily

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + daysUntilNext);
  updatedHistory.nextRecallDate = nextDate;

  return updatedHistory;
}
