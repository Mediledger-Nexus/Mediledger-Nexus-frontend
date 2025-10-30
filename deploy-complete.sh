#!/bin/bash

# 🚀 MediLedger Nexus - One-Click Hackathon Deployment
# This script deploys everything needed for the Hedera Africa Hackathon

echo "🚀 MediLedger Nexus - Complete Hackathon Deployment"
echo "================================================="

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm"
    exit 1
fi

echo "✅ Node.js and npm found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check for .env.local
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating template..."
    cp env.example .env.local
    echo "📝 Please edit .env.local with your credentials:"
    echo "   - HEDERA_ACCOUNT_ID (from HashPack)"
    echo "   - HEDERA_PRIVATE_KEY (from HashPack)"
    echo "   - NEXT_PUBLIC_HASHCONNECT_PROJECT_ID (from WalletConnect Cloud)"
    echo "   - NEXT_PUBLIC_GROQ_API_KEY (from Groq Console)"
    read -p "Press Enter when .env.local is configured..."
fi

# Deploy blockchain assets
echo "🔗 Deploying blockchain assets..."
npm run deploy:hackathon

# Check if deployment was successful
if [ ! -f deployment-proof.json ]; then
    echo "❌ Blockchain deployment failed. Check your credentials in .env.local"
    exit 1
fi

echo "✅ Blockchain deployment successful!"

# Build the application
echo "🏗️  Building application..."
npm run build

# Check build success
if [ ! -d .next ]; then
    echo "❌ Build failed. Check for errors above."
    exit 1
fi

echo "✅ Application built successfully!"

# Deploy to Vercel (if vercel CLI available)
if command -v vercel &> /dev/null; then
    echo "🚀 Deploying to Vercel..."
    vercel --prod

    if [ $? -eq 0 ]; then
        echo "✅ Deployed to Vercel!"
        echo "🌐 Your live application URL will be shown above"
    else
        echo "⚠️  Vercel deployment failed. Manual deployment required."
        echo "📖 Manual deployment guide: See COMPLETE-DEPLOYMENT-GUIDE.md"
    fi
else
    echo "📖 Vercel CLI not found. Manual deployment required."
    echo "📖 See COMPLETE-DEPLOYMENT-GUIDE.md for manual deployment steps"
fi

# Generate final proof
echo "📋 Generating hackathon proof..."
npm run verify:deployment

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo "📄 Check deployment-proof.json for HashScan links"
echo "📸 Take screenshots of HashScan pages for submission"
echo "🎬 Record demo video showing live functionality"
echo ""
echo "🏆 Ready for Hedera Africa Hackathon submission!"
echo "💯 You have real blockchain deployment with verifiable proof!"
