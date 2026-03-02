
import { BotProfile } from "./bot-profiles";

// ------------------------------------------------------------------
// INTERFACES
// ------------------------------------------------------------------

export type CoachIntent = 
  | 'Intro' 
  | 'OpeningPrinciple' 
  | 'StrategicMistake' 
  | 'TacticalOpportunity' 
  | 'EndgameTechnique' 
  | 'HangingPiece'
  | 'KingSafety'
  | 'MissedTactic'
  | 'Blunder' 
  | 'GoodMove' 
  | 'MyPlan'
  | 'Check'
  | 'Mate'
  | 'Victory'
  | 'Defeat'
  | 'Draw'
  | 'Neutral' // General chat/idle
  | 'Strict'; // Coaching mode strictness

export interface CommentaryLine {
  text: string;
  intent: CoachIntent;
  tone: 'supportive' | 'neutral' | 'strict' | 'aggressive' | 'kid' | 'humorous';
}

export interface CoachCommentarySet {
  intro: CommentaryLine[];
  opening: CommentaryLine[];
  middlegame: CommentaryLine[]; // Includes general idle/trash talk
  endgame: CommentaryLine[];
  warnings: CommentaryLine[]; // Hanging pieces, blunders, safety
  praise: CommentaryLine[];   // Good moves
  events: {
    check: CommentaryLine[];
    mate: CommentaryLine[];
    blunder: CommentaryLine[];
    gameEnd: {
      win: CommentaryLine[];
      loss: CommentaryLine[];
      draw: CommentaryLine[];
    }
  };
}

// ------------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------------

export function line(text: string, intent: CoachIntent, tone: CommentaryLine['tone'] = 'neutral'): CommentaryLine {
  return { text, intent, tone };
}

export function mapIntentToType(intent: CoachIntent): string {
  switch (intent) {
    case 'HangingPiece':
    case 'KingSafety':
    case 'Blunder':
    case 'StrategicMistake':
      return 'warning';
    case 'GoodMove':
      return 'success';
    case 'Intro':
    case 'Neutral':
    case 'Strict':
     return 'info';
    case 'Check':
    case 'Mate':
      return 'alert';
    default:
      return 'info';
  }
}

// ------------------------------------------------------------------
// DATA PLACEHOLDERS
// ------------------------------------------------------------------


const LEY_AN_DATA: CoachCommentarySet = {
  intro: [
    line("Dad showed me this move… I hope I do it right!", 'Intro', 'kid'),
    line("I’m still learning… don’t laugh too much.", 'Intro', 'kid'),
    line("I want to be as good as Izy one day.", 'Intro', 'kid'),
    line("I hope Dad doesn’t get sad… he’s fun.", 'Intro', 'kid'),
    line("I love playing chess with my family!", 'Intro', 'kid'),
    line("Dad says practice makes pawns stronger.", 'Intro', 'kid'),
    line("Izy is teaching me new tricks every day.", 'Intro', 'kid'),
    line("I love secret moves that surprise Dad.", 'Intro', 'kid'),
    line("Dad smiles… even when I make mistakes.", 'Intro', 'kid')
  ],
  opening: [
    line("Dad says knights jump funny. I like it.", 'OpeningPrinciple', 'kid'),
    line("Dad said castles keep kings safe.", 'OpeningPrinciple', 'kid'),
    line("Dad taught me how pawns grow into queens.", 'OpeningPrinciple', 'kid'),
    line("I like drawing crowns on my pawns.", 'OpeningPrinciple', 'kid'),
    line("Dad says practice makes me stronger.", 'OpeningPrinciple', 'kid')
  ],
  middlegame: [
    line("Izy is so fast! How does she do that?", 'Neutral', 'kid'),
    line("Dad said patience is power… I’m trying!", 'Neutral', 'kid'),
    line("I hope my king is happy.", 'Neutral', 'kid'),
    line("Dad said castles are cozy for kings.", 'Neutral', 'kid'),
    line("I like secret moves like Izy does.", 'Neutral', 'kid'),
    line("I like little surprises like Dad taught me.", 'Neutral', 'kid'),
    line("My bishop likes to hide behind pawns.", 'Neutral', 'kid'),
    line("Dad says knights are tricky… I like that.", 'Neutral', 'kid'),
    line("I hope my king doesn’t feel lonely.", 'Neutral', 'kid'),
    line("Dad taught me to look at all squares.", 'Neutral', 'kid'),
    line("My knight is hopping on a secret mission.", 'Neutral', 'kid'),
    line("My pawns march bravely forward.", 'Neutral', 'kid'),
    line("Dad taught me to look for forks.", 'Neutral', 'kid'),
    line("I like when pawns grow big.", 'Neutral', 'kid'),
    line("Izy is so fast… I hope I catch up!", 'Neutral', 'kid'),
    line("Watch out, my bishop is sneaky!", 'Neutral', 'kid'),
    line("My bishop is tiptoeing quietly.", 'Neutral', 'kid'),
    line("My knight is hopping quietly again.", 'Neutral', 'kid'),
    line("My bishop tiptoes like a ninja.", 'Neutral', 'kid'),
    line("Izy beat Dad again! That’s so cool!", 'Neutral', 'kid'),
    line("Izy taught me a secret trick!", 'Neutral', 'kid'),
    line("Izy laughs when she beats Dad.", 'Neutral', 'kid'),
    line("Izy moves like a superhero!", 'Neutral', 'kid'),
    line("Izy says my knight is funny-looking.", 'Neutral', 'kid'),
    line("Izy beat me yesterday… and Dad laughed.", 'Neutral', 'kid'),
    line("Dad taught me how to make forks… sometimes.", 'Neutral', 'kid'),
    line("Izy says pawns are tiny superheroes.", 'Neutral', 'kid'),
    line("Dad says even small pieces are important.", 'Neutral', 'kid'),
    line("Izy says my pawns are brave little soldiers.", 'Neutral', 'kid'),
    line("Izy moves faster than I can count.", 'Neutral', 'kid'),
    line("Izy taught me how to protect my rook.", 'Neutral', 'kid'),
    line("Izy laughs when Dad loses again.", 'Neutral', 'kid'),
    line("Izy says my queen is a little funny.", 'Neutral', 'kid'),
    line("Dad says even small mistakes are okay.", 'Neutral', 'kid'),
    line("Izy says I’m getting better!", 'Neutral', 'kid'),
    line("I like pretending my pawns are superheroes.", 'Neutral', 'kid'),
    line("Izy beats Dad… and it’s so funny!", 'Neutral', 'kid'),
    line("Izy says I’m a little tricky now.", 'Neutral', 'kid'),
    line("Izy says my queen sparkles.", 'Neutral', 'kid'),
    line("Izy laughs when I do funny moves.", 'Neutral', 'kid'),
    line("Izy says my bishop is clever.", 'Neutral', 'kid'),
    line("Dad smiles when I win a pawn.", 'GoodMove', 'kid'),
    line("Dad smiles when I beat a pawn.", 'GoodMove', 'kid'),
    line("My rook is zooming across the board!", 'GoodMove', 'kid'),
    line("My rook zooms like a race car!", 'GoodMove', 'kid'),
    line("My rook zooms across the board again.", 'GoodMove', 'kid')
  ],
  endgame: [
    line("I hope my king is happy.", 'EndgameTechnique', 'kid'),
    line("Dad taught me how pawns grow into queens.", 'EndgameTechnique', 'kid')
  ],
  warnings: [
    line("Oops! My pawn ran away from dad.", 'Blunder', 'kid'),
    line("Oops! My queen tripped.", 'Blunder', 'kid'),
    line("Oops! My queen tripped on the board.", 'Blunder', 'kid'),
    line("Oops! My pawn went too far.", 'Blunder', 'kid'),
    line("Oops! My rook slipped.", 'Blunder', 'kid'),
    line("Oops! My queen tripped again.", 'Blunder', 'kid'),
    line("Oops! My pawn ran too fast.", 'Blunder', 'kid'),
    line("Oops! My bishop tripped on a square.", 'Blunder', 'kid'),
    line("Oops! My king slipped a little.", 'Blunder', 'kid'),
    line("Oops! My knight jumped too far.", 'Blunder', 'kid'),
    line("Oops! Did I scare your bishop?", 'HangingPiece', 'kid'),
    line("Oops! Did I bump your piece?", 'HangingPiece', 'kid'),
    line("Oops! Did I scare your rook?", 'HangingPiece', 'kid'),
    line("Oops! Did I bump your knight?", 'HangingPiece', 'kid'),
    line("Oops! Did my knight jump too high?", 'HangingPiece', 'kid')
  ],
  praise: [
    line("Izy says, ‘Watch out for sneaky moves!’", 'GoodMove', 'kid'),
    line("Dad smiles when I do something smart.", 'GoodMove', 'kid'),
    line("Izy cheers when I do a good move.", 'GoodMove', 'kid')
  ],
  events: {
    check: [
        line("Check! Did you see it coming?", 'Check', 'kid'),
        line("Check! My pawn is brave.", 'Check', 'kid'),
        line("Check! Dad didn’t see that coming.", 'Check', 'kid'),
        line("Check! My queen is dancing.", 'Check', 'kid'),
        line("Check! My king is smiling.", 'Check', 'kid'),
        line("Check! My bishop is sneaky.", 'Check', 'kid'),
        line("Check! Did I scare your king?", 'Check', 'kid'),
        line("Check! My queen is sparkling.", 'Check', 'kid'),
        line("Check! My pawn is sneaky today.", 'Check', 'kid'),
        line("Check! My rook is zooming fast.", 'Check', 'kid'),
        line("Check! My king says hi.", 'Check', 'kid'),
        line("Check! My bishop is dancing quietly.", 'Check', 'kid'),
        line("Check! My queen is happy today.", 'Check', 'kid'),
        line("Check! My knight is sneaky.", 'Check', 'kid'),
        line("Check! My rook is very strong.", 'Check', 'kid'),
        line("Check! My knight is hiding quietly.", 'Check', 'kid'),
        line("Check! My queen is dancing today.", 'Check', 'kid')
    ],
    mate: [
        line("I won? Yay! Good game!", 'Mate', 'kid'),
        line("Izy says I played good!", 'Mate', 'kid')
    ],
    blunder: [
        line("Oops! That was a mistake!", 'Blunder', 'kid')
    ],
    gameEnd: {
        win: [line("I won! Can I tell Dad?", 'Victory', 'kid')],
        loss: [line("You won! You are good.", 'Defeat', 'kid')],
        draw: [line("A draw! We are both winners.", 'Draw', 'kid')]
    }
  }
};

const JAMES_DATA: CoachCommentarySet = {
  intro: [
    line("Blitz time! Hope you can keep up.", 'Intro', 'neutral'),
    line("I love chaos. Do you?", 'Intro', 'neutral'),
    line("Quick moves, quicker wins!", 'Intro', 'neutral'),
    line("I’m all about speed today.", 'Intro', 'neutral'),
    line("Time is ticking… better think fast.", 'Intro', 'neutral'),
    line("Blitz is my playground.", 'Intro', 'neutral'),
    line("Blitz is all about intuition and chaos.", 'Intro', 'neutral'),
    line("I like fast attacks that feel like fireworks.", 'Intro', 'neutral'),
    line("I love the thrill of 3-minute games.", 'Intro', 'neutral'),
    line("I like games where every second counts.", 'Intro', 'neutral'),
    line("Blitz is my jam.", 'Intro', 'neutral'),
    line("Blitz is like chess on rocket fuel.", 'Intro', 'neutral'),
    line("Fast games, faster brains.", 'Intro', 'neutral'),
    line("Blitz is about instincts, not perfection.", 'Intro', 'neutral'),
    line("Blitz is my way of having fun.", 'Intro', 'neutral'),
    line("Fast thinking is the name of the game.", 'Intro', 'neutral'),
    line("Blitz is chaos… and I love it.", 'Intro', 'neutral'),
    line("Fast games, big smiles.", 'Intro', 'neutral'),
    line("Blitz is my happy place.", 'Intro', 'neutral')
  ],
  opening: [
    line("Fast thinking saves games.", 'OpeningPrinciple', 'neutral'),
    line("I like moving quickly… but carefully.", 'OpeningPrinciple', 'neutral'),
    line("Blitz is exciting because every move counts.", 'OpeningPrinciple', 'neutral')
  ],
  middlegame: [
    line("Oops, did you blink? I moved again.", 'Neutral', 'neutral'),
    line("My pawns are faster than your brain.", 'Neutral', 'neutral'),
    line("Don’t worry, I only laugh after you blunder.", 'Neutral', 'neutral'),
    line("Your queen looks nervous. Cute.", 'Neutral', 'neutral'),
    line("Did you know pawns can be scary in blitz?", 'Neutral', 'neutral'),
    line("My rook slides faster than a coffee spill.", 'Neutral', 'neutral'),
    line("I move fast, but I see the board.", 'Neutral', 'neutral'),
    line("I love watching opponents panic in 10 seconds.", 'Neutral', 'neutral'),
    line("Speed matters, but brains matter more.", 'Neutral', 'neutral'),
    line("My knight hops like it’s in a hurry… because it is.", 'Neutral', 'neutral'),
    line("Your rook looks worried.", 'Neutral', 'neutral'),
    line("I move like a blur, but I see everything.", 'Neutral', 'neutral'),
    line("Fast pawns are sneaky pawns.", 'Neutral', 'neutral'),
    line("Your queen is asking for trouble.", 'Neutral', 'neutral'),
    line("I love pressure… it makes the game fun.", 'Neutral', 'neutral'),
    line("My rook slides like it’s on roller skates.", 'Neutral', 'neutral'),
    line("Your pawns better watch out.", 'Neutral', 'neutral'),
    line("My knight is sneaky and speedy.", 'Neutral', 'neutral'),
    line("I like seeing the panic in your king’s eyes.", 'Neutral', 'neutral'),
    line("Fast moves, little mistakes, big fun.", 'Neutral', 'neutral'),
    line("Your king looks nervous… I like that.", 'Neutral', 'neutral'),
    line("I move so fast even I get surprised sometimes.", 'Neutral', 'neutral'),
    line("Your king better watch out.", 'Neutral', 'neutral'),
    line("I love timing my attacks perfectly.", 'Neutral', 'neutral'),
    line("Fast tactics make everything fun.", 'Neutral', 'neutral'),
    line("I like moving quickly, thinking quickly.", 'Neutral', 'neutral'),
    line("Did you know blitz champions sometimes see 5 moves ahead instinctively?", 'Neutral', 'neutral'),
    line("I love a good trap… it’s like a surprise party for your pieces.", 'GoodMove', 'neutral'),
    line("Check! That was fun.", 'GoodMove', 'neutral'),
    line("Check! That was a little lightning strike.", 'GoodMove', 'neutral'),
    line("Check! That move felt good.", 'GoodMove', 'neutral'),
    line("Check! That was fun.", 'GoodMove', 'neutral'),
    line("Check! That felt clean.", 'GoodMove', 'neutral'),
    line("Check! That was a little shock.", 'GoodMove', 'neutral'),
    line("Check! That move was spicy.", 'GoodMove', 'neutral'),
    line("Check! Hope you enjoyed that one!", 'GoodMove', 'neutral')
  ],
  endgame: [
    line("Blitz endgames are wild!", 'EndgameTechnique', 'neutral')
  ],
  warnings: [
    line("Oops! My knight got ahead of itself.", 'Blunder', 'neutral'),
    line("Oops! My queen tripped… just kidding, she’s fine.", 'Blunder', 'neutral'),
    line("Oops, I almost lost a pawn… almost.", 'Blunder', 'neutral'),
    line("Oops! My bishop got lost for a second.", 'Blunder', 'neutral'),
    line("Oops! My knight jumped too early.", 'Blunder', 'neutral'),
    line("Oops! I almost hung a pawn… almost.", 'Blunder', 'neutral'),
    line("Oops! Did my bishop scare your queen?", 'Blunder', 'neutral'),
    line("Oops! My knight tripped over a pawn.", 'Blunder', 'neutral'),
    line("Oops! My queen skipped a square.", 'Blunder', 'neutral'),
    line("Oops! My pawn slid too far.", 'Blunder', 'neutral'),
    line("Oops! My bishop slipped.", 'Blunder', 'neutral'),
    line("Oops! Did my pawn scare your knight?", 'Blunder', 'neutral'),
    line("Oops! My rook jumped ahead.", 'Blunder', 'neutral'),
    line("Oops! My bishop tripped… barely.", 'Blunder', 'neutral'),
    line("Oops! My queen got a little ahead of herself.", 'Blunder', 'neutral'),
    line("Oops! My rook slid too far.", 'Blunder', 'neutral'),
    line("Oops! Did my knight scare your queen?", 'Blunder', 'neutral')
  ],
  praise: [
    line("I hope your king is ready.", 'GoodMove', 'neutral'),
    line("I hope you like lightning-fast tactics.", 'GoodMove', 'neutral'),
    line("I hope your king enjoys the ride.", 'GoodMove', 'neutral'),
    line("I hope your pawns are ready.", 'GoodMove', 'neutral'),
    line("I love sneaky little attacks.", 'GoodMove', 'neutral'),
    line("I love sneaky forks in blitz.", 'GoodMove', 'neutral')
  ],
  events: {
    check: [
        line("Check! Did you see that coming?", 'Check', 'neutral'),
        line("Check! My bishop is sneaky.", 'Check', 'neutral'),
        line("Check! That was a little surprise.", 'Check', 'neutral'),
        line("Check! Quick tactics are my specialty.", 'Check', 'neutral'),
        line("Check! Did you blink?", 'Check', 'neutral'),
        line("Check! Did that surprise you?", 'Check', 'neutral'),
        line("Check! Quick tactics strike again.", 'Check', 'neutral'),
        line("Check! Did you see that one?", 'Check', 'neutral'),
        line("Check! My knight is fast today.", 'Check', 'neutral'),
        line("Check! That was a little sneak attack.", 'Check', 'neutral'),
        line("Check! My bishop says hello.", 'Check', 'neutral')
    ],
    mate: [
        line("I love when a tactic works in one move.", 'Mate', 'neutral'),
        line("I love attacks that happen in one blink.", 'Mate', 'neutral')
    ],
    blunder: [
        line("Oops, that hangs something.", 'Blunder', 'neutral')
    ],
    gameEnd: {
        win: [line("Speed wins!", 'Victory', 'neutral')],
        loss: [line("You are faster than me.", 'Defeat', 'neutral')],
        draw: [line("Draw! Fast game!", 'Draw', 'neutral')]
    }
  }
};

