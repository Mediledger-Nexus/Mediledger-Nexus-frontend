import {
  Client,
  PrivateKey,
  AccountId,
  TopicCreateTransaction,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenAssociateTransaction,
  TransferTransaction,
  TopicMessageSubmitTransaction,
  Hbar,
} from "@hashgraph/sdk";
import fs from "fs";

// Create deployment proof for hackathon submission
async function createDeploymentProof() {
  console.log("🚀 Creating MediLedger Nexus On-Chain Deployment Proof...\n");

  // ⚠️ REPLACE WITH YOUR ACTUAL HASHPACK CREDENTIALS
  const OPERATOR_ID = "0.0.7123249"; // Your HashPack Account ID
  const OPERATOR_KEY = PrivateKey.fromString("YOUR_HASHPACK_PRIVATE_KEY"); // Your HashPack Private Key

  console.log("🔑 Using Account:", OPERATOR_ID);
  console.log("🌐 Network: testnet\n");

  const client = Client.forTestnet().setOperator(OPERATOR_ID, OPERATOR_KEY);

  try {
    // 1️⃣ CREATE HCS TOPIC FOR AUDIT LOGS
    console.log("📝 Creating HCS Topic for MediLedger Audit Logs...");
    const hcsTopic = await new TopicCreateTransaction()
      .setTopicMemo("MediLedger Nexus - Healthcare Consent & Audit System | Hackathon Demo")
      .setAdminKey(OPERATOR_KEY)
      .setSubmitKey(OPERATOR_KEY)
      .execute(client);

    const hcsReceipt = await hcsTopic.getReceipt(client);
    const hcsTopicId = hcsReceipt.topicId;
    console.log("✅ HCS Topic Created:", hcsTopicId?.toString());

    // 2️⃣ CREATE CONSENT NFT TOKEN
    console.log("\n🎫 Creating MediLedger Consent NFT Token...");
    const consentNFT = await new TokenCreateTransaction()
      .setTokenName("MediLedger Consent NFT")
      .setTokenSymbol("MEDICONSENT")
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Infinite)
      .setInitialSupply(0)
      .setMaxSupply(1000)
      .setTokenMemo("NFT tokens for medical data consent permissions - Hedera Africa Hackathon")
      .setAdminKey(OPERATOR_KEY)
      .setSupplyKey(OPERATOR_KEY)
      .setFeeScheduleKey(OPERATOR_KEY)
      .execute(client);

    const nftReceipt = await consentNFT.getReceipt(client);
    const consentTokenId = nftReceipt.tokenId;
    console.log("✅ Consent NFT Token Created:", consentTokenId?.toString());

    // 3️⃣ CREATE HEAL REWARD TOKEN
    console.log("\n🏥 Creating HEAL Reward Token...");
    const healToken = await new TokenCreateTransaction()
      .setTokenName("MediLedger HEAL Token")
      .setTokenSymbol("HEAL")
      .setTokenType(TokenType.FungibleCommon)
      .setSupplyType(TokenSupplyType.Infinite)
      .setInitialSupply(0)
      .setMaxSupply(1000000000000) // 1 trillion max supply
      .setDecimals(8)
      .setTokenMemo("Healthcare reward token for data sharing incentives - Hackathon Demo")
      .setAdminKey(OPERATOR_KEY)
      .setSupplyKey(OPERATOR_KEY)
      .setFeeScheduleKey(OPERATOR_KEY)
      .execute(client);

    const healReceipt = await healToken.getReceipt(client);
    const healTokenId = healReceipt.tokenId;
    console.log("✅ HEAL Token Created:", healTokenId?.toString());

    // 4️⃣ MINT DEMO CONSENT NFT
    console.log("\n🎨 Minting Demo Consent NFT...");
    const demoMetadata = Buffer.from(JSON.stringify({
      consentId: "hackathon-demo-consent",
      patientDid: "did:hedera:testnet:0.0.123456",
      doctorDid: "did:hedera:testnet:0.0.789012",
      permissions: ["read", "emergency"],
      dataTypes: ["medical_history", "lab_results"],
      purpose: "Hedera Africa Hackathon Demo - Emergency Medical Consultation",
      status: "active",
      hackathonProof: true,
      deployedBy: OPERATOR_ID
    }), 'utf8');

import {
  Client,
  PrivateKey,
  AccountId,
  TopicCreateTransaction,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenAssociateTransaction,
  TransferTransaction,
  TopicMessageSubmitTransaction,
  Hbar,
  TokenId,
} from "@hashgraph/sdk";
import fs from "fs";

// Create deployment proof for hackathon submission
async function createDeploymentProof() {
  console.log("🚀 Creating MediLedger Nexus On-Chain Deployment Proof...\n");

  // ⚠️ REPLACE WITH YOUR ACTUAL HASHPACK CREDENTIALS
  const OPERATOR_ID = "0.0.7123249"; // Your HashPack Account ID
  const OPERATOR_KEY = PrivateKey.fromString("YOUR_HASHPACK_PRIVATE_KEY"); // Your HashPack Private Key

  console.log("🔑 Using Account:", OPERATOR_ID);
  console.log("🌐 Network: testnet\n");

  const client = Client.forTestnet().setOperator(OPERATOR_ID, OPERATOR_KEY);

  try {
    // 1️⃣ CREATE HCS TOPIC FOR AUDIT LOGS
    console.log("📝 Creating HCS Topic for MediLedger Audit Logs...");
    const hcsTopic = await new TopicCreateTransaction()
      .setTopicMemo("MediLedger Nexus - Healthcare Consent & Audit System | Hackathon Demo")
      .setAdminKey(OPERATOR_KEY)
      .setSubmitKey(OPERATOR_KEY)
      .execute(client);

    const hcsReceipt = await hcsTopic.getReceipt(client);
    const hcsTopicId = hcsReceipt.topicId;
    console.log("✅ HCS Topic Created:", hcsTopicId?.toString());

    // 2️⃣ CREATE CONSENT NFT TOKEN
    console.log("\n🎫 Creating MediLedger Consent NFT Token...");
    const consentNFT = await new TokenCreateTransaction()
      .setTokenName("MediLedger Consent NFT")
      .setTokenSymbol("MEDICONSENT")
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Infinite)
      .setInitialSupply(0)
      .setMaxSupply(1000)
      .setTokenMemo("NFT tokens for medical data consent permissions - Hedera Africa Hackathon")
      .setAdminKey(OPERATOR_KEY)
      .setSupplyKey(OPERATOR_KEY)
      .setFeeScheduleKey(OPERATOR_KEY)
      .execute(client);

    const nftReceipt = await consentNFT.getReceipt(client);
    const consentTokenId = nftReceipt.tokenId;

    if (!consentTokenId) {
      throw new Error("Failed to create consent NFT token");
    }

    console.log("✅ Consent NFT Token Created:", consentTokenId.toString());

    // 3️⃣ CREATE HEAL REWARD TOKEN
    console.log("\n🏥 Creating HEAL Reward Token...");
    const healToken = await new TokenCreateTransaction()
      .setTokenName("MediLedger HEAL Token")
      .setTokenSymbol("HEAL")
      .setTokenType(TokenType.FungibleCommon)
      .setSupplyType(TokenSupplyType.Infinite)
      .setInitialSupply(0)
      .setMaxSupply(1000000000000) // 1 trillion max supply
      .setDecimals(8)
      .setTokenMemo("Healthcare reward token for data sharing incentives - Hackathon Demo")
      .setAdminKey(OPERATOR_KEY)
      .setSupplyKey(OPERATOR_KEY)
      .setFeeScheduleKey(OPERATOR_KEY)
      .execute(client);

    const healReceipt = await healToken.getReceipt(client);
    const healTokenId = healReceipt.tokenId;

    if (!healTokenId) {
      throw new Error("Failed to create HEAL token");
    }

    console.log("✅ HEAL Token Created:", healTokenId.toString());

    // 4️⃣ MINT DEMO CONSENT NFT
    console.log("\n🎨 Minting Demo Consent NFT...");
    const demoMetadata = Buffer.from(JSON.stringify({
      consentId: "hackathon-demo-consent",
      patientDid: "did:hedera:testnet:0.0.123456",
      doctorDid: "did:hedera:testnet:0.0.789012",
      permissions: ["read", "emergency"],
      dataTypes: ["medical_history", "lab_results"],
      purpose: "Hedera Africa Hackathon Demo - Emergency Medical Consultation",
      status: "active",
      hackathonProof: true,
      deployedBy: OPERATOR_ID
    }), 'utf8');

    const mintTx = await new TokenMintTransaction()
      .setTokenId(consentTokenId)
      .setMetadata([demoMetadata])
      .execute(client);

    const mintReceipt = await mintTx.getReceipt(client);
    const nftSerial = mintReceipt.serials[0];
    console.log("✅ Demo NFT Minted - Serial:", nftSerial?.toString());

    // 5️⃣ LOG TO HCS FOR AUDIT TRAIL
    console.log("\n📋 Logging to HCS for audit trail...");
    const auditMessage = {
      type: "hackathon_deployment",
      project: "MediLedger Nexus",
      action: "deployment_verification",
      nftTokenId: consentTokenId.toString(),
      healTokenId: healTokenId.toString(),
      hcsTopicId: hcsTopicId?.toString(),
      timestamp: new Date().toISOString(),
      purpose: "Hedera Africa Hackathon proof of on-chain deployment",
      network: "testnet",
      operator: OPERATOR_ID
    };

    if (!hcsTopicId) {
      throw new Error("HCS Topic ID is null");
    }

    const hcsMessageTx = await new TopicMessageSubmitTransaction()
      .setTopicId(hcsTopicId)
      .setMessage(JSON.stringify(auditMessage))
      .execute(client);

    const hcsMessageReceipt = await hcsMessageTx.getReceipt(client);
    const sequenceNumber = hcsMessageReceipt.topicSequenceNumber;
    console.log("✅ HCS Message Logged - Sequence:", sequenceNumber?.toString());

    // 6️⃣ GENERATE PROOF DOCUMENT
    const deploymentProof = {
      project: "MediLedger Nexus - Healthcare Blockchain Platform",
      hackathon: "Hedera Africa Hackathon 2025",
      deployedBy: OPERATOR_ID,
      deploymentDate: new Date().toISOString(),
      network: "testnet",
      blockchainAssets: {
        hcsTopic: {
          id: hcsTopicId.toString(),
          transactionId: hcsTopic.transactionId.toString(),
          hashScanUrl: `https://hashscan.io/testnet/topic/${hcsTopicId}`,
          messageSequence: sequenceNumber?.toString(),
          messageHashScanUrl: `https://hashscan.io/testnet/topic/${hcsTopicId}/${sequenceNumber}`
        },
        consentNFT: {
          tokenId: consentTokenId.toString(),
          transactionId: consentNFT.transactionId.toString(),
          hashScanUrl: `https://hashscan.io/testnet/token/${consentTokenId}`,
          demoSerial: nftSerial?.toString(),
          serialHashScanUrl: `https://hashscan.io/testnet/token/${consentTokenId}?serial=${nftSerial}`,
          mintTransactionId: mintTx.transactionId.toString(),
          mintHashScanUrl: `https://hashscan.io/testnet/transaction/${mintTx.transactionId}`
        },
        healToken: {
          tokenId: healTokenId.toString(),
          transactionId: healToken.transactionId.toString(),
          hashScanUrl: `https://hashscan.io/testnet/token/${healTokenId}`
        }
      },
      transactionHashes: {
        hcsTopicCreation: hcsTopic.transactionId.toString(),
        consentNFTCreation: consentNFT.transactionId.toString(),
        healTokenCreation: healToken.transactionId.toString(),
        demoNFTMint: mintTx.transactionId.toString(),
        hcsAuditMessage: hcsMessageTx.transactionId.toString()
      },
      features: [
        "NFT-based medical consent system",
        "HCS audit logging for healthcare compliance",
        "Token rewards for data sharing",
        "Emergency access protocols",
        "Zero-knowledge AI integration",
        "HIPAA/GDPR compliance"
      ],
      verification: "All transactions verifiable on HashScan blockchain explorer"
    };

    // Save proof to file
    fs.writeFileSync('deployment-proof.json', JSON.stringify(deploymentProof, null, 2));
    console.log("\n📄 Deployment proof saved to: deployment-proof.json");

    // 7️⃣ DISPLAY RESULTS
    console.log("\n" + "=".repeat(60));
    console.log("🏆 HEDERA AFRICA HACKATHON - DEPLOYMENT PROOF");
    console.log("=".repeat(60));
    console.log(`📅 Deployment Date: ${new Date().toLocaleString()}`);
    console.log(`👤 Deployed By: ${OPERATOR_ID}`);
    console.log(`🌐 Network: Hedera Testnet`);
    console.log("\n🔗 VERIFICATION LINKS:");
    console.log(`HCS Topic: ${deploymentProof.blockchainAssets.hcsTopic.hashScanUrl}`);
    console.log(`Consent NFT: ${deploymentProof.blockchainAssets.consentNFT.hashScanUrl}`);
    console.log(`HEAL Token: ${deploymentProof.blockchainAssets.healToken.hashScanUrl}`);
    console.log(`Demo NFT: ${deploymentProof.blockchainAssets.consentNFT.serialHashScanUrl}`);
    console.log("\n📋 TRANSACTION HASHES:");
    console.log(`Topic Creation: ${deploymentProof.transactionHashes.hcsTopicCreation}`);
    console.log(`NFT Creation: ${deploymentProof.transactionHashes.consentNFTCreation}`);
    console.log(`Token Creation: ${deploymentProof.transactionHashes.healTokenCreation}`);
    console.log(`NFT Mint: ${deploymentProof.transactionHashes.demoNFTMint}`);
    console.log(`HCS Message: ${deploymentProof.transactionHashes.hcsAuditMessage}`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ SUCCESS: All blockchain assets deployed and verified!");
    console.log("💯 Ready for hackathon submission with HashScan proof!");
    console.log("=".repeat(60));

    return deploymentProof;

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Ensure you have testnet HBAR in your HashPack wallet");
    console.log("2. Verify your private key format starts with '302e0201'");
    console.log("3. Check your account has enough balance for transactions");
    console.log("4. Make sure you're using testnet (not mainnet)");

    throw error;
  }
}

// Run deployment
console.log("🎯 MediLedger Nexus - Hedera Africa Hackathon 2025");
console.log("🚀 Starting on-chain deployment for hackathon proof...\n");

createDeploymentProof().catch(console.error);

    const mintReceipt = await mintTx.getReceipt(client);
    const nftSerial = mintReceipt.serials[0];
    console.log("✅ Demo NFT Minted - Serial:", nftSerial?.toString());

    // 5️⃣ LOG TO HCS FOR AUDIT TRAIL
    console.log("\n📋 Logging to HCS for audit trail...");
    const auditMessage = {
      type: "hackathon_deployment",
      project: "MediLedger Nexus",
      action: "deployment_verification",
      nftTokenId: consentTokenId?.toString(),
      healTokenId: healTokenId?.toString(),
      hcsTopicId: hcsTopicId?.toString(),
      timestamp: new Date().toISOString(),
      purpose: "Hedera Africa Hackathon proof of on-chain deployment",
      network: "testnet",
      operator: OPERATOR_ID
    };

    const hcsMessageTx = await new TopicMessageSubmitTransaction()
      .setTopicId(hcsTopicId!)
      .setMessage(JSON.stringify(auditMessage))
      .execute(client);

    const hcsMessageReceipt = await hcsMessageTx.getReceipt(client);
    const sequenceNumber = hcsMessageReceipt.topicSequenceNumber;
    console.log("✅ HCS Message Logged - Sequence:", sequenceNumber?.toString());

    // 6️⃣ GENERATE PROOF DOCUMENT
    const deploymentProof = {
      project: "MediLedger Nexus - Healthcare Blockchain Platform",
      hackathon: "Hedera Africa Hackathon 2025",
      deployedBy: OPERATOR_ID,
      deploymentDate: new Date().toISOString(),
      network: "testnet",
      blockchainAssets: {
        hcsTopic: {
          id: hcsTopicId?.toString(),
          transactionId: hcsTopic.transactionId.toString(),
          hashScanUrl: `https://hashscan.io/testnet/topic/${hcsTopicId}`,
          messageSequence: sequenceNumber?.toString(),
          messageHashScanUrl: `https://hashscan.io/testnet/topic/${hcsTopicId}/${sequenceNumber}`
        },
        consentNFT: {
          tokenId: consentTokenId?.toString(),
          transactionId: consentNFT.transactionId.toString(),
          hashScanUrl: `https://hashscan.io/testnet/token/${consentTokenId}`,
          demoSerial: nftSerial?.toString(),
          serialHashScanUrl: `https://hashscan.io/testnet/token/${consentTokenId}?serial=${nftSerial}`,
          mintTransactionId: mintTx.transactionId.toString(),
          mintHashScanUrl: `https://hashscan.io/testnet/transaction/${mintTx.transactionId}`
        },
        healToken: {
          tokenId: healTokenId?.toString(),
          transactionId: healToken.transactionId.toString(),
          hashScanUrl: `https://hashscan.io/testnet/token/${healTokenId}`
        }
      },
      transactionHashes: {
        hcsTopicCreation: hcsTopic.transactionId.toString(),
        consentNFTCreation: consentNFT.transactionId.toString(),
        healTokenCreation: healToken.transactionId.toString(),
        demoNFTMint: mintTx.transactionId.toString(),
        hcsAuditMessage: hcsMessageTx.transactionId.toString()
      },
      features: [
        "NFT-based medical consent system",
        "HCS audit logging for healthcare compliance",
        "Token rewards for data sharing",
        "Emergency access protocols",
        "Zero-knowledge AI integration",
        "HIPAA/GDPR compliance"
      ],
      verification: "All transactions verifiable on HashScan blockchain explorer"
    };

    // Save proof to file
    fs.writeFileSync('deployment-proof.json', JSON.stringify(deploymentProof, null, 2));
    console.log("\n📄 Deployment proof saved to: deployment-proof.json");

    // 7️⃣ DISPLAY RESULTS
    console.log("\n" + "=".repeat(60));
    console.log("🏆 HEDERA AFRICA HACKATHON - DEPLOYMENT PROOF");
    console.log("=".repeat(60));
    console.log(`📅 Deployment Date: ${new Date().toLocaleString()}`);
    console.log(`👤 Deployed By: ${OPERATOR_ID}`);
    console.log(`🌐 Network: Hedera Testnet`);
    console.log("\n🔗 VERIFICATION LINKS:");
    console.log(`HCS Topic: ${deploymentProof.blockchainAssets.hcsTopic.hashScanUrl}`);
    console.log(`Consent NFT: ${deploymentProof.blockchainAssets.consentNFT.hashScanUrl}`);
    console.log(`HEAL Token: ${deploymentProof.blockchainAssets.healToken.hashScanUrl}`);
    console.log(`Demo NFT: ${deploymentProof.blockchainAssets.consentNFT.serialHashScanUrl}`);
    console.log("\n📋 TRANSACTION HASHES:");
    console.log(`Topic Creation: ${deploymentProof.transactionHashes.hcsTopicCreation}`);
    console.log(`NFT Creation: ${deploymentProof.transactionHashes.consentNFTCreation}`);
    console.log(`Token Creation: ${deploymentProof.transactionHashes.healTokenCreation}`);
    console.log(`NFT Mint: ${deploymentProof.transactionHashes.demoNFTMint}`);
    console.log(`HCS Message: ${deploymentProof.transactionHashes.hcsAuditMessage}`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ SUCCESS: All blockchain assets deployed and verified!");
    console.log("💯 Ready for hackathon submission with HashScan proof!");
    console.log("=".repeat(60));

    return deploymentProof;

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Ensure you have testnet HBAR in your HashPack wallet");
    console.log("2. Verify your private key format starts with '302e0201'");
    console.log("3. Check your account has enough balance for transactions");
    console.log("4. Make sure you're using testnet (not mainnet)");

    throw error;
  }
}

// Run deployment
console.log("🎯 MediLedger Nexus - Hedera Africa Hackathon 2025");
console.log("🚀 Starting on-chain deployment for hackathon proof...\n");

createDeploymentProof().catch(console.error);
