"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bot,
  Send,
  Activity,
  Pill,
  MessageSquare,
  TrendingUp,
  FileText,
  Mic,
  AlertTriangle,
  Lightbulb,
  Shield,
  Heart,
  CheckCircle,
  Clock,
  Users,
  Zap,
  Stethoscope,
  BookOpen,
  Bell,
  Settings,
  Loader2
} from "lucide-react";
import { analyzeSymptoms } from "@/lib/groq";
import { SessionManager } from "@/lib/session";
import { getMedicalRecords } from "@/lib/recordManager";
import { getPatientConsents } from "@/lib/consentManager";

export default function AiAssistantPage() {
  const [session, setSession] = useState<any>(null);
  const [symptoms, setSymptoms] = useState("");
  const [symptomAnalysis, setSymptomAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: 'user'|'ai'; text: string; timestamp: string }[]>([
    { role: 'ai', text: 'Hi! I\'m Léa, your AI health companion. How can I help you today?', timestamp: new Date().toISOString() }
  ]);
  const [medication, setMedication] = useState({ name: "", dosage: "", frequency: "" });
  const [reminders, setReminders] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [emergencyKeywords, setEmergencyKeywords] = useState<string[]>([]);
  const [learningTips, setLearningTips] = useState<string[]>([]);
  const [consentSettings, setConsentSettings] = useState<any[]>([]);

  useEffect(() => {
    const userSession = SessionManager.getSession();
    if (userSession) {
      setSession(userSession);
      loadData(userSession);
    }
  }, []);

  const loadData = async (userSession: any) => {
    try {
      const patientRecords = await getMedicalRecords(userSession.did, userSession.did);
      setRecords(patientRecords);
      const consents = getPatientConsents(userSession.did);
      setConsentSettings(consents);

      // Mock data for demo
      setInsights([
        { type: 'risk', message: 'Your LDL cholesterol is slightly elevated. Consider increasing fiber intake.' },
        { type: 'trend', message: 'Blood pressure trending down - great job with your exercise routine!' }
      ]);
      setRecommendations([
        { type: 'doctor', message: 'Recommended: Dr. Smith (Cardiologist) based on your recent checkup.' },
        { type: 'wellness', message: 'Try 30 minutes of daily walking for better heart health.' }
      ]);
      setReminders([
        { id: 1, medication: 'Aspirin', time: '8:00 AM', taken: false },
        { id: 2, medication: 'Vitamin D', time: '2:00 PM', taken: true }
      ]);
      setEmergencyKeywords(['chest pain', 'severe headache', 'dizziness', 'shortness of breath']);
      setLearningTips([
        'Did you know? Regular exercise can reduce your risk of heart disease by up to 30%.',
        'Tip: Aim for 7-9 hours of sleep per night for optimal health.'
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSymptomAnalysis = async () => {
    if (!symptoms.trim()) return;

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeSymptoms(symptoms);
      setSymptomAnalysis(analysis);
    } catch (error) {
      console.error('Symptom analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const [userPreferences, setUserPreferences] = useState({
    tone: 'friendly',
    notifications: true,
    emergencyAlerts: true
  });
  const [emotionalTone, setEmotionalTone] = useState<'positive' | 'negative' | 'neutral'>('neutral');

  const handleChatSend = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage.trim();
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage, timestamp: new Date().toISOString() }]);
    setChatMessage("");

    // Check for emergency keywords
    const hasEmergency = emergencyKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));
    if (hasEmergency) {
      setChatHistory(prev => [...prev, {
        role: 'ai',
        text: '🚨 I detect potential urgency in your message. Should I alert your emergency contact or doctor? Please confirm if this is an emergency.',
        timestamp: new Date().toISOString()
      }]);
      return;
    }

    // Emotional intelligence: Detect tone
    const positiveWords = ['great', 'good', 'better', 'happy', 'excited', 'love', 'awesome'];
    const negativeWords = ['bad', 'sad', 'angry', 'frustrated', 'tired', 'pain', 'worried'];
    const lowerMessage = userMessage.toLowerCase();
    const hasPositive = positiveWords.some(word => lowerMessage.includes(word));
    const hasNegative = negativeWords.some(word => lowerMessage.includes(word));
    if (hasPositive && !hasNegative) {
      setEmotionalTone('positive');
    } else if (hasNegative && !hasPositive) {
      setEmotionalTone('negative');
    } else {
      setEmotionalTone('neutral');
    }

    // Use Groq for real AI response
    try {
      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
      if (!apiKey || apiKey === 'your-groq-api-key-here') {
        // Fallback to mock responses for demo
        const mockResponses = [
          'That\'s a great question! Based on your symptoms, I recommend consulting a healthcare provider.',
          'Remember to stay hydrated and get plenty of rest. If symptoms persist, see a doctor.',
          'Your health data shows positive trends. Keep up the good work!',
          'I\'m here to support you. What else can I help with today?',
          'For personalized advice, consider sharing more details about your health history.'
        ];
        const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        setChatHistory(prev => [...prev, { role: 'ai', text: randomResponse, timestamp: new Date().toISOString() }]);
        return;
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [{
            role: "system",
            content: `You are Léa, a caring AI health companion. Respond in a ${userPreferences.tone} tone. If the user seems ${emotionalTone === 'negative' ? 'upset or in pain' : 'positive'}, offer appropriate support. Keep responses concise, helpful, and empathetic.`
          }, {
            role: "user",
            content: userMessage
          }],
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content || 'I\'m here to help with your health questions.';
        setChatHistory(prev => [...prev, { role: 'ai', text: aiResponse, timestamp: new Date().toISOString() }]);
      } else {
        console.error('Groq API error:', response.status, response.statusText);
        setChatHistory(prev => [...prev, {
          role: 'ai',
          text: 'I\'m having trouble connecting to my AI services right now. Please try again later, or consult a healthcare provider for urgent matters.',
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Groq Error:', error);
      setChatHistory(prev => [...prev, {
        role: 'ai',
        text: 'I\'m having trouble connecting right now. Please try again, or consult a healthcare provider for urgent matters.',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleAddMedication = () => {
    if (medication.name && medication.dosage && medication.frequency) {
      setReminders(prev => [...prev, {
        id: Date.now(),
        medication: medication.name,
        time: medication.frequency,
        taken: false
      }]);
      setMedication({ name: "", dosage: "", frequency: "" });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent flex items-center">
            <Bot className="mr-3 h-10 w-10" />
            Léa - Your AI Health Companion
          </h1>
          <p className="text-gray-400 mt-2">Personalized health insights, reminders, and support powered by AI and blockchain privacy</p>
        </div>

        {/* Tabs for Features */}
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-slate-800/50">
            <TabsTrigger value="chat">Ask Anything</TabsTrigger>
            <TabsTrigger value="symptoms">Symptom Checker</TabsTrigger>
            <TabsTrigger value="insights">Health Insights</TabsTrigger>
            <TabsTrigger value="medications">Medication Tracker</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="documents">Document Summarizer</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Ask Anything Chat
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Natural conversation with Léa - ask about symptoms, health advice, or just chat
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-96 overflow-y-auto space-y-3 p-4 bg-slate-800/30 rounded-lg">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-lg px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-gray-300'}`}>
                        <p>{msg.text}</p>
                        <p className="text-xs opacity-70 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask me anything about your health..."
                    className="flex-1 bg-slate-800/50 border-slate-600 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                  />
                  <Button onClick={handleChatSend} className="bg-gradient-to-r from-purple-600 to-cyan-600">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Symptom Checker Tab */}
          <TabsContent value="symptoms" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Symptom Checker
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Describe your symptoms and get personalized analysis and next steps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe how you're feeling in detail..."
                  rows={4}
                  className="bg-slate-800/50 border-slate-600 text-white"
                />
                <Button
                  onClick={handleSymptomAnalysis}
                  disabled={isAnalyzing || !symptoms.trim()}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Symptoms...
                    </>
                  ) : (
                    <>
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Analyze Symptoms
                    </>
                  )}
                </Button>

                {symptomAnalysis && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className={`bg-${symptomAnalysis.urgency > 7 ? 'red' : symptomAnalysis.urgency > 4 ? 'orange' : 'green'}-500`}>
                          Urgency: {symptomAnalysis.urgency}/10
                        </Badge>
                        <span className="text-gray-400">Possible Conditions: {symptomAnalysis.conditions.join(', ')}</span>
                      </div>
                      <p className="text-gray-300">{symptomAnalysis.advice}</p>
                      <div className="space-y-1">
                        <p className="font-medium text-white">Next Steps:</p>
                        {symptomAnalysis.nextSteps.map((step: string, i: number) => (
                          <p key={i} className="text-sm text-gray-400">• {step}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Health Insights & Predictions
                </CardTitle>
                <CardDescription className="text-gray-400">
                  AI-powered analysis of your records and personalized predictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.map((insight, i) => (
                    <Card key={i} className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {insight.type === 'risk' ? <AlertTriangle className="h-5 w-5 text-orange-400" /> : <TrendingUp className="h-5 w-5 text-green-400" />}
                          <Badge className={insight.type === 'risk' ? 'bg-orange-500' : 'bg-green-500'}>
                            {insight.type}
                          </Badge>
                        </div>
                        <p className="text-gray-300">{insight.message}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medication Tracker Tab */}
          <TabsContent value="medications" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Pill className="h-5 w-5 mr-2" />
                  Medication Reminder & Tracker
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Track medications, set reminders, and check for interactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="Medication name"
                    value={medication.name}
                    onChange={(e) => setMedication({...medication, name: e.target.value})}
                    className="bg-slate-800/50 border-slate-600 text-white"
                  />
                  <Input
                    placeholder="Dosage"
                    value={medication.dosage}
                    onChange={(e) => setMedication({...medication, dosage: e.target.value})}
                    className="bg-slate-800/50 border-slate-600 text-white"
                  />
                  <Input
                    placeholder="Frequency (e.g., 8:00 AM)"
                    value={medication.frequency}
                    onChange={(e) => setMedication({...medication, frequency: e.target.value})}
                    className="bg-slate-800/50 border-slate-600 text-white"
                  />
                </div>
                <Button onClick={handleAddMedication} className="bg-green-600 hover:bg-green-700">
                  Add Medication
                </Button>

                <div className="space-y-2">
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Pill className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-white">{reminder.medication} - {reminder.time}</p>
                          <p className="text-sm text-gray-400">Status: {reminder.taken ? 'Taken' : 'Pending'}</p>
                        </div>
                      </div>
                      <Button size="sm" variant={reminder.taken ? "outline" : "default"}>
                        {reminder.taken ? 'Mark Missed' : 'Mark Taken'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Smart Recommendations
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Personalized suggestions for doctors, wellness, and health services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((rec, i) => (
                    <Card key={i} className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {rec.type === 'doctor' ? <Users className="h-5 w-5 text-blue-400" /> : <Heart className="h-5 w-5 text-green-400" />}
                          <Badge className={rec.type === 'doctor' ? 'bg-blue-500' : 'bg-green-500'}>
                            {rec.type}
                          </Badge>
                        </div>
                        <p className="text-gray-300">{rec.message}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Document Summarizer Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  AI-Powered Document Summarizer
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Upload and summarize lab reports, prescriptions, or medical documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="file"
                  accept=".pdf,.txt,.jpg,.png"
                  className="bg-slate-800/50 border-slate-600 text-white"
                />
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Summarize Document
                </Button>

                <div className="space-y-2">
                  {documents.map((doc, i) => (
                    <Card key={i} className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-4">
                        <p className="text-white font-medium">{doc.title}</p>
                        <p className="text-gray-400 text-sm">{doc.summary}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Additional Tabs for Other Features (Placeholders for now) */}
          <TabsContent value="voice" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Mic className="h-5 w-5 mr-2" />
                  Voice Assistant Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Voice mode is under development. Coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Emergency Quick Action
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-gray-400">Emergency detection active. Say urgent keywords in chat for alerts.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="learning" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Learning Companion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {learningTips.map((tip, i) => (
                  <Card key={i} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-5 w-5 text-yellow-400" />
                        <p className="text-white font-medium">Daily Health Tip</p>
                      </div>
                      <p className="text-gray-300">{tip}</p>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consent" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  AI Consent & Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {consentSettings.map((consent) => (
                    <div key={consent.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="text-white">{consent.doctorDid}</p>
                        <p className="text-sm text-gray-400">Status: {consent.status}</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-red-400 text-red-400">
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Personalization & Settings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Customize Léa's tone, notifications, and privacy preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-white">Conversation Tone</Label>
                  <Select value={userPreferences.tone} onValueChange={(value) => setUserPreferences({...userPreferences, tone: value})}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="playful">Playful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Medication Reminders</p>
                      <p className="text-sm text-gray-400">Receive daily reminders for medications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={userPreferences.notifications}
                      onChange={(e) => setUserPreferences({...userPreferences, notifications: e.target.checked})}
                      className="w-4 h-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Emergency Alerts</p>
                      <p className="text-sm text-gray-400">Enable automatic alerts for urgent keywords</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={userPreferences.emergencyAlerts}
                      onChange={(e) => setUserPreferences({...userPreferences, emergencyAlerts: e.target.checked})}
                      className="w-4 h-4"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-white font-medium">Emotional Tone Detection</p>
                  <p className="text-gray-400 text-sm mb-2">Current detected tone: <Badge className={`bg-${emotionalTone === 'positive' ? 'green' : emotionalTone === 'negative' ? 'red' : 'gray'}-500`}>{emotionalTone}</Badge></p>
                  <p className="text-gray-400 text-sm">Léa adapts responses based on your emotional state for better support.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
