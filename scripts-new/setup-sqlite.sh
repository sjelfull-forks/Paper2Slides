#!/bin/bash

# Setup script for SQLite local development
# This is the default and simplest option - no external database needed!

set -e

echo "🚀 Setting up Paper2Slides with SQLite (default)"
echo ""

# Create .env.local for Next.js app
ENV_FILE="apps/web/.env.local"

echo "📝 Creating $ENV_FILE..."

cat > "$ENV_FILE" << 'EOF'
# Database: SQLite (default - no installation needed!)
# SQLite stores data in a local file - perfect for development
# SQLITE_DB_PATH=./sqlite.db (default)

# If you want to use PGlite instead, uncomment this:
# USE_PGLITE=true

# If you want to use PostgreSQL instead, uncomment and configure:
# DATABASE_URL=postgresql://user:password@localhost:5432/paper2slides

# OpenAI API Key (Required for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# File Upload Settings
UPLOAD_DIR=./sources/uploads
OUTPUT_DIR=./outputs
MAX_FILE_SIZE=50000000

# Next.js Public URL
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF

echo "✅ Created $ENV_FILE"
echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🗄️  Setting up SQLite database..."
pnpm --filter @paper2slides/database db:push:sqlite

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "  1. Add your OpenAI API key to $ENV_FILE"
echo "  2. Run 'pnpm dev' to start the development server"
echo "  3. Open http://localhost:3000"
echo ""
echo "💡 SQLite database file will be created at ./sqlite.db"
echo "💡 To view/edit your database, run: pnpm --filter @paper2slides/database db:studio:sqlite"
echo ""
echo "📖 For more database options, see LOCAL-DATABASE.md"
