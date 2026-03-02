// Abstract Ad Provider Base

import { AdPlacement, AdSize, RewardType, RewardedAdResult } from '../types';

/**
 * Abstract base class for ad providers
 * Implementations: NoopProvider, AdSenseProvider, AdMobProvider
 */
export abstract class AdProvider {
  protected isInitialized: boolean = false;
  protected testMode: boolean = false;

  constructor(testMode: boolean = false) {
    this.testMode = testMode;
  }

  /**
   * Initialize the ad provider
   */
  abstract initialize(): Promise<boolean>;

  /**
   * Check if provider is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Load a banner ad for a placement
   */
  abstract loadBanner(placement: AdPlacement, size: AdSize): Promise<boolean>;

  /**
   * Show a loaded banner ad
   */
  abstract showBanner(placement: AdPlacement): Promise<boolean>;

  /**
   * Hide a banner ad
   */
  abstract hideBanner(placement: AdPlacement): Promise<void>;

  /**
   * Destroy/cleanup a banner ad
   */
  abstract destroyBanner(placement: AdPlacement): Promise<void>;

  /**
   * Load a rewarded ad
   */
  abstract loadRewarded(rewardType: RewardType): Promise<boolean>;

  /**
   * Show a rewarded ad and wait for completion
   */
  abstract showRewarded(rewardType: RewardType): Promise<RewardedAdResult>;

  /**
   * Check if a rewarded ad is ready
   */
  abstract isRewardedReady(rewardType: RewardType): boolean;

  /**
   * Cleanup all ads
   */
  abstract destroy(): Promise<void>;

  /**
   * Get provider name for logging
   */
  abstract getProviderName(): string;
}
