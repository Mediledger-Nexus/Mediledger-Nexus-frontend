"use client";

import { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { DashboardGuard } from "@/components/dashboard/Guard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardGuard>
      <div className="min-h-screen bg-black text-white flex">
        <DashboardSidebar />
        <main className="flex-1 min-h-screen relative">
          {children}
        </main>
      </div>
    </DashboardGuard>
  );
}
