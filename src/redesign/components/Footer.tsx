import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <div className="mt-12 pt-8 border-t border-[var(--border)] text-[var(--text-secondary)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-3">About ChessBotBuddies</h3>
            <p className="text-sm leading-relaxed mb-4 text-[var(--text-secondary)]">
              ChessBotBuddies is the best FREE place for kids and beginners to learn and play chess online. 
              Our safe, ad-supported platform features friendly AI bots like &quot;Beginner Ley-an&quot; and &quot;SuperGM Marco&quot; that adapt to your skill level.
            </p>
            <p className="text-sm leading-relaxed">
              Improve your game with our interactive <strong>Chess Academy</strong>, solve daily <strong>Tactical Puzzles</strong>, and practice <strong>Endgames</strong> to become a chess master!
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Why Play Here?</h3>
            <ul className="text-sm space-y-2 list-disc list-inside text-[var(--text-secondary)]">
              <li><strong>Free Chess Games</strong>: Play unlimited games against the computer or friends.</li>
              <li><strong>No Registration Required</strong>: Start playing immediately as a guest.</li>
              <li><strong>Learn Chess Strategies</strong>: Tutorials on openings, middlegames, and checkmates.</li>
              <li><strong>Safe Environment</strong>: Kid-friendly interface without chat toxicity.</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-xs flex flex-col md:flex-row items-center justify-center gap-4 text-[var(--text-secondary)]">
          <span className="opacity-80">&copy; {new Date().getFullYear()} ChessBotBuddies.org</span>
          <span className="hidden md:inline">•</span>
          <Link href="/play" className="opacity-80 hover:text-white transition-colors">Play</Link>
          <span className="hidden md:inline">•</span>
          <Link href="/about" className="opacity-80 hover:text-white transition-colors">About Us</Link>
          <span className="hidden md:inline">•</span>
          <Link href="/privacy" className="opacity-80 hover:text-white transition-colors">Privacy Policy</Link>
          <span className="hidden md:inline">•</span>
          <Link href="/terms" className="opacity-80 hover:text-white transition-colors">Terms of Service</Link>
          <span className="hidden md:inline">•</span>
          <a href="mailto:admin@chessbotbuddies.org" className="opacity-80 hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </div>
  );
}
