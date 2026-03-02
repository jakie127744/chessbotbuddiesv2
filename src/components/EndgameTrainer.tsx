'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronLeft, ChevronRight, Lightbulb, CheckCircle, 
  Trophy, Target, RefreshCcw, RotateCcw, Users,
  Castle, Crown, ArrowUp, Zap, Shield, Hand, Layers, Triangle, Puzzle,
  MessageCircle, AlertTriangle, BrainCircuit
} from 'lucide-react';
import { Chess } from 'chess.js';
import { ChessBoard } from './ChessBoard';
import { useBoardColorScheme } from '@/contexts/BoardColorSchemeContext';
import { ENDGAME_CATEGORIES, EndgameCategory } from '@/lib/endgame-data';
import { useRewards } from '@/contexts/RewardsContext';
import { useStockfish } from '@/hooks/useStockfish';
import { BOT_PROFILES, BotProfile, getCoachBots } from '@/lib/bot-profiles';
import { getBotMove, calculateBotDelay } from '@/lib/bot-engine';
import {
  pickRandomComment,
  getCoachCommentary,
  COACHING_DATA
} from '@/lib/coach-commentary';
import { CoachCommentary } from './CoachCommentary';

interface EndgameTrainerProps {}

const iconMap: Record<string, React.ElementType> = {
  Castle, Crown, ArrowUp, Zap, Shield, Hand, Layers, Triangle, Puzzle
};

// Simple beginner bots for endgame practice
const ENDGAME_BOTS = BOT_PROFILES.filter(b => b.elo <= 1600);

// Available coaches for endgame training
const ENDGAME_COACHES = getCoachBots();

// Helper function to count enemy king's legal moves (for stalemate detection)
function getEnemyKingMobility(game: Chess, playerColor: 'w' | 'b'): number {
  const enemyColor = playerColor === 'w' ? 'b' : 'w';
  const board = game.board();
  let kingSquare: string | null = null;
  
  // Find enemy king
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'k' && piece.color === enemyColor) {
        const file = String.fromCharCode(97 + col);
        const rank = String(8 - row);
        kingSquare = file + rank;
        break;
      }
    }
    if (kingSquare) break;
  }
  
  if (!kingSquare) return 8; // Fallback
  
  // Count adjacent squares the king could move to (simplified)
  const kingFile = kingSquare.charCodeAt(0);
  const kingRank = parseInt(kingSquare[1]);
  let mobility = 0;
  
  for (let df = -1; df <= 1; df++) {
    for (let dr = -1; dr <= 1; dr++) {
      if (df === 0 && dr === 0) continue;
      const newFile = String.fromCharCode(kingFile + df);
      const newRank = kingRank + dr;
      if (newFile >= 'a' && newFile <= 'h' && newRank >= 1 && newRank <= 8) {
        mobility++;
      }
    }
  }
  
  return mobility;
}

