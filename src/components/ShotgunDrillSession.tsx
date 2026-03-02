import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from './ChessBoard';
import { useBoardColorScheme } from '@/contexts/BoardColorSchemeContext';
import { OpeningVariation, getVariationsByOpening } from '@/lib/openings-repertoire';
import { Target, Clock, XCircle, CheckCircle, Trophy, Play } from 'lucide-react';

interface ShotgunConfig {
    opening: string | null;
    duration: number; // minutes
    difficulty: 'easy'|'hard';
}

interface DrillItem {
    fen: string;
    correctMove: string; // SAN
    wrongMoves: string[]; // SAN
    openingName: string;
}

export function ShotgunDrillSession({ config, onExit }: { config: ShotgunConfig, onExit: () => void }) {
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'summary'>('intro');
    const [timeLeft, setTimeLeft] = useState(config.duration * 60);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    
    const [currentDrill, setCurrentDrill] = useState<DrillItem | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const { colorScheme } = useBoardColorScheme();
    
    // Timer
    useEffect(() => {
        if (gameState !== 'playing') return;
        
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameState('summary');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(timer);
    }, [gameState]);

    // Generate Drill
    const generateDrill = useCallback(() => {
        // 1. Pick random variation
        const variations = config.opening ? getVariationsByOpening(config.opening) : []; // Would need ALL variations if null
        // Fallback or full list
        
        if (variations.length === 0) return; // Error handling
        
        const variation = variations[Math.floor(Math.random() * variations.length)];
        
        // 2. Pick a random move index (player's turn)
        // Shotgun mode implies we want to test player knowledge.
        // Let's filter indices where it's player's turn.
        const playerIndices = variation.moves.map((_, i) => i).filter(i => 
            (i % 2 === 0 && variation.playerColor === 'w') || 
            (i % 2 === 1 && variation.playerColor === 'b')
        );
        
        if (playerIndices.length === 0) return;
        
        // Pick an index based on difficulty?
        // Easy: Early moves (0-10). Hard: deeper.
        const idx = playerIndices[Math.floor(Math.random() * playerIndices.length)];
        
        // 3. Construct Game to get FEN
        const game = new Chess();
        for (let i = 0; i < idx; i++) {
            game.move(variation.moves[i]);
        }
        
        const fen = game.fen();
        
        // 4. Get Correct Move (SAN)
        const correctMoveUCI = variation.moves[idx];
        const correctMoveSAN = new Chess(fen).move(correctMoveUCI)?.san;
        
        if (!correctMoveSAN) return; // Should not happen
        
        // 5. Generate Wrong Moves
        // Generate legal moves, filter out the correct one, pick 3 random ones.
        const tempGame = new Chess(fen);
        const legalMoves = tempGame.moves();
        const wrongCandidates = legalMoves.filter(m => m !== correctMoveSAN);
        
        // Shuffle and pick 3
        const wrongMoves = wrongCandidates.sort(() => 0.5 - Math.random()).slice(0, 3);
        
        setCurrentDrill({
            fen,
            correctMove: correctMoveSAN,
            wrongMoves,
            openingName: variation.name
        });
        
        // Shuffle options for display
        setOptions([correctMoveSAN, ...wrongMoves].sort(() => 0.5 - Math.random()));
        
    }, [config]);

    // Start
    useEffect(() => {
        if (gameState === 'intro') {
            // Pre-generate?
        }
    }, [gameState]);

    const handleAnswer = (move: string) => {
        if (!currentDrill) return;
        
        if (move === currentDrill.correctMove) {
            setScore(s => s + 1);
            setStreak(s => {
                const newStreak = s + 1;
                setMaxStreak(m => Math.max(m, newStreak));
                return newStreak;
            });
            // Next drill immediately
            generateDrill();
        } else {
            setStreak(0);
            // Shake effect or feedback? 
            // For Shotgun, maybe just move on or penalize time?
            // "Rapid-fire". Let's penalize time -5s?
            setTimeLeft(t => Math.max(0, t - 5));
            generateDrill(); // Force next even on fail? Or make them retry?
            // Shotgun usually implies speed. Next one.
        }
    };

    if (gameState === 'intro') {
        return (
            <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
                <div className="text-center text-white max-w-lg">
                    <Target size={64} className="mx-auto text-red-500 mb-6" />
                    <h2 className="text-4xl font-black mb-4">Shotgun Drills</h2>
                    <p className="text-xl text-zinc-400 mb-8">
                        {config.opening ? `Focus: ${config.opening}` : 'All Openings'} • 
                        {config.duration} Minutes • 
                        {config.difficulty === 'hard' ? 'Hard' : 'Normal'}
                    </p>
                    
                    <button 
                        onClick={() => {
                            setGameState('playing');
                            generateDrill();
                        }}
                        className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xl transition-all hover:scale-105 flex items-center justify-center gap-2 w-full"
                    >
                        <Play fill="currentColor" /> Start Drill
                    </button>
                    
                    <button onClick={onExit} className="mt-4 text-zinc-500 hover:text-zinc-300">
                        Cancel
                    </button>
                </div>
            </div>
        );
    }
    
    if (gameState === 'summary') {
        return (
            <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
                <div className="text-center text-white max-w-lg bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl">
                    <Trophy size={64} className="mx-auto text-yellow-500 mb-6" />
                    <h2 className="text-4xl font-black mb-2">Session Complete!</h2>
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 mb-8">
                        {score} <span className="text-2xl text-zinc-500 font-medium">pts</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-neutral-800 p-4 rounded-xl">
                            <div className="text-zinc-500 text-sm">Best Streak</div>
                            <div className="text-2xl font-bold text-white">{maxStreak}</div>
                        </div>
                        <div className="bg-neutral-800 p-4 rounded-xl">
                            <div className="text-zinc-500 text-sm">Accuracy</div>
                            <div className="text-2xl font-bold text-white">
                                {score > 0 ? 'High' : '-'} {/* Placeholder for real accuracy */}
                            </div>
                        </div>
                    </div>
                    
                    <button onClick={onExit} className="px-8 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-bold rounded-xl w-full">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-neutral-900 flex flex-col">
            {/* Header */}
            <div className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-900/50 backdrop-blur">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-red-400 font-bold">
                        <Clock size={20} />
                        <span className="font-mono text-xl">
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                    <div className="h-6 w-px bg-neutral-800"></div>
                    <div className="text-white font-bold">
                        Score: {score}
                    </div>
                    {streak > 2 && (
                        <div className="bg-orange-600/20 text-orange-400 px-2 py-0.5 rounded text-xs font-bold animate-pulse">
                            {streak} Streak!
                        </div>
                    )}
                </div>
                <button onClick={onExit} className="p-2 hover:bg-neutral-800 rounded-full text-zinc-500">
                    <XCircle size={24} />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row">
                 {/* Board */}
                 <div className="flex-1 flex items-center justify-center p-4 bg-neutral-900">
                     <div className="w-full max-w-lg aspect-square shadow-2xl">
                         {currentDrill && (
                             <ChessBoard 
                                game={new Chess(currentDrill.fen)}
                                orientation={new Chess(currentDrill.fen).turn() === 'w' ? 'white' : 'black'}
                                arePiecesDraggable={false}
                                onMove={() => false}
                                colorScheme={colorScheme}
                             />
                         )}
                     </div>
                 </div>
                 
                 {/* Question Panel */}
                 <div className="w-full md:w-[400px] bg-neutral-800 border-l border-neutral-700 p-6 flex flex-col justify-center gap-6">
                      <div>
                          <h3 className="text-zinc-400 uppercase tracking-widest text-xs font-bold mb-2">Identify the Best Move</h3>
                          <p className="text-white text-xl font-bold">
                              {currentDrill?.openingName}
                          </p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                          {options.map((option, i) => (
                              <button
                                key={i}
                                onClick={() => handleAnswer(option)}
                                className="p-4 bg-neutral-700 hover:bg-neutral-600 text-white font-bold text-lg rounded-xl transition-all hover:scale-[1.02] text-left flex justify-between items-center group"
                              >
                                  {option}
                                  <span className="opacity-0 group-hover:opacity-100 text-zinc-400 text-xs">Select</span>
                              </button>
                          ))}
                      </div>
                 </div>
            </div>
        </div>
    );
}
