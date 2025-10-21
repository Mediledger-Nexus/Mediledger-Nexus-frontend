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
  Brain,
  MessageSquare,
  Activity,
  Pill,
  TestTube,
  Camera,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Zap,
  Target,
  Lightbulb,
  Stethoscope,
  Heart,
  Eye,
  Thermometer,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import AIDiagnosticService, {
  AIDiagnosticRequest,
  AIDiagnosticResponse,
  AIAgent
} from '@/lib/aiDiagnosticService';
import { usePrivacyEconomy } from '@/hooks/usePrivacyEconomy';

interface AIDiagnosticInterfaceProps {
  patientDid: string;
  patientPrivateKey: string;
  doctorDid?: string;
}

export function AIDiagnosticInterface({
  patientDid,
  patientPrivateKey,
  doctorDid
}: AIDiagnosticInterfaceProps) {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [diagnosticRequest, setDiagnosticRequest] = useState<AIDiagnosticRequest>({
    id: '',
    patientId: patientDid,
    dataType: 'text',
    data: {},
    query: '',
    privacyLevel: 'identified',
    consentId: ''
  });
  const [currentResponse, setCurrentResponse] = useState<AIDiagnosticResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{
    type: 'request' | 'response';
    content: string;
    timestamp: string;
  }>>([]);

  const { getVaultStats } = usePrivacyEconomy({ patientDid, patientPrivateKey });

  // Initialize AI service and load agents
  useEffect(() => {
    const initAI = async () => {
      try {
        await AIDiagnosticService.initialize();
        const availableAgents = AIDiagnosticService.getAvailableAgents();
        setAgents(availableAgents);

        if (availableAgents.length > 0) {
          setSelectedAgent(availableAgents[0].id);
        }
      } catch (error) {
        console.error('Failed to initialize AI service:', error);
        toast.error('Failed to initialize AI diagnostic service');
      }
    };

    initAI();
  }, []);

  // Submit diagnostic request
  const handleSubmitDiagnosis = async () => {
    if (!selectedAgent || !diagnosticRequest.query.trim()) {
      toast.error('Please select an AI agent and enter a query');
      return;
    }

    setIsAnalyzing(true);
    const request: AIDiagnosticRequest = {
      ...diagnosticRequest,
      id: `req_${Date.now()}`,
      patientId: patientDid,
      dataType: diagnosticRequest.dataType || 'text'
    };

    try {
      // Add to chat history
      setChatHistory(prev => [...prev, {
        type: 'request',
        content: diagnosticRequest.query,
        timestamp: new Date().toISOString()
      }]);

      const response = await AIDiagnosticService.requestDiagnosis(request);

      setCurrentResponse(response);

      // Add response to chat history
      setChatHistory(prev => [...prev, {
        type: 'response',
        content: response.diagnosis,
        timestamp: response.timestamp
      }]);

      toast.success('AI analysis completed');
    } catch (error) {
      console.error('Diagnostic request failed:', error);
      toast.error('Failed to get AI diagnosis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Start federated learning session
  const handleStartFederatedLearning = async () => {
    try {
      const sessionId = await AIDiagnosticService.startFederatedLearning(
        'Medical Diagnosis Improvement',
        agents.map(a => a.id)
      );

      toast.success(`Federated learning session started: ${sessionId}`);
    } catch (error) {
      console.error('Failed to start federated learning:', error);
      toast.error('Failed to start federated learning');
    }
  };

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'vitals': return <Activity className="h-4 w-4" />;
      case 'medications': return <Pill className="h-4 w-4" />;
      case 'lab_results': return <TestTube className="h-4 w-4" />;
      case 'imaging': return <Camera className="h-4 w-4" />;
      case 'text': return <MessageSquare className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const vaultStats = getVaultStats();

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="h-8 w-8 text-cyan-400" />
            AI Diagnostic Co-Pilot
          </h1>
          <p className="text-gray-400 mt-2">
            Advanced medical AI analysis powered by Groq AI and federated learning
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleStartFederatedLearning}
            className="border-purple-500 text-purple-400 hover:bg-purple-900/20"
          >
            <Users className="h-4 w-4 mr-2" />
            Federated Learning
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Diagnostic Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Agent Selection */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Select AI Specialist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {agents.map((agent) => (
                  <Card
                    key={agent.id}
                    className={`cursor-pointer transition-all ${
                      selectedAgent === agent.id
                        ? 'bg-cyan-900/30 border-cyan-500'
                        : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50'
                    }`}
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          agent.specialization === 'cardiology' ? 'bg-red-500/20' :
                          agent.specialization === 'neurology' ? 'bg-purple-500/20' :
                          agent.specialization === 'emergency' ? 'bg-orange-500/20' :
                          'bg-blue-500/20'
                        }`}>
                          {agent.specialization === 'cardiology' && <Heart className="h-5 w-5 text-red-400" />}
                          {agent.specialization === 'neurology' && <Brain className="h-5 w-5 text-purple-400" />}
                          {agent.specialization === 'emergency' && <Zap className="h-5 w-5 text-orange-400" />}
                          {agent.specialization === 'general' && <Stethoscope className="h-5 w-5 text-blue-400" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{agent.name}</h3>
                          <p className="text-sm text-gray-400 capitalize">{agent.specialization}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${agent.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'} text-xs`}>
                              {agent.status}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {agent.accuracy * 100}% accuracy
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Diagnostic Query Interface */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Diagnostic Query
              </CardTitle>
              <CardDescription className="text-gray-400">
                Describe symptoms, ask questions, or request analysis of patient data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Data Type</Label>
                  <Select
                    value={diagnosticRequest.dataType}
                    onValueChange={(value) => setDiagnosticRequest(prev => ({ ...prev, dataType: value as any }))}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Clinical Notes</SelectItem>
                      <SelectItem value="vitals">Vital Signs</SelectItem>
                      <SelectItem value="medications">Medications</SelectItem>
                      <SelectItem value="lab_results">Lab Results</SelectItem>
                      <SelectItem value="imaging">Medical Imaging</SelectItem>
                      <SelectItem value="symptoms">Patient Symptoms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Privacy Level</Label>
                  <Select
                    value={diagnosticRequest.privacyLevel}
                    onValueChange={(value) => setDiagnosticRequest(prev => ({ ...prev, privacyLevel: value as any }))}
                  >
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
              </div>

              <div>
                <Label className="text-white">Query</Label>
                <Textarea
                  value={diagnosticRequest.query}
                  onChange={(e) => setDiagnosticRequest(prev => ({ ...prev, query: e.target.value }))}
                  placeholder="Describe the patient's symptoms, ask diagnostic questions, or request analysis..."
                  rows={4}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <Button
                onClick={handleSubmitDiagnosis}
                disabled={isAnalyzing || !selectedAgent}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Get AI Diagnosis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* AI Response */}
          {currentResponse && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  AI Diagnostic Analysis
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={`${getUrgencyColor(currentResponse.riskAssessment.urgency)} text-white`}>
                    {currentResponse.riskAssessment.urgency.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-400">
                    {Math.round(currentResponse.confidence * 100)}% confidence
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-white mb-2">Primary Diagnosis</h4>
                  <p className="text-lg text-cyan-400">{currentResponse.diagnosis}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Clinical Reasoning</h4>
                  <p className="text-gray-300">{currentResponse.reasoning}</p>
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

                <div>
                  <h4 className="font-semibold text-white mb-2">Risk Assessment</h4>
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <p className="text-gray-300">{currentResponse.riskAssessment.explanation}</p>
                    <div className="mt-2 space-y-1">
                      {currentResponse.riskAssessment.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-gray-400">
                          <Target className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {currentResponse.differentialDiagnosis.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Differential Diagnosis</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentResponse.differentialDiagnosis.map((diagnosis, index) => (
                        <Badge key={index} variant="outline" className="text-gray-300">
                          {diagnosis}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">AI Agent</p>
                    <p className="text-white">{currentResponse.aiAgent}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Processing Time</p>
                    <p className="text-white">{currentResponse.metadata.processingTime}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat History */}
          {chatHistory.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversation History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {chatHistory.map((message, index) => (
                  <div key={index} className={`flex ${message.type === 'request' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'request'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-700 text-gray-300'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Agents Status */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                AI Agents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{agent.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{agent.specialization}</p>
                  </div>
                  <Badge className="bg-cyan-500 text-xs">
                    {Math.round(agent.accuracy * 100)}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Health Vault Integration */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Health Vault Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Records Available</span>
                <span className="text-sm font-medium text-white">{vaultStats?.totalRecords || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">ZK Proofs</span>
                <span className="text-sm font-medium text-green-400">{vaultStats?.zkProofsCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Last Access</span>
                <span className="text-sm text-gray-400">
                  {vaultStats?.lastAccessed ?
                    new Date(vaultStats.lastAccessed).toLocaleDateString() :
                    'Never'
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-slate-600 text-gray-300 hover:bg-slate-700/50"
                onClick={() => setDiagnosticRequest(prev => ({
                  ...prev,
                  query: "Patient presents with chest pain, shortness of breath, and fatigue. Please provide differential diagnosis and urgency assessment."
                }))}
              >
                <Heart className="h-4 w-4 mr-2" />
                Cardiac Assessment
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-slate-600 text-gray-300 hover:bg-slate-700/50"
                onClick={() => setDiagnosticRequest(prev => ({
                  ...prev,
                  query: "Patient reports severe headache, nausea, and sensitivity to light. Evaluate for possible neurological conditions."
                }))}
              >
                <Brain className="h-4 w-4 mr-2" />
                Neurological Eval
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-slate-600 text-gray-300 hover:bg-slate-700/50"
                onClick={() => setDiagnosticRequest(prev => ({
                  ...prev,
                  query: "Patient has fever, cough, and difficulty breathing. Assess respiratory condition and treatment options."
                }))}
              >
                <Activity className="h-4 w-4 mr-2" />
                Respiratory Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AIDiagnosticInterface;
