import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from './ChessBoard';
import { BoardColorSchemeSelector } from './BoardColorSchemeSelector';
import { PieceStyleSelector } from './PieceStyleSelector';
import { useBoardColorScheme } from '@/contexts/BoardColorSchemeContext';
import { usePieceStyle } from '@/contexts/PieceStyleContext';
import { OpeningVariation } from '@/lib/openings-repertoire';
import { ChevronRight, RotateCcw, Check, X, BookOpen, Brain, Clock, Palette, CheckCircle, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRewards } from '@/contexts/RewardsContext';

// SRS utility could be imported or integrated directly
// import { submitReview } from '@/lib/srs-manager';
import { DynamicMascot } from './DynamicMascot';
import { FreeAnalysisModal } from './FreeAnalysisModal';

interface LessonInterfaceProps {
  variation: OpeningVariation;
  onComplete: () => void;
  onExit: () => void;
}

type LessonPhase = 'intro' | 'demo' | 'recall' | 'feedback' | 'summary';


const Confetti = () => {
   return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         {[...Array(20)].map((_, i) => (
             <motion.div 
                key={i}
                initial={{ y: -20, x: Math.random() * 200 - 100, opacity: 1 }}
                animate={{ y: 200, opacity: 0, rotate: Math.random() * 360 }}
                transition={{ duration: 1 + Math.random(), repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 left-1/2 w-2 h-2 rounded-full"
                style={{ 
                    backgroundColor: ['#ef4444', '#3b82f6', '#22c55e', '#eab308'][Math.floor(Math.random() * 4)],
                    left: `${50 + (Math.random() * 60 - 30)}%`
                }}
             />
         ))}
      </div>
   )
}

export const LessonInterface: React.FC<LessonInterfaceProps> = ({ variation, onComplete, onExit }) => {
  const [game, setGame] = useState(new Chess());
  const [phase, setPhase] = useState<LessonPhase>('intro');
  const [moveIndex, setMoveIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [hesitationStart, setHesitationStart] = useState<number>(0);
  const [isDraggable, setIsDraggable] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  const { addXp } = useRewards();
  const { colorScheme, setColorScheme } = useBoardColorScheme();
  const { pieceStyle, setPieceStyle } = usePieceStyle();

  // Reset game on mount
  useEffect(() => {
    const newGame = new Chess();
    setGame(newGame);
    setPhase('intro');
  }, [variation]);

  // Handle phase transitions
  useEffect(() => {
    if (phase === 'demo') {
      setIsDraggable(false);
      // Auto-play the demo move after a short delay
      const timer = setTimeout(() => {
        playDemoMove();
      }, 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'recall') {
      // Set hesitation start
      setHesitationStart(Date.now());
      setIsDraggable(true);
      // Undo the move so user can play it
      safeUndo(); 
    }
  }, [phase, moveIndex]);

  const safeUndo = () => {
    setGame(g => {
        const copy = new Chess();
        copy.loadPgn(g.pgn());
        copy.undo();
        return copy;
    });
  };

  const playDemoMove = () => {
    // Only play if not already at the target move
    // We want to show the move `moveIndex`
    const targetMove = variation.moves[moveIndex];
    if (!targetMove) return;

    setGame(g => {
        const copy = new Chess();
        copy.loadPgn(g.pgn());
        try {
            // Need to handle UCI properly or just use move string if simple?
            // variation.moves are UCI e.g. "e2e4"
            const from = targetMove.substring(0, 2);
            const to = targetMove.substring(2, 4);
            const promotion = targetMove.length > 4 ? targetMove.substring(4, 5) : undefined;
            copy.move({ from, to, promotion });
        } catch (e) {
            console.error("Move error", e);
        }
        return copy;
    });
  };

  const handleUserMove = (move: { from: string; to: string; promotion?: string }) => {
      if (phase !== 'recall') return false;

      const targetUCI = variation.moves[moveIndex];
      // Construct UCI from user move
      let userUCI = move.from + move.to;
      if (move.promotion) userUCI += move.promotion;

      if (userUCI === targetUCI) {
          // Correct!
          setGame(g => {
             const copy = new Chess();
             copy.loadPgn(g.pgn());
             copy.move(move);
             return copy;
          });
          setFeedbackMessage("Correct!");
          setIsDraggable(false);
          
          setTimeout(() => {
              setFeedbackMessage(null);
              setMistakes(0);
              setHintUsed(false);
              
              if (moveIndex + 1 >= variation.moves.length) {
                  setPhase('summary');
              } else {
                  setMoveIndex(i => i + 1);
                  setPhase('demo'); // Go to next demo
              }
          }, 1000);
          return true;
      } else {
          // Mistake
          const newMistakes = mistakes + 1;
          setMistakes(newMistakes);
          
          if (newMistakes >= 2) {
             setFeedbackMessage("Let me show you.");
             setIsDraggable(false);
             
             // Auto-play correct move
             setTimeout(() => {
                 setGame(g => {
                    const copy = new Chess();
                    copy.loadPgn(g.pgn());
                    try {
                        const from = targetUCI.substring(0, 2);
                        const to = targetUCI.substring(2, 4);
                        const promotion = targetUCI.length > 4 ? targetUCI.substring(4, 5) : undefined;
                        copy.move({ from, to, promotion });
                    } catch(e) {}
                    return copy;
                 });
                 
                 // Advance after showing
                 setTimeout(() => {
                     setFeedbackMessage(null);
                     setMistakes(0);
                     setHintUsed(false);
                     
                     if (moveIndex + 1 >= variation.moves.length) {
                         setPhase('summary');
                     } else {
                         setMoveIndex(i => i + 1);
                         setPhase('demo'); 
                     }
                 }, 2000);
             }, 800);
             return false;
          } else {
              setFeedbackMessage("Incorrect. Try again.");
              setTimeout(() => setFeedbackMessage(null), 1500);
              return false;
          }
      }
  };

  // Helper to get explanation
  const getExplanation = (idx: number) => {
      return variation.explanations?.[idx] || (idx % 2 === 0 ? "White develops." : "Black develops.");
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] overflow-y-auto lg:overflow-hidden relative">
      {/* Top Bar (Mobile/Overlay) or just Absolute Close */}
      <button onClick={onExit} className="absolute top-2 right-2 lg:top-4 lg:right-4 z-50 p-2 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-[var(--color-text-primary)] rounded-lg transition-colors">
        <X size={20} />
      </button>

      {/* LEFT COLUMN: Navigation / Move List (Bottom on Mobile) */}
      <div className="w-full lg:w-[300px] flex-shrink-0 bg-[var(--color-bg-primary)] border-t lg:border-t-0 lg:border-r border-[var(--color-border)] flex flex-col z-20 order-3 lg:order-1 h-64 lg:h-full">
         <div className="p-4 lg:p-6 border-b border-[var(--color-border)]">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] leading-tight mb-2">{variation.name}</h2>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{variation.description}</p>
         </div>
         
         <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-[var(--color-bg-secondary)] lg:bg-transparent">
            <div className="px-4 py-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 mt-2">
                Course Moves
            </div>
            {variation.moves.map((move, idx) => {
                const isActive = idx === moveIndex;
                const isPast = idx < moveIndex;
                const moveNum = Math.floor(idx / 2) + 1;
                const isWhite = idx % 2 === 0;

                return (
                    <div 
                        key={idx}
                        className={`px-4 py-3 rounded-lg text-sm flex items-center justify-between transition-all ${
                            isActive 
                                ? 'bg-blue-600 text-[var(--color-text-primary)] shadow-lg' 
                                : isPast 
                                    ? 'text-slate-500 hover:bg-slate-800/50' 
                                    : 'text-slate-600'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`font-mono text-xs opacity-50 w-6 ${isActive ? 'text-blue-200' : ''}`}>
                                {isWhite ? `${moveNum}.` : '...'}
                            </span>
                            <span className="font-bold">
                                {isWhite ? "White" : "Black"} plays...
                            </span>
                        </div>
                        
                        {isPast && <Check size={14} className="text-green-500" />}
                        {isActive && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                    </div>
                );
            })}
         </div>

         {/* Bottom Settings Toggle */}
         <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)] flex gap-2">
             <button 
               onClick={() => setShowColorPicker(!showColorPicker)}
               className="flex items-center gap-2 text-slate-400 hover:text-[var(--color-text-primary)] text-xs font-medium px-3 py-2 rounded hover:bg-slate-800 transition-colors flex-1"
             >
               <Palette size={14} /> Customize
             </button>
             <button 
               onClick={() => setShowAnalysis(true)}
               className="flex items-center gap-2 text-slate-400 hover:text-[var(--color-text-primary)] text-xs font-medium px-3 py-2 rounded hover:bg-slate-800 transition-colors flex-1"
             >
               <BookOpen size={14} /> Sandbox
             </button>
         </div>
      </div>

      {/* CENTER COLUMN: Board (Top on Mobile) */}
      <div className="w-full lg:flex-1 flex flex-col items-center justify-center bg-[#0b1120] relative p-4 lg:p-8 order-1 lg:order-2 shrink-0">
         <div className="relative w-full max-w-[50vh] lg:max-w-[700px] aspect-square shadow-2xl rounded-sm">
             <ChessBoard 
                  game={game}
                  arePiecesDraggable={isDraggable}
                  onMove={handleUserMove}
                  orientation={variation.playerColor === 'w' ? 'white' : 'black'}
                  colorScheme={colorScheme}
              />
              
             {/* Transient Feedback Overlay (Centered on Board) */}
            <AnimatePresence>
                {feedbackMessage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0 }}
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-xl font-black text-xl shadow-2xl backdrop-blur-md z-30 pointer-events-none flex items-center gap-3 border-2 ${
                            feedbackMessage.includes('Correct') 
                            ? 'bg-green-500/90 border-green-400 text-[var(--color-text-primary)]' 
                            : feedbackMessage.includes('Let me')
                                ? 'bg-blue-500/90 border-blue-400 text-[var(--color-text-primary)]'
                                : 'bg-red-500/90 border-red-400 text-[var(--color-text-primary)]'
                        }`}
                    >
                         {feedbackMessage.includes('Correct') && <CheckCircle size={24} />}
                         {feedbackMessage.includes('Incorrect') && <X size={24} />}
                         {feedbackMessage.includes('Let me') && <Brain size={24} />}
                        {feedbackMessage}
                    </motion.div>
                )}
            </AnimatePresence>
         </div>

          {/* Color Picker Popover (Centered) */}
          {showColorPicker && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[var(--color-bg-elevated)] rounded-xl p-4 border border-slate-700 shadow-2xl z-40 w-[300px]">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Board Colors</h4>
                  <BoardColorSchemeSelector selected={colorScheme} onChange={setColorScheme} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Piece Style</h4>
                  <PieceStyleSelector selected={pieceStyle} onChange={setPieceStyle} />
                </div>
              </div>
            </div>
          )}
      </div>

      {/* RIGHT COLUMN: Content / Explanations (Middle on Mobile) */}
      <div className="w-full lg:w-[350px] flex-shrink-0 bg-bg-secondary text-text-primary border-t lg:border-t-0 lg:border-l border-border-color flex flex-col z-20 shadow-xl order-2 lg:order-3">
          <AnimatePresence mode="wait">
                {phase === 'intro' && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col h-full bg-bg-secondary overflow-y-auto"
                        key="intro"
                    >
                        <div className="p-4 lg:p-8 flex-1 flex flex-col justify-center items-center text-center header-adjustment">
                            <div className="relative mb-4 lg:mb-6 shrink-0">
                                <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full animate-bounce z-10">
                                    I'm your coach!
                                </div>
                                <div className="transform scale-75 lg:scale-100 origin-center">
                                    <DynamicMascot 
                                        size={128} 
                                        mood="idle" 
                                        className="drop-shadow-xl"
                                    />
                                </div>
                            </div>
                            
                            <h3 className="text-xl lg:text-2xl font-black text-text-primary mb-2 lg:mb-3">{variation.name}</h3>
                            <p className="text-sm lg:text-base text-text-secondary leading-relaxed mb-6 lg:mb-8 w-full max-w-[280px]">
                                Hi! I'm Buddy. I'll be teaching you the <strong>{variation.name}</strong> today. Ready to master the moves?
                            </p>
                            <button 
                                onClick={() => setPhase('demo')}
                                className="w-full py-3 lg:py-4 bg-blue-600 hover:bg-blue-500 text-[var(--color-text-primary)] font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                            >
                                Let's Start!
                            </button>
                        </div>
                    </motion.div>
                )}

                {phase === 'demo' && (
                    <motion.div 
                         initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                         className="flex flex-col h-full"
                         key="demo"
                    >
                         <div className="p-6 border-b border-border-color bg-bg-tertiary/50 flex items-center gap-3">
                             <DynamicMascot size={48} mood="thinking" />
                             <div>
                                 <div className="flex items-center gap-1 text-blue-600 font-bold uppercase text-xs tracking-wider mb-0.5">
                                    <Brain size={12} /> Buddy Explains
                                 </div>
                                 <h3 className="text-lg font-black text-text-primary leading-none">
                                     {moveIndex % 2 === 0 ? "White's Turn" : "Black's Turn"}
                                 </h3>
                             </div>
                         </div>
                         
                         <div className="flex-1 p-6 overflow-y-auto font-medium text-lg leading-loose text-text-secondary">
                             <div className="relative bg-bg-tertiary p-4 rounded-2xl rounded-tl-none border border-border-color shadow-sm">
                                <p>
                                    {getExplanation(moveIndex)}
                                </p>
                             </div>
                         </div>

                         <div className="p-6 border-t border-border-color bg-bg-secondary">
                            <button 
                                onClick={() => setPhase('recall')}
                                className="w-full py-4 bg-bg-elevated hover:bg-bg-tertiary text-text-primary font-bold rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                Got it, let me play <ChevronRight size={18} />
                            </button>
                         </div>
                    </motion.div>
                )}

                {phase === 'recall' && (
                    <motion.div 
                         initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                         className="flex flex-col h-full"
                         key="recall"
                    >
                        <div className="p-6 border-b border-border-color bg-bg-tertiary/50 flex items-center gap-3">
                              <DynamicMascot 
                                 size={48} 
                                 mood={mistakes > 0 ? "oops" : "idle"} 
                              />
                             <div>
                                 <div className="flex items-center gap-1 text-purple-600 font-bold uppercase text-xs tracking-wider mb-0.5">
                                    <RotateCcw size={12} /> Your Turn
                                 </div>
                                 <h3 className="text-lg font-black text-text-primary leading-none">
                                     Play the move
                                 </h3>
                             </div>
                        </div>

                        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                            
                            {mistakes > 0 ? (
                                <div className="animate-in fade-in slide-in-from-bottom-5">
                                    <p className="text-xl font-bold text-red-500 mb-2">Oops!</p>
                                    <p className="text-text-secondary mb-6">That wasn't quite right. Try again?</p>
                                </div>
                            ) : (
                                <p className="text-xl font-medium text-text-secondary mb-6">
                                    What did Buddy just teach you for <strong>{moveIndex % 2 === 0 ? "White" : "Black"}</strong>?
                                </p>
                            )}
                            
                             <div className="mt-4 p-4 bg-bg-tertiary rounded-lg text-sm text-text-muted border border-border-color">
                                <p className="italic">Make the move on the board to continue.</p>
                             </div>
                        </div>

                        {/* Hint Button? */}
                        <div className="p-6 border-t border-border-color bg-bg-secondary">
                           <button className="w-full py-3 border-2 border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-[var(--color-surface-highlight)] transition-colors">
                                I'm stuck, show me
                           </button>
                        </div>
                    </motion.div>
                )}
                
                {phase === 'summary' && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex flex-col h-full bg-bg-secondary"
                        key="summary"
                    >
                         <div className="p-8 flex-1 flex flex-col justify-center items-center text-center">
                            
                             <div className="relative mb-6">
                                <Confetti />
                                <DynamicMascot 
                                    size={128}
                                    mood="happy"
                                    className="drop-shadow-xl"
                                />
                            </div>

                            <h3 className="text-2xl font-black text-text-primary mb-2">You did it!</h3>
                            <p className="text-text-secondary mb-8">
                                I'm proud of you! You've mastered the <span className="text-blue-600 font-bold">{variation.name}</span>.
                            </p>
                             <button 
                                onClick={() => {
                                    addXp(50);
                                    onComplete();
                                }}
                                className="w-full py-4 bg-green-600 hover:bg-green-500 text-[var(--color-text-primary)] font-bold rounded-xl shadow-lg shadow-green-600/20 active:scale-95 transition-all"
                            >
                                Finish & Collect XP
                            </button>
                         </div>
                    </motion.div>
                )}
          </AnimatePresence>
      </div>
       <FreeAnalysisModal 
            isOpen={showAnalysis} 
            initialFen={game.fen()} 
            onClose={() => setShowAnalysis(false)} 
       />
    </div>
  );
};
