"use client";

import { AnalyzedMove, CLASSIFICATION_COLORS, CLASSIFICATION_ICONS, MoveClassification } from "@/lib/analysis-utils";
import { Zap, ChevronRight, ChevronLeft, FastForward, RotateCcw, Activity, List, Settings, Share2, Microscope, Home, Save, MessageSquare } from "lucide-react";
import { EvaluationGraph } from "@/components/Review/EvaluationGraph";
import { useState } from "react";
import { Chess } from 'chess.js';
import { NavButton, QualityStat, MoveRow, QUALITY_STATS } from "@/components/Review/AnalysisComponents";
import { RewardedAdModal } from "@/components/ads/RewardedAdModal";
import { ReviewLimitManager } from "@/lib/review-limit";
import { getMoveCommentData } from "@/lib/review-commentary";
import { useBotVoice } from "@/hooks/useBotVoice";
import { useEffect, useMemo } from "react";

interface AnalysisPanelProps {
  analyzedMoves: AnalyzedMove[];
  whiteAccuracy: number;
  blackAccuracy: number;
  isAnalyzing: boolean;
  progress?: number;
  currentMoveIndex: number;
  currentFen: string;
  onNavigate: (index: number) => void;
  onLoadGame?: (pgn: string, meta: any) => void;
  onFlipBoard?: () => void;
  onToggleSettings?: () => void;
  onShare?: () => void;
  onHome?: () => void;
  onStartReview?: () => void;
  reviewsRemaining?: number;
  whiteName?: string;
  blackName?: string;
  whiteAvatar?: string;
  blackAvatar?: string;
  engineLines?: any[]; 
  currentDepth?: number;
  orientation?: 'white' | 'black';
  isCloudAnalysisEnabled?: boolean;
  onToggleCloudAnalysis?: () => void;
  showArrows?: boolean;
  onToggleArrows?: () => void;
  openingName?: string;
  game?: Chess;
  onSaveGame?: () => void;
  onRewardClaimed?: (newRemaining: number) => void;
  platform?: 'lichess' | 'chesscom' | 'local';
}

