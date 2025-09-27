"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Wallet, User } from "lucide-react";
import { SessionManager } from "@/lib/session";

export default function SettingsPage() {
  const session = SessionManager.getSession();

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5 text-cyan-400" /> Profile Info
          </CardTitle>
          <CardDescription className="text-gray-400">Update your basic profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            <Input placeholder="Full Name" className="bg-slate-800/50 border-slate-600 text-white" />
            <Input placeholder="Gender" className="bg-slate-800/50 border-slate-600 text-white" />
            <Input placeholder="Guardian Contact" className="bg-slate-800/50 border-slate-600 text-white" />
          </div>
          <div className="mt-3">
            <Button className="bg-gradient-to-r from-purple-600 to-cyan-600">Save</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="h-5 w-5 text-purple-400" /> Wallet Info
          </CardTitle>
          <CardDescription className="text-gray-400">Your DID and wallet address</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400">Wallet</div>
              <code className="text-sm text-cyan-300 break-all">{session?.walletId || 'Not connected'}</code>
            </div>
            <div>
              <div className="text-xs text-gray-400">DID</div>
              <code className="text-sm text-purple-300 break-all">{session?.did || 'Not generated'}</code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-400" /> Security
          </CardTitle>
          <CardDescription className="text-gray-400">2FA and session history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 rounded bg-slate-800/50 border border-slate-700/50">
            <div>
              <div className="text-white font-medium">Two-Factor Authentication</div>
              <div className="text-xs text-gray-400">Enabled (Phone)</div>
            </div>
            <Button variant="outline" className="border-slate-600 text-gray-200 hover:bg-slate-700/40">Disable</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
