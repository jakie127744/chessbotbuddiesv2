import { OpeningVariation } from './openings-repertoire';

const CUSTOM_REPERTOIRE_KEY = 'chess-app-custom-repertoire';

export interface CustomRepertoire {
  variations: OpeningVariation[];
}

export function loadCustomRepertoire(): OpeningVariation[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(CUSTOM_REPERTOIRE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse custom repertoire', e);
    return [];
  }
}

export function saveCustomRepertoire(variations: OpeningVariation[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_REPERTOIRE_KEY, JSON.stringify(variations));
}

export function addCustomVariation(variation: OpeningVariation) {
  const current = loadCustomRepertoire();
  // Ensure unique ID
  const newVariation = {
    ...variation,
    id: variation.id || `custom-${Date.now()}`,
    opening: 'custom',
    difficulty: variation.difficulty || 'intermediate'
  };
  
  const updated = [...current, newVariation];
  saveCustomRepertoire(updated);
  return updated;
}

export function deleteCustomVariation(id: string) {
  const current = loadCustomRepertoire();
  const updated = current.filter(v => v.id !== id);
  saveCustomRepertoire(updated);
  return updated;
}
