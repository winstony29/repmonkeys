#!/bin/bash

echo "🧪 Testing Sogni AI Integration"
echo "================================"

# Check if services are running
echo "🔍 Checking services..."

# Test Sogni API
if curl -s http://localhost:3002/api/generate > /dev/null; then
    echo "✅ Sogni API (port 3002) - Running"
else
    echo "❌ Sogni API (port 3002) - Not running"
    echo "💡 Start with: cd packages/sogni-api && npm run dev"
fi

# Test Playground
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Playground (port 3000) - Running"
else
    echo "❌ Playground (port 3000) - Not running"
    echo "💡 Start with: cd packages/playground && npm run dev"
fi

echo ""
echo "🚀 Quick Start Commands:"
echo "1. Terminal 1: cd packages/sogni-api && npm run dev"
echo "2. Terminal 2: cd packages/playground && npm run dev"
echo "3. Browser: http://localhost:3000"
echo ""
echo "🧪 Test API directly:"
echo "cd packages/sogni-api && node test-api.js"
