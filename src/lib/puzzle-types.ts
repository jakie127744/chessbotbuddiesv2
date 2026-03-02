// Puzzle Types and Theme Definitions
// This file contains only types and metadata - NO puzzle data
// Puzzle data is loaded from Supabase database

export interface LichessPuzzle {
  id: string;
  fen: string;
  moves: string[];  // UCI format moves
  rating: number;
  themes: string[];
  popularity: number;
}

// RESTRICTED Theme definitions based on verified content
// Only these themes are available in the current dataset
export const PUZZLE_THEMES = {
  backRankMate: { name: 'Back Rank Mate', description: 'Checkmate on the back rank!', icon: '🏰', color: '#ef4444' },
  discoveredAttack: { name: 'Discovered Attack', description: 'Reveal an attack by moving another piece!', icon: '💥', color: '#ec4899' },
  doubleCheck: { name: 'Double Check', description: 'Check with two pieces at once!', icon: '✌️', color: '#a855f7' },
  fork: { name: 'Fork', description: 'Attack two pieces at once!', icon: '🍴', color: '#f59e0b' },
  pin: { name: 'Pin', description: 'Trap a piece against its king!', icon: '📌', color: '#8b5cf6' },
  promotion: { name: 'Promotion', description: 'Promote a pawn to a queen!', icon: '♛', color: '#ec4899' },
  sacrifice: { name: 'Sacrifice', description: 'Give up material to win more!', icon: '💎', color: '#f97316' },
  skewer: { name: 'Skewer', description: 'Attack through one piece to another!', icon: '🔪', color: '#6366f1' },
} as const;

export type ThemeKey = keyof typeof PUZZLE_THEMES;

// ============================================
// Supabase-powered puzzle fetching functions
// ============================================

import { supabase } from './supabaseClient';

/**
 * Get puzzles by theme from Supabase
 */
export async function getPuzzlesByThemeAsync(theme: ThemeKey, limit: number = 100): Promise<LichessPuzzle[]> {
  if (!supabase) return [];
  
  // Use fuzzy search for themes since they are stored as JSON strings or arrays in Supabase
  const { data, error } = await supabase
    .from('puzzles')
    .select('*')
    .ilike('themes', `%${theme}%`) // Use ilike for case-insensitive partial match
    .ilike('themes', `%${theme}%`) // Use ilike for case-insensitive partial match
    // .order('popularity', { ascending: false }) // Column missing
    .limit(limit);

  if (error) {
    console.error('Error fetching puzzles:', error);
    return [];
  }

  // Map Supabase rows to LichessPuzzle interface
  return (data || []).map(mapRowToPuzzle);
}

/**
 * Get random puzzle from Supabase
 */
export async function getRandomPuzzleAsync(): Promise<LichessPuzzle | null> {
  if (!supabase) return null;

  // Get count to calculate random offset
  const { count } = await supabase
    .from('puzzles')
    .select('*', { count: 'exact', head: true });

  if (!count) return null;

  // Random offset
  const offset = Math.floor(Math.random() * count);

  const { data, error } = await supabase
    .from('puzzles')
    .select('*')
    .range(offset, offset)
    .single();

  if (error) {
    console.error('Error fetching random puzzle:', error);
    return null;
  }

  return data ? mapRowToPuzzle(data) : null;
}

/**
 * Get random puzzle by theme from Supabase
 */
export async function getRandomPuzzleByThemeAsync(theme: ThemeKey): Promise<LichessPuzzle | null> {
  // Build a query purely for one random row is hard with simple Supabase queries efficiently
  // for now, we fetch a batch and pick one, or use a Postgres function if available.
  // We'll stick to fetching a batch for simplicity as per previous implementation.
  const puzzles = await getPuzzlesByThemeAsync(theme, 50);
  if (puzzles.length === 0) return null;
  return puzzles[Math.floor(Math.random() * puzzles.length)];
}

/**
 * Get puzzles filtered by rating range
 */
export async function getPuzzlesByRatingAsync(
  minRating: number, 
  maxRating: number, 
  theme?: ThemeKey,
  limit: number = 50
): Promise<LichessPuzzle[]> {
  if (!supabase) return [];

  let query = supabase
    .from('puzzles')
    .select('*')
    .gte('rating', minRating)
    .lte('rating', maxRating)
    .gte('rating', minRating)
    .lte('rating', maxRating)
    // .order('popularity', { ascending: false }) // Column missing
    .limit(limit);

  if (theme) {
    query = query.ilike('themes', `%${theme}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching puzzles by rating:', JSON.stringify(error, null, 2));
    return [];
  }

  return (data || []).map(mapRowToPuzzle);
}

// Helper to ensure data format match
function mapRowToPuzzle(row: any): LichessPuzzle {
    return {
        id: row.id,
        fen: row.fen,
        moves: parseField(row.moves),
        rating: row.rating,
        themes: parseField(row.themes),
        popularity: row.popularity || 0
    };
}

// Helper to parse fields that might be arrays, strings, or JSON-encoded strings
function parseField(value: any): string[] {
    if (!value) return [];
    
    // If it's already an array
    if (Array.isArray(value)) {
        // HOSTAGE SITUATION FIX:
        // Supabase/Postgres sometimes returns text[] columns as ["[\"a\",\"b\"]"] 
        // (an array containing a single JSON string) when imported from certain CSV formats.
        if (value.length === 1 && typeof value[0] === 'string' && value[0].trim().startsWith('[')) {
            try {
                const parsed = JSON.parse(value[0]);
                if (Array.isArray(parsed)) return parsed;
            } catch (e) {
                // Not JSON, just return original array
            }
        }
        return value;
    }

    // If it's a string, it could be JSON or space-separated
    if (typeof value === 'string') {
        try {
            // Try parsing as JSON first
            if (value.trim().startsWith('[')) {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            // Ignore JSON error
        }
        
        // Fallback: split by space (standard Lichess format)
        return value.split(' ');
    }

    return [];
}


// ============================================
// DEPRECATED: Synchronous functions (for backward compatibility)
// These will return empty arrays - use async versions instead
// ============================================

/** @deprecated Use getPuzzlesByThemeAsync instead */
export function getPuzzlesByTheme(_theme: ThemeKey): LichessPuzzle[] {
  console.warn('getPuzzlesByTheme is deprecated. Use getPuzzlesByThemeAsync instead.');
  return [];
}

/** @deprecated Use getRandomPuzzleAsync instead */
export function getRandomPuzzle(): LichessPuzzle {
  console.warn('getRandomPuzzle is deprecated. Use getRandomPuzzleAsync instead.');
  return {
    id: 'loading',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: [],
    rating: 0,
    themes: [],
    popularity: 0
  };
}

/** @deprecated Use getRandomPuzzleByThemeAsync instead */
export function getRandomPuzzleByTheme(_theme: ThemeKey): LichessPuzzle | null {
  console.warn('getRandomPuzzleByTheme is deprecated. Use getRandomPuzzleByThemeAsync instead.');
  return null;
}
