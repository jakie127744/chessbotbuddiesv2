'use client';

import { BoardColorScheme, BOARD_COLOR_SCHEMES } from '../redesign/lib/board-colors';

interface BoardColorSchemeSelectorProps {
    selected: BoardColorScheme;
    onChange: (scheme: BoardColorScheme) => void;
}

export function BoardColorSchemeSelector({ selected, onChange }: BoardColorSchemeSelectorProps) {
    const schemes = Object.entries(BOARD_COLOR_SCHEMES) as [BoardColorScheme, { light: string; dark: string; name: string }][];

    return (
        <div className="flex flex-wrap gap-2">
            {schemes.map(([key, { light, dark, name }]) => (
                <button
                    key={key}
                    onClick={() => onChange(key)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                        selected === key 
                            ? 'border-blue-500 bg-blue-500/10' 
                            : 'border-neutral-700 hover:border-neutral-500'
                    }`}
                    title={name}
                >
                    {/* Mini board preview */}
                    <div className="grid grid-cols-2 w-8 h-8 rounded overflow-hidden shadow-sm">
                        <div style={{ backgroundColor: light }} />
                        <div style={{ backgroundColor: dark }} />
                        <div style={{ backgroundColor: dark }} />
                        <div style={{ backgroundColor: light }} />
                    </div>
                    <span className="text-xs text-zinc-400">{name}</span>
                </button>
            ))}
        </div>
    );
}
