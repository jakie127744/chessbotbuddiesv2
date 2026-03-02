
import { Chess, Move } from 'chess.js';
import { OpeningVariation } from '@/lib/openings-repertoire';
import { SRSCard } from '@/lib/srs-manager';

export interface OpeningTrainerProps {
  // No props currently for the root component
}

export interface OpeningBoardProps {
  game: Chess;
  onMove: (move: { from: string; to: string; promotion?: string }) => boolean;
  orientation: 'white' | 'black';
  arePiecesDraggable?: boolean;
}

export interface OpeningBuilderProps {
  onExit: () => void;
  onSave: (name: string, description: string, moves: string[], orientation: 'white' | 'black') => void;
}

export interface OpeningSRSSessionProps {
  queue: SRSCard[];
  onComplete: (xpEarned: number) => void;
  onExit: () => void;
}

export interface OpeningListingProps {
  onSelectOpening: (opening: string) => void;
  onStartCreation: () => void;
  onStartReview: () => void;
  onSelectShotgun: () => void;
  trainingMode: 'standard' | 'shotgun';
  totalDue: number;
  customRepertoire: OpeningVariation[];
  userProfile: any; // Ideally typed from user-profile lib
}

export interface OpeningMetadata {
  name: string;
  icon: React.ReactNode;
  description: string;
  color: 'w' | 'b';
}
