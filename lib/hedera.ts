import {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  AccountId,
  Hbar,
  TopicMessageSubmitTransaction,
  TopicId,
} from "@hashgraph/sdk";

// Operator account details
const OPERATOR_ID = AccountId.fromString("0.0.6811703");

// Only initialize if we have a valid private key
let OPERATOR_KEY: PrivateKey | null = null;
let client: Client | null = null;

try {
  const privateKeyString = process.env.NEXT_PUBLIC_HEDERA_PRIVATE_KEY;
  if (privateKeyString && privateKeyString.length > 10) {
    OPERATOR_KEY = PrivateKey.fromString(privateKeyString);
    client = Client.forTestnet().setOperator(OPERATOR_ID, OPERATOR_KEY);
  }
} catch (error) {
  console.warn('Hedera client not initialized - missing or invalid private key');
}

// HCS Topic ID for logging
const TOPIC_ID = TopicId.fromString(process.env.NEXT_PUBLIC_HCS_TOPIC_ID || "0.0.123456");

export interface RegistrationEvent {
  type: "registration";
  walletId: string;
  phoneNumber: string;
  dob: string;
  guardianWallet?: string;
  timestamp: string;
}

export interface LoginEvent {
  type: "login";
  walletId: string;
  timestamp: string;
}

export class HederaLogger {
  /**
   * Create a new custodial wallet on Hedera Testnet
   */
  static async createCustodialWallet(): Promise<{ accountId: string; privateKey: string }> {
    if (!client || !OPERATOR_KEY) {
      // For demo purposes, return a mock wallet when Hedera is not configured
      const mockAccountId = `0.0.${Math.floor(Math.random() * 1000000)}`;
      const mockPrivateKey = PrivateKey.generateED25519().toString();
      
      console.warn('Hedera not configured - returning mock wallet for demo');
      return {
        accountId: mockAccountId,
        privateKey: mockPrivateKey,
      };
    }

    try {
      const newAccountPrivateKey = PrivateKey.generateED25519();
      const newAccountPublicKey = newAccountPrivateKey.publicKey;

      const newAccount = await new AccountCreateTransaction()
        .setKey(newAccountPublicKey)
        .setInitialBalance(Hbar.fromTinybars(1000))
        .execute(client);

      const getReceipt = await newAccount.getReceipt(client);
      const newAccountId = getReceipt.accountId;

      if (!newAccountId) {
        throw new Error("Failed to create account");
      }

      return {
        accountId: newAccountId.toString(),
        privateKey: newAccountPrivateKey.toString(),
      };
    } catch (error) {
      console.error("Error creating custodial wallet:", error);
      throw error;
    }
  }

  /**
   * Log a registration-related event to HCS. Accepts any event shape to support
   * different lifecycle events (e.g., profile_submitted, wallet_linked, registration_complete).
   */
  static async logRegistration(event: any): Promise<string> {
    if (!client) {
      console.warn('Hedera not configured - skipping HCS logging');
      return 'demo-sequence-' + Date.now();
    }

    try {
      const message = JSON.stringify(event);
      
      const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(TOPIC_ID)
        .setMessage(message)
        .execute(client);

      const receipt = await transaction.getReceipt(client);
      return receipt.topicSequenceNumber?.toString() || "";
    } catch (error) {
      console.error("Error logging registration to HCS:", error);
      throw error;
    }
  }

  /**
   * Log login event to HCS. Accepts any to allow flexible payloads if needed.
   */
  static async logLogin(event: any): Promise<string> {
    if (!client) {
      console.warn('Hedera not configured - skipping HCS logging');
      return 'demo-sequence-' + Date.now();
    }

    try {
      const message = JSON.stringify(event);
      
      const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(TOPIC_ID)
        .setMessage(message)
        .execute(client);

      const receipt = await transaction.getReceipt(client);
      return receipt.topicSequenceNumber?.toString() || "";
    } catch (error) {
      console.error("Error logging login to HCS:", error);
      throw error;
    }
  }
}
