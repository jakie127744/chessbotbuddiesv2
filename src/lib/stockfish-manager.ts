// Optimized Stockfish Manager - Single shared worker instance with caching
let stockfishWorker: Worker | null = null;
let workerInitialized = false;
let messageHandlers: Map<string, (data: string) => void> = new Map();
let evaluationCache: Map<string, { eval: number; depth: number; bestMove: string; timestamp: number }> = new Map();

const CACHE_TTL = 60000; // 1 minute cache
const MAX_CACHE_SIZE = 100;

class Mutex {
    private mutex = Promise.resolve();

    lock(): Promise<() => void> {
        let unlock: () => void = () => {};
        
        // Create a promise that resolves when the previous lock is released
        const willLock = this.mutex.then(() => {
            return new Promise<void>(resolve => {
                unlock = resolve;
            });
        });

        // Update the mutex to wait for the new lock to be released
        this.mutex = willLock;

        // Return a promise that resolves with the unlock function when the lock is acquired
        return new Promise(resolve => {
            // We need to wait for the PREVIOUS promise to resolve before we can proceed
            // But actually, the way this chain works: 
            // 1. this.mutex (old) resolves -> we get the turn.
            // 2. We return 'unlock' to the caller.
            // 3. The NEXT waiter waits for 'willLock', which resolves when 'unlock' is called.
            
            // Wait for the previous lock to be free
            // The previous 'this.mutex' resolves when the previous user calls unlock()
            // So we wait for it:
            // But wait, we modified this.mutex above. We need the OLD one.
            // Let's refactor to be cleaner.
            resolve(unlock);
        });
    }
}

// Cleaner implementation
class SimpleMutex {
    private queue: Promise<void> = Promise.resolve();

    async lock(): Promise<() => void> {
        let unlockNext: () => void = () => {};
        
        // Create a new promise that will be resolved when *we* are done
        const myTurnIsOver = new Promise<void>(resolve => {
            unlockNext = resolve;
        });

        // Capture the current tail of the queue
        const previousTurnIsOver = this.queue;
        
        // Append our turn to the queue
        this.queue = this.queue.then(() => myTurnIsOver);

        // Wait for the previous turn to finish
        await previousTurnIsOver;

        // Return the unlock function that lets the next person proceed
        return unlockNext;
    }
}

const workerMutex = new SimpleMutex();

// Initialize worker once
function getStockfishWorker(): Worker {
  if (!stockfishWorker) {
    createWorker();
  }
  return stockfishWorker!;
}

function createWorker() {
    // CB-304: Performance mark for engine cold start monitoring
    performance.mark('stockfish-init-start');
    console.log('[Stockfish] Initializing engine...');

    // HMR Cleanup: Terminate existing worker attached to window to prevent "Zombie Workers" in Dev
    if (typeof window !== 'undefined' && (window as any).__STOCKFISH_WORKER_INSTANCE__) {
        console.log('[Stockfish] HMR Reload: Terminating old worker instance...');
        (window as any).__STOCKFISH_WORKER_INSTANCE__.terminate();
    }
    
    stockfishWorker = new Worker('/stockfish.js');
    
    // Store reference for future HMR cleanups
    if (typeof window !== 'undefined') {
        (window as any).__STOCKFISH_WORKER_INSTANCE__ = stockfishWorker;
    }

    stockfishWorker.onerror = (e) => {
        const msg = e instanceof ErrorEvent ? e.message : 'Unknown Worker Error';
        const file = e instanceof ErrorEvent ? e.filename : '';
        const line = e instanceof ErrorEvent ? e.lineno : 0;
        console.error(`[Stockfish] Worker Error: ${msg} in ${file}:${line}`, e);
        // Terminate and clear to force respawn on next call
        terminateStockfish();
    };

    stockfishWorker.onmessage = (event) => {
      const line = event.data;
      
      // CB-304: Track when engine is ready
      if (line === 'readyok' && !workerInitialized) {
        performance.mark('stockfish-init-end');
        performance.measure('stockfish-cold-start', 'stockfish-init-start', 'stockfish-init-end');
        const measure = performance.getEntriesByName('stockfish-cold-start')[0];
        console.log(`[Stockfish] Engine ready in ${measure?.duration.toFixed(0)}ms (cold start)`);
      }
      
      // Dispatch to all registered handlers
      messageHandlers.forEach((handler) => {
        handler(line);
      });
    };

    // Initialize UCI
    stockfishWorker.postMessage('uci');
    
    // Configure engine with LOW defaults (will be overridden per-bot)
    // Default to beginner-level settings for safety
    stockfishWorker.postMessage('setoption name Threads value 1');
    stockfishWorker.postMessage('setoption name Hash value 16');
    stockfishWorker.postMessage('setoption name MultiPV value 5');
    
    stockfishWorker.postMessage('isready');
    workerInitialized = true;
    console.log('[Stockfish] Shared worker initialized with default (low) settings');
}

