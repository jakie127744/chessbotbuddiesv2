# Chess App Redesign - Deployment Setup Guide

## 📁 Folder Structure

```
Chess-App-Deployment/
├── src/
│   ├── app/                          # Next.js routes
│   │   ├── (dashboard)/              # Dashboard routes
│   │   ├── home/                     # Home page
│   │   ├── training-dashboard/       # Training hub dashboard
│   │   ├── training/                 # Training module
│   │   ├── opening-trainer-demo/     # Opening Trainer demo
│   │   └── layout.tsx               # Root layout
│   ├── components/                   # React components
│   │   ├── ChessBoard.tsx           # Interactive chess board
│   │   ├── OpeningTrainerShellV2.tsx # Opening Trainer state machine
│   │   ├── TrainingDashboard.tsx    # Training hub UI
│   │   └── ... (other components)
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAIPlayer.ts
│   │   ├── useStockfish.ts
│   │   └── ... (other hooks)
│   ├── lib/                          # Utility functions
│   │   ├── recall-mode-logic.ts     # Spaced repetition (SM-2)
│   │   ├── deviation-engine.ts      # Sideline tracking
│   │   ├── concept-diagnostics.ts   # Chess concept analysis
│   │   └── ... (other utilities)
│   ├── contexts/                     # React contexts
│   │   ├── ThemeContext.tsx
│   │   ├── BoardColorSchemeContext.tsx
│   │   └── ... (other contexts)
│   ├── types/                        # TypeScript type definitions
│   └── content/                      # CMS/Static content
├── public/                           # Static assets
├── package.json                      # Dependencies
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS config
├── tsconfig.json                     # TypeScript config
└── postcss.config.mjs               # PostCSS config
```

## 🚀 Quick Start

### Prerequisites
- **Node.js**: >= 20.0.0
- **npm**: Latest version

### Installation Steps

1. **Navigate to the deployment folder**
   ```bash
   cd Chess-App-Deployment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📦 Available Routes

| Route | Description |
|-------|-------------|
| `/home` | Home dashboard |
| `/training-dashboard` | Puzzle training hub |
| `/training` | Training module |
| `/opening-trainer-demo` | Coach Jakie Opening Trainer |
| `/play` | Play chess against bots |
| `/learn` | Learning materials |
| `/(dashboard)/*` | Dashboard routes (analysis, profile, settings, etc.) |

## 🛠️ Build & Deployment

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

### Run Tests
```bash
npm test
npm run test:coverage
npm run test:watch
```

## 🎯 Key Features

### Coach Jakie Opening Trainer
- **SM-2 Spaced Repetition**: Mastery levels (Beginner → Developing → Proficient → Mastered)
- **Recall Mode**: Blind recall training with difficulty selection
- **Concept Tracking**: 10 chess concepts with performance analysis
- **Deviation Engine**: Tracks and analyzes opponent sidelines
- **Interactive Feedback**: Real-time move validation and coaching

### Interactive Chess Board
- Drag-and-drop piece movement
- Legal move highlighting
- Pawn promotion modal
- Arrow overlays for tactics
- Multiple piece styles and board colors
- Full keyboard navigation support

### Analytics & Progress
- User progress dashboard with mastery statistics
- Chess concept heatmap visualization
- Recall training history
- Sideline exposure analysis
- Daily streak and accuracy tracking

### Data Persistence
- localStorage for session data
- Supabase integration stubs for cloud sync
- Game export/import functionality

## 📋 Environment Variables

The `.env.local` file should contain:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## 🐛 Troubleshooting

### Port 3000 already in use?
The dev server will automatically switch to port 3001.

### Missing dependencies?
```bash
rm -rf node_modules package-lock.json
npm install
```

### Next.js build cache issues?
```bash
rm -rf .next
npm run dev
```

## 📝 Notes

- This is a **clean deployment package** with only necessary files
- All legacy code has been archived
- The app is ready for production deployment
- No build artifacts or cache files are included

## 🔗 Related Files
- `DEPLOYMENT_README.md` - Quick overview
- `package.json` - Full dependency list
- `next.config.ts` - Next.js configuration details

---

**Version**: 1.0.0  
**Last Updated**: February 26, 2026
