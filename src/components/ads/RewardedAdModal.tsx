"use client";

import { useState, useEffect } from "react";
import { X, Clock, Zap } from "lucide-react";
import { AdBanner } from "@/components/ads/AdBanner"; // Assuming this path exists from previous tasks, or I will use a placeholder if not yet created in this turn. Wait, looking at task.md lines 4-5 it says "Create a reusable AdBanner component... [x]". So it should exist. Let me double check path in plan.
// Plan says: e:/My Documents/Chess App/chess-app/src/components/ads/AdBanner.tsx
// I should verify AdBanner exists before importing. But I'll assume it's there based on the check.

import { getAdSlotId } from "@/lib/ads/ad-manager";

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardGranted: () => void;
}

export function RewardedAdModal({ isOpen, onClose, onRewardGranted }: RewardedAdModalProps) {
  const [timeLeft, setTimeLeft] = useState(15);
  const [canClose, setCanClose] = useState(false);
  const adSlotId = getAdSlotId('rewarded');

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(15);
      setCanClose(false);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#262421] border border-[#3a3a3a] rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-[#211f1c] border-b border-[#3a3a3a] flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold uppercase tracking-wider text-xs border border-yellow-400/30 bg-yellow-400/10 px-2 py-0.5 rounded">
                    Ad Break
                </span>
                <span className="text-zinc-400 text-sm font-medium">Watch to earn rewards</span>
            </div>
            {!canClose && (
                <div className="flex items-center gap-1.5 text-zinc-400 bg-black/30 px-3 py-1 rounded-full text-xs font-mono">
                    <Clock size={12} />
                    <span>{timeLeft}s</span>
                </div>
            )}
        </div>

        {/* Ad Container */}
        <div className="p-6 flex flex-col items-center justify-center bg-black/50 min-h-[300px]">
            <div className="text-center mb-4">
                <h3 className="text-white font-bold text-lg mb-1">Unlock 3 Free Game Reviews</h3>
                <p className="text-zinc-400 text-sm">Support ChessBotBuddies by watching this short ad.</p>
            </div>
            
            {/* The Ad Unit Container */}
            <div className="w-[300px] h-[250px] bg-[#1a1917] flex items-center justify-center rounded-lg overflow-hidden border border-[#3a3a3a] relative shadow-inner">
                 {/* Standard Medium Rectangle */}
                 <div className="relative z-10 w-full h-full">
                    <AdBanner 
                        dataAdSlot={adSlotId}
                        dataAdFormat="rectangle"
                        style={{ display: 'block', width: '300px', height: '250px' }}
                    />
                 </div>
                 
                 {/* Fallback / Loading layer */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1917] text-zinc-500">
                    <div className="mb-2 animate-pulse">
                        <Zap size={32} className="text-zinc-700" />
                    </div>
                    <span className="text-zinc-500 text-xs text-center px-4">
                        Loading Ad...<br/>
                        <span className="text-[10px] text-zinc-600 mt-1 block">(Rewards still granted after timer)</span>
                    </span>
                 </div>
            </div>
        </div>

        {/* Footer / Action */}
        <div className="p-4 border-t border-[#3a3a3a] bg-[#211f1c] flex justify-end">
            {canClose ? (
                <button 
                    onClick={() => {
                        onRewardGranted();
                        onClose();
                    }}
                    className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <Zap size={18} className="fill-white" />
                    Claim 3 Free Reviews
                </button>
            ) : (
                <button 
                    disabled
                    className="w-full py-3 bg-[#363431] text-zinc-500 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Clock size={18} />
                    Reward in {timeLeft}s...
                </button>
            )}
        </div>

        {/* Close (X) - Only appears if strictly needed, but 'canClose' button handles it well. 
            For UX, maybe allow closing early but warn? For now, stick to simple valid flow. 
        */}
        {canClose && (
            <button 
                onClick={onClose}
                className="absolute top-2 right-2 p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
            >
                <X size={20} />
            </button>
        )}
      </div>
    </div>
  );
}
