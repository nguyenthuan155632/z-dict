# Z-Dict Features Documentation

## Core Features

### 1. Bilingual Translation (English ↔ Vietnamese)

#### Language Direction Switcher
- **Two-way toggle**: Switch between English→Vietnamese and Vietnamese→English
- **Swap button**: Quick swap of source and target languages
- **Visual indicators**: Clear display of current translation direction

#### Translation Types
- **Individual Words**: Get comprehensive dictionary entries
- **Phrases**: Translate common phrases and expressions
- **Sentences**: Full sentence translation with context preservation

### 2. AI-Powered Translation

#### Google Generative AI Integration
- Uses Gemini 1.5 Flash model for fast, accurate translations
- Intelligent prompt engineering for different content types
- Context-aware translations

#### Dictionary-Style Word Entries
When translating individual words, the AI provides:

1. **Phonetic Transcription**
   - IPA (International Phonetic Alphabet) format
   - Example: "hello" → /həˈloʊ/

2. **Part of Speech**
   - Noun, verb, adjective, adverb, etc.
   - Helps understand word usage

3. **Multiple Definitions**
   - Most common meaning listed first
   - Additional meanings when applicable
   - Clear, concise explanations

4. **Example Sentences**
   - Natural usage examples
   - Both source and target language
   - Demonstrates proper context

5. **Usage Notes**
   - Common collocations
   - Grammar tips
   - Cultural context when relevant

#### Sentence Translation
- Direct, natural translation
- Preserves tone and meaning
- No unnecessary formatting

### 3. Smart Caching System

#### Translation Cache
- **Automatic saving**: All translations saved to database
- **Instant retrieval**: Cached translations load immediately
- **No redundant API calls**: Saves costs and improves speed
- **Cache indicator**: Shows when translation is from cache

#### Cache Benefits
- Faster response times
- Reduced API costs
- Consistent translations
- Offline-ready (for cached content)

### 4. Word Suggestions

#### Auto-Complete
- **Real-time suggestions**: As you type, see matching words
- **Language-specific**: Suggestions match selected source language
- **Fast lookup**: Indexed database queries
- **Click to translate**: Select suggestion to auto-translate

#### Suggestion Database
- Pre-populated with common words
- Expandable through seed scripts
- Supports both English and Vietnamese

### 5. User Authentication

#### Secure Login System
- **NextAuth.js v5**: Industry-standard authentication
- **Password hashing**: bcrypt encryption
- **Session management**: JWT-based sessions
- **Protected routes**: Middleware-based protection

#### User Features
- Sign up with email and password
- Secure login
- Session persistence
- Easy logout

### 6. Bookmark System

#### Save Favorite Words
- **Word-only bookmarks**: Only individual words can be bookmarked
- **One-click save**: Simple bookmark button
- **Duplicate prevention**: Can't bookmark the same word twice
- **Full translation saved**: Complete dictionary entry stored

#### Bookmark Management
- View all bookmarks in dedicated page
- Remove unwanted bookmarks
- See when bookmarks were added
- Language indicators (EN/VI)

### 7. Full-Text Search

#### Search Bookmarks
- **Real-time search**: Results update as you type
- **Case-insensitive**: Finds matches regardless of case
- **Partial matching**: Finds words containing search term
- **Fast queries**: Indexed database searches

### 8. Regeneration Feature

#### Request New Translations
- **Regenerate button**: Get a fresh AI translation
- **Override cache**: Forces new API call
- **Update stored translation**: Replaces cached version
- **Useful for**: Getting alternative phrasings or updated content

## User Interface

### Design Principles
- **Clean and minimal**: Focus on content
- **Responsive**: Works on all screen sizes
- **Accessible**: Keyboard navigation support
- **Visual feedback**: Loading states, success/error messages

### Color Scheme
- **Primary gradient**: Purple gradient (667eea → 764ba2)
- **Clean backgrounds**: White cards on gradient background
- **Clear typography**: Easy-to-read fonts
- **Status colors**: Green for success, red for errors

### Components

#### Header
- Logo and branding
- Navigation links
- User info display
- Login/Logout buttons

#### Translation Interface
- Language direction selector
- Text input with suggestions
- Action buttons (Translate, Regenerate, Bookmark)
- Translation display area
- Status messages

#### Bookmarks List
- Search bar
- Bookmark cards with full details
- Remove buttons
- Empty state messages

## Technical Features

### Database Schema

#### Optimized Tables
1. **Users**: Authentication and user data
2. **Words**: Suggestion words for autocomplete
3. **Translation Cache**: All translation history
4. **Bookmarks**: User-saved words

#### Indexing Strategy
- Email index for fast user lookup
- Word + language composite index
- Cache key index (source + languages)
- User + word index for bookmarks

### Performance Optimizations

#### Database
- Indexed queries for fast lookups
- Connection pooling
- Prepared statements disabled for compatibility

#### Frontend
- Debounced search (300ms)
- Client-side state management
- Optimistic UI updates
- Lazy loading where applicable

#### API
- Cached translations reduce API calls
- Efficient database queries
- Server actions for data mutations

### Security

#### Authentication
- Password hashing with bcrypt
- JWT session tokens
- HTTP-only cookies
- CSRF protection

#### Data Protection
- SQL injection prevention (parameterized queries)
- XSS protection (React escaping)
- Environment variable security
- User data isolation

## Future Enhancement Ideas

### Potential Features
- [ ] Audio pronunciation
- [ ] Image-based translation
- [ ] Translation history page
- [ ] Export bookmarks
- [ ] Shared bookmark collections
- [ ] Multiple language support
- [ ] Offline mode
- [ ] Mobile app
- [ ] Browser extension
- [ ] API for third-party integration

### Improvements
- [ ] Advanced search filters
- [ ] Bookmark categories/tags
- [ ] User preferences
- [ ] Dark mode
- [ ] Customizable UI themes
- [ ] Translation quality feedback
- [ ] Community contributions
- [ ] Word of the day
- [ ] Learning mode/flashcards
- [ ] Usage statistics

## API Usage

### Google Generative AI
- Model: gemini-2.5-flash
- Rate limits: Based on your API key tier
- Cost: Pay per token (check Google pricing)
- Best practices: Cache aggressively to minimize costs

### Database
- PostgreSQL 12+
- Connection pooling recommended
- Regular backups advised
- Index maintenance for performance
