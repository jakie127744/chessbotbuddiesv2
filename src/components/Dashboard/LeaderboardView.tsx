import React, { useEffect, useState } from 'react';
import { Leaderboard } from '@/components/Leaderboard';
import { getUserProfile, UserProfile } from '@/lib/user-profile';
import { useRewards } from '@/contexts/RewardsContext';
import { AdBanner } from '../ads/AdBanner';
import { getAdSlotId } from '@/lib/ads/ad-manager';

interface LeaderboardViewProps {
    user: UserProfile | null;
    areAdsAllowed?: boolean;
}

export function LeaderboardView({ user, areAdsAllowed = true }: LeaderboardViewProps) {
    const { stats } = useRewards();

    // User is passed from parent to ensure sync

    // While loading or if user not found (though layout usually handles auth), show placeholder
    if (!user) {
        return (
            <div className="h-full flex items-center justify-center bg-[#0f172a] text-white/40">
                Loading profile...
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-theme-surface flex flex-col overflow-hidden">
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-hidden min-w-0 flex flex-col">
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <Leaderboard />
                    </div>
                </div>

                {/* Vertical Sidebar Ad on Leaderboard */}
                {areAdsAllowed && (
                    <div className="hidden xl:flex w-[340px] border-l border-border-color/50 flex-col p-4 bg-bg-tertiary/20">
                        <AdBanner 
                            dataAdSlot={getAdSlotId('sidebar')} 
                            dataAdFormat="vertical"
                            className="w-full"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
