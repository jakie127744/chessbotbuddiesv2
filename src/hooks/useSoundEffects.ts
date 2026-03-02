'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

type SoundType = 'success' | 'error' | 'move' | 'capture' | 'check' | 'game-start';

// Using simple base64 encoded WAVs for reliability
const SOUND_URLS: Record<SoundType, string> = {
  // Simple sine wave beep (Success - High pitch)
  'success': 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' + 'A'.repeat(100), // Placeholder (will use reliable ones)
  'error': 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' + 'A'.repeat(100),
  'move': 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' + 'A'.repeat(50),
  'capture': 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' + 'A'.repeat(80),
  'check': 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' + 'A'.repeat(60),
  'game-start': 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' + 'A'.repeat(100),
};

// BETTER APPROACH: Use the Web Audio API wrapper from useSound.ts if possible, or robust local files.
// Since I don't have valid base64 strings handy for complex sounds, I will revert to using the useSound hook logic 
// or simple reliable URLs if allowed. 
// However, the user error is specific to "No supported sources".
// Let's use the EXISTING useSound hook which works!

import { useSound } from '@/hooks/useSound';

export function useSoundEffects() {
  const { playMove, playCapture, playCheck, playSuccess, playError, playNotify } = useSound();
  const [isMuted, setIsMuted] = useState(false);

  const playSound = useCallback((type: SoundType) => {
    if (isMuted) return;
    try {
        switch (type) {
            case 'move': playMove(); break;
            case 'capture': playCapture(); break;
            case 'check': playCheck(); break;
            case 'success': playSuccess(); break;
            case 'error': playError(); break;
            case 'game-start': playNotify(); break;
        }
    } catch (e) {
      console.warn("Sound error:", e);
    }
  }, [isMuted, playMove, playCapture, playCheck, playSuccess, playError, playNotify]);

  const toggleMute = useCallback(() => setIsMuted(prev => !prev), []);

  return { playSound, isMuted, toggleMute };
}
