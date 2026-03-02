/**
 * Chess.com-Style Bot Profiles
 * Inspired by Chess.com's bot personalities and progression system
 */

export type Personality =
  | "balanced"
  | "aggressive"
  | "positional"
  | "tactical"
  | "solid"
  | "tricky"
  | "time_scrambler"
  | "theoretical"
  | "chaotic"
  | "kid";

export const SPECIAL_BOT_IDS = {
  BUDDY: 'bot-chessbotbuddy',
  ADAPTIVE: 'bot-adaptive'
} as const;

export interface BotProfile {
  id: string;
  name: string;        // Human first name
  nickname: string;    // Former bot name
  tagline: string;
  personality: Personality;
  elo: number;
  
  // Visuals
  avatar: string;
  color: string;
  description: string;
  longBio?: string;
  isBoss?: boolean;
  category: 'beginner' | 'intermediate' | 'advanced' | 'master' | 'special';
  
  // Engine Parameters (Legacy - mostly handled by new ELO system now but kept for UI)
  skillLevel: number; 
  stockfishDepth: number;
  moveSpeed?: number; // Scaling factor for think time
  
  nationality?: string; // e.g. 'US', 'PH', 'MX'
  audioPath?: string; // Path to audio file (e.g. voice commentary)
  
  // Opening Repertoire Preferences
  openingPreferences?: {
      white: string[]; // List of IDs/Keywords for White
      blackVsE4: string[]; 
      blackVsD4: string[];
      blackVsC4: string[]; // English/Reti/Flank responses
      blackVsModern: string[]; // Strategy against Modern/Flank or specific setups
  };
}

