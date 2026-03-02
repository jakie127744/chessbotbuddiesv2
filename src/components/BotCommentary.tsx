'use client';

import { useState, useEffect, useRef } from 'react';
import { BotProfile } from '@/lib/bot-profiles';
import { Chess } from 'chess.js';
import { 
  MessageCircle, 
  Sparkles, 
  Swords, 
  Crown, 
  Trophy,
  Zap,
  Heart,
  Star,
  Volume2,
  VolumeX,
  PlayCircle,
  PauseCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';


import { 
  getBotComment, 
  getBotIntroduction, 
  getBotIdleComment,
  CommentaryCategory
} from '@/lib/bot-commentary';
import { COACHING_DATA } from '@/lib/coach-commentary';
import { useBotVoice } from '@/hooks/useBotVoice';
import { 
  createSnapshot, 
  generateCommentary, 
  CommentarySnapshot 
} from '@/lib/commentary-pipeline';
import { 
  UserLearningProfile, 
  getUserProfile, 
  updateUserProfile 
} from '@/lib/user-learning-profile';
import { 
  NarrativeArc, 
  detectNarrativeOpportunity 
} from '@/lib/narrative-engine';
import { 
  AnalyzedMove, 
  classifyMove, 
  normalizeEval, 
  getMaterialCount,
  getTotalPieceCount 
} from '@/lib/analysis-utils';

interface BotCommentaryProps {
  bot: BotProfile;
  game: Chess;
  lastMove?: string;
  isPlayerTurn: boolean;
  playerColor?: 'w' | 'b';
  evaluation?: { cp: number; mateIn?: number; isMate?: boolean } | null;
  openingName?: string;
  whiteTime?: number;
  blackTime?: number;
  gameStatus?: string;
}

interface Commentary {
  type: CommentaryCategory;
  text: string;
  timestamp: string;
  context?: { [key: string]: string | number };
}

export function BotCommentary({ 
  bot, 
  game, 
  lastMove, 
  isPlayerTurn,
  playerColor = 'w',
  evaluation,
  openingName,
  whiteTime,
  blackTime,
  gameStatus
}: BotCommentaryProps) {
  const [currentComment, setCurrentComment] = useState<Commentary | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [lastCommentedMoveCount, setLastCommentedMoveCount] = useState<number>(-1);
  const [hasIntroduced, setHasIntroduced] = useState(false);
  const recentCommentsRef = useRef<string[]>([]);
  const currentBotIdRef = useRef<string>('');
  
  // Track previous state for change detection
  const prevEvalRef = useRef<{ cp: number; mateIn?: number; isMate?: boolean } | null>(null);
  const prevOpeningRef = useRef<string>('');

  // ADVANCED PIPELINE STATE
  const [userProfile, setUserProfile] = useState<UserLearningProfile | null>(null);
  const [narrativeArc, setNarrativeArc] = useState<NarrativeArc | null>(null);
  const [gameHistoryAnalyzed, setGameHistoryAnalyzed] = useState<AnalyzedMove[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load User Profile on Mount
  useEffect(() => {
    // In a real app, userId would come from auth. Using 'guest' or 'player' for now.
    const profile = getUserProfile('player');
    setUserProfile(profile);
  }, []);

  const { speak, isMuted, setIsMuted, hasSupport } = useBotVoice();

  // Audio Support
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Stop audio when bot changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [bot.id]);

  const setComment = (comment: Omit<Commentary, 'timestamp'>) => {
    setCurrentComment({ ...comment, timestamp: new Date().toLocaleTimeString() });
    
    // Only speak if audio file is NOT playing
    if (!isPlaying) {
      speak(comment.text, bot.id);
    }
  };

  // Track ALL used comments per game session - no repeats until exhausted
  const addToHistory = (text: string) => {
    // Don't add duplicates
    if (!recentCommentsRef.current.includes(text)) {
      recentCommentsRef.current.push(text);
    }
  };

  // Reset when bot changes
  useEffect(() => {
    if (bot && bot.id !== currentBotIdRef.current) {
      currentBotIdRef.current = bot.id;
      setHasIntroduced(false);
      setCurrentComment(null);
      setLastCommentedMoveCount(-1);
      recentCommentsRef.current = [];
      prevEvalRef.current = null;
      prevOpeningRef.current = '';
    }
  }, [bot]);

  // Reset on new game
  useEffect(() => {
    const moveCount = game.history().length;
    if (moveCount === 0) {
      setCurrentComment(null);
      setLastCommentedMoveCount(-1);
      setHasIntroduced(false);
      recentCommentsRef.current = [];
      prevEvalRef.current = null;
      prevOpeningRef.current = '';
    }
  }, [game]);

  // Bot introduction
  useEffect(() => {
    if (!hasIntroduced && bot) {
      setHasIntroduced(true);
      const intro = getBotIntroduction(bot.id);
      if (intro) {
        addToHistory(intro);
        setTimeout(() => {
          setComment({ type: 'intro', text: intro });
        }, 800);
      }
    }
  }, [bot, hasIntroduced]);

  // CHECK FOR GAME END CONDITIONS
  useEffect(() => {
      if (!gameStatus) return;

      const status = gameStatus.toLowerCase();
      const botColor = playerColor === 'w' ? 'b' : 'w';
      const winnerColor = status.includes('white') ? 'w' : 'b';
      const isDraw = status.includes('draw') || status.includes('stalemate') || status.includes('repetition') || status.includes('insufficient');
      
      let endType: CommentaryCategory | null = null;

      if (status.includes('won on time')) {
          endType = (botColor !== winnerColor) ? 'game_lost_time' : 'game_won_time';
      } else if (status.includes('checkmate') || status.includes('won')) {
           endType = (botColor !== winnerColor) ? 'game_lost' : 'game_won';
      } else if (isDraw) {
          if (status.includes('stalemate')) endType = 'game_draw_stalemate';
          else if (status.includes('repetition')) endType = 'game_draw_repetition';
          else if (status.includes('insufficient')) endType = 'game_draw_insufficient';
          else endType = 'game_draw';
      }

      if (endType) {
          // Add a small delay so it doesn't feel instant
          setTimeout(() => {
              setComment({
                  type: endType!, 
                  text: getBotComment(bot.id, endType!) || "Good game!",
                  context: { reason: status }
              });
              setLastCommentedMoveCount(-999); 
          }, 500);
      }

  }, [gameStatus, playerColor, bot.id]);

  // ------------------------------------------------------------------
  // MAIN PIPELINE INTEGRATION
  // ------------------------------------------------------------------
  useEffect(() => {
    // 1. Initial Intro
    if (!hasIntroduced && game.moveNumber() === 0 && !lastMove) {
      const intro = getBotIntroduction(bot.id);
      if (intro) {
        const comment: Commentary = {
          type: 'intro',
          text: intro,
          timestamp: new Date().toLocaleTimeString(),
        };
        setComment(comment);
        setHasIntroduced(true);
      }
      return;
    }

    // 2. Prevent duplicate comments for same move
    const currentMoveCount = game.moveNumber() * 2 + (game.turn() === 'b' ? 1 : 0);
    if (currentMoveCount === lastCommentedMoveCount) return;

    // 3. Pipeline Execution
    async function runPipeline() {
      if (isProcessing) return;
      setIsProcessing(true);

      try {
        // A. Construct AnalyzedMove (if eval available)
        const newAnalyzedMoves = [...gameHistoryAnalyzed];
        if (evaluation && lastMove) {
           // Approximate analysis
           const evalValue = normalizeEval(evaluation.cp, !!evaluation.isMate, evaluation.mateIn);
           const prevEvalValue = prevEvalRef.current 
             ? normalizeEval(prevEvalRef.current.cp, !!prevEvalRef.current.isMate, prevEvalRef.current.mateIn)
             : 0; // fallback
           
           // Determine classification
           const classificationResult = classifyMove(
             prevEvalValue,
             evalValue,
             [{ score: prevEvalValue, pv: [] }], // Approx: Best move maintains eval
             [{ score: evalValue, pv: [] }],     // Approx: After lines
             game.fen(),                         // After FEN
             game.turn() === 'w' ? 'b' : 'w', // Turn just ended
             true, // Assume best/forced for classification base
             false, // isBook
             false, // isForced
             false, // isSacrifice
             getMaterialCount(game.fen(), 'w'), 
             getMaterialCount(game.fen(), 'w'),
             getTotalPieceCount(game.fen())
           );

           const analyzedMove: AnalyzedMove = {
             moveNumber: game.moveNumber(),
             color: game.turn() === 'w' ? 'b' : 'w', // Color who JUST moved
             san: lastMove, 
             fen: game.fen(),
             evaluation: evalValue,
             bestMove: '', 
             classification: classificationResult.classification,
             cpLoss: 0, 
             perceptualLoss: classificationResult.perceptualLoss,
           };
           
           newAnalyzedMoves.push(analyzedMove);
           setGameHistoryAnalyzed(newAnalyzedMoves);
        }

        // B. Update Narrative State
        let currentArc = narrativeArc;
        if (newAnalyzedMoves.length > 0) {
            const lastAnalyzed = newAnalyzedMoves[newAnalyzedMoves.length - 1];
            // Check for new arc opportunities
            const newArcCandidate = detectNarrativeOpportunity(newAnalyzedMoves, lastAnalyzed, currentArc);
            
            if (newArcCandidate) {
                setNarrativeArc(newArcCandidate);
                currentArc = newArcCandidate; 
            }
        }

        // C. Create Snapshot
        const snapshot: CommentarySnapshot = createSnapshot(
          game,
          bot,
          playerColor || 'w',
          undefined, // openingConfig
          0, // userBookMoves
          Boolean(openingName), // isInBook
          false, // userPlayedNovelty
          recentCommentsRef.current,
          '', // fenBefore
          userProfile || undefined,
          currentArc,
          newAnalyzedMoves
        );

        // Attach Eval Data
        if (evaluation) {
            snapshot.evalAfter = normalizeEval(evaluation.cp, !!evaluation.isMate, evaluation.mateIn);
        }
        if (prevEvalRef.current) {
            snapshot.evalBefore = normalizeEval(prevEvalRef.current.cp, !!prevEvalRef.current.isMate, prevEvalRef.current.mateIn);
        }

        // D. Generate Commentary
        // Use move count diff (usually 1, unless skipped) as spacing indicator
        const result = generateCommentary(snapshot, 100); 

        // E. Apply Result
        if (result) {
           // Map internal pipeline type to UI type
           let mappedType: CommentaryCategory = 'idle';

           const map: Partial<Record<string, CommentaryCategory>> = {
               'GameEnd': 'idle', // or specific?
               'CheckmateThreat': 'mate_announcement',
               'Blunder': 'player_blunder',
               'HangingPiece': 'player_blunder',
               'MissedTactic': 'player_blunder', // or generic?
               'WinningTactic': 'player_good_move',
               'KingSafety': 'midgame',
               'OpeningMistake': 'opening',
               'EndgameMistake': 'endgame',
               'StrategicMistake': 'midgame',
               'GoodMove': 'player_good_move',
               'OpeningTheory': 'opening',
               'Novelty': 'opening_specific',
               'EducationalTip': 'fun_fact', // Close enough
               'Neutral': 'idle'
           };
           
           // If result.text contains "Mate", force mate type?
           if (result.type === 'Blunder') mappedType = 'player_blunder';
           else mappedType = map[result.type] || 'idle';

           if (result.type === 'Neutral') return; // Silence

           const commentPayload = {
             type: mappedType,
             text: result.text,
             context: result.meta as any
           };
           
           setComment(commentPayload);
           
           setLastCommentedMoveCount(currentMoveCount);
        }

      } catch (err) {
        console.error("Pipeline Error:", err);
      } finally {
        setIsProcessing(false);
      }
    }

    runPipeline();

    // Update refs
    prevEvalRef.current = evaluation || null;

  }, [game.fen(), evaluation, lastMove]); // Trigger on FEN or Eval update

  const getIcon = (type: CommentaryCategory) => {
    switch (type) {
      case 'intro': return <Star size={18} className="text-yellow-400" />;
      case 'opening': return <Sparkles size={18} className="text-blue-400" />;
      case 'opening_specific': return <Sparkles size={18} className="text-blue-500" />;
      case 'check_given': 
      case 'check_received': return <Zap size={18} className="text-orange-400" />;
      case 'checkmate': return <Crown size={18} className="text-amber-400" />;
      case 'mate_announcement': return <Crown size={18} className="text-amber-500 animate-pulse" />;
      case 'bot_capture':
      case 'player_capture': return <Swords size={18} className="text-red-400" />;
      case 'player_good_move': return <Heart size={18} className="text-pink-400" />;
      case 'player_blunder': return <Sparkles size={18} className="text-purple-400" />;
      case 'blunder_severe': return <Zap size={18} className="text-red-600 font-bold" />;
      case 'castle': return <Trophy size={18} className="text-blue-400" />;
      case 'endgame': return <Trophy size={18} className="text-emerald-400" />;
      case 'fun_fact': return <Sparkles size={18} className="text-cyan-400" />;
      case 'trash_talk': return <MessageCircle size={18} className="text-red-400" />;
      case 'midgame': return <MessageCircle size={18} className="text-indigo-400" />;
      case 'time_pressure_bot':
      case 'time_pressure_player': return <Clock size={18} className="text-orange-400 animate-pulse" />;
      case 'material_advantage': return <TrendingUp size={18} className="text-green-400" />;
      case 'material_disadvantage': return <TrendingDown size={18} className="text-red-400" />;
      default: return <MessageCircle size={18} className="text-slate-400" />;
    }
  };

  const getTypeLabel = (commentary: Commentary) => {
    switch (commentary.type) {
      case 'intro': return '👋 Hello!';
      case 'opening': return '♟️ Opening';
      case 'opening_specific': return '📖 Book Move';
      case 'check_given': return '⚡ Check!';
      case 'check_received': return '😰 Uh oh!';
      case 'checkmate': return '👑 Game Over!';
      case 'mate_announcement': return '⚠️ Mate in ' + (commentary.context?.mateIn || '?');
      case 'bot_capture': return '⚔️ Got one!';
      case 'player_capture': return '😮 Ouch!';
      case 'player_good_move': return '👏 Nice!';
      case 'player_blunder': return '😏 Hehe';
      case 'blunder_severe': return '😱 Blunder!';
      case 'castle': return '🏰 Castle!';
      case 'endgame': return '🎯 Endgame';
      case 'fun_fact': return '💡 Fun Fact';
      case 'trash_talk': return '😈 Trash Talk';
      case 'midgame': return '🤔 Strategy';
      case 'time_pressure_bot': return '⏳ Hurry!';
      case 'time_pressure_player': return '⏱️ Time!';
      case 'material_advantage': return '📈 Winning';
      case 'material_disadvantage': return '📉 Fighting';
      default: return '💬 Says...';
    }
  };

  const getBorderColor = (type: CommentaryCategory) => {
    switch (type) {
      case 'intro': return 'border-yellow-500/50';
      case 'opening': return 'border-blue-500/50';
      case 'check_given': 
      case 'check_received': return 'border-orange-500/50';
      case 'checkmate': return 'border-amber-500/50';
      case 'bot_capture':
      case 'player_capture': return 'border-red-500/50';
      case 'player_good_move': return 'border-pink-500/50';
      case 'player_blunder': return 'border-purple-500/50';
      case 'castle': return 'border-blue-500/50';
      case 'endgame': return 'border-emerald-500/50';
      case 'fun_fact': return 'border-cyan-500/50';
      case 'trash_talk': return 'border-red-500/50';
      case 'midgame': return 'border-indigo-500/50';
      default: return 'border-slate-600/50';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
      {/* Bot Header */}
      <div className="p-3 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold border-2 shadow-lg overflow-hidden"
            style={{
              backgroundColor: `${bot.color}33`,
              borderColor: bot.color,
            }}
          >
            <img 
              src={bot.avatar} 
              alt={bot.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = bot.name.slice(0, 2);
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white truncate">
              {bot.name}
            </h3>
            <p className="text-xs text-slate-400">
              {bot.elo} ELO • {bot.nickname}
            </p>
          </div>
          
          {hasSupport && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-full transition-colors ${
                isMuted 
                  ? 'text-slate-500 hover:text-slate-400 bg-slate-800' 
                  : 'text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20'
              }`}
              title={isMuted ? "Enable Voice" : "Disable Voice"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          )}

          {/* Audio Player Button (If bot has audioPath) */}
          {bot.audioPath && (
            <div className="flex items-center ml-1">
              <button
                onClick={toggleAudio}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isPlaying 
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]' 
                    : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
                title={isPlaying ? "Pause Learning Audio" : "Play Learning Audio"}
              >
                {isPlaying ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
              </button>
              <audio 
                ref={audioRef} 
                src={bot.audioPath} 
                onEnded={() => setIsPlaying(false)} 
                onError={(e) => {
                  console.error("Audio error:", e);
                  setIsPlaying(false);
                }}
              />
            </div>
          )}

          <div 
            className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: `${bot.color}33`, color: bot.color }}
          >
            {bot.category}
          </div>
        </div>
      </div>

      {/* Commentary Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative min-h-[120px]">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
          <MessageCircle size={80} />
        </div>

        {currentComment ? (
          <div 
            className={`relative w-full bg-slate-800/90 rounded-xl p-4 border-2 ${getBorderColor(currentComment.type)} shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-300`}
          >
            {/* Speech bubble tail */}
            <div 
              className="absolute -top-2 left-6 w-3 h-3 bg-slate-800 border-t-2 border-l-2 transform rotate-45"
              style={{ borderColor: 'inherit' }}
            />
            
            <div className="flex items-center gap-2 mb-2">
              {getIcon(currentComment.type)}
              <span className="text-xs font-bold text-slate-300">
                {getTypeLabel(currentComment)}
              </span>
            </div>
            
            <p className="text-sm text-slate-100 leading-relaxed">
              {currentComment.text}
            </p>
          </div>
        ) : isTyping ? (
          <div className="text-center animate-pulse">
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium text-slate-400">
                {bot.name} is typing...
              </span>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center opacity-50">
            <MessageCircle size={24} className="mx-auto mb-2 text-slate-600" />
            <p className="text-xs text-slate-500">Waiting for moves...</p>
          </div>
        )}
      </div>
    </div>
  );
}
