import {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  AccountId,
  Hbar,
  TopicMessageSubmitTransaction,
  TopicId,
} from "@hashgraph/sdk";

// Resolve network from env (prefer server env, fallback to public for legacy)
const NETWORK = (process.env.HEDERA_NETWORK || process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet').toLowerCase();
// Feature flag: enable HCS logging explicitly from env
const ENABLE_HCS = (process.env.NEXT_PUBLIC_ENABLE_HCS || 'false').toLowerCase() === 'true';

// Only initialize if we have a valid operator account and private key
let OPERATOR_KEY: PrivateKey | null = null;
let OPERATOR_ID: AccountId | null = null;
let client: Client | null = null;

try {
  // Use server-only env names when available
  const privateKeyString = process.env.HEDERA_PRIVATE_KEY || process.env.NEXT_PUBLIC_HEDERA_PRIVATE_KEY;
  const operatorIdString = process.env.HEDERA_ACCOUNT_ID || process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID;
  if (privateKeyString && privateKeyString.length > 10 && operatorIdString) {
    OPERATOR_KEY = PrivateKey.fromString(privateKeyString);
    OPERATOR_ID = AccountId.fromString(operatorIdString);

    // Pick client by network
    const networkClient = NETWORK === 'mainnet'
      ? Client.forMainnet()
      : NETWORK === 'previewnet'
        ? Client.forPreviewnet()
        : Client.forTestnet();

    client = networkClient.setOperator(OPERATOR_ID, OPERATOR_KEY);
  }
} catch (error) {
  // Silent: client remains null when not configured
}

// HCS Topic ID for logging (prefer server env)
const TOPIC_ID = TopicId.fromString(process.env.HCS_TOPIC_ID || process.env.NEXT_PUBLIC_HCS_TOPIC_ID || "0.0.123456");

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
    // Explicitly disabled by flag
    if (!ENABLE_HCS) {
      return 'hcs-disabled';
    }
    // If running in the browser, proxy to API for secure server-side logging
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const resp = await fetch(`${origin}/api/hcs/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ type: 'registration', event }),
      });
      if (!resp.ok) {
        // When server not configured, do not break the app
        return 'hcs-unconfigured';
      }
      const data = await resp.json();
      return data.sequence || '';
    }

    if (!client) {
      return 'demo-sequence-' + Date.now();
    }

    try {
      const message = JSON.stringify(event);
      const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(TOPIC_ID)
        .setMessage(message)
        .execute(client);
      const receipt = await transaction.getReceipt(client);
      return receipt.topicSequenceNumber?.toString() || '';
    } catch (error) {
      console.error('Error logging registration to HCS:', error);
      throw error;
    }
  }

  /**
   * Log login event to HCS. Accepts any to allow flexible payloads if needed.
   */
  static async logLogin(event: any): Promise<string> {
    if (!ENABLE_HCS) {
      return 'hcs-disabled';
    }
    // Browser: proxy to API
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const resp = await fetch(`${origin}/api/hcs/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ type: 'login', event }),
      });
      if (!resp.ok) {
        return 'hcs-unconfigured';
      }
      const data = await resp.json();
      return data.sequence || '';
    }

    if (!client) {
      return 'demo-sequence-' + Date.now();
    }

    try {
      const message = JSON.stringify(event);
      const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(TOPIC_ID)
        .setMessage(message)
        .execute(client);
      const receipt = await transaction.getReceipt(client);
      return receipt.topicSequenceNumber?.toString() || '';
    } catch (error) {
      console.error('Error logging login to HCS:', error);
      throw error;
    }
  }
}
