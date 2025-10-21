"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Shield,
  Plus,
  Eye,
  Lock,
  FileText,
  Activity,
  Pill,
  TestTube,
  Camera,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Key,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import ZeroKnowledgeHealthVault, { HealthRecord } from '@/lib/healthVault';

interface HealthVaultDashboardProps {
  patientDid: string;
  patientPrivateKey: string;
}

export function HealthVaultDashboard({ patientDid, patientPrivateKey }: HealthVaultDashboardProps) {
  const [vault, setVault] = useState<ZeroKnowledgeHealthVault | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [recordForm, setRecordForm] = useState({
    dataType: 'notes' as HealthRecord['dataType'],
    title: '',
    content: '',
    emergencyAccess: false
  });

  // Initialize vault
  useEffect(() => {
    const initVault = async () => {
      try {
        const vaultInstance = new ZeroKnowledgeHealthVault();
        await vaultInstance.initializeVault(patientDid, patientPrivateKey);
        setVault(vaultInstance);

        // Load existing records (mock for demo)
        setRecords([]);
      } catch (error) {
        console.error('Failed to initialize vault:', error);
        toast.error('Failed to initialize health vault');
      } finally {
        setLoading(false);
      }
    };

    initVault();
  }, [patientDid, patientPrivateKey]);

  // Add new health record
  const handleAddRecord = async () => {
    if (!vault || !recordForm.title.trim()) return;

    try {
      const recordData = {
        patientId: patientDid,
        dataType: recordForm.dataType,
        encryptedData: recordForm.content,
        accessControl: {
          owner: patientDid,
          authorizedViewers: [],
          emergencyAccess: recordForm.emergencyAccess
        }
      };

      await vault.storeRecord(recordData);

      // Refresh records
      const stats = vault.getVaultStats();
      toast.success(`Added ${recordForm.dataType} record to vault`);

      setShowAddRecord(false);
      setRecordForm({ dataType: 'notes', title: '', content: '', emergencyAccess: false });
    } catch (error) {
      console.error('Failed to add record:', error);
      toast.error('Failed to add health record');
    }
  };

  // View record details
  const handleViewRecord = async (record: HealthRecord) => {
    if (!vault) return;

    try {
      const decryptedData = await vault.retrieveRecord(record.id, patientDid);
      setSelectedRecord({ ...record, decryptedData });
    } catch (error) {
      console.error('Failed to retrieve record:', error);
      toast.error('Failed to access health record');
    }
  };

  // Grant access to doctor
  const handleGrantAccess = async (recordId: string, doctorDid: string) => {
    if (!vault) return;

    try {
      await vault.grantAccess(recordId, doctorDid, 'read', 30); // 30 days
      toast.success('Access granted to healthcare provider');
    } catch (error) {
      console.error('Failed to grant access:', error);
      toast.error('Failed to grant access');
    }
  };

  const getDataTypeIcon = (dataType: HealthRecord['dataType']) => {
    switch (dataType) {
      case 'vitals': return <Activity className="h-4 w-4" />;
      case 'medications': return <Pill className="h-4 w-4" />;
      case 'lab_results': return <TestTube className="h-4 w-4" />;
      case 'imaging': return <Camera className="h-4 w-4" />;
      case 'notes': return <FileText className="h-4 w-4" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDataTypeColor = (dataType: HealthRecord['dataType']) => {
    switch (dataType) {
      case 'vitals': return 'bg-blue-500';
      case 'medications': return 'bg-green-500';
      case 'lab_results': return 'bg-purple-500';
      case 'imaging': return 'bg-orange-500';
      case 'notes': return 'bg-gray-500';
      case 'emergency': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!vault) {
    return (
      <Card className="border-red-500/20 bg-red-900/10">
        <CardContent className="flex flex-col items-center justify-center p-12">
          <Lock className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-400 text-center">
            Failed to initialize health vault
          </p>
        </CardContent>
      </Card>
    );
  }

  const vaultStats = vault.getVaultStats();

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-cyan-400" />
            Zero-Knowledge Health Vault
          </h1>
          <p className="text-gray-400 mt-2">
            Privacy-preserving encrypted storage for your healthcare data
          </p>
        </div>

        <Button
          onClick={() => setShowAddRecord(!showAddRecord)}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      </div>

      {/* Vault Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Records</p>
                <p className="text-2xl font-bold text-white">{vaultStats.totalRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Total Size</p>
                <p className="text-2xl font-bold text-white">{(vaultStats.totalSize / 1024).toFixed(1)}KB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Key className="h-6 w-6 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">ZK Proofs</p>
                <p className="text-2xl font-bold text-white">{vaultStats.zkProofsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">Last Access</p>
                <p className="text-sm text-white">
                  {vaultStats.lastAccessed ?
                    new Date(vaultStats.lastAccessed).toLocaleDateString() :
                    'Never'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="records">Health Records</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          {records.length === 0 ? (
            <Card className="border-dashed border-gray-600">
              <CardContent className="flex flex-col items-center justify-center p-12">
                <Database className="h-12 w-12 text-gray-500 mb-4" />
                <p className="text-gray-400 text-center">
                  No health records in your vault yet
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowAddRecord(true)}
                >
                  Add Your First Record
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {records.map((record) => (
                <Card key={record.id} className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className={`${getDataTypeColor(record.dataType)} text-white`}>
                        <div className="flex items-center gap-1">
                          {getDataTypeIcon(record.dataType)}
                          {record.dataType}
                        </div>
                      </Badge>
                      {record.zkProof && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                    <CardTitle className="text-lg text-white">
                      {record.dataType.charAt(0).toUpperCase() + record.dataType.slice(1)}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Created: {new Date(record.metadata.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-400">
                      <p>Size: {(record.metadata.size / 1024).toFixed(1)}KB</p>
                      <p>Encrypted: {record.encryptedData ? 'Yes' : 'No'}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewRecord(record)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card className="border-dashed border-gray-600">
            <CardContent className="flex flex-col items-center justify-center p-12">
              <Key className="h-12 w-12 text-gray-500 mb-4" />
              <p className="text-gray-400 text-center">
                Access control management will be implemented next
              </p>
              <p className="text-sm text-gray-500 text-center mt-2">
                Grant and revoke access to specific healthcare providers
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card className="border-orange-500/20 bg-orange-900/10">
            <CardHeader>
              <CardTitle className="text-orange-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Emergency Access Protocol
              </CardTitle>
              <CardDescription>
                In critical situations, emergency responders can access your health data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-800/40 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Emergency Access Status</h4>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${recordForm.emergencyAccess ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-300">
                    {recordForm.emergencyAccess ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Emergency Access Toggle</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={recordForm.emergencyAccess}
                    onChange={(e) => setRecordForm(prev => ({ ...prev, emergencyAccess: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">
                    Allow emergency responders to access critical health information
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Record Modal */}
      {showAddRecord && (
        <Card className="bg-slate-800/90 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Add Health Record</CardTitle>
            <CardDescription className="text-gray-400">
              Store encrypted health data in your zero-knowledge vault
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Data Type</Label>
                <select
                  value={recordForm.dataType}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, dataType: e.target.value as HealthRecord['dataType'] }))}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="vitals">Vital Signs</option>
                  <option value="medications">Medications</option>
                  <option value="lab_results">Lab Results</option>
                  <option value="imaging">Medical Imaging</option>
                  <option value="notes">Clinical Notes</option>
                  <option value="emergency">Emergency Data</option>
                </select>
              </div>

              <div>
                <Label className="text-white">Title</Label>
                <Input
                  value={recordForm.title}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Record title..."
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Content</Label>
              <Textarea
                value={recordForm.content}
                onChange={(e) => setRecordForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter health data..."
                rows={4}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddRecord} className="bg-cyan-600 hover:bg-cyan-700">
                <Lock className="h-4 w-4 mr-2" />
                Encrypt & Store
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddRecord(false)}
                className="border-slate-600"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Record Details Modal */}
      {selectedRecord && (
        <Card className="bg-slate-800/90 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {getDataTypeIcon(selectedRecord.dataType)}
              {selectedRecord.dataType.charAt(0).toUpperCase() + selectedRecord.dataType.slice(1)} Record
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Decrypted Content</h4>
              <div className="text-gray-300 text-sm break-words">
                {typeof selectedRecord.decryptedData === 'object'
                  ? JSON.stringify(selectedRecord.decryptedData, null, 2)
                  : selectedRecord.decryptedData
                }
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Created</p>
                <p className="text-white">{new Date(selectedRecord.metadata.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Size</p>
                <p className="text-white">{(selectedRecord.metadata.size / 1024).toFixed(1)}KB</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleGrantAccess(selectedRecord.id, '0.0.123456')} // Example doctor DID
                className="bg-green-600 hover:bg-green-700"
              >
                Grant Doctor Access
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRecord(null)}
                className="border-slate-600"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default HealthVaultDashboard;
