// src/lib/chess-puzzles-api.ts
// Integration with https://github.com/Ali-Raza764/chess_puzzles_api for Mate-in-X challenges
import { LichessPuzzle } from './lichess-puzzles';

interface ApiPuzzleResponse {
  PuzzleId: string;
  FEN: string;
  Moves: string;
  Rating: number;
  Themes: string;
  Popularity: number;
}

/**
 * Fetches puzzles from the public chess-puzzles-api.vercel.app.
 * Maps the response to our internal LichessPuzzle format.
 */
export async function fetchPuzzlesFromExternalApi(theme: string = 'mateIn3', count: number = 5): Promise<LichessPuzzle[]> {
  try {
    // We add a random start index so we don't always get the exact same puzzles.
    // The API has a limited number of puzzles for specific themes in the free tier, 
    // so we use a safe upper bound (100) to ensure we always get data.
    const randomStart = Math.floor(Math.random() * 100); 
    const response = await fetch(`https://chess-puzzles-api.vercel.app/puzzles?themes=${theme}&limit=${count}&start=${randomStart}`);
    
    if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
    }

    const data: ApiPuzzleResponse[] = await response.json();
    
    // Map their capitalized keys and space-separated moves to our LichessPuzzle format
    return data.map(p => ({
        id: p.PuzzleId,
        fen: p.FEN,
        moves: p.Moves.split(' '),
        rating: p.Rating,
        themes: p.Themes.split(' '),
        popularity: p.Popularity
    }));
  } catch (error) {
    console.error("Failed to fetch from chess_puzzles_api:", error);
    return [];
  }
}
