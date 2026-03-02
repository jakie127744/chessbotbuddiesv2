import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Chess } from 'chess.js';
import { saveGame } from '@/lib/game-storage';
import { ChessBoard } from '@/components/ChessBoard';
import { useBoardColorScheme } from '@/contexts/BoardColorSchemeContext';
import { GameInfo } from '@/components/GameInfo';
import { CoachCommentary } from '@/components/CoachCommentary';
import { BotCommentary } from '@/components/BotCommentary';
import { EvaluationBar } from '@/components/EvaluationBar';
import { Tabs } from '@/components/ui/Tabs';
import { BotSelectionPanel } from '@/components/BotSelectionPanel';
import { List, MessageSquare, GraduationCap, ChevronLeft, ChevronRight, Bot, BookOpen, Crown, Users as UsersIcon, Undo2, RefreshCw, Handshake, Flag, Upload, Microscope, SkipBack, SkipForward, Home, Zap } from 'lucide-react';
import { BotGameConfig } from '@/lib/bot-engine';
import { BotProfile } from '@/lib/bot-profiles';
import { OpeningVariation } from '@/lib/openings-repertoire';
import { formatTime } from '@/lib/utils';
import { TimeControl } from '@/lib/game-config';
import { useRewards } from '@/contexts/RewardsContext';
import { useSound } from '@/hooks/useSound';
import { detectOpeningFromMoves } from '@/lib/openings-repertoire';
import { UserProfile, getUserProfile, logoutUser, updateUserProfile, recordOpeningPlayed } from '@/lib/user-profile';

import { GameResultModal } from '@/components/GameResultModal';
import { AuthModal } from '@/components/AuthModal';
import { AdBanner } from '@/components/ads/AdBanner';
import { getAdSlotId } from '@/lib/ads/ad-manager';

interface Evaluation {
    evaluation: number | null;
    mate: number | null;
}

interface GameViewProps {
  game: Chess;
  boardOrientation: 'white' | 'black';
  onMove: (move: { from: string; to: string; promotion?: string }) => boolean;
  isVsComputer: boolean;
  gameStatus: string;
  whiteTime: number;
  blackTime: number;
  onReset: () => void;
  onUndo: () => void;
  onFlipBoard: () => void;
  
  // Bot/Coaching Props
  selectedBot: BotProfile | null;
  selectedCoach: BotProfile | null;
  onSelectBot: (bot: BotProfile | null) => void;
  onSelectCoach: (coach: BotProfile | null) => void;
  onStartBotGame: (opening: OpeningVariation | null, timeControl: TimeControl, userSide?: 'w' | 'b' | 'random', isPassAndPlay?: boolean) => void;

  lastMove: { from: string; to: string } | null;
  evaluation: Evaluation;
  bestMove?: string | null;
  isAnyBotThinking: boolean;
  
  // Review Props
  isReviewMode?: boolean;
  onToggleReviewMode?: () => void;
  reviewMoveIndex?: number;
  onReviewNavigate?: (index: number) => void;
  botOpeningConfig?: BotGameConfig;
  playerName?: string; 
  onResign: () => void;
  onOfferDraw: () => void;
  onSwitchSides: () => void;
  timeControl: TimeControl;
  initialTimeControl?: TimeControl;
  isPassAndPlay?: boolean;
  areAdsAllowed?: boolean;
}

