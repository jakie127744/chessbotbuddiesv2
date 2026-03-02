import { ChessBoard } from './ChessBoard';
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChessBoard } from './ChessBoard';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowRight, RefreshCcw, Lightbulb } from 'lucide-react';
import { LessonNode } from '@/lib/lesson-data';
import type { BotMoveResult } from '@/lib/bot-engine';
import { useCallback } from 'react';
import { useLessonGame } from '@/hooks/useLessonGame';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { PIECE_IMAGES_DATA } from '@/redesign/lib/piece-images';
import { BOT_PROFILES } from '@/lib/bot-profiles';
import { getUserProfile, updateUserProfile, saveMinigameHighScore } from '@/lib/user-profile';
import {
    getPiggyMove,
    applyMinigameMove,
    getHiddenKingTrampleMove,
    canTrampleKing,
    getRemainingMobilePiggies
} from '@/lib/minigame-rules';
import { getBotMove } from '@/lib/bot-engine';
// import { MINIGAME_IDS } from '@/lib/minigame-ids'; // Uncomment if needed

function LessonPlayer(props: any) {

    // --- Lesson/game logic via useLessonGame ---
    // Accept lesson prop or fallback to a demo lesson if not provided
    const lesson = props.lesson || { title: 'Demo Lesson', pages: [{ type: 'intro', text: 'Welcome to the lesson!' }] };
    const {
        pageIndex,
        setPageIndex,
        activePages,
        score,
        setScore,
        mistakes,
        setMistakes,
        hasMadeMistake,
        setHasMadeMistake,
        lessonCompleted,
        setLessonCompleted,
        currentPage,
        isFirstPage,
        isLastPage,
        handleNext,
        retryLesson
    } = useLessonGame(lesson);

    // Chess board state
    const [fen, setFen] = useState(currentPage?.fen || 'start');
    useEffect(() => {
        if (currentPage?.fen) {
            setFen(currentPage.fen);
        }
    }, [currentPage]);

    // Highlight state for lesson steps
    const [highlightedSquares, setHighlightedSquares] = useState<string[]>([]);
    const [activePrompt, setActivePrompt] = useState<string | null>(null);

    // Example: highlight file 'a' and rank '1' for "Files and Ranks" lesson
    useEffect(() => {
        if (currentPage?.id === 'files-and-ranks') {
            setHighlightedSquares([
                ...Array(8).fill(0).map((_, i) => `a${i+1}`), // file a
                ...Array(8).fill(0).map((_, i) => `${'abcdefgh'[i]}1`) // rank 1
            ]);
            setActivePrompt('Click all squares in file a and rank 1!');
        } else {
            setHighlightedSquares([]);
            setActivePrompt(null);
        }
    }, [currentPage]);

    // Handle user move (placeholder, to be replaced with real logic)
    const handleMove = (from: string, to: string) => {
        // TODO: Validate move, update FEN, call lesson/game logic
        // For now, just log the move
        console.log('User move:', from, to);
    };

    // UI state
    const [showSidebar, setShowSidebar] = useState(true);
    const [showHint, setShowHint] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string|null>(null);

    // --- Timer logic (placeholder, to be replaced with lesson/game timer logic) ---
    // ...existing code for timer if needed...

    // --- Main Render ---
    // --- Modern lesson presentation for the first lesson (template) ---
    // Jungle green palette accents
    const jungleGreen = '#1bada6';
    const jungleGreenDark = '#0a3d31';
    const jungleGreenLight = '#5ef2c2';

    return (
        <div className="flex flex-col min-h-screen w-full bg-background-light dark:bg-[#0a0e16] font-display text-slate-900 dark:text-slate-100">
            {/* Header / TopNavBar */}
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-6 py-3 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-3xl">grid_view</span>
                        <h2 className="text-lg font-bold tracking-tight">Chess Master</h2>
                    </div>
                    <div className="h-6 w-px bg-slate-700 mx-2"></div>
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Level 1: The Battlefield</span>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="w-48 h-2 rounded-full bg-slate-800 overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: '25%' }}></div>
                            </div>
                            <span className="text-xs text-slate-400 font-bold">25%</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <nav className="hidden md:flex items-center gap-6">
                        <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Lessons</a>
                        <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Puzzles</a>
                        <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Play</a>
                    </nav>
                    <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
                        <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary/20 transition-colors">
                            <span className="material-symbols-outlined text-xl">settings</span>
                        </button>
                        <div className="size-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center overflow-hidden">
                            <img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDV_E4TQZDhhFCSJstC7hiobodKNuhlOS3WbZmAWiuVF7UGUfZeMkOF1-3VEchPb29vQ992ci2akKGnJSDWZLs0OW0utedlXsTw3wYc1d6RWPlD_eYTOtq7t-bmb8EroZaXkHnwWLz_stO4_nc1XdlvRiwyhOKluvy0XiFN-gtA7FEsnyRuNgRiovdn1E3CeRdUmVDE69ZZCQRbNtJvdBWtZVCNMNF6dV2QAYALSMkPdpgUiJ9-bBQoXe5eNyVOO485qyADow_aaDs" />
                        </div>
                    </div>
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar: Course Roadmap */}
                <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark flex flex-col shrink-0">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">map</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold">Course Roadmap</h3>
                            <p className="text-xs text-slate-500">Fundamentals</p>
                        </div>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                            <span className="material-symbols-outlined text-xl">info</span>
                            <span className="text-sm font-medium">Introduction</span>
                            <span className="material-symbols-outlined text-green-500 ml-auto text-sm">check_circle</span>
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 cursor-pointer">
                            <span className="material-symbols-outlined text-xl">grid_4x4</span>
                            <span className="text-sm font-bold">The Battlefield</span>
                            <span className="material-symbols-outlined ml-auto text-sm">play_arrow</span>
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                            <span className="material-symbols-outlined text-xl">chess</span>
                            <span className="text-sm font-medium">Piece Movement</span>
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer opacity-50">
                            <span className="material-symbols-outlined text-xl">stars</span>
                            <span className="text-sm font-medium">Special Rules</span>
                            <span className="material-symbols-outlined ml-auto text-sm">lock</span>
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer opacity-50">
                            <span className="material-symbols-outlined text-xl">target</span>
                            <span className="text-sm font-medium">Checkmate</span>
                            <span className="material-symbols-outlined ml-auto text-sm">lock</span>
                        </div>
                    </nav>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 m-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-8 rounded-full bg-cyan-500/20 flex items-center justify-center overflow-hidden border border-cyan-500/40">
                                <span className="material-symbols-outlined text-cyan-400 text-lg">smart_toy</span>
                            </div>
                            <span className="text-xs font-bold text-cyan-400 uppercase tracking-tighter">Buddy the Buddy</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-400 italic">"Remember: The squares are like coordinates on a map!"</p>
                    </div>
                </aside>
                {/* Main Workspace: Chessboard */}
                <main className="flex-1 bg-slate-100 dark:bg-[#0a0e16] flex items-center justify-center p-8 gap-8 overflow-auto">
                    {/* Board Area: Use ChessBoard component for interactivity and theming */}
                    <div className="relative w-[500px] h-[500px] flex flex-col items-center justify-center">
                        <ChessBoard
                            fen={fen}
                            highlightedSquares={highlightedSquares}
                            onSquareClick={(square: string) => {
                                if (highlightedSquares.includes(square) && activePrompt) {
                                    setHighlightedSquares(prev => prev.filter(sq => sq !== square));
                                }
                            }}
                            theme="jungle"
                        />
                        {activePrompt && (
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#1bada6]/90 text-[#0a0e16] px-4 py-2 rounded-xl shadow-lg font-bold text-base animate-fade-in z-20">
                                {activePrompt}
                            </div>
                        )}
                    </div>
                    {/* Instruction Panel */}
                    <section className="w-[350px] min-h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col p-6 gap-6">
                        {/* Step Indicator & Progress Bar */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-primary tracking-widest uppercase">Step 1 of 5</span>
                                <span className="text-xs text-slate-400">Lesson 1</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all" style={{ width: '20%' }}></div>
                            </div>
                        </div>
                        {/* Lesson Title */}
                        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">The Battlefield</h2>
                        {/* Lesson Instructions */}
                        <div className="flex-1 text-base leading-relaxed text-slate-700 dark:text-slate-300">
                            <p>Welcome to the chessboard! Each square has a unique coordinate, like <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">e4</span>. The board is 8x8, with files labeled <span className="font-mono">a</span> to <span className="font-mono">h</span> and ranks <span className="font-mono">1</span> to <span className="font-mono">8</span>. Try clicking a square to see its name!</p>
                        </div>
                        {/* Navigation Buttons */}
                        <div className="flex gap-3 mt-4">
                            <button className="flex-1 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold" disabled>Back</button>
                            <button className="flex-1 py-2 rounded-lg bg-primary text-white font-bold shadow hover:bg-primary-dark transition">Next</button>
                        </div>
                    </section>
                </main>
                {/* Right Side: Instruction Panel */}
                <aside className="w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark flex flex-col shrink-0">
                    <div className="p-6 overflow-y-auto flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary uppercase tracking-wider">Step 2 of 8</span>
                        </div>
                        <h1 className="text-3xl font-black leading-tight tracking-tight mb-4">Files and Ranks</h1>
                        <div className="space-y-6">
                            <section className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                <div className="flex items-start gap-4">
                                    <div className="size-12 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
                                        <span className="material-symbols-outlined text-cyan-400">smart_toy</span>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">Botty says:</h4>
                                        <p className="text-sm text-slate-400 leading-relaxed">
                                            To find our way around the board, we use a grid system! Every square has a name.
                                        </p>
                                    </div>
                                </div>
                            </section>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="material-symbols-outlined text-primary">view_column</span>
                                        <h3 className="font-bold text-lg">FILES</h3>
                                    </div>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Vertical columns are called <span className="text-primary font-bold">FILES</span>. They are labeled from <span className="font-mono text-primary font-bold">a</span> to <span className="font-mono text-primary font-bold">h</span>.
                                    </p>
                                    <div className="mt-3 py-2 px-3 rounded bg-primary/10 text-primary text-xs font-medium border border-primary/20 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">info</span>
                                        File "a" is highlighted in Blue on your board.
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="material-symbols-outlined text-green-500">view_headline</span>
                                        <h3 className="font-bold text-lg">RANKS</h3>
                                    </div>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Horizontal rows are called <span className="text-green-500 font-bold">RANKS</span>. They are numbered from <span className="font-mono text-green-500 font-bold">1</span> to <span className="font-mono text-green-500 font-bold">8</span>.
                                    </p>
                                    <div className="mt-3 py-2 px-3 rounded bg-green-500/10 text-green-500 text-xs font-medium border border-green-500/20 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">info</span>
                                        Rank "1" is highlighted in Green on your board.
                                    </div>
                                </div>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <p className="text-xs text-slate-500 italic">
                                    A square's name is the combination of its file and rank. For example, the bottom-left square is <span className="font-bold text-primary">a1</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
                        <button className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all">
                            Next Step
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default LessonPlayer;
export { LessonPlayer };