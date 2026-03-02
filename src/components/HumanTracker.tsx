'use client';

import { useHumanDetection } from '@/hooks/useHumanDetection';

// This component is a wrapper to run the hook in the Server Component layout
export function HumanTracker() {
    useHumanDetection();
    return null; // Render nothing, just run logic
}
