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
  dailyWordSets: many(dailyWordSets),
  userProgress: many(userProgress),
  selectedWords: many(selectedWords),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
}));

// Flashcard System Tables

// Daily word sets - stores 20 words selected for each date
export const dailyWordSets = pgTable('dict_daily_word_sets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD format
  wordData: text('word_data').notNull(), // JSON string of 20 words from words.jsonl
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdDateIdx: index('user_id_date_idx').on(table.userId, table.date),
  userIdIdx: index('daily_user_id_idx').on(table.userId),
}));

// User progress - tracks learning progress for each daily set
export const userProgress = pgTable('dict_user_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  dailySetId: uuid('daily_set_id').notNull().references(() => dailyWordSets.id, { onDelete: 'cascade' }),
  correctAnswers: varchar('correct_answers', { length: 1000 }).notNull().default('[]'), // JSON array of correct word indices
  incorrectAnswers: varchar('incorrect_answers', { length: 1000 }).notNull().default('[]'), // JSON array of incorrect word indices
  score: varchar('score', { length: 5 }).notNull().default('0'), // percentage score
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('progress_user_id_idx').on(table.userId),
  dailySetIdIdx: index('progress_daily_set_id_idx').on(table.dailySetId),
  userDailyIdx: index('user_daily_idx').on(table.userId, table.dailySetId),
}));

// Selected words history - prevents repetition of previously selected words
export const selectedWords = pgTable('dict_selected_words', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  word: varchar('word', { length: 255 }).notNull(),
  selectedDate: varchar('selected_date', { length: 10 }).notNull(), // YYYY-MM-DD
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('selected_user_id_idx').on(table.userId),
  userWordIdx: index('selected_user_word_idx').on(table.userId, table.word),
}));

// Flashcard Relations
export const dailyWordSetsRelations = relations(dailyWordSets, ({ one, many }) => ({
  user: one(users, {
    fields: [dailyWordSets.userId],
    references: [users.id],
  }),
  userProgress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  dailySet: one(dailyWordSets, {
    fields: [userProgress.dailySetId],
    references: [dailyWordSets.id],
  }),
}));

export const selectedWordsRelations = relations(selectedWords, ({ one }) => ({
  user: one(users, {
    fields: [selectedWords.userId],
    references: [users.id],
  }),
}));

// Flashcard Types
export type DailyWordSet = typeof dailyWordSets.$inferSelect;
export type NewDailyWordSet = typeof dailyWordSets.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;
export type SelectedWord = typeof selectedWords.$inferSelect;
export type NewSelectedWord = typeof selectedWords.$inferInsert;

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Word = typeof words.$inferSelect;
export type NewWord = typeof words.$inferInsert;
export type TranslationCache = typeof translationCache.$inferSelect;
export type NewTranslationCache = typeof translationCache.$inferInsert;
export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;

