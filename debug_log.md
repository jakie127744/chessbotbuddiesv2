# Debug Log

### 1. `chess.js` Empty FEN Validation Archer

**Bug**:

- **Description**: The Next.js application throws a runtime error `Invalid FEN: missing white king` when trying to render the empty board during the "Battlefield" lesson.
- **Location**: `src/components/LessonPlayer.tsx`
- **Root Cause**: The naive `new Chess(fen)` constructor fails because the `chess.js` library strictly validates FEN strings and throws an exception if the board lacks the mandatory White and Black Kings required for a legal game of chess. Our empty board tutorial FEN `8/8/8/8/8/8/8/8 w - - 0 1` violates this rule.

**Fix**:

- **Summary**: Replace the static constructor call with a dynamic factory closure that catches the empty board initialization and uses the `.clear()` bypass method.
- **Files Changed**: `src/components/LessonPlayer.tsx`
- **Why It Works**: Instantiating a valid standard game first (`new Chess()`) and explicitly calling `.clear()` manually empties the internal board state without triggering the strict FEN string validation regex that an empty initialization string normally provokes.

**Prevention**:

- **Rule or Pattern**: Never pass non-standard configuration FENs directly into the `chess.js` constructor without validation.
- **Future Safeguard**: Wrap external or untrusted FEN parsings in a `try...catch` block and provide a graceful fallback (like a standard internal starting array) to prevent hard app crashes when visualizing custom layouts.

### 2. Missing Knight's Tour Minigame Logic

**Bug**:

- **Description**: The Knight's Tour minigame is unresponsive; clicking valid squares does not process the move or track the score/visited squares.
- **Location**: `src/components/LessonPlayer.tsx`
- **Root Cause**: The component was entirely missing the `KNIGHT_TOUR` section inside the `handleMove` function, so movements made by the player were treated as normal, unvalidated piece moves on an empty board.

**Fix**:

- **Summary**: Injected the validation and UI logic for Knight's Tour back into `LessonPlayer.tsx`, using imported helpers like `validateKnightTourMove` and `checkKnightTourSuccess`.
- **Files Changed**: `src/components/LessonPlayer.tsx`
- **Why It Works**: When the lesson ID matches `MINIGAME_IDS.KNIGHT_TOUR`, `handleMove` intercepts the move, validates it against `visitedSquares`, updates the `visitedSquares` state, checks for victory via the helper, and provides `flashFeedback` updates natively instead of allowing `chess.js` to process it blindly.

**Prevention**:

- **Rule or Pattern**: Ensure all minigames defined in `world-X-minigames.ts` have corresponding handlers in the central game loop (`handleMove`).
- **Future Safeguard**: When migrating or refactoring massive components like `LessonPlayer.tsx`, use a checklist comparing original minigame IDs with the `handleMove` switch/if-block cases to guarantee none are accidentally discarded.

### 3. Hardcoded Board Color in Lessons

**Bug**:

- **Description**: Changing the board color theme in settings doesn't apply to the board inside the `LessonPlayer` (lessons and minigames); it remains stuck on "neon".
- **Location**: `src/components/LessonPlayer.tsx`
- **Root Cause**: The `colorScheme` prop was hardcoded to `"neon"` inside the `<ChessBoard />` component rendered within `LessonPlayer`.

**Fix**:

- **Summary**: Imported the dynamic `useBoardColorScheme` hook from context and replaced the hardcoded string with the active context value.
- **Files Changed**: `src/components/LessonPlayer.tsx`
- **Why It Works**: The `LessonPlayer` now subscribes to the `BoardColorSchemeContext`. When the user changes their settings, the context broadcasts the new theme, and the board instantly re-renders with the user's selected colors.

**Prevention**:

- **Rule or Pattern**: Avoid hardcoding visual themes (like `colorScheme`) on global components unless explicitly intended to override user preferences for a specific cinematic effect.
- **Future Safeguard**: Search codebase for hardcoded design props periodically (e.g., `colorScheme="neon"`) and replace them with context values to ensure uniform styling across the application.

### 4. Safe Bishop Broken Random Target Generation

**Bug**:

- **Description**: The "Safe Bishop" minigame was only spawning one bishop and no enemy targets.
- **Location**: `src/lib/minigame-rules.ts` (`generateSafeBishopBoard`) and `src/hooks/useLessonGame.ts`.
- **Root Cause**:
  1. In `generateSafeBishopBoard`, the random board generator was rejecting almost all boards because it checked `tempGame.inCheck()` after placing Black targets. Since White's King starts at `e1`, and Random Black pawns/rooks were placed, they often immediately attacked `e1`, causing the generator to reject the board and fallback to a default FEN.
  2. The fallback FEN string was invalid (`4k3/8/2p5/8/8/5p2/8/3BK3 w - - 0 1`), which then crashed the Chess instance or resulted in an empty board with 1 piece.
  3. In `useLessonGame.ts`, minigames were only generating the board on mount, meaning clicking 'Retry' gave you the same board (or same broken state).

**Fix**:

