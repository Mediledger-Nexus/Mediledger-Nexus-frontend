"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Send } from "lucide-react";
import { useState } from "react";
import { HederaLogger } from "@/lib/hedera";
import { SessionManager } from "@/lib/session";

export default function AiAssistantPage() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<{ role: 'user'|'ai'; text: string }[]>([
    { role: 'ai', text: 'Hi! I am your MediLedger AI. How can I help today?' }
  ]);

  const send = async () => {
    if (!message.trim()) return;
    const prompt = message.trim();
    setHistory(h => [...h, { role: 'user', text: prompt }]);
    setMessage("");
    // Log AI interaction to HCS (demo)
    try {
      const session = SessionManager.getSession();
      await HederaLogger.logRegistration({
        type: 'ai_interaction',
        did: session?.did,
        walletId: session?.walletId,
        action: 'analysis',
        promptHash: `hash:${prompt.length}:${Date.now()}`,
        timestamp: new Date().toISOString(),
      });
    } catch {}
    // Demo: echo response
    setTimeout(() => {
      setHistory(h => [...h, { role: 'ai', text: 'Thanks! For the demo, I recommend staying hydrated and booking a GP if symptoms persist.' }]);
    }, 500);
  };

  return (
    <div className="p-6">
      <Card className="bg-slate-900/50 border-slate-700/50 h-[calc(100vh-3rem)] flex flex-col">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bot className="h-5 w-5 text-[#00FF9D]" /> AI Assistant
          </CardTitle>
          <CardDescription className="text-gray-400">Symptom triage, guidance, reminders</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {history.map((m, i) => (
              <div key={i} className={`max-w-lg rounded px-3 py-2 ${m.role==='user' ? 'bg-cyan-900/30 text-cyan-100 self-end ml-auto' : 'bg-slate-800/70 text-gray-100'}`}>{m.text}</div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Input value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Describe symptoms or ask a question..." className="bg-slate-800/50 border-slate-600 text-white" />
            <Button onClick={send} className="bg-gradient-to-r from-purple-600 to-cyan-600">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
