// Feature Flags for Ad Control

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Development/Testing Flags
// Set these to true to force ads to show in development
export const DEV_PREVIEW_ADS = true; // Enabled for testing
export const DEBUG_ADS = false; // Was false

/**
 * Ad Feature Flags
 * All flags default to false in development/test environments unless DEV_PREVIEW_ADS is true
 */
export const AD_FLAGS = {
  /** Master switch for all ads */
  SHOW_ADS: DEV_PREVIEW_ADS || (!isDev && !isTest && process.env.NEXT_PUBLIC_SHOW_ADS === 'true'),
  
  /** Show banner ads during active gameplay (disabled by default) */
  SHOW_IN_GAME_ADS: DEV_PREVIEW_ADS || (!isDev && !isTest && process.env.NEXT_PUBLIC_SHOW_IN_GAME_ADS === 'true'),
  
  /** Enable rewarded video ads for bonuses */
  SHOW_REWARDED_ADS: DEV_PREVIEW_ADS || (!isDev && !isTest && process.env.NEXT_PUBLIC_SHOW_REWARDED_ADS === 'true'),
  
  /** Show post-game ads after match completion */
  SHOW_POST_GAME_ADS: DEV_PREVIEW_ADS || (!isDev && !isTest && process.env.NEXT_PUBLIC_SHOW_POST_GAME_ADS === 'true'),
  
  /** Show banner on lobby/home screen */
  SHOW_LOBBY_ADS: DEV_PREVIEW_ADS || (!isDev && !isTest && process.env.NEXT_PUBLIC_SHOW_LOBBY_ADS === 'true'),

  /** Show ads within articles */
  SHOW_ARTICLE_ADS: DEV_PREVIEW_ADS || (!isDev && !isTest && process.env.NEXT_PUBLIC_SHOW_ARTICLE_ADS !== 'false'),
  
  /** Show sidebar ads */
  SHOW_SIDEBAR_ADS: DEV_PREVIEW_ADS || (!isDev && !isTest && process.env.NEXT_PUBLIC_SHOW_SIDEBAR_ADS !== 'false'),
} as const;

/**
 * Ad Limits & Throttling Configuration
 */
export const AD_LIMITS = {
  /** Maximum ads per single screen */
  MAX_ADS_PER_SCREEN: 4, // Increased for sidebars
  
  /** Maximum ads per completed game */
  MAX_ADS_PER_GAME: 1,
  
  /** Maximum ads per session */
  MAX_ADS_PER_SESSION: 20, // Increased
  
  /** Minimum seconds between ad refreshes */
  AD_REFRESH_INTERVAL_SECONDS: 90,
  
  /** Number of games before showing first ad (new user grace period) */
  GAMES_BEFORE_FIRST_AD: 0,
  
  /** Minimum screen height (px) to show in-game ads */
  MIN_SCREEN_HEIGHT_FOR_IN_GAME_ADS: 700,
} as const;

/**
 * Check if ads should be shown based on current flags
 */
export function shouldShowAds(): boolean {
  return AD_FLAGS.SHOW_ADS;
}

/**
 * Check if a specific ad placement is enabled
 */
export function isPlacementEnabled(placement: 'lobby' | 'post-game' | 'in-game' | 'rewarded' | 'article' | 'sidebar'): boolean {
  if (!AD_FLAGS.SHOW_ADS) return false;
  
  switch (placement) {
    case 'lobby':
      return AD_FLAGS.SHOW_LOBBY_ADS;
    case 'post-game':
      return AD_FLAGS.SHOW_POST_GAME_ADS;
    case 'in-game':
      return AD_FLAGS.SHOW_IN_GAME_ADS;
    case 'rewarded':
      return AD_FLAGS.SHOW_REWARDED_ADS;
    case 'article':
      return AD_FLAGS.SHOW_ARTICLE_ADS;
    case 'sidebar':
      return AD_FLAGS.SHOW_SIDEBAR_ADS;
    default:
      return false;
  }
}
