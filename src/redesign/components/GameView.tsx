'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ChessBoard from './ChessBoard';
import { EvaluationBar } from './EvaluationBar';
import { formatTime } from '../lib/utils';
import { BotProfile, BOT_PROFILES, getBotsByCategory, BotCategory } from '../lib/bot-profiles';
import { TimeControl, TIME_CONTROLS } from '../lib/game-config';
import { Chess } from 'chess.js';
import { BotProfileDetail } from './BotProfileDetail';
import { saveGame } from '@/lib/game-storage';

import { OpeningVariation, DEFAULT_REPERTOIRE } from '../lib/openings-repertoire';
import { Search, BookOpen, Play, Share2, Trophy, Frown, Handshake, BarChart3, Users } from 'lucide-react';

interface GameViewProps {
  game: Chess;
  boardOrientation: 'white' | 'black';
  onMove: (move: { from: string; to: string; promotion?: string }) => boolean;
  gameStatus: string;
  whiteTime: number;
  blackTime: number;
  selectedBot: BotProfile | null;
  onReset: () => void;
  onUndo: () => void;
  onResign: () => void;
  onOfferDraw: () => void;
  evaluation: { evaluation: number | null; mate: number | null };
  isThinking: boolean;
  playerName: string;
  onSelectBot: (bot: BotProfile) => void;
  onStartGame: (tc: TimeControl, color: 'w' | 'b' | 'random', opening?: OpeningVariation | null, isPassAndPlay?: boolean) => void;
  selectedTimeControl: TimeControl;
  selectedColor: 'w' | 'b' | 'random';
  onColorChange: (color: 'w' | 'b' | 'random') => void;
  onTimeControlChange: (tc: TimeControl) => void;
  isPlaying: boolean;
  selectedOpening?: OpeningVariation | null;
  onOpeningChange?: (opening: OpeningVariation | null) => void;
  isPassAndPlay?: boolean;
}

const CATEGORY_TABS: { key: BotCategory; label: string }[] = [
  { key: 'Beginner', label: 'Beginner' },
  { key: 'Intermediate', label: 'Intermediate' },
  { key: 'Advanced', label: 'Advanced' },
  { key: 'Master', label: 'Master' },
];

