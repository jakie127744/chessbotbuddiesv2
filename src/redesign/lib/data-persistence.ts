'use client';

import { VariationPerformance } from './mastery-manager';
import { RecallHistory } from './recall-mode-logic';

/**
 * Data Persistence Layer
 * Saves and loads mastery tracking data to localStorage and Supabase
 */

const STORAGE_KEY_MASTERY = 'chess_app_mastery_data';
const STORAGE_KEY_RECALL = 'chess_app_recall_history';
const STORAGE_KEY_CONCEPT = 'chess_app_concept_diagnostics';

/**
 * Save mastery performance data to localStorage
 */
export function saveMasteryData(performances: Map<string, VariationPerformance>): void {
  if (typeof window === 'undefined') return;
  try {
    const data = Object.fromEntries(
      Array.from(performances.entries()).map(([key, value]) => [
        key,
        {
          ...value,
          lastReviewDate: value.lastReviewDate.toISOString(),
          nextReviewDate: value.nextReviewDate.toISOString(),
        },
      ])
    );
    localStorage.setItem(STORAGE_KEY_MASTERY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save mastery data:', error);
  }
}

/**
 * Load mastery performance data from localStorage
 */
export function loadMasteryData(): Map<string, VariationPerformance> {
  if (typeof window === 'undefined') return new Map();
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MASTERY);
    if (!stored) return new Map();

    const data = JSON.parse(stored);
    const performances = new Map<string, VariationPerformance>();

    for (const [key, value] of Object.entries(data)) {
      const perf = value as any;
      performances.set(key, {
        ...perf,
        lastReviewDate: new Date(perf.lastReviewDate),
        nextReviewDate: new Date(perf.nextReviewDate),
      });
    }

    return performances;
  } catch (error) {
    console.error('Failed to load mastery data:', error);
    return new Map();
  }
}

/**
 * Save recall history to localStorage
 */
export function saveRecallHistory(history: Map<string, RecallHistory>): void {
  if (typeof window === 'undefined') return;
  try {
    const data = Object.fromEntries(
      Array.from(history.entries()).map(([key, value]) => [
        key,
        {
          ...value,
          lastAttemptDate: value.lastAttemptDate.toISOString(),
          nextRecallDate: value.nextRecallDate.toISOString(),
        },
      ])
    );
    localStorage.setItem(STORAGE_KEY_RECALL, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save recall history:', error);
  }
}

/**
 * Load recall history from localStorage
 */
export function loadRecallHistory(): Map<string, RecallHistory> {
  if (typeof window === 'undefined') return new Map();
  try {
    const stored = localStorage.getItem(STORAGE_KEY_RECALL);
    if (!stored) return new Map();

    const data = JSON.parse(stored);
    const history = new Map<string, RecallHistory>();

    for (const [key, value] of Object.entries(data)) {
      const record = value as any;
      history.set(key, {
        ...record,
        lastAttemptDate: new Date(record.lastAttemptDate),
        nextRecallDate: new Date(record.nextRecallDate),
      });
    }

    return history;
  } catch (error) {
    console.error('Failed to load recall history:', error);
    return new Map();
  }
}

/**
 * Save concept diagnostics data to localStorage
 */
export function saveConceptDiagnostics(diagnostics: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CONCEPT, JSON.stringify(diagnostics));
  } catch (error) {
    console.error('Failed to save concept diagnostics:', error);
  }
}

/**
 * Load concept diagnostics data from localStorage
 */
export function loadConceptDiagnostics(): Record<string, any> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CONCEPT);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to load concept diagnostics:', error);
    return {};
  }
}

/**
 * Clear all stored data (for reset/logout)
 */
export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_MASTERY);
    localStorage.removeItem(STORAGE_KEY_RECALL);
    localStorage.removeItem(STORAGE_KEY_CONCEPT);
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
}

/**
 * Export all data as JSON (for backup)
 */
export function exportAllData(
  performances: Map<string, VariationPerformance>,
  recallHistory: Map<string, RecallHistory>,
  conceptDiagnostics: Record<string, any>
): string {
  const export_data = {
    exportDate: new Date().toISOString(),
    mastery: Object.fromEntries(performances),
    recall: Object.fromEntries(recallHistory),
    concepts: conceptDiagnostics,
  };

  return JSON.stringify(export_data, null, 2);
}

/**
 * Import data from JSON export
 */
export function importData(jsonData: string): {
  performances: Map<string, VariationPerformance>;
  recallHistory: Map<string, RecallHistory>;
  conceptDiagnostics: Record<string, any>;
} | null {
  try {
    const data = JSON.parse(jsonData);

    const performances = new Map<string, VariationPerformance>();
    if (data.mastery) {
      for (const [key, value] of Object.entries(data.mastery)) {
        const perf = value as any;
        performances.set(key, {
          ...perf,
          lastReviewDate: new Date(perf.lastReviewDate),
          nextReviewDate: new Date(perf.nextReviewDate),
        });
      }
    }

    const recallHistory = new Map<string, RecallHistory>();
    if (data.recall) {
      for (const [key, value] of Object.entries(data.recall)) {
        const record = value as any;
        recallHistory.set(key, {
          ...record,
          lastAttemptDate: new Date(record.lastAttemptDate),
          nextRecallDate: new Date(record.nextRecallDate),
        });
      }
    }

    return {
      performances,
      recallHistory,
      conceptDiagnostics: data.concepts || {},
    };
  } catch (error) {
    console.error('Failed to import data:', error);
    return null;
  }
}

/**
 * Sync data to Supabase (optional - backend persistence)
 * This would be called periodically or on session end
 */
export async function syncToSupabase(
  userId: string,
  performances: Map<string, VariationPerformance>,
  recallHistory: Map<string, RecallHistory>
): Promise<boolean> {
  try {
    // Example endpoint - would need actual Supabase integration
    const response = await fetch('/api/user-progress/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        masteryData: Object.fromEntries(performances),
        recallData: Object.fromEntries(recallHistory),
        syncTime: new Date().toISOString(),
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to sync to Supabase:', error);
    return false;
  }
}

/**
 * Load user progress from Supabase
 */
export async function loadFromSupabase(
  userId: string
): Promise<{
  performances: Map<string, VariationPerformance>;
  recallHistory: Map<string, RecallHistory>;
} | null> {
  try {
    const response = await fetch(`/api/user-progress/${userId}`);
    if (!response.ok) return null;

    const data = await response.json();

    const performances = new Map<string, VariationPerformance>();
    if (data.masteryData) {
      for (const [key, value] of Object.entries(data.masteryData)) {
        const perf = value as any;
        performances.set(key, {
          ...perf,
          lastReviewDate: new Date(perf.lastReviewDate),
          nextReviewDate: new Date(perf.nextReviewDate),
        });
      }
    }

    const recallHistory = new Map<string, RecallHistory>();
    if (data.recallData) {
      for (const [key, value] of Object.entries(data.recallData)) {
        const record = value as any;
        recallHistory.set(key, {
          ...record,
          lastAttemptDate: new Date(record.lastAttemptDate),
          nextRecallDate: new Date(record.nextRecallDate),
        });
      }
    }

    return { performances, recallHistory };
  } catch (error) {
    console.error('Failed to load from Supabase:', error);
    return null;
  }
}
