'use client';

import { DashboardShell } from '@/redesign/components/DashboardShell';
import { usePathname } from 'next/navigation';
import { ViewType } from '@/redesign/components/Sidebar';
import { RewardsProvider } from '@/contexts/RewardsContext';
import { BoardColorSchemeProvider } from '@/redesign/contexts/BoardColorSchemeContext';
import { PieceStyleProvider } from '@/contexts/PieceStyleContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Map pathname to ViewType
  let activeView: ViewType = 'home';
  if (pathname.includes('/play')) activeView = 'game';
  else if (pathname.includes('/review')) activeView = 'review';
  else if (pathname.includes('/analysis')) activeView = 'analysis';
  else if (pathname.includes('/puzzles')) activeView = 'puzzles';
  else if (pathname.includes('/history')) activeView = 'history';
  else if (pathname.includes('/learn')) activeView = 'learn';
  else if (pathname.includes('/leaderboard')) activeView = 'leaderboard';
  else if (pathname.includes('/settings')) activeView = 'profile';

  return (
    <RewardsProvider>
      <PieceStyleProvider>
        <BoardColorSchemeProvider>
          <DashboardShell activeView={activeView}>
            {children}
          </DashboardShell>
        </BoardColorSchemeProvider>
      </PieceStyleProvider>
    </RewardsProvider>
  );
}
