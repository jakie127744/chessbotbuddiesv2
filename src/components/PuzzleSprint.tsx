'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Timer, Zap, Trophy, XCircle, Heart, Activity, Play, RotateCcw, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChessBoard } from './ChessBoard';
import { useBoardColorScheme } from '@/contexts/BoardColorSchemeContext';
import { useRewards } from '@/contexts/RewardsContext';
import { LICHESS_PUZZLES, LichessPuzzle, ThemeKey, PUZZLE_THEMES } from '@/lib/lichess-puzzles';

// --- Types ---

type SprintMode = '3min' | '5min' | '10min' | 'survival';

interface PuzzleSprintProps {
  onExit: () => void;
}

// --- Helpers ---

// Flatten all puzzles for easy filtering if needed, but we'll use themed lists primarily now
const ALL_PUZZLES: LichessPuzzle[] = Object.values(LICHESS_PUZZLES).flat();

const getPuzzleByDifficulty = (score: number, playedIds: Set<string>): LichessPuzzle => {
  let candidates: LichessPuzzle[] = [];

  // --- PROGRESSION LOGIC ---
  
  // Levels 1-5: Mate in 1 (Rating < 1000)
  if (score < 5) {
      candidates = LICHESS_PUZZLES['mateIn1'].filter(p => !playedIds.has(p.id) && p.rating < 1000);
      if (candidates.length === 0) candidates = LICHESS_PUZZLES['mateIn1'].filter(p => !playedIds.has(p.id)); // Fallback to any mate in 1
  }
  // Levels 6-10: Mate in 2 (Rating < 1200)
  else if (score < 10) {
      candidates = LICHESS_PUZZLES['mateIn2'].filter(p => !playedIds.has(p.id) && p.rating < 1200);
      if (candidates.length === 0) candidates = LICHESS_PUZZLES['mateIn2'].filter(p => !playedIds.has(p.id));
  }
  // Levels 11-15: Forks (Rating < 1400)
  else if (score < 15) {
      candidates = LICHESS_PUZZLES['fork'].filter(p => !playedIds.has(p.id) && p.rating < 1400);
      if (candidates.length === 0) candidates = LICHESS_PUZZLES['fork'].filter(p => !playedIds.has(p.id));
  }
  // Levels 16+: General difficulty scaling
  else {
      let minRating = 0;
      let maxRating = 3000;

      if (score < 20) { minRating = 1000; maxRating = 1300; }
      else if (score < 30) { minRating = 1300; maxRating = 1600; }
      else if (score < 40) { minRating = 1600; maxRating = 1900; }
      else if (score < 50) { minRating = 1900; maxRating = 2200; }
      else { minRating = 2200; }

      candidates = ALL_PUZZLES.filter(p => !playedIds.has(p.id) && p.rating >= minRating && p.rating <= maxRating);
      
      // Fallback: Widen search
      if (candidates.length === 0) {
          candidates = ALL_PUZZLES.filter(p => !playedIds.has(p.id) && p.rating >= minRating - 300);
      }
  }

  // Absolute fallback
  if (candidates.length === 0) {
      candidates = ALL_PUZZLES.filter(p => !playedIds.has(p.id));
  }
  if (candidates.length === 0) {
      candidates = ALL_PUZZLES; // Allow repeats if literally everything is played
  }

  // Sort by rating to ensure strict "harder as they go" within the bracket?
  // User asked: "make it harder on the next one"
  // So we should pick the lowest rating from the candidates that satisfies 'harder than current'?
  // Or just pick random from the 'harder' pool.
  // Random from pool is better for replayability, but the pool itself shifts up.
  
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
};

