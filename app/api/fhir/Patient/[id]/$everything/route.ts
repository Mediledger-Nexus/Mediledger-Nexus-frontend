// FHIR Patient Everything API endpoint
import { NextRequest, NextResponse } from 'next/server';
import FHIRService, { FHIRBundle } from '@/lib/fhirService';

// GET /api/fhir/Patient/[id]/$everything
export async function GET_PATIENT_EVERYTHING(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = params.id;

    // Verify comprehensive consent for patient summary access
    // This would require NFT consent with broader permissions

    // For demo, return mock patient summary bundle
    const bundle: FHIRBundle = {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: [
        {
          resource: FHIRService.createFHIRPatient({
            id: patientId,
            firstName: 'Demo',
            lastName: 'Patient',
            privacyLevel: 'identified' as const
          })
        },
        {
          resource: FHIRService.createFHIRObservation({
            id: 'obs-vitals',
            dataType: 'vitals'
          }, patientId)
        },
        {
          resource: FHIRService.createFHIRObservation({
            id: 'obs-meds',
            dataType: 'medications'
          }, patientId)
        }
      ]
    };

    return NextResponse.json(bundle);
  } catch (error) {
    console.error('FHIR Patient everything failed:', error);
    return NextResponse.json(
      FHIRService.createFHIROperationOutcome('error', 'processing', 'Failed to retrieve patient summary'),
      { status: 500 }
    );
  }
}
