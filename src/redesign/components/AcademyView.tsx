'use client';

import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, BookOpen, Sparkles, Target, Brain, Crown, Swords, Shield
} from 'lucide-react';
import { LESSON_TRACKS, TrackLevel, LessonNode } from '@/lib/lesson-data';
import { useRewards } from '@/contexts/RewardsContext';

// Category filter type
type CategoryFilter = 'all' | 'opening' | 'strategy' | 'tactic' | 'endgame' | 'concept' | 'minigame';

// Track metadata for "Your Courses" section 
const TRACK_META: { id: TrackLevel; title: string; subtitle: string; icon: React.ReactNode; color: string; banner: string; duration: string; summary: string }[] = [
  { 
    id: 'world-1', 
    title: 'The Basics', 
    subtitle: 'Movement & Rules', 
    icon: <BookOpen size={28} className="text-emerald-400" />, 
    color: 'bg-emerald-500', 
    banner: '/lesson-pawn.png',
    duration: '2h 15m',
    summary: 'Master the fundamental rules of chess, from piece movement to special moves like castling and en passant.'
  },
  { 
    id: 'world-2', 
    title: 'Tactics 101', 
    subtitle: 'Winning Material', 
    icon: <Target size={28} className="text-cyan-400" />, 
    color: 'bg-cyan-500', 
    banner: '/lesson-knight.png',
    duration: '4h 30m',
    summary: 'Learn the essential tactical patterns: forks, pins, skewers, and discovered attacks to win material.'
  },
  { 
    id: 'world-3', 
    title: 'Strategy & Planning', 
    subtitle: 'Positional Mastery', 
    icon: <Brain size={28} className="text-purple-400" />, 
    color: 'bg-purple-500', 
    banner: '/lesson-bishop.png',
    duration: '3h 45m',
    summary: 'Control the center, develop pieces, and ensure king safety. Build a solid foundation for your positional play.'
  },
  { 
    id: 'world-4', 
    title: 'Endgame Mastery', 
    subtitle: 'The Final Phase', 
    icon: <Crown size={28} className="text-orange-400" />, 
    color: 'bg-orange-500', 
    banner: '/lesson-rook.png',
    duration: '5h 10m',
    summary: 'Master theoretical endgames and learn technique to convert a winning material advantage.'
  },
  { 
    id: 'world-5', 
    title: 'Advanced Tactics', 
    subtitle: 'Complex Combinations', 
    icon: <Swords size={28} className="text-red-400" />, 
    color: 'bg-red-500', 
    banner: '/lesson-queen.png',
    duration: '6h 20m',
    summary: 'Complex combinations and sacrifices. Train your calculation skills to find winning sequences.'
  },
  { 
    id: 'world-6', 
    title: 'Mastering Openings', 
    subtitle: 'The First 10 Moves', 
    icon: <Shield size={28} className="text-blue-400" />, 
    color: 'bg-blue-500', 
    banner: '/lesson-king.png',
    duration: '8h 15m',
    summary: 'Expand your repertoire. Learn the key ideas and variations of the most respected chess openings.'
  },
];

// Fallback images from our local assets
const FALLBACK_IMAGES = [
  '/concept_battlefield_intro_1767231602068.png',
  '/concept_pawn_intro_1767231720685.png',
  '/concept_knight_intro_1767231615929.png',
  '/concept_bishop_intro_1767231744743.png',
  '/concept_king_intro_1767231731850.png',
];

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'All Lessons',
  opening: 'Openings',
  strategy: 'Strategy',
  tactic: 'Tactics',
  endgame: 'Endgames',
  concept: 'Concepts',
  minigame: 'Minigames',
};

const DIFFICULTY_BADGE: Record<string, { label: string; cls: string }> = {
  'concept': { label: 'Beginner', cls: 'bg-emerald-500/80 text-white' },
  'opening': { label: 'Opening', cls: 'bg-blue-500/80 text-white' },
  'tactic': { label: 'Tactics', cls: 'bg-red-500/80 text-white' },
  'strategy': { label: 'Intermediate', cls: 'bg-purple-500/80 text-white' },
  'endgame': { label: 'Endgame', cls: 'bg-orange-500/80 text-white' },
  'theory': { label: 'Theory', cls: 'bg-zinc-500/80 text-white' },
  'minigame': { label: 'Challenge', cls: 'bg-amber-500/80 text-white' },
};

interface AcademyViewProps {
  onSelectLesson?: (lesson: LessonNode) => void;
}

