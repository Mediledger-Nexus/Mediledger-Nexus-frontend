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
  User,
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
  Eye,
  Menu,
  X
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

type NavigationItem = 'home' | 'records' | 'ai' | 'doctors' | 'appointments' | 'settings';

export function PatientDashboard({ patientDid, patientPrivateKey, onLogout }: PatientDashboardProps) {
  const [activeSection, setActiveSection] = useState<NavigationItem>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const navigationItems = [
    { id: 'home' as NavigationItem, label: 'Home', icon: Home },
    { id: 'records' as NavigationItem, label: 'My Records', icon: FileText },
    { id: 'ai' as NavigationItem, label: 'AI Assistant', icon: Brain },
    { id: 'doctors' as NavigationItem, label: 'Doctors & Hospitals', icon: Users },
    { id: 'appointments' as NavigationItem, label: 'Appointments', icon: Calendar },
    { id: 'settings' as NavigationItem, label: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
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
        );

      case 'records':
        return <HealthVaultDashboard patientDid={patientDid} patientPrivateKey={patientPrivateKey} />;

      case 'ai':
        return <AIDiagnosticInterface patientDid={patientDid} patientPrivateKey={patientPrivateKey} />;

      case 'doctors':
        return <ConsentManagementInterface patientDid={patientDid} patientPrivateKey={patientPrivateKey} />;

      case 'appointments':
        return (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointments
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your healthcare appointments and schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-700/30 p-6 rounded-lg text-center">
                <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  Schedule and manage your healthcare appointments
                </p>
                <Button className="bg-green-600 hover:bg-green-700">
                  Schedule Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'settings':
        return (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-700/30 p-6 rounded-lg text-center">
                <Settings className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  Configure your privacy settings, notifications, and preferences
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Open Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return <div>Home content</div>;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  MediLedger Nexus
                </h1>
                <p className="text-sm text-gray-400">Patient Dashboard</p>
              </div>
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

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700
          transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:transform-none lg:translate-x-0 transition-transform duration-300 ease-in-out
        `}>
          <div className="p-6">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">Patient Portal</p>
                  <p className="text-sm text-gray-400">{patientDid.slice(0, 10)}...</p>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      activeSection === item.id
                        ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-slate-800'
                    }`}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default PatientDashboard;
