
import { BotProfile } from "./bot-profiles";
import { OpeningVariation } from "./openings-repertoire";
import { pickRandomComment } from "./coach-commentary";

// Opening famous players and fun facts database
export const OPENING_FACTS: Record<string, { players: string[], facts: string[], history?: string }> = {
  'ruy-lopez': {
    players: ['Garry Kasparov', 'Bobby Fischer', 'Anatoly Karpov', 'Magnus Carlsen'],
    facts: [
      'The Ruy Lopez is named after a 16th-century Spanish priest.',
      'This opening has been played at the highest level for over 500 years!',
      'Kasparov called it "the King of Openings".'
    ]
  },
  'sicilian': {
    players: ['Garry Kasparov', 'Bobby Fischer', 'Mikhail Tal', 'Fabiano Caruana'],
    facts: [
      'The Sicilian is the most popular response to 1.e4 at the top level.',
      'Fischer once said "Best by test" about 1.e4, but played the Sicilian as Black!',
      'It leads to the sharpest positions in chess.'
    ]
  },
  'french': {
    players: ['Viktor Korchnoi', 'Tigran Petrosian', 'Evgeny Bareev', 'Wolfgang Uhlmann'],
    facts: [
      'The French Defense was named after a correspondence match in 1834.',
      'It\'s known for creating closed, strategic positions.',
      'Black accepts a cramped position for long-term counterplay.'
    ]
  },
  'caro-kann': {
    players: ['Anatoly Karpov', 'Ulf Andersson', 'Viswanathan Anand', 'Fabiano Caruana'],
    facts: [
      'Named after Horatio Caro and Marcus Kann who analyzed it in the 1880s.',
      'Known as the "thinking player\'s defense".',
      'Karpov used it to win many world championship games!'
    ]
  },
  'queens-gambit': {
    players: ['Boris Spassky', 'Garry Kasparov', 'Vladimir Kramnik', 'Ding Liren'],
    facts: [
      'It\'s not really a gambit - Black can take the pawn but struggles to keep it.',
      'The Netflix series made this opening famous worldwide!',
      'It\'s one of the oldest recorded openings in chess.'
    ]
  },
  'kings-indian': {
    players: ['Garry Kasparov', 'Bobby Fischer', 'Mikhail Gurevich', 'Teimour Radjabov'],
    facts: [
      'Kasparov used this to win some of his most brilliant games.',
      'It\'s known for Black\'s kingside attacking chances.',
      'Bobby Fischer once called it "best for Black".'
    ]
  },
  'nimzo-indian': {
    players: ['Mikhail Botvinnik', 'Viktor Korchnoi', 'Vishy Anand', 'Magnus Carlsen'],
    facts: [
      'Named after Aaron Nimzowitsch, the hypermodern revolutionary.',
      'Black immediately challenges White\'s center control.',
      'One of the most respected defenses at all levels.'
    ]
  },
  'italian': {
    players: ['Paul Morphy', 'Wilhelm Steinitz', 'Fabiano Caruana', 'Wesley So'],
    facts: [
      'One of the oldest recorded openings, analyzed in the 1500s!',
      'The Giuoco Piano was the favorite of romantic-era masters.',
      'Recently became popular again after Magnus started playing it.'
    ]
  }
};

