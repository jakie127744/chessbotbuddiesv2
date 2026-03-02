import { NextResponse } from 'next/server';
import { generateSafeBishopBoard } from '@/lib/minigame-rules';

export async function GET() {
  const result = generateSafeBishopBoard();
  return NextResponse.json({ result });
}