// Wait for engine to be ready (quiescent) with safety timeout
function waitForReady(worker: Worker): Promise<void> {
    return new Promise(resolve => {
        const handlerId = `ready-${Date.now()}-${Math.random()}`;
        
        const timeout = setTimeout(() => {
            unregisterMessageHandler(handlerId);
            console.warn('[Stockfish] waitForReady timed out (10s)');
            resolve();
        }, 10000);

        const handler = (line: string) => {
            if (line === 'readyok') {
                clearTimeout(timeout);
                unregisterMessageHandler(handlerId);
                resolve();
            }
        };
        registerMessageHandler(handlerId, handler);
        worker.postMessage('isready');
    });
}

// Clean up old cache entries
function cleanCache() {
  const now = Date.now();
  const entries = Array.from(evaluationCache.entries());
  
  // Remove expired entries
  entries.forEach(([key, value]) => {
    if (now - value.timestamp > CACHE_TTL) {
      evaluationCache.delete(key);
    }
  });
  
  // Remove oldest entries if cache is too large
  if (evaluationCache.size > MAX_CACHE_SIZE) {
    const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    sorted.slice(0, entries.length - MAX_CACHE_SIZE).forEach(([key]) => {
      evaluationCache.delete(key);
    });
  }
}

// Get cached evaluation or undefined
export function getCachedEvaluation(fen: string) {
  cleanCache();
  return evaluationCache.get(fen);
}

// Store evaluation in cache
function cacheEvaluation(fen: string, evaluation: number, depth: number, bestMove: string) {
  evaluationCache.set(fen, {
    eval: evaluation,
    depth,
    bestMove,
    timestamp: Date.now()
  });
}

// Register a message handler
export function registerMessageHandler(id: string, handler: (data: string) => void) {
  messageHandlers.set(id, handler);
}

// Unregister a message handler
export function unregisterMessageHandler(id: string) {
  messageHandlers.delete(id);
}

// Analyze position with configurable depth
export async function analyzePosition(fen: string, options: {
  depth?: number;
  multiPV?: number;
  skillLevel?: number;
  elo?: number; // New ELO option
  moveTime?: number; // Time limit in ms
}) {
  const { depth = 15, multiPV = 1, skillLevel, elo, moveTime } = options;
  
  // Check cache first
  const cached = getCachedEvaluation(fen);
  if (cached && cached.depth >= depth) {
    console.log('[Stockfish] Using cached evaluation for', fen.substring(0, 20));
    return cached;
  }
  
  const worker = getStockfishWorker();
  
  // Acquire lock to prevent conflict with Bot moves
  const unlock = await workerMutex.lock();
  
  try {
      // Sync first
      worker.postMessage('stop');
      await waitForReady(worker);
      
      // Configure engine
      worker.postMessage(`setoption name MultiPV value ${multiPV}`); // Restore MultiPV for analysis
      if (skillLevel !== undefined) {
        console.log(`[Stockfish] Setting Skill Level: ${skillLevel}`);
        worker.postMessage(`setoption name Skill Level value ${skillLevel}`);
      }
      if (elo !== undefined) {
        console.log(`[Stockfish] Limiting Strength to ELO: ${elo}`);
        worker.postMessage(`setoption name UCI_LimitStrength value true`);
        worker.postMessage(`setoption name UCI_Elo value ${elo}`);
      } else {
        console.log(`[Stockfish] Strength Uncapped`);
        worker.postMessage(`setoption name UCI_LimitStrength value false`);
      }
      
      // Start analysis
      worker.postMessage(`position fen ${fen}`);
      
      if (moveTime) {
        worker.postMessage(`go movetime ${moveTime}`);
      } else {
        worker.postMessage(`go depth ${depth}`);
      }
  } finally {
      unlock();
  }
  
  return null; // Analysis in progress
}

