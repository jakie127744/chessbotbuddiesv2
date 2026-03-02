'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { Target, Timer, Flame, RefreshCcw, ArrowRight, Trophy, Play, Pause } from 'lucide-react';
import ChessBoard from './ChessBoard';
import { DEFAULT_REPERTOIRE } from '../lib/openings-repertoire';

type Difficulty = 'normal' | 'hard';

interface ShotgunQuestion {
  fen: string;
  correctSan: string;
  options: string[];
  openingName: string;
  variationName: string;
  moveNumber: number;
  side: 'white' | 'black';
}

interface OpeningShotgunTrainerProps {
  onExit: () => void;
  initialOpening?: string | null;
}

// Utility: pick random item
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Utility: convert a UCI move to SAN from a given position
const uciToSan = (fen: string, uci: string): string | null => {
  try {
    const game = new Chess(fen);
    const match = uci.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);
    if (!match) return null;
    const moveObj = { from: match[1], to: match[2], promotion: match[3] } as any;
    const result = game.move(moveObj);
    return result?.san || null;
  } catch {
    return null;
  }
};

export function OpeningShotgunTrainer({ onExit, initialOpening = null }: OpeningShotgunTrainerProps) {
  const [sessionState, setSessionState] = useState<'intro' | 'playing' | 'paused' | 'summary'>('intro');
  const [opening, setOpening] = useState<string | 'any'>(initialOpening || 'any');
  const [side, setSide] = useState<'white' | 'black'>('white');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  const [question, setQuestion] = useState<ShotgunQuestion | null>(null);
  const [lastAnswer, setLastAnswer] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [questionsSeen, setQuestionsSeen] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // seconds

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Unique openings list
  const availableOpenings = useMemo(() => Array.from(new Set(DEFAULT_REPERTOIRE.map(v => v.opening))).sort(), []);

  const resetSession = () => {
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setQuestionsSeen(0);
    setLastAnswer(null);
    setTimeLeft(180);
  };

  const pickVariationPool = useCallback(() => {
    const filtered = DEFAULT_REPERTOIRE.filter(v => {
      const sideMatch = v.playerColor === (side === 'white' ? 'w' : 'b');
      const openingMatch = opening === 'any' ? true : v.opening === opening;
      return sideMatch && openingMatch;
    });
    return filtered.length > 0 ? filtered : DEFAULT_REPERTOIRE;
  }, [opening, side]);

  const buildQuestion = useCallback(() => {
    const pool = pickVariationPool();
    if (pool.length === 0) return null;

    const variation = pick(pool);
    const game = new Chess();

    // Determine candidate indices where it's our side to move
    const candidateIndices: number[] = [];
    for (let i = 0; i < variation.moves.length; i++) {
      const ourTurn = (i % 2 === 0 && variation.playerColor === 'w') || (i % 2 === 1 && variation.playerColor === 'b');
      if (ourTurn) candidateIndices.push(i);
    }
    if (candidateIndices.length === 0) return null;

    // Difficulty selector: favor deeper indices when hard
    let chosenIndex = pick(candidateIndices);
    if (difficulty === 'hard') {
      const deeper = candidateIndices.filter(i => i >= 6);
      if (deeper.length) chosenIndex = pick(deeper);
    } else {
      const early = candidateIndices.filter(i => i <= 8);
      if (early.length) chosenIndex = pick(early);
    }

    for (let i = 0; i < chosenIndex; i++) {
      const moveUci = variation.moves[i];
      const match = moveUci.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);
      if (!match) break;
      game.move({ from: match[1], to: match[2], promotion: match[3] } as any);
    }

    const fen = game.fen();
    const correctUci = variation.moves[chosenIndex];
    const correctSan = uciToSan(fen, correctUci);
    if (!correctSan) return null;

    // Generate options
    const legalSans = game.moves();
    const wrongOptions = legalSans.filter(m => m !== correctSan).sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [correctSan, ...wrongOptions].sort(() => 0.5 - Math.random());

    return {
      fen,
      correctSan,
      options,
      openingName: variation.opening,
      variationName: variation.name || 'Variation',
      moveNumber: Math.floor(chosenIndex / 2) + 1,
      side: variation.playerColor === 'w' ? 'white' : 'black',
    } as ShotgunQuestion;
  }, [difficulty, pickVariationPool]);

  const nextQuestion = useCallback(() => {
    const q = buildQuestion();
    if (q) {
      setQuestion(q);
      setQuestionsSeen(qs => qs + 1);
      setLastAnswer(null);
    }
  }, [buildQuestion]);

  // Timer controls
  useEffect(() => {
    if (sessionState !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          setSessionState('summary');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionState]);

  const handleAnswer = (san: string) => {
    if (!question) return;
    const isCorrect = san === question.correctSan;
    setLastAnswer(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => {
        const next = s + 1;
        setMaxStreak(m => Math.max(m, next));
        return next;
      });
    } else {
      setStreak(0);
      setTimeLeft(t => Math.max(0, t - 5));
    }
    setTimeout(nextQuestion, 600);
  };

  const handleStart = () => {
    resetSession();
    setSessionState('playing');
    nextQuestion();
  };

  const handlePause = () => {
    if (sessionState === 'playing') {
      setSessionState('paused');
      if (timerRef.current) clearInterval(timerRef.current);
    } else if (sessionState === 'paused') {
      setSessionState('playing');
    }
  };

  const accuracy = useMemo(() => {
    const total = Math.max(1, questionsSeen);
    return (score / total) * 100;
  }, [score, questionsSeen]);

  // UI helpers
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- Render blocks ---
  const renderIntro = () => (
    <div className="h-full w-full bg-gradient-to-br from-[#0b1220] via-[#111827] to-[#0b1220] flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-red-500/20 text-red-200 border border-red-500/30">
            <Target size={28} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-red-300 font-black">Shotgun Drills</p>
            <h2 className="text-3xl font-black text-white">Rapid-fire opening recall</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-red-200 font-black mb-1">Opening</p>
            <select
              value={opening}
              onChange={(e) => setOpening(e.target.value as any)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <option value="any">Any Repertoire</option>
              {availableOpenings.map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-red-200 font-black mb-1">Side</p>
            <div className="flex gap-2">
              {(['white','black'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={`flex-1 py-2 rounded-xl font-bold text-sm border transition-all ${side === s ? 'bg-white text-[#0b1220] border-white' : 'bg-black/30 text-white border-white/10 hover:border-white/30'}`}
                >
                  {s === 'white' ? '♔ White' : '♚ Black'}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-red-200 font-black mb-1">Difficulty</p>
            <div className="flex gap-2">
              {(['normal','hard'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-xl font-bold text-sm border transition-all ${difficulty === d ? 'bg-red-500 text-white border-red-400' : 'bg-black/30 text-white border-white/10 hover:border-white/30'}`}
                >
                  {d === 'normal' ? 'Normal' : 'Harder' }
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-zinc-300">
          <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 inline-flex items-center gap-2"><Timer size={16} /> 3:00 Timer</span>
          <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 inline-flex items-center gap-2"><Flame size={16} /> +1 point per hit</span>
          <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 inline-flex items-center gap-2"><RefreshCcw size={16} /> -5s on mistakes</span>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={handleStart}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-amber-400 text-black font-black text-lg uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(239,68,68,0.35)] hover:scale-[1.01] active:scale-[0.99] transition-transform"
          >
            Start Session
          </button>
          <button
            onClick={onExit}
            className="px-5 py-4 rounded-2xl border border-white/20 text-white font-bold hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="h-full w-full bg-[#0b1220] flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center text-white shadow-2xl">
        <Trophy size={56} className="mx-auto text-amber-400 mb-4" />
        <h3 className="text-3xl font-black mb-2">Session Complete</h3>
        <p className="text-zinc-300 mb-6">You answered {score} correct in {questionsSeen} questions.</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black">Score</p>
            <p className="text-2xl font-black">{score}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black">Max Streak</p>
            <p className="text-2xl font-black">{maxStreak}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black">Accuracy</p>
            <p className={`text-2xl font-black ${accuracy >= 80 ? 'text-emerald-300' : accuracy >= 60 ? 'text-amber-300' : 'text-rose-300'}`}>{accuracy.toFixed(0)}%</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleStart}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-amber-400 text-black font-black uppercase tracking-[0.2em]"
          >
            Replay
          </button>
          <button
            onClick={onExit}
            className="px-5 py-3 rounded-2xl border border-white/20 text-white font-bold hover:bg-white/5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const renderPlaying = () => (
    <div className="h-full w-full bg-[#0b1220] flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-white/5 px-5 flex items-center justify-between bg-black/30 backdrop-blur">
        <div className="flex items-center gap-3 text-white">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <Timer size={18} className="text-amber-300" />
            <span className="font-mono font-black text-lg">{formatTime(timeLeft)}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-zinc-300">
            Score {score}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-zinc-300">
            Streak {streak}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePause}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold flex items-center gap-2 hover:bg-white/10"
          >
            {sessionState === 'paused' ? <Play size={16} /> : <Pause size={16} />} {sessionState === 'paused' ? 'Resume' : 'Pause'}
          </button>
          <button onClick={onExit} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10">
            Exit
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 grid md:grid-cols-[1fr_380px] gap-4 p-5 overflow-hidden">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-center">
          {question && (
            <div className="w-full max-w-[540px] aspect-square">
              <ChessBoard
                game={new Chess(question.fen)}
                onMove={() => false}
                orientation={question.side}
                arePiecesDraggable={false}
              />
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 overflow-auto">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-amber-200 font-black">Move {question?.moveNumber}</p>
              <h3 className="text-xl font-black text-white">{question?.openingName}</h3>
              <p className="text-sm text-zinc-300">{question?.variationName}</p>
            </div>
            {lastAnswer && (
              <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border ${
                lastAnswer === 'correct'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-200'
              }`}>
                {lastAnswer === 'correct' ? 'Correct' : 'Try Again'}
              </span>
            )}
          </div>

          <div className="grid gap-3">
            {question?.options.map((opt) => {
              const isCorrect = opt === question.correctSan;
              const isChosen = lastAnswer && opt === question.correctSan;
              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all font-bold text-white flex items-center justify-between ${
                    lastAnswer
                      ? isCorrect
                        ? 'bg-emerald-500/15 border-emerald-500/30'
                        : 'bg-rose-500/15 border-rose-500/30'
                      : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                  }`}
                  disabled={!!lastAnswer}
                >
                  <span>{opt}</span>
                  {!lastAnswer && <ArrowRight size={16} className="text-zinc-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  if (sessionState === 'intro') return renderIntro();
  if (sessionState === 'summary') return renderSummary();
  return renderPlaying();
}

export default OpeningShotgunTrainer;