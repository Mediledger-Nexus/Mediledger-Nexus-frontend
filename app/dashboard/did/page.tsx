"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionManager } from "@/lib/session";
import { getDIDDocument, exportDIDDocument, getDIDStats } from "@/lib/didRegistry";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Key, Shield, User, Copy, Download, Eye } from "lucide-react";

export default function DIDPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [didDocument, setDidDocument] = useState<any>(null);
  const [exportedDID, setExportedDID] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const userSession = SessionManager.getSession();
    if (!userSession || !SessionManager.isAuthenticated()) {
      router.push('/auth');
      return;
    }
    
    setSession(userSession);
    loadDIDData(userSession);
    setLoading(false);
  }, [router]);

  const loadDIDData = (userSession: any) => {
    if (userSession.did) {
      const doc = getDIDDocument(userSession.did);
      setDidDocument(doc);
      
      if (doc) {
        const exported = exportDIDDocument(doc.id);
        setExportedDID(exported);
      }
    }
    
    const didStats = getDIDStats();
    setStats(didStats);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading DID information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="border-slate-600 text-gray-400 hover:bg-slate-700/50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent flex items-center">
                <Key className="mr-3 h-8 w-8" />
                Decentralized Identity
              </h1>
              <p className="text-gray-400 mt-2">Your unique digital identity on Hedera</p>
            </div>
          </div>
        </div>

        {didDocument ? (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-slate-900/50 border-slate-700/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="document">DID Document</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* DID Information */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Shield className="mr-2 h-5 w-5 text-purple-400" />
                    Your DID Information
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Your unique decentralized identifier
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-400">Decentralized Identifier (DID)</label>
                      <div className="flex items-center gap-2 mt-1 bg-slate-800/50 rounded px-3 py-2">
                        <code className="text-purple-300 text-sm font-mono break-all flex-1">
                          {didDocument.id}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(didDocument.id)}
                          className="border-slate-600 text-gray-300"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Role</label>
                        <div className="mt-1">
                          <Badge 
                            variant="outline" 
                            className={`border-${
                              didDocument.role === 'patient' ? 'purple' :
                              didDocument.role === 'doctor' ? 'green' : 'cyan'
                            }-400 text-${
                              didDocument.role === 'patient' ? 'purple' :
                              didDocument.role === 'doctor' ? 'green' : 'cyan'
                            }-400`}
                          >
                            {didDocument.role === 'patient' ? 'Patient' :
                             didDocument.role === 'doctor' ? 'Doctor' : 'Organization'}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-400">Network</label>
                        <p className="text-white mt-1 capitalize">{didDocument.network}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-400">Status</label>
                        <div className="mt-1">
                          <Badge 
                            variant="outline" 
                            className={`border-${
                              didDocument.status === 'active' ? 'green' : 'red'
                            }-400 text-${
                              didDocument.status === 'active' ? 'green' : 'red'
                            }-400`}
                          >
                            {didDocument.status === 'active' ? 'Active' : 'Suspended'}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-400">Created</label>
                        <p className="text-white mt-1">
                          {new Date(didDocument.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-400">Profile Information</label>
                      <div className="mt-2 bg-slate-800/30 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(didDocument.profile || {}).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-gray-400 text-sm capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <p className="text-white">{String(value)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* DID Statistics */}
              {stats && (
                <Card className="bg-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Network Statistics</CardTitle>
                    <CardDescription className="text-gray-400">
                      MediLedger Nexus DID Registry
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-400">{stats.total}</p>
                        <p className="text-gray-400 text-sm">Total DIDs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">{stats.active}</p>
                        <p className="text-gray-400 text-sm">Active</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-400">{stats.byRole[didDocument.role] || 0}</p>
                        <p className="text-gray-400 text-sm">Same Role</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-cyan-400">{stats.byNetwork[didDocument.network] || 0}</p>
                        <p className="text-gray-400 text-sm">Same Network</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="document" className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Eye className="mr-2 h-5 w-5 text-cyan-400" />
                    DID Document
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Standard W3C DID Document format
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-400 text-sm">
                        This is your DID document in the standard W3C format
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(JSON.stringify(exportedDID, null, 2))}
                          className="border-slate-600 text-gray-300"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy JSON
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(exportedDID, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${didDocument.id.replace(/:/g, '-')}.json`;
                            a.click();
                          }}
                          className="border-slate-600 text-gray-300"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                    
                    <pre className="bg-slate-800/50 rounded-lg p-4 overflow-x-auto text-sm">
                      <code className="text-gray-300">
                        {JSON.stringify(exportedDID, null, 2)}
                      </code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="verification" className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Shield className="mr-2 h-5 w-5 text-green-400" />
                    Verification Status
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Your DID verification and security status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <Shield className="h-6 w-6 text-green-400" />
                          <div>
                            <h4 className="text-green-400 font-semibold">DID Verified</h4>
                            <p className="text-gray-300 text-sm">Your DID is properly registered and verified</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <Key className="h-6 w-6 text-blue-400" />
                          <div>
                            <h4 className="text-blue-400 font-semibold">Wallet Connected</h4>
                            <p className="text-gray-300 text-sm">Your Hedera wallet is securely connected</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-semibold">Security Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-gray-300">Immutable identity on Hedera</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-gray-300">Cryptographic key ownership</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-gray-300">HCS audit logging</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-gray-300">Role-based permissions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="text-center py-12">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No DID Found</h3>
              <p className="text-gray-400 mb-4">
                Your DID hasn't been created yet. Please complete the registration process.
              </p>
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Complete Registration
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