- **Summary**: Removed the `inCheck()` validation that was rejecting valid minigame boards, fixed the fallback FEN, and wired up `useLessonGame.ts` to properly regenerate the board on retries. Additionally, bypassed the bot engine logic for the `BISHOP_TOUR` minigame by explicitly excluding it in the bot movement `useEffect`.
- **Files Changed**: `src/lib/minigame-rules.ts`, `src/hooks/useLessonGame.ts`, `src/components/LessonPlayer.tsx`
- **Why It Works**: The `inCheck` validation was overly strict. Removing it allows the valid targets to spawn. The `useLessonGame.ts` fix ensures the user always gets a fresh randomly generated board. Adding the `lesson.id === MINIGAME_IDS.BISHOP_TOUR` exclusion to the bot logic prevents `chess.js` from trying to calculate moves for Black, avoiding crashes when the turn is swapped after a White capture. We also limited the captures to 5 for a quicker round.

**Prevention**:

- **Rule or Pattern**: When using `chess.js` to validate randomized minigame starting positions, don't apply standard chess rules (like King safety) unless it's strictly necessary for that specific minigame's mechanics.
- **Future Safeguard**: Always test fallback FEN strings manually to ensure they are at least visually valid when random generation loops fail.

### 5. Farmer Piggies "Old Louis & the Farm Hands" Two Dark Squared Bishops

**Bug**:

- **Description**: The "Old Louis & the Farm Hands" minigame spawned two dark-squared bishops instead of one dark-squared and one light-squared bishop.
- **Location**: `src/lib/data/world-1-minigames.ts`
- **Root Cause**: The manually crafted starting FEN `4k3/pppppppp/8/8/8/8/8/2B1K1B1 w - - 0 1` placed the bishops on `c1` and `g1`. In chess notation, `c1` is a dark square and `g1` is a dark square, which violates standard chess rules requiring opposite-colored bishops.

**Fix**:

- **Summary**: Changed the starting FEN so that one bishop is on `c1` (dark) and the other is on `f1` (light).
- **Files Changed**: `src/lib/data/world-1-minigames.ts`
- **Why It Works**: The new FEN (`4k3/pppppppp/8/8/8/8/8/2B1KB2 w - - 0 1`) places the bishops correctly on opposite colors without changing the overall balance of the minigame.

**Prevention**:

- **Rule or Pattern**: Always verify square color logic when manually writing FEN strings involving bishops (checking if file + rank is even/odd).
- **Future Safeguard**: Use an online FEN visualizer or a small validation script when introducing new custom board configurations into the data files.

### 6. Castling Lesson FEN states already Castled

**Bug**:

- **Description**: In the Castling lesson (`world-1-lessons.ts`), the challenge boards presented to the user to perform "kingside" and "queenside" castling were already in a castled state (kings on g1/c8), making the lesson impossible to complete successfully.
- **Location**: `src/lib/data/world-1-lessons.ts`
- **Root Cause**: The manually provided FEN strings (`r3kbnr/pppq1ppp/2npb3/1B2p3/4P3/2N2N1P/PPPP1PP1/R1BQK2R`) were incorrect for the "before" state of castling. They contained pieces in the way of the rooks, and the castling flags in the FEN might have been conflicted.

**Fix**:

- **Summary**: Replaced the complex, incorrect FEN strings with a clean, open board state specifically designed for practicing castling where the King and Rooks are in their naked starting positions.
- **Files Changed**: `src/lib/data/world-1-lessons.ts`
- **Why It Works**: The new FEN (`r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1`) provides a completely unobstructed back rank, allowing the `chess.js` engine to legally validate the `e1g1` and `e8c8` moves requested by the lesson solution.

**Prevention**:

- **Rule or Pattern**: When designing interactive board tutorials that require highly specific moves (like castling or en passant), use minimalist FEN strings that only contain the necessary pieces to execute the move to prevent unintended engine validations from blocking the lesson.
- **Future Safeguard**: Implement a unit test suite that iterates through all `world-X-lessons.ts` files, loads each `fen` into `chess.js`, and verifies that the `solution` move array is completely legal from that starting position.

### 7. Castling Queenside as Black Automatically Plays Solution

**Bug**:

- **Description**: The "Castle queenside as Black" challenge completed automatically without user intervention as soon as the page loaded.
- **Location**: `src/lib/data/world-1-lessons.ts` and `src/components/LessonPlayer.tsx`
- **Root Cause**: The `LessonPlayer.tsx` has an auto-move effect designed to play the opponent's (usually Black's) moves from the `solution` array when it's not the player's turn. Because the Castling as Black challenge did not explicitly set `playerColor: "b"`, the engine assumed the user was White. Since the FEN started with Black's turn (`b`), the auto-move effect triggered immediately and played the solution (`e8c8`) for the user.

**Fix**:

- **Summary**: Added `playerColor: "b"` and `interactive: true` to the challenge in `world-1-lessons.ts` and updated the `LessonContent` type definition in `src/lib/lesson-types.ts` to allow `playerColor`.
- **Files Changed**: `src/lib/data/world-1-lessons.ts`, `src/lib/lesson-types.ts`
- **Why It Works**: By explicitly telling `LessonPlayer.tsx` that the user is controlling the Black pieces (`playerColor: 'b'`), the auto-move effect skips evaluating Black's turn, allowing the user to click and drag the King themselves to complete the castling move.

