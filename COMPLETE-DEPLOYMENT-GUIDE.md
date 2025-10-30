# 🚀 MEDILEDGER NEXUS - COMPLETE DEPLOYMENT GUIDE
# Hedera Africa Hackathon 2025 Ready

## **⏱️ Complete Deployment in 15 Minutes**

This guide will deploy MediLedger Nexus with real blockchain integration and generate verifiable proof for the hackathon.

---

## **📋 Prerequisites**

### **1. HashPack Wallet Setup**
```bash
# Go to https://hashpack.app
# 1. Create new wallet (or use existing)
# 2. Switch to TESTNET (top right)
# 3. Get free HBAR: https://faucet.hedera.com
# 4. Copy your Account ID (0.0.XXXXXXX)
# 5. Export Private Key (Settings → Account → Export Private Key)
# ⚠️ SAVE THIS KEY SECURELY - you'll need it for deployment
```

### **2. Development Environment**
```bash
# Ensure you have Node.js installed
node --version  # Should be 18+
npm --version   # Should be 9+

# Install dependencies
npm install
```

---

## **🔧 Step 1: Configure Environment**

### **Create .env.local file:**
```bash
# Replace with your actual HashPack credentials
HEDERA_ACCOUNT_ID=0.0.7123249
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...
HEDERA_NETWORK=testnet

# HashConnect Configuration
NEXT_PUBLIC_HASHCONNECT_PROJECT_ID=your-walletconnect-id

# AI Integration (get from Groq)
NEXT_PUBLIC_GROQ_API_KEY=your-groq-key

# JWT Secret (generate random string)
JWT_SECRET=your-secret-key-here

# Environment
NODE_ENV=production
```

**Get WalletConnect Project ID:**
1. Go to https://cloud.walletconnect.org
2. Create new project
3. Copy Project ID to `.env.local`

**Get Groq API Key:**
1. Go to https://console.groq.com
2. Create account and get API key
3. Add to `.env.local`

---

## **🔧 Step 2: Deploy Blockchain Assets**

### **Deploy On-Chain (5 minutes)**
```bash
# Run the hackathon deployment script
npm run deploy:hackathon
```

**This creates:**
- ✅ **HCS Topic** for audit logging
- ✅ **Consent NFT Token** for medical permissions
- ✅ **HEAL Reward Token** for incentives
- ✅ **Demo transactions** with metadata
- ✅ **deployment-proof.json** with all HashScan links

**Expected Output:**
```
🏆 HEDERA AFRICA HACKATHON - DEPLOYMENT PROOF
============================================================
🔗 HCS Topic: https://hashscan.io/testnet/topic/0.0.123456
🎫 Consent NFT: https://hashscan.io/testnet/token/0.0.123457
💰 HEAL Token: https://hashscan.io/testnet/token/0.0.123458

📋 TRANSACTION HASHES:
Topic Creation: 0.0.7123249@1698254123.123456789
NFT Creation: 0.0.7123249@1698254124.123456789
NFT Mint: 0.0.7123249@1698254125.123456789
```

---

## **🔧 Step 3: Deploy Web Application**

### **Option A: Vercel (Recommended - Free)**
```bash
# 1. Go to https://vercel.com
# 2. Sign in with GitHub
# 3. Click "New Project"
# 4. Import your GitHub repository
# 5. Add environment variables from .env.local
# 6. Deploy automatically
```

**Environment Variables in Vercel:**
```
HEDERA_ACCOUNT_ID=0.0.7123249
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...
HEDERA_NETWORK=testnet
HCS_TOPIC_ID=0.0.123456  # From deployment output
CONSENT_NFT_TOKEN_ID=0.0.123457  # From deployment output
HEAL_TOKEN_ID=0.0.123458  # From deployment output
NEXT_PUBLIC_HASHCONNECT_PROJECT_ID=your-walletconnect-id
NEXT_PUBLIC_GROQ_API_KEY=your-groq-key
JWT_SECRET=your-secret-key
```

### **Option B: Netlify**
```bash
# 1. Go to https://netlify.com
# 2. Sign in and create new site
# 3. Connect GitHub repository
# 4. Add environment variables
# 5. Set build command: npm run build
# 6. Set publish directory: .next
# 7. Deploy
```

---

## **🔧 Step 4: Verify Complete Deployment**

### **Test Everything Works:**
```bash
# Verify blockchain deployment
npm run verify:deployment

# Build the application
npm run build

# Start locally to test
npm start
```

