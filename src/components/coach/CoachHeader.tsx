
import React from 'react';
import { BotProfile } from '@/lib/bot-profiles';
import { Volume2, PauseCircle } from 'lucide-react';

interface CoachHeaderProps {
  coach: BotProfile;
  isPlaying: boolean;
  onToggleAudio: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onAudioEnd: () => void;
  onAudioError: (e: any) => void;
}

export function CoachHeader({ 
  coach, 
  isPlaying, 
  onToggleAudio, 
  audioRef,
  onAudioEnd,
  onAudioError
}: CoachHeaderProps) {
  return (
    <div className="p-4 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm z-10">
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold border-2 shadow-lg transition-transform hover:scale-105 overflow-hidden"
          style={{
            backgroundColor: `${coach.color}33`,
            borderColor: coach.color,
            color: coach.color
          }}
        >
          <img 
            src={coach.avatar} 
            alt={coach.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = coach.name.slice(0, 2);
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
           <h3 className="text-lg font-bold text-white truncate leading-tight">
             {coach.name} <span className="font-normal text-slate-400">"{coach.nickname}"</span>
           </h3>
           <p className="text-xs text-slate-400 font-medium mt-0.5">{coach.elo} ELO • {coach.tagline || 'Your personal coach'}</p>
        </div>

        {/* Audio Player Button */}
        {coach.audioPath && (
          <div className="flex items-center">
            <button
              onClick={onToggleAudio}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isPlaying 
                  ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]' 
                  : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title={isPlaying ? "Pause Commentary" : "Play Commentary Audio"}
            >
              {isPlaying ? <PauseCircle size={24} /> : <Volume2 size={24} />}
            </button>
            <audio 
              ref={audioRef} 
              src={coach.audioPath} 
              onEnded={onAudioEnd} 
              onError={onAudioError}
            />
          </div>
        )}
      </div>
    </div>
  );
}
