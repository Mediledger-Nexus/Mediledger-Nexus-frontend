"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionManager } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Wallet, Shield, Activity, LogOut } from "lucide-react";

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
          <p className="text-gray-400">Loading dashboard...</p>
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
              Welcome to MediLedger Nexus
            </h1>
            <p className="text-gray-400 mt-2">Your decentralized healthcare data platform</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-slate-600 text-gray-400 hover:bg-slate-700/50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* User Info Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <User className="mr-2 h-5 w-5 text-purple-400" />
                Account Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">Phone:</span> {session?.phoneNumber}</p>
                <p><span className="text-gray-400">User ID:</span> {session?.uid}</p>
                <p><span className="text-gray-400">Status:</span> 
                  <span className="text-green-400 ml-1">
                    {session?.isRegistered ? 'Registered' : 'Pending'}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Wallet className="mr-2 h-5 w-5 text-cyan-400" />
                Wallet Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">Wallet ID:</span> {session?.walletId || 'Not connected'}</p>
                <p><span className="text-gray-400">Network:</span> Hedera Testnet</p>
                <p><span className="text-gray-400">Status:</span> 
                  <span className="text-green-400 ml-1">Active</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Shield className="mr-2 h-5 w-5 text-green-400" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">2FA:</span> 
                  <span className="text-green-400 ml-1">Enabled (Phone)</span>
                </p>
                <p><span className="text-gray-400">Encryption:</span> 
                  <span className="text-green-400 ml-1">Active</span>
                </p>
                <p><span className="text-gray-400">Blockchain:</span> 
                  <span className="text-green-400 ml-1">Verified</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Activity className="mr-2 h-5 w-5 text-purple-400" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage your health data and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Upload Records
              </Button>
              <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
                View Records
              </Button>
              <Button variant="outline" className="border-green-400 text-green-400 hover:bg-green-400/10">
                Manage Access
              </Button>
              <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10">
                AI Insights
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Success Message */}
        <div className="mt-8 text-center">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-400 mb-2">
              🎉 Registration Complete!
            </h3>
            <p className="text-gray-300">
              Your MediLedger Nexus account has been successfully created and secured on the Hedera blockchain. 
              You now have full control over your healthcare data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
