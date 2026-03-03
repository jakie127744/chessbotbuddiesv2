# Chess App Deployment: Complete User Guide

Welcome to the Chess App! This guide will walk you through every major feature and component, helping you get the most out of your chess learning and playing experience.

---

## Table of Contents
1. Getting Started
2. Main Dashboard
3. Profile & Achievements
4. Training Modules
5. Opening Trainer
6. Endgame Trainer
7. Puzzle Sprint & Trainer
8. Game Play & Analysis
9. Leaderboard & Global Rank
10. Rewards & Badges
11. Sidebar Navigation
12. Facebook Sharing
13. Settings & Customization
14. FAQ & Troubleshooting

---

## 1. Getting Started
- **Access the App:** Open the app in your browser or device.
- **Sign Up/Login:** Create an account or log in to save your progress, stats, and claim rewards.

---

## 2. Main Dashboard
- **Overview:** Displays your stats, recent games, and quick links to training modules.
- **Navigation:** Use the sidebar to access all features.

---

## 3. Profile & Achievements
- **Profile View:** Shows your avatar, username, global rank, and real stats (games played, openings learned, endgames solved, puzzles completed).
- **Achievements:** Earn badges for milestones. Click badges to view details or claim new ones.
- **Edit Profile:** Update your avatar and personal info.

---

## 4. Training Modules
- **Access:** Go to the Training section from the sidebar.
- **Features:** Choose from lessons, drills, and practice sessions.
- **Progress Tracking:** Your completion stats are updated in real time.

---

## 5. Opening Trainer
- **Purpose:** Learn chess openings interactively.
- **Session:** Select an opening, play through lines, and get feedback.
- **Completion Modal:** On finishing a session, share your achievement to Facebook.

---

## 6. Endgame Trainer
- **Purpose:** Practice key endgame positions.
- **Features:** Step-by-step guidance and instant feedback.
- **Stats:** Track endgames solved in your profile.

---

## 7. Puzzle Sprint & Trainer
- **Puzzle Sprint:** Race against the clock to solve as many puzzles as possible.
- **Puzzle Trainer:** Practice puzzles at your own pace.
- **Progress:** Stats update in your profile and leaderboard.

---

## 8. Game Play & Analysis
- **Play Games:** Challenge bots or other users.
- **Evaluation Bar:** See real-time position evaluation (stable version).
- **Game History:** Review moves, mistakes, and blunders.
- **Analysis:** Use the Position Analysis tool for deeper insights.

---

## 9. Leaderboard & Global Rank
- **Leaderboard:** View top players based on real stats (games, openings, endgames, puzzles).
- **Global Rank:** Your rank is shown in your profile and leaderboard.
- **Metrics:** No rating-centric cards; focus is on real achievements.

---

## 10. Rewards & Badges
- **Claim Badges:** Earn and claim badges for milestones.
- **Rewards Modal:** Pops up when you unlock a new badge.
- **Daily Streaks:** Maintain activity for extra rewards.

---

## 11. Sidebar Navigation
- **Quick Access:** Sidebar links to all major sections: Dashboard, Training, Opening Trainer, Endgame Trainer, Puzzles, Leaderboard, Profile, and Facebook.
- **Facebook Link:** Opens the official Facebook page in a new tab.

---

## 12. Facebook Sharing
- **Share Achievements:** Use the “Post to Feed” button in completion modals to share your progress on Facebook.
- **Dialog:** Opens Facebook’s share dialog for easy posting.

---

## 13. Settings & Customization
- **Board Color Scheme:** Change board colors in the settings panel.
- **Piece Style Selector:** Choose your favorite chess piece design.
- **Theme:** Switch between light and dark modes.

---

## 14. FAQ & Troubleshooting
- **Common Issues:**
  - If stats don’t update, refresh the page or log out/in.
  - For missing rewards, check your profile or contact support.
  - For build/runtime errors, see the debug_log.md file.
- **Support:** Reach out via the Facebook link or support email.

---

## Component Reference

### src/components/
- **ChessBoard.tsx:** Interactive chessboard for play and analysis.
- **EvaluationBar.tsx:** Shows position evaluation during games.
- **Leaderboard.tsx:** Displays top players and your rank.
- **ProfileView.tsx:** Shows your stats, achievements, and badges.
- **Sidebar.tsx:** Navigation panel for all app sections.
- **RewardsContext.tsx:** Manages badge claiming and daily streaks.
- **OpeningTrainer/SessionCompletionModal.tsx:** Facebook sharing after training.
- **PieceStyleSelector.tsx & BoardColorSchemeSelector.tsx:** Customize board and pieces.
- **GameHistory.tsx, PositionAnalysis.tsx:** Review and analyze games.

---

## Tips
- Explore all training modules for balanced improvement.
- Claim badges as soon as you unlock them.
- Share your achievements to motivate friends.
- Customize your board and pieces for a personal touch.

---

## Updates
- For new features and bug fixes, see the debug_log.md and DEPLOYMENT_README.md files.

---

Enjoy your chess journey!
