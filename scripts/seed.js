// Seed script to populate the database with suggestion words
// Reads words from seed/en.txt and seed/vi.txt
// Run with: pnpm db:seed

// Load environment variables from .env file
require('dotenv').config();

const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

// Maximum number of words to load per language (to prevent memory issues)
const MAX_WORDS_PER_LANGUAGE = 50000;

/**
 * Read words from a text file
 * Each line in the file should contain one word
 * Empty lines and lines starting with # are ignored
 */
function readWordsFromFile(filePath, maxWords = MAX_WORDS_PER_LANGUAGE) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const words = content
      .split('\n')
      .map(line => String(line).trim())
      .filter(line => line.length > 0 && !line.startsWith('#'))
      .filter(line => line.length <= 255) // Database limit
      .slice(0, maxWords); // Limit number of words
    return words;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Bulk insert words into the database
 * Uses batch inserts for better performance
 */
async function bulkInsertWords(client, words, language) {
  const batchSize = 100;
  let inserted = 0;
  let skipped = 0;

  // First, ensure unique constraint exists
  try {
    await client`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'words_word_language_unique'
        ) THEN
          ALTER TABLE words ADD CONSTRAINT words_word_language_unique UNIQUE (word, language);
        END IF;
      END $$;
    `;
  } catch (error) {
    console.log('Note: Unique constraint may already exist or could not be created');
  }

  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize);

    try {
      // Insert each word in the batch
      for (const word of batch) {
        try {
          await client`
            INSERT INTO words (word, language)
            VALUES (${word}, ${language})
            ON CONFLICT (word, language) DO NOTHING
          `;
          inserted++;
        } catch (err) {
          // Skip this word if it fails
          skipped++;
        }
      }

      process.stdout.write(`\r  Processed ${Math.min(i + batchSize, words.length)}/${words.length} words...`);
    } catch (error) {
      console.error(`\nError inserting batch starting at index ${i}:`, error.message);
      skipped += batch.length;
    }
  }

  console.log(''); // New line after progress
  return { inserted, skipped };
}

async function seed() {
  console.log('🌱 Starting database seed...\n');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('\nPlease:');
    console.log('1. Copy .env.example to .env');
    console.log('2. Update DATABASE_URL with your PostgreSQL credentials');
    process.exit(1);
  }

  // Read words from files
  const enFilePath = path.join(__dirname, '..', 'seed', 'en.txt');
  const viFilePath = path.join(__dirname, '..', 'seed', 'vi.txt');

  console.log('📖 Reading word files...');
  const englishWords = readWordsFromFile(enFilePath);
  const vietnameseWords = readWordsFromFile(viFilePath);

  if (englishWords.length === 0 && vietnameseWords.length === 0) {
    console.error('❌ No words found in seed files');
    console.log('\nPlease create:');
    console.log('  - seed/en.txt (English words, one per line)');
    console.log('  - seed/vi.txt (Vietnamese words, one per line)');
    process.exit(1);
  }

  console.log(`  Found ${englishWords.length} English words`);
  console.log(`  Found ${vietnameseWords.length} Vietnamese words\n`);

  const client = postgres(connectionString, { prepare: false });

  try {
    // Insert English words
    if (englishWords.length > 0) {
      console.log('📝 Inserting English words...');
      const enResult = await bulkInsertWords(client, englishWords, 'en');
      console.log(`  ✅ Processed ${enResult.inserted} English words\n`);
    }

    // Insert Vietnamese words
    if (vietnameseWords.length > 0) {
      console.log('📝 Inserting Vietnamese words...');
      const viResult = await bulkInsertWords(client, vietnameseWords, 'vi');
      console.log(`  ✅ Processed ${viResult.inserted} Vietnamese words\n`);
    }

    console.log('✅ Seed completed successfully!');
    console.log(`\nTotal words in database:`);
    console.log(`  - English: ${englishWords.length}`);
    console.log(`  - Vietnamese: ${vietnameseWords.length}`);
    console.log(`  - Total: ${englishWords.length + vietnameseWords.length}\n`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();

