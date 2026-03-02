'use client';

import { useState } from 'react';
import { Settings, ChevronDown, ChevronUp, Cpu, Clock, Layers, HardDrive } from 'lucide-react';

export interface EngineConfig {
    depth: number;
    searchTime: number; // seconds
    threads: number;
    hash: number; // MB
    multiPV: number;
    showArrows: boolean;
}

interface EngineSettingsProps {
    config: EngineConfig;
    onConfigChange: (config: EngineConfig) => void;
    isAnalyzing?: boolean;
}

const DEFAULT_CONFIG: EngineConfig = {
    depth: 20,      // Reduced from 20 to prevent WASM crashes
    searchTime: 25,
    threads: 4,     // Must be 1 for WASM (no SharedArrayBuffer)
    hash: 256,       // Reduced from 32 to prevent memory issues
    multiPV: 2,
    showArrows: true
};

// Arrow colors for each line
// NOTE: Colors chosen to be distinct from board square colors (Ocean: #5ec2f2)
export const ENGINE_LINE_COLORS = [
    '#22c55e', // Green - Best
    '#3b82f6', // Cobalt Blue - 2nd (changed from #5ec2f2 to avoid matching ocean board)
    '#ffd95a', // Yellow - 3rd
    '#a78bfa', // Purple - 4th
    '#ef4444', // Red - 5th
];

export function EngineSettings({ config, onConfigChange, isAnalyzing }: EngineSettingsProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const updateConfig = (key: keyof EngineConfig, value: any) => {
        onConfigChange({ ...config, [key]: value });
    };

    return (
        <div className="bg-[#243354] rounded-xl border border-[#3a4a6e] overflow-hidden">
            {/* Header - Always visible */}
            <div className="w-full flex items-center justify-between p-4 hover:bg-[#2d3d5e] transition-colors">
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-3 flex-1"
                >
                    <Settings size={18} className="text-[#5ec2f2]" />
                    <span className="font-bold text-white text-sm">Engine Settings</span>
                    {isAnalyzing && (
                        <span className="text-xs bg-[#5ec2f2]/20 text-[#5ec2f2] px-2 py-0.5 rounded-full animate-pulse" title="Live Engine is paused while full game analysis runs">
                            Scanning...
                        </span>
                    )}
                </button>
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-[#6b7a99]">
                     {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            {/* Expandable Settings */}
            {isExpanded && (
                <div className="p-4 pt-0 space-y-4 border-t border-[#3a4a6e]">
                    {/* Depth */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-[#a8b4ce] flex items-center gap-2">
                                <Layers size={14} /> Depth
                            </label>
                            <span className="text-xs text-[#5ec2f2] font-mono">{config.depth}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            value={config.depth}
                            onChange={(e) => updateConfig('depth', parseInt(e.target.value))}
                            className="w-full h-2 bg-[#0f1729] rounded-lg appearance-none cursor-pointer accent-[#5ec2f2]"
                        />
                        <div className="flex justify-between text-[10px] text-[#6b7a99]">
                            <span>Fast (1)</span>
                            <span>Deep (30)</span>
                        </div>
                    </div>

                    {/* Search Time */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-[#a8b4ce] flex items-center gap-2">
                                <Clock size={14} /> Time Limit
                            </label>
                            <span className="text-xs text-[#5ec2f2] font-mono">{config.searchTime}s</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            value={config.searchTime}
                            onChange={(e) => updateConfig('searchTime', parseInt(e.target.value))}
                            className="w-full h-2 bg-[#0f1729] rounded-lg appearance-none cursor-pointer accent-[#5ec2f2]"
                        />
                    </div>

                    {/* Threads */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-[#a8b4ce] flex items-center gap-2">
                                <Cpu size={14} /> Threads
                            </label>
                            <span className="text-xs text-[#5ec2f2] font-mono">{config.threads}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="8"
                            value={config.threads}
                            onChange={(e) => updateConfig('threads', parseInt(e.target.value))}
                            className="w-full h-2 bg-[#0f1729] rounded-lg appearance-none cursor-pointer accent-[#5ec2f2]"
                        />
                    </div>

                    {/* Hash Memory */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-[#a8b4ce] flex items-center gap-2">
                                <HardDrive size={14} /> Hash
                            </label>
                            <span className="text-xs text-[#5ec2f2] font-mono">{config.hash} MB</span>
                        </div>
                        <input
                            type="range"
                            min="16"
                            max="512"
                            step="16"
                            value={config.hash}
                            onChange={(e) => updateConfig('hash', parseInt(e.target.value))}
                            className="w-full h-2 bg-[#0f1729] rounded-lg appearance-none cursor-pointer accent-[#5ec2f2]"
                        />
                    </div>

                    {/* MultiPV (Number of Lines) */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-[#a8b4ce]">Lines (MultiPV)</label>
                            <span className="text-xs text-[#5ec2f2] font-mono">{config.multiPV}</span>
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    onClick={() => updateConfig('multiPV', n)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                                        config.multiPV === n
                                            ? 'bg-[#5ec2f2] text-white'
                                            : 'bg-[#0f1729] text-[#6b7a99] hover:text-white hover:bg-[#2d3d5e]'
                                    }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Line Colors Legend */}
                    <div className="pt-2 border-t border-[#3a4a6e]">
                        <div className="text-xs text-[#6b7a99] mb-2">Arrow Colors</div>
                        <div className="flex gap-3 flex-wrap">
                            {ENGINE_LINE_COLORS.slice(0, config.multiPV).map((color, i) => (
                                <div key={i} className="flex items-center gap-1">
                                    <div 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: color }}
                                    />
                                    <span className="text-[10px] text-[#a8b4ce]">
                                        {i === 0 ? 'Best' : `${i + 1}${['st','nd','rd','th','th'][i]}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export { DEFAULT_CONFIG };
