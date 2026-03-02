
import { Chess } from 'chess.js';

export const MINIGAME_IDS = {
    NAME_THE_SQUARE: 'w1-minigame-squares',
    PAWN_WARS_KING: 'w2-pawn-wars-king',
    KNIGHT_TOUR: 'w4-knight-tour',
    BISHOP_TOUR: 'w5-bishop-tour',
    FARMER_PIGGIES_OLD_LOUIS: 'w3-farmer-piggies-dual', 
    FARMER_PIGGIES_DOGS: 'w4-farmer-piggies-dogs',
    FARMER_PIGGIES_BISHOPS: 'w6-farmer-piggies-bishops',
    FARMER_PIGGIES_TRACTORS: 'w8-farmer-piggies-tractors',
    FARMER_PIGGIES_LUCILLE: 'w12-farmer-piggies-lucille',
    ROOK_MAZE: 'w7-rook-maze',
    QUEENS_QUEST: 'w10-queens-quest',
    KING_ROOK_VS_KING: 'mg-king-rook-vs-king',
    KING_QUEEN_VS_KING: 'mg-king-queen-vs-king',
    KING_ROOK_ROOK_VS_KING: 'mg-king-rook-rook-vs-king',
    MATE_IN_1_RUSH: 'w1-minigame-mate-in-1',
    MATE_IN_2_RUSH: 'w1-minigame-mate-in-2',
};

export function isFarmerPiggies(lessonId: string): boolean {
    return lessonId.includes('farmer-piggies');
}

export function isPawnWars(lessonId: string): boolean {
    return lessonId.includes('pawn-wars');
}

