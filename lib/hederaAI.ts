// Hedera AI Integration for MediLedger Nexus
// Advanced AI system that integrates with Hedera services and can be upgraded to AI Agent Kit

export interface AIAnalysis {
  urgency: number;
  conditions: string[];
  nextSteps: string[];
  advice: string;
  recommendations: AIRecommendation[];
  hcsLogId?: string;
}

export interface AIRecommendation {
  type: 'doctor' | 'hospital' | 'medication' | 'test' | 'lifestyle';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  contact?: string;
}

export interface AIContext {
  patientDid: string;
  symptoms: string;
  medicalHistory?: any[];
  currentMedications?: string[];
  allergies?: string[];
  vitalSigns?: Record<string, any>;
}

// Hedera AI Agent Kit Integration (Future-ready)
class HederaAIAgent {
  private agentId: string;
  private hcsTopicId: string;
  private network: string;

  constructor() {
    this.agentId = process.env.HEDERA_AI_AGENT_ID || 'mediledger-ai-agent';
    this.hcsTopicId = process.env.HCS_TOPIC_ID || '0.0.123456';
    this.network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
  }

  // Initialize AI Agent on Hedera
  async initializeAgent(): Promise<void> {
    try {
      const { HederaLogger } = await import('./hedera');
      
      await HederaLogger.logRegistration({
        type: 'ai_agent_init',
        agentId: this.agentId,
        capabilities: [
          'symptom_analysis',
          'health_recommendations',
          'consent_verification',
          'record_access_control',
          'emergency_detection'
        ],
        network: this.network,
        timestamp: new Date().toISOString(),
      });

      console.log('Hedera AI Agent initialized');
    } catch (error) {
      console.error('Failed to initialize Hedera AI Agent:', error);
    }
  }

  // Enhanced symptom analysis with Hedera integration
  async analyzeSymptoms(context: AIContext): Promise<AIAnalysis> {
    try {
      // Log analysis request to HCS
      const { HederaLogger } = await import('./hedera');
      const logId = await HederaLogger.logRegistration({
        type: 'ai_analysis_request',
        agentId: this.agentId,
        patientDid: context.patientDid,
        symptoms: context.symptoms,
        timestamp: new Date().toISOString(),
      });

      // Enhanced AI analysis (currently using Groq, ready for Hedera AI Agent Kit)
      const analysis = await this.performAdvancedAnalysis(context);
      
      // Log analysis results to HCS
      await HederaLogger.logRegistration({
        type: 'ai_analysis_result',
        agentId: this.agentId,
        patientDid: context.patientDid,
        urgency: analysis.urgency,
        conditions: analysis.conditions,
        recommendations: analysis.recommendations.length,
        timestamp: new Date().toISOString(),
      });

      return {
        ...analysis,
        hcsLogId: logId,
      };
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.getFallbackAnalysis(context.symptoms);
    }
  }

  // Advanced analysis combining multiple AI capabilities
  private async performAdvancedAnalysis(context: AIContext): Promise<Omit<AIAnalysis, 'hcsLogId'>> {
    // Enhanced prompt for better medical analysis
    const enhancedPrompt = this.buildEnhancedPrompt(context);
    
    // Use Groq AI with enhanced prompting
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{
          role: "user",
          content: enhancedPrompt
        }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Invalid AI response');
    }

    // Parse structured response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let analysis;
    if (jsonMatch) {
      try {
        analysis = JSON.parse(jsonMatch[0]);
      } catch (e) {
        analysis = this.getFallbackAnalysis(context.symptoms);
      }
    } else {
      analysis = this.getFallbackAnalysis(context.symptoms);
    }

    // Enhance with recommendations
    const recommendations = await this.generateRecommendations(analysis, context);
    
