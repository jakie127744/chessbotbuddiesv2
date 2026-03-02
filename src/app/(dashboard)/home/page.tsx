'use client';

import { HomeDashboard } from '@/redesign/components/HomeDashboard';
import { useRouter } from 'next/navigation';
import { useRewards } from '@/contexts/RewardsContext';

export default function RedesignHomePage() {
  const router = useRouter();
  const { userProfile } = useRewards();

  return (
    <HomeDashboard 
      userProfile={userProfile}
      onPlayClick={(botId) => {
        if (botId === 'pass-and-play') return router.push('/play?mode=pass');
        return router.push(botId ? `/play?bot=${botId}` : '/play');
      }}
      onPuzzlesClick={() => router.push('/puzzles')}
      onLessonsClick={() => router.push('/learn')}
      onAnalysisClick={() => router.push('/analysis')}
      onEndgameClick={() => router.push('/endgame')}
      onOpeningsClick={() => router.push('/openings')}
      onShotgunClick={() => router.push('/openings/shotgun')}
    />
  );
}
