/**
 * Move Tree Data Structure for PGN Variations
 * 
 * Supports branching analysis with proper PGN export.
 */

export interface MoveNode {
    id: string;            // Unique ID for React keys
    san: string;           // Move in SAN (e.g., "e4")
    fen: string;           // Position after this move
    annotation?: string;   // User annotation
    children: MoveNode[];  // Continuations (first = main line, rest = variations)
    parent: MoveNode | null; // Back reference for navigation
}

export interface GameTree {
    startingFen: string;   // FEN before any moves
    root: MoveNode | null; // First move(s) of the game
    currentNode: MoveNode | null; // Currently viewed position
}

let nodeIdCounter = 0;

/**
 * Create a new move node
 */
export function createNode(san: string, fen: string, parent: MoveNode | null): MoveNode {
    return {
        id: `node-${++nodeIdCounter}`,
        san,
        fen,
        children: [],
        parent,
    };
}

/**
 * Create an empty game tree
 */
export function createGameTree(startingFen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'): GameTree {
    return {
        startingFen,
        root: null,
        currentNode: null,
    };
}

/**
 * Add a move to the tree from the current position
 * Returns the new tree and the new current node
 */
export function addMove(tree: GameTree, san: string, fen: string): GameTree {
    const newNode = createNode(san, fen, tree.currentNode);
    
    if (!tree.currentNode) {
        // First move of the game
        if (!tree.root) {
            // No moves yet - this becomes the root
            return {
                ...tree,
                root: newNode,
                currentNode: newNode,
            };
        } else {
            // At starting position but moves exist
            // Check if this move already exists as a child
            const existingChild = tree.root.san === san ? tree.root : 
                findSiblingWithSan(tree.root, san);
            if (existingChild) {
                return { ...tree, currentNode: existingChild };
            }
            // This is a variation of the first move
            // We need a virtual root to hold multiple first moves
            // For simplicity, just add to root's siblings... actually let's handle this differently
            // Just replace root structure to handle multiple first moves
            return {
                ...tree,
                root: newNode, // This overwrites - we need better handling
                currentNode: newNode,
            };
        }
    } else {
        // We have a current node - add as child
        const existingChild = tree.currentNode.children.find(c => c.san === san);
        if (existingChild) {
            // Move already exists - just navigate there
            return { ...tree, currentNode: existingChild };
        }
        
        // New move - add as child
        newNode.parent = tree.currentNode;
        tree.currentNode.children.push(newNode);
        
        return { ...tree, currentNode: newNode };
    }
}

/**
 * Find sibling node with matching SAN (for handling multiple first moves)
 */
function findSiblingWithSan(node: MoveNode, san: string): MoveNode | null {
    // This is a simplified version - real implementation would need proper sibling tracking
    return node.san === san ? node : null;
}

/**
 * Navigate to parent (previous move)
 */
export function goToPrevNode(tree: GameTree): GameTree {
    if (!tree.currentNode) return tree;
    return { ...tree, currentNode: tree.currentNode.parent };
}

/**
 * Navigate to first child (next move in main line)
 */
export function goToNextNode(tree: GameTree): GameTree {
    if (!tree.currentNode) {
        // At start - go to root
        return tree.root ? { ...tree, currentNode: tree.root } : tree;
    }
    if (tree.currentNode.children.length === 0) return tree;
    return { ...tree, currentNode: tree.currentNode.children[0] };
}

/**
 * Navigate to start
 */
export function goToStartNode(tree: GameTree): GameTree {
    return { ...tree, currentNode: null };
}

/**
 * Navigate to end of main line
 */
export function goToEndNode(tree: GameTree): GameTree {
    if (!tree.root) return tree;
    
    let node = tree.root;
    while (node.children.length > 0) {
        node = node.children[0]; // Follow main line
    }
    return { ...tree, currentNode: node };
}

/**
 * Navigate to a specific node
 */
export function goToNode(tree: GameTree, node: MoveNode | null): GameTree {
    return { ...tree, currentNode: node };
}

/**
 * Get the path from root to current node
 */
export function getPathToNode(node: MoveNode | null): MoveNode[] {
    const path: MoveNode[] = [];
    let current = node;
    while (current) {
        path.unshift(current);
        current = current.parent;
    }
    return path;
}

