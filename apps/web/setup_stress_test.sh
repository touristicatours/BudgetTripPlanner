#!/bin/bash

# Setup script for TripWeaver Stress Test Suite

echo "🚀 Setting up TripWeaver Stress Test Environment..."

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r stress_test_requirements.txt

# Check if the web application is running
echo "🔍 Checking if TripWeaver is running..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ TripWeaver is running on http://localhost:3000"
else
    echo "⚠️ TripWeaver is not running on http://localhost:3000"
    echo "   Please start the application first:"
    echo "   npm run dev"
    echo ""
    echo "   Or specify a different URL when running the stress test:"
    echo "   python3 stress_test.py http://your-app-url"
fi

# Check database setup
echo "🗄️ Checking database setup..."
if [ -f "prisma/dev.db" ]; then
    echo "✅ Database file found"
else
    echo "⚠️ Database file not found, running migrations..."
    npx prisma migrate dev
    npx prisma generate
fi

# Check ML dependencies
echo "🤖 Checking ML dependencies..."
if python3 -c "import numpy, pandas, sklearn" 2>/dev/null; then
    echo "✅ ML dependencies found"
else
    echo "⚠️ ML dependencies not found, installing..."
    pip3 install numpy pandas scikit-learn
fi

# Make stress test script executable
chmod +x stress_test.py

echo ""
echo "🎉 Stress test environment setup complete!"
echo ""
echo "To run the stress test suite:"
echo "  python3 stress_test.py"
echo ""
echo "To run with a custom URL:"
echo "  python3 stress_test.py http://your-app-url"
echo ""
echo "To run individual tests:"
echo "  python3 -c \"import stress_test; asyncio.run(stress_test.StressTestSuite().test_geographic_diversity())\""
