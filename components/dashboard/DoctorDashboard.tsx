"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createConsentRequest, getDoctorConsentRequests, getDoctorConsents, grantEmergencyAccess, grantConsent, denyConsentRequest, getAuditTrail } from '@/lib/consentManager';
import { getSharedRecords } from '@/lib/recordManager';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAIDiagnostic } from '@/hooks/useAIDiagnostic';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  User,
  Search,
  Plus,
  Eye,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Coins,
  Shield,
  Database,
  Users,
  Settings,
  Stethoscope,
  Heart,
  TrendingUp,
  Award,
  Lock,
  Unlock,
  Zap,
  MessageSquare,
  ExternalLink,
  Copy,
  LogOut,
  Home,
  FolderOpen,
  Calendar,
  Bot
} from 'lucide-react';

interface DoctorDashboardProps {
  doctorDid: string;
  doctorPrivateKey: string;
  onLogout?: () => void;
}

interface Patient {
  id: string;
  name: string;
  did: string;
  lastVisit?: string;
  hasActiveConsent: boolean;
  consentExpiry?: string;
  emergencyAccess?: boolean;
}

interface ConsentRequest {
  id: string;
  patientDid: string;
  patientName: string;
  requestedPermissions: string[];
  dataTypes: string[];
  purpose: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
}

