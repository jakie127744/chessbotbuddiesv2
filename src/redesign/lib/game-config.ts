
export interface TimeControl {
    label: string;
    initial: number; // in seconds
    increment: number; // in seconds (or delay)
    type: 'increment' | 'delay' | 'none'; // 'increment' is standard fisher, 'delay' is simple delay
}

export const TIME_CONTROLS: TimeControl[] = [
    // Blitz
    { label: '3+2 • Blitz', initial: 180, increment: 2, type: 'increment' },
    { label: '5+0 • Blitz', initial: 300, increment: 0, type: 'none' },
    { label: '5+3 • Blitz', initial: 300, increment: 3, type: 'increment' },

    // Rapid
    { label: '10+0 • Rapid', initial: 600, increment: 0, type: 'none' },
    { label: '15+10 • Rapid', initial: 900, increment: 10, type: 'increment' },
    { label: '30+0 • Classical', initial: 1800, increment: 0, type: 'none' },

    // Other / Standard
    { label: '3+0 • Blitz', initial: 180, increment: 0, type: 'none' },
    { label: '10+5 • Rapid', initial: 600, increment: 5, type: 'increment' },

    // Scholastic (Delay)
    { label: 'G/30 d5 • Scholastic', initial: 1800, increment: 5, type: 'delay' },
    { label: 'G/60 d5 • Scholastic', initial: 3600, increment: 5, type: 'delay' },

    // Untimed
    { label: '∞', initial: 0, increment: 0, type: 'none' },
];
