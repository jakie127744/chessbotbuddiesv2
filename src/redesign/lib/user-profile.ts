import { supabase } from './supabaseClient';
import { logActivity } from './activity-logger';

export interface ActivityLogItem {
  id: string;
  type: string;
  itemId: string;
  timestamp: number;
  result: string;
  details?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  email?: string;
  password?: string; // Legacy/Local only
  createdAt: number;
  rating?: number;
  xp?: number; // Added for leaderboard
  stats?: {
    gamesPlayed: number;
    puzzlesSolved: number;
    lessonsCompleted: number;
    openingsCompleted?: number; // Added
    endgamesCompleted?: number; // Added
    minigamesPlayed?: number; // Added
    puzzleRating?: number;
    wins?: number;
    losses?: number;
    draws?: number;
  };
  lastGamePlayedAt?: number; // Timestamp of last game completion
  openingStats?: Record<string, { wins: number; losses: number; draws: number }>;
  openingHistory?: Record<string, number>;
  completedLessons?: string[];
  lessonProgress?: Record<string, number>; // Map of lessonId -> pageIndex
  minigameHighScores?: Record<string, number>; // Map of gameId -> score
  achievements?: Record<string, { unlocked: boolean; unlockedAt?: number; progress?: number }>;
  activityLog?: ActivityLogItem[];
  country?: string;
  lastUsernameChange?: number; // Timestamp of last username change
  dailyQuests?: { id: string; progress: number; target: number; completed: boolean; lastUpdated: number; rewardXp?: number; title?: string }[];
  streak?: number;
  lastActiveDate?: string; // YYYY-MM-DD format
  rapidRating?: number;
  blitzRating?: number;
  bulletRating?: number;
  followers?: number;
  following?: number;
  title?: string; // GM, IM, PRO, etc.
  rank?: number; // Global Rank
}

const USER_PROFILE_KEY = 'chess_active_user_id';
const USERS_STORAGE_KEY = 'chess_users_v2';
const USED_USERNAMES_KEY = 'chess_used_usernames';

// --- Helper: Site URL ---
function getSiteUrl(): string {
  // 1. Prefer explicitly configured site URL (Production fix)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
      // Ensure no trailing slash for consistency if desired, strictly speaking URL constructor handles it but string concat needs care
      // But typically env var is base. Let's return as is or trim.
      return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  // 2. Fallback to client-side origin (if in browser)
  if (typeof window !== 'undefined') {
      return window.location.origin;
  }
  // 3. Last resort - return empty string (Auth will use Supabase Site URL setting)
  return '';
}

