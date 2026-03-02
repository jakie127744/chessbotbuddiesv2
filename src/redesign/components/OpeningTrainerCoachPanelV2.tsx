'use client';

import React, { useState, useMemo } from 'react';
import { Chess } from 'chess.js';
import type { ChessConcept, ConceptPerformance } from '../lib/concept-diagnostics';
import { getJakieFirstMoveReaction, detectOpeningTransposition } from '@/lib/coach-helpers';

type TrainingMode = 'standard' | 'sidelines' | 'recall';
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

interface OpeningTrainerCoachPanelProps {
  opening: string;
  variation: any;
  mode: TrainingMode;
  difficulty: DifficultyLevel;
  accuracy: number;
  mistakes: number;
  streak: number;
  moveHistory: string[];
  weakConcepts?: ChessConcept[];
  conceptPerformance?: Map<ChessConcept, ConceptPerformance>;
}

export default function OpeningTrainerCoachPanelV2({
  opening,
  variation,
  mode,
  difficulty,
  accuracy,
  mistakes,
  streak,
  moveHistory,
  weakConcepts = [],
  conceptPerformance,
}: OpeningTrainerCoachPanelProps) {
  // Determine mastery level based on accuracy
  const getMasteryLevel = (acc: number) => {
    if (acc === 0) return 'Beginner';
    if (acc < 70) return 'Beginner';
    if (acc < 85) return 'Developing';
    if (acc < 95) return 'Proficient';
    return 'Mastered';
  };

  // Jakie's smart reactions (Opening Trainer edition)
  const jakiesSmartComment = useMemo(() => {
    if (moveHistory.length === 0) return null;
    
    try {
      const chess = new Chess();
      // moveHistory contains UCI moves (e.g. "e2e4")
      for (const move of moveHistory) {
        chess.move(move);
      }
      
      const sanHistory = chess.history();
      const currentMoveCount = sanHistory.length;
      const lastSan = sanHistory[currentMoveCount - 1];
      
      // 1. First-move reactions (moves 1-10)
      if (currentMoveCount <= 10) {
        const reaction = getJakieFirstMoveReaction(lastSan, currentMoveCount, sanHistory);
        if (reaction) return reaction;
      }
      
      // 2. Transposition detection (variation name is usually a good proxy)
      // Note: In trainer, variation.name is the target, but we can detect if we just entered it
      // For now, first-move reactions are the priority for the user's specific request
    } catch (err) {
      console.warn('Jakie smart reaction failed:', err);
    }
    return null;
  }, [moveHistory]);

  // Generate adaptive coach messages with concept awareness
  const getCoachMessage = (): string => {
    // Priority 1: Jakie's smart reaction to a move
    if (jakiesSmartComment) return jakiesSmartComment;

    if (moveHistory.length === 0) {
      if (mode === 'standard') {
        return `Welcome to ${variation.name}! I'm coach Jakie. Let's explore this beautiful opening together. Make your first move.`;
      } else if (mode === 'sidelines') {
        return `Time to test your knowledge against sidelines. Show me you've prepared!`;
      } else {
        return `Can you recall the critical moves? Trust your instincts!`;
      }
    }

    // Concept-specific feedback when weak concepts are detected
    if (weakConcepts.length > 0 && mistakes > 0) {
      const weakestConcept = weakConcepts[0];
      return `I notice you're struggling with ${weakestConcept.replace('-', ' ')}. This is important in ${variation.name}. Let's focus on that.`;
    }

    if (mistakes > 0 && accuracy < 50) {
      return `I see you're still learning the fundamentals. No worries - let's focus on the main line first. Which move comes next?`;
    }

    if (streak >= 3) {
      return `Excellent! You're on a hot streak. Keep it up!`;
    }

    if (mistakes > 5) {
      return `You've had some missteps. Want to focus on a different aspect of this opening?`;
    }

    return `Keep going! You're making good progress.`;
  };

  // Wiki fact (could be dynamic based on opening)
  const wikiFacts = [
    {
      concept: 'Central Control',
      description: `In ${variation.name}, controlling the center prevents opponent's piece mobility and ensures superior positioning.`,
    },
    {
      concept: 'Piece Development',
      description: 'Developing pieces before moving the same piece twice ensures rapid piece coordination.',
    },
    {
      concept: 'King Safety',
      description: 'Castling early creates a safer king position and connects rooks for future maneuvers.',
    },
  ];

  const currentWikiFact = useMemo(
    () => wikiFacts[moveHistory.length % wikiFacts.length],
    [moveHistory.length]
  );

  return (
    <section className="w-72 flex flex-col bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 overflow-y-auto">
      {/* Coach Header */}
      <div className="sticky top-0 bg-gradient-to-r from-primary/5 to-primary/0 dark:from-primary/10 dark:to-primary/5 border-b border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">psychology</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Coach Jakie</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your Opening Expert</p>
          </div>
        </div>

        {/* Mastery Badge */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-700/50 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600">
          <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Mastery</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
            getMasteryLevel(accuracy) === 'Mastered'
              ? 'bg-jungle-green-500/20 text-jungle-green-600 dark:text-jungle-green-300'
              : getMasteryLevel(accuracy) === 'Proficient'
              ? 'bg-jungle-green-400/15 text-jungle-green-400 dark:text-jungle-green-200'
              : getMasteryLevel(accuracy) === 'Developing'
              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
          }`}>
            {getMasteryLevel(accuracy)}
          </span>
        </div>
      </div>

      {/* Coach Message */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
            {getCoachMessage()}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-2 gap-3">
          {/* Accuracy */}
          <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 text-center border border-slate-200 dark:border-slate-600">
            <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Accuracy</p>
            <p className={`text-lg font-bold ${accuracy >= 80 ? 'text-emerald-600 dark:text-emerald-400' : accuracy >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
              {accuracy.toFixed(0)}%
            </p>
          </div>

          {/* Mistakes */}
          <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 text-center border border-slate-200 dark:border-slate-600">
            <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Mistakes</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{mistakes}</p>
          </div>

          {/* Streak */}
          <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 text-center border border-slate-200 dark:border-slate-600">
            <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Streak</p>
            <p className="text-lg font-bold text-primary">{streak}</p>
          </div>

          {/* Progress */}
          <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 text-center border border-slate-200 dark:border-slate-600">
            <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Progress</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {moveHistory.length}/{variation.moves?.length || '?'}
            </p>
          </div>
        </div>
      </div>

      {/* Wiki Fact */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">library_books</span>
            <h3 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-200">Wiki Fact</h3>
          </div>
          <div className="bg-jungle-green-50 dark:bg-jungle-green-900/20 border border-jungle-green-200 dark:border-jungle-green-800/30 rounded-lg p-3">
            <p className="text-[11px] font-bold text-jungle-green-700 dark:text-jungle-green-300 mb-1">{currentWikiFact.concept}</p>
            <p className="text-xs text-jungle-green-600 dark:text-jungle-green-200 leading-relaxed">{currentWikiFact.description}</p>
          </div>
        </div>
      </div>

      {/* Socratic Hint */}
      <div className="flex-1 px-4 py-4 flex flex-col">
        <div className="space-y-2 flex flex-col flex-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-lg">lightbulb</span>
            <h3 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-200">Socratic Hint</h3>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-3 flex-1 flex flex-col">
            <div className="space-y-2 flex-1 flex flex-col justify-center">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                {difficulty === 'beginner'
                  ? 'Think about the center of the board. Where should your pieces control?'
                  : difficulty === 'intermediate'
                  ? 'Consider both attacking chances and defensive necessities.'
                  : 'What weaknesses in the position can you exploit with this move?'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tip Footer */}
      <div className="flex-shrink-0 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700 px-4 py-3 text-[10px] text-slate-500 dark:text-slate-400 text-center italic">
        💡 Hints are more valuable than answers
      </div>
    </section>
  );
}