export function AcademyView({ onSelectLesson }: AcademyViewProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { completedLessons } = useRewards();
  
  // Find the absolute first incomplete lesson to feature
  const allLessonsFlat = useMemo(() => {
    return Object.entries(LESSON_TRACKS).flatMap(([trackId, lessons]) =>
      lessons.map(l => ({ ...l, trackId: trackId as TrackLevel }))
    );
  }, []);


  // Flatten all lessons (reusing the already flattened list for other memos)
  const allLessons = allLessonsFlat;

  // Filter lessons by category and search
  const availableTypes = useMemo(() => {
    const types = new Set<CategoryFilter>(['all']);
    allLessons.forEach((l) => {
      if (l.type !== 'minigame' && CATEGORY_LABELS[l.type as CategoryFilter]) {
        types.add(l.type as CategoryFilter);
      }
    });
    return Array.from(types);
  }, [allLessons]);

  const filteredLessons = useMemo(() => {
    let result = allLessons;
    if (activeCategory !== 'all') {
      result = result.filter(l => l.type === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.type.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allLessons, activeCategory, searchQuery]);


  const lessonStats = useMemo(() => {
    const totalLessons = allLessons.length;
    const totalXP = allLessons.reduce((sum, l) => sum + (l.xpReward || 0), 0);
    const completed = completedLessons.length;
    const trackCount = Object.keys(LESSON_TRACKS).length;
    const byType = allLessons.reduce<Record<string, number>>((acc, l) => {
      acc[l.type] = (acc[l.type] || 0) + 1;
      return acc;
    }, {});
    return { totalLessons, totalXP, completed, trackCount, byType };
  }, [allLessons, completedLessons]);

  // Get the current active track dynamically
  const activeTrack = useMemo(() => {
    // 1. Find the first incomplete track from the actual data
    const trackIds = Object.keys(LESSON_TRACKS) as TrackLevel[];
    const firstIncompleteTrackId = trackIds.find((id: TrackLevel) => {
      const lessons = LESSON_TRACKS[id] || [];
      const done = lessons.filter((l: LessonNode) => completedLessons.includes(l.id)).length;
      return done < lessons.length;
    }) || trackIds[0];

    // 2. Map it to metadata, or generate fallback metadata
    const meta = TRACK_META.find(m => m.id === firstIncompleteTrackId);
    if (meta) return meta;

    // Fallback metadata for unknown tracks
    const firstLesson = LESSON_TRACKS[firstIncompleteTrackId]?.[0];
    return {
      id: firstIncompleteTrackId,
      title: firstIncompleteTrackId.replace('-', ' ').toUpperCase(),
      summary: "Continue your chess journey with these advanced lessons.",
      banner: firstLesson?.imageUrl || FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)],
      duration: "Calculated...",
      color: "bg-zinc-500"
    } as any;
  }, [completedLessons]);

  const activeTrackLessons = LESSON_TRACKS[activeTrack.id as TrackLevel] || [];
  const activeTrackDone = activeTrackLessons.filter((l: LessonNode) => completedLessons.includes(l.id)).length;
  const activeTrackTotal = activeTrackLessons.length;
  const activeTrackPct = activeTrackTotal > 0 ? Math.round((activeTrackDone / activeTrackTotal) * 100) : 0;
  const nextLessonForActiveTrack = activeTrackLessons.find((l: LessonNode) => !completedLessons.includes(l.id)) || activeTrackLessons[0];

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pt-10 pb-20 animate-in fade-in duration-500 px-8">
      <div className="max-w-[1200px] mx-auto space-y-12">
        
        {/* Cinematic Hero: Resume Learning */}
        {activeTrack && (
          <section>
            <div className="relative rounded-[2.5rem] overflow-hidden bg-surface-dark border border-white/5 flex flex-col md:flex-row shadow-2xl min-h-[420px]">
              {/* Content Side */}
              <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-center relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-2 h-2 rounded-full bg-redesign-cyan animate-pulse shadow-[0_0_12px_#0db9f2]" />
                  <span className="text-redesign-cyan text-[11px] font-black uppercase tracking-[0.25em]">Resume Learning</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                  {activeTrack.title}
                </h2>
                
                <p className="text-zinc-400 text-lg mb-10 max-w-sm leading-relaxed">
                  {activeTrack.summary}
                </p>
                
                <div className="space-y-4 mb-10 max-w-md">
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                    <span className="text-zinc-500">Overall Progress</span>
                    <span className="text-redesign-cyan">{activeTrackPct}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                    <div 
                      className="h-full bg-gradient-to-r from-redesign-cyan to-blue-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(13,185,242,0.3)]" 
                      style={{ width: `${activeTrackPct}%` }}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => onSelectLesson?.(nextLessonForActiveTrack)}
                  className="w-fit px-12 py-5 bg-redesign-cyan hover:bg-white text-[#0b0f1a] rounded-[1.25rem] font-black transition-all shadow-2xl shadow-redesign-cyan/20 flex items-center gap-3 group active:scale-[0.98]"
                >
                  <span className="text-sm uppercase tracking-widest">CONTINUE {activeTrackDone + 1}</span>
                  <ChevronRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>

              {/* Visual Side */}
              <div className="md:w-1/2 relative min-h-[350px] bg-[#0d121f] overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-surface-dark via-surface-dark/60 to-transparent z-10" />
                
                {/* Featured Course Asset */}
                <div className="absolute inset-0 flex items-center justify-center p-14">
                   <img 
                    src={activeTrack.banner} 
                    alt={activeTrack.title} 
                    className="w-full h-full object-contain filter drop-shadow-[0_25px_60px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                  />
                </div>

                {/* Course Metadata Badge */}
                <div className="absolute bottom-8 right-8 z-20 bg-black/40 backdrop-blur-2xl px-6 py-3.5 rounded-[1.5rem] border border-white/10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-redesign-cyan/20 flex items-center justify-center border border-redesign-cyan/20">
                    <Sparkles size={18} className="text-redesign-cyan" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-white uppercase tracking-widest leading-none mb-1.5">Expert Course</p>
                    <p className="text-xs font-bold text-zinc-400 leading-none">{activeTrack.duration} Content</p>
                  </div>
                </div>

                {/* Decorative glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-redesign-cyan/5 blur-[120px] rounded-full pointer-events-none" />
              </div>
            </div>
          </section>
        )}


        {/* Lessons Grid */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h3 className="text-4xl font-black text-white tracking-tight">
              {activeCategory === 'all' ? 'All Lessons' : CATEGORY_LABELS[activeCategory]}
            </h3>
            
            <div className="flex bg-white/5 rounded-full p-1.5 border border-white/5 overflow-x-auto custom-scrollbar-hide whitespace-nowrap">
                {availableTypes.filter(type => type !== 'minigame').map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveCategory(type)}
                    className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                      activeCategory === type 
                        ? 'bg-white text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                        : 'text-[#00e5bc]/80 hover:text-white hover:bg-[#00e5bc]/10'
                    }`}
                  >
                    {CATEGORY_LABELS[type]}
                  </button>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLessons.filter(l => l.type !== 'minigame').map((lesson) => {
               const isCompleted = completedLessons.includes(lesson.id);
               const badge = DIFFICULTY_BADGE[lesson.type] || DIFFICULTY_BADGE['concept'];
               
               return (
                 <button 
                   key={lesson.id}
                   onClick={() => onSelectLesson?.(lesson as any)}
                   className="group relative bg-[#0b1219] border border-white/5 hover:border-[#00e5bc]/30 rounded-[2.5rem] p-10 text-left transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col h-full overflow-hidden"
                 >
                   {/* Card Background Image */}
                   {lesson.imageUrl && (
                     <div className="absolute inset-0 z-0">
                       <img 
                         src={lesson.imageUrl} 
                         alt="" 
                         className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-700"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#0b1219] via-[#0b1219]/80 to-transparent" />
                     </div>
                   )}
                   
                   {/* Top Left Icon Box */}
                   <div className="relative z-10 w-12 h-12 rounded-xl bg-white/5 backdrop-blur-md flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform">
                     <span className="text-xl">
                       {isCompleted ? '✅' : getLessonIconEmoji(lesson.id)}
                     </span>
                   </div>
                   
                   {/* Category Badge */}
                   <div className="mb-4 relative z-10">
                     <span className="px-2.5 py-1 rounded bg-[#00e5bc] text-slate-900 text-[10px] font-black uppercase tracking-tighter shadow-[0_0_15px_rgba(0,229,188,0.3)]">
                       {badge.label}
                     </span>
                   </div>

                   {/* Title & Description */}
                   <div className="flex-1 relative z-10">
                     <h4 className="text-2xl font-black text-white mb-3 leading-tight transition-colors group-hover:text-[#00e5bc]">
                       {lesson.title}
                     </h4>
                     <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">
                       {lesson.description}
                     </p>
                   </div>
                   
                   {/* Footer Info */}
                   <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center relative z-10">
                     <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">
                       {lesson.xpReward || 300} XP
                     </span>
                     <span className={`text-[11px] font-black uppercase tracking-widest ${isCompleted ? 'text-emerald-400' : 'text-[#00e5bc] opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                       {isCompleted ? 'Completed' : 'Start Lesson'}
                     </span>
                   </div>
                 </button>
               )
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function getLessonIconEmoji(id: string) {
  if (id.includes("pawn")) return "♟️";
  if (id.includes("knight")) return "♞";
  if (id.includes("bishop")) return "♝";
  if (id.includes("rook")) return "♜";
  if (id.includes("queen")) return "♛";
  if (id.includes("king")) return "♚";
  if (id.includes("tactic")) return "⚔️";
  if (id.includes("endgame")) return "🏁";
  if (id.includes("opening")) return "📖";
  return "🎓";
}
