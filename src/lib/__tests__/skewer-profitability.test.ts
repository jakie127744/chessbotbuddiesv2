import { Chess } from 'chess.js';
import { detectSkewer } from '../tactical-detector';

describe('Skewer Profitability Logic', () => {
    
    test('Valid Skewer: Bishop (3) skewers Queen (9) and Rook (5) - Profitable Trade', () => {
        // White Bishop on f1 moves to e2, skewing Black Queen on d3 and Black Rook on b5
        // Diagonal: f1-e2-d3-c4-b5. Bishop(3) < Rook(5) => Profitable Trade
        // White King e1, Black King h8
        const g = new Chess('7k/8/8/1r6/8/3q4/8/4KB2 w - - 0 1');
        const m = g.move('Be2');
        const result = detectSkewer(g, m);
        expect(result).not.toBeNull();
        expect(result?.type).toBe('skewer');
        expect(result?.description).toContain('Profitable Trade');
    });

    test('Valid Skewer: Rook (5) skewers Queen (9) and Rook (5) - Net Gain (unprotected)', () => {
        // White Rook on d1 moves to d4, skewing Black Queen on d6 and Black Rook on d8
        // d-file: d4-d5-d6 (queen), d7-d8 (rook, unprotected)
        // Rook(5) >= Rook(5), T2 unprotected => Net Gain
        // White King a1, Black King h8
        const g = new Chess('3r3k/8/3q4/8/8/8/8/K2R4 w - - 0 1');
        const m = g.move('Rd4');
        const result = detectSkewer(g, m);
        expect(result).not.toBeNull();
        expect(result?.description).toContain('Net Gain');
    });

    test('Invalid Skewer: Queen (9) skewers Queen (9) and Rook (5) protected by Pawn', () => {
        // White Queen on a1, Black Queen on a6, Black Rook on a8 protected by Black Pawn on b7
        // Pawn(1) <= Queen(9), so Pawn IS effective protection => Invalid skewer
        // White King e1, Black King h8
        const g = new Chess('r6k/1p6/q7/8/8/8/8/Q3K3 w - - 0 1');
        const m = g.move('Qa4');
        const result = detectSkewer(g, m);
        expect(result).toBeNull();
    });

    test('Valid Skewer: Bishop (3) skewers Queen (9) and Rook (5) "protected" by Queen - Net Gain', () => {
        // White Bishop on c1 moves to e3, skewing Black Queen on f4 and Black Rook on g5
        // Diagonal: c1-d2-e3-f4-g5. But we need a "protector" that's higher value than attacker.
        // Black Queen on h6 protects g5 diagonally. Queen(9) > Bishop(3), so NOT real protection.
        // Bishop(3) < Rook(5), so the "Profitable Trade" branch would fire first anyway.
        // Let's instead use: Rook(5) attacks, T2=Bishop(3), "protected" by Queen(9).
        // Queen(9) > Rook(5), so NOT effective protection => Net Gain
        // White Rook on h1, Black Queen on h5, Black Bishop on h7, Black Queen on g8 "protects" h7
        // Actually, let's keep it simple with a clear-cut scenario:
        // White Rook on a1 -> a4. Black Queen on a6 (T1=9). Black Knight on a8 (T2=3).
        // Black Queen on b8 "protects" a8. Queen(9) > Rook(5), NOT real => Net Gain.
        const g = new Chess('nq5k/8/q7/8/8/8/8/R3K3 w - - 0 1');
        const m = g.move('Ra4');
        const result = detectSkewer(g, m);
        expect(result).not.toBeNull();
        expect(result?.description).toContain('Net Gain');
    });

    test('Valid Skewer: Queen (9) skewers King (100) and Unprotected Rook (5) - Net Gain', () => {
        // White Queen on a1, Black King on a6, Black Rook on a8 (unprotected)
        // Queen(9) >= Rook(5), T2 not effectively protected => Net Gain
        // White King e1
        const g = new Chess('r7/8/k7/8/8/8/8/Q3K3 w - - 0 1');
        const m = g.move('Qa4');
        const result = detectSkewer(g, m);
        expect(result).not.toBeNull();
        expect(result?.description).toContain('Net Gain');
    });

    test('Invalid Skewer: T2 is a Pawn', () => {
        // White Bishop on f1, Black Queen on d3, Black Pawn on b5
        // T2 is pawn => filtered out entirely
        // White King e1, Black King h8
        const g = new Chess('7k/8/8/1p6/8/3q4/8/4KB2 w - - 0 1');
        const m = g.move('Be2');
        const result = detectSkewer(g, m);
        expect(result).toBeNull();
    });
});
