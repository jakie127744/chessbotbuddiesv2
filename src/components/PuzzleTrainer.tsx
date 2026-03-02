'use client';

import { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from './ChessBoard';
import { useBoardColorScheme } from '@/contexts/BoardColorSchemeContext';
import { 
  LichessPuzzle, 
  PUZZLE_THEMES, 
  ThemeKey,
  getPuzzlesByThemeAsync,
  getRandomPuzzleAsync,
  getPuzzlesByRatingAsync
} from '@/lib/puzzle-types';
import { ChessPuzzle } from '@/lib/types'; // Keep interface for compatibility
import { usePuzzleLogic } from '@/hooks/usePuzzleLogic';
import { useStockfish } from '@/hooks/useStockfish';
import { getDuePuzzles, updatePuzzleReview } from '@/lib/spaced-repetition';
import { Lightbulb, RotateCcw, SkipForward, Trophy, Flame, Target, X, Upload, Brain, Filter, Loader2, Swords } from 'lucide-react';
import { useRewards } from '@/contexts/RewardsContext';

interface PuzzleTrainerProps {
  onClose?: () => void;
  initialTheme?: ThemeKey | 'mixed' | 'custom' | 'spaced-repetition';
  children?: React.ReactNode;
}

// Adapt LichessPuzzle to match what usePuzzleLogic expects (ChessPuzzle interface)
const adaptPuzzle = (lp: LichessPuzzle): ChessPuzzle => {
  const game = new Chess(lp.fen);
  return {
    id: lp.id,
    fen: lp.fen,
    moves: lp.moves,
    rating: lp.rating,
    theme: lp.themes[0] as any, 
    description: PUZZLE_THEMES[lp.themes[0] as ThemeKey]?.name || 'Chess Puzzle',
    playerColor: game.turn(), // FEN is now "Player to Move"
  };
};

export function PuzzleTrainer({ onClose, initialTheme = 'mixed', children }: PuzzleTrainerProps) {
  const [currentPuzzle, setCurrentPuzzle] = useState<ChessPuzzle | null>(null);
  const [streak, setStreak] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey | 'mixed' | 'custom' | 'spaced-repetition'>(initialTheme);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [hintHighlight, setHintHighlight] = useState<{ from: string; to: string } | null>(null);
  const [isLoadingPuzzle, setIsLoadingPuzzle] = useState(false);
  
  // Custom Mode State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [fenInput, setFenInput] = useState('');
  const [customPuzzles, setCustomPuzzles] = useState<string[]>([]);
  const [customGame, setCustomGame] = useState<Chess | null>(null);
  const [isEngineThinking, setIsEngineThinking] = useState(false);
  const isCustomMode = selectedTheme === 'custom';
  
  const { checkPuzzleComplete, addActivity } = useRewards();
  const { colorScheme } = useBoardColorScheme();

  // Hooks
  const { 
    game: standardGame, 
    validateMove, 
    getHint, 
    isComplete, 
    isFailed,
    hintsUsed,
    maxHints,
    resetPuzzle
  } = usePuzzleLogic({
    puzzle: (currentPuzzle && !isCustomMode) ? currentPuzzle : null,
    onPuzzleSolved: () => {
        setStreak(s => s + 1);
        setTotalSolved(t => t + 1);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        
        // Add Rewards
        checkPuzzleComplete(currentPuzzle?.theme); 

        // Log Activity
        if (currentPuzzle) {
            addActivity({
                type: 'puzzle',
                itemId: currentPuzzle.id,
                result: 'win',
                details: `Rating: ${currentPuzzle.rating}, Theme: ${currentPuzzle.theme}`
            });
        }
        
        if (currentPuzzle && !isCustomMode) {
            const quality = hintsUsed === 0 ? 5 : 3;
            updatePuzzleReview(currentPuzzle.id, quality);
        }
    },
    onPuzzleFailed: () => {
        setStreak(0);
        setShowFailure(true);
        setTimeout(() => setShowFailure(false), 2000);

        // Log Activity
        if (currentPuzzle) {
            addActivity({
                type: 'puzzle',
                itemId: currentPuzzle.id,
                result: 'loss',
                details: `Rating: ${currentPuzzle.rating}`
            });
        }
        
        if (currentPuzzle && !isCustomMode) {
            updatePuzzleReview(currentPuzzle.id, 0);
        }
    }
  });

  const shouldEnableStockfish = isCustomMode && !!customGame && customGame.turn() !== (currentPuzzle?.playerColor || 'w');
  const { bestMove } = useStockfish(customGame?.fen() || '', shouldEnableStockfish);
  
  const activeGame = isCustomMode ? customGame : standardGame;

  useEffect(() => {
    if (isCustomMode && bestMove && customGame && shouldEnableStockfish) {
        if (bestMove.length < 4) return;
        const from = bestMove.substring(0, 2);
        const to = bestMove.substring(2, 4);
        const promotion = bestMove.length > 4 ? bestMove[4] : undefined;
        
        try {
            const newGame = new Chess(customGame.fen());
            try {
                const result = newGame.move({ from, to, promotion });
                if (result) {
                   setCustomGame(newGame);
                }
            } catch (e) {
                // Ignore invalid moves
            }
        } catch (e) {
            console.error("Engine move error", e);
        }
    }
  }, [bestMove, isCustomMode, customGame, shouldEnableStockfish]);

  async function loadNewPuzzle(themeOverride?: ThemeKey | 'mixed' | 'custom' | 'spaced-repetition', difficultyOverride?: 'all' | 'easy' | 'medium' | 'hard') {
    const theme = themeOverride !== undefined ? themeOverride : selectedTheme;
    const diff = difficultyOverride !== undefined ? difficultyOverride : selectedDifficulty;

    if (theme === 'custom') {
        if (customPuzzles.length === 0) {
            setIsImportModalOpen(true);
            return;
        }
        
        const nextFen = customPuzzles[0]; 
        const remaining = customPuzzles.slice(1);
        setCustomPuzzles(remaining);

        if (!nextFen) return;

        const tempGame = new Chess(nextFen);
        const playerColor = tempGame.turn(); 
        
        const customPuzzleObj: ChessPuzzle = {
            id: 'custom-' + Date.now(),
            fen: nextFen,
            moves: [], 
            rating: 0,
            theme: 'custom',
            playerColor: playerColor, 
            description: 'Custom Position vs Stockfish'
        };

        setCurrentPuzzle(customPuzzleObj);
        setCustomGame(new Chess(nextFen));
        setShowSuccess(false);
        setShowFailure(false);
        setHintHighlight(null);
    } else if (theme === 'spaced-repetition') {
        setIsLoadingPuzzle(true);
        const lp = await getRandomPuzzleAsync();
        setIsLoadingPuzzle(false);
        if (lp) {
          setCurrentPuzzle(adaptPuzzle(lp));
        }
        setHintHighlight(null);
        setCustomGame(null);
    } else {
        setIsLoadingPuzzle(true);
        let candidates: LichessPuzzle[] = [];
        
        // Get rating range based on difficulty
        let minRating = 0, maxRating = 3000;
        if (diff === 'easy') { minRating = 0; maxRating = 1000; }
        else if (diff === 'medium') { minRating = 1000; maxRating = 1300; }
        else if (diff === 'hard') { minRating = 1300; maxRating = 3000; }
        
        if (theme === 'mixed') {
             // Get puzzles from random themes
             const themes = Object.keys(PUZZLE_THEMES) as ThemeKey[];
             const randomTheme = themes[Math.floor(Math.random() * themes.length)];
             candidates = await getPuzzlesByRatingAsync(minRating, maxRating, randomTheme, 50);
        } else {
             candidates = await getPuzzlesByThemeAsync(theme as ThemeKey, 100);
             // Filter by rating
             if (diff !== 'all') {
               candidates = candidates.filter(p => p.rating >= minRating && p.rating <= maxRating);
             }
        }

        setIsLoadingPuzzle(false);

        let lp: LichessPuzzle | null = null;
        if (candidates.length > 0) {
            lp = candidates[Math.floor(Math.random() * candidates.length)];
        } else {
            // Fallback if no puzzles match criteria
            lp = await getRandomPuzzleAsync(); 
        }
        
        if (lp) {
            setCurrentPuzzle(adaptPuzzle(lp));
        }
        setHintHighlight(null);
        setCustomGame(null); 
    }
  }

  function handleImportFens() {
      const fens = fenInput.split('\n').map(s => s.trim()).filter(s => s);
      if (fens.length > 0) {
          setCustomPuzzles(fens);
          setSelectedTheme('custom');
          // Load first one immediately
          setTimeout(() => {
            const nextFen = fens[0];
            const remaining = fens.slice(1);
            setCustomPuzzles(remaining);
            
            const tempGame = new Chess(nextFen);
            const playerColor = tempGame.turn();

            const customPuzzleObj: ChessPuzzle = {
                id: 'custom-' + Date.now(),
                fen: nextFen,
                moves: [],
                rating: 0,
                theme: 'custom', 
                playerColor: playerColor,
                description: 'Custom Position vs Stockfish'
            };
            setCurrentPuzzle(customPuzzleObj);
            setCustomGame(new Chess(nextFen));
            setIsImportModalOpen(false);
            setFenInput('');
          }, 0);
      }
  }

  function handleMove(move: { from: string; to: string; promotion?: string }) {
    if (!currentPuzzle) return false;

    if (isCustomMode) {
        if (!customGame) return false;
        try {
            const tempGame = new Chess(customGame.fen());
            const result = tempGame.move(move);
            if (result) {
                setCustomGame(tempGame);
                return true;
            }
        } catch (e) {
            return false;
        }
        return false;
    }

    if (isComplete || isFailed) return false;
    if (standardGame && standardGame.turn() !== currentPuzzle.playerColor) return false;

    const success = validateMove(move);
    return success;
  }

  function handleHint() {
    if (isCustomMode) return; 
    const hint = getHint();
    if (hint) {
      setHintHighlight(hint);
      setTimeout(() => setHintHighlight(null), 3000);
    }
  }

  function handleSkip() {
    setStreak(0);
    loadNewPuzzle();
  }

  function handleNext() {
    loadNewPuzzle();
  }
  
  // Clean up
  useEffect(() => {
    return () => {
    };
  }, []);

  useEffect(() => {
    if (!currentPuzzle && !isCustomMode && !isImportModalOpen) {
        loadNewPuzzle(initialTheme);
    }
  }, [initialTheme]);

  if (!currentPuzzle || !activeGame) {
    if (isImportModalOpen) {
         // Render normally to show modal
    } else if (isCustomMode && customPuzzles.length === 0 && !customGame) {
         if (!isImportModalOpen) {
             setTimeout(() => setIsImportModalOpen(true), 0);
         }
         return (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="text-white">Opening Import...</div>
            </div>
         );
    } else if (!isCustomMode) {
         return (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="text-white text-xl font-bold font-display flex flex-col items-center gap-4 animate-pulse">
                <div className="w-12 h-12 border-4 border-sky-blue border-t-transparent rounded-full animate-spin" />
                Booting up your bot opponents...
            </div>
          </div>
        );
    }
  }

  return (
    <div className="h-full w-full bg-[#0d1221] flex flex-col overflow-hidden">
      {/* Import Modal - Keep as local modal */}
      {isImportModalOpen && (
          <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
              <div className="bg-theme-surface rounded-2xl border-2 border-theme p-6 w-full max-w-lg shadow-2xl">
                  {/* ... Import content ... */}
                  <h3 className="text-xl font-bold text-theme-primary mb-4">Import Custom Puzzles</h3>
                  <p className="text-theme-secondary text-sm mb-4">Paste one or more FEN strings (one per line). You will play against Stockfish from these positions.</p>
                  <textarea
                      value={fenInput}
                      onChange={(e) => setFenInput(e.target.value)}
                      placeholder={`rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1\n...`}
                      className="w-full h-40 bg-theme-surface-secondary border border-theme rounded-xl p-3 text-theme-primary font-mono text-sm focus:outline-none focus:border-sky-blue dark:focus:border-electric-cyan mb-4"
                  />
                  <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => {
                            setIsImportModalOpen(false);
                            if (isCustomMode && customPuzzles.length === 0 && !customGame) {
                                setSelectedTheme('mixed'); 
                                loadNewPuzzle('mixed');
                            }
                        }}
                        className="px-4 py-2 hover:bg-neutral-800 text-zinc-300 rounded transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={handleImportFens}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded transition-colors"
                      >
                          Import & Play
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Center Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto w-full p-2 md:p-4 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Target className="text-sky-blue dark:text-electric-cyan" size={32} />
                    <div>
                    <h2 className="text-xl font-bold text-theme-primary">Puzzle Trainer</h2>
                    <div className="text-sm text-theme-secondary flex items-center gap-2">
                        <span>Theme: {selectedTheme === 'mixed' ? 'Mixed' : (selectedTheme === 'custom' ? 'Custom Import' : PUZZLE_THEMES[selectedTheme as ThemeKey]?.name)}</span>
                        <span className="text-zinc-600 mx-1">•</span>
                        <span>Difficulty: {selectedDifficulty === 'all' ? 'All' : selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}</span>
                    </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    {!isCustomMode && (
                        <>
                        <div className="flex items-center gap-2">
                        <Flame className="text-orange-500" size={24} />
                        <div>
                            <div className="text-xs text-zinc-400">Streak</div>
                            <div className="text-xl font-bold text-white">{streak}</div>
                        </div>
                        </div>
                        <div className="flex items-center gap-2">
                        <Trophy className="text-yellow-500" size={24} />
                        <div>
                            <div className="text-xs text-zinc-400">Solved</div>
                            <div className="text-xl font-bold text-white">{totalSolved}</div>
                        </div>
                        </div>
                        </>
                    )}
                </div>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full overflow-hidden min-h-0">
                    {/* Board - Maximize */}
                    <div className="flex-1 min-w-0 flex flex-col items-center justify-center p-4 relative z-0 overflow-hidden">
                        <div className="w-full h-full max-w-full max-h-[min(700px,80vh)] flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 overflow-hidden">
                            <div className="flex-1 flex flex-col items-center justify-center h-full max-w-full aspect-square">
                            {activeGame && currentPuzzle && (
                                <ChessBoard
                                    game={activeGame}
                                    onMove={handleMove}
                                    orientation={currentPuzzle.playerColor === 'w' ? 'white' : 'black'}
                                    colorScheme={colorScheme}
                                />
                            )}

                            {!isCustomMode && showSuccess && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white px-8 py-4 rounded-lg shadow-2xl text-2xl font-bold animate-bounce z-10 w-max">
                                ✓ Correct! Puzzle Solved!
                            </div>
                            )}
                            {!isCustomMode && showFailure && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-8 py-4 rounded-lg shadow-2xl text-2xl font-bold z-10 w-max">
                                ✗ Wrong Move
                            </div>
                            )}
                            {isCustomMode && isEngineThinking && (
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-neutral-800/90 text-white px-6 py-3 rounded-lg shadow-xl text-lg font-bold border border-neutral-600 z-10 flex items-center gap-2 w-max">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Stockfish is thinking...
                                </div>
                            )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Scrollable */}
                    <div className="w-full lg:w-[400px] xl:w-[450px] bg-[#111b33] flex flex-col shrink-0 flex-none h-[40vh] lg:h-full min-h-0 border-l border-white/5 z-20 shadow-2xl overflow-hidden relative p-4">
                        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                        <h3 className="text-lg font-bold text-white mb-2">{currentPuzzle?.description || 'Chess Puzzle'}</h3>
                        <div className="flex gap-2 flex-wrap">
                            <span className="px-3 py-1 bg-teal-600 text-white text-xs font-bold rounded-full">
                            {currentPuzzle?.theme}
                            </span>
                            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                            Rating: {currentPuzzle?.rating || 'N/A'}
                            </span>
                            <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                            {currentPuzzle?.playerColor === 'w' ? 'White' : 'Black'} to move
                            </span>
                        </div>
                        </div>

                        {/* Difficulty Selector */}
                        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                            <h4 className="text-sm font-bold text-zinc-300 mb-2 flex items-center gap-2">
                                <Filter size={16} /> Filter by Difficulty
                            </h4>
                            <div className="grid grid-cols-4 gap-2">
                                {(['all', 'easy', 'medium', 'hard'] as const).map(diff => (
                                    <button
                                        key={diff}
                                        onClick={() => {
                                            setSelectedDifficulty(diff);
                                            loadNewPuzzle(undefined, diff);
                                        }}
                                        className={`px-2 py-1.5 rounded text-xs font-bold transition-all ${
                                            selectedDifficulty === diff
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-neutral-700 text-zinc-400 hover:bg-neutral-600'
                                        }`}
                                    >
                                        {diff === 'all' ? 'All' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Theme Selector - Enhanced Visibility */}
                        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                        <h4 className="text-sm font-bold text-zinc-300 mb-2">Select Theme</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => {
                                    setSelectedTheme('spaced-repetition');
                                    loadNewPuzzle('spaced-repetition');
                                }}
                                className={`col-span-2 px-3 py-2 rounded font-bold text-sm transition-all border border-purple-500/50 ${
                                selectedTheme === 'spaced-repetition'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-neutral-800 text-purple-400 hover:bg-neutral-700'
                                }`}
                            >
                            <Brain size={16} className="inline mr-2" /> Spaced Repetition
                            </button>

                            <button
                            onClick={() => {
                                setSelectedTheme('mixed');
                                loadNewPuzzle('mixed');
                            }}
                            className={`px-3 py-2 rounded font-bold text-sm transition-all ${
                                selectedTheme === 'mixed'
                                ? 'bg-teal-600 text-white'
                                : 'bg-neutral-700 text-zinc-300 hover:bg-neutral-600'
                            }`}
                            >
                            Mixed
                            </button>
                            <button
                            onClick={() => {
                                    setSelectedTheme('custom');
                                    setIsImportModalOpen(true);
                            }}
                            className={`px-3 py-2 rounded font-bold text-sm transition-all border border-teal-500/50 ${
                                selectedTheme === 'custom'
                                ? 'bg-teal-600 text-white'
                                : 'bg-neutral-800 text-teal-400 hover:bg-neutral-700'
                            }`}
                            >
                            <Upload size={14} className="inline mr-1" /> Import Custom
                            </button>

                            {Object.entries(PUZZLE_THEMES).map(([key, data]) => (
                            <button
                                key={key}
                                onClick={() => {
                                setSelectedTheme(key as ThemeKey);
                                loadNewPuzzle(key as ThemeKey);
                                }}
                                className={`px-3 py-2 rounded font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                selectedTheme === key
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-neutral-700 text-zinc-300 hover:bg-neutral-600'
                                }`}
                                style={{
                                    borderColor: selectedTheme === key ? data.color : 'transparent',
                                    borderWidth: selectedTheme === key ? '2px' : '0'
                                }}
                            >
                                <span>{data.icon}</span>
                                <span>{data.name}</span>
                            </button>
                            ))}
                        </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                        <button
                            onClick={handleHint}
                            disabled={isCustomMode ? true : (hintsUsed >= maxHints || isComplete || isFailed)}
                            className="w-full px-4 py-3 bg-amber-700 hover:bg-amber-600 disabled:bg-neutral-700 disabled:text-zinc-500 text-slate-900 font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Lightbulb size={20} /> Hint {isCustomMode ? '(N/A)' : `(${hintsUsed}/${maxHints})`}
                        </button>

                        <button
                            onClick={isCustomMode ? () => setIsImportModalOpen(true) : resetPuzzle}
                            disabled={isCustomMode ? false : isComplete}
                            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 disabled:text-zinc-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            {isCustomMode ? <Upload size={20} /> : <RotateCcw size={20} />} 
                            {isCustomMode ? 'Import New FENs' : 'Reset'}
                        </button>

                        {(isComplete || (isCustomMode && customPuzzles.length > 0)) ? (
                            <button
                            onClick={handleNext}
                            className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                            <Trophy size={20} /> Next Puzzle {isCustomMode ? `(${customPuzzles.length})` : ''}
                            </button>
                        ) : (
                            <button
                            onClick={handleSkip}
                            className="w-full px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-zinc-300 font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                            <SkipForward size={20} /> Skip
                            </button>
                        )}
                        </div>

                        {hintHighlight && (
                        <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-3 text-yellow-200 text-sm font-bold">
                            💡 Move from {hintHighlight.from} to {hintHighlight.to}
                        </div>
                        )}

                        {/* SEO / Extra Content */}
                        {children && (
                            <div className="mt-8 pt-8 border-t border-white/10 text-zinc-500 text-sm">
                                {children}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
