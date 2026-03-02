"use client";

import React from "react";

/**
 * Lightweight chessboard thumbnail that renders a FEN position.
 * Uses local SVG pieces from /pieces/standard/.
 */

const PIECE_MAP: Record<string, string> = {
  P: "/pieces/standard/wp.svg",
  R: "/pieces/standard/wr.svg",
  N: "/pieces/standard/wn.svg",
  B: "/pieces/standard/wb.svg",
  Q: "/pieces/standard/wq.svg",
  K: "/pieces/standard/wk.svg",
  p: "/pieces/standard/bp.svg",
  r: "/pieces/standard/br.svg",
  n: "/pieces/standard/bn.svg",
  b: "/pieces/standard/bb.svg",
  q: "/pieces/standard/bq.svg",
  k: "/pieces/standard/bk.svg",
};

const LIGHT_SQUARE = "#e8dcc8";
const DARK_SQUARE = "#b58863";

interface MiniBoardProps {
  fen: string;
  /** Flip the board so black is at the bottom */
  flipped?: boolean;
  className?: string;
}

function parseFenRows(fen: string): string[][] {
  const placement = fen.split(" ")[0];
  return placement.split("/").map((row) => {
    const squares: string[] = [];
    for (const ch of row) {
      if (/\d/.test(ch)) {
        for (let i = 0; i < parseInt(ch, 10); i++) squares.push("");
      } else {
        squares.push(ch);
      }
    }
    return squares;
  });
}

export default function MiniBoard({ fen, flipped = false, className = "" }: MiniBoardProps) {
  let rows = parseFenRows(fen);
  if (flipped) rows = [...rows].reverse().map((r) => [...r].reverse());

  return (
    <div className={`aspect-square w-full ${className}`}>
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
      {rows.map((row, ri) =>
        row.map((piece, ci) => {
          const isLight = (ri + ci) % 2 === 0;
          return (
            <div
              key={`${ri}-${ci}`}
              style={{ backgroundColor: isLight ? LIGHT_SQUARE : DARK_SQUARE }}
              className="relative"
            >
              {piece && PIECE_MAP[piece] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={PIECE_MAP[piece]}
                  alt={piece}
                  draggable={false}
                  className="absolute inset-0 w-full h-full pointer-events-none select-none"
                />
              )}
            </div>
          );
        })
      )}
      </div>
    </div>
  );
}
