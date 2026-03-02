/**
 * Unit tests for Coach Jakie smart commentary helper functions.
 * Tests: getJakieFirstMoveReaction, detectOpeningTransposition,
 *        getJakieTacticApplause, getJakieEndgameIdentification
 */

import {
  getJakieFirstMoveReaction,
  detectOpeningTransposition,
  getJakieTacticApplause,
  getJakieEndgameIdentification,
} from '@/lib/coach-helpers';

// ─────────────────────────────────────────────────────────────
// MOCK chess.js board() for endgame identification tests
// ─────────────────────────────────────────────────────────────

/** Creates a minimal mock chess game with specific pieces on the board. */
function makeMockGame(pieces: { type: string; color: string; row: number; col: number }[], historyLength = 30) {
  const board: (({ type: string; color: string } | null))[][] = Array.from({ length: 8 }, () =>
    Array(8).fill(null)
  );
  // Always add both kings
  board[0][4] = { type: 'k', color: 'w' };
  board[7][4] = { type: 'k', color: 'b' };
  for (const p of pieces) {
    board[p.row][p.col] = { type: p.type, color: p.color };
  }
  return {
    board: () => board,
    history: () => Array(historyLength).fill('e4'), // Enough moves to be in endgame
  };
}

// ─────────────────────────────────────────────────────────────
// 1. getJakieFirstMoveReaction
// ─────────────────────────────────────────────────────────────

