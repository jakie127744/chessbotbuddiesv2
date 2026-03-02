'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement, ACHIEVEMENTS } from '@/contexts/RewardsContext';
import { AchievementIcon } from './AchievementIcons';
import { X } from 'lucide-react';

interface CelebrationModalProps {
    achievementId: string | null;
    onClose: () => void;
}

export function CelebrationModal({ achievementId, onClose }: CelebrationModalProps) {
    const [achievement, setAchievement] = useState<Achievement | null>(null);

    useEffect(() => {
        if (achievementId) {
            const found = ACHIEVEMENTS.find(a => a.id === achievementId);
            if (found) {
                setAchievement(found);
            }
        } else {
            setAchievement(null);
        }
    }, [achievementId]);

    // Particle effect helper
    const particles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100 - 50, // -50 to 50
        y: Math.random() * 100 - 50,
        color: ['#fbbf24', '#f59e0b', '#3b82f6', '#ef4444', '#10b981'][Math.floor(Math.random() * 5)]
    }));

    return (
        <AnimatePresence>
            {achievement && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 100 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50 }}
                        transition={{ type: "spring", damping: 15, stiffness: 200 }}
                        className="relative w-full max-w-md bg-gradient-to-br from-[#1e293b] to-[#0f1729] border-4 border-amber-400 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(251,191,36,0.2)] overflow-hidden"
                    >
                        {/* Confetti Explosion */}
                        {particles.map((p) => (
                            <motion.div
                                key={p.id}
                                initial={{ x: 0, y: 0, scale: 0 }}
                                animate={{ 
                                    x: p.x * 5, 
                                    y: p.y * 5, 
                                    opacity: [1, 1, 0],
                                    scale: [0, 1.5, 0]
                                }}
                                transition={{ duration: 0.8, ease: "easeOut", times: [0, 0.5, 1] }}
                                className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                                style={{ backgroundColor: p.color }}
                            />
                        ))}

                        {/* Spinning Glow Background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-transparent via-amber-400/10 to-transparent rotate-45 blur-3xl animate-spin-slow pointer-events-none" />

                        {/* Achievement Icon */}
                        <motion.div 
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="relative mx-auto mb-6 w-32 h-32 flex items-center justify-center bg-gradient-to-b from-[#334155] to-[#1e293b] rounded-full border-4 border-amber-400/50 shadow-xl"
                        >
                            <AchievementIcon 
                                iconName={achievement.icon} 
                                className="w-20 h-20" 
                                tier={achievement.tier} 
                            />
                            
                            {/* Tier Badge */}
                            <div className="absolute -bottom-2 px-3 py-1 bg-amber-400 text-black text-xs font-black uppercase tracking-widest rounded-full">
                                {achievement.tier}
                            </div>
                        </motion.div>

                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h2 className="text-3xl font-black text-white italic tracking-tight mb-2 uppercase drop-shadow-lg">
                                Achievement Unlocked!
                            </h2>
                            <h3 className="text-xl font-bold text-amber-400 mb-4">
                                {achievement.title}
                            </h3>
                            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                                {achievement.description}
                            </p>

                            {/* Rewards */}
                            <div className="flex items-center justify-center gap-4 mb-8">
                                <div className="px-6 py-2 bg-slate-800 rounded-xl border border-slate-700 flex items-center gap-2">
                                    <span className="text-amber-400 font-bold">XP</span>
                                    <span className="text-white font-black text-xl">+{achievement.xpReward}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            onClick={onClose}
                            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-black text-white text-xl shadow-lg shadow-green-500/20 hover:scale-105 transition-transform active:scale-95"
                        >
                            AWESOME!
                        </motion.button>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
