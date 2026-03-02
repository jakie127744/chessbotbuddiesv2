# Technical Audit Prompt

You are performing a focused technical review of the Chess App Deployment (Next.js 16, Turbopack). Use this checklist:

## Functional Flows
- Verify game import: `ImportGamesModal` stores `importedPgn`/`importedGameMeta` in sessionStorage and routes to `/review?import=true`; confirm review page consumes these and renders moves/metadata.
- Verify saved-game review: History entries and post-game overlay route to `/review?id=<id>`; ensure `getGameById` retrieval works.
- Confirm review limits: 3/day with rewarded-ad top-up (+3). Check `ReviewLimitManager` reset and consumption on review start.

## Engine & Analysis
- Confirm engine settings modal in `GameReviewRedesign` opens, persists `chess_engine_config`, and settings propagate to live analysis (`useLiveAnalysis`) and arrows (`ENGINE_LINE_COLORS`, `showArrows`).
- Validate Stockfish worker respects depth/time/threads/hash/MultiPV inputs and doesn’t crash in WASM constraints.

## Routing & Redirects
- Legacy `/play?view=review` should redirect to `/review` (including `import=true` and `id=`). Confirm HTTP 307 and final landing page behavior.

## UI/UX Checks
- Post-game overlay in redesigned play view should save game and route to review.
- History lists (original + redesign) should link to `/review?id=<id>`.
- Sidebar active state highlights `review` on `/review`.

## Data/Storage
- Confirm localStorage keys: `chess-game-history`, `chess_engine_config`, `chess_review_limit`, `importedPgn`, `importedGameMeta`.
- Ensure imported games save correctly when reviewed and do not duplicate excessively.

## Testing Ideas
- Import PGN, start analysis, adjust engine settings, re-run analysis; verify no crashes and arrows respect MultiPV.
- Open legacy URL `/play?import=true&view=review` and ensure redirect and analysis still work.
- Exhaust daily reviews, trigger ad reward, and confirm review count increments and auto-starts.

Provide findings with file/line references (workspace-relative). Prioritize defects and regressions over minor nits.
