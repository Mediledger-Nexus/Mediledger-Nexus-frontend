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
