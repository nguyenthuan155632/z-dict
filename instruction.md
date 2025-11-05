# Bilingual Dictionary Web Application (English–Vietnamese & Vietnamese–English)

## **Database Schema**
Design a database schema with the following considerations:
- A table for storing suggestion words (decide between: one table with columns `word` and `language` (values: `'en'` or `'vi'`), **or** two separate tables for English and Vietnamese words)
- A table for user bookmarks (only for individual words, not sentences or phrases)
- A table for caching translation history to store all previously translated words/phrases/sentences with their AI-generated responses to avoid redundant API calls

## Tech Stack
- Next.js 16
- pnpm (for package management)
- Drizzle ORM
- PostgreSQL
- Google Generative AI (Gemini Model)
- UI Components Reference: Flexbox Labs

## **User Authentication**
Implement user authentication with login, logout, and signup functionality.

## **Translation Interface**
Create a translation page with the following features:
- A language direction switcher (two tabs or toggle) to switch between English→Vietnamese and Vietnamese→English
- An input field where users can type the word/phrase/sentence they want to translate
- As the user types, display a dropdown list of word suggestions from the database
- If no suggestions are found, treat the input as a sentence and translate it using Google Generative AI

## **Translation Output Format**
For individual words, generate a professional dictionary-style response that includes:
- Word type/part of speech (adjective, adverb, noun, verb, etc.)
- Phonetic transcription in IPA format (e.g., “superman” → /ˈsuː.pɚ.mæn/ in US English)
- Multiple meanings/definitions (if applicable), with the most commonly used meaning prominently displayed or listed first
- Sample sentences demonstrating usage
- Usage notes and guides for proper word usage

For sentences and phrases, provide a direct translation.

## **AI Integration**
- Use the `google.generativeai` library to translate all inputs (words, phrases, and sentences)
- Design appropriate prompts to generate dictionary-style responses for words and translation responses for sentences

## **Caching and History**
- Save all translation results (words, phrases, and sentences) to the database after each lookup to avoid redundant AI API calls
- Before making an AI request, check if the translation already exists in the cache

## **Bookmark Feature**
- Allow users to bookmark individual words (not sentences or phrases)
- Implement full-text search functionality for bookmarked words

## **Regeneration Feature**
- Provide a “Regenerate” button that allows users to request a new AI-generated translation if they are not satisfied with the current result
- Save the regenerated result to replace or supplement the previous cached translation

---

**Please implement this dictionary application with a clean, user-friendly interface and efficient database queries.**
