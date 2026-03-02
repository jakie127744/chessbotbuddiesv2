'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationToastProps {
    message: string | null;
    type?: NotificationType;
    onClose: () => void;
    duration?: number;
}

export function NotificationToast({ message, type = 'success', onClose, duration = 3000 }: NotificationToastProps) {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [message, onClose, duration]);

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle2 className="text-emerald-400" size={20} />;
            case 'error': return <AlertCircle className="text-rose-400" size={20} />;
            case 'info': return <Info className="text-[var(--color-info)]" size={20} />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success': return 'border-emerald-500/30 bg-emerald-500/5';
            case 'error': return 'border-rose-500/30 bg-rose-500/5';
            case 'info': return 'border-[var(--color-info)]/30 bg-[var(--color-info)]/5';
        }
    };

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 }, x: '-50%' }}
                    className="fixed bottom-8 left-1/2 z-[100] w-[90vw] max-w-sm"
                >
                    <div className={`backdrop-blur-xl border-2 rounded-2xl p-4 shadow-2xl flex items-center gap-4 relative overflow-hidden ${getColors()}`}>
                        <div className="shrink-0">
                            {getIcon()}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-white leading-tight">
                                {message}
                            </p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-1 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                        
                        {/* Timer bar */}
                        <motion.div 
                            initial={{ scaleX: 1 }}
                            animate={{ scaleX: 0 }}
                            transition={{ duration: duration / 1000, ease: "linear" }}
                            className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left ${
                                type === 'success' ? 'bg-emerald-500' : 
                                type === 'error' ? 'bg-rose-500' : 'bg-[var(--color-info)]'
                            }`}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
