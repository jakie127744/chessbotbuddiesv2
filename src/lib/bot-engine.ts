import { Chess, Move } from 'chess.js';
import { BotProfile, Personality, SPECIAL_BOT_IDS, BOT_PROFILES } from './bot-profiles';
import { getBestMove, getBotCandidates, registerMessageHandler, unregisterMessageHandler, BotEngineSettings } from './stockfish-manager';
import { OpeningVariation, getNextOpeningMove, historyToUci, isInOpeningBook, DEFAULT_REPERTOIRE, getVariationById } from './openings-repertoire';
import { getUserFavoriteOpening } from './user-profile';
import botDifficultyConfig from './botDifficulty.v1.json';
import { mockCandidateGenerator, mockBestMove } from './bot-mocks';

// --- TEST MOCKING SUPPORT ---
// Mocks now imported from ./bot-mocks.ts

// -----------------------------

/**
 * Category-based engine settings for difficulty scaling
 * Settings loaded from botDifficulty.v1.json for version control and auditability
 */
function getCategoryEngineSettings(category: BotProfile['category'], isBoss: boolean = false): { multiPV: number; settings: BotEngineSettings } {
    if (isBoss) {
        const boss = botDifficultyConfig.categories.boss;
        return { 
            multiPV: boss.multiPV, 
            settings: { threads: boss.threads, hash: boss.hash, moveTime: boss.moveTime }
        };
    }
    
    const config = botDifficultyConfig.categories[category] || botDifficultyConfig.categories.master;
    return { 
        multiPV: config.multiPV, 
        settings: { threads: config.threads, hash: config.hash, moveTime: config.moveTime }
    };
}

// Constants for Move Classification (in Centipawns)
const CLASSIFICATION_THRESHOLDS = {
    BEST: 10,       // 0 to -10 cp
    EXCELLENT: 30,  // -10 to -30 cp
    INACCURACY: 90, // -30 to -90 cp
    MISTAKE: 200,   // -90 to -200 cp
    // BLUNDER is anything worse
};

interface MoveCandidate {
    move: string;   // UCI
    score: number;
    mate?: number;  // moves to mate
    category: 'Brilliant' | 'Best' | 'Excellent' | 'Inaccuracy' | 'Mistake' | 'Blunder';
    rawDiff: number;
}

/**
 * Probability Distribution Table based on Rating
 * [Brilliant, Best, Excellent, Inaccuracy, Mistake, Blunder]
 * 
 * CRITICAL: These values must differentiate bots properly!
 * Low ELO = lots of mistakes/blunders, few best moves
 * High ELO = mostly best moves, almost no blunders
 * 
 * Based on BOT_ALGORITHM_DOCS.txt:
 * - 400 ELO: 1% Best, 35% Mistake, 15% Blunder
 * - 1500 ELO: 60% Best, 4% Blunder
 * - 2500+ ELO: 90% Best, 0.5% Blunder
 */
const RATING_PROBABILITIES: Record<string, number[]> = {
    // [Brilliant, Best, Excellent, Inaccuracy, Mistake, Blunder]
    // LOW ELO: Lots of mistakes and blunders!
    '0-300':    [1,    10,    14,    45,   20,    10],   // Beginner
    '301-600':  [1,  11,   18,    42,   19,    9],   // Novice
    '601-900':  [2,  11,  21,    40,   18,    8],   // Improving
    '901-1200': [2,  12,  24,    38,   17,    7],    // Intermediate
    
    // MID ELO: Starting to play real chess
    '1201-1400': [3, 16,    28,  32,   15,    6],    // Club player
    '1401-1600': [4, 19,    35,   25,   12,    5],    // Strong club player
    '1601-1900': [5, 25,    38, 18,   10,    4],    // USCF Expert range
    
    // HIGH ELO: Near-perfect play
    '1901-2100': [6,   38,  47,    3,    3,     3],    // Master candidate (Cal's Range)
    '2101-2300': [6,   45,    42,  3,   3,     1],  // FIDE Master
    '2301-2500': [7,   55,    31,  3,    3,     1],  // IM level
    '2501-2699': [7.5,   65,    25,  1,    1,     0.5],  // GM level
    '2700+':     [10,    90,   5,    0.5,   0.01,  0.001], // Super GM
};

/**
 * Configuration for bot game
 */
export interface BotGameConfig {
  opening?: OpeningVariation;
  userElo?: number;
  lockedSquares?: string[];
}

/**
 * Bot Tilt State - Psychological momentum tracking
 * Simulates emotional collapse after blunders
 */
export interface BotTiltState {
  level: number;          // 0.0 - 1.0 (0 = calm, 1 = maximum tilt)
  movesRemaining: number; // Moves until natural decay begins
}

// Global tilt state per game session (reset on new game)
let currentTiltState: BotTiltState = { level: 0, movesRemaining: 0 };

/**
 * Reset tilt state (call at start of new game)
 */
export function resetBotTilt(): void {
  currentTiltState = { level: 0, movesRemaining: 0 };
}

/**
 * Get current tilt state (for external access/debugging)
 */
export function getTiltState(): BotTiltState {
  return { ...currentTiltState };
}

/**
 * Apply tilt after a blunder is played
 * Lower ELO = stronger and longer tilt effect
 */
