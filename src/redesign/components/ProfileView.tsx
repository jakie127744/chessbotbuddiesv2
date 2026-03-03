'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Palette, 
  Trophy, 
  Camera, 
  Check, 
  Crown, 
  Settings as SettingsIcon, 
  LogOut, 
  Globe, 
  Users, 
  Star, 
  Timer, 
  Zap, 
  Rocket, 
  TrendingUp, 
  Share2, 
  Edit,
  Plus,
  Filter,
  CheckCircle2,
  Medal,
  ChevronRight
} from 'lucide-react';
import { useRewards, ACHIEVEMENTS } from '@/contexts/RewardsContext';
import { getUserProfile, updateUserProfile, UserProfile } from '@/lib/user-profile';
import { BoardColorSchemeSelector } from './BoardColorSchemeSelector';
import { PieceStyleSelector } from './PieceStyleSelector';
import { useBoardColorScheme } from '@/contexts/BoardColorSchemeContext';
import { usePieceStyle } from '@/contexts/PieceStyleContext';
import { fetchGlobalLeaderboard, LeaderboardEntry } from '@/lib/leaderboard-data';
import Link from 'next/link';
import { FlagComponent } from '@/components/FlagComponent';

interface ProfileViewProps {
  initialTab?: 'profile' | 'appearance' | 'performance';
}

