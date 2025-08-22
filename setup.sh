#!/bin/bash

echo "🚀 Setting up TripWeaver..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your API keys before continuing."
fi

# Set up database
echo "🗄️  Setting up database..."
cd packages/db
npx prisma generate
echo "⚠️  Please run 'npx prisma db push' after setting up your database."

cd ../..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Set up PostgreSQL database"
echo "3. Run 'cd packages/db && npx prisma db push'"
echo "4. Run 'npm run dev' to start development servers"
echo ""
echo "🌐 Web app will be available at: http://localhost:3000"
echo "🔌 API will be available at: http://localhost:3001"
