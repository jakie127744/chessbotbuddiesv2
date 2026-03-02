// Puzzle Service - Fetches puzzles from Supabase instead of hardcoded file
import { supabase } from './supabaseClient';

export interface Puzzle {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
  popularity: number;
}

// Theme keys matching the original structure
export type ThemeKey = 
  | 'mateIn1' | 'mateIn2' | 'mateIn3' | 'fork' | 'pin' | 'skewer'
  | 'discoveredAttack' | 'doubleCheck' | 'sacrifice'
  | 'deflection' | 'decoy' | 'zugzwang' | 'backRankMate'
  | 'smotheredMate' | 'hangingPiece' | 'trappedPiece'
  | 'xRayAttack' | 'interference' | 'overloading'
  | 'underPromotion' | 'quietMove' | 'defensiveMove'
  | 'attraction' | 'clearance' | 'exposedKing';

// Map theme keys to database values
const themeMap: Record<ThemeKey, string> = {
  mateIn1: 'mateIn1',
  mateIn2: 'mateIn2',
  mateIn3: 'mateIn3',
  fork: 'fork',
  pin: 'pin',
  skewer: 'skewer',
  discoveredAttack: 'discoveredAttack',
  doubleCheck: 'doubleCheck',
  sacrifice: 'sacrifice',
  deflection: 'deflection',
  decoy: 'decoy',
  zugzwang: 'zugzwang',
  backRankMate: 'backRankMate',
  smotheredMate: 'smotheredMate',
  hangingPiece: 'hangingPiece',
  trappedPiece: 'trappedPiece',
  xRayAttack: 'xRayAttack',
  interference: 'interference',
  overloading: 'overloading',
  underPromotion: 'underPromotion',
  quietMove: 'quietMove',
  defensiveMove: 'defensiveMove',
  attraction: 'attraction',
  clearance: 'clearance',
  exposedKing: 'exposedKing',
};

/**
 * Get puzzles by theme
 */
export async function getPuzzlesByTheme(
  theme: ThemeKey,
  limit: number = 50
): Promise<Puzzle[]> {
  if (!supabase) {
    console.error('Supabase not initialized');
    return [];
  }

  const { data, error } = await supabase
    .from('puzzles')
    .select('*')
    .contains('themes', [themeMap[theme]])
    .order('popularity', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching puzzles:', error);
    return [];
  }

  return data || [];
}

/**
 * Get puzzles by rating range
 */
export async function getPuzzlesByRating(
  minRating: number,
  maxRating: number,
  limit: number = 50
): Promise<Puzzle[]> {
  if (!supabase) {
    console.error('Supabase not initialized');
    return [];
  }

  const { data, error } = await supabase
    .from('puzzles')
    .select('*')
    .gte('rating', minRating)
    .lte('rating', maxRating)
    .order('popularity', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching puzzles:', error);
    return [];
  }

  return data || [];
}

/**
 * Get random puzzles (for practice mode)
 */
export async function getRandomPuzzles(limit: number = 10): Promise<Puzzle[]> {
  if (!supabase) {
    console.error('Supabase not initialized');
    return [];
  }

  // Get total count first
  const { count } = await supabase
    .from('puzzles')
    .select('*', { count: 'exact', head: true });

  if (!count) return [];

  // Get random offset
  const randomOffset = Math.floor(Math.random() * Math.max(0, count - limit));

  const { data, error } = await supabase
    .from('puzzles')
    .select('*')
    .range(randomOffset, randomOffset + limit - 1);

  if (error) {
    console.error('Error fetching random puzzles:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single puzzle by ID
 */
export async function getPuzzleById(id: string): Promise<Puzzle | null> {
  if (!supabase) {
    console.error('Supabase not initialized');
    return null;
  }

  const { data, error } = await supabase
    .from('puzzles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching puzzle:', error);
    return null;
  }

  return data;
}

/**
 * Get puzzle count
 */
export async function getPuzzleCount(): Promise<number> {
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from('puzzles')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error getting puzzle count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get available themes with counts
 */
export async function getThemeCounts(): Promise<Record<string, number>> {
  // For now return a static map - can be enhanced with a database view later
  return {
    mateIn1: 500,
    mateIn2: 400,
    fork: 300,
    pin: 250,
    skewer: 200,
    // ... other themes
  };
}
