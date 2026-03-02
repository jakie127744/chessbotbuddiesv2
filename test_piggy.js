const { Chess } = require('chess.js');

function getPiggyMove(game, lockedSquares = [], piggyColor = 'b') {
    const board = game.board();
    const piggies = [];

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
        const pieceAtTarget = game.get(targetSquare);
        
        const promotionRank = piggyColor === 'w' ? 8 : 1;
        
        if (!pieceAtTarget) {
            // Valid Move!
             return {
                from: piggy.square,
                to: targetSquare,
                promotion: nextRank === promotionRank ? 'q' : undefined // Promote if reaching end
            };
        }
        
        const leftFile = piggy.file - 1;
        const rightFile = piggy.file + 1;
        
        const captureTargets = [];
        if (leftFile >= 0) captureTargets.push({ file: 'abcdefgh'[leftFile], rank: nextRank });
        if (rightFile <= 7) captureTargets.push({ file: 'abcdefgh'[rightFile], rank: nextRank });
        
        for (const target of captureTargets) {
            const sq = `${target.file}${target.rank}`;
            const piece = game.get(sq);
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

const fen = "4k3/8/8/8/8/8/PPPPPPPP/4K3 w - - 0 1";
const g = new Chess(fen);
console.log(getPiggyMove(g, [], 'w'));
