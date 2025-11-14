// Seed script to create a test user for development
// Run with: node scripts/seed-test-user.js

// Load environment variables from .env file
require('dotenv').config();

const postgres = require('postgres');
const bcrypt = require('bcryptjs');

async function seedTestUser() {
  console.log('👤 Creating test user...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('\nPlease:');
    console.log('1. Copy .env.example to .env');
    console.log('2. Update DATABASE_URL with your PostgreSQL credentials');
    process.exit(1);
  }

  // Create database client
  const client = postgres(connectionString, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10
  });

  try {
    // Test user data
    const testUser = {
      id: '00000000-0000-0000-0000-000000000000', // The dummy ID used in API routes
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123' // Simple password for testing
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(testUser.password, 10);

    console.log(`\n📝 Creating user: ${testUser.email}`);
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Name: ${testUser.name}`);

    // Insert the test user
    await client`
      INSERT INTO dict_users (id, email, name, password, created_at, updated_at)
      VALUES (
        ${testUser.id},
        ${testUser.email},
        ${testUser.name},
        ${hashedPassword},
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        updated_at = NOW()
    `;

    console.log('\n✅ Test user created successfully!');
    console.log('\n🔐 Login credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('\n📝 Note: This user ID matches the dummy ID used in API routes');
    console.log('   so the foreign key constraint will no longer fail.');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedTestUser();