export function ProfileView({ initialTab = 'performance' }: ProfileViewProps) {
  const { xp, level, stats, achievements, activityLog, userProfile: contextProfile } = useRewards();
  const [profile, setProfile] = useState<UserProfile | null>(contextProfile || getUserProfile());
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'performance'>(initialTab);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  
  const { colorScheme, setColorScheme } = useBoardColorScheme();
  const { pieceStyle, setPieceStyle } = usePieceStyle();

  useEffect(() => {
    if (!profile) {
        setProfile(getUserProfile());
    }
  }, [contextProfile]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateUserProfile({ avatar: base64String });
        setProfile(prev => prev ? { ...prev, avatar: base64String } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const loadLeaderboard = async () => {
        if (!profile) return;
        try {
            const data = await fetchGlobalLeaderboard(profile, stats, profile.rating || 800, xp, 'rating');
            setLeaderboard(data.slice(0, 5));
            const self = data.find((entry) => entry.isUser);
            if (self) setUserRank(self.rank);
        } catch (e) {
            console.error('Failed to load compact leaderboard:', e);
        } finally {
            setIsLoadingLeaderboard(false);
        }
    };
    loadLeaderboard();
  }, [profile]);

  if (!profile) return null;

  const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;
  const drawRate = stats.totalGames > 0 ? Math.round((stats.draws / stats.totalGames) * 100) : 0;
  const lossRate = stats.totalGames > 0 ? Math.round((stats.losses / stats.totalGames) * 100) : 0;

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-10 py-8 animate-in fade-in duration-500 font-lexend">
      {/* Sub Navigation Tabs */}
      <div className="mb-8 border-b border-white/10 flex justify-between items-end">
        <div className="flex gap-8">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center border-b-[3px] pb-3 transition-all ${
              activeTab === 'profile' ? 'border-jungle-green-500 text-jungle-green-400' : 'border-transparent text-zinc-500 hover:text-white'
            }`}
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Player Identity</p>
          </button>
          <button 
            onClick={() => setActiveTab('performance')}
            className={`flex flex-col items-center justify-center border-b-[3px] pb-3 transition-all ${
              activeTab === 'performance' ? 'border-jungle-green-500 text-jungle-green-400' : 'border-transparent text-zinc-500 hover:text-white'
            }`}
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Performance</p>
          </button>
          <button 
             onClick={() => setActiveTab('appearance')}
             className={`flex flex-col items-center justify-center border-b-[3px] pb-3 transition-all ${
               activeTab === 'appearance' ? 'border-jungle-green-500 text-jungle-green-400' : 'border-transparent text-zinc-500 hover:text-white'
             }`}
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Appearance</p>
          </button>
        </div>
        <div className="pb-3 flex gap-3">
          <Link href="/play" className="flex items-center justify-center rounded-lg h-10 px-4 bg-jungle-green-500 text-[#0b0f1a] text-sm font-bold leading-normal gap-2 shadow-lg shadow-jungle-green-700/20 hover:scale-105 transition-transform">
            <Plus size={20} />
            New Game
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Body Content */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* User Header Card */}
          <div className="bg-redesign-glass-bg backdrop-blur-xl rounded-3xl p-6 border border-redesign-glass-border shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative">
                <div className="bg-zinc-900 border-2 border-jungle-green-500/30 aspect-square rounded-2xl size-32 shadow-2xl overflow-hidden group relative">
                  {profile.avatar ? (
                     <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-jungle-green-500/10 to-jungle-green-800/15">
                       <User size={64} className="text-jungle-green-400" />
                    </div>
                  )}
                  {/* Upload Overlay */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer text-white flex flex-col items-center gap-1 hover:text-jungle-green-400 transition-colors">
                      <Camera size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Update</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-4 border-redesign-bg rounded-full size-6 shadow-lg shadow-emerald-500/20" title="Online"></div>
              </div>
              
              <div className="flex-1 w-full text-center sm:text-left">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                  <div>
                    <h1 className="text-3xl font-black text-white flex items-center justify-center sm:justify-start gap-3">
                      {profile.displayName || profile.username}
                    </h1>
                    <div className="text-zinc-500 mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 font-bold text-sm">
                      <span className="flex items-center gap-2">
                        <FlagComponent country={profile.country || 'US'} className="w-5 h-4 rounded shadow-sm" />
                        {profile.country || 'USA'}
                      </span>
                      <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                      <span className="flex items-center gap-2">
                        <Globe size={16} /> Global Rank: #{userRank ?? profile.rank ?? '–'}
                      </span>
                    </div>
                    
                    <div className="flex justify-center sm:justify-start gap-6 mt-4">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Globe size={18} className="text-jungle-green-400" />
                        <span className="text-xs font-bold uppercase tracking-tight">Global Rank: #{userRank ?? profile.rank ?? '–'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Trophy size={18} className="text-yellow-500" />
                        <span className="text-xs font-bold uppercase tracking-tight">{Object.values(achievements || {}).filter((a: any) => a.unlocked).length} Achievements</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={() => setActiveTab('profile')} className="bg-white/5 p-3 rounded-xl text-white hover:bg-white/10 transition-colors border border-white/5">
                      <Edit size={18} />
                    </button>
                    <button className="bg-white/5 p-3 rounded-xl text-white hover:bg-white/10 transition-colors border border-white/5">
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {activeTab === 'performance' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              {/* Rating Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <RatingCard 
                  label="Games Played" 
                  value={stats.totalGames}
                  icon={<Timer className="text-jungle-green-400" />} 
                  caption="All-time"
                />
                <RatingCard 
                  label="Openings" 
                  value={stats.openingsCompleted}
                  icon={<Rocket className="text-orange-500" />} 
                  caption="Completed"
                />
                <RatingCard 
                  label="Endgames" 
                  value={stats.endgamesCompleted}
                  icon={<Shield className="text-yellow-500" />} 
                  caption="Completed"
                />
                <RatingCard 
                  label="Puzzles" 
                  value={stats.puzzlesSolved}
                  icon={<Zap className="text-amber-400" />} 
                  caption="Solved"
                />
              </div>

              {/* Detailed Stats Card */}
              <div className="bg-redesign-glass-bg backdrop-blur-xl rounded-3xl p-8 border border-redesign-glass-border shadow-2xl">
                <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                  <TrendingUp className="text-jungle-green-400" />
                  Performance Metrics
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Win/Loss Ratio</h4>
                      <p className="text-xs font-bold text-white uppercase tracking-widest">{stats.totalGames} Total Games</p>
                    </div>
                    
                    <div className="space-y-3">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-black text-emerald-400 uppercase tracking-tighter">Victories: {winRate}%</span>
                       </div>
                       <div className="h-4 w-full bg-zinc-900/50 rounded-full border border-white/5 overflow-hidden flex shadow-inner">
                          <div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-1000" style={{ width: `${winRate}%` }}></div>
                          <div className="h-full bg-zinc-500 transition-all duration-1000" style={{ width: `${drawRate}%` }}></div>
                          <div className="h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-1000" style={{ width: `${lossRate}%` }}></div>
                       </div>
                       <div className="flex justify-between font-black text-[9px] text-zinc-600 uppercase tracking-[0.1em]">
                          <span>{stats.wins} Wins</span>
                          <span>{stats.draws} Draws</span>
                          <span>{stats.losses} Losses</span>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Rating Progression</h4>
                    <div className="h-24 w-full bg-black/20 rounded-2xl flex items-end justify-between px-4 pb-2 border border-white/5 relative overflow-hidden group">
                       <div className="absolute inset-0 bg-jungle-green-500/5 group-hover:bg-jungle-green-500/10 transition-colors"></div>
                       {[40, 45, 42, 50, 55, 52, 60, 65, 62, 70, 75, 80, 85, 82, 90, 100].map((h, i) => (
                         <div 
                           key={i} 
                           className="w-1.5 sm:w-2 bg-jungle-green-500/60 rounded-t-sm group-hover:bg-jungle-green-500 transition-all duration-500" 
                           style={{ height: `${h}%` }}
                         ></div>
                       ))}
                    </div>
                    <p className="text-center text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-2">Active Progression (Last 30 Days)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-redesign-glass-bg backdrop-blur-xl rounded-3xl p-8 border border-redesign-glass-border shadow-2xl animate-in slide-in-from-left-4 duration-500">
               <h3 className="text-xl font-black text-white mb-8">Identity Settings</h3>
               <div className="max-w-xl space-y-8">
                  <div className="grid grid-cols-1 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">Username</label>
                        <input 
                           type="text" 
                           defaultValue={profile.username}
                           readOnly
                           className="w-full bg-black/40 border border-redesign-glass-border rounded-2xl px-5 py-3.5 text-zinc-400 font-mono text-sm cursor-not-allowed"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">Display Name</label>
                        <input 
                           id="displayNameInput"
                           type="text" 
                           defaultValue={profile.displayName}
                           className="w-full bg-black/40 border border-redesign-glass-border rounded-2xl px-5 py-3.5 text-white font-bold text-sm focus:outline-none focus:border-jungle-green-500/50 transition-colors"
                        />
                     </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                        const name = (document.getElementById('displayNameInput') as HTMLInputElement).value;
                        updateUserProfile({ displayName: name });
                    }}
                    className="px-8 py-3.5 bg-jungle-green-500 text-[#0b0f1a] rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(5,150,105,0.35)] hover:scale-105 active:scale-95 transition-all"
                  >
                     Update Identity
                  </button>

                  <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                     <button className="flex items-center gap-2 text-red-400 font-black text-xs uppercase tracking-widest hover:text-red-300 transition-colors">
                        <LogOut size={16} /> Sign Out Of Account
                     </button>
                     <p className="text-[10px] text-zinc-600 font-bold tracking-widest uppercase">ID: {profile.id ? `${profile.id.substring(0, 12)}...` : 'LOCAL_USER'}</p>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'appearance' && (
             <div className="bg-redesign-glass-bg backdrop-blur-xl rounded-3xl p-8 border border-redesign-glass-border shadow-2xl animate-in slide-in-from-right-4 duration-500 space-y-12">
                <div>
                   <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                      <Palette className="text-jungle-green-400" />
                      Board Aesthetics
                   </h3>
                   <BoardColorSchemeSelector 
                       selected={colorScheme}
                       onChange={setColorScheme}
                   />
                </div>
                <div className="pt-4">
                   <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                      <Crown className="text-yellow-500" />
                      Piece Style
                   </h3>
                     <PieceStyleSelector 
                       selected={pieceStyle}
                       onChange={setPieceStyle}
                       className="grid grid-cols-3 gap-4"
                     />
                </div>
             </div>
          )}
        </div>

        {/* Right Side: Global Leaderboard & Extras */}
        <div className="w-full lg:w-[420px] flex flex-col gap-6">
          <div className="bg-redesign-glass-bg backdrop-blur-xl rounded-3xl border border-redesign-glass-border shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                 <Trophy size={18} className="text-jungle-green-400" />
                 Global Leaderboard
              </h3>
              <div className="flex gap-2">
                <span className="text-[10px] bg-jungle-green-500/10 text-jungle-green-400 px-2 py-1 rounded-md font-black border border-jungle-green-500/20">RAPID</span>
                <Filter size={16} className="text-zinc-600 cursor-pointer hover:text-white" />
              </div>
            </div>
            
            <div className="flex flex-col">
               {isLoadingLeaderboard ? (
                  <div className="p-12 flex justify-center">
                     <div className="w-8 h-8 border-2 border-jungle-green-500/30 border-t-jungle-green-500 rounded-full animate-spin"></div>
                  </div>
               ) : leaderboard.length > 0 ? (
                  leaderboard.map((player, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-colors cursor-pointer group border-b border-white/[0.02] last:border-0 ${player.isUser ? 'bg-jungle-green-500/5' : ''}`}
                    >
                      <div className={`w-8 flex justify-center font-black text-lg italic ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-zinc-400' : idx === 2 ? 'text-amber-600' : 'text-zinc-600'}`}>
                        {idx + 1}
                      </div>
                      <div className={`size-10 rounded-xl bg-zinc-900 border-2 overflow-hidden ${idx === 0 ? 'border-yellow-500' : 'border-white/10'}`}>
                         <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-black">
                            {idx === 0 ? <Crown size={18} className="text-yellow-500" /> : <User size={18} className="text-zinc-500" />}
                         </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-black text-sm truncate ${player.isUser ? 'text-jungle-green-400' : 'text-white'}`}>{player.username}</p>
                          {idx === 0 && <span className="text-[9px] uppercase font-black text-jungle-green-400 bg-jungle-green-500/10 px-1 rounded">GM</span>}
                        </div>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{player.country || 'GLOBAL'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-white text-sm">{player.elo}</p>
                        <p className="text-[9px] text-emerald-400 font-black">+{Math.floor(Math.random() * 5)}</p>
                      </div>
                    </div>
                  ))
               ) : (
                  <div className="p-8 text-center text-zinc-500 font-bold text-xs uppercase tracking-widest">No rankings found</div>
               )}
            </div>
            
            <div className="p-4 bg-white/[0.01] text-center border-t border-white/5">
              <Link href="/leaderboard" className="text-jungle-green-400 text-[10px] font-black uppercase tracking-[0.2em] hover:underline flex items-center justify-center gap-2 group">
                View Full Leaderboard
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Achievement Highlight */}
          <div className="bg-gradient-to-br from-[#0db9f2] via-[#0b0f1a] to-[#4361ee] rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group border border-white/10">
            <div className="relative z-10">
              <div className="bg-yellow-500/20 size-12 rounded-2xl flex items-center justify-center mb-6 border border-yellow-500/30">
                <Medal className="text-yellow-500" size={28} />
              </div>
              <h4 className="font-black text-xl mb-2 tracking-tight">Daily Milestone!</h4>
              <p className="text-white/60 text-xs font-bold leading-relaxed mb-6 uppercase tracking-widest">You've solved {stats.puzzlesSolved} puzzles. Top 5% of all active players this week.</p>
              <button 
                className="w-full bg-white/10 hover:bg-white/20 transition-all py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-lg border border-white/10"
                onClick={() => setShowBadgeModal(true)}
              >
                Claim Badge
              </button>
            </div>
            <div className="absolute -bottom-12 -right-12 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
              <Star size={200} fill="currentColor" />
            </div>
          </div>
        </div>
      </div>

      {showBadgeModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-redesign-glass-bg border border-redesign-glass-border rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                <Medal className="text-yellow-500" />
                Your Badges
              </h4>
              <button className="text-zinc-500 hover:text-white" onClick={() => setShowBadgeModal(false)}>
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-zinc-400 font-bold">Badges unlock automatically when you hit milestones. Here are your unlocked badges:</p>
            <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
              {Object.entries(achievements || {}).filter(([, a]: any) => a.unlocked).map(([id, progress]) => (
                <div key={id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <span className="text-white font-bold text-sm truncate">{id}</span>
                  <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Claimed</span>
                </div>
              ))}
              {Object.values(achievements || {}).filter((a: any) => a.unlocked).length === 0 && (
                <p className="text-zinc-500 text-sm font-bold text-center">No badges yet. Keep playing!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RatingCard({ label, value, icon, caption }: { label: string, value: number, icon: React.ReactNode, caption?: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl p-6 bg-redesign-glass-bg border border-redesign-glass-border shadow-xl hover:border-jungle-green-500/30 transition-all group">
      <div className="flex justify-between items-center">
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
        <div className="size-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <p className="text-white text-4xl font-black tracking-tight">{value}</p>
      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter text-zinc-500">
        {caption || 'All-time'}
      </div>
    </div>
  );
}
