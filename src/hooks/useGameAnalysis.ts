import { useState, useRef, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { AnalyzedMove, classifyMove, calculateAccuracy, normalizeEval, getMaterialCount, getTotalPieceCount, nextEvalState, StableEval } from '@/lib/analysis-utils';
import { loadOpeningLookup, getOpeningName, findDeepestOpening, fetchMasterStats } from '@/lib/opening-lookup';
import { getTacticEngine } from '@/lib/tactics';

interface UseGameAnalysisProps {
    game: Chess; // The finished game state
}

export function useGameAnalysis({ game }: UseGameAnalysisProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [analyzedMoves, setAnalyzedMoves] = useState<AnalyzedMove[]>([]);
    const [whiteAccuracy, setWhiteAccuracy] = useState(0);
    const [blackAccuracy, setBlackAccuracy] = useState(0);
    const [detectedOpening, setDetectedOpening] = useState<string | null>(null);

    const workerRef = useRef<Worker | null>(null);
    const isCancelledRef = useRef(false);

    const startAnalysis = useCallback(async () => {
        if (isAnalyzing || !game) return;
        setIsAnalyzing(true);
        // Reset state
        setAnalyzedMoves([]);
        setProgress(0);
        setWhiteAccuracy(0);
        setBlackAccuracy(0);
        setDetectedOpening(null);
        
        isCancelledRef.current = false;

        // Ensure opening book is loaded
        await loadOpeningLookup();

        // Detect opening immediately (deepest opening in history)
        const allFens = game.history({ verbose: true }).map(m => m.after);
        const name = findDeepestOpening(allFens);
        setDetectedOpening(name);

        // 1. Initialize Worker (Reliable, sequential handshake)
        if (workerRef.current) {
            workerRef.current.terminate();
        }
        
        try {
            workerRef.current = new Worker('/stockfish.js');
        } catch (err) {
            console.error('[useGameAnalysis] Failed to construct Worker:', err);
            setIsAnalyzing(false);
            return;
        }

        const worker = workerRef.current;
        console.log('[useGameAnalysis] Worker created:', worker);

        // Debug: Log all raw messages during initialization
        const initLogger = (e: MessageEvent) => console.log(`[useGameAnalysis] ENGINE RAW: ${e.data}`);
        worker.addEventListener('message', initLogger);

        worker.onerror = (e) => {
            console.error('[useGameAnalysis] Worker error event:', e);
        };

        const waitForMessage = (condition: (msg: string) => boolean, timeoutMs = 30000) => {
            return new Promise<void>((resolve, reject) => {
                const timer = setTimeout(() => {
                    worker.removeEventListener('message', handler);
                    reject(new Error(`Engine timeout after ${timeoutMs}ms waiting for condition`));
                }, timeoutMs);

                const handler = (e: MessageEvent) => {
                    const msg = e.data as string;
                    if (condition(msg)) {
                        clearTimeout(timer);
                        worker.removeEventListener('message', handler);
                        resolve();
                    }
                };
                worker.addEventListener('message', handler);
            });
        };

        try {
            console.log('[useGameAnalysis] Sending uci...');
            worker.postMessage('uci');
            await waitForMessage(msg => msg === 'uciok');
            console.log('[useGameAnalysis] uciok received');
            
            console.log('[useGameAnalysis] Sending initial settings...');
            // NOTE: WASM Stockfish typically requires 1 thread unless special headers are present.
            // Using 1 thread is much more stable for a general web environment.
            worker.postMessage('setoption name Threads value 1');
            worker.postMessage('setoption name Hash value 32');
            worker.postMessage('setoption name MultiPV value 3');

            console.log('[useGameAnalysis] Sending isready...');
            worker.postMessage('isready');
            await waitForMessage(msg => msg === 'readyok');
            console.log('[useGameAnalysis] readyok received');
            
            // Handshake done, stop verbose logging unless needed
            worker.removeEventListener('message', initLogger);
        } catch (e) {
            console.error('[useGameAnalysis] initialization phase failed:', e);
            worker.removeEventListener('message', initLogger);
            if (workerRef.current === worker) {
                worker.terminate();
                workerRef.current = null;
            }
            setIsAnalyzing(false);
            return;
        }

        // Replay game to get FENs
        const history = game.history({ verbose: true });
        
        // Get the actual starting FEN (from the first move's 'before' state, or default if no history)
        const startingFen = history.length > 0 ? history[0].before : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        const tempGame = new Chess(startingFen);
        const fens: { fen: string, move: any }[] = [];

        for (const move of history) {
            const fenBefore = tempGame.fen();
            const moveObj = { from: move.from, to: move.to, promotion: move.promotion } as const;
            const applied = tempGame.move(moveObj as any);
            if (!applied) {
                console.warn('[useGameAnalysis] Skipping illegal move while reconstructing history:', move.san);
                continue;
            }
            fens.push({ fen: fenBefore, move });
        }
        
        const results: AnalyzedMove[] = [];
        const totalMoves = fens.length;

        const analyzePosition = (fen: string): Promise<{ bestMove: string, lines: { score: number, pv: string[], isMate: boolean, mateIn: number | null }[] }> => {
            return new Promise((resolve) => {
                if (isCancelledRef.current || !workerRef.current) {
                     resolve({ bestMove: '', lines: [] });
                     return;
                }

                const linesMap = new Map<number, { score: number, pv: string[], isMate: boolean, mateIn: number | null }>();
                let resolved = false;
                const worker = workerRef.current as Worker;

                // Timeout after 20 seconds
                const timeout = setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        console.warn('[Stockfish] Analysis timeout for position:', fen);
                        worker.removeEventListener('message', handler);
                        const sortedLines = Array.from(linesMap.entries()).sort((a, b) => a[0] - b[0]).map(entry => entry[1]);
                        resolve({ bestMove: '', lines: sortedLines });
                    }
                }, 20000);

                const handler = (e: MessageEvent) => {
                    const line = e.data;
                    if (line.startsWith('bestmove')) {
                        if (!resolved) {
                            resolved = true;
                            clearTimeout(timeout);
                            const match = line.match(/bestmove (\S+)/);
                            const bestMove = match ? match[1] : '';
                            console.log(`[useGameAnalysis] Bestmove received for ${fen.substring(0, 15)}: ${bestMove}`);
                            worker.removeEventListener('message', handler);
                            const sortedLines = Array.from(linesMap.entries()).sort((a, b) => a[0] - b[0]).map(entry => entry[1]);
                            resolve({ bestMove, lines: sortedLines });
                        }
                    } else if (line.startsWith('info') && line.includes('score')) {
                        const mpvMatch = line.match(/multipv (\d+)/);
                        const mpv = mpvMatch ? parseInt(mpvMatch[1]) : 1;
                        
                        const cpMatch = line.match(/score cp (-?\d+)/);
                        const mateMatch = line.match(/score mate (-?\d+)/);
                        const pvMatch = line.match(/ pv (.*)/);

                        let lastEval = 0;
                        let isMate = false;
                        let mateIn: number | null = null;

                        if (mateMatch) {
                            const mate = parseInt(mateMatch[1]);
                            mateIn = Math.abs(mate);
                            isMate = true;
                            lastEval = mate > 0 ? (10000 - mateIn * 10) : -(10000 - mateIn * 10);
                        } else if (cpMatch) {
                            lastEval = parseInt(cpMatch[1]);
                        }
                        
                        let pv: string[] = [];
                        if (pvMatch) {
                             pv = pvMatch[1].trim().split(' ');
                        }

                        linesMap.set(mpv, { score: lastEval, isMate, mateIn, pv });
                    }
                };

                worker.addEventListener('message', handler);
                console.log(`[useGameAnalysis] Sending position/go for ${fen.substring(0, 15)}...`);
                worker.postMessage(`position fen ${fen}`);
                worker.postMessage('go depth 14');
            });
        };

        // Run Analysis Loop
        try {
            console.log(`[useGameAnalysis] Starting analysis loop for ${totalMoves} moves`);
            let lastStableEval: StableEval | null = null;
            const tacticEngine = getTacticEngine();

        for (let i = 0; i < totalMoves; i++) {
            if (isCancelledRef.current) break;

            const { fen, move } = fens[i];
            console.log(`[useGameAnalysis] Analyzing move ${i + 1}/${totalMoves}: ${move.san}`);

            // Check if move was forced (only 1 legal move available)
            // We need to check legal moves from the position *before* the move was made
            const tempForCheck = new Chess(fen);
            const legalMoves = tempForCheck.moves();
            const isForced = legalMoves.length === 1;

            // 1. Analyze position BEFORE the move to find the BEST move
            const beforeAnalysis = await analyzePosition(fen);
            const bestMove = beforeAnalysis.bestMove;
            const evalBeforeRaw = beforeAnalysis.lines.length > 0 ? beforeAnalysis.lines[0].score : 0;
            const bestMoveIsMate = beforeAnalysis.lines.length > 0 ? beforeAnalysis.lines[0].isMate : false;
            const bestMoveMateIn = beforeAnalysis.lines.length > 0 ? beforeAnalysis.lines[0].mateIn : null;

            // 2. Estimate evaluation of the played move
            let moveEvalRaw = evalBeforeRaw;
            let moveIsMate = bestMoveIsMate;
            let moveMateIn = bestMoveMateIn;
            const bestMoveEvalRaw = evalBeforeRaw;
            
            let afterMoveAnalysis: { bestMove: string, lines: { score: number, pv: string[], isMate: boolean, mateIn: number | null }[] } | undefined;
            
            // normalize bestMove to uci to compare
            const playedMoveUci = move.from + move.to + (move.promotion || '');

            // First check if the played move delivered checkmate (needed for tempCheck later)
            const tempCheck = new Chess(fen);
            const moveObj = { from: move.from, to: move.to, promotion: move.promotion } as const;
            const appliedMove = tempCheck.move(moveObj as any);
            if (!appliedMove) {
                console.warn('[useGameAnalysis] Unable to apply move in tempCheck:', move.san, 'from FEN', fen);
                continue;
            }
            const fenAfter = tempCheck.fen();

            // Check Book (using simple FEN lookup)
            const openingName = getOpeningName(fenAfter);
            const isBook = !!openingName;
            let masterStats = null;

            if (isBook) {
              masterStats = await fetchMasterStats(fenAfter);
              // Small delay to avoid hammering Lichess API too fast
              await new Promise(r => setTimeout(r, 50));
            }
            
            if (tempCheck.isCheckmate()) {
                // Checkmate! Set eval to cap value from mover's perspective
                moveEvalRaw = 10000;
                moveIsMate = true;
                moveMateIn = 0;
            } else {
                 // Always analyze position AFTER the move to support Sacrifice detection (needs Opponent Best Response)
                 // This adds an analysis step for "Best Moves" which was previously skipped, but needed for "Brilliant" heuristic.
                 const analysisResult = await analyzePosition(tempCheck.fen());
                 
                 // Eval(After) is from opponent's perspective.
                 // So MoveEval = -EvalAfter.
                 const afterTopLine = analysisResult.lines.length > 0 ? analysisResult.lines[0] : { score: 0, isMate: false, mateIn: null };
                 moveEvalRaw = -afterTopLine.score;
                 moveIsMate = afterTopLine.isMate;
                 moveMateIn = afterTopLine.mateIn;

                 afterMoveAnalysis = analysisResult;
            }

            const isBest = playedMoveUci === bestMove;

            // Normalization for Classification (White Perspective)
            const perspective = move.color === 'w' ? 1 : -1;
            
            const normalizeLineScore = (rawScore: number, isMateCheck: boolean, mIn: number | null | undefined, persps: number) => {
                const whiteEval = rawScore * persps;
                const signedMate = isMateCheck ? (rawScore > 0 ? (mIn || 1) : -(mIn || 1)) * persps : undefined;
                return normalizeEval(whiteEval, isMateCheck, signedMate);
            };

            const normEvalBest = normalizeLineScore(bestMoveEvalRaw, bestMoveIsMate, bestMoveMateIn, perspective);
            const normEvalPlayed = normalizeLineScore(moveEvalRaw, moveIsMate, moveMateIn, perspective);

            const normalizedBestLines = beforeAnalysis.lines.map(l => ({
                score: normalizeLineScore(l.score, l.isMate, l.mateIn, perspective),
                pv: l.pv
            }));
            
            // Opponent's perspective is -perspective
            const normalizedAfterLines = afterMoveAnalysis ? afterMoveAnalysis.lines.map(l => ({
                score: normalizeLineScore(l.score, l.isMate, l.mateIn, -perspective),
                pv: l.pv
            })) : [];

            // Recover signed mate for played move to pass into nextEvalState
            const signedMatePlayed = moveIsMate 
                ? (moveEvalRaw > 0 ? (moveMateIn || 1) : -(moveMateIn || 1)) * perspective
                : undefined;
            
            // --- STABLE EVALUATION STATE MACHINE ---
            // sideToMove is the side whose turn it is in the resulting position (Opponent of mover)
            const sideToMove = move.color === 'w' ? 'b' : 'w';
            
            const stableEval = nextEvalState(lastStableEval, {
                cp: normEvalPlayed,
                isMate: moveIsMate,
                mateIn: signedMatePlayed, // Signed relative to White (+White, -Black)
                sideToMove
            });
            lastStableEval = stableEval;
            

            // Sacrifice Detection + Material Tracking
            // We assume "Material" arguments for classifyMove are actually "Material Balance" (Player - Opponent)
            // This allows classifyMove to detect TRUE sacrifices (Balance decreases) vs TRADES (Balance stays same)
            let isSacrifice = false;
            let balanceBefore: number | undefined = undefined;
            let balanceAfterResponse: number | undefined = undefined;
            
            // Calculate Balance BEFORE move
            const myMatBefore = getMaterialCount(fen, move.color);
            const oppMatBefore = getMaterialCount(fen, move.color === 'w' ? 'b' : 'w');
            balanceBefore = myMatBefore - oppMatBefore;
            
            if (isBest || !bestMove) { // Only consider brilliant if it's the best move (or we don't know better)
                // My material AFTER opponent's BEST RESPONSE (looking deep into the PV)
                if (afterMoveAnalysis && afterMoveAnalysis.lines.length > 0) {
                     const topLine = afterMoveAnalysis.lines[0];
                     if (topLine.pv && topLine.pv.length > 0) {
                         const tempResponse = new Chess(fenAfter);
                         
                         // Play through the PV line to see if material drops at any point
                         for (const pvMoveUci of topLine.pv) {
                             try {
                                 // Convert UCI (e.g., e2e4) to a format chess.js move() accepts, or just pass it
                                 // chess.js move() accepts {from: 'e2', to: 'e4', promotion: 'q'}
                                 const match = pvMoveUci.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);
                                 if (!match) break; // Invalid UCI format in PV, stop checking
                                 
                                 const moveObj = { from: match[1], to: match[2], promotion: match[3] };
                                 const responseMove = tempResponse.move(moveObj as any);
                                 
                                 if (responseMove) {
                                     const currentFen = tempResponse.fen();
                                     const myMatTemp = getMaterialCount(currentFen, move.color);
                                     const oppMatTemp = getMaterialCount(currentFen, move.color === 'w' ? 'b' : 'w');
                                     const tempBalance = myMatTemp - oppMatTemp;
                                     
                                     // Store the immediate response balance for other heuristic use
                                     if (balanceAfterResponse === undefined) {
                                         balanceAfterResponse = tempBalance;
                                     }
                                 } else {
                                     break; // Illegal move in PV
                                 }
                             } catch (e) {
                                 break;
                             }
                         }
                         
                         // Check if it's a REAL sacrifice: 
                         // 1. Material balance dropped by >= 3 at SOME POINT in the PV.
                         // 2. Material balance at the END of the PV is still lower than the START.
                         // 3. This avoids "Trade" detection (e.g. B x N) which drops balance for 1 ply then recovers.
                         const finalFen = tempResponse.fen();
                         const myMatFinal = getMaterialCount(finalFen, move.color);
                         const oppMatFinal = getMaterialCount(finalFen, move.color === 'w' ? 'b' : 'w');
                         const finalBalance = myMatFinal - oppMatFinal;
                         
                         if (finalBalance <= balanceBefore - 1 && balanceAfterResponse !== undefined && balanceAfterResponse <= balanceBefore - 3) {
                             isSacrifice = true;
                         }
                     }
                }
            }

            // Classification
            const totalPieceCount = getTotalPieceCount(fen); // For endgame detection
            const { classification, perceptualLoss, winProbLoss } = classifyMove(
                normEvalBest, // Before (Best)
                normEvalPlayed, // After (Played)
                normalizedBestLines, // Best Baseline
                normalizedAfterLines,
                fenAfter,
                move.color,
                playedMoveUci === bestMove,
                isBook,
                isForced,
                isSacrifice,
                balanceBefore,
                balanceAfterResponse,
                totalPieceCount,
                playedMoveUci // Pass the UCI string for PV index matching
            );

            // Calculate CP Loss for stats (Raw difference of normalized values)
            let cpLoss = 0;
            if (move.color === 'w') cpLoss = Math.max(0, normEvalBest - normEvalPlayed);
            else cpLoss = Math.max(0, normEvalPlayed - normEvalBest);

            // Detect Tactics
            const mateScoreProp = (moveIsMate && moveMateIn !== null) ? (moveEvalRaw > 0 ? moveMateIn : -moveMateIn) : undefined;
            const tactics = tacticEngine.detectTactics(fen, fenAfter, move, i, mateScoreProp);

            results.push({
                moveNumber: i + 1,
                color: move.color,
                san: move.san,
                fen: fen,
                evaluation: normEvalPlayed,
                stableEval, // Store the stable evaluation
                bestMove: bestMove,
                classification,
                cpLoss,
                perceptualLoss,
                winProbLoss,
                isCapture: move.flags.includes('c') || move.flags.includes('e'), 
                isPromotion: move.flags.includes('p'),
                isCheck: move.san.includes('+') || move.san.includes('#'),
                isCastling: move.flags.includes('k') || move.flags.includes('q'),
                isSacrifice,
                isMate: moveIsMate,
                mateIn: moveMateIn ?? undefined,
                tactics,
                masterStats
            });

            // Update state incrementally to show progress
            setAnalyzedMoves([...results]);
            setProgress(Math.round(((i + 1) / totalMoves) * 100));

            console.log(`[useGameAnalysis] Move ${i + 1} finalized: ${move.san} -> ${classification}`);
        }
        console.log('[useGameAnalysis] FULL ANALYSIS COMPLETE');

        setAnalyzedMoves(results);
        setWhiteAccuracy(calculateAccuracy(results, 'w'));
        setBlackAccuracy(calculateAccuracy(results, 'b'));
        
            // Detect the opening played using FEN history

        } catch (error) {
            console.error("[useGameAnalysis] Fatal error during analysis loop:", error);
        } finally {
            setIsAnalyzing(false);
        }

    }, [game]);

    const stopAnalysis = useCallback(() => {
        isCancelledRef.current = true;
        setIsAnalyzing(false);
        if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            stopAnalysis();
        };
    }, [stopAnalysis]);

    return {
        isAnalyzing,
        progress,
        analyzedMoves,
        whiteAccuracy,
        blackAccuracy,
        detectedOpening,
        startAnalysis,
        stopAnalysis
    };
}
