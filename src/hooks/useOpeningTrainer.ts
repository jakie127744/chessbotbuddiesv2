import { useState, useCallback, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { OpeningVariation } from '@/lib/openings-repertoire';
import { updateReviewData, getReviewData, getMasteryLevel } from '@/lib/spaced-repetition';
import { GLOBAL_MOVE_TREE, compileOpeningsData } from '@/redesign/lib/opening-data-provider';

interface UseOpeningTrainerProps {
  variation: OpeningVariation | null;
  onComplete: (quality: number) => void;
  alternateVariations?: OpeningVariation[]; 
  onVariationChange?: (newVariation: OpeningVariation) => void; 
}

export function useOpeningTrainer({ variation, onComplete, alternateVariations = [], onVariationChange }: UseOpeningTrainerProps) {
  const [game, setGame] = useState<Chess | null>(null);
  const [moveIndex, setMoveIndex] = useState(0);

  useMemo(() => {
      compileOpeningsData();
  }, []);
  const [isComplete, setIsComplete] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [mistakePositions, setMistakePositions] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);

  // Initialize game when variation loads
  useEffect(() => {
    if (!variation) return;
    
    // Always start fresh when variation changes
    const newGame = new Chess();
    setGame(newGame);
    setMoveIndex(0);
    setIsComplete(false);
    setMistakes(0);
    setMistakePositions([]);
    setShowHint(false);
    console.log('[OpeningTrainer] Loaded variation:', variation.name);
  }, [variation?.id]);

  // Derive Current Node from GLOBAL_MOVE_TREE
  const currentNode = useMemo(() => {
    return game && GLOBAL_MOVE_TREE ? GLOBAL_MOVE_TREE[game.fen()] || null : null;
  }, [game]);

  // Look up explanation from either the tree node or fallback to legacy array
  const currentExplanation = useMemo(() => {
    if (currentNode?.explanation) return currentNode.explanation;
    if (variation && moveIndex > 0) {
        return variation.explanations?.[moveIndex - 1]; 
    }
    return undefined;
  }, [currentNode, variation, moveIndex]);

  // Get Expected Move
  const getExpectedMove = useCallback(() => {
    if (!variation || moveIndex >= variation.moves.length) return null;
    
    // Only return moves for the player's color
    const isPlayerTurn = (moveIndex % 2 === 0 && variation.playerColor === 'w') ||
                         (moveIndex % 2 === 1 && variation.playerColor === 'b');
    
    if (!isPlayerTurn) return null;

    return variation.moves[moveIndex];
  }, [variation, moveIndex]);

  // Make auto opponent move
  const makeOpponentMove = useCallback(() => {
    if (!game || !variation || moveIndex >= variation.moves.length || isComplete) return;

    const isOpponentTurn = (moveIndex % 2 === 0 && variation.playerColor === 'b') ||
                          (moveIndex % 2 === 1 && variation.playerColor === 'w');

    if (!isOpponentTurn) return;

    const opponentMoveUci = variation.moves[moveIndex];
    const from = opponentMoveUci.substring(0, 2);
    const to = opponentMoveUci.substring(2, 4);
    const promotion = opponentMoveUci.length > 4 ? opponentMoveUci[4] : undefined;

    try {
        const newGame = new Chess();
        newGame.loadPgn(game.pgn());
        newGame.move({ from, to, promotion });
        setGame(newGame);
        setMoveIndex(prev => prev + 1);
        console.log('[OpeningTrainer] Opponent played:', opponentMoveUci);
    } catch (e) {
        console.error("Opponent move error:", e);
    }
  }, [game, variation, moveIndex, isComplete]);

  // Check completion safely via effect
  useEffect(() => {
     if (variation && moveIndex > 0 && moveIndex >= variation.moves.length && !isComplete) {
         setIsComplete(true);
         let quality = 5; 
         if (mistakes === 0) quality = 5;
         else if (mistakes === 1) quality = 4;
         else if (mistakes === 2) quality = 3;
         else quality = 2;

         updateReviewData(variation.id, quality);
         onComplete(quality);
         console.log('[OpeningTrainer] Variation complete! Quality:', quality);
     }
  }, [moveIndex, variation, isComplete, mistakes, onComplete]);

  // Helper to execute move and advance state
  const executeMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
      if (!game || !variation) return;
      
      const newGame = new Chess();
      newGame.loadPgn(game.pgn());
      newGame.move(move);
      setGame(newGame);
      setMoveIndex(prev => prev + 1);
      setShowHint(false);

      // We rely on the completion effect to handle the end.
      // But we still need to trigger the opponent's move if not complete.
      // We will trigger it using an effect observing moveIndex.
  }, [game, variation]);

  // Trigger Opponent Move
  useEffect(() => {
    if (game && variation && !isComplete) {
        const isPlayerTurn = (moveIndex % 2 === 0 && variation.playerColor === 'w') ||
                             (moveIndex % 2 === 1 && variation.playerColor === 'b');
        
        // If it is NOT player turn, and we haven't reached the end
        if (!isPlayerTurn && moveIndex < variation.moves.length) {
            const timeoutId = setTimeout(() => makeOpponentMove(), 2500);
            return () => clearTimeout(timeoutId);
        }
    }
  }, [game, variation, moveIndex, isComplete, makeOpponentMove]);

  // Validate player move
  const validateMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    if (!game || !variation || isComplete) return false;

    const expectedMove = getExpectedMove();
    if (!expectedMove) return false; // Not player's turn to play

    const playerMoveUci = move.from + move.to + (move.promotion || '');
    console.log('[OpeningTrainer] Player:', playerMoveUci, 'Expected:', expectedMove);

    if (playerMoveUci === expectedMove) {
      executeMove(move);
      return true;
    } else {
      // Tree-dependent context validation (transpositions/deviations)
      const isRepertoireMove = currentNode?.nextMainMoves.includes(playerMoveUci) || false;

      if (isRepertoireMove) {
          // The move is in the tree, but not this variation. Check for transposition.
          const matchingAlt = alternateVariations.find(alt => {
              if (alt.playerColor !== variation.playerColor) return false;
              if (alt.moves.length <= moveIndex) return false;
              if (alt.moves[moveIndex] !== playerMoveUci) return false;
              
              for (let i = 0; i < moveIndex; i++) {
                  if (alt.moves[i] !== variation.moves[i]) return false;
              }
              return true;
          });

          if (matchingAlt && onVariationChange) {
              console.log('[OpeningTrainer] Transposition detected to:', matchingAlt.name);
              onVariationChange(matchingAlt);
              executeMove(move); 
              return true;
          }
      }
      
      console.log('[OpeningTrainer] Wrong move!');
      if (game) {
        setMistakePositions(prev => [...prev, game.fen()]);
      }
      setMistakes(prev => prev + 1);
      return false;
    }
  }, [game, variation, moveIndex, isComplete, getExpectedMove, executeMove, currentNode, alternateVariations, onVariationChange]);

  const reset = useCallback(() => {
    if (!variation) return;
    const newGame = new Chess();
    setGame(newGame);
    setMoveIndex(0);
    setIsComplete(false);
    setMistakes(0);
    setMistakePositions([]);
    setShowHint(false);
  }, [variation]);

  const undoMove = useCallback(() => {
    if (!game || moveIndex === 0) return;
    
    const newGame = new Chess();
    newGame.loadPgn(game.pgn());
    
    // Undo twice to revert both opponent move and user move
    newGame.undo();
    newGame.undo();
    
    setGame(newGame);
    setMoveIndex(prev => Math.max(0, prev - 2));
    setShowHint(false);
  }, [game, moveIndex]);

  const getHint = useCallback(() => {
    const expectedMove = getExpectedMove();
    if (!expectedMove) return null;
    const from = expectedMove.substring(0, 2);
    const to = expectedMove.substring(2, 4);
    setShowHint(true);
    return { from, to };
  }, [getExpectedMove]);

  return {
    game,
    moveIndex,
    isComplete,
    mistakes,
    mistakePositions,
    showHint,
    totalMoves: variation?.moves.length || 0,
    currentNode,
    currentExplanation,
    validateMove,
    reset,
    undoMove,
    getHint,
    getExpectedMove,
    setGame,
    reviewData: variation ? getReviewData(variation.id) : null,
    masteryLevel: variation ? getMasteryLevel(getReviewData(variation.id)) : 0
  };
}
