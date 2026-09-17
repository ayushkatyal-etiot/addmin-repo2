#!/bin/bash
set -e

echo "🚀 Starting AddMin Docker services..."

# Start services in background
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
echo "   (migrations run automatically on first startup)"
sleep 3

echo ""
echo "✅ Services launched!"
echo ""
echo "Services running:"
echo "  📱 Frontend: http://localhost:3000"
echo "  🔌 Backend:  http://localhost:3001"
echo "  🗄️  Database: localhost:5432"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop:      docker-compose down"
echo "Stop+wipe: docker-compose down -v"
