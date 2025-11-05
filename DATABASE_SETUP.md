# Database Setup Guide

You're seeing the error `database "zdict" does not exist` because the PostgreSQL database hasn't been created yet.

## Quick Fix - Choose One Method:

### Method 1: Using psql Command Line (Recommended)

```bash
# Connect to PostgreSQL and create the database
psql -U postgres -c "CREATE DATABASE zdict;"

# Or if you have a different username:
psql -U your_username -c "CREATE DATABASE zdict;"

# Then push the schema
pnpm db:push
```

### Method 2: Using PostgreSQL Interactive Shell

```bash
# Open PostgreSQL shell
psql -U postgres

# Inside psql, run:
CREATE DATABASE zdict;

# Exit psql
\q

# Then push the schema
pnpm db:push
```

### Method 3: Using pgAdmin or GUI Tool

1. Open pgAdmin or your PostgreSQL GUI tool
2. Right-click on "Databases"
3. Select "Create" → "Database"
4. Enter name: `zdict`
5. Click "Save"
6. Run: `pnpm db:push`

### Method 4: Using the Setup Script

```bash
# Run the automated setup script
pnpm db:setup

# Then push the schema
pnpm db:push
```

## Complete Setup Steps

### 1. Make sure PostgreSQL is running

```bash
# Check if PostgreSQL is running (macOS)
brew services list | grep postgresql

# Start PostgreSQL if not running (macOS)
brew services start postgresql

# For Linux
sudo systemctl status postgresql
sudo systemctl start postgresql

# For Windows
# Check Services app for PostgreSQL service
```

### 2. Create the database

Choose one of the methods above to create the `zdict` database.

### 3. Verify your .env file

Make sure your `.env` file has the correct DATABASE_URL:

```env
# Example for local PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/zdict

# Or without password (if no password set)
DATABASE_URL=postgresql://postgres@localhost:5432/zdict

# Or with custom username
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/zdict
```

### 4. Push the schema to the database

```bash
pnpm db:push
```

You should see output like:
```
[✓] Changes applied
```

### 5. Seed the database (optional)

```bash
pnpm db:seed
```

### 6. Start the development server

```bash
pnpm dev
```

## Troubleshooting

### "psql: command not found"

PostgreSQL is not installed or not in your PATH.

**Install PostgreSQL:**

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### "password authentication failed"

Your DATABASE_URL has incorrect credentials.

**Fix:**
1. Check your PostgreSQL username and password
2. Update DATABASE_URL in `.env`
3. Or reset PostgreSQL password:

```bash
# macOS/Linux
psql -U postgres
ALTER USER postgres PASSWORD 'newpassword';
\q
```

### "connection refused"

PostgreSQL is not running.

**Fix:**
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Check status
brew services list  # macOS
sudo systemctl status postgresql  # Linux
```

### "role does not exist"

The username in your DATABASE_URL doesn't exist.

**Fix:**
```bash
# Create a new user
psql -U postgres
CREATE USER your_username WITH PASSWORD 'your_password';
ALTER USER your_username CREATEDB;
\q
```

## Alternative: Use a Cloud Database

If local setup is difficult, you can use a cloud PostgreSQL service:

### Option 1: Neon (Free tier available)
1. Go to https://neon.tech
2. Sign up and create a new project
3. Copy the connection string
4. Update DATABASE_URL in `.env`
5. Run `pnpm db:push`

### Option 2: Supabase (Free tier available)
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (use "Connection pooling" URL)
5. Update DATABASE_URL in `.env`
6. Run `pnpm db:push`

### Option 3: Railway (Free tier available)
1. Go to https://railway.app
2. Create a new project
3. Add PostgreSQL service
4. Copy the DATABASE_URL
5. Update `.env`
6. Run `pnpm db:push`

## Verify Setup

After setup, verify everything works:

```bash
# Check database connection
pnpm db:studio

# This should open Drizzle Studio at http://localhost:4983
# You should see your tables: users, words, translation_cache, bookmarks
```

## Next Steps

Once the database is set up:

1. ✅ Database created
2. ✅ Schema pushed (`pnpm db:push`)
3. ✅ Database seeded (`pnpm db:seed`) - optional
4. ✅ Ready to run (`pnpm dev`)

Your application should now work! 🎉

