import { NextResponse } from 'next/server';
import { db } from '@/db';
import { selectedWords } from '@/db/schema';
import { serverAuth } from '@/lib/auth-server';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Get some selected words from database (for testing)
    const previouslySelected = await db
      .select()
      .from(selectedWords)
      .limit(20); // Return some sample data for testing

    // Return just the word names as an array
    const words = previouslySelected.map(item => item.word);

    return NextResponse.json({ words });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch selected words' },
      { status: 500 }
    );
  }
}