// --- Helper: Local Storage Sync ---
function getAllUsers(): Record<string, UserProfile> {
  if (typeof window === 'undefined') return {}; // SSR Safety
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

function saveAllUsers(users: Record<string, UserProfile>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function getLocalProfile(id: string): UserProfile | null {
    const users = getAllUsers();
    return users[id] || null;
}

// --- Auth Functions ---

export async function registerUser(email: string, password: string, country: string = 'US', sourceProfile?: UserProfile | null): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  email = email.trim().toLowerCase();
  console.log(`[Auth] Attempting registration for: ${email}`);
  
  // 1. Supabase Auth
  if (supabase) {
      console.log('[Auth] Supabase client found, using remote auth...');
      
      // Generate username BEFORE signup to sync with Auth Metadata
      const username = generateUniqueUsername();
      
      const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${getSiteUrl()}/`,
            data: {
                display_name: username,
                full_name: username, // Some systems use this too
                username: username
            }
          }
      });

      if (error) {
          console.error('[Auth] Supabase signUp error:', error);
          return { success: false, error: error.message };
      }
      
      if (!data.user) {
          console.error('[Auth] No user data returned from Supabase');
          return { success: false, error: 'No user returned from registration' };
      }

      console.log(`[Auth] User created successfully: ${data.user.id}`);

      // 2. Create Profile in DB (Insert)
      // const username = generateUniqueUsername(); // Removed redundancy
      const newProfile: UserProfile = {
          id: data.user.id,
          username,
          email,
          country,
          rating: sourceProfile?.rating || 500,
          xp: sourceProfile?.xp || 0,
          createdAt: Date.now(),
          stats: sourceProfile?.stats || { gamesPlayed: 0, puzzlesSolved: 0, lessonsCompleted: 0 },
          completedLessons: sourceProfile?.completedLessons,
          minigameHighScores: sourceProfile?.minigameHighScores,
          lessonProgress: sourceProfile?.lessonProgress,
          openingStats: sourceProfile?.openingStats,
          openingHistory: sourceProfile?.openingHistory
      };

      console.log(`[Auth] Attempting to create profile in 'profiles' table for: ${username}`);

      // Sync to 'profiles' table
      // @ts-ignore
      const { error: dbError } = await supabase.from('profiles').insert({
          id: newProfile.id,
          username: newProfile.username,
          rating: newProfile.rating,
          xp: newProfile.xp || 0,
          games_played: newProfile.stats?.gamesPlayed || 0,
          puzzles_solved: newProfile.stats?.puzzlesSolved || 0,
          lessons_completed: newProfile.stats?.lessonsCompleted || 0,
          wins: 0, // Reset W/L record or migrate if we trusted guest stats (usually safer to reset competitive stats but keep XP)
          losses: 0,
          draws: 0,
          country,
          avatar_url: null,
          completed_lessons: newProfile.completedLessons || [],
          minigame_scores: newProfile.minigameHighScores || {},
          updated_at: new Date().toISOString()
      });

      if (dbError) {
          console.error('[Auth] CRITICAL: Profile creation failed in database:', dbError);
          // If we fail specifically on the DB insert after auth success, we should tell the user
          return { success: false, error: `Account created but profile sync failed: ${dbError.message}. This usually means the 'profiles' table is missing or RLS is blocking the insert.` };
      }

      console.log('[Auth] Profile created and synced successfully.');
      logActivity('REGISTER', { path: 'registerUser', metadata: { username, email } });

      // 4. Send Admin Notification & Welcome Email (Wait for them to ensure delivery)
    const baseUrl = getSiteUrl();
    if (baseUrl) {
      console.log(`[Auth] Triggering signup notification...`);
      try {
        const notifyRes = await fetch(`${baseUrl}/api/notify-signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: newProfile.email,
            username: newProfile.username,
            country: newProfile.country
          })
        });
        const notifyData = await notifyRes.json();
        console.log('[Auth] Notification response:', notifyData);
      } catch (err) {
        console.error('[Auth] Notification failed:', err);
      }

      console.log(`[Auth] Triggering welcome email...`);
      try {
        const welcomeRes = await fetch(`${baseUrl}/api/welcome-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: newProfile.email,
            username: newProfile.username
          })
        });
        const welcomeData = await welcomeRes.json();
        console.log('[Auth] Welcome email response:', welcomeData);
      } catch (err) {
        console.error('[Auth] Welcome email failed:', err);
      }
    } else {
      console.warn('[Auth] No window.location.origin, skipping notification/welcome fetches.');
    }

      // 5. Save to Local Cache
      const users = getAllUsers();
      users[newProfile.id] = newProfile;
      saveAllUsers(users);
      localStorage.setItem(USER_PROFILE_KEY, newProfile.id);

      return { success: true, user: newProfile };
  } 
  
  // FALLBACK: Local Only if supabase is null (e.g. missing env vars)
  console.warn('[Auth] Supabase not configured or missing keys. Falling back to local-only mode.');
  return registerUserLocal(email, password, sourceProfile);
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  email = email.trim().toLowerCase();
  console.log(`[Auth] Attempting login for: ${email}`);
  
  if (supabase) {
      console.log('[Auth] Supabase client found, using remote login...');
      const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
      });

      if (error) {
          console.error('[Auth] Supabase signIn error:', error);
          return { success: false, error: error.message };
      }
      
      if (!data.user) {
          console.error('[Auth] No user data returned from Supabase signIn');
          return { success: false, error: 'Login failed' };
      }

      console.log(`[Auth] User authenticated successfully: ${data.user.id}`);

      // Fetch Profile from DB
      console.log('[Auth] Fetching profile from database...');
      // @ts-ignore
      const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single() as any;
          
      if (profileError) {
          console.warn('[Auth] Profile fetch failed or returned error:', profileError);
      } else {
          console.log('[Auth] Profile retrieved successfully:', profileData?.username);
      }

      // Construct UserProfile from DB + Defaults
      const user: UserProfile = {
          id: data.user.id,
          username: profileData?.username || 'ChessPlayer',
          email: data.user.email,
          rating: profileData?.rating || 500,
          xp: profileData?.xp || 0,
          country: profileData?.country || 'US',
          createdAt: new Date(profileData?.updated_at || Date.now()).getTime(),
          stats: {
              gamesPlayed: profileData?.games_played || 0,
              puzzlesSolved: profileData?.puzzles_solved || 0,
              lessonsCompleted: profileData?.lessons_completed || 0
          },
          minigameHighScores: profileData?.minigame_scores || {},
          completedLessons: profileData?.completed_lessons || [],
          achievements: profileData?.achievements || {},
          activityLog: profileData?.activity_log || [],
          dailyQuests: profileData?.daily_quests || [],
          streak: profileData?.streak || 0,
          lastActiveDate: profileData?.last_active_date, 
          // Note: local-only history might be lost if not in DB, but key stats are preserved
      };

      // Update Local Cache
      const users = getAllUsers();
      const existing = users[user.id] || {};
      users[user.id] = { ...existing, ...user }; 
      saveAllUsers(users);
      localStorage.setItem(USER_PROFILE_KEY, user.id);

      console.log(`[Auth] Login complete. Welcome back, ${user.username}!`);
      logActivity('LOGIN', { path: 'loginUser', metadata: { username: user.username } });
      return { success: true, user };
  }

  console.warn('[Auth] Supabase not configured. Falling back to local login.');
  return loginUserLocal(email, password);
}

// Legacy Local Functions (Renamed)
function registerUserLocal(email: string, password: string, sourceProfile?: UserProfile | null) {
  const users = getAllUsers();
  const normalizedEmail = email.toLowerCase();
  
  // Check against normalized emails
  if (Object.values(users).some(u => (u.email || '').toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'Email already registered (Local)' };
  }
  
  const newUser: UserProfile = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: generateUniqueUsername(),
      email: normalizedEmail, // Store as lowercase
      password,
      country: 'US',
      rating: sourceProfile?.rating || 500,
      xp: sourceProfile?.xp || 0,
      createdAt: Date.now(),
      stats: sourceProfile?.stats || { gamesPlayed: 0, puzzlesSolved: 0, lessonsCompleted: 0 },
      completedLessons: sourceProfile?.completedLessons,
      minigameHighScores: sourceProfile?.minigameHighScores,
      lessonProgress: sourceProfile?.lessonProgress
  };
  users[newUser.id] = newUser;
  saveAllUsers(users);
  localStorage.setItem(USER_PROFILE_KEY, newUser.id);
  return { success: true, user: newUser };
}

function loginUserLocal(email: string, password: string) {
    const users = getAllUsers();
    const normalizedEmail = email.toLowerCase();
    
    // Find user by normalized email comparison
    const user = Object.values(users).find(u => 
        (u.email || '').toLowerCase() === normalizedEmail && u.password === password
    );
    
    if (!user) return { success: false, error: 'Invalid email or password (Local)' };
    localStorage.setItem(USER_PROFILE_KEY, user.id);
    return { success: true, user };
}

export async function logoutUser() {
    logActivity('LOGOUT');
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem(USER_PROFILE_KEY);
}

export async function resetPassword(email: string, password?: string): Promise<{ success: boolean; error?: string }> {
  console.log(`[Auth] Password reset requested for: ${email}`);
  
  // 1. Supabase: Send Reset Email
  if (supabase) {
      console.log('[Auth] Attempting Supabase password reset email...');
      
      const redirectUrl = `${getSiteUrl()}/?type=recovery`;
      console.log(`[Auth] Redirect URL: ${redirectUrl}`);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
      });
      
      if (error) {
          console.error('[Auth] Supabase password reset error:', error);
          console.error('[Auth] Error details:', {
              message: error.message,
              status: error.status,
              name: error.name
          });
          
          // Provide helpful error message
          let userMessage = error.message;
          if (error.message.includes('rate limit')) {
              userMessage = 'Too many reset attempts. Please wait a few minutes and try again.';
          } else if (error.message.includes('not found')) {
              userMessage = 'Email not found in our system.';
          }
          
          return { success: false, error: userMessage };
      }
      
      console.log('[Auth] ✅ Password reset email request successful!');
      console.log('[Auth] Check your email (including spam folder) for the reset link.');
      console.log('[Auth] If you don\'t receive an email:');
      console.log('[Auth] 1. Check Supabase Dashboard → Authentication → Users');
      console.log('[Auth] 2. Manually reset password from the dashboard');
      console.log('[Auth] 3. Configure SMTP settings in Supabase for reliable email delivery');
      
      // In development, show additional helpful info
      if (process.env.NODE_ENV === 'development') {
          console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.warn('📧 DEVELOPMENT MODE: Email Troubleshooting');
          console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.warn('Supabase reset email was requested but may not arrive because:');
          console.warn('1. Default Supabase emails are rate-limited and unreliable');
          console.warn('2. SMTP settings may not be configured in Supabase dashboard');
          console.warn('3. Your email provider might be blocking automated emails');
          console.warn('');
          console.warn('🔧 Quick Fix Options:');
          console.warn('   → Go to: https://supabase.com/dashboard');
          console.warn('   → Navigate to: Authentication → Users');
          console.warn('   → Find user: ' + email);
          console.warn('   → Click "Send recovery email" or reset password manually');
          console.warn('');
          console.warn('📖 See SUPABASE_EMAIL_CONFIG.md for full setup guide');
          console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }
      
      return { success: true };
  }

  console.log('[Auth] Supabase not configured, using local password reset...');
  
  // 2. Local: Legacy Reset
  if (!password) {
      console.error('[Auth] Local mode requires a new password to be provided');
      return { success: false, error: 'Password required for local reset' };
  }
  
  const users = getAllUsers();
  const user = Object.values(users).find(u => u.email === email);

  if (!user) {
    console.error(`[Auth] Email not found in local storage: ${email}`);
    return { success: false, error: 'Email not found' };
  }

  // Update password in memory and save
  users[user.id].password = password;
  saveAllUsers(users);
  
  console.log(`[Auth] ✅ Password updated locally for: ${user.username}`);
  return { success: true };
}


// --- Generators & Helpers ---

// Chess-themed word lists for username generation
const ADJECTIVES = [
  // Personality/Skill
  'Brilliant', 'Tactical', 'Strategic', 'Bold', 'Clever', 'Swift', 'Mighty',
  'Brave', 'Cunning', 'Daring', 'Epic', 'Fierce', 'Grand', 'Noble', 'Royal',
  'Savage', 'Silent', 'Steady', 'Tricky', 'Valiant', 'Wise', 'Witty',
  'Agile', 'Blazing', 'Crafty', 'Dynamic', 'Elite', 'Fearless', 'Golden',
  'Genius', 'Heroic', 'Invincible', 'Jolly', 'Keen', 'Legendary', 'Magic',
  'Nimble', 'Optimistic', 'Powerful', 'Quick', 'Rapid', 'Sharp', 'Talented',
  'Unstoppable', 'Victorious', 'Wonderful', 'Zesty', 'Amazing', 'Awesome',
  
  // Fun/Kid-Friendly
  'Happy', 'Lucky', 'Speedy', 'Hyper', 'Mega', 'Super', 'Galaxy', 'Cosmic',
  'Flying', 'Dancing', 'Singing', 'Jumping', 'Glowing', 'Shiny', 'Sparkly',
  'Bouncing', 'Cheery', 'Electric', 'Frosty', 'Gigantic', 'Incredible',
  'Joyful', 'Kind', 'Lively', 'Mystic', 'Neon', 'Orbiting', 'Playful',
  'Quantum', 'Radiant', 'Soaring', 'Turbo', 'Ultra', 'Vivid', 'Wild'
];

const CHESS_TERMS = [
  // Pieces & Moves
  'Knight', 'Bishop', 'Rook', 'Queen', 'King', 'Pawn', 'Gambit', 'Castle',
  'Checkmate', 'Tactic', 'Blunder', 'Fork', 'Pin', 'Skewer', 'Capture',
  'Defense', 'Attack', 'Opening', 'Endgame', 'Board', 'Square', 'Rank', 'File',
  
  // Ranks & Titles
  'Champion', 'Master', 'Veteran', 'Grandmaster', 'Candidate', 'Expert',
  'Thinking', 'Planner', 'Solver', 'Learner', 'Student', 'Coach', 'Captain',
  'Commander', 'Legend', 'Hero', 'Wizard', 'Genius', 'Pro', 'Star',
  
  // Animals/Mascots
  'Dragon', 'Tiger', 'Lion', 'Eagle', 'Falcon', 'Phoenix', 'Griffin',
  'Bear', 'Wolf', 'Fox', 'Hawk', 'Panther', 'Shark', 'Cobra', 'Viper',
  'Badger', 'Panda', 'Koala', 'Otter', 'Penguin', 'Dolphin', 'Whale',
  
  // Space/Cool Stuff
  'Rocket', 'Comet', 'Meteor', 'Planet', 'Star', 'Nebula', 'Galaxy',
  'Laser', 'Robot', 'Cyborg', 'Ninja', 'Samurai', 'Pirate', 'Viking',
  'Knight', 'Warrior', 'Gladiator', 'Titan', 'Giant', 'Sprite'
];

export function generateUsername(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const term = CHESS_TERMS[Math.floor(Math.random() * CHESS_TERMS.length)];
  return `${adjective}${term}`;
}

export function generateUniqueUsername(): string {
    const users = getAllUsers();
    // Create a Set of normalized (lowercase) usernames for O(1) lookups
    const existingUsernames = new Set(
        Object.values(users)
            .map(u => (u.username || '').toLowerCase())
            .filter(Boolean)
    );

    let candidate = generateUsername();
    let attempts = 0;
    
    // "Match only the words" - we try to find a straightforward Adjective+Term combo that is free
    // We retry up to 50 times to find a unique word combination
    while (existingUsernames.has(candidate.toLowerCase()) && attempts < 50) {
        candidate = generateUsername();
        attempts++;
    }

    // If we're still stuck after 50 attempts (unlikely with ~3000 combos for local users),
    // we might have to append a number guarantees uniqueness, but we try hard to respect "only words"
    if (existingUsernames.has(candidate.toLowerCase())) {
        candidate = `${candidate}${Math.floor(Math.random() * 1000)}`;
    }
    
    return candidate;
}

// ... Sync / Async Updates ...

/**
 * Get current user profile from localStorage
 */
export function getUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null; // SSR Safety
  try {
    // 1. Try to get active user ID
    const activeId = localStorage.getItem(USER_PROFILE_KEY);
    
    // 2. Load all users
    const users = getAllUsers();

    // 3. If we have an active ID and it exists in users, return it
    if (activeId && users[activeId]) {
      return users[activeId];
    }
    
    return null;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
}

export async function completeLesson(variationId: string) {
    const user = getUserProfile();
    if (!user) return;

    // Update local stats with defaults if missing
    const newStats = {
        gamesPlayed: user.stats?.gamesPlayed || 0,
        puzzlesSolved: user.stats?.puzzlesSolved || 0,
        lessonsCompleted: (user.stats?.lessonsCompleted || 0) + 1
    };
    
    // Add to completed list (params unique)
    const currentCompleted = user.completedLessons || [];
    const newCompleted = currentCompleted.includes(variationId) 
        ? currentCompleted 
        : [...currentCompleted, variationId];

    const updates: Partial<UserProfile> = {
        stats: newStats,
        completedLessons: newCompleted
    };

    // Update Local
    const users = getAllUsers();
    users[user.id] = { ...users[user.id], ...updates };
    saveAllUsers(users);

    // Sync to Supabase
    if (supabase) {
        // @ts-ignore
        await supabase.from('profiles').update({
            lessons_completed: newStats.lessonsCompleted,
            completed_lessons: newCompleted, // Sync the array for Endgames calculation
            updated_at: new Date().toISOString()
        }).eq('id', user.id);
    }
    
    return updates;
}

// --- Constants ---
const USERNAME_CHANGE_COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000; // 90 Days

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
    const current = getUserProfile();
    if (!current) return { success: false, error: 'User not found' };

    // 0. Username Change Restriction Check
    if (updates.username && updates.username !== current.username) {
        // A. Check Cooldown
        const lastChange = current.lastUsernameChange || 0;
        const timeSinceChange = Date.now() - lastChange;
        
        if (timeSinceChange < USERNAME_CHANGE_COOLDOWN_MS) {
            const daysRemaining = Math.ceil((USERNAME_CHANGE_COOLDOWN_MS - timeSinceChange) / (24 * 60 * 60 * 1000));
            console.warn(`[Profile] Username change blocked. Days remaining: ${daysRemaining}`);
            return { 
                success: false, 
                error: `Username can only be changed once every 90 days. Please wait ${daysRemaining} days.`
            };
        }

        // B. Check Uniqueness (Global via Supabase)
        if (supabase) {
            const { data: existingUser, error: checkError } = await supabase
                .from('profiles')
                .select('id')
                .ilike('username', updates.username) // Case-insensitive check
                .maybeSingle<{ id: string }>(); // Explicit type assertion

            if (checkError) {
                console.error('[Profile] Uniqueness check failed:', checkError);
                return { success: false, error: 'Could not verify username availability.' };
            }

            if (existingUser && existingUser.id !== current.id) {
                return { success: false, error: 'That username is already taken!' };
            }
        }
        
        // If allowed, update the timestamp
        updates.lastUsernameChange = Date.now();
    }

    // 1. Update Local
    const users = getAllUsers();
    // Perform a more robust merge for stats to prevent partial updates from wiping other fields
    const updatedUser = { 
        ...users[current.id], 
        ...updates,
        stats: updates.stats ? { ...(users[current.id].stats || {}), ...updates.stats } : users[current.id].stats
    };
    users[current.id] = updatedUser;
    saveAllUsers(users);

    // 2. Update Supabase (Best Effort)
    if (supabase && current.email) { // If email exists, assume connected
         
         // DEBUG: Check Auth Session
         const { data: { session } } = await supabase.auth.getSession();
         console.log(`[Profile] Syncing to Supabase... UserID: ${current.id}, AuthUser: ${session?.user?.id || 'NONE'}`);

         if (!session?.user || session.user.id !== current.id) {
             console.warn('[Profile] ⚠️ Aborting sync: Local User ID does not match active Supabase Auth session. You may need to relogin.');
             // Actually abort the sync - RLS will reject anyway, but this is cleaner
             return { success: true }; // Local update succeeded, just Supabase sync skipped
         }

         // Map to DB columns
         const dbUpdates: any = {};
         if (updates.username !== undefined) dbUpdates.username = updates.username; // Add username update
         if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
         if (updates.country !== undefined) dbUpdates.country = updates.country;
         if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar;
          if (updates.stats) {
              if (updates.stats.gamesPlayed !== undefined) dbUpdates.games_played = updates.stats.gamesPlayed;
              if (updates.stats.puzzlesSolved !== undefined) dbUpdates.puzzles_solved = updates.stats.puzzlesSolved;
              if (updates.stats.wins !== undefined) dbUpdates.wins = updates.stats.wins;
              if (updates.stats.losses !== undefined) dbUpdates.losses = updates.stats.losses;
              if (updates.stats.draws !== undefined) dbUpdates.draws = updates.stats.draws;
          }
          if (updates.stats?.lessonsCompleted !== undefined) {
              dbUpdates.lessons_completed = updates.stats.lessonsCompleted;
          }
          if (updates.xp !== undefined) dbUpdates.xp = updates.xp; // Sync XP
          
          if (updates.lastUsernameChange !== undefined) {
               // We might need to add this column to DB schema if strict sync is needed, 
               // but for now local restriction + metadata sync is decent enough for Client-Side enforcement.
               // Ideally: dbUpdates.last_username_change = new Date(updates.lastUsernameChange).toISOString();
          }
         
          if (updates.minigameHighScores) {
              dbUpdates.minigame_scores = updates.minigameHighScores;
          }

          if (updates.achievements) {
              dbUpdates.achievements = updates.achievements;
          }

          if (updates.activityLog) {
              dbUpdates.activity_log = updates.activityLog;
          }

          if (updates.dailyQuests) {
              dbUpdates.daily_quests = updates.dailyQuests;
          }

          if (updates.streak !== undefined) {
              dbUpdates.streak = updates.streak;
          }

          if (updates.lastActiveDate) {
              dbUpdates.last_active_date = updates.lastActiveDate;
          }
         
         // Only update if there are DB mapping fields
         if (Object.keys(dbUpdates).length > 0) {
             console.log('[Profile] Sending updates to DB:', dbUpdates);
             
             dbUpdates.updated_at = new Date().toISOString();
             // @ts-ignore
             const { error, count } = await supabase.from('profiles').update(dbUpdates).eq('id', current.id).select('id'); // select to get count/confirm
             
            if (error) {
                const errorMsg = error.message || String(error);
                if (errorMsg.includes("Could not find the") && errorMsg.includes("column")) {
                    console.warn(`[Profile] ⚠️ Supabase update skipped a missing column: ${errorMsg}`);
                    console.info("[Profile] 💡 Tip: Run the SQL in scripts/fix_supabase_errors.sql to update your database schema.");
                } else {
                    console.error("[Profile] ❌ Supabase update FAILED:", errorMsg, error.details);
                }
            } else {
                console.log(`[Profile] ✅ Supabase update SUCCESS.`);
            }
         }

         // 3. Sync Auth Metadata (if username changed)
         if (updates.username) {
             const { error: authError } = await supabase.auth.updateUser({
                 data: { 
                     display_name: updates.username,
                     username: updates.username
                 }
             });
             if (authError) console.warn("[Profile] Failed to sync Auth metadata:", authError.message);
         }
    } else {
        if (!supabase) console.warn("[Profile] Skipping sync: No Supabase client.");
        if (!current.email) console.log("[Profile] Skipping sync: guest user (no email).");
    }
    
    return { success: true };
}
/**
 * Update opening statistics
 */
export function updateOpeningStats(openingId: string, result: 'win' | 'loss' | 'draw'): void {
  const profile = getUserProfile();
  if (!profile) return;

  const stats = profile.openingStats || {};
  const current = stats[openingId] || { wins: 0, losses: 0, draws: 0 };

  if (result === 'win') current.wins++;
  if (result === 'loss') current.losses++;
  if (result === 'draw') current.draws++;

  updateUserProfile({
    openingStats: {
      ...stats,
      [openingId]: current
    }
  });
}



/**
 * Record that the user played a specific opening
 * Used by Coach Jakie to learn user preferences
 */
export function recordOpeningPlayed(openingId: string): void {
  const profile = getUserProfile();
  if (!profile) return;

  const history = profile.openingHistory || {};
  history[openingId] = (history[openingId] || 0) + 1;

  updateUserProfile({ openingHistory: history });
  console.log(`[Profile] Recorded opening: ${openingId} (total: ${history[openingId]})`);
}

/**
 * Get the user's most-played opening
 * Returns openingId or null if no history
 */
export function getUserFavoriteOpening(minGames: number = 3): string | null {
  const profile = getUserProfile();
  if (!profile?.openingHistory) return null;

  const entries = Object.entries(profile.openingHistory);
  if (entries.length === 0) return null;

  // Sort by play count descending
  entries.sort((a, b) => b[1] - a[1]);
  
  // Only return if played at least minGames times
  if (entries[0][1] >= minGames) {
    return entries[0][0];
  }
  
  return null;
}

// ... (existing exports)

export function createGuestProfile(): UserProfile {
    const users = getAllUsers();
    const newUser: UserProfile = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: generateUniqueUsername(),
        displayName: 'Guest Player',
        createdAt: Date.now(),
        country: 'US', // Default
        stats: { gamesPlayed: 0, puzzlesSolved: 0, lessonsCompleted: 0 }
    };
    
    users[newUser.id] = newUser;
    saveAllUsers(users);
    localStorage.setItem(USER_PROFILE_KEY, newUser.id);
    console.log('[Auth] Created new guest profile:', newUser.username);
    return newUser;
}

export function saveMinigameHighScore(minigameId: string, score: number) {
  const profile = getUserProfile();
  if (!profile) return;

  const currentHighScores = profile.minigameHighScores || {};
  const currentBest = currentHighScores[minigameId] || 0;

  if (score > currentBest) {
    updateUserProfile({
      minigameHighScores: {
        ...currentHighScores,
        [minigameId]: score
      }
    });
    console.log(`[Profile] New High Score for ${minigameId}: ${score}`);
  }
}
