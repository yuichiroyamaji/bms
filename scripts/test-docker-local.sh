#!/bin/bash

# Script to test Docker build locally before deploying

set -e

echo "🐳 Testing Docker build locally..."
echo ""

cd frontend

echo "📦 Building Docker image..."
docker build -t nextjs-admin-test .

echo ""
echo "✅ Build successful!"
echo ""
echo "🚀 Starting container on http://localhost:3000"
echo "   Press Ctrl+C to stop"
echo ""

docker run -p 3000:3000 --rm nextjs-admin-test
