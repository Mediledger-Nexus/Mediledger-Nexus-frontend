import { logToHCS } from './consentManager';

export interface OnChainEvent {
  eventType: string;
  actor: string; // DID of the user performing the action
  target?: string; // Optional: DID of the target user (for consent requests, etc.)
  timestamp: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

export async function logToChain(event: Omit<OnChainEvent, 'timestamp'>): Promise<void> {
  const timestamp = new Date().toISOString();
  const fullEvent: OnChainEvent = { ...event, timestamp };
  
  try {
    // Log to HCS (Hedera Consensus Service)
    await logToHCS({
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
    console.error('[OnChain] Failed to log event:', error);
    // In a production app, you might want to implement a retry mechanism here
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
    return logToChain({
      eventType: 'record/accessed',
      actor: record.accessedBy,
      target: record.patientDid,
      data: {
        recordId: record.id,
        recordType: record.type,
      },
    });
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
