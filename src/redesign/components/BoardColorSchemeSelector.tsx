'use client';

import { BoardColorScheme, BOARD_COLOR_SCHEMES } from '../lib/board-colors';
import { twMerge } from 'tailwind-merge';

interface BoardColorSchemeSelectorProps {
    selected: BoardColorScheme;
    onChange: (scheme: BoardColorScheme) => void;
}

export function BoardColorSchemeSelector({ selected, onChange }: BoardColorSchemeSelectorProps) {
    const schemes = Object.entries(BOARD_COLOR_SCHEMES) as [BoardColorScheme, { light: string; dark: string; name: string }][];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {schemes.map(([key, { light, dark, name }]) => (
                <button
                    key={key}
                    onClick={() => onChange(key)}
                    className="group cursor-pointer flex flex-col focus:outline-none"
                    title={name}
                >
                    <div className={twMerge(
                        "aspect-square w-full border rounded-2xl mb-2 transition-all overflow-hidden flex flex-col shadow-sm cursor-pointer",
                        selected === key 
                            ? 'border-redesign-cyan ring-2 ring-redesign-cyan/20 scale-[1.02]' 
                            : 'border-redesign-glass-border bg-zinc-900 group-hover:border-redesign-cyan/50 hover:scale-[1.02]'
                    )}>
                        <div className="flex-1 flex">
                           <div className="flex-1" style={{ backgroundColor: light }} />
                           <div className="flex-1" style={{ backgroundColor: dark }} />
                        </div>
                        <div className="flex-1 flex">
                           <div className="flex-1" style={{ backgroundColor: dark }} />
                           <div className="flex-1" style={{ backgroundColor: light }} />
                        </div>
                    </div>
                    <span className={twMerge(
                       "text-[10px] font-bold uppercase text-center w-full transition-colors",
                       selected === key ? "text-redesign-cyan" : "text-zinc-500 group-hover:text-white"
                    )}>
                       {name}
                    </span>
                </button>
            ))}
        </div>
    );
}
