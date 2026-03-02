import { useState, useEffect, useCallback, useRef } from 'react';

// Bot Voice Configurations
const VOICE_PROFILES: Record<string, { pitch: number; rate: number; gender: 'male' | 'female' }> = {
  // Ley-an (Child)
  'bot-rookie': { pitch: 1.5, rate: 1.1, gender: 'female' },
  // James (Hyper Blitz)
  'bot-novice': { pitch: 1.1, rate: 1.4, gender: 'male' },
  // Orion (Coach)
  'bot-tactician': { pitch: 0.9, rate: 1.1, gender: 'male' },
  // Izy (Shy)
  'bot-knight-rider': { pitch: 1.2, rate: 0.85, gender: 'female' },
  // Warren (Dad)
  'bot-rook-rocket': { pitch: 0.8, rate: 0.9, gender: 'male' },
  // Mida (Teacher)
  'bot-strategist': { pitch: 1.1, rate: 0.95, gender: 'female' },
  // Eugene (Old)
  'bot-fortress': { pitch: 0.7, rate: 0.85, gender: 'male' },
  // Wesley (GM)
  'bot-grandmaster': { pitch: 1.0, rate: 1.0, gender: 'male' },
};

export function useBotVoice() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const synth = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synth.current = window.speechSynthesis;

      const loadVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const getBestVoice = useCallback((gender: 'male' | 'female', preferredLocale = 'en-US') => {
    // Basic heuristic to find a suitable voice
    // 1. Match locale + exact gender name (e.g. "Google US English Male")
    // 2. Match locale
    // 3. Fallback
    const candidates = voices.filter(v => v.lang.startsWith('en'));
    
    // Try to find a voice that specifically mentions gender if possible (some browsers don't expose this well)
    // Common identifiers: "Female", "Male", "Zira" (F), "David" (M), "Google US English"
    
    const preferred = candidates.find(v => {
      const name = v.name.toLowerCase();
      if (gender === 'female') return name.includes('female') || name.includes('zira') || name.includes('samantha');
      return name.includes('male') || name.includes('david') || name.includes('daniel');
    });

    return preferred || candidates[0] || null;
  }, [voices]);

  const speak = useCallback((text: string, botId: string) => {
    if (isMuted || !synth.current || voices.length === 0) return;

    // Cancel current speech to avoid queue buildup mostly, but for banter maybe we want overlap? 
    // Usually canceling is safer for UI responsiveness.
    synth.current.cancel();

    const profile = VOICE_PROFILES[botId] || { pitch: 1, rate: 1, gender: 'female' };
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.pitch = profile.pitch;
    utterance.rate = profile.rate;
    
    const voice = getBestVoice(profile.gender);
    if (voice) utterance.voice = voice;

    synth.current.speak(utterance);
  }, [isMuted, voices, getBestVoice]);

  const stop = useCallback(() => {
    if (synth.current) synth.current.cancel();
  }, []);

  return { speak, stop, isMuted, setIsMuted, hasSupport: !!synth.current };
}
