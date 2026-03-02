'use client';

import React, { useEffect, useState } from 'react';
import { 
  Zap, Bot, Users, GraduationCap, Target, FlaskConical, Book, Clock, Trophy, Flame, ChevronRight, Crosshair, Shield, Swords
} from 'lucide-react';
import { UserProfile } from '../lib/user-profile';
import { SavedGame, getGameHistory } from '../lib/game-storage';
import { TimeControl, TIME_CONTROLS } from '../lib/game-config';
import { BOT_PROFILES } from '../lib/bot-profiles';
import { useRewards } from '@/contexts/RewardsContext';
import { useRouter } from 'next/navigation';

type DailyAction = 'openings' | 'puzzles' | 'endgame' | 'play' | 'analysis' | 'lessons' | 'shotgun';

const DAILY_MESSAGES: { text: string; buttonText: string; action: DailyAction }[] = [
  { text: "Your strategy is evolving. Today is a great day to learn a new lesson.", buttonText: "Chess Academy", action: "lessons" },
  { text: "Ready for a challenge? See if you can beat your previous puzzle streak.", buttonText: "Solve Puzzles", action: "puzzles" },
  { text: "The board is set. Learn a new endgame technique and outsmart your opponents.", buttonText: "Practice Endgames", action: "endgame" },
  { text: "Every grandmaster was once a beginner. Keep playing and learning!", buttonText: "Quick Play (10 min)", action: "play" },
  { text: "A quiet move can be the most deadly. Take your time and find the best path.", buttonText: "Analyze Game", action: "analysis" },
  { text: "Expand your repertoire! Dive into the Opening Trainer today.", buttonText: "Opening Trainer", action: "openings" }
];

const DAILY_MINI_GAMES = [
  { 
    id: 'sprint', 
    title: 'Puzzle Sprint', 
    desc: 'Race against the clock and solve as many tactics as you can before time runs out.',
    action: 'puzzles' as DailyAction,
    color: '#3d7a46',
    icon: Flame
  },
  { 
    id: 'shotgun', 
    title: 'Opening Shotgun', 
    desc: 'Test your opening repertoire memory in a rapid fire drill.',
    action: 'shotgun' as DailyAction,
    color: '#7e22ce',
    icon: Crosshair
  },
  { 
    id: 'endgame', 
    title: 'Endgame Survival', 
    desc: 'Hold your ground in essential theoretical endgames.',
    action: 'endgame' as DailyAction,
    color: '#059669',
    icon: Shield
  }
];

interface HomeDashboardProps {
  onPlayClick: (botId?: string) => void;
  onPuzzlesClick: () => void;
  onLessonsClick: () => void;
  onAnalysisClick: () => void;
  onEndgameClick: () => void;
  onOpeningsClick: () => void;
  onShotgunClick: () => void;
  userProfile?: UserProfile | null;
}

