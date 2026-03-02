'use client';

import React from 'react';
import { Search, Bell, Zap, Flame, Trophy, Menu } from 'lucide-react';

interface TopBarProps {
  onOpenSidebar: () => void;
  userStats?: {
    xp: number;
    streak: number;
    rating: number;
  };
}

export function TopBar({ onOpenSidebar, userStats }: TopBarProps) {
  return (
    <header className="h-20 border-b border-redesign-glass-border flex items-center justify-between px-6 bg-redesign-bg/50 backdrop-blur-md sticky top-0 z-[90]">
      {/* Mobile Menu Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-zinc-400 hover:text-white bg-redesign-glass-bg border border-redesign-glass-border rounded-xl"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex items-center gap-3 bg-redesign-glass-bg border border-redesign-glass-border px-4 py-2 rounded-xl w-full max-w-md group focus-within:border-jungle-green-400/50 transition-all">
          <Search size={18} className="text-zinc-500 group-focus-within:text-jungle-green-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search players, lessons, or puzzles..." 
            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-zinc-600 w-full"
          />
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center gap-3 md:gap-6">
        {userStats && (
          <div className="hidden sm:flex items-center gap-4 border-r border-redesign-glass-border pr-6 mr-2">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-yellow-400" />
              <div className="hidden xl:block">
                <p className="text-[10px] text-zinc-500 font-bold uppercase leading-none">Experience</p>
                <p className="text-sm font-bold text-white">{userStats.xp} XP</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-orange-500" />
              <div className="hidden xl:block">
                <p className="text-[10px] text-zinc-500 font-bold uppercase leading-none">Streak</p>
                <p className="text-sm font-bold text-white">{userStats.streak} Days</p>
              </div>
            </div>
          </div>
        )}

        <button className="relative p-2.5 text-zinc-400 hover:text-white bg-redesign-glass-bg border border-redesign-glass-border rounded-xl transition-all">
          <Bell size={20} />
          <div className="absolute top-2 right-2 w-2 h-2 bg-jungle-green-500 rounded-full border-2 border-redesign-bg" />
        </button>

        {userStats && userStats.rating && (
          <div className="hidden md:flex items-center gap-3 bg-jungle-green-500/10 border border-jungle-green-500/20 px-3 py-1.5 rounded-xl">
             <Trophy size={16} className="text-jungle-green-400" />
             <span className="text-sm font-bold text-jungle-green-400">{userStats.rating}</span>
          </div>
        )}
      </div>
    </header>
  );
}
