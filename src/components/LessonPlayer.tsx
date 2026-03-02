"use client";
import { ChessBoard } from "./ChessBoard";
import { Chess } from "chess.js";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ArrowRight, RefreshCcw, Lightbulb, PlayCircle, Info, X, Check, Swords, Trophy, CheckCircle } from "lucide-react";
import { LessonNode } from "@/lib/lesson-data";
import type { BotMoveResult } from "@/lib/bot-engine";
import { useCallback } from "react";
import { useLessonGame } from "@/hooks/useLessonGame";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useRewards } from "@/contexts/RewardsContext";
import { useBoardColorScheme } from "@/contexts/BoardColorSchemeContext";
import { PIECE_IMAGES_DATA } from "@/redesign/lib/piece-images";
import { BOT_PROFILES } from "@/lib/bot-profiles";
import {
  getUserProfile,
  updateUserProfile,
  saveMinigameHighScore,
} from "@/lib/user-profile";
import {
  getPiggyMove,
  applyMinigameMove,
  getHiddenKingTrampleMove,
  canTrampleKing,
  getRemainingMobilePiggies,
  isFarmerPiggies,
  isPawnWars,
  shouldLockKings,
  getMinigamePieceStyles,
  getPermissiveBotMove,
  validateKnightTourMove,
  checkKnightTourSuccess,
  getUnprotectedBlackPieces,
  spawnRandomTarget,
  validateSafeBishopMove,
  isSquareAttacked,
  hasSafeCaptures,
  generateEndgameFEN,
  MINIGAME_IDS
} from "@/lib/minigame-rules";
import { LICHESS_PUZZLES, LichessPuzzle, ThemeKey } from "@/lib/lichess-puzzles";
import { getPolgarPuzzles } from "@/lib/polgar-puzzles";
import { getBotMove } from "@/lib/bot-engine";
import { getPuzzlesByTheme } from "@/lib/puzzle-service";
import { fetchPuzzlesFromExternalApi } from "@/lib/chess-puzzles-api";
import { TacticsDataAll } from "@/lib/data/tactics-data-all";

// Helper to map minigame IDs to puzzle themes
function getPuzzleThemeForLesson(lessonId: string): ThemeKey | null {
  const mapping: Record<string, ThemeKey> = {
    [MINIGAME_IDS.MATE_IN_1_RUSH]: 'mateIn1',
    [MINIGAME_IDS.MATE_IN_2_RUSH]: 'mateIn2',
    'w1-minigame-mate-in-3': 'mateIn3',
    'w2-minigame-fork': 'fork',
    'w2-minigame-pin': 'pin',
    'w2-minigame-skewer': 'skewer',
    'w2-minigame-discovered': 'discoveredAttack',
    'w2-minigame-double-attack': 'doubleCheck',
    'w2-minigame-remove-defender': 'sacrifice', // close enough approximation
    'w2-minigame-back-rank': 'backRankMate',
    'w2-minigame-deflection': 'deflection',
    'w2-minigame-decoy': 'attraction',
    'w2-minigame-overloading': 'overloading',
  };
  return mapping[lessonId] || null;
}
// import { MINIGAME_IDS } from '@/lib/minigame-ids'; // Uncomment if needed

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/**
 * Ensures a FEN has both kings so chess.js doesn't crash.
 * Places "Ghost Kings" on empty squares and returns their positions.
 */
function getSafeFen(fen: string) {
  if (!fen || fen === "start") return { safeFen: STARTING_FEN, ghosts: [] as string[] };
  
  // Basic validation: must have 6 parts
  const parts = fen.split(" ");
  if (parts.length < 1) return { safeFen: STARTING_FEN, ghosts: [] as string[] };
  
  let boardFen = parts[0];
  const ghosts: string[] = [];
  
  const hasWhiteKing = boardFen.includes("K");
  const hasBlackKing = boardFen.includes("k");
  
  if (hasWhiteKing && hasBlackKing) return { safeFen: fen, ghosts: [] as string[] };
  
  // We need to inject kings. 
  // Let's use a dummy board to find empty squares.
  const rows = boardFen.split("/");
  const board: (string | null)[][] = rows.map(row => {
    const result: (string | null)[] = [];
    for (const char of row) {
      if (isNaN(parseInt(char))) {
        result.push(char);
      } else {
        for (let i = 0; i < parseInt(char); i++) result.push(null);
      }
    }
    return result;
  });

  const findEmpty = () => {
    for (let r = 7; r >= 0; r--) {
      for (let c = 0; c < 8; c++) {
        const sq = `${"abcdefgh"[c]}${8 - r}`;
        if (!board[r][c] && !ghosts.includes(sq)) return { r, c, sq };
      }
    }
    return null;
  };

  if (!hasWhiteKing) {
    const empty = findEmpty();
    if (empty) {
      board[empty.r][empty.c] = "K";
      ghosts.push(empty.sq);
    }
  }
  if (!hasBlackKing) {
    const empty = findEmpty();
    if (empty) {
      board[empty.r][empty.c] = "k";
      ghosts.push(empty.sq);
    }
  }

  const newBoardFen = board.map(row => {
    let res = "";
    let emptyCount = 0;
    for (const char of row) {
      if (char === null) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          res += emptyCount;
          emptyCount = 0;
        }
        res += char;
      }
    }
    if (emptyCount > 0) res += emptyCount;
    return res;
  }).join("/");

  parts[0] = newBoardFen;
  // Ensure we have all 6 fields
  while (parts.length < 6) {
    if (parts.length === 1) parts.push("w");
    else if (parts.length === 2) parts.push("-");
    else if (parts.length === 3) parts.push("-");
    else if (parts.length === 4) parts.push("0");
    else if (parts.length === 5) parts.push("1");
  }

  return { safeFen: parts.join(" "), ghosts };
}