**Prevention**:

- **Rule or Pattern**: Any interactive lesson or minigame that asks the user to play as Black MUST explicitly include `playerColor: "b"` in the data definition to prevent the auto-player from stealing the move.
- **Future Safeguard**: Refactor `LessonPlayer.tsx` in a future PR to intelligently deduce `playerColor` from the `orientation` property if the FEN turn matches it, rather than requiring it explicitly on every page.

### 8. Game Review Analysis "Invalid move" Crash

**Bug**:

- **Description**: The Game Review analysis fails with an `Invalid move` error in the console when reviewing games imported via PGN.
- **Location**: `src/hooks/useGameAnalysis.ts`
- **Root Cause**: The analysis hook was replaying the game history using a fresh `new Chess()` instance, which defaults to the standard starting position. If the imported game had a custom starting FEN (like a Chess.com puzzle or variant), the first move recorded in the history would often be illegal from the standard starting square, causing the logic to crash.

**Fix**:

- **Summary**: Modified the history reconstruction to use the actual starting FEN of the first move in the game's history.
- **Files Changed**: `src/hooks/useGameAnalysis.ts`
- **Why It Works**: By initializing `tempGame` with `history[0].before`, we ensure the replay engine starts from the exact board state the game actually began with, making all subsequent moves legal for validation.

**Prevention**:

- **Rule or Pattern**: Never assume a game starts from the standard `rnbqkbnr` FEN when replaying move history.
- **Future Safeguard**: Always extract the starting board state from the PGN metadata or the first move's `before` property.

### 9. Game Review Board Scaling Overflows Viewport (Refined)

**Bug**:

- **Description**: The chessboard in Game Review was excessively large, causing it to overflow the viewport and clip UI elements like player plates and media controls.
- **Location**: `src/redesign/components/Review/GameReviewRedesign.tsx`
- **Root Cause**: The board container had a `max-w-[1100px]` constraint and lacked vertical sizing limits. Additionally, conflicting `overflow-hidden` and `overflow-y-auto` classes on the main container prevented proper scrolling, and the board column lacked alignment constraints, leading to clipping on standard laptop screens.

**Fix**:

- **Summary**: Reduced the maximum width to `700px`, added a `max-h-[65vh]` constraint, removed conflicting `overflow-hidden`, and wrapped player plates in alignment containers.
- **Files Changed**: `src/redesign/components/Review/GameReviewRedesign.tsx`
- **Why It Works**: The more aggressive scaling ensures the entire "game column" (player plates + board + controls) fits within most viewports. Removing `overflow-hidden` restores the ability to scroll if the content still exceeds the screen height. Wrapping the player plates in `justify-center` containers keeps the layout balanced despite the smaller board.

**Prevention**:

- **Rule or Pattern**: Use viewport-relative units (`vh`) or explicit maximums that account for common screen resolutions when designing large square components like chessboards.
- **Future Safeguard**: Test layout responsiveness on standard 13" and 15" laptop resolutions (e.g. 1366x768 and 1920x1080) to catch scaling issues early. Avoid combining `overflow-hidden` with scrollable child containers unless strictly necessary for a specific UI effect.

### 10. Game Review Player Nameplates Too Large

**Bug**:

- **Description**: The player nameplates in the Game Review layout were too large and contained redundant piece color information ("White Pieces" / "Black Pieces"), contributing to UI clutter and vertical clipping.
- **Location**: `src/redesign/components/Review/RedesignedPlayerPlate.tsx`
- **Root Cause**: The component was designed with large padding (`p-4`), large avatar sizing (`size-12`), and large text size for the name (`text-xl`) and clock (`text-3xl`). The redundant labels also increased the vertical footprint of the component.

**Fix**:

- **Summary**: Compacted the layout by reducing padding, avatar size, text sizes, and removing the piece color labels.
- **Files Changed**: `src/redesign/components/Review/RedesignedPlayerPlate.tsx`
- **Why It Works**: Reducing the vertical and horizontal footprint of the component ensures it fits better on smaller desktop viewports without sacrificing core information (name, rating, clock).

### 11. Move Navigation Off-Screen Due to Spacing

**Bug**:

- **Description**: The move navigation controls (Media buttons) at the bottom of the review screen were pushed off-screen, requiring scrolling to access.
- **Location**: `src/redesign/components/Review/GameReviewRedesign.tsx`
- **Root Cause**: Excessive vertical gaps (`gap-4`) and container padding (`p-5`), combined with a board that was slightly too tall (`max-h-[65vh]`), overflowed the standard laptop viewport height.

**Fix**:

- **Summary**: Tightened the vertical layout by reducing gaps to `gap-2.5`, reducing container padding to `p-2`, and shrinking the board's max height to `58vh`.
- **Files Changed**: `src/redesign/components/Review/GameReviewRedesign.tsx`
- **Why It Works**: These cumulative micro-adjustments reduce the total vertical footprint of the game column by approximately 10-15%, bringing the navigation controls back into the "above the fold" area on standard 1080p and 768p displays.

**Prevention**:

