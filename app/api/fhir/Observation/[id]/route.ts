// FHIR Observation API endpoints
import { NextRequest, NextResponse } from 'next/server';
import FHIRService, { FHIRObservation } from '@/lib/fhirService';

// GET /api/fhir/Observation/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const observationId = params.id;

    // Check consent for accessing observation data
    const observation: FHIRObservation = {
      resourceType: 'Observation',
      id: observationId,
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'vital-signs',
          display: 'Vital Signs'
        }]
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: '85354-9',
          display: 'Blood pressure panel'
        }]
      },
      subject: {
        reference: 'Patient/demo-patient'
      },
      effectiveDateTime: new Date().toISOString(),
      valueString: '[ENCRYPTED HEALTH DATA - REQUIRES CONSENT]',
      extension: [{
        url: 'https://mediledger.org/fhir/encrypted-data',
        valueString: 'true'
      }]
    };

    return NextResponse.json(observation);
  } catch (error) {
    console.error('FHIR Observation retrieval failed:', error);
    return NextResponse.json(
      FHIRService.createFHIROperationOutcome('error', 'processing', 'Failed to retrieve observation'),
      { status: 500 }
    );
  }
}

// POST /api/fhir/Observation
export async function POST(request: NextRequest) {
  try {
    const observationData = await request.json();

    if (!FHIRService.validateFHIRResource(observationData)) {
      return NextResponse.json(
        FHIRService.createFHIROperationOutcome('error', 'invalid', 'Invalid FHIR Observation'),
        { status: 400 }
      );
    }

    // Check consent for creating observations
    // Verify NFT consent for the target patient

    const response: FHIRObservation = {
      ...observationData,
      id: `obs-${Date.now()}`,
      status: 'preliminary'
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('FHIR Observation creation failed:', error);
    return NextResponse.json(
      FHIRService.createFHIROperationOutcome('error', 'processing', 'Failed to create observation'),
      { status: 500 }
    );
  }
}
