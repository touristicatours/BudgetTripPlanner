#!/bin/bash

# Setup script for ML recommendation engine dependencies
echo "🤖 Setting up ML Recommendation Engine for TripWeaver..."

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3.8+ and try again."
    exit 1
fi

# Check Python version
python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python $required_version or higher is required. Found: $python_version"
    exit 1
fi

echo "✅ Python $python_version found"

# Create virtual environment if it doesn't exist
if [ ! -d "ai/venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv ai/venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source ai/venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install ML dependencies
echo "📚 Installing ML dependencies..."
pip install -r ai/requirements.txt

# Test the installation
echo "🧪 Testing ML recommendation engine..."
cd ai
echo '{"user_profile": {"interests": ["art", "food"], "budget": 2, "pace": "moderate"}, "activities": [], "top_n": 1}' | python3 recommendation_engine.py

if [ $? -eq 0 ]; then
    echo "✅ ML recommendation engine setup complete!"
    echo ""
    echo "🚀 Usage:"
    echo "  - The recommendation engine will automatically be used in itinerary generation"
    echo "  - If Python dependencies are missing, the system falls back to simple heuristics"
    echo "  - To manually test: cd ai && echo '{...}' | python3 recommendation_engine.py"
    echo ""
    echo "📊 Features:"
    echo "  - Content-based filtering with TF-IDF and cosine similarity"
    echo "  - User preference matching"
    echo "  - Interest-based activity ranking"
    echo "  - Budget and pace considerations"
else
    echo "❌ ML recommendation engine test failed"
    echo "The system will use fallback recommendations"
fi

echo ""
echo "🎯 The ML recommendation engine is now integrated into the itinerary generation flow!"
