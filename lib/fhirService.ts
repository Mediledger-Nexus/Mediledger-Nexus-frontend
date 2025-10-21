// HL7 FHIR Integration for MediLedger Nexus
// Enables global health interoperability while maintaining privacy

export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    source?: string;
    profile?: string[];
    security?: Array<{
      system: string;
      code: string;
      display?: string;
    }>;
    tag?: Array<{
      system: string;
      code: string;
      display?: string;
    }>;
  };
  extension?: Array<{
    url: string;
    valueString?: string;
    valueCode?: string;
    valueReference?: {
      reference: string;
    };
  }>;
}

// Core FHIR Resources for healthcare interoperability
export interface FHIRPatient extends FHIRResource {
  resourceType: 'Patient';
  identifier?: Array<{
    use?: 'usual' | 'official' | 'temp' | 'secondary';
    type?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    system?: string;
    value: string;
  }>;
  name?: Array<{
    use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
    text?: string;
    family?: string;
    given?: string[];
    prefix?: string[];
    suffix?: string[];
  }>;
  telecom?: Array<{
    system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
    value: string;
    use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  }>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: Array<{
    use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
    type?: 'postal' | 'physical' | 'both';
    text?: string;
    line?: string[];
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
  maritalStatus?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  contact?: Array<{
    relationship?: Array<{
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    }>;
    name?: {
      text?: string;
      family?: string;
      given?: string[];
    };
    telecom?: Array<{
      system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
      value: string;
      use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
    }>;
  }>;
}

export interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation';
  identifier?: Array<{
    system?: string;
    value: string;
  }>;
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text?: string;
  };
  subject: {
    reference: string;
    display?: string;
  };
  effectiveDateTime?: string;
  effectivePeriod?: {
    start: string;
    end: string;
  };
  issued?: string;
  performer?: Array<{
    reference: string;
    display?: string;
  }>;
  valueQuantity?: {
    value: number;
    unit: string;
    system?: string;
    code?: string;
  };
  valueCodeableConcept?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text?: string;
  };
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueRange?: {
    low: {
      value: number;
      unit: string;
    };
    high: {
      value: number;
      unit: string;
    };
  };
  valueRatio?: {
    numerator: {
      value: number;
      unit: string;
    };
    denominator: {
      value: number;
      unit: string;
    };
  };
  valueSampledData?: {
    origin: {
      value: number;
      unit: string;
    };
    period: number;
    factor: number;
    lowerLimit: number;
    upperLimit: number;
    dimensions: number;
    data: string;
  };
  valueTime?: string;
  valueDateTime?: string;
  valuePeriod?: {
    start: string;
    end: string;
  };
  dataAbsentReason?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  interpretation?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  note?: Array<{
    text: string;
  }>;
  bodySite?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  method?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  specimen?: {
    reference: string;
  };
  device?: {
    reference: string;
  };
  referenceRange?: Array<{
    low?: {
      value: number;
      unit: string;
    };
    high?: {
      value: number;
      unit: string;
    };
    type?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    appliesTo?: Array<{
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    }>;
    age?: {
      low?: {
        value: number;
        unit: string;
      };
      high?: {
        value: number;
        unit: string;
      };
    };
    text?: string;
  }>;
}

