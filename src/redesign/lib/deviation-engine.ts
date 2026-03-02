'use client';

/**
 * Deviation Engine - Sideline Training Adapter
 * Tracks user's exposure to deviation sidelines
 * Weights training selection based on actual opponent patterns
 */

export interface DeviationRecord {
  moveIndex: number;
  playerMove: string;
  mainlineMove: string;
  depth: number;
  occurrenceDate: Date;
  source: 'opponent' | 'training' | 'analysis';
  frequency: number;
}

export interface DeviationProfile {
  totalDeviations: number;
  uniqueDeviationPoints: number;
  deviationsByFrequency: DeviationRecord[];
  vulnerableLines: string[]; // Lines where user deviates from mainline
  strongDefenses: string[]; // Lines user handles well
}

export interface DeviationStats {
  totalFaced: number;
  accuracy: number;
  timeSinceLastFaced: number; // days
  importance: 'critical' | 'important' | 'optional';
}

/**
 * Track a deviation (sideline move) encountered by the user
 * Records when user faces moves that deviate from mainline
 */
export function trackDeviation(
  deviations: Map<string, DeviationRecord>,
  moveIndex: number,
  playerMove: string,
  mainlineMove: string,
  source: 'opponent' | 'training' | 'analysis' = 'opponent'
): Map<string, DeviationRecord> {
  const deviationKey = `${moveIndex}_${playerMove}`;

  const existing = deviations.get(deviationKey);

  if (existing) {
    // Increment frequency
    existing.frequency++;
    existing.occurrenceDate = new Date();
    deviations.set(deviationKey, existing);
  } else {
    // New deviation
    deviations.set(deviationKey, {
      moveIndex,
      playerMove,
      mainlineMove,
      depth: moveIndex,
      occurrenceDate: new Date(),
      source,
      frequency: 1,
    });
  }

  return deviations;
}

/**
 * Select appropriate sideline opponent move based on user's history
 * Prioritizes deviations user faces most frequently
 */
export function selectAdaptiveDeviation(
  deviationHistory: Map<string, DeviationRecord>,
  availableSidelineMoves: string[],
  preferenceStrategy: 'frequent' | 'rare' | 'challenging' = 'frequent'
): string | null {
  if (availableSidelineMoves.length === 0) return null;

  const relevantDeviations = Array.from(deviationHistory.values()).filter((d) =>
    availableSidelineMoves.includes(d.playerMove)
  );

  if (relevantDeviations.length === 0) {
    // No history - select most "challenging" (least common in engine prep)
    return selectRarestSideline(availableSidelineMoves);
  }

  // Sort by frequency
  relevantDeviations.sort((a, b) => b.frequency - a.frequency);

  switch (preferenceStrategy) {
    case 'frequent':
      // Train on moves user faces most - solidify defense
      return relevantDeviations[0].playerMove;

    case 'rare':
      // Train on rare deviations - broaden repertoire
      return relevantDeviations[relevantDeviations.length - 1].playerMove;

    case 'challenging':
      // Find deviations where user has lower accuracy
      const sortedByImportance = relevantDeviations.sort(
        (a, b) => getDeviationImportance(b) - getDeviationImportance(a)
      );
      return sortedByImportance[0].playerMove;

    default:
      return relevantDeviations[0].playerMove;
  }
}

/**
 * Calculate how important a deviation is to train
 * Higher score = more important (frequent, recent, difficult)
 */
