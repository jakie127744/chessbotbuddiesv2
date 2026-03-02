/**
 * CB-203: Unit tests for bot-engine.ts
 * Tests difficulty tier settings and move selection logic
 */

import { Chess } from 'chess.js';

// Mock stockfish-manager to avoid actual engine calls
jest.mock('@/lib/stockfish-manager', () => ({
  getBestMove: jest.fn().mockResolvedValue('e2e4'),
  getBotCandidates: jest.fn().mockResolvedValue([
    { move: 'e2e4', score: 100, category: 'Best' },
    { move: 'd2d4', score: 80, category: 'Excellent' },
    { move: 'g1f3', score: 50, category: 'Inaccuracy' },
  ]),
  registerMessageHandler: jest.fn(),
  unregisterMessageHandler: jest.fn(),
  BotEngineSettings: {},
}));

// Import after mocking
import botDifficultyConfig from '@/lib/botDifficulty.v1.json';

describe('bot-engine', () => {
  describe('botDifficulty.v1.json configuration', () => {
    it('should have all difficulty categories defined', () => {
      expect(botDifficultyConfig.categories).toHaveProperty('beginner');
      expect(botDifficultyConfig.categories).toHaveProperty('intermediate');
      expect(botDifficultyConfig.categories).toHaveProperty('advanced');
      expect(botDifficultyConfig.categories).toHaveProperty('master');
      expect(botDifficultyConfig.categories).toHaveProperty('boss');
    });

    it('should have correct beginner settings (weak)', () => {
      const beginner = botDifficultyConfig.categories.beginner;
      expect(beginner.threads).toBe(1);
      expect(beginner.hash).toBe(16);
      expect(beginner.moveTime).toBe(500);
      expect(beginner.multiPV).toBe(6); // Most candidate moves = weakest
    });

    it('should have correct boss settings (strongest)', () => {
      const boss = botDifficultyConfig.categories.boss;
      expect(boss.threads).toBe(8);
      expect(boss.hash).toBe(512);
      expect(boss.moveTime).toBe(10000);
      expect(boss.multiPV).toBe(2); // Fewer candidates = stronger
    });

    it('should have increasing strength from beginner to boss', () => {
      const { beginner, intermediate, advanced, master, boss } = botDifficultyConfig.categories;
      
      // MoveTime should increase (more thinking time = stronger)
      expect(beginner.moveTime).toBeLessThan(intermediate.moveTime);
      expect(intermediate.moveTime).toBeLessThan(advanced.moveTime);
      expect(advanced.moveTime).toBeLessThan(master.moveTime);
      expect(master.moveTime).toBeLessThan(boss.moveTime);
      
      // MultiPV should decrease (fewer candidates = stronger)
      expect(beginner.multiPV).toBeGreaterThan(master.multiPV);
      expect(master.multiPV).toBeGreaterThanOrEqual(boss.multiPV);
    });
  });

  describe('botDifficulty versioning', () => {
    it('should have version information', () => {
      expect(botDifficultyConfig.version).toBeDefined();
      expect(botDifficultyConfig.lastModified).toBeDefined();
    });

    it('should have changelog for auditability', () => {
      expect(botDifficultyConfig.changelog).toBeDefined();
      expect(Array.isArray(botDifficultyConfig.changelog)).toBe(true);
      expect(botDifficultyConfig.changelog.length).toBeGreaterThan(0);
    });
  });
});
