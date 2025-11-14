import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { selectedWords } from '@/db/schema';
import { serverAuth } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    console.log('Bulk: Saving selected words...');
    
    const session = await serverAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { words, selectedDate } = body;

    if (!words || !Array.isArray(words) || !selectedDate) {
      return NextResponse.json(
        { error: 'Words array and selectedDate are required' },
        { status: 400 }
      );
    }

    // Prepare insert values for all words (using dummy user ID for testing)
    const insertValues = words.map(word => ({
      userId: session.user.id,
      word,
      selectedDate,
    }));

    // Insert all selected words
    await db
      .insert(selectedWords)
      .values(insertValues);

    return NextResponse.json({ 
      message: `Successfully saved ${words.length} words to history`,
      savedCount: words.length
    });

  } catch (error) {
    console.error('Bulk: Error saving selected words:', error);
    return NextResponse.json(
      { error: 'Failed to save selected words', debug: { error: error instanceof Error ? error.message : String(error) } },
      { status: 500 }
    );
  }
}
