import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // Disable X-Powered-By header for security
  poweredByHeader: false,
  // Silence Turbopack warning - we use webpack config from PWA plugin for production only
  turbopack: {},

  // Redirect old routes to new ones
  async redirects() {
      return [
        // Catch legacy review routes and point them to the dedicated /review page
        {
          source: '/play',
          has: [
            { type: 'query', key: 'view', value: 'review' },
            { type: 'query', key: 'import', value: 'true' },
          ],
          destination: '/review?import=true',
          permanent: false,
        },
        {
          source: '/play',
          has: [
            { type: 'query', key: 'view', value: 'review' },
            { type: 'query', key: 'id' },
          ],
          destination: '/review?id=:id',
          permanent: false,
        },
        {
          source: '/play',
          has: [
            { type: 'query', key: 'view', value: 'review' },
          ],
          destination: '/review',
          permanent: false,
        },
      ];
  },

  async headers() {
    return [
      {
        // Set CORP for stockfish files
        source: '/stockfish.js',
        headers: [
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
        ],
      },
      {
        source: '/stockfish.wasm',
        headers: [
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
        ],
      },
      {
        source: '/play/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
        ],
      },
      {
        source: '/puzzles/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
        ],
      },
      {
        source: '/learn/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
        ],
      },
      // Review route (kept for historical reasons or if redirect fails)
      {
        source: '/review/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
        ],
      },
      // Global security headers for all routes
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Content Security Policy for Stockfish (requires unsafe-eval)
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-src 'self' https:; worker-src 'self' blob:;"
          }
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
