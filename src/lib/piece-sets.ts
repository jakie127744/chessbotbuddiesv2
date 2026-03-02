// Chess piece style sets definitions
// Uses open-source SVG pieces from popular sources

export type PieceStyle = 'staunty' | 'cburnett' | 'neo' | 'alpha' | 'merida' | 'fantasy';

export interface PieceSet {
  name: string;
  description: string;
  white: Record<string, string>;
  black: Record<string, string>;
}

// Each piece set contains SVG URLs for all 6 piece types
// Using raw GitHub URLs for reliable SVG hosting

import { PIECE_IMAGES_DATA } from './piece-images';

// Staunty - Classic Wikipedia SVGs (Using inline cburnett as guaranteed fallback)
const STAUNTY_WHITE: Record<string, string> = {
  p: PIECE_IMAGES_DATA['wp'],
  r: PIECE_IMAGES_DATA['wr'],
  n: PIECE_IMAGES_DATA['wn'],
  b: PIECE_IMAGES_DATA['wb'],
  q: PIECE_IMAGES_DATA['wq'],
  k: PIECE_IMAGES_DATA['wk'],
};

const STAUNTY_BLACK: Record<string, string> = {
  p: PIECE_IMAGES_DATA['bp'],
  r: PIECE_IMAGES_DATA['br'],
  n: PIECE_IMAGES_DATA['bn'],
  b: PIECE_IMAGES_DATA['bb'],
  q: PIECE_IMAGES_DATA['bq'],
  k: PIECE_IMAGES_DATA['bk'],
};

// CBurnett - Classic Lichess pieces
const CBURNETT_WHITE: Record<string, string> = {
  p: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wP.svg',
  r: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wR.svg',
  n: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wN.svg',
  b: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wB.svg',
  q: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wQ.svg',
  k: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wK.svg',
};

const CBURNETT_BLACK: Record<string, string> = {
  p: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bP.svg',
  r: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bR.svg',
  n: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bN.svg',
  b: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bB.svg',
  q: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bQ.svg',
  k: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bK.svg',
};

// Neo - Using Wikipedia fallback (Now inline safe)
const NEO_WHITE: Record<string, string> = {
  p: PIECE_IMAGES_DATA['wp'],
  r: PIECE_IMAGES_DATA['wr'],
  n: PIECE_IMAGES_DATA['wn'],
  b: PIECE_IMAGES_DATA['wb'],
  q: PIECE_IMAGES_DATA['wq'],
  k: PIECE_IMAGES_DATA['wk'],
};

const NEO_BLACK: Record<string, string> = {
  p: PIECE_IMAGES_DATA['bp'],
  r: PIECE_IMAGES_DATA['br'],
  n: PIECE_IMAGES_DATA['bn'],
  b: PIECE_IMAGES_DATA['bb'],
  q: PIECE_IMAGES_DATA['bq'],
  k: PIECE_IMAGES_DATA['bk'],
};

// Alpha - Clean alpha style
const ALPHA_WHITE: Record<string, string> = {
  p: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/alpha/wP.svg',
  r: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/alpha/wR.svg',
  n: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/alpha/wN.svg',
  b: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/alpha/wB.svg',
  q: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/alpha/wQ.svg',
  k: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/alpha/wK.svg',
};

const ALPHA_BLACK: Record<string, string> = {
  p: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/alpha/bP.svg',
  r: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/alpha/bR.svg',
  n: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/alpha/bN.svg',
  b: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/alpha/bB.svg',
  q: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/alpha/bQ.svg',
  k: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/alpha/bK.svg',
};

// Merida - Classic Merida style
const MERIDA_WHITE: Record<string, string> = {
  p: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/merida/wP.svg',
  r: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/merida/wR.svg',
  n: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/merida/wN.svg',
  b: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/merida/wB.svg',
  q: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/merida/wQ.svg',
  k: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/merida/wK.svg',
};

const MERIDA_BLACK: Record<string, string> = {
  p: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/merida/bP.svg',
  r: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/merida/bR.svg',
  n: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/merida/bN.svg',
  b: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/merida/bB.svg',
  q: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/merida/bQ.svg',
  k: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/merida/bK.svg',
};

// Fantasy - Fun fantasy style
const FANTASY_WHITE: Record<string, string> = {
  p: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/fantasy/wP.svg',
  r: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/fantasy/wR.svg',
  n: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/fantasy/wN.svg',
  b: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/fantasy/wB.svg',
  q: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/fantasy/wQ.svg',
  k: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/fantasy/wK.svg',
};

const FANTASY_BLACK: Record<string, string> = {
  p: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/fantasy/bP.svg',
  r: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/fantasy/bR.svg',
  n: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/fantasy/bN.svg',
  b: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/fantasy/bB.svg',
  q: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/fantasy/bQ.svg',
  k: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/fantasy/bK.svg',
};

export const PIECE_SETS: Record<PieceStyle, PieceSet> = {
  staunty: {
    name: 'Staunty',
    description: 'Classic tournament style',
    white: STAUNTY_WHITE,
    black: STAUNTY_BLACK,
  },
  cburnett: {
    name: 'CBurnett',
    description: 'Lichess default style',
    white: CBURNETT_WHITE,
    black: CBURNETT_BLACK,
  },
  neo: {
    name: 'Neo',
    description: 'Modern minimalist',
    white: NEO_WHITE,
    black: NEO_BLACK,
  },
  alpha: {
    name: 'Alpha',
    description: 'Clean alpha design',
    white: ALPHA_WHITE,
    black: ALPHA_BLACK,
  },
  merida: {
    name: 'Merida',
    description: 'Classic merida font',
    white: MERIDA_WHITE,
    black: MERIDA_BLACK,
  },
  fantasy: {
    name: 'Fantasy',
    description: 'Fun fantasy theme',
    white: FANTASY_WHITE,
    black: FANTASY_BLACK,
  },
};

// Helper to get piece image URL
export function getPieceImage(pieceStyle: PieceStyle, pieceType: string, isWhite: boolean): string {
  const set = PIECE_SETS[pieceStyle];
  return isWhite ? set.white[pieceType] : set.black[pieceType];
}
