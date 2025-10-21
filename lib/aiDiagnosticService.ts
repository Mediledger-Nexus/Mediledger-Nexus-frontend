import { Client, TopicMessageSubmitTransaction, TopicId } from "@hashgraph/sdk";
import { client, OPERATOR_ID, OPERATOR_KEY } from "../lib/hedera";

// AI Diagnostic Service for MediLedger Nexus
// Integrates Groq AI with HCS for decentralized AI collaboration

export interface AIDiagnosticRequest {
  id: string;
  patientId: string;
  dataType: 'text' | 'imaging' | 'genomics' | 'vitals' | 'medications' | 'symptoms';
  data: any; // Encrypted or anonymized patient data
  query: string; // What the healthcare provider wants to know
  context?: {
    previousDiagnoses?: string[];
    currentMedications?: string[];
    allergies?: string[];
    riskFactors?: string[];
  };
  privacyLevel: 'anonymous' | 'pseudonymous' | 'identified';
  consentId?: string; // Reference to NFT consent
}

export interface AIDiagnosticResponse {
  id: string;
  requestId: string;
  diagnosis: string;
  confidence: number; // 0-1 scale
  reasoning: string;
  recommendations: string[];
  differentialDiagnosis: string[];
  followUpQuestions: string[];
  riskAssessment: {
    urgency: 'low' | 'medium' | 'high' | 'critical';
    explanation: string;
    nextSteps: string[];
  };
  evidence: {
    sources: string[];
    confidenceFactors: string[];
    limitations: string[];
  };
  metadata: {
    model: string;
    processingTime: number; // milliseconds
    tokensUsed: number;
    cost: number; // in credits/tokens
  };
  timestamp: string;
  aiAgent: string; // Which AI agent provided the response
}

export interface AIAgent {
  id: string;
  name: string;
  specialization: 'general' | 'cardiology' | 'neurology' | 'oncology' | 'emergency' | 'pediatrics';
  model: string;
  status: 'active' | 'training' | 'maintenance';
  accuracy: number; // Historical accuracy rate
  responseTime: number; // Average response time in ms
  costPerRequest: number; // Token cost
}