    return {
      ...analysis,
      advice: jsonMatch ? content.replace(jsonMatch[0], '').trim() : content.trim(),
      recommendations,
    };
  }

  // Build enhanced prompt with medical context
  private buildEnhancedPrompt(context: AIContext): string {
    const { symptoms, medicalHistory, currentMedications, allergies } = context;
    
    let prompt = `You are MediLedger Nexus AI, an advanced healthcare assistant powered by Hedera Hashgraph. 

PATIENT CONTEXT:
- Symptoms: ${symptoms}`;

    if (medicalHistory && medicalHistory.length > 0) {
      prompt += `\n- Medical History: ${medicalHistory.map(h => h.title).join(', ')}`;
    }

    if (currentMedications && currentMedications.length > 0) {
      prompt += `\n- Current Medications: ${currentMedications.join(', ')}`;
    }

    if (allergies && allergies.length > 0) {
      prompt += `\n- Known Allergies: ${allergies.join(', ')}`;
    }

    prompt += `

ANALYSIS REQUIREMENTS:
1. Provide a caring, professional response directly to the patient
2. Assess urgency level (1-10, where 10 is life-threatening)
3. Identify possible conditions based on symptoms
4. Suggest appropriate next steps
5. Consider the patient's medical history and current medications
6. Flag any potential drug interactions or allergy concerns

RESPONSE FORMAT:
First, speak directly to the patient in a clear, caring way. Then provide a JSON summary with this exact format:
{"urgency":7,"conditions":["Possible condition"],"nextSteps":["Step 1","Step 2"]}

Remember: This is not a substitute for professional medical advice. Always recommend consulting healthcare professionals for serious concerns.`;

    return prompt;
  }

  // Generate contextual recommendations
  private async generateRecommendations(analysis: any, context: AIContext): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];

    // Doctor recommendations based on urgency
    if (analysis.urgency >= 7) {
      recommendations.push({
        type: 'doctor',
        title: 'Emergency Care',
        description: 'Seek immediate medical attention',
        priority: 'urgent',
        location: 'Emergency Room',
        contact: 'Emergency: 911'
      });
    } else if (analysis.urgency >= 5) {
      recommendations.push({
        type: 'doctor',
        title: 'Primary Care Physician',
        description: 'Schedule appointment with your family doctor',
        priority: 'high',
        location: 'Local Medical Center'
      });
    }

    // Hospital recommendations for specific conditions
    if (analysis.conditions.some((c: string) => c.toLowerCase().includes('cardiac'))) {
      recommendations.push({
        type: 'hospital',
        title: 'Cardiology Center',
        description: 'Specialized cardiac care facility',
        priority: 'high',
        location: 'Regional Medical Center'
      });
    }

    // Medication recommendations (non-prescription)
    if (analysis.conditions.some((c: string) => c.toLowerCase().includes('pain'))) {
      recommendations.push({
        type: 'medication',
        title: 'Over-the-counter Pain Relief',
        description: 'Consider ibuprofen or acetaminophen (check for allergies)',
        priority: 'medium'
      });
    }

    // Test recommendations
    if (analysis.conditions.some((c: string) => c.toLowerCase().includes('infection'))) {
      recommendations.push({
        type: 'test',
        title: 'Blood Test',
        description: 'Complete blood count to check for infection markers',
        priority: 'medium'
      });
    }

    // Lifestyle recommendations
    recommendations.push({
      type: 'lifestyle',
      title: 'Rest and Hydration',
      description: 'Get adequate rest and maintain proper hydration',
      priority: 'low'
    });

    return recommendations;
  }

  // Fallback analysis for when AI is unavailable
  private getFallbackAnalysis(symptoms: string): Omit<AIAnalysis, 'hcsLogId'> {
    return {
      urgency: 5,
      conditions: ['General symptoms - professional evaluation recommended'],
      nextSteps: ['Consult with a healthcare professional', 'Monitor symptoms', 'Get adequate rest'],
      advice: 'I understand you\'re experiencing symptoms. While I cannot provide specific medical advice, I recommend consulting with a healthcare professional for proper evaluation. In the meantime, monitor your symptoms and seek immediate medical attention if they worsen.',
      recommendations: [
        {
          type: 'doctor',
          title: 'Primary Care Physician',
          description: 'Schedule appointment with your family doctor',
          priority: 'high'
        }
      ]
    };
  }

  // Verify consent before accessing patient data
  async verifyConsent(doctorDid: string, patientDid: string): Promise<boolean> {
    try {
      const { hasActiveConsent } = await import('./consentManager');
      return hasActiveConsent(doctorDid, patientDid, 'read_records');
    } catch (error) {
      console.error('Consent verification failed:', error);
      return false;
    }
  }

  // Emergency detection and response
  async detectEmergency(context: AIContext): Promise<{ isEmergency: boolean; severity: string; response: string }> {
    const emergencyKeywords = [
      'chest pain', 'heart attack', 'stroke', 'severe bleeding', 'unconscious',
      'difficulty breathing', 'severe allergic reaction', 'overdose', 'suicide'
    ];

    const symptoms = context.symptoms.toLowerCase();
    const isEmergency = emergencyKeywords.some(keyword => symptoms.includes(keyword));

    if (isEmergency) {
      return {
        isEmergency: true,
        severity: 'critical',
        response: 'This appears to be a medical emergency. Please call emergency services immediately (911) or go to the nearest emergency room.'
      };
    }

    return {
      isEmergency: false,
      severity: 'normal',
      response: 'No immediate emergency detected. Continue with normal care protocols.'
    };
  }
}

// Initialize and export the AI agent
export const hederaAI = new HederaAIAgent();

// Initialize on module load
if (typeof window !== 'undefined') {
  hederaAI.initializeAgent().catch(console.error);
}

// Enhanced AI analysis function for backward compatibility
export const analyzeSymptomsWithHedera = async (symptoms: string, patientDid?: string): Promise<AIAnalysis> => {
  const context: AIContext = {
    patientDid: patientDid || 'anonymous',
    symptoms,
  };

  return await hederaAI.analyzeSymptoms(context);
};

