/**
 * Enhanced Commentary Lines for All Bots
 * To be integrated into bot-commentary.ts
 * Each bot maintains their unique personality
 */

// JAMES (Blitz player - speed, chaos, quick tactics)
const JAMES_ENHANCED = {
    tactical_fork: [
        "Lightning fork! Got both your pieces!",
        "Quick fork - did you see that coming?",
        "Fork in a flash! Blitz tactics baby!",
        "Two pieces, one move. Classic blitz."
    ],
    tactical_pin: [
        "Pinned! That piece can't move without disaster!",
        "Quick pin - your piece is frozen!",
        "Pin and win! Speed chess 101!",
        "That piece is stuck... tick tock!"
    ],
    tactical_skewer: [
        "Skewer! Move fast or lose both!",
        "Quick skewer through your pieces!",
        "Run or lose! Your choice, but hurry!"
    ],
    positional_weak_square: [
        "That weak square is mine  now!",
        "Speed invasion on that weak spot!",
        "Quick control of your weak squares!"
    ],
    positional_outpost: [
        "Perfect outpost for fast attacks!",
        "My piece owns this square now!",
        "Outpost secured. Attack incoming!"
    ],
    positional_king_safety: [
        "Your king looks exposed. Fast mate incoming?",
        "King safety? What's that? Attack time!",
        "Unsafe king in blitz = game over soon!"
    ],
    positional_pawn_structure: [
        "Weak pawns in blitz? Fatal!",
        "Those pawn weaknesses won't last long!",
        "Pawn structure collapse in 3... 2... 1..."
    ],
    personalized_advice: [
        "You're rushing! Even in blitz, think first!",
        "Same mistake again! Slow down just a bit!",
        "Quick tip: Check before you click!"
    ],
    narrative_setup: [
        "Setting up something fast...",
        "Quick build-up starting now!",
        "Watch this speed combo develop..."
    ],
    narrative_development: [
        "Attack accelerating!",
        "Faster and faster!",
        "Momentum building quick!"
    ],
    narrative_climax: [
        "Strike now! Full speed!",
        "Here's the knockout punch!",
        "Game over in seconds!"
    ],
    narrative_resolution: [
        "Too fast for you!",
        "Lightning wins again!",
        "Speed beats everything!"
    ],
    critical_moment: [
        "Whoa! Game changer in a flash!",
        "Big swing! Did you blink?",
        "Everything just changed!"
    ],
    pressure_building: [
        "Turning up the speed!",
        "Faster...faster... pressure!",
        "Quick jabs building to knockout!"
    ],
    comeback_moment: [
        "Quick comeback! Never count me out!",
        "Fastest turnaround you'll see!",
        "Speed recovery in action!"
    ]
};

// ORION (Basketball player - sports analogies, teamwork)
const ORION_ENHANCED = {
    tactical_fork: [
        "Double team! My {piece} attacks both!",
        "Fork like a pick-and-roll!",
        "Two-for-one deal! Got both your pieces!",
        "That's a basketball fork - both sides covered!"
    ],
    tactical_pin: [
        "Your {piece} is boxed in! Can't move!",
        "Pin like a defensive trap!",
        "Trapped in the paint! Your piece can't escape!",
        "That's defensive domination!"
    ],
    tactical_skewer: [
        "Drive through! Skewer like a fast break!",
        "Move your star player, lose the bench!",
        "Skewer right through your defense!"
    ],
    positional_weak_square: [
        "That square is wide open! Like an unguarded lane!",
        "Weak spot in your defense! I'm attacking!",
        "Open court on that weak square!"
    ],
    positional_outpost: [
        "My {piece} owns the paint now!",
        "Perfect position - like controlling the key!",
        "Outpost secured. Dominating from here!"
    ],
    positional_king_safety: [
        "Your king's defense is weak! Time to attack!",
        "No protection in the paint for your king!",
        "King exposed like a bad defensive rotation!"
    ],
    positional_pawn_structure: [
        "Your pawn formation is broken! Weak defense!",
        "Bad spacing on those pawns!",
        "Pawn structure like a broken zone defense!"
    ],
    personalized_advice: [
        "You're making the same defensive mistake! Adjust!",
        "Coach says: learn from your errors!",
        "Practice your fundamentals more!"
    ],
    narrative_setup: [
        "Setting up the play...",
        "Running the set offense!",
        "Building the game plan..."
    ],
    narrative_development: [
        "Play developing!",
        "Moving pieces like running plays!",
        "Offense flowing now!"
    ],
    narrative_climax: [
        "Going for the slam dunk!",
        "Final play! Game winner!",
        "Buzzer-beater time!"
    ],
    narrative_resolution: [
        "Perfect execution! Game!",
        "That's how you run a play!",
        "Victory! Teamwork wins!"
    ],
    critical_moment: [
        "Game-changing play!",
        "This is THE moment!",
        "Championship point!"
    ],
    pressure_building: [
        "Full-court press!",
        "Turning up the defensive intensity!",
        "Pressure defense activating!"
    ],
    comeback_moment: [
        "Comeback! Never give up!",
        "Down but not out - rally time!",
        "Second-half surge!"
    ]
};