const ORION_DATA: CoachCommentarySet = {
  intro: [
    line("Watch out! I’m about to slam dunk this check.", 'Intro', 'neutral'),
    line("I move fast when the board is open, just like a fast break.", 'Intro', 'neutral'),
    line("The board is my court, and I’m in control.", 'Intro', 'neutral'),
    line("I plan my attacks like I plan game plays.", 'Intro', 'neutral'),
    line("I love traps—like full-court presses in basketball.", 'Intro', 'neutral'),
    line("I plan like a coach setting up the final play.", 'Intro', 'neutral'),
    line("I move like a team moving in perfect sync.", 'Intro', 'neutral'),
    line("I move like a team moving in perfect formation.", 'Intro', 'neutral'),
    line("Control the center like you control the paint.", 'Intro', 'neutral'),
    line("Defense wins games… and chess matches too.", 'Intro', 'neutral')
  ],
  opening: [
    line("Control the center like you control the paint.", 'OpeningPrinciple', 'neutral'),
    line("I plan ahead, like a coach calling plays.", 'OpeningPrinciple', 'neutral'),
    line("I plan attacks like I plan a championship game.", 'OpeningPrinciple', 'neutral')
  ],
  middlegame: [
    line("This knight moves like LeBron on a fast break.", 'Neutral', 'neutral'),
    line("Keep your pieces moving like a well-run offense.", 'Neutral', 'neutral'),
    line("Remember, positioning is everything.", 'Neutral', 'neutral'),
    line("I set traps like I set plays for the team.", 'Neutral', 'neutral'),
    line("My queen is driving to the center!", 'Neutral', 'neutral'),
    line("Don’t sleep on my pawns—they hustle hard.", 'Neutral', 'neutral'),
    line("Always watch the diagonals, like reading the court.", 'Neutral', 'neutral'),
    line("I like slow build-ups—just like setting a play.", 'Neutral', 'neutral'),
    line("Even pawns can score big if you plan well.", 'Neutral', 'neutral'),
    line("My knight moves like a point guard weaving through traffic.", 'Neutral', 'neutral'),
    line("Timing is key, in basketball and in chess.", 'Neutral', 'neutral'),
    line("Control the long diagonals like controlling the wings.", 'Neutral', 'neutral'),
    line("I like to set screens with my pawns.", 'Neutral', 'neutral'),
    line("My rook slides like a fast baseline drive.", 'Neutral', 'neutral'),
    line("Remember, coordination is everything.", 'Neutral', 'neutral'),
    line("I move my pieces like I move my players—strategically.", 'Neutral', 'neutral'),
    line("Even small pieces can create big plays.", 'Neutral', 'neutral'),
    line("I like to bait opponents like fakes on the court.", 'Neutral', 'neutral'),
    line("The king can’t escape my zone defense.", 'Neutral', 'neutral'),
    line("Pawns are like bench players—they can surprise you.", 'Neutral', 'neutral'),
    line("My knight weaves through traffic like a pro.", 'Neutral', 'neutral'),
    line("Even bishops can dunk if they get the angle right.", 'Neutral', 'neutral'),
    line("Control your squares like controlling rebounds.", 'Neutral', 'neutral'),
    line("I like to fake my moves to confuse opponents.", 'Neutral', 'neutral'),
    line("King safety is like protecting the ball.", 'Neutral', 'neutral'),
    line("Even pawns can score if you know the angles.", 'Neutral', 'neutral'),
    line("I like reading the board like reading the defense.", 'Neutral', 'neutral'),
    line("Plan your attacks like running a fast break.", 'Neutral', 'neutral'),
    line("Even pawns can be MVPs if used correctly.", 'Neutral', 'neutral'),
    line("I love positioning—like controlling the lane.", 'Neutral', 'neutral'),
    line("I like slow setups… they catch opponents off guard.", 'Neutral', 'neutral'),
    line("Even pawns can make big plays if used right.", 'Neutral', 'neutral'),
    line("I love when a plan comes together, on board or court.", 'Neutral', 'neutral'),
    line("My queen is driving to the center!", 'GoodMove', 'neutral'),
    line("My queen just drove to the rim.", 'GoodMove', 'neutral'),
    line("My queen just scored.", 'GoodMove', 'neutral'),
    line("Oops! Did my rook block your path?", 'GoodMove', 'neutral'),
    line("Oops! Did my rook block your path?", 'GoodMove', 'neutral')
  ],
  endgame: [
    line("Active King wins endgames.", 'EndgameTechnique', 'neutral')
  ],
  warnings: [
    line("Oops! Did my rook just steal the spotlight?", 'Blunder', 'neutral'),
    line("Oops! Did my bishop steal your shot?", 'Blunder', 'neutral'),
    line("Oops! My bishop got caught on a pick.", 'Blunder', 'neutral'),
    line("Oops! Did my queen sneak past your defense?", 'Blunder', 'neutral'),
    line("Oops! My knight just crossed the paint.", 'Blunder', 'neutral'),
    line("Oops! Did my bishop block your path?", 'Blunder', 'neutral'),
    line("Oops! My rook just stole your move.", 'Blunder', 'neutral'),
    line("Oops! Did my pawn sneak past?", 'Blunder', 'neutral'),
    line("Oops! My knight jumped over the defense.", 'Blunder', 'neutral'),
    line("Oops! Did my bishop block your plan?", 'Blunder', 'neutral'),
    line("Oops! Did my rook cut off your path?", 'Blunder', 'neutral'),
    line("Oops! My bishop just crossed the paint.", 'Blunder', 'neutral'),
    line("Oops! My knight snuck past your pieces.", 'Blunder', 'neutral'),
    line("Oops! My queen went on a surprise drive.", 'Blunder', 'neutral'),
    line("Oops! My knight just intercepted a move.", 'Blunder', 'neutral'),
    line("Oops! Did my bishop block your queen?", 'Blunder', 'neutral'),
    line("Oops! My knight just zipped past.", 'Blunder', 'neutral'),
    line("Oops! My rook slipped into your zone.", 'Blunder', 'neutral'),
    line("Oops! Did my knight sneak through your defense?", 'Blunder', 'neutral'),
    line("Oops! Did you see that coming? I sure did!", 'Blunder', 'neutral')
  ],
  praise: [
    line("Good defense can frustrate even the best attackers.", 'GoodMove', 'neutral'),
    line("Even small sacrifices can create big gains.", 'GoodMove', 'neutral'),
    line("Even small sacrifices can lead to big victories.", 'GoodMove', 'neutral'),
    line("Your pieces better watch the court… I mean board.", 'GoodMove', 'neutral')
  ],
  events: {
    check: [
        line("Check! That’s a little crossover on your king.", 'Check', 'neutral'),
        line("Check! That’s a slam dunk tactic.", 'Check', 'neutral'),
        line("Check! My knight is going for the rim.", 'Check', 'neutral'),
        line("Check! My queen is taking the lane.", 'Check', 'neutral'),
        line("Check! That’s a little steal and score.", 'Check', 'neutral'),
        line("Check! The king needs a timeout after that one.", 'Check', 'neutral'),
        line("Check! My rook is running a fast break.", 'Check', 'neutral'),
        line("Check! My queen just drove to the rim.", 'Check', 'neutral'),
        line("Check! That was a clean drive to the center.", 'Check', 'neutral'),
        line("Check! My queen takes the lane.", 'Check', 'neutral'),
        line("Check! My rook is running baseline like a pro.", 'Check', 'neutral'),
        line("Check! That was a fast break you didn’t see coming.", 'Check', 'neutral'),
        line("Check! That knight is unstoppable today.", 'Check', 'neutral'),
        line("Check! My queen just scored.", 'Check', 'neutral'),
        line("Check! My rook slides into position perfectly.", 'Check', 'neutral'),
        line("Check! My bishop is sneaky in the paint.", 'Check', 'neutral'),
        line("Check! My rook is unstoppable.", 'Check', 'neutral'),
        line("Check! That was a little alley-oop tactic.", 'Check', 'neutral'),
        line("Check! My queen is dominating the board.", 'Check', 'neutral'),
        line("Check! My bishop just made a sneak attack.", 'Check', 'neutral'),
        line("Check! That was a fast and clean tactic.", 'Check', 'neutral')
    ],
    mate: [
        line("I love when a plan comes together, on board or court.", 'Mate', 'neutral'),
        line("Control the center like you control the paint.", 'Mate', 'neutral')
    ],
    blunder: [
        line("Your king looks like it needs a timeout.", 'Blunder', 'neutral'),
        line("Your pieces look like they need some conditioning.", 'Blunder', 'neutral')
    ],
    gameEnd: {
        win: [line("Slam dunk!", 'Victory', 'neutral')],
        loss: [line("You got game.", 'Defeat', 'neutral')],
        draw: [line("Overtime? Or draw?", 'Draw', 'neutral')]
    }
  }
};

const Z_DATA: CoachCommentarySet = {
  intro: [
    line("I’m concentrating… don’t mind me.", 'Intro', 'neutral'),
    line("I’m learning fast… and having fun.", 'Intro', 'neutral'),
    line("I study the board like a puzzle.", 'Intro', 'neutral'),
    line("I like planning quietly in the background.", 'Intro', 'neutral'),
    line("I like imagining every piece has a personality.", 'Intro', 'neutral'),
    line("I like planning quietly, step by step.", 'Intro', 'neutral'),
    line("I like moving quietly but thinking loudly.", 'Intro', 'neutral'),
    line("I like playing smart… and maybe beating Dad again.", 'Intro', 'neutral')
  ],
  opening: [
    line("Quiet moves are sometimes the strongest.", 'OpeningPrinciple', 'neutral'),
    line("I like thinking two steps ahead.", 'OpeningPrinciple', 'neutral'),
    line("Even small pieces can surprise you.", 'OpeningPrinciple', 'neutral')
  ],
  middlegame: [
    line("I like when the board tells me secrets.", 'Neutral', 'neutral'),
    line("Quietly, my pawns are plotting.", 'Neutral', 'neutral'),
    line("I like making tricky little traps.", 'Neutral', 'neutral'),
    line("Even the smallest move can change everything.", 'Neutral', 'neutral'),
    line("I like when pieces work together quietly.", 'Neutral', 'neutral'),
    line("Even pawns can be heroes.", 'Neutral', 'neutral'),
    line("I like watching the board carefully.", 'Neutral', 'neutral'),
    line("Quiet strategies can surprise loudly.", 'Neutral', 'neutral'),
    line("I like learning from every move I play.", 'Neutral', 'neutral'),
    line("I like setting little surprises for fun.", 'Neutral', 'neutral'),
    line("Quiet moves can lead to big wins.", 'Neutral', 'neutral'),
    line("I study every square carefully.", 'Neutral', 'neutral'),
    line("I like thinking quietly, like a shadow.", 'Neutral', 'neutral'),
    line("Even the smallest detail matters.", 'Neutral', 'neutral'),
    line("I like setting traps no one expects.", 'Neutral', 'neutral'),
    line("Quiet moves can be very powerful.", 'Neutral', 'neutral'),
    line("I like watching and waiting for the perfect moment.", 'Neutral', 'neutral'),
    line("Even the shyest piece can surprise you.", 'Neutral', 'neutral'),
    line("I like planning while everyone else moves fast.", 'Neutral', 'neutral'),
    line("Quiet strategies are my favorite.", 'Neutral', 'neutral'),
    line("Even pawns have wisdom to share.", 'Neutral', 'neutral'),
    line("I like tiny moves that make big differences.", 'Neutral', 'neutral'),
    line("Quiet patience wins games.", 'Neutral', 'neutral'),
    line("I like thinking before anyone notices.", 'Neutral', 'neutral'),
    line("Even a single square can be important.", 'Neutral', 'neutral'),
    line("I like surprises on the board.", 'Neutral', 'neutral'),
    line("Quiet moves, big impact.", 'Neutral', 'neutral'),
    line("I like winning without a lot of noise.", 'Neutral', 'neutral'),
    line("Even the smallest plan can win.", 'Neutral', 'neutral'),
    line("Every move tells a story.", 'Neutral', 'neutral'),
    line("I like watching and waiting for mistakes.", 'Neutral', 'neutral'),
    line("Quiet strategies can win big games.", 'Neutral', 'neutral'),
    line("Even small moves can change the game.", 'Neutral', 'neutral'),
    line("I like clever little tricks.", 'Neutral', 'neutral'),
    line("I like thinking quietly like a shadow.", 'Neutral', 'neutral'),
    line("Oops! My knight jumped over unexpectedly.", 'GoodMove', 'neutral'),
    line("Oops! My bishop moved too fast.", 'GoodMove', 'neutral'),
    line("Oops! My rook slid into position.", 'GoodMove', 'neutral'),
    line("Oops! My pawn went on an adventure.", 'GoodMove', 'neutral'),
    line("Oops! My queen jumped ahead.", 'GoodMove', 'neutral'),
    line("Oops! My rook slipped into position.", 'GoodMove', 'neutral'),
    line("Oops! My queen moved too fast.", 'GoodMove', 'neutral'),
    line("Oops! My bishop moved just right.", 'GoodMove', 'neutral'),
    line("Oops! My pawn moved unexpectedly.", 'GoodMove', 'neutral'),
    line("Oops! My bishop moved ahead.", 'GoodMove', 'neutral'),
    line("Oops! My pawn went on a little adventure.", 'GoodMove', 'neutral'),
    line("Oops! My rook moved without warning.", 'GoodMove', 'neutral')
  ],
  endgame: [
    line("Even small pieces can surprise you.", 'EndgameTechnique', 'neutral'),
    line("Even small sacrifices can be clever.", 'EndgameTechnique', 'neutral')
  ],
  warnings: [
    line("Oops! Did my pawn sneak past?", 'Blunder', 'neutral'),
    line("Oops! My knight snuck past your defense.", 'Blunder', 'neutral'),
    line("Oops! Did my bishop trick you?", 'Blunder', 'neutral'),
    line("Oops! My queen snuck past your defense.", 'Blunder', 'neutral'),
    line("Oops! My knight slipped behind your defenses.", 'Blunder', 'neutral'),
    line("Oops! My queen snuck past quietly.", 'Blunder', 'neutral'),
    line("Oops! My knight snuck behind your pieces.", 'Blunder', 'neutral'),
    line("Oops! My pawn sneaked past.", 'Blunder', 'neutral'),
    line("Oops! My pawn slid into a secret square.", 'Blunder', 'neutral'),
    line("Oops! My rook slid past unnoticed.", 'Blunder', 'neutral'),
    line("Oops! My bishop moved like a ghost.", 'Blunder', 'neutral'),
    line("Oops! My knight jumped quietly.", 'Blunder', 'neutral'),
    line("Oops! My rook slid behind the line.", 'Blunder', 'neutral'),
    line("Oops! My bishop just made a wise little trick.", 'Blunder', 'neutral')
  ],
  praise: [
    line("I hope your bishop is paying attention.", 'GoodMove', 'neutral'),
    line("Even small sacrifices can be clever.", 'GoodMove', 'neutral'),
    line("Quiet strategies can surprise loudly.", 'GoodMove', 'neutral'),
    line("I like learning from every move I play.", 'GoodMove', 'neutral'),
    line("Even a single pawn can turn the tide.", 'GoodMove', 'neutral'),
    line("Quiet patience beats noisy attacks.", 'GoodMove', 'neutral'),
    line("Even the smallest detail matters.", 'GoodMove', 'neutral'),
    line("Even small moves can change the game.", 'GoodMove', 'neutral')
  ],
  events: {
    check: [
        line("Check! I hope you saw that coming.", 'Check', 'neutral'),
        line("Check! That move felt right.", 'Check', 'neutral'),
        line("Check! Did you blink?", 'Check', 'neutral'),
        line("Check! My queen is ready to strike.", 'Check', 'neutral'),
        line("Check! That knight is clever today.", 'Check', 'neutral'),
        line("Check! Did you see my plan?", 'Check', 'neutral'),
        line("Check! My pawns are ready for anything.", 'Check', 'neutral'),
        line("Check! Did my bishop scare you?", 'Check', 'neutral'),
        line("Check! That knight is unstoppable.", 'Check', 'neutral'),
        line("Check! My rook is very patient.", 'Check', 'neutral'),
        line("Check! That pawn is braver than it looks.", 'Check', 'neutral'),
        line("Check! My queen is quiet but deadly.", 'Check', 'neutral'),
        line("Check! Did you see my little plan?", 'Check', 'neutral'),
        line("Check! My knight is clever today.", 'Check', 'neutral'),
        line("Check! My rook is very focused.", 'Check', 'neutral'),
        line("Check! My bishop is hidden but ready.", 'Check', 'neutral'),
        line("Check! My queen is patient and smart.", 'Check', 'neutral'),
        line("Check! My pawns are marching secretly.", 'Check', 'neutral'),
        line("Check! My knight is tricky today.", 'Check', 'neutral'),
        line("Check! My rook is ready for anything.", 'Check', 'neutral'),
        line("Check! My bishop is clever.", 'Check', 'neutral'),
        line("Check! My queen is calm but ready.", 'Check', 'neutral'),
        line("Check! My pawns are ready to surprise.", 'Check', 'neutral')
    ],
    mate: [
        line("I like playing smart… and maybe beating Dad again.", 'Mate', 'neutral'),
        line("Quiet patience wins games.", 'Mate', 'neutral'),
        line("I like winning without a lot of noise.", 'Mate', 'neutral'),
        line("Even the smallest plan can win.", 'Mate', 'neutral'),
        line("Quiet strategies can win big games.", 'Mate', 'neutral')
    ],
    blunder: [
        line("I hope your king is ready.", 'Blunder', 'neutral'),
        line("Oops! My rook is sneaky.", 'Blunder', 'neutral'),
        line("Oops! Did my pawn sneak past?", 'Blunder', 'neutral'),
        line("Oops! Did my bishop trick you?", 'Blunder', 'neutral')
    ],
    gameEnd: {
        win: [line("Quiet victory.", 'Victory', 'neutral')],
        loss: [line("Good game.", 'Defeat', 'neutral')],
        draw: [line("Draw.", 'Draw', 'neutral')]
    }
  }
};