export function generateNameTheSquareSquares(count: number = 15): string[] {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const allSquares: string[] = [];
    
    files.forEach(f => ranks.forEach(r => allSquares.push(f + r)));
    
    // Shuffle
    const shuffled = [...allSquares].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

export function generatePawnWarsFen(startTurn: 'w' | 'b' = 'w'): { fen: string, lockedSquares: string[] } {
    const fileW = Math.floor(Math.random() * 8);
    const fileB = Math.floor(Math.random() * 8);
    const files = ['a','b','c','d','e','f','g','h'];
    const squareW = `${files[fileW]}1`;
    const squareB = `${files[fileB]}8`;
    
    // Generate valid ranks for Kings
    const rank8 = (fileB === 0 ? "k7" : fileB === 7 ? "7k" : `${fileB}k${7-fileB}`).replace(/0/g,'');
    const rank1 = (fileW === 0 ? "K7" : fileW === 7 ? "7K" : `${fileW}K${7-fileW}`);
    
    const fen = `${rank8}/pppppppp/8/8/8/8/PPPPPPPP/${rank1} ${startTurn} - - 0 1`;
    return { fen, lockedSquares: [squareW, squareB] };
}

// Knight Tour Logic
export function validateKnightTourMove(to: string, visitedSquares: string[]): { isValid: boolean; error?: string } {
    if (visitedSquares.includes(to)) {
        return { isValid: false, error: "You already visited that square!" };
    }
    return { isValid: true };
}

export function checkKnightTourSuccess(game: Chess, visitedSquares: string[]): boolean {
    const possibleMoves = game.moves({ verbose: true });
    
    // Debug Logging
    console.log("Knight Tour Check:");
    console.log("Visited:", visitedSquares);
    console.log("Possible Moves:", possibleMoves.map(m => m.to));
    
    // Check if any legal move lands on an unexpected square
    // AND is made by a KNIGHT (ignore King moves)
    const hasLegalMoves = possibleMoves.some(m => !visitedSquares.includes(m.to) && m.piece === 'n');
    console.log("Has Legal Knight Moves Remaining:", hasLegalMoves);
    return !hasLegalMoves; // Success if no legal moves left (trapped)
}

export function generateKnightTourFen(): string {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
    let startSquare = 'a1';
    let safe = false;
    
    // Valid start square finding logic (avoid kings)
    while (!safe) {
         const f = files[Math.floor(Math.random() * 8)];
         const r = ranks[Math.floor(Math.random() * 8)];
         startSquare = f + r;
         if (startSquare !== 'e1' && startSquare !== 'e8') safe = true;
    }

    const tempGame = new Chess("4k3/8/8/8/8/8/8/4K3 w - - 0 1");
    tempGame.put({ type: 'n', color: 'w' }, startSquare as any);
    return tempGame.fen();
}

// Safe Bishop Logic
export function isSquareAttacked(game: Chess, square: string, attackerColor: 'w' | 'b'): boolean {
    // Get all valid moves for the attacker
    // We clone the game to not mess up state? Or just use .moves() if the turn is correct.
    // The issue: .moves() creates moves for the side whose turn it is.
    // In our minigame, it's always White's turn effectively (we skip Black's turn).
    // So to check Black's attacks, we might need to peek.
    // OR, we can just scan the board.
    // Simpler: iterate all pieces of attackerColor and check if they attack 'square'.
    
    // Using chess.js moves() is robust.
    const tempGame = new Chess(game.fen());
    
    // Force turn to attacker to see their moves
    if (tempGame.turn() !== attackerColor) {
        // Hacky way to switch turn in FEN: swap w/b
        const fenParts = tempGame.fen().split(' ');
        fenParts[1] = attackerColor;
        fenParts[3] = '-'; // Reset en passant to avoid validation errors if invalid
        try {
            tempGame.load(fenParts.join(' '));
        } catch (e) {
            // Fallback: If load fails (e.g. King missing?), just return false or handle gracefully
            return false;
        }
    }

    const moves = tempGame.moves({ verbose: true });
    return moves.some(m => m.to === square);
}

export function validateSafeBishopMove(game: Chess, from: string, to: string): { isValid: boolean; error?: string } {
     const piece = game.get(from as any);
     if (!piece || piece.type !== 'b' || piece.color !== 'w') {
         return { isValid: false, error: "Select a white bishop!" };
     }
     // Standard chess validation handles the rest (diagonal, blocking)
     return { isValid: true };
}

/**
 * Check if there are any legal captures for White Bishops that don't land on an attacked square.
 */
export function hasSafeCaptures(game: Chess): boolean {
    const board = game.board();
    const whiteBishops: { square: string }[] = [];

    board.forEach((row, rIdx) => {
        row.forEach((piece, cIdx) => {
            if (piece && piece.type === 'b' && piece.color === 'w') {
                whiteBishops.push({ square: `${'abcdefgh'[cIdx]}${8 - rIdx}` });
            }
        });
    });

    for (const bishop of whiteBishops) {
        const moves = game.moves({ square: bishop.square as any, verbose: true });
        for (const move of moves) {
            if (move.captured) {
                // Peek if the destination is safe
                if (!isSquareAttacked(game, move.to, 'b')) {
                    return true;
                }
            }
        }
    }

    return false;
}


export function generateSafeBishopBoard(): string {
    let attempts = 0;
    while (attempts < 50) {
        attempts++;
        const chess = new Chess();
        chess.clear();
        
        // 1. Place Kings (Safe corners/edges)
        chess.put({ type: 'k', color: 'w' }, 'e1');
        chess.put({ type: 'k', color: 'b' }, 'e8');

        // Helper to get random empty square
        const getEmptySquare = () => {
             for (let i = 0; i < 50; i++) {
                 const file = 'abcdefgh'[Math.floor(Math.random() * 8)];
                 const rank = Math.floor(Math.random() * 8) + 1;
                 const sq = `${file}${rank}` as any;
                 if (!chess.get(sq)) return sq;
             }
             return null;
        };

        // 2. Place 2 White Bishops on opposite colors
        // Helper to check if square is light (file index + rank is even)
        const isLightSquare = (sq: string) => {
            const fileIdx = 'abcdefgh'.indexOf(sq[0]);
            const rank = parseInt(sq[1]);
            return (fileIdx + rank) % 2 === 0;
        };
        
        // Place first bishop on a light square
        let b1 = getEmptySquare();
        while (b1 && !isLightSquare(b1)) {
            b1 = getEmptySquare();
        }
        if (!b1) continue;
        chess.put({ type: 'b', color: 'w' }, b1);
        
        // Place second bishop on a dark square
        let b2 = getEmptySquare();
        while (b2 && isLightSquare(b2)) {
            b2 = getEmptySquare();
        }
        if (!b2) continue;
        chess.put({ type: 'b', color: 'w' }, b2);

        // 3. Place Enemies (6-10 Random Pawns/Rooks)
        const enemyCount = Math.floor(Math.random() * 5) + 6; // 6 to 10
        let enemiesPlaced = 0;
        for (let i = 0; i < enemyCount; i++) {
            const type = Math.random() > 0.5 ? 'p' : 'r';
            const sq = getEmptySquare();
            if (!sq) break;
            
            // Avoid placing Pawns on rank 1/8
            if (type === 'p' && (sq[1] === '1' || sq[1] === '8')) continue;
            
            chess.put({ type: type, color: 'b' }, sq);
            enemiesPlaced++;
        }
        
        if (enemiesPlaced < 6) continue;

        // 4. Validation: Ensure Bishops are NOT under attack
        // check isSquareAttacked logic.
        // We need to pass the game instance.
        // Note: isSquareAttacked creates a NEW Chess instance from FEN, so it's safe.
        // But we need to make sure 'chess' is in a valid state first.
        
        // Is White in check? (King attacked)
        // Switch turn to White (default) -> Check if King is attacked.
        // Actually, we placed King at e1.
        
        try {
            const fen = chess.fen();
            const tempGame = new Chess(fen);
            
            // 4. Validation: Ensure White is NOT in check (including King and Bishops)
            // Ensure turn is White for check check
            const whiteFenParts = fen.split(' ');
            whiteFenParts[1] = 'w';
            tempGame.load(whiteFenParts.join(' '));

            if (tempGame.inCheck()) { console.log("Failed: King in check"); continue; }
            
            // Check if any Bishop is attacked
            if (isSquareAttacked(tempGame, b1, 'b')) { console.log("Failed: b1 attacked", b1); continue; }
            if (isSquareAttacked(tempGame, b2, 'b')) { console.log("Failed: b2 attacked", b2); continue; }
            
            // 5. Ensure at least one enemy can be captured in 1 move
            const hasCapture = hasSafeCaptures(tempGame);
            if (!hasCapture) { console.log("Failed: no safe captures available"); continue; }
            
            return tempGame.fen(); // Valid!
            
        } catch (e) {
            console.error("Exception in generation", e);
            continue;
        }
    }
    
    // Fallback if random gen fails
    // A guaranteed safe board: Kings on e1/e8, White Bishops on d1(light) and d2(dark), and isolated Black target Pawns
    // This allows the game to at least run.
    return "4k3/1p4p1/8/8/8/8/3B4/3BK3 w - - 0 1"; 
}

// --- New Bishop's Tour Dynamic Spawning Logic ---

/**
 * Returns the count of Black pieces that are NOT defended by any other Black piece.
 * (Meaning, if a White piece captured it, that White piece would not be immediately recaptured).
 */
export function getUnprotectedBlackPieces(game: Chess): number {
    const tempGame = new Chess(game.fen());
    const board = tempGame.board();
    
    // Switch turn to Black to see what they can "attack" (defend)
    const fenParts = tempGame.fen().split(' ');
    fenParts[1] = 'b';
    fenParts[3] = '-';
    try {
        tempGame.load(fenParts.join(' '));
    } catch (e) {
        return 0; // Fallback
    }

    // Get all moves Black can make (this reveals what squares Black is "defending")
    const blackMoves = tempGame.moves({ verbose: true });
    
    // A square is defended if Black has a legal move *to* that square 
    // (chess.js doesn't natively expose "defended friendly pieces", so we calculate it:
    // Actually, chess.js `moves` only shows legal moves to empty squares or enemy pieces.
    // To see if a friendly piece is defended, we can temporarily change that piece to opposite color and see if Black can capture it.
    
    let unprotectedCount = 0;
    
    board.forEach((row, rIdx) => {
        row.forEach((piece, cIdx) => {
            if (piece && piece.color === 'b' && piece.type !== 'k') {
                const sq = `${'abcdefgh'[cIdx]}${8 - rIdx}` as any;
                
                // Temporary fen where this specific black piece is turned into a white piece (target dummy)
                const mockFenParts = game.fen().split(' ');
                const mockGame = new Chess(game.fen());
                mockGame.remove(sq);
                mockGame.put({ type: piece.type, color: 'w' }, sq);
                
                // Now see if Black (from original position minus this piece) can capture the dummy
                const checkFenParts = mockGame.fen().split(' ');
                checkFenParts[1] = 'b'; // Black's turn
                checkFenParts[3] = '-';
                try {
                    mockGame.load(checkFenParts.join(' '));
                    const canDefend = mockGame.moves({ verbose: true }).some(m => m.to === sq);
                    if (!canDefend) {
                        unprotectedCount++;
                    }
                } catch (e) {
                    unprotectedCount++; // Assume unprotected on error
                }
            }
        });
    });

    return unprotectedCount;
}

/**
 * Spawns a single random Black piece (pawn, knight, rook, or bishop) safely.
 * Returns the new FEN string if successful, null if board is full or stuck.
 */
export function spawnRandomTarget(game: Chess): string | null {
    const emptySquares = getEmptySquares(game);
    if (emptySquares.length === 0) return null;
    
    // Shuffle empty squares to try them purely randomly
    const shuffledSquares = emptySquares.sort(() => Math.random() - 0.5);
    const pieceTypes: ('p' | 'n' | 'b' | 'r')[] = ['p', 'n', 'b', 'r'];
    
    for (const sq of shuffledSquares) {
        const randomPiece = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        
        // No pawns on rank 1 or 8
        if (randomPiece === 'p' && (sq[1] === '1' || sq[1] === '8')) continue;
        
        // Safety check: Does this spawn put the White King (or Bishops) in check/immediate danger?
        try {
            const tempGame = new Chess(game.fen());
            tempGame.put({ type: randomPiece, color: 'b' }, sq as any);
            
            // 1. Is White King in check?
            const fenParts = tempGame.fen().split(' ');
            fenParts[1] = 'w';
            fenParts[3] = '-';
            tempGame.load(fenParts.join(' '));
            if (tempGame.inCheck()) continue; // Try another square
            
            // 2. We don't strictly care if it attacks a Bishop initially, because 
            // the minigame rule is "never END your turn on an unsafe square." 
            // If it spawns attacking a bishop, White MUST move the bishop or capture it.
            // But if we want to be nice, we can prevent spawning directly attacking a bishop.
            // Let's be nice to avoid instant unfair checkmates.
            
            const whiteBishops = tempGame.board().flat().filter(p => p && p.color === 'w' && p.type === 'b');
            const attacksBishop = whiteBishops.some(b => {
                // Find current location of bishops in tempGame
                // board() flat doesn't give square name easily, let's just use isSquareAttacked
                return false; 
            });

            // Iterate board to find bishop squares
            const board = tempGame.board();
            let bAttacked = false;
            board.forEach((row, rIdx) => {
                row.forEach((piece, cIdx) => {
                    if (piece && piece.type === 'b' && piece.color === 'w') {
                        const bSq = `${'abcdefgh'[cIdx]}${8 - rIdx}`;
                        if (isSquareAttacked(tempGame, bSq, 'b')) {
                            bAttacked = true;
                        }
                    }
                });
            });

            if (bAttacked) continue; // Try another square
            
            // Passed all checks! Spawn it.
            const newGame = new Chess(game.fen());
            newGame.put({ type: randomPiece, color: 'b' }, sq as any);
            return newGame.fen();
            
        } catch (e) {
            continue;
        }
    }
    
    return null; // Failed to find a safe spot
}


// Piggy Logic
export function getRemainingMobilePiggies(game: Chess, lockedSquares: string[]): number {
    const board = game.board().flat();
    const mobilePiggies = board.filter((p, idx) => {
        if (!p || p.type !== 'p') return false; // Piggies are always pawns
        
        const file = ['a','b','c','d','e','f','g','h'][idx % 8];
        const rank = 8 - Math.floor(idx / 8);
        const sq = file + rank;
        
        // If square is locked (e.g. promoted/reached end), it's not "mobile" for the purpose of the game
        return !lockedSquares.includes(sq);
    });
    return mobilePiggies.length;
}

// Farm Hands (Bishops) Board Generation
export function generateFarmHandsBoard(): string {
    // Ensure bishops are on opposite colors
    // c1 is light square, f1 is dark square
    // This is the fixed starting position for Farm Hands
    return "4k3/pppppppp/8/8/8/8/8/2B1K1B1 w - - 0 1";
}

// Rook Maze Board Generation
export function generateRookMazeBoard(): string {
    const chess = new Chess();
    chess.clear();
    
    // Place Kings
    chess.put({ type: 'k', color: 'w' }, 'e1');
    chess.put({ type: 'k', color: 'b' }, 'e8');
    
    // Place White Rook (player-controlled) at a1
    chess.put({ type: 'r', color: 'w' }, 'a1');
    
    // 1. Place Immovable Friendly Obstacles (White pieces)
    // These block the rook but cannot be captured or moved (handled by UI logic)
    const obstacleCount = Math.floor(Math.random() * 4) + 6; // 6-9 obstacles
    const obstacleTypes: ('p' | 'n' | 'b')[] = ['p', 'n', 'b'];
    
    for (let i = 0; i < obstacleCount; i++) {
        const emptySquares = getEmptySquares(chess);
        if (emptySquares.length === 0) break;
        
        const randomSquare = emptySquares[Math.floor(Math.random() * emptySquares.length)];
        const randomPiece = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        
        // Avoid placing pawns on rank 1 or 8
        if (randomPiece === 'p' && (randomSquare[1] === '1' || randomSquare[1] === '8')) {
            i--; 
            continue;
        }
        
        // Don't block the rook immediately (keep a2 and b1 clear if possible for a start)
        if (randomSquare === 'a2' || randomSquare === 'b1') {
             i--;
             continue;
        }
        chess.put({ type: randomPiece, color: 'w' }, randomSquare as any);

        // Validation: Ensure this obstacle doesn't check the Black King
        if (isSquareAttacked(chess, 'e8', 'w')) {
            chess.remove(randomSquare as any);
            i--;
            continue;
        }
    }

    // 2. Place Initial Enemy Target (Black Piece)
    // Start with just 1 to match the "an enemy piece will pop up" description
    let targetPlaced = false;
    let attempts = 0;
    while (!targetPlaced && attempts < 100) {
        attempts++;
        const emptySquares = getEmptySquares(chess);
        if (emptySquares.length === 0) break;
        
        const randomSquare = emptySquares[Math.floor(Math.random() * emptySquares.length)];
        const pieceTypes: ('p' | 'n' | 'b')[] = ['p', 'n', 'b'];
        const randomPiece = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        
        if (randomPiece === 'p' && (randomSquare[1] === '1' || randomSquare[1] === '8')) continue;
        
        // Check if placing this piece puts the White King in check
        try {
            const tempGame = new Chess(chess.fen());
            tempGame.put({ type: randomPiece, color: 'b' }, randomSquare as any);
            
            // Force turn to White to check if King is attacked
            const fenParts = tempGame.fen().split(' ');
            fenParts[1] = 'w';
            fenParts[3] = '-';
            tempGame.load(fenParts.join(' '));
            
            if (tempGame.inCheck()) {
                continue; // Retry if this spawn results in a check
            }
        } catch (e) {
            continue;
        }
        
        chess.put({ type: randomPiece, color: 'b' }, randomSquare as any);
        targetPlaced = true;
    }
    
    return chess.fen();
}

// Helper: Get all empty squares on the board
export function getEmptySquares(game: Chess): string[] {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const emptySquares: string[] = [];
    
    for (const file of files) {
        for (const rank of ranks) {
            const square = `${file}${rank}`;
            if (!game.get(square as any)) {
                emptySquares.push(square);
            }
        }
    }
    
    return emptySquares;
}

// Queen's Quest Board Generation (Exact copy of Rook Maze, just Queen instead of Rook)
export function generateRandomTargetsBoard(): string {
    const chess = new Chess();
    chess.clear();
    
    // Place Kings
    chess.put({ type: 'k', color: 'w' }, 'e1');
    chess.put({ type: 'k', color: 'b' }, 'e8');
    
    // Place White Queen (player-controlled) at d1
    chess.put({ type: 'q', color: 'w' }, 'd1');
    
    // 1. Place Immovable Friendly Obstacles (White pieces)
    // These block the queen but cannot be captured or moved (handled by UI logic)
    const obstacleCount = Math.floor(Math.random() * 4) + 6; // 6-9 obstacles
    const obstacleTypes: ('p' | 'n' | 'b')[] = ['p', 'n', 'b'];
    
    for (let i = 0; i < obstacleCount; i++) {
        const emptySquares = getEmptySquares(chess);
        if (emptySquares.length === 0) break;
        
        const randomSquare = emptySquares[Math.floor(Math.random() * emptySquares.length)];
        const randomPiece = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        
        // Avoid placing pawns on rank 1 or 8
        if (randomPiece === 'p' && (randomSquare[1] === '1' || randomSquare[1] === '8')) {
            i--; 
            continue;
        }
        
        // Don't block the queen immediately (keep d2 and c1/e1 clear if possible for a start)
        if (randomSquare === 'd2' || randomSquare === 'c1') {
             i--;
             continue;
        }
        chess.put({ type: randomPiece, color: 'w' }, randomSquare as any);

        // Validation: Ensure this obstacle doesn't check the Black King
        if (isSquareAttacked(chess, 'e8', 'w')) {
            chess.remove(randomSquare as any);
            i--;
            continue;
        }
    }

    // 2. Place Initial Enemy Target (Black Piece)
    // Start with just 1 to match the "an enemy piece will pop up" description
    let targetPlaced = false;
    let attempts = 0;
    while (!targetPlaced && attempts < 100) {
        attempts++;
        const emptySquares = getEmptySquares(chess);
        if (emptySquares.length === 0) break;
        
        const randomSquare = emptySquares[Math.floor(Math.random() * emptySquares.length)];
        const pieceTypes: ('p' | 'n' | 'b')[] = ['p', 'n', 'b'];
        const randomPiece = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        
        if (randomPiece === 'p' && (randomSquare[1] === '1' || randomSquare[1] === '8')) continue;
        
        // Check if placing this piece puts the White King in check
        try {
            const tempGame = new Chess(chess.fen());
            tempGame.put({ type: randomPiece, color: 'b' }, randomSquare as any);
            
            // Force turn to White to check if King is attacked
            const fenParts = tempGame.fen().split(' ');
            fenParts[1] = 'w';
            fenParts[3] = '-';
            tempGame.load(fenParts.join(' '));
            
            if (tempGame.inCheck()) {
                continue; // Retry if this spawn results in a check
            }
        } catch (e) {
            continue;
        }
        
        chess.put({ type: randomPiece, color: 'b' }, randomSquare as any);
        targetPlaced = true;
    }
    
    return chess.fen();
}

// Helper: Spawn a random piece on an empty square
export function spawnRandomPiece(game: Chess): boolean {
    const emptySquares = getEmptySquares(game);
    if (emptySquares.length === 0) return false; // Board full
    
    const randomSquare = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    const pieceTypes: ('p' | 'n' | 'b')[] = ['p', 'n', 'b'];
    const randomPiece = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
    
    // Avoid placing pawns on rank 1 or 8
    if (randomPiece === 'p' && (randomSquare[1] === '1' || randomSquare[1] === '8')) {
        return spawnRandomPiece(game); // Retry recursively
    }
    
    // Check if placing this piece puts the White King in check (which is illegal/annoying for this minigame)
    // We create a temporary game state to verification
    try {
        const tempGame = new Chess(game.fen());
        tempGame.put({ type: randomPiece, color: 'b' }, randomSquare as any);
        
        // Force turn to White to check if King is attacked
        // (If it was Black's turn, inCheck() would check if Black King is attacked)
        const fenParts = tempGame.fen().split(' ');
        fenParts[1] = 'w';
        fenParts[3] = '-';
        tempGame.load(fenParts.join(' '));
        
        if (tempGame.inCheck()) {
             // Retry if this spawn results in a check
             return spawnRandomPiece(game);
        }
    } catch (e) {
        // Fallback if load fails
        return false;
    }
    
    game.put({ type: randomPiece, color: 'b' }, randomSquare as any);
    return true;
}

// Endgame Random Position Generator
export function generateEndgameFEN(whitePieces: ('R' | 'Q')[]): string {
    let attempts = 0;
    while (attempts < 200) {
        attempts++;
        const chess = new Chess();
        chess.clear(); // Empty board

        // 1. Place Kings (ensure they are not too close is handled by standard legality check or explicit distance check)
        // Helper: Random square
        const getRandSq = () => {
            const files = 'abcdefgh';
            const ranks = '12345678';
            return (files[Math.floor(Math.random() * 8)] + ranks[Math.floor(Math.random() * 8)]) as any;
        };

        const wKing = getRandSq();
        chess.put({ type: 'k', color: 'w' }, wKing);

        let bKing = getRandSq();
        while (bKing === wKing) bKing = getRandSq(); // Basic collision check
        
        // Ensure kings are not adjacent (Chebyshev distance > 1)
        const wFile = 'abcdefgh'.indexOf(wKing[0]);
        const wRank = parseInt(wKing[1]);
        const bFile = 'abcdefgh'.indexOf(bKing[0]);
        const bRank = parseInt(bKing[1]);
        
        if (Math.abs(wFile - bFile) <= 1 && Math.abs(wRank - bRank) <= 1) continue;

        chess.put({ type: 'k', color: 'b' }, bKing);

        // 2. Place White Pieces
        let placementFailed = false;
        for (const pType of whitePieces) {
            let pSq = getRandSq();
            // Ensure empty
            let safety = 0;
            while (chess.get(pSq) && safety < 50) {
                pSq = getRandSq();
                safety++;
            }
            if (safety >= 50) { placementFailed = true; break; }
            
            chess.put({ type: pType.toLowerCase() as any, color: 'w' }, pSq);
        }
        if (placementFailed) continue;

        // 3. Validation
        const fen = chess.fen();
        const temp = new Chess(fen);
        
        // Check 1: Is Black in check? (Illegal for White to move position)
        const fenParts = fen.split(' ');
        fenParts[1] = 'b';
        const blackToMoveFen = fenParts.join(' ');
        
        try {
            const blackGame = new Chess(blackToMoveFen);
            if (blackGame.inCheck()) continue; 
        } catch (e) { continue; }

        // Check 2: Is White in check?
        if (temp.inCheck()) continue;

        // Check 3: Is it already mate/stalemate?
        if (temp.isGameOver()) continue;
        
        return fen;
    }

    // Fallback: Standard "Box" starting positions if random fails
    if (whitePieces.includes('Q')) return "4k3/8/8/8/8/8/6K1/4Q3 w - - 0 1"; 
    if (whitePieces.filter(p => p === 'R').length === 2) return "4k3/8/8/8/8/8/6K1/R6R w - - 0 1";
    return "4k3/8/8/8/8/8/6K1/7R w - - 0 1"; // KR
}

// --- Custom Piggy Move Logic (Bypass Check) ---

export interface PiggyMove {
    from: string;
    to: string;
    promotion?: string;
}

/**
 * Get a valid Piggy (Black Pawn) move even if the Black King is in check.
 * Piggies just want to move DOWN (rank - 1).
 */
export function getPiggyMove(game: Chess, lockedSquares: string[] = [], piggyColor: 'w' | 'b' = 'b'): PiggyMove | null {
    const board = game.board();
    const piggies: { square: string, rank: number, file: number }[] = [];

    // 1. Find all pawns of the specified color
    board.forEach((row, rIdx) => {
        row.forEach((piece, cIdx) => {
            if (piece && piece.type === 'p' && piece.color === piggyColor) {
                const file = 'abcdefgh'[cIdx];
                const rank = 8 - rIdx;
                piggies.push({ square: `${file}${rank}`, rank, file: cIdx });
            }
        });
    });

    if (piggies.length === 0) return null;

    // Shuffle for randomness
    const shuffledPiggies = piggies.sort(() => Math.random() - 0.5);

    for (const piggy of shuffledPiggies) {
        const fileChar = 'abcdefgh'[piggy.file];
        // White pawns move UP (+1), Black pawns move DOWN (-1)
        const nextRank = piggyColor === 'w' ? piggy.rank + 1 : piggy.rank - 1;
        const targetSquare = `${fileChar}${nextRank}`;

        // Validate basic move (straight forward)
        // 1. Target must be on board
        if (nextRank < 1 || nextRank > 8) continue;

        // 2. Target must be empty (Pawns capture diagonally, move straight only if empty)
        // We can check the game board state directly
        // Note: game.get() uses square notation
        const pieceAtTarget = game.get(targetSquare as any);
        
        const promotionRank = piggyColor === 'w' ? 8 : 1;
        
        if (!pieceAtTarget) {
            // Valid Move!
             return {
                from: piggy.square,
                to: targetSquare,
                promotion: nextRank === promotionRank ? 'q' : undefined // Promote if reaching end
            };
        }
        
        // TODO: Implement diagonal captures if needed?
        // The prompt says "Piggies automatically advance". It doesn't explicitly say they attack efficiently.
        // But if blocked by a piece, maybe they should capture?
        // Standard pawns capture diagonally.
        // Let's check capture options.
        const leftFile = piggy.file - 1;
        const rightFile = piggy.file + 1;
        
        const captureTargets = [];
        if (leftFile >= 0) captureTargets.push({ file: 'abcdefgh'[leftFile], rank: nextRank });
        if (rightFile <= 7) captureTargets.push({ file: 'abcdefgh'[rightFile], rank: nextRank });
        
        for (const target of captureTargets) {
            const sq = `${target.file}${target.rank}`;
            const piece = game.get(sq as any);
            // Captures enemy pieces (Opposite color)
            const oppColor = piggyColor === 'w' ? 'b' : 'w';
            if (piece && piece.color === oppColor) {
                return {
                    from: piggy.square,
                    to: sq,
                    promotion: nextRank === promotionRank ? 'q' : undefined
                };
            }
        }
    }

    return null; // No moves found (all blocked)
}

/**
 * Find a move for the current side that doesn't move a king, ignoring check legality.
 * Used for bots in minigames when standard move generation fails due to checkmate detection.
 */
export function getPermissiveBotMove(game: Chess, ghosts: string[] = []): PiggyMove | null {
    const turn = game.turn();
    const board = game.board();
    const moves: PiggyMove[] = [];

    board.forEach((row, rIdx) => {
        row.forEach((piece, cIdx) => {
            if (piece && piece.color === turn && piece.type !== 'k') {
                const fromFile = 'abcdefgh'[cIdx];
                const fromRank = 8 - rIdx;
                const fromSq = `${fromFile}${fromRank}`;
                
                if (ghosts.includes(fromSq)) return;

                // Try some directions for this piece
                // Simplified: just try one square move in any valid direction for that piece type
                // (This is a fallback, so it doesn't need to be perfect chess)
                
                const possibleDeltas: [number, number][] = [];
                if (piece.type === 'p') {
                    if (turn === 'w') possibleDeltas.push([-1, 0]); else possibleDeltas.push([1, 0]);
                } else if (piece.type === 'n') {
                    possibleDeltas.push([2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]);
                } else {
                    // sliding pieces/king-like moves
                    possibleDeltas.push([1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]);
                }

                possibleDeltas.forEach(([dr, dc]) => {
                    const nr = rIdx + dr;
                    const nc = cIdx + dc;
                    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                        const targetPiece = board[nr][nc];
                        if (!targetPiece || targetPiece.color !== turn) {
                            const toFile = 'abcdefgh'[nc];
                            const toRank = 8 - nr;
                            const toSq = `${toFile}${toRank}`;
                            if (!ghosts.includes(toSq)) {
                                moves.push({ from: fromSq, to: toSq });
                            }
                        }
                    }
                });
            }
        });
    });

    if (moves.length === 0) return null;
    return moves[Math.floor(Math.random() * moves.length)];
}

