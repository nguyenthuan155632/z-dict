# Z-Dict Quick Reference

## Quick Start Commands

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Set up database
pnpm db:push

# Seed database (optional)
pnpm db:seed

# Run development server
pnpm dev
```

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/zdict
GOOGLE_API_KEY=your_google_api_key
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000
```

## NPM Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:push` | Push schema to database |
| `pnpm db:generate` | Generate migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:seed` | Seed database with words |

## Project Structure

```
z-dict/
├── src/
│   ├── app/
│   │   ├── actions/          # Server actions
│   │   │   ├── auth.ts       # Authentication actions
│   │   │   └── translation.ts # Translation actions
│   │   ├── api/auth/         # NextAuth API routes
│   │   ├── bookmarks/        # Bookmarks page
│   │   ├── login/            # Login page
│   │   ├── signup/           # Signup page
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/
│   │   ├── Header.tsx        # Navigation header
│   │   ├── TranslationInterface.tsx
│   │   └── BookmarksList.tsx
│   ├── db/
│   │   ├── schema.ts         # Database schema
│   │   └── index.ts          # Database client
│   ├── lib/
│   │   ├── auth.ts           # NextAuth config
│   │   └── ai.ts             # Google AI service
│   └── types/
│       └── next-auth.d.ts    # Type definitions
├── scripts/
│   ├── seed.js               # Database seeding
│   └── manual-migration.sql  # SQL reference
├── drizzle.config.ts         # Drizzle configuration
├── next.config.js            # Next.js config
├── tsconfig.json             # TypeScript config
└── package.json              # Dependencies
```

## Key Files

### Database Schema (`src/db/schema.ts`)
- Users table
- Words table (suggestions)
- Translation cache table
- Bookmarks table

### Server Actions
- `src/app/actions/auth.ts` - Login, signup, logout
- `src/app/actions/translation.ts` - Translate, bookmark, search

### AI Service (`src/lib/ai.ts`)
- Translation prompts
- Word vs sentence detection
- Google AI integration

## Common Tasks

### Add New Words to Suggestions
Edit `scripts/seed.js` and run:
```bash
pnpm db:seed
```

### Reset Database
```bash
# Drop all tables and recreate
pnpm db:push
pnpm db:seed
```

### View Database
```bash
pnpm db:studio
# Opens at http://localhost:4983
```

### Check Logs
Development server logs show:
- Translation requests
- Cache hits/misses
- Authentication events
- Database queries

## API Endpoints

### NextAuth
- `GET/POST /api/auth/signin` - Sign in
- `GET/POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get session

### Server Actions (called from client)
- `signup(formData)` - Create account
- `login(formData)` - Login
- `logout()` - Logout
- `translate(text, sourceLang, targetLang, regenerate)` - Translate
- `getWordSuggestions(query, language)` - Get suggestions
- `addBookmark(word, language, translation)` - Bookmark word
- `removeBookmark(bookmarkId)` - Remove bookmark
- `searchBookmarks(query)` - Search bookmarks

## Database Queries

### Get User
```typescript
const user = await db.query.users.findFirst({
  where: eq(users.email, email)
});
```

### Get Suggestions
```typescript
const suggestions = await db.query.words.findMany({
  where: and(
    eq(words.language, language),
    ilike(words.word, `${query}%`)
  ),
  limit: 10
});
```

### Check Cache
```typescript
const cached = await db.query.translationCache.findFirst({
  where: and(
    eq(translationCache.sourceText, text),
    eq(translationCache.sourceLanguage, sourceLang),
    eq(translationCache.targetLanguage, targetLang)
  )
});
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Failed
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Test connection: `psql $DATABASE_URL`

### Google API Error
- Verify GOOGLE_API_KEY is correct
- Check API quota/billing
- Test key at Google AI Studio

### Build Errors
```bash
# Clean and rebuild
rm -rf .next node_modules
pnpm install
pnpm dev
```

## Production Checklist

- [ ] Set production DATABASE_URL
- [ ] Set production NEXTAUTH_URL
- [ ] Generate new NEXTAUTH_SECRET
- [ ] Enable database backups
- [ ] Set up error monitoring
- [ ] Configure rate limiting
- [ ] Enable HTTPS
- [ ] Set up CDN (if needed)
- [ ] Test all features
- [ ] Run `pnpm build` successfully

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Google AI Docs](https://ai.google.dev)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

