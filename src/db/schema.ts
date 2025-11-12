import { pgTable, text, timestamp, uuid, varchar, index, pgEnum, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const languageEnum = pgEnum('language', ['en', 'vi']);

// Users table
export const users = pgTable('dict_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
}));

// Words table - stores suggestion words for both languages
export const words = pgTable('dict_words', {
  id: uuid('id').defaultRandom().primaryKey(),
  word: varchar('word', { length: 255 }).notNull(),
  language: languageEnum('language').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  wordIdx: index('word_idx').on(table.word),
  languageIdx: index('language_idx').on(table.language),
  wordLanguageIdx: index('word_language_idx').on(table.word, table.language),
  // Unique constraint to prevent duplicate words in the same language
  wordLanguageUnique: unique('words_word_language_unique').on(table.word, table.language),
}));

// Translation cache table - stores all translation results
export const translationCache = pgTable('dict_translation_cache', {
  id: uuid('id').defaultRandom().primaryKey(),
  sourceText: text('source_text').notNull(),
  sourceLanguage: languageEnum('source_language').notNull(),
  targetLanguage: languageEnum('target_language').notNull(),
  translation: text('translation').notNull(),
  isWord: varchar('is_word', { length: 10 }).notNull().default('false'), // 'true' or 'false'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  sourceTextIdx: index('source_text_idx').on(table.sourceText),
  cacheKeyIdx: index('cache_key_idx').on(table.sourceText, table.sourceLanguage, table.targetLanguage),
}));

// Bookmarks table - stores user bookmarks for individual words only
export const bookmarks = pgTable('dict_bookmarks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  word: varchar('word', { length: 255 }).notNull(),
  language: languageEnum('language').notNull(),
  translation: text('translation').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  wordIdx: index('bookmark_word_idx').on(table.word),
  userWordIdx: index('user_word_idx').on(table.userId, table.word),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookmarks: many(bookmarks),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Word = typeof words.$inferSelect;
export type NewWord = typeof words.$inferInsert;
export type TranslationCache = typeof translationCache.$inferSelect;
export type NewTranslationCache = typeof translationCache.$inferInsert;
export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;