export function AnalysisPanel({
  analyzedMoves,
  whiteAccuracy,
  blackAccuracy,
  isAnalyzing,
  progress = 0,
  currentMoveIndex,
  currentFen,
  onNavigate,
  onToggleSettings,
  onShare,
  onHome,
  onStartReview,
  reviewsRemaining,
  whiteName = "White",
  blackName = "Black",
  whiteAvatar,
  blackAvatar,
  orientation = 'white',
  openingName,
  onFlipBoard,
  engineLines = [],
  currentDepth,
  isCloudAnalysisEnabled = false,
  onToggleCloudAnalysis,
  showArrows = true,
  onToggleArrows,
  onSaveGame,
  onRewardClaimed,
  platform
}: AnalysisPanelProps) {
  
  const [activeTab, setActiveTab] = useState<'report' | 'analysis'>('report');
  const [showAdModal, setShowAdModal] = useState(false);
  const [localReviewsBonus, setLocalReviewsBonus] = useState(0);

  // Coach Mode State
  const [isCoachModeEnabled, setIsCoachModeEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chess_coach_mode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chess_coach_mode', String(isCoachModeEnabled));
    }
  }, [isCoachModeEnabled]);

  const { speak, stop, isMuted, setIsMuted, hasSupport } = useBotVoice();

  const moveCommentData = useMemo(() => {
    if (isAnalyzing) {
      return { header: "Analyzing", body: "Thinking about the position...", classification: 'Book' };
    }
    
    if (currentMoveIndex >= 0 && currentMoveIndex < analyzedMoves.length) {
      const currentMove = analyzedMoves[currentMoveIndex];
      return getMoveCommentData(
        currentMove.classification,
        undefined,
        currentMove.stableEval?.cp,
        undefined,
        undefined,
        currentMove.san,
        currentMoveIndex + 1,
        [],
        currentFen,
        [],
        undefined,
        undefined,
        currentMove.tactics,
        openingName,
        [],
        "local-game"
      );
    }

    if (analyzedMoves.length > 0) {
      return { header: "Game Summary", body: `Game reviewed. Accuracy: White ${Math.round(whiteAccuracy)}%, Black ${Math.round(blackAccuracy)}%.`, classification: 'Book' };
    }

    return { 
      header: "Ready", 
      body: "Start Game Review to get Coach Jakie's insights!",
      classification: 'Book'
    };
  }, [isAnalyzing, currentMoveIndex, analyzedMoves, currentFen, openingName, whiteAccuracy, blackAccuracy]);

  useEffect(() => {
    if (isCoachModeEnabled && !isMuted && !isAnalyzing && moveCommentData.body) {
       const timer = setTimeout(() => {
           speak(moveCommentData.body, 'bot-adaptive');
       }, 500);
       return () => clearTimeout(timer);
    } else {
       stop();
    }
  }, [moveCommentData.body, isCoachModeEnabled, isMuted, isAnalyzing, currentMoveIndex, speak, stop]);

  // Effective reviews remaining (prop + local bonus)
  const effectiveReviewsRemaining = (reviewsRemaining ?? 0) + localReviewsBonus;
  
  const movePairs: Array<{num: number; white: AnalyzedMove; black?: AnalyzedMove}> = [];
  for (let i = 0; i < analyzedMoves.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: analyzedMoves[i],
      black: analyzedMoves[i + 1],
    });
  }

  const handleNextKeyMove = () => {
    const keyTypes = ['Mistake', 'Blunder', 'Brilliant', 'Great', 'Missed Win'];
    const nextIndex = analyzedMoves.findIndex((m, i) => i > currentMoveIndex && keyTypes.includes(m.classification));
    if (nextIndex !== -1) {
      onNavigate(nextIndex);
    } else {
      onNavigate(analyzedMoves.length - 1);
    }
  };

  const handleRewardGranted = () => {
    // Persist to localStorage via ReviewLimitManager
    const newRemaining = ReviewLimitManager.addReward();
    
    // Only use local bonus if parent doesn't handle state update
    if (onRewardClaimed) {
      onRewardClaimed(newRemaining);
    } else {
      setLocalReviewsBonus(prev => prev + 3);
    }
    
    setShowAdModal(false);
  };

  const renderHeader = () => (
    <div className="p-4 border-b border-[#3a3a3a] bg-[#211f1c] shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-black italic tracking-tighter leading-none">
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              GAME REVIEW {platform && platform !== 'local' && (
                <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded italic font-black uppercase tracking-widest ${
                  platform === 'lichess' ? 'bg-[#5ec2f2]/20 text-[#5ec2f2]' : 'bg-[#69e0a3]/20 text-[#69e0a3]'
                }`}>
                  {platform === 'lichess' ? '♞ Lichess' : '♟ Chess.com'}
                </span>
              )}
            </span>
          </h2>
          {openingName && (
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] mt-1 drop-shadow-sm" title={openingName}>
              ⭐ <span className="truncate max-w-[180px]">{openingName}</span> ⭐
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {onHome && (
            <button onClick={onHome} className="p-2 hover:bg-[#363431] rounded-lg text-[#8d8d8d] hover:text-white transition-colors" title="Home">
              <Home size={16} />
            </button>
          )}
          {onFlipBoard && (
            <button onClick={onFlipBoard} className="p-2 hover:bg-[#363431] rounded-lg text-[#8d8d8d] hover:text-white transition-colors" title="Flip Board">
              <RotateCcw size={16} />
            </button>
          )}
          {onShare && (
            <button onClick={onShare} className="p-2 hover:bg-[#363431] rounded-lg text-[#8d8d8d] hover:text-white transition-colors">
              <Share2 size={16} />
            </button>
          )}
          <button 
            onClick={() => setIsCoachModeEnabled(!isCoachModeEnabled)} 
            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${isCoachModeEnabled ? 'bg-blue-600 text-white' : 'hover:bg-[#363431] text-[#8d8d8d] hover:text-white'}`} 
            title="Toggle Coach Mode Audio"
          >
            <MessageSquare size={16} />
          </button>
          {onToggleSettings && (
            <button onClick={onToggleSettings} className="p-2 hover:bg-[#363431] rounded-lg text-[#8d8d8d] hover:text-white transition-colors">
              <Settings size={16} />
            </button>
          )}
          {onSaveGame && (
            <button onClick={onSaveGame} className="p-2 hover:bg-[#363431] rounded-lg text-[#8d8d8d] hover:text-white transition-colors" title="Save to Library">
              <Save size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-1 p-1 bg-[#1a1917] rounded-lg">
        <button 
          onClick={() => setActiveTab('report')}
          className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md flex items-center justify-center gap-2 transition-all ${activeTab === 'report' ? 'bg-[#363431] text-white shadow-sm' : 'text-[#666] hover:text-[#999]'}`}
        >
          <Activity size={14} /> Report
        </button>
        <button 
          onClick={() => setActiveTab('analysis')}
          className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md flex items-center justify-center gap-2 transition-all ${activeTab === 'analysis' ? 'bg-[#363431] text-white shadow-sm' : 'text-[#666] hover:text-[#999]'}`}
        >
          <List size={14} /> Move List
        </button>
      </div>
    </div>
  );

  const renderControls = () => (
    <div className="bg-[#1f1d1b] p-3 border-b lg:border-t lg:border-b-0 border-[#3a3a3a] shrink-0 z-20 order-2 lg:order-3">
      {analyzedMoves.length === 0 && !isAnalyzing && onStartReview ? (
        <>
          {effectiveReviewsRemaining > 0 ? (
            <button 
              onClick={onStartReview}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Zap size={18} className="fill-white" />
              Start Game Review
              <span className="bg-black/20 px-2 py-0.5 rounded text-xs ml-1 opacity-80">
                {effectiveReviewsRemaining} left
              </span>
            </button>
          ) : (
            <button 
              onClick={() => setShowAdModal(true)}
              className="w-full py-3 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 border-b-4 border-amber-800 active:border-b-0 active:translate-y-1"
            >
              <Zap size={18} className="fill-white" />
              Watch Ad for +3 Reviews
            </button>
          )}
        </>
      ) : (
        <div className="grid grid-cols-5 gap-1 text-[#666]">
          <NavButton icon={FastForward} className="rotate-180" onClick={() => onNavigate(-1)} />
          <NavButton icon={ChevronLeft} onClick={() => onNavigate(currentMoveIndex - 1)} />
          <button 
            onClick={handleNextKeyMove}
            className="flex items-center justify-center p-2 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            <Zap size={18} className="fill-white" />
          </button>
          <NavButton icon={ChevronRight} onClick={() => onNavigate(currentMoveIndex + 1)} />
          <NavButton icon={FastForward} onClick={() => onNavigate(analyzedMoves.length - 1)} />
        </div>
      )}
    </div>
  );

  const renderReportTab = () => (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
      
      {/* 1. Coach Area */}
      <div className="flex items-start gap-3 relative">
          <div className="w-14 h-14 shrink-0 rounded-full border-2 border-white/10 shadow-lg overflow-hidden bg-neutral-800 z-10">
            <img src="/avatars/bot-adaptive.png" alt="Coach Jakie" className="w-full h-full object-cover scale-110" />
          </div>
          
          <div className="flex-1 bg-white text-gray-900 rounded-2xl rounded-tl-none p-3 shadow-md relative min-h-[56px] flex flex-col justify-center">
            {/* Speech Bubble Tail */}
            <div 
              className="absolute top-0 -left-2 w-4 h-4 bg-white" 
              style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} 
            />
            
            <p className="text-[13px] font-bold leading-snug">
              {moveCommentData.body}
            </p>
          </div>

          <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`absolute -right-2 -top-2 w-7 h-7 flex items-center justify-center rounded-full transition-all z-20 shadow-sm ${!isMuted ? 'bg-white/90 text-lime-600 ring-2 ring-lime-50' : 'bg-black/20 text-white hover:bg-black/30'}`}
              title={!isMuted ? "Mute Coach" : "Enable Voice Commentary"}
            >
              <span className="text-[10px]">{!isMuted ? '🔊' : '🔇'}</span>
          </button>
        </div>

      {/* 2. Evaluation Graph */}
      <div className="h-20 bg-[#211f1c] border border-white/5 shadow-inner rounded overflow-hidden relative">
        <EvaluationGraph 
          analyzedMoves={analyzedMoves}
          currentMoveIndex={currentMoveIndex}
          onNavigate={onNavigate}
          orientation={orientation}
        />
      </div>

      {/* 3. Player Matchup & Accuracy */}
      <div className="px-6 flex justify-between items-end">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-bold text-white w-20 truncate text-center" title={whiteName}>{whiteName}</span>
          <div className="w-14 h-14 rounded-lg bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-500/50 overflow-hidden flex items-center justify-center relative">
             {whiteAvatar ? <img src={whiteAvatar} className="w-full h-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-white opacity-20" />}
             <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-black/50"></div>
          </div>
          <div className="bg-white text-black px-4 py-1.5 rounded text-sm font-black tracking-tight w-16 text-center shadow-lg">
            {isAnalyzing && progress < 100 ? '...' : (Math.round(whiteAccuracy * 10) / 10).toFixed(1)}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-bold text-white w-20 truncate text-center" title={blackName}>{blackName}</span>
          <div className="w-14 h-14 rounded-lg bg-[#333] shadow-md border border-white/5 overflow-hidden flex items-center justify-center">
             {blackAvatar ? <img src={blackAvatar} className="w-full h-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-white opacity-20" />}
          </div>
          <div className="bg-[#333] text-white/90 px-4 py-1.5 rounded text-sm font-black tracking-tight w-16 text-center shadow-inner border border-black/20">
            {isAnalyzing && progress < 100 ? '...' : (Math.round(blackAccuracy * 10) / 10).toFixed(1)}
          </div>
        </div>
      </div>

      {/* 4. Move Classifications */}
      {analyzedMoves.length > 0 ? (
        <div className="border-t border-white/5 pt-4">
          <div className="flex flex-col gap-1">
            {QUALITY_STATS.map(item => (
              <QualityStat key={item.type} type={item.type} label={item.label} analyzedMoves={analyzedMoves} />
            ))}
          </div>


        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-[#363431] rounded-full flex items-center justify-center mb-2">
            <Zap size={24} className="text-[#8d8d8d]" />
          </div>
          <div className="space-y-1">
            <p className="text-white font-bold text-sm">Review Game</p>
            <p className="text-[11px] text-[#8d8d8d]">Run deep engine analysis</p>
          </div>
          {onStartReview && (
            <button 
              onClick={effectiveReviewsRemaining > 0 ? onStartReview : () => setShowAdModal(true)}
              className={`px-6 py-2.5 font-bold rounded-lg shadow-lg active:scale-95 flex items-center gap-2 text-sm ${
                effectiveReviewsRemaining > 0 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              <Zap size={16} />
              {effectiveReviewsRemaining > 0 ? 'Start Review' : 'Watch Ad for Review'}
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderEngineLine = (line: any, i: number) => {
    const evalColor = line.evaluation > 0 ? 'bg-green-500/20 text-green-400' : line.evaluation < 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-zinc-400';
    const evalDisplay = typeof line.evaluation === 'number' ? (line.evaluation / 100).toFixed(2) : line.evaluation;
    return (
      <div key={i} className="text-xs font-mono bg-[#2b2926] rounded p-1.5 flex items-center gap-2 border border-[#3a3a3a]/50">
        <span className={`font-bold px-1.5 rounded ${evalColor}`}>
          {line.evaluation > 0 ? '+' : ''}{evalDisplay}
        </span>
        <span className="text-zinc-400 truncate flex-1">{line.pv}</span>
      </div>
    );
  };

  const renderAnalysisTab = () => (
    <div className="flex-1 flex flex-col h-full">
      <div className="bg-[#1f1d1b] border-b border-[#3a3a3a] p-2 shrink-0">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-[#666] uppercase tracking-wider">Stockfish 16</span>
          <div className="flex gap-2">
            {onToggleCloudAnalysis && (
              <button 
                onClick={onToggleCloudAnalysis}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${isCloudAnalysisEnabled ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-[#2b2926] text-[#666] hover:text-[#999] border border-[#3a3a3a]'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isCloudAnalysisEnabled ? 'bg-blue-500 animate-pulse' : 'bg-[#666]'}`} />
                Analysis: {isCloudAnalysisEnabled ? 'ON' : 'OFF'}
              </button>
            )}
            {onToggleArrows && (
              <button 
                onClick={onToggleArrows}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${showArrows ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-[#2b2926] text-[#666] hover:text-[#999] border border-[#3a3a3a]'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${showArrows ? 'bg-green-500' : 'bg-[#666]'}`} />
                Arrows: {showArrows ? 'ON' : 'OFF'}
              </button>
            )}
            {onToggleSettings && (
              <button onClick={onToggleSettings} className="p-1.5 rounded hover:bg-[#363431] text-[#666] hover:text-[#c3c3c3] transition-colors" title="Engine Settings">
                <Settings size={14} />
              </button>
            )}
          </div>
        </div>
        {(isCloudAnalysisEnabled || (engineLines && engineLines.length > 0)) ? (
          <div className="space-y-1">
            <div className="text-[10px] text-[#555] font-mono mb-1">Depth: {currentDepth || 0}</div>
            {engineLines.length > 0 ? engineLines.map(renderEngineLine) : (
              <div className="text-xs text-[#444] italic p-1 text-center animate-pulse">Calculating...</div>
            )}
          </div>
        ) : (
          <div className="text-[10px] text-[#444] italic p-2 text-center bg-[#2b2926]/50 rounded border border-[#3a3a3a]/30">
            Assessment paused.
          </div>
        )}
      </div>
      <div className="grid grid-cols-[3rem_1fr_1fr] text-[10px] font-bold text-[#666] uppercase tracking-wider bg-[#211f1c] px-1 py-2 border-b border-[#3a3a3a] shrink-0">
        <div className="text-center">#</div>
        <div className="pl-4">White</div>
        <div className="pl-4">Black</div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {movePairs.map((pair) => (
          <MoveRow key={pair.num} pair={pair} currentMoveIndex={currentMoveIndex} onNavigate={onNavigate} />
        ))}
        {isAnalyzing && analyzedMoves.length === 0 && (
          <div className="p-8 text-center text-[#666] text-sm animate-pulse">Initializing Analysis...</div>
        )}
        <div className="h-4" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#262421] border-l border-[#3a3a3a] text-zinc-100 font-sans">
      {renderHeader()}
      {renderControls()}
      <div className="flex-1 overflow-hidden flex flex-col order-3 lg:order-2 min-h-0">
        {activeTab === 'report' && renderReportTab()}
        {activeTab === 'analysis' && renderAnalysisTab()}
      </div>

      {/* Rewarded Ad Modal */}
      <RewardedAdModal 
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onRewardGranted={handleRewardGranted}
      />
    </div>
  );
}