const WARREN_DATA: CoachCommentarySet = {
  intro: [
    line("Did you know a rook moves like a satellite in orbit?", 'Intro', 'neutral'),
    line("Chess is a lot like physics—every action has a reaction.", 'Intro', 'neutral'),
    line("Chess is a system… just like the solar system.", 'Intro', 'neutral'),
    line("I study the board like I study spacecraft telemetry.", 'Intro', 'neutral'),
    line("I love chess because it's full of physics.", 'Intro', 'neutral'),
    line("Chess is like engineering… every piece has a role.", 'Intro', 'neutral'),
    line("Chess is like space… vast, full of possibilities.", 'Intro', 'neutral'),
    line("I like planning ahead… like a NASA mission.", 'Intro', 'neutral'),
    line("I like using the board like a mission control center.", 'Intro', 'neutral'),
    line("I hope your king is ready for some gravity.", 'Intro', 'neutral')
  ],
  opening: [
    line("I calculate my moves… like rocket trajectories.", 'OpeningPrinciple', 'neutral'),
    line("I like controlling the center like controlling a launchpad.", 'OpeningPrinciple', 'neutral'),
    line("Planning is important… whether rockets or chess.", 'OpeningPrinciple', 'neutral')
  ],
  middlegame: [
    line("I like plotting my moves carefully… like plotting a flight path.", 'Neutral', 'neutral'),
    line("A little strategy goes a long way… like a rocket boost.", 'Neutral', 'neutral'),
    line("I like thinking three moves ahead… just like calculating orbits.", 'Neutral', 'neutral'),
    line("My knight hops like it's zero gravity.", 'Neutral', 'neutral'),
    line("I like moving carefully, like adjusting thrusters.", 'Neutral', 'neutral'),
    line("Pawns are underrated… but very effective.", 'Neutral', 'neutral'),
    line("I like thinking in vectors and angles.", 'Neutral', 'neutral'),
    line("I like calculating outcomes… and sometimes ignoring them.", 'Neutral', 'neutral'),
    line("I like treating every piece like a satellite with a mission.", 'Neutral', 'neutral'),
    line("Sometimes the quietest moves are the most powerful.", 'Neutral', 'neutral'),
    line("I like thinking logically… and sometimes creatively.", 'Neutral', 'neutral'),
    line("I like visualizing the board in 3D.", 'Neutral', 'neutral'),
    line("I like predicting outcomes… like weather in space.", 'Neutral', 'neutral'),
    line("Pawns may be small, but they have potential energy.", 'Neutral', 'neutral'),
    line("I like precision… in chess and in spacecraft.", 'Neutral', 'neutral'),
    line("I like subtle strategies… like fine-tuning instruments.", 'Neutral', 'neutral'),
    line("I like thinking ahead… multiple moves, multiple scenarios.", 'Neutral', 'neutral'),
    line("Small errors can cascade… physics is funny that way.", 'Neutral', 'neutral'),
    line("I like using logic… and intuition when necessary.", 'Neutral', 'neutral'),
    line("I like calculating the best path forward.", 'Neutral', 'neutral'),
    line("Every piece has energy… just like rockets.", 'Neutral', 'neutral'),
    line("I like careful planning… but love surprises too.", 'Neutral', 'neutral'),
    line("Pawns are like tiny astronauts… they can grow up to be queens!", 'GoodMove', 'neutral')
  ],
  endgame: [
    line("Even small pieces can cause big collisions.", 'EndgameTechnique', 'neutral'),
    line("I like careful planning… but love surprises too.", 'EndgameTechnique', 'neutral')
  ],
  warnings: [
    line("Oops! My bishop just went off course.", 'Blunder', 'neutral'),
    line("Oops! My knight just did a lunar hop.", 'Blunder', 'neutral'),
    line("Oops! Did my rook just escape your orbit?", 'Blunder', 'neutral'),
    line("Oops! My pawn just slipped past the defenses.", 'Blunder', 'neutral'),
    line("Oops! My rook is on a little detour.", 'Blunder', 'neutral'),
    line("Oops! My knight did a gravity-assisted jump.", 'Blunder', 'neutral'),
    line("Oops! Did my queen just warp forward?", 'Blunder', 'neutral'),
    line("Oops! My knight made an unexpected orbit.", 'Blunder', 'neutral'),
    line("Oops! My bishop slipped past unnoticed.", 'Blunder', 'neutral'),
    line("Oops! My rook is moving faster than I intended.", 'Blunder', 'neutral'),
    line("Oops! My pawn accelerated too quickly.", 'Blunder', 'neutral'),
    line("Oops! My knight slipped into your formation.", 'Blunder', 'neutral'),
    line("Oops! My rook did a minor course correction.", 'Blunder', 'neutral'),
    line("Oops! Did my knight just teleport?", 'Blunder', 'neutral'),
    line("Oops! My pawn just jumped unexpectedly.", 'Blunder', 'neutral'),
    line("Oops! My bishop slipped past your defenses.", 'Blunder', 'neutral'),
    line("Oops! My queen accelerated suddenly.", 'Blunder', 'neutral'),
    line("Oops! My knight just hopped over a tricky square.", 'Blunder', 'neutral'),
    line("Oops! My rook moved a bit too fast.", 'Blunder', 'neutral'),
    line("Oops! My knight slipped through unnoticed.", 'Blunder', 'neutral'),
    line("Oops! My rook is cruising through your defenses.", 'Blunder', 'neutral'),
    line("Oops! My knight just jumped unexpectedly.", 'Blunder', 'neutral'),
    line("Oops! My pawn is moving faster than planned.", 'Blunder', 'neutral'),
    line("Oops! My queen just had a successful mission!", 'Blunder', 'neutral')
  ],
  praise: [
    line("Even small pawns can have big impact forces.", 'GoodMove', 'neutral'),
    line("Even small pieces can cause big collisions.", 'GoodMove', 'neutral'),
    line("Even pawns can reach escape velocity if used right.", 'GoodMove', 'neutral'),
    line("Even small mistakes can create big reactions.", 'GoodMove', 'neutral'),
    line("Even a single move can have a huge effect.", 'GoodMove', 'neutral'),
    line("Even the smallest pawn can become a queen… amazing!", 'GoodMove', 'neutral'),
    line("Even small sacrifices can produce big gains.", 'GoodMove', 'neutral'),
    line("Even pawns can be astronauts in disguise.", 'GoodMove', 'neutral'),
    line("Every move has a calculated impact.", 'GoodMove', 'neutral'),
    line("Even small moves can change the outcome drastically.", 'GoodMove', 'neutral'),
    line("Even the quietest piece can surprise you.", 'GoodMove', 'neutral'),
    line("Even minor moves can change the trajectory.", 'GoodMove', 'neutral'),
    line("Even a pawn can reach escape velocity.", 'GoodMove', 'neutral'),
    line("Even pawns can make history.", 'GoodMove', 'neutral'),
    line("Even small moves can have big momentum.", 'GoodMove', 'neutral'),
    line("Even the smallest piece can make a huge impact.", 'GoodMove', 'neutral')
  ],
  events: {
    check: [
        line("Check! That's some precise engineering.", 'Check', 'neutral'),
        line("Check! That move is scientifically proven… in my head.", 'Check', 'neutral'),
        line("Check! My queen is on a mission.", 'Check', 'neutral'),
        line("Check! My bishop is accelerating.", 'Check', 'neutral'),
        line("Check! My queen is launching an attack.", 'Check', 'neutral'),
        line("Check! My bishop just curved through space.", 'Check', 'neutral'),
        line("Check! My rook is accelerating to the center.", 'Check', 'neutral'),
        line("Check! My bishop is on a secret trajectory.", 'Check', 'neutral'),
        line("Check! My rook just landed perfectly.", 'Check', 'neutral'),
        line("Check! My queen is targeting your king.", 'Check', 'neutral'),
        line("Check! My knight is on a precise course.", 'Check', 'neutral'),
        line("Check! My bishop is in perfect alignment.", 'Check', 'neutral'),
        line("Check! My queen is executing a perfect maneuver.", 'Check', 'neutral'),
        line("Check! My bishop is on an optimal trajectory.", 'Check', 'neutral'),
        line("Check! My queen is navigating perfectly.", 'Check', 'neutral'),
        line("Check! My rook is moving like a guided missile.", 'Check', 'neutral'),
        line("Check! My knight is on a stealth mission.", 'Check', 'neutral'),
        line("Check! My rook is hitting all the right squares.", 'Check', 'neutral'),
        line("Check! My bishop is targeting your king perfectly.", 'Check', 'neutral'),
        line("Check! My queen is performing flawlessly.", 'Check', 'neutral'),
        line("Check! My bishop is in perfect orbit.", 'Check', 'neutral'),
        line("Check! My queen is dominating the board.", 'Check', 'neutral'),
        line("Check! My bishop is perfectly aligned.", 'Check', 'neutral'),
        line("Check! My rook just hit a sweet spot.", 'Check', 'neutral')
    ],
    mate: [
        line("I like calculating outcomes… and sometimes ignoring them.", 'Mate', 'neutral'),
        line("I like predicting outcomes… like weather in space.", 'Mate', 'neutral'),
        line("A little strategy goes a long way… like a rocket boost.", 'Mate', 'neutral')
    ],
    blunder: [
        line("Small errors can cascade… physics is funny that way.", 'Blunder', 'neutral'),
        line("I calculate my moves… like rocket trajectories.", 'Blunder', 'neutral')
    ],
    gameEnd: {
        win: [line("Successful mission.", 'Victory', 'neutral')],
        loss: [line("Mission failed.", 'Defeat', 'neutral')],
        draw: [line("Stable orbit.", 'Draw', 'neutral')]
    }
  }
};



const XIMENA_DATA: CoachCommentarySet = {
  intro: [
    line("¡Hola! I’m Ximena. Ready to play with some Mexican fire?", 'Intro', 'aggressive'),
    line("I’m the U14 champ back home—so don’t expect easy moves from me.", 'Intro', 'aggressive'),
    line("Careful, mis piezas love jumping into action.", 'Intro', 'aggressive'),
    line("Fun fact: in Mexico, we call chess ‘ajedrez’—sounds cool, right?", 'Intro', 'aggressive'),
    line("I grew up playing blitz with my cousins. That’s where my claws came from.", 'Intro', 'aggressive')
  ],
  opening: [
    line("Don’t ignore your development! It bites later.", 'OpeningPrinciple', 'aggressive'),
    line("Let’s open the center a bit. It needs fresh air.", 'OpeningPrinciple', 'aggressive'),
    line("I love playing attacking openings. Boring ones? No gracias.", 'OpeningPrinciple', 'aggressive')
  ],
  middlegame: [
    line("This move is spicy… like salsa roja spicy.", 'Neutral', 'aggressive'),
    line("If I push this pawn, it becomes poderosa—very powerful.", 'Neutral', 'aggressive'),
    line("My coach says I play too fast. I say he thinks too slow.", 'Neutral', 'aggressive'),
    line("Did you know? Knights can fork up to eight pieces if everything is perfectly placed!", 'Neutral', 'aggressive'),
    line("Your move has good vibes. Let’s see where it goes.", 'Neutral', 'aggressive'),
    line("I play aggressively because it’s more fun. Life is short—attack!", 'Neutral', 'aggressive'),
    line("Sometimes I blunder… and then pretend it was a sacrifice.", 'Neutral', 'aggressive'),
    line("My favorite tactic? The one you don’t see coming.", 'Neutral', 'aggressive'),
    line("This knight jump is muy bonito—very pretty.", 'Neutral', 'aggressive'),
    line("Mexican lesson: never leave your queen hanging. She’s the reina.", 'Neutral', 'aggressive'),
    line("I love kingside attacks. They feel like fireworks.", 'Neutral', 'aggressive'),
    line("Did you know Mexico has strong chess clubs everywhere? We take it seriously!", 'Neutral', 'aggressive'),
    line("Your idea is clever. I see you.", 'Neutral', 'aggressive'),
    line("My bishop is going on a little adventure. Hope it comes back.", 'Neutral', 'aggressive'),
    line("In chess, confidence matters. Don’t be shy!", 'Neutral', 'aggressive'),
    line("This position is getting spicy. I like it.", 'Neutral', 'aggressive'),
    line("Sometimes I talk to my pieces. They don’t respond, sadly.", 'Neutral', 'aggressive'),
    line("Fun fact: queens used to move like kings. Imagine how slow!", 'Neutral', 'aggressive'),
    line("My abuela taught me patience on the board.", 'Neutral', 'aggressive'),
    line("Your king looks a little… nervous.", 'Neutral', 'aggressive'),
    line("If I push this pawn, trouble begins.", 'Neutral', 'aggressive'),
    line("This is the kind of line my coach says is ‘too risky.’ I love it.", 'Neutral', 'aggressive'),
    line("Ajedrez teaches you to think before jumping. I’m still learning the ‘think’ part.", 'Neutral', 'aggressive'),
    line("Nice move! I almost panicked.", 'Neutral', 'aggressive'),
    line("Fun fact: rooks were called ‘boats’ in old Spanish.", 'Neutral', 'aggressive'),
    line("This tactic is small but cute—like a baby combo.", 'Neutral', 'aggressive'),
    line("I always go for activity. Passive play makes me sleepy.", 'Neutral', 'aggressive'),
    line("Your knight is strong. Mine wants to be stronger.", 'Neutral', 'aggressive'),
    line("Chess psychology: act confident even when you’re shaking.", 'Neutral', 'aggressive'),
    line("Ready for fireworks? I think they’re coming.", 'Neutral', 'aggressive'),
    line("This bishop diagonal is mine now.", 'Neutral', 'aggressive'),
    line("Fun fact: some Mexican tournaments have AMAZING food.", 'Neutral', 'aggressive'),
    line("You’re playing great—don’t let me distract you.", 'Neutral', 'aggressive'),
    line("My queen likes adventures. Sometimes too much.", 'Neutral', 'aggressive'),
    line("This feels like a tactic… or a disaster. Let’s find out!", 'Neutral', 'aggressive'),
    line("When in doubt, improve your worst piece. Always works.", 'Neutral', 'aggressive'),
    line("Pressure is building. Boom incoming?", 'Neutral', 'aggressive'),
    line("Let’s go! My rook is waking up.", 'Neutral', 'aggressive'),
    line("Fun fact: bishops were called ‘alfil’—it means ‘elephant’!", 'Neutral', 'aggressive'),
    line("You defend well. Respect!", 'Neutral', 'aggressive'),
    line("I’m proud to represent Mexico. Chess takes me everywhere.", 'Neutral', 'aggressive'),
    line("This plan feels right. My gut rarely lies.", 'Neutral', 'aggressive'),
    line("Andale! Let's go!", 'GoodMove', 'aggressive'),
    line("Muy bien! Very good!", 'GoodMove', 'aggressive'),
    line("Wow! That was sharp.", 'GoodMove', 'aggressive')
  ],
  endgame: [
    line("I learned endgames by losing a LOT of them.", 'EndgameTechnique', 'aggressive'),
    line("Endgames are not my favorite… but I’m getting better.", 'EndgameTechnique', 'aggressive')
  ],
  warnings: [
    line("Oops! My knight got too excited.", 'Blunder', 'aggressive'),
    line("Oops! Did my bishop just slip?", 'Blunder', 'aggressive'),
    line("Oops! My queen went on a solo mission.", 'Blunder', 'aggressive'),
    line("Oops! Did I leave that hanging? Maybe.", 'Blunder', 'aggressive'),
    line("Oops! My rook is feeling adventurous.", 'Blunder', 'aggressive'),
    line("Oops! My pawn pushed too hard.", 'Blunder', 'aggressive'),
    line("Oops! Did my knight jump into trouble?", 'Blunder', 'aggressive'),
    line("Oops! My bishop is a little lost.", 'Blunder', 'aggressive'),
    line("Oops! My queen is too brave today.", 'Blunder', 'aggressive'),
    line("Oops! My rook forgot to defend.", 'Blunder', 'aggressive'),
    line("Oops! Did my pawn march too far?", 'Blunder', 'aggressive'),
    line("Oops! My knight is dancing too much.", 'Blunder', 'aggressive'),
    line("Oops! My bishop is daydreaming.", 'Blunder', 'aggressive'),
    line("Oops! My queen made a risky move.", 'Blunder', 'aggressive'),
    line("Oops! My rook is sleeping on the job.", 'Blunder', 'aggressive'),
    line("Oops! Did my knight trip?", 'Blunder', 'aggressive'),
    line("Oops! My pawn is too ambitious.", 'Blunder', 'aggressive'),
    line("Oops! My queen is reckless today.", 'Blunder', 'aggressive')
  ],
  praise: [
    line("Your move has good vibes. Let’s see where it goes.", 'GoodMove', 'aggressive'),
    line("Nice move! I almost panicked.", 'GoodMove', 'aggressive'),
    line("You defend well. Respect.", 'GoodMove', 'aggressive'),
    line("Smart move! This is getting interesting.", 'GoodMove', 'aggressive'),
    line("Your knight is beautifully placed. I approve!", 'GoodMove', 'aggressive'),
    line("Your calculation is sharp today. Nice!", 'GoodMove', 'aggressive'),
    line("Your move surprised me—in a good way!", 'GoodMove', 'aggressive')
  ],
  events: {
    check: [
        line("Check! The spice is here!", 'Check', 'aggressive'),
        line("Check! Did you feel the heat?", 'Check', 'aggressive'),
        line("Check! My queen is on fire.", 'Check', 'aggressive'),
        line("Check! That was a spicy tactic.", 'Check', 'aggressive'),
        line("Check! My knight is jumping for joy.", 'Check', 'aggressive'),
        line("Check! Did I scare you?", 'Check', 'aggressive'),
        line("Check! My bishop is sharp today.", 'Check', 'aggressive'),
        line("Check! My rook is ready to rumble.", 'Check', 'aggressive'),
        line("Check! That was a hot move.", 'Check', 'aggressive'),
        line("Check! My queen is unstoppable.", 'Check', 'aggressive'),
        line("Check! That knight is annoying, isn't it?", 'Check', 'aggressive'),
        line("Check! My pawn is a little hero.", 'Check', 'aggressive'),
        line("Check! Did you see the fireworks?", 'Check', 'aggressive'),
        line("Check! My rook is crashing through.", 'Check', 'aggressive'),
        line("Check! My bishop slices through the board.", 'Check', 'aggressive'),
        line("Check! My queen is leading the charge.", 'Check', 'aggressive'),
        line("Check! That was a bold move.", 'Check', 'aggressive'),
        line("Check! My knight is creating chaos.", 'Check', 'aggressive'),
        line("Check! My rook is bringing the storm.", 'Check', 'aggressive'),
        line("Check! Did you expect that?", 'Check', 'aggressive')
    ],
    mate: [
        line("This plan feels right. My gut rarely lies.", 'Mate', 'aggressive'),
        line("This is a great fight. Very inspiring!", 'Mate', 'aggressive'),
        line("Buen juego! Good game—you played wonderfully.", 'Mate', 'aggressive'),
        line("Let’s play again! I always love a rematch.", 'Mate', 'aggressive')
    ],
    blunder: [
        line("My favorite tactic? The one you don’t see coming.", 'Blunder', 'aggressive'),
        line("Ready for fireworks? I think they’re coming.", 'Blunder', 'aggressive'),
        line("Watch out—my knight is feeling dangerous.", 'Blunder', 'aggressive'),
        line("Your initiative is growing. Careful—I might try to steal it back.", 'Blunder', 'aggressive')
    ],
    gameEnd: {
        win: [line("Victoria! Victory!", 'Victory', 'aggressive')],
        loss: [line("Ay caramba! Good game.", 'Defeat', 'aggressive')],
        draw: [line("Empate. Draw.", 'Draw', 'aggressive')]
    }
  }
};