- **Rule or Pattern**: Use viewport-relative units (`vh`) or explicit maximums that account for common screen resolutions when designing large square components like chessboards.
- **Future Safeguard**: Prioritize core data and functional controls over whitespace. Test layout "above the fold" status on multiple viewport heights during development.

### 12. Non-Persistent Engine Settings

**Bug**:

- **Description**: Users had to manually re-enable "Cloud Analysis" and re-adjust engine settings (depth, lines) every time they refreshed the Game Review page.
- **Location**: `src/redesign/components/Review/GameReviewRedesign.tsx`
- **Root Cause**: While there was a partial implementation for saving `engineConfig` to `localStorage`, the `isEngineEnabled` (overall toggle) state was missing from the persistence logic, and some config rehydration was inconsistent.

**Fix**:

- **Summary**: Implemented full persistence for both the engine toggle (`isEngineEnabled`) and the detailed `engineConfig`.
- **Files Changed**: `src/redesign/components/Review/GameReviewRedesign.tsx`
- **Why It Works**: Added a dedicated `useEffect` to synchronize `isEngineEnabled` with `localStorage` and expanded the rehydration effect to check for both the enabled state and the configuration object on mount.

**Prevention**:

- **Rule or Pattern**: User-configurable settings (toggles, sliders, preferences) should always be synchronized with persistent storage (e.g., `localStorage`) to provide a seamless multi-session experience.
- **Future Safeguard**: Audit all new UI toggles for persistence requirements during the design phase.

### 13. Coach Analysis Stalling / Stuck on "Thinking"

**Bug**:

- **Description**: Coach Jakie was reported to be stuck on "Thinking about the position..." indefinitely, or behaving as if the analysis had stalled.
- **Location**: `src/redesign/components/Review/ReviewSidebar.tsx` and `src/hooks/useGameAnalysis.ts`
- **Root Cause**:
  1. **UI Fallback**: The sidebar commentary had a logical fallback that displayed "Analyzing..." whenever a move's analysis data was missing, regardless of whether analysis was actually running. If navigating to an unanalyzed move, it would appear stuck.
  2. **Worker Instability**: `useGameAnalysis` was setting WASM Stockfish to use 2 threads. In many browser environments without specific cross-origin isolation headers, this can cause the worker to crash or hang.
  3. **Lack of Feedback**: The UI didn't show per-move progress in the commentary, making the (expectedly slow) analysis feel like it had stalled.

**Fix**:

- **Summary**: Improved UI responsiveness to analysis state, added progress feedback, and tuned worker settings for stability.
- **Files Changed**:
  - `src/redesign/components/Review/ReviewSidebar.tsx`: Prioritized `isAnalyzing` in the commentary logic and added a progress message ("I'm analyzing move X...").
  - `src/hooks/useGameAnalysis.ts`: Reduced `Threads` to 1 for better WASM reliability and added granular console logging.
- **Why It Works**: The UI now clearly distinguishes between "Actually Analyzing" and "Waiting for Move Data". Reducing threads to 1 prevents the specific WASM hangs associated with multi-threading in constrained browser environments.

**Prevention**:

- **Rule or Pattern**: Always provide granular progress feedback for long-running operations (like chess analysis). Ensure worker settings are compatible with standard web environments (1 thread for WASM).
- **Future Safeguard**: Use state-driven commentary that explicitly checks the "is active" boolean before defaulting to an "active" message.

### 14. Lost Game History in Bot Games (Review Only Shows Last Move)

**Bug**:

- **Description**: Games played against local bots only showed the final move in the Game Review, instead of the full sequence of moves.
- **Location**: `src/app/(dashboard)/play/page.tsx` and `src/redesign/components/Review/GameReviewRedesign.tsx`
- **Root Cause**:
  1. **FEN-based State**: The `handleMove` and `onUndo` functions in the play page were recreating the `Chess` instance using `new Chess(game.fen())`. In `chess.js`, this initializes a board at the given position but with an empty move history.
  2. **Property Mismatch**: A secondary issue caused "NaN" to appear in the live engine analysis rows because the UI expected `evaluation` while the live analysis hook provided `score`.

**Fix**:

- **Summary**: Switched to `pgn()`-based state management and corrected property mapping.
- **Files Changed**:
  - `src/app/(dashboard)/play/page.tsx`: Updated `handleMove` and `onUndo` to use `loadPgn(game.pgn())` to preserve full history.
  - `src/redesign/components/Review/GameReviewRedesign.tsx`: Mapped `line.score` to `line.evaluation` for the engine analysis table.
- **Why It Works**: Preserving the PGN ensures that `game.history()` stays intact, which is what the `saveGame` function uses for the review data. The property mapping ensures valid numeric values for the UI.

**Prevention**:

- **Rule or Pattern**: When updating state for complex objects like a `Chess` instance in React, always ensure the full internal state (including history) is cloned, typically via PGN or a deep copy, rather than just the current piece positions (FEN).
- **Future Safeguard**: Audit game state updates for potential history truncation.

### 15. Missing Last Move Highlight Implementation in `ChessBoard.tsx`

**Bug**:

