"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "@/lib/session";

export default function HashPackAuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string>("Completing wallet setup...");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const err = params.get("error");
        if (err) {
          setError(err);
          return;
        }
        if (!code) {
          setError("Missing authorization code in callback.");
          return;
        }
        const origin = window.location.origin;
        const network = (process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'mainnet').toLowerCase();

        const resp = await fetch(`${origin}/api/hashpack/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, redirectUri: `${origin}/auth/callback`, network }),
        });

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(text || `Token exchange failed with status ${resp.status}`);
        }

        const data = await resp.json();
        // Expecting { accountId, id_token, access_token, ... }
        const accountId: string | undefined = data.accountId || data.account_id || data.account || data.walletAccountId;
        const profile = data.profile || {};

        // Create local session (front-end only)
        await createSession({
          walletId: accountId || "",
          isRegistered: false,
          provider: "hashpack",
          network,
          profile,
        });

        setStatus("Wallet connected. Redirecting...");
        router.replace("/dashboard");
      } catch (e: any) {
        console.error("HashPack Auth callback error:", e);
        setError(e?.message || "Failed to complete wallet setup.");
      }
    };
    run();
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="bg-slate-900/60 border border-slate-700/60 rounded-lg p-6 max-w-md w-full text-center">
        <h1 className="text-xl font-semibold mb-2">Connecting HashPack Wallet</h1>
        {error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : (
          <p className="text-gray-300 text-sm">{status}</p>
        )}
      </div>
    </div>
  );
}
