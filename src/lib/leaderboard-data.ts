import { UserProfile } from "./user-profile";
import { COUNTRY_CODES } from "@/lib/countries";
import { BOT_PROFILES } from "./bot-profiles";
import { UserStats } from "@/contexts/RewardsContext";

export interface LeaderboardEntry {
    rank: number;
    username: string;
    elo: number;
    country: string; // ISO Code
    gamesPlayed: number;
    winRate: number; // 0-100
    isUser: boolean; // Is this the current player?
    wins?: number;
    losses?: number;
    draws?: number;
    puzzlesSolved?: number;
    lessonsCompleted?: number;
    xp?: number;
    endgamesCompleted?: number;
    openingsCompleted?: number;
}

import { supabase } from "./supabaseClient";
import { LESSON_TRACKS } from "./lesson-data";

export type LeaderboardMetric = 'rating' | 'xp' | 'lessons' | 'puzzles' | 'endgames' | 'openings';

const ENDGAME_LESSON_IDS = new Set<string>();
const OPENING_LESSON_IDS = new Set<string>();

Object.values(LESSON_TRACKS).forEach(track => {
    track.forEach(lesson => {
        if (lesson.type === 'endgame') ENDGAME_LESSON_IDS.add(lesson.id);
        if (lesson.type === 'opening') OPENING_LESSON_IDS.add(lesson.id);
    });
});

const countCompletions = (completedIds: string[] | undefined, targets: Set<string>): number => {
    if (!completedIds || !Array.isArray(completedIds)) return 0;
    return completedIds.filter((id) => targets.has(id)).length;
};

/**
 * Get Global Leaderboard with Real Users (Supabase)
 */
export async function fetchGlobalLeaderboard(
    user: UserProfile, 
    stats: UserStats, 
    currentElo: number,
    xp: number,
    sortBy: LeaderboardMetric = 'rating'
): Promise<LeaderboardEntry[]> {
    const data: LeaderboardEntry[] = [];

    // 1. Fetch Top Users from Supabase (Limit increased to find varied leaders)
    if (supabase) {
        // @ts-ignore
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('rating', { ascending: false }) // Default fetch order
            .limit(1000) as any;

        if (profiles && !error) {
            profiles.forEach((p: any) => {
                const completedLessons = Array.isArray(p.completed_lessons_ids)
                    ? p.completed_lessons_ids
                    : Array.isArray(p.completed_lessons)
                        ? p.completed_lessons
                        : [];

                const endgameCount = countCompletions(completedLessons, ENDGAME_LESSON_IDS);
                const openingCount = countCompletions(completedLessons, OPENING_LESSON_IDS);

                const entry: LeaderboardEntry = {
                    rank: 0,
                    username: p.username,
                    elo: p.rating,
                    country: p.country || 'US',
                    gamesPlayed: p.games_played || 0,
                    winRate: p.games_played > 0 ? Math.round((p.wins / p.games_played) * 100) : 0,
                    isUser: p.id === user.id,
                    wins: p.wins || 0,
                    losses: p.losses || 0,
                    draws: p.draws || 0,
                    puzzlesSolved: p.puzzles_solved || 0,
                    lessonsCompleted: p.lessons_completed || 0,
                    xp: p.xp || 0,
                    endgamesCompleted: endgameCount,
                    openingsCompleted: openingCount
                };

                // Merge Local Stats if it's the User
                if (p.id === user.id) {
                     const userCompletedLessons = user.completedLessons || [];
                     const userEndgameCount = countCompletions(userCompletedLessons, ENDGAME_LESSON_IDS);
                     const userOpeningCount = countCompletions(userCompletedLessons, OPENING_LESSON_IDS);

                     entry.xp = Math.max(entry.xp || 0, xp || 0);
                     entry.gamesPlayed = Math.max(entry.gamesPlayed || 0, stats.totalGames || 0);
                     entry.wins = Math.max(entry.wins || 0, stats.wins || 0);
                     entry.puzzlesSolved = Math.max(entry.puzzlesSolved || 0, stats.puzzlesSolved || 0);
                     entry.lessonsCompleted = Math.max(entry.lessonsCompleted || 0, stats.lessonsCompleted || 0);
                     entry.endgamesCompleted = Math.max(entry.endgamesCompleted || 0, stats.endgamesCompleted || 0, userEndgameCount);
                     entry.openingsCompleted = Math.max(entry.openingsCompleted || 0, stats.openingsCompleted || 0, userOpeningCount);
                     
                     if ((stats.totalGames || 0) > (p.games_played || 0)) {
                         entry.elo = currentElo;
                     }
                }

                data.push(entry);
            });
        }
    }

    // 2. Add Current User (if not already merged from Supabase)
    if (!data.some(d => d.isUser)) {
        const userCompletedLessons = user.completedLessons || [];
        const userEndgameCount = countCompletions(userCompletedLessons, ENDGAME_LESSON_IDS);
        const userOpeningCount = countCompletions(userCompletedLessons, OPENING_LESSON_IDS);

        const userEntry: LeaderboardEntry = {
            rank: 0,
            username: user.username,
            elo: currentElo,
            country: user.country || 'US',
            gamesPlayed: stats.totalGames,
            winRate: stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0,
            isUser: true,
            wins: stats.wins,
            losses: stats.losses,
            draws: stats.draws,
            puzzlesSolved: stats.puzzlesSolved,
            lessonsCompleted: stats.lessonsCompleted,
            xp: xp || 0,
            endgamesCompleted: Math.max(stats.endgamesCompleted, userEndgameCount),
            openingsCompleted: Math.max(stats.openingsCompleted, userOpeningCount)
        };

        data.push(userEntry);
    }

    // 3. Sort based on Metric
    data.sort((a, b) => {
        switch (sortBy) {
            case 'xp': return (b.xp || 0) - (a.xp || 0);
            case 'lessons': return (b.lessonsCompleted || 0) - (a.lessonsCompleted || 0);
            case 'puzzles': return (b.puzzlesSolved || 0) - (a.puzzlesSolved || 0);
            case 'endgames': return (b.endgamesCompleted || 0) - (a.endgamesCompleted || 0);
            case 'openings': return (b.openingsCompleted || 0) - (a.openingsCompleted || 0);
            case 'rating': default: return b.elo - a.elo;
        }
    });

    // 4. Assign Ranks
    return data.map((entry, index) => ({
        ...entry,
        rank: index + 1
    }));
}

/**
 * Get Country Leaderboard (User + Bots from same country)
 */
export async function fetchCountryLeaderboard(
    user: UserProfile, 
    stats: UserStats, 
    currentElo: number,
    xp: number,
    sortBy: LeaderboardMetric = 'rating'
): Promise<LeaderboardEntry[]> {
    const global = await fetchGlobalLeaderboard(user, stats, currentElo, xp, sortBy);
    const userCountry = user.country || 'US';

    // Filter by country
    const local = global.filter(e => e.country === userCountry);

    // Re-assign ranks for local context
    return local.map((entry, index) => ({
        ...entry,
        rank: index + 1
    }));
}
