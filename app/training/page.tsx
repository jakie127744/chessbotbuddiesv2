// ...existing code...
'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Target, Book, LayoutGrid, Trophy, Puzzle } from 'lucide-react';
import { Chess } from 'chess.js';
import { PuzzleTrainer } from '@/redesign/components/PuzzleTrainer';
import EndgameTrainer from '@/components/EndgameTrainer';
import { TutorialPractice } from '@/components/TutorialPractice';
import { LessonPath } from '@/components/LessonPath';
import { LessonPlayer } from '@/components/LessonPlayer';
import { LessonNode } from '@/lib/lesson-data';
import { useRewards } from '@/contexts/RewardsContext';

// Redesigned Opening Trainer
import { useOpeningTrainerRedesign } from '@/redesign/hooks/useOpeningTrainerRedesign';
import { TrainerSidebarLeft } from '@/redesign/components/OpeningTrainer/TrainerSidebarLeft';
import { TrainerBoardArea } from '@/redesign/components/OpeningTrainer/TrainerBoardArea';
import { TrainerCoachPanel } from '@/redesign/components/OpeningTrainer/TrainerCoachPanel';
import { SessionCompletionModal } from '@/redesign/components/OpeningTrainer/SessionCompletionModal';
import { COMPILED_OPENINGS } from '@/redesign/lib/opening-data-provider';

type TrainingTab = 'puzzles' | 'openings' | 'endgames' | 'minigames';
const VALID_TABS: TrainingTab[] = ['puzzles', 'openings', 'endgames', 'minigames'];

function TrainingHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TrainingTab | null;
  const [activeTab, setActiveTab] = useState<TrainingTab>(
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'puzzles'
  );
  const [activeMinigame, setActiveMinigame] = useState<LessonNode | null>(null);

  // Redesigned Opening Trainer hook
  const openingTrainer = useOpeningTrainerRedesign();

  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const tabs = [
    { id: 'puzzles', label: 'Tactics & Puzzles', icon: Puzzle },
    { id: 'openings', label: 'Opening Lab', icon: Book },
    { id: 'endgames', label: 'Endgame Mastery', icon: Target },
    { id: 'minigames', label: 'Minigames', icon: Trophy },
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Header / Tabs — single inline row */}
      <div className="px-2 lg:px-8 pt-4 lg:pt-5 pb-0 shrink-0">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 w-full border-b border-white/10 pb-2">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[11px] lg:text-sm shrink-0">
            <button
              onClick={() => router.push('/home')}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </button>
            <span className="text-slate-600">/</span>
            <button
              onClick={() => router.push('/training-dashboard')}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors font-medium"
            >
              Training Dashboard
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-jungle-green-400 font-bold">Training Center</span>
          </div>

          {/* Divider */}
          <span className="text-slate-700 hidden lg:inline">|</span>

          {/* Tab buttons */}
          <div className="flex flex-wrap items-center gap-1 lg:gap-2 flex-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TrainingTab)}
                  className={`flex items-center gap-1 lg:gap-2 px-3 lg:px-5 py-1.5 lg:py-2 text-[11px] lg:text-sm font-bold transition-all relative rounded-md lg:rounded-xl
                    ${isActive
                      ? 'bg-jungle-green-400 text-[#0b0f1a] shadow-[0_8px_20px_rgba(0,255,183,0.18)]'
                      : 'text-slate-400 hover:text-white'}
                  `}
                >
                  <tab.icon size={14} className="lg:size-[16px]" />
                  <span className="text-[11px] lg:text-sm leading-none">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {/* ...existing code... */}
    </div>
  );
}

export default function TrainingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrainingHubContent />
    </Suspense>
  );
}