function applyTiltAfterMove(moveCategory: string | undefined, elo: number): void {
  if (moveCategory !== 'Blunder') return;
  
  const baseTilt = 
    elo < 500 ? 0.9 :
    elo < 800 ? 0.7 :
    elo < 1000 ? 0.55 :
    elo < 1200 ? 0.4 :
    elo < 1400 ? 0.25 : 0.15;
  
  currentTiltState.level = Math.min(1, currentTiltState.level + baseTilt);
  
  currentTiltState.movesRemaining = 
    elo < 500 ? 6 :
    elo < 800 ? 5 :
    elo < 1000 ? 4 :
    elo < 1200 ? 3 :
    elo < 1600 ? 2 : 1;
  
  console.log(`[Bot Tilt] After blunder: level=${currentTiltState.level.toFixed(2)}, moves=${currentTiltState.movesRemaining}`);
}

/**
 * Decay tilt each move (call at start of move selection)
 */
function decayTilt(): void {
  if (currentTiltState.movesRemaining <= 0) {
    currentTiltState.level = Math.max(0, currentTiltState.level - 0.15);
    return;
  }
  
  currentTiltState.movesRemaining--;
  currentTiltState.level *= 0.88; // Emotional recovery
}

// --- Helper: Get Effective Bot Stats (Handling Adaptive) ---
function getEffectiveBotStats(bot: BotProfile, userElo: number = 1000) {
    if (bot.id !== SPECIAL_BOT_IDS.ADAPTIVE) {
        return {
            elo: bot.elo,
            depth: bot.stockfishDepth,
            skill: 20 // Always use max skill for analysis, limit via weights
        };
    }
    
    // Adaptive Logic: Start at player's rating - 200 points
    // This allows the user to win but still provides a challenge
    const targetElo = Math.max(200, userElo - 200);
    
    // Scale depth based on Elo
    const depth = Math.max(1, Math.min(22, Math.floor(targetElo / 120)));
    
    return {
        elo: targetElo,
        depth: depth,
        skill: 20
    };
}

// --- Helper: Get Probabilities for ELO ---
function getProbabilities(elo: number): number[] {
    if (elo <= 300) return RATING_PROBABILITIES['0-300'];
    if (elo <= 600) return RATING_PROBABILITIES['301-600'];
    if (elo <= 900) return RATING_PROBABILITIES['601-900'];
    if (elo <= 1200) return RATING_PROBABILITIES['901-1200'];
    if (elo <= 1400) return RATING_PROBABILITIES['1201-1400'];
    if (elo <= 1600) return RATING_PROBABILITIES['1401-1600'];
    if (elo <= 1900) return RATING_PROBABILITIES['1601-1900'];
    if (elo <= 2100) return RATING_PROBABILITIES['1901-2100'];
    if (elo <= 2300) return RATING_PROBABILITIES['2101-2300'];
    if (elo <= 2500) return RATING_PROBABILITIES['2301-2500'];
    if (elo <= 2699) return RATING_PROBABILITIES['2501-2699'];
    return RATING_PROBABILITIES['2700+'];
}

// --- Helper: Apply Personality Modifiers ---
function applyPersonality(probs: number[], type: Personality): number[] {
    const p = [...probs]; 
    // Indices: 0:Bril, 1:Best, 2:Excel, 3:Inacc, 4:Mistake, 5:Blunder
    
    switch (type) {
        case 'aggressive': // Tactician
        case 'tactical':
            p[0] *= 1.3; // More Briliant
            p[5] *= 1.3; // More Blunders (Risk)
            p[1] *= 0.9; // Less "Safe" Best
            break;
        case 'solid': // Positional
        case 'positional':
            p[5] *= 0.8; // Fewer Blunders
            p[0] *= 0.7; // Fewer Brilliants (less risk)
            p[2] *= 1.2; // More Excellent (solid moves)
            break;
        case 'kid':
            p[5] *= 1.5; // More Blunders
            break;
        case 'theoretical':
            p[1] *= 1.2; // Prefers Best
            p[3] *= 1.2; // More Inaccuracies (if out of book) - heuristic
            break;
        case 'time_scrambler':
            p[5] *= 1.1;
            break;
        case 'balanced':
        default:
            break;
    }
    return p;
}

// --- Helper: Rating-Based Book Depth ---
function getRatingBasedBookDepth(elo: number): number {
    if (elo <= 300) return 2;
    if (elo <= 600) return 3; // Reduced from 5
    if (elo <= 900) return 5; // Reduced from 8
    if (elo <= 1200) return 7; // Reduced from 12 ("remember a few moves")
    if (elo <= 1400) return 15;
    if (elo <= 1600) return 20;
    if (elo <= 1900) return 25;
    if (elo <= 2100) return 30;
    if (elo <= 2300) return 35;
    if (elo <= 2400) return 40;
    if (elo <= 2600) return 50;
    return 60; // Super GM
}

// Helper to categorize opening lines
function getOpeningTier(id: string): number {
    id = id.toLowerCase();
    
    // Tier 1: Mainlines (Standard Theory)
    // These are the most common, "correct", and educational lines
    if (id.includes('morphy')) return 1; // Ruy Lopez Main
    if (id.includes('najdorf')) return 1; // Sicilian Main
    if (id.includes('qgd')) return 1; // Queen's Gambit Declined (Orthodox)
    if (id.includes('giuoco')) return 1; // Italian Main
    if (id.includes('open-spanish')) return 1; // Ruy Lopez Open
    if (id.includes('classical') && id.includes('caro')) return 1; // Caro Classical
    if (id.includes('advance')) return 1; // French/Caro Advance (Very common)
    if (id.includes('main')) return 1; 

    // Tier 3: Offbeat / Drawing / Rare
    if (id.includes('polish')) return 3;
    if (id.includes('larsen')) return 3;
    if (id.includes('bird')) return 3;
    if (id.includes('groba')) return 3;
    if (id.includes('exchange')) return 3; // Exchange variations are crucial but often "boring" (Tier 3 priority)
    
    // Tier 2: Solid Alternatives (Berlin, Marshall, Dragon, Sveshnikov, Slav, etc.)
    return 2;
}

