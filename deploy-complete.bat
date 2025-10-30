@echo off
REM 🚀 MediLedger Nexus - Complete Hackathon Deployment (Windows)
REM This script deploys everything needed for the Hedera Africa Hackathon

echo 🚀 MediLedger Nexus - Complete Hackathon Deployment
echo =================================================
echo.

REM Check prerequisites
echo 🔍 Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please install npm
    pause
    exit /b 1
)

echo ✅ Node.js and npm found
echo.

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

REM Check for .env.local
if not exist .env.local (
    echo ⚠️  .env.local not found. Creating template...
    copy env.example .env.local
    echo.
    echo 📝 Please edit .env.local with your credentials:
    echo    - HEDERA_ACCOUNT_ID (from HashPack)
    echo    - HEDERA_PRIVATE_KEY (from HashPack)
    echo    - NEXT_PUBLIC_HASHCONNECT_PROJECT_ID (from WalletConnect Cloud)
    echo    - NEXT_PUBLIC_GROQ_API_KEY (from Groq Console)
    echo.
    echo Press any key when .env.local is configured...
    pause >nul
)

REM Deploy blockchain assets
echo 🔗 Deploying blockchain assets...
npm run deploy:hackathon
if %errorlevel% neq 0 (
    echo ❌ Blockchain deployment failed. Check your credentials in .env.local
    pause
    exit /b 1
)

REM Check if deployment was successful
if not exist deployment-proof.json (
    echo ❌ Blockchain deployment failed. Check your credentials in .env.local
    pause
    exit /b 1
)

echo ✅ Blockchain deployment successful!
echo.

REM Build the application
echo 🏗️  Building application...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed. Check for errors above.
    pause
    exit /b 1
)

REM Check build success
if not exist .next (
    echo ❌ Build failed. Check for errors above.
    pause
    exit /b 1
)

echo ✅ Application built successfully!
echo.

REM Check for Vercel CLI
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📖 Vercel CLI not found. Manual deployment required.
    echo 📖 See COMPLETE-DEPLOYMENT-GUIDE.md for manual deployment steps
    goto :manual_deploy
)

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod
if %errorlevel% neq 0 (
    echo ⚠️  Vercel deployment failed. Manual deployment required.
    goto :manual_deploy
)

echo ✅ Deployed to Vercel!
echo 🌐 Your live application URL will be shown above
goto :verify_deployment

:manual_deploy
echo.
echo 📖 MANUAL DEPLOYMENT REQUIRED:
echo 1. Go to https://vercel.com
echo 2. Import your GitHub repository
echo 3. Add environment variables from .env.local
echo 4. Deploy
echo.
echo 📖 See COMPLETE-DEPLOYMENT-GUIDE.md for detailed steps

:verify_deployment
echo.
echo 📋 Verifying deployment...
npm run verify:deployment
if %errorlevel% neq 0 (
    echo ⚠️  Verification had issues. Check deployment manually.
)

echo.
echo 🎉 DEPLOYMENT COMPLETE!
echo ======================
echo 📄 Check deployment-proof.json for HashScan links
echo 📸 Take screenshots of HashScan pages for submission
echo 🎬 Record demo video showing live functionality
echo.
echo 🏆 Ready for Hedera Africa Hackathon submission!
echo 💯 You have real blockchain deployment with verifiable proof!
echo.
pause
