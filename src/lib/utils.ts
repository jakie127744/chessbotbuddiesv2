import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
    if (seconds <= 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);

    if (seconds < 10) {
        return `${mins}:${secs.toString().padStart(2, '0')}.${tenths}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getChebyshevDistance(square1: string, square2: string): number {
    if (!square1 || !square2) return 0;
    const file1 = square1.charCodeAt(0) - 97; // 'a' -> 0
    const rank1 = parseInt(square1[1]) - 1;   // '1' -> 0
    const file2 = square2.charCodeAt(0) - 97;
    const rank2 = parseInt(square2[1]) - 1;
    
    return Math.max(Math.abs(file1 - file2), Math.abs(rank1 - rank2));
}
