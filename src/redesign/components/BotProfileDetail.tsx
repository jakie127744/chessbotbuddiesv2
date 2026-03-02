import React from 'react';
import { BotProfile } from '../lib/bot-profiles';

interface BotProfileDetailProps {
  bot: BotProfile;
  onClose: () => void;
  onSelect: (bot: BotProfile) => void;
}

const FLAG_MAP: Record<string, string> = {
  'US': '🇺🇸',
  'PH': '🇵🇭',
  'VN': '🇻🇳',
  'MX': '🇲🇽',
  'IN': '🇮🇳',
  'IT': '🇮🇹',
  'RU': '🇷🇺',
  'NO': '🇳🇴',
  'CN': '🇨🇳',
  'JP': '🇯🇵',
  'AU': '🇦🇺',
  'LU': '🇱🇺',
  'GX': '🌌'
};

export function BotProfileDetail({ bot, onClose, onSelect }: BotProfileDetailProps) {
  const flag = bot.nationality ? FLAG_MAP[bot.nationality] : '🏳️';
  
  return (
    <div className="absolute inset-0 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col z-20 animate-in slide-in-from-left-10 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between shrink-0 bg-[var(--surface)]">
        <button onClick={onClose} className="p-2 hover:bg-[var(--surface-highlight)] rounded-full text-[var(--text-secondary)] hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
         </button>
        <h2 className="text-lg font-bold text-white">Bot Profile</h2>
         <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center custom-scrollbar bg-[var(--surface)]">
          {/* Avatar Ring */}
          <div className="relative mb-6 group">
           <div className="absolute -inset-1 bg-jungle-green-500/30 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-500"></div>
             <img 
               src={bot.avatar} 
               alt={bot.name}
            className="relative w-32 h-32 rounded-full border-4 border-[var(--border)] shadow-2xl object-cover"
             />
           <div className="absolute bottom-0 right-0 bg-[var(--surface)] rounded-full p-1.5 border border-[var(--border)] shadow-sm" title={bot.nationality}>
                 <span className="text-2xl leading-none">{flag}</span>
             </div>
          </div>

          {/* Identity */}
          <div className="text-center mb-8 w-full">
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">{bot.nickname}</h1>
            <div className="text-[var(--text-secondary)] font-medium text-lg mb-3 flex items-center justify-center gap-2">
                <span>{bot.name}</span>
                <span className="w-1 h-1 rounded-full bg-[var(--border)]"></span>
                <span className="text-jungle-green-300 font-bold">{bot.elo === -1 ? 'Adaptive' : bot.elo}</span>
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-highlight)] border border-[var(--border)]">
               <span className={`w-2 h-2 rounded-full ${getPersonalityColor(bot.personality)}`}></span>
               <span className="text-sm font-medium capitalize text-[var(--text-secondary)]">{bot.personality}</span>
            </div>
          </div>




          {/* Stats Grid */}
           <div className="grid grid-cols-2 gap-4 w-full mb-8">
             <StatBox label="Opening" value={getOpeningKnowledge(bot)} icon="📖" />
             <StatBox label="Endgame" value={getEndgameSkill(bot)} icon="🏰" />
             <StatBox label="Aggression" value={getAggressionLevel(bot)} icon="⚔️" />
             <StatBox label="Speed" value={getSpeedLevel(bot)} icon="⚡" />
           </div>


          
          {/* Signature Openings */}
          {bot.openingPreferences && (
                <div className="w-full bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] mb-6">
                  <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Signature Openings</h3>
                  <div className="space-y-2 text-sm">
                     <div className="flex justify-between border-b border-[var(--border)] pb-1">
                       <span className="text-[var(--text-tertiary)]">White</span>
                       <span className="text-white font-medium text-right">{formatOpeningList(bot.openingPreferences.white)}</span>
                      </div>
                     <div className="flex justify-between border-b border-[var(--border)] pb-1">
                       <span className="text-[var(--text-tertiary)]">vs 1.e4</span>
                       <span className="text-white font-medium text-right">{formatOpeningList(bot.openingPreferences.blackVsE4)}</span>
                      </div>
                      <div className="flex justify-between border-b border-[var(--border)] pb-1">
                       <span className="text-[var(--text-tertiary)]">vs 1.d4</span>
                       <span className="text-white font-medium text-right">{formatOpeningList(bot.openingPreferences.blackVsD4)}</span>
                      </div>
                  </div>
              </div>
          )}

          {/* Bio / Fun Facts - Placeholder for now, could use longBio later */}
           <div className="w-full text-left space-y-4">
             <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border)] pb-2">Coach Notes</h3>
             <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
               {getCoachNotes(bot)}
             </p>
          </div>
      </div>

      {/* Footer Play Button */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)] shrink-0">
          <button 
            onClick={() => onSelect(bot)}
            className="w-full py-4 text-xl font-black bg-jungle-green-500 hover:bg-jungle-green-400 text-[#0b0f1a] rounded-lg shadow-lg shadow-jungle-green-500/20 hover:shadow-jungle-green-500/30 transform hover:-translate-y-0.5 transition-all active:translate-y-0"
          >
            Play vs {bot.name.split(' ')[0]}
          </button>
      </div>
    </div>
  );
}

// --- Helpers ---

function getPersonalityColor(p: string) {
  if (['aggressive', 'tactical'].includes(p)) return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
  if (['defensive', 'solid'].includes(p)) return 'bg-jungle-green-400 shadow-[0_0_8px_rgba(52,211,153,0.35)]';
  if (['chaotic', 'time_scrambler'].includes(p)) return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]';
  return 'bg-jungle-green-500 shadow-[0_0_8px_rgba(16,185,129,0.45)]';
}

function getOpeningKnowledge(bot: BotProfile) {
    if (bot.elo < 1000) return "Basic";
    if (bot.elo < 1600) return "Solid";
    if (bot.elo < 2000) return "Strong";
    return "Master";
}

function getEndgameSkill(bot: BotProfile) {
    if (bot.elo < 1200) return "Low";
    if (bot.elo < 1800) return "Okay";
    return "Precise";
}

function getAggressionLevel(bot: BotProfile) {
    if (bot.personality === 'aggressive') return "High";
    if (bot.personality === 'solid') return "Low";
    return "Medium";
}

function getSpeedLevel(bot: BotProfile) {
    if (bot.personality === 'time_scrambler') return "Fast";
    if (bot.elo > 2000) return "Calm";
    return "Normal";
}

function getCoachNotes(bot: BotProfile) {
    if (bot.personality === 'aggressive') return `${bot.name} is a dangerous attacker. Don't fall behind in development!`;
    if (bot.personality === 'solid') return `${bot.name} rarely makes mistakes. You'll need to outplay them strategically.`;
    if (bot.personality === 'chaotic') return "Expect the unexpected. Watch out for weird opening traps.";
    return `${bot.nickname} is a great training partner for balanced play.`;
}

function StatBox({ label, value, icon}: { label: string, value: string, icon: string }) {
  return (
    <div className="bg-[var(--surface-highlight)] rounded-lg p-3 flex flex-col items-center justify-center border border-[var(--border)]">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs text-[var(--text-tertiary)] font-medium uppercase">{label}</div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  );
}

function formatOpeningList(ids: string[]): string {
    if (!ids || ids.length === 0) return '-';
    return ids.slice(0, 2).map(id => {
        const lower = id.toLowerCase();
        if (['qgd', 'kid', 'kid-setup'].includes(lower)) return lower.replace('setup', '').toUpperCase().trim();
        if (['e5', 'd5', 'c5'].includes(lower)) return lower;
        return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }).join(', ');
}