// Get best move quickly (for bot play)
// Get best move with flexible options
export function getBestMove(fen: string, options: { depth?: number; skillLevel?: number; elo?: number; moveTime?: number } = {}): Promise<string> {
  return new Promise(async (resolve) => {
    // Acquire lock immediately to reserve worker
    const unlock = await workerMutex.lock();
    
    try {
        const worker = getStockfishWorker();
        const handlerId = `bestmove-${Date.now()}`;
        const { depth, skillLevel, elo, moveTime } = options;
        
        // Default to moveTime 1000 if nothing specified, unless depth is specified
        const shouldUseTime = moveTime !== undefined || depth === undefined;
        const actualMoveTime = moveTime ?? 1000;

        const timeout = setTimeout(() => {
          unregisterMessageHandler(handlerId);
          unlock();
          console.warn('[Stockfish] getBestMove timed out after 12s');
          resolve('');
        }, 12000);

        const handler = (line: string) => {
          if (line.startsWith('bestmove')) {
            clearTimeout(timeout);
            const match = line.match(/bestmove (\S+)/);
            if (match) {
              unregisterMessageHandler(handlerId);
              unlock(); // Release lock when done
              resolve(match[1]);
            }
          }
        };
        
        registerMessageHandler(handlerId, handler);
        
        // Sync first
        worker.postMessage('stop');
        await waitForReady(worker);

        // Configure and analyze
        worker.postMessage('setoption name MultiPV value 1'); // Ensure MultiPV is 1 for bot moves
        if (skillLevel !== undefined) {
          console.log(`[Stockfish] Setting Skill Level: ${skillLevel}`);
          worker.postMessage(`setoption name Skill Level value ${skillLevel}`);
        }
        
        // CRITICAL FIX: Always explicitly set LimitStrength to avoid pollution from previous calls
        if (elo !== undefined) {
            console.log(`[Stockfish] Limiting Strength to ELO: ${elo}`);
            worker.postMessage(`setoption name UCI_LimitStrength value true`);
            worker.postMessage(`setoption name UCI_Elo value ${elo}`);
        } else {
            // Explicitly disable it if no ELO provided (reverting any previous 'true' state)
            worker.postMessage(`setoption name UCI_LimitStrength value false`);
        }
        worker.postMessage(`position fen ${fen}`);
        
        if (depth) {
          worker.postMessage(`go depth ${depth}`);
        } else {
          worker.postMessage(`go movetime ${actualMoveTime}`);
        }
    } catch (e) {
        unlock(); // Release lock on error
        console.error('[Stockfish] Error in getBestMove:', e);
        resolve(''); // Resolve empty to avoid hanging
    }
  });
}

// Terminate worker (call on app unmount)
export function terminateStockfish() {
  if (stockfishWorker) {
    stockfishWorker.terminate();
    stockfishWorker = null;
    workerInitialized = false;
    messageHandlers.clear();
    evaluationCache.clear();
    console.log('[Stockfish] Worker terminated');
  }
}

// Forcefully stop any running search gracefully
export function stopSharedWorker() {
  if (stockfishWorker) {
    stockfishWorker.postMessage('stop');
    console.log('[Stockfish] Worker explicitly stopped via stopSharedWorker');
  }
}

// Export cache stats for debugging
export function getStockfishStats() {
  return {
    cacheSize: evaluationCache.size,
    handlerCount: messageHandlers.size,
    workerActive: !!stockfishWorker
  };
}