/**
 * Apply a move manually to the FEN, bypassing chess.js validation.
 * Useful for minigames where we violate standard chess rules (e.g. moving while in check).
 * 
 * NOTE: This is a robust string manipulation implementation.
 * It's safer than trying to hack chess.js internals.
 */
export function applyMinigameMove(fen: string, from: string, to: string, promotion?: string): string {
    // We use chess.js to helpers if possible, but the move itself is illegal.
    // So we load the FEN, manually mutate the board array? No, board array is read-only usually.
    // We can allow chess.js to parse the FEN, get the board, MUTATE the board structure, then generate new FEN?
    
    // Easier approach: Use an internal Chess instance that has checking DISABLED?
    // chess.js doesn't allow disabling checks easily.
    
    // Manual Board Manipulation:
    const game = new Chess(fen);
    
    // 1. Remove piece from 'from'
    const piece = game.remove(from as any);
    if (!piece) return fen; // Error
    
    // 2. Put piece at 'to'
    // This overwrites whatever was there (capture)
    // Handle promotion
    if (promotion) {
        piece.type = promotion as any;
    }
    game.put(piece, to as any);
    
    // 3. Switch Turn
    // Get FEN, split it
    const parts = game.fen().split(' ');
    parts[1] = parts[1] === 'w' ? 'b' : 'w'; // Switch w <-> b
    parts[3] = '-'; // Reset en-passant for simplicity in minigames
    
    // Re-assemble
    return parts.join(' ');
}

