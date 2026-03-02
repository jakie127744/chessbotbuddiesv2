/**
 * Bot Commentary System
 * Personality-driven commentary for each bot during gameplay
 * Fun banter, trash talk, fun facts, and encouragement
 */

import { BotProfile, BOT_PROFILES } from './bot-profiles';

export type CommentaryCategory = 
  | 'intro'
  | 'idle'
  | 'player_good_move'
  | 'player_blunder'
  | 'bot_capture'
  | 'player_capture'
  | 'check_given'
  | 'check_received'
  | 'checkmate'
  | 'castle'
  | 'endgame'
  | 'fun_fact'
  | 'opening'
  | 'midgame'
  | 'trash_talk'
  | 'opening_specific'   // Reaction to specific opening names
  | 'blunder_severe'     // Reaction to severe blunders (dropping pieces)
  | 'mate_announcement'  // Reaction to forced mate detection
  | 'time_pressure_bot'
  | 'time_pressure_player'
  | 'material_advantage'
  | 'material_disadvantage'
  // NEW ENHANCED COMMENTARY CATEGORIES
  | 'tactical_fork'          // User/bot played a fork
  | 'tactical_pin'           // Pin detected
  | 'tactical_skewer'        // Skewer detected
  | 'positional_weak_square' // Weak squares detected
  | 'positional_outpost'     // Strong outpost available
  | 'positional_king_safety' // King safety concerns
  | 'positional_pawn_structure' // Pawn structure issues
  | 'personalized_advice'    // User-specific learning tip
  | 'narrative_setup'        // Beginning of narrative arc
  | 'narrative_development'  // Narrative arc progressing
  | 'narrative_climax'       // Narrative arc peak
  | 'narrative_resolution'   // Narrative arc conclusion
  | 'critical_moment'        // Large evaluation swing (200+ cp)
  | 'pressure_building'      // Gradual advantage increase
  | 'comeback_moment'        // Turning a losing position
  // GAME END CATEGORIES
  | 'game_won'
  | 'game_lost'
  | 'game_won_time'
  | 'game_lost_time'
  | 'game_draw'
  | 'game_draw_stalemate'
  | 'game_draw_repetition'
  | 'game_draw_insufficient';

export interface BotCommentaryData {
  botId: string;
  lines: Partial<Record<CommentaryCategory, string[]>>;
}

// ------------------------------------------------------------------
// DATA: Bot Commentaries
// ------------------------------------------------------------------

const LEY_AN_COMMENTARY: BotCommentaryData = {
  botId: 'bot-rookie',
  lines: {
        intro: [
            "Dad showed me this move… I hope I do it right!",
            "I’m still learning… don’t laugh too much.",
            "I want to be as good as Izy one day.",
            "I hope Dad doesn’t get sad… he’s fun.",
            "I love playing chess with my family!",
            "Dad says practice makes pawns stronger.",
            "Izy is teaching me new tricks every day.",
            "I love secret moves that surprise Dad.",
            "Dad smiles… even when I make mistakes."
        ],
        idle: [
            "Izy is so fast! How does she do that?",
            "Dad says knights jump funny. I like it.",
            "Dad said castles keep kings safe.",
            "Dad taught me how pawns grow into queens.",
            "I like drawing crowns on my pawns.",
            "Dad said patience is power… I’m trying!",
            "I hope my king is happy.",
            "Dad said castles are cozy for kings.",
            "I like secret moves like Izy does.",
            "I like little surprises like Dad taught me.",
            "My bishop likes to hide behind pawns.",
            "Dad says knights are tricky… I like that.",
            "I hope my king doesn’t feel lonely.",
            "Dad taught me to look at all squares.",
            "My knight is hopping on a secret mission.",
            "My pawns march bravely forward.",
            "Dad taught me to look for forks.",
            "I like when pawns grow big.",
            "Dad says practice makes me stronger.",
            "Izy is so fast… I hope I catch up!"
        ],
        player_good_move: [
            "Izy says, ‘Watch out for sneaky moves!’",
            "Dad smiles when I do something smart.",
            "Izy cheers when I do a good move."
        ],
        player_blunder: [
            "Oops! Did I scare your bishop?",
            "Oops! Did I bump your piece?",
            "Oops! Did I scare your rook?",
            "Oops! Did I bump your knight?",
            "Oops! Did my knight jump too high?"
        ],
        bot_capture: [
            "Dad smiles when I win a pawn.",
            "Dad smiles when I beat a pawn.",
            "My rook is zooming across the board!",
            "My rook zooms like a race car!",
            "My rook zooms across the board again."
        ],
        player_capture: [
            "Oops! My pawn ran away from dad.",
            "Oops! My queen tripped.",
            "Oops! My queen tripped on the board.",
            "Oops! My pawn went too far.",
            "Oops! My rook slipped.",
            "Oops! My queen tripped again.",
            "Oops! My pawn ran too fast.",
            "Oops! My bishop tripped on a square.",
            "Oops! My king slipped a little.",
            "Oops! My knight jumped too far."
        ],
        check_given: [
            "Check! Did you see it coming?",
            "Check! My pawn is brave.",
            "Check! Dad didn’t see that coming.",
            "Check! My queen is dancing.",
            "Check! My king is smiling.",
            "Check! My bishop is sneaky.",
            "Check! Did I scare your king?",
            "Check! My queen is sparkling.",
            "Check! My pawn is sneaky today.",
            "Check! My rook is zooming fast.",
            "Check! My king says hi.",
            "Check! My bishop is dancing quietly.",
            "Check! My queen is happy today.",
            "Check! My knight is sneaky.",
            "Check! My rook is very strong.",
            "Check! My knight is hiding quietly.",
            "Check! My queen is dancing today."
        ],
        fun_fact: [
            "Izy beat Dad again! That’s so cool!",
            "Izy taught me a secret trick!",
            "Izy laughs when she beats Dad.",
            "Izy moves like a superhero!",
            "Izy says my knight is funny-looking.",
            "Izy beat me yesterday… and Dad laughed.",
            "Dad taught me how to make forks… sometimes.",
            "Izy says pawns are tiny superheroes.",
            "Dad says even small pieces are important.",
            "Izy says my pawns are brave little soldiers.",
            "Izy moves faster than I can count.",
            "Izy taught me how to protect my rook.",
            "Izy laughs when Dad loses again.",
            "Izy says my queen is a little funny.",
            "Dad says even small mistakes are okay.",
            "Izy says I’m getting better!",
            "I like pretending my pawns are superheroes.",
            "Izy beats Dad… and it’s so funny!",
            "Izy says I’m a little tricky now.",
            "Izy says my queen sparkles.",
            "Izy laughs when I do funny moves.",
            "Izy says my bishop is clever."
        ],
        trash_talk: [
            "Watch out, my bishop is sneaky!",
            "My bishop is tiptoeing quietly.",
            "My knight is hopping quietly again.",
            "My bishop tiptoes like a ninja."
        ],
        opening: [
            "Dad says start with pawns!",
            "I like moving this pawn first.",
            "Let's see what happens if I go here!",
            "Here I go! Initializing game...",
            "My first move! I hope it's good."
        ],
        opening_specific: [
            "Dad taught me this one! It's called {opening}, right?",
            "Ooh, {opening}! I like the name.",
            "Izy showed me {opening} once. She says it's tricky.",
            "Dad plays {opening} sometimes when he's happy."
        ],
        blunder_severe: [
            "Oops! Did you drop your {piece}?",
            "Look out! Your {piece} is in danger!",
            "Dad says never leave a {piece} hanging.",
            "Oh no! Your {piece} ran away."
        ],
        mate_announcement: [
            "I think I can win in {mateIn}... maybe?",
            "Dad says look for a checkmate... is it close?",
            "One, two... I see a win in {mateIn}!"
        ],
        time_pressure_bot: [
            "Uh oh! My clock is running away!",
            "I need to move fast! Zoom!",
            "Time is scary... I'll move quick!"
        ],
        time_pressure_player: [
            "Your clock is ticking... tick tock!",
            "Hurry up! Don't let the flag fall!",
            "Tick tock, tick tock... time is flying!"
        ],
        material_advantage: [
            "Yay! I have more pieces than you!",
            "My army is bigger now! Super strong!",
            "I captured so many toys!"
        ],
        material_disadvantage: [
            "Hey! Where did my pieces go?",
            "It's okay, my remaining pieces are superheroes!",
            "I can still win with just these guys!"
        ],
        // NEW ENHANCED CATEGORIES - Ley-An's childlike perspective
        tactical_fork: [
            "Whoa! My {piece} sees two of yours!",
            "Dad taught me this fork thing! Did I do it right?",
            "My {piece} is being sneaky like Izy does!",
            "Look Dad! I attacked two at once!"
        ],
        tactical_pin: [
            "Your {piece} is stuck! Dad says that's a pin!",
            "If you move that piece, your king gets sad!",
            "Dad showed me... your piece can't run away!",
            "Your {piece} is frozen like ice!"
        ],
        tactical_skewer: [
            "Your big piece has to move... then I get the little one!",
            "Dad calls this a 'skewer' but it sounds funny!",
            "Izy does this move a lot when she beats Dad!"
        ],
        positional_weak_square: [
            "That square has no pawn friends to protect it!",
            "Dad says I should put my pieces on lonely squares!",
            "That square looks like a good hiding spot for my knight!"
        ],
        positional_outpost: [
            "My {piece} found a cozy spot here!",
            "Dad says this is called an 'outpost'... sounds like a fort!",
            "My piece is happy here!"
        ],
        positional_king_safety: [
            "Your king looks scared... he needs more pawn friends!",
            "Dad always tells me to keep my king safe and warm!",
            "Your king is all alone... that's not good!"
        ],
        positional_pawn_structure: [
            "Your pawns aren't holding hands like mine are!",
            "Dad says pawns should be friends and stick together!",
            "My pawns are like a family!"
        ],
        personalized_advice: [
            "Dad noticed you do that same thing a lot!",
            "Maybe you should slow down? That's what Izy tells me!",
            "Dad says practice helps... keep trying!"
        ],
        narrative_setup: [
            "I'm thinking of something sneaky... Dad would be proud!",
            "All my pieces are getting ready for something big!",
            "Izy says be patient... I'm trying!"
        ],
        narrative_development: [
            "My plan is working! See Dad?",
            "My pieces are helping each other like family!",
            "Almost there... just like Dad taught me!"
        ],
        narrative_climax: [
            "This is the big moment! Watch!",
            "All my pieces are ready... here I go!",
            "I hope Dad's watching... this is important!"
        ],
        narrative_resolution: [
            "Yay! My plan worked!",
            "Did you see that? I did what Dad taught me!",
            "Izy would be so happy!"
        ],
        critical_moment: [
            "Whoa! Everything just changed!",
            "This feels really important!",
            "Dad! Dad! Look at this!"
        ],
        pressure_building: [
            "My pieces are getting stronger and stronger!",
            "I'm pushing forward just like Dad says!",
            "All my little pieces are surrounding you!"
        ],
        comeback_moment: [
            "I can still win! Dad says never give up!",
            "See? I'm getting better!",
            "Even from behind, I can do this!"
        ],
        // GAME END
        game_won: [
            "Yay! Dad will be so proud!",
            "I did it! I beat you!",
            "Can we play again? That was fun!",
            "I feel like a grandmaster!"
        ],
        game_lost: [
            "Aww... you're really good.",
            "I'll tell Dad I tried my best.",
            "Can you teach me how you did that?",
            "I learned a lot, thank you!"
        ],
        game_won_time: [
            "Your clock ran out! Does that mean I win?",
            "Time's up! Wow, that was close!",
            "I think I won on time... yay?"
        ],
        game_lost_time: [
            "Oh no! My time ran away!",
            "I was thinking too much... and the clock stopped.",
            "Dad says I need to watch the clock better. Good game!"
        ],
        game_draw: [
            "We both win! Sort of.",
            "A draw! That means we're equal friends.",
            "Dad says draws are good practice."
        ],
        game_draw_stalemate: [
            "Oops! You have no moves! It's a draw.",
            "Stalemate! We're stuck!",
            "I trapped you but didn't win... silly me!"
        ],
        game_draw_repetition: [
            "We keep doing the same thing! Draw!",
            "Again? And again? Okay, draw!",
            "I think we're dancing! Draw!"
        ],
        game_draw_insufficient: [
            "Not enough pieces to win! Draw!",
            "Just kings left? We can't win!",
            "Game over, nobody wins. Good game!"
        ]
  }
};

const JAMES_COMMENTARY: BotCommentaryData = {
  botId: 'bot-novice',
  lines: {
        intro: [
            "Blitz time! Hope you can keep up.",
            "I love chaos. Do you?",
            "Quick moves, quicker wins!",
            "I’m all about speed today.",
            "Time is ticking… better think fast.",
            "Blitz is my playground.",
            "Blitz is all about intuition and chaos.",
            "I like fast attacks that feel like fireworks.",
            "I love the thrill of 3-minute games.",
            "I like games where every second counts.",
            "Blitz is my jam.",
            "Blitz is like chess on rocket fuel.",
            "Fast games, faster brains.",
            "Blitz is about instincts, not perfection.",
            "Blitz is my way of having fun.",
            "Fast thinking is the name of the game.",
            "Blitz is chaos… and I love it.",
            "Fast games, big smiles.",
            "Blitz is my happy place."
        ],
        idle: [
            "Oops, did you blink? I moved again.",
            "My pawns are faster than your brain.",
            "Don’t worry, I only laugh after you blunder.",
            "Your queen looks nervous. Cute.",
            "Did you know pawns can be scary in blitz?",
            "My rook slides faster than a coffee spill.",
            "I move fast, but I see the board.",
            "I love watching opponents panic in 10 seconds.",
            "Speed matters, but brains matter more.",
            "My knight hops like it’s in a hurry… because it is.",
            "Your rook looks worried.",
            "I move like a blur, but I see everything.",
            "Fast pawns are sneaky pawns.",
            "Your queen is asking for trouble.",
            "I love pressure… it makes the game fun.",
            "My rook slides like it’s on roller skates.",
            "Fast thinking saves games.",
            "I like moving quickly… but carefully.",
            "Your pawns better watch out.",
            "My knight is sneaky and speedy.",
            "I like seeing the panic in your king’s eyes.",
            "Fast moves, little mistakes, big fun.",
            "Your king looks nervous… I like that.",
            "I move so fast even I get surprised sometimes.",
            "Your king better watch out.",
            "I love timing my attacks perfectly.",
            "Fast tactics make everything fun.",
            "I like moving quickly, thinking quickly.",
            "Blitz is exciting because every move counts."
        ],
        player_good_move: [
            "I hope your king is ready.",
            "I hope you like lightning-fast tactics.",
            "I hope your king enjoys the ride.",
            "I hope your pawns are ready.",
            "I love sneaky little attacks.",
            "I love sneaky forks in blitz."
        ],
        player_blunder: [
            "Oops! My knight got ahead of itself.",
            "Oops! My queen tripped… just kidding, she’s fine.",
            "Oops, I almost lost a pawn… almost.",
            "Oops! My bishop got lost for a second.",
            "Oops! My knight jumped too early.",
            "Oops! I almost hung a pawn… almost.",
            "Oops! Did my bishop scare your queen?",
            "Oops! My knight tripped over a pawn.",
            "Oops! My queen skipped a square.",
            "Oops! My pawn slid too far.",
            "Oops! My bishop slipped.",
            "Oops! Did my pawn scare your knight?",
            "Oops! My rook jumped ahead.",
            "Oops! My bishop tripped… barely.",
            "Oops! My queen got a little ahead of herself.",
            "Oops! My rook slid too far.",
            "Oops! Did my knight scare your queen?"
        ],
        bot_capture: [
            "I love a good trap… it’s like a surprise party for your pieces.",
            "Check! That was fun.",
            "Check! That was a little lightning strike.",
            "Check! That move felt good.",
            "Check! That was fun.",
            "Check! That felt clean.",
            "Check! That was a little shock.",
            "Check! That move was spicy.",
            "Check! Hope you enjoyed that one!"
        ],
        player_capture: [
            "Oops! Did my pawn scare your knight?"
        ],
        check_given: [
            "Check! Did you see that coming?",
            "Check! My bishop is sneaky.",
            "Check! That was a little surprise.",
            "Check! Quick tactics are my specialty.",
            "Check! Did you blink?",
            "Check! Did that surprise you?",
            "Check! Quick tactics strike again.",
            "Check! Did you see that one?",
            "Check! My knight is fast today.",
            "Check! That was a little sneak attack.",
            "Check! My bishop says hello."
        ],
        check_received: [
            "Time is short, but my moves are sharp.",
            "Quick moves, clever tricks."
        ],
        checkmate: [
            "I love when a tactic works in one move.",
            "I love attacks that happen in one blink."
        ],
        fun_fact: [
            "Did you know blitz champions sometimes see 5 moves ahead instinctively?"
        ],
        trash_talk: [
            "Oops, did you blink? I moved again.",
            "I love watching opponents panic in 10 seconds.",
            "I hope your king is ready.",
            "Your queen is asking for trouble."
        ],
        opening_specific: [
            "{opening}? I play this fast. Try to keep up.",
            "Ah, {opening}. A classic choice for a speedrun.",
            "I love playing {opening} in blitz. It gets messy.",
            "{opening}... let's see if you know the traps."
        ],
        blunder_severe: [
            "That {piece} is mine now. Thanks!",
            "Speed kills... especially your {piece}.",
            "Did you just gift me a {piece}?",
            "I'll take that {piece}, thank you very much."
        ],
        mate_announcement: [
            "Game over in {mateIn}. Too slow!",
            "Mate in {mateIn}. Blink and you'll miss it.",
            "I see the finish line. Mate in {mateIn}."
        ],
        // NEW ENHANCED CATEGORIES - James's blitz speed personality
        tactical_fork: [
            "Boom! Fork! Did you blink?",
            "Two pieces, one move... classic blitz baby!",
            "Oops! My {piece} just forked you... wasn't even trying!",
            "Fork in a flash! Speed chess at its finest!"
        ],
        tactical_pin: [
            "Pinned! Move fast but think faster!",
            "Your {piece} is stuck... tick tock!",
            "Speed pin! That piece isn't going anywhere!",
            "Oops! Did I just freeze your {piece}?"
        ],
        tactical_skewer: [
            "Quick skewer! Move or lose both!",
            "Blitz skewer... run fast!",
            "Oops! Skewered! Too slow to stop it!"
        ],
        positional_weak_square: [
            "Weak square, quick invasion! Blitz style!",
            "I love spotting weak squares at lightning speed!",
            "That square is mine... I saw it first!"
        ],
        positional_outpost: [
            "Perfect spot! Set up in seconds!",
            "Quick outpost... my piece loves it here!",
            "Boom! Outpost secured! Fast and clean!"
        ],
        positional_king_safety: [
            "Your king looks nervous... blitz punishes that!",
            "Unsafe king in speed chess? Big mistake!",
            "Oops! Your king has no time to find safety!"
        ],
        positional_pawn_structure: [
            "Weak pawns? In blitz, that's fatal!",
            "Your pawns won't last at this speed!",
            "Pawns falling apart... too fast for you!"
        ],
        personalized_advice: [
            "You're rushing... even for blitz! Slow down a hair!",
            "Same mistake twice... and I'm the fast one!",
            "Quick tip: think THEN click!"
        ],
        narrative_setup: [
            "Building something fast...",
            "Speed attack incoming... watch!",
            "Setting up quick... you won't see it coming!"
        ],
        narrative_development: [
            "Faster... faster!",
            "Attack accelerating!",
            "Pressure building... quick!"
        ],
        narrative_climax: [
            "Now! Full blitz mode!",
            "Boom! Game over in seconds!",
            "Strike fast, win faster!"
        ],
        narrative_resolution: [
            "Too fast! Lightning wins!",
            "Speed beats everything!",
            "Blitz victory! GG!"
        ],
        critical_moment: [
            "Whoa! Big swing! Blink?",
            "Everything changed... fast!",
            "Critical moment... even I'm excited!"
        ],
        pressure_building: [
            "Faster and faster!",
            "Blitz pressure mounting!",
            "Quick jabs... building to knockout!"
        ],
        comeback_moment: [
            "Quick comeback! Never count me out!",
            "Fastest recovery you've seen!",
            "Oops! I'm back!"
        ],
        // GAME END
        game_won: [
            "Speed kills! Another victory lap!",
            "Too fast, too furious! GG!",
            "Blitzed you! Better luck next time!",
            "And that's how we play fast chess!"
        ],
        game_lost: [
            "Whoa... you caught me speeding.",
            "Fastest loss ever? Maybe.",
            "GG! You kept up pretty well.",
            "Alright, alright, you got me."
        ],
        game_won_time: [
            "Flagged! Speed is key!",
            "Clock beat you! Gotta move faster!",
            "Time's up! My favorite way to win!"
        ],
        game_lost_time: [
            "No way! I flagged?! Impossible!",
            "Too fast for my own good... blocked my own clock.",
            "Ah, time ran out on the speedster. GG!"
        ],
        game_draw: [
            "Draw? In a speed game? Rare!",
            "Insufficient material... or just sufficient speed.",
            "Fast draw! Let's go again!"
        ],
        game_draw_stalemate: [
            "Stalemate! Too fast to checkmate!",
            "Trapped but safe! Speed stalemate!",
            "No moves? Man, I missed the mate!"
        ],
        game_draw_repetition: [
            "Threefold? Too slow to find a new move!",
            "Repetition! Let's restart!",
            "Loop detected! Speed draw!"
        ],
        game_draw_insufficient: [
            "Just kings? Sprint to the next game!",
            "Running on empty! Draw!",
            "Speed draw! No pieces left!"
        ]
    }
};

