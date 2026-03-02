'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, ChevronUp, ChevronDown, User, Star, GraduationCap, Brain, Zap } from 'lucide-react';
import { useRewards } from '@/contexts/RewardsContext';
import { fetchGlobalLeaderboard, LeaderboardEntry, LeaderboardMetric } from '@/lib/leaderboard-data';

const TABS: { id: LeaderboardMetric; label: string; icon: any }[] = [
  { id: 'rating', label: 'Rating', icon: Trophy },
  { id: 'xp', label: 'XP Points', icon: Zap },
  { id: 'puzzles', label: 'Puzzles', icon: Brain },
  { id: 'lessons', label: 'Lessons', icon: GraduationCap },
];

export function LeaderboardView() {
  const { userProfile: user, stats, xp } = useRewards();
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<LeaderboardMetric>('rating');

  useEffect(() => {
      const loadData = async () => {
          if (!user) return;
          setIsLoading(true);
          try {
              const currentRating = user.rating || 800;
              const result = await fetchGlobalLeaderboard(user, stats, currentRating, xp, activeMetric);
              setData(result);
          } catch (error) {
              console.error('Failed to load leaderboard:', error);
          } finally {
              setIsLoading(false);
          }
      };
      loadData();
  }, [user, stats, xp, activeMetric]);

  const getMetricValue = (player: LeaderboardEntry) => {
    switch (activeMetric) {
      case 'xp': return `${player.xp?.toLocaleString()} XP`;
      case 'puzzles': return `${player.puzzlesSolved} Solved`;
      case 'lessons': return `${player.lessonsCompleted} Done`;
      case 'rating': default: return player.elo;
    }
  };

  const getMetricLabel = () => {
    switch (activeMetric) {
      case 'xp': return 'Experience';
      case 'puzzles': return 'Puzzles';
      case 'lessons': return 'Lessons';
      case 'rating': default: return 'Rating';
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header section */}
      <section className="bg-redesign-glass-bg border border-redesign-glass-border rounded-3xl p-8 flex items-center justify-between gap-8">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-redesign-cyan/10 flex items-center justify-center border border-redesign-cyan/20">
               <Trophy size={32} className="text-redesign-cyan" />
            </div>
            <div>
               <h2 className="text-2xl font-black text-white leading-tight">Global Rankings</h2>
               <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">See how you stack up against the best</p>
            </div>
         </div>

         {/* Tabs Container */}
         <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5">
            {TABS.map((tab) => {
               const Icon = tab.icon;
               const isActive = activeMetric === tab.id;
               return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMetric(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-redesign-cyan text-slate-950 shadow-lg shadow-redesign-cyan/20' 
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                     <Icon size={14} />
                     {tab.label}
                  </button>
               );
            })}
         </div>
      </section>

      {/* Leaderboard Table Container */}
      <div className="flex-1 bg-redesign-glass-bg border border-redesign-glass-border rounded-3xl overflow-hidden flex flex-col">
         <div className="px-8 py-5 border-b border-redesign-glass-border grid grid-cols-12 text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-white/[0.01]">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Player</div>
            <div className="col-span-2">{getMetricLabel()}</div>
            <div className="col-span-2">Growth/Stats</div>
            <div className="col-span-2 text-right">Matches</div>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            {isLoading ? (
               <div className="absolute inset-0 flex items-center justify-center text-zinc-500 font-bold">
                 <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-redesign-cyan/30 border-t-redesign-cyan rounded-full animate-spin" />
                    <span>Updating rankings...</span>
                 </div>
               </div>
            ) : (
               data.map((player, idx) => (
                  <div 
                    key={idx}
                    className={`px-8 py-4 border-b border-white/[0.02] transition-colors grid grid-cols-12 items-center ${
                      player.isUser ? 'bg-redesign-cyan/10 hover:bg-redesign-cyan/20' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                     <div className="col-span-1">
                        {idx === 0 ? <Medal size={20} className="text-yellow-500" /> :
                         idx === 1 ? <Medal size={20} className="text-zinc-400" /> :
                         idx === 2 ? <Medal size={20} className="text-amber-600" /> :
                         <span className={`text-sm font-bold ${player.isUser ? 'text-white' : 'text-zinc-600'}`}>#{player.rank}</span>}
                     </div>
                     <div className="col-span-5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center overflow-hidden">
                           <User size={18} className="text-zinc-600" />
                        </div>
                        <div className="min-w-0">
                           <p className={`text-sm font-bold leading-tight truncate ${player.isUser ? 'text-redesign-cyan' : 'text-white'}`}>{player.username}</p>
                           <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{player.country || 'Global'}</p>
                        </div>
                     </div>
                     <div className="col-span-2">
                        <span className="text-sm font-bold text-redesign-cyan">{getMetricValue(player)}</span>
                     </div>
                     <div className="col-span-2">
                        {activeMetric === 'rating' ? (
                          <span className={`text-xs font-bold flex items-center gap-1 ${player.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                             {player.winRate >= 50 ? <ChevronUp size={12} /> : <ChevronDown size={12} />} {player.winRate}% WR
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                             {activeMetric === 'xp' ? `${player.elo} ELO` : 
                              activeMetric === 'puzzles' ? `${Math.round((player.puzzlesSolved || 0) / (player.gamesPlayed || 1) * 10) / 10} avg` : 
                              `${player.xp?.toLocaleString()} XP`}
                          </span>
                        )}
                     </div>
                     <div className="col-span-2 text-right">
                        <span className="text-sm font-bold text-zinc-500">{player.gamesPlayed}</span>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
    </div>
  );
}
