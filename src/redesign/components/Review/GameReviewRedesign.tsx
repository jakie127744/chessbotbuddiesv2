"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Chess } from "chess.js";
import {
  Rewind,
  ChevronLeft,
  Play,
  ChevronRight,
  FastForward,
  RotateCcw,
} from "lucide-react";
import { SavedGame, saveGame, getGameHistory } from "@/lib/game-storage";

import { ChessBoard, BoardArrow } from "@/components/ChessBoard";
import { useRouter } from "next/navigation";
import { RedesignedEvalBar } from "./RedesignedEvalBar";
import { RedesignedPlayerPlate } from "./RedesignedPlayerPlate";
import { ReviewSidebar } from "./ReviewSidebar";
import {
  EngineConfig,
  DEFAULT_CONFIG,
  ENGINE_LINE_COLORS,
  EngineSettings,
} from "@/components/Review/EngineSettings";
import { useLiveAnalysis } from "@/hooks/useLiveAnalysis";
import { useMissedBestMoveArrow } from "@/hooks/useReviewArrows";
import {
  queryTablebase,
  isTablebasePosition,
  getTablebaseDisplayText,
  tablebaseToEval,
  TablebaseResult,
} from "@/lib/tablebase";
import { PlayerInfo } from "@/components/PlayerNameplate";
import { useBoardColorScheme } from "@/contexts/BoardColorSchemeContext";
import { ReviewLimitManager } from "@/lib/review-limit";
import { UserProfile, getUserProfile } from "@/lib/user-profile";
import { BOT_PROFILES } from "@/lib/bot-profiles";
import { motion, AnimatePresence } from "framer-motion";
import { RewardedAdModal } from "@/components/ads/RewardedAdModal";
import { NotificationToast, NotificationType } from "../NotificationToast";
import { useGameAnalysis } from "@/hooks/useGameAnalysis";

interface GameReviewRedesignProps {
  gameData?: SavedGame;
  initialPgn?: string;
  playerInfo?: {
    white: PlayerInfo;
    black: PlayerInfo;
  };
  onClose?: () => void;
  onNavigate?: (index: number) => void;
}

