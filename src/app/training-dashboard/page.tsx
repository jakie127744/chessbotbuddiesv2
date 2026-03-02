"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Target, ArrowRight, Flame, CheckCircle, Timer, Info, Trophy } from "lucide-react";
import MiniBoard from "@/components/MiniBoard";
import { getRandomPuzzleAsync, type LichessPuzzle, PUZZLE_THEMES } from "@/lib/puzzle-types";
import { ENDGAME_CATEGORIES } from "@/lib/endgame-data";
import { getUserProfile, type UserProfile } from "@/lib/user-profile";
import { supabase } from "@/lib/supabaseClient";

/** Pick a random endgame category + position */
function getRandomEndgame() {
  const cat = ENDGAME_CATEGORIES[Math.floor(Math.random() * ENDGAME_CATEGORIES.length)];
  const pos = cat.positions[Math.floor(Math.random() * cat.positions.length)];
  return { category: cat, position: pos };
}

/** Sicilian Defense: Najdorf – a classic opening position */
const OPENING_FEN = "rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6";

function getDifficultyLabel(rating: number) {
  if (rating >= 2200) return { label: "Master", color: "text-red-400 bg-red-900/30" };
  if (rating >= 1800) return { label: "Expert", color: "text-amber-400 bg-amber-900/30" };
  if (rating >= 1400) return { label: "Intermediate", color: "text-jungle-green-400 bg-jungle-green-900/20" };
  return { label: "Beginner", color: "text-jungle-green-400 bg-jungle-green-900/30" };
}

interface TopPlayer {
  rank: number;
  username: string;
  rating: number;
  isUser: boolean;
}

