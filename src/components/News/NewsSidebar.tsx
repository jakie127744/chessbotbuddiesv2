'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Star } from 'lucide-react';

interface NewsSidebarProps {
    activeTab: 'world' | 'legends' | 'updates';
    onJoinClick: () => void;
    onUpdateClick: (tab: 'updates') => void;
}

export function NewsSidebar({ activeTab, onJoinClick, onUpdateClick }: NewsSidebarProps) {
    return (
        <div className="space-y-8">
            {/* 1. Join / Auth Promo (Always visible) */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-sky-500/20 transition-colors" />
                
                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-2 relative z-10">
                    Still a Guest?
                </h3>
                <p className="text-zinc-400 text-sm mb-6 relative z-10">
                    Create a free account to track your progress, save games, and unlock rated bots!
                </p>
                
                <button 
                    onClick={onJoinClick}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-sky-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] relative z-10"
                >
                   <Trophy size={16} /> Join the Action
                </button>
            </div>




        </div>
    );
}