export function getGameStartAnnouncements(
  opening: OpeningVariation, 
  facts: { players: string[], facts: string[], history?: string } | undefined, 
  coach: BotProfile
): string[] {
  const name = opening.name;
  const { category } = coach;
  
  // Base comments for all coaches
  const baseComments: string[] = [];
  
  // Beginner coaches (simpler, more enthusiastic)
  if (category === 'beginner') {
    baseComments.push(
      `Ooh, the **${name}**! I've heard of that one! Let's see how it goes!`,
      `The **${name}**? That sounds fancy! I'm excited!`,
      `We're playing the **${name}**! I read about this in my chess book!`,
      `Cool! The **${name}**! I hope I can remember what to do...`,
      `The **${name}** - I'm still learning this one, but let's try!`
    );
    
    if (facts) {
      const player = facts.players[Math.floor(Math.random() * facts.players.length)];
      baseComments.push(
        `Did you know ${player} plays the **${name}**? They're SO good!`,
        `My favorite player ${player} uses the **${name}**! So cool!`
      );
    }
  }
  
  // Intermediate coaches (more confident)
  else if (category === 'intermediate') {
    baseComments.push(
      `The **${name}** - a solid choice! I know this one well.`,
      `Ah, the **${name}**! Good opening. Let's play it right.`,
      `The **${name}** is interesting. I've studied the main lines.`,
      `Nice! The **${name}**. I can help you with the key ideas here.`,
      `The **${name}** - I've played this many times. Let me guide you.`
    );
    
    if (facts) {
      const player = facts.players[Math.floor(Math.random() * facts.players.length)];
      const fact = facts.facts[Math.floor(Math.random() * facts.facts.length)];
      baseComments.push(
        `The **${name}**! ${player} has had great success with this. ${fact}`,
        `Ah, the **${name}**. Did you know? ${fact}`
      );
    }
  }
  
  // Advanced coaches (expert, analytical)
  else if (category === 'advanced') {
    baseComments.push(
      `The **${name}** - an excellent choice. Let me share the critical ideas.`,
      `Ah, the **${name}**. A theoretically rich opening. I know it deeply.`,
      `The **${name}** is one of my specialties. Pay attention to the key moves.`,
      `Excellent - the **${name}**. This requires precision, but I'll guide you.`,
      `The **${name}** - a weapon of serious tournament players.`
    );
    
    if (facts) {
      const player = facts.players[Math.floor(Math.random() * facts.players.length)];
      const fact = facts.facts[Math.floor(Math.random() * facts.facts.length)];
      baseComments.push(
        `The **${name}**! ${player} has played this at the highest level. ${fact}`,
        `Ah, following in the footsteps of ${player} with the **${name}**. Wise choice. ${fact}`
      );
    }
  }
  
  // Master coaches (authoritative, deep knowledge)
  else {
    baseComments.push(
      `The **${name}**. I've analyzed this extensively. Every move matters.`,
      `Ah, the **${name}**. At my level, I know every nuance of this opening.`,
      `The **${name}** - a world-class weapon. Let me reveal its secrets.`,
      `Excellent choice. The **${name}** has deep strategic and tactical layers.`,
      `The **${name}**. I've played this against titled players. Watch and learn.`
    );
    
    if (facts) {
      const player = facts.players[Math.floor(Math.random() * facts.players.length)];
      const fact = facts.facts[Math.floor(Math.random() * facts.facts.length)];
      const history = facts.history || fact;
      baseComments.push(
        `The **${name}**! ${player} has made history with this. ${history}`,
        `Following grandmaster footsteps with the **${name}**. ${fact}`,
        `The **${name}** - preferred by ${player}. A serious theoretical weapon.`
      );
    }
  }
  
  return baseComments;
}

