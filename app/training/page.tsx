'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Target, Book, LayoutGrid, Trophy, Puzzle } from 'lucide-react';
import { Chess } from 'chess.js';
import { PuzzleTrainer } from '@/redesign/components/PuzzleTrainer';
import EndgameTrainer from '@/components/EndgameTrainer';
import { TutorialPractice } from '@/components/TutorialPractice';
import { LessonPath } from '@/components/LessonPath';
import { LessonPlayer } from '@/components/LessonPlayer';
import { LessonNode } from '@/lib/lesson-data';
import { useRewards } from '@/contexts/RewardsContext';

// Redesigned Opening Trainer
import { useOpeningTrainerRedesign } from '@/redesign/hooks/useOpeningTrainerRedesign';
import { TrainerSidebarLeft } from '@/redesign/components/OpeningTrainer/TrainerSidebarLeft';
import { TrainerBoardArea } from '@/redesign/components/OpeningTrainer/TrainerBoardArea';
import { TrainerCoachPanel } from '@/redesign/components/OpeningTrainer/TrainerCoachPanel';
import { SessionCompletionModal } from '@/redesign/components/OpeningTrainer/SessionCompletionModal';
import { COMPILED_OPENINGS } from '@/redesign/lib/opening-data-provider';

type TrainingTab = 'puzzles' | 'openings' | 'endgames' | 'minigames';
const VALID_TABS: TrainingTab[] = ['puzzles', 'openings', 'endgames', 'minigames'];

function TrainingHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TrainingTab | null;
  const [activeTab, setActiveTab] = useState<TrainingTab>(
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'puzzles'
  );
  const [activeMinigame, setActiveMinigame] = useState<LessonNode | null>(null);

  // Redesigned Opening Trainer hook
  const openingTrainer = useOpeningTrainerRedesign();
    // Google AdSense integration
    useEffect(() => {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9907028021598445';
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }, []);

  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const tabs = [
    { id: 'puzzles', label: 'Tactics & Puzzles', icon: Puzzle },
    { id: 'openings', label: 'Opening Lab', icon: Book },
    { id: 'endgames', label: 'Endgame Mastery', icon: Target },
    { id: 'minigames', label: 'Minigames', icon: Trophy },
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Header / Tabs — single inline row */}
      <div className="px-2 lg:px-8 pt-4 lg:pt-5 pb-0 shrink-0">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 w-full border-b border-white/10 pb-2">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[11px] lg:text-sm shrink-0">
            <button
              onClick={() => router.push('/home')}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
      {/* Tower AdSense Ad */}
      <div style={{ margin: '16px 0' }}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-9907028021598445"
          data-ad-slot="3044307523"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>
      <script dangerouslySetInnerHTML={{
        __html: '(adsbygoogle = window.adsbygoogle || []).push({});'
      }} />
            </button>
            <span className="text-slate-600">/</span>
            <button
              onClick={() => router.push('/training-dashboard')}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors font-medium"
            >
              Training Dashboard
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-jungle-green-400 font-bold">Training Center</span>
          </div>

          {/* Divider */}
          <span className="text-slate-700 hidden lg:inline">|</span>

          {/* Tab buttons */}
          <div className="flex flex-wrap items-center gap-1 lg:gap-2 flex-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TrainingTab)}
                  className={`flex items-center gap-1 lg:gap-2 px-3 lg:px-5 py-1.5 lg:py-2 text-[11px] lg:text-sm font-bold transition-all relative rounded-md lg:rounded-xl
                    ${isActive
                      ? 'bg-jungle-green-400 text-[#0b0f1a] shadow-[0_8px_20px_rgba(0,255,183,0.18)]'
                      : 'text-slate-400 hover:text-white'}
                  `}
                >
                  <tab.icon size={14} className="lg:size-[16px]" />
                  <span className="text-[11px] lg:text-sm leading-none">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area - Full Width/Height */}
      <div className="flex-1 relative overflow-hidden px-0">
        
        {/* Render Active Trainer */}
        {activeTab === 'puzzles' && (
             <div className="h-full w-full">
               <PuzzleTrainer />
             </div>
        )}
        
        {activeTab === 'openings' && (
            <div className="h-full w-full">
                <RedesignedOpeningTab ot={openingTrainer} onEndSession={() => setActiveTab('puzzles')} />
            </div>
        )}

        {activeTab === 'endgames' && (
            <div className="h-full w-full">
                <EndgameTrainer />
            </div>
        )}

        {activeTab === 'minigames' && (
            <div className="h-full w-full">
              {activeMinigame ? (
                <LessonPlayer
                  lesson={activeMinigame}
                  onComplete={() => setActiveMinigame(null)}
                  onClose={() => setActiveMinigame(null)}
                />
              ) : (
                <LessonPath
                  onSelectLesson={setActiveMinigame}
                  onClose={() => setActiveTab('puzzles')}
                  filter="minigames"
                />
              )}
            </div>
        )}

      </div>
    </div>
  );
}

