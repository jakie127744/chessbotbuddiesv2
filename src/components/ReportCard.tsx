'use client';

import { useRewards } from "@/contexts/RewardsContext";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, Flame, GraduationCap, Medal, Trophy, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

export function ReportCard({ onClose }: { onClose: () => void }) {
    const { activityLog, xp, level, stars } = useRewards();
    const [timeFilter, setTimeFilter] = useState<'daily' | 'monthly' | 'all'>('all');

    const stats = useMemo(() => {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneMonth = 30 * oneDay;

        const filteredLog = activityLog.filter(item => {
            if (timeFilter === 'all') return true;
            if (timeFilter === 'daily') return now - item.timestamp < oneDay;
            if (timeFilter === 'monthly') return now - item.timestamp < oneMonth;
            return true;
        });

        // Calculate Totals
        const lessonsPassed = filteredLog.filter(i => i.type === 'lesson' && i.result === 'completed').length;
        const lessonsFailed = filteredLog.filter(i => i.type === 'lesson' && i.result === 'failed').length;
        const puzzlesSolved = filteredLog.filter(i => i.type === 'puzzle' && i.result === 'win').length; // Assuming 'win' for puzzle
        const gamesWon = filteredLog.filter(i => i.type === 'game' && i.result === 'win').length;
        const gamesPlayed = filteredLog.filter(i => i.type === 'game').length;

        // Calculate Average Scores (if available in details)
        // Harder to parse from string details, focusing on counts for now.

        return {
            lessonsPassed,
            lessonsFailed,
            puzzlesSolved,
            gamesWon,
            gamesPlayed,
            totalActivities: filteredLog.length,
            log: filteredLog
        };
    }, [activityLog, timeFilter]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <div>
                        <h2 className="text-3xl font-black text-white flex items-center gap-3">
                            <GraduationCap className="text-blue-400" size={32} />
                            Student Report Card
                        </h2>
                        <p className="text-slate-400 mt-2">Level {level} • {xp.toLocaleString()} XP • {stars} Stars</p>
                    </div>
                    <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                        {(['daily', 'monthly', 'all'] as const).map(filter => (
                            <button
                                key={filter}
                                onClick={() => setTimeFilter(filter)}
                                className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${
                                    timeFilter === filter 
                                    ? 'bg-blue-600 text-white shadow' 
                                    : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    
                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                                    <CheckCircle size={20} />
                                </div>
                                <span className="text-slate-400 font-bold text-sm uppercase">Lessons Passed</span>
                            </div>
                            <div className="text-4xl font-black text-white">{stats.lessonsPassed}</div>
                            <div className="text-xs text-slate-500 mt-1">{stats.lessonsFailed} attempts failed</div>
                        </div>

                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                    <Flame size={20} />
                                </div>
                                <span className="text-slate-400 font-bold text-sm uppercase">Puzzles Solved</span>
                            </div>
                            <div className="text-4xl font-black text-white">{stats.puzzlesSolved}</div>
                        </div>

                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                                    <Trophy size={20} />
                                </div>
                                <span className="text-slate-400 font-bold text-sm uppercase">Games Won</span>
                            </div>
                            <div className="text-4xl font-black text-white">{stats.gamesWon}</div>
                            <div className="text-xs text-slate-500 mt-1">out of {stats.gamesPlayed} played</div>
                        </div>

                         <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex flex-col justify-center items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                                <Medal size={32} className="text-blue-400" />
                            </div>
                            <div className="text-lg font-bold text-white">Keep it up!</div>
                            <div className="text-xs text-slate-400">Consistency is key to mastery.</div>
                        </div>
                    </div>

                    {/* Recent Activity List */}
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Calendar size={20} className="text-slate-400" /> 
                        Activity History
                    </h3>
                    <div className="bg-slate-800/30 rounded-2xl border border-slate-700 overflow-hidden">
                        {stats.log.length === 0 ? (
                            <div className="p-12 text-center text-slate-500 italic">
                                No activity recorded for this period. Go solve some puzzles!
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
                                    <tr>
                                        <th className="p-4">Time</th>
                                        <th className="p-4">Activity</th>
                                        <th className="p-4">Result</th>
                                        <th className="p-4">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {stats.log.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4 text-slate-400 text-sm font-mono">
                                                {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${
                                                        item.type === 'lesson' ? 'bg-green-400' :
                                                        item.type === 'puzzle' ? 'bg-purple-400' : 'bg-yellow-400'
                                                    }`} />
                                                    <span className="font-medium text-slate-200 capitalize">{item.type}</span>
                                                    {item.type === 'lesson' && <span className="text-xs text-slate-500">ID: {item.itemId}</span>}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold uppercase ${
                                                    ['win', 'completed'].includes(item.result) 
                                                    ? 'bg-green-500/20 text-green-400' 
                                                    : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                    {['win', 'completed'].includes(item.result) ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                    {item.result}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-400 text-sm">
                                                {item.details || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                    >
                        Close Report
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
