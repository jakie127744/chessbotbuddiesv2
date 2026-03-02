import { useState, useEffect } from 'react';
import { Trophy, Microscope, RefreshCw, X, Share2, Check } from 'lucide-react';
import { BotProfile } from '@/lib/bot-profiles';
import { AdBanner } from './ads/AdBanner';
import { getAdSlotId } from '@/lib/ads/ad-manager';


interface GameResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameStatus: string; // e.g., "Checkmate! White wins!"
    winner: 'white' | 'black' | 'draw' | null;
    playerColor: 'white' | 'black';
    onReview: () => void;
    onNewGame: () => void;
    onRematch: () => void;
    selectedBot?: BotProfile | null;
    xpEarned?: number;
}

export function GameResultModal({
    isOpen,
    onClose,
    gameStatus,
    winner,
    playerColor,
    onReview,
    onNewGame,
    onRematch,
    selectedBot,
    xpEarned = 0 // Default to 0 if not passed
}: GameResultModalProps) {
    if (!isOpen) return null;

    const isWin = winner === playerColor;
    const isDraw = winner === 'draw';
    
    // Coach Message Logic
    const getCoachMessage = () => {
        if (isWin) return "Great job! You found some excellent moves there.";
        if (isDraw) return "A solid draw. Good defense!";
        return "That game didn't go your way, but don't sweat it. Let's review it together and learn how to improve.";
    };

    // Coach Selection State
    const [isSelectingCoach, setIsSelectingCoach] = useState(false);
    const [selectedReviewCoach, setSelectedReviewCoach] = useState<BotProfile | null>(null);
    const [coachBots, setCoachBots] = useState<BotProfile[]>([]);
    
    // Share State
    const [justShared, setJustShared] = useState(false);

    // Get available coaches
    useEffect(() => {
        import('@/lib/bot-profiles').then(m => {
            setCoachBots(m.getCoachBots());
        });
    }, []);
    
    const handleShareResult = async () => {
        const botName = selectedBot?.name || 'Computer';
        const resultEmoji = isWin ? '🏆' : isDraw ? '🤝' : '🤖';
        const action = isWin ? 'defeated' : isDraw ? 'drew against' : 'played against';
        
        const text = `I just ${action} ${botName} on ChessBotBuddies! ${resultEmoji}\n\nPlay for free at chessbotbuddies.com`;
        
        try {
            await navigator.clipboard.writeText(text);
            setJustShared(true);
            setTimeout(() => setJustShared(false), 2000);
        } catch (err) {
            console.error('Failed to copy match result', err);
        }
    };
    
    const handleReviewClick = () => {
        setIsSelectingCoach(true);
    };
    
    const confirmCoachSelection = () => {
        // Pass the selected coach to the review handler
        (onReview as any)(selectedReviewCoach);
    };
    
    // Dynamic content for the modal based on state
    const renderContent = () => {
        if (isSelectingCoach) {
           return (
               <div className="p-6 text-center space-y-6">
                   <div className="space-y-1">
                        <h2 className="text-2xl font-black font-display text-white">Select a Coach</h2>
                        <p className="text-gray-400 text-sm">Choose a mentor to analyze your game</p>
                   </div>
                   
                   <div className="grid grid-cols-3 gap-2 max-h-[220px] overflow-y-auto custom-scrollbar p-1">
                        {coachBots.map(coach => (
                            <button
                                key={coach.id}
                                onClick={() => setSelectedReviewCoach(coach)}
                                className={`
                                    flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all relative
                                    ${selectedReviewCoach?.id === coach.id 
                                        ? 'border-[#5ec2f2] bg-[#5ec2f2]/10 scale-105 shadow-lg' 
                                        : 'border-transparent bg-[#1e293b]/50 hover:bg-[#1e293b] opacity-80 hover:opacity-100'
                                    }
                                `}
                            >
                                <img src={coach.avatar} alt={coach.name} className="w-10 h-10 rounded-full object-cover" />
                                <div className="text-xs font-bold text-white truncate w-full">{coach.name}</div>
                            </button>
                        ))}
                   </div>

                   <button 
                         onClick={confirmCoachSelection}
                         className="w-full py-3 bg-[#5ec2f2] hover:bg-[#a6ca7f] text-white font-black text-lg rounded-xl shadow-[0_4px_0_0_#45752a] active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                         disabled={!selectedReviewCoach}
                    >
                         Start Review
                    </button>
                    <button 
                        onClick={() => setIsSelectingCoach(false)}
                        className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest"
                    >
                        Back
                    </button>
               </div>
           );
        }

        return (
                <div className="p-6 text-center space-y-6">
                    {/* Header */}
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black font-display text-white drop-shadow-md">
                            {isWin ? "You Won!" : isDraw ? "Draw" : "White Won"} 
                            {/* Note: 'White Won' is just a fallback, logic below handles 'Black Won' etc based on gameStatus if passed directly, or we derive logic */}
                        </h2>
                         <p className="text-gray-400 text-sm font-medium">{gameStatus.includes('Checkmate') ? 'by checkmate' : gameStatus.includes('Resignation') ? 'by resignation' : gameStatus}</p>
                         
                         {/* XP Badge */}
                         {xpEarned > 0 && (
                             <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-full font-black text-sm uppercase tracking-wide border border-yellow-500/30 animate-in zoom-in spin-in-1">
                                 <span className="text-lg">⭐</span> +{xpEarned} XP
                             </div>
                         )}
                    </div>

                    {/* Coach Bubble */}
                    <div className="flex items-start gap-4 text-left bg-[#3d3b38] p-4 rounded-lg relative">
                        {/* Avatar */}
                        <div className="shrink-0">
                            {selectedBot ? (
                                <img src={selectedBot.avatar} alt="Coach" className="w-12 h-12 rounded-full border-2 border-[#5ec2f2]" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center font-bold border-2 border-emerald-400">
                                    C
                                </div>
                            )}
                        </div>
                        
                        {/* Message */}
                        <div className="flex-1">
                             <div className="text-sm text-gray-200 leading-relaxed font-medium">
                                "{getCoachMessage()}"
                             </div>
                        </div>
                        
                        {/* Triangle for Bubble */}
                        <div className="absolute top-6 -left-2 w-4 h-4 bg-[#3d3b38] transform rotate-45" />
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button 
                            onClick={handleReviewClick}
                            className="w-full py-4 bg-[#5ec2f2] hover:bg-[#a6ca7f] text-white font-black text-xl rounded-xl shadow-[0_4px_0_0_#45752a] hover:shadow-[0_4px_0_0_#5a8c3d] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                            <Microscope size={28} strokeWidth={2.5} />
                            Game Review
                        </button>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={onNewGame}
                                className="py-3 bg-[#3d3b38] hover:bg-[#4d4b48] text-gray-200 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                New Game
                            </button>
                            <button 
                                onClick={handleShareResult}
                                className="py-3 bg-[#3d3b38] hover:bg-[#4d4b48] text-gray-200 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 group relative overflow-hidden"
                            > 
                             {/* Success Flash Overlay */}
                             {justShared && <span className="absolute inset-0 bg-green-500/20 animate-pulse" />}
                             
                                {justShared ? (
                                    <> <Check size={18} className="text-green-400" /> <span className="text-green-400">Copied!</span> </>
                                ) : (
                                    <> <Share2 size={18} /> Share </>
                                )}
                            </button>
                        </div>
                        <button 
                                onClick={onRematch}
                                className="w-full py-2 bg-[#2a303c] hover:bg-[#323945] text-gray-400 hover:text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                                <RefreshCw size={14} /> Rematch
                        </button>
                    </div>

                    {/* Post-Game Ad - Shows below actions */}
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Advertisement</div>
                        <AdBanner 
                            dataAdSlot={getAdSlotId('post-game')} 
                            dataAdFormat="rectangle"
                            dataFullWidthResponsive={false}
                            style={{ minHeight: '100px' }}
                            className="bg-black/20 rounded-lg overflow-hidden"
                        />
                    </div>

                </div>
        );
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0f1729] text-gray-100 rounded-xl shadow-2xl w-[400px] border border-gray-700 overflow-hidden relative transform transition-all scale-100">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-white p-1 rounded-full hover:bg-[#243354]/30 transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {renderContent()}
            </div>
        </div>
    );
}
