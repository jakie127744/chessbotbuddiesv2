'use client';

import React from 'react';
import { CheckCircle, TrendingUp, Clock } from 'lucide-react';

interface SharePreviewCardProps {
  openingName: string;
  variationName: string;
  accuracy: number;
  correctMoves: number;
  totalMoves: number;
  hintsUsed: number;
  linesCompleted: number;
  totalLines: number;
  recallAccuracy?: number | null;
  attemptNumber?: number;
  masteryLevel: string;
  masteryLabel: string;
}

export function SharePreviewCard({
  openingName,
  variationName,
  accuracy,
  correctMoves,
  totalMoves,
  hintsUsed,
  linesCompleted,
  totalLines,
  recallAccuracy = null,
  attemptNumber = 1,
  masteryLevel,
  masteryLabel
}: SharePreviewCardProps) {
  return (
    <div className="w-[900px] h-[630px] relative overflow-hidden bg-slate-900 font-sans text-white shrink-0">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#0f2060] to-[#135bec]" />
      
      {/* Chess Board Overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ 
        backgroundImage: 'linear-gradient(45deg, #fff 25%, transparent 25%), linear-gradient(-45deg, #fff 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #fff 75%), linear-gradient(-45deg, transparent 75%, #fff 75%)',
        backgroundSize: '50px 50px',
        backgroundPosition: '0 0, 0 25px, 25px -25px, -25px 0px'
      }} />

      {/* Glow Blobs */}
      <div className="absolute -top-32 -left-32 w-[350px] h-[350px] rounded-full bg-[#135bec]/30 blur-[60px]" />
      <div className="absolute -bottom-32 -right-32 w-[350px] h-[350px] rounded-full bg-cyan-500/20 blur-[60px]" />

      <div className="relative z-10 h-full flex flex-col p-10 pb-8">
        {/* Header Section */}
        <header className="flex justify-between items-start mb-auto">
          <div className="flex gap-5 items-start">
            {/* Mascot */}
            <div className="relative shrink-0">
               <div className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full" />
               <img 
                src="/mascot.png" 
                alt="Buddy mascot" 
                className="w-24 h-24 relative z-10 drop-shadow-[0_10px_30px_rgba(19,91,236,0.3)]"
               />
            </div>
            
            <div className="pt-1">
              <div className="flex items-center gap-2.5 mb-3">
                 <div className="px-2.5 py-0.5 bg-[#135bec] text-white font-black text-lg rounded-lg border border-white/20">B</div>
                 <span className="text-2xl font-black italic tracking-tighter">chessbotbuddies<span className="text-cyan-400">.org</span></span>
              </div>
              <span className="inline-block px-3 py-0.5 bg-cyan-400/20 text-cyan-400 font-black tracking-[0.15em] text-xs rounded-full mb-2 uppercase">
                Variation Mastered!
              </span>
              <h1 className="text-4xl font-black tracking-tight mb-0.5 italic drop-shadow-lg leading-tight">
                {openingName}
              </h1>
              <h2 className="text-lg text-slate-300 font-medium">
                {openingName} - {variationName}
              </h2>
            </div>
          </div>

          {/* Mastery Badge */}
          <div className="flex flex-col items-center shrink-0 mr-2">
            <div className="w-24 h-28 bg-gradient-to-br from-[#135bec] to-[#22d3ee] shadow-2xl mb-2 flex items-center justify-center" style={{ 
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' 
            }}>
              <div className="text-center">
                <span className="block text-[9px] font-black uppercase tracking-tighter opacity-80 mb-0.5">Level</span>
                <span className="block text-2xl font-black">{masteryLabel}</span>
              </div>
            </div>
            <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">Mastery: <span className="text-cyan-400">{masteryLabel}</span></p>
          </div>
        </header>

        {/* Main Stats */}
        <main className="grid grid-cols-4 gap-3 my-5">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 py-4 px-3 rounded-xl flex flex-col items-center text-center shadow-xl">
            <div className="mb-1.5 text-cyan-400">
              <CheckCircle size={20} />
            </div>
            <div className="text-3xl font-black mb-0.5">{accuracy}%</div>
            <div className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">Accuracy ({correctMoves}/{totalMoves})</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 py-4 px-3 rounded-xl flex flex-col items-center text-center shadow-xl">
            <div className="mb-1.5 text-cyan-400">
              <TrendingUp size={20} />
            </div>
            <div className="text-3xl font-black mb-0.5">{hintsUsed}</div>
            <div className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">Hints Used</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 py-4 px-3 rounded-xl flex flex-col items-center text-center shadow-xl">
            <div className="mb-1.5 text-cyan-400">
              <Clock size={20} />
            </div>
            <div className="text-3xl font-black mb-0.5">{linesCompleted}<span className="text-xl text-slate-400">/{totalLines}</span></div>
            <div className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">Lines Done</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 py-4 px-3 rounded-xl flex flex-col items-center text-center shadow-xl">
            <div className="mb-1.5 text-purple-400">
              <CheckCircle size={20} />
            </div>
            {recallAccuracy !== null ? (
              <>
                <div className="text-3xl font-black mb-0.5">{recallAccuracy}%</div>
                <div className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">Recall (#{attemptNumber})</div>
              </>
            ) : (
              <>
                <div className="text-xl font-bold text-slate-500 mb-0.5">--</div>
                <div className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">Recall (1st try)</div>
              </>
            )}
          </div>
        </main>

        {/* Footer Branding & Coach */}
        <footer className="flex justify-between items-end pt-4 border-t border-white/10">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#135bec] to-[#0a0e1a] rounded-xl flex items-center justify-center font-black text-xl shadow-xl ring-2 ring-white/10 border border-white/5">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">B</span>
            </div>
            <span className="text-2xl font-black tracking-tighter italic">
              chessbotbuddies<span className="text-cyan-400">.org</span>
            </span>
          </div>

          {/* Coach Avatar & Quote */}
          <div className="flex items-center gap-5">
            <div className="relative">
              {/* Speech Bubble */}
              <div className="absolute -top-11 right-0 bg-[#135bec] text-white px-4 py-1.5 rounded-xl text-sm font-black shadow-xl shadow-blue-500/20 whitespace-nowrap border border-white/10">
                You&apos;re becoming a beast!
                <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[#135bec] transform rotate-45 border-r border-b border-white/10" />
              </div>
              <div className="text-right mr-3">
                <p className="text-sm font-black leading-tight uppercase tracking-widest text-cyan-400">Coach Jakie</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em]">Training Assistant</p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/avatars/bot-adaptive.png" 
                alt="Coach Jakie" 
                className="w-16 h-16 rounded-full border-3 border-[#135bec] object-cover bg-slate-800 shadow-xl shadow-blue-500/20"
              />
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-cyan-400 rounded-full border-3 border-slate-900 shadow-lg" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
