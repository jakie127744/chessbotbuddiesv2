import React from 'react';
import { 
  Trophy, Star, Crown, Medal, Award, Flame, Zap, 
  Shield, Target, Sword, Swords, Skull, Ghost, 
  Book, BookOpen, Library, GraduationCap, Scroll, 
  Brain, Lightbulb, Puzzle, Gem, Diamond, 
  Hourglass, Timer, MousePointer, 
  type LucideIcon
} from 'lucide-react';

interface AchievementIconProps {
  iconName: string;
  className?: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export function AchievementIcon({ iconName, className = "w-12 h-12", tier = 'bronze' }: AchievementIconProps) {
  // Map string names to components
  const IconMap: Record<string, LucideIcon> = {
    'Trophy': Trophy,
    'Star': Star,
    'Crown': Crown,
    'Medal': Medal,
    'Award': Award,
    'Flame': Flame,
    'Zap': Zap,
    'Shield': Shield,
    'Target': Target,
    'Sword': Sword,
    'Swords': Swords,
    'Skull': Skull,
    'Ghost': Ghost,
    'Book': Book,
    'BookOpen': BookOpen,
    'Library': Library,
    'GraduationCap': GraduationCap,
    'Scroll': Scroll,
    'ScrollText': Scroll, // Map to Scroll for now
    'Brain': Brain,
    'Lightbulb': Lightbulb,
    'Puzzle': Puzzle,
    'Gem': Gem,
    'Diamond': Diamond,
    'Sun': Star, // Use Star for Sun for now if Sun missing or just prefer Star
    'Hourglass': Hourglass,
    'Timer': Timer,
    'MousePointer': MousePointer,
    'Crosshair': Target,
    'Wand2': Zap, // Alternative magic
  };

  const IconComponent = IconMap[iconName] || Trophy;

  // Base colors for tiers
  const tierColors = {
    bronze: 'text-amber-700 drop-shadow-md',
    silver: 'text-slate-300 drop-shadow-md',
    gold: 'text-yellow-400 drop-shadow-lg',
    platinum: 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]'
  };

  return <IconComponent className={`${className} ${tierColors[tier]} stroke-[1.5px]`} />;
}
