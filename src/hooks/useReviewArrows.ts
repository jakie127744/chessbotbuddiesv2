import { useMemo } from 'react';
import { BoardArrow } from '@/components/ChessBoard';
import { AnalyzedMove } from '@/lib/analysis-utils';
import { EngineConfig } from '@/components/Review/EngineSettings';
import { Chess } from 'chess.js';

export interface ArrowProps {
    currentMoveIndex: number;
    analyzedMoves: AnalyzedMove[];
    engineConfig: EngineConfig;
    game: Chess; // Current position game instance
}

export function useMissedBestMoveArrow({ currentMoveIndex, analyzedMoves, engineConfig, game }: ArrowProps): BoardArrow[] {
    return useMemo(() => {
        if (!engineConfig.showArrows || currentMoveIndex < 0) return [];
        if (!game) return [];

        const moveData = analyzedMoves[currentMoveIndex];
        if (!moveData || !moveData.bestMove) return [];

        // 1. Classification Check
        // Only show missed best move if the played move was not the best
        const isGoodEnough = ['Best', 'Great', 'Brilliant'].includes(moveData.classification);
        if (isGoodEnough) return [];

        // 2. Format & Legality Validation
        const uci = moveData.bestMove;
        if (uci.length < 4) return [];

        const from = uci.slice(0, 2);
        const to = uci.slice(2, 4);
        const promotion = uci.length > 4 ? uci[4] : undefined;

        // Verify if this move is legal on the current board
        try {
            // We clone the game logic to avoid side effects (mutating the passed game object)
            // But checking legality is cheaper: game.moves({ verbose: true })
            // However, straightforward move validation:
            const tempGame = new Chess(game.fen());
            
            // chess.js move() object format
            const moveResult = tempGame.move({
                from,
                to,
                promotion: promotion || 'q' // Auto-promote to Queen for validation if missing, or exact if present
            });

            // If move is invalid (returns null), do not show arrow
            if (!moveResult) {
                console.warn(`[ReviewArrows] Invalid bestMove suggested: ${uci} for FEN: ${game.fen()}`);
                return [];
            }
        } catch (e) {
            return [];
        }

        return [{
            from,
            to,
            color: '#22c55e', // Green for "You should have played this"
            opacity: 0.6
        }];
    }, [currentMoveIndex, analyzedMoves, engineConfig.showArrows, game]); // Dependency on 'game' (which changes on move)
}
