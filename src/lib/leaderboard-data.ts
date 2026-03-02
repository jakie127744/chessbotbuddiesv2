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
}

import { supabase } from "./supabaseClient";
import { LESSON_TRACKS } from "./lesson-data";

export type LeaderboardMetric = 'rating' | 'xp' | 'lessons' | 'puzzles' | 'endgames';

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
                // Calculate Endgames
                let endgameCount = 0;
                if (p.completed_lessons_ids && Array.isArray(p.completed_lessons_ids)) {
                     const endgameIds = new Set<string>();
                     Object.values(LESSON_TRACKS).forEach(track => {
                         track.forEach(lesson => {
                             if (lesson.type === 'endgame') endgameIds.add(lesson.id);
                         });
                     });
                     endgameCount = p.completed_lessons_ids.filter((id: string) => endgameIds.has(id)).length;
                }

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
                    endgamesCompleted: endgameCount
                };

                // Merge Local Stats if it's the User
                if (p.id === user.id) {
                     let userEndgameCount = 0;
                     if (user.completedLessons) {
                        const endgameIds = new Set<string>();
                        Object.values(LESSON_TRACKS).forEach(track => {
                             track.forEach(lesson => {
                                 if (lesson.type === 'endgame') endgameIds.add(lesson.id);
                             });
                        });
                        userEndgameCount = user.completedLessons.filter((id: string) => endgameIds.has(id)).length;
                     }

                     entry.xp = Math.max(entry.xp || 0, xp || 0);
                     entry.gamesPlayed = Math.max(entry.gamesPlayed || 0, stats.totalGames || 0);
                     entry.wins = Math.max(entry.wins || 0, stats.wins || 0);
                     entry.puzzlesSolved = Math.max(entry.puzzlesSolved || 0, stats.puzzlesSolved || 0);
                     entry.lessonsCompleted = Math.max(entry.lessonsCompleted || 0, stats.lessonsCompleted || 0);
                     entry.endgamesCompleted = Math.max(entry.endgamesCompleted || 0, userEndgameCount);
                     
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
        // Calculate User Endgames
        let userEndgameCount = 0;
        
        if (user.completedLessons) {
             const endgameIds = new Set<string>();
             Object.values(LESSON_TRACKS).forEach(track => {
                 track.forEach(lesson => {
                     if (lesson.type === 'endgame') endgameIds.add(lesson.id);
                 });
             });
             userEndgameCount = user.completedLessons.filter((id) => endgameIds.has(id)).length;
        }

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
            endgamesCompleted: userEndgameCount
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
