'use client';

import { Opening, Variation } from '@/lib/opening-data';
import { Shuffle, CheckCircle, AlertTriangle, Circle, ArrowRight } from 'lucide-react';

interface TrainerSidebarLeftProps {
  opening: Opening | null;
  variation: Variation | null;
  moveHistory: string[];
  progressPercent: number;
}

export function TrainerSidebarLeft({ opening, variation, moveHistory, progressPercent }: TrainerSidebarLeftProps) {
  if (!opening || !variation) return null;

  return (
    <aside className="w-72 border-r border-[#1a1b1e] flex flex-col bg-[#0c0c0d]">
      
      {/* Header Section */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#135bec] bg-[#135bec]/10 px-2 py-0.5 rounded">
            {variation.defaultSide === 'white' ? 'White Repertoire' : 'Black Repertoire'}
          </span>
          <div className="flex items-center gap-1 text-amber-500">
            <span className="text-[10px] font-bold uppercase tracking-widest">Developing</span>
          </div>
        </div>
        
        <h2 className="text-xl font-extrabold text-zinc-100">{opening.name}</h2>
        <p className="text-zinc-500 text-sm mb-4">{variation.name} • Intermediate</p>
        
        <button className="w-full bg-white/[0.03] hover:bg-white/[0.08] text-sm font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 border border-white/5 text-zinc-300">
          <Shuffle size={16} />
          Train vs Sidelines
        </button>
      </div>

      {/* Progress Module */}
      <div className="p-5 bg-white/[0.02]">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-medium text-zinc-500">Main Line Progress</span>
          <span className="text-sm font-bold text-zinc-100">
            {moveHistory.length} / {variation.moveCount} <span className="text-zinc-500 font-normal text-xs">moves</span>
          </span>
        </div>
        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-[#135bec] transition-all duration-500 relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse hidden" />
          </div>
        </div>
      </div>

      {/* Variation Tree */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 px-2">Variation Tree</div>
        
        {/* Render History (Mock logic for Phase 1 - just showing history as completed) */}
        {moveHistory.map((m, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 group">
            <CheckCircle className="text-emerald-500" size={16} />
            <div className="flex-1">
              <p className="text-xs font-bold text-zinc-200">{Math.floor(i/2) + 1}. {i % 2 === 0 ? m : `... ${m}`}</p>
              <p className="text-[10px] text-emerald-600/80">Completed</p>
            </div>
          </div>
        ))}

        {/* Active Node Indicator */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-[#135bec]/10 border border-[#135bec] ring-1 ring-[#135bec]/50 group">
          <div className="size-4 rounded-full border-2 border-[#135bec] flex items-center justify-center">
            <div className="size-1.5 bg-[#135bec] rounded-full" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-[#135bec]">{Math.floor(moveHistory.length/2) + 1}. {moveHistory.length % 2 === 0 ? 'White' : 'Black'} to move</p>
            <p className="text-[10px] text-[#135bec]">Active Training</p>
          </div>
        </div>

        {/* Pending Node Context (Optional/Mock for now) */}
        <div className="flex items-center gap-3 p-2 rounded-lg opacity-40">
          <Circle className="text-zinc-600" size={14} />
          <div className="flex-1">
            <p className="text-xs font-medium italic text-zinc-500">Awaiting move...</p>
          </div>
        </div>

      </div>
    </aside>
  );
}