- **Description**: The last move made on the board was not visually highlighted, despite the `lastMove` prop being passed to the component.
- **Location**: `src/components/ChessBoard.tsx`
- **Root Cause**: The component had code to calculate `isLastMove` and `lastMoveOverlay`, but the `lastMoveOverlay` was never applied to any UI element, and the `isLastMove` boolean was not wired to any Tailwind highlight classes in the main `div`'s `twMerge` call.

**Fix**:

- **Summary**: Integrated the `isLastMove` state into the square cell's Tailwind classes and refined the visual style.
- **Files Changed**: `src/components/ChessBoard.tsx`, `src/redesign/components/ChessBoard.tsx`
- **Why It Works**: Added `isLastMove && !isSelected && !isCheck && "bg-[#fff952]/40"` to the `twMerge` call. This applies a semi-transparent bright yellow background to the squares involved in the last move. Also updated the `backgroundColor` logic in the `style` prop to set it to `undefined` when `isLastMove` is true, ensuring the Tailwind class takes precedence over the default square color.

**Prevention**:

- **Rule or Pattern**: When implementing props that affect visual state (like `lastMove`), ensure they are actually consumed by the rendering logic (either via `style` or `className`).
- **Future Safeguard**: Use a "prop-usage" checklist during component reviews to verify that all interface properties are functional and reflected in the UI.

### 16. Endgame Trainer `accuracy` ReferenceError

**Bug**:

- **Description**: The Endgame Trainer component crashed with `ReferenceError: accuracy is not defined` when rendering the practice view.
- **Location**: `src/components/EndgameTrainer.tsx`
- **Root Cause**: The `accuracy` variable was defined locally within a `useEffect` hook for calculating end-of-game statistics, but it was not defined in the main component's render scope where it was referenced in the JSX (specifically in the redesigned Coach Sidebar).

**Fix**:

- **Summary**: Moved the `accuracy` calculation to the main component's render scope.
- **Files Changed**: `src/components/EndgameTrainer.tsx`
- **Why It Works**: Defining `accuracy` in the render scope makes it accessible to the JSX during every render cycle. It dynamically calculates the value based on the current `moveCount` and `optimalMoves` state variables.

**Prevention**:

- **Rule or Pattern**: Ensure that all variables referenced in JSX are defined in the component's render scope or provided via props/context.
- **Future Safeguard**: When moving logic from a `useEffect` or a different component into a new area, carefully audit the scope of all variables used in the final `return` statement.

### 17. Farmer Piggies Phase 2 Premature Game End

**Bug**:

- **Description**: The Farmer Piggies minigame ends immediately with "Round Over" as soon as Phase 2 starts, before the player can make a move.
- **Location**: `src/components/LessonPlayer.tsx`, `performBotMove` effect.
- **Root Cause**: A race condition where `currentPage` state updates before `fen`, causing the `botEffect` to run with a stale FEN (from Phase 1) that has a turn matching the bot. Additionally, `piggiesCaptured` was stale from Phase 1 (value of 8), which triggered the "Round Over" check immediately based on the logic `captured + escaped === 8`.

**Fix**:

- **Summary**: Consolidated state resets into a single `useEffect` on `currentPage`, added atomic FEN initialization alongside state resets, and improved the bot move and stalemate/completion guards to be color-aware and robust against stale state.
- **Files Changed**: `src/components/LessonPlayer.tsx`
- **Why It Works**: Synchronizing the FEN reset with the `piggiesCaptured` reset ensures that when the bot effect runs, it sees the fresh state. The refined guards verify that the bot only moves if it owns the current turn's pieces and that stalemate checks only trigger for the correct pawn color.

**Prevention**:

- **Rule or Pattern**: Group related state updates in a single `useEffect` or use useReducer when navigating between functionally distinct phases within the same component to ensure atomic transitions.
- **Future Safeguard**: Always verify that auxiliary state (like capture counts) matches the current board state's pieces before triggering irreversible game-wide events like "Game Over" modals.

### 18. Mate-in-1/2 Rush Initialization and Orientation

**Bug**:

- **Description**: The Mate Rush minigames were not displaying puzzles (showing "1/5" with a placeholder board) and did not automatically play the opponent's lead-in move.
- **Location**: `src/components/LessonPlayer.tsx`
- **Root Cause**:
  1. The initialization `useEffect` was checking the wrong lesson ID string and was being overwritten by the placeholder `currentPage.fen`.
  2. Lichess puzzle data requires playing the first move in the `moves` array to reach the intended puzzle position.
  3. The board orientation was flip-flopping during moves because it used `fen.turn()`, which changes after every move.

**Fix**:

- **Summary**: Corrected the initialization logic, implemented auto-play for leading moves, and stabilized board orientation using a memoized value based on the starting position of each puzzle.
- **Files Changed**: `src/components/LessonPlayer.tsx`, `src/lib/minigame-rules.ts`
- **Why It Works**: Using the puzzle's starting turn to determine a fixed orientation prevents the board from flipping when the turn changes during the solution sequence.

**Prevention**:

- **Rule or Pattern**: When integrating external puzzle databases, verify if the starting FEN is the position _before_ or _after_ the first move in the solution array.
- **Future Safeguard**: Use standardized `MINIGAME_IDS` for all minigame state detection.