export function GameView({
  game,
  boardOrientation,
  onMove,
  gameStatus,
  whiteTime,
  blackTime,
  selectedBot,
  onReset,
  onUndo,
  onResign,
  onOfferDraw,
  evaluation,
  isThinking,
  playerName,
  onSelectBot,
  onStartGame,
  selectedTimeControl,
  selectedColor,
  onColorChange,
  onTimeControlChange,
  isPlaying,
  selectedOpening,
  onOpeningChange,
  isPassAndPlay = false
}: GameViewProps) {
  const router = useRouter();
  const [openingSearch, setOpeningSearch] = useState('');
  const [isOpeningListOpen, setIsOpeningListOpen] = useState(false);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const savedGameRef = useRef<string | null>(null);

  const filteredOpenings = useMemo(() => {
    if (!openingSearch) return DEFAULT_REPERTOIRE;
    return DEFAULT_REPERTOIRE.filter((op: OpeningVariation) => 
      op.name.toLowerCase().includes(openingSearch.toLowerCase()) ||
      (op.difficulty && op.difficulty.toLowerCase().includes(openingSearch.toLowerCase()))
    );
  }, [openingSearch]);

  const playerColor = boardOrientation === 'white' ? 'w' : 'b';
  const isPlayerTurn = game.turn() === playerColor;
  const [activeTab, setActiveTab] = useState<BotCategory>('Beginner');
  const [viewingBot, setViewingBot] = useState<BotProfile | null>(null);
  const botsByCategory = getBotsByCategory();

  // Determine game result
  const getWinner = (): 'white' | 'black' | 'draw' | null => {
    if (game.isCheckmate()) return game.turn() === 'w' ? 'black' : 'white';
    if (gameStatus?.toLowerCase().includes('white') && gameStatus?.toLowerCase().includes('time')) return 'white';
    if (gameStatus?.toLowerCase().includes('black') && gameStatus?.toLowerCase().includes('time')) return 'black';
    if (gameStatus === 'Resigned') return playerColor === 'w' ? 'black' : 'white';
    if (game.isDraw() || game.isStalemate() || gameStatus?.toLowerCase().includes('draw')) return 'draw';
    return null;
  };

  const winner = getWinner();
  const isGameOver = !!(gameStatus || game.isGameOver());
  const playerWon = winner === boardOrientation;
  const isDraw = winner === 'draw';

  // Show post-game overlay when game ends
  useEffect(() => {
    if (isGameOver && isPlaying) {
      savedGameRef.current = null; // reset for new game
      const t = setTimeout(() => setShowResultOverlay(true), 600);
      return () => clearTimeout(t);
    } else {
      setShowResultOverlay(false);
    }
  }, [isGameOver, isPlaying]);

  // Save game and navigate to review
  const handleReviewGame = () => {
    if (!savedGameRef.current) {
      const resultLabel = playerWon ? (boardOrientation === 'white' ? 'White wins' : 'Black wins')
        : isDraw ? 'Draw' 
        : (boardOrientation === 'white' ? 'Black wins' : 'White wins');
      const saved = saveGame({
        pgn: game.pgn(),
        fen: game.fen(),
        result: resultLabel,
        playerColor: playerColor,
        opponentName: isPassAndPlay ? 'Local Friend' : (selectedBot?.name || 'Bot'),
        moveCount: game.history().length,
        timeControl: selectedTimeControl?.label,
        platform: 'local',
      });
      savedGameRef.current = saved.id;
    }
    router.push(`/review?id=${savedGameRef.current}`);
  };

  const lastMove = useMemo(() => {
    const history = game.history({ verbose: true });
    if (history.length === 0) return null;
    const last = history[history.length - 1];
    return { from: last.from, to: last.to };
  }, [game]);

  // Opponent timer is opposite of player
  const opponentTime = playerColor === 'w' ? blackTime : whiteTime;
  const myTime = playerColor === 'w' ? whiteTime : blackTime;

  return (
    <div className="h-full flex gap-3 animate-in fade-in zoom-in-95 duration-500">
      {/* LEFT: Board Section */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Opponent Info Bar */}
        <div className="flex items-center justify-between bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--surface-highlight)] border border-[var(--border)] shrink-0 flex items-center justify-center">
              {isPassAndPlay ? (
                <Users className="text-[var(--color-text-primary)]" size={20} />
              ) : selectedBot?.avatar ? (
                <img src={selectedBot.avatar} alt={selectedBot.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-slate-400">
                  {selectedBot?.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1">
                <h3 className="font-bold text-white text-base">{isPassAndPlay ? 'Pass & Play' : (selectedBot?.name || 'Select Opponent')}</h3>
                {(!isPassAndPlay && selectedBot) && (
                  <span className="text-[9px] font-black bg-[var(--surface-highlight)] text-[var(--text-secondary)] px-1 py-0.5 rounded border border-[var(--border)] uppercase tracking-tighter">
                    {selectedBot.elo}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-tight">
                {isPassAndPlay ? 'Local multiplayer • no engine' : (selectedBot?.personality || 'No opponent')} {selectedBot?.category ? `• ${selectedBot.category}` : ''} {selectedBot?.nationality ? `• ${selectedBot.nationality}` : ''}
              </p>
            </div>
          </div>
          {isPlaying && (
            <div className={`font-mono text-lg font-black px-3 py-1 bg-[var(--surface-highlight)] rounded-lg border border-[var(--border)] shadow-inner ${
              !isPlayerTurn ? 'text-white' : 'text-[var(--text-secondary)]'
            }`}>
              {formatTime(opponentTime)}
            </div>
          )}
        </div>

        {/* Chess Board Container */}
        <div className="flex-1 flex items-center justify-center min-h-0 min-w-0 p-0">
          <div className="w-full h-full relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center gap-2">
              {/* Eval Bar */}
              <div className="hidden lg:block h-full w-2 bg-[var(--surface-highlight)] border border-[var(--border)] rounded-full overflow-hidden shrink-0">
                <EvaluationBar
                  evaluation={evaluation.evaluation ?? 0}
                  isMate={evaluation.mate !== null}
                  orientation={boardOrientation}
                />
              </div>

              {/* Board */}
              <div className="flex-1 h-full w-full relative group flex justify-center items-center">
                <div className="relative shadow-lg rounded-lg overflow-hidden border border-[var(--border)] w-full h-full">
                    <ChessBoard
                      game={game}
                      onMove={onMove}
                      orientation={boardOrientation}
                      lastMove={lastMove}
                      arePiecesDraggable={isPlaying && !gameStatus && !game.isGameOver()}
                    />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Player Info Bar */}
        <div className="flex items-center justify-between bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-highlight)] flex items-center justify-center border border-[var(--border)] shrink-0">
              <span className="text-[10px] font-bold text-jungle-green-300">ME</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-[13px] leading-none">{playerName}</h3>
              <p className="text-[10px] text-[var(--text-secondary)]">Player</p>
            </div>
          </div>
          {isPlaying && (
            <div className={`font-mono text-base font-bold px-3 py-1 rounded-lg transition-colors ${
              isPlayerTurn ? 'bg-jungle-green-500/15 text-jungle-green-300 border border-jungle-green-500/40 animate-pulse' : 'bg-[var(--surface-highlight)] text-[var(--text-secondary)] border border-[var(--border)]'
            }`}>
              {formatTime(myTime)}
            </div>
          )}
        </div>

        {/* Game Controls */}
        <div className="flex items-center justify-center gap-2 py-1.5">
          <button
            onClick={onUndo}
            className="flex flex-col items-center gap-0.5 transition-all group px-3 py-1.5 rounded-md"
          >
            <div className="p-1 rounded-md group-hover:bg-[var(--surface-highlight)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)] group-hover:text-white transition-colors"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
            </div>
            <span className="text-[9px] font-black text-[var(--text-secondary)] group-hover:text-white uppercase tracking-widest">Undo</span>
          </button>

          <button
            onClick={onReset}
            className="px-5 py-2 bg-jungle-green-500 hover:bg-jungle-green-400 text-[#0b0f1a] rounded-md font-black uppercase tracking-widest shadow-md shadow-jungle-green-500/20 transition-all flex items-center gap-2 text-sm h-[46px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Game
          </button>

          <button
            onClick={() => {}} // Hint functionality not implemented yet
            className="flex flex-col items-center gap-0.5 transition-all group px-3 py-1.5 rounded-md"
          >
            <div className="p-1 rounded-md group-hover:bg-[var(--surface-highlight)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)] group-hover:text-amber-300 transition-colors"><path d="M9.663 17h4.674"/><path d="M7 10.847c0-2.828 2.239-5.147 5-5.147s5 2.319 5 5.147c0 3.071-2.542 5.195-3 7.153a11.059 11.059 0 0 1-4 0c-.458-1.958-3-4.082-3-7.153Z"/><path d="M10 22h4"/></svg>
            </div>
            <span className="text-[9px] font-black text-[var(--text-secondary)] group-hover:text-amber-300 uppercase tracking-widest">Hint</span>
          </button>

          <div className="w-px h-8 bg-white/5 mx-1"></div>

          <button
            onClick={() => {
              const pgn = game.pgn();
              navigator.clipboard.writeText(pgn);
            }}
            className="flex flex-col items-center gap-0.5 transition-all group px-3 py-1.5 rounded-md"
            title="Copy PGN to clipboard"
          >
            <div className="p-1 rounded-md group-hover:bg-[var(--surface-highlight)]">
              <Share2 size={17} className="text-[var(--text-secondary)] group-hover:text-white transition-colors" />
            </div>
            <span className="text-[9px] font-black text-[var(--text-secondary)] group-hover:text-white uppercase tracking-widest">Share</span>
          </button>

          <div className="w-px h-8 bg-white/5 mx-1"></div>

          <button
            onClick={onResign}
            className="flex flex-col items-center gap-0.5 transition-all group px-3 py-1.5 rounded-md"
          >
            <div className="p-1 rounded-md group-hover:bg-[var(--surface-highlight)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)] group-hover:text-rose-400 transition-colors"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
            </div>
            <span className="text-[9px] font-black text-[var(--text-secondary)] group-hover:text-rose-400 uppercase tracking-widest">Resign</span>
          </button>
        </div>

        {/* Thinking Indicator - always occupies space to prevent board shifting */}
        {!isPassAndPlay && (
          <div className={`flex items-center gap-3 px-4 py-2 bg-redesign-cyan/5 border border-redesign-cyan/20 rounded-xl transition-opacity duration-200 ${isThinking ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="w-2 h-2 rounded-full bg-redesign-cyan animate-pulse shadow-[0_0_10px_#0db9f2]" />
            <p className="text-xs font-bold text-redesign-cyan uppercase tracking-widest">{selectedBot?.name || 'Bot'} is thinking...</p>
          </div>
        )}

        {/* Post-Game Result Overlay */}
        {showResultOverlay && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#111827] border border-white/10 rounded-2xl shadow-2xl w-[420px] overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Result Header */}
              <div className={`px-8 py-7 text-center ${
                playerWon ? 'bg-gradient-to-b from-emerald-500/20 to-transparent' 
                : isDraw ? 'bg-gradient-to-b from-amber-500/20 to-transparent' 
                : 'bg-gradient-to-b from-rose-500/20 to-transparent'
              }`}>
                <div className={`inline-flex p-4 rounded-full mb-4 ${
                  playerWon ? 'bg-emerald-500/20' : isDraw ? 'bg-amber-500/20' : 'bg-rose-500/20'
                }`}>
                  {playerWon ? <Trophy size={36} className="text-emerald-400" /> 
                  : isDraw ? <Handshake size={36} className="text-amber-400" />
                  : <Frown size={36} className="text-rose-400" />}
                </div>
                <h2 className={`text-2xl font-black uppercase tracking-wider ${
                  playerWon ? 'text-emerald-400' : isDraw ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {playerWon ? 'Victory!' : isDraw ? 'Draw' : 'Defeat'}
                </h2>
                <p className="text-sm text-slate-400 mt-1 font-bold">
                  {gameStatus || (game.isCheckmate() ? 'Checkmate' : 'Game Over')}
                  {selectedBot && ` vs ${selectedBot.name} (${selectedBot.elo})`}
                </p>
              </div>

              {/* Actions */}
              <div className="px-8 py-6 space-y-3">
                <button
                  onClick={handleReviewGame}
                  className="w-full py-4 bg-[#2563eb] hover:bg-[#3b82f6] text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
                >
                  <BarChart3 size={18} />
                  Review Game
                </button>
                <button
                  onClick={() => {
                    setShowResultOverlay(false);
                    onReset();
                  }}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-white/5"
                >
                  <Play size={18} className="fill-white" />
                  New Game
                </button>
                <button
                  onClick={() => setShowResultOverlay(false)}
                  className="w-full py-3 text-slate-500 hover:text-slate-300 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* RIGHT: Bot Selection Panel */}
      <div className="w-[300px] flex flex-col bg-[var(--surface)]/80 rounded-2xl border border-[var(--border)] shadow-xl overflow-hidden shrink-0 hidden lg:flex relative">
        {/* Panel Header */}
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white mb-0.5">Play with Bots</h2>
            {isPassAndPlay && (
              <span className="px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Pass & Play
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)]">Choose a computer opponent</p>
        </div>

        {/* Category Tabs */}
        <div className="flex px-3 pt-3 gap-1.5">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-colors ${
                activeTab === tab.key
                  ? 'bg-jungle-green-500 text-[#0b0f1a]'
                  : 'bg-[var(--surface-highlight)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bot List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {botsByCategory[activeTab]?.map(bot => {
            const isSelected = selectedBot?.id === bot.id;
            return (
              <div
                key={bot.id}
                onClick={() => onSelectBot(bot)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'border-2 border-jungle-green-500 bg-jungle-green-500/10'
                    : 'border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-highlight)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg overflow-hidden bg-[var(--surface-highlight)] border border-[var(--border)] shrink-0">
                    {bot.avatar ? (
                      <img src={bot.avatar} alt={bot.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-[var(--text-secondary)] text-lg bg-[var(--surface)]">
                        {bot.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{bot.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${isSelected ? 'bg-jungle-green-500 text-[#0b0f1a]' : 'bg-[var(--surface-highlight)] text-[var(--text-secondary)]'}`}>
                        {bot.elo}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 capitalize">{bot.personality} playstyle</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); setViewingBot(bot); }}
                    className="p-1.5 rounded-md hover:bg-[var(--surface-highlight)] text-[var(--text-secondary)] hover:text-white transition-colors"
                    title="View profile"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  </button>
                  {isSelected ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-jungle-green-400"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)]/60 group-hover:text-jungle-green-400 transition-colors"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Settings Section */}
        <div className="p-5 bg-[var(--surface)] border-t border-[var(--border)] space-y-5">
          <h4 className="text-xs font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2">Settings</h4>

          {/* Opening Selection */}
          <div className="space-y-2.5 relative">
            <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex justify-between">
              <span>Specific Opening</span>
              <span className="text-[10px] text-[var(--text-tertiary)] font-bold lowercase">Optional</span>
            </label>
            <div className="relative">
              <button 
                onClick={() => setIsOpeningListOpen(!isOpeningListOpen)}
                className={`w-full h-12 px-4 rounded-xl border text-sm font-bold flex items-center justify-between transition-all ${selectedOpening || isOpeningListOpen ? 'bg-jungle-green-500/10 border-jungle-green-500 text-white shadow-[0_0_15px_rgba(0,255,183,0.12)]' : 'bg-[var(--surface-highlight)] border-[var(--border)] text-[var(--text-secondary)] hover:border-white/20'}`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className={selectedOpening ? "text-jungle-green-400" : "opacity-40"} />
                  <span className="truncate">{selectedOpening ? selectedOpening.name : 'Standard Game'}</span>
                </div>
                <Search size={12} className="opacity-30" />
              </button>

              {/* Dropdown Overlay */}
              {isOpeningListOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl z-[60] p-1 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="p-2 border-b border-[var(--border)] mb-1">
                    <input 
                      type="text"
                      placeholder="Search openings..."
                      autoFocus
                      value={openingSearch}
                      onChange={(e) => setOpeningSearch(e.target.value)}
                      className="w-full bg-[var(--surface-highlight)] border border-[var(--border)] rounded-lg p-2 text-[11px] font-bold text-white placeholder:text-[var(--text-tertiary)] focus:ring-1 focus:ring-jungle-green-400"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    <button 
                      onClick={() => { onOpeningChange?.(null); setIsOpeningListOpen(false); }}
                      className="w-full text-left px-3 py-2 text-[11px] font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-highlight)] rounded-lg border-b border-[var(--border)] mb-1"
                    >
                      Standard Game (None)
                    </button>
                    {filteredOpenings.map((op: OpeningVariation) => (
                      <button 
                        key={op.id} 
                        onClick={() => { onOpeningChange?.(op); setIsOpeningListOpen(false); }}
                        className="w-full text-left px-3 py-2 text-[11px] font-bold text-white hover:bg-[var(--surface-highlight)] rounded-lg flex justify-between group"
                      >
                        <span className="truncate">{op.name}</span>
                        <span className="text-[9px] opacity-0 group-hover:opacity-40 bg-white/10 px-1.5 py-0.5 rounded text-jungle-green-300 font-black">{op.difficulty}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Play As */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Play as</span>
            <div className="flex bg-[var(--surface-highlight)] p-1.5 rounded-xl border border-[var(--border)]">
              {[
                { id: 'w' as const, label: 'White' },
                { id: 'random' as const, label: '?' },
                { id: 'b' as const, label: 'Black' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => onColorChange(opt.id)}
                  className={`w-14 h-10 flex items-center justify-center text-xs font-black rounded-lg transition-all ${
                    selectedColor === opt.id
                      ? 'bg-jungle-green-500 text-[#0b0f1a] shadow-lg shadow-jungle-green-500/20'
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Control */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Time control</span>
            <select
              value={selectedTimeControl.label}
              onChange={e => {
                const tc = TIME_CONTROLS.find(t => t.label === e.target.value);
                if (tc) onTimeControlChange(tc);
              }}
              className="text-xs font-black text-white px-4 py-2.5 bg-[var(--surface-highlight)] rounded-xl border border-[var(--border)] cursor-pointer outline-none hover:bg-[var(--surface)] focus:ring-1 focus:ring-jungle-green-400 transition-colors"
            >
              {TIME_CONTROLS.map(tc => (
                <option key={tc.label} value={tc.label} className="bg-[var(--surface)] text-white">{tc.label.split('•')[0]}</option>
              ))}
            </select>
          </div>

          {/* Start Game Button */}
          <button
            onClick={() => onStartGame(selectedTimeControl, selectedColor, selectedOpening, isPassAndPlay)}
            disabled={!selectedBot && !isPassAndPlay}
            className="w-full py-5 bg-jungle-green-500 hover:bg-jungle-green-400 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed text-[#0b0f1a] rounded-xl font-black text-base uppercase tracking-widest shadow-lg shadow-jungle-green-500/20 transition-all mt-3 flex items-center justify-center gap-3 group"
          >
            <Play size={18} className="fill-current group-hover:scale-110 transition-transform" />
            {isPlaying ? 'Restart Game' : isPassAndPlay ? 'Start Pass & Play' : 'Start Match'}
          </button>
        </div>

        {/* Bot Profile Card Overlay */}
        {viewingBot && (
          <BotProfileDetail
            bot={viewingBot}
            onClose={() => setViewingBot(null)}
            onSelect={(bot) => {
              onSelectBot(bot);
              setViewingBot(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
