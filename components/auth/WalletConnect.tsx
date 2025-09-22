"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Smartphone, Plus, ArrowRight, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { HederaLogger } from "@/lib/hedera";
import { LedgerId } from "@hashgraph/sdk";
// Import HashConnect only on client to avoid SSR issues
let HashConnect: any = null;

interface WalletConnectProps {
  onSuccess: (walletData: { accountId: string; type: 'hashpack' | 'custodial' }) => void;
  onError: (error: string) => void;
}

export function WalletConnect({ onSuccess, onError }: WalletConnectProps) {
  const [step, setStep] = useState<'choice' | 'hashpack' | 'custodial'>('choice');
  const [loading, setLoading] = useState(false);
  const [hcReady, setHcReady] = useState(false);
  const [pairingStringState, setPairingStringState] = useState<string>("");
  // no refs needed; keep state minimal for reliability

  useEffect(() => {
    // Dynamically import hashconnect on client
    const loadHashConnect = async () => {
      try {
        if (typeof window === 'undefined') return;
        const mod = await import("hashconnect");
        HashConnect = (mod as any).HashConnect || (mod as any).default || mod;
        setHcReady(!!HashConnect);
      } catch (e) {
        console.error("Failed to load HashConnect library:", e);
        onError("Failed to load HashConnect. Please refresh and try again.");
      }
    };
    loadHashConnect();
  }, [onError]);

  const connectHashPack = async () => {
    setStep('hashpack');
    setLoading(true);
    try {
      // Ensure HashConnect is available; try lazy import once more
      if (!HashConnect) {
        if (typeof window !== 'undefined') {
          const mod = await import("hashconnect");
          HashConnect = (mod as any).HashConnect || (mod as any).default || mod;
          setHcReady(!!HashConnect);
        }
      }
      if (!HashConnect) throw new Error("HashConnect not loaded");

      // HashConnect v3 requires a project ID
      const projectId = process.env.NEXT_PUBLIC_HASHCONNECT_PROJECT_ID;
      if (!projectId) {
        onError('Missing NEXT_PUBLIC_HASHCONNECT_PROJECT_ID. Please add it to your .env and reload.');
        setLoading(false);
        return;
      }

      // App metadata for v3
      const origin = (typeof window !== 'undefined' && (window.location?.origin || '')) || 'http://localhost';
      const appMetadata = {
        name: 'MediLedger Nexus',
        description: 'Decentralized Healthcare Data Platform',
        icons: [origin + '/mediledger-logo.jpeg'],
        url: origin,
      };

      // Initialize HashConnect v3: new HashConnect(ledger, projectId, metadata, debug)
      const hashconnect: any = new HashConnect(LedgerId.TESTNET, projectId, appMetadata, true);

      // Register pairing event before init
      hashconnect.pairingEvent.on((pairingData: any) => {
        try {
          const accounts: string[] = pairingData?.accountIds || pairingData?.metadata?.accountIds || [];
          if (accounts.length > 0) {
            onSuccess({ accountId: accounts[0], type: 'hashpack' });
          } else {
            onError('No accounts returned from HashPack');
          }
        } catch (e: any) {
          console.error('Error handling pairing data:', e);
          onError(e?.message || 'Failed to parse HashPack pairing data');
        } finally {
          setLoading(false);
        }
      });

      if ((hashconnect as any).disconnectionEvent) {
        (hashconnect as any).disconnectionEvent.on(() => {
          setLoading(false);
          onError('HashPack connection was closed');
        });
      }

      // Init and open pairing modal (v3)
      await hashconnect.init();
      hashconnect.openPairingModal({ themeMode: 'dark' });

      // Listen for pairing
      // (Already registered above)

      // Also handle rejection/close events if available
      if ((hashconnect as any).disconnectionEvent) {
        (hashconnect as any).disconnectionEvent.on(() => {
          setLoading(false);
          onError('HashPack connection was closed');
        });
      }
    } catch (error: any) {
      console.error('Error connecting to HashPack:', error);
      onError(error?.message || 'Failed to connect to HashPack wallet');
      setLoading(false);
    }
  };

  const createCustodialWallet = async () => {
    setLoading(true);
    setStep('custodial');

    try {
      const walletData = await HederaLogger.createCustodialWallet();
      
      // Store wallet data securely (MVP: localStorage)
      if (typeof window !== 'undefined') {
        localStorage.setItem('mediledger_custodial_wallet', JSON.stringify({
          accountId: walletData.accountId,
          privateKey: walletData.privateKey,
          type: 'custodial'
        }));
      }

      onSuccess({
        accountId: walletData.accountId,
        type: 'custodial'
      });
    } catch (error: any) {
      console.error('Error creating custodial wallet:', error);
      onError(error.message || 'Failed to create custodial wallet');
    } finally {
      setLoading(false);
    }
  };

  const renderHashPackDemo = () => {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="w-48 h-48 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
          <div className="text-white text-center p-4">
            <Smartphone className="h-12 w-12 mx-auto mb-2" />
            <p className="text-sm">Open HashPack extension or app to approve</p>
          </div>
        </div>
        <p className="text-sm text-gray-400 text-center">
          Waiting for approval in HashPack...
        </p>
      </div>
    );
  };

  if (step === 'choice') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
        
        <Card className="w-full max-w-2xl relative z-10 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Connect Your Wallet
            </CardTitle>
            <CardDescription className="text-gray-400">
              Choose how you'd like to manage your Hedera account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4">
              {/* HashPack Option */}
              <Card className="bg-slate-800/30 border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Smartphone className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                        Connect HashPack Wallet
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Use your existing HashPack wallet for full control over your keys and transactions.
                      </p>
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span>Full custody of your keys</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span>Mobile app integration</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span>Advanced security features</span>
                        </div>
                      </div>
                      <Button
                        onClick={connectHashPack}
                        disabled={loading || !hcReady}
                        className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                      >
                        {hcReady ? 'Connect HashPack' : 'Loading HashConnect...'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Custodial Option */}
              <Card className="bg-slate-800/30 border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                        Create New Wallet
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        We'll create a secure custodial wallet for you on the Hedera network.
                      </p>
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span>Instant setup</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span>No app required</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-3 w-3 text-yellow-400" />
                          <span>Keys managed by MediLedger</span>
                        </div>
                      </div>
                      <Button
                        onClick={createCustodialWallet}
                        disabled={loading}
                        className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        Create New Wallet
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'hashpack') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
        
        <Card className="w-full max-w-md relative z-10 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Connect HashPack
            </CardTitle>
            <CardDescription className="text-gray-400">
              Approve the pairing request in your HashPack wallet
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                <p className="text-gray-400">Connecting to HashPack...</p>
              </div>
            ) : (
              <>
                {renderHashPackDemo()}
                {/* Pairing string helper for manual approval (QR/deeplink) */}
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-3 text-xs text-gray-400 break-all">
                  <div className="text-gray-300 font-semibold mb-1">Pairing String</div>
                  {pairingStringState ? (
                    <>
                      <div className="select-all break-all">{pairingStringState}</div>
                      <div className="mt-2 text-[11px] text-gray-500">If the popup did not appear, open HashPack and use the DApp pairing option, then paste this pairing string.</div>
                    </>
                  ) : (
                    <div>Generating pairing string...</div>
                  )}
                </div>
                <div className="text-center space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://www.hashpack.app/', '_blank')}
                    className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                  >
                    Open HashPack Website
                  </Button>
                </div>
              </>
            )}

            <Button
              variant="outline"
              onClick={() => setStep('choice')}
              className="w-full border-slate-600 text-gray-400 hover:bg-slate-700/50"
            >
              Back to Options
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'custodial') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
        
        <Card className="w-full max-w-md relative z-10 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4">
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              ) : (
                <Plus className="h-8 w-8 text-white" />
              )}
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Creating Your Wallet
            </CardTitle>
            <CardDescription className="text-gray-400">
              {loading ? 'Setting up your secure Hedera wallet...' : 'Wallet created successfully!'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="space-y-2 text-center">
                  <p className="text-sm text-gray-400">This may take a few moments</p>
                  <div className="flex justify-center space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
                <p className="text-green-400 font-semibold">Wallet Created Successfully!</p>
                <p className="text-sm text-gray-400">
                  Your custodial wallet has been created and secured.
                </p>
              </div>
            )}

            {!loading && (
              <Button
                variant="outline"
                onClick={() => setStep('choice')}
                className="w-full border-slate-600 text-gray-400 hover:bg-slate-700/50"
              >
                Back to Options
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