/* ── Opening Session History (localStorage) ── */
const OPENING_HISTORY_KEY = 'chess_opening_session_history';

interface OpeningSessionRecord {
  variationId: string;
  timestamp: number;
  correctMoves: number;
  totalMoves: number;
  accuracy: number;
}

function loadOpeningHistory(): OpeningSessionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(OPENING_HISTORY_KEY) || '[]');
  } catch { return []; }
}

function saveOpeningSession(record: OpeningSessionRecord) {
  const history = loadOpeningHistory();
  history.push(record);
  // Keep last 500 sessions max
  if (history.length > 500) history.splice(0, history.length - 500);
  localStorage.setItem(OPENING_HISTORY_KEY, JSON.stringify(history));
}

/** Recall accuracy = average accuracy across 2nd+ attempts of the same variation */
function getRecallAccuracy(variationId: string): number | null {
  const history = loadOpeningHistory().filter(r => r.variationId === variationId);
  // Only count sessions after the first attempt (2nd time onwards = recall)
  if (history.length < 2) return null; // No recall data yet (first attempt)
  const recallSessions = history.slice(1); // skip first-ever attempt
  const avg = recallSessions.reduce((sum, r) => sum + r.accuracy, 0) / recallSessions.length;
  return Math.round(avg);
}

function getAttemptCount(variationId: string): number {
  return loadOpeningHistory().filter(r => r.variationId === variationId).length;
}

