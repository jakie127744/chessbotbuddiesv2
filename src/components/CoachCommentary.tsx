'use client';

import { useState, useEffect, useRef } from 'react';
import { BotProfile } from '@/lib/bot-profiles';
import { Chess } from 'chess.js';
import { BookOpen } from 'lucide-react';
import { OpeningVariation, historyToUci, isInOpeningBook, getVariationById } from '@/lib/openings-repertoire';
import { BotGameConfig } from '@/lib/bot-engine';
import { getUserFavoriteOpening, getUserProfile } from '@/lib/user-profile';
import {
  getCoachCommentary,
  pickRandomComment,
  COACHING_DATA
} from '@/lib/coach-commentary';
import { processCommentary, processCommentaryWithEval, CommentaryMeta } from '@/lib/commentary-pipeline';
import { OPENING_FACTS, getGameStartAnnouncements, getNoveltyComment, getJakieFirstMoveReaction, detectOpeningTransposition, getJakieTacticApplause, getJakieEndgameIdentification } from '@/lib/coach-helpers';

// Sub-components
import { CoachHeader } from './coach/CoachHeader';
import { CoachMessageDisplay, Commentary } from './coach/CoachMessageDisplay';

interface CoachCommentaryProps {
  coach: BotProfile;
  game: Chess;
  lastMove?: string;
  openingConfig?: BotGameConfig; // Selected opening for bot
  userColor?: 'w' | 'b';
  mode?: 'playing' | 'coaching';
  variant?: 'default' | 'bubble';
}

// Alias the imported helper to match local usage
const pickRandom = pickRandomComment;

