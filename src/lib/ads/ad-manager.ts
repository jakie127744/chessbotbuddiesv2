// Ad Manager - Singleton for managing ads across the app

import { AdProvider } from './providers/base';
import { NoopProvider } from './providers/noop';
import { AdSenseProvider } from './providers/adsense';
import { AdPlacement, AdSession, AdSize, RewardType, RewardedAdResult } from './types';
import { AD_FLAGS, AD_LIMITS, isPlacementEnabled } from './feature-flags';

// Placeholder - replace with real AdSense publisher ID
// TODO: Remind user to add real AdSense publisher ID
const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-9907028021598445';

/**
 * Singleton Ad Manager
 * Handles provider initialization, session tracking, and frequency limiting
 */
class AdManager {
  private static instance: AdManager;
  private provider: AdProvider | null = null;
  private session: AdSession;
  private initialized: boolean = false;

  // Add configuration for slot IDs
  private slotConfig: Record<string, string> = {
     'lobby': '3330215112', // Multiplex
     'post-game': '8128575211', // Square
     'in-game': '3330215112', // Multiplex
     'article': '4584813425', // In-article
     'sidebar': '3330215112', // Multiplex
     'rewarded': '8128575211', // Square
  };

  private constructor() {
    this.session = this.createNewSession();
  }

  static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  private createNewSession(): AdSession {
    return {
      sessionId: `session-${Date.now()}`,
      startTime: Date.now(),
      adsShown: 0,
      gamesCompleted: 0,
      lastAdTime: null,
    };
  }

  /**
   * Initialize the ad system
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      // Choose provider based on environment
      if (!AD_FLAGS.SHOW_ADS) {
        console.log('[AdManager] Ads disabled, using NoopProvider');
        this.provider = new NoopProvider();
      } else if (typeof window !== 'undefined') {
        // Web environment - use AdSense
        console.log('[AdManager] Initializing AdSense provider');
        this.provider = new AdSenseProvider(ADSENSE_PUBLISHER_ID);
      } else {
        this.provider = new NoopProvider();
      }

      const success = await this.provider.initialize();
      
      // Register slot IDs if provider is AdSense
      if (success && this.provider instanceof AdSenseProvider) {
          Object.entries(this.slotConfig).forEach(([placement, slotId]) => {
              (this.provider as AdSenseProvider).setSlotId(placement as AdPlacement, slotId);
          });
      }

      this.initialized = success;
      return success;
    } catch (error) {
      console.error('[AdManager] Initialization failed:', error);
      this.provider = new NoopProvider();
      await this.provider.initialize();
      return false;
    }
  }

  /**
   * Check if an ad can be shown based on limits and conditions
   */
  canShowAd(placement: AdPlacement): boolean {
    if (!isPlacementEnabled(placement)) {
      return false;
    }

    // Check session limits
    if (this.session.adsShown >= AD_LIMITS.MAX_ADS_PER_SESSION) {
      console.log('[AdManager] Session ad limit reached');
      return false;
    }

    // Check cooldown
    if (this.session.lastAdTime) {
      const elapsed = (Date.now() - this.session.lastAdTime) / 1000;
      if (elapsed < AD_LIMITS.AD_REFRESH_INTERVAL_SECONDS) {
        console.log('[AdManager] Ad cooldown active');
        return false;
      }
    }

    // New user grace period
    if (this.session.gamesCompleted < AD_LIMITS.GAMES_BEFORE_FIRST_AD) {
      console.log('[AdManager] New user grace period active');
      return false;
    }

    // Screen height check for in-game ads
    if (placement === 'in-game' && typeof window !== 'undefined') {
      if (window.innerHeight < AD_LIMITS.MIN_SCREEN_HEIGHT_FOR_IN_GAME_ADS) {
        console.log('[AdManager] Screen too small for in-game ads');
        return false;
      }
    }

    return true;
  }

  /**
   * Show a banner ad at a placement
   */
  async showBanner(placement: AdPlacement, size: AdSize = 'responsive'): Promise<boolean> {
    if (!this.provider || !this.canShowAd(placement)) {
      return false;
    }

    const loaded = await this.provider.loadBanner(placement, size);
    if (!loaded) return false;

    const shown = await this.provider.showBanner(placement);
    if (shown) {
      this.recordAdShown();
    }
    return shown;
  }

  /**
   * Hide a banner ad
   */
  async hideBanner(placement: AdPlacement): Promise<void> {
    if (!this.provider) return;
    await this.provider.hideBanner(placement);
  }

  /**
   * Show a rewarded ad
   */
  async showRewardedAd(rewardType: RewardType): Promise<RewardedAdResult> {
    if (!this.provider || !AD_FLAGS.SHOW_REWARDED_ADS) {
      // Grant reward anyway in dev mode
      return {
        completed: true,
        rewardType,
        rewardAmount: 1,
      };
    }

    const loaded = await this.provider.loadRewarded(rewardType);
    if (!loaded) {
      return { completed: false, rewardType, rewardAmount: 0 };
    }

    const result = await this.provider.showRewarded(rewardType);
    if (result.completed) {
      this.recordAdShown();
    }
    return result;
  }

  /**
   * Record that an ad was shown
   */
  private recordAdShown(): void {
    this.session.adsShown++;
    this.session.lastAdTime = Date.now();
  }

  /**
   * Record that a game was completed
   */
  recordGameCompleted(): void {
    this.session.gamesCompleted++;
  }

  /**
   * Get current session stats
   */
  getSessionStats(): AdSession {
    return { ...this.session };
  }

  /**
   * Reset session (for testing)
   */
  resetSession(): void {
    this.session = this.createNewSession();
  }

  /**
   * Check if provider is ready
   */
  isReady(): boolean {
    return this.initialized && this.provider?.isReady() === true;
  }

  /**
   * Get current provider name
   */
  getProviderName(): string {
    return this.provider?.getProviderName() || 'none';
  }
  /**
   * Get the AdSense Publisher ID
   */
  getPublisherId(): string {
    return ADSENSE_PUBLISHER_ID;
  }

  /**
   * Get the AdSense Slot ID for a specific placement
   */
  getSlotId(placement: AdPlacement): string {
    return this.slotConfig[placement] || this.slotConfig['lobby']; // Fallback to lobby/default
  }
}

// Export singleton instance
export const adManager = AdManager.getInstance();

// Export convenience functions
export const initializeAds = () => adManager.initialize();
export const canShowAd = (placement: AdPlacement) => adManager.canShowAd(placement);
export const showBannerAd = (placement: AdPlacement, size?: AdSize) => adManager.showBanner(placement, size);
export const hideBannerAd = (placement: AdPlacement) => adManager.hideBanner(placement);
export const showRewardedAd = (rewardType: RewardType) => adManager.showRewardedAd(rewardType);
export const recordGameCompleted = () => adManager.recordGameCompleted();
export const getAdSensePublisherId = () => adManager.getPublisherId();
export const getAdSlotId = (placement: AdPlacement) => adManager.getSlotId(placement);
