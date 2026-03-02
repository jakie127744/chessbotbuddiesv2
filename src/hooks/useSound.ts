import { useCallback, useRef } from 'react';

interface SoundEffects {
  move: string;
  capture: string;
  check: string;
  success: string;
  error: string;
  notify: string;
}

// Using data URIs for simple beep sounds (or you can use actual audio files)
const SOUNDS: SoundEffects = {
  // Move sound - soft click (440Hz, 50ms)
  move: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
  
  // Capture sound - deeper tone (220Hz, 100ms)
  capture: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
  
  // Check sound - alert (880Hz, 80ms)
  check: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
  
  // Success - pleasant chime (sequence: 440Hz, 554Hz, 659Hz)
  success: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
  
  // Error - low buzz (110Hz, 150ms)
  error: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
  
  // Notification - gentle ping (660Hz, 60ms)
  notify: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
};

export function useSound() {
  const audioContext = useRef<AudioContext | null>(null);
  const isEnabled = useRef(true);

  // Initialize AudioContext on first use
  const getAudioContext = useCallback(() => {
    if (!audioContext.current && typeof window !== 'undefined') {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext.current;
  }, []);

  // Play a tone using Web Audio API (better than audio files for simple sounds)
  const playTone = useCallback((frequency: number, duration: number, volume: number = 0.1) => {
    if (!isEnabled.current) return;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.warn('[Sound] Failed to play tone:', error);
    }
  }, [getAudioContext]);

  const playMove = useCallback(() => {
    playTone(440, 0.05, 0.08); // A4 note, 50ms
  }, [playTone]);

  const playCapture = useCallback(() => {
    playTone(220, 0.1, 0.12); // A3 note, 100ms, slightly louder
  }, [playTone]);

  const playCheck = useCallback(() => {
    playTone(880, 0.08, 0.15); // A5 note, 80ms, louder for alert
  }, [playTone]);

  const playSuccess = useCallback(() => {
    // Pleasant ascending chime
    playTone(523, 0.08, 0.1); // C5
    setTimeout(() => playTone(659, 0.08, 0.1), 80); // E5
    setTimeout(() => playTone(784, 0.15, 0.12), 160); // G5
  }, [playTone]);

  const playError = useCallback(() => {
    playTone(147, 0.15, 0.1); // Low D, 150ms
  }, [playTone]);

  const playNotify = useCallback(() => {
    playTone(660, 0.06, 0.08); // E5, short ping
  }, [playTone]);

  const toggleSound = useCallback(() => {
    isEnabled.current = !isEnabled.current;
    return isEnabled.current;
  }, []);

  return {
    playMove,
    playCapture,
    playCheck,
    playSuccess,
    playError,
    playNotify,
    toggleSound,
    isEnabled: isEnabled.current
  };
}
