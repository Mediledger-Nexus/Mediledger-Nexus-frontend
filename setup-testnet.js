import {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  Hbar,
  TopicCreateTransaction
} from "@hashgraph/sdk";

// Testnet setup using environment variables (no hardcoded IDs/keys)
// Required env (server-side only, do NOT expose via NEXT_PUBLIC):
// - HEDERA_ACCOUNT_ID
// - HEDERA_PRIVATE_KEY

async function setupTestnet() {
  const operatorId = process.env.HEDERA_ACCOUNT_ID;
  const operatorKeyStr = process.env.HEDERA_PRIVATE_KEY;

  if (!operatorId || !operatorKeyStr) {
    throw new Error(
      "Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY in environment. Set them before running this script."
    );
  }

  const operatorKey = PrivateKey.fromString(operatorKeyStr);
  const client = Client.forTestnet().setOperator(operatorId, operatorKey);

  // Optionally create a new account (comment out if not needed)
  const newAccountPrivateKey = PrivateKey.generateED25519();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;

  const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.fromTinybars(1000000)) // 1 HBAR in tinybars
    .execute(client);
  const newAccountReceipt = await newAccount.getReceipt(client);
  const newAccountId = newAccountReceipt.accountId;

  // Create HCS topic for logging
  const topic = await new TopicCreateTransaction()
    .setTopicMemo("MediLedger Consent Logs (Testnet)")
    .execute(client);
  const topicReceipt = await topic.getReceipt(client);
  const topicId = topicReceipt.topicId;

  console.log("Testnet Operator:", operatorId);
  console.log("New Account ID:", newAccountId?.toString());
  console.log("New Private Key:", newAccountPrivateKey.toString());
  console.log("Topic ID:", topicId?.toString());

  return {
    operatorId,
    accountId: newAccountId?.toString(),
    privateKey: newAccountPrivateKey.toString(),
    topicId: topicId?.toString(),
  };
}

// Run with: HEDERA_ACCOUNT_ID=0.0.x HEDERA_PRIVATE_KEY=302e... node setup-testnet.js
setupTestnet().catch((e) => {
  console.error(e);
  process.exit(1);
});


