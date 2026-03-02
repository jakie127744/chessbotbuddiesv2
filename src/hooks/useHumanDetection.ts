"use client";

import { useEffect, useState, useRef } from 'react';

export function useHumanDetection() {
    const [isHuman, setIsHuman] = useState(false);
    const verifiedRef = useRef(false);

    useEffect(() => {
        // Check session storage to avoid duplicate requests per session
        if (typeof window !== 'undefined' && window.sessionStorage.getItem('human_verified')) {
            setIsHuman(true);
            verifiedRef.current = true;
            return;
        }

        const verifyHuman = () => {
            if (verifiedRef.current) return;
            
            verifiedRef.current = true;
            setIsHuman(true);
            
            // Mark session
            if (typeof window !== 'undefined') {
                window.sessionStorage.setItem('human_verified', 'true');
            }

            // Send Verification Ping
            try {
                fetch('/api/analytics/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        path: window.location.pathname,
                        timestamp: Date.now(),
                        userAgent: window.navigator.userAgent
                    })
                }).catch(err => console.error("[HumanDetection] Ping failed:", err));
            } catch (e) {
                // Ignore errors
            }

            // Cleanup listeners
            removeListeners();
        };

        const removeListeners = () => {
            window.removeEventListener('mousemove', verifyHuman);
            window.removeEventListener('scroll', verifyHuman);
            window.removeEventListener('keydown', verifyHuman);
            window.removeEventListener('touchstart', verifyHuman);
            window.removeEventListener('click', verifyHuman);
        };

        // Add Listeners
        window.addEventListener('mousemove', verifyHuman);
        window.addEventListener('scroll', verifyHuman);
        window.addEventListener('keydown', verifyHuman);
        window.addEventListener('touchstart', verifyHuman);
        window.addEventListener('click', verifyHuman);

        return () => {
            removeListeners();
        };
    }, []);

    return isHuman;
}
