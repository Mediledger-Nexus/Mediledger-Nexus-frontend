import {
  Client,
  PrivateKey,
  AccountId,
  TopicId,
  TokenId,
  TopicInfoQuery,
  TokenInfoQuery,
  AccountBalanceQuery,
} from "@hashgraph/sdk";

// Verify existing deployment for hackathon proof
async function verifyDeployment() {
  console.log("🔍 Verifying MediLedger Nexus On-Chain Deployment...\n");

  // Use your deployed configuration
  const DEPLOYED_CONFIG = {
    operatorId: "0.0.7123249",
    operatorKey: "YOUR_HASHPACK_PRIVATE_KEY", // Replace with your actual key
    hcsTopicId: "0.0.123456", // Replace with your actual deployed topic
    consentNftTokenId: "0.0.123457", // Replace with your actual deployed token
    healTokenId: "0.0.123458", // Replace with your actual deployed token
  };

  const client = Client.forTestnet().setOperator(DEPLOYED_CONFIG.operatorId, PrivateKey.fromString(DEPLOYED_CONFIG.operatorKey));

  try {
    console.log("1️⃣ Checking Account Balance...");
    const balance = await new AccountBalanceQuery()
      .setAccountId(DEPLOYED_CONFIG.operatorId)
      .execute(client);
    console.log(`✅ Account Balance: ${balance.hbars.toString()} HBAR`);

    console.log("\n2️⃣ Verifying HCS Topic...");
    const topicInfo = await new TopicInfoQuery()
      .setTopicId(TopicId.fromString(DEPLOYED_CONFIG.hcsTopicId))
      .execute(client);
    console.log(`✅ HCS Topic Active: ${topicInfo.topicMemo}`);
    console.log(`🔗 HashScan: https://hashscan.io/testnet/topic/${DEPLOYED_CONFIG.hcsTopicId}`);

    console.log("\n3️⃣ Verifying Consent NFT Token...");
    const nftInfo = await new TokenInfoQuery()
      .setTokenId(TokenId.fromString(DEPLOYED_CONFIG.consentNftTokenId))
      .execute(client);
    console.log(`✅ NFT Token: ${nftInfo.name} (${nftInfo.symbol})`);
    console.log(`🔗 HashScan: https://hashscan.io/testnet/token/${DEPLOYED_CONFIG.consentNftTokenId}`);

    console.log("\n4️⃣ Verifying HEAL Token...");
    const healInfo = await new TokenInfoQuery()
      .setTokenId(TokenId.fromString(DEPLOYED_CONFIG.healTokenId))
      .execute(client);
    console.log(`✅ HEAL Token: ${healInfo.name} (${healInfo.symbol})`);
    console.log(`🔗 HashScan: https://hashscan.io/testnet/token/${DEPLOYED_CONFIG.healTokenId}`);

    console.log("\n🎉 DEPLOYMENT VERIFICATION SUCCESSFUL!");
    console.log("\n📋 HACKATHON PROOF LINKS:");
    console.log("=".repeat(50));
    console.log(`HCS Topic: https://hashscan.io/testnet/topic/${DEPLOYED_CONFIG.hcsTopicId}`);
    console.log(`Consent NFT: https://hashscan.io/testnet/token/${DEPLOYED_CONFIG.consentNftTokenId}`);
    console.log(`HEAL Token: https://hashscan.io/testnet/token/${DEPLOYED_CONFIG.healTokenId}`);
    console.log("\n📄 Take screenshots of these HashScan pages for your submission!");

    return {
      verified: true,
      timestamp: new Date().toISOString(),
      hashScanLinks: {
        hcsTopic: `https://hashscan.io/testnet/topic/${DEPLOYED_CONFIG.hcsTopicId}`,
        consentNFT: `https://hashscan.io/testnet/token/${DEPLOYED_CONFIG.consentNftTokenId}`,
        healToken: `https://hashscan.io/testnet/token/${DEPLOYED_CONFIG.healTokenId}`
      }
    };

  } catch (error) {
    console.error("❌ Verification failed:", error);
    console.log("\n🔧 Next Steps:");
    console.log("1. Run: node deploy-hackathon.js (to deploy fresh)");
    console.log("2. Update DEPLOYED_CONFIG with actual deployed IDs");
    console.log("3. Verify account has sufficient HBAR balance");
    throw error;
  }
}

// Run verification
verifyDeployment().catch(console.error);
