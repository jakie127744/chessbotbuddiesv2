import { LessonNode } from '../lesson-types';

export const WORLD_2_CONCEPTS: LessonNode[] = [
    // Lesson 1: Speak the Language (Notation)
    {
        id: 'w2-l1-notation',
        title: 'Level 1: Speak the Language',
        description: 'Learn to read and write chess moves. This is the secret code of chess masters!',
        icon: 'BookOpen',
        track: 'world-2',
        order: 1,
        type: 'concept',
        prerequisiteIds: ['w15-winning-the-game'], // Assumes World 1 is done
        xpReward: 200,
        imageUrl: '/concept_notation.png',
        pages: [
            {
                type: 'text',
                header: 'The Chess Grid',
                text: 'Every square on the chessboard has a name. We use this "address" to describe moves.',
                style: 'fun-fact'
            },
            {
                type: 'board',
                text: 'The board has "Files" (columns) lettered a-h, and "Ranks" (rows) numbered 1-8.',
                fen: '8/8/8/8/8/8/8/8 w - - 0 1',
                customHighlights: [
                    { squares: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'], color: 'rgba(59, 130, 246, 0.4)', label: 'A-File' },
                    { squares: ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'], color: 'rgba(34, 197, 94, 0.4)', label: '1st Rank' }
                ]
            },
            {
                type: 'challenge',
                text: 'Find the square e4! Click on it.',
                fen: '8/8/8/8/8/8/8/8 w - - 0 1',
                goals: ['e4'],
                successText: 'Correct! e4 is a very important square in the center.',
                hints: ['Look for file "e" and rank "4".']
            },
            {
                type: 'board',
                text: 'We write moves by combining the Piece + the Square. "Re1" means Rook to e1. "Nf3" means Knight to f3.',
                fen: 'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 1',
                arrows: [{ from: 'g1', to: 'f3', color: 'blue' }]
            },
            {
                type: 'quiz',
                text: 'How would you write "Bishop to c4"?',
                fen: 'rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2',
                answers: [
                    { text: 'Bc4', correct: true },
                    { text: 'c4', correct: false },
                    { text: 'Bishop 4', correct: false }
                ],
                successText: 'Correct! B for Bishop, then the square c4.'
            }
        ]
    },

// Lesson 2: The Fork (Tactics)
    {
        id: 'w2-l2-fork',
        title: 'Level 2: The Fork',
        description: 'Attack two pieces at once! Double the trouble for your opponent.',
        icon: 'Swords',
        track: 'world-2',
        order: 2,
        type: 'concept', // Using 'concept' type but filling with challenges
        prerequisiteIds: ['w2-l1-notation'],
        xpReward: 300,
        imageUrl: '/concept_fork.png',
        pages: [
            {
                type: 'text',
                header: 'Double Attack!',
                text: 'A "Fork" is when one of your pieces attacks two opponent pieces at the same time. The opponent can usually save only one of them!',
                style: 'important'
            },
            {
                type: 'board',
                text: 'Here, the White Knight attacks both the Black King and the Black Queen. Black MUST save the King, losing the Queen!',
                fen: '8/5q2/6k1/4N3/2Q5/8/8/6K1 w - - 0 1',
                customHighlights: [
                    { squares: ['e5'], color: 'rgba(59, 130, 246, 0.6)', label: 'Forking Knight' },
                    { squares: ['g6', 'f7'], color: 'rgba(239, 68, 68, 0.6)', label: 'Targets' }
                ],
                arrows: [{ from: 'e5', to: 'g6', color: 'red' }, { from: 'e5', to: 'f7', color: 'red' }]
            },
            {
                type: 'challenge',
                text: 'Find the Fork! Move the Knight to attack the King and the Rook at once.',
                fen: 'r3k3/8/8/3N4/8/8/8/6K1 w q - 0 1',
                sequential: true,
                solution: ['Nc7+', 'Kd7', 'Nxa8'],
                hints: ['Look for a square where the Knight attacks both the King and the Rook.']
            },

            {
                type: 'challenge',
                text: 'The Queen can fork too! Deliver check and attack the Bishop.',
                fen: '6k1/8/8/2b5/8/8/8/3Q3K w - - 0 1',
                sequential: true,
                solution: ['Qd5+', 'Kh7', 'Qxc5'],
                hints: ['Find a square that aligns diagonally with the King and horizontally with the Bishop.']
            }
        ]
    },
    {
        id: "w2-minigame-fork",
        title: "Minigame: Fork Frenzy",
        description: "Test your skills! Can you spot all the Forks?",
        icon: "Target",
        track: "world-2",
        order: 2.5, 
        type: "minigame",
        prerequisiteIds: ["w2-l2-fork"],
        xpReward: 150,
        imageUrl: "/minigame_fork_frenzy.png",
        pages: [
            {
                type: "text",
                header: "Fork Frenzy",
                text: "Time for a challenge! Find as many Forks as you can before time runs out.",
                imageUrl: "/minigame_fork_frenzy.png",
                style: "important"
            },
            {
                type: "board",
                header: "Fork Frenzy",
                text: "Select your time control to begin!",
                fen: "8/5q2/6k1/8/2Q3N1/8/8/6K1 w - - 0 1",
                playerAction: "tactics-blitz" // Reusing the same action handler
            }
        ]
    },


    // Lesson 3: The Pin (Tactics)
    {
        id: 'w2-l3-pin',
        title: 'Level 3: The Pin',
        description: 'Freeze your opponent! A pinned piece cannot move.',
        icon: 'Anchor',
        track: 'world-2',
        order: 3,
        type: 'concept',
        prerequisiteIds: ['w2-l2-fork'],
        xpReward: 300,
        imageUrl: '/concept_pin.png',
        pages: [
            {
                type: 'text',
                header: 'Absolute Pin',
                text: 'An "Absolute Pin" is when a piece cannot move because it would expose the King to check. It is ILLEGAL to move it!',
                style: 'important'
            },
            {
                type: 'board',
                text: 'The Black Knight on e5 is pinned. It cannot move because the White Rook on e1 would be checking the King on e8!',
                // W B on c4. B N on d5. B K on e6? No. B K on e6 is light square.
                // B on c4 (light). B K on g8 (dark). No pin.
                // Let's simplify.
                // White Rook on e1. Black Knight on e5. Black King on e8.
                // Knight cannot move.
                fen: '4k3/8/8/4n3/8/8/8/4R1K1 w - - 0 1',
                arrows: [{ from: 'e1', to: 'e8', color: 'blue' }],
                customHighlights: [
                    { squares: ['e5'], color: 'rgba(239, 68, 68, 0.4)', label: 'Pinned!' }
                ]
            },
            {
                type: 'challenge',
                text: 'Win the Pinned Piece! The Black Knight cannot run away.',
                fen: '4k3/8/8/4n3/8/3P4/8/4R1K1 w - - 0 1',
                sequential: true,
                solution: ['d4', 'Kd7', 'dxe5'],
                successText: 'Correct! The Knight is pinned and cannot escape the Pawn.',
                hints: ['Attack the pinned piece with a pawn!']
            },
            {
                type: 'challenge',
                text: 'Create a Pin! Pin the Queen to the King.',
                fen: '8/1k6/8/3q4/8/3B1P2/8/6K1 w - - 0 1',
                sequential: true,
                solution: ['Be4', 'Kc6', 'Bxd5+'],
                successText: 'The Queen is pinned! If she moves, the King is in check.',
                hints: ['Move the Bishop to the same diagonal as the King and Queen.']
            }
        ]
    },
    {
        id: "w2-minigame-pin",
        title: "Minigame: Pin Peril",
        description: "Freeze! Identify the Pins and win material.",
        icon: "Anchor",
        track: "world-2",
        order: 3.5, 
        type: "minigame",
        prerequisiteIds: ["w2-l3-pin"],
        xpReward: 150,
        imageUrl: "/buddy-thinking.png",
        pages: [
            {
                type: "text",
                header: "Pin Peril",
                text: "Can you spot the pinned pieces? Prove your mastery!",
                imageUrl: "/buddy-thinking.png",
                style: "important"
            },
            {
                type: "board",
                header: "Pin Peril",
                text: "Select your time control!",
                fen: "4k3/8/8/4n3/8/8/8/4R1K1 w - - 0 1",
                playerAction: "tactics-blitz"
            }
        ]
    },

    // Lesson 4: The Skewer (Tactics)
    {
        id: 'w2-l4-skewer',
        title: 'Level 4: The Skewer',
        description: 'Attack the King to win the Queen behind him!',
        icon: 'Target',
        track: 'world-2',
        order: 4,
        type: 'concept',
        prerequisiteIds: ['w2-l3-pin'],
        xpReward: 300,
        imageUrl: '/concept_skewer.png',
        pages: [
            {
                type: 'text',
                header: 'The Skewer',
                text: 'A "Skewer" is like a reverse pin. You attack a valuable piece (like the King), forcing it to move away, leaving a target unprotected behind it!',
                style: 'important'
            },
            {
                type: 'challenge',
                text: 'Skewer the King to win the Queen!',
                fen: '4q3/8/4k3/8/8/8/8/6RK w - - 0 1',
                sequential: true,
                solution: ['Re1+', 'Kd7', 'Rxe8'],
                successText: 'Perfect! The King must move, and the Queen is yours.',
                hints: ['Check the King on the same file as the Queen.']
            },
            {
                type: 'challenge',
                text: 'Diagonal Skewer! Win the Rook.',
                fen: 'r7/8/2k5/8/8/3B4/8/6K1 w - - 0 1',
                sequential: true,
                solution: ['Be4+', 'Kb6', 'Bxa8'],
                successText: 'The King runs, and the Rook falls!',
                hints: ['Look for a check that attacks through the King to the corner.']
            }
        ]
    },


    {
        id: "w2-minigame-skewer",
        title: "Minigame: Skewer Snipe",
        description: "Laser focus! Skewer through the King.",
        icon: "Target",
        track: "world-2",
        order: 4.5, 
        type: "minigame",
        prerequisiteIds: ["w2-l4-skewer"],
        xpReward: 150,
        imageUrl: "/minigame_skewer_buddy.png",
        pages: [
            {
                type: "text",
                header: "Skewer Snipe",
                text: "Line them up! Find the Skewers before time runs out.",
                imageUrl: "/minigame_skewer_buddy.png",
                style: "important"
            },
            {
                type: "board",
                header: "Skewer Snipe",
                text: "Ready to snipe?",
                fen: "8/8/8/4k2R/8/8/4q3/6K1 w - - 0 1",
                playerAction: "tactics-blitz"
            }
        ]
    },


    // Lesson 5: Discovered Attack
    {
        id: 'w2-l5-discovered',
        title: 'Level 5: Discovered Attack',
        description: 'Move out of the way! Uncover a hidden attack from a piece behind.',
        icon: 'Eye',
        track: 'world-2',
        order: 5,
        type: 'concept',
        prerequisiteIds: ['w2-l4-skewer'],
        xpReward: 300,
        imageUrl: '/concept_discovered.png',
        pages: [
            {
                type: 'text',
                header: 'Hidden Surprise',
                text: 'A Discovered Attack happens when you move one piece, revealing an attack from another piece (like a Rook or Queen) standing behind it!',
                style: 'important'
            },
            {
                type: 'board',
                text: 'Watch out! If the White Bishop moves, the White Rook will attack the Black King!',
                fen: '4k3/8/8/4B3/8/8/8/4R1K1 w - - 0 1',
                customHighlights: [
                    { squares: ['e1'], color: 'rgba(59, 130, 246, 0.6)', label: 'Hidden Attacker' },
                    { squares: ['e5'], color: 'rgba(239, 68, 68, 0.6)', label: 'Masking Piece' }
                ],
                arrows: [{ from: 'e1', to: 'e8', color: 'blue' }]
            },
            {
                type: 'challenge',
                text: 'Discovered Check! Move the Bishop to check the King and win the Queen!',
                fen: '4k3/8/8/q3B3/8/8/8/4R1K1 w - - 0 1',
                sequential: true,
                solution: ['Bc3+', 'Kd8', 'Bxa5+'],
                successText: 'Check! The King must move, and your Bishop will take the Queen.',
                hints: ['Move the Bishop to check the King (with the Rook) AND attack the Queen.']
            }
        ]
    },
    {
        id: "w2-minigame-discovered",
        title: "Minigame: Discovery Dash",
        description: "Uncover hidden attacks! Speed is key.",
        icon: "Eye",
        track: "world-2",
        order: 5.5, 
        type: "minigame",
        prerequisiteIds: ["w2-l5-discovered"],
        xpReward: 150,
        imageUrl: "/minigame_discovery_dash.png",
        pages: [
            {
                type: "text",
                header: "Discovery Dash",
                text: "Reveal your power! Find Discovered Attacks before time runs out.",
                imageUrl: "/minigame_discovery_dash.png",
                style: "important"
            },
            {
                type: "board",
                header: "Discovery Dash",
                text: "Ready, Set, Go!",
                fen: "4k3/8/8/4B3/8/8/8/4R1K1 w - - 0 1",
                playerAction: "tactics-blitz"
            }
        ]
    },

    // Lesson 6: Double Attack
    {
        id: 'w2-l6-double-attack',
        title: 'Level 6: Double Attack',
        description: 'Two threats are better than one! Scare them everywhere.',
        icon: 'Zap',
        track: 'world-2',
        order: 6,
        type: 'concept',
        prerequisiteIds: ['w2-l5-discovered'],
        xpReward: 300,
        imageUrl: '/concept_double_attack.png',
        pages: [
            {
                type: 'text',
                header: 'Double Attack vs Fork',
                text: 'A Fork is one type of double attack (attacking two pieces). But you can also attack a piece AND threaten Checkmate at the same time!',
                style: 'important'
            },
            {
                type: 'challenge',
                text: 'Deliver a Double Checkmate! Use the Knight to discover check and attack.',
                // FEN provided by user: Double Check with N and B
                fen: '1kr4r/p1N1R1pp/1p3p2/8/1n3B2/2P3P1/PP3PBP/4R1K1 w - - 0 1',
                solution: ['Na6#'],
                successText: 'Checkmate! A double check forces the King to move, and here he has nowhere to go!',
                hints: ['Move the Knight to check the King AND reveal a check from the Bishop.']
            }
        ]
    },

    {
        id: "w2-minigame-double-attack",
        title: "Minigame: Dual Threats",
        description: "Double trouble! Threaten Mate + Win Material.",
        icon: "Zap",
        track: "world-2",
        order: 6.5, 
        type: "minigame",
        prerequisiteIds: ["w2-l6-double-attack"],
        xpReward: 150,
        imageUrl: "/minigame_double_attack_buddy.png",
        pages: [
            {
                type: "text",
                header: "Dual Threats",
                text: "Two threats, one move! Can you find them all?",
                imageUrl: "/minigame_double_attack_buddy.png",
                style: "important"
            },
            {
                type: "board",
                header: "Dual Threats",
                text: "Start the timer!",
                // FEN: Double Check setup. Nd6+ is double check.
                fen: "4k3/3p1p2/8/8/4N3/8/3PQ3/4K3 w - - 0 1",
                playerAction: "tactics-blitz"
            }
        ]
    },


    // Lesson 7: Removal of the Defender
    {
        id: 'w2-l7-remove-defender',
        title: 'Level 7: Remove the Defender',
        description: 'Destroy the guard! Take out the piece protecting your target.',
        icon: 'Trash',
        track: 'world-2',
        order: 7,
        type: 'concept',
        prerequisiteIds: ['w2-l6-double-attack'],
        xpReward: 300,
        imageUrl: '/concept_remove_defender.png',
        pages: [
            {
                type: 'text',
                header: 'The Bodyguard',
                text: 'Sometimes a piece is safe only because another piece is guarding it. If you get rid of the guard, the treasure is yours!',
                style: 'important'
            },
            {
                type: 'challenge',
                text: 'The Black Knight on f6 protects the Queen on d5. Remove the defender!',
                fen: "3r2k1/pp3ppp/5n2/3q2B1/8/8/6PP/3RR1K1 w - - 0 1",
                sequential: true,
                solution: ['Bxf6', 'gxf6', 'Rxd5'],
                successText: 'The guard is gone! Now the Queen is undefended.',
                hints: ['Capture the Knight that is holding everything together.']
            }
        ]
    },

    {
        id: "w2-minigame-remove-defender",
        title: "Minigame: Guard Breaker",
        description: "Smash the defense! Remove the defender to win.",
        icon: "Trash",
        track: "world-2",
        order: 7.5, 
        type: "minigame",
        prerequisiteIds: ["w2-l7-remove-defender"],
        xpReward: 150,
        imageUrl: "/minigame_remove_defender_buddy.png",
        pages: [
            {
                type: "text",
                header: "Guard Breaker",
                text: "Identify the guard and take them out!",
                imageUrl: "/minigame_remove_defender_buddy.png",
                style: "important"
            },
            {
                type: "board",
                header: "Guard Breaker",
                text: "Break the defense!",
                fen: "3r2k1/pp3ppp/5n2/3q2B1/8/8/6PP/3R2K1 w - - 0 1",
                playerAction: "tactics-blitz"
            }
        ]
    },


    // Lesson 8: Back Rank Mate
    {
        id: 'w2-l8-back-rank',
        title: 'Level 8: Back Rank Mate',
        description: 'Trap the King in his own castle! The Corridor Mate.',
        icon: 'ArrowUp',
        track: 'world-2',
        order: 8,
        type: 'concept',
        prerequisiteIds: ['w2-l7-remove-defender'],
        xpReward: 300,
        imageUrl: '/concept_back_rank.png',
        pages: [
            {
                type: 'text',
                header: 'The Corridor',
                text: 'If the opponent\'s King is stuck behind his own pawns, a single Rook can deliver Checkmate on the back row!',
                style: 'important'
            },
            {
                type: 'challenge',
                text: 'Deliver Back Rank Mate!',
                fen: '6k1/ppp2ppp/8/8/8/8/8/4R1K1 w - - 0 1',
                // W R e1. B K g8. Pawns f7 g7 h7.
                solution: ['Re8#'],
                successText: 'Checkmate! The King has no room to escape.',
                hints: ['Move the Rook to the back rank (rank 8).']
            }
        ]
    },

    {
        id: "w2-minigame-back-rank",
        title: "Minigame: Corridor Mate",
        description: "The classic finish! Mate on the back rank.",
        icon: "ArrowUp",
        track: "world-2",
        order: 8.5, 
        type: "minigame",
        prerequisiteIds: ["w2-l8-back-rank"],
        xpReward: 150,
        imageUrl: "/minigame_back_rank_buddy.png",
        pages: [
            {
                type: "text",
                header: "Corridor Mate",
                text: "Trap the King! Find the back rank mates.",
                imageUrl: "/minigame_back_rank_buddy.png",
                style: "important"
            },
            {
                type: "board",
                header: "Corridor Mate",
                text: "Checkmate!",
                fen: "6k1/ppp2ppp/8/8/8/8/8/4R1K1 w - - 0 1",
                playerAction: "tactics-blitz"
            }
        ]
    },


    // Lesson 9: Deflection
    {
        id: 'w2-l9-deflection',
        title: 'Level 9: Deflection',
        description: 'Force them away! Make a piece leave its post.',
        icon: 'Wind',
        track: 'world-2',
        order: 9,
        type: 'concept',
        prerequisiteIds: ['w2-l8-back-rank'],
        xpReward: 300,
        imageUrl: '/concept_deflection.png',
        pages: [
            {
                type: 'text',
                header: 'Deflection',
                text: 'Deflection is forcing an opponent\'s piece to move to a square where it stops checking or guarding something important.',
                style: 'important'
            },
            {
                type: 'challenge',
                text: 'The Black King protects the Queen. Deflect him away so you can take the Queen!',
                fen: '3qb3/4k3/4pp2/8/2P5/1P6/PB2P3/3RK3 w - - 0 1',
                sequential: true,
                solution: ['Ba3+', 'Kf7', 'Rxd8'],
                successText: 'The King must run, leaving the Queen behind!',
                hints: ['Check the King so he must step away from the Queen.']
            },
            {
                type: 'challenge',
                text: 'Another Deflection! Force the King into the corner.',
                fen: 'R2qk3/4pR2/3pP3/2pP4/8/2PP4/1P6/1K6 w - - 0 1',
                sequential: true,
                solution: ['Rf8+', 'Kxf8', 'Rxd8+'],
                successText: 'Correct! The King is forced to take, leaving the Queen undefined!',
                hints: ['Sacrifice the Rook to force the King away.']
            }
        ]
    },

    {
        id: "w2-minigame-deflection",
        title: "Minigame: Deflection Derby",
        description: "Force them away! A deflection ensures victory.",
        icon: "Wind",
        track: "world-2",
        order: 9.5, 
        type: "minigame",
        prerequisiteIds: ["w2-l9-deflection"],
        xpReward: 150,
        imageUrl: "/minigame_deflection_buddy.png",
        pages: [
            {
                type: "text",
                header: "Deflection Derby",
                text: "Push them specifically to squares they don't want to go!",
                imageUrl: "/minigame_deflection_buddy.png",
                style: "important"
            },
            {
                type: "board",
                header: "Deflection Derby",
                text: "Go!",
                fen: "3q4/4k3/8/8/8/1B6/8/3R2K1 w - - 0 1",
                playerAction: "tactics-blitz"
            }
        ]
    },


    // Lesson 10: Decoy
    {
        id: 'w2-l10-decoy',
        title: 'Level 10: Decoy',
        description: 'Lure them in! Bait a piece to a bad square.',
        icon: 'Fish',
        track: 'world-2',
        order: 10,
        type: 'concept',
        prerequisiteIds: ['w2-l9-deflection'],
        xpReward: 300,
        imageUrl: '/concept_decoy.png',
        pages: [
            {
                type: 'text',
                header: 'The Bait',
                text: 'A Decoy involves sacrificing a piece to force the opponent (usually the King) onto a square where they will be destroyed.',
                style: 'important'
            },
            {
                type: 'challenge',
                text: 'Lure the King into a Royal Fork! Sacrifice the Rook.',
                fen: '6k1/5pp1/3q4/6NR/8/8/PPP5/1K6 w - - 0 1',
                sequential: true,
                solution: ['Rh8+', 'Kxh8', 'Nxf7+', 'Kg8', 'Nxd6'],
                successText: 'They took the bait! The King was forced into the fork, and you won the Queen.',
                hints: ['Check with the Rook on h8 to force the King to the corner.']
            },
            {
                type: 'challenge',
                text: 'Another Decoy! Sacrifice the Rook to bait the King into a Knight Fork.',
                fen: '8/R4nk1/1pb5/p1p2p2/2P2Pp1/1P1N2P1/PK6/8 w - - 0 1',
                sequential: true,
                solution: ['Rxf7+', 'Kxf7', 'Ne5+', 'Ke6', 'Nxc6'],
                successText: 'Correct! The King is drawn to f7, where the Knight forks King and Bishop!',
                hints: ['Sacrifice the Rook to force the King to f7.']
            }
        ]
    },

    {
        id: "w2-minigame-decoy",
        title: "Minigame: Decoy Trap",
        description: "Lure the King to his doom!",
        icon: "Fish",
        track: "world-2",
        order: 10.5, 
        type: "minigame",
        prerequisiteIds: ["w2-l10-decoy"],
        xpReward: 150,
        imageUrl: "/minigame_decoy_buddy.png",
        pages: [
            {
                type: "text",
                header: "Decoy Trap",
                text: "Bait the hook! Sacrifice to win.",
                imageUrl: "/minigame_decoy_buddy.png",
                style: "important"
            },
            {
                type: "board",
                header: "Decoy Trap",
                text: "Set the trap!",
                fen: "6k1/6pp/8/4q1N1/8/7R/8/7K w - - 0 1",
                playerAction: "tactics-blitz"
            }
        ]
    },


    // Lesson 11: Overloading
    {
        id: 'w2-l11-overloading',
        title: 'Level 11: Overloading',
        description: 'Too much work! A piece can only do so many jobs.',
        icon: 'Activity',
        track: 'world-2',
        order: 11,
        type: 'concept',
        prerequisiteIds: ['w2-l10-decoy'],
        xpReward: 300,
        imageUrl: '/concept_overloading.png',
        pages: [
            {
                type: 'text',
                header: 'Overloading',
                text: 'A piece is overloaded when it is responsible for defending two (or more) critical threats. If forced to give up one duty, the other defense collapses.',
                style: 'important'
            },
            {
                type: 'board',
                header: 'Textbook Example',
                text: 'Look at the Black Queen on d8. She is guarding the Rook on g8 AND preventing Mate on f6. She is doing too much!',
                fen: 'r2q2rk/2R2p1p/p3pp2/P2b1N2/1ppQ4/6P1/1P3P1P/R5K1 w - - 0 1',
                customHighlights: [
                    { squares: ['d8'], color: 'rgba(239, 68, 68, 0.6)', label: 'Overloaded!' }, // Red for danger
                    { squares: ['f6', 'g8'], color: 'rgba(59, 130, 246, 0.4)', label: 'Targets' }
                ]
            },
            {
                type: 'board',
                header: 'Step 1: The Sacrifice',
                text: '1. Rd7! White attacks the Queen and threatens Mate on g7. The Queen MUST respond.',
                fen: 'r2q2rk/3R1p1p/p3pp2/P2b1N2/1ppQ4/6P1/1P3P1P/R5K1 b - - 1 1'
            },
            {
                type: 'board',
                header: 'Step 2: The Collapse',
                text: '1... Qxd7. Black captures, seemingly solving the problem. But now the Queen has abandoned f6!',
                fen: 'r5rk/3q1p1p/p3pp2/P2b1N2/1ppQ4/6P1/1P3P1P/R5K1 w - - 0 2'
            },
            {
                type: 'board',
                header: 'Step 3: The Invasion',
                text: '2. Qxf6+! The tactic reveals itself. The Queen could not protect both squares. Now it is forced.',
                fen: 'r5rk/3q1p1p/p3pQ2/P2b1N2/1pp5/6P1/1P3P1P/R5K1 b - - 1 2'
            },
            {
                type: 'board',
                header: 'Step 4: Checkmate',
                text: '3. Qxg7# Checkmate. The defense on g7 was lost because the defender was overloaded.',
                fen: 'r6k/3q1pQp/p3p3/P2b1N2/1pp5/6P1/1P3P1P/R5K1 b - - 0 3'
            },
            {
                type: 'challenge',
                text: 'Your Turn! The King is overloaded on g8. He defends h8 AND prevents queen checks. Force him to choose!',
                fen: 'r3r1k1/2p2p2/3p1P2/p2P2PR/3q1bP1/1p1B4/PP4Q1/1K1R4 w - - 0 1',
                sequential: true,
                solution: ['Rh8+', 'Kxh8', 'Qh3+', 'Kg8', 'Qh7+', 'Kf8', 'Qg7#'],
                successText: 'Correct! By forcing the King to h8, you removed his control of g8, leading to mate.',
                hints: ['Sacrifice on h8 to force the King to abandon his defensive post on g8.']
            }
        ]
    },
    {
        id: "w2-minigame-overloading",
        title: "Minigame: Overload Ops",
        description: "Stress test their defense! They can't hold everything.",
        icon: "Activity",
        track: "world-2",
        order: 11.5, 
        type: "minigame",
        prerequisiteIds: ["w2-l11-overloading"],
        xpReward: 150,
        imageUrl: "/minigame_overloading_buddy.png",
        pages: [
            {
                type: "text",
                header: "Overload Ops",
                text: "Too many jobs! Find the overloaded piece.",
                imageUrl: "/minigame_overloading_buddy.png",
                style: "important"
            },
            {
                type: "board",
                header: "Overload Ops",
                text: "Break the system!",
                fen: "r2q2rk/2R2p1p/p3pp2/P2b1N2/1ppQ4/6P1/1P3P1P/R5K1 w - - 0 1",
                playerAction: "tactics-blitz"
            }
        ]
    },
];