export interface FHIRMedicationRequest extends FHIRResource {
  resourceType: 'MedicationRequest';
  identifier?: Array<{
    system?: string;
    value: string;
  }>;
  status: 'active' | 'on-hold' | 'cancelled' | 'completed' | 'entered-in-error' | 'stopped' | 'draft' | 'unknown';
  intent: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';
  doNotPerform?: boolean;
  reportedBoolean?: boolean;
  reportedReference?: {
    reference: string;
  };
  medicationCodeableConcept?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text?: string;
  };
  medicationReference?: {
    reference: string;
  };
  subject: {
    reference: string;
  };
  encounter?: {
    reference: string;
  };
  supportingInformation?: Array<{
    reference: string;
  }>;
  authoredOn?: string;
  requester?: {
    reference: string;
    display?: string;
  };
  performer?: {
    reference: string;
  };
  performerType?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  recorder?: {
    reference: string;
  };
  reasonCode?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  reasonReference?: Array<{
    reference: string;
  }>;
  instantiatesCanonical?: string[];
  instantiatesUri?: string[];
  basedOn?: Array<{
    reference: string;
  }>;
  groupIdentifier?: {
    system?: string;
    value: string;
  };
  courseOfTherapyType?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  insurance?: Array<{
    reference: string;
  }>;
  note?: Array<{
    text: string;
  }>;
  dosageInstruction?: Array<{
    sequence?: number;
    text?: string;
    additionalInstruction?: Array<{
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    }>;
    patientInstruction?: string;
    timing?: {
      event?: string[];
      repeat?: {
        boundsDuration?: {
          value: number;
          unit: string;
        };
        boundsRange?: {
          low: {
            value: number;
            unit: string;
          };
          high: {
            value: number;
            unit: string;
          };
        };
        boundsPeriod?: {
          start: string;
          end: string;
        };
        count?: number;
        countMax?: number;
        duration?: number;
        durationMax?: number;
        durationUnit?: string;
        frequency?: number;
        frequencyMax?: number;
        period?: number;
        periodMax?: number;
        periodUnit?: string;
        dayOfWeek?: string[];
        timeOfDay?: string[];
        when?: string[];
        offset?: number;
        comment?: string;
      };
      code?: {
        coding: Array<{
          system: string;
          code: string;
          display: string;
        }>;
      };
    };
    asNeededBoolean?: boolean;
    asNeededCodeableConcept?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    site?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    route?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    method?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    doseAndRate?: Array<{
      type?: {
        coding: Array<{
          system: string;
          code: string;
          display: string;
        }>;
      };
      doseRange?: {
        low: {
          value: number;
          unit: string;
        };
        high: {
          value: number;
          unit: string;
        };
      };
      doseQuantity?: {
        value: number;
        unit: string;
      };
      rateRatio?: {
        numerator: {
          value: number;
          unit: string;
        };
        denominator: {
          value: number;
          unit: string;
        };
      };
      rateRange?: {
        low: {
          value: number;
          unit: string;
        };
        high: {
          value: number;
          unit: string;
        };
      };
      rateQuantity?: {
        value: number;
        unit: string;
      };
    }>;
    maxDosePerPeriod?: {
      numerator: {
        value: number;
        unit: string;
      };
      denominator: {
        value: number;
        unit: string;
      };
    };
    maxDosePerAdministration?: {
      value: number;
      unit: string;
    };
    maxDosePerLifetime?: {
      value: number;
      unit: string;
    };
  }>;
  dispenseRequest?: {
    initialFill?: {
      quantity?: {
        value: number;
        unit: string;
      };
      duration?: {
        value: number;
        unit: string;
      };
    };
    dispenseInterval?: {
      value: number;
      unit: string;
    };
    validityPeriod?: {
      start: string;
      end: string;
    };
    numberOfRepeatsAllowed?: number;
    quantity?: {
      value: number;
      unit: string;
    };
    expectedSupplyDuration?: {
      value: number;
      unit: string;
    };
    performer?: {
      reference: string;
    };
  };
  substitution?: {
    allowedBoolean?: boolean;
    allowedCodeableConcept?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    reason?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
  };
  priorPrescription?: {
    reference: string;
  };
  detectedIssue?: Array<{
    reference: string;
  }>;
  eventHistory?: Array<{
    reference: string;
  }>;
}

export interface FHIRBundle extends FHIRResource {
  resourceType: 'Bundle';
  type: 'document' | 'message' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history' | 'searchset' | 'collection';
  timestamp?: string;
  total?: number;
  link?: Array<{
    relation: string;
    url: string;
  }>;
  entry?: Array<{
    fullUrl?: string;
    resource?: FHIRResource;
    search?: {
      mode?: 'match' | 'include' | 'outcome';
      score?: number;
    };
    request?: {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      url: string;
      ifNoneMatch?: string;
      ifModifiedSince?: string;
      ifMatch?: string;
      ifNoneExist?: string;
    };
    response?: {
      status: string;
      location?: string;
      etag?: string;
      lastModified?: string;
      outcome?: FHIRResource;
    };
  }>;
  signature?: {
    type: Array<{
      system: string;
      code: string;
    }>;
    when: string;
    who: {
      reference: string;
    };
    contentType: string;
    blob: string;
  };
}

