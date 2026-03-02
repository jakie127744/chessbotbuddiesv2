import { LessonNode } from '../lesson-types';
import { WORLD_2_CONCEPTS } from './world-2-lessons';

export const WORLD_2_LESSONS: LessonNode[] = [
    ...WORLD_2_CONCEPTS
].sort((a, b) => a.order - b.order);
