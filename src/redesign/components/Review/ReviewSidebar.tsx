'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Zap, List, Volume2, VolumeX, RefreshCw,
  Upload, Settings2,
} from 'lucide-react';
import {
  AnalyzedMove,
  MoveClassification,
  CLASSIFICATION_COLORS,
  CLASSIFICATION_ICONS,
  getMoveCommentData,
  getGameSummary,
  formatFigurine,
  type MoveCommentData,
} from '@/lib/analysis-utils';
import { motion, AnimatePresence } from 'framer-motion';
import { EvaluationGraph } from './EvaluationGraph';

// ─── Props ───────────────────────────────────────────────────────────────────

interface ReviewSidebarProps {
  analyzedMoves: AnalyzedMove[];
  whiteAccuracy: number;
  blackAccuracy: number;
  isAnalyzing: boolean;
  progress: number;
  currentMoveIndex: number;
  currentFen: string;
  onNavigate: (index: number) => void;
  onStartReview: () => void;
  reviewsRemaining: number;
  openingName?: string;
  whiteName: string;
  blackName: string;
  whiteAvatar?: string;
  blackAvatar?: string;
  orientation: 'white' | 'black';
  onFlipBoard: () => void;
  onHome: () => void;
  onShare: () => void;
  onToggleSettings: () => void;
  onSaveGame: () => void;
  onImportPgn: (pgn: string) => void;
  isCloudAnalysisEnabled: boolean;
  onToggleCloudAnalysis: () => void;
  showArrows: boolean;
  onToggleArrows: () => void;
  engineLines: any[];
  currentDepth?: number;
  /** Optional game result for summary commentary, e.g. "1-0" */
  gameResult?: string;
  /** Stable game id used to seed commentary randomisation */
  gameId?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ReviewSidebar({
  analyzedMoves,
  whiteAccuracy,
  blackAccuracy,
  isAnalyzing,
  progress,
  currentMoveIndex,
  currentFen,
  onNavigate,
  onStartReview,
  reviewsRemaining,
  openingName,
  whiteName,
  blackName,
  orientation,
  onFlipBoard,
  onHome,
  onShare,
  onToggleSettings,
  onSaveGame,
  onImportPgn,
  isCloudAnalysisEnabled,
  onToggleCloudAnalysis,
  showArrows,
  onToggleArrows,
  engineLines,
  currentDepth,
  gameResult,
  gameId,
}: ReviewSidebarProps) {
  const [activeTab, setActiveTab] = useState<'report' | 'moves'>('report');
  const [isMuted, setIsMuted] = useState(false);

  const hasGame = analyzedMoves.length > 0;
  const currentMove = currentMoveIndex !== -1 ? analyzedMoves[currentMoveIndex] : null;
  const isAtEnd = currentMoveIndex === analyzedMoves.length - 1 && hasGame;
  const isAtStart = currentMoveIndex === -1;

  // ── Commentary ──────────────────────────────────────────────────────────

  const commentData: MoveCommentData = useMemo(() => {
    // 1. If currently analyzing, show analysis status as priority
    if (isAnalyzing) {
      const movesDone = analyzedMoves.length;
      return {
        header: 'Analyzing',
        body: movesDone > 0
          ? `I'm deeply analyzing move ${movesDone + 1}. Hang tight, almost there!`
          : 'Thinking about the position…',
        classification: 'Book',
      };
    }

    // 2. Game summary when at the very end after analysis
    if (isAtEnd && hasGame && !isAnalyzing) {
      return getGameSummary(analyzedMoves, whiteAccuracy, blackAccuracy, gameResult);
    }

    // 3. Current move details if navigated
    if (currentMove) {
      return getMoveCommentData(currentMove, gameId);
    }

    // 4. Start state
    if (isAtStart) {
      return {
        header: 'Ready',
        body: hasGame
          ? 'Analysis complete! Click report or navigate through the moves to see my thoughts.'
          : 'Import a PGN game and click Start Analysis to begin!',
        classification: 'Book',
      };
    }

    // 5. Fallback for unanalyzed moves or middle-states
    return {
      header: 'Pending',
      body: 'Still thinking about this specific move…',
      classification: 'Book',
    };
  }, [isAtEnd, hasGame, isAnalyzing, analyzedMoves, whiteAccuracy, blackAccuracy, gameResult, currentMove, gameId, isAtStart]);

  // ── Move pairs for Move List ────────────────────────────────────────────

  const movePairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < analyzedMoves.length; i += 2) {
      pairs.push({
        num: Math.floor(i / 2) + 1,
        white: analyzedMoves[i],
        black: analyzedMoves[i + 1],
      });
    }
    return pairs;
  }, [analyzedMoves]);

  // ── Quality counts ──────────────────────────────────────────────────────

  const getQualCount = useCallback(
    (type: string, side: 'w' | 'b') =>
      analyzedMoves.filter(m => m.classification === type && m.color === side).length,
    [analyzedMoves],
  );

  // ── Next Key Move ───────────────────────────────────────────────────────

  const goToNextKeyMove = useCallback(() => {
    const keyTypes = ['Blunder', 'Mistake', 'Inaccuracy', 'Brilliant', 'Great', 'Missed Win'];
    const startIndex = currentMoveIndex + 1;
    const next = analyzedMoves.findIndex((m, i) => i >= startIndex && keyTypes.includes(m.classification));
    if (next !== -1) {
      onNavigate(next);
    } else {
      // Wrap around
      const first = analyzedMoves.findIndex(m => keyTypes.includes(m.classification));
      if (first !== -1) onNavigate(first);
    }
  }, [analyzedMoves, currentMoveIndex, onNavigate]);

  // ── Render ──────────────────────────────────────────────────────────────

  const classColor = CLASSIFICATION_COLORS[commentData.classification as MoveClassification] || 'var(--text-secondary)';
  const classIcon = CLASSIFICATION_ICONS[commentData.classification as MoveClassification] || '?';

  return (
    <aside className="w-full lg:w-[300px] flex flex-col h-full bg-[var(--surface)] border-l border-[var(--border)] relative overflow-hidden">

      {/* ─ Opening Name Header ─────────────────────────────────────────── */}
      <div className="px-3 py-2 bg-[var(--surface-highlight)]/60 border-b border-[var(--border)] backdrop-blur-sm shrink-0">
        <div className="text-[12px] font-black text-jungle-green-400 tracking-tight truncate uppercase leading-tight">
          {(openingName || 'Starting Position').toUpperCase()}
        </div>
      </div>

      {/* ─ Scrollable Content ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[var(--surface)]">
        <div className="flex flex-col min-h-full">

          {/* ── Coach Commentary (ChessRev speech-bubble) ──────────────── */}
          <div className="p-3 pb-10 relative flex flex-col items-stretch min-h-[170px]">
            {/* Speech Bubble */}
            <div className="relative bg-[var(--surface-highlight)] rounded-2xl p-4 shadow-[0_16px_40px_rgba(0,0,0,0.10)] ml-[64px] mr-2 border border-[var(--border)]">
              {/* Header */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg text-sm font-black transition-transform hover:scale-110"
                    style={{ backgroundColor: classColor }}
                  >
                    {classIcon}
                  </div>
                  <span className="text-[13px] font-bold text-gray-900 leading-tight">
                    {commentData.header}
                  </span>
                </div>
                {commentData.eval && (
                  <div className="bg-[var(--surface)] px-2 py-0.5 rounded text-[11px] font-black text-[var(--text-secondary)] border border-[var(--border)]">
                    {commentData.eval}
                  </div>
                )}
              </div>

              {/* Body */}
              <p className="text-[13px] text-[var(--text-secondary)] leading-snug font-medium mb-2.5 pl-2 border-l-2 border-[var(--border)]/60">
                {commentData.body}
              </p>

              {/* Action buttons (ChessRev-style) */}
              {currentMove && !isAnalyzing && (
                <div className="flex flex-wrap gap-2 mt-auto">
                  {hasGame && (
                    <button
                      onClick={goToNextKeyMove}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface-highlight)] hover:bg-[var(--surface)] text-[var(--text-secondary)] rounded-lg text-[12px] font-bold transition-all border border-[var(--border)]"
                    >
                      <span className="text-sm">⚡</span> Next Key Move
                    </button>
                  )}
                </div>
              )}

              {/* Tail */}
              <div className="absolute -left-[8px] bottom-6 w-4 h-4 bg-[var(--surface-highlight)] transform rotate-45 border-l border-b border-[var(--border)] shadow-[-3px_3px_8px_rgba(0,0,0,0.02)]" />
            </div>

            {/* Coach Avatar */}
            <div className="absolute left-4 bottom-4 w-[68px] h-[68px] z-10">
              <div className="w-full h-full rounded-full border-4 border-[var(--border)] shadow-[0_10px_30px_rgba(0,0,0,0.15)] overflow-hidden bg-[var(--surface-highlight)]">
                <img
                  src="/avatars/bot-adaptive.png"
                  alt="Chess Coach"
                  className="w-full h-full object-cover scale-110 -translate-y-0.5"
                />
              </div>
            </div>

            {/* TTS Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`absolute right-5 top-5 w-8 h-8 flex items-center justify-center rounded-full transition-all z-20 shadow-sm ${
                !isMuted
                  ? 'bg-[var(--surface-highlight)] text-jungle-green-300 ring-3 ring-jungle-green-500/20'
                  : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-highlight)]'
              }`}
              title={!isMuted ? 'Mute Coach' : 'Enable Voice Commentary'}
            >
              {!isMuted ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>

          {/* ── Tabs ───────────────────────────────────────────────────── */}
          <div className="flex px-3 py-1 gap-2 bg-[var(--surface-highlight)]/40 border-b border-[var(--border)]">
            <button
              onClick={() => setActiveTab('report')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-black tracking-widest transition-all ${
                activeTab === 'report'
                  ? 'bg-[var(--surface-highlight)] text-white shadow-inner ring-1 ring-[var(--border)]'
                  : 'text-[var(--text-secondary)]/70 hover:text-white'
              }`}
            >
              <Zap size={14} className={activeTab === 'report' ? 'text-orange-400 fill-orange-400' : ''} />
              REPORT
            </button>
            <button
              onClick={() => setActiveTab('moves')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-black tracking-widest transition-all ${
                activeTab === 'moves'
                  ? 'bg-[var(--surface-highlight)] text-white shadow-inner ring-1 ring-[var(--border)]'
                  : 'text-[var(--text-secondary)]/70 hover:text-white'
              }`}
            >
              <List size={14} />
              MOVE LIST
            </button>
          </div>

          {/* ── Tab Panels ─────────────────────────────────────────────── */}
          <div className="p-3 pt-4 flex-1 text-[var(--text-secondary)]">
            <AnimatePresence mode="wait">
              {activeTab === 'report' && (
                <motion.div
                  key="report"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6"
                >
                  {/* Eval Graph */}
                  {hasGame && (
                    <div className="space-y-2">
                      <div className="h-[120px] bg-[var(--surface-highlight)] rounded-2xl border border-[var(--border)] overflow-hidden relative group">
                        <EvaluationGraph
                          analyzedMoves={analyzedMoves}
                          currentMoveIndex={currentMoveIndex}
                          onNavigate={onNavigate}
                          orientation={orientation}
                        />
                        {isAnalyzing && (
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[9px] font-black text-jungle-green-400 border border-jungle-green-500/30">
                            {progress}%
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Accuracy */}
                  {hasGame && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest opacity-90 px-1">
                        Accuracy
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[var(--surface-highlight)] rounded-xl p-2.5 border border-[var(--border)] flex flex-col items-center justify-center min-h-[58px]">
                          <div className="text-2xl font-black text-white leading-none mb-0.5">
                            {Math.round(whiteAccuracy)}
                            <span className="text-[10px] ml-0.5 opacity-40">%</span>
                          </div>
                          <div className="text-[9px] text-[var(--text-tertiary)] font-black uppercase tracking-tight truncate w-full text-center px-1">
                            {whiteName}
                          </div>
                        </div>
                        <div className="bg-[var(--surface-highlight)] rounded-xl p-2.5 border border-[var(--border)] flex flex-col items-center justify-center min-h-[58px]">
                          <div className="text-2xl font-black text-white leading-none mb-0.5">
                            {Math.round(blackAccuracy)}
                            <span className="text-[10px] ml-0.5 opacity-40">%</span>
                          </div>
                          <div className="text-[9px] text-[var(--text-tertiary)] font-black uppercase tracking-tight truncate w-full text-center px-1">
                            {blackName}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Move Quality Grid (ChessRev QualityBadge style) */}
                  {hasGame && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest opacity-90 px-1">
                        Move Quality
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <QualityBadge label="Brilliant" icon="!!" color="var(--color-jungle-green-500)" white={getQualCount('Brilliant', 'w')} black={getQualCount('Brilliant', 'b')} />
                        <QualityBadge label="Great" icon="!" color="var(--color-jungle-green-400)" white={getQualCount('Great', 'w')} black={getQualCount('Great', 'b')} />
                        <QualityBadge label="Best" icon="★" color="var(--color-jungle-green-300)" white={getQualCount('Best', 'w')} black={getQualCount('Best', 'b')} />
                        <QualityBadge label="Excellent" icon="✓" color="var(--color-jungle-green-400)" white={getQualCount('Excellent', 'w')} black={getQualCount('Excellent', 'b')} />
                        <QualityBadge label="Good" icon="○" color="var(--color-jungle-green-400)" white={getQualCount('Good', 'w')} black={getQualCount('Good', 'b')} />
                        <QualityBadge label="Book" icon="📖" color="var(--color-jungle-green-600)" white={getQualCount('Book', 'w')} black={getQualCount('Book', 'b')} />
                        <QualityBadge label="Inaccuracy" icon="?!" color="var(--color-jungle-green-200)" white={getQualCount('Inaccuracy', 'w')} black={getQualCount('Inaccuracy', 'b')} />
                        <QualityBadge label="Mistake" icon="?" color="var(--color-jungle-green-500)" white={getQualCount('Mistake', 'w')} black={getQualCount('Mistake', 'b')} />
                        <QualityBadge label="Missed Win" icon="🎯" color="var(--color-jungle-green-100)" white={getQualCount('Missed Win', 'w')} black={getQualCount('Missed Win', 'b')} />
                        <QualityBadge label="Blunder" icon="??" color="var(--color-jungle-green-700)" white={getQualCount('Blunder', 'w')} black={getQualCount('Blunder', 'b')} />
                      </div>
                    </div>
                  )}

                  {/* Next Key Move button */}
                  {hasGame && !isAnalyzing && (
                    <button
                      onClick={goToNextKeyMove}
                      className="w-full py-2.5 bg-jungle-green-600 hover:bg-jungle-green-500 text-[#03130c] rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-jungle-green-500/30 active:scale-[0.98] group"
                    >
                      <span className="text-lg group-hover:animate-pulse">⚡</span>
                      <span className="font-bold text-[14px]">Next Key Move</span>
                    </button>
                  )}
                </motion.div>
              )}

              {activeTab === 'moves' && (
                <motion.div
                  key="moves"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col h-full space-y-6"
                >
                  {/* Move List */}
                  <div className="flex flex-col">
                    <div className="grid grid-cols-[3.5rem_1fr_1fr] text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest py-3 border-b border-[var(--border)] sticky top-0 bg-[var(--surface)] z-10">
                      <div className="text-center">#</div>
                      <div className="px-4">White</div>
                      <div className="px-4">Black</div>
                    </div>
                    <div className="space-y-px">
                      {movePairs.map((pair, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-[3.5rem_1fr_1fr] items-stretch text-sm font-bold group"
                        >
                          <div className="text-center text-[var(--text-tertiary)] text-[11px] font-black py-4 border-r border-[var(--border)] bg-[var(--surface-highlight)]/40 group-hover:text-white transition-colors">
                            {pair.num}.
                          </div>
                          <MoveCell
                            move={pair.white}
                            index={idx * 2}
                            isSelected={currentMoveIndex === idx * 2}
                            onClick={() => onNavigate(idx * 2)}
                          />
                          {pair.black ? (
                            <MoveCell
                              move={pair.black}
                              index={idx * 2 + 1}
                              isSelected={currentMoveIndex === idx * 2 + 1}
                              onClick={() => onNavigate(idx * 2 + 1)}
                            />
                          ) : (
                            <div className="p-4 bg-transparent" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Engine Analysis */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
                        Engine Analysis
                      </h4>
                      <span className="text-[10px] text-[var(--text-tertiary)] font-bold">
                        DEPTH {currentDepth || 14}
                      </span>
                    </div>
                    <div className="bg-[var(--surface-highlight)] rounded-2xl p-3 border border-[var(--border)] space-y-1.5">
                      {engineLines.length > 0 ? (
                        engineLines.map((line: any, i: number) => (
                          <div
                            key={i}
                            className="flex gap-3 items-center p-2.5 transition-colors hover:bg-white/[0.04] rounded-xl group cursor-pointer"
                          >
                            <span
                              className={`text-[11px] font-black min-w-[45px] px-2 py-0.5 rounded ${
                                line.evaluation >= 0
                                  ? 'bg-jungle-green-500/10 text-jungle-green-400'
                                  : 'bg-rose-500/10 text-rose-400'
                              }`}
                            >
                              {line.evaluation > 0 ? '+' : ''}
                              {(line.evaluation / 100).toFixed(2)}
                            </span>
                            <p className="text-[11px] font-mono text-zinc-500 leading-none group-hover:text-zinc-200 transition-colors truncate">
                              {line.pv
                                .split(' ')
                                .slice(0, 8)
                                .join(' ')}
                            </p>
                          </div>
                        ))
                      ) : (
                          <p className="text-center text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] py-6 italic">
                          Calculating best lines…
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─ Fixed Footer ────────────────────────────────────────────────── */}
      <div className="bg-[var(--surface)] p-4 pb-6 border-t border-[var(--border)] space-y-4 shrink-0 z-20">
        {/* Action row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <input
              type="file"
              accept=".pgn,.txt"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                onImportPgn(text);
                e.target.value = '';
              }}
            />
            <button
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--surface-highlight)] hover:bg-[var(--surface)] border border-[var(--border)] rounded-xl transition-all group"
            >
              <Upload size={15} className="text-zinc-500 group-hover:text-jungle-green-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white">
                Import PGN
              </span>
            </button>
          </div>
          <button
            onClick={onToggleSettings}
            className="flex items-center justify-center gap-2 py-3.5 bg-[var(--surface-highlight)] hover:bg-[var(--surface)] border border-[var(--border)] rounded-xl transition-all group"
          >
            <Settings2 size={15} className="text-zinc-500 group-hover:text-jungle-green-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white">
              Settings
            </span>
          </button>
        </div>

        <button
          onClick={onSaveGame}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--surface-highlight)] hover:bg-[var(--surface)] border border-[var(--border)] rounded-xl transition-all text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-white"
        >
          Save Game
        </button>

        {/* Primary CTA */}
        <button
          onClick={onStartReview}
          disabled={isAnalyzing}
          className="w-full bg-jungle-green-500 hover:bg-jungle-green-400 disabled:opacity-50 text-[#03130c] py-4 rounded-xl font-black uppercase text-[13px] tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_4px_30px_rgba(0,255,183,0.15)] transition-all active:translate-y-0.5"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              {progress.toFixed(0)}% — Analyzing
            </>
          ) : (
            <>
              <RefreshCw size={17} />
              {hasGame ? 'Reanalyze Game' : 'Start Analysis'}
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** ChessRev-style QualityBadge (icon square + label + W/B counts) */
function QualityBadge({
  label,
  icon,
  color,
  white,
  black,
}: {
  label: string;
  icon: string;
  color: string;
  white: number;
  black: number;
}) {
  const isActive = white > 0 || black > 0;
  return (
    <div
      className={`flex items-center justify-between p-1.5 px-2 rounded-lg bg-white/5 border border-white/5 transition-all ${
        isActive ? 'opacity-100 hover:bg-white/[0.06]' : 'opacity-30'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-black shadow-lg shrink-0"
          style={{ backgroundColor: color, color: '#000' }}
        >
          {icon}
        </div>
        <span className="text-[11px] font-bold text-gray-200 uppercase tracking-tight truncate max-w-[72px]">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 font-black text-[11px] pr-0.5">
        <span className={white > 0 ? 'text-white' : 'text-zinc-700'}>{white}</span>
        <div className="w-[1px] h-2.5 bg-white/10" />
        <span className={black > 0 ? 'text-white' : 'text-zinc-700'}>{black}</span>
      </div>
    </div>
  );
}

/** Move cell inside the move-list grid */
function MoveCell({
  move,
  index,
  isSelected,
  onClick,
}: {
  move: AnalyzedMove;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const classification = move.classification;
  return (
    <div
      onClick={onClick}
      className={`px-4 py-4 flex items-center gap-3 cursor-pointer transition-all border-b border-white/[0.01] ${
        isSelected
          ? 'bg-jungle-green-500/10 text-jungle-green-300'
          : 'hover:bg-white/[0.02] text-zinc-300'
      }`}
    >
      {classification && (
        <div
          className="size-5 rounded-full flex items-center justify-center text-[10px] shadow-sm"
          style={{ backgroundColor: CLASSIFICATION_COLORS[classification] }}
        >
          {CLASSIFICATION_ICONS[classification as keyof typeof CLASSIFICATION_ICONS]}
        </div>
      )}
      <span className="font-bold tracking-tight text-[13px]">{formatFigurine(move.san)}</span>
    </div>
  );
}