// MediLedger-specific FHIR extensions for privacy and consent
export interface MediLedgerFHIRProfile {
  // Privacy level extension
  privacyLevel: 'anonymous' | 'pseudonymous' | 'identified';

  // Consent reference extension
  consentReference?: string; // Reference to NFT consent

  // Zero-knowledge proof extension
  zkProof?: {
    proofHash: string;
    verificationKey: string;
  };

  // Token economy extension
  healTokenReward?: number;

  // Emergency access extension
  emergencyAccess?: boolean;
}

// FHIR Search Parameters
export interface FHIRSearchParams {
  _id?: string;
  _lastUpdated?: string;
  _tag?: string;
  _profile?: string;
  _security?: string;
  _text?: string;
  _content?: string;
  _list?: string;
  _has?: string;
  _type?: string;
  _sort?: string;
  _count?: number;
  _include?: string;
  _revinclude?: string;
  _summary?: 'true' | 'text' | 'data' | 'count' | 'false';
  _elements?: string;
  _contained?: 'true' | 'false' | 'both';
  _containedType?: string;
}

// FHIR Operation Outcomes
export interface FHIROperationOutcome extends FHIRResource {
  resourceType: 'OperationOutcome';
  issue: Array<{
    severity: 'fatal' | 'error' | 'warning' | 'information';
    code: string;
    details?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
      text?: string;
    };
    diagnostics?: string;
    location?: string[];
    expression?: string[];
  }>;
}

// Core FHIR Service for MediLedger Nexus
export class FHIRService {
  private static readonly FHIR_VERSION = '4.0.1';
  private static readonly BASE_URL = '/fhir';

  /**
   * Create FHIR Patient resource from MediLedger patient data
   */
  static createFHIRPatient(patientData: any): FHIRPatient {
    return {
      resourceType: 'Patient',
      id: patientData.id || `patient-${Date.now()}`,
      meta: {
        profile: ['https://mediledger.org/fhir/StructureDefinition/MediLedgerPatient'],
        security: [{
          system: 'https://mediledger.org/fhir/privacy-level',
          code: patientData.privacyLevel || 'identified'
        }]
      },
      identifier: [{
        system: 'https://mediledger.org/patient-id',
        value: patientData.did || patientData.id
      }],
      name: [{
        use: 'official',
        family: patientData.lastName || 'Unknown',
        given: [patientData.firstName || 'Unknown']
      }],
      gender: patientData.gender || 'unknown',
      birthDate: patientData.birthDate,
      telecom: patientData.contactInfo ? [{
        system: 'email',
        value: patientData.contactInfo.email,
        use: 'home'
      }] : undefined,
      extension: patientData.privacyLevel ? [{
        url: 'https://mediledger.org/fhir/privacy-level',
        valueCode: patientData.privacyLevel
      }] : undefined
    };
  }

