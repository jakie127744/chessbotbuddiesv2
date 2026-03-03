'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, AlertTriangle, BrainCircuit, RefreshCw, ListEnd, LogOut, Share2, ArrowLeft, Download, ArrowRightLeft } from 'lucide-react';
import { SharePreviewCard } from './SharePreviewCard';
import { DynamicMascot } from '../DynamicMascot';

interface SessionCompletionModalProps {
  isOpen: boolean;
  openingName: string;
  variationName: string;
  side: string;
  difficulty: string;
  accuracy: number;
  mistakes: number;
  masteryLevel: string;
  correctMoves?: number;
  totalMoves?: number;
  hintsUsed?: number;
  linesCompleted?: number;
  totalLines?: number;
  recallAccuracy?: number | null;
  attemptNumber?: number;
  onContinueGame: () => void;
  onRetry: () => void;
  onTrainDifferent: () => void;
  onEndSession: () => void;
  onFlipBoard?: () => void;
  onReviewMistakes: () => void;
}

export function SessionCompletionModal({
  isOpen,
  openingName,
  variationName,
  side,
  difficulty,
  accuracy,
  mistakes,
  masteryLevel,
  correctMoves = 0,
  totalMoves = 0,
  hintsUsed = 0,
  linesCompleted = 0,
  totalLines = 1,
  recallAccuracy = null,
  attemptNumber = 1,
  onContinueGame,
  onRetry,
  onTrainDifferent,
  onEndSession,
  onFlipBoard,
  onReviewMistakes
}: SessionCompletionModalProps) {
  const [showSharePreview, setShowSharePreview] = React.useState(false);
  const [showReviewPrompt, setShowReviewPrompt] = React.useState(false);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [shareScale, setShareScale] = React.useState(0.55);

  // Compute proper scale factor for the 1200x630 share card to fit the viewport
  React.useEffect(() => {
    if (!showSharePreview) return;
    const updateScale = () => {
      const maxW = window.innerWidth - 80;
      const maxH = window.innerHeight - 260;
      setShareScale(Math.min(maxW / 900, maxH / 630, 1));
    };
    updateScale();
    const raf = requestAnimationFrame(updateScale);
    window.addEventListener('resize', updateScale);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updateScale);
    };
  }, [showSharePreview]);

  if (!isOpen) return null;

  const masteryMap: Record<string, string> = {
    'New': 'NEW',
    'Developing': 'DEV',
    'Proficient': 'PRO',
    'Mastered': 'MAST'
  };

  const masteryLabel = masteryMap[masteryLevel] || 'DEV';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-500" />
      
      <AnimatePresence mode="wait">
        {showSharePreview ? (
          <motion.div 
            key="share-view"
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
            className="relative z-[101] flex flex-col items-center gap-8 w-full max-w-4xl"
          >
            {/* Properly scaled share card — no overflow clipping */}
            <div className="flex justify-center w-full">
              <div
                className="relative shadow-2xl rounded-2xl overflow-hidden"
                style={{
                  width: Math.round(900 * shareScale),
                  height: Math.round(630 * shareScale),
                }}
              >
                <div
                  style={{
                    width: 900,
                    height: 630,
                    transform: `scale(${shareScale})`,
                    transformOrigin: 'top left',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                >
                  <SharePreviewCard 
                    openingName={openingName}
                    variationName={variationName}
                    accuracy={accuracy}
                    correctMoves={correctMoves}
                    totalMoves={totalMoves}
                    hintsUsed={hintsUsed}
                    linesCompleted={linesCompleted}
                    totalLines={totalLines}
                    recallAccuracy={recallAccuracy}
                    attemptNumber={attemptNumber}
                    masteryLevel={masteryLevel}
                    masteryLabel={masteryLabel}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => setShowSharePreview(false)}
                className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-2xl transition-all border border-white/10 flex items-center gap-3 shadow-xl backdrop-blur-md"
              >
                <ArrowLeft size={20} />
                Back to Summary
              </button>
              <button 
                className="bg-jungle-green-600 hover:bg-jungle-green-500 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-2xl shadow-jungle-green-700/30 uppercase tracking-widest flex items-center gap-3"
                onClick={() => {
                  onContinueGame();
                }}
              >
                <Download size={20} />
                Confirm & Download
              </button>
              <button 
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-2xl shadow-emerald-500/30 uppercase tracking-widest flex items-center gap-3"
                onClick={() => {
                  const shareUrl = encodeURIComponent(`https://chessbotbuddies.org/share?opening=${encodeURIComponent(openingName)}&variation=${encodeURIComponent(variationName)}`);
                  const quote = encodeURIComponent(`I just mastered ${openingName} – ${variationName} on ChessBotBuddies!`);
                  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${quote}`;
                  if (typeof window !== 'undefined') {
                    window.open(fbUrl, '_blank', 'noreferrer,width=700,height=700');
                  }
                }}
              >
                <Share2 size={20} />
                Post to Feed
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="summary-view"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="relative bg-[#1e293b] w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col z-[101]"
          >
            {/* Header - Brand Color with Pattern */}
            <header className="bg-gradient-to-br from-jungle-green-600 to-[#0a0e1a] p-8 text-center relative overflow-hidden shrink-0 border-b border-white/10">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid-summary" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-summary)" />
                </svg>
              </div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex items-center gap-4 mb-6">
                    <div className="px-3 py-1 bg-white/10 rounded-xl flex items-center justify-center font-black text-xl border border-white/20 backdrop-blur-md text-white">
                        B
                    </div>
                    <span className="text-2xl font-black tracking-tighter italic text-white">
                      chessbotbuddies<span className="text-jungle-green-300">.org</span>
                    </span>
                </div>

                {/* Mascot in Modal Header */}
                <div className="relative mb-4">
                    <div className="absolute inset-0 bg-jungle-green-400/20 blur-2xl rounded-full" />
                    <DynamicMascot 
                        size={128}
                        mood="happy"
                        className="relative z-10 drop-shadow-2xl"
                    />
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white mb-2 uppercase italic drop-shadow-md">Variation Mastered!</h1>
                <p className="text-white/60 text-sm font-medium">Great progress, Coach Jakie is impressed.</p>
              </div>
            </header>

            {/* Content Area */}
            <div className="p-6 md:p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
              
              {/* Info Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/30 pb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{openingName} – {variationName}</h2>
                  <p className="text-slate-400 text-xs mt-1 font-semibold uppercase tracking-wider">
                    Side: <span className="text-[#135bec]">{side}</span> • Difficulty: <span className="text-slate-300">{difficulty}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-full text-[10px] font-black text-cyan-400 border border-cyan-500/30 tracking-widest uppercase">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Position Recall Mode
                </div>
              </div>

              {/* Mastery Progress Ring */}
              <section className="flex flex-col items-center justify-center py-6 bg-slate-800/20 rounded-2xl border border-slate-700/20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-[#135bec]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex items-center justify-center">
                  <svg className="w-32 h-32 -rotate-90">
                    <circle className="text-slate-700/50" cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="8" />
                    <motion.circle 
                      initial={{ strokeDashoffset: 364 }}
                      animate={{ strokeDashoffset: 364 - (364 * accuracy / 100) }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                      className="text-jungle-green-500" cx="64" cy="64" r="58" fill="transparent" 
                      stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray="364"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Score</span>
                    <span className="text-3xl font-black text-white">{accuracy}%</span>
                  </div>
                </div>
                
                <div className="mt-4 text-center relative z-10">
                  <h3 className="text-lg font-bold text-cyan-400">Status: {masteryLevel}</h3>
                  <p className="text-slate-500 text-xs font-medium">Next milestone: Proficient (5 more clean sessions)</p>
                </div>
              </section>

              {/* Metrics Grid */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30 flex flex-col items-center text-center">
                  <span className="text-slate-500 text-[10px] font-black uppercase mb-2 tracking-widest">Correct Moves</span>
                  <div className="text-2xl font-black text-white">{correctMoves}<span className="text-lg text-slate-500">/{totalMoves}</span></div>
                  <div className="w-full bg-slate-900 h-1.5 mt-2 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${accuracy}%` }}
                      className="bg-emerald-500 h-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                    />
                  </div>
                </div>

                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30 flex flex-col items-center text-center">
                  <span className="text-slate-500 text-[10px] font-black uppercase mb-2 tracking-widest">Hints Used</span>
                  <div className="text-2xl font-black text-white">{hintsUsed}</div>
                  <div className="w-full bg-slate-900 h-1.5 mt-2 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${totalMoves > 0 ? Math.min(100, Math.round((hintsUsed / totalMoves) * 100)) : 0}%` }}
                      className="bg-amber-500 h-full shadow-[0_0_10px_rgba(245,158,11,0.3)]" 
                    />
                  </div>
                </div>

                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30 flex flex-col items-center text-center">
                  <span className="text-slate-500 text-[10px] font-black uppercase mb-2 tracking-widest">Lines Completed</span>
                  <div className="text-2xl font-black text-white">{linesCompleted}<span className="text-lg text-slate-500">/{totalLines}</span></div>
                  <div className="w-full bg-slate-900 h-1.5 mt-2 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((linesCompleted / totalLines) * 100)}%` }}
                      className="bg-[#135bec] h-full shadow-[0_0_10px_rgba(19,91,236,0.3)]" 
                    />
                  </div>
                </div>

                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30 flex flex-col items-center text-center">
                  <span className="text-slate-500 text-[10px] font-black uppercase mb-2 tracking-widest">Recall Accuracy</span>
                  {recallAccuracy !== null ? (
                    <>
                      <div className="text-2xl font-black text-white">{recallAccuracy}%</div>
                      <div className="w-full bg-slate-900 h-1.5 mt-2 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${recallAccuracy}%` }}
                          className="bg-purple-500 h-full shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
                        />
                      </div>
                      <span className="text-slate-600 text-[9px] mt-1">Attempt #{attemptNumber}</span>
                    </>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-slate-500 italic">1st attempt</div>
                      <p className="text-slate-600 text-[9px] mt-1">Available after 2nd try</p>
                    </>
                  )}
                </div>
              </section>
            </div>

            {/* Footer Actions */}
            <footer className="p-6 bg-slate-900/40 border-t border-slate-700/50 shrink-0">
              <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <button 
                  onClick={() => {
                    if (isFlipped && onFlipBoard) onFlipBoard();
                    onContinueGame();
                  }}
                  className="bg-[#135bec] hover:bg-[#135bec]/90 text-white font-black py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 text-xs uppercase tracking-widest"
                >
                  Continue
                </button>
                
                <button 
                  onClick={() => setShowSharePreview(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-2 border border-white/5"
                >
                  <Share2 size={16} />
                  Share
                </button>

                <button 
                  onClick={onRetry}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-xl transition-all text-xs border border-white/5"
                >
                  Retry
                </button>

                <button 
                  onClick={onTrainDifferent}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-xl transition-all text-xs border border-white/5"
                >
                  Different
                </button>

                <button 
                  onClick={() => {
                    if (mistakes > 0) {
                      setShowReviewPrompt(true);
                    } else {
                      onEndSession();
                    }
                  }}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-black py-3 px-4 rounded-xl transition-all border border-rose-500/20 text-xs uppercase tracking-widest lg:col-span-1 col-span-2"
                >
                  End Session
                </button>
              </div>

              {/* Flip Board Toggle */}
              <div className="flex items-center justify-center gap-3 py-2 border-t border-white/5 mt-2">
                <button 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    isFlipped 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                      : 'bg-white/5 text-slate-500 border border-white/5 hover:border-white/10'
                  }`}
                >
                  <ArrowRightLeft size={14} className={isFlipped ? 'rotate-180 transition-transform duration-500' : ''} />
                  Flip Board on Continue: {isFlipped ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
              
              <div className="mt-6 text-center">
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
                  Coach Adaptive • Engine: Stockfish 16.1 • Depth: 24
                </p>
              </div>
            </footer>
          </motion.div>
        )}

        {showReviewPrompt && (
          <motion.div 
            key="review-prompt"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <div className="relative bg-slate-900 border border-white/10 p-8 rounded-[2rem] max-w-md w-full text-center shadow-3xl">
              <div className="size-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/30">
                 <AlertTriangle size={40} className="text-rose-500" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 uppercase">Review Mistakes?</h2>
              <p className="text-slate-400 mb-8 border-b border-white/5 pb-8">
                You made <span className="text-rose-500 font-bold">{mistakes}</span> {mistakes === 1 ? 'mistake' : 'mistakes'} during this session. Would you like to review them before leaving?
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={onReviewMistakes}
                  className="bg-[#135bec] hover:bg-[#135bec]/90 text-white font-black py-4 px-6 rounded-2xl transition-all text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20"
                >
                  Yes, Review
                </button>
                <button 
                  onClick={onEndSession}
                  className="bg-white/5 hover:bg-white/10 text-slate-400 font-bold py-4 px-6 rounded-2xl transition-all text-xs border border-white/5"
                >
                  No, Exit
                </button>
              </div>
              
              <button 
                onClick={() => setShowReviewPrompt(false)}
                className="mt-6 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors"
                >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