function filterRepertoireByRating(repertoire: OpeningVariation[], elo: number, turn: 'w' | 'b'): OpeningVariation[] {
    return repertoire.filter(op => {
        // Enforce color perspective match
        if (op.playerColor !== turn) return false;

        const difficulty = op.difficulty || 'intermediate';
        const tier = getOpeningTier(op.id);

        // < 1200: Random Openings (User Request)
        // play any opening, but limit by shallow depth (handled by getRatingBasedBookDepth)
        if (elo < 1200) {
            return true; 
        }

        // 1200 - 1500: Mainlines ONLY (Tier 1)
        // They should play the most standard theory to test the user
        if (elo <= 1500) {
            // Must be Tier 1
            return tier === 1;
        }

        // 1501 - 1900: Mainline (1), Second (2), or Third (3) lines
        // Basically any established opening, but maybe filter out "Dubious" if we had Tier 4
        if (elo <= 1900) {
             return tier <= 3;
        }

        // 1901+: Everything allowed (Unrestricted)
        return true;
    });
}

/**
 * Helper: Get Move from Local Buddy API (V2 Neural Hybrid)
 */
async function getBuddyMove(fen: string): Promise<{ move: string; engine: string } | null> {
  // Use the Hugging Face Space URL provided by user
  const BUDDY_API_URL = process.env.NEXT_PUBLIC_BUDDY_API_URL || 'https://chessbotbuddies-chessbotbuddy-v2.hf.space/move';
  
  try {
    const response = await fetch(BUDDY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fen: fen }),
      // Increase timeout slightly for remote requests (cold starts)
      signal: AbortSignal.timeout(8000) 
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Check if success is true (from app.py MoveResponse)
    if (data.success && data.move) {
        console.log(`[Buddy V2] Engine suggested: ${data.move}`); 
        return {
            move: data.move,
            engine: 'ChessBotBuddy V2 (Hugging Face)'
        };
    } else {
        console.warn(`[Buddy V2] API returned success=false or no move: ${data.error}`);
        return null;
    }

  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
        console.warn(`[Buddy V2] API Timeout. The Hugging Face Space might be sleeping/cold-starting.`);
    } else {
        console.warn(`[Buddy V2] Offline or failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    return null;
  }
}

export interface BotMoveResult {
  from: string;
  to: string;
  promotion?: string;
  isBookMove?: boolean;
  moveCategory?: string;
  decisionReason?: string;
}

/**
 * Main Move Selection Function
 */
export async function getBotMove(
  game: Chess, 
  bot: BotProfile,
  config?: BotGameConfig
): Promise<BotMoveResult | null> {
    const fen = game.fen();
    console.log(`[BotEngine] getBotMove called for ${bot.id} (Category: ${bot.category}, Elo: ${bot.elo})`);
    
    let validMoves = game.moves({ verbose: true });
    console.log(`[BotEngine] Initial valid moves: ${validMoves.length}`);
  
  // Filter out moves from locked squares (e.g., Kings in Pawn Wars)
  if (config?.lockedSquares) {
      console.log(`[BotEngine] Filtering locked squares: ${config.lockedSquares.join(', ')}`);
      validMoves = validMoves.filter(m => !config.lockedSquares!.includes(m.from));
      console.log(`[BotEngine] Valid moves after filter: ${validMoves.length}`);
  }
  
  if (validMoves.length === 0) {
      console.warn('[Bot] No valid moves available for bot (checkmate or stalemate)');
      return null;
  }
  if (validMoves.length === 1) {
      console.log(`[Bot] Only one move available: ${validMoves[0].san}`);
      return { ...validMoves[0], isBookMove: false };
  }
  
  const stats = getEffectiveBotStats(bot, config?.userElo);

  // SUPER GM BYPASS: Wesley and Magnus (2700+) ALWAYS play the Stockfish best move
  // They bypass opening book entirely to ensure maximum accuracy
  if (stats.elo >= 2700) {
    let best = '';
    if (mockBestMove) {
        best = await mockBestMove(game.fen());
    } else {
        best = await getBestMove(game.fen(), { depth: 22, skillLevel: 20, moveTime: 5000 });
    }
    const move = parseLan(best, validMoves);
    console.log(`[Bot] Super GM ${bot.name} playing best move at depth 22: ${best}`);
    return move ? { ...move, isBookMove: false, moveCategory: 'Best', decisionReason: 'SuperGM_Best' } : { ...validMoves[0], moveCategory: 'Best', decisionReason: 'SuperGM_Fallback' };
  }

  // CUSTOM BUDDY ENGINE INTEGRATION (V2 Neural Hybrid)
  if (bot.id === SPECIAL_BOT_IDS.BUDDY) {
      const buddyResponse = await getBuddyMove(game.fen());
      if (buddyResponse) {
          const validApiMove = parseLan(buddyResponse.move, validMoves);
          if (validApiMove) {
              console.log(`[Buddy V2] playing move: ${buddyResponse.move} (${buddyResponse.engine})`);
              return { ...validApiMove, isBookMove: false, moveCategory: 'Best' };
          }
      }
      console.warn('[Buddy V2] API failed or offline, falling back to Stockfish probabilistic engine.');
  }

  // COACH JAKIE LEARNING LOGIC: If playing against Coach Jakie and no opening is preset,
  // automatically use the user's favorite opening to help them practice
  let effectiveConfig = config;
  if (bot.id === SPECIAL_BOT_IDS.ADAPTIVE && !config?.opening) {
    const favoriteOpeningId = getUserFavoriteOpening(3); // min 3 games to be considered "favorite"
    if (favoriteOpeningId) {
      const favoriteOpening = getVariationById(favoriteOpeningId);
      if (favoriteOpening) {
        effectiveConfig = { ...config, opening: favoriteOpening };
        console.log(`[Coach Jakie] Playing user's favorite opening: ${favoriteOpening.name}`);
      }
    }
  }

  // 1. OPENING BOOK LOGIC (Rating & Personality Adaptive)
  const history = game.history({ verbose: true });
  const uciMoves = historyToUci(history);
  const moveNumber = Math.ceil((history.length + 1) / 2); // Current move number being considered

  // A. Determine Depth Limit based on Rating
  const maxBookDepth = getRatingBasedBookDepth(stats.elo);
  
  // B. Check if we should use book (within depth limit)
  if (moveNumber <= maxBookDepth) {
      let candidateMoves: { move: string, opening: OpeningVariation }[] = [];

      // If a specific opening is locked in config, use only that
      if (effectiveConfig?.opening) {
          if (isInOpeningBook(uciMoves, effectiveConfig.opening)) {
              const nextMove = getNextOpeningMove(uciMoves, effectiveConfig.opening);
              if (nextMove) candidateMoves.push({ move: nextMove, opening: effectiveConfig.opening });
          }
      } 
      // Otherwise, scan entire repertoire for matching lines
      else {
          let allowedRepertoire: OpeningVariation[] = [];

          // 1. Check for Specific Bot Preferences (e.g. "Mainlines Only", "Sicilian", etc.)
          if (bot.openingPreferences) {
              allowedRepertoire = filterRepertoireByPreferences(DEFAULT_REPERTOIRE, bot.openingPreferences, game.turn(), history);
              if (allowedRepertoire.length === 0) {
                  // Fallback if no preferences match current game state (e.g. facing 1.b3)
                  allowedRepertoire = filterRepertoireByRating(DEFAULT_REPERTOIRE, stats.elo, game.turn());
              }
          } else {
              // 2. Default Logic: Filter based on Rating/Style
              allowedRepertoire = filterRepertoireByRating(DEFAULT_REPERTOIRE, stats.elo, game.turn());
          }
          
          if (stats.elo > 1900) {
              // Advanced: Check for Transpositions (FEN matching)
              // This allows entering book lines via different move orders
              const transpositions = findTranspositionMoves(game, allowedRepertoire, maxBookDepth);
              for (const t of transpositions) {
                 if (!candidateMoves.some(c => c.move === t.move)) {
                     candidateMoves.push(t);
                 }
              }
              if (transpositions.length > 0) {
                  console.log(`[Bot Book] Found ${transpositions.length} transposition candidates for ${bot.name} (Elo ${stats.elo})`);
              }
          } else {
              // Standard: Strict Move Order
              for (const op of allowedRepertoire) {
                  if (isInOpeningBook(uciMoves, op)) {
                      const nextMove = getNextOpeningMove(uciMoves, op);
                      if (nextMove) {
                          // Avoid duplicates
                          if (!candidateMoves.some(c => c.move === nextMove)) {
                              candidateMoves.push({ move: nextMove, opening: op });
                          }
                      }
                  }
              }
          }
      }

      // C. Select a book move if available
      if (candidateMoves.length > 0) {
           // Simple randomization for now, could be weighted by style later
           const choice = candidateMoves[Math.floor(Math.random() * candidateMoves.length)];
           
           // Apply "Theory Drop-off" chance (random mistake probability at edge of knowledge)
           // Higher ratings are more consistent.
           const errorChance = Math.max(0, (moveNumber - (maxBookDepth - 2)) * 0.2); // Increases near max depth
           
           if (Math.random() > errorChance) {
                const moveObj = parseLan(choice.move, validMoves);
                if (moveObj) {
                    console.log(`[Verification] Bot ${bot.name} (ELO ${stats.elo}) playing BOOK move: ${choice.move} (${choice.opening.name}). Depth Limit: ${maxBookDepth}, Current Move: ${moveNumber}`);
                    return { ...moveObj, isBookMove: true, moveCategory: 'Book', decisionReason: `Book: ${choice.opening.name}` };
                }
           }
      }
  }

  // 2. PROBABILISTIC LOGIC
  return getProbabilisticMove(game, bot, validMoves, stats);
}

