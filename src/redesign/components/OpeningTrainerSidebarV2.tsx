'use client';

import React, { useMemo } from 'react';

interface VariationNode {
  id: string;
  name: string;
  moveCount: number;
  status: 'completed' | 'in-progress' | 'not-started' | 'warning';
  mastery?: 'beginner' | 'developing' | 'proficient' | 'mastered';
}

interface OpeningTrainerSidebarProps {
  opening: string;
  variation: any;
  difficulty: string;
  moveHistory: string[];
  accuracy: number;
}

export default function OpeningTrainerSidebarV2({
  opening,
  variation,
  difficulty,
  moveHistory,
  accuracy,
}: OpeningTrainerSidebarProps) {
  // Sample variation tree - in production, this would come from the variation object
  const variationTree: VariationNode[] = useMemo(
    () => [
      {
        id: 'main-line',
        name: 'Main Line',
        moveCount: 12,
        status: moveHistory.length >= 12 ? 'completed' : moveHistory.length > 0 ? 'in-progress' : 'not-started',
        mastery: accuracy > 90 ? 'mastered' : accuracy > 70 ? 'proficient' : accuracy > 50 ? 'developing' : 'beginner',
      },
      {
        id: 'sideline-1',
        name: '5... Nc6 (Alternative)',
        moveCount: 8,
        status: 'not-started',
        mastery: 'beginner',
      },
      {
        id: 'sideline-2',
        name: '6... d5 (Aggressive)',
        moveCount: 10,
        status: moveHistory.length > 5 ? 'warning' : 'not-started',
        mastery: 'developing',
      },
      {
        id: 'sideline-3',
        name: '7... Bd6 (Solid)',
        moveCount: 9,
        status: 'not-started',
        mastery: 'beginner',
      },
    ],
    [moveHistory.length, accuracy]
  );

  // Calculate overall progress
  const completedVariations = variationTree.filter(v => v.status === 'completed').length;
  const totalVariations = variationTree.length;
  const progressPercentage = (completedVariations / totalVariations) * 100;

  // Get status icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: 'task_alt', color: 'text-jungle-green-600 dark:text-jungle-green-400' };
      case 'in-progress':
        return { icon: 'schedule', color: 'text-jungle-green-500 dark:text-jungle-green-300' };
      case 'warning':
        return { icon: 'warning', color: 'text-amber-600 dark:text-amber-400' };
      default:
        return { icon: 'circle', color: 'text-slate-400 dark:text-slate-500' };
    }
  };

  // Get mastery color
  const getMasteryColor = (mastery?: string) => {
    switch (mastery) {
      case 'mastered':
        return 'bg-jungle-green-100 dark:bg-jungle-green-900/30 text-jungle-green-700 dark:text-jungle-green-300 border-jungle-green-200 dark:border-jungle-green-800';
      case 'proficient':
        return 'bg-jungle-green-50 dark:bg-jungle-green-900/20 text-jungle-green-700 dark:text-jungle-green-300 border-jungle-green-200 dark:border-jungle-green-800';
      case 'developing':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600';
    }
  };

  return (
    <section className="w-72 flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-b from-white dark:from-slate-800 to-white/50 dark:to-slate-800/50 border-b border-slate-200 dark:border-slate-700 p-4 space-y-4">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">{variation.name || opening}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{variation.description || variation.opening}</p>
        </div>

        {/* Difficulty Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/30 rounded">
            {difficulty.toUpperCase()}
          </span>
          <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/30 rounded">
            {variation.playerColor === 'w' ? '♔ White' : '♚ Black'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Progress</span>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
              {completedVariations}/{totalVariations}
            </span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Variation Tree */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {variationTree.map((node) => {
            const statusInfo = getStatusIcon(node.status);
            return (
              <div
                key={node.id}
                className={`group cursor-pointer p-3 rounded-lg border transition-all ${
                  node.status === 'in-progress'
                    ? 'bg-jungle-green-50 dark:bg-jungle-green-900/20 border-jungle-green-200 dark:border-jungle-green-800'
                    : node.status === 'completed'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className={`mt-0.5 flex-shrink-0 ${statusInfo.color}`}>
                    <span className="material-symbols-outlined text-sm">{statusInfo.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                      {node.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{node.moveCount} moves</p>

                    {/* Mastery Badge */}
                    {node.mastery && (
                      <div className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded-full border ${getMasteryColor(node.mastery)}`}>
                        {node.mastery.charAt(0).toUpperCase() + node.mastery.slice(1)}
                      </div>
                    )}
                  </div>

                  {/* Action Icon */}
                  <div className="text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors flex-shrink-0">
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Session</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{moveHistory.length}</p>
          </div>
          <div className="text-center p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Accuracy</p>
            <p className={`text-lg font-bold ${accuracy > 80 ? 'text-emerald-600 dark:text-emerald-400' : accuracy > 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
              {accuracy.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
