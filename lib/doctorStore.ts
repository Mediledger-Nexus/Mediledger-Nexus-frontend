// Doctor-specific data management for MediLedger Nexus
// Handles doctor-patient relationships, consent management, and record access

export interface DoctorPatient {
  id: string; // Patient DID
  name: string;
  age: number;
  lastVisit: string;
  hasConsent: boolean;
  consentStatus: 'granted' | 'pending' | 'denied' | 'expired';
  consentExpiry?: string;
  records: MedicalRecord[];
}

export interface MedicalRecord {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'diagnosis' | 'prescription' | 'test_result' | 'note' | 'vaccination';
  issuer: string;
  content?: string;
  doctorNotes?: DoctorNote[];
}

export interface DoctorNote {
  id: string;
  doctorDid: string;
  content: string;
  timestamp: string;
  hcsSequence?: string;
}

export interface ConsentRequest {
  id: string;
  doctorDid: string;
  patientDid: string;
  status: 'pending' | 'granted' | 'denied';
  requestDate: string;
  expiryDate?: string;
  permissions: string[];
}

const KEYS = {
  doctorPatients: 'mln_doctor_patients',
  consentRequests: 'mln_consent_requests',
  doctorNotes: 'mln_doctor_notes',
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

// Get all patients for a doctor
export function getDoctorPatients(doctorWalletId: string): DoctorPatient[] {
  const allPatients = readJSON<Record<string, DoctorPatient[]>>(KEYS.doctorPatients, {});
  return allPatients[doctorWalletId] || [];
}

// Add a patient to doctor's list
export function addPatientToDoctor(doctorWalletId: string, patient: DoctorPatient) {
  const allPatients = readJSON<Record<string, DoctorPatient[]>>(KEYS.doctorPatients, {});
  const doctorPatients = allPatients[doctorWalletId] || [];
  
  // Check if patient already exists
  const existingIndex = doctorPatients.findIndex(p => p.id === patient.id);
  if (existingIndex >= 0) {
    doctorPatients[existingIndex] = patient;
  } else {
    doctorPatients.push(patient);
  }
  
  allPatients[doctorWalletId] = doctorPatients;
  writeJSON(KEYS.doctorPatients, allPatients);
}

// Get patient records (with consent check)
export function getPatientRecords(patientDid: string): MedicalRecord[] {
  // Mock data for demo - in production, this would check consent and fetch from IPFS
  const mockRecords: MedicalRecord[] = [
    {
      id: 'rec-1',
      title: 'Blood Test Results',
      description: 'Complete blood count and metabolic panel',
      date: '2024-01-15',
      type: 'test_result',
      issuer: 'Lagos General Hospital',
      content: 'All values within normal range. Cholesterol slightly elevated.',
      doctorNotes: []
    },
    {
      id: 'rec-2',
      title: 'Annual Physical Exam',
      description: 'Routine annual checkup and health assessment',
      date: '2024-01-10',
      type: 'diagnosis',
      issuer: 'Dr. Sarah Chen',
      content: 'Patient in good health. Recommend regular exercise.',
      doctorNotes: []
    },
    {
      id: 'rec-3',
      title: 'COVID-19 Vaccination',
      description: 'Second dose of COVID-19 vaccine',
      date: '2023-12-20',
      type: 'vaccination',
      issuer: 'Nairobi Health Center',
      content: 'Vaccination completed successfully. No adverse reactions.',
      doctorNotes: []
    }
  ];
  
  return mockRecords;
}

// Request consent from patient
export async function requestConsent(doctorWalletId: string, patientDid: string): Promise<ConsentRequest> {
  const consentRequest: ConsentRequest = {
    id: `consent-${Date.now()}`,
    doctorDid: doctorWalletId,
    patientDid: patientDid,
    status: 'pending',
    requestDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    permissions: ['read_records', 'write_notes', 'view_history']
  };
  
  const allRequests = readJSON<Record<string, ConsentRequest[]>>(KEYS.consentRequests, {});
  const doctorRequests = allRequests[doctorWalletId] || [];
  doctorRequests.push(consentRequest);
  allRequests[doctorWalletId] = doctorRequests;
  writeJSON(KEYS.consentRequests, allRequests);
  
  return consentRequest;
}

// Grant consent (called by patient)
export function grantConsent(doctorWalletId: string, patientDid: string, expiryDays: number = 30) {
  const allPatients = readJSON<Record<string, DoctorPatient[]>>(KEYS.doctorPatients, {});
  const doctorPatients = allPatients[doctorWalletId] || [];
  
  const patientIndex = doctorPatients.findIndex(p => p.id === patientDid);
  if (patientIndex >= 0) {
    doctorPatients[patientIndex].hasConsent = true;
    doctorPatients[patientIndex].consentStatus = 'granted';
    doctorPatients[patientIndex].consentExpiry = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();
  }
  
  allPatients[doctorWalletId] = doctorPatients;
  writeJSON(KEYS.doctorPatients, allPatients);
  
  // Update consent request status
  const allRequests = readJSON<Record<string, ConsentRequest[]>>(KEYS.consentRequests, {});
  const doctorRequests = allRequests[doctorWalletId] || [];
  const requestIndex = doctorRequests.findIndex(r => r.patientDid === patientDid && r.status === 'pending');
  if (requestIndex >= 0) {
    doctorRequests[requestIndex].status = 'granted';
    doctorRequests[requestIndex].expiryDate = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();
  }
  allRequests[doctorWalletId] = doctorRequests;
  writeJSON(KEYS.consentRequests, allRequests);
}

// Revoke consent
export function revokeConsent(doctorWalletId: string, patientDid: string) {
  const allPatients = readJSON<Record<string, DoctorPatient[]>>(KEYS.doctorPatients, {});
  const doctorPatients = allPatients[doctorWalletId] || [];
  
  const patientIndex = doctorPatients.findIndex(p => p.id === patientDid);
  if (patientIndex >= 0) {
    doctorPatients[patientIndex].hasConsent = false;
    doctorPatients[patientIndex].consentStatus = 'denied';
  }
  
  allPatients[doctorWalletId] = doctorPatients;
  writeJSON(KEYS.doctorPatients, allPatients);
}

// Write doctor note
export async function writeDoctorNote(doctorWalletId: string, patientDid: string, noteContent: string): Promise<DoctorNote> {
  const doctorNote: DoctorNote = {
    id: `note-${Date.now()}`,
    doctorDid: doctorWalletId,
    content: noteContent,
    timestamp: new Date().toISOString(),
  };
  
  const allNotes = readJSON<Record<string, DoctorNote[]>>(KEYS.doctorNotes, {});
  const doctorNotes = allNotes[doctorWalletId] || [];
  doctorNotes.push(doctorNote);
  allNotes[doctorWalletId] = doctorNotes;
  writeJSON(KEYS.doctorNotes, allNotes);
  
  return doctorNote;
}

// Check if doctor has consent for patient
export function hasConsent(doctorWalletId: string, patientDid: string): boolean {
  const allPatients = readJSON<Record<string, DoctorPatient[]>>(KEYS.doctorPatients, {});
  const doctorPatients = allPatients[doctorWalletId] || [];
  
  const patient = doctorPatients.find(p => p.id === patientDid);
  if (!patient) return false;
  
  // Check if consent is expired
  if (patient.consentExpiry) {
    const expiryDate = new Date(patient.consentExpiry);
    if (expiryDate < new Date()) {
      patient.hasConsent = false;
      patient.consentStatus = 'expired';
      writeJSON(KEYS.doctorPatients, allPatients);
      return false;
    }
  }
  
  return patient.hasConsent && patient.consentStatus === 'granted';
}

// Get consent requests for a doctor
export function getConsentRequests(doctorWalletId: string): ConsentRequest[] {
  const allRequests = readJSON<Record<string, ConsentRequest[]>>(KEYS.consentRequests, {});
  return allRequests[doctorWalletId] || [];
}

// Initialize demo data for doctors
export function initializeDemoDoctorData() {
  const demoPatients: DoctorPatient[] = [
    {
      id: 'did:hedera:testnet:0.0.20001',
      name: 'John Doe',
      age: 35,
      lastVisit: '2024-01-15',
      hasConsent: true,
      consentStatus: 'granted',
      consentExpiry: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      records: []
    },
    {
      id: 'did:hedera:testnet:0.0.20002',
      name: 'Jane Smith',
      age: 28,
      lastVisit: '2024-01-10',
      hasConsent: false,
      consentStatus: 'pending',
      records: []
    },
    {
      id: 'did:hedera:testnet:0.0.20003',
      name: 'Michael Johnson',
      age: 42,
      lastVisit: '2023-12-20',
      hasConsent: true,
      consentStatus: 'granted',
      consentExpiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      records: []
    },
    {
      id: 'did:hedera:testnet:0.0.20004',
      name: 'Sarah Wilson',
      age: 31,
      lastVisit: '2024-01-05',
      hasConsent: false,
      consentStatus: 'denied',
      records: []
    }
  ];
  
  // Add demo patients for a sample doctor wallet
  const sampleDoctorWallet = '0.0.6811703';
  demoPatients.forEach(patient => {
    addPatientToDoctor(sampleDoctorWallet, patient);
  });
}

// Auto-initialize demo data when module loads
if (typeof window !== 'undefined') {
  const existingData = localStorage.getItem(KEYS.doctorPatients);
  if (!existingData) {
    initializeDemoDoctorData();
  }
}