export interface FederatedLearningSession {
  id: string;
  topic: string; // Medical condition or research area
  participants: string[]; // AI agent IDs
  dataContributions: Map<string, number>; // Agent ID -> contribution score
  modelUpdates: Map<string, any>; // Agent ID -> model update
  aggregatedModel?: any;
  status: 'initializing' | 'collecting' | 'training' | 'complete' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export class AIDiagnosticService {
  private static agents: Map<string, AIAgent> = new Map();
  private static federatedSessions: Map<string, FederatedLearningSession> = new Map();
  private static hcsTopicId: TopicId | null = null;

  // Groq AI API configuration
  private static readonly GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  private static readonly GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
  private static readonly HCS_TOPIC_ID = process.env.NEXT_PUBLIC_HCS_TOPIC_ID || "0.0.123456";

  // Demo mode for development
  private static readonly DEMO_MODE = process.env.NEXT_PUBLIC_HEDERA_NETWORK !== 'mainnet';

  /**
   * Initialize AI diagnostic service
   */
  static async initialize(): Promise<void> {
    if (this.DEMO_MODE) {
      // Initialize demo AI agents
      this.agents.set('agent_general', {
        id: 'agent_general',
        name: 'MediMind General',
        specialization: 'general',
        model: 'llama3-70b-8192',
        status: 'active',
        accuracy: 0.94,
        responseTime: 150,
        costPerRequest: 0.02
      });

      this.agents.set('agent_cardiology', {
        id: 'agent_cardiology',
        name: 'CardioAI Expert',
        specialization: 'cardiology',
        model: 'llama3-70b-8192',
        status: 'active',
        accuracy: 0.96,
        responseTime: 200,
        costPerRequest: 0.03
      });

      console.log('AI Diagnostic Service initialized in demo mode');
      return;
    }

    // Initialize HCS topic for AI communication
    this.hcsTopicId = TopicId.fromString(this.HCS_TOPIC_ID);

    // Initialize real AI agents (would connect to actual AI services)
    console.log('AI Diagnostic Service initialized');
  }

  /**
   * Request AI diagnostic analysis
   */
  static async requestDiagnosis(request: AIDiagnosticRequest): Promise<AIDiagnosticResponse> {
    if (this.DEMO_MODE) {
      return await this.getDemoDiagnosis(request);
    }

    // Select appropriate AI agent based on data type and specialization
    const agent = this.selectAIAgent(request.dataType, request.context);

    if (!agent) {
      throw new Error('No suitable AI agent available for this diagnostic request');
    }

    // Prepare prompt for AI
    const prompt = this.buildDiagnosticPrompt(request);

    try {
      // Call Groq AI API
      const response = await fetch(`${this.GROQ_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: agent.model,
          messages: [
            {
              role: 'system',
              content: 'You are a medical AI diagnostic assistant. Provide accurate, evidence-based medical analysis while maintaining patient privacy and following medical guidelines.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from AI model');
      }

      // Parse AI response
      const diagnosis = this.parseAIResponse(aiResponse);

      // Log to HCS for audit trail
      await this.logToHCS('diagnosis_request', {
        requestId: request.id,
        agentId: agent.id,
        patientId: request.patientId,
        dataType: request.dataType,
        timestamp: new Date().toISOString()
      });

      return {
        id: `diag_${Date.now()}`,
        requestId: request.id,
        diagnosis: diagnosis.primary,
        confidence: diagnosis.confidence,
        reasoning: diagnosis.reasoning,
        recommendations: diagnosis.recommendations,
        differentialDiagnosis: diagnosis.differential,
        followUpQuestions: diagnosis.questions,
        riskAssessment: diagnosis.risk,
        evidence: {
          sources: diagnosis.sources,
          confidenceFactors: diagnosis.confidenceFactors,
          limitations: diagnosis.limitations
        },
        metadata: {
          model: agent.model,
          processingTime: data.usage?.total_time || 0,
          tokensUsed: data.usage?.total_tokens || 0,
          cost: agent.costPerRequest
        },
        timestamp: new Date().toISOString(),
        aiAgent: agent.id
      };
    } catch (error) {
      console.error('AI diagnostic request failed:', error);
      throw new Error('Failed to get AI diagnosis');
    }
  }

  /**
   * Select appropriate AI agent for the diagnostic request
   */
  private static selectAIAgent(dataType: string, context?: any): AIAgent | null {
    // Simple agent selection logic
    const specializations: Record<string, string[]> = {
      'cardiology': ['chest_pain', 'heart', 'cardiac', 'palpitations', 'hypertension'],
      'neurology': ['headache', 'seizure', 'stroke', 'dementia', 'paralysis'],
      'emergency': ['trauma', 'severe_pain', 'unconscious', 'critical']
    };

    // Check context for keywords
    if (context?.symptoms) {
      const symptomsText = context.symptoms.join(' ').toLowerCase();

      for (const [specialty, keywords] of Object.entries(specializations)) {
        if (keywords.some(keyword => symptomsText.includes(keyword))) {
          const agentId = `agent_${specialty}`;
          return this.agents.get(agentId) || null;
        }
      }
    }

    // Default to general AI agent
    return this.agents.get('agent_general') || null;
  }

  /**
   * Build diagnostic prompt for AI
   */
  private static buildDiagnosticPrompt(request: AIDiagnosticRequest): string {
    let prompt = `Please provide a medical diagnostic analysis for the following case:

Patient Data Type: ${request.dataType}
Query: ${request.query}
Privacy Level: ${request.privacyLevel}

`;

    if (request.context) {
      if (request.context.previousDiagnoses?.length) {
        prompt += `Previous Diagnoses: ${request.context.previousDiagnoses.join(', ')}\n`;
      }
      if (request.context.currentMedications?.length) {
        prompt += `Current Medications: ${request.context.currentMedications.join(', ')}\n`;
      }
      if (request.context.allergies?.length) {
        prompt += `Known Allergies: ${request.context.allergies.join(', ')}\n`;
      }
      if (request.context.riskFactors?.length) {
        prompt += `Risk Factors: ${request.context.riskFactors.join(', ')}\n`;
      }
    }

    prompt += `
Please provide:
1. Primary diagnosis with confidence level
2. Differential diagnoses to consider
3. Clinical reasoning and evidence
4. Treatment recommendations
5. Follow-up questions for the patient
6. Risk assessment and urgency level
7. Any limitations or caveats

Respond in a structured, professional medical format.`;

    return prompt;
  }

  /**
   * Parse AI response into structured format
   */
  private static parseAIResponse(response: string): any {
    // In a real implementation, this would use sophisticated NLP parsing
    // For demo purposes, return structured mock data
    return {
      primary: "Acute bronchitis with possible early pneumonia",
      confidence: 0.78,
      reasoning: "Patient presents with cough, fever, and chest discomfort. Symptoms suggest respiratory infection with potential for progression.",
      recommendations: [
        "Chest X-ray to rule out pneumonia",
        "Antibiotic therapy if bacterial infection suspected",
        "Symptomatic treatment with rest and hydration",
        "Follow-up in 48-72 hours if symptoms worsen"
      ],
      differential: [
        "Viral upper respiratory infection",
        "Acute bronchitis",
        "Early pneumonia",
        "COVID-19 infection"
      ],
      questions: [
        "When did symptoms begin?",
        "Any recent travel or sick contacts?",
        "Current smoking status?",
        "Previous similar episodes?"
      ],
      risk: {
        urgency: 'medium',
        explanation: 'Respiratory symptoms require monitoring but not immediate emergency care',
        nextSteps: [
          'Monitor temperature and respiratory rate',
          'Consider COVID-19 testing',
          'Schedule follow-up appointment'
        ]
      },
      sources: [
        'CDC Guidelines for Acute Bronchitis',
        'American Thoracic Society Pneumonia Guidelines',
        'WHO Respiratory Infection Management'
      ],
      confidenceFactors: [
        'Classic symptom presentation',
        'Seasonal epidemiology',
        'Patient risk factors'
      ],
      limitations: [
        'Limited physical examination data',
        'No laboratory results available',
        'Patient-reported symptoms only'
      ]
    };
  }

  /**
   * Get demo diagnosis for development
   */
  private static async getDemoDiagnosis(request: AIDiagnosticRequest): Promise<AIDiagnosticResponse> {
    const agent = this.agents.get('agent_general')!;

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockDiagnosis = this.parseAIResponse('Mock AI response');

    return {
      id: `diag_${Date.now()}`,
      requestId: request.id,
      diagnosis: mockDiagnosis.primary,
      confidence: mockDiagnosis.confidence,
      reasoning: mockDiagnosis.reasoning,
      recommendations: mockDiagnosis.recommendations,
      differentialDiagnosis: mockDiagnosis.differential,
      followUpQuestions: mockDiagnosis.questions,
      riskAssessment: mockDiagnosis.risk,
      evidence: {
        sources: mockDiagnosis.sources,
        confidenceFactors: mockDiagnosis.confidenceFactors,
        limitations: mockDiagnosis.limitations
      },
      metadata: {
        model: agent.model,
        processingTime: 150,
        tokensUsed: 450,
        cost: agent.costPerRequest
      },
      timestamp: new Date().toISOString(),
      aiAgent: agent.id
    };
  }

  /**
   * Start federated learning session
   */
  static async startFederatedLearning(
    topic: string,
    participants: string[]
  ): Promise<string> {
    const sessionId = `fl_${Date.now()}`;

    if (this.DEMO_MODE) {
      const session: FederatedLearningSession = {
        id: sessionId,
        topic,
        participants,
        dataContributions: new Map(),
        modelUpdates: new Map(),
        status: 'initializing',
        createdAt: new Date().toISOString()
      };

      this.federatedSessions.set(sessionId, session);
      console.log(`Demo: Started federated learning session ${sessionId} on topic: ${topic}`);
      return sessionId;
    }

    // In production, this would coordinate with multiple AI agents
    throw new Error('Federated learning not implemented in demo mode');
  }

  /**
   * Contribute to federated learning
   */
  static async contributeToFederatedLearning(
    sessionId: string,
    agentId: string,
    modelUpdate: any
  ): Promise<void> {
    if (this.DEMO_MODE) {
      const session = this.federatedSessions.get(sessionId);
      if (session) {
        session.modelUpdates.set(agentId, modelUpdate);
        session.dataContributions.set(agentId, (session.dataContributions.get(agentId) || 0) + 1);

        // Check if all participants have contributed
        if (session.modelUpdates.size >= session.participants.length) {
          session.status = 'complete';
          session.completedAt = new Date().toISOString();
        }
      }
      return;
    }

    throw new Error('Federated learning not implemented in demo mode');
  }

  /**
   * Get available AI agents
   */
  static getAvailableAgents(): AIAgent[] {
    return Array.from(this.agents.values()).filter(agent => agent.status === 'active');
  }

  /**
   * Get AI agent by ID
   */
  static getAgent(agentId: string): AIAgent | null {
    return this.agents.get(agentId) || null;
  }

  /**
   * Log AI activity to HCS for audit trail
   */
  private static async logToHCS(eventType: string, eventData: any): Promise<void> {
    if (this.DEMO_MODE || !this.hcsTopicId || !client) {
      console.log(`Demo: Would log ${eventType} to HCS:`, eventData);
      return;
    }

    try {
      const message = JSON.stringify({
        type: eventType,
        data: eventData,
        timestamp: new Date().toISOString()
      });

      await new TopicMessageSubmitTransaction()
        .setTopicId(this.hcsTopicId)
        .setMessage(message)
        .execute(client);
    } catch (error) {
      console.error('Failed to log to HCS:', error);
    }
  }

  /**
   * Get federated learning session status
   */
  static getFederatedLearningSession(sessionId: string): FederatedLearningSession | null {
    return this.federatedSessions.get(sessionId) || null;
  }

  /**
   * Get all active federated learning sessions
   */
  static getActiveFederatedSessions(): FederatedLearningSession[] {
    return Array.from(this.federatedSessions.values())
      .filter(session => session.status === 'initializing' || session.status === 'collecting' || session.status === 'training');
  }

  /**
   * Calculate AI agent performance metrics
   */
  static getAIAgentMetrics(agentId: string): {
    totalRequests: number;
    averageResponseTime: number;
    averageConfidence: number;
    costPerRequest: number;
    uptime: number;
  } | null {
    const agent = this.agents.get(agentId);
    if (!agent) return null;

    // Mock metrics for demo
    return {
      totalRequests: Math.floor(Math.random() * 1000) + 100,
      averageResponseTime: agent.responseTime,
      averageConfidence: agent.accuracy,
      costPerRequest: agent.costPerRequest,
      uptime: 0.99 // 99% uptime
    };
  }
}

export default AIDiagnosticService;
