'use client';

import { useState } from 'react';
import { Chess } from 'chess.js';
import { getGameHistory, deleteGame, getGameStats, SavedGame } from '@/lib/game-storage';
import { Clock, Trash2, Trophy, X, Download } from 'lucide-react';
import Link from 'next/link';
import { ChessBoard } from './ChessBoard';
import { useBoardColorScheme } from '@/contexts/BoardColorSchemeContext';
import { ImportGamesModal } from './ImportGamesModal';

interface GameHistoryProps {
  onLoadGame?: (pgn: string) => void;
  areAdsAllowed?: boolean;
}

export function GameHistory({ onLoadGame, areAdsAllowed = true }: GameHistoryProps) {
  const [games, setGames] = useState<SavedGame[]>(getGameHistory());
  const [selectedGame, setSelectedGame] = useState<SavedGame | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const stats = getGameStats();
  const { colorScheme } = useBoardColorScheme();

  function handleDelete(id: string) {
    if (confirm('Delete this game?')) {
      deleteGame(id);
      setGames(getGameHistory());
    }
  }

  function handleReplay(game: SavedGame) {
    setSelectedGame(game);
  }

  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Game detail view
  if (selectedGame) {
    const previewGame = new Chess();
    previewGame.loadPgn(selectedGame.pgn);

    return (
      <div className="h-full w-full bg-theme-surface flex flex-col p-6 overflow-hidden">
        <div className="bg-neutral-900 rounded-xl border-2 border-neutral-700 w-full max-w-4xl mx-auto h-full p-6 flex flex-col shadow-2xl">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h3 className="text-xl font-bold text-white">
              vs {selectedGame.opponentName}
            </h3>
            <button onClick={() => setSelectedGame(null)} className="p-2 hover:bg-neutral-800 rounded">
              <span className="text-sm text-zinc-400 font-medium">Back to List</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
            <div className="flex justify-center items-center bg-neutral-800/50 rounded-lg p-4">
              <div className="w-full max-w-[400px] aspect-square">
                <ChessBoard
                  game={previewGame}
                  onMove={() => false}
                  orientation={selectedGame.playerColor === 'w' ? 'white' : 'black'}
                  colorScheme={colorScheme}
                />
              </div>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2">
              <div className="bg-neutral-800 rounded-lg p-4">
                <div className="text-sm text-zinc-400 mb-2">Result</div>
                <div className={`text-lg font-bold ${
                  selectedGame.result.includes('win') ? 'text-green-400' : 
                  selectedGame.result.includes('Draw') ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {selectedGame.result}
                </div>
              </div>

              <div className="bg-neutral-800 rounded-lg p-4">
                <div className="text-sm text-zinc-400 mb-2">Details</div>
                <div className="space-y-1 text-sm text-zinc-300">
                  <div>Date: {formatDate(selectedGame.date)}</div>
                  <div>Moves: {selectedGame.moveCount}</div>
                  {selectedGame.timeControl && <div>Time: {selectedGame.timeControl}</div>}
                  <div>Color: {selectedGame.playerColor === 'w' ? 'White' : 'Black'}</div>
                </div>
              </div>

              <Link 
                href={`/review?id=${selectedGame.id}`}
                className="block w-full text-center px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition"
              >
                Review Game
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game list view
  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-theme-surface">
        <div className="flex-1 flex overflow-hidden">
            {/* Left Ad Sidebar (XL screens) */}
            {areAdsAllowed && (
                <div className="hidden xl:flex w-72 border-r border-neutral-700/50 flex-col gap-6 p-6 overflow-y-auto custom-scrollbar bg-neutral-900/30">
                    <div className="w-full min-h-[250px] flex items-center justify-center bg-neutral-900/50 rounded-xl overflow-hidden">
                        
                    </div>
                    
                    {/* Skyscraper Banner Placeholder */}
                    <div className="flex-1 min-h-[400px] flex flex-col items-center justify-start gap-2 p-4">
                        
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-7xl mx-auto w-full p-6 h-full flex flex-col">
                    <div className="bg-theme-surface rounded-xl border-2 border-theme w-full h-full flex flex-col shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between mb-0 p-6 pb-4 shrink-0 bg-neutral-900/50 border-b border-neutral-800">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Game History</h2>
                            <p className="text-sm text-zinc-400">{games.length} saved games</p>
                        </div>
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="px-4 py-2 bg-[#5ec2f2] hover:bg-[#7fd0f7] text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Download size={16} /> Import from Lichess/Chess.com
                        </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-neutral-800 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-white">{stats.totalGames}</div>
                                <div className="text-xs text-zinc-400">Games</div>
                            </div>
                            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-400">{stats.wins}</div>
                                <div className="text-xs text-green-300">Wins</div>
                            </div>
                            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-red-400">{stats.losses}</div>
                                <div className="text-xs text-red-300">Losses</div>
                            </div>
                            <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-yellow-400">{stats.winRate}%</div>
                                <div className="text-xs text-yellow-300">Win Rate</div>
                            </div>
                            </div>

                            {/* Game List */}
                            <div className="flex-1 space-y-2">
                            {games.length === 0 ? (
                                <div className="text-center py-12 text-zinc-500">
                                No games saved yet. Complete a game to see it here!
                                </div>
                            ) : (
                                games.map((game) => (
                                <div
                                    key={game.id}
                                    className="bg-neutral-800 rounded-lg p-4 hover:bg-neutral-700 transition cursor-pointer group"
                                    onClick={() => handleReplay(game)}
                                >
                                    <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                        <span className="text-white font-bold">vs {game.opponentName}</span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            game.result.includes('win') ? 'bg-green-600 text-white' :
                                            game.result.includes('Draw') ? 'bg-amber-700 text-slate-900' :
                                            'bg-red-600 text-white'
                                        }`}>
                                            {game.result}
                                        </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-zinc-400">
                                        <span>{formatDate(game.date)}</span>
                                        <span>•</span>
                                        <span>{game.moveCount} moves</span>
                                        {game.timeControl && (
                                            <>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} /> {game.timeControl}
                                            </span>
                                            </>
                                        )}
                                        </div>
                                    </div>
                                    <div className="text-theme opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm">
                                        Review Game →
                                    </div>
                                    <button
                                        onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(game.id);
                                        }}
                                        className="ml-4 p-2 text-zinc-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    </div>
                                </div>
                                ))
                            )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Ad Sidebar (XL screens) */}
            {areAdsAllowed && (
                <div className="hidden xl:flex w-72 border-l border-neutral-700/50 flex-col gap-6 p-6 overflow-y-auto custom-scrollbar bg-neutral-900/30">
                    {/* Sidebar Ad 1 */}
                    <div className="w-full min-h-[250px] flex items-center justify-center bg-neutral-900/50 rounded-xl overflow-hidden">
                        
                    </div>

                    {/* Another Ad Placeholder */}
                    <div className="flex flex-col items-center justify-center">
                        
                    </div>
                </div>
            )}
        </div>
      
      {/* Import Modal */}
      <ImportGamesModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)} 
      />
    </div>
  );
}
