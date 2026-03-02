'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from './ChessBoard';
import { EvaluationBar } from './EvaluationBar';
import { useBoardColorScheme } from '@/contexts/BoardColorSchemeContext';
// import { analyzePosition, registerMessageHandler, unregisterMessageHandler } from '@/lib/stockfish-manager'; // Replaced by useLiveAnalysis
import { useLiveAnalysis } from '@/hooks/useLiveAnalysis';
import { EngineSettings, EngineConfig, DEFAULT_CONFIG, ENGINE_LINE_COLORS } from '@/components/Review/EngineSettings';
import { queryTablebase, isTablebasePosition, getTablebaseDisplayText, tablebaseToEval, TablebaseResult } from '@/lib/tablebase';
import { 
    GameTree, MoveNode, 
    createGameTree, addMove, goToNode, goToPrevNode, goToNextNode, goToStartNode, goToEndNode,
    getCurrentFen, treeToPgn, flattenTree, FlattenedNode, deleteCurrentMove, setAnnotation
} from '@/lib/moveTree';
import { 
  Search, 
  X, 
  Copy, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  RefreshCw,
  Terminal,
  History,
  Info,
  Microscope,
  BookOpen,
  Settings,
  Zap,
  FileText,
  Edit3,
  Undo2,
  Trash2
} from 'lucide-react';
import { loadOpeningLookup, getOpeningName } from '@/lib/opening-lookup';
import { BoardArrow } from './ChessBoard';

interface AnalysisLine {
  eval: number;
  depth: number;
  pv: string; // Principal variation
  mate?: number;
}

