import POLGAR_DATA from './data/polgar-puzzles.json';
import { LichessPuzzle } from './puzzle-types';

export interface PolgarPuzzleRaw {
    problemid: number;
    first: string;
    type: string;
    fen: string;
    moves: string;
}

export const getPolgarPuzzles = (type: 'Mate in One' | 'Mate in Two' | 'Mate in Three', count: number = 20): LichessPuzzle[] => {
    // 1. Filter by type
    const puzzles = (POLGAR_DATA.problems as PolgarPuzzleRaw[]).filter(p => p.type === type);

    // 2. Select random puzzles
    const selected = [];
    const total = puzzles.length;
    
    // Simple random selection
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * total);
        selected.push(puzzles[randomIndex]);
    }

    // 3. Convert to LichessPuzzle format
    return selected.map(p => convertPolgarToLichess(p));
};

const convertPolgarToLichess = (raw: PolgarPuzzleRaw): LichessPuzzle => {
    // Parse moves: "h5-f3;a6-a5;f3-e4" -> ["h5f3", "a6a5", "f3e4"]
    const moveStr = raw.moves || "";
    const moves = moveStr.split(';').map(m => m.replace('-', '')); // Remove dashes

    return {
        id: `polgar-${raw.problemid}`,
        fen: raw.fen,
        moves: moves,
        rating: 1500, // Placeholder rating
        themes: [
            'mate', 
            raw.type === 'Mate in One' ? 'mateIn1' : 
            raw.type === 'Mate in Two' ? 'mateIn2' : 'mateIn3',
            'composed'
        ],
        popularity: 100
    };
};