export function DoctorDashboard({ doctorDid, doctorPrivateKey, onLogout }: DoctorDashboardProps) {
  console.log('🏥 DoctorDashboard - Component mounted with:');
  console.log('🏥 DoctorDashboard - doctorDid:', doctorDid);
  console.log('🏥 DoctorDashboard - doctorPrivateKey:', doctorPrivateKey);

  // Use only actual connected values; no development fallbacks
  const effectiveDoctorDid = doctorDid || '';
  const effectivePrivateKey = doctorPrivateKey || '';

  // Main state management
  const [activeTab, setActiveTab] = useState('home');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consentRequests, setConsentRequests] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedPatientForRequest, setSelectedPatientForRequest] = useState<Patient | null>(null);
  const [requestPermissions, setRequestPermissions] = useState<string[]>([]);
  const [requestPurpose, setRequestPurpose] = useState('');
  const [sharedRecords, setSharedRecords] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);

  const {
    submitDiagnosis,
    isAnalyzing,
    currentResponse,
    chatHistory,
    agents,
    selectedAgent,
    selectAgent
  } = useAIDiagnostic({ patientDid: effectiveDoctorDid, patientPrivateKey: effectivePrivateKey });

  const loadDoctorData = async () => {
    try {
      // Load consent requests and active consents
      const requests = getDoctorConsentRequests(effectiveDoctorDid);
      const consents = getDoctorConsents(effectiveDoctorDid);

      // Get unique patient DIDs from consents and requests
      const patientDids = new Set<string>([
        ...consents.map(c => c.patientDid),
        ...requests.map(r => r.patientDid)
      ]);

      // Create patient objects from consents and requests
      const patientsFromData = Array.from(patientDids).map(did => {
        const patientConsents = consents.filter(c => c.patientDid === did);
        const patientRequests = requests.filter(r => r.patientDid === did);
        const lastConsent = [...patientConsents].sort((a, b) => 
          new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime()
        )[0];
        
        // In a real app, you would fetch actual patient details from your backend
        // For now, we'll use the DID as the name and generate a random last visit date
        return {
          id: did,
          name: did, // In a real app, this would come from a patient profile service
          did,
          lastVisit: lastConsent?.grantedAt || new Date().toISOString().split('T')[0],
          hasActiveConsent: patientConsents.some(c => 
            c.status === 'active' && 
            (!c.expiresAt || new Date(c.expiresAt) > new Date())
          ),
          consentExpiry: lastConsent?.expiresAt,
          pendingRequest: patientRequests.some(r => r.status === 'pending')
        } as Patient;
      });

      // Set patients with real data
      setPatients(patientsFromData);
      setConsentRequests(requests);

      // Shared Records for this doctor DID
      try {
        const shares = getSharedRecords(effectiveDoctorDid);
        setSharedRecords(shares);
      } catch (e) {
        console.error('Failed loading shared records', e);
        setSharedRecords([]);
      }

      // Activity feed from consent audit logs
      try {
        const audits = getAuditTrail(effectiveDoctorDid);
        const messages = audits.map(a => `${a.action || a.data?.action || 'event'} • ${new Date(a.timestamp).toLocaleString()}`);
        setRecentActivity(messages);
      } catch (e) {
        console.error('Failed loading audit trail', e);
        setRecentActivity([]);
      }
    } catch (error) {
      console.error('Error loading doctor data:', error);
      // Set empty arrays on error
      setPatients([]);
      setConsentRequests([]);
    }
  };

  // Helper to get doctor account ID from DID
  const getDoctorAccountId = (did: string): string => {
    // Supports formats like did:hedera:0.0.123456 and did:hedera:testnet:0.0.123456
    const parts = (did || '').split(':');
    const last = parts[parts.length - 1];
    return last && last.includes('.') ? last : '';
  };

  // Load doctor data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        loadDoctorData();
      } catch (error) {
        console.error('Error loading doctor data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [effectiveDoctorDid]);

  // Request consent from patient
  const handleRequestConsent = async (patientDid: string, permissions: string[], dataTypes: string[], purpose: string) => {
    try {
      const consentPermissions = permissions.map(type => ({
        type: type as any,
        scope: dataTypes as any
      }));

      await createConsentRequest(
        effectiveDoctorDid,
        patientDid,
        consentPermissions,
        30, // 30 days default
        purpose
      );

      // Update the patient's consent status in the local state
      setPatients(prevPatients => 
        prevPatients.map(patient => 
          patient.did === patientDid 
            ? { ...patient, hasActiveConsent: true } 
            : patient
        )
      );

      toast.success('Consent request sent to patient');
      loadDoctorData(); // Refresh data
    } catch (error) {
      console.error('Failed to request consent:', error);
      toast.error('Failed to send consent request');
    }
  };

  // Access patient data with consent
  const handleAccessPatientData = async (patient: Patient) => {
    if (!patient.hasActiveConsent) {
      toast.error('No active consent for this patient');
      return;
    }

    try {
      // Verify consent NFT
      const consents = getDoctorConsents(effectiveDoctorDid);
      const consent = consents.find(c => c.patientDid === patient.did);

      if (consent && consent.metadata?.nftTokenId && consent.metadata?.nftSerialNumber) {
        const doctorAccountId = getDoctorAccountId(effectiveDoctorDid); // Helper to get account ID
        const { verifyConsentForAccess } = await import('@/lib/consentManager');
        const isValid = await verifyConsentForAccess(consent.id, doctorAccountId);

        if (!isValid) {
          toast.error('Consent NFT is invalid or expired');
          return;
        }
      }

      setSelectedPatient(patient);
      toast.success(`Accessing ${patient.name}'s health data`);
    } catch (error) {
      console.error('Failed to access patient data:', error);
      toast.error('Failed to verify consent NFT');
    }
  };

  // Emergency access
  const handleEmergencyAccess = async (patient: Patient, reason: string) => {
    try {
      await grantEmergencyAccess(
        effectiveDoctorDid,
        patient.did,
        reason,
        24 // 24 hours
      );

      toast.success('Emergency access granted');
      setPatients(prev => prev.map(p =>
        p.id === patient.id ? { ...p, emergencyAccess: true } : p
      ));
    } catch (error) {
      console.error('Emergency access failed:', error);
      toast.error('Failed to grant emergency access');
    }
  };

  // AI diagnostic analysis
  const handleAIDiagnosis = async (patient: Patient, query: string) => {
    try {
      const request = {
        id: `diag_${Date.now()}`,
        patientId: patient.did,
        dataType: 'text' as const,
        data: {},
        query,
        privacyLevel: 'identified' as const,
        consentId: 'consent_123' // Would come from actual consent
      };

      await submitDiagnosis(request);
      toast.success('AI diagnostic analysis completed');
    } catch (error) {
      console.error('AI diagnosis failed:', error);
      toast.error('Failed to perform AI diagnosis');
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.did.includes(searchQuery)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full mx-auto p-0 md:p-0">
        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden md:flex md:w-64 lg:w-72 min-h-screen flex-col border-r border-slate-800 bg-slate-950/60 p-4 gap-4 sticky top-0">
            <div className="flex items-center gap-2 px-2">
              <Stethoscope className="h-6 w-6 text-cyan-400" />
              <span className="text-white font-semibold">MediLedger Nexus</span>
            </div>
            <nav className="flex flex-col gap-1">
              <Button variant={activeTab === 'home' ? 'default' : 'ghost'} className={`justify-start ${activeTab === 'home' ? 'bg-cyan-600 text-white' : 'text-gray-300'}`} onClick={() => setActiveTab('home')}>
                <Home className="h-4 w-4 mr-2" /> Home
              </Button>
              <Button variant={activeTab === 'patients' ? 'default' : 'ghost'} className={`justify-start ${activeTab === 'patients' ? 'bg-cyan-600 text-white' : 'text-gray-300'}`} onClick={() => setActiveTab('patients')}>
                <Users className="h-4 w-4 mr-2" /> My Patients
              </Button>
              <Button variant={activeTab === 'shared' ? 'default' : 'ghost'} className={`justify-start ${activeTab === 'shared' ? 'bg-cyan-600 text-white' : 'text-gray-300'}`} onClick={() => setActiveTab('shared')}>
                <FolderOpen className="h-4 w-4 mr-2" /> Shared Records
              </Button>
              <Button variant={activeTab === 'consultations' ? 'default' : 'ghost'} className={`justify-start ${activeTab === 'consultations' ? 'bg-cyan-600 text-white' : 'text-gray-300'}`} onClick={() => setActiveTab('consultations')}>
                <Calendar className="h-4 w-4 mr-2" /> Consultations
              </Button>
              <Button variant={activeTab === 'ai' ? 'default' : 'ghost'} className={`justify-start ${activeTab === 'ai' ? 'bg-cyan-600 text-white' : 'text-gray-300'}`} onClick={() => setActiveTab('ai')}>
                <Bot className="h-4 w-4 mr-2" /> AI Assistant (Lea)
              </Button>
              <Button variant={activeTab === 'settings' ? 'default' : 'ghost'} className={`justify-start ${activeTab === 'settings' ? 'bg-cyan-600 text-white' : 'text-gray-300'}`} onClick={() => setActiveTab('settings')}>
                <Settings className="h-4 w-4 mr-2" /> Settings
              </Button>
            </nav>
            <div className="mt-auto px-2">
              {onLogout && (
                <Button onClick={onLogout} variant="outline" className="w-full border-slate-600 text-gray-400 hover:bg-slate-700/50">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto">
      {activeTab === 'home' && (
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Stethoscope className="h-8 w-8 text-cyan-400" />
            Healthcare Provider Dashboard
          </h1>
          <div className="flex flex-col gap-2 mt-2">
            <p className="text-gray-400">
              Doctor Portal • MediLedger Nexus Healthcare System
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                Account: {effectiveDoctorDid.includes('did:') ? effectiveDoctorDid.split(':')[3] : effectiveDoctorDid}
              </Badge>
              {effectiveDoctorDid.includes('did:') && (
                <Badge variant="outline" className="border-purple-400 text-purple-400">
                  DID: {effectiveDoctorDid.slice(0, 20)}...
                </Badge>
              )}
              <Badge variant="outline" className="border-green-400 text-green-400">
                Network: {process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge className="bg-cyan-500 text-white">
            {patients.filter(p => p.hasActiveConsent).length} Active Consents
          </Badge>
          {onLogout && (
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-slate-600 text-gray-400 hover:bg-slate-700/50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          )}
        </div>
      </div>
      )}

      {activeTab === 'home' && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Patients</p>
                <p className="text-2xl font-bold text-white">{patients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-cyan-400" />
              <div>
                <p className="text-sm text-gray-400">Active Consents</p>
                <p className="text-2xl font-bold text-white">
                  {patients.filter(p => p.hasActiveConsent).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">AI Consultations</p>
                <p className="text-2xl font-bold text-white">{chatHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {activeTab === 'home' && (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Doctor Account Information
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your connected Hedera account and identity details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Debug Information - Remove in production */}
          <div className="p-3 bg-gray-900/50 border border-gray-700 rounded-lg">
            <p className="text-gray-300 text-sm font-medium mb-2">Debug Info:</p>
            <p className="text-gray-400 text-xs">Raw doctorDid: "{doctorDid}"</p>
            <p className="text-gray-400 text-xs">Effective doctorDid: "{effectiveDoctorDid}"</p>
            <p className="text-gray-400 text-xs">Length: {effectiveDoctorDid.length}</p>
            <p className="text-gray-400 text-xs">Is DID: {effectiveDoctorDid.includes('did:') ? 'Yes' : 'No'}</p>
            <p className="text-gray-400 text-xs">Private Key: {doctorPrivateKey ? 'Set' : 'Not set'}</p>
            <p className="text-gray-400 text-xs">Using fallback: {doctorDid !== effectiveDoctorDid ? 'Yes' : 'No'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <Label className="text-white text-sm font-medium">Account ID</Label>
                <div className="mt-1 p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                  <code className="text-cyan-400 font-mono text-sm break-all">
                    {effectiveDoctorDid.includes('did:') ? effectiveDoctorDid.split(':')[3] : effectiveDoctorDid}
                  </code>
                </div>
              </div>

              <div>
                <Label className="text-white text-sm font-medium">Network</Label>
                <div className="mt-1 p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                  <span className="text-green-400 font-medium">
                    {process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {effectiveDoctorDid.includes('did:') && (
                <div>
                  <Label className="text-white text-sm font-medium">Decentralized ID (DID)</Label>
                  <div className="mt-1 p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                    <code className="text-purple-400 font-mono text-sm break-all">
                      {effectiveDoctorDid}
                    </code>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-gray-300"
                        onClick={() => navigator.clipboard.writeText(effectiveDoctorDid)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy DID
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-white text-sm font-medium">Account Status</Label>
                <div className="mt-1 p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected & Active
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {(!effectiveDoctorDid || effectiveDoctorDid === '') && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">No Account Connected</span>
              </div>
              <p className="text-red-300/70 text-sm mt-1">
                Please connect your HashPack wallet through the authentication flow to see your account details.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Sidebar controls the activeTab; TabsList not shown */}
        <TabsContent value="home" className="space-y-6">
          {/* Home content wraps header, stats and account info */}
        </TabsContent>

        {/* Shared Records */}
        <TabsContent value="shared" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Shared Records
              </CardTitle>
              <CardDescription className="text-gray-400">
                Verifiable records shared through consent on Hedera
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sharedRecords.length === 0 ? (
                <p className="text-gray-400">No shared records available</p>
              ) : (
                <div className="space-y-3">
                  {sharedRecords.map((rec) => (
                    <Card key={rec.id} className="bg-slate-700/30 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-white">{rec.name}</h5>
                            <p className="text-sm text-gray-400">Issued by: {rec.issuedBy}</p>
                            <p className="text-xs text-gray-500">Uploaded: {new Date(rec.date).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={rec.status === 'Active' ? 'bg-cyan-600' : 'bg-slate-600'}>
                              {rec.status}
                            </Badge>
                            <Button size="sm" variant="outline" className="border-slate-600">
                              View Record
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="h-5 w-5" />
                Patient Search & Management
              </CardTitle>
              <CardDescription className="text-gray-400">
                Search for patients and manage access permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search patients by name or DID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Button
                  onClick={() => setShowRequestDialog(true)}
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Request Consent
                </Button>
              </div>

              <div className="space-y-3">
                {filteredPatients.map((patient) => (
                  <Card key={patient.id} className="bg-slate-700/30 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            patient.hasActiveConsent ? 'bg-cyan-500/20' : 'bg-gray-500/20'
                          }`}>
                            <User className={`h-5 w-5 ${
                              patient.hasActiveConsent ? 'text-cyan-400' : 'text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{patient.name}</h3>
                            <p className="text-sm text-gray-400">DID: {patient.did.slice(0, 10)}...</p>
                            {patient.lastVisit && (
                              <p className="text-xs text-gray-500">
                                Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {patient.hasActiveConsent ? (
                            <Badge className="bg-cyan-500 text-white">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active Consent
                            </Badge>
                          ) : (
                            <Badge className="bg-pink-500 text-white">
                              No Consent
                            </Badge>
                          )}

                          {patient.emergencyAccess && (
                            <Badge className="bg-pink-500 text-white">
                              <Zap className="h-3 w-3 mr-1" />
                              Emergency Access
                            </Badge>
                          )}

                          <Button
                            size="sm"
                            onClick={() => handleAccessPatientData(patient)}
                            disabled={!patient.hasActiveConsent && !patient.emergencyAccess}
                            className="bg-cyan-600 hover:bg-cyan-700"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Access Data
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Consent Management
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage patient consent requests and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-3">Pending Requests</h4>
                  {consentRequests.filter(req => req.status === 'pending').length === 0 ? (
                    <p className="text-gray-400">No pending consent requests</p>
                  ) : (
                    <div className="space-y-3">
                      {consentRequests.filter(req => req.status === 'pending').map((request) => (
                        <Card key={request.id} className="bg-slate-700/30 border-slate-600">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-white">{request.patientName}</h5>
                              <Badge className="bg-purple-500">Pending</Badge>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{request.purpose}</p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-cyan-600 hover:bg-cyan-700"
                                onClick={async () => {
                                  try {
                                    await grantConsent(request.id, request.patientDid);
                                    toast.success('Consent request approved');
                                    await loadDoctorData();
                                  } catch (error) {
                                    console.error('Failed to approve consent:', error);
                                    toast.error('Failed to approve consent request');
                                  }
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-pink-500 text-pink-400"
                                onClick={async () => {
                                  try {
                                    await denyConsentRequest(request.id, effectiveDoctorDid, 'Request denied by doctor');
                                    toast.success('Consent request denied');
                                    await loadDoctorData();
                                  } catch (error) {
                                    console.error('Failed to deny consent:', error);
                                    toast.error('Failed to deny consent request');
                                  }
                                }}
                              >
                                Deny
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-3">Active Consents</h4>
                  {patients.filter(p => p.hasActiveConsent).length === 0 ? (
                    <p className="text-gray-400">No active consents</p>
                  ) : (
                    <div className="space-y-3">
                      {patients.filter(p => p.hasActiveConsent).map((patient) => (
                        <Card key={patient.id} className="bg-slate-700/30 border-slate-600">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-white">{patient.name}</h5>
                                <p className="text-sm text-gray-400">
                                  Expires: {patient.consentExpiry ?
                                    new Date(patient.consentExpiry).toLocaleDateString() :
                                    'No expiry'
                                  }
                                </p>
                              </div>
                              <Button size="sm" variant="outline" className="border-slate-600">
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage profile, wallet, and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Profile Info</Label>
                  <div className="text-gray-400 text-sm">Edit name, specialization, hospital</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Wallet Info</Label>
                  <div className="text-gray-400 text-sm">DID, Account ID, Network</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Security Settings</Label>
                  <div className="text-gray-400 text-sm">Enable 2FA, Session Activity Log</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Integration Settings</Label>
                  <div className="text-gray-400 text-sm">Connect institutional accounts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultations" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Consultations
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage upcoming and completed teleconsultations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Upcoming</h4>
                {consultations.filter(c => c.status === 'upcoming').length === 0 ? (
                  <p className="text-gray-400">No upcoming consultations</p>
                ) : (
                  <div className="space-y-2">
                    {consultations.filter(c => c.status === 'upcoming').map(c => (
                      <Card key={c.id} className="bg-slate-700/30 border-slate-600">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{c.patientName}</p>
                            <p className="text-gray-400 text-sm">{new Date(c.when).toLocaleString()}</p>
                          </div>
                          <Button className="bg-cyan-600 hover:bg-cyan-700">Join Call</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Completed</h4>
                {consultations.filter(c => c.status === 'completed').length === 0 ? (
                  <p className="text-gray-400">No completed consultations</p>
                ) : (
                  <div className="space-y-2">
                    {consultations.filter(c => c.status === 'completed').map(c => (
                      <Card key={c.id} className="bg-slate-700/30 border-slate-600">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{c.patientName}</p>
                            <p className="text-gray-400 text-sm">{new Date(c.when).toLocaleString()}</p>
                          </div>
                          <Button variant="outline" className="border-slate-600">View Summary</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button className="bg-purple-600 hover:bg-purple-700">Schedule Consultation</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Diagnostic Assistant
              </CardTitle>
              <CardDescription className="text-gray-400">
                Get AI-powered medical analysis and diagnostic support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Select AI Specialist</Label>
                  <Select value={selectedAgent || ''} onValueChange={selectAgent}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Choose AI agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name} - {agent.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={() => handleAIDiagnosis(selectedPatient || patients[0], "Please analyze this patient's condition")}
                    disabled={!selectedPatient || isAnalyzing}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <Brain className="h-4 w-4 mr-2 animate-pulse" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Get AI Analysis
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {selectedPatient && (
                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Analyzing Patient: {selectedPatient.name}</h4>
                  <p className="text-sm text-gray-400">
                    DID: {selectedPatient.did} • Consent Status: {selectedPatient.hasActiveConsent ? 'Active' : 'None'}
                  </p>
                </div>
              )}

              {currentResponse && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">AI Diagnostic Result</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Diagnosis</h4>
                      <p className="text-lg text-cyan-400">{currentResponse.diagnosis}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-2">Confidence</h4>
                      <Badge className={`${
                        currentResponse.confidence > 0.8 ? 'bg-cyan-500' :
                        currentResponse.confidence > 0.6 ? 'bg-purple-500' : 'bg-pink-500'
                      } text-white`}>
                        {Math.round(currentResponse.confidence * 100)}%
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {currentResponse.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-300">
                            <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Emergency Access Protocol
              </CardTitle>
              <CardDescription className="text-gray-400">
                Grant immediate access to patient data in critical situations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-3">Patients with Emergency Access</h4>
                  {patients.filter(p => p.emergencyAccess).length === 0 ? (
                    <p className="text-gray-400">No emergency access granted</p>
                  ) : (
                    <div className="space-y-3">
                      {patients.filter(p => p.emergencyAccess).map((patient) => (
                        <Card key={patient.id} className="bg-pink-900/20 border-pink-500/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-white">{patient.name}</h5>
                                <p className="text-sm text-gray-400">Emergency access active</p>
                              </div>
                              <Button size="sm" variant="outline" className="border-pink-500 text-pink-400">
                                <Eye className="h-4 w-4 mr-2" />
                                Access Data
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-3">Request Emergency Access</h4>
                  <div className="space-y-3">
                    {patients.filter(p => !p.emergencyAccess).slice(0, 3).map((patient) => (
                      <Card key={patient.id} className="bg-slate-700/30 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-white">{patient.name}</h5>
                              <p className="text-sm text-gray-400">No emergency access</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleEmergencyAccess(patient, "Critical patient condition")}
                              className="bg-pink-600 hover:bg-pink-700"
                            >
                              <Zap className="h-4 w-4 mr-2" />
                              Grant Emergency
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Consent Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Request Patient Consent
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Select a patient and specify the permissions you need for treatment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Patient Selection */}
            <div className="space-y-3">
              <Label className="text-white">Select Patient</Label>
              {patients.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400">No patients found. Please add patients first.</p>
                  <Button 
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                    onClick={() => loadDoctorData()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Patients
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                  {patients.map((patient) => (
                    <Card
                      key={patient.id}
                      className={`cursor-pointer transition-colors ${
                        selectedPatientForRequest?.id === patient.id
                          ? 'bg-cyan-900/30 border-cyan-500/50'
                          : 'bg-slate-800/50 border-slate-600 hover:bg-slate-700/50'
                      }`}
                      onClick={() => setSelectedPatientForRequest(patient)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            patient.hasActiveConsent ? 'bg-cyan-500/20' : 'bg-gray-500/20'
                          }`}>
                            <User className={`h-4 w-4 ${
                              patient.hasActiveConsent ? 'text-cyan-400' : 'text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white truncate">{patient.name}</h4>
                            <p className="text-sm text-gray-400 truncate">DID: {patient.did}</p>
                            {patient.hasActiveConsent ? (
                              <Badge className="bg-cyan-500 text-white text-xs mt-1">
                                Consent active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-400 border-gray-500 text-xs mt-1">
                                No active consent
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Permission Selection */}
            <div className="space-y-3">
              <Label className="text-white">Required Permissions</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'read_records', label: 'Read Medical Records', desc: 'View patient history and test results' },
                  { id: 'write_notes', label: 'Write Clinical Notes', desc: 'Add observations and treatment notes' },
                  { id: 'prescribe_medication', label: 'Prescribe Medication', desc: 'Issue prescriptions and treatments' },
                  { id: 'view_history', label: 'View Complete History', desc: 'Access full medical timeline' },
                  { id: 'emergency_access', label: 'Emergency Access', desc: '24/7 access for critical situations' }
                ].map((permission) => (
                  <Card
                    key={permission.id}
                    className={`cursor-pointer transition-colors ${
                      requestPermissions.includes(permission.id)
                        ? 'bg-purple-900/30 border-purple-500/50'
                        : 'bg-slate-800/50 border-slate-600 hover:bg-slate-700/50'
                    }`}
                    onClick={() => {
                      if (requestPermissions.includes(permission.id)) {
                        setRequestPermissions(prev => prev.filter(p => p !== permission.id));
                      } else {
                        setRequestPermissions(prev => [...prev, permission.id]);
                      }
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <Checkbox
                          checked={requestPermissions.includes(permission.id)}
                          className="mt-0.5"
                        />
                        <div>
                          <h5 className="font-medium text-white text-sm">{permission.label}</h5>
                          <p className="text-xs text-gray-400">{permission.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-3">
              <Label htmlFor="purpose" className="text-white">Purpose of Access</Label>
              <Input
                id="purpose"
                placeholder="e.g., Routine checkup, Emergency treatment, Specialist consultation..."
                value={requestPurpose}
                onChange={(e) => setRequestPurpose(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRequestDialog(false);
                setSelectedPatientForRequest(null);
                setRequestPermissions([]);
                setRequestPurpose('');
              }}
              className="border-slate-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!selectedPatientForRequest || requestPermissions.length === 0 || !requestPurpose.trim()) {
                  toast.error('Please select a patient, permissions, and provide a purpose');
                  return;
                }

                try {
                  await handleRequestConsent(
                    selectedPatientForRequest.did,
                    requestPermissions,
                    ['all'], // scope
                    requestPurpose
                  );
                  setShowRequestDialog(false);
                  setSelectedPatientForRequest(null);
                  setRequestPermissions([]);
                  setRequestPurpose('');
                } catch (error) {
                  console.error('Failed to request consent:', error);
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
            >
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DoctorDashboard;