// Engine settings interface for category-based difficulty
export interface BotEngineSettings {
    threads?: number;
    hash?: number;
    moveTime?: number; // in milliseconds
}

// Get multiple candidate moves with evaluations
export function getBotCandidates(
    fen: string, 
    multiPV: number, 
    depth: number,
    engineSettings?: BotEngineSettings
): Promise<{ move: string; score: number; mate?: number }[]> {
    return new Promise(async (resolve) => {
        const unlock = await workerMutex.lock();
        
        try {
            const worker = getStockfishWorker();
            const handlerId = `candidates-${Date.now()}`;
            
            // Store latest analysis for each MultiPV line
            // Key = multipv index (1-based), Value = move data
            const candidates = new Map<number, { move: string; score: number; mate?: number }>();
            
            // Dynamic timeout based on moveTime setting (with safety margin)
            const timeoutMs = (engineSettings?.moveTime || 5000) + 7000;
            const timeout = setTimeout(() => {
                unregisterMessageHandler(handlerId);
                unlock();
                console.warn(`[Stockfish] getBotCandidates timed out after ${timeoutMs}ms`);
                resolve([]);
            }, timeoutMs);

            const handler = (line: string) => {
                // Parse info lines for score and pv
                if (line.startsWith('info') && line.includes('multipv') && line.includes('pv')) {
                   try {
                       // Extract MultiPV Index
                       const multipvMatch = line.match(/multipv (\d+)/);
                       const idx = multipvMatch ? parseInt(multipvMatch[1]) : 1;
                       
                       // Extract Score
                       let score = 0;
                       let mate: number | undefined;
                       
                       const scoreMatch = line.match(/score cp (-?\d+)/);
                       const mateMatch = line.match(/score mate (-?\d+)/);
                       
                       if (mateMatch) {
                           mate = parseInt(mateMatch[1]);
                           // Convert mate to high score for sorting
                           score = mate > 0 ? 10000 - mate : -10000 - mate;
                       } else if (scoreMatch) {
                           score = parseInt(scoreMatch[1]);
                       }
                       
                       // Extract PV (first move)
                       const pvMatch = line.match(/ pv ([\w\d]+)/);
                       const move = pvMatch ? pvMatch[1] : '';
                       
                       if (move) {
                           candidates.set(idx, { move, score, mate });
                       }
                   } catch (e) {
                       // Ignore parse errors
                   }
                }
                
                // Done analyzing
                if (line.startsWith('bestmove')) {
                    clearTimeout(timeout);
                    unregisterMessageHandler(handlerId);
                    unlock();
                    
                    // Convert map to array and sort by score desc (best first)
                    const result = Array.from(candidates.values())
                        .sort((a, b) => b.score - a.score);
                        
                    resolve(result.length > 0 ? result : []);
                }
            };
            
            registerMessageHandler(handlerId, handler);
            
            // Sync
            worker.postMessage('stop');
            await waitForReady(worker);
            
            // Apply category-based engine settings
            const threads = engineSettings?.threads || 1;
            const hash = engineSettings?.hash || 16;
            const moveTime = engineSettings?.moveTime || 1000;
            
            worker.postMessage(`setoption name Threads value ${threads}`);
            worker.postMessage(`setoption name Hash value ${hash}`);
            worker.postMessage(`setoption name MultiPV value ${multiPV}`);
            worker.postMessage('setoption name Skill Level value 20'); // Use full skill for analysis
            worker.postMessage('setoption name UCI_LimitStrength value false');
            worker.postMessage(`position fen ${fen}`);
            
            // Use movetime instead of depth for more predictable difficulty
            worker.postMessage(`go movetime ${moveTime}`);
            console.log(`[Bot Engine] Analyzing with: Threads=${threads}, Hash=${hash}MB, MoveTime=${moveTime}ms, MultiPV=${multiPV}`);
            
        } catch (e) {
            unlock();
            console.error('[Stockfish] Error in getBotCandidates:', e);
            resolve([]);
        }
    });
}
