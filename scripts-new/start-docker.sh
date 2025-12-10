#!/bin/bash

# Start all services with Docker Compose

echo "🚀 Starting Paper2Slides services..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    if [ ! -f ".env.example" ]; then
        echo "❌ No .env or .env.example file found"
        exit 1
    fi
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your API keys, then run this script again"
    exit 1
fi

# Check if OPENAI_API_KEY is set
if grep -q "your_openai_api_key_here" .env; then
    echo "⚠️  Please set your OPENAI_API_KEY in .env file"
    exit 1
fi

# Start services
docker-compose up -d

echo ""
echo "✅ Services started!"
echo ""
echo "📊 Services:"
echo "  - Web:            http://localhost:3000"
echo "  - Python Backend: http://localhost:8000"
echo "  - PostgreSQL:     localhost:5432"
echo ""
echo "📝 View logs:"
echo "  docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "  docker-compose down"
echo ""
