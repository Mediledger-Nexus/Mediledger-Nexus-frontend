"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Coins,
  Brain,
  Globe,
  Lock,
  Zap,
  Users,
  TrendingUp,
  Database,
  Key,
  CheckCircle,
  ArrowRight,
  Info,
  Star,
  Award,
  Activity,
  Stethoscope
} from 'lucide-react';
import { HealthVaultDashboard } from '@/components/vault/HealthVaultDashboard';
import { HEALTokenDashboard } from '@/components/tokens/HEALTokenDashboard';
import { AIDiagnosticInterface } from '@/components/ai/AIDiagnosticInterface';

export default function PrivacyEconomyDemoPage() {
  const [userRole, setUserRole] = useState<'patient' | 'doctor'>('patient');
  const [userDid] = useState('0.0.123456');
  const [userPrivateKey] = useState('demo-private-key');

  const features = [
    {
      icon: <Shield className="h-8 w-8 text-cyan-400" />,
      title: "Zero-Knowledge Health Vaults",
      description: "Privacy-preserving encrypted storage with zero-knowledge proofs for complete data protection."
    },
    {
      icon: <Brain className="h-8 w-8 text-purple-400" />,
      title: "AI Diagnostic Co-Pilot",
      description: "Advanced medical AI powered by Groq AI with federated learning for collaborative diagnostics."
    },
    {
      icon: <Coins className="h-8 w-8 text-yellow-400" />,
      title: "HEAL Token Economy",
      description: "Earn tokens for sharing healthcare data while maintaining privacy through tokenized incentives."
    },
    {
      icon: <Lock className="h-8 w-8 text-green-400" />,
      title: "Encrypted Data Storage",
      description: "AES-256 encryption with patient-controlled keys ensuring only authorized access to health records."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-400" />,
      title: "Federated Learning",
      description: "Privacy-preserving collaborative AI training across healthcare providers without sharing raw data."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-orange-400" />,
      title: "Economic Participation",
      description: "Stake tokens to earn rewards and participate in governance of the healthcare data ecosystem."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            MediLedger Nexus: Complete Privacy Economy
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Experience the future of healthcare with zero-knowledge vaults, AI-powered diagnostics,
            and tokenized incentives - all working together seamlessly.
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800/50 rounded-lg p-1">
            <Button
              variant={userRole === 'patient' ? 'default' : 'ghost'}
              className={userRole === 'patient' ? 'bg-cyan-600' : ''}
              onClick={() => setUserRole('patient')}
            >
              Patient Experience
            </Button>
            <Button
              variant={userRole === 'doctor' ? 'default' : 'ghost'}
              className={userRole === 'doctor' ? 'bg-green-600' : ''}
              onClick={() => setUserRole('doctor')}
            >
              Healthcare Provider
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {feature.icon}
                  <CardTitle className="text-lg text-white">
                    {feature.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demo Interface */}
        <div className="bg-slate-800/30 rounded-xl p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Info className="h-6 w-6 text-cyan-400" />
            <h2 className="text-2xl font-semibold text-white">
              Complete Demo: {userRole === 'patient' ? 'Patient' : 'Healthcare Provider'} Interface
            </h2>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Badge variant="outline" className="text-cyan-400">
                Demo Mode
              </Badge>
              <span>
                Current User: <code className="bg-slate-800 px-2 py-1 rounded text-green-400">
                  {userDid}
                </code>
              </span>
            </div>
          </div>

          <Tabs defaultValue="vault" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="vault" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Health Vault
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Diagnostics
              </TabsTrigger>
              <TabsTrigger value="tokens" className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Token Economy
              </TabsTrigger>
              <TabsTrigger value="fhir" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                FHIR Integration
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vault" className="mt-6">
              <HealthVaultDashboard
                patientDid={userDid}
                patientPrivateKey={userPrivateKey}
              />
            </TabsContent>

            <TabsContent value="tokens" className="mt-6">
              <HEALTokenDashboard userDid={userDid} />
            </TabsContent>

            <TabsContent value="ai" className="mt-6">
              <AIDiagnosticInterface
                patientDid={userDid}
                patientPrivateKey={userPrivateKey}
                doctorDid={userRole === 'doctor' ? userDid : undefined}
              />
            </TabsContent>

            <TabsContent value="fhir" className="mt-6">
  {/* <FHIRIntegration
    patientDid={userDid}
    patientPrivateKey={userPrivateKey}
  /> */}
  <div className="text-gray-400 text-center p-6 border border-slate-700 rounded-lg">
    FHIR Integration component coming soon.
  </div>
</TabsContent>
          </Tabs>
        </div>

        {/* System Integration Flow */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="h-5 w-5" />
              Complete System Integration
            </CardTitle>
            <CardDescription>
              How all three systems work together seamlessly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Step 1: Store Data</h3>
                <p className="text-sm text-gray-400">
                  Patient stores encrypted health records in zero-knowledge vault with complete privacy protection
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Step 2: AI Analysis</h3>
                <p className="text-sm text-gray-400">
                  Healthcare provider requests AI diagnostic analysis with patient consent, earning HEAL tokens
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="h-8 w-8 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Step 3: Earn Rewards</h3>
                <p className="text-sm text-gray-400">
                  Patient earns HEAL tokens for data sharing, can stake tokens for additional rewards and governance
                </p>
              </div>
            </div>

            <div className="bg-slate-700/30 p-6 rounded-lg">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Key Integration Benefits
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">Privacy-preserving AI analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">Tokenized incentives for data sharing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">Federated learning for AI improvement</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">Emergency access protocols</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">Complete audit trails</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">Decentralized governance</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 p-4 rounded-lg border border-cyan-500/20">
              <h4 className="font-semibold text-white mb-2">🔐 Privacy Protection</h4>
              <p className="text-sm text-gray-400">
                All health data is encrypted with patient-controlled keys. Zero-knowledge proofs ensure
                data validity without revealing content. AI analysis happens with consent and complete audit trails.
              </p>
            </div>

            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 p-4 rounded-lg border border-yellow-500/20">
              <h4 className="font-semibold text-white mb-2">💰 Economic Sustainability</h4>
              <p className="text-sm text-gray-400">
                The HEAL token economy creates sustainable incentives for privacy-preserving data sharing.
                Patients earn tokens for responsible data stewardship while maintaining complete control.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-white mb-4">
            Experience the Complete MediLedger Nexus Ecosystem
          </h3>
          <p className="text-gray-400 mb-6 max-w-3xl mx-auto">
            This demo showcases the integration of zero-knowledge health vaults, AI-powered diagnostics,
            and tokenized incentives - creating a sustainable, privacy-first healthcare data ecosystem.
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700">
              <Stethoscope className="h-4 w-4 mr-2" />
              Start Using MediLedger Nexus
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
              View Technical Documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
