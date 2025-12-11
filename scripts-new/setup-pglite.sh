#!/bin/bash

# Setup PGlite for local development
# This script configures the environment to use PGlite instead of PostgreSQL

echo "🚀 Setting up PGlite for local development..."

# Create .env.local if it doesn't exist
if [ ! -f "apps/web/.env.local" ]; then
    echo "📝 Creating apps/web/.env.local..."
    cat > apps/web/.env.local << EOF
# Use PGlite for local development
USE_PGLITE=true

# OpenAI API Key (Required)
OPENAI_API_KEY=your_openai_api_key_here

# File Upload Settings
UPLOAD_DIR=./sources/uploads
OUTPUT_DIR=./outputs
MAX_FILE_SIZE=50000000

# Next.js Public URL
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF
    echo "✅ Created apps/web/.env.local"
else
    echo "ℹ️  apps/web/.env.local already exists"
    
    # Check if USE_PGLITE is set
    if ! grep -q "USE_PGLITE" apps/web/.env.local; then
        echo "📝 Adding USE_PGLITE=true to .env.local..."
        echo "" >> apps/web/.env.local
        echo "# Use PGlite for local development" >> apps/web/.env.local
        echo "USE_PGLITE=true" >> apps/web/.env.local
        echo "✅ Added USE_PGLITE setting"
    else
        echo "ℹ️  USE_PGLITE already configured"
    fi
fi

# Add pglite-data to .gitignore if not present
if [ -f ".gitignore" ]; then
    if ! grep -q "pglite-data" .gitignore; then
        echo "📝 Adding pglite-data/ to .gitignore..."
        echo "" >> .gitignore
        echo "# PGlite data directory" >> .gitignore
        echo "pglite-data/" >> .gitignore
        echo "*.db" >> .gitignore
        echo "✅ Updated .gitignore"
    else
        echo "ℹ️  .gitignore already includes pglite-data"
    fi
fi

echo ""
echo "✅ PGlite setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Update OPENAI_API_KEY in apps/web/.env.local"
echo "   2. Run: pnpm install"
echo "   3. Run: pnpm db:push"
echo "   4. Run: pnpm dev"
echo ""
echo "📖 See LOCAL-POSTGRES.md for full documentation"
echo ""
