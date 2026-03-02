"use client";

import { useEffect, useRef, useState } from "react";

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat?: "auto" | "fluid" | "rectangle" | "autorelaxed" | string;
  dataAdLayout?: string;
  dataFullWidthResponsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function AdBanner({
  dataAdSlot,
  dataAdFormat = "auto",
  dataAdLayout,
  dataFullWidthResponsive = true,
  className,
  style,
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    try {
      if (adRef.current && !adLoaded) {
        // Check if the element is visible and has width to avoid availableWidth=0 error
        const isVisible = adRef.current.offsetWidth > 0 || adRef.current.offsetHeight > 0;
        
        if (isVisible && (window as any).adsbygoogle && adRef.current.innerHTML === "") {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          setAdLoaded(true);
        }
      }

      // Check for unfilled status to hide broken placeholders
      if (adRef.current && adLoaded) {
        const interval = setInterval(() => {
          if (adRef.current?.getAttribute('data-ad-status') === 'unfilled') {
            console.debug(`[AdSense] Ad slot ${dataAdSlot} remained unfilled.`);
            adRef.current.style.display = 'none'; // Hide the empty/broken slot
            clearInterval(interval);
          } else if (adRef.current?.getAttribute('data-ad-status') === 'filled') {
            clearInterval(interval);
          }
        }, 1000);
        return () => clearInterval(interval);
      }
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      if (errorMsg.includes("availableWidth=0")) {
        console.debug("[AdSense] Ad container not ready (width=0), skipping push.");
      } else {
        console.error("AdSense error:", error);
      }
    }
  }, [adLoaded, dataAdSlot]);

  return (
    <div className={className} style={{ minHeight: "250px", ...style }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-9907028021598445"
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-ad-layout={dataAdLayout}
        data-full-width-responsive={dataFullWidthResponsive}
      />
    </div>
  );
}
