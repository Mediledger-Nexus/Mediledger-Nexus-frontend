"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building2, ArrowRight, Stethoscope, Heart } from "lucide-react";

interface RoleSelectionProps {
  onRoleSelect: (role: 'patient' | 'organization' | 'doctor') => void;
}

export function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<'patient' | 'organization' | 'doctor' | null>(null);

  const handleRoleSelect = (role: 'patient' | 'organization' | 'doctor') => {
    setSelectedRole(role);
    setTimeout(() => onRoleSelect(role), 300); // Small delay for visual feedback
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
      
      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-6">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Welcome to MediLedger Nexus
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose your role to get started with secure, decentralized healthcare data management
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Patient Card */}
          <Card 
            className={`relative overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              selectedRole === 'patient' 
                ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500 scale-105' 
                : 'bg-slate-900/50 border-slate-700/50 hover:border-purple-500/50'
            } backdrop-blur-sm`}
            onClick={() => handleRoleSelect('patient')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white mb-2">I am a Patient</CardTitle>
              <CardDescription className="text-gray-300">
                Secure your medical records and manage your health data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">Secure medical record storage</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">Control data sharing permissions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">Guardian support for minors/elderly</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">Blockchain-verified authenticity</span>
                </div>
              </div>
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelect('patient');
                }}
              >
                Continue as Patient
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Healthcare Organization Card */}
          <Card 
            className={`relative overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              selectedRole === 'organization' 
                ? 'bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border-cyan-500 scale-105' 
                : 'bg-slate-900/50 border-slate-700/50 hover:border-cyan-500/50'
            } backdrop-blur-sm`}
            onClick={() => handleRoleSelect('organization')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white mb-2">I am a Healthcare Organization</CardTitle>
              <CardDescription className="text-gray-300">
                Manage patient data securely and streamline healthcare operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Hospital, Clinic, Pharmacy, Lab</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Secure patient data management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Interoperability with other orgs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Compliance & audit trails</span>
                </div>
              </div>
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelect('organization');
                }}
              >
                Continue as Organization
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Doctor Card */}
          <Card 
            className={`relative overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              selectedRole === 'doctor' 
                ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500 scale-105' 
                : 'bg-slate-900/50 border-slate-700/50 hover:border-green-500/50'
            } backdrop-blur-sm`}
            onClick={() => handleRoleSelect('doctor')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white mb-2">I am a Doctor</CardTitle>
              <CardDescription className="text-gray-300">
                Access patient records and provide secure healthcare services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Verified medical license</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Patient consent management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Secure record access</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Write prescriptions & notes</span>
                </div>
              </div>
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelect('doctor');
                }}
              >
                Continue as Doctor
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Secured by Hedera Hashgraph • HIPAA Compliant • Decentralized
          </p>
        </div>
      </div>
    </div>
  );
}
