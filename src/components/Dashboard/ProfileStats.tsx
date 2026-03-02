import { useRef, useState, useEffect } from 'react';
import { useRewards, ACHIEVEMENTS, LEVEL_THRESHOLDS } from '@/contexts/RewardsContext';
import { 
  Trophy, 
  Star, 
  Brain, 
  Flame, 
  Swords, 
  Crown, 
  Zap,
  BookOpen,
  Medal,
  Wand2,
  Calendar,
  Settings,
  Globe,
  MapPin,
  Sword, Scroll, Book, User, Target, Lightbulb, Library, Crosshair, Timer, 
  Shield, Gem, GraduationCap, Skull, Hourglass, Award, Sun, Diamond, ScrollText
} from 'lucide-react';
import { BotProfile } from '@/lib/bot-profiles';
import { updateUserProfile, getUserProfile, UserProfile } from '@/lib/user-profile';
import { COUNTRIES } from '@/lib/countries';
import { RewardsDisplay } from '../Rewards/RewardsDisplay';

// Icon Map helper
const ICON_MAP: Record<string, any> = {
  Trophy, Star, Brain, Flame, Swords, Crown, Zap, BookOpen, Medal, Wand2,
  Sword, Scroll, Book, User, Target, Lightbulb, Library, Crosshair, Timer, 
  Shield, Gem, GraduationCap, Skull, Hourglass, Award, Sun, Diamond, ScrollText, Flash: Zap
};