/**
 * Minigame Configuration Metadata
 * Defines specific rules and visual behaviors for each minigame ID individually.
 * This makes each game standalone and portable.
 */
interface MinigameConfig {
    hideWhiteKing?: boolean;
    hideBlackKing?: boolean;
    lockKings?: boolean; // If true, kings are added to dynamicLockedSquares
    canTrample?: boolean; // If true, allows "King Trampling" moves
}

export const MINIGAME_CONFIG: Record<string, MinigameConfig> = {
    [MINIGAME_IDS.PAWN_WARS_KING]: {
        hideWhiteKing: true,
        hideBlackKing: true,
        lockKings: true,
        canTrample: true
    },
    // Add other Pawn Wars variants if they exist or arise
    
    [MINIGAME_IDS.FARMER_PIGGIES_OLD_LOUIS]: {
        hideWhiteKing: false, // Old Louis is the player!
        hideBlackKing: true,  // AI Opponent King is hidden obstruction
        lockKings: false,      // Player King must move!
        canTrample: true
    },
    [MINIGAME_IDS.FARMER_PIGGIES_DOGS]: {
         hideWhiteKing: false,
         hideBlackKing: true,
         lockKings: false,
         canTrample: true
    },
    [MINIGAME_IDS.FARMER_PIGGIES_BISHOPS]: {
         hideWhiteKing: false,
         hideBlackKing: true,
         lockKings: false,
         canTrample: true
    },
    [MINIGAME_IDS.FARMER_PIGGIES_TRACTORS]: {
         hideWhiteKing: false,
         hideBlackKing: true,
         lockKings: false,
         canTrample: true
    },
    [MINIGAME_IDS.FARMER_PIGGIES_LUCILLE]: {
         hideWhiteKing: false,
         hideBlackKing: true,
         lockKings: false,
         canTrample: true
    },
};

