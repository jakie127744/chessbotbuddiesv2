"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Component that refreshes AdSense ads on route changes.
 * AdSense doesn't automatically detect internal navigation in SPAs.
 */
export function AdSenseRouteChangeHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // We delay the push slightly to ensure the new DOM is ready
    const timer = setTimeout(() => {
      try {
        if (typeof window !== "undefined" && window.adsbygoogle) {
          // Individual AdBanner components already handle their own pushes.
          // Calling a global push here triggers "Already have ads" errors.
          console.debug("[AdSense] Route change detected, skipping global push to avoid duplicates.");
        }
      } catch (error: any) {
        const errorMsg = error?.message || String(error);
        if (errorMsg.includes("already have ads in them") || errorMsg.includes("availableWidth=0")) {
          // These are expected during transitions or if AdBanner already initialized
          console.debug(`[AdSense] Push skipped: ${errorMsg.includes("already have ads") ? "Already filled" : "Container not ready"}`);
        } else {
          console.error("[AdSense] Push failed:", error);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return null;
}
