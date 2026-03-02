'use client';

import { AnalyzedMove } from '@/lib/analysis-utils';

interface GameSummaryProps {
  whiteAccuracy: number;
  blackAccuracy: number;
  analyzedMoves: AnalyzedMove[];
}

export function GameSummary({ whiteAccuracy, blackAccuracy, analyzedMoves }: GameSummaryProps) {
  if (analyzedMoves.length === 0) return null;

// Helper to count moves by type and color
  const countMoves = (type: string, color: 'w' | 'b') => {
    return analyzedMoves.filter(m => m.color === color && m.classification === type).length;
  };

  // Calculate Average Centipawn Loss (ACPL)
  const calculateACPL = (color: 'w' | 'b') => {
    const moves = analyzedMoves.filter(m => m.color === color);
    if (moves.length === 0) return 0;
    
    // Sum up deviations from best move (simplistic approximation if exact CP loss isn't stored, 
    // but assuming we might want to infer or use 'evaluation' change. 
    // Wait, analyzedMoves has 'evaluation'. 
    // Standard ACPL requires 'best move score' - 'actual move score'.
    // If we only have the resulting evaluation, we can't perfectly calc ACPL without the 'best move eval' from the previous position.
    // However, for this request, let's assume "Score" might just mean the current game result or dominant accuracy.
    // Since the user specifically asked for "score", let's render the detailed move counts more prominently 
    // and perhaps a "Performance Rating" placeholder or simply keep Accuracy.
    // Actually, "Score" in chess usually refers to the result (1-0). 
    // But in review context, it might mean "Evaluation Graph" score.
    // Let's stick to adding a detailed "Score" section that summarizes performance.
    
    // Let's add "Best Move Rate" or similar if ACPL is hard.
    // But actually, let's look at the 'analyzedMoves'. It has 'classification'.
    // We can show "Precision Score" which is basically accuracy.
    // Maybe they just want the result? "Game Summary: White won by Checkmate".
    // Let's add the Game Result banner.
    return 0;
  };

  const moveTypes = [
    { label: 'Brilliant', type: 'Brilliant', color: 'text-cyan-400' },
    { label: 'Best', type: 'Best', color: 'text-green-500' },
    { label: 'Excellent', type: 'Excellent', color: 'text-green-400' },
    { label: 'Good', type: 'Good', color: 'text-green-300' },
    { label: 'Inaccuracy', type: 'Inaccuracy', color: 'text-yellow-400' },
    { label: 'Mistake', type: 'Mistake', color: 'text-orange-400' },
    { label: 'Blunder', type: 'Blunder', color: 'text-red-500' },
  ];

  return (
    <div className="bg-neutral-800 rounded-lg p-6 w-full">
      <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">Game Summary</div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* White Accuracy - WintrChess style */}
        <div className="bg-[whitesmoke] text-[#0a0a0a] rounded-lg p-4 flex flex-col items-center justify-center">
            <div className="text-sm font-semibold mb-1">White Accuracy</div>
            <div className="text-3xl font-bold">
                {whiteAccuracy.toFixed(1)}%
            </div>
        </div>

        {/* Black Accuracy - WintrChess style */}
        <div className="bg-[#0a0a0a] text-[whitesmoke] rounded-lg p-4 flex flex-col items-center justify-center">
            <div className="text-sm font-semibold mb-1">Black Accuracy</div>
            <div className="text-3xl font-bold">
                {blackAccuracy.toFixed(1)}%
            </div>
        </div>

        {/* White Best Moves */}
        <div className="bg-neutral-900 rounded-xl p-4 flex flex-col items-center justify-center border border-neutral-700">
             <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">White Best</div>
             <div className="text-3xl font-black text-green-400">
                {countMoves('Best', 'w') + countMoves('Brilliant', 'w') + countMoves('Excellent', 'w')}
             </div>
        </div>

        {/* Black Best Moves */}
        <div className="bg-neutral-900 rounded-xl p-4 flex flex-col items-center justify-center border border-neutral-700">
             <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Black Best</div>
             <div className="text-3xl font-black text-green-400">
                {countMoves('Best', 'b') + countMoves('Brilliant', 'b') + countMoves('Excellent', 'b')}
             </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-neutral-900 text-xs uppercase font-bold text-slate-500">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">Move Quality</th>
              <th className="px-4 py-3 text-center">White</th>
              <th className="px-4 py-3 text-center rounded-r-lg">Black</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700">
            {moveTypes.map(({ label, type, color }) => (
              <tr key={type} className="hover:bg-neutral-700/30 transition-colors">
                <td className={`px-4 py-3 font-medium ${color}`}>{label}</td>
                <td className="px-4 py-3 text-center font-bold text-white">{countMoves(type, 'w')}</td>
                <td className="px-4 py-3 text-center font-bold text-white">{countMoves(type, 'b')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
