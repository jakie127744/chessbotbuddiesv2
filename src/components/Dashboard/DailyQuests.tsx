'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, Circle, Star, Trophy, Swords, BookOpen } from 'lucide-react';

export interface Quest {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    progress: number;
    target: number;
    completed: boolean;
    rewardXp: number;
}

interface DailyQuestsProps {
    quests: Quest[];
}

export function DailyQuests({ quests }: DailyQuestsProps) {
    return (
        <div className="bg-bg-secondary/50 border border-border-color/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Target className="text-sky-blue w-5 h-5" />
                    <h3 className="font-display font-bold text-lg text-text-primary">Daily Quests</h3>
                </div>
                <div className="px-2 py-1 bg-sky-blue/10 border border-sky-blue/20 rounded-md text-[10px] font-black uppercase text-sky-blue">
                    Resets in 8h
                </div>
            </div>

            <div className="space-y-4">
                {quests.map((quest) => (
                    <div key={quest.id} className="relative">
                        <div className={`flex items-start gap-4 p-3 rounded-xl transition-all ${quest.completed ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-bg-tertiary/20'}`}>
                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${quest.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-bg-tertiary text-text-muted'}`}>
                                <quest.icon size={20} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className={`text-sm font-bold truncate ${quest.completed ? 'text-emerald-400 line-through opacity-70' : 'text-text-primary'}`}>
                                        {quest.title}
                                    </h4>
                                    {quest.completed ? (
                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                    ) : (
                                        <span className="text-[10px] font-bold text-text-muted">{quest.progress}/{quest.target}</span>
                                    )}
                                </div>
                                <p className="text-[11px] text-text-muted mb-2 leading-tight">
                                    {quest.description}
                                </p>

                                {/* Progress Bar */}
                                {!quest.completed && (
                                    <div className="h-1.5 w-full bg-bg-tertiary rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(quest.progress / quest.target) * 100}%` }}
                                            className="h-full bg-sky-blue bg-gradient-to-r from-sky-blue to-indigo-500"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Reward Tag */}
                            {!quest.completed && (
                                <div className="ml-2 flex flex-col items-center gap-0.5">
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                                        <Trophy size={10} />
                                        {quest.rewardXp}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Claim All Button (Conditional) */}
            <button className="w-full mt-6 py-3 bg-gradient-to-r from-sky-blue/10 to-indigo-500/10 border border-sky-blue/20 hover:border-sky-blue/40 rounded-xl text-xs font-bold text-sky-blue transition-all active:scale-[0.98]">
                View All Quests
            </button>
        </div>
    );
}
