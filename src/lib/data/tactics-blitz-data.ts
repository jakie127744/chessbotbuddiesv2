
import forks from './generated_puzzles/puzzles_fork.json';
import pins from './generated_puzzles/puzzles_pin.json';
import discChecks from './generated_puzzles/puzzles_discovered_check.json';

export interface TacticPuzzle {
    id?: string;
    fen: string;
    moves: string[];
    rating?: number;
    themes?: string[];
    // Deprecated fields (optional for backward compat if needed temporarily)
    solution?: string[]; 
    move_uci?: string;
}

const adaptRaw = (data: any[]): TacticPuzzle[] => {
    return data.map(p => ({
        ...p,
        // Ensure moves exists. If raw data has 'move_uci', use it.
        // If raw data has 'moves' (Lichess), use it.
        moves: p.moves || (p.move_uci ? [p.move_uci] : []),
        id: p.id || 'gen_' + Math.random().toString(36).substr(2, 9)
    })) as TacticPuzzle[];
};

export const TacticsBlitzData = {
    forks: adaptRaw(forks),
    pins: adaptRaw(pins),
    discoveredChecks: adaptRaw(discChecks),
    
    // Helper to get a mixed bag
    getAll: () => {
        return [
            ...adaptRaw(forks),
            ...adaptRaw(pins),
            ...adaptRaw(discChecks)
        ];
    },
    getForks: () => adaptRaw(forks),
    getPins: () => adaptRaw(pins),
    getDiscoveredChecks: () => adaptRaw(discChecks)
};
