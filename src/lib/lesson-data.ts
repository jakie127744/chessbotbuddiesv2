
import { BotProfile } from './bot-profiles';
import { WORLD_1_LESSONS } from './data/world-1';
import { WORLD_2_LESSONS } from './data/world-2';
import { WORLD_3_LESSONS } from './data/world-3';
import { WORLD_4_LESSONS } from './data/world-4';
import { WORLD_5_LESSONS } from './data/world-5';
import { WORLD_6_LESSONS } from './data/world-6';
import { TrackLevel, LessonNode } from './lesson-types';

export * from './lesson-types';

export const LESSON_TRACKS: Record<TrackLevel, LessonNode[]> = {
  'world-1': WORLD_1_LESSONS,
  'world-2': WORLD_2_LESSONS,
  'world-3': WORLD_3_LESSONS,
  'world-4': WORLD_4_LESSONS,
  'world-5': WORLD_5_LESSONS,
  'world-6': WORLD_6_LESSONS
};
