import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <div className="mt-12 pt-8 border-t border-border-color text-text-muted">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-3">About ChessBotBuddies</h3>
            <p className="text-sm leading-relaxed mb-4">
              ChessBotBuddies is the best FREE place for kids and beginners to learn and play chess online. 
              Our safe, ad-supported platform features friendly AI bots like &quot;Beginner Ley-an&quot; and &quot;SuperGM Marco&quot; that adapt to your skill level.
            </p>
            <p className="text-sm leading-relaxed">
              Improve your game with our interactive <strong>Chess Academy</strong>, solve daily <strong>Tactical Puzzles</strong>, and practice <strong>Endgames</strong> to become a chess master!
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-3">Why Play Here?</h3>
            <ul className="text-sm space-y-2 list-disc list-inside">
              <li><strong>Free Chess Games</strong>: Play unlimited games against the computer or friends.</li>
              <li><strong>No Registration Required</strong>: Start playing immediately as a guest.</li>
              <li><strong>Learn Chess Strategies</strong>: Tutorials on openings, middlegames, and checkmates.</li>
              <li><strong>Safe Environment</strong>: Kid-friendly interface without chat toxicity.</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-xs opacity-50 flex flex-col md:flex-row items-center justify-center gap-4">
          <span>&copy; {new Date().getFullYear()} ChessBotBuddies.org</span>
          <span className="hidden md:inline">•</span>
          <Link href="/play" className="hover:text-sky-400 transition-colors">Play</Link>
          <span className="hidden md:inline">•</span>
          <Link href="/about" className="hover:text-sky-400 transition-colors">About Us</Link>
          <span className="hidden md:inline">•</span>
          <Link href="/privacy" className="hover:text-sky-400 transition-colors">Privacy Policy</Link>
          <span className="hidden md:inline">•</span>
          <Link href="/terms" className="hover:text-sky-400 transition-colors">Terms of Service</Link>
          <span className="hidden md:inline">•</span>
          <a href="mailto:admin@chessbotbuddies.org" className="hover:text-sky-400 transition-colors">Contact</a>
        </div>
      </div>
    </div>
  );
}
