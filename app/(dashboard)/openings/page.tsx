'use client';
import { Chess } from 'chess.js';

import { useOpeningTrainerRedesign } from '@/redesign/hooks/useOpeningTrainerRedesign';
import { TrainerSidebarLeft } from '@/redesign/components/OpeningTrainer/TrainerSidebarLeft';
import { TrainerBoardArea } from '@/redesign/components/OpeningTrainer/TrainerBoardArea';
import { TrainerCoachPanel } from '@/redesign/components/OpeningTrainer/TrainerCoachPanel';
import { SessionCompletionModal } from '@/redesign/components/OpeningTrainer/SessionCompletionModal';
import { COMPILED_OPENINGS } from '@/redesign/lib/opening-data-provider';
import { useRouter } from 'next/navigation';

export default function OpeningTrainerRedesignPage() {
  const router = useRouter();
  const {
    state,
    selectedOpening,
    selectedVariation,
    selectedSide,
    game,
    moveHistory,
    correctMoves,
    mistakes,
    currentStreak,
    progressPercent,
    accuracy,
    handleUserMove,
    requestHint,
    selectOpening,
    selectSide,
    selectVariation,
    resetSession,
    currentExplanation,
    dynamicFeedback,
    hintArrows,
    showHint,
    lastMoveStatus,
    undoLastMove,
    retryFromStart,
    toggleTrainingMode,
    deviationMode,
    continueToFreePlay,
    boardOrientation,
    flipBoard,
    startMistakeReview,
    mistakePositions,
    reviewMistakeIndex
  } = useOpeningTrainerRedesign();

  if (state === 'STATE_LOADING') {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-zinc-400">
        <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="size-8 rounded-full border-2 border-[#135bec] border-t-transparent animate-spin" />
            <p className="text-sm font-medium">Initializing Opening Engine...</p>
        </div>
      </div>
    );
  }

  if (state === 'STATE_OPENING_SELECTION') {
    return (
      <div className="flex flex-col items-center justify-start h-full w-full bg-[#0c0c0d] p-8 text-white overflow-y-auto">
        <h1 className="text-3xl font-black mb-2 text-[#135bec]">Select Opening</h1>
        <p className="text-zinc-500 mb-8">Choose from our curated repertoire database below.</p>

        <div className="w-full max-w-7xl mb-6">
          <button
            onClick={() => router.push('/openings/shotgun')}
            className="w-full flex items-center justify-between gap-3 bg-gradient-to-r from-[#7e22ce] to-[#a855f7] hover:brightness-110 transition-all border border-white/10 px-5 py-4 rounded-2xl shadow-lg shadow-purple-500/10"
          >
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">New</p>
              <p className="text-lg font-black text-white">Opening Shotgun</p>
              <p className="text-sm text-white/80">Rapid-fire multiple choice drills for repertoire recall.</p>
            </div>
            <span className="text-sm font-bold text-white/90 px-4 py-2 rounded-xl bg-white/10 border border-white/20">Play</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
          {COMPILED_OPENINGS && Object.values(COMPILED_OPENINGS).map((opening) => (
            <button 
              key={opening.id}
              onClick={() => selectOpening(opening.id)}
              className="bg-[#151a2a] border border-white/5 hover:border-[#135bec]/50 p-6 rounded-2xl flex flex-col items-start transition-all text-left group hover:-translate-y-1 shadow-md"
            >
              <h2 className="text-xl font-bold text-white group-hover:text-[#135bec] transition-colors">{opening.name}</h2>
              {(opening as any).customDescription && (
                  <p className="text-zinc-400 text-sm mt-3 line-clamp-3 leading-relaxed">
                      {(opening as any).customDescription}
                  </p>
              )}
              {/* Fallback to legacy description if custom isn't built yet */}
              {!(opening as any).customDescription && opening.description && (
                  <p className="text-zinc-400 text-sm mt-3 line-clamp-3 leading-relaxed">
                      {opening.description}
                  </p>
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
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#0c0c0d] text-white">
        <h1 className="text-3xl font-black mb-8 text-[#135bec]">Select Side</h1>
        <div className="flex gap-4">
          <button onClick={() => selectSide('white')} className="bg-white text-black font-bold py-3 px-8 rounded-xl">White</button>
          <button onClick={() => selectSide('black')} className="bg-[#1a1b1e] text-white font-bold py-3 px-8 rounded-xl border border-white/10">Black</button>
        </div>
      </div>
    );
  }

  if (state === 'STATE_VARIATION_SELECTION') {
     const availableVariations = selectedOpening?.variations.filter(v => v.defaultSide === selectedSide) || [];

     return (
        <div className="flex flex-col items-center justify-start h-full w-full bg-[#0c0c0d] p-8 text-white overflow-y-auto">
          <h1 className="text-3xl font-black mb-8 text-[#135bec]">Select Variation</h1>
          
          {availableVariations.length === 0 ? (
              <p className="text-zinc-500">No {selectedSide} variations found for this opening.</p>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                {availableVariations.map(variation => (
                  <button 
                    key={variation.id}
                    onClick={() => selectVariation(variation.id)}
                    className="bg-[#151a2a] border border-white/5 hover:border-[#135bec]/50 p-6 rounded-2xl flex flex-col items-start transition-all text-left shadow-md group"
                  >
                    <h2 className="text-xl font-bold text-white group-hover:text-[#135bec] transition-colors">{variation.name}</h2>
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
      <div className="flex h-screen w-full bg-[#0c0c0d] overflow-hidden text-zinc-100">
        
        {/* Left Panel */}
        <TrainerSidebarLeft 
          opening={selectedOpening}
          variation={selectedVariation}
          moveHistory={moveHistory}
          progressPercent={progressPercent}
        />

        {/* Center Panel */}
        <TrainerBoardArea 
          game={game || new Chess()}
          orientation={boardOrientation}
          onUserMove={handleUserMove}
          onRequestHint={requestHint}
          onUndoMove={undoLastMove}
          onRestart={retryFromStart}
          onSwitchMode={toggleTrainingMode}
          onEndSession={() => router.push('/')}
          feedbackState={showHint ? 'hint' : (lastMoveStatus === 'incorrect' ? 'incorrect' : (lastMoveStatus === 'correct' ? 'correct' : 'idle'))}
          feedbackMessage={showHint ? 'This is the expected move sequence.' : (lastMoveStatus === 'incorrect' ? 'Incorrect move. See coach notes.' : (lastMoveStatus === 'correct' ? 'Correct!' : ''))}
          lastMoveStatus={lastMoveStatus}
          isDeviating={deviationMode}
          hintArrows={hintArrows}
          isFreePlay={state === 'STATE_FREE_PLAY'}
          userColor={selectedSide === 'black' ? 'b' : 'w'}
        />

        {/* Right Panel */}
        <TrainerCoachPanel
          accuracy={accuracy}
          mistakes={mistakes}
          currentStreak={currentStreak}
          moveHistory={moveHistory}
          deviationTrainingActive={false} // Phase 2
          currentExplanation={dynamicFeedback || currentExplanation}
          lastMoveStatus={lastMoveStatus}
        />

        {/* Completion Modal overlaying everything via Portal/Fixed positioning */}
        <SessionCompletionModal 
          isOpen={state === 'STATE_RESULTS'}
          openingName={selectedOpening.name}
          variationName={selectedVariation.name}
          side={selectedVariation.defaultSide}
          difficulty="Intermediate"
          accuracy={accuracy}
          mistakes={mistakes}
          masteryLevel="Developing"
          onContinueGame={continueToFreePlay}
          onRetry={resetSession}
          onTrainDifferent={resetSession}
          onEndSession={() => router.push('/')}
          onFlipBoard={flipBoard}
          onReviewMistakes={startMistakeReview}
        />
        
      </div>
    );
  }

  return null;
}
