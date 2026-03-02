import { supabase } from './supabaseClient';

export type ActivityAction = 
  | 'PAGE_VIEW'
  | 'LOGIN'
  | 'REGISTER'
  | 'LOGOUT'
  | 'PUZZLE_SOLVE'
  | 'PUZZLE_FAIL'
  | 'LESSON_COMPLETE'
  | 'MINIGAME_PLAY'
  | 'ARTICLE_READ'
  | 'AD_CLICK';

interface ActivityDetails {
  path?: string;
  puzzleId?: string;
  lessonId?: string;
  minigameId?: string;
  articleSlug?: string;
  score?: number;
  outcome?: 'win' | 'loss' | 'draw';
  metadata?: any;
}

export async function logActivity(action: ActivityAction, details: ActivityDetails = {}) {
  // 1. Check if Supabase is configured
  if (!supabase) return;

  try {
    // 2. Get current user session (if any)
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // For this implementation, we will skip DB logging for guests to avoid RLS violations.
    if (!userId) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[ActivityLogger] Guest activity (not synced): ${action}`, details);
      }
      return;
    }

    // @ts-ignore
    const { error } = await supabase.from('activity_logs').insert({
      user_id: userId,
      action,
      details,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('[ActivityLogger] Failed to log activity:', error.message);
    } else {
      // debug log in dev
      if (process.env.NODE_ENV === 'development') {
        console.log(`[ActivityLogger] Logged: ${action}`, details);
      }
    }
  } catch (err) {
    console.error('[ActivityLogger] Unexpected error:', err);
  }
}
