// Hugging Face Puzzle Dataset Integration
// Dataset: https://huggingface.co/datasets/quantum24/chess_puzzles_1k_in_pgn_san

import { LichessPuzzle } from './puzzle-types';

export interface HuggingFacePuzzle {
  FEN: string;
  PGN: string;
  Moves: string;  // UCI format (e.g., "c6c2")
  MovesSAN: string;  // SAN format (e.g., "Rc2#")
  Themes: string;  // Space-separated themes (e.g., "endgame mate mateIn1 oneMove")
}

interface HuggingFaceResponse {
  features: any[];
  rows: Array<{
    row_idx: number;
    row: HuggingFacePuzzle;
    truncated_cells: any[];
  }>;
  num_rows_total: number;
  num_rows_per_page: number;
  partial: boolean;
}

/**
 * Convert Hugging Face puzzle format to LichessPuzzle format
 */
function convertHFPuzzleToLichess(hfPuzzle: HuggingFacePuzzle, index: number): LichessPuzzle {
  const themes = hfPuzzle.Themes.split(' ').filter(t => t.length > 0);
  
  // Extract rating from PGN if available, otherwise estimate from themes
  let rating = 1500; // Default
  if (themes.includes('master')) rating = 2000;
  else if (themes.includes('endgame')) rating = 1600;
  else if (themes.includes('middlegame')) rating = 1400;
  
  return {
    id: `hf-${index}`,
    fen: hfPuzzle.FEN,
    moves: [hfPuzzle.Moves], // Single move for mate-in-1
    rating: rating,
    themes: themes,
    popularity: 50 // Default popularity
  };
}

/**
 * Fetch puzzles from Hugging Face dataset
 */
export async function getPuzzlesFromHuggingFace(
  limit: number = 100,
  offset: number = 0
): Promise<LichessPuzzle[]> {
  try {
    const url = `https://datasets-server.huggingface.co/rows?dataset=quantum24%2Fchess_puzzles_1k_in_pgn_san&config=default&split=train&offset=${offset}&length=${limit}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Hugging Face API error:', response.statusText);
      return [];
    }

    const data: HuggingFaceResponse = await response.json();
    
    // Convert to our format
    const puzzles = data.rows.map((row, idx) => 
      convertHFPuzzleToLichess(row.row, offset + idx)
    );

    console.log(`Fetched ${puzzles.length} puzzles from Hugging Face`);
    return puzzles;
  } catch (error) {
    console.error('Failed to fetch from Hugging Face:', error);
    return [];
  }
}

/**
 * Fetch multiple batches of puzzles with pagination to avoid API limits
 */
async function fetchPuzzlesWithPagination(
  totalNeeded: number,
  batchSize: number = 100
): Promise<LichessPuzzle[]> {
  const allPuzzles: LichessPuzzle[] = [];
  let offset = 0;
  
  while (allPuzzles.length < totalNeeded) {
    const batch = await getPuzzlesFromHuggingFace(batchSize, offset);
    if (batch.length === 0) break; // No more puzzles available
    
    allPuzzles.push(...batch);
    offset += batchSize;
    
    // Safety: Don't fetch more than 10 batches (1000 puzzles total)
    if (offset >= 1000) break;
  }
  
  return allPuzzles;
}

/**
 * Generic function to get puzzles by mate-in-X difficulty
 */
async function getMateInXPuzzlesByTheme(
  mateInX: number,
  difficulty: 'easy' | 'medium' | 'hard',
  limit: number = 10
): Promise<LichessPuzzle[]> {
  try {
    // Fetch puzzles with pagination (300 total should give us enough variety)
    const allPuzzles = await fetchPuzzlesWithPagination(300, 100);
    
    // Filter for mate-in-X puzzles
    const mateTheme = `mateIn${mateInX}`;
    const matePuzzles = allPuzzles.filter(p => 
      p.themes.includes(mateTheme) || 
      (mateInX === 1 && p.themes.includes('oneMove'))
    );

    console.log(`Found ${matePuzzles.length} mate-in-${mateInX} puzzles from HuggingFace`);

    // Group by difficulty based on themes
    let filtered: LichessPuzzle[] = [];
    
    if (difficulty === 'easy') {
      // Easy: Basic mates without complex themes
      filtered = matePuzzles.filter(p => {
        const complexThemes = ['master', 'kingsideAttack', 'queensideAttack', 'smotheredMate'];
        return !complexThemes.some(theme => p.themes.includes(theme));
      });
    } else if (difficulty === 'medium') {
      // Medium: Some tactical themes but not master level
      filtered = matePuzzles.filter(p => {
        const tacticalThemes = ['pin', 'fork', 'backRankMate', 'kingsideAttack'];
        const hasTactical = tacticalThemes.some(theme => p.themes.includes(theme));
        return hasTactical && !p.themes.includes('master');
      });
    } else {
      // Hard: Master games or complex mating patterns
      filtered = matePuzzles.filter(p => 
        p.themes.includes('master') || 
        p.themes.includes('smotheredMate') ||
        p.themes.includes('queensideAttack')
      );
    }

    // If we don't have enough after filtering, just take from all mate-in-X
    if (filtered.length < limit) {
      console.warn(`Not enough ${difficulty} mate-in-${mateInX} puzzles, using random ones`);
      filtered = matePuzzles;
    }

    // Shuffle and return requested count
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(limit, shuffled.length));
  } catch (error) {
    console.error(`Error fetching mate-in-${mateInX} themed puzzles:`, error);
    return [];
  }
}

/**
 * Get mate-in-1 puzzles from Hugging Face by difficulty
 */
export async function getMateIn1PuzzlesByTheme(
  difficulty: 'easy' | 'medium' | 'hard',
  limit: number = 10
): Promise<LichessPuzzle[]> {
  return getMateInXPuzzlesByTheme(1, difficulty, limit);
}

/**
 * Get mate-in-2 puzzles from Hugging Face by difficulty
 * For future use
 */
export async function getMateIn2PuzzlesByTheme(
  difficulty: 'easy' | 'medium' | 'hard',
  limit: number = 10
): Promise<LichessPuzzle[]> {
  return getMateInXPuzzlesByTheme(2, difficulty, limit);
}

/**
 * Get mate-in-3 puzzles from Hugging Face by difficulty
 * For future use
 */
export async function getMateIn3PuzzlesByTheme(
  difficulty: 'easy' | 'medium' | 'hard',
  limit: number = 10
): Promise<LichessPuzzle[]> {
  return getMateInXPuzzlesByTheme(3, difficulty, limit);
}
