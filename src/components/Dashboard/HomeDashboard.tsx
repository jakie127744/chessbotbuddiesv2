
import { getRandomTip } from '@/lib/tips-data';

import React, { useEffect, useState } from 'react';
import { 
  Gamepad2, GraduationCap, Microscope, 
  Trophy, Zap, Clock, Bot, Users, FlaskConical, Book,
  Target, Swords, BookOpen
} from 'lucide-react';
import { DailyQuests, Quest } from './DailyQuests';
import { useRewards } from '@/contexts/RewardsContext';
import { Mascot } from '../Mascot';
import { ChessBoard } from '../ChessBoard';
import { useBoardColorScheme } from '@/contexts/BoardColorSchemeContext';
import { Chess } from 'chess.js';
import { LICHESS_PUZZLES } from '@/lib/lichess-puzzles';
import { PUZZLE_THEMES } from '@/lib/puzzle-types';
import { AuthModal } from '@/components/AuthModal';
import { Footer } from '@/components/Footer';

import { UserProfile } from '@/lib/user-profile';
import { SavedGame, getGameHistory } from '@/lib/game-storage';
import { TimeControl, TIME_CONTROLS } from '@/lib/game-config';
import { RewardsDisplay } from '../Rewards/RewardsDisplay';

interface HomeDashboardProps {
  onPlayClick: (timeControl?: TimeControl, mode?: 'bot' | 'pass_play') => void;
  onPuzzlesClick: () => void;
  onLessonsClick: () => void;
  onAnalysisClick: () => void;
  onEndgameClick: () => void;
  onOpeningsClick: () => void;
  userProfile?: UserProfile | null;
  areAdsAllowed?: boolean;
}

