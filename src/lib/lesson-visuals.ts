
import { CheckCircle, Gem } from 'lucide-react';
import { LessonContent } from './lesson-data';

interface BoardHighlightParams {
    lessonId: string;
    currentPage: LessonContent;
    remainingGoals: string[];
    clickedGoals: string[];
    dynamicLockedSquares: string[];
    visitedSquares: string[];
    activeHint: boolean;
}

export function getBoardHighlights({
    lessonId,
    currentPage,
    remainingGoals,
    clickedGoals,
    dynamicLockedSquares,
    visitedSquares,
    activeHint
}: BoardHighlightParams): Record<string, any> {
    
    // CONDITIONAL: Do NOT show Gem icon for 'Name the Square' mini-game (it spoils the answer!)
    const showGoalIcons = lessonId !== 'w1-minigame-squares';

    const baseSquares: Record<string, any> = {
        // Show remaining goals with pulsing gem icon (ONLY if enabled)
        ...(showGoalIcons ? remainingGoals.reduce((acc, sq) => ({ ...acc, [sq]: { icon: Gem, color: '#38bdf8', pulse: true } }), {}) : {}),
        // Show clicked goals with green checkmark
        ...clickedGoals.reduce((acc, sq) => ({ ...acc, [sq]: { icon: CheckCircle, color: '#22c55e', pulse: false, highlightColor: 'rgba(34, 197, 94, 0.4)' } }), {}),
        
        // Support for simple highlightSquares prop (Legacy/Simple format)
        ...(currentPage.highlightSquares || []).reduce((acc, sq) => ({ 
            ...acc, 
            [sq]: { 
                highlightColor: 'rgba(255, 255, 0, 0.4)', // Default yellow
            } 
        }), {}),
    };

    // NEW: Ghost out locked squares (e.g. Kings in Pawn Wars)
    if (dynamicLockedSquares) {
        dynamicLockedSquares.forEach(sq => {
                if (!baseSquares[sq]) baseSquares[sq] = {};
                baseSquares[sq].pieceOpacity = 0.5; // Visual indication of locking? 
                // Original code was 0 completely hidden? 
                // Checking previous file content: "baseSquares[sq].pieceOpacity = 0; // Completely hidden"
                // Let's stick to original behavior.
                baseSquares[sq].pieceOpacity = 0;
        });
    }

    // NEW: Apply hiddenPieces from lesson data (for dummy pieces to prevent draws)
    if (currentPage.hiddenPieces) {
        currentPage.hiddenPieces.forEach(h => {
            if (h.visible === false) {
                if (!baseSquares[h.square]) baseSquares[h.square] = {};
                baseSquares[h.square].pieceOpacity = 0;
            }
        });
    }
    
    // Apply hints
    if (activeHint && remainingGoals.length > 0) {
        remainingGoals.forEach(goalSq => {
            baseSquares[goalSq] = {
                ...baseSquares[goalSq],
                highlightColor: 'rgba(255, 255, 0, 0.5)', // Yellow highlight
                style: { 
                    boxShadow: 'inset 0 0 10px 4px rgba(255, 215, 0, 0.8)',
                    animation: 'pulse 1s infinite'
                }
            };
        });
    }

    // Apply custom highlights WITHOUT overwriting icon properties
    if (currentPage.customHighlights) {
        currentPage.customHighlights.forEach((highlight) => {
            highlight.squares.forEach((sq, index) => {
                const isLabelSquare = index === 0;
                baseSquares[sq] = {
                    ...baseSquares[sq], // Preserve existing icon/color/pulse
                    highlightColor: baseSquares[sq]?.highlightColor || highlight.color,
                    label: isLabelSquare ? highlight.label : undefined
                };
            });
        });
    }

    // Knight Tour Highlights
    if (lessonId === 'w4-knight-tour' && visitedSquares.length > 0) {
        visitedSquares.forEach(sq => {
            // Don't overwrite the current knight's square (last one) which might need standard highlight
            // Actually standard board handles last move highlight.
            // We want "visited" squares to look distinct.
            baseSquares[sq] = {
                ...baseSquares[sq],
                highlightColor: 'rgba(124, 58, 237, 0.5)', // Violet
                icon: CheckCircle, // Optional: verify if cluttered
                color: '#a78bfa'
            };
        });
    }
    
    return baseSquares;
}