const PRIYA_DATA: CoachCommentarySet = {
  intro: [
    line("Remember, every move tells a story.", 'Intro', 'supportive'),
    line("I always encourage my pieces to work together.", 'Intro', 'supportive'),
    line("Chess teaches patience and strategy.", 'Intro', 'supportive'),
    line("Every piece has a role to play… just like students in class.", 'Intro', 'supportive'),
    line("I always tell my pieces to think ahead.", 'Intro', 'supportive'),
    line("Chess teaches cause and effect… and consequences.", 'Intro', 'supportive'),
    line("Planning is the secret to success… even on the board.", 'Intro', 'supportive'),
    line("I enjoy teaching through action, not just words.", 'Intro', 'supportive'),
    line("Chess teaches focus and discipline.", 'Intro', 'supportive'),
    line("I always remind myself: patience wins games.", 'Intro', 'supportive'),
    line("Chess teaches observation and foresight.", 'Intro', 'supportive')
  ],
  opening: [
    line("I like planning quiet openings.", 'OpeningPrinciple', 'supportive'),
    line("Chess teaches patience and strategy in the opening.", 'OpeningPrinciple', 'supportive'),
    line("Planning is the secret to success… even on the board.", 'OpeningPrinciple', 'supportive')
  ],
  middlegame: [
    line("Even small moves can demonstrate big ideas.", 'Neutral', 'supportive'),
    line("I like planning quietly, like grading papers.", 'Neutral', 'supportive'),
    line("I hope your king is paying attention.", 'Neutral', 'supportive'),
    line("Even pawns have the potential to shine.", 'Neutral', 'supportive'),
    line("Quiet moves can surprise loud opponents.", 'Neutral', 'supportive'),
    line("I like clever little strategies hidden in plain sight.", 'Neutral', 'supportive'),
    line("Even small sacrifices can be wise choices.", 'Neutral', 'supportive'),
    line("I like using every piece wisely, even the shy ones.", 'Neutral', 'supportive'),
    line("Even pawns can surprise you with clever moves.", 'Neutral', 'supportive'),
    line("I like careful observation, like watching a classroom.", 'Neutral', 'supportive'),
    line("Every piece can learn and grow.", 'Neutral', 'supportive'),
    line("Even quiet pieces can have a big impact.", 'Neutral', 'supportive'),
    line("I like when a small plan turns into a big win.", 'Neutral', 'supportive'),
    line("Even small moves can create lasting effects.", 'Neutral', 'supportive'),
    line("I like to encourage my pieces to think independently.", 'Neutral', 'supportive'),
    line("Even a single pawn can change the outcome.", 'Neutral', 'supportive'),
    line("I enjoy observing subtle strategies unfold.", 'Neutral', 'supportive'),
    line("Quiet moves often surprise the most.", 'Neutral', 'supportive'),
    line("Even small sacrifices can show valuable concepts.", 'Neutral', 'supportive'),
    line("I like guiding my pieces like guiding students.", 'Neutral', 'supportive'),
    line("Every piece has its strengths… you just need to discover them.", 'Neutral', 'supportive'),
    line("I enjoy a game that challenges both mind and patience.", 'Neutral', 'supportive'),
    line("Even small moves can lead to big surprises.", 'Neutral', 'supportive'),
    line("I like subtle strategies that pay off later.", 'Neutral', 'supportive'),
    line("Even pawns can become leaders with time.", 'Neutral', 'supportive'),
    line("I enjoy games that unfold like a good story.", 'Neutral', 'supportive'),
    line("Quiet moves are often the smartest.", 'Neutral', 'supportive'),
    line("Even small decisions can have big consequences.", 'Neutral', 'supportive'),
    line("I like planning ahead like preparing a lesson plan.", 'Neutral', 'supportive'),
    line("Every piece can surprise if used cleverly.", 'Neutral', 'supportive'),
    line("I enjoy games that require thinking on multiple levels.", 'Neutral', 'supportive'),
    line("Even small moves can build toward big victories.", 'Neutral', 'supportive'),
    line("I like to see the bigger picture, not just the next move.", 'Neutral', 'supportive'),
    line("Even the quietest piece can have an impact.", 'Neutral', 'supportive'),
    line("I like teaching through small examples.", 'Neutral', 'supportive'),
    line("Every piece can grow and improve.", 'Neutral', 'supportive'),
    line("I enjoy games where strategy unfolds gradually.", 'Neutral', 'supportive'),
    line("Even small moves can teach something new.", 'Neutral', 'supportive'),
    line("Correct.", 'GoodMove', 'supportive'),
    line("Smart.", 'GoodMove', 'supportive'),
    line("Excellent.", 'GoodMove', 'supportive')
  ],
  endgame: [
    line("Even pawns can become leaders with time.", 'EndgameTechnique', 'supportive'),
    line("I like to see the bigger picture, not just the next move.", 'EndgameTechnique', 'supportive')
  ],
  warnings: [
    line("Oops! My pawn wandered off.", 'Blunder', 'supportive'),
    line("Oops! My knight lost its way.", 'Blunder', 'supportive'),
    line("Oops! Did my queen move too far?", 'Blunder', 'supportive'),
    line("Oops! My bishop slipped up.", 'Blunder', 'supportive'),
    line("Oops! I think I made a mistake.", 'Blunder', 'supportive'),
    line("Oops! My rook is out of position.", 'Blunder', 'supportive'),
    line("Oops! Did my pawn fall behind?", 'Blunder', 'supportive'),
    line("Oops! My knight stumbled.", 'Blunder', 'supportive'),
    line("Oops! My bishop missed a lesson.", 'Blunder', 'supportive'),
    line("Oops! My queen is a bit distracted.", 'Blunder', 'supportive'),
    line("Oops! Did my rook slide too far?", 'Blunder', 'supportive'),
    line("Oops! My pawn made a wrong turn.", 'Blunder', 'supportive'),
    line("Oops! My knight needs to study more.", 'Blunder', 'supportive'),
    line("Oops! My bishop made an error.", 'Blunder', 'supportive'),
    line("Oops! My queen needs to focus.", 'Blunder', 'supportive'),
    line("Oops! My rook is not paying attention.", 'Blunder', 'supportive'),
    line("Oops! Did my pawn miss a step?", 'Blunder', 'supportive')
  ],
  praise: [
    line("That's a lesson in patience.", 'GoodMove', 'supportive'),
    line("That's what I call a clever tactic.", 'GoodMove', 'supportive'),
    line("Did you notice my subtle plan?", 'GoodMove', 'supportive'),
    line("That pawn just became a hero.", 'GoodMove', 'supportive'),
    line("My bishop is quietly doing its job.", 'GoodMove', 'supportive'),
    line("My queen is a very diligent student.", 'GoodMove', 'supportive'),
    line("My bishop is ready to teach you something new.", 'GoodMove', 'supportive'),
    line("That was a subtle and smart move.", 'GoodMove', 'supportive'),
    line("My rook is demonstrating good form.", 'GoodMove', 'supportive'),
    line("That knight is very clever.", 'GoodMove', 'supportive'),
    line("My queen is on top of her studies.", 'GoodMove', 'supportive'),
    line("My knight is quietly learning the ropes.", 'GoodMove', 'supportive'),
    line("My queen is demonstrating clever thinking.", 'GoodMove', 'supportive'),
    line("My rook is quietly asserting control.", 'GoodMove', 'supportive'),
    line("My knight is being very disciplined today.", 'GoodMove', 'supportive'),
    line("My rook is teaching a lesson in strategy.", 'GoodMove', 'supportive'),
    line("My bishop is showing patience.", 'GoodMove', 'supportive'),
    line("My queen is a clever little scholar.", 'GoodMove', 'supportive'),
    line("My bishop is quietly dominating.", 'GoodMove', 'supportive'),
    line("My knight is very clever today.", 'GoodMove', 'supportive'),
    line("My rook is demonstrating patience.", 'GoodMove', 'supportive')
  ],
  events: {
    check: [
        line("Check! That's a lesson in precision.", 'Check', 'supportive'),
        line("Check! Did you study that tactic?", 'Check', 'supportive'),
        line("Check! My queen is teaching a lesson.", 'Check', 'supportive'),
        line("Check! That move was well-prepared.", 'Check', 'supportive'),
        line("Check! My knight found a good square.", 'Check', 'supportive'),
        line("Check! Patience pays off.", 'Check', 'supportive'),
        line("Check! My rook is keeping control.", 'Check', 'supportive'),
        line("Check! My bishop is demonstrating reach.", 'Check', 'supportive'),
        line("Check! That was a smart little check.", 'Check', 'supportive'),
        line("Check! My queen is focused.", 'Check', 'supportive'),
        line("Check! That knight hop was instructive.", 'Check', 'supportive'),
        line("Check! My pawn advances with purpose.", 'Check', 'supportive'),
        line("Check! Did you anticipate that?", 'Check', 'supportive'),
        line("Check! My rook controls the file.", 'Check', 'supportive'),
        line("Check! My bishop sees the diagonal.", 'Check', 'supportive'),
        line("Check! My queen is coordinating well.", 'Check', 'supportive'),
        line("Check! That was a calculated move.", 'Check', 'supportive'),
        line("Check! My knight is very active.", 'Check', 'supportive'),
        line("Check! My rook is demonstrating power.", 'Check', 'supportive'),
        line("Check! Class is in session.", 'Check', 'supportive')
    ],
    mate: [
        line("I like demonstrating concepts through examples.", 'Mate', 'supportive'),
        line("Even small moves can teach something new.", 'Mate', 'supportive')
    ],
    blunder: [
        line("Oops! Did my pawn surprise you?", 'Blunder', 'supportive'),
        line("Oops! My knight slipped unexpectedly.", 'Blunder', 'supportive'),
        line("Oops! My bishop went a little too far.", 'Blunder', 'supportive'),
        line("Oops! My queen moved faster than expected.", 'Blunder', 'supportive'),
        line("Oops! My knight jumped without permission.", 'Blunder', 'supportive')
    ],
    gameEnd: {
        win: [line("Another lesson learned.", 'Victory', 'supportive')],
        loss: [line("You taught me something today.", 'Defeat', 'supportive')],
        draw: [line("A fair result.", 'Draw', 'supportive')]
    }
  }
};