function LessonPlayer(props: any) {
  // --- Lesson/game logic via useLessonGame ---
  // Accept lesson prop or fallback to a demo lesson if not provided
  const lesson = props.lesson || {
    title: "Demo Lesson",
    pages: [{ type: "intro", text: "Welcome to the lesson!" }],
  };
  
  const { colorScheme } = useBoardColorScheme();
  
  const {
    pageIndex,
    setPageIndex,
    activePages,
    score,
    setScore,
    mistakes,
    setMistakes,
    hasMadeMistake,
    setHasMadeMistake,
    lessonCompleted,
    setLessonCompleted,
    currentPage,
    isFirstPage,
    isLastPage,
    handleNext,
    retryLesson,
  } = useLessonGame(lesson);

  const { playSound } = useSoundEffects();

  const [fen, setFen] = useState(currentPage?.fen || STARTING_FEN);
  const [showTooltip, setShowTooltip] = useState(false);

  // Memoize Safe FEN and Ghost Kings to avoid redundant board parsing
  const { safeFen, ghosts } = React.useMemo(() => getSafeFen(fen), [fen]);
  
  // Memoize Chess instance for rendering to avoid 'new Chess()' on every render
  const game = React.useMemo(() => {
    try {
      return new Chess(safeFen);
    } catch (e) {
      return new Chess(STARTING_FEN);
    }
  }, [safeFen]);

  const lastMove = React.useMemo(() => {
    const history = game.history({ verbose: true });
    if (history.length === 0) return null;
    const last = history[history.length - 1];
    return { from: last.from, to: last.to };
  }, [game]);

  // Removed redundant FEN update effect.

  const [activePrompt, setActivePrompt] = useState<string | null>(null);

  // Goal tracking state
  const [remainingGoals, setRemainingGoals] = useState<string[]>([]);
  const [clickedGoals, setClickedGoals] = useState<string[]>([]);
  const [wrongSquare, setWrongSquare] = useState<string | null>(null);

  const [isChallengeComplete, setIsChallengeComplete] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isQuizError, setIsQuizError] = useState(false);

  // Farmer Piggies tracking
  const [piggiesCaptured, setPiggiesCaptured] = useState(0);
  const [piggiesEscaped, setPiggiesEscaped] = useState(0);
  const [showPiggyModal, setShowPiggyModal] = useState(false);
  const [visitedSquares, setVisitedSquares] = useState<string[]>([]);
  const [flashFeedback, setFlashFeedback] = useState<string | null>(null);

  // Mate-in-2 Rush, Tactics & Endgame state
  const [rushPuzzles, setRushPuzzles] = useState<LichessPuzzle[]>([]);
  const [endgameFens, setEndgameFens] = useState<string[]>([]);
  const [rushSuccessCount, setRushSuccessCount] = useState(0);
  const [currentRushMoveIndex, setCurrentRushMoveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Derived states for minigame types
  const puzzleAction = (currentPage as any)?.playerAction;
  const isPuzzleRush = puzzleAction === "mate-in-2-rush" || puzzleAction === "mate-in-1-rush" || puzzleAction === "mate-in-3-rush" || puzzleAction === "tactics-blitz";
  const isEndgameMinigame = [MINIGAME_IDS.KING_ROOK_VS_KING, MINIGAME_IDS.KING_QUEEN_VS_KING, MINIGAME_IDS.KING_ROOK_ROOK_VS_KING].includes(lesson.id);

  const rushOrientation = React.useMemo(() => {
    const p = rushPuzzles[rushSuccessCount];
    if (!p) return 'white';
    try {
      const isEven = p.moves.length % 2 === 0;
      const isPolgar = p.id && String(p.id).startsWith('polgar-');
      const fenColor = new Chess(p.fen).turn();
      
      // If it's a Polgar puzzle OR an odd-length puzzle, it starts on the player's turn.
      if (isPolgar || !isEven) {
          return fenColor === 'w' ? 'white' : 'black';
      }
      
      // Even-length Lichess puzzles: FEN is before the opponent lead-in move.
      return fenColor === 'w' ? 'black' : 'white';
    } catch (e) {
      return 'white';
    }
  }, [rushPuzzles, rushSuccessCount]);

  useEffect(() => {
    if (currentPage?.fen && !isPuzzleRush && !isEndgameMinigame) {
      setFen(currentPage.fen);
    }

    if (currentPage?.goals) {
      setRemainingGoals([...currentPage.goals]);
    } else {
      setRemainingGoals([]);
    }
    setClickedGoals([]);
    setIsChallengeComplete(false);
    setCurrentMoveIndex(0);
    setPiggiesCaptured(0);
    setPiggiesEscaped(0);
    setShowPiggyModal(false);
    setVisitedSquares([]);
    setFlashFeedback(null);
    setShowTooltip(false);

    // Initialize Puzzle Rush Sequences
    if (isPuzzleRush && currentPage?.type === 'board') {
      const theme = getPuzzleThemeForLesson(lesson.id);
      
      const initializePuzzles = async () => {
        let selectedPuzzles: LichessPuzzle[] = [];

        if (theme === 'mateIn3') {
           try {
               const dbPuzzles = await getPuzzlesByTheme('mateIn3', 50);
               if (dbPuzzles && dbPuzzles.length >= 5) {
                   // Cast to LichessPuzzle as they share identical properties
                   selectedPuzzles = [...dbPuzzles].sort(() => Math.random() - 0.5).slice(0, 5) as unknown as LichessPuzzle[];
               }
           } catch (e) {
               console.error("Mate in 3 supabase fetch failed: ", e);
           }
           
           if (selectedPuzzles.length < 5) {
               console.warn("Insufficient Mate in 3 Supabase results, falling back to external chess_puzzles_api");
               try {
                   const externalPuzzles = await fetchPuzzlesFromExternalApi('mateIn3', 5);
                   if (externalPuzzles && externalPuzzles.length === 5) {
                       selectedPuzzles = externalPuzzles;
                   }
               } catch (fallbackError) {
                   console.error("External fallback also failed, reverting to Lichess Mate In 2: ", fallbackError);
               }
           }
           
           // Ultimate fallback if both Supabase and External API fail
           if (selectedPuzzles.length < 5) {
               console.warn("Ultimate fallback to offline Mate In 3 local dataset initialized");
               selectedPuzzles = [...LICHESS_PUZZLES.mateIn3].sort(() => Math.random() - 0.5).slice(0, 5);
           }
        } else if (theme === 'mateIn1') {
            let pool = getPolgarPuzzles('Mate in One', 50);
            if (pool.length < 5) pool = [...pool, ...LICHESS_PUZZLES.mateIn1];
            selectedPuzzles = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
        } else if (theme === 'mateIn2') {
            let pool = getPolgarPuzzles('Mate in Two', 50);
            if (pool.length < 5) pool = [...pool, ...LICHESS_PUZZLES.mateIn2];
            selectedPuzzles = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
        } else if (theme && LICHESS_PUZZLES[theme] && LICHESS_PUZZLES[theme].length > 0) {
            // Standard tactical themes (backed by inline data in lichess-puzzles.ts)
            const pool = LICHESS_PUZZLES[theme];
            selectedPuzzles = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
        } else if (theme) {
            // Tactical themes backed by local JSON puzzle files (fork, pin, skewer, etc.)
            const tacticsPoolMap: Record<string, () => LichessPuzzle[]> = {
                'fork':             () => TacticsDataAll.getForks() as unknown as LichessPuzzle[],
                'pin':              () => TacticsDataAll.getPins() as unknown as LichessPuzzle[],
                'skewer':           () => TacticsDataAll.getSkewers() as unknown as LichessPuzzle[],
                'discoveredAttack': () => TacticsDataAll.getDiscovered() as unknown as LichessPuzzle[],
                'doubleCheck':      () => TacticsDataAll.getDoubleAttacks() as unknown as LichessPuzzle[],
                'backRankMate':     () => TacticsDataAll.getBackRanks() as unknown as LichessPuzzle[],
                'deflection':       () => TacticsDataAll.getDeflections() as unknown as LichessPuzzle[],
                'attraction':       () => TacticsDataAll.getDecoys() as unknown as LichessPuzzle[],
                'sacrifice':        () => TacticsDataAll.getRemoveDefenders() as unknown as LichessPuzzle[],
                'trappedPiece':     () => TacticsDataAll.getAll() as unknown as LichessPuzzle[],
                'clearance':        () => TacticsDataAll.getAll() as unknown as LichessPuzzle[],
                'interference':     () => TacticsDataAll.getAll() as unknown as LichessPuzzle[],
                'hangingPiece':     () => TacticsDataAll.getAll() as unknown as LichessPuzzle[],
                'overloading':      () => TacticsDataAll.getOverloadings() as unknown as LichessPuzzle[],
            };
            const poolFn = tacticsPoolMap[theme];
            if (poolFn) {
                const pool = poolFn();
                selectedPuzzles = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
            }
        }

        setRushPuzzles(selectedPuzzles);
        setRushSuccessCount(0);
        
        if (selectedPuzzles.length > 0) {
          const puzzle = selectedPuzzles[0];
          setFen(puzzle.fen);
          
          const isEven = puzzle.moves.length % 2 === 0;
          const isPolgar = puzzle.id && String(puzzle.id).startsWith('polgar-');

          if (!isPolgar && isEven) {
              // Auto-play the first move (Opponent's lead-in) which is standard for even-length puzzles
              const g = new Chess(puzzle.fen);
              const firstMoveUci = puzzle.moves[0];
              g.move({ from: firstMoveUci.substring(0, 2), to: firstMoveUci.substring(2, 4), promotion: firstMoveUci.length > 4 ? firstMoveUci[4] : 'q' });
              setFen(g.fen());
              setCurrentRushMoveIndex(1); // Player starts at index 1
          } else {
              // Polgar puzzles and odd-length tactical puzzles start exactly on the player's turn
              setCurrentRushMoveIndex(0);
          }
        }
      };

      initializePuzzles();
    } else if (isEndgameMinigame && currentPage?.type === 'board') {
      let fens: string[] = [];
      for(let i=0; i<5; i++) {
        if (lesson.id === MINIGAME_IDS.KING_ROOK_VS_KING) fens.push(generateEndgameFEN(['R']));
        else if (lesson.id === MINIGAME_IDS.KING_QUEEN_VS_KING) fens.push(generateEndgameFEN(['Q']));
        else if (lesson.id === MINIGAME_IDS.KING_ROOK_ROOK_VS_KING) fens.push(generateEndgameFEN(['R', 'R']));
      }
      setEndgameFens(fens);
      setRushSuccessCount(0);
      if(fens.length > 0) setFen(fens[0]);
    } else if (!isPuzzleRush && !isEndgameMinigame) {
      setRushPuzzles([]);
      setEndgameFens([]);
      setRushSuccessCount(0);
      setCurrentRushMoveIndex(0);
    }
  }, [currentPage, lesson.id]);

  // Example: highlight file 'a' and rank '1' for "Files and Ranks" lesson
  useEffect(() => {
    if ((currentPage as any)?.id === "files-and-ranks") {
      setRemainingGoals([
        ...Array(8)
          .fill(0)
          .map((_, i) => `a${i + 1}`), // file a
        ...Array(8)
          .fill(0)
          .map((_, i) => `${"abcdefgh"[i]}1`), // rank 1
      ]);
      setActivePrompt("Click all squares in file a and rank 1!");
    } else {
      setActivePrompt(null);
    }
  }, [currentPage]);

  const resetPiggyGame = () => {
    setFen(currentPage?.fen || STARTING_FEN);
    setPiggiesCaptured(0);
    setPiggiesEscaped(0);
    setShowPiggyModal(false);
    setIsChallengeComplete(false);
    setIsBotThinking(false);
    setCurrentMoveIndex(0);
  };

  // Handle user move
// Helper to normalize move strings (strip +, #, x, and lowercase)
function normalizeMove(move: string): string {
    if (!move) return "";
    return move.replace(/[+#x]/g, "").toLowerCase();
}

/**
 * Robust move matching: checks UCI, SAN, and normalized SAN.
 * Also attempts to derive UCI from SAN for the current board state.
 */
function isMoveMatch(
    from: string, 
    to: string, 
    promotion: string | undefined, 
    playerSan: string | undefined, 
    expectedMove: string,
    currentFen: string
): boolean {
    const playerUci = from + to + (promotion || "");
    const expectedNormalized = normalizeMove(expectedMove);

    // 1. Direct UCI match
    if (playerUci === expectedMove) return true;

    // 2. Direct SAN match
    if (playerSan === expectedMove) return true;

    // 3. Normalized SAN match
    if (playerSan && normalizeMove(playerSan) === expectedNormalized) return true;

    // 4. Derived UCI match (If expectedMove is SAN, convert it to UCI for comparison)
    try {
        const g = new Chess(currentFen);
        let derived;
        // Support both UCI and SAN in expectedMove
        if (expectedMove.length >= 4 && expectedMove.length <= 5 && /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(expectedMove)) {
            derived = { from: expectedMove.substring(0, 2), to: expectedMove.substring(2, 4), promotion: expectedMove[4] };
        } else {
            const m = g.move(expectedMove);
            if (m) {
                derived = { from: m.from, to: m.to, promotion: m.promotion };
            }
        }
        
        if (derived) {
            const derivedUci = derived.from + derived.to + (derived.promotion || "");
            if (playerUci === derivedUci) return true;
        }
    } catch (e) {
        // Fallback or ignore if move fails
    }

    return false;
}

  const handleMove = (from: string, to: string, promotion?: string) => {
    if (isBotThinking) return false;
    const orientation = props.orientation || 'white';

    const solution = (currentPage as any)?.solution;
    const goals = (currentPage as any)?.goals;

    if (currentPage?.type === 'challenge' && Array.isArray(solution)) {
      const moveStr = `${from}${to}${promotion || ''}`;
      const isSequential = (currentPage as any)?.sequential;

      const gMoveTemp = new Chess(safeFen);
      let moveResult: any;
      try {
          moveResult = gMoveTemp.move({ from, to, promotion: promotion || 'q' });
      } catch (e) {
          moveResult = null;
      }

      if (isSequential) {
        const expectedMove = solution[currentMoveIndex];
        
        if (isMoveMatch(from, to, promotion, moveResult?.san, expectedMove, safeFen)) {
          if (ghosts.includes(from) || ghosts.includes(to)) return false;

          const g = new Chess(safeFen);
          const result = g.move({ from, to, promotion: promotion || 'q' });
          
            if (result) {
              let resFen = g.fen();
              if (ghosts.length > 0) {
                const resG = new Chess(resFen);
                ghosts.forEach((sq: string) => resG.remove(sq as any));
                resFen = resG.fen();
              }
              setFen(resFen);
              setWrongSquare(null);
              
              const nextIndex = currentMoveIndex + 1;
              setCurrentMoveIndex(nextIndex);

              if (nextIndex >= solution.length) {
                setIsChallengeComplete(true);
                setClickedGoals([to]);
                setTimeout(handleNext, 1500);
              }
              return true;
            }
        } else {
          setWrongSquare(to || from);
          setTimeout(() => setWrongSquare(null), 800);
          return false;
        }
        return false;
      } else {
        // Non-sequential: Any move in the solution array is correct
        const matchFound = solution.some((expectedMove: string) => 
            isMoveMatch(from, to, promotion, moveResult?.san, expectedMove, safeFen)
        );

        if (matchFound) {
          setIsChallengeComplete(true);
          setWrongSquare(null);
          setClickedGoals([to]);
          
          if (ghosts.includes(from) || ghosts.includes(to)) return false;

          const g = new Chess(safeFen);
          const moveResultReal = g.move({ from, to, promotion: promotion || 'q' });
          if (moveResultReal) {
            let resFen = g.fen();
            if (ghosts.length > 0) {
              const resG = new Chess(resFen);
              ghosts.forEach((sq: string) => resG.remove(sq as any));
              resFen = resG.fen();
            }
            setFen(resFen);
            setTimeout(handleNext, 1500);
            return true;
          }
        } else {
          setWrongSquare(to || from);
          setTimeout(() => setWrongSquare(null), 800);
          return false;
        }
      }
    } else if (currentPage?.type === 'challenge' && Array.isArray(goals)) {
        // Goal-based navigation challenge
        if (ghosts.includes(from) || ghosts.includes(to)) return false;

        const g = new Chess(safeFen);
        try {
            const moveResult = g.move({ from, to, promotion: promotion || 'q' });
            if (moveResult) {
                let resFen = g.fen();
                if (ghosts.length > 0) {
                  const resG = new Chess(resFen);
                  ghosts.forEach((sq: string) => resG.remove(sq as any));
                  resFen = resG.fen();
                }
                setFen(resFen);
                
                // If destination is a goal, mark it
                if (goals.includes(to)) {
                    setWrongSquare(null);
                    const newGoals = remainingGoals.filter(g => g !== to);
                    setRemainingGoals(newGoals);
                    setClickedGoals(prev => [...prev, to]);
                    
                    if (newGoals.length === 0) {
                        setIsChallengeComplete(true);
                        setTimeout(handleNext, 1200);
                    }
                }
                return true;
            }
        } catch (e) {}
        return false;
    }

    const pageOrientation = (currentPage as any)?.orientation || props.orientation || 'white';
    const playerColorChar = pageOrientation === 'black' ? 'b' : 'w';
    const oppColorChar = playerColorChar === 'w' ? 'b' : 'w';

    const gMinigame = new Chess(safeFen);

    // Pawn Wars
    if (isPawnWars(lesson.id)) {
        try {
            const moveResult = gMinigame.move({ from, to, promotion: promotion || 'q' });
            if (moveResult) {
                const newFen = gMinigame.fen();
                // Check if player promoted (Win)
                const piece = gMinigame.get(to as any);
                if (piece && piece.type === 'q' && piece.color === playerColorChar) {
                    setFen(newFen);
                    setIsChallengeComplete(true);
                    setTimeout(handleNext, 1500);
                    return true;
                }
                
                // Check if all enemy pawns captured (Win)
                const board = gMinigame.board().flat();
                const enemyPawns = board.filter((p: any) => p && p.type === 'p' && p.color === oppColorChar);
                if (enemyPawns.length === 0) {
                    setFen(newFen);
                    setIsChallengeComplete(true);
                    setTimeout(handleNext, 1500);
                    return true;
                }
                setFen(newFen);
                return true;
            }
        } catch (e) {}
        return false;
    }

    // Farmer Piggies
    if (isFarmerPiggies(lesson.id)) {
        try {
            const moveResult = gMinigame.move({ from, to, promotion: promotion || 'q' });
            if (moveResult) {
                const newFen = gMinigame.fen();
                // Check for capture
                if (moveResult.captured) {
                    setPiggiesCaptured(prev => prev + 1);
                }
                
                let isEscape = false;
                if (moveResult.piece === 'p' && (to.endsWith('1') || to.endsWith('8'))) {
                    setPiggiesEscaped(prev => prev + 1);
                    isEscape = true;
                }
                
                const remaining = getRemainingMobilePiggies(gMinigame, []);
                const escaped = isEscape ? piggiesEscaped + 1 : piggiesEscaped;
                const captured = moveResult.captured ? piggiesCaptured + 1 : piggiesCaptured;

                setFen(newFen);

                // If all piggies are accounted for (8 total)
                if (captured + escaped === 8) {
                    setIsChallengeComplete(true);
                    setShowPiggyModal(true);
                } else if (remaining === 0) {
                    // Logic for when no more piggies are on board but maybe not all 8 accounted?
                    // Safe fallback
                    setIsChallengeComplete(true);
                    setShowPiggyModal(true);
                }
                return true;
            }
        } catch (e) {}
        return false;
    }

    // Bishop Tour Logic
    if (lesson.id === MINIGAME_IDS.BISHOP_TOUR) {
        // 1. Validate it's a White Bishop
        const validation = validateSafeBishopMove(gMinigame, from, to);
        if (!validation.isValid) {
            setWrongSquare(to);
            setTimeout(() => setWrongSquare(null), 800);
            setFlashFeedback(validation.error || "Invalid move");
            playSound('error');
            return false;
        }

        // 2. Make the move (optimistic)
        const result = gMinigame.move({ from, to, promotion: promotion || 'q' });
        if (!result) return false;

        // 3. Safety Check: Is the destination attacked by Black?
        if (isSquareAttacked(gMinigame, to, 'b')) {
            setFlashFeedback("Game Over! Unsafe square!");
            playSound('error');
            
            // Revert state visually
            setFen(gMinigame.fen());
            setIsChallengeComplete(true);
            return true;
        }

        // 3.5 Protected Piece Check: Did we capture a defended piece?
        const tempCheck = new Chess(result.before);
        const wasProtected = isSquareAttacked(tempCheck, to, 'b');
        
        if (result.captured && wasProtected) {
            setFlashFeedback("Game Over! Captured a protected piece!");
            playSound('error');
            setFen(gMinigame.fen());
            setIsChallengeComplete(true);
            return true;
        }

        // 4. Force turn back to White first (so we can check for bishop moves)
        const fenParts = gMinigame.fen().split(' ');
        fenParts[1] = 'w'; 
        fenParts[3] = '-';
        gMinigame.load(fenParts.join(' '));

        // 4.5. Dynamic Spawning! Spawn a new enemy target on safe capture
        if (result.captured) {
              const newSpawnFen = spawnRandomTarget(gMinigame);
              if (newSpawnFen) {
                  gMinigame.load(newSpawnFen);
              }
              // Update score to count captured pieces
              setScore(prev => ({ ...prev, correct: (prev.correct || 0) + 1 }));
        }
        
        // 5. Check Win Conditions: 5 captures OR stalemate (no safe captures)
        const newScore = score.correct + (result.captured ? 1 : 0);
        const hasSafe = hasSafeCaptures(gMinigame);
        
        if (newScore >= 5) {
              setFlashFeedback("Victory! 5 pieces captured!");
              setIsChallengeComplete(true);
              playSound('success');
              setTimeout(handleNext, 1500);
        } else if (!hasSafe) {
              setFlashFeedback("Game Over! No safe captures left.");
              setIsChallengeComplete(true);
              playSound('error');
        } else {
              setFlashFeedback(result.captured ? `Enemy captured! (${newScore}/5)` : `Safe move. (${newScore}/5)`);
              if (result.captured) playSound('capture');
              else playSound('move');
        }
        
        setFen(gMinigame.fen());
        return true;
    }

    if (lesson.id === MINIGAME_IDS.ROOK_MAZE || lesson.id === MINIGAME_IDS.QUEENS_QUEST) {
        const isQueenQuest = lesson.id === MINIGAME_IDS.QUEENS_QUEST;
        const targetType = isQueenQuest ? 'q' : 'r';
        const winThreshold = isQueenQuest ? 8 : 10;
        
        try {
            // 1. Check if the piece being moved is correct
            const piece = gMinigame.get(from as any);
            if (!piece || piece.type !== targetType || piece.color !== 'w') {
                return false;
            }

            // 2. Attempt the move
            const result = gMinigame.move({ from, to, promotion: promotion || 'q' });
            if (!result) return false;

            // 3. Force turn back to White for continuous movement
            const fenParts = gMinigame.fen().split(' ');
            fenParts[1] = 'w'; 
            fenParts[3] = '-';
            gMinigame.load(fenParts.join(' '));

            // 4. Dynamic Spawning on capture
            if (result.captured) {
                const newSpawnFen = spawnRandomTarget(gMinigame);
                if (newSpawnFen) {
                    gMinigame.load(newSpawnFen);
                }
                setScore(prev => ({ ...prev, correct: (prev.correct || 0) + 1 }));
            }

            // 5. Check Win Condition
            const newScore = score.correct + (result.captured ? 1 : 0);
            if (newScore >= winThreshold) {
                setFlashFeedback(`Victory! All ${winThreshold} targets caught.`);
                setIsChallengeComplete(true);
                playSound('success');
                setTimeout(handleNext, 1500);
            } else {
                setFlashFeedback(result.captured ? `Target captured! (${newScore}/${winThreshold})` : `Positioning... (${newScore}/${winThreshold})`);
                if (result.captured) playSound('capture');
                else playSound('move');
            }

            setFen(gMinigame.fen());
            return true;
        } catch (e) {
            return false;
        }
    }

    // Knight Tour Logic
    if (lesson.id === MINIGAME_IDS.KNIGHT_TOUR) {
        const validation = validateKnightTourMove(to, visitedSquares);
        if (!validation.isValid) {
            setWrongSquare(to);
            setTimeout(() => setWrongSquare(null), 800);
            setFlashFeedback(validation.error || "Invalid move");
            return false;
        }
        
        try {
            const moveResult = gMinigame.move({ from, to, promotion: promotion || 'q' });
            if (moveResult) {
                // Force turn back to White for Knight Tour (solo puzzle)
                const fenParts = gMinigame.fen().split(' ');
                fenParts[1] = 'w'; 
                fenParts[3] = '-'; // Clear en passant
                const newFen = fenParts.join(' ');
                
                setFen(newFen);
                
                const newVisited = [...visitedSquares, to];
                setVisitedSquares(newVisited);

                if (checkKnightTourSuccess(new Chess(newFen), newVisited)) {
                     const finalScore = newVisited.length;
                     // UI Updates, set score, etc
                     setFlashFeedback(`Tour Finished! Visited: ${finalScore}`);
                     setIsChallengeComplete(true);
                     setTimeout(handleNext, 1500);
                } else {
                     const moves = new Chess(newFen).moves({verbose:true}).filter(m => !newVisited.includes(m.to) && m.piece === 'n');
                     setFlashFeedback(`${moves.length} jumps available`);
                }
                return true;
            }
        } catch (e) {}
        return false;
    }

    // Unified Puzzle Sequence Logic (Mates, Pins, Forks, etc.)
    if (isPuzzleRush) {
        if (isTransitioning) return false;
        const currentPuzzle = rushPuzzles[rushSuccessCount];
        if (!currentPuzzle) return false;

        const expectedMove = currentPuzzle.moves[currentRushMoveIndex];

        // Generate move result to check SAN match
        const newerGame = new Chess(game.fen());
        let playerMoveResult;
        try {
            playerMoveResult = newerGame.move({ from, to, promotion: promotion || 'q' });
        } catch (e) {}

        if (!isMoveMatch(from, to, promotion, playerMoveResult?.san, expectedMove, game.fen())) {
            setFlashFeedback("Wrong move! Try again.");
            playSound('error');
            setWrongSquare(to);
            setTimeout(() => setWrongSquare(null), 800);
            return false;
        }

        // Correct move!
        const nextMoveIndex = currentRushMoveIndex + 1;
        
        if (nextMoveIndex >= currentPuzzle.moves.length) {
            // Puzzle solved completely!
            const newSuccessCount = rushSuccessCount + 1;
            
            // Reapply move for visual
            setFen(newerGame.fen());
            playSound('success');

            if (newSuccessCount >= 5) {
                setRushSuccessCount(newSuccessCount);
                setFlashFeedback("Rush Complete! 5/5 Solved!");
                setIsChallengeComplete(true);
                setTimeout(handleNext, 1500);
            } else {
                setFlashFeedback(`Correct! Next puzzle (${newSuccessCount + 1}/5)`);
                setIsTransitioning(true);
                setTimeout(() => {
                    const nextPuzzle = rushPuzzles[newSuccessCount];
                    if (nextPuzzle) {
                        setFen(nextPuzzle.fen);
                        const isEven = nextPuzzle.moves.length % 2 === 0;
                        const isPolgar = nextPuzzle.id && String(nextPuzzle.id).startsWith('polgar-');

                        if (!isPolgar && isEven) {
                            const gNext = new Chess(nextPuzzle.fen);
                            const fm = nextPuzzle.moves[0];
                            // Support both UCI and SAN for lead-in moves
                            try {
                                if (fm.length >= 4 && fm.length <= 5 && /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(fm)) {
                                    gNext.move({ from: fm.substring(0, 2), to: fm.substring(2, 4), promotion: fm.length > 4 ? fm[4] : 'q' });
                                } else {
                                    gNext.move(fm);
                                }
                                setFen(gNext.fen());
                                setCurrentRushMoveIndex(1); // Player starts at index 1
                            } catch (e) {
                                console.error("Lead-in move failed:", fm);
                                setFen(nextPuzzle.fen);
                                setCurrentRushMoveIndex(0);
                            }
                        } else {
                            setCurrentRushMoveIndex(0);
                        }
                        // Synchronize success count update with new FEN to avoid orientation/label desync
                        setRushSuccessCount(newSuccessCount);
                    }
                    setIsTransitioning(false);
                }, 1000);
            }
            return true;
        }

        // Move is correct, but puzzle sequence continues!
        // Opponent response
        setFen(newerGame.fen());
        setCurrentRushMoveIndex(nextMoveIndex + 1);
        playSound('move');

        setTimeout(() => {
            const oppMoveStr = currentPuzzle.moves[nextMoveIndex];
            const oppGame = new Chess(newerGame.fen());
            
            try {
                // Support both UCI and SAN for opponent response
                if (oppMoveStr.length >= 4 && oppMoveStr.length <= 5 && /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(oppMoveStr)) {
                    oppGame.move({ 
                        from: oppMoveStr.substring(0, 2) as any, 
                        to: oppMoveStr.substring(2, 4) as any, 
                        promotion: (oppMoveStr.length === 5 ? oppMoveStr[4] : 'q') as any
                    });
                } else {
                    oppGame.move(oppMoveStr);
                }
                setFen(oppGame.fen());
                playSound('move');
            } catch (e) {
                console.error("Opponent response failed in rush:", oppMoveStr);
            }
        }, 600);

        return true;
    }

    // Normal board interaction
    try {
        // Prevent moving ghost kings
        if (ghosts.includes(from) || ghosts.includes(to)) return false;

        const solution = (currentPage as any)?.solution;
        const hasSequentialSolution = solution && Array.isArray(solution) && solution.length > 0;

        const gMove = new Chess(safeFen);
        let moveResult;
        try {
            moveResult = gMove.move({ from, to, promotion: promotion || 'q' });
        } catch (e) {
            moveResult = null;
        }

        if (hasSequentialSolution) {
           const expectedMove = solution[currentMoveIndex];
           if (expectedMove) {
               const playerMoveUci = from + to + (promotion || '');
               const matchesUci = playerMoveUci.startsWith(expectedMove);
               const matchesSan = moveResult && moveResult.san === expectedMove;
               
               if (!matchesUci && !matchesSan) {
                   setFlashFeedback("Wrong move! Try again.");
                   playSound('error');
                   setWrongSquare(to);
                   setTimeout(() => setWrongSquare(null), 800);
                   return false;
               }
           }
        }

        if (moveResult) {
            // We need to strip the ghost kings back out of the resulting FEN if they were injected
            let resFen = gMove.fen();
            if (ghosts.length > 0) {
              const resG = new Chess(resFen);
              ghosts.forEach((sq: string) => resG.remove(sq as any));
              resFen = resG.fen();
            }
            setFen(resFen);

            if (hasSequentialSolution && solution[currentMoveIndex]) {
                const nextIndex = currentMoveIndex + 1;
                setCurrentMoveIndex(nextIndex);
                
                if (nextIndex >= solution.length) {
                    setIsChallengeComplete(true);
                    setFlashFeedback("Challenge Complete!");
                    playSound('success');
                    setTimeout(handleNext, 1500);
                } else {
                    playSound('move');
                }
                return true; 
            }

            // Check for Game Over (Checkmate/Stalemate)
            if (gMove.isGameOver()) {
                if (gMove.isCheckmate()) {
                    setFlashFeedback("Checkmate! Victory!");
                    playSound('success');
                    
                    if (isEndgameMinigame) {
                        const newSuccessCount = rushSuccessCount + 1;
                        setRushSuccessCount(newSuccessCount);
                        if (newSuccessCount >= 5) {
                            setIsChallengeComplete(true);
                            setFlashFeedback("Endgame Mastery Complete! 5/5!");
                            setTimeout(handleNext, 2000);
                        } else {
                            setTimeout(() => {
                                setFlashFeedback(`Correct! Next position (${newSuccessCount + 1}/5)`);
                                setFen(endgameFens[newSuccessCount] || STARTING_FEN);
                            }, 1500);
                        }
                    } else {
                         setIsChallengeComplete(true);
                         setTimeout(handleNext, 2000);
                    }
                } else if (gMove.isStalemate()) {
                    if (isEndgameMinigame) {
                        // Stalemate is a mistake in endgame — skip to next but don't count as success
                        setFlashFeedback("Stalemate! Be careful. Loading next position...");
                        playSound('error');
                        setTimeout(() => {
                            if (rushSuccessCount >= 4) {
                                // On the last position (5/5), let them finish anyway
                                setIsChallengeComplete(true);
                                setFlashFeedback("Session complete. Click Finish to continue.");
                            } else {
                                setFen(endgameFens[rushSuccessCount + 1] || endgameFens[rushSuccessCount] || STARTING_FEN);
                            }
                        }, 2000);
                    } else {
                        setFlashFeedback("Stalemate!");
                        setIsChallengeComplete(true);
                    }
                } else {
                    setFlashFeedback(gMove.isStalemate() ? "Stalemate!" : "Game Over!");
                    if (!isEndgameMinigame) {
                         setIsChallengeComplete(true);
                    }
                }
            }
            return true;
        } else if (isPawnWars(lesson.id) || isFarmerPiggies(lesson.id)) {
            // PERMISSIVE MOVE FALLBACK for Minigames
            // If chess.js rejects it (e.g. King in check), but it's a minigame move, apply it manually
            const newFen = applyMinigameMove(fen, from, to, promotion);
            if (newFen !== fen) {
               setFen(newFen);
               return true;
            }
        }
    } catch (e) {
        if (isPawnWars(lesson.id) || isFarmerPiggies(lesson.id)) {
            const newFen = applyMinigameMove(fen, from, to, promotion);
            if (newFen !== fen) {
               setFen(newFen);
               return true;
            }
        }
    }
    return false;
  };

  const handlePieceDrop = (piece: string, square: string) => {
    try {
        const g = new Chess(fen);
        // Allow replacing pieces
        const type = piece.toLowerCase() as any;
        const color = (piece === piece.toUpperCase() ? 'w' : 'b') as 'w' | 'b';
        
        g.put({ type, color }, square as any);
        const newFen = g.fen();
        setFen(newFen);
        
        // Validation: Engine Verify (Start Position)
        if ((currentPage as any)?.validation === 'engine-verify') {
            const startFenPart = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
            if (newFen.split(' ')[0] === startFenPart) {
                setIsChallengeComplete(true);
                setFlashFeedback("Correct! Starting position restored.");
                playSound('success');
                setTimeout(handleNext, 1500);
            }
        } 
        // Validation: Goals-based placement
        else if ((currentPage as any)?.playerAction === 'place-pieces' && (currentPage as any)?.goals) {
            const goals = (currentPage as any).goals as string[];
            
            // Check if ALL goal squares in the starting position are occupied by the CORRECT piece type/color
            const startingGame = new Chess(); // Standard start
            const allMatch = goals.every(sq => {
                const currentPiece = g.get(sq as any);
                const targetPiece = startingGame.get(sq as any);
                return currentPiece && targetPiece && 
                       currentPiece.type === targetPiece.type && 
                       currentPiece.color === targetPiece.color;
            });

            if (allMatch) {
                setIsChallengeComplete(true);
                setFlashFeedback("Correct piece placement!");
                playSound('success');
                setTimeout(handleNext, 1500);
            }
        }
        return true;
    } catch (e) {
        console.error("Piece drop failed:", e);
        return false;
    }
  };

  // Bot move effect
  useEffect(() => {
    const isBotMode = (currentPage as any)?.playVsBot;
    // Explicitly prevent bot moves in Bishop Tour since Black is just static targets
    // Also disable bot moves during puzzle sequences, as they are handled deterministically in handleMove
    if (!isBotMode || isChallengeComplete || isBotThinking || lesson.id === MINIGAME_IDS.BISHOP_TOUR || isPuzzleRush) return;

    let gEffect: any;
    try {
      gEffect = new Chess(safeFen);
    } catch (e) {
      console.error("Bot effect failed to initialize FEN:", safeFen);
      return; 
    }
    
    const pageOrientation = (currentPage as any)?.orientation || props.orientation || 'white';
    const botColorChar = pageOrientation === 'black' ? 'w' : 'b';

    // If it's the bot's turn
    if (gEffect.turn() === botColorChar) {
      const performBotMove = async () => {
        setIsBotThinking(true);
        
        // Delay to feel more natural
        await new Promise(r => setTimeout(r, 600));
        
        const botProfile = BOT_PROFILES.find(b => b.id === 'bot-novice') || BOT_PROFILES[0];
        
        let moveResult: any;

        // Farmer Piggies: Specialized Bot Move
        if (isFarmerPiggies(lesson.id)) {
          // Only use getPiggyMove if the BOT is the Piggies
          // In Phase 1: bot is Piggies (Black). In Phase 2: bot is Old Louis (King).
          const isBotPiggy = (currentPage as any)?.player === (pageOrientation === 'white' ? 'black' : 'white');
          // Wait, 'player' in config is confusing. Let's use the explicit assignment.
          // Phase 1 (index 1): player is black (wait, config says Old Louis is white).
          // Let's check config: Page 1: player plays Old Louis (White). Bot is Black (Piggies).
          // Page 2: player plays Piggies (White). Bot is Black (Old Louis).
          
          // Simple rule: If bot is Piggies (has pawns), use getPiggyMove.
          const botColor = botColorChar;
          const hasPawns = gEffect.board().flat().some((p: any) => p && p.type === 'p' && p.color === botColor);
          
          if (hasPawns) {
            moveResult = getPiggyMove(gEffect, [], botColor);
          }
        } else if (canTrampleKing(lesson.id)) {
          // Pawn Wars: Check for Hidden King Trample
          moveResult = getHiddenKingTrampleMove(gEffect);
        }

        // Fallback to standard bot move if no specialized move found
        if (!moveResult) {
            try {
              const botConfig = (currentPage as any)?.lockedSquares ? { lockedSquares: (currentPage as any).lockedSquares } : undefined;
              moveResult = await getBotMove(gEffect, botProfile, botConfig);
            } catch (err) {
              console.error("Bot engine failed:", err);
            }
        }

        // Checkmate Fallback: If bot thinks it's checkmate but we want it to keep moving pieces
        if (!moveResult && (isPawnWars(lesson.id) || isFarmerPiggies(lesson.id))) {
            moveResult = getPermissiveBotMove(gEffect, ghosts);
        }
        
        if (moveResult) {
          // Verify bot didn't move a ghost king (should be impossible but let's be safe)
          const from = typeof moveResult === 'string' ? moveResult.slice(0, 2) : moveResult.from;
          const to = typeof moveResult === 'string' ? moveResult.slice(2, 4) : moveResult.to;
          
          if (ghosts.includes(from) || ghosts.includes(to)) {
             setIsBotThinking(false);
             return;
          }

          if (typeof moveResult === 'string') {
              gEffect.move(moveResult);
          } else {
              try {
                  gEffect.move(moveResult);
              } catch (e) {
                  const newFen = applyMinigameMove(gEffect.fen(), moveResult.from, moveResult.to, moveResult.promotion);
                  gEffect.load(newFen);
              }
          }
          
          let resFen = gEffect.fen();
          if (ghosts.length > 0) {
            const resG = new Chess(resFen);
            ghosts.forEach((sq: string) => resG.remove(sq as any));
            resFen = resG.fen();
          }
          // Detect Piggy Escape
          if (isFarmerPiggies(lesson.id) && (to.endsWith('1') || to.endsWith('8'))) {
            // we should also verify it's a pawn if possible, but safe enough since Old Louis doesn't usually hit 1/8 from the middle
            const piece = gEffect.get(to as any);
            // After promotion, it's a 'q' if we allow standard promotion, but checking piece in fen might be a queen.
            // Piggies always promote or become queens at the end row.
            setPiggiesEscaped(prev => prev + 1);
          }

          setFen(resFen);

          // Check for Game Over after bot move
          if (gEffect.isGameOver()) {
            setIsChallengeComplete(true);
            if (gEffect.isCheckmate()) {
              setFlashFeedback("Checkmate!");
            } else {
              setFlashFeedback("Game Over!");
            }
          }

          // Check if all piggies accounted for
          if (isFarmerPiggies(lesson.id)) {
            // Safety: Ensure our current FEN actually belongs to this challenge
            // to avoid triggering on a stale FEN from the previous page
            if (currentPage?.fen && gEffect.fen().split(' ')[0] === currentPage.fen.split(' ')[0] && piggiesCaptured + piggiesEscaped === 0 && !isChallengeComplete) {
                // If the FEN looks like the STARTING FEN but we've already completed the game? 
                // This check is tricky. Let's rely on the state reset.
            }

            const currentCaptured = piggiesCaptured;
            const nextEscaped = (to.endsWith('1') || to.endsWith('8')) ? piggiesEscaped + 1 : piggiesEscaped;
            
            const currentGame = new Chess(resFen);
            const remainingPiggiesCount = getRemainingMobilePiggies(currentGame, []);
            
            // Determine who the Piggies are
            // Phase 1: player is white (Louis), bot is black (Piggies)
            // Phase 2: player is white (Piggies), bot is black (Louis)
            const piggyColor = (currentPage as any)?.player === 'Piggies' || (currentPage as any)?.name === 'Piggies' ? 'w' : 'b';
            // Wait, checking config names is fragile. Let's find any pawn color.
            const whitePawn = currentGame.board().flat().some((p: any) => p && p.type === 'p' && p.color === 'w');
            const actualPiggyColor = whitePawn ? 'w' : 'b';

            const hasPiggyMoves = getPiggyMove(currentGame, [], actualPiggyColor) !== null;
            
            // Request 9: if the king has no legal move, that's also the end
            const hasKingMoves = currentGame.moves().length > 0;

            if (currentCaptured + nextEscaped === 8 || (remainingPiggiesCount > 0 && !hasPiggyMoves) || !hasKingMoves) {
              setIsChallengeComplete(true);
              setShowPiggyModal(true);
            }
          }
        }
        
        setIsBotThinking(false);
      };
      
      performBotMove();
    }
  }, [fen, currentPage, isChallengeComplete, isBotThinking, lesson.id]);

  // Reset index when page changes
  useEffect(() => {
    setCurrentMoveIndex(0);
    setIsChallengeComplete(false);
    setIsBotThinking(false);
  }, [pageIndex]);

  // Solution auto-move effect (for Black's moves in the solution)
  useEffect(() => {
    const solution = (currentPage as any)?.solution;
    if (!solution || isChallengeComplete || isBotThinking) return;

    const expectedMove = solution[currentMoveIndex];
    if (!expectedMove) return;

    // Safety: Ensure we don't auto-move using a FEN from the PREVIOUS page
    // during a transition. If currentMoveIndex is 0, FEN must match starting FEN exactly.
    if (currentPage?.fen && currentMoveIndex === 0 && fen !== currentPage.fen) return;

    const gSolo = new Chess(safeFen);
    const pageOrientation = (currentPage as any)?.orientation || props.orientation || 'white';
    
    // Explicit playerColor takes priority, then fallback to orientation
    const playerColorChar = (currentPage as any)?.playerColor || (pageOrientation === 'black' ? 'b' : 'w');

    // Auto-move if it's NOT the player's turn
    // OR if it's a non-interactive board demonstration
    if (gSolo.turn() !== playerColorChar || (currentPage?.type === 'board' && !((currentPage as any)?.interactive))) {
       // Wait a bit then move
       const timer = setTimeout(() => {
          let result;
          try {
             // Support both UCI formats and standard SAN formats for external data interoperability
             if (expectedMove.length >= 4 && expectedMove.length <= 5 && /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(expectedMove)) {
                 result = gSolo.move({ 
                     from: expectedMove.substring(0, 2) as any, 
                     to: expectedMove.substring(2, 4) as any, 
                     promotion: (expectedMove.length === 5 ? expectedMove[4] : 'q') as any
                 });
             } else {
                 result = gSolo.move(expectedMove); // e.g. "Nc7+"
             }
          } catch(e) {
             result = null;
          }

          if (result) {
            let resFen = gSolo.fen();
            if (ghosts.length > 0) {
              const resG = new Chess(resFen);
              ghosts.forEach((sq: string) => resG.remove(sq as any));
              resFen = resG.fen();
            }
            setFen(resFen);
            setCurrentMoveIndex(prev => prev + 1);
          } else {
            console.error("Opponent auto-move failed for constraint:", expectedMove);
          }
       }, 600);
       return () => clearTimeout(timer);
    }
  }, [fen, currentMoveIndex, currentPage, isChallengeComplete, isBotThinking]);

  // Handle quiz answer
  const handleQuizAnswer = (answer: { text: string; correct: boolean }) => {
    if (isChallengeComplete) return;
    if (answer.correct) {
      setIsChallengeComplete(true);
      setWrongSquare(null);
      setIsQuizError(false);
      // Advance after a delay
      setTimeout(handleNext, 1500);
    } else {
      setIsQuizError(true);
      setTimeout(() => setIsQuizError(false), 2000);
      setMistakes(prev => prev + 1);
      setHasMadeMistake(true);
    }
  };

  // UI state
  const [showSidebar, setShowSidebar] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { markLessonComplete } = useRewards();

  useEffect(() => {
    if (lessonCompleted) {
      markLessonComplete(lesson.id, lesson.xpReward);
    }
  }, [lessonCompleted, lesson.id, lesson.xpReward, markLessonComplete]);

  // --- Timer logic (placeholder, to be replaced with lesson/game timer logic) ---
  // ...existing code for timer if needed...

  // --- Main Render ---
  // --- Modern lesson presentation for the first lesson (template) ---
  // Jungle green palette accents
  const jungleGreen = "#1bada6";
  const jungleGreenDark = "#0a3d31";
  const jungleGreenLight = "#5ef2c2";

  // --- Completion Screen ---
  if (lessonCompleted) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-slate-800 border border-slate-700 w-full max-w-md p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
          
          <div className="size-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-500/30">
            <Check size={40} className="text-emerald-400" />
          </div>

          <h2 className="text-3xl font-black text-white mb-2">Lesson Passed!</h2>
          <p className="text-slate-400 mb-8">You've mastered the battlefield. Your tactical awareness is growing!</p>
          
          <div className="bg-slate-900/50 rounded-2xl p-6 mb-6 border border-slate-700/50">
            <div className="text-xs text-slate-500 uppercase tracking-widest font-black mb-1">Performance</div>
            <div className="text-5xl font-black text-emerald-400">100%</div>
            {mistakes > 0 && (
              <div className="text-xs text-slate-500 mt-2 font-bold italic">
                {mistakes} {mistakes === 1 ? 'correction' : 'corrections'} made
              </div>
            )}
          </div>

          <div className="bg-emerald-500/5 rounded-2xl p-4 mb-8 border border-emerald-500/10 text-left flex gap-3 items-center">
             <div className="size-10 rounded-full overflow-hidden border border-emerald-500/20 shrink-0">
                <img src="/mascot_profile.png" alt="Buddy" className="w-full h-full object-cover" />
             </div>
             <div>
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Master Tip</p>
                <p className="text-sm text-slate-300 font-medium leading-tight">
                  Want to supercharge your board vision? Try the <span className="text-emerald-400 font-bold">
                    {lesson.id === 'w1-l1-battlefield' ? '"Name the Square"' :
                     lesson.id === 'w2-l1-pawn' ? '"Pawn Wars"' :
                     lesson.id === 'w3-king-complete' ? '"Mate-in-1 Rush"' :
                     lesson.id === 'w4-knight-mastery' ? '"Knight\'s Tour"' :
                     lesson.id === 'w5-bishop-mastery' ? '"Bishop\'s Tour"' :
                     lesson.id === 'w6-rook-mastery' ? '"Rook Maze"' :
                     lesson.id === 'w9-queen-mastery' ? '"Queen\'s Quest"' :
                     '"Mastery Puzzles"'}
                  </span> minigame!
                </p>
             </div>
          </div>
          
          <button 
            onClick={() => {
              if (props.onComplete) props.onComplete();
              else if (props.onClose) props.onClose();
              else window.history.back(); // Fallback
            }}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-xl transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
          >
            Continue
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-background-light dark:bg-[#0a0e16] font-display text-slate-900 dark:text-slate-100">
      <header className="flex flex-col md:flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 py-3 shrink-0 gap-4 md:gap-0">
        <div className="flex items-center w-full justify-between md:w-auto md:justify-start gap-4">
          <div className="flex items-center gap-2 text-emerald-500">
            <div className="bg-emerald-500/10 p-1.5 md:p-2 rounded-lg">
              <img src="/next.svg" alt="Logo" className="w-5 h-5 dark:invert hidden" /> {/* Placeholder */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="3" y2="21"/><line x1="15" x2="15" y1="3" y2="21"/></svg>
            </div>
            <h2 className="text-lg md:text-xl font-black tracking-tight dark:text-white">Chess Master</h2>
          </div>
          <div className="hidden md:block h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
          <div className="hidden md:flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              {lesson.track?.replace('-', ' ')} : {lesson.category || 'Lesson'}
            </span>
            <h3 className="text-sm font-black dark:text-white leading-tight">
              {lesson.title}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-32 md:w-48 h-1.5 md:h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.round((pageIndex / Math.max(1, (activePages?.length || 2) - 1)) * 100)}%` }}
                ></div>
              </div>
              <span className="text-[10px] md:text-xs text-slate-500 font-black">
                {`${Math.round((pageIndex / Math.max(1, (activePages?.length || 2) - 1)) * 100)}%`}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
          <nav className="flex items-center gap-4 md:gap-8 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
            <a className="text-sm font-bold text-slate-900 dark:text-white border-b-2 border-emerald-500 pb-1 whitespace-nowrap" href="/learn">Lessons</a>
          </nav>
          <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4 md:pl-6">
            <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden md:block">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <div className="size-8 md:size-10 rounded-full border-2 border-emerald-500/20 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-emerald-500/50 transition-colors">
              <img alt="User" className="w-full h-full object-cover" src="/mascot_profile.png" />
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden bg-slate-900 justify-center items-center relative">
        {/* Main Workspace: Centered Chessboard & Story Vertical Stack */}
        <main className="relative w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center p-2 md:p-4 gap-4 md:gap-8 h-full overflow-y-auto">
          
          {/* Left Side: Chess Board and Action Bar */}
          <div className="flex flex-col items-center gap-4 w-full md:w-auto shrink-0 mt-4 md:mt-0">
            <div className="relative w-[350px] md:w-[460px] lg:w-[500px] h-[350px] md:h-[460px] lg:h-[500px]">
              {/* The Chess Board */}
              <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl ring-4 ring-slate-800">
                <ChessBoard
                  game={game}
                  lastMove={lastMove}
                  customSquares={(() => {
                    const squares: Record<string, { highlightColor?: string, icon?: any, color?: string, pulse?: boolean, label?: string, pieceOpacity?: number }> = {};
                    
                    // Hide ghost kings
                    ghosts.forEach((sq: string) => {
                      squares[sq] = { pieceOpacity: 0 };
                    });

                    // 1. Apply baseline custom highlights from the lesson data (if any)
                    // @ts-ignore
                    if (currentPage?.customHighlights) {
                      // @ts-ignore
                      currentPage.customHighlights.forEach((h: any) => {
                         if (h.squares) {
                            h.squares.forEach((sq: string) => {
                               squares[sq] = { highlightColor: h.color, label: h.label };
                            });
                         }
                      });
                    }

                    // 2. Overlay persistent visual confirmation for clicked squares
                    clickedGoals.forEach((sq) => {
                      squares[sq] = { ...squares[sq], highlightColor: "rgba(34, 197, 94, 0.7)", icon: Check, color: "rgba(255,255,255,0.9)" };
                    });
                    
                    // 3. Overlay the red flash error state if they just clicked wrong
                    if (wrongSquare) {
                      squares[wrongSquare] = { ...squares[wrongSquare], highlightColor: "rgba(239, 68, 68, 0.8)", icon: X, color: "white", pulse: true };
                    }
                    // 4. Knight Tour Highlights
                    if (lesson.id === MINIGAME_IDS.KNIGHT_TOUR && visitedSquares.length > 0) {
                      visitedSquares.forEach(sq => {
                        squares[sq] = {
                          ...squares[sq],
                          highlightColor: 'rgba(124, 58, 237, 0.4)', // Violet
                          icon: CheckCircle,
                          color: '#a78bfa'
                        };
                      });
                    }

                    return squares;
                  })()}
                  // @ts-ignore
                  arrows={currentPage?.arrows || []}
                  onSquareClick={(square: string) => {
                    if (remainingGoals.includes(square)) {
                      setWrongSquare(null);
                      const newGoals = remainingGoals.filter(g => g !== square);
                      setRemainingGoals(newGoals);
                      setClickedGoals(prev => [...prev, square]);
                      
                      if (newGoals.length === 0) {
                        // Proceed exactly when all goals are met
                        setIsChallengeComplete(true);
                        setTimeout(handleNext, 1200);
                      }
                    } else if (currentPage?.type === 'challenge' && remainingGoals.length > 0 && !clickedGoals.includes(square)) {
                      // RELAX: Don't show error if clicking a piece to move it
                      const Chess = require("chess.js").Chess;
                      const g = new Chess(fen);
                      const piece = g.get(square as any);
                      const isPieceSelection = piece && piece.color === g.turn();
                      
                      if (!isPieceSelection) {
                        setWrongSquare(square);
                        setTimeout(() => setWrongSquare(null), 800);
                      }
                    }
                  }}
                  onMove={(move) => {
                    return handleMove(move.from, move.to, move.promotion);
                  }}
                  onPieceDrop={handlePieceDrop}
                  orientation={
                    isPuzzleRush
                    ? rushOrientation
                    : ((currentPage as any)?.orientation || props.orientation || 'white')
                  }
                  arePiecesDraggable={currentPage?.type !== 'board' || !!(currentPage as any)?.interactive || !!(currentPage as any)?.playerAction} // Enable dragging for challenges, interactive boards, or minigames with player actions
                  colorScheme={colorScheme}
                />
                
              </div>

            </div>

            {/* Piece Drawer for Placement Challenges */}
            {(currentPage as any)?.playerAction === 'place-pieces' && (
              <div className="flex flex-wrap items-center justify-center gap-2 p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl mb-3 border border-slate-200 dark:border-slate-700 w-full max-w-[500px] animate-in fade-in slide-in-from-top-2 duration-500">
                <span className="text-[10px] uppercase font-black text-slate-400 mr-2">Drag to place:</span>
                {['P', 'N', 'B', 'R', 'Q', 'K', 'p', 'n', 'b', 'r', 'q', 'k'].map(p => (
                  <div 
                    key={p} 
                    draggable 
                    onDragStart={(e) => {
                      e.dataTransfer.setData("placementPiece", p);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    className="w-8 h-8 md:w-10 md:h-10 cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95 transition-all drop-shadow-sm hover:drop-shadow-md bg-white dark:bg-slate-700 rounded-lg p-1 border border-slate-200 dark:border-slate-600"
                  >
                    <img 
                      src={p === p.toUpperCase() ? PIECE_IMAGES_DATA[`w${p.toLowerCase()}`] : PIECE_IMAGES_DATA[`b${p}`]} 
                      alt={p} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
                <button 
                  onClick={() => setFen("4k3/8/8/8/8/8/8/4K3 w - - 0 1")} // Clear board (reset to kings)
                  className="ml-2 p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-500 transition-colors"
                  title="Clear Board"
                >
                  <RefreshCcw size={14} />
                </button>
              </div>
            )}

            {/* Flash Feedback Overlay (Moved out of board) */}
            <AnimatePresence>
              {flashFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="z-50 w-full flex justify-center mt-2 pointer-events-none absolute top-[100%] translate-y-2 left-0"
                >
                  <div className="bg-slate-900/90 text-white font-black px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md border border-white/10 text-lg text-center">
                    {flashFeedback}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Bar (Next/Retry) positioned naturally under the board */}
            <div className="flex justify-center gap-3 md:gap-4 z-20 shrink-0 mt-2 mb-4 md:mb-0 w-full">
              <button 
                className="flex-1 max-w-[140px] px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition flex items-center justify-center gap-2 text-sm md:text-base"
                onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                disabled={isFirstPage}
              >
                <ChevronLeft size={18} />
                Back
              </button>
              <button 
                className="flex-1 max-w-[200px] px-6 md:px-8 py-2.5 md:py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2 text-sm md:text-base whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-500"
                onClick={handleNext}
                disabled={
                  ((currentPage?.type === 'challenge' || currentPage?.type === 'quiz') && !isChallengeComplete) || 
                  ((lesson.id === MINIGAME_IDS.KNIGHT_TOUR || 
                    lesson.id === MINIGAME_IDS.BISHOP_TOUR || 
                    lesson.id === MINIGAME_IDS.ROOK_MAZE ||
                    lesson.id === MINIGAME_IDS.QUEENS_QUEST
                   ) && currentPage?.type === 'board' && !isChallengeComplete) ||
                  (isPuzzleRush && currentPage?.type === 'board' && !isChallengeComplete && rushSuccessCount < 5) ||
                  (isEndgameMinigame && currentPage?.type === 'board' && !isChallengeComplete && rushSuccessCount < 5)
                }
              >
                {isLastPage ? "Finish" : "Next Step"}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Right Side: Story Format Bubble (Moved beside the board) */}
          <AnimatePresence mode="wait">
            <motion.div
              // @ts-ignore
              key={currentPage?.id || "intro"}
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              transition={{ duration: 0.4, type: "spring" }}
              className="w-[350px] md:w-[320px] lg:w-[380px] h-auto max-h-[250px] md:h-auto md:min-h-[300px] flex flex-col justify-start bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 lg:p-6 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 z-20 overflow-y-auto hide-scrollbar self-start md:self-center"
            >
              <div className="flex items-start gap-4 w-full flex-col md:flex-row">
                <div className="size-12 md:size-16 rounded-full flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden shadow-inner bg-slate-100 self-center md:self-start">
                  <img src="/mascot_profile.png" alt="Coach Jakie" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 w-full text-center md:text-left mt-2 md:mt-0">
                  <h4 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Coach Jakie:
                  </h4>
                  {currentPage?.text && (
                    <p className="text-sm md:text-base lg:text-lg text-slate-700 dark:text-slate-200 leading-snug font-medium mb-3">
                      {(currentPage as any)?.playerAction?.includes('rush') 
                        ? "Find the checkmate in this position! You have 5 puzzles to solve correctly to finish the challenge."
                        : currentPage.text}
                    </p>
                  )}
                  {/* @ts-ignore */}
                  {currentPage?.prompt && currentPage.prompt !== currentPage.text && (
                    <p className="text-sm md:text-base lg:text-lg text-emerald-600 dark:text-emerald-400 font-bold leading-snug">
                      {/* @ts-ignore */}
                      {currentPage.prompt}
                    </p>
                  )}
                  {/* Fallback for edge cases without text or prompt */}
                  {/* @ts-ignore */}
                  {(!currentPage?.text && !currentPage?.prompt) && (
                    <p className="text-sm md:text-base lg:text-lg text-slate-700 dark:text-slate-200 leading-snug font-medium">
                      {currentPage?.type === "intro" ? "Welcome to the chessboard! Let's learn the files and ranks." : "Find the correct square!"}
                    </p>
                  )}
                </div>
              </div>

              {/* Minigame Info Overlay inside bubble */}
              {(isPuzzleRush || isEndgameMinigame) && currentPage?.type === 'board' && (
                <div className="mt-4 w-full text-emerald-500 font-black text-sm flex items-center justify-center gap-2 bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20">
                    <CheckCircle size={18} /> {isPuzzleRush ? "Puzzle" : "Position"}: {rushSuccessCount + 1} / 5
                </div>
              )}
              {lesson.id === MINIGAME_IDS.KNIGHT_TOUR && (
                <div className="mt-4 w-full text-emerald-500 font-black text-sm flex items-center justify-center gap-2 bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20">
                    <CheckCircle size={18} /> Visited: {visitedSquares.length}
                </div>
              )}
              {lesson.id === MINIGAME_IDS.BISHOP_TOUR && (
                <div className="mt-4 w-full text-emerald-500 font-black text-sm flex items-center justify-center gap-2 bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20">
                    <CheckCircle size={18} /> Captured: {score.correct}/5
                </div>
              )}
              {lesson.id === MINIGAME_IDS.ROOK_MAZE && (
                <div className="mt-4 w-full text-emerald-500 font-black text-sm flex items-center justify-center gap-2 bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20">
                    <CheckCircle size={18} /> Captured: {score.correct}/10
                </div>
              )}

                {/* Quiz Choices */}
                {/* @ts-ignore */}
                {currentPage?.type === 'quiz' && currentPage?.answers && !isChallengeComplete && (
                  <div className="mt-4 grid grid-cols-1 gap-2 w-full">
                    {/* @ts-ignore */}
                    {currentPage.answers.map((answer: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(answer)}
                        className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-all active:scale-95"
                      >
                        {answer.text}
                      </button>
                    ))}
                  </div>
                )}

                {/* Success Feedback for Quiz/Challenge */}
                {isChallengeComplete && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold text-center"
                  >
                    {currentPage?.successText || "Correct!"}
                  </motion.div>
                )}

                {/* Failure Feedback for Quiz */}
                {isQuizError && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 font-bold text-center"
                  >
                    Not quite. Try another one!
                  </motion.div>
                )}

                {/* Pro Move 3: Contextual "Why" Tooltip Toggle */}
                {currentPage?.explanation && (
                  <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                    <button
                      onClick={() => setShowTooltip(!showTooltip)}
                      className="flex items-center justify-center md:justify-start gap-2 text-sm font-bold text-emerald-500 hover:text-emerald-600 transition-colors w-full"
                    >
                      <Lightbulb size={18} className={showTooltip ? "fill-emerald-500" : ""} />
                      {showTooltip ? "Hide GM Secret" : "Reveal GM Secret!"}
                    </button>
                    
                    <AnimatePresence>
                      {showTooltip && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="mt-3 text-sm md:text-base text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                            {currentPage.explanation}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {/* Farmer Piggies Result Modal */}
      {showPiggyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-slate-800 border border-slate-700 w-full max-w-md p-8 rounded-3xl text-center shadow-2xl relative"
          >
            <div className="size-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-500/30">
              {piggiesCaptured >= 6 ? <Trophy size={40} className="text-emerald-400" /> : <Swords size={40} className="text-zinc-400" />}
            </div>

            <h2 className="text-3xl font-black text-white mb-2">Round Over!</h2>
            <p className="text-slate-400 mb-6 text-lg">
              {((currentPage as any)?.player === 'Piggies' || (currentPage as any)?.name === 'Piggies') ? (
                <>
                  <span className="text-emerald-400 font-black">{piggiesEscaped}</span> Piggies escaped and <span className="text-red-400 font-black">{piggiesCaptured}</span> were caught!
                </>
              ) : (
                <>
                  You captured <span className="text-emerald-400 font-black">{piggiesCaptured}</span> and <span className="text-red-400 font-black">{piggiesEscaped}</span> get away.
                </>
              )}
            </p>
            
            <p className="text-slate-500 mb-8 italic">
              {((currentPage as any)?.player === 'Piggies' || (currentPage as any)?.name === 'Piggies') 
                ? (piggiesEscaped === 8 ? "Perfect! The Piggies are all safe." : "Some piggies didn't make it. Try again!")
                : (piggiesCaptured === 8 ? "Perfect! Farmer Louis is proud." : "Do better next time, the farm needs you!")
              }
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={resetPiggyGame}
                className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2"
              >
                Challenge Yourself Again
              </button>
              <button 
                onClick={() => {
                  setShowPiggyModal(false);
                  handleNext();
                }}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black transition-all"
              >
                Continue to Next Lesson
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default LessonPlayer;
export { LessonPlayer };
