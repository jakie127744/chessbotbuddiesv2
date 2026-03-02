'use client';

/**
 * Game Import Service for Lichess and Chess.com
 * Fetches recent games from external platforms for analysis
 */

export interface ImportedGame {
    id: string;
    platform: 'lichess' | 'chesscom';
    pgn: string;
    white: string;
    black: string;
    whiteRating?: number;
    blackRating?: number;
    whiteCountry?: string;
    blackCountry?: string;
    result: string;
    date: string;
    timeControl?: string;
    opening?: string;
    url?: string;
    whiteAvatar?: string;
    blackAvatar?: string;
}

// ============================================================
// LICHESS API
// ============================================================

/**
 * Fetch recent games from Lichess
 * API: https://lichess.org/api/games/user/{username}
 */
export async function fetchLichessGames(username: string, max: number = 20): Promise<ImportedGame[]> {
    try {
        const response = await fetch(
            `https://lichess.org/api/games/user/${encodeURIComponent(username)}?max=${max}&pgnInJson=true&opening=true`,
            {
                headers: {
                    'Accept': 'application/x-ndjson'
                }
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`User "${username}" not found on Lichess`);
            }
            throw new Error(`Lichess API error: ${response.status}`);
        }

        const text = await response.text();
        const lines = text.trim().split('\n').filter(line => line.trim());
        
        // Fetch user profile to get avatar
        let userAvatar: string | undefined;
        try {
            const profileRes = await fetch(`https://lichess.org/api/user/${encodeURIComponent(username)}`);
            if (profileRes.ok) {
                 const profile = await profileRes.json();
                 // Lichess doesn't always perform full auth so we just check what we get
                 // Actually Lichess API user object has 'profile' but typically no direct avatar URL unless we look at specific fields?
                 // Checking docs: Lichess does NOT provide avatar URLs in public API easily? 
                 // Wait, standard lichess API response for user does NOT have avatar URL. The avatar is typically at specific URL pattern if they have one?
                 // Or maybe profile.image? No.
                 // Actually, Lichess avatars are not easily exposed. 
                 // For now, let's leave valid empty. OR use a trick?
                 // Wait, I recall seeing it in some endpoints.
                 // Let's Skip Lichess Avatar for now to avoid breaking things, or use a known pattern if confirmed.
            }
        } catch (e) {
            console.warn('Failed to fetch Lichess profile', e);
        }

        const games: ImportedGame[] = [];
        
        for (const line of lines) {
            try {
                const game = JSON.parse(line);
                
                // Extract player names - check user.name first, then aiLevel, then fallback
                let whiteName = 'Anonymous';
                let whiteRating: number | undefined = undefined;
                if (game.players?.white?.user?.name) {
                    whiteName = game.players.white.user.name;
                    whiteRating = game.players.white.rating;
                } else if (game.players?.white?.aiLevel) {
                    whiteName = `Stockfish Level ${game.players.white.aiLevel}`;
                }
                
                let blackName = 'Anonymous';
                let blackRating: number | undefined = undefined;
                if (game.players?.black?.user?.name) {
                    blackName = game.players.black.user.name;
                    blackRating = game.players.black.rating;
                } else if (game.players?.black?.aiLevel) {
                    blackName = `Stockfish Level ${game.players.black.aiLevel}`;
                }
                
                // Parse result
                let result = '½-½';
                if (game.winner === 'white') result = '1-0';
                else if (game.winner === 'black') result = '0-1';

                // Determine avatars (only if we had one, which we don't for Lichess yet)
                // If we found a way:
                const wAvatar = whiteName.toLowerCase() === username.toLowerCase() ? userAvatar : undefined;
                const bAvatar = blackName.toLowerCase() === username.toLowerCase() ? userAvatar : undefined;
                
                games.push({
                    id: game.id,
                    platform: 'lichess',
                    pgn: game.pgn || '',
                    white: whiteName,
                    black: blackName,
                    whiteRating,
                    blackRating,
                    whiteAvatar: wAvatar,
                    blackAvatar: bAvatar,
                    result,
                    date: new Date(game.createdAt).toLocaleDateString(),
                    timeControl: formatTimeControl(game.clock?.initial, game.clock?.increment),
                    opening: game.opening?.name,
                    url: `https://lichess.org/${game.id}`
                });
            } catch (e) {
                console.warn('Failed to parse Lichess game:', e);
            }
        }
        
        return games;
    } catch (error) {
        console.error('Lichess fetch error:', error);
        throw error;
    }
}

