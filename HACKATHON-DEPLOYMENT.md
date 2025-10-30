# 🚀 HEDERA AFRICA HACKATHON 2025 - DEPLOYMENT INSTRUCTIONS

## **⏱️ 5-Minute Setup for On-Chain Proof**

Follow these exact steps to deploy MediLedger Nexus on Hedera and get verifiable blockchain proof for the hackathon.

---

## **Step 1: Get Your HashPack Credentials**

1. **Go to HashPack**: [hashpack.app](https://hashpack.app)
2. **Create Wallet** (if you don't have one)
3. **Switch to Testnet**: Click network selector → "Testnet"
4. **Get Free HBAR**: Go to [faucet.hedera.com](https://faucet.hedera.com) → Enter your HashPack account ID
5. **Export Private Key**:
   - Settings → Account → Export Private Key
   - Save this securely (you'll need it for deployment)

---

## **Step 2: Configure Environment**

1. **Edit .env.local**:
```bash
# Replace with your actual HashPack credentials
HEDERA_ACCOUNT_ID=0.0.7123249                    # Your HashPack account ID
HEDERA_PRIVATE_KEY=your-actual-hashpack-key      # Your exported private key
HEDERA_NETWORK=testnet                           # Must be testnet for hackathon
HCS_TOPIC_ID=0.0.123456                          # Will be auto-created
CONSENT_NFT_TOKEN_ID=0.0.123457                  # Will be auto-created
HEAL_TOKEN_ID=0.0.123458                         # Will be auto-created
```

2. **Verify Balance**:
```bash
# Check you have enough HBAR for deployment
node -e "
import { Client, AccountBalanceQuery, AccountId, PrivateKey } from '@hashgraph/sdk';
const client = Client.forTestnet().setOperator('0.0.7123249', PrivateKey.fromString('your-key'));
const balance = await new AccountBalanceQuery().setAccountId('0.0.7123249').execute(client);
console.log('Balance:', balance.hbars.toString(), 'HBAR');
"
```

---

## **Step 3: Deploy On-Chain Assets**

**Run the deployment:**
```bash
npm run deploy:hackathon
```

**Expected Output:**
```
🚀 Creating MediLedger Nexus On-Chain Deployment Proof...

🔑 Using Account: 0.0.7123249
🌐 Network: testnet

📝 Creating HCS Topic for MediLedger Audit Logs...
✅ HCS Topic Created: 0.0.123456

🎫 Creating MediLedger Consent NFT Token...
✅ Consent NFT Token Created: 0.0.123457

🏥 Creating HEAL Reward Token...
✅ HEAL Token Created: 0.0.123458

🎨 Minting Demo Consent NFT...
✅ Demo NFT Minted - Serial: 1

📋 Logging to HCS for audit trail...
✅ HCS Message Logged - Sequence: 1

📄 Deployment proof saved to: deployment-proof.json

🏆 HEDERA AFRICA HACKATHON - DEPLOYMENT PROOF
============================================================
📅 Deployment Date: 10/25/2024, 3:15:23 PM
👤 Deployed By: 0.0.7123249
🌐 Network: Hedera Testnet

🔗 VERIFICATION LINKS:
HCS Topic: https://hashscan.io/testnet/topic/0.0.123456
Consent NFT: https://hashscan.io/testnet/token/0.0.123457
HEAL Token: https://hashscan.io/testnet/token/0.0.123458
Demo NFT: https://hashscan.io/testnet/token/0.0.123457?serial=1

📋 TRANSACTION HASHES:
Topic Creation: 0.0.7123249@1698254123.123456789
NFT Creation: 0.0.7123249@1698254124.123456789
Token Creation: 0.0.7123249@1698254125.123456789
NFT Mint: 0.0.7123249@1698254126.123456789
HCS Message: 0.0.7123249@1698254127.123456789

✅ SUCCESS: All blockchain assets deployed and verified!
💯 Ready for hackathon submission with HashScan proof!
```

---

## **Step 4: Verify Deployment**

**Run verification:**
```bash
npm run verify:deployment
```

**This will show:**
- ✅ Account balance confirmation
- ✅ HCS topic active status
- ✅ NFT token verification
- ✅ HashScan links for proof

---

## **Step 5: Capture Proof for Hackathon**

### **📸 Required Screenshots**

1. **HashScan - HCS Topic Page**
   - URL: `https://hashscan.io/testnet/topic/0.0.123456`
   - Show topic details, memo, and recent messages
   - Include transaction hash and timestamp

2. **HashScan - NFT Token Page**
   - URL: `https://hashscan.io/testnet/token/0.0.123457`
   - Show token name: "MediLedger Consent NFT"
   - Include serial numbers and metadata

3. **HashScan - Token Transfers**
   - Show NFT mint and transfer transactions
   - Include transaction hashes and amounts

4. **Application Interface**
   - Consent request/grant workflow
   - Real-time blockchain transaction logs
   - Multi-role dashboard demonstration

### **📄 Required Documents**

1. **deployment-proof.json** (auto-generated)
2. **Screenshots** of all HashScan pages
3. **Environment config** (with credentials redacted)
4. **Video demo** showing live blockchain operations

---

## **Step 6: Submit to Hackathon**

### **📋 What to Include**

**In your hackathon submission:**

1. **HashScan Links** (most important!)
   ```
   🔗 HCS Topic: https://hashscan.io/testnet/topic/0.0.123456
   🎫 Consent NFT: https://hashscan.io/testnet/token/0.0.123457
   💰 HEAL Token: https://hashscan.io/testnet/token/0.0.123458
   ```

2. **Transaction Proof**
   ```
   📋 Topic Creation: 0.0.7123249@1698254123.123456789
   🎫 NFT Creation: 0.0.7123249@1698254124.123456789
   💰 Token Creation: 0.0.7123249@1698254125.123456789
   ```

3. **Real Healthcare Use Case**
   - NFT consent for medical data access
   - Emergency override protocols
   - Privacy-preserving AI diagnostics
   - African healthcare market focus

---

## **🔧 Troubleshooting**

**"Insufficient Balance" Error:**
```bash
# Get more testnet HBAR
1. Go to https://faucet.hedera.com
2. Enter your account ID: 0.0.7123249
3. Wait 5 minutes, try again
```

**"Invalid Private Key" Error:**
```bash
# Verify your private key format
1. Should start with: 302e0201...
2. Copy exactly from HashPack export
3. No extra spaces or characters
```

**"Topic/Token Not Found" Error:**
```bash
# Update DEPLOYED_CONFIG in verify-deployment.js
# Run deployment again with fresh assets
npm run deploy:hackathon
```

---

## **🎉 You're Ready!**

**With real blockchain deployment, you'll have:**
- ✅ **Verifiable HashScan links** showing live transactions
- ✅ **Transaction hashes** proving real blockchain operations
- ✅ **Professional documentation** for judges
- ✅ **Complete healthcare solution** with enterprise features

**This level of on-chain integration puts you in the top tier of hackathon submissions!**

**🚀 Go deploy and win that hackathon!** 🏆✨

---

**Need Help?** Check [HACKATHON-README.md](HACKATHON-README.md) or join our [Discord community](https://discord.gg/mediledger-nexus)
