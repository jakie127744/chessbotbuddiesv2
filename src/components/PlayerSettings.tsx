'use client';

import { useState, useRef, useEffect } from 'react';
import { X, User, Palette, Crown, Camera, Trophy, Puzzle, Check, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRIES } from '@/lib/countries';
import { FlagComponent } from './FlagComponent';
import { BoardColorSchemeSelector } from './BoardColorSchemeSelector';
import { PieceStyleSelector } from './PieceStyleSelector';
import { useBoardColorScheme } from '@/contexts/BoardColorSchemeContext';
import { usePieceStyle } from '@/contexts/PieceStyleContext';
import { getUserProfile, updateUserProfile, UserProfile } from '@/lib/user-profile';

interface PlayerSettingsProps {
  onClose?: () => void;
  onProfileUpdate?: (user: UserProfile) => void;
  onLogout?: () => void;
}

export function PlayerSettings({ onClose, onProfileUpdate, onLogout }: PlayerSettingsProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'stats'>('profile');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { colorScheme, setColorScheme } = useBoardColorScheme();
  const { pieceStyle, setPieceStyle } = usePieceStyle();

  // Load profile on mount
  useEffect(() => {
    const p = getUserProfile();
    if (p) {
      setProfile(p);
      setUsername(p.username || '');
      setDisplayName(p.displayName || '');
      setTempAvatar(p.avatar || null);
    }
  }, []);

  const isGuest = profile?.id.startsWith('guest');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Read file and resize
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to 200x200 max
        const canvas = document.createElement('canvas');
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Center crop to square
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        const base64 = canvas.toDataURL('image/webp', 0.8);
        setTempAvatar(base64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSaveMessage(null);
    
    const result = await updateUserProfile({
      username: username.trim() || undefined,
      displayName: displayName.trim() || undefined,
      avatar: tempAvatar || undefined,
      country: profile?.country || 'US',
    });
    
    if (!result.success) {
        // Show error
        setSaveMessage(result.error || 'Failed to save');
        return;
    }
    
    // Refresh profile
    const p = getUserProfile();
    if (p) {
        setProfile(p);
        onProfileUpdate?.(p);
    }
    
    setSaveMessage('Profile saved!');
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'stats', label: 'Stats', icon: Trophy },
  ] as const;

  return (
    <div className="h-full w-full bg-theme-surface flex flex-col p-6 overflow-hidden">
      <div className="bg-theme-surface rounded-xl border-2 border-theme w-full max-w-4xl mx-auto h-full p-8 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#243354]/30 rounded-xl flex items-center justify-center border border-white/10">
              <Crown className="text-yellow-400" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Player Settings</h1>
              <p className="text-indigo-200/70">Customize your experience</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-800/30 rounded-t-xl overflow-hidden shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-400 border-b-2 border-indigo-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/20 border border-t-0 border-slate-700/50 relative">
          <AnimatePresence mode="wait">

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden border-4 border-slate-700 shadow-xl">
                      {tempAvatar ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={tempAvatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} className="text-white/70" />
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center border-2 border-slate-900 transition-colors shadow-lg group-hover:scale-110"
                    >
                      <Camera size={18} className="text-white" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-slate-400">Click camera to upload a photo</p>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} // Basic validation
                    placeholder="Choose a unique username..."
                    disabled={isGuest} // Identify if strict guest?? Actually just let them change it.
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
                    maxLength={20}
                  />
                  <p className="text-xs text-slate-500 mt-1">Unique identifier for rankings (Letters, numbers, underscores only)</p>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter a display name..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    maxLength={30}
                  />
                  <p className="text-xs text-slate-500 mt-1">Optional custom name shown in the app</p>
                </div>

                {/* Country Selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Country
                  </label>
                  
                  <div className="bg-slate-800 border border-slate-700 rounded-lg max-h-48 overflow-y-auto custom-scrollbar p-1 grid grid-cols-2 gap-1">
                     {COUNTRIES.map((c) => (
                         <button
                            key={c.code}
                            onClick={() => {
                                setProfile(prev => prev ? ({ ...prev, country: c.code }) : null);
                            }}
                            className={`
                                flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left
                                ${profile?.country === c.code 
                                    ? 'bg-indigo-600 text-white shadow-sm' 
                                    : 'text-slate-300 hover:bg-slate-700'}
                            `}
                         >
                            <div className="w-5 h-4 shrink-0 shadow-sm rounded-[2px] overflow-hidden">
                                <FlagComponent country={c.code} className="w-full h-full object-cover" />
                            </div>
                            <span className="truncate flex-1">{c.name}</span>
                            {profile?.country === c.code && <Check size={14} className="shrink-0" />}
                         </button>
                     ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Select your country for local leaderboards</p>
                </div>

                {/* Email (read-only if exists) */}
                {profile?.email && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-400 select-none">
                      {profile.email}
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <button
                  onClick={handleSaveProfile}
                  className={`w-full py-3 ${
                      saveMessage && saveMessage.includes('wait') 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-indigo-600 hover:bg-indigo-500'
                   } text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-[0.99]`}
                >
                  {saveMessage ? (
                    <>
                      {saveMessage.includes('wait') ? (
                          <X size={20} className="text-white" />
                      ) : (
                          <Check size={20} />
                      )}
                      
                      {saveMessage}
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </button>

                {/* Danger Zone */}
                <div className="pt-6 border-t border-slate-700/50 mt-6">
                   <h3 className="text-sm font-bold text-red-400 mb-4 uppercase tracking-wider">Danger Zone</h3>
                   <button
                     onClick={() => {
                        if (confirm('Are you sure you want to log out?')) {
                          onLogout?.();
                        }
                     }}
                     className="w-full py-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                   >
                     Log Out of Account
                   </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Board Colors */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm" />
                    Board Colors
                  </h3>
                  <BoardColorSchemeSelector
                    selected={colorScheme}
                    onChange={setColorScheme}
                  />
                </div>

                {/* Piece Style */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Crown size={24} className="text-yellow-400" />
                    Piece Style
                  </h3>
                  <PieceStyleSelector
                    selected={pieceStyle}
                    onChange={setPieceStyle}
                    className="grid grid-cols-3 gap-4"
                  />
                </div>

                <p className="text-sm text-slate-400 text-center py-4 bg-slate-800/50 rounded-lg">
                  Changes are applied immediately and saved automatically
                </p>
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/80 rounded-xl p-6 text-center border border-slate-700 hover:border-slate-600 transition-colors">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
                      <Trophy className="text-emerald-400" size={24} />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {profile?.stats?.gamesPlayed || 0}
                    </div>
                    <div className="text-sm text-slate-400">Games Played</div>
                  </div>
                  
                  <div className="bg-slate-800/80 rounded-xl p-6 text-center border border-slate-700 hover:border-slate-600 transition-colors">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-purple-500/20">
                      <Puzzle className="text-purple-400" size={24} />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {profile?.stats?.puzzlesSolved || 0}
                    </div>
                    <div className="text-sm text-slate-400">Puzzles Solved</div>
                  </div>
                </div>

                {/* Member Since */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
                  <p className="text-sm text-slate-400">Member since</p>
                  <p className="text-lg font-medium text-white">
                    {profile?.createdAt 
                      ? new Date(profile.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : 'Unknown'
                    }
                  </p>
                </div>

                {/* Completed Lessons */}
                {profile?.completedLessons && profile.completedLessons.length > 0 && (
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-400 mb-3 ml-1">Completed Lessons</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.completedLessons.map((lesson, i) => (
                        <span 
                          key={i}
                          className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20 flex items-center gap-1"
                        >
                          <Check size={10} strokeWidth={3} /> {lesson}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Links */}
        <div className="p-4 bg-slate-900/40 border-t border-slate-700/50 rounded-b-xl flex justify-center">
            <a href="/safety" target="_blank" className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors text-xs font-medium uppercase tracking-wider">
                <Shield size={14} />
                Safety & Learning Environment
            </a>
        </div>
      </div>
    </div>
  );
}
