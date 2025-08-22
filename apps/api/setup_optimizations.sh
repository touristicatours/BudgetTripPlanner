#!/bin/bash

# Setup script for TripWeaver Optimizations

echo "🚀 Setting up TripWeaver Optimizations..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install Python dependencies for ML
echo "🐍 Installing Python dependencies..."
if command -v pip3 &> /dev/null; then
    pip3 install -r ai/requirements.txt
    echo "✅ Python dependencies installed"
else
    echo "⚠️ pip3 not found, skipping Python dependencies"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p models
mkdir -p logs
mkdir -p ai

# Set permissions
chmod +x ai/recommendation_engine.py

# Check Redis availability
echo "🔍 Checking Redis availability..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis is running"
    else
        echo "⚠️ Redis is installed but not running"
        echo "   Start Redis with: redis-server"
    fi
else
    echo "⚠️ Redis not found"
    echo "   Install Redis for optimal performance:"
    echo "   - macOS: brew install redis"
    echo "   - Ubuntu: sudo apt-get install redis-server"
    echo "   - Or use Redis Cloud/Upstash for hosted solution"
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Test optimizations
echo "🧪 Testing optimizations..."
if [ -f "test_optimizations.js" ]; then
    echo "   Running optimization tests..."
    node test_optimizations.js
else
    echo "   Test file not found, skipping tests"
fi

echo ""
echo "🎉 TripWeaver Optimizations Setup Complete!"
echo ""
echo "📋 What was installed:"
echo "   ✅ Node.js dependencies (winston, redis, lru-cache)"
echo "   ✅ Python ML dependencies (scikit-learn, pandas, numpy)"
echo "   ✅ Created directories (models, logs, ai)"
echo "   ✅ Built TypeScript code"
echo ""
echo "🚀 To start the optimized server:"
echo "   npm run dev"
echo ""
echo "📊 To monitor performance:"
echo "   tail -f logs/combined.log"
echo ""
echo "🧪 To run optimization tests:"
echo "   node test_optimizations.js"
echo ""
echo "📚 For more information:"
echo "   cat OPTIMIZATION_GUIDE.md"
