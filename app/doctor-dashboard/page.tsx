"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionManager } from "@/lib/session";
import { DoctorDashboard } from "@/components/dashboard/DoctorDashboard";

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userSession = SessionManager.getSession();
    console.log('Doctor Dashboard - Session check:', userSession);
    console.log('Is authenticated:', SessionManager.isAuthenticated());

    if (!userSession || !SessionManager.isAuthenticated()) {
      console.log('Redirecting to auth - no valid session');
      router.push('/auth');
      return;
    }
    // Check if user has doctor-like credentials (walletId or did) AND is a doctor
    if (!userSession.walletId && !userSession.did) {
      console.log('Redirecting to dashboard - no walletId or did');
      router.push('/dashboard');
      return;
    }
    // Also check role for better security
    if (userSession.role && userSession.role !== 'doctor') {
      console.log('Redirecting to dashboard - not a doctor role:', userSession.role);
      router.push('/dashboard');
      return;
    }
    console.log('All checks passed, setting session');
    setSession(userSession);
    setLoading(false);
  }, [router]);

  // Temporary: Show dashboard even if session checks fail (for debugging)
  if (loading && !session) {
    const userSession = SessionManager.getSession();
    if (userSession?.role === 'doctor' || userSession?.walletId) {
      console.log('DEBUG: Bypassing loading check for debugging');
      return (
        <DoctorDashboard
          doctorDid={userSession?.did || userSession?.walletId || 'debug-did'}
          doctorPrivateKey="demo-key"
        />
      );
    }
  }

  const handleLogout = () => {
    SessionManager.clearSession();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading doctor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DoctorDashboard
      doctorDid={session?.did || session?.walletId || ''}
      doctorPrivateKey="demo-key" // In production, get from secure storage
    />
  );
}