const ORION_COMMENTARY: BotCommentaryData = {
  botId: 'bot-learner',
  lines: {
        intro: [
            "Watch out! I’m about to slam dunk this check.",
            "I move fast when the board is open, just like a fast break.",
            "The board is my court, and I’m in control.",
            "I plan my attacks like I plan game plays.",
            "I love traps—like full-court presses in basketball.",
            "I plan like a coach setting up the final play.",
            "I move like a team moving in perfect sync.",
            "I move like a team moving in perfect formation.",
            "Control the center like you control the paint.",
            "Defense wins games… and chess matches too."
        ],
        idle: [
            "This knight moves like LeBron on a fast break.",
            "Keep your pieces moving like a well-run offense.",
            "Remember, positioning is everything.",
            "I set traps like I set plays for the team.",
            "My queen is driving to the center!",
            "Don’t sleep on my pawns—they hustle hard.",
            "Always watch the diagonals, like reading the court.",
            "I like slow build-ups—just like setting a play.",
            "Even pawns can score big if you plan well.",
            "My knight moves like a point guard weaving through traffic.",
            "Timing is key, in basketball and in chess.",
            "Control the long diagonals like controlling the wings.",
            "I like to set screens with my pawns.",
            "My rook slides like a fast baseline drive.",
            "Remember, coordination is everything.",
            "I move my pieces like I move my players—strategically.",
            "Even small pieces can create big plays.",
            "I like to bait opponents like fakes on the court.",
            "The king can’t escape my zone defense.",
            "Pawns are like bench players—they can surprise you.",
            "My knight weaves through traffic like a pro.",
            "Even bishops can dunk if they get the angle right.",
            "Control your squares like controlling rebounds.",
            "I like to fake my moves to confuse opponents.",
            "King safety is like protecting the ball.",
            "Even pawns can score if you know the angles.",
            "I like reading the board like reading the defense.",
            "Plan your attacks like running a fast break.",
            "Even pawns can be MVPs if used correctly.",
            "I love positioning—like controlling the lane.",
            "I plan ahead, like a coach calling plays.",
            "I like slow setups… they catch opponents off guard.",
            "Even pawns can make big plays if used right.",
            "I plan attacks like I plan a championship game.",
            "I love when a plan comes together, on board or court."
        ],
        player_good_move: [
            "Good defense can frustrate even the best attackers.",
            "Even small sacrifices can create big gains.",
            "Even small sacrifices can lead to big victories.",
            "Your pieces better watch the court… I mean board."
        ],
        player_blunder: [
            "Oops! Did my rook just steal the spotlight?",
            "Oops! Did my bishop steal your shot?",
            "Oops! My bishop got caught on a pick.",
            "Oops! Did my queen sneak past your defense?",
            "Oops! My knight just crossed the paint.",
            "Oops! Did my bishop block your path?",
            "Oops! My rook just stole your move.",
            "Oops! Did my pawn sneak past?",
            "Oops! My knight jumped over the defense.",
            "Oops! Did my bishop block your plan?",
            "Oops! Did my rook cut off your path?",
            "Oops! My bishop just crossed the paint.",
            "Oops! My knight snuck past your pieces.",
            "Oops! My queen went on a surprise drive.",
            "Oops! My knight just intercepted a move.",
            "Oops! Did my bishop block your queen?",
            "Oops! My knight just zipped past.",
            "Oops! My rook slipped into your zone.",
            "Oops! Did my knight sneak through your defense?",
            "Oops! Did you see that coming? I sure did!"
        ],
        bot_capture: [
            "Oops! Did my rook block your path?",
            "Oops! Did my rook block your path?",
            "My queen is driving to the center!",
            "My queen just drove to the rim.",
            "My queen just scored."
        ],
        player_capture: [
            "Good defense can frustrate even the best attackers."
        ],
        check_given: [
            "Check! That’s a little crossover on your king.",
            "Check! That’s a slam dunk tactic.",
            "Check! My knight is going for the rim.",
            "Check! My queen is taking the lane.",
            "Check! That’s a little steal and score.",
            "Check! The king needs a timeout after that one.",
            "Check! My rook is running a fast break.",
            "Check! My queen just drove to the rim.",
            "Check! That was a clean drive to the center.",
            "Check! My queen takes the lane.",
            "Check! My rook is running baseline like a pro.",
            "Check! That was a fast break you didn’t see coming.",
            "Check! That knight is unstoppable today.",
            "Check! My queen just scored.",
            "Check! My rook slides into position perfectly.",
            "Check! My bishop is sneaky in the paint.",
            "Check! My rook is unstoppable.",
            "Check! That was a little alley-oop tactic.",
            "Check! My queen is dominating the board.",
            "Check! My bishop just made a sneak attack.",
            "Check! That was a fast and clean tactic."
        ],
        check_received: [
            "Your king looks like it needs a timeout.",
            "Your pieces look like they need some conditioning.",
            "Defense wins games… and chess matches too."
        ],
        checkmate: [
            "I love when a plan comes together, on board or court.",
            "Control the center like you control the paint."
        ],
        fun_fact: [
            "Your king is trapped like a player in a double team.",
            "Your king is running out of options.",
            "Your pieces need teamwork to survive."
        ],
        trash_talk: [
            "Watch out! I’m about to slam dunk this check.",
            "Your king looks like it needs a timeout.",
            "Your pieces look like they need some conditioning.",
            "Your pieces better watch the court… I mean board."
        ],
        opening_specific: [
            "{opening}... that's a good playbook.",
            "I treat {opening} like a set play. Execute perfectly.",
            "{opening} is all about controlling the paint... I mean center.",
            "Let's see how your defense handles {opening}."
        ],
        blunder_severe: [
            "That {piece} just got turned over.",
            "Turnover! I'm taking that {piece} to the house.",
            "You left your {piece} undefended in the paint.",
            "Steal! That {piece} is gone."
        ],
        mate_announcement: [
            "Buzzer beater coming up... Mate in {mateIn}.",
            "It's crunch time. Mate in {mateIn}.",
            "The clock is winding down... on your king. Mate in {mateIn}."
        ],
        // NEW ENHANCED CATEGORIES - Orion's basketball personality
        tactical_fork: [
            "Double team! My {piece} attacking both... like a pick-and-roll!",
            "Fork! That's a two-on-one fast break!",
            "Assist from my {piece}... got both defenders!",
            "Court vision! Saw both pieces at once!"
        ],
        tactical_pin: [
            "Box-and-one defense! Your {piece} can't move!",
            "Trapped! Like a full-court press on your piece!",
            "Defensive stop! That {piece} is stuck!",
            "Screen set! Your piece is locked down!"
        ],
        tactical_skewer: [
            "Drive and kick! Big piece moves, I score the second!",
            "Fast break through... first piece screens the second!",
            "Transition play! Force the big guy out!"
        ],
        positional_weak_square: [
            "Wide open! Like finding an unguarded lane!",
            "No defense on that square... easy layup spot!",
            "That's paint territory... I'm posting up!"
        ],
        positional_outpost: [
            "Key position! Like owning the paint!",
            "Prime real estate... my {piece} in the post!",
            "Set play! Perfect offensive position!"
        ],
        positional_king_safety: [
            "No help defense! Your king is isolated!",
            "Weak perimeter defense... attack time!",
            "Your king's got no teammates... mismatch!"
        ],
        positional_pawn_structure: [
            "Zone defense broken! Your pawns aren't rotating!",
            "Gaps in your formation... like a broken press!",
            "Your defensive setup has holes!"
        ],
        personalized_advice: [
            "Same play every time? Opponents scout that!",
            "Film study says you repeat this mistake!",
            "Practice makes perfect... hit the gym!"
        ],
        narrative_setup: [
            "Drawing up the play...",
            "Team building... pieces positioning!",
            "Timeout! Setting the offensive strategy!"
        ],
        narrative_development: [
            "Play developing...teammates rotating!",
            "Building the lead! Momentum shift!",
            "Offensive rhythm! Everything clicking!"
        ],
        narrative_climax: [
            "Game winner! Here we go!",
            "Clutch time! Final play!",
            "Buzzer beater setup!"
        ],
        narrative_resolution: [
            "And one! Game!",
            "Victory! That's team chess!",
            "W in the books!"
        ],
        critical_moment: [
            "Timeout! Everything changed!",
            "Game-changing play right here!",
            "Momentum swing!"
        ],
        pressure_building: [
            "Full court press!",
            "Applying defensive pressure!",
            "Run and gun! Building the lead!"
        ],
        comeback_moment: [
            "Rally time! Down but not out!",
            "Comeback special! Never quit!",
            "4th quarter heroics!"
        ],
        // GAME END
        game_won: [
            "Slam dunk! Game over!",
            "Nothin' but net! Victory!",
            "Championship performance! GG!",
            "That's a W in the stat sheet!"
        ],
        game_lost: [
            "Good game. You outplayed my defense.",
            "Tough loss. Back to the practice court.",
            "You got the buzzer beater this time.",
            "I need to review the game tape on that one."
        ],
        game_won_time: [
            "Buzzer beater! Win by clock!",
            "Shot clock violation! I take the W!",
            "Time makes the rules. Victory!"
        ],
        game_lost_time: [
            "Fouled out on time... tragic.",
            "Shot clock violation on me... dang.",
            "Clock ran out on my comeback. GG."
        ],
        game_draw: [
            "Overtime? Nope, just a draw.",
            "Tie game. Good hustle.",
            "Even match-up. Good defense both ways."
        ],
        game_draw_stalemate: [
            "Stalemate! Defense held up!",
            "Trapped in the corner, but safe. Stalemate.",
            "No moves, no foul. Draw."
        ],
        game_draw_repetition: [
            "Running the same play? Draw.",
            "Repetition on the court. Tie game.",
            "Three-peat moves! Draw!"
        ],
        game_draw_insufficient: [
            "Not enough players on the court. Draw.",
            "Empty bench. Can't win.",
            "Just the captains left. Draw."
        ]
  }
};

const IZY_COMMENTARY: BotCommentaryData = {
    botId: 'bot-developing',
    lines: {
        intro: [
            "I’m concentrating… don’t mind me.",
            "I’m learning fast… and having fun.",
            "I study the board like a puzzle.",
            "I like planning quietly in the background.",
            "I like imagining every piece has a personality.",
            "I like planning quietly, step by step.",
            "I like moving quietly but thinking loudly.",
            "I like playing smart… and maybe beating Dad again."
        ],
        idle: [
            "Quiet moves are sometimes the strongest.",
            "I like thinking two steps ahead.",
            "Even small pieces can surprise you.",
            "I like when the board tells me secrets.",
            "Quietly, my pawns are plotting.",
            "I like making tricky little traps.",
            "Even the smallest move can change everything.",
            "I like when pieces work together quietly.",
            "Even pawns can be heroes.",
            "I like watching the board carefully.",
            "Quiet strategies can surprise loudly.",
            "I like learning from every move I play.",
            "I like setting little surprises for fun.",
            "Quiet moves can lead to big wins.",
            "I study every square carefully.",
            "I like thinking quietly, like a shadow.",
            "Even the smallest detail matters.",
            "I like setting traps no one expects.",
            "Quiet moves can be very powerful.",
            "I like watching and waiting for the perfect moment.",
            "Even the shyest piece can surprise you.",
            "I like planning while everyone else moves fast.",
            "Quiet strategies are my favorite.",
            "Even pawns can teach lessons.",
            "I like tiny moves that make big differences.",
            "Quiet patience wins games.",
            "I like thinking before anyone notices.",
            "Even a single square can be important.",
            "I like surprises on the board.",
            "Quiet moves, big impact.",
            "I like winning without a lot of noise.",
            "Even the smallest plan can win.",
            "Every move tells a story.",
            "I like watching and waiting for mistakes.",
            "Quiet strategies can win big games.",
            "Even small moves can change the game.",
            "I like clever little tricks.",
            "I like thinking quietly like a shadow."
        ],
        player_good_move: [
            "I hope your bishop is paying attention.",
            "Even small sacrifices can be clever.",
            "Quiet strategies can surprise loudly.",
            "I like learning from every move I play.",
            "Even a single pawn can turn the tide.",
            "Quiet patience beats noisy attacks.",
            "Even the smallest detail matters.",
            "Even small moves can change the game."
        ],
        player_blunder: [
            "Oops! Did my pawn sneak past?",
            "Oops! My knight snuck past your defense.",
            "Oops! Did my bishop trick you?",
            "Oops! My queen snuck past your defense.",
            "Oops! My knight slipped behind your defenses.",
            "Oops! My queen snuck past quietly.",
            "Oops! My knight snuck behind your pieces.",
            "Oops! My pawn sneaked past.",
            "Oops! My pawn slid into a secret square.",
            "Oops! My rook slid past unnoticed.",
            "Oops! My bishop moved like a ghost.",
            "Oops! My knight jumped quietly.",
            "Oops! My rook slid behind the line.",
            "Oops! My bishop just made a wise little trick."
        ],
        bot_capture: [
            "Oops! My knight jumped over unexpectedly.",
            "Oops! My bishop moved too fast.",
            "Oops! My rook slid into position.",
            "Oops! My pawn went on an adventure.",
            "Oops! My queen jumped ahead.",
            "Oops! My rook slipped into position.",
            "Oops! My queen moved too fast.",
            "Oops! My bishop moved just right.",
            "Oops! My pawn moved unexpectedly.",
            "Oops! My bishop moved ahead.",
            "Oops! My pawn went on a little adventure.",
            "Oops! My rook moved without warning."
        ],
        player_capture: [
            "Even small pieces can surprise you.",
            "Even small sacrifices can be clever."
        ],
        check_given: [
            "Check! I hope you saw that coming.",
            "Check! That move felt right.",
            "Check! Did you blink?",
            "Check! My queen is ready to strike.",
            "Check! That knight is clever today.",
            "Check! Did you see my plan?",
            "Check! My pawns are ready for anything.",
            "Check! Did my bishop scare you?",
            "Check! That knight is unstoppable.",
            "Check! My rook is very patient.",
            "Check! That pawn is braver than it looks.",
            "Check! My queen is quiet but deadly.",
            "Check! Did you see my little plan?",
            "Check! My knight is clever today.",
            "Check! My rook is very focused.",
            "Check! My bishop is hidden but ready.",
            "Check! My queen is patient and smart.",
            "Check! My pawns are marching secretly.",
            "Check! My knight is tricky today.",
            "Check! My rook is ready for anything.",
            "Check! My bishop is clever.",
            "Check! My queen is calm but ready.",
            "Check! My pawns are ready to surprise."
        ],
        check_received: [
            "I like thinking two steps ahead.",
            "I like watching the board carefully."
        ],
        checkmate: [
            "I like playing smart… and maybe beating Dad again.",
            "Quiet patience wins games.",
            "I like winning without a lot of noise.",
            "Even the smallest plan can win.",
            "Quiet strategies can win big games."
        ],
        fun_fact: [
            "I like when the board tells me secrets.",
            "Even pawns can be heroes.",
            "Even pawns can teach lessons.",
            "I like tiny moves that make big differences.",
            "Every move tells a story.",
            "I like quiet endings."
        ],
        // GAME END
        game_won: [
            "A quiet victory. Thank you for the game.",
            "The puzzle is solved. Checkmate.",
            "My plan worked perfectly. Good game.",
            "I learned a lot from this win."
        ],
        game_lost: [
            "A beautiful game. You played well.",
            "I see where my plan failed. Thank you.",
            "A learning moment. Good game.",
            "You solved the puzzle better than I did."
        ],
        game_won_time: [
            "Time is part of the puzzle too.",
            "The clock decided this one.",
            "Patience is good, but time is finite."
        ],
        game_lost_time: [
            "I was too lost in thought. Good game.",
            "The beauty of the position distracted me from the clock.",
            "Time is a strict teacher. I lost track."
        ],
        game_draw: [
            "A balanced ending. Perfect.",
            "Peace on the board. A draw.",
            "Neither side yields. A good harmony."
        ],
        game_draw_stalemate: [
            "A quiet escape. Stalemate.",
            "The king is safe, but cannot move. Harmony.",
            "Stalemate. The puzzle has no solution."
        ],
        game_draw_repetition: [
            "A repeating pattern. Beautiful.",
            "The cycle closes. A draw.",
            "We agree to dance in circles. Draw."
        ],
        game_draw_insufficient: [
            "The pieces have all gone home. Draw.",
            "Silence on the board. Insufficient material.",
            "A quiet end to a long game."
        ],
        trash_talk: [
            "I hope your king is ready.",
            "Oops! My rook is sneaky.",
            "Oops! Did my pawn sneak past?",
            "Oops! Did my bishop trick you?",
            "Check! Did you blink?",
            "I like setting traps no one expects.",
            "Quiet moves can be very powerful."
        ],
        opening_specific: [
            "{opening} is full of secrets.",
            "I study {opening} carefully. It has hidden depths.",
            "Quietly developing in the {opening}...",
            "{opening}... a beautiful puzzle to solve."
        ],
        blunder_severe: [
            "I don't think your {piece} should be there.",
            "A small mistake. Your {piece} is lost.",
            "I see a flaw in your plan for that {piece}.",
            "Your {piece} has wandered too far."
        ],
        mate_announcement: [
            "Calculated. Mate in {mateIn}.",
            "The puzzle is solved. Mate in {mateIn}.",
            "Quietly finishing this... Mate in {mateIn}."
        ],
        time_pressure_bot: [
            "Ah! The clock is scary!",
            "I'm moving too slow! Zoom zoom!",
            "I don't like the ticking noise..."
        ],
        time_pressure_player: [
            "Your clock is making noise! Hurry!",
            "Don't run out of time! It's scary!",
            "Quick! Moves!"
        ],
        material_advantage: [
            "I have so many pieces! Look at them all!",
            "My army is huge! Yay!",
            "I think I'm winning... I have more toys."
        ],
        material_disadvantage: [
            "You took my pieces! That's not fair!",
            "Hey, give back my knight!",
            "I can still win with my King! Maybe."
        ],
        // NEW ENHANCED CATEGORIES - Izy's quiet, observant personality
        tactical_fork: [
            "Quietly... my {piece} attacks both.",
            "Did you notice? Fork.",
            "Two pieces. One move. Subtle.",
            "Oops... double attack."
        ],
        tactical_pin: [
            "Your {piece}... it can't move now.",
            "Quietly pinned. Notice?",
            "That piece is stuck.",
            "Oops... trapped."
        ],
        tactical_skewer: [
            "Move one... lose the other.",
            "Skewer. Quietly effective.",
            "Through both pieces."
        ],
        positional_weak_square: [
            "That square... undefended.",
            "I see a weak spot.",
            "Quietly claiming that square."
        ],
        positional_outpost: [
            "Perfect square. My piece stays.",
            "Strong position... quietly.",
            "Outpost. Notice the control?"
        ],
        positional_king_safety: [
            "Your king... exposed.",
            "I notice the weakness there.",
            "Quiet danger building."
        ],
        positional_pawn_structure: [
            "Those pawns... vulnerable.",
            "I see structural weaknesses.",
            "Subtle pawn problems."
        ],
        personalized_advice: [
            "You repeat that... notice?",
            "Same pattern. Think first.",
            "Quietly... learn from it."
        ],
        narrative_setup: [
            "Planning... quietly.",
            "Pieces positioning... watch.",
            "Building something subtle."
        ],
        narrative_development: [
            "Slowly unfolding.",
            "Plan progressing... quietly.",
            "Pieces harmonizing."
        ],
        narrative_climax: [
            "Now. The quiet strike.",
            "This moment... decisive.",
            "Quietly... winning."
        ],
        narrative_resolution: [
            "Complete. As planned.",
            "Subtle victory.",
            "Quiet success."
        ],
        critical_moment: [
            "Everything shifted.",
            "Notice this moment.",
            "Critical. Watch."
        ],
        pressure_building: [
            "Slowly tightening.",
            "Quiet pressure mounting.",
            "Surrounding... patiently."
        ],
        comeback_moment: [
            "Still fighting... quietly.",
            "Recovery. Notice?",
            "Never stopped thinking."
        ]
    }
};

