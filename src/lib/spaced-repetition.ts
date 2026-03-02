// SM-2 Spaced Repetition Algorithm
// Used for scheduling opening variation and puzzle reviews

import { ReviewData } from './openings-repertoire';

const OPENING_STORAGE_KEY = 'chess-opening-reviews';
const PUZZLE_STORAGE_KEY = 'chess-puzzle-reviews';

export interface SM2Result {
  easinessFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
}

/**
 * Calculate next review using SM-2 algorithm
 * @param quality Quality of recall (0-5)
 *   0-1: Complete blackout / wrong move
 *   2: Wrong but remembered
 *   3: Correct with difficulty
 *   4: Correct after hesitation
 *   5: Perfect recall
 * @param currentData Current review data
 */
export function calculateNextReview(quality: number, currentData: ReviewData): SM2Result {
  let { easinessFactor, interval, repetitions } = currentData;

  // Calculate new easiness factor
  easinessFactor = Math.max(1.3, easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  // If quality < 3, reset repetitions and set interval to 1
  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    // Increase repetitions
    if (repetitions === 0) {
      interval = 1;
      repetitions = 1;
    } else if (repetitions === 1) {
      interval = 6;
      repetitions = 2;
    } else {
      interval = Math.round(interval * easinessFactor);
      repetitions += 1;
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    easinessFactor,
    interval,
    repetitions,
    nextReviewDate
  };
}

/**
 * Initialize review data for a new item
 */
export function initializeReviewData(id: string): ReviewData {
  return {
    variationId: id, // We reuse variationId field for puzzleId as well for compatibility
    easinessFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: new Date(),
    lastReviewed: new Date(),
    totalReviews: 0,
    successfulReviews: 0
  };
}

// ------------------------------------------------------------------
// GENERIC STORAGE HELPERS
// ------------------------------------------------------------------

function loadData(key: string): Record<string, ReviewData> {
  if (typeof window === 'undefined') return {};
  
  const stored = localStorage.getItem(key);
  if (!stored) return {};

  const data = JSON.parse(stored);
  
  // Convert date strings back to Date objects
  Object.keys(data).forEach(key => {
    data[key].nextReviewDate = new Date(data[key].nextReviewDate);
    data[key].lastReviewed = new Date(data[key].lastReviewed);
  });

  return data;
}

function saveData(key: string, data: Record<string, ReviewData>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ------------------------------------------------------------------
// OPENING REPERTOIRE FUNCTIONS
// ------------------------------------------------------------------

export function loadReviewData(): Record<string, ReviewData> {
    return loadData(OPENING_STORAGE_KEY);
}

export function saveReviewData(data: Record<string, ReviewData>): void {
    saveData(OPENING_STORAGE_KEY, data);
}

export function updateReviewData(variationId: string, quality: number): ReviewData {
  const data = loadReviewData();
  const current = data[variationId] || initializeReviewData(variationId);
  const sm2Result = calculateNextReview(quality, current);

  const updated: ReviewData = {
    ...current,
    ...sm2Result,
    lastReviewed: new Date(),
    totalReviews: current.totalReviews + 1,
    successfulReviews: quality >= 3 ? current.successfulReviews + 1 : current.successfulReviews
  };

  data[variationId] = updated;
  saveReviewData(data);
  return updated;
}

export function getDueReviews(): string[] {
  const data = loadReviewData();
  const now = new Date();
  return Object.keys(data)
    .filter(id => data[id].nextReviewDate <= now)
    .sort((a, b) => data[a].nextReviewDate.getTime() - data[b].nextReviewDate.getTime());
}

export function getReviewData(variationId: string): ReviewData {
  const data = loadReviewData();
  return data[variationId] || initializeReviewData(variationId);
}

export function getMasteryLevel(reviewData: ReviewData): number {
  if (reviewData.totalReviews === 0) return 0;
  
  const successRate = (reviewData.successfulReviews / reviewData.totalReviews) * 100;
  const consistencyBonus = Math.min(reviewData.repetitions * 5, 25);
  
  return Math.min(100, Math.round(successRate * 0.75 + consistencyBonus));
}

// ------------------------------------------------------------------
// PUZZLE REPETITION FUNCTIONS
// ------------------------------------------------------------------

export function loadPuzzleReviewData(): Record<string, ReviewData> {
    return loadData(PUZZLE_STORAGE_KEY);
}

export function updatePuzzleReview(puzzleId: string, quality: number): ReviewData {
    const data = loadPuzzleReviewData();
    const current = data[puzzleId] || initializeReviewData(puzzleId);
    const sm2Result = calculateNextReview(quality, current);

    const updated: ReviewData = {
        ...current,
        ...sm2Result,
        lastReviewed: new Date(),
        totalReviews: current.totalReviews + 1,
        successfulReviews: quality >= 3 ? current.successfulReviews + 1 : current.successfulReviews
    };

    data[puzzleId] = updated;
    saveData(PUZZLE_STORAGE_KEY, data);
    return updated;
}

export function getDuePuzzles(): string[] {
    const data = loadPuzzleReviewData();
    const now = new Date();
    return Object.keys(data)
      .filter(id => data[id].nextReviewDate <= now)
      .sort((a, b) => data[a].nextReviewDate.getTime() - data[b].nextReviewDate.getTime());
}

