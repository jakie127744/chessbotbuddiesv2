// Google AdSense Provider for Web

import { AdProvider } from './base';
import { AdPlacement, AdSize, RewardType, RewardedAdResult } from '../types';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

/**
 * AdSense provider for web ads
 * Supports responsive banner ads only (no rewarded ads on web)
 */
export class AdSenseProvider extends AdProvider {
  private publisherId: string;
  private loadedPlacements: Set<AdPlacement> = new Set();
  private adSlots: Map<AdPlacement, string> = new Map();

  constructor(publisherId: string, testMode: boolean = false) {
    super(testMode);
    this.publisherId = publisherId;
  }

  async initialize(): Promise<boolean> {
    if (typeof window === 'undefined') {
      console.warn('[AdSenseProvider] Not in browser environment');
      return false;
    }

    try {
      // Check if AdSense script is already loaded
      if (!window.adsbygoogle) {
        window.adsbygoogle = [];
      }
      
      this.isInitialized = true;
      console.log('[AdSenseProvider] Initialized');
      return true;
    } catch (error) {
      console.error('[AdSenseProvider] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Set the ad slot ID for a placement
   */
  setSlotId(placement: AdPlacement, slotId: string): void {
    this.adSlots.set(placement, slotId);
  }

  async loadBanner(placement: AdPlacement, _size: AdSize): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('[AdSenseProvider] Not initialized');
      return false;
    }

    const slotId = this.adSlots.get(placement);
    if (!slotId) {
      console.warn(`[AdSenseProvider] No slot ID configured for ${placement}`);
      return false;
    }

    this.loadedPlacements.add(placement);
    return true;
  }

  async showBanner(placement: AdPlacement): Promise<boolean> {
    if (!this.loadedPlacements.has(placement)) {
      return false;
    }

    try {
      // Push to adsbygoogle to render the ad
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
      return true;
    } catch (error) {
      console.error(`[AdSenseProvider] Failed to show banner at ${placement}:`, error);
      return false;
    }
  }

  async hideBanner(placement: AdPlacement): Promise<void> {
    // AdSense banners are controlled via CSS visibility
    // The component handles this
    this.loadedPlacements.delete(placement);
  }

  async destroyBanner(placement: AdPlacement): Promise<void> {
    this.loadedPlacements.delete(placement);
  }

  // Rewarded ads not supported on web AdSense
  async loadRewarded(_rewardType: RewardType): Promise<boolean> {
    console.warn('[AdSenseProvider] Rewarded ads not supported on web');
    return false;
  }

  async showRewarded(_rewardType: RewardType): Promise<RewardedAdResult> {
    return {
      completed: false,
      rewardType: _rewardType,
      rewardAmount: 0,
    };
  }

  isRewardedReady(_rewardType: RewardType): boolean {
    return false; // Not supported
  }

  async destroy(): Promise<void> {
    this.loadedPlacements.clear();
    this.adSlots.clear();
    this.isInitialized = false;
  }

  getProviderName(): string {
    return 'adsense';
  }

  getPublisherId(): string {
    return this.publisherId;
  }
}