export function HomeDashboard({ 
  onPlayClick, 
  onPuzzlesClick, 
  onLessonsClick, 
  onAnalysisClick,
  onEndgameClick,
  onOpeningsClick,
  userProfile,
  areAdsAllowed = true
}: HomeDashboardProps) {
  const [greeting, setGreeting] = useState('Hello');
  const [currentTip, setCurrentTip] = useState('');
  const [lastGame, setLastGame] = useState<SavedGame | null>(null);
  const username = userProfile?.displayName || userProfile?.username || 'Guest';
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [humanCount, setHumanCount] = useState<number | null>(null);
  const { dailyQuests } = useRewards();

  // Map progress to Quest objects
  const mappedQuests: Quest[] = dailyQuests.map(q => {
      switch (q.id) {
          case 'daily-puzzles':
              let description = `Solve ${q.target} puzzles today`;
              let title = 'Puzzle Master';
              if (q.requiredTags && q.requiredTags.length > 0) {
                  const themeKey = q.requiredTags[0] as keyof typeof PUZZLE_THEMES;
                  const themeName = PUZZLE_THEMES[themeKey]?.name || q.requiredTags[0];
                  description = `Solve ${q.target} ${themeName} puzzles`;
                  title = `${themeName} Specialist`;
              }
              return { ...q, title, description, icon: Target, rewardXp: 100 };
          case 'daily-games':
              return { ...q, title: 'Robot Challenger', description: 'Play 2 games vs Computer', icon: Swords, rewardXp: 100 };
          case 'daily-lessons':
              return { ...q, title: 'Scholar', description: 'Complete 1 lesson', icon: BookOpen, rewardXp: 100 };
          default:
              return { ...q, title: q.title || 'Quest', description: 'Daily Goal', icon: Zap, rewardXp: 50 };
      }
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
    
    // Load last game
    const history = getGameHistory();
    if (history.length > 0) {
      setLastGame(history[0]); // History is sorted new -> old
    }

    // Load Human Stats
    fetch('/api/analytics/verify')
      .then(res => res.json())
      .then(data => setHumanCount(data.human_visits))
      .catch(err => {
        console.error("Stats Error:", err);
        setHumanCount(1); // Fallback to at least showing yourself
      });

    // Set Random Tip
    setCurrentTip(getRandomTip());
  }, []);

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-gradient-to-b from-[#0d1221] to-[#1a2744]">
      <div className="flex-1 flex overflow-hidden">
        
        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Mascot size={48} />
                        <div>
                            <h1 className="text-2xl font-bold text-text-primary">
                            {greeting}, <span className="text-sky-blue">{username}</span>!
                            </h1>
                            <p className="text-text-muted text-sm">Ready to sharpen your mind today?</p>
                            {(!userProfile || username === 'Guest') && (
                                <button 
                                    onClick={() => setShowAuthModal(true)} 
                                    className="text-xs text-emerald-400 font-bold hover:text-emerald-300 hover:underline mt-1 flex items-center gap-1 transition-colors"
                                >
                                    Save your progress <span className="text-[10px] bg-emerald-500/20 px-1 py-0.5 rounded border border-emerald-500/50">Free</span>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <RewardsDisplay />
                    </div>
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN: Pairing & Training */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Quick Pairing Grid */}
                    <div className="bg-bg-tertiary rounded-xl border border-border-color p-4">
                    <h3 className="text-text-primary text-sm font-semibold flex items-center gap-2 mb-3">
                        <Zap size={16} className="text-sky-blue" /> Quick Pairing
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {/* Row 1: Blitz */}
                        <QuickPairButton timeControl={TIME_CONTROLS[0]} sub="BLITZ" onClick={onPlayClick} />
                        <QuickPairButton timeControl={TIME_CONTROLS[5]} sub="BLITZ" onClick={onPlayClick} />
                        <QuickPairButton timeControl={TIME_CONTROLS[2]} sub="BLITZ" onClick={onPlayClick} />

                        {/* Row 2: Rapid */}
                        <QuickPairButton timeControl={TIME_CONTROLS[3]} sub="RAPID" onClick={onPlayClick} />
                        <QuickPairButton timeControl={TIME_CONTROLS[4]} sub="RAPID" onClick={onPlayClick} />
                        <QuickPairButton timeControl={TIME_CONTROLS[6]} sub="CLASSICAL" onClick={onPlayClick} />

                        {/* Row 3: Scholastic */}
                        <QuickPairButton timeControl={TIME_CONTROLS[7]} sub="SCHOLASTIC" onClick={onPlayClick} />
                        <QuickPairButton timeControl={TIME_CONTROLS[8]} sub="SCHOLASTIC" onClick={onPlayClick} />
                        <QuickPairButton timeControl={TIME_CONTROLS[8]} sub="SCHOLASTIC (45)" onClick={onPlayClick} />
                    </div>
                    </div>

                    {/* Play Modes Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                        onClick={() => onPlayClick(undefined, 'bot')}
                        className="bg-bg-tertiary border border-border-color p-4 rounded-xl flex items-center gap-4 hover:border-sky-blue hover:shadow-lg hover:shadow-sky-blue/10 transition-all group text-left"
                        >
                            <div className="w-10 h-10 rounded-full bg-sky-blue/10 flex items-center justify-center group-hover:bg-sky-blue text-sky-blue group-hover:text-white transition-colors">
                            <Bot size={20} />
                            </div>
                            <div>
                                <div className="text-text-primary font-bold">Play Computer</div>
                                <div className="text-text-muted text-xs">Challenge our custom bots</div>
                            </div>
                        </button>

                        <button 
                        onClick={() => onPlayClick(undefined, 'pass_play')}
                        className="bg-bg-tertiary border border-border-color p-4 rounded-xl flex items-center gap-4 hover:border-mint-green hover:shadow-lg hover:shadow-mint-green/10 transition-all group text-left"
                        >
                            <div className="w-10 h-10 rounded-full bg-mint-green/10 flex items-center justify-center group-hover:bg-mint-green text-mint-green group-hover:text-white transition-colors">
                            <Users size={20} />
                            </div>
                            <div>
                                <div className="text-text-primary font-bold">Play a Friend</div>
                                <div className="text-text-muted text-xs">Invite someone to a match</div>
                            </div>
                        </button>
                    </div>

                    {/* Training & Tools Panel */}
                    <div className="bg-bg-tertiary rounded-xl border border-border-color p-5">
                        <h3 className="text-text-primary text-sm font-semibold flex items-center gap-2 mb-4">
                        <GraduationCap size={16} className="text-text-secondary" /> 
                        Training & Tools
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <ToolButton icon={<Target/>} label="Puzzle Trainer" color="#ef4444" onClick={onPuzzlesClick} desc="Sharpen your tactics" />
                        <ToolButton icon={<GraduationCap/>} label="Chess Academy" color="#3b82f6" onClick={onLessonsClick} desc="Learn from lessons" />
                        <ToolButton icon={<FlaskConical/>} label="Endgame Lab" color="#f59e0b" onClick={onEndgameClick} desc="Master the finish" />
                        <ToolButton icon={<Book/>} label="Opening Trainer" color="#8b5cf6" onClick={onOpeningsClick} desc="Build your repertoire" />
                        </div>
                    </div>

                    {/* Buddy's Tip of the Day */}
                    <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Mascot size={80} />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-indigo-300 font-bold text-sm mb-2 flex items-center gap-2">
                                <Zap size={14} /> Buddy's Pro Tip
                            </h4>
                            <p className="text-text-primary text-sm leading-relaxed italic">
                                "{currentTip}"
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* RIGHT COLUMN: Recent Activity & Quests */}
                <div className="space-y-6">
                    {/* Daily Quests Widget */}
                    <DailyQuests quests={mappedQuests} />

                    <div className="bg-bg-tertiary rounded-xl border border-border-color p-5 min-h-[200px]">
                        <h3 className="text-text-primary text-sm font-semibold flex items-center gap-2 mb-4">
                        <Clock size={16} className="text-text-secondary" /> Recent Activity
                        </h3>
                        
                        {lastGame ? (
                        <div className="space-y-3">
                            <div className="p-3 bg-bg-primary rounded-lg border border-border-color flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${lastGame.result.includes('win') ? 'bg-mint-green' : 'bg-red-400'}`} />
                                    <span className="text-text-primary text-sm font-medium">Vs {lastGame.opponentName}</span>
                                </div>
                                <span className="text-text-muted text-xs">{new Date(lastGame.date).toLocaleDateString()}</span>
                            </div>
                            <button 
                            onClick={onAnalysisClick}
                            className="w-full py-2 bg-bg-elevated text-sky-blue text-xs font-bold rounded-lg hover:bg-bg-secondary transition-colors"
                            >
                            Review Last Game
                            </button>
                        </div>
                        ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Clock size={32} className="text-text-muted opacity-20 mb-2" />
                            <p className="text-text-muted text-xs">No games played yet.</p>
                            <p className="text-sky-blue text-xs mt-1 cursor-pointer" onClick={() => onPlayClick()}>Start your journey 🚀</p>
                        </div>
                        )}
                    </div>

                    {/* Mini Stats Panel */}
                    <div className="bg-bg-tertiary rounded-xl border border-border-color p-5">
                        <div className="space-y-4">
                        <StatRow label="Rating" value={String(userProfile?.rating || 1000)} />
                        <StatRow label="Puzzles Solved" value={String(userProfile?.stats?.puzzlesSolved || 0)} />
                        <StatRow label="Lessons" value={String(userProfile?.completedLessons?.length || 0)} />
                        <div className="h-px bg-border-color my-2" />
                        <StatRow label="Active Players" value={humanCount !== null ? String(humanCount) : '...'} />
                        </div>
                    </div>
                </div>
                </div>

                {/* SEO Footer Content */}
                <Footer />
                
                <AuthModal 
                    isOpen={showAuthModal} 
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={() => setShowAuthModal(false)}
                />
            </div>
        </div>
      </div>
    </div>
  );
}

