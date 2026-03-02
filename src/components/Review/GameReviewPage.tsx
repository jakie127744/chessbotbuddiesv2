'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Chess } from 'chess.js';
import { SavedGame, saveGame, getGameHistory } from '@/lib/game-storage';
import { useGameAnalysis } from '@/hooks/useGameAnalysis';

import { ChessBoard, BoardArrow } from '@/components/ChessBoard';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Share2, Download, Microscope, Save, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AnalysisPanel } from '@/components/Review/AnalysisPanel';
import { MoveTimeline } from '@/components/Review/MoveTimeline';
import { EvaluationBar } from '@/components/EvaluationBar';
import { EngineSettings, EngineConfig, DEFAULT_CONFIG, ENGINE_LINE_COLORS } from '@/components/Review/EngineSettings';
import { useLiveAnalysis } from '@/hooks/useLiveAnalysis';
import { useMissedBestMoveArrow } from '@/hooks/useReviewArrows';
import { queryTablebase, isTablebasePosition, getTablebaseDisplayText, tablebaseToEval, TablebaseResult } from '@/lib/tablebase';
import { PlayerNameplate, PlayerInfo } from '@/components/PlayerNameplate';
import { useBoardColorScheme } from '@/contexts/BoardColorSchemeContext';
import { ReviewLimitManager } from '@/lib/review-limit';
import { DashboardShell } from '@/components/DashboardShell';
import { UserProfile, getUserProfile } from '@/lib/user-profile';
import { BOT_PROFILES } from '@/lib/bot-profiles';

interface GameReviewPageProps {
    gameData?: SavedGame; // Optional, if loaded from history
    initialPgn?: string;  // Optional, if passed directly
    playerInfo?: {
        white: PlayerInfo;
        black: PlayerInfo;
    };

}

