// Game History Storage - localStorage (local) + Supabase (persistent cloud)
import { supabase } from '@/redesign/lib/supabaseClient';

export interface SavedGame {
  id: string;
  pgn: string;
  fen: string; // Final position
  result: string; // 'White wins', 'Black wins', 'Draw', etc.
  playerColor: 'w' | 'b';
  opponentName: string;
  date: Date;
  moveCount: number;
  timeControl?: string;
  whiteAvatar?: string;
  blackAvatar?: string;
  platform?: 'local' | 'lichess' | 'chesscom' | string;
}

const STORAGE_KEY = 'chess-game-history';
const MAX_GAMES = 100; // Keep last 100 games locally

// ─────────────────────────────────────────────
// LOCAL STORAGE HELPERS
// ─────────────────────────────────────────────

export function saveGame(game: Omit<SavedGame, 'id' | 'date'>): SavedGame {
  const savedGame: SavedGame = {
    ...game,
    id: `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date: new Date()
  };

  // 1. Save to localStorage immediately
  const history = getGameHistory();
  history.unshift(savedGame);
  if (history.length > MAX_GAMES) {
    history.splice(MAX_GAMES);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

  // 2. Dual-write to Supabase asynchronously (fire-and-forget with error log)
  saveGameToSupabase(savedGame)
    .then(() => incrementProfileGameStats(savedGame))
    .catch(err =>
      console.warn('[game-storage] Supabase save failed (game kept locally):', err)
    );

  return savedGame;
}

export function getGameHistory(): SavedGame[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const games = JSON.parse(stored);
    return games.map((g: any) => ({ ...g, date: new Date(g.date) }));
  } catch {
    return [];
  }
}

export function getGameById(id: string): SavedGame | undefined {
  return getGameHistory().find(g => g.id === id);
}

export function deleteGame(id: string): void {
  // 1. Remove from localStorage
  const filtered = getGameHistory().filter(g => g.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

  // 2. Delete from Supabase asynchronously
  deleteGameFromSupabase(id).catch(err =>
    console.warn('[game-storage] Supabase delete failed:', err)
  );
}

export function clearGameHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getGameStats() {
  const history = getGameHistory();

  let wins = 0;
  let losses = 0;
  let draws = 0;

  history.forEach(game => {
    if (game.result.toLowerCase().includes('win')) {
      if (
        (game.result.includes('White') && game.playerColor === 'w') ||
        (game.result.includes('Black') && game.playerColor === 'b')
      ) {
        wins++;
      } else {
        losses++;
      }
    } else if (game.result.toLowerCase().includes('draw')) {
      draws++;
    }
  });

  return {
    totalGames: history.length,
    wins,
    losses,
    draws,
    winRate: history.length > 0 ? Math.round((wins / history.length) * 100) : 0,
  };
}

// ─────────────────────────────────────────────
// SUPABASE HELPERS
// ─────────────────────────────────────────────

/** Returns the currently authenticated user's UUID, or null if not logged in. */
async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Upserts a single game into the Supabase game_history table. */
export async function saveGameToSupabase(game: SavedGame): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId || !supabase) return;

  const { error } = await (supabase as any).from('game_history').upsert({
    id: game.id,
    user_id: userId,
    pgn: game.pgn,
    fen: game.fen,
    result: game.result,
    player_color: game.playerColor,
    opponent_name: game.opponentName,
    move_count: game.moveCount,
    time_control: game.timeControl ?? null,
    white_avatar: game.whiteAvatar ?? null,
    black_avatar: game.blackAvatar ?? null,
    platform: game.platform ?? 'local',
    created_at: game.date.toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}

/** Fetches all games from Supabase for the current user, newest first. */
export async function getGameHistoryFromSupabase(): Promise<SavedGame[]> {
  const userId = await getCurrentUserId();
  if (!userId || !supabase) return [];

  const { data, error } = await (supabase as any)
    .from('game_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(MAX_GAMES);

  if (error || !data) return [];

  return (data as any[]).map(row => ({
    id: row.id as string,
    pgn: row.pgn as string,
    fen: row.fen as string,
    result: row.result as string,
    playerColor: row.player_color as 'w' | 'b',
    opponentName: row.opponent_name as string,
    date: new Date(row.created_at as string),
    moveCount: row.move_count as number,
    timeControl: (row.time_control as string | null) ?? undefined,
    whiteAvatar: (row.white_avatar as string | null) ?? undefined,
    blackAvatar: (row.black_avatar as string | null) ?? undefined,
    platform: (row.platform as string | null) ?? 'local',
  }));
}

/** Deletes a single game from Supabase by ID. */
export async function deleteGameFromSupabase(id: string): Promise<void> {
  if (!supabase) return;
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { error } = await (supabase as any)
    .from('game_history')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}

/**
 * Syncs Supabase games to localStorage so fast local reads stay up to date.
 * Merges by ID — Supabase wins on conflict (server is source of truth).
 */
export async function syncFromSupabase(): Promise<SavedGame[]> {
  const remote = await getGameHistoryFromSupabase();
  if (remote.length === 0) return getGameHistory(); // No session or no data

  // Merge remote over local (remote is source of truth)
  const localById = new Map(getGameHistory().map(g => [g.id, g]));
  const remoteById = new Map(remote.map(g => [g.id, g]));

  // Combine: remote + any local-only games (platform === 'local' that aren't in remote yet)
  const localOnly = getGameHistory().filter(g => !remoteById.has(g.id));
  const merged = [...remote, ...localOnly].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, MAX_GAMES);

  // Persist merged list to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

/**
 * Increments games_played + wins/losses/draws on the Supabase profiles table.
 * Called after a game is successfully saved to game_history.
 * Uses read-then-write to safely increment the counters.
 */
async function incrementProfileGameStats(game: SavedGame): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId || !supabase) return;

  // Determine outcome from the saved game
  const resultLower = game.result.toLowerCase();
  const playerWon =
    (resultLower.includes('white') && game.playerColor === 'w') ||
    (resultLower.includes('black') && game.playerColor === 'b');
  const isDraw = resultLower.includes('draw');
  const playerLost = !playerWon && !isDraw;

  // Fetch current counters from profiles
  const { data: profile, error: fetchErr } = await (supabase as any)
    .from('profiles')
    .select('games_played, wins, losses, draws')
    .eq('id', userId)
    .single();

  if (fetchErr || !profile) {
    console.warn('[game-storage] Could not fetch profile for stats update:', fetchErr?.message);
    return;
  }

  const updates: Record<string, number> = {
    games_played: (profile.games_played || 0) + 1,
    wins:         (profile.wins || 0)         + (playerWon  ? 1 : 0),
    losses:       (profile.losses || 0)       + (playerLost ? 1 : 0),
    draws:        (profile.draws || 0)        + (isDraw     ? 1 : 0),
  };

  const { error: updateErr } = await (supabase as any)
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (updateErr) {
    console.warn('[game-storage] Profile stats update failed:', updateErr.message);
  }
}