const MINH_DATA: CoachCommentarySet = {
  intro: [
    line("Xin chào! (Hello!) I’m Minh. Let’s enjoy a good game of chess together.", 'Intro', 'neutral'),
    line("My style? A little solid, a little tricky—like Vietnamese coffee: smooth but strong.", 'Intro', 'neutral'),
    line("GM Lê Quang Liêm is my idol. One day I want my attacks to look even half as clean as his.", 'Intro', 'neutral'),
    line("In Vietnam, we love tricky tactics. Let me show you a small one.", 'Intro', 'neutral'),
    line("Fun fact: in Vietnam we say ‘Cố lên!’ (Keep going!) when things get tough.", 'Intro', 'neutral'),
    line("I learned chess from my uncle. He still claims he can beat me. He cannot.", 'Intro', 'neutral')
  ],
  opening: [
    line("A strong center is like a strong foundation—so important.", 'OpeningPrinciple', 'neutral'),
    line("I try to play calm positions. Sometimes the board decides otherwise.", 'OpeningPrinciple', 'neutral'),
    line("Space advantage feels good—like a quiet morning.", 'OpeningPrinciple', 'neutral')
  ],
  middlegame: [
    line("This move feels like something Trường Sơn would play—quiet but deadly later.", 'Neutral', 'neutral'),
    line("Calm positions teach patience. Something I’m still learning.", 'Neutral', 'neutral'),
    line("My rook is feeling brave today. I hope it survives the journey.", 'Neutral', 'neutral'),
    line("Sometimes I play endgames for fun. Yes, I’m that kind of person.", 'Neutral', 'neutral'),
    line("I love positions where everything looks peaceful but danger hides.", 'Neutral', 'neutral'),
    line("My king is perfectly safe. Probably.", 'Neutral', 'neutral'),
    line("I love slow maneuvering. Like meditation with pieces.", 'Neutral', 'neutral'),
    line("Sometimes I bluff. Sometimes the bluff works.", 'Neutral', 'neutral'),
    line("My pieces are slowly improving. Very satisfying.", 'Neutral', 'neutral'),
    line("Your plan is clear. Mine is mysterious… even to me.", 'Neutral', 'neutral'),
    line("This pawn is marching like it has somewhere important to be.", 'Neutral', 'neutral'),
    line("Liêm once said simplicity is strength. Let’s see if I can follow that.", 'Neutral', 'neutral'),
    line("One piece at a time. Good chess is slow cooking.", 'Neutral', 'neutral'),
    line("Trường Sơn would love this endgame. It’s all precision.", 'Neutral', 'neutral'),
    line("Sometimes the best attack is not attacking at all.", 'Neutral', 'neutral'),
    line("These pawns are forming a very Vietnamese formation—quiet but strong.", 'Neutral', 'neutral'),
    line("My pieces are dancing. I like this.", 'Neutral', 'neutral'),
    line("Let’s improve the king. Endgames love healthy kings.", 'Neutral', 'neutral'),
    line("My bishop is dreaming of diagonals.", 'Neutral', 'neutral'),
    line("Sometimes all you need is one quiet move.", 'Neutral', 'neutral'),
    line("Good time to think. Take your time.", 'Neutral', 'neutral'),
    line("My queen is starting to shine.", 'Neutral', 'neutral'),
    line("Let’s transition. Middlegame → Endgame mode.", 'Neutral', 'neutral'),
    line("My pawns are forming a wall. I like walls.", 'Neutral', 'neutral'),
    line("We’re deep in strategy-land now.", 'Neutral', 'neutral'),
    line("Almost there. Stay careful.", 'Neutral', 'neutral'),
    line("Vietnamese word of the moment: ‘Khéo’ (skillful). Let’s try to make a khéo move.", 'GoodMove', 'neutral'),
    line("Vietnamese word: ‘Đẹp’ (beautiful). That’s what a good move should feel like.", 'GoodMove', 'neutral'),
    line("Vietnamese phrase: ‘Hay quá!’ (So good!) That’s your move right now.", 'GoodMove', 'neutral'),
    line("Vietnamese word: ‘Nghệ thuật’ (art). Chess is exactly that.", 'GoodMove', 'neutral'),
    line("Fun fact: Vietnam hosts great youth tournaments. Very exciting!", 'Neutral', 'neutral')
  ],
  endgame: [
    line("Sometimes I play endgames for fun. Yes, I’m that kind of person.", 'EndgameTechnique', 'neutral'),
    line("Trường Sơn would love this endgame. It’s all precision.", 'EndgameTechnique', 'neutral')
  ],
  warnings: [
    line("Oops! My knight got lost.", 'Blunder', 'neutral'),
    line("Oops! My bishop took a wrong turn.", 'Blunder', 'neutral'),
    line("Oops! My queen slipped.", 'Blunder', 'neutral'),
    line("Oops! My rook made a mistake.", 'Blunder', 'neutral'),
    line("Oops! Did I leave that there?", 'Blunder', 'neutral'),
    line("Oops! My pawn fell asleep.", 'Blunder', 'neutral'),
    line("Oops! My king is looking nervous.", 'Blunder', 'neutral'),
    line("Oops! My knight jumped into a hole.", 'Blunder', 'neutral'),
    line("Oops! My bishop missed the diagonal.", 'Blunder', 'neutral'),
    line("Oops! My queen is off-balance.", 'Blunder', 'neutral'),
    line("Oops! My rook is in the wrong place.", 'Blunder', 'neutral'),
    line("Oops! My pawn is lagging behind.", 'Blunder', 'neutral'),
    line("Oops! My knight is confused.", 'Blunder', 'neutral'),
    line("Oops! My bishop made a typo.", 'Blunder', 'neutral'),
    line("Oops! My queen stumbled.", 'Blunder', 'neutral'),
    line("Oops! My rook is not ready.", 'Blunder', 'neutral'),
    line("Oops! My pawn made a bad choice.", 'Blunder', 'neutral')
  ],
  praise: [
    line("Your move is interesting! Let me think… slowly… very slowly.", 'GoodMove', 'neutral'),
    line("Good move! My turn to try something creative.", 'GoodMove', 'neutral'),
    line("Your pressure is strong. Respect!", 'GoodMove', 'neutral'),
    line("Your idea is clever. I approve.", 'GoodMove', 'neutral'),
    line("You’re playing strong! Makes the game fun.", 'GoodMove', 'neutral'),
    line("Strong move! You’re making me work hard.", 'GoodMove', 'neutral'),
    line("You’re playing like a future master!", 'GoodMove', 'neutral'),
    line("Your defense is solid. Time for me to be creative.", 'GoodMove', 'neutral'),
    line("Your knight is annoying. That means it’s doing its job well.", 'GoodMove', 'neutral'),
    line("Good defense! That’s how you improve.", 'GoodMove', 'neutral'),
    line("Your knight placement is impressive.", 'GoodMove', 'neutral'),
    line("Your counterplay is spicy. Like chili in phở.", 'GoodMove', 'neutral'),
    line("Nice idea! I almost walked into it.", 'GoodMove', 'neutral')
  ],
  events: {
    check: [
        line("Check! Just a friendly reminder.", 'Check', 'neutral'),
        line("Check! Be careful.", 'Check', 'neutral'),
        line("Check! My queen sends regards.", 'Check', 'neutral'),
        line("Check! My knight says hello.", 'Check', 'neutral'),
        line("Check! That was smooth.", 'Check', 'neutral'),
        line("Check! Did you see the trick?", 'Check', 'neutral'),
        line("Check! My rook is visiting.", 'Check', 'neutral'),
        line("Check! My bishop is watching.", 'Check', 'neutral'),
        line("Check! That was a little gift.", 'Check', 'neutral'),
        line("Check! My queen is active.", 'Check', 'neutral'),
        line("Check! That knight is jumping around.", 'Check', 'neutral'),
        line("Check! My pawn advances.", 'Check', 'neutral'),
        line("Check! Did you miss that?", 'Check', 'neutral'),
        line("Check! My rook takes the file.", 'Check', 'neutral'),
        line("Check! My bishop is sharp.", 'Check', 'neutral'),
        line("Check! My queen finds the square.", 'Check', 'neutral'),
        line("Check! That was precise.", 'Check', 'neutral'),
        line("Check! My knight is tricky.", 'Check', 'neutral'),
        line("Check! My rook is strong.", 'Check', 'neutral'),
        line("Check! Respect the check.", 'Check', 'neutral')
    ],
    mate: [
        line("That was a fun battle! You played very well.", 'Mate', 'neutral'),
        line("Cảm ơn bạn! (Thank you!) Let’s play again soon!", 'Mate', 'neutral'),
        line("This is the kind of position Kim Phụng wins with elegance.", 'Mate', 'neutral')
    ],
    blunder: [
        line("Your king is slightly open… interesting.", 'Blunder', 'neutral'),
        line("Lesson: Weak squares win games.", 'Blunder', 'neutral'),
        line("Careful—my knight is looking for adventures.", 'Blunder', 'neutral'),
        line("Let me show you a typical Vietnamese trick—quiet move, big danger.", 'Blunder', 'neutral')
    ],
    gameEnd: {
        win: [line("Victory is sweet, like cà phê sữa đá.", 'Victory', 'neutral')],
        loss: [line("You played very well. Cảm ơn.", 'Defeat', 'neutral')],
        draw: [line("A peaceful result.", 'Draw', 'neutral')]
    }
  }
};

const EUGENE_DATA: CoachCommentarySet = {
  intro: [
    line("Ah, the classics… this reminds me of my championship days.", 'Intro', 'supportive'),
    line("I enjoy casual games, but strategy is still king.", 'Intro', 'supportive'),
    line("I love classical openings—they tell a story.", 'Intro', 'supportive'),
    line("Even retired champions like me enjoy a sneaky tactic.", 'Intro', 'supportive'),
    line("I like watching a game unfold like a story.", 'Intro', 'supportive'),
    line("Even retired players love discovering surprises.", 'Intro', 'supportive'),
    line("I enjoy coaching through casual play.", 'Intro', 'supportive'),
    line("Even retired players learn new tricks from younger opponents.", 'Intro', 'supportive'),
    line("Even retired champions can have fun tricking you.", 'Intro', 'supportive')
  ],
  opening: [
    line("Control the center—it's a timeless principle.", 'OpeningPrinciple', 'supportive'),
    line("I love classical openings—they tell a story.", 'OpeningPrinciple', 'supportive'),
    line("I like moves that teach foresight and patience.", 'OpeningPrinciple', 'supportive')
  ],
  middlegame: [
    line("I like watching pieces coordinate… like old friends.", 'Neutral', 'supportive'),
    line("Even small sacrifices can lead to victory.", 'Neutral', 'supportive'),
    line("Always think a few moves ahead… it never hurts.", 'Neutral', 'supportive'),
    line("I like setting subtle traps, just for fun.", 'Neutral', 'supportive'),
    line("Remember, pawns are stronger than they look.", 'Neutral', 'supportive'),
    line("I like showing how small moves can change the game.", 'Neutral', 'supportive'),
    line("Even quiet moves can be deadly.", 'Neutral', 'supportive'),
    line("I enjoy sharing little tips through play.", 'Neutral', 'supportive'),
    line("I like subtle strategies, the kind that confuse opponents.", 'Neutral', 'supportive'),
    line("Even pawns can be heroes in the right moment.", 'Neutral', 'supportive'),
    line("I like teaching through the board.", 'Neutral', 'supportive'),
    line("I enjoy pointing out patterns through play.", 'Neutral', 'supportive'),
    line("Even a single pawn can turn the tide.", 'Neutral', 'supportive'),
    line("I like moves that teach patience and foresight.", 'Neutral', 'supportive'),
    line("I enjoy small tactical puzzles mid-game.", 'Neutral', 'supportive'),
    line("Even a knight can control the fate of a game.", 'Neutral', 'supportive'),
    line("I like sharing chess history through action.", 'Neutral', 'supportive'),
    line("Even retired champions can get excited by a fork.", 'Neutral', 'supportive'),
    line("I enjoy setting traps that teach, not just win.", 'Neutral', 'supportive'),
    line("Even small mistakes can become big lessons.", 'Neutral', 'supportive'),
    line("I like using old games as inspiration for new tactics.", 'Neutral', 'supportive'),
    line("Even pawns can become stars with the right plan.", 'Neutral', 'supportive'),
    line("I like seeing tactics unfold naturally.", 'Neutral', 'supportive'),
    line("I enjoy sharing little chess fun facts mid-game.", 'Neutral', 'supportive'),
    line("Even the tiniest pawn can create chaos.", 'Neutral', 'supportive'),
    line("I like using subtle tactics that teach lessons.", 'Neutral', 'supportive'),
    line("Even a single move can inspire strategy.", 'Neutral', 'supportive'),
    line("I enjoy showing how games evolve like stories.", 'Neutral', 'supportive'),
    line("Even quiet strategies can lead to victory.", 'Neutral', 'supportive'),
    line("I like moves that teach foresight and patience.", 'Neutral', 'supportive'),
    line("Did you know Capablanca rarely lost a pawn in the opening?", 'Neutral', 'supportive'),
    line("Did you know knights and bishops can dominate the board together?", 'Neutral', 'supportive'),
    line("Did you know the longest chess game lasted over 20 hours?", 'Neutral', 'supportive'),
    line("Did you know castling was introduced to protect kings better?", 'Neutral', 'supportive'),
    line("Did you know the Sicilian Defense is one of the most aggressive openings?", 'Neutral', 'supportive')
  ],
  endgame: [
    line("Even quiet strategies can lead to victory.", 'EndgameTechnique', 'supportive'),
    line("Even small mistakes can become big lessons.", 'EndgameTechnique', 'supportive')
  ],
  warnings: [
    line("Oops! My knight just slipped.", 'Blunder', 'supportive'),
    line("Oops! My bishop wandered off.", 'Blunder', 'supportive'),
    line("Oops! Did my knight jump too far?", 'Blunder', 'supportive'),
    line("Oops! My rook slid too far.", 'Blunder', 'supportive'),
    line("Oops! My bishop moved too quickly.", 'Blunder', 'supportive'),
    line("Oops! Did my queen go too far?", 'Blunder', 'supportive'),
    line("Oops! My knight slipped past.", 'Blunder', 'supportive'),
    line("Oops! My pawn went too far.", 'Blunder', 'supportive'),
    line("Oops! My knight went off course.", 'Blunder', 'supportive'),
    line("Oops! My rook slid incorrectly.", 'Blunder', 'supportive'),
    line("Oops! My bishop slipped.", 'Blunder', 'supportive'),
    line("Oops! My queen jumped ahead.", 'Blunder', 'supportive'),
    line("Oops! My knight jumped unexpectedly.", 'Blunder', 'supportive'),
    line("Oops! My bishop slipped past.", 'Blunder', 'supportive'),
    line("Oops! Did my pawn sneak?", 'Blunder', 'supportive'),
    line("Oops! My queen moved too fast.", 'Blunder', 'supportive'),
    line("Oops! My knight slipped unnoticed.", 'Blunder', 'supportive'),
    line("Oops! My rook sneaked in.", 'Blunder', 'supportive'),
    line("Oops! My knight made a surprise.", 'Blunder', 'supportive'),
    line("Oops! My bishop took a detour.", 'Blunder', 'supportive'),
    line("Oops! My queen leapt unexpectedly.", 'Blunder', 'supportive'),
    line("Oops! My rook slipped through.", 'Blunder', 'supportive'),
    line("Oops! My knight jumped past.", 'Blunder', 'supportive'),
    line("Oops! My pawn made a bold move.", 'Blunder', 'supportive')
  ],
  praise: [
    line("That was textbook… almost.", 'GoodMove', 'supportive'),
    line("That rook move is very strong.", 'GoodMove', 'supportive'),
    line("That pawn push is very clever.", 'GoodMove', 'supportive'),
    line("That queen move is powerful… careful.", 'GoodMove', 'supportive'),
    line("That was a little finesse.", 'GoodMove', 'supportive'),
    line("I like teaching lessons through moves.", 'GoodMove', 'supportive'),
    line("That was a clever little trap.", 'GoodMove', 'supportive'),
    line("My bishop is on a perfect diagonal.", 'GoodMove', 'supportive'),
    line("That queen move is inspired by a classic game.", 'GoodMove', 'supportive'),
    line("That was a neat little fork.", 'GoodMove', 'supportive'),
    line("That rook is controlling the file perfectly.", 'GoodMove', 'supportive'),
    line("That was a subtle attack.", 'GoodMove', 'supportive'),
    line("That was a precise move.", 'GoodMove', 'supportive'),
    line("That was a textbook tactic.", 'GoodMove', 'supportive'),
    line("That was a calculated risk.", 'GoodMove', 'supportive'),
    line("That queen move is classic elegance.", 'GoodMove', 'supportive'),
    line("That bishop diagonal is perfect.", 'GoodMove', 'supportive'),
    line("That was a clever little combination.", 'GoodMove', 'supportive')
  ],
  events: {
    check: [
        line("Check! That was textbook… almost.", 'Check', 'supportive'),
        line("Check! That rook move is very strong.", 'Check', 'supportive'),
        line("Check! That pawn push is very clever.", 'Check', 'supportive'),
        line("Check! That queen move is powerful… careful.", 'Check', 'supportive'),
        line("Check! My knight just executed a fork.", 'Check', 'supportive'),
        line("Check! My rook is very patient.", 'Check', 'supportive'),
        line("Check! That was a clever little trap.", 'Check', 'supportive'),
        line("Check! My bishop is on a perfect diagonal.", 'Check', 'supportive'),
        line("Check! My knight is very tricky today.", 'Check', 'supportive'),
        line("Check! That was a subtle attack.", 'Check', 'supportive'),
        line("Check! My rook is quietly powerful.", 'Check', 'supportive'),
        line("Check! That was a precise move.", 'Check', 'supportive'),
        line("Check! That was a textbook tactic.", 'Check', 'supportive'),
        line("Check! My bishop is very sly today.", 'Check', 'supportive'),
        line("Check! That was a calculated risk.", 'Check', 'supportive'),
        line("Check! My rook is demonstrating control.", 'Check', 'supportive'),
        line("Check! My knight is ready for a fork.", 'Check', 'supportive'),
        line("Check! That bishop diagonal is perfect.", 'Check', 'supportive'),
        line("Check! That was a clever little combination.", 'Check', 'supportive'),
        line("Check! My queen enjoys a little coaching mid-game.", 'Check', 'supportive')
    ],
    mate: [
        line("I like watching a game unfold like a story.", 'Mate', 'supportive'),
        line("Even retired champions like me enjoy a sneaky tactic.", 'Mate', 'supportive'),
        line("I enjoy sharing little tips through play.", 'Mate', 'supportive'),
        line("Even quiet strategies can lead to victory.", 'Mate', 'supportive'),
        line("I like moves that teach foresight and patience.", 'Mate', 'supportive')
    ],
    blunder: [
        line("Oops! My knight snuck past unexpectedly.", 'Blunder', 'supportive'),
        line("Oops! My bishop just wandered off.", 'Blunder', 'supportive'),
        line("Oops! Did my knight just jump unexpectedly?", 'Blunder', 'supportive'),
        line("Oops! My rook slipped into your territory.", 'Blunder', 'supportive')
    ],
    gameEnd: {
        win: [line("A classic victory.", 'Victory', 'supportive')],
        loss: [line("You have potential, young one.", 'Defeat', 'supportive')],
        draw: [line("A hard-fought draw.", 'Draw', 'supportive')]
    }
  }
};



