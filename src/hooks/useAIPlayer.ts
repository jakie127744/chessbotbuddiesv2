import { useEffect, useRef, useState } from 'react';

interface UseAIPlayerProps {
    fen: string;
    bestMove: string;
    isVsComputer: boolean;
    userColor: 'w' | 'b';
    onMove: (move: { from: string; to: string; promotion?: string }) => boolean; // Returns true if move succeeded
    aiLevel: number; // 1-20 for Stockfish skill level
}

export function useAIPlayer({
    fen,
    bestMove,
    isVsComputer,
    userColor,
    onMove,
    aiLevel
}: UseAIPlayerProps) {
    const [isThinking, setIsThinking] = useState(false);
    const lastProcessedFenRef = useRef<string>('');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const onMoveRef = useRef(onMove);
    const bestMoveRef = useRef(bestMove);

    // Keep refs up to date
    useEffect(() => {
        onMoveRef.current = onMove;
    }, [onMove]);

    useEffect(() => {
        bestMoveRef.current = bestMove;
    }, [bestMove]);

    useEffect(() => {
        // Clear any pending move
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // Check if it's AI's turn
        if (!fen) return; // Safety check

        const computerColor = userColor === 'w' ? 'b' : 'w';
        const currentTurn = fen.split(' ')[1];

        if (!isVsComputer || currentTurn !== computerColor || !bestMove) {
            setIsThinking(false);
            return;
        }

        // Don't process the same position twice
        if (lastProcessedFenRef.current === fen) {
            return;
        }

        lastProcessedFenRef.current = fen;
        setIsThinking(true);

        // Calculate human-like delay based on AI level
        // Lower levels think longer to seem more "human"
        const baseDelay = 500;
        const randomDelay = Math.random() * 1000;
        const levelDelay = (20 - aiLevel) * 50; // Lower levels = longer delay
        const totalDelay = baseDelay + randomDelay + levelDelay;

        console.log('[AI] Thinking... will move in', totalDelay, 'ms');

        timeoutRef.current = setTimeout(() => {
            // Use current bestMove from ref
            const currentBestMove = bestMoveRef.current;

            if (!currentBestMove) {
                console.log('[AI] No bestMove available');
                setIsThinking(false);
                return;
            }

            // Parse and execute the move
            const from = currentBestMove.substring(0, 2);
            const to = currentBestMove.substring(2, 4);
            const promotion = currentBestMove.length > 4 ? currentBestMove.substring(4, 5) : undefined;

            console.log('[AI] Making move:', { from, to, promotion });
            const success = onMoveRef.current({ from, to, promotion });

            if (!success) {
                console.log('[AI] Stockfish move failed, trying fallback moves');
                const fallbackMoves = [
                    { from: 'e7', to: 'e5' }, { from: 'e7', to: 'e6' },
                    { from: 'd7', to: 'd5' }, { from: 'd7', to: 'd6' },
                    { from: 'c7', to: 'c5' }, { from: 'c7', to: 'c6' },
                    { from: 'g8', to: 'f6' }, { from: 'b8', to: 'c6' },
                ];

                for (const fallbackMove of fallbackMoves) {
                    if (onMoveRef.current(fallbackMove)) {
                        console.log('[AI] Fallback succeeded:', fallbackMove);
                        break;
                    }
                }
            }
            setIsThinking(false);
        }, totalDelay);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [fen, isVsComputer, userColor, aiLevel]); // Removed bestMove - it updates too frequently and cancels timeout

    return { isThinking };
}
