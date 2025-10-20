"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionManager } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Shield, Users, Settings, LogOut, Wallet } from "lucide-react";

export default function OrganizationDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userSession = SessionManager.getSession();
    if (!userSession || !SessionManager.isAuthenticated()) {
      router.push('/auth');
      return;
    }
    // Route protection: only organizations can access this page
    if (userSession.role !== 'organization') {
      // Send doctors to doctor dashboard, patients to general dashboard
      if (userSession.role === 'doctor') router.push('/doctor');
      else router.push('/dashboard');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading organization dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-black to-blue-900/20" />

      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Organization Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Manage your organization, members, and data access</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-slate-600 text-gray-400 hover:bg-slate-700/50">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Building2 className="mr-2 h-5 w-5 text-cyan-400" />
                Organization Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white ml-1">{session?.profile?.organizationName || 'Your Organization'}</span>
                </p>
                <p>
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white ml-1">{session?.profile?.organizationType || 'Healthcare Provider'}</span>
                </p>
                <p>
                  <span className="text-gray-400">Admin:</span>
                  <span className="text-white ml-1">{session?.profile?.adminEmail || 'admin@org.org'}</span>
                </p>
                <p>
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400 ml-1">Verified</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Shield className="mr-2 h-5 w-5 text-purple-400" />
                DID & Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Organization DID:</p>
                  <div className="flex items-center gap-2 bg-slate-800/50 rounded px-3 py-2">
                    <code className="text-purple-300 text-sm font-mono break-all">{session?.did || 'Not generated'}</code>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Wallet ID:</p>
                  <div className="flex items-center gap-2 bg-slate-800/50 rounded px-3 py-2">
                    <code className="text-cyan-300 text-sm font-mono break-all">{session?.walletId || 'Not connected'}</code>
                    {session?.walletId && (
                      <button
                        onClick={() => navigator.clipboard.writeText(session.walletId)}
                        className="text-gray-400 hover:text-white ml-2"
                        title="Copy Wallet ID"
                      >
                        <Wallet className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p>
                  <span className="text-gray-400">Network:</span>
                  <span className="text-white ml-1">{process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'mainnet'}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Users className="mr-2 h-5 w-5 text-green-400" />
                Members & Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">Total Members:</span> <span className="text-white">{session?.profile?.memberCount || 12}</span></p>
                <p><span className="text-gray-400">Active Consents:</span> <span className="text-green-400">8</span></p>
                <p><span className="text-gray-400">Pending Requests:</span> <span className="text-yellow-400">3</span></p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Organization Actions</CardTitle>
            <CardDescription className="text-gray-400">
              Manage providers, data sharing, and organization settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                Invite Member
              </Button>
              <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400/10" onClick={() => router.push('/dashboard/consent')}>
                Manage Consents
              </Button>
              <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700/50" onClick={() => router.push('/dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
