#!/bin/bash
# Local CI Test Script - Run this before pushing to GitHub

set -e  # Exit on any error

echo "🔍 Running local CI tests..."
echo ""

# Change to script directory
cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
npm ci
echo "✅ Dependencies installed"
echo ""

echo "🔐 Running security audit..."
npm audit --production --audit-level=moderate || echo "⚠️  Security warnings (non-blocking)"
echo ""

echo "📝 Checking syntax..."
node -c server.js && echo "  ✅ server.js"
node -c config.js && echo "  ✅ config.js"
node -c public/app.js && echo "  ✅ app.js"
echo ""

echo "🚀 Testing server startup..."
# Create test .env
echo "DOCS_REPO=https://github.com/d1srupt3d/docs.git" > .env.test
export $(cat .env.test | xargs)

# Start server in background
timeout 10s node server.js &
SERVER_PID=$!

# Wait for server to start
echo "  ⏳ Waiting for server..."
sleep 5

# Test if server responds
echo "  🌐 Testing /api/config..."
if curl -f http://localhost:3000/api/config > /dev/null 2>&1; then
    echo "  ✅ Server started successfully!"
else
    echo "  ❌ Server failed to respond"
    kill $SERVER_PID 2>/dev/null || true
    rm .env.test
    exit 1
fi

# Kill server
kill $SERVER_PID 2>/dev/null || true
rm .env.test

echo ""
echo "✅ All CI tests passed!"
echo "🚀 Ready to push to GitHub!"
