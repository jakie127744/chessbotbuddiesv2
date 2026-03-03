'use client';

import { useMemo } from 'react';
import { StableEval } from '@/lib/analysis-utils';

interface EvaluationBarProps {
  evaluation: number; // Centipawns. Positive = White advantage.
  orientation?: 'white' | 'black';
  isMate?: boolean; // If true, evaluation is moves to mate (positive = white mates)
  isTablebase?: boolean; // If true, this is a tablebase position
  tablebaseText?: string; // Display text for tablebase (e.g., "TB Win", "TB+15")
  stableEval?: StableEval; // New: Stable Eval Object
}

export function EvaluationBar({
  evaluation,
  orientation = 'white',
  isMate = false,
  isTablebase = false,
  tablebaseText,
  stableEval
}: EvaluationBarProps) {

  const overBarHeight = useMemo(() => {
    if (stableEval) {
      return 50 - (stableEval.uiValue * 50);
    }

    if (Math.abs(evaluation) > 5000) {
      return evaluation > 0 ? 0 : 100;
    }

    const sigmoid = Math.tanh(evaluation / 400);
    return 50 - (sigmoid * 50);
  }, [evaluation, stableEval]);

  const scoreText = useMemo(() => {
    if (isTablebase && tablebaseText) return tablebaseText;

    if (isMate || Math.abs(evaluation) > 8000) {
      const movesToMate = Math.ceil((10000 - Math.abs(evaluation)) / 10);
      return `M${movesToMate}`;
    }

    const pawns = evaluation / 100;
    if (Math.abs(pawns) < 0.05) return '0.0';
    return `${pawns > 0 ? '+' : ''}${pawns.toFixed(1)}`;
  }, [evaluation, isTablebase, tablebaseText, isMate]);

  const textColor = overBarHeight > 50 ? '#fff' : '#000';
  const textPositionStyle = overBarHeight > 50 ? { top: '5px' } : { bottom: '5px' };
  const displayFlipped = orientation === 'black';

  return (
    <div
      className="relative w-full h-full min-w-[12px] rounded-md overflow-hidden"
      style={{ backgroundColor: displayFlipped ? '#0c0c0c' : '#fff' }}
    >
      <div
        className="w-full transition-[height] duration-300 ease-out"
        style={{
          backgroundColor: displayFlipped ? '#fff' : '#0c0c0c',
          height: displayFlipped
            ? `calc(100% - ${overBarHeight}%)`
            : `${overBarHeight}%`
        }}
      />

      <div
        className="absolute left-0 right-0 text-[10px] font-black text-center select-none"
        style={{ color: textColor, ...textPositionStyle }}
      >
        {scoreText}
      </div>
    </div>
  );
}
