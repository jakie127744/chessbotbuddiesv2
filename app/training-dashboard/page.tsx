// ...existing code...
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
        {/* ...existing code... */}
      </div>
    </div>
  );
}