### 19. Tactical Puzzles: Board Orientation and Engine Interference

**Bug**:

- **Description**: Black-to-move tactical puzzles (like Mate-in-3) were visually rendering from White's perspective. In addition, Stockfish would execute moves for Black instead of the user, essentially auto-solving or interfering with the puzzle sequence.
- **Location**: `src/components/LessonPlayer.tsx`
- **Root Cause**:
  1. The `rushOrientation` logic incorrectly assumed `p.fen` (the puzzle's FEN _before_ the automated opponent move) dictated the user's color directly, causing Black-to-move puzzles to appear as White.
  2. The `ChessBoard` component's `orientation` override bypassed most tactical minigames because it only strictly checked for `mate-in-1-rush` and `mate-in-2-rush`.
  3. The `getBotMove` `useEffect` listened for Black's turn globally if `playVsBot` was true. During Black-to-move puzzles, it identified the turn and fired asynchronous engine moves, disrupting the puzzle sequence handling.

**Fix**:

- **Summary**: Upgraded `rushOrientation` to resolve the color _after_ evaluating the opponent's first FEN move, passed the generic `isPuzzleRush` flag to enforce this orientation rule on all tactical puzzles, and explicitly excluded `isPuzzleRush` from triggering `getBotMove`.
- **Files Changed**: `src/components/LessonPlayer.tsx`
- **Why It Works**:
  1. `return new Chess(p.fen).turn() === 'w' ? 'black' : 'white'` correctly anticipates the user's color _after_ the initial puzzle state move.
  2. Using the `isPuzzleRush` boolean guarantees the UI and bot logic treats all tactic sequences (Forks, Mate-in-3, etc.) homogeneously.
  3. Halting `getBotMove` during puzzles ensures deterministic progression based purely on user inputs vs the puzzle move array.

**Prevention**:

- **Rule or Pattern**: When implementing deterministic sequences (like static puzzles) within an environment that supports dynamic engine play, ensure the engine hooks possess explicit guard clauses isolating them from sequence-driven interfaces.
- **Future Safeguard**: Use generalized flags (e.g., `isPuzzleRush`, `isEndgameMinigame`) over hardcoded lesson IDs for behavioral toggling across UI components.

### 20. External Puzzle API Fallback & Polgar Array Offset

**Bug**:

- **Description**: The "Mate in 3 Rush" minigame was displaying exactly 2 player actions (3 plies total) and simulating Stockfish playing the first player's move.
- **Location**: `src/lib/chess-puzzles-api.ts` and `src/components/LessonPlayer.tsx`
- **Root Cause**:
  1. The API fetch for `mateIn3` had a `start` offset of 5000 index, which exceeded the dataset of the external API (`chess_puzzles_api`), returning 0 items silently.
  2. The empty array fallback fired `LICHESS_PUZZLES.mateIn2` using Polgar puzzles.
  3. Lichess structured arrays begin with an opponent blunder (index 0). Polgar arrays start precisely on the player's turn. Because `LessonPlayer` unconditionally auto-played index 0, it artificially played White's first move during `polgar-` puzzles, stealing the player's turn and "resolving" the 3-ply puzzle computationally.

**Fix**:

- **Summary**: Adjusted external fetch offset limit to 100, and explicitly disabled index 0 auto-play in `LessonPlayer.tsx` if the ID string contains `polgar-` (using `!puzzle.id.startsWith('polgar-')`).
- **Files Changed**:
  - `src/lib/chess-puzzles-api.ts`
  - `src/components/LessonPlayer.tsx`
- **Why It Works**: By preventing the artificial "opponent blunder" from firing on Polgar puzzles, the player actually plays their White starting move, recovering the missing ply. The `start` offset reduction secures the true Mate in 3 dataset.

**Prevention**:

- **Rule or Pattern**: Validate implicit API array lengths before fetching dynamically. Normalize third-party data structure offsets to a unified domain entity.
- **Future Safeguard**: If combining custom datasets (Polgar) with standard APIs (Lichess), introduce explicit alignment checks (or `hasOpponentLeadIn` boolean) instead of guessing array alignments.

### 21. Standard Challenge Opponent Response Failure

**Bug**:

- **Description**: In standard `challenge` pages with multi-move sequences (e.g., "Thinking Backwards"), the opponent (Black) would completely ignore the player's opening move and fail to respond, freezing the puzzle sequence.
- **Location**: `src/components/LessonPlayer.tsx`
- **Root Cause**:
  1. The generic `handleMove` function did not validate moves against `solution` arrays or iterate `currentMoveIndex` for the user. When the user played their move, `currentMoveIndex` stayed at 0.
  2. The auto-response `useEffect` for the opponent tried to play `solution[currentMoveIndex]` (which was still the user's previously played white move, evaluating to an invalid black move) and aborted silently.
  3. A transition guard (`fen !== currentPage.fen`) immediately returned anyway, permanently disabling bot checks on the initial modified FEN.

**Fix**:

- **Summary**: Upgraded `handleMove` to explicitly check for multi-move `solution` arrays, validate the UCI move string (`playerMoveUci.startsWith(expectedMove)`), and increment `currentMoveIndex` _before_ the opponent's turn. Refactored the `useEffect` FEN guard to strictly apply only when `currentMoveIndex === 0`.
- **Files Changed**: `src/components/LessonPlayer.tsx`
- **Why It Works**: The application is now fully aware of intermediate steps during scripted, non-minigame challenges. The index climbs sequentially, allowing the bot's standard logic to hook onto `solution[1]`, `solution[3]`, etc.

**Prevention**:

- **Rule or Pattern**: Validate all interactive steps in scripted sequences, even if implicit user progression logic relies on global states (like checkmates). State iterations must be explicitly mapped to action progression logic.
- **Future Safeguard**: Combine sequential puzzle handlers when feasible instead of creating disparate evaluation loops for `isPuzzleRush` versus standard sequences.

### 22. Lesson Data Integrity: Invalid FEN and UCI Strings

**Bug**:

- **Description**: During the "Thinking Backwards" lesson, the automated opponent would occasionally freeze despite the `LessonPlayer` index mapping logic being flawless.
- **Location**: `src/lib/data/world-1-lessons.ts`
- **Root Cause**:
  1. Pattern 1: The solution array contained `h4h4`. However, the FEN dictates the Black King is on `h5`. It moves to `h4` to capture the Rook. The correct UCI string is `h5h4`. By attempting a zero-distance move, `chess.js` rejected standard auto-play logic and silently died.
  2. Pattern 4: The FEN string `k3b3/pp1nn3/N3B3/KQ6/3br3/8/8/8` completely omitted White's Rook on `c4` (encoded as an empty square block `3`). This caused the very first solution move (`c4c8`) to instantly fail because no piece existed on `c4`.

**Fix**:

- **Summary**: Corrected `h4h4` to `h5h4` to ensure legal evaluation, and amended the FEN segment `3br3` to `2Rbr3` to inject the missing White Rook on `c4`.
- **Files Changed**: `src/lib/data/world-1-lessons.ts`
- **Why It Works**: The lesson data is now mathematically legal according to the strict validation logic of `chess.js`. With legal inputs, the `LessonPlayer` auto-move `useEffect` successfully executes the programmed sequence.

**Prevention**:

- **Rule or Pattern**: Never assume hardcoded tutorial data is 100% physically legal by engine standards. Check `chess.js` move validation logs (`moveResult === null`) before debugging complex UI hooks.
- **Future Safeguard**: Write a compile-time script `npm run validate-data` that spins up a virtual `chess.js` instance to test every minigame and lesson `solution` array across all local FENs to catch string typos proactively.

### 23. Sequential Puzzle UCI vs. SAN Parser Failure

**Bug**:

- **Description**: Certain `challenge` lessons (like "Level 2: The Fork") used Standard Algebraic Notation (`Nc7+`) in their solution arrays instead of raw UCI coordinate strings (`d5c7`). The generic `LessonPlayer` move logic blindly matched the string `(from + to)` against the array, causing valid moves like `d5-c7` to instantly fail validation since `"d5c7" !== "Nc7+"`. Additionally, the opponent auto-move parser tried to execute `chess.move('Nc7+')` with the raw logic intended for UCI arrays, creating unpredictable freeze conditions.
- **Location**: `src/components/LessonPlayer.tsx`
- **Root Cause**: The application had zero normalization between UCI board formats (used by external API payloads) and standard SAN formats (used by hand-written lesson definitions).

**Fix**:

- **Summary**: Upgraded the player validation hook to evaluate `moveResult.san === expectedMove` alongside the initial `playerMoveUci.startsWith(expectedMove)`. Upgraded the auto-responder to use `chess.move({from, to})` explicitly for strict UCI formats (length 4/5 string matching a coordinate regex), while safely passing raw SAN strings directly internally.
- **Files Changed**: `src/components/LessonPlayer.tsx`
- **Why It Works**: The application is now fully agnostic to the `solution` string formatting. `chess.js` can process moves safely whether the data is provided as raw engine output or natural human notation.

**Prevention**:

- **Rule or Pattern**: Validate user inputs against the official chess notation standard (SAN) provided by the game engine object, not against raw composite UCI coordinates which hide captures and checks (+).
- **Future Safeguard**: Standardize all manual hardcoded tutorials around SAN notation, while continuing to parse UCI solely for external programmatic database integrations.

### 24. Single-Move SAN Bypass

**Bug**:

- **Description**: The "Level 2: The Fork" puzzle correctly accepted SAN inputs, but silently swallowed the move without declaring the puzzle complete or throwing an error, permanently stalling progress on the page.
- **Location**: `src/components/LessonPlayer.tsx`
- **Root Cause**: The variable `hasSequentialSolution` dictated whether the new SAN validator and completion engine ran for standard `solution` arrays. However, it was strictly bounded to `solution.length > 1`. Because the "Fork" puzzle only required one move (`['Nc7+']`), it evaluated to `false` and fell back to the legacy validator. Since the legacy code only awards completion on checkmates, it correctly moved the piece but had no win condition to trigger!
- **Fix**:
  - **Summary**: Changed the constraint from `solution.length > 1` to `solution.length > 0` so that single-move solutions process through the unified parser and receive explicit `currentMoveIndex >= solution.length` completion triggers.
  - **Files Changed**: `src/components/LessonPlayer.tsx`
  - **Why It Works**: All pages utilizing the `solution` array now run through the same standardized equality verification sequence, ensuring arrays of any length (even length 1) finish gracefully.

### 25. World-2 Tactics Minigames Load 0 Puzzles (Skewer, Fork, Pin, etc.)

**Bug**:

- **Description**: All World-2 tactics minigames (Skewer Snipe, Fork Frenzy, Pin Peril, etc.) start with an empty puzzle set, leaving the board in a placeholder state and making progress impossible.
- **Location**: `src/components/LessonPlayer.tsx` — `initializePuzzles()` in the page-change `useEffect`.
- **Root Cause**: The `initializePuzzles` function routed all tactic themes through `LICHESS_PUZZLES[theme]`. However, `LICHESS_PUZZLES` only contains mate-in-N and specific mating pattern data. It does **not** contain `fork`, `pin`, `skewer`, `discoveredAttack`, `backRankMate`, `doubleCheck`, `deflection`, or `attraction` entries. So `LICHESS_PUZZLES['skewer']` was `undefined`, making `selectedPuzzles` stay at `[]`.

**Fix**:

- **Summary**: Added `TacticsDataAll` import and introduced a `tacticsPoolMap` fallback in `initializePuzzles`. When `LICHESS_PUZZLES[theme]` is undefined or empty, the map routes the theme to `TacticsDataAll` methods (e.g., `'skewer' → TacticsDataAll.getSkewers()`).
- **Files Changed**: `src/components/LessonPlayer.tsx`
- **Why It Works**: `TacticsDataAll` reads from local JSON files (`puzzles_skewer.json`, etc.) which were already populated. The fallback selects 5 random puzzles from the correct thematic pool for every World-2 minigame.

**Prevention**:

- **Rule or Pattern**: When adding new puzzle themes, verify that ALL themes in `PUZZLE_THEMES` are represented in `LICHESS_PUZZLES` **or** have a matching entry in the `TacticsDataAll` pool map fallback.
- **Future Safeguard**: Consolidate all puzzle pools into a single `getPuzzlePool(theme)` helper so LessonPlayer has one authoritative lookup rather than two separate objects with partial coverage.

### 26. Tactical Minigame Puzzle Lead-in Logic

**Bug**:

- **Description**: Tactical minigames (e.g., "Dual Threats") in World 2 were starting already solved or in a final position.
- **Location**: `src/components/LessonPlayer.tsx`
- **Root Cause**: The `LessonPlayer` was auto-playing `moves[0]` for every puzzle, assuming it was an opponent lead-in move (standard for Lichess Mates). However, local tactical puzzles often start on the player's turn or only have 1 move, so auto-playing `moves[0]` immediately solved them. Additionally, the "Finish" button enabled after 4 puzzles instead of 5.
- [x] Fix "Finish" button enabling too early
- [x] Implement robust puzzle transitions (fix race condition between puzzles)
- [x] Fix "Overload Ops" minigame not populating puzzles.
  - Root Cause: Missing mapping for `w2-minigame-overloading` in `LessonPlayer.tsx` and empty `puzzles_overloading.json` data.
  - Fix: Added minigame mapping to `overloading` theme and updated `getOverloadings` to use `deflections` as a proven fallback until dedicated data is available.

**Fix**:

- **Summary**: Implemented a parity-based heuristic: puzzles with an even number of moves are assumed to have a lead-in, while those with an odd number of moves start on the player's turn. Fixed the "Finish" button to require 5 successful puzzles.
- **Files Changed**: `src/components/LessonPlayer.tsx`
- **Why It Works**: This heuristic correctly distinguishes between Lichess Mate-in-N puzzles (even moves) and local tactical single-move/player-first puzzles (odd moves).

**Prevention**:

### 27. Puzzle Transition Race Condition

**Bug**:

- **Description**: In Puzzle Rush, subsequent puzzles would sometimes fail to load or get "stuck" if the user interacted with the board during the 1-second success transition.
- **Location**: `src/components/LessonPlayer.tsx`
- **Root Cause**: The `rushSuccessCount` (which controls orientation and labels) was updated immediately, but the `fen` and `moveIndex` were delayed by 1000ms. This created a desync where the user could try to play moves from Puzzle N+1 on the board for Puzzle N.
- **Fix**: Synchronized all state updates (`SuccessCount`, `Fen`, `MoveIndex`) to occur inside the same 1000ms timeout. Added an `isTransitioning` state guard to disable board input during the transition delay.
- **Files Changed**: `src/components/LessonPlayer.tsx`
- **Why It Works**: The input guard prevents malformed interactions, and the synchronized updates ensure the UI and game state always advance together.

**Prevention**:

- **Rule or Pattern**: Always synchronize state updates that are logically linked (like FEN and move progress) to avoid race conditions.
- **Future Safeguard**: Use transition states or loading overlays to prevent user interaction during non-interactive animation phases.
