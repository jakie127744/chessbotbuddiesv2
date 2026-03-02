
import React, { useState } from 'react';
import { Chess } from 'chess.js';
import { X } from 'lucide-react';
import { ChessBoard } from '../ChessBoard';
import { OpeningBuilderProps } from './types';

export function OpeningBuilder({ onExit, onSave }: OpeningBuilderProps) {
  const [creationGame, setCreationGame] = useState(new Chess());
  const [creationMoves, setCreationMoves] = useState<string[]>([]);
  const [creationOrientation, setCreationOrientation] = useState<'white' | 'black'>('white');

  function handleCreationMove(move: { from: string; to: string; promotion?: string }) {
    try {
      const newGame = new Chess(creationGame.fen());
      const result = newGame.move(move);
      if (result) {
        setCreationGame(newGame);
        setCreationMoves(prev => [...prev, result.from + result.to + (result.promotion || '')]);
        return true;
      }
    } catch (e) { return false; }
    return false;
  }

  function undoCreationMove() {
    const newGame = new Chess();
    const newMoves = [...creationMoves];
    newMoves.pop();
    
    for (const move of newMoves) {
      newGame.move({
         from: move.substring(0, 2),
         to: move.substring(2, 4),
         promotion: move.length > 4 ? move[4] : undefined
      });
    }
    
    setCreationGame(newGame);
    setCreationMoves(newMoves);
  }

  return (
    <div className="h-full w-full bg-theme-surface flex flex-col p-6 overflow-hidden">
      <div className="bg-neutral-900 rounded-xl border-2 border-neutral-700 w-full max-w-6xl mx-auto h-full p-6 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-2xl font-bold text-white">Create New Variation</h3>
          <button onClick={onExit} className="p-2 hover:bg-neutral-800 rounded">
             <X className="text-zinc-400" size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
           <div className="flex flex-col items-center gap-4">
              <ChessBoard 
                 game={creationGame} 
                 onMove={handleCreationMove} 
                 orientation={creationOrientation}
              />
           </div>

           <div className="flex flex-col gap-4">
              <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                 <div className="mb-4">
                    <label className="block text-zinc-400 text-sm mb-1">Play as</label>
                    <div className="flex bg-neutral-900 rounded p-1">
                       <button 
                          onClick={() => setCreationOrientation('white')}
                          className={`flex-1 py-1 rounded text-sm font-bold ${creationOrientation === 'white' ? 'bg-neutral-700 text-white' : 'text-zinc-500'}`}
                       >White</button>
                       <button 
                          onClick={() => setCreationOrientation('black')}
                          className={`flex-1 py-1 rounded text-sm font-bold ${creationOrientation === 'black' ? 'bg-neutral-700 text-white' : 'text-zinc-500'}`}
                       >Black</button>
                    </div>
                 </div>

                 <div className="flex justify-between items-center text-zinc-300 text-sm mb-4">
                    <span>Moves recorded: <span className="text-white font-bold">{creationMoves.length}</span></span>
                    <button onClick={undoCreationMove} className="text-blue-400 hover:text-blue-300 text-xs text-right">Undo Last</button>
                 </div>
                 
                 <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        onSave(
                          formData.get('name') as string,
                          formData.get('desc') as string,
                          creationMoves,
                          creationOrientation
                        );
                    }}
                    className="flex flex-col gap-3"
                 >
                    <input 
                      name="name" 
                      placeholder="Variation Name (e.g. My Gambit)" 
                      className="bg-neutral-900 border border-neutral-700 rounded p-2 text-white text-sm"
                      required 
                    />
                    <input 
                      name="desc" 
                      placeholder="Description" 
                      className="bg-neutral-900 border border-neutral-700 rounded p-2 text-white text-sm"
                    />
                    <button 
                      type="submit"
                      disabled={creationMoves.length === 0}
                      className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:bg-neutral-700 disabled:text-zinc-500 text-white font-bold rounded transiton-colors"
                    >
                      Save Variation
                    </button>
                 </form>
              </div>
              <div className="text-xs text-zinc-500 p-2">
                 Play moves on the board for both sides to define the line.
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