// IZY (Quiet, thoughtful, strategic)
const IZY_ENHANCED = {
    tactical_fork: [
        "Quietly forking both pieces...",
        "A sneaky fork. Did you notice?",
        "Two pieces trapped by one quiet move.",
        "Forks work best when unexpected."
    ],
    tactical_pin: [
        "Your piece is pinned... silently trapped.",
        "A quiet pin. Moving costs you dearly.",
        "Subtle but effective pinning.",
        "Pinned without you noticing."
    ],
    tactical_skewer: [
        "Skewer through your pieces... quietly devastating.",
        "Move...and lose. A silent skewer.",
        "Sometimes quiet moves are the strongest."
    ],
    positional_weak_square: [
        "I see a weak square... I'll use it quietly.",
        "That square can't be defended. Noted.",
        "Weak squares tell quiet stories."
    ],
    positional_outpost: [
        "A perfect quiet outpost for my {piece}.",
        "This square is mine now. Silently strong.",
        "Outposts are power... if you see them."
    ],
    positional_king_safety: [
        "Your king feels... unsafe.",
        "King safety is important. Yours is lacking.",
        "I notice your king's vulnerability."
    ],
    positional_pawn_structure: [
        "Your pawns have quiet weaknesses.",
        "Pawn structure... it whispers secrets.",
        "I see the flaws in your pawn chain."
    ],
    personalized_advice: [
        "You repeat this mistake... quietly fix it.",
        "Slow down. Think deeper.",
        "Patterns emerge when you observe carefully."
    ],
    narrative_setup: [
        "Planning quietly...",
        "Pieces moving into position... silently.",
        "A quiet plan taking shape..."
    ],
    narrative_development: [
        "The plan unfolds...",
        "Quietly building strength...",
        "Patience... it's working..."
    ],
    narrative_climax: [
        "Now. The quiet moment strikes.",
        "Everything in place. Decisive.",
        "Silent power unleashed."
    ],
    narrative_resolution: [
        "Quietly won.",
        "The plan succeeded... as planned.",
        "Silence can be powerful."
    ],
    critical_moment: [
        "Something important just happened...",
        "The game shifted... did you feel it?",
        "A quiet turning point."
    ],
    pressure_building: [
        "Slowly...quietly...pressure grows.",
        "Silent pressure mounting.",
        "Piece by piece, building advantage."
    ],
   comeback_moment: [
        "Quietly recovering...",
        "Patience brings comebacks.",
        "Never underestimate quiet determination."
    ]
};

// WARREN (NASA engineer - science, physics, space)
const WARREN_ENHANCED = {
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
        "Mission analysis: improve your systematically!"
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
    ]
};

// Add similar blocks for remaining bots...
// (Mida, Minh, Eugene, Bayani, KC, Marco, Jakie, etc.)

export {};
