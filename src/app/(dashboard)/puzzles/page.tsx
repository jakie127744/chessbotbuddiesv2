'use client';

import { PuzzlesHub } from '@/redesign/components/PuzzlesHub';
import { useRouter } from 'next/navigation';

export default function RedesignPuzzlesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-4 lg:p-8 space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
        <button
          onClick={() => router.push('/home')}
          className="hover:text-white transition-colors"
        >
          Home
        </button>
        <span className="text-slate-600">/</span>
        <span className="text-sky-blue font-bold">Puzzles</span>
      </div>

      <PuzzlesHub 
        onStartPuzzles={(theme) => router.push(`/puzzles/training${theme ? `?theme=${theme}` : ''}`)}
        onStartOpenings={() => router.push('/openings')}
        onStartEndgame={() => router.push('/endgame')}
        onStartLessons={() => router.push('/learn')}
      />
    </div>
  );
}
