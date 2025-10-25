import {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  Hbar,
  TopicCreateTransaction,
  FileCreateTransaction,
  ContractCreateTransaction,
  AccountId
} from "@hashgraph/sdk";

// Generate testnet credentials for development
async function generateTestnetCredentials() {
  // Create operator account (you'll need to fund this)
  const operatorPrivateKey = PrivateKey.generateED25519();
  const operatorPublicKey = operatorPrivateKey.publicKey;

  console.log("🔑 Generated Operator Private Key:", operatorPrivateKey.toString());
  console.log("📋 Generated Public Key:", operatorPublicKey.toString());

  // For testnet, we need an existing funded account to create new accounts
  // Use your HashPack account as operator to create new account
  const client = Client.forTestnet();

  // If you have your HashPack testnet account credentials, uncomment and use:
  /*
  const hashpackOperatorKey = PrivateKey.fromString("YOUR_HASH_PACK_PRIVATE_KEY");
  const hashpackAccountId = "0.0.7123249";
  client.setOperator(hashpackAccountId, hashpackOperatorKey);
  */

  try {
    // Create new account (optional - if you want separate operator account)
    const newAccount = await new AccountCreateTransaction()
      .setKey(operatorPublicKey)
      .setInitialBalance(Hbar.fromTinybars(10000000)) // 10 HBAR
      .execute(client);

    const newAccountReceipt = await newAccount.getReceipt(client);
    const newAccountId = newAccountReceipt.accountId;

    // Create HCS topic
    const topic = await new TopicCreateTransaction()
      .setTopicMemo("MediLedger Consent Logs")
      .execute(client);

    const topicReceipt = await topic.getReceipt(client);
    const topicId = topicReceipt.topicId;

    console.log("✅ New Account ID:", newAccountId?.toString());
    console.log("✅ Topic ID:", topicId?.toString());
    console.log("✅ Private Key:", operatorPrivateKey.toString());

    return {
      accountId: newAccountId?.toString() || "0.0.7123249",
      privateKey: operatorPrivateKey.toString(),
      topicId: topicId?.toString()
    };
  } catch (error) {
    console.log("❌ Error creating account/topic:", error.message);
    console.log("💡 Use your HashPack account directly:");
    console.log("   Account ID: 0.0.7123249");
    console.log("   Private Key:", operatorPrivateKey.toString());
    console.log("   Topic ID: Create manually on portal");
  }
}

// Run: node generate-testnet.js
generateTestnetCredentials();
