import {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  Hbar,
  TopicCreateTransaction,
  TopicId
} from "@hashgraph/sdk";

// Create mainnet account and topic
async function setupMainnet() {
  const operatorKey = PrivateKey.fromString("YOUR_HASH_PACK_ACCOUNT_PRIVATE_KEY");
  const operatorId = "0.0.9322372"; // Your HashPack account

  const client = Client.forMainnet().setOperator(operatorId, operatorKey);

  // Create new operator account (optional if you want a separate one)
  const newAccountPrivateKey = PrivateKey.generateED25519();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;

  const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.fromTinybars(1000000)) // 1 HBAR
    .execute(client);

  const newAccountReceipt = await newAccount.getReceipt(client);
  const newAccountId = newAccountReceipt.accountId;

  // Create HCS topic
  const topic = await new TopicCreateTransaction()
    .setTopicMemo("MediLedger Consent Logs")
    .execute(client);

  const topicReceipt = await topic.getReceipt(client);
  const topicId = topicReceipt.topicId;

  console.log("New Account ID:", newAccountId.toString());
  console.log("New Private Key:", newAccountPrivateKey.toString());
  console.log("Topic ID:", topicId.toString());

  return {
    accountId: newAccountId.toString(),
    privateKey: newAccountPrivateKey.toString(),
    topicId: topicId.toString()
  };
}

// Run with: node setup-mainnet.js
setupMainnet().catch(console.error);
