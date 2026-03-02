'use client';

import React from 'react';

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

interface ConceptPerformance {
  name: string;
  accuracy: number;
  attempts: number;
}

interface OpeningTrainerResultsModalProps {
  isOpen: boolean;
  opening: string;
  variationName: string;
  side: 'w' | 'b';
  accuracy: number;
  mistakes: number;
  sessionMoves: number;
  difficulty: DifficultyLevel;
  conceptPerformance?: Map<string, ConceptPerformance>;
  onRetry: () => void;
  onSelectDifferent: () => void;
  onEndSession: () => void;
}

function getMasteryBadge(accuracy: number): { level: string; color: string; icon: string } {
  if (accuracy >= 95) {
    return { level: 'Mastered', color: 'emerald', icon: '🌟' };
  }
  if (accuracy >= 85) {
    return { level: 'Proficient', color: 'blue', icon: '✓' };
  }
  if (accuracy >= 70) {
    return { level: 'Developing', color: 'amber', icon: '→' };
  }
  return { level: 'Beginner', color: 'slate', icon: '◐' };
}

function getRecommendation(accuracy: number, mistakes: number): string {
  if (accuracy >= 95) {
    return 'Excellent work! Move on to the next variation or challenge yourself with Recall Mode.';
  }
  if (accuracy >= 85) {
    return 'Great progress! Practice Recall Mode to solidify your understanding.';
  }
  if (accuracy >= 70) {
    return 'Good start! Review the mistakes above and practice Sidelines next.';
  }
  return 'Keep practicing! Focus on the main line before moving to variations.';
}

export default function OpeningTrainerResultsModal({
  isOpen,
  opening,
  variationName,
  side,
  accuracy,
  mistakes,
  sessionMoves,
  difficulty,
  conceptPerformance,
  onRetry,
  onSelectDifferent,
  onEndSession,
}: OpeningTrainerResultsModalProps) {
  if (!isOpen) return null;

  const mastery = getMasteryBadge(accuracy);
  const recommendation = getRecommendation(accuracy, mistakes);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-8 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Session Complete!</h2>
          <p className="text-slate-600 dark:text-slate-400">{variationName}</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Mastery Level */}
          <div className="flex items-center justify-center gap-6">
            <div className={`w-24 h-24 rounded-full bg-${mastery.color}-100 dark:bg-${mastery.color}-900/30 flex items-center justify-center text-5xl`}>
              {mastery.icon}
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400">Mastery Level</p>
              <p className={`text-3xl font-bold text-${mastery.color}-600 dark:text-${mastery.color}-400`}>
                {mastery.level}
              </p>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4 text-center">
              <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                Accuracy
              </p>
              <p className={`text-2xl font-bold ${accuracy >= 80 ? 'text-emerald-600 dark:text-emerald-400' : accuracy >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                {accuracy.toFixed(1)}%
              </p>
            </div>

            <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4 text-center">
              <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                Mistakes
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{mistakes}</p>
            </div>

            <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4 text-center">
              <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                Moves
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{sessionMoves}</p>
            </div>

            <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4 text-center">
              <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                Difficulty
              </p>
              <p className="text-2xl font-bold text-primary uppercase">{difficulty.charAt(0)}</p>
            </div>
          </div>

          {/* Concepts Performance */}
          {conceptPerformance && conceptPerformance.size > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Chess Concept Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from(conceptPerformance.values())
                  .sort((a, b) => b.accuracy - a.accuracy)
                  .map((concept) => {
                    const isWeak = concept.accuracy < 70;
                    const isProficient = concept.accuracy >= 85;
                    const isDeveloping = concept.accuracy >= 70 && concept.accuracy < 85;
                    
                    return (
                      <div
                        key={concept.name}
                        className={`rounded-lg p-4 border ${
                          isWeak
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            : isProficient
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{concept.name}</p>
                          <span className={`text-xs font-bold ${
                            isWeak
                              ? 'text-red-600 dark:text-red-400'
                              : isProficient
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {concept.accuracy.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isWeak
                                ? 'bg-red-500'
                                : isProficient
                                ? 'bg-emerald-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(concept.accuracy, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                          {concept.attempts} attempt{concept.attempts !== 1 ? 's' : ''}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="bg-jungle-green-50 dark:bg-jungle-green-900/20 border border-jungle-green-200 dark:border-jungle-green-800 rounded-lg p-6">
            <div className="flex gap-4">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-bold text-jungle-green-900 dark:text-jungle-green-200 mb-2">Coach Jakie's Recommendation</h3>
                <p className="text-sm text-jungle-green-800 dark:text-jungle-green-300">{recommendation}</p>
              </div>
            </div>
          </div>

          {/* Opening Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Opening</p>
              <p className="font-semibold text-slate-900 dark:text-white">{opening}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Side</p>
              <p className="font-semibold text-slate-900 dark:text-white">{side === 'w' ? '♔ White' : '♚ Black'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Type</p>
              <p className="font-semibold text-slate-900 dark:text-white">Standard Training</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-8 bg-slate-50 dark:bg-slate-700/50 flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all"
          >
            Retry This Variation
          </button>
          <button
            onClick={onSelectDifferent}
            className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
          >
            Try Another
          </button>
          <button
            onClick={onEndSession}
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-3 px-6 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}
