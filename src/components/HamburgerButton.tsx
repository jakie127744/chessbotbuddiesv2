'use client';

import { Menu, X } from 'lucide-react';

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-[60] md:hidden flex items-center justify-center w-12 h-12 bg-neutral-900 border-2 border-neutral-700 rounded-lg shadow-lg hover:bg-neutral-800 transition-colors"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? (
        <X size={24} className="text-white" />
      ) : (
        <Menu size={24} className="text-white" />
      )}
    </button>
  );
}
