"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionManager } from "@/lib/session";
import { getMedicalRecords, createMedicalRecord, MedicalRecord } from "@/lib/recordManager";
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
  User
} from "lucide-react";

export default function RecordsPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [newRecord, setNewRecord] = useState({
    title: "",
    description: "",
    type: "note" as MedicalRecord['type'],
    content: "",
  });

  useEffect(() => {
    const userSession = SessionManager.getSession();
    if (!userSession || !SessionManager.isAuthenticated()) {
      router.push('/auth');
      return;
    }
    
    setSession(userSession);
    loadRecords(userSession);
    setLoading(false);
  }, [router]);

  const loadRecords = async (userSession: any) => {
    try {
      if (userSession.did) {
        const patientRecords = await getMedicalRecords(userSession.did, userSession.did);
        setRecords(patientRecords);
      }
    } catch (error) {
      console.error('Error loading records:', error);
    }
  };

  const handleCreateRecord = async () => {
    if (!newRecord.title.trim() || !session?.did) return;

    try {
      const record = await createMedicalRecord(
        session.did,
        newRecord.title,
        newRecord.description,
        newRecord.type,
        { content: newRecord.content, mimeType: 'text/plain' },
        session.did
      );
      
      setRecords([record, ...records]);
      setShowCreateDialog(false);
      setNewRecord({ title: "", description: "", type: "note", content: "" });
    } catch (error) {
      console.error('Error creating record:', error);
    }
  };

  const filteredRecords = records.filter(record =>
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'diagnosis': return <FileText className="h-4 w-4 text-red-400" />;
      case 'prescription': return <Shield className="h-4 w-4 text-blue-400" />;
      case 'test_result': return <Activity className="h-4 w-4 text-green-400" />;
      case 'vaccination': return <Shield className="h-4 w-4 text-yellow-400" />;
      case 'note': return <FileText className="h-4 w-4 text-purple-400" />;
      case 'image': return <Upload className="h-4 w-4 text-cyan-400" />;
      case 'document': return <FileText className="h-4 w-4 text-gray-400" />;
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
                Medical Records
              </h1>
              <p className="text-gray-400 mt-2">Manage your encrypted medical records</p>
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

        {/* Search and Filters */}
        <Card className="bg-slate-900/50 border-slate-700/50 mb-6">
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
              <Select defaultValue="all">
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

        {/* Records List */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Records Found</h3>
                <p className="text-gray-400 mb-4">
                  {searchTerm ? 'No records match your search criteria.' : 'You haven\'t created any medical records yet.'}
                </p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Record
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record) => (
              <Card key={record.id} className="bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {getTypeIcon(record.type)}
                        <h3 className="text-lg font-semibold text-white">{record.title}</h3>
                        <Badge className={`${getTypeColor(record.type)} text-white`}>
                          {record.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-300 mb-4">{record.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(record.metadata.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Created by {record.metadata.createdBy.split(':')[3]}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span>Encrypted</span>
                        </div>
                        {record.ipfsHash && (
                          <div className="flex items-center space-x-2">
                            <Upload className="h-4 w-4" />
                            <span>IPFS: {record.ipfsHash.slice(0, 12)}...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowViewDialog(true);
                        }}
                        className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-gray-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-400 text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

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
                  <Label className="text-gray-400">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedRecord.metadata.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="border-slate-600 text-gray-300">
                        {tag}
                      </Badge>
                    ))}
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
      </div>
    </div>
  );
}