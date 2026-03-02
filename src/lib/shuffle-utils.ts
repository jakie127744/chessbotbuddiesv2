/**
 * Deterministically shuffles an array based on a string seed.
 * Useful for "Daily" or "Weekly" shuffles.
 */
export function deterministicShuffle<T>(array: T[], seed: string): T[] {
  const shuffled = [...array];
  
  // Seedable linear congruential generator or similar simple hash
  let seedValue = 0;
  for (let i = 0; i < seed.length; i++) {
    seedValue = ((seedValue << 5) - seedValue) + seed.charCodeAt(i);
    seedValue |= 0; // Convert to 32bit integer
  }

  // Fisher-Yates shuffle with our seeded "random"
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Basic LCG for the next "random" number
    seedValue = (seedValue * 1664525 + 1013904223) % 4294967296;
    const j = Math.floor((seedValue / 4294967296) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}
