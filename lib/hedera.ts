import {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  AccountId,
  Hbar,
  TopicMessageSubmitTransaction,
  TopicId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenBurnTransaction,
  TokenAssociateTransaction,
  TransferTransaction,
  AccountBalanceQuery,
  TokenId,
} from "@hashgraph/sdk";

// Resolve network from env (prefer server env, fallback to public for legacy)
const NETWORK = (process.env.HEDERA_NETWORK || process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet').toLowerCase();
// Feature flag: enable HCS logging explicitly from env
const ENABLE_HCS = (process.env.NEXT_PUBLIC_ENABLE_HCS || 'false').toLowerCase() === 'true';

// Only initialize if we have a valid operator account and private key
export let OPERATOR_KEY: PrivateKey | null = null;
export let OPERATOR_ID: AccountId | null = null;
export let client: Client | null = null;

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

// Consent NFT Token ID (create via API or env)
let CONSENT_NFT_TOKEN_ID: TokenId | null = null;
try {
  const tokenIdStr = process.env.CONSENT_NFT_TOKEN_ID || process.env.NEXT_PUBLIC_CONSENT_NFT_TOKEN_ID;
  if (tokenIdStr) {
    CONSENT_NFT_TOKEN_ID = TokenId.fromString(tokenIdStr);
  }
} catch (error) {
  console.warn('Consent NFT Token ID not configured');
}

export interface ConsentNFTMetadata {
  consentId: string;
  recordId: string;
  patientDID: string;
  doctorDID: string;
  fileCID: string;
  reason: string;
  expiresAt: string;
}

export interface ConsentEvent {
  type: 'consent_granted' | 'consent_revoked' | 'consent_viewed';
  consentId: string;
  patientDID: string;
  doctorDID: string;
  recordId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export class HederaLogger {
  /**
   * Mint a consent NFT to the doctor's wallet using HTS
   */
  static async mintConsentNFT(
    doctorAccountId: string,
    metadata: ConsentNFTMetadata
  ): Promise<{ tokenId: string; serialNumber: string }> {
    if (!client || !OPERATOR_KEY) {
      throw new Error('Hedera not configured');
    }

    try {
      // Ensure token exists or create it
      let tokenId = CONSENT_NFT_TOKEN_ID;
      if (!tokenId) {
        // Create consent NFT token
        const createTx = await new TokenCreateTransaction()
          .setTokenName("MediLedger Consent NFT")
          .setTokenSymbol("MLC")
          .setTokenType(TokenType.NonFungibleUnique)
          .setSupplyType(TokenSupplyType.Infinite)
          .setInitialSupply(0)
          .setMaxSupply(0)
          .setTokenMemo("NFT for medical record consent")
          .setAdminKey(OPERATOR_KEY)
          .setSupplyKey(OPERATOR_KEY)
          .execute(client);

        const createReceipt = await createTx.getReceipt(client);
        tokenId = createReceipt.tokenId;

        if (!tokenId) {
          throw new Error('Failed to create consent NFT token');
        }

        // Store token ID for future use (in production, save to env or DB)
        CONSENT_NFT_TOKEN_ID = tokenId;
      }

      // Associate token with doctor's account if needed
      const doctorAccount = AccountId.fromString(doctorAccountId);
      const associateTx = await new TokenAssociateTransaction()
        .setAccountId(doctorAccount)
        .setTokenIds([tokenId])
        .execute(client);
      await associateTx.getReceipt(client);

      // Mint NFT with metadata
      const metadataBytes = Buffer.from(JSON.stringify(metadata), 'utf8');
      const mintTx = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata([metadataBytes])
        .execute(client);

      const mintReceipt = await mintTx.getReceipt(client);
      const serialNumber = mintReceipt.serials[0]?.toString() || '';

      // Transfer NFT to doctor
      const transferTx = await new TransferTransaction()
        .addNftTransfer(tokenId, parseInt(serialNumber), OPERATOR_ID!, doctorAccount)
        .execute(client);
      await transferTx.getReceipt(client);

      return {
        tokenId: tokenId.toString(),
        serialNumber,
      };
    } catch (error) {
      console.error('Error minting consent NFT:', error);
      throw error;
    }
  }

  /**
   * Burn a consent NFT when revoked
   */
  static async burnConsentNFT(
    tokenId: string,
    serialNumber: string,
    ownerAccountId: string
  ): Promise<void> {
    if (!client || !OPERATOR_KEY) {
      throw new Error('Hedera not configured');
    }

    try {
      const nftTokenId = TokenId.fromString(tokenId);
      const ownerAccount = AccountId.fromString(ownerAccountId);

      // Transfer NFT back to operator for burning
      const transferTx = await new TransferTransaction()
        .addNftTransfer(nftTokenId, parseInt(serialNumber), ownerAccount, OPERATOR_ID!)
        .execute(client);
      await transferTx.getReceipt(client);

      // Burn the NFT
      const burnTx = await new TokenBurnTransaction()
        .setTokenId(nftTokenId)
        .setSerials([parseInt(serialNumber)])
        .execute(client);
      await burnTx.getReceipt(client);
    } catch (error) {
      console.error('Error burning consent NFT:', error);
      throw error;
    }
  }

  /**
   * Check if doctor holds a specific consent NFT
   */
  static async verifyConsentNFT(
    tokenId: string,
    serialNumber: string,
    doctorAccountId: string
  ): Promise<boolean> {
    if (!client) {
      return false; // Demo mode
    }

    try {
      const nftTokenId = TokenId.fromString(tokenId);
      const doctorAccount = AccountId.fromString(doctorAccountId);

      // Query NFT balance
      const balance = await new AccountBalanceQuery()
        .setAccountId(doctorAccount)
        .execute(client);

      const nftBalance = balance.tokens.get(nftTokenId);
      if (!nftBalance) {
        return false;
      }

      // Check if serial number is in balance
      return nftBalance.serials.includes(parseInt(serialNumber));
    } catch (error) {
      console.error('Error verifying consent NFT:', error);
      return false;
    }
  }

  /**
   * Log a consent event to HCS
   */
  static async logConsentEvent(event: ConsentEvent): Promise<string> {
    return await HederaLogger.logRegistration(event); // Reuse existing HCS logging
  }

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
