"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Share2, Eye } from "lucide-react";
import { HederaLogger } from "@/lib/hedera";
import { SessionManager } from "@/lib/session";

export default function RecordsPage() {
  // Placeholder demo data
  const records = [
    { id: "rec-1", title: "Blood Test", issuer: "Lagos General Hospital", date: "2025-09-10" },
    { id: "rec-2", title: "MRI Scan", issuer: "Nairobi Imaging Center", date: "2025-09-15" },
  ];

  const session = SessionManager.getSession();

  const viewRecord = async (rec: any) => {
    try {
      await HederaLogger.logRegistration({
        type: 'record_action',
        action: 'view',
        did: session?.did,
        walletId: session?.walletId,
        recordId: rec.id,
        title: rec.title,
        timestamp: new Date().toISOString(),
      });
      alert(`Viewing ${rec.title} (demo)`);
    } catch {}
  };

  const shareRecord = async (rec: any) => {
    try {
      // Demo: share to a placeholder provider DID
      const granteeDid = 'did:hedera:' + (session?.network || 'testnet') + ':0.0.12345';
      await HederaLogger.logRegistration({
        type: 'consent_granted',
        did: session?.did,
        walletId: session?.walletId,
        granteeDid,
        resourceId: rec.id,
        scope: 'read',
        expiresAt: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
        timestamp: new Date().toISOString(),
      });
      alert(`Shared ${rec.title} with provider (demo)`);
    } catch {}
  };

  return (
    <div className="p-6">
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" /> My Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {records.map((r) => (
              <div key={r.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{r.title} 
                        <span className="ml-2 text-xs text-green-400 align-middle">✅</span>
                      </div>
                      <div className="text-xs text-gray-400">{r.issuer} • {r.date}</div>
                    </div>
                    <div className="flex gap-2">
                    <Button onClick={() => viewRecord(r)} variant="outline" className="border-slate-600 text-gray-200 hover:bg-slate-700/40" size="sm">
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    <Button onClick={() => shareRecord(r)} variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10" size="sm">
                      <Share2 className="h-4 w-4 mr-1" /> Share
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