export function PuzzleSprint({ onExit }: PuzzleSprintProps) {
  // --- State ---
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [mode, setMode] = useState<SprintMode>('5min');
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [currentPuzzle, setCurrentPuzzle] = useState<LichessPuzzle | null>(null);
  const [game, setGame] = useState<Chess>(new Chess());
  const [playedIds, setPlayedIds] = useState<Set<string>>(new Set());
  const [moveIndex, setMoveIndex] = useState(0); // Track progress within current puzzle
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [highScore, setHighScore] = useState(0); // Session high score
  
  // Derived player color
  // Lichess Puzzles: FEN is 'w' to move -> Opponent (White) moves, Player (Black) responds.
  // So Player Color is opposite of FEN turn.
  // HOWEVER, we already made the first move in loadNextPuzzle!
  // So game.turn() inside the component *is* the player's turn.
  const playerColor = game.turn() === 'w' ? 'white' : 'black';

  const { colorScheme } = useBoardColorScheme();
  const { addXp, checkGameEndAchievements, markMinigameComplete } = useRewards();

  // --- Refs ---
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Game Loop ---

  const startGame = (selectedMode: SprintMode) => {
    setMode(selectedMode);
    setScore(0);
    setStrikes(0);
    setPlayedIds(new Set());
    setHighScore(Math.max(highScore, score)); 
    setGameState('playing');
    
    // Set Time
    switch (selectedMode) {
        case '3min': setTimeLeft(3 * 60); break;
        case '5min': setTimeLeft(5 * 60); break;
        case '10min': setTimeLeft(10 * 60); break;
        case 'survival': setTimeLeft(0); break; 
    }

    loadNextPuzzle(0, new Set());
  };

  const loadNextPuzzle = (currentScore: number, currentPlayed: Set<string>) => {
    const puzzle = getPuzzleByDifficulty(currentScore, currentPlayed);
    setCurrentPuzzle(puzzle);
    setMoveIndex(0);
    setFeedback(null);
    
    // Initialize game
    const newGame = new Chess(puzzle.fen);
    
    // Auto-Play Move 0 (Opponent Blunder)
    if (puzzle.moves && puzzle.moves.length > 1) {
         const m0 = puzzle.moves[0];
         try {
             newGame.move({ 
                 from: m0.slice(0, 2), 
                 to: m0.slice(2, 4), 
                 promotion: m0.length > 4 ? m0[4] : undefined 
             });
             setMoveIndex(1);
         } catch(e) {
             console.warn("PuzzleSprint auto-play failed", e);
         }
    } else {
        setMoveIndex(0);
    }

    setGame(newGame);
    // Puzzle FENs in our DB are "to move" positions, no setup needed.
    
    setPlayedIds(prev => new Set(prev).add(puzzle.id));
  };

  const endGame = useCallback(() => {
     if (timerRef.current) clearInterval(timerRef.current);
     setGameState('gameover');
     
     // Rewards
     const xpEarned = score * 5 + (mode === 'survival' ? 50 : 20);
     addXp(xpEarned);
     markMinigameComplete('puzzle-sprint', score);
  }, [score, mode, addXp]);

  // Timer Effect
  useEffect(() => {
    if (gameState === 'playing' && mode !== 'survival') {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, mode, endGame]);

  // --- Interaction ---

  const handleMove = (moveInfo: { from: string; to: string; promotion?: string }) => {
    if (gameState !== 'playing' || !currentPuzzle) return false;

    // Create temp game to validate legality
    const tempGame = new Chess(game.fen());
    try {
        const move = tempGame.move(moveInfo);
        if (!move) return false; // Illegal move
    } catch {
        return false;
    }

    // Check correctness
    // puzzle.moves Structure: [PlayerMove1, OpponentReply1, PlayerMove2, OpponentReply2...]
    
    const targetMoveIndex = moveIndex * 2;
    const expectedMove = currentPuzzle.moves[targetMoveIndex];
    
    const playedMoveUci = moveInfo.from + moveInfo.to + (moveInfo.promotion || '');
    
    if (playedMoveUci === expectedMove) {
        // Correct Move
        const newGame = new Chess(game.fen());
        newGame.move(moveInfo);
        setGame(newGame);
        setFeedback('correct');

        // Check if puzzle is done
        // We need opponent response (index + 1) AND next player move (index + 2) to continue?
        // Or if there is just an opponent response left? Usually puzzles end with player move.
        // If there is an opponent response, we must play it.
        
        if (targetMoveIndex + 1 < currentPuzzle.moves.length) {
            // Puzzle continues - Play Opponent Move
            setTimeout(() => {
                const oppMoveStr = currentPuzzle.moves[targetMoveIndex + 1];
                const g = new Chess(newGame.fen());
                g.move({
                    from: oppMoveStr.slice(0, 2),
                    to: oppMoveStr.slice(2, 4),
                    promotion: oppMoveStr.length > 4 ? oppMoveStr[4] : undefined
                });
                setGame(g);
                setMoveIndex(prev => prev + 1);
                setFeedback(null);
            }, 500);
        } else {
            // Puzzle Solved!
            setScore(s => s + 1);
            // Delay slightly then load next
            setTimeout(() => {
                loadNextPuzzle(score + 1, playedIds);
            }, 500);
        }
        return true;
    } else {
        // Wrong Move
        const newStrikes = strikes + 1;
        setStrikes(newStrikes);
        setFeedback('wrong');
        
        if (newStrikes >= 3) {
            endGame();
        } else {
            // Move to next puzzle on fail
            setTimeout(() => {
                loadNextPuzzle(score, playedIds);
            }, 800);
        }
        
        return false; 
    }
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- Renders ---

  if (gameState === 'menu') {
      return (
          <div className="flex flex-col items-center justify-center h-full p-6 bg-slate-900 text-white animate-fade-in">
              <div className="mb-8 text-center">
                  <div className="flex justify-center mb-4">
                      <Zap size={64} className="text-yellow-400" />
                  </div>
                  <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                      PUZZLE SPRINT
                  </h1>
                  <p className="text-slate-400 text-lg">Race against the clock and solve as many tactics as you can!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
                  <button 
                    onClick={() => startGame('5min')}
                    className="group relative overflow-hidden bg-slate-800 p-8 rounded-2xl border-2 border-slate-700 hover:border-yellow-500 transition-all hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                  >
                      <div className="absolute top-0 right-0 p-4 opacity-50 font-black text-6xl text-slate-800 group-hover:text-yellow-500/10 transition-colors">5</div>
                      <h3 className="text-2xl font-bold mb-2 text-yellow-400">5 Minutes</h3>
                      <p className="text-slate-400 text-sm">Balanced speed run. The classic test.</p>
                  </button>

                  <button 
                    onClick={() => startGame('10min')}
                    className="group relative overflow-hidden bg-slate-800 p-8 rounded-2xl border-2 border-slate-700 hover:border-blue-500 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  >
                      <div className="absolute top-0 right-0 p-4 opacity-50 font-black text-6xl text-slate-800 group-hover:text-blue-500/10 transition-colors">10</div>
                      <h3 className="text-2xl font-bold mb-2 text-blue-400">10 Minutes</h3>
                      <p className="text-slate-400 text-sm">Endurance run. Test your stamina.</p>
                  </button>

                  <button 
                    onClick={() => startGame('survival')}
                    className="group relative overflow-hidden bg-slate-800 p-8 rounded-2xl border-2 border-slate-700 hover:border-red-500 transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  >
                      <div className="absolute top-0 right-0 p-4 opacity-50 font-black text-6xl text-slate-800 group-hover:text-red-500/10 transition-colors">∞</div>
                      <h3 className="text-2xl font-bold mb-2 text-red-500">Survival</h3>
                      <p className="text-slate-400 text-sm">No time limit. 3 strikes and you're out.</p>
                  </button>
              </div>

              <button onClick={onExit} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <Home size={20} />
                  Return to Menu
              </button>
          </div>
      );
  }

  if (gameState === 'gameover') {
    return (
        <div className="flex flex-col items-center justify-center h-full p-6 bg-slate-900 text-white animate-fade-in relative overflow-hidden">
             {/* Background Effects */}
             <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 z-0"></div>
             
             <div className="z-10 text-center max-w-lg w-full">
                 <div className="mb-8 relative inline-block">
                    <Trophy size={80} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                 </div>
                 
                 <h2 className="text-5xl font-black mb-2 text-white">Time's Up!</h2>
                 <div className="text-2xl text-slate-400 mb-10">Final Score: <span className="text-yellow-400 font-bold">{score}</span></div>

                 <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-700">
                     <div className="grid grid-cols-2 gap-8 text-center">
                         <div>
                             <div className="text-slate-400 text-sm uppercase tracking-wider mb-1">Mode</div>
                             <div className="text-xl font-bold">{mode === 'survival' ? 'Survival' : mode}</div>
                         </div>
                         <div>
                             <div className="text-slate-400 text-sm uppercase tracking-wider mb-1">XP Earned</div>
                             <div className="text-xl font-bold text-purple-400">+{score * 5 + 20}</div>
                         </div>
                     </div>
                 </div>

                 <div className="flex gap-4 justify-center">
                     <button 
                        onClick={() => startGame(mode)}
                        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold px-8 py-3 rounded-xl transition-all hover:scale-105"
                     >
                         <RotateCcw size={20} />
                         Play Again
                     </button>
                     <button 
                        onClick={() => setGameState('menu')}
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold px-8 py-3 rounded-xl transition-all"
                     >
                         <Home size={20} />
                         Menu
                     </button>
                 </div>
             </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full bg-slate-950 text-white">
        {/* Sidebar / Info */}
        <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800 flex flex-col p-6">
            <div className="mb-8">
                 <button onClick={onExit} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm">
                    <Home size={16} /> Exit Sprint
                 </button>
                 
                 <h2 className="text-2xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-1">
                     PUZZLE SPRINT
                 </h2>
                 <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{mode === 'survival' ? 'Survival Mode' : `${mode} Blitz`}</div>
            </div>

            {/* Score Card */}
            <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700 shadow-xl">
                 <div className="flex items-end justify-between mb-2">
                     <span className="text-slate-400 font-bold text-sm uppercase">Score</span>
                     <Trophy size={20} className="text-yellow-500" />
                 </div>
                 <div className="text-5xl font-black text-white">{score}</div>
            </div>

            {/* Timer */}
            {mode !== 'survival' && (
                <div className={`bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700 shadow-xl ${timeLeft <= 10 ? 'animate-pulse border-red-500/50' : ''}`}>
                    <div className="flex items-end justify-between mb-2">
                        <span className="text-slate-400 font-bold text-sm uppercase">Time Left</span>
                        <Timer size={20} className={timeLeft <= 30 ? 'text-red-500' : 'text-blue-500'} />
                    </div>
                    <div className={`text-4xl font-mono font-bold ${timeLeft <= 30 ? 'text-red-400' : 'text-blue-400'}`}>
                        {formatTime(timeLeft)}
                    </div>
                </div>
            )}

            {/* Strikes */}
            <div className="mb-auto">
                <div className="text-slate-400 font-bold text-sm uppercase mb-3">Strikes</div>
                <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className={`h-12 flex-1 rounded-xl flex items-center justify-center border-2 transition-all ${
                            i < strikes 
                            ? 'bg-red-500/20 border-red-500 text-red-500' 
                            : 'bg-slate-800 border-slate-700 text-slate-700'
                        }`}>
                            <XCircle size={24} className={i < strikes ? 'fill-red-500/20' : ''} />
                        </div>
                    ))}
                </div>
                <div className="text-xs text-slate-500 mt-2 text-center">3 strikes and game over</div>
            </div>
        </div>

        {/* Board Area */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-10 relative overflow-hidden bg-slate-950">
            <div className="max-w-[80vh] w-full aspect-square relative z-10">
                 <ChessBoard 
                    game={game}
                    onMove={handleMove}
                    orientation={playerColor} 
                    arePiecesDraggable={gameState === 'playing'}
                    colorScheme={colorScheme}

                 />
                 
                 {/* Feedback Overlay */}
                 <AnimatePresence>
                     {feedback === 'correct' && (
                         <motion.div 
                             initial={{ opacity: 0, scale: 0.5 }}
                             animate={{ opacity: 1, scale: 1.2 }}
                             exit={{ opacity: 0 }}
                             className="absolute inset-0 pointer-events-none flex items-center justify-center z-50"
                         >
                             <div className="text-green-400 font-black text-6xl drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                                 <Zap size={120} className="fill-green-400 stroke-white stroke-2" />
                             </div>
                         </motion.div>
                     )}
                     {feedback === 'wrong' && (
                         <motion.div 
                             initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                             animate={{ opacity: 1, scale: 1, rotate: 0 }}
                             exit={{ opacity: 0 }}
                             className="absolute inset-0 pointer-events-none flex items-center justify-center z-50"
                         >
                             <div className="text-red-500 font-black text-6xl drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                                 <XCircle size={120} className="fill-red-500/20 stroke-red-500 stroke-[3]" />
                             </div>
                         </motion.div>
                     )}
                 </AnimatePresence>
            </div>
            
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black"></div>
        </div>
    </div>
  );
}
