"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { useAIDiagnostic } from '@/hooks/useAIDiagnostic';
import { createConsentRequest, getDoctorConsentRequests, getDoctorConsents, grantEmergencyAccess } from '@/lib/consentManager';

interface DoctorDashboardProps {
  doctorDid: string;
  doctorPrivateKey: string;
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

export function DoctorDashboard({ doctorDid, doctorPrivateKey }: DoctorDashboardProps) {
  const [activeTab, setActiveTab] = useState('patients');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consentRequests, setConsentRequests] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const {
    submitDiagnosis,
    isAnalyzing,
    currentResponse,
    chatHistory,
    agents,
    selectedAgent,
    selectAgent
  } = useAIDiagnostic({ patientDid: doctorDid, patientPrivateKey: doctorPrivateKey });

  const loadDoctorData = () => {
    // Load consent requests and active consents
    const requests = getDoctorConsentRequests(doctorDid);
    const consents = getDoctorConsents(doctorDid);

    // Convert consents to patient format for display
    const patientsWithConsents: Patient[] = consents.map((consent: any) => ({
      id: consent.patientDid,
      name: `Patient ${consent.patientDid.slice(0, 8)}`,
      did: consent.patientDid,
      hasActiveConsent: true,
      consentExpiry: consent.expiresAt
    }));

    setPatients(patientsWithConsents);
    setConsentRequests(requests);
  };

  // Load doctor data
  useEffect(() => {
    loadDoctorData();
  }, [doctorDid]);

  // Request consent from patient
  const handleRequestConsent = async (patientDid: string, permissions: string[], dataTypes: string[], purpose: string) => {
    try {
      const consentPermissions = permissions.map(type => ({
        type: type as any,
        scope: dataTypes as any
      }));

      await createConsentRequest(
        doctorDid,
        patientDid,
        consentPermissions,
        30, // 30 days default
        purpose
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
      setSelectedPatient(patient);
      toast.success(`Accessing ${patient.name}'s health data`);
    } catch (error) {
      console.error('Failed to access patient data:', error);
      toast.error('Failed to access patient data');
    }
  };

  // Emergency access
  const handleEmergencyAccess = async (patient: Patient, reason: string) => {
    try {
      await grantEmergencyAccess(
        doctorDid,
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
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Stethoscope className="h-8 w-8 text-green-400" />
            Healthcare Provider Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Doctor Portal • MediLedger Nexus Healthcare System
          </p>
        </div>

        <div className="flex gap-2">
          <Badge className="bg-green-500 text-white">
            {patients.filter(p => p.hasActiveConsent).length} Active Consents
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
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
              <CheckCircle className="h-6 w-6 text-green-400" />
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Patients
          </TabsTrigger>
          <TabsTrigger value="consent" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Consent
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Diagnostics
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Emergency
          </TabsTrigger>
        </TabsList>

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
                <Button className="bg-green-600 hover:bg-green-700">
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
                            patient.hasActiveConsent ? 'bg-green-500/20' : 'bg-gray-500/20'
                          }`}>
                            <User className={`h-5 w-5 ${
                              patient.hasActiveConsent ? 'text-green-400' : 'text-gray-400'
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
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active Consent
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500 text-white">
                              No Consent
                            </Badge>
                          )}

                          {patient.emergencyAccess && (
                            <Badge className="bg-orange-500 text-white">
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
                              <Badge className="bg-yellow-500">Pending</Badge>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{request.purpose}</p>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-500 text-red-400">
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
                        currentResponse.confidence > 0.8 ? 'bg-green-500' :
                        currentResponse.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
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
                        <Card key={patient.id} className="bg-orange-900/20 border-orange-500/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-white">{patient.name}</h5>
                                <p className="text-sm text-gray-400">Emergency access active</p>
                              </div>
                              <Button size="sm" variant="outline" className="border-orange-500 text-orange-400">
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
                              className="bg-orange-600 hover:bg-orange-700"
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
    </div>
  );
}

export default DoctorDashboard;
