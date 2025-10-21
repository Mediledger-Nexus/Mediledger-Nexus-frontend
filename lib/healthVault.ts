// Zero-Knowledge Health Vault System for MediLedger Nexus
// Provides privacy-preserving encrypted storage for healthcare data

export interface HealthRecord {
  id: string;
  patientId: string;
  dataType: 'vitals' | 'medications' | 'lab_results' | 'imaging' | 'notes' | 'emergency';
  encryptedData: string; // AES-256 encrypted JSON
  metadata: {
    createdAt: string;
    updatedAt: string;
    size: number; // bytes
    checksum: string;
  };
  accessControl: {
    owner: string; // Patient DID
    authorizedViewers: string[]; // Doctor DIDs with access
    emergencyAccess: boolean;
    expiresAt?: string;
  };
  zkProof?: {
    proofHash: string;
    verificationKey: string;
    publicInputs: string[];
  };
}

export interface VaultAccess {
  recordId: string;
  requesterDid: string;
  patientDid: string;
  accessType: 'read' | 'write' | 'emergency';
  grantedAt: string;
  expiresAt?: string;
  zkProofRequired: boolean;
  status: 'pending' | 'granted' | 'denied' | 'expired';
}

export interface EncryptedVault {
  patientId: string;
  records: Map<string, HealthRecord>;
  masterKey: string; // Encrypted with patient's private key
  backupKeys: string[]; // Encrypted shares for recovery
  createdAt: string;
  lastAccessed: string;
}

// Core encryption utilities
export class HealthVaultCrypto {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;

  /**
   * Generate a new master key for a patient's vault
   */
  static async generateMasterKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt health record data
   */
  static async encryptRecord(data: any, key: CryptoKey): Promise<string> {
    const dataString = JSON.stringify(data);
    const dataBuffer = new TextEncoder().encode(dataString);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: this.ALGORITHM, iv },
      key,
      dataBuffer
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt health record data
   */
  static async decryptRecord(encryptedData: string, key: CryptoKey): Promise<any> {
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: this.ALGORITHM, iv },
      key,
      encrypted
    );

    const dataString = new TextDecoder().decode(decrypted);
    return JSON.parse(dataString);
  }

  /**
   * Generate zero-knowledge proof for data validity
   */
  static async generateZkProof(dataHash: string, key: CryptoKey): Promise<any> {
    // In a real implementation, this would use a zk-SNARK library like snarkjs
    // For now, return a mock proof structure
    return {
      proofHash: dataHash,
      verificationKey: 'mock-verification-key',
      publicInputs: [dataHash],
      proof: 'mock-proof-data'
    };
  }

  /**
   * Verify zero-knowledge proof
   */
  static async verifyZkProof(proof: any): Promise<boolean> {
    // In a real implementation, this would verify the zk-SNARK proof
    // For now, return true for demo purposes
    return true;
  }
}

// Main health vault service
export class ZeroKnowledgeHealthVault {
  private vault: EncryptedVault | null = null;
  private masterKey: CryptoKey | null = null;

  /**
   * Initialize or load patient's health vault
   */
  async initializeVault(patientDid: string, patientPrivateKey: string): Promise<void> {
    // In a real implementation, this would load from IPFS/Arweave
    // For demo, we'll create an in-memory vault
    this.vault = {
      patientId: patientDid,
      records: new Map(),
      masterKey: '', // Would be encrypted with patient's private key
      backupKeys: [],
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString()
    };

    this.masterKey = await HealthVaultCrypto.generateMasterKey();
  }

