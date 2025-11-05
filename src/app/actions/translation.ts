'use server';

import { db } from '@/db';
import { translationCache, words, bookmarks } from '@/db/schema';
import { eq, and, ilike, sql } from 'drizzle-orm';
import { translateWithAI, isLikelyWord, type Language } from '@/lib/ai';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getWordSuggestions(query: string, language: Language) {
  if (!query || query.length < 1) {
    return [];
  }

  // First try exact prefix match
  const prefixMatches = await db.query.words.findMany({
    where: and(
      eq(words.language, language),
      ilike(words.word, `${query}%`)
    ),
    limit: 10,
    orderBy: (words, { asc }) => [asc(words.word)],
  });

  // If we have enough results, return them
  if (prefixMatches.length >= 5) {
    return prefixMatches.map(w => w.word);
  }

  // Otherwise, also search for words containing the query
  const containsMatches = await db.query.words.findMany({
    where: and(
      eq(words.language, language),
      ilike(words.word, `%${query}%`)
    ),
    limit: 10,
    orderBy: (words, { asc }) => [asc(words.word)],
  });

  // Combine and deduplicate
  const allMatches = [...prefixMatches, ...containsMatches];
  const unique = Array.from(new Set(allMatches.map(w => w.word)));
  return unique.slice(0, 10);
}

export async function translate(
  text: string,
  sourceLanguage: Language,
  targetLanguage: Language,
  forceRegenerate: boolean = false
) {
  try {
    const trimmedText = text.trim();
    if (!trimmedText) {
      return { error: 'Please enter text to translate' };
    }

    const isWord = isLikelyWord(trimmedText);

    // Check cache first (unless forcing regeneration)
    if (!forceRegenerate) {
      const cached = await db.query.translationCache.findFirst({
        where: and(
          eq(translationCache.sourceText, trimmedText),
          eq(translationCache.sourceLanguage, sourceLanguage),
          eq(translationCache.targetLanguage, targetLanguage)
        ),
      });

      if (cached) {
        return {
          translation: cached.translation,
          isWord,
          fromCache: true,
        };
      }
    }

    // Translate using AI
    const translation = await translateWithAI({
      text: trimmedText,
      sourceLanguage,
      targetLanguage,
      isWord,
    });

    // Save to cache (update if regenerating, insert if new)
    if (forceRegenerate) {
      await db
        .update(translationCache)
        .set({
          translation,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(translationCache.sourceText, trimmedText),
            eq(translationCache.sourceLanguage, sourceLanguage),
            eq(translationCache.targetLanguage, targetLanguage)
          )
        );
    } else {
      await db.insert(translationCache).values({
        sourceText: trimmedText,
        sourceLanguage,
        targetLanguage,
        translation,
        isWord: isWord ? 'true' : 'false',
      });
    }

    return {
      translation,
      isWord,
      fromCache: false,
    };
  } catch (error) {
    console.error('Translation error:', error);
    return { error: 'Failed to translate. Please try again.' };
  }
}

export async function addBookmark(word: string, language: Language, translation: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'You must be logged in to bookmark words' };
    }

    // Check if already bookmarked
    const existing = await db.query.bookmarks.findFirst({
      where: and(
        eq(bookmarks.userId, session.user.id),
        eq(bookmarks.word, word),
        eq(bookmarks.language, language)
      ),
    });

    if (existing) {
      return { error: 'Word already bookmarked' };
    }

    await db.insert(bookmarks).values({
      userId: session.user.id,
      word,
      language,
      translation,
    });

    revalidatePath('/bookmarks');
    return { success: true };
  } catch (error) {
    console.error('Bookmark error:', error);
    return { error: 'Failed to bookmark word' };
  }
}

export async function removeBookmark(bookmarkId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'You must be logged in' };
    }

    await db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.id, bookmarkId),
          eq(bookmarks.userId, session.user.id)
        )
      );

    revalidatePath('/bookmarks');
    return { success: true };
  } catch (error) {
    console.error('Remove bookmark error:', error);
    return { error: 'Failed to remove bookmark' };
  }
}

export async function searchBookmarks(query: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return [];
    }

    if (!query) {
      return await db.query.bookmarks.findMany({
        where: eq(bookmarks.userId, session.user.id),
        orderBy: (bookmarks, { desc }) => [desc(bookmarks.createdAt)],
      });
    }

    return await db.query.bookmarks.findMany({
      where: and(
        eq(bookmarks.userId, session.user.id),
        ilike(bookmarks.word, `%${query}%`)
      ),
      orderBy: (bookmarks, { desc }) => [desc(bookmarks.createdAt)],
    });
  } catch (error) {
    console.error('Search bookmarks error:', error);
    return [];
  }
}

