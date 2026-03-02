'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
    getUserProfile, 
    updateUserProfile, 
    type UserProfile,
    type ActivityLogItem 
} from '@/lib/user-profile';

// --- Types ---

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji or Lucide icon name
  conditionDescription?: string; 
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  xpReward: number;
}

export interface AchievementProgress {
    unlocked: boolean;
    unlockedAt?: number; // timestamp
    progress?: number; // For progressive achievements (e.g. 5/10)
}

export interface UserStats {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    puzzlesSolved: number;
    lessonsCompleted: number;
    openingsCompleted: number;
    endgamesCompleted: number;
    minigamesPlayed: number;
    bestWinELO: number;
    uniqueBotsDefeated: string[];
}

export interface RewardsState {
  xp: number;
  level: number;
  stars: number;
  achievements: Record<string, AchievementProgress>;
  unlockedItems: string[];
  activityLog: ActivityLogItem[];
  completedLessons: string[];
  stats: UserStats;
  winStreak: number; // Session win streak
  streak: number; // Daily login streak (persisted)
  newUnlock: string | null;
  dailyQuests: QuestProgress[];
}

export interface QuestProgress {
    id: string;
    progress: number;
    target: number;
    completed: boolean;
    lastUpdated: number;
    requiredTags?: string[]; // E.g. ['mateIn1'] or ['fork']
    title?: string;
    rewardXp?: number;
}

export interface RewardsContextType extends RewardsState {
  userProfile: UserProfile | null; // Added reactive profile
  addXp: (amount: number) => void;
  addStar: (amount: number) => void;
  unlockAchievement: (id: string) => void;
  checkGameEndAchievements: (result: 'win' | 'loss' | 'draw', moveCount: number, botId?: string, botRating?: number) => number;
  checkPuzzleComplete: (puzzleTheme?: string) => void;
  addActivity: (item: Omit<ActivityLogItem, 'id' | 'timestamp'>) => void;
  markOpeningComplete: (openingId: string) => void;
  markLessonComplete: (lessonId: string, customXp?: number) => void;
  markEndgameComplete: (endgameId: string) => void;
  markMinigameComplete: (minigameId: string, score: number) => void;
  resetProgress: () => void;
  clearNewUnlock: () => void;
  updateLocalProfile: (updates: Partial<UserProfile>) => void; // Added for live updates
}

const STORAGE_KEY = 'chess_app_rewards_v2';

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000
];