  /**
   * Store a health record with encryption
   */
  async storeRecord(record: Omit<HealthRecord, 'id' | 'metadata' | 'zkProof'>): Promise<string> {
    if (!this.vault || !this.masterKey) {
      throw new Error('Vault not initialized');
    }

    const recordId = `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Encrypt the record data
    const encryptedData = await HealthVaultCrypto.encryptRecord(
      record,
      this.masterKey
    );

    // Generate zero-knowledge proof for data validity
    const dataHash = await this.generateDataHash(record);
    const zkProof = await HealthVaultCrypto.generateZkProof(dataHash, this.masterKey);

    const healthRecord: HealthRecord = {
      id: recordId,
      ...record,
      encryptedData,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        size: encryptedData.length,
        checksum: dataHash
      },
      zkProof
    };

    this.vault.records.set(recordId, healthRecord);
    this.vault.lastAccessed = new Date().toISOString();

    // In a real implementation, save to IPFS/Arweave
    await this.persistToStorage();

    return recordId;
  }

  /**
   * Retrieve and decrypt a health record
   */
  async retrieveRecord(recordId: string, requesterDid: string): Promise<any> {
    if (!this.vault || !this.masterKey) {
      throw new Error('Vault not initialized');
    }

    const record = this.vault.records.get(recordId);
    if (!record) {
      throw new Error('Record not found');
    }

    // Check access permissions
    const hasAccess = await this.checkAccess(recordId, requesterDid);
    if (!hasAccess) {
      throw new Error('Access denied');
    }

    // Decrypt the record
    const decryptedData = await HealthVaultCrypto.decryptRecord(
      record.encryptedData,
      this.masterKey
    );

    // Verify zk-proof if present
    if (record.zkProof) {
      const isValid = await HealthVaultCrypto.verifyZkProof(record.zkProof);
      if (!isValid) {
        throw new Error('Data integrity verification failed');
      }
    }

    this.vault.lastAccessed = new Date().toISOString();
    return decryptedData;
  }

  /**
   * Grant access to a specific record for a doctor
   */
  async grantAccess(recordId: string, doctorDid: string, accessType: 'read' | 'write', duration?: number): Promise<void> {
    if (!this.vault) {
      throw new Error('Vault not initialized');
    }

    const record = this.vault.records.get(recordId);
    if (!record) {
      throw new Error('Record not found');
    }

    // Add to authorized viewers
    if (!record.accessControl.authorizedViewers.includes(doctorDid)) {
      record.accessControl.authorizedViewers.push(doctorDid);
    }

    // Set expiration if specified
    if (duration) {
      const expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
      record.accessControl.expiresAt = expiresAt.toISOString();
    }

    record.metadata.updatedAt = new Date().toISOString();
    await this.persistToStorage();
  }

  /**
   * Revoke access to a record
   */
  async revokeAccess(recordId: string, doctorDid: string): Promise<void> {
    if (!this.vault) {
      throw new Error('Vault not initialized');
    }

    const record = this.vault.records.get(recordId);
    if (!record) {
      throw new Error('Record not found');
    }

    record.accessControl.authorizedViewers = record.accessControl.authorizedViewers.filter(
      did => did !== doctorDid
    );

    record.metadata.updatedAt = new Date().toISOString();
    await this.persistToStorage();
  }

  /**
   * Emergency access override
   */
  async emergencyAccess(recordId: string, doctorDid: string, reason: string): Promise<any> {
    if (!this.vault || !this.masterKey) {
      throw new Error('Vault not initialized');
    }

    const record = this.vault.records.get(recordId);
    if (!record) {
      throw new Error('Record not found');
    }

    // Log emergency access for audit
    console.log(`Emergency access granted: ${doctorDid} -> ${recordId} (${reason})`);

    // Grant temporary access
    record.accessControl.emergencyAccess = true;

    return await this.retrieveRecord(recordId, doctorDid);
  }

  /**
   * Generate data hash for integrity verification
   */
  private async generateDataHash(data: any): Promise<string> {
    const dataString = JSON.stringify(data);
    const dataBuffer = new TextEncoder().encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Check if requester has access to record
   */
  private async checkAccess(recordId: string, requesterDid: string): Promise<boolean> {
    if (!this.vault) return false;

    const record = this.vault.records.get(recordId);
    if (!record) return false;

    // Owner always has access
    if (record.patientId === requesterDid) return true;

    // Check if in authorized viewers
    if (record.accessControl.authorizedViewers.includes(requesterDid)) {
      // Check expiration
      if (record.accessControl.expiresAt) {
        return new Date(record.accessControl.expiresAt) > new Date();
      }
      return true;
    }

    // Emergency access
    if (record.accessControl.emergencyAccess) return true;

    return false;
  }

  /**
   * Persist vault to decentralized storage
   */
  private async persistToStorage(): Promise<void> {
    if (!this.vault) return;

    // In a real implementation, this would save to IPFS/Arweave
    // For demo purposes, we'll just log
    console.log('Persisting vault to decentralized storage...');

    // Mock IPFS hash
    const mockIpfsHash = `Qm${Math.random().toString(36).substr(2, 46)}`;
    console.log(`Vault persisted to IPFS: ${mockIpfsHash}`);
  }

  /**
   * Get vault statistics
   */
  getVaultStats(): {
    totalRecords: number;
    totalSize: number;
    lastAccessed: string;
    zkProofsCount: number;
  } {
    if (!this.vault) {
      return { totalRecords: 0, totalSize: 0, lastAccessed: '', zkProofsCount: 0 };
    }

    let totalSize = 0;
    let zkProofsCount = 0;

    this.vault.records.forEach(record => {
      totalSize += record.metadata.size;
      if (record.zkProof) zkProofsCount++;
    });

    return {
      totalRecords: this.vault.records.size,
      totalSize,
      lastAccessed: this.vault.lastAccessed,
      zkProofsCount
    };
  }

  /**
   * Export vault for backup/migration
   */
  async exportVault(): Promise<string> {
    if (!this.vault || !this.masterKey) {
      throw new Error('Vault not initialized');
    }

    // In a real implementation, this would export the encrypted vault
    // For demo, return a mock export
    return JSON.stringify({
      patientId: this.vault.patientId,
      recordCount: this.vault.records.size,
      exportedAt: new Date().toISOString(),
      // In reality, this would be encrypted with a backup key
    });
  }
}

export default ZeroKnowledgeHealthVault;
