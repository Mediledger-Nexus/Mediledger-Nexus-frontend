"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  FileText,
  Brain,
  Users,
  Calendar,
  Settings,
  Database,
  Coins,
  Activity,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Award,
  Lock,
  Eye
} from 'lucide-react';
import { usePrivacyEconomy } from '@/hooks/usePrivacyEconomy';
import { useAIDiagnostic } from '@/hooks/useAIDiagnostic';
import { toast } from 'sonner';
import { HealthVaultDashboard } from '@/components/vault/HealthVaultDashboard';
import { AIDiagnosticInterface } from '@/components/ai/AIDiagnosticInterface';
import { ConsentManager, ConsentManagementInterface } from '@/components/consent/ConsentManager';

interface PatientDashboardProps {
  patientDid: string;
  patientPrivateKey: string;
  onLogout?: () => void;
}

export function PatientDashboard({ patientDid, patientPrivateKey, onLogout }: PatientDashboardProps) {
  const {
    vault,
    healBalance,
    healRewards,
    isLoading: privacyLoading,
    getVaultStats,
    getTokenStats
  } = usePrivacyEconomy({ patientDid, patientPrivateKey });

  const vaultStats = getVaultStats();

  const {
    agents,
    selectedAgent,
    isAnalyzing,
    isInitialized: aiInitialized,
    chatMessageCount
  } = useAIDiagnostic({ patientDid, patientPrivateKey });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                MediLedger Nexus
              </h1>
              <p className="text-sm text-gray-400">Patient Dashboard</p>
            </div>

            <div className="flex items-center gap-4">
              <Badge className="bg-green-500 text-white">
                {vaultStats?.totalRecords || 0} Records
              </Badge>
              <Badge className="bg-yellow-500 text-white">
                {healBalance.toLocaleString()} HEAL
              </Badge>
              {onLogout && (
                <Button
                  variant="outline"
                  onClick={onLogout}
                  className="border-slate-600 text-gray-400 hover:bg-slate-700/50"
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Only Home Section */}
      <div className="p-6">
        <div className="space-y-6">
          {/* System Health Overview */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health Status
              </CardTitle>
              <CardDescription className="text-gray-400">
                Real-time status of all MediLedger Nexus systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Vault</p>
                    <p className="text-xs text-gray-400">Healthy</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-white">AI</p>
                    <p className="text-xs text-gray-400">Healthy</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Tokens</p>
                    <p className="text-xs text-gray-400">Healthy</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-white">FHIR</p>
                    <p className="text-xs text-gray-400">Healthy</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Consent</p>
                    <p className="text-xs text-gray-400">Healthy</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Health Records</p>
                    <p className="text-2xl font-bold text-white">{vaultStats?.totalRecords || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Coins className="h-6 w-6 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">HEAL Balance</p>
                    <p className="text-2xl font-bold text-white">{healBalance.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Brain className="h-6 w-6 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">AI Conversations</p>
                    <p className="text-2xl font-bold text-white">{chatMessageCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Award className="h-6 w-6 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Total Rewards</p>
                    <p className="text-2xl font-bold text-white">{getTokenStats()?.totalRewards || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <Coins className="h-5 w-5 text-yellow-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Earned HEAL Tokens</p>
                    <p className="text-xs text-gray-400">For sharing health data with consent</p>
                  </div>
                  <Badge className="bg-green-500">+25 HEAL</Badge>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <Brain className="h-5 w-5 text-purple-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">AI Diagnostic Analysis</p>
                    <p className="text-xs text-gray-400">Chest pain assessment completed</p>
                  </div>
                  <Badge className="bg-blue-500">Completed</Badge>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <Database className="h-5 w-5 text-cyan-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Health Record Stored</p>
                    <p className="text-xs text-gray-400">Vital signs encrypted in vault</p>
                  </div>
                  <Badge className="bg-green-500">Secured</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;
