'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Home, Gamepad2, Target, GraduationCap, Microscope, Trophy, 
  History as HistoryIcon, Book, Settings, User, X, ChevronDown, ChevronRight,
  Swords, Bot, Users, LayoutGrid, FlaskConical, BarChart3, Sun, Moon, Facebook, Download
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UserProfile } from '@/lib/user-profile';
import { Mascot } from './Mascot';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export type ViewType = 'home' | 'game' | 'profile' | 'leaderboard' | 'puzzles' | 'learn' | 'endgame' | 'history' | 'openings' | 'analysis' | 'settings' | 'news' | 'review';

interface NavSection {
  id: string;
  label: string;
  icon: React.ElementType;
  items?: { id: ViewType; label: string; icon: React.ElementType; href?: string }[];
  action?: () => void;
  href?: string;
}

interface SidebarProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
  userProfile?: UserProfile | null;
  onLogout?: () => void;
  onLogin?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  activeView,
  onNavigate,
  userProfile,
  onLogout,
  onLogin,
  isOpen,
  onClose
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const { isInstallable, install } = usePWAInstall();
  const [expandedSections, setExpandedSections] = useState<string[]>(['play']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const navSections: NavSection[] = [
    { 
      id: 'landing', 
      label: 'Lobby', 
      icon: Home, 
      href: '/',
      action: () => {
          if (window.innerWidth < 768) onClose();
      }
    },
    { 
      id: 'home', 
      label: 'Dashboard', 
      icon: LayoutGrid, 
      href: '/play',
      action: () => onNavigate('home') 
    },
    {
      id: 'play',
      label: 'Play',
      icon: Gamepad2,
      items: [
        { id: 'game', label: 'vs Computer', icon: Bot, href: '/play?view=game&mode=bot' },
        { id: 'game', label: 'Play a Friend', icon: Swords, href: '/play?view=game&mode=pass_play' },
      ]
    },
    { 
      id: 'analysis', 
      label: 'Analysis Board', 
      icon: Microscope, 
      href: '/play?view=analysis',
      action: () => onNavigate('analysis') 
    },
    { 
      id: 'history', 
      label: 'Game History', 
      icon: HistoryIcon, 
      href: '/play?view=history',
      action: () => onNavigate('history') 
    },
    { 
      id: 'puzzles', 
      label: 'Puzzle Trainer', 
      icon: Target, 
      href: '/puzzles',
      action: () => onNavigate('puzzles') 
    },
    { 
      id: 'learn', 
      label: 'Chess Academy', 
      icon: GraduationCap, 
      href: '/learn',
      action: () => onNavigate('learn') 
    },
    {
       id: 'minigames',
       label: 'Mini-Games',
       icon: Trophy,
       href: '/learn?view=minigames',
       action: () => onNavigate('learn')
    },
    { 
      id: 'openings', 
      label: 'Opening Trainer', 
      icon: Book, 
      href: '/openings',
      action: () => onNavigate('openings') 
    },
    { 
      id: 'endgame', 
      label: 'Endgame Lab', 
      icon: FlaskConical, 
      href: '/endgame',
      action: () => onNavigate('endgame') 
    },
    { 
      id: 'news', 
      label: 'News', 
      icon: Book, 
      href: '/news',
      action: () => onNavigate('news') 
    },
    { 
      id: 'more',
      label: 'More',
      icon: LayoutGrid,
      items: [
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, href: '/play?view=leaderboard' },
        { id: 'profile', label: 'Profile', icon: User, href: '/play?view=profile' },
        { id: 'settings', label: 'Settings', icon: Settings, href: '/play?view=settings' },
      ]
    },
  ];

  const handleItemClick = (view: ViewType) => {
    onNavigate(view);
    if (window.innerWidth < 768) onClose();
  };

  const isActiveSection = (section: NavSection) => {
    if (section.action) {
      return activeView === section.id;
    }
    return section.items?.some(item => item.id === activeView);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:sticky top-0 left-0 h-full z-50
        w-64 md:w-60 lg:w-64
        bg-gradient-to-b from-bg-primary to-bg-secondary
        border-r border-border-color/50
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-border-color/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Mascot size={36} />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#69e0a3] rounded-full border-2 border-[#0f1729]" />
            </div>
            <div>
              <span className="font-display font-bold text-text-primary text-lg">
                ChessBot<span className="text-jungle-green-400">Buddies</span>
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-tertiary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto custom-scrollbar space-y-1">
          {navSections.map((section) => (
            <div key={section.id}>
              {/* Section Header / Direct Link */}
              {section.href ? (
                <Link
                  href={section.href}
                  onClick={(e) => {
                     // Link handles navigation, we just close sidebar on mobile
                     if (window.innerWidth < 768) onClose();
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-3 rounded-xl
                    transition-all duration-200 text-sm font-bold group
                    ${isActiveSection(section) 
                      ? 'bg-gradient-to-r from-jungle-green-500/15 via-jungle-green-500/5 to-transparent text-jungle-green-400 border-l-4 border-jungle-green-500 shadow-[0_0_15px_rgba(0,255,183,0.2)]' 
                      : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'}
                  `}
                >
                   <div className="flex items-center gap-3">
                      <section.icon 
                        size={20} 
                        className={`transition-colors ${isActiveSection(section) ? 'text-jungle-green-400' : 'text-text-muted group-hover:text-text-primary'}`}
                      />
                      <span>{section.label}</span>
                    </div>
                </Link>
              ) : (
                <button
                  onClick={() => {
                     if (section.action) {
                        section.action();
                        if (window.innerWidth < 768) onClose();
                     } else {
                        toggleSection(section.id);
                     }
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-3 rounded-xl
                    transition-all duration-200 text-sm font-bold group
                    ${isActiveSection(section) 
                      ? 'bg-gradient-to-r from-jungle-green-500/15 via-jungle-green-500/5 to-transparent text-jungle-green-400 border-l-4 border-jungle-green-500 shadow-[0_0_15px_rgba(0,255,183,0.25)]' 
                      : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <section.icon 
                      size={20} 
                      className={`transition-colors ${isActiveSection(section) ? 'text-jungle-green-400' : 'text-text-muted group-hover:text-text-primary'}`}
                    />
                    <span>{section.label}</span>
                  </div>
                  {section.items && (
                    <div className={`transition-transform duration-200 ${expandedSections.includes(section.id) ? 'rotate-180' : ''}`}>
                      <ChevronDown size={16} className="text-text-muted" />
                    </div>
                  )}
                </button>
              )}

              {/* Expandable Items */}
              {section.items && expandedSections.includes(section.id) && (
                <div className="ml-4 mt-1 space-y-1 pl-4 border-l border-border-color/50">
                  {section.items.map((item, idx) => {
                    const isActive = activeView === item.id;
                    
                    return (
                        <Link
                            key={`${section.id}-${item.id}-${idx}`}
                            href={item.href || '#'}
                            onClick={() => {
                                 if (window.innerWidth < 768) onClose();
                                 if (!item.href) handleItemClick(item.id);
                            }}
                            className={`
                              w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                              transition-all duration-200
                              ${isActive 
                                ? 'bg-jungle-green-500/10 text-jungle-green-400' 
                                : 'text-text-muted hover:bg-bg-tertiary hover:text-text-primary'}
                            `}
                        >
                            <item.icon size={16} />
                            <span>{item.label}</span>
                        </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* ... (Rest of Sidebar logic unchanged: ChessBotBuddy, Facebook, Theme, Install, User Profile) */}
        {/* ChessBotBuddy Feature Link */}
        <a 
          href="/chessbotbuddy"
          className="mx-3 mb-2 flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-jungle-green-600/15 to-jungle-green-400/15 border border-jungle-green-500/25 hover:from-jungle-green-600/25 hover:to-jungle-green-400/25 transition-all group shadow-[0_0_12px_rgba(0,255,183,0.12)]"
        >
          <span className="text-2xl">🤖</span>
          <div>
            <div className="font-bold text-white text-sm">ChessBotBuddy</div>
            <div className="text-xs text-jungle-green-200">Meet The Matrix</div>
          </div>
          <span className="ml-auto text-xs bg-jungle-green-500/25 text-jungle-green-200 px-2 py-0.5 rounded-full">NEW</span>
        </a>




        {/* Facebook Page Link */}
        <a 
          href="https://www.facebook.com/profile.php?id=61585450256243"
          target="_blank"
          rel="noopener noreferrer"
          className="mx-3 mb-2 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/20 hover:bg-[#1877F2]/20 text-[#1877F2] transition-all group"
        >
          <Facebook size={26} />
          <div>
            <div className="font-bold text-sm">Follow Us</div>
            <div className="text-[10px] opacity-70">on Facebook</div>
          </div>
        </a>

        {/* Theme Toggle */}
        <div className="px-4 pb-2">
            <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-bg-tertiary/30 hover:bg-bg-tertiary border border-border-color/30 transition-all group"
            >
                <div className="flex items-center gap-2">
                    {theme === 'dark' ? (
                        <Moon size={16} className="text-[#a78bfa]" />
                    ) : (
                        <Sun size={16} className="text-[#ffd95a]" />
                    )}
                    <span className="text-xs font-bold text-text-secondary group-hover:text-text-primary">
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </span>
                </div>
                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${theme === 'dark' ? 'bg-bg-tertiary' : 'bg-jungle-green-500'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-0' : 'translate-x-4'}`} />
                </div>
            </button>
        </div>

        {/* Install App Button (PWA) */}
        {isInstallable && (
            <div className="px-4 mb-2">
                <button
                    onClick={install}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-jungle-green-600/15 to-jungle-green-400/15 border border-jungle-green-500/30 hover:from-jungle-green-600/25 hover:to-jungle-green-400/25 text-jungle-green-100 font-bold text-sm transition-all group shadow-lg shadow-jungle-green-500/15"
                >
                    <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                    Install App
                </button>
            </div>
        )}

        {/* User Profile Footer */}
        <div className="p-4 pt-2 border-t border-border-color/50">
          {userProfile && !userProfile.id.startsWith('guest_') ? (
            <div 
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-3 p-3 rounded-xl bg-bg-tertiary/50 hover:bg-bg-tertiary cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-jungle-green-500 to-jungle-green-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-jungle-green-500/25">
                {userProfile.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-text-primary truncate">
                  {userProfile.username}
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-jungle-green-300 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-jungle-green-300 animate-pulse" />
                    Online
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onLogout?.();
                    }}
                    className="text-[10px] uppercase tracking-wider font-bold text-red-400 hover:text-red-300 transition-colors ml-2"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
                {userProfile && userProfile.id.startsWith('guest_') && (
                     <div className="px-1 flex items-center justify-between text-xs text-text-muted">
                        <span>Guest: <span className="text-jungle-green-400 font-bold">{userProfile.username}</span></span>
                     </div>
                )}
                <button 
                  onClick={() => onLogin && onLogin()} 
                  className="w-full py-3 bg-gradient-to-r from-jungle-green-600 to-jungle-green-500 hover:from-jungle-green-500 hover:to-jungle-green-400 text-[#04130d] rounded-xl font-bold text-sm transition-all shadow-lg shadow-jungle-green-500/25 hover:shadow-jungle-green-500/40 active:scale-[0.98]"
                >
                  {userProfile ? 'Sign In / Register' : 'Sign In'}
                </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
