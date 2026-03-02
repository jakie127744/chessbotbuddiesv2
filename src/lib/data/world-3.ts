import { LessonNode } from '../lesson-types';
import { WORLD_3_CONCEPTS } from './world-3-lessons';

// TRACK 3 — DEVELOPING PLAYER (≈ 800–1200)
// Goal: Basic Tactics
// Outcome: Sees forks, pins, and skewers

export const WORLD_3_LESSONS: LessonNode[] = [
    ...WORLD_3_CONCEPTS
].sort((a, b) => a.order - b.order);
