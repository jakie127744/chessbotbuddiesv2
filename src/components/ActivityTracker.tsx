'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { logActivity } from '@/lib/activity-logger';

export function ActivityTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Log page view on mount and on route change
    // Construct full URL path including query params
    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    logActivity('PAGE_VIEW', { path: url });
  }, [pathname, searchParams]);

  return null; // This component renders nothing
}
