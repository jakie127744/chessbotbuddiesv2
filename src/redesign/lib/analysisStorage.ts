import { supabase } from './supabaseClient';
import { getUserProfile } from './user-profile';
import type { EngineLine } from '@/hooks/useLiveAnalysis';

export interface StoredAnalysis {
  id: string;
  userId?: string | null;
  fen: string;
  depth: number;
  lines: EngineLine[];
  createdAt: number;
}

const LOCAL_KEY = 'analysis_history_v1';

function loadLocal(): StoredAnalysis[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.warn('[AnalysisStorage] Failed to load local history', e);
    return [];
  }
}

function saveLocal(entries: StoredAnalysis[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(entries.slice(0, 20)));
  } catch (e) {
    console.warn('[AnalysisStorage] Failed to save local history', e);
  }
}

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function recordAnalysisSession(payload: { fen: string; depth: number; lines: EngineLine[] }): Promise<StoredAnalysis> {
  const profile = getUserProfile();
  const entry: StoredAnalysis = {
    id: uuid(),
    userId: profile?.id,
    fen: payload.fen,
    depth: payload.depth,
    lines: payload.lines,
    createdAt: Date.now(),
  };

  // Save locally first for offline reliability
  const existing = loadLocal();
  saveLocal([entry, ...existing]);

  // Best effort persist to Supabase if configured
  if (supabase) {
    try {
        await (supabase as any).from('analysis_sessions').upsert({
        id: entry.id,
        user_id: entry.userId,
        fen: entry.fen,
        depth: entry.depth,
        lines: entry.lines,
        created_at: new Date(entry.createdAt).toISOString(),
      });
    } catch (e) {
      console.warn('[AnalysisStorage] Supabase persist failed', e);
    }
  }

  return entry;
}

export async function fetchRecentAnalyses(limit = 10): Promise<StoredAnalysis[]> {
  // Try Supabase first for the authenticated user
  if (supabase) {
    try {
      const profile = getUserProfile();
      const query = supabase
        .from('analysis_sessions' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (profile?.id) {
        query.eq('user_id', profile.id);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return data.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          fen: row.fen,
          depth: row.depth,
          lines: row.lines || [],
          createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
        }));
      }
    } catch (e) {
      console.warn('[AnalysisStorage] Supabase fetch failed', e);
    }
  }

  // Fallback to local history
  return loadLocal().slice(0, limit);
}
