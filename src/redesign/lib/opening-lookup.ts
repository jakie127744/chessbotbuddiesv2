/**
 * Opening Lookup Utility
 * Uses the simple FEN-to-opening-name mapping from opening.json
 */

// Simple mapping: FEN position string -> Opening Name
type OpeningMap = Record<string, string>;

let openingData: OpeningMap | null = null;
let isLoading = false;

/**
 * Load the opening lookup data from opening.json
 */
export async function loadOpeningLookup(): Promise<void> {
    if (openingData) return; // Already loaded
    if (isLoading) return; // Currently loading
    
    isLoading = true;
    
    try {
        const response = await fetch('/opening.json');
        if (!response.ok) {
            throw new Error(`Failed to load opening.json: ${response.statusText}`);
        }
        
        openingData = await response.json();
        console.log('[Opening Lookup] Loaded', Object.keys(openingData || {}).length, 'positions');
    } catch (error) {
        console.error('[Opening Lookup] Load error:', error);
    } finally {
        isLoading = false;
    }
}

/**
 * Normalize FEN for lookup
 * The opening.json uses FEN without move counters (just position part)
 */
function normalizeFen(fen: string): string {
    // The opening.json keys appear to be just the piece placement (first part of FEN)
    const parts = fen.split(' ');
    return parts[0]; // Just the piece positions
}

/**
 * Get opening name for a given FEN position
 * @param fen - Full FEN string
 * @returns Opening name or null if not found
 */
export function getOpeningName(fen: string): string | null {
    if (!openingData) {
        return null;
    }
    
    const normalizedFen = normalizeFen(fen);
    return openingData[normalizedFen] || null;
}

/**
 * Find the opening name by checking multiple positions (for tracking during game)
 * @param fens - Array of FEN strings from game history
 * @returns The most specific (deepest) opening name found
 */
export function findDeepestOpening(fens: string[]): string | null {
    if (!openingData) return null;
    
    // Check from the latest position backwards
    for (let i = fens.length - 1; i >= 0; i--) {
        const name = getOpeningName(fens[i]);
        if (name) {
            return name;
        }
    }
    
    return null;
}

/**
 * Check if opening data is loaded
 */
export function isOpeningLookupLoaded(): boolean {
    return openingData !== null;
}

// --- MASTER STATS (Lichess API) ---
export interface MasterStats {
    moves: { san: string; white: number; draws: number; black: number }[];
    opening?: { eco: string; name: string };
    famousPlayers?: string[];
}

const masterCache = new Map<string, MasterStats>();

/**
 * Fetch master-level statistics for a position from Lichess
 */
export async function fetchMasterStats(fen: string): Promise<MasterStats | null> {
    const normalized = normalizeFen(fen);
    if (masterCache.has(normalized)) return masterCache.get(normalized)!;

    try {
        const url = `https://explorer.lichess.ovh/masters?fen=${encodeURIComponent(fen)}&topGames=5`;
        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();
        const stats: MasterStats = {
            moves: data.moves.map((m: any) => ({
                san: m.san,
                white: m.white,
                draws: m.draws,
                black: m.black
            })),
            opening: data.opening,
            famousPlayers: data.topGames?.map((g: any) => g.white.name + ' vs ' + g.black.name) || []
        };

        masterCache.set(normalized, stats);
        return stats;
    } catch (e) {
        console.error('[Opening Lookup] Master stats fetch error:', e);
        return null;
    }
}
