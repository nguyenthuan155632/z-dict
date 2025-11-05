# Z-Dict Setup Guide

This guide will walk you through setting up the Z-Dict bilingual dictionary application.

## Step 1: Install Dependencies

Make sure you have the following installed:
- Node.js 18 or higher
- PostgreSQL database
- pnpm package manager

Install pnpm if you don't have it:
```bash
npm install -g pnpm
```

Install project dependencies:
```bash
pnpm install
```

## Step 2: Set Up PostgreSQL Database

1. **Create a PostgreSQL database:**
   ```sql
   CREATE DATABASE zdict;
   ```

2. **Note your connection string:**
   ```
   postgresql://username:password@localhost:5432/zdict
   ```

## Step 3: Get Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key for Google Generative AI
3. Copy the API key for the next step

## Step 4: Configure Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and fill in your values:**
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/zdict

   # Google Generative AI
   GOOGLE_API_KEY=your_actual_google_api_key_here

   # NextAuth
   NEXTAUTH_SECRET=your_generated_secret_here
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and paste it as the value for `NEXTAUTH_SECRET`

## Step 5: Set Up Database Schema

Push the database schema to your PostgreSQL database:
```bash
pnpm db:push
```

This will create all the necessary tables:
- `users` - User accounts
- `words` - Word suggestions for autocomplete
- `translation_cache` - Cached translations
- `bookmarks` - User bookmarks

## Step 6: Seed the Database (Optional)

Populate the database with words for autocomplete suggestions:
```bash
pnpm db:seed
```

This will read words from:
- `seed/en.txt` - English words
- `seed/vi.txt` - Vietnamese words

The seed files already contain hundreds of common words in both languages. You can add more words by editing these files (one word per line).

## Step 7: Run the Development Server

Start the development server:
```bash
pnpm dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

## Step 8: Create Your First Account

1. Click "Sign Up" in the header
2. Fill in your name, email, and password
3. Click "Sign Up"
4. You'll be automatically logged in and redirected to the home page

## Step 9: Try Translating

1. **Translate a word:**
   - Type "hello" in the input field
   - You should see word suggestions appear
   - Click "Translate" or press Enter
   - View the dictionary-style response with phonetics, definitions, and examples

2. **Translate a sentence:**
   - Type "How are you today?"
   - Click "Translate"
   - View the Vietnamese translation

3. **Bookmark a word:**
   - Translate a single word
   - Click the "⭐ Bookmark" button
   - Go to "Bookmarks" in the header to see your saved words

4. **Regenerate translation:**
   - After translating, click "🔄 Regenerate"
   - Get a new AI-generated translation

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Make sure PostgreSQL is running
- Check that the database exists

### Google API Issues
- Verify your `GOOGLE_API_KEY` is correct
- Check that the API key has access to Generative AI
- Ensure you have billing enabled (if required)

### Build Errors
- Delete `node_modules` and `.next` folders
- Run `pnpm install` again
- Run `pnpm dev`

## Production Deployment

### Build for Production
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start
```

### Environment Variables for Production
Make sure to set all environment variables in your production environment:
- `DATABASE_URL` - Your production database URL
- `GOOGLE_API_KEY` - Your Google API key
- `NEXTAUTH_SECRET` - A secure random string
- `NEXTAUTH_URL` - Your production URL (e.g., https://yourdomain.com)

## Database Management

### View Database in Drizzle Studio
```bash
pnpm db:studio
```

### Generate Migrations
```bash
pnpm db:generate
```

### Push Schema Changes
```bash
pnpm db:push
```

## Features Overview

✅ **Bidirectional Translation** - English ↔ Vietnamese
✅ **AI-Powered** - Google Generative AI (Gemini)
✅ **Dictionary Entries** - Phonetics, definitions, examples
✅ **Smart Caching** - Saves translations to database
✅ **Word Suggestions** - Autocomplete as you type
✅ **Bookmarks** - Save favorite words
✅ **Search** - Full-text search in bookmarks
✅ **Regeneration** - Request new translations
✅ **Authentication** - Secure user accounts

## Support

For issues or questions, please check:
- README.md for general information
- Database schema in `src/db/schema.ts`
- API documentation in code comments

Happy translating! 🎉

