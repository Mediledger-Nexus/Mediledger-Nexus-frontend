import {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenAssociateTransaction,
  TransferTransaction,
  AccountId,
  PrivateKey,
  TokenId,
  Hbar,
  TokenInfoQuery,
  TokenNftInfoQuery,
  Status,
  StatusError,
  TokenWipeTransaction,
  TokenBurnTransaction,
  TransactionResponse,
  TransactionReceipt,
  TransactionId
} from "@hashgraph/sdk";

// Import HEAL token service for rewards
import HEALTokenService from './healTokenService';

// Simple UUID generator using crypto.randomUUID
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Types for our NFT consent system
export interface ConsentNFTMetadata {
  consentId: string;
  patientDid: string;
  doctorDid: string;
  permissions: string[];
  grantedAt: string;
  expiresAt?: string;
  dataTypes: string[];
  purpose: string;
  status: 'active' | 'revoked' | 'expired';
}

export interface ConsentGrant {
  id: string;
  nftTokenId: string;
  nftSerialNumber: number;
  metadata: ConsentNFTMetadata;
  transactionHash: string;
  blockNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsentPermission {
  type: 'read' | 'write' | 'view' | 'share' | 'emergency';
  scope: string[];
  conditions?: Record<string, any>;
}

export interface ConsentRequest {
  id: string;
  patientDid: string;
  requesterDid: string;
  permissions: ConsentPermission[];
  dataTypes: string[];
  purpose: string;
  expiryDays: number;
  status: 'pending' | 'granted' | 'denied';
  createdAt: Date;
  updatedAt: Date;
}

export class NFTConsentService {
  private static CONSENT_TOKEN_ID: TokenId | null = null;
  private static readonly TOKEN_SYMBOL = 'MLNCONSENT';
  private static readonly TOKEN_NAME = 'MediLedger Consent NFT';
  private static readonly MAX_SUPPLY = 1000;

  // Demo mode - return mock data when Hedera is not configured
  private static readonly DEMO_MODE = process.env.NEXT_PUBLIC_HEDERA_NETWORK !== 'mainnet';

  /**
   * Initialize the consent token if it doesn't exist
   */
  static async initializeConsentToken(): Promise<TokenId> {
    if (this.CONSENT_TOKEN_ID) {
      return this.CONSENT_TOKEN_ID;
    }

    if (this.DEMO_MODE) {
      // Return a mock token ID for demo purposes
      this.CONSENT_TOKEN_ID = TokenId.fromString('0.0.123456');
      return this.CONSENT_TOKEN_ID;
    }

    // In a real implementation, you would initialize the Hedera client here
    // For now, we'll use demo mode
    console.warn('Hedera not configured - using demo mode for consent NFTs');
    this.CONSENT_TOKEN_ID = TokenId.fromString('0.0.123456');
    return this.CONSENT_TOKEN_ID;
  }

  /**
   * Create the consent NFT token
   */
  private static async createConsentToken(): Promise<TokenId> {
    if (this.DEMO_MODE) {
      return TokenId.fromString('0.0.123456');
    }

    // Real implementation would create the token
    throw new Error('Token creation not implemented in demo mode');
  }

  /**
   * Grant consent by minting an NFT
   */
  static async grantConsent(
    patientDid: string,
    requesterDid: string,
    permissions: ConsentPermission[],
    dataTypes: string[],
    purpose: string,
    expiryDays: number = 30
  ): Promise<ConsentGrant> {
    const tokenId = await this.initializeConsentToken();

    const consentId = generateUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (expiryDays * 24 * 60 * 60 * 1000));

    const metadata: ConsentNFTMetadata = {
      consentId,
      patientDid,
      doctorDid: requesterDid,
      permissions: permissions.map(p => `${p.type}:${p.scope.join(',')}`),
      grantedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      dataTypes,
      purpose,
      status: 'active'
    };