/**
 * Helper: Weighted random index selection
 */
function weightedIndex(weights: number[]): number {
    const sum = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * sum;
    for (let i = 0; i < weights.length; i++) {
        if ((r -= weights[i]) <= 0) return i;
    }
    return weights.length - 1;
}

/**
 * Queen Magnet Heuristic (Rating-Aware)
 * 
 * Queen blunder frequency by rating:
 * <500:      40-50% - Random queen moves (chaos)
 * 500-800:   20-30% - Greedy queen captures
 * 800-900:   8-12%  - Missed tactics only
 * 900-1200:  2-5%   - Rare tactical oversight
 * 1200+:     ~0%    - Essentially none
 */
function tryQueenMagnet(game: Chess, validMoves: Move[], elo: number): Move | null {
    const moveNumber = Math.ceil((game.history().length + 1) / 2);
    if (moveNumber > 18) return null;
    
    let chance = 0;
    let requireCapture = false;
    let allowRandom = false;
    
    if (elo < 500) {
        chance = 0.45;
        allowRandom = true;  // <500 = total chaos, random queen moves
    } else if (elo < 800) {
        chance = 0.25;
        requireCapture = true;  // Greedy captures only
    } else if (elo < 900) {
        chance = 0.10;
        requireCapture = true;  // Missed tactics
    } else if (elo < 1200) {
        chance = 0.04;
        requireCapture = true;  // Rare oversight
    } else {
        return null;  // 1200+ essentially never blunders queen
    }
    
    // TILT BONUS: Tilted players more likely to make queen blunders
    chance += currentTiltState.level * 0.25;
    
    if (Math.random() > chance) return null;
    
    const queenMoves = validMoves.filter(m => m.piece === 'q');
    if (queenMoves.length === 0) return null;
    
    let candidates = queenMoves;
    
    // 800+ will only blunder via captures (looks like a reasonable move)
    if (requireCapture) {
        const captures = queenMoves.filter(m => m.captured);
        if (captures.length === 0) return null;
        candidates = captures;
    }
    
    // For non-random mode, prefer "forcing" moves (captures/checks)
    if (!allowRandom) {
        const forcing = candidates.filter(m => m.captured || m.san.includes('+'));
        if (forcing.length > 0) candidates = forcing;
    }
    
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    console.log(`[Bot ${elo}] Queen Magnet: ${chosen.san}`);
    return chosen;
}