export default function EndgameTrainer({}: EndgameTrainerProps) {
  const [selectedCategory, setSelectedCategory] = useState<EndgameCategory | null>(null);
  const [selectedBot, setSelectedBot] = useState<BotProfile | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<BotProfile | null>(ENDGAME_COACHES[0]);
  const [positionIndex, setPositionIndex] = useState(0);
  const [game, setGame] = useState<Chess>(new Chess());
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [optimalMoves, setOptimalMoves] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [completedPositions, setCompletedPositions] = useState<Set<number>>(new Set());
  const [coachComment, setCoachComment] = useState<string>('');
  
  const previousEvalRef = useRef<number>(0);
  const lastCoachCommentRef = useRef<string>('');
  const hasShownIntroRef = useRef<boolean>(false);
  
  const { addXp, addActivity, markLessonComplete, markEndgameComplete } = useRewards();
  const { colorScheme } = useBoardColorScheme();
  
  // Stockfish for player move evaluation only
  const { bestMove: engineBestMove, evaluation, depth } = useStockfish(game.fen(), !isGameOver);
  
  const currentPosition = selectedCategory?.positions[positionIndex];
  const isPlayerTurn = game.turn() === playerColor;

  // Initialize game when position changes
  useEffect(() => {
    if (currentPosition && selectedBot) {
      try {
        const newGame = new Chess(currentPosition.fen);
        setGame(newGame);
        setFeedback(null);
        setIsGameOver(false);
        setMoveCount(0);
        setOptimalMoves(0);
        // Player plays the side to move
        const fen = currentPosition.fen;
        setPlayerColor(fen.split(' ')[1] as 'w' | 'b');
      } catch (e) {
        console.error('Invalid FEN:', currentPosition.fen);
      }
    }
  }, [currentPosition, selectedBot]);

  // Check for game over
  useEffect(() => {
    if (game.isGameOver()) {
      setIsGameOver(true);
      const isCheckmate = game.isCheckmate();
      const isStalemate = game.isStalemate();
      const isDraw = game.isDraw();
      
      const accuracy = moveCount > 0 ? Math.round((optimalMoves / moveCount) * 100) : 100;
      
      if (isCheckmate) {
        const winner = game.turn() === 'w' ? 'Black' : 'White';
        const playerWon = (winner === 'White' && playerColor === 'w') || (winner === 'Black' && playerColor === 'b');
        
        if (playerWon) {
          setFeedback({
            type: 'success',
            message: `🎉 Checkmate! You won in ${Math.ceil(moveCount / 2)} moves with ${accuracy}% accuracy!`
          });
          setCompletedPositions(prev => new Set([...prev, positionIndex]));
          addXp(50 + accuracy);

          if (selectedCategory) {
               markEndgameComplete(`${selectedCategory.id}-${positionIndex}`);
          }
        } else {
          setFeedback({
            type: 'error',
            message: `You got checkmated! Try again.`
          });
        }
      } else if (isStalemate) {
        setFeedback({ type: 'info', message: 'Stalemate! The game is a draw.' });
      } else if (isDraw) {
        setFeedback({ type: 'info', message: 'Draw by repetition or insufficient material.' });
      }
    }
  }, [game.fen()]);

  // Bot plays opponent moves
  const currentFen = game.fen();
  const opponentMoveRequestedRef = useRef(false);
  
  useEffect(() => {
    if (!selectedBot || isPlayerTurn || isGameOver) {
      opponentMoveRequestedRef.current = false;
      return;
    }
    
    if (opponentMoveRequestedRef.current) return;
    opponentMoveRequestedRef.current = true;
    
    const makeBotMove = async () => {
      setIsThinking(true);
      const delay = calculateBotDelay(game, selectedBot);
      await new Promise(resolve => setTimeout(resolve, Math.min(delay, 1500)));
      
      try {
        const gameCopy = new Chess(currentFen);
        const move = await getBotMove(gameCopy, selectedBot);
        
        if (!move) {
          setIsThinking(false);
          opponentMoveRequestedRef.current = false;
          return;
        }
        
        const result = gameCopy.move(move);
        if (result) {
          setGame(gameCopy);
          setFeedback(null);
        }
      } catch (e) {
        setFeedback({ type: 'error', message: 'Bot error - please reset' });
      }
      
      setIsThinking(false);
      opponentMoveRequestedRef.current = false;
    };
    
    makeBotMove();
  }, [currentFen, isPlayerTurn, isGameOver, selectedBot]);

  // Store best move at time of player's turn
  const bestMoveAtTurnRef = useRef<string>('');
  useEffect(() => {
    if (isPlayerTurn && engineBestMove && depth >= 10) {
      bestMoveAtTurnRef.current = engineBestMove;
    }
  }, [isPlayerTurn, engineBestMove, depth]);

  // COACH COMMENTARY
  useEffect(() => {
    if (currentPosition && selectedBot && !hasShownIntroRef.current) {
      hasShownIntroRef.current = true;
      const intros = COACHING_DATA.intro.map(c => c.text);
      const categoryTips = COACHING_DATA.endgame.map(c => c.text);
      const allTips = [...intros, ...categoryTips];
      const comment = pickRandomComment(allTips, lastCoachCommentRef.current);
      lastCoachCommentRef.current = comment;
      setCoachComment(comment);
    }
  }, [currentPosition, selectedBot, selectedCategory]);

  useEffect(() => {
    hasShownIntroRef.current = false;
    previousEvalRef.current = 0;
  }, [positionIndex]);

  useEffect(() => {
    if (isGameOver || !currentPosition || isThinking) return;
    
    const currentEval = evaluation;
    const prevEval = previousEvalRef.current;
    
    if (depth >= 8 && prevEval !== 0) {
      const evalChange = currentEval - prevEval;
      const playerExpectedPositive = playerColor === 'w';
      
      if ((playerExpectedPositive && evalChange < -2) || (!playerExpectedPositive && evalChange > 2)) {
        const blunders = COACHING_DATA.events.blunder.map(c => c.text);
        const comment = pickRandomComment(blunders, lastCoachCommentRef.current);
        lastCoachCommentRef.current = comment;
        setCoachComment(comment);
      } else if ((playerExpectedPositive && evalChange > 2) || (!playerExpectedPositive && evalChange < -2)) {
        const praises = COACHING_DATA.praise.map(c => c.text);
        const comment = pickRandomComment(praises, lastCoachCommentRef.current);
        lastCoachCommentRef.current = comment;
        setCoachComment(comment);
      }
    }
    
    if (depth >= 8) {
      previousEvalRef.current = currentEval;
    }
  }, [evaluation, depth, isGameOver, currentPosition, isThinking, playerColor]);

  const handleMove = (move: { from: string; to: string; promotion?: string }) => {
    if (!currentPosition || isGameOver || !isPlayerTurn) return false;

    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);

      if (!result) return false;

      const madeMove = result.from + result.to + (result.promotion || '');
      const wasOptimal = madeMove === bestMoveAtTurnRef.current;
      
      setMoveCount(prev => prev + 1);
      if (wasOptimal) {
        setOptimalMoves(prev => prev + 1);
        setFeedback({ type: 'success', message: 'Best move!' });
      } else if (bestMoveAtTurnRef.current) {
        try {
          const tempGame = new Chess(game.fen());
          const bestMoveObj = tempGame.move({
            from: bestMoveAtTurnRef.current.slice(0, 2),
            to: bestMoveAtTurnRef.current.slice(2, 4),
            promotion: bestMoveAtTurnRef.current[4] || undefined
          });
          const san = bestMoveObj?.san || bestMoveAtTurnRef.current;
          setFeedback({
            type: 'info',
            message: `Better was ${san} (eval: ${evaluation > 0 ? '+' : ''}${evaluation.toFixed(1)})`
          });
        } catch {
          setFeedback({ type: 'info', message: 'Not the engine\'s top choice.' });
        }
      }
      
      setGame(gameCopy);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleNext = () => {
    if (selectedCategory && positionIndex < selectedCategory.positions.length - 1) {
      setPositionIndex(prev => prev + 1);
    }
  };

  const handleRetry = () => {
    if (currentPosition) {
      setGame(new Chess(currentPosition.fen));
      setFeedback(null);
      setIsGameOver(false);
      setMoveCount(0);
      setOptimalMoves(0);
    }
  };

  const handleCategoryComplete = () => {
    if (selectedCategory) {
      markLessonComplete(`endgame-${selectedCategory.id}`);
      addActivity({
        type: 'lesson',
        itemId: selectedCategory.id,
        result: 'completed',
        details: `Completed ${completedPositions.size}/${selectedCategory.positions.length} positions`
      });
    }
    setSelectedBot(null);
    setSelectedCategory(null);
    setPositionIndex(0);
    setCompletedPositions(new Set());
  };

  // Coach Selection View
  if (!selectedCoach) {
    return (
      <div className="h-full w-full bg-[#0b0c10] flex flex-col p-6 overflow-hidden">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-black/20 backdrop-blur-xl border border-white/5 w-full max-w-5xl mx-auto h-full rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
        >
          <div className="bg-gradient-to-r from-redesign-glass-bg to-transparent p-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="size-16 rounded-2xl bg-redesign-cyan/20 flex items-center justify-center border border-redesign-cyan/30 text-redesign-cyan">
                <MessageCircle size={36} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Select Your Coach</h2>
                <p className="text-zinc-400 font-medium">Choose a grandmaster personality to guide your endgame mastery</p>
              </div>
            </div>
          </div>
 
          <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ENDGAME_COACHES.map((coach) => (
                <motion.button
                   key={coach.id}
                   whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.03)' }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => setSelectedCoach(coach)}
                   className="bg-white/[0.02] p-5 rounded-2xl text-left transition-all border border-white/5 hover:border-redesign-cyan/40 group relative overflow-hidden"
                >
                   <div className="absolute inset-0 bg-redesign-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="flex items-center gap-5 relative z-10">
                    <div className="size-16 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10" style={{ backgroundColor: coach.color + '20' }}>
                      <img src={coach.avatar} alt={coach.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://i.imgur.com/8Q5Z202.png'; }} />
                    </div>
                    <div className="flex-1">
                       <h3 className="font-black text-white text-xl group-hover:text-redesign-cyan">{coach.name}</h3>
                       <p className="text-zinc-500 text-sm font-medium mt-1">{coach.tagline}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Bot Selection View
  if (!selectedBot) {
    return (
      <div className="h-full w-full bg-[#0b0c10] flex flex-col p-6 overflow-hidden">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-black/20 backdrop-blur-xl border border-white/5 w-full max-w-5xl mx-auto h-full rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
        >
          <div className="bg-gradient-to-r from-redesign-glass-bg to-transparent p-8 border-b border-white/5 flex items-center gap-6">
            <button onClick={() => setSelectedCoach(null)} className="size-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5"><ChevronLeft className="text-zinc-400" size={24} /></button>
            <div className="size-16 rounded-2xl bg-redesign-cyan/20 flex items-center justify-center border border-redesign-cyan/30 text-redesign-cyan"><Users size={36} /></div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Practice Partner</h2>
              <p className="text-zinc-400 font-medium">Choose an opponent for your {selectedCoach.name} training session</p>
            </div>
          </div>
          <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ENDGAME_BOTS.map((bot) => (
                <motion.button key={bot.id} whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.03)' }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedBot(bot)} className="bg-white/[0.02] p-5 rounded-2xl text-left border border-white/5 hover:border-redesign-cyan/40 group relative overflow-hidden">
                   <div className="absolute inset-0 bg-redesign-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="flex items-center gap-5 relative z-10">
                    <div className="size-16 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10" style={{ backgroundColor: bot.color + '20' }}>
                      <img src={bot.avatar} alt={bot.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://i.imgur.com/8Q5Z202.png'; }} />
                    </div>
                    <div className="flex-1">
                       <h3 className="font-black text-white text-xl group-hover:text-redesign-cyan">{bot.name}</h3>
                       <p className="text-zinc-500 text-sm font-medium mt-1">{bot.tagline}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Category Selection View
  if (!selectedCategory) {
    return (
      <div className="h-full w-full bg-[#0b0c10] flex flex-col p-6 overflow-hidden">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-black/20 backdrop-blur-xl border border-white/5 w-full max-w-6xl mx-auto h-full rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
        >
          <div className="bg-gradient-to-r from-redesign-glass-bg to-transparent p-8 border-b border-white/5 flex items-center gap-6">
            <button onClick={() => setSelectedBot(null)} className="size-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5"><ChevronLeft className="text-zinc-400" size={24} /></button>
            <div className="size-16 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden" style={{ backgroundColor: selectedBot.color + '20' }}>
              <img src={selectedBot.avatar} alt={selectedBot.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://i.imgur.com/8Q5Z202.png'; }} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Endgame Mastery</h1>
              <p className="text-zinc-400 font-medium">Practicing vs {selectedBot.name} ({selectedBot.elo} ELO)</p>
            </div>
          </div>
          <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ENDGAME_CATEGORIES.map((category) => {
                const IconComponent = iconMap[category.icon] || Target;
                const difficultyColors = {
                  beginner: 'from-emerald-600/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30',
                  intermediate: 'from-amber-600/20 to-amber-500/5 text-amber-400 border-amber-500/30',
                  advanced: 'from-rose-600/20 to-rose-500/5 text-rose-400 border-rose-500/30'
                };
                return (
                  <motion.button key={category.id} onClick={() => setSelectedCategory(category)} className={`relative bg-gradient-to-br ${difficultyColors[category.difficulty as keyof typeof difficultyColors]} p-6 rounded-[1.5rem] text-left border hover:border-redesign-cyan/40 hover:shadow-2xl transition-all`}>
                     <div className="flex flex-col gap-4">
                      <div className="size-14 bg-black/40 rounded-2xl flex items-center justify-center border border-white/10"><IconComponent className="text-white" size={28} /></div>
                      <div>
                        <h3 className="font-black text-white text-xl mb-2">{category.title}</h3>
                        <p className="text-white/50 text-sm line-clamp-2 mb-4">{category.description}</p>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg">{category.difficulty}</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const accuracy = moveCount > 0 ? Math.round((optimalMoves / moveCount) * 100) : 100;

  // Practice View
  return (
    <div className="h-full w-full bg-[#0b010d] flex flex-col lg:flex-row overflow-hidden text-zinc-100">
      {/* LEFT: Board Section */}
      <div className="flex-1 flex flex-col min-h-[50vh] lg:min-h-0 relative bg-[color:var(--surface-primary,#0b1213)]">
        <div className="h-20 shrink-0 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => { setSelectedCategory(null); setPositionIndex(0); setCompletedPositions(new Set()); }} className="size-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 group">
                <ChevronLeft className="text-zinc-500 group-hover:text-white" size={20} />
              </button>
              <div>
                <h3 className="text-sm font-black text-zinc-100 uppercase tracking-widest">{selectedCategory!.title}</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Position {positionIndex + 1} of {selectedCategory!.positions.length}</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-redesign-cyan/10 border border-redesign-cyan/20 rounded-lg">
               <span className="text-[10px] font-black text-redesign-cyan uppercase tracking-widest">Engine Active</span>
            </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-0 lg:p-4">
          <div className="w-full max-w-[min(100vw,700px)] max-h-[58vh] aspect-square relative shadow-[0_0_60px_rgba(0,0,0,0.5)] lg:rounded-3xl overflow-hidden border border-transparent lg:border-white/5">
            <ChessBoard game={game} arePiecesDraggable={isPlayerTurn && !isGameOver && !isThinking} orientation={playerColor === 'w' ? 'white' : 'black'} onMove={(move) => handleMove(move)} colorScheme={colorScheme} />
            {isThinking && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-4 bg-[#0c0c0d]/80 px-8 py-6 rounded-3xl border border-white/10">
                  <div className="size-12 rounded-full border-4 border-redesign-cyan/20 border-t-redesign-cyan animate-spin" />
                  <p className="text-sm font-black text-zinc-100 uppercase tracking-widest">{selectedBot!.name} is thinking...</p>
                </div>
              </div>
            )}
            <AnimatePresence>
              {isGameOver && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-20 p-8">
                  <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0c0c0d] border border-white/10 p-8 rounded-[2.5rem] shadow-3xl text-center max-w-sm w-full">
                    <div className={`size-20 rounded-3xl mx-auto mb-6 flex items-center justify-center ${feedback?.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                      {feedback?.type === 'success' ? <Trophy size={48} /> : <AlertTriangle size={48} />}
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2 uppercase">{feedback?.type === 'success' ? 'Masterful!' : 'Game Over'}</h2>
                    <p className="text-zinc-400 text-sm mb-8 leading-relaxed">{feedback?.message}</p>
                    <div className="flex flex-col gap-3">
                      {feedback?.type === 'success' ? (
                        <button onClick={handleNext} className="w-full py-4 bg-redesign-cyan text-[#0b010d] font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">Next Position <ChevronRight size={20} /></button>
                      ) : (
                        <button onClick={handleRetry} className="w-full py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 flex items-center justify-center gap-2">Try Again <RotateCcw size={20} /></button>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="h-20 shrink-0 p-6 flex items-center justify-center gap-4">
           {!isGameOver && (
             <div className="flex items-center gap-4 bg-[#0c0c0d]/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 shadow-xl">
               <button onClick={handleRetry} className="flex items-center gap-2 text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"><RotateCcw size={16} /> Reset Position</button>
               <div className="w-px h-4 bg-white/10" />
               <div className="flex items-center gap-1.5">
                  <div className={`size-2 rounded-full ${isPlayerTurn ? 'bg-redesign-cyan animate-pulse shadow-[0_0_10px_rgba(0,255,200,0.5)]' : 'bg-zinc-700'}`} />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{isPlayerTurn ? 'Your Move' : "Opponent Move"}</span>
               </div>
             </div>
           )}
        </div>
      </div>

      {/* RIGHT: Info Sidebar */}
      <aside className="w-full lg:w-96 bg-[#0c0c0d] border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col relative z-10 shrink-0">
        <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="size-14 rounded-2xl bg-[#135bec]/20 flex items-center justify-center border border-[#135bec]/30 overflow-hidden">
                <img src={selectedCoach!.avatar || "/jakie_avi.png"} alt={selectedCoach!.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://i.imgur.com/8Q5Z202.png'; }} />
              </div>
              <div className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 rounded-full border-2 border-[#0c0c0d]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Coach {selectedCoach!.name}</h3>
              <p className="text-xs text-emerald-500 font-bold flex items-center gap-2 underline decoration-emerald-500/30">Active Coaching</p>
            </div>
          </div>
 
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Accuracy</p>
              <p className={`text-xl font-extrabold ${accuracy >= 80 ? 'text-emerald-500' : accuracy >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{accuracy}%</p>
            </div>
            <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Moves</p>
              <p className="text-xl font-extrabold text-zinc-100">{moveCount}</p>
            </div>
          </div>

          <div className="space-y-2">
             <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Progress</p>
                <p className="text-[10px] font-black text-zinc-100 uppercase tracking-widest">{completedPositions.size} / {selectedCategory!.positions.length}</p>
             </div>
             <div className="flex gap-1 h-1.5">
                {selectedCategory!.positions.map((_, idx) => (
                  <div key={idx} className={`h-full flex-1 rounded-full transition-all duration-500 ${completedPositions.has(idx) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : idx === positionIndex ? 'bg-amber-500 animate-pulse' : 'bg-white/10'}`} />
                ))}
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <CoachCommentary 
            coach={selectedCoach!}
            game={game}
            lastMove={game.history().length > 0 ? game.history()[game.history().length - 1] : undefined}
            mode="coaching"
            userColor={playerColor}
          />
          
          {feedback && (
            <div className="p-6 pt-0">
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`border rounded-2xl p-5 ${feedback.type === 'error' ? 'bg-rose-500/10 border-rose-500/20' : feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-[#135bec]/10 border-[#135bec]/20'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                   <BrainCircuit className="text-[#135bec]" size={14} />
                   <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Exercise Feedback</span>
                </div>
                <p className="text-sm text-zinc-300 italic">"{feedback.message}"</p>
              </motion.div>
            </div>
          )}

          <div className="p-6 pt-0 overflow-y-auto custom-scrollbar space-y-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                   <div className="size-8 rounded-lg bg-redesign-cyan/10 flex items-center justify-center border border-redesign-cyan/20"><Target className="text-redesign-cyan" size={18} /></div>
                   <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Objective</h4>
                </div>
                <p className="text-sm text-zinc-200 leading-relaxed font-medium">{currentPosition?.objective}</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-[#0c0c0d]">
           <div className="grid grid-cols-2 gap-3">
              <button onClick={handleRetry} className="py-3.5 bg-white/5 border border-white/10 text-zinc-300 font-black rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"><RotateCcw size={16} /> Retry</button>
              {isGameOver && selectedCategory && positionIndex === selectedCategory!.positions.length - 1 ? (
                <button onClick={handleCategoryComplete} className="py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-widest">Complete <Zap size={16} /></button>
              ) : (
                <button onClick={handleNext} disabled={!selectedCategory || positionIndex >= selectedCategory!.positions.length - 1} className={`py-3.5 font-black rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest ${!selectedCategory || positionIndex >= selectedCategory!.positions.length - 1 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-redesign-cyan text-[#0b010d] shadow-lg shadow-redesign-cyan/10'}`}>Next <ChevronRight size={16} /></button>
              )}
           </div>
        </div>
      </aside>
    </div>
  );
}
