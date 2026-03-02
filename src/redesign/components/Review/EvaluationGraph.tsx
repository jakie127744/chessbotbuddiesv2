import React, { useMemo } from 'react';
import { AnalyzedMove, cpToWinProbability } from '@/lib/analysis-utils';
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line
} from 'recharts';

interface EvaluationGraphProps {
  analyzedMoves: AnalyzedMove[];
  currentMoveIndex: number;
  onNavigate: (index: number) => void;
  orientation?: 'white' | 'black';
}

// Classification to marker color
const getMarkerColor = (classification: string | null): string => {
  if (!classification) return 'transparent';
  switch (classification) {
    case 'Blunder':
    // case 'Missed Win': // Legacy
      return '#e74c3c';
    case 'Mistake':
      return '#e67e22';
    case 'Inaccuracy':
    case 'Risky': // Legacy/Map
      return '#f39c12';
    case 'Brilliant':
      return 'var(--color-jungle-green-500)';
    case 'Great': // Critical mapped to Great
    case 'Critical':
      return 'var(--color-jungle-green-400)';
    default:
      return 'transparent';
  }
};

const shouldShowMarker = (classification: string | null): boolean =>
  !!classification &&
  [
    'Blunder', 
    'Mistake', 
    'Inaccuracy', 
    'Risky',
    'Brilliant', 
    'Great',
    'Critical'
  ].includes(classification as any);

export function EvaluationGraph({
  analyzedMoves,
  currentMoveIndex,
  onNavigate,
  orientation = 'white'
}: EvaluationGraphProps) {
  // Symmetrical Logic:
  // We want 0.0 (Equality) to be in the CENTER of the chart.
  // We use Lichess-style Win Probability (0-100%).
  // Center (Equality): 50%.
  
  const HEADER_HEIGHT = 1; // Used to prevent clipping at exact top

  const data = useMemo(() => {
    const points = [
      {
        index: -1,
        evalVal: 50, // Start at equality (50% win probability)
        rawEval: 0,
        isMate: false,
        classification: null as string | null,
        markerColor: 'transparent',
        showMarker: false,
        san: ''
      }
    ];

    analyzedMoves.forEach((move, i) => {
      const rawEval = move.evaluation ?? 0;
      let displayEval: number;

      // Use StableEval if available (new state machine logic)
      if (move.stableEval) {
          // uiValue is [-1, 1]. Map to [0, 100].
          // +1 (White Win) -> 100.
          // -1 (Black Win) -> 0.
          // 0 (Draw) -> 50.
          const winProb = (move.stableEval.uiValue + 1) * 50;
          
          if (orientation === 'white') {
             displayEval = winProb;
          } else {
             // Invert for Black
             displayEval = 100 - winProb;
          }
      } else {
          // Fallback to legacy logic (should not happen after re-analysis)
          let winProb: number;
          const isActualCheckmate = move.isMate && (move.mateIn === 0 || move.mateIn === undefined);
          
          if (move.isMate) {
             winProb = rawEval > 0 ? 100 : 0;
          } else {
             winProb = cpToWinProbability(rawEval);
          }

          if (orientation === 'white') {
            displayEval = winProb;
          } else {
            displayEval = 100 - winProb;
          }
      }

      points.push({
        index: i,
        evalVal: displayEval,
        rawEval: rawEval, // Keep raw for tooltip
        isMate: !!move.isMate,
        classification: move.classification || null,
        markerColor: getMarkerColor(move.classification),
        showMarker: shouldShowMarker(move.classification),
        san: move.san || ''
      });
    });

    return points;
  }, [analyzedMoves, orientation]);

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload || payload.index < 0) return null;

    const isSelected = payload.index === currentMoveIndex;
    if (!isSelected && !payload.showMarker) return null;

    const size = isSelected ? 5 : 4;
    const color = payload.showMarker ? payload.markerColor : '#fff';

    return (
      <circle
        cx={cx}
        cy={cy}
        r={size}
        fill={color}
        stroke="#222"
        strokeWidth={1}
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
            e.stopPropagation();
            onNavigate(payload.index);
        }}
      />
    );
  };

  // Explicit Active Dot to ensure clicks work when hovering
  const CustomActiveDot = (props: any) => {
      const { cx, cy, payload } = props;
      if (!payload) return null;
      
      return (
          <circle
              cx={cx}
              cy={cy}
              r={6}
              fill="#fff"
              stroke="#000"
              strokeWidth={2}
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(payload.index);
              }}
          />
      );
  };

  return (
    <div className="h-full w-full select-none overflow-hidden cursor-pointer bg-transparent">
      <ResponsiveContainer width="100%" height="100%" minHeight={1} debounce={100}>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          onClick={(e: any) => {
            if (e?.activePayload?.[0]) {
              onNavigate(e.activePayload[0].payload.index);
            }
          }}
        >
          <defs>
             {/* Gradient for White Orientation */}
             <linearGradient id="splitColorWhite" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff" stopOpacity={0.6}/>
                <stop offset="50%" stopColor="#fff" stopOpacity={0.4}/>
                <stop offset="50%" stopColor="#000" stopOpacity={0.4}/>
                <stop offset="100%" stopColor="#000" stopOpacity={0.6}/>
             </linearGradient>
          </defs>

          <XAxis dataKey="index" hide />
          <YAxis domain={[0, 100]} hide />

          <Tooltip
            cursor={{ stroke: 'var(--color-info)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const score = data.rawEval;
                const scoreText = data.isMate 
                    ? `Mate in ${Math.abs(score)}` 
                    : (score / 100).toFixed(2);
                
                return (
                  <div className="bg-[#1e293b] p-3 border border-white/10 rounded-xl shadow-2xl pointer-events-none backdrop-blur-xl">
                    <div className="text-white font-black text-xs uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <span className="text-zinc-500">Move {Math.floor((data.index / 2) + 1)}{data.index % 2 === 0 ? '.' : '...'}</span> 
                        <span className="text-white">{data.san}</span>
                    </div>
                    <div className={`text-lg font-black tracking-tighter ${score >= 0 ? 'text-jungle-green-400' : 'text-rose-400'}`}>
                      {score > 0 ? '+' : ''}{scoreText}
                    </div>
                    {data.classification && (
                        <div className="text-[10px] text-zinc-400 mt-1 uppercase font-black tracking-widest flex items-center gap-1.5">
                            <div className="size-1.5 rounded-full" style={{ backgroundColor: getMarkerColor(data.classification) }} />
                            {data.classification}
                        </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />

          {/* Center Reference Line */}
          <ReferenceLine y={50} stroke="#ffffff" strokeOpacity={0.1} strokeDasharray="4 4" />

          {/* Bottom Area */}
          <Area
            type="monotone"
            dataKey="evalVal"
            stroke="none"
            fill={orientation === 'white' ? '#ffffff' : '#000000'}
            fillOpacity={orientation === 'white' ? 0.15 : 0.4}
            baseValue={0}
            animationDuration={300}
            activeDot={false}
          />

          {/* Top Area */}
          <Area
            type="monotone"
            dataKey="evalVal"
            stroke={orientation === 'white' ? 'var(--color-info)' : '#ffffff'}
            strokeWidth={2}
            fill={orientation === 'white' ? '#000000' : '#ffffff'}
            fillOpacity={orientation === 'white' ? 0.4 : 0.15}
            baseValue={100}
            animationDuration={300}
            dot={<CustomDot />}
            activeDot={<CustomActiveDot />}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