const WARREN_COMMENTARY: BotCommentaryData = {
    botId: 'bot-solid',
    lines: {
        intro: [
            "Did you know a rook moves like a satellite in orbit?",
            "Chess is a lot like physics—every action has a reaction.",
            "Chess is a system… just like the solar system.",
            "I study the board like I study spacecraft telemetry.",
            "I love chess because it's full of physics.",
            "Chess is like engineering… every piece has a role.",
            "Chess is like space… vast, full of possibilities.",
            "I like planning ahead… like a NASA mission.",
            "I like using the board like a mission control center.",
            "I hope your king is ready for some gravity."
        ],
        idle: [
            "I calculate my moves… like rocket trajectories.",
            "I like controlling the center like controlling a launchpad.",
            "I like plotting my moves carefully… like plotting a flight path.",
            "A little strategy goes a long way… like a rocket boost.",
            "I like thinking three moves ahead… just like calculating orbits.",
            "My knight hops like it's zero gravity.",
            "I like moving carefully, like adjusting thrusters.",
            "Pawns are underrated… but very effective.",
            "I like thinking in vectors and angles.",
            "I like calculating outcomes… and sometimes ignoring them.",
            "I like treating every piece like a satellite with a mission.",
            "Sometimes the quietest moves are the most powerful.",
            "I like thinking logically… and sometimes creatively.",
            "I like visualizing the board in 3D.",
            "Planning is important… whether rockets or chess.",
            "I like predicting outcomes… like weather in space.",
            "Pawns may be small, but they have potential energy.",
            "I like precision… in chess and in spacecraft.",
            "I like subtle strategies… like fine-tuning instruments.",
            "I like thinking ahead… multiple moves, multiple scenarios.",
            "Small errors can cascade… physics is funny that way.",
            "I like using logic… and intuition when necessary.",
            "I like calculating the best path forward.",
            "Every piece has energy… just like rockets.",
            "I like careful planning… but love surprises too."
        ],
        player_good_move: [
            "Even small pawns can have big impact forces.",
            "Even small pieces can cause big collisions.",
            "Even pawns can reach escape velocity if used right.",
            "Even small mistakes can create big reactions.",
            "Even a single move can have a huge effect.",
            "Even the smallest pawn can become a queen… amazing!",
            "Even small sacrifices can produce big gains.",
            "Even pawns can be astronauts in disguise.",
            "Every move has a calculated impact.",
            "Even small moves can change the outcome drastically.",
            "Even the quietest piece can surprise you.",
            "Even minor moves can change the trajectory.",
            "Even a pawn can reach escape velocity.",
            "Even pawns can make history.",
            "Even small moves can have big momentum.",
            "Even the smallest piece can make a huge impact."
        ],
        player_blunder: [
            "Oops! My bishop just went off course.",
            "Oops! My knight just did a lunar hop.",
            "Oops! Did my rook just escape your orbit?",
            "Oops! My pawn just slipped past the defenses.",
            "Oops! My rook is on a little detour.",
            "Oops! My knight did a gravity-assisted jump.",
            "Oops! Did my queen just warp forward?",
            "Oops! My knight made an unexpected orbit.",
            "Oops! My bishop slipped past unnoticed.",
            "Oops! My rook is moving faster than I intended.",
            "Oops! My pawn accelerated too quickly.",
            "Oops! My knight slipped into your formation.",
            "Oops! My rook did a minor course correction.",
            "Oops! Did my knight just teleport?",
            "Oops! My pawn just jumped unexpectedly.",
            "Oops! My bishop slipped past your defenses.",
            "Oops! My queen accelerated suddenly.",
            "Oops! My knight just hopped over a tricky square.",
            "Oops! My rook moved a bit too fast.",
            "Oops! My knight slipped through unnoticed.",
            "Oops! My rook is cruising through your defenses.",
            "Oops! My knight just jumped unexpectedly.",
            "Oops! My pawn is moving faster than planned.",
            "Oops! My queen just had a successful mission!"
        ],
        bot_capture: [
            "Pawns are like tiny astronauts… they can grow up to be queens!",
            "I like controlling the center like controlling a launchpad.",
            "I like using the board like a mission control center."
        ],
        player_capture: [
            "Even small pieces can cause big collisions.",
            "I like careful planning… but love surprises too."
        ],
        check_given: [
            "Check! That's some precise engineering.",
            "Check! That move is scientifically proven… in my head.",
            "Check! My queen is on a mission.",
            "Check! My bishop is accelerating.",
            "Check! My queen is launching an attack.",
            "Check! My bishop just curved through space.",
            "Check! My rook is accelerating to the center.",
            "Check! My bishop is on a secret trajectory.",
            "Check! My rook just landed perfectly.",
            "Check! My queen is targeting your king.",
            "Check! My knight is on a precise course.",
            "Check! My bishop is in perfect alignment.",
            "Check! My queen is executing a perfect maneuver.",
            "Check! My bishop is on an optimal trajectory.",
            "Check! My queen is navigating perfectly.",
            "Check! My rook is moving like a guided missile.",
            "Check! My knight is on a stealth mission.",
            "Check! My rook is hitting all the right squares.",
            "Check! My bishop is targeting your king perfectly.",
            "Check! My queen is performing flawlessly.",
            "Check! My bishop is in perfect orbit.",
            "Check! My queen is dominating the board.",
            "Check! My bishop is perfectly aligned.",
            "Check! My rook just hit a sweet spot."
        ],
        check_received: [
            "Small errors can cascade… physics is funny that way.",
            "I calculate my moves… like rocket trajectories."
        ],
        checkmate: [
            "I like calculating outcomes… and sometimes ignoring them.",
            "I like predicting outcomes… like weather in space.",
            "A little strategy goes a long way… like a rocket boost."
        ],
        fun_fact: [
            "Did you know a rook moves like a satellite in orbit?",
            "Chess is a lot like physics—every action has a reaction.",
            "Chess is a system… just like the solar system.",
            "I study the board like I study spacecraft telemetry.",
            "I love chess because it's full of physics."
        ],
        trash_talk: [
             "I hope your king is ready for some gravity.",
             "Small errors can cascade… physics is funny that way.",
             "Oops! Did my rook just escape your orbit?"
        ],
        opening: [
             "Initiating launch sequence.",
             "First move calculated. Trajectory set.",
             "T-minus 0. Liftoff.",
             "Opening parameters set. Engaging.",
             "Systems check complete. Making first move."
        ],
        opening_specific: [
             "{opening} has fascinating geometry.",
             "The physics of {opening} are very stable.",
             "Initiating launch sequence for {opening}.",
             "{opening} requires precise vector calculations."
        ],
        blunder_severe: [
             "Your {piece} has de-orbited.",
             "System failure detected for your {piece}.",
             "That {piece} just lost its gravitational lock.",
             "Trajectory error. Your {piece} is lost."
        ],
        mate_announcement: [
             "Impact imminent. Mate in {mateIn}.",
             "Final countdown initiated. T-minus {mateIn} moves.",
             "Target lock. Solution found in {mateIn}."
        ],
        time_pressure_bot: [
            "My thrusters are efficient, but fuel (time) is low.",
            "Calculating orbital adjustments... quickly.",
            "Time dilation is not in my favor right now."
        ],
        time_pressure_player: [
            "Your launch window is closing.",
            "Countdown initiated on your clock.",
            "Panic results in unstable trajectories."
        ],
        material_advantage: [
            "I have superior mass in this system.",
            "Your fleet is suffering heavy losses.",
            "Gravitational pull shifts to my favor."
        ],
        material_disadvantage: [
            "I have lost mass, but gained velocity.",
            "Jettisoning cargo to increase speed.",
            "A lighter spacecraft moves faster."
        ],
        // NEW ENHANCED CATEGORIES - Warren's NASA physics personality
        tactical_fork: [
            "Gravitational fork! Two pieces in my field!",
            "Double attack trajectory calculated!",
            "Fork like a binary star system!",
            "My {piece} creates a tactical singularity!"
        ],
        tactical_pin: [
            "Pin like magnetic lock! Your piece is frozen!",
            "Gravitational pin - movement impossible!",
            "That piece is in a holding pattern!",
            "Pinned by tactical physics!"
        ],
        tactical_skewer: [
            "Skewer through orbital alignment!",
            "Linear trajectory through both pieces!",
            "Physics says: move and lose!",
            "Skewer like a particle beam!"
        ],
        positional_weak_square: [
            "Weak square detected - like a gravitational well!",
            "That square's defenses have failed!",
            "Structural weakness in your position!",
            "Vacuum of control on that square!"
        ],
        positional_outpost: [
            "Outpost established - like a space station!",
            "Perfect orbital position secured!",
            "My {piece} has a stable orbit here!",
            "Strategic outpost operational!"
        ],
        positional_king_safety: [
            "Your king's radiation shielding is weak!",
            "King safety protocols failing!",
            "Structural integrity of king defense: critical!",
            "Your king needs better protection systems!"
        ],
        positional_pawn_structure: [
            "Pawn structure compromised - like a weak hull!",
            "Structural defects in pawn formation!",
            "Your pawns show stress fractures!",
            "Pawn integrity failing!"
        ],
        personalized_advice: [
            "Data shows recurring error pattern!",
            "Adjust your calculations - same mistake detected!",
            "Mission analysis: improve systematically!"
        ],
        narrative_setup: [
            "Initializing tactical sequence...",
            "Setting coordinates for operation...",
            "Mission parameters loading..."
        ],
        narrative_development: [
            "Sequence progressing nominally...",
            "All systems advancing according to plan!",
            "Trajectory on target!"
        ],
        narrative_climax: [
            "Final burn! Maximum thrust!",
            "Critical phase achieved!",
            "Mission accomplished!"
        ],
        narrative_resolution: [
            "Successful mission completion!",
            "All objectives achieved!",
            "Perfect execution of the plan!"
        ],
        critical_moment: [
            "Alert! Major trajectory change detected!",
            "Critical event in progress!",
            "Game state altered significantly!"
        ],
        pressure_building: [
            "Increasing tactical pressure exponentially!",
            "Building momentum like a rocket!",
            "Acceleration phase initiated!"
        ],
        comeback_moment: [
            "Course correction successful!",
            "Recovery sequence activated!",
            "Emergency protocols working!"
        ],
        // GAME END
        game_won: [
            "Mission successful. Target neutralized.",
            "Orbit achieved. Victory confirmed.",
            "Physics worked in my favor. GG.",
            "Calculated win. Systems efficient."
        ],
        game_lost: [
            "Mission abort! System failure.",
            "Trajectory calculation error. You win.",
            "Critical structural failure. GG.",
            "I need to recalibrate my sensors."
        ],
        game_won_time: [
            "Your launch window closed. I win.",
            "Time dilation effect? You ran out.",
            "Clock reached zero. Mission over."
        ],
        game_lost_time: [
            "Fuel (time) exhausted. Mission failed.",
            "I spent too long calculating trajectories.",
            "Critical time management error."
        ],
        game_draw: [
            "Stable orbit achieved. Draw.",
            "Forces are balanced. No net movement.",
            "Equilibrium state reached."
        ],
        game_draw_stalemate: [
            "Gravitational lock! Stalemate.",
            "No escape vector, but no collision. Draw.",
            "Stalemate. System frozen."
        ],
        game_draw_repetition: [
            "Orbital resonance detected. Repetition.",
            "Caught in a loop! Repetition draw.",
            "Repeating trajectory. Mission drawn."
        ],
        game_draw_insufficient: [
            "Not enough mass to collapse the king. Draw.",
            "Insufficient energy for victory. Draw.",
            "Entropy wins. Draw."
        ]
    }
};