export function getNoveltyComment(bookMoves: number, coachName: string, lastUsed: string): string {
  let comments: string[];
  
  if (bookMoves < 5) {
    comments = [
      "Deviating from theory so early? That's... bold. Let's see if it works!",
      "Hmm, leaving the book already? Isn't it a bit early for a novelty?",
      "A novelty on move ${bookMoves}? That's either genius or... we'll find out!",
      "Careful! Leaving theory this early can be risky.",
      "Interesting! Playing a sideline already. You're full of surprises!",
      "That's not in the books... but neither were Tal's best moves!",
      "Early novelty! You either know something I don't, or we're in trouble.",
      "Abandoning theory so soon? Fortune favors the bold, I suppose!"
    ];
  } else if (bookMoves < 10) {
    comments = [
      "A novelty! Interesting choice. Let's see where this leads.",
      "Leaving the beaten path. The game begins now!",
      "That's a new move! Time to think on your own.",
      "A sideline departure. Bold and creative!",
      "Novelty time! This is where real chess begins.",
      "You've gone off-script. Now it's all about calculation!",
      "An independent decision! The engine is off, it's just you now.",
      "Interesting novelty! Let's see if your preparation is solid."
    ];
  } else {
    comments = [
      "Wow, a novelty! After ${bookMoves} book moves, let's see if it works!",
      "A prepared novelty? Impressive depth of study!",
      "Leaving theory at this stage - you've clearly done your homework!",
      "That's a serious novelty. This could be theory-changing!",
      "Deep preparation paying off? Let's see how your novelty holds up!",
      "A novelty in the critical zone! The opponent won't know this.",
      "Excellent timing for a novelty. Maximum impact!",
      "After ${bookMoves} moves of theory, a surprise! Well played.",
      "The moment of truth - your novelty is on the board. Make it count!"
    ];
  }

  // Simple string interpolation for ${bookMoves}
  const processedComments = comments.map(c => c.replace('${bookMoves}', bookMoves.toString()));
  
  return pickRandomComment(processedComments, lastUsed);
}

// Function to generate move explanation if no specific comment found
export function generateGenericMoveExplanation(to: string, piece: string): string {
    const p = piece.toLowerCase();
    const map: Record<string, string> = {
        'p': 'pawn',
        'n': 'knight',
        'b': 'bishop',
        'r': 'rook',
        'q': 'queen',
        'k': 'king' 
    };
    const name = map[p] || 'piece';
    
    const explanations = [
        `Moving the ${name} to ${to} improves its position.`,
        `The ${name} is more active on ${to}.`,
        `This move to ${to} controls key squares.`,
        `Repositioning the ${name} to ${to}.`
    ];
    
    return explanations[Math.floor(Math.random() * explanations.length)];
}

// ============================================================================
// COACH JAKIE: FIRST-5-MOVE REACTIONS
// Reacts to specific opening moves with personality and opening speculation.
// ============================================================================

const FIRST_MOVE_REACTIONS: Record<string, string[]> = {
  // White first moves
  'e4': [
    "e4 — the most direct way to fight for the center! Kasparov, Fischer, and Caruana all swear by it.",
    "1.e4! Classic and aggressive. You're in good company — this is the most popular first move at GM level.",
    "e4! 'Best by test' as Fischer said. Let's see what Black does.",
  ],
  'd4': [
    "d4 — solid and positional. You might be heading for a Queen's Gambit, King's Indian, or Dutch. Smart choice.",
    "1.d4! The strategic choice. This usually leads to closed, maneuvering games. I like it.",
    "d4 — you clearly prefer long-term plans over early fireworks. Excellent start.",
  ],
  'c4': [
    "The English Opening! A quiet but deep first move — often transposes into d4 structures.",
    "1.c4 — the English. You're controlling d5 without committing your center pawn. Very flexible!",
    "c4! A favorite of Karpov and Kramnik. You like subtle pressure — I can respect that.",
  ],
  'Nf3': [
    "Nf3 on move 1 — developing and waiting to see what Black does. Very flexible, very modern.",
    "1.Nf3! A Réti-style start. You're not showing your hand yet. Smart.",
  ],
  'g3': [
    "The King's Fianchetto setup! You're planning Bg2 — a hypermodern approach to control the center.",
    "1.g3 — you want to fianchetto the king's bishop. Petrosian loved this kind of setup.",
  ],
  'b3': [
    "The Nimzo-Larsen Attack! 1.b3 — you'll fianchetto the queen's bishop. An unorthodox and creative choice.",
    "1.b3! A Larsen classic. You want long-term pressure from the b2 diagonal.",
  ],
  // Black first responses
  'e5': [
    "e5! The Open Game — symmetrical and fighting. Expect sharp, tactical chess.",
    "1...e5 — the oldest response to e4. You want an open game with counterplay.",
    "e5! Matching control in the center. This can lead to the Ruy Lopez, Italian, or King's Gambit.",
  ],
  'c5': [
    "c5 — the Sicilian Defense! The most popular GM response to e4. You're not giving White a symmetric game.",
    "Sicilian! c5 fights for d4 in an asymmetric way. This leads to the sharpest positions in chess.",
    "The Sicilian! Fischer loved it as Black. You're fighting for the center from the flank.",
  ],
  'e6': [
    "e6 — looks like the French Defense might be on the cards! A solid, strategic choice.",
    "1...e6 — could be the French or English. You're building a solid pawn structure.",
  ],
  'c6': [
    "c6 — the Caro-Kann is likely! A very solid, respected defense. Karpov's favorite.",
    "1...c6 — Caro-Kann territory. Solid and precise — this is the 'thinking player's defense'.",
  ],
  'd5': [
    "d5! Challenging the center directly. Could be the Scandinavian, or if 1.d4 was played, a Queen's Gambit Declined setup.",
    "1...d5 — central control right away. You're not shy about the center!",
  ],
  'd6': [
    "d6 — hm, potentially the Pirc or a Sicilian setup depending on what follows.",
    "1...d6 — a flexible start. Could lead to many different formations.",
  ],
  'Nf6': [
    "Nf6! A hypermodern response — you're attacking White's center before establishing your own.",
    "1...Nf6 — the Alekhine Defense or the start of an Indian Defense. Very aggressive and dynamic!",
  ],
  'g6': [
    "g6 — the King's Indian or Pirc territory. You're planning to fianchetto and launch a kingside attack!",
    "1...g6 — fianchetto incoming! Kasparov loved this kind of dynamic counterplay.",
  ],
};

