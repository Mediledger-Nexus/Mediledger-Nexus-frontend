"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { BackgroundVideo } from "@/components/background-video";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Clipboard, CheckCircle2 } from "lucide-react";

export default function HcsSetupPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [topicId, setTopicId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const createTopic = async () => {
    setCreating(true);
    setError("");
    setTopicId("");
    try {
      const res = await fetch("/api/hcs/create-topic", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create topic");
      setTopicId(data.topicId);
    } catch (e: any) {
      setError(e?.message || "Unexpected error creating topic");
    } finally {
      setCreating(false);
    }
  };

  const copyEnv = async () => {
    if (!topicId) return;
    const envText = `# HCS Topic for MediLedger Nexus\nHCS_TOPIC_ID=${topicId}\nNEXT_PUBLIC_ENABLE_HCS=true`;
    await navigator.clipboard.writeText(envText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
              <CardTitle className="text-2xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Hedera HCS Setup
              </CardTitle>
              <CardDescription className="text-gray-400">
                Create an HCS topic for logging DID and consent events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {error && (
                  <div className="text-sm text-red-400 text-center">{error}</div>
                )}

                {!topicId ? (
                  <Button
                    onClick={createTopic}
                    disabled={creating}
                    className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating Topic...
                      </>
                    ) : (
                      "Create Topic"
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-sm">New Topic ID</label>
                      <div className="flex gap-2 mt-1">
                        <Input readOnly value={topicId} className="bg-slate-800/50 border-slate-600 text-white" />
                        <Button variant="outline" onClick={copyEnv} className="border-slate-600 text-gray-200">
                          {copied ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2 text-green-400" /> Copied
                            </>
                          ) : (
                            <>
                              <Clipboard className="h-4 w-4 mr-2" /> Copy ENV
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-300 bg-slate-800/40 border border-slate-700/50 rounded p-3">
                      <p className="mb-2 font-medium text-white">Next steps:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Add these to your Vercel project env:</li>
                      </ol>
                      <pre className="mt-2 p-2 bg-black/40 rounded border border-slate-700/50 text-xs whitespace-pre-wrap">{`HCS_TOPIC_ID=${topicId}
NEXT_PUBLIC_ENABLE_HCS=true`}</pre>
                      <ol start={2} className="list-decimal list-inside space-y-1 mt-2">
                        <li>Ensure server envs are set: HEDERA_NETWORK, HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY</li>
                        <li>Redeploy the app</li>
                        <li>Use the app; DID/consent/actions will log to this topic</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
