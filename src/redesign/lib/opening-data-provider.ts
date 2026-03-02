import { Opening, MoveNode } from './opening-data';

export let COMPILED_OPENINGS: Record<string, Opening> | null = null;
export let GLOBAL_MOVE_TREE: Record<string, MoveNode> | null = null;

export async function compileOpeningsData() {
    if (COMPILED_OPENINGS && GLOBAL_MOVE_TREE) return;
    
    try {
        const base = typeof window !== 'undefined'
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const response = await fetch(new URL('/data/generated-tree.json', base).toString());
        const treeData = await response.json();
        COMPILED_OPENINGS = treeData.COMPILED_OPENINGS;
        GLOBAL_MOVE_TREE = treeData.GLOBAL_MOVE_TREE;
    } catch (e) {
        console.error("Failed to load opening tree data", e);
    }
}
