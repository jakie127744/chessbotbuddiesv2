'use client';

import React, { useState, useEffect } from 'react';
import { History, Trophy, Clock, Trash2, ChevronRight, Download, Search, Import, Loader2 } from 'lucide-react';
import { getGameHistory, getGameStats, SavedGame, deleteGame, syncFromSupabase } from '@/lib/game-storage';
import { formatTime } from '@/lib/utils';
import { ImportGamesModal } from './ImportGamesModal';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

export function GameHistory() {
  const router = useRouter();
  const [games, setGames] = useState<SavedGame[]>([]);
  const [stats, setStats] = useState(() => getGameStats());
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show local games instantly, then sync from Supabase in background
    setGames(getGameHistory());
    setIsLoading(true);
    syncFromSupabase()
      .then(merged => {
        setGames(merged);
        setStats(getGameStats());
      })
      .catch(() => {
        // Supabase unavailable — keep local games
        setGames(getGameHistory());
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Permanently delete this game from your history?')) {
      deleteGame(id);
      setGames(getGameHistory());
      setStats(getGameStats());
    }
  };

  const handleReview = (id: string) => {
    router.push(`/review?id=${id}`);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header & Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="md:col-span-2 bg-redesign-glass-bg border border-redesign-glass-border rounded-3xl p-6 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-redesign-cyan/10 flex items-center justify-center border border-redesign-cyan/20">
               <History size={32} className="text-redesign-cyan" />
            </div>
            <div>
               <h2 className="text-2xl font-black text-white leading-tight">Match History</h2>
               <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{games.length} total games played</p>
            </div>
         </div>
         
         <div className="bg-redesign-glass-bg border border-redesign-glass-border rounded-3xl p-6 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Win Rate</p>
            <p className="text-2xl font-black text-emerald-400">{stats.winRate}%</p>
         </div>

         <div className="bg-redesign-glass-bg border border-redesign-glass-border rounded-3xl p-6 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Total Wins</p>
            <p className="text-2xl font-black text-white">{stats.wins}</p>
         </div>
      </div>

      {/* Game List Area */}
      <div className="flex-1 bg-redesign-glass-bg border border-redesign-glass-border rounded-3xl flex flex-col overflow-hidden">
         <div className="px-8 py-6 border-b border-redesign-glass-border flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button className="text-xs font-bold text-white border-b-2 border-redesign-cyan pb-1">Recent Matches</button>
            </div>
            <button 
               onClick={() => setIsImportModalOpen(true)}
               className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
            >
               <Import size={14} /> Import Games
            </button>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
            {games.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-zinc-600 py-20">
                  <History size={48} className="mb-4 opacity-10" />
                  <p className="text-sm font-bold uppercase tracking-widest">No games recorded yet</p>
                  <p className="text-xs">Your matches will appear here once completed.</p>
               </div>
            ) : (
               games.map((game) => (
                  <div 
                    key={game.id}
                    className="group flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-redesign-cyan/30 hover:bg-redesign-cyan/[0.02] transition-all cursor-pointer"
                  >
                     {/* Result Status */}
                     <div className="shrink-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                           game.result.toLowerCase().includes('win') ? 'bg-emerald-500/10 text-emerald-500' : 
                           game.result.toLowerCase().includes('draw') ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                           {game.result.charAt(0).toUpperCase()}
                        </div>
                     </div>

                     {/* Match Details */}
                     <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-black text-white">vs {game.opponentName}</span>
                              {game.platform && game.platform !== 'local' && (
                                 <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1 ${
                                   game.platform === 'lichess' ? 'bg-[var(--color-info)]/20 text-[var(--color-info)]' : 'bg-[var(--color-success)]/20 text-[var(--color-success)]'
                                 }`}>
                                    {game.platform === 'lichess' ? '♞ Lichess' : '♟ Chess.com'}
                                 </span>
                              )}
                              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded">
                                {game.timeControl || 'Match'}
                              </span>
                           </div>
                           <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
                              <span className="flex items-center gap-1.5"><Clock size={12} /> {formatDate(game.date)}</span>
                              <span>•</span>
                              <span>{game.moveCount} Moves</span>
                           </div>
                        </div>

                        <div className="flex items-center gap-6">
                           <div className="flex items-center gap-2">
                              <button 
                                className="p-2.5 text-zinc-600 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                onClick={(e) => handleDelete(game.id, e)}
                              >
                                 <Trash2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleReview(game.id)}
                                className="px-5 py-2.5 bg-redesign-cyan/10 text-redesign-cyan border border-redesign-cyan/20 rounded-xl text-xs font-bold hover:bg-redesign-cyan/20 transition-all flex items-center gap-2"
                              >
                                 Review <ChevronRight size={14} />
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
      <ImportGamesModal 
         isOpen={isImportModalOpen} 
         onClose={() => setIsImportModalOpen(false)} 
      />
    </div>
  );
}