describe('getJakieFirstMoveReaction', () => {

  test('returns a reaction for 1.e4 (white first move)', () => {
    const result = getJakieFirstMoveReaction('e4', 1, ['e4']);
    expect(result).not.toBeNull();
    expect(typeof result).toBe('string');
    expect(result!.length).toBeGreaterThan(10);
  });

  test('returns a reaction for 1.d4', () => {
    const result = getJakieFirstMoveReaction('d4', 1, ['d4']);
    expect(result).not.toBeNull();
    expect(result).toMatch(/d4|solid|positional|strategic/i);
  });

  test('returns a reaction for 1...c5 (Sicilian)', () => {
    const result = getJakieFirstMoveReaction('c5', 2, ['e4', 'c5']);
    expect(result).not.toBeNull();
    expect(result).toMatch(/sicilian/i);
  });

  test('returns speculation comment on move 2 for e4-e5 (Open Game)', () => {
    const result = getJakieFirstMoveReaction('e5', 2, ['e4', 'e5']);
    expect(result).not.toBeNull();
    expect(result).toMatch(/open game|ruy lopez|italian|king's gambit|classical opening|both sides in the center/i);
  });

  test('returns speculation comment for d4-Nf6 (Indian territory)', () => {
    const result = getJakieFirstMoveReaction('Nf6', 2, ['d4', 'Nf6']);
    expect(result).not.toBeNull();
    expect(result).toMatch(/indian|king's indian|nimzo|grünfeld|hypermodern|challenge d4 indirectly/i);
  });

  test('returns null after move 5 (no more reactions)', () => {
    const history = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6'];
    const result = getJakieFirstMoveReaction('a6', 6, history);
    expect(result).toBeNull();
  });

  test('returns null for unknown moves at move 3+', () => {
    const result = getJakieFirstMoveReaction('h3', 3, ['e4', 'e5', 'h3']);
    expect(result).toBeNull();
  });

  test('returns null for moves beyond the range (move 11)', () => {
    const result = getJakieFirstMoveReaction('e4', 11, Array(11).fill('e4'));
    expect(result).toBeNull();
  });

});

// ─────────────────────────────────────────────────────────────
// 2. detectOpeningTransposition
// ─────────────────────────────────────────────────────────────

describe('detectOpeningTransposition', () => {

  test('returns a comment when opening name changes (transposition)', () => {
    const result = detectOpeningTransposition('Nimzo-Indian Defense', "Queen's Indian Defense");
    expect(result).not.toBeNull();
    expect(result).toMatch(/nimzo-indian/i);
    expect(result).toMatch(/queen's indian/i);
  });

  test('returns null when both names are the same (no transposition)', () => {
    const result = detectOpeningTransposition('Sicilian Defense', 'Sicilian Defense');
    expect(result).toBeNull();
  });

  test('returns null when prev opening is null (first detection, not a transposition)', () => {
    const result = detectOpeningTransposition(null, 'Ruy Lopez');
    expect(result).toBeNull();
  });

  test('returns null when current opening is null', () => {
    const result = detectOpeningTransposition('French Defense', null);
    expect(result).toBeNull();
  });

  test('returned comment always mentions both opening names', () => {
    const prev = 'French Defense';
    const curr = 'Caro-Kann Defense';
    const result = detectOpeningTransposition(prev, curr);
    expect(result).not.toBeNull();
    expect(result).toMatch(/French Defense/);
    expect(result).toMatch(/Caro-Kann Defense/);
  });

});

// ─────────────────────────────────────────────────────────────
// 3. getJakieTacticApplause
// ─────────────────────────────────────────────────────────────

describe('getJakieTacticApplause', () => {

  test('returns a fork comment for "fork"', () => {
    const result = getJakieTacticApplause('fork');
    expect(typeof result).toBe('string');
    expect(result).toMatch(/fork/i);
  });

  test('returns a pin comment for "pin"', () => {
    const result = getJakieTacticApplause('pin');
    expect(result).toMatch(/pin/i);
  });

  test('returns a skewer comment for "skewer"', () => {
    const result = getJakieTacticApplause('skewer');
    expect(result).toMatch(/skewer/i);
  });

  test('returns a discovered attack comment for "discovered_attack"', () => {
    const result = getJakieTacticApplause('discovered_attack');
    expect(result).toMatch(/discovered/i);
  });

  test('all tactic lines are non-empty strings', () => {
    const tactics: Array<'fork' | 'pin' | 'skewer' | 'discovered_attack'> = [
      'fork', 'pin', 'skewer', 'discovered_attack'
    ];
    for (const t of tactics) {
      const result = getJakieTacticApplause(t);
      expect(result.length).toBeGreaterThan(10);
    }
  });

});

// ─────────────────────────────────────────────────────────────
// 4. getJakieEndgameIdentification
// ─────────────────────────────────────────────────────────────

describe('getJakieEndgameIdentification', () => {

  test('returns null when history is too short (< 20 moves)', () => {
    const game = makeMockGame(
      [{ type: 'q', color: 'w', row: 3, col: 3 }],
      10 // Only 10 moves
    );
    const result = getJakieEndgameIdentification(game);
    expect(result).toBeNull();
  });

  test('identifies KQ vs K endgame', () => {
    const game = makeMockGame([
      { type: 'q', color: 'w', row: 3, col: 3 }
    ]);
    const result = getJakieEndgameIdentification(game);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('kq-k');
    expect(result!.comment.length).toBeGreaterThan(10);
  });

  test('identifies KR vs K endgame', () => {
    const game = makeMockGame([
      { type: 'r', color: 'w', row: 4, col: 0 }
    ]);
    const result = getJakieEndgameIdentification(game);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('kr-k');
    expect(result!.comment.length).toBeGreaterThan(10);
  });

  test('identifies pure pawn endgame', () => {
    const game = makeMockGame([
      { type: 'p', color: 'w', row: 4, col: 4 },
      { type: 'p', color: 'b', row: 3, col: 3 },
    ]);
    const result = getJakieEndgameIdentification(game);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('pure-pawn');
    expect(result!.comment.length).toBeGreaterThan(10);
  });

  test('identifies rook and pawn endgame', () => {
    const game = makeMockGame([
      { type: 'r', color: 'w', row: 0, col: 0 },
      { type: 'r', color: 'b', row: 7, col: 0 },
      { type: 'p', color: 'w', row: 4, col: 3 },
    ]);
    const result = getJakieEndgameIdentification(game);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('krp-kr');
    expect(result!.comment.length).toBeGreaterThan(10);
  });

  test('identifies opposite-colored bishops', () => {
    // Kings at row=0,col=4 (white) and row=7,col=4 (black)
    // White bishop at row=2,col=0: (2+0)%2=0 → light
    // Black bishop at row=2,col=1: (2+1)%2=1 → dark  → opposite colors
    const game = makeMockGame([
      { type: 'b', color: 'w', row: 2, col: 0 }, // light square
      { type: 'b', color: 'b', row: 2, col: 1 }, // dark square
      { type: 'p', color: 'w', row: 3, col: 3 },
      { type: 'p', color: 'b', row: 4, col: 4 },
    ]);
    const result = getJakieEndgameIdentification(game);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('opposite-bishops');
    expect(result!.comment.length).toBeGreaterThan(10);
  });

  test('identifies same-colored bishops', () => {
    // White bishop at row=2,col=0: (2+0)%2=0 → light
    // Black bishop at row=4,col=0: (4+0)%2=0 → light  → same color
    const game = makeMockGame([
      { type: 'b', color: 'w', row: 2, col: 0 }, // light square
      { type: 'b', color: 'b', row: 4, col: 0 }, // light square
      { type: 'p', color: 'w', row: 3, col: 3 },
      { type: 'p', color: 'b', row: 5, col: 4 },
    ]);
    const result = getJakieEndgameIdentification(game);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('same-bishops');
    expect(result!.comment.length).toBeGreaterThan(10);
  });

  test('comment is always a non-empty string', () => {
    const game = makeMockGame([
      { type: 'q', color: 'w', row: 3, col: 3 }
    ]);
    const result = getJakieEndgameIdentification(game);
    expect(result).not.toBeNull();
    expect(result!.comment.length).toBeGreaterThan(20);
  });

});
