'use client';

import { User } from 'lucide-react';

export interface PlayerInfo {
    name: string;
    rating?: number;
    country?: string; // ISO country code (e.g., "US", "NO", "RU")
    isBot?: boolean;
    color: 'white' | 'black';
}

interface PlayerNameplateProps {
    player: PlayerInfo;
    position: 'top' | 'bottom';
    isCurrentTurn?: boolean;
    time?: string;
    avatarUrl?: string;
}

// Map of country codes to flag emojis
function getCountryFlag(countryCode?: string): string {
    if (!countryCode) return '';
    const code = countryCode.toUpperCase();
    // Convert country code to flag emoji
    const codePoints = [...code].map(char => 127397 + char.charCodeAt(0));
    try {
        return String.fromCodePoint(...codePoints);
    } catch {
        return '';
    }
}

export function PlayerNameplate({ player, position, isCurrentTurn, time, avatarUrl }: PlayerNameplateProps) {
    const flag = getCountryFlag(player.country);
    
    return (
        <div 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all w-fit mx-auto ${
                isCurrentTurn 
                    ? 'bg-[#5ec2f2]/20 border border-[#5ec2f2]/50' 
                    : 'bg-[#1a2744] border border-[#3a4a6e]'
            }`}
        >
            {/* Avatar */}
            {avatarUrl ? (
                <img 
                    src={avatarUrl} 
                    alt={player.name} 
                    className="w-6 h-6 rounded-full object-cover border border-white/10"
                />
             ) : (
                /* Fallback: Piece color indicator if no avatar */
                <div 
                    className={`w-4 h-4 rounded-sm shadow-inner ${
                        player.color === 'white' ? 'bg-white' : 'bg-neutral-800 border border-neutral-600'
                    }`}
                />
            )}

            {/* Flag */}
            {flag && (
                <span className="text-lg" title={player.country}>
                    {flag}
                </span>
            )}

            {/* Player name */}
            <div className="flex items-center gap-2">
                {player.isBot && (
                    <span className="text-xs bg-[#5ec2f2]/30 text-[#5ec2f2] px-1.5 py-0.5 rounded text-[10px] font-bold">
                        BOT
                    </span>
                )}
                <span className={`font-bold ${isCurrentTurn ? 'text-white' : 'text-[#a8b4ce]'}`}>
                    {player.name}
                </span>
            </div>

            {/* Rating */}
            {player.rating && (
                <span className="text-sm text-[#6b7a99] font-mono">
                    ({player.rating})
                </span>
            )}

            {/* Timer */}
            {time && (
                <div className={`px-2 py-0.5 rounded ml-2 font-mono text-sm font-bold shadow-inner ${
                    isCurrentTurn 
                        ? 'bg-neutral-800 text-white border border-neutral-600' 
                        : 'bg-neutral-900/50 text-neutral-500 border border-neutral-800'
                }`}>
                    {time}
                </div>
            )}
        </div>
    );
}
