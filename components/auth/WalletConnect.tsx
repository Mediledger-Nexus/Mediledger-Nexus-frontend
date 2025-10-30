"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Smartphone, Plus, ArrowRight, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { HederaLogger } from "@/lib/hedera";
import { createDID } from "@/lib/didRegistry";
import { LedgerId } from "@hashgraph/sdk";
// Import HashConnect only on client to avoid SSR issues
let HashConnect: any = null;



interface WalletConnectProps {
  onSuccess: (walletData: { accountId: string; publicKey: string; type: 'hashpack' | 'custodial' }) => void;
  onError: (error: string) => void;
}

export function WalletConnect({ onSuccess, onError }: WalletConnectProps) {
  const [step, setStep] = useState<'choice' | 'hashpack' | 'custodial'>('choice');
  const [loading, setLoading] = useState(false);
  const [hcReady, setHcReady] = useState(false);
  const [pairingStringState, setPairingStringState] = useState<string>("");
  const hashconnectRef = useRef<any>(null);
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

    // Catch unhandled promise rejections originating from HashConnect internals
    const handleUnhandled = (event: PromiseRejectionEvent) => {
      try {
        const reason: any = event?.reason;
        const message = typeof reason === 'string' ? reason : reason?.message || '';
        if (message && (
          message.includes('pairing') ||
          message.includes('Record was recently deleted') ||
          message.includes('No matching key') ||
          message.toLowerCase().includes('proposal')
        )) {
          event.preventDefault?.();
          console.warn('Intercepted HashConnect pairing error:', message);
          setLoading(false);
          setStep('choice');
          onError('HashPack pairing issue detected. In HashPack → DApp Connections, remove this site, ensure the same network is selected, then reconnect.');
        }
      } catch {}
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', handleUnhandled);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('unhandledrejection', handleUnhandled);
      }
    };
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

      // Resolve Hedera network from env (default: mainnet)
      const envNet = (process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'mainnet').toLowerCase();
      const ledger = envNet === 'testnet' ? LedgerId.TESTNET : envNet === 'previewnet' ? LedgerId.PREVIEWNET : LedgerId.MAINNET;

      // App metadata for v3
      const origin = (typeof window !== 'undefined' && (window.location?.origin || '')) || 'http://localhost';
      const appMetadata = {
        name: 'MediLedger Nexus',
        description: 'Decentralized Healthcare Data Platform',
        icons: [origin + '/mediledger-logo.jpeg'],
        url: origin,
      };

      // Initialize HashConnect v3: new HashConnect(ledger, projectId, metadata, debug)
      const hashconnect: any = new HashConnect(ledger, projectId, appMetadata, true);
      hashconnectRef.current = hashconnect;
      try {
        (hashconnect as any).clearConnections?.();
        (hashconnect as any).disconnect?.();
      } catch {}

      // Register pairing event before init
      hashconnect.pairingEvent.on(async (pairingData: any) => {
        try {
          console.log('🔗 WalletConnect - Pairing event received:', pairingData);

          const accounts: string[] = pairingData?.accountIds || pairingData?.metadata?.accountIds || [];
          console.log('🔗 WalletConnect - Extracted accounts:', accounts);

          if (accounts.length > 0) {
            const accountId = String(accounts[0] || '').trim();
            const accountFormatOk = /^0\.0\.\d+$/.test(accountId);
            const pairedNet = (pairingData?.network || pairingData?.metadata?.network || '').toLowerCase();
            const envNet = (process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'mainnet').toLowerCase();
            if (!accountFormatOk) {
              throw new Error('Invalid account format from HashPack');
            }
            if (pairedNet && envNet && pairedNet !== envNet) {
              throw new Error(`Network mismatch: wallet=${pairedNet}, app=${envNet}`);
            }
            // Extract public key from pairing data (HashConnect provides this)
            const publicKey = pairingData?.metadata?.publicKey ||
                             pairingData?.publicKey ||
                             pairingData?.accountPublicKey ||
                             'demo-public-key'; // Fallback for demo

            console.log('🔗 WalletConnect - Extracted public key:', publicKey);
            console.log('🔗 WalletConnect - Using account ID:', accountId);

            // Generate DID from account ID
            const did = `did:hedera:${envNet}:${accountId}`;
            console.log('🔗 WalletConnect - Generated DID:', did);

            // Register DID on Hedera
            try {
              console.log('🔗 WalletConnect - Registering DID on Hedera...');
              const transactionId = await HederaLogger.logDIDRegistration({
                did,
                accountId,
                publicKey,
                network: envNet,
                timestamp: new Date().toISOString(),
              });

              console.log('🔗 WalletConnect - DID registered with transaction ID:', transactionId);

              // Create DID document in registry
              await createDID(accountId, publicKey, 'patient', {
                walletId: accountId,
                connectedAt: new Date().toISOString(),
              }, envNet);

              console.log('🔗 WalletConnect - DID document created in registry');

              // Show success message with HashScan link
              const hashScanUrl = `https://hashscan.io/${envNet}/transaction/${transactionId}`;
              console.log('🔗 WalletConnect - HashScan URL:', hashScanUrl);

              // Store transaction info for display
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('didRegistrationTx', JSON.stringify({
                  transactionId,
                  hashScanUrl,
                  did,
                  accountId,
                }));
              }
            } catch (didError: any) {
              console.warn('⚠️ WalletConnect - DID registration failed, but continuing with wallet connection:', didError);
              // Continue with wallet connection even if DID registration fails
            }

            onSuccess({
              accountId,
              publicKey: publicKey,
              type: 'hashpack',
              did,
            } as any);
          } else {
            console.error('❌ WalletConnect - No accounts returned from HashPack');
            onError('No accounts returned from HashPack');
          }
        } catch (e: any) {
          console.error('❌ WalletConnect - Error handling pairing data:', e);
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
      try {
        await hashconnect.init();
      } catch (e: any) {
        // Handle stale/invalid pairing state
        console.warn('HashConnect.init error (possibly stale pairing):', e?.message || e);
        try { (hashconnect as any).disconnect?.(); } catch {}
        setLoading(false);
        setStep('choice');
        onError('Wallet pairing invalid. In HashPack, remove this site under DApp Connections, then reconnect.');
        return;
      }
      // After init, try to surface a pairing string ASAP as a fallback UI
      try {
        const ps = (hashconnect as any).pairingString ||
          (typeof (hashconnect as any).getPairingString === 'function' ? (hashconnect as any).getPairingString() : undefined);
        if (ps) setPairingStringState(ps);
      } catch {}

      // Some versions/themes of the modal expect a full theme config. Call without options to avoid theme errors.
      try {
        hashconnect.openPairingModal();
      } catch (e: any) {
        console.error('HashConnect pairing modal error:', e);
        onError('Failed to open HashPack pairing modal. Use the pairing string below in HashPack → DApp pairing.');
      }

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

  const resetPairing = () => {
    try {
      // Best-effort: if the instance offers a disconnect, try it
      const hc: any = hashconnectRef.current;
      if (hc && typeof hc.disconnect === 'function') {
        hc.disconnect();
      }
    } catch {}
    // Advise the user to remove existing DApp connection in HashPack, then reload
    if (typeof window !== 'undefined') {
      alert('Tip: In HashPack, open DApp Connections and remove the pairing for this site. The page will now reload.');
      window.location.reload();
    }
  };

  // Start HashPack Auth (OAuth-style) to let users create a non-custodial wallet with email
  const startHashPackAuth = async () => {
    try {
      const authBase = process.env.NEXT_PUBLIC_HASHPACK_AUTH_BASE || 'https://auth.hashpack.app';
      const clientId = process.env.NEXT_PUBLIC_HASHPACK_AUTH_CLIENT_ID || process.env.NEXT_PUBLIC_HASHCONNECT_PROJECT_ID;
      if (!clientId) {
        onError('Missing NEXT_PUBLIC_HASHPACK_AUTH_CLIENT_ID (or NEXT_PUBLIC_HASHCONNECT_PROJECT_ID).');
        return;
      }
      const envNet = (process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'mainnet').toLowerCase();
      const origin = (typeof window !== 'undefined' && (window.location?.origin || '')) || 'http://localhost:3000';
      const redirectUri = `${origin}/auth/callback`;
      const url = `${authBase}/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&network=${encodeURIComponent(envNet)}&response_type=code&scope=${encodeURIComponent('openid wallet')}`;
      if (typeof window !== 'undefined') {
        window.location.href = url;
      }
    } catch (e: any) {
      console.error('Failed to start HashPack Auth:', e);
      onError(e?.message || 'Failed to start HashPack Auth');
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
                      <div className="flex flex-col space-y-2">
                        <Button
                          onClick={connectHashPack}
                          disabled={loading || !hcReady}
                          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                        >
                          {hcReady ? 'Connect HashPack' : 'Loading HashConnect...'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span>
                            Network: {(process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'mainnet').toLowerCase()}
                          </span>
                          <span>
                            Project ID: {process.env.NEXT_PUBLIC_HASHCONNECT_PROJECT_ID ? 'set' : 'missing'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={resetPairing} className="border-slate-600 text-gray-300 hover:bg-slate-700/50">
                            Reset Pairing
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => window.open('https://docs.hashpack.app/', '_blank')} className="border-slate-600 text-gray-300 hover:bg-slate-700/50">
                            Troubleshoot
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* HashPack Auth Onboarding (Non-custodial, email-friendly) */}
              <Card className="bg-slate-800/30 border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                        Create HashPack Wallet
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Sign up with HashPack to create a non-custodial wallet using email. You keep full control of your keys.
                      </p>
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span>Non-custodial (you own the keys)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span>Email-friendly onboarding</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-3 w-3 text-yellow-400" />
                          <span>Works with HashPack app/extension</span>
                        </div>
                      </div>
                      <Button
                        onClick={startHashPackAuth}
                        disabled={loading}
                        className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        Create HashPack Wallet
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      try { hashconnectRef.current?.openPairingModal?.(); } catch {}
                    }}
                    className="border-slate-600 text-gray-300 hover:bg-slate-700/50 ml-2"
                  >
                    Reopen Pairing Modal
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
