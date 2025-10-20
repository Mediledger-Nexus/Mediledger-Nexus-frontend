"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionManager } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield, Users, FileText, Calendar, LogOut, Search, Plus, Eye, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HederaLogger } from "@/lib/hedera";
import { getDoctorPatients, getPatientRecords, requestConsent, writeDoctorNote } from "@/lib/doctorStore";

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    const userSession = SessionManager.getSession();
    if (!userSession || !SessionManager.isAuthenticated()) {
      router.push('/auth');
      return;
    }
    // Check if user is a doctor
    if (userSession.role !== 'doctor') {
      router.push('/dashboard');
      return;
    }
    setSession(userSession);
    loadDoctorData();
    setLoading(false);
  }, [router]);

  const loadDoctorData = async () => {
    try {
      const doctorPatients = await getDoctorPatients(session?.walletId);
      setPatients(doctorPatients);
    } catch (error) {
      console.error('Error loading doctor data:', error);
    }
  };

  const handleLogout = () => {
    SessionManager.clearSession();
    router.push('/');
  };

  const handleConsentRequest = async (patientId: string) => {
    try {
      await HederaLogger.logRegistration({
        type: 'consent_request',
        doctorDid: session?.did,
        doctorWallet: session?.walletId,
        patientDid: patientId,
        action: 'request_access',
        timestamp: new Date().toISOString(),
      });
      
      await requestConsent(session?.walletId, patientId);
      await loadDoctorData(); // Refresh data
    } catch (error) {
      console.error('Error requesting consent:', error);
    }
  };

  const handleViewRecords = async (patient: any) => {
    setSelectedPatient(patient);
    try {
      const records = await getPatientRecords(patient.id);
      setPatientRecords(records);
    } catch (error) {
      console.error('Error loading patient records:', error);
    }
  };

  const handleWriteNote = async () => {
    if (!newNote.trim() || !selectedPatient) return;
    
    try {
      await HederaLogger.logRegistration({
        type: 'doctor_note',
        doctorDid: session?.did,
        doctorWallet: session?.walletId,
        patientDid: selectedPatient.id,
        note: newNote,
        timestamp: new Date().toISOString(),
      });
      
      await writeDoctorNote(session?.walletId, selectedPatient.id, newNote);
      setNewNote("");
      await handleViewRecords(selectedPatient); // Refresh records
    } catch (error) {
      console.error('Error writing note:', error);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading doctor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Doctor Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Manage your patients and medical records</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-slate-600 text-gray-400 hover:bg-slate-700/50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Doctor Info Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <User className="mr-2 h-5 w-5 text-purple-400" />
                Doctor Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">Name:</span> <span className="text-white">Dr. {session?.profile?.fullName || 'Smith'}</span></p>
                <p><span className="text-gray-400">Specialty:</span> <span className="text-white">General Medicine</span></p>
                <p><span className="text-gray-400">License:</span> <span className="text-white">MD-12345</span></p>
                <p><span className="text-gray-400">Status:</span> <span className="text-green-400">Verified</span></p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Shield className="mr-2 h-5 w-5 text-cyan-400" />
                DID Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Doctor DID:</p>
                  <div className="flex items-center gap-2 bg-slate-800/50 rounded px-3 py-2">
                    <code className="text-cyan-300 text-sm font-mono break-all">
                      {session?.did || 'Not generated'}
                    </code>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Wallet ID:</p>
                  <code className="text-purple-300 text-sm font-mono">
                    {session?.walletId || 'Not connected'}
                  </code>
                </div>
                <p><span className="text-gray-400">Network:</span> <span className="text-white">{process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'mainnet'}</span></p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Users className="mr-2 h-5 w-5 text-green-400" />
                Patient Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">Total Patients:</span> <span className="text-white">{patients.length}</span></p>
                <p><span className="text-gray-400">Active Consents:</span> <span className="text-green-400">{patients.filter(p => p.hasConsent).length}</span></p>
                <p><span className="text-gray-400">Pending Requests:</span> <span className="text-yellow-400">{patients.filter(p => p.consentStatus === 'pending').length}</span></p>
                <p><span className="text-gray-400">Last Updated:</span> <span className="text-white">Today</span></p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="bg-slate-900/50 border-slate-700/50">
            <TabsTrigger value="patients">My Patients</TabsTrigger>
            <TabsTrigger value="records">Medical Records</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Patient Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your patients and request access to their medical records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-600 text-white"
                    />
                  </div>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Patient
                  </Button>
                </div>

                <div className="space-y-4">
                  {filteredPatients.map((patient) => (
                    <Card key={patient.id} className="bg-slate-800/30 border-slate-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">{patient.name}</h3>
                              <Badge 
                                variant={patient.hasConsent ? "default" : patient.consentStatus === 'pending' ? "secondary" : "destructive"}
                                className={patient.hasConsent ? "bg-green-600" : patient.consentStatus === 'pending' ? "bg-yellow-600" : "bg-red-600"}
                              >
                                {patient.hasConsent ? "Access Granted" : patient.consentStatus === 'pending' ? "Pending" : "No Access"}
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-sm">
                              DID: {patient.id} | Age: {patient.age} | Last Visit: {patient.lastVisit}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {!patient.hasConsent && patient.consentStatus !== 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleConsentRequest(patient.id)}
                                className="bg-cyan-600 hover:bg-cyan-700"
                              >
                                Request Access
                              </Button>
                            )}
                            {patient.hasConsent && (
                              <Button
                                size="sm"
                                onClick={() => handleViewRecords(patient)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Records
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Medical Records</CardTitle>
                <CardDescription className="text-gray-400">
                  {selectedPatient ? `Viewing records for ${selectedPatient.name}` : "Select a patient to view their records"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPatient ? (
                  <div className="space-y-4">
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-2">Patient Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <p><span className="text-gray-400">Name:</span> <span className="text-white">{selectedPatient.name}</span></p>
                        <p><span className="text-gray-400">Age:</span> <span className="text-white">{selectedPatient.age}</span></p>
                        <p><span className="text-gray-400">DID:</span> <span className="text-white">{selectedPatient.id}</span></p>
                        <p><span className="text-gray-400">Consent Status:</span> <span className="text-green-400">Active</span></p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {patientRecords.map((record, index) => (
                        <Card key={index} className="bg-slate-800/30 border-slate-700/50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-white font-semibold">{record.title}</h4>
                              <span className="text-gray-400 text-sm">{record.date}</span>
                            </div>
                            <p className="text-gray-300 text-sm mb-3">{record.description}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                                {record.type}
                              </Badge>
                              <Button size="sm" variant="outline" className="border-slate-600 text-gray-300">
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="bg-slate-800/30 border-slate-700/50">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <MessageSquare className="mr-2 h-5 w-5" />
                          Add Doctor Note
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Write your medical notes here..."
                            className="w-full h-32 bg-slate-800/50 border border-slate-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                          />
                          <Button
                            onClick={handleWriteNote}
                            disabled={!newNote.trim()}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            Save Note to HCS
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Select a patient from the Patients tab to view their records</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Audit Trail</CardTitle>
                <CardDescription className="text-gray-400">
                  View all blockchain-logged activities and consent changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">Doctor Registration</h4>
                      <span className="text-gray-400 text-sm">2 hours ago</span>
                    </div>
                    <p className="text-gray-300 text-sm">Doctor DID registered on Hedera network</p>
                    <Badge variant="outline" className="border-green-400 text-green-400 mt-2">
                      HCS Logged
                    </Badge>
                  </div>

                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">Consent Request</h4>
                      <span className="text-gray-400 text-sm">1 hour ago</span>
                    </div>
                    <p className="text-gray-300 text-sm">Requested access to patient John Doe's records</p>
                    <Badge variant="outline" className="border-yellow-400 text-yellow-400 mt-2">
                      Pending
                    </Badge>
                  </div>

                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">Record Access</h4>
                      <span className="text-gray-400 text-sm">30 minutes ago</span>
                    </div>
                    <p className="text-gray-300 text-sm">Viewed blood test results for patient Jane Smith</p>
                    <Badge variant="outline" className="border-blue-400 text-blue-400 mt-2">
                      Access Logged
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
