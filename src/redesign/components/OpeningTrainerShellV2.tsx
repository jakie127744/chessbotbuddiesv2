'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { DEFAULT_REPERTOIRE, getVariationsByOpening } from '../lib/openings-repertoire';
import { 
  VariationPerformance, 
  updatePerformance, 
  initializePerformance,
  getVariationsDueForReview,
  getPerformanceStats
} from '../lib/mastery-manager';
import { RecallNode, RecallSessionStats, calculateRecallAccuracy } from '../lib/recall-mode-logic';
import { DeviationProfile, DeviationRecord, trackDeviation, buildDeviationProfile, suggestPriorityDeviation, getRecommendedIntensity } from '../lib/deviation-engine';
import { saveMasteryData, loadMasteryData, loadConceptDiagnostics, loadRecallHistory } from '../lib/data-persistence';
import OpeningTrainerSidebarV2 from './OpeningTrainerSidebarV2';
import DeviationTracker from './DeviationTracker';
import UserProgressDashboard from './UserProgressDashboard';
import OpeningTrainerBoardAreaV2 from './OpeningTrainerBoardAreaV2';
import OpeningTrainerCoachPanelV2 from './OpeningTrainerCoachPanelV2';
import OpeningTrainerResultsModal from './OpeningTrainerResultsModal';
import RecallModeSetup from './RecallModeSetup';

// Session state machine
type SessionState = 
  | 'IDLE' 
  | 'OPENING_SELECTION' 
  | 'SIDE_SELECTION' 
  | 'VARIATION_SELECTION' 
  | 'MODE_SELECTION' 
  | 'RECALL_SETUP'
  | 'TRAINING' 
  | 'RECALL' 
  | 'FREE_PLAY' 
  | 'RESULTS';

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
type TrainingMode = 'standard' | 'sidelines' | 'recall';

interface SessionState_ {
  state: SessionState;
  opening: string | null;
  side: 'white' | 'black' | null;
  variation: any | null;
  difficulty: DifficultyLevel;
  mode: TrainingMode;
  moveHistory: string[];
  accuracy: number;
  mistakes: number;
  streak: number;
  sessionStats: {
    opening: string;
    variation: string;
    side: string;
    moveCount: number;
    accuracy: number;
    mistakes: number;
  } | null;
}