export function GameReviewPage({ gameData, initialPgn, playerInfo }: GameReviewPageProps) {
    const router = useRouter();
    const { colorScheme } = useBoardColorScheme();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const profile = getUserProfile();
        setUserProfile(profile);
    }, []);

    const [currentMoveIndex, setCurrentMoveIndex] = useState(-1); // -1 = Start position

    const game = useMemo(() => {
        const g = new Chess();
        if (gameData?.pgn) {
            g.loadPgn(gameData.pgn);
        } else if (initialPgn) {
            try {
                // Sanitize PGN: Handle escaped newlines, extra quotes, and trimming
                let cleanPgn = initialPgn
                    .replace(/\\r/g, '')   // Remove escaped carriage returns
                    .replace(/\\n/g, '\n') // Fix escaped newlines
                    .replace(/\\"/g, '"')  // Fix escaped quotes
                    .replace(/\\/g, '')    // Remove remaining backslashes
                    .trim();
                
                // Ensure there is a blank line between headers and moves if missing
                if (!cleanPgn.includes('\n\n') && cleanPgn.includes(']')) {
                    const lastBracketIndex = cleanPgn.lastIndexOf(']');
                    if (lastBracketIndex !== -1) {
                         cleanPgn = cleanPgn.slice(0, lastBracketIndex + 1) + '\n\n' + cleanPgn.slice(lastBracketIndex + 1).trim();
                    }
                }

                g.loadPgn(cleanPgn);
                
                // Validation: If no history, maybe it loaded but parsed 0 moves?
                if (g.history().length === 0) {
                     // Fallback 1: Regex strip headers
                     let moveText = cleanPgn.replace(/\[.*?\]/g, '').trim();
                     
                     // Fallback 2: Look for absolute start of moves "1." or "1. "
                     // Regex finds "1." followed by typical move start chars
                     const match = cleanPgn.match(/1\.\s*[a-zA-Z]/);
                     if (match && match.index !== undefined) {
                         moveText = cleanPgn.substring(match.index);
                     }

                     if (moveText) {
                        try {
                             g.loadPgn(moveText); 
                        } catch(e2) {
                            // Silent fail on fallback
                        }
                     }
                }
            } catch (e) {
                console.error('Failed to load PGN:', e);
            }
        } else {
            console.warn('No PGN provided to GameReviewPage');
        }
        return g;
    }, [gameData, initialPgn]);

    // Extract Metadata (Ratings & Clocks)
    const { whiteRating, blackRating, moveClocks } = useMemo(() => {
        const headers = game.header();
        const wRating = headers['WhiteElo'] ? parseInt(headers['WhiteElo']) : undefined;
        const bRating = headers['BlackElo'] ? parseInt(headers['BlackElo']) : undefined;

        // Extract clock times from comments
        const clocks: (string | null)[] = [];
        const tempGame = new Chess();
        
        // Re-load PGN to temp game to ensure we have the full game loaded to traverse
        if (gameData?.pgn || initialPgn) { 
             try {
                 // We rely on the sanitization done in 'game' useMemo, 
                 // but 'game' object itself already has the PGN loaded.
                 // We can't access 'game's internal pgn string easily if it was cleaned inside the memo.
                 // So we just use 'game.pgn()' which should be valid.
                 tempGame.loadPgn(game.pgn());
                 
                 // Traverse to extract comments
                 const history = tempGame.history({ verbose: true });
                 tempGame.reset();
                 
                 history.forEach(move => {
                     tempGame.move(move);
                     const comment = tempGame.getComment();
                     if (comment) {
                         // Parse [%clk 0:05:00]
                         const match = comment.match(/%clk\s+([\d:]+)/);
                         clocks.push(match ? match[1] : null);
                     } else {
                         clocks.push(null);
                     }
                 });
             } catch (e) {
                 console.warn("Failed to parse clocks:", e);
             }
        }

        return { whiteRating: wRating, blackRating: bRating, moveClocks: clocks };
    }, [game, gameData, initialPgn]);

    // Determine current display time based on move index
    const { currentWhiteTime, currentBlackTime } = useMemo(() => {
        if (currentMoveIndex === -1) {
            // Initial state: try to parse time control or return default
            // For now, return undefined to show nothing or start time if we want to be fancy
            return { currentWhiteTime: undefined, currentBlackTime: undefined };
        }

        let wTime = undefined;
        let bTime = undefined;

        // Find last White Move <= currentMoveIndex
        for (let i = currentMoveIndex; i >= 0; i--) {
            // White moves are even indices (0, 2, 4...) in a 0-indexed array? 
            // verifying: 1. e4 (index 0 - White). 
            // So index 0 is White. 
            if (i % 2 === 0) { // White move
                if (moveClocks[i]) {
                    wTime = moveClocks[i];
                    break;
                }
            }
        }

        // Find last Black Move <= currentMoveIndex
        for (let i = currentMoveIndex; i >= 0; i--) {
            if (i % 2 !== 0) { // Black move
                if (moveClocks[i]) {
                    bTime = moveClocks[i];
                    break;
                }
            }
        }
        
        return { currentWhiteTime: wTime, currentBlackTime: bTime };
    }, [currentMoveIndex, moveClocks]);

    const {
        isAnalyzing,
        progress,
        analyzedMoves,
        whiteAccuracy,
        blackAccuracy,
        detectedOpening,
        startAnalysis,
        stopAnalysis
    } = useGameAnalysis({ game });

    // Persistent Opening Name - retain even when out of book
    const [persistentOpening, setPersistentOpening] = useState<string | null>(null);

    // Review Limit State
    const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
    const [reviewsRemaining, setReviewsRemaining] = useState(0);

    useEffect(() => {
        setReviewsRemaining(ReviewLimitManager.getRemaining());
    }, []);

    const handleStartReview = () => {
        const remaining = ReviewLimitManager.getRemaining();
        if (remaining > 0) {
            if (ReviewLimitManager.consumeReview()) {
                setReviewsRemaining(ReviewLimitManager.getRemaining());
                startAnalysis();
            }
        } else {
            setIsRewardModalOpen(true);
        }
    };

    useEffect(() => {
        // Update persistent opening when detected, but keep old value if null
        if (detectedOpening) {
            setPersistentOpening(detectedOpening);
        }
    }, [detectedOpening]);

    // Auto-start analysis - DISABLED to allow manual start via button
    // useEffect(() => {
    //     startAnalysis();
    //     return () => stopAnalysis();
    // }, [startAnalysis, stopAnalysis]);

    const [engineConfig, setEngineConfig] = useState<EngineConfig>(DEFAULT_CONFIG);
    const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

    // Persistence for engine settings
    const [isCloudAnalysisEnabled, setIsCloudAnalysisEnabled] = useState(false); // Continuous Analysis State

    // Orientation state
    const [orientation, setOrientation] = useState<'white' | 'black'>('white');

    useEffect(() => {
        const saved = localStorage.getItem('chess_engine_config');
        if (saved) {
            try {
                // Merge with default to ensure new keys (like showArrows) are present
                const savedConfig = JSON.parse(saved);
                setEngineConfig(prev => ({ 
                    ...prev, 
                    ...savedConfig,
                    // Force true if undefined in saved config (migration)
                    showArrows: savedConfig.showArrows ?? true 
                }));
            } catch (e) {
                console.error('Failed to parse saved engine config', e);
            }
        }
        setIsSettingsLoaded(true);
    }, []);

    useEffect(() => {
        if (isSettingsLoaded) {
            localStorage.setItem('chess_engine_config', JSON.stringify(engineConfig));
        }
    }, [engineConfig, isSettingsLoaded]);

    // Auto-save imported games to history
    const hasAutoSaved = useRef(false);
    useEffect(() => {
        const metaStr = sessionStorage.getItem('importedGameMeta');
        if (initialPgn && metaStr && !gameData?.id && !hasAutoSaved.current) {
            hasAutoSaved.current = true;
            try {
                const meta = JSON.parse(metaStr);
                const cleanPgn = game.pgn();
                const gameDetails = {
                    pgn: cleanPgn || initialPgn,
                    fen: game.fen(),
                    result: game.header()['Result'] || '*',
                    playerColor: (orientation === 'white' ? 'w' : 'b') as 'w' | 'b',
                    opponentName: orientation === 'white' ? meta.black || 'Black' : meta.white || 'White',
                    date: new Date(),
                    moveCount: game.history().length,
                    timeControl: game.header()['TimeControl'] || meta.timeControl,
                    whiteAvatar: meta.whiteAvatar,
                    blackAvatar: meta.blackAvatar,
                    platform: meta.platform || 'local'
                };
                
                // Check if already in history by PGN to avoid duplicates on refresh
                const history = getGameHistory();
                const isDuplicate = history.some(g => g.pgn === gameDetails.pgn);
                
                if (!isDuplicate) {
                    saveGame(gameDetails);
                    console.log('Automated save of imported game completed');
                }
            } catch (e) {
                console.error('Failed to auto-save imported game', e);
            }
        }
    }, [initialPgn, gameData, game, orientation]);

    const handleNavigate = (index: number) => {
        setCurrentMoveIndex(index);
    };

    // Computed game state for the current move index
    const currentPositionGame = useMemo(() => {
        const g = new Chess();
        if (gameData?.pgn || initialPgn) {
            // Replay to current index
            g.loadPgn(gameData?.pgn || initialPgn || '');
            const history = g.history({ verbose: true });
            g.reset();
            for (let i = 0; i <= currentMoveIndex; i++) {
                if (history[i]) g.move(history[i]);
            }
        }
        return g;
    }, [gameData, initialPgn, currentMoveIndex]);
    


    // Get current move analysis for classification display
    const currentMoveAnalysis = useMemo(() => {
        if (currentMoveIndex === -1 || !analyzedMoves[currentMoveIndex]) {
            return null;
        }
        return analyzedMoves[currentMoveIndex];
    }, [analyzedMoves, currentMoveIndex]);

    // Get last move from/to for highlighting
    const lastMoveSquares = useMemo(() => {
        if (currentMoveIndex === -1) return null;
        
        const g = new Chess();
        if (gameData?.pgn || initialPgn) {
            g.loadPgn(gameData?.pgn || initialPgn || '');
            const history = g.history({ verbose: true });
            if (history[currentMoveIndex]) {
                return {
                    from: history[currentMoveIndex].from,
                    to: history[currentMoveIndex].to
                };
            }
        }
        return null;
    }, [gameData, initialPgn, currentMoveIndex]);

    // Tablebase integration
    const [tablebaseResult, setTablebaseResult] = useState<TablebaseResult | null>(null);
    const currentFen = currentPositionGame.fen();
    const sideToMove = currentFen.split(' ')[1] as 'w' | 'b';

    // Get evaluation and mate info of current position (from last move analysis)
    const currentMoveData = useMemo(() => {
        const analysisIndex = currentMoveIndex + 1;
        const move = analyzedMoves[analysisIndex];
        
        if (move) {
            // Validate FEN to prevent mismatch (e.g. illegal arrows)
            // We compare piece placement, color, castling, and en-passant (first 4 fields)
            const analysisFenParts = move.fen.split(' ');
            const currentFenParts = currentFen.split(' ');
            const isMatch = analysisFenParts.slice(0, 4).join(' ') === currentFenParts.slice(0, 4).join(' ');

            if (isMatch) {
                return {
                    evaluation: move.evaluation,
                    isMate: move.isMate ?? false,
                    mateIn: move.mateIn,
                    bestMove: move.bestMove,
                    stableEval: move.stableEval
                };
            }
        }
        return { evaluation: 0, isMate: false, mateIn: undefined, bestMove: undefined }; // Fallback
    }, [analyzedMoves, currentMoveIndex, currentFen]);

    const currentEval = currentMoveData.evaluation;

    useEffect(() => {
        // Query tablebase for positions with ≤7 pieces
        if (isTablebasePosition(currentFen)) {
            queryTablebase(currentFen).then(result => {
                setTablebaseResult(result);
            });
        } else {
            setTablebaseResult(null);
        }
    }, [currentFen]);

    // Compute tablebase eval and text
    const tablebaseEval = useMemo(() => {
        if (!tablebaseResult) return null;
        return tablebaseToEval(tablebaseResult, sideToMove);
    }, [tablebaseResult, sideToMove]);

    const tablebaseText = useMemo(() => {
        if (!tablebaseResult) return undefined;
        return getTablebaseDisplayText(tablebaseResult, sideToMove);
    }, [tablebaseResult, sideToMove]);

    // Final evaluation: use tablebase if available, otherwise engine eval
    const displayEval = tablebaseEval?.evaluation ?? currentEval;
    // Use tablebase mate info, fallback to engine mate detection
    const displayIsMate = tablebaseEval?.isMate ?? currentMoveData.isMate;
    const isTablebase = tablebaseResult !== null;

    // Live analysis with configurable engine settings
    const { lines: engineLines, isAnalyzing: isLiveAnalyzing, currentDepth, analyzedFen } = useLiveAnalysis({
        fen: currentFen,
        config: engineConfig,
        // Enabled if Master Switch is ON (Cloud Analysis) OR if explicitly analyzing (fallback)
        // BUT user wants "auto analyze every move". So we enable if toggle is ON.
        enabled: (!isAnalyzing && isCloudAnalysisEnabled) 
    });

    // Convert Engine Lines (UCI) to SAN for display
    const formattedEngineLines = useMemo(() => {
        if (!engineLines.length) return [];
        
        try {
            // Create a temporary game instance to validate/convert moves
            // We use the AnalyzedFen to ensure we are converting moves for the correct position
            // If analyzedFen doesn't match currentFen, lines might be stale, but we filter that in useLiveAnalysis usually.
            // But here we want to be safe.
            const fenToUse = analyzedFen || currentFen; 
            const tempGame = new Chess(fenToUse);

            return engineLines.map(line => {
                const movesSAN: string[] = [];
                const tempLineGame = new Chess(fenToUse); // Cloning for each line to not pollute
                
                // Try to convert the first few moves of the PV
                for (const uciMove of line.moves.slice(0, 5)) { // Limit to 5 moves for display
                    try {
                        const move = tempLineGame.move({
                            from: uciMove.slice(0, 2),
                            to: uciMove.slice(2, 4),
                            promotion: uciMove.length > 4 ? uciMove.slice(4) as any : undefined
                        });
                        movesSAN.push(move.san);
                    } catch (e) {
                        break; // Stop if invalid (shouldn't happen with engine)
                    }
                }

                // Construct a PV string (e.g. "1. e4 e5 2. Nf3")
                // We need to know the full move number context? 
                // For simplified display, "1. e4 e5" relative to current position is usually what's shown in engine lines.
                // Or just the moves "e4 e5 Nf3...". User asked for "PGN notation format".
                // Usually engines show relative moves. "1. e4..." implies it's the next move.
                
                // Let's create a nice string.
                // If Black to move, start with "1... e5". If White, "1. e4".
                const startTurn = tempGame.turn();
                const startMoveNumber = tempGame.moveNumber(); // This might be wrong if FEN not full? Chess.js handles FEN counters.
                
                let pvString = '';
                let currentTurn = startTurn;
                let currentMoveNum = startMoveNumber;

                movesSAN.forEach((san, i) => {
                    if (currentTurn === 'w') {
                        pvString += `${currentMoveNum}. ${san} `;
                        currentTurn = 'b';
                    } else {
                        if (i === 0) {
                            pvString += `${currentMoveNum}... ${san} `;
                        } else {
                            pvString += `${san} `;
                            currentMoveNum++;
                        }
                        currentTurn = 'w';
                    }
                });

                return {
                    ...line,
                    pv: pvString.trim() // Replace raw UCI PV with SAN PV
                };
            });
        } catch (e) {
            console.error(e);
            return engineLines; // Fallback
        }
    }, [engineLines, currentFen, analyzedFen]);

    // Convert engine lines to arrows for the chessboard
    const engineArrows: BoardArrow[] = useMemo(() => {
        // Toggle Check
        if (!engineConfig.showArrows) return [];

        if (engineLines.length > 0) {
            // Validate that the live analysis matches the current board state
            // This prevents stale arrows from previous positions during rapid navigation
            const isLiveMatch = analyzedFen && analyzedFen.split(' ').slice(0, 4).join(' ') === currentFen.split(' ').slice(0, 4).join(' ');
            
            if (isLiveMatch) {
                return engineLines.map((line, index) => {
                    const from = line.bestMove.slice(0, 2);
                    const to = line.bestMove.slice(2, 4);
                    
                    // Extra Safety: Ensure the arrow starts from a piece of the correct color
                    const piece = currentPositionGame.get(from as any);
                    if (!piece || piece.color !== sideToMove) return null;

                    return {
                        from,
                        to,
                        color: ENGINE_LINE_COLORS[index] || '#22c55e',
                        opacity: 0.9 - index * 0.15
                    };
                }).filter(Boolean) as BoardArrow[]; // Remove nulls
            }
        }

        // Priority 2: Pre-calculated best move from game analysis
        if (currentMoveData.bestMove) {
            return [{
                from: currentMoveData.bestMove.slice(0, 2),
                to: currentMoveData.bestMove.slice(2, 4),
                color: '#22c55e',
                opacity: 0.9
            }];
        }

        return [];

    }, [engineLines, currentMoveData.bestMove, currentFen, analyzedFen, engineConfig.showArrows, sideToMove]);

    // Arrows for the actual move played (colored by accuracy)
    const playedMoveArrow: BoardArrow[] = useMemo(() => {
        if (!engineConfig.showArrows || currentMoveIndex < 0) return [];
        
        const moveData = analyzedMoves[currentMoveIndex];
        if (!moveData) return [];

        let color = '';
        switch (moveData.classification) {
            case 'Blunder': color = '#cc392c'; break; // Red
            case 'Mistake': color = '#e6912c'; break; // Orange
            case 'Inaccuracy': color = '#f1b332'; break; // Yellow
            case 'Inaccuracy': color = '#f1b332'; break; // Yellow (Risky maps to Inaccuracy/Risky)
            case 'Brilliant': color = '#1baca6'; break; // Teal
            case 'Great': color = '#5b85d9'; break; // Blue (Critical/Great)
            // Best/Good/Book/etc - often match engine arrow, so maybe skip or show subtle
        }
        
        if (!color) return [];

        // Get coordinates of the last move
        const history = currentPositionGame.history({ verbose: true });
        const lastMove = history[history.length - 1];
        
        if (!lastMove) return [];

        return [{
            from: lastMove.from,
            to: lastMove.to,
            color: color,
            opacity: 0.8
        }];
    }, [currentMoveIndex, analyzedMoves, currentPositionGame, engineConfig.showArrows]);

    // Arrow for the Best Move that was MISSED (if the played move wasn't best)
    const missedBestMoveArrow = useMissedBestMoveArrow({
        currentMoveIndex, 
        analyzedMoves, 
        engineConfig,
        game: currentPositionGame
    });

    useEffect(() => {
        if (gameData?.playerColor) {
            setOrientation(gameData.playerColor === 'b' ? 'black' : 'white');
        }
    }, [gameData]);

    const handleFlipBoard = () => {
        setOrientation(prev => prev === 'white' ? 'black' : 'white');
    };

    // Settings overlay state
    const [showSettings, setShowSettings] = useState(false);

    const handleDownloadPgn = () => {
        const pgn = game.pgn();
        const blob = new Blob([pgn], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `game_${new Date().toISOString().split('T')[0]}.pgn`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Helper to get player names from SavedGame
    const getLocalWhiteName = () => {
        if (!gameData) return 'White';
        return gameData.playerColor === 'w' ? 'You' : gameData.opponentName;
    };

    const getLocalBlackName = () => {
        if (!gameData) return 'Black';
        return gameData.playerColor === 'b' ? 'You' : gameData.opponentName;
    };
    
    // Resolve Avatars
    const resolveAvatar = (name: string, isBot: boolean, importedAvatar?: string) => {
        // 1. Bot?
        if (isBot) {
            const bot = BOT_PROFILES.find(b => b.name === name || b.nickname === name);
            if (bot) return bot.avatar;
            // Catch generic "Bot" names if exact match fails but name contains "Bot"
            if (name.toLowerCase().includes('bot')) return '/avatars/bot-rookie.png'; // Fallback bot
        }
        
        // 2. Local User? (name is "You" or matches user profile)
        if (name === 'You' || (userProfile && name === userProfile.username)) {
            return userProfile?.avatar;
        }

        // 3. Imported Avatar?
        if (importedAvatar) return importedAvatar;

        return undefined;
    };

    // Helper to extract imported avatars if passing via gameData (SavedGame) or we need to look at sessionStorage if current game is imported
    // For saved games, gameData has the avatar fields (we just added them)
    // For generic "initialPgn", we rely on what was stored in playerInfo or we need to pass avatars in.
    
    const wName = getLocalWhiteName();
    const wIsBot = wName.toLowerCase().includes('bot') || wName.toLowerCase().includes('stockfish') || wName.toLowerCase() === 'buddy';
    const bName = getLocalBlackName();
    const bIsBot = bName.toLowerCase().includes('bot') || bName.toLowerCase().includes('stockfish') || bName.toLowerCase() === 'buddy';

    const whitePlayer: PlayerInfo = playerInfo?.white || {
        name: wName,
        color: 'white',
        isBot: wIsBot,
    };

    const blackPlayer: PlayerInfo = playerInfo?.black || {
        name: bName,
        color: 'black',
        isBot: bIsBot,
    };
    
    // Resolve final avatars
    const whiteAvatar = resolveAvatar(whitePlayer.name, !!whitePlayer.isBot, gameData?.whiteAvatar);
    const blackAvatar = resolveAvatar(blackPlayer.name, !!blackPlayer.isBot, gameData?.blackAvatar);

    const topPlayer = orientation === 'white' ? blackPlayer : whitePlayer;
    const topAvatar = orientation === 'white' ? blackAvatar : whiteAvatar;
    
    const bottomPlayer = orientation === 'white' ? whitePlayer : blackPlayer;
    const bottomAvatar = orientation === 'white' ? whiteAvatar : blackAvatar;

    const handleLoadGame = (pgn: string, meta: any) => {
        try {
            sessionStorage.setItem('importedPgn', pgn);
            sessionStorage.setItem('importedGameMeta', JSON.stringify(meta));
            // Force reload to trigger import logic in page.tsx (on mount check)
            window.location.reload();
        } catch (e) {
            console.error('Failed to save game for import', e);
        }
    };

    return (
        <DashboardShell userProfile={userProfile} activeView="analysis">
            <div className="h-full w-full bg-[#0d1221] flex flex-col overflow-hidden">
                <div className="flex-1 flex overflow-hidden">
                    {/* Main Content Grid */}
                    <main className="flex-1 min-w-0 flex flex-col lg:flex-row h-full overflow-hidden">
                     {/* Left: Board Area */}
                    <div className="flex-1 min-w-0 flex flex-col items-center justify-center p-2 lg:p-4 relative z-0 overflow-hidden">
                        
                        {/* Navigation Buttons */}

                        
                        {/* Board and Eval Area */}
                        <div className="w-full h-full max-w-full max-h-[min(920px,90vh)] flex flex-col lg:flex-row items-center justify-center gap-2.5 lg:gap-5 overflow-hidden">
                            
                            {/* Board Stack: Top Player, Board, Bottom Player */}
                            <div className="flex-1 flex flex-col items-center justify-center h-full max-w-full">
                            <div className="w-full lg:max-w-2xl px-0.5 lg:px-1 flex justify-center">
                                <PlayerNameplate 
                                    player={{
                                        ...topPlayer,
                                        rating: topPlayer.color === 'white' ? whiteRating : blackRating
                                    }} 
                                    position="top" 
                                    isCurrentTurn={sideToMove === topPlayer.color.charAt(0)}
                                    time={(topPlayer.color === 'white' ? currentWhiteTime : currentBlackTime) || undefined}
                                    avatarUrl={topAvatar}
                                />
                            </div>

                            {/* Board Container - Maximized sizing with Side Eval Bar */}
                            <div className="w-full flex justify-center">

                                     <div className="relative w-full max-w-[min(1100px,calc(100vw-12px))] aspect-square flex items-center justify-center">
                                            {/* Evaluation Bar: extra thin and closer to the board */}
                                            <div className="absolute top-1 bottom-1 -left-1.5 lg:-left-2.5 w-1.5 lg:w-2 shadow-xl rounded-md overflow-hidden ring-1 ring-white/10 shrink-0 z-10">
                                                <EvaluationBar 
                                                    evaluation={displayEval} 
                                                    orientation={orientation}
                                                    isMate={displayIsMate}
                                                    isTablebase={isTablebase}
                                                    tablebaseText={tablebaseText}
                                                    stableEval={currentMoveData.stableEval}
                                                />
                                            </div>

                                            <ChessBoard 
                                                game={currentPositionGame} 
                                                onMove={() => false}
                                                orientation={orientation}
                                                lastMove={lastMoveSquares}
                                                classification={currentMoveAnalysis?.classification?.toLowerCase() || null}
                                                moveSquare={lastMoveSquares?.to || null}
                                                arePiecesDraggable={false}
                                                arrows={[...engineArrows, ...missedBestMoveArrow, ...playedMoveArrow]}
                                                colorScheme={colorScheme}
                                            />
                                     </div>
                            </div>

                            {/* Bottom Player */}
                            <div className="w-full lg:max-w-2xl px-1 flex justify-center">
                                <PlayerNameplate 
                                    player={{
                                        ...bottomPlayer, 
                                        rating: bottomPlayer.color === 'white' ? whiteRating : blackRating
                                    }} 
                                    position="bottom" 
                                    isCurrentTurn={sideToMove === bottomPlayer.color.charAt(0)}
                                    time={(bottomPlayer.color === 'white' ? currentWhiteTime : currentBlackTime) || undefined}
                                    avatarUrl={bottomAvatar}
                                />
                            </div>
                        </div>
                    </div>
                    </div>
                     {/* Right: Analysis Panel (Stats) */}
                     <div className="w-full lg:w-[400px] bg-[#1a2744]/20 backdrop-blur-sm flex flex-col shrink-0 flex-none lg:flex-none h-[40vh] lg:h-full min-h-0 border-l border-white/5">
                        {/* Engine Settings (Hidden from view, controlled by panel) */} 
                        {/* Note: EngineSettings component is internal state here, but we need to toggle it. 
                            Ideally pass a prop to AnalysisPanel to open/close settings modal/overlay. 
                            For now, let's keep it simple: AnalysisPanel has the button. 
                            We can add an overlay for settings here if needed, or simplified settings.
                        */}
                        
                        <div className="flex-1 overflow-hidden h-full">
                            <AnalysisPanel 
                                analyzedMoves={analyzedMoves}
                                whiteAccuracy={whiteAccuracy}
                                blackAccuracy={blackAccuracy}
                                isAnalyzing={isAnalyzing}
                                progress={progress}
                                currentMoveIndex={currentMoveIndex}
                                currentFen={currentPositionGame.fen()}
                                onNavigate={handleNavigate}
                                onLoadGame={handleLoadGame}
                                onFlipBoard={handleFlipBoard}
                                onShare={handleDownloadPgn}
                                onHome={() => router.push('/')}
                                onToggleSettings={() => setShowSettings(prev => !prev)}
                                onStartReview={handleStartReview}
                                reviewsRemaining={reviewsRemaining}
                                whiteName={whitePlayer.name}
                                blackName={blackPlayer.name}
                                whiteAvatar={whiteAvatar}
                                blackAvatar={blackAvatar}
                                engineLines={formattedEngineLines}
                                isCloudAnalysisEnabled={isCloudAnalysisEnabled}
                                onToggleCloudAnalysis={() => setIsCloudAnalysisEnabled(prev => !prev)}
                                showArrows={engineConfig.showArrows}
                                onToggleArrows={() => setEngineConfig(c => ({ ...c, showArrows: !c.showArrows }))}
                                currentDepth={currentDepth}
                                orientation={orientation}
                                game={currentPositionGame}
                                openingName={persistentOpening || undefined}
                                platform={gameData?.platform || (() => {
                                    const metaStr = sessionStorage.getItem('importedGameMeta');
                                    if (metaStr) {
                                        try {
                                            const meta = JSON.parse(metaStr);
                                            return meta.platform;
                                        } catch(e) {}
                                    }
                                    return undefined;
                                })()}
                                onSaveGame={() => {
                                    if (gameData?.id) {
                                        // Already saved
                                        alert('Game is already in your library!');
                                        return;
                                    }
                                    
                                    try {
                                        const cleanPgn = game.pgn();
                                        const gameDetails = {
                                            pgn: cleanPgn,
                                            fen: game.fen(),
                                            result: game.header()['Result'] || '*',
                                            playerColor: orientation === 'white' ? 'w' : 'b',
                                            opponentName: orientation === 'white' ? playerInfo?.black?.name || 'Black' : playerInfo?.white?.name || 'White',
                                            date: new Date(), // Use current date for import time, or parsing header would be better but this is sufficient for now
                                            moveCount: game.moveNumber() - 1,
                                            timeControl: game.header()['TimeControl'],
                                            whiteAvatar: whiteAvatar,
                                            blackAvatar: blackAvatar,
                                            platform: (() => {
                                                const metaStr = sessionStorage.getItem('importedGameMeta');
                                                if (metaStr) {
                                                    try {
                                                        const meta = JSON.parse(metaStr);
                                                        if (meta.platform) return meta.platform;
                                                    } catch(e) {}
                                                }
                                                const site = game.header()['Site'];
                                                if (site?.includes('lichess.org')) return 'lichess';
                                                if (site?.includes('chess.com')) return 'chesscom';
                                                return 'local';
                                            })() as any
                                        };

                                        // @ts-ignore - types are slightly loose in game-storage
                                        saveGame(gameDetails);
                                        alert('Game saved to your private library!');
                                    } catch (e) {
                                        console.error('Failed to save game', e);
                                        alert('Failed to save game.');
                                    }
                                }}
                                onRewardClaimed={(newRemaining) => setReviewsRemaining(newRemaining)}
                            />
                        </div>

                        {/* Engine Settings Overlay */}
                        {showSettings && (
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                <div className="bg-[#262421] rounded-xl border border-[#3a3a3a] p-4 w-full max-w-sm shadow-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-white font-bold text-lg">Engine Settings</h3>
                                        <button onClick={() => setShowSettings(false)} className="text-[#8d8d8d] hover:text-white p-1">✕</button>
                                    </div>
                                    <EngineSettings
                                        config={engineConfig}
                                        onConfigChange={setEngineConfig}
                                        isAnalyzing={isLiveAnalyzing}
                                    />
                                    <button 
                                        onClick={() => setShowSettings(false)}
                                        className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                     </div>
                </main>

                </div>
            </div>
        </DashboardShell>
    );
}
