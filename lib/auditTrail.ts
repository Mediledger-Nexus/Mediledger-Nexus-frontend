// Universal Audit Trail System for MediLedger Nexus
// Provides comprehensive logging and transparency for all platform activities

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  actor: {
    did: string;
    role: 'patient' | 'doctor' | 'organization' | 'system';
    walletId: string;
  };
  action: string;
  resource?: {
    type: string;
    id: string;
    description?: string;
  };
  metadata: Record<string, any>;
  timestamp: string;
  network: string;
  hcsSequence?: string;
  ipfsHash?: string;
}

export type AuditEventType = 
  | 'user_registration'
  | 'did_creation'
  | 'consent_granted'
  | 'consent_revoked'
  | 'consent_denied'
  | 'record_created'
  | 'record_accessed'
  | 'record_updated'
  | 'record_deleted'
  | 'record_shared'
  | 'ai_analysis'
  | 'wallet_connection'
  | 'emergency_access'
  | 'system_event'
  | 'security_event';

export interface AuditFilter {
  types?: AuditEventType[];
  actors?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  resources?: string[];
  searchTerm?: string;
}

export interface AuditStats {
  totalEvents: number;
  eventsByType: Record<AuditEventType, number>;
  eventsByActor: Record<string, number>;
  recentActivity: number; // Events in last 24 hours
  criticalEvents: number;
}

const KEYS = {
  auditEvents: 'mln_audit_events',
  auditStats: 'mln_audit_stats',
};

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Log an audit event
export async function logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp' | 'hcsSequence'>): Promise<AuditEvent> {
  const auditEvent: AuditEvent = {
    ...event,
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  // Store locally
  const allEvents = readJSON<AuditEvent[]>(KEYS.auditEvents, []);
  allEvents.push(auditEvent);
  writeJSON(KEYS.auditEvents, allEvents);

  // Log to HCS
  try {
    const { HederaLogger } = await import('./hedera');
    const hcsSequence = await HederaLogger.logRegistration({
      type: 'audit_event',
      eventId: auditEvent.id,
      eventType: auditEvent.type,
      actorDid: auditEvent.actor.did,
      actorRole: auditEvent.actor.role,
      action: auditEvent.action,
      resourceType: auditEvent.resource?.type,
      resourceId: auditEvent.resource?.id,
      timestamp: auditEvent.timestamp,
      network: auditEvent.network,
    });

    auditEvent.hcsSequence = hcsSequence;

    // Update the stored event with HCS sequence
    const updatedEvents = readJSON<AuditEvent[]>(KEYS.auditEvents, []);
    const eventIndex = updatedEvents.findIndex(e => e.id === auditEvent.id);
    if (eventIndex >= 0) {
      updatedEvents[eventIndex] = auditEvent;
      writeJSON(KEYS.auditEvents, updatedEvents);
    }
  } catch (error) {
    console.error('Failed to log audit event to HCS:', error);
  }

  // Update stats
  updateAuditStats();

  return auditEvent;
}

