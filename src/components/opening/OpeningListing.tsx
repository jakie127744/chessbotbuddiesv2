
import React from 'react';
import { 
  Target, Book, Brain, CheckCircle, ZoomIn
} from 'lucide-react';
import { OpeningListingProps, OpeningMetadata } from './types';
import { getVariationsByOpening, DEFAULT_REPERTOIRE } from '@/lib/openings-repertoire';
import { OPENING_METADATA } from '@/lib/opening-metadata';

export function OpeningListing({
  onSelectOpening,
  onStartCreation,
  onStartReview,
  onSelectShotgun,
  trainingMode,
  totalDue,
  customRepertoire,
  userProfile
}: OpeningListingProps) {

  return (
      <div className="h-full w-full bg-theme-surface flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
            
            {/* Left Ad Sidebar (XL screens) */}
            <div className="hidden xl:flex w-72 border-r border-neutral-700/50 flex-col gap-6 p-6 overflow-y-auto custom-scrollbar bg-neutral-900/30">
                {/* Pro Analysis Removed */}
                
                {/* Skyscraper Banner Placeholder */}
                <div className="flex-1 min-h-[400px] flex flex-col items-center justify-start gap-2 p-4">
                     
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="w-full max-w-7xl mx-auto p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6 shrink-0">
                        <div className="flex items-center gap-4">
                        <Book className="text-blue-400" size={36} />
                        <div>
                            <h2 className="text-3xl font-bold text-white">Opening Trainer</h2>
                            <p className="text-sm text-zinc-400">Build your repertoire with spaced repetition</p>
                        </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <button 
                            onClick={onSelectShotgun}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${trainingMode === 'shotgun' ? 'border-red-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                         >
                            <Target size={16} /> Shotgun Drills
                         </button>
                        </div>
                    </div>

                    {trainingMode === 'standard' && totalDue > 0 && (
                        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/50 rounded-xl p-4 mb-6 flex items-center justify-between shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                <Brain className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white mb-0.5">Daily Review</h3>
                                <p className="text-purple-200 font-medium text-sm">
                                    You have <strong className="text-white bg-purple-600/50 px-1.5 py-0.5 rounded">{totalDue}</strong> moves due for review.
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={onStartReview}
                            className="px-6 py-2 bg-white text-purple-900 font-black rounded-lg hover:bg-purple-100 transition-colors shadow-xl active:scale-95 flex items-center gap-2 relative z-10"
                        >
                            Start Review <CheckCircle size={18} />
                        </button>
                        </div>
                    )}
            
                    
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">My Repertoire</h3>
                        <button 
                            onClick={onStartCreation}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded flex items-center gap-2"
                        >
                            + Create New
                        </button>
                        </div>
                        
                        {customRepertoire.length === 0 ? (
                        <div className="text-zinc-500 text-sm text-center py-8 border-2 border-dashed border-neutral-800 rounded-xl">
                            You haven't created any custom variations yet.
                        </div>
                        ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => onSelectOpening('custom')}
                                className="bg-neutral-800 hover:bg-neutral-700 border-2 border-neutral-600 rounded-xl p-6 transition-all hover:scale-[1.02]"
                            >
                                <div className="text-2xl font-black text-white mb-2">My Openings</div>
                                <div className="text-sm text-zinc-400 mb-3">Custom Repertoire</div>
                                <div className="text-xs text-zinc-500">{customRepertoire.length} variations</div>
                            </button>
                        </div>
                        )}
                    </div>
            
                    <h3 className="text-xl font-bold text-white mb-4">Standard Openings</h3>
                    
                    {trainingMode === 'shotgun' && (
                        <div className="mb-8">
                            <button 
                                onClick={() => onSelectOpening('shotgun-all')} // Special key for random
                                className="w-full py-4 bg-red-900/20 hover:bg-red-900/40 border-2 border-red-500/50 hover:border-red-500 text-red-200 rounded-xl font-bold flex items-center justify-center gap-3 transition-all group"
                            >
                                <Target size={24} className="group-hover:scale-110 transition-transform" />
                                <span>Start Random Shotgun Drills (All Openings)</span>
                            </button>
                        </div>
                    )}
                    
                    <div className="space-y-8">
                        {/* White Repertoire */}
                        <div>
                        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-white"></span>
                            Play as White
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.from(new Set(DEFAULT_REPERTOIRE.filter(v => v.playerColor === 'w').map(v => v.opening))).map(opening => {
                            const metadata = OPENING_METADATA[opening] || { name: opening, icon: <Target className="text-zinc-500" />, description: 'Standard Opening', color: 'w' };
                            const variations = getVariationsByOpening(opening);
                            
                            // Calculate Stats
                            const stats = userProfile?.openingStats?.[opening] || { wins: 0, losses: 0, draws: 0 };
                            const totalGames = stats.wins + stats.losses + stats.draws;
                            const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;
                            
                            return (
                                <button
                                key={opening}
                                onClick={() => onSelectOpening(opening)}
                                className={`bg-neutral-800 hover:bg-neutral-700 border-2 ${trainingMode === 'shotgun' ? 'border-red-900/50 hover:border-red-500' : 'border-neutral-600'} rounded-xl p-6 transition-all hover:scale-[1.02] text-left group relative overflow-hidden`}
                                >
                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <div className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                        {metadata.icon}
                                        <span>{metadata.name}</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="bg-neutral-900 text-zinc-400 text-xs px-2 py-1 rounded font-mono">
                                            {variations.length} vars
                                        </span>
                                        {totalGames > 0 && (
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                winRate >= 50 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                                            }`}>
                                                {winRate}% WR
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm text-zinc-400 mb-1 relative z-10">{metadata.description}</div>
                                
                                {totalGames > 0 && (
                                    <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 relative z-10">
                                        <span className="text-green-500">{stats.wins}W</span>
                                        <span className="text-zinc-500">{stats.draws}D</span>
                                        <span className="text-red-500">{stats.losses}L</span>
                                    </div>
                                )}
                                </button>
                            );
                            })}
                        </div>
                        </div>

                        {/* Black Repertoire */}
                        <div>
                        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-black border border-zinc-600"></span>
                            Play as Black
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.from(new Set(DEFAULT_REPERTOIRE.filter(v => v.playerColor === 'b').map(v => v.opening))).map(opening => {
                            const metadata = OPENING_METADATA[opening] || { name: opening, icon: <Target className="text-zinc-500" />, description: 'Standard Opening', color: 'b' };
                            const variations = getVariationsByOpening(opening);
                            
                            // Calculate Stats
                            const stats = userProfile?.openingStats?.[opening] || { wins: 0, losses: 0, draws: 0 };
                            const totalGames = stats.wins + stats.losses + stats.draws;
                            const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;
                            
                            return (
                                <button
                                key={opening}
                                onClick={() => onSelectOpening(opening)}
                                className={`bg-neutral-800 hover:bg-neutral-700 border-2 ${trainingMode === 'shotgun' ? 'border-red-900/50 hover:border-red-500' : 'border-neutral-600'} rounded-xl p-6 transition-all hover:scale-[1.02] text-left group relative overflow-hidden`}
                                >
                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <div className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                        {metadata.icon}
                                        <span>{metadata.name}</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="bg-neutral-900 text-zinc-400 text-xs px-2 py-1 rounded font-mono">
                                            {variations.length} vars
                                        </span>
                                        {totalGames > 0 && (
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                winRate >= 50 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                                            }`}>
                                                {winRate}% WR
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm text-zinc-400 mb-1 relative z-10">{metadata.description}</div>
                                
                                {totalGames > 0 && (
                                    <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 relative z-10">
                                        <span className="text-green-500">{stats.wins}W</span>
                                        <span className="text-zinc-500">{stats.draws}D</span>
                                        <span className="text-red-500">{stats.losses}L</span>
                                    </div>
                                )}
                                </button>
                            );
                            })}
                        </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Ad Sidebar (XL screens) */}
            <div className="hidden xl:flex w-72 border-l border-neutral-700/50 flex-col gap-6 p-6 overflow-y-auto custom-scrollbar bg-neutral-900/30">
                    {/* Tower Ad */}
                    {/* Sicilian Mastery Ad Removed */}

                    {/* Another Ad Placeholder */}
                    <div className="flex flex-col items-center justify-center">
                        
                    </div>
            </div>
        </div>
      </div>
  );
}
