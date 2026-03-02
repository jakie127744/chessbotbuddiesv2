
import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Brain, CheckCircle, AlertCircle } from 'lucide-react';
import { ChessBoard } from '../ChessBoard';
import { OpeningSRSSessionProps } from './types';
import { submitReview } from '@/lib/srs-manager';

export function OpeningSRSSession({ queue, onComplete, onExit }: OpeningSRSSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [game, setGame] = useState<Chess | null>(null);
  const [status, setStatus] = useState<'playing' | 'correct' | 'incorrect'>('playing');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Initialize first card
  useEffect(() => {
    if (queue.length > 0 && !game) {
        loadCard(0);
    }
  }, [queue]);

  function loadCard(index: number) {
      if (index >= queue.length) return;
      const card = queue[index];
      setGame(new Chess(card.fen));
      setStatus('playing');
      setFeedback(null);
  }

  function handleMove(move: { from: string; to: string; promotion?: string }) {
      if (!game || status !== 'playing') return false;
      
      const card = queue[currentIndex];
      
      try {
          const tempGame = new Chess(game.fen());
          const result = tempGame.move(move);
          
          if (result) {
              if (result.san === card.san) {
                  // Correct!
                  setGame(tempGame);
                  setStatus('correct');
                  setFeedback('Correct! How easy was that?');
                  return true;
              } else {
                  // Wrong move (even if legal)
                  setStatus('incorrect');
                  setFeedback(`Incorrect. The move was ${card.san}`);
                  return false;
              }
          }
      } catch (e) { return false; }
      return false;
  }

  function submitCardReview(quality: number) {
      const card = queue[currentIndex];
      submitReview(card.id, quality);
      
      const nextIdx = currentIndex + 1;
      if (nextIdx < queue.length) {
          setCurrentIndex(nextIdx);
          loadCard(nextIdx);
      } else {
          // Calculate session score/xp logic could happen here or in parent
          // Let's assume parent handles the bulk reward, we just notify completion
          onComplete(50); // Base session bonus
      }
  }

  if (!game) return null;

  const card = queue[currentIndex];
  const progress = Math.round(((currentIndex) / queue.length) * 100);

  return (
    <div className="h-full w-full bg-theme-surface flex flex-col p-6 overflow-hidden">
         <div className="bg-neutral-900 rounded-xl border-2 border-neutral-700 w-full max-w-6xl mx-auto h-full p-6 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Brain className="text-purple-500" size={32} />
                    <div>
                        <h2 className="text-2xl font-bold text-white">Opening Review</h2>
                        <p className="text-zinc-400 text-sm">Card {currentIndex + 1} of {queue.length}</p>
                    </div>
                </div>
                <button 
                    onClick={onExit}
                    className="px-4 py-2 hover:bg-neutral-800 text-zinc-400 rounded transition-colors"
                >
                    Exit Session
                </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-neutral-800 h-2 rounded-full mb-6 shrink-0">
                <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 flex-1 overflow-hidden">
                <div className="flex flex-col items-center justify-center relative">
                    <ChessBoard 
                        game={game}
                        onMove={handleMove}
                        orientation={game.turn() === 'w' ? 'white' : 'black'}
                        arePiecesDraggable={status === 'playing'}
                    />
                    
                    {/* Status Overlay - Transient */}
                    {status === 'correct' && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 animate-out fade-out duration-1000 fill-mode-forwards delay-1000">
                            <div className="bg-green-600/90 text-white px-8 py-4 rounded-2xl shadow-2xl backdrop-blur flex flex-col items-center animate-bounce">
                                <CheckCircle size={48} className="mb-2" />
                                <div className="text-2xl font-black">Correct!</div>
                            </div>
                        </div>
                    )}
                     {status === 'incorrect' && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600/90 text-white px-8 py-4 rounded-2xl shadow-2xl backdrop-blur z-10 flex flex-col items-center">
                            <AlertCircle size={48} className="mb-2" />
                            <div className="text-2xl font-black">Incorrect</div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-4 overflow-y-auto">
                    <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
                         <h3 className="text-zinc-400 text-sm uppercase font-bold tracking-wider mb-2">Flashcard Review</h3>
                         <div className="text-xl font-bold text-white mb-4">
                            {game.turn() === 'w' ? 'White' : 'Black'} to move
                         </div>
                         <div className="text-sm text-zinc-500 mb-2">
                            Opening: <span className="text-zinc-300">{card.openingName}</span>
                         </div>
                         <div className="flex gap-4 mb-4 text-xs font-mono text-zinc-600">
                            <span className="bg-neutral-900 px-2 py-1 rounded border border-neutral-700">ECO: B00</span>
                            <span className="bg-neutral-900 px-2 py-1 rounded border border-neutral-700">Depth: {Math.floor(card.moveIndex / 2) + 1}</span>
                         </div>
                         <div className="text-xs text-zinc-600 italic">
                            Note: In Review Mode, you test one move at a time. The game usually won't continue automatically.
                         </div>
                    </div>

                    {feedback && (
                        <div className={`p-4 rounded-xl border-2 font-bold text-center ${
                            status === 'correct' ? 'bg-green-900/30 border-green-600 text-green-200' : 
                            status === 'incorrect' ? 'bg-red-900/30 border-red-600 text-red-200' : 'bg-neutral-800 border-neutral-700'
                        }`}>
                            {feedback}
                        </div>
                    )}

                    {/* Grading Controls */}
                    {status !== 'playing' && (
                        <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 flex flex-col gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
                            <div className="text-center text-zinc-400 text-sm mb-2">Did you know this move?</div>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => submitCardReview(1)} // Failed/Did not know
                                    className="py-4 px-6 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-200 rounded-xl font-bold transition-all hover:scale-[1.02] flex flex-col items-center gap-1"
                                >
                                    <span className="text-lg">I didn't know</span>
                                    <span className="text-xs opacity-75 font-normal">Reset Progress</span>
                                </button>
                                <button 
                                    onClick={() => submitCardReview(4)} // Good/Known
                                    className="py-4 px-6 bg-green-600/20 hover:bg-green-600/30 border border-green-600/50 text-green-200 rounded-xl font-bold transition-all hover:scale-[1.02] flex flex-col items-center gap-1"
                                >
                                    <span className="text-lg">I knew this</span>
                                    <span className="text-xs opacity-75 font-normal">Next Review: Later</span>
                                </button>
                            </div>
                            <div className="text-center mt-2">
                                 <button onClick={() => submitCardReview(5)} className="text-xs text-zinc-600 hover:text-zinc-400 underline">
                                    Too easy (5)
                                 </button>
                            </div>
                        </div>
                    )}
                    
                    {status === 'playing' && (
                         <button 
                            onClick={() => {
                                setStatus('incorrect');
                                setFeedback(`The correct move was ${card.san}`);
                            }}
                            className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 text-zinc-400 font-bold rounded-xl border-2 border-neutral-700 hover:border-zinc-500 transition-all"
                        >
                            I don't know
                        </button>
                    )}
                </div>
            </div>
         </div>
    </div>
  );
}
