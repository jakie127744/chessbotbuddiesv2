import { Chess } from 'chess.js';
import { OpeningVariation, DEFAULT_REPERTOIRE } from './openings-repertoire';
import { SRSState, getInitialState, sm2Update, isDue, CardState } from './sm2';
import { loadCustomRepertoire } from './repertoire-storage';

export interface SRSCard {
  id: string; // FEN
  fen: string;
  san: string;
  lineIds: string[];
  moveIndex: number; // Earliest move index if multiple
  openingName: string; // From first line
}

const STORAGE_KEY = 'chess_app_srs_state_v1';

// In-memory cache
let srsStateMap: Record<string, SRSState> = {};
let cardCache: SRSCard[] = [];

// Helper to normalize FEN (remove move clock/halfmove to avoid slight mismatches if irrelevant, but usually for openings they matter)
// Actually for openings, move number matters for castling rights logic etc, so full FEN is safer.
function normalizeFen(fen: string): string {
    return fen; // Keep it simple for now
}

export function loadSRSState(): Record<string, SRSState> {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error("Failed to parse SRS state", e);
        return {};
    }
}

export function saveSRSState(state: Record<string, SRSState>) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    srsStateMap = state;
}

export function generateCards(variations: OpeningVariation[]): SRSCard[] {
    const cardsMap: Record<string, SRSCard> = {};

    variations.forEach(v => {
        const game = new Chess(); 
        // We need to play through the line and capture each position where it's PLAYER'S turn
        // Wait, "Present board locked to card FEN, require user to play the next move".
        // This means we are testing the PLAYER'S moves.
        // If playerColor is 'w', we test move 1, 3, 5...
        // If playerColor is 'b', we test move 2, 4, 6...
        
        v.moves.forEach((uci, idx) => {
            const fenBefore = game.fen();
            const turn = game.turn();
            
            // If it's the player's turn, this is a testable position
            if (turn === v.playerColor) {
               try {
                  // We need to know what the CORRECT move is to store it
                  // We execute the move to get SAN, but the CARD is the position BEFORE the move
                  const moveResult = game.move(uci); // This alters game state
                  if (moveResult) {
                      const id = normalizeFen(fenBefore);
                      
                      if (!cardsMap[id]) {
                          cardsMap[id] = {
                              id,
                              fen: fenBefore,
                              san: moveResult.san,
                              lineIds: [v.id],
                              moveIndex: idx,
                              openingName: v.name
                          };
                      } else {
                          // Merge Line ID
                          if (!cardsMap[id].lineIds.includes(v.id)) {
                              cardsMap[id].lineIds.push(v.id);
                          }
                      }
                      
                      // NOTE: game state is now AFTER the move, ready for next iteration
                  }
               } catch (e) {
                   console.error(`Invalid move ${uci} in variation ${v.id}`);
               }
            } else {
                // Opponent's move, just play it
                try {
                    game.move(uci);
                } catch(e) {}
            }
        });
    });

    return Object.values(cardsMap);
}

// Main hook-like access
export function initializeSRS() {
    srsStateMap = loadSRSState();
    
    // Combine Default + Custom
    const custom = loadCustomRepertoire();
    const allVariations = [...DEFAULT_REPERTOIRE, ...custom];
    
    cardCache = generateCards(allVariations);
    
    // Ensure all cards that ARE in state map are valid?
    // We don't auto-initialize anymore. Only cards explicitly learned are tracked.
    // However, if we want to migrate existing state or ensure consistency:
    // ...
}

export function learnVariation(variationId: string) {
    let count = 0;
    cardCache.forEach(card => {
        if (card.lineIds.includes(variationId)) {
            // Initialize if not exists
            if (!srsStateMap[card.id]) {
                srsStateMap[card.id] = getInitialState(card.id);
                count++;
            }
        }
    });
    
    if (count > 0) {
        saveSRSState(srsStateMap);
        console.log(`Learned ${count} new cards for variation ${variationId}`);
    }
}


export function getDueCards(limit: number = 20): SRSCard[] {
    // 1. Filter cards that are due
    const now = Date.now();
    const dueItems = Object.values(srsStateMap).filter(state => state.nextDue <= now);
    
    // 2. Sort by simple priority (e.g. interval asc, or random shuffling for variety)
    // The user mentions "prioritizing lowest ease and recent failures".
    // Recent failure means low interval/reps.
    dueItems.sort((a, b) => {
        // Primary: Ease (ascending - harder first)
        if (a.ease !== b.ease) return a.ease - b.ease;
        // Secondary: Next Due (ascending - most overdue first)
        return a.nextDue - b.nextDue;
    });
    
    const limitedDue = dueItems.slice(0, limit);
    const dueIds = new Set(limitedDue.map(s => s.cardId));
    
    return cardCache.filter(c => dueIds.has(c.id));
}

export function submitReview(cardId: string, quality: number) {
    if (!srsStateMap[cardId]) return;
    
    const newState = sm2Update(srsStateMap[cardId], quality);
    srsStateMap[cardId] = newState;
    saveSRSState(srsStateMap);
}

export function getCardStats(cardId: string): SRSState | undefined {
    return srsStateMap[cardId];
}

export function getTotalDueCount(): number {
     const now = Date.now();
     return Object.values(srsStateMap).filter(state => state.nextDue <= now).length;
}