export default function TrainingDashboard() {
  const [puzzle, setPuzzle] = useState<LichessPuzzle | null>(null);
  const [endgame] = useState(() => getRandomEndgame());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);

  useEffect(() => {
    // Fetch daily puzzle from Supabase
    getRandomPuzzleAsync().then((p) => {
      if (p) setPuzzle(p);
    });

    // Load local user profile
    const user = getUserProfile();
    setProfile(user);

    // Fetch top players from Supabase profiles table
    async function fetchTopPlayers() {
      if (!supabase) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, rating")
        .order("rating", { ascending: false })
        .limit(5);
      if (error || !data) return;
      const currentUser = getUserProfile();
      const players: TopPlayer[] = data.map((p: any, i: number) => ({
        rank: i + 1,
        username: p.username || "Anonymous",
        rating: p.rating || 1200,
        isUser: currentUser ? p.id === currentUser.id : false,
      }));
      // If user isn't in top 5, append them
      if (currentUser && !players.some((p) => p.isUser)) {
        // Get user's rank
        const { count } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gt("rating", currentUser.rating || 1200);
        players.push({
          rank: (count || 0) + 1,
          username: currentUser.username,
          rating: currentUser.rating || 1200,
          isUser: true,
        });
      }
      setTopPlayers(players);
    }
    fetchTopPlayers();
  }, []);

  const diff = puzzle ? getDifficultyLabel(puzzle.rating) : null;
  // Determine whose move it is from FEN
  const puzzleSideToMove = puzzle ? (puzzle.fen.split(" ")[1] === "b" ? "Black" : "White") : "";
  // Readable theme tags
  const themeTags = puzzle
    ? puzzle.themes.slice(0, 3).map((t) => {
        const info = PUZZLE_THEMES[t as keyof typeof PUZZLE_THEMES];
        return info ? info.name : t;
      })
    : [];

  return (
    <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-[var(--background)] min-h-screen">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-4">
          <Link href="/home" className="hover:text-white transition-colors">Home</Link>
          <span className="text-slate-600">/</span>
          <span className="text-jungle-green-400 font-bold">Training Dashboard</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Puzzles & Training</h1>
            <p className="text-[var(--text-secondary)]">Sharpen your chess skills with puzzles, endgame drills, and opening practice.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Training Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Daily Puzzle Hero */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Daily Puzzle</h3>
                {diff && (
                  <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${diff.color}`}>
                    {diff.label}
                  </span>
                )}
              </div>
              <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
                <div className="flex flex-col md:flex-row">
                  <Link href="/puzzles/training" className="w-full md:w-1/2 aspect-square bg-[var(--surface-highlight)] relative group overflow-hidden">
                    {puzzle ? (
                      <MiniBoard fen={puzzle.fen} className="rounded-none" />
                    ) : (
                      <div className="absolute inset-0 bg-[var(--surface-highlight)] animate-pulse" />
                    )}
                  </Link>
                  <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
                    <div>
                      <h4 className="text-2xl font-bold text-white mb-2">
                        {puzzle ? `${puzzleSideToMove} to move` : "Loading puzzle…"}
                      </h4>
                      <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                        {puzzle
                          ? `Rating ${puzzle.rating} — Find the best continuation in this ${themeTags[0] || "tactical"} puzzle.`
                          : "Fetching a fresh puzzle from the database…"}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {themeTags.map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-[var(--surface-highlight)] rounded-full text-xs font-medium text-[var(--text-secondary)]">
                            #{tag}
                          </span>
                        ))}
                        {puzzle && (
                          <span className="px-3 py-1 bg-[var(--surface-highlight)] rounded-full text-xs font-medium text-[var(--text-secondary)]">
                            #{puzzle.rating} ELO
                          </span>
                        )}
                      </div>
                    </div>
                    <Link href="/puzzles/training" className="w-full py-3 bg-jungle-green-600 text-white font-bold rounded-lg hover:bg-jungle-green-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-jungle-green-700/20">
                      SOLVE NOW
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
            {/* Specialized Trainers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Opening Trainer */}
              <section>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-jungle-green-400" />
                  Opening Trainer
                </h3>
                <Link href="/training?tab=openings" className="block bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 hover:border-jungle-green-500/50 transition-all group shadow-sm">
                  <div className="aspect-square rounded-lg mb-4 overflow-hidden relative">
                    <MiniBoard fen={OPENING_FEN} className="rounded-lg" />
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] rounded">Sicilian Najdorf</div>
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">Master the Sicilian</h4>
                  <p className="text-xs text-[var(--text-secondary)] mb-4 line-clamp-2">Learn the most theoretical and exciting response to 1.e4 — the Najdorf variation.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-jungle-green-400 uppercase">Start Training →</span>
                  </div>
                </Link>
              </section>
              {/* Endgame Trainer */}
              <section>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Target size={20} className="text-jungle-green-400" />
                  Endgame Trainer
                </h3>
                <Link href="/training?tab=endgames" className="block bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 hover:border-jungle-green-500/50 transition-all group shadow-sm">
                  <div className="aspect-square rounded-lg mb-4 overflow-hidden relative">
                    <MiniBoard fen={endgame.position.fen} className="rounded-lg" />
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] rounded">
                      {endgame.category.title}
                    </div>
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">{endgame.category.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)] mb-4 line-clamp-2">{endgame.category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase ${
                      endgame.category.difficulty === "beginner" ? "text-green-400" :
                      endgame.category.difficulty === "intermediate" ? "text-amber-400" : "text-red-400"
                    }`}>
                      {endgame.category.difficulty}
                    </span>
                    <span className="text-[10px] font-bold text-jungle-green-400 uppercase">Practice →</span>
                  </div>
                </Link>
              </section>
            </div>
          </div>
          {/* Sidebar: Statistics & Progress */}
          <div className="space-y-6">
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white">Puzzle Statistics</h3>
                <Info size={16} className="text-[var(--text-tertiary)]" />
              </div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black text-jungle-green-400 leading-none">
                  {profile?.rating?.toLocaleString() ?? "—"}
                </span>
              </div>
              <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-6">
                {profile ? "Current Rating" : "Sign in to track stats"}
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[var(--surface-highlight)]/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-jungle-green-900/30 flex items-center justify-center text-jungle-green-400">
                      <Timer size={16} />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">Daily Streak</span>
                  </div>
                  <span className="text-sm font-bold text-white">{profile?.streak ?? 0} Days</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--surface-highlight)]/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-green-900/30 flex items-center justify-center text-green-400">
                      <CheckCircle size={16} />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">Puzzles Solved</span>
                  </div>
                  <span className="text-sm font-bold text-white">{profile?.stats?.puzzlesSolved ?? 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--surface-highlight)]/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-jungle-green-900/30 flex items-center justify-center text-jungle-green-400">
                      <Timer size={16} />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">Games Played</span>
                  </div>
                  <span className="text-sm font-bold text-white">{profile?.stats?.gamesPlayed ?? 0}</span>
                </div>
              </div>
            </div>
            {/* Win/Loss/Draw breakdown */}
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 shadow-sm">
              <h3 className="font-bold text-sm text-white mb-4">Game Results</h3>
              {(() => {
                const w = profile?.stats?.wins ?? 0;
                const l = profile?.stats?.losses ?? 0;
                const d = profile?.stats?.draws ?? 0;
                const total = w + l + d;
                const pW = total > 0 ? Math.round((w / total) * 100) : 0;
                const pL = total > 0 ? Math.round((l / total) * 100) : 0;
                const pD = total > 0 ? 100 - pW - pL : 0;
                return (
                  <>
                    <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-3">
                      {pW > 0 && <div className="bg-green-500" style={{ width: `${pW}%` }} />}
                      {pD > 0 && <div className="bg-gray-400" style={{ width: `${pD}%` }} />}
                      {pL > 0 && <div className="bg-red-500" style={{ width: `${pL}%` }} />}
                      {total === 0 && <div className="flex-1 bg-[var(--surface-highlight)]" />}
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-green-400 font-bold">{w}W</span>
                      <span className="text-gray-400 font-bold">{d}D</span>
                      <span className="text-red-400 font-bold">{l}L</span>
                    </div>
                  </>
                );
              })()}
            </div>
            {/* Leaderboard Preview */}
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
              <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
                <h3 className="font-bold text-sm text-white">Top Solvers</h3>
                <Link href="/leaderboard" className="text-[10px] text-jungle-green-400 font-bold hover:underline">VIEW ALL</Link>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {topPlayers.length === 0 && (
                  <div className="px-4 py-6 text-center text-xs text-[var(--text-tertiary)]">Loading leaderboard…</div>
                )}
                {topPlayers.map((player) => (
                  <div key={player.rank + player.username} className={`px-4 py-3 flex items-center justify-between ${player.isUser ? "bg-jungle-green-500/5" : ""}`}>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold ${player.isUser ? "text-jungle-green-400" : "text-[var(--text-tertiary)]"}`}>
                        {player.rank}
                      </span>
                      <div className={`size-6 rounded-full flex items-center justify-center ${
                        player.rank === 1
                          ? "bg-[var(--surface-highlight)]"
                          : player.isUser
                          ? "bg-jungle-green-500/10"
                          : "bg-[var(--surface-highlight)]"
                      }`}>
                        {player.rank === 1 ? (
                          <Trophy size={12} className="text-amber-400" />
                        ) : player.isUser ? (
                          <span className="text-[10px] text-jungle-green-400 font-bold">{player.username.charAt(0).toUpperCase()}</span>
                        ) : null}
                      </div>
                      <span className={`text-xs font-medium ${player.isUser ? "text-jungle-green-400 font-bold" : "text-[var(--text-primary)]"}`}>
                        {player.username}{player.isUser ? " (You)" : ""}
                      </span>
                    </div>
                    <span className={`text-xs font-bold ${player.isUser ? "text-jungle-green-400" : "text-white"}`}>
                      {player.rating.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
