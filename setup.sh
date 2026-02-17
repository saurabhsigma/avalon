#!/bin/bash

echo "🎓 EduPlatform Setup Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "✅ .env.local created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env.local with your actual credentials:"
    echo "   - MONGODB_URI (MongoDB connection string)"
    echo "   - JWT_SECRET (generate with: openssl rand -base64 32)"
    echo "   - LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL"
    echo "   - GROQ_API_KEY"
    echo "   - PINECONE_API_KEY (for semantic search)"
    echo ""
    read -p "Press Enter after you've updated .env.local..."
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🏗️  Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo ""
echo "🔧 Initializing Pinecone index..."
npm run init-pinecone

if [ $? -eq 0 ]; then
    echo "✅ Pinecone index initialized!"
else
    echo "⚠️  Pinecone initialization skipped or failed"
    echo "   You can run it manually later with: npm run init-pinecone"
fi

echo ""
echo "================================"
echo "✅ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser."
echo ""
echo "📖 For more information, see README.md"
echo "📖 For Pinecone setup, see PINECONE_SETUP.md"
echo "================================"
