'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export type ReactionType = 'success' | 'error' | 'hint';

interface AcademyReactionProps {
  type: ReactionType | null;
  message?: string;
  onComplete?: () => void;
}

export function AcademyReaction({ type, message, onComplete }: AcademyReactionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (type) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [type, onComplete]);

  if (!type) return null;

  const config = {
    success: {
      image: '/mascot_buddy.png',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500',
      textColor: 'text-emerald-400',
      shadow: 'shadow-emerald-500/20',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.4)]'
    },
    error: {
      image: '/mascot_buddy.png',
      bgColor: 'bg-rose-500/20',
      borderColor: 'border-rose-500',
      textColor: 'text-rose-400',
      shadow: 'shadow-rose-500/20',
      glow: 'shadow-[0_0_30px_rgba(244,63,94,0.4)]'
    },
    hint: {
      image: '/mascot_buddy.png',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-400',
      shadow: 'shadow-blue-500/20',
      glow: 'shadow-[0_0_30px_rgba(59,130,246,0.4)]'
    }
  }[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          className="fixed bottom-10 right-10 z-[100] flex items-center gap-4 pointer-events-none"
        >
          {/* Reaction Bubble */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`px-6 py-4 rounded-2xl border-2 ${config.bgColor} ${config.borderColor} ${config.shadow} backdrop-blur-md shadow-2xl max-w-xs`}
          >
            <p className={`text-lg font-black ${config.textColor} tracking-tight`}>
              {message || (type === 'success' ? 'Brilliant!' : 'Oops! Try again!')}
            </p>
          </motion.div>

          {/* Mascot Image */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: type === 'success' ? [0, 5, -5, 0] : [0, -2, 2, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`relative w-40 h-40 drop-shadow-2xl z-20 rounded-full transition-all duration-500 ${config.glow}`}
          >
            <Image
              src={config.image}
              alt="Mascot Reaction"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
