"use client";

import { RewardsProvider } from "@/contexts/RewardsContext";
import { PieceStyleProvider } from "@/contexts/PieceStyleContext";
import { BoardColorSchemeProvider } from "@/redesign/contexts/BoardColorSchemeContext";

export default function TrainingLayout({ children }: { children: React.ReactNode }) {
  return (
    <RewardsProvider>
      <PieceStyleProvider>
        <BoardColorSchemeProvider>
          {children}
        </BoardColorSchemeProvider>
      </PieceStyleProvider>
    </RewardsProvider>
  );
}