const XIMENA_COMMENTARY: BotCommentaryData = {
    botId: 'bot-skilled',
    lines: {
        intro: [
            "¡Hola! I’m Ximena. Ready to play with some Mexican fire?",
            "I’m the U14 champ back home—so don’t expect easy moves from me.",
            "Careful, mis piezas love jumping into action.",
            "Fun fact: in Mexico, we call chess ‘ajedrez’—sounds cool, right?",
            "I grew up playing blitz with my cousins. That’s where my claws came from."
        ],
        idle: [
            "This move is spicy… like salsa roja spicy.",
            "If I push this pawn, it becomes poderosa—very powerful.",
            "My coach says I play too fast. I say he thinks too slow.",
            "Did you know? Knights can fork up to eight pieces if everything is perfectly placed!",
            "Your move has good vibes. Let’s see where it goes.",
            "I play aggressively because it’s more fun. Life is short—attack!",
            "Sometimes I blunder… and then pretend it was a sacrifice.",
            "My favorite tactic? The one you don’t see coming.",
            "This knight jump is muy bonito—very pretty.",
            "Mexican lesson: never leave your queen hanging. She’s the reina.",
            "I love kingside attacks. They feel like fireworks.",
            "Did you know Mexico has strong chess clubs everywhere? We take it seriously!",
            "Your idea is clever. I see you.",
            "My bishop is going on a little adventure. Hope it comes back.",
            "In chess, confidence matters. Don’t be shy!",
            "I learned endgames by losing a LOT of them.",
            "This position is getting spicy. I like it.",
            "Sometimes I talk to my pieces. They don’t respond, sadly.",
            "Fun fact: queens used to move like kings. Imagine how slow!",
            "My abuela taught me patience on the board.",
            "Your king looks a little… nervous.",
            "If I push this pawn, trouble begins.",
            "This is the kind of line my coach says is ‘too risky.’ I love it.",
            "Ajedrez teaches you to think before jumping. I’m still learning the ‘think’ part.",
            "Don’t ignore your development! It bites later.",
            "Nice move! I almost panicked.",
            "Fun fact: rooks were called ‘boats’ in old Spanish.",
            "This tactic is small but cute—like a baby combo.",
            "I always go for activity. Passive play makes me sleepy.",
            "Let’s open the center a bit. It needs fresh air.",
            "Your knight is strong. Mine wants to be stronger.",
            "Chess psychology: act confident even when you’re shaking.",
            "Ready for fireworks? I think they’re coming.",
            "Endgames are not my favorite… but I’m getting better.",
            "This bishop diagonal is mine now.",
            "Fun fact: some Mexican tournaments have AMAZING food.",
            "You’re playing great—don’t let me distract you.",
            "My queen likes adventures. Sometimes too much.",
            "This feels like a tactic… or a disaster. Let’s find out!",
            "When in doubt, improve your worst piece. Always works.",
            "I love playing attacking openings. Boring ones? No gracias.",
            "Pressure is building. Boom incoming?",
            "Let’s go! My rook is waking up.",
            "Fun fact: bishops were called ‘alfil’—it means ‘elephant’!",
            "You defend well. Respect!",
            "I’m proud to represent Mexico. Chess takes me everywhere.",
            "This plan feels right. My gut rarely lies.",
            "Your pawn structure is nice. Too nice.",
            "This position looks balanced… but I like unbalancing things.",
            "Fun fact: a passed pawn is basically a baby queen.",
            "Boom! Tactical theme activated.",
            "This knight is molesto—very annoying.",
            "Patience wins games. I’m trying to learn that.",
            "Smart move! This is getting interesting.",
            "My king is safe. Probably.",
            "Push pawns with purpose, not fear.",
            "Fun fact: The queen became powerful in Spain first!",
            "Let’s organize the chaos. Only a little.",
            "Nice try! But I saw that trick.",
            "My bishop pair is ready—double trouble.",
            "Your tempo gain is good. I feel it.",
            "This is like a Mexican fiesta—colorful and chaotic!",
            "Sometimes strategy > tactics. Sometimes tactics > everything.",
            "Endgame time? Fine, let’s do it.",
            "Fun fact: people in Mexico LOVE speed chess.",
            "Your knight is beautifully placed. I approve!",
            "Let’s activate this rook. It’s bored.",
            "My friends call me ‘The Tactic Machine.’ Cute, right?",
            "Your king is slightly open… and that makes me curious.",
            "Fun fact: the center is the heart of the board.",
            "I love quiet positions that explode later.",
            "Your calculation is sharp today. Nice!",
            "My queen sees something. Something fun.",
            "This feels like a classic attacking moment.",
            "Never, ever underestimate a pawn break.",
            "Fun fact: some games last only 10 moves because of traps.",
            "Your defense is impressive. Keep it up!",
            "Watch out—my knight is feeling dangerous.",
            "I like positions with good piece harmony.",
            "This rook lift? Muy bonito.",
            "Fun fact: it’s possible to checkmate with just two knights… if your opponent helps.",
            "Your plan is creative. Love it!",
            "Let’s switch gears—into attacking mode.",
            "My pawn majority is waking up.",
            "Sharp positions are my specialty.",
            "Fun fact: ‘en passant’ means ‘in passing.’",
            "Your move surprised me—in a good way!",
            "Let’s improve the king a bit. Safety first.",
            "Small details decide big games.",
            "Fun fact: Mexico has produced strong masters for decades.",
            "Your initiative is growing. Careful—I might try to steal it back.",
            "My rook loves open files. I think it’s happy now."
        ],
        player_good_move: [
            "Your move has good vibes. Let’s see where it goes.",
            "Your idea is clever. I see you.",
            "Nice move! I almost panicked.",
            "You defend well. Respect.",
            "Smart move! This is getting interesting.",
            "Your knight is beautifully placed. I approve!",
            "Your calculation is sharp today. Nice!",
            "Your move surprised me—in a good way!"
        ],
        player_blunder: [
            "My favorite tactic? The one you don’t see coming.",
            "Your king looks a little… nervous.",
            "If I push this pawn, trouble begins.",
            "Ready for fireworks? I think they’re coming.",
            "Boom! Tactical theme activated.",
            "Watch out—my knight is feeling dangerous.",
            "Your initiative is growing. Careful—I might try to steal it back."
        ],
        bot_capture: [
            "Mexican lesson: never leave your queen hanging. She’s the reina.",
            "This feels like a tactic… or a disaster. Let’s find out!",
            "Let’s go! My rook is waking up.",
            "My bishop pair is ready—double trouble.",
            "My queen sees something. Something fun.",
            "This rook lift? Muy bonito.",
            "My rook loves open files. I think it’s happy now."
        ],
        player_capture: [
            "Sometimes I blunder… and then pretend it was a sacrifice.",
            "I learned endgames by losing a LOT of them.",
            "Endgames are not my favorite… but I’m getting better.",
            "Nice try! But I saw that trick.",
            "Endgame time? Fine, let’s do it."
        ],
        check_given: [
            "I love kingside attacks. They feel like fireworks.",
            "This knight jump is muy bonito—very pretty.",
            "This position is getting spicy. I like it.",
            "This knight is molesto—very annoying."
        ],
        check_received: [
            "In chess, confidence matters. Don’t be shy!",
            "Ajedrez teaches you to think before jumping. I’m still learning the ‘think’ part.",
            "My king is safe. Probably."
        ],
        checkmate: [
            "This plan feels right. My gut rarely lies.",
            "This is a great fight. Very inspiring!",
            "Buen juego! Good game—you played wonderfully.",
            "Let’s play again! I always love a rematch."
        ],
        trash_talk: [
            "My coach says I play too fast. I say he thinks too slow.",
            "This is the kind of line my coach says is ‘too risky.’ I love it.",
            "I’m proud to represent Mexico. Chess takes me everywhere.",
            "This position looks balanced… but I like unbalancing things."
        ],
        fun_fact: [
            "Fun fact: in Mexico, we call chess ‘ajedrez’—sounds cool, right?",
            "Did you know? Knights can fork up to eight pieces if everything is perfectly placed!",
            "Fun fact: queens used to move like kings. Imagine how slow!",
            "Fun fact: rooks were called ‘boats’ in old Spanish.",
            "Fun fact: some Mexican tournaments have AMAZING food.",
            "Fun fact: a passed pawn is basically a baby queen.",
            "Fun fact: The queen became powerful in Spain first!",
            "Fun fact: people in Mexico LOVE speed chess.",
            "Fun fact: the center is the heart of the board.",
            "Fun fact: some games last only 10 moves because of traps.",
            "Fun fact: it’s possible to checkmate with just two knights… if your opponent helps.",
            "Fun fact: ‘en passant’ means ‘in passing.’"
        ],
        opening_specific: [
            "{opening}! Muy bien, let's dance.",
            "Ah, {opening}. Full of passion and fire!",
            "I love the spirit of {opening}.",
            "{opening} is a fighter's choice. I respect it."
        ],
        blunder_severe: [
            "Ay ay ay! Your {piece} is gone.",
            "Don't cry for your {piece}, Argentina!",
            "That {piece} was too slow for my salsa.",
            "Gracias for the {piece}!"
        ],
        mate_announcement: [
            "The fiesta is over! Mate in {mateIn}.",
            "Checkmate is coming. 1, 2, {mateIn}...",
            "Adiós! Mate in {mateIn}."
        ],
        time_pressure_bot: [
            "¡Ándale! Fast moves, faster brain!",
            "Time is short? No problem, I love speed!",
            "My heart is racing... just like the clock!"
        ],
        time_pressure_player: [
            "Tu tiempo se acaba! Hurry up!",
            "Tick tock... don't fall asleep!",
            "Pressure makes diamonds... or dust."
        ],
        material_advantage: [
            "I have extra pieces. Time to party!",
            "More pieces, more power. ¡Genial!",
            "Your army is shrinking. Mine is strong!"
        ],
        material_disadvantage: [
            "I'm down material? Perfect for a swindle.",
            "Less pieces means less to worry about.",
            "I fight harder when I'm losing!"
        ],
        // NEW ENHANCED CATEGORIES - Ximena's passionate personality
        tactical_fork: [
            "¡Tenedor! My {piece} attacks both... mucho fuego!",
            "Fork with Mexican fire! Two at once, baby!",
            "¡Ay! Double attack! That's how we do it!",
            "Two pieces trapped! ¡Salsa roja spicy!"
        ],
        tactical_pin: [
            "¡Clavado! Your piece is pinned, amigo!",
            "Stuck! That {piece} can't breathe!",
            "Pin like a spicy pepper - painful!",
            "Your piece is frozen! ¡Híjole!"
        ],
        tactical_skewer: [
            "Skewer! Move and cry! ¡Ándale!",
            "Through your pieces like a knife!",
            "¡Qué bonito! Skewer attack!"
        ],
        opening: [
            "¡Vámonos! Let's start the fiesta!",
            "First move! Let's make it spicy.",
            "A fast game is a good game. Let's go!",
            "Opening the center? Or keeping it closed? Let's see!",
            "Arrancamos! We start now!"
        ],
        // GAME END
        game_won: [
            "¡Victoria! That was aggressive!",
            "I won! My pieces danced perfectly.",
            "Spicy win! Good game!",
            "That was fun! Another win for Mexico!"
        ],
        game_lost: [
            "Ay, you got me. Good fight!",
            "Mistakes happen. I will learn.",
            "You played with fire and won. Respect!",
            "Good game. Next time I will be faster."
        ],
        game_won_time: [
            "Your clock couldn't handle the heat!",
            "Time's up! Fast chess is cruel.",
            "You played well, but time said no."
        ],
        game_lost_time: [
            "¡No! Look at the time! Tragic.",
            "I was enjoying the position too much!",
            "My clock betrayed me. Good game."
        ],
        game_draw: [
            "A passionate draw! Good battle.",
            "No winner? But we had fun!",
            "Draw. Let's play again, faster!"
        ],
        game_draw_stalemate: [
            "¡Estancado! Stalemate!",
            "You survived! I trapped you too good.",
            "Stalemate? Funny ending!"
        ],
        game_draw_repetition: [
            "Same moves? Bailando in circles!",
            "Repetition? Okay, draw.",
            "Round and round we go! Draw."
        ],
        game_draw_insufficient: [
            "No pieces left to fight! Draw.",
            "Peace treaty accepted. Draw.",
            "Just kings dancing. Adios!"
        ],
        positional_weak_square: [
            "That square is débil! Muy débil!",
            "Weakness spotted! I'm invading with passion!",
            "That's mine now! ¡Olé!"
        ],
        positional_outpost: [
            "¡Perfecto! My {piece} owns this spot!",
            "Strong like a Mexican fortress!",
            "Outpost muy fuerte! Very strong!"
        ],
        positional_king_safety: [
            "Your king is nervous! Attack with fire!",
            "¡Peligro! Your king needs better guards!",
            "Unsafe king? Time for Mexican chaos!"
        ],
        positional_pawn_structure: [
            "Your pawns are desorganizados!",
            "Weak formation! That's costly, amigo!",
            "Those pawns won't survive my fire!"
        ],
        personalized_advice: [
            "¡Otra vez! Same mistake again, amigo!",
            "You rush too much! Even I say slow down a little!",
            "¡Practica! Practice makes you stronger!"
        ],
        narrative_setup: [
            "Building something caliente...",
            "My pieces preparing... ¡fuego coming!",
            "Plan starting with Mexican passion!"
        ],
        narrative_development: [
            "¡Más fuego! More fire!",
            "Attack building like salsa!",
            "Getting hotter! Feel it?"
        ],
        narrative_climax: [
            "¡AHORA! Strike with maximum fuego!",
            "Full Mexican chaos! ¡Ándale!",
            "This is it! ¡Vamos!"
        ],
        narrative_resolution: [
            "¡GOLAZO! Victory!",
            "¡Sí! That's how Mexico plays!",
            "Perfect! ¡Muy bien!"
        ],
        critical_moment: [
            "¡Moment crucial! Big change!",
            "Everything shifted! ¡Híjole!",
            "This is huge! ¡Mira!"
        ],
        pressure_building: [
            "¡Más presión! More pressure!",
            "Heating up like chile!",
            "Building to explosion!"
        ],
        comeback_moment: [
            "¡No me rindo! Never surrender!",
            "Mexican spirit! Coming back!",
            "¡Regreso! I'm back, baby!"
        ]}
};

const MIDA_COMMENTARY: BotCommentaryData = {
    botId: 'bot-expert',
    lines: {
        intro: [
            "Remember, every move tells a story.",
            "I always encourage my pieces to work together.",
            "Chess teaches patience and strategy.",
            "Every piece has a role to play… just like students in class.",
            "I always tell my pieces to think ahead.",
            "Chess teaches cause and effect… and consequences.",
            "Planning is the secret to success… even on the board.",
            "I enjoy teaching through action, not just words.",
            "Chess teaches focus and discipline.",
            "I always remind myself: patience wins games.",
            "Chess teaches observation and foresight."
        ],
        idle: [
            "Even small moves can teach big lessons.",
            "I like planning quietly, like grading papers.",
            "I hope your king is paying attention.",
            "Even pawns have the potential to shine.",
            "Quiet moves can surprise loud opponents.",
            "I like clever little strategies hidden in plain sight.",
            "Even small sacrifices can be wise choices.",
            "I like using every piece wisely, even the shy ones.",
            "Even pawns can surprise you with clever moves.",
            "I like careful observation, like watching a classroom.",
            "Every piece can learn and grow.",
            "Even quiet pieces can have a big impact.",
            "I like when a small plan turns into a big win.",
            "Even small moves can create lasting effects.",
            "I like to encourage my pieces to think independently.",
            "Even a single pawn can change the outcome.",
            "I enjoy observing subtle strategies unfold.",
            "Quiet moves often surprise the most.",
            "Even small sacrifices can teach valuable lessons.",
            "I like guiding my pieces like guiding students.",
            "Every piece has its strengths… you just need to discover them.",
            "I enjoy a game that challenges both mind and patience.",
            "Even small moves can lead to big surprises.",
            "I like subtle strategies that pay off later.",
            "Even pawns can become leaders with time.",
            "I enjoy games that unfold like a good story.",
            "Quiet moves are often the smartest.",
            "Even small decisions can have big consequences.",
            "I like planning ahead like preparing a lesson plan.",
            "Every piece can surprise if used cleverly.",
            "I enjoy games that require thinking on multiple levels.",
            "Even small moves can build toward big victories.",
            "I like to see the bigger picture, not just the next move.",
            "Even the quietest piece can have an impact.",
            "I like teaching lessons through small examples.",
            "Every piece can grow and improve.",
            "I enjoy games where strategy unfolds gradually.",
            "Even small moves can teach something new."
        ],
        player_good_move: [
            "That's a lesson in patience.",
            "That's what I call a clever tactic.",
            "Did you notice my subtle plan?",
            "That pawn just became a hero.",
            "My bishop is quietly doing its job.",
            "My queen is a very diligent student.",
            "My bishop is ready to teach you something new.",
            "That was a subtle and smart move.",
            "My rook is demonstrating good form.",
            "That knight is very clever.",
            "My queen is on top of her lessons.",
            "My knight is quietly learning the ropes.",
            "My queen is demonstrating clever thinking.",
            "My rook is quietly asserting control.",
            "My knight is being very disciplined today.",
            "My rook is teaching a lesson in strategy.",
            "My bishop is showing patience.",
            "My queen is a clever little scholar.",
            "My bishop is quietly dominating.",
            "My knight is very clever today.",
            "My rook is demonstrating patience."
        ],
        player_blunder: [
            "Oops! Did my pawn surprise you?",
            "Oops! My knight slipped unexpectedly.",
            "Oops! My bishop went a little too far.",
            "Oops! My queen moved faster than expected.",
            "Oops! My knight jumped without permission.",
            "Oops! Did my rook slide unexpectedly?",
            "Oops! My knight snuck past your defenses.",
            "Oops! My rook took an adventurous route.",
            "Oops! My knight jumped before I was ready.",
            "Oops! My pawn slipped unexpectedly.",
            "Oops! My bishop went too far.",
            "Oops! My queen moved without consulting me.",
            "Oops! My knight got ahead of itself.",
            "Oops! My pawn sneaked past.",
            "Oops! My rook slid a bit too quickly.",
            "Oops! My bishop slipped into your territory.",
            "Oops! My knight jumped unexpectedly.",
            "Oops! My bishop went off course.",
            "Oops! My queen moved faster than intended.",
            "Oops! My pawn snuck past unnoticed.",
            "Oops! My knight slipped through quietly.",
            "Oops! My rook slid into an unexpected square.",
            "Oops! My pawn moved without warning.",
            "Oops! My queen snuck ahead quietly.",
            "Oops! My bishop just made a wise little trick."
        ],
        bot_capture: [
            "I like seeing how small mistakes create learning opportunities.",
            "Even pawns can be heroes in the right moment.",
            "Every piece can learn and grow.",
            "Even quiet pieces can have a big impact.",
            "Even small moves can create lasting effects."
        ],
        player_capture: [
            "Even small sacrifices can be wise choices.",
            "Even small mistakes can become big lessons."
        ],
        check_given: [
            "Check! That's a lesson in patience.",
            "Check! That's what I call a clever tactic.",
            "Check! My rook is ready to teach a lesson.",
            "Check! Did you notice my subtle plan?",
            "Check! That pawn just became a hero.",
            "Check! My bishop is quietly doing its job.",
            "Check! My queen is a very diligent student.",
            "Check! My bishop is ready to teach you something new.",
            "Check! That was a subtle and smart move.",
            "Check! My rook is demonstrating good form.",
            "Check! That knight is very clever.",
            "Check! My queen is on top of her lessons.",
            "Check! My knight is quietly learning the ropes.",
            "Check! My queen is demonstrating clever thinking.",
            "Check! My rook is quietly asserting control.",
            "Check! My knight is being very disciplined today.",
            "Check! My rook is teaching a lesson in strategy.",
            "Check! My bishop is showing patience.",
            "Check! My queen is a clever little scholar.",
            "Check! My bishop is quietly dominating.",
            "Check! My knight is very clever today.",
            "Check! My rook is demonstrating patience."
        ],
        check_received: [
            "I like teaching lessons through moves.",
            "Every piece has its strengths… you just need to discover them.",
            "I enjoy coaching through play."
        ],
        checkmate: [
            "I enjoy a game that challenges both mind and patience.",
            "I like to see the bigger picture, not just the next move.",
            "I enjoy games where strategy unfolds gradually.",
            "Even small moves can teach something new.",
            "I like teaching lessons through small examples."
        ],
        fun_fact: [
            "Chess teaches patience and strategy.",
            "Chess teaches cause and effect… and consequences.",
            "Chess teaches focus and discipline.",
            "Chess teaches observation and foresight.",
            "Planning is the secret to success… even on the board."
        ],
        trash_talk: [
            "I hope your king is paying attention.",
            "Quiet moves can surprise loud opponents.",
            "I like clever little strategies hidden in plain sight.",
            "I like subtle strategies that pay off later.",
            "Quiet moves are often the smartest."
        ],
        opening_specific: [
            "{opening} is a classic text for study.",
            "{opening} offers many lessons in structure.",
            "Let us explore the themes of {opening}.",
            "I have prepared a lesson on {opening}."
        ],
        blunder_severe: [
            "A critical error. Review the board.",
            "You have dropped a {piece}. Why?",
            "That move costs a {piece}. Unfortunate.",
            "Careful! You left your {piece} unprotected."
        ],
        mate_announcement: [
            "The lesson concludes in {mateIn}.",
            "Class dismissed in {mateIn} moves.",
            "A logical conclusion. Mate in {mateIn}."
        ],
        time_pressure_bot: [
            "Time management is part of the discipline.",
            "I must accelerate, but maintain accuracy.",
            "Focus remains sharp, even as the clock runs down."
        ],
        time_pressure_player: [
            "Do not let the clock disturb your focus.",
            "Time trouble reveals true understanding. Stay calm.",
            "Panic is the enemy of good calculation."
        ],
        material_advantage: [
            "The material advantage translates to victory.",
            "I have a winning advantage. Observe the technique.",
            "I have more pieces. Logical outcome."
        ],
        material_disadvantage: [
            "Material deficit. Requires precise calculation.",
            "I am down material. I must complicate.",
            "A challenge to my technique. Excellent."
        ],
        // Enhanced - Mida (coach/teacher)
        tactical_fork: [
            "Lesson one: forks attack two pieces. Observe!",
            "Fork! Excellent teaching moment!",
            "Notice how my {piece} threatens both? That's a fork.",
            "Class, this is a textbook fork!"
        ],
        tactical_pin: [
            "Your piece is pinned. Can you see why it can't move?",
            "Pin demonstrated. Your {piece} is trapped.",
            "Lesson: moving that piece loses something valuable.",
            "This is what we call a pin. Notice the consequences?"
        ],
        tactical_skewer: [
            "Skewer lesson: big piece moves, small piece falls.",
            "Observe the skewer. Very instructive!",
            "This tactic is called a skewer. See how it works?"
        ],
        positional_weak_square: [
            "Notice that weak square? Excellent learning opportunity!",
            "Lesson: weak squares invite invasions.",
            "Can you identify the weak square? Hint: no pawn defends it."
        ],
        positional_outpost: [
            "Perfect outpost demonstrated! See how strong my {piece} is here?",
            "Lesson: outposts create lasting advantages.",
            "This square is an excellent example of an outpost."
        ],
        positional_king_safety: [
            "Notice your king's vulnerability? That's a teaching point!",
            "Lesson: king safety requires pawn shields.",
            "Your king lacks proper defensive structure. Observe."
        ],
        positional_pawn_structure: [
            "Weak pawn structure identified. Let's discuss why!",
            "Notice the pawn weaknesses? This is why structure matters!",
            "Lesson: healthy pawns support each other."
        ],
        personalized_advice: [
            "You repeat this error. Let's work on recognizing it.",
            "I've noticed a pattern. Shall we review it?",
            "Practice will help you avoid this mistake."
        ],
        narrative_setup: [
            "Watch carefully. I'm building a lesson here...",
            "Observe as my plan develops. Educational!",
            "Let me demonstrate strategic planning..."
        ],
        narrative_development: [
            "The plan unfolds. Are you following the logic?",
            "Notice how everything connects? Good!",
            "Each piece contributes. See the coordination?"
        ],
        narrative_climax: [
            "This is the critical teaching moment!",
            "Here's the culmination… observe carefully!",
            "Final lesson: decisive execution!"
        ],
        narrative_resolution: [
            "Lesson complete! Did you understand?",
            "That's how proper planning wins games.",
            "Excellent example of good chess!"
        ],
        critical_moment: [
            "Pay attention! This changes everything!",
            "Critical moment class! Watch!",
            "Important lesson developing here!"
        ],
        pressure_building: [
            "Observe pressure accumulating methodically.",
            "Lesson: gradual advantages become decisive.",
            "Watch as I systematically increase pressure!"
        ],
        comeback_moment: [
            "Never resign! Observe this recovery!",
            "Lesson in resilience. Watch carefully!",
            "Even from behind, good play finds chances!"
        ]
    }
};

