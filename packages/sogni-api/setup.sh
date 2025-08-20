#!/bin/bash

echo "🚀 Setting up Sogni AI API Service..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node --version | sed 's/v//')
if [ "$(printf '%s\n' "18.0.0" "$NODE_VERSION" | sort -V | head -n1)" != "18.0.0" ]; then
    echo "⚠️  Node.js version $NODE_VERSION detected. Recommended: 18.0.0+"
fi

echo "✅ Node.js version: $(node --version)"

# Clean npm cache if needed
echo "🧹 Cleaning npm cache..."
npm cache clean --force 2>/dev/null || echo "⚠️  Cache clean failed, continuing..."

# Install dependencies with error handling
echo "📦 Installing dependencies..."
if npm install; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ npm install failed. Trying alternative approaches..."
    
    # Try removing package-lock.json and reinstalling
    echo "🔄 Removing package-lock.json and retrying..."
    rm -f package-lock.json
    
    if npm install; then
        echo "✅ Dependencies installed successfully!"
    else
        echo "❌ Installation failed. Please try manually:"
        echo "   1. Delete node_modules and package-lock.json"
        echo "   2. Run: npm install --legacy-peer-deps"
        echo "   3. Or use yarn: yarn install"
        exit 1
    fi
fi

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating environment file..."
    cp env.example .env.local
    echo "⚠️  Please edit .env.local with your Sogni AI credentials:"
    echo "   - SOGNI_APP_ID"
    echo "   - SOGNI_USER" 
    echo "   - SOGNI_PASS"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Sogni AI credentials"
echo "2. Run: npm run dev"
echo "3. API will be available at http://localhost:3002"
echo ""
echo "Test the API:"
echo "curl -X POST http://localhost:3002/api/generate \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"prompt\":\"wellness NFT artwork\"}'"
