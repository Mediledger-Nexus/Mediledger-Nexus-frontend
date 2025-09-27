"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, Home, FileText, Bot, Hospital, Calendar, Settings, Bell, LogOut, BadgeCheck } from "lucide-react";
import { SessionManager } from "@/lib/session";

export function DashboardSidebar() {
  const pathname = usePathname();
  const session = SessionManager.getSession();

  const nav = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/dashboard/records", label: "My Records", icon: FileText },
    { href: "/dashboard/ai", label: "AI Assistant", icon: Bot },
    { href: "/dashboard/providers", label: "Doctors & Hospitals", icon: Hospital },
    { href: "/dashboard/appointments", label: "Appointments", icon: Calendar },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="h-screen w-72 bg-slate-950 border-r border-slate-800/60 flex flex-col">
      <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-cyan-400" />
          <span className="font-semibold text-white">MediLedger Nexus</span>
        </div>
        <Link href="/dashboard/notifications" className="text-gray-400 hover:text-white" title="Notifications">
          <Bell className="h-5 w-5" />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {nav.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive(item.href)
                    ? "bg-slate-800 text-white"
                    : "text-gray-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive(item.href) ? "text-cyan-400" : "text-gray-400"}`} />
                <span className="text-sm">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800/60 space-y-3">
        <div className="text-xs text-gray-400">Wallet</div>
        <div className="flex items-center gap-2 bg-slate-900 rounded px-2 py-2">
          <Wallet className="h-4 w-4 text-cyan-400" />
          <code className="text-[11px] text-cyan-300 truncate" title={session?.walletId}>{session?.walletId || "Not connected"}</code>
        </div>
        <div className="text-xs text-gray-400">DID</div>
        <div className="flex items-center gap-2 bg-slate-900 rounded px-2 py-2">
          <code className="text-[11px] text-purple-300 truncate" title={session?.did}>{session?.did || "Not generated"}</code>
        </div>
        <Link href="/" onClick={() => SessionManager.clearSession()} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mt-1">
          <LogOut className="h-4 w-4" /> Logout
        </Link>
      </div>
    </aside>
  );
}
