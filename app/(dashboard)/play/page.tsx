'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Chess } from 'chess.js';

// Redesign Components
import { GameView } from '@/redesign/components/GameView';
import { BotSelectionPanel } from '@/redesign/components/BotSelectionPanel';

// Redesign Hooks & Libs
import { useStockfish } from '@/redesign/hooks/useStockfish';
import { useChessTimer } from '@/redesign/hooks/useChessTimer';
import { useBotAutoPlay } from '@/redesign/hooks/useBotAutoPlay';
import { useRewards } from '@/contexts/RewardsContext';
import { BotProfile, BOT_PROFILES } from '@/redesign/lib/bot-profiles';
import { TIME_CONTROLS, TimeControl } from '@/redesign/lib/game-config';
import { OpeningVariation } from '@/lib/openings-repertoire';

function PlayContent() {
  // --- Game State ---
  const [game, setGame] = useState(() => new Chess());
  const { evaluation, mate } = useStockfish(game.fen(), true);
  
  const [userColor, setUserColor] = useState<'w' | 'b'>('w');
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [selectedColorState, setSelectedColorState] = useState<'w' | 'b' | 'random'>('random');
  const searchParams = useSearchParams();
  const initialBotId = searchParams.get('bot');
  const initialMode = searchParams.get('mode');
  const initialPassAndPlay = initialMode === 'pass' || initialMode === 'pass-and-play';
  const initialBot = BOT_PROFILES.find(b => b.id === initialBotId) || null;

  const [selectedBot, setSelectedBot] = useState<BotProfile | null>(initialPassAndPlay ? null : initialBot); 
  const [gameStatus, setGameStatus] = useState<string>(''); 
  const [timeControl, setTimeControl] = useState(TIME_CONTROLS[4]); // 10 min
  const [isPassAndPlay, setIsPassAndPlay] = useState<boolean>(initialPassAndPlay);

  const { userProfile } = useRewards();

  // Coach states
  const [coachEnabled, setCoachEnabled] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<BotProfile | null>(null);

  // Timer Hook
  const { whiteTime, blackTime, start, pause, reset, isRunning } 
    = useChessTimer({
      timeControl,
      onTimeout: (c) => setGameStatus(c === 'w' ? 'White won on time' : 'Black won on time'),
      activeColor: game.turn()
  });

  // Move Handler
  const handleMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    if (gameStatus) return false;
    
    try {
      const newGame = new Chess();
      newGame.loadPgn(game.pgn());
      const result = newGame.move(move);
      
      if (result) {
        setGame(newGame);
        if (!isRunning) start();

        if (newGame.isGameOver()) {
            pause();
            if (newGame.isCheckmate()) setGameStatus('Checkmate!');
            else setGameStatus('Draw');
        }
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  }, [game, gameStatus, isRunning, start, pause]);

  // Bot Auto Play
  const activeBot = isPassAndPlay ? null : selectedBot;

  const { isThinking: isBotThinking } = useBotAutoPlay({
    game,
    selectedBot: activeBot,
    userColor,
    onMove: handleMove,
    gameStatus,
    botTimeRemaining: userColor === 'w' ? blackTime : whiteTime 
  });

  // Setup State (REMOVED: Using unified view)
  const [isPlaying, setIsPlaying] = useState(initialBotId ? true : false);
  const [selectedOpening, setSelectedOpening] = useState<OpeningVariation | null>(null);

  // Start Game Handler
  const handleStartMatch = (tc: TimeControl, side: 'w' | 'b' | 'random', opening: OpeningVariation | null = selectedOpening, passAndPlay = false) => {
    const assignedColor = side === 'random' ? (Math.random() > 0.5 ? 'w' : 'b') : side;
    setUserColor(assignedColor);
    setBoardOrientation(assignedColor === 'w' ? 'white' : 'black');
    setIsPassAndPlay(passAndPlay);
    if (passAndPlay) {
      setSelectedBot(null);
    }
    
    const newGame = new Chess();
    if (opening && opening.moves) {
        for (const move of opening.moves) {
            try {
                newGame.move(move);
            } catch (e) {
                console.error('Failed to apply opening move:', move, e);
            }
        }
    }
    
    setGame(newGame);
    setGameStatus('');
    setTimeControl(tc);
    reset(tc.initial);
    setIsPlaying(true);
  };

  return (
    <div className="h-full relative">
       <GameView 
           game={game}
           boardOrientation={boardOrientation}
           onMove={handleMove}
           gameStatus={gameStatus}
           whiteTime={whiteTime}
           blackTime={blackTime}
             selectedBot={activeBot}
           onReset={() => {
               const g = new Chess();
               setGame(g);
               setGameStatus('');
               reset(timeControl.initial);
               setIsPlaying(false);
           }}
           onUndo={() => {
               const g = new Chess();
               g.loadPgn(game.pgn());
               g.undo();
               if (activeBot) g.undo(); 
               setGame(g);
           }}
           onResign={() => {
               setGameStatus('Resigned');
               pause();
           }}
           onOfferDraw={() => {
               setGameStatus('Draw by agreement');
               pause();
           }}
           evaluation={{ evaluation, mate }}
           isThinking={isBotThinking}
           playerName={userProfile?.username || 'Guest'}
           onSelectBot={(bot) => { setSelectedBot(bot); setIsPassAndPlay(false); }}
           onStartGame={handleStartMatch}
           selectedTimeControl={timeControl}
           selectedColor={selectedColorState}
           onColorChange={setSelectedColorState}
           onTimeControlChange={setTimeControl}
           isPlaying={isPlaying}
           selectedOpening={selectedOpening}
           onOpeningChange={setSelectedOpening}
           isPassAndPlay={isPassAndPlay}
       />
    </div>
  );
}

export default function RedesignPlayPage() {
  return (
    <Suspense fallback={
        <div className="h-full flex items-center justify-center bg-[#0b1120]">
            <div className="animate-pulse text-blue-500 font-bold">Loading Arena...</div>
        </div>
    }>
        <PlayContent />
    </Suspense>
  );
}
