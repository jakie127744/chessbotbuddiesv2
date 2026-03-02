'use client';

import React from 'react';
import Image from 'next/image';

interface ChessPieceCharacterProps {
  piece: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
  size?: number;
  className?: string;
}

/**
 * Fun, kid-friendly chess piece characters for lesson cards
 * Uses the cartoon character images with speech bubbles
 */
export function ChessPieceCharacter({ piece, size = 280, className = '' }: ChessPieceCharacterProps) {
  const pieceImages: Record<string, string> = {
    pawn: '/lesson-pawn.png?v=3',
    rook: '/lesson-rook.png?v=3',
    knight: '/lesson-knight.png?v=3',
    bishop: '/lesson-bishop.png?v=3',
    queen: '/lesson-queen.png?v=3',
    king: '/lesson-king.png?v=3',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <img
        src={pieceImages[piece] || pieceImages.pawn}
        alt={`${piece} character`}
        width={size}
        height={size}
        className="object-contain drop-shadow-lg"
      />
    </div>
  );
}

// Helper to determine which piece to show based on lesson title
export function getPieceFromLesson(lessonTitle: string): 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king' {
  const title = lessonTitle.toLowerCase();
  if (title.includes('rook') || title.includes('castle')) return 'rook';
  if (title.includes('knight') || title.includes('horse')) return 'knight';
  if (title.includes('bishop')) return 'bishop';
  if (title.includes('queen')) return 'queen';
  if (title.includes('king') || title.includes('checkmate') || title.includes('castling')) return 'king';
  return 'pawn'; // Default to pawn
}
