import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProgress, dailyWordSets } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { serverAuth } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const session = await serverAuth(); // Add parentheses back
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 });
    }

    // First get the daily word set for the date
    const dailySet = await db
      .select()
      .from(dailyWordSets)
      .where(
        and(
          eq(dailyWordSets.userId, session.user.id),
          eq(dailyWordSets.date, date)
        )
      )
      .limit(1);

    if (!dailySet[0]) {
      return NextResponse.json({ progress: null });
    }

    // Get user progress for this daily set
    const progress = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, session.user.id),
          eq(userProgress.dailySetId, dailySet[0].id)
        )
      )
      .limit(1);

    return NextResponse.json({ 
      progress: progress[0] || null 
    });

  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user progress' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await serverAuth(); // Add parentheses back
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, correctAnswers, incorrectAnswers, score } = body;

    if (!date || !correctAnswers || !incorrectAnswers || score === undefined) {
      return NextResponse.json(
        { error: 'Date, correctAnswers, incorrectAnswers, and score are required' },
        { status: 400 }
      );
    }

    // Get the daily word set for the date
    const dailySet = await db
      .select()
      .from(dailyWordSets)
      .where(
        and(
          eq(dailyWordSets.userId, session.user.id),
          eq(dailyWordSets.date, date)
        )
      )
      .limit(1);

    if (!dailySet[0]) {
      return NextResponse.json(
        { error: 'Daily word set not found' },
        { status: 404 }
      );
    }

    // Check if user already has progress for this daily set
    const existingProgress = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, session.user.id),
          eq(userProgress.dailySetId, dailySet[0].id)
        )
      )
      .limit(1);

    let result;
    if (existingProgress[0]) {
      // Update existing progress
      result = await db
        .update(userProgress)
        .set({
          correctAnswers,
          incorrectAnswers,
          score: score.toString(),
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userProgress.id, existingProgress[0].id))
        .returning();
    } else {
      // Create new progress
      result = await db
        .insert(userProgress)
        .values({
          userId: session.user.id,
          dailySetId: dailySet[0].id,
          correctAnswers,
          incorrectAnswers,
          score: score.toString(),
          completedAt: new Date(),
        })
        .returning();
    }

    return NextResponse.json({
      progress: result[0],
      message: 'Progress saved successfully'
    });

  } catch (error) {
    console.error('Error saving user progress:', error);
    return NextResponse.json(
      { error: 'Failed to save user progress' },
      { status: 500 }
    );
  }
}
