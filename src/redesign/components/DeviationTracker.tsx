'use client';

import React, { useMemo } from 'react';
import { DeviationProfile, DeviationStats, suggestPriorityDeviation, getRecommendedIntensity } from '../lib/deviation-engine';

interface DeviationTrackerProps {
  deviationProfile: DeviationProfile;
  priorityDeviation?: { line: string; reason: string } | null;
  onFocusDeviation?: (line: string) => void;
}

export const DeviationTracker = ({
  deviationProfile,
  priorityDeviation,
  onFocusDeviation,
}: DeviationTrackerProps) => {
  const recommendedIntensity = useMemo(
    () => getRecommendedIntensity(deviationProfile),
    [deviationProfile]
  ) as 'warmup' | 'moderate' | 'deep';

  const intensityColor: Record<'warmup' | 'moderate' | 'deep', string> = {
    warmup: '#3b82f6',
    moderate: '#f59e0b',
    deep: '#ef4444',
  };

  const intensityLabel: Record<'warmup' | 'moderate' | 'deep', string> = {
    warmup: 'Light Training',
    moderate: 'Moderate Training',
    deep: 'Intensive Training Required',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Sideline Deviation Tracker</h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs text-gray-600 uppercase font-semibold">Total Deviations</p>
          <p className="text-3xl font-bold text-gray-800">{deviationProfile.totalDeviations}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs text-gray-600 uppercase font-semibold">Unique Points</p>
          <p className="text-3xl font-bold text-gray-800">{deviationProfile.uniqueDeviationPoints}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs text-gray-600 uppercase font-semibold">Training Intensity</p>
          <p
            className="text-lg font-bold"
            style={{ color: intensityColor[recommendedIntensity] }}
          >
            {intensityLabel[recommendedIntensity]}
          </p>
        </div>
      </div>

      {/* Priority Deviation Alert */}
      {priorityDeviation && (
        <div
          className="p-4 rounded border-l-4 mb-6"
          style={{
            backgroundColor: '#fff7ed',
            borderColor: '#f59e0b',
          }}
        >
          <h4 className="font-semibold text-gray-800 mb-2">Priority Focus</h4>
          <p className="text-sm text-gray-700 mb-3">
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">{priorityDeviation.line}</span>
          </p>
          <p className="text-sm text-gray-600 mb-3">{priorityDeviation.reason}</p>
          <button
            onClick={() => onFocusDeviation?.(priorityDeviation.line)}
            className="px-4 py-2 rounded text-white text-sm font-semibold transition"
            style={{ backgroundColor: '#f59e0b' }}
          >
            Train This Sideline
          </button>
        </div>
      )}

      {/* Vulnerable Lines */}
      {deviationProfile.vulnerableLines.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Vulnerable Lines (Most Frequent)</h4>
          <div className="space-y-2">
            {deviationProfile.vulnerableLines.map((line: string, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-red-50 rounded border border-red-200 flex justify-between items-center"
              >
                <span className="font-mono text-sm text-gray-800">{line}</span>
                <button
                  onClick={() => onFocusDeviation?.(line)}
                  className="px-3 py-1 rounded text-sm text-white transition"
                  style={{ backgroundColor: '#ef4444' }}
                >
                  Train
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strong Defenses */}
      {deviationProfile.strongDefenses.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Strong Defenses (Well Prepared)</h4>
          <div className="space-y-2">
            {deviationProfile.strongDefenses.map((line: string, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-green-50 rounded border border-green-200"
              >
                <span className="font-mono text-sm text-gray-800">✓ {line}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Deviations State */}
      {deviationProfile.totalDeviations === 0 && (
        <div className="p-6 text-center bg-gray-50 rounded border border-gray-200">
          <p className="text-gray-600">
            No sideline deviations tracked yet. Play training games to build deviation history.
          </p>
        </div>
      )}
    </div>
  );
};

export default DeviationTracker;
