'use client';

import React, { useState } from 'react';
import { Sidebar, ViewType } from './Sidebar';
import { Menu, ChevronLeft } from 'lucide-react';
import { UserProfile, logoutUser } from '@/lib/user-profile';
import { useRouter, usePathname } from 'next/navigation';
import { RewardsDisplay } from './Rewards/RewardsDisplay'; 
import { CelebrationModal } from './Rewards/CelebrationModal';
import { useRewards } from '@/contexts/RewardsContext';
import { AdBanner } from './ads/AdBanner';
import { getAdSlotId } from '@/lib/ads/ad-manager';

interface DashboardShellProps {
  children: React.ReactNode;
  userProfile?: UserProfile | null;
  activeView?: ViewType; 
  onLogin?: () => void;
}

export function DashboardShell({ children, activeView = 'home', onLogin }: DashboardShellProps) {
  const { userProfile, newUnlock, clearNewUnlock } = useRewards();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logoutUser();
    // Force reload/redirect to ensure auth state clears
    window.location.href = '/'; 
  };

  const handleNavigate = (view: ViewType) => {
    // Map ViewTypes to routes
    switch (view) {
        case 'home': router.push('/play'); break;
        case 'learn': router.push('/learn'); break;
        case 'puzzles': router.push('/puzzles'); break;
        case 'openings': router.push('/openings'); break;
        case 'endgame': router.push('/endgame'); break;
        case 'analysis': router.push('/play?view=analysis'); break; 
        case 'history': router.push('/play?view=history'); break;
        case 'settings': router.push('/play?view=settings'); break;
        case 'leaderboard': router.push('/play?view=leaderboard'); break;
        case 'profile': router.push('/play?view=profile'); break;
        case 'game': router.push('/play'); break; 
        case 'review': router.push('/review'); break;
        case 'news': router.push('/news'); break; // Added news
        default: router.push('/play');
    }
  };

  const sidebarAdSlot = getAdSlotId('sidebar');

  return (
    <div className="flex min-h-dvh lg:h-dvh bg-[#0d1221] text-gray-100 font-sans lg:overflow-hidden relative">
        {/* Left Ad Sidebar (XL screens) */}
        <div className="hidden xl:flex w-[280px] border-r border-white/5 flex-col gap-6 p-4 overflow-hidden bg-[#0d1221] shrink-0">
            <div className="w-full h-full flex items-center justify-center rounded-xl overflow-hidden bg-white/5 border border-white/5">
                <AdBanner 
                    dataAdSlot={sidebarAdSlot}
                    dataAdFormat="vertical"
                    className="w-full"
                />
            </div>
        </div>

        {/* Persistent Sidebar */}
        <Sidebar 
            activeView={activeView}
            onNavigate={handleNavigate}
            userProfile={userProfile}
            onLogout={handleLogout}
            onLogin={onLogin}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 relative min-h-full lg:h-full flex flex-col lg:overflow-hidden">
            

            {/* Mobile Header - Visible on all screens below lg */}
            <div className="lg:hidden h-14 bg-[#1a2744] border-b border-[#3a4a6e] flex items-center justify-between px-4 shrink-0 z-40 relative">
                 <div className="flex items-center gap-3">
                     {activeView !== 'home' && (
                         <button 
                            onClick={() => router.push('/')}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                         >
                            <ChevronLeft size={24} />
                         </button>
                     )}
                     <span className="font-bold text-white text-lg">
                        {activeView === 'home' ? 'ChessBuddies' : 
                         activeView.charAt(0).toUpperCase() + activeView.slice(1)}
                     </span>
                 </div>
                 <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">Menu</span>
                    <Menu size={24} />
                 </button>
            </div>

            {/* Content Slot - Fixed for Game/Review views to ensure board visibility */}
            <div className={`flex-1 relative flex flex-col ${['game', 'play', 'review', 'analysis'].includes(activeView) ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'}`}>
                {children}
            </div>



            {/* Global Achievement Celebration */}
            <CelebrationModal 
                achievementId={newUnlock} 
                onClose={clearNewUnlock} 
            />
        </main>

        {/* Right Ad Sidebar (XL screens) */}
        <div className="hidden xl:flex w-[280px] border-l border-white/5 flex-col gap-6 p-4 overflow-hidden bg-[#0d1221] shrink-0">
            <div className="w-full h-full flex items-center justify-center rounded-xl overflow-hidden bg-white/5 border border-white/5">
                <AdBanner 
                    dataAdSlot={sidebarAdSlot}
                    dataAdFormat="vertical"
                    className="w-full"
                />
            </div>
        </div>
    </div>
  );
}
