import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { RotateCcw, Undo2, Upload, FileText, Hash, Bot, Clock, ChevronLeft, ChevronRight, Microscope, X, Trophy, Flag, RefreshCw, Handshake } from 'lucide-react';
import { ImportModal } from './ImportModal';
import { useGameAnalysis } from '@/hooks/useGameAnalysis';
import { CLASSIFICATION_COLORS, CLASSIFICATION_ICONS } from '@/lib/analysis-utils';
import { useRewards } from "@/contexts/RewardsContext";
import { formatTime } from "@/lib/utils";

interface GameInfoProps {
    game: Chess;
    onUndo: () => void;
    onReset: () => void;
    onImport: (type: 'PGN' | 'FEN', data: string) => void;
    isVsComputer: boolean;
    onToggleVsComputer: () => void;
    whiteTime?: number;
    blackTime?: number;
    gameStatus?: string;
    isThinking?: boolean;
    thinkingBotName?: string; // Name of the bot that is thinking
    isReviewMode?: boolean;
    onToggleReviewMode?: () => void;
    reviewMoveIndex?: number;
    onReviewNavigate?: (moveIndex: number) => void;
    totalMoves?: number;
    whitePlayer?: string;
    blackPlayer?: string;
    // Analysis Props
    analyzedMoves?: any[];
    isAnalyzing?: boolean;
    onFlipBoard?: () => void;
    onResign?: () => void;
    onOfferDraw?: () => void;
    onSwitchSides?: () => void;
}

