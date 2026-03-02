'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { EngineConfig } from '@/components/Review/EngineSettings';

export interface EngineLine {
    pv: number;     // Line number (1 = best, 2 = second best, etc.)
    depth: number;
    score: number;  // Centipawns
    isMate: boolean;
    mateIn: number | null;
    moves: string[]; // PV moves in UCI format (parsed)
    bestMove: string; // First move of PV
    rawPv: string;   // Raw PV string from engine for direct parsing
}

interface UseLiveAnalysisOptions {
    fen: string;
    config: EngineConfig;
    enabled?: boolean;
}

interface UseLiveAnalysisResult {
    lines: EngineLine[];
    isAnalyzing: boolean;
    currentDepth: number;
    startAnalysis: () => void;
    stopAnalysis: () => void;
    analyzedFen: string | null; // The FEN that the current lines belong to
}

export function useLiveAnalysis({ fen, config, enabled = true }: UseLiveAnalysisOptions): UseLiveAnalysisResult {
    const [lines, setLines] = useState<EngineLine[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentDepth, setCurrentDepth] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const [analyzedFen, setAnalyzedFen] = useState<string | null>(null);
    
    const workerRef = useRef<Worker | null>(null);
    const currentFenRef = useRef<string>(fen);
    const messageHandlerRef = useRef<((e: MessageEvent) => void) | null>(null);

    const stopAnalysis = useCallback(() => {
        if (workerRef.current) {
            workerRef.current.postMessage('stop');
        }
        setIsAnalyzing(false);
    }, []);

    const startAnalysis = useCallback(() => {
        if (!workerRef.current || !enabled || !isReady) {
            console.log('Cannot start analysis:', { worker: !!workerRef.current, enabled, isReady });
            return;
        }

        // Stop any current analysis
        stopAnalysis();
        setIsAnalyzing(true);
        setCurrentDepth(0);
        setLines([]);
        setAnalyzedFen(fen); // Track the FEN being analyzed

        const linesMap = new Map<number, EngineLine>();

        // Remove old listener if exists
        if (messageHandlerRef.current) {
            workerRef.current.removeEventListener('message', messageHandlerRef.current);
        }

        const handleMessage = (e: MessageEvent) => {
            const line = e.data as string;
            // console.log('Engine:', line); // Uncomment for full debug

            if (line.startsWith('info') && line.includes('depth') && line.includes(' pv ')) {
                // Parse depth
                const depthMatch = line.match(/depth (\d+)/);
                const depth = depthMatch ? parseInt(depthMatch[1]) : 0;
                
                // Parse multipv (which line this is)
                const pvMatch = line.match(/multipv (\d+)/);
                const pv = pvMatch ? parseInt(pvMatch[1]) : 1;
                
                // Only process lines within our multiPV range
                if (pv > config.multiPV) return;

                // Parse score
                let score = 0;
                let isMate = false;
                let mateIn: number | null = null;
                
                const cpMatch = line.match(/score cp (-?\d+)/);
                const mateMatch = line.match(/score mate (-?\d+)/);
                
                if (mateMatch) {
                    mateIn = parseInt(mateMatch[1]);
                    isMate = true;
                    score = mateIn > 0 ? 10000 + mateIn : -(10000 + Math.abs(mateIn));
                } else if (cpMatch) {
                    score = parseInt(cpMatch[1]);
                }

                // Parse PV moves
                const pvIndex = line.indexOf(' pv ');
                const rawPvString = pvIndex >= 0 ? line.slice(pvIndex + 4).trim() : '';
                const moves = rawPvString.split(' ');
                const bestMove = moves[0] || '';

                if (depth > 0 && bestMove && bestMove.length >= 4) {
                    linesMap.set(pv, {
                        pv,
                        depth,
                        score,
                        isMate,
                        mateIn,
                        moves,
                        bestMove,
                        rawPv: rawPvString // Use pre-calculated value for consistency
                    });

                    // Update state with sorted lines
                    const sortedLines = Array.from(linesMap.values())
                        .sort((a, b) => a.pv - b.pv);
                    
                    setLines(sortedLines);
                    setCurrentDepth(Math.max(...sortedLines.map(l => l.depth)));
                }
            } else if (line.startsWith('bestmove')) {
                setIsAnalyzing(false);
            }
        };

        const handleError = (e: ErrorEvent) => {
            console.error('Stockfish Worker Error:', e.message);
        };

        messageHandlerRef.current = handleMessage;
        workerRef.current.addEventListener('message', handleMessage);
        workerRef.current.addEventListener('error', handleError);

        // Configure engine - send commands with small delays to prevent WASM crashes
        try {
            workerRef.current.postMessage(`setoption name MultiPV value ${config.multiPV}`);
            workerRef.current.postMessage(`setoption name Threads value ${config.threads}`);
            workerRef.current.postMessage(`setoption name Hash value ${config.hash}`);
            
            // Small delay before starting analysis
            setTimeout(() => {
                if (workerRef.current) {
                    workerRef.current.postMessage('isready');
                    workerRef.current.postMessage(`position fen ${fen}`);
                    workerRef.current.postMessage(`go depth ${config.depth} movetime ${config.searchTime * 1000}`);
                }
            }, 50);
            
            // Stabilization timeout: Stop analysis after 45 seconds to conserve resources
            setTimeout(() => {
                console.log('[Engine] 45s stabilization timeout reached, stopping analysis');
                stopAnalysis();
            }, 45000);
            
        } catch (e) {
            console.error('Error sending commands to Stockfish:', e);
            setIsAnalyzing(false);
        }

    }, [fen, config, enabled, isReady, stopAnalysis]);

    // Initialize Stockfish worker
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const worker = new Worker('/stockfish.js');
        workerRef.current = worker;

        const initHandler = (e: MessageEvent) => {
            const msg = e.data as string;
            if (msg === 'uciok') {
                console.log('Stockfish ready');
                setIsReady(true);
            }
        };

        worker.addEventListener('message', initHandler);
        worker.postMessage('uci');

        return () => {
            stopAnalysis();
            worker.removeEventListener('message', initHandler);
            worker.terminate();
            workerRef.current = null;
            setIsReady(false);
        };
    }, [stopAnalysis]);

    // Start analysis when ready and when FEN/config changes
    useEffect(() => {
        if (!enabled || !isReady) return;

        currentFenRef.current = fen;

        // Small debounce to avoid rapid restarts
        const timeout = setTimeout(() => {
            startAnalysis();
        }, 150);

        return () => clearTimeout(timeout);
    }, [fen, config, enabled, isReady, startAnalysis]);

    return {
        lines,
        isAnalyzing,
        currentDepth,
        startAnalysis,
        stopAnalysis,
        analyzedFen
    };
}

