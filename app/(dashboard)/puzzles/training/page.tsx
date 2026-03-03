'use client';

import { PuzzleTrainer } from '@/redesign/components/PuzzleTrainer';
import { useRouter, useSearchParams } from 'next/navigation';
import { ThemeKey } from '@/lib/puzzle-types';
import { Suspense } from 'react';

function PuzzleTrainingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = (searchParams.get('theme') as ThemeKey) || 'mixed';

  return (
    <div className="h-full px-0 py-2 lg:px-6 lg:py-6 space-y-3">
      <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
        <button
          onClick={() => router.push('/home')}
          className="hover:text-white transition-colors"
        >
          Home
        </button>
        <span className="text-slate-600">/</span>
        <button
          onClick={() => router.push('/puzzles')}
          className="hover:text-white transition-colors"
        >
          Puzzles
        </button>
        <span className="text-slate-600">/</span>
        <span className="text-sky-blue font-bold">Training</span>
      </div>

      <div className="h-full">
        <PuzzleTrainer initialTheme={theme} />
      </div>
    </div>
  );
}

export default function PuzzleTrainingPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <PuzzleTrainingContent />
    </Suspense>
  );
}
