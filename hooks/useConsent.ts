import { NFTConsentService } from '@/services/nftConsentService';

// Initialize the consent system when the app starts
export async function initializeConsentSystem() {
  try {
    await NFTConsentService.initializeConsentToken();
    console.log('✅ NFT Consent System initialized successfully');

    // Set up periodic cleanup of expired consents (every 24 hours)
    setInterval(async () => {
      try {
        await NFTConsentService.revokeExpiredConsents();
        console.log('🧹 Cleaned up expired consents');
      } catch (error) {
        console.error('❌ Failed to clean up expired consents:', error);
      }
    }, 24 * 60 * 60 * 1000);

  } catch (error) {
    console.error('❌ Failed to initialize NFT Consent System:', error);
    throw error;
  }
}

// Hook for React components to use consent functionality
export function useConsent() {
  const grantConsent = async (
    patientDid: string,
    doctorDid: string,
    permissions: string[],
    dataTypes: string[],
    purpose: string,
    expiryDays: number = 30
  ) => {
    return await NFTConsentService.grantConsent(
      patientDid,
      doctorDid,
      permissions.map(p => ({ type: p as any, scope: ['all'] })),
      dataTypes,
      purpose,
      expiryDays
    );
  };

  const revokeConsent = async (consentId: string, revokerDid: string) => {
    return await NFTConsentService.revokeConsent(consentId, revokerDid);
  };

  const checkConsentAccess = async (doctorDid: string, patientDid: string, permission: string) => {
    const consents = await NFTConsentService.getDoctorConsents(doctorDid);
    return consents.some(consent =>
      consent.metadata.patientDid === patientDid &&
      consent.metadata.status === 'active' &&
      consent.metadata.permissions.some(p => p.includes(permission))
    );
  };

  const getPatientConsents = async (patientDid: string) => {
    return await NFTConsentService.getPatientConsents(patientDid);
  };

  const getDoctorConsents = async (doctorDid: string) => {
    return await NFTConsentService.getDoctorConsents(doctorDid);
  };

  return {
    grantConsent,
    revokeConsent,
    checkConsentAccess,
    getPatientConsents,
    getDoctorConsents
  };
}

export default useConsent;
