// Advanced Record Management System for MediLedger Nexus
// Handles encryption, IPFS storage, and consent verification

// Web Crypto API for encryption (better Next.js compatibility)
let crypto: any;
if (typeof window !== 'undefined') {
  crypto = window.crypto;
} else {
  // For Node.js environment (SSR)
  crypto = require('crypto').webcrypto;
}

export interface MedicalRecord {
  id: string;
  patientDid: string;
  title: string;
  description: string;
  type: 'diagnosis' | 'prescription' | 'test_result' | 'vaccination' | 'note' | 'image' | 'document';
  content: any; // Encrypted content
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string; // DID of creator
    version: number;
    tags: string[];
    size: number;
    mimeType?: string;
    deleted?: boolean;
    deletedBy?: string;
  };
  ipfsHash?: string;
  hcsSequence?: string;
  encryption: {
    algorithm: 'AES-256-GCM';
    keyDerivation: 'PBKDF2';
    salt: string;
  };
}

export interface RecordAccess {
  recordId: string;
  patientDid: string;
  doctorDid: string;
  accessType: 'read' | 'write' | 'delete';
  grantedAt: string;
  expiresAt?: string;
  consentId: string;
  hcsSequence?: string;
}

export interface RecordShare {
  recordId: string;
  patientDid: string;
  sharedWith: string; // DID
  permissions: string[];
  sharedAt: string;
  expiresAt?: string;
  status: 'active' | 'revoked' | 'expired';
}

const KEYS = {
  records: 'mln_medical_records',
  access: 'mln_record_access',
  shares: 'mln_record_shares',
  encryption: 'mln_encryption_keys',
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

// Generate encryption key from password/passphrase using Web Crypto API
async function generateEncryptionKey(passphrase: string, salt: string): Promise<CryptoKey> {
  // Convert passphrase and salt to Uint8Array
  const encoder = new TextEncoder();
  const passphraseData = encoder.encode(passphrase);
  const saltData = encoder.encode(salt);

  // Import the passphrase as a key for PBKDF2
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passphraseData,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive key using PBKDF2
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltData,
      iterations: 10000,
      hash: 'SHA-256',
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data using Web Crypto API
async function encryptData(data: any, key: CryptoKey): Promise<{ encrypted: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96 bits for GCM
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(data));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    dataBuffer
  );

  // Convert to base64 for storage
  const encryptedArray = new Uint8Array(encrypted);
  const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray));
  const ivBase64 = btoa(String.fromCharCode(...iv));

  return {
    encrypted: encryptedBase64,
    iv: ivBase64
  };
}

// Decrypt data using Web Crypto API
async function decryptData(encryptedData: string, key: CryptoKey, ivBase64: string): Promise<any> {
  const iv = new Uint8Array(
    atob(ivBase64).split('').map(char => char.charCodeAt(0))
  );

  const encryptedArray = new Uint8Array(
    atob(encryptedData).split('').map(char => char.charCodeAt(0))
  );

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encryptedArray
  );

  const decoder = new TextDecoder();
  const decryptedText = decoder.decode(decrypted);
  return JSON.parse(decryptedText);
}

// Upload to IPFS (mock implementation - replace with actual IPFS client)
async function uploadToIPFS(data: any): Promise<string> {
  // In a real implementation, you would use a library like ipfs-http-client
  // For now, we'll simulate an IPFS hash
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(data)));
  const hashArray = new Uint8Array(hash);
  const hashString = Array.from(hashArray, byte => byte.toString(16).padStart(2, '0')).join('');
  return `Qm${hashString.substring(0, 44)}`; // Simulate IPFS hash format
}

// Download from IPFS (mock implementation)
async function downloadFromIPFS(hash: string): Promise<any> {
  // In a real implementation, you would fetch from IPFS
  // For now, we'll return mock data
  console.log(`Downloading from IPFS: ${hash}`);
  return { mockData: true, hash };
}