/**
 * <800 Heuristic: Tunnel Vision (Piece Chasing)
 * Beginners chase the same piece obsessively, ignoring counterplay
 * TILT-AWARE: Tilted players more likely to tunnel vision
 */
function tryTunnelVision(game: Chess, validMoves: Move[], elo: number): Move | null {
    if (elo >= 800) return null;
    
    const history = game.history({ verbose: true });
    if (history.length < 2) return null;
    
    // Base 60% chance, increased by tilt
    const tunnelChance = 0.6 + currentTiltState.level * 0.3;
    if (Math.random() > tunnelChance) return null;
    
    // Our previous move
    const lastMove = history[history.length - 2];
    if (!lastMove || !lastMove.to) return null;
    
    // What square were we interacting with?
    const targetSquare = lastMove.to;
    
    // Moves that attack or capture the same square again
    const chaseMoves = validMoves.filter(m => 
        m.to === targetSquare || m.captured
    );
    
    if (chaseMoves.length === 0) return null;
    
    const chosen = chaseMoves[Math.floor(Math.random() * chaseMoves.length)];
    console.log(`[Bot <800] Tunnel Vision: continuing chase to ${chosen.san}`);
    return chosen;
}

/**
 * Helper: Piece value for greed calculation
 */
function pieceValue(piece: string): number {
    switch (piece) {
        case 'p': return 1;
        case 'n': case 'b': return 3;
        case 'r': return 5;
        case 'q': return 9;
        case 'k': return 1000; // king can't actually be captured
        default: return 0;
    }
}

/**
 * Greed Capture Bias (<1800)
 * Humans overvalue capturing material, especially "free" pieces
 * Lower ELO = reckless greed, higher ELO = occasional traps
 */
function tryGreedCapture(game: Chess, validMoves: Move[], elo: number): Move | null {
    // Only apply for <1800
    if (elo >= 1800) return null;
    
    const captureMoves = validMoves.filter(m => m.captured);
    if (captureMoves.length === 0) return null;
    
    // Greed bias % depends on ELO + tilt
    const baseChance = 
        elo < 500 ? 0.55 :
        elo < 800 ? 0.35 :
        elo < 1000 ? 0.25 :
        elo < 1400 ? 0.15 : 0.08;
    
    const effectiveChance = baseChance + currentTiltState.level * 0.2;
    
    if (Math.random() > effectiveChance) return null;
    
    // Pick "most tempting" capture (highest value piece)
    const maxValue = Math.max(...captureMoves.map(m => pieceValue(m.captured!)));
    const tempting = captureMoves.filter(m => pieceValue(m.captured!) === maxValue);
    
    const chosen = tempting[Math.floor(Math.random() * tempting.length)];
    console.log(`[Bot ${elo}] Greed Capture: ${chosen.san} (taking ${chosen.captured})`);
    return chosen;
}

/**
 * Panic Checks (<1400)
 * Humans panic when in check, sometimes making suboptimal defensive moves
 */
function tryPanicCheck(game: Chess, validMoves: Move[], elo: number): Move | null {
    if (!game.isCheck()) return null;
    
    // Chance of panic depends on ELO + tilt
    const basePanic = 
        elo < 500 ? 0.80 :
        elo < 800 ? 0.50 :
        elo < 1000 ? 0.35 :
        elo < 1200 ? 0.20 :
        elo < 1400 ? 0.10 : 0.05;
    
    const panicChance = basePanic + currentTiltState.level * 0.25;
    
    if (Math.random() > panicChance) return null;
    
    // All moves in chess.js are legal, so all validMoves escape check
    // Panic = choose at random among escapes (ignoring quality)
    const chosen = validMoves[Math.floor(Math.random() * validMoves.length)];
    console.log(`[Bot ${elo}] Panic Check: ${chosen.san}`);
    return chosen;
}

/**
 * The New Algorithm: Human-Like Move Selection
 * 
 * Key principle: Humans don't evaluate then pick badly.
 * They LIMIT what they see first, then pick from that limited view.
 * 
 * Order of operations:
 * 1. Tactical Blindness (skip analysis entirely)
 * 2. <500 Queen Magnet heuristic
 * 3. <800 Tunnel Vision heuristic  
 * 4. Engine candidate generation (limited pool)
 * 5. Weighted category selection
 */
