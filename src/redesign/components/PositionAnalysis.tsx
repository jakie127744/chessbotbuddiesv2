'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Microscope, History, Settings, Copy, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Zap } from 'lucide-react';
import { ChessBoard } from '@/components/ChessBoard';
import { EvaluationBar } from './EvaluationBar';
import { useLiveAnalysis } from '@/hooks/useLiveAnalysis';
import { DEFAULT_CONFIG, EngineSettings, type EngineConfig } from '@/components/Review/EngineSettings';
import { fetchRecentAnalyses, recordAnalysisSession, type StoredAnalysis } from '@/redesign/lib/analysisStorage';
import type { BoardArrow } from '@/components/ChessBoard';

function toSanLine(fen: string, uciMoves: string[], limit = 16): string[] {
   try {
      const chess = new Chess(fen);
      const san: string[] = [];
      for (const move of uciMoves.slice(0, limit)) {
         const from = move.slice(0, 2);
         const to = move.slice(2, 4);
         const promotion = move.length > 4 ? move[4] : undefined;
         const made = chess.move({ from, to, promotion });
         if (!made) break;
         san.push(made.san);
      }
      return san;
   } catch {
      return uciMoves.slice(0, limit);
   }
}

function pvToArrows(fen: string, uciMoves: string[], limit = 3): BoardArrow[] {
   try {
      const chess = new Chess(fen);
      const arrows: BoardArrow[] = [];
      const limited = uciMoves.slice(0, limit);
      limited.forEach((move, idx) => {
         const from = move.slice(0, 2);
         const to = move.slice(2, 4);
         const promotion = move.length > 4 ? move[4] : undefined;
         const made = chess.move({ from, to, promotion });
         if (made) {
            arrows.push({ from, to, color: '#22c55e', opacity: 0.65 - idx * 0.1 });
         }
      });
      return arrows;
   } catch {
      return [];
   }
}