/**
 * Check if the current minigame allows trampling the king.
 */
export function canTrampleKing(lessonId: string): boolean {
    return MINIGAME_CONFIG[lessonId]?.canTrample || false;
}

/**
 * Get a valid move for minigames with hidden/obstructing kings, embracing "King Trampling".
 * - Gets standard moves.
 * - Adds "Trample" moves: If a pawn is blocked by a King, it can capture it (Promote).
 */
export function getHiddenKingTrampleMove(game: Chess): { from: string, to: string, promotion?: string } | null {
    const turn = game.turn();
    const oppColor = turn === 'w' ? 'b' : 'w';
    const board = game.board();
    
    // 1. Find the Opponent's King
    let kingSquare: string | null = null;
    let kingRank = -1;
    let kingFileIdx = -1;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.type === 'k' && piece.color === oppColor) {
                // Found King
                // Convert indices to square notation (e.g., 0,4 -> "e8")
                const fileStr = 'abcdefgh'[c];
                const rankStr = (8 - r).toString();
                kingSquare = `${fileStr}${rankStr}`;
                kingRank = 8 - r;
                kingFileIdx = c;
                break;
            }
        }
        if (kingSquare) break;
    }

    if (!kingSquare) return null; // No king found (should verify if this can happen in minigames)

    // 2. Check if a Pawn is "Trampling" it (Directly in front)
    // For White turn, Pawn pushes UP (+1 rank). So Pawn must be at kingRank - 1.
    // For Black turn, Pawn pushes DOWN (-1 rank). So Pawn must be at kingRank + 1.
    const pawnRank = turn === 'w' ? kingRank - 1 : kingRank + 1;

    // Validate rank bounds (Pawn can only be on ranks 2-7)
    if (pawnRank < 1 || pawnRank > 8) return null;

    const fileStr = 'abcdefgh'[kingFileIdx];
    const pawnSquare = `${fileStr}${pawnRank}`;
    const potentialPawn = game.get(pawnSquare as any);

    if (potentialPawn && potentialPawn.type === 'p' && potentialPawn.color === turn) {
        console.log(`[TrampleLogic] Found attacking pawn at ${pawnSquare} targeting King at ${kingSquare}`);
        // Valid Trample!
        // Check for promotion (if King is on rank 8 (for white) or rank 1 (for black))
        const isPromotion = (turn === 'w' && kingRank === 8) || (turn === 'b' && kingRank === 1);
        
        return {
            from: pawnSquare,
            to: kingSquare,
            promotion: isPromotion ? 'q' : undefined
        };
    }

    return null;
}

