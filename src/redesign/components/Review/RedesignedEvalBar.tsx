'use client';

import React, { useMemo } from 'react';
import { StableEval } from '@/lib/analysis-utils';

interface RedesignedEvalBarProps {
    evaluation: number;
    orientation?: 'white' | 'black';
    isMate?: boolean;
    isTablebase?: boolean;
    tablebaseText?: string;
    stableEval?: StableEval;
}

export function RedesignedEvalBar({ 
    evaluation, 
    orientation = 'white', 
    stableEval 
}: RedesignedEvalBarProps) {
    
    // Non-linear mapping (StableEval or tanh)
    const whitePercentage = useMemo(() => {
        // Priority: Stable Eval (State Machine)
        if (stableEval) {
             // uiValue is [-1, 1]. White Winning (+1) -> 100%
             return (stableEval.uiValue + 1) * 50;
        }

        // If it's a mate score (very high eval), force to edges
        if (Math.abs(evaluation) > 5000) {
            return evaluation > 0 ? 100 : 0;
        }
        
        // Tanh mapping for standard play
        const sigmoid = Math.tanh(evaluation / 400); 
        // Convert -1..1 range to percentage 0..100
        return (sigmoid + 1) * 50;
    }, [evaluation, stableEval]);

    const displayPercentage = orientation === 'white' ? whitePercentage : 100 - whitePercentage;

    const scoreText = useMemo(() => {
        if (Math.abs(evaluation) > 8000) {
            const movesToMate = Math.ceil((10000 - Math.abs(evaluation)) / 10);
            return `M${movesToMate}`;
        }
        const pawns = evaluation / 100;
        if (Math.abs(pawns) < 0.05) return '0.0';
        return `${pawns > 0 ? '+' : ''}${pawns.toFixed(1)}`;
    }, [evaluation]);

    return (
        <div className="w-8 h-full bg-[#101622] rounded-full overflow-hidden relative flex flex-col border border-white/5 shadow-2xl">
            <div className="absolute inset-0 flex flex-col transition-all duration-700 ease-out">
                {/* Black Portion (Top if orientation is White) */}
                <div 
                    className="bg-[#101622] w-full transition-all duration-700 ease-out relative"
                    style={{ height: `${100 - displayPercentage}%` }}
                >
                    {displayPercentage < 15 && (
                         <span className="absolute bottom-2 left-0 right-0 text-[10px] font-black text-white text-center tracking-tighter">
                            {scoreText}
                         </span>
                    )}
                </div>
                
                {/* White Portion (Bottom if orientation is White) */}
                <div 
                    className="bg-white w-full flex-1 transition-all duration-700 ease-out relative"
                >
                    {displayPercentage >= 15 && (
                        <span className="absolute top-2 left-0 right-0 text-[10px] font-black text-zinc-900 text-center tracking-tighter">
                            {scoreText}
                        </span>
                    )}
                </div>
            </div>
            
            {/* Center marker */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 z-10" />
            
            {/* Glass effect shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
        </div>
    );
}
