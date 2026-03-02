'use client';

import React from 'react';
import { DynamicMascot, MascotMood } from './DynamicMascot';

interface MascotProps {
  size?: number;
  mood?: MascotMood;
  className?: string;
}

/**
 * Buddy the Mascot - Base Component
 */
export function Mascot({ size = 48, mood = 'idle', className = '' }: MascotProps) {
  return <DynamicMascot size={size} mood={mood} className={className} />;
}
