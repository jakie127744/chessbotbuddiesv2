'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Target, Flame, Trophy, Lightbulb, SkipForward, RotateCcw, Microscope, GraduationCap, ChevronRight } from 'lucide-react';
import ChessBoard from './ChessBoard';
import { ThemeKey, PUZZLE_THEMES, getRandomPuzzleAsync, getPuzzlesByThemeAsync } from '../lib/puzzle-types';
import { ChessPuzzle } from '../lib/types';
import { usePuzzleLogic } from '../hooks/usePuzzleLogic';
import { Chess } from 'chess.js';
import { useRewards } from '../contexts/RewardsContext';

interface PuzzleTrainerProps {
  initialTheme?: ThemeKey | 'mixed';
}

const adaptPuzzle = (lp: any): ChessPuzzle => {
  const game = new Chess(lp.fen);
  return {
    id: lp.id,
    fen: lp.fen,
    moves: lp.moves,
    rating: lp.rating,
    theme: lp.themes[0] as any, 
    description: PUZZLE_THEMES[lp.themes[0] as ThemeKey]?.name || 'Chess Puzzle',
    playerColor: game.turn(),
  };
};

export function PuzzleTrainer({ initialTheme = 'mixed' }: PuzzleTrainerProps) {
  const [currentPuzzle, setCurrentPuzzle] = useState<ChessPuzzle | null>(null);
  const [streak, setStreak] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);
   const [selectedTheme, setSelectedTheme] = useState<ThemeKey | 'mixed'>(initialTheme);
  const [isLoading, setIsLoading] = useState(false);
   const [showResult, setShowResult] = useState<'success' | 'failure' | null>(null);
   const [hintSquares, setHintSquares] = useState<string[]>([]);
  const { checkPuzzleComplete } = useRewards();

    const loadPuzzle = async (theme: ThemeKey | 'mixed' = 'mixed') => {
      setSelectedTheme(theme);
    setIsLoading(true);
    setShowResult(null);
      setHintSquares([]);
    try {
      let lp;
      if (theme === 'mixed') {
        lp = await getRandomPuzzleAsync();
      } else {
        const candidates = await getPuzzlesByThemeAsync(theme, 50);
        lp = candidates[Math.floor(Math.random() * candidates.length)];
      }
      if (lp) setCurrentPuzzle(adaptPuzzle(lp));
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

   const { game, validateMove, isComplete, isFailed, resetPuzzle, getHint, hintsUsed, maxHints } = usePuzzleLogic({
    puzzle: currentPuzzle,
    onPuzzleSolved: () => {
      setStreak(s => s + 1);
      setTotalSolved(t => t + 1);
      setShowResult('success');
      checkPuzzleComplete(currentPuzzle?.theme);
    },
    onPuzzleFailed: () => {
      setStreak(0);
      setShowResult('failure');
    }
  });

  useEffect(() => {
    loadPuzzle(initialTheme);
  }, [initialTheme]);

   const hintHighlights = useMemo(() => {
      if (!hintSquares.length) return undefined;
      return hintSquares.reduce<Record<string, { highlightColor: string }>>((acc, square) => {
         acc[square] = { highlightColor: 'rgba(255, 199, 44, 0.28)' };
         return acc;
      }, {});
   }, [hintSquares]);

   const handleHint = () => {
      if (!getHint) return;
      const hint = getHint();
      if (!hint) return;
      setHintSquares([hint.from, hint.to]);
      setTimeout(() => setHintSquares([]), 2400);
   };

   const handleRedo = () => {
      setShowResult(null);
      setHintSquares([]);
      resetPuzzle();
   };

   return (
      <div className="h-full flex flex-col lg:flex-row gap-0 lg:gap-4 animate-in fade-in zoom-in-95 duration-500">
      {/* LEFT: Puzzle Board */}
            <div className="flex-1 flex flex-col min-h-[70vh] lg:min-h-0 relative">
                <div className="flex-1 flex items-center justify-center p-0 lg:p-2">
                   <div className="w-full max-w-[min(100vw,700px)] max-h-[58vh] aspect-square relative shadow-[0_0_40px_rgba(0,0,0,0.35)] rounded-none lg:rounded-xl overflow-hidden group border border-transparent lg:border-redesign-glass-border flex justify-center items-center">
                     {currentPuzzle && game && (
                        <ChessBoard 
                              game={game}
                              onMove={validateMove}
                              orientation={currentPuzzle.playerColor === 'w' ? 'white' : 'black'}
                              customSquares={hintHighlights}
                        />
                     )}
              
              {/* Overlay Feedback */}
              {showResult === 'success' && (
                <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
                   <div className="bg-emerald-500 text-white px-8 py-4 rounded-3xl shadow-2xl scale-110 animate-bounce">
                      <Trophy size={48} className="mx-auto mb-2" />
                      <p className="text-2xl font-black">SOLVED!</p>
                   </div>
                </div>
              )}
              {showResult === 'failure' && (
                <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
                   <div className="bg-red-500 text-white px-8 py-4 rounded-3xl shadow-2xl">
                      <p className="text-2xl font-black">WRONG MOVE</p>
                   </div>
                </div>
              )}
              {isLoading && (
                 <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="w-12 h-12 border-4 border-redesign-cyan border-t-transparent rounded-full animate-spin" />
                 </div>
              )}
           </div>
        </div>

        {/* Action Bar */}
      <div className="px-4 py-2.5 bg-redesign-glass-bg border border-redesign-glass-border rounded-2xl flex items-center justify-between mt-3">
           <div className="flex items-center gap-3">
                     <button 
                        onClick={handleRedo}
                        className="p-2.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        title="Redo puzzle"
                     >
                        <RotateCcw size={20} />
                     </button>
           </div>
           
           <div className="flex items-center gap-2.5">
                     <button 
                        onClick={handleHint}
                        disabled={!currentPuzzle || hintsUsed >= maxHints || isLoading}
                        className="px-5 py-2 bg-zinc-800 text-zinc-200 rounded-xl text-sm font-bold hover:bg-zinc-700 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={hintsUsed >= maxHints ? 'No hints remaining' : 'Show the next move'}
                     >
                         <Lightbulb size={18} /> Hint ({hintsUsed}/{maxHints})
                     </button>
              <button 
                onClick={() => loadPuzzle(initialTheme)}
                className="px-5 py-2 bg-redesign-cyan/10 text-redesign-cyan border border-redesign-cyan/20 rounded-xl text-sm font-bold hover:bg-redesign-cyan/20 transition-all flex items-center gap-2"
              >
                 Next <SkipForward size={18} />
              </button>
           </div>
        </div>
      </div>

      {/* RIGHT: Stats & Theme Selector */}
      <div className="w-full lg:w-[320px] flex flex-col gap-3">
         {/* HUD Cards */}
         <div className="grid grid-cols-2 gap-3">
            <div className="bg-redesign-glass-bg border border-redesign-glass-border rounded-2xl p-4 flex flex-col items-center justify-center text-center">
               <Flame className="text-orange-500 mb-1" size={28} />
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Current Streak</p>
               <p className="text-2xl font-black text-white">{streak}</p>
            </div>
            <div className="bg-redesign-glass-bg border border-redesign-glass-border rounded-2xl p-4 flex flex-col items-center justify-center text-center">
               <Trophy className="text-yellow-500 mb-1" size={28} />
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Total Solved</p>
               <p className="text-2xl font-black text-white">{totalSolved}</p>
            </div>
         </div>

         {/* Current Puzzle Info */}
         <div className="bg-redesign-glass-bg border border-redesign-glass-border rounded-2xl p-4">
            <h3 className="text-base font-black text-white mb-2">{currentPuzzle?.description || 'Daily Training'}</h3>
            <div className="flex items-center gap-2 flex-wrap">
               <span className="px-3 py-1 bg-redesign-cyan/10 text-redesign-cyan border border-redesign-cyan/20 rounded-full text-[10px] font-bold uppercase">{currentPuzzle?.theme || 'Mixed'}</span>
               <span className="px-3 py-1 bg-zinc-800 text-zinc-400 border border-white/5 rounded-full text-[10px] font-bold uppercase">Rating: {currentPuzzle?.rating || '????'}</span>
            </div>
         </div>

         {/* Theme Selector (old app style) */}
         <div className="flex-1 bg-redesign-glass-bg border border-redesign-glass-border rounded-2xl p-3 flex flex-col overflow-hidden">
            <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-3 px-1">Select Theme</h4>
            <div className="grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar pr-1">
               {(['mixed', ...Object.keys(PUZZLE_THEMES)] as (ThemeKey | 'mixed')[]).map((theme) => {
                  const isActive = selectedTheme === theme;
                  const data = theme === 'mixed' ? null : PUZZLE_THEMES[theme as ThemeKey];
                  return (
                     <button
                       key={theme}
                       onClick={() => loadPuzzle(theme)}
                       className={`w-full px-3 py-2 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                         isActive
                           ? 'bg-redesign-cyan/15 border-redesign-cyan/40 text-white shadow-[0_0_0_1px_rgba(0,255,200,0.2)]'
                           : 'bg-white/5 border-white/5 text-zinc-200 hover:border-redesign-cyan/25 hover:bg-redesign-cyan/5'
                       }`}
                     >
                       <div className="flex items-center gap-2">
                          {data?.icon && <span className="text-sm">{data.icon}</span>}
                          <div>
                             <p className="text-[13px] font-bold leading-tight">{theme === 'mixed' ? 'Mixed' : data?.name || theme}</p>
                             <p className="text-[10px] text-zinc-500 leading-tight">{theme === 'mixed' ? 'Blend of themes' : 'Pattern practice'}</p>
                          </div>
                       </div>
                       <ChevronRight size={16} className={isActive ? 'text-redesign-cyan' : 'text-zinc-600'} />
                     </button>
                  );
               })}
            </div>
         </div>
      </div>
    </div>
  );
}
