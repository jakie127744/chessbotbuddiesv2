import { Chess } from 'chess.js';
import { detectPin } from '../tactical-detector';

describe('Pin Profitability Logic', () => {
    
    test('Valid Pin: Bishop (3) pins Knight (3) to Queen (9) - Clean Win', () => {
        // White Bishop on h4, Black Knight on f6, Black Queen on d8
        // Knight cannot capture Bishop (Knight is at f6, Bishop at h4).
        // Added White King g1, Black King g8.
        const g = new Chess('3q1rk1/8/5n2/8/8/8/5B2/4K1R1 w - - 0 1');
        const m = g.move('Bh4'); 
        const result = detectPin(g, m);
        expect(result).not.toBeNull();
        expect(result?.description).toContain('Clean Win');
    });

    test('Valid Pin: Rook (5) pins Queen (9) to King (100) - Good Trade', () => {
        // White Rook on e1 moves to e5, pinning Black Queen on e7 to Black King on e8.
        // Queen e7 CAN capture Rook e5.
        // Rook e5 is protected by White Pawn on d4.
        // Val(Q) >= Val(R) (9 >= 5). Good Trade.
        const g = new Chess('4k3/4q3/8/8/3P4/8/8/4R1K1 w - - 0 1');
        const m = g.move('Re5');
        const result = detectPin(g, m);
        expect(result).not.toBeNull();
        expect(result?.description).toContain('Good Trade');
    });

    test('Invalid Pin: Queen (9) pins Rook (5) to Queen (9) - Bad Trade', () => {
        // White Queen on e1 moves to e4, pinning Black Rook on e6 to Black Queen on e8.
        // Rook e6 can capture Queen e4.
        // Queen e4 is protected by White Pawn on d3.
        // Val(R) < Val(Q) (5 < 9). Bad trade for attacker.
        const g = new Chess('4q1k1/8/4r3/8/8/3P4/8/4Q1K1 w - - 0 1');
        const m = g.move('Qe4');
        const result = detectPin(g, m);
        expect(result).toBeNull();
    });

    test('Valid Pin: Bishop (3) pins Knight (3) to King (100) - Absolute (Clean Win)', () => {
        // White Bishop on a4 moves to b5, pinning Black Knight on d7 to Black King on e8.
        const g = new Chess('3qk3/3n4/8/8/B7/8/8/4K1R1 w - - 0 1');
        const m = g.move('Bb5');
        const result = detectPin(g, m);
        expect(result).not.toBeNull();
        expect(result?.description).toContain('Clean Win');
    });

    test('Invalid Pin: Hanging Piece', () => {
        // White Rook on e4 pins Black Queen on e6 to Black King on e8.
        // BUT Rook e4 is NOT protected.
        const g = new Chess('4k3/8/4q3/8/8/8/8/4R1K1 w - - 0 1');
        const m = g.move('Re4');
        // Queen CAN capture e4. Rook NOT protected.
        const result = detectPin(g, m);
        expect(result).toBeNull();
    });
});
