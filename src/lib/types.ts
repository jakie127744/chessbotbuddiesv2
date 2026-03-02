
export interface ChessPuzzle {
  id: string;
  fen: string;
  moves: string[];
  theme: PuzzleTheme;
  rating: number;
  description: string;
  playerColor: 'w' | 'b';
}

// Re-export specific themes if needed for legacy compatibility, 
// though generally we prefer the dynamic themes from lichess-puzzles
export type PuzzleTheme = 'mate-in-1' | 'mate-in-2' | 'fork' | 'pin' | 'skewer' | 'custom';
