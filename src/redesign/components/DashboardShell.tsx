'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, ViewType } from './Sidebar';
import { TopBar } from './TopBar';
import { usePathname } from 'next/navigation';
import { getUserProfile, UserProfile } from '../lib/user-profile';
import { AuthModal } from './AuthModal';
import { Footer } from './Footer';
import { useRewards } from '@/contexts/RewardsContext';

interface DashboardShellProps {
  children: React.ReactNode;
  activeView?: ViewType;
}

export function DashboardShell({ children, activeView = 'home' }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { userProfile, xp, streak, stats, updateLocalProfile } = useRewards();
  const pathname = usePathname();

  const handleLogout = () => {
    // Clear logic (implementation details assumed to be in lib)
    window.location.href = '/'; 
  };

  const userStats = {
    xp: xp,
    streak: streak,
    rating: userProfile?.rating || 0
  };

  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--text-secondary)] overflow-hidden font-sans">
      {/* Redesigned Sidebar */}
      <Sidebar 
        activeView={activeView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userProfile={userProfile}
        onLogout={handleLogout}
        onLoginClick={() => setIsAuthOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Gradients (Subtle redesign touch) */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-jungle-green-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-jungle-green-700/5 blur-[120px] rounded-full pointer-events-none" />

        {/* TopBar */}
        <TopBar 
          onOpenSidebar={() => setIsSidebarOpen(true)} 
          userStats={userStats}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-4 md:p-6 lg:p-8 flex flex-col">
            <div className="max-w-7xl mx-auto w-full flex-grow">
                {children}
            </div>
            
            {/* Footer - Only visible on the main home dashboard to not steal board space */}
            {activeView === 'home' && (
              <div className="max-w-7xl mx-auto w-full mt-auto">
                 <Footer />
              </div>
            )}
        </main>
      </div>

      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => {
          updateLocalProfile(user);
          setIsAuthOpen(false);
        }}
      />
    </div>
  );
}
