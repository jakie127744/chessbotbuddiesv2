import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { BotProfile } from '@/lib/bot-profiles';
import { calculateBotDelay, getBotMove, BotGameConfig } from '@/lib/bot-engine';
import { stopSharedWorker } from '@/lib/stockfish-manager';

interface UseBotAutoPlayProps {
  game: Chess;
  selectedBot: BotProfile | null;
  userColor: 'w' | 'b';
  // bestMove is no longer needed here as the engine calculates it
  onMove: (move: { from: string; to: string; promotion?: string }) => void;
  gameStatus: string;
  openingConfig?: BotGameConfig; // Optional opening configuration
  botTimeRemaining?: number; // New: Bot's remaining time in ms
}

export function useBotAutoPlay({
  game,
  selectedBot,
  userColor,
  onMove,
  gameStatus,
  openingConfig,
  botTimeRemaining
}: UseBotAutoPlayProps) {
  const [isThinking, setIsThinking] = useState(false);
  const [isPlayingBook, setIsPlayingBook] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFenRef = useRef<string>('');
  const processingMoveRef = useRef<boolean>(false);

  // Reset refs when bot or user color changes (new game scenario)
  useEffect(() => {
    lastFenRef.current = '';
    processingMoveRef.current = false;
    setIsThinking(false);
    setIsPlayingBook(false);
  }, [selectedBot, userColor, openingConfig]);

  useEffect(() => {
    // Clear any pending timeout on unmount or change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // 1. Basic Validation
    if (gameStatus || !selectedBot) {
      setIsThinking(false);
      return;
    }

    const currentFen = game.fen();
    const currentTurn = game.turn();
    const botColor = userColor === 'w' ? 'b' : 'w';

    // 2. Check if it's bot's turn
    if (currentTurn !== botColor) {
      setIsThinking(false);
      processingMoveRef.current = false;
      return;
    }

    // 3. Check if we're already processing this position
    if (currentFen === lastFenRef.current || processingMoveRef.current) {
      // Already handled or handling this FEN
      return;
    }

    // New position for bot to play
    lastFenRef.current = currentFen;
    processingMoveRef.current = true;
    setIsThinking(true);

    let isCancelled = false;

    const playMove = async () => {
      try {
        // Get the move first to know if it's a book move
        const move = await getBotMove(game, selectedBot, openingConfig);
        
        if (isCancelled) return;
        
        if (!move) {
          console.error('[Bot] Failed to find a valid move');
          return;
        }

        const isBookMove = move.isBookMove || false;
        const moveCategory = move.moveCategory; // New property
        
        if (isCancelled) return;
        setIsPlayingBook(isBookMove);
        
        // Calculate delay based on whether it's a book move and its quality
        const delay = calculateBotDelay(game, selectedBot, isBookMove, moveCategory, botTimeRemaining);
        console.log(`[Bot] ${selectedBot.name} thinking for ${Math.round(delay)}ms${isBookMove ? ' (book move)' : ''} type: ${moveCategory || 'Standard'}`);

        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (isCancelled) return;

        // Double check if game state changed while waiting
        if (game.fen() !== currentFen) {
          console.log('[Bot] Game state changed during think time, aborting move');
          if (!isCancelled) {
              processingMoveRef.current = false;
              setIsThinking(false);
          }
          return;
        }

        console.log(`[Bot] ${selectedBot.name} making move:`, move);
        onMove(move);
      } catch (e) {
        console.error('[Bot] Error during move calculation:', e);
      } finally {
        if (!isCancelled) {
            processingMoveRef.current = false;
            setIsThinking(false);
            setIsPlayingBook(false);
        }
      }
    };

    playMove();

    return () => {
        isCancelled = true;
        stopSharedWorker();
    };
  }, [game, selectedBot, userColor, onMove, gameStatus, openingConfig]);

  return { isThinking, isPlayingBook };
}