export function ProfileStats({ userProfile, areAdsAllowed = true }: { userProfile: UserProfile | null, areAdsAllowed?: boolean }) {
  const { 
    xp, 
    level, 
    achievements, 
    stats, 
    activityLog,
    completedLessons
  } = useRewards();

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(userProfile);
  const [isCountryOpen, setIsCountryOpen] = useState(false);

  useEffect(() => {
     setCurrentUser(userProfile);
  }, [userProfile]);

  const handleCountrySelect = (code: string) => {
     updateUserProfile({ country: code });
     setCurrentUser(getUserProfile());
     setIsCountryOpen(false);
  };

  // Calculate XP Progress
  const currentLevelXp = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelXp = LEVEL_THRESHOLDS[level] || 100000;
  const progressPercent = Math.min(100, Math.max(0, ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100));

  const winRate = stats.totalGames > 0 
    ? Math.round((stats.wins / stats.totalGames) * 100) 
    : 0;

  const currentFlag = COUNTRIES.find(c => c.code === currentUser?.country)?.flag || '🏳️';
  const currentCountryName = COUNTRIES.find(c => c.code === currentUser?.country)?.name || 'Select Country';

    return (
    <div className="h-full w-full bg-theme-surface flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
          {/* Left Ad Sidebar (XL screens) */}
          {areAdsAllowed && (
              <div className="hidden xl:flex w-72 border-r border-neutral-700/50 flex-col gap-6 p-6 overflow-y-auto custom-scrollbar bg-neutral-900/30">
                  <div className="w-full min-h-[250px] flex items-center justify-center bg-neutral-900/50 rounded-xl overflow-hidden">
                      
                  </div>
              </div>
          )}

          {/* Main Content */}
          <div className="flex-1 overflow-hidden min-w-0">
             <div className="h-full overflow-y-auto bg-gradient-to-b from-[#0f1729] to-[#1a2744] p-4 lg:p-8 font-sans">
              <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Mobile/Tablet Top Ad */}
                {areAdsAllowed && (
                    <div className="xl:hidden w-full flex justify-center mb-4">
                        
                    </div>
                )}
                
                {/* Header Card */}
                <div className="bg-[#1a2744] rounded-2xl p-6 shadow-lg border border-[#3a4a6e] flex flex-col md:flex-row items-center gap-6 relative">
                  
                  {/* Country Selector (Absolute Top Right) */}
                  <div className="absolute top-4 right-4">
                       <button 
                          onClick={() => setIsCountryOpen(!isCountryOpen)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#243354] hover:bg-[#2d3d5e] rounded-full text-xs font-bold text-[#a8b4ce] transition-colors border border-[#3a4a6e]"
                          title="Change Country for Leaderboard"
                       >
                           <MapPin size={14} />
                           <span className="text-lg leading-none">{currentFlag}</span>
                           {currentCountryName}
                       </button>
        
                       {isCountryOpen && (
                           <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a2744] rounded-xl shadow-xl border border-[#3a4a6e] z-50 overflow-hidden py-1 max-h-60 overflow-y-auto custom-scrollbar">
                               {COUNTRIES.map(c => (
                                   <button
                                       key={c.code}
                                       onClick={() => handleCountrySelect(c.code)}
                                       className="w-full text-left px-4 py-2 hover:bg-[#243354] flex items-center gap-3 text-sm font-medium text-white transition-colors"
                                   >
                                       <span className="text-lg">{c.flag}</span> {c.name}
                                   </button>
                               ))}
                           </div>
                       )}
                  </div>
        
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#5ec2f2] to-[#a78bfa] flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-[#5ec2f2]/30 border-4 border-[#243354]">
                       {level}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-[#ffd95a] text-[#0f1729] px-3 py-1 rounded-full text-xs font-bold border-2 border-[#243354] shadow-sm flex items-center gap-1">
                      <Star size={12} fill="currentColor" />
                      LVL {level}
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full text-center md:text-left mt-4 md:mt-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
                                {currentUser?.displayName || currentUser?.username || 'Guest Player'}
                            </h1>
                            <p className="text-[#a8b4ce] mb-3 flex items-center justify-center md:justify-start gap-2">
                                Beginner Chess Enthusiast
                                <span className="w-1 h-1 bg-[#3a4a6e] rounded-full" />
                                <span className="text-[#6b7a99] flex items-center gap-1">
                                    <Globe size={12} /> {currentUser?.country || 'No Country'}
                                </span>
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <RewardsDisplay />
                        </div>
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="flex gap-4 border-l border-[#3a4a6e] pl-6 hidden md:flex">
                     <div className="text-center">
                        <div className="text-2xl font-bold text-white">{stats.puzzlesSolved}</div>
                        <div className="text-xs text-[#6b7a99] uppercase tracking-wide">Puzzles</div>
                     </div>
                     <div className="text-center">
                        <div className="text-2xl font-bold text-white">{stats.wins}</div>
                        <div className="text-xs text-[#6b7a99] uppercase tracking-wide">Wins</div>
                     </div>
                     <div className="text-center">
                        <div className="text-2xl font-bold text-white">{achievements ? Object.values(achievements).filter(a => a.unlocked).length : 0}</div>
                        <div className="text-xs text-[#6b7a99] uppercase tracking-wide">Badges</div>
                     </div>
                  </div>
                </div>
        
                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Col: Stats & Achievements */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                       <StatCard 
                         label="Games Played" 
                         value={stats.totalGames} 
                         icon={<Swords className="text-blue-500" />} 
                       />
                       <StatCard 
                         label="Win Rate" 
                         value={`${winRate}%`} 
                         subValue={`${stats.wins}W - ${stats.losses}L - ${stats.draws}D`}
                         icon={<Crown className="text-yellow-500" />} 
                       />
                       <StatCard 
                         label="Best Win" 
                         value={stats.bestWinELO > 0 ? stats.bestWinELO : '-'} 
                         subValue="ELO Rating"
                         icon={<Trophy className="text-purple-500" />} 
                       />
                       <StatCard 
                         label="Lessons" 
                         value={stats.lessonsCompleted} 
                         icon={<BookOpen className="text-emerald-500" />} 
                       />
                    </div>
        
                    {/* Achievements */}
                    <div className="bg-[#1a2744] rounded-xl shadow-lg border border-[#3a4a6e] overflow-hidden">
                      <div className="p-4 border-b border-[#3a4a6e] flex justify-between items-center bg-[#243354]/50">
                        <h2 className="font-bold text-white flex items-center gap-2">
                          <Medal className="text-[#ffa86b]" size={20} />
                          Achievements
                        </h2>
                        <span className="text-xs font-bold bg-[#ffa86b]/20 text-[#ffa86b] px-2 py-1 rounded-full">
                          {Object.values(achievements).filter(a => a.unlocked).length} / {ACHIEVEMENTS.length}
                        </span>
                      </div>
                      
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[...ACHIEVEMENTS].sort((a, b) => {
                          const aUnlocked = !!achievements[a.id]?.unlocked;
                          const bUnlocked = !!achievements[b.id]?.unlocked;
                          // Unlocked first
                          if (aUnlocked && !bUnlocked) return -1;
                          if (!aUnlocked && bUnlocked) return 1;
                          return 0;
                        }).map(ach => {
                          const unlocked = achievements[ach.id]?.unlocked;
                          const Icon = ICON_MAP[ach.icon] || Trophy;
                          
                          return (
                            <div 
                              key={ach.id}
                              className={`
                                p-3 rounded-lg border flex items-center gap-3 transition-all
                                ${unlocked 
                                    ? 'bg-[#243354] border-[#5ec2f2]/30 shadow-lg shadow-[#5ec2f2]/10' 
                                    : 'bg-[#0f1729] border-[#3a4a6e] opacity-50 grayscale'
                                }
                              `}
                            >
                              <div className={`
                                 w-10 h-10 rounded-full flex items-center justify-center
                                 ${unlocked ? 'bg-[#5ec2f2]/20 text-[#5ec2f2]' : 'bg-[#243354] text-[#6b7a99]'}
                              `}>
                                <Icon size={20} />
                              </div>
                              <div>
                                <div className="font-bold text-white text-sm flex items-center gap-2">
                                  {ach.title}
                                  {unlocked && (
                                     <span className="text-[10px] bg-[#69e0a3]/20 text-[#69e0a3] px-1.5 py-0.5 rounded font-bold uppercase">
                                       Earned
                                     </span>
                                  )}
                                </div>
                                <div className="text-xs text-[#a8b4ce]">{ach.description}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
        
                  {/* Right Col: Activity Feed */}
                  <div className="space-y-6">
                    <div className="bg-[#1a2744] rounded-xl shadow-lg border border-[#3a4a6e] h-full max-h-[600px] flex flex-col">
                       <div className="p-4 border-b border-[#3a4a6e] bg-[#243354]/50">
                         <h2 className="font-bold text-white flex items-center gap-2">
                           <Calendar className="text-[#a78bfa]" size={20} />
                           Recent Activity
                         </h2>
                       </div>
                       
                       <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                         {activityLog.length === 0 ? (
                           <div className="text-center text-[#6b7a99] py-8 text-sm">
                             No activity yet. Play a game!
                           </div>
                         ) : (
                           activityLog.map((log) => (
                             <div key={log.id} className="flex gap-3 text-sm">
                               <div className="mt-1">
                                 {log.result === 'win' || log.result === 'completed' || log.result === 'unlocked' ? (
                                   <div className="w-2 h-2 rounded-full bg-[#69e0a3] shadow-sm shadow-[#69e0a3]/30" />
                                 ) : (
                                   <div className="w-2 h-2 rounded-full bg-[#ff7b6b] shadow-sm shadow-[#ff7b6b]/30" />
                                 )}
                               </div>
                               <div>
                                 <div className="font-medium text-white">
                                   {formatActivityTitle(log)}
                                 </div>
                                 {log.details && (
                                   <div className="text-xs text-[#a8b4ce] mt-0.5">
                                     {log.details}
                                   </div>
                                 )}
                                 <div className="text-[10px] text-[#6b7a99] mt-1">
                                   {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                 </div>
                               </div>
                             </div>
                           ))
                         )}
                       </div>
                    </div>
                  </div>
        
                </div>
              </div>
            </div>
            
          </div>

          {/* Right Ad Sidebar (XL screens) */}
          {areAdsAllowed && (
              <div className="hidden xl:flex w-72 border-l border-neutral-700/50 flex-col gap-6 p-6 overflow-y-auto custom-scrollbar bg-neutral-900/30">
                  <div className="w-full min-h-[250px] flex items-center justify-center bg-neutral-900/50 rounded-xl overflow-hidden">
                      
                  </div>
                  
                  {/* Tower Ad */}
                  <div className="flex flex-col items-center justify-center">
                      
                  </div>
              </div>
          )}
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, icon }: { label: string, value: string | number, subValue?: string, icon: React.ReactNode }) {
  return (
    <div className="bg-[#1a2744] p-4 rounded-xl border border-[#3a4a6e] shadow-lg">
      <div className="flex items-center justify-between mb-2 opacity-80">
        <span className="text-xs font-bold text-[#6b7a99] uppercase">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {subValue && <div className="text-xs text-[#a8b4ce] mt-1">{subValue}</div>}
    </div>
  );
}

function formatActivityTitle(log: any) {
  if (log.type === 'game') {
    if (log.result === 'win') return 'Won a game';
    if (log.result === 'loss') return 'Lost a game';
    return 'Played a game (Draw)';
  }
  if (log.type === 'puzzle') return 'Solved a Puzzle';
  if (log.type === 'lesson') return 'Completed a Lesson';
  if (log.type === 'achievement') return 'Unlocked Achievement!';
  return 'Activity';
}