  /**
   * Create FHIR Observation from health record
   */
  static createFHIRObservation(record: any, patientId: string): FHIRObservation {
    return {
      resourceType: 'Observation',
      id: record.id,
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: this.mapDataTypeToCategory(record.dataType),
          display: record.dataType
        }]
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: this.mapDataTypeToLOINC(record.dataType),
          display: record.dataType
        }],
        text: record.dataType
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      effectiveDateTime: record.metadata?.createdAt || new Date().toISOString(),
      issued: new Date().toISOString(),
      valueString: typeof record.encryptedData === 'string' ? '[ENCRYPTED DATA]' : 'Health record data',
      note: [{
        text: `Encrypted health record. Access requires patient consent via NFT token.`
      }],
      extension: [{
        url: 'https://mediledger.org/fhir/encrypted-data',
        valueString: 'true'
      }]
    };
  }

  /**
   * Create FHIR Bundle for patient summary
   */
  static createPatientSummaryBundle(patientId: string, resources: FHIRResource[]): FHIRBundle {
    return {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: resources.map(resource => ({
        fullUrl: `${this.BASE_URL}/${resource.resourceType}/${resource.id}`,
        resource
      }))
    };
  }

  /**
   * Parse FHIR Bundle
   */
  static parseFHIRBundle(bundleData: any): FHIRBundle {
    return bundleData as FHIRBundle;
  }

  /**
   * Validate FHIR resource against schema
   */
  static validateFHIRResource(resource: FHIRResource): boolean {
    // Basic validation - in production would use proper FHIR validator
    return !!(resource.resourceType && typeof resource.resourceType === 'string');
  }

  /**
   * Map internal data types to FHIR categories
   */
  private static mapDataTypeToCategory(dataType: string): string {
    const mapping: Record<string, string> = {
      'vitals': 'vital-signs',
      'medications': 'medication',
      'lab_results': 'laboratory',
      'imaging': 'imaging',
      'notes': 'clinical-note',
      'emergency': 'emergency'
    };
    return mapping[dataType] || 'other';
  }

  /**
   * Map internal data types to LOINC codes
   */
  private static mapDataTypeToLOINC(dataType: string): string {
    const mapping: Record<string, string> = {
      'vitals': '85353-1', // Vital signs panel
      'medications': '10160-0', // History of medication use
      'lab_results': '26436-6', // Laboratory studies
      'imaging': '18748-4', // Diagnostic imaging study
      'notes': '34109-9', // Note
      'emergency': '67796-2', // Emergency department Note
      'blood_pressure': '85354-9', // Blood pressure panel
      'heart_rate': '8867-4', // Heart rate
      'temperature': '8310-5', // Body temperature
      'weight': '29463-7', // Body weight
      'height': '8302-2' // Body height
    };
    return mapping[dataType] || '34109-9'; // Default to generic note
  }

  /**
   * Search FHIR resources
   */
  static searchFHIRResources(
    resourceType: string,
    params: FHIRSearchParams
  ): Promise<FHIRResource[]> {
    // In a real implementation, this would query the FHIR server
    // For demo purposes, return empty array
    return Promise.resolve([]);
  }

  /**
   * Export health vault data as FHIR Bundle
   */
  static async exportToFHIR(
    patientDid: string,
    records: any[],
    privacyLevel: 'anonymous' | 'pseudonymous' | 'identified' = 'identified'
  ): Promise<FHIRBundle> {
    const fhirResources: FHIRResource[] = [];

    // Create patient resource
    const patientResource = this.createFHIRPatient({
      id: patientDid,
      privacyLevel,
      did: patientDid
    });
    fhirResources.push(patientResource);

    // Create observation resources for each record
    for (const record of records) {
      const observation = this.createFHIRObservation(record, patientDid);
      fhirResources.push(observation);
    }

    return this.createPatientSummaryBundle(patientDid, fhirResources);
  }

  /**
   * Import FHIR data into health vault
   */
  static async importFromFHIR(
    fhirBundle: FHIRBundle,
    targetPatientDid: string
  ): Promise<any[]> {
    const importedRecords: any[] = [];

    if (fhirBundle.entry) {
      for (const entry of fhirBundle.entry) {
        if (entry.resource?.resourceType === 'Observation') {
          const observation = entry.resource as FHIRObservation;

          // Transform FHIR Observation back to internal format
          const record = {
            dataType: this.mapFHIRCategoryToDataType(observation.category?.[0]?.coding?.[0]?.code || 'notes'),
            content: `Imported from FHIR: ${observation.code?.text || 'Medical observation'}`,
            metadata: {
              importedFromFHIR: true,
              originalFHIRId: observation.id,
              source: observation.performer?.[0]?.display || 'Unknown'
            }
          };

          importedRecords.push(record);
        }
      }
    }

    return importedRecords;
  }

  /**
   * Map FHIR category back to internal data type
   */
  private static mapFHIRCategoryToDataType(fhirCategory: string): string {
    const mapping: Record<string, string> = {
      'vital-signs': 'vitals',
      'medication': 'medications',
      'laboratory': 'lab_results',
      'imaging': 'imaging',
      'clinical-note': 'notes',
      'emergency': 'emergency'
    };
    return mapping[fhirCategory] || 'notes';
  }

  /**
   * Generate FHIR-compliant error response
   */
  static createFHIROperationOutcome(
    severity: 'fatal' | 'error' | 'warning' | 'information',
    code: string,
    message: string
  ): FHIROperationOutcome {
    return {
      resourceType: 'OperationOutcome',
      issue: [{
        severity,
        code,
        diagnostics: message
      }]
    };
  }
}

export default FHIRService;
