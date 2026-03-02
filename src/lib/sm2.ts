/**
 * Enhanced SRS Algorithm Implementation (Modified SM-2/SM-5)
 * Supports New, Learning, and Review phases.
 */

export type CardState = 'new' | 'learning' | 'review';

export interface SRSState {
  cardId: string;
  state: CardState;
  reps: number;       // Repetitions in current state
  ease: number;       // Easiness factor (Review only)
  interval: number;   // Interval in minutes (Learning) or days (Review)
  lastReviewed: number | null; // Timestamp
  nextDue: number;    // Timestamp
  mistakesInLearning: number; // Track struggle in learning
}

const MIN_EASE = 1.3;

// Learning steps in minutes: 1min, 10min, 1day (graduate)
const LEARNING_STEPS = [1, 10]; 
const GRADUATING_INTERVAL = 1; // 1 day

export function getInitialState(cardId: string): SRSState {
  return {
    cardId,
    state: 'new',
    reps: 0,
    ease: 2.5,
    interval: 0,
    lastReviewed: null,
    nextDue: Date.now(),
    mistakesInLearning: 0
  };
}

export function sm2Update(state: SRSState, quality: number): SRSState {
  const newState = { ...state };
  newState.lastReviewed = Date.now();

  // Quality: 0-5
  // New/Learning Phase
  if (newState.state === 'new' || newState.state === 'learning') {
      if (quality < 3) {
          // Failed - Reset step
          newState.state = 'learning';
          newState.reps = 0;
          newState.interval = LEARNING_STEPS[0]; // 1 min
          newState.mistakesInLearning++;
      } else {
          // Passed
          newState.state = 'learning';
          newState.reps++;
          
          if (newState.reps > LEARNING_STEPS.length) {
              // Graduate to Review
              newState.state = 'review';
              newState.reps = 1; // 1st review rep
              newState.interval = GRADUATING_INTERVAL; // 1 day
              newState.ease = 2.5; 
          } else {
              // Next learning step
              newState.interval = LEARNING_STEPS[newState.reps - 1] || LEARNING_STEPS[LEARNING_STEPS.length - 1];
          }
      }
      
      // Calculate Next Due (Minutes -> Milliseconds)
      if (newState.state === 'review') {
           // Graduated: Interval is in Days
           newState.nextDue = Date.now() + (newState.interval * 24 * 60 * 60 * 1000);
      } else {
           // Learning: Interval is in Minutes
           newState.nextDue = Date.now() + (newState.interval * 60 * 1000);
      }
      
      return newState;
  }

  // Review Phase (Standard SM-2)
  if (newState.state === 'review') {
      if (quality < 3) {
          // Failed - Back to Learning (Lapse)
          newState.state = 'learning';
          newState.reps = 0;
          newState.interval = 10; // 10 min Re-learning step (simplified)
          newState.ease = Math.max(MIN_EASE, newState.ease - 0.2); // Penalty
          newState.nextDue = Date.now() + (newState.interval * 60 * 1000);
      } else {
          // Passed
          if (newState.reps === 0) {
              newState.interval = 1;
          } else if (newState.reps === 1) {
              newState.interval = 6;
          } else {
              newState.interval = Math.ceil(newState.interval * newState.ease);
          }
          
          newState.reps++;
          
          // Ease update formula
          const delta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
          newState.ease = Math.max(MIN_EASE, newState.ease + delta);
          
          // Interval in Days
          newState.nextDue = Date.now() + (newState.interval * 24 * 60 * 60 * 1000);
      }
  }

  return newState;
}

// Helpers for sorting/prioritizing
export function isDue(state: SRSState): boolean {
    return state.nextDue <= Date.now();
}
