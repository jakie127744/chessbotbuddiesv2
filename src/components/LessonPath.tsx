"use client";

import { useState, useRef, useEffect } from "react";
import { LESSON_TRACKS, TrackLevel, LessonNode } from "@/lib/lesson-data";
import { Lock, Check, Star, X, Trophy, Swords } from "lucide-react";
import { motion } from "framer-motion";
import { PRACTICE_CATEGORIES } from "@/lib/practice-data";
import { ThemeKey } from "@/lib/lichess-puzzles";
import { AdBanner } from "@/components/ads/AdBanner";
import { getAdSlotId } from "@/lib/ads/ad-manager";

interface LessonPathProps {
  onSelectLesson: (lesson: LessonNode) => void;
  onSelectPractice?: (theme: ThemeKey) => void;
  completedLessonIds?: string[];
  onClose: () => void;
  filter?: 'minigames';
  activeView?: string;
}

export function LessonPath({
  onSelectLesson,
  onSelectPractice,
  completedLessonIds = [],
  onClose,
  filter
}: LessonPathProps) {
  const [mode, setMode] = useState<"learn" | "practice">("learn");
  const [activeTab, setActiveTab] = useState<TrackLevel>("world-1");
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLessonRef = useRef<HTMLDivElement>(null);

  // Hoisted Hooks (Moved from below early return)
  const [roadPath, setRoadPath] = useState("");
  const orbRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRef = useRef<HTMLDivElement>(null); 

  const tracks: { id: TrackLevel; label: string }[] = Object.keys(LESSON_TRACKS).map((id, index) => ({
      id: id as TrackLevel,
      label: `${index + 1}. ${id.charAt(0).toUpperCase() + id.slice(1).replace('-', ' ')}`
  }));

  const getStatus = (lesson: LessonNode): "completed" | "unlocked" | "locked" => {
    if (completedLessonIds.includes(lesson.id)) return "completed";
    
    // Check prerequisites
    if (lesson.prerequisiteIds && lesson.prerequisiteIds.length > 0) {
        const prereqsMet = lesson.prerequisiteIds.every(id => completedLessonIds.includes(id));
        if (!prereqsMet) return "locked";
    }

    return "unlocked"; 
  };

  // Determine the "Current" active lesson for the avatar
  const currentTrackLessons = LESSON_TRACKS[activeTab] || [];
  
  // Calculate Winding Road Path
  const updateRoadPath = () => {
      const lessons = LESSON_TRACKS[activeTab]; 
      // Ensure we have the content container ref
      if (!contentRef.current || lessons.length === 0) return;

      const orbs = orbRefs.current;
      
      // Get the bounding rect of the CONTAINER that holds the SVG
      const contentRect = contentRef.current.getBoundingClientRect();
      const relativePoints: {x: number, y: number}[] = [];

      lessons.forEach((_, index) => {
          const orb = orbs[index];
          if (orb) {
               const rect = orb.getBoundingClientRect();
               // Calculate coordinates relative to the SVG container (contentRef)
               // This works regardless of scroll position because both rects are in viewport coordinates
               relativePoints.push({
                  x: rect.left - contentRect.left + rect.width / 2,
                  y: rect.top - contentRect.top + rect.height / 2
               });
          }
      });

      if (relativePoints.length < 2) {
          setRoadPath("");
          return;
      }

      // Construct SVG Path (Cubic Bezier for smooth S-curves)
      let d = `M ${relativePoints[0].x} ${relativePoints[0].y}`;

      for (let i = 0; i < relativePoints.length - 1; i++) {
          const p1 = relativePoints[i];
          const p2 = relativePoints[i+1];
          const dist = Math.abs(p2.y - p1.y);
          
          // Control points: Vertical S-curve connection
          // We adjust curvatures based on distance
          const curvature = 0.5;
          const cp1 = { x: p1.x, y: p1.y + dist * curvature }; 
          const cp2 = { x: p2.x, y: p2.y - dist * curvature };

          d += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p2.x} ${p2.y}`;
      }

      setRoadPath(d);
  };

  // Auto-scroll to active lesson on mount
  useEffect(() => {
    // Scroll to the active lesson marker
    const timer = setTimeout(() => {
        if (activeLessonRef.current) {
            activeLessonRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, 600); // Slightly longer delay to ensure layout is ready
    return () => clearTimeout(timer);
  }, [activeTab, mode]); // Trigger on tab change too

  // Recalculate on mount, resize, tab change
  useEffect(() => {
     const timer = setTimeout(updateRoadPath, 100);
     window.addEventListener('resize', updateRoadPath);
     return () => {
         window.removeEventListener('resize', updateRoadPath);
         clearTimeout(timer);
     }
  }, [activeTab, mode]);

  // MINIGAME FILTER LOGIC
  if (filter === 'minigames') {
      const minigames = Object.values(LESSON_TRACKS).flat().filter(l => 
          l.type === 'minigame' || l.category === 'Mini-Game' || l.id.includes('minigame')
      );

       return (
           <div className="h-full w-full bg-[#0b1219] text-white flex flex-col overflow-hidden relative font-sans">
               <div className="relative z-20 flex flex-col gap-8 p-10 bg-[#0b1219] border-b border-white/5 backdrop-blur-3xl shrink-0 shadow-2xl">
                  <div className="flex justify-between items-center">
                     <h2 className="text-4xl font-black text-white tracking-tight uppercase">
                         Minigames Arcade
                     </h2>
                  </div>
                  
                   {/* Track Selector removed as requested */}
               </div>

               <div className="flex-1 flex overflow-hidden">
                   


                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[#0b1219]">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                            {minigames.length === 0 ? (
                                <div className="col-span-full text-center text-zinc-500 py-32 font-black uppercase tracking-widest text-sm">
                                    No minigames found in this world yet!
                                </div>
                            ) : (
                                minigames.map((game) => {
                                   const status = getStatus(game);
                                   const isLocked = status === 'locked';
                                   const isCompleted = status === 'completed';
     
                                   return (
                                          <motion.button
                                          key={game.id}
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98 }}
                                          onClick={() => onSelectLesson(game)}
                                          className={`
                                              relative group overflow-hidden rounded-[2.5rem] text-left border p-10
                                              transition-all duration-500 flex flex-col h-full
                                              bg-[#0b1219] border-white/5 hover:border-[#00e5bc]/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] cursor-pointer
                                          `}
                                       >
                                          {/* Card Background Image */}
                                          {game.imageUrl && (
                                            <div className="absolute inset-0 z-0">
                                              <img 
                                                src={game.imageUrl} 
                                                alt="" 
                                                className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-700" 
                                              />
                                              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1219] via-[#0b1219]/80 to-transparent" />
                                            </div>
                                          )}

                                          {/* Top Left Icon Box */}
                                          <div className="relative z-10 w-12 h-12 rounded-xl bg-white/5 backdrop-blur-md flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform">
                                               {isCompleted ? (
                                                   <Check size={20} className="text-emerald-400" strokeWidth={3} />
                                               ) : (
                                                   <Trophy size={20} className="text-[#00e5bc]" />
                                               )}
                                          </div>
                                          
                                          {/* Category Badge */}
                                          <div className="mb-4 relative z-10">
                                            <span className="px-2.5 py-1 rounded bg-[#00e5bc] text-slate-900 text-[10px] font-black uppercase tracking-tighter shadow-[0_0_15px_rgba(0,229,188,0.3)]">
                                              MINIGAME
                                            </span>
                                          </div>

                                          {/* Title & Description */}
                                          <div className="flex-1 relative z-10">
                                              <h3 className="text-2xl font-black text-white mb-3 group-hover:text-[#00e5bc] transition-colors leading-tight">
                                                  {game.title}
                                              </h3>
                                              <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                                                  {game.description}
                                              </p>
                                          </div>

                                          {/* Footer Info */}
                                          <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center relative z-10">
                                             <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">
                                               {game.xpReward || 300} XP
                                             </span>
                                             <span className={`text-[11px] font-black uppercase tracking-widest ${isCompleted ? 'text-emerald-400' : 'text-[#00e5bc] opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                                               {isCompleted ? 'Completed' : 'Play Now'}
                                             </span>
                                          </div>

                                          {/* Lock icon removed for minigames arcade */}
                                       </motion.button>
                                   )
                                })
                            )}
                        </div>
                    </div>



               </div>
          </div>
      );
  }

  // STANDARD ROAD LOGIC (Restored)
  let activeIndex = -1;

  // 1. Try to find the first unlocked standard lesson
  const firstUnlockedStandardIndex = currentTrackLessons.findIndex(l => 
    getStatus(l) === "unlocked" && l.type !== 'minigame' && !l.category?.includes('Mini-Game')
  );

  if (firstUnlockedStandardIndex !== -1) {
      activeIndex = firstUnlockedStandardIndex;
  } else {
      // 2. If no unlocked standard lesson found (maybe only minigames are unlocked, or all completed),
      // Find the *last completed standard lesson*
      // We search backwards from the end
      for (let i = currentTrackLessons.length - 1; i >= 0; i--) {
          const l = currentTrackLessons[i];
          if (getStatus(l) === "completed" && l.type !== 'minigame' && !l.category?.includes('Mini-Game')) {
              activeIndex = i;
              break;
          }
      }
      // 3. If still -1 (no lessons completed, only minigames unlocked?), default to 0 if it's not a minigame?
      if (activeIndex === -1) activeIndex = 0;
  }
 
  // Calculate Progress
  const completedCount = currentTrackLessons.filter((l) =>
    completedLessonIds.includes(l.id)
  ).length;
  const progressPercent = Math.round(
    (completedCount / currentTrackLessons.length) * 100
  );


    return (
        <div className="h-full w-full bg-[color:var(--surface-primary,#0f1b14)] text-[color:var(--text-primary,#e8f5e1)] flex flex-col overflow-hidden relative font-sans">
      {/* Background Texture */}
            <div className="absolute inset-0 bg-[color:var(--surface-secondary,#0c2619)] opacity-100">
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40"></div>
      </div>

      {/* Hero Header */}
    <div className="relative z-20 flex flex-col gap-4 p-6 border-b border-[color:var(--border-strong,#1f3a2b)] bg-[color:var(--surface-elevated,#102216)] backdrop-blur-xl shrink-0 shadow-xl">
         <div className="flex justify-between items-start">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <motion.h2 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-lime-200 to-amber-200 drop-shadow-sm"
                    >
                      CHESS ROAD
                    </motion.h2>
                    <span className="px-2 py-1 rounded bg-[color:var(--surface-secondary,#0c2619)] text-[10px] font-bold text-[color:var(--text-tertiary,#78907e)] border border-[color:var(--border-strong,#1f3a2b)] uppercase">Beta</span>
                </div>
                
                <div className="flex gap-1 p-1 bg-[color:var(--surface-secondary,#0c2619)] rounded-lg w-max backdrop-blur-md overflow-x-auto max-w-[60vw] scrollbar-hide border border-[color:var(--border-strong,#1f3a2b)]">
                    {tracks.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all whitespace-nowrap ${
                                activeTab === t.id 
                                ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 text-[#0b150f] shadow-lg shadow-emerald-500/20' 
                                : 'text-[color:var(--text-tertiary,#78907e)] hover:text-[color:var(--text-primary,#e8f5e1)] hover:bg-white/5'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2">
            {/* Close button removed as requested */}
          </div>
         </div>

         {/* Progress Bar */}
         <div className="flex items-center gap-3 text-xs font-bold text-[color:var(--text-tertiary,#78907e)]">
            <span>Level {completedCount}</span>
            <div className="h-3 flex-1 bg-[color:var(--surface-secondary,#0c2619)] rounded-full overflow-hidden shadow-inner relative border border-[color:var(--border-strong,#1f3a2b)]">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className="h-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-lime-300 shadow-[0_0_10px_rgba(74,222,128,0.45)] relative"
                >
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                </motion.div>
            </div>
            <span>Master</span>
         </div>
      </div>

      {/* Scrollable Road Container */}
      <div className="flex-1 flex overflow-hidden">
        


        {/* Center Content (Road) */}
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar p-0 perspective-1000"
        >
        {mode === "learn" ? (
          <div ref={contentRef} className="max-w-3xl mx-auto relative py-20 px-4 min-h-screen">
            
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
                <defs>
                    <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" stopOpacity="0.08" />
                        <stop offset="50%" stopColor="#22c55e" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#a3e635" stopOpacity="0.1" />
                    </linearGradient>
                    <pattern id="roadTexture" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                         <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.12)" />
                    </pattern>
                </defs>
                <path 
                    d={roadPath} 
                    stroke="url(#roadGradient)" 
                    strokeWidth="40" 
                    fill="none" 
                    strokeLinecap="round"
                    className="opacity-50"
                />
                <path 
                    d={roadPath} 
                    stroke="#84cc16" 
                    strokeWidth="2" 
                    strokeDasharray="10 10"
                    fill="none" 
                    className="opacity-40"
                />
            </svg>

            <div className="flex flex-col gap-24 relative z-10 w-full">
              {currentTrackLessons.map((lesson, index) => {
                const status = getStatus(lesson);
                const isCurrent = (index === activeIndex);
                const isCompleted = status === "completed";
                const isLocked = status === "locked";
                const isLeft = index % 2 === 0;

                return (
                  <div
                    key={lesson.id}
                    ref={isCurrent ? activeLessonRef : null}
                    className={`flex items-center gap-4 relative group w-full ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className={`w-[20%] md:w-[30%] shrink-0`} /> 

                    <div 
                         ref={(el) => { orbRefs.current[index] = el; }}
                         className={`
                         relative w-20 h-20 rounded-full border-[4px] z-20 flex items-center justify-center shrink-0 shadow-2xl transition-all duration-500 bg-[color:var(--surface-secondary,#0c2619)] overflow-hidden
                         ${isCompleted ? 'border-emerald-500 text-emerald-400' : 
                          isCurrent ? 'border-lime-400 text-lime-300 scale-110 shadow-emerald-500/40 ring-4 ring-emerald-400/25' : 
                          'border-[color:var(--border-subtle,#1d3123)] text-[color:var(--text-tertiary,#78907e)]'}
                      `}>
                        {isCompleted && <Check size={32} strokeWidth={4} />}
                        {isLocked && <Lock size={24} />}
                        
                        {isCurrent && (
                            <motion.div 
                                layoutId="avatar-buddy"
                                className="w-full h-full relative"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            >
                                <img 
                                    src="/mascot_buddy.png" 
                                    alt="Buddy" 
                                    className="w-full h-full object-cover" 
                                />
                            </motion.div>
                        )}
                    </div>

                    {/* Lesson Card */}
                    <motion.button
                      whileHover={{ scale: isLocked ? 1 : 1.02, y: isLocked ? 0 : -5 }}
                      whileTap={{ scale: isLocked ? 1 : 0.98 }}
                      onClick={() => !isLocked && onSelectLesson(lesson)}
                      disabled={isLocked}
                      className={`
                        flex-1 text-left relative overflow-hidden group/card max-w-md mx-4
                        ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >   
                        <div className={`
                            relative bg-[color:var(--surface-elevated,#102216)] border rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300
                            ${isCurrent 
                                ? 'border-lime-400/60 shadow-emerald-500/10' 
                                : 'border-[color:var(--border-subtle,#1d3123)]'}
                        `}>
                            {/* Card Image Wrapper */}
                            {lesson.imageUrl && (
                                <div className="h-24 w-full relative overflow-hidden bg-[color:var(--surface-secondary,#0c2619)]">
                                     <img 
                                        src={lesson.imageUrl} 
                                        alt={lesson.title}
                                        className="w-full h-full object-cover opacity-60 group-hover/card:opacity-100 transition-all duration-700 scale-110 group-hover/card:scale-100"
                                     />
                                     <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--surface-elevated,#102216)] via-[#102216] to-transparent" />
                                </div>
                            )}

                            {/* Card Content */}
                            <div className="p-5 relative z-10">
                                <span className={`text-[10px] font-bold uppercase tracking-wider mb-2 block ${isCurrent ? 'text-lime-300' : 'text-[color:var(--text-tertiary,#78907e)]'}`}>
                                    {lesson.type === 'minigame' || lesson.category === 'Mini-Game' ? 'Mini-Game' : `Lesson ${index + 1}`}
                                </span>
                                <h3 className="font-bold text-lg text-[color:var(--text-primary,#e8f5e1)] mb-1 group-hover/card:text-lime-200 transition-colors">
                                    {lesson.title}
                                </h3>
                                <p className="text-xs text-[color:var(--text-tertiary,#78907e)] line-clamp-2">
                                    {lesson.description}
                                </p>
                            </div>

                            {/* Decorative Icon BG */}
                            <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-1/4 translate-y-1/4 text-8xl grayscale group-hover/card:grayscale-0 transition-all duration-500">
                                {getLessonIconEmoji(lesson.id)}
                            </div>
                        </div>
                    </motion.button>
                     <div className={`w-[5%] md:w-[10%] shrink-0`} /> {/* Outer Spacer */}
                  </div>
                );
              })}
            </div>
            
            {/* End of Road */}
             <div className="mt-24 flex flex-col items-center gap-4 text-[color:var(--text-tertiary,#78907e)] pb-32">
                 <div className="text-4xl">🏁</div>
                <span className="text-sm font-bold uppercase tracking-widest">End of the Road... for now</span>
            </div>

          </div>
        ) : (
          // PRACTICE MODE UI (Unchanged logic, just simplified class)
          <PracticeModeUI onSelectPractice={onSelectPractice} />
        )}
      </div>


      </div>
    </div>
  );
}

// Sub-component for Practice Mode to keep main file clean
function PracticeModeUI({ onSelectPractice }: { onSelectPractice?: (t: ThemeKey) => void }) {
    return (
        <div className="max-w-5xl mx-auto space-y-12 p-4 md:p-8 pt-12">
            <div className="text-center space-y-2 mb-12">
                 <h3 className="text-3xl font-black text-[color:var(--text-primary,#e8f5e1)]">Battle Arena</h3>
                 <p className="text-[color:var(--text-tertiary,#78907e)]">Sharpen your skills with tactical drills</p>
            </div>
            {PRACTICE_CATEGORIES.map((category) => (
              <div key={category.id} className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
                    <h3 className="text-xl font-bold text-emerald-200 shadow-emerald-500/20 drop-shadow-lg">
                        {category.title}
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {category.items.map((item) => (
                    <motion.button
                      key={item.id}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        onSelectPractice && onSelectPractice(item.themeKey)
                      }
                                            className="relative overflow-hidden bg-[color:var(--surface-secondary,#0c2619)] border border-[color:var(--border-subtle,#1d3123)] hover:border-emerald-400/60 p-6 rounded-2xl text-left transition-all shadow-lg hover:shadow-emerald-500/10 group"
                    >
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                                                 <Trophy size={48} />
                      </div>

                      <div className="relative z-10">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/15 to-lime-400/10 border border-white/5 flex items-center justify-center text-emerald-300 mb-4 group-hover:scale-110 transition-transform duration-300">
                             <Trophy size={18} />
                          </div>
                                                    <h4 className="font-bold text-[color:var(--text-primary,#e8f5e1)] group-hover:text-emerald-200 transition-colors text-lg mb-2">
                            {item.title}
                          </h4>
                                                    <p className="text-xs text-[color:var(--text-tertiary,#78907e)] leading-relaxed">
                            {item.description}
                          </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>
    )
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
