// FHIR REST API for MediLedger Nexus
// Provides standard FHIR endpoints for global health interoperability

import { NextRequest, NextResponse } from 'next/server';
import FHIRService, {
  FHIRResource,
  FHIRPatient,
  FHIRObservation,
  FHIRBundle,
  FHIRSearchParams,
  FHIROperationOutcome
} from '@/lib/fhirService';

// POST /api/fhir/Observation - Create new observation
export async function POST_OBSERVATION(request: NextRequest) {
  try {
    const observationData = await request.json();

    // Validate FHIR resource
    if (!FHIRService.validateFHIRResource(observationData)) {
      const outcome = FHIRService.createFHIROperationOutcome(
        'error',
        'invalid',
        'Invalid FHIR Observation resource'
      );
      return NextResponse.json(outcome, { status: 400 });
    }

    // Check consent for creating observations
    // In a real implementation, verify NFT consent for this patient

    // Store in health vault (encrypted)
    // For demo, just return success
    const response: FHIRObservation = {
      ...observationData,
      id: `obs-${Date.now()}`,
      status: 'preliminary'
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('FHIR Observation creation failed:', error);
    const outcome = FHIRService.createFHIROperationOutcome(
      'error',
      'processing',
      'Failed to create observation resource'
    );
    return NextResponse.json(outcome, { status: 500 });
  }
}

// GET /api/fhir/metadata - FHIR Capability Statement
export async function GET_FHIR_METADATA() {
  const capabilityStatement = {
    resourceType: 'CapabilityStatement',
    status: 'active',
    date: new Date().toISOString(),
    publisher: 'MediLedger Nexus',
    kind: 'instance',
    software: {
      name: 'MediLedger Nexus FHIR Server',
      version: '1.0.0'
    },
    fhirVersion: '4.0.1',
    format: ['json', 'xml'],
    rest: [{
      mode: 'server',
      resource: [
        {
          type: 'Patient',
          profile: 'https://mediledger.org/fhir/StructureDefinition/MediLedgerPatient',
          interaction: [
            { code: 'read' },
            { code: 'search-type' }
          ],
          searchParam: [
            { name: '_id', type: 'token' },
            { name: 'identifier', type: 'token' }
          ]
        },
        {
          type: 'Observation',
          profile: 'https://mediledger.org/fhir/StructureDefinition/MediLedgerObservation',
          interaction: [
            { code: 'read' },
            { code: 'create' },
            { code: 'search-type' }
          ],
          searchParam: [
            { name: '_id', type: 'token' },
            { name: 'subject', type: 'reference' },
            { name: 'category', type: 'token' }
          ]
        }
      ],
      operation: [
        {
          name: 'Patient-everything',
          definition: 'https://mediledger.org/fhir/OperationDefinition/Patient-everything'
        }
      ]
    }]
  };

  return NextResponse.json(capabilityStatement);
}
