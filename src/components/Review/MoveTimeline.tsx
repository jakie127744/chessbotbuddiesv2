import { AnalyzedMove, CLASSIFICATION_COLORS } from '@/lib/analysis-utils';

interface MoveTimelineProps {
    moves: AnalyzedMove[];
    currentMoveIndex: number;
    onMoveClick: (index: number) => void;
}

export function MoveTimeline({ moves, currentMoveIndex, onMoveClick }: MoveTimelineProps) {
    if (moves.length === 0) return null;

    return (
        <div className="w-full bg-neutral-900 border-t border-neutral-800 p-2 overflow-x-auto hide-scrollbar">
             <div className="flex items-center gap-1 min-w-max px-2">
                <button
                    onClick={() => onMoveClick(-1)}
                    className={`h-8 w-2 rounded-sm transition-all ${currentMoveIndex === -1 ? 'bg-white h-10' : 'bg-neutral-700 hover:bg-neutral-600'}`}
                    title="Start"
                />
                
                {moves.map((move, i) => {
                    const color = CLASSIFICATION_COLORS[move.classification];
                    const isSelected = currentMoveIndex === i;
                    
                    // Height varies by quality? Or simplified dots like chess.com?
                    // Chess.com checks:
                    // Best: Full height
                    // Blunder: Full height but red
                    // Mistake: Orange
                    // Actually they use same height boxes or columns.
                    
                    // Let's use simple vertical bars that grow when selected
                    const heightClass = isSelected ? 'h-10' : 'h-6 hover:h-8';
                    const widthClass = isSelected ? 'w-4' : 'w-2';

                    return (
                        <button
                            key={i}
                            onClick={() => onMoveClick(i)}
                            className={`rounded-sm transition-all duration-200 ${heightClass} ${widthClass} ring-1 ring-white/10 ${isSelected ? 'shadow-lg' : ''}`}
                            style={{ 
                                backgroundColor: color,
                                boxShadow: isSelected ? `0 0 12px ${color}` : undefined
                            }}
                            title={`${move.moveNumber}${move.color === 'w' ? '.' : '...'} ${move.san} (${move.classification})`}
                        />
                    );
                })}
             </div>
        </div>
    );
}
