const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config();

async function dropDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  try {
    console.log('Dropping all tables...');

    // Drop tables in reverse order of dependencies to avoid foreign key constraints
    await client`DROP TABLE IF EXISTS dict_bookmarks CASCADE`;
    await client`DROP TABLE IF EXISTS dict_translation_cache CASCADE`;
    await client`DROP TABLE IF EXISTS dict_words CASCADE`;
    await client`DROP TABLE IF EXISTS dict_users CASCADE`;

    // Drop enum types
    await client`DROP TYPE IF EXISTS language CASCADE`;

    console.log('✅ All tables dropped successfully!');
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

dropDatabase();
