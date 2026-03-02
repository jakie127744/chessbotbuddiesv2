export type OpeningTrainerState = 
  | 'STATE_LOADING'
  | 'STATE_IDLE'
  | 'STATE_OPENING_SELECTION'
  | 'STATE_SIDE_SELECTION'
  | 'STATE_VARIATION_SELECTION'
  | 'STATE_MODE_SELECTION'
  | 'STATE_TRAINING'
  | 'STATE_RECALL'
  | 'STATE_FREE_PLAY'
  | 'STATE_RESULTS'
  | 'STATE_REVIEW_MISTAKES';

export type difficulty_level = 'beginner' | 'intermediate' | 'advanced';

export interface Opening {
  id: string;
  name: string;
  ecoCode: string;
  description: string;
  variations: Variation[];
}

export interface Variation {
  id: string;
  name: string;
  defaultSide: 'white' | 'black';
  rootNode: string; // FEN
  moveCount: number;
}

export interface MoveNode {
  fen: string;
  moveSan: string;
  moveUci: string;
  depthIndex: number;
  nextMainMoves: string[]; // List of UCIs for correct continuation
  deviationMoves: string[]; // List of UCIs for opponent deviations
  explanation?: string;
  conceptTags: string[];
  recallEligible: boolean;
  isTerminal: boolean;
  rejoinFen?: string; // Optional FEN to rejoin main line
}

// User Performance Models

export interface UserNodePerformance {
  userId: string;
  openingId: string;
  variationId: string;
  nodeFen: string;
  attempts: number;
  failures: number;
  hintsUsed: number;
  lastAttempted: string; // ISO Date String
}

export interface UserSidelineExposure {
  userId: string;
  openingId: string;
  nodeFen: string;
  opponentMoveUci: string;
  exposureCount: number;
  lastSeen: string; // ISO Date String
  sourceType: 'game' | 'training';
}

export interface UserSidelinePerformance {
  userId: string;
  openingId: string;
  nodeFen: string;
  opponentMoveUci: string;
  correctResponses: number;
  incorrectResponses: number;
}

export interface UserRecallPerformance {
  userId: string;
  nodeFen: string;
  attempts: number;
  correct: number;
  successRate: number;
  nextReviewDate: string; // ISO Date String
}

export interface UserOpeningStats {
  userId: string;
  openingId: string;
  side: 'white' | 'black';
  variationId: string;
  attempts: number;
  avgAccuracy: number;
  bestAccuracy: number;
  masteryLevel: 'Beginner' | 'Developing' | 'Proficient' | 'Mastered';
  nextReviewDate: string; // ISO Date String
}
