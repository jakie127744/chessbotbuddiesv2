import React from 'react';
import { X, Trophy, Swords, Brain, BookOpen, Crown, Medal, Globe, MapPin, Calendar } from 'lucide-react';
import { LeaderboardEntry } from '@/lib/leaderboard-data';
import { FlagComponent } from './FlagComponent';

interface UserProfileModalProps {
  user: LeaderboardEntry;
  onClose: () => void;
}

export function UserProfileModal({ user, onClose }: UserProfileModalProps) {
  const winRate = user.gamesPlayed > 0 
    ? Math.round(((user.wins || 0) / user.gamesPlayed) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#0f172a] border border-[#1e293b] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header/Banner */}
        <div className="h-32 bg-gradient-to-r from-[#1e293b] to-[#334155] relative grow-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/80 hover:text-white transition-all z-10"
          >
            <X size={20} />
          </button>
          
          {/* Avatar Ring */}
          <div className="absolute -bottom-12 left-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#5ec2f2] to-[#a78bfa] flex items-center justify-center text-4xl font-bold text-white shadow-xl border-4 border-[#0f172a]">
                 {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-6 rounded shadow-lg overflow-hidden border-2 border-[#0f172a]">
                <FlagComponent country={user.country} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pt-16 px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                {user.username}
                {user.elo >= 2400 && <Crown className="text-yellow-400" size={24} />}
              </h1>
              <div className="flex items-center gap-3 text-white/40 text-sm">
                <span className="flex items-center gap-2">
                    <FlagComponent country={user.country || 'US'} className="w-5 h-5 rounded-sm shadow-sm" /> 
                    {user.country}
                </span>
                <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                <span className="flex items-center gap-1"><Calendar size={14} /> Joined 2024</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white/40 uppercase tracking-wider">Rating</span>
              <span className="text-3xl font-mono font-bold text-[#5ec2f2] bg-[#5ec2f2]/10 px-3 py-1 rounded-xl">
                {user.elo}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatCard 
              label="Games" 
              value={user.gamesPlayed} 
              icon={<Swords className="text-blue-400" size={18} />} 
              subValue={`${user.wins || 0}W ${user.losses || 0}L`}
            />
            <StatCard 
              label="Win Rate" 
              value={`${winRate}%`} 
              icon={<Trophy className="text-yellow-400" size={18} />} 
            />
            <StatCard 
              label="Puzzles" 
              value={user.puzzlesSolved || 0} 
              icon={<Brain className="text-purple-400" size={18} />} 
            />
            <StatCard 
              label="Lessons" 
              value={user.lessonsCompleted || 0} 
              icon={<BookOpen className="text-emerald-400" size={18} />} 
            />
          </div>

          {/* Section: Chess Activity */}
          <div className="space-y-6">
            <div className="bg-[#1e293b]/50 rounded-2xl p-6 border border-[#334155]">
              <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Medal size={16} className="text-yellow-500" />
                Performance Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Tactics Accuracy</span>
                  <span className="text-white font-bold">Standard</span>
                </div>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full w-[65%]" />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Lesson Completion</span>
                  <span className="text-white font-bold">{Math.min(100, (user.lessonsCompleted || 0) * 10)}%</span>
                </div>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, (user.lessonsCompleted || 0) * 10)}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-[#1e293b]/50 rounded-2xl p-6 border border-[#334155]">
               <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Recent Games</h3>
               <div className="text-center py-8 text-white/20 italic">
                  No public game history available for this user yet.
               </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#1e293b] bg-[#1e293b]/30 shrink-0 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-[#5ec2f2] hover:bg-[#4ab5e6] text-[#0f172a] font-bold rounded-xl transition-all shadow-lg hover:shadow-[#5ec2f2]/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, icon }: { label: string, value: string | number, subValue?: string, icon: React.ReactNode }) {
  return (
    <div className="bg-[#1e293b]/50 p-4 rounded-2xl border border-[#334155] hover:border-[#5ec2f2]/30 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      {subValue && <div className="text-[10px] text-white/30 mt-1 font-medium">{subValue}</div>}
    </div>
  );
}