export function PositionAnalysis({ areAdsAllowed = true }: { areAdsAllowed?: boolean }) {
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [pgn, setPgn] = useState('');
  const [game, setGame] = useState<Chess>(new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);


  const { colorScheme } = useBoardColorScheme();

  // New State for Refactor
  const [engineConfig, setEngineConfig] = useState<EngineConfig>(DEFAULT_CONFIG);
  const [isCloudAnalysisEnabled, setIsCloudAnalysisEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // PGN Annotation Panel State (Legacy - kept for backward compatibility)
  const [activeTab, setActiveTab] = useState<'analysis' | 'annotate'>('analysis');
  const [annotations, setAnnotations] = useState<Map<number, string>>(new Map());
  const [selectedAnnotationIndex, setSelectedAnnotationIndex] = useState<number | null>(null);
  
  // Variation Tree State (NEW - for branching support)
  const [gameTree, setGameTree] = useState<GameTree>(createGameTree());
  const [selectedNode, setSelectedNode] = useState<MoveNode | null>(null);
  
  // Derived: flattened tree for rendering
  const flattenedMoves = useMemo(() => flattenTree(gameTree), [gameTree]);
  const treePgn = useMemo(() => treeToPgn(gameTree), [gameTree]);

  // Load saved config
  useEffect(() => {
    const saved = localStorage.getItem('chess_engine_config');
    if (saved) {
        try {
            const savedConfig = JSON.parse(saved);
            setEngineConfig(prev => ({ 
                ...prev, 
                ...savedConfig,
                showArrows: savedConfig.showArrows ?? true 
            }));
        } catch (e) {}
    }
  }, []);

  // Save config on change
  useEffect(() => {
    if (showSettings) { // Only save when settings are open/changed to avoid initial overwrite
        localStorage.setItem('chess_engine_config', JSON.stringify(engineConfig));
    }
  }, [engineConfig, showSettings]);

  // Load opening book
  useEffect(() => {
     loadOpeningLookup();
  }, []);

  const openingName = useMemo(() => getOpeningName(fen), [fen]);

  // Initialize game from PGN or FEN
  useEffect(() => {
    try {
      const newGame = new Chess();
      if (pgn) {
        newGame.loadPgn(pgn);
        setGame(newGame);
        setFen(newGame.fen());
        setCurrentMoveIndex(newGame.history().length - 1);
      } else if (fen) {
        newGame.load(fen);
        setGame(newGame);
        setCurrentMoveIndex(-1);
      }
    } catch (e) {
      console.error('Invalid position format', e);
    }
  }, []);

  const handleFenChange = (newFen: string) => {
    try {
      const newGame = new Chess(newFen);
      setGame(newGame);
      setFen(newFen);
      setPgn('');
      setCurrentMoveIndex(-1);
      setAnnotations(new Map()); // Clear annotations for new position
      setSelectedAnnotationIndex(null);
    } catch (e) {
      // Invalid FEN
    }
  };

  const handlePgnChange = (newPgn: string) => {
    try {
      const newGame = new Chess();
      newGame.loadPgn(newPgn);
      setGame(newGame);
      setPgn(newPgn);
      setFen(newGame.fen());
      setCurrentMoveIndex(newGame.history().length - 1);
      setAnnotations(new Map()); // Clear annotations for new game
      setSelectedAnnotationIndex(null);
    } catch (e) {
      // Invalid PGN
    }
  };

  // Navigation Logic
  const goToMove = useCallback((index: number) => {
    const history = game.history();
    const safeIndex = Math.max(-1, Math.min(index, history.length - 1));
    
    // Reconstruct game up to index
    const tempGame = new Chess();
    if (pgn) {
      tempGame.loadPgn(pgn);
    } else {
      // Load initial FEN or starting position
      tempGame.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    }

    const currentHistory = tempGame.history();
    const targetGame = new Chess();
    // If we have a PGN, we might have a starting position other than default
    // For simplicity, we assume PGNs start from default unless we add FEN header support
    // Actually, chess.js loadPgn handles the [FEN ""] tag.
    
    const movesToPlay = currentHistory.slice(0, safeIndex + 1);
    const newGameInstance = new Chess();
    // Re-load the PGN but stop at the move
    if (pgn) {
        newGameInstance.loadPgn(pgn);
        // We need to undo moves until we reach safeIndex
        while (newGameInstance.history().length > safeIndex + 1) {
            newGameInstance.undo();
        }
        setFen(newGameInstance.fen());
        setCurrentMoveIndex(safeIndex);
    }
  }, [game, pgn]);

  const goToStart = () => {
    const newGame = new Chess();
    if (pgn) {
        newGame.loadPgn(pgn);
        while (newGame.history().length > 0) newGame.undo();
    }
    setFen(newGame.fen());
    setCurrentMoveIndex(-1);
  };

  // Reset everything to starting position (clears PGN and annotations)
  const resetToStart = () => {
    setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    setPgn('');
    setGame(new Chess());
    setCurrentMoveIndex(-1);
    setAnnotations(new Map());
    setSelectedAnnotationIndex(null);
    // Reset game tree
    setGameTree(createGameTree());
    setSelectedNode(null);
  };

  const goToPrev = () => {
    if (currentMoveIndex >= 0) {
        const newGame = new Chess();
        if (pgn) {
            newGame.loadPgn(pgn);
            let count = newGame.history().length - currentMoveIndex;
            while(count-- > 0) newGame.undo();
        } else {
            newGame.load(fen);
            newGame.undo();
        }
        setFen(newGame.fen());
        setCurrentMoveIndex(prev => prev - 1);
    }
  };

  const goToNext = () => {
    const history = game.history();
    if (currentMoveIndex < history.length - 1) {
        const nextIndex = currentMoveIndex + 1;
        const newGame = new Chess();
        newGame.loadPgn(pgn);
        while (newGame.history().length > nextIndex + 1) newGame.undo();
        setFen(newGame.fen());
        setCurrentMoveIndex(nextIndex);
    }
  };

  const goToEnd = () => {
    const newGame = new Chess();
    newGame.loadPgn(pgn);
    setFen(newGame.fen());
    setCurrentMoveIndex(newGame.history().length - 1);
  };
    
  // Tablebase integration
  const [tablebaseResult, setTablebaseResult] = useState<TablebaseResult | null>(null);
  const sideToMove = fen.split(' ')[1] as 'w' | 'b';

  // Live Analysis Hook
  const { lines: engineLines, isAnalyzing, currentDepth: depth, analyzedFen } = useLiveAnalysis({
    fen,
    config: engineConfig,
    enabled: isCloudAnalysisEnabled
  });

  // Map engineLines to AnalysisLine format with SAN conversion
  const formattedAnalysis = useMemo(() => {
    if (!engineLines.length) return [];
    
    // GUARD: Ensure we only display analysis that matches the current FEN
    const isLiveMatch = analyzedFen && analyzedFen.split(' ').slice(0, 4).join(' ') === fen.split(' ').slice(0, 4).join(' ');
    if (!isLiveMatch) return [];

    try {
        const fenToUse = analyzedFen || fen;
        const tempGame = new Chess(fenToUse);

        return engineLines.map(line => {
            const movesSAN: string[] = [];
            const tempLineGame = new Chess(fenToUse);
            
            // Convert moves to SAN
            for (const uciMove of line.moves.slice(0, 10)) { // Show up to 10 moves
                try {
                    const move = tempLineGame.move({
                        from: uciMove.slice(0, 2),
                        to: uciMove.slice(2, 4),
                        promotion: uciMove.length > 4 ? uciMove.slice(4) as any : undefined
                    });
                    movesSAN.push(move.san);
                } catch (e) { break; }
            }

            // Create PV string
            const startTurn = tempGame.turn();
            const startMoveNumber = tempGame.moveNumber() || 1; // Default to 1 if unknown, though FEN should have it
            
            let pvString = '';
            let currentTurn = startTurn;
            let currentMoveNum = startMoveNumber;

            movesSAN.forEach((san, i) => {
                if (currentTurn === 'w') {
                    pvString += `${currentMoveNum}. ${san} `;
                    currentTurn = 'b';
                } else {
                    if (i === 0) {
                        pvString += `${currentMoveNum}... ${san} `;
                        currentMoveNum++;
                    } else {
                        pvString += `${san} `;
                        currentMoveNum++;
                    }
                    currentTurn = 'w';
                }
            });

            return {
                eval: line.score / 100,
                depth: line.depth,
                pv: pvString.trim(),
                mate: line.isMate ? line.mateIn || undefined : undefined,
                rawPv: line.moves.join(' ')
            };
        });
    } catch (e) {
        return [];
    }
  }, [engineLines, analyzedFen, fen]);
  
  // Use formatted analysis for display, fall back to basic if needed
  const displayAnalysis = formattedAnalysis;

  // Calculate Arrows - using bestMove which is always moves[0] from Stockfish
  const engineArrows: BoardArrow[] = useMemo(() => {
      if (!engineConfig.showArrows || engineLines.length === 0) return [];
      
      const isLiveMatch = analyzedFen && analyzedFen.split(' ').slice(0, 4).join(' ') === fen.split(' ').slice(0, 4).join(' ');
      if (!isLiveMatch) return [];
      
      // Determine side to move from current FEN
      const sideToMove = fen.split(' ')[1];
      
      const arrows: BoardArrow[] = [];
      
      engineLines.forEach((line, index) => {
          if (index >= 5) return;
          
          const firstMove = line.bestMove;
          
          if (firstMove && firstMove.length >= 4) {
              const from = firstMove.substring(0, 2);
              const to = firstMove.substring(2, 4);
              
              // Validate: Only show arrows for the correct side to move
              const fromRank = parseInt(from[1]);
              const isWhitePiece = fromRank <= 4;
              const isBlackPiece = fromRank >= 5;
              
              // Skip if wrong side's move
              if (sideToMove === 'w' && isBlackPiece) return;
              if (sideToMove === 'b' && isWhitePiece) return;
              
              arrows.push({
                  from,
                  to,
                  color: ENGINE_LINE_COLORS[index] || '#22c55e',
                  opacity: 0.9 - index * 0.15
              });
          }
      });
      
      return arrows;
  }, [engineLines, engineConfig.showArrows, analyzedFen, fen]);

  /* 
  function startAnalysis/resetToStart removed or simplified
  */
  
  // Toggle handler
  const toggleAnalysis = () => {
    setIsCloudAnalysisEnabled(prev => !prev);
  };

  /*
  Tablebase integration was here but moved up
  */

  useEffect(() => {
    if (isTablebasePosition(fen)) {
      queryTablebase(fen).then(result => {
        setTablebaseResult(result);
      });
    } else {
      setTablebaseResult(null);
    }
  }, [fen]);

  const currentEval = useMemo(() => {
    if (tablebaseResult) {
      const tbEval = tablebaseToEval(tablebaseResult, sideToMove);
      return { evaluation: tbEval.evaluation, isMate: tbEval.isMate, isTablebase: true };
    }
    if (displayAnalysis.length > 0) {
      const bestLine = displayAnalysis[0];
      if (bestLine.mate !== undefined) {
        return { evaluation: bestLine.mate, isMate: true, isTablebase: false };
      }
      return { evaluation: bestLine.eval * 100, isMate: false, isTablebase: false };
    }
    return { evaluation: 0, isMate: false, isTablebase: false };
  }, [displayAnalysis, tablebaseResult, sideToMove]);

  const tablebaseText = useMemo(() => {
    if (!tablebaseResult) return undefined;
    return getTablebaseDisplayText(tablebaseResult, sideToMove);
  }, [tablebaseResult, sideToMove]);

  // Current game instance for the board
  const currentBoardGame = useMemo(() => {
     try {
         const g = new Chess();
         g.load(fen);
         return g;
     } catch (e) {
         return new Chess();
     }
  }, [fen]);

  // Get move history for move list display
  const moveHistory = useMemo(() => {
    const tempGame = new Chess();
    if (pgn) {
      tempGame.loadPgn(pgn);
    }
    return tempGame.history();
  }, [pgn]);

  // Format evaluation for display
  const evalDisplay = useMemo(() => {
    if (displayAnalysis.length > 0) {
      const best = displayAnalysis[0];
      if (best.mate !== undefined) {
        return `M${best.mate > 0 ? '+' : ''}${best.mate}`;
      }
      const val = best.eval;
      return `${val >= 0 ? '+' : ''}${val.toFixed(1)}`;
    }
    if (tablebaseResult) {
      return tablebaseText || '0.0';
    }
    return '0.0';
  }, [displayAnalysis, tablebaseResult, tablebaseText]);

  // Is evaluation favorable for white?
  const evalColor = useMemo(() => {
    if (displayAnalysis.length > 0) {
      const best = displayAnalysis[0];
      if (best.mate !== undefined) return best.mate > 0 ? 'text-[#69e0a3]' : 'text-[#ff7b6b]';
      return best.eval > 0.2 ? 'text-[#69e0a3]' : best.eval < -0.2 ? 'text-[#ff7b6b]' : 'text-white';
    }
    return 'text-white';
  }, [displayAnalysis]);

  return (
    <div className="h-full w-full bg-gradient-to-br from-[#0f1729] via-[#111c35] to-[#0f1729] flex flex-col overflow-hidden">
      
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="lg:hidden flex flex-col h-full">
        
        {/* Board - Full width */}
        <div className="w-full aspect-square bg-[#0f1729] relative shrink-0">
          <ChessBoard
            game={currentBoardGame}
            onMove={(move) => {
              try {
                const newGameInstance = new Chess();
                newGameInstance.load(fen);
                const result = newGameInstance.move(move);
                if (result) {
                  const newFen = newGameInstance.fen();
                  setFen(newFen);
                  if (pgn) {
                    const baseGame = new Chess();
                    baseGame.loadPgn(pgn);
                    const history = baseGame.history();
                    const movesBefore = history.slice(0, currentMoveIndex + 1);
                    const branchGame = new Chess();
                    movesBefore.forEach(m => branchGame.move(m));
                    branchGame.move(move);
                    setPgn(branchGame.pgn());
                    setCurrentMoveIndex(movesBefore.length);
                  }
                  return true;
                }
              } catch (e) { return false; }
              return false;
            }}
            orientation="white"
            colorScheme={colorScheme}
            arrows={engineArrows}
          />
        </div>

        {/* Eval Bar Strip - Horizontal with score and nav */}
        <div className="bg-[#1a2744] border-t border-[#3a4a6e] px-3 py-2 flex items-center gap-2 shrink-0">
          {/* Eval Score Pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#243354] ${evalColor} font-black text-lg`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${displayAnalysis.length > 0 && displayAnalysis[0].eval >= 0 ? 'bg-[#69e0a3]' : 'bg-[#ff7b6b]'}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <span>{evalDisplay}</span>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={goToPrev} className="p-2 text-[#a8b4ce] hover:text-white hover:bg-[#243354] rounded-lg transition-colors">
              <ChevronLeft size={24} />
            </button>
            <button onClick={goToNext} className="p-2 text-[#a8b4ce] hover:text-white hover:bg-[#243354] rounded-lg transition-colors">
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Utility Buttons */}
          <div className="flex items-center gap-1 border-l border-[#3a4a6e] pl-2 ml-2">
            <button className="p-2 text-[#a8b4ce] hover:text-white rounded-lg">
              <Info size={20} />
            </button>
            <button onClick={() => navigator.clipboard.writeText(fen)} className="p-2 text-[#a8b4ce] hover:text-white rounded-lg">
              <Copy size={20} />
            </button>
            <button onClick={toggleAnalysis} className={`p-2 rounded-lg transition-colors ${isCloudAnalysisEnabled ? 'text-blue-400 bg-blue-500/20' : 'text-[#a8b4ce] hover:text-white'}`}>
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Engine Info Strip */}
        <div className="bg-[#0f1729] px-3 py-2 flex items-center justify-between border-b border-[#243354] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#a8b4ce] font-medium">SF 17.1 · NNUE</span>
            {openingName && (
                <>
                    <span className="text-[#3a4a6e]">•</span>
                    <span className="text-xs text-[#5ec2f2] font-bold truncate max-w-[150px]">{openingName}</span>
                </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#69e0a3] bg-[#69e0a3]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <div className="w-2 h-2 bg-[#69e0a3] rounded-full" />
              Depth {depth || 0}
            </span>
            {isAnalyzing && (
              <span className="text-[10px] font-bold text-[#5ec2f2] bg-[#5ec2f2]/10 px-2 py-0.5 rounded-full">ANALYZING</span>
            )}
          </div>
        </div>

        {/* Best Move Line */}
        {displayAnalysis.length > 0 && (
          <div className="bg-[#1a2744] px-3 py-2 flex items-center gap-2 border-b border-[#243354] shrink-0">
            <span className="text-sm text-white font-mono truncate flex-1">
              {displayAnalysis[0].pv.split(' ').slice(0, 8).join(' ')}
              {displayAnalysis[0].pv.split(' ').length > 8 && '...'}
            </span>
            <ChevronRight size={16} className="text-[#5ec2f2] shrink-0" />
          </div>
        )}

        {/* Move List - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-[#0f1729] custom-scrollbar">
          {moveHistory.length > 0 ? (
            <div className="divide-y divide-[#243354]">
              {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => {
                const whiteMove = moveHistory[i * 2];
                const blackMove = moveHistory[i * 2 + 1];
                const isCurrentWhite = currentMoveIndex === i * 2;
                const isCurrentBlack = currentMoveIndex === i * 2 + 1;
                
                return (
                  <div key={i} className="flex items-stretch">
                    <div className="w-8 text-[#6b7a99] text-xs font-bold py-2 px-2 bg-[#1a2744]/50 flex items-center">{i + 1}</div>
                    <button 
                      onClick={() => goToMove(i * 2)}
                      className={`flex-1 text-left py-2 px-3 text-sm font-medium transition-colors ${isCurrentWhite ? 'bg-[#5ec2f2]/20 text-[#5ec2f2]' : 'text-white hover:bg-[#1a2744]'}`}
                    >
                      {whiteMove}
                      {isCurrentWhite && displayAnalysis.length > 0 && (
                        <span className={`ml-2 text-xs font-bold ${evalColor}`}>{evalDisplay}</span>
                      )}
                    </button>
                    {blackMove && (
                      <button 
                        onClick={() => goToMove(i * 2 + 1)}
                        className={`flex-1 text-left py-2 px-3 text-sm font-medium transition-colors ${isCurrentBlack ? 'bg-[#5ec2f2]/20 text-[#5ec2f2]' : 'text-white hover:bg-[#1a2744]'}`}
                      >
                        {blackMove}
                        {isCurrentBlack && displayAnalysis.length > 0 && (
                          <span className={`ml-2 text-xs font-bold ${evalColor}`}>{evalDisplay}</span>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <p className="text-sm text-[#6b7a99]">Paste a PGN to view moves</p>
            </div>
          )}
        </div>

        {/* FEN & PGN Inputs - Bottom section */}
        <div className="bg-[#1a2744] border-t border-[#3a4a6e] px-3 py-3 space-y-2 shrink-0">
          {/* FEN Input */}
          <div className="relative">
            <input
              type="text"
              value={fen}
              onChange={(e) => handleFenChange(e.target.value)}
              className="w-full bg-[#0f1729] border border-[#3a4a6e] rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#5ec2f2] transition-all pr-10"
              placeholder="Paste FEN here..."
            />
            <button 
              onClick={() => navigator.clipboard.writeText(fen)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#6b7a99] hover:text-[#5ec2f2]"
            >
              <Copy size={14} />
            </button>
          </div>
          
          {/* PGN Input */}
          <textarea
            value={pgn}
            onChange={(e) => handlePgnChange(e.target.value)}
            rows={2}
            className="w-full bg-[#0f1729] border border-[#3a4a6e] rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#5ec2f2] transition-all resize-none"
            placeholder="Paste PGN here..."
          />
          
          {/* Cloud Analysis Controls */}
          <div className="flex gap-2">
               <button
                 onClick={toggleAnalysis}
                 className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                     isCloudAnalysisEnabled ? 'bg-blue-500/20 text-blue-400' : 'bg-[#0f1729] text-slate-400 border border-[#3a4a6e]'
                 }`}
               >
                 <div className={`w-1.5 h-1.5 rounded-full ${isCloudAnalysisEnabled ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
                 {isCloudAnalysisEnabled ? 'Analyzing' : 'Analyze'}
               </button>
               
               <button
                 onClick={() => setEngineConfig(c => ({ ...c, showArrows: !c.showArrows }))}
                 className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                     engineConfig.showArrows ? 'bg-green-500/20 text-green-400' : 'bg-[#0f1729] text-slate-400 border border-[#3a4a6e]'
                 }`}
               >
                 <div className={`w-1.5 h-1.5 rounded-full ${engineConfig.showArrows ? 'bg-green-400' : 'bg-slate-600'}`} />
                 Arrows
               </button>

               <button
                    onClick={() => setShowSettings(true)}
                    className="p-3 bg-[#0f1729] text-slate-400 border border-[#3a4a6e] rounded-xl"
               >
                    <Settings size={18} />
               </button>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (refined for responsiveness) ===== */}
      <div className="hidden lg:flex flex-col p-4 lg:p-6 h-full overflow-hidden">
        <div className="w-full max-w-[1600px] mx-auto h-full flex flex-col relative overflow-hidden">
          
          {/* Background Decorative Element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex items-center justify-between mb-6 shrink-0 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Microscope size={24} className="text-blue-400" />
              </div>
              <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Position Analysis</h2>
                  <div className="flex items-center gap-2">
                      <p className="text-xs text-blue-300/60 font-medium uppercase tracking-wider">Engine Power x Tablebase</p>
                      {openingName && (
                          <div className="flex items-center gap-1.5 bg-blue-500/10 px-2 py-0.5 rounded text-blue-300 border border-blue-500/20">
                             <BookOpen size={10} />
                             <span className="text-[10px] font-bold uppercase tracking-wider">{openingName}</span>
                          </div>
                      )}
                  </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={resetToStart}
                className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white text-sm font-bold rounded-xl transition flex items-center gap-2 border border-white/5"
              >
                <RefreshCw size={16} />
                Reset
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:justify-center xl:gap-8 h-[calc(100%-80px)] min-h-0 relative z-10">
            
            {/* LEFT: Board & Navigation */}
            <div className="flex-1 min-w-0 flex flex-col items-center justify-center min-h-0 py-2 relative overflow-hidden">
               <div className="w-full h-full max-w-full max-h-[min(700px,80vh)] flex justify-center items-center overflow-hidden p-2 lg:p-4">
                  
                  {/* Board + Eval Bar Container - sharing same height */}
                  <div className="relative flex gap-0 items-stretch h-full max-w-full aspect-square bg-[#1a2744]/20 rounded-xl overflow-hidden shadow-2xl">
                      {/* Evaluation Bar - same height as board */}
                      <div className="w-3 lg:w-5 rounded-l-md overflow-hidden ring-1 ring-white/10 shrink-0">
                          <EvaluationBar 
                            evaluation={currentEval.evaluation} 
                            isMate={currentEval.isMate}
                            isTablebase={currentEval.isTablebase}
                            tablebaseText={tablebaseText}
                          />
                      </div>
                      
                      {/* Chess Board Container */}
                      <div className="relative flex-1 aspect-square overflow-hidden bg-[#243354]">
                          <ChessBoard
                            game={currentBoardGame}
                            arrows={engineArrows}
                            onMove={(move) => {
                            try {
                              const newGameInstance = new Chess();
                              newGameInstance.load(fen);
                              const result = newGameInstance.move(move);
                              if (result) {
                                const newFen = newGameInstance.fen();
                                setFen(newFen);
                                
                                // Always update PGN - either add to existing or start fresh
                                if (pgn) {
                                    // Continue from existing game
                                    const baseGame = new Chess();
                                    try {
                                        baseGame.loadPgn(pgn);
                                        const history = baseGame.history();
                                        const movesBefore = history.slice(0, currentMoveIndex + 1);
                                        const branchGame = new Chess();
                                        movesBefore.forEach(m => branchGame.move(m));
                                        branchGame.move(move);
                                        setPgn(branchGame.pgn());
                                        setCurrentMoveIndex(movesBefore.length);
                                    } catch (e) {
                                        // If PGN loading fails, start fresh
                                        const freshGame = new Chess();
                                        freshGame.move(move);
                                        setPgn(freshGame.pgn());
                                        setCurrentMoveIndex(0);
                                    }
                                } else {
                                    // Start fresh - create PGN from scratch using the move just made
                                    // Use newGameInstance which already has the move applied
                                    setPgn(newGameInstance.pgn());
                                    setCurrentMoveIndex(0);
                                }
                                
                                // Update game tree for variation support
                                setGameTree(prevTree => addMove(prevTree, result.san, newFen));
                                
                                return true;
                              }
                            } catch (e) { return false; }
                            return false;
                          }}
                          orientation="white"
                          colorScheme={colorScheme}
                        />
                      </div>
                  </div>
               </div>
               
               {/* Navigation Bar - Below the board */}
               <div className="flex items-center justify-center gap-1 bg-[#243354]/50 p-2 rounded-2xl border border-white/5 w-full max-w-[min(50vh,calc(100vw-3rem))] lg:max-w-full mt-4">
                   <NavButton onClick={goToStart} icon={<ChevronsLeft size={20} />} title="Start" />
                   <NavButton onClick={goToPrev} icon={<ChevronLeft size={20} />} title="Previous" />
                   <div className="w-px h-6 bg-white/10 mx-2" />
                   <NavButton onClick={goToNext} icon={<ChevronRight size={20} />} title="Next" />
                   <NavButton onClick={goToEnd} icon={<ChevronsRight size={20} />} title="End" />
                   <div className="w-px h-6 bg-white/10 mx-2" />
                   {/* Undo Last Move Button */}
                   <button
                       onClick={() => {
                           if (!pgn) return;
                           const tempGame = new Chess();
                           try {
                               tempGame.loadPgn(pgn);
                               const history = tempGame.history();
                               if (history.length === 0) return;
                               
                               // Create new game with one less move
                               const newGame = new Chess();
                               history.slice(0, -1).forEach(m => newGame.move(m));
                               setPgn(newGame.pgn());
                               setFen(newGame.fen());
                               setCurrentMoveIndex(Math.max(-1, history.length - 2));
                               
                               // Remove annotation for deleted move
                               const deletedIdx = history.length - 1;
                               if (annotations.has(deletedIdx)) {
                                   const newAnnotations = new Map(annotations);
                                   newAnnotations.delete(deletedIdx);
                                   setAnnotations(newAnnotations);
                               }
                           } catch (e) {}
                       }}
                       disabled={!pgn}
                       className={`p-2 rounded-lg transition-all ${
                           pgn 
                               ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-1 ring-red-500/30' 
                               : 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
                       }`}
                       title="Undo Last Move (Delete)"
                   >
                       <Trash2 size={18} />
                   </button>
                   {/* Back One Move to Create Variation */}
                   <button
                       onClick={goToPrev}
                       disabled={currentMoveIndex < 0}
                       className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all text-xs font-bold ${
                           currentMoveIndex >= 0 
                               ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 ring-1 ring-purple-500/30' 
                               : 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
                       }`}
                       title="Go back one move to create a variation"
                   >
                       <ChevronLeft size={16} />
                       Vary
                   </button>
               </div>
            </div>

            {/* RIGHT Panel: Inputs & Analysis */}
            <div className={`w-full lg:w-[400px] xl:w-[450px] flex-none flex flex-col h-full bg-[#111b33] border-l border-white/5 z-20 shadow-2xl overflow-hidden relative ${activeTab === 'annotate' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
              
              {/* Headers / Tabs */}
              <div className="flex gap-2 p-1 bg-[#243354]/30 rounded-xl border border-white/5">
                  <button 
                      onClick={() => setActiveTab('analysis')}
                      className={`flex-1 px-4 py-2 font-bold rounded-lg text-sm transition-all ${
                          activeTab === 'analysis' 
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                              : 'text-slate-400 hover:text-white'
                      }`}
                  >
                      Analysis
                  </button>
                  <button 
                      onClick={() => setActiveTab('annotate')}
                      className={`flex-1 px-4 py-2 font-bold rounded-lg text-sm transition-all ${
                          activeTab === 'annotate' 
                              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' 
                              : 'text-slate-400 hover:text-white'
                      }`}
                  >
                      Annotate
                  </button>
              </div>

              {/* ANALYSIS TAB CONTENT */}
              {activeTab === 'analysis' && (
              <>
              {/* FEN & PGN Inputs */}
              <div className="space-y-4">
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <Terminal size={14} className="text-blue-400" />
                        <label className="text-xs font-black text-blue-300/70 uppercase tracking-widest">FEN Position</label>
                    </div>
                    <div className="relative group">
                        <input
                          type="text"
                          value={fen}
                          onChange={(e) => handleFenChange(e.target.value)}
                          className="w-full bg-[#1a2744] border border-[#3a4a6e] rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-blue-500 transition-all shadow-xl group-hover:bg-[#1e2d4e]"
                          placeholder="Paste FEN here..."
                        />
                        <button 
                          onClick={() => navigator.clipboard.writeText(fen)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-blue-400 transition-colors bg-slate-800/50 rounded-lg"
                        >
                          <Copy size={14} />
                        </button>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <History size={14} className="text-emerald-400" />
                        <label className="text-xs font-black text-emerald-300/70 uppercase tracking-widest">PGN Game</label>
                    </div>
                    <textarea
                      value={pgn}
                      onChange={(e) => handlePgnChange(e.target.value)}
                      rows={4}
                      className="w-full bg-[#1a2744] border border-[#3a4a6e] rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all shadow-xl resize-none custom-scrollbar hover:bg-[#1e2d4e]"
                      placeholder="Paste PGN here to load game history..."
                    />
                  </div>
              </div>

              {/* Controls: Analysis Toggle, Arrows, Settings */}
              <div className="flex gap-2">
                   {/* Analysis Toggle */}
                   <button
                        onClick={toggleAnalysis}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                            isCloudAnalysisEnabled 
                            ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50' 
                            : 'bg-[#243354]/40 text-slate-400 hover:text-white hover:bg-[#243354]'
                        }`}
                   >
                        <div className={`w-2 h-2 rounded-full ${isCloudAnalysisEnabled ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
                        {isCloudAnalysisEnabled ? 'Analysis: ON' : 'Analysis: OFF'}
                   </button>

                   {/* Arrows Toggle */}
                   <button
                        onClick={() => setEngineConfig(c => ({ ...c, showArrows: !c.showArrows }))}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                            engineConfig.showArrows
                            ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/50'
                            : 'bg-[#243354]/40 text-slate-400 hover:text-white hover:bg-[#243354]'
                        }`}
                   >
                        <div className={`w-2 h-2 rounded-full ${engineConfig.showArrows ? 'bg-green-400' : 'bg-slate-600'}`} />
                        {engineConfig.showArrows ? 'Arrows: ON' : 'Arrows: OFF'}
                   </button>

                   {/* MultiPV Selector - Dropdown */}
                   <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/5">
                        <span className="text-xs text-slate-400 font-bold">Lines</span>
                        <select
                            value={engineConfig.multiPV}
                            onChange={(e) => setEngineConfig(c => ({ ...c, multiPV: parseInt(e.target.value) }))}
                            className="bg-[#0f1729] text-purple-400 font-bold text-sm rounded-lg px-2 py-1 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
                        >
                            {[1, 2, 3, 4, 5].map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                   </div>

                   {/* Settings Button */}
                   <button
                        onClick={() => setShowSettings(true)}
                        className="p-3 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-white/5"
                        title="Engine Settings"
                   >
                        <Settings size={20} />
                   </button>
              </div>

              {/* Analysis Results */}
              <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
                      <Info size={14} className="text-blue-400" />
                      Engine Lines
                  </h3>
                  {displayAnalysis.length > 0 && <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full ring-1 ring-blue-500/30">STOCKFISH 17.1</span>}
                </div>

                <div className="p-4 space-y-3">
                    {displayAnalysis.length === 0 ? (
                      <div className="text-center py-16 flex flex-col items-center gap-4 group cursor-pointer" onClick={toggleAnalysis}>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isCloudAnalysisEnabled ? 'bg-blue-500/10 text-blue-400 animate-pulse' : 'bg-slate-800/50 text-slate-600 group-hover:bg-blue-500/10 group-hover:text-blue-400'}`}>
                          <Search size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-500 group-hover:text-blue-300 transition-colors">
                          {isCloudAnalysisEnabled ? 'Analyzing...' : 'Ready to analyze. Toggle ON.'}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                          {displayAnalysis.map((line: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group border-b border-white/5 last:border-0">
                                {/* PV ID Pill */}
                                <div 
                                    className="shrink-0 w-12 h-6 flex items-center justify-center rounded text-[10px] font-black text-[#0f1729]"
                                    style={{ backgroundColor: ENGINE_LINE_COLORS[idx] || '#22c55e' }}
                                >
                                    PV {idx + 1}
                                </div>

                                {/* Evaluation */}
                                <div className={`shrink-0 w-14 text-right font-black tracking-tight ${
                                  line.mate !== undefined ? 'text-yellow-400' :
                                  line.eval > 0 ? 'text-[#69e0a3]' : 
                                  line.eval < 0 ? 'text-[#ff7b6b]' : 'text-slate-400'
                                }`}>
                                  {line.mate !== undefined 
                                    ? `M${Math.abs(line.mate)}`
                                    : `${line.eval > 0 ? '+' : ''}${line.eval.toFixed(1)}`
                                  }
                                </div>
                                
                                {/* Moves */}
                                <div className="flex-1 min-w-0 text-xs text-white/90 font-mono truncate">
                                    {line.pv}
                                </div>

                                {/* Depth (Only visible on hover to reduce noise) */}
                                <div className="hidden group-hover:block text-[9px] font-bold text-slate-500 uppercase shrink-0">
                                    D{line.depth}
                                </div>
                            </div>
                          ))}
                      </div>
                    )}
                </div>
              </div>
              </>
              )}

              {/* ANNOTATE TAB CONTENT */}
              {activeTab === 'annotate' && (
              <div className="flex flex-col h-full gap-4 pb-4">
                  {/* Annotated Move List */}
                  <div className="flex-1 min-h-0 flex flex-col bg-[#243354]/30 rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
                      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-[#243354]/50 shrink-0">
                          <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
                              <FileText size={14} className="text-purple-400" />
                              Annotated PGN
                          </h3>
                          <button 
                              onClick={() => {
                                  // Copy PGN with variations (uses tree-based export)
                                  navigator.clipboard.writeText(treePgn || pgn || '');
                              }}
                              className="text-xs font-bold bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-lg ring-1 ring-purple-500/30 hover:bg-purple-500/30 transition-colors"
                          >
                              Copy PGN
                          </button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                          {flattenedMoves.length === 0 ? (
                              <div className="text-center py-8 text-slate-500">
                                  <FileText size={32} className="mx-auto mb-2 opacity-50" />
                                  <p className="text-sm font-bold">No moves yet</p>
                                  <p className="text-xs mt-1">Make moves on the board or paste PGN above</p>
                              </div>
                          ) : (
                              <div className="space-y-1">
                                  {flattenedMoves.map((item) => (
                                      <div 
                                          key={item.node.id} 
                                          className="flex items-center gap-1"
                                          style={{ marginLeft: `${item.depth * 16}px` }}
                                      >
                                          {/* Variation indicator */}
                                          {item.isVariation && (
                                              <span className="text-purple-400 text-xs">└─</span>
                                          )}
                                          
                                          {/* Move number */}
                                          {!item.isBlackMove && (
                                              <span className="text-slate-500 font-mono text-xs w-6">
                                                  {item.moveNumber}.
                                              </span>
                                          )}
                                          {item.isBlackMove && item.isVariation && (
                                              <span className="text-slate-500 font-mono text-xs w-6">
                                                  {item.moveNumber}...
                                              </span>
                                          )}
                                          
                                          {/* Move button */}
                                          <button
                                              onClick={() => {
                                                  setFen(item.node.fen);
                                                  setGameTree(prev => goToNode(prev, item.node));
                                                  setSelectedNode(item.node);
                                              }}
                                              className={`px-2 py-0.5 rounded font-mono text-sm ${
                                                  gameTree.currentNode?.id === item.node.id 
                                                      ? 'bg-purple-500 text-white' 
                                                      : item.isVariation 
                                                          ? 'text-purple-300 hover:bg-purple-500/20' 
                                                          : 'text-white hover:bg-white/10'
                                              }`}
                                          >
                                              {item.node.san}
                                          </button>
                                          
                                          {/* Show annotation inline */}
                                          {item.node.annotation && (
                                              <span className="text-xs text-purple-300 italic ml-1">
                                                  {`{${item.node.annotation}}`}
                                              </span>
                                          )}
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
                  
                  {/* Annotation Input */}
                  {selectedNode !== null && (
                      <div className="sticky bottom-0 z-50 bg-[#0f1729] rounded-2xl p-4 border border-white/5 shadow-[0_-8px_16px_rgba(0,0,0,0.5)]">
                          <div className="flex items-center gap-2 mb-3">
                              <Edit3 size={14} className="text-purple-400" />
                              <label className="text-xs font-black text-purple-300/70 uppercase tracking-widest">
                                  Annotate: {selectedNode.san}
                              </label>
                          </div>
                          <textarea
                              value={selectedNode.annotation || ''}
                              onChange={(e) => {
                                  // Update annotation on the selected node
                                  selectedNode.annotation = e.target.value || undefined;
                                  setGameTree({...gameTree}); // Trigger re-render
                              }}
                              placeholder="Add your annotation..."
                              className="w-full bg-[#1a2744] border border-[#3a4a6e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-all shadow-xl resize-y"
                              rows={3}
                          />
                          <div className="flex gap-2 mt-3 flex-wrap">
                              <button
                                  onClick={() => {
                                      // Add engine eval as annotation
                                      if (displayAnalysis.length > 0) {
                                          const topLine = displayAnalysis[0];
                                          const evalText = topLine.mate !== undefined 
                                              ? `M${Math.abs(topLine.mate)}`
                                              : `${topLine.eval > 0 ? '+' : ''}${topLine.eval.toFixed(1)}`;
                                          const existing = selectedNode.annotation || '';
                                          selectedNode.annotation = `${existing}${existing ? ' ' : ''}${evalText}`;
                                          setGameTree({...gameTree});
                                      }
                                  }}
                                  className="flex-1 py-2 text-xs font-bold bg-blue-500/20 text-blue-300 rounded-lg ring-1 ring-blue-500/30 hover:bg-blue-500/30 transition-colors whitespace-nowrap"
                              >
                                  + Add Eval
                              </button>
                              {/* Delete Annotation Button */}
                              <button
                                  onClick={() => {
                                      selectedNode.annotation = undefined;
                                      setGameTree({...gameTree});
                                  }}
                                  disabled={!selectedNode.annotation}
                                  className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                                      selectedNode.annotation
                                          ? 'bg-red-500/20 text-red-300 ring-1 ring-red-500/30 hover:bg-red-500/30'
                                          : 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
                                  }`}
                                  title="Delete annotation"
                              >
                                  <Trash2 size={14} />
                              </button>
                              {/* Delete Move Button */}
                              <button
                                  onClick={() => {
                                      // Delete the selected move and its children from the tree
                                      const newTree = deleteCurrentMove({...gameTree, currentNode: selectedNode});
                                      setGameTree(newTree);
                                      setFen(getCurrentFen(newTree));
                                      setSelectedNode(null);
                                  }}
                                  className="px-3 py-2 text-xs font-bold bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/30 hover:bg-orange-500/30 rounded-lg transition-colors whitespace-nowrap"
                                  title="Delete this move and its variations"
                              >
                                  Del Move
                              </button>
                              <button
                                  onClick={() => setSelectedNode(null)}
                                  className="px-4 py-2 text-xs font-bold bg-slate-500/20 text-slate-300 rounded-lg hover:bg-slate-500/30 transition-colors"
                              >
                                  Done
                              </button>
                          </div>
                      </div>
                  )}
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Engine Settings Overlay */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
            <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                <EngineSettings 
                    config={engineConfig}
                    onConfigChange={setEngineConfig}
                    isAnalyzing={isAnalyzing}
                />
            </div>
        </div>
      )}
    </div>
  );
}

function NavButton({ onClick, icon, title }: { onClick: () => void, icon: React.ReactNode, title: string }) {
    return (
        <button
            onClick={onClick}
            title={title}
            className="p-3 text-[#a8b4ce] hover:text-white hover:bg-blue-500/20 rounded-xl transition-all active:scale-90"
        >
            {icon}
        </button>
    );
}
