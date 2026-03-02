import { LessonNode } from '../lesson-types';

export const WORLD_1_MINIGAMES: LessonNode[] = [
{
        id: 'w1-minigame-squares',
        title: 'Mini-Game: Name the Square',
        description: 'Tap the squares! 15 quick challenges.',
        icon: 'Target',
        track: 'world-1',
        order: 1.5,
        type: 'minigame',
        prerequisiteIds: ['w1-l1-battlefield'],
        xpReward: 50,
        imageUrl: "/minigame_name_the_square_1767230369760.png",
        category: "Mini-Game",
        pages: [
            { type: 'text', header: 'Rules & Goal', text: 'Time to practice! Tap the square I name. Be quick! 🎯', style: 'fun-fact' }
            // Dynamic pages generated in LessonPlayer
        ]
    },

{
    id: "w2-pawn-wars-king",
    title: "Mini-Game: Pawn Wars - Royal Edition",
    description: "Battle with pawns while kings stay put. Advance, capture, and promote to win!",
    icon: "ChessPawn",
    track: "world-1",
    order: 4,
    type: "minigame",
    prerequisiteIds: ["w2-l1-pawn"],
    xpReward: 250,
    imageUrl: "/minigame_pawn_wars_royal_1767230382421.png",
    category: "Mini-Game",
    opponent: {
        type: "AI",
        engine: "Stockfish",
        level: 1
    },
    rules: [
        "Both sides have kings on their original squares (e1 and e8).",
        "Kings are immovable to maintain chess legality.",
        "Only pawns can move, capture, and promote.",
        "Goal: capture opponent pawns or promote first."
    ],
    fenStart: "4k3/pppppppp/8/8/8/8/PPPPPPPP/4K3 w - - 0 1",
    victoryConditions: [
        "Promote at least one pawn to a Queen.",
        "Capture all enemy pawns."
    ],
    defeatConditions: [
        "All your pawns are captured.",
        "Opponent promotes a pawn first."
    ],
    pages: [
        // Rules
        {
            type: "text",
            header: "Rules & Goal",
            text: "Welcome to Pawn Wars! The rules are simple:\n1. Kings don't move.\n2. Only pawns fight.\n3. Win by promoting a pawn or capturing all enemy pawns.\n\nGood luck!",
            style: "fun-fact"
        },
        // Play as White
        {
            type: "challenge",
            text: "Can you beat Buddy in Pawn Wars?",
            fen: "4k3/pppppppp/8/8/8/8/PPPPPPPP/4K3 w - - 0 1",
            playVsBot: true,
            orientation: "white",
            successText: "You won as White! Now try Black.",
            hints: ["Control the center.", "Create a passed pawn."],
            lockedSquares: ["e1", "e8"],
            aiOpponent: { botId: 'bot-novice', engine: "Stockfish" } // James
        },
        // Play as Black
        {
            type: "challenge",
            text: "Play as Black! Can you win from the other side?",
            fen: "4k3/pppppppp/8/8/8/8/PPPPPPPP/4K3 w - - 0 1",
            playVsBot: true,
            orientation: "black",
            successText: "Pawn Wars Champion!",
            hints: ["Don't let White breakthrough.", "Coordinate your pawns."],
            lockedSquares: ["e1", "e8"],
            aiOpponent: { botId: 'bot-novice', engine: "Stockfish" } // James
        }
    ]
},

{
    id: "w3-farmer-piggies-dual",
    title: "Mini-Game: Old Louis vs. The Piggies",
    description: "Play as Old Louis (Black King) or the Piggies (White Pawns)! Catch or escape while Stockfish Level 1 controls the opponent.",
    icon: "Crown",
    track: "world-1",
    order: 5,
    type: "minigame",
    prerequisiteIds: ["w3-king-complete", "w2-l1-pawn"],
    imageUrl: "/minigame_farmer_old_louis_piggies_1767230395849.png",
    category: "Mini-Game",
    xpReward: 300,
    modes: [
        {
            name: "Old Louis",
            player: "black",
            opponent: "white",
            objective: "Catch all Piggies before any reach rank 8."
        },
        {
            name: "Piggies",
            player: "white",
            opponent: "black",
            objective: "Move pawns to rank 8 without being captured by Old Louis."
        }
    ],
    rules: [
        "Only the player’s pieces move directly under player control.",
        "Stockfish Level 1 controls the opponent’s pieces automatically.",
        "Kings are placed in standard positions for chess legality.",
        "Kings remain immovable if they are not controlled by the player.",
        "Capture the pawns or escape them depending on mode."
    ],
    fenStart: "4k3/PPPPPPPP/8/8/8/8/8/4K3 b - - 0 1",
    victoryConditions: [
        "Old Louis: capture all pawns before any reach rank 8.",
        "Piggies: at least one pawn reaches rank 8."
    ],
    defeatConditions: [
        "Old Louis: any pawn reaches rank 8.",
        "Piggies: all pawns are captured."
    ],
    pages: [
        {
            type: "text",
            header: "Rules & Goal",
            text: "Farmer Old Louis (White King) must capture all 8 Piggies (Black Pawns) before they reach the fence at Rank 1!",
            style: "fun-fact"
        },
        {
            type: "challenge",
            text: "Catch all 8 Piggies before they reach the fence!",
            fen: "4k3/pppppppp/8/8/8/8/8/4K3 w - - 0 1",
            playVsBot: true,
            orientation: "white",
            aiOpponent: {
                engine: "Stockfish",
                level: 1
            },
            lockedSquares: ["e8"],
            hiddenPieces: [{ piece: "k", square: "e8", visible: false }],
            successText: "You caught all the Piggies!",
        },
        // Play as Piggies
        {
            type: "challenge",
            text: "Now play as the Piggies! Reach the other side (Rank 8) before Old Louis catches you.",
            fen: "4k3/8/8/8/8/8/PPPPPPPP/4K3 w - - 0 1",
            playVsBot: true,
            orientation: "white",
            aiOpponent: {
                engine: "Stockfish",
                level: 1
            },
            lockedSquares: ["e1"],
            hiddenPieces: [{ piece: "K", square: "e1", visible: false }],
            successText: "You escaped! The Piggies are safe.",
            hints: ["Spread out your pawns.", "Sacrifice one piggy to let others through."]
        }
    ]
},

{
    id: "w4-knight-tour",
    title: "Knight Tour Challenge",
    description: "Visit as many squares as possible without repeating! Click to move.",
    icon: "ChessKnight",
    track: "world-1",
    order: 7,
    type: "minigame",
    prerequisiteIds: ["w4-knight-mastery"],
    xpReward: 200,
    imageUrl: "/knight_tour.png",
    rules: [
        "Visit as many squares as possible.",
        "You cannot land on the same square twice.",
        "Game over if you get stuck!",
        "Score = Unique squares visited."
    ],
    fenStart: "4k3/8/8/8/3N4/8/8/4K3 w - - 0 1",
    pages: [
        // 1. Introduction Card
        {
            type: "text",
            header: "How to Play",
            text: "Welcome to the Knight Tour!\n\n1. Move the Knight to any highlighted green square.\n2. Every square you visit turns purple.\n3. You CANNOT move back to a purple square.\n4. Keep moving until you are trapped!\n\nHow many squares can you visit?",
            style: "fun-fact"
        },
        // 2. Game Board Card
        {
            type: "board",
            text: "Go! Visit as many unique squares as you can.",
            fen: "4k3/8/8/8/3N4/8/8/4K3 w - - 0 1",
            interactive: true,
            playerPiece: "N"
        }
    ]
},

{
    id: "w4-farmer-piggies-dogs",
    title: "Mini-Game: Old Louis & the Shepherd Dogs",
    description: "Old Louis has two loyal Shepherd Dogs (Knights) to help catch the runaway Piggies (pawns)! Work together to bring them home.",
    icon: "ChessKnight",
    track: "world-1",
    order: 8,
    type: "minigame",
    prerequisiteIds: ["w4-knight-mastery"],
    imageUrl: "/minigame_shepherd_dogs_knights_1767230409574.png",
    category: "Mini-Game",
    xpReward: 300,
    rules: [
        "Player controls Old Louis (White King) and two Shepherd Dogs (Knights).",
        "Black Piggies (pawns) automatically advance toward Rank 1 each turn.",
        "Capture all Piggies before any reach the fence (Rank 1).",
        "Knights move in L-shapes; King moves one square in any direction."
    ],
    fenStart: "4k3/pppppppp/8/8/8/8/8/1N2K1N1 w - - 0 1",
    victoryConditions: [
        "All Piggies captured before any reach Rank 1."
    ],
    defeatConditions: [
        "Any Piggy reaches Rank 1."
    ],
    pages: [
        {
            type: "text",
            header: "Rules & Goal",
            text: "The Piggies have escaped! Old Louis has his loyal Shepherd Dogs (Knights) to help. Work as a team to bring all the Piggies home before they reach the fence!",
            style: "fun-fact"
        },
        {
            type: "challenge",
            text: "Catch all 8 Piggies! Use your Knights (b1, g1) and Old Louis (e1) to stop them before Rank 1.",
            fen: "4k3/pppppppp/8/8/8/8/8/1N2K1N1 w - - 0 1",
            playVsBot: true,
            orientation: "white",
            aiOpponent: {
                engine: "Stockfish",
                level: 1
            },
            lockedSquares: ["e8"],
            hiddenPieces: [{ piece: "k", square: "e8", visible: false }],
            successText: "Victory! The Dogs caught all the Piggies.",
            hints: [
                "Use the Knights to jump ahead and intercept pawns.",
                "Position Old Louis to block escape routes."
            ]
        }
    ]
},

{
    id: "w5-bishop-tour",
    title: "The Safe Bishop",
    description: "Control two Bishops on a randomized board. Capture all enemy pieces without leaving your Bishops in danger!",
    icon: "ChessBishop",
    track: "world-1",
    order: 10,
    type: "minigame",
    prerequisiteIds: ["w5-bishop-mastery"],
    xpReward: 200,
    imageUrl: "/bishop_tour_challenge_1767284115257.png", // Keep or update? Keep for now.
    rules: [
        "You control two White Bishops.",
        "Move either Bishop to capture Black pieces.",
        "SAFETY FIRST: Never end your turn on a square attacked by an enemy.",
        "The game ends if you make an unsafe move (Loss) or capture all enemies (Win)."
    ],
    fenStart: "4k3/8/8/8/3B4/8/8/4K3 w - - 0 1", // Will be overridden by random gen
    pages: [
        // Intro with image
        {
            type: "text",
            text: "Control two Bishops on a randomized board. Capture all enemy pieces without leaving your Bishops in danger!",
            style: "fun-fact"
        },
        // Minigame Active
        {
            type: "board",
            text: "Capture all enemy pieces to win! Don't let your Bishops get captured.",
            fen: "4k3/8/8/8/3B4/8/8/4K3 w - - 0 1", // Placeholder, overridden by code
            interactive: true
        }
    ]
},

{
    id: "w6-farmer-piggies-bishops",
    title: "Mini-Game: Old Louis & the Farm Hands",
    description: "Old Louis has recruited John and Jane (Bishops) to help catch the runaway Piggies (pawns)! Work together to stop them before they reach the fence (Rank 1)!",
    icon: "ChessKing",
    track: "world-1",
    order: 11,
    type: "minigame",
    prerequisiteIds: ["w5-bishop-mastery"],
    imageUrl: "/minigame_farm_hands_bishops_hands_1767230423068.png",
    category: "Mini-Game",
    xpReward: 400,
    rules: [
        "Player controls Old Louis (White King) and two farm hands (Bishops).",
        "Black pawns (Piggies) automatically advance toward Rank 1 each turn.",
        "Capture all Piggies before any reach the fence (Rank 1).",
        "Bishops move diagonally as far as they want without jumping."
    ],
    fenStart: "4k3/pppppppp/8/8/8/8/8/2B1KB2 w - - 0 1",
    victoryConditions: [
        "All Piggies captured before any reach Rank 1."
    ],
    defeatConditions: [
        "Any Piggy reaches Rank 1."
    ],
    pages: [
        {
            type: "text",
            header: "Rules & Goal",
            text: "The Piggies are running wild! Old Louis now has help from John and Jane, two clever farm hands who move along diagonals (Bishops). Use teamwork to catch all the Piggies!",
            style: "fun-fact"
        },
        {
            type: "challenge",
            text: "Use Old Louis and the Farm Hands (Bishops) to intercept the Piggies before they reach Rank 1!",
            fen: "4k3/pppppppp/8/8/8/8/8/2B1KB2 w - - 0 1",
            playVsBot: true,
            orientation: "white",
            aiOpponent: {
                engine: "Stockfish",
                level: 1
            },
            lockedSquares: ["e8"],
            hiddenPieces: [{ piece: "k", square: "e8", visible: false }],
            successText: "Great teamwork! All Piggies captured.",
            hints: [
                "Bishops can cover long diagonals instantly.",
                "Position the King to block pawns on opposite color squares."
            ]
        }
    ]
},

{
    id: "w7-rook-maze",
    title: "Rook Capture Challenge",
    description: "Control a rook to capture spawning pieces! Choose your time control and maximize your efficiency.",
    icon: "ChessRook",
    track: "world-1",
    order: 13,
    type: "minigame",
    prerequisiteIds: ["w6-rook-mastery"],
    xpReward: 300,
    imageUrl: "/rook_maze_challenge_1767284144124.png",
    rules: [
        "Control a White Rook to capture Black pieces.",
        "After each capture, a new piece spawns on a random square.",
        "Choose your time control: 1 minute, 2 minutes, or unlimited.",
        "Score = Total Moves ÷ Pieces Captured (lower is better!).",
        "Beat your high score!"
    ],
    fenStart: "4k3/8/8/8/8/8/8/R3K3 w - - 0 1", // Will be overridden by generateRookMazeBoard()
    pages: [
        // Intro
        {
            type: "text",
            header: "Rook Capture Challenge",
            text: "Control a Rook to capture as many pieces as possible! After each capture, a new piece appears. Plan your moves efficiently!",
            style: "fun-fact"
        },
        // Game Board
        {
            type: "board",
            text: "Capture pieces efficiently! After each capture, a new piece spawns. Your score = Moves ÷ Captures (lower is better!).",
            fen: "4k3/8/8/8/8/8/8/R3K3 w - - 0 1", // Placeholder, will be replaced by generateRookMazeBoard()
            interactive: true
        }
    ]
},

{
    id: "w8-farmer-piggies-tractors",
    title: "Mini-Game: Old Louis & the Tractors",
    description: "Old Louis now has his powerful tractors (Rooks) to help catch the runaway piggies. Use them to control the fields and block every escape!",
    icon: "ChessRook",
    track: "world-1",
    order: 14,
    type: "minigame",
    prerequisiteIds: ["w6-rook-mastery"],
    imageUrl: "/minigame_tractors_rooks_tractors_2_1767230478607.png",
    category: "Mini-Game",
    xpReward: 400,
    rules: [
        "Player controls Old Louis (White King) and two Tractors (Rooks).",
        "Black Piggies (pawns) automatically advance toward Rank 1 each turn.",
        "Capture all Piggies before any reach the fence (Rank 1).",
        "Rooks move vertically or horizontally any number of squares."
    ],
    fenStart: "4k3/pppppppp/8/8/8/8/8/R3K2R w - - 0 1",
    victoryConditions: [
        "All Piggies captured before any reach Rank 1."
    ],
    defeatConditions: [
        "Any Piggy reaches Rank 1."
    ],
    pages: [
        {
            type: "text",
            header: "Rules & Goal",
            text: "The Piggies are getting faster! Old Louis brings in his mighty Tractors (Rooks) to control the fields. Use them to block his way and catch them all!",
            style: "fun-fact"
        },
        {
            type: "challenge",
            text: "Use Old Louis and the Tractors (a1, h1) to catch all the Piggies!",
            fen: "4k3/pppppppp/8/8/8/8/8/R3K2R w - - 0 1",
            playVsBot: true,
            orientation: "white",
            aiOpponent: {
                engine: "Stockfish",
                botId: "bot-supergm",
                level: 1,
                immovablePieces: ["e8"]
            },
            lockedSquares: ["e8"],
            hiddenPieces: [{ piece: "k", square: "e8", visible: false }],
            successText: "The fields are safe! Piggies Caught: 8/8",
            hints: [
                "Rooks can control entire rows or columns at once.",
                "Position the Tractors to create a wall the Piggies can't cross."
            ]
        }
    ]
},

{
    id: "w10-queens-quest",
    title: "Mini-Game: Queen's Quest",
    description: "Guide the Queen to capture all targets (pawns or bishops) in the fewest moves possible. Use her full power along ranks, files, and diagonals!",
    icon: "ChessQueen",
    track: "world-1",
    order: 16,
    type: "minigame",
    prerequisiteIds: ["w9-queen-mastery"],
    imageUrl: "/minigame_queens_quest_target_hunt_1767230530215.png",
    category: "Mini-Game",
    xpReward: 400,
    rules: [
        "Player controls only the Queen.",
        "Objective: capture all 8 targets placed randomly (pawns or bishops).",
        "Queen moves along ranks, files, or diagonals any number of squares, as long as no pieces block her path.",
        "Track number of moves used to complete the quest.",
        "Score = 50 - (moves × 2).",
        "Bonus: +10 points if all targets are captured in under 15 moves."
    ],
    fenStart: "8/8/8/3Q4/8/8/8/8 w - - 0 1",
    pages: [
        // Intro
        {
            type: "text",
            header: "Rules & Goal",
            text: "The Queen sets out on her quest! Capture pieces efficiently. After each capture, a new piece spawns. Your score = Moves ÷ Captures (lower is better!)",
            style: "fun-fact"
        },
        // Main Game
        {
            type: "board",
            text: "Capture pieces efficiently! After each capture, a new piece spawns.",
            fen: "random-targets",
            interactive: true
        }
    ]
},

{
    id: "w12-farmer-piggies-lucille",
    title: "Mini-Game: Old Louis & Madame Lucille",
    description: "Old Louis teams up with his wife, Madame Lucille (Queen), to catch the runaway Piggies. Can you trap all the Piggies before they reach the fence?",
    icon: "ChessQueen",
    track: "world-1",
    order: 17,
    type: "minigame",
    prerequisiteIds: ["w9-queen-mastery"],
    imageUrl: "/minigame_madame_lucille_queen_3_1767230502287.png",
    category: "Mini-Game",
    xpReward: 450,
    rules: [
        "Player controls Old Louis (White King) and his wife Lucille (Queen).",
        "Black Piggies (pawns) automatically advance toward Rank 1 each turn.",
        "Capture all Piggies before any reach the fence (Rank 1).",
        "Lucille (Queen) moves along ranks, files, or diagonals any number of squares."
    ],
    fenStart: "4k3/pppppppp/8/8/8/8/8/3QK3 w - - 0 1",
    victoryConditions: [
        "All Piggies captured before any reach Rank 1."
    ],
    defeatConditions: [
        "Any Piggy reaches Rank 1."
    ],
    pages: [
        {
            type: "text",
            header: "Rules & Goal",
            text: "The Piggies are running at top speed! Old Louis has asked his wife Madame Lucille (the Queen) to join the hunt. Lucille is the fastest on the farm!",
            style: "fun-fact"
        },
        {
            type: "challenge",
            text: "Use Old Louis and Lucille (d1) to stop the Piggy stampede!",
            fen: "4k3/pppppppp/8/8/8/8/8/3QK3 w - - 0 1",
            playVsBot: true,
            orientation: "white",
            aiOpponent: {
                engine: "Stockfish",
                level: 1
            },
            lockedSquares: ["e8"],
            hiddenPieces: [{ piece: "k", square: "e8", visible: false }],
            successText: "Incredible teamwork! Louis and Lucille have caught every last Piggy.",
            hints: [
                "The Queen combines the power of the Rook and Bishop.",
                "Louis can block pawns while Lucille sweeps the board."
            ]
        }
    ]
},

{
        id: "mg-king-rook-rook-vs-king",
        title: "Mini-Game: KRR vs K",
        description: "Practice checkmating the lone king using two rooks. Coordinate carefully to trap the enemy king.",
        icon: "ChessRook",
        track: "world-1",
        order: 21,
        type: "minigame",
        prerequisiteIds: ["w15-winning-the-game"],
        imageUrl: "/minigame_mate_practice_rooks_final_1767230583908.png",
        category: "Mini-Game",
        xpReward: 200,
        rules: [
            "Player controls King + 2 Rooks.",
            "Opponent is a lone King controlled by Stockfish (level max).",
            "Deliver checkmate in as few moves as possible."
        ],
        fenStart: "4k3/8/8/8/8/8/6K1/R6R w - - 0 1",
        victoryConditions: ["Checkmate the black king."],
        defeatConditions: ["None; AI cannot win."],
        pages: [
            {
                type: "text",
                header: "Rules & Goal",
                text: "Practice checkmating the lone king using two rooks. Coordinate carefully to trap the enemy king.",
                style: "fun-fact"
            },
            {
                type: "board",
                text: "Use your two rooks to trap the enemy king. Remember: coordinate ranks and files.",
                fen: "4k3/8/8/8/8/8/6K1/R6R w - - 0 1",
                interactive: true,
                playerPieces: ["K","R","R"],
                playVsBot: true,
                aiOpponent: { engine: "stockfish", level: 20, color: "black" }
            }
        ]
    },

{
        id: "mg-king-rook-vs-king",
        title: "Mini-Game: KR vs K",
        description: "Practice checkmating the lone king with one rook and your king.",
        icon: "ChessRook",
        track: "world-1",
        order: 22,
        type: "minigame",
        prerequisiteIds: ["w15-winning-the-game"],
        imageUrl: "/minigame_mate_practice_rooks_final_1767230583908.png",
        category: "Mini-Game",
        xpReward: 150,
        rules: [
            "Player controls King + Rook.",
            "Opponent is a lone King controlled by Stockfish (level max).",
            "Deliver checkmate in as few moves as possible."
        ],
        fenStart: "4k3/8/8/8/8/8/6K1/6R1 w - - 0 1",
        victoryConditions: ["Checkmate the black king."],
        defeatConditions: ["None; AI cannot win."],
        pages: [
            {
                type: "text",
                header: "Rules & Goal",
                text: "Practice checkmating the lone king with one rook and your king.",
                style: "fun-fact"
            },
            {
                type: "board",
                text: "Use your king and rook together to trap the enemy king. Keep your king close to restrict movement.",
                fen: "4k3/8/8/8/8/8/6K1/6R1 w - - 0 1",
                interactive: true,
                playerPieces: ["K","R"],
                playVsBot: true,
                aiOpponent: { engine: "stockfish", level: 20, color: "black" }
            }
        ]
    },

{
        id: "mg-king-queen-vs-king",
        title: "Mini-Game: KQ vs K",
        description: "Practice checkmating the lone king with your queen and king.",
        icon: "ChessQueen",
        track: "world-1",
        order: 23,
        type: "minigame",
        prerequisiteIds: ["w15-winning-the-game"],
        imageUrl: "/minigame_mate_practice_queen_1767230566980.png",
        category: "Mini-Game",
        xpReward: 180,
        rules: [
            "Player controls King + Queen.",
            "Opponent is a lone King controlled by Stockfish (level max).",
            "Deliver checkmate in as few moves as possible."
        ],
        fenStart: "4k3/8/8/8/8/8/6K1/6Q1 w - - 0 1",
        victoryConditions: ["Checkmate the black king."],
        defeatConditions: ["None; AI cannot win."],
        pages: [
            {
                type: "text",
                header: "Rules & Goal",
                text: "Practice checkmating the lone king with your queen and king.",
                style: "fun-fact"
            },
            {
                type: "board",
                text: "Use your queen to control space and your king to support. Deliver checkmate efficiently.",
                fen: "4k3/8/8/8/8/8/6K1/6Q1 w - - 0 1",
                interactive: true,
                playerPieces: ["K","Q"],
                playVsBot: true,
                aiOpponent: { engine: "stockfish", level: 20, color: "black" }
            }
        ]
    }
];