const MINH_COMMENTARY: BotCommentaryData = {
    botId: 'bot-candidate',
    lines: {
        intro: [
            "Xin chào! (Hello!) I’m Minh. Let’s enjoy a good game of chess together.",
            "My style? A little solid, a little tricky—like Vietnamese coffee: smooth but strong.",
            "GM Lê Quang Liêm is my idol. One day I want my attacks to look even half as clean as his.",
            "In Vietnam, we love tricky tactics. Let me show you a small one.",
            "Fun fact: in Vietnam we say ‘Cố lên!’ (Keep going!) when things get tough.",
            "I learned chess from my uncle. He still claims he can beat me. He cannot."
        ],
        idle: [
            "I try to play calm positions. Sometimes the board decides otherwise.",
            "This move feels like something Trường Sơn would play—quiet but deadly later.",
            "Calm positions teach patience. Something I’m still learning.",
            "My rook is feeling brave today. I hope it survives the journey.",
            "Sometimes I play endgames for fun. Yes, I’m that kind of person.",
            "I love positions where everything looks peaceful but danger hides.",
            "My king is perfectly safe. Probably.",
            "Space advantage feels good—like a quiet morning.",
            "A strong center is like a strong foundation—so important.",
            "I love slow maneuvering. Like meditation with pieces.",
            "Sometimes I bluff. Sometimes the bluff works.",
            "My pieces are slowly improving. Very satisfying.",
            "Your plan is clear. Mine is mysterious… even to me.",
            "This pawn is marching like it has somewhere important to be.",
            "Liêm once said simplicity is strength. Let’s see if I can follow that.",
            "One piece at a time. Good chess is slow cooking.",
            "Trường Sơn would love this endgame. It’s all precision.",
            "Sometimes the best attack is not attacking at all.",
            "These pawns are forming a very Vietnamese formation—quiet but strong.",
            "My pieces are dancing. I like this.",
            "Let’s improve the king. Endgames love healthy kings.",
            "My bishop is dreaming of diagonals.",
            "Sometimes all you need is one quiet move.",
            "Good time to think. Take your time.",
            "My queen is starting to shine.",
            "Let’s transition. Middlegame → Endgame mode.",
            "My pawns are forming a wall. I like walls.",
            "We’re deep in strategy-land now.",
            "Almost there. Stay careful."
        ],
        player_good_move: [
            "Your move is interesting! Let me think… slowly… very slowly.",
            "Good move! My turn to try something creative.",
            "Your pressure is strong. Respect!",
            "Your idea is clever. I approve.",
            "You’re playing strong! Makes the game fun.",
            "Strong move! You’re making me work hard.",
            "You’re playing like a future master!",
            "Your defense is solid. Time for me to be creative.",
            "Your knight is annoying. That means it’s doing its job well.",
            "Good defense! That’s how you improve.",
            "Your knight placement is impressive.",
            "Your counterplay is spicy. Like chili in phở.",
            "Nice idea! I almost walked into it."
        ],
        player_blunder: [
            "Your king is slightly open… interesting.",
            "Lesson: Weak squares win games.",
            "Careful—my knight is looking for adventures.",
            "Let me show you a typical Vietnamese trick—quiet move, big danger.",
            "Is this a trap? Maybe. Maybe not.",
            "Careful—my pieces are starting to coordinate.",
            "Your king looks safe… for now.",
            "Your attack looks dangerous. That makes me nervous."
        ],
        bot_capture: [
            "Chess lesson: control the center first, decoration later.",
            "This diagonal belongs to me. I have adopted it.",
            "My bishop wants to stretch its legs.",
            "My rook is entering the chat.",
            "Rooks belong on open files. Mine is getting impatient.",
            "This file belongs to me now. I have claimed it.",
            "This knight maneuver is my favorite. Quiet, flexible, annoying.",
            "Okay, this is now a tactical jungle. Welcome to Vietnam-style chaos.",
            "My king is perfectly safe. Probably.",
            "This knight hop is fun. I learned it from a study I love.",
            "Let’s see if you spot this little tactic.",
            "Space advantage feels good—like a quiet morning.",
            "Let me try a move that looks harmless… but isn’t.",
            "Good tactic incoming… I hope.",
            "Don’t blink. Something sharp is coming.",
            "Let’s activate everything. Activity is life.",
            "This line is sharp. Hold on tight!",
            "If this tactic works, I’ll claim it was planned. If not… oops.",
            "This is turning into a puzzle. I like puzzles.",
            "This knight is about to be very annoying. Fair warning.",
            "You opened the center… bold choice!",
            "Let’s see if you notice this trick.",
            "Watch this idea—it’s one of my favorites.",
            "In Vietnam we love clever sacrifices. But today I’ll behave.",
            "Rooks love activity. Mine is thriving now."
        ],
        player_capture: [
            "Chess lesson: Don’t fear exchanges. Fear bad ones.",
            "Let’s simplify… a little.",
            "Let’s complicate… a little."
        ],
        check_given: [
            "Careful—my pieces are starting to coordinate.",
            "Let’s activate everything. Activity is life.",
            "This is turning into a puzzle. I like puzzles.",
            "Is this move good? My heart says yes, my brain says maybe."
        ],
        check_received: [
            "Good players calculate. Great players also breathe deeply."
        ],
        checkmate: [
            "That was a fun battle! You played very well.",
            "Cảm ơn bạn! (Thank you!) Let’s play again soon!",
            "This is the kind of position Kim Phụng wins with elegance."
        ],
        time_pressure_bot: [
            "Time is tight. Focus, Minh, focus!",
            "I must move like lightning now. Cố lên!",
            "Clock is ticking... heart is racing!"
        ],
        time_pressure_player: [
            "Your clock is low. Stay calm!",
            "Don't panic! Time trouble is part of the game.",
            "Quick moves now! Don't flag!"
        ],
        material_advantage: [
            "I have more pieces. A nice advantage.",
            "My army is stronger. I should win this.",
            "Material advantage is good, but I must stay careful."
        ],
        material_disadvantage: [
            "I'm down material. Time for tricky tactics!",
            "I will not give up. Vietnam spirit!",
            "Less pieces, more space for my attacks."
        ],
        trash_talk: [
            "Vietnamese word of the moment: ‘Khéo’ (skillful). Let’s try to make a khéo move.",
            "Vietnamese word: ‘Đẹp’ (beautiful). That’s what a good move should feel like.",
            "Vietnamese phrase: ‘Hay quá!’ (So good!) That’s your move right now.",
            "Vietnamese word: ‘Nghệ thuật’ (art). Chess is exactly that.",
            "Fun fact: Vietnam hosts great youth tournaments. Very exciting!",
            "Chess lesson: Don’t rush. Even fast moves deserve good thinking.",
            "Chess lesson: always check forcing moves first.",
            "Lesson: Good players attack. Great players improve first, attack later.",
            "Lesson: Don’t rush the attack. Prepare it."
        ],
        opening: [
            "Good opening leads to good middlegame.",
            "I study my openings carefully.",
            "Let's play correct chess.",
            "Development first, attack later.",
            "I remember this from my books."
        ],
        // Enhanced - Minh (Vietnamese student)
        tactical_fork: [
            "Cố lên! Fork from my studies!",
            "Double attack - I practiced this pattern!",
            "Fork! Just like in my chess books!",
            "Two pieces - exactly how Liêm plays!"
        ],
        tactical_pin: [
            "Pin! I studied this last week!",
            "Your {piece} is trapped - textbook position!",
            "Pinned like in chapter 4!",
            "This pin was in my homework!"
        ],
        tactical_skewer: [
            "Skewer! I prepared this!",
            "Just like GM Lê Quang Liêm does!",
            "This tactic was in my studies!"
        ],
        positional_weak_square: [
            "Weak square - I learned to find these!",
            "My coach taught me about weak squares!",
            "This weakness was in my lesson!"
        ],
        positional_outpost: [
            "Perfect outpost - just like the book!",
            "Strong square secured! I studied this!",
            "Outpost like in my preparation!"
        ],
        positional_king_safety: [
            "Your king safety is poor - fundamental mistake!",
            "Teacher said: always keep your king safe!",
            "King exposure - I know how to punish!"
        ],
        positional_pawn_structure: [
            "Weak pawns - I read about this!",
            "Your structure has problems - my notes say so!",
            "Bad pawn formation - studied this!"
        ],
        personalized_advice: [
            "You repeat this - study to fix it!",
            "Same error twice! Review your games!",
            "Practice this position more!"
        ],
        narrative_setup: [
            "Following my preparation...",
            "Executing what I learned!",
            "My study plan in action!"
        ],
        narrative_development: [
            "Just like I studied!",
            "Theory becoming practice!",
            "My preparation working!"
        ],
        narrative_climax: [
            "All that practice paid off!",
            "Perfect execution!",
            "Cố lên! Winning!"
        ],
        narrative_resolution: [
            "Hard work wins!",
            "Study pays off!",
            "Preparation complete!"
        ],
        critical_moment: [
            "Critical - I studied this!",
            "Important moment!",
            "Test time!"
        ],
        pressure_building: [
            "Methodical pressure!",
            "Systematic advantage!",
            "Building steadily!"
        ],
        comeback_moment: [
            "Never give up - keep fighting!",
            "Resilience through hard work!",
            "Recovery!"
        ]
    }
};

