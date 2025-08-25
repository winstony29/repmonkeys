#!/bin/bash

echo "🚀 Setting up repmonkeys-acp-python-sdk for AI Wellness API..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.10 or higher."
    exit 1
fi

# Check Python version
python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
required_version="3.9"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python version $python_version is too old. Please install Python 3.9 or higher."
    exit 1
fi

echo "✅ Python $python_version detected"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3."
    exit 1
fi

echo "✅ pip3 detected"

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies. Please check the requirements.txt file."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file and add your OpenRouter API key:"
    echo "   OPENROUTER_API_KEY=your_api_key_here"
else
    echo "✅ .env file found"
fi

# Test the Python script
echo "🧪 Testing Python script..."
python3 ai_wellness_api.py '{"user_message": "test message", "user_goals": [], "user_profile": {}}'

if [ $? -eq 0 ]; then
    echo "✅ Python script test successful"
else
    echo "⚠️  Python script test failed. This might be due to missing API key or other configuration."
    echo "   Please check your .env file and ensure all dependencies are installed."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file and add your OpenRouter API key"
echo "2. Test the API endpoint: POST /api/ai-wellness"
echo "3. The frontend will now use AI-powered responses instead of hardcoded ones"
echo ""
echo "For more information, check the README.md file."
