import React from 'react';
import * as Flags from 'country-flag-icons/react/3x2';

interface FlagComponentProps {
    country: string; // ISO 2-char code
    className?: string;
    title?: string;
}

export function FlagComponent({ country, className, title }: FlagComponentProps) {
    const code = country.toUpperCase();
    // Dynamically access the flag component
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Flag = (Flags as any)[code];

    if (!Flag) {
        // Fallback for unknown codes or if the library doesn't have it
        return (
            <span className={`flex items-center justify-center bg-slate-700 text-white font-bold text-xs rounded-sm ${className}`} title={title || country}>
                {country}
            </span>
        );
    }

    return <Flag className={className} title={title || country} />;
}