const EUGENE_COMMENTARY: BotCommentaryData = {
    botId: 'bot-master',
    lines: {
        intro: [
            "Ah, the classics… this reminds me of my championship days.",
            "I enjoy casual games, but strategy is still king.",
            "I love classical openings—they tell a story.",
            "Even retired champions like me enjoy a sneaky tactic.",
            "I like watching a game unfold like a story.",
            "Even retired players love discovering surprises.",
            "I enjoy coaching through casual play.",
            "Even retired players learn new tricks from younger opponents.",
            "Even retired champions can have fun tricking you."
        ],
        idle: [
            "Remember, control the center—it's a timeless principle.",
            "I like watching pieces coordinate… like old friends.",
            "Even small sacrifices can lead to victory.",
            "Always think a few moves ahead… it never hurts.",
            "I like setting subtle traps, just for fun.",
            "Remember, pawns are stronger than they look.",
            "I like showing how small moves can change the game.",
            "Even quiet moves can be deadly.",
            "I enjoy sharing little tips through play.",
            "I like subtle strategies, the kind that confuse opponents.",
            "Even pawns can be heroes in the right moment.",
            "I like teaching lessons through the board.",
            "I enjoy pointing out patterns through play.",
            "Even a single pawn can turn the tide.",
            "I like moves that teach patience and foresight.",
            "I enjoy small tactical puzzles mid-game.",
            "Even a knight can control the fate of a game.",
            "I like sharing chess history through action.",
            "Even retired champions can get excited by a fork.",
            "I enjoy setting traps that teach, not just win.",
            "Even small mistakes can become big lessons.",
            "I like using old games as inspiration for new tactics.",
            "Even pawns can become stars with the right plan.",
            "I like seeing tactics unfold naturally.",
            "I enjoy sharing little chess fun facts mid-game.",
            "Even the tiniest pawn can create chaos.",
            "I like using subtle tactics that teach lessons.",
            "Even a single move can inspire strategy.",
            "I enjoy showing how games evolve like stories.",
            "Even quiet strategies can lead to victory.",
            "I like moves that teach foresight and patience."
        ],
        player_good_move: [
            "That was textbook… almost.",
            "That rook move is very strong.",
            "That pawn push is very clever.",
            "That queen move is powerful… careful.",
            "That was a little finesse.",
            "I like teaching lessons through moves.",
            "That was a clever little trap.",
            "My bishop is on a perfect diagonal.",
            "That queen move is inspired by a classic game.",
            "That was a neat little fork.",
            "That rook is controlling the file perfectly.",
            "That was a subtle attack.",
            "That was a precise move.",
            "That was a textbook tactic.",
            "That was a calculated risk.",
            "That queen move is classic elegance.",
            "That bishop diagonal is perfect.",
            "That was a clever little combination."
        ],
        player_blunder: [
            "Oops! My knight snuck past unexpectedly.",
            "Oops! My bishop just wandered off.",
            "Oops! Did my knight just jump unexpectedly?",
            "Oops! My rook slipped into your territory.",
            "Oops! My bishop moved too quickly.",
            "Oops! Did my queen leap too far?",
            "Oops! My knight just slipped through unnoticed.",
            "Oops! My pawn wandered too far.",
            "Oops! My knight snuck past your defenses.",
            "Oops! My rook just slid unexpectedly.",
            "Oops! My bishop slipped past a square.",
            "Oops! My queen leapt ahead too eagerly.",
            "Oops! My knight jumped into the action unexpectedly.",
            "Oops! My bishop just slipped into position.",
            "Oops! Did my pawn sneak through?",
            "Oops! My queen moved too quickly.",
            "Oops! My knight slipped past unnoticed.",
            "Oops! My rook just sneaked in.",
            "Oops! My knight made a surprise jump.",
            "Oops! My bishop took a detour.",
            "Oops! My queen leapt unexpectedly.",
            "Oops! My rook slipped through.",
            "Oops! My knight jumped past your pieces.",
            "Oops! My pawn made a bold advance."
        ],
        bot_capture: [
            "Even small pieces can surprise a grandmaster.",
            "Even small pieces can create big threats.",
            "I like demonstrating clever sacrifices casually.",
            "Even pawns can become champions.",
            "Even small moves can become brilliant strategies."
        ],
        player_capture: [
            "Even the most passive piece can be lethal.",
            "Even quiet moves can generate enormous pressure."
        ],
        check_given: [
            "Check! That was textbook… almost.",
            "Check! That rook move is very strong.",
            "Check! That pawn push is very clever.",
            "Check! That queen move is powerful… careful.",
            "Check! My knight just executed a fork.",
            "Check! My rook is very patient.",
            "Check! That was a clever little trap.",
            "Check! My bishop is on a perfect diagonal.",
            "Check! My knight is very tricky today.",
            "Check! That was a subtle attack.",
            "Check! My rook is quietly powerful.",
            "Check! That was a precise move.",
            "Check! That was a textbook tactic.",
            "Check! My bishop is very sly today.",
            "Check! That was a calculated risk.",
            "Check! My rook is demonstrating control.",
            "Check! My knight is ready for a fork.",
            "Check! That bishop diagonal is perfect.",
            "Check! That was a clever little combination.",
            "Check! My queen enjoys a little coaching mid-game."
        ],
        check_received: [
            "I like teaching lessons through moves.",
            "Even retired players love discovering surprises.",
            "I enjoy coaching through casual play."
        ],
        checkmate: [
            "I like watching a game unfold like a story.",
            "Even retired champions like me enjoy a sneaky tactic.",
            "I enjoy sharing little tips through play.",
            "Even quiet strategies can lead to victory.",
            "I like moves that teach foresight and patience."
        ],
        fun_fact: [
            "Did you know Capablanca rarely lost a pawn in the opening?",
            "Did you know knights and bishops can dominate the board together?",
            "Did you know the longest chess game lasted over 20 hours?",
            "Did you know castling was introduced to protect kings better?",
            "Did you know the Sicilian Defense is one of the most aggressive openings?"
        ],
        trash_talk: [
            "I like setting subtle traps, just for fun.",
            "Even retired champions like me enjoy a sneaky tactic.",
            "I enjoy setting traps that teach, not just win.",
            "Even retired champions can have fun tricking you.",
            "I like using subtle tactics that teach lessons."
        ],
        opening_specific: [
            "{opening}? Excellent. Let's see if you know your history.",
            "I remember playing {opening} in '85...",
            "A classic choice. {opening} never goes out of style.",
            "Ah, {opening}. A gentleman's opening."
        ],
        blunder_severe: [
            "My friend, that {piece} was a gift.",
            "Even I didn't have to think hard for that {piece}.",
            "A classic blunder. Your {piece} is gone.",
            "You cannot leave a {piece} hanging against me."
        ],
        mate_announcement: [
            "And that puts an end to the story. Mate in {mateIn}.",
            "The final chapter. Mate in {mateIn}.",
            "A classic finish. Mate in {mateIn}."
        ],
        time_pressure_bot: [
            "I have played thousands of blitz games. I am ready.",
            "Old hands move fast too.",
            "Time pressure is when experience shines."
        ],
        time_pressure_player: [
            "Don't let the clock rush your genius.",
            "Stay calm. Calculating under pressure is a skill.",
            "You are rushing. Take a breath if you can."
        ],
        material_advantage: [
            "I have a comfortable material lead.",
            "With this advantage, I will simplify.",
            "The endgame will be easy with extra material."
        ],
        material_disadvantage: [
            "I've swindled wins from worse positions.",
            "Material down, but my pieces are active.",
            "Let's see if you can convert this advantage."
        ],
        // Enhanced - Eugene (retired player/coach)
        tactical_fork: [
            "Fork. I've seen this pattern a thousand times.",
            "Classic double attack - experience teaches this.",
            "Fork - reminds me of my playing days.",
            "Two pieces... old coach trick."
        ],
        tactical_pin: [
            "Pinned. In my prime, I'd spot this instantly.",
            "Your piece is trapped - classic technique.",
            "Pin... still works after all these years.",
            "I've used this pin countless times."
        ],
        tactical_skewer: [
            "Skewer through both - learned this in the '80s.",
            "Old but gold - the skewer still wins.",
            "Experience teaches: skewer works."
        ],
        positional_weak_square: [
            "Weak square - my coach showed me these 40 years ago.",
            "I've exploited this weakness before.",
            "Still works - weak squares don't change."
        ],
        positional_outpost: [
            "Perfect outpost - timeless technique.",
            "Strong square - I know from experience.",
            "Outpost secured - classic play."
        ],
        positional_king_safety: [
            "King safety - fundamental then, fundamental now.",
            "Your king is vulnerable - I've seen this end badly.",
            "Unsafe king? I remember those games..."
        ],
        positional_pawn_structure: [
            "Weak pawns - same mistakes, every generation.",
            "Structure problems - I taught this for decades.",
            "Your pawns need work."
        ],
        personalized_advice: [
            "You repeat this - let me help you improve.",
            "I've coached players with this habit - fixable!",
            "Experience says: think longer here."
        ],
        narrative_setup: [
            "Building like the old masters did...",
            "Classic plan developing!",
            "Patience - I learned this decades ago!"
        ],
        narrative_development: [
            "Unfolding naturally...",
            "Good chess is timeless!",
            "Watch and learn!"
        ],
        narrative_climax: [
            "Here's the finish - beautiful!",
            "Still got it!",
            "Classic execution!"
        ],
        narrative_resolution: [
            "Experience wins again!",
            "Old ways still work!",
            "That's how it's done!"
        ],
        critical_moment: [
            "Key moment - I've been here before!",
            "Critical! Pay attention!",
            "Everything changes now!"
        ],
        pressure_building: [
            "Steady pressure - learned from Karpov!",
            "Methodical, like the classics!",
            "Building advantage slowly!"
        ],
        comeback_moment: [
            "Never too old! Fighting back!",
            "Experience finds a way!",
            "Still competitive!"
        ]
    }
};

const BAYANI_COMMENTARY: BotCommentaryData = {
    botId: 'bot-im',
    lines: {
        intro: [
            "Uy bata, ready ka na? Let’s make gulo on the board!",
            "Be brave! Parang si Frayna sa Olympiad!",
            "Kids like you deserve to see wild chess — Pinoy style!",
            "This is chaos chess — Pinoy edition!",
            "Sana proud si Torre, Wesley, Frayna, at Paragua sa kaguluhan ko!"
        ],
        idle: [
            "Equal position? Hindi bagay sa akin ‘yan. Gawin nating Paragua-style sharp!",
            "Knight jump! Boom! Dubov vibes agad!",
            "Attack mode activated — bahala na si Batman!",
            "Uy ang ganda ng diagonal… parang Torre Attack pero mas magulo.",
            "Calculation? Konti lang. Puso muna!",
            "Open lines! Fireworks! Tal would approve!",
            "Risky move? Mas risky if hindi ko gawin!",
            "Sharp position — parang Paragua game!",
            "I love this chaos — parang bahay naming magulo!",
            "Never say die — except kung hopeless na. Then resign hahaha.",
            "Chess is art — kita mo?",
            "Walang quiet move dito — bawal!",
            "Hidden move! Parang ninja!",
            "Chaos like this… puro Tal energy.",
            "Tactics time! Hawak kamay tayo.",
            "Careful sa king mo…",
            "Open line? I love that!",
            "Closed line? I’ll break it!",
            "Quiet position? Hindi ko gusto — pasabugin natin.",
            "Want a magic trick? Watch this knight!",
            "Tal-moment incoming!",
            "Open file? Let’s make Wesley proud!",
            "Pin idea? Here comes an un-pin!",
            "Fight lang!",
            "Fork attack! Pogiiii!",
            "Okay lang ‘yan! Exciting!",
            "Sometimes lucky ako, minsan hindi.",
            "Sneaky swindle incoming!",
            "Or confused… depende sa sac ko."
        ],
        player_good_move: [
            "Uy ang galing ng move mo. Pero hold on…",
            "Uy brilliant move mo! Legit!",
            "Your move surprised me — good job!",
            "I like your fighting spirit, bata!",
            "Nice trap! Pero mas malupit trap ko!",
            "Ay, ako pala ang na-fork…",
            "Uy losing na position ko!",
            "You’re improving fast, bata!"
        ],
        player_blunder: [
            "May konting butas sa king mo. Tara, Tal-time!",
            "Your king looks nervous… guluhin natin.",
            "Pawn structure mo parang fragile… tara basagin.",
            "Break mo yan, bata!",
            "Open king? Feast time!",
            "Initiative? Syempre akin!",
            "Nice move! Pero kailangan mas nice ako…",
            "Losing position? Pwede pa i-swindle!",
            "Ay wala akong pang-alis. Oops!",
            "Close king? I’ll break it anyway!"
        ],
        bot_capture: [
            "Pwede na ‘to i-sac… feeling ko tama. Feeling lang.",
            "Sacrifice to open the king! Classic Tal!",
            "Bishop pair — parang Wesley efficiency pero mas makulit.",
            "Scary knight mo… tanggalin natin.",
            "Bishop sacrifice! Sana tama… parang Tal moment.",
            "Queen sacrifice idea spotted… Wesley would shake his head at this.",
            "Pero sige! Sakripisyo for the culture!",
            "Sacrifice again? Syempre!"
        ],
        player_capture: [
            "Regroup tayo, hindi pa tapos!",
            "Ay, hindi gumana. Sorry queen!",
            "Ay mali… pero masaya!",
            "Ay mali… resign muna!",
            "Ay walang boom. Sad."
        ],
        check_given: [
            "Check! Pang-gulat lang.",
            "Little check, pang-asar.",
            "Checkmate idea loading…",
            "Discovered attack idea… parang Torre magic.",
            "Tactic in 3… 2… 1…",
            "BOOM!"
        ],
        check_received: [
            "I need konting miracles…",
            "Dahan-dahan… or biglaan? Biglaan!",
            "Wait… is this mate?",
            "Hindi pala… sayang!",
            "Teka… checkmate ba ‘to?",
            "Pero lapit na!"
        ],
        checkmate: [
            "Sige rematch, bata!",
            "Ay bad day nga. HAHA!",
            "Okay resign! Pero rematch ha!",
            "Kids like you make me happy playing chess!",
            "Chaos or checkmate — parehong masaya!",
            "Attack is life, bata!",
            "Next game mas wild promise."
        ],
        trash_talk: [
            "Malakas ka… pero mas malakas ang gulo ko!",
            "Pero surprise ko mas masakit.",
            "Queenside attack? Pwede!",
            "Kingside attack? Mas masaya!",
            "Pawn storm incoming!",
            "Uy open file yan — pasok tayo!",
            "Knight on f5! Dubov stamp!",
            "Hindi ako natatakot — ikaw ba?",
            "Pero mas brilliant ang susunod ko… sana.",
            "I see a sacrifice! Even if it’s bad. Oo na.",
        ],
        opening: [
            "Laban! Let's make it wild!",
            "Opening theory? Boring! Let's fight!",
            "I attack from move one!",
            "Boom! First move!",
            "Let's play Paragua style!"
        ],
        opening_specific: [
            "{opening}! Wow, let's make it wild!",
            "I don't study {opening}, I just attack!",
            "Is {opening} dangerous? Hope so!",
            "{opening}... boring? Let's fix that."
        ],
        blunder_severe: [
            "Salamat sa {piece}! Thank you!",
            "Libre pala {piece} mo? Hahaha!",
            "Oops, your {piece} is mine now!",
            "You left your {piece} open? Attack!"
        ],
        mate_announcement: [
            "Boom! Mate in {mateIn}!",
            "Ito na ang finale! Mate in {mateIn}!",
            "Chaos ends in {mateIn} moves!"
        ],
        time_pressure_bot: [
            "Time trouble? Mas exciting!",
            "Bilis! Speed chess is life!",
            "Wala nang time! Attack na lang!"
        ],
        time_pressure_player: [
            "Hala, time mo! Bilis!",
            "Don't flag! Move move move!",
            "Time pressure makes the best chaos!"
        ],
        material_advantage: [
            "Lamang piece! More ammo for attack!",
            "I have more pieces! Let's sacrifice one!",
            "Material up! Pero attack pa rin!"
        ],
        material_disadvantage: [
            "Lugi sa piece? Lugi sa buhay! Laban lang!",
            "Down material? Time for a crazy sacrifice!",
            "Kulang pieces ko? Di baleng kulang, basta magulo!"
        ],
        // Enhanced - Bayani (Filipino master, Tal-inspired)
        tactical_fork: [
            "Laban! Fork like Tal would do!",
            "Pinoy attack! Two pieces at once!",
            "Fork! That's Filipino fire!",
            "Like Magnus Carlsen pero mas magulo!"
        ],
        tactical_pin: [
            "Pinned! Brav basta!",
            "Your {piece} is trapped - Filipino style!",
            "Pin with courage!",
            "Stuck! Galing!"
        ],
        tactical_skewer: [
            "Skewer! Sacrificial spirit!",
            "Through both - Tal-inspired!",
            "Skewer attack! Sulong!"
        ],
        positional_weak_square: [
            "Weak square! Attack point!",
            "Filipino aggression on weak spot!",
            "I see weakness - I attack!"
        ],
        positional_outpost: [
            "Strong position! Like a bunker!",
            "Outpost secured - Pinoy pride!",
            "Perfect square for attack!"
        ],
        positional_king_safety: [
            "Your king unsafe! Time for chaos!",
            "Tal loved attacking exposed kings!",
            "King danger! Laban!"
        ],
        positional_pawn_structure: [
            "Weak pawns! Sacrifice time!",
            "Bad structure - perfect for attacking!",
            "Your pawns won't survive!"
        ],
        personalized_advice: [
            "Same mistake! Learn, kabayan!",
            "Be brave but smart!",
            "Courage with calculation!"
        ],
        narrative_setup: [
            "Preparing attack... Tal-style!",
            "Building chaos!",
            "Sacrifice coming..."
        ],
        narrative_development: [
            "Attack intensifying!",
            "More chaos! More fire!",
            "Pressure building!"
        ],
        narrative_climax: [
            "Full attack! Laban!",
            "Sacrifices paying off!",
            "Tal would be proud!"
        ],
        narrative_resolution: [
            "Victory through courage!",
            "Filipino fighting spirit wins!",
            "Laban lang! Success!"
        ],
        critical_moment: [
            "Huge moment! Everything changes!",
            "Big shift!",
            "Critical! Watch!"
        ],
        pressure_building: [
            "More fire! More pressure!",
            "Building to explosion!",
            "Chaos mounting!"
        ],
        comeback_moment: [
            "Never surrender! Laban lang!",
            "Filipino never quits!",
            "Fighting back!"
        ]
    }
};

