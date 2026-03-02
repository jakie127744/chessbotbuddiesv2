'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, X } from 'lucide-react';
import { Achievement, ACHIEVEMENTS } from '@/contexts/RewardsContext';

interface AchievementToastProps {
    achievementId: string | null;
    onClose: () => void;
}

export function AchievementToast({ achievementId, onClose }: AchievementToastProps) {
    const [achievement, setAchievement] = useState<Achievement | null>(null);

    useEffect(() => {
        if (achievementId) {
            const found = ACHIEVEMENTS.find(a => a.id === achievementId);
            if (found) {
                setAchievement(found);
                // Auto-close after 5 seconds
                const timer = setTimeout(onClose, 5000);
                return () => clearTimeout(timer);
            }
        } else {
            setAchievement(null);
        }
    }, [achievementId, onClose]);

    return (
        <AnimatePresence>
            {achievement && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90vw] max-w-sm"
                >
                    <div className="bg-[#1e293b] border-2 border-amber-400/50 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(251,191,36,0.2)] flex items-center gap-4 relative overflow-hidden group">
                        {/* Background particles/flare effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-transparent pointer-events-none" />
                        <motion.div 
                            animate={{ 
                                opacity: [0.1, 0.3, 0.1],
                                scale: [1, 1.2, 1] 
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -right-4 -top-4 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl"
                        />

                        {/* Icon */}
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                            <Trophy className="text-white w-8 h-8" strokeWidth={2.5} />
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Achievement Unlocked!</span>
                                <div className="h-1 w-1 rounded-full bg-slate-600" />
                                <span className="text-[10px] font-bold text-slate-400">+{achievement.xpReward} XP</span>
                            </div>
                            <h4 className="font-display font-black text-white text-lg leading-tight truncate">
                                {achievement.title}
                            </h4>
                            <p className="text-xs text-slate-400 truncate">
                                {achievement.description}
                            </p>
                        </div>

                        {/* Close button */}
                        <button 
                            onClick={onClose}
                            className="p-1.5 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>

                        {/* Progress Bar (Timer) */}
                        <motion.div 
                            initial={{ scaleX: 1 }}
                            animate={{ scaleX: 0 }}
                            transition={{ duration: 5, ease: "linear" }}
                            className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400 origin-left"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
