
// --- TEST MOCKING SUPPORT ---
// Moved from bot-engine.ts to avoid circular dependencies and build issues

export let mockCandidateGenerator: ((fen: string, poolSize: number) => Promise<{ move: string; score: number }[]>) | null = null;
export let mockBestMove: ((fen: string) => Promise<string>) | null = null;

export function setMockCandidateGenerator(fn: any) {
    mockCandidateGenerator = fn;
}

export function setMockBestMove(fn: any) {
    mockBestMove = fn;
}