export function GameReviewRedesign({
  gameData,
  initialPgn,
  playerInfo,
  onClose,
  onNavigate,
}: GameReviewRedesignProps) {
  const router = useRouter();
  const { colorScheme } = useBoardColorScheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [overridePgn, setOverridePgn] = useState<string | undefined>(
    gameData?.pgn || initialPgn
  );

  useEffect(() => {
    const profile = getUserProfile();
    setUserProfile(profile);
  }, []);

  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);

  useEffect(() => {
    if (gameData?.pgn || initialPgn) {
      setOverridePgn(gameData?.pgn || initialPgn);
    }
  }, [gameData?.pgn, initialPgn]);

  const game = useMemo(() => {
    const g = new Chess();
    const sourcePgn = overridePgn || gameData?.pgn || initialPgn;
    if (sourcePgn) {
      try {
        let cleanPgn = sourcePgn
          .replace(/\\r/g, "")
          .replace(/\\n/g, "\n")
          .replace(/\\"/g, '"')
          .replace(/\\/g, "")
          .trim();

        if (!cleanPgn.includes("\n\n") && cleanPgn.includes("]")) {
          const lastBracketIndex = cleanPgn.lastIndexOf("]");
          if (lastBracketIndex !== -1) {
            cleanPgn =
              cleanPgn.slice(0, lastBracketIndex + 1) +
              "\n\n" +
              cleanPgn.slice(lastBracketIndex + 1).trim();
          }
        }
        g.loadPgn(cleanPgn);
      } catch (e) {
        console.error("Failed to load PGN:", e);
      }
    }
    return g;
  }, [gameData, initialPgn, overridePgn]);

  const { whiteRating, blackRating, moveClocks } = useMemo(() => {
    const headers = game.header();
    const wRating = headers["WhiteElo"]
      ? parseInt(headers["WhiteElo"])
      : undefined;
    const bRating = headers["BlackElo"]
      ? parseInt(headers["BlackElo"])
      : undefined;
    const clocks: (string | null)[] = [];
    const tempGame = new Chess();

    if (gameData?.pgn || initialPgn) {
      try {
        tempGame.loadPgn(game.pgn());
        const history = tempGame.history({ verbose: true });
        tempGame.reset();
        history.forEach((move) => {
          tempGame.move(move);
          const comment = tempGame.getComment();
          if (comment) {
            const match = comment.match(/%clk\s+([\d:]+)/);
            clocks.push(match ? match[1] : null);
          } else {
            clocks.push(null);
          }
        });
      } catch (e) {}
    }
    return { whiteRating: wRating, blackRating: bRating, moveClocks: clocks };
  }, [game, gameData, initialPgn]);

  const { currentWhiteTime, currentBlackTime } = useMemo(() => {
    if (currentMoveIndex === -1)
      return { currentWhiteTime: undefined, currentBlackTime: undefined };
    let wTime = undefined;
    let bTime = undefined;
    for (let i = currentMoveIndex; i >= 0; i--) {
      if (i % 2 === 0) {
        if (moveClocks[i]) {
          wTime = moveClocks[i];
          break;
        }
      }
    }
    for (let i = currentMoveIndex; i >= 0; i--) {
      if (i % 2 !== 0) {
        if (moveClocks[i]) {
          bTime = moveClocks[i];
          break;
        }
      }
    }
    return { currentWhiteTime: wTime, currentBlackTime: bTime };
  }, [currentMoveIndex, moveClocks]);

  const {
    isAnalyzing,
    progress,
    analyzedMoves,
    whiteAccuracy,
    blackAccuracy,
    detectedOpening,
    startAnalysis,
  } = useGameAnalysis({ game });

  const [persistentOpening, setPersistentOpening] = useState<string | null>(
    null,
  );
  const [reviewsRemaining, setReviewsRemaining] = useState(0);
  const [showAdModal, setShowAdModal] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);

  const showNotification = (
    message: string,
    type: NotificationType = "success",
  ) => {
    setNotification({ message, type });
  };

  useEffect(() => {
    setReviewsRemaining(ReviewLimitManager.getRemaining());
    if (detectedOpening) setPersistentOpening(detectedOpening);
  }, [detectedOpening]);

  const handleStartReview = () => {
    const remaining = ReviewLimitManager.getRemaining();
    if (remaining > 0) {
      if (ReviewLimitManager.consumeReview()) {
        setReviewsRemaining(ReviewLimitManager.getRemaining());
        startAnalysis();
      }
    } else {
      // Show rewarded ad modal instead of browser alert
      setShowAdModal(true);
    }
  };

  const handleRewardGranted = () => {
    const newTotal = ReviewLimitManager.addReward();
    setReviewsRemaining(newTotal);
    setShowAdModal(false);
    // Auto-start the review after reward
    if (ReviewLimitManager.consumeReview()) {
      setReviewsRemaining(ReviewLimitManager.getRemaining());
      startAnalysis();
    }
  };

  const [engineConfig, setEngineConfig] =
    useState<EngineConfig>(DEFAULT_CONFIG);
  const [isEngineEnabled, setIsEngineEnabled] = useState(true);
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem("chess_engine_config");
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setEngineConfig((prev) => ({
          ...prev,
          ...parsedConfig,
          showArrows: parsedConfig.showArrows ?? true,
        }));
      } catch (e) {}
    }

    const savedEnabled = localStorage.getItem("chess_engine_enabled");
    if (savedEnabled !== null) {
      setIsEngineEnabled(savedEnabled === "true");
    }

    if (gameData?.playerColor) {
      setOrientation(gameData.playerColor === "b" ? "black" : "white");
    }
  }, [gameData]);

  useEffect(() => {
    localStorage.setItem("chess_engine_config", JSON.stringify(engineConfig));
  }, [engineConfig]);

  useEffect(() => {
    localStorage.setItem("chess_engine_enabled", String(isEngineEnabled));
  }, [isEngineEnabled]);

  const currentPositionGame = useMemo(() => {
    const g = new Chess();
    if (gameData?.pgn || initialPgn) {
      g.loadPgn(gameData?.pgn || initialPgn || "");
      const history = g.history({ verbose: true });
      g.reset();
      for (let i = 0; i <= currentMoveIndex; i++) {
        if (history[i]) g.move(history[i]);
      }
    }
    return g;
  }, [gameData, initialPgn, currentMoveIndex]);

  const currentFen = currentPositionGame.fen();
  const sideToMove = currentFen.split(" ")[1] as "w" | "b";

  const currentMoveData = useMemo(() => {
    const analysisIndex = currentMoveIndex + 1;
    const move = analyzedMoves[analysisIndex];
    if (move) {
      const analysisFenParts = move.fen.split(" ");
      const currentFenParts = currentFen.split(" ");
      const isMatch =
        analysisFenParts.slice(0, 4).join(" ") ===
        currentFenParts.slice(0, 4).join(" ");
      if (isMatch) {
        return {
          evaluation: move.evaluation,
          isMate: move.isMate ?? false,
          mateIn: move.mateIn,
          bestMove: move.bestMove,
          stableEval: move.stableEval,
        };
      }
    }
    return {
      evaluation: 0,
      isMate: false,
      mateIn: undefined,
      bestMove: undefined,
    };
  }, [analyzedMoves, currentMoveIndex, currentFen]);

  const {
    lines: engineLines,
    isAnalyzing: isLiveAnalyzing,
    currentDepth,
    analyzedFen,
  } = useLiveAnalysis({
    fen: currentFen,
    config: engineConfig,
    enabled: !isAnalyzing && isEngineEnabled,
  });

  const formattedEngineLines = useMemo(() => {
    if (!engineLines.length) return [];
    try {
      const fenToUse = analyzedFen || currentFen;
      const tempGame = new Chess(fenToUse);
      return engineLines.map((line: any) => {
        const movesSAN: string[] = [];
        const tempLineGame = new Chess(fenToUse);
        for (const uciMove of line.moves.slice(0, 5)) {
          try {
            const move = tempLineGame.move({
              from: uciMove.slice(0, 2),
              to: uciMove.slice(2, 4),
              promotion:
                uciMove.length > 4 ? (uciMove.slice(4) as any) : undefined,
            });
            movesSAN.push(move.san);
          } catch (e) {
            break;
          }
        }
        const startTurn = tempGame.turn();
        const startMoveNumber = tempGame.moveNumber();
        let pvString = "";
        let currentTurn = startTurn;
        let currentMoveNum = startMoveNumber;
        movesSAN.forEach((san, i) => {
          if (currentTurn === "w") {
            pvString += `${currentMoveNum}. ${san} `;
            currentTurn = "b";
          } else {
            if (i === 0) pvString += `${currentMoveNum}... ${san} `;
            else {
              pvString += `${san} `;
              currentMoveNum++;
            }
            currentTurn = "w";
          }
        });
        return { ...line, evaluation: line.score, pv: pvString.trim() };
      });
    } catch (e) {
      return engineLines;
    }
  }, [engineLines, currentFen, analyzedFen]);

  const engineArrows: BoardArrow[] = useMemo(() => {
    if (!engineConfig.showArrows) return [];
    if (engineLines.length > 0) {
      const isLiveMatch =
        analyzedFen &&
        analyzedFen.split(" ").slice(0, 4).join(" ") ===
          currentFen.split(" ").slice(0, 4).join(" ");
      if (isLiveMatch) {
        return engineLines
          .map((line: any, index: number) => {
            const from = line.bestMove.slice(0, 2);
            const to = line.bestMove.slice(2, 4);
            const piece = currentPositionGame.get(from as any);
            if (!piece || piece.color !== sideToMove) return null;
            return {
              from,
              to,
              color: ENGINE_LINE_COLORS[index] || "#22c55e",
              opacity: 0.9 - index * 0.15,
            };
          })
          .filter(Boolean) as BoardArrow[];
      }
    }
    if (currentMoveData.bestMove) {
      return [
        {
          from: currentMoveData.bestMove.slice(0, 2),
          to: currentMoveData.bestMove.slice(2, 4),
          color: "#22c55e",
          opacity: 0.9,
        },
      ];
    }
    return [];
  }, [
    engineLines,
    currentMoveData.bestMove,
    currentFen,
    analyzedFen,
    engineConfig.showArrows,
    sideToMove,
  ]);

  const playedMoveArrow: BoardArrow[] = useMemo(() => {
    if (
      !engineConfig.showArrows ||
      currentMoveIndex < 0 ||
      !analyzedMoves[currentMoveIndex]
    )
      return [];
    const moveData = analyzedMoves[currentMoveIndex];
    let color = "";
    switch (moveData.classification) {
      case "Blunder":
        color = "#cc392c";
        break;
      case "Mistake":
        color = "#e6912c";
        break;
      case "Inaccuracy":
        color = "#f1b332";
        break;
      case "Brilliant":
        color = "#1baca6";
        break;
      case "Great":
        color = "#5b85d9";
        break;
    }
    if (!color) return [];
    const history = currentPositionGame.history({ verbose: true });
    const lastMove = history[history.length - 1];
    if (!lastMove) return [];
    return [{ from: lastMove.from, to: lastMove.to, color, opacity: 0.8 }];
  }, [
    currentMoveIndex,
    analyzedMoves,
    currentPositionGame,
    engineConfig.showArrows,
  ]);

  const missedBestMoveArrow = useMissedBestMoveArrow({
    currentMoveIndex,
    analyzedMoves,
    engineConfig,
    game: currentPositionGame,
  });

  const handleSaveGame = () => {
    try {
      const history = game.history({ verbose: true });
      if (history.length === 0) {
        showNotification("No moves to save.", "error");
        return;
      }
      const existing = getGameHistory();
      const pgn = game.pgn();
      const alreadySaved = existing.some((g) => g.pgn === pgn);
      if (alreadySaved) {
        showNotification("This game is already saved.", "info");
        return;
      }
      saveGame({
        pgn,
        fen: game.fen(),
        result: game.header()["Result"] || "Unknown",
        playerColor: gameData?.playerColor || "w",
        opponentName: gameData?.opponentName || "Opponent",
        moveCount: history.length,
        timeControl: gameData?.timeControl,
        whiteAvatar: gameData?.whiteAvatar,
        blackAvatar: gameData?.blackAvatar,
        platform: gameData?.platform || "local",
      });
      showNotification("Game saved to history!");
    } catch (e) {
      console.error("Failed to save game:", e);
      showNotification("Failed to save game.", "error");
    }
  };

  const handleImportPgn = (pgn: string) => {
    try {
      sessionStorage.setItem("importedPgn", pgn);
      sessionStorage.removeItem("importedGameMeta");
      setOverridePgn(pgn);
      setCurrentMoveIndex(-1);
      setPersistentOpening(null);
      setNotification({
        message: "PGN loaded. Click Start Analysis to review.",
        type: "success",
      });
      const nonce = Date.now();
      router.push(`/review?import=true&v=${nonce}`);
    } catch (e) {
      console.error("Failed to import PGN", e);
      setNotification({ message: "Failed to import PGN", type: "error" });
    }
  };

  const handleFlipBoard = () =>
    setOrientation((prev) => (prev === "white" ? "black" : "white"));
  const handleNavigate = (index: number) => setCurrentMoveIndex(index);

  const handleDownloadPgn = () => {
    const pgn = game.pgn();
    const blob = new Blob([pgn], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `game_${new Date().toISOString().split("T")[0]}.pgn`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
  };

  const resolveAvatar = (
    name: string,
    isBot: boolean,
    importedAvatar?: string,
  ) => {
    if (isBot) {
      const bot = BOT_PROFILES.find(
        (b) => b.name === name || b.nickname === name,
      );
      if (bot) return bot.avatar;
      if (name.toLowerCase().includes("bot")) return "/avatars/bot-rookie.png";
    }
    if (name === "You" || (userProfile && name === userProfile.username))
      return userProfile?.avatar;
    if (importedAvatar) return importedAvatar;
    return undefined;
  };

  const wName =
    gameData?.playerColor === "w" ? "You" : gameData?.opponentName || "White";
  const bName =
    gameData?.playerColor === "b" ? "You" : gameData?.opponentName || "Black";

  const whitePlayer: PlayerInfo = playerInfo?.white || {
    name: wName,
    color: "white",
    isBot: wName.toLowerCase().includes("bot"),
  };
  const blackPlayer: PlayerInfo = playerInfo?.black || {
    name: bName,
    color: "black",
    isBot: bName.toLowerCase().includes("bot"),
  };

  const topPlayer = orientation === "white" ? blackPlayer : whitePlayer;
  const bottomPlayer = orientation === "white" ? whitePlayer : blackPlayer;
  const topAvatar = resolveAvatar(
    topPlayer.name,
    !!topPlayer.isBot,
    orientation === "white" ? gameData?.blackAvatar : gameData?.whiteAvatar,
  );
  const bottomAvatar = resolveAvatar(
    bottomPlayer.name,
    !!bottomPlayer.isBot,
    orientation === "white" ? gameData?.whiteAvatar : gameData?.blackAvatar,
  );

  const currentMoveAnalysis = useMemo(() => {
    if (currentMoveIndex === -1 || !analyzedMoves[currentMoveIndex])
      return null;
    return analyzedMoves[currentMoveIndex];
  }, [analyzedMoves, currentMoveIndex]);

  const lastMoveSquares = useMemo(() => {
    if (currentMoveIndex === -1) return null;
    const g = new Chess();
    g.loadPgn(game.pgn());
    const history = g.history({ verbose: true });
    if (history[currentMoveIndex])
      return {
        from: history[currentMoveIndex].from,
        to: history[currentMoveIndex].to,
      };
    return null;
  }, [game, currentMoveIndex]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row w-full p-0 lg:p-2 gap-0 lg:gap-3 overflow-y-auto custom-scrollbar items-start bg-[color:var(--surface-primary,#0b1213)]">
      {/* Left: Board & Players — prioritize board width */}
      <div className="flex-1 flex flex-col gap-2 lg:gap-3 min-w-0 lg:max-w-none lg:self-start w-full">
        {/* Top Player */}
        <div className="w-full flex justify-center pt-1 lg:pt-0">
          <RedesignedPlayerPlate
            player={{
              ...topPlayer,
              rating: topPlayer.color === "white" ? whiteRating : blackRating,
            }}
            isCurrentTurn={sideToMove === topPlayer.color.charAt(0)}
            time={
              (topPlayer.color === "white"
                ? currentWhiteTime
                : currentBlackTime) || undefined
            }
            avatarUrl={topAvatar}
          />
        </div>

        {/* Main Board Area — width-driven so aspect-square never depends on flex height */}
        <div className="flex flex-col gap-1.5 lg:gap-2.5 w-full items-center">
          <div className="w-full flex justify-center">
            <div className="relative w-full max-w-[min(100vw,700px)] max-h-[58vh] aspect-square">
              {/* Evaluation Bar overlayed to minimize board separation */}
              <div className="absolute top-1 bottom-1 -left-1.5 lg:-left-2.5 w-[8px] lg:w-[11px] rounded-md overflow-hidden ring-1 ring-white/10 shadow-lg backdrop-blur-sm bg-black/30">
                <RedesignedEvalBar
                  evaluation={currentMoveData.evaluation}
                  orientation={orientation}
                  stableEval={currentMoveData.stableEval}
                />
              </div>

              {/* Chess Board Container — maximized square */}
              <div className="absolute inset-0 glass-card p-0 lg:p-2 rounded-none lg:rounded-[1.75rem] border border-transparent lg:border-white/10 shadow-3xl">
                <ChessBoard
                  game={currentPositionGame}
                  onMove={() => false}
                  orientation={orientation}
                  lastMove={lastMoveSquares}
                  classification={
                    currentMoveAnalysis?.classification?.toLowerCase() || null
                  }
                  moveSquare={lastMoveSquares?.to || null}
                  arePiecesDraggable={false}
                  arrows={[
                    ...engineArrows,
                    ...missedBestMoveArrow,
                    ...playedMoveArrow,
                  ]}
                  colorScheme={colorScheme}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:gap-4">
          {/* Bottom Player */}
          <div className="flex flex-col gap-3 lg:gap-4">
          <RedesignedPlayerPlate
            player={{
              ...bottomPlayer,
              rating:
                bottomPlayer.color === "white" ? whiteRating : blackRating,
            }}
            isCurrentTurn={sideToMove === bottomPlayer.color.charAt(0)}
            time={
              (bottomPlayer.color === "white"
                ? currentWhiteTime
                : currentBlackTime) || undefined
            }
            avatarUrl={bottomAvatar}
          />

          {/* Compact Media Player Controls — Under the player tag */}
          <div className="flex items-center justify-center gap-6 py-2.5 bg-black/20 rounded-2xl border border-white/5 backdrop-blur-sm self-center px-8 shadow-inner group">
            <button
              onClick={() => handleNavigate(-1)}
              className="p-1.5 text-zinc-500 hover:text-white transition-all hover:scale-110 active:scale-90"
            >
              <Rewind size={16} />
            </button>
            <button
              onClick={() => handleNavigate(currentMoveIndex - 1)}
              className="p-1.5 text-zinc-500 hover:text-white transition-all hover:scale-110 active:scale-90"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="relative group/play">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-lg opacity-0 group-hover/play:opacity-100 transition-opacity" />
              <button className="relative size-11 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.1)] z-10">
                <Play size={20} className="ml-0.5" fill="currentColor" />
              </button>
            </div>

            <button
              onClick={() => handleNavigate(currentMoveIndex + 1)}
              className="p-1.5 text-zinc-500 hover:text-white transition-all hover:scale-110 active:scale-90"
            >
              <ChevronRight size={24} />
            </button>
            <button
              onClick={() => handleNavigate(analyzedMoves.length - 1)}
              className="p-1.5 text-zinc-500 hover:text-white transition-all hover:scale-110 active:scale-90"
            >
              <FastForward size={16} />
            </button>
            <button
              onClick={handleFlipBoard}
              className="size-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center text-zinc-500 hover:text-white transition-all border border-white/5 ml-2"
            >
              <RotateCcw size={14} />
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* Right: Redesigned Sidebar */}
      <div className="order-3 w-full lg:w-[300px]">
        <ReviewSidebar
          analyzedMoves={analyzedMoves}
          whiteAccuracy={whiteAccuracy}
          blackAccuracy={blackAccuracy}
          isAnalyzing={isAnalyzing}
          progress={progress}
          currentMoveIndex={currentMoveIndex}
          currentFen={currentFen}
          onNavigate={handleNavigate}
          onStartReview={handleStartReview}
          reviewsRemaining={reviewsRemaining}
          openingName={persistentOpening || undefined}
          whiteName={whitePlayer.name}
          blackName={blackPlayer.name}
          whiteAvatar={topPlayer.color === "white" ? bottomAvatar : topAvatar}
          blackAvatar={topPlayer.color === "black" ? bottomAvatar : topAvatar}
          orientation={orientation}
          onFlipBoard={handleFlipBoard}
          onHome={() => router.push("/")}
          onShare={handleDownloadPgn}
          onToggleSettings={() => setShowSettings(true)}
          onImportPgn={handleImportPgn}
          onSaveGame={handleSaveGame}
          isCloudAnalysisEnabled={isEngineEnabled}
          onToggleCloudAnalysis={() => setIsEngineEnabled((prev) => !prev)}
          showArrows={engineConfig.showArrows}
          onToggleArrows={() =>
            setEngineConfig((c) => ({ ...c, showArrows: !c.showArrows }))
          }
          engineLines={formattedEngineLines}
          currentDepth={currentDepth}
          gameResult={game.header()["Result"] || gameData?.result}
          gameId={gameData?.id}
        />
      </div>

      {/* Engine Settings Overlay */}
      {showSettings && (
        <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1220] rounded-2xl border border-white/10 w-full max-w-md shadow-2xl p-5 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold">Engine</p>
                <h3 className="text-white font-black text-lg">Analysis Settings</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label="Close engine settings"
              >
                X
              </button>
            </div>

            <EngineSettings
              config={engineConfig}
              onConfigChange={setEngineConfig}
              isAnalyzing={isAnalyzing || isLiveAnalyzing}
            />

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-[#2563eb] hover:bg-[#3b82f6] text-white rounded-lg font-bold text-sm transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rewarded Ad Modal — shown when reviews run out */}
      <RewardedAdModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onRewardGranted={handleRewardGranted}
      />

      {/* Notification Toast */}
      <NotificationToast
        message={notification?.message || null}
        type={notification?.type}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}
