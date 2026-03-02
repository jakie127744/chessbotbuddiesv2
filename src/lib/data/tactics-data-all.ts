import { TacticPuzzle } from './tactics-blitz-data';

import forks from './generated_puzzles/puzzles_fork.json';
import pins from './generated_puzzles/puzzles_pin.json';
import skewers from './generated_puzzles/puzzles_skewer.json';
import discoveredAttacks from './generated_puzzles/puzzles_discoveredAttack.json';
import backranks from './generated_puzzles/puzzles_backRankMate.json';
import doubleAttacks from './generated_puzzles/puzzles_doubleAttack.json';
import deflections from './generated_puzzles/puzzles_deflection.json';
import clearances from './generated_puzzles/puzzles_clearance.json';
import decoys from './generated_puzzles/puzzles_decoy.json';
import overloading from './generated_puzzles/puzzles_overloading.json';
// import removeDefenders from './generated_puzzles/puzzles_remove_defender.json'; // Deprecated, using composite

import attraction from './generated_puzzles/puzzles_attraction.json';

// Polyfill helper to ensure 'moves' exists if missing (legacy support)
const ensureMoves = (puzzles: any[]): TacticPuzzle[] => {
    return puzzles.map(p => ({
        ...p,
        moves: p.moves || (p.move_uci ? [p.move_uci] : []),
        id: p.id || 'gen_' + Math.random().toString(36).substr(2, 9)
    })) as TacticPuzzle[];
};

export const TacticsDataAll = {
    getForks: () => ensureMoves(forks),
    getPins: () => ensureMoves(pins),
    getSkewers: () => ensureMoves(skewers),
    
    getDiscovered: () => ensureMoves(discoveredAttacks),
    getBackRanks: () => ensureMoves(backranks),
    
    // Double Attack = Forks + Discovered Attacks (Since double attack fetch yielded 0)
    getDoubleAttacks: () => [
        ...ensureMoves(forks),
        ...ensureMoves(discoveredAttacks)
    ],
    
    // Composite Themes
    getDeflections: () => ensureMoves(deflections),
    
    // Decoy = Attraction (Similar theme)
    getDecoys: () => ensureMoves(attraction),
    
    // Overloading = Deflection (closely related)
    getOverloadings: () => ensureMoves(deflections),
    
    // Remove Defender = Deflection + Clearance
    getRemoveDefenders: () => [
        ...ensureMoves(deflections),
        ...ensureMoves(clearances)
    ],
    
    getAll: () => {
        return [
            ...ensureMoves(forks), ...ensureMoves(pins), ...ensureMoves(discoveredAttacks), 
            ...ensureMoves(skewers), ...ensureMoves(backranks),
            ...ensureMoves(deflections), ...ensureMoves(clearances), 
            ...ensureMoves(attraction)
        ] as TacticPuzzle[];
    }
};
