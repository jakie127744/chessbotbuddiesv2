'use client';

import { PIECE_SETS, PieceStyle } from '@/lib/piece-sets';

interface PieceStyleSelectorProps {
    selected: PieceStyle;
    onChange: (style: PieceStyle) => void;
    className?: string;
}

export function PieceStyleSelector({ selected, onChange, className }: PieceStyleSelectorProps) {
    const styles = Object.entries(PIECE_SETS) as [PieceStyle, typeof PIECE_SETS[PieceStyle]][];
    const gridClasses = `grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 ${className ?? ''}`.trim();

    return (
        <div className={gridClasses}>
            {styles.map(([key, set]) => (
                <button
                    key={key}
                    onClick={() => onChange(key)}
                    className={`group relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 shadow-md ${
                        selected === key
                            ? 'bg-amber-400 border-amber-500 ring-2 ring-amber-400/30 ring-offset-2 ring-offset-[#0f172a]'
                            : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 hover:border-slate-500'
                    }`}
                    title={set.description}
                >
                    {/* Mini piece preview container */}
                    <div className={`
                        flex items-center justify-center gap-3 w-full py-4 rounded-lg
                        ${selected === key ? 'bg-black/10' : 'bg-black/20'}
                    `}>
                        <img 
                            src={set.white.k} 
                            alt="White King" 
                            className="w-10 h-10 drop-shadow-md transform group-hover:scale-110 transition-transform duration-200"
                        />
                        <img 
                            src={set.black.q} 
                            alt="Black Queen" 
                            className="w-10 h-10 drop-shadow-md transform group-hover:scale-110 transition-transform duration-200"
                        />
                    </div>

                    <span className={`text-sm font-bold tracking-wide uppercase ${
                        selected === key ? 'text-slate-900' : 'text-slate-400 group-hover:text-white'
                    }`}>
                        {set.name}
                    </span>

                    {selected === key && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-900 animate-pulse" />
                    )}
                </button>
            ))}
        </div>
    );
}
