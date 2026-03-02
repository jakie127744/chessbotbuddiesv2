/**
 * Mastery Levels & Spaced Repetition System
 * Tracks user performance and schedules variations for review
 */

export type MasteryLevel = 'beginner' | 'developing' | 'proficient' | 'mastered';

export interface VariationPerformance {
  variationId: string;
  attempts: number;
  correct: number;
  accuracy: number; // percentage 0-100
  masteryLevel: MasteryLevel;
  lastReviewDate: Date;
  nextReviewDate: Date;
  easeFactor: number; // SM-2 algorithm: default 2.5
  interval: number; // days between reviews
}

/**
 * Calculate mastery level based on accuracy
 */
export function calculateMasteryLevel(accuracy: number): MasteryLevel {
  if (accuracy >= 95) return 'mastered';
  if (accuracy >= 85) return 'proficient';
  if (accuracy >= 70) return 'developing';
  return 'beginner';
}

/**
 * Update variation performance after session
 * Uses simplified SM-2 algorithm for spaced repetition
 * @param performance - Current performance record
 * @param sessionAccuracy - Accuracy from this session (0-100)
 * @returns Updated performance record
 */
export function updatePerformance(
  performance: VariationPerformance,
  sessionAccuracy: number
): VariationPerformance {
  const attempts = performance.attempts + 1;
  
  // Determine if session was successful (80% or higher)
  const isSuccessful = sessionAccuracy >= 80;
  const correct = performance.correct + (isSuccessful ? 1 : 0);
  
  // Calculate new accuracy (moving average with recent sessions weighted more)
  const newAccuracy = (correct / attempts) * 100;
  
  // SM-2 easiness calculation
  // q = quality of response (0-5): we use success (4) or failure (1)
  const quality = isSuccessful ? 4 : 1;
  let newEaseFactor = performance.easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  
  // Easiness must be at least 1.3
  newEaseFactor = Math.max(1.3, newEaseFactor);
  
  // Calculate interval for next review (in days)
  let newInterval: number;
  if (performance.interval === 0) {
    // First review: 1 day
    newInterval = 1;
  } else if (performance.interval === 1) {
    // Second review: 3 days
    newInterval = 3;
  } else {
    // Subsequent reviews: previous interval * ease factor
    newInterval = Math.round(performance.interval * newEaseFactor);
  }
  
  // If unsuccessful, reset interval but keep history
  if (!isSuccessful) {
    newInterval = 1;
  }
  
  const now = new Date();
  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  
  return {
    variationId: performance.variationId,
    attempts,
    correct,
    accuracy: newAccuracy,
    masteryLevel: calculateMasteryLevel(newAccuracy),
    lastReviewDate: now,
    nextReviewDate,
    easeFactor: newEaseFactor,
    interval: newInterval,
  };
}

/**
 * Check if a variation is due for review
 */
export function isDueForReview(performance: VariationPerformance): boolean {
  return new Date() >= performance.nextReviewDate;
}

/**
 * Get all variations due for review
 */
export function getVariationsDueForReview(
  performances: Map<string, VariationPerformance>
): string[] {
  const dueVariations: string[] = [];
  
  performances.forEach((perf) => {
    if (isDueForReview(perf)) {
      dueVariations.push(perf.variationId);
    }
  });
  
  return dueVariations;
}

/**
 * Create initial performance record for new variation
 */
export function initializePerformance(variationId: string): VariationPerformance {
  const now = new Date();
  
  return {
    variationId,
    attempts: 0,
    correct: 0,
    accuracy: 0,
    masteryLevel: 'beginner',
    lastReviewDate: now,
    nextReviewDate: now, // Available immediately
    easeFactor: 2.5,
    interval: 0,
  };
}

/**
 * Calculate days until variation is due for review
 */
export function daysUntilReview(performance: VariationPerformance): number {
  const now = new Date();
  const diffTime = performance.nextReviewDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Filter variations by mastery level
 */
export function filterByMastery(
  performances: Map<string, VariationPerformance>,
  level: MasteryLevel
): string[] {
  const result: string[] = [];
  
  performances.forEach((perf) => {
    if (perf.masteryLevel === level) {
      result.push(perf.variationId);
    }
  });
  
  return result;
}

/**
 * Get performance statistics
 */
export function getPerformanceStats(
  performances: Map<string, VariationPerformance>
): {
  totalAttempts: number;
  averageAccuracy: number;
  masteredCount: number;
  proficientCount: number;
  developingCount: number;
  beginnerCount: number;
  overdueCount: number;
} {
  let totalAttempts = 0;
  let totalAccuracy = 0;
  let count = 0;
  let masteredCount = 0;
  let proficientCount = 0;
  let developingCount = 0;
  let beginnerCount = 0;
  let overdueCount = 0;
  
  performances.forEach((perf) => {
    totalAttempts += perf.attempts;
    totalAccuracy += perf.accuracy;
    count++;
    
    if (isDueForReview(perf)) {
      overdueCount++;
    }
    
    switch (perf.masteryLevel) {
      case 'mastered':
        masteredCount++;
        break;
      case 'proficient':
        proficientCount++;
        break;
      case 'developing':
        developingCount++;
        break;
      case 'beginner':
        beginnerCount++;
        break;
    }
  });
  
  return {
    totalAttempts,
    averageAccuracy: count > 0 ? totalAccuracy / count : 0,
    masteredCount,
    proficientCount,
    developingCount,
    beginnerCount,
    overdueCount,
  };
}