export function getDeviationImportance(deviation: DeviationRecord): number {
  const frequencyScore = deviation.frequency * 10;

  const daysSinceLastFaced = Math.floor(
    (new Date().getTime() - deviation.occurrenceDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const recencyScore = Math.max(0, 7 - daysSinceLastFaced); // Recent = higher score

  const sourceWeight =
    deviation.source === 'opponent' ? 3 : deviation.source === 'training' ? 2 : 1;

  return frequencyScore + recencyScore * 5 + sourceWeight;
}

/**
 * Get frequency statistics for a specific deviation
 */
export function getDeviationStats(
  deviationHistory: Map<string, DeviationRecord>,
  moveIndex: number,
  playerMove: string
): DeviationStats {
  const deviationKey = `${moveIndex}_${playerMove}`;
  const record = deviationHistory.get(deviationKey);

  if (!record) {
    return {
      totalFaced: 0,
      accuracy: 0,
      timeSinceLastFaced: 999, // Not faced
      importance: 'optional',
    };
  }

  const daysSinceLastFaced = Math.floor(
    (new Date().getTime() - record.occurrenceDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Determine importance based on frequency and recency
  let importance: 'critical' | 'important' | 'optional' = 'optional';
  if (record.frequency >= 5 && daysSinceLastFaced <= 30) importance = 'critical';
  else if (record.frequency >= 3 || daysSinceLastFaced <= 7) importance = 'important';

  return {
    totalFaced: record.frequency,
    accuracy: 0, // Would be calculated from game results
    timeSinceLastFaced: daysSinceLastFaced,
    importance,
  };
}

/**
 * Build comprehensive deviation profile from history
 */
export function buildDeviationProfile(
  deviationHistory: Map<string, DeviationRecord>
): DeviationProfile {
  const allDeviations = Array.from(deviationHistory.values());
  const sortedByFrequency = [...allDeviations].sort((a, b) => b.frequency - a.frequency);

  // Identify vulnerable lines (most frequent deviations)
  const vulnerableLines = sortedByFrequency.slice(0, 5).map((d) => `${d.moveIndex}...${d.playerMove}`);

  // Identify strong defenses (successful responses to common deviations)
  const strongDefenses = sortedByFrequency
    .filter((d) => d.source === 'training' && d.frequency >= 3)
    .slice(0, 5)
    .map((d) => `${d.moveIndex}...${d.playerMove}`);

  return {
    totalDeviations: allDeviations.length,
    uniqueDeviationPoints: new Set(allDeviations.map((d) => d.moveIndex)).size,
    deviationsByFrequency: sortedByFrequency,
    vulnerableLines,
    strongDefenses,
  };
}

/**
 * Weight a variant's selection probability based on deviation history
 * Returns weight factor (0-1) for probability calculation
 */
export function calculateVariantWeight(
  deviationHistory: Map<string, DeviationRecord>,
  variantMoves: string[],
  moveIndex: number
): number {
  const relevantDeviations = Array.from(deviationHistory.values()).filter((d) => {
    if (d.moveIndex !== moveIndex) return false;
    return variantMoves.includes(d.playerMove);
  });

  if (relevantDeviations.length === 0) {
    return 0.5; // Medium weight if no history
  }

  const totalFrequency = relevantDeviations.reduce((sum, d) => sum + d.frequency, 0);
  const avgFrequency = totalFrequency / relevantDeviations.length;

  // Normalize to 0.3-1.0 range
  return Math.min(1.0, 0.3 + avgFrequency / 10);
}

/**
 * Suggest the most important sideline to focus on
 */
export function suggestPriorityDeviation(
  profile: DeviationProfile
): { line: string; reason: string } | null {
  if (profile.vulnerableLines.length === 0) {
    return null;
  }

  const mostVulnerableDeviation = profile.deviationsByFrequency[0];

  if (!mostVulnerableDeviation) {
    return null;
  }

  const daysSinceLastFaced = Math.floor(
    (new Date().getTime() - mostVulnerableDeviation.occurrenceDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  let reason = `You've faced this ${mostVulnerableDeviation.frequency} time(s)`;
  if (daysSinceLastFaced <= 7) {
    reason += ' - recently encountered!';
  } else {
    reason += ` (${daysSinceLastFaced} days ago)`;
  }

  return {
    line: `${mostVulnerableDeviation.moveIndex}...${mostVulnerableDeviation.playerMove}`,
    reason,
  };
}

/**
 * Select rarest sideline move (least common in standard prep)
 * Used when no deviation history exists
 */
function selectRarestSideline(availableMoves: string[]): string {
  // Simple heuristic: longer notation = rarer sideline
  // In production, would use ELO/frequency database
  return availableMoves.sort((a, b) => b.length - a.length)[0] || availableMoves[0];
}

/**
 * Get coaching feedback based on deviation pattern
 */
export function getDeviationCoachingFeedback(
  profile: DeviationProfile,
  stats: DeviationStats
): string {
  if (stats.totalFaced === 0) {
    return 'No sideline exposure recorded yet. Training against your opponent\'s favorite deviations.';
  }

  if (stats.importance === 'critical') {
    return `This sideline is critical - you face it frequently! We\'re prioritizing training here.`;
  }

  if (stats.importance === 'important') {
    return `Important sideline exposure. Let\'s solidify your preparation against this variation.`;
  }

  if (profile.strongDefenses.includes(`${stats.importance}`)) {
    return `You\'ve trained this well! Let\'s reinforce these ideas.`;
  }

  return `Building familiarity with this sideline based on your match history.`;
}

/**
 * Determine ideal training intensity based on deviation exposure
 */
export function getRecommendedIntensity(
  profile: DeviationProfile
): 'warmup' | 'moderate' | 'deep' {
  if (profile.totalDeviations < 3) {
    return 'warmup'; // Limited exposure - light training
  }

  if (profile.totalDeviations < 10) {
    return 'moderate'; // Regular exposure
  }

  return 'deep'; // Heavy deviation exposure - intensive training needed
}