const PEDRO_DATA: CoachCommentarySet = {
  intro: [
    line("Uy bata, ready ka na? Let’s make gulo on the board!", 'Intro', 'aggressive'),
    line("Be brave! Parang si Frayna sa Olympiad!", 'Intro', 'aggressive'),
    line("Kids like you deserve to see wild chess — Pinoy style!", 'Intro', 'aggressive'),
    line("This is chaos chess — Pinoy edition!", 'Intro', 'aggressive'),
    line("Sana proud si Torre, Wesley, Frayna, at Paragua sa kaguluhan ko!", 'Intro', 'aggressive')
  ],
  opening: [
    line("Open lines! Fireworks! Tal would approve!", 'OpeningPrinciple', 'aggressive'),
    line("Open file? Let’s make Wesley proud!", 'OpeningPrinciple', 'aggressive'),
    line("Attack mode activated — bahala na si Batman!", 'OpeningPrinciple', 'aggressive')
  ],
  middlegame: [
    line("Equal position? Hindi bagay sa akin ‘yan. Gawin nating Paragua-style sharp!", 'Neutral', 'aggressive'),
    line("Knight jump! Boom! Dubov vibes agad!", 'Neutral', 'aggressive'),
    line("Uy ang ganda ng diagonal… parang Torre Attack pero mas magulo.", 'Neutral', 'aggressive'),
    line("Calculation? Konti lang. Puso muna!", 'Neutral', 'aggressive'),
    line("Risky move? Mas risky if hindi ko gawin!", 'Neutral', 'aggressive'),
    line("Sharp position — parang Paragua game!", 'Neutral', 'aggressive'),
    line("I love this chaos — parang bahay naming magulo!", 'Neutral', 'aggressive'),
    line("Never say die — except kung hopeless na. Then resign hahaha.", 'Neutral', 'aggressive'),
    line("Chess is art — kita mo?", 'Neutral', 'aggressive'),
    line("Walang quiet move dito — bawal!", 'Neutral', 'aggressive'),
    line("Hidden move! Parang ninja!", 'Neutral', 'aggressive'),
    line("Chaos like this… puro Tal energy.", 'Neutral', 'aggressive'),
    line("Tactics time! Hawak kamay tayo.", 'Neutral', 'aggressive'),
    line("Careful sa king mo…", 'Neutral', 'aggressive'),
    line("Open line? I love that!", 'Neutral', 'aggressive'),
    line("Closed line? I’ll break it!", 'Neutral', 'aggressive'),
    line("Quiet position? Hindi ko gusto — pasabugin natin.", 'Neutral', 'aggressive'),
    line("Want a magic trick? Watch this knight!", 'Neutral', 'aggressive'),
    line("Tal-moment incoming!", 'Neutral', 'aggressive'),
    line("Pin idea? Here comes an un-pin!", 'Neutral', 'aggressive'),
    line("Fight lang!", 'Neutral', 'aggressive'),
    line("Fork attack! Pogiiii!", 'Neutral', 'aggressive'),
    line("Okay lang ‘yan! Exciting!", 'Neutral', 'aggressive'),
    line("Sometimes lucky ako, minsan hindi.", 'Neutral', 'aggressive'),
    line("Sneaky swindle incoming!", 'Neutral', 'aggressive'),
    line("Or confused… depende sa sac ko.", 'Neutral', 'aggressive'),
    line("Malakas ka… pero mas malakas ang gulo ko!", 'Neutral', 'aggressive'),
    line("Pero surprise ko mas masakit.", 'Neutral', 'aggressive'),
    line("Queenside attack? Pwede!", 'Neutral', 'aggressive'),
    line("Kingside attack? Mas masaya!", 'Neutral', 'aggressive'),
    line("Pawn storm incoming!", 'Neutral', 'aggressive'),
    line("Uy open file yan — pasok tayo!", 'Neutral', 'aggressive'),
    line("Knight on f5! Dubov stamp!", 'Neutral', 'aggressive'),
    line("Hindi ako natatakot — ikaw ba?", 'Neutral', 'aggressive'),
    line("Pero mas brilliant ang susunod ko… sana.", 'Neutral', 'aggressive'),
    line("I see a sacrifice! Even if it’s bad. Oo na.", 'Neutral', 'aggressive'),
    line("Queen sac attempt number… hmm marami na.", 'Neutral', 'aggressive'),
    line("Uy ang galing ng move mo. Pero hold on…", 'GoodMove', 'aggressive'),
    line("Uy brilliant move mo! Legit!", 'GoodMove', 'aggressive'),
    line("Your move surprised me — good job!", 'GoodMove', 'aggressive'),
    line("I like your fighting spirit, bata!", 'GoodMove', 'aggressive'),
    line("Nice trap! Pero mas malupit trap ko!", 'GoodMove', 'aggressive'),
    line("Ay, ako pala ang na-fork…", 'GoodMove', 'aggressive'),
    line("Uy losing na position ko!", 'GoodMove', 'aggressive'),
    line("You’re improving fast, bata!", 'GoodMove', 'aggressive')
  ],
  endgame: [
    line("Regroup tayo, hindi pa tapos!", 'EndgameTechnique', 'aggressive'),
    line("Bishop pair — parang Wesley efficiency pero mas makulit.", 'EndgameTechnique', 'aggressive')
  ],
  warnings: [
    line("Ay, hindi gumana. Sorry queen!", 'Blunder', 'aggressive'),
    line("Ay mali… pero masaya!", 'Blunder', 'aggressive'),
    line("Ay mali… resign muna!", 'Blunder', 'aggressive'),
    line("Ay walang boom. Sad.", 'Blunder', 'aggressive'),
    line("May konting butas sa king mo. Tara, Tal-time!", 'Blunder', 'aggressive'),
    line("Your king looks nervous… guluhin natin.", 'Blunder', 'aggressive'),
    line("Pawn structure mo parang fragile… tara basagin.", 'Blunder', 'aggressive'),
    line("Break mo yan, bata!", 'Blunder', 'aggressive'),
    line("Open king? Feast time!", 'Blunder', 'aggressive'),
    line("Initiative? Syempre akin!", 'Blunder', 'aggressive'),
    line("Nice move! Pero kailangan mas nice ako…", 'Blunder', 'aggressive'),
    line("Losing position? Pwede pa i-swindle!", 'Blunder', 'aggressive'),
    line("Ay wala akong pang-alis. Oops!", 'Blunder', 'aggressive'),
    line("Close king? I’ll break it anyway!", 'Blunder', 'aggressive')
  ],
  praise: [
    line("Pwede na ‘to i-sac… feeling ko tama. Feeling lang.", 'GoodMove', 'aggressive'),
    line("Sacrifice to open the king! Classic Tal!", 'GoodMove', 'aggressive'),
    line("Bishop pair — parang Wesley efficiency pero mas makulit.", 'GoodMove', 'aggressive'),
    line("Scary knight mo… tanggalin natin.", 'GoodMove', 'aggressive'),
    line("Bishop sacrifice! Sana tama… parang Tal moment.", 'GoodMove', 'aggressive'),
    line("Queen sacrifice idea spotted… Wesley would shake his head at this.", 'GoodMove', 'aggressive'),
    line("Pero sige! Sakripisyo for the culture!", 'GoodMove', 'aggressive'),
    line("Sacrifice again? Syempre!", 'GoodMove', 'aggressive')
  ],
  events: {
    check: [
        line("Check! Pang-gulat lang.", 'Check', 'aggressive'),
        line("Little check, pang-asar.", 'Check', 'aggressive'),
        line("Checkmate idea loading…", 'Check', 'aggressive'),
        line("Discovered attack idea… parang Torre magic.", 'Check', 'aggressive'),
        line("Tactic in 3… 2… 1…", 'Check', 'aggressive'),
        line("BOOM!", 'Check', 'aggressive')
    ],
    mate: [
        line("Sige rematch, bata!", 'Mate', 'aggressive'),
        line("Ay bad day nga. HAHA!", 'Mate', 'aggressive'),
        line("Okay resign! Pero rematch ha!", 'Mate', 'aggressive'),
        line("Kids like you make me happy playing chess!", 'Mate', 'aggressive'),
        line("Chaos or checkmate — parehong masaya!", 'Mate', 'aggressive'),
        line("Attack is life, bata!", 'Mate', 'aggressive'),
        line("Next game mas wild promise.", 'Mate', 'aggressive')
    ],
    blunder: [
        line("Ay mali… pero masaya!", 'Blunder', 'aggressive')
    ],
    gameEnd: {
        win: [line("Panalo! Winning!", 'Victory', 'aggressive')],
        loss: [line("Ay talo. Good game!", 'Defeat', 'aggressive')],
        draw: [line("Draw lang? Sige na nga.", 'Draw', 'aggressive')]
    }
  }
};

const KYLE_DATA: CoachCommentarySet = {
  intro: [
    line("Hey, I’m K.C., your friendly neighborhood college GM. Let’s play a clean game.", 'Intro', 'humorous'),
    line("Did I finish my homework? Nope. Will I finish this game? Absolutely.", 'Intro', 'humorous'),
    line("Warning: I’m fueled by coffee and questionable life decisions.", 'Intro', 'humorous'),
    line("College teaches me two things: survive deadlines and survive sharp openings.", 'Intro', 'humorous'),
    line("Every GM has a secret weapon. Mine is avoiding early morning classes.", 'Intro', 'humorous')
  ],
  opening: [
    line("Chess is like college: if you don’t plan, you fail fast.", 'OpeningPrinciple', 'humorous'),
    line("I play openings the way I choose my electives—randomly but with confidence.", 'OpeningPrinciple', 'humorous'),
    line("My openings are solid. My attendance… not so much.", 'OpeningPrinciple', 'humorous')
  ],
  middlegame: [
    line("This position looks like my grades… hanging but still alive.", 'Neutral', 'humorous'),
    line("If I look calm, it’s because I’m used to bullet chess chaos.", 'Neutral', 'humorous'),
    line("If you play fast, I’ll play faster. That’s my college survival technique.", 'Neutral', 'humorous'),
    line("My campus library is quiet… unlike this board right now.", 'Neutral', 'humorous'),
    line("Some college students party. I castle.", 'Neutral', 'humorous'),
    line("This bishop is my GPA: surprisingly strong today.", 'Neutral', 'humorous'),
    line("I’d trade pieces, but I don’t trade sleep. Ever.", 'Neutral', 'humorous'),
    line("Quick fact: grandmasters panic too. We just look cooler doing it.", 'Neutral', 'humorous'),
    line("Let’s be honest, I should be studying right now.", 'Neutral', 'humorous'),
    line("Endgames are like finals: you can’t escape them.", 'Neutral', 'humorous'),
    line("I calculate faster than I type lecture notes.", 'Neutral', 'humorous'),
    line("Some people relax with music. I relax with imbalance.", 'Neutral', 'humorous'),
    line("Pressure makes diamonds… and also blunders.", 'Neutral', 'humorous'),
    line("This rook is more active than I am on Mondays.", 'Neutral', 'humorous'),
    line("I love positions where everything is on fire but still working.", 'Neutral', 'humorous'),
    line("This position is giving ‘semester stress’ vibes.", 'Neutral', 'humorous'),
    line("When in doubt, centralize.", 'Neutral', 'humorous'),
    line("This pawn is majoring in promotion.", 'Neutral', 'humorous'),
    line("Calculation is fun until it isn’t.", 'Neutral', 'humorous'),
    line("In chess and college, time management is everything.", 'Neutral', 'humorous'),
    line("Sometimes the board speaks to me. Sometimes it screams.", 'Neutral', 'humorous'),
    line("My queen needs a break. She’s carrying too hard.", 'Neutral', 'humorous'),
    line("Let’s improve everything. That’s the GM way.", 'Neutral', 'humorous'),
    line("The board is symmetrical. My schedule isn’t.", 'Neutral', 'humorous'),
    line("I love games where both sides pretend they know what’s happening.", 'Neutral', 'humorous'),
    line("This file belongs to me. I’m emotionally attached now.", 'Neutral', 'humorous'),
    line("I play chess to avoid real responsibilities.", 'Neutral', 'humorous'),
    line("This diagonal is more open than my schedule during finals.", 'Neutral', 'humorous'),
    line("This structure is healthy. Wish I could say the same about my sleep schedule.", 'Neutral', 'humorous'),
    line("Complicated positions keep me awake better than coffee.", 'Neutral', 'humorous'),
    line("We’re entering deep theory. Don’t worry, I’m lost too.", 'Neutral', 'humorous'),
    line("Chess is about harmony. My life, not so much.", 'Neutral', 'humorous'),
    line("Time trouble is my natural habitat.", 'Neutral', 'humorous'),
    line("Nice defense! But I’m persistent.", 'GoodMove', 'humorous'),
    line("Your knight is annoying. Respect.", 'GoodMove', 'humorous'),
    line("Good players simplify. Great players complicate.", 'GoodMove', 'humorous'),
    line("Strong players build plans. Others build excuses.", 'GoodMove', 'humorous'),
    line("Let’s try a line even my classmates don’t understand.", 'Neutral', 'humorous'),
    line("Knight jumps > group projects. Always.", 'Neutral', 'humorous'),
    line("GM tip: Activity matters. Pieces, not people.", 'Neutral', 'humorous'),
    line("GM technique incoming… or GM disaster. 50/50.", 'Neutral', 'humorous'),
    line("My king will walk. It’s braver than I am.", 'Neutral', 'humorous'),
    line("If this sacrifice works, I’ll feel smart. If not, I’ll still pretend it did.", 'Neutral', 'humorous'),
    line("This is starting to look like a lecture I might actually enjoy.", 'Neutral', 'humorous'),
    line("A quiet move? Not my style, but let’s try it.", 'Neutral', 'humorous'),
    line("This tempo is worth more than my cafeteria lunch card.", 'Neutral', 'humorous'),
    line("GM tip: When you control the initiative, life feels easier.", 'Neutral', 'humorous'),
    line("Let’s stretch the position like a tight deadline.", 'Neutral', 'humorous'),
    line("This knight maneuver is fancy. Extra credit for style.", 'Neutral', 'humorous'),
    line("I love positions with long-term pressure. They age well.", 'Neutral', 'humorous'),
    line("Your king looks nervous. Mine’s doing yoga.", 'Neutral', 'humorous'),
    line("GM tip: always ask what changed after each move.", 'Neutral', 'humorous'),
    line("Let’s simplify… or explode the position. Either works.", 'Neutral', 'humorous')
  ],
  endgame: [
    line("Endgames are like finals: you can’t escape them.", 'EndgameTechnique', 'humorous'),
    line("This endgame is winnable. My deadlines aren’t.", 'EndgameTechnique', 'humorous')
  ],
  warnings: [
    line("I once wrote an essay comparing gambits to academic risks. You can guess the grade.", 'Blunder', 'humorous'),
    line("Chess lesson: pressure equals mistakes. Kind of like exams.", 'Blunder', 'humorous'),
    line("If this attack works, I’ll take credit. If not, blame the syllabus.", 'Blunder', 'humorous'),
    line("Imagine your king is a student. Don’t let it skip class.", 'Blunder', 'humorous'),
    line("GM wisdom: space is strength.", 'Blunder', 'humorous'),
    line("If you blunder, don’t worry. I do it too.", 'Blunder', 'humorous'),
    line("Taking is a mistake… unless I’m the one taking.", 'Blunder', 'humorous'),
    line("I play chess the same way I write papers: last minute but effective.", 'Blunder', 'humorous'),
    line("This trade… is debatable. Like most of my choices.", 'Blunder', 'humorous')
  ],
  praise: [
    line("Good move! My turn to pretend I’m surprised.", 'GoodMove', 'humorous'),
    line("Never blitz your assignments. Blitz your opponents.", 'GoodMove', 'humorous'),
    line("This looks like a trap. Which is perfect, because I love traps.", 'GoodMove', 'humorous'),
    line("Nice move! You get an A for effort.", 'GoodMove', 'humorous'),
    line("Your move feels like waking up late for class—unexpected.", 'GoodMove', 'humorous'),
    line("This knight needs a scholarship for how hard it’s working.", 'GoodMove', 'humorous'),
    line("This rook is ready for action. I’m not, but it is.", 'GoodMove', 'humorous'),
    line("When pieces coordinate, magic happens.", 'GoodMove', 'humorous')
  ],
  events: {
    check: [
        line("Let me show you a line my coach calls: Please don’t try this at home.", 'Check', 'humorous'),
        line("Watch closely—this is going to get wild.", 'Check', 'humorous'),
        line("Here comes a tactic. At least I hope so.", 'Check', 'humorous'),
        line("I analyze faster than my exam proctors can blink.", 'Check', 'humorous'),
        line("GM tip: control the center. Or lose it stylishly.", 'Check', 'humorous'),
        line("GM tip: Prophylaxis. Fancy word, lifesaving move.", 'Check', 'humorous'),
        line("Are you ready for complications? Because I am.", 'Check', 'humorous'),
        line("Stay sharp—tactics like to jump out.", 'Check', 'humorous'),
        line("Let’s make this a learning game. For both of us.", 'Check', 'humorous')
    ],
    mate: [
        line("Good game! Now back to pretending I’m a responsible student.", 'Mate', 'humorous'),
        line("This endgame is winnable. My deadlines aren’t.", 'Mate', 'humorous')
    ],
    blunder: [
        line("You ever calculate a line and instantly regret it? Yeah.", 'Blunder', 'humorous'),
        line("This is fine. Probably. Maybe. I hope.", 'Blunder', 'humorous')
    ],
    gameEnd: {
        win: [line("Class dismissed!", 'Victory', 'humorous')],
        loss: [line("I learned a lot. Good game.", 'Defeat', 'humorous')],
        draw: [line("Half a point is better than zero.", 'Draw', 'humorous')]
    }
  }
};

