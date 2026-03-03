'use client';

import type { ReactNode } from 'react';
import { RewardsProvider } from '@/contexts/RewardsContext';
import { BoardColorSchemeProvider } from '@/contexts/BoardColorSchemeContext';
import { PieceStyleProvider } from '@/contexts/PieceStyleContext';

interface ProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: ProvidersProps) {
  return (
    <RewardsProvider>
      <PieceStyleProvider>
        <BoardColorSchemeProvider>{children}</BoardColorSchemeProvider>
      </PieceStyleProvider>
    </RewardsProvider>
  );
}
