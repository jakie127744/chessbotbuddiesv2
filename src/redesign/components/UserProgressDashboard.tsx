'use client';

import React, { useMemo } from 'react';
import { VariationPerformance } from '../lib/mastery-manager';
import { ChessConcept, ConceptPerformance } from '../lib/concept-diagnostics';
import { DeviationRecord, DeviationProfile } from '../lib/deviation-engine';
import { RecallHistory } from '../lib/recall-mode-logic';

const CHESS_CONCEPTS: ChessConcept[] = [
  'central-control',
  'piece-development',
  'king-safety',
  'kingside-attack',
  'queenside-expansion',
  'pawn-structure',
  'piece-coordination',
  'tempo',
  'space-advantage',
  'endgame-technique',
];

interface UserProgressDashboardProps {
  performances: Map<string, VariationPerformance>;
  conceptDiagnostics?: Map<ChessConcept, ConceptPerformance>;
  recallHistory?: Map<string, RecallHistory>;
  deviationHistory?: Map<string, Map<string, DeviationRecord>>;
  onClose: () => void;
}

export default function UserProgressDashboard({
  performances,
  conceptDiagnostics,
  recallHistory,
  deviationHistory,
  onClose,
}: UserProgressDashboardProps) {
  // Calculate overall statistics
  const stats = useMemo(() => {
    let totalSessions = 0;
    let totalAccuracy = 0;
    let masteredCount = 0;
    let proficientCount = 0;
    let developingCount = 0;
    let beginnerCount = 0;

    performances.forEach((perf) => {
      totalSessions += perf.attempts || 1;
      totalAccuracy += perf.accuracy || 0;

      if (perf.accuracy >= 95) masteredCount++;
      else if (perf.accuracy >= 85) proficientCount++;
      else if (perf.accuracy >= 70) developingCount++;
      else beginnerCount++;
    });

    const avgAccuracy = performances.size > 0 ? totalAccuracy / performances.size : 0;

    // Recall stats
    let totalRecallSessions = 0;
    let totalRecallCorrect = 0;
    let totalRecallAttempts = 0;

    recallHistory?.forEach((history) => {
      totalRecallSessions += 1;
      totalRecallCorrect += history.correctAttempts || 0;
      totalRecallAttempts += history.attempts || 0;
    });

    const recallAccuracy = totalRecallAttempts > 0 ? (totalRecallCorrect / totalRecallAttempts) * 100 : 0;

    // Deviation stats
    let totalDeviations = 0;
    let uniqueDeviationPoints = 0;

    deviationHistory?.forEach((deviations) => {
      totalDeviations += deviations.size;
      uniqueDeviationPoints += new Set(Array.from(deviations.values()).map(d => d.moveIndex)).size;
    });

    return {
      totalSessions,
      avgAccuracy,
      masteredCount,
      proficientCount,
      developingCount,
      beginnerCount,
      totalRecallSessions,
      totalRecallCorrect,
      recallAccuracy,
      totalDeviations,
      uniqueDeviationPoints,
    };
  }, [performances, recallHistory, deviationHistory]);

  // Get mastery level color
  const getMasteryColor = (accuracy: number): string => {
    if (accuracy >= 95) return 'jungle-green';
    if (accuracy >= 85) return 'mint';
    if (accuracy >= 70) return 'amber';
    return 'slate';
  };

  const getMasteryLabel = (accuracy: number): string => {
    if (accuracy >= 95) return 'Mastered';
    if (accuracy >= 85) return 'Proficient';
    if (accuracy >= 70) return 'Developing';
    return 'Beginner';
  };

  const masteryTextClass = (color: string) => {
    switch (color) {
      case 'jungle-green':
        return 'text-jungle-green-600 dark:text-jungle-green-300';
      case 'mint':
        return 'text-jungle-green-500 dark:text-jungle-green-400';
      case 'amber':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-8 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Your Progress</h2>
            <p className="text-slate-600 dark:text-slate-400">Coach Jakie's Performance Analytics</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 text-center">
              <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">Overall Accuracy</p>
              <p className="text-3xl font-bold text-primary">{stats.avgAccuracy.toFixed(1)}%</p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 text-center">
              <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">Total Sessions</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalSessions}</p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 text-center">
              <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">Recall Accuracy</p>
              <p className="text-3xl font-bold text-jungle-green-600 dark:text-jungle-green-400">{stats.recallAccuracy.toFixed(1)}%</p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 text-center">
              <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">Sidelines Faced</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.totalDeviations}</p>
            </div>
          </div>

          {/* Mastery Distribution */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mastery Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-jungle-green-50 dark:bg-jungle-green-900/20 rounded-lg p-4 border border-jungle-green-200 dark:border-jungle-green-800">
                <p className="text-sm font-semibold text-jungle-green-900 dark:text-jungle-green-200">Mastered</p>
                <p className="text-2xl font-bold text-jungle-green-700 dark:text-jungle-green-400">{stats.masteredCount}</p>
              </div>
              <div className="bg-jungle-green-50/70 dark:bg-jungle-green-900/10 rounded-lg p-4 border border-jungle-green-200/70 dark:border-jungle-green-800/70">
                <p className="text-sm font-semibold text-jungle-green-800 dark:text-jungle-green-200">Proficient</p>
                <p className="text-2xl font-bold text-jungle-green-600 dark:text-jungle-green-300">{stats.proficientCount}</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">Developing</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.developingCount}</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 border border-slate-300 dark:border-slate-600">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-300">Beginner</p>
                <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">{stats.beginnerCount}</p>
              </div>
            </div>
          </div>

          {/* Opening/Variation Mastery Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Opening Performance</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Array.from(performances.entries()).map(([variationId, perf]) => {
                const color = getMasteryColor(perf.accuracy || 0);
                const label = getMasteryLabel(perf.accuracy || 0);
                return (
                  <div key={variationId} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{variationId}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{perf.attempts || 1} sessions</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${masteryTextClass(color)}`}>
                        {perf.accuracy?.toFixed(0) || 0}%
                      </p>
                      <p className={`text-xs ${masteryTextClass(color)}`}>{label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Concept Performance Heatmap */}
          {conceptDiagnostics && conceptDiagnostics.size > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Chess Concept Mastery</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {CHESS_CONCEPTS.map((concept) => {
                  const conceptData = conceptDiagnostics.get(concept);
                  const accuracy = conceptData?.masteryRate || 0;
                  const attempts = conceptData?.attempts || 0;
                  
                  let bgColor = 'bg-slate-100 dark:bg-slate-700';
                  let textColor = 'text-slate-600 dark:text-slate-400';
                  let barColor = 'bg-slate-400';
                  
                  if (attempts > 0) {
                      if (accuracy >= 95) {
                      bgColor = 'bg-jungle-green-50 dark:bg-jungle-green-900/20';
                      textColor = 'text-jungle-green-900 dark:text-jungle-green-200';
                      barColor = 'bg-jungle-green-500';
                    } else if (accuracy >= 85) {
                      bgColor = 'bg-jungle-green-50/70 dark:bg-jungle-green-900/10';
                      textColor = 'text-jungle-green-800 dark:text-jungle-green-200';
                      barColor = 'bg-jungle-green-500';
                    } else if (accuracy >= 70) {
                      bgColor = 'bg-amber-50 dark:bg-amber-900/20';
                      textColor = 'text-amber-900 dark:text-amber-300';
                      barColor = 'bg-amber-500';
                    } else if (accuracy > 0) {
                      bgColor = 'bg-red-50 dark:bg-red-900/20';
                      textColor = 'text-red-900 dark:text-red-300';
                      barColor = 'bg-red-500';
                    }
                  }
                  
                  return (
                    <div key={concept} className={`${bgColor} rounded-lg p-3`}>
                      <p className={`text-xs font-semibold ${textColor} mb-2 truncate`}>
                        {concept.replace(/-/g, ' ')}
                      </p>
                      {attempts > 0 ? (
                        <>
                          <div className="w-full bg-slate-300 dark:bg-slate-600 rounded-full h-2 mb-1">
                            <div
                              className={`${barColor} h-2 rounded-full transition-all`}
                              style={{ width: `${Math.min(accuracy, 100)}%` }}
                            />
                          </div>
                          <p className={`text-xs font-bold ${textColor}`}>{accuracy.toFixed(0)}%</p>
                        </>
                      ) : (
                        <p className={`text-xs ${textColor}`}>Not practiced</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recall History Analytics */}
          {recallHistory && recallHistory.size > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recall Training History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-jungle-green-50/70 dark:bg-jungle-green-900/10 rounded-lg p-4 border border-jungle-green-200/60 dark:border-jungle-green-800/60">
                  <p className="text-sm font-semibold text-jungle-green-800 dark:text-jungle-green-200 mb-3">Recent Sessions</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Array.from(recallHistory.entries())
                      .sort(([, a], [, b]) => new Date(b.lastAttemptDate).getTime() - new Date(a.lastAttemptDate).getTime())
                      .slice(0, 5)
                      .map(([nodeId, history]) => {
                        const accuracy = history.attempts > 0 ? (history.correctAttempts / history.attempts) * 100 : 0;
                        return (
                          <div key={nodeId} className="text-sm">
                            <p className="font-semibold text-jungle-green-800 dark:text-jungle-green-200 text-xs truncate">{nodeId}</p>
                            <div className="flex justify-between items-center text-xs text-jungle-green-700 dark:text-jungle-green-300 mt-1">
                              <span>{accuracy.toFixed(0)}% accuracy</span>
                              <span className="text-[10px]">{history.attempts} attempts</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="bg-jungle-green-50/70 dark:bg-jungle-green-900/10 rounded-lg p-4 border border-jungle-green-200/60 dark:border-jungle-green-800/60">
                  <p className="text-sm font-semibold text-jungle-green-800 dark:text-jungle-green-200 mb-3">Stats</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-jungle-green-700 dark:text-jungle-green-300 mb-1">Total Sessions</p>
                      <p className="text-2xl font-bold text-jungle-green-600 dark:text-jungle-green-300">{stats.totalRecallSessions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-jungle-green-700 dark:text-jungle-green-300 mb-1">Overall Accuracy</p>
                      <p className="text-2xl font-bold text-jungle-green-600 dark:text-jungle-green-300">{stats.recallAccuracy.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Deviation Exposure */}
          {deviationHistory && deviationHistory.size > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sideline Exposure</h3>
              <div className="space-y-3">
                {Array.from(deviationHistory.entries())
                  .flatMap(([variationId, deviations]) =>
                    Array.from(deviations.values()).map(d => ({ ...d, variationId }))
                  )
                  .sort((a, b) => b.frequency - a.frequency)
                  .slice(0, 10)
                  .map((deviation, idx) => (
                    <div key={idx} className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                            Move {deviation.moveIndex}: {deviation.playerMove}
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-400">vs {deviation.mainlineMove}</p>
                        </div>
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{deviation.frequency}x faced</span>
                      </div>
                      <div className="w-full bg-amber-200 dark:bg-amber-700 rounded-full h-1.5">
                        <div
                          className="bg-amber-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min((deviation.frequency / 10) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {performances.size === 0 && !conceptDiagnostics?.size && !recallHistory?.size && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block text-slate-300 dark:text-slate-600">📊</span>
              <p className="text-slate-600 dark:text-slate-400">Start training to see your progress analytics!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-8 bg-slate-50 dark:bg-slate-700/50">
          <button
            onClick={onClose}
            className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
