'use client';

import React from 'react';

interface EvaluationBarProps {
  evaluation: number;
  isMate: boolean;
  orientation: 'white' | 'black';
}

export function EvaluationBar({ evaluation, isMate, orientation }: EvaluationBarProps) {
  // Clamp evaluation for display (-5 to +5 is usually the main visible range)
  const clampedEval = Math.max(-5, Math.min(5, evaluation));
  
  // Calculate percentage (0-100) where 50 is even
  // If orientation is black, flip the sense
  const basePercent = 50 - (clampedEval * 10);
  const percent = orientation === 'black' ? 100 - basePercent : basePercent;

  return (
    <div className="w-full h-full bg-zinc-900 relative overflow-hidden flex flex-col">
      {/* Black's Portion */}
      <div 
        className="bg-black transition-all duration-700 ease-out"
        style={{ height: `${percent}%` }}
      />
      
      {/* White's Portion */}
      <div 
        className="flex-1 bg-white transition-all duration-700 ease-out shadow-[0_0_20px_rgba(255,255,255,0.2)]"
      />

      {/* Zero Line */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-redesign-cyan/30 z-10" />
      
      {/* Evaluation Label */}
      <div className={`absolute left-0 w-full text-center z-20 pointer-events-none transition-all duration-700 ${percent > 50 ? 'bottom-2' : 'top-2'}`}>
         <span className={`text-xs font-black uppercase tracking-tighter ${percent > 50 ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {isMate ? 'Mate' : evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1)}
         </span>
      </div>
    </div>
  );
}
