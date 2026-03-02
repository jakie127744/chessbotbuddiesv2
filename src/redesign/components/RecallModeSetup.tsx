'use client';

import React, { useState } from 'react';
import { selectRandomRecallNode, filterRecallNodesByDifficulty, RecallNode } from '../lib/recall-mode-logic';

interface RecallModeSetupProps {
  variationNodes: Array<{
    moves: string[];
    explanations?: Record<number, string>;
    variations?: any[];
  }>;
  openingName: string;
  onStartRecall: (node: RecallNode, difficulty: 'easy' | 'medium' | 'hard') => void;
  onCancel: () => void;
}

export const RecallModeSetup = ({
  variationNodes,
  openingName,
  onStartRecall,
  onCancel,
}: RecallModeSetupProps) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startRecall = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Select random node
      const selectedNode = selectRandomRecallNode(variationNodes, openingName, 2);

      if (!selectedNode) {
        setError('Not enough positions available for recall. Try a longer variation.');
        setIsLoading(false);
        return;
      }

      // Could filter by difficulty if scaled to multiple nodes
      onStartRecall(selectedNode, difficulty);
    } catch (err) {
      setError('Error starting recall session. Please try again.');
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Blind Recall Training</h2>
        <p className="text-gray-600 mb-6">Test your memory without hints or assistance.</p>

        {/* Difficulty Selection */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Choose Difficulty</h3>
          <div className="space-y-2">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <label
                key={d}
                className="flex items-center gap-3 p-3 rounded border-2 cursor-pointer transition"
                style={{
                  borderColor: difficulty === d ? 'var(--color-jungle-green-500)' : '#e5e7eb',
                  backgroundColor: difficulty === d ? 'rgba(15, 118, 110, 0.06)' : '#ffffff',
                }}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={d}
                  checked={difficulty === d}
                  onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-gray-800 capitalize">{d}</p>
                  <p className="text-xs text-gray-600">
                    {d === 'easy' && 'First 3 moves'}
                    {d === 'medium' && 'Moves 3-8 in variation'}
                    {d === 'hard' && 'Deep variations (8+ moves)'}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-jungle-green-50 rounded border border-jungle-green-200 mb-6">
          <h4 className="font-semibold text-gray-800 text-sm mb-2">How it works:</h4>
          <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
            <li>You'll see a position from {openingName}</li>
            <li>Move history will be hidden</li>
            <li>Your response time is tracked</li>
            <li>Correct recall requires 90%+ accuracy</li>
          </ul>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 rounded border border-red-200 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={startRecall}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded text-white transition"
            style={{
              backgroundColor: 'var(--color-jungle-green-600)',
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Starting...' : 'Start Recall'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecallModeSetup;
