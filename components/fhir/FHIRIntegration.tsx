"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Globe,
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertTriangle,
  Activity,
  Users,
  Shield,
  Database,
  ExternalLink,
  Eye,
  Lock,
  Zap,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import FHIRService, {
  FHIRResource,
  FHIRBundle,
  FHIRPatient,
  FHIRObservation,
  MediLedgerFHIRProfile
} from '@/lib/fhirService';
import { usePrivacyEconomy } from '@/hooks/usePrivacyEconomy';

interface FHIRIntegrationProps {
  patientDid: string;
  patientPrivateKey: string;
}

export function FHIRIntegration({ patientDid, patientPrivateKey }: FHIRIntegrationProps) {
  const [fhirResources, setFhirResources] = useState<FHIRResource[]>([]);
  const [exportBundle, setExportBundle] = useState<string>('');
  const [importData, setImportData] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [privacyLevel, setPrivacyLevel] = useState<'anonymous' | 'pseudonymous' | 'identified'>('identified');
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());

  const { getVaultStats, storeHealthRecord } = usePrivacyEconomy({
    patientDid,
    patientPrivateKey
  });

  // Load sample FHIR resources for demo
  useEffect(() => {
    const loadSampleFHIR = () => {
      const samplePatient: FHIRPatient = FHIRService.createFHIRPatient({
        id: patientDid,
        firstName: 'Demo',
        lastName: 'Patient',
        privacyLevel: 'identified'
      });

      const sampleObservation: FHIRObservation = FHIRService.createFHIRObservation({
        id: 'obs-1',
        dataType: 'vitals'
      }, patientDid);

      setFhirResources([samplePatient, sampleObservation]);
    };

    loadSampleFHIR();
  }, [patientDid]);

  // Export health vault data to FHIR
  const handleExportFHIR = async () => {
    setIsExporting(true);
    try {
      const vaultStats = getVaultStats();

      // Mock records for demo
      const mockRecords = [
        { id: 'rec-1', dataType: 'vitals', content: 'Blood pressure: 120/80' },
        { id: 'rec-2', dataType: 'medications', content: 'Lisinopril 10mg daily' }
      ];

      const fhirBundle = await FHIRService.exportToFHIR(
        patientDid,
        mockRecords,
        privacyLevel
      );

      setExportBundle(JSON.stringify(fhirBundle, null, 2));
      toast.success('FHIR export completed successfully');
    } catch (error) {
      console.error('FHIR export failed:', error);
      toast.error('Failed to export FHIR data');
    } finally {
      setIsExporting(false);
    }
  };

  // Import FHIR data into health vault
  const handleImportFHIR = async () => {
    if (!importData.trim()) {
      toast.error('Please enter FHIR data to import');
      return;
    }

    setIsImporting(true);
    try {
      const fhirBundle = JSON.parse(importData) as FHIRBundle;
      const importedRecords = await FHIRService.importFromFHIR(fhirBundle, patientDid);

      // Store imported records in health vault
      for (const record of importedRecords) {
        await storeHealthRecord(record);
      }

      toast.success(`Imported ${importedRecords.length} health records from FHIR`);
      setImportData('');
    } catch (error) {
      console.error('FHIR import failed:', error);
      toast.error('Failed to import FHIR data');
    } finally {
      setIsImporting(false);
    }
  };

  // Toggle resource selection for export
  const toggleResourceSelection = (resourceId: string) => {
    const newSelection = new Set(selectedResources);
    if (newSelection.has(resourceId)) {
      newSelection.delete(resourceId);
    } else {
      newSelection.add(resourceId);
    }
    setSelectedResources(newSelection);
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'Patient': return <Users className="h-4 w-4" />;
      case 'Observation': return <Activity className="h-4 w-4" />;
      case 'MedicationRequest': return <FileText className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getPrivacyBadgeColor = (level: string) => {
    switch (level) {
      case 'anonymous': return 'bg-gray-500';
      case 'pseudonymous': return 'bg-blue-500';
      case 'identified': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Globe className="h-8 w-8 text-cyan-400" />
            Global Health Interoperability
          </h1>
          <p className="text-gray-400 mt-2">
            HL7 FHIR integration for seamless healthcare data exchange
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open('https://www.hl7.org/fhir/', '_blank')}
            className="border-cyan-500 text-cyan-400 hover:bg-cyan-900/20"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            FHIR Spec
          </Button>
        </div>
      </div>

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export FHIR
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import FHIR
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            FHIR Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Health Data to FHIR
              </CardTitle>
              <CardDescription className="text-gray-400">
                Convert your encrypted health vault data to HL7 FHIR format for sharing with healthcare providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Privacy Level</Label>
                  <Select value={privacyLevel} onValueChange={(value) => setPrivacyLevel(value as any)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anonymous">Anonymous</SelectItem>
                      <SelectItem value="pseudonymous">Pseudonymous</SelectItem>
                      <SelectItem value="identified">Identified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleExportFHIR}
                    disabled={isExporting}
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                  >
                    {isExporting ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-pulse" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export to FHIR
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-slate-700/30 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Privacy Protection</h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getPrivacyBadgeColor(privacyLevel)} text-white`}>
                      {privacyLevel.toUpperCase()}
                    </Badge>
                    <span>
                      {privacyLevel === 'anonymous' && 'No personal identifiers included'}
                      {privacyLevel === 'pseudonymous' && 'Pseudonyms used instead of real identifiers'}
                      {privacyLevel === 'identified' && 'Full personal identifiers included'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span>All data remains encrypted and requires separate consent for access</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {exportBundle && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">FHIR Export Result</CardTitle>
                <CardDescription className="text-gray-400">
                  HL7 FHIR Bundle ready for sharing with healthcare systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={exportBundle}
                  readOnly
                  rows={20}
                  className="bg-slate-900 border-slate-600 text-gray-300 font-mono text-xs"
                />
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(exportBundle)}
                    className="border-slate-600"
                  >
                    Copy FHIR Bundle
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const blob = new Blob([exportBundle], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `patient-${patientDid}-fhir-export.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="border-slate-600"
                  >
                    Download FHIR File
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import FHIR Data
              </CardTitle>
              <CardDescription className="text-gray-400">
                Import health data from external FHIR-compliant systems into your encrypted vault
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">FHIR Bundle JSON</Label>
                <Textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste FHIR Bundle JSON here..."
                  rows={10}
                  className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
                />
              </div>

              <Button
                onClick={handleImportFHIR}
                disabled={isImporting || !importData.trim()}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isImporting ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-pulse" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import FHIR Data
                  </>
                )}
              </Button>

              <div className="bg-slate-700/30 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Import Security</h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-green-400" />
                    <span>All imported data is automatically encrypted in your vault</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-400" />
                    <span>You maintain full control over who can access imported data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Imported data follows the same privacy and consent rules</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="h-5 w-5" />
                FHIR Resources
              </CardTitle>
              <CardDescription className="text-gray-400">
                Available FHIR resources and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fhirResources.map((resource) => (
                  <Card key={resource.id} className="bg-slate-700/30 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {getResourceIcon(resource.resourceType)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-white">{resource.resourceType}</h3>
                            <Badge className="bg-cyan-500 text-xs">
                              {resource.resourceType}
                            </Badge>
                            {resource.meta?.extension?.some(ext => ext.url === 'https://mediledger.org/fhir/encrypted-data') && (
                              <Badge className="bg-green-500 text-xs">
                                Encrypted
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">
                            ID: {resource.id} • Updated: {resource.meta?.lastUpdated ?
                              new Date(resource.meta.lastUpdated).toLocaleDateString() : 'Unknown'
                            }
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600"
                          onClick={() => {
                            const jsonData = JSON.stringify(resource, null, 2);
                            navigator.clipboard.writeText(jsonData);
                            toast.success('FHIR resource copied to clipboard');
                          }}
                        >
                          Copy JSON
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="h-5 w-5" />
                FHIR API Endpoints
              </CardTitle>
              <CardDescription className="text-gray-400">
                Standard FHIR REST API endpoints for external system integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-white">Patient Resources</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <code className="bg-slate-700 px-2 py-1 rounded text-cyan-400">GET</code>
                      <span className="text-gray-400">/api/fhir/Patient/[id]</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-slate-700 px-2 py-1 rounded text-green-400">GET</code>
                      <span className="text-gray-400">/api/fhir/Patient/[id]/$everything</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-white">Observation Resources</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <code className="bg-slate-700 px-2 py-1 rounded text-cyan-400">GET</code>
                      <span className="text-gray-400">/api/fhir/Observation/[id]</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-slate-700 px-2 py-1 rounded text-green-400">POST</code>
                      <span className="text-gray-400">/api/fhir/Observation</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/30 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🔐 Consent-Aware Access</h4>
                <p className="text-sm text-gray-400">
                  All FHIR endpoints require valid NFT consent tokens. External systems must first obtain
                  patient consent before accessing healthcare data through these APIs.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Standards Compliance */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Standards Compliance
          </CardTitle>
          <CardDescription className="text-gray-400">
            MediLedger Nexus FHIR implementation follows global healthcare standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">HL7 FHIR R4</h3>
              <p className="text-sm text-gray-400">
                Full compliance with HL7 FHIR Release 4 specification for maximum interoperability
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Privacy Extensions</h3>
              <p className="text-sm text-gray-400">
                MediLedger-specific FHIR extensions for privacy levels and consent references
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Multi-Format Support</h3>
              <p className="text-sm text-gray-400">
                Support for JSON and XML FHIR formats with automatic content negotiation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Benefits */}
      <Card className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Global Health Integration Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-3">🏥 Healthcare Systems</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Connect with existing EHR systems worldwide
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Enable telemedicine and remote care
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Support for clinical decision support systems
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">🌍 Global Standards</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Work with international healthcare providers
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Support cross-border medical care
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Enable medical tourism and international treatment
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FHIRIntegration;