// Create a new medical record
export async function createMedicalRecord(
  patientDid: string,
  title: string,
  description: string,
  type: MedicalRecord['type'],
  content: any,
  createdBy: string,
  passphrase?: string
): Promise<MedicalRecord> {
  const recordId = `record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  // Generate encryption parameters
  const salt = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  const encryptionKey = passphrase ?
    await generateEncryptionKey(passphrase, salt) :
    await generateEncryptionKey('demo-key', salt);

  // Encrypt content
  const { encrypted, iv } = await encryptData(content, encryptionKey);

  // Create record
  const record: MedicalRecord = {
    id: recordId,
    patientDid,
    title,
    description,
    type,
    content: {
      encrypted,
      iv,
      algorithm: 'AES-256-GCM'
    },
    metadata: {
      createdAt: now,
      updatedAt: now,
      createdBy,
      version: 1,
      tags: [],
      size: JSON.stringify(content).length,
      mimeType: content.mimeType || 'application/json'
    },
    encryption: {
      algorithm: 'AES-256-GCM',
      keyDerivation: 'PBKDF2',
      salt
    }
  };

  // Upload to IPFS
  try {
    record.ipfsHash = await uploadToIPFS({
      title,
      description,
      type,
      metadata: record.metadata
    });
  } catch (error) {
    console.error('Failed to upload to IPFS:', error);
  }

  // Store record
  const allRecords = readJSON<MedicalRecord[]>(KEYS.records, []);
  allRecords.push(record);
  writeJSON(KEYS.records, allRecords);

  // Log to HCS
  await logRecordToHCS({
    action: 'record_created',
    recordId,
    patientDid,
    createdBy,
    type,
    ipfsHash: record.ipfsHash,
    timestamp: now,
  });

  record.hcsSequence = 'hcs-sequence-' + Date.now();

  return record;
}

// Get medical records for a patient (with access control)
export async function getMedicalRecords(
  patientDid: string,
  requesterDid: string,
  passphrase?: string
): Promise<MedicalRecord[]> {
  // Check consent
  const hasConsent = await checkRecordAccess(patientDid, requesterDid);
  if (!hasConsent && patientDid !== requesterDid) {
    throw new Error('Access denied: No consent to view records');
  }

  const allRecords = readJSON<MedicalRecord[]>(KEYS.records, []);
  const patientRecords = allRecords.filter(r => r.patientDid === patientDid);

  // Decrypt records if passphrase provided
  if (passphrase) {
    const decryptedRecords = [];
    for (const record of patientRecords) {
      try {
        const key = await generateEncryptionKey(passphrase, record.encryption.salt);
        const decryptedContent = await decryptData(record.content.encrypted, key, record.content.iv);

        decryptedRecords.push({
          ...record,
          content: decryptedContent
        });
      } catch (error) {
        console.error('Failed to decrypt record:', error);
        decryptedRecords.push({
          ...record,
          content: { error: 'Failed to decrypt content' }
        });
      }
    }
    return decryptedRecords;
  }

  return patientRecords;
}

// Decrypt record content
export async function decryptRecordContent(record: MedicalRecord, passphrase: string): Promise<any> {
  try {
    const key = await generateEncryptionKey(passphrase, record.encryption.salt);
    return await decryptData(record.content.encrypted, key, record.content.iv);
  } catch (error) {
    console.error('Failed to decrypt record:', error);
    return { error: 'Failed to decrypt content' };
  }
}

// Update medical record
export async function updateMedicalRecord(
  recordId: string,
  updates: Partial<MedicalRecord>,
  updaterDid: string,
  passphrase?: string
): Promise<MedicalRecord | null> {
  const allRecords = readJSON<MedicalRecord[]>(KEYS.records, []);
  const recordIndex = allRecords.findIndex(r => r.id === recordId);

  if (recordIndex === -1) return null;

  const record = allRecords[recordIndex];

  // Check access permissions
  const hasAccess = await checkRecordAccess(record.patientDid, updaterDid);
  if (!hasAccess) {
    throw new Error('Access denied: No permission to update record');
  }

  // Update record
  const updatedRecord: MedicalRecord = {
    ...record,
    ...updates,
    metadata: {
      ...record.metadata,
      ...updates.metadata,
      updatedAt: new Date().toISOString(),
      version: record.metadata.version + 1
    }
  };

  // Re-encrypt if content changed
  if (updates.content && passphrase) {
    const key = await generateEncryptionKey(passphrase, record.encryption.salt);
    const { encrypted, iv } = await encryptData(updates.content, key);
    updatedRecord.content = {
      encrypted,
      iv,
      algorithm: 'AES-256-GCM'
    };
  }

  allRecords[recordIndex] = updatedRecord;
  writeJSON(KEYS.records, allRecords);

  // Log update to HCS
  await logRecordToHCS({
    action: 'record_updated',
    recordId,
    patientDid: record.patientDid,
    updatedBy: updaterDid,
    changes: Object.keys(updates),
    timestamp: updatedRecord.metadata.updatedAt,
  });

  return updatedRecord;
}

// Delete medical record (soft delete)
export async function deleteMedicalRecord(
  recordId: string,
  deleterDid: string
): Promise<boolean> {
  const allRecords = readJSON<MedicalRecord[]>(KEYS.records, []);
  const recordIndex = allRecords.findIndex(r => r.id === recordId);

  if (recordIndex === -1) return false;

  const record = allRecords[recordIndex];

  // Check access permissions
  const hasAccess = await checkRecordAccess(record.patientDid, deleterDid);
  if (!hasAccess) {
    throw new Error('Access denied: No permission to delete record');
  }

  // Soft delete by marking as deleted
  allRecords[recordIndex].metadata = {
    ...record.metadata,
    updatedAt: new Date().toISOString(),
    deleted: true,
    deletedBy: deleterDid
  };

  writeJSON(KEYS.records, allRecords);

  // Log deletion to HCS
  await logRecordToHCS({
    action: 'record_deleted',
    recordId,
    patientDid: record.patientDid,
    deletedBy: deleterDid,
    timestamp: new Date().toISOString(),
  });

  return true;
}

// Share record with another DID
export async function shareRecord(
  recordId: string,
  patientDid: string,
  sharedWith: string,
  permissions: string[],
  sharedBy: string,
  expiresAt?: string
): Promise<RecordShare> {
  const share: RecordShare = {
    recordId,
    patientDid,
    sharedWith,
    permissions,
    sharedAt: new Date().toISOString(),
    expiresAt,
    status: 'active'
  };

  const allShares = readJSON<RecordShare[]>(KEYS.shares, []);
  allShares.push(share);
  writeJSON(KEYS.shares, allShares);

  // Log share to HCS
  await logRecordToHCS({
    action: 'record_shared',
    recordId,
    patientDid,
    sharedWith,
    sharedBy,
    permissions,
    expiresAt,
    timestamp: share.sharedAt,
  });

  return share;
}

// Check if a DID has access to patient records
async function checkRecordAccess(patientDid: string, requesterDid: string): Promise<boolean> {
  // Patient always has access to their own records
  if (patientDid === requesterDid) return true;

  // Check consent
  try {
    const { hasActiveConsent } = await import('./consentManager');
    return hasActiveConsent(requesterDid, patientDid, 'read_records');
  } catch (error) {
    console.error('Error checking consent:', error);
    return false;
  }
}

// Get record access logs
export function getRecordAccessLogs(recordId: string): RecordAccess[] {
  const allAccess = readJSON<RecordAccess[]>(KEYS.access, []);
  return allAccess.filter(access => access.recordId === recordId);
}

// Get shared records for a DID
export function getSharedRecords(did: string): RecordShare[] {
  const allShares = readJSON<RecordShare[]>(KEYS.shares, []);
  return allShares.filter(share =>
    share.sharedWith === did &&
    share.status === 'active' &&
    (!share.expiresAt || new Date(share.expiresAt) > new Date())
  );
}

// Verify record integrity using IPFS hash
export async function verifyRecordIntegrity(record: MedicalRecord): Promise<boolean> {
  if (!record.ipfsHash) return false;

  try {
    const ipfsData = await downloadFromIPFS(record.ipfsHash);
    // In a real implementation, you would compare the hash of the current data
    // with the stored IPFS hash
    return true;
  } catch (error) {
    console.error('Failed to verify record integrity:', error);
    return false;
  }
}

// Log record operations to Hedera Consensus Service
async function logRecordToHCS(data: Record<string, any>): Promise<string> {
  try {
    const { HederaLogger } = await import('./hedera');
    return await HederaLogger.logRegistration({
      type: 'record_operation',
      ...data,
    });
  } catch (error) {
    console.error('Failed to log record operation to HCS:', error);
    return 'hcs-error';
  }
}

// Initialize demo records
export function initializeDemoRecords() {
  const demoRecords: MedicalRecord[] = [
    {
      id: 'record-1',
      patientDid: 'did:hedera:testnet:0.0.20001',
      title: 'Blood Test Results',
      description: 'Complete blood count and metabolic panel',
      type: 'test_result',
      content: {
        encrypted: 'encrypted-blood-test-data',
        iv: 'demo-iv',
        algorithm: 'AES-256-GCM'
      },
      metadata: {
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
        createdBy: 'did:hedera:testnet:0.0.20002',
        version: 1,
        tags: ['blood', 'test', 'routine'],
        size: 1024,
        mimeType: 'application/json'
      },
      ipfsHash: 'QmDemoBloodTestHash123456789',
      encryption: {
        algorithm: 'AES-256-GCM',
        keyDerivation: 'PBKDF2',
        salt: 'demo-salt-123'
      }
    },
    {
      id: 'record-2',
      patientDid: 'did:hedera:testnet:0.0.20001',
      title: 'Annual Physical Exam',
      description: 'Routine annual checkup and health assessment',
      type: 'diagnosis',
      content: {
        encrypted: 'encrypted-physical-exam-data',
        iv: 'demo-iv-2',
        algorithm: 'AES-256-GCM'
      },
      metadata: {
        createdAt: '2024-01-10T14:30:00.000Z',
        updatedAt: '2024-01-10T14:30:00.000Z',
        createdBy: 'did:hedera:testnet:0.0.20002',
        version: 1,
        tags: ['physical', 'exam', 'annual'],
        size: 2048,
        mimeType: 'application/json'
      },
      ipfsHash: 'QmDemoPhysicalExamHash987654321',
      encryption: {
        algorithm: 'AES-256-GCM',
        keyDerivation: 'PBKDF2',
        salt: 'demo-salt-456'
      }
    }
  ];

  // Only initialize if no records exist
  const existingRecords = readJSON<MedicalRecord[]>(KEYS.records, []);
  if (existingRecords.length === 0) {
    writeJSON(KEYS.records, demoRecords);
  }
}

// Auto-initialize demo records when module loads (only in browser)
if (typeof window !== 'undefined') {
  const existingData = localStorage.getItem(KEYS.records);
  if (!existingData) {
    initializeDemoRecords();
  }
}