export default function OpeningTrainerShell() {
  // Session state
  const [state, setState] = useState<SessionState>('IDLE');
  const [opening, setOpening] = useState<string | null>(null);
  const [side, setSide] = useState<'white' | 'black' | null>(null);
  const [variation, setVariation] = useState<any | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [mode, setMode] = useState<TrainingMode>('standard');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [accuracy, setAccuracy] = useState(100);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  
  // Mastery & spaced repetition tracking (load from localStorage on mount)
  const [performances, setPerformances] = useState<Map<string, VariationPerformance>>(() => 
    loadMasteryData()
  );
  const [userStats, setUserStats] = useState(getPerformanceStats(performances));

  // Recall mode specific state
  const [currentRecallNode, setCurrentRecallNode] = useState<RecallNode | null>(null);
  const [recallSessionMoves, setRecallSessionMoves] = useState<Array<{ isCorrect: boolean; responseTime: number }>>([]);
  const [recallStats, setRecallStats] = useState<RecallSessionStats | null>(null);

  // Session concept performance tracking
  const [sessionConceptPerformance, setSessionConceptPerformance] = useState<Map<string, any>>(new Map());

  // Deviation engine state
  const [deviationHistory, setDeviationHistory] = useState<Map<string, Map<string, DeviationRecord>>>(new Map());
  const [deviationProfile, setDeviationProfile] = useState<DeviationProfile | null>(null);
  const [priorityDeviation, setPriorityDeviation] = useState<{ line: string; reason: string } | null>(null);

  // Dashboard state
  const [showDashboard, setShowDashboard] = useState(false);
  const [conceptDiagnostics, setConceptDiagnostics] = useState<any>(null);
  const [recallHistory, setRecallHistory] = useState<any>(null);

  // Save mastery data to localStorage whenever it changes
  useEffect(() => {
    if (performances.size > 0) {
      saveMasteryData(performances);
    }
  }, [performances]);

  // Load concept diagnostics and recall history on mount
  useEffect(() => {
    const concepts = loadConceptDiagnostics();
    const recalls = loadRecallHistory();
    setConceptDiagnostics(concepts);
    setRecallHistory(recalls);
  }, []);

  // Get unique openings from repertoire
  const openings = Array.from(new Set(DEFAULT_REPERTOIRE.map(v => v.opening)));

  // Handle opening selection
  const handleOpeningSelect = (selectedOpening: string) => {
    setOpening(selectedOpening);
    setState('SIDE_SELECTION');
  };

  // Handle side selection
  const handleSideSelect = (selectedSide: 'white' | 'black') => {
    setSide(selectedSide);
    setState('VARIATION_SELECTION');
  };

  // Handle variation selection
  const handleVariationSelect = (selectedVariation: any) => {
    setVariation(selectedVariation);
    
    // Initialize performance tracking if not already done
    if (!performances.has(selectedVariation.id)) {
      const newPerformances = new Map(performances);
      newPerformances.set(selectedVariation.id, initializePerformance(selectedVariation.id));
      setPerformances(newPerformances);
      setUserStats(getPerformanceStats(newPerformances));
    }
    
    setState('MODE_SELECTION');
  };

  // Handle mode selection
  const handleModeSelect = (selectedMode: TrainingMode, selectedDifficulty: DifficultyLevel) => {
    setMode(selectedMode);
    setDifficulty(selectedDifficulty);
    
    // Route based on training mode
    if (selectedMode === 'recall') {
      setState('RECALL_SETUP');
    } else if (selectedMode === 'sidelines') {
      // Build deviation profile for sidelines mode
      const variationDeviations = deviationHistory.get(variation?.id);
      if (variationDeviations && variationDeviations.size > 0) {
        const devProfile = buildDeviationProfile(variationDeviations);
        setDeviationProfile(devProfile);
        const priority = suggestPriorityDeviation(devProfile);
        setPriorityDeviation(priority);
      }
      setState('TRAINING');
    } else {
      setState('TRAINING');
    }
  };

  // Handle recall mode setup
  const handleRecallSetup = (node: RecallNode, difficulty: 'easy' | 'medium' | 'hard') => {
    setCurrentRecallNode(node);
    setRecallSessionMoves([]);
    setDifficulty(difficulty as DifficultyLevel);
    setState('RECALL');
  };

  // Handle recall validation - track move responses
  const handleRecallValidation = (isCorrect: boolean, responseTime: number) => {
    const newMoves = [...recallSessionMoves, { isCorrect, responseTime }];
    setRecallSessionMoves(newMoves);
    
    // Update stats after each move
    const stats = calculateRecallAccuracy(newMoves);
    setRecallStats(stats);
  };

  // Handle end session - update performance
  const handleEndSession = () => {
    if (variation && performances.has(variation.id)) {
      const currentPerf = performances.get(variation.id);
      if (currentPerf) {
        const newPerf = updatePerformance(currentPerf, accuracy);
        const newPerformances = new Map(performances);
        newPerformances.set(variation.id, newPerf);
        setPerformances(newPerformances);
        setUserStats(getPerformanceStats(newPerformances));
      }
    }
    setState('RESULTS');
  };

  // Handle concept performance data from BoardAreaV2
  // Track sideline deviations during training
  const handleSidelineDetected = (moveIndex: number, playerMove: string, mainlineMove: string) => {
    if (mode !== 'sidelines' || !variation) return;

    const deviationKey = `${moveIndex}-${playerMove}`;
    const deviation: DeviationRecord = {
      moveIndex,
      playerMove,
      mainlineMove,
      depth: moveIndex,
      occurrenceDate: new Date(),
      source: 'training',
      frequency: 1,
    };

    // Track in deviation history
    const currentDeviations = deviationHistory.get(variation.id) || new Map();
    
    let updatedDeviations: Map<string, DeviationRecord>;
    if (currentDeviations.has(deviationKey)) {
      // Increment frequency of existing deviation
      const existing = currentDeviations.get(deviationKey)!;
      const updated = { ...existing };
      updated.frequency += 1;
      updatedDeviations = new Map(currentDeviations);
      updatedDeviations.set(deviationKey, updated);
    } else {
      // Add new deviation
      updatedDeviations = new Map(currentDeviations);
      updatedDeviations.set(deviationKey, deviation);
    }

    const newDeviationHistory = new Map(deviationHistory);
    newDeviationHistory.set(variation.id, updatedDeviations);
    setDeviationHistory(newDeviationHistory);

    // Rebuild deviation profile
    const devProfile = buildDeviationProfile(updatedDeviations);
    setDeviationProfile(devProfile);

    // Update priority deviation
    const priority = suggestPriorityDeviation(devProfile);
    setPriorityDeviation(priority);
  };

  const handleConceptsTracked = (conceptData: Map<string, any>) => {
    setSessionConceptPerformance(conceptData);
  };

  // Handle reset
  const handleReset = () => {
    setOpening(null);
    setSide(null);
    setVariation(null);
    setMoveHistory([]);
    setAccuracy(100);
    setMistakes(0);
    setStreak(0);
    setState('IDLE');
  };

  // Filter variations: only show those that are due for review or not yet attempted
  const getFilteredVariations = (variations: any[]) => {
    return variations.filter(v => {
      const perf = performances.get(v.id);
      if (!perf) return true; // New variation, always available
      // Show if due for review or never attempted
      const now = new Date();
      return new Date(perf.nextReviewDate) <= now;
    });
  };

  // Render opening selection
  if (state === 'IDLE' || state === 'OPENING_SELECTION') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background-light dark:bg-background-dark">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-xl shadow-lg max-w-2xl w-full">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">Coach Jakie Opening Trainer</h1>
            <p className="text-slate-600 dark:text-slate-400">Master your opening repertoire with structured training</p>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3">What opening would you like to train today?</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {openings.map(op => (
                <button
                  key={op}
                  onClick={() => handleOpeningSelect(op)}
                  className="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/10 transition-all text-left font-semibold"
                >
                  {op.charAt(0).toUpperCase() + op.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowDashboard(true)}
            className="w-full p-3 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all font-semibold text-slate-900 dark:text-white flex items-center justify-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined text-lg">analytics</span>
            View Progress Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Render side selection
  if (state === 'SIDE_SELECTION') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background-light dark:bg-background-dark">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-2">Which side would you like to train?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{opening}</p>
          <div className="space-y-3">
            <button
              onClick={() => handleSideSelect('white')}
              className="w-full p-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white transition-all font-bold text-lg"
            >
              ♔ White
            </button>
            <button
              onClick={() => handleSideSelect('black')}
              className="w-full p-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white transition-all font-bold text-lg"
            >
              ♚ Black
            </button>
          </div>
          <button
            onClick={handleReset}
            className="w-full mt-6 p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Render variation selection
  if (state === 'VARIATION_SELECTION') {
    const allVariations = getVariationsByOpening(opening || '');
    const filteredVariations = getFilteredVariations(allVariations);
    const overdueCount = allVariations.length - filteredVariations.length;
    
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background-light dark:bg-background-dark">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">{opening} — Choose a variation</h2>
            {overdueCount > 0 && (
              <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded">
                {overdueCount} overdue
              </span>
            )}
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Playing as {side === 'white' ? 'White' : 'Black'}</p>
          <div className="space-y-2">
            {filteredVariations.length > 0 ? (
              filteredVariations.map(v => {
                const perf = performances.get(v.id);
                return (
                  <button
                    key={v.id}
                    onClick={() => handleVariationSelect(v)}
                    className="w-full p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/10 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-primary">{v.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{v.description}</p>
                      </div>
                      {perf && (
                        <div className="text-right text-xs">
                          <p className="font-bold text-slate-600 dark:text-slate-400">{perf.masteryLevel}</p>
                          <p className="text-slate-500">{perf.accuracy.toFixed(0)}%</p>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-slate-500 text-center py-8">No variations due for review. Great progress! Check back later.</p>
            )}
          </div>
          <button
            onClick={() => setState('SIDE_SELECTION')}
            className="w-full mt-6 p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Render mode selection
  if (state === 'MODE_SELECTION') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background-light dark:bg-background-dark">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-xl shadow-lg max-w-2xl w-full">
          <h2 className="text-2xl font-bold mb-2">Training Mode</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{variation.name}</p>
          
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3">Select difficulty level:</label>
            <div className="space-y-2">
              {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left font-semibold ${
                    difficulty === d
                      ? 'border-primary bg-primary/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-primary'
                  }`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleModeSelect('standard', difficulty)}
              className="w-full p-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white transition-all font-bold"
            >
              Standard Training
            </button>
            <button
              onClick={() => handleModeSelect('sidelines', difficulty)}
              className="w-full p-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white transition-all font-bold"
            >
              Train vs Sidelines
            </button>
            {difficulty !== 'beginner' && (
              <button
                onClick={() => handleModeSelect('recall', difficulty)}
                className="w-full p-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white transition-all font-bold"
              >
                🧠 Blind Recall
              </button>
            )}
          </div>
          <button
            onClick={() => setState('VARIATION_SELECTION')}
            className="w-full mt-6 p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Render recall setup modal
  if (state === 'RECALL_SETUP' && variation) {
    return (
      <div className="flex h-full items-center justify-center bg-background-light dark:bg-background-dark">
        <RecallModeSetup
          variationNodes={variation.moves ? [variation] : []}
          openingName={opening || ''}
          onStartRecall={handleRecallSetup}
          onCancel={() => setState('MODE_SELECTION')}
        />
      </div>
    );
  }

  // Render training/recall
  if (state === 'TRAINING' || state === 'RECALL') {
    // Standard training view
    if (mode !== 'recall') {
      return (
        <div className="flex h-full overflow-hidden">
          <OpeningTrainerSidebarV2
            opening={opening || ''}
            variation={variation}
            difficulty={difficulty}
            moveHistory={moveHistory}
            accuracy={accuracy}
          />
          <OpeningTrainerBoardAreaV2
            opening={opening || ''}
            color={side || 'white'}
            variation={variation}
            mode={mode}
            difficulty={difficulty}
            moveHistory={moveHistory}
            setMoveHistory={setMoveHistory}
            mistakes={mistakes}
            setMistakes={setMistakes}
            accuracy={accuracy}
            setAccuracy={setAccuracy}
            streak={streak}
            setStreak={setStreak}
            onEndSession={handleEndSession}
            onConceptsTracked={handleConceptsTracked}
            onSidelineDetected={handleSidelineDetected}
          />
          {mode === 'sidelines' && deviationProfile ? (
            <DeviationTracker
              deviationProfile={deviationProfile}
              priorityDeviation={priorityDeviation}
              onFocusDeviation={(dev) => {
                // Can implement focused training on specific deviation if needed
              }}
            />
          ) : (
            <OpeningTrainerCoachPanelV2
              opening={opening || ''}
              variation={variation}
              mode={mode}
              difficulty={difficulty}
              accuracy={accuracy}
              mistakes={mistakes}
              streak={streak}
              moveHistory={moveHistory}
            />
          )}
        </div>
      );
    }

    // Recall mode view
    if (currentRecallNode && recallStats) {
      return (
        <div className="flex h-full overflow-hidden">
          <OpeningTrainerSidebarV2
            opening={opening || ''}
            variation={variation}
            difficulty={difficulty}
            moveHistory={moveHistory}
            accuracy={recallStats.accuracy}
          />
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="max-w-2xl w-full">
              <div className="p-6 bg-jungle-green-50 dark:bg-jungle-green-900/20 rounded-lg border-2 border-primary mb-6">
                <h2 className="text-2xl font-bold text-primary mb-2">Blind Recall Session</h2>
                <p className="text-gray-700 dark:text-gray-300">{currentRecallNode.positionDescription}</p>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="p-4 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Accuracy</p>
                  <p className="text-2xl font-bold text-primary">{recallStats.accuracy.toFixed(0)}%</p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Correct</p>
                  <p className="text-2xl font-bold">{recallStats.correctMoves}/{recallStats.totalMoves}</p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Avg Time</p>
                  <p className="text-2xl font-bold">{(recallStats.avgResponseTime / 1000).toFixed(1)}s</p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Best Streak</p>
                  <p className="text-2xl font-bold">{recallStats.consecutiveCorrect}</p>
                </div>
              </div>

              <button
                onClick={handleEndSession}
                className="w-full p-4 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition"
              >
                End Session & Get Feedback
              </button>
            </div>
          </div>
          
          <OpeningTrainerCoachPanelV2
            opening={opening || ''}
            variation={variation}
            mode={mode}
            difficulty={difficulty}
            accuracy={recallStats.accuracy}
            mistakes={recallStats.totalMoves - recallStats.correctMoves}
            streak={recallStats.consecutiveCorrect}
            moveHistory={[]}
          />
        </div>
      );
    }

    // If recall but no node selected, go back
    return (
      <div className="flex h-full items-center justify-center bg-background-light dark:bg-background-dark">
        <button
          onClick={() => setState('RECALL_SETUP')}
          className="p-4 rounded-lg bg-primary text-white font-bold hover:bg-primary/90"
        >
          Start Next Recall
        </button>
      </div>
    );
  }

  // Render results
  if (state === 'RESULTS') {
    return (
      <div className="w-full h-screen bg-background-light dark:bg-background-dark">
        <OpeningTrainerResultsModal
          isOpen={true}
          opening={opening || ''}
          variationName={variation?.name || ''}
          side={side === 'white' ? 'w' : 'b'}
          accuracy={accuracy}
          mistakes={mistakes}
          sessionMoves={moveHistory.length}
          difficulty={difficulty}
          conceptPerformance={sessionConceptPerformance}
          onRetry={() => setState('TRAINING')}
          onSelectDifferent={() => setState('VARIATION_SELECTION')}
          onEndSession={handleEndSession}
        />
      </div>
    );
  }

  // Render progress dashboard
  if (showDashboard) {
    return (
      <UserProgressDashboard
        performances={performances}
        conceptDiagnostics={conceptDiagnostics}
        recallHistory={recallHistory}
        deviationHistory={deviationHistory}
        onClose={() => setShowDashboard(false)}
      />
    );
  }

  return null;
}
