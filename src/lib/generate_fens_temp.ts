
import { Chess } from 'chess.js';
import fs from 'fs';

const chess = new Chess();
const moves = [
    'd4', 'd5', 'c4', 'c6',
    'Nf3', 'Nf6', 'Nc3', 'e6',
    'e3', 'Nbd7',
    'Qc2', 'b6',
    'Bd3', 'Bb7',
    'O-O', 'dxc4',
    'Bxc4', 'a6',
    'a4', 'b5',
    'Bd3', 'Be7', // Diagram 1
    'Rd1', 'Rc8',
    'Ne4', 'Nxe4', 'Bxe4', 'Nf6',
    'Bd3', 'Qb6',
    'axb5', 'cxb5',
    'Qe2', 'Nd5',
    'Bd2', 'Nb4',
    'Bxb4', // Diagram 2 (Position after 19.Bxb4)
    'Bxb4',
    'Ne5', 'Rc7',
    'Qh5', // Diagram 3
    'g6',
    'Qh6', 'Bf8',
    'Qf4', 'Bg7',
    'Rac1', 'Rxc1' // Final Position
];

let output = '';

console.log("Starting Game Replay...");

for (const move of moves) {
    try {
        const result = chess.move(move);
        if (!result) {
            output += `Invalid move: ${move}\n`;
            console.error(`Invalid move: ${move}`);
            break;
        }
        
        // Diagram 1: After 11...Be7 (Move 22)
        if (chess.history().length === 22) {
             output += `Diagram 1 (After 11...Be7):\n${chess.fen()}\n\n`;
        }

        // Diagram 2: After 19.Bxb4 (Move 37)
        if (chess.history().length === 37) {
             output += `Diagram 2 (After 19.Bxb4):\n${chess.fen()}\n\n`;
        }

         // Diagram 3: After 21.Qh5 (Move 41)
         if (chess.history().length === 41) {
             output += `Diagram 3 (After 21.Qh5):\n${chess.fen()}\n\n`;
        }
    } catch (e) {
        output += `Error on move ${move}: ${e}\n`;
        console.error(`Error on move ${move}:`, e);
    }
}

output += `Final Position (After 24...Rxc1):\n${chess.fen()}\n`;
fs.writeFileSync('src/lib/fens.txt', output);
console.log("Done writing FENs.");
