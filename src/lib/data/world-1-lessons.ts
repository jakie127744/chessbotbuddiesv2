import { LessonNode } from '../lesson-types';

export const WORLD_1_CONCEPTS: LessonNode[] = [
{
      id: 'w1-l1-battlefield',
      title: 'Level 1: The Battlefield',
      description: 'Master the 64 squares.',
      icon: 'Map',
      track: 'world-1',
      order: 1,
      type: 'concept',
      xpReward: 100,
      imageUrl: "/concept_battlefield_intro_1767231602068.png",
      pages: [
        {
            type: 'intro',
            header: 'Welcome!',
            text: 'Welcome to the Battlefield, recruit! Before you can command an army, you must master the ground you stand on. The chessboard is your map to victory. By understanding the 64 squares intimately, you will learn to visualize the entire board in your mind, foresee enemy attacks before they happen, and coordinate your pieces with deadly precision.',
            style: 'fun-fact'
        },
        // Step 1: Definition of Ranks (Rows)
        {
          type: 'board',
          text: 'The battlefield is a grid. We navigate it using horizontal rows called RANKS. There are 8 ranks in total, numbered 1 at the bottom to 8 at the top.',
          fen: '8/8/8/8/8/8/8/8 w - - 0 1',
          // @ts-ignore
          arrows: [{ from: 'a1', to: 'h1', color: 'rgba(34, 197, 94, 0.8)' }],
          customHighlights: [{ squares: ['a1','b1','c1','d1','e1','f1','g1','h1'], color: 'rgba(34, 197, 94, 0.4)' }]
        },
        {
            type: 'challenge',
            prompt: 'Tap every square in the very first row (Rank 1).',
            text: 'Rank 1 is the White army\'s home base. Let\'s see if you can locate it.',
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            goals: ['a1','b1','c1','d1','e1','f1','g1','h1'],
            successText: 'Excellent base camp established.'
        },
        // Step 2: Definition of Files (Columns)
        {
            type: 'board',
            text: 'Vertical columns are called FILES. They are lettered from "a" on the far left to "h" on the far right.',
            fen: '8/8/8/8/8/8/8/8 w - - 0 1',
            // @ts-ignore
            arrows: [{ from: 'a1', to: 'a8', color: 'rgba(59, 130, 246, 0.8)' }],
            customHighlights: [{ squares: ['a1','a2','a3','a4','a5','a6','a7','a8'], color: 'rgba(59, 130, 246, 0.4)' }]
        },
        {
            type: 'challenge',
            prompt: 'Tap exactly every square on the a-file.',
            text: 'The a-file is the furthest left flank of the battlefield. Controlling an open file is often the key to crushing your opponent.',
            fen: '8/8/8/8/8/8/8/8 w - - 0 1',
            goals: ['a1','a2','a3','a4','a5','a6','a7','a8'],
            successText: 'You have command of the western flank.'
        },
        // Step 3: Light & Dark Pattern
        {
          type: 'challenge',
          prompt: 'Tap all the LIGHT squares on Rank 1 and Rank 2.',
          text: 'Notice how the ground alternates? The board is made of exactly 32 light and 32 dark squares. This camouflage is crucial for certain pieces like the Bishop.',
          fen: '8/8/8/8/8/8/8/8 w - - 0 1',
          goals: ['b1','d1','f1','h1', 'a2','c2','e2','g2'], 
          successText: 'Good eye. You see the pattern.',
          customHighlights: [{ squares: ['b1','d1','f1','h1','a2','c2','e2','g2'], color: 'rgba(255,255,255,0.1)' }]
        },
        // Step 3.5: Board Quadrants/Sides
        {
            type: 'board',
            text: 'The battlefield is split into territories. White\'s home territory is the bottom half of the board, made up of Ranks 1 through 4.',
            fen: '8/8/8/8/8/8/8/8 w - - 0 1',
            customHighlights: [{ squares: ['a1','b1','c1','d1','e1','f1','g1','h1','a2','b2','c2','d2','e2','f2','g2','h2','a3','b3','c3','d3','e3','f3','g3','h3','a4','b4','c4','d4','e4','f4','g4','h4'], color: 'rgba(34, 197, 94, 0.45)' }]
        },
        {
            type: 'board',
            text: 'Conversely, Black\'s territory commands the top half of the board, spanning Ranks 5 through 8. Pushing into enemy territory is dangerous but necessary.',
            fen: '8/8/8/8/8/8/8/8 w - - 0 1',
            customHighlights: [{ squares: ['a5','b5','c5','d5','e5','f5','g5','h5','a6','b6','c6','d6','e6','f6','g6','h6','a7','b7','c7','d7','e7','f7','g7','h7','a8','b8','c8','d8','e8','f8','g8','h8'], color: 'rgba(239, 68, 68, 0.45)' }]
        },
        {
            type: 'board',
            text: 'We also split the board vertically. The Queen Side is the left half (files a, b, c, and d), named because both Queens start on this side.',
            fen: '8/8/8/8/8/8/8/8 w - - 0 1',
            customHighlights: [{ squares: ['a1','a2','a3','a4','a5','a6','a7','a8','b1','b2','b3','b4','b5','b6','b7','b8','c1','c2','c3','c4','c5','c6','c7','c8','d1','d2','d3','d4','d5','d6','d7','d8'], color: 'rgba(236, 72, 153, 0.45)' }
            ]
        },
        {
            type: 'board',
            text: 'The King Side is the right half (files e, f, g, and h). This is typically where players evacuate their Kings for safety early in the game.',
            fen: '8/8/8/8/8/8/8/8 w - - 0 1',
            customHighlights: [{ squares: ['e1','e2','e3','e4','e5','e6','e7','e8','f1','f2','f3','f4','f5','f6','f7','f8','g1','g2','g3','g4','g5','g6','g7','g8','h1','h2','h3','h4','h5','h6','h7','h8'], color: 'rgba(59, 130, 246, 0.45)' }
            ]
        },
        {
            type: 'challenge',
            text: 'Initiate combat. Move any pawn on the Queen Side forward exactly one square.',
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            solution: ['a2a3', 'b2b3', 'c2c3', 'd2d3'], // Accept any queen side pawn move
            successText: 'Good! You are pushing the Queen Side flank.',
            customHighlights: [{ squares: ['a2','b2','c2','d2'], color: 'rgba(236, 72, 153, 0.4)' }]
        },
        {
            type: 'challenge',
            text: 'Move any pawn on the King Side forward one square.',
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            solution: ['e2e3', 'f2f3', 'g2g3', 'h2h3'], // Accept any king side pawn move
            successText: 'Great! That pawn is on the King Side.',
            customHighlights: [{ squares: ['e2','f2','g2','h2'], color: 'rgba(34, 197, 94, 0.4)' }]
        },
        // Step 4: Naming a Square
        {
            type: 'challenge',
            text: 'Every place has a name. Tap "e4".',
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            goals: ['e4'],
            successText: 'Correct. e-file, 4th rank.',
            customHighlights: [{ squares: ['e4'], color: 'rgba(34, 197, 94, 0.3)' }]
        },
        // Additional naming challenges
        {
            type: 'challenge',
            text: 'Now tap "d5".',
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            goals: ['d5'],
            successText: 'Perfect. d-file, 5th rank.',
            customHighlights: [{ squares: ['d5'], color: 'rgba(34, 197, 94, 0.3)' }]
        },
        {
            type: 'challenge',
            text: 'Find "f6".',
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            goals: ['f6'],
            successText: 'Good. f-file, 6th rank.',
            customHighlights: [{ squares: ['f6'], color: 'rgba(34, 197, 94, 0.3)' }]
        },
        {
            type: 'challenge',
            text: 'Where is "h3"?',
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            goals: ['h3'],
            successText: 'Exactly. h-file, 3rd rank.',
            customHighlights: [{ squares: ['h3'], color: 'rgba(34, 197, 94, 0.3)' }]
        },
        {
            type: 'challenge',
            text: 'Last one - tap "a7".',
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            goals: ['a7'],
            successText: 'Excellent. a-file, 7th rank.',
            customHighlights: [{ squares: ['a7'], color: 'rgba(34, 197, 94, 0.4)' }]
        },
        // Step 6: Micro Quiz
        {
            type: 'quiz',
            text: 'Which name belongs to the highlighted square?',
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 
            customHighlights: [{ squares: ['c4'], color: 'rgba(34, 197, 94, 0.3)' }],
            answers: [
                { text: 'c3', correct: false },
                { text: 'd3', correct: false },
                { text: 'c4', correct: true },
                { text: 'e5', correct: false }
            ],
            successText: 'Yes. c4.',
        },
        // Additional quizzes
        {
            type: 'quiz',
            text: 'What is this square called?',
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            customHighlights: [{ squares: ['g5'], color: 'rgba(34, 197, 94, 0.3)' }],
            answers: [
                { text: 'g4', correct: false },
                { text: 'f5', correct: false },
                { text: 'g5', correct: true },
                { text: 'h5', correct: false }
            ],
            successText: 'Correct! g5.',
        },
        {
            type: 'quiz',
            text: 'Which square is highlighted?',
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            customHighlights: [{ squares: ['b2'], color: 'rgba(34, 197, 94, 0.3)' }],
            answers: [
                { text: 'a2', correct: false },
                { text: 'b2', correct: true },
                { text: 'b1', correct: false },
                { text: 'c2', correct: false }
            ],
            successText: 'Right! b2.',
        },
        {
            type: 'quiz',
            text: 'Name this square:',
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            customHighlights: [{ squares: ['f7'], color: 'rgba(34, 197, 94, 0.3)' }],
            answers: [
                { text: 'e7', correct: false },
                { text: 'f6', correct: false },
                { text: 'f7', correct: true },
                { text: 'g7', correct: false }
            ],
            successText: 'Perfect! f7.',
        },
        {
            type: 'quiz',
            text: 'Final quiz - which square?',
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            customHighlights: [{ squares: ['h8'], color: 'rgba(34, 197, 94, 0.3)' }],
            answers: [
                { text: 'h7', correct: false },
                { text: 'g8', correct: false },
                { text: 'h8', correct: true },
                { text: 'a8', correct: false }
            ],
            successText: 'Excellent! h8.',
        },
        // Step 7: Application
        {
            type: 'challenge',
            text: 'Last test: Drag the Knight to f3.',
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Starting position
            solution: ['g1f3'], // Only Knight to f3
            successText: 'Level Complete. You know where you stand.'
        }
      ]
    },

{
        
        id:  'w2-l1-pawn',
        title: "Pawn Mastery",
        description: "All about the brave pawn: movement, capturing, special rules, and promotion.",
        icon: "User",
        track: "world-1",
        order: 2,
        type: "concept",
        prerequisiteIds: ["w1-minigame-squares"],
        xpReward: 300,
        imageUrl: "/concept_pawn_intro_1767231720685.png",
        pages: [
        // Intro
        {
            type: "text",
            header: "The Brave Foot Soldier",
            text: "Meet the Pawn! Small but brave, pawns march forward to become powerful pieces like a Queen.",
            style: "fun-fact"
        },
        // Single Step Movement
        {
            type: "board",
            text: "Pawns move 1 square forward. They never look back!",
            fen: "4k3/pppppppp/8/8/8/8/PPPPPPPP/4K3 w - - 0 1",
            moves: ["e2e3"],
            customHighlights: [{ squares: ["e3"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "challenge",
            text: "Move the pawn 1 square forward to e3.",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            solution: ["e2e3"],
            successText: "One step at a time.",
            hints: ["Drag the pawn forward one square.", "Cannot move sideways or backward."]
        },
        // Double Step Movement
        {
            type: "text",
            text: "On its first move, a pawn can move 2 squares forward!"
        },
        {
            type: "challenge",
            text: "Move the pawn 2 squares forward to e4.",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            solution: ["e2e4"],
            successText: "Fast start! Controlling the center.",
            hints: ["Only pawns on starting rank can move 2 squares.", "Drag pawn two squares forward."]
        },
        // Capturing
        {
            type: "board",
            text: "Pawns capture diagonally.",
            fen: "4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1",
            moves: ["e4d5"],
            arrows: [{ from: "e4", to: "d5", color: "lightred" }],
            customHighlights: [{ squares: ["d5"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "challenge",
            text: "Capture the black pawn diagonally!",
            fen: "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1",
            solution: ["e4d5"],
            successText: "Diagonal capture successful!",
            hints: ["Drag diagonally to capture.", "Remember: forward moves do not capture."]
        },
        // En Passant
        // En Passant
        {
            type: "board",
            text: "En Passant is a special capture. When a pawn moves two squares forward and lands next to yours...",
            fen: "r2qkbnr/pppbpppp/2n5/1B3P2/3pP3/5N2/PPPP2PP/RNBQK2R w KQkq - 0 1",
            moves: ["e1g1", "e7e5"], // Show castling then the double-step pawn move
            customHighlights: [
                { squares: ["e7", "e5"], color: "rgba(59, 130, 246, 0.4)", label: "Double Step" },
                { squares: ["f5"], color: "rgba(34, 197, 94, 0.4)", label: "Your Pawn" }
            ],
            arrows: [{ from: "e7", to: "e5", color: "blue" }]
        },
        {
            type: "challenge",
            text: "You can capture it as if it only moved one square! Capture en passant to e6.",
            fen: "r2qkbnr/pppb1ppp/2n5/1B2pP2/3pP3/5N2/PPPP2PP/RNBQ1RK1 w - e6 0 2", // Position after O-O e5. En passant target is e6.
            solution: ["f5e6"],
            successText: "Exactly! You captured the pawn behind it.",
            hints: ["Move your f5 pawn diagonally to e6.", "The captured pawn disappears!"]
        },
        // Promotion
        {
            type: "text",
            text: "Pawns can become powerful pieces upon reaching the 8th rank. This is called promotion."
        },
        {
            type: "challenge",
            text: "Promote your pawn to a Queen!",
            fen: "k7/4P3/8/8/8/8/8/4K3 w - - 0 1",
            solution: ["e7e8q"],
            successText: "Your pawn is now a Queen!",
            hints: ["Drag pawn to the 8th rank.", "Select the piece you want for promotion."]
        },
        // Mini Practice — Any Pawn
        {
            type: "challenge",
            text: "Move a pawn safely forward.",
            fen: "4k3/8/8/8/8/8/PPPPPPPP/4K3 w - - 0 1",
            solution: [
                "a2a3", "b2b3", "c2c3", "d2d3", "e2e3", "f2f3", "g2g3", "h2h3",
                "a2a4", "b2b4", "c2c4", "d2d4", "e2e4", "f2f4", "g2g4", "h2h4"
            ],
            successText: "Pawn advanced safely!",
            hints: ["Pick any pawn.", "Move it forward 1 or 2 squares."]
        },
        // Strategy Intro
        {
            type: "text",
            text: "Connected pawns support each other. Isolated pawns are weak."
        },
        {
            type: "board",
            text: "Which pawns are strong chains? Connected pawns protect each other diagonally.",
            fen: "rnbqkbnr/pp3ppp/4p3/3pP3/2pP4/2P5/PP3PPP/RNBQKBNR w KQkq - 0 1",
            customHighlights: [
                { squares: ["f7", "e6", "d5", "c4"], color: "rgba(0, 0, 0, 0.4)", label: "Black Chain" },
                { squares: ["b2", "c3", "d4", "e5"], color: "rgba(34, 197, 94, 0.4)", label: "White Chain" }
            ]
        },
        {
            type: "challenge",
            text: "Tap all pawns that form a connected chain (both White and Black).",
            fen: "rnbqkbnr/pp3ppp/4p3/3pP3/2pP4/2P5/PP3PPP/RNBQKBNR w KQkq - 0 1",
            goals: ["f7", "e6", "d5", "c4", "b2", "c3", "d4", "e5"],
            successText: "Good! Connected pawns defend each other.",
            hints: ["Look for diagonal lines of pawns.", "Find the long chain for White and Black."]
        },
        // Quiz
        {
            type: "quiz",
            text: "Can a pawn move backward?",
            fen: "4k3/8/8/4P3/8/8/8/4K3 w - - 0 1",
            answers: [
                { text: "Yes, if it wants to", correct: false },
                { text: "No, never", correct: true },
                { text: "Only to capture", correct: false }
            ],
            successText: "Correct. Pawns always move forward!"
        },
        {
            type: "quiz",
            text: "Which pawn can move 2 squares?",
            fen: "4k3/8/8/8/8/8/PPPPPPPP/4K3 w - - 0 1",
            answers: [
                { text: "Pawns on starting rank", correct: true },
                { text: "Pawns already advanced", correct: false },
                { text: "All pawns", correct: false }
            ],
            successText: "Yes! Only pawns on the second rank can move 2 squares."
        },
        // Grandmaster Finale - Step 1: Move
        {
            type: "challenge",
            text: "Grandmaster Finale (1/4): Advance! Lock the position.",
            fen: "5k2/2K1np2/8/1B6/6P1/B7/8/8 w - - 0 1",
            solution: ["g4g5"],
            successText: "Excellent. The Knight is pinned!",
            hints: ["Push the g-pawn to g5."]
        },
        // Grandmaster Finale - Step 2: En Passant
        {
            type: "challenge",
            text: "Grandmaster Finale (2/4): Black plays f5! Use En Passant to capture.",
            fen: "5k2/2K1n3/8/1B3pP1/8/B7/8/8 w - f6 0 2",
            solution: ["g5f6"],
            successText: "En Passant! You caught them.",
            hints: ["Capture the f5 pawn en passant."]
        },
        // Grandmaster Finale - Step 3: Capture
        {
            type: "challenge",
            text: "Grandmaster Finale (3/4): The defense crumbles. Capture the Knight!",
            fen: "6k1/2K1n3/5P2/1B6/8/B7/8/8 w - - 1 3",
            solution: ["f6e7"],
            successText: "Material secured.",
            hints: ["Capture the knight on e7."]
        },
        // Grandmaster Finale - Step 4: Promote
        {
            type: "challenge",
            text: "Grandmaster Finale (4/4): Finish it! Promote to Queen.",
            fen: "8/2K1Pk2/8/1B6/8/B7/8/8 w - - 1 4",
            solution: ["e7e8q"],
            successText: "Checkmate! You are a Pawn Master.",
            hints: ["Push the pawn to e8 and promote."]
        }
    ]
},

{
    id: "w3-king-complete",
    title: "King Mastery",
    description: "Learn how the King moves, castles, avoids threats, and survives check and checkmate.",
    icon: "Crown",
    track: "world-1",
    order: 3,
    type: "concept",
    prerequisiteIds: ["w2-l1-pawn"],
    xpReward: 300,
    imageUrl: "/concept_king_intro_1767231731850.png",
    pages: [
        // Intro
        {
            type: "text",
            header: "The Most Important!",
            text: "Meet the King! He is the most important piece on the board. Protect him at all costs!",
            style: "fun-fact"
        },
        // Basic Movement
        {
            type: "board",
            text: "The King moves one square in any direction: forward, backward, sideways, or diagonally.",
            fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
            moves: ["e1d1","e1f1","e1d2","e1e2","e1f2"],
            customHighlights: [{ squares: ["d1","f1","d2","e2","f2"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "challenge",
            text: "Move the King to a safe square.",
            fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
            solution: ["e1d1", "e1f1", "e1d2", "e1e2", "e1f2"],
            successText: "Nice! The King can move one square in any direction.",
            hints: ["Drag the King to one of the highlighted squares.", "Remember: only one square at a time."]
        },
        // Guided Practice — Multiple Moves
        {
            type: "challenge",
            text: "Move the King through a short path to reach the target square.",
            fen: "k7/p7/8/8/8/8/P7/4K3 w - - 0 1",
            goals: ["f3"],
            playVsBot: true,
            successText: "Good! You guided the King safely.",
            hints: ["Move one square at a time.", "Use all directions as needed."],
            customHighlights: [{ squares: ["f3"], color: "rgba(34, 197, 94, 0.5)", label: "Target" }],
            hiddenPieces: [{ piece: "P", square: "a2", visible: false }, { piece: "p", square: "a7", visible: false }]
        },
        // King Path Challenges — Move to target square via ANY legal path
        // TODO Future: Implement Chebyshev distance for optimal path feedback
        {
            type: "challenge",
            text: "Navigate the King to the highlighted square. Take any path!",
            fen: "k7/p7/8/8/8/8/P7/3K4 w - - 0 1",
            goals: ["h4"],
            customHighlights: [{ squares: ["h4"], color: "rgba(34, 197, 94, 0.5)", label: "Target" }],
            successText: "King reached the target!",
            hints: ["Move one square at a time.", "Diagonal moves count!"],
            hiddenPieces: [{ piece: "P", square: "a2", visible: false }, { piece: "p", square: "a7", visible: false }],
            playVsBot: true
        },
        {
            type: "challenge",
            text: "Lead the King to the safe zone!",
            fen: "k7/p7/8/8/8/8/P7/3K4 w - - 0 1",
            goals: ["d5"],
            customHighlights: [{ squares: ["d5"], color: "rgba(34, 197, 94, 0.5)", label: "Target" }],
            successText: "Target acquired!",
            hints: ["Diagonal paths are often the shortest.", "4 moves minimum!"],
            playVsBot: true,
            hiddenPieces: [{ piece: "P", square: "a2", visible: false }, { piece: "p", square: "a7", visible: false }]
        },
        {
            type: "challenge",
            text: "Get the King to the corner!",
            fen: "k7/p7/8/8/8/8/P7/3K4 w - - 0 1",
            goals: ["a1"],
            customHighlights: [{ squares: ["a1"], color: "rgba(34, 197, 94, 0.5)", label: "Target" }],
            successText: "Corner reached!",
            hints: ["Move diagonally when possible.", "3 moves is optimal!"],
            playVsBot: true,
            hiddenPieces: [{ piece: "P", square: "a2", visible: false }, { piece: "p", square: "a7", visible: false }]
        },
        {
            type: "challenge",
            text: "Cross the board to the opposite corner!",
            fen: "k7/p7/8/8/8/8/P7/3K4 w - - 0 1",
            goals: ["h8"],
            customHighlights: [{ squares: ["h8"], color: "rgba(34, 197, 94, 0.5)", label: "Target" }],
            successText: "Incredible journey!",
            hints: ["Combine diagonal and straight moves.", "7 moves is optimal!"],
            playVsBot: true,
            hiddenPieces: [{ piece: "P", square: "a2", visible: false }, { piece: "p", square: "a7", visible: false }]
        },
        {
            type: "challenge",
            text: "Find the King's path to e4 — the center!",
            fen: "k7/p7/8/8/8/8/P7/3K4 w - - 0 1",
            goals: ["e4"],
            customHighlights: [{ squares: ["e4"], color: "rgba(34, 197, 94, 0.5)", label: "Target" }],
            successText: "Center controlled!",
            hints: ["Move diagonally to minimize moves.", "3 moves is optimal!"],
            playVsBot: true,
            hiddenPieces: [{ piece: "P", square: "a2", visible: false }, { piece: "p", square: "a7", visible: false }]
        },
        // Castling Intro
        {
            type: "text",
            text: "Castling is a special move that allows the King to escape danger and bring a Rook into play."
        },
        {
            type: "board",
            text: "Castling kingside: move the King 2 squares toward the Rook, and the Rook jumps over.",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQK2R w KQkq - 0 1",
            moves: ["e1g1"],
            customHighlights: [{ squares: ["g1"], color: "rgba(34, 197, 94, 0.4)" }],
            arrows: [{ from: "e1", to: "g1", color: "blue" }]
        },
        {
            type: "challenge",
            text: "Castle kingside to safeguard your King.",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQK2R w KQkq - 0 1",
            solution: ["e1g1"],
            successText: "King is safe! Rook joined the game.",
            hints: ["Castling moves the King 2 squares.", "King and Rook must not have moved yet."]
        },
        // Castling Queenside
        {
            type: "board",
            text: "Castling queenside: King moves 2 squares toward the Rook, Rook jumps over.",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R3KBNR w KQkq - 0 1",
            moves: ["e1c1"],
            customHighlights: [{ squares: ["c1"], color: "rgba(34, 197, 94, 0.4)" }],
            arrows: [{ from: "e1", to: "c1", color: "blue" }]
        },
        {
            type: "challenge",
            text: "Castle queenside safely.",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R3KBNR w KQkq - 0 1",
            solution: ["e1c1"],
            successText: "Queenside castling complete!",
            hints: ["King moves 2 squares toward Rook.", "Squares between must be empty."]
        },
        // Check Awareness
        {
            type: "text",
            text: "Check! The King is under threat. You must move or block the attack."
        },
        {
            type: "board",
            text: "Move the King out of check.",
            fen: "4k3/8/8/8/4r3/8/8/4K3 w - - 0 1",
            moves: ["e1d1","e1f1","e1d2","e1e2","e1f2"],
            customHighlights: [{ squares: ["d1","f1","d2","e2","f2"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "challenge",
            text: "Your King is in check! Move it to safety.",
            fen: "4k3/8/8/8/4r3/8/8/4K3 w - - 0 1",
            solution: ["e1d1", "e1f1", "e1d2", "e1f2"],
            successText: "Safe! The King escaped the attack.",
            hints: ["Move the King out of threat squares.", "Only one square at a time."]
        },
        // Checkmate Awareness
        {
            type: "text",
            text: "Checkmate! The King has no legal moves and is trapped. Protecting your King is crucial."
        },
        {
            type: "quiz",
            text: "Identify the situation:",
            fen: "R5k1/5pp1/5r1p/8/8/8/PPP5/1KR5 w - - 0 1",
            answers: [
                { text: "Checkmate", correct: false },
                { text: "Stalemate", correct: false },
                { text: "No Checkmate", correct: true }
            ],
            successText: "Correct! No Checkmate here."
        },
        {
            type: "quiz",
            text: "Identify the situation:",
            fen: "Q1k5/2pp4/6q1/7R/8/8/PPP5/1K6 w - - 0 1",
            answers: [
                { text: "Checkmate", correct: true },
                { text: "Stalemate", correct: false },
                { text: "No Checkmate", correct: false }
            ],
            successText: "Correct! That is Checkmate."
        },
        {
            type: "quiz",
            text: "Identify the situation:",
            fen: "rnbqkbnr/ppppp2p/5p2/6pQ/8/4P3/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
            answers: [
                { text: "Checkmate", correct: true },
                { text: "Stalemate", correct: false },
                { text: "No Checkmate", correct: false }
            ],
            successText: "Correct! Fool's Mate."
        },
        {
            type: "quiz",
            text: "Identify the situation:",
            fen: "7k/5Q2/6K1/8/8/8/8/8 b - - 0 1",
            answers: [
                { text: "Checkmate", correct: false },
                { text: "Stalemate", correct: true },
                { text: "No Checkmate", correct: false }
            ],
            successText: "Correct! Stalemate."
        },
        {
            type: "quiz",
            text: "Identify the situation:",
            fen: "6k1/5Qpp/8/8/8/8/8/4R1K1 b - - 0 1",
            answers: [
                { text: "Checkmate", correct: false },
                { text: "Stalemate", correct: false },
                { text: "No Checkmate", correct: true }
            ],
            successText: "Correct! The King can capture the attacker."
        },
        {
            type: "quiz",
            text: "Identify the situation:",
            fen: "6k1/5ppp/R7/8/8/8/8/6K1 w - - 0 1",
            answers: [
                { text: "Checkmate", correct: false },
                { text: "Stalemate", correct: false },
                { text: "No Checkmate", correct: true }
            ],
            successText: "Correct! No Checkmate."
        },
        {
            type: "quiz",
            text: "Identify the situation:",
            fen: "4R1k1/5ppp/8/8/8/8/8/6K1 b - - 0 1",
            answers: [
                { text: "Checkmate", correct: true },
                { text: "Stalemate", correct: false },
                { text: "No Checkmate", correct: false }
            ],
            successText: "Correct! Back Rank Mate."
        },
        {
            type: "quiz",
            text: "Identify the situation:",
            fen: "8/8/8/8/8/5k2/8/r6K w - - 0 1",
            answers: [
                { text: "Checkmate", correct: false },
                { text: "Stalemate", correct: false },
                { text: "No Checkmate", correct: true }
            ],
            successText: "Correct! No Checkmate."
        },
        {
            type: "quiz",
            text: "Identify the situation:",
            fen: "6rk/5Npp/8/8/1PB5/1KP5/8/8 w - - 0 1",
            answers: [
                { text: "Checkmate", correct: true },
                { text: "Stalemate", correct: false },
                { text: "No Checkmate", correct: false }
            ],
            successText: "Correct! Smothered Mate."
        },
        {
            type: "quiz",
            text: "Identify the situation:",
            fen: "5Q2/7k/7p/5K2/8/8/8/6R1 w - - 0 1",
            answers: [
                { text: "Checkmate", correct: false },
                { text: "Stalemate", correct: true },
                { text: "No Checkmate", correct: false }
            ],
            successText: "Correct! Stalemate."
        },
        {
            type: "quiz",
            text: "Identify the situation:",
            fen: "6rk/5Npp/8/7b/1PB5/1KP5/8/8 w - - 0 1",
            answers: [
                { text: "Checkmate", correct: false },
                { text: "Stalemate", correct: false },
                { text: "No Checkmate", correct: true }
            ],
            successText: "Correct! No Checkmate."
        },
        {
            type: "quiz",
            text: "Identify the situation:",
            fen: "3B4/7R/2k3p1/1Np2pP1/B1P2P2/8/1P6/1K6 b - - 0 1",
            answers: [
                { text: "Checkmate", correct: false },
                { text: "Stalemate", correct: true },
                { text: "No Checkmate", correct: false }
            ],
            successText: "Correct! Stalemate."
        }
    ]
},

{
    id: "w4-knight-mastery",
    title: "The Valiant Knight",
    description: "Learn how the Knight jumps in its unique L-shaped pattern and master its tricks!",
    icon: "ChessKnight",
    track: "world-1",
    order: 6,
    type: "concept",
    prerequisiteIds: ["w3-farmer-piggies-dual"],
    xpReward: 250,
    imageUrl: "/concept_knight_intro_1767231615929.png",
    pages: [
        // Intro
        {
            type: "text",
            header: "The Jumper!",
            text: "Meet the Knight! He is the only piece that can jump over others. No wall is too high for him!",
            style: "fun-fact"
        },
        // Path Instruction
        {
            type: "board",
            header: "The L-Shape",
            text: "The Knight moves in an 'L' shape: 2 squares in one direction, then 1 square to the side.",
            fen: "4k3/8/8/3N4/8/8/8/4K3 w - - 0 1",
            arrows: [
                { from: "d5", to: "d7", color: "blue" },
                { from: "d7", to: "c7", color: "blue" }
            ],
            customHighlights: [{ squares: ["c7"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "board",
            header: "Watch Him Go!",
            text: "See how he jumps? Two steps forward, one step left... L-shape!",
            fen: "4k3/8/8/3N4/8/8/8/4K3 w - - 0 1",
            moves: ["d5c7"],
            customHighlights: [{ squares: ["c7"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "board",
            header: "Every Direction",
            text: "He can jump in any direction, as long as it makes an 'L'!",
            fen: "4k3/8/8/3N4/8/8/8/4K3 w - - 0 1",
            moves: ["d5c7", "d5e7", "d5f6", "d5f4", "d5e3", "d5c3", "d5b4", "d5b6"],
            customHighlights: [{ squares: ["b6","b4","c7","e7","f6","f4","c3","b3"], color: "rgba(34, 197, 94, 0.2)" }]
        },
        {
            type: "board",
            header: "Jumping Around!",
            text: "Look at all the places he can jump to. He's so bouncy!",
            fen: "4k3/8/8/3N4/8/8/8/4K3 w - - 0 1",
            moves: ["d5c7", "c7a8", "a8b6", "b6d5"],
            customHighlights: [{ squares: ["c7","a8","b6","d5"], color: "rgba(34, 197, 94, 0.2)" }]
        },
        // Step 1: Challenge
        {
            type: "challenge",
            text: "Your turn! Move the Knight to c7.",
            fen: "4k3/8/8/3N4/8/8/8/4K3 w - - 0 1",
            solution: ["d5c7"],
            successText: "Perfect L-shape!",
            hints: ["2 squares up, 1 square left."]
        },
        // Step 2: Knight Jumping Over Pieces
        {
            type: "board",
            text: "Knights can jump over other pieces. Nothing can block them.",
            fen: "4k3/8/3P4/3N4/3P4/8/8/4K3 w - - 0 1",
            moves: ["d5b6","d5f6","d5b4","d5f4"],
            customHighlights: [{ squares: ["b6","f6","b4","f4"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "challenge",
            text: "Jump over the pawns to reach f6.",
            fen: "4k3/8/3P4/3N4/3P4/8/8/4K3 w - - 0 1",
            solution: ["d5f6"],
            successText: "Knight jumps over pawns successfully!",
            hints: ["The Knight can jump any piece."]
        },
        // Step 3: Capturing with Knight
        {
            type: "board",
            text: "Knights capture by landing on enemy pieces in their L-path.",
            fen: "4k3/8/8/3n4/3P4/8/8/4K3 w - - 0 1",
            moves: ["d5c7","d5b6","d5e7","d5f6","d5c3","d5b4","d5f4","d5e3"],
            customHighlights: [{ squares: ["c3","e3"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "challenge",
            text: "Capture the black pawn on c3.",
            fen: "4k3/8/8/3N4/8/2p5/8/4K3 w - - 0 1",
            solution: ["d5c3"],
            successText: "Pawn captured! Well done!",
            hints: ["Move Knight in an L-shape to land on the target."]
        },
        // Step 4: Knight Fork Basics
        {
            type: "text",
            text: "Knights are great at forking! A fork is when the Knight attacks two or more pieces at the same time."
        },
        {
            type: "board",
            text: "Notice how this Knight attacks both the King and the Rook at the same time! This is the most powerful fork.",
            fen: "4k3/3r4/8/3N4/8/8/8/4K3 w - - 0 1",
            customHighlights: [{ squares: ["d7", "e8"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "challenge",
            text: "Fork the King and Rook! The King must move, and you win the Rook.",
            fen: "4k3/3r4/8/3N4/8/8/8/4K3 w - - 0 1",
            solution: ["d5f6"],
            successText: "Royal Fork! The King must move and you'll capture the Rook next!",
            hints: ["Find the square where the Knight attacks both the King and the Rook."]
        },
        // Step 5: Knight Navigation to Smothered Mate
        {
            type: "challenge",
            text: "Navigate your hero Knight from h2 to deliver checkmate on c7! Find the path through the obstacles. (Suggested path: Nf1→Ng3→Ne2→Nc3→Nd5→Nc7#)",
            fen: "kr6/pp6/8/1B2PN1P/P2PRPP1/4PB2/P6N/1RRB2QK w - - 0 1",
            goals: ["c7"],
            playVsBot: true,
            customHighlights: [{ squares: ["h2"], color: "rgba(59, 130, 246, 0.6)", label: "Start" }, { squares: ["c7"], color: "rgba(239, 68, 68, 0.6)", label: "Checkmate!" }],
            successText: "Smothered Mate! The hero Knight saves the day!",
            hints: ["Navigate the Knight from h2 to c7.", "One path: h2→f1→g3→e2→c3→d5→c7", "The King on a8 is trapped by its own pieces!"]
        },
        // Step 6: Mini Game – Knight Capture Frenzy
        {
            type: "challenge",
            text: "Capture all black pawns with your Knight!",
            fen: "4k3/8/2p1p3/3N4/2p1p3/8/8/4K3 w - - 0 1",
            goals: ["c4", "c6", "e4", "e6"],
            playVsBot: true,
            customHighlights: [{ squares: ["c4", "c6", "e4", "e6"], color: "rgba(239, 68, 68, 0.5)", label: "Capture!" }],
            successText: "All pawns captured! Knight Mastery achieved.",
            hints: ["Think L-shapes ahead.", "Plan your Knight's route to capture multiple pieces efficiently."]
        },
        // Quiz
        {
            type: "quiz",
            text: "Can the Knight move 1 square straight forward?",
            fen: "4k3/8/8/3N4/8/8/8/4K3 w - - 0 1",
            answers: [
                { text: "Yes", correct: false },
                { text: "No", correct: true },
                { text: "Only to capture", correct: false }
            ],
            successText: "Correct! Knights move in L-shapes, not straight."
        },
        // Final: The Octopus Knight
        {
            type: "challenge",
            text: "The Octopus Knight! The Knight controls 8 squares in a circle. Tap all 8 squares the Knight can jump to!",
            fen: "4k3/8/8/3N4/8/8/8/4K3 w - - 0 1",
            goals: ["c7", "e7", "f6", "f4", "e3", "c3", "b4", "b6"],
            customHighlights: [
                { squares: ["d5"], color: "rgba(59, 130, 246, 0.5)", label: "The Octopus" },
                { squares: ["c7", "e7", "f6", "f4", "e3", "c3", "b4", "b6"], color: "rgba(34, 197, 94, 0.3)" }
            ],
            successText: "Amazing! You found all 8 legs of the Octopus Knight!",
            hints: ["Look for the circle of squares around the Knight.", "2 squares away, then 1 to the side."]
        }
    ]
},

{
    id: "w5-bishop-mastery",
    title: "The Diagonal Defender",
    description: "Learn how the Bishop glides along diagonals, controls long lines, and creates tactical opportunities.",
    icon: "ChessBishop",
    track: "world-1",
    order: 9,
    type: "concept",
    prerequisiteIds: ["w4-farmer-piggies-dogs"],
    xpReward: 250,
    imageUrl: "/concept_bishop_intro_1767231744743.png",
    pages: [
        // Intro
        {
            type: "text",
            header: "The Wise Bishop",
            text: "Meet the Bishop! He slides along diagonals and can cross the whole board in a single move!",
            style: "fun-fact"
        },
        // Step 1: Basic Movement
        {
            type: "board",
            text: "Observe the Bishops. One travels on light squares, the other on dark squares.",
            fen: "1k6/8/8/8/8/2B5/6B1/1K6 w - - 0 1",
            customHighlights: [{ squares: ["c3", "g2"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "challenge",
            text: "Move the light-squared Bishop to d5.",
            fen: "1k6/8/8/8/8/2B5/6B1/1K6 w - - 0 1",
            solution: ["g2d5"],
            successText: "Excellent! Bishop moves along the diagonal.",
            hints: ["The light-squared Bishop is on g2.", "Move it to d5."]
        },
        // Step 2: Capturing with the Bishop
        {
            type: "board",
            text: "Bishops capture by landing on enemy pieces along diagonals.",
            fen: "4k3/8/8/3B4/8/2p5/8/4K3 w - - 0 1",
            moves: ["d5c4","d5b3","d5a2","d5e6","d5f7","d5g8"],
            customHighlights: [{ squares: ["c4","b3","a2","e6","f7","g8"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "challenge",
            text: "Capture the pawn on c4.",
            fen: "4k3/8/8/3B4/2p5/8/8/4K3 w - - 0 1",
            solution: ["d5c4"],
            successText: "Pawn captured! Bishop controls the diagonal.",
            hints: ["Move along diagonal to capture."]
        },
        // Step 3: Long-Range Vision
        {
            type: "board",
            text: "Bishops control long diagonals, which is useful for attacking or defending.",
            fen: "k7/8/8/3B4/8/8/8/4K3 w - - 0 1",
            customHighlights: [{ squares: ["a8","b7","c6","d5","e4","f3","g2","h1"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "challenge",
            text: "Move the Bishop to g2 to control this diagonal.",
            fen: "1k6/8/8/8/8/8/8/1K3B2 w - - 0 1",
            solution: ["f1g2"],
            successText: "Bishop now controls a long diagonal!"
        },
        // Step 4: Pinning
        {
            type: "text",
            text: "Bishops can pin enemy pieces: a piece cannot move without exposing a more valuable piece behind it."
        },
        {
            type: "board",
            text: "Here the Bishop pins the black rook to the Black King.",
            fen: "5k2/4r3/8/2B5/8/8/8/1K6 w - - 0 1",
            customHighlights: [{ squares: ["c5", "d6", "e7", "f8"], color: "rgba(34, 197, 94, 0.4)" }],
            
        },
        {
            type: "challenge",
            text: "Move the Bishop to c4 to pin the rook on f7.",
            fen: "6k1/5r2/8/8/8/8/8/4KB2 w - - 0 1",
            solution: ["f1c4"],
            successText: "Rook is pinned! It cant move without exposing the King..",
            hints: ["Align the Bishop with the Rook and King.", "Move to Bishop to c4."]
        },

        // Step 5: Coordination with Other Pieces
        {
            type: "board",
            text: "Pieces work best together! Here, the Pawn (f3) protects the Bishop, while the Knight (d3) covers the dark squares (like e5 and f4) that the Bishop cannot reach.",
            fen: "2k5/8/8/8/4B3/3N1P2/2K5/8 w - - 0 1",
            customHighlights: [{ squares: ["d3", "e4", "f3"], color: "rgba(34, 197, 94, 0.4)" }],
            
        },
        {
            type: "challenge",
            text: "Move the Bishop to e4 to take control of the center and coordinate with the Knight and pawn",
            fen: "2k5/7B/8/8/8/3N1P2/2K5/8 w - - 0 1",
            solution: ["h7e4"],
            successText: "Perfect! Now watch how the pieces work together."
        },
        // Step 5b: Coordination Visualization (Post-Move)
        {
            type: "board",
            text: "Notice the coordination! The Bishop (e4) and Knight (d3) now control a wall of central squares (Green/Blue/Red), while protecting each other.",
            fen: "2k5/8/8/8/4B3/3N1P2/2K5/8 w - - 0 1",
            customHighlights: [
                { squares: ["a8", "b7", "c6", "d5", "e4", "f5", "g6", "h7"], color: "rgba(34, 197, 94, 0.5)" }, // Bishop controls (Green)
                { squares: ["c1", "b2", "b4", "c5", "e5", "f4", "f2", "e1"], color: "rgba(249, 115, 22, 0.6)" }, // Knight controls (Orange)
                { squares: ["g4"], color: "rgba(239, 68, 68, 0.5)" } // Pawn controls (Red)
            ]
        },
        // Step 6: Mini Game – Diagonal Defense
        {
            type: "board",
            text: "Use your Bishop to capture all enemy pawns along diagonals.",
            fen: "5k2/8/2p5/8/8/5p2/5B2/3BK3 w - - 0 1",
            interactive: true,
            playVsBot: true,
            aiOpponent: {
                engine: "Stockfish",
                level: 1
            }
        },
        // Quiz
        {
            type: "quiz",
            text: "Can a Bishop move horizontally or vertically?",
            fen: "4k3/8/8/3B4/8/8/8/4K3 w - - 0 1",
            answers: [
                { text: "Yes", correct: false },
                { text: "No", correct: true },
                { text: "Only to capture", correct: false }
            ],
            successText: "Correct! Bishops move diagonally only."
        },
        // Validation Gate
        {
            type: "validation",
            text: "Pass this final challenge to master the Bishop. capture all the panwns usingyour two Bishops",
            fen: "7k/1p2p3/1N2R3/2p2P2/2N5/5p2/5B2/3BK3 w - - 0 1",
            successText: "Congratulations! You have mastered the Bishop!",
            failText: "Review the lessons and try again.",
            interactive: true,
            playVsBot: true,
            aiOpponent: {
                engine: "Stockfish",
                level: 1
            }
        }
    ]
},

{
    id: "w6-rook-mastery",
    title: "The Towering Rook",
    description: "Learn how the Rook moves straight along ranks and files, controls open lines, and works with other pieces to dominate the board.",
    icon: "ChessRook",
    track: "world-1",
    order: 12,
    type: "concept",
    prerequisiteIds: ["w5-bishop-mastery"],
    xpReward: 250,
    imageUrl: "/rook_mastery_strong_1767284129524.png",
    pages: [
        // Intro
        {
            type: "text",
            header: "The Mighty Rook",
            text: "Meet the Rook! He moves straight like a bulldozer. Nothing stops him from controlling the field!",
            style: "fun-fact"
        },
        // Step 1: Basic Movement
        {
            type: "board",
            text: "Observe how the Rook moves along rows and columns. Try moving it to any unblocked square along these lines.",
            fen: "5k2/8/8/3R4/8/8/8/4K3 w - - 0 1",
            moves: ["d5d8","d5d7","d5d6","d5d4","d5d3","d5d2","d5d1","d5a5","d5b5","d5c5","d5e5","d5f5","d5g5","d5h5"],
            customHighlights: [{ squares: ["d8","d7","d6","d4","d3","d2","d1","a5","b5","c5","e5","f5","g5","h5"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "challenge",
            text: "Move the Rook to d8.",
            fen: "5k2/8/8/3R4/8/8/8/4K3 w - - 0 1",
            solution: ["d5d8"],
            successText: "Great! Rook moves along the rank/file.",
            hints: ["Rooks cannot jump over other pieces.", "Choose an unblocked row or column."]
        },
        // Step 2: Capturing with the Rook
        {
            type: "board",
            text: "Rooks capture by landing on enemy pieces along rows or columns.",
            fen: "4k3/8/8/3R4/8/3p4/8/4K3 w - - 0 1",
            moves: ["d5d3","d5d6","d5d7","d5d8","d5a5","d5b5","d5c5","d5e5","d5f5","d5g5","d5h5"],
            customHighlights: [{ squares: ["d3","d6","d7","d8","a5","b5","c5","e5","f5","g5","h5"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "challenge",
            text: "Capture the pawn on d3.",
            fen: "4k3/8/8/3R4/8/3p4/8/4K3 w - - 0 1",
            solution: ["d5d3"],
            successText: "Pawn captured! Rook controls the file.",
            hints: ["Move along the column to capture."]
        },
        // Step 3: Long-Range Control
        {
            type: "board",
            text: "Rooks control long lines, which is useful for attacking or defending.",
            fen: "4k3/8/8/3R4/8/8/8/4K3 w - - 0 1",
            customHighlights: [{ squares: ["d8","d7","d6","d5","d4","d3","d2","d1","a5","b5","c5","e5","f5","g5","h5"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "challenge",
            text: "Move the Rook to h5 to control the entire row.",
            fen: "4k3/8/8/3R4/8/8/8/4K3 w - - 0 1",
            solution: ["d5h5"],
            successText: "Rook now controls the rank!"
        },
        // Step 4: Pinning and Coordination
        {
            type: "text",
            text: "Rooks can pin enemy pieces along ranks/files or coordinate with other pieces for strong attacks."
        },
        {
            type: "board",
            text: "Here the Rook pins the black Queen to the Black King.",
            fen: "3k4/3q4/8/8/8/8/R2R4/4K3 w - - 0 1",
            customHighlights: [{ squares: ["d5d4"], color: "rgba(34, 197, 94, 0.4)" }],
            
        },
        {
            type: "challenge",
            text: "Move the Rook to pin the pawn on d4.",
            fen: "3k4/3q4/8/8/8/R7/7R/4K3 w - - 0 1",
            solution: ["h2d2"],
            successText: "Queen is pinned! Black will be forced to exchange the Queen for the rook."
        },
        // Step 5: Castling Introduction
        {
            type: "text",
            text: "Rooks are involved in castling, helping your King move to safety while entering the game."
        },
        {
            type: "board",
            text: "White can castle kingside here. The King moves two squares toward the Rook, and the Rook jumps over.",
            fen: "r3kbnr/pppq1ppp/2npb3/1B2p3/4P3/2N2N1P/PPPP1PP1/R1BQK2R w KQkq - 0 1",
            orientation: "white",
            moves: ["e1g1"],
            customHighlights: [{ squares: ["e1", "g1", "h1", "f1"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "board",
            text: "Black can castle queenside here. The King moves two squares toward the Rook, and the Rook jumps over.",
            fen: "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b KQkq - 0 1",
            orientation: "black",
            moves: ["e8c8"],
            customHighlights: [{ squares: ["e8", "c8", "a8", "d8"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "challenge",
            text: "Now you try! Castle kingside as White.",
            fen: "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1",
            orientation: "white",
            solution: ["e1g1"],
            successText: "Perfect! You castled kingside!",
            hints: ["Click the King and move it two squares to the right.", "Castling moves both the King and Rook."]
        },
        {
            type: "challenge",
            text: "Now castle queenside as Black.",
            fen: "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b KQkq - 0 1",
            orientation: "black",
            playerColor: "b",
            interactive: true,
            solution: ["e8c8"],
            successText: "Excellent! You castled queenside!",
            hints: ["Click the King and move it two squares to the left.", "The Rook will jump over automatically."]
        },
        // Step 6: Mini Game – Rook Rampage
        {
            type: "validation",
            text: "Use your Rook to capture all enemy pawns along files and ranks!",
            fen: "1k6/8/p3p2p/8/2p5/8/R7/2K5 w - - 0 1",
            interactive: true,
            playVsBot: true,
            successText: "Excellent! All pawns captured!",
            failText: "Try again! Capture all the pawns.",
            aiOpponent: {
                engine: "Stockfish",
                level: 1
            }
        },
        // Quiz
        {
            type: "quiz",
            text: "Can a Rook move diagonally?",
            fen: "4k3/8/8/3R4/8/8/8/4K3 w - - 0 1",
            answers: [
                { text: "Yes", correct: false },
                { text: "No", correct: true },
                { text: "Only to capture", correct: false }
            ],
            successText: "Correct! Rooks move only along rows and columns."
        },
        // Step 7: Checking the King
        {
            type: "text",
            text: "Rooks can deliver powerful checks by attacking the King along ranks and files."
        },
        {
            type: "board",
            text: "Here, the Rook on d8 puts the Black King in check. The King must move to escape.",
            fen: "3R4/8/8/4k3/8/8/8/4K3 w - - 0 1",
            customHighlights: [{ squares: ["d8", "e8"], color: "rgba(239, 68, 68, 0.5)" }],
            arrows: [{ from: "d8", to: "e8", color: "red" }]
        },
        {
            type: "challenge",
            text: "Put the Black King in check with your Rook!",
            fen: "8/8/8/6k1/8/8/8/3RK3 w - - 0 1",
            solution: ["d1d5", "d1e1"],
            successText: "Check! The King is under attack!",
            hints: ["Move the Rook to attack the King.", "Rooks check along files or ranks."]
        },
        // Final Challenge - Free Play
        {
            type: "board",
            text: "Final Challenge: Use your two Rooks to checkmate the White King! Play until checkmate, stalemate, or draw.",
            fen: "4K3/8/8/8/8/8/r7/r3k3 w - - 0 1",
            orientation: "black",
            interactive: true,
            playVsBot: true,
            aiOpponent: {
                engine: "Stockfish",
                level: 1
            }
        }
    ]
},

{
    id: "w9-queen-mastery",
    title: "The Mighty Queen",
    description: "Learn how the Queen combines the power of Rook and Bishop, moving across ranks, files, and diagonals, to control the board and capture enemy pieces.",
    icon: "ChessQueen",
    track: "world-1",
    order: 15,
    type: "concept",
    prerequisiteIds: ["w8-farmer-piggies-tractors"],
    xpReward: 300,
    imageUrl: "/queen_mastery_1767284166654.png",
    pages: [
        // Intro
        {
            type: "text",
            header: "The Superpowered Queen",
            text: "Meet the Queen! She is the most powerful piece on the board, combining the power of the Rook and the Bishop!",
            style: "fun-fact"
        },
        // Step 1: Basic Movement
        {
            type: "board",
            text: "Try moving the Queen to any square along rows, columns, or diagonals, as long as there are no pieces blocking her path.",
            fen: "4k3/8/8/3Q4/8/8/8/4K3 w - - 0 1",
            customHighlights: [{ squares: ["a5","b5","c5","d1","d2","d3","d4","d6","d7","d8","e6","f7","g8","c6","b7","a8"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "challenge",
            text: "Move the Queen to c3 along the diagonal to check the White King.",
            fen: "k7/6q1/8/8/8/8/8/4K3 b - - 0 1",
            orientation: "black",
            playerColor: "b",
            solution: ["g7c3"],
            successText: "Great! Queen can move along diagonals and check the King"
        },
        // Step 2: Capturing
        {
            type: "board",
            text: "The Queen captures enemy pieces by landing on them, along any row, column, or diagonal.",
            fen: "8/8/8/8/5k2/2q1P3/5K2/8 b - - 0 1",
            
        },
        {
            type: "challenge",
            text: "Capture the pawn on e3.",
            fen: "8/8/8/8/5k2/2q1P3/5K2/8 b - - 0 1",
            playerColor: "b",
            solution: ["c3e3"],
            successText: "Pawn captured! The Queen is super strong, but even she needs help sometimes. In this case, the Queen is protected by his own King."
        },
        // Step 3: Long-Range Control
        {
            type: "board",
            text: "Queens can control long lines along ranks, files, and diagonals. This makes them ideal for both attack and defense.",
            fen: "4k3/8/8/3Q4/8/8/8/4K3 w - - 0 1",
            customHighlights: [{ squares: ["all possible moves from d5"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "challenge",
            text: "Move the Queen to h5 to control the rank and diagonal.",
            fen: "4k3/8/8/3Q4/8/8/8/4K3 w - - 0 1",
            solution: ["d5h5"],
            successText: "Queen now dominates the rank!"
        },
        // Step 4: Coordination
        {
            type: "text",
            text: "Queens work best when coordinating with other pieces! Here, the Queen and Rook form a 'battery' to dominate the d-file."
        },
        {
            type: "board",
            text: "The White Rook and Queen are lined up. Also notice the Bishop on f2 controlling the 'luft' (escape square) on a7!",
            fen: "1k5r/1ppR4/p7/8/8/5P2/3Q1BPP/5RK1 w - - 0 1",
            customHighlights: [
                { squares: ["d7", "d2"], color: "rgba(34, 197, 94, 0.4)", label: "Battery" },
                { squares: ["f2", "a7"], color: "rgba(239, 68, 68, 0.4)", label: "Sniper Bishop" }
            ],
            arrows: [{ from: "f2", to: "a7", color: "red" }]
        },
        
        // Step 5: Mini-Game – Queen Rampage
        {
            type: "board",
            text: "Mini-Game: Queen Rampage! Capture all enemy pawns using only your Queen. Prevent them from promoting!",
            fen: "k7/1p1p1p2/p3p2p/2p5/6p1/8/8/3QK3 w - - 0 1",
            interactive: true,
            playVsBot: true,
            mechanic: "farmer-piggies",
            lockedSquares: ["e1", "a8"], // Lock both Kings
            aiOpponent: {
                engine: "Stockfish",
                level: 3,
                immovablePieces: ["a8"]
            },
            successText: "Rampage Complete! You captured 8/8 pawns!",
            customHighlights: [{ squares: ["d1"], color: "rgba(34, 197, 94, 0.4)", label: "Your Queen" }]
        },
        // Quiz
        {
            type: "quiz",
            text: "Can the Queen move like a Knight?",
            fen: "4k3/8/8/3Q4/8/8/8/4K3 w - - 0 1",
            answers: [
                { text: "Yes", correct: false },
                { text: "No", correct: true },
                { text: "Only to capture", correct: false }
            ],
            successText: "Correct! Queen moves along ranks, files, and diagonals only."
        },
        // Validation Gate
        {
            type: "validation",
            text: "Forced Mate in 2! Black to move. Capture the Knight diagonally, then move horizontally to checkmate.",
            fen: "8/7q/8/8/8/2k5/2N5/1K6 b - - 0 1",
            orientation: "black",
            playerColor: "b",
            interactive: true,
            playVsBot: true,
            aiOpponent: {
                engine: "Stockfish",
                botId: "bot-rookie", // Ley-an
                level: 0
            },
            successText: "Checkmate! You used the King as support to deliver the final blow.",
            customHighlights: [
                { squares: ["h7", "c2"], color: "rgba(34, 197, 94, 0.4)", label: "Diagonal Capture" },
                { squares: ["b2"], color: "rgba(239, 68, 68, 0.4)", label: "Mating Square" }
            ]
        },
    ]
},

{
    id: "w13-special-rules",
    title: "Level 3: Special Rules",
    description: "Learn the special rules of chess: castling, en passant, pawn promotion, and how to recognize check vs checkmate.",
    icon: "ChessCrown",
    track: "world-1",
    order: 18,
    type: "concept",
    prerequisiteIds: ["w9-queen-mastery"],
    xpReward: 350,
    imageUrl: "/chess_special_rules_1767284181472.png",
    pages: [
        // Intro
        {
            type: "text",
            header: "Special Moves",
            text: "Chess has some special moves that break the normal rules! Let's learn about Castling, En Passant, and Promotion.",
            style: "fun-fact"
        },
        // Castling Tutorial
        {
            type: "board",
            text: "Castling: This is the only time you can move two pieces at once! The King moves 2 squares sideways, and the Rook jumps over him.",
            fen: "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
            customHighlights: [{ squares: ["e1g1","h1f1"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "challenge",
            text: "Castle King-side! Move the King 2 squares to the right.",
            fen: "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
            solution: ["e1g1"],
            successText: "Great! The King is safe and the Rook is active."
        },
        {
            type: "text",
            header: "Rules for Castling",
            text: "You can ONLY castle if:\n1. It is the King's and Rook's first move.\n2. The path is clear (no pieces in between).\n3. You are not in check, and do not move through check."
        },
        {
            type: "quiz",
            text: "Look at the board! The Black Rook is attacking the White King (Check). Can the White King castle right now?",
            fen: "r3k2r/8/8/8/8/4r3/8/R3K2R w KQkq - 0 1",
            answers: [
                { text: "Yes", correct: false },
                { text: "No", correct: true }
            ],
            successText: "Correct! You cannot castle when you are in check."
        },
        // En Passant Tutorial
        {
            type: "board",
            text: "En Passant: A special pawn capture. If an enemy pawn moves 2 squares and lands right next to yours, you can capture it as if it only moved 1 square.",
            fen: "4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1",
            customHighlights: [{ squares: ["e5d6"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "challenge",
            text: "Perform En Passant! Capture the pawn on d5.",
            fen: "4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1",
            solution: ["e5d6"],
            successText: "You captured it! This is the only capture where you don't land on the piece."
        },
        // Pawn Promotion Tutorial
        {
            type: "board",
            text: "Promotion: When a pawn reaches the very end of the board, it transforms into a powerful piece! Usually, you choose a Queen.",
            fen: "4k3/7P/8/8/8/8/8/4K3 w - - 0 1",
            customHighlights: [{ squares: ["h8"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "challenge",
            text: "Promote the pawn! Move it to the last rank.",
            fen: "4k3/7P/8/8/8/8/8/4K3 w - - 0 1",
            solution: ["h7h8q"],
            successText: "The pawn promoted to a Queen!"
        },
        // Check vs Checkmate Tutorial
        {
            type: "board",
            text: "Check vs. Checkmate: 'Check' means the King is attacked but can escape. 'Checkmate' means the King has NO escape. Game Over.",
            fen: "6k1/5Q2/6K1/8/8/8/8/8 b - - 0 1",
            customHighlights: [{ squares: ["g8"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "quiz",
            text: "Is this Check or Checkmate?",
            fen: "5k2/4Q3/5K2/8/8/8/8/8 b - - 0 1",
            customHighlights: [{ squares: ["f8"], color: "rgba(239, 68, 68, 0.5)" }],
            answers: [
                { text: "Check", correct: true },
                { text: "Checkmate", correct: false }
            ],
            successText: "Correct! It is Check. The King can escape to g8."
        },
        {
            type: "quiz",
            text: "Is this Check or Checkmate?",
            fen: "6k1/5Q2/8/8/8/8/8/4K3 b - - 0 1",
            answers: [
                { text: "Check", correct: true },
                { text: "Checkmate", correct: false }
            ],
            successText: "Correct! This is just check. The King can capture the Queen!"
        },
        // Validation Gate
        // Review 1: Castling
        {
            type: "challenge",
            text: "Review 1/4: Castling. Castle Kingside to protect your King.",
            fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
            solution: ["e1g1"],
            successText: "Safe and sound!"
        },
        // Review 2: En Passant
        {
            type: "challenge",
            text: "Review 2/4: En Passant. The black pawn just moved f7-f5. Capture it!",
            fen: "rnbqkbnr/ppppp1pp/8/4Pp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 2",
            solution: ["e5f6"],
            successText: "Excellent! You remembered the special pawn capture."
        },
        // Review 3: Check
        {
            type: "quiz",
            text: "Review 3/4: Is the White King in Check or Checkmate?",
            fen: "rnbqk1nr/pppp1ppp/8/4p3/1b1P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 3",
            answers: [
                { text: "Check", correct: true },
                { text: "Checkmate", correct: false },
                { text: "Safe", correct: false }
            ],
            successText: "Correct! It's just Check. The King can move or be blocked."
        },
        // Review 4: Checkmate
        {
            type: "quiz",
            text: "Review 4/4: The Final Test. Is the Black King in Check or Checkmate?",
            fen: "6k1/5Q2/6K1/8/8/8/8/8 b - - 0 1",
            answers: [
                { text: "Check", correct: true },
                { text: "Checkmate", correct: false },
                { text: "Stalemate", correct: false }
            ],
            successText: "Correct! You have mastered the Special Rules."
        }
    ]
},

{
    id: "w14-starting-battle",
    title: "Level 4: Starting the Battle",
    description: "Learn how to properly set up a chess game, make legal opening moves, and capture pieces.",
    icon: "ChessBoard",
    track: "world-1",
    order: 19,
    type: "concept",
    prerequisiteIds: ["w13-special-rules"],
    xpReward: 400,
    imageUrl: "/starting_the_battle_1767284219650.png",
    pages: [
        // Intro
        {
            type: "text",
            text: "Every game begins the same way: pieces must be in their correct starting positions. Let's learn how to start the battle properly.",
            style: "fun-fact"
        },
        // Step 1: Kings
        {
            type: "board",
            text: "Let's build the board! Start with the Kings. White King on e1, Black King on e8.",
            fen: "8/8/8/8/8/8/8/8 w - - 0 1",
            interactive: true,
            playerAction: "place-pieces",
            goals: ["e1", "e8"],
            hints: ["King goes on e1 (White) and e8 (Black)."]
        },
        // Step 2: Queens
        {
            type: "board",
            text: "Now the Queens. They love their own color! White Queen on d1, Black Queen on d8.",
            fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
            interactive: true,
            playerAction: "place-pieces",
            goals: ["d1", "d8"],
            hints: ["Queen goes on d1 (White) and d8 (Black)."]
        },
        // Step 3: Bishops
        {
            type: "board",
            text: "Bishops stand next to the Royal Couple. Place them on c1, f1, c8, and f8.",
            fen: "3qk3/8/8/8/8/8/8/3QK3 w - - 0 1",
            interactive: true,
            playerAction: "place-pieces",
            goals: ["c1", "f1", "c8", "f8"],
            hints: ["Bishops go next to King and Queen."]
        },
        // Step 4: Knights
        {
            type: "board",
            text: "Knights protect the flanks. Place them next to the Bishops on b1, g1, b8, and g8.",
            fen: "2bqkb2/8/8/8/8/8/8/2BQKB2 w - - 0 1",
            interactive: true,
            playerAction: "place-pieces",
            goals: ["b1", "g1", "b8", "g8"],
            hints: ["Knights go next to Bishops."]
        },
        // Step 5: Rooks
        {
            type: "board",
            text: "Rooks go in the corners! Place them on a1, h1, a8, and h8.",
            fen: "1nbqkbn1/8/8/8/8/8/8/1NBQKBN1 w - - 0 1",
            interactive: true,
            playerAction: "place-pieces",
            goals: ["a1", "h1", "a8", "h8"],
            hints: ["Rooks go in the corners."]
        },
        // Step 6: Pawns
        {
            type: "board",
            text: "Finally, the frontline! Place all 8 White Pawns on Rank 2 and Black Pawns on Rank 7.",
            fen: "rnbqkbnr/8/8/8/8/8/8/RNBQKBNR w - - 0 1",
            interactive: true,
            playerAction: "place-pieces",
            goals: ["a2","b2","c2","d2","e2","f2","g2","h2","a7","b7","c7","d7","e7","f7","g7","h7"],
            hints: ["Pawns go on the second row (Rank 2 and Rank 7)."]
        },
        // Step 2: Legal First Moves
        {
            type: "board",
            text: "Make your first legal move as White.",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            interactive: true,
            legalMoves: true,
            successText: "Good! Legal first move executed."
        },
        {
            type: "challenge",
            text: "Move the pawn in front of your king two squares forward.",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            solution: ["e2e4"],
            successText: "Pawn advanced, opening lines for other pieces!"
        },
        // Step 3: Capture Basics
        {
            type: "board",
            text: "Capture opponent pieces legally. Pawns capture diagonally; other pieces capture by landing on the opponent's square.",
            fen: "4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1",
            customHighlights: [{ squares: ["e4d5"], color: "rgba(34, 197, 94, 0.4)" }]
        },
        {
            type: "challenge",
            text: "Capture the black pawn.",
            fen: "4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1",
            solution: ["e4d5"],
            successText: "Pawn captured! Capturing works."
        },
        // Step 4: Full Setup Validation
        {
            type: "board",
            text: "Set up an empty board with all pieces in starting squares. Engine will verify correctness.",
            fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
            interactive: true,
            playerAction: "place-pieces",
            validation: "engine-verify",
            successText: "Perfect! All pieces correctly placed. You're ready to start a game.",
            failText: "Some pieces are missing or in the wrong squares. Try again."
        }
    ]
},

{
    id: "w15-winning-the-game",
    title: "Level 5: Winning the Game",
    description: "Learn checkmate patterns, understand that not every check is a win, and practice executing the finishing moves of the game.",
    icon: "ChessCrown",
    track: "world-1",
    order: 20,
    type: "concept",
    prerequisiteIds: ["w14-starting-battle"],
    xpReward: 450,
    imageUrl: "/winning_the_game_1767284233727.png",
    pages: [
        // Intro
        {
            type: "text",
            text: "Not every check is a win! Let's learn how to deliver checkmate, recognize when the game is won, and understand resignation as part of chess culture.",
            style: "fun-fact"
        },
        // Step 1: Ladder Mate Tutorial
        {
            type: "board",
            text: "Ladder Mate: Use two major pieces to trap the enemy king. Here, the Queen controls the G-file. Moving the Rook to the H-file delivers checkmate!",
            fen: "8/7k/8/8/8/8/5R2/6QK w - - 0 1",
            customHighlights: [{ squares: ["f2h2"], color: "rgba(34, 197, 94, 0.4)" }],
            explanation: "The Queen acts as a wall. The Rook delivers the final blow."
        },
        // Step 2: Interactive Ladder Mate
        {
            type: "challenge",
            text: "Deliver checkmate! Move the Rook to h2.",
            fen: "8/7k/8/8/8/8/5R2/6QK w - - 0 1",
            solution: ["f2h2"],
            successText: "Checkmate! The King prevents escape to g8/g7/g6, and the Rook attacks h-file."
        },
        // Step 3: Stalemate Practice
        {
            type: "board",
            text: "Stalemate: The King is NOT in check, but has NO legal moves. This is a DRAW (Tie), not a win!",
            fen: "7k/5Q2/8/8/8/8/8/6K1 b - - 0 1",
            interactive: true,
            legalMovesOnly: true,
            failText: "You can't move! It's Stalemate. The Queen traps the King but doesn't check him."
        },
        // Step 4: Recognize Win & Resignation
        {
            type: "text",
            text: "When checkmate is inevitable, players often 'Resign' (quit) to show respect. But beginners play until the very end!"
        },
        // Practice 1: Queen & King
        {
            type: "challenge",
            text: "Practice 1/4: The Queen's Kiss. Deliver Checkmate!",
            fen: "7k/8/6K1/5Q2/8/8/8/8 w - - 0 1",
            solution: ["f5f8"],
            successText: "Bullseye! The King is trapped."
        },
        // Practice 2: Back Rank Helper
        {
            type: "challenge",
            text: "Practice 2/4: Back Rank. The pawn on g6 blocks the escape!",
            fen: "6k1/1R4p1/6P1/8/8/8/8/6K1 w - - 0 1",
            solution: ["b7b8"],
            successText: "Textbook back rank mate!"
        },
        // Practice 3: Ladder Mate
        {
            type: "challenge",
            text: "Practice 3/4: Ladder Mate. Use the Rooks to seal the edge.",
            fen: "7k/1R6/2K5/R7/8/8/8/8 w - - 0 1", // Fixed FEN: King to h8
            solution: ["a5a8"],
            successText: "Classic Ladder Mate!"
        },
        // Practice 4: Supported Queen
        {
            type: "challenge",
            text: "Practice 4/4: Teamwork. The Pawn supports the Queen.",
            fen: "6k1/6P1/5Q1K/8/8/8/8/8 w - - 0 1",
            solution: ["f6f8"],
            successText: "Great teamwork!"
        },
        // Final Exam Intro
        {
            type: "text",
            header: "Final Exam",
            text: "You've practiced the patterns. Now, solve 5 random Mate-in-1 puzzles to complete Level 4!",
            style: "important"
        },
        // Exam 1: Back Rank
        {
            type: "challenge",
            text: "Exam 1/5: Find the mate!",
            fen: "6k1/5ppp/8/8/8/8/1r6/4R1K1 w - - 0 1",
            solution: ["e1e8"],
            successText: "Correct! Always watch the back rank."
        },
        // Exam 2: Anastasias Mate Pattern
        {
            type: "challenge",
            text: "Exam 2/5: The Knight guards the escape squares.",
            fen: "7k/8/5N2/8/8/8/1r6/6RK w - - 0 1", // R on e1, N on f6. Move Re8#
            solution: ["g1g8"],
            successText: "Excellent! The Knight and Rook work perfectly together."
        },
        // Exam 3: Battery
        {
            type: "challenge",
            text: "Exam 3/5: Queen and Bishop battery.",
            fen: "r5k1/5ppp/8/8/3B4/6Q1/8/6K1 w - - 0 1",
            solution: ["g3g7"],
            successText: "Zap! The battery delivers mate."
        },
        // Exam 4: Arabian Mate Pattern
        {
            type: "challenge",
            text: "Exam 4/5: Rook and Knight corner mate.",
            fen: "8/4N1pk/8/4R3/8/8/8/7K w - - 0 1",
            solution: ["e5h5"],
            successText: "You found it!"
        },
        // Exam 5: Swallow's Tail Pattern
        {
            type: "challenge",
            text: "Exam 5/5: The Queen chases the King.",
            fen: "r2q1r2/ppp1k3/6Q1/4ppb1/2B1N3/3P3P/PP4P1/n2K1R2 w - - 0 1", // Qe6#
            solution: ["g6e6"],
            successText: "Checkmate! You are ready for battle."
        }
    ]
},




    // Minigame: Mate-in-1 Rush (Moved after Level 5)
    {
        id: "w1-minigame-mate-in-1",
        title: "Minigame: Mate-in-1 Rush",
        description: "Race against the clock to find as many checkmates as you can!",
        icon: "Timer",
        track: "world-1",
        order: 21,
        type: "minigame",
        prerequisiteIds: ["w15-winning-the-game"],
        xpReward: 100,
        imageUrl: "/mate_in_one_minigame_thumbnail_v2_1767407531724.png",
        pages: [
            // Welcome Card / Intro Page
            {
                type: "text",
                header: "Mate-in-1 Rush",
                text: "Welcome to Mate-in-1 Rush! Find as many checkmates as you can before time runs out. Good luck!",
                imageUrl: "/mate_in_one_minigame_thumbnail_v2_1767407531724.png",
                style: "important"
            },
            // Board Selection Page (Actually the game itself starts here in UI, but this is the setup)
            {
                type: "board",
                header: "Mate-in-1 Rush",
                text: "Select your time control and start the challenge!",
                fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                playerAction: "mate-in-1-rush"
            }
        ]
    },

    // Minigame: Mate-in-2 Rush (After Mate-in-1 Rush)
    {
        id: "w1-minigame-mate-in-2",
        title: "Minigame: Mate-in-2 Rush",
        description: "Step it up! Find checkmates in two moves. Think ahead and race the clock!",
        icon: "Timer",
        track: "world-1",
        order: 22,
        type: "minigame",
        prerequisiteIds: ["w1-minigame-mate-in-1"],
        xpReward: 150,
        imageUrl: "/mate_in_2_minigame.png",
        pages: [
            // Welcome Card / Intro Page
            {
                type: "text",
                header: "Mate-in-2 Rush",
                text: "Welcome to Mate-in-2 Rush! Find checkmates that require two moves. Plan ahead and think strategically. Good luck!",
                imageUrl: "/mate_in_2_minigame.png",
                style: "important"
            },
            // Board Selection Page
            {
                type: "board",
                header: "Mate-in-2 Rush",
                text: "Select your time control and start the challenge!",
                fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                playerAction: "mate-in-2-rush"
            }
        ]
    },



    // Minigame: Mate-in-3 Rush (After Mate-in-2 Rush)
    {
        id: "w1-minigame-mate-in-3",
        title: "Minigame: Mate-in-3 Rush",
        description: "The ultimate challenge! Calculate 3 moves ahead to find the mate. Master level tactics.",
        icon: "Timer",
        track: "world-1",
        order: 23,
        type: "minigame",
        prerequisiteIds: ["w1-minigame-mate-in-2"],
        xpReward: 200,
        imageUrl: "/mate_in_3_minigame.png",
        pages: [
            // Welcome Card / Intro Page
            {
                type: "text",
                header: "Mate-in-3 Rush",
                text: "Welcome to the ultimate challenge! You must calculate a forced checkmate in exactly three moves. This requires deep calculation.",
                imageUrl: "/mate_in_3_minigame.png",
                style: "important"
            },
            // Board Selection Page
            {
                type: "board",
                header: "Mate-in-3 Rush",
                text: "Select your time control and unleash your calculation power!",
                fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                playerAction: "mate-in-3-rush"
            }
        ]
    },
    // Backward Chaining Lesson
    {
        id: 'w1-backward-mates',
        track: 'world-1',
        title: 'Thinking Backwards',
        icon: 'Puzzle',
        description: 'Learn to solve deep mates by working backwards from the checkmate.',
        imageUrl: '/thinking-backwards.png',
        type: 'tactic',
        order: 24,
        xpReward: 200,
        prerequisiteIds: ['w1-minigame-mate-in-3'],
        pages: [
            {
                type: 'text',
                header: 'Thinking Backwards',
                text: "Grandmasters don't just calculate forward move-by-move. They often **visualize the checkmate first** and then work backwards to see how to reach it.\n\nIn this special lesson, we'll practice this skill directly.\n\n### The Method\nFor each pattern, you will solve it in three stages:\n1.  **Mate-in-1**: The final blow.\n2.  **Mate-in-2**: The setup and the finish.\n3.  **Mate-in-3**: The full sequence.\n\nBy seeing the end first, the full solution becomes much clearer!",
                imageUrl: 'buddy-thinking.png',
            },
            // Pattern 1 - Puzzle 4002
            {
                type: 'board',
                header: 'Example: The End',
                text: "Let's look at the goal first. The Black King is trapped on the edge. If White jumps the Knight to f4, it's Checkmate!",
                fen: '8/6R1/4Np1n/3p3k/2p5/1r2n1PP/3r4/6K1 w - - 1 3',
                customHighlights: [{ squares: ["e6", "f4"], color: "rgba(34, 197, 94, 0.4)", label: "Winning Move" }],
                arrows: [{ from: "e6", to: "f4", color: "green" }]
            },
            {
                type: 'challenge',
                orientation: 'white',
                header: 'Pattern 1: The End',
                text: 'Now you try it! Deliver the checkmate.',
                fen: '8/6R1/4Np1n/3p3k/2p5/1r2n1PP/3r4/6K1 w - - 1 3',
                solution: ['e6f4'],
                successText: 'The Knight delivers the final blow!',
            },
            {
                type: 'challenge',
                orientation: 'white',
                header: 'Pattern 1: One Step Back',
                text: 'White to Move. Now set up that final position.',
                fen: '8/6R1/4Np1n/3p4/2p4k/1r2n2P/3r2P1/6K1 w - - 0 2',
                solution: ['g2g3', 'h4h5', 'e6f4'],
                sequential: true,
                successText: 'We force the King to h5, setting up our Knight mate.',
            },
            {
                type: 'board',
                header: 'Pattern 1: The Sacrifice',
                text: "To make our checkmate work, we need the King to be on h4. But he's on h5! We can force him to capture us with a Rook Sacrifice.",
                fen: '8/6R1/4Np1n/3p3k/2p2R2/1r2n2P/3r2P1/6K1 w - - 0 1',
                customHighlights: [{ squares: ["f4", "h4"], color: "rgba(34, 197, 94, 0.4)", label: "Sacrifice" }],
                arrows: [{ from: "f4", to: "h4", color: "green" }]
            },
            {
                type: 'challenge',
                orientation: 'white',
                header: 'Pattern 1: Full Sequence',
                text: 'White to Move. Put it all together.',
                fen: '8/6R1/4Np1n/3p3k/2p2R2/1r2n2P/3r2P1/6K1 w - - 0 1',
                solution: ['f4h4', 'h5h4', 'g2g3', 'h4h5', 'e6f4'],
                sequential: true,
                successText: 'A Sacrifice on h4 to clear the line!',
            },
            
            // Pattern 2 - Puzzle 4008
            {
                type: 'challenge',
                orientation: 'white',
                header: 'Pattern 2: The End',
                text: 'White to Move. Deliver the final blow.',
                fen: '6N1/7r/6p1/6k1/3B2P1/5pK1/3q3P/8 w - - 2 3',
                solution: ['d4f6'],
                successText: 'The Bishop delivers the final strike.',
            },
            {
                type: 'challenge',
                orientation: 'white',
                header: 'Pattern 2: One Step Back',
                text: 'White to Move. Set it up.',
                fen: '8/7r/5Npk/8/3B2P1/5pK1/3q3P/8 w - - 0 2',
                solution: ['f6g8', 'h6g5', 'd4f6'],
                sequential: true,
                successText: 'Check forcing the King to g5.',
            },
            {
                type: 'challenge',
                orientation: 'white',
                header: 'Pattern 2: Full Sequence',
                text: 'White to Move. Solve from the beginning.',
                fen: '7r/2R5/5Npk/8/3B2P1/5pK1/3q3P/8 w - - 0 1',
                solution: ['c7h7', 'h8h7', 'f6g8', 'h6g5', 'd4f6'],
                sequential: true,
                successText: 'A deflection sacrifice on h7 starts the combo.',
            },

            // Pattern 3 - Puzzle 4010
            {
                type: 'challenge',
                orientation: 'white',
                header: 'Pattern 3: The End',
                text: 'White to Move. Find the mate.',
                fen: '8/7R/6p1/p2Qr1k1/4nN2/4q1PP/7K/8 w - - 3 3',
                solution: ['d5e5'],
                successText: 'Queen takes and mates!',
            },
            {
                type: 'challenge',
                orientation: 'white',
                header: 'Pattern 3: One Step Back',
                text: 'White to Move. How did we get there?',
                fen: '4r3/7R/6p1/p5k1/4nN2/4q1PP/Q6K/8 w - - 1 2',
                solution: ['a2d5', 'e8e5', 'd5e5'],
                sequential: true,
                successText: 'Queen joins the attack with check.',
            },
            {
                type: 'challenge',
                orientation: 'white',
                header: 'Pattern 3: Full Sequence',
                text: 'White to Move. The full combination.',
                fen: '4r3/3R3p/6pk/p7/4nN2/4q1PP/Q6K/8 w - - 0 1',
                solution: ['d7h7', 'h6g5', 'a2d5', 'e8e5', 'd5e5'],
                sequential: true,
                successText: 'Sacrifice the rook to expose the King.',
            },

            // Pattern 4 - Puzzle 4015
            {
                type: 'challenge',
                orientation: 'white',
                header: 'Pattern 4: The End',
                text: 'White to Move. Finish it.',
                fen: '2n1b3/pk1n4/N3B3/K7/3br3/8/8/8 w - - 0 3',
                solution: ['e6d5'],
                successText: 'Bishop mates on the long diagonal.',
            },
            {
                type: 'challenge',
                orientation: 'white',
                header: 'Pattern 4: One Step Back',
                text: 'White to Move. Set up the finish.',
                fen: 'k1n1b3/pp1n4/N3B3/KQ6/3br3/8/8/8 w - - 0 2',
                solution: ['b5b7', 'a8b7', 'e6d5'],
                sequential: true,
                successText: 'Queen sacrifice to open the b7 square.',
            },
            {
                type: 'challenge',
                orientation: 'white',
                header: 'Pattern 4: Full Sequence',
                text: 'White to Move. Solve the whole puzzle.',
                fen: 'k3b3/pp1nn3/N3B3/KQ6/2Rbr3/8/8/8 w - - 0 1',
                solution: ['c4c8', 'e7c8', 'b5b7', 'a8b7', 'e6d5'],
                sequential: true,
                successText: 'Rook sacrifice to deflect the Knight.',
            },

            // Pattern 5 - Puzzle 4040
            {
                type: 'challenge',
                orientation: 'white',
                header: 'Pattern 5: The End',
                text: 'White to Move. One last move.',
                fen: 'rk1q2r1/p1pP1p1p/2p3p1/8/1b6/1Q6/PPP2PPP/R1B3K1 w - - 2 3',
                solution: ['b3b4'],
                successText: 'Queen delivers the mate.',
            },
            {
                type: 'challenge',
                orientation: 'white',
                header: 'Pattern 5: One Step Back',
                text: 'White to Move. Open the path.',
                fen: 'rk1q2r1/p1pP1p1p/2pb2p1/3Q4/8/8/PPP2PPP/R1B3K1 w - - 0 2',
                solution: ['d5b3', 'd6b4', 'b3b4'],
                sequential: true,
                successText: 'Check to force the Bishop to block.',
            },
            {
                type: 'challenge',
                orientation: 'white',
                header: 'Pattern 5: Full Sequence',
                text: 'White to Move. The final test.',
                fen: 'rk1q2r1/pppP1p1p/3b2p1/3QN3/8/8/PPP2PPP/R1B3K1 w - - 0 1',
                solution: ['e5c6', 'b7c6', 'd5b3', 'd6b4', 'b3b4'],
                sequential: true,
                successText: 'Knight sacrifice to open the b-file.',
            },
        ]
    }
];