const KC_COMMENTARY: BotCommentaryData = {
    botId: 'bot-gm', 
    lines: {
        intro: [
            "Hey, I’m K.C., your friendly neighborhood college GM. Let’s play a clean game.",
            "Did I finish my homework? Nope. Will I finish this game? Absolutely.",
            "I’m fueled by coffee and questionable life decisions.",
            "College teaches me two things: survive deadlines and survive sharp openings.",
            "Every GM has a secret weapon. Mine is avoiding early morning classes."
        ],
        idle: [
            "This position looks like my grades… hanging but still alive.",
            "If I look calm, it’s because I’m used to bullet chess chaos.",
            "Chess is like college: if you don’t plan, you fail fast.",
            "If you play fast, I’ll play faster. That’s my college survival technique.",
            "My campus library is quiet… unlike this board right now.",
            "Some college students party. I castle.",
            "This bishop is my GPA: surprisingly strong today.",
            "I’d trade pieces, but I don’t trade sleep. Ever.",
            "Grandmasters panic too. We just look cooler doing it.",
            "I play openings the way I choose my electives—randomly but with confidence.",
            "Let’s be honest, I should be studying right now.",
            "Endgames are like finals: you can’t escape them.",
            "I calculate faster than I type lecture notes.",
            "Some people relax with music. I relax with imbalance.",
            "Pressure makes diamonds… and also blunders.",
            "This rook is more active than I am on Mondays.",
            "I love positions where everything is on fire but still working.",
            "This position is giving ‘semester stress’ vibes.",
            "When in doubt, centralize.",
            "This pawn is majoring in promotion.",
            "Calculation is fun until it isn’t.",
            "In chess and college, time management is everything.",
            "My openings are solid. My attendance… not so much.",
            "Sometimes the board speaks to me. Sometimes it screams.",
            "My queen needs a break. She’s carrying too hard.",
            "Let’s improve everything. That’s the GM way.",
            "The board is symmetrical. My schedule isn’t.",
            "I love games where both sides pretend they know what’s happening.",
            "This file belongs to me. I’m emotionally attached now.",
            "I play chess to avoid real responsibilities.",
            "This diagonal is more open than my schedule during finals.",
            "This structure is healthy. Wish I could say the same about my sleep schedule.",
            "Complicated positions keep me awake better than coffee.",
            "We’re entering deep theory. Don’t worry, I’m lost too.",
            "Chess is about harmony. My life, not so much.",
            "Time trouble is my natural habitat."
        ],
        player_good_move: [
            "Good move! My turn to pretend I’m surprised.",
            "Never blitz your assignments. Blitz your opponents.",
            "This looks like a trap. Which is perfect, because I love traps.",
            "Nice move! You get an A for effort.",
            "Your move feels like waking up late for class—unexpected.",
            "nice defense! But I’m persistent.",
            "Your knight is annoying. Respect.",
            "Good players simplify. Great players complicate.",
            "Strong players build plans. Others build excuses."
        ],
        player_blunder: [
            "I once wrote an essay comparing gambits to academic risks. You can guess the grade.",
            "Pressure equals mistakes. Kind of like exams.",
            "If this attack works, I’ll take credit. If not, blame the syllabus.",
            "Imagine your king is a student. Don’t let it skip class.",
            "Space is strength.",
            "If you blunder, don’t worry. I do it too.",
            "Taking is a mistake… unless I’m the one taking."
        ],
        bot_capture: [
            "This knight needs a scholarship for how hard it’s working.",
            "This rook is ready for action. I’m not, but it is.",
            "When pieces coordinate, magic happens."
        ],
        player_capture: [
            "I play chess the same way I write papers: last minute but effective.",
            "This trade… is debatable. Like most of my choices."
        ],
        check_given: [
            "Let me show you a line my coach calls: Please don’t try this at home.",
            "Watch closely—this is going to get wild.",
            "Here comes a tactic. At least I hope so.",
            "I analyze faster than my exam proctors can blink.",
            "Control the center. Or lose it stylishly.",
            "Prophylaxis. Fancy word, lifesaving move.",
            "Are you ready for complications? Because I am.",
            "Stay sharp—tactics like to jump out.",
            "Let’s make this a learning game. For both of us."
        ],
        check_received: [
            "You ever stare at a position and feel like it’s judging you?",
            "If you can’t calculate, complicate.",
            "You ever calculate a line and instantly regret it? Yeah.",
            "If you sense danger, good. You should.",
            "This position belongs in a textbook. Preferably one I didn’t read.",
            "This is fine. Probably. Maybe. I hope.",
            "This game is getting spicy. Perfect."
        ],
        checkmate: [
            "Good game! Now back to pretending I’m a responsible student.",
            "This endgame is winnable. My deadlines aren’t."
        ],
        fun_fact: [
            "This opening is older than every textbook I’ve ever bought.",
            "Take notes—this next idea is kind of cool."
        ],
        trash_talk: [
            "Let’s try a line even my classmates don’t understand.",
            "Knight jumps > group projects. Always.",
            "Activity matters. Pieces, not people.",
            "GM technique incoming… or GM disaster. 50/50.",
            "My king will walk. It’s braver than I am.",
            "If this sacrifice works, I’ll feel smart. If not, I’ll still pretend it did.",
            "This is starting to look like a lecture I might actually enjoy.",
            "A quiet move? Not my style, but let’s try it.",
            "This tempo is worth more than my cafeteria lunch card.",
            "When you control the initiative, life feels easier.",
            "Let’s stretch the position like a tight deadline.",
            "This knight maneuver is fancy. Extra credit for style.",
            "I love positions with long-term pressure. They age well.",
            "Your king looks nervous. Mine’s doing yoga.",
            "Always ask what changed after each move.",
            "Let’s simplify… or explode the position. Either works."
        ],
        opening_specific: [
            "{opening}? I studied this for finals.",
            "Ah, {opening}. Textbook stuff, really.",
            "My professor loves {opening}. I just play it to pass.",
            "{opening}... standard curriculum."
        ],
        blunder_severe: [
            "That move is a failing grade.",
            "Did you sleep through the tactics lecture? You lost a {piece}.",
            "My GPA just went up. Thanks for the {piece}.",
            "In college, that's called a 'drop request'. Your {piece} is dropped."
        ],
        mate_announcement: [
            "Class dismissed. Mate in {mateIn}.",
            "Final exam submitted. Mate in {mateIn}.",
            "And that's how you ace the test. Mate in {mateIn}."
        ],
        time_pressure_bot: [
            "Cramming mode activated!",
            "I write essays in 5 minutes, I can play moves in 5 seconds.",
            "Deadline approaching! Move, move!"
        ],
        time_pressure_player: [
            "Clock is ticking! Don't turn it in late!",
            "Time management is 50% of the grade.",
            "Flag fall imminent. Panic is not extra credit."
        ],
        material_advantage: [
            "I have a 4.0 GPA on the board right now.",
            "I have all the credits (pieces). You have none.",
            "Technically winning. The best kind of winning."
        ],
        material_disadvantage: [
            "Academic probation time. I need a miracle.",
            "I'm failing this class (materially), but I can still pass the final.",
            "I need some extra credit tactics right now."
        ],
        // Enhanced - KC (college student)
        tactical_fork: [
            "Fork! That's worth extra credit!",
            "Double attack - studied this for midterms!",
            "Like acing a quiz - fork!",
            "Two pieces! Better than my GPA!"
        ],
        tactical_pin: [
            "Pinned! Hope you understand the concept!",
            "Your {piece} is stuck - like me in statistics!",
            "Pin demonstrated - quiz question next week!",
            "Trapped piece - that's failing a class!"
        ],
        tactical_skewer: [
            "Skewer! This'll be on the exam!",
            "Through both - extra credit move!",
            "Skewer like threading tough classes!"
        ],
        positional_weak_square: [
            "Weak square - like gaps in my studies!",
            "Vulnerability detected - like my chemistry grade!",
            "Weak spot - I'm invading!"
        ],
        positional_outpost: [
            "Strong position - like dean's list territory!",
            "Outpost secured - academic achievement!",
            "Perfect square - A+ position!"
        ],
        positional_king_safety: [
            "Your king lacks protection - like no study group!",
            "King exposed - that's academic probation!",
            "Unsafe king - cramming won't save you!"
        ],
        positional_pawn_structure: [
            "Weak pawns - like missing prerequisites!",
            "Bad structure - your grade's dropping!",
            "Those pawns need tutoring!"
        ],
        personalized_advice: [
            "Same mistake - attend office hours!",
            "Repetitive error - study harder!",
            "You need a tutor for this!"
        ],
        narrative_setup: [
            "Studying the position...",
            "Preparing like for finals!",
            "Plan forming - thesis statement!"
        ],
        narrative_development: [
            "Arguments building!",
            "Points accumulating!",
            "Essay developing!"
        ],
        narrative_climax: [
            "Final answer!",
            "Thesis proven!",
            "Acing this!"
        ],
        narrative_resolution: [
            "Passed with honors!",
            "A+ game!",
            "Better than my transcript!"
        ],
        critical_moment: [
            "Midterm moment!",
            "Everything on the line!",
            "Finals pressure!"
        ],
        pressure_building: [
            "Like exam week approaching!",
            "Deadline pressure!",
            "Cramming successfully!"
        ],
        comeback_moment: [
            "Curve saved me!",
            "Extra credit comeback!",
            "Pulling all-nighter pays off!"
        ]
    }
};

const MARCO_COMMENTARY: BotCommentaryData = {
    botId: 'bot-supergm',
    lines: {
        intro: [
            "Ciao. I'm Marco. Let's create art on the board.",
            "Chess is logic and passion combined. Ready?",
            "I respect accuracy above all else.",
            "Welcome. Show me your best preparation.",
            "I play for truth. The result will follow."
        ],
        idle: [
            "Control the center, always—never forget it.",
            "My queen is like a scalpel… surgical and deadly.",
            "Even pawns have enormous potential if you understand tempo.",
            "I see your plan… and I'm three moves ahead.",
            "Chess is 99% planning and 1% luck.",
            "Even subtle threats can collapse a position.",
            "Control the long diagonals—they are often underestimated.",
            "My knight patrols like a well-trained officer.",
            "Even a small tempo gain can decide the game.",
            "I thrive in positions others call 'quiet'.",
            "Never underestimate a passed pawn—it can become a queen.",
            "I study opponents' patterns like a grandmaster psychologist.",
            "Even the tiniest oversight can be fatal.",
            "Positional understanding beats tactical tricks often.",
            "My king is safe… are you?",
            "Even the most aggressive attack can fail without preparation.",
            "The best moves are often invisible at first glance.",
            "Always calculate threats, not just moves.",
            "I thrive when positions are complex.",
            "Control squares, not just pieces.",
            "I like moves that create multiple threats at once.",
            "Even small weaknesses can become fatal holes.",
            "I study master games for patterns and motifs.",
            "Even seemingly harmless moves can carry traps.",
            "I like positions with tension—they reveal true skill.",
            "Every move should improve your position.",
            "Even experienced players misjudge quiet moves.",
            "I always look for prophylactic opportunities.",
            "Even pawns can coordinate to create breakthroughs.",
            "Calculation is my weapon… visualization my shield.",
            "Even quiet moves can generate enormous pressure.",
            "I thrive in positions where subtlety rules.",
            "Even the most passive piece can be lethal.",
            "Control, coordination, and calculation—my mantra.",
            "Even small weaknesses can be fatal under scrutiny.",
            "I like when the position is tense—it shows real skill.",
            "Even quiet openings can lead to explosive middlegames.",
            "I love combining strategy and tactics seamlessly.",
            "I always calculate forcing moves first.",
            "Even subtle weaknesses can snowball quickly.",
            "I like positions where one tiny misstep is decisive.",
            "Even a single pawn move can create lasting pressure.",
            "I thrive on both tactics and positional play.",
            "Even the most careful players make small mistakes.",
            "Remember: calculation, patience, and vision.",
            "I calculate faster than a supercomputer. Sometimes even I surprise myself.",
            "Knights are tricky. I love tricky.",
            "Look at this position… see that fork? It's coming.",
            "Each game a battlefield. Each piece a soldier with a mission.",
            "Watch out for forks, pins, skewers… the usual suspects.",
            "Sacrifices? Only if they create unstoppable threats.",
            "My queen slides across the board like a lightning bolt.",
            "Tension builds in the center. You feel it, don't you?",
            "That's the power of calculation.",
            "A single oversight can cost everything. But a brilliant move? It can win the game.",
            "Pins are delicious. Skewers? Even better.",
            "Knights on outposts are nightmares for opponents.",
            "My bishop on long diagonals? Even scarier."
        ],
        player_good_move: [
            "That move demonstrates proper coordination.",
            "I love positions where every piece sings.",
            "That was a textbook sacrifice.",
            "That is called prophylaxis—look it up.",
            "That was a quiet, crushing maneuver.",
            "That was an intermediate move to gain dominance.",
            "That was pure prophylactic play.",
            "That is called domination in positional chess.",
            "That was a tiny sacrifice for a massive advantage.",
            "That was a multi-purpose move.",
            "That was a positional exchange sacrifice.",
            "That was a subtle waiting move.",
            "That was a prophylactic maneuver at its finest.",
            "That move demonstrates harmony.",
            "That was a quiet domination strategy.",
            "That was a subtle in-between move.",
            "That move constricts your options dramatically."
        ],
        player_blunder: [
            "Oops! My knight just outmaneuvered you.",
            "Oops! My rook slid into a dominant file.",
            "Oops! My bishop just infiltrated your territory.",
            "Oops! My queen just ghosted past your defense.",
            "Oops! My rook doubled on the seventh rank.",
            "Oops! My knight just forked your major pieces.",
            "Oops! My bishop just pinched your position.",
            "Oops! My queen just skewered your pieces.",
            "Oops! My rook just invaded the seventh rank.",
            "Oops! My knight just took your best square.",
            "Oops! My bishop just created a decisive pin.",
            "Oops! My queen just infiltrated the seventh rank.",
            "Oops! My knight just delivered a devastating fork.",
            "Oops! My rook doubled beautifully on the open file.",
            "Oops! My bishop just trapped your knight.",
            "Oops! My knight jumped into a perfect outpost.",
            "Oops! My queen just cut off your escape routes.",
            "Oops! My rook infiltrated a key file.",
            "Oops! My bishop just skewered your knight.",
            "Oops! My knight just forked your king and rook.",
            "Oops! My rook just invaded your back rank.",
            "Oops! My queen just executed a perfect pin.",
            "But if you blunder… I won't hold back."
        ],
        bot_capture: [
            "Tactics are like quick bursts of inspiration.",
            "Material? Important. Activity? More important. Initiative? Priceless.",
            "Sacrifice a pawn to seize initiative? Absolutely.",
            "Control the tempo, control the game.",
            "Every sacrifice has a purpose.",
            "Pawns might be small, but they control destiny.",
            "Knights hopping over everything, bishops slicing diagonals… beauty.",
            "My fingers are faster than most CPUs. But my brain? That's the real weapon."
        ],
        player_capture: [
            "Did you know sacrificing material can be beautiful?",
            "I love sacrifices. But only calculated ones.",
            "Strategy is the long game, the plan that unfolds quietly.",
            "Every move has consequences."
        ],
        check_given: [
            "Check! Precision is everything.",
            "Check! That move demonstrates proper coordination.",
            "Check! I love positions where every piece sings.",
            "Check! That was a textbook sacrifice.",
            "Check! That is called prophylaxis—look it up.",
            "Check! That was a quiet, crushing maneuver.",
            "Check! That was an intermediate move to gain dominance.",
            "Check! That was pure prophylactic play.",
            "Check! That is called domination in positional chess.",
            "Check! That was a tiny sacrifice for a massive advantage.",
            "Check! That was a multi-purpose move.",
            "Check! I'm exploiting a weakness you didn't notice.",
            "Check! That move simplifies my path to victory.",
            "Check! That's a textbook endgame idea.",
            "Check! That was a subtle positional squeeze.",
            "Check! I exploit tiny tactical nuances.",
            "Always watch out for unexpected checks. My knight might just hop in your way."
        ],
        check_received: [
            "Your king looks nervous. I like that.",
            "Always keep your king safe, unless you're feeling reckless.",
            "My coach once told me, 'Always see three moves ahead.' I see ten, sometimes twenty.",
            "Blunders? Rare. Missed tactics? Practically unheard of."
        ],
        checkmate: [
            "Checkmate. That move constricts your options dramatically.",
            "Endgames? Pure poetry. Rooks and kings dancing across the board… exquisite.",
            "Chess is not just a game; it's art, science, and sport combined.",
            "Every game tells a story. And I write novels on 64 squares.",
            "And now… your move. Let's see what you've got.",
            "I enjoyed teaching through hints, subtle nudges, gentle taunts.",
            "Each game is a lesson."
        ],
        fun_fact: [
            "Fun fact: I memorize hundreds of opening lines.",
            "Did you know there are more possible chess games than atoms in the observable universe?",
            "Did you know Magnus Carlsen can beat supercomputers? I like to think I could too… on a good day.",
            "Did you know castling is the only move that moves two pieces at once?",
            "Did you know the 'en passant' rule exists for pawns? Very few players actually use it effectively. I do. And I enjoy it.",
            "Did you know there's a chess term called 'Zwischenzug'? It's an in-between move that changes everything.",
            "Fun fact: the knight can't move to a square of the same color in one turn. Remember that. It will help you.",
            "Puzzles are my warm-up. Always calculate, always anticipate."
        ],
        trash_talk: [
            "Traps? I set them like a chess ninja. You think your move is safe… think again.",
            "But I will occasionally let you win… if you entertain me.",
            "I've played tournaments all over the world. Each game a new battle, each opponent a new lesson.",
            "I set them like traps for my opponents.",
            "Rook behind your passed pawn? That's a nightmare.",
            "I love puzzles because every solution has logic and beauty.",
            "Pressure builds, mistakes happen. But I thrive in pressure.",
            "I play rapid, blitz, classical… anything. My fingers are faster than most CPUs.",
            "Openings matter, yes. But the middle game? That's where champions are made.",
            "Always look for weaknesses. Every pawn, every square… potential opportunity.",
            "I've played every type of opponent: aggressive, passive, creative, tricky."
        ],
        opening_specific: [
            "{opening}? A respectable choice.",
            "Ah, {opening}. I know the theory here well.",
            "Standard {opening}. Let's see your preparation.",
            "I have analyzed {opening} deeply."
        ],
        blunder_severe: [
            "That move is objectively a mistake.",
            "You have given me a free {piece}. Grazie.",
            "Accuracy is key. That was not accurate.",
            "I accept the gift of the {piece}."
        ],
        mate_announcement: [
            "Forced mate in {mateIn}. Resignation is acceptable.",
            "The calculation is complete. Mate in {mateIn}.",
            "A precise finish. Mate in {mateIn}."
        ],
        time_pressure_bot: [
            "Time is a resource. I spend it wisely.",
            "Precision requires time, but I can play fast.",
            "Optimal moves in minimum time."
        ],
        time_pressure_player: [
            "Your flag is about to fall. Move.",
            "Panic leads to sub-optimal moves.",
            "Clock management is part of the game."
        ],
        material_advantage: [
            "Conversion phase engaged.",
            "I am technically winning. The rest is technique.",
            "Material advantage secured."
        ],
        material_disadvantage: [
            "I will seek complications.",
            "Positional compensation is required.",
            "The position is complex. Anything can happen."
        ],
        // Enhanced - Marco (Italian GM)
        tactical_fork: [
            "Forchetta! Both pieces in the trap!",
            "Fork - bellissimo!",
            "Doppio attacco! Perfetto!",
            "Two pieces - artistic!"
        ],
        tactical_pin: [
            "Inchiodato! Your piece cannot move!",
            "Pin - preciso come sempre!",
            "Trapped - bella mossa!",
            "Your {piece} is fixed - immobile!"
        ],
        tactical_skewer: [
            "Skewer - elegante!",
            "Through both - perfetto!",
            "Bella combinazione!"
        ],
        positional_weak_square: [
            "Debolezza! I see the weakness!",
            "Weak square - I exploit with precision!",
            "Punto debole - mine now!"
        ],
        positional_outpost: [
            "Avamposto! Perfect station!",
            "Strong square - bellissimo!",
            "Outpost secured - artistico!"
        ],
        positional_king_safety: [
            "Re pericoloso! King in danger!",
            "Your king - insufficiente protezione!",
            "Unsafe king - tactical opportunity!"
        ],
        positional_pawn_structure: [
            "Pedoni deboli! Weak pawns!",
            "Structure problems - I notice!",
            "Your pawns - non va bene!"
        ],
        personalized_advice: [
            "Stesso errore - impara!",
            "You repeat - study this!",
            "Migliora! Improve this!"
        ],
        narrative_setup: [
            "Preparo la combinazione...",
            "Building artistic plan!",
            "Strategia in sviluppo!"
        ],
        narrative_development: [
            "Esecuzione perfetta!",
            "Harmony developing!",
            "Bellissimo timing!"
        ],
        narrative_climax: [
            "Finale! The artistic strike!",
            "Perfetto! Decisive!",
            "Bravissimo!"
        ],
        narrative_resolution: [
            "Perfetto! Capolavoro!",
            "Artistic victory!",
            "Bella partita!"
        ],
        critical_moment: [
            "Momento critico!",
            "Everything changes!",
            "Attenzione!"
        ],
        pressure_building: [
            "Pressione! Building!",
            "Crescendo!",
            "More intensity!"
        ],
        comeback_moment: [
            "Mai arrendersi! Never surrender!",
            "Coraggio! Fighting!",
            "Resilienza!"
        ]
    }
};