async function getProbabilisticMove(
    game: Chess,
    bot: BotProfile,
    validMoves: Move[],
    stats: { elo: number, depth: number }
): Promise<BotMoveResult | null> {
    
    /* =================================
       0. TILT DECAY
       Emotional recovery each move
       ================================= */
    decayTilt();
    
    /* =================================
       1. PANIC CHECKS (when in check)
       Humans panic when threatened
       ================================= */
    
    const panicMove = tryPanicCheck(game, validMoves, stats.elo);
    if (panicMove) {
        applyTiltAfterMove('Mistake', stats.elo);
        return { ...panicMove, moveCategory: 'Mistake', decisionReason: 'PanicCheck' };
    }
    
    /* =================================
       2. TACTICAL BLINDNESS LAYER
       Human completely skips calculation
       TILT-AWARE: Tilted players more likely to skip thinking
       ================================= */
    
    const baseBlindness =
        stats.elo < 500 ? 0.85 :
        stats.elo < 800 ? 0.65 :
        stats.elo < 1000 ? 0.50 :
        stats.elo < 1200 ? 0.35 :
        stats.elo < 1400 ? 0.25 :
        stats.elo < 1600 ? 0.18 :
        stats.elo < 1800 ? 0.12 :
        stats.elo < 2000 ? 0.08 :
        stats.elo < 2200 ? 0.04 : 0.015;
    
    // TILT EFFECT: Blunders cause follow-up blunders
    const effectiveBlindness = Math.min(0.95, baseBlindness + currentTiltState.level * 0.35);
    
    if (currentTiltState.level > 0.1) {
        console.log(`[Bot Tilt] level=${currentTiltState.level.toFixed(2)}, blindness=${effectiveBlindness.toFixed(2)}`);
    }
    
    if (Math.random() < effectiveBlindness) {
        // <500 = literally random legal move (no pattern recognition)
        if (stats.elo < 500) {
            const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            console.log(`[Bot <500] Blindness -> Random move: ${randomMove.san}`);
            applyTiltAfterMove('Blunder', stats.elo);
            return { ...randomMove, moveCategory: 'Blunder', decisionReason: 'Blindness_Random' };
        }
        
        // 500-800+ = "looks normal" move (basic pattern recognition)
        // Filter out weird promotions, en passant (confusing for beginners)
        const plausible = validMoves.filter(m =>
            !m.promotion &&
            !m.flags.includes('e') // en passant
        );
        
        const chosen = plausible.length > 0
            ? plausible[Math.floor(Math.random() * plausible.length)]
            : validMoves[Math.floor(Math.random() * validMoves.length)];
        
        console.log(`[Bot ${stats.elo}] Blindness -> Plausible move: ${chosen.san}`);
        applyTiltAfterMove('Blunder', stats.elo);
        return { ...chosen, moveCategory: 'Blunder', decisionReason: 'Blindness_Plausible' };
    }
    
    /* =================================
       3. QUEEN MAGNET (<500-1200)
       Rating-aware queen blunder chance
       ================================= */
    
    const queenMove = tryQueenMagnet(game, validMoves, stats.elo);
    if (queenMove) {
        // <800 = obvious blunder, 800+ = tactical mistake
        return { 
            ...queenMove, 
            moveCategory: stats.elo < 800 ? 'Blunder' : 'Mistake',
            decisionReason: 'QueenMagnet'
        };
    }
    
    /* =================================
       4. <800 TUNNEL VISION HEURISTIC
       ================================= */
    
    const tunnelMove = tryTunnelVision(game, validMoves, stats.elo);
    if (tunnelMove) {
        return { ...tunnelMove, moveCategory: 'Mistake', decisionReason: 'TunnelVision' };
    }
    
    /* =================================
       5. GREED CAPTURE BIAS (<1800)
       Humans overvalue capturing material
       ================================= */
    
    const greedMove = tryGreedCapture(game, validMoves, stats.elo);
    if (greedMove) {
        return { ...greedMove, moveCategory: 'Mistake', decisionReason: 'GreedCapture' };
    }
    
    /* =================================
       6. ENGINE CANDIDATE GENERATION
       Limited pool based on rating
       TILT-AWARE: See fewer ideas when tilted
       ================================= */
    
    const basePoolSize =
        stats.elo < 500 ? 1 :   // Almost no calculation
        stats.elo < 800 ? 2 :
        stats.elo < 1000 ? 3 :
        stats.elo < 1200 ? 3 :
        stats.elo < 1400 ? 4 :
        stats.elo < 1600 ? 5 :
        stats.elo < 1800 ? 6 :
        stats.elo < 2000 ? 8 :
        stats.elo < 2200 ? 10 : 12;
    
    // TILT PENALTY: Tilted players see fewer options
    const tiltPenalty = Math.round(currentTiltState.level * 2);
    const poolSize = Math.max(1, basePoolSize - tiltPenalty);
    
    const { settings } = getCategoryEngineSettings(bot.category, bot.isBoss);
    const analysisDepth = Math.max(6, stats.depth);
    
    let candidates;
    if (mockCandidateGenerator) {
        candidates = await mockCandidateGenerator(game.fen(), poolSize);
    } else {
        candidates = await getBotCandidates(
            game.fen(),
            poolSize,
            analysisDepth,
            { moveTime: 800, ...settings }
        );
    }
    
    // Fallback if no candidates
    if (candidates.length === 0) {
        console.warn('[Bot] No candidates, using random valid move');
        const fallback = validMoves[Math.floor(Math.random() * validMoves.length)];
        return { ...fallback, moveCategory: 'Fallback', decisionReason: 'EngineFail_Random' };
    }
    
    /* =================================
       5. HUMAN CATEGORY BIAS
       Weighted random selection based on ELO-based probability table
       ================================= */
    
    // Get probabilities for this ELO and apply personality
    let baseProbs = getProbabilities(stats.elo);
    let finalProbs = applyPersonality(baseProbs, bot.personality);

    // Classification indices: 0:Bril, 1:Best, 2:Excel, 3:Inacc, 4:Mistake, 5:Blunder
    const chosenCategoryIndex = weightedIndex(finalProbs);
    const categoryNames = ['Brilliant', 'Best', 'Excellent', 'Inaccuracy', 'Mistake', 'Blunder'];
    const targetCategory = categoryNames[chosenCategoryIndex];

    // Find the best candidate that matches the target category
    // Candidates are sorted best to worst.
    let bestMatch = candidates[0]; // Default to best
    let foundMatch = false;

    // Try to find a candidate in the target category
    const bestScore = candidates[0].score;
    for (const cand of candidates) {
        // Move classification logic (if engine didn't provide it)
        let candCategory = (cand as any).category;
        if (!candCategory) {
            const rawDiff = Math.abs(cand.score - bestScore);
            if (rawDiff <= CLASSIFICATION_THRESHOLDS.BEST) candCategory = 'Best';
            else if (rawDiff <= CLASSIFICATION_THRESHOLDS.EXCELLENT) candCategory = 'Excellent';
            else if (rawDiff <= CLASSIFICATION_THRESHOLDS.INACCURACY) candCategory = 'Inaccuracy';
            else if (rawDiff <= CLASSIFICATION_THRESHOLDS.MISTAKE) candCategory = 'Mistake';
            else candCategory = 'Blunder';
        }

        if (candCategory === targetCategory) {
            bestMatch = { ...cand, category: candCategory, rawDiff: cand.score - bestScore } as any;
            foundMatch = true;
            break;
        }
    }

    // Fallback: if target category not found in candidates (e.g., no inaccuracies listed),
    // we pick a candidate that is "closest" or just use probability rank.
    if (!foundMatch) {
        const poolIndex = Math.min(chosenCategoryIndex, candidates.length - 1);
        const selected = candidates[poolIndex];
        bestMatch = { ...selected, category: (selected as any).category || 'Best', rawDiff: selected.score - bestScore } as any;
    }
    
    const move = parseLan(bestMatch.move, validMoves);
    if (!move) {
        console.warn('[Bot] Failed to parse chosen move, using first valid');
        return { ...validMoves[0], moveCategory: 'Fallback', decisionReason: 'EngineFail_ParseError' };
    }
    
    /* =================================
       6. HUMAN ERROR AMPLIFICATION
       Low ELO sometimes "second-guesses" into worse move
       ================================= */
    
    if (stats.elo < 1200 && Math.random() < 0.15) {
        // 15% chance to play a different piece entirely (second-guessing)
        const otherMoves = validMoves.filter(m => m.from !== move.from);
        if (otherMoves.length > 0) {
            const worse = otherMoves[Math.floor(Math.random() * otherMoves.length)];
            console.log(`[Bot ${stats.elo}] Second-guessing into: ${worse.san}`);
            return { ...worse, moveCategory: 'Mistake', decisionReason: 'HumanError_SecondGuess' };
        }
    }
    
    const moveCategory = (bestMatch as any).category || targetCategory;
    console.log(`[Bot ${stats.elo}] Playing category ${targetCategory}: ${bestMatch.move} (${moveCategory})`);
    
    return { ...move, isBookMove: false, moveCategory, decisionReason: `EngineProbability_${targetCategory}` };
}

