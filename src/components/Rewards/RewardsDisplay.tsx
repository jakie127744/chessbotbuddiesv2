'use client';

import { useRewards } from '@/contexts/RewardsContext';
import { Star, Trophy, Zap, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export function RewardsDisplay() {
  const { xp, level, stars, streak } = useRewards();

  return (
    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-lg">
      
      {/* Level Badge */}
      <div className="relative group cursor-help">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center border-2 border-white shadow-md z-10 relative">
          <span className="font-display font-bold text-white text-lg">{level}</span>
        </div>
        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-[10px] text-white px-1.5 py-0.5 rounded-full font-bold border border-white">
          LVL
        </div>
        
        {/* Tooltip */}
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Level {level}
        </div>
      </div>

      {/* XP Bar */}
      <div className="flex flex-col gap-1 w-32">
        <div className="flex justify-between items-center px-1">
          <div className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-500" /> XP
          </div>
          <span className="text-[10px] font-bold text-theme-primary">{xp.toLocaleString()}</span>
        </div>
        <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-400 to-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (xp % 1000) / 10)}%` }} // Rough progress viz
            transition={{ type: "spring", stiffness: 50 }}
          />
        </div>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-1.5 bg-yellow-400/20 px-3 py-1.5 rounded-lg border border-yellow-400/30">
        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        <span className="font-display font-bold text-theme-primary">{stars}</span>
      </div>

      {/* Trophy / Achievements Entry */}
      <button className="p-2 hover:bg-black/5 rounded-lg transition-colors text-theme-secondary hover:text-theme-primary">
        <Trophy className="w-5 h-5" />
      </button>

      {/* Streak */}
      <div className="flex items-center gap-1.5 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20 group relative cursor-help">
        <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
        <span className="font-display font-bold text-orange-500">{streak}</span>
        
        {/* Tooltip */}
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
           Day Streak
        </div>
      </div>
    </div>
  );
}
