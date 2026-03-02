"use client";

import {
  AnalyzedMove,
  CLASSIFICATION_COLORS,
  CLASSIFICATION_ICONS,
  MoveClassification,
} from "@/lib/analysis-utils";
import React from 'react';

export const QUALITY_STATS: { type: MoveClassification; label: string }[] = [
  { type: 'Brilliant', label: 'Brilliant' },
  { type: 'Great', label: 'Great' },
  { type: 'Best', label: 'Best' },
  { type: 'Excellent', label: 'Excellent' },
  { type: 'Good', label: 'Good' },
  { type: 'Book', label: 'Book' },
  { type: 'Inaccuracy', label: 'Inaccuracy' },
  { type: 'Mistake', label: 'Mistake' },
  { type: 'Missed Win', label: 'Missed Win' },
  { type: 'Missed Draw', label: 'Missed Draw' },
  { type: 'Equalizer', label: 'Equalizer' },
  { type: 'Blunder', label: 'Blunder' },
];

export function NavButton({ icon: Icon, onClick, className, active }: { icon: any, onClick: () => void, className?: string, active?: boolean }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center justify-center p-2 rounded hover:bg-[#363431] hover:text-[#c3c3c3] transition-colors ${active ? 'bg-[#363431] text-[#c3c3c3]' : ''}`}
        >
            <Icon size={18} className={className} />
        </button>
    );
}

export const QualityStat = ({ type, label, analyzedMoves }: { type: MoveClassification, label: string, analyzedMoves: AnalyzedMove[] }) => {
    const whiteCount = analyzedMoves.filter(m => m.classification === type && m.color === 'w').length;
    const blackCount = analyzedMoves.filter(m => m.classification === type && m.color === 'b').length;
    
    return (
      <button 
         className="flex items-center justify-between px-3 py-2 bg-[#2b2926] rounded-lg hover:bg-[#363431] transition-colors group w-full"
         title={`Show ${label} moves`}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: CLASSIFICATION_COLORS[type] }}
          >
            {CLASSIFICATION_ICONS[type]}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8d8d8d] group-hover:text-[#c3c3c3]">
            {label}
          </span>
        </div>
        <div className="flex gap-3 text-xs font-bold font-mono">
          <span className={whiteCount > 0 ? 'text-white' : 'text-[#444]'}>{whiteCount}</span>
          <span className="text-[#333]">|</span>
          <span className={blackCount > 0 ? 'text-white' : 'text-[#444]'}>{blackCount}</span>
        </div>
      </button>
    );
};

export const MoveRow = ({ pair, currentMoveIndex, onNavigate }: { pair: { num: number, white: AnalyzedMove, black?: AnalyzedMove }, currentMoveIndex: number, onNavigate: (i: number) => void }) => (
    <div className={`grid grid-cols-[3rem_1fr_1fr] text-sm group ${
         (currentMoveIndex === (pair.num - 1) * 2) || (currentMoveIndex === (pair.num - 1) * 2 + 1)
         ? 'bg-[#363431]' 
         : 'hover:bg-[#363431]/50 odd:bg-[#2b2926] even:bg-[#262421]'
    }`}>
        <div className="flex items-center justify-center text-[#8d8d8d] font-mono border-r border-[#3a3a3a] py-2">
            {pair.num}.
        </div>
        
        <button 
            onClick={() => onNavigate((pair.num - 1) * 2)}
            className={`flex items-center gap-2 px-3 py-2 transition-colors overflow-hidden ${
                currentMoveIndex === (pair.num - 1) * 2 ? 'bg-[#48423d] text-white font-bold' : 'text-[#c3c3c3]'
            }`}
        >
           {pair.white.classification && pair.white.classification !== 'Book' && pair.white.classification !== 'Best' && CLASSIFICATION_COLORS[pair.white.classification] && (
               <span className="shrink-0" style={{ color: CLASSIFICATION_COLORS[pair.white.classification] }}>
                  {CLASSIFICATION_ICONS[pair.white.classification]}
               </span>
           )}
           <span className="truncate">{pair.white.san}</span>
        </button>

        {pair.black ? (
            <button
                onClick={() => onNavigate((pair.num - 1) * 2 + 1)}
                className={`flex items-center gap-2 px-3 py-2 transition-colors overflow-hidden ${
                    currentMoveIndex === (pair.num - 1) * 2 + 1 ? 'bg-[#48423d] text-white font-bold' : 'text-[#c3c3c3]'
                }`}
            >
               {pair.black.classification && pair.black.classification !== 'Book' && pair.black.classification !== 'Best' && CLASSIFICATION_COLORS[pair.black.classification] && (
                   <span className="shrink-0" style={{ color: CLASSIFICATION_COLORS[pair.black.classification] }}>
                      {CLASSIFICATION_ICONS[pair.black.classification]}
                   </span>
               )}
               <span className="truncate">{pair.black.san}</span>
            </button>
        ) : <div />}
    </div>
);
