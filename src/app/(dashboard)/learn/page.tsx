'use client';

import { useState } from 'react';
import { LessonPath } from '@/components/LessonPath';
import { LessonPlayer } from '@/components/LessonPlayer';
import { AcademyView } from '@/redesign/components/AcademyView';
import { LessonNode } from '@/lib/lesson-data';
import { useRouter } from 'next/navigation';
import { GraduationCap, Gamepad2 } from 'lucide-react';
import { useRewards } from '@/contexts/RewardsContext';

export default function RedesignLearnPage() {
  const [activeLesson, setActiveLesson] = useState<LessonNode | null>(null);
  const [viewMode, setViewMode] = useState<'academy' | 'road'>('academy');
  const router = useRouter();
  const { completedLessons } = useRewards();

  if (activeLesson) {
    return (
      <div className="h-full w-full">
        <LessonPlayer 
          lesson={activeLesson} 
          onComplete={() => setActiveLesson(null)} 
          onClose={() => setActiveLesson(null)} 
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col relative">
      {/* View Toggle - Floats in corner */}
      <div className="absolute top-4 right-16 z-[60] flex p-1 bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/5 shadow-2xl">
        <button
          onClick={() => setViewMode('road')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            viewMode === 'road' 
              ? 'bg-amber-500 text-slate-900 shadow-lg' 
              : 'text-zinc-500 hover:text-white'
          }`}
        >
          <Gamepad2 size={16} />
          MINIGAMES
        </button>
        <button
          onClick={() => setViewMode('academy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            viewMode === 'academy' 
              ? 'bg-redesign-cyan text-slate-900 shadow-lg' 
              : 'text-zinc-500 hover:text-white'
          }`}
        >
          <GraduationCap size={16} />
          ACADEMY
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {viewMode === 'road' ? (
          <LessonPath 
            onSelectLesson={setActiveLesson}
            onClose={() => router.push('/home')}
            filter="minigames"
            completedLessonIds={completedLessons}
          />
        ) : (
          <AcademyView onSelectLesson={setActiveLesson} />
        )}
      </div>
    </div>
  );
}
