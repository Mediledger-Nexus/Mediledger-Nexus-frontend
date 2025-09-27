"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Video, Clock } from "lucide-react";
import { useState } from "react";
import { HederaLogger } from "@/lib/hedera";
import { SessionManager } from "@/lib/session";
import { addNotification } from "@/lib/demoStore";

export default function AppointmentsPage() {
  const upcoming = [
    { id: 'apt-1', title: 'Video Call with Dr. Adebayo', time: 'Sep 28, 3:00 PM' },
  ];
  const past = [
    { id: 'apt-0', title: 'Clinic Visit with Dr. Chen', time: 'Sep 10, 11:00 AM' },
  ];

  const session = SessionManager.getSession();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const joinCall = async (apt: any) => {
    const sessionId = `tele-${apt.id}-${Date.now()}`;
    setActiveSessionId(sessionId);
    try {
      await HederaLogger.logRegistration({
        type: 'teleconsultation',
        action: 'start',
        did: session?.did,
        walletId: session?.walletId,
        sessionId,
        doctor: 'did:hedera:' + (session?.network || 'testnet') + ':0.0.10010',
        timestamp: new Date().toISOString(),
      });
      addNotification({ type: 'appointment', text: `Joined video consultation: ${apt.title}` });
    } catch {}
  };

  const endCall = async (apt: any) => {
    const sessionId = activeSessionId;
    setActiveSessionId(null);
    try {
      await HederaLogger.logRegistration({
        type: 'teleconsultation',
        action: 'end',
        did: session?.did,
        walletId: session?.walletId,
        sessionId,
        timestamp: new Date().toISOString(),
      });
      addNotification({ type: 'appointment', text: `Ended video consultation: ${apt.title}` });
    } catch {}
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-yellow-400" /> Upcoming Appointments
          </CardTitle>
          <CardDescription className="text-gray-400">Join or manage your appointments</CardDescription>
        </CardHeader>
        <CardContent>
          {upcoming.map(u => (
            <div key={u.id} className="flex items-center justify-between p-4 rounded bg-slate-800/50 border border-slate-700/50 mb-3">
              <div>
                <div className="text-white font-medium">{u.title}</div>
                <div className="text-xs text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" /> {u.time}</div>
              </div>
              <div className="flex gap-2">
                {activeSessionId ? (
                  <Button onClick={()=>endCall(u)} variant="outline" className="border-red-400 text-red-400 hover:bg-red-400/10" size="sm"><Video className="h-4 w-4 mr-1" /> End</Button>
                ) : (
                  <Button onClick={()=>joinCall(u)} variant="outline" className="border-green-400 text-green-400 hover:bg-green-400/10" size="sm"><Video className="h-4 w-4 mr-1" /> Join</Button>
                )}
                <Button variant="outline" className="border-slate-600 text-gray-200 hover:bg-slate-700/40" size="sm">Reschedule</Button>
                <Button variant="outline" className="border-red-400 text-red-400 hover:bg-red-400/10" size="sm">Cancel</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Past Appointments</CardTitle>
          <CardDescription className="text-gray-400">Your consultation history</CardDescription>
        </CardHeader>
        <CardContent>
          {past.map(p => (
            <div key={p.id} className="flex items-center justify-between p-4 rounded bg-slate-800/50 border border-slate-700/50 mb-3">
              <div>
                <div className="text-white font-medium">{p.title}</div>
                <div className="text-xs text-gray-400">{p.time}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-slate-600 text-gray-200 hover:bg-slate-700/40" size="sm">Rate</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
