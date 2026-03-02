'use client';

import { PIECE_SETS, PieceStyle } from '@/lib/piece-sets';
import { twMerge } from 'tailwind-merge';

interface PieceStyleSelectorProps {
    selected: PieceStyle;
    onChange: (style: PieceStyle) => void;
    className?: string;
}

export function PieceStyleSelector({ selected, onChange, className }: PieceStyleSelectorProps) {
    const styles = Object.entries(PIECE_SETS) as [PieceStyle, typeof PIECE_SETS[PieceStyle]][];
    const gridClasses = twMerge(
      "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4",
      className
    );

    return (
        <div className={gridClasses}>
            {styles.map(([key, set]) => (
                <button
                    key={key}
                    onClick={() => onChange(key)}
                    className="group cursor-pointer flex flex-col focus:outline-none"
                    title={set.description}
                >
                    <div className={twMerge(
                        "h-24 w-full border rounded-2xl mb-2 transition-all flex items-center justify-center gap-2 shadow-sm",
                        selected === key 
                            ? 'border-redesign-cyan ring-2 ring-redesign-cyan/20 scale-[1.02] bg-zinc-900' 
                            : 'border-redesign-glass-border bg-zinc-900 group-hover:border-redesign-cyan/50 hover:scale-[1.02]'
                    )}>
                        <img 
                            src={set.white.k} 
                            alt={`${set.name} White King`} 
                            className="w-10 h-10 drop-shadow-lg group-hover:scale-110 transition-transform"
                        />
                        <img 
                            src={set.black.q} 
                            alt={`${set.name} Black Queen`} 
                            className="w-10 h-10 drop-shadow-md group-hover:scale-110 transition-transform"
                        />
                    </div>
                    <span className={twMerge(
                       "text-[10px] font-bold uppercase text-center w-full transition-colors",
                       selected === key ? "text-redesign-cyan" : "text-zinc-500 group-hover:text-white"
                    )}>
                       {set.name}
                    </span>
                </button>
            ))}
        </div>
    );
}
