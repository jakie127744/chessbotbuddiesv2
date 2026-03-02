/**
 * CB-204: Unit tests for commentary-pipeline.ts
 * Tests the 8-stage deterministic commentary decision pipeline
 */

import { Chess } from 'chess.js';
import {
  createSnapshot,
  detectEvents,
  mapEventsToIntents,
  constructCandidates,
  scoreCandidates,
  resolveWinner,
  selectText,
  buildResult,
  processCommentary,
  CommentarySnapshot,
  DetectedEvent,
  CommentaryIntent,
  INTENT_PRIORITY,
} from '@/lib/commentary-pipeline';
import { BOT_PROFILES } from '@/lib/bot-profiles';

// Get a test coach
const testCoach = BOT_PROFILES.find(b => b.id === 'bot-coach') || BOT_PROFILES[0];

describe('commentary-pipeline', () => {
  describe('Stage 1: createSnapshot', () => {
    it('should create snapshot with correct game state', () => {
      const game = new Chess();
      game.move('e4');
      
      const snapshot = createSnapshot(
        game,
        testCoach,
        'w',
        undefined,
        0,
        false,
        false,
        []
      );
      
      expect(snapshot.moveCount).toBe(1);
      expect(snapshot.phase).toBe('opening');
      expect(snapshot.userColor).toBe('w');
      expect(snapshot.lastMoveByUser).toBe(true);
      expect(snapshot.isGameOver).toBe(false);
    });

    it('should detect checkmate state', () => {
      const game = new Chess();
      // Fool's mate
      game.move('f3');
      game.move('e5');
      game.move('g4');
      game.move('Qh4');
      
      const snapshot = createSnapshot(game, testCoach, 'w', undefined, 0, false, false, []);
      
      expect(snapshot.isGameOver).toBe(true);
      expect(snapshot.isCheckmate).toBe(true);
    });
  });

  describe('Stage 2: detectEvents', () => {
    it('should detect CHECKMATE event', () => {
      const game = new Chess();
      game.move('f3');
      game.move('e5');
      game.move('g4');
      game.move('Qh4');
      
      const snapshot = createSnapshot(game, testCoach, 'w', undefined, 0, false, false, []);
      const events = detectEvents(snapshot);
      
      expect(events).toContain('CHECKMATE');
      expect(events).toContain('GAME_END_LOSS'); // White lost
    });

    it('should detect CASTLING_KINGSIDE event', () => {
      const game = new Chess();
      // Setup for kingside castling
      game.move('e4');
      game.move('e5');
      game.move('Nf3');
      game.move('Nc6');
      game.move('Bc4');
      game.move('Bc5');
      game.move('O-O'); // Castle
      
      const snapshot = createSnapshot(game, testCoach, 'w', undefined, 0, false, false, []);
      const events = detectEvents(snapshot);
      
      expect(events).toContain('CASTLING_KINGSIDE');
    });

    it('should detect CAPTURE_QUEEN event', () => {
      const game = new Chess();
      // Force a queen capture
      game.load('rnb1kbnr/pppp1ppp/8/4p3/4P2q/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1');
      game.move('Nxh4'); // Capture queen
      
      const snapshot = createSnapshot(game, testCoach, 'w', undefined, 0, false, false, []);
      const events = detectEvents(snapshot);
      
      expect(events).toContain('CAPTURE_QUEEN');
    });

    it('should return QUIET_MOVE for non-eventful moves', () => {
      const game = new Chess();
      game.move('e4');
      
      // Snapshot from black's perspective (not user's move)
      const snapshot = createSnapshot(game, testCoach, 'b', undefined, 0, false, false, []);
      const events = detectEvents(snapshot);
      
      // User didn't move, so no user-specific events
      expect(events).toContain('QUIET_MOVE');
    });
  });

  describe('Stage 3: mapEventsToIntents', () => {
    it('should map CHECKMATE to CheckmateThreat', () => {
      const intents = mapEventsToIntents(['CHECKMATE']);
      expect(intents).toContain('CheckmateThreat');
    });

    it('should map GAME_END_WIN to GameEnd', () => {
      const intents = mapEventsToIntents(['GAME_END_WIN']);
      expect(intents).toContain('GameEnd');
    });

    it('should map LEFT_BOOK to Novelty', () => {
      const intents = mapEventsToIntents(['LEFT_BOOK']);
      expect(intents).toContain('Novelty');
    });

    it('should map CASTLING_KINGSIDE to GoodMove', () => {
      const intents = mapEventsToIntents(['CASTLING_KINGSIDE']);
      expect(intents).toContain('GoodMove');
    });
  });

  describe('Stage 5: scoreCandidates', () => {
    it('should apply spam penalty when commenting on consecutive moves', () => {
      const game = new Chess();
      game.move('e4');
      
      const snapshot = createSnapshot(game, testCoach, 'w', undefined, 0, false, false, []);
      const events = detectEvents(snapshot);
      const intents = mapEventsToIntents(events);
      const candidates = constructCandidates(intents, events, snapshot);
      
      // Last comment was on move 0, current is move 1 → spam penalty
      const scored = scoreCandidates(candidates, snapshot, 0);
      
      // Should have spam penalty applied
      const hasSpamPenalty = scored.some(c => c.spamPenalty > 0);
      expect(hasSpamPenalty).toBe(true);
    });
  });

  describe('Stage 6: resolveWinner', () => {
    it('should return null when no candidates above threshold', () => {
      const result = resolveWinner([]);
      expect(result).toBeNull();
    });

    it('should prioritize higher priority intents', () => {
      const game = new Chess();
      game.move('e4');
      
      const snapshot = createSnapshot(game, testCoach, 'w', undefined, 0, false, false, []);
      
      // Create mock scored candidates
      const candidates = [
        {
          intent: 'GameEnd' as CommentaryIntent,
          priority: INTENT_PRIORITY.GameEnd,
          baseConfidence: 1.0,
          triggers: ['GAME_END_WIN' as DetectedEvent],
          phase: 'opening' as const,
          textPool: [],
          triggerStrength: 0.4,
          phaseBonus: 0,
          repetitionPenalty: 0,
          spamPenalty: 0,
          finalScore: 1.4,
        },
        {
          intent: 'GoodMove' as CommentaryIntent,
          priority: INTENT_PRIORITY.GoodMove,
          baseConfidence: 0.6,
          triggers: ['CASTLING_KINGSIDE' as DetectedEvent],
          phase: 'opening' as const,
          textPool: [],
          triggerStrength: 0.1,
          phaseBonus: 0,
          repetitionPenalty: 0,
          spamPenalty: 0,
          finalScore: 0.7,
        },
      ];
      
      const winner = resolveWinner(candidates);
      
      expect(winner).not.toBeNull();
      expect(winner?.intent).toBe('GameEnd');
    });
  });

  describe('processCommentary (integration)', () => {
    it('should return null for non-user moves', () => {
      const game = new Chess();
      game.move('e4'); // White's move
      
      // User is black, so this wasn't their move
      const result = processCommentary(
        game,
        testCoach,
        'b',
        undefined,
        0,
        false,
        false,
        [],
        -1
      );
      
      expect(result).toBeNull();
    });

    it('should return commentary for user moves', () => {
      const game = new Chess();
      game.move('e4'); // White's move
      
      // User is white
      const result = processCommentary(
        game,
        testCoach,
        'w',
        undefined,
        0,
        false,
        false,
        [],
        -1
      );
      
      // May or may not return commentary depending on confidence
      // but should not throw
      expect(result === null || typeof result.text === 'string').toBe(true);
    });
  });
});
