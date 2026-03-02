/**
 * Lichess Tablebase API Service
 * Queries tablebase.lichess.ovh for positions with ≤7 pieces
 * Returns WDL (Win/Draw/Loss) and DTZ (Distance to Zeroing)
 */

export interface TablebaseResult {
    category: 'win' | 'draw' | 'loss' | 'unknown';
    dtz: number | null;  // Distance to zeroing (50-move rule reset)
    dtm: number | null;  // Distance to mate (if available)
    bestMove: string | null;
    wdl: number | null;  // -2 = loss, -1 = blessed loss, 0 = draw, 1 = cursed win, 2 = win
}

interface LichessTablebaseResponse {
    category: 'win' | 'maybe-win' | 'cursed-win' | 'draw' | 'blessed-loss' | 'maybe-loss' | 'loss';
    dtz: number | null;
    dtm: number | null;
    moves: Array<{
        uci: string;
        san: string;
        category: string;
        dtz: number | null;
        dtm: number | null;
    }>;
}

// Cache to avoid repeated API calls
const tablebaseCache = new Map<string, TablebaseResult>();

/**
 * Count pieces on the board from FEN
 */
function countPieces(fen: string): number {
    const position = fen.split(' ')[0];
    let count = 0;
    for (const char of position) {
        if (/[pnbrqkPNBRQK]/.test(char)) {
            count++;
        }
    }
    return count;
}

/**
 * Check if position is eligible for tablebase lookup (≤7 pieces)
 */
export function isTablebasePosition(fen: string): boolean {
    return countPieces(fen) <= 7;
}

/**
 * Query Lichess Tablebase API for a position
 */
export async function queryTablebase(fen: string): Promise<TablebaseResult | null> {
    // Check if position has too many pieces
    if (!isTablebasePosition(fen)) {
        return null;
    }

    // Check cache
    if (tablebaseCache.has(fen)) {
        return tablebaseCache.get(fen)!;
    }

    try {
        const encodedFen = encodeURIComponent(fen);
        const response = await fetch(
            `https://tablebase.lichess.ovh/standard?fen=${encodedFen}`,
            {
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            console.warn(`Tablebase API error: ${response.status}`);
            return null;
        }

        const data: LichessTablebaseResponse = await response.json();

        // Map Lichess category to our simplified category
        let category: TablebaseResult['category'] = 'unknown';
        let wdl: number | null = null;

        switch (data.category) {
            case 'win':
            case 'maybe-win':
            case 'cursed-win':
                category = 'win';
                wdl = data.category === 'cursed-win' ? 1 : 2;
                break;
            case 'draw':
                category = 'draw';
                wdl = 0;
                break;
            case 'loss':
            case 'maybe-loss':
            case 'blessed-loss':
                category = 'loss';
                wdl = data.category === 'blessed-loss' ? -1 : -2;
                break;
        }

        const result: TablebaseResult = {
            category,
            dtz: data.dtz,
            dtm: data.dtm,
            bestMove: data.moves?.[0]?.uci || null,
            wdl
        };

        // Cache result
        tablebaseCache.set(fen, result);

        return result;
    } catch (error) {
        console.error('Tablebase query failed:', error);
        return null;
    }
}

/**
 * Get display text for tablebase result
 */
export function getTablebaseDisplayText(result: TablebaseResult, sideToMove: 'w' | 'b'): string {
    if (result.dtm !== null) {
        const moves = Math.abs(result.dtm);
        return `M${moves}`;
    }

    if (result.dtz !== null) {
        const prefix = result.category === 'win' ? 'TB+' : 
                      result.category === 'loss' ? 'TB-' : 'TB=';
        return prefix + Math.abs(result.dtz);
    }

    switch (result.category) {
        case 'win': return 'TB Win';
        case 'loss': return 'TB Loss';
        case 'draw': return 'TB Draw';
        default: return '';
    }
}

/**
 * Convert tablebase result to centipawn-equivalent evaluation
 * for display in evaluation bar
 */
export function tablebaseToEval(result: TablebaseResult, sideToMove: 'w' | 'b'): { 
    evaluation: number; 
    isMate: boolean;
    mateIn?: number;
} {
    // DTM is available - this is mate
    if (result.dtm !== null) {
        const mateIn = Math.abs(result.dtm);
        // Positive = white wins, negative = black wins
        // DTM from API is from perspective of side to move
        const whiteWins = sideToMove === 'w' ? result.dtm > 0 : result.dtm < 0;
        return {
            evaluation: whiteWins ? mateIn : -mateIn,
            isMate: true,
            mateIn: mateIn
        };
    }

    // No DTM, use category for large eval
    switch (result.category) {
        case 'win':
            // Win from side to move perspective
            return {
                evaluation: sideToMove === 'w' ? 10000 : -10000,
                isMate: false
            };
        case 'loss':
            return {
                evaluation: sideToMove === 'w' ? -10000 : 10000,
                isMate: false
            };
        case 'draw':
            return {
                evaluation: 0,
                isMate: false
            };
        default:
            return {
                evaluation: 0,
                isMate: false
            };
    }
}

/**
 * Clear the tablebase cache
 */
export function clearTablebaseCache(): void {
    tablebaseCache.clear();
}
