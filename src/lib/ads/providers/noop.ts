// No-op Ad Provider for development and disabled mode

import { AdProvider } from './base';
import { AdPlacement, AdSize, RewardType, RewardedAdResult } from '../types';

/**
 * No-op provider that does nothing
 * Used when ads are disabled or in development mode
 */
export class NoopProvider extends AdProvider {
  constructor() {
    super(true); // Always in test mode
  }

  async initialize(): Promise<boolean> {
    this.isInitialized = true;
    console.log('[NoopProvider] Initialized (ads disabled)');
    return true;
  }

  async loadBanner(_placement: AdPlacement, _size: AdSize): Promise<boolean> {
    return true; // Pretend success
  }

  async showBanner(_placement: AdPlacement): Promise<boolean> {
    return false; // Never actually shows
  }

  async hideBanner(_placement: AdPlacement): Promise<void> {
    // No-op
  }

  async destroyBanner(_placement: AdPlacement): Promise<void> {
    // No-op
  }

  async loadRewarded(_rewardType: RewardType): Promise<boolean> {
    return true; // Pretend success
  }

  async showRewarded(rewardType: RewardType): Promise<RewardedAdResult> {
    // In dev mode, always grant the reward without showing an ad
    console.log(`[NoopProvider] Granting reward: ${rewardType} (dev mode)`);
    return {
      completed: true,
      rewardType,
      rewardAmount: 1,
    };
  }

  isRewardedReady(_rewardType: RewardType): boolean {
    return true; // Always ready in dev mode
  }

  async destroy(): Promise<void> {
    this.isInitialized = false;
  }

  getProviderName(): string {
    return 'noop';
  }
}