// Get audit events with filtering
export function getAuditEvents(filter?: AuditFilter): AuditEvent[] {
  let events = readJSON<AuditEvent[]>(KEYS.auditEvents, []);

  if (!filter) return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Apply filters
  if (filter.types && filter.types.length > 0) {
    events = events.filter(event => filter.types!.includes(event.type));
  }

  if (filter.actors && filter.actors.length > 0) {
    events = events.filter(event => 
      filter.actors!.includes(event.actor.did) || 
      filter.actors!.includes(event.actor.walletId)
    );
  }

  if (filter.dateRange) {
    const startDate = new Date(filter.dateRange.start);
    const endDate = new Date(filter.dateRange.end);
    events = events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }

  if (filter.resources && filter.resources.length > 0) {
    events = events.filter(event => 
      event.resource && filter.resources!.includes(event.resource.id)
    );
  }

  if (filter.searchTerm) {
    const searchTerm = filter.searchTerm.toLowerCase();
    events = events.filter(event =>
      event.action.toLowerCase().includes(searchTerm) ||
      event.resource?.description?.toLowerCase().includes(searchTerm) ||
      Object.values(event.metadata).some(value => 
        String(value).toLowerCase().includes(searchTerm)
      )
    );
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Get audit events for a specific DID
export function getAuditEventsForDID(did: string): AuditEvent[] {
  return getAuditEvents({
    actors: [did]
  });
}

// Get audit statistics
export function getAuditStats(): AuditStats {
  const stats = readJSON<AuditStats>(KEYS.auditStats, {
    totalEvents: 0,
    eventsByType: {} as Record<AuditEventType, number>,
    eventsByActor: {},
    recentActivity: 0,
    criticalEvents: 0,
  });

  return stats;
}

// Update audit statistics
function updateAuditStats() {
  const events = readJSON<AuditEvent[]>(KEYS.auditEvents, []);
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const stats: AuditStats = {
    totalEvents: events.length,
    eventsByType: {} as Record<AuditEventType, number>,
    eventsByActor: {},
    recentActivity: events.filter(e => new Date(e.timestamp) > yesterday).length,
    criticalEvents: events.filter(e => 
      e.type === 'emergency_access' || 
      e.type === 'security_event' ||
      e.action.includes('emergency') ||
      e.action.includes('critical')
    ).length,
  };

  // Count by type
  events.forEach(event => {
    stats.eventsByType[event.type] = (stats.eventsByType[event.type] || 0) + 1;
    stats.eventsByActor[event.actor.did] = (stats.eventsByActor[event.actor.did] || 0) + 1;
  });

  writeJSON(KEYS.auditStats, stats);
}

// Get events by type
export function getEventsByType(type: AuditEventType): AuditEvent[] {
  return getAuditEvents({ types: [type] });
}

// Get recent events (last N hours)
export function getRecentEvents(hours: number = 24): AuditEvent[] {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  const events = readJSON<AuditEvent[]>(KEYS.auditEvents, []);
  
  return events
    .filter(event => new Date(event.timestamp) > cutoffTime)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Get critical events
export function getCriticalEvents(): AuditEvent[] {
  return getAuditEvents().filter(event =>
    event.type === 'emergency_access' ||
    event.type === 'security_event' ||
    event.action.includes('emergency') ||
    event.action.includes('critical') ||
    event.action.includes('breach') ||
    event.action.includes('unauthorized')
  );
}

// Export audit trail
export function exportAuditTrail(filter?: AuditFilter): string {
  const events = getAuditEvents(filter);
  return JSON.stringify(events, null, 2);
}

// Clear old audit events (keep last N days)
export function cleanupAuditEvents(keepDays: number = 90) {
  const cutoffDate = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000);
  const events = readJSON<AuditEvent[]>(KEYS.auditEvents, []);
  
  const filteredEvents = events.filter(event => new Date(event.timestamp) > cutoffDate);
  writeJSON(KEYS.auditEvents, filteredEvents);
  
  updateAuditStats();
  
  return events.length - filteredEvents.length; // Number of events removed
}

// Initialize demo audit events
export function initializeDemoAuditEvents() {
  const demoEvents: AuditEvent[] = [
    {
      id: 'audit-demo-1',
      type: 'user_registration',
      actor: {
        did: 'did:hedera:testnet:0.0.20001',
        role: 'patient',
        walletId: '0.0.20001',
      },
      action: 'Patient registered on platform',
      resource: {
        type: 'user',
        id: 'user-20001',
        description: 'John Doe patient registration',
      },
      metadata: {
        phoneNumber: '+1234567890',
        registrationMethod: 'phone_otp',
      },
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      network: 'testnet',
      hcsSequence: 'hcs-seq-001',
    },
    {
      id: 'audit-demo-2',
      type: 'did_creation',
      actor: {
        did: 'did:hedera:testnet:0.0.20001',
        role: 'patient',
        walletId: '0.0.20001',
      },
      action: 'DID created and registered',
      resource: {
        type: 'did',
        id: 'did:hedera:testnet:0.0.20001',
        description: 'Patient DID document',
      },
      metadata: {
        network: 'testnet',
        role: 'patient',
      },
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      network: 'testnet',
      hcsSequence: 'hcs-seq-002',
    },
    {
      id: 'audit-demo-3',
      type: 'consent_granted',
      actor: {
        did: 'did:hedera:testnet:0.0.20001',
        role: 'patient',
        walletId: '0.0.20001',
      },
      action: 'Consent granted to doctor',
      resource: {
        type: 'consent',
        id: 'consent-001',
        description: 'Access to medical records',
      },
      metadata: {
        doctorDid: 'did:hedera:testnet:0.0.20002',
        permissions: ['read_records', 'write_notes'],
        expiryDays: 30,
      },
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      network: 'testnet',
      hcsSequence: 'hcs-seq-003',
    },
    {
      id: 'audit-demo-4',
      type: 'record_accessed',
      actor: {
        did: 'did:hedera:testnet:0.0.20002',
        role: 'doctor',
        walletId: '0.0.20002',
      },
      action: 'Medical record accessed',
      resource: {
        type: 'record',
        id: 'record-001',
        description: 'Blood test results',
      },
      metadata: {
        patientDid: 'did:hedera:testnet:0.0.20001',
        accessType: 'read',
        consentId: 'consent-001',
      },
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      network: 'testnet',
      hcsSequence: 'hcs-seq-004',
    },
    {
      id: 'audit-demo-5',
      type: 'ai_analysis',
      actor: {
        did: 'did:hedera:testnet:0.0.20001',
        role: 'patient',
        walletId: '0.0.20001',
      },
      action: 'AI health analysis performed',
      resource: {
        type: 'analysis',
        id: 'analysis-001',
        description: 'Symptom analysis for headache',
      },
      metadata: {
        urgency: 5,
        conditions: ['tension_headache'],
        recommendations: 3,
      },
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      network: 'testnet',
      hcsSequence: 'hcs-seq-005',
    },
  ];

  // Only initialize if no events exist
  const existingEvents = readJSON<AuditEvent[]>(KEYS.auditEvents, []);
  if (existingEvents.length === 0) {
    writeJSON(KEYS.auditEvents, demoEvents);
    updateAuditStats();
  }
}

// Auto-initialize demo audit events when module loads
if (typeof window !== 'undefined') {
  const existingData = localStorage.getItem(KEYS.auditEvents);
  if (!existingData) {
    initializeDemoAuditEvents();
  }
}


