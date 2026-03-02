/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  collectCoverageFrom: [
    'src/lib/**/*.ts',
    '!src/lib/**/*.d.ts',
    '!src/lib/lichess-puzzles.ts', // Exclude 910KB puzzle data
    '!src/lib/openings-repertoire.ts', // Exclude 121KB opening data
    '!src/lib/coach-commentary.ts', // Exclude 132KB commentary data
  ],
  coverageThreshold: {
    'src/lib/commentary-pipeline.ts': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    'src/lib/bot-engine.ts': {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
    'src/lib/stockfish-manager.ts': {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40,
    },
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest', {
      jsc: {
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
  },
};

module.exports = config;
