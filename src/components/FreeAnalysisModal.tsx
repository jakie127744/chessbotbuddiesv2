'use client';

import React, { useState } from 'react';
import { Chess } from 'chess.js';
import { X, RotateCcw, Copy } from 'lucide-react';
import { ChessBoard } from './ChessBoard';
import { useBoardColorScheme } from '@/contexts/BoardColorSchemeContext';
import { usePieceStyle } from '@/contexts/PieceStyleContext';
import { BoardColorSchemeSelector } from './BoardColorSchemeSelector';

interface FreeAnalysisModalProps {
    isOpen: boolean;
    initialFen?: string;
    onClose: () => void;
}

export function FreeAnalysisModal({ isOpen, initialFen, onClose }: FreeAnalysisModalProps) {
    const [game, setGame] = useState(new Chess(initialFen || undefined));
    const [fen, setFen] = useState(game.fen());
    const { colorScheme, setColorScheme } = useBoardColorScheme();
    
    // Reset if initialFen changes or modal opens
    React.useEffect(() => {
        if (isOpen) {
             const newGame = new Chess(initialFen || undefined);
             setGame(newGame);
             setFen(newGame.fen());
        }
    }, [initialFen, isOpen]);

    if (!isOpen) return null;

    function handleMove(move: { from: string; to: string; promotion?: string }) {
        try {
            const copy = new Chess(game.fen());
            const result = copy.move(move);
            if (result) {
                setGame(copy);
                setFen(copy.fen());
                return true;
            }
        } catch (e) { return false; }
        return false;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-4xl h-[90vh] bg-[var(--color-bg-primary)] rounded-2xl flex flex-col md:flex-row shadow-2xl overflow-hidden border border-slate-700">
                {/* Header (Mobile) */}
                <div className="md:hidden p-4 border-b border-white/10 flex justify-between items-center">
                    <h2 className="font-black text-xl text-white">Analysis Board</h2>
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Left: Board */}
                <div className="flex-1 bg-[#1a1a1a] flex items-center justify-center p-4">
                     <div className="w-full h-full max-w-[600px] max-h-[600px] aspect-square">
                        <ChessBoard 
                            game={game}
                            onMove={handleMove}
                            colorScheme={colorScheme}
                            arePiecesDraggable={true}
                        />
                     </div>
                </div>

                {/* Right: Tools */}
                <div className="w-full md:w-80 bg-[var(--color-bg-secondary)] flex flex-col border-l border-white/10">
                     {/* Desktop Header */}
                     <div className="hidden md:flex p-6 border-b border-white/10 justify-between items-start">
                        <div>
                            <h2 className="font-black text-2xl text-white mb-1">Analysis</h2>
                            <p className="text-slate-400 text-sm">Experiment freely</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                     </div>

                     <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                        {/* FEN Display */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">FEN String</label>
                            <div className="flex gap-2">
                                <input 
                                    readOnly 
                                    value={fen} 
                                    className="w-full bg-black/20 border border-white/10 rounded p-2 text-xs text-slate-300 font-mono"
                                />
                                <button 
                                    onClick={() => navigator.clipboard.writeText(fen)}
                                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded shadow"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => {
                                    const g = new Chess(initialFen || undefined);
                                    setGame(g);
                                    setFen(g.fen());
                                }}
                                className="flex items-center justify-center gap-2 p-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
                            >
                                <RotateCcw size={16} /> Reset
                            </button>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/10">
                             <h3 className="text-sm font-bold text-white">Board Settings</h3>
                             <BoardColorSchemeSelector selected={colorScheme} onChange={setColorScheme} />
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
}
