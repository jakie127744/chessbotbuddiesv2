import Link from 'next/link';
import { Mascot } from './Mascot';

export function Navbar() {
  return (
    <nav className="w-full border-b border-slate-800 bg-[#0f1729]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Mascot size={32} />
          <span className="font-bold text-xl text-white tracking-tight">ChessBotBuddies</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:block">
             About
          </Link>
          <Link href="/news" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:block">
             News
          </Link>
           <a href="mailto:admin@chessbotbuddies.org" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:block">
             Contact
          </a>
           <Link href="/play?view=game" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:block">
             Play Friend
          </Link>
          <Link href="/play" className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-sky-500/20">
            Play Computer
          </Link>
        </div>
      </div>
    </nav>
  );
}
