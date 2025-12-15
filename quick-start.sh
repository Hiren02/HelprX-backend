#!/bin/bash

# HelprX Backend - Quick Start Script
# This script helps you set up the backend quickly

echo "🚀 HelprX Backend - Quick Start"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please edit .env and update your database credentials"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
else
    echo "✅ Dependencies already installed"
    echo ""
fi

echo "📋 Next steps:"
echo "1. Edit .env file with your database credentials"
echo "2. Create PostgreSQL database: helprx_db"
echo "3. Enable PostGIS: CREATE EXTENSION IF NOT EXISTS postgis;"
echo "4. Run migrations: npm run migrate"
echo "5. Seed sample data: npm run seed"
echo "6. Start server: npm run dev"
echo ""
echo "For detailed instructions, see SETUP.md"
echo ""
echo "Happy coding! 🎉"
