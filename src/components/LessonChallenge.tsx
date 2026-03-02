import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { ChessPuzzle } from '@/lib/types';
import { usePuzzleLogic } from '@/hooks/usePuzzleLogic';
import { ChessBoard } from './ChessBoard';
import { LessonContent } from '@/lib/lesson-data';
import { Chess } from 'chess.js';

interface LessonChallengeProps {
    content: LessonContent;
    onComplete: () => void;
    onFail: () => void;
    colorScheme: any;
    arePiecesDraggable?: boolean;
}

// Helper: Compare FEN piece placement only
function isGameFenSynced(currentFen: string, expectedFen: string): boolean {
    const currentPosition = currentFen.split(' ')[0];
    const expectedPosition = expectedFen.split(' ')[0];
    return currentPosition === expectedPosition;
}

// Helper: Validate solution path is playable
function validateSolutionPath(fen: string, solution: string[]): boolean {
    try {
        const tempGame = new Chess(fen);
        for (const move of solution) {
            const from = move.substring(0, 2);
            const to = move.substring(2, 4);
            const promotion = move.length > 4 ? move[4] : undefined;
            const result = tempGame.move({ from, to, promotion });
            if (!result) return false;
        }
        return true;
    } catch {
        return false;
    }
}

export function LessonChallenge({ content, onComplete, onFail, colorScheme, arePiecesDraggable = true }: LessonChallengeProps) {
    const [lastMoveTimestamp, setLastMoveTimestamp] = useState(0);

    // Enhanced puzzle data validation
    const puzzleData = useMemo<ChessPuzzle | null>(() => {
        if (!content.fen || !content.solution) {
            console.error("[LessonChallenge] Missing fen or solution", content);
            return null;
        }
        
        try {
            const tempGame = new Chess(content.fen);
            
            // Validate solution path
            if (!validateSolutionPath(content.fen, content.solution)) {
                console.error("[LessonChallenge] Invalid solution path", content.solution);
                return null;
            }
            
            return {
                id: `lesson-challenge`,
                fen: content.fen,
                moves: content.solution,
                rating: 0,
                theme: 'lesson' as any,
                playerColor: tempGame.turn(),
                description: content.text
            };
        } catch (e) {
            console.error("[LessonChallenge] Invalid FEN", e);
            return null;
        }
    }, [content]);

    const {
        game,
        validateMove,
        isComplete,
        isFailed,
        resetPuzzle,
        moveIndex
    } = usePuzzleLogic({
        puzzle: puzzleData,
        onPuzzleSolved: onComplete,
        onPuzzleFailed: onFail
    });

    // Reset when content changes
    useEffect(() => {
        if (puzzleData) {
            resetPuzzle();
        }
    }, [puzzleData, resetPuzzle]);

    // Validate move legality
    const validateMoveLegality = useCallback((currentFen: string, move: { from: string; to: string; promotion?: string }): boolean => {
        try {
            const temp = new Chess(currentFen);
            const result = temp.move(move);
            return !!result;
        } catch {
            return false;
        }
    }, []);

    // Handle move with all checks
    const handleMove = useCallback((move: { from: string; to: string; promotion?: string }): boolean => {
        if (!game || !puzzleData || isComplete || isFailed) return false;
        
        // Rate limiting (100ms between moves)
        const now = Date.now();
        if (now - lastMoveTimestamp < 100) return false;
        setLastMoveTimestamp(now);

        // Check correct turn
        if (game.turn() !== puzzleData.playerColor) return false;

        // Check move is legal
        if (!validateMoveLegality(game.fen(), move)) return false;

        // Validate against solution
        return validateMove(move);
    }, [game, puzzleData, isComplete, isFailed, lastMoveTimestamp, validateMoveLegality, validateMove]);

    // Guard: Show error if no puzzle data
    if (!puzzleData) {
        return (
            <div className="w-full h-full flex items-center justify-center text-red-400">
                <div>Error loading challenge</div>
            </div>
        );
    }

    // Guard: Show loading if game isn't synced to content FEN
    if (!game || !content.fen || !isGameFenSynced(game.fen(), content.fen)) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <ChessBoard
            game={game}
            onMove={handleMove}
            orientation={content.orientation || (puzzleData.playerColor === 'w' ? 'white' : 'black')}
            colorScheme={colorScheme}
            arePiecesDraggable={arePiecesDraggable && !isComplete}
        />
    );
}
