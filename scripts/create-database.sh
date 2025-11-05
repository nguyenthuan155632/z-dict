#!/bin/bash

# Script to create the PostgreSQL database
# Usage: ./scripts/create-database.sh

echo "Creating PostgreSQL database 'zdict'..."

# Try to create database using psql
psql -U postgres -c "CREATE DATABASE zdict;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database 'zdict' created successfully!"
else
    echo "⚠️  Database might already exist or you need to provide credentials."
    echo "Try running manually:"
    echo "  psql -U your_username -c \"CREATE DATABASE zdict;\""
fi

echo ""
echo "Next steps:"
echo "1. Update your .env file with the correct DATABASE_URL"
echo "2. Run: pnpm db:push"

