
import React from 'react';
import { X } from 'lucide-react';
import { OpeningVariation } from '@/lib/openings-repertoire';

interface OpeningVariationListProps {
  selectedOpening: string;
  variations: OpeningVariation[];
  onSelectVariation: (v: OpeningVariation) => void;
  onBack: () => void;
  onDeleteCustom?: (id: string) => void;
}

export function OpeningVariationList({ 
  selectedOpening, 
  variations, 
  onSelectVariation, 
  onBack,
  onDeleteCustom 
}: OpeningVariationListProps) {
  
  const isCustom = selectedOpening === 'custom';

  return (
    <div className="h-full w-full bg-theme-surface flex flex-col p-6 overflow-hidden">
      <div className="bg-neutral-900 rounded-xl border-2 border-neutral-700 w-full max-w-5xl mx-auto h-full p-8 shadow-2xl flex flex-col">
        <button onClick={onBack} className="text-blue-400 hover:text-blue-300 mb-4 shrink-0 self-start">
          ← Back to Openings
        </button>
        
        <h3 className="text-2xl font-bold text-white mb-6">
          {isCustom ? 'My Repertoire' : `Choose Variation - ${selectedOpening.charAt(0).toUpperCase() + selectedOpening.slice(1)}`}
        </h3>

        <div className="space-y-3 overflow-y-auto">
          {variations.map((variation) => (
            <div
              key={variation.id}
              className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-lg p-4 transition-all flex justify-between items-center group"
            >
              <div 
                 onClick={() => onSelectVariation(variation)}
                 className="flex-1 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-bold text-white">{variation.name}</div>
                    <div className="text-sm text-zinc-400 mt-1">{variation.description}</div>
                    <div className="flex gap-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          variation.difficulty === 'beginner' ? 'bg-green-600 text-white' :
                          variation.difficulty === 'intermediate' ? 'bg-amber-700 text-slate-900' :
                          'bg-red-600 text-white'
                        }`}>
                          {variation.difficulty || 'Intermediate'}
                        </span>
                      <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold">
                        {variation.moves.length} moves
                      </span>
                      <span className="px-2 py-1 bg-neutral-600 text-white rounded text-xs font-bold">
                        {variation.playerColor === 'w' ? 'White' : 'Black'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {isCustom && onDeleteCustom && (
                 <button 
                    onClick={(e) => {
                       e.stopPropagation();
                       onDeleteCustom(variation.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-400 transition-opacity"
                 >
                    <X size={20} />
                 </button>
              )}
            </div>
          ))}
          
          {variations.length === 0 && (
             <div className="text-center text-zinc-500 py-8">
                No variations found.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
