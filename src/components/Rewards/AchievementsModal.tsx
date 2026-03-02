'use client';

import { useRewards, ACHIEVEMENTS } from '@/contexts/RewardsContext';
import { 
  X, Trophy, Lock, Sword, BookOpen, Zap, Scroll, Brain, Book, User, Target, Flame, 
  Lightbulb, Library, Crosshair, Swords, Timer, Shield, Crown, Star, Gem, Wand2, 
  GraduationCap, Skull, Hourglass, Award, Sun, Medal, Diamond, ScrollText 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ICON_MAP: Record<string, React.ElementType> = {
  'Trophy': Trophy,
  'Sword': Sword,
  'BookOpen': BookOpen,
  'Zap': Zap,
  'Scroll': Scroll,
  'Brain': Brain,
  'Book': Book,
  'User': User,
  'Target': Target,
  'Flame': Flame,
  'Lightbulb': Lightbulb,
  'Library': Library,
  'Crosshair': Crosshair,
  'Swords': Swords,
  'Timer': Timer,
  'Shield': Shield,
  'Crown': Crown,
  'Star': Star,
  'Gem': Gem,
  'Wand2': Wand2,
  'GraduationCap': GraduationCap,
  'Skull': Skull,
  'Hourglass': Hourglass,
  'Award': Award,
  'Sun': Sun,
  'Medal': Medal,
  'Diamond': Diamond,
  'ScrollText': ScrollText,
  'Flash': Zap, // Fallback for Flash if not found
};

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  const { achievements } = useRewards();

  // Sort: Unlocked first, then by ID
  const sortedAchievements = [...ACHIEVEMENTS].sort((a, b) => {
    const aUnlocked = !!achievements[a.id]?.unlocked;
    const bUnlocked = !!achievements[b.id]?.unlocked;
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return 0;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-theme-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-theme flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-theme flex items-center justify-between bg-theme-surface-secondary">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-400/20 rounded-lg">
                  <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-theme-primary">Achievements</h2>
                  <p className="text-sm text-theme-secondary">
                    {Object.values(achievements).filter(a => a.unlocked).length} / {ACHIEVEMENTS.length} Unlocked
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-black/5 rounded-full transition-colors text-theme-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar">
              {sortedAchievements.map((achievement) => {
                const isUnlocked = !!achievements[achievement.id]?.unlocked;
                const unlockDate = achievements[achievement.id]?.unlockedAt 
                  ? new Date(achievements[achievement.id]!.unlockedAt!).toLocaleDateString() 
                  : null;

                return (
                  <motion.div
                    key={achievement.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative p-4 rounded-xl border-2 flex items-start gap-4 transition-all ${
                      isUnlocked 
                        ? 'bg-theme-surface border-yellow-400/50 shadow-sm' 
                        : 'bg-gray-50 dark:bg-gray-900 border-transparent opacity-75 grayscale'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 ${
                      isUnlocked 
                        ? 'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30' 
                        : 'bg-gray-200 dark:bg-gray-800'
                    }`}>
                      {isUnlocked ? (
                        (() => {
                          const IconComp = ICON_MAP[achievement.icon] || Trophy;
                          return <IconComp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />;
                        })()
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold font-display ${
                        isUnlocked ? 'text-theme-primary' : 'text-gray-500'
                      }`}>
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-theme-secondary leading-snug mt-0.5">
                        {achievement.description}
                      </p>
                      
                      {isUnlocked && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                            UNLOCKED {unlockDate}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
