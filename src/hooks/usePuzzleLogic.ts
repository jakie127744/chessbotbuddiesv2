import { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ChessPuzzle } from '@/lib/types';
import { logActivity } from '@/lib/activity-logger';

interface UsePuzzleLogicProps {
  puzzle: ChessPuzzle | null;
  onPuzzleSolved: () => void;
  onPuzzleFailed: () => void;
}

export function usePuzzleLogic({ puzzle, onPuzzleSolved, onPuzzleFailed }: UsePuzzleLogicProps) {
  const [game, setGame] = useState<Chess | null>(null);
  const [moveIndex, setMoveIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Initialize game when puzzle loads
  const initializePuzzle = useCallback(() => {
    if (!puzzle) return;
    
    try {
        const newGame = new Chess(puzzle.fen);
        setGame(newGame);
        setMoveIndex(0);
        setIsComplete(false);
        setIsFailed(false);
        setHintsUsed(0);
        
        console.log('[Puzzle] Initialized:', puzzle.id, 'Player color:', puzzle.playerColor);

        // Auto-play removed: Database puzzles are already in "Player to Move" state
        // if (puzzle.moves.length > 0) { ... }

    } catch (e) {
        console.error("Error initializing puzzle:", e);
    }
  }, [puzzle]);

  // Auto-initialize when puzzle prop changes
  useEffect(() => {
      initializePuzzle();
  }, [initializePuzzle]);

  // Validate player move
  const validateMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    if (!game || !puzzle || isComplete || isFailed) return false;

    console.log('[Puzzle] Player move:', move, 'Expected:', puzzle.moves[moveIndex]);

    // Convert player move to UCI format
    const uciMove = move.from + move.to + (move.promotion || '');
    const expectedMove = puzzle.moves[moveIndex];

    if (uciMove === expectedMove) {
      // Correct move!
      console.log('[Puzzle] Correct move!');
      
      // Make the move
      const newGame = new Chess(game.fen());
      newGame.move(move);
      setGame(newGame);

      const nextMoveIndex = moveIndex + 1;

      // Check if puzzle is complete
      if (nextMoveIndex >= puzzle.moves.length) {
        setIsComplete(true);
        onPuzzleSolved();
        logActivity('PUZZLE_SOLVE', { puzzleId: puzzle.id, score: puzzle.rating });
        console.log('[Puzzle] Puzzle solved!');
        return true;
      }

      // Make opponent's response if available
      if (nextMoveIndex < puzzle.moves.length) {
        setTimeout(() => {
          const opponentMove = puzzle.moves[nextMoveIndex];
          const from = opponentMove.substring(0, 2);
          const to = opponentMove.substring(2, 4);
          const promotion = opponentMove.length > 4 ? opponentMove[4] : undefined;

          const newerGame = new Chess(newGame.fen());
          newerGame.move({ from, to, promotion });
          setGame(newerGame);
          setMoveIndex(nextMoveIndex + 1);

          console.log('[Puzzle] Opponent responded:', opponentMove);

          // Check if that was the last move
          if (nextMoveIndex + 1 >= puzzle.moves.length) {
            setIsComplete(true);
            onPuzzleSolved();
            logActivity('PUZZLE_SOLVE', { puzzleId: puzzle.id, score: puzzle.rating });
            console.log('[Puzzle] Puzzle solved after opponent move!');
          }
        }, 500); // Small delay for opponent move
      }

      setMoveIndex(nextMoveIndex);
      return true;
    } else {
      // Wrong move
      console.log('[Puzzle] Wrong move!');
      setIsFailed(true);
      onPuzzleFailed();
      logActivity('PUZZLE_FAIL', { puzzleId: puzzle.id, score: puzzle.rating });
      return false;
    }
  }, [game, puzzle, moveIndex, isComplete, isFailed, onPuzzleSolved, onPuzzleFailed]);

  // Get hint (show first correct move)
  const getHint = useCallback(() => {
    if (!puzzle || hintsUsed >= 2) return null;
    
    setHintsUsed(prev => prev + 1);
    const hintMove = puzzle.moves[moveIndex];
    const from = hintMove.substring(0, 2);
    const to = hintMove.substring(2, 4);
    
    console.log('[Puzzle] Hint:', from, '->', to);
    return { from, to };
  }, [puzzle, moveIndex, hintsUsed]);

  // Reset puzzle
  const resetPuzzle = useCallback(() => {
    initializePuzzle();
  }, [initializePuzzle]);

  return {
    game,
    moveIndex,
    isComplete,
    isFailed,
    hintsUsed,
    maxHints: 2,
    initializePuzzle,
    validateMove,
    getHint,
    resetPuzzle
  };
}
