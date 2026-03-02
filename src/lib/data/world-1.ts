import { LessonNode } from '../lesson-types';
import { WORLD_1_CONCEPTS } from './world-1-lessons';
import { WORLD_1_MINIGAMES } from './world-1-minigames';

export const WORLD_1_LESSONS: LessonNode[] = [
    ...WORLD_1_CONCEPTS,
    ...WORLD_1_MINIGAMES
].sort((a, b) => a.order - b.order);
