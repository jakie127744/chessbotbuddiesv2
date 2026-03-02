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

// Math.clamp not available in all environments
function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * WintrChess-style EvaluationBar
 * Uses simple linear formula: 50 - (centipawns / 20), clamped 5-95%
 * Also supports tablebase positions with TB Win/Draw/Loss display
 */
export function EvaluationBar({ 
    evaluation, 
    orientation = 'white', 
    isMate = false,
    isTablebase = false,
    tablebaseText,
    stableEval
}: EvaluationBarProps) {
    
    // Non-linear mapping (StableEval or legacy Tanh)
    const overBarHeight = useMemo(() => {
        // Priority: Stable Eval (State Machine)
        if (stableEval) {
             // uiValue is [-1, 1].
             // White Winning (+1) -> 0% height (Top bar is small)
             // Black Winning (-1) -> 100% height (Top bar is full)
             // Equality (0) -> 50%
             return 50 - (stableEval.uiValue * 50);
        }

        // If it's a mate score (very high eval), force to edges
        if (Math.abs(evaluation) > 5000) {
            return evaluation > 0 ? 0 : 100;
        }
        
        // Tanh mapping for standard play
        const sigmoid = Math.tanh(evaluation / 400); 
        // Convert -1..1 range to percentage 100..0
        return 50 - (sigmoid * 50);
    }, [evaluation, stableEval]);

    // Score text
    const scoreText = useMemo(() => {
        if (isTablebase && tablebaseText) return tablebaseText;
        
        // Check for mate range
        if (Math.abs(evaluation) > 8000) {
            const movesToMate = Math.ceil((10000 - Math.abs(evaluation)) / 10);
            return `M${movesToMate}`;
        }
        
        const pawns = evaluation / 100;
        if (Math.abs(pawns) < 0.05) return '0.0';
        return `${pawns > 0 ? '+' : ''}${pawns.toFixed(1)}`;
    }, [evaluation, isTablebase, tablebaseText]);

    // Text position logic
    // White text on Black background (top) vs Black text on White background (bottom)
    // If overBarHeight is large (Black is winning), the black bar takes up most space.
    // If Black is winning (eval < 0), overBarHeight > 50.
    // We want text to be visible.
    
    // Standard approach:
    // If orientation White (White at bottom), text is usually at bottom unless bar is very low.
    const isWhiteWinning = evaluation > 0;
    const isFlipped = orientation === 'black';

    // Text color logic
    // If black bar covers > 50%, text should be white (on black) or black (on white)?
    const textColor = overBarHeight > 50 ? '#fff' : '#000';
    const textPositionStyle = overBarHeight > 50 ? { top: '5px' } : { bottom: '5px' };

    // When flipped (black orientation), we swap the visual
    const displayFlipped = orientation === 'black';

    return (
        <div 
            className="relative w-full h-full min-w-[12px] rounded-md overflow-hidden"
            style={{ 
                backgroundColor: displayFlipped ? '#0c0c0c' : '#fff' 
            }}
        >
            {/* OverBar - the contrasting bar that grows/shrinks */}
            <div
                className="w-full transition-[height] duration-300 ease-out"
                style={{
                    backgroundColor: displayFlipped ? '#fff' : '#0c0c0c',
                    height: displayFlipped 
                        ? `calc(100% - ${overBarHeight}%)`
                        : `${overBarHeight}%`
                }}
            />
        </div>
    );
}
