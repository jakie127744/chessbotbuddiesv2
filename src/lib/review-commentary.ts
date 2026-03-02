import { Chess } from 'chess.js';
import type { TacticTag, TacticType } from './tactics';

export interface EngineInfo {
    depth: number;
    score: number;
    pv: string[];
}

export interface CommentData {
  header: string;
  body: string;
  eval?: string;
  classification: string;
}

// Commentary Bank
const commentBanks: Record<string, string[]> = {
  brilliant: [
    "Brilliant! You found a legendary sacrifice.",
    "BOOM! A world-class concept.",
    "Genius! You saw what everyone else missed.",
    "Stunning! That belongs in a museum.",
    "Incredible! You played the move of the game."
  ],
  great: [
    "Great find! The only move that works.",
    "Sharp! You found the critical path.",
    "Excellent! Precision when it mattered.",
    "Clutch play! You kept your cool.",
    "Fantastic! You have real power here."
  ],
  best: [
    "The best move. Keep it up!",
    "Perfect! Exactly what's needed.",
    "Solid choice. You're in control.",
    "Engine approved. Clean play.",
    "Professional. Making it look easy."
  ],
  excellent: [
    "Very strong. Maintaining the lead.",
    "Clean play. You're solid here.",
    "Good move. No complaints."
  ],
  good: [
    "Solid. Developing nicely.",
    "A good move. Sticking to the plan."
  ],
  inaccuracy: [
    "A bit soft. You missed a sharper line.",
    "Focus! You let them off the hook slightly.",
    "Inaccurate. Tighten up your play."
  ],
  mistake: [
    "A mistake. You're giving up initiative.",
    "Focus! You missed a tactical shift.",
    "Ouch. You stumbled there."
  ],
  blunder: [
    "A blunder! You hung material!",
    "Disaster! What was that?!",
    "Oh no! That's a game-changing error."
  ],
  missed_win: [
    "Missed win! It was right there.",
    "You let them escape! Forced win missed.",
    "Knockout blow missed! Finish your food."
  ],
  book: [
    "Standard theory. Good knowledge.",
    "By the book. Smooth sailing.",
    "Theory approved. You know your stuff."
  ],
};

// Seeded Random Number Generator
function mulberry32(a: number) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

// Fisher-Yates Shuffle with Seed
function seededShuffle<T>(array: T[], seed: number): T[] {
    const rng = mulberry32(seed);
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function uciToSan(fen: string, uciMove: string): string {
    if (!uciMove) return "";
    try {
        const board = new Chess(fen);
        const moveObj = board.move({
            from: uciMove.substring(0, 2),
            to: uciMove.substring(2, 4),
            promotion: uciMove.length === 5 ? uciMove[4] : undefined
        });
        return moveObj ? moveObj.san : uciMove;
    } catch {
        return uciMove;
    }
}

export function formatFigurine(san: string): string {
  if (!san) return '';
  // Basic piece mapping for UI
  const pieceMap: Record<string, string> = {
    'N': '♞', 'B': '♝', 'R': '♜', 'Q': '♛', 'K': '♚',
  };
  let result = san;
  for (const [letter, icon] of Object.entries(pieceMap)) {
    if (result.startsWith(letter)) {
      result = result.replace(letter, icon);
      break;
    }
  }
  return result;
}

export function getMoveCommentData(
  c: string, 
  _evalBefore?: number,
  evalAfter?: number, 
  _opening?: string, 
  _isNovelty?: boolean,
  san?: string,
  ply: number = 0,
  bestLines: EngineInfo[] = [],
  currentFen: string = "",
  _nextBestLines: EngineInfo[] = [],
  _piece?: string,
  _captured?: string,
  tactics?: TacticTag[],
  _lastOpening?: string,
  famousPlayers?: string[], 
  gameId: string = "default" 
): CommentData {

  const formatEval = (val?: number) => {
    if (val === undefined) return undefined;
    if (Math.abs(val) > 2000) {
      const mate = Math.ceil((10000 - Math.abs(val)) / 10);
      return (val > 0 ? '+' : '-') + 'M' + mate;
    }
    return (val > 0 ? '+' : '') + (val / 100).toFixed(1);
  };

  const evalStr = formatEval(evalAfter);
  const moveStr = san ? formatFigurine(san) : '';
  let classLabel = c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' ');
  if (c === 'missed_win') classLabel = "Missed Win";
  
  const header = san ? `${moveStr} is a ${c === 'book' ? 'book' : classLabel.toLowerCase()} move` : `${classLabel} move`;

  if (san?.includes('#')) {
    return { header, body: "Checkmate! The game is over.", eval: evalStr, classification: c };
  }

  let tacticComment = "";
  if (tactics && tactics.length > 0) {
    const significantTactics = tactics.filter(t => ['pigs_on_7th', 'defender', 'fork_threat'].includes(t.type) || t.severity === 'winning');
    if (significantTactics.length > 0) {
      tacticComment = Array.from(new Set(significantTactics.map(t => t.description))).join(" ");
    }
  }

  const gameSeed = gameId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rng = mulberry32(gameSeed + ply);

  if (c === 'book') {
    let fact = "";
    if (famousPlayers && famousPlayers.length > 0 && rng() < 0.3) {
      fact = `Played by ${famousPlayers[0]}.`;
    }
    return { header, body: fact || "Following theory.", eval: evalStr, classification: c };
  }

  let standardizedClass = c.toLowerCase().replace(" ", "_");
  if (standardizedClass === "missed win") standardizedClass = "missed_win";

  const rawBank = commentBanks[standardizedClass] || ["Nice move."];
  const shuffledBank = seededShuffle(rawBank, gameSeed);
  const basicComment = shuffledBank[ply % shuffledBank.length];

  let body = basicComment;
  if (tacticComment) body = `${tacticComment} ${body}`;

  if (['mistake', 'blunder', 'inaccuracy', 'missed_win'].includes(standardizedClass) && bestLines.length > 0 && currentFen) {
    const topMove = bestLines[0];
    const moveSan = uciToSan(currentFen, topMove.pv[0]);
    body += ` Best was ${formatFigurine(moveSan)}.`;
  }

  return { 
    header, 
    body: body.trim(), 
    eval: evalStr,
    classification: c
  };
}
