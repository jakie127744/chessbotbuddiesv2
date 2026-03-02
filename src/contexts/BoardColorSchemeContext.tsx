'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BoardColorScheme } from '../redesign/lib/board-colors';

interface BoardColorSchemeContextType {
  colorScheme: BoardColorScheme;
  setColorScheme: (scheme: BoardColorScheme) => void;
}

const BoardColorSchemeContext = createContext<BoardColorSchemeContextType | undefined>(undefined);

interface BoardColorSchemeProviderProps {
  children: ReactNode;
}

export function BoardColorSchemeProvider({ children }: BoardColorSchemeProviderProps) {
  const [colorScheme, setColorSchemeState] = useState<BoardColorScheme>('ocean');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('boardColorScheme') as BoardColorScheme;
      if (saved) {
        setColorSchemeState(saved);
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage and update state
  const setColorScheme = (scheme: BoardColorScheme) => {
    setColorSchemeState(scheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('boardColorScheme', scheme);
    }
  };

  // Prevent hydration mismatch by not rendering until loaded
  if (!isLoaded) {
    return <>{children}</>;
  }

  return (
    <BoardColorSchemeContext.Provider value={{ colorScheme, setColorScheme }}>
      {children}
    </BoardColorSchemeContext.Provider>
  );
}

export function useBoardColorScheme() {
  const context = useContext(BoardColorSchemeContext);
  if (context === undefined) {
    // Return default if used outside provider (graceful fallback)
    return { colorScheme: 'ocean' as BoardColorScheme, setColorScheme: () => {} };
  }
  return context;
}
