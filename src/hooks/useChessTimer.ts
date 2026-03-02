import { useState, useEffect, useCallback, useRef } from 'react';
import { TimeControl } from '@/lib/game-config';

interface UseChessTimerProps {
    timeControl: TimeControl;
    onTimeout: (color: 'w' | 'b') => void;
    activeColor: 'w' | 'b'; // Now reactive to game state
}

export function useChessTimer({ timeControl, onTimeout, activeColor }: UseChessTimerProps) {
    const [whiteTime, setWhiteTime] = useState(timeControl.initial);
    const [blackTime, setBlackTime] = useState(timeControl.initial);
    const [isRunning, setIsRunning] = useState(false);
    const [delayRemaining, setDelayRemaining] = useState(0);

    const lastTickRef = useRef<number | null>(null);
    const onTimeoutRef = useRef(onTimeout);
    const prevColorRef = useRef<'w' | 'b'>(activeColor);

    // Keep onTimeout ref up to date
    useEffect(() => {
        onTimeoutRef.current = onTimeout;
    }, [onTimeout]);

    // Initialize/Reset state when timeControl changes
    useEffect(() => {
        setWhiteTime(timeControl.initial);
        setBlackTime(timeControl.initial);
        setDelayRemaining(timeControl.type === 'delay' ? timeControl.increment : 0);
        setIsRunning(false);
        prevColorRef.current = activeColor;
    }, [timeControl]); // Remove activeColor from dependency to correctly track resets vs turns

    // Turn Change Side Effects (Increment/Delay)
    useEffect(() => {
        if (activeColor !== prevColorRef.current) {
            // Turn just changed
            const previousPlayer = prevColorRef.current;
            
            // 1. Add Increment to the player who just finished their move
            if (timeControl.type === 'increment') {
                if (previousPlayer === 'w') setWhiteTime(t => t + timeControl.increment);
                else setBlackTime(t => t + timeControl.increment);
            }

            // 2. Reset Delay for the new player
            if (timeControl.type === 'delay') {
                setDelayRemaining(timeControl.increment);
            }

            prevColorRef.current = activeColor;
        }
    }, [activeColor, timeControl]);

    const start = useCallback(() => setIsRunning(true), []);
    const pause = useCallback(() => setIsRunning(false), []);

    // Timer Loop
    useEffect(() => {
        if (!isRunning || timeControl.initial === 0) {
            lastTickRef.current = null;
            return;
        }

        let animationFrameId: number;

        const tick = (timestamp: number) => {
            if (!lastTickRef.current) lastTickRef.current = timestamp;
            const delta = (timestamp - lastTickRef.current) / 1000;
            lastTickRef.current = timestamp;

            // Handle Delay
            if (timeControl.type === 'delay' && delayRemaining > 0) {
                setDelayRemaining(prev => Math.max(0, prev - delta));
            } else {
                // Handle Main Time using REACTIVE activeColor
                if (activeColor === 'w') {
                    setWhiteTime(prev => {
                        const next = prev - delta;
                        if (next <= 0) {
                            setIsRunning(false);
                            onTimeoutRef.current('b'); // Black wins
                            return 0;
                        }
                        return next;
                    });
                } else {
                    setBlackTime(prev => {
                        const next = prev - delta;
                        if (next <= 0) {
                            setIsRunning(false);
                            onTimeoutRef.current('w'); // White wins
                            return 0;
                        }
                        return next;
                    });
                }
            }

            animationFrameId = requestAnimationFrame(tick);
        };

        animationFrameId = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(animationFrameId);
            lastTickRef.current = null;
        };
    }, [isRunning, activeColor, timeControl, delayRemaining]);

    return {
        whiteTime,
        blackTime,
        delayRemaining,
        isRunning,
        start,
        pause,
        reset: (newTime?: number) => {
            const timeToUse = newTime !== undefined ? newTime : timeControl.initial;
            setWhiteTime(timeToUse);
            setBlackTime(timeToUse);
            setDelayRemaining(timeControl.type === 'delay' ? timeControl.increment : 0);
            setIsRunning(false);
            prevColorRef.current = 'w'; // Assume reset goes to white
        }
    };
}
