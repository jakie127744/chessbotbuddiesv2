import { useState } from 'react';
import { X } from 'lucide-react';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: string) => void;
    type: 'PGN' | 'FEN';
}

export function ImportModal({ isOpen, onClose, onImport, type }: ImportModalProps) {
    const [data, setData] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-lg shadow-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                    <h3 className="text-lg font-bold text-white">Import {type}</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <p className="text-sm text-zinc-400">
                        Paste your {type} string below to load the {type === 'PGN' ? 'game' : 'position'}.
                    </p>
                    <textarea
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        className="w-full h-32 bg-neutral-950 border border-neutral-800 rounded p-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono resize-none"
                        placeholder={type === 'PGN' ? '1. e4 e5 ...' : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'}
                    />
                </div>

                <div className="flex justify-end gap-3 p-4 bg-neutral-950/50 border-t border-neutral-800">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onImport(data);
                            setData('');
                            onClose();
                        }}
                        disabled={!data.trim()}
                        className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Import
                    </button>
                </div>
            </div>
        </div>
    );
}