export function HomeDashboard({ 
  onPlayClick, 
  onPuzzlesClick, 
  onLessonsClick, 
  onAnalysisClick,
  onEndgameClick,
  onOpeningsClick,
  onShotgunClick,
  userProfile 
}: HomeDashboardProps) {
  const router = useRouter();
  const [recentGames, setRecentGames] = useState<SavedGame[]>([]);
  const [greeting, setGreeting] = useState('Welcome back');
  const username = userProfile?.displayName || userProfile?.username || 'Guest';
  const { activityLog } = useRewards();
  
  // Get the 5 most recent activities
  const recentActivities = activityLog.slice(0, 5);
  
  // Select a "Bot of the Day" and Message (deterministic based on the day of the year)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const featuredBot = BOT_PROFILES[dayOfYear % BOT_PROFILES.length] || BOT_PROFILES[3];
  const dailyConfig = DAILY_MESSAGES[dayOfYear % DAILY_MESSAGES.length];
  const featuredMiniGame = DAILY_MINI_GAMES[dayOfYear % DAILY_MINI_GAMES.length];

  const handleDailyAction = () => {
    switch (dailyConfig.action) {
      case 'openings': return onOpeningsClick();
      case 'puzzles': return onPuzzlesClick();
      case 'endgame': return onEndgameClick();
      case 'play': return onPlayClick();
      case 'analysis': return onAnalysisClick();
      case 'shotgun': return onShotgunClick();
      case 'lessons': return onLessonsClick();
    }
  };

  useEffect(() => {
    const history = getGameHistory();
    setRecentGames(history.slice(0, 3));

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Welcome Card */}
      <section className="relative overflow-hidden group">
        <div className="bg-gradient-to-br from-redesign-cyan/20 to-blue-600/10 border border-redesign-cyan/30 rounded-3xl p-8 md:p-10 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl font-lexend font-bold text-white">
                {greeting}, <span className="text-redesign-cyan">{username}</span>!
              </h1>
              {userProfile?.streak && userProfile.streak > 0 && (
                <div className="flex items-center gap-1 bg-amber-500/20 text-amber-500 px-3 py-1.5 rounded-full border border-amber-500/30 animate-in fade-in zoom-in duration-500">
                  <Flame size={18} fill="currentColor" />
                  <span className="font-lexend font-black text-sm">{userProfile.streak}</span>
                </div>
              )}
            </div>
            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
              {dailyConfig.text}
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleDailyAction}
                className="px-8 py-4 bg-[var(--color-primary)] text-[#1b1b1b] font-black rounded-xl hover:bg-[var(--color-primary-hover)] transition-all shadow-lg shadow-[rgba(255,202,56,0.2)] flex items-center gap-2 group border-none text-base"
              >
                {dailyConfig.buttonText}
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={onPuzzlesClick}
                className="px-8 py-4 bg-redesign-glass-bg text-white border border-redesign-glass-border font-bold rounded-xl hover:bg-white/5 transition-all text-base"
              >
                Solve Puzzles
              </button>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-redesign-cyan/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform" />
      </section>

      {/* Main Grid Layout (Stitch Match) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Featured Bot - Large Card */}
        <div 
          onClick={() => onPlayClick(featuredBot.id)}
          className="lg:col-span-2 relative overflow-hidden rounded-3xl p-8 min-h-[250px] flex flex-col justify-between cursor-pointer group bg-[#111625] border border-redesign-glass-border hover:border-redesign-cyan/40 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f1a] via-[#0b0f1a]/80 to-transparent z-0 pointer-events-none" />
          
          {/* Bot Avatar rendered large on the right */}
          <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-white/5 group-hover:border-redesign-cyan/30 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all z-0 bg-[#151a2a]">
            {featuredBot.avatar ? (
               <img src={featuredBot.avatar} alt={featuredBot.name} className="w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500 object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center opacity-50 group-hover:opacity-80 transition-all">
                  <Bot size={100} className="text-zinc-600" />
               </div>
            )}
          </div>
          
          <div className="relative z-10 max-w-sm flex flex-col items-start h-full justify-center">
            <span className="px-3 py-1 bg-redesign-cyan text-[#0b0f1a] font-black text-xs uppercase tracking-widest rounded-full mb-3 inline-block">Bot of the Day</span>
            <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-redesign-cyan transition-colors">Play {featuredBot.name}</h2>
            <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
              {featuredBot.elo} ELO • {featuredBot.personality} <br/>
              {featuredBot.tagline}
            </p>
            <button className="px-6 py-3 bg-white text-black font-black rounded-xl text-base hover:scale-105 transition-transform shadow-xl">
              Challenge Bot
            </button>
          </div>
        </div>

        <div 
          onClick={() => onPlayClick('pass-and-play')}
          className="relative overflow-hidden rounded-3xl p-8 min-h-[250px] flex flex-col justify-center cursor-pointer group bg-[#8b5a2b] border border-transparent hover:ring-2 hover:ring-[#d28b48] transition-all"
        >
           {/* Background image overlay */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-0 pointer-events-none" />
           <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity bg-[url('/kids_playing_chess.png')] bg-cover bg-center mix-blend-overlay" />
           
           <div className="relative z-10 text-center flex flex-col items-center">
              <h2 className="text-2xl font-bold text-white mb-2">Pass and Play</h2>
              <p className="text-sm text-white/90 mb-4 px-4 leading-relaxed">
                Local 2-player mode for you and a friend.
              </p>
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                 <Users size={18} className="text-white" />
              </div>
           </div>
        </div>

        {/* Chess Academy - Blue Block */}
        <div 
          onClick={onLessonsClick}
          className="relative overflow-hidden rounded-3xl p-8 bg-[#1a55ff] hover:bg-[#1a55ff]/90 cursor-pointer transition-colors group min-h-[220px] flex flex-col justify-between"
        >
          <div className="absolute -bottom-10 -right-10 opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-500">
             <GraduationCap size={160} className="text-white" />
          </div>
          <div className="relative z-10 w-full">
            <h3 className="text-2xl font-bold text-white mb-2">Chess Academy</h3>
            <p className="text-sm text-blue-100 max-w-[200px]">
              Learn openings, endgames, and tactics from the best.
            </p>
            
            <div className="mt-8 flex items-center gap-3">
               <span className="text-xs font-bold text-white">
                 {userProfile?.stats?.lessonsCompleted || 0} Lessons Completed
               </span>
            </div>
          </div>
        </div>

        {/* Mini Games - Green Block */}
        <div 
            onClick={() => {
              if (featuredMiniGame.action === 'puzzles') onPuzzlesClick();
              else if (featuredMiniGame.action === 'openings') onOpeningsClick();
              else if (featuredMiniGame.action === 'shotgun') onShotgunClick();
              else if (featuredMiniGame.action === 'endgame') onEndgameClick();
            }}
           className="relative overflow-hidden rounded-3xl p-8 cursor-pointer transition-colors min-h-[220px] flex flex-col justify-between group hover:brightness-110"
           style={{ backgroundColor: featuredMiniGame.color }}
        >
           {/* Background Overlay Symbol */}
           <div className="absolute -bottom-6 -right-6 opacity-10 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
              <featuredMiniGame.icon size={160} className="text-white" />
           </div>

           <div className="relative z-10 w-full mb-4">
              <div className="flex justify-between items-start mb-2">
                 <h3 className="text-2xl font-bold text-white group-hover:drop-shadow-sm transition-all">{featuredMiniGame.title}</h3>
                 <featuredMiniGame.icon className="text-white/80" size={24} />
              </div>
              <p className="text-sm max-w-[220px] text-white/90 font-medium">
                {featuredMiniGame.desc}
              </p>
           </div>
           
           <div className="flex gap-4 mt-auto relative z-10 w-full">
              <button className="px-5 py-2.5 bg-black/20 hover:bg-black/30 text-white font-bold rounded-xl text-sm transition-colors border border-white/10 flex items-center gap-2">
                 Play Now <ChevronRight size={16} />
              </button>
           </div>
        </div>

        {/* Puzzles - Dark Block */}
        <div 
          onClick={onPuzzlesClick}
          className="relative overflow-hidden rounded-3xl p-8 bg-[#151a2a] border border-redesign-glass-border hover:border-redesign-cyan/40 cursor-pointer transition-all min-h-[220px] flex flex-col justify-between group"
        >
           <div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-redesign-cyan transition-colors">Puzzles</h3>
              <p className="text-sm text-zinc-400 max-w-[220px]">
                Solve 2,500+ hand-picked tactical puzzles.
              </p>
           </div>
           
            <div className="flex items-end justify-between mt-8 gap-4">
              <div className="flex-1">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Games Played</p>
                <p className="text-3xl font-black text-white">{userProfile?.stats?.gamesPlayed || 0}</p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Puzzles Solved</p>
                <p className="text-3xl font-black text-white">{userProfile?.stats?.puzzlesSolved || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#1a55ff] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform shrink-0">
                 <Target size={24} />
              </div>
            </div>
        </div>

      </div>

      {/* Recent Activity Section */}
      <section className="pt-4">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-white">Recent Activity</h2>
           <button 
             className="text-sm font-bold text-[#1a55ff] hover:text-redesign-cyan transition-colors"
             onClick={() => router.push('/history')}
           >
             View All
           </button>
        </div>
        
         <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity: any, i: number) => {
                const isGame = activity.type === 'game';
                const isPuzzle = activity.type === 'puzzle';
                const isLesson = activity.type === 'lesson';
                const isAchievement = activity.type === 'achievement';
                const isWin = activity.result === 'win' || activity.result === 'completed' || activity.result === 'unlocked';
                const isLoss = activity.result === 'loss';

                const icon = isPuzzle ? <Target size={20} className="text-amber-400" />
                  : isLesson ? <GraduationCap size={20} className="text-emerald-400" />
                  : isAchievement ? <Flame size={20} className="text-purple-400" />
                  : <Trophy size={20} className="text-redesign-cyan" />;

                const label = isPuzzle ? 'Puzzle Solved'
                  : isLesson ? 'Lesson Completed'
                  : isAchievement ? 'Achievement'
                  : isWin ? 'Win' : isLoss ? 'Loss' : 'Draw';

                const bgColor = isPuzzle ? 'bg-amber-500/10 border-amber-500/20'
                  : isLesson ? 'bg-emerald-500/10 border-emerald-500/20'
                  : isAchievement ? 'bg-purple-500/10 border-purple-500/20'
                  : 'bg-redesign-cyan/10 border-redesign-cyan/20';

                return (
                  <div key={activity.id || i} className="p-4 bg-redesign-glass-bg border border-redesign-glass-border rounded-2xl flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border group-hover:opacity-100 transition-colors ${bgColor}`}>
                           {icon}
                        </div>
                        <div>
                           <p className="font-bold text-white text-base">
                             {label}{activity.details ? ` • ${activity.details}` : ''}
                           </p>
                           <p className="text-sm text-zinc-500 mt-0.5 group-hover:text-zinc-400 transition-colors">
                             {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                           </p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className={`font-black text-sm ${isWin ? 'text-emerald-400' : isLoss ? 'text-red-400' : 'text-zinc-400'}`}>
                          {isWin ? '✓' : isLoss ? '✗' : '—'}
                        </p>
                     </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-redesign-glass-bg border border-redesign-glass-border rounded-2xl flex flex-col items-center justify-center space-y-3">
                 <Trophy size={32} className="text-zinc-600 mb-2" />
                 <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No recent activity</p>
                 <p className="text-xs text-zinc-500 font-medium">Play games, solve puzzles, or complete lessons to see your activity here.</p>
              </div>
            )}
            
         </div>
      </section>
    </div>
  );
}
