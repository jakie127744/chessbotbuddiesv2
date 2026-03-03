'use client';

import React from 'react';
import Link from 'next/link';
import { 
  LayoutGrid, 
  Bot, 
  Target, 
  Trophy, 
  History, 
  GraduationCap, 
  Microscope,
  Newspaper,
  Book,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  MoreHorizontal,
  User,
  BookOpen,
  FileSearch,
  Facebook
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Mascot } from './Mascot';

export type ViewType = 'home' | 'game' | 'profile' | 'leaderboard' | 'puzzles' | 'learn' | 'endgame' | 'history' | 'openings' | 'analysis' | 'settings' | 'news' | 'review' | 'help';

interface SidebarProps {
  activeView: ViewType;
  isOpen: boolean;
  onClose: () => void;
  userProfile?: { username: string; id: string } | null;
  onLogout?: () => void;
  onLoginClick?: () => void;
}

const navItems = [
  { id: 'home', label: 'Dashboard', icon: LayoutGrid, href: '/home' },
  { id: 'news', label: 'News', icon: Newspaper, href: '/news' },
  { id: 'game', label: 'Play Bots', icon: Bot, href: '/play' },
  { id: 'learn', label: 'Chess Academy', icon: GraduationCap, href: '/learn' },
  { id: 'analysis', label: 'Analysis', icon: Microscope, href: '/analysis' },
  { id: 'review', label: 'Game Review', icon: FileSearch, href: '/review' },
  { id: 'training', label: 'Training Center', icon: Target, href: '/training-dashboard' },
  { id: 'history', label: 'Match History', icon: History, href: '/history' },
  { id: 'leaderboard', label: 'Rankings', icon: Trophy, href: '/leaderboard' },
  { id: 'profile', label: 'My Profile', icon: User, href: '/profile' },
  { id: 'help', label: 'Help Center', icon: Book, href: '/help' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61585450256243', external: true },
];

export function Sidebar({ activeView, isOpen, onClose, userProfile, onLogout, onLoginClick }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen z-[110]
        w-64 bg-redesign-bg border-r border-redesign-glass-border
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-redesign-glass-border shrink-0">
          <Link href="/home" className="flex items-center gap-3 group overflow-hidden min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[var(--color-bg-tertiary)] flex items-center justify-center shadow-lg shadow-jungle-green-500/20 group-hover:shadow-jungle-green-500/40 transition-all duration-300 overflow-hidden border border-[var(--color-success)]/20">
              <Mascot size={32} />
            </div>
            <span className="text-xl font-black text-white tracking-tight group-hover:text-jungle-green-400 transition-colors truncate">
              ChessBotBuddies
            </span>
          </Link>
          <button onClick={onClose} className="lg:hidden ml-2 shrink-0 p-2 text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              item.external ? (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-zinc-400 hover:bg-white/5 hover:text-white"
                >
                  <item.icon size={22} />
                  <span className="font-bold text-base">{item.label}</span>
                </a>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-jungle-green-500/10 text-jungle-green-300 border border-jungle-green-500/20 shadow-[0_0_20px_theme(colors.jungle-green.500/10)]' 
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <item.icon size={22} className={isActive ? 'animate-pulse' : ''} />
                  <span className="font-bold text-base">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-jungle-green-400 shadow-[0_0_10px_theme(colors.jungle-green.500)]" />
                  )}
                </Link>
              )
            );
          })}
        </nav>

        {/* Ad Banner: Monetization Dead Zone (Pre-game/Lobby) */}
        <div className="px-4 pb-2">
          <div style={{ margin: '12px 0', textAlign: 'center' }}>
            <ins
              className="adsbygoogle"
              style={{ display: 'block', textAlign: 'center' }}
              data-ad-client="ca-pub-9907028021598445"
              data-ad-slot="3330215112"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>
          <script dangerouslySetInnerHTML={{
            __html: '(adsbygoogle = window.adsbygoogle || []).push({});'
          }} />
        </div>
        {/* User Section */}
        <div className="p-4 border-t border-redesign-glass-border">
          {userProfile ? (
            <div className="p-3 bg-redesign-glass-bg border border-redesign-glass-border rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-redesign-cyan to-jungle-green-700 flex items-center justify-center text-white font-bold text-sm uppercase shadow-lg">
                {userProfile.username.substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{userProfile.username}</p>
                <button 
                  onClick={onLogout}
                  className="text-xs font-bold text-zinc-500 hover:text-red-400 uppercase tracking-tighter"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="w-full py-4 bg-redesign-cyan hover:bg-redesign-cyan/90 text-[#0b0f1a] rounded-xl font-bold text-base transition-all shadow-lg shadow-redesign-cyan/20 active:scale-[0.98]">
              Sign In
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
