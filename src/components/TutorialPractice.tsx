'use client';

import { useState, useEffect } from 'react';
import { Chess, Move } from 'chess.js';
import { ChessBoard } from './ChessBoard';
import { useBoardColorScheme } from '@/contexts/BoardColorSchemeContext';
import { TUTORIAL_LEVELS, TutorialLevel } from '@/lib/tutorial-data';
import { Star, ArrowRight, RotateCcw, X, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRewards } from '@/contexts/RewardsContext';

interface TutorialPracticeProps {
    onClose: () => void;
    levelId?: string; // Optional starting level
}

export function TutorialPractice({ onClose, levelId }: TutorialPracticeProps) {
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [game, setGame] = useState(new Chess());
    const [remainingStars, setRemainingStars] = useState<string[]>([]);
    const [isLevelComplete, setIsLevelComplete] = useState(false);
    
    // For "stars collected in this run" vs "total in level"
    // simplistic: just filter remainingStars.

    const { addActivity, addXp } = useRewards();
    const { colorScheme } = useBoardColorScheme();

    const currentLevel = TUTORIAL_LEVELS[currentLevelIndex];

    // Initialize Level
    useEffect(() => {
        if (!currentLevel) return;
        
        try {
           const g = new Chess(currentLevel.fen);
           setGame(g);
           setRemainingStars([...currentLevel.stars]);
           setIsLevelComplete(false);
        } catch (e) {
            console.error("Failed to load level", e);
        }

    }, [currentLevelIndex, currentLevel]);

    const handleMove = (move: { from: string; to: string; promotion?: string }) => {
        if (isLevelComplete) return false;

        try {
            const tempGame = new Chess(game.fen());
            
            // Allow "invalid" moves in terms of turns? 
            // Usually tutorial allows you to move the same piece multiple times in a row without opponent moving.
            // Chess.js enforces turns.
            // Lichess Learn usually has "White to move" then "White to move".
            // So we might need to force the turn back to the player if we want multi-move sequences.
            
            // Hack: If strict chess rules prevent us (e.g. wrong turn), we manipulate the FEN.
            // BUT, `chess.js` checks legality.
            // If I move White Rook, now it's Black's turn. 
            // If I want to move White Rook AGAIN, `chess.js` says "Not your turn".
            // Solution: After move, if level implies free movement, reset turn to player color in FEN.
            
            const result = tempGame.move(move);
            if (!result) return false;
            
            // Move successful. Check for stars.
            const newStars = remainingStars.filter(s => s !== move.to);
            const collectedStar = newStars.length < remainingStars.length;
            
            setGame(tempGame);
            setRemainingStars(newStars);
            
            if (newStars.length === 0) {
                // Level Complete!
                setIsLevelComplete(true);
                addXp(10); // Reward per level
            } else {
                 // Force turn back to player if "sandbox" mode? 
                 // If there are no black pieces (except king), safe to force turn.
                 const fenParts = tempGame.fen().split(' ');
                 if (fenParts[1] !== currentLevel.pieceColor) {
                     fenParts[1] = currentLevel.pieceColor;
                     // Also increment fullmove?
                     // fenParts[5] = (parseInt(fenParts[5]) + 1).toString();
                     // Actually `chess.js` might complain if en passant square is set but wrong turn? 
                     // reset en passant to '-' just in case
                     fenParts[3] = '-'; 
                     
                     const newFen = fenParts.join(' ');
                     const forcedGame = new Chess(newFen);
                     setGame(forcedGame);
                 }
            }

            return true;
        } catch (e) {
            return false;
        }
    };

    const handleNextLevel = () => {
        if (currentLevelIndex < TUTORIAL_LEVELS.length - 1) {
            setCurrentLevelIndex(prev => prev + 1);
        } else {
            // All done logic
            onClose();
        }
    };

    const handleReset = () => {
        const g = new Chess(currentLevel.fen);
        setGame(g);
        setRemainingStars([...currentLevel.stars]);
        setIsLevelComplete(false);
    };

    if (!currentLevel) return null;

    // Construct custom squares map for ChessBoard
    const customSquares: Record<string, { icon: any, color: string, pulse?: boolean }> = {};
    remainingStars.forEach(s => {
        customSquares[s] = { icon: Star, color: '#fbbf24', pulse: true };
    });

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-[400px] bg-slate-800 border-r border-slate-700 p-6 flex flex-col relative z-20">
                <div className="flex justify-between items-center mb-8">
                     <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                        Level {currentLevelIndex + 1}
                     </h2>
                     <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-zinc-400 hover:text-white transition-colors">
                        <X size={24} />
                     </button>
                </div>

                <div className="flex-1 space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">{currentLevel.title}</h3>
                        <p className="text-slate-400 leading-relaxed text-sm">{currentLevel.description}</p>
                    </div>

                    <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-5 border border-slate-600/50 shadow-xl">
                         <div className="flex items-center gap-3 mb-3">
                             <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shadow-inner border border-blue-500/10">
                                i
                             </div>
                             <span className="font-bold text-blue-200">Goal</span>
                         </div>
                         <p className="text-slate-300 text-sm leading-relaxed">
                             {currentLevel.instruction}
                         </p>
                    </div>

                    <div className="space-y-3">
                         <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                             <span>Progress</span>
                             <span className="text-yellow-400">{currentLevel.stars.length - remainingStars.length} / {currentLevel.stars.length} Stars</span>
                         </div>
                         <div className="flex gap-2 p-2 bg-slate-900/50 rounded-lg border border-slate-800">
                             {Array.from({ length: currentLevel.stars.length }).map((_, i) => {
                                 const isCollected = i < (currentLevel.stars.length - remainingStars.length);
                                 return (
                                     <div key={i} className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                                         isCollected 
                                         ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' 
                                         : 'bg-slate-700'
                                     }`} />
                                 );
                             })}
                         </div>
                    </div>
                </div>

                <div className="mt-8">
                    {isLevelComplete ? (
                         <div className="space-y-4 animate-in slide-in-from-bottom-5 fade-in duration-500">
                             <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl flex items-center gap-4">
                                 <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg text-white">
                                     <Trophy size={24} fill="currentColor" />
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-green-400 text-lg">Completed!</h4>
                                     <p className="text-green-200/80 text-xs">Stars collected. Ready for next?</p>
                                 </div>
                             </div>
                             <button 
                                onClick={handleNextLevel}
                                className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                             >
                                Next Level <ArrowRight size={20} />
                             </button>
                         </div>
                    ) : (
                         <button 
                            onClick={handleReset}
                            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                         >
                            <RotateCcw size={18} /> Reset Level
                         </button>
                    )}
                </div>
            </div>

            {/* Board Area */}
            <div className="flex-1 bg-slate-900/50 flex items-center justify-center p-4 md:p-12 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
                     <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl p-100" />
                     <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl p-100" />
                </div>

                <div className="relative z-10 w-full max-w-3xl aspect-square shadow-2xl rounded-sm border-[12px] border-slate-800">
                    <ChessBoard 
                        game={game}
                        onMove={handleMove}
                        arePiecesDraggable={true}
                        customSquares={customSquares}
                        colorScheme={colorScheme}
                        orientation={currentLevel.pieceColor === 'w' ? 'white' : 'black'}
                    />
                </div>
            </div>
        </div>
    );
}
