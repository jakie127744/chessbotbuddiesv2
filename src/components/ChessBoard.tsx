'use client';

import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { Chess } from 'chess.js';
import { twMerge } from 'tailwind-merge';
import { PromotionModal } from './PromotionModal';
import { usePieceStyle } from '../contexts/PieceStyleContext';
import { useBoardColorScheme } from '../contexts/BoardColorSchemeContext';
import { PIECE_SETS } from '@/lib/piece-sets';
import { PIECE_IMAGES_DATA } from '@/lib/piece-images';

const PIECE_IMAGES: Record<string, string> = {
    p: PIECE_IMAGES_DATA['wp'],
    r: PIECE_IMAGES_DATA['wr'],
    n: PIECE_IMAGES_DATA['wn'],
    b: PIECE_IMAGES_DATA['wb'],
    q: PIECE_IMAGES_DATA['wq'],
    k: PIECE_IMAGES_DATA['wk'],
};

const BLACK_PIECE_IMAGES: Record<string, string> = {
    p: PIECE_IMAGES_DATA['bp'],
    r: PIECE_IMAGES_DATA['br'],
    n: PIECE_IMAGES_DATA['bn'],
    b: PIECE_IMAGES_DATA['bb'],
    q: PIECE_IMAGES_DATA['bq'],
    k: PIECE_IMAGES_DATA['bk'],
};

// Map classifications to Icons and Colors (using text icons to match move quality table)
const CLASSIFICATION_STYLES: Record<string, { color: string, icon: string, bgColor: string }> = {
    'brilliant': { color: '#1bada6', icon: '!!', bgColor: 'bg-[#1bada6]' },
    'great': { color: '#5c8bb0', icon: '!', bgColor: 'bg-[#5c8bb0]' },
    'best': { color: '#9bc700', icon: '★', bgColor: 'bg-[#9bc700]' },
    'excellent': { color: '#96c459', icon: '✓', bgColor: 'bg-[#96c459]' },
    'good': { color: '#96c459', icon: '○', bgColor: 'bg-[#96c459]' },
    'book': { color: '#a88865', icon: '📖', bgColor: 'bg-[#a88865]' },
    'forced': { color: '#96c459', icon: '□', bgColor: 'bg-[#96c459]' },
    'inaccuracy': { color: '#f7c631', icon: '?!', bgColor: 'bg-[#f7c631]' },
    'mistake': { color: '#e68a00', icon: '?', bgColor: 'bg-[#e68a00]' },
    'missed win': { color: '#e68a00', icon: '⊘', bgColor: 'bg-[#e68a00]' },
    'missed draw': { color: '#9b59b6', icon: '½', bgColor: 'bg-[#9b59b6]' },
    'equalizer': { color: '#3498db', icon: '🛡️', bgColor: 'bg-[#3498db]' },
    'blunder': { color: '#ca3431', icon: '??', bgColor: 'bg-[#ca3431]' },
};

// Board color schemes
import { BoardColorScheme, BOARD_COLOR_SCHEMES } from '../redesign/lib/board-colors';

// Arrow type for displaying engine moves
export interface BoardArrow {
    from: string;
    to: string;
    color?: string;
    opacity?: number;
}

interface ChessBoardProps {
    game: Chess;
    onMove: (move: { from: string; to: string; promotion?: string }) => boolean;
    orientation?: 'white' | 'black';
    lastMove?: { from: string; to: string } | null;
    classification?: string | null;
    moveSquare?: string | null; // The destination square of the move to annotate
    bestMove?: { from: string; to: string } | null; // Best move for arrow (legacy, use arrows instead)
    arrows?: BoardArrow[]; // Multiple arrows for MultiPV support
    arePiecesDraggable?: boolean;
    selectablePieceTypes?: ('p' | 'n' | 'b' | 'r' | 'q' | 'k')[]; // Restrict which piece types can be selected (for minigames)
    customSquares?: Record<string, { icon?: any, color?: string, pulse?: boolean, highlightColor?: string, label?: string, pieceOpacity?: number }>;
    colorScheme?: BoardColorScheme;
    onSquareClick?: (square: string) => void;
    shouldAutoPromote?: boolean;
    onPieceDrop?: (piece: string, square: string) => void;
}

