import { useState, useEffect, useCallback } from 'react';
import AIDiagnosticService, {
  AIDiagnosticRequest,
  AIDiagnosticResponse,
  AIAgent
} from '@/lib/aiDiagnosticService';
import { usePrivacyEconomy } from './usePrivacyEconomy';
import { toast } from 'sonner';

interface UseAIDiagnosticProps {
  patientDid: string;
  patientPrivateKey: string;
  doctorDid?: string;
}

interface AIDiagnosticState {
  agents: AIAgent[];
  selectedAgent: string | null;
  currentRequest: AIDiagnosticRequest | null;
  currentResponse: AIDiagnosticResponse | null;
  chatHistory: Array<{
    type: 'request' | 'response';
    content: string;
    timestamp: string;
    metadata?: any;
  }>;
  isAnalyzing: boolean;
  error: string | null;
}

export function useAIDiagnostic({ patientDid, patientPrivateKey, doctorDid }: UseAIDiagnosticProps) {
  const [state, setState] = useState<AIDiagnosticState>({
    agents: [],
    selectedAgent: null,
    currentRequest: null,
    currentResponse: null,
    chatHistory: [],
    isAnalyzing: false,
    error: null
  });

  const { storeHealthRecord, grantConsentWithReward } = usePrivacyEconomy({
    patientDid,
    patientPrivateKey
  });

  // Initialize AI service
  const initializeAI = useCallback(async () => {
    setState(prev => ({ ...prev, error: null }));

    try {
      await AIDiagnosticService.initialize();
      const agents = AIDiagnosticService.getAvailableAgents();

      setState(prev => ({
        ...prev,
        agents,
        selectedAgent: agents.length > 0 ? agents[0].id : null
      }));
    } catch (error) {
      console.error('Failed to initialize AI diagnostic service:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize AI service'
      }));
    }
  }, []);

  // Submit diagnostic request
  const submitDiagnosis = useCallback(async (request: AIDiagnosticRequest) => {
    if (!state.selectedAgent) {
      throw new Error('No AI agent selected');
    }

    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      currentRequest: request,
      error: null
    }));

    try {
      // Add request to chat history
      setState(prev => ({
        ...prev,
        chatHistory: [...prev.chatHistory, {
          type: 'request',
          content: request.query,
          timestamp: new Date().toISOString()
        }]
      }));

      const response = await AIDiagnosticService.requestDiagnosis(request);

      setState(prev => ({
        ...prev,
        currentResponse: response,
        isAnalyzing: false,
        chatHistory: [...prev.chatHistory, {
          type: 'response',
          content: response.diagnosis,
          timestamp: response.timestamp,
          metadata: {
            confidence: response.confidence,
            urgency: response.riskAssessment.urgency,
            agent: response.aiAgent
          }
        }]
      }));

      return response;
    } catch (error) {
      console.error('Diagnostic request failed:', error);
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'Failed to get diagnosis'
      }));
      throw error;
    }
  }, [state.selectedAgent]);

  // Store diagnostic result in health vault
  const storeDiagnosisInVault = useCallback(async (diagnosis: AIDiagnosticResponse) => {
    try {
      const recordData = {
        dataType: 'notes' as const,
        title: `AI Diagnosis - ${diagnosis.diagnosis}`,
        content: {
          diagnosis: diagnosis.diagnosis,
          confidence: diagnosis.confidence,
          reasoning: diagnosis.reasoning,
          recommendations: diagnosis.recommendations,
          riskAssessment: diagnosis.riskAssessment,
          timestamp: diagnosis.timestamp,
          aiAgent: diagnosis.aiAgent
        },
        emergencyAccess: diagnosis.riskAssessment.urgency === 'critical'
      };

      const recordId = await storeHealthRecord(recordData);

      // Grant consent for doctor to access this diagnostic record
      if (doctorDid) {
        await grantConsentWithReward(
          recordId,
          doctorDid,
          ['diagnostic_notes']
        );
      }

      toast.success('Diagnosis stored securely in health vault');
      return recordId;
    } catch (error) {
      console.error('Failed to store diagnosis in vault:', error);
      toast.error('Failed to store diagnosis in vault');
      throw error;
    }
  }, [storeHealthRecord, grantConsentWithReward, doctorDid]);

  // Start federated learning session
  const startFederatedLearning = useCallback(async (topic: string) => {
    try {
      const sessionId = await AIDiagnosticService.startFederatedLearning(
        topic,
        state.agents.map(a => a.id)
      );

      toast.success(`Federated learning session started: ${topic}`);
      return sessionId;
    } catch (error) {
      console.error('Failed to start federated learning:', error);
      toast.error('Failed to start federated learning');
      throw error;
    }
  }, [state.agents]);

  // Get AI agent metrics
  const getAgentMetrics = useCallback((agentId: string) => {
    return AIDiagnosticService.getAIAgentMetrics(agentId);
  }, []);

  // Select AI agent
  const selectAgent = useCallback((agentId: string) => {
    setState(prev => ({
      ...prev,
      selectedAgent: agentId
    }));
  }, []);

  // Clear current analysis
  const clearAnalysis = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentRequest: null,
      currentResponse: null
    }));
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeAI();
  }, [initializeAI]);

  return {
    // State
    ...state,

    // Actions
    submitDiagnosis,
    storeDiagnosisInVault,
    startFederatedLearning,
    selectAgent,
    clearAnalysis,

    // Getters
    getAgentMetrics,
    selectedAgentInfo: state.selectedAgent ? AIDiagnosticService.getAgent(state.selectedAgent) : null,

    // Computed
    isInitialized: state.agents.length > 0,
    hasActiveAnalysis: state.isAnalyzing || !!state.currentResponse,
    chatMessageCount: state.chatHistory.length
  };
}

export default useAIDiagnostic;
