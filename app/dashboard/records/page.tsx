"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionManager } from "@/lib/session";
import { getMedicalRecords, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord, MedicalRecord, RecordShare, getSharedRecords } from "@/lib/recordManager";
import { getPatientConsents, getAuditTrail, grantConsent, revokeConsent } from "@/lib/consentManager";
import NFTConsentService from "@/services/nftConsentService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Shield,
  Upload,
  Download,
  Activity,
  Calendar,
  User,
  Share2,
  Lock,
  Unlock,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  File,
  Image,
  Video,
  Archive,
  Bell,
  TrendingUp,
  Zap
} from "lucide-react";

export default function RecordsPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [sharedRecords, setSharedRecords] = useState<RecordShare[]>([]);
  const [consents, setConsents] = useState<any[]>([]);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [newRecord, setNewRecord] = useState({
    title: "",
    description: "",
    type: "note" as MedicalRecord['type'],
    content: "",
    file: null as File | null,
  });
  const [editRecord, setEditRecord] = useState<Partial<MedicalRecord>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [grantConsentData, setGrantConsentData] = useState({
    doctorDid: "",
    permissions: [] as string[],
    dataTypes: [] as string[],
    purpose: "",
    expiryDays: 30
  });

  useEffect(() => {
    const userSession = SessionManager.getSession();
    if (!userSession || !SessionManager.isAuthenticated()) {
      router.push('/auth');
      return;
    }

    setSession(userSession);
    loadData(userSession);
    setLoading(false);
  }, [router]);

  const loadData = async (userSession: any) => {
    try {
      if (userSession.did) {
        const patientRecords = await getMedicalRecords(userSession.did, userSession.did);
        setRecords(patientRecords);

        const patientConsents = getPatientConsents(userSession.did);
        setConsents(patientConsents);

        const trail = getAuditTrail(userSession.did);
        setAuditTrail(trail);

        const shares = getSharedRecords(userSession.did);
        setSharedRecords(shares);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreateRecord = async () => {
    if (!newRecord.title.trim() || !session?.did) return;

    try {
      let content: any = { content: newRecord.content, mimeType: 'text/plain' };
      if (newRecord.file) {
        content = { file: newRecord.file, mimeType: newRecord.file.type };
      }

      const record = await createMedicalRecord(
        session.did,
        newRecord.title,
        newRecord.description,
        newRecord.type,
        content,
        session.did
      );

      setRecords([record, ...records]);
      setShowCreateDialog(false);
      setNewRecord({ title: "", description: "", type: "note", content: "", file: null });
    } catch (error) {
      console.error('Error creating record:', error);
    }
  };

  const handleEditRecord = async () => {
    if (!selectedRecord || !editRecord.title) return;

    try {
      await updateMedicalRecord(selectedRecord.id, editRecord, session.did);
      loadData(session);
      setShowEditDialog(false);
      setEditRecord({});
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      await deleteMedicalRecord(recordId, session.did);
      setRecords(records.filter(r => r.id !== recordId));
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const handleGrantConsent = async () => {
    if (!grantConsentData.doctorDid || !selectedRecord) return;

    try {
      const consent = await NFTConsentService.grantConsent(
        session.did,
        grantConsentData.doctorDid,
        [{ type: 'read', scope: [selectedRecord.id] }],
        grantConsentData.dataTypes,
        grantConsentData.purpose,
        grantConsentData.expiryDays
      );

      loadData(session);
      setShowConsentDialog(false);
      setGrantConsentData({ doctorDid: "", permissions: [], dataTypes: [], purpose: "", expiryDays: 30 });

      // Show success animation
      setSuccessMessage(`Consent granted successfully to ${grantConsentData.doctorDid} for "${selectedRecord.title}"`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000); // Hide after 4 seconds
    } catch (error) {
      console.error('Error granting consent:', error);
      // Optionally show error message here
    }
  };

  const handleRevokeConsent = async (consentId: string) => {
    try {
      await revokeConsent(consentId, session.did);
      await NFTConsentService.revokeConsent(consentId, session.did);
      loadData(session);

      // Show success animation
      setSuccessMessage(`Consent revoked successfully`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (error) {
      console.error('Error revoking consent:', error);
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || record.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'diagnosis': return <FileText className="h-4 w-4 text-red-400" />;
      case 'prescription': return <Shield className="h-4 w-4 text-blue-400" />;
      case 'test_result': return <Activity className="h-4 w-4 text-green-400" />;
      case 'vaccination': return <Shield className="h-4 w-4 text-yellow-400" />;
      case 'note': return <FileText className="h-4 w-4 text-purple-400" />;
      case 'image': return <Image className="h-4 w-4 text-cyan-400" />;
      case 'document': return <File className="h-4 w-4 text-gray-400" />;
      default: return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'diagnosis': return 'bg-red-600';
      case 'prescription': return 'bg-blue-600';
      case 'test_result': return 'bg-green-600';
      case 'vaccination': return 'bg-yellow-600';
      case 'note': return 'bg-purple-600';
      case 'image': return 'bg-cyan-600';
      case 'document': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusBadge = (recordId: string) => {
    const hasActiveConsent = consents.some(c => c.status === 'active' && c.permissions.some((p: any) => p.scope.includes(recordId)));
    if (hasActiveConsent) return <Badge className="bg-green-500 text-white">Shared</Badge>;
    return <Badge className="bg-gray-500 text-white">Private</Badge>;
  };

  // Summary stats for overview
  const totalRecords = records.length;
  const sharedRecordsCount = consents.filter(c => c.status === 'active').length;
  const activeConsents = consents.filter(c => c.status === 'active').length;
  const revokedConsents = consents.filter(c => c.status === 'revoked').length;
  const lastUpdate = records.length > 0 ? new Date(Math.max(...records.map(r => new Date(r.metadata.updatedAt).getTime()))).toLocaleDateString() : 'N/A';

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading medical records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Success Notification */}
        {showSuccess && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="border-slate-600 text-gray-400 hover:bg-slate-700/50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent flex items-center">
                <FileText className="mr-3 h-8 w-8" />
                My Records
              </h1>
              <p className="text-gray-400 mt-2">Securely manage your health data with NFT-based consents</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        </div>

        {/* Overview Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Records</p>
                  <p className="text-2xl font-bold text-white">{totalRecords}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Consents</p>
                  <p className="text-2xl font-bold text-white">{activeConsents}</p>
                </div>
                <Share2 className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Revoked Consents</p>
                  <p className="text-2xl font-bold text-white">{revokedConsents}</p>
                </div>
                <Unlock className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Last Update</p>
                  <p className="text-lg font-bold text-white">{lastUpdate}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="records" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
            <TabsTrigger value="records">View Records</TabsTrigger>
            <TabsTrigger value="consents">Consent Management</TabsTrigger>
            <TabsTrigger value="history">Audit Trail</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-6">
            {/* Search and Filters */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-600 text-white"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48 bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="diagnosis">Diagnosis</SelectItem>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="test_result">Test Results</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                      <SelectItem value="note">Notes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Records Table */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Health Records</CardTitle>
                <CardDescription className="text-gray-400">
                  All your encrypted medical records with NFT-linked authenticity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-4 text-gray-400">Record Name</th>
                        <th className="text-left p-4 text-gray-400">Date</th>
                        <th className="text-left p-4 text-gray-400">Type</th>
                        <th className="text-left p-4 text-gray-400">Status</th>
                        <th className="text-left p-4 text-gray-400">Consent Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-400">
                            No records found.
                          </td>
                        </tr>
                      ) : (
                        filteredRecords.map((record) => (
                          <tr key={record.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                            <td className="p-4 text-white">{record.title}</td>
                            <td className="p-4 text-gray-400">{new Date(record.metadata.createdAt).toLocaleDateString()}</td>
                            <td className="p-4">
                              <Badge className={`${getTypeColor(record.type)} text-white`}>
                                {record.type.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="p-4">
                              {getStatusBadge(record.id)}
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedRecord(record);
                                    setShowConsentDialog(true);
                                  }}
                                  className="border-green-400 text-green-400 hover:bg-green-400/10"
                                >
                                  Grant
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedRecord(record);
                                    setShowViewDialog(true);
                                  }}
                                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                                >
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedRecord(record);
                                    setEditRecord(record);
                                    setShowEditDialog(true);
                                  }}
                                  className="border-slate-600 text-gray-300"
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteRecord(record.id)}
                                  className="border-red-400 text-red-400 hover:bg-red-400/10"
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consents" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Consent Management
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage NFT-based consents for your records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {consents.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No active consents.</p>
                  ) : (
                    consents.map((consent) => (
                      <div key={consent.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium">Consent ID: {consent.id}</p>
                          <p className="text-gray-400 text-sm">Doctor: {consent.doctorDid}</p>
                          <p className="text-gray-400 text-sm">Expires: {consent.expiresAt ? new Date(consent.expiresAt).toLocaleDateString() : 'Never'}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={consent.status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
                            {consent.status}
                          </Badge>
                          {consent.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevokeConsent(consent.id)}
                              className="border-red-400 text-red-400 hover:bg-red-400/10"
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Audit Trail
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Complete history of consent actions and record changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditTrail.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No audit history available.</p>
                  ) : (
                    auditTrail.slice(0, 10).map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{entry.action}</p>
                          <p className="text-gray-400 text-sm">{new Date(entry.timestamp).toLocaleString()}</p>
                        </div>
                        <Badge className="bg-blue-500 text-white">Logged</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  AI Health Insights
                </CardTitle>
                <CardDescription className="text-gray-400">
                  AI-powered analysis of your consent patterns and record sharing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">AI insights feature is under development.</p>
                  <p className="text-gray-400 text-sm">Future: "You've shared records with 3 hospitals. Consider limiting access for better privacy."</p>
                  <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                    Enable AI Insights
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Alerts for consent grants, revokes, and expirations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Consent Granted</p>
                      <p className="text-gray-400 text-sm">You granted Dr. A access to your X-ray results.</p>
                    </div>
                    <Badge className="bg-green-500 text-white">New</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Consent Expired</p>
                      <p className="text-gray-400 text-sm">Your consent to Dr. B has expired.</p>
                    </div>
                    <Badge className="bg-yellow-500 text-white">Expired</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Record Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create Medical Record</DialogTitle>
              <DialogDescription className="text-gray-400">
                Add a new encrypted medical record to your health profile
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">Record Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Blood Test Results"
                  value={newRecord.title}
                  onChange={(e) => setNewRecord({...newRecord, title: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the record..."
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor="type" className="text-white">Record Type</Label>
                <Select value={newRecord.type} onValueChange={(value) => setNewRecord({...newRecord, type: value as MedicalRecord['type']})}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="diagnosis">Diagnosis</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="test_result">Test Result</SelectItem>
                    <SelectItem value="vaccination">Vaccination</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="file" className="text-white">Upload File (Optional)</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.png,.txt"
                  onChange={(e) => setNewRecord({...newRecord, file: e.target.files?.[0] || null})}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor="content" className="text-white">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter the medical record content..."
                  value={newRecord.content}
                  onChange={(e) => setNewRecord({...newRecord, content: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white mt-1 h-32"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="border-slate-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateRecord}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Create Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Grant Consent Dialog */}
        <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Grant Access Consent</DialogTitle>
              <DialogDescription className="text-gray-400">
                Mint an NFT for the selected doctor to access this record
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="doctorDid" className="text-white">Doctor's DID</Label>
                <Input
                  id="doctorDid"
                  placeholder="e.g., did:hedera:testnet:0.0.123456"
                  value={grantConsentData.doctorDid}
                  onChange={(e) => setGrantConsentData({...grantConsentData, doctorDid: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor="purpose" className="text-white">Purpose</Label>
                <Textarea
                  id="purpose"
                  placeholder="Reason for access..."
                  value={grantConsentData.purpose}
                  onChange={(e) => setGrantConsentData({...grantConsentData, purpose: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor="expiry" className="text-white">Expiry Days</Label>
                <Input
                  id="expiry"
                  type="number"
                  value={grantConsentData.expiryDays}
                  onChange={(e) => setGrantConsentData({...grantConsentData, expiryDays: parseInt(e.target.value) || 30})}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConsentDialog(false)}
                className="border-slate-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGrantConsent}
                className="bg-green-600 hover:bg-green-700"
              >
                Mint NFT & Grant Access
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Record Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center">
                {selectedRecord && getTypeIcon(selectedRecord.type)}
                <span className="ml-2">{selectedRecord?.title}</span>
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedRecord?.description}
              </DialogDescription>
            </DialogHeader>

            {selectedRecord && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Type</Label>
                    <p className="text-white">{selectedRecord.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Created</Label>
                    <p className="text-white">{new Date(selectedRecord.metadata.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Version</Label>
                    <p className="text-white">{selectedRecord.metadata.version}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Size</Label>
                    <p className="text-white">{selectedRecord.metadata.size} bytes</p>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400">Content</Label>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 mt-1">
                    <p className="text-gray-300">
                      {typeof selectedRecord.content === 'object'
                        ? 'Content is encrypted. Use the decrypt function to view.'
                        : selectedRecord.content}
                    </p>
                  </div>
                </div>

                {selectedRecord.ipfsHash && (
                  <div>
                    <Label className="text-gray-400">IPFS Hash</Label>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 mt-1">
                      <code className="text-cyan-300 text-sm">{selectedRecord.ipfsHash}</code>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-gray-400">Audit Trail</Label>
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">Created: {new Date(selectedRecord.metadata.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">Updated: {new Date(selectedRecord.metadata.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowViewDialog(false)}
                className="border-slate-600 text-gray-300"
              >
                Close
              </Button>
              <Button
                variant="outline"
                className="border-cyan-400 text-cyan-400"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Record Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Record</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update record details
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="editTitle" className="text-white">Title</Label>
                <Input
                  id="editTitle"
                  value={editRecord.title || ''}
                  onChange={(e) => setEditRecord({...editRecord, title: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor="editDescription" className="text-white">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editRecord.description || ''}
                  onChange={(e) => setEditRecord({...editRecord, description: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="border-slate-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditRecord}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Update Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}