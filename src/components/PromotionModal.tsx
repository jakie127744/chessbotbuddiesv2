'use client';

import { X } from 'lucide-react';
import { usePieceStyle } from '@/contexts/PieceStyleContext';
import { PIECE_SETS } from '@/lib/piece-sets';

interface PromotionModalProps {
  isOpen: boolean;
  color: 'w' | 'b';
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
  onClose: () => void;
}

export function PromotionModal({ isOpen, color, onSelect, onClose }: PromotionModalProps) {
  if (!isOpen) return null;

  const pieces: ('q' | 'r' | 'b' | 'n')[] = ['q', 'r', 'b', 'n'];
  
  const { pieceStyle } = usePieceStyle();
  const currentSet = PIECE_SETS[pieceStyle];

  const pieceNames = {
    q: 'Queen',
    r: 'Rook',
    b: 'Bishop',
    n: 'Knight'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border-2 border-zinc-700 rounded-xl p-6 shadow-2xl max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Choose Promotion</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {pieces.map((piece) => (
            <button
              key={piece}
              onClick={() => onSelect(piece)}
              className="aspect-square bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-700 hover:border-green-500 rounded-lg transition-all hover:scale-105 active:scale-95 p-3 group"
            >
              <img
                src={color === 'w' ? currentSet.white[piece] : currentSet.black[piece]}
                alt={pieceNames[piece]}
                className="w-full h-full object-contain"
              />
              <div className="text-xs text-zinc-400 group-hover:text-white text-center mt-1 font-bold">
                {pieceNames[piece]}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
