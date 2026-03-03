import { Opening, MoveNode } from './opening-data';

export let COMPILED_OPENINGS: Record<string, Opening> | null = null;
export let GLOBAL_MOVE_TREE: Record<string, MoveNode> | null = null;

export async function compileOpeningsData() {
    if (COMPILED_OPENINGS && GLOBAL_MOVE_TREE) return;

    try {
        if (typeof window === 'undefined') {
            // Build/SSR path: read from filesystem with dynamic imports to avoid bundling fs into client
            const [{ promises: fs }, path] = await Promise.all([import('fs'), import('path')]);
            const filePath = path.join(process.cwd(), 'public', 'data', 'generated-tree.json');
            const raw = await fs.readFile(filePath, 'utf-8');
            const treeData = JSON.parse(raw);
            COMPILED_OPENINGS = treeData.COMPILED_OPENINGS;
            GLOBAL_MOVE_TREE = treeData.GLOBAL_MOVE_TREE;
            return;
        }

        // Client path: fetch from the deployed origin
        const base = window.location.origin;
        const response = await fetch(new URL('/data/generated-tree.json', base).toString());
        const treeData = await response.json();
        COMPILED_OPENINGS = treeData.COMPILED_OPENINGS;
        GLOBAL_MOVE_TREE = treeData.GLOBAL_MOVE_TREE;
    } catch (e) {
        console.error("Failed to load opening tree data", e);
    }
}
