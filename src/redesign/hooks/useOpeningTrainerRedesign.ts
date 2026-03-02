import { useState, useCallback, useMemo, useEffect } from 'react';
import { Chess } from 'chess.js';
import { 
  OpeningTrainerState, 
  Opening, 
  Variation, 
  difficulty_level
} from '@/lib/opening-data';
import { useOpeningTrainer } from '@/hooks/useOpeningTrainer';
import { useStockfish } from '@/hooks/useStockfish';
import { COMPILED_OPENINGS, compileOpeningsData } from '../lib/opening-data-provider';
import { DEFAULT_REPERTOIRE, OpeningVariation } from '../lib/openings-repertoire';
import { getBotComment } from '../lib/bot-commentary';
import { BOT_PROFILES } from '../lib/bot-profiles';
import { useRewards } from '@/contexts/RewardsContext';

export function useOpeningTrainerRedesign() {
  const { markOpeningComplete } = useRewards();
  const [state, setState] = useState<OpeningTrainerState>('STATE_LOADING');
  
  useEffect(() => {
      compileOpeningsData().then(() => {
          setState('STATE_OPENING_SELECTION');
      });
  }, []);
  
  // Selection State
  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null);
  const [selectedSide, setSelectedSide] = useState<'white' | 'black' | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [difficulty, setDifficulty] = useState<difficulty_level>('intermediate');

  // The raw legacy format variation required by the inner hook
  const [rawVariation, setRawVariation] = useState<OpeningVariation | null>(null);

  // Board Orientation
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');

  // Metrics not handled by inner hook
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [correctMoves, setCorrectMoves] = useState(0);
  const [lastMoveStatus, setLastMoveStatus] = useState<'correct' | 'incorrect' | 'idle'>('idle');
  const [reviewMistakeIndex, setReviewMistakeIndex] = useState(0);

  // Instantiate the CORE training algorithm hook
  const trainer = useOpeningTrainer({
      variation: rawVariation,
      onComplete: (quality: number) => {
          setState('STATE_RESULTS');
          if (rawVariation) {
             markOpeningComplete(rawVariation.id);
          }
      },
      alternateVariations: DEFAULT_REPERTOIRE, // Allow transpositions across entire repertoire mapped so far
      onVariationChange: (newVar: OpeningVariation) => {
          setRawVariation(newVar);
          // Also update the UI metadata
          const opening = COMPILED_OPENINGS![newVar.opening];
          if (opening) {
              const vari = opening.variations.find((v: Variation) => v.id === newVar.id);
              if (vari) setSelectedVariation(vari);
          }
      }
  });

  // Sync game history from the inner chess instance
  useEffect(() => {
      if (trainer.game) {
          setMoveHistory(trainer.game.history());
      }
  }, [trainer.game, trainer.moveIndex]);

  // Computed state
  const progressPercent = useMemo(() => {
    if (!selectedVariation || selectedVariation.moveCount === 0) return 0;
    return Math.min(100, Math.round((trainer.moveIndex / selectedVariation.moveCount) * 100));
  }, [trainer.moveIndex, selectedVariation]);

  const accuracy = useMemo(() => {
    const total = correctMoves + trainer.mistakes;
    if (total === 0) return 100;
    return Math.max(0, Math.round((correctMoves / total) * 100));
  }, [correctMoves, trainer.mistakes]);

  // Actions
  const selectOpening = useCallback((openingId: string) => {
    const op = COMPILED_OPENINGS![openingId];
    if (op) {
        setSelectedOpening(op);
        setState('STATE_SIDE_SELECTION');
    }
  }, []);

  const selectSide = useCallback((side: 'white' | 'black') => {
    setSelectedSide(side);
    setState('STATE_VARIATION_SELECTION');
  }, []);

  const selectVariation = useCallback((variationId: string) => {
    if (!selectedOpening) return;
    
    // Find metadata
    const vari = selectedOpening.variations.find((v: Variation) => v.id === variationId) 
              || selectedOpening.variations.find((v: Variation) => v.id.includes(variationId)) // fallback regex
              || selectedOpening.variations[0];
              
    setSelectedVariation(vari);
    
    // Find raw data for hook
    const raw = DEFAULT_REPERTOIRE.find((v: OpeningVariation) => v.id === vari.id);
    if (raw) {
        setRawVariation(raw);
    }
    
    setState('STATE_TRAINING');
    setBoardOrientation(vari.defaultSide);
    setCorrectMoves(0);
    setCurrentStreak(0);
    setHintsUsed(0);
  }, [selectedOpening]);

  const continueToFreePlay = useCallback(() => {
    setState('STATE_FREE_PLAY');
  }, []);

  const startMistakeReview = useCallback(() => {
    if (trainer.mistakePositions.length > 0) {
      setReviewMistakeIndex(0);
      const firstMistakeFen = trainer.mistakePositions[0];
      const newGame = new Chess(firstMistakeFen);
      trainer.setGame(newGame);
      setState('STATE_REVIEW_MISTAKES');
      setLastMoveStatus('idle');
      setDynamicFeedback("Let's review this mistake. What should White play here?");
    }
  }, [trainer.mistakePositions, trainer]);

  const flipBoard = useCallback(() => {
    setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');
  }, []);

  const [dynamicFeedback, setDynamicFeedback] = useState<string | null>(null);

  const handleUserMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    if (state !== 'STATE_TRAINING' && state !== 'STATE_FREE_PLAY' && state !== 'STATE_REVIEW_MISTAKES') return false;

    if (state === 'STATE_REVIEW_MISTAKES') {
      const isCorrect = trainer.validateMove(move);
      if (isCorrect) {
          setLastMoveStatus('correct');
          setDynamicFeedback("Correct! You found the right move.");
          
          // Move to next mistake after a delay
          setTimeout(() => {
              if (reviewMistakeIndex + 1 < trainer.mistakePositions.length) {
                  const nextIndex = reviewMistakeIndex + 1;
                  setReviewMistakeIndex(nextIndex);
                  const nextFen = trainer.mistakePositions[nextIndex];
                  const newGame = new Chess(nextFen);
                  trainer.setGame(newGame);
                  setLastMoveStatus('idle');
                  setDynamicFeedback(`Mistake ${nextIndex + 1} of ${trainer.mistakePositions.length}. Find the best move.`);
              } else {
                  setState('STATE_RESULTS');
                  setDynamicFeedback("Mistake review complete!");
              }
          }, 2000);
          return true;
      } else {
          setLastMoveStatus('incorrect');
          setDynamicFeedback("Not quite. Try again.");
          return false;
      }
    }

    if (state === 'STATE_FREE_PLAY') {
      if (trainer.game) {
        try {
          const newGame = new Chess();
          newGame.loadPgn(trainer.game.pgn());
          newGame.move(move);
          trainer.setGame(newGame);
          return true;
        } catch (e) {
          console.error("Free play move error:", e);
          return false;
        }
      }
      return false;
    }

    // Reset dynamic feedback before validation
    setDynamicFeedback(null);

    // The inner hook handles the actual game state update
    const isCorrect = trainer.validateMove(move);

    if (isCorrect) {
        setCorrectMoves(c => c + 1);
        setCurrentStreak(s => s + 1);
        setLastMoveStatus('correct');
    } else {
        setCurrentStreak(0);
        setLastMoveStatus('incorrect');
        
        // Use Coach Jakie by default to give contextual hints
        if (trainer.game) {
             const coachId = 'bot-adaptive'; // Coach Jakie's real ID
             const coach = BOT_PROFILES.find(b => b.id === coachId) || BOT_PROFILES[3]; 

             // A simple heuristic based "Missed Tactic" / "Opening Mistake" context 
             // because full pipeline is asynchronous Stockfish.
             // We fallback to a contextual text pool for immediate UX.
             const commentString = getBotComment(coach.id, 'opening');
             setDynamicFeedback(commentString || "That leaves our preparation.");
        }
    }

    return isCorrect; // tells UI if piece should snap or reject
  }, [state, trainer]);

  const requestHint = useCallback(() => {
    setHintsUsed(h => h + 1);
    trainer.getHint();
  }, [trainer]);

  const undoLastMove = useCallback(() => {
    trainer.undoMove();
    setLastMoveStatus('idle');
    setDynamicFeedback(null);
  }, [trainer]);

  const retryFromStart = useCallback(() => {
    trainer.reset();
    setLastMoveStatus('idle');
    setDynamicFeedback(null);
    setCorrectMoves(0);
    setCurrentStreak(0);
    setHintsUsed(0);
  }, [trainer]);

  const [deviationMode, setDeviationMode] = useState(false);
  const toggleTrainingMode = useCallback(() => {
    setDeviationMode(prev => !prev);
  }, []);

  const resetSession = useCallback(() => {
    setState('STATE_OPENING_SELECTION');
    setSelectedOpening(null);
    setSelectedSide(null);
    setSelectedVariation(null);
    setRawVariation(null);
    trainer.reset();
  }, [trainer]);

    // Hint logic
    const expectedMoveStr = trainer.getExpectedMove();
    const hintArrows = trainer.showHint && expectedMoveStr 
       ? [{ from: expectedMoveStr.substring(0, 2), to: expectedMoveStr.substring(2, 4), color: 'rgba(245, 158, 11, 0.5)' }] 
       : [];

  return {
    state,
    selectedOpening,
    selectedSide,
    selectedVariation,
    difficulty,
    
    // Game progress data
    game: trainer.game,
    moveHistory,
    progressPercent,
    
    // Metrics
    correctMoves,
    mistakes: trainer.mistakes,
    currentStreak,
    accuracy,
    hintsUsed,
    lastMoveStatus,
      
    // Data from MoveNode tree
    currentNode: trainer.currentNode,
    currentExplanation: trainer.currentExplanation,
    dynamicFeedback,
    hintArrows,
    showHint: trainer.showHint,
    deviationMode,
      
    // Actions
    selectOpening,
    selectSide,
    selectVariation,
    setDifficulty,
    handleUserMove,
    requestHint,
    undoLastMove,
    retryFromStart,
    toggleTrainingMode,
    resetSession,
    continueToFreePlay,
    boardOrientation,
    flipBoard,
    startMistakeReview,
    mistakePositions: trainer.mistakePositions,
    reviewMistakeIndex
  };
}
