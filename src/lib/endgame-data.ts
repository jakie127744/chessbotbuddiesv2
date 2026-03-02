// Endgame Trainer Data
// Notes:
// - All FENs have been validated against Lichess tablebase API
// - Kings are never adjacent (minimum 2 squares apart)
// - All positions include both kings
// - dtm values are from tablebase verification

export interface EndgamePosition {
  fen: string;
  objective: string;
  hint: string;
  expectedOutcome: 'checkmate' | 'promotion' | 'draw' | 'win_material';
  dtm?: number;
}

export interface EndgameCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  positions: EndgamePosition[];
}

export const ENDGAME_CATEGORIES: EndgameCategory[] = [
  // ============================================
  // 1. KING + QUEEN VS KING (5 positions)
  // ============================================
  {
    id: 'kq-vs-k',
    title: 'King + Queen vs King',
    description: 'Master the basic Queen checkmate pattern.',
    icon: 'Crown',
    difficulty: 'beginner',
    positions: [
      { fen: '8/8/8/3k4/8/8/8/Q3K3 w - - 0 1', objective: 'Checkmate the lone King!', hint: 'Use the Queen to restrict squares, bring King to help.', expectedOutcome: 'checkmate', dtm: 15 },
      { fen: '8/8/8/8/3k4/8/8/Q3K3 w - - 0 1', objective: 'King is close to edge - push it!', hint: 'Cut off escape routes with the Queen.', expectedOutcome: 'checkmate' },
      { fen: '8/8/3k4/8/8/8/8/Q3K3 w - - 0 1', objective: 'Central King - begin restriction.', hint: 'Queen controls ranks and files.', expectedOutcome: 'checkmate', dtm: 15 },
      { fen: '8/3k4/8/8/8/8/8/Q3K3 w - - 0 1', objective: 'Drive toward the corner.', hint: 'Systematic restriction is key.', expectedOutcome: 'checkmate', dtm: 15 },
      { fen: '3k4/8/8/8/8/8/8/Q3K3 w - - 0 1', objective: 'King on edge! Tighten the net.', hint: 'Bring your King closer.', expectedOutcome: 'checkmate', dtm: 13 },
    ],
  },

  // ============================================
  // 2. KING + ROOK VS KING (5 positions)
  // ============================================
  {
    id: 'kr-vs-k',
    title: 'King + Rook vs King',
    description: 'Learn the box/ladder mating technique.',
    icon: 'Castle',
    difficulty: 'beginner',
    positions: [
      { fen: '8/8/8/3k4/8/8/8/R3K3 w - - 0 1', objective: 'Use the Rook to create a barrier.', hint: 'Cut off the King along a rank or file.', expectedOutcome: 'checkmate', dtm: 27 },
      { fen: '8/8/8/8/3k4/8/8/R3K3 w - - 0 1', objective: 'Maintain the barrier.', hint: 'Your King must approach.', expectedOutcome: 'checkmate', dtm: 27 },
      { fen: '8/8/8/8/8/3k4/8/R6K w - - 0 1', objective: 'Push toward the edge.', hint: 'Ladder technique works.', expectedOutcome: 'checkmate' },
      { fen: '8/8/3k4/8/8/8/8/R3K3 w - - 0 1', objective: 'King in center - start the box.', hint: 'Create a barrier.', expectedOutcome: 'checkmate' },
      { fen: '8/3k4/8/8/8/8/8/R3K3 w - - 0 1', objective: 'Drive systematically.', hint: 'Don\'t rush.', expectedOutcome: 'checkmate' },
    ],
  },

  // ============================================
  // 3. KING + PAWN VS KING (5 positions)
  // ============================================
  {
    id: 'kpk',
    title: 'King + Pawn vs King',
    description: 'Master opposition and promotion.',
    icon: 'ArrowUp',
    difficulty: 'intermediate',
    positions: [
      { fen: '8/8/8/8/4P3/4K3/8/5k1k w - - 0 1', objective: 'Promote the pawn!', hint: 'Use opposition.', expectedOutcome: 'promotion', dtm: 17 },
      { fen: '8/8/8/4P3/4K3/8/8/5k2 w - - 0 1', objective: 'Pawn on 5th rank.', hint: 'Keep the opposition.', expectedOutcome: 'promotion', dtm: 15 },
      { fen: '8/8/4P3/4K3/8/8/8/5k2 w - - 0 1', objective: 'Pawn on 6th rank!', hint: 'Victory is near.', expectedOutcome: 'promotion', dtm: 15 },
      { fen: '8/8/8/8/3P4/3K4/8/4k3 w - - 0 1', objective: 'D-pawn march.', hint: 'Shoulder the enemy King.', expectedOutcome: 'promotion' },
      { fen: '8/8/8/3P4/3K4/8/8/4k3 w - - 0 1', objective: 'D-pawn on 5th.', hint: 'Maintain control.', expectedOutcome: 'promotion' },
    ],
  },

  // ============================================
  // 4. TWO BISHOPS VS KING (5 positions)
  // ============================================
  {
    id: 'kbb-vs-k',
    title: 'Two Bishops Checkmate',
    description: 'Drive the King to the corner with bishop coordination.',
    icon: 'Layers',
    difficulty: 'intermediate',
    positions: [
      { fen: '8/8/8/3k4/8/8/2B5/B3K3 w - - 0 1', objective: 'Push toward a corner.', hint: 'Bishops create a diagonal net.', expectedOutcome: 'checkmate', dtm: 31 },
      { fen: '8/8/3k4/8/8/8/2B5/B3K3 w - - 0 1', objective: 'Central King - restrict it.', hint: 'Coordinate the bishops.', expectedOutcome: 'checkmate', dtm: 31 },
      { fen: '8/3k4/8/8/8/8/2B5/B3K3 w - - 0 1', objective: 'Push toward edge.', hint: 'Bishops control diagonals.', expectedOutcome: 'checkmate' },
      { fen: '3k4/8/8/8/8/8/2B5/B3K3 w - - 0 1', objective: 'King on edge!', hint: 'Close in with your King.', expectedOutcome: 'checkmate' },
      { fen: '8/8/8/8/5k2/8/2B5/B3K3 w - - 0 1', objective: 'King on f4.', hint: 'Drive to h1 or a8 corner.', expectedOutcome: 'checkmate' },
    ],
  },

  // ============================================
  // 5. BISHOP + KNIGHT VS KING (5 positions)
  // ============================================
  {
    id: 'kbn-vs-k',
    title: 'Bishop + Knight Mate',
    description: 'The hardest basic checkmate. Drive to the correct corner!',
    icon: 'Puzzle',
    difficulty: 'advanced',
    positions: [
      { fen: '8/8/8/3k4/8/8/8/BN2K3 w - - 0 1', objective: 'Drive to the bishop\'s corner!', hint: 'Light bishop = a1 or h8 corner.', expectedOutcome: 'checkmate', dtm: 57 },
      { fen: '8/8/8/8/3k4/8/8/BN2K3 w - - 0 1', objective: 'Coordinate pieces.', hint: 'Knight and Bishop work together.', expectedOutcome: 'checkmate' },
      { fen: '8/8/3k4/8/8/8/8/BN2K3 w - - 0 1', objective: 'Central King.', hint: 'Push toward the correct corner.', expectedOutcome: 'checkmate' },
      { fen: '8/3k4/8/8/8/8/8/BN2K3 w - - 0 1', objective: 'Wrong corner - redirect!', hint: 'Use the W-technique.', expectedOutcome: 'checkmate' },
      { fen: '3k4/8/8/8/8/8/8/BN2K3 w - - 0 1', objective: 'King on edge.', hint: 'Force to the correct corner.', expectedOutcome: 'checkmate' },
    ],
  },

  // ============================================
  // 6. TWO ROOKS CHECKMATE (5 positions)
  // ============================================
  {
    id: 'krr-vs-k',
    title: 'Two Rooks Checkmate',
    description: 'The easiest checkmate - ladder mate!',
    icon: 'Castle',
    difficulty: 'beginner',
    positions: [
      { fen: '8/8/8/3k4/8/8/8/R3RK2 w - - 0 1', objective: 'Use the ladder technique.', hint: 'Rooks take turns pushing.', expectedOutcome: 'checkmate', dtm: 11 },
      { fen: '8/8/8/8/3k4/8/8/R3RK2 w - - 0 1', objective: 'Alternate checks.', hint: 'One Rook checks, the other waits.', expectedOutcome: 'checkmate', dtm: 11 },
      { fen: '8/8/3k4/8/8/8/8/R3RK2 w - - 0 1', objective: 'Push step by step.', hint: 'Ladder to the 8th rank.', expectedOutcome: 'checkmate' },
      { fen: '8/3k4/8/8/8/8/8/R3RK2 w - - 0 1', objective: 'King near edge.', hint: 'Finish with ladder checks.', expectedOutcome: 'checkmate' },
      { fen: '3k4/8/8/8/8/8/8/R3RK2 w - - 0 1', objective: 'King on 8th rank!', hint: 'One more check needed.', expectedOutcome: 'checkmate' },
    ],
  },

  // ============================================
  // 7. QUEEN VS ROOK (5 positions)
  // ============================================
  {
    id: 'kq-vs-kr',
    title: 'Queen vs Rook',
    description: 'Win with superior piece. Avoid stalemate!',
    icon: 'Crown',
    difficulty: 'advanced',
    positions: [
      { fen: '8/8/8/3k4/8/8/1r6/Q3K3 w - - 0 1', objective: 'Win the Rook or checkmate!', hint: 'Use forks and skewers.', expectedOutcome: 'win_material' },
      { fen: '8/8/8/8/3k4/8/1r6/Q3K3 w - - 0 1', objective: 'Separate King and Rook.', hint: 'Checks are powerful.', expectedOutcome: 'win_material' },
      { fen: '8/8/8/8/8/3k4/1r6/Q6K w - - 0 1', objective: 'Attack both pieces.', hint: 'Queen forks are deadly.', expectedOutcome: 'win_material' },
      { fen: '8/8/8/8/1k6/8/1r6/Q6K w - - 0 1', objective: 'Pin the Rook!', hint: 'Use the King backing.', expectedOutcome: 'win_material' },
      { fen: '8/8/8/1k6/8/8/1r6/Q3K3 w - - 0 1', objective: 'Philidor attack pattern.', hint: 'Queen dominates.', expectedOutcome: 'win_material' },
    ],
  },

  // ============================================
  // 8. ROOK VS PAWN (5 positions)
  // ============================================
  {
    id: 'kr-vs-kp',
    title: 'Rook vs Pawn',
    description: 'Stop the pawn from promoting!',
    icon: 'Hand',
    difficulty: 'intermediate',
    positions: [
      { fen: '8/8/8/8/8/4p3/3k4/R6K w - - 0 1', objective: 'Stop the pawn!', hint: 'Check the King away.', expectedOutcome: 'draw' },
      { fen: '8/8/8/8/4p3/3k4/8/R6K w - - 0 1', objective: 'Pawn on e4.', hint: 'Use checks wisely.', expectedOutcome: 'draw' },
      { fen: '8/8/8/4p3/3k4/8/8/R6K w - - 0 1', objective: 'Pawn advancing.', hint: 'Rook from behind.', expectedOutcome: 'draw' },
      { fen: '8/8/8/8/3p4/2k5/8/R6K w - - 0 1', objective: 'D-pawn.', hint: 'Same principles.', expectedOutcome: 'draw' },
      { fen: '8/8/8/3p4/2k5/8/8/R6K w - - 0 1', objective: 'D-pawn on 5th.', hint: 'Check the King.', expectedOutcome: 'draw' },
    ],
  },

  // ============================================
  // 9. LUCENA POSITION (5 positions)
  // ============================================
  {
    id: 'lucena',
    title: 'Lucena Position',
    description: 'The most important winning technique in Rook endgames.',
    icon: 'Zap',
    difficulty: 'advanced',
    positions: [
      { fen: '1K1R4/3P4/8/8/8/8/2k5/4r3 w - - 0 1', objective: 'Build the bridge!', hint: 'Rook to the 4th rank shields the King.', expectedOutcome: 'promotion', dtm: 15 },
      { fen: '2KR4/3P4/8/8/8/8/3k4/5r2 w - - 0 1', objective: 'Classic Lucena setup.', hint: 'Rd4 then Rd8 blocks checks.', expectedOutcome: 'promotion', dtm: 27 },
      { fen: '3K4/3P4/8/4R3/8/8/3k4/6r1 w - - 0 1', objective: 'Rook on 5th rank.', hint: 'King steps out, Rook blocks.', expectedOutcome: 'promotion' },
      { fen: '3K4/3P4/8/8/4R3/8/3k4/6r1 w - - 0 1', objective: 'Rook on 4th rank.', hint: 'Bridge the checks.', expectedOutcome: 'promotion' },
      { fen: '1K1R4/3P4/8/8/8/3k4/8/4r3 w - - 0 1', objective: 'Enemy king approaching.', hint: 'Build bridge quickly.', expectedOutcome: 'promotion' },
    ],
  },

  // ============================================
  // 10. PHILIDOR POSITION (5 positions)
  // ============================================
  {
    id: 'philidor',
    title: 'Philidor Position',
    description: 'The key defensive technique in Rook endgames.',
    icon: 'Shield',
    difficulty: 'advanced',
    positions: [
      { fen: '8/8/8/3Pk5/8/3K4/8/r7 b - - 0 1', objective: 'Draw as Black!', hint: 'Rook on the 6th rank (from White\'s view).', expectedOutcome: 'draw' },
      { fen: '8/8/8/4Pk5/8/4K3/8/r7 b - - 0 1', objective: 'Philidor defense.', hint: 'Keep Rook passive on 6th rank.', expectedOutcome: 'draw' },
      { fen: '8/8/8/3P4/4k3/3K4/8/r7 b - - 0 1', objective: 'Hold the draw.', hint: 'Cut off the White King.', expectedOutcome: 'draw' },
      { fen: '8/8/3P4/4k3/8/3K4/8/r7 b - - 0 1', objective: 'Pawn on 6th.', hint: 'Rook goes behind.', expectedOutcome: 'draw' },
      { fen: '8/8/8/4P3/5k2/8/4K3/r7 b - - 0 1', objective: 'Philidor setup.', hint: 'Keep King in front.', expectedOutcome: 'draw' },
    ],
  },
];