    if (this.DEMO_MODE) {
      // Return mock consent grant for demo
      const consentGrant: ConsentGrant = {
        id: consentId,
        nftTokenId: tokenId.toString(),
        nftSerialNumber: Math.floor(Math.random() * 1000),
        metadata,
        transactionHash: `demo-tx-${Date.now()}`,
        blockNumber: 0,
        createdAt: now,
        updatedAt: now
      };

      console.log(`Created consent NFT: ${consentId} for doctor ${requesterDid}`);

      // Log to HCS for audit trail
      await this.logConsentToHCS('grant', consentGrant);

      // Reward patient with HEAL tokens for granting consent
      try {
        const tokenReward = await HEALTokenService.rewardConsentGrant(
          patientDid,
          consentId,
          dataTypes
        );
        console.log(`Rewarded ${tokenReward.amount} HEAL tokens to patient ${patientDid}`);
      } catch (rewardError) {
        console.error('Failed to reward HEAL tokens:', rewardError);
        // Don't fail the consent grant if token reward fails
      }

      return consentGrant;
    }

    // Real implementation would mint NFT on Hedera
    throw new Error('NFT minting not implemented in demo mode');
  }

  /**
   * Revoke consent by burning the NFT
   */
  static async revokeConsent(consentId: string, revokerDid: string): Promise<void> {
    if (this.DEMO_MODE) {
      console.log(`Demo: Revoked consent NFT: ${consentId}`);
      return;
    }

    // Real implementation would burn NFT on Hedera
    throw new Error('NFT burning not implemented in demo mode');
  }

  /**
   * Get consent by ID
   */
  static async getConsentById(consentId: string): Promise<ConsentGrant | null> {
    if (this.DEMO_MODE) {
      // Return null for demo - in real implementation would query Hedera
      return null;
    }

    // Real implementation would query NFT metadata from Hedera
    return null;
  }

  /**
   * Check if consent is still valid
   */
  static async isConsentValid(consentId: string): Promise<boolean> {
    const consent = await this.getConsentById(consentId);
    if (!consent) {
      return false;
    }

    if (consent.metadata.status !== 'active') {
      return false;
    }

    if (consent.metadata.expiresAt) {
      const expiryDate = new Date(consent.metadata.expiresAt);
      if (expiryDate < new Date()) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get all consents for a patient
   */
  static async getPatientConsents(patientDid: string): Promise<ConsentGrant[]> {
    if (this.DEMO_MODE) {
      // Return empty array for demo - in real implementation would query Hedera
      return [];
    }

    return [];
  }

  /**
   * Get all consents granted to a doctor
   */
  static async getDoctorConsents(doctorDid: string): Promise<ConsentGrant[]> {
    if (this.DEMO_MODE) {
      // Return empty array for demo - in real implementation would query Hedera
      return [];
    }

    return [];
  }

  /**
   * Log consent actions to Hedera Consensus Service for audit trail
   */
  private static async logConsentToHCS(action: string, consent: ConsentGrant): Promise<void> {
    if (this.DEMO_MODE) {
      console.log(`Demo: Logged consent ${action} to HCS:`, consent.id);
      return;
    }

    // Real implementation would log to HCS
    console.log(`Would log consent ${action} to HCS:`, consent.id);
  }

  /**
   * Emergency consent override (for critical situations)
   */
  static async grantEmergencyConsent(
    patientDid: string,
    doctorDid: string,
    reason: string,
    durationHours: number = 24
  ): Promise<ConsentGrant> {
    const permissions: ConsentPermission[] = [
      { type: 'emergency', scope: ['all'], conditions: { reason, durationHours } }
    ];

    const consentGrant = await this.grantConsent(
      patientDid,
      doctorDid,
      permissions,
      ['emergency_data'],
      `Emergency access: ${reason}`,
      Math.ceil(durationHours / 24) // Convert hours to days
    );

    // Reward patient for enabling emergency access
    try {
      const tokenReward = await HEALTokenService.rewardConsentGrant(
        patientDid,
        consentGrant.id,
        ['emergency_data']
      );
      console.log(`Emergency access reward: ${tokenReward.amount} HEAL tokens to patient ${patientDid}`);
    } catch (rewardError) {
      console.error('Failed to reward emergency access tokens:', rewardError);
    }

    return consentGrant;
  }

  /**
   * Batch revoke expired consents
   */
  static async revokeExpiredConsents(): Promise<void> {
    if (this.DEMO_MODE) {
      console.log('Demo: Checking for expired consents...');
      return;
    }

    console.log('Would check for expired consents...');
  }
}

export default NFTConsentService;