export const BOT_PROFILES: BotProfile[] = [
// --- BEGINNER (0 - 1000) ---
  {
    id: "bot-rookie",
    name: "Ley-an", 
    nickname: "Novice", 
    tagline: "Just learning the rules",
    personality: "kid",
    elo: 400,
    skillLevel: 0,
    stockfishDepth: 1,
    avatar: "/avatars/bot-juliana.png", 
    color: "#7fa650",
    description: "Absolute beginner. Makes random moves and frequent blunders.",
    category: 'beginner',
    moveSpeed: 0.5,
    nationality: 'US',
    audioPath: '/Ley-an_gen_sp100_s50_sb70_se21_b_m2.mp3'
  },
  {
    id: "bot-novice",
    name: "James", 
    nickname: "Beginner",
    tagline: "Learning fundamentals",
    personality: "balanced",
    elo: 800,
    skillLevel: 2,
    stockfishDepth: 3,
    avatar: "/avatars/bot-blitz-bunny.png",
    color: "#85b0d6",
    description: "Knows how pieces move but lacks strategy. Frequent one-move blunders.",
    category: 'beginner',
    moveSpeed: 0.8,
    nationality: 'US'
  },
  {
    id: "bot-learner",
    name: "Orion",
    nickname: "Club Learner",
    tagline: "Improving every day",
    personality: "positional", 
    elo: 1100,
    skillLevel: 5,
    stockfishDepth: 5,
    avatar: "/avatars/bot-bishop-bandit.png",
    color: "#f9a825",
    description: "Understands basic tactics like forks. Inconsistent play.",
    category: 'beginner',
    nationality: 'LU',
    openingPreferences: {
        white: ['italian'],
        blackVsE4: ['open-game'], // Matches "Open Game" or specifics like Italian/Ruy if name contains "Open"
        blackVsD4: ['qgd'],
        blackVsC4: ['open-game'], // "e5" ideas
        blackVsModern: ['classical']
    }
  },

  // --- INTERMEDIATE (1200 - 1800) ---
  {
    id: "bot-developing",
    name: "Z",
    nickname: "Developing",
    tagline: "Studying tactics",
    personality: "tactical",
    elo: 1425,
    skillLevel: 8,
    stockfishDepth: 8,
    avatar: "/avatars/bot-izy-knight.png",
    color: "#8b6f47",
    description: "Sees simple tactics and attacks. Struggles with time management.",
    category: 'intermediate',
    nationality: 'JP',
    openingPreferences: {
        white: ['london'],
        blackVsE4: ['caro-kann'],
        blackVsD4: ['qgd'],
        blackVsC4: ['symmetrical-english'],
        blackVsModern: ['d5']
    }
  },
  {
    id: "bot-solid",
    name: "Warren",
    nickname: "Solid Amateur",
    tagline: "Defense first",
    personality: "solid",
    elo: 1550,
    skillLevel: 10,
    stockfishDepth: 10,
    avatar: "/avatars/bot-rook-rocket.png",
    color: "#5c77a0",
    description: "Reliable player. Good at defense but predictable.",
    category: 'intermediate',
    nationality: 'AU',
    openingPreferences: {
        white: ['scotch'],
        blackVsE4: ['french'],
        blackVsD4: ['slav'],
        blackVsC4: ['reversed-sicilian'],
        blackVsModern: ['d5']
    }
  },
  {
    id: "bot-skilled",
    name: "Ximena", // Mexican name
    nickname: "Mexico's Rising Star",
    tagline: "U14 National Champ",
    personality: "aggressive",
    elo: 1750,
    skillLevel: 15, // Bumped slightly for "Champ" feel
    stockfishDepth: 13,
    avatar: "/avatars/bot-skilled.png",
    color: "#e67e22",
    description: "A confident and aggressive junior champion from Mexico. Loves sharp positions and spicy tactics.",
    category: 'intermediate',
    nationality: 'MX',
    openingPreferences: {
        white: ['ruy-lopez'],
        blackVsE4: ['sicilian-najdorf'],
        blackVsD4: ['kid'],
        blackVsC4: ['kid-setup'],
        blackVsModern: ['fianchetto']
    }
  },

  // --- ADVANCED (1900 - 2300) ---
  {
    id: "bot-expert",
    name: "Priya",
    nickname: "Expert",
    tagline: "Tournament veteran",
    personality: "positional",
    elo: 1950,
    skillLevel: 15,
    stockfishDepth: 15,
    avatar: "/avatars/bot-queen-midas.png",
    color: "#c44569",
    description: "Strong Indian tactician with excellent opening preparation.",
    category: 'advanced',
    nationality: 'IN',
    openingPreferences: {
        white: ['catalan'],
        blackVsE4: ['sicilian-classical'],
        blackVsD4: ['nimzo-indian'],
        blackVsC4: ['hedgehog'],
        blackVsModern: ['kid']
    }
  },
  {
    id: "bot-candidate",
    name: "Minh", // Vietnamese name
    nickname: "Calm Thinker",
    tagline: "Candidate Master",
    personality: "solid",
    elo: 2150,
    skillLevel: 17,
    stockfishDepth: 17,
    avatar: "/avatars/bot-candidate.png",
    color: "#c0392b",
    description: "A calm Vietnamese CM. Loves solid technique, tactical tricks, and improving piece placement.",
    category: 'advanced',
    nationality: 'VN',
    openingPreferences: {
        white: ['english'],
        blackVsE4: ['sicilian-sveshnikov'],
        blackVsD4: ['grunfeld'],
        blackVsC4: ['symmetrical-english'],
        blackVsModern: ['c5']
    }
  },
  {
    id: "bot-cal",
    name: "Cal",
    nickname: "The Lightning Bolt",
    tagline: "8-Year-Old Phenom",
    personality: "theoretical",
    elo: 2000,
    skillLevel: 18,
    stockfishDepth: 18,
    avatar: "/avatars/bot-cal.png",
    color: "#e74c3c",
    description: "Lightning-fast 8-year-old phenom. Deep opening prep with engine-like calculations. Expert in the London and French.",
    longBio: "Cal is a force of nature. At just 8 years old, he calculates with the speed and precision of an engine. He specializes in the London System and 1...e6 (French/Horowitz), playing deep theoretical lines with ease. Despite his lightning speed and technical endgame mastery, he is a kind and polite boy who deeply admires Karpov and Caruana.",
    category: 'advanced',
    moveSpeed: 0.1,
    nationality: 'US',
    openingPreferences: {
        white: ['london'],
        blackVsE4: ['french'],
        blackVsD4: ['horowitz-defense', 'french-defense'],
        blackVsC4: ['french-setup'],
        blackVsModern: ['e6']
    }
  },

  // --- MASTER (2400+) ---
  {
    id: "bot-master",
    name: "Eugene",
    nickname: "Master",
    tagline: "National Master",
    personality: "solid",
    elo: 2350,
    skillLevel: 18,
    stockfishDepth: 19,
    avatar: "/avatars/bot-castle-wall.png",
    color: "#718093",
    description: "Excellent all-around. Rare blunders and human-like strategy.",
    category: 'master',
    nationality: 'US',
    openingPreferences: {
        white: ['reti'],
        blackVsE4: ['sicilian-najdorf', 'petroff'],
        blackVsD4: ['nimzo-indian', 'grunfeld'],
        blackVsC4: ['double-fianchetto'],
        blackVsModern: ['d5', 'c5']
    }
  },
  {
    id: "bot-im",
    name: "Pedro",
    nickname: "The Tactician",
    tagline: "Chaos & Tactics",
    personality: "aggressive",
    elo: 2500,
    skillLevel: 19,
    stockfishDepth: 20,
    avatar: "/avatars/bot-im.png",
    color: "#f1c40f",
    description: "Creative and aggressive Filipino IM. Loves Tal-like sacrifices and complicated positions.",
    category: 'master',
    nationality: 'PH',
    openingPreferences: {
        white: ['ruy-lopez'],
        blackVsE4: ['sicilian-najdorf'],
        blackVsD4: ['grunfeld'],
        blackVsC4: ['symmetrical-english'],
        blackVsModern: ['c5', 'e5'] 
    }
  },
  {
    id: "bot-gm",
    name: "Kyle Chen",
    nickname: "Calm Killer",
    tagline: "College GM",
    personality: "tactical",
    elo: 2650,
    skillLevel: 20,
    stockfishDepth: 22,
    avatar: "/avatars/bot-gm.png",
    color: "#16a085",
    description: "A 2650 GM and college student. Plays clean, theoretical chess while surviving deadlines.",
    category: 'master',
    nationality: 'US',
    openingPreferences: {
        white: ['qgd'],
        blackVsE4: ['sicilian-sveshnikov'],
        blackVsD4: ['nimzo-indian'],
        blackVsC4: ['kid'],
        blackVsModern: ['d5', 'c5']
    }
  },
  {
    id: "bot-supergm",
    name: "Marco",
    nickname: "Super GM",
    tagline: "World Champion",
    personality: "balanced",
    elo: 2800,
    skillLevel: 19,
    stockfishDepth: 24,
    avatar: "/avatars/bot-checkmate-oracle.png",
    color: "#e74c3c",
    description: "Italian world-class champion. Extremely rare errors.",
    isBoss: true,
    category: 'master',
    nationality: 'IT',
    openingPreferences: {
        white: ['english'],
        blackVsE4: ['sicilian-classical', 'sicilian-dragon', 'sicilian-sveshnikov'],
        blackVsD4: ['grunfeld'],
        blackVsC4: ['kid', 'grunfeld'],
        blackVsModern: ['d5', 'c5']
    }
  },
  
  // --- SPECIAL ---
  {
    id: "bot-chessbotbuddy",
    name: "Buddy",
    nickname: "The Matrix",
    tagline: "Master of Infinite Possibilities (v5.3)",
    personality: "tactical",
    elo: 2000,
    skillLevel: 20,
    stockfishDepth: 20,
    avatar: "/mascot_buddy.png",
    color: "#3498db",
    description: "Buddy v5.3. Features dynamic rating matching (-200 to +150) and plays simultaneous Blitz & Rapid games on Lichess.",
    longBio: "Buddy v5.3 thinks using a hybrid approach: combining classical alpha-beta pruning for precise calculation with a neural network for human-like positional evaluation. This allows him to spot tactics like a machine but understand strategy like a master. Trained on over 2 million human games and thousands of self-play matches, Buddy is the perfect blend of calculation and intuition.",
    category: 'master',
    nationality: 'GX',
    isBoss: true
  },
  {
    id: "bot-adaptive",
    name: "Jakie",
    nickname: "Coach Jakie",
    tagline: "Adaptive Mentor",
    personality: "balanced",
    elo: -1, // Dynamic
    skillLevel: 10,
    stockfishDepth: 10,
    avatar: "/avatars/bot-adaptive.png",
    color: "#8e44ad",
    description: "A caring but strict coach who adapts to your level. Teaching you chess one move at a time.",
    category: 'special',
    nationality: 'GX',
    openingPreferences: {
        white: ['auto-favorite'],
        blackVsE4: ['auto-favorite'],
        blackVsD4: ['auto-favorite'],
        blackVsC4: ['auto-favorite'],
        blackVsModern: ['auto-favorite']
    }
  }
];

// Category helpers
export const getBotsByCategory = () => {
  return {
    Beginner: BOT_PROFILES.filter(b => b.category === 'beginner'),
    Intermediate: BOT_PROFILES.filter(b => b.category === 'intermediate'),
    Advanced: BOT_PROFILES.filter(b => b.category === 'advanced'),
    Master: BOT_PROFILES.filter(b => b.category === 'master'),
    Special: BOT_PROFILES.filter(b => b.category === 'special'),
  };
};

// Get coach-eligible bots (only Jakie)
export const getCoachBots = () => {
  return BOT_PROFILES.filter(b => b.id === 'bot-adaptive');
};

export type BotCategory = keyof ReturnType<typeof getBotsByCategory>;

export const getBotById = (id: string): BotProfile | undefined => {
  return BOT_PROFILES.find(bot => bot.id === id);
};