export const ACHIEVEMENTS: Achievement[] = [
  // ===== GAMES PLAYED (15) =====
  { id: 'games-1', title: 'Newbie', description: 'Play your first game', icon: 'Sword', tier: 'bronze', xpReward: 50 },
  { id: 'games-5', title: 'Getting Started', description: 'Play 5 games', icon: 'Swords', tier: 'bronze', xpReward: 100 },
  { id: 'games-10', title: 'Regular', description: 'Play 10 games', icon: 'User', tier: 'bronze', xpReward: 150 },
  { id: 'games-25', title: 'Dedicated', description: 'Play 25 games', icon: 'Target', tier: 'silver', xpReward: 200 },
  { id: 'games-50', title: 'Veteran', description: 'Play 50 games', icon: 'Shield', tier: 'silver', xpReward: 300 },
  { id: 'games-75', title: 'Committed', description: 'Play 75 games', icon: 'Award', tier: 'silver', xpReward: 350 },
  { id: 'games-100', title: 'Elite', description: 'Play 100 games', icon: 'Star', tier: 'gold', xpReward: 500 },
  { id: 'games-150', title: 'Experienced', description: 'Play 150 games', icon: 'Crown', tier: 'gold', xpReward: 600 },
  { id: 'games-200', title: 'Master', description: 'Play 200 games', icon: 'Medal', tier: 'gold', xpReward: 700 },
  { id: 'games-300', title: 'Legend', description: 'Play 300 games', icon: 'Trophy', tier: 'gold', xpReward: 800 },
  { id: 'games-400', title: 'Mythic', description: 'Play 400 games', icon: 'Gem', tier: 'platinum', xpReward: 1000 },
  { id: 'games-500', title: 'Immortal', description: 'Play 500 games', icon: 'Sun', tier: 'platinum', xpReward: 1200 },
  { id: 'games-750', title: 'Eternal', description: 'Play 750 games', icon: 'Diamond', tier: 'platinum', xpReward: 1500 },
  { id: 'games-1000', title: 'Infinite', description: 'Play 1000 games', icon: 'Star', tier: 'platinum', xpReward: 2000 },
  { id: 'games-2000', title: 'Transcendent', description: 'Play 2000 games', icon: 'Sun', tier: 'platinum', xpReward: 3000 },

  // ===== WINS (15) =====
  { id: 'wins-1', title: 'First Blood', description: 'Win your first game', icon: 'Trophy', tier: 'bronze', xpReward: 100 },
  { id: 'wins-5', title: 'Competitor', description: 'Win 5 games', icon: 'Target', tier: 'bronze', xpReward: 150 },
  { id: 'wins-10', title: 'Winner', description: 'Win 10 games', icon: 'Award', tier: 'bronze', xpReward: 200 },
  { id: 'wins-25', title: 'Champion', description: 'Win 25 games', icon: 'Crown', tier: 'silver', xpReward: 300 },
  { id: 'wins-50', title: 'Conqueror', description: 'Win 50 games', icon: 'Medal', tier: 'silver', xpReward: 500 },
  { id: 'wins-75', title: 'Dominator', description: 'Win 75 games', icon: 'Flame', tier: 'silver', xpReward: 600 },
  { id: 'wins-100', title: 'Destroyer', description: 'Win 100 games', icon: 'Swords', tier: 'gold', xpReward: 800 },
  { id: 'wins-150', title: 'Warlord', description: 'Win 150 games', icon: 'Skull', tier: 'gold', xpReward: 1000 },
  { id: 'wins-200', title: 'Emperor', description: 'Win 200 games', icon: 'Crown', tier: 'gold', xpReward: 1200 },
  { id: 'wins-300', title: 'Overlord', description: 'Win 300 games', icon: 'Star', tier: 'gold', xpReward: 1500 },
  { id: 'wins-400', title: 'Godlike', description: 'Win 400 games', icon: 'Sun', tier: 'platinum', xpReward: 2000 },
  { id: 'wins-500', title: 'Unstoppable', description: 'Win 500 games', icon: 'Diamond', tier: 'platinum', xpReward: 2500 },
  { id: 'wins-750', title: 'Invincible', description: 'Win 750 games', icon: 'Gem', tier: 'platinum', xpReward: 3000 },
  { id: 'wins-1000', title: 'Supreme', description: 'Win 1000 games', icon: 'Trophy', tier: 'platinum', xpReward: 4000 },
  { id: 'wins-2000', title: 'Absolute', description: 'Win 2000 games', icon: 'Sun', tier: 'platinum', xpReward: 5000 },

  // ===== PUZZLES (15) =====
  { id: 'puzzles-1', title: 'Thinker', description: 'Solve your first puzzle', icon: 'Brain', tier: 'bronze', xpReward: 50 },
  { id: 'puzzles-5', title: 'Warm Up', description: 'Solve 5 puzzles', icon: 'Zap', tier: 'bronze', xpReward: 100 },
  { id: 'puzzles-10', title: 'Puzzle Novice', description: 'Solve 10 puzzles', icon: 'Lightbulb', tier: 'bronze', xpReward: 150 },
  { id: 'puzzles-25', title: 'Puzzle Fan', description: 'Solve 25 puzzles', icon: 'Brain', tier: 'silver', xpReward: 200 },
  { id: 'puzzles-50', title: 'Puzzle Wizard', description: 'Solve 50 puzzles', icon: 'Wand2', tier: 'silver', xpReward: 300 },
  { id: 'puzzles-100', title: 'Puzzle Master', description: 'Solve 100 puzzles', icon: 'Gem', tier: 'silver', xpReward: 500 },
  { id: 'puzzles-150', title: 'Puzzle Expert', description: 'Solve 150 puzzles', icon: 'Star', tier: 'gold', xpReward: 600 },
  { id: 'puzzles-250', title: 'Puzzle Grandmaster', description: 'Solve 250 puzzles', icon: 'Crown', tier: 'gold', xpReward: 800 },
  { id: 'puzzles-500', title: 'Puzzle Sage', description: 'Solve 500 puzzles', icon: 'ScrollText', tier: 'gold', xpReward: 1000 },
  { id: 'puzzles-750', title: 'Puzzle Oracle', description: 'Solve 750 puzzles', icon: 'Diamond', tier: 'gold', xpReward: 1500 },
  { id: 'puzzles-1000', title: 'Puzzle Omniscient', description: 'Solve 1000 puzzles', icon: 'Sun', tier: 'platinum', xpReward: 2000 },
  { id: 'puzzles-1500', title: 'Puzzle Deity', description: 'Solve 1500 puzzles', icon: 'Trophy', tier: 'platinum', xpReward: 2500 },
  { id: 'puzzles-2000', title: 'Puzzle God', description: 'Solve 2000 puzzles', icon: 'Medal', tier: 'platinum', xpReward: 3000 },
  { id: 'puzzles-3000', title: 'Puzzle Titan', description: 'Solve 3000 puzzles', icon: 'Gem', tier: 'platinum', xpReward: 4000 },
  { id: 'puzzles-5000', title: 'Puzzle Infinity', description: 'Solve 5000 puzzles', icon: 'Star', tier: 'platinum', xpReward: 5000 },

  // ===== LESSONS (10) =====
  { id: 'lessons-1', title: 'First Step', description: 'Complete your first lesson', icon: 'BookOpen', tier: 'bronze', xpReward: 50 },
  { id: 'lessons-3', title: 'Scholar', description: 'Complete 3 lessons', icon: 'Scroll', tier: 'bronze', xpReward: 100 },
  { id: 'lessons-5', title: 'Bookworm', description: 'Complete 5 lessons', icon: 'Book', tier: 'bronze', xpReward: 150 },
  { id: 'lessons-10', title: 'Studious', description: 'Complete 10 lessons', icon: 'Library', tier: 'silver', xpReward: 250 },
  { id: 'lessons-20', title: 'Academic', description: 'Complete 20 lessons', icon: 'GraduationCap', tier: 'silver', xpReward: 400 },
  { id: 'lessons-30', title: 'Graduate', description: 'Complete 30 lessons', icon: 'Award', tier: 'gold', xpReward: 600 },
  { id: 'lessons-40', title: 'Professor', description: 'Complete 40 lessons', icon: 'ScrollText', tier: 'gold', xpReward: 800 },
  { id: 'lessons-50', title: 'Dean', description: 'Complete 50 lessons', icon: 'Crown', tier: 'gold', xpReward: 1000 },
  { id: 'lessons-75', title: 'Chancellor', description: 'Complete 75 lessons', icon: 'Medal', tier: 'platinum', xpReward: 1500 },
  { id: 'lessons-100', title: 'Minister', description: 'Complete 100 lessons', icon: 'Trophy', tier: 'platinum', xpReward: 2000 },

  // ===== WIN STREAKS (10) =====
  { id: 'streak-2', title: 'Hot', description: 'Win 2 games in a row', icon: 'Flame', tier: 'bronze', xpReward: 100 },
  { id: 'streak-3', title: 'On Fire', description: 'Win 3 games in a row', icon: 'Flame', tier: 'bronze', xpReward: 150 },
  { id: 'streak-4', title: 'Burning', description: 'Win 4 games in a row', icon: 'Flame', tier: 'silver', xpReward: 200 },
  { id: 'streak-5', title: 'Blazing', description: 'Win 5 games in a row', icon: 'Flame', tier: 'silver', xpReward: 300 },
  { id: 'streak-7', title: 'Unstoppable Streak', description: 'Win 7 games in a row', icon: 'Zap', tier: 'silver', xpReward: 400 },
  { id: 'streak-10', title: 'Invincible Streak', description: 'Win 10 games in a row', icon: 'Shield', tier: 'gold', xpReward: 600 },
  { id: 'streak-15', title: 'Godlike Streak', description: 'Win 15 games in a row', icon: 'Sun', tier: 'gold', xpReward: 1000 },
  { id: 'streak-20', title: 'Impossible', description: 'Win 20 games in a row', icon: 'Diamond', tier: 'platinum', xpReward: 1500 },
  { id: 'streak-25', title: 'Cheating?', description: 'Win 25 games in a row', icon: 'Star', tier: 'platinum', xpReward: 2000 },
  { id: 'streak-30', title: 'AI Level', description: 'Win 30 games in a row', icon: 'Trophy', tier: 'platinum', xpReward: 3000 },

  // ===== UNIQUE BOTS (10) =====
  { id: 'bots-1', title: 'Hunter', description: 'Defeat 1 unique bot', icon: 'Crosshair', tier: 'bronze', xpReward: 100 },
  { id: 'bots-3', title: 'Bot Crusher', description: 'Defeat 3 unique bots', icon: 'Swords', tier: 'bronze', xpReward: 200 },
  { id: 'bots-5', title: 'Bot Hunter', description: 'Defeat 5 unique bots', icon: 'Target', tier: 'silver', xpReward: 300 },
  { id: 'bots-7', title: 'Assassin', description: 'Defeat 7 unique bots', icon: 'Skull', tier: 'silver', xpReward: 400 },
  { id: 'bots-10', title: 'Bot Slayer', description: 'Defeat 10 unique bots', icon: 'Sword', tier: 'silver', xpReward: 600 },
  { id: 'bots-12', title: 'Nemesis', description: 'Defeat 12 unique bots', icon: 'Flame', tier: 'gold', xpReward: 800 },
  { id: 'bots-15', title: 'Reaper', description: 'Defeat 15 unique bots', icon: 'Hourglass', tier: 'gold', xpReward: 1000 },
  { id: 'bots-20', title: 'Annihilator', description: 'Defeat 20 unique bots', icon: 'Medal', tier: 'gold', xpReward: 1500 },
  { id: 'bots-25', title: 'Extinction Event', description: 'Defeat 25 unique bots', icon: 'Sun', tier: 'platinum', xpReward: 2000 },
  { id: 'bots-30', title: 'The One', description: 'Defeat 30 unique bots', icon: 'Trophy', tier: 'platinum', xpReward: 3000 },

  // ===== SPEED WINS (5) =====
  { id: 'speed-30', title: 'Lightning', description: 'Win in under 30 moves', icon: 'Zap', tier: 'silver', xpReward: 200 },
  { id: 'speed-25', title: 'Blitz', description: 'Win in under 25 moves', icon: 'Timer', tier: 'silver', xpReward: 300 },
  { id: 'speed-20', title: 'Blitzkrieg', description: 'Win in under 20 moves', icon: 'Flame', tier: 'gold', xpReward: 400 },
  { id: 'speed-15', title: 'Speed Demon', description: 'Win in under 15 moves', icon: 'Zap', tier: 'gold', xpReward: 600 },
  { id: 'speed-10', title: 'Instant', description: 'Win in under 10 moves', icon: 'Star', tier: 'platinum', xpReward: 1000 },

  // ===== ENDURANCE WINS (5) =====
  { id: 'endurance-40', title: 'Patient', description: 'Win in over 40 moves', icon: 'Hourglass', tier: 'silver', xpReward: 200 },
  { id: 'endurance-50', title: 'Persistent', description: 'Win in over 50 moves', icon: 'Shield', tier: 'silver', xpReward: 300 },
  { id: 'endurance-60', title: 'Marathon', description: 'Win in over 60 moves', icon: 'Award', tier: 'gold', xpReward: 400 },
  { id: 'endurance-80', title: 'Siege', description: 'Win in over 80 moves', icon: 'Crown', tier: 'gold', xpReward: 600 },
  { id: 'endurance-100', title: 'War of Attrition', description: 'Win in over 100 moves', icon: 'Trophy', tier: 'platinum', xpReward: 1000 },

  // ===== RATING MILESTONES (5) =====
  { id: 'rating-1200', title: 'Prodigy', description: 'Defeat a bot rated 1200+', icon: 'Star', tier: 'gold', xpReward: 500 },
  { id: 'rating-1400', title: 'Expert', description: 'Defeat a bot rated 1400+', icon: 'Crown', tier: 'gold', xpReward: 700 },
  { id: 'rating-1600', title: 'Legendary', description: 'Defeat a bot rated 1600+', icon: 'Medal', tier: 'platinum', xpReward: 1000 },
  { id: 'rating-2000', title: 'Grandmaster', description: 'Defeat a bot rated 2000+', icon: 'Trophy', tier: 'platinum', xpReward: 1500 },
  { id: 'rating-2500', title: 'Engine', description: 'Defeat a bot rated 2500+', icon: 'Diamond', tier: 'platinum', xpReward: 2500 },

  // ===== OPENINGS (5) =====
  { id: 'opening-student', title: 'Opening Student', description: 'Learn 1 opening variation', icon: 'BookOpen', tier: 'bronze', xpReward: 100 },
  { id: 'opening-scholar', title: 'Opening Scholar', description: 'Learn 5 opening variations', icon: 'Scroll', tier: 'silver', xpReward: 250 },
  { id: 'opening-master', title: 'Opening Master', description: 'Learn 10 opening variations', icon: 'BookOpen', tier: 'gold', xpReward: 500 },
  { id: 'opening-expert', title: 'Opening Expert', description: 'Learn 25 opening variations', icon: 'Crown', tier: 'platinum', xpReward: 1000 },
  { id: 'opening-encyclopedia', title: 'Opening Encyclopedia', description: 'Learn 50 opening variations', icon: 'Library', tier: 'platinum', xpReward: 2000 },

  // ===== ENDGAMES (5) =====
  { id: 'endgame-student', title: 'Endgame Student', description: 'Complete 1 endgame drill', icon: 'Target', tier: 'bronze', xpReward: 100 },
  { id: 'endgame-apprentice', title: 'Endgame Apprentice', description: 'Complete 5 endgame drills', icon: 'Crosshair', tier: 'silver', xpReward: 250 },
  { id: 'endgame-master', title: 'Endgame Master', description: 'Complete 10 endgame drills', icon: 'Crown', tier: 'gold', xpReward: 500 },
  { id: 'endgame-expert', title: 'Endgame Expert', description: 'Complete 25 endgame drills', icon: 'Star', tier: 'platinum', xpReward: 1000 },
  { id: 'endgame-legend', title: 'Endgame Legend', description: 'Complete 50 endgame drills', icon: 'Trophy', tier: 'platinum', xpReward: 2000 },

  // ===== MINIGAMES (5) =====
  { id: 'arcade-gamer', title: 'Gamer', description: 'Play 1 minigame', icon: 'Joystick', tier: 'bronze', xpReward: 50 },
  { id: 'arcade-regular', title: 'Arcade Regular', description: 'Play 5 minigames', icon: 'Zap', tier: 'silver', xpReward: 100 },
  { id: 'arcade-pro', title: 'Arcade Pro', description: 'Play 10 minigames', icon: 'Star', tier: 'gold', xpReward: 250 },
  { id: 'arcade-champion', title: 'Arcade Champion', description: 'Play 25 minigames', icon: 'Trophy', tier: 'platinum', xpReward: 500 },
  { id: 'arcade-legend', title: 'Arcade Legend', description: 'Play 50 minigames', icon: 'Crown', tier: 'platinum', xpReward: 1000 },

  // ===== MISCELLANEOUS (10) =====
  { id: 'draw-1', title: 'Peacemaker', description: 'Draw your first game', icon: 'Shield', tier: 'bronze', xpReward: 50 },
  { id: 'draw-5', title: 'Diplomat', description: 'Draw 5 games', icon: 'Award', tier: 'silver', xpReward: 150 },
  { id: 'draw-10', title: 'Stalemate Master', description: 'Draw 10 games', icon: 'Medal', tier: 'silver', xpReward: 300 },
  { id: 'loss-1', title: 'Learning', description: 'Lose your first game', icon: 'Book', tier: 'bronze', xpReward: 25 },
  { id: 'loss-10', title: 'Resilient', description: 'Lose 10 games', icon: 'Shield', tier: 'bronze', xpReward: 100 },
  { id: 'loss-50', title: 'Unbreakable', description: 'Lose 50 games', icon: 'Diamond', tier: 'silver', xpReward: 300 },
  { id: 'perfectionist', title: 'Perfectionist', description: 'Win with 100% accuracy', icon: 'Gem', tier: 'platinum', xpReward: 2000 },
  { id: 'comeback', title: 'Comeback King', description: 'Win after being down material', icon: 'Crown', tier: 'gold', xpReward: 800 },
  { id: 'tactician', title: 'Tactician', description: 'Win with a brilliant move', icon: 'Brain', tier: 'gold', xpReward: 600 },
];

