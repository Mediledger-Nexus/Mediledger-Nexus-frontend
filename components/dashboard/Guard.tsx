"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SessionManager } from "@/lib/session";

export function DashboardGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = SessionManager.getSession();
    if (!session || !SessionManager.isAuthenticated() || !session.walletId || !session.did) {
      router.replace("/auth");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
