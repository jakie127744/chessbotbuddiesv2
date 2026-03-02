'use client';

import { useState, useMemo, useEffect } from 'react';
import { BotProfile, getBotsByCategory, getCoachBots, BotCategory } from '@/lib/bot-profiles';
import { DEFAULT_REPERTOIRE, OpeningVariation } from '@/lib/openings-repertoire';
import { Crown, Play, BookOpen, Clock, Search, Bot, Users as UsersIcon, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TIME_CONTROLS, TimeControl } from '@/lib/game-config';
import { BotProfileDetail } from './BotProfileDetail'; // Import new component

interface BotSelectionPanelProps {
  onSelectBot: (bot: BotProfile) => void;
  selectedBot: BotProfile | null;
  onStartGame: (opening: OpeningVariation | null, timeControl: TimeControl, userSide: 'w' | 'b' | 'random', isPassAndPlay?: boolean) => void;
  coachEnabled: boolean;
  setCoachEnabled: (enabled: boolean) => void;
  selectedCoach: BotProfile | null;
  onSelectCoach: (coach: BotProfile | null) => void;
  initialTimeControl?: TimeControl;
  initialGameMode?: 'vs-bot' | 'pass-n-play';
}

export function BotSelectionPanel({
  onSelectBot,
  selectedBot,
  onStartGame,
  coachEnabled,
  setCoachEnabled,
  selectedCoach,
  onSelectCoach,
  initialTimeControl,
  initialGameMode = 'vs-bot'
}: BotSelectionPanelProps) {
  const tabs: BotCategory[] = useMemo(() => ['Beginner', 'Intermediate', 'Advanced', 'Master', 'Special'], []);
  const [activeTab, setActiveTab] = useState<BotCategory>('Beginner');
  const botsByTab = useMemo(() => getBotsByCategory(), []);
  const coachBots = useMemo(() => getCoachBots(), []);
  
  const [selectedOpening, setSelectedOpening] = useState<OpeningVariation | null>(null);
  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControl>(initialTimeControl || TIME_CONTROLS[4]); 

  useEffect(() => {
    if (initialTimeControl) {
        setSelectedTimeControl(initialTimeControl);
    }
  }, [initialTimeControl]);

  const [selectedSide, setSelectedSide] = useState<'w' | 'b' | 'random'>('random');

  // Opening Search State
  const [openingSearch, setOpeningSearch] = useState('');
  const [isOpeningListOpen, setIsOpeningListOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<BotProfile | null>(null);
  
  // New: Game Mode State
  const [gameMode, setGameMode] = useState<'vs-bot' | 'pass-n-play'>(initialGameMode);
  
  // Effect to sync gameMode if prop changes (e.g. re-navigation)
  useEffect(() => {
      setGameMode(initialGameMode);
  }, [initialGameMode]);

  // Helper to map country code to flag emoji
  const getFlag = (code?: string) => {
      const flags: Record<string, string> = { 
        'US': '🇺🇸', 'PH': '🇵🇭', 'VN': '🇻🇳', 'MX': '🇲🇽', 
        'IN': '🇮🇳', 'RU': '🇷🇺', 'NO': '🇳🇴', 'CN': '🇨🇳',
        'JP': '🇯🇵', 'AU': '🇦🇺', 'LU': '🇱🇺', 'GX': '🌌'
      };
      return flags[code || 'US'] || '🏳️';
  };

  // Filter and Sort Openings
  const filteredOpenings = useMemo(() => {
    return DEFAULT_REPERTOIRE
        .filter(o => o.name.toLowerCase().includes(openingSearch.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));
  }, [openingSearch]);

  // Accordion State
  const [expandedCategory, setExpandedCategory] = useState<BotCategory | null>('Beginner');
  
  // Game Setup Stage: 'selection' | 'setup'
  const [setupStage, setSetupStage] = useState<'selection' | 'setup'>('selection');

  // Reset stage when deselecting bot
  const handleBotSelect = (bot: BotProfile) => {
      onSelectBot(bot);
      setSetupStage('setup');
  };

  const handleBackToSelection = () => {
      setSetupStage('selection');
  };

  // Helper to toggle category
  const toggleCategory = (category: BotCategory) => {
    setExpandedCategory(prev => prev === category ? null : category);
  };

  return (
    <div className="flex flex-col h-auto lg:h-full bg-[var(--color-bg-secondary)] lg:overflow-y-auto lg:overflow-hidden relative font-sans">
      {/* Profile Detail Overlay */}
      <AnimatePresence>
         {viewingProfile && (
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-0 z-50 h-full w-full"
            >
                <BotProfileDetail 
                    bot={viewingProfile} 
                    onClose={() => setViewingProfile(null)}
                    onSelect={(bot) => {
                        handleBotSelect(bot);
                        setViewingProfile(null);
                    }}
                />
            </motion.div>
         )}
      </AnimatePresence>

      {/* Top Banner: Selected Bot Preview (Current Opponent) */}
      <div className="relative shrink-0 overflow-hidden transition-all duration-500 ease-in-out">
          {/* Background with overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] opacity-90 z-0"></div>
          {/* Texture overlay removed */}
          
          <div className={`relative z-10 p-3 lg:p-6 flex flex-col items-center justify-center text-center transition-all ${setupStage === 'setup' ? 'min-h-[100px] lg:min-h-[160px]' : 'min-h-[100px] lg:min-h-[160px]'}`}>
             
             {/* Header Title / Back Button */}
             <div className="absolute top-4 left-4 flex items-center gap-2 text-white/80 z-20">
                {setupStage === 'setup' ? (
                    <button onClick={handleBackToSelection} className="flex items-center gap-1 hover:text-white transition-colors group">
                        <div className="bg-white/10 p-1 rounded-lg group-hover:bg-white/20">
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest pl-1">Change</span>
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <Bot size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">
                            {initialTimeControl && !selectedBot ? (
                                <span className="text-emerald-400 flex items-center gap-1">
                                    Playing {initialTimeControl.label.split('•')[0]} <span className="text-white/40 mx-1">•</span> Select Opponent
                                </span>
                            ) : 'Play Bots'}
                        </span>
                    </div>
                )}
             </div>

             {gameMode === 'vs-bot' && selectedBot ? (
                 <>
                    {/* Bot Avatar */}
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key="bot-preview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-5 w-full max-w-md mx-auto"
                        >
                            <div className="relative shrink-0">
                                <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-xl lg:rounded-2xl border-2 lg:border-4 border-white/20 shadow-xl overflow-hidden bg-white/10">
                                    <img src={selectedBot.avatar} alt={selectedBot.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-white text-[#1e3a8a] text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm border border-white/50">
                                    {selectedBot.elo === -1 ? '?' : selectedBot.elo}
                                </div>
                            </div>
                            
                            {/* Bot Name & Flag */}
                            <div className="text-left flex-1 min-w-0">
                                <h2 className="text-lg lg:text-2xl font-black tracking-tight text-white leading-none mb-1">{selectedBot.name}</h2>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg opacity-80" title={selectedBot.nationality}>{getFlag(selectedBot.nationality)}</span>
                                    <span className="text-xs font-bold text-blue-200 uppercase tracking-wide bg-blue-900/30 px-2 py-0.5 rounded-md border border-white/10">Bot</span>
                                </div>
                                <div className="text-xs font-medium text-blue-100 italic line-clamp-2 opacity-80">"{selectedBot.description || selectedBot.nickname}"</div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                 </>
             ) : gameMode === 'pass-n-play' ? (
                <div className="text-white space-y-2 py-4">
                    <div className="w-16 h-16 bg-white/10 rounded-full mx-auto flex items-center justify-center border-4 border-white/20 backdrop-blur-sm">
                        <UsersIcon size={32} className="text-white" />
                    </div>
                    <h2 className="text-xl font-black tracking-tight">Pass & Play</h2>
                </div>
             ) : (
                <div className="text-white space-y-2 py-4 opacity-70">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center border-2 border-dashed border-white/30 animate-pulse">
                        <Bot size={32} />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest">Select an Opponent</p>
                </div>
             )}
          </div>
      </div>

      {/* Main Content Area: Swaps between Accordion and Setup Form */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0f172a] p-2 lg:p-3 space-y-3 lg:space-y-4 min-h-0">
        
        {/* STAGE 1: Bot Selection (Accordion) */}
        {setupStage === 'selection' && gameMode === 'vs-bot' && (
           <div className="space-y-2 animate-in slide-in-from-right-8 duration-300">
             {tabs.map((category) => {
               const isExpanded = expandedCategory === category;
               const bots = botsByTab[category];
               const firstBot = bots[0];
               
               return (
                   <div key={category} className="rounded-2xl overflow-hidden bg-[#1e293b]/50 border border-white/5 transition-all duration-300">
                       <button 
                           onClick={() => toggleCategory(category)}
                           className={`w-full flex items-center p-2 lg:p-3 gap-3 lg:gap-4 transition-colors ${isExpanded ? 'bg-[#1e293b]' : 'hover:bg-[#1e293b]/80'}`}
                       >
                           <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-[#0f172a] border border-white/10 overflow-hidden shrink-0 relative">
                               {firstBot ? (
                                   <img src={firstBot.avatar} className="w-full h-full object-cover opacity-80" />
                               ) : (
                                   <div className="flex items-center justify-center h-full text-white/20"><Bot size={20} /></div>
                               )}
                               <div className="absolute inset-0 bg-blue-500/20 mix-blend-overlay"></div>
                           </div>
                           <div className="flex-1 text-left">
                               <h3 className="text-base font-black text-white tracking-wide">{category}</h3>
                               <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{bots.length} Bots</p>
                           </div>
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-blue-500 text-white rotate-180' : 'bg-[#0f172a] text-blue-400'}`}>
                               <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4L6 8L10 4"/></svg>
                           </div>
                       </button>

                       <AnimatePresence>
                           {isExpanded && (
                               <motion.div
                                   initial={{ height: 0, opacity: 0 }}
                                   animate={{ height: 'auto', opacity: 1 }}
                                   exit={{ height: 0, opacity: 0 }}
                                   className="border-t border-white/5"
                               >
                                   <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                       {bots.map(bot => (
                                            <div
                                                key={bot.id}
                                                className="flex items-center justify-between p-2 rounded-xl border border-transparent hover:bg-[#1e293b] hover:border-white/10 transition-all group"
                                            >
                                                <button 
                                                    onClick={() => handleBotSelect(bot)}
                                                    className="flex items-center gap-3 flex-1 text-left min-w-0"
                                                >
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 group-hover:border-white/30 truncate shrink-0">
                                                        <img src={bot.avatar} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between">
                                                             <div className="text-sm font-bold text-white truncate group-hover:text-blue-200">{bot.name}</div>
                                                             <div className="text-[10px] font-bold text-white/40">{getFlag(bot.nationality)}</div>
                                                        </div>
                                                        <div className="text-[10px] font-medium text-slate-400">Rating: {bot.elo === -1 ? 'Adj.' : bot.elo}</div>
                                                    </div>
                                                </button>
                                                
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setViewingProfile(bot);
                                                    }}
                                                    className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="View Profile"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                       ))}
                                   </div>
                               </motion.div>
                           )}
                       </AnimatePresence>
                   </div>
               );
             })}
           </div>
        )}

        {/* STAGE 2: Match Setup (Time, Coach, etc.) */}
        {(setupStage === 'setup' || gameMode === 'pass-n-play') && (
            <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                
                {/* 1. Time Control */}
                <div className="bg-[#1e293b]/50 rounded-2xl p-4 border border-white/5">
                    <label className="flex items-center gap-2 mb-3 text-[10px] font-black text-[#69e0a3] uppercase tracking-widest">
                        <Clock size={14} /> Time Control
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {TIME_CONTROLS.slice(0,6).map((tc) => (
                            <button
                                key={tc.label}
                                onClick={() => setSelectedTimeControl(tc)}
                                className={`
                                    px-3 py-3 rounded-xl text-xs font-black border transition-all flex flex-col items-center justify-center gap-1
                                    ${selectedTimeControl.label === tc.label
                                        ? 'bg-[#69e0a3]/10 border-[#69e0a3] text-white shadow-[0_0_10px_rgba(105,224,163,0.1)]'
                                        : 'bg-[#0f172a]/50 border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                                    }
                                `}
                            >
                                <span className="truncate w-full text-center">{tc.label.split('•')[0]}</span>
                                <span className="text-[9px] font-bold opacity-60 uppercase tracking-tighter">{tc.label.split('•')[1] || ''}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. AI Coach (REMOVED: Coach only available in Review/Endgame) */}
                {/* Previous code block removed as per requirements */ }

                {/* 3. Opening & Side */}
                <div className="bg-[#1e293b]/50 rounded-2xl p-4 border border-white/5 space-y-4">
                     <div className="grid grid-cols-1 gap-4">
                         
                         {/* Opening Selection (Requested prominent placement) */}
                         <div>
                             <label className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest mb-2 flex items-center justify-between">
                                <span>Specific Opening?</span>
                                <span className="text-[9px] text-slate-500 font-bold normal-case">Optional</span>
                             </label>
                             <div className="relative">
                                 <button 
                                    onClick={() => setIsOpeningListOpen(!isOpeningListOpen)}
                                    className={`w-full h-11 border rounded-xl px-3 text-left text-xs font-bold flex items-center justify-between transition-all ${isOpeningListOpen || selectedOpening ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-text-primary)]' : 'bg-[var(--background)] border-white/10 text-slate-400 hover:border-white/30'}`}
                                 >
                                     <div className="flex items-center gap-2">
                                        <BookOpen size={14} className={selectedOpening ? "text-[var(--color-primary)]" : "opacity-50"} />
                                        <span className="truncate">{selectedOpening ? selectedOpening.name : 'No specific opening (Standard)'}</span>
                                     </div>
                                     <div className="bg-[#0f172a] p-1 rounded-md border border-white/10"><Search size={10} /></div>
                                 </button>
                                 
                                 {/* Dropdown */}
                                 {isOpeningListOpen && (
                                     <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto custom-scrollbar p-1">
                                         <input 
                                            type="text" 
                                            placeholder="Search..." 
                                            autoFocus
                                            className="w-full bg-[var(--surface-highlight)] border-none rounded-lg p-2 text-xs font-bold text-[var(--color-text-primary)] mb-1 focus:ring-1 focus:ring-[var(--color-primary)]"
                                            value={openingSearch}
                                            onChange={(e) => setOpeningSearch(e.target.value)}
                                         />
                                         <button onClick={() => { setSelectedOpening(null); setIsOpeningListOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-400 hover:bg-white/5 rounded-lg border-b border-white/5 mb-1">Standard Game</button>
                                         {filteredOpenings.map(op => (
                                             <button key={op.id} onClick={() => { setSelectedOpening(op); setIsOpeningListOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-bold text-white hover:bg-white/5 rounded-lg flex justify-between group">
                                                 <span className="truncate">{op.name}</span>
                                                 <span className="text-[9px] opacity-0 group-hover:opacity-50 bg-white/10 px-1.5 py-0.5 rounded">{op.difficulty}</span>
                                             </button>
                                         ))}
                                     </div>
                                 )}
                             </div>
                         </div>

                         {/* Side Selection */}
                         <div>
                             <label className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest mb-2 block">Play As</label>
                             <div className="flex bg-[#0f172a] rounded-lg p-1 border border-white/5">
                                 <button onClick={() => setSelectedSide('w')} className={`flex-1 h-9 rounded-md flex items-center justify-center gap-2 transition-all ${selectedSide === 'w' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                                    <div className="w-3 h-3 bg-white border border-slate-300 rounded-full shadow-inner"></div>
                                    <span className="text-[10px] font-black uppercase">White</span>
                                 </button>
                                 <button onClick={() => setSelectedSide('random')} className={`flex-1 h-9 rounded-md flex items-center justify-center transition-all ${selectedSide === 'random' ? 'bg-[#1e293b] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                                    <span className="font-black text-xs">?</span>
                                 </button>
                                 <button onClick={() => setSelectedSide('b')} className={`flex-1 h-9 rounded-md flex items-center justify-center gap-2 transition-all ${selectedSide === 'b' ? 'bg-black text-white border border-white/20 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                                    <div className="w-3 h-3 bg-black border border-slate-600 rounded-full shadow-inner"></div>
                                    <span className="text-[10px] font-black uppercase">Black</span>
                                 </button>
                             </div>
                         </div>
                     </div>
                </div>

            </div>
        )}
      </div>

      {/* Footer: Play Button (Only visible in Setup Stage) */}
      {(setupStage === 'setup' || gameMode === 'pass-n-play') && (
          <div className="p-4 bg-[#0f172a] border-t border-white/5 shadow-2xl z-20 animate-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => onStartGame(selectedOpening, selectedTimeControl, selectedSide, gameMode === 'pass-n-play')}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#81b64c] to-[#74a543] font-black text-xl text-white tracking-widest uppercase shadow-lg shadow-green-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <Play size={24} className="fill-white relative z-10" />
              <span className="relative z-10">Start Match</span>
            </button>
          </div>
      )}
      
      {/* Footer: Game Mode Toggle (Only visible in Selection Stage) */}
      {setupStage === 'selection' && (
          <div className="p-4 bg-[#0f172a] border-t border-white/5 z-20">
              <div className="flex gap-1 bg-[#1e293b] p-1 rounded-xl">
                <button onClick={() => setGameMode('vs-bot')} className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${gameMode === 'vs-bot' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                    Vs Bot
                </button>
                <button onClick={() => { setGameMode('pass-n-play'); setSetupStage('selection'); }} className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${gameMode === 'pass-n-play' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                    Pass & Play
                </button>
              </div>
          </div>
      )}

    </div>
  );
}