/* ── Redesigned Opening Trainer (embedded) ── */
function RedesignedOpeningTab({ ot, onEndSession }: { ot: ReturnType<typeof useOpeningTrainerRedesign>; onEndSession: () => void }) {
  const { addXp, addActivity } = useRewards();
  const xpAwardedRef = useRef(false);
  const {
    state, selectedOpening, selectedVariation, selectedSide, game,
    moveHistory, correctMoves, mistakes, currentStreak, progressPercent,
    accuracy, difficulty, hintsUsed, handleUserMove, requestHint, selectOpening, selectSide,
    selectVariation, resetSession, currentExplanation, dynamicFeedback,
    hintArrows, showHint, lastMoveStatus, undoLastMove, retryFromStart,
    toggleTrainingMode, deviationMode, continueToFreePlay, boardOrientation,
    flipBoard, startMistakeReview, mistakePositions, reviewMistakeIndex
  } = ot;

  // Compute mastery level from accuracy
  const masteryLevel = accuracy >= 95 ? 'Mastered' : accuracy >= 80 ? 'Proficient' : accuracy >= 50 ? 'Developing' : 'New';
  // Real metrics from the session
  const totalMoves = correctMoves + mistakes;
  // Lines trained: count of variations attempted in this opening (currently just 1)
  const linesCompleted = selectedVariation ? 1 : 0;
  const totalLines = selectedOpening?.variations.filter(v => v.defaultSide === selectedSide).length || 1;

  // Recall accuracy from previous sessions of the same variation
  const recallAccuracy = selectedVariation ? getRecallAccuracy(selectedVariation.id) : null;
  const attemptNumber = selectedVariation ? getAttemptCount(selectedVariation.id) + 1 : 1; // +1 for current

  // Award XP and log activity when results screen appears
  useEffect(() => {
    if (state === 'STATE_RESULTS' && !xpAwardedRef.current && selectedVariation && selectedOpening) {
      xpAwardedRef.current = true;

      // XP: base 30 + accuracy bonus (0-20) = 30-50 XP per session
      const xpEarned = 30 + Math.round((accuracy / 100) * 20);
      addXp(xpEarned);

      // Log activity
      addActivity({
        type: 'lesson',
        itemId: `opening-${selectedVariation.id}`,
        result: accuracy >= 80 ? 'completed' : 'attempted',
        details: `${selectedOpening.name} - ${selectedVariation.name} (${accuracy}% accuracy, ${xpEarned} XP)`
      });

      // Save session history for recall tracking
      saveOpeningSession({
        variationId: selectedVariation.id,
        timestamp: Date.now(),
        correctMoves,
        totalMoves,
        accuracy,
      });
    }
  }, [state, accuracy, correctMoves, totalMoves, selectedVariation, selectedOpening, addXp, addActivity]);

  // Reset XP flag when going back to selection
  useEffect(() => {
    if (state === 'STATE_OPENING_SELECTION' || state === 'STATE_TRAINING') {
      xpAwardedRef.current = false;
    }
  }, [state]);

  if (state === 'STATE_LOADING') {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-zinc-400">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="size-8 rounded-full border-2 border-jungle-green-400 border-t-transparent animate-spin" />
          <p className="text-sm font-medium">Initializing Opening Engine...</p>
        </div>
      </div>
    );
  }

  if (state === 'STATE_OPENING_SELECTION') {
    return (
      <div className="flex flex-col items-center justify-start h-full w-full p-8 text-white overflow-y-auto">
        <h1 className="text-3xl font-black mb-2 text-jungle-green-400">Select Opening</h1>
        <p className="text-zinc-500 mb-8">Choose from our curated repertoire database below.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
          {COMPILED_OPENINGS && Object.values(COMPILED_OPENINGS).map((opening) => (
            <button
              key={opening.id}
              onClick={() => selectOpening(opening.id)}
              className="bg-[var(--surface)] border border-[var(--border)] hover:border-jungle-green-400/60 p-6 rounded-2xl flex flex-col items-start transition-all text-left group hover:-translate-y-1 shadow-md"
            >
              <h2 className="text-xl font-bold text-white group-hover:text-jungle-green-300 transition-colors">{opening.name}</h2>
              {(opening as any).customDescription && (
                <p className="text-zinc-400 text-sm mt-3 line-clamp-3 leading-relaxed">{(opening as any).customDescription}</p>
              )}
              {!(opening as any).customDescription && opening.description && (
                <p className="text-zinc-400 text-sm mt-3 line-clamp-3 leading-relaxed">{opening.description}</p>
              )}
              <div className="mt-6 flex items-center justify-between w-full">
                <span className="text-xs font-bold px-2 py-1 bg-white/5 rounded-md text-zinc-300">
                  {opening.variations.length} {opening.variations.length === 1 ? 'Variation' : 'Variations'}
                </span>
                {opening.ecoCode && opening.ecoCode !== '??' && (
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{opening.ecoCode}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (state === 'STATE_SIDE_SELECTION') {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full text-white">
        <h1 className="text-3xl font-black mb-8 text-jungle-green-400">Select Side</h1>
        <div className="flex gap-4">
          <button onClick={() => selectSide('white')} className="bg-white text-black font-bold py-3 px-8 rounded-xl">White</button>
          <button onClick={() => selectSide('black')} className="bg-[var(--surface)] text-white font-bold py-3 px-8 rounded-xl border border-[var(--border)]">Black</button>
        </div>
      </div>
    );
  }

  if (state === 'STATE_VARIATION_SELECTION') {
    const availableVariations = selectedOpening?.variations.filter(v => v.defaultSide === selectedSide) || [];
    return (
      <div className="flex flex-col items-center justify-start h-full w-full p-8 text-white overflow-y-auto">
        <h1 className="text-3xl font-black mb-8 text-jungle-green-400">Select Variation</h1>
        {availableVariations.length === 0 ? (
          <p className="text-zinc-500">No {selectedSide} variations found for this opening.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
            {availableVariations.map(variation => (
              <button
                key={variation.id}
                onClick={() => selectVariation(variation.id)}
                className="bg-[var(--surface)] border border-[var(--border)] hover:border-jungle-green-400/60 p-6 rounded-2xl flex flex-col items-start transition-all text-left shadow-md group"
              >
                <h2 className="text-xl font-bold text-white group-hover:text-jungle-green-300 transition-colors">{variation.name}</h2>
                <p className="text-zinc-500 text-sm mt-2">{variation.moveCount} moves</p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const isTrainingOrResults = state === 'STATE_TRAINING' || state === 'STATE_RESULTS' || state === 'STATE_FREE_PLAY' || state === 'STATE_REVIEW_MISTAKES';

  if (isTrainingOrResults && selectedVariation && selectedOpening) {
    return (
      <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden text-zinc-100">
        <div className="order-1 lg:order-2 flex-1 min-w-0">
          <TrainerBoardArea
            game={game || new Chess()}
            orientation={boardOrientation}
            onUserMove={handleUserMove}
            onRequestHint={requestHint}
            onUndoMove={undoLastMove}
            onRestart={retryFromStart}
            onSwitchMode={toggleTrainingMode}
            onEndSession={onEndSession}
            feedbackState={showHint ? 'hint' : (lastMoveStatus === 'incorrect' ? 'incorrect' : (lastMoveStatus === 'correct' ? 'correct' : 'idle'))}
            feedbackMessage={showHint ? 'This is the expected move sequence.' : (lastMoveStatus === 'incorrect' ? 'Incorrect move. See coach notes.' : (lastMoveStatus === 'correct' ? 'Correct!' : ''))}
            lastMoveStatus={lastMoveStatus}
            isDeviating={deviationMode}
            hintArrows={hintArrows}
            isFreePlay={state === 'STATE_FREE_PLAY'}
            userColor={selectedSide === 'black' ? 'b' : 'w'}
          />
        </div>

        <div className="order-2 lg:order-1 w-full lg:w-auto">
          <TrainerSidebarLeft
            opening={selectedOpening}
            variation={selectedVariation}
            moveHistory={moveHistory}
            progressPercent={progressPercent}
          />
        </div>

        <div className="order-3 lg:order-3 w-full lg:w-auto">
          <TrainerCoachPanel
            accuracy={accuracy}
            mistakes={mistakes}
            currentStreak={currentStreak}
            moveHistory={moveHistory}
            deviationTrainingActive={false}
            currentExplanation={dynamicFeedback || currentExplanation}
            lastMoveStatus={lastMoveStatus}
          />
        </div>
        <SessionCompletionModal
          isOpen={state === 'STATE_RESULTS'}
          openingName={selectedOpening.name}
          variationName={selectedVariation.name}
          side={selectedVariation.defaultSide}
          difficulty={difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          accuracy={accuracy}
          mistakes={mistakes}
          masteryLevel={masteryLevel}
          correctMoves={correctMoves}
          totalMoves={totalMoves}
          hintsUsed={hintsUsed}
          linesCompleted={linesCompleted}
          totalLines={totalLines}
          recallAccuracy={recallAccuracy}
          attemptNumber={attemptNumber}
          onContinueGame={continueToFreePlay}
          onRetry={resetSession}
          onTrainDifferent={resetSession}
          onEndSession={onEndSession}
          onFlipBoard={flipBoard}
          onReviewMistakes={startMistakeReview}
        />
      </div>
    );
  }

  return null;
}

export default function TrainingPage() {
  return (
    <Suspense fallback={<div className="p-6 text-jungle-green-200">Loading training center…</div>}>
      <TrainingHubContent />
    </Suspense>
  );
}
