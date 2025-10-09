"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Share2, Eye } from "lucide-react";
import { HederaLogger } from "@/lib/hedera";
import { SessionManager } from "@/lib/session";
import { getDemoRecords, grantConsent, revokeConsent, getConsents, addNotification } from "@/lib/demoStore";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function RecordsPage() {
  // Interactive demo data from local store
  const records = getDemoRecords();
  const consents = getConsents();
  const session = SessionManager.getSession();

  // UI state
  const [detailsRec, setDetailsRec] = useState<any | null>(null);
  const [shareRec, setShareRec] = useState<any | null>(null);
  const [selectedProviderDid, setSelectedProviderDid] = useState<string>("");
  const providers = [
    { name: 'Dr. Sarah Chen', did: `did:hedera:${session?.network || 'testnet'}:0.0.10001` },
    { name: 'Nairobi Imaging Center', did: `did:hedera:${session?.network || 'testnet'}:0.0.10002` },
    { name: 'Lagos General Hospital', did: `did:hedera:${session?.network || 'testnet'}:0.0.10003` },
  ];

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
      setDetailsRec(rec);
    } catch {}
  };

  const shareRecord = (rec: any) => {
    setShareRec(rec);
    setSelectedProviderDid(providers[0]?.did || "");
  };

  const revokeShare = async (rec: any) => {
    try {
      const granteeDid = 'did:hedera:' + (session?.network || 'testnet') + ':0.0.12345';
      await HederaLogger.logRegistration({
        type: 'consent_revoked',
        did: session?.did,
        walletId: session?.walletId,
        granteeDid,
        resourceId: rec.id,
        timestamp: new Date().toISOString(),
      });
      revokeConsent(rec.id, granteeDid);
      addNotification({ type: 'consent', text: `You revoked ${rec.title} from ${granteeDid}` });
    } catch {}
  };

  const confirmShare = async () => {
    if (!shareRec || !selectedProviderDid) return;
    try {
      await HederaLogger.logRegistration({
        type: 'consent_granted',
        did: session?.did,
        walletId: session?.walletId,
        granteeDid: selectedProviderDid,
        resourceId: shareRec.id,
        scope: 'read',
        expiresAt: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
        timestamp: new Date().toISOString(),
      });
      grantConsent(shareRec.id, selectedProviderDid);
      addNotification({ type: 'consent', text: `You shared ${shareRec.title} with ${selectedProviderDid}` });
      setShareRec(null);
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
                    {Array.isArray(consents[r.id]) && consents[r.id].length > 0 ? (
                      <Button onClick={() => revokeShare(r)} variant="outline" className="border-red-400 text-red-400 hover:bg-red-400/10" size="sm">
                        <Share2 className="h-4 w-4 mr-1" /> Revoke
                      </Button>
                    ) : (
                      <Button onClick={() => shareRecord(r)} variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10" size="sm">
                        <Share2 className="h-4 w-4 mr-1" /> Share
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Record Details Modal */}
      <Dialog open={!!detailsRec} onOpenChange={(o)=>!o && setDetailsRec(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Details</DialogTitle>
            <DialogDescription>Immutable proof on Hedera available via audit log.</DialogDescription>
          </DialogHeader>
          {detailsRec && (
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-400">Title:</span> <span className="text-white">{detailsRec.title}</span></div>
              <div><span className="text-gray-400">Issuer:</span> <span className="text-white">{detailsRec.issuer}</span></div>
              <div><span className="text-gray-400">Date:</span> <span className="text-white">{detailsRec.date}</span></div>
              <div className="text-xs text-gray-400">HCS audit sequence will appear in explorer.</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={()=>setDetailsRec(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={!!shareRec} onOpenChange={(o)=>!o && setShareRec(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Record</DialogTitle>
            <DialogDescription>Select a verified provider to grant access</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-gray-300">Record: <span className="text-white">{shareRec?.title}</span></div>
            <div className="space-y-2">
              {providers.map(p => (
                <label key={p.did} className="flex items-center gap-2 text-sm text-gray-200">
                  <input type="radio" name="prov" value={p.did} checked={selectedProviderDid===p.did} onChange={()=>setSelectedProviderDid(p.did)} />
                  <span className="text-white">{p.name}</span>
                  <code className="text-xs text-gray-400">{p.did}</code>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setShareRec(null)}>Cancel</Button>
            <Button onClick={confirmShare} className="bg-gradient-to-r from-purple-600 to-cyan-600">Share</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
