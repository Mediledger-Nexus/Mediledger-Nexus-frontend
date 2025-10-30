import {
  Client,
  PrivateKey,
  AccountId,
  TopicId,
  TokenId,
  TopicMessageSubmitTransaction,
  TokenMintTransaction,
  TokenAssociateTransaction,
  TransferTransaction,
  AccountBalanceQuery,
} from "@hashgraph/sdk";

// Test and verify on-chain deployment
async function testOnChainDeployment() {
  console.log("🔍 Testing MediLedger On-Chain Deployment...");

  // Replace with your actual deployed values
  const DEPLOYED_CONFIG = {
    operatorId: "0.0.7123249",
    operatorKey: "YOUR_HASH_PACK_PRIVATE_KEY", // Replace with actual key
    hcsTopicId: "0.0.123456", // Replace with actual deployed topic
    consentNftTokenId: "0.0.123457", // Replace with actual deployed token
    healTokenId: "0.0.123458", // Replace with actual deployed token
  };

  const client = Client.forTestnet().setOperator(DEPLOYED_CONFIG.operatorId, PrivateKey.fromString(DEPLOYED_CONFIG.operatorKey));

  try {
    console.log("1️⃣ Testing HCS Topic...");

    // Submit test message to HCS
    const testMessage = {
      type: "hackathon_demo",
      project: "MediLedger Nexus",
      message: "Healthcare blockchain platform demo",
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    };

    const hcsTx = await new TopicMessageSubmitTransaction()
      .setTopicId(TopicId.fromString(DEPLOYED_CONFIG.hcsTopicId))
      .setMessage(JSON.stringify(testMessage))
      .execute(client);

    const hcsReceipt = await hcsTx.getReceipt(client);
    const sequenceNumber = hcsReceipt.topicSequenceNumber;

    console.log("✅ HCS Message Sent - Sequence:", sequenceNumber?.toString());
    console.log("🔗 HashScan Link:", `https://hashscan.io/testnet/topic/${DEPLOYED_CONFIG.hcsTopicId}/${sequenceNumber}`);

    console.log("\n2️⃣ Testing NFT Token...");

    // Associate token with a test account
    const testAccountId = "0.0.7123249"; // Your HashPack account
    const associateTx = await new TokenAssociateTransaction()
      .setAccountId(AccountId.fromString(testAccountId))
      .setTokenIds([TokenId.fromString(DEPLOYED_CONFIG.consentNftTokenId)])
      .execute(client);

    await associateTx.getReceipt(client);
    console.log("✅ Token Associated Successfully");

    // Mint a test NFT
    const metadata = Buffer.from(JSON.stringify({
      consentId: "demo-consent-123",
      patientDid: "did:hedera:testnet:0.0.123456",
      doctorDid: "did:hedera:testnet:0.0.789012",
      permissions: ["read", "emergency"],
      purpose: "Hackathon Demo - Medical Consultation",
      status: "active"
    }), 'utf8');

    const mintTx = await new TokenMintTransaction()
      .setTokenId(TokenId.fromString(DEPLOYED_CONFIG.consentNftTokenId))
      .setMetadata([metadata])
      .execute(client);

    const mintReceipt = await mintTx.getReceipt(client);
    const nftSerial = mintReceipt.serials[0];

    console.log("✅ NFT Minted - Serial:", nftSerial?.toString());
    console.log("🔗 HashScan Link:", `https://hashscan.io/testnet/token/${DEPLOYED_CONFIG.consentNftTokenId}?serial=${nftSerial}`);

    console.log("\n3️⃣ Testing Token Transfer...");

    // Transfer NFT to demonstrate ownership change
    const transferTx = await new TransferTransaction()
      .addNftTransfer(
        TokenId.fromString(DEPLOYED_CONFIG.consentNftTokenId),
        parseInt(nftSerial?.toString() || "1"),
        AccountId.fromString(DEPLOYED_CONFIG.operatorId),
        AccountId.fromString(testAccountId)
      )
      .execute(client);

    await transferTx.getReceipt(client);
    console.log("✅ NFT Transferred Successfully");
    console.log("🔗 HashScan Link:", `https://hashscan.io/testnet/transaction/${transferTx.transactionId}`);

    console.log("\n🎉 All On-Chain Tests Passed!");
    console.log("\n📋 Proof of Deployment:");
    console.log(`- HCS Topic: ${DEPLOYED_CONFIG.hcsTopicId}`);
    console.log(`- Consent NFT: ${DEPLOYED_CONFIG.consentNftTokenId}`);
    console.log(`- Test Transactions: Available on HashScan`);
    console.log("\n💡 Use these HashScan links as proof for the hackathon!");

    return {
      hcsTopicId: DEPLOYED_CONFIG.hcsTopicId,
      consentNftTokenId: DEPLOYED_CONFIG.consentNftTokenId,
      transactions: {
        hcsMessage: hcsTx.transactionId.toString(),
        nftMint: mintTx.transactionId.toString(),
        nftTransfer: transferTx.transactionId.toString(),
      },
      hashScanLinks: {
        hcsTopic: `https://hashscan.io/testnet/topic/${DEPLOYED_CONFIG.hcsTopicId}`,
        nftToken: `https://hashscan.io/testnet/token/${DEPLOYED_CONFIG.consentNftTokenId}`,
        hcsMessage: `https://hashscan.io/testnet/topic/${DEPLOYED_CONFIG.hcsTopicId}/${sequenceNumber}`,
      }
    };

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

// Run test
testOnChainDeployment().catch(console.error);