export function GameInfo({ 
    game, onUndo, onReset, onImport, isVsComputer, onToggleVsComputer, 
    whiteTime, blackTime, gameStatus, isThinking, thinkingBotName,
    isReviewMode = false, onToggleReviewMode, reviewMoveIndex = -1, onReviewNavigate, totalMoves = 0,
    whitePlayer = 'White', blackPlayer = 'Black',
    analyzedMoves = [], isAnalyzing = false,
    onFlipBoard, onResign, onOfferDraw, onSwitchSides
}: GameInfoProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'PGN' | 'FEN'>('PGN');

    const { addXp, addStar, checkGameEndAchievements } = useRewards();
    const rewardsProcessedRef = useRef(false);

    // Consistently scroll the active move into view
    useEffect(() => {
        if (reviewMoveIndex >= 0) {
            const element = document.getElementById('active-move-scroll-target');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [reviewMoveIndex]);

    // Keyboard Navigation for Review
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!onReviewNavigate) return;
            
            // Should we block if user types in an input? (Not implemented, but good practice)
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            const maxMoves = (totalMoves || game.history().length) - 1;

            if (e.key === 'ArrowLeft') {
                if (!isReviewMode && onToggleReviewMode) onToggleReviewMode();
                onReviewNavigate(Math.max(-1, reviewMoveIndex - 1));
            } else if (e.key === 'ArrowRight') {
                 if (!isReviewMode && onToggleReviewMode) onToggleReviewMode();
                onReviewNavigate(Math.min(maxMoves, reviewMoveIndex + 1));
            } else if (e.key === 'ArrowUp') {
                 if (!isReviewMode && onToggleReviewMode) onToggleReviewMode();
                onReviewNavigate(-1); // Start
            } else if (e.key === 'ArrowDown') {
                 if (!isReviewMode && onToggleReviewMode) onToggleReviewMode();
                onReviewNavigate(maxMoves); // End
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isReviewMode, reviewMoveIndex, totalMoves, game, onReviewNavigate, onToggleReviewMode]);

    const history = game.history();
    const turn = game.turn() === 'w' ? 'White' : 'Black';
    const inCheck = game.inCheck();
    const isGameOver = game.isGameOver();
    const moveNumber = Math.floor(history.length / 2) + 1;

    const handleExportPGN = () => {
        // Set PGN headers
        game.header('Event', 'Chess Training Game');
        game.header('Site', 'Local');
        game.header('Date', new Date().toISOString().split('T')[0].replace(/-/g, '.'));
        game.header('White', whitePlayer);
        game.header('Black', blackPlayer);
        // Calculate result
        let result = '*';
        if (game.isCheckmate()) result = game.turn() === 'w' ? '0-1' : '1-0';
        else if (game.isDraw()) result = '1/2-1/2';
        else if (gameStatus?.includes('White wins')) result = '1-0';
        else if (gameStatus?.includes('Black wins')) result = '0-1';
        
        game.header('Result', result);

        const pgn = game.pgn({ maxWidth: 65, newline: '\n' });
        const blob = new Blob([pgn], { type: 'application/x-chess-pgn' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chess_game_${new Date().toISOString().slice(0,10)}.pgn`;
        document.body.appendChild(a); // Required for Firefox sometimes
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    let status = `${turn}'s Turn`;
    if (isThinking) status = `${thinkingBotName || turn} is thinking...`;
    if (inCheck) status = `${turn} is in Check!`;
    if (isGameOver) {
        if (game.isCheckmate()) status = `Checkmate! ${turn === 'White' ? 'Black' : 'White'} wins!`;
        else if (game.isDraw()) status = 'Draw!';
        else status = 'Game Over';
    }
    if (gameStatus) {
        status = gameStatus;
    }

    // Group moves into pairs (White, Black)
    const movePairs = [];
    for (let i = 0; i < history.length; i += 2) {
        movePairs.push({
            num: Math.floor(i / 2) + 1,
            white: history[i],
            black: history[i + 1] || '',
        });
    }

    const handleCopyFen = () => {
        navigator.clipboard.writeText(game.fen());
    };

    return (
        <>
            <div className="w-full max-w-md bg-[var(--color-bg-secondary)] rounded-3xl border-2 border-[var(--color-border)] p-6 flex flex-col gap-6 h-[800px] shadow-xl transition-colors">
                {/* Status Header */}
                <div className="text-center space-y-2 border-b border-[var(--color-border)] pb-4">
                    <h2 className={`text-2xl font-black font-display ${inCheck || isGameOver || gameStatus ? 'text-red-500' : 'text-[var(--color-text-primary)]'}`}>
                        {status}
                    </h2>
                    <div className="text-[var(--color-text-muted)] text-sm font-bold uppercase tracking-widest font-sans">Move {moveNumber}</div>
                    
                    {/* Analysis Progress */}
                    {isReviewMode && isAnalyzing && (
                        <div className="mt-2 text-center">
                            <div className="text-xs text-sunny-yellow font-bold bg-deep-navy/90 px-2 py-1 rounded inline-block">Analyzing game...</div>
                            <div className="text-xs text-[var(--color-text-muted)] mt-1">{analyzedMoves.length} / {history.length} moves</div>
                        </div>
                    )}
                    
                    {/* Game Over Actions */ }
                    {(isGameOver || gameStatus) && !isReviewMode && onToggleReviewMode && (
                        <div className="mt-4">
                             <button 
                                onClick={onToggleReviewMode}
                                className="w-full py-3 bg-sunny-yellow hover:bg-yellow-400 text-deep-navy font-black rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 animate-pulse"
                            >
                                <Microscope size={20} />
                                Review Game
                             </button>
                        </div>
                    )}
                </div>

                {/* Timers */}
                {(whiteTime !== undefined && blackTime !== undefined) && (
                    <div className="flex gap-4">
                        <div className={`flex-1 p-3 rounded-2xl border-2 flex items-center justify-between transition-colors ${game.turn() === 'w' && !isGameOver && !gameStatus ? 'bg-[var(--color-primary)] text-[#1b1b1b] border-[var(--color-primary)] shadow-md shadow-[rgba(255,202,56,0.25)]' : 'bg-[var(--color-bg-tertiary)] text-[#97af8b] border-[var(--color-border)]'}`}>
                            <div className="font-bold text-sm">White</div>
                            <div className="font-mono text-xl font-bold flex items-center gap-2">
                                <Clock size={16} />
                                {formatTime(whiteTime)}
                            </div>
                        </div>
                        <div className={`flex-1 p-3 rounded-2xl border-2 flex items-center justify-between transition-colors ${game.turn() === 'b' && !isGameOver && !gameStatus ? 'bg-[var(--color-primary)] text-[#1b1b1b] border-[var(--color-primary)] shadow-md shadow-[rgba(255,202,56,0.25)]' : 'bg-[var(--color-bg-tertiary)] text-[#97af8b] border-[var(--color-border)]'}`}>
                            <div className="font-bold text-sm">Black</div>
                            <div className="font-mono text-xl font-bold flex items-center gap-2">
                                <Clock size={16} />
                                {formatTime(blackTime)}
                            </div>
                        </div>
                    </div>
                )}

                {/* Move History */}
                <div className="flex-1 overflow-auto custom-scrollbar bg-[var(--color-bg-primary)] rounded-xl border border-[#243354] p-2 relative flex flex-col">
                    <div className="flex-1 min-h-0 overflow-auto">
                        <div className="grid grid-cols-[3rem_1fr_1fr] gap-2 text-sm">
                            <div className="font-bold text-[var(--color-text-muted)] border-b border-[#243354] pb-2 pl-2">#</div>
                            <div className="font-bold text-[var(--color-text-primary)] border-b border-[#243354] pb-2">White</div>
                            <div className="font-bold text-[var(--color-text-primary)] border-b border-[#243354] pb-2">Black</div>

                            {movePairs.map((pair) => {
                                const whiteIdx = (pair.num - 1) * 2;
                                const blackIdx = whiteIdx + 1;
                                const whiteAnalysis = analyzedMoves[whiteIdx];
                                const blackAnalysis = analyzedMoves[blackIdx];
                                
                                // Check if this row contains the current review move
                                const isCurrentWhite = reviewMoveIndex === whiteIdx;
                                const isCurrentBlack = reviewMoveIndex === blackIdx;

                                return (
                                    <div key={pair.num} className="contents group">
                                        <div className="text-[var(--color-text-muted)] font-mono py-1 pl-2 font-bold">{pair.num}.</div>
                                        <div 
                                            id={isCurrentWhite ? "active-move-scroll-target" : undefined}
                                            className={`flex items-center gap-1 py-1 rounded px-2 transition-colors cursor-pointer ${isCurrentWhite ? 'bg-[#5ec2f2] text-[var(--color-text-primary)] shadow-sm' : 'bg-transparent hover:bg-[var(--color-bg-tertiary)]'}`}
                                            onClick={() => onReviewNavigate?.(whiteIdx)}
                                        >
                                            <span className={`font-bold ${isCurrentWhite ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-primary)]"}`}>{pair.white}</span>
                                            {isReviewMode && whiteAnalysis && (
                                                <div className="ml-auto flex items-center gap-1">
                                                    <span className="text-[10px] font-mono text-[var(--color-text-muted)] font-bold">
                                                        {whiteAnalysis.evaluation > 0 ? '+' : ''}{(whiteAnalysis.evaluation / 100).toFixed(1)}
                                                    </span>
                                                    <span 
                                                        className="w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold text-[var(--color-text-primary)] shadow-sm"
                                                        style={{ backgroundColor: CLASSIFICATION_COLORS[whiteAnalysis.classification as keyof typeof CLASSIFICATION_COLORS] }}
                                                        title={whiteAnalysis.classification}
                                                    >
                                                        {CLASSIFICATION_ICONS[whiteAnalysis.classification as keyof typeof CLASSIFICATION_ICONS]}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div 
                                            id={isCurrentBlack ? "active-move-scroll-target" : undefined}
                                            className={`flex items-center gap-1 py-1 rounded px-2 transition-colors cursor-pointer ${isCurrentBlack ? 'bg-[#5ec2f2] text-[var(--color-text-primary)] shadow-sm' : 'bg-transparent hover:bg-[var(--color-bg-tertiary)]'}`}
                                            onClick={() => onReviewNavigate?.(blackIdx)}
                                        >
                                            <span className={`font-bold ${isCurrentBlack ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-primary)]"}`}>{pair.black}</span>
                                            {isReviewMode && blackAnalysis && (
                                                <div className="ml-auto flex items-center gap-1">
                                                    <span className="text-[10px] font-mono text-[var(--color-text-muted)] font-bold">
                                                        {blackAnalysis.evaluation > 0 ? '+' : ''}{(blackAnalysis.evaluation / 100).toFixed(1)}
                                                    </span>
                                                    <span 
                                                        className="w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold text-[var(--color-text-primary)] shadow-sm"
                                                        style={{ backgroundColor: CLASSIFICATION_COLORS[blackAnalysis.classification as keyof typeof CLASSIFICATION_COLORS] }}
                                                        title={blackAnalysis.classification}
                                                    >
                                                        {CLASSIFICATION_ICONS[blackAnalysis.classification as keyof typeof CLASSIFICATION_ICONS]}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation Controls (Fixed at bottom of history) */}
                    {onReviewNavigate && (
                        <div className="flex gap-2 pt-2 mt-2 border-t border-[#243354] shrink-0">
                            <button
                                onClick={() => {
                                    if (!isReviewMode && onToggleReviewMode) onToggleReviewMode();
                                    onReviewNavigate(Math.max(-1, reviewMoveIndex - 1));
                                }}
                                disabled={reviewMoveIndex <= -1}
                                className="flex-1 py-2 bg-[var(--color-bg-tertiary)] hover:bg-[#2d3d5e] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-text-primary)] rounded-lg flex items-center justify-center gap-2 transition-colors font-bold text-sm"
                                title="Previous Move (Left Arrow)"
                            >
                                <ChevronLeft size={16} /> Prev
                            </button>
                            <button
                                onClick={() => {
                                    if (!isReviewMode && onToggleReviewMode) onToggleReviewMode();
                                    onReviewNavigate(Math.min((totalMoves || game.history().length) - 1, reviewMoveIndex + 1));
                                }}
                                disabled={reviewMoveIndex >= (totalMoves || game.history().length) - 1}
                                className="flex-1 py-2 bg-[var(--color-bg-tertiary)] hover:bg-[#2d3d5e] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-text-primary)] rounded-lg flex items-center justify-center gap-2 transition-colors font-bold text-sm"
                                title="Next Move (Right Arrow)"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Tools */}
                <div className="pt-4 border-t border-[#243354] grid grid-cols-4 gap-2">
                    <button onClick={onUndo} className="p-2 bg-[var(--color-bg-tertiary)] hover:bg-[#2d3d5e] text-[var(--color-text-primary)] rounded-xl flex items-center justify-center gap-2 transition-colors" title="Undo Last Move">
                        <Undo2 size={18} />
                    </button>
                    
                    {/* Game Controls - Only show during active game */}
                    {!gameStatus && !game.isGameOver() && (
                        <>
                             {onSwitchSides && (
                                <button onClick={onSwitchSides} className="p-2 bg-[var(--color-bg-tertiary)] hover:bg-[#2d3d5e] text-[var(--color-text-primary)] rounded-xl flex items-center justify-center gap-2 transition-colors" title="Switch Sides">
                                    <RefreshCw size={18} className="text-[#5ec2f2]" />
                                </button>
                             )}
                             {onOfferDraw && (
                                <button onClick={onOfferDraw} className="p-2 bg-[var(--color-bg-tertiary)] hover:bg-[#2d3d5e] text-[var(--color-text-primary)] rounded-xl flex items-center justify-center gap-2 transition-colors" title="Offer Draw">
                                    <Handshake size={18} className="text-amber-500" />
                                </button>
                             )}
                             {onResign && (
                                <button onClick={onResign} className="p-2 bg-[var(--color-bg-tertiary)] hover:bg-[#2d3d5e] text-[var(--color-text-primary)] rounded-xl flex items-center justify-center gap-2 transition-colors" title="Resign">
                                    <Flag size={18} className="text-[#ff7b6b]" />
                                </button>
                             )}
                        </>
                    )}

                    <button onClick={onReset} className="p-2 bg-[var(--color-bg-tertiary)] hover:bg-[#2d3d5e] text-[var(--color-text-primary)] rounded-xl flex items-center justify-center gap-2 transition-colors" title="Reset Game">
                        <RotateCcw size={18} />
                    </button>

                    {onFlipBoard && (
                        <button onClick={onFlipBoard} className="p-2 bg-[var(--color-bg-tertiary)] hover:bg-[#2d3d5e] text-[var(--color-text-primary)] rounded-xl flex items-center justify-center gap-2 transition-colors" title="Flip Board">
                            <Upload size={18} className="rotate-90" />
                        </button>
                    )}

                    <button onClick={() => { setModalType('PGN'); setModalOpen(true); }} className="p-2 bg-[var(--color-bg-tertiary)] hover:bg-[#2d3d5e] text-[var(--color-text-primary)] rounded-xl flex items-center justify-center gap-2 transition-colors" title="Import PGN">
                        <Upload size={18} /> <span className="text-xs font-bold">PGN</span>
                    </button>

                    <button onClick={() => { setModalType('FEN'); setModalOpen(true); }} className="p-2 bg-[var(--color-bg-tertiary)] hover:bg-[#2d3d5e] text-[var(--color-text-primary)] rounded-xl flex items-center justify-center gap-2 transition-colors" title="Set FEN">
                        <Hash size={18} />
                    </button>

                    <button onClick={handleExportPGN} disabled={history.length === 0} className="col-span-2 p-2 bg-[#69e0a3] hover:bg-[#87ab3e] disabled:bg-[var(--color-bg-tertiary)] disabled:text-[var(--color-text-muted)] text-[var(--color-text-primary)] rounded-xl flex items-center justify-center gap-2 transition-colors text-xs font-bold shadow-sm" title="Export PGN">
                        <FileText size={14} /> Export PGN
                    </button>

                    <button onClick={handleCopyFen} className="col-span-2 p-2 bg-[var(--color-bg-tertiary)] hover:bg-[#2d3d5e] text-[var(--color-text-primary)] rounded-xl flex items-center justify-center gap-2 transition-colors text-xs font-bold" title="Copy FEN">
                        <Hash size={14} /> Copy FEN
                    </button>



                    {!isReviewMode && (
                        <button
                            onClick={onToggleVsComputer}
                            className={`col-span-4 p-2 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold ${isVsComputer ? 'bg-[#5ec2f2] hover:bg-[#5b8baf] text-[var(--color-text-primary)] shadow-md' : 'bg-[var(--color-bg-tertiary)] hover:bg-[#2d3d5e] text-[var(--color-text-primary)]'}`}
                        >
                            <Bot size={18} /> {isVsComputer ? 'Bot Active' : 'Play vs Bot'}
                        </button>
                    )}
                </div>
            </div>

            <ImportModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onImport={(data) => onImport(modalType, data)}
                type={modalType}
            />
        </>
    );
}
