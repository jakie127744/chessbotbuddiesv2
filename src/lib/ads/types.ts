// Ad System Types

export type AdPlacement = 'lobby' | 'post-game' | 'in-game' | 'rewarded' | 'article' | 'sidebar';

export type AdSize = 
  | 'banner'      // 320x50
  | 'leaderboard' // 728x90
  | 'rectangle'   // 300x250
  | 'responsive'; // Auto-sizing

export interface AdUnit {
  id: string;
  placement: AdPlacement;
  size: AdSize;
  isLoaded: boolean;
}

export interface AdConfig {
  publisherId?: string;
  testMode: boolean;
  placements: {
    [key in AdPlacement]?: {
      enabled: boolean;
      unitId?: string;
      size: AdSize;
    };
  };
}

export type RewardType = 
  | 'free-analysis'    // Free game analysis
  | 'extra-hint'       // Extra hint in casual game
  | 'undo-move';       // Undo last move (non-ranked)

export interface RewardedAdResult {
  completed: boolean;
  rewardType: RewardType;
  rewardAmount: number;
}

export interface AdMetrics {
  impressions: number;
  clicks: number;
  revenue: number;
}

// Session tracking
export interface AdSession {
  sessionId: string;
  startTime: number;
  adsShown: number;
  gamesCompleted: number;
  lastAdTime: number | null;
}
