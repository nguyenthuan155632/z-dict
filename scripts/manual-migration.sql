-- Manual migration SQL for reference
-- This file shows the database schema that will be created by Drizzle
-- You can use this for manual setup if needed

-- Create enum for language
CREATE TYPE language AS ENUM ('en', 'vi');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS email_idx ON users(email);

-- Words table
CREATE TABLE IF NOT EXISTS words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word VARCHAR(255) NOT NULL,
  language language NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS word_idx ON words(word);
CREATE INDEX IF NOT EXISTS language_idx ON words(language);
CREATE INDEX IF NOT EXISTS word_language_idx ON words(word, language);

-- Translation cache table
CREATE TABLE IF NOT EXISTS translation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_text TEXT NOT NULL,
  source_language language NOT NULL,
  target_language language NOT NULL,
  translation TEXT NOT NULL,
  is_word VARCHAR(10) NOT NULL DEFAULT 'false',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS source_text_idx ON translation_cache(source_text);
CREATE INDEX IF NOT EXISTS cache_key_idx ON translation_cache(source_text, source_language, target_language);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word VARCHAR(255) NOT NULL,
  language language NOT NULL,
  translation TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS user_id_idx ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS bookmark_word_idx ON bookmarks(word);
CREATE INDEX IF NOT EXISTS user_word_idx ON bookmarks(user_id, word);

