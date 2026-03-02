'use client';

import { Flame, CheckCircle2, CornerDownRight } from 'lucide-react';

interface TrainerCoachPanelProps {
  accuracy: number;
  mistakes: number;
  currentStreak: number;
  moveHistory: string[];
  deviationTrainingActive?: boolean;
  currentExplanation?: string;
  lastMoveStatus?: 'correct' | 'incorrect' | 'idle';
}

export function TrainerCoachPanel({ 
  accuracy, 
  mistakes, 
  currentStreak, 
  moveHistory,
  deviationTrainingActive = false,
  currentExplanation,
  lastMoveStatus = 'idle'
}: TrainerCoachPanelProps) {
  
  return (
    <aside className="w-80 border-l border-[#1a1b1e] flex flex-col bg-[#0c0c0d]">
      
      {/* Coach Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="size-14 rounded-2xl bg-[#135bec]/20 flex items-center justify-center overflow-hidden border border-[#135bec]/30">
              <img 
                src="/jakie_avi.png" 
                alt="Coach Jakie" 
                className="w-full h-full object-cover opacity-90"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if(target.src !== 'https://i.imgur.com/8Q5Z202.png') {
                        target.src = 'https://i.imgur.com/8Q5Z202.png'; // Basic fallback avatar
                    }
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 rounded-full border-2 border-[#0c0c0d]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">Coach Jakie</h3>
            {deviationTrainingActive ? (
              <p className="text-xs text-[#135bec] font-bold flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#135bec] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#135bec]" />
                </span>
                Deviation Training Active
              </p>
            ) : (
                <p className="text-xs text-emerald-500 font-bold flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Active Coaching
              </p>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
            <p className="text-[10px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Accuracy</p>
            <p className="text-xl font-extrabold text-zinc-100">{accuracy}%</p>
          </div>
          
          <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
            <p className="text-[10px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Mistakes</p>
            <p className={`text-xl font-extrabold ${mistakes > 0 ? 'text-rose-500' : 'text-zinc-100'}`}>{mistakes}</p>
          </div>
          
          <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
            <p className="text-[10px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Streak</p>
            <div className="flex items-center gap-1">
              <p className="text-xl font-extrabold text-orange-500">{currentStreak}</p>
              {currentStreak > 2 && <Flame className="text-orange-500" size={16} />}
            </div>
          </div>
          
          <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
            <p className="text-[10px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Sidelines</p>
            <p className="text-xl font-extrabold text-zinc-100">0/0</p>
          </div>
        </div>

        {/* Coach Explanation Bubble */}
        {currentExplanation && (
          <div className="mt-6 relative">
            <div className="absolute -left-2 top-4 size-4 bg-[#135bec]/10 rotate-45 border-l border-t border-[#135bec]/20" />
            <div className="bg-[#135bec]/10 border border-[#135bec]/20 rounded-2xl p-4 relative z-10">
              <p className="text-sm text-zinc-300 leading-relaxed">
                {currentExplanation}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Adaptive Message Box / Log */}
      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 px-2">Variation Log</div>
        <div className="space-y-1">
          {moveHistory.map((m, i) => (
             <div key={i} className="flex items-center gap-3 p-2 rounded-lg opacity-40 grayscale group">
               <CheckCircle2 className="text-zinc-500" size={14} />
               <p className="text-xs font-medium text-zinc-400">{Math.floor(i/2) + 1}. {i % 2 === 0 ? m : `... ${m}`}</p>
             </div>
          ))}
          {/* Active indicator */}
          <div className={`flex items-center gap-3 p-2 rounded-lg pl-3 border-l-4 transition-colors ${
            lastMoveStatus === 'incorrect' 
              ? 'bg-rose-500/10 text-rose-500 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]' 
              : 'bg-[#135bec]/10 text-[#135bec] border-[#135bec]'
          }`}>
             <div className={`size-1.5 rounded-full ${lastMoveStatus === 'incorrect' ? 'bg-rose-500 animate-pulse' : 'bg-[#135bec]'}`} />
             <p className="text-xs font-bold">
               {Math.floor(moveHistory.length/2) + 1}. {moveHistory.length % 2 === 0 ? '...' : ''}
               {lastMoveStatus === 'incorrect' && <span className="ml-2 uppercase text-[10px] tracking-tighter">Mistake</span>}
             </p>
          </div>
           <div className="flex items-center gap-3 p-2 ml-4 opacity-30">
             <CornerDownRight className={lastMoveStatus === 'incorrect' ? 'text-rose-600' : 'text-zinc-600'} size={12} />
             <p className={`text-[10px] font-medium italic ${lastMoveStatus === 'incorrect' ? 'text-rose-500' : 'text-zinc-500'}`}>
               {lastMoveStatus === 'incorrect' ? 'Incorrect move detected...' : 'Evaluating position...'}
             </p>
           </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="p-4 border-t border-white/5 text-center bg-[#0c0c0d]">
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
          Session #1 • Strict UI Engine Node Validation
        </p>
      </div>

    </aside>
  );
}