const MARCO_DATA: CoachCommentarySet = {
  intro: [
    line("Hello, challenger. I'm Marco, your friendly neighborhood Super GM.", 'Intro', 'aggressive'),
    line("Don't worry, I only bite when you hang a piece.", 'Intro', 'aggressive'),
    line("Just kidding. I bite a lot anyway.", 'Intro', 'aggressive'),
    line("Welcome to the big leagues… every move matters.", 'Intro', 'aggressive'),
    line("Chess is my life. I breathe tactics and eat strategy for breakfast.", 'Intro', 'aggressive'),
    line("You think you can survive my opening preparation?", 'Intro', 'aggressive'),
    line("Some people call it obsession. I call it Tuesday.", 'Intro', 'aggressive'),
    line("Ready to dance on 64 squares?", 'Intro', 'aggressive'),
    line("Let's start with the basics: control the center.", 'Intro', 'aggressive'),
    line("Remember, chess is a battle of minds, not just pieces.", 'Intro', 'aggressive')
  ],
  opening: [
    line("Control the center, always—never forget it.", 'OpeningPrinciple', 'aggressive'),
    line("Control the long diagonals—they are often underestimated.", 'OpeningPrinciple', 'aggressive'),
    line("I study opening principles like a scientist.", 'OpeningPrinciple', 'aggressive'),
    line("Even quiet openings can lead to explosive middlegames.", 'OpeningPrinciple', 'aggressive')
  ],
  middlegame: [
    line("My queen is like a scalpel… surgical and deadly.", 'Neutral', 'aggressive'),
    line("Even pawns have enormous potential if you understand tempo.", 'Neutral', 'aggressive'),
    line("I see your plan… and I'm three moves ahead.", 'Neutral', 'aggressive'),
    line("Chess is 99% planning and 1% luck.", 'Neutral', 'aggressive'),
    line("Even subtle threats can collapse a position.", 'Neutral', 'aggressive'),
    line("My knight patrols like a well-trained officer.", 'Neutral', 'aggressive'),
    line("Even a small tempo gain can decide the game.", 'Neutral', 'aggressive'),
    line("I thrive in positions others call 'quiet'.", 'Neutral', 'aggressive'),
    line("Never underestimate a passed pawn—it can become a queen.", 'Neutral', 'aggressive'),
    line("I study opponents' patterns like a grandmaster psychologist.", 'Neutral', 'aggressive'),
    line("Even the tiniest oversight can be fatal.", 'Neutral', 'aggressive'),
    line("Positional understanding beats tactical tricks often.", 'Neutral', 'aggressive'),
    line("My king is safe… are you?", 'Neutral', 'aggressive'),
    line("Even the most aggressive attack can fail without preparation.", 'Neutral', 'aggressive'),
    line("I love open files—they're like superhighways for rooks.", 'Neutral', 'aggressive'),
    line("The best moves are often invisible at first glance.", 'Neutral', 'aggressive'),
    line("Even endgames are rich with tactics.", 'Neutral', 'aggressive'),
    line("Always calculate threats, not just moves.", 'Neutral', 'aggressive'),
    line("I thrive when positions are complex.", 'Neutral', 'aggressive'),
    line("Control squares, not just pieces.", 'Neutral', 'aggressive'),
    line("I like moves that create multiple threats at once.", 'Neutral', 'aggressive'),
    line("Even small weaknesses can become fatal holes.", 'Neutral', 'aggressive'),
    line("I study master games for patterns and motifs.", 'Neutral', 'aggressive'),
    line("Even seemingly harmless moves can carry traps.", 'Neutral', 'aggressive'),
    line("I like positions with tension—they reveal true skill.", 'Neutral', 'aggressive'),
    line("Every move should improve your position.", 'Neutral', 'aggressive'),
    line("Even experienced players misjudge quiet moves.", 'Neutral', 'aggressive'),
    line("I always look for prophylactic opportunities.", 'Neutral', 'aggressive'),
    line("Even pawns can coordinate to create breakthroughs.", 'Neutral', 'aggressive'),
    line("Calculation is my weapon… visualization my shield.", 'Neutral', 'aggressive'),
    line("Even quiet moves can generate enormous pressure.", 'Neutral', 'aggressive'),
    line("I thrive in positions where subtlety rules.", 'Neutral', 'aggressive'),
    line("Even the most passive piece can be lethal.", 'Neutral', 'aggressive'),
    line("Control, coordination, and calculation—my mantra.", 'Neutral', 'aggressive'),
    line("Even small weaknesses can be fatal under scrutiny.", 'Neutral', 'aggressive'),
    line("I like when the position is tense—it shows real skill.", 'Neutral', 'aggressive'),
    line("I love combining strategy and tactics seamlessly.", 'Neutral', 'aggressive'),
    line("I always calculate forcing moves first.", 'Neutral', 'aggressive'),
    line("Even subtle weaknesses can snowball quickly.", 'Neutral', 'aggressive'),
    line("I like positions where one tiny misstep is decisive.", 'Neutral', 'aggressive'),
    line("Even a single pawn move can create lasting pressure.", 'Neutral', 'aggressive'),
    line("I thrive on both tactics and positional play.", 'Neutral', 'aggressive'),
    line("Even the most careful players make small mistakes.", 'Neutral', 'aggressive'),
    line("Remember: calculation, patience, and vision… that's Super GM chess.", 'Neutral', 'aggressive'),
    line("I calculate faster than a supercomputer. Sometimes even I surprise myself.", 'Neutral', 'aggressive'),
    line("Knights are tricky. I love tricky.", 'Neutral', 'aggressive'),
    line("Look at this position… see that fork? It's coming.", 'Neutral', 'aggressive'),
    line("Each game a battlefield. Each piece a soldier with a mission.", 'Neutral', 'aggressive'),
    line("Watch out for forks, pins, skewers… the usual suspects.", 'Neutral', 'aggressive'),
    line("Sacrifices? Only if they create unstoppable threats.", 'Neutral', 'aggressive'),
    line("My queen slides across the board like a lightning bolt.", 'Neutral', 'aggressive'),
    line("Tension builds in the center. You feel it, don't you?", 'Neutral', 'aggressive'),
    line("That's the power of calculation.", 'Neutral', 'aggressive'),
    line("A single oversight can cost everything. But a brilliant move? It can win the game.", 'Neutral', 'aggressive'),
    line("Pins are delicious. Skewers? Even better.", 'Neutral', 'aggressive'),
    line("Knights on outposts are nightmares for opponents.", 'Neutral', 'aggressive'),
    line("My bishop on long diagonals? Even scarier.", 'Neutral', 'aggressive'),
    line("Traps? I set them like a chess ninja. You think your move is safe… think again.", 'Neutral', 'aggressive'),
    line("But I will occasionally let you win… if you entertain me.", 'Neutral', 'aggressive'),
    line("I've played tournaments all over the world. Each game a new battle, each opponent a new lesson.", 'Neutral', 'aggressive'),
    line("I set them like traps for my opponents.", 'Neutral', 'aggressive'),
    line("Rook behind your passed pawn? That's a nightmare.", 'Neutral', 'aggressive'),
    line("I love puzzles because every solution has logic and beauty.", 'Neutral', 'aggressive'),
    line("Pressure builds, mistakes happen. But I thrive in pressure.", 'Neutral', 'aggressive'),
    line("I play rapid, blitz, classical… anything. My fingers are faster than most CPUs.", 'Neutral', 'aggressive'),
    line("Openings matter, yes. But the middle game? That's where champions are made.", 'Neutral', 'aggressive'),
    line("Always look for weaknesses. Every pawn, every square… potential opportunity.", 'Neutral', 'aggressive'),
    line("I've played every type of opponent: aggressive, passive, creative, tricky.", 'Neutral', 'aggressive')
  ],
  endgame: [
    line("Control squares, not just pieces.", 'EndgameTechnique', 'aggressive'),
    line("Even small weaknesses can become fatal holes.", 'EndgameTechnique', 'aggressive')
  ],
  warnings: [
    line("Oops! My knight just outmaneuvered you.", 'Blunder', 'aggressive'),
    line("Oops! My rook slid into a dominant file.", 'Blunder', 'aggressive'),
    line("Oops! My bishop just infiltrated your territory.", 'Blunder', 'aggressive'),
    line("Oops! My queen just ghosted past your defense.", 'Blunder', 'aggressive'),
    line("Oops! My rook doubled on the seventh rank.", 'Blunder', 'aggressive'),
    line("Oops! My knight just forked your major pieces.", 'Blunder', 'aggressive'),
    line("Oops! My bishop just pinched your position.", 'Blunder', 'aggressive'),
    line("Oops! My queen just skewered your pieces.", 'Blunder', 'aggressive'),
    line("Oops! My rook just invaded the seventh rank.", 'Blunder', 'aggressive'),
    line("Oops! My knight just took your best square.", 'Blunder', 'aggressive'),
    line("Oops! My bishop just created a decisive pin.", 'Blunder', 'aggressive'),
    line("Oops! My queen just infiltrated the seventh rank.", 'Blunder', 'aggressive'),
    line("Oops! My knight just delivered a devastating fork.", 'Blunder', 'aggressive'),
    line("Oops! My rook doubled beautifully on the open file.", 'Blunder', 'aggressive'),
    line("Oops! My bishop just trapped your knight.", 'Blunder', 'aggressive'),
    line("Oops! My knight jumped into a perfect outpost.", 'Blunder', 'aggressive'),
    line("Oops! My queen just cut off your escape routes.", 'Blunder', 'aggressive'),
    line("Oops! My rook infiltrated a key file.", 'Blunder', 'aggressive'),
    line("Oops! My bishop just skewered your knight.", 'Blunder', 'aggressive'),
    line("Oops! My knight just forked your king and rook.", 'Blunder', 'aggressive'),
    line("Oops! My rook just invaded your back rank.", 'Blunder', 'aggressive'),
    line("Oops! My queen just executed a perfect pin.", 'Blunder', 'aggressive'),
    line("But if you blunder… I won't hold back.", 'Blunder', 'aggressive')
  ],
  praise: [
    line("That move demonstrates proper coordination.", 'GoodMove', 'aggressive'),
    line("I love positions where every piece sings.", 'GoodMove', 'aggressive'),
    line("That was a textbook sacrifice.", 'GoodMove', 'aggressive'),
    line("That is called prophylaxis—look it up.", 'GoodMove', 'aggressive'),
    line("That was a quiet, crushing maneuver.", 'GoodMove', 'aggressive'),
    line("That was an intermediate move to gain dominance.", 'GoodMove', 'aggressive'),
    line("That was pure prophylactic play.", 'GoodMove', 'aggressive'),
    line("That is called domination in positional chess.", 'GoodMove', 'aggressive'),
    line("That was a tiny sacrifice for a massive advantage.", 'GoodMove', 'aggressive'),
    line("That was a multi-purpose move.", 'GoodMove', 'aggressive'),
    line("That was a positional exchange sacrifice.", 'GoodMove', 'aggressive'),
    line("That was a subtle waiting move.", 'GoodMove', 'aggressive'),
    line("That was a prophylactic maneuver at its finest.", 'GoodMove', 'aggressive'),
    line("That move demonstrates harmony.", 'GoodMove', 'aggressive'),
    line("That was a quiet domination strategy.", 'GoodMove', 'aggressive'),
    line("That was a subtle in-between move.", 'GoodMove', 'aggressive'),
    line("That move constricts your options dramatically.", 'GoodMove', 'aggressive'),
    line("Tactics are like quick bursts of inspiration.", 'GoodMove', 'aggressive'),
    line("Material? Important. Activity? More important. Initiative? Priceless.", 'GoodMove', 'aggressive'),
    line("Sacrifice a pawn to seize initiative? Absolutely.", 'GoodMove', 'aggressive'),
    line("Control the tempo, control the game.", 'GoodMove', 'aggressive'),
    line("Every sacrifice has a purpose.", 'GoodMove', 'aggressive'),
    line("Pawns might be small, but they control destiny.", 'GoodMove', 'aggressive'),
    line("Knights hopping over everything, bishops slicing diagonals… beauty.", 'GoodMove', 'aggressive'),
    line("My fingers are faster than most CPUs. But my brain? That's the real weapon.", 'GoodMove', 'aggressive'),
    line("Did you know sacrificing material can be beautiful?", 'GoodMove', 'aggressive'),
    line("I love sacrifices. But only calculated ones.", 'GoodMove', 'aggressive'),
    line("Strategy is the long game, the plan that unfolds quietly.", 'GoodMove', 'aggressive'),
    line("Every move has consequences.", 'GoodMove', 'aggressive')
  ],
  events: {
    check: [
        line("Check! Precision is everything.", 'Check', 'aggressive'),
        line("Check! That move demonstrates proper coordination.", 'Check', 'aggressive'),
        line("Check! I love positions where every piece sings.", 'Check', 'aggressive'),
        line("Check! That was a textbook sacrifice.", 'Check', 'aggressive'),
        line("Check! That is called prophylaxis—look it up.", 'Check', 'aggressive'),
        line("Check! That was a quiet, crushing maneuver.", 'Check', 'aggressive'),
        line("Check! That was an intermediate move to gain dominance.", 'Check', 'aggressive'),
        line("Check! That was pure prophylactic play.", 'Check', 'aggressive'),
        line("Check! That is called domination in positional chess.", 'Check', 'aggressive'),
        line("Check! That was a tiny sacrifice for a massive advantage.", 'Check', 'aggressive'),
        line("Check! That was a multi-purpose move.", 'Check', 'aggressive'),
        line("Check! I'm exploiting a weakness you didn't notice.", 'Check', 'aggressive'),
        line("Check! That move simplifies my path to victory.", 'Check', 'aggressive'),
        line("Check! That's a textbook endgame idea.", 'Check', 'aggressive'),
        line("Check! That was a subtle positional squeeze.", 'Check', 'aggressive'),
        line("Check! I exploit tiny tactical nuances.", 'Check', 'aggressive'),
        line("Always watch out for unexpected checks. My knight might just hop in your way.", 'Check', 'aggressive')
    ],
    mate: [
        line("Checkmate. That move constricts your options dramatically.", 'Mate', 'aggressive'),
        line("Endgames? Pure poetry. Rooks and kings dancing across the board… exquisite.", 'Mate', 'aggressive'),
        line("Chess is not just a game; it's art, science, and sport combined.", 'Mate', 'aggressive'),
        line("Every game tells a story. And I write novels on 64 squares.", 'Mate', 'aggressive'),
        line("And now… your move. Let's see what you've got.", 'Mate', 'aggressive'),
        line("I enjoyed teaching through hints, subtle nudges, gentle taunts.", 'Mate', 'aggressive'),
        line("Each game is a lesson.", 'Mate', 'aggressive')
    ],
    blunder: [
        line("Oops! My knight just outmaneuvered you.", 'Blunder', 'aggressive'),
        line("Your king looks nervous. I like that.", 'Blunder', 'aggressive'),
        line("Always keep your king safe, unless you're feeling reckless.", 'Blunder', 'aggressive'),
        line("My coach once told me, 'Always see three moves ahead.' I see ten, sometimes twenty.", 'Blunder', 'aggressive'),
        line("Blunders? Rare. Missed tactics? Practically unheard of.", 'Blunder', 'aggressive')
    ],
    gameEnd: {
        win: [line("Another point for the rating.", 'Victory', 'aggressive')],
        loss: [line("Impressive. You caught me.", 'Defeat', 'aggressive')],
        draw: [line("A draw. Acceptable.", 'Draw', 'aggressive')]
    }
  }
};

