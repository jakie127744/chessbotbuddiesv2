export interface ReviewLimitData {
  remaining: number;
  lastUpdated: number;
}

const STORAGE_KEY = 'chess_review_limit';
const INITIAL_REVIEWS = 3;
const REWARD_AMOUNT = 3;

export const ReviewLimitManager = {
  getRemaining: (): number => {
    if (typeof window === 'undefined') return INITIAL_REVIEWS;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Initialize
      const initial: ReviewLimitData = {
        remaining: INITIAL_REVIEWS,
        lastUpdated: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return INITIAL_REVIEWS;
    }

    try {
      const data: ReviewLimitData = JSON.parse(stored);
      
      // Check for daily reset
      const lastDate = new Date(data.lastUpdated);
      const now = new Date();
      
      // Reset if it's a different day (midnight crossed)
      if (lastDate.toDateString() !== now.toDateString()) {
           const refreshed: ReviewLimitData = {
               remaining: INITIAL_REVIEWS,
               lastUpdated: Date.now()
           };
           localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshed));
           return INITIAL_REVIEWS;
      }
      
      return data.remaining;
    } catch (e) {
      return INITIAL_REVIEWS;
    }
  },

  consumeReview: (): boolean => {
    const current = ReviewLimitManager.getRemaining();
    if (current > 0) {
      const updated: ReviewLimitData = {
        remaining: current - 1,
        lastUpdated: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    }
    return false;
  },

  addReward: (): number => {
    const current = ReviewLimitManager.getRemaining();
    const updated: ReviewLimitData = {
      remaining: current + REWARD_AMOUNT,
      lastUpdated: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated.remaining;
  },
  
  // Debug/Reset
  reset: () => {
      localStorage.removeItem(STORAGE_KEY);
  }
};
