'use client';

import { useState } from 'react';
import { X, Download, ExternalLink, Loader2, ChevronRight } from 'lucide-react';
import { fetchLichessGames, fetchChesscomGames, ImportedGame, extractUsername } from '@/lib/game-import';
import { saveGame } from '@/lib/game-storage';
import { useRouter } from 'next/navigation';

interface ImportGamesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Platform = 'lichess' | 'chesscom';

export function ImportGamesModal({ isOpen, onClose }: ImportGamesModalProps) {
    const router = useRouter();
    const [platform, setPlatform] = useState<Platform>('lichess');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [games, setGames] = useState<ImportedGame[]>([]);
    const [selectedGame, setSelectedGame] = useState<ImportedGame | null>(null);

    if (!isOpen) return null;

    const handleFetchGames = async () => {
        const cleanUsername = extractUsername(username);
        if (!cleanUsername) {
            setError('Please enter a username');
            return;
        }

        setLoading(true);
        setError(null);
        setGames([]);

        try {
            const fetchedGames = platform === 'lichess' 
                ? await fetchLichessGames(cleanUsername, 25)
                : await fetchChesscomGames(cleanUsername, 25);
            
            if (fetchedGames.length === 0) {
                setError('No games found for this user');
            } else {
                setGames(fetchedGames);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch games');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeGame = (game: ImportedGame) => {
        // ── Auto-save to localStorage + Supabase ──────────────────────
        // Normalize result: '1-0' → 'White wins', '0-1' → 'Black wins', else 'Draw'
        const resultLabel =
          game.result === '1-0' ? 'White wins' :
          game.result === '0-1' ? 'Black wins' : 'Draw';

        // Estimate move count from PGN (count move numbers like "1." "2." etc.)
        const moveCount = (game.pgn.match(/\d+\./g) || []).length;

        // Save asynchronously — don't block navigation
        saveGame({
          pgn: game.pgn,
          fen: '', // Final FEN not available from import listing; review page will have it
          result: resultLabel,
          playerColor: 'w', // Unknown at this stage; treated as White by default
          opponentName: game.white + ' vs ' + game.black,
          moveCount,
          timeControl: game.timeControl,
          whiteAvatar: game.whiteAvatar,
          blackAvatar: game.blackAvatar,
          platform: game.platform,
        });
        // ─────────────────────────────────────────────────────────────

        // Store the PGN in sessionStorage for the review page to pick up
        sessionStorage.setItem('importedPgn', game.pgn);
        sessionStorage.setItem('importedGameMeta', JSON.stringify({
            white: game.white,
            black: game.black,
            platform: game.platform,
            date: game.date,
            opening: game.opening,
            whiteAvatar: game.whiteAvatar,
            blackAvatar: game.blackAvatar
        }));
        
        // Navigate to review page with import flag
        router.push('/review?import=true');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border)] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
                    <h2 className="text-xl font-bold text-white">Import Game</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Platform Tabs */}
                <div className="flex border-b border-[var(--color-border)]">
                    <button
                        onClick={() => { setPlatform('lichess'); setGames([]); setError(null); }}
                        className={`flex-1 py-3 px-4 text-sm font-bold transition-colors ${
                            platform === 'lichess' 
                                ? 'text-[var(--color-primary)] bg-[var(--color-bg-tertiary)] border-b-2 border-[var(--color-primary)]' 
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[color-mix(in_srgb,var(--color-bg-tertiary)_50%,transparent)]'
                        }`}
                    >
                        ♞ Lichess
                    </button>
                    <button
                        onClick={() => { setPlatform('chesscom'); setGames([]); setError(null); }}
                        className={`flex-1 py-3 px-4 text-sm font-bold transition-colors ${
                            platform === 'chesscom' 
                                ? 'text-[var(--color-success)] bg-[var(--color-bg-tertiary)] border-b-2 border-[var(--color-success)]' 
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[color-mix(in_srgb,var(--color-bg-tertiary)_50%,transparent)]'
                        }`}
                    >
                        ♟ Chess.com
                    </button>
                </div>

                {/* Username Input */}
                <div className="p-5">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFetchGames()}
                            placeholder={`Enter ${platform === 'lichess' ? 'Lichess' : 'Chess.com'} username...`}
                            className="flex-1 bg-[var(--background)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                        />
                        <button
                            onClick={handleFetchGames}
                            disabled={loading || !username.trim()}
                            className="px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:bg-[var(--color-border)] disabled:text-[var(--color-text-muted)] text-[#1b1b1b] font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Download size={18} />
                            )}
                            Fetch
                        </button>
                    </div>
                    {error && (
                        <p className="mt-3 text-sm text-[#ff7b6b]">{error}</p>
                    )}
                </div>

                {/* Games List */}
                <div className="flex-1 overflow-y-auto px-5 pb-5 min-h-0">
                    {games.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm text-[#a8b4ce] mb-3">
                                Found {games.length} games. Click to analyze:
                            </p>
                            {games.map((game) => (
                                <button
                                    key={game.id}
                                    onClick={() => handleAnalyzeGame(game)}
                                    className="w-full bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg p-4 text-left transition-colors group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-white font-bold truncate">
                                                    {game.white} vs {game.black}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                    game.result === '1-0' ? 'bg-white text-black' :
                                                    game.result === '0-1' ? 'bg-black text-white border border-white/30' :
                                                    'bg-[#6b7a99] text-white'
                                                }`}>
                                                    {game.result}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-[#6b7a99]">
                                                <span>{game.date}</span>
                                                {game.timeControl && <span>• {game.timeControl}</span>}
                                                {game.opening && <span className="text-[#a8b4ce] truncate">• {game.opening}</span>}
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors shrink-0" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {!loading && games.length === 0 && !error && (
                        <div className="text-center py-12 text-[#6b7a99]">
                            <Download size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Enter a username to fetch recent games</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
