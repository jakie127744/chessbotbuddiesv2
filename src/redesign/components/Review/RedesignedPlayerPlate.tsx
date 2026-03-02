'use client';

import React from 'react';
import { PlayerInfo } from '@/components/PlayerNameplate';

interface RedesignedPlayerPlateProps {
    player: PlayerInfo;
    isCurrentTurn?: boolean;
    time?: string;
    avatarUrl?: string;
}

export function RedesignedPlayerPlate({ player, isCurrentTurn, time, avatarUrl }: RedesignedPlayerPlateProps) {
    return (
        <div className={`flex items-center justify-between w-full bg-white/[0.02] backdrop-blur-md p-2.5 rounded-2xl border transition-all duration-300 ${isCurrentTurn ? 'border-redesign-cyan/50 shadow-[0_0_15px_rgba(13,185,242,0.1)]' : 'border-white/5'}`}>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className={`size-10 rounded-xl overflow-hidden border-2 transition-all duration-300 ${isCurrentTurn ? 'border-redesign-cyan' : 'border-white/10'}`}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center text-lg font-bold ${player.color === 'white' ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-800 text-zinc-400'}`}>
                                {player.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    {isCurrentTurn && (
                        <div className="absolute -top-0.5 -right-0.5 size-3 bg-redesign-cyan rounded-full border-2 border-[#0d1221] animate-pulse" />
                    )}
                </div>
                
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        {player.isBot && <span className="bg-redesign-cyan/10 text-redesign-cyan text-[10px] font-black px-1 py-0.5 rounded uppercase tracking-widest">Bot</span>}
                        <span className="font-black text-white text-base tracking-tight uppercase leading-none">{player.name}</span>
                        {player.rating && <span className="text-[#6b7a99] font-black text-xs font-mono">({player.rating})</span>}
                    </div>
                </div>
            </div>

            {time && (
                <div className={`text-xl font-black font-mono tracking-tighter ${isCurrentTurn ? 'text-white' : 'text-zinc-600'}`}>
                    {time}
                </div>
            )}
        </div>
    );
}
