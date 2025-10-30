"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionManager } from "@/lib/session";
import { computeDid } from "@/lib/did";
import { DoctorDashboard } from "@/components/dashboard/DoctorDashboard";

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('🔍 Doctor Dashboard - Starting session check...');
        const userSession = SessionManager.getSession();
        console.log('📄 Doctor Dashboard - Raw session from storage:', userSession);

        if (userSession) {
          console.log('✅ Doctor Dashboard - Session exists, walletId:', userSession.walletId);
          console.log('✅ Doctor Dashboard - Session DID:', userSession.did);
          console.log('✅ Doctor Dashboard - Session role:', userSession.role);
        } else {
          console.log('❌ Doctor Dashboard - No session found in storage');
        }

        console.log('🔐 Doctor Dashboard - Is authenticated:', SessionManager.isAuthenticated());

        if (!userSession || !SessionManager.isAuthenticated()) {
          console.log('❌ Doctor Dashboard - No valid session, redirecting to auth');
          router.push('/auth');
          return;
        }

        // Check if user has doctor-like credentials (walletId or did) AND is a doctor
        if (!userSession.walletId && !userSession.did) {
          console.log('❌ Doctor Dashboard - No walletId or did, redirecting to general dashboard');
          router.push('/dashboard');
          return;
        }

        // Also check role for better security
        if (userSession.role && userSession.role !== 'doctor') {
          console.log('❌ Doctor Dashboard - Not a doctor role:', userSession.role, ', redirecting');
          router.push('/dashboard');
          return;
        }

        console.log('✅ Doctor Dashboard - All checks passed, setting session');
        setSession(userSession);
        setLoading(false);
      } catch (error) {
        console.error('❌ Doctor Dashboard - Error in session check:', error);
        router.push('/auth');
      }
    };

    checkSession();
  }, [router]);

  // Development fallback: If no session after loading, show a helpful message
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Dashboard still loading after timeout - this might indicate a session issue');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [loading]);

  const handleLogout = () => {
    SessionManager.clearSession();
    router.push('/login/connect');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400 mb-2">Loading doctor dashboard...</p>
          <p className="text-sm text-gray-500">Checking authentication and permissions...</p>
          {/* Development helper */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-slate-800 rounded text-xs text-left">
              <p className="text-cyan-400 mb-1">Debug Info:</p>
              <p>Session: {session ? 'Found' : 'None'}</p>
              <p>Loading: {loading ? 'True' : 'False'}</p>
              <p>Check console for detailed logs</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  console.log('🚀 Doctor Dashboard Page - Rendering DoctorDashboard with:');
  console.log('🚀 Doctor Dashboard Page - session?.did:', session?.did);
  console.log('🚀 Doctor Dashboard Page - session?.walletId:', session?.walletId);
  console.log('🚀 Doctor Dashboard Page - doctorDid prop:', session?.did || session?.walletId || '');

  const effectiveWalletId = session?.walletId || '';
  const effectiveNetwork = (session?.network || process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'mainnet').toLowerCase();
  const derivedDid = effectiveWalletId ? computeDid(effectiveWalletId, effectiveNetwork) : '';

  return (
    <DoctorDashboard
      doctorDid={derivedDid || ''}
      doctorPrivateKey=""
      onLogout={handleLogout}
    />
  );
}
