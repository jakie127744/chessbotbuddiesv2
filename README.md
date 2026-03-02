# ChessBotBuddies v2

A Next.js 16 application that powers the ChessBotBuddies training suite, including the redesigned training hub, bot trainers, and Stockfish-backed analysis tools. This document covers local setup, environment variables, quality checks, and deployment notes for Vercel and Cloudflare Pages.

## Tech Stack
- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Supabase (auth + data)
- Resend (transactional email)
- Stockfish WebWorker + custom bot engine

## Getting Started
1. **Clone** the repository.
2. **Install dependencies**: `npm install` (Node 20+).
3. **Copy env template**: `cp .env.example .env.local` and fill in the real secrets (see table below).
4. **Run locally**: `npm run dev` and open http://localhost:3000.
5. **Tests/Lint** (optional): `npm run lint`, `npm run test`.

## Environment Variables
| Name | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key used by the client. Rotate if exposed. |
| `NEXT_PUBLIC_BUDDY_API_URL` | Yes | HTTPS endpoint for the Buddy V2 inference API (Cloudflare Worker, Vercel function, etc.). |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Base URL used for share links and sitemap generation. |
| `RESEND_API_KEY` | Yes (server-only) | Resend secret key used in server actions/routes. Do **not** prefix with `NEXT_PUBLIC`. |

> ⚠️ Never commit `.env.local`. Keep sensitive keys in Vercel/Cloudflare dashboard settings.

## Project Scripts
| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run build` | Production build (used by Vercel). |
| `npm run start` | Serve the production build locally. |
| `npm run lint` | Run ESLint. |
| `npm run test` / `npm run test:watch` | Run Jest unit tests. |
| `npm run pages:build` | Generate the Cloudflare Pages bundle (OpenNext). |
| `npm run pages:deploy` | Deploy bundle to Cloudflare Pages via Wrangler. |

## Deployment Notes
### Vercel
- Build command: `npm run build`
- Output directory: `.next`
- Node version: 20.x
- Set the environment variables listed above in Project → Settings → Environment Variables.
- Optional: increase function timeout to 15s if Buddy API or Stockfish proxy functions run server-side.

### Cloudflare Pages (optional)
1. Run `npm run pages:build` to create `.vercel/output` via OpenNext.
2. Deploy with `npm run pages:deploy` or through CI. Ensure the same environment variables are defined in Cloudflare.

## Troubleshooting
- **Buddy API errors**: confirm `NEXT_PUBLIC_BUDDY_API_URL` returns a JSON payload within 8s.
- **Supabase auth issues**: rotate the anon key and ensure RLS policies allow the required operations.
- **Stockfish worker**: when embedding the evaluation hook, always unmount cleanly to avoid lingering workers.

For production credentials, refer to your secure vault at `E:\My Documents\Chess App\chess-app` and copy them into your local `.env.local` (do **not** commit them).
