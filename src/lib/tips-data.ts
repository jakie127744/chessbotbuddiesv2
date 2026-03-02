// Basic Pro Tips for Chess Players
export const CHESS_TIPS = [
  "In the opening, prioritize developing your Knights before your Bishops.",
  "Try not to move the same piece twice in the opening unless you have to.",
  "Control the center (squares e4, d4, e5, d5) with your pawns and pieces.",
  "Castle early to keep your King safe and bring your Rooks into the game.",
  "Don't bring your Queen out too early; she can get chased by enemy pieces.",
  "Don't move pawns in front of your castled King unnecessarily.",
  "Connect your Rooks by clearing the back rank (moving Queen and Bishops).",
  "If your opponent ignores the center, punish them by seizing space!",

  // Tactics
  "Always look for 'Checks, Captures, and Threats' before making your move.",
  "A 'Pin' happens when a piece cannot move without exposing a more valuable piece.",
  "A 'Fork' happens when one piece attacks two or more enemy pieces at once.",
  "Be careful of 'Back Rank Mate' – make sure your King has an escape square!",
  "When you are ahead in material, try to trade pieces (but not pawns) to simplify.",
  "Look for 'Discovered Attacks' – moving a piece to reveal a threat from behind it.",
  "A 'Skewer' is like a reverse pin: the more valuable piece is in front and must run!",
  "Always check if your opponent's last move left a piece undefended.",
  "Don't grab a pawn if it opens important lines against your King (Poisoned Pawn).",

  // Strategy
  "Rooks love open files! Place them where there are no pawns blocking the way.",
  "Bishops are better in open positions; Knights are better in closed positions.",
  "A 'Passed Pawn' is a criminal which should be kept under lock and key.", 
  "Don't attack until your development is complete and your King is safe.",
  "If you have a 'Bad Bishop' (blocked by your own pawns), try to trade it off.",
  "Identify your opponent's weaknesses (weak squares, weak pawns) and target them.",
  "Blockade your opponent's isolated queen's pawn with a Knight.",
  "Prophylaxis: Ask yourself 'What does my opponent want to do?' and stop it.",
  "Space advantage? Keep pieces on the board to cramp your opponent.",
  "Cramped position? Try to trade pieces to free up squares for your forces.",

  // Endgame
  "In the endgame, the King becomes a fighting piece. Bring him to the center!",
  "Two connected passed pawns are often stronger than a Rook in the endgame.",
  "Don't rush in the endgame. If you have a winning advantage, take your time.",
  "Opposition: Place your King directly in front of the enemy King to force them back.",
  "Rooks belong behind passed pawns—both yours and your opponent's (Tarrasch Rule).",
  "In King and Pawn endings, the 'Square of the Pawn' tells you if the King can catch it.",
  "Usually, create a passed pawn on the side of the board where you have the majority.",
  "Simplifying into a King and Pawn ending is the easiest way to win when up material.",

  // Psychology & Habits
  "If you make a mistake, take a deep breath. Even Grandmasters blunder!",
  "Play the board, not the rating. Anyone can beat anyone in a single game.",
  "Calculating is hard work. Don't be lazy—check your lines twice!",
  "Have fun! That's the most important rule of all.",
  "Review your games! You learn more from your losses than your wins.",
  "Don't play 'hope chess' – assume your opponent will find the best move.",
  "Sit on your hands! (Metaphorically) Don't make the first move you see.",
  "Time management is part of the game. Don't spend 10 minutes on an obvious recapture."
];
  
  export function getRandomTip(): string {
      const randomIndex = Math.floor(Math.random() * CHESS_TIPS.length);
      return CHESS_TIPS[randomIndex];
  }