const OPENING_SPECULATION: Record<string, string[]> = {
  // After 1.e4 e5
  'e4-e5': [
    "With e4 and e5 on the board, this is an Open Game — could be Ruy Lopez, Italian, King's Gambit…",
    "Both sides in the center! The next few moves will tell us which classical opening emerges.",
  ],
  // After 1.e4 c5
  'e4-c5': [
    "The Sicilian battle is underway! Will it be Najdorf, Dragon, Classical, Scheveningen…?",
    "Sicilian territory — there are more than 30 major variations here. Exciting!",
  ],
  // After 1.d4 Nf6
  'd4-Nf6': [
    "d4 and Nf6 — Indian Defense territory! Could be King's Indian, Nimzo, Queen's Indian, or Grünfeld.",
    "Black hypermodern! Nf6 prepares to challenge d4 indirectly. Many sharp lines possible.",
  ],
  // After 1.d4 d5
  'd4-d5': [
    "Symmetric centers — Queen's Gambit territory! White usually plays c4 next.",
    "d4 and d5 — classical Queen's Pawn Game. This often leads to the QGD or Slav.",
  ],
  // After 1.e4 e6
  'e4-e6': [
    "e4 and e6 — French Defense coming! Watch for the classic pawn tension d5 vs e4.",
    "Looks like a French Defense setup! A solid, strategic system for Black.",
  ],
  // After 1.e4 c6
  'e4-c6': [
    "e4 and c6 — the Caro-Kann is on! Black fights for d5 with a solid pawn structure.",
    "Caro-Kann! Black wants to play d5 and maintain a strong center. Very principled.",
  ],
};

/**
 * Returns a Jakie reaction comment for the first 5 moves.
 * Returns null if no specific reaction is available.
 */
export function getJakieFirstMoveReaction(
  san: string,
  moveNumber: number,
  allSanHistory: string[]
): string | null {
  if (moveNumber > 5) return null;

  // Check for 2-move combination speculation
  if (allSanHistory.length >= 2) {
    const key = `${allSanHistory[0]}-${allSanHistory[1]}`;
    const speculation = OPENING_SPECULATION[key];
    if (speculation && moveNumber === 2) {
      // Only fire once on move 2
      return speculation[Math.floor(Math.random() * speculation.length)];
    }
  }

  // Single-move reaction (first 2 moves especially)
  if (moveNumber <= 2) {
    const reactions = FIRST_MOVE_REACTIONS[san];
    if (reactions) {
      return reactions[Math.floor(Math.random() * reactions.length)];
    }
  }

  return null;
}

