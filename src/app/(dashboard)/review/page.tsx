'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import { GameReviewRedesign } from '@/redesign/components/Review/GameReviewRedesign';
import { getGameById } from '@/lib/game-storage';
import { PlayerInfo } from '@/components/PlayerNameplate';

function ReviewContent() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get('id');
  const isImport = searchParams.get('import') === 'true';

  const gameData = useMemo(() => {
    if (gameId) return getGameById(gameId);
    return undefined;
  }, [gameId]);

  // Handle import flow: PGN stored in sessionStorage by ImportGamesModal
  const { importedPgn, importedPlayerInfo } = useMemo(() => {
    if (!isImport || typeof window === 'undefined') return { importedPgn: undefined, importedPlayerInfo: undefined };

    const pgn = sessionStorage.getItem('importedPgn');
    if (!pgn) return { importedPgn: undefined, importedPlayerInfo: undefined };

    let playerInfo: { white: PlayerInfo; black: PlayerInfo } | undefined;
    try {
      const metaStr = sessionStorage.getItem('importedGameMeta');
      if (metaStr) {
        const meta = JSON.parse(metaStr);
        playerInfo = {
          white: { name: meta.white || 'White', color: 'white' as const },
          black: { name: meta.black || 'Black', color: 'black' as const },
        };
      }
    } catch (e) {}

    return { importedPgn: pgn, importedPlayerInfo: playerInfo };
  }, [isImport]);

  return (
    <GameReviewRedesign
      gameData={gameData}
      initialPgn={importedPgn}
      playerInfo={importedPlayerInfo}
    />
  );
}

export default function ReviewPage() {
  return (
    <Suspense>
      <ReviewContent />
    </Suspense>
  );
}
