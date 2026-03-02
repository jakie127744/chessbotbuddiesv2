'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type MascotMood = 'idle' | 'happy' | 'oops' | 'thinking' | 'sleeping';

interface DynamicMascotProps {
  size?: number;
  mood?: MascotMood;
  className?: string;
  isThinking?: boolean;
}

/**
 * Buddy the Mascot - The high-tech Knight Bot!
 * Features dynamic eye movements, blinking, and emoji-style reactions.
 */
export function DynamicMascot({ 
  size = 120, 
  mood = 'idle', 
  className = '',
  isThinking = false
}: DynamicMascotProps) {
  const [blink, setBlink] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const audioRefSuccess = useRef<HTMLAudioElement | null>(null);
  const audioRefError = useRef<HTMLAudioElement | null>(null);

  // Blinking logic
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, Math.random() * 3000 + 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Thinking / Idle movement logic
  useEffect(() => {
    if (isThinking || mood === 'thinking') {
      const moveInterval = setInterval(() => {
        setEyeOffset({
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 2
        });
      }, 500);
      return () => clearInterval(moveInterval);
    } else {
      setEyeOffset({ x: 0, y: 0 });
    }
  }, [isThinking, mood]);



  // Helper to render eyes based on mood
  const renderEyes = () => {
    if (blink && mood !== 'happy') return null; // Simple blink

    switch (mood) {
      case 'happy':
        return (
          <div className="flex gap-4">
             {/* Sparkling / Arched Eyes */}
             <motion.div 
               animate={{ scale: [1, 1.2, 1] }} 
               transition={{ repeat: Infinity, duration: 1 }}
               className="w-4 h-4 text-yellow-400"
             >
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
             </motion.div>
             <motion.div 
               animate={{ scale: [1, 1.2, 1] }} 
               transition={{ repeat: Infinity, duration: 1, delay: 0.1 }}
               className="w-4 h-4 text-yellow-400"
             >
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
             </motion.div>
          </div>
        );
      case 'oops':
        return (
          <div className="flex gap-5">
            <div className="text-red-400 font-bold text-xl leading-none">×</div>
            <div className="text-red-400 font-bold text-xl leading-none">×</div>
          </div>
        );
      case 'thinking':
      case 'idle':
      default:
        return (
          <div className="flex gap-6">
            <motion.div 
              style={{ x: eyeOffset.x, y: eyeOffset.y }}
              className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee] transition-all"
            />
            <motion.div 
              style={{ x: eyeOffset.x, y: eyeOffset.y }}
              className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee] transition-all"
            />
          </div>
        );
    }
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <motion.div
        animate={mood === 'happy' ? { y: [0, -10, 0] } : {}}
        transition={{ repeat: Infinity, duration: 0.6 }}
        className="relative w-full h-full"
      >
        {/* Base Character */}
        <img 
          src="/mascot.png" 
          alt="Buddy" 
          className="w-full h-full object-contain pointer-events-none"
        />

        {/* Dynamic Facial Overlay - Visor Area */}
        <div className="absolute top-[50%] left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none w-[50%] h-[20%]">
           <AnimatePresence mode="wait">
             <motion.div
               key={mood + (blink ? '-blink' : '')}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex items-center justify-center"
             >
                {renderEyes()}
             </motion.div>
           </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
