/**
 * Opening Book Lookup Utility
 * Uses the exported JSON opening book for move suggestions
 */

export interface BookMove {
    move: string;
    depth: number;
    opening?: string;
    eco?: string;
}

export interface BookPosition {
    moves: BookMove[];
    openings: string[];
}

export interface OpeningBook {
    metadata: {
        total_openings: number;
        total_positions: number;
        exported_positions: number;
        min_frequency: number;
        version: string;
        generated: string;
    };
    positions: Record<string, BookPosition>;
}

let openingBookData: OpeningBook | null = null;
let isLoading = false;
let loadError: string | null = null;

/**
 * Load the opening book JSON file
 */
export async function loadOpeningBook(): Promise<void> {
    if (openingBookData) return; // Already loaded
    if (isLoading) return; // Currently loading
    
    isLoading = true;
    loadError = null;
    
    try {
        const response = await fetch('/opening-book.json');
        if (!response.ok) {
            throw new Error(`Failed to load opening book: ${response.statusText}`);
        }
        
        openingBookData = await response.json();
        console.log('[Opening Book] Loaded:', openingBookData?.metadata);
    } catch (error) {
        loadError = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Opening Book] Load error:', loadError);
    } finally {
        isLoading = false;
    }
}

/**
 * Normalize FEN for lookup (remove move counters)
 */
function normalizeFen(fen: string): string {
    const parts = fen.split(' ');
    return parts.slice(0, 4).join(' '); // Keep only position, turn, castling, en passant
}

/**
 * Get book move for a position
 * @param fen - FEN string of the position
 * @param weighted - If true, randomly select based on frequency. If false, return most common move
 * @returns Book move in SAN notation, or null if not in book
 */
export function getBookMove(fen: string, weighted: boolean = true): string | null {
    if (!openingBookData) {
        console.warn('[Opening Book] Not loaded yet. Call loadOpeningBook() first.');
        return null;
    }
    
    const normalizedFen = normalizeFen(fen);
    const position = openingBookData.positions[normalizedFen];
    
    if (!position || position.moves.length === 0) {
        return null; // Position not in book
    }
    
    if (!weighted || position.moves.length === 1) {
        // Return most common move (first in list)
        return position.moves[0].move;
    }
    
    // Weighted random selection - prefer earlier moves (lower depth = more common)
    // Invert depth so earlier moves have higher weight
    const maxDepth = Math.max(...position.moves.map(m => m.depth)) + 1;
    const weights = position.moves.map(m => maxDepth - m.depth);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < position.moves.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return position.moves[i].move;
        }
    }
    
    // Fallback to first move
    return position.moves[0].move;
}

/**
 * Get all book moves for a position with their metadata
 */
export function getBookMoves(fen: string): BookMove[] {
    if (!openingBookData) return [];
    
    const normalizedFen = normalizeFen(fen);
    const position = openingBookData.positions[normalizedFen];
    
    return position?.moves || [];
}

/**
 * Get opening names for a position
 */
export function getOpeningNames(fen: string): string[] {
    if (!openingBookData) return [];
    
    const normalizedFen = normalizeFen(fen);
    const position = openingBookData.positions[normalizedFen];
    
    return position?.openings || [];
}

/**
 * Check if a position is in the opening book
 */
export function isInBook(fen: string): boolean {
    if (!openingBookData) return false;
    
    const normalizedFen = normalizeFen(fen);
    return normalizedFen in openingBookData.positions;
}

/**
 * Get opening book statistics
 */
export function getBookStats() {
    return openingBookData?.metadata || null;
}

/**
 * Check if opening book is loaded
 */
export function isBookLoaded(): boolean {
    return openingBookData !== null;
}

/**
 * Get loading error if any
 */
export function getLoadError(): string | null {
    return loadError;
}
