import { 
  Client, 
  AccountId, 
  PrivateKey, 
  TopicId, 
  TopicMessageSubmitTransaction, 
  TopicCreateTransaction,
  TopicInfoQuery
} from "@hashgraph/sdk";

// Environment configuration
const CONFIG = {
  HEDERA_ACCOUNT_ID: process.env.HEDERA_ACCOUNT_ID || process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID || "0.0.6811703",
  HEDERA_PRIVATE_KEY: process.env.HEDERA_PRIVATE_KEY || process.env.NEXT_PUBLIC_HEDERA_PRIVATE_KEY || "0x627f9755e710477ece2d1a831cc47a86d4e1756ebde5c9d56d99c0af94ccb23d",
  HEDERA_NETWORK: process.env.NEXT_PUBLIC_HEDERA_NETWORK || "testnet",
  HCS_TOPIC_ID: process.env.HCS_TOPIC_ID || process.env.NEXT_PUBLIC_HCS_TOPIC_ID || null
};

export interface OnChainEvent {
  eventType: string;
  actor: string; // DID of the user performing the action
  target?: string; // Optional: DID of the target user (for consent requests, etc.)
  timestamp: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

class HCSLogger {
  private client: Client | null = null;
  private topicId: string | null = CONFIG.HCS_TOPIC_ID;

  private async getClient(): Promise<Client> {
    if (this.client) return this.client;

    const client = CONFIG.HEDERA_NETWORK === "mainnet" 
      ? Client.forMainnet() 
      : Client.forTestnet();

    const accountId = AccountId.fromString(CONFIG.HEDERA_ACCOUNT_ID);
    const privateKey = PrivateKey.fromStringECDSA(CONFIG.HEDERA_PRIVATE_KEY);
    client.setOperator(accountId, privateKey);
    
    this.client = client;
    return client;
  }

