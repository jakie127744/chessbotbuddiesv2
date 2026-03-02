"use client";

import { usePathname } from "next/navigation";

interface AdSenseConfigProps {
  requestNonPersonalizedAds?: boolean;
}

export function AdSenseConfig({
  requestNonPersonalizedAds = true, 
}: AdSenseConfigProps) {
  return (
    <>
      {requestNonPersonalizedAds && (
        <script
          id="adsense-npa-config"
          dangerouslySetInnerHTML={{
            __html: `(window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 1;`
          }}
        />
      )}
    </>
  );
}