/**
 * Calculate Delay
 */
export function calculateBotDelay(
  game: Chess, 
  bot: BotProfile, 
  isBookMove: boolean = false, 
  moveCategory?: string,
  timeLeftMs?: number
): number {
  const stats = getEffectiveBotStats(bot, 1000);
  const history = game.history();
  const moveNumber = Math.ceil((history.length + 1) / 2);
  const pieceCount = game.board().flat().filter(p => p !== null).length;

  // --- TIME TROUBLE OVERRIDE ---
  if (timeLeftMs !== undefined) {
      // PANIC: < 10 seconds? Move almost instantly
      if (timeLeftMs < 10000) {
          console.log(`[Bot Time] Panic! ${timeLeftMs}ms left. Moving instantly.`);
          return 200 + Math.random() * 600;
      }
      // URGENT: < 30 seconds? Move fast
      if (timeLeftMs < 30000) {
           return Math.min(2000, timeLeftMs * 0.1);
      }
  }

  // --- SPECIAL CASE: CAL (THE LIGHTNING BOLT) ---
  if (bot.id === 'bot-cal') {
    // Cal Specific Time Trouble: if < 60s, uses at most 10% of remaining time
    if (timeLeftMs !== undefined && timeLeftMs < 60000) {
        return Math.min(timeLeftMs * 0.1, 1000 + Math.random() * 1000);
    }

    // 1. Opening: First 5 moves are lightning fast for a human (1-2s)
    if (moveNumber <= 5) {
      return 1000 + Math.random() * 1000;
    }

    // 2. Middlegame (>12 pieces): Deep theoretical calculation (1-30s)
    if (pieceCount > 12) {
      const complexity = calculateComplexity(game);
      const baseMid = 1000 + (complexity * 25000); 
      const variance = 0.7 + Math.random() * 0.6; 
      return Math.max(1000, Math.min(baseMid * variance, 30000));
    }

    // 3. Endgame (<=12 pieces): Precise but faster endgame technique (1-15s)
    const baseEnd = 1000 + (calculateComplexity(game) * 12000);
    return Math.max(1000, Math.min(baseEnd * (0.8 + Math.random() * 0.4), 15000));
  }
  
  if (isBookMove) return stats.elo >= 1800 ? 500 + Math.random() * 500 : 1500 + Math.random() * 2000;

  const complexity = calculateComplexity(game);
  const baseTime = 1000 + (stats.elo / 1.5); 
  
  // Complexity Factor
  let factor = 1.0 + complexity;
  
  // QUALITY-BASED THINKING TIME IMPLEMENTATION
  if (moveCategory) {
      if (['Brilliant', 'Best'].includes(moveCategory)) {
          factor *= 1.5; // Deep thought for good moves
          if (stats.elo > 2000) factor *= 1.2; // GMs think even deeper or appear to
      } else if (['Blunder', 'Mistake'].includes(moveCategory)) {
          // Bad moves are often impulsive
          if (stats.elo < 1200) factor *= 0.5; // Kids play fast and wrong
          else factor *= 0.8; // Others might rush
      }
  }

  if (bot.personality === 'time_scrambler') factor *= 0.5;
  if (bot.personality === 'solid') factor *= 1.3;
  
  // Variance
  const variance = 0.8 + Math.random() * 0.4;
  
  const delay = baseTime * factor * variance * (bot.moveSpeed || 1);
  
  // Final Safety Check
  if (timeLeftMs !== undefined && timeLeftMs < 60000) {
       return Math.min(delay, timeLeftMs * 0.1);
  }

  return Math.max(600, Math.min(delay, 25000));
}

