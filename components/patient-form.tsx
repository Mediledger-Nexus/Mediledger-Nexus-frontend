"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Brain, Activity, AlertTriangle, CheckCircle } from 'lucide-react'
import { analyzeSymptoms, logToHedera } from '@/lib/groq'
import { generateAITx } from '@/lib/hedera-utils'
import GroqSpinner from '@/components/ui/groq-spinner'

interface GroqAnalysis {
  urgency: number;
  conditions: string[];
  nextSteps: string[];
}

export function PatientForm() {
  const [symptoms, setSymptoms] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<GroqAnalysis | null>(null)
  const [txResult, setTxResult] = useState<any>(null)

  const handleAIAnalysis = async () => {
    if (!symptoms.trim()) {
      alert('Please enter symptoms first')
      return
    }

    setAnalyzing(true)
    try {
      // Get AI analysis
      const result = await analyzeSymptoms(symptoms)
      setAnalysis(result)
      
      // Log to Hedera
      await logToHedera(`AI Analysis: ${result.urgency}/10 urgency for symptoms: ${symptoms}`)
      
      // Generate Hedera transaction
      const tx = generateAITx(symptoms)
      setTxResult(tx)
      
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const getUrgencyColor = (urgency: number) => {
    if (urgency >= 8) return 'text-red-500'
    if (urgency >= 6) return 'text-orange-500'
    if (urgency >= 4) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getUrgencyIcon = (urgency: number) => {
    if (urgency >= 8) return <AlertTriangle className="w-5 h-5 text-red-500" />
    if (urgency >= 6) return <Activity className="w-5 h-5 text-orange-500" />
    if (urgency >= 4) return <Activity className="w-5 h-5 text-yellow-500" />
    return <CheckCircle className="w-5 h-5 text-green-500" />
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            AI-Powered Symptom Analysis
          </h1>
          <p className="text-gray-300">
            Describe your symptoms and get instant AI assessment powered by Groq
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="bg-white/5 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Brain className="w-5 h-5 text-[#00FF9D]" />
                Symptom Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Describe your symptoms
                </label>
                <Textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g., Headache, fever, fatigue for the past 2 days..."
                  className="min-h-[120px] bg-white/5 border-purple-500/30 text-white placeholder-gray-400"
                  rows={4}
                />
              </div>

              <Button
                onClick={handleAIAnalysis}
                disabled={analyzing || !symptoms.trim()}
                className={`w-full bg-gradient-to-r from-[#00FF9D] to-[#00CC7D] hover:from-[#00CC7D] hover:to-[#00AA6D] text-black font-semibold ${
                  analyzing ? 'opacity-50 cursor-wait' : ''
                }`}
              >
                {analyzing ? (
                  <GroqSpinner />
                ) : (
                  <span className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Get MediLedger Nexus AI Assessment
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card className="bg-white/5 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="w-5 h-5 text-[#00FF9D]" />
                MediLedger Nexus AI Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis ? (
                <>
                  {/* Urgency Level */}
                  <div className="flex items-center justify-between p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getUrgencyIcon(analysis.urgency)}
                      <div>
                        <p className="text-sm text-gray-400">Urgency Level</p>
                        <p className={`text-2xl font-bold ${getUrgencyColor(analysis.urgency)}`}>
                          {analysis.urgency}/10
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${
                        analysis.urgency >= 8 ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                        analysis.urgency >= 6 ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                        analysis.urgency >= 4 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                        'bg-green-500/20 text-green-300 border-green-500/30'
                      }`}
                    >
                      {analysis.urgency >= 8 ? 'Critical' :
                       analysis.urgency >= 6 ? 'High' :
                       analysis.urgency >= 4 ? 'Moderate' : 'Low'}
                    </Badge>
                  </div>

                  {/* Possible Conditions */}
                  <div>
                    <h4 className="font-semibold text-white mb-2">Possible Conditions</h4>
                    <div className="space-y-2">
                      {analysis.conditions.map((condition, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-300">
                          <div className="w-2 h-2 bg-[#00FF9D] rounded-full" />
                          {condition}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div>
                    <h4 className="font-semibold text-white mb-2">Recommended Next Steps</h4>
                    <div className="space-y-2">
                      {analysis.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-300">
                          <CheckCircle className="w-4 h-4 text-[#00FF9D]" />
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Transaction Info */}
                  {txResult && (
                    <Alert className="bg-green-900/20 border-green-500/30">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <AlertDescription className="text-green-300">
                        Analysis logged to Hedera blockchain. Transaction ID: {txResult.txId}
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">
                    Enter your symptoms and click "Get MediLedger Nexus AI Assessment" to receive analysis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
} 