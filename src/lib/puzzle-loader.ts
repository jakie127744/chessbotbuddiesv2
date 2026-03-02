/**
 * CB-301/CB-302: Lazy Puzzle Loader
 * 
 * Provides dynamic imports for puzzle data to reduce initial bundle size.
 * The 910KB puzzle file is not loaded until puzzles are actually needed.
 */

// Re-export types and themes (small, always included)
export type { LichessPuzzle } from './lichess-puzzles';
export { PUZZLE_THEMES } from './lichess-puzzles';
export type { ThemeKey } from './lichess-puzzles';

import type { LichessPuzzle } from './lichess-puzzles';

// Lazy-loaded puzzle data cache
let puzzleCache: LichessPuzzle[] | null = null;
let loadingPromise: Promise<LichessPuzzle[]> | null = null;

/**
 * Lazy load all puzzles (910KB loaded on-demand)
 * Returns cached data if already loaded
 */
export async function loadPuzzles(): Promise<LichessPuzzle[]> {
  // Return cached data
  if (puzzleCache) {
    return puzzleCache;
  }
  
  // Return existing loading promise to avoid duplicate imports
  if (loadingPromise) {
    return loadingPromise;
  }
  
  // Start loading
  performance.mark('puzzles-load-start');
  console.log('[PuzzleLoader] Starting dynamic import of puzzle data...');
  
  loadingPromise = import('./lichess-puzzles')
    .then((module) => {
      puzzleCache = module.PUZZLES;
      performance.mark('puzzles-load-end');
      performance.measure('puzzles-load-time', 'puzzles-load-start', 'puzzles-load-end');
      
      const measure = performance.getEntriesByName('puzzles-load-time')[0];
      console.log(`[PuzzleLoader] Loaded ${puzzleCache!.length} puzzles in ${measure?.duration.toFixed(0)}ms`);
      
      return puzzleCache!;
    });
  
  return loadingPromise;
}

/**
 * Get puzzles by theme (lazy loads if needed)
 */
export async function getPuzzlesByThemeLazy(theme: string): Promise<LichessPuzzle[]> {
  const puzzles = await loadPuzzles();
  return puzzles.filter(p => p.themes.includes(theme));
}

/**
 * Get puzzles by rating range (lazy loads if needed)
 */
export async function getPuzzlesByRatingLazy(minRating: number, maxRating: number): Promise<LichessPuzzle[]> {
  const puzzles = await loadPuzzles();
  return puzzles.filter(p => p.rating >= minRating && p.rating <= maxRating);
}

/**
 * Get random puzzle (lazy loads if needed)
 */
export async function getRandomPuzzleLazy(): Promise<LichessPuzzle> {
  const puzzles = await loadPuzzles();
  return puzzles[Math.floor(Math.random() * puzzles.length)];
}

/**
 * Get random puzzle by theme (lazy loads if needed)
 */
export async function getRandomPuzzleByThemeLazy(theme: string): Promise<LichessPuzzle | null> {
  const themePuzzles = await getPuzzlesByThemeLazy(theme);
  if (themePuzzles.length === 0) return null;
  return themePuzzles[Math.floor(Math.random() * themePuzzles.length)];
}

/**
 * Get puzzle count without loading full data
 * Returns estimated count based on known data
 */
export function getPuzzleCountEstimate(): number {
  if (puzzleCache) {
    return puzzleCache.length;
  }
  return 4108; // Known count from source file
}

/**
 * Check if puzzles are loaded
 */
export function isPuzzlesLoaded(): boolean {
  return puzzleCache !== null;
}

/**
 * Preload puzzles in background (for smooth UX)
 */
export function preloadPuzzles(): void {
  if (!puzzleCache && !loadingPromise) {
    // Fire and forget - loads in background
    loadPuzzles().catch(console.error);
  }
}

