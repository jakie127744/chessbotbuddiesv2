'use client';

import React from 'react';

const highlights = [
  {
    title: 'Kid-first experience',
    body: 'Friendly bots, gentle UX, and zero chat toxicity so young learners feel safe to explore the game.',
  },
  {
    title: 'Learn by doing',
    body: 'Openings, tactics, and endgames are taught through interactive drills that adapt to your pace.',
  },
  {
    title: 'Free and approachable',
    body: 'Play instantly as a guest or create a profile to track streaks, XP, and milestones over time.',
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-8 text-white">
      <div className="bg-gradient-to-br from-jungle-green-500/10 to-jungle-green-800/15 border border-jungle-green-500/20 rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-black mb-3 text-white">About ChessBotBuddies</h1>
        <p className="text-zinc-300 leading-relaxed max-w-3xl">
          ChessBotBuddies is a safe, friendly place for kids and beginners to learn, play, and fall in love with chess.
          Our adaptive bots, guided training, and playful visuals make it simple to start and rewarding to keep going.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {highlights.map((item) => (
          <div key={item.title} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
            <h2 className="text-xl font-bold mb-2 text-white">{item.title}</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
        <h3 className="text-2xl font-bold text-white">What we offer</h3>
        <ul className="list-disc list-inside text-zinc-300 space-y-2">
          <li>Adaptive bots that scale from gentle guidance to strong sparring partners.</li>
          <li>Opening, puzzle, and endgame trainers with progress tracking and streaks.</li>
          <li>Guest play with no registration required, plus profiles for saved progress.</li>
        </ul>
      </div>
    </div>
  );
}
