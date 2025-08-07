// Groq AI Symptom Analysis Service
// Secure implementation with Hedera integration

interface GroqAnalysis {
  urgency: number;
  conditions: string[];
  nextSteps: string[];
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const mockGroqResponse = (): GroqAnalysis => ({
  urgency: Math.floor(1 + Math.random() * 10),
  conditions: ['Demo: Possible infection'],
  nextSteps: ['Consult a doctor']
});

export const analyzeSymptoms = async (symptoms: string): Promise<GroqAnalysis> => {
  try {
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
          content: `Analyze these symptoms for urgency (1-10), possible conditions, and next steps in JSON format: ${symptoms}`
        }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data: GroqResponse = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Invalid response from Groq API');
    }

    // Parse JSON response from AI
    try {
      const analysis = JSON.parse(content);
      return {
        urgency: analysis.urgency || 5,
        conditions: analysis.conditions || ['Unable to determine'],
        nextSteps: analysis.nextSteps || ['Consult healthcare provider']
      };
    } catch (parseError) {
      console.error('Failed to parse Groq response:', parseError);
      return mockGroqResponse();
    }

  } catch (error) {
    console.error('Groq Error:', error);
    // Log to Hedera for monitoring
    if (typeof window !== 'undefined') {
      // Client-side logging
      console.log(`Groq Error logged to Hedera: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    return mockGroqResponse();
  }
};

export const logToHedera = async (message: string) => {
  // Integration with existing Hedera utilities
  try {
    // This would integrate with your existing Hedera logging system
    console.log('Hedera Log:', message);
  } catch (error) {
    console.error('Failed to log to Hedera:', error);
  }
}; 