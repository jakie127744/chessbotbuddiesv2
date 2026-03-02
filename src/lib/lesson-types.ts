
export type TrackLevel = 'world-1' | 'world-2' | 'world-3' | 'world-4' | 'world-5' | 'world-6';

export interface LessonContent {
  type: 'text' | 'board' | 'challenge' | 'quiz' | 'logic' | 'validation' | 'intro';
  style?: 'default' | 'fun-fact' | 'warning' | 'important';
  text: string;
  prompt?: string;
  imageUrl?: string;
  fen?: string;
  moves?: string[];
  solution?: string[];
  goals?: string[]; // Squares to tap or move to
  highlightSquares?: string[]; // Just visual highlights
  hint?: string;
  hints?: string[]; // Array of hints
  successText?: string;
  explanation?: string;
  orientation?: 'white' | 'black';
  playerColor?: 'w' | 'b';
  alternateMoves?: Record<string, string>;
  avoidPiece?: string;
  playVsBot?: boolean;
  customHighlights?: { squares: string[]; color: string; label?: string }[];
  arrows?: { from: string; to: string; color?: string }[];
  // Quiz specific
  answers?: { text: string; correct: boolean }[];
  // Mini-game specific
  interactive?: boolean;
  aiOpponent?: {
    engine: string;
    botId?: string;
    level?: number | string;
    color?: string;
    immovablePieces?: string[];
    movePattern?: string;
  };
  defeatText?: string;
  failText?: string;
  playerPiece?: string;
  playerPieces?: string[];
  lockedSquares?: string[]; // Squares that cannot be moved FROM
  immovablePieces?: { piece: string; square: string; visible: boolean }[];
  hiddenPieces?: { piece: string; square: string; visible: boolean }[];
  maxMoves?: number;
  saveToLocal?: boolean;
  action?: string[];
  storage?: string[];
  timer?: number;
  dynamicWalls?: boolean;
  randomizeWalls?: boolean;
  targets?: { count: number; type: string[]; randomize: boolean };
  moveTracking?: boolean;
  scoring?: { base: number; perMovePenalty: number; bonusThreshold: number; bonusPoints: number };
  challenges?: { fen: string; solution: string[] }[];
  legalMoves?: boolean;
  legalMovesOnly?: boolean;
  playerAction?: string;
  validation?: string;
  header?: string;
  mechanic?: string;
  sequential?: boolean;
}


export interface LessonNode {
  id: string;
  title: string;
  description: string;
  icon: string;
  track: TrackLevel;
  order: number;
  type: 'concept' | 'tactic' | 'strategy' | 'endgame' | 'opening' | 'theory' | 'minigame';
  bookSource?: string;
  pages: LessonContent[];
  xpReward: number;
  prerequisiteIds?: string[];
  // Mini-game specific
  rules?: string[];
  fenStart?: string;
  victoryConditions?: string[];
  defeatConditions?: string[];
  modes?: { name: string; player: string; opponent: string; objective: string }[];
  opponent?: { type: string; engine: string; level: number };
  category?: string;
  imageUrl?: string;
}
