'use client';

import { PuzzleSprint } from '@/redesign/components/PuzzleSprint';
import { useRouter } from 'next/navigation';

export default function PuzzleSprintPage() {
  const router = useRouter();

  return (
    <div className="h-full">
      <PuzzleSprint onExit={() => router.push('/puzzles')} />
    </div>
  );
}