// --- Context ---

// Helper function
const calculateLevel = (currentXp: number) => {
    let newLevel = 1;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
        if (currentXp >= LEVEL_THRESHOLDS[i]) {
            newLevel = i + 1;
        } else {
            break;
        }
    }
    return newLevel;
};

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

export function RewardsProvider({ children }: { children: React.ReactNode }) {
  // Initial state
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [stars, setStars] = useState(0);
  const [achievements, setAchievements] = useState<Record<string, AchievementProgress>>({});
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Stats
  const [stats, setStats] = useState<UserStats>({
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      openingsCompleted: 0,
      puzzlesSolved: 0,
      lessonsCompleted: 0,
      endgamesCompleted: 0,
      minigamesPlayed: 0,
      bestWinELO: 0,
      uniqueBotsDefeated: []
  });

  // Track consecutive wins for streak achievement (session based for now, could persist)
  // Track consecutive wins for streak achievement (session based for now, could persist)
  const [winStreak, setWinStreak] = useState(0); 
  const [streak, setStreak] = useState(0); // Daily Login Streak
  const [newUnlock, setNewUnlock] = useState<string | null>(null);
  const [dailyQuests, setDailyQuests] = useState<QuestProgress[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage OR UserProfile
  useEffect(() => {
    // 1. Try to load legacy context storage
    const saved = localStorage.getItem(STORAGE_KEY);
    let loadedState: Partial<RewardsState> = {};
    
    if (saved) {
        try {
            loadedState = JSON.parse(saved);
        } catch (e) {
            console.error("Failed to load rewards:", e);
        }
    }

    // 2. Hydrate/Override from User Profile (Source of Truth)
    // This fixes the issue where login updates profile but RewardsContext stays stale/empty
    import('@/lib/user-profile').then(({ getUserProfile }) => {
        const profile = getUserProfile();
        
        // If we have a logged-in profile, its stats should take precedence over local cache
        // effectively "loading" the save from the DB/Profile
        if (profile) {
            console.log('[Rewards] Hydrating from User Profile:', profile.username);
            setUserProfile(profile);
            const loadedXp = profile.xp || loadedState.xp || 0;
            setXp(loadedXp);
            
            // Recalculate level immediately based on authoritative XP
            const correctLevel = calculateLevel(loadedXp);
            setLevel(correctLevel);
            console.log(`[Rewards] Synced Level: ${correctLevel} (XP: ${loadedXp})`);
            
            // Sync specific fields - NOTE: Profile uses 'gamesPlayed' but UserStats uses 'totalGames'
            if (profile.stats) {
                 setStats(prev => ({
                     ...prev,
                     ...(loadedState.stats || {}),
                     totalGames: profile.stats!.gamesPlayed || 0,
                     puzzlesSolved: profile.stats!.puzzlesSolved || 0,
                     // Authoritative count is the larger of the stat or the array length to fix out-of-sync profiles
                     lessonsCompleted: Math.max(profile.stats!.lessonsCompleted || 0, profile.completedLessons?.length || 0),
                     openingsCompleted: profile.openingHistory ? Object.keys(profile.openingHistory).length : 0,
                     endgamesCompleted: profile.stats!.endgamesCompleted || 0,
                     minigamesPlayed: profile.stats!.minigamesPlayed || 0,
                     wins: profile.stats!.wins || 0,
                     losses: profile.stats!.losses || 0,
                     draws: profile.stats!.draws || 0
                 }));
            }
            
            if (profile.completedLessons) {
                setCompletedLessons(profile.completedLessons);
            }

            if (profile.achievements) {
                // Merge with existing locally loaded achievements, favoring profile source of truth
                setAchievements(prev => ({
                    ...prev,
                    ...profile.achievements
                }));
            }

            if (profile.activityLog) {
                setActivityLog(profile.activityLog as ActivityLogItem[]);
            }

            // Hydrate streaks and daily quests from profile/cache
            if (profile.dailyQuests && profile.dailyQuests.length > 0) {
                setDailyQuests(profile.dailyQuests as QuestProgress[]);
            } else if (loadedState.dailyQuests && loadedState.dailyQuests.length > 0) {
                setDailyQuests(loadedState.dailyQuests);
            }

            if (profile.streak !== undefined) {
                setStreak(profile.streak);
            } else if (loadedState.streak !== undefined) {
                setStreak(loadedState.streak as number);
            }
            
            // Items wrapped in try-catch logic above for loadedState are fine
        } else {
             // Guest / No-Profile: Use loaded state directly
             setXp(loadedState.xp || 0);
             setLevel(loadedState.level || 1);
             setStars(loadedState.stars || 0);
             setAchievements(loadedState.achievements || {});
             setUnlockedItems(loadedState.unlockedItems || []);
             setCompletedLessons(loadedState.completedLessons || []);
             setActivityLog(loadedState.activityLog || []);
            setDailyQuests(loadedState.dailyQuests || []);
            if (loadedState.streak !== undefined) {
                setStreak(loadedState.streak as number);
            }
            setStats(loadedState.stats || {
                totalGames: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                openingsCompleted: 0,
                puzzlesSolved: 0,
                lessonsCompleted: 0,
                endgamesCompleted: 0,
                minigamesPlayed: 0,
                bestWinELO: 0,
                uniqueBotsDefeated: []
            });
            // Fallback for quests will be handled by checkDailyReset
        }
        
        setIsLoaded(true);
    });
  }, []);

  const updateLocalProfile = (updates: Partial<UserProfile>) => {
      setUserProfile(prev => {
          if (!prev) {
              // If no profile in state, try to get it from storage first
              const fresh = getUserProfile();
              if (fresh) return { ...fresh, ...updates };
              return null; // Don't create partial profiles
          }
          
          // CRITICAL: Ensure nested stats are merged, not overwritten
          const newProfile = { ...prev, ...updates };
          if (updates.stats && prev.stats) {
              newProfile.stats = {
                  ...prev.stats,
                  ...updates.stats
              };
          }
          
          return newProfile;
      });
  };

  // Daily Reset & Streak Logic
  useEffect(() => {
    if (!isLoaded) return;

    const performDailyCheck = () => {
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const user = getUserProfile(); // Use the loaded profile for source of truth on persistence
        const lastActive = user?.lastActiveDate;

        console.log(`[Rewards] Checking Daily Reset. Today: ${today}, LastActive: ${lastActive}`);

        let newQuests = dailyQuests;
        let newStreak = streak;
        let needsUpdate = false;

        // 1. Check if it's a new day (or if we have no quests)
        if (lastActive !== today || dailyQuests.length === 0) {
            console.log('[Rewards] It is a new day! Resetting quests...');
            
            // Randomize Quests for variety? For now, standard set.
            newQuests = [
                { id: 'daily-puzzles', progress: 0, target: 5, completed: false, lastUpdated: Date.now(), rewardXp: 100, title: 'Tactics Trainer' },
                { id: 'daily-games', progress: 0, target: 3, completed: false, lastUpdated: Date.now(), rewardXp: 150, title: 'Grandmaster Grind' },
                { id: 'daily-lessons', progress: 0, target: 1, completed: false, lastUpdated: Date.now(), rewardXp: 200, title: 'Knowledge is Power' }
            ];
            
            setDailyQuests(newQuests);
            needsUpdate = true;
        }

        // 2. Check Streak
        if (lastActive !== today) {
            if (!lastActive) {
                // First ever login
                newStreak = 1;
            } else {
                const lastDate = new Date(lastActive);
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                
                // Compare YYYY-MM-DD strings to avoid time issues
                if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
                    // Logged in yesterday -> Increment
                    newStreak = (user?.streak || 0) + 1;
                    console.log(`[Rewards] Streak continued! New streak: ${newStreak}`);
                } else {
                    // Missed a day -> Reset
                    newStreak = 1;
                    console.log('[Rewards] Streak broken. Reset to 1.');
                }
            }
            setStreak(newStreak);
            needsUpdate = true;
        }

        // 3. Persist if changed
        if (needsUpdate) {
            updateUserProfile({
                dailyQuests: newQuests,
                streak: newStreak,
                lastActiveDate: today
            });
        }
    };

    performDailyCheck();
  }, [isLoaded]); // Run once after initial load

  // Save to local storage
  useEffect(() => {
      if (!isLoaded) return;
      const stateToSave = { xp, level, stars, achievements, unlockedItems, completedLessons, activityLog, stats, dailyQuests, streak };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [xp, level, stars, achievements, unlockedItems, completedLessons, activityLog, stats, dailyQuests, streak, isLoaded]);



  const addActivity = (item: Omit<ActivityLogItem, 'id' | 'timestamp'>) => {
      setActivityLog(prev => {
          const newItem = {
              ...item,
              id: Math.random().toString(36).substr(2, 9),
              timestamp: Date.now()
          };
          const newLog = [newItem, ...prev].slice(0, 100);
          
          // Fire-and-forget sync to DB
          // We sync the whole log array (top 100) to keep it simple, JSONB can handle it
          updateUserProfile({ activityLog: newLog }).catch(e => console.error("Failed to sync activity log:", e));

          return newLog;
      }); 
  };

  const updateQuestProgress = (questId: string, amount: number = 1, metadata?: { theme?: string }) => {
      setDailyQuests(prev => prev.map(q => {
          if (q.id === questId && !q.completed) {
              // Check requirements if they exist
              if (q.requiredTags && q.requiredTags.length > 0) {
                  // If quest has required tags, and no theme provided, or theme doesn't match, ignore.
                  // For simplicity, we check if the provided theme is IN the required tags (or matches match logic)
                  // Assuming single theme passed for now.
                  if (!metadata?.theme || !q.requiredTags.includes(metadata.theme)) {
                      return q;
                  }
              }

              const newProgress = q.progress + amount;
              const isNowCompleted = newProgress >= q.target;
              if (isNowCompleted) {
                  addXp(100); // Daily quest reward
                  addActivity({
                      type: 'achievement',
                      itemId: questId,
                      result: 'unlocked',
                      details: 'Daily Quest Completed'
                  });
              }
              return { ...q, progress: newProgress, completed: isNowCompleted, lastUpdated: Date.now() };
          }
          return q;
      }));
  };

  const addXp = (amount: number) => {
      setXp(prev => {
          const newXp = prev + amount;
          const newLevel = calculateLevel(newXp);
          if (newLevel > level) {
              setLevel(newLevel);
              addActivity({
                  type: 'achievement',
                  itemId: `level-${newLevel}`,
                  result: 'unlocked',
                  details: `Reached Level ${newLevel}`
              });
          }
          
          // Sync to Supabase (Fire and forget)
          // Use the computed newXp directly to avoid closure-stale 'xp'
          updateUserProfile({ xp: newXp }).then(() => {
              updateLocalProfile({ xp: newXp });
          }).catch((err: any) => console.error("Failed to sync XP:", err));

          return newXp;
      });
  };

  const addStar = (amount: number) => {
      setStars(prev => prev + amount);
  };

  const markLessonComplete = (lessonId: string, customXp?: number) => {
      // Avoid duplicates
      if (completedLessons.includes(lessonId)) return;

      const newCompletedLessons = [...completedLessons, lessonId];
      setCompletedLessons(newCompletedLessons);

      // Update Stats - use authoritative length for lessonsCompleted
      const newStats = {
          ...stats,
          lessonsCompleted: newCompletedLessons.length
      };
      
      setStats(newStats);
      
      // Check Lesson Achievements
      const newLessons = newStats.lessonsCompleted;
      if (newLessons >= 1) unlockAchievement('lessons-1');
      if (newLessons >= 3) unlockAchievement('lessons-3');
      if (newLessons >= 5) unlockAchievement('lessons-5');
      if (newLessons >= 10) unlockAchievement('lessons-10');
      if (newLessons >= 20) unlockAchievement('lessons-20');
      if (newLessons >= 30) unlockAchievement('lessons-30');
      if (newLessons >= 40) unlockAchievement('lessons-40');
      if (newLessons >= 50) unlockAchievement('lessons-50');
      if (newLessons >= 75) unlockAchievement('lessons-75');
      if (newLessons >= 100) unlockAchievement('lessons-100');

      const xpToGain = customXp !== undefined ? customXp : 50;
      const newXp = xp + xpToGain;
      
      console.log(`[Rewards] Completing lesson ${lessonId}. Gaining ${xpToGain} XP. New Total: ${newXp}`);

      addXp(xpToGain); // Update local state for immediate feedback
      
      addActivity({
          type: 'lesson',
          itemId: lessonId,
          result: 'completed',
          details: 'Lesson Completed'
      });

      updateQuestProgress('daily-lessons');

      // Sync EVERYTHING to Supabase in one go to avoid race conditions
      // Use the newly computed values directly
      updateUserProfile({ 
          xp: newXp,
          completedLessons: newCompletedLessons,
          stats: {
              gamesPlayed: newStats.totalGames,
              puzzlesSolved: newStats.puzzlesSolved,
              lessonsCompleted: newStats.lessonsCompleted,
              wins: newStats.wins,
              losses: newStats.losses,
              draws: newStats.draws
          }
      }).then(() => {
          // Update the reactive profile used by UI/Leaderboard
          updateLocalProfile({ 
              xp: newXp, 
              completedLessons: newCompletedLessons,
              stats: {
                  gamesPlayed: newStats.totalGames,
                  puzzlesSolved: newStats.puzzlesSolved,
                  lessonsCompleted: newStats.lessonsCompleted,
                  wins: newStats.wins,
                  losses: newStats.losses,
                  draws: newStats.draws
              }
          });
      }).catch(err => console.error("Failed to sync lesson completion:", err));
  };

  const checkPuzzleComplete = (puzzleTheme?: string) => {
      setStats(prev => {
          const newCount = prev.puzzlesSolved + 1;
          const newXp = xp + 10;
          
          // Check Puzzle Achievements
          if (newCount >= 1) unlockAchievement('puzzles-1');
          if (newCount >= 5) unlockAchievement('puzzles-5');
          if (newCount >= 10) unlockAchievement('puzzles-10');
          if (newCount >= 25) unlockAchievement('puzzles-25');
          if (newCount >= 50) unlockAchievement('puzzles-50');
          if (newCount >= 100) unlockAchievement('puzzles-100');
          if (newCount >= 150) unlockAchievement('puzzles-150');
          if (newCount >= 250) unlockAchievement('puzzles-250');
          if (newCount >= 500) unlockAchievement('puzzles-500');

          updateQuestProgress('daily-puzzles', 1, { theme: puzzleTheme });
          
          // Sync to Supabase - Atomic update with new XP and stats
          updateUserProfile({ 
              xp: newXp,
              stats: { 
                  gamesPlayed: prev.totalGames,
                  puzzlesSolved: newCount,
                  lessonsCompleted: prev.lessonsCompleted,
                  wins: prev.wins,
                  losses: prev.losses,
                  draws: prev.draws
              } 
          }).then(() => {
              updateLocalProfile({
                  xp: newXp,
                  stats: {
                      gamesPlayed: prev.totalGames,
                      puzzlesSolved: newCount,
                      lessonsCompleted: prev.lessonsCompleted,
                      wins: prev.wins,
                      losses: prev.losses,
                      draws: prev.draws
                  }
              });
          }).catch(err => console.error("Failed to sync puzzle completion:", err));

          return { ...prev, puzzlesSolved: newCount };
      });
      // We don't call addXp(10) separately to avoid secondary sync/race
      setXp(prev => prev + 10); 
  };

  const markOpeningComplete = (openingId: string) => {
    // 1. Record in persistence (profile)
    import('@/lib/user-profile').then(({ recordOpeningPlayed, getUserProfile }) => {
        recordOpeningPlayed(openingId);
        
        // 2. Update local stats immediately for UI feedback
        const profile = getUserProfile();
        // Calculate distinct openings count based on updated profile
        const uniqueCount = profile?.openingHistory ? Object.keys(profile.openingHistory).length : 0;
        
        setStats(prev => {
            // Only increment if we think it's new (or just trust the uniqueCount from profile)
            const newCount = uniqueCount > prev.openingsCompleted ? uniqueCount : prev.openingsCompleted + (uniqueCount === 0 ? 1 : 0); 
            
            // Check Achievements
            if (newCount >= 1) unlockAchievement('opening-student');
            if (newCount >= 5) unlockAchievement('opening-scholar');
            if (newCount >= 10) unlockAchievement('opening-master');
            if (newCount >= 25) unlockAchievement('opening-expert');
            if (newCount >= 50) unlockAchievement('opening-encyclopedia');

            return { ...prev, openingsCompleted: newCount };
        });

        addActivity({
            type: 'opening',
            itemId: openingId,
            result: 'completed',
            details: `Learned Variation`
        });
        
        addXp(25); // Small XP reward for finish
    });
  };

  const markEndgameComplete = (endgameId: string) => {
      setStats(prev => {
          const newCount = prev.endgamesCompleted + 1;
          
          if (newCount >= 1) unlockAchievement('endgame-student');
          if (newCount >= 5) unlockAchievement('endgame-apprentice');
          if (newCount >= 10) unlockAchievement('endgame-master');
          if (newCount >= 25) unlockAchievement('endgame-expert');
          if (newCount >= 50) unlockAchievement('endgame-legend');

          // Sync to Supabase
          updateUserProfile({ 
              stats: { 
                  gamesPlayed: prev.totalGames,
                  puzzlesSolved: prev.puzzlesSolved,
                  lessonsCompleted: prev.lessonsCompleted,
                  wins: prev.wins,
                  losses: prev.losses,
                  draws: prev.draws,
                  endgamesCompleted: newCount,
                  minigamesPlayed: prev.minigamesPlayed
              } 
          }).catch(err => console.error("Failed to sync endgame stat:", err));

          return { ...prev, endgamesCompleted: newCount };
      });
      
      addActivity({
          type: 'endgame',
          itemId: endgameId,
          result: 'completed',
          details: 'Endgame Drill Completed'
      });
      addXp(30);
  };

  const markMinigameComplete = (minigameId: string, score: number) => {
      setStats(prev => {
          const newCount = prev.minigamesPlayed + 1;
          
          if (newCount >= 1) unlockAchievement('arcade-gamer');
          if (newCount >= 5) unlockAchievement('arcade-regular');
          if (newCount >= 10) unlockAchievement('arcade-pro');
          if (newCount >= 25) unlockAchievement('arcade-champion');
          if (newCount >= 50) unlockAchievement('arcade-legend');

          // Sync to Supabase
          updateUserProfile({ 
              stats: { 
                  gamesPlayed: prev.totalGames,
                  puzzlesSolved: prev.puzzlesSolved,
                  lessonsCompleted: prev.lessonsCompleted,
                  wins: prev.wins,
                  losses: prev.losses,
                  draws: prev.draws,
                  endgamesCompleted: prev.endgamesCompleted,
                  minigamesPlayed: newCount
              } 
          }).catch(err => console.error("Failed to sync minigame stat:", err));

          return { ...prev, minigamesPlayed: newCount };
      });

      addActivity({
          type: 'minigame',
          itemId: minigameId,
          result: 'played',
          details: `Played Minigame (Score: ${score})`
      });
      addXp(15 + Math.floor(score / 100)); // Dynamic XP based on score
  };

  const unlockAchievement = (id: string) => {
      setAchievements(prev => {
          if (prev[id]?.unlocked) return prev; // Already unlocked

          const achievement = ACHIEVEMENTS.find(a => a.id === id);
          if (achievement) {
              addXp(achievement.xpReward);
              addActivity({
                  type: 'achievement',
                  itemId: id,
                  result: 'unlocked',
                  details: achievement.title
              });
          }

          // Trigger Notification
          setNewUnlock(id);

          const newAchievements = {
              ...prev,
              [id]: { unlocked: true, unlockedAt: Date.now() }
          };

          // Sync to Supabase immediately
          updateUserProfile({ achievements: newAchievements }).then(() => {
              updateLocalProfile({ achievements: newAchievements });
          }).catch(err => console.error("Failed to sync achievement:", err));

          return newAchievements;
      });
  };

  const clearNewUnlock = () => setNewUnlock(null);

  const checkGameEndAchievements = (result: 'win' | 'loss' | 'draw', moveCount: number, botId?: string, botRating: number = 0) => {
      let earnedXp = 0;
      
      // Update Stats
      setStats(prev => {
          const newStats = { ...prev, totalGames: prev.totalGames + 1 };
          if (result === 'win') {
              newStats.wins++;
              if (botRating > newStats.bestWinELO) newStats.bestWinELO = botRating;
              if (botId && !prev.uniqueBotsDefeated.includes(botId)) {
                  newStats.uniqueBotsDefeated = [...prev.uniqueBotsDefeated, botId];
              }
          }
          if (result === 'loss') newStats.losses++;
          if (result === 'draw') newStats.draws++;
          return newStats;
      });

      // Logic
      if (result === 'win') {
          unlockAchievement('wins-1');
          setWinStreak(prev => prev + 1);
          
          // Check for achievements based on updated state (using approximations since setStats is async)
          if (botRating >= 1200) unlockAchievement('rating-1200');
          if (botRating >= 1400) unlockAchievement('rating-1400');
          if (botRating >= 1600) unlockAchievement('rating-1600');
          if (botRating >= 2000) unlockAchievement('rating-2000');
          
          if (moveCount < 30) unlockAchievement('speed-30');
          if (moveCount < 25) unlockAchievement('speed-25');
          if (moveCount < 20) unlockAchievement('speed-20');
          if (moveCount < 15) unlockAchievement('speed-15');
          if (moveCount < 10) unlockAchievement('speed-10');

          if (moveCount > 40) unlockAchievement('endurance-40');
          if (moveCount > 50) unlockAchievement('endurance-50');
          if (moveCount > 60) unlockAchievement('endurance-60');

          // Win Streaks (using local winStreak + 1)
          const currentStreak = winStreak + 1;
          if (currentStreak >= 2) unlockAchievement('streak-2');
          if (currentStreak >= 3) unlockAchievement('streak-3');
          if (currentStreak >= 4) unlockAchievement('streak-4');
          if (currentStreak >= 5) unlockAchievement('streak-5');
          if (currentStreak >= 7) unlockAchievement('streak-7');
          if (currentStreak >= 10) unlockAchievement('streak-10');
          
          // Check unique bots (need to account for the one just beaten)
          const currentUnique = stats.uniqueBotsDefeated.length + (botId && !stats.uniqueBotsDefeated.includes(botId) ? 1 : 0);
          if (currentUnique >= 1) unlockAchievement('bots-1');
          if (currentUnique >= 3) unlockAchievement('bots-3');
          if (currentUnique >= 5) unlockAchievement('bots-5');
          if (currentUnique >= 7) unlockAchievement('bots-7');
          if (currentUnique >= 10) unlockAchievement('bots-10');

          // Win Count Milestones (current wins + 1)
          const newWins = stats.wins + 1;
          if (newWins >= 1) unlockAchievement('wins-1');
          if (newWins >= 5) unlockAchievement('wins-5');
          if (newWins >= 10) unlockAchievement('wins-10');
          if (newWins >= 25) unlockAchievement('wins-25');
          if (newWins >= 50) unlockAchievement('wins-50');
          if (newWins >= 75) unlockAchievement('wins-75');
          if (newWins >= 100) unlockAchievement('wins-100');

          const xp = 50 + Math.floor(botRating / 20); // Base XP + Rating bonus
          addXp(xp);
          earnedXp += xp;

      } else if (result === 'draw') {
          setWinStreak(0);
          unlockAchievement('draw-1');
          if (stats.draws + 1 >= 5) unlockAchievement('draw-5');
          if (stats.draws + 1 >= 10) unlockAchievement('draw-10');
          
          const xp = 25;
          addXp(xp);
          earnedXp += xp;
      } else {
          setWinStreak(0);
          unlockAchievement('loss-1');
          if (stats.losses + 1 >= 10) unlockAchievement('loss-10');
          if (stats.losses + 1 >= 50) unlockAchievement('loss-50');
          
          const xp = 10; // Participation XP
          addXp(xp);
          earnedXp += xp;
      }

      // Games Played Milestones (current total + 1)
      const newTotal = stats.totalGames + 1;
      if (newTotal >= 1) unlockAchievement('games-1');
      if (newTotal >= 5) unlockAchievement('games-5');
      if (newTotal >= 10) unlockAchievement('games-10');
      if (newTotal >= 25) unlockAchievement('games-25');
      if (newTotal >= 50) unlockAchievement('games-50');
      if (newTotal >= 75) unlockAchievement('games-75');
      if (newTotal >= 100) unlockAchievement('games-100');

      // Explicitly log the game activity
      addActivity({
          type: 'game',
          itemId: 'game',
          result: result,
          details: botId ? `vs ${botId} (${botRating})` : 'vs Computer'
      });

      updateQuestProgress('daily-games');

      // Sync Stats to Supabase
      const deltaWins = result === 'win' ? 1 : 0;
      const deltaLosses = result === 'loss' ? 1 : 0;
      const deltaDraws = result === 'draw' ? 1 : 0;
      
      const syncStats = {
          gamesPlayed: stats.totalGames + 1,
          wins: stats.wins + deltaWins,
          losses: stats.losses + deltaLosses,
          draws: stats.draws + deltaDraws,
          puzzlesSolved: stats.puzzlesSolved,
          lessonsCompleted: stats.lessonsCompleted
      };
      
      // Basic ELO Rating Update Logic
      let ratingChange = 0;
      const currentRating = userProfile?.rating || 800;
      if (result === 'win') {
          const expected = 1 / (1 + Math.pow(10, (botRating - currentRating) / 400));
          ratingChange = Math.round(32 * (1 - expected));
      } else if (result === 'loss') {
          const expected = 1 / (1 + Math.pow(10, (botRating - currentRating) / 400));
          ratingChange = Math.round(32 * (0 - expected));
      } else {
          const expected = 1 / (1 + Math.pow(10, (botRating - currentRating) / 400));
          ratingChange = Math.round(32 * (0.5 - expected));
      }
      
      const newRating = Math.max(100, currentRating + ratingChange);
      const newXp = xp + earnedXp; // Add the XP earned in this game to total

      console.log(`[Rewards] Game End. Earned: ${earnedXp} XP. New Total: ${newXp}. Result: ${result}`);
      
      updateUserProfile({ 
          xp: newXp,
          stats: syncStats,
          rating: newRating 
      }).then(() => {
          updateLocalProfile({ 
              xp: newXp,
              stats: syncStats,
              rating: newRating
          });
      }).catch(err => console.error("Failed to sync game end progress:", err));

      return earnedXp;
  };
  
  const resetProgress = () => {
      setXp(0);
      setLevel(1);
      setStars(0);
      setAchievements({});
      setUnlockedItems([]);
      setCompletedLessons([]);
      setActivityLog([]);
      setStats({
          totalGames: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          openingsCompleted: 0,
          puzzlesSolved: 0,
          lessonsCompleted: 0,
          endgamesCompleted: 0,
          minigamesPlayed: 0,
          bestWinELO: 0,
          uniqueBotsDefeated: []
      });
      setWinStreak(0);
  };

  return (
    <RewardsContext.Provider value={{
        xp,
        level,
        stars,
        achievements,
        unlockedItems,
        stats,
        activityLog,
        completedLessons,
        addXp,
        addStar,
        unlockAchievement,
        checkGameEndAchievements,
        checkPuzzleComplete,
        addActivity,
        markLessonComplete,
        markOpeningComplete,
        markEndgameComplete,
        markMinigameComplete,
        resetProgress,
        winStreak,
        streak, // Add this
        newUnlock,
        clearNewUnlock,
        dailyQuests,
        userProfile,
        updateLocalProfile
    }}>
      {children}
    </RewardsContext.Provider>
  );
}

export function useRewards() {
  const context = useContext(RewardsContext);
  if (context === undefined) {
    throw new Error('useRewards must be used within a RewardsProvider');
  }
  return context;
}