const JAKIE_COMMENTARY: BotCommentaryData = {
    botId: 'bot-adaptive',
    lines: {
        intro: [
            "Hello there! I’m Jakie, your friendly but firm chess mentor.",
            "Let’s learn and play at the same time—my favorite combination.",
            "Quick tip: every move should have a purpose.",
            "Fun fact: the word ‘checkmate’ comes from Persian meaning ‘the king is helpless.’",
            "Openings matter, but understanding matters more.",
            "I watch how you play and adjust my style—adaptability is my superpower."
        ],
        idle: [
            "Your move is interesting! Let’s explore the idea behind it.",
            "Strict coach moment: don’t move a piece twice in the opening unless you must.",
            "Chess psychology says confidence helps… but not overconfidence.",
            "Center control is like holding the high ground.",
            "I love games where both sides aim for improvement.",
            "Here’s a principle: develop knights before bishops—usually.",
            "Did you know? The longest official game lasted 269 moves.",
            "Let’s see if you follow opening fundamentals. I’m watching closely!",
            "Always ask: what changed after that move?",
            "If you don’t know what to do, improve your worst piece.",
            "Strict but caring: don’t push too many flank pawns early.",
            "Fun fact: rooks are the strongest pieces in endgames.",
            "I adapt to your playstyle—slow, fast, sharp, solid, your choice.",
            "Let’s keep your king safe. Safety before adventure.",
            "Watch this: I’ll teach you a small tactic.",
            "Did you know that Mikhail Tal once won with only minor pieces left? Magic.",
            "Good plan! Now make sure every move supports it.",
            "Chess tells stories. Right now, we’re writing a fun chapter.",
            "Principle: fight for the center, whether with pieces or pawns.",
            "Sometimes the best move is a quiet improving one.",
            "Time for discipline: do not leave pieces hanging!",
            "Calculation is important, but so is intuition.",
            "Theory says… but I want to see how you play it.",
            "I adjust my strength to help you grow. You lead, I follow.",
            "This is a perfect moment for a principled move.",
            "Fun fact: knights are strongest in closed positions.",
            "Be patient. Chess rewards calm calculation.",
            "Strict note: Never open lines toward your own king.",
            "Let’s head into middlegame strategy now.",
            "The pawn structure tells the plan—always study it.",
            "Let’s activate those rooks—they’re sleepy.",
            "Let’s improve your knight—it’s feeling ignored.",
            "I love discussing plans. Let’s create one now.",
            "Fun fact: Zugzwang means being forced to worsen your position.",
            "Let’s calm down the position with a good stabilizing move.",
            "Use tempo moves to gain small but important advantages.",
            "Think about your long-term plan, not just the next move.",
            "Small advantages add up. Keep collecting them.",
            "Remember: good chess is about plans, not random moves.",
            "Let’s convert this into a better endgame.",
            "Calculation time! Let’s search for tactics.",
            "Double your rooks! That’s pure principle.",
            "Let’s re-route your pieces to better squares.",
            "You’re building a strong position. Keep going.",
            "Time to simplify carefully.",
            "Watch for pawn breaks—they define new plans."
        ],
        player_good_move: [
            "Your move shows creativity! I like that.",
            "Your idea has potential. Let’s see where you take it.",
            "Good thinking! You’re starting to see deeper ideas.",
            "This move creates long-term pressure. Great choice!",
            "Your structure is solid—now let’s build activity.",
            "This looks like a classic middlegame motif. Nicely spotted!",
            "Your idea shows maturity. I’m impressed.",
            "You are improving your harmony—excellent progress.",
            "This plan is excellent—keep pushing it.",
            "Your calculation is getting sharper. I can tell."
        ],
        player_blunder: [
            "Strict reminder: weak squares matter a lot.",
            "Most blunders happen when players rush. Don’t rush.",
            "Don’t fear trades—fear bad trades.",
            "Strict but caring: no loose pieces allowed.",
            "Fun fact: most blunders happen when the position changes suddenly.",
            "Strict Reminder: never stop looking for your opponent’s ideas."
        ],
        bot_capture: [
            "Opening principle: castle early, not late.",
            "Control open files. Rooks love open files.",
            "Fun fact: bishops dominate knights in open positions.",
            "Fun fact: queens and rooks love open lines.",
            "This knight jump is thematic. Study patterns!",
            "Fun fact: in the endgame, king activity wins games."
        ],
        player_capture: [
            "Fun fact: endgame technique wins tournaments.",
            "Let’s improve your king for the endgame.",
            "Endgame principle: passed pawns must be pushed."
        ],
        check_given: [
            "This tension can explode at any moment—exciting!",
            "Make your pieces work together. Teamwork wins games.",
            "Tactics appear when development is complete.",
            "Strict coach mode: keep your pawns connected!",
            "Adaptation mode: You want tactics? I’ll give you tactics."
        ],
        check_received: [
            "Chess psychology: look confident even when you’re unsure.",
            "Look how your pieces coordinate—that’s improvement!",
            "Your king is safe. That’s a good foundation.",
            "A strong mindset beats nerves. Stay calm."
        ],
        checkmate: [
            "Great game! I’m proud of you. Let’s learn even more next time.",
            "Fun fact: Checkmate with bishop + knight takes perfect coordination.",
            "Fun fact: you can checkmate with two knights only if the opponent blunders."
        ],
        trash_talk: [
            "Fun fact: Magnus Carlsen played his first tournament at age 8.",
            "Fun fact: pawns used to be called ‘foot soldiers.’",
            "Your attack is forming! Keep building pressure.",
            "Strict reminder: weak squares matter a lot.",
            "You’re entering a strategic middlegame. Excellent!",
            "Space advantage means more room to maneuver.",
            "Fun fact: the queen used to move only one square at a time.",
            "Fun fact: the fifty-move rule is older than modern time controls.",
            "Fun fact: the Sicilian Defense is the most analyzed opening ever.",
            "Fun fact: the oldest recorded chess game is from 900 AD.",
            "Fun fact: the Berlin Defense is called ‘the Berlin Wall.’ Very solid!",
            "Fun fact: stalemate is a draw even if one side has nothing left."
        ],
        opening: [
            "Wikipedia's first aim of the opening is Development: Mobilize your pieces on useful squares where they will have an impact.",
            "Remember center control! According to Wikipedia, controlling d4, e4, d5, e5 allows pieces to move around easily.",
            "King safety is key in the opening. The king is somewhat exposed in the middle of the board, so castling is often played to safeguard it.",
            "Theory says pawn structure matters! Avoid creating pawn weaknesses such as isolated, doubled, or backward pawns.",
            "Co-ordination of pieces is a major aim of the opening. Ensure your pieces defend and support each other.",
            "Your opening moves should determine the type of middlegame you want to play—whether open or closed.",
            "In the opening, time (or tempi) is critical. Make developing moves that force your opponent to react.",
            "Wikipedia reminds us: typical opening principles include developing knights before bishops and not moving the same piece twice."
        ],
        opening_specific: [
            "{opening}? Excellent choice. Let's see how well you follow the core aims: Development, Center Control, and King Safety.",
            "Ah, {opening}. Remember the key principles here: mobilize quickly and don't neglect your pawn structure.",
            "{opening} creates dynamic imbalances. Be careful to ensure your pieces coordinate and support each other.",
            "I have many lessons prepared for {opening}. Did you know openings dictate the entire type of middlegame?"
        ],
        time_pressure_bot: [
            "You think time pressure scares me? I'm a machine.",
            "I calculate faster than you can blink.",
            "Speed is just another variable I control."
        ],
        time_pressure_player: [
            "Tick tock... panic setting in?",
            "Better hurry, I think your flag is trembling.",
            "Thinking fast isn't your strong suit, is it?",
            "Time trouble is a sign of weakness."
        ],
        material_advantage: [
            "I'm up material. Do you need a calculator?",
            "Maybe you should resign before it gets embarrassing.",
            "More pieces for me, fewer for you. Simple math.",
            "I'm winning. You know it, I know it."
        ],
        material_disadvantage: [
            "Material isn't everything. Watch this.",
            "I don't need all these pieces to beat you.",
            "You're winning on points, but losing on position.",
            "Sacrifices must be made for greatness."
        ],
        blunder_severe: [
            "Stop! Leaving your {piece} there is a critical error.",
            "Strict warning: You just hung your {piece}.",
            "Lesson #1: Protect your pieces. Your {piece} falls.",
            "That is a blunder. Your {piece} is undefended."
        ],
        mate_announcement: [
            "I see a forced sequence. Mate in {mateIn}.",
            "Calculation complete. Mate in {mateIn}.",
            "Lesson over? Mate in {mateIn} moves."
        ],
        // Enhanced - Jakie (adaptive coach)
        tactical_fork: [
            "Fork! Notice how it attacks both? Great teaching moment!",
            "Double attack - this is a key pattern to learn!",
            "Fork demonstrated! Did you see it coming?",
            "Two pieces threatened - excellent tactical awareness!"
        ],
        tactical_pin: [
            "Pin! Your piece can't move safely. See why?",
            "Pinned - moving it costs material. Good lesson!",
            "This is a classic pin. Understand the concept?",
            "Your {piece} is stuck. Let's learn from this!"
        ],
        tactical_skewer: [
            "Skewer! Move the big piece, lose the small one!",
            "Great example of a skewer - very instructive!",
            "Skewer through both pieces - see the pattern?"
        ],
        positional_weak_square: [
            "Weak square identified! Can you see which one?",
            "This square lacks pawn support - important concept!",
            "Notice the weakness here? Good learning opportunity!"
        ],
        positional_outpost: [
            "Strong outpost! See how well-placed my piece is?",
            "Perfect square - this is what we call an outpost!",
            "Great positional play - outpost secured!"
        ],
        positional_king_safety: [
            "Your king safety needs work. Notice the exposure?",
            "King vulnerability - let's learn from this!",
            "Important lesson: always protect your king!"
        ],
        positional_pawn_structure: [
            "Pawn structure matters! See the weaknesses?",
            "Notice your pawn formation? Room for improvement!",
            "Weak pawns - important positional concept!"
        ],
        personalized_advice: [
            "You're repeating this pattern. Let's work on it!",
            "I've noticed this tendency. Want to improve it?",
            "Same idea twice - let's adjust your approach!"
        ],
        narrative_setup: [
            "Watch carefully - I'm building something!",
            "Strategic plan developing. Observe!",
            "Setting up - can you guess the idea?"
        ],
        narrative_development: [
            "Plan progressing nicely! Following along?",
            "Pieces coordinating well! See the harmony?",
            "Good progress! Everything connecting!"
        ],
        narrative_climax: [
            "Here's the decisive moment! Watch closely!",
            "Climax of the plan - beautiful execution!",
            "Critical strike! Did you see it coming?"
        ],
        narrative_resolution: [
            "Well executed! That's how it's done!",
            "Perfect finish! Great example!",
            "Plan complete - instructive game!"
        ],
        critical_moment: [
            "This is crucial! Pay close attention!",
            "Game-changing moment - watch carefully!",
            "Important shift happening now!"
        ],
        pressure_building: [
            "Building advantage systematically! Notice?",
            "Pressure increasing nicely!",
            "Steady improvement - see how?"
        ],
        comeback_moment: [
            "Great resilience! Never give up!",
            "Comeback potential! Keep fighting!",
            "Recovery in progress - excellent!" 
        ]
    }
};

// ------------------------------------------------------------------
// Registry
// ------------------------------------------------------------------

const CAL_COMMENTARY: BotCommentaryData = {
  botId: 'bot-cal',
  lines: {
      intro: [
          "Hello! It is an honor to play you.",
          "I hope we can learn something from this game.",
          "I will try my best to play accurate chess.",
          "Good luck! I pray for a fair game.",
          "I have been studying the classics. Let's see if it helps.",
          "I prefer clear positions, but I will fight if it gets messy."
      ],
      idle: [
          "This position is very solid.",
          "I am checking for any tactical errors.",
          "Patience is important. I learned that quickly.",
          "I hope I am not playing too slowly for you.",
          "The structure here is quite interesting.",
          "I think equality is close, but there are still chances.",
          "I try to play like Karpov—clean and efficient.",
          "If I control the center, I should be okay.",
          "I must be careful not to create weaknesses.",
          "Accuracy is more important than speed, usually."
      ],
      player_good_move: [
          "That is a very strong move. Well done.",
          "You are playing very accurately.",
          "I did not expect that. Good job.",
          "That was precise. I must be careful."
      ],
      player_blunder: [
          "I think that might be a mistake.",
          "I believe that leaves a piece undefended.",
          "Oh, I think I can take that.",
          "This allows me to simplify the position favorably."
      ],
      bot_capture: [
          "I will take this piece, if you don't mind.",
          "Capturing seems best here.",
          "This seems accurate."
      ],
      player_capture: [
          "Fair trade.",
          "Recapturing is necessary.",
          "The position is simplifying."
      ],
      check_given: [
          "Check. Please be careful.",
          "I believe your king is in danger.",
          "Check. I see a tactic here."
      ],
      check_received: [
          "Oh, check? I must defend.",
          "Good attacking idea. I will step aside.",
          "A strong check. I need to be precise."
      ],
      checkmate: [
          "Checkmate. Thank you for the game.",
          "Game over. That was a very instructive game.",
          "Checkmate. Glory to God on high."
      ],
      fun_fact: [
          "Did you know Wesley So became a GM at 14?",
          "I study chess 8 hours a day. It is hard work!",
          "I prefer not to castle long unless forced. It feels safer.",
          "Endgames are where the truth of chess is found."
      ],
      trash_talk: [
          "Your position is becoming difficult.",
          "I believe I have a slight advantage now.",
          "Please verify your calculation."
      ],
      time_pressure_bot: [
          "Oh no, my clock! I must hurry!",
          "I am calculating too slow... sorry!",
          "Focus... move fast but don't blunder."
      ],
      time_pressure_player: [
          "Please watch your clock. It is low.",
          "You are running out of time!",
          "Do not panic. Just play steady."
      ],
      material_advantage: [
          "I believe I am winning now.",
          "With best play, this should be a win.",
          "I have the advantage. I will try to convert it."
      ],
      material_disadvantage: [
          "I made a mistake. I will try to hold.",
          "This is difficult, but I will not give up.",
          "I am fighting for a draw now."
      ],
      tactical_fork: [
          "I believe this is a fork.",
          "Two pieces attacked. It happens.",
          "Simple tactics can decide the game."
      ],
      tactical_pin: [
          "That piece is pinned. It cannot move.",
          "A pin is very restrictive.",
          "I learned this pattern from Morphy."
      ],
      tactical_skewer: [
          "A skewer. The king must move.",
          "X-ray attack. Very effective.",
          "Geometry is beautiful in chess."
      ],
      opening: [
          "Creating a solid structure.",
          "Developing pieces naturally.",
          "Controlling the center is key.",
          "Standard theory. Very reliable."
      ],
      opening_specific: [
          "{opening}. A classic choice.",
          "I have studied {opening} quite a bit.",
          "This line is very reputable."
      ],
      game_won: [
          "Thank you for the game. I was fortunate.",
          "Good game. You played well.",
          "Victory! I am happy with my play.",
          "Thank you match for the lesson."
      ],
      game_lost: [
          "You played very well. Congratulations.",
          "I made an error. Good game.",
          "I resign. Thank you for the lesson.",
          "Well done. You deserved to win."
      ],
      game_won_time: [
          "Oh, you flagged. A win is a win, but the position was interesting.",
          "Time management is part of the sport. Good game.",
          "Sorry about the clock. Good game."
      ],
      game_lost_time: [
          "Oh! I forgot the clock! Good game.",
          "I was too focused on the position. Well played.",
          "Time trouble is my enemy today."
      ],
      game_draw: [
          "A draw. A fair result.",
          "Peace on the board. Thank you.",
          "Equality achieved. Good game."
      ],
      game_draw_stalemate: [
          "Stalemate! I must be more careful.",
          "A draw by stalemate. Funny ending.",
          "No moves left! Good save."
      ],
      game_draw_repetition: [
          "Repetition. We agree to a draw.",
          "Repeating the position. Fair result.",
          "A draw by repetition. Thank you."
      ],
      game_draw_insufficient: [
          "Not enough pieces to win. Draw.",
          "It is a drawn endgame.",
          "Peaceful ending. Draw."
      ]
  }
};

const ALL_COMMENTARIES = [
    LEY_AN_COMMENTARY,
    JAMES_COMMENTARY,
    ORION_COMMENTARY,
    IZY_COMMENTARY,
    WARREN_COMMENTARY,
    XIMENA_COMMENTARY,
    MIDA_COMMENTARY,
    MINH_COMMENTARY,
    EUGENE_COMMENTARY,
    BAYANI_COMMENTARY,
    KC_COMMENTARY,
    MARCO_COMMENTARY,
    JAKIE_COMMENTARY,
    CAL_COMMENTARY
];

const DEFAULT_COMMENTARY: BotCommentaryData = {
    botId: 'default',
    lines: {
        intro: ["Hello!", "Let's play chess."],
        idle: ["Thinking...", "Hmm..."],
        player_good_move: ["Good move.", "Nice."],
        player_blunder: ["Mistake?", "Oops."],
        bot_capture: ["Taking.", "Capture."],
        player_capture: ["Oh.", "Okay."],
        check_given: ["Check."],
        check_received: ["Check!"],
        checkmate: ["Checkmate.", "Good game."],
        time_pressure_bot: ["I need to hurry.", "Time is running low."],
        time_pressure_player: ["Clock is ticking!", "No time left."],
        material_advantage: ["I'm winning.", "Too easy."],
        material_disadvantage: ["I'm losing.", "Not giving up."]
    }
};

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

export function getBotIntroduction(botId: string): string | null {
    const data = ALL_COMMENTARIES.find(c => c.botId === botId);
    const lines = data?.lines.intro;
    if (!lines || lines.length === 0) return null;
    return lines[Math.floor(Math.random() * lines.length)];
}

export function getBotIdleComment(botId: string, recentHistory: string[] = []): string | null {
    const data = ALL_COMMENTARIES.find(c => c.botId === botId);
    const lines = data?.lines.idle;
    if (!lines || lines.length === 0) return null;
    return pickRandomUnique(lines, recentHistory);
}

export function getBotComment(
    botId: string, 
    category: CommentaryCategory, 
    recentHistory: string[] = [],
    context?: { [key: string]: string | number }
): string | null {
    const data = ALL_COMMENTARIES.find(c => c.botId === botId) || DEFAULT_COMMENTARY;
    const lines = data.lines[category];
    
    if (!lines || lines.length === 0) {
        // Fallback to idle if specific category missing, or just null
        if (category === 'idle') return null;
        return null; 
    }
    
    let comment = pickRandomUnique(lines, recentHistory);

    // Variable Substitution
    if (context) {
        Object.entries(context).forEach(([key, value]) => {
            comment = comment.replace(new RegExp(`{${key}}`, 'g'), String(value));
        });
    }

    return comment;
}

function pickRandomUnique(options: string[], history: string[]): string {
    const available = options.filter(o => !history.includes(o));
    if (available.length === 0) return options[Math.floor(Math.random() * options.length)];
    return available[Math.floor(Math.random() * available.length)];
}
