import NFTConsentService from '@/services/nftConsentService';

// Initialize the consent NFT token on app startup
export async function initializeConsentSystem() {
  try {
    await NFTConsentService.initializeConsentToken();
    console.log('Consent NFT system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize consent NFT system:', error);
    throw error;
  }
}

// Create a consent request (for doctors to request access)
export async function createConsentRequest(
  patientDid: string,
  requesterDid: string,
  permissions: string[],
  dataTypes: string[],
  purpose: string,
  expiryDays: number = 30
) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: requestId,
    patientDid,
    requesterDid,
    permissions,
    dataTypes,
    purpose,
    expiryDays,
    status: 'pending' as const,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// Check if a doctor has valid consent for a patient
export async function checkConsentAccess(
  doctorDid: string,
  patientDid: string,
  permission: string
): Promise<boolean> {
  try {
    const consents = await NFTConsentService.getDoctorConsents(doctorDid);
    const validConsent = consents.find(consent =>
      consent.metadata.patientDid === patientDid &&
      consent.metadata.status === 'active' &&
      consent.metadata.permissions.some(p => p.includes(permission)) &&
      (!consent.metadata.expiresAt || new Date(consent.metadata.expiresAt) > new Date())
    );

    return !!validConsent;
  } catch (error) {
    console.error('Error checking consent access:', error);
    return false;
  }
}

// Batch process expired consents
export async function processExpiredConsents() {
  try {
    await NFTConsentService.revokeExpiredConsents();
    console.log('Expired consents processed successfully');
  } catch (error) {
    console.error('Error processing expired consents:', error);
  }
}