function QuickPairButton({ timeControl, sub, onClick }: { timeControl: TimeControl, sub: string, onClick: (tc: TimeControl, mode: 'bot') => void }) {
  return (
    <button 
      onClick={() => onClick(timeControl, 'bot')}
      className="flex flex-col items-center justify-center p-3 rounded-lg border border-border-color bg-bg-primary hover:border-sky-blue hover:bg-bg-elevated transition-all group"
    >
      <span className="text-text-primary font-bold">{timeControl.label.split(' • ')[0]}</span>
      <span className="text-[10px] text-text-muted group-hover:text-sky-blue uppercase tracking-wider">{sub}</span>
    </button>
  );
}

function ToolButton({ icon, label, color, desc, onClick }: { icon: React.ReactNode, label: string, color: string, desc: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center text-center group p-2">
       <div 
         className="w-12 h-12 rounded-full flex items-center justify-center text-white mb-3 shadow-lg transition-transform group-hover:scale-110"
         style={{ backgroundColor: color }}
       >
          {React.cloneElement(icon as any, { size: 20 })}
       </div>
       <div className="text-text-primary text-xs font-bold mb-0.5">{label}</div>
       <div className="text-text-muted text-[10px] leading-tight max-w-[80px]">{desc}</div>
    </button>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-text-muted text-sm">{label}</span>
      <span className="text-text-primary font-mono text-sm">{value}</span>
    </div>
  );
}
