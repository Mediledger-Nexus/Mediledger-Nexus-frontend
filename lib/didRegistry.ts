// Persistent DID Registry for MediLedger Nexus
// Manages Decentralized Identifiers with role-based identity management

export interface DIDDocument {
  id: string; // The DID itself
  controller: string; // Wallet ID that controls this DID
  publicKey: string; // Public key from wallet
  role: 'patient' | 'doctor' | 'organization';
  profile: any; // User profile data
  createdAt: string;
  updatedAt: string;
  network: string; // Hedera network (mainnet, testnet, previewnet)
  status: 'active' | 'suspended' | 'revoked';
  metadata?: Record<string, any>;
}

export interface DIDVerification {
  did: string;
  verified: boolean;
  verificationMethod: string;
  timestamp: string;
  hcsSequence?: string;
}

const KEYS = {
  didDocuments: 'mln_did_documents',
  didVerifications: 'mln_did_verifications',
  didRegistry: 'mln_did_registry',
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

// Create a new DID document
export async function createDID(
  walletId: string,
  publicKey: string,
  role: 'patient' | 'doctor' | 'organization',
  profile: any,
  network: string = 'testnet'
): Promise<DIDDocument> {
  const did = `did:hedera:${network}:${walletId}`;
  const now = new Date().toISOString();

  const didDocument: DIDDocument = {
    id: did,
    controller: walletId,
    publicKey,
    role,
    profile,
    createdAt: now,
    updatedAt: now,
    network,
    status: 'active',
    metadata: {
      version: '1.0',
      createdBy: 'MediLedger Nexus',
    },
  };

  // Store DID document
  const allDIDs = readJSON<DIDDocument[]>(KEYS.didDocuments, []);
  allDIDs.push(didDocument);
  writeJSON(KEYS.didDocuments, allDIDs);

  // Register in DID registry
  const registry = readJSON<Record<string, string>>(KEYS.didRegistry, {});
  registry[did] = walletId;
  writeJSON(KEYS.didRegistry, registry);

  // Log DID creation to HCS
  await logDIDToHCS({
    action: 'did_created',
    did,
    walletId,
    role,
    network,
    timestamp: now,
  });

  return didDocument;
}

// Get DID document by DID
export function getDIDDocument(did: string): DIDDocument | null {
  const allDIDs = readJSON<DIDDocument[]>(KEYS.didDocuments, []);
  return allDIDs.find(doc => doc.id === did) || null;
}

// Get DID document by wallet ID
export function getDIDByWalletId(walletId: string): DIDDocument | null {
  const allDIDs = readJSON<DIDDocument[]>(KEYS.didDocuments, []);
  return allDIDs.find(doc => doc.controller === walletId) || null;
}

// Update DID document
export async function updateDIDDocument(did: string, updates: Partial<DIDDocument>): Promise<DIDDocument | null> {
  const allDIDs = readJSON<DIDDocument[]>(KEYS.didDocuments, []);
  const docIndex = allDIDs.findIndex(doc => doc.id === did);

  if (docIndex === -1) return null;

  const updatedDoc: DIDDocument = {
    ...allDIDs[docIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  allDIDs[docIndex] = updatedDoc;
  writeJSON(KEYS.didDocuments, allDIDs);

  // Log update to HCS
  await logDIDToHCS({
    action: 'did_updated',
    did,
    changes: Object.keys(updates),
    timestamp: updatedDoc.updatedAt,
  });

  return updatedDoc;
}

// Verify DID ownership
export async function verifyDID(did: string, walletId: string, publicKey: string): Promise<DIDVerification> {
  const doc = getDIDDocument(did);
  const now = new Date().toISOString();

  const verification: DIDVerification = {
    did,
    verified: doc !== null && 
              doc.controller === walletId && 
              doc.publicKey === publicKey && 
              doc.status === 'active',
    verificationMethod: 'hedera_wallet_signature',
    timestamp: now,
  };

  // Store verification result
  const verifications = readJSON<DIDVerification[]>(KEYS.didVerifications, []);
  verifications.push(verification);
  writeJSON(KEYS.didVerifications, verifications);

  // Log verification to HCS
  const hcsSequence = await logDIDToHCS({
    action: 'did_verified',
    did,
    verified: verification.verified,
    walletId,
    timestamp: now,
  });

  verification.hcsSequence = hcsSequence;

  return verification;
}

// Suspend or revoke DID
export async function suspendDID(did: string, reason: string, suspendedBy: string): Promise<boolean> {
  const doc = getDIDDocument(did);
  if (!doc) return false;

  await updateDIDDocument(did, {
    status: 'suspended',
    metadata: {
      ...doc.metadata,
      suspensionReason: reason,
      suspendedBy,
      suspendedAt: new Date().toISOString(),
    },
  });

  // Log suspension to HCS
  await logDIDToHCS({
    action: 'did_suspended',
    did,
    reason,
    suspendedBy,
    timestamp: new Date().toISOString(),
  });

  return true;
}

// Get all DIDs by role
export function getDIDsByRole(role: 'patient' | 'doctor' | 'organization'): DIDDocument[] {
  const allDIDs = readJSON<DIDDocument[]>(KEYS.didDocuments, []);
  return allDIDs.filter(doc => doc.role === role && doc.status === 'active');
}

// Get all DIDs for a network
export function getDIDsByNetwork(network: string): DIDDocument[] {
  const allDIDs = readJSON<DIDDocument[]>(KEYS.didDocuments, []);
  return allDIDs.filter(doc => doc.network === network && doc.status === 'active');
}

// Search DIDs by profile data
export function searchDIDs(query: string): DIDDocument[] {
  const allDIDs = readJSON<DIDDocument[]>(KEYS.didDocuments, []);
  const lowercaseQuery = query.toLowerCase();

  return allDIDs.filter(doc => {
    if (doc.status !== 'active') return false;

    // Search in profile data
    const profile = doc.profile;
    if (profile) {
      const name = profile.fullName || profile.organizationName || '';
      const email = profile.email || '';
      const licenseNumber = profile.licenseNumber || '';
      
      return name.toLowerCase().includes(lowercaseQuery) ||
             email.toLowerCase().includes(lowercaseQuery) ||
             licenseNumber.toLowerCase().includes(lowercaseQuery);
    }

    return false;
  });
}

// Get DID statistics
export function getDIDStats(): {
  total: number;
  byRole: Record<string, number>;
  byNetwork: Record<string, number>;
  active: number;
  suspended: number;
} {
  const allDIDs = readJSON<DIDDocument[]>(KEYS.didDocuments, []);
  
  const stats = {
    total: allDIDs.length,
    byRole: {} as Record<string, number>,
    byNetwork: {} as Record<string, number>,
    active: 0,
    suspended: 0,
  };

  allDIDs.forEach(doc => {
    // Count by role
    stats.byRole[doc.role] = (stats.byRole[doc.role] || 0) + 1;
    
    // Count by network
    stats.byNetwork[doc.network] = (stats.byNetwork[doc.network] || 0) + 1;
    
    // Count by status
    if (doc.status === 'active') stats.active++;
    if (doc.status === 'suspended') stats.suspended++;
  });

  return stats;
}

// Export DID document in standard format
export function exportDIDDocument(did: string): any {
  const doc = getDIDDocument(did);
  if (!doc) return null;

  return {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1'
    ],
    id: doc.id,
    controller: doc.controller,
    verificationMethod: [
      {
        id: `${doc.id}#key-1`,
        type: 'Ed25519VerificationKey2020',
        controller: doc.id,
        publicKeyMultibase: doc.publicKey,
      }
    ],
    authentication: [`${doc.id}#key-1`],
    service: [
      {
        id: `${doc.id}#mediledger`,
        type: 'MediLedgerNexus',
        serviceEndpoint: 'https://mediledger-nexus.com/api/did',
        properties: {
          role: doc.role,
          network: doc.network,
          createdAt: doc.createdAt,
        }
      }
    ]
  };
}

// Log DID operations to Hedera Consensus Service
async function logDIDToHCS(data: Record<string, any>): Promise<string> {
  try {
    const { HederaLogger } = await import('./hedera');
    return await HederaLogger.logRegistration({
      type: 'did_operation',
      ...data,
    });
  } catch (error) {
    console.error('Failed to log DID operation to HCS:', error);
    return 'hcs-error';
  }
}

// Initialize demo DIDs for testing
export function initializeDemoDIDs() {
  const demoDIDs: DIDDocument[] = [
    {
      id: 'did:hedera:testnet:0.0.20001',
      controller: '0.0.20001',
      publicKey: '302a300506032b6570032100...',
      role: 'patient',
      profile: {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      network: 'testnet',
      status: 'active',
      metadata: {
        version: '1.0',
        createdBy: 'MediLedger Nexus',
      },
    },
    {
      id: 'did:hedera:testnet:0.0.20002',
      controller: '0.0.20002',
      publicKey: '302a300506032b6570032100...',
      role: 'doctor',
      profile: {
        fullName: 'Dr. Sarah Chen',
        email: 'sarah.chen@hospital.com',
        licenseNumber: 'MD-12345',
        specialization: 'General Medicine',
        hospital: 'City General Hospital',
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      network: 'testnet',
      status: 'active',
      metadata: {
        version: '1.0',
        createdBy: 'MediLedger Nexus',
      },
    },
    {
      id: 'did:hedera:testnet:0.0.20003',
      controller: '0.0.20003',
      publicKey: '302a300506032b6570032100...',
      role: 'organization',
      profile: {
        organizationName: 'City General Hospital',
        organizationType: 'Hospital',
        adminName: 'Dr. Michael Smith',
        adminEmail: 'admin@citygeneral.com',
        registrationNumber: 'HOSP-12345',
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      network: 'testnet',
      status: 'active',
      metadata: {
        version: '1.0',
        createdBy: 'MediLedger Nexus',
      },
    },
  ];

  // Only initialize if no DIDs exist
  const existingDIDs = readJSON<DIDDocument[]>(KEYS.didDocuments, []);
  if (existingDIDs.length === 0) {
    writeJSON(KEYS.didDocuments, demoDIDs);
    
    // Update registry
    const registry = readJSON<Record<string, string>>(KEYS.didRegistry, {});
    demoDIDs.forEach(doc => {
      registry[doc.id] = doc.controller;
    });
    writeJSON(KEYS.didRegistry, registry);
  }
}

// Auto-initialize demo DIDs when module loads
if (typeof window !== 'undefined') {
  const existingData = localStorage.getItem(KEYS.didDocuments);
  if (!existingData) {
    initializeDemoDIDs();
  }
}

