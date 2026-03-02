import { useEffect, useState, useRef, useCallback } from 'react';
import { analyzePosition, registerMessageHandler, unregisterMessageHandler, getCachedEvaluation, stopSharedWorker } from '@/lib/stockfish-manager';

// --- CONFIGURATION ---
const MIN_DEPTH = 6; // Lowered for faster AI response
const MATE_SCORE = 10000;
const MAX_CP = 3000;  // Clamp centipawns
const UPDATE_INTERVAL = 250; // ms between UI updates
const SMOOTHING_FACTOR = 0.15; // Alpha for EMA

export function useStockfish(fen: string, enabled: boolean = true) {
    const [evaluation, setEvaluation] = useState<number>(0); // Stabilized Score
    const [bestLine, setBestLine] = useState<string>('');
    const [depth, setDepth] = useState<number>(0);
    const [debugLog, setDebugLog] = useState<string>('Ready');
    
    // Internal state refs to avoid closure staleness and render loops
    const handlerIdRef = useRef<string>('');
    const lastFenRef = useRef<string>('');
    
    // Smoothing refs
    const currentSmoothedRef = useRef<number>(0); // The value displayed
    const targetScoreRef = useRef<number>(0);     // The latest raw score from engine
    const lastUpdateRef = useRef<number>(0);      // For rate limiting
    
    useEffect(() => {
        if (!enabled || !fen) return;
        
        // --- 1. MOVE TRANSITION HANDLING ---
        // When FEN changes (new move), we DO NOT reset evaluation to 0.
        // We let the previous eval decay naturally.
        // However, we must flip perspective if the turn changed.
        const turn = fen.split(' ')[1];
        const previousTurn = lastFenRef.current ? lastFenRef.current.split(' ')[1] : '';
        
        if (lastFenRef.current && turn !== previousTurn) {
             // Invert score to match new perspective relative to "Advantage White"
             // Actually, 'evaluation' state is typically absolute (White advantage).
             // If our internal logic tracks "Side to move advantage", we'd flip.
             // But we are storing "White Advantage" (CP).
             // So we don't need to flip the stored value, just the valid target.
        }

        lastFenRef.current = fen;
        const handlerId = `eval-${Date.now()}`;
        handlerIdRef.current = handlerId;
        
        // Check cache first
        const cached = getCachedEvaluation(fen);
        if (cached && cached.depth >= MIN_DEPTH) {
            // Instant update if we have good cache
            setEvaluation(cached.eval);
            currentSmoothedRef.current = cached.eval;
            targetScoreRef.current = cached.eval;
            setDepth(cached.depth);
            setBestLine(cached.bestMove);
            setDebugLog(`Cache (Depth ${cached.depth})`);
            return;
        }

        const handler = (line: string) => {
            if (line.includes('readyok')) setDebugLog('Ready');

                // --- 2. RAW PARSING ---
                if (line.startsWith('info') && line.includes('score')) {
                    const depthMatch = line.match(/depth (\d+)/);
                    const currentDepth = depthMatch ? parseInt(depthMatch[1], 10) : 0;
                    setDepth(currentDepth);

                    // --- 3. DEPTH GATING ---
                    if (currentDepth < MIN_DEPTH) {
                        return; // Ignore shallow searches from bot or engine
                    }

                    // Regex for Score
                    const cpMatch = line.match(/score cp (-?\d+)/);
                    const mateMatch = line.match(/score mate (-?\d+)/);
                    const pvMatch = line.match(/ pv (.+)/);

                    let rawScore = 0;
                    const turnStr = fen.split(' ')[1];
                    const perspective = turnStr === 'w' ? 1 : -1;

                    // --- 4. MATE NORMALIZATION ---
                    if (mateMatch) {
                         // "score mate N"
                         // N > 0: White mates in N (if we are white) -> NO
                         // UCI Standard: score is relative to side to move.
                         // mate 1 -> Side to move gives mate in 1
                         // mate -1 -> Side to move gets mated in 1
                         
                        const mateIn = parseInt(mateMatch[1], 10);
                        
                        // Convert to large CP value
                        // mateIn > 0: Winning. Score = 10000 - N
                        // mateIn < 0: Losing. Score = -10000 - N (e.g. -10000 - (-1) = -9999)
                        
                        if (mateIn > 0) {
                            rawScore = MATE_SCORE - mateIn;
                        } else {
                            rawScore = -MATE_SCORE - mateIn;
                        }
                    } else if (cpMatch) {
                        rawScore = parseInt(cpMatch[1], 10);
                    } else {
                        return; // No score found
                    }

                    // Convert to Absolute (White) Perspective
                    const whiteScore = rawScore * perspective;
                    
                    // --- 5. CLAMPING ---
                    // Don't clamp mate scores, they need to be high!
                    // Only clamp CP scores? 
                    // No, the UI expects clamped values for CP, but Mate signals are distinct
                    // We need to pass the raw (but normalized) whiteScore to the state
                    // and let the UI handle the display range.
                    // Actually, for chart stability, we clamp CP but keep Mate huge.
                    
                    let finalEval = whiteScore;
                    if (!mateMatch) {
                        finalEval = Math.max(-MAX_CP, Math.min(MAX_CP, whiteScore));
                    }

                    // Update Target
                    targetScoreRef.current = finalEval;

                // PV Update
                if (pvMatch) setBestLine(pvMatch[1]);
                
                // --- 6. UPDATE RATE LIMITING & SMOOTHING ---
                const now = Date.now();
                if (now - lastUpdateRef.current > UPDATE_INTERVAL) {
                    // --- 7. TEMPORAL SMOOTHING (EMA) ---
                    const prev = currentSmoothedRef.current;
                    const target = targetScoreRef.current;
                    
                    // Apply EMA: new = prev + alpha * (target - prev)
                    const smoothed = prev + SMOOTHING_FACTOR * (target - prev);
                    
                    currentSmoothedRef.current = smoothed;
                    setEvaluation(smoothed);
                    setDebugLog(`Depth ${currentDepth} | Eval ${Math.round(smoothed)}`);
                    
                    lastUpdateRef.current = now;
                }
            }
            
            // Should we update on bestmove?
            // "bestmove" basically confirms the final result of the previous go command.
            // We can snap to the final result or just let the EMA converge?
            // Snapping might cause a jump. Let's just update target and let next tick handle it,
            // OR force a single update if the interval was long.
            if (line.startsWith('bestmove')) {
                 // Force final sync
                 const finalTarget = targetScoreRef.current;
                 // We can be a bit more aggressive here
                 const finalSmoothed = currentSmoothedRef.current + 0.5 * (finalTarget - currentSmoothedRef.current);
                 currentSmoothedRef.current = finalSmoothed;
                 setEvaluation(finalSmoothed);
            }
        };

        registerMessageHandler(handlerId, handler);

        // Start analysis
        analyzePosition(fen, {
            depth: 20, // Reduced from max to ensure quick feedback within reasonable depth
            multiPV: 1, 
            moveTime: undefined // Let it run to depth
        });

        return () => {
            unregisterMessageHandler(handlerId);
            // If the component unmounts or gets disabled, force the engine to stop its current search
            // This prevents background processing from starving new workers like Game Review's
            stopSharedWorker();
        };
    }, [fen, enabled]);

    // Timer implementation for smoothing when no engine events?
    // Stockfish outputs info lines very frequently (every few ms).
    // The rate limiter inside the handler is sufficient.

    return {
        evaluation, // Smooth Centipawns
        bestLine,
        depth,
        debugLog,
        // Legacy props for compatibility
        mate: Math.abs(evaluation) > (MATE_SCORE - 1000) ? Math.ceil((MATE_SCORE - Math.abs(evaluation)) / 10) * (evaluation > 0 ? 1 : -1) : null,
        bestMove: bestLine.split(' ')[0] || ''
    };
}