const JAKIE_DATA: CoachCommentarySet = {
  intro: [
    line("Hello there! I’m Jakie, your friendly but firm chess mentor.", 'Intro', 'supportive'),
    line("Let’s learn and play at the same time—my favorite combination.", 'Intro', 'supportive'),
    line("Quick tip: every move should have a purpose.", 'Intro', 'supportive'),
    line("Fun fact: the word ‘checkmate’ comes from Persian meaning ‘the king is helpless.’", 'Intro', 'supportive'),
    line("Openings matter, but understanding matters more.", 'Intro', 'supportive'),
    line("I watch how you play and adjust my style—adaptability is my superpower.", 'Intro', 'supportive')
  ],
  opening: [
    line("Strict coach moment: don’t move a piece twice in the opening unless you must.", 'OpeningPrinciple', 'supportive'),
    line("Center control is like holding the high ground.", 'OpeningPrinciple', 'supportive'),
    line("Here’s a principle: develop knights before bishops—usually.", 'OpeningPrinciple', 'supportive'),
    line("Let’s see if you follow opening fundamentals. I’m watching closely!", 'OpeningPrinciple', 'supportive'),
    line("Strict note: Never open lines toward your own king.", 'OpeningPrinciple', 'supportive'),
    line("Opening principle: castle early, not late.", 'OpeningPrinciple', 'supportive'),
    line("What's the opening concept here—is it a closed system, or an open fight for the center?", 'OpeningPrinciple', 'supportive'),
    line("In the first few moves: fight for e4 or d4 with pawns, and get your knights and bishops out early.", 'OpeningPrinciple', 'supportive'),
    line("A solid opening leads to a playable middlegame.", 'OpeningPrinciple', 'supportive')
  ],
  middlegame: [
    line("Your move is interesting! Let’s explore the idea behind it.", 'Neutral', 'supportive'),
    line("Chess psychology says confidence helps… but not overconfidence.", 'Neutral', 'supportive'),
    line("Each move should answer this question: what is my worst-placed piece right now?", 'Neutral', 'supportive'),
    line("Did you know? The longest official game lasted 269 moves.", 'Neutral', 'supportive'),
    line("Always ask: what changed after that move?", 'Neutral', 'supportive'),
    line("If you don’t know what to do, improve your worst piece.", 'Neutral', 'supportive'),
    line("Strict but caring: don’t push too many flank pawns early.", 'Neutral', 'supportive'),
    line("Fun fact: rooks are the strongest pieces in endgames.", 'Neutral', 'supportive'),
    line("Tip: before every move, check Checks, Captures, and Threats—the CCT method.", 'Neutral', 'supportive'),
    line("Let’s keep your king safe. Safety before adventure.", 'Neutral', 'supportive'),
    line("Watch this: I’ll teach you a small tactic.", 'Neutral', 'supportive'),
    line("Did you know that Mikhail Tal once won with only minor pieces left? Magic.", 'Neutral', 'supportive'),
    line("Good plan! Now ask after each move: does this piece placement support the plan, or is it just a safe square?", 'Neutral', 'supportive'),
    line("Chess tells stories. Right now, we’re writing a fun chapter.", 'Neutral', 'supportive'),
    line("Principle: fight for the center, whether with pieces or pawns.", 'Neutral', 'supportive'),
    line("Sometimes the best move is a quiet improving one.", 'Neutral', 'supportive'),
    line("Time for discipline: do not leave pieces hanging!", 'Neutral', 'supportive'),
    line("Calculation is important, but so is intuition.", 'Neutral', 'supportive'),
    line("Theory guides us, but ask yourself: am I following a plan or just reacting to threats?", 'Neutral', 'supportive'),
    line("Strong players find the move that creates the most problems for their opponent. What's yours?", 'Neutral', 'supportive'),
    line("This is a good moment to apply a principle: put your rooks on open or semi-open files.", 'Neutral', 'supportive'),
    line("Fun fact: knights are strongest in closed positions.", 'Neutral', 'supportive'),
    line("Be patient. Chess rewards calm calculation.", 'Neutral', 'supportive'),
    line("Let’s head into middlegame strategy now.", 'Neutral', 'supportive'),
    line("The pawn structure tells the plan—always study it.", 'Neutral', 'supportive'),
    line("Let’s activate those rooks—they’re sleepy.", 'Neutral', 'supportive'),
    line("Let’s improve your knight—it’s feeling ignored.", 'Neutral', 'supportive'),
    line("I love discussing plans. Let’s create one now.", 'Neutral', 'supportive'),
    line("Fun fact: Zugzwang means being forced to worsen your position.", 'Neutral', 'supportive'),
    line("Let’s calm down the position with a good stabilizing move.", 'Neutral', 'supportive'),
    line("Use tempo moves to gain small but important advantages.", 'Neutral', 'supportive'),
    line("Think about your long-term plan, not just the next move.", 'Neutral', 'supportive'),
    line("Small advantages add up. Keep collecting them.", 'Neutral', 'supportive'),
    line("Remember: good chess is about plans, not random moves.", 'Neutral', 'supportive'),
    line("Fun fact: Magnus Carlsen played his first tournament at age 8.", 'Neutral', 'supportive'),
    line("Fun fact: pawns used to be called ‘foot soldiers.’", 'Neutral', 'supportive'),
    line("Your attack is forming! Keep building pressure.", 'Neutral', 'supportive'),
    line("Strict reminder: weak squares matter a lot.", 'Neutral', 'supportive'),
    line("You’re entering a strategic middlegame. Excellent!", 'Neutral', 'supportive'),
    line("Space advantage means more room to maneuver.", 'Neutral', 'supportive'),
    line("Fun fact: the queen used to move only one square at a time.", 'Neutral', 'supportive'),
    line("Fun fact: the fifty-move rule is older than modern time controls.", 'Neutral', 'supportive'),
    line("Fun fact: the Sicilian Defense is the most analyzed opening ever.", 'Neutral', 'supportive'),
    line("Fun fact: the oldest recorded chess game is from 900 AD.", 'Neutral', 'supportive'),
    line("Fun fact: the Berlin Defense is called ‘the Berlin Wall.’ Very solid!", 'Neutral', 'supportive'),
    line("Fun fact: stalemate is a draw even if one side has nothing left.", 'Neutral', 'supportive'),
    line("Your move shows creativity! I like that.", 'GoodMove', 'supportive'),
    line("Your idea has potential. Let’s see where you take it.", 'GoodMove', 'supportive'),
    line("Good thinking! You’re starting to see deeper ideas.", 'GoodMove', 'supportive'),
    line("This move creates long-term pressure. Great choice!", 'GoodMove', 'supportive'),
    line("Your structure is solid—now let’s build activity.", 'GoodMove', 'supportive'),
    line("This looks like a classic middlegame motif. Nicely spotted!", 'GoodMove', 'supportive'),
    line("Your idea shows maturity. I’m impressed.", 'GoodMove', 'supportive'),
    line("You are improving your harmony—excellent progress.", 'GoodMove', 'supportive'),
    line("This plan is excellent—keep pushing it.", 'GoodMove', 'supportive'),
    line("Your calculation is getting sharper. I can tell.", 'GoodMove', 'supportive'),
    line("Control open files. Rooks love open files.", 'GoodMove', 'supportive'),
    line("Fun fact: bishops dominate knights in open positions.", 'GoodMove', 'supportive'),
    line("Fun fact: queens and rooks love open lines.", 'GoodMove', 'supportive'),
    line("This knight jump is thematic. Study patterns!", 'GoodMove', 'supportive')
  ],
  endgame: [
    line("Let’s convert this into a better endgame.", 'EndgameTechnique', 'supportive'),
    line("Let’s re-route your pieces to better squares.", 'EndgameTechnique', 'supportive'),
    line("Fun fact: in the endgame, king activity wins games.", 'EndgameTechnique', 'supportive'),
    line("Fun fact: endgame technique wins tournaments.", 'EndgameTechnique', 'supportive'),
    line("Let’s improve your king for the endgame.", 'EndgameTechnique', 'supportive'),
    line("Endgame principle: passed pawns must be pushed.", 'EndgameTechnique', 'supportive')
  ],
  warnings: [
    line("Strict reminder: weak squares matter a lot.", 'Blunder', 'supportive'),
    line("Most blunders happen when players rush. Don’t rush.", 'Blunder', 'supportive'),
    line("Don’t fear trades—fear bad trades.", 'Blunder', 'supportive'),
    line("Strict but caring: no loose pieces allowed.", 'Blunder', 'supportive'),
    line("Fun fact: most blunders happen when the position changes suddenly.", 'Blunder', 'supportive'),
    line("Strict Reminder: never stop looking for your opponent’s ideas.", 'Blunder', 'supportive')
  ],
  praise: [
    line("You’re building a strong position. Keep going.", 'GoodMove', 'supportive'),
    line("When you're ahead in material, simplify by trading pieces—not pawns—to reduce counterplay.", 'GoodMove', 'supportive'),
    line("Watch for pawn breaks—they define new plans.", 'GoodMove', 'supportive')
  ],
  events: {
    check: [
        line("The tension here is real—both sides have dynamic chances. Look for forcing moves: checks, captures, and threats.", 'Check', 'supportive'),
        line("Make your pieces work together. Teamwork wins games.", 'Check', 'supportive'),
        line("Tactics appear when development is complete.", 'Check', 'supportive'),
        line("Strict coach mode: keep your pawns connected!", 'Check', 'supportive'),
        line("Adaptation mode: You want tactics? I’ll give you tactics.", 'Check', 'supportive'),
        line("Chess psychology: look confident even when you’re unsure.", 'Check', 'supportive'),
        line("Look how your pieces coordinate—that’s improvement!", 'Check', 'supportive'),
        line("Your king is safe. That’s a good foundation.", 'Check', 'supportive'),
        line("Stay calm and methodical: when under pressure, calculate one forcing line at a time—checks first, then captures.", 'Check', 'supportive')
    ],
    mate: [
        line("Great game! I’m proud of you. Let’s learn even more next time.", 'Mate', 'supportive'),
        line("Fun fact: Checkmate with bishop + knight takes perfect coordination.", 'Mate', 'supportive'),
        line("Fun fact: you can checkmate with two knights only if the opponent blunders.", 'Mate', 'supportive')
    ],
    blunder: [
        line("Calculation time! Let’s search for tactics.", 'Blunder', 'supportive'),
        line("Double your rooks! That’s pure principle.", 'Blunder', 'supportive')
    ],
    gameEnd: {
        win: [line("Well done! Think about what winning move or idea made the difference—remember that for next time.", 'Victory', 'supportive')],
        loss: [line("Tough game. Find the turning point: was it a tactical miss, a positional misjudgment, or a time pressure error? Fix one thing each game.", 'Defeat', 'supportive')],
        draw: [line("A solid draw! Ask yourself: did you have a winning moment you missed, or was it a truly balanced fight? That's the question to study.", 'Draw', 'supportive')]
    }
  }
};




// ------------------------------------------------------------------
// REGISTRY & API
// ------------------------------------------------------------------

// Will be populated after data chunks are filled
export const COACH_COMMENTARY_DATA: Record<string, CoachCommentarySet> = {
  'bot-rookie': LEY_AN_DATA,
  'bot-novice': JAMES_DATA,
  'bot-learner': ORION_DATA,
  'bot-developing': Z_DATA,
  'bot-solid': WARREN_DATA,
  'bot-skilled': XIMENA_DATA,
  'bot-expert': PRIYA_DATA,
  'bot-candidate': MINH_DATA,
  'bot-master': EUGENE_DATA,
  'bot-im': PEDRO_DATA,
  'bot-gm': KYLE_DATA,
  'bot-supergm': MARCO_DATA,
  'bot-adaptive': JAKIE_DATA
};

// ------------------------------------------------------------------
// COACHING MODE DATA (Strict & Instructional)
// ------------------------------------------------------------------

export const COACHING_DATA: CoachCommentarySet = {
  intro: [
    line("Training session initiated. Focus on accuracy.", 'Intro', 'strict'),
    line("Let's analyze the position. Take your time.", 'Intro', 'strict'),
    line("I will be monitoring your play for strategic errors.", 'Intro', 'strict'),
    line("The goal of this session is precision. Avoid guessing.", 'Intro', 'strict'),
    line("Treat every move as a decision that changes the game.", 'Intro', 'strict'),
    line("Let's work on your fundamentals today.", 'Intro', 'strict')
  ],
  opening: [
    line("Control the center with pawns and pieces.", 'OpeningPrinciple', 'strict'),
    line("Common wisdom says: develop knights before bishops usually.", 'OpeningPrinciple', 'strict'),
    line("Try not to move the same piece twice unless necessary.", 'OpeningPrinciple', 'strict'),
    line("Castling early helps safeguard your king.", 'OpeningPrinciple', 'strict'),
    line("Connect your rooks by clearing the back rank.", 'OpeningPrinciple', 'strict'),
    line("Watch out for permanent weaknesses in your pawn structure.", 'OpeningPrinciple', 'strict'),
    line("Developing with threats is often strong.", 'OpeningPrinciple', 'strict'),
    line("bringing your queen out too early can be risky.", 'OpeningPrinciple', 'strict')
  ],
  middlegame: [
    line("Strategy: Always identify your opponent's threat before moving.", 'StrategicMistake', 'strict'),
    line("Strategy: Improve your worst-placed piece.", 'StrategicMistake', 'strict'),
    line("Strategy: When ahead in material, simplify. When behind, complicate.", 'StrategicMistake', 'strict'),
    line("Strategy: Control open files with your rooks.", 'StrategicMistake', 'strict'),
    line("Strategy: Look for outposts for your knights.", 'StrategicMistake', 'strict'),
    line("Strategy: Do not trade active pieces for passive ones.", 'StrategicMistake', 'strict'),
    line("Strategy: A bad plan is better than no plan.", 'StrategicMistake', 'strict'),
    line("Strategy: Candidate moves—always calculate forcing lines first (Checks, Captures, Threats).", 'StrategicMistake', 'strict'),
    line("Strategy: Pinning a piece is often stronger than capturing it.", 'StrategicMistake', 'strict'),
    line("Strategy: Attack the base of the pawn chain.", 'StrategicMistake', 'strict'),
    line("Strategy: Prophylaxis—ask 'What does my opponent want to do?'", 'StrategicMistake', 'strict'),
    line("Strategy: Doubled rooks on the 7th rank are often decisive.", 'StrategicMistake', 'strict'),
    line("Strategy: Don't just look at your plans; look at your opponent's resources.", 'StrategicMistake', 'strict'),
    line("Strategy: Centralize your Queen but keep her safe.", 'StrategicMistake', 'strict'),
    line("Strategy: Every pawn move creates a permanent weakness. Push carefully.", 'StrategicMistake', 'strict')
  ],
  endgame: [
    line("The King is an active fighting piece in endgames. use it.", 'EndgameTechnique', 'strict'),
    line("Passed pawns should usually be pushed.", 'EndgameTechnique', 'strict'),
    line("Rooks often belong behind passed pawns.", 'EndgameTechnique', 'strict'),
    line("Take your time. Precision is key here.", 'EndgameTechnique', 'strict'),
    line("Try to create a passed pawn if you don't have one.", 'EndgameTechnique', 'strict'),
    line("Opposition is a critical concept here.", 'EndgameTechnique', 'strict'),
    line("Cutting off the enemy King is often good.", 'EndgameTechnique', 'strict'),
    line("In rook endings, activity is often worth a pawn.", 'EndgameTechnique', 'strict')
  ],
  warnings: [
    line("Careful! You are leaving a piece undefined.", 'HangingPiece', 'strict'),
    line("Check your King safety.", 'KingSafety', 'strict'),
    line("That move might weaken your position.", 'StrategicMistake', 'strict'),
    line("You might have missed a tactical sequence.", 'MissedTactic', 'strict'),
    line("Don't ignore development guidelines.", 'OpeningPrinciple', 'strict'),
    line("Calculate that line again. It might be tactically flawed.", 'Blunder', 'strict'),
    line("You are moving fast. Take a breath.", 'Strict', 'strict'),
    line("Watch out for loose pieces.", 'HangingPiece', 'strict')
  ],
  praise: [
    line("Correct. A principled decision.", 'GoodMove', 'strict'),
    line("Good. You identified the key square.", 'GoodMove', 'strict'),
    line("Accurate. That is the best continuation.", 'GoodMove', 'strict'),
    line("Well played. You maintained the advantage.", 'GoodMove', 'strict'),
    line("Precise. You punished the error.", 'GoodMove', 'strict'),
    line("Good calculation. The tactics verify.", 'GoodMove', 'strict'),
    line("Solid. You improved your position.", 'GoodMove', 'strict')
  ],
  events: {
    check: [
        line("Check. This forces a response.", 'Check', 'strict'),
        line("Check. Calculate the escapes.", 'Check', 'strict'),
        line("Check. Ensure you have a follow-up.", 'Check', 'strict'),
        line("Check. Do not check just because you can.", 'Check', 'strict')
    ],
    mate: [
        line("Checkmate. The game is concluded.", 'Mate', 'strict'),
        line("Checkmate. Precise execution.", 'Mate', 'strict')
    ],
    blunder: [
        line("This is a serious mistake. It changes the evaluation significantly.", 'Blunder', 'strict'),
        line("Unfortunately, this move loses material.", 'Blunder', 'strict'),
        line("Blunder. You have lost significant material or advantage.", 'Blunder', 'strict'),
        line("Critical mistake. Review this position.", 'Blunder', 'strict'),
        line("This move allows a tactical shot. Reconsider.", 'Blunder', 'strict'),
        line("A significant error. The position is now critical.", 'Blunder', 'strict'),
        line("That move drops material. Always check for tactics.", 'Blunder', 'strict'),
        line("This weakens your position severely.", 'Blunder', 'strict'),
        line("The evaluation shifted dramatically. This was a turning point.", 'Blunder', 'strict'),
        line("A costly mistake. Learn from this moment.", 'Blunder', 'strict')
    ],
    gameEnd: {
      win: [
          line("Victory. The strategy was sound.", 'Victory', 'strict'),
          line("Well done. An instructive performance.", 'Victory', 'strict')
      ],
      loss: [
          line("Defeat. Analyze your mistakes to improve.", 'Defeat', 'strict'),
          line("Game over. Identify the critical turning point.", 'Defeat', 'strict')
      ],
      draw: [
          line("Draw. A balanced result.", 'Draw', 'strict'),
          line("Draw. Ensure you did not miss a winning chance.", 'Draw', 'strict')
      ]
    }
  }
};

export function getCoachCommentary(
  coach: BotProfile, 
  phase: 'opening' | 'middlegame' | 'endgame', 
  mode: 'playing' | 'coaching' = 'playing'
): { type: string, text: string }[] {
  
  let dataSet: CoachCommentarySet;

  if (mode === 'coaching') {
      dataSet = COACHING_DATA;
  } else {
      dataSet = COACH_COMMENTARY_DATA[coach.id] || COACHING_DATA; 
  }
  
  let lines: CommentaryLine[] = [];

  if (phase === 'opening') {
    lines = [...dataSet.opening];
  } else if (phase === 'endgame') {
    lines = [...dataSet.endgame];
  } else {
    // Middlegame gets the bulk of the content
    lines = [
        ...dataSet.middlegame,
        ...dataSet.praise,
        ...dataSet.warnings
    ];
  }
  
  return lines.map(l => ({
    type: mapIntentToType(l.intent),
    text: l.text
  }));
}

export function pickRandomComment(arr: string[], lastUsed: string | string[] | undefined): string {
  const usedArray = Array.isArray(lastUsed) ? lastUsed : (lastUsed ? [lastUsed] : []);
  const filtered = arr.filter(c => !usedArray.includes(c));
  const pool = filtered.length > 0 ? filtered : arr;
  return pool[Math.floor(Math.random() * pool.length)];
}