function calculateComplexity(game: Chess): number {
    const pieces = game.board().flat().filter(p => p !== null).length;
    return pieces / 32;
}

function parseLan(lan: string, validMoves: Move[]): Move | undefined {
    if (!lan) return undefined;
    const from = lan.substring(0, 2);
    const to = lan.substring(2, 4);
    const promotion = lan.length > 4 ? lan.substring(4, 5) : undefined;
    return validMoves.find(m => m.from === from && m.to === to && (promotion ? m.promotion === promotion : true));
}

function findTranspositionMoves(game: Chess, repertoire: OpeningVariation[], maxDepth: number): { move: string, opening: OpeningVariation }[] {
    const targets: { move: string, opening: OpeningVariation }[] = [];
    const currentFen = game.fen().split(' ').slice(0, 4).join(' '); // No clocks
    const sim = new Chess();

    for (const op of repertoire) {
        sim.reset();
        for (let i = 0; i < Math.min(op.moves.length, maxDepth); i++) {
            const uci = op.moves[i];
            const simFen = sim.fen().split(' ').slice(0, 4).join(' ');
            
            if (simFen === currentFen) {
                targets.push({ move: uci, opening: op });
                break; 
            }
            
            try {
                // Try parsing as SAN first (chess.js handles it best)
                let result = sim.move(uci);
                
                // If failed (maybe it's UCI "e2e4"), try object format
                if (!result) {
                     const from = uci.substring(0, 2);
                     const to = uci.substring(2, 4);
                     const promotion = uci.length > 4 ? uci.substring(4, 5) : undefined;
                     result = sim.move({ from, to, promotion });
                }
                
                if (!result) break; // Invalid move in sequence, stop following this line
            } catch (err) {
                // console.warn(`[Bot] Transposition search error on move ${uci}:`, err);
                break; 
            }
        }
    }
    return targets;
}

// Helper: Match opening against preferences (keywords)
function matchesPreference(op: OpeningVariation, keyword: string): boolean {
    const k = keyword.toLowerCase();
    return op.id.toLowerCase().includes(k) 
        || op.opening.toLowerCase().includes(k) 
        || op.name.toLowerCase().includes(k);
}

function filterRepertoireByPreferences(
    repertoire: OpeningVariation[],
    prefs: NonNullable<BotProfile['openingPreferences']>,
    turn: 'w' | 'b',
    history: any[]
): OpeningVariation[] {
    
    let keywords: string[] = [];

    if (turn === 'w') {
        keywords = [...prefs.white];
    } else {
        // Black: Check opponent's first move
        const whiteFirstMove = history.length > 0 ? history[0] : null;
        
        if (whiteFirstMove) {
            const to = whiteFirstMove.to;
            if (to === 'e4') {
                keywords = [...prefs.blackVsE4];
            } else if (to === 'd4') {
                 keywords = [...prefs.blackVsD4];
            } else if (to === 'c4') {
                 keywords = [...prefs.blackVsC4];
            } else {
                 keywords = [...prefs.blackVsModern];
            }
        } else {
             // Should not happen if it's Black's turn
             keywords = [...prefs.blackVsE4]; 
        }
    }

    // CHECK FOR ADAPTIVE LOGIC: 'auto-favorite'
    // If the bot is set to play the user's favorite, we look it up.
    if (keywords.includes('auto-favorite')) {
        const favoriteOpeningId = getUserFavoriteOpening(3); // Minimum 3 games to establish favorite
        if (favoriteOpeningId) {
            // Replace 'auto-favorite' with the concrete opening ID
            keywords = keywords.map(k => k === 'auto-favorite' ? favoriteOpeningId : k);
        } else {
            // No favorite established yet, remove the keyword so we likely fall back to default rating logic
            // or just play normally if other keywords exist.
            keywords = keywords.filter(k => k !== 'auto-favorite');
        }
    }

    return repertoire.filter(op => {
        if (op.playerColor !== turn) return false;
        return keywords.some(k => matchesPreference(op, k));
    });
}