  private async ensureTopicExists(): Promise<string> {
    // If we already have a topic ID, verify it exists
    if (this.topicId) {
      try {
        console.log(`🔍 Verifying existing HCS topic: ${this.topicId}`);
        const client = await this.getClient();
        const topicInfo = await new TopicInfoQuery()
          .setTopicId(TopicId.fromString(this.topicId))
          .execute(client);
          
        console.log(`✅ Verified existing HCS topic: ${this.topicId}`);
        console.log(`   Memo: ${topicInfo.topicMemo || 'No memo'}`);
        console.log(`   Sequence: ${topicInfo.sequenceNumber}`);
        console.log(`   Expiration: ${topicInfo.expirationTime?.toDate().toISOString() || 'None'}`);
        
        return this.topicId;
      } catch (error) {
        console.warn(`⚠️ Topic ${this.topicId} not found or inaccessible:`, 
          error instanceof Error ? error.message : 'Unknown error');
        console.log('Creating a new topic...');
      }
    }

    // Create a new topic if none exists
    try {
      console.log('🚀 Creating new HCS topic...');
      const client = await this.getClient();
      
      // Get operator account info for logging
      const operatorId = client.operatorAccountId?.toString() || 'unknown';
      console.log(`   Operator: ${operatorId}`);
      
      const transaction = new TopicCreateTransaction()
        .setTopicMemo("MediLedger Nexus HCS Topic - " + new Date().toISOString())
        .setMaxTransactionFee(2) // 2 HBAR max fee
        .setAutoRenewAccountId(operatorId);

      console.log('   Submitting transaction...');
      const txResponse = await transaction.execute(client);
      console.log(`   Transaction ID: ${txResponse.transactionId.toString()}`);
      
      console.log('   Waiting for receipt...');
      const receipt = await txResponse.getReceipt(client);
      
      if (!receipt.topicId) {
        throw new Error("Failed to create topic: No topic ID in receipt");
      }

      this.topicId = receipt.topicId.toString();
      console.log(`✅ Successfully created new HCS topic: ${this.topicId}`);
      
      // Update environment variables in memory (for current process only)
      process.env.HCS_TOPIC_ID = this.topicId;
      process.env.NEXT_PUBLIC_HCS_TOPIC_ID = this.topicId;
      
      // Log HashScan URL for easy access
      const network = CONFIG.HEDERA_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
      console.log(`🔗 View on HashScan: https://hashscan.io/${network}/topic/${this.topicId}`);
      
      return this.topicId;
      
    } catch (error) {
      console.error('❌ Failed to create HCS topic:', error);
      throw new Error(`Topic creation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async logToHCS(event: {
    id: string;
    action: string;
    timestamp: string;
    data: Record<string, any>;
  }): Promise<void> {
    try {
      const client = await this.getClient();
      
      // Ensure we have a valid topic ID
      const topicId = await this.ensureTopicExists();
      
      if (!topicId) {
        throw new Error("Failed to get or create HCS topic");
      }

      const payload = {
        _kind: 'mediledger_hcs_event',
        event_type: event.action,
        event: event.data,
        ts: event.timestamp,
        id: event.id
      };

      const sendResponse = await new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(topicId))
        .setMessage(JSON.stringify(payload))
        .execute(client);

      const receipt = await sendResponse.getReceipt(client);
      console.log(`[HCS] Logged event to topic ${topicId}: ${event.action}`);
      console.log(`[HCS] Transaction ID: ${sendResponse.transactionId?.toString()}`);
    } catch (error) {
      console.error('[HCS] Failed to log event:', error);
      throw error;
    }
  }
}

// Create a single instance of HCSLogger
export const hcsLogger = new HCSLogger();

// Export the class for direct usage if needed
export { HCSLogger };

export async function logToChain(event: Omit<OnChainEvent, 'timestamp'>): Promise<void> {
  const timestamp = new Date().toISOString();
  const eventId = `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const fullEvent: OnChainEvent = { ...event, timestamp };
  
  try {
    // Try direct HCS logging first
    await hcsLogger.logToHCS({
      id: eventId,
      action: event.eventType,
      timestamp,
      data: {
        actor: event.actor,
        target: event.target,
        ...event.data,
      },
    });
    
    console.log(`[OnChain] Logged event: ${event.eventType}`, fullEvent);
  } catch (error) {
    console.error('[OnChain] Failed to log event via HCS:', error);
    
    // Fallback to consentManager's logToHCS if available
    try {
      const { logToHCS } = await import('./consentManager');
      await logToHCS({
        id: eventId,
        action: event.eventType,
        timestamp,
        data: {
          actor: event.actor,
          target: event.target,
          ...event.data,
        },
      });
      console.log(`[OnChain] Fallback: Logged via consentManager: ${event.eventType}`);
    } catch (fallbackError) {
      console.error('[OnChain] All logging methods failed:', fallbackError);
      throw new Error('All logging methods failed');
    }
  }
}

// Helper functions for common event types
export const ConsentEvents = {
  async requestCreated(request: { id: string; doctorDid: string; patientDid: string; permissions: any[] }) {
    return logToChain({
      eventType: 'consent/request_created',
      actor: request.doctorDid,
      target: request.patientDid,
      data: {
        requestId: request.id,
        permissions: request.permissions,
      },
    });
  },
  
  async consentGranted(consent: { id: string; doctorDid: string; patientDid: string; permissions: any[] }) {
    return logToChain({
      eventType: 'consent/granted',
      actor: consent.patientDid,
      target: consent.doctorDid,
      data: {
        consentId: consent.id,
        permissions: consent.permissions,
      },
    });
  },
  
  async consentRevoked(consent: { id: string; doctorDid: string; patientDid: string; reason?: string }) {
    return logToChain({
      eventType: 'consent/revoked',
      actor: consent.patientDid,
      target: consent.doctorDid,
      data: {
        consentId: consent.id,
        reason: consent.reason || 'No reason provided',
      },
    });
  },
  
  async emergencyAccessGranted(consent: { id: string; doctorDid: string; patientDid: string; reason: string }) {
    return logToChain({
      eventType: 'consent/emergency_granted',
      actor: consent.doctorDid,
      target: consent.patientDid,
      data: {
        consentId: consent.id,
        reason: consent.reason,
      },
    });
  },
  
  async recordAccessed(record: { id: string; type: string; accessedBy: string; patientDid: string }) {
    console.log(`🔍 [HCS] Recording access to ${record.type} record ${record.id}`);
    console.log(`   - Accessed by: ${record.accessedBy}`);
    console.log(`   - Patient: ${record.patientDid}`);
    
    try {
      const result = await logToChain({
        eventType: 'record/accessed',
        actor: record.accessedBy,
        target: record.patientDid,
        data: {
          recordId: record.id,
          recordType: record.type,
          accessTimestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
        },
      });
      
      console.log('✅ [HCS] Successfully logged record access');
      return result;
    } catch (error) {
      console.error('❌ [HCS] Failed to log record access:', error);
      // Re-throw to allow calling code to handle the error
      throw new Error(`Failed to log record access: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  async recordUpdated(record: { id: string; type: string; updatedBy: string; patientDid: string; changes: any }) {
    return logToChain({
      eventType: 'record/updated',
      actor: record.updatedBy,
      target: record.patientDid,
      data: {
        recordId: record.id,
        recordType: record.type,
        changes: record.changes,
      },
    });
  },
};