// ============================================================================
// COACH JAKIE: OPENING TRANSPOSITION DETECTION
// ============================================================================

/**
 * Returns a Jakie comment when the active opening name changes (transposition).
 * Returns null if no transposition detected.
 */
export function detectOpeningTransposition(
  prevOpeningName: string | null,
  currentOpeningName: string | null
): string | null {
  if (!prevOpeningName || !currentOpeningName) return null;
  if (prevOpeningName === currentOpeningName) return null;

  const comments = [
    `Interesting! We've transposed from the **${prevOpeningName}** into a **${currentOpeningName}**. These things happen — openings are interconnected!`,
    `Transposition alert! The game shifted from the **${prevOpeningName}** to the **${currentOpeningName}** with that move. Stay sharp!`,
    `Did you notice? We just moved from **${prevOpeningName}** territory into the **${currentOpeningName}**. A subtle but important shift!`,
    `We've transposed! The **${prevOpeningName}** just became a **${currentOpeningName}** — same moves, different name, new ideas!`,
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}

// ============================================================================
// COACH JAKIE: NAMED TACTIC APPLAUSE
// ============================================================================

const TACTIC_APPLAUSE: Record<string, string[]> = {
  fork: [
    "Beautiful fork! You're attacking two pieces at once — that's the power of a fork!",
    "Knight fork! Both pieces are under fire simultaneously. The opponent has to choose what to save.",
    "Brilliant fork! One move, two threats. That's efficiency — remember this pattern!",
    "A fork! You've split the opponent's forces. This tactic is worth remembering — it wins material.",
  ],
  pin: [
    "Well spotted — that's a pin! The pinned piece can't move without exposing something more valuable behind it.",
    "Nice pin! The opponent's piece is frozen in place. Now squeeze it!",
    "Excellent pin! A pinned piece is a paralyzed piece. This is a fundamental tactic — well done!",
    "Pin! The opponent is in trouble — that piece can't move freely anymore.",
  ],
  skewer: [
    "Superb skewer! You're forcing the more valuable piece to move, and winning what's behind it.",
    "A skewer! The opposite of a pin — you attack the valuable piece first to expose what's behind it. Brilliant!",
    "Nice skewer! Force the king (or queen) to move and take the piece behind it. Well seen!",
    "Skewer! You found the reverse pin. The opponent must lose material — excellent vision!",
  ],
  discovered_attack: [
    "Discovered attack! Moving one piece unleashed a hidden threat from another. Very clever!",
    "Nice discovered attack — you revealed a second attacker that was hiding behind your own piece!",
    "Discovered attack! One move, two threats. This is one of the most powerful patterns in chess.",
    "Brilliant! Moving that piece uncovered a powerful discovered attack. The opponent won't see it coming!",
  ],
};

/**
 * Returns a Jakie-flavored tactic applause line for the named tactic.
 */
export function getJakieTacticApplause(
  tacticType: 'fork' | 'pin' | 'skewer' | 'discovered_attack'
): string {
  const lines = TACTIC_APPLAUSE[tacticType] || TACTIC_APPLAUSE['fork'];
  return lines[Math.floor(Math.random() * lines.length)];
}

// ============================================================================
// COACH JAKIE: ENDGAME IDENTIFICATION
// ============================================================================

type EndgameType =
  | 'kq-k'
  | 'kr-k'
  | 'kbb-k'
  | 'kbn-k'
  | 'kq-kr'
  | 'kr-kr'
  | 'kr-kp'
  | 'krp-kr'
  | 'opposite-bishops'
  | 'same-bishops'
  | 'pure-pawn'
  | 'knight-pawn'
  | 'queen-pawn'
  | 'rook-pawn'
  | 'complex';

const ENDGAME_COMMENTS: Record<EndgameType, string[]> = {
  'kq-k': [
    "King + Queen vs King! This is a forced win — push the opponent's king to the corner and then deliver mate. Remember: queen restricts, king approaches!",
    "KQ vs K endgame! It's theoretically won, but requires technique. Don't stalemate — give the king air first!",
  ],
  'kr-k': [
    "King + Rook vs King — a classic endgame! Use the Lucena or Philidor method. Activate your king and use the rook to cut the opponent's king off.",
    "KR vs K! Theoretically won. Use the 'box' method — your rook cuts the enemy king into a smaller and smaller area.",
  ],
  'kbb-k': [
    "Two bishops vs lone King! Coordinated bishops are very powerful. Drive the king to the corner using a mating net.",
    "KBB vs K — with two bishops working together, this is a straightforward win. Use them on adjacent diagonals!",
  ],
  'kbn-k': [
    "King, Bishop, and Knight vs King — one of the hardest endgames to convert! You must drive the king to the corner that matches your bishop's color.",
    "KBN vs K is famously difficult. It requires over 30 precise moves. Drive the king to the right-colored corner!",
  ],
  'kq-kr': [
    "Queen vs Rook endgame — generally a win for the queen, but it's tricky! The rook defends at range. Technique is key.",
    "KQ vs KR — a theoretical win in most cases. Use checks to drive the rook away from the king.",
  ],
  'kr-kr': [
    "Rook and King vs Rook and King — this is likely a draw! Know the Philidor position and the Lucena: key defensive techniques.",
    "Rook endgame! These are the most common and most complex endgames. Remember: passive rooks lose, active rooks draw or win!",
  ],
  'kr-kp': [
    "Rook vs Pawn — can be a draw even with the rook! If it's a rook pawn or bishop pawn on the 7th, the weaker side may hold.",
    "Rook vs Pawn endgame. The rook usually wins, but watch out for fortresses. Cut the king off and stop the pawn!",
  ],
  'krp-kr': [
    "Rook + Pawn vs Rook — the most common and complex endgame! Use the Lucena position if you're ahead, or the Philidor if you're defending.",
    "Rook and pawn endgame! Rook activity matters more than material here. The rook should be behind the passed pawn.",
  ],
  'opposite-bishops': [
    "Opposite-colored bishops! This endgame is famous for drawing even when one side is a pawn or two up. The attacking side's pawns can't be protected by the bishop.",
    "Opposite-colored bishops — the drawing equalizer! The stronger side often can't make progress because only one bishop controls the critical squares.",
  ],
  'same-bishops': [
    "Same-colored bishops! The stronger side has better winning chances here — the bishops fight for the same squares, so the stronger side can dominate.",
    "Same-color bishop endgame — the extra pawn can be decisive. Keep the bishops active and look to create a passed pawn.",
  ],
  'pure-pawn': [
    "Pure pawn endgame! King activity and opposition are everything now. Get your king to the front of your pawns!",
    "No pieces left — just kings and pawns! This is where 'opposition' and 'key squares' decide the game. Every pawn move is permanent!",
  ],
  'knight-pawn': [
    "Knight and pawn endgames — knights are tricky here! They're much better in closed positions with pawns on both sides of the board.",
    "Knight endgame! Keep in mind: knights struggle with rook pawns. A knight can't defend from all angles like a bishop.",
  ],
  'queen-pawn': [
    "Queen and pawn endgame — queen + pawn is usually a win, but watch out for stalemate traps!",
    "QP endgame! The queen dominates, but don't let the opponent's king hide in a stalemate fortress.",
  ],
  'rook-pawn': [
    "Rook and pawn endgame — the most common endgame on the board! Remember: rooks belong behind passed pawns.",
    "Rook + pawn vs rook + pawn — pure technique. Activity and passed pawns decide who wins here.",
  ],
  'complex': [
    "We're in an endgame! Material is down — activate your king, it's a fighting piece now!",
    "Endgame phase! Every tempo matters here. Look for passed pawns and king infiltration opportunities.",
  ],
};

/**
 * Analyzes remaining pieces to identify the endgame type.
 * Returns a Jakie comment identifying the endgame, or null if not in endgame.
 */
export function getJakieEndgameIdentification(
  game: { board: () => (({ type: string; color: string } | null))[][]; history: () => string[] }
): { type: EndgameType; comment: string } | null {
  const board = game.board();
  const history = game.history();

  // Only fire after move 30+ or when few pieces remain
  if (history.length < 20) return null;

  const pieces: { type: string; color: string }[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type !== 'k') pieces.push(p);
    }
  }

  // Count by type and color
  const count = (type: string, color?: string) =>
    pieces.filter(p => p.type === type && (color ? p.color === color : true)).length;

  const totalNonKing = pieces.length;
  const wQ = count('q', 'w'), bQ = count('q', 'b');
  const wR = count('r', 'w'), bR = count('r', 'b');
  const wB = count('b', 'w'), bB = count('b', 'b');
  const wN = count('n', 'w'), bN = count('n', 'b');
  const wP = count('p', 'w'), bP = count('p', 'b');

  let type: EndgameType = 'complex';

  // KQ vs K
  if (totalNonKing === 1 && (wQ === 1 || bQ === 1)) type = 'kq-k';
  // KR vs K
  else if (totalNonKing === 1 && (wR === 1 || bR === 1)) type = 'kr-k';
  // KBB vs K
  else if (totalNonKing === 2 && ((wB === 2 && bQ + bR + bB + bN + bP === 0) || (bB === 2 && wQ + wR + wB + wN + wP === 0))) type = 'kbb-k';
  // KBN vs K
  else if (totalNonKing === 2 && ((wB === 1 && wN === 1 && bQ + bR + bB + bN + bP === 0) || (bB === 1 && bN === 1 && wQ + wR + wB + wN + wP === 0))) type = 'kbn-k';
  // KQ vs KR
  else if (totalNonKing === 2 && ((wQ === 1 && bR === 1) || (bQ === 1 && wR === 1)) && wP + bP === 0) type = 'kq-kr';
  // KR vs KR (both have rooks, no other pieces)
  else if (wR >= 1 && bR >= 1 && wQ + bQ + wB + bB + wN + bN === 0) type = wP + bP === 0 ? 'kr-kr' : 'krp-kr';
  // KR vs lone K + pawn(s)
  else if ((wR === 1 && bR === 0 && bQ === 0) || (bR === 1 && wR === 0 && wQ === 0)) {
    if (wP + bP <= 2) type = 'kr-kp';
  }
  // Opposite-colored bishops
  else if (wQ + bQ + wR + bR + wN + bN === 0 && wB === 1 && bB === 1) {
    // Check bishop colors by finding their squares
    let wBwhite = false, bBwhite = false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p?.type === 'b') {
          const isLightSq = (r + c) % 2 === 0;
          if (p.color === 'w') wBwhite = isLightSq;
          else bBwhite = isLightSq;
        }
      }
    }
    type = wBwhite !== bBwhite ? 'opposite-bishops' : 'same-bishops';
  }
  // Pure pawn endgame
  else if (wQ + bQ + wR + bR + wB + bB + wN + bN === 0 && wP + bP > 0) type = 'pure-pawn';
  // Knight + pawn
  else if (wQ + bQ + wR + bR + wB + bB === 0 && (wN + bN > 0) && (wP + bP > 0)) type = 'knight-pawn';
  // Queen + pawn
  else if (wR + bR + wB + bB + wN + bN === 0 && wQ + bQ > 0) type = 'queen-pawn';
  // Rook + pawn
  else if (wQ + bQ + wB + bB + wN + bN === 0 && wR + bR > 0) type = 'rook-pawn';

  const pool = ENDGAME_COMMENTS[type];
  const comment = pool[Math.floor(Math.random() * pool.length)];
  return { type, comment };
}
