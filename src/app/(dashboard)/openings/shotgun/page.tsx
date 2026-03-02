"use client";

import OpeningShotgunTrainer from '@/redesign/components/OpeningShotgunTrainer';
import { useRouter } from 'next/navigation';

export default function OpeningShotgunPage() {
  const router = useRouter();

  return (
    <div className="h-screen w-full">
      <OpeningShotgunTrainer onExit={() => router.push('/openings')} />
    </div>
  );
}
