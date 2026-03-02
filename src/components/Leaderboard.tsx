import React, { useState, useEffect } from 'react';
import { Trophy, Globe, MapPin, Medal, Search, Star, BookOpen, Brain, Zap, Shield } from 'lucide-react';
import { UserProfile } from '@/lib/user-profile';
import { fetchGlobalLeaderboard, fetchCountryLeaderboard, type LeaderboardEntry, type LeaderboardMetric } from '@/lib/leaderboard-data';
import { COUNTRIES } from '@/lib/countries';
import { FlagComponent } from './FlagComponent';
import { UserStats } from '@/contexts/RewardsContext';
import { useRewards } from '@/contexts/RewardsContext';
import { UserProfileModal } from './UserProfileModal';

interface LeaderboardProps {
    // user: UserProfile; // Removed as per instruction
    // stats: UserStats; // Removed as per instruction
}

type Tab = 'global' | 'country';

export function Leaderboard() {
    const { userProfile: user, stats, xp } = useRewards(); // Use context for data
    const [activeTab, setActiveTab] = useState<Tab>('global');
    const [activeMetric, setActiveMetric] = useState<LeaderboardMetric>('rating');
    const [data, setData] = useState<LeaderboardEntry[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            
            setIsLoading(true);
            try {
                // Calculate an estimated Elo based on games (mock logic matching generation)
                const currentRating = user.rating || 800;
                
                // const xp = user.xp || 0; // The persistent XP from profile which we just ensured is synced // Removed as per instruction
                
                let result: LeaderboardEntry[];
                if (activeTab === 'global') {
                    result = await fetchGlobalLeaderboard(user, stats, currentRating, xp, activeMetric);
                } else {
                    result = await fetchCountryLeaderboard(user, stats, currentRating, xp, activeMetric);
                }
                setData(result);
            } catch (error) {
                console.error('Failed to load leaderboard:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [activeTab, activeMetric, user, stats, xp]);

    const getCountryName = (code: string) => {
        const country = COUNTRIES.find(c => c.code === code);
        return country ? country.name : code;
    };

    const filteredData = data.filter(entry => 
        entry.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Find user's rank in the full dataset (not filtered) to display at bottom if needed
    const userRank = data.find(e => e.isUser);

    // Filter Bar Component
    const MetricButton = ({ metric, label, icon: Icon }: { metric: LeaderboardMetric, label: string, icon: any }) => (
        <button
            onClick={() => setActiveMetric(metric)}
            className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap
                ${activeMetric === metric 
                    ? 'bg-[#5ec2f2] text-white shadow-lg shadow-[#5ec2f2]/20' 
                    : 'bg-[#1e293b] text-[#6b7a99] hover:text-white'}
            `}
        >
            <Icon size={14} />
            {label}
        </button>
    );

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-[#fafafa] overflow-hidden">
            {/* Header */}
            <div className="p-5 lg:p-6 border-b border-[#3a4a6e]/50 flex flex-col gap-6 bg-gradient-to-b from-[#1a2744] to-[#0f172a]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg shadow-orange-500/20">
                            <Trophy className="text-white w-8 h-8 drop-shadow-md" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-black font-display text-white tracking-tight uppercase">Leaderboards</h1>
                            <p className="text-[#a8b4ce] text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#69e0a3] animate-pulse"></span>
                                Live Rankings
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center bg-[#1a2744] p-1.5 rounded-2xl border border-[#3a4a6e]/50 shadow-inner">
                        <button
                            onClick={() => setActiveTab('global')}
                            className={`
                                flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all
                                ${activeTab === 'global' ? 'bg-[#5ec2f2] text-white shadow-lg shadow-[#5ec2f2]/20' : 'text-[#6b7a99] hover:text-white'}
                            `}
                        >
                            <Globe size={16} />
                            Global
                        </button>
                        <button
                            onClick={() => setActiveTab('country')}
                            className={`
                                flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all
                                ${activeTab === 'country' ? 'bg-[#5ec2f2] text-white shadow-lg shadow-[#5ec2f2]/20' : 'text-[#6b7a99] hover:text-white'}
                            `}
                        >
                            <MapPin size={16} />
                            {user?.country || 'Country'}
                        </button>
                    </div>
                </div>

                {/* Metrics Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide mb-2">
                    <MetricButton metric="rating" label="Rating" icon={Trophy} />
                    <MetricButton metric="xp" label="XP" icon={Star} />
                    <MetricButton metric="lessons" label="Lessons" icon={BookOpen} />
                    <MetricButton metric="puzzles" label="Puzzles" icon={Zap} />
                    <MetricButton metric="endgames" label="Endgames" icon={Shield} />
                </div>

                {/* Search */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7a99] transition-colors group-focus-within:text-[#5ec2f2]" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search for players..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0f172a] border-2 border-[#3a4a6e] rounded-2xl pl-12 pr-4 py-4 text-base font-bold focus:outline-none focus:border-[#5ec2f2] transition-all placeholder:text-[#6b7a99] text-white shadow-inner"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center text-white/40 animate-pulse">
                        Loading rankings...
                    </div>
                ) : (
                    <div className="space-y-2 max-w-4xl mx-auto">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-bold text-white/40 uppercase tracking-wider">
                        <div className="col-span-1 text-center">Rank</div>
                        <div className="col-span-5">Player</div>
                        <div className="col-span-2 text-center hidden md:block">
                            {activeMetric === 'rating' ? 'Win Rate' : 'Games'}
                        </div>
                        <div className="col-span-4 text-right pr-2">
                             {activeMetric === 'rating' && 'Rating'}
                             {activeMetric === 'xp' && 'Total XP'}
                             {activeMetric === 'lessons' && 'Lessons'}
                             {activeMetric === 'puzzles' && 'Puzzles'}
                             {activeMetric === 'endgames' && 'Endgames'}
                        </div>
                    </div>

                    {filteredData.map((entry) => (
                        <div 
                            key={entry.rank}
                            onClick={() => setSelectedEntry(entry)}
                            className={`
                                grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-xl border transition-all cursor-pointer
                                ${entry.isUser 
                                    ? 'bg-[#5ec2f2]/10 border-[#5ec2f2]/50 shadow-[0_0_15px_rgba(94,194,242,0.1)]' 
                                    : 'bg-[#1e293b]/50 border-transparent hover:bg-[#1e293b] hover:border-[#334155] hover:scale-[1.01] active:scale-100'}
                            `}
                        >
                            {/* Rank */}
                            <div className="col-span-1 flex justify-center">
                                {entry.rank <= 3 ? (
                                    <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg
                                        ${entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' : ''}
                                        ${entry.rank === 2 ? 'bg-slate-400/20 text-slate-300' : ''}
                                        ${entry.rank === 3 ? 'bg-orange-700/20 text-orange-400' : ''}
                                    `}>
                                        {entry.rank === 1 && <Medal size={20} />}
                                        {entry.rank === 2 && <Medal size={18} />}
                                        {entry.rank === 3 && <Medal size={16} />}
                                    </div>
                                ) : (
                                    <span className="text-white/60 font-mono font-bold">#{entry.rank}</span>
                                )}
                            </div>

                            {/* Player */}
                            <div className="col-span-5 flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-6 shrink-0 relative shadow-sm rounded-sm overflow-hidden">
                                    <FlagComponent country={entry.country} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className={`font-bold truncate ${entry.isUser ? 'text-[#5ec2f2]' : 'text-white'}`}>
                                        {entry.username}
                                    </span>
                                    <span className="text-sm text-white/50 md:hidden">
                                        {activeMetric === 'rating' ? `${entry.elo}` : ''}
                                        {activeMetric === 'xp' ? `${entry.xp || 0} XP` : ''}
                                        {activeMetric === 'lessons' ? `${entry.lessonsCompleted || 0} Done` : ''}
                                        {activeMetric === 'puzzles' ? `${entry.puzzlesSolved || 0} Solved` : ''}
                                        {activeMetric === 'endgames' ? `${entry.endgamesCompleted || 0} Done` : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Stats Col 1 (Hidden on mobile) */}
                            <div className="col-span-2 hidden md:flex items-center justify-center gap-1 text-white/60">
                                {activeMetric === 'rating' ? (
                                    <span className={entry.winRate >= 50 ? 'text-green-400' : 'text-red-400'}>
                                        {entry.winRate}%
                                    </span>
                                ) : (
                                    <span>{entry.gamesPlayed} Games</span>
                                )}
                            </div>

                            {/* Main Stat (Right aligned) */}
                            <div className="col-span-4 text-right pr-2">
                                <span className="font-mono font-bold text-[#5ec2f2] bg-[#5ec2f2]/10 px-2 py-1 rounded">
                                    {activeMetric === 'rating' && entry.elo}
                                    {activeMetric === 'xp' && (entry.xp || 0).toLocaleString()}
                                    {activeMetric === 'lessons' && (entry.lessonsCompleted || 0)}
                                    {activeMetric === 'puzzles' && (entry.puzzlesSolved || 0)}
                                    {activeMetric === 'endgames' && (entry.endgamesCompleted || 0)}
                                </span>
                            </div>
                        </div>
                    ))}

                    {filteredData.length === 0 && (
                        <div className="text-center py-20 text-white/40">
                            No players found matching &quot;{searchTerm}&quot;
                        </div>
                    )}
                </div>
                )}
            </div>

            {/* Sticky Current User Footer (if not visible?) - optional, but nice to have if list is long */}
             {/* Note: In this simple implementation, we just rely on scrolling. If user is far down, they can search themselves.*/}

             {/* Profile Modal */}
             {selectedEntry && (
                <UserProfileModal 
                    user={selectedEntry} 
                    onClose={() => setSelectedEntry(null)} 
                />
             )}
        </div>
    );
}
