'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import { getOpeningName } from '../lib/opening-lookup';
import { getBookMoves } from '../lib/opening-book';
import { DEFAULT_REPERTOIRE } from '../lib/openings-repertoire';
import { validateMove, getCoachMove, isInVariation } from '../lib/move-validation';
import { tagMovesWithConcepts, trackConceptPerformance, accumulateConceptPerformance } from '../lib/concept-diagnostics';
import ChessBoard from './ChessBoard';

type TrainingMode = 'standard' | 'sidelines' | 'recall';
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

interface OpeningTrainerBoardAreaProps {
  opening: string;
  color: 'white' | 'black';
  variation: any;
  mode: TrainingMode;
  difficulty: DifficultyLevel;
  moveHistory: string[];
  setMoveHistory: (moves: string[]) => void;
  mistakes: number;
  setMistakes: (mistakes: number) => void;
  accuracy: number;
  setAccuracy: (accuracy: number) => void;
  streak: number;
  setStreak: (streak: number) => void;
  onEndSession: () => void;
  onConceptsTracked?: (concepts: Map<string, any>) => void;
  onSidelineDetected?: (moveIndex: number, playerMove: string, mainlineMove: string) => void;
}

export default function OpeningTrainerBoardArea({
  opening,
  color,
  variation,
  mode,
  difficulty,
  moveHistory,
  setMoveHistory,
  mistakes,
  setMistakes,
  accuracy,
  setAccuracy,
  streak,
  setStreak,
  onEndSession,
  onConceptsTracked,
  onSidelineDetected,
}: OpeningTrainerBoardAreaProps) {
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | 'hint' | ''>('');
  const [showHint, setShowHint] = useState(false);
  const [lastValidation, setLastValidation] = useState<any>(null);
  
  // Create Chess instance for tracking board state
  const game = useMemo(() => new Chess(), []);
  
  // Concept tracking for this session
  const [sessionConceptPerformance, setSessionConceptPerformance] = useState<Map<string, any>>(new Map());

  // Derive last move from moveHistory
  const lastMove = useMemo(() => {
    if (moveHistory.length === 0) return null;
    const lastUci = moveHistory[moveHistory.length - 1];
    return {
      from: lastUci.slice(0, 2),
      to: lastUci.slice(2, 4)
    };
  }, [moveHistory]);

  // Get repertoire for validation
  const repertoire = DEFAULT_REPERTOIRE.find(
    v => v.opening === opening && v.playerColor === (color === 'white' ? 'w' : 'b')
  );

  // Handle user move with validation
  const handlePlayerMove = useCallback((move: { from: string; to: string; promotion?: string }): boolean => {
    if (!repertoire) {
      setFeedbackMessage('Opening not found in repertoire.');
      setFeedbackType('incorrect');
      return false;
    }

    // Convert move object to UCI notation (e.g., "e2e4")
    const uciMove = `${move.from}${move.to}${move.promotion || ''}`;

    // Validate the move
    const result = validateMove(repertoire, moveHistory, uciMove);
    setLastValidation(result);

    if (result.result === 'correct') {
      // Move is correct - update state
      setFeedbackMessage(result.feedback);
      setFeedbackType('correct');
      setStreak(streak + 1);
      
      const newMoveHistory = [...moveHistory, uciMove];
      setMoveHistory(newMoveHistory);
      
      // Tag this move with chess concepts and track performance
      const moveConcepts = tagMovesWithConcepts([uciMove], opening);
      if (moveConcepts.has(newMoveHistory.length - 1)) {
        const concepts = moveConcepts.get(newMoveHistory.length - 1) || [];
        const newConceptPerf = trackConceptPerformance(
          newMoveHistory.length - 1,
          true, // isCorrect
          concepts
        );
        setSessionConceptPerformance(new Map([...sessionConceptPerformance, ...newConceptPerf]));
      }
      
      // Update accuracy
      const totalMoves = newMoveHistory.length + mistakes;
      const newAccuracy = (newMoveHistory.length / totalMoves) * 100;
      setAccuracy(newAccuracy);

      // Check if variation is complete
      if (!isInVariation(repertoire, newMoveHistory)) {
        setFeedbackMessage('✓ Variation completed! Great work!');
      }
      
      return true;
    } else {
      // Move is incorrect
      setFeedbackMessage(result.feedback);
      setFeedbackType('incorrect');
      setMistakes(mistakes + 1);
      setStreak(0);
      
      // Track concept performance for incorrect move
      const moveConcepts = tagMovesWithConcepts([uciMove], opening);
      if (moveConcepts.has(moveHistory.length)) {
        const concepts = moveConcepts.get(moveHistory.length) || [];
        const newConceptPerf = trackConceptPerformance(
          moveHistory.length,
          false, // isCorrect
          concepts
        );
        setSessionConceptPerformance(new Map([...sessionConceptPerformance, ...newConceptPerf]));
      }
      
      const totalMoves = moveHistory.length + mistakes + 1;
      const newAccuracy = (moveHistory.length / totalMoves) * 100;
      setAccuracy(newAccuracy);
      
      return false;
    }
  }, [repertoire, moveHistory, mistakes, streak, setMoveHistory, setMistakes, setAccuracy, setStreak, opening, sessionConceptPerformance]);

  // Validate move against repertoire tree
  const validateMoveWithRep = (moveIndex: number): boolean => {
    if (!repertoire || !repertoire.moves[moveIndex]) {
      return false;
    }
    return true;
  };

  // Render context banner based on mode
  const renderContextBanner = () => {
    let icon = 'visibility_off';
    let title = 'Training';
    let description = '';

    if (mode === 'standard') {
      icon = 'school';
      title = 'Standard Training';
      description = `Learn the main line of ${variation.name}`;
    } else if (mode === 'sidelines') {
      icon = 'branch';
      title = 'Sidelines Training';
      description = 'Practice against sidelines you\'ve faced';
    } else if (mode === 'recall') {
      icon = 'memory';
      title = 'Position Recall';
      description = 'What is the correct move?';
    }

    return (
      <div className="mb-6 bg-primary/10 border-l-4 border-primary p-4 rounded-r-xl flex items-center gap-4">
        <div className="bg-primary/20 p-2 rounded-lg text-primary">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-primary">{title} — Move {moveHistory.length + 1}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{description}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/30 px-2 py-0.5 rounded">
              {difficulty.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="flex-1 flex flex-col bg-slate-50 dark:bg-background-dark p-6 overflow-y-auto">
      {/* Context Banner */}
      {renderContextBanner()}

      {/* Chessboard Container */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <div className="w-full aspect-square bg-slate-800 rounded-lg shadow-2xl overflow-hidden border-8 border-slate-800 relative">
          {repertoire ? (
            <ChessBoard
              game={game}
              onMove={handlePlayerMove}
              orientation={color === 'black' ? 'black' : 'white'}
              lastMove={lastMove}
              arrows={[]}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <div className="text-center text-slate-400">
                <span className="material-symbols-outlined text-5xl mb-4 block">error</span>
                <p className="text-sm font-semibold">Opening not found</p>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Strip */}
        {feedbackMessage && (
          <div className={`w-full mt-4 flex items-center gap-3 px-6 py-4 rounded-xl border ${
            feedbackType === 'correct'
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : feedbackType === 'incorrect'
              ? 'bg-red-500/10 border-red-500/20'
              : 'bg-amber-500/10 border-amber-500/20'
          }`}>
            <span className={`material-symbols-outlined ${
              feedbackType === 'correct'
                ? 'text-emerald-500'
                : feedbackType === 'incorrect'
                ? 'text-red-500'
                : 'text-amber-500'
            }`}>
              {feedbackType === 'correct' ? 'task_alt' : feedbackType === 'incorrect' ? 'cancel' : 'lightbulb'}
            </span>
            <p className={`text-sm font-semibold ${
              feedbackType === 'correct'
                ? 'text-emerald-600 dark:text-emerald-400'
                : feedbackType === 'incorrect'
                ? 'text-red-600 dark:text-red-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}>
              {feedbackMessage}
            </p>
          </div>
        )}

        {/* Confidence Slider */}
        <div className="w-full mt-6 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">How confident were you?</span>
            <span className="text-xs font-bold text-primary">Scale 1-5</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">Guessing</span>
            <input className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" max="5" min="1" step="1" type="range" />
            <span className="text-xs text-slate-400">Mastered</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="w-full mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => {
              setShowHint(!showHint);
              setFeedbackMessage(repertoire?.explanations?.[moveHistory.length] || 'No hint available');
              setFeedbackType('hint');
            }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary px-4 py-3 rounded-xl transition-all flex flex-col items-center gap-1 group"
          >
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">lightbulb</span>
            <span className="text-[10px] font-bold uppercase text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white">Show Hint</span>
          </button>
          <button
            onClick={() => {
              setMoveHistory([]);
              setFeedbackMessage('');
              setFeedbackType('');
            }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary px-4 py-3 rounded-xl transition-all flex flex-col items-center gap-1 group"
          >
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">replay</span>
            <span className="text-[10px] font-bold uppercase text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white">Retry</span>
          </button>
          <button
            onClick={() => setMoveHistory([])}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary px-4 py-3 rounded-xl transition-all flex flex-col items-center gap-1 group"
          >
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">swap_horiz</span>
            <span className="text-[10px] font-bold uppercase text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white">Switch Mode</span>
          </button>
          <button
            onClick={() => {
              // Pass concept data to parent before ending session
              if (onConceptsTracked) {
                onConceptsTracked(sessionConceptPerformance);
              }
              onEndSession();
            }}
            className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 px-4 py-3 rounded-xl transition-all flex flex-col items-center gap-1 group"
          >
            <span className="material-symbols-outlined text-red-500">logout</span>
            <span className="text-[10px] font-bold uppercase text-red-500">End Session</span>
          </button>
        </div>
      </div>
    </section>
  );
}
