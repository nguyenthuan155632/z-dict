# Z-Dict - Bilingual Dictionary Application

A modern English-Vietnamese bilingual dictionary web application powered by AI, built with Next.js 15, Drizzle ORM, PostgreSQL, and Google Generative AI.

## Features

- 🔄 **Bidirectional Translation**: English ↔ Vietnamese translation
- 🤖 **AI-Powered**: Uses Google Generative AI (Gemini) for intelligent translations
- 📚 **Dictionary-Style Responses**: Professional dictionary entries for individual words with:
  - Phonetic transcription (IPA format)
  - Part of speech
  - Multiple definitions
  - Example sentences
  - Usage notes
- 💾 **Smart Caching**: Saves all translations to avoid redundant API calls
- 🔍 **Word Suggestions**: Auto-complete suggestions as you type
- ⭐ **Bookmarks**: Save your favorite words for quick access
- 🔎 **Full-Text Search**: Search through your bookmarked words
- 🔄 **Regeneration**: Request new AI translations if not satisfied
- 🔐 **User Authentication**: Secure login and signup system

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5
- **AI**: Google Generative AI (Gemini)
- **Package Manager**: pnpm
- **Styling**: Custom CSS with Flexbox utilities

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google API Key (for Generative AI)
- pnpm package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd z-dict
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Update the following variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `GOOGLE_API_KEY`: Your Google Generative AI API key
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for development)

4. **Set up the database**
   
   Generate and run migrations:
   ```bash
   pnpm db:push
   ```

5. **Seed the database (optional)**

   Populate the database with words for autocomplete:
   ```bash
   pnpm db:seed
   ```

   Words are loaded from `seed/en.txt` and `seed/vi.txt`. You can add more words by editing these files.

6. **Run the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Users Table
- Stores user authentication information
- Fields: id, email, password (hashed), name, timestamps

### Words Table
- Stores suggestion words for autocomplete
- Fields: id, word, language (en/vi), created_at
- Indexed for fast lookups

### Translation Cache Table
- Caches all translation results
- Fields: id, source_text, source_language, target_language, translation, is_word, timestamps
- Prevents redundant AI API calls

### Bookmarks Table
- Stores user bookmarks for individual words
- Fields: id, user_id, word, language, translation, created_at
- Supports full-text search

## Usage

1. **Sign Up / Login**: Create an account or log in to access all features
2. **Translate**: 
   - Select language direction (EN→VI or VI→EN)
   - Type a word, phrase, or sentence
   - View word suggestions as you type
   - Click "Translate" or press Enter
3. **Bookmark**: Click the bookmark button to save individual words
4. **Regenerate**: Click regenerate to get a new AI translation
5. **Search Bookmarks**: Use the search bar on the bookmarks page

## Scripts

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm lint`: Run ESLint
- `pnpm db:generate`: Generate Drizzle migrations
- `pnpm db:push`: Push schema changes to database
- `pnpm db:studio`: Open Drizzle Studio

## Project Structure

```
z-dict/
├── src/
│   ├── app/
│   │   ├── actions/          # Server actions
│   │   ├── api/              # API routes
│   │   ├── bookmarks/        # Bookmarks page
│   │   ├── login/            # Login page
│   │   ├── signup/           # Signup page
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   ├── db/                   # Database schema and config
│   ├── lib/                  # Utilities and services
│   └── types/                # TypeScript type definitions
├── drizzle/                  # Database migrations
├── scripts/                  # Utility scripts
└── public/                   # Static assets
```

## License

MIT

