
export interface TutorialLevel {
    id: string;
    title: string;
    description: string;
    fen: string;
    stars: string[]; // Squares with stars
    pieceColor: 'w' | 'b';
    kind: 'rook' | 'bishop' | 'knight' | 'pawn' | 'queen' | 'king';
    instruction: string;
}

export const TUTORIAL_LEVELS: TutorialLevel[] = [
    {
        id: 'rook-1',
        title: 'Rook: The Straight Line',
        description: 'Rooks move in straight lines. Collect all the stars!',
        // Rook on d4. Stars on d7, d2.
        // Valid FEN required by chess.js: One white king (K), One black king (k).
        // Rook on d4. Stars on d7, d2.
        // kings: White on h1, Black on a7? Safe from d4 rook.
        // fen: '8/k2p4/8/8/3R4/8/8/7K w - - 0 1' -> Black pawn on d7?
        // Let's use empty squares for stars.
        // Rook on d4. Stars on d7, d2.
        // Kings on h5 (Black) and h1 (White). Safe from d file.
        fen: '8/8/8/7k/3R4/8/8/7K w - - 0 1', 
        stars: ['d7', 'd2'],
        pieceColor: 'w',
        kind: 'rook',
        instruction: 'Move the Rook to the stars to collect them!'
    },
    {
        id: 'rook-2',
        title: 'Rook: The Corner',
        description: 'Rooks can go sideways too.',
        // Rook on a1. Stars on a8, h8.
        // Path: a1->a8->h8.
        // Kings: White on e1 (blocks nothing relevant?), Black on e6? 
        // Ensure no checks.
        // R(a1). K(e1). k(e6).
        // f1/g1/h1/b1/c1/d1 empty.
        // a8/h8 empty.
        fen: '8/8/4k3/8/8/8/8/R3K3 w - - 0 1',
        stars: ['a8', 'h8'],
        pieceColor: 'w',
        kind: 'rook',
        instruction: 'Go to the corner, then across!'
    }
];