export function CoachCommentary({ coach, game, lastMove, openingConfig, userColor = 'w', mode = 'playing', variant = 'default' }: CoachCommentaryProps) {
  const [currentComment, setCurrentComment] = useState<Commentary | null>(null);
  const [activeVariation, setActiveVariation] = useState<OpeningVariation | null>(null);
  const [lastCommentedMoveCount, setLastCommentedMoveCount] = useState<number>(-1);
  const [userBookMoves, setUserBookMoves] = useState(0);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [hasAnnouncedOpening, setHasAnnouncedOpening] = useState(false);
  const [hasWarnedNovelty, setHasWarnedNovelty] = useState(false);
  const [userPlayedNovelty, setUserPlayedNovelty] = useState(false);
  const [hasIntroduced, setHasIntroduced] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const recentCommentsRef = useRef<string[]>([]);
  // Jakie-specific smart commentary state
  const [jakieLastOpeningName, setJakieLastOpeningName] = useState<string | null>(null);
  const [jakieLastEndgameType, setJakieLastEndgameType] = useState<string | null>(null);
  const jakieReactedMovesRef = useRef<Set<number>>(new Set());
  const fenBeforeRef = useRef<string>(''); // Track position before user's move for engine eval
  const currentCoachIdRef = useRef<string>('');
  
  // Audio Support
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Stop audio when coach changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [coach.id]);

  const addToHistory = (text: string) => {
      const history = recentCommentsRef.current;
      if (history.length >= 5) history.shift();
      history.push(text);
  };

  // Reset when coach changes
  useEffect(() => {
    if (coach && coach.id !== currentCoachIdRef.current) {
      currentCoachIdRef.current = coach.id;
      // Reset intro state so new coach introduces themselves
      setHasIntroduced(false);
      setCurrentComment(null);
      // Reset history on coach change
      recentCommentsRef.current = [];
    }
  }, [coach]);

  // Reset on new game
  useEffect(() => {
    const moveCount = game.history().length;
    if (moveCount === 0) {
      setCurrentComment(null);
      setActiveVariation(null);
      setLastCommentedMoveCount(-1);
      setUserBookMoves(0);
      setHasGameStarted(false);
      setHasAnnouncedOpening(false);
      setHasWarnedNovelty(false);
      setUserPlayedNovelty(false);
      setHasIntroduced(false);
      // Reset history on new game
      recentCommentsRef.current = [];
      // Reset Jakie-specific state
      setJakieLastOpeningName(null);
      setJakieLastEndgameType(null);
      jakieReactedMovesRef.current = new Set();
    }
  }, [game]);

  // Coach introduction (first time coach is selected)
  useEffect(() => {
    if (!hasIntroduced && coach) {
      setHasIntroduced(true);
      
      // Special personalized intro for Coach Jakie (Learning Coach)
      if (coach.id === 'bot-adaptive') {
        const favoriteOpeningId = getUserFavoriteOpening(3);
        const profile = getUserProfile();
        
        if (favoriteOpeningId) {
          const favoriteOpening = getVariationById(favoriteOpeningId);
          if (favoriteOpening) {
            const personalizedIntros = [
              `I've been watching your games. You really love the **${favoriteOpening.name}**! Let's practice that together.`,
              `Ah, we meet again! I noticed you enjoy playing the **${favoriteOpening.name}**. Shall we work on it?`,
              `Welcome back! Your favorite seems to be the **${favoriteOpening.name}**. I've prepared some ideas for you!`,
              `I've studied your games. The **${favoriteOpening.name}** suits your style. Let's master it!`,
              `Good to see you! Based on your history, you're a **${favoriteOpening.name}** player. Let's sharpen that edge!`,
            ];
            const intro = personalizedIntros[Math.floor(Math.random() * personalizedIntros.length)];
            addToHistory(intro);
            setTimeout(() => {
              setComment({ type: 'intro', text: intro });
            }, 500);
            return;
          }
        }
        
        // Fallback for Jakie if no opening history yet
        const jakieIntros = [
          "Hello! I'm Coach Jakie, your adaptive learning partner. Play a few games and I'll learn your style!",
          "Welcome! I adapt to your playstyle over time. The more you play, the better I understand you!",
          "Hi there! I'm here to help you improve. Play some games and I'll learn what openings you prefer!"
        ];
        const intro = jakieIntros[Math.floor(Math.random() * jakieIntros.length)];
        addToHistory(intro);
        setTimeout(() => {
          setComment({ type: 'intro', text: intro });
        }, 500);
        return;
      }
      
      // Standard coach intro for other coaches
      const introductions = COACHING_DATA.intro.map(c => c.text);
      const intro = pickRandomComment(introductions, recentCommentsRef.current.length > 0 ? recentCommentsRef.current[recentCommentsRef.current.length - 1] : '');
      addToHistory(intro);
      
      setTimeout(() => {
        setComment({ type: 'intro', text: intro });
      }, 500);
    }
  }, [coach, hasIntroduced]);


  // Game start announcement with opening
  useEffect(() => {
    if (!hasGameStarted && openingConfig?.opening && game.history().length === 0) {
      setHasGameStarted(true);
      const opening = openingConfig.opening;
      const systemId = opening.opening;
      const facts = OPENING_FACTS[systemId];
      
      const announcements = getGameStartAnnouncements(
        opening, 
        facts, 
        coach
      );
      const comment = pickRandom(announcements, recentCommentsRef.current);
      addToHistory(comment);
      
      // Delay after intro
      setTimeout(() => {
        setComment({ type: 'opening', text: comment });
        setHasAnnouncedOpening(true);
      }, hasIntroduced ? 3000 : 1000);
    }
  }, [hasGameStarted, openingConfig, game, coach, hasIntroduced]);

  const setComment = (comment: Omit<Commentary, 'timestamp'>) => {
    setCurrentComment({ ...comment, timestamp: new Date().toLocaleTimeString() } as Commentary);
  };

  // Track book moves and generate commentary via async pipeline with engine eval
  useEffect(() => {
    const moveCount = game.history().length;
    
    if (moveCount === 0 || !lastMove || moveCount === lastCommentedMoveCount) return;

    const history = game.history({ verbose: true });
    const uciMoves = historyToUci(history);
    
    // Capture fenBefore for the NEXT move (position before this move was made)
    // We need to reconstruct it by undoing the last move
    let fenBefore = fenBeforeRef.current;
    if (history.length > 0) {
      const tempGame = new Chess();
      tempGame.loadPgn(game.pgn());
      tempGame.undo();
      fenBefore = tempGame.fen();
    }
    
    // Check if user is following book
    let userStillInBook = false;
    if (openingConfig?.opening) {
      userStillInBook = isInOpeningBook(uciMoves, openingConfig.opening);
      
      // Count user's book moves (every other move based on userColor)
      if (userStillInBook) {
        const userMoveIndices = history
          .map((_, i) => i)
          .filter(i => {
            const moveColor = i % 2 === 0 ? 'w' : 'b';
            return moveColor === userColor;
          });
        const newUserBookMoves = userMoveIndices.filter(i => 
          i < openingConfig.opening!.moves.length && 
          uciMoves[i] === openingConfig.opening!.moves[i]
        ).length;
        setUserBookMoves(newUserBookMoves);
      }
    }
    
    // Store current FEN for next move's evaluation
    fenBeforeRef.current = game.fen();
    
    setIsThinking(true);
    
    // ============================================================
    // CB-101/103/104: Async engine-backed commentary pipeline
    // Non-blocking with timeout fallback to heuristics
    // ============================================================
    let cancelled = false;
    
    const runPipeline = async () => {
      const EVAL_TIMEOUT = 3000; // 3 second timeout for engine eval
      
      let result = null;
      
      try {
        // Try async engine-backed commentary with timeout
        const evalPromise = processCommentaryWithEval(
          game,
          coach,
          userColor,
          openingConfig?.opening,
          userBookMoves,
          userStillInBook,
          userPlayedNovelty,
          recentCommentsRef.current,
          lastCommentedMoveCount,
          fenBefore
        );
        
        // Race against timeout
        const timeoutPromise = new Promise<null>((resolve) => 
          setTimeout(() => resolve(null), EVAL_TIMEOUT)
        );
        
        result = await Promise.race([evalPromise, timeoutPromise]);
        
        // If timeout occurred, fall back to sync heuristics
        if (result === null) {
          console.log('[Commentary Pipeline] Engine eval timed out, falling back to heuristics');
          result = processCommentary(
            game,
            coach,
            userColor,
            openingConfig?.opening,
            userBookMoves,
            userStillInBook,
            userPlayedNovelty,
            recentCommentsRef.current,
            lastCommentedMoveCount
          );
        }
      } catch (e) {
        console.warn('[Commentary Pipeline] Engine eval failed, falling back to heuristics:', e);
        // Fallback to sync heuristics-only pipeline
        result = processCommentary(
          game,
          coach,
          userColor,
          openingConfig?.opening,
          userBookMoves,
          userStillInBook,
          userPlayedNovelty,
          recentCommentsRef.current,
          lastCommentedMoveCount
        );
      }
      
      // Check if effect was cancelled before updating state
      if (cancelled) return;
      
      setIsThinking(false);
      
      // ================================================================
      // SMART COMMENTARY INTERCEPTORS (coaching/training contexts only)
      // Fires in opening trainer, endgame trainer, review — NOT regular play.
      // ================================================================
      if (!cancelled && mode === 'coaching') {
        const sanHistory = game.history();
        const currentMoveCount = sanHistory.length;
        const lastSan = sanHistory[currentMoveCount - 1];
        const totalPieces = game.board().flat().filter(p => p !== null).length;
        const phase = currentMoveCount < 20 ? 'opening' : (totalPieces <= 12 ? 'endgame' : 'middlegame');

        // 1. First-5-move reaction (once per half-move, moves 1–5)
        if (currentMoveCount <= 10 && lastSan && !jakieReactedMovesRef.current.has(currentMoveCount)) {
          const reaction = getJakieFirstMoveReaction(lastSan, currentMoveCount, sanHistory);
          if (reaction) {
            jakieReactedMovesRef.current.add(currentMoveCount);
            addToHistory(reaction);
            setCurrentComment({ type: 'OpeningTheory', text: reaction, timestamp: new Date().toLocaleTimeString() } as Commentary);
            setLastCommentedMoveCount(moveCount);
            return;
          }
        }

        // 2. Opening transposition detection
        const currentOpeningName = openingConfig?.opening?.name ?? null;
        if (currentOpeningName && currentOpeningName !== jakieLastOpeningName) {
          if (jakieLastOpeningName !== null) {
            const transComment = detectOpeningTransposition(jakieLastOpeningName, currentOpeningName);
            if (transComment) {
              setJakieLastOpeningName(currentOpeningName);
              addToHistory(transComment);
              setCurrentComment({ type: 'OpeningTheory', text: transComment, timestamp: new Date().toLocaleTimeString() } as Commentary);
              setLastCommentedMoveCount(moveCount);
              return;
            }
          }
          setJakieLastOpeningName(currentOpeningName);
        }

        // 3. Named tactic applause — override generic WinningTactic with named version
        if (result && result.type === 'WinningTactic') {
          const triggers = result.meta?.triggers ?? [];
          let tacticType: 'fork' | 'pin' | 'skewer' | 'discovered_attack' | null = null;
          if (triggers.includes('TACTICAL_FORK')) tacticType = 'fork';
          else if (triggers.includes('TACTICAL_PIN')) tacticType = 'pin';
          else if (triggers.includes('TACTICAL_SKEWER')) tacticType = 'skewer';
          else if (triggers.includes('TACTICAL_DISCOVERED_ATTACK')) tacticType = 'discovered_attack';

          if (tacticType) {
            const applause = getJakieTacticApplause(tacticType);
            addToHistory(applause);
            setCurrentComment({ type: 'WinningTactic', text: applause, timestamp: new Date().toLocaleTimeString(), meta: result.meta } as Commentary);
            setLastCommentedMoveCount(moveCount);
            return;
          }
        }

        // 4. Endgame identification — fire once per endgame type
        if (phase === 'endgame') {
          const endgameInfo = getJakieEndgameIdentification(game);
          if (endgameInfo && endgameInfo.type !== jakieLastEndgameType) {
            setJakieLastEndgameType(endgameInfo.type);
            addToHistory(endgameInfo.comment);
            setCurrentComment({ type: 'EducationalTip', text: endgameInfo.comment, timestamp: new Date().toLocaleTimeString() } as Commentary);
            setLastCommentedMoveCount(moveCount);
            return;
          }
        }
      }
      // ================================================================

        if (result) {
        // Update novelty tracking if novelty was detected
        if (result.type === 'Novelty' && !userPlayedNovelty) {
          setUserPlayedNovelty(true);
        }
        
        // Store in history
        addToHistory(result.text);
        
        // Set comment with meta
        setCurrentComment({
          type: result.type,
          text: result.text,
          timestamp: new Date().toLocaleTimeString(),
          meta: result.meta,
        } as Commentary);
        
        setLastCommentedMoveCount(moveCount);
      }
      // If result is null, silence is intentional (no comment set)
    };
    
    // Small delay to allow UI to render first (CB-103: non-blocking)
    const timeoutId = setTimeout(() => {
      runPipeline();
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [lastMove, game, coach, lastCommentedMoveCount, openingConfig, userColor, userBookMoves, hasWarnedNovelty, userPlayedNovelty]);

  // ... (keep useEffects) ...

  if (variant === 'bubble') {
      return (
          <div className="flex gap-4 items-start w-full max-w-full">
               {/* Coach Avatar (Left) */}
               <div className="flex-shrink-0 flex flex-col items-center gap-2 mt-2">
                   <div 
                       className="w-16 h-16 rounded-full overflow-hidden border-2 shadow-lg relative z-10 bg-slate-800"
                       style={{ borderColor: coach.color }}
                   >
                       <img 
                           src={coach.avatar} 
                           alt={coach.name}
                           className="w-full h-full object-cover"
                       />
                   </div>
                   <div className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider max-w-[80px] leading-tight">
                       {coach.name}
                   </div>
               </div>

               {/* Speech Bubble (Right) */}
               <div className="flex-1 relative">
                   <CoachMessageDisplay 
                        comment={currentComment}
                        isThinking={isThinking}
                        coachName={coach.name}
                        variant="bubble"
                   />
               </div>
          </div>
      );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden relative">
      <CoachHeader 
        coach={coach}
        isPlaying={isPlaying}
        onToggleAudio={toggleAudio}
        audioRef={audioRef}
        onAudioEnd={() => setIsPlaying(false)}
        onAudioError={(e) => {
          console.error("Audio error:", e);
          setIsPlaying(false);
        }}
      />

      {/* Opening Book Status */}
      {openingConfig?.opening && (
        <div className="bg-blue-900/20 border-b border-blue-800/30 px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={12} className="text-blue-400" />
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest truncate">
              {openingConfig.opening.name}
            </span>
          </div>
          <span className="text-[10px] text-blue-400/70">
            {userPlayedNovelty ? 'Novelty played' : `${userBookMoves} book moves`}
          </span>
        </div>
      )}

      {/* Variation Display (if active and different from selected) */}
      {activeVariation && activeVariation.id !== openingConfig?.opening?.id && (
        <div className="bg-emerald-900/20 border-b border-emerald-800/30 px-4 py-1.5 flex items-center justify-center gap-2">
          <BookOpen size={12} className="text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest truncate">
            {activeVariation.name}
          </span>
        </div>
      )}

      <CoachMessageDisplay 
        comment={currentComment}
        isThinking={isThinking}
        coachName={coach.name}
      />
    </div>
  );
}

function getBookProgressComments5(): string[] {
  return [
    "You've been studying your openings! 5 book moves is solid.",
    "Nice! Following theory well. Keep it up!",
    "5 moves of pure theory. Your preparation is showing!",
    "Excellent opening knowledge! You know your stuff.",
    "Following the main lines perfectly. Well prepared!",
    "Smooth opening play! Theory is your friend today.",
    "5 book moves - you're playing like a pro!",
    "Great theoretical knowledge! The opening is going well."
  ];
}

function getBookProgressComments10(): string[] {
  return [
    "10 book moves! You really know this opening.",
    "Deep into theory now. Impressive preparation!",
    "You've been studying seriously! 10 moves of pure theory.",
    "Outstanding opening knowledge! Few players know this deep.",
    "10 moves of mainline theory - that's professional level!",
    "Your preparation is paying off beautifully!",
    "Deep theory territory now. You're well armed!",
    "Excellent! You know this line like the back of your hand."
  ];
}

function getNoveltyWarningComments(): string[] {
  return [
    "We're deep in theory now. Be ready - the opponent might play a novelty any moment!",
    "At this depth, be prepared for surprises. Novelties can come at any time.",
    "Stay sharp! We're at the edge of known theory. Anything can happen.",
    "Deep preparation territory. The opponent might deviate soon - stay alert!",
    "We're entering the critical zone. Don't rush - think carefully from here.",
    "This is where preparation meets creativity. Stay focused!",
    "The opening book is running thin. Be ready to think independently soon.",
    "Deep theory! A novelty could drop any moment - keep calculating."
  ];
}

function getGamePhase(game: Chess): 'opening' | 'middlegame' | 'endgame' {
  const moves = game.history().length;
  if (moves < 20) return 'opening';
  const pieces = game.board().flat().filter(p => p !== null).length;
  if (pieces <= 12) return 'endgame';
  return 'middlegame';
}




