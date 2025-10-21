// FHIR Patient API endpoints
import { NextRequest, NextResponse } from 'next/server';
import FHIRService, { FHIRPatient } from '@/lib/fhirService';

// GET /api/fhir/Patient/[id]
export async function GET_PATIENT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = params.id;

    // Verify consent for accessing patient data
    // In production, this would check NFT consent tokens

    const patient: FHIRPatient = FHIRService.createFHIRPatient({
      id: patientId,
      firstName: 'Demo',
      lastName: 'Patient',
      privacyLevel: 'identified',
      did: patientId
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error('FHIR Patient retrieval failed:', error);
    return NextResponse.json(
      FHIRService.createFHIROperationOutcome('error', 'processing', 'Failed to retrieve patient'),
      { status: 500 }
    );
  }
}
