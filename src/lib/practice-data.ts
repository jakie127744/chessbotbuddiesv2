import { ThemeKey } from './lichess-puzzles';

export interface PracticeItem {
    id: string;
    title: string;
    description: string;
    themeKey: ThemeKey;
    icon?: string; 
}

export interface PracticeCategory {
    id: string;
    title: string;
    description: string;
    icon: string;
    items: PracticeItem[];
}

export const PRACTICE_CATEGORIES: PracticeCategory[] = [
    {
        id: 'checkmates',
        title: 'Checkmate Patterns',
        description: 'Master the art of delivering checkmate with common patterns.',
        icon: 'Swords',
        items: [
            { id: 'mateIn1', title: 'Mate in 1', description: 'Find the winning move in one turn.', themeKey: 'mateIn1', icon: 'zap' },
            { id: 'mateIn2', title: 'Mate in 2', description: 'Look ahead! Mate in two moves.', themeKey: 'mateIn2', icon: 'zap-off' },
            { id: 'backRank', title: 'Back Rank Mate', description: 'The corridor of death.', themeKey: 'backRankMate', icon: 'align-justify' },
            { id: 'anastasia', title: "Anastasia's Mate", description: 'Knight and Rook teamwork.', themeKey: 'anastasiaMate', icon: 'horse' },
            { id: 'arabian', title: 'Arabian Mate', description: 'Cornered by Knight and Rook.', themeKey: 'arabianMate', icon: 'moon' },
            { id: 'boden', title: "Boden's Mate", description: 'Criss-crossing Bishops.', themeKey: 'bodenMate', icon: 'x' },
            { id: 'doubleBishop', title: 'Double Bishop Mate', description: 'Two bishops slice through.', themeKey: 'doubleBishopMate', icon: 'chevrons-up' },
            { id: 'dovetail', title: 'Dovetail Mate', description: 'Queen mates near the King.', themeKey: 'dovetailMate', icon: 'feather' },
            { id: 'hook', title: 'Hook Mate', description: 'Rook protected by a Knight.', themeKey: 'hookMate', icon: 'anchor' },
            { id: 'smothered', title: 'Smothered Mate', description: 'Trapped by own pieces!', themeKey: 'smotheredMate', icon: 'package' },
            { id: 'vukovic', title: 'Vukovic Mate', description: 'Edge mate with Rook and Knight.', themeKey: 'vukovicMate', icon: 'shield' },
        ]
    },
    {
        id: 'tactics',
        title: 'Basic Tactics',
        description: 'Essential tactical motifs to win material.',
        icon: 'Target',
        items: [
            { id: 'fork', title: 'The Fork', description: 'Attack two pieces at once.', themeKey: 'fork', icon: 'git-branch' },
            { id: 'pin', title: 'The Pin', description: 'Immobilize an enemy piece.', themeKey: 'pin', icon: 'map-pin' },
            { id: 'skewer', title: 'The Skewer', description: 'Attack through a valuable piece.', themeKey: 'skewer', icon: 'arrow-right' },
            { id: 'discovered', title: 'Discovered Attack', description: 'Reveal a hidden threat.', themeKey: 'discoveredAttack', icon: 'eye' },
            { id: 'hanging', title: 'Hanging Piece', description: 'Spot the undefended piece.', themeKey: 'hangingPiece', icon: 'gift' },
        ]
    },
    {
        id: 'advanced',
        title: 'Advanced Tactics',
        description: 'Complex combinations to outsmart your opponent.',
        icon: 'Zap',
        items: [
            { id: 'sacrifice', title: 'Sacrifice', description: 'Give material for a greater goal.', themeKey: 'sacrifice', icon: 'gem' },
            { id: 'deflection', title: 'Deflection', description: 'Force a defender away.', themeKey: 'deflection', icon: 'corner-down-right' },
            { id: 'attraction', title: 'Attraction', description: 'Lure a piece to a bad square.', themeKey: 'attraction', icon: 'magnet' },
            { id: 'trapped', title: 'Trapped Piece', description: 'Catch a piece with no escape.', themeKey: 'trappedPiece', icon: 'box' },
            { id: 'doubleCheck', title: 'Double Check', description: 'The most powerful check.', themeKey: 'doubleCheck', icon: 'check-circle' },
            { id: 'clearance', title: 'Clearance', description: 'Clear the way for your piece.', themeKey: 'clearance', icon: 'wind' },
            { id: 'interference', title: 'Interference', description: 'Block the enemy lines.', themeKey: 'interference', icon: 'slash' },
        ]
    }
];
