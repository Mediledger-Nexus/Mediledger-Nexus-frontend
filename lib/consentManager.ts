// Advanced Consent Management System for MediLedger Nexus
// Handles time-limited consent, verification, and HCS logging

export interface ConsentGrant {
  id: string;
  patientDid: string;
  doctorDid: string;
  permissions: ConsentPermission[];
  grantedAt: string;
  expiresAt?: string;
  status: 'active' | 'expired' | 'revoked' | 'pending';
  hcsSequence?: string;
  metadata?: Record<string, any>;
}

export interface ConsentPermission {
  type: 'read_records' | 'write_notes' | 'prescribe_medication' | 'view_history' | 'emergency_access';
  scope: string[]; // Specific record IDs or 'all'
  conditions?: string[]; // Additional conditions
}

export interface ConsentRequest {
  id: string;
  doctorDid: string;
  patientDid: string;
  requestedPermissions: ConsentPermission[];
  requestDate: string;
  expiryDays: number;
  status: 'pending' | 'granted' | 'denied' | 'expired';
  message?: string;
  hcsSequence?: string;
}

const KEYS = {
  consents: 'mln_consents',
  requests: 'mln_consent_requests',
  audit: 'mln_consent_audit',
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

// Create a new consent request
export async function createConsentRequest(
  doctorDid: string,
  patientDid: string,
  permissions: ConsentPermission[],
  expiryDays: number = 30,
  message?: string
): Promise<ConsentRequest> {
  const request: ConsentRequest = {
    id: `consent-req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    doctorDid,
    patientDid,
    requestedPermissions: permissions,
    requestDate: new Date().toISOString(),
    expiryDays,
    status: 'pending',
    message,
  };

  const allRequests = readJSON<ConsentRequest[]>(KEYS.requests, []);
  allRequests.push(request);
  writeJSON(KEYS.requests, allRequests);

  // Log to audit trail
  logConsentAudit({
    action: 'consent_request_created',
    requestId: request.id,
    doctorDid,
    patientDid,
    permissions: permissions.map(p => p.type),
    expiryDays,
  });

  return request;
}

// Grant consent (called by patient)
export async function grantConsent(
  requestId: string,
  patientDid: string,
  customExpiryDays?: number
): Promise<ConsentGrant> {
  const allRequests = readJSON<ConsentRequest[]>(KEYS.requests, []);
  const request = allRequests.find(r => r.id === requestId);
  
  if (!request) {
    throw new Error('Consent request not found');
  }

  if (request.status !== 'pending') {
    throw new Error('Consent request is no longer pending');
  }

  const expiryDays = customExpiryDays || request.expiryDays;
  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();

  const consent: ConsentGrant = {
    id: `consent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    patientDid,
    doctorDid: request.doctorDid,
    permissions: request.requestedPermissions,
    grantedAt: new Date().toISOString(),
    expiresAt,
    status: 'active',
  };

  // Update request status
  const requestIndex = allRequests.findIndex(r => r.id === requestId);
  if (requestIndex >= 0) {
    allRequests[requestIndex].status = 'granted';
  }
  writeJSON(KEYS.requests, allRequests);

  // Store consent
  const allConsents = readJSON<ConsentGrant[]>(KEYS.consents, []);
  allConsents.push(consent);
  writeJSON(KEYS.consents, allConsents);

  // Mint NFT and log to HCS
  try {
    const { HederaLogger } = await import('./hedera');

    // Mint consent NFT to doctor's wallet
    const doctorAccountId = getDoctorAccountId(request.doctorDid); // Helper to get account ID from DID
    const nftResult = await HederaLogger.mintConsentNFT(doctorAccountId, {
      consentId: consent.id,
      recordId: 'record-123', // Replace with actual record ID
      patientDID: patientDid,
      doctorDID: request.doctorDid,
      fileCID: 'QmExampleCID', // Replace with actual file CID
      reason: request.message || 'Medical consultation',
      expiresAt: expiresAt,
    });

    // Store NFT details in consent
    consent.metadata = {
      nftTokenId: nftResult.tokenId,
      nftSerialNumber: nftResult.serialNumber,
    };

    // Log to HCS
    await HederaLogger.logConsentEvent({
      type: 'consent_granted',
      consentId: consent.id,
      patientDID: patientDid,
      doctorDID: request.doctorDid,
      recordId: 'record-123',
      timestamp: new Date().toISOString(),
      metadata: { nftResult },
    });

    writeJSON(KEYS.consents, allConsents); // Update with NFT details
  } catch (error) {
    console.error('Error minting NFT or logging to HCS:', error);
    // Continue without NFT if Hedera fails (demo mode)
  }

  // Log to audit trail
  logConsentAudit({
    action: 'consent_granted',
    consentId: consent.id,
    requestId,
    doctorDid: request.doctorDid,
    patientDid,
    expiresAt,
  });

  return consent;
}

// Helper to get doctor account ID from DID (in production, query from DB or DID resolver)
function getDoctorAccountId(doctorDid: string): string {
  // Mock: assume DID format did:hedera:0.0.123456 -> account 0.0.123456
  return doctorDid.split(':')[2] || '0.0.123456'; // Fallback for demo
}

// Revoke consent
export async function revokeConsent(consentId: string, revokedBy: string): Promise<void> {
  const allConsents = readJSON<ConsentGrant[]>(KEYS.consents, []);
  const consentIndex = allConsents.findIndex(c => c.id === consentId);
  
  if (consentIndex >= 0) {
    allConsents[consentIndex].status = 'revoked';
    writeJSON(KEYS.consents, allConsents);

    // Burn NFT if exists
    const consent = allConsents[consentIndex];
    if (consent.metadata?.nftTokenId && consent.metadata?.nftSerialNumber) {
      try {
        const { HederaLogger } = await import('./hedera');
        await HederaLogger.burnConsentNFT(
          consent.metadata.nftTokenId,
          consent.metadata.nftSerialNumber,
          getDoctorAccountId(consent.doctorDid)
        );

        // Log to HCS
        await HederaLogger.logConsentEvent({
          type: 'consent_revoked',
          consentId,
          patientDID: consent.patientDid,
          doctorDID: consent.doctorDid,
          recordId: 'record-123',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error burning NFT or logging to HCS:', error);
      }
    }

    // Log to audit trail
    logConsentAudit({
      action: 'consent_revoked',
      consentId,
      revokedBy,
      patientDid: allConsents[consentIndex].patientDid,
      doctorDid: allConsents[consentIndex].doctorDid,
    });
  }
}

// Deny consent request
export async function denyConsentRequest(requestId: string, deniedBy: string, reason?: string): Promise<void> {
  const allRequests = readJSON<ConsentRequest[]>(KEYS.requests, []);
  const requestIndex = allRequests.findIndex(r => r.id === requestId);
  
  if (requestIndex >= 0) {
    allRequests[requestIndex].status = 'denied';
    writeJSON(KEYS.requests, allRequests);

    // Log to audit trail
    logConsentAudit({
      action: 'consent_denied',
      requestId,
      deniedBy,
      doctorDid: allRequests[requestIndex].doctorDid,
      patientDid: allRequests[requestIndex].patientDid,
      reason,
    });
  }
}

// Check if doctor has active consent for patient
export function hasActiveConsent(doctorDid: string, patientDid: string, permission?: string): boolean {
  const allConsents = readJSON<ConsentGrant[]>(KEYS.consents, []);
  
  const activeConsent = allConsents.find(c => 
    c.doctorDid === doctorDid &&
    c.patientDid === patientDid &&
    c.status === 'active' &&
    (!c.expiresAt || new Date(c.expiresAt) > new Date())
  );

  if (!activeConsent) return false;

  // Check specific permission if requested
  if (permission) {
    return activeConsent.permissions.some(p => p.type === permission);
  }

  return true;
}

// Get all active consents for a patient
export function getPatientConsents(patientDid: string): ConsentGrant[] {
  const allConsents = readJSON<ConsentGrant[]>(KEYS.consents, []);
  return allConsents.filter(c => 
    c.patientDid === patientDid &&
    c.status === 'active' &&
    (!c.expiresAt || new Date(c.expiresAt) > new Date())
  );
}

// Get all active consents for a doctor
export function getDoctorConsents(doctorDid: string): ConsentGrant[] {
  const allConsents = readJSON<ConsentGrant[]>(KEYS.consents, []);
  return allConsents.filter(c => 
    c.doctorDid === doctorDid &&
    c.status === 'active' &&
    (!c.expiresAt || new Date(c.expiresAt) > new Date())
  );
}

// Get pending consent requests for a patient
export function getPendingConsentRequests(patientDid: string): ConsentRequest[] {
  const allRequests = readJSON<ConsentRequest[]>(KEYS.requests, []);
  return allRequests.filter(r => 
    r.patientDid === patientDid && 
    r.status === 'pending' &&
    new Date(r.requestDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Within 7 days
  );
}

// Get consent requests made by a doctor
export function getDoctorConsentRequests(doctorDid: string): ConsentRequest[] {
  const allRequests = readJSON<ConsentRequest[]>(KEYS.requests, []);
  return allRequests.filter(r => r.doctorDid === doctorDid);
}

// Check for expired consents and update status
export function checkExpiredConsents(): ConsentGrant[] {
  const allConsents = readJSON<ConsentGrant[]>(KEYS.consents, []);
  const now = new Date();
  const expiredConsents: ConsentGrant[] = [];

  allConsents.forEach(consent => {
    if (consent.status === 'active' && consent.expiresAt && new Date(consent.expiresAt) <= now) {
      consent.status = 'expired';
      expiredConsents.push(consent);

      // Log to audit trail
      logConsentAudit({
        action: 'consent_expired',
        consentId: consent.id,
        patientDid: consent.patientDid,
        doctorDid: consent.doctorDid,
        expiredAt: consent.expiresAt,
      });
    }
  });

  if (expiredConsents.length > 0) {
    writeJSON(KEYS.consents, allConsents);
  }

  return expiredConsents;
}

// Audit logging
interface AuditLog {
  id: string;
  action: string;
  timestamp: string;
  data: Record<string, any>;
  hcsSequence?: string;
}

function logConsentAudit(data: Record<string, any>) {
  const auditLog: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    action: data.action,
    timestamp: new Date().toISOString(),
    data,
  };

  const allAudits = readJSON<AuditLog[]>(KEYS.audit, []);
  allAudits.push(auditLog);
  writeJSON(KEYS.audit, allAudits);

  // Also log to HCS if available
  logToHCS(auditLog);
}

// Log to Hedera Consensus Service
async function logToHCS(auditLog: AuditLog) {
  try {
    // Import HederaLogger dynamically to avoid SSR issues
    const { HederaLogger } = await import('./hedera');
    
    const hcsSequence = await HederaLogger.logRegistration({
      type: 'consent_audit',
      ...auditLog.data,
      timestamp: auditLog.timestamp,
    });

    // Update audit log with HCS sequence
    auditLog.hcsSequence = hcsSequence;
    const allAudits = readJSON<AuditLog[]>(KEYS.audit, []);
    const auditIndex = allAudits.findIndex(a => a.id === auditLog.id);
    if (auditIndex >= 0) {
      allAudits[auditIndex] = auditLog;
      writeJSON(KEYS.audit, allAudits);
    }
  } catch (error) {
    console.error('Failed to log consent audit to HCS:', error);
  }
}

// Get audit trail for a specific DID
export function getAuditTrail(did: string): AuditLog[] {
  const allAudits = readJSON<AuditLog[]>(KEYS.audit, []);
  return allAudits.filter(audit => 
    audit.data.patientDid === did || 
    audit.data.doctorDid === did ||
    audit.data.revokedBy === did ||
    audit.data.deniedBy === did
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Emergency access (bypasses normal consent for critical situations)
export async function grantEmergencyAccess(
  doctorDid: string,
  patientDid: string,
  reason: string,
  duration: number = 24 // hours
): Promise<ConsentGrant> {
  const emergencyConsent: ConsentGrant = {
    id: `emergency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    patientDid,
    doctorDid,
    permissions: [
      { type: 'emergency_access', scope: ['all'] },
      { type: 'read_records', scope: ['all'] },
      { type: 'view_history', scope: ['all'] },
    ],
    grantedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + duration * 60 * 60 * 1000).toISOString(), // Convert hours to milliseconds
    status: 'active',
    metadata: { emergency: true, reason },
  };

  const allConsents = readJSON<ConsentGrant[]>(KEYS.consents, []);
  allConsents.push(emergencyConsent);
  writeJSON(KEYS.consents, allConsents);

  // Log to audit trail
  logConsentAudit({
    action: 'emergency_access_granted',
    consentId: emergencyConsent.id,
    doctorDid,
    patientDid,
    reason,
    duration,
    expiresAt: emergencyConsent.expiresAt,
  });

  return emergencyConsent;
}

// Verify consent NFT before allowing record access
export async function verifyConsentForAccess(
  consentId: string,
  doctorAccountId: string
): Promise<boolean> {
  const allConsents = readJSON<ConsentGrant[]>(KEYS.consents, []);
  const consent = allConsents.find(c => c.id === consentId && c.status === 'active');

  if (!consent) {
    return false;
  }

  // Check expiration
  if (consent.expiresAt && new Date(consent.expiresAt) <= new Date()) {
    consent.status = 'expired';
    writeJSON(KEYS.consents, allConsents);
    return false;
  }

  // Verify NFT if exists
  if (consent.metadata?.nftTokenId && consent.metadata?.nftSerialNumber) {
    try {
      const { HederaLogger } = await import('./hedera');
      const isValid = await HederaLogger.verifyConsentNFT(
        consent.metadata.nftTokenId,
        consent.metadata.nftSerialNumber,
        doctorAccountId
      );
      if (!isValid) {
        return false;
      }
    } catch (error) {
      console.error('Error verifying consent NFT:', error);
      return false;
    }
  }

  return true;
}

