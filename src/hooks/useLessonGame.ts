
import { useState, useEffect } from 'react';
import { LessonNode, LessonContent } from '@/lib/lesson-data';
import { Chess } from 'chess.js';
import { 
    MINIGAME_IDS, 
    generateRookMazeBoard, 
    generateRandomTargetsBoard,
    generateNameTheSquareSquares,
    generateKnightTourFen,
    generatePawnWarsFen,
    generateSafeBishopBoard
} from '@/lib/minigame-rules';



export interface UseLessonGameReturn {
    // State
    pageIndex: number;
    setPageIndex: React.Dispatch<React.SetStateAction<number>>;
    activePages: LessonContent[];
    score: { correct: number; total: number };
    setScore: React.Dispatch<React.SetStateAction<{ correct: number; total: number }>>;
    mistakes: number;
    setMistakes: React.Dispatch<React.SetStateAction<number>>;
    hasMadeMistake: boolean;
    setHasMadeMistake: (made: boolean) => void;
    lessonCompleted: boolean;
    setLessonCompleted: (completed: boolean) => void;
    
    // Derived
    currentPage: LessonContent;
    isFirstPage: boolean;
    isLastPage: boolean;
    
    // Actions
    handleNext: () => void;
    retryLesson: () => void;
}

export function useLessonGame(
    lesson: LessonNode, 
    initialPageIndex: number = 0,
    onComplete?: () => void,
    onProgressChange?: (index: number) => void
): UseLessonGameReturn {

    // Helper to get localStorage key for lesson progress
    const getLessonProgressKey = (lessonId: string) => `lesson_progress_${lessonId}`;

    // Helper to generate pages (handles dynamic content like random FENs)
    const generateLessonPages = (currentLesson: LessonNode): LessonContent[] => {
        let pages: LessonContent[] = currentLesson.pages;

        if (currentLesson.id === MINIGAME_IDS.NAME_THE_SQUARE) {
            console.log("Initializing Randomized Mini-Game...");
            const selectedSquares = generateNameTheSquareSquares(15);
            
            pages = [
                currentLesson.pages[0], 
                ...selectedSquares.map(sq => ({
                    type: 'challenge' as const,
                    text: `Tap ${sq}`,
                    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 
                    goals: [sq],
                    successText: `✓ ${sq}!`
                }))
            ];
        } else if (currentLesson.id === MINIGAME_IDS.KNIGHT_TOUR) {
            console.log("Initializing Knight Tour...");
            const randomFen = generateKnightTourFen();

            pages = currentLesson.pages.map(p => {
                if (p.type === 'board' && p.interactive) {
                    return { ...p, fen: randomFen, playerPiece: 'N' }; 
                }
                return p;
            });
        } else if (currentLesson.id === MINIGAME_IDS.QUEENS_QUEST) {
            console.log("Initializing Queen's Quest...");
            const randomFen = generateRandomTargetsBoard();
            
            pages = currentLesson.pages.map(p => {
                if (p.fen === 'random-targets') {
                    return { ...p, fen: randomFen }; 
                }
                return p;
            });
        } else if (currentLesson.id === MINIGAME_IDS.ROOK_MAZE) {
            console.log("Initializing Rook Maze...");
            const randomFen = generateRookMazeBoard();

            pages = currentLesson.pages.map(p => {
                if (p.type === 'board' && p.interactive) {
                     return { 
                         ...p, 
                         fen: randomFen 
                     };
                }
                return p;
            });
        } else if (currentLesson.id === MINIGAME_IDS.PAWN_WARS_KING) {
            console.log("Initializing Pawn Wars...");
            
            pages = currentLesson.pages.map(p => {
                // Apply to relevant pages (Challenge / Bot)
                if (p.type === 'challenge' || (p.type === 'board' && p.playVsBot)) {
                     // Generate FEN with White to move if player is White, Black to move if player is Black?
                     // Wait, standard chess: White always moves first!
                     // If player is Black, player expects Stockfish (White) to move first.
                     // So FEN should ALWAYS be 'w' to move!
                     const { fen: randomFen, lockedSquares } = generatePawnWarsFen('w');
                     return { 
                         ...p, 
                         fen: randomFen,
                         lockedSquares: lockedSquares
                     };
                }
                return p;
            });
        } else if (currentLesson.id === MINIGAME_IDS.BISHOP_TOUR) {
            console.log("Initializing Safe Bishop...");
            const randomFen = generateSafeBishopBoard();
            
            pages = currentLesson.pages.map(p => {
                if (p.type === 'board' && p.interactive) {
                     return { 
                         ...p, 
                         fen: randomFen
                     };
                }
                return p;
            });
        } else if (currentLesson.id === MINIGAME_IDS.ROOK_MAZE) {
            console.log("Initializing Rook Maze...");
            const randomFen = generateRookMazeBoard();
            
            pages = currentLesson.pages.map(p => {
                if (p.type === 'board' && p.interactive) {
                     return { 
                         ...p, 
                         fen: randomFen
                     };
                }
                return p;
            });
        }
        
        
        // Intro Card Injection
        if (currentLesson.imageUrl && pages.length > 0 && pages[0].type !== 'intro') {
            const introPage: LessonContent = {
                type: 'intro',
                style: 'fun-fact',
                text: currentLesson.description,
                header: currentLesson.title,
                imageUrl: currentLesson.imageUrl
            };
            return [introPage, ...pages];
        }

        return pages;
    };
        



    const [activePages, setActivePages] = useState<LessonContent[]>(() => generateLessonPages(lesson));
    
    // Load saved progress from localStorage on mount
    // Load saved progress from localStorage on mount
    const getSavedProgress = () => {
        // Minigames should always start from the beginning (intro card)
        // We ignore localStorage for them to ensure a fresh start
        if (lesson.type === 'minigame' || lesson.category === 'Mini-Game' || lesson.id.includes('minigame')) {
            return 0;
        }

        if (typeof window === 'undefined') return initialPageIndex;
        try {
            const saved = localStorage.getItem(getLessonProgressKey(lesson.id));
            if (saved) {
                const parsed = JSON.parse(saved);
                return Math.min(parsed.pageIndex || 0, (activePages.length || lesson.pages.length) - 1);
            }
        } catch (e) {
            console.error('Error loading lesson progress:', e);
        }
        return initialPageIndex;
    };

    const [pageIndex, setPageIndex] = useState(getSavedProgress);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [mistakes, setMistakes] = useState(0);
    const [hasMadeMistake, setHasMadeMistake] = useState(false);
    const [lessonCompleted, setLessonCompleted] = useState(false);

    // Derived Variables
    const currentPage = activePages[pageIndex] || lesson.pages[0];
    const isFirstPage = pageIndex === 0;
    const isLastPage = pageIndex === activePages.length - 1;

    // Save progress
    const saveProgress = (newPageIndex: number) => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(getLessonProgressKey(lesson.id), JSON.stringify({
                pageIndex: newPageIndex,
                timestamp: Date.now()
            }));
            if (onProgressChange) onProgressChange(newPageIndex);
        } catch (e) {
            console.error('Error saving lesson progress:', e);
        }
    };

    const clearProgress = () => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(getLessonProgressKey(lesson.id));
        } catch (e) {
            console.error('Error clearing lesson progress:', e);
        }
    };

    // Initial load & Lesson Change effect
    useEffect(() => {
        const pages = generateLessonPages(lesson);
        setActivePages(pages);
        
        // Safety net: Always force minigames to start at 0 (Intro)
        if (lesson.type === 'minigame' || lesson.category === 'Mini-Game' || lesson.id.includes('minigame')) {
            setPageIndex(0);
        }
    }, [lesson.id]);

    const handleNext = () => {
        if (isLastPage) {
            // Finish Logic handled by consumer usually, but we can flag completion
            setLessonCompleted(true);
            clearProgress();
            // onComplete calls are better handled in UI effect dependent on lessonCompleted + grade
        } else {
            const nextPage = pageIndex + 1;
            setPageIndex(nextPage);
            saveProgress(nextPage);
            
            // Reset per-page states
            setHasMadeMistake(false); 
        }
    };

    const retryLesson = () => {
        // Force regenerate randomized boards on retry
        if (lesson.type === 'minigame' || lesson.category === 'Mini-Game' || lesson.id.includes('minigame')) {
            setActivePages(generateLessonPages(lesson));
        }
        
        setPageIndex(0);
        setScore({ correct: 0, total: 0 });
        setLessonCompleted(false);
        setMistakes(0);
        setHasMadeMistake(false);
    };

    return {
        pageIndex,
        setPageIndex,
        activePages,
        score,
        setScore,
        mistakes,
        setMistakes,
        hasMadeMistake,
        setHasMadeMistake,
        lessonCompleted,
        setLessonCompleted,
        currentPage,
        isFirstPage,
        isLastPage,
        handleNext,
        retryLesson
    };
}
