"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionManager } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";
import { PatientDashboard } from '@/components/dashboard/PatientDashboard';
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userSession = SessionManager.getSession();
    if (!userSession || !SessionManager.isAuthenticated()) {
      router.push('/auth');
      return;
    }
    // Enforce wallet connection before dashboard access
    if (!userSession.walletId) {
      router.push('/auth');
      return;
    }
    // Require DID before accessing dashboard
    if (!userSession.did) {
      router.push('/auth');
      return;
    }
    setSession(userSession);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    SessionManager.clearSession();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading MediLedger Nexus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              MediLedger Nexus Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Complete privacy-first healthcare ecosystem</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-slate-600 text-gray-400 hover:bg-slate-700/50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <PatientDashboard
          patientDid={session?.did || '0.0.123456'}
          patientPrivateKey={session?.privateKey || 'demo-private-key'}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
}
