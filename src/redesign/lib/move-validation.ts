/**
 * Move Validation Engine
 * Validates player moves against repertoire variation tree
 */

interface VariationNode {
  moves: string[];
  explanations?: Record<number, string>;
}

export type MoveValidationResult = 'correct' | 'incorrect' | 'acceptable-sideline';

/**
 * Validate a move against the repertoire tree
 * @param variation - The training variation with moves array
 * @param moveHistory - Current sequence of moves (UCI format)
 * @param nextMove - The move to validate (UCI format)
 * @returns Validation result and feedback
 */
export function validateMove(
  variation: VariationNode,
  moveHistory: string[],
  nextMove: string
): {
  result: MoveValidationResult;
  feedback: string;
  correctMove?: string;
  explanation?: string;
} {
  const moveIndex = moveHistory.length;

  // Get the expected move at this position
  const expectedMove = variation.moves[moveIndex];

  if (!expectedMove) {
    return {
      result: 'incorrect',
      feedback: 'The training sequence has ended.',
      correctMove: undefined,
    };
  }

  // Check if move matches the main line exactly
  if (nextMove === expectedMove) {
    const explanation = variation.explanations?.[moveIndex];
    return {
      result: 'correct',
      feedback: explanation || 'Correct! Great move.',
      explanation,
    };
  }

  // Move is incorrect - provide the correct move
  return {
    result: 'incorrect',
    feedback: `Incorrect. The correct move is ${expectedMove}.`,
    correctMove: expectedMove,
    explanation: variation.explanations?.[moveIndex],
  };
}

/**
 * Get the next coach move from the variation
 * After the player moves, the coach automatically plays the next move
 */
export function getCoachMove(
  variation: VariationNode,
  moveHistory: string[],
  playerMoveIndex: number
): string | null {
  // Coach plays the move after the player's move
  const coachMoveIndex = playerMoveIndex + 1;
  return variation.moves[coachMoveIndex] || null;
}

/**
 * Check if a move is still in the variation tree
 * Used for determining if we should continue or end training
 */
export function isInVariation(
  variation: VariationNode,
  moveHistory: string[]
): boolean {
  return moveHistory.length < variation.moves.length;
}

/**
 * Get the next expected move from the repertoire
 */
export function getNextExpectedMove(
  variation: VariationNode,
  moveHistory: string[]
): string | null {
  const nextIndex = moveHistory.length;
  return variation.moves[nextIndex] || null;
}
