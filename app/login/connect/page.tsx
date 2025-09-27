"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { BackgroundVideo } from "@/components/background-video";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Loader2 } from "lucide-react";
import { WalletConnect } from "@/components/auth/WalletConnect";
import { createSession } from "@/lib/session";

export default function ConnectLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  const handleWalletSuccess = async (walletInfo: { accountId: string; type: 'hashpack' | 'custodial' }) => {
    try {
      setBusy(true);
      // Minimal session: requires walletId present to access dashboard
      await createSession({
        uid: `wallet-${walletInfo.accountId}`,
        phoneNumber: "",
        walletId: walletInfo.accountId,
        isRegistered: false,
        provider: walletInfo.type,
        network: (process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'mainnet').toLowerCase(),
      });
      router.replace("/dashboard");
    } catch (e: any) {
      console.error("Failed to create session after wallet connect:", e);
      setError(e?.message || "Failed to finalize login.");
      setBusy(false);
    }
  };

  const handleError = (message: string) => {
    if (!message) return; // ignore clear signals
    setError(message);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navigation />
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <BackgroundVideo
          src="/carbon-fiber-dots.gif"
          alt="Carbon fiber texture with subtle dot pattern"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black/90" />

        <div className="relative z-10 max-w-2xl mx-auto px-6 w-full">
          <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
                {busy ? <Loader2 className="h-8 w-8 text-white animate-spin" /> : <Wallet className="h-8 w-8 text-white" />}
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Sign In – Connect Wallet
              </CardTitle>
              <CardDescription className="text-gray-400">
                Connect your HashPack wallet to continue to your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 text-sm text-red-400 text-center">{error}</div>
              )}
              <div className="py-2">
                <WalletConnect onSuccess={handleWalletSuccess} onError={handleError} />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
