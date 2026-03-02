'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PieceStyle } from '@/lib/piece-sets';

interface PieceStyleContextType {
  pieceStyle: PieceStyle;
  setPieceStyle: (style: PieceStyle) => void;
}

const PieceStyleContext = createContext<PieceStyleContextType | undefined>(undefined);

interface PieceStyleProviderProps {
  children: ReactNode;
}

export function PieceStyleProvider({ children }: PieceStyleProviderProps) {
  const [pieceStyle, setPieceStyleState] = useState<PieceStyle>('staunty');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pieceStyle') as PieceStyle;
      if (saved) {
        setPieceStyleState(saved);
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage and update state
  const setPieceStyle = (style: PieceStyle) => {
    setPieceStyleState(style);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pieceStyle', style);
    }
  };

  // Prevent hydration mismatch
  if (!isLoaded) {
    return <>{children}</>;
  }

  return (
    <PieceStyleContext.Provider value={{ pieceStyle, setPieceStyle }}>
      {children}
    </PieceStyleContext.Provider>
  );
}

export function usePieceStyle() {
  const context = useContext(PieceStyleContext);
  if (context === undefined) {
    // Return default if used outside provider
    return { pieceStyle: 'staunty' as PieceStyle, setPieceStyle: () => {} };
  }
  return context;
}
