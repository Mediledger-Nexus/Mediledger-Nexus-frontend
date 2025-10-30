import {
  Client,
  PrivateKey,
  AccountId,
  TopicCreateTransaction,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar,
} from "@hashgraph/sdk";

// Deploy MediLedger Nexus on-chain assets
async function deployMediLedgerOnChain() {
  console.log("🚀 Deploying MediLedger Nexus on Hedera...");

  // Use your HashPack testnet account
  const OPERATOR_ID = "0.0.7123249"; // Your HashPack account ID
  const OPERATOR_KEY = PrivateKey.fromString("YOUR_HASH_PACK_PRIVATE_KEY"); // Replace with your actual key

  const client = Client.forTestnet().setOperator(OPERATOR_ID, OPERATOR_KEY);

  try {
    console.log("📝 Creating HCS Topic for audit logs...");

    // Create HCS Topic for MediLedger audit logs
    const hcsTopic = await new TopicCreateTransaction()
      .setTopicMemo("MediLedger Nexus - Healthcare Consent & Audit Logs")
      .setAdminKey(OPERATOR_KEY)
      .setSubmitKey(OPERATOR_KEY)
      .execute(client);

    const hcsReceipt = await hcsTopic.getReceipt(client);
    const hcsTopicId = hcsReceipt.topicId;

    console.log("✅ HCS Topic Created:", hcsTopicId?.toString());

    // Create Consent NFT Token
    console.log("🎫 Creating Consent NFT Token...");

    const consentNFT = await new TokenCreateTransaction()
      .setTokenName("MediLedger Consent NFT")
      .setTokenSymbol("MEDICONSENT")
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Infinite)
      .setInitialSupply(0)
      .setMaxSupply(0)
      .setTokenMemo("NFT tokens representing medical data consent permissions")
      .setAdminKey(OPERATOR_KEY)
      .setSupplyKey(OPERATOR_KEY)
      .setFeeScheduleKey(OPERATOR_KEY)
      .execute(client);

    const nftReceipt = await consentNFT.getReceipt(client);
    const consentTokenId = nftReceipt.tokenId;

    console.log("✅ Consent NFT Token Created:", consentTokenId?.toString());

    // Create HEAL Reward Token (for incentivizing consent)
    console.log("🏥 Creating HEAL Reward Token...");

    const healToken = await new TokenCreateTransaction()
      .setTokenName("MediLedger HEAL Token")
      .setTokenSymbol("HEAL")
      .setTokenType(TokenType.FungibleCommon)
      .setSupplyType(TokenSupplyType.Infinite)
      .setInitialSupply(0)
      .setMaxSupply(1000000000000) // 1 trillion max supply
      .setDecimals(8)
      .setTokenMemo("Reward token for healthcare data sharing and consent")
      .setAdminKey(OPERATOR_KEY)
      .setSupplyKey(OPERATOR_KEY)
      .setFeeScheduleKey(OPERATOR_KEY)
      .execute(client);

    const healReceipt = await healToken.getReceipt(client);
    const healTokenId = healReceipt.tokenId;

    console.log("✅ HEAL Token Created:", healTokenId?.toString());

    // Save deployment info
    const deployment = {
      network: "testnet",
      operatorAccount: OPERATOR_ID,
      hcsTopicId: hcsTopicId?.toString(),
      consentNftTokenId: consentTokenId?.toString(),
      healTokenId: healTokenId?.toString(),
      deployedAt: new Date().toISOString(),
      transactionHashes: {
        hcsTopic: hcsTopic.transactionId.toString(),
        consentNFT: consentNFT.transactionId.toString(),
        healToken: healToken.transactionId.toString(),
      }
    };

    console.log("\n🎉 Deployment Complete!");
    console.log("📋 Deployment Info:", JSON.stringify(deployment, null, 2));

    console.log("\n🔗 Verify on HashScan:");
    console.log(`HCS Topic: https://hashscan.io/testnet/topic/${hcsTopicId}`);
    console.log(`Consent NFT: https://hashscan.io/testnet/token/${consentTokenId}`);
    console.log(`HEAL Token: https://hashscan.io/testnet/token/${healTokenId}`);

    console.log("\n📝 Update your .env.local file:");
    console.log(`HCS_TOPIC_ID=${hcsTopicId}`);
    console.log(`CONSENT_NFT_TOKEN_ID=${consentTokenId}`);
    console.log(`HEAL_TOKEN_ID=${healTokenId}`);

    return deployment;

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

// Run deployment
deployMediLedgerOnChain().catch(console.error);
