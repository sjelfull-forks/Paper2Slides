#!/bin/bash

# Setup script for Paper2Slides Next.js version

set -e

echo "🚀 Setting up Paper2Slides..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Warning: Docker is not installed. You'll need to set up PostgreSQL manually."
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Check for .env.local
if [ ! -f "apps/web/.env.local" ]; then
    echo "📝 Creating .env.local from example..."
    cp apps/web/.env.example apps/web/.env.local
    echo "⚠️  Please edit apps/web/.env.local and add your API keys"
fi

# Check for PostgreSQL
if command -v docker &> /dev/null; then
    echo "🐘 Starting PostgreSQL with Docker..."
    docker-compose up -d postgres
    
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 5
    
    echo "📊 Pushing database schema..."
    pnpm --filter=@paper2slides/database db:push
else
    echo "⚠️  Please set up PostgreSQL manually and run: pnpm db:push"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit apps/web/.env.local and add your OpenAI API key"
echo "2. Start the development servers:"
echo "   - pnpm dev              (Start Next.js)"
echo "   - python api/server.py  (Start Python backend)"
echo ""
