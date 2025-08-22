#!/bin/bash

# BudgetTripPlanner Admin Backend Deployment Script
# This script helps deploy the admin backend to various platforms

set -e

echo "🚀 BudgetTripPlanner Admin Backend Deployment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js and npm are available"

# Install dependencies
print_info "Installing dependencies..."
npm install

print_status "Dependencies installed successfully"

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    cp env.example .env
    print_info "Please edit .env file with your configuration"
fi

# Function to deploy to Heroku
deploy_heroku() {
    print_info "Deploying to Heroku..."
    
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI is not installed. Please install it first."
        print_info "Visit: https://devcenter.heroku.com/articles/heroku-cli"
        return 1
    fi
    
    # Check if git repository exists
    if [ ! -d .git ]; then
        print_info "Initializing git repository..."
        git init
        git add .
        git commit -m "Initial commit"
    fi
    
    # Create Heroku app if it doesn't exist
    if ! heroku apps:info &> /dev/null; then
        print_info "Creating Heroku app..."
        heroku create budgettripplanner-admin-$(date +%s)
    fi
    
    # Set environment variables
    print_info "Setting environment variables..."
    heroku config:set NODE_ENV=production
    heroku config:set JWT_SECRET=$(openssl rand -base64 32)
    heroku config:set ALLOWED_ORIGINS=https://yourdomain.com
    
    # Deploy
    print_info "Deploying to Heroku..."
    git push heroku main
    
    print_status "Deployed to Heroku successfully!"
    print_info "Your admin dashboard is available at: $(heroku info -s | grep web_url | cut -d= -f2)/admin"
}

# Function to deploy to Railway
deploy_railway() {
    print_info "Deploying to Railway..."
    
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI is not installed. Please install it first."
        print_info "Visit: https://docs.railway.app/develop/cli"
        return 1
    fi
    
    print_info "Logging into Railway..."
    railway login
    
    print_info "Initializing Railway project..."
    railway init
    
    print_info "Deploying to Railway..."
    railway up
    
    print_status "Deployed to Railway successfully!"
    print_info "Your admin dashboard will be available at the provided URL"
}

# Function to deploy to Vercel
deploy_vercel() {
    print_info "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is not installed. Please install it first."
        print_info "Run: npm i -g vercel"
        return 1
    fi
    
    print_info "Deploying to Vercel..."
    vercel --prod
    
    print_status "Deployed to Vercel successfully!"
}

# Function to run locally
run_local() {
    print_info "Starting local development server..."
    print_info "Admin dashboard will be available at: http://localhost:5000/admin"
    print_info "API health check: http://localhost:5000/api/health"
    print_info "Default login: admin@budgettripplanner.com / password"
    echo ""
    print_warning "Press Ctrl+C to stop the server"
    echo ""
    
    npm start
}

# Main menu
show_menu() {
    echo ""
    echo "Choose deployment option:"
    echo "1) Run locally (development)"
    echo "2) Deploy to Heroku"
    echo "3) Deploy to Railway"
    echo "4) Deploy to Vercel"
    echo "5) Exit"
    echo ""
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            run_local
            ;;
        2)
            deploy_heroku
            ;;
        3)
            deploy_railway
            ;;
        4)
            deploy_vercel
            ;;
        5)
            print_info "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please try again."
            show_menu
            ;;
    esac
}

# Check if script is run with arguments
if [ $# -eq 0 ]; then
    show_menu
else
    case $1 in
        "local"|"dev")
            run_local
            ;;
        "heroku")
            deploy_heroku
            ;;
        "railway")
            deploy_railway
            ;;
        "vercel")
            deploy_vercel
            ;;
        *)
            print_error "Unknown option: $1"
            print_info "Usage: ./deploy.sh [local|heroku|railway|vercel]"
            exit 1
            ;;
    esac
fi