/**
 * Check if kings should be strictly locked (immovable) for this minigame.
 */
export function shouldLockKings(lessonId: string): boolean {
    return MINIGAME_CONFIG[lessonId]?.lockKings || false;
}

/**
 * Get custom style overrides for specific minigames.
 * Primarily used to hide Kings in "Pawn Wars" and "Farmer Piggies".
 */
export function getMinigamePieceStyles(lessonId: string, mechanic: string | undefined, game: Chess): Record<string, { pieceOpacity: number }> {
    const styles: Record<string, { pieceOpacity: number }> = {};
    const config = MINIGAME_CONFIG[lessonId];
    
    // Fallback for "mechanic" based legacy check if config missing?
    // The user wants standalone, so we prefer specific config.
    // usage of 'mechanic' was for generic farmer-piggies
    if (!config && !mechanic) return styles;

    const board = game.board();
    
    const hideWhite = config?.hideWhiteKing;
    const hideBlack = config?.hideBlackKing || (mechanic === 'farmer-piggies'); // Legacy fallback for generic mechanic

    if (hideWhite || hideBlack) {
        board.flat().forEach(p => {
             if (p && p.type === 'k') {
                 if (p.color === 'w' && hideWhite) {
                     styles[p.square] = { pieceOpacity: 0 };
                 } else if (p.color === 'b' && hideBlack) {
                     styles[p.square] = { pieceOpacity: 0 };
                 }
             }
        });
    }
    
    return styles;
}
