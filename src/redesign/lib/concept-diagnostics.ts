/**
 * Concept Diagnostics & Weakness Detection
 * Tracks which chess concepts cause mistakes and identifies weaknesses
 */

export type ChessConcept =
  | 'central-control'
  | 'piece-development'
  | 'king-safety'
  | 'kingside-attack'
  | 'queenside-expansion'
  | 'pawn-structure'
  | 'piece-coordination'
  | 'tempo'
  | 'space-advantage'
  | 'endgame-technique';

export interface ConceptPerformance {
  concept: ChessConcept;
  attempts: number;
  mistakes: number;
  masteryRate: number; // percentage 0-100
  explanation: string;
}

export interface WeaknessProfile {
  weakConcepts: ChessConcept[];
  isWeakness: (concept: ChessConcept, accuracy: number) => boolean;
  getWeakestConcepts: (limit?: number) => ChessConcept[];
}

/**
 * Chess concepts and their explanations
 */
export const CONCEPT_DICTIONARY: Record<ChessConcept, string> = {
  'central-control': 'Control of central squares (d4, d5, e4, e5) to dominate the board',
  'piece-development': 'Bringing pieces from their starting squares to active positions',
  'king-safety': 'Protecting the king and maintaining escape squares',
  'kingside-attack': 'Launching an aggressive attack on the opponent\'s kingside',
  'queenside-expansion': 'Expanding space and pressure on the queenside',
  'pawn-structure': 'Understanding pawn formation and resulting weaknesses',
  'piece-coordination': 'Coordinating pieces to work together effectively',
  'tempo': 'Gaining and maintaining the initiative through forcing moves',
  'space-advantage': 'Controlling more space than the opponent',
  'endgame-technique': 'Technical skills needed in endgame positions',
};

/**
 * Tag moves in a variation with their associated concepts
 * This is a simplified system - in practice, you'd analyze each move
 */
export function tagMovesWithConcepts(moves: string[], openingName: string): Map<number, ChessConcept[]> {
  const moveConceptMap = new Map<number, ChessConcept[]>();

  // Example: Map concepts based on opening type and move position
  // In a real system, this would use engine analysis
  for (let i = 0; i < moves.length; i++) {
    const concepts: ChessConcept[] = [];

    // First few moves: piece development
    if (i < 4) {
      concepts.push('piece-development');
    }

    // Early middlegame moves (after opening): space and tempo
    if (i >= 4 && i < 12) {
      concepts.push('central-control', 'tempo');
    }

    // Mid-middlegame: strategy and coordination
    if (i >= 12) {
      concepts.push('piece-coordination', 'space-advantage');
    }

    // Opening-specific concepts
    if (openingName.toLowerCase().includes('sicilian')) {
      if (i < 6) {
        concepts.push('central-control');
      }
    }

    if (openingName.toLowerCase().includes('ruy')) {
      if (i < 8) {
        concepts.push('piece-coordination', 'king-safety');
      }
    }

    moveConceptMap.set(i, [...new Set(concepts)]);
  }

  return moveConceptMap;
}

/**
 * Track concept performance during a training session
 */
export function trackConceptPerformance(
  moveIndex: number,
  isCorrect: boolean,
  conceptsForMove: ChessConcept[]
): Map<ChessConcept, ConceptPerformance> {
  const performanceMap = new Map<ChessConcept, ConceptPerformance>();

  conceptsForMove.forEach(concept => {
    performanceMap.set(concept, {
      concept,
      attempts: 1,
      mistakes: isCorrect ? 0 : 1,
      masteryRate: isCorrect ? 100 : 0,
      explanation: CONCEPT_DICTIONARY[concept],
    });
  });

  return performanceMap;
}

/**
 * Accumulate concept performance over multiple sessions
 */
export function accumulateConceptPerformance(
  existing: Map<ChessConcept, ConceptPerformance>,
  newData: Map<ChessConcept, ConceptPerformance>
): Map<ChessConcept, ConceptPerformance> {
  const accumulated = new Map(existing);

  newData.forEach((newPerf, concept) => {
    const existingPerf = accumulated.get(concept);

    if (existingPerf) {
      const totalAttempts = existingPerf.attempts + newPerf.attempts;
      const totalMistakes = existingPerf.mistakes + newPerf.mistakes;
      const newMasteryRate = ((totalAttempts - totalMistakes) / totalAttempts) * 100;

      accumulated.set(concept, {
        concept,
        attempts: totalAttempts,
        mistakes: totalMistakes,
        masteryRate: newMasteryRate,
        explanation: CONCEPT_DICTIONARY[concept],
      });
    } else {
      accumulated.set(concept, newPerf);
    }
  });

  return accumulated;
}

/**
 * Identify weak concepts (mastery rate below threshold)
 */
export function identifyWeakConcepts(
  conceptPerformance: Map<ChessConcept, ConceptPerformance>,
  threshold: number = 70
): ChessConcept[] {
  const weak: ChessConcept[] = [];

  conceptPerformance.forEach(perf => {
    if (perf.attempts >= 3 && perf.masteryRate < threshold) {
      weak.push(perf.concept);
    }
  });

  return weak;
}

/**
 * Generate debugging feedback based on concept performance
 */
export function generateConceptFeedback(
  weakConcepts: ChessConcept[],
  sessionAccuracy: number
): string[] {
  const feedback: string[] = [];

  if (weakConcepts.length === 0) {
    return ['Keep practicing! Your current concepts are strong.'];
  }

  if (sessionAccuracy < 50) {
    feedback.push(
      `You're struggling with ${weakConcepts.length} concepts. Focus on one at a time.`
    );
  } else if (sessionAccuracy < 70) {
    feedback.push('You have room for improvement in these key concepts:');
  } else {
    feedback.push('You\'re doing well! Here are concepts to deepen your understanding:');
  }

  weakConcepts.slice(0, 3).forEach(concept => {
    feedback.push(`• ${concept.replace('-', ' ')}: ${CONCEPT_DICTIONARY[concept]}`);
  });

  return feedback;
}

/**
 * Create a weakness profile for personalized coaching
 */
export function buildWeaknessProfile(
  conceptPerformance: Map<ChessConcept, ConceptPerformance>
): WeaknessProfile {
  const weakConcepts = identifyWeakConcepts(conceptPerformance);

  return {
    weakConcepts,
    isWeakness: (concept: ChessConcept, minAttempts = 3): boolean => {
      const perf = conceptPerformance.get(concept);
      return perf ? perf.attempts >= minAttempts && perf.masteryRate < 70 : false;
    },
    getWeakestConcepts: (limit = 3): ChessConcept[] => {
      return Array.from(conceptPerformance.values())
        .filter(perf => perf.attempts >= 3 && perf.masteryRate < 70)
        .sort((a, b) => a.masteryRate - b.masteryRate)
        .map(perf => perf.concept)
        .slice(0, limit);
    },
  };
}

/**
 * Suggest next training focus based on weaknesses
 */
export function suggestTrainingFocus(
  weaknessProfile: WeaknessProfile,
  allVariations: any[]
): {
  concept: ChessConcept;
  suggestedVariations: any[];
  explanation: string;
} | null {
  const weakest = weaknessProfile.getWeakestConcepts(1)[0];

  if (!weakest) {
    return null;
  }

  // In a real system, variations would be tagged with concepts
  // For now, we'll suggest the first few variations as practice
  const suggestedVariations = allVariations.slice(0, 2);

  return {
    concept: weakest,
    suggestedVariations,
    explanation: `Focus on ${weakest.replace('-', ' ')} to improve your game. ${CONCEPT_DICTIONARY[weakest]}`,
  };
}
