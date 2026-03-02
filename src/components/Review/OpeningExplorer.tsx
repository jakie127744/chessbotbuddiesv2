import React, { useEffect, useState, useMemo } from 'react';
import { BookOpen, AlertTriangle, Database, Users, User, Settings } from 'lucide-react';
import { getBookMoves, loadOpeningBook, BookMove, getOpeningNames } from '@/lib/opening-book';

interface OpeningExplorerProps {
  fen: string;
  onMoveClick?: (moveSan: string) => void;
  onLoadGame?: (pgn: string, meta: any) => void;
}

// Simulated statistics based on depth - in a real app this would come from a database
function generateStats(depth: number, maxDepth: number) {
  // Simulate game count based on frequency (depth)
  const games = Math.round(Math.pow(maxDepth - depth + 1, 2) * 100 + Math.random() * 50);
  
  // Simulate white/draw/black percentages with some variance
  // Higher frequency moves tend to be more balanced
  const baseWhite = 35 + Math.random() * 15;
  const baseDraw = 25 + Math.random() * 20;
  const baseBlack = 100 - baseWhite - baseDraw;
  
  return {
    games,
    white: Math.round(baseWhite),
    draw: Math.round(baseDraw),
    black: Math.round(baseBlack),
    percentage: Math.round((depth / maxDepth) * 100)
  };
}

function formatGames(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${Math.round(count / 1000)}K`;
  return count.toString();
}

export function OpeningExplorer({ fen, onMoveClick, onLoadGame }: OpeningExplorerProps) {
  const [moves, setMoves] = useState<BookMove[]>([]);
  const [openingName, setOpeningName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'masters' | 'lichess' | 'player'>('masters');

  useEffect(() => {
    loadOpeningBook();
  }, []);

  useEffect(() => {
    setIsLoading(true);

    const bookMoves = getBookMoves(fen);
    const names = getOpeningNames(fen);
    setOpeningName(names.length > 0 ? names[0] : '');

    // Sort by depth (higher depth = more priority)
    const sortedMoves = [...bookMoves].sort((a, b) => b.depth - a.depth);
    setMoves(sortedMoves);
    setIsLoading(false);
  }, [fen]);

  const handleMoveClick = (moveSan: string) => {
    if (onMoveClick) onMoveClick(moveSan);
  };

  const maxDepth = Math.max(...moves.map(m => m.depth), 1);
  const totalGames = moves.reduce((sum, m) => sum + generateStats(m.depth, maxDepth).games, 0);

  return (
    <div className="flex flex-col h-full bg-[#0f1729] overflow-hidden">
      
      {/* Database Tabs - Lichess style */}
      <div className="flex items-center border-b border-[#3a4a6e] bg-[#1a2744]">
        <button 
          onClick={() => setActiveTab('masters')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'masters' 
              ? 'text-white bg-[#243354] border-b-2 border-[#5ec2f2]' 
              : 'text-[#a8b4ce] hover:text-white hover:bg-[#243354]/50'
          }`}
        >
          <Database size={14} />
          <span className="font-bold">Masters</span>
          <span className="text-xs text-[#6b7a99]">database</span>
        </button>
        <button 
          onClick={() => setActiveTab('lichess')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'lichess' 
              ? 'text-white bg-[#243354] border-b-2 border-[#5ec2f2]' 
              : 'text-[#a8b4ce] hover:text-white hover:bg-[#243354]/50'
          }`}
        >
          Lichess
        </button>
        <button 
          onClick={() => setActiveTab('player')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'player' 
              ? 'text-white bg-[#243354] border-b-2 border-[#5ec2f2]' 
              : 'text-[#a8b4ce] hover:text-white hover:bg-[#243354]/50'
          }`}
        >
          Player
        </button>
        <div className="ml-auto pr-2">
          <button className="p-2 text-[#6b7a99] hover:text-white transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[auto_1fr_2fr] gap-2 px-3 py-2 text-xs font-bold text-[#6b7a99] uppercase tracking-wider bg-[#1a2744] border-b border-[#3a4a6e]">
        <div>Move</div>
        <div>Games</div>
        <div className="flex justify-between">
          <span>White</span>
          <span>/</span>
          <span>Draw</span>
          <span>/</span>
          <span>Black</span>
        </div>
      </div>

      {/* Moves List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8 text-[#6b7a99]">Loading moves...</div>
        ) : moves.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-[#6b7a99] gap-2">
            <AlertTriangle size={24} className="opacity-50" />
            <p className="text-sm">No book moves found</p>
            <p className="text-xs text-[#4a5a7e]">Out of book</p>
          </div>
        ) : (
          <div className="divide-y divide-[#243354]/50">
            {moves.map((moveData) => {
              const stats = generateStats(moveData.depth, maxDepth);
              const movePercentage = Math.round((stats.games / totalGames) * 100);
              
              return (
                <button
                  key={moveData.move}
                  onClick={() => handleMoveClick(moveData.move)}
                  className="w-full grid grid-cols-[auto_1fr_2fr] gap-2 items-center px-3 py-2 hover:bg-[#243354]/50 transition-colors group text-sm"
                >
                  {/* Move */}
                  <div className="font-bold text-white font-mono group-hover:text-[#5ec2f2] min-w-[40px]">
                    {moveData.move}
                  </div>
                  
                  {/* Games */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#a8b4ce] font-mono">{movePercentage}%</span>
                    <span className="text-[#6b7a99] font-mono">{formatGames(stats.games)}</span>
                  </div>
                  
                  {/* Win/Draw/Loss Bar */}
                  <div className="flex items-center gap-1">
                    {/* Stacked percentage bar */}
                    <div className="flex-1 h-5 flex rounded-sm overflow-hidden">
                      {/* White wins */}
                      <div 
                        className="bg-white flex items-center justify-center text-[10px] font-bold text-[#1a2744]"
                        style={{ width: `${stats.white}%` }}
                      >
                        {stats.white > 15 && `${stats.white}%`}
                      </div>
                      {/* Draws */}
                      <div 
                        className="bg-[#6b7a99] flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ width: `${stats.draw}%` }}
                      >
                        {stats.draw > 15 && `${stats.draw}%`}
                      </div>
                      {/* Black wins */}
                      <div 
                        className="bg-[#1a2744] border border-[#3a4a6e] flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ width: `${stats.black}%` }}
                      >
                        {stats.black > 15 && `${stats.black}%`}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            
            {/* Total Row */}
            <div className="grid grid-cols-[auto_1fr_2fr] gap-2 items-center px-3 py-2 bg-[#243354]/30 border-t border-[#5ec2f2]/30">
              <div className="font-bold text-[#5ec2f2] min-w-[40px]">Σ</div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#5ec2f2] font-mono font-bold">100%</span>
                <span className="text-[#a8b4ce] font-mono">{formatGames(totalGames)}</span>
              </div>
              <div className="flex-1 h-5 flex rounded-sm overflow-hidden">
                <div className="bg-white flex items-center justify-center text-[10px] font-bold text-[#1a2744]" style={{ width: '33%' }}>33%</div>
                <div className="bg-[#6b7a99] flex items-center justify-center text-[10px] font-bold text-white" style={{ width: '44%' }}>44%</div>
                <div className="bg-[#1a2744] border border-[#3a4a6e] flex items-center justify-center text-[10px] font-bold text-white" style={{ width: '23%' }}>23%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Opening Name Footer */}
      {openingName && (
        <div className="px-3 py-2 border-t border-[#3a4a6e] bg-[#243354]/50">
          <span className="text-[#5ec2f2] font-semibold text-sm">
            {openingName}
          </span>
        </div>
      )}
    </div>
  );
}