// ============================================================
// CHESS.COM API
// ============================================================

/**
 * Fetch recent games from Chess.com
 * API: https://api.chess.com/pub/player/{username}/games/{YYYY}/{MM}
 */
export async function fetchChesscomGames(username: string, max: number = 20): Promise<ImportedGame[]> {
    try {
        // First, get the list of available archives
        const archivesResponse = await fetch(
            `https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}/games/archives`
        );
        
        if (!archivesResponse.ok) {
            if (archivesResponse.status === 404) {
                throw new Error(`User "${username}" not found on Chess.com`);
            }
            throw new Error(`Chess.com API error: ${archivesResponse.status}`);
        }
        
        const archivesData = await archivesResponse.json();
        const archives: string[] = archivesData.archives || [];
        
        if (archives.length === 0) {
            return [];
        }
        
        // Fetch most recent archive (last in the list)
        const recentArchive = archives[archives.length - 1];
        const gamesResponse = await fetch(recentArchive);
        
        if (!gamesResponse.ok) {
            throw new Error(`Failed to fetch Chess.com games`);
        }
        
        const gamesData = await gamesResponse.json();
        const rawGames = gamesData.games || [];
        
        // Take most recent games up to max
        const recentGames = rawGames.slice(-max).reverse();
        
        // Fetch user profile to get avatar
        let userAvatar: string | undefined;
        try {
            const profileRes = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}`);
            if (profileRes.ok) {
                 const profile = await profileRes.json();
                 userAvatar = profile.avatar;
            }
        } catch (e) {
            console.warn('Failed to fetch Chess.com profile', e);
        }

        const games: ImportedGame[] = [];
        
        for (const game of recentGames) {
            // Parse result
            let result = '½-½';
            if (game.white?.result === 'win') result = '1-0';
            else if (game.black?.result === 'win') result = '0-1';

            const whiteUsername = game.white?.username || 'Unknown';
            const blackUsername = game.black?.username || 'Unknown';

            const wAvatar = whiteUsername.toLowerCase() === username.toLowerCase() ? userAvatar : undefined;
            const bAvatar = blackUsername.toLowerCase() === username.toLowerCase() ? userAvatar : undefined;
            
            games.push({
                id: game.uuid || game.url?.split('/').pop() || String(Date.now()),
                platform: 'chesscom',
                pgn: game.pgn || '',
                white: whiteUsername,
                black: blackUsername,
                whiteRating: game.white?.rating,
                blackRating: game.black?.rating,
                whiteCountry: game.white?.country?.split('/').pop()?.toUpperCase(), // Extract country code from URL
                blackCountry: game.black?.country?.split('/').pop()?.toUpperCase(),
                whiteAvatar: wAvatar,
                blackAvatar: bAvatar,
                result,
                date: new Date(game.end_time * 1000).toLocaleDateString(),
                timeControl: game.time_class || 'Unknown',
                url: game.url
            });
        }
        
        return games;
    } catch (error) {
        console.error('Chess.com fetch error:', error);
        throw error;
    }
}

// ============================================================
// HELPERS
// ============================================================

function formatTimeControl(initialSeconds?: number, incrementSeconds?: number): string {
    if (!initialSeconds) return 'Unknown';
    
    const minutes = Math.floor(initialSeconds / 60);
    const increment = incrementSeconds || 0;
    
    if (increment > 0) {
        return `${minutes}+${increment}`;
    }
    return `${minutes} min`;
}

/**
 * Detect which platform a username might belong to
 * (This is just a helper, users should select the platform explicitly)
 */
export function detectPlatform(input: string): 'lichess' | 'chesscom' | 'unknown' {
    if (input.includes('lichess.org')) return 'lichess';
    if (input.includes('chess.com')) return 'chesscom';
    return 'unknown';
}

/**
 * Extract username from a URL if provided
 */
export function extractUsername(input: string): string {
    // Lichess URL: https://lichess.org/@/username or https://lichess.org/username
    const lichessMatch = input.match(/lichess\.org\/@?\/([^\/\?]+)/);
    if (lichessMatch) return lichessMatch[1];
    
    // Chess.com URL: https://www.chess.com/member/username
    const chesscomMatch = input.match(/chess\.com\/member\/([^\/\?]+)/);
    if (chesscomMatch) return chesscomMatch[1];
    
    // Just return the input as-is (assume it's a username)
    return input.trim();
}
