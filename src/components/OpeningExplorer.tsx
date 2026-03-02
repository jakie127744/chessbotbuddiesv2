import { useState, useMemo } from 'react';
import { Chess } from 'chess.js';
import { OpeningVariation, DEFAULT_REPERTOIRE } from '@/lib/openings-repertoire';
import { ChessBoard } from '@/components/ChessBoard';
import { ChevronRight, GitBranch, Play, RefreshCw } from 'lucide-react';

interface OpeningExplorerProps {
  onSelectVariation: (variation: OpeningVariation) => void;
  onClose: () => void;
}

interface TreeNode {
  fen: string;
  move: string;
  children: TreeNode[];
  variations: OpeningVariation[]; // Variations that pass through this node
  ply: number;
}

export function OpeningExplorer({ onSelectVariation, onClose }: OpeningExplorerProps) {
  const [currentFen, setCurrentFen] = useState<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [history, setHistory] = useState<string[]>([]); // Array of FENs

  // Build the tree dynamically based on current FEN?
  // Or just find all moves from current FEN that appear in ANY variation.
  
  const availableMoves = useMemo(() => {
    const moves = new Map<string, { san: string, uci: string, variations: OpeningVariation[] }>();
    
    // For each variation
    DEFAULT_REPERTOIRE.forEach(variation => {
        // Replay to find if it matches current FEN
        const tempGame = new Chess();
        
        // Optimization: We could pre-calculate FENs for all variations, but runtime replay is okay for <100 variations.
        // To speed up, we only check variations that confirm to our history?
        // Actually, easiest is to check: Does this variation START with the moves we made so far?
        // But we store History as FENs? Moves are better.
        
        // Let's rely on FEN matching for robustness against transpositions.
        // Replay full variation.
        let matchIndex = -1;
        
        // Check if root
        if (currentFen === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
            matchIndex = 0;
            // The move to play is variation.moves[0]
        } else {
             // Replay variation to find current FEN
             for (let i = 0; i < variation.moves.length; i++) {
                 // Determine FEN at step i? 
                 // This is expensive to do every render.
                 // Ideally we build a Move Tree once.
             }
        }
    });

    return [];
  }, [currentFen]);

  // BETTER APPROACH: Build a static tree once on mount
  const moveTree = useMemo(() => {
     const root: TreeNode = { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', move: '', children: [], variations: [], ply: 0 };
     
     DEFAULT_REPERTOIRE.forEach(variation => {
         let currentNode = root;
         const game = new Chess();
         
         variation.moves.forEach((uciMove, index) => {
             // Execute move
             const from = uciMove.substring(0, 2);
             const to = uciMove.substring(2, 4);
             const promo = uciMove.length > 4 ? uciMove[4] : undefined;
             
             try {
                const result = game.move({ from, to, promotion: promo });
                if (!result) return;
                
                const fen = game.fen();
                
                // Check if child exists
                let child = currentNode.children.find(c => c.move === result.san); // Use SAN for display
                if (!child) {
                    child = {
                        fen,
                        move: result.san,
                        children: [],
                        variations: [],
                        ply: index + 1
                    };
                    currentNode.children.push(child);
                }
                
                // Add variation to child
                if (!child.variations.includes(variation)) {
                    child.variations.push(variation);
                }
                currentNode = child;
             } catch (e) {}
         });
     });
     return root;
  }, []);

  const [currentNode, setCurrentNode] = useState<TreeNode>(moveTree);
  
  // Re-sync logic if external navigation needed? No, purely internal.

  // Move select handler needs to update board
  function handleMoveSelect(node: TreeNode) {
      setCurrentNode(node);
      setCurrentFen(node.fen);
      setHistory(prev => [...prev, node.fen]);
      
      // Also need to play sound?
  }

  return (
    <div className="flex h-full gap-4 p-4 overflow-hidden">
        {/* Left: Chess Board */}
        <div className="flex-1 flex items-center justify-center bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] p-4 relative">
             <div className="w-full max-w-[60vh] aspect-square shadow-2xl">
                {/* We need a Chessboard component. Assuming usage of 'react-chessboard' or internal wrapper */}
                 <div 
                    id="opening-board-container"
                    className="w-full h-full"
                 >
                    {/* Real ChessBoard Component */}
                    <ChessBoard 
                        game={new Chess(currentFen)} 
                        onMove={() => false} // Read-only for now, or handle user moves later
                        arePiecesDraggable={false}
                        orientation="white"
                    />
                 </div>
             </div>
        </div>

        {/* Right: Explorer Panel */}
        <div className="w-80 flex flex-col h-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] rounded-xl overflow-hidden border border-[var(--color-border)]">
            {/* Header */}
            <div className="bg-[var(--color-bg-secondary)] p-4 border-b border-[var(--color-border)] flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                    <GitBranch size={20} className="text-blue-400"/> Variation Explorer
                </h3>
                <button onClick={onClose}><span className="text-zinc-400 hover:text-[var(--color-text-primary)]">Close</span></button>
            </div>
            
            {/* Moves List */}
            <div className="flex-1 overflow-y-auto p-2">
                {currentNode.children.length === 0 ? (
                    <div className="text-center p-8 text-zinc-500">
                        <div className="mb-2">End of line</div>
                        {currentNode.variations.length > 0 && (
                            <div className="flex flex-col gap-2 mt-4">
                                {currentNode.variations.map(v => (
                                    <button 
                                        key={v.id}
                                        onClick={() => onSelectVariation(v)}
                                        className="p-2 bg-green-900/30 text-green-300 rounded border border-green-700/50 hover:bg-green-900/50 text-sm"
                                    >
                                        Practice: {v.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-1">
                        <div className="text-xs font-bold text-zinc-500 uppercase px-2 mb-1">Next Moves</div>
                        {currentNode.children.map(child => (
                            <button
                                key={child.move}
                                onClick={() => handleMoveSelect(child)}
                                className="w-full flex items-center justify-between p-3 rounded hover:bg-[var(--color-bg-secondary)] transition-colors group"
                            >
                                <span className="font-bold font-mono text-lg">{child.move}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-zinc-500 bg-[var(--color-bg-primary)] px-2 py-1 rounded">
                                        {child.variations.length} vars
                                    </span>
                                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Footer/Controls */}
            <div className="bg-[var(--color-bg-secondary)] p-3 border-t border-[var(--color-border)] flex justify-between items-center">
                 <button 
                    onClick={() => {
                        setCurrentNode(moveTree);
                        setCurrentFen(moveTree.fen); // Reset FEN too!
                    }}
                    className="text-xs flex items-center gap-1 text-zinc-400 hover:text-[var(--color-text-primary)]"
                 >
                    <RefreshCw size={12} /> Reset to Start
                 </button>
                 <div className="text-xs text-zinc-500">
                    Ply: {currentNode.ply}
                 </div>
            </div>
        </div>
    </div>
  );
}
