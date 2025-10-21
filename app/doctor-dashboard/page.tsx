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
    if (!userSession || !SessionManager.isAuthenticated()) {
      router.push('/auth');
      return;
    }
    // Check if user has doctor-like credentials (walletId or did)
    if (!userSession.walletId && !userSession.did) {
      router.push('/dashboard');
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
