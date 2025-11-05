// Seed script to populate the database with suggestion words
// Reads words from seed/en.txt and seed/vi.txt
// Run with: pnpm db:seed
// Optimized for large datasets (1M+ rows)

// Load environment variables from .env file
require('dotenv').config();

const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Stream-read words from a text file line by line
 * Memory-efficient approach for large files (handles millions of rows)
 * Each line in the file should contain one word
 * Empty lines and lines starting with # are ignored
 */
async function* streamWordsFromFile(filePath) {
  try {
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      const trimmedLine = String(line).trim();

      // Skip empty lines, comments, and lines exceeding database limit
      if (trimmedLine.length > 0 &&
        !trimmedLine.startsWith('#') &&
        trimmedLine.length <= 255) {
        yield trimmedLine;
      }
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
  }
}

/**
 * Count total lines in a file (for progress reporting)
 */
async function countLines(filePath) {
  try {
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let count = 0;
    for await (const line of rl) {
      const trimmedLine = line.trim();
      if (trimmedLine.length > 0 &&
        !trimmedLine.startsWith('#') &&
        trimmedLine.length <= 255) {
        count++;
      }
    }
    return count;
  } catch (error) {
    console.error(`Error counting lines in ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Bulk insert words into the database with optimized batch processing
 * Uses larger batches and true bulk inserts for better performance
 * Handles millions of rows efficiently
 */
async function bulkInsertWords(client, filePath, language) {
  const batchSize = 5000; // Larger batches for better performance with bulk inserts
  let inserted = 0;
  let skipped = 0;
  let batch = [];

  // Count total words for progress reporting
  console.log('  Counting words...');
  const totalWords = await countLines(filePath);
  console.log(`  Total words to process: ${totalWords.toLocaleString()}`);

  // Ensure unique constraint exists
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
    console.log('  Note: Unique constraint may already exist');
  }

  const startTime = Date.now();
  let processedCount = 0;

  // Process words in batches
  for await (const word of streamWordsFromFile(filePath)) {
    batch.push(word);

    if (batch.length >= batchSize) {
      const result = await insertBatch(client, batch, language);
      inserted += result.inserted;
      skipped += result.skipped;
      processedCount += batch.length;

      // Progress reporting with ETA
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = processedCount / elapsed;
      const remaining = totalWords - processedCount;
      const eta = remaining / rate;

      process.stdout.write(
        `\r  Processed ${processedCount.toLocaleString()}/${totalWords.toLocaleString()} ` +
        `(${Math.round(processedCount / totalWords * 100)}%) ` +
        `- ${Math.round(rate)}/s ` +
        `- ETA: ${formatTime(eta)}   `
      );

      batch = [];
    }
  }

  // Insert remaining words
  if (batch.length > 0) {
    const result = await insertBatch(client, batch, language);
    inserted += result.inserted;
    skipped += result.skipped;
    processedCount += batch.length;
  }

  const totalTime = (Date.now() - startTime) / 1000;
  console.log(''); // New line after progress
  console.log(`  Completed in ${formatTime(totalTime)} (avg: ${Math.round(processedCount / totalTime)}/s)`);

  return { inserted, skipped, total: processedCount };
}

/**
 * Insert a batch of words using a single bulk INSERT
 * Much faster than individual inserts
 */
async function insertBatch(client, words, language) {
  if (words.length === 0) return { inserted: 0, skipped: 0 };

  try {
    // Build bulk insert with ON CONFLICT to handle duplicates
    const values = words.map(word => ({ word, language }));

    const result = await client`
      INSERT INTO words ${client(values, 'word', 'language')}
      ON CONFLICT (word, language) DO NOTHING
    `;

    return {
      inserted: result.count || words.length,
      skipped: words.length - (result.count || words.length)
    };
  } catch (error) {
    console.error(`\n  Error inserting batch:`, error.message);

    // Fallback: try inserting words one by one
    let inserted = 0;
    let skipped = 0;

    for (const word of words) {
      try {
        await client`
          INSERT INTO words (word, language)
          VALUES (${word}, ${language})
          ON CONFLICT (word, language) DO NOTHING
        `;
        inserted++;
      } catch (err) {
        skipped++;
      }
    }

    return { inserted, skipped };
  }
}

/**
 * Format seconds into human-readable time
 */
function formatTime(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

async function seed() {
  console.log('🌱 Starting database seed (optimized for large datasets)...\n');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('\nPlease:');
    console.log('1. Copy .env.example to .env');
    console.log('2. Update DATABASE_URL with your PostgreSQL credentials');
    process.exit(1);
  }

  // Setup file paths
  const enFilePath = path.join(__dirname, '..', 'seed', 'en.txt');
  const viFilePath = path.join(__dirname, '..', 'seed', 'vi.txt');

  // Check if files exist
  const enExists = fs.existsSync(enFilePath);
  const viExists = fs.existsSync(viFilePath);

  if (!enExists && !viExists) {
    console.error('❌ No seed files found');
    console.log('\nPlease create:');
    console.log('  - seed/en.txt (English words, one per line)');
    console.log('  - seed/vi.txt (Vietnamese words, one per line)');
    process.exit(1);
  }

  // Create database client with optimized settings for bulk operations
  const client = postgres(connectionString, {
    prepare: false,
    max: 10, // Connection pool size
    idle_timeout: 20,
    connect_timeout: 10
  });

  const startTime = Date.now();
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalProcessed = 0;

  try {
    // Insert English words
    if (enExists) {
      console.log('📝 Processing English words...');
      const enResult = await bulkInsertWords(client, enFilePath, 'en');
      console.log(`  ✅ Inserted: ${enResult.inserted.toLocaleString()}, Skipped: ${enResult.skipped.toLocaleString()}\n`);
      totalInserted += enResult.inserted;
      totalSkipped += enResult.skipped;
      totalProcessed += enResult.total;
    }

    // Insert Vietnamese words
    if (viExists) {
      console.log('📝 Processing Vietnamese words...');
      const viResult = await bulkInsertWords(client, viFilePath, 'vi');
      console.log(`  ✅ Inserted: ${viResult.inserted.toLocaleString()}, Skipped: ${viResult.skipped.toLocaleString()}\n`);
      totalInserted += viResult.inserted;
      totalSkipped += viResult.skipped;
      totalProcessed += viResult.total;
    }

    const totalTime = (Date.now() - startTime) / 1000;

    console.log('✅ Seed completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`  - Total processed: ${totalProcessed.toLocaleString()} words`);
    console.log(`  - Inserted: ${totalInserted.toLocaleString()} words`);
    console.log(`  - Skipped (duplicates): ${totalSkipped.toLocaleString()} words`);
    console.log(`  - Total time: ${formatTime(totalTime)}`);
    console.log(`  - Average rate: ${Math.round(totalProcessed / totalTime)} words/second\n`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();