export function GameView({
  game,
  boardOrientation,
  onMove,
  isVsComputer,
  gameStatus,
  whiteTime,
  blackTime,
  onReset,
  onUndo,
  onFlipBoard,
  selectedBot,
  selectedCoach,
  onSelectBot,
  onSelectCoach,
  onStartBotGame,
  lastMove,
  evaluation,
  bestMove,
  isAnyBotThinking,
  isReviewMode = false,
  onToggleReviewMode,
  reviewMoveIndex = -1,
  onReviewNavigate,
  botOpeningConfig,

  playerName = 'Guest',
  onResign,
  onOfferDraw,
  onSwitchSides,
  timeControl,
  initialTimeControl,
  isPassAndPlay,
  areAdsAllowed = true
}: GameViewProps) {
  
  const [viewMode, setViewMode] = useState<'setup' | 'playing'>('setup');
  const [coachEnabled, setCoachEnabled] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  
  const { colorScheme } = useBoardColorScheme();

  const { playMove, playCapture, playCheck, playSuccess, playError } = useSound();
  const { checkGameEndAchievements } = useRewards();

  // Persistent Opening Name Logic
  const [persistentOpening, setPersistentOpening] = useState<string | null>(null);

  // Load opening book on mount
  useEffect(() => {
      import('@/lib/opening-lookup').then(({ loadOpeningLookup }) => {
          loadOpeningLookup();
      });
  }, []);

  useEffect(() => {
      const history = game.history({ verbose: true });
      
      // Reset on new game
      if (history.length < 2) {
          if (persistentOpening !== null) setPersistentOpening(null);
          return;
      }

      // Try to detect opening using the new JSON lookup
      // We look for the "deepest" opening found in the current game history
      // This ensures if we transpose or extend, we show the specific name
      import('@/lib/opening-lookup').then(({ findDeepestOpening }) => {
          const fens = history.map(m => m.after);
          const openingName = findDeepestOpening(fens);
          
          if (openingName) {
              setPersistentOpening(openingName);
          }
      });
  }, [game]);

  // Detect game phase and endgame type
  const gamePhaseInfo = useMemo(() => {
    const moves = game.history().length;
    const pieces = game.board().flat().filter(p => p !== null);
    const pieceCount = pieces.length;
    
    // Opening phase
    if (moves < 15 && pieceCount > 24) {
      return { phase: 'opening' as const, endgameType: null };
    }
    
    // Endgame detection (12 or fewer pieces)
    if (pieceCount <= 12) {
      const white = pieces.filter(p => p?.color === 'w');
      const black = pieces.filter(p => p?.color === 'b');
      
      const hasWhiteQueen = white.some(p => p?.type === 'q');
      const hasBlackQueen = black.some(p => p?.type === 'q');
      const whiteRooks = white.filter(p => p?.type === 'r').length;
      const blackRooks = black.filter(p => p?.type === 'r').length;
      const whiteBishops = white.filter(p => p?.type === 'b').length;
      const blackBishops = black.filter(p => p?.type === 'b').length;
      const whiteKnights = white.filter(p => p?.type === 'n').length;
      const blackKnights = black.filter(p => p?.type === 'n').length;
      const whitePawns = white.filter(p => p?.type === 'p').length;
      const blackPawns = black.filter(p => p?.type === 'p').length;
      
      let endgameType = 'Endgame';
      
      // Classify endgame type
      if (hasWhiteQueen || hasBlackQueen) {
        endgameType = 'Queen Endgame';
      } else if (whiteRooks > 0 || blackRooks > 0) {
        if (whitePawns > 0 || blackPawns > 0) {
          endgameType = 'Rook Endgame';
        } else {
          endgameType = 'Rook Endgame (no pawns)';
        }
      } else if (whiteBishops > 0 || blackBishops > 0) {
        if (whiteKnights > 0 || blackKnights > 0) {
          endgameType = 'Bishop vs Knight';
        } else {
          endgameType = 'Bishop Endgame';
        }
      } else if (whiteKnights > 0 || blackKnights > 0) {
        endgameType = 'Knight Endgame';
      } else if (whitePawns > 0 || blackPawns > 0) {
        endgameType = 'Pawn Endgame';
      } else {
        endgameType = 'King vs King';
      }
      
      return { phase: 'endgame' as const, endgameType };
    }
    
    return { phase: 'middlegame' as const, endgameType: null };
  }, [game]);

  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Effect to show modal when game ends
  useEffect(() => {
      if ((game.isGameOver() || gameStatus) && !isReviewMode) {
          // Small delay to let the board update the final move visually
          const timer = setTimeout(() => {
             setShowResultModal(true);
             
             // Prompt Guest to Signup
             const user = getUserProfile();
             if (!user || user.id.startsWith('guest_')) {
                 // Delay slightly more to let result modal appear first? 
                 // Or maybe only show if they close the result modal?
                 // Let's show it after a moment or handle it in result modal actions?
                 // Better: Show it via state, maybe triggered by GameResultModal interactions or just pop it up.
                 // Let's set it to true, but maybe the AuthModal z-index needs to be higher.
                 // For now, let's trigger it.
                 // setTimeout(() => setShowAuthPrompt(true), 1500); 
             }
          }, 500);
          return () => clearTimeout(timer);
      } else {
          setShowResultModal(false);
      }
  }, [game, gameStatus, isReviewMode]);

  // Sound Effects Logic
  useEffect(() => {
    // Don't play sounds in review mode or if there are no moves yet
    if (isReviewMode || game.history().length === 0) return;

    // Current game state
    const history = game.history({ verbose: true });
    const lastMoveDetails = history[history.length - 1];

    // 1. Game Over Sounds & Rewards
    if (game.isGameOver()) {
        const isPlayerMated = game.turn() === (boardOrientation === 'white' ? 'w' : 'b');
        const isDraw = game.isDraw() || game.isStalemate();
        
        let result: 'win' | 'loss' | 'draw' = 'draw';
        if (game.isCheckmate()) {
            result = isPlayerMated ? 'loss' : 'win';
        }

        // Play Sound
        if (result === 'loss') {
            playError();
        } else {
            playSuccess();
            // Winner gets prompt!
            const user = getUserProfile();
             if (!user || user.id.startsWith('guest_')) {
                 setTimeout(() => setShowAuthPrompt(true), 2000);
             }
        }
        
        // Trigger Rewards (Only if game is finished properly)
        const earned = checkGameEndAchievements(
            result, 
            game.history().length, 
            selectedBot?.id, 
            selectedBot?.elo
        );
        setXpEarned(earned);

        // Learning Coach: Record what opening was played for Coach Jakie
        // We use persistentOpening here if available, or re-detect
        const historyForRecord = game.history({ verbose: true });
        const detectedOpening = detectOpeningFromMoves(historyForRecord);
        if (detectedOpening) {
            recordOpeningPlayed(detectedOpening.id);
        }

        // AUTO-SAVE GAME: Save every completed game to history
        saveGame({
            pgn: game.pgn(),
            fen: game.fen(),
            result: result === 'win' ? (boardOrientation === 'white' ? 'White wins' : 'Black wins') :
                    result === 'loss' ? (boardOrientation === 'white' ? 'Black wins' : 'White wins') : 'Draw',
            playerColor: boardOrientation === 'white' ? 'w' : 'b',
            opponentName: selectedBot ? selectedBot.name : 'Computer',
            moveCount: game.history().length,
            timeControl: timeControl.label
        });

        // Update User Profile Activity & Stats
        const currentProfile = getUserProfile();
        if (currentProfile) {
            const currentStats = currentProfile.stats || { gamesPlayed: 0, puzzlesSolved: 0, lessonsCompleted: 0 };
            updateUserProfile({ 
                lastGamePlayedAt: Date.now(),
                stats: {
                    ...currentStats,
                    gamesPlayed: (currentStats.gamesPlayed || 0) + 1
                }
            });
        }

        return; // Stop here, don't play move sound
    }

    // 2. Check Sound
    if (game.isCheck()) {
        playCheck();
        return;
    }

    // 3. Capture vs Move
    if (lastMoveDetails?.captured) {
        playCapture();
    } else {
        playMove();
    }

  }, [lastMove, game, isReviewMode]); // Trigger when lastMove updates

  // Determine winner for Modal
  const getWinner = () => {
      if (game.isCheckmate()) return game.turn() === 'w' ? 'black' : 'white';
      if (gameStatus?.toLowerCase().includes('white wins')) return 'white';
      if (gameStatus?.toLowerCase().includes('black wins')) return 'black';
      if (game.isDraw() || game.isStalemate() || gameStatus?.toLowerCase().includes('draw')) return 'draw';
      return null;
  };
  
  const router = useRouter();

  // Handlers for Modal Actions
  const handleReviewClick = (coach?: BotProfile | null) => {
      setShowResultModal(false);
      
      // Save game for review
      const savedGame = saveGame({
          pgn: game.pgn(),
          fen: game.fen(),
          result: gameStatus || (game.isCheckmate() ? (game.turn() === 'w' ? 'Black wins' : 'White wins') : 'Draw'),
          playerColor: boardOrientation === 'white' ? 'w' : 'b', // Assuming user played this color
          opponentName: selectedBot ? selectedBot.name : 'Computer',
          moveCount: game.history().length,
          timeControl: timeControl.label
      });

      if (coach) {
          router.push(`/review?id=${savedGame.id}&coach=${coach.id}`);
      } else {
          router.push(`/review?id=${savedGame.id}`);
      }
  };
  
  const handleNewGameClick = () => {
      setShowResultModal(false);
      setViewMode('setup');
      onReset();
  };

  // Helper to get the game state to display (Live vs Review)
  const getDisplayGame = () => {
    if (isReviewMode && reviewMoveIndex > -1) {
        // Create a new Chess instance and replay history up to index
        // Optimization: In a real app we might cache this or use a lightweight method
        // But for <100 moves, replaying is fast enough in JS
        const replayGame = new Chess();
        const history = game.history(); 
        // history contains all moves. We want to apply moves 0 to reviewMoveIndex
        for (let i = 0; i <= reviewMoveIndex; i++) {
            if (history[i]) replayGame.move(history[i]);
        }
        return replayGame;
    }
    // If review index is -1 (start), return empty new game
    if (isReviewMode && reviewMoveIndex === -1) {
        return new Chess();
    }
    
    return game;
  };

  const displayGame = getDisplayGame();
  const displayBestMove = isReviewMode ? null : bestMove; // Don't show best move arrow in review for now (unless we analyze historically)
  const isHistorical = isReviewMode && reviewMoveIndex < (game.history().length - 1); // Are we looking at the past?

  // Auto-switch to playing mode when game starts (history > 0)
  // Check viewMode to avoid redundant updates/loops
  useEffect(() => {
      if (game.history().length > 0 && viewMode !== 'playing') {
          setViewMode('playing');
      }
  }, [game, viewMode]);

  const handleStart = (opening: OpeningVariation | null, timeControl: TimeControl, userSide: 'w' | 'b' | 'random' = 'w') => {
      onStartBotGame(opening, timeControl, userSide);
      setViewMode('playing');
  };

  // Determine player color based on board orientation
  const playerColor = boardOrientation === 'white' ? 'w' : 'b';

  // Define Tabs for Playing Mode - Removed Chat, Added Bot
  const rightPanelTabs = [
    {
        id: 'moves',
        label: 'Moves',
        icon: List,
        content: (
            <GameInfo
                game={game}
                whiteTime={whiteTime}
                blackTime={blackTime}
                onReset={() => {
                    onReset(); 
                    setViewMode('setup'); 
                }}
                onUndo={onUndo}
                gameStatus={gameStatus}
                isThinking={isAnyBotThinking}
                thinkingBotName={selectedBot?.name}
                onFlipBoard={onFlipBoard}
                onImport={() => {}} 
                isVsComputer={isVsComputer}
                onToggleVsComputer={() => {}}
                
                isReviewMode={isReviewMode}
                onToggleReviewMode={onToggleReviewMode}
                reviewMoveIndex={reviewMoveIndex}
                onReviewNavigate={onReviewNavigate}
                totalMoves={game.history().length}
                onResign={onResign}
                onOfferDraw={onOfferDraw}
                onSwitchSides={selectedCoach ? onSwitchSides : undefined}
            />
        )
    },
    {
        id: 'bot',
        label: 'Bot',
        icon: Bot,
        content: (
             <div className="p-3 h-full overflow-y-auto">
                 {selectedBot ? (
                     <BotCommentary 
                        bot={selectedBot}
                        game={game}
                        lastMove={lastMove ? JSON.stringify(lastMove) : undefined}
                        isPlayerTurn={game.turn() === playerColor}
                        playerColor={playerColor}
                        evaluation={evaluation.evaluation !== null || evaluation.mate !== null ? {
                            cp: evaluation.evaluation ?? 0,
                            isMate: evaluation.mate !== null,
                            mateIn: evaluation.mate ?? undefined
                        } : null}
                        openingName={persistentOpening || undefined}
                        whiteTime={whiteTime}
                        blackTime={blackTime}
                        gameStatus={gameStatus}
                     />
                 ) : (
                     <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                         <Bot size={48} className="mb-4 opacity-30" />
                         <p className="font-bold">No Bot Selected</p>
                         <p className="text-xs">Select a bot opponent to see their commentary.</p>
                     </div>
                 )}
             </div>
         )
    },
    {
        id: 'coach',
        label: 'Coach',
        icon: GraduationCap,
        content: (
             <div className="p-4 h-full overflow-y-auto">
                 {selectedCoach ? (
                     <CoachCommentary 
                        lastMove={lastMove ? JSON.stringify(lastMove) : undefined}
                        game={game}
                        coach={selectedCoach}
                        openingConfig={botOpeningConfig}
                     />
                 ) : (
                     <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                         <GraduationCap size={48} className="mb-4 opacity-30" />
                         <p className="font-bold">Coach Mode Disabled</p>
                         <p className="text-xs">Enable a coach in the setup menu to get advice.</p>
                     </div>
                 )}
             </div>
         )
    }
  ];

  return (
    <div className="flex-1 min-h-full lg:h-full flex flex-col lg:flex-row bg-[#0d1221] lg:overflow-hidden relative">
      
      {/* Center: Game Board Area */}
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center p-4 lg:p-4 relative z-0 overflow-hidden">
        
        {/* Board + Eval Area */}
        <div className="w-full h-full max-w-full max-h-[min(700px,80vh)] flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 overflow-hidden">
            {/* Eval Bar - Desktop */}
            <div className={`hidden lg:block h-full w-4 rounded-md shadow-lg transition-opacity z-20 shrink-0 ${viewMode === 'setup' ? 'opacity-0' : 'opacity-100'}`}>
                 <EvaluationBar 
                    evaluation={evaluation.evaluation ?? 0} 
                    orientation={boardOrientation} 
                    isMate={evaluation.mate !== null}
                 />
            </div>

            {/* Board Stack: Top Player, Board, Bottom Player */}
            <div className="flex-1 flex flex-col items-center justify-center h-full max-w-full aspect-square">

            {/* 1. Top Player (Opponent/Bot) */}
            <div className="w-full lg:max-w-2xl flex items-center justify-between gap-3 px-4 py-2 lg:px-2 bg-[var(--color-bg-secondary)] lg:bg-transparent border-b border-[var(--color-border)]/30 lg:border-0 z-10">
                 <div className="flex items-center gap-3 min-w-0">
                    {selectedBot ? (
                        <>
                            <div className="w-8 h-8 lg:w-8 lg:h-8 rounded-xl lg:rounded-full bg-slate-700 overflow-hidden border-2 border-[#5ec2f2]/50 shadow-md">
                                <img src={selectedBot.avatar} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="font-black text-sm lg:text-sm truncate block text-[var(--color-text-primary)]">{selectedBot.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] lg:text-xs text-[var(--color-text-muted)] font-bold uppercase tracking-wider">({selectedBot.elo})</span>
                                    {persistentOpening && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 font-medium truncate max-w-[100px] lg:max-w-[200px]">
                                            <BookOpen size={10} className="mr-1" />
                                            {persistentOpening}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 lg:w-8 lg:h-8 rounded-xl lg:rounded-full bg-slate-700/50 flex items-center justify-center border-2 border-slate-600">
                                 <span className="font-bold text-xs text-[var(--color-text-muted)]">P2</span>
                            </div>
                            <div className="flex flex-col">
                                 <span className="font-bold text-sm text-[var(--color-text-primary)]">Guest</span>
                                 {persistentOpening && (
                                    <span className="inline-flex items-center mt-0.5 text-[10px] text-blue-400 font-medium truncate max-w-[200px]">
                                        <BookOpen size={10} className="mr-1" />
                                        {persistentOpening}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                 </div>

                 {/* Timer for Top (typically Opponent) */}
                 <div className={`
                    px-3 py-1 lg:px-3 lg:py-1 rounded-xl font-mono text-xl lg:text-xl font-black tracking-widest transition-all
                    ${game.turn() !== playerColor ? 'bg-[#ff7b6b]/10 text-[#ff7b6b] border-2 border-[#ff7b6b]/30 shadow-lg shadow-[#ff7b6b]/10 scale-105' : 'bg-[var(--color-bg-elevated)]/50 text-slate-500 border-2 border-transparent'}
                 `}>
                    {formatTime(playerColor === 'w' ? blackTime : whiteTime)}
                 </div>
            </div>
            
                {/* 2. Board */}
                <div className="flex-1 w-full relative">
                    <div className={`
                        absolute inset-0 shadow-2xl transition-all duration-300 aspect-square
                        ${viewMode === 'setup' ? 'opacity-90 hover:opacity-100' : ''}
                    `}>
                        <ChessBoard
                            game={displayGame}
                            onMove={move => {
                                if (viewMode === 'setup') return false;
                                if (isReviewMode && onToggleReviewMode) onToggleReviewMode();
                                return onMove(move);
                            }}
                            orientation={boardOrientation}
                            bestMove={null}
                            lastMove={viewMode === 'playing' ? (isReviewMode ? null : lastMove) : null}
                            arePiecesDraggable={viewMode === 'playing'}
                            colorScheme={colorScheme}
                        />
                    </div>
                </div>

            {/* 3. Bottom Player (User) */}
            <div className="w-full lg:max-w-2xl flex items-center justify-between gap-3 px-4 py-2 lg:px-2 bg-[var(--color-bg-secondary)] lg:bg-transparent border-t border-[var(--color-border)]/30 lg:border-0 z-10">
                 <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 lg:w-8 lg:h-8 rounded-xl lg:rounded-full bg-[#69e0a3]/20 flex items-center justify-center border-2 border-[#69e0a3]/50 shadow-md shadow-[#69e0a3]/10">
                          <span className="font-black text-xs text-[#69e0a3]">ME</span>
                      </div>
                      <div className="flex-1 min-w-0">
                          <span className="font-black text-sm lg:text-sm truncate block text-[var(--color-text-primary)]">{playerName}</span>
                          <span className="text-[10px] lg:text-xs text-[var(--color-text-muted)] font-bold uppercase tracking-wider">(800)</span>
                      </div>
                 </div>

                 {/* Timer for Bottom (User) */}
                 <div className={`
                    px-3 py-1 lg:px-3 lg:py-1 rounded-xl font-mono text-xl lg:text-xl font-black tracking-widest transition-all
                    ${game.turn() === playerColor ? 'bg-[#5ec2f2]/10 text-[#5ec2f2] border-2 border-[#5ec2f2]/30 shadow-lg shadow-[#5ec2f2]/10 scale-105' : 'bg-[var(--color-bg-elevated)]/50 text-slate-500 border-2 border-transparent'}
                 `}>
                    {formatTime(playerColor === 'w' ? whiteTime : blackTime)}
                 </div>
            </div>

            {/* Mobile Actions Bar - Only visible on mobile under the board */}
            {viewMode === 'playing' && (
                <div className="lg:hidden w-full bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]/30 px-4 py-3">
                    {isReviewMode ? (
                        // REVIEW MODE NAVIGATION
                        <div className="flex items-center gap-2 w-full">
                            <button 
                                onClick={() => {
                                    onReset();
                                    setViewMode('setup');
                                }}
                                className="p-3 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-xl shadow-sm"
                                title="Exit to Setup"
                            >
                                <Home size={20} />
                            </button>

                            <button 
                                onClick={() => onReviewNavigate?.(0)} 
                                disabled={reviewMoveIndex <= 0}
                                className="p-3 bg-[var(--color-bg-tertiary)] disabled:opacity-50 text-[var(--color-text-primary)] rounded-xl shadow-sm"
                            >
                                <SkipBack size={20} />
                            </button>
                            <button 
                                onClick={() => onReviewNavigate?.(Math.max(-1, reviewMoveIndex - 1))} 
                                disabled={reviewMoveIndex <= -1}
                                className="p-3 bg-[var(--color-bg-tertiary)] disabled:opacity-50 text-[var(--color-text-primary)] rounded-xl shadow-sm"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            
                            <div className="flex-1 text-center flex flex-col items-center justify-center bg-[var(--color-bg-tertiary)]/50 rounded-xl py-1">
                                <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Move</span>
                                <span className="text-lg font-black text-[var(--color-text-primary)] font-mono">{Math.floor((reviewMoveIndex + 1) / 2) + 1}</span>
                            </div>

                            <button 
                                onClick={() => onReviewNavigate?.(Math.min((game.history().length) - 1, reviewMoveIndex + 1))} 
                                disabled={reviewMoveIndex >= (game.history().length) - 1}
                                className="p-3 bg-[var(--color-bg-tertiary)] disabled:opacity-50 text-[var(--color-text-primary)] rounded-xl shadow-sm"
                            >
                                <ChevronRight size={20} />
                            </button>
                            <button 
                                onClick={() => onReviewNavigate?.((game.history().length) - 1)} 
                                disabled={reviewMoveIndex >= (game.history().length) - 1}
                                className="p-3 bg-[var(--color-bg-tertiary)] disabled:opacity-50 text-[var(--color-text-primary)] rounded-xl shadow-sm"
                            >
                                <SkipForward size={20} />
                            </button>
                        </div>
                    ) : (
                        // REGULAR GAMEPLAY ACTIONS

                        <div className="grid grid-cols-4 gap-2">
                             {!gameStatus && !game.isGameOver() ? (
                                <>
                                 <button onClick={onUndo} className="p-3 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-xl flex items-center justify-center shadow-sm" title="Undo"><Undo2 size={20} /></button>
                                 <button onClick={onOfferDraw} className="p-3 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-xl flex items-center justify-center shadow-sm" title="Draw"><Handshake size={20} className="text-amber-500" /></button>
                                 <button onClick={onResign} className="p-3 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-xl flex items-center justify-center shadow-sm" title="Resign"><Flag size={20} className="text-[#ff7b6b]" /></button>
                                 <button onClick={onFlipBoard} className="p-3 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-xl flex items-center justify-center shadow-sm" title="Flip"><Upload size={20} className="rotate-90" /></button>
                                </>
                             ) : (
                                <>
                                    <button 
                                        onClick={onToggleReviewMode} 
                                        className="col-span-4 py-4 bg-[#2563eb] text-white font-black text-lg rounded-xl shadow-[0_4px_0_0_#1e40af] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-3 relative overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2 relative z-10">
                                            <Zap size={20} className="fill-white" />
                                            <span>Start Game Review</span>
                                        </div>
                                        <div className="bg-black/20 px-2 py-0.5 rounded text-xs font-bold text-blue-100">
                                            3 left
                                        </div>
                                    </button>
                                </>
                             )}
                        </div>
                    )}
                </div>
            )}
            </div>
        </div>
      </div>



      {/* Right Sidebar: Bot Selection OR Game Info/Tabs */}
      <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 h-full bg-[#111b33] border-l border-white/5 z-20 shadow-2xl overflow-hidden relative">
        {viewMode === 'setup' ? (
            <BotSelectionPanel 
                onSelectBot={onSelectBot}
                selectedBot={selectedBot}
                onStartGame={handleStart}
                coachEnabled={coachEnabled}
                setCoachEnabled={setCoachEnabled}
                selectedCoach={selectedCoach}
                onSelectCoach={onSelectCoach}
                initialTimeControl={initialTimeControl}
                initialGameMode={isPassAndPlay ? 'pass-n-play' : 'vs-bot'}
            />
        ) : (
            <>
                {/* Header with "Change Bot" */}
                {(selectedBot || selectedCoach) && (
                    <div className="p-2 lg:p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)] flex items-center justify-between gap-2 shrink-0">
                         <div className="flex items-center gap-3 min-w-0">
                            {selectedBot ? (
                                <>
                                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-slate-700 overflow-hidden border-2 border-[#5ec2f2] shrink-0">
                                        <img src={selectedBot.avatar} alt={selectedBot.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-[var(--color-text-primary)] truncate text-sm lg:text-base">
                                            {selectedBot.name}
                                        </div>
                                        <div className="text-xs text-gray-400 hidden lg:block">Rating: {selectedBot.elo}</div>
                                    </div>
                                </>
                            ) : (
                                // Pass and Play Header
                                <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-full bg-[#3a4a6e] flex items-center justify-center">
                                         <UsersIcon size={20} className="text-[var(--color-text-primary)]" />
                                     </div>
                                     <div>
                                         <div className="font-bold text-[var(--color-text-primary)] text-sm">Pass & Play</div>
                                         <div className="text-xs text-gray-400">Local Multiplayer</div>
                                     </div>
                                </div>
                            )}
                         </div>
                         <button 
                            onClick={() => {
                                onReset();
                                setViewMode('setup');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#3a4a6e] hover:bg-[#4a4744] text-gray-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-[#4a4744] whitespace-nowrap"
                         >
                            <ChevronLeft size={14} />
                            Back
                         </button>
                    </div>
                )}
                {(!selectedBot && !selectedCoach) && viewMode === 'playing' && (
                     <div className="p-2 lg:p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)] flex items-center justify-between gap-2 shrink-0">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-[#3a4a6e] flex items-center justify-center">
                                 <UsersIcon size={20} className="text-[var(--color-text-primary)]" />
                             </div>
                             <div>
                                 <div className="font-bold text-[var(--color-text-primary)] text-sm">Pass & Play</div>
                                 <div className="text-xs text-gray-400">Local Multiplayer</div>
                             </div>
                         </div>
                         <button 
                            onClick={() => {
                                onReset();
                                setViewMode('setup');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#3a4a6e] hover:bg-[#4a4744] text-gray-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-[#4a4744] whitespace-nowrap"
                         >
                            <ChevronLeft size={14} />
                            Back
                         </button>
                     </div>
                )}
                <div className="flex-1 overflow-hidden min-h-0 bg-[var(--color-bg-secondary)]">
                     <Tabs tabs={rightPanelTabs} defaultTab="moves" className="h-full" />
                </div>
            </>
        )}
      </div>

          
      {/* Game Result Modal */}
      <GameResultModal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          gameStatus={gameStatus || (game.isCheckmate() ? 'Checkmate' : 'Game Over')}
          winner={getWinner()}
          playerColor={boardOrientation} 
          onReview={handleReviewClick}
          onNewGame={handleNewGameClick}
          onRematch={handleNewGameClick} 
          xpEarned={xpEarned} 
          selectedBot={selectedBot}
      />



      <AuthModal 
        isOpen={showAuthPrompt} 
        onClose={() => setShowAuthPrompt(false)}
        onSuccess={(user) => {
            setShowAuthPrompt(false);
            // Optional: Show a toast or success sound?
            // AuthModal handles its own success UI usually or closes.
        }} 
      />
    </div>
  );
}
