'use client';

import React, { useMemo } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from '@/components/ChessBoard';

// Helper component for Article Diagrams
export const FenBoard = ({ fen, orientation = 'white', caption }: { fen: string, orientation?: 'white' | 'black', caption?: string }) => {
    const game = useMemo(() => {
        try {
            return new Chess(fen);
        } catch (e) {
            console.error("Invalid FEN:", fen, e);
            return new Chess();
        }
    }, [fen]);

    return (
        <div className="my-8 w-full max-w-[350px] mx-auto">
             <div className="aspect-square w-full rounded-lg shadow-2xl overflow-hidden border-[4px] border-zinc-700/50 bg-zinc-800">
                <ChessBoard 
                    game={game} 
                    onMove={() => false} 
                    arePiecesDraggable={false} 
                    orientation={orientation}
                    colorScheme="ocean" 
                />
             </div>
             {caption && (
                 <p className="text-center text-zinc-500 text-sm mt-2 italic font-medium">{caption}</p>
             )}
        </div>
    );
};

export const ImageBoard = ({ src, caption }: { src: string, caption?: string }) => {
    return (
        <div className="my-8 w-full max-w-[350px] mx-auto">
             <div className="aspect-square w-full rounded-lg shadow-2xl overflow-hidden border-[4px] border-zinc-700/50 bg-zinc-800 relative">
                <img 
                    src={src} 
                    alt={caption || "Chess Position"} 
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                />
             </div>
             {caption && (
                 <p className="text-center text-zinc-500 text-sm mt-2 italic font-medium">{caption}</p>
             )}
        </div>
    );
};
