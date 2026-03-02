export type BoardColorScheme = 'ocean' | 'walnut' | 'slate' | 'emerald' | 'purple' | 'sand' | 'high_contrast' | 'neon';

export const BOARD_COLOR_SCHEMES: Record<BoardColorScheme, { light: string; dark: string; name: string }> = {
    ocean: { light: '#f0f5ff', dark: '#4b7399', name: 'Ocean' },
    walnut: { light: '#e8d5b7', dark: '#8b5a2b', name: 'Walnut' },
    slate: { light: '#e2e8f0', dark: '#475569', name: 'Slate' },
    emerald: { light: '#ecfdf5', dark: '#059669', name: 'Emerald' },
    purple: { light: '#faf5ff', dark: '#7e22ce', name: 'Amethyst' },
    sand: { light: '#fdf6e3', dark: '#cb4b16', name: 'Sand' },
    high_contrast: { light: '#ffffff', dark: '#000000', name: 'High Contrast' },
    neon: { light: '#1a1a2e', dark: '#e94560', name: 'Neon Night' }
};
