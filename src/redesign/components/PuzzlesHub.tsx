'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Target, BookOpen, Castle, Flame, CheckCircle, Timer, 
  ChevronRight, Trophy, Zap, TrendingUp, Swords, Brain,
  Puzzle, Crown 
} from 'lucide-react';
import { useRewards } from '@/contexts/RewardsContext';
import { PUZZLE_THEMES, ThemeKey, getRandomPuzzleAsync, LichessPuzzle } from '@/lib/puzzle-types';
import { LESSON_TRACKS } from '@/lib/lesson-data';

interface PuzzlesHubProps {
  onStartPuzzles: (theme?: ThemeKey) => void;
  onStartOpenings: () => void;
  onStartEndgame: () => void;
  onStartLessons: () => void;
}

export function PuzzlesHub({ onStartPuzzles, onStartOpenings, onStartEndgame, onStartLessons }: PuzzlesHubProps) {
  const router = useRouter();
  const { userProfile, stats, xp, streak } = useRewards();
  const [dailyPuzzle, setDailyPuzzle] = useState<LichessPuzzle | null>(null);

  // Load a daily puzzle on mount
  useEffect(() => {
    getRandomPuzzleAsync().then(p => setDailyPuzzle(p));
  }, []);

  // Calculate some stats
  const puzzlesSolved = stats?.puzzlesSolved || 0;
  const lessonsCompleted = stats?.lessonsCompleted || 0;
  const totalGames = stats?.totalGames || 0;
  const winRate = totalGames > 0 ? Math.round(((stats?.wins || 0) / totalGames) * 100) : 0;

  // Count endgame lessons
  const endgameLessons = Object.values(LESSON_TRACKS).flat().filter(l => l.type === 'endgame');
  const completedEndgames = endgameLessons.filter(l => userProfile?.completedLessons?.includes(l.id)).length;
  const totalEndgames = endgameLessons.length;

  // Count opening lessons
  const openingLessons = Object.values(LESSON_TRACKS).flat().filter(l => l.type === 'opening');
  const completedOpenings = openingLessons.filter(l => userProfile?.completedLessons?.includes(l.id)).length;
  const totalOpenings = openingLessons.length;

  // Total lessons
  const allLessons = Object.values(LESSON_TRACKS).flat();
  const completedAllLessons = allLessons.filter(l => userProfile?.completedLessons?.includes(l.id)).length;

  const themeKeys = Object.keys(PUZZLE_THEMES) as ThemeKey[];

  return (
    <div className="h-full overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-7xl mx-auto w-full p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ===== MAIN COLUMN (2/3) ===== */}
          <div className="lg:col-span-2 space-y-8">

            {/* Daily Puzzle Hero */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Daily Puzzle</h3>
                {dailyPuzzle && (
                  <span className="px-2 py-1 bg-amber-900/30 text-amber-400 text-[10px] font-bold rounded uppercase tracking-wider">
                    {dailyPuzzle.rating > 2000 ? 'Master' : dailyPuzzle.rating > 1500 ? 'Advanced' : dailyPuzzle.rating > 1000 ? 'Intermediate' : 'Beginner'}
                  </span>
                )}
              </div>
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
                <div className="flex flex-col md:flex-row">
                  {/* Board Preview */}
                  <div 
                    onClick={() => onStartPuzzles()}
                    className="w-full md:w-1/2 aspect-square bg-slate-800 relative group cursor-pointer overflow-hidden"
                  >
                    {/* Simple chessboard pattern as visual */}
                    <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
                      {Array.from({ length: 64 }).map((_, i) => {
                        const row = Math.floor(i / 8);
                        const col = i % 8;
                        const isLight = (row + col) % 2 === 0;
                        return (
                          <div 
                            key={i} 
                            className={isLight ? 'bg-[#ebecd0]' : 'bg-[#779556]'}
                          />
                        );
                      })}
                    </div>
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </div>
                    </div>
                    {dailyPuzzle && (
                      <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] rounded font-bold">
                        Rating: {dailyPuzzle.rating}
                      </div>
                    )}
                  </div>

                  {/* Puzzle Info */}
                  <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
                    <div>
                      <h4 className="text-2xl font-bold text-white mb-2">
                        {dailyPuzzle ? `Puzzle #${dailyPuzzle.id?.slice(0,6)}` : 'Loading...'}
                      </h4>
                      <p className="text-slate-400 text-sm leading-relaxed mb-4">
                        Find the best move! Test your tactical vision with today's featured puzzle.
                      </p>
                      {dailyPuzzle && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {dailyPuzzle.themes.slice(0, 3).map(theme => (
                            <span key={theme} className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-slate-300">
                              #{theme}
                            </span>
                          ))}
                          <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-slate-300">
                            #{dailyPuzzle.rating} ELO
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onStartPuzzles()}
                      className="w-full py-3 bg-jungle-green-600 text-white font-bold rounded-lg hover:bg-jungle-green-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-jungle-green-700/20"
                    >
                      SOLVE NOW
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Puzzle Themes Grid */}
            <section>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target size={20} className="text-jungle-green-400" />
                Puzzle Themes
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {themeKeys.map(key => {
                  const theme = PUZZLE_THEMES[key];
                  return (
                    <button
                      key={key}
                      onClick={() => onStartPuzzles(key)}
                      className="bg-slate-900 border border-slate-800 hover:border-jungle-green-500/50 rounded-xl p-4 text-left transition-all group cursor-pointer"
                    >
                      <div className="text-2xl mb-2">{theme.icon}</div>
                      <h4 className="text-sm font-bold text-white mb-1 group-hover:text-jungle-green-400 transition-colors">{theme.name}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2">{theme.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Specialized Trainers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Opening Trainer */}
              <section>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-jungle-green-400" />
                  Opening Trainer
                </h3>
                <div
                  onClick={onStartOpenings}
                  className="bg-slate-900 rounded-xl border border-slate-800 p-5 hover:border-jungle-green-500/50 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="aspect-video rounded-lg mb-4 bg-slate-800 overflow-hidden relative">
                    <div className="absolute inset-0 grid grid-cols-8 grid-rows-4 opacity-40">
                      {Array.from({ length: 32 }).map((_, i) => {
                        const row = Math.floor(i / 8);
                        const col = i % 8;
                        const isLight = (row + col) % 2 === 0;
                        return <div key={i} className={isLight ? 'bg-[#ebecd0]' : 'bg-[#779556]'} />;
                      })}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] rounded font-bold">
                      Opening Lines
                    </div>
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1 group-hover:text-jungle-green-400 transition-colors">Master Your Openings</h4>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                    Learn and practice proven opening systems with interactive trainers.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain size={14} className="text-slate-500" />
                      <span className="text-[10px] font-bold text-slate-500">{totalOpenings} Lessons</span>
                    </div>
                    <span className="text-[10px] font-bold text-jungle-green-400">
                      {completedOpenings > 0 ? `${Math.round((completedOpenings / totalOpenings) * 100)}% COMPLETE` : 'START LEARNING'}
                    </span>
                  </div>
                </div>
              </section>

              {/* Endgame Trainer */}
              <section>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Castle size={20} className="text-jungle-green-400" />
                  Endgame Trainer
                </h3>
                <div
                  onClick={onStartEndgame}
                  className="bg-slate-900 rounded-xl border border-slate-800 p-5 hover:border-jungle-green-500/50 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="aspect-video rounded-lg mb-4 bg-slate-800 overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center gap-4 text-5xl opacity-30">
                      ♔ ♖ ♟
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] rounded font-bold">
                      Endgame Patterns
                    </div>
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1 group-hover:text-jungle-green-400 transition-colors">Essential Endgames</h4>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                    Lucena, Philidor, and other essential positions every player must know.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown size={14} className="text-slate-500" />
                      <span className="text-[10px] font-bold text-slate-500">{totalEndgames} Positions</span>
                    </div>
                    <span className="text-[10px] font-bold text-jungle-green-400">
                      {completedEndgames > 0 ? `${Math.round((completedEndgames / totalEndgames) * 100)}% COMPLETE` : 'NOT STARTED'}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* Chess Academy */}
            <section>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap size={20} className="text-jungle-green-400" />
                Chess Academy
              </h3>
              <div
                onClick={onStartLessons}
                className="bg-gradient-to-br from-jungle-green-500/10 to-jungle-green-900/10 rounded-xl border border-jungle-green-500/20 p-6 hover:border-jungle-green-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1 group-hover:text-jungle-green-400 transition-colors">
                      Continue Learning
                    </h4>
                    <p className="text-sm text-slate-400 mb-4">
                      {completedAllLessons} of {allLessons.length} lessons completed across all tracks
                    </p>
                    {/* Progress Bar */}
                    <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                      <div 
                        className="h-full bg-jungle-green-500 rounded-full transition-all" 
                        style={{ width: `${allLessons.length > 0 ? (completedAllLessons / allLessons.length) * 100 : 0}%` }} 
                      />
                    </div>
                    <button className="px-5 py-2 bg-jungle-green-600 text-white font-bold rounded-lg text-sm hover:bg-jungle-green-500 transition-colors flex items-center gap-2">
                      Continue <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="hidden md:flex text-8xl opacity-10 text-jungle-green-500">
                    <BookOpen size={120} />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ===== SIDEBAR COLUMN (1/3) ===== */}
          <div className="space-y-6">
            {/* Puzzle Statistics */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white">Puzzle Statistics</h3>
                <Puzzle size={18} className="text-slate-500" />
              </div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black text-jungle-green-400 leading-none">
                  {puzzlesSolved.toLocaleString()}
                </span>
                {puzzlesSolved > 0 && (
                  <span className="text-xs text-green-500 font-bold mb-1 flex items-center">
                    <TrendingUp size={12} /> Solved
                  </span>
                )}
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">
                Puzzles Solved
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-orange-900/30 flex items-center justify-center text-orange-500">
                      <Flame size={16} />
                    </div>
                    <span className="text-sm font-medium text-slate-300">Daily Streak</span>
                  </div>
                  <span className="text-sm font-bold text-white">{streak || 0} Days</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-green-900/30 flex items-center justify-center text-green-500">
                      <CheckCircle size={16} />
                    </div>
                    <span className="text-sm font-medium text-slate-300">Win Rate</span>
                  </div>
                  <span className="text-sm font-bold text-white">{winRate}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-jungle-green-900/30 flex items-center justify-center text-jungle-green-400">
                      <Swords size={16} />
                    </div>
                    <span className="text-sm font-medium text-slate-300">Games Played</span>
                  </div>
                  <span className="text-sm font-bold text-white">{totalGames}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-jungle-green-900/30 flex items-center justify-center text-jungle-green-300">
                      <BookOpen size={16} />
                    </div>
                    <span className="text-sm font-medium text-slate-300">Lessons Done</span>
                  </div>
                  <span className="text-sm font-bold text-white">{lessonsCompleted}</span>
                </div>
              </div>
            </div>

            {/* XP Progress */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
              <h3 className="font-bold text-sm text-white mb-4">XP Progress</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-jungle-green-600/20 flex items-center justify-center">
                  <Zap size={20} className="text-jungle-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{(xp || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total XP</p>
                </div>
              </div>
              {/* Simple bar chart */}
              <div className="h-24 flex items-end gap-1 px-1 mt-4">
                {[40, 55, 50, 65, 80, 75, 95].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t transition-all ${i === 6 ? 'bg-jungle-green-500' : 'bg-jungle-green-500/20'}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 px-1">
                <span className="text-[8px] text-slate-500 font-bold">MON</span>
                <span className="text-[8px] text-slate-500 font-bold">SUN</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800">
                <h3 className="font-bold text-sm text-white">Quick Actions</h3>
              </div>
              <div className="divide-y divide-slate-800">
                <button onClick={() => onStartPuzzles()} className="w-full px-4 py-3 flex items-center justify-between bg-jungle-green-400/90 hover:bg-jungle-green-400 text-slate-900 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Target size={18} className="text-slate-900/80" />
                    <span className="text-sm font-semibold tracking-wide">Random Puzzle</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-900/70" />
                </button>
                <button onClick={onStartOpenings} className="w-full px-4 py-3 flex items-center justify-between bg-jungle-green-400/90 hover:bg-jungle-green-400 text-slate-900 transition-colors group">
                  <div className="flex items-center gap-3">
                    <BookOpen size={18} className="text-slate-900/80" />
                    <span className="text-sm font-semibold tracking-wide">Practice Openings</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-900/70" />
                </button>
                <button onClick={onStartEndgame} className="w-full px-4 py-3 flex items-center justify-between bg-jungle-green-400/90 hover:bg-jungle-green-400 text-slate-900 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Castle size={18} className="text-slate-900/80" />
                    <span className="text-sm font-semibold tracking-wide">Endgame Drills</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-900/70" />
                </button>
                <button onClick={onStartLessons} className="w-full px-4 py-3 flex items-center justify-between bg-amber-400/90 hover:bg-amber-400 text-slate-900 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Trophy size={18} className="text-slate-900/80" />
                    <span className="text-sm font-semibold tracking-wide">Chess Academy</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-900/70" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