export function ChessBoard({ 
    game, 
    onMove, 
    orientation = 'white', 
    lastMove, 
    classification, 
    moveSquare, 
    bestMove,
    arrows = [],
    arePiecesDraggable = true,
    selectablePieceTypes,
    colorScheme: propColorScheme,
    customSquares,
    onSquareClick,
    shouldAutoPromote = false,
    onPieceDrop
}: ChessBoardProps) {
    const { colorScheme: contextColorScheme } = useBoardColorScheme();
    const { pieceStyle } = usePieceStyle();
    
    const colorScheme = propColorScheme || contextColorScheme || 'ocean';
    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
    const [promotionMove, setPromotionMove] = useState<{ from: string; to: string } | null>(null);

    // Detect touch device (mobile) - disable drag on touch, use tap-to-move instead
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    const board = game.board();
    const displayBoard = orientation === 'black' ? [...board].reverse().map(row => [...row].reverse()) : board;
    const colors = BOARD_COLOR_SCHEMES[colorScheme as keyof typeof BOARD_COLOR_SCHEMES];
    const pieceImages = PIECE_SETS[pieceStyle];

    // Helper to add alpha to hex colors for transparent overlays
    const withAlpha = (hex: string, alpha: number) => {
        const clean = hex.replace('#', '');
        const bigint = parseInt(clean, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const [focusedSquare, setFocusedSquare] = useState<string | null>(null);
    const [isMobileWidth, setIsMobileWidth] = useState(false);

    useEffect(() => {
        const updateIsMobile = () => setIsMobileWidth(window.innerWidth <= 768);
        updateIsMobile();
        window.addEventListener('resize', updateIsMobile);
        return () => window.removeEventListener('resize', updateIsMobile);
    }, []);

    // Allow drag on all devices (hybrid devices should support mouse drag)
    const enableDrag = arePiecesDraggable;

    function handleMove(source: string, target: string) {
        if (!arePiecesDraggable) return false;

        // Check if this is a pawn promotion move
        const piece = game.get(source as any);
        if (piece && piece.type === 'p') {
            const targetRank = target[1];
            if ((piece.color === 'w' && targetRank === '8') || (piece.color === 'b' && targetRank === '1')) {
                
                // VALIDATION: Ensure this is a legal move before showing modal
                const moves = game.moves({ verbose: true });
                const isLegal = moves.some(m => m.from === source && m.to === target && m.promotion);
                
                if (!isLegal) {
                     // If not legal (e.g. blocked), treat as normal move (which will fail validation below)
                     // or just return false immediately.
                     // Let's let it fall through to onMove default handling which usually returns false for illegal moves.
                } else {
                    if (shouldAutoPromote) {
                        // Auto-promote to Queen without dialog
                        const success = onMove({ from: source, to: target, promotion: 'q' });
                        if (success) {
                            setSelectedSquare(null);
                            setPossibleMoves([]);
                        }
                        return success;
                    } else {
                        setPromotionMove({ from: source, to: target });
                        return true;
                    }
                }
            }
        }
        
        // Normal move
        const success = onMove({ from: source, to: target });
        if (success) {
            setSelectedSquare(null);
            setPossibleMoves([]);
        }
        return success;
    }

    function handlePromotion(piece: 'q' | 'r' | 'b' | 'n') {
        if (!promotionMove) return;
        
        const success = onMove({ 
            from: promotionMove.from, 
            to: promotionMove.to, 
            promotion: piece 
        });
        
        if (success) {
            setSelectedSquare(null);
            setPossibleMoves([]);
        }
        
        setPromotionMove(null);
    }

    function updatePossibleMoves(square: string) {
        const moves = game.moves({ square: square as any, verbose: true });
        setPossibleMoves(moves.map(m => m.to));
    }

    // Keyboard Navigation Handler
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!arePiecesDraggable) return;
        
        // If no square is focused, focusing the board starts at e4 (or some logical center)
        const currentSquare = focusedSquare || 'e4';
        const fileCodes = 'abcdefgh';
        const currentFileIdx = fileCodes.indexOf(currentSquare[0]);
        const currentRank = parseInt(currentSquare[1]);

        let nextFileIdx = currentFileIdx;
        let nextRank = currentRank;

        // Invert controls if board is flipped? 
        // Standard accessible pattern: Up arrow usually goes visually UP. 
        // If board is flipped (Black at bottom), Rank 1 is top? No, Rank 8 is bottom.
        // Let's stick to logical chess coordinates (Up = Higher Rank) but flip if orientation is black.
        
        const isBlackOrientation = orientation === 'black';

        switch (e.key) {
            case 'ArrowUp':
                nextRank = isBlackOrientation ? currentRank - 1 : currentRank + 1;
                break;
            case 'ArrowDown':
                nextRank = isBlackOrientation ? currentRank + 1 : currentRank - 1;
                break;
            case 'ArrowRight':
                nextFileIdx = isBlackOrientation ? currentFileIdx - 1 : currentFileIdx + 1;
                break;
            case 'ArrowLeft':
                nextFileIdx = isBlackOrientation ? currentFileIdx + 1 : currentFileIdx - 1;
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                handleSquareClick(currentSquare);
                return;
            default:
                return;
        }

        // Clamp to board
        if (nextRank >= 1 && nextRank <= 8 && nextFileIdx >= 0 && nextFileIdx <= 7) {
            e.preventDefault();
            const nextSquare = `${fileCodes[nextFileIdx]}${nextRank}`;
            setFocusedSquare(nextSquare);
        }
    };

    function handleSquareClick(squareRep: string) {
        if (onSquareClick) {
            onSquareClick(squareRep);
        }

        if (!arePiecesDraggable) return;

        if (selectedSquare) {
            if (squareRep === selectedSquare) {
                setSelectedSquare(null);
                setPossibleMoves([]);
                return;
            }

            const success = handleMove(selectedSquare, squareRep);
            if (success) return;

            const piece = game.get(squareRep as any);
            if (piece && piece.color === game.turn()) {
                // Check if this piece type is selectable (for minigames with restricted pieces)
                if (selectablePieceTypes && !selectablePieceTypes.includes(piece.type)) {
                    setSelectedSquare(null);
                    setPossibleMoves([]);
                    return;
                }
                setSelectedSquare(squareRep);
                updatePossibleMoves(squareRep);
                return;
            }

            setSelectedSquare(null);
            setPossibleMoves([]);
        } else {
            const piece = game.get(squareRep as any);
            if (piece && piece.color === game.turn()) {
                // Check if this piece type is selectable (for minigames with restricted pieces)
                if (selectablePieceTypes && !selectablePieceTypes.includes(piece.type)) {
                    return; // Piece type not allowed
                }
                setSelectedSquare(squareRep);
                updatePossibleMoves(squareRep);
            }
        }
    }
    
    // Helper to get coordinates for a square center (0-100%)
    // In SVG, Y=0 is top, Y=100 is bottom
    // In chess, rank 1 is at bottom (for White), rank 8 is at top
    const getSquareCenter = (square: string) => {
        const file = square.charCodeAt(0) - 97; // 0-7 (a=0, h=7)
        const rank = parseInt(square[1]) - 1; // 0-7 (1=0, 8=7)
        
        // Calculate X position (file)
        // For White orientation: a=left, h=right
        // For Black orientation: h=left, a=right
        const xIndex = orientation === 'black' ? 7 - file : file;
        
        // Calculate Y position (rank)
        // For White orientation: rank 8=top (y=0), rank 1=bottom (y=100)
        // For Black orientation: rank 1=top (y=0), rank 8=bottom (y=100)
        const yIndex = orientation === 'black' ? rank : 7 - rank;
        
        return {
            x: xIndex * 12.5 + 6.25,  // Center of square (12.5% per square)
            y: yIndex * 12.5 + 6.25   // No double inversion - yIndex already correct
        };
    };

    const boardSquareStyle: CSSProperties = isMobileWidth
        ? {
            width: 'calc(100vw - 24px)',
            maxWidth: 'calc(100vw - 24px)',
            aspectRatio: '1 / 1',
            height: 'auto',
        }
        : {
            width: '100cqmin',
            height: '100cqmin',
            maxWidth: '100%',
            maxHeight: '100%',
        };

    return (
        <div 
            className="relative w-full h-full flex items-center justify-center overflow-hidden" 
            style={{ containerType: 'size' }}
        >
            <div 
                className="relative shadow-2xl overflow-hidden flex items-center justify-center rounded-lg"
                style={boardSquareStyle}
            >
                <div 
                    className="grid grid-cols-8 grid-rows-8 w-full h-full relative z-10 focus:outline-none"
                    tabIndex={0}
                    role="grid"
                    aria-label="Chess Board. Use Arrow keys to navigate, Enter to select."
                    onKeyDown={handleKeyDown}
                    onFocus={(e) => {
                        // Only highlight 'e4' if navigating via keyboard
                        try {
                            if (e.target.matches(':focus-visible') && !focusedSquare) setFocusedSquare('e4');
                        } catch(err) {
                            // Fallback for older browsers
                        }
                    }}
                    onBlur={() => setFocusedSquare(null)}
                >
                    {(() => {
                        const colors = BOARD_COLOR_SCHEMES[colorScheme as keyof typeof BOARD_COLOR_SCHEMES] || BOARD_COLOR_SCHEMES['ocean'];
                        return displayBoard.map((row, rankIndex) =>
                            row.map((square, fileIndex) => {
                            const isDark = (rankIndex + fileIndex) % 2 === 1;
                            const actualRank = orientation === 'black' ? rankIndex : 7 - rankIndex;
                            const actualFile = orientation === 'black' ? 7 - fileIndex : fileIndex;
                            const squareRep = `${'abcdefgh'[actualFile]}${actualRank + 1}`;
                            
                            const isSelected = selectedSquare === squareRep;
                            const isFocused = focusedSquare === squareRep;
                            const isPossibleMove = possibleMoves.includes(squareRep);
                            const isCheck = game.inCheck() && square?.type === 'k' && square.color === game.turn();
                            
                            const isLastMoveFrom = lastMove?.from === squareRep;
                            const isLastMoveTo = lastMove?.to === squareRep;
                            const isLastMove = isLastMoveFrom || isLastMoveTo;

                            const showEvalIcon = classification && moveSquare === squareRep;
                            const evalStyle = classification ? CLASSIFICATION_STYLES[classification.toLowerCase()] : null;
                            
                            const customStyle = customSquares?.[squareRep];

                            const pieceName = square ? `${square.color === 'w' ? 'White' : 'Black'} ${
                                square.type === 'p' ? 'Pawn' : 
                                square.type === 'n' ? 'Knight' : 
                                square.type === 'b' ? 'Bishop' : 
                                square.type === 'r' ? 'Rook' : 
                                square.type === 'q' ? 'Queen' : 'King'
                            }` : 'Empty';
                            
                            const squareLabel = `${squareRep} ${pieceName} ${isSelected ? 'Selected' : ''} ${isPossibleMove ? 'Target' : ''}`;

                            return (
                                <div
                                    key={squareRep}
                                    role="gridcell"
                                    aria-label={squareLabel}
                                    aria-selected={isSelected}
                                    onClick={() => handleSquareClick(squareRep)}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const sourceSquare = e.dataTransfer.getData("sourceSquare");
                                        const placementPiece = e.dataTransfer.getData("placementPiece");

                                        if (sourceSquare) {
                                            handleMove(sourceSquare, squareRep);
                                        } else if (placementPiece && onPieceDrop) {
                                            onPieceDrop(placementPiece, squareRep);
                                        }
                                    }}
                                    style={{
                                        backgroundColor: isCheck ? undefined : 
                                                        isSelected ? undefined : 
                                                        isLastMove ? undefined : 
                                                        (isDark ? colors.dark : colors.light)
                                    }}
                                    className={twMerge(
                                        "relative flex items-center justify-center w-full h-full cursor-pointer",
                                        isLastMove && !isSelected && !isCheck && "bg-[#fff952]/40",
                                        isSelected && "ring-inset ring-4 ring-[#eab308]",
                                        isFocused && !isSelected && "ring-inset ring-4 ring-blue-500 z-30",
                                        isPossibleMove && !square && "after:content-[''] after:w-4 after:h-4 after:bg-[#14213d]/20 after:rounded-full",
                                        isPossibleMove && square && "ring-inset ring-8 ring-[#14213d]/20",
                                        isCheck && "bg-red-500/80"
                                    )}
                                >
                                    {customStyle?.highlightColor && (
                                        <div 
                                            className="absolute inset-0 z-10" 
                                            style={{ backgroundColor: customStyle.highlightColor }} 
                                        />
                                    )}

                                    {customStyle?.label && (
                                        <div className="absolute inset-0 flex items-end justify-center pb-1 z-20 pointer-events-none">
                                            <span className="text-[10px] font-bold text-white bg-black/50 px-1 rounded backdrop-blur-[1px]">
                                                {customStyle.label}
                                            </span>
                                        </div>
                                    )}

                                    {customStyle?.icon && (
                                        <div className={`absolute inset-0 flex items-center justify-center z-20 pointer-events-none opacity-80 ${customStyle.pulse ? 'animate-pulse' : ''}`}>
                                            <customStyle.icon 
                                                size={32} 
                                                className="drop-shadow-lg"
                                                style={{ color: customStyle.color }} 
                                                strokeWidth={2}
                                            />
                                        </div>
                                    )}

                                    {square && (
                                        <img
                                            src={square.color === 'w' ? pieceImages.white[square.type] : pieceImages.black[square.type]}
                                            alt={`${square.color}${square.type}`}
                                            draggable={enableDrag}
                                            onDragStart={(e) => {
                                                if (!enableDrag) {
                                                    e.preventDefault();
                                                    return;
                                                }
                                                if (selectablePieceTypes && !selectablePieceTypes.includes(square.type)) {
                                                    e.preventDefault();
                                                    return;
                                                }
                                                if (square.color !== game.turn()) {
                                                    e.preventDefault();
                                                    return;
                                                }
                                                e.dataTransfer.setData("sourceSquare", squareRep);
                                                e.dataTransfer.effectAllowed = "move";
                                            }}
                                            className={twMerge(
                                                "w-[85%] h-[85%] select-none cursor-pointer z-10",
                                                square.color === 'w' ? "drop-shadow-lg" : "",
                                                !arePiecesDraggable && "cursor-default"
                                            )}
                                            style={{ opacity: customStyle?.pieceOpacity ?? 1 }}
                                        />
                                    )}

                                    {showEvalIcon && evalStyle && (
                                        <div className={`absolute top-0 right-0 w-6 h-6 ${evalStyle.bgColor} rounded-bl-lg z-20 flex items-center justify-center shadow-lg border border-white/20`}>
                                            <span className="text-white text-xs font-bold leading-none">{evalStyle.icon}</span>
                                        </div>
                                    )}

                                    {fileIndex === 0 && (
                                        <span className={twMerge(
                                            "absolute top-0.5 left-0.5 text-[10px] font-bold select-none",
                                            isDark ? "text-[#f0f9ff]" : "text-[#5ec2f2]"
                                        )}>
                                            {8 - rankIndex}
                                        </span>
                                    )}
                                    {rankIndex === 7 && (
                                        <span className={twMerge(
                                            "absolute bottom-0.5 right-0.5 text-[10px] font-bold select-none",
                                            isDark ? "text-[#f0f9ff]" : "text-[#5ec2f2]"
                                        )}>
                                            {String.fromCharCode(97 + fileIndex)}
                                        </span>
                                    )}
                                </div>
                            );
                        }));
                    })()}
                </div>

                <svg className="absolute inset-0 pointer-events-none z-50 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {arrows.map((arrow, index) => {
                        const start = getSquareCenter(arrow.from);
                        const end = getSquareCenter(arrow.to);
                        const color = arrow.color || '#22c55e';
                        const dx = end.x - start.x;
                        const dy = end.y - start.y;
                        const angle = Math.atan2(dy, dx);
                        const headSize = 6;
                        const strokeWidth = Math.max(1, 2.5 - index * 0.3);
                        const opacity = arrow.opacity ?? (0.6 - index * 0.1);
                        const lineEndX = end.x - Math.cos(angle) * headSize * 0.5;
                        const lineEndY = end.y - Math.sin(angle) * headSize * 0.5;
                        const headPath = `M ${end.x} ${end.y} L ${end.x - headSize * Math.cos(angle - 0.5)} ${end.y - headSize * Math.sin(angle - 0.5)} L ${end.x - headSize * Math.cos(angle + 0.5)} ${end.y - headSize * Math.sin(angle + 0.5)} Z`;

                        return (
                            <g key={`arrow-${index}`} opacity={opacity} style={{ color }}>
                                <line 
                                    x1={start.x} y1={start.y} 
                                    x2={lineEndX} y2={lineEndY} 
                                    stroke="currentColor"
                                    strokeWidth={strokeWidth}
                                    strokeLinecap="round"
                                />
                                <path 
                                    d={headPath}
                                    fill="currentColor"
                                />
                            </g>
                        );
                    })}
                    
                    {bestMove && arrows.length === 0 && (
                        (() => {
                            const start = getSquareCenter(bestMove.from as any);
                            const end = getSquareCenter(bestMove.to as any);
                            const dx = end.x - start.x;
                            const dy = end.y - start.y;
                            const angle = Math.atan2(dy, dx);
                            const headSize = 6;
                            const lineEndX = end.x - Math.cos(angle) * headSize * 0.5;
                            const lineEndY = end.y - Math.sin(angle) * headSize * 0.5;
                            const headPath = `M ${end.x} ${end.y} L ${end.x - headSize * Math.cos(angle - 0.5)} ${end.y - headSize * Math.sin(angle - 0.5)} L ${end.x - headSize * Math.cos(angle + 0.5)} ${end.y - headSize * Math.sin(angle + 0.5)} Z`;

                            return (
                                <g opacity="0.6" style={{ color: '#22c55e' }}>
                                    <line 
                                        x1={start.x} y1={start.y} 
                                        x2={lineEndX} y2={lineEndY} 
                                        stroke="currentColor" 
                                        strokeWidth="2.5" 
                                        strokeLinecap="round"
                                    />
                                    <path 
                                        d={headPath}
                                        fill="currentColor"
                                    />
                                </g>
                            );
                        })()
                    )}
                </svg>

                {promotionMove && (
                    <PromotionModal
                        isOpen={!!promotionMove}
                        color={game.get(promotionMove.from as any)?.color || 'w'}
                        onSelect={handlePromotion}
                        onClose={() => setPromotionMove(null)}
                    />
                )}
            </div>
        </div>
    );
}
