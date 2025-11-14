import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dailyWordSets } from '@/db/schema';
import { eq, and, not } from 'drizzle-orm';
import { serverAuth } from '@/lib/auth-server';

type WordEntry = {
  word: string;
  phonetic?: string;
  part_of_speech?: string;
  definitions?: Array<{
    vi_meaning?: string;
    en_definition?: string;
    examples?: Array<{ en?: string; vi?: string }>;
  }>;
};

function parseWordData(value: string): WordEntry[] {
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'string') {
      const parsedAgain = JSON.parse(parsed);
      if (Array.isArray(parsedAgain)) return parsedAgain as WordEntry[];
      return [];
    }
    if (Array.isArray(parsed)) {
      return parsed as WordEntry[];
    }
    return [];
  } catch {
    return [];
  }
}

function randomSample<T>(items: T[], limit: number) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, limit);
}

export async function GET(request: NextRequest) {
  try {
    const session = await serverAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const excludeDate = searchParams.get('excludeDate');

    if (!date) {
      const conditions = [eq(dailyWordSets.userId, session.user.id)];
      if (excludeDate) {
        conditions.push(not(eq(dailyWordSets.date, excludeDate)));
      }
      const history = await db
        .select()
        .from(dailyWordSets)
        .where(and(...conditions));

      const parsedWords = history.flatMap(set => parseWordData(set.wordData));
      return NextResponse.json({
        historyWords: randomSample(parsedWords, 100),
      });
    }

    const existingSet = await db
      .select()
      .from(dailyWordSets)
      .where(
        and(
          eq(dailyWordSets.userId, session.user.id),
          eq(dailyWordSets.date, date)
        )
      )
      .limit(1);

    return NextResponse.json({
      set: existingSet[0] || null
    });

  } catch (error) {
    console.error('API: Error fetching daily word set:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily word set', debug: { error: error instanceof Error ? error.message : String(error) } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await serverAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, wordData } = body;

    if (!date || !wordData) {
      return NextResponse.json(
        { error: 'Date and wordData are required' },
        { status: 400 }
      );
    }

    const existingSet = await db
      .select()
      .from(dailyWordSets)
      .where(
        and(
          eq(dailyWordSets.userId, session.user.id),
          eq(dailyWordSets.date, date)
        )
      )
      .limit(1);

    let result;
    if (existingSet[0]) {
      result = await db
        .update(dailyWordSets)
        .set({
          wordData: JSON.stringify(wordData),
          updatedAt: new Date(),
        })
        .where(eq(dailyWordSets.id, existingSet[0].id))
        .returning();
    } else {
      result = await db
        .insert(dailyWordSets)
        .values({
          userId: session.user.id,
          date,
          wordData: JSON.stringify(wordData),
        })
        .returning();
    }

    return NextResponse.json({
      set: result[0],
      message: 'Word set saved successfully'
    });

  } catch (error) {
    console.error('API: Error saving daily word set:', error);
    return NextResponse.json(
      { error: 'Failed to save daily word set', debug: { error: error instanceof Error ? error.message : String(error) } },
      { status: 500 }
    );
  }
}
