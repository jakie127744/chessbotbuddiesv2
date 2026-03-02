const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/lib/data/mate-in-3.json'));
const mapped = data.map(p => ({
    id: p.PuzzleId,
    fen: p.FEN,
    moves: p.Moves.split(' '),
    rating: p.Rating,
    themes: p.Themes.split(' '),
    popularity: p.Popularity
}));

const tsContent = `import { LichessPuzzle } from './lichess-puzzles';

export const OFFLINE_MATE_IN_3: LichessPuzzle[] = ${JSON.stringify(mapped, null, 2)};
`;

fs.writeFileSync('src/lib/mate-in-3-puzzles.ts', tsContent);
console.log('Saved offline dataset to src/lib/mate-in-3-puzzles.ts');