export function PositionAnalysis() {
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [game, setGame] = useState(() => new Chess());
  const [isEngineEnabled, setIsEngineEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'moves' | 'engine'>('moves');
   const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
   const [showPvArrows, setShowPvArrows] = useState(false);
   const [engineConfig, setEngineConfig] = useState<EngineConfig>(DEFAULT_CONFIG);
   const [history, setHistory] = useState<StoredAnalysis[]>([]);
   const lastSavedFenRef = useRef<string | null>(null);

   // Hydrate engine config from local storage
   useEffect(() => {
      if (typeof window === 'undefined') return;
      try {
         const raw = localStorage.getItem('analysis_engine_config_v1');
         if (raw) {
            const parsed = JSON.parse(raw);
            setEngineConfig({ ...DEFAULT_CONFIG, ...parsed });
         }
      } catch (e) {
         console.warn('[Analysis] Failed to load engine config, using defaults', e);
      }
   }, []);

   // Persist engine config
   useEffect(() => {
      if (typeof window === 'undefined') return;
      try {
         localStorage.setItem('analysis_engine_config_v1', JSON.stringify(engineConfig));
      } catch (e) {
         console.warn('[Analysis] Failed to save engine config', e);
      }
   }, [engineConfig]);

   const { lines: engineLines, currentDepth, isAnalyzing } = useLiveAnalysis({
      fen,
      config: engineConfig,
      enabled: isEngineEnabled
   });

   const pvArrows = useMemo<BoardArrow[]>(() => {
      if (!showPvArrows || engineLines.length === 0) return [];
      return pvToArrows(fen, engineLines[0].moves, Math.max(1, Math.min(engineConfig.multiPV, 4)));
   }, [showPvArrows, engineLines, fen, engineConfig.multiPV]);

  const handleMove = (move: { from: string; to: string; promotion?: string }) => {
    try {
      const g = new Chess(game.fen());
      const result = g.move(move);
      if (result) {
        setGame(g);
        setFen(g.fen());
            setLastMove({ from: move.from, to: move.to });
        return true;
      }
    } catch (e) {}
    return false;
  };

  const currentEval = useMemo(() => {
    if (engineLines.length > 0) {
      const best = engineLines[0];
      return { evaluation: best.score / 100, isMate: best.isMate };
    }
    return { evaluation: 0, isMate: false };
  }, [engineLines]);

   // Load recent history on mount
   useEffect(() => {
      fetchRecentAnalyses().then(setHistory);
   }, []);

   // Persist completed analysis (fen+lines) once per unique fen session
   useEffect(() => {
      const hasLines = engineLines.length > 0;
      const readyToSave = hasLines && !isAnalyzing;
      if (!readyToSave) return;

      // Avoid duplicate saves for the same FEN snapshot
      if (lastSavedFenRef.current === fen) return;
      lastSavedFenRef.current = fen;

      recordAnalysisSession({ fen, depth: currentDepth, lines: engineLines })
         .then((entry) => {
            setHistory((prev) => [entry, ...prev].slice(0, 10));
         })
         .catch((err) => console.warn('[Analysis] Failed to record session', err));
   }, [engineLines, isAnalyzing, fen, currentDepth]);

   return (
         <div className="h-full flex flex-col lg:flex-row gap-4 animate-in fade-in duration-500">
         {/* LEFT: Analysis Board */}
         <div className="flex-1 flex flex-col min-h-[70vh] lg:min-h-0">
          <div className="flex-1 flex flex-col items-center justify-start p-2">
            <div className="w-full flex justify-center">
                <div className="relative w-full max-w-[min(100vw,700px)] max-h-[58vh] aspect-square">
                  {/* Evaluation Bar overlayed to minimize board separation */}
                  <div className="absolute top-1 bottom-1 -left-1.5 lg:-left-2.5 w-[8px] lg:w-[11px] rounded-md overflow-hidden shrink-0 bg-redesign-glass-bg border border-redesign-glass-border z-10">
                    <EvaluationBar 
                        evaluation={currentEval.evaluation}
                        isMate={currentEval.isMate}
                        orientation="white"
                    />
                  </div>
                  
                  {/* Board Container */}
                  <div className="absolute inset-0 shadow-2xl rounded-2xl overflow-hidden bg-zinc-900 border border-redesign-glass-border">
                    <ChessBoard 
                        game={game}
                        onMove={handleMove}
                        orientation="white"
                        lastMove={lastMove}
                        arrows={pvArrows}
                    />
                  </div>
                </div>
            </div>

            {/* Console-style Navigation - Moved inside the board wrapper for proximity */}
            <div className="w-full max-w-[min(100vw,700px)] mt-4 px-6 py-3 bg-redesign-glass-bg border border-redesign-glass-border rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-1">
                <button 
                    onClick={() => {
                        const g = new Chess();
                        setGame(g);
                        setFen(g.fen());
                    }}
                    className="p-2 text-zinc-500 hover:text-white transition-colors" title="Reset">
                    <RefreshCw size={18} />
                </button>
                </div>
                
                <div className="flex items-center gap-2">
                <button className="p-2 text-zinc-500 hover:text-white"><ChevronsLeft size={20} /></button>
                <button className="p-2 text-zinc-500 hover:text-white"><ChevronLeft size={20} /></button>
                <div className="w-px h-4 bg-white/10 mx-2" />
                <button className="p-2 text-zinc-500 hover:text-white"><ChevronRight size={20} /></button>
                <button className="p-2 text-zinc-500 hover:text-white"><ChevronsRight size={20} /></button>
                </div>

                <div className="flex items-center gap-2">
                <button 
                    onClick={() => setIsEngineEnabled(!isEngineEnabled)}
                    className={`p-2 transition-colors ${isEngineEnabled ? 'text-redesign-cyan' : 'text-zinc-500'}`}
                >
                    <Zap size={18} fill={isEngineEnabled ? 'currentColor' : 'none'} />
                </button>
                </div>
            </div>
          </div>
         </div>
         {/* Native Ad: Monetization Dead Zone (Post-game/Review) */}
         <div style={{ margin: '16px 0', textAlign: 'center' }}>
            <ins
               className="adsbygoogle"
               style={{ display: 'block', textAlign: 'center' }}
               data-ad-client="ca-pub-9907028021598445"
               data-ad-slot="8128575211"
               data-ad-format="auto"
               data-full-width-responsive="true"
            ></ins>
         </div>
         <script dangerouslySetInnerHTML={{
            __html: '(adsbygoogle = window.adsbygoogle || []).push({});'
         }} />

      {/* RIGHT: Analysis Panels */}
      <div className="w-full lg:w-[360px] flex flex-col gap-3 self-start max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
         {/* Top Info Card */}
         <div className="bg-redesign-glass-bg border border-redesign-glass-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
               <div className="p-2 bg-redesign-cyan/10 rounded-xl">
                  <Microscope size={20} className="text-redesign-cyan" />
               </div>
               <div>
                  <h3 className="text-base font-black text-white">Positional Analysis</h3>
                    <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">Stockfish 17.1 · Depth {currentDepth}</p>
               </div>
               <div className="ml-auto flex items-center gap-2">
                 <button
                   onClick={() => setShowPvArrows((v) => !v)}
                   className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${showPvArrows ? 'bg-redesign-cyan/20 border-redesign-cyan/40 text-white' : 'border-white/10 text-zinc-300 hover:text-white'}`}
                 >
                   {showPvArrows ? 'Hide PV arrows' : 'Show PV arrows'}
                 </button>
               </div>
            </div>

                    <div className="mt-3">
                       <EngineSettings
                          config={engineConfig}
                          onConfigChange={setEngineConfig}
                          isAnalyzing={isAnalyzing}
                       />
                    </div>
            
            <div className="relative mt-2">
               <input 
                  type="text" 
                  value={fen}
                  readOnly
                  className="w-full bg-black/40 border border-redesign-glass-border rounded-xl px-4 py-2.5 text-xs font-mono text-zinc-300 pr-10"
               />
               <button className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">
                  <Copy size={14} />
               </button>
            </div>
         </div>

         {/* Multi-Tab Terminal */}
         <div className="flex-1 bg-redesign-glass-bg border border-redesign-glass-border rounded-2xl p-1 flex flex-col overflow-hidden min-h-[320px]">
            <div className="flex p-1 gap-1.5">
               <button 
                 onClick={() => setActiveTab('engine')}
                 className={`flex-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'engine' ? 'bg-white/10 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                  <Microscope size={14} /> Engine Lines
               </button>
               <button 
                 onClick={() => setActiveTab('moves')}
                 className={`flex-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'moves' ? 'bg-white/10 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                  <History size={14} /> Move Tree
               </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-sm">
               {activeTab === 'engine' ? (
                  <div className="space-y-4">
                     {engineLines.map((line, idx) => (
                        <div key={idx} className="bg-black/20 rounded-2xl p-4 border border-white/5 hover:border-redesign-cyan/20 transition-all group">
                           <div className="flex items-center justify-between mb-2">
                              <span className={`text-base font-black ${line.score >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                 {line.isMate ? `M${line.mateIn}` : (line.score / 100).toFixed(2)}
                              </span>
                              <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest group-hover:text-zinc-300 transition-colors">Line #{idx + 1}</span>
                           </div>
                              <p className="text-sm leading-relaxed text-zinc-100 break-words">
                                 {toSanLine(fen, line.moves, 14).join(' ')}{line.moves.length > 14 ? ' ...' : ''}
                              </p>
                        </div>
                     ))}
                     {engineLines.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-3 py-10 text-sm">
                           <div className="w-2 h-2 rounded-full bg-redesign-cyan animate-ping" />
                           <p className="font-bold uppercase tracking-widest">Waiting for engine...</p>
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="text-zinc-500 text-center py-10 italic text-sm">
                     Variation tree visualization coming soon
                  </div>
               )}
            </div>
         </div>

             {/* Recent Analyses */}
            <div className="bg-redesign-glass-bg border border-redesign-glass-border rounded-2xl p-3">
                 <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2">
                        <History size={16} className="text-redesign-cyan" />
                        <p className="text-sm font-bold text-white">Recent analyses</p>
                     </div>
                     <button
                        className="text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors"
                        onClick={() => fetchRecentAnalyses().then(setHistory)}
                     >
                        Refresh
                     </button>
                  </div>
                  {history.length === 0 ? (
                     <p className="text-[12px] text-zinc-500">Run an analysis to save it here.</p>
                  ) : (
                     <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                        {history.map((item) => (
                           <div key={item.id} className="p-3 bg-black/30 rounded-xl border border-white/5">
                              <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                                 <span>Depth {item.depth}</span>
                                 <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-[11px] text-white break-words">{item.fen}</p>
                           </div>
                        ))}
                     </div>
                  )}
             </div>
      </div>
    </div>
  );
}