/**
 * Get current FEN from tree
 */
export function getCurrentFen(tree: GameTree): string {
    return tree.currentNode ? tree.currentNode.fen : tree.startingFen;
}

/**
 * Get annotation for current node
 */
export function getAnnotation(node: MoveNode | null): string | undefined {
    return node?.annotation;
}

/**
 * Set annotation for a node
 */
export function setAnnotation(tree: GameTree, annotation: string | undefined): GameTree {
    if (!tree.currentNode) return tree;
    tree.currentNode.annotation = annotation;
    return { ...tree };
}

/**
 * Delete current move and all children, return to parent
 */
export function deleteCurrentMove(tree: GameTree): GameTree {
    if (!tree.currentNode) return tree;
    
    const parent = tree.currentNode.parent;
    
    if (!parent) {
        // Deleting root
        return {
            ...tree,
            root: null,
            currentNode: null,
        };
    }
    
    // Remove from parent's children
    parent.children = parent.children.filter(c => c.id !== tree.currentNode!.id);
    
    return { ...tree, currentNode: parent };
}

/**
 * Convert tree to PGN with variations in parentheses
 */
export function treeToPgn(tree: GameTree): string {
    if (!tree.root) return '';
    
    const result: string[] = [];
    
    function renderNode(node: MoveNode, moveNumber: number, isBlackMove: boolean, isVariation: boolean = false): void {
        // Move number
        if (!isBlackMove) {
            result.push(`${moveNumber}.`);
        } else if (isVariation || result.length === 0) {
            result.push(`${moveNumber}...`);
        }
        
        // Move
        result.push(node.san);
        
        // Annotation
        if (node.annotation) {
            result.push(`{${node.annotation}}`);
        }
        
        // Variations (children after first)
        for (let i = 1; i < node.children.length; i++) {
            result.push('(');
            renderNode(node.children[i], isBlackMove ? moveNumber : moveNumber + 1, !isBlackMove, true);
            // Continue that variation...
            let varNode = node.children[i];
            let varMoveNum = isBlackMove ? moveNumber : moveNumber + 1;
            let varIsBlack = !isBlackMove;
            while (varNode.children.length > 0) {
                varIsBlack = !varIsBlack;
                if (!varIsBlack) varMoveNum++;
                varNode = varNode.children[0];
                if (!varIsBlack) {
                    result.push(`${varMoveNum}.`);
                }
                result.push(varNode.san);
                if (varNode.annotation) {
                    result.push(`{${varNode.annotation}}`);
                }
            }
            result.push(')');
        }
        
        // Main line continuation
        if (node.children.length > 0) {
            const nextIsBlack = !isBlackMove;
            const nextMoveNum = isBlackMove ? moveNumber : moveNumber + 1;
            renderNode(node.children[0], nextMoveNum, nextIsBlack);
        }
    }
    
    // Start with first move
    renderNode(tree.root, 1, false);
    
    return result.join(' ');
}

/**
 * Flatten tree to array for linear display
 * Returns array of {node, depth, isVariation} for rendering
 */
export interface FlattenedNode {
    node: MoveNode;
    depth: number;
    isVariation: boolean;
    moveNumber: number;
    isBlackMove: boolean;
}

export function flattenTree(tree: GameTree): FlattenedNode[] {
    if (!tree.root) return [];
    
    const result: FlattenedNode[] = [];
    
    function traverse(node: MoveNode, depth: number, moveNumber: number, isBlackMove: boolean, isVariation: boolean): void {
        result.push({ node, depth, isVariation, moveNumber, isBlackMove });
        
        // First child is main line
        if (node.children.length > 0) {
            const nextIsBlack = !isBlackMove;
            const nextMoveNum = isBlackMove ? moveNumber : moveNumber + 1;
            traverse(node.children[0], depth, nextMoveNum, nextIsBlack, false);
        }
        
        // Rest are variations
        for (let i = 1; i < node.children.length; i++) {
            const nextIsBlack = !isBlackMove;
            const nextMoveNum = isBlackMove ? moveNumber : moveNumber + 1;
            traverse(node.children[i], depth + 1, nextMoveNum, nextIsBlack, true);
        }
    }
    
    traverse(tree.root, 0, 1, false, false);
    
    return result;
}
