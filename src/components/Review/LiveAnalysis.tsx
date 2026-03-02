'use client';

import { useState, useEffect } from 'react';
import { analyzePosition, registerMessageHandler, unregisterMessageHandler } from '@/lib/stockfish-manager';
import { Search, Loader2, Cloud, Settings, CheckCircle } from 'lucide-react';

interface LiveAnalysisProps {
    fen: string;
}

interface AnalysisLine {
    eval: number;
    depth: number;
    pv: string; // Principal variation
    mate?: number;
}

export function LiveAnalysis({ fen }: LiveAnalysisProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lines, setLines] = useState<AnalysisLine[]>([]);
    const [depth, setDepth] = useState(0);

    // Auto-stop analysis when FEN changes
    useEffect(() => {
        stopAnalysis();
    }, [fen]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => stopAnalysis();
    }, []);

    function stopAnalysis() {
        setIsAnalyzing(false);
        unregisterMessageHandler('live-analysis');
    }

    function startAnalysis() {
        setIsAnalyzing(true);
        setLines([]);
        setDepth(0);
        
        const handler = (line: string) => {
            if (line.startsWith('info') && line.includes('score')) {
                const depthMatch = line.match(/depth (\d+)/);
                const pvMatch = line.match(/multipv (\d+)/);
                const scoreMatch = line.match(/score (cp|mate) (-?\d+)/);
                const movesMatch = line.match(/ pv (.+)/);

                if (depthMatch && scoreMatch && movesMatch) {
                    const currentDepth = parseInt(depthMatch[1]);
                    const pvNum = pvMatch ? parseInt(pvMatch[1]) : 1;
                    const scoreType = scoreMatch[1];
                    const scoreValue = parseInt(scoreMatch[2]);
                    const pvMoves = movesMatch[1];

                    setLines(prev => {
                        const newLines = [...prev];
                        if (newLines[pvNum - 1]?.depth > currentDepth) return prev;
                        
                        newLines[pvNum - 1] = {
                            eval: scoreType === 'cp' ? scoreValue / 100 : 0,
                            depth: currentDepth,
                            pv: pvMoves,
                            mate: scoreType === 'mate' ? scoreValue : undefined
                        };
                        return newLines;
                    });
                    
                    setDepth(currentDepth);
                }
            }
            
            if (line.startsWith('bestmove')) {
                setIsAnalyzing(false);
                unregisterMessageHandler('live-analysis');
            }
        };

        registerMessageHandler('live-analysis', handler);
        analyzePosition(fen, { depth: 22, multiPV: 3 });
    }

    // Get the best line for display
    const bestLine = lines[0];
    const evalScore = bestLine?.mate 
        ? (bestLine.mate > 0 ? `+M${bestLine.mate}` : `M${bestLine.mate}`)
        : bestLine?.eval !== undefined 
            ? `${bestLine.eval > 0 ? '+' : ''}${bestLine.eval.toFixed(1)}`
            : '0.0';

    const evalColor = bestLine?.mate 
        ? 'text-[#ffd95a]' 
        : bestLine?.eval && bestLine.eval > 0 
            ? 'text-[#69e0a3]' 
            : bestLine?.eval && bestLine.eval < 0 
                ? 'text-[#ff7b6b]' 
                : 'text-[#a8b4ce]';

    return (
        <div className="flex flex-col h-full overflow-hidden bg-[#0f1729]">
            
            {/* Lichess-style Engine Header */}
            <div className="bg-[#1a2744] border-b border-[#3a4a6e]">
                {/* Top row: Eval + Engine info */}
                <div className="flex items-center gap-3 px-3 py-2">
                    {/* Eval indicator */}
                    <div className={`flex items-center gap-1 ${isAnalyzing ? 'animate-pulse' : ''}`}>
                        <CheckCircle size={16} className="text-[#69e0a3]" />
                        <span className={`text-xl font-bold font-mono ${evalColor}`}>
                            {evalScore}
                        </span>
                    </div>
                    
                    {/* Engine info */}
                    <div className="flex items-center gap-2 text-xs text-[#6b7a99]">
                        <span className="font-mono">SF17.1 - 7MB v2 NNUE</span>
                    </div>
                    
                    {/* Depth badge */}
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs bg-[#5ec2f2] text-[#0f1729] px-2 py-0.5 rounded font-bold">
                            Depth {depth}
                        </span>
                        {isAnalyzing && (
                            <span className="text-xs bg-[#69e0a3] text-[#0f1729] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                <Cloud size={12} />
                                LOCAL
                            </span>
                        )}
                        <button className="p-1 text-[#6b7a99] hover:text-white transition-colors">
                            <Settings size={14} />
                        </button>
                    </div>
                </div>
                
                {/* PV Line */}
                {bestLine && (
                    <div className="px-3 py-2 text-xs font-mono text-[#a8b4ce] border-t border-[#243354] bg-[#0f1729]/50 truncate">
                        {bestLine.pv.split(' ').slice(0, 10).map((move, i) => (
                            <span key={i}>
                                {i % 2 === 0 && <span className="text-[#6b7a99]">{Math.floor(i/2) + 1}. </span>}
                                <span className={i === 0 ? 'text-white font-bold' : ''}>{move} </span>
                            </span>
                        ))}
                        {bestLine.pv.split(' ').length > 10 && <span className="text-[#4a5a7e]">...</span>}
                    </div>
                )}
            </div>

            {/* Analysis lines or Start button */}
            {lines.length === 0 && !isAnalyzing ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 p-4">
                    <p className="text-[#6b7a99] text-sm">Analyze this position with Stockfish 16.</p>
                    <button 
                        onClick={startAnalysis}
                        className="px-6 py-2 bg-[#5ec2f2] hover:bg-[#7fd0f7] text-[#0f1729] rounded-full font-bold text-sm shadow-lg flex items-center gap-2 transition"
                    >
                        <Search size={16} />
                        Analyze
                    </button>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {lines.slice(1).map((line, i) => (
                        <div key={i} className="bg-[#1a2744] rounded px-3 py-2 border border-[#243354] hover:bg-[#243354]/50 transition-colors">
                            <div className="flex justify-between items-center">
                                <span className={`font-mono font-bold text-sm ${
                                    line.mate ? 'text-[#ffd95a]' : 
                                    line.eval > 0 ? 'text-[#69e0a3]' : 
                                    line.eval < 0 ? 'text-[#ff7b6b]' : 'text-[#a8b4ce]'
                                }`}>
                                    {line.mate ? `M${line.mate}` : `${line.eval > 0 ? '+' : ''}${line.eval.toFixed(1)}`}
                                </span>
                                <span className="text-[10px] text-[#6b7a99] font-mono">D{line.depth}</span>
                            </div>
                            <div className="text-xs text-[#a8b4ce] font-mono mt-1 truncate">
                                {line.pv.split(' ').slice(0, 8).join(' ')}
                            </div>
                        </div>
                    ))}
                    {isAnalyzing && (
                        <div className="flex justify-center p-2">
                            <Loader2 className="animate-spin text-[#5ec2f2]" size={20} />
                        </div>
                    )}
                </div>
            )}
            
            {/* Control buttons */}
            {(lines.length > 0 || isAnalyzing) && (
                <div className="p-2 border-t border-[#3a4a6e] bg-[#1a2744]">
                    <button 
                        onClick={isAnalyzing ? stopAnalysis : startAnalysis}
                        className={`w-full py-2 rounded font-bold text-xs uppercase tracking-wide transition ${
                            isAnalyzing 
                                ? 'bg-[#ff7b6b]/20 text-[#ff7b6b] hover:bg-[#ff7b6b]/30 border border-[#ff7b6b]/30' 
                                : 'bg-[#5ec2f2] text-[#0f1729] hover:bg-[#7fd0f7]'
                        }`}
                    >
                        {isAnalyzing ? 'Stop Analysis' : 'Re-Analyze'}
                    </button>
                </div>
            )}
        </div>
    );
}
