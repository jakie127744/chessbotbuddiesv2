'use client';

import { Chess } from 'chess.js';
import { ChessBoard, BoardArrow } from '@/components/ChessBoard';
import { Lightbulb, RotateCcw, ArrowRightLeft, LogOut, CheckCircle2, AlertCircle, Info, BrainCircuit } from 'lucide-react';
import { useStockfish } from '@/hooks/useStockfish';
import { useAIPlayer } from '@/hooks/useAIPlayer';

interface TrainerBoardAreaProps {
  className?: string;
  game: Chess;
  onUserMove: (move: { from: string; to: string; promotion?: string }) => boolean;
  onRequestHint: () => void;
  onUndoMove: () => void;
  onRestart: () => void;
  onSwitchMode: () => void;
  onEndSession: () => void;
  orientation: 'white' | 'black';
  feedbackState?: 'idle' | 'correct' | 'incorrect' | 'hint';
  lastMoveStatus?: 'correct' | 'incorrect' | 'idle';
  feedbackMessage?: string;
  isDeviating?: boolean;
  hintArrows?: BoardArrow[];
  isFreePlay?: boolean;
  userColor?: 'w' | 'b';
  isReviewingMistakes?: boolean;
  mistakeCount?: number;
  reviewIndex?: number;
}

export function TrainerBoardArea({
  className,
  game,
  onUserMove,
  onRequestHint,
  onUndoMove,
  onRestart,
  onSwitchMode,
  onEndSession,
  orientation,
  feedbackState = 'idle',
  lastMoveStatus = 'idle',
  feedbackMessage = '',
  isDeviating = false,
  hintArrows = [],
  isFreePlay = false,
  userColor = 'w',
  isReviewingMistakes = false,
  mistakeCount = 0,
  reviewIndex = 0
}: TrainerBoardAreaProps) {
  
  // Stockfish Integration (Only active during Free Play)
  const { evaluation, bestMove, depth } = useStockfish(game.fen(), isFreePlay);
  const { isThinking } = useAIPlayer({
    fen: game.fen(),
    bestMove,
    isVsComputer: isFreePlay,
    userColor: userColor,
    onMove: onUserMove,
    aiLevel: 10 // Intermediate
  });

  // Dynamic colors based on feedback status
  const feedbackConfig = {
    idle: { bg: 'bg-white/5', border: 'border-white/10', text: 'text-zinc-400', icon: <Info size={20} className="text-zinc-500" /> },
    correct: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: <CheckCircle2 size={20} className="text-emerald-500" /> },
    incorrect: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', icon: <AlertCircle size={20} className="text-rose-500" /> },
    hint: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: <Lightbulb size={20} className="text-amber-500" /> },
  };

  const currentFeedback = feedbackConfig[feedbackState];

  return (
    <section className={`flex-1 flex flex-col h-full overflow-hidden p-0 gap-0 bg-[color:var(--surface-primary,#0b1213)] min-w-0 ${className || ''}`}>
      
      {/* Context Banner Area - Fixed Height to prevent jump */}
      <div className="h-20 shrink-0">
        {isDeviating && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300 bg-[#135bec]/10 border-l-4 border-[#135bec] p-4 rounded-r-xl flex items-center gap-4">
            <div className="bg-[#135bec]/20 p-2 rounded-lg text-[#135bec]">
              <Info size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#135bec]">Sideline You’ve Faced Before</h3>
              <p className="text-xs text-zinc-400">Your opponent deviated. Let's see if you remember the response.</p>
            </div>
          </div>
        )}

        {isFreePlay && (
           <div className="flex items-center justify-between bg-zinc-900/50 border border-white/5 p-4 rounded-xl animate-in fade-in zoom-in-95 duration-500">
             <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${isThinking ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-white/5 text-zinc-500'}`}>
                  <BrainCircuit className={isThinking ? 'animate-pulse' : ''} size={24} />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-zinc-200">
                     {isThinking ? 'Stockfish is thinking...' : 'Engine Training Active'}
                   </h3>
                   <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                     Depth {depth} • Stockfish 16.1 NNUE
                   </p>
                </div>
             </div>
           </div>
        )}

        {isReviewingMistakes && (
           <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl animate-in fade-in slide-in-from-top-2 duration-500">
             <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                  <BrainCircuit size={24} />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-rose-400">Mistake Review Active</h3>
                   <p className="text-[10px] text-rose-500/70 font-bold uppercase tracking-widest">
                     Revisiting position {reviewIndex + 1} of {mistakeCount}
                   </p>
                </div>
             </div>
             
             <div className="px-3 py-1 bg-rose-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                Reviewing
             </div>
           </div>
        )}
      </div>

      {/* Chessboard Container - Rooted at bottom of available space */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-0 h-full max-h-[58vh] px-0 w-full justify-center">
          {/* Vertical Eval Bar */}
          {isFreePlay && (
            <div className="w-4 h-full bg-zinc-900 rounded-full border border-white/10 relative overflow-hidden flex flex-col-reverse shadow-2xl shrink-0 hidden sm:flex">
               {/* Numerical Eval Overlay */}
               <div className="absolute inset-x-0 bottom-4 text-center z-20">
                  <span className="text-[10px] font-black font-mono text-zinc-400 bg-black/60 px-1 py-0.5 rounded backdrop-blur-sm border border-white/5">
                    {evaluation > 0 ? `+${(evaluation/100).toFixed(1)}` : (evaluation/100).toFixed(1)}
                  </span>
               </div>
               
               {/* White's Advantage (Filling from bottom) */}
               <div 
                  className="w-full bg-white transition-all duration-[1500ms] ease-out shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  style={{ height: `${Math.max(0, Math.min(100, 50 + (evaluation / 10)))}%` }}
               />
            </div>
          )}
          
          {/* Main Board - Constrained to square within vertical height */}
          <div className="h-full w-full max-w-[min(100vw,700px)] aspect-square relative flex items-center justify-center">
            <div className="w-full h-full">
              <ChessBoard 
                game={game}
                onMove={onUserMove}
                orientation={orientation}
                arePiecesDraggable={true}
                arrows={hintArrows}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Area - Reserved space for Feedback + Action Bar */}
      <div className="shrink-0 flex flex-col gap-3">
        {/* Feedback Strip - Reserved Height */}
        <div className="h-[60px]">
          {feedbackState !== 'idle' && (
            <div className={`w-full flex items-center gap-3 h-full ${currentFeedback.bg} border ${currentFeedback.border} px-6 rounded-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}>
              {currentFeedback.icon}
              <p className={`text-sm font-semibold ${currentFeedback.text}`}>
                {feedbackMessage}
              </p>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <button 
            onClick={onRequestHint}
            className="bg-[#0c0c0d] border border-white/10 hover:border-amber-500/50 px-4 py-3 rounded-xl transition-all flex flex-col items-center gap-1 group shadow-lg cursor-pointer"
          >
            <Lightbulb className="text-zinc-500 group-hover:text-amber-500 transition-colors" size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-300 transition-colors">Show Hint</span>
          </button>

          <button 
            onClick={onUndoMove}
            className="bg-[#0c0c0d] border border-white/10 hover:border-[#135bec] px-4 py-3 rounded-xl transition-all flex flex-col items-center gap-1 group shadow-lg cursor-pointer"
          >
            <RotateCcw className="text-zinc-500 group-hover:text-[#135bec] transition-colors" size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-300 transition-colors">Undo Move</span>
          </button>

          <button 
            onClick={onRestart}
            className="bg-[#0c0c0d] border border-white/10 hover:border-emerald-500/50 px-4 py-3 rounded-xl transition-all flex flex-col items-center gap-1 group shadow-lg cursor-pointer"
          >
            <CheckCircle2 className="text-zinc-500 group-hover:text-emerald-500 transition-colors" size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-300 transition-colors">Restart</span>
          </button>

          <button 
            onClick={onSwitchMode}
            className="bg-[#0c0c0d] border border-white/10 hover:border-[#135bec] px-4 py-3 rounded-xl transition-all flex flex-col items-center gap-1 group shadow-lg cursor-pointer"
          >
            <ArrowRightLeft className="text-zinc-500 group-hover:text-[#135bec] transition-colors" size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-300 transition-colors">Switch Mode</span>
          </button>

          <button 
            onClick={onEndSession}
            className="bg-[#0c0c0d] border border-rose-500/20 hover:bg-rose-500/10 px-4 py-3 rounded-xl transition-all flex flex-col items-center gap-1 group shadow-lg cursor-pointer"
          >
            <LogOut className="text-rose-500 opacity-70 group-hover:opacity-100 transition-opacity" size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 opacity-70 group-hover:opacity-100 transition-opacity">Exit</span>
          </button>
        </div>
      </div>
    </section>
  );
}