**Test Checklist:**
- ✅ **HashPack Connection**: Can connect wallet
- ✅ **HCS Logging**: Messages appear on HashScan
- ✅ **NFT Operations**: Can mint/burn consent tokens
- ✅ **Dashboard Loading**: All components render
- ✅ **API Endpoints**: All routes respond correctly

---

## **🔧 Step 5: Generate Hackathon Proof**

### **📸 Screenshots to Capture**

**1. HashScan Pages:**
- HCS Topic: `https://hashscan.io/testnet/topic/0.0.123456`
- Consent NFT: `https://hashscan.io/testnet/token/0.0.123457`
- HEAL Token: `https://hashscan.io/testnet/token/0.0.123458`
- Transaction History: Show recent activity

**2. Application Screenshots:**
- Login/dashboard interface
- Consent request/grant workflow
- Real-time transaction logs
- Multi-role functionality (patient/doctor)

**3. Environment Configuration:**
- Vercel/Netlify environment variables
- API response logs showing blockchain operations

### **📄 Documentation Files**
- `deployment-proof.json` (auto-generated)
- Screenshots of all HashScan pages
- Application demo video (2-3 minutes)

---

## **🔧 Step 6: Final Hackathon Submission**

### **📋 What to Submit**

**1. Live Application URL:**
```
🌐 https://your-app-name.vercel.app
```

**2. HashScan Verification Links:**
```
🔗 HCS Topic: https://hashscan.io/testnet/topic/0.0.123456
🎫 Consent NFT: https://hashscan.io/testnet/token/0.0.123457
💰 HEAL Token: https://hashscan.io/testnet/token/0.0.123458
```

**3. Transaction Evidence:**
```
📋 Topic Creation: 0.0.7123249@1698254123.123456789
🎫 NFT Creation: 0.0.7123249@1698254124.123456789
💰 Token Creation: 0.0.7123249@1698254125.123456789
```

**4. Demo Video Script:**
```
"MediLedger Nexus is a fully deployed healthcare blockchain platform:

1. Real HCS topics for audit logging on Hedera testnet
2. NFT consent system for medical data permissions
3. Live token rewards for healthcare participation
4. Complete multi-role healthcare workflows
5. Enterprise-grade security and compliance

All transactions are verifiable on HashScan blockchain explorer.
This isn't a demo—it's a production-ready healthcare platform!"
```

---

## **🆘 Troubleshooting**

### **"Insufficient Balance" Error**
```bash
# Get more testnet HBAR
1. Go to https://faucet.hedera.com
2. Enter your account ID: 0.0.7123249
3. Wait 5 minutes for confirmation
4. Try deployment again
```

### **"Invalid Private Key" Error**
```bash
# Verify private key format
1. Should start with: 302e020100300506032b657004220420
2. Copy exactly from HashPack (no extra spaces)
3. Ensure testnet is selected in HashPack
```

### **"Build Failed" Error**
```bash
# Check environment variables
1. All required env vars set in deployment platform
2. No missing API keys
3. Build command: npm run build
4. Output directory: .next
```

### **"HashPack Connection Failed"**
```bash
# Verify WalletConnect setup
1. Get Project ID from https://cloud.walletconnect.org
2. Add NEXT_PUBLIC_HASHCONNECT_PROJECT_ID to env
3. Test wallet connection on deployed site
```

---

## **🎯 Deployment Checklist**

- [ ] HashPack wallet with testnet HBAR
- [ ] Private key exported and configured
- [ ] Environment variables set up
- [ ] Blockchain assets deployed
- [ ] HashScan links verified
- [ ] Web application deployed
- [ ] All features tested
- [ ] Screenshots captured
- [ ] Demo video recorded
- [ ] Documentation complete

---

## **🏆 You're Ready for the Hackathon!**

**With complete deployment, you'll have:**
- ✅ **Live web application** accessible worldwide
- ✅ **Real blockchain assets** on Hedera testnet
- ✅ **Verifiable transactions** on HashScan
- ✅ **Complete documentation** for judges
- ✅ **Professional presentation** materials

**This puts you in the top tier of hackathon submissions!**

**🚀 Deploy now and show them real blockchain innovation!** 🏆✨

---

**Need Help?**
- **Discord**: [Join Community](https://discord.gg/mediledger-nexus)
- **GitHub Issues**: [Report Problems](https://github.com/Mediledger-Nexus/Mediledger-Nexus-frontend/issues)
- **Documentation**: [Complete Guides](README.md)
